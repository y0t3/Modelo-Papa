/**
 * AUDITORIA DE TRES LECTORES EXPERIMENTALES (NO PRE SELLADO).
 * Octubre, cortes PRE reconstruidos de forma estrictamente cronológica.
 * No modifica modelos ni almacenes. POST etiquetado en paso separado.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {buildVt3Shadow,allPhysicalVt3} from '../src/vt3Shadow';
import {buildVt3Trial} from '../src/vt3Trial';
import {buildConnectedVt3} from '../src/connectedVt3';
const start='2026-06-01',end='2026-10-28';
const getCache=new Map<string,Promise<CabezasDia>>();
const get=(date:string)=>{
 if(!getCache.has(date))getCache.set(date,descargarCabezas(date,true));
 return getCache.get(date)!;
};
const completeCache=new Map<string,Promise<{date:string;heads:CabezasDia;sheet:ReturnType<typeof buildSheet>}>>();
const complete=async(date:string)=>{
 if(!completeCache.has(date))completeCache.set(date,(async()=>{
  const [heads,base]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(base.missing.length)throw Error('Base anterior incompleta '+date);
  return {date,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return completeCache.get(date)!;
};
const valid=(s:string)=>/^\d{4}$/.test(s);
const counts=(a:CabezasDia)=>TURNOS.reduce((n,t)=>n+JURS.filter(j=>valid(a[t]?.[j]||'')).length,0);
type Mode='LALO'|'GEOMETRIA'|'NUEVA_PRUEBA'|'CONECTADAS';
const MODES:Mode[]=['LALO','GEOMETRIA','NUEVA_PRUEBA','CONECTADAS'];
type Cut={date:string;turn:string;numHeads:number;futureHeadsHidden:boolean;
 physicalCandidates:number;physicalHeads:number;
 ranks:Record<Mode,string[]>;eligible:Record<Mode,number>;selectedSources:{
 connectedHistoricalPairs:number;connectedHistoricalDays:number;geometricPhysicalRoutes:number
 };results:{jur:string;head:string;family:string}[]};
const cuts:Cut[]=[];
let completedDates=0;
async function main(){
 for(let date=start;date<=end;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  const [actual,previous,base]=await Promise.all([
   get(date),loadPreviousDraws(date,6,get),nocturnaAnteriorPorJur(date,get,20)
  ]);
  if(counts(actual)<20)continue;
  if(base.missing.length)throw Error('Nocturna anterior no completa '+date);
  const completed=await Promise.all(previous.map(d=>complete(d.date)));
  const previousMap=new Map(completed.map(x=>[x.date,x]));
  const latest=previous[5],w=shiftDay(date,-7);
  const [d1,wk,d7base]=await Promise.all([
   complete(latest.date),get(w),nocturnaAnteriorPorJur(w,get,20)
  ]);
  if(d7base.missing.length)throw Error('Raiz D7 '+date);
  const roots:LaloHistorical[]=[
   {date:latest.date,period:'D−1',sheet:d1.sheet},
   ...(w<date&&hasDrawResults(wk)?[{
    date:w,period:'D−7' as const,sheet:buildSheet(wk,d7base.heads)
   }]:[])
  ];
  const days=completed.map(d=>({date:d.date,sheet:d.sheet}));
  const weekly=previousMap.get(w);
  if(!weekly&&hasDrawResults(wk))days.push({
   date:w,sheet:buildSheet(wk,d7base.heads)
  });
  if([...days.map(x=>x.date),...roots.map(x=>x.date)].some(d=>d>=date))
   throw Error('FUGA en historico '+date);
  for(const [idx,turn] of TURNOS.entries()){
   const before=diaVacio();
   for(const t of TURNOS.slice(0,idx))before[t]={...actual[t]};
   const board=buildSheet(before,base.heads);
   const safe=preSheetAtCut(board,turn,idx);
   if(safe.heads[turn].length||safe.matches[turn].length||
    TURNOS.slice(idx).some(t=>safe.heads[t].length||safe.matches[t].length))
    throw Error('FUGA de sorteo objetivo '+date+' '+turn);
   if(safe.columns.slice(idx+1).some(col=>col.values.some(x=>/^\d{2}$/.test(x))))
    throw Error('FUGA de columnas posteriores '+date+' '+turn);
   const lalo=buildMotorLalo(safe,date,turn,roots);
   const geo=buildVt3Shadow(safe,date,turn,roots,lalo);
   const newTest=buildVt3Trial(lalo,geo);
   const connected=buildConnectedVt3(safe,date,turn,days);
   const selections:Record<Mode,string[]>={
    LALO:lalo.ranks.vt3.slice(0,10).map(x=>x.family),
    GEOMETRIA:geo.top.slice(0,10).map(x=>x.family),
    NUEVA_PRUEBA:newTest.top.slice(0,10).map(x=>x.family),
    CONECTADAS:connected.top.slice(0,10).map(x=>x.family)
   };
   for(const [kind,list] of Object.entries(selections)){
    if(list.length>10||new Set(list).size!==list.length)
     throw Error('Top repetido/saturado '+date+' '+turn+' '+kind);
   }
   // Los resultados reales no se usan en ninguna selección precedente.
   const results=JURS.map(jur=>({jur,head:actual[turn]?.[jur]||''}))
    .filter(x=>valid(x.head))
    .map(x=>({...x,family:reversibleFamily(x.head.slice(-3))}));
   const physical=new Set(safe.columns.slice(0,idx+1).flatMap(col=>
    allPhysicalVt3(col.values).map(p=>reversibleFamily(p.map(x=>x.digit).join('')))));
   cuts.push({date,turn,numHeads:results.length,futureHeadsHidden:true,
    physicalCandidates:physical.size,
    physicalHeads:results.filter(h=>physical.has(h.family)).length,
    ranks:selections,eligible:{
     LALO:lalo.ranks.vt3.length,
     GEOMETRIA:geo.availableFamilies,
     NUEVA_PRUEBA:newTest.top.length,
     CONECTADAS:connected.availableFamilies
    },selectedSources:{
     connectedHistoricalPairs:connected.historicalPairs,
     connectedHistoricalDays:connected.historicalDays,
     geometricPhysicalRoutes:geo.routes
    },results});
  }
  completedDates++;
  console.log('EXPERIMENTAL_DIAGNOSTIC_DAY',date);
 }
 const aggregate:any={};
 for(const m of MODES){
  const vals=[3,5,10];
  aggregate[m]={
   top:Object.fromEntries(vals.map(k=>['top'+k,cuts.reduce((acc,c)=>
    acc+c.results.filter(h=>c.ranks[m].slice(0,k).includes(h.family)).length,0)])),
   cutsWithCandidates:cuts.filter(c=>c.ranks[m].length>0).length,
   cutsWithThree:cuts.filter(c=>c.ranks[m].length>=3).length,
   cutsWithTen:cuts.filter(c=>c.ranks[m].length>=10).length,
   meanCandidates:cuts.reduce((n,c)=>n+c.ranks[m].length,0)/Math.max(1,cuts.length),
   uniqueToReaderTop3Heads:cuts.reduce((n,c)=>n+c.results.filter(h=>
    c.ranks[m].slice(0,3).includes(h.family)&&
    !c.ranks.LALO.slice(0,3).includes(h.family)).length,0),
   sharedWithLaloTop3:cCutsTopOverlap(m)
  };
 }
 function cCutsTopOverlap(m:Mode){
  return cuts.reduce((n,c)=>n+c.ranks[m].slice(0,3)
   .filter(f=>c.ranks.LALO.slice(0,3).includes(f)).length,0);
 }
 const timeBlocks=['2026-06-01','2026-08-01','2026-10-01','2026-10-26'];
 const periods=timeBlocks.map((from,i)=>({
  from,until:i<timeBlocks.length-1?shiftDay(timeBlocks[i+1],-1):end,
  results:Object.fromEntries(MODES.map(m=>[m,Object.fromEntries([3,5,10].map(k=>[
   'top'+k,cuts.filter(c=>c.date>=from&&c.date<=(i<timeBlocks.length-1?shiftDay(timeBlocks[i+1],-1):end))
    .reduce((acc,c)=>acc+c.results.filter(h=>c.ranks[m].slice(0,k).includes(h.family)).length,0)
  ]))]))
 }));
 const baselineHeads=cuts.reduce((n,c)=>n+c.numHeads,0);

 // Hold-out accounting: the 620 earlier cuts must reproduce the exact
 // frozen MV1 baseline from the existing historical laboratory.
 const original=cuts.filter(c=>c.date<='2026-10-24');
 const oldHeads=original.reduce((n,c)=>n+c.numHeads,0);
 const originalLalo=[3,5,10].map(k=>original.reduce((n,c)=>n+
  c.results.filter(h=>c.ranks.LALO.slice(0,k).includes(h.family)).length,0));
 if(original.length!==620||oldHeads!==3321||originalLalo.join('|')!=='17|35|59')
  throw Error('Baseline histórico distinto '+JSON.stringify({
   originalCuts:original.length,oldHeads,originalLalo
  }));
 const rescue=Object.fromEntries(MODES.filter(m=>m!=='LALO').map(m=>[m,
  Object.fromEntries(['HIST_620','NEW_15','ALL'].map(period=>{
   const ss=cuts.filter(c=>period==='ALL'||period==='HIST_620'?
    period==='ALL'||c.date<='2026-10-24':c.date>='2026-10-26');
   return [period,Object.fromEntries([3,5,10].map(k=>['top'+k,
    ss.reduce((n,c)=>n+c.results.filter(h=>c.ranks[m].slice(0,k).includes(h.family)&&
      !c.ranks.LALO.slice(0,10).includes(h.family)).length,0)
   ]))];
  }))
 ]));

 const PR=['JUN_JUL','AGO_SEP','OCT_OLD','NEW_15','TOTAL'];
 const matchPeriod=(c:Cut,k:string)=>k==='TOTAL'||k==='JUN_JUL'?
  k==='TOTAL'||c.date<='2026-07-31':k==='AGO_SEP'?
  c.date>='2026-08-01'&&c.date<='2026-09-30':k==='OCT_OLD'?
  c.date>='2026-10-01'&&c.date<='2026-10-24':
  c.date>='2026-10-26';
 const signTest=(a:number,b:number)=>{
  const n=a+b;if(n===0)return 1;
  let p=Math.pow(0.5,n),sum=p;
  for(let i=1;i<=Math.min(a,b);i++){p=p*(n-i+1)/i;sum+=p;}
  return Math.min(1,2*sum);
 };
 const paired:any[]=[];
 let seed=20261028;
 const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
 for(const period of PR){
  const subset=cuts.filter(c=>matchPeriod(c,period));
  for(const m of MODES.filter(x=>x!=='LALO')){
   for(const k of [3,5,10]){
    let both=0,onlyOriginal=0,onlyExperimental=0,neither=0;
    const byDay=new Map<string,number>();
    for(const c of subset){
     let diff=0;
     for(const h of c.results){
      const original=c.ranks.LALO.slice(0,k).includes(h.family);
      const experimental=c.ranks[m].slice(0,k).includes(h.family);
      if(original&&experimental)both++;
      else if(original){onlyOriginal++;diff--;}
      else if(experimental){onlyExperimental++;diff++;}
      else neither++;
     }
     byDay.set(c.date,(byDay.get(c.date)||0)+diff);
    }
    const dayDiff=[...byDay.values()],boots:number[]=[];
    for(let iter=0;iter<4000;iter++){
     let score=0;
     for(let d=0;d<dayDiff.length;d++)
      score+=dayDiff[Math.floor(rand()*dayDiff.length)]||0;
     boots.push(score);
    }
    boots.sort((a,b)=>a-b);
    paired.push({period,engine:m,top:k,cuts:subset.length,
     heads:subset.reduce((n,c)=>n+c.numHeads,0),
     both,onlyOriginal,onlyExperimental,neither,
     netGain:onlyExperimental-onlyOriginal,
     exactTwoSidedDiscordanceP:signTest(onlyOriginal,onlyExperimental),
     bootstrapByDay95:[boots[Math.floor(.025*boots.length)]||0,
      boots[Math.floor(.975*boots.length)]||0]});
   }
  }
 }
 const physicalNull={byPeriod:PR.map(period=>{
  const sub=cuts.filter(c=>matchPeriod(c,period));
  return {period,cuts:sub.length,
   physicalHeadHits:sub.reduce((n,c)=>n+c.physicalHeads,0),
   meanPhysicalFamilies:sub.reduce((n,c)=>n+c.physicalCandidates,0)/
     Math.max(1,sub.length),
   randomExpectedTop:Object.fromEntries([3,5,10].map(k=>[
    'top'+k,sub.reduce((n,c)=>n+(c.physicalCandidates?
     c.physicalHeads*Math.min(k,c.physicalCandidates)/c.physicalCandidates:0),0)
   ]))
  };
 })};
 const data={type:'RETROSPECTIVE_PRE_RECONSTRUCTION_NOT_SEALED',
  start,end,days:completedDates,cuts:cuts.length,heads:baselineHeads,
  aggregate,periods,rescue,paired,physicalNull,postResultsNeverUsedToRank:true,
  snapshotAvailabilityNotKnown:true,
  notes:[
   'All readers compared with same PRE cut and heads, but no genuine device snapshot is claimed.',
   'Local AsyncStorage PRE records are not available from GitHub and cannot be counted here.',
   'No addition or change of official MV1 ranking or stored PRE.',
   'ZERO wins need to be distinguished from zero candidates in connected configurations.'
  ]};
 const out='auditorias/rastros-26a28oct/extenso';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/replay-resumen.json',JSON.stringify(data,null,2)+'\n');
 fs.writeFileSync(out+'/replay-cortes.json',JSON.stringify(cuts,null,2)+'\n');
 console.log('RASTROS_EXTENSO_COMPARACION',JSON.stringify(data));
 console.log('REPLAY_EXPERIMENTALES_CORTE',JSON.stringify(cuts.map(c=>({
  date:c.date,turn:c.turn,numHeads:c.numHeads,
  connected:c.ranks.CONECTADAS.length,
  conectPairs:c.selectedSources.connectedHistoricalPairs
 })).filter(x=>x.connected===0).slice(0,14)));
}
main().catch(e=>{console.error('EXPERIMENTALES_ERROR',e);process.exitCode=1});
