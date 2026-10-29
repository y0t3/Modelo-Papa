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

import {connectedVt2} from '../src/connectedVt2LabMontevideo';
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
type Mode='LALO_VT2'|'LALO_VT3'|'CONECTADAS_VT2'|'CONECTADAS_VT3';
const MODES:Mode[]=['LALO_VT2','LALO_VT3','CONECTADAS_VT2','CONECTADAS_VT3'];
type Pick={sin:string[];con:string[]};
type Cut={date:string;turn:string;results:{jur:string;head:string;vt2:string;vt3:string}[];
 ranks:Record<Mode,Pick>;eligible:Record<Mode,{sin:number;con:number}>;
 evidence:{rootCounts:{sin:number;con:number};pairsVt2:{sin:number;con:number};
 pairsVt3:{sin:number;con:number}};
 previousDraws:string[];baseNocturna:Record<string,string>;
};
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
   const laloM=buildMotorLalo(safe,date,turn,roots,'ORIGINAL',true);
   const geo=buildConnectedVt3(safe,date,turn,days);
   const geoM=buildConnectedVt3(safe,date,turn,days,true);
   const vt2=connectedVt2(safe,date,turn,days);
   const vt2M=connectedVt2(safe,date,turn,days,true);
   const ranks:Record<Mode,Pick>={
    LALO_VT2:{sin:lalo.ranks.vt2.slice(0,10).map(f=>f.family),con:laloM.ranks.vt2.slice(0,10).map(f=>f.family)},
    LALO_VT3:{sin:lalo.ranks.vt3.slice(0,10).map(f=>f.family),con:laloM.ranks.vt3.slice(0,10).map(f=>f.family)},
    CONECTADAS_VT2:{sin:vt2.top.map(f=>f.family),con:vt2M.top.map(f=>f.family)},
    CONECTADAS_VT3:{sin:geo.top.map(f=>f.family),con:geoM.top.map(f=>f.family)}
   };
   for(const mode of MODES)for(const opt of ['sin','con'] as const){
    const list=ranks[mode][opt];
    if(list.length>10||new Set(list).size!==list.length)throw Error('Top inválido '+mode+' '+date+' '+turn+' '+opt);
   }
   const results=JURS.map(jur=>({jur,head:actual[turn]?.[jur]||''}))
    .filter(h=>valid(h.head))
    .filter(h=>!(date==='2026-10-28'&&turn==='Nocturno'&&h.jur==='Santa Fé'))
    .map(h=>({...h,vt2:reversibleFamily(h.head.slice(-2)),vt3:reversibleFamily(h.head.slice(-3))}));
   cuts.push({date,turn,results,ranks,previousDraws:previous.map(d=>d.date),
    baseNocturna:base.dates as Record<string,string>,
    eligible:{
     LALO_VT2:{sin:lalo.ranks.vt2.length,con:laloM.ranks.vt2.length},
     LALO_VT3:{sin:lalo.ranks.vt3.length,con:laloM.ranks.vt3.length},
     CONECTADAS_VT2:{sin:vt2.availableFamilies,con:vt2M.availableFamilies},
     CONECTADAS_VT3:{sin:geo.availableFamilies,con:geoM.availableFamilies}
    },evidence:{
     rootCounts:{sin:lalo.roots.length,con:laloM.roots.length},
     pairsVt2:{sin:vt2.historicalPairs,con:vt2M.historicalPairs},
     pairsVt3:{sin:geo.historicalPairs,con:geoM.historicalPairs}
    }});

  }
  completedDates++;
  console.log('EXPERIMENTAL_DIAGNOSTIC_DAY',date);
 }

 const groups=[
  {name:'JUN_JUL',from:'2026-06-01',to:'2026-07-31'},
  {name:'AGO_SEP',from:'2026-08-01',to:'2026-09-30'},
  {name:'OCT_OLD',from:'2026-10-01',to:'2026-10-24'},
  {name:'NEW_15',from:'2026-10-26',to:'2026-10-28'},
  {name:'ALL',from:'2026-06-01',to:'2026-10-28'}];
 const summaries=[] as any[];
 for(const group of groups){
  const sub=cuts.filter(c=>c.date>=group.from&&c.date<=group.to);
  for(const mode of MODES)for(const top of [3,5,10]){
   let sin=0,con=0,both=0,onlyWithout=0,onlyWith=0,neither=0,add=0,lose=0;
   let mvdSin=0,mvdCon=0,argSin=0,argCon=0,changedCuts=0,slots=0;
   for(const c of sub){
    const a=c.ranks[mode].sin.slice(0,top),b=c.ranks[mode].con.slice(0,top);
    if(a.join('|')!==b.join('|'))changedCuts++;
    add+=b.filter(f=>!a.includes(f)).length;
    lose+=a.filter(f=>!b.includes(f)).length;
    slots+=b.length;
    for(const h of c.results){
     const family=mode.endsWith('VT2')?h.vt2:h.vt3;
     const hitA=a.includes(family),hitB=b.includes(family);
     if(hitA&&hitB)both++;
     else if(hitA)onlyWithout++;
     else if(hitB)onlyWith++;
     else neither++;
     if(hitA)sin++;if(hitB)con++;
     if(h.jur==='Montevideo'){mvdSin+=Number(hitA);mvdCon+=Number(hitB);}
     else{argSin+=Number(hitA);argCon+=Number(hitB);}
    }
   }
   summaries.push({period:group.name,mode,top,cuts:sub.length,
    heads:sub.reduce((n,c)=>n+c.results.length,0),
    sin,con,delta:con-sin,both,onlyWithout,onlyWith,neither,
    changedCuts,addedFamilySlots:add,lostFamilySlots:lose,
    meanSelected:slots/Math.max(1,sub.length),
    montevideo:{sin:mvdSin,con:mvdCon},argentina:{sin:argSin,con:argCon}});
  }
 }
 const immutable={days:completedDates,cuts:cuts.length,
  heads:cuts.reduce((n,c)=>n+c.results.length,0),
  baselineLaloVt3:[3,5,10].map(n=>summaries.find(x=>x.period==='ALL'&&x.mode==='LALO_VT3'&&x.top===n)?.sin),
  baselineConnectedVt3:[3,5,10].map(n=>summaries.find(x=>x.period==='ALL'&&x.mode==='CONECTADAS_VT3'&&x.top===n)?.sin),
  top10newLaloVt2:summaries.find(x=>x.period==='NEW_15'&&x.mode==='LALO_VT2'&&x.top===10)?.sin,
  note:'PRE reconstructed, NOT sealed. One 28/10 Santa Fe head excluded pending corroboration.'};
 if(immutable.cuts!==635||immutable.baselineLaloVt3.join('/')!=='17/35/60'||
  immutable.baselineConnectedVt3.join('/')!=='25/46/81'||
  immutable.top10newLaloVt2!==17)
   throw Error('Reproduction mismatch '+JSON.stringify(immutable));
 const out='auditorias/montevideo-raices';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/resultados.json',JSON.stringify({immutable,summaries,cuts},null,2)+'\n');
 console.log('MONTEVIDEO_RAICES_RESUMEN',JSON.stringify({immutable,summaries}));
}
main().catch(e=>{console.error('MONTEVIDEO_RAICES_ERROR',e);process.exitCode=1});
