/**
 * Experimento sombra PRE de Lalo VT3, 31 octubre 2026, turno Previa.
 * La fecha objetivo se bloquea explícitamente en todos los lectores.
 * Pesos congelados en julio, escritos previamente en el repositorio.
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
import {buildFormFirstMotor,formPositions} from '../src/motorFormasPrimero';
import type {InfoVisualDay} from '../src/infoTurnHistory';
import {physicalAnatomy} from '../src/labLaloAnatomiaSinPuestoVT3';
import {priorFrequencies,rankedByFrequency,neutralMatched,expectedUniform}
 from '../src/labLaloEstadisticoVT3';
import {featuresFor,selectBayes} from '../src/labLaloBayesGeometriaVT3';
import type {GeometricEvidence} from '../src/labLaloBayesGeometriaVT3';
const target='2026-10-31';
const weightsFile='auditorias/lalo-bayes-geometria/PESOS_CONGELADOS_JULIO.json';
const fetched=new Map<string,Promise<CabezasDia>>();
function get(d:string){
 if(d>=target)throw Error('FUGA: no se puede leer resultados del día objetivo: '+d);
 if(!fetched.has(d))fetched.set(d,descargarCabezas(d,true));
 return fetched.get(d)!;
}
async function completed(d:string){
 const [heads,base]=await Promise.all([get(d),nocturnaAnteriorPorJur(d,get,20)]);
 if(base.missing.length)throw Error('Nocturna de la fecha histórica incompleta '+d);
 return {date:d,heads,sheet:buildSheet(heads,base.heads)};
}
async function main(){
 const calibrated=JSON.parse(fs.readFileSync(weightsFile,'utf8')) as {
  model:string;frozenThrough:string;trainingDays:number;evidence:GeometricEvidence
 };
 if(calibrated.frozenThrough!=='2026-07-31'||calibrated.trainingDays!==51)
  throw Error('FUGA: los pesos no son los congelados en julio');
 const previous=await loadPreviousDraws(target,30,get,60);
 if(previous.some(x=>x.date>=target))throw Error('FUGA: fecha de memoria');
 const d1=previous.at(-1)!,weekDate=shiftDay(target,-7);
 const week=previous.find(d=>d.date===weekDate);
 const history:LaloHistorical[]=[
  {date:d1.date,period:'D−1',sheet:(await completed(d1.date)).sheet},
  ...(week&&hasDrawResults(week.heads)?[{
   date:weekDate,period:'D−7' as const,sheet:(await completed(weekDate)).sheet
  }]:[])
 ];
 const recent=(await Promise.all(previous.slice(-6).map(d=>completed(d.date)))).reverse();
 const info:InfoVisualDay[]=recent.map(x=>({date:x.date,sheet:x.sheet,heads:x.heads}));
 const previousBase=await nocturnaAnteriorPorJur(target,get,20);
 if(previousBase.missing.length)throw Error('Nocturna previa incompleta');
 const pre=preSheetAtCut(buildSheet(diaVacio(),previousBase.heads),'Previa',0);
 if(pre.matches.Previa.length||pre.heads.Previa.length)throw Error('FUGA de resultado de Previa');
 const physics=physicalAnatomy(pre,'Previa',formPositions(pre,'Previa'));
 const currentOriginal=buildMotorLalo(pre,target,'Previa',history).ranks.vt3;
 const formFirst=buildFormFirstMotor(pre,target,'Previa',info,100).top;
 const mRoot=new Map(currentOriginal.map(x=>[x.family,x.rank]));
 const mForm=new Map(formFirst.map(x=>[x.family,x.rank]));
 const frequency=priorFrequencies(previous,target);
 const scoreCandidates=physics.map(p=>({
  family:p.family,members:p.members,
  features:featuresFor(p,mRoot.get(p.family)??null,mForm.get(p.family)??null),
  freq30:frequency.counts.get(p.family)||0,trainingN:frequency.n
 }));
 const original=currentOriginal.slice(0,10).map(x=>x.family);
 const top30=rankedByFrequency(physics,frequency).slice(0,10).map(x=>x.family);
 const geo=selectBayes(scoreCandidates,calibrated.evidence,
  target+'|Previa','GEOMETRIA_CALIBRADA');
 const hybrid=selectBayes(scoreCandidates,calibrated.evidence,
  target+'|Previa','HISTORIA_Y_GEOMETRIA');
 const tops={LALO_ORIGINAL:original,FRECUENCIA_30:top30,
  GEO_CALIBRADA:geo,HIBRIDO:hybrid};
 const valid=new Set(physics.map(p=>p.family));
 if(Object.values(tops).some(v=>v.some(f=>!valid.has(f))))
  throw Error('FUGA: familia sin camino real');
 const matched=Object.fromEntries(Object.entries(tops).map(([method,top])=>[
  method,Array.from({length:20},(_,i)=>
   neutralMatched(physics,top,[target,'Previa',method,i].join('|')))
 ]));
 const payload={
  date:target,turn:'Previa',createdUtc:new Date().toISOString(),
  label:'PRE_SOMBRA_LALO_VT3_BAYES_GEOMETRIA_V1',
  rule:'Solo datos anteriores al 31/10; pesos congelados al 31/07; 10 familias; no cruza columnas',
  model:calibrated.model,weightFile:weightsFile,
  lastPriorDate:d1.date,previousDrawDates:previous.map(p=>p.date),
  memorySixDates:recent.map(d=>d.date),roots:history.map(x=>({date:x.date,period:x.period})),
  baseDates:previousBase.dates,pool:physics.length,trainingHeads:frequency.n,
  selections:tops,
  uniformExpected5Heads:Object.fromEntries(Object.entries(tops)
   .map(([method,top])=>[method,expectedUniform(top,5)])),
  twentyMatchedControls:matched
 };
 const sha256=crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
 fs.mkdirSync('auditorias/lalo-bayes-geometria',{recursive:true});
 fs.writeFileSync('auditorias/lalo-bayes-geometria/PRE_PREVIA_31OCT.json',
  JSON.stringify({sha256,...payload},null,2)+'\n');
 console.log('BAYES_PRE_31OCT',JSON.stringify({sha256,...payload}));
}
main().catch(e=>{console.error('BAYES_PRE_ERROR',e);process.exitCode=1});
