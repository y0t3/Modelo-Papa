/** LAB LALO VT3. PRE por corte, no cambia motor +11 oficial. */
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
import {buildFormFirstMotor,formPositions} from '../src/motorFormasPrimero';
import type {InfoVisualDay} from '../src/infoTurnHistory';
import {selectLalo7mas3} from '../src/labLalo7mas3VT3';
import type {LaloPool,LaloQuota} from '../src/labLalo7mas3VT3';

const from=process.env.LALO7_FROM||'2026-06-01';
const to=process.env.LALO7_TO||'2026-08-31';
const label=process.env.LALO7_LABEL||'historico';
const skipOctober=process.env.LALO7_SKIP_OCT_EARLY==='1';
const cache=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{
 if(!cache.has(d))cache.set(d,descargarCabezas(d,true));
 return cache.get(d)!;
};
type Completed={date:string;heads:CabezasDia;sheet:ReturnType<typeof buildSheet>};
const completed=new Map<string,Promise<Completed>>();
const full=async(date:string):Promise<Completed>=>{
 if(!completed.has(date))completed.set(date,(async()=>{
  const [heads,previous]=await Promise.all([
   get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(previous.missing.length)throw Error('Falta base nocturna '+date);
  return {date,heads,sheet:buildSheet(heads,previous.heads)};
 })());
 return completed.get(date)!;
};
type Winner={jur:string;head:string;family:string;physical:boolean;
 originalRank:number|null;formRank:number|null;source:string};
type Select={hits:number;slots:number;gained:number;lost:number;
 admissions:number;neutral:number[];neutralGains:number[]};
type Cut={date:string;turn:string;stage:'temprana'|'completa';
 heads:number;formable:number;physicalFamilies:number;
 officialHits:number;officialSlots:number;formsHits:number;formsSlots:number;
 nextHits:number;ranked:number;formSupported:number;
 pools:{top10:number;next:number;deep:number;unranked:number;unformable:number};
 poolFamilies:{top10:number;next:number;deep:number;unranked:number};
 variants:Record<string,Select>;
 winners:Winner[];
 changes:Record<string,{in:string[];out:string[];rankIn:(number|null)[]}>;
};
const kinds=['deep','unranked','outside20'] as const;
const quotas=[1,3] as const;
const key=(k:LaloPool,n:LaloQuota)=>k+'_'+n;
const sum=(arr:Cut[],fn:(x:Cut)=>number)=>arr.reduce((n,x)=>n+fn(x),0);
function summarize(rows:Cut[]){
 const variants=Object.keys(rows[0]?.variants||{});
 return {cuts:rows.length,days:new Set(rows.map(x=>x.date)).size,
  heads:sum(rows,x=>x.heads),formable:sum(rows,x=>x.formable),
  original:sum(rows,x=>x.officialHits),forms:sum(rows,x=>x.formsHits),
  next:sum(rows,x=>x.nextHits),
  poolHeads:Object.fromEntries(['top10','next','deep','unranked','unformable']
   .map(k=>[k,sum(rows,x=>(x.pools as Record<string,number>)[k]||0)])),
  exposure:Object.fromEntries(['top10','next','deep','unranked']
   .map(k=>[k,sum(rows,x=>(x.poolFamilies as Record<string,number>)[k]||0)])),
  variants:Object.fromEntries(variants.map(v=>{
   const t=Array.from({length:5},(_,i)=>sum(rows,x=>x.variants[v].neutral[i]));
   return [v,{hits:sum(rows,x=>x.variants[v].hits),
    slots:sum(rows,x=>x.variants[v].slots),
    admitted:sum(rows,x=>x.variants[v].admissions),
    rescued:sum(rows,x=>x.variants[v].gained),
    lost:sum(rows,x=>x.variants[v].lost),
    neutral:t,neutralMean:t.reduce((a,b)=>a+b,0)/5}];
  }))
 };
}
const rows:Cut[]=[],skipped:{date:string;error:string}[]=[];
async function main(){
 for(let date=from;date<=to;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  if(skipOctober&&date>='2026-10-01'&&date<'2026-10-12')continue;
  try{
   const [today,previous]=await Promise.all([get(date),loadPreviousDraws(date,6,get)]);
   const todayHeads=TURNOS.reduce((n,t)=>n+JURS.filter(j=>j!=='Montevideo')
    .filter(j=>/^\d{4}$/.test(today[t]?.[j]||'')).length,0);
   if(todayHeads<25)throw Error('Jornada incompleta '+todayHeads);
   const historyDays=await Promise.all(previous.map(p=>full(p.date)));
   const recent=[...historyDays].reverse();
   const week=shiftDay(date,-7);
   const weekSource=recent.find(d=>d.date===week)||await full(week);
   const d1=recent[0];
   const historical:LaloHistorical[]=[
    {date:d1.date,period:'D−1',sheet:d1.sheet},
    ...(week<date&&hasDrawResults(weekSource.heads)?[{
     date:week,period:'D−7' as const,sheet:weekSource.sheet
    }]:[])
   ];
   const days:InfoVisualDay[]=recent.map(d=>({
    date:d.date,sheet:d.sheet,heads:d.heads
   }));
   if(days.some(d=>d.date>=date)||historical.some(d=>d.date>=date))
    throw Error('FUGA de fecha al PRE');
   const prevNoct=await nocturnaAnteriorPorJur(date,get,20);
   if(prevNoct.missing.length)throw Error('Faltan bases nocturnas '+date);
   const dayCuts:Cut[]=[];
   for(const [idx,turn] of TURNOS.entries()){
    const masked=diaVacio();
    for(const past of TURNOS.slice(0,idx))masked[past]={...today[past]};
    const sheet=buildSheet(masked,prevNoct.heads);
    const pre=preSheetAtCut(sheet,turn,idx);
    if(TURNOS.slice(idx).some(t=>pre.heads[t]?.length||pre.matches[t]?.length))
     throw Error('FUGA POST '+date+' '+turn);
    const lalo=buildMotorLalo(pre,date,turn,historical).ranks.vt3;
    const formView=buildFormFirstMotor(pre,date,turn,days,100);
    const forms=formView.top;
    const position=formPositions(pre,turn);
    const phys=new Set(position.map(p=>{
     const source=pre.columns.find(c=>c.id===p.source)!;
     return reversibleFamily(p.cells.map(c=>source.values[c.row][c.col]).join(''));
    }));
    if(lalo.some(x=>!phys.has(x.family))||forms.some(x=>!phys.has(x.family)))
     throw Error('FUGA familia sin recorrido PRE');
    const rank=new Map(lalo.map(x=>[x.family,x.rank]));
    const formRank=new Map(forms.map(x=>[x.family,x.rank]));
    const old=new Set(lalo.slice(0,10).map(x=>x.family));
    const next=new Set(lalo.slice(10,20).map(x=>x.family));
    const formTop=new Set(forms.slice(0,10).map(x=>x.family));
    const winners=JURS.filter(j=>j!=='Montevideo')
     .map(jur=>({jur,head:today[turn][jur]}))
     .filter(({head})=>/^\d{4}$/.test(head))
     .map(({jur,head})=>{
      const family=reversibleFamily(head.slice(-3));
      const physical=phys.has(family),r=rank.get(family)??null;
      const source=!physical?'unformable':r===null?'unranked':
       r<=10?'top10':r<=20?'next':'deep';
      return {jur,head,family,physical,originalRank:r,
       formRank:formRank.get(family)??null,source};
     });
    const physicalFamilies={top10:0,next:0,deep:0,unranked:0};
    for(const family of phys){
     const r=rank.get(family);
     const group=r===undefined?'unranked':r<=10?'top10':r<=20?'next':'deep';
     physicalFamilies[group]++;
    }
    const poolHeads={top10:0,next:0,deep:0,unranked:0,unformable:0};
    for(const w of winners)poolHeads[w.source as keyof typeof poolHeads]++;
    const baseHits=winners.filter(x=>old.has(x.family)).length;
    const variants:Record<string,Select>={},changes:Cut['changes']={};
    for(const kind of kinds)for(const quota of quotas){
     const k=key(kind,quota);
     const experiment=selectLalo7mas3({
      ranks:lalo,forms,poolKind:kind,quota,seed:date+'|'+turn
     });
     const controls=Array.from({length:5},(_,i)=>selectLalo7mas3({
      ranks:lalo,forms,poolKind:kind,quota,
      seed:[date,turn,kind,quota,i].join('|'),neutral:true
     }));
     if(controls.some(x=>x.top.length!==experiment.top.length||
      x.admissions.length!==experiment.admissions.length))
      throw Error('FUGA: control con cupo diferente');
     const selected=new Set(experiment.top);
     const chosen=new Set(experiment.admissions.map(x=>x.family));
     const dropped=new Set(experiment.dropped);
     const gained=winners.filter(x=>chosen.has(x.family)).length;
     const lost=winners.filter(x=>dropped.has(x.family)).length;
     const hits=winners.filter(x=>selected.has(x.family)).length;
     if(hits!==baseHits+gained-lost)
      throw Error('FUGA: resumen no iguala aciertos PRE');
     variants[k]={hits,slots:experiment.top.length,gained,lost,
      admissions:experiment.admissions.length,
      neutral:controls.map(v=>winners.filter(w=>v.top.includes(w.family)).length),
      neutralGains:controls.map(v=>winners.filter(w=>
       v.admissions.some(a=>a.family===w.family)).length)};
     changes[k]={in:experiment.admissions.map(x=>x.family),
      out:experiment.dropped,rankIn:experiment.admissions.map(x=>x.rankOriginal)};
    }
    dayCuts.push({date,turn,stage:idx<3?'temprana':'completa',
     heads:winners.length,formable:winners.filter(w=>w.physical).length,
     physicalFamilies:phys.size,officialHits:baseHits,officialSlots:old.size,
     formsHits:winners.filter(w=>formTop.has(w.family)).length,
     formsSlots:formTop.size,nextHits:winners.filter(w=>next.has(w.family)).length,
     ranked:lalo.length,formSupported:forms.length,pools:poolHeads,
     poolFamilies:physicalFamilies,variants,winners,changes});
   }
   rows.push(...dayCuts);
   console.log('LALO7_DAY',date,JSON.stringify(dayCuts.map(c=>({
    turn:c.turn,heads:c.heads,formable:c.formable,
    baseline:c.officialHits,forms:c.formsHits,
    gains:Object.fromEntries(Object.entries(c.variants).map(([name,x])=>
     [name,{hits:x.hits,rescued:x.gained,lost:x.lost}]))
   }))));
  }catch(e){
   if(String(e).includes('FUGA'))throw e;
   skipped.push({date,error:String(e).slice(0,200)});
   console.log('LALO7_SKIP',date,String(e).slice(0,180));
  }
 }
 const stages=['temprana','completa'] as const;
 const summary=Object.fromEntries(stages.map(stage=>{
  const part=rows.filter(c=>c.stage===stage);
  return [stage,{overall:summarize(part),
   byMonth:Object.fromEntries([...new Set(part.map(c=>c.date.slice(0,7)))].sort()
    .map(m=>[m,summarize(part.filter(c=>c.date.startsWith(m)))])),
   byTurn:Object.fromEntries(TURNOS.filter(t=>part.some(c=>c.turn===t))
    .map(t=>[t,summarize(part.filter(c=>c.turn===t))]))
  }];
 }));
 const res={label,from,to,days:new Set(rows.map(x=>x.date)).size,
  cuts:rows.length,skipped,
  method:'LALO +11 PRE con columnas disponibles y geometria en la misma columna; 7+3 o 9+1 de familia fuera Top20 elegida por Formas Primero 6 dias; 5 controles por mismo pool/numero; POST solo despues',
  summary,
  rows};
 fs.mkdirSync('auditorias/lalo-vt3-7mas3',{recursive:true});
 fs.writeFileSync('auditorias/lalo-vt3-7mas3/'+label+'.json',
  JSON.stringify(res,null,2)+'\n');
 console.log('LALO7_SUMMARY',JSON.stringify({
  label,days:res.days,cuts:res.cuts,skipped,
  summary,octoberCases:rows.filter(x=>x.date>='2026-10-27').map(x=>({
   date:x.date,turn:x.turn,winners:x.winners.filter(w=>w.physical),
   original:x.officialHits,forms:x.formsHits,
   variants:Object.fromEntries(Object.entries(x.variants).map(([k,v])=>[k,v.hits])),
   changes:x.changes
  }))
 }));
 if(rows.length<Number(process.env.LALO7_MIN_CUTS||100))
  throw Error('Cobertura insuficiente '+rows.length);
}
main().catch(e=>{console.error('LALO7_ERROR',e);process.exitCode=1});
