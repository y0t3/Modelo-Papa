/**
 * Auditoría estrictamente PRE: corregir la Nocturna base de las HOJAS
 * históricas D−1 y D−7, manteniendo idéntica la hoja actual.
 *
 * Contrasta 4 modos: raíces antiguas, corregir D1, corregir D7, corregir ambas.
 * Mismas familias, mismo ranking y mismo cupo; el objetivo NO se usa para elegir.
 * Solo la última Nocturna REAL de cada jurisdicción alimenta la fila histórica.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {shiftDay,previousDrawDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {findPaths} from '../src/paths';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';

type Mode='OLD_ROOTS'|'REAL_D1'|'REAL_D7'|'REAL_BOTH';
const MODES:Mode[]=['OLD_ROOTS','REAL_D1','REAL_D7','REAL_BOTH'];
const cache=new Map<string,Promise<CabezasDia>>();
const get=(date:string):Promise<CabezasDia>=>{
 if(!cache.has(date))cache.set(date,descargarCabezas(date,true));
 return cache.get(date)!;
};
const count=(d:CabezasDia)=>TURNOS.reduce((n,t)=>
 n+JURS.filter(j=>/^\d{4}$/.test(d[t]?.[j]||'')).length,0);
const isReal=(v:string)=>/^\d{4}$/.test(v);
const period=(d:string)=>d<='2026-07-31'?'JUN_JUL':
 d<='2026-09-30'?'AGO_SEP':'OCT';
type Case={date:string;turn:string;jur:string;head:string;family:string;
 exactPhysical:boolean;rank:Record<Mode,number|null>};
const cases:Case[]=[];
const dayChecks:any[]=[];
const cutChecks:any[]=[];
let rootsAlteredD1=0,rootsAlteredD7=0;
function compareOldNew(a:CabezasDia,b:CabezasDia){
 return JURS.filter(j=>a.Nocturno[j]!==b.Nocturno[j]);
}
async function main(){
 for(let date='2026-06-01';date<='2026-10-24';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const today=await get(date);
  if(count(today)<20)continue;
  const week=shiftDay(date,-7);
  const [previous,weekly,weekPrevious,baseReal]=await Promise.all([
   loadPreviousDraws(date,4,get),get(week),
   loadPreviousDraws(week,1,get),
   nocturnaAnteriorPorJur(date,get,20)
  ]);
  if(baseReal.missing.length)throw Error('Base actual incompleta '+date);
  if(baseReal.checked.some(x=>x>=date))throw Error('Fuga en base actual');
  const last=previous[3],penult=previous[2];
  if(!(last.date<date&&penult.date<last.date))throw Error('D1 fuera de orden '+date);
  const realD1=await nocturnaAnteriorPorJur(last.date,get,20);
  if(realD1.missing.length)throw Error('D1 incompleto '+date);
  const oldD1=buildSheet(last.heads,penult.heads);
  const fixedD1=buildSheet(last.heads,realD1.heads);
  let oldD7=null as ReturnType<typeof buildSheet>|null,
      fixedD7=null as ReturnType<typeof buildSheet>|null;
  let d7Changed:string[]=[];
  if(week<date&&hasDrawResults(weekly)){
   const realD7=await nocturnaAnteriorPorJur(week,get,20);
   if(realD7.missing.length)throw Error('D7 incompleto '+date);
   oldD7=buildSheet(weekly,weekPrevious[0].heads);
   fixedD7=buildSheet(weekly,realD7.heads);
   d7Changed=compareOldNew(weekPrevious[0].heads,realD7.heads);
  }
  const d1Changed=compareOldNew(penult.heads,realD1.heads);
  if(d1Changed.length)rootsAlteredD1++;
  if(d7Changed.length)rootsAlteredD7++;
  dayChecks.push({date,d1:last.date,d7:oldD7?week:null,
   d1Changed,d7Changed,sourceCurrent:baseReal.dates});
  const roots=(mode:Mode):LaloHistorical[]=>[
   {date:last.date,period:'D−1',sheet:
    (mode==='REAL_D1'||mode==='REAL_BOTH')?fixedD1:oldD1},
   ...(oldD7&&fixedD7?[{date:week,period:'D−7' as const,
     sheet:(mode==='REAL_D7'||mode==='REAL_BOTH')?fixedD7:oldD7}]:[])
  ];
  for(const [idx,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const t of TURNOS.slice(0,idx))pre[t]={...today[t]};
   const sheet=buildSheet(pre,baseReal.heads);
   if(sheet.heads[turn]?.length||sheet.matches[turn]?.length)
    throw Error('POST contaminó PRE '+date+' '+turn);
   const columns=sheet.columns.slice(0,idx+1);
   const candidateLists:Record<Mode,ReturnType<typeof buildMotorLalo>>=
    Object.fromEntries(MODES.map(mode=>[
     mode,buildMotorLalo(sheet,date,turn,roots(mode))
    ])) as Record<Mode,ReturnType<typeof buildMotorLalo>>;
   const ranks=Object.fromEntries(MODES.map(m=>[m,
    new Map(candidateLists[m].ranks.vt3.map(f=>[f.family,f.rank]))
   ])) as Record<Mode,Map<string,number>>;
   const headList=JURS.map(jur=>({jur,head:today[turn]?.[jur]||''}))
    .filter(x=>isReal(x.head));
   cutChecks.push({date,turn,heads:headList.length,
    families:Object.fromEntries(MODES.map(m=>[m,candidateLists[m].ranks.vt3.length])),
    d1Changed:d1Changed.length>0,d7Changed:d7Changed.length>0});
   for(const {jur,head} of headList){
    const suffix=head.slice(-3),family=reversibleFamily(suffix);
    const exactPhysical=columns.some(col=>findPaths(col.values,suffix).length>0);
    const rank=(Object.fromEntries(MODES.map(m=>[m,ranks[m].get(family)??null]))) as Record<Mode,number|null>;
    cases.push({date,turn,jur,head,family,exactPhysical,rank});
   }
  }
  console.log('RAICES_DIA',date,d1Changed.length,d7Changed.length);
 }
 const results:any[]=[];
 const delta:any[]=[];
 for(const p of ['JUN_JUL','AGO_SEP','OCT','TOTAL']){
  const all=cases.filter(x=>p==='TOTAL'||period(x.date)===p);
  for(const mode of MODES){
   const picked=(n:number)=>all.filter(x=>x.rank[mode]!==null&&
    x.rank[mode]!<=n).length;
   const base=all.filter(x=>x.exactPhysical&&x.rank.OLD_ROOTS===null);
   results.push({period:p,mode,heads:all.length,
    physicallyPossible:all.filter(x=>x.exactPhysical).length,
    physicallyUnrecognized:all.filter(x=>x.exactPhysical&&x.rank[mode]===null).length,
    recognized:all.filter(x=>x.rank[mode]!==null).length,
    top3:picked(3),top5:picked(5),top10:picked(10),
    rescueFromUnrecognized:base.filter(x=>x.rank[mode]!==null).length});
  }
 }
 for(const mode of MODES.slice(1)){
  const gained=cases.filter(x=>(x.rank.OLD_ROOTS??Infinity)>10&&
   (x.rank[mode]??Infinity)<=10);
  const lost=cases.filter(x=>(x.rank.OLD_ROOTS??Infinity)<=10&&
   (x.rank[mode]??Infinity)>10);
  const rescued=cases.filter(x=>x.exactPhysical&&
   x.rank.OLD_ROOTS===null&&x.rank[mode]!==null);
  delta.push({mode,gained:gained.length,lost:lost.length,
   net:gained.length-lost.length,rescued:rescued.length,
   examplesGained:gained.slice(0,25),examplesLost:lost.slice(0,25),
   examplesRescued:rescued.slice(0,25)});
 }
 const baseline=results.find(x=>x.period==='TOTAL'&&x.mode==='OLD_ROOTS');
 if(!baseline||baseline.heads!==cases.length||
  baseline.top3>baseline.top5||baseline.top5>baseline.top10)
  throw Error('Invariante de auditoría roto');
 if(results.some(x=>x.top3>x.top5||x.top5>x.top10))
  throw Error('Ranking de Tops imposible');
 const report={days:dayChecks.length,cuts:cutChecks.length,cases:cases.length,
  rootsAlteredD1,rootsAlteredD7,summary:results,differences:delta,
  changedDays:dayChecks.filter(x=>x.d1Changed.length||x.d7Changed.length)};
 const out='auditorias/lalo-raices-historicas-25oct/resultados';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/resumen.json',JSON.stringify(report,null,2));
 fs.writeFileSync(out+'/cabezas-y-puestos.json',JSON.stringify(cases,null,2));
 fs.writeFileSync(out+'/cortes.json',JSON.stringify(cutChecks,null,2));
 fs.writeFileSync(out+'/fechas-raices.json',JSON.stringify(dayChecks,null,2));
 console.log('RAICES_RESUMEN',JSON.stringify(report));
}
void main().catch(e=>{console.error('RAICES_ERROR',e);process.exitCode=1});
