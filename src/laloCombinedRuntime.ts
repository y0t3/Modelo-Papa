/** El único Top10 nuevo visible: cifra histórica + forma real de la hoja +11.
 * Nunca consulta cabezas del turno objetivo para construir el ranking.
 */
import {descargarCabezas} from './cabezas';
import type {CabezasDia,Turno} from './domain';
import {loadPreviousDraws} from './drawHistory';
import {nocturnaAnteriorPorJur} from './nocturnaAnteriorPorJur';
import {buildSheet} from './sheet';
import type {DailySheet} from './sheet';
import type {LaloHistorical} from './motorLalo';
import {buildMotorLalo,reversibleFamily} from './motorLalo';
import {preSheetAtCut} from './infoCandidatos';
import {formPositions,buildFormFirstMotor} from './motorFormasPrimero';
import type {InfoVisualDay} from './infoTurnHistory';
import {physicalAnatomy} from './labLaloAnatomiaSinPuestoVT3';
import {priorFrequencies,rankedByFrequency} from './labLaloEstadisticoVT3';
import {featuresFor,selectBayes} from './labLaloBayesGeometriaVT3';
import {FROZEN_GEOMETRY} from './laloCombinedFrozenWeights';
import {TURNOS} from './domain';

type History={date:string;heads:CabezasDia;sheet:DailySheet};
export type CombinedMemory={prior:{date:string;heads:CabezasDia}[];lastSix:InfoVisualDay[]};
const dates=new Map<string,Promise<CabezasDia>>();
function get(day:string){
 if(!dates.has(day))dates.set(day,descargarCabezas(day,true));
 return dates.get(day)!;
}
const memories=new Map<string,Promise<CombinedMemory>>();
/** Se descarga al abrir el combinado, no al usar Lalo/Auxiliar. La caché evita repetir 30 días. */
export function loadCombinedMemory(date:string):Promise<CombinedMemory>{
 if(!/^\d{4}-\d\d-\d\d$/.test(date))return Promise.reject(Error('Fecha inválida'));
 const cached=memories.get(date);
 if(cached)return cached;
 const pending=(async()=>{
  const prior=await loadPreviousDraws(date,30,day=>{
   if(day>=date)throw Error('La memoria no puede usar un resultado futuro');
   return get(day);
  },60);
  const lastSix:History[]=await Promise.all(prior.slice(-6).map(async d=>{
   const prev=await nocturnaAnteriorPorJur(d.date,day=>{
    if(day>=date)throw Error('La hoja histórica no puede usar el objetivo');
    return get(day);
   },20);
   if(prev.missing.length)throw Error('Faltan cifras históricas para '+d.date);
   return {...d,sheet:buildSheet(d.heads,prev.heads)};
  }));
  if(prior.some(x=>x.date>=date)||lastSix.some(x=>x.date>=date))
   throw Error('El resultado de hoy no entra en la memoria');
  return {prior,lastSix};
 })();
 memories.set(date,pending);
 pending.catch(()=>{if(memories.get(date)===pending)memories.delete(date)});
 return pending;
}
export type CombinedPath={source:string;cells:{row:number;col:number}[];value:string};
export type CombinedPick={family:string;rank:number;paths:CombinedPath[];seenPreviously:number};
export type CombinedResult={top:CombinedPick[];onlyStat:string[];original:string[];
 coverage:number;available:number};
export function buildCombinedTop(preSheet:DailySheet,date:string,turn:Turno,
 historical:LaloHistorical[],memory:CombinedMemory):CombinedResult{
 if(memory.prior.some(x=>x.date>=date)||memory.lastSix.some(x=>x.date>=date))
  throw Error('Se intentó mirar una jornada posterior');
 if(!historical.length)throw Error('Necesitamos hojas anteriores de Lalo');
 const idx=TURNOS.indexOf(turn);
 const pre=preSheetAtCut(preSheet,turn,idx);
 const allPaths=formPositions(pre,turn,'vt3');
 const physical=physicalAnatomy(pre,turn,allPaths);
 const original=buildMotorLalo(pre,date,turn,historical).ranks.vt3;
 const form=buildFormFirstMotor(pre,date,turn,memory.lastSix,100).top;
 const originalMap=new Map(original.map(x=>[x.family,x.rank]));
 const formMap=new Map(form.map(x=>[x.family,x.rank]));
 const frequency=priorFrequencies(memory.prior,date);
 const features=physical.map(p=>({family:p.family,members:p.members,
  features:featuresFor(p,originalMap.get(p.family)??null,formMap.get(p.family)??null),
  freq30:frequency.counts.get(p.family)||0,trainingN:frequency.n}));
 const values=selectBayes(features,FROZEN_GEOMETRY,date+'|'+turn,'HISTORIA_Y_GEOMETRIA');
 const stat=rankedByFrequency(physical,frequency).slice(0,10).map(x=>x.family);
 const top=values.map((family,i)=>{
  const paths=allPaths.filter(path=>{
   const col=pre.columns.find(x=>x.id===path.source);
   if(!col)return false;
   const value=path.cells.map(cell=>col.values[cell.row][cell.col]).join('');
   return reversibleFamily(value)===family;
  }).map(path=>({
   source:path.source,cells:path.cells,value:path.cells.map(cell=>
    pre.columns.find(x=>x.id===path.source)!.values[cell.row][cell.col]).join('')
  }));
  if(!paths.length)throw Error('Candidato sin recorrido físico');
  return {family,rank:i+1,paths,seenPreviously:frequency.counts.get(family)||0};
 });
 return {top,onlyStat:stat,original:original.slice(0,10).map(x=>x.family),
  coverage:top.reduce((n,x)=>n+(x.family.split('/')[0]===x.family.split('/')[1]?1:2),0),
  available:physical.length};
}
