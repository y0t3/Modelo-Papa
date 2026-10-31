/**
 * PRE sellado exclusivamente desde datos ANTERIORES al 31/10/2026.
 * No consulta resultados del día objetivo ni presenta aciertos posteriores.
 * Cubre AUX Ayer, cuya hoja de 24 cifras está disponible antes de Previa.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {shiftDay} from '../src/dates';
import {fetchAuxiliaryHeads,auxiliarySourceDate}
 from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxiliaryHistorical} from '../src/motorLaloIntegral';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import {auxiliaryBoard,collectAuxFamilies} from '../src/auxSantiagoNeuquen';
import {selectAuxFormFirst} from '../src/labAuxFormasPrimeroVT3';
import {selectAuxEmbudo} from '../src/labAuxEmbudoVT3';

const target='2026-10-31';
const stamp=new Date().toISOString();
const auxSource=auxiliarySourceDate(target);
const week=shiftDay(target,-7);
const downloads=new Map<string,Promise<CabezasDia>>();
const getDraw=(date:string)=>{
 if(date>=target)throw Error('FUGA: intento de leer resultado objetivo/futuro '+date);
 if(!downloads.has(date))downloads.set(date,descargarCabezas(date,true));
 return downloads.get(date)!;
};
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
const getAux=(date:string)=>{
 if(date>=target)throw Error('FUGA: intento de leer AUX objetivo/futuro '+date);
 if(!auxCache.has(date))auxCache.set(date,fetchAuxiliaryHeads(date));
 return auxCache.get(date)!;
};
async function main(){
 const past=await loadPreviousDraws(target,6,getDraw);
 const weekly=await getDraw(week);
 const last=past.at(-1)!;
 const refs=[{date:last.date,heads:last.heads,period:'D−1' as const},
  ...(hasDrawResults(weekly)?[{date:week,heads:weekly,period:'D−7' as const}]:[])];
 const requested=new Set<string>([auxSource]);
 for(const p of past)requested.add(auxiliarySourceDate(p.date));
 for(const r of refs)requested.add(auxiliarySourceDate(r.date));
 const obs=new Map(await Promise.all([...requested].map(async d=>
  [d,(await getAux(d)).heads] as const)));
 const memory:AuxiliaryHistorical[]=past.map(p=>({
  date:p.date,period:'D−1',
  aux:extractAuxHistoryMode(p.date,obs.get(auxiliarySourceDate(p.date))!,p.heads,'anterior')
 }));
 const bases:AuxiliaryHistorical[]=refs.map(p=>({
  date:p.date,period:p.period,
  aux:extractAuxHistoryMode(p.date,obs.get(auxiliarySourceDate(p.date))!,p.heads,'anterior')
 }));
 const dayRaw=obs.get(auxSource)!;
 const draws=TURNOS.map(turn=>{
  const cut=auxAtCut(dayRaw,turn,'anterior');
  const board=auxiliaryBoard(cut,turn);
  const physical=collectAuxFamilies(board,3).map(f=>f.family);
  const ranked=buildAuxIndependent(target,turn,cut,bases)[3];
  const formFirst=selectAuxFormFirst(board,memory,target,'AUX_AYER',100).top;
  const toTop=(list:readonly {family:string}[])=>list.slice(0,10).map(x=>x.family);
  const admission=selectAuxEmbudo({
   historical:ranked,physical,forms:formFirst,category:'deep',
   quota:3,seed:target+'|'+turn+'|AUX_AYER'});
  const neutral=Array.from({length:5},(_,i)=>selectAuxEmbudo({
   historical:ranked,physical,forms:formFirst,category:'deep',
   quota:3,seed:[target,turn,'AUX_AYER','deep',3,i].join('|'),neutral:true
  }).families);
  if(ranked.some(x=>!physical.includes(x.family))||
   admission.families.some(x=>!physical.includes(x)))
   throw Error('FUGA: candidata PRE sin camino físico');
  return {turn,availableDigits:board.cells.length,
   availablePhysicalVT3:physical.length,rankedFamilies:ranked.length,
   officialTop10:toTop(ranked),formsFirstTop10:toTop(formFirst),
   experimentDeep3:admission.families,
   admissions:admission.admissions,
   dropped:admission.dropped,
   neutralDeep3:neutral,
   formFirstMetadata:formFirst.slice(0,10).map(x=>({
    family:x.family,siteRank:x.rank,rootEvents:x.rootEvents,
    rootDays:x.rootDays,exactEvents:x.exactEvents
   }))};
 });
 const payload={
  targetDate:target,sourceMode:'AUX_AYER',auxSourceDate:auxSource,
  observation:'Sin consultar ninguna cabeza ganadora del día objetivo',
  generatedUtc:stamp,
  referenceDates:refs.map(r=>({date:r.date,period:r.period})),
  memoryDates:past.map(p=>p.date),
  auxiliarySourceDates:[...requested].sort(),
  algorithms:['Top10 original D-1/D-7','Formas Primero',
   '7 oficiales + 3 familias del puesto 21 en adelante','5 controles neutrales pareados'],
  rules:'Misma hoja, VT3 contiguas reversibles, diez familias, sin Post y sin intercambio entre hojas',
  draws
 };
 const encoded=JSON.stringify(payload);
 const sha256=crypto.createHash('sha256').update(encoded).digest('hex');
 fs.mkdirSync('auditorias/aux-embudo-vt3',{recursive:true});
 fs.writeFileSync('auditorias/aux-embudo-vt3/PRESELLADO_31OCT.json',
  JSON.stringify({sha256,...payload},null,2)+'\n');
 console.log('PRELOCK_31OCT',JSON.stringify({sha256,...payload}));
}
main().catch(e=>{console.error('PRELOCK_ERROR',e);process.exitCode=1});
