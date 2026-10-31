/**
 * PRESELLADO REAL LALO VT3 PREVIA DEL SABADO 31/10/2026.
 * IMPOSIBLE consultar la fecha objetivo en los dos lectores.
 * Archivo permanente sin cabezas POST ni comparación después del sorteo.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {descargarCabezas} from '../src/cabezas';
import {diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {formPositions} from '../src/motorFormasPrimero';
import {physicalAnatomy} from '../src/labLaloAnatomiaSinPuestoVT3';
import {priorFrequencies,rankedByFrequency,neutralMatched,expectedUniform}
 from '../src/labLaloEstadisticoVT3';
const target='2026-10-31';
const fetched=new Map<string,Promise<CabezasDia>>();
function get(date:string){
 if(date>=target)throw Error('FUGA: bloqueado acceso a resultado actual o futuro '+date);
 if(!fetched.has(date))fetched.set(date,descargarCabezas(date,true));
 return fetched.get(date)!;
}
const full=async(date:string)=>{
 const [draw,base]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
 if(base.missing.length)throw Error('Historial PRE incompleto '+date);
 return {date,heads:draw,sheet:buildSheet(draw,base.heads)};
};
async function main(){
 const previous=await loadPreviousDraws(target,30,get,60);
 const last=previous.at(-1)!;
 const weekDate=shiftDay(target,-7);
 const week=previous.find(p=>p.date===weekDate);
 const roots:LaloHistorical[]=[{date:last.date,period:'D−1',sheet:(await full(last.date)).sheet},
  ...(week&&hasDrawResults(week.heads)?[{date:weekDate,period:'D−7' as const,
   sheet:(await full(weekDate)).sheet}]:[])];
 const base=await nocturnaAnteriorPorJur(target,get,20);
 if(base.missing.length)throw Error('Nocturna base PRE incompleta: '+base.missing.join(','));
 const pre=preSheetAtCut(buildSheet(diaVacio(),base.heads),'Previa',0);
 if(pre.heads.Previa.length||pre.matches.Previa.length)throw Error('FUGA POST');
 const physical=physicalAnatomy(pre,'Previa',formPositions(pre,'Previa'));
 const ranked=buildMotorLalo(pre,target,'Previa',roots).ranks.vt3;
 const stats6=priorFrequencies(previous.slice(-6),target);
 const stats30=priorFrequencies(previous,target);
 const picks={
  LALO_ORIGINAL:ranked.slice(0,10).map(f=>f.family),
  ESTAD_6:rankedByFrequency(physical,stats6).slice(0,10).map(f=>f.family),
  ESTAD_30:rankedByFrequency(physical,stats30).slice(0,10).map(f=>f.family)
 };
 const controls=Object.fromEntries(Object.entries(picks).map(([method,top])=>
  [method,Array.from({length:20},(_,i)=>
   neutralMatched(physical,top,[target,'Previa',method,i].join('|')))]));
 const trainingDates=previous.map(p=>p.date);
 const payload={date:target,turn:'Previa',board:'LALO_PLUS11',
  registeredUtc:new Date().toISOString(),status:'EXPERIMENTO_SOMBRA_NO_APUESTA',
  constraint:'SOLO DÍAS ANTERIORES; ninguna lectura del resultado 31/10',
  boardSourceDates:base.dates,previousDrawDates:trainingDates,
  rootDates:roots.map(r=>({date:r.date,period:r.period})),
  observations: {window6:stats6.n,window30:stats30.n,
   physicallyFormableFamilies:physical.length},
  picks,expectedUnderUniform:Object.fromEntries(Object.entries(picks).map(([method,top])=>
   [method,expectedUniform(top,5)])),
  randomMatchedControls:controls};
 const bytes=JSON.stringify(payload);
 const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
 fs.mkdirSync('auditorias/lalo-vt3-estadistico',{recursive:true});
 fs.writeFileSync('auditorias/lalo-vt3-estadistico/PRE_PREVIA_31OCT.json',
  JSON.stringify({sha256,...payload},null,2)+'\n');
 console.log('LALO_PRE_ESTAD_31OCT',JSON.stringify({sha256,...payload}));
}
main().catch(e=>{console.error('PRE_ESTAD_ERROR',e);process.exitCode=1});
