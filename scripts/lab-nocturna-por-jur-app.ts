/**
 * Auditoría del comportamiento REAL de App.tsx: loadPreviousDraws
 * acepta jornadas con cualquier Nocturna, incluso solo Montevideo.
 * Compara únicamente una corrección de las 6 filas de la columna
 * "Nocturna anterior" por última fecha válida en cada jurisdicción.
 * D−1 / D−7 permanecen exactamente como producción.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {previousDrawDay,shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {findPaths} from '../src/paths';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical,LaloKind} from '../src/motorLalo';

const cache=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{
 if(!cache.has(d))cache.set(d,descargarCabezas(d,true));
 return cache.get(d)!;
};
const present=(d:CabezasDia)=>TURNOS.reduce((n,t)=>n+
 JURS.filter(j=>/^\d{4}$/.test(d[t]?.[j]||'')).length,0);
const methods=['PRODUCCION','NOCTURNA_POR_JUR'] as const;
type Method=typeof methods[number];
const instances:any[]=[],cases:any[]=[],changed:any[]=[],datesAudit:any[]=[];
async function main(){
 for(let date='2026-06-01';date<='2026-10-24';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const today=await get(date);
  if(present(today)<20)continue;
  const week=shiftDay(date,-7),weekPrior=previousDrawDay(week);
  // Igual que en App.tsx cargar(): D−1=el último de cuatro días
  // con cualquier Nocturna registrada, no necesariamente una jornada
  // completa para todas las jurisdicciones.
  const [previous,weekly,weekPrevious,nocturna]=await Promise.all([
   loadPreviousDraws(date,4,get),
   get(week),
   loadPreviousDraws(week,1,get),
   nocturnaAnteriorPorJur(date,get,20)
  ]);
  const last=previous[3],beforeLast=previous[2];
  const roots:LaloHistorical[]=[
   {date:last.date,period:'D−1',sheet:buildSheet(last.heads,beforeLast.heads)}
  ];
  if(week<date&&hasDrawResults(weekly)){
   roots.push({date:week,period:'D−7',sheet:buildSheet(weekly,weekPrevious[0].heads)});
  }
  const row:any={date,previousD1:last.date,
   baseRealDates:nocturna.dates,missing:nocturna.missing,
   useDifferentBase:JURS.filter(j=>
    nocturna.heads.Nocturno[j]!==last.heads.Nocturno[j]),
   sourceHeads:present(today)};
  if(nocturna.missing.length)throw Error('Faltan jurisdicciones: '+date+' '+nocturna.missing);
  if(nocturna.checked.some(x=>x>=date))throw Error('Fuga temporal: '+date);
  for(const [idx,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const t of TURNOS.slice(0,idx))pre[t]={...today[t]};
   const base=buildSheet(pre,last.heads);
   const fixed=buildSheet(pre,nocturna.heads);
   const views={PRODUCCION:buildMotorLalo(base,date,turn,roots),
    NOCTURNA_POR_JUR:buildMotorLalo(fixed,date,turn,roots)};
   const baseColumns=base.columns.slice(0,idx+1),
    fixedColumns=fixed.columns.slice(0,idx+1);
   if(base.columns.slice(1).some((c,i)=>c.values.join()!==fixed.columns[i+1].values.join()))
    throw Error('Cambió una fuente del mismo día: '+date+' '+turn);
   const headList=JURS.map(j=>({jur:j,head:today[turn]?.[j]||''}))
    .filter(x=>/^\d{4}$/.test(x.head));
   for(const {jur,head} of headList){
    const suffix=head.slice(-3),family=reversibleFamily(suffix);
    const exactOriginal=baseColumns.some(c=>findPaths(c.values,suffix).length>0);
    const exactNew=fixedColumns.some(c=>findPaths(c.values,suffix).length>0);
    const ranks=Object.fromEntries(methods.map(m=>[m,
     views[m].ranks.vt3.find(f=>f.family===family)?.rank||null]));
    const entry={date,turn,jur,head,suffix,family,
     exactOriginal,exactNew,ranks};
    cases.push(entry);
    if((exactOriginal!==exactNew)||ranks.PRODUCCION!==ranks.NOCTURNA_POR_JUR)
     changed.push(entry);
   }
   for(const m of methods)instances.push({date,turn,method:m,
    countHeads:headList.length,
    countVt3:views[m].ranks.vt3.length,
    countVt2:views[m].ranks.vt2.length,
    countVt4:views[m].ranks.vt4.length,
    earlySources:views[m].ranks.vt3.slice(0,3)
     .map(f=>f.family)});
  }
  datesAudit.push(row);
  if(row.useDifferentBase.length)console.log('JUR_BASE_CAMBIO',JSON.stringify(row));
  console.log('JUR_DIA',date);
 }
 const buckets:any[]=[];
 for(const p of ['JUN_JUL','AGO_SEP','OCT','TOTAL']){
  const period=(x:any)=>p==='TOTAL'||(p==='JUN_JUL'?x.date<='2026-07-31':
   p==='AGO_SEP'?x.date>='2026-08-01'&&x.date<='2026-09-30':
   x.date>='2026-10-01');
  const group=cases.filter(period);
  for(const method of methods){
   const ranked=(n:number)=>group.filter(x=>x.ranks[method]!==null&&x.ranks[method]<=n);
   buckets.push({period:p,method,heads:group.length,
    formable:group.filter(x=>method==='PRODUCCION'?x.exactOriginal:x.exactNew).length,
    top3:ranked(3).length,top5:ranked(5).length,
    top10:ranked(10).length,allRecognized:group.filter(x=>x.ranks[method]!==null).length});
  }
 }
 const report={summary:buckets,dates:datesAudit.length,
  cuts:instances.length/2,heads:cases.length,
  daysWithDifferentBase:datesAudit.filter(x=>x.useDifferentBase.length),
  differences:changed};
 const output='auditorias/lalo-nocturna-por-jur-validacion-25oct/resultados';
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(output+'/informe.json',JSON.stringify(report,null,2));
 fs.writeFileSync(output+'/cabezas.json',JSON.stringify(cases,null,2));
 fs.writeFileSync(output+'/cortes-pre.json',JSON.stringify(instances,null,2));
 fs.writeFileSync(output+'/fuentes-por-jur.json',JSON.stringify(datesAudit,null,2));
 console.log('JUR_RESUMEN',JSON.stringify({summary:buckets,
  dates:report.dates,cuts:report.cuts,heads:report.heads,
  daysWithDifferentBase:report.daysWithDifferentBase,
  diffCount:changed.length}));
 console.log('JUR_CABEZAS_CAMBIADAS',JSON.stringify(changed));
}
void main().catch(e=>{console.error('JUR_ERROR',e);process.exitCode=1});
