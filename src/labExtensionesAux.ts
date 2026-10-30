/**
 * Exploración PRE de TODAS las hijas VT3 de madres VT2 en los Tops.
 *
 * No es un nuevo motor. No mezcla casillas de tableros diferentes.
 * Una madre 13/31 tiene 20 hijas posibles: 013..913 y 031..931.
 * Auxiliar Ayer/Hoy se rastrean por separado con rutas adyacentes
 * válidas, incluso las hijas que NO entraron en su Top10.
 *
 * La presencia en ambas hojas significa "dos recorridos físicos
 * distintos permiten leer la MISMA VT3"; NO significa dos pruebas
 * estadísticas independientes.
 */
import {reversibleFamily} from './motorLalo';
import {TURNOS} from './domain';
import {auxCanonicalPath,enumerateAuxPaths} from './auxSantiagoNeuquen';
import type {AuxiliaryBoard,AuxPath} from './auxSantiagoNeuquen';
import type {Board,Figure} from './labRadarFiguras';
import type {Witness} from './labTresHojasTestigos';

export type Mother={family:string;engines:string[];ranks:Record<string,number>};
export type ExtensionStatus='AMBAS'|'SOLO_AYER'|'SOLO_HOY'|'NINGUNA';
export type ExtensionOption={
 mother:string;value:string;status:ExtensionStatus;
 ayer:number;hoy:number;rankVT3Ayer:number|null;rankVT3Hoy:number|null;
 winnerEventsAyer:number;winnerEventsHoy:number;
 exampleAyer:{row:number;col:number;source:string;digit:string}[]|null;
 exampleHoy:{row:number;col:number;source:string;digit:string}[]|null;
};
export type MotherSnapshot={
 family:string;engines:string[];ranks:Record<string,number>;
 options:ExtensionOption[];counts:Record<ExtensionStatus,number>;
};
export type ExtensionSnapshot={date:string;turn:string;
 mothers:MotherSnapshot[];optionsTotal:number;optionsBoth:number;
 auxBoardCells:{ayer:number;hoy:number}};
const reverse=(s:string)=>[...s].reverse().join('');
const isDigits=(s:string)=>/^\d{2}$/.test(s);
export function allowedVT3(mother:string):string[]{
 const members=[...new Set(mother.split('/'))].filter(isDigits);
 if(!members.length||members.some(x=>reversibleFamily(x)!==mother))
  throw Error('Familia VT2 inválida');
 return [...new Set(members.flatMap(two=>
  [...'0123456789'].map(prefix=>prefix+two)))].sort();
}
function byReading(board:AuxiliaryBoard){
 const map=new Map<string,AuxPath[]>();
 // Deduplicar la misma ruta orientada, sin borrar las orientaciones
 // inversas: 813 y 318 son lecturas distintas en el estudio PRE.
 const unique=new Set<string>();
 for(const path of enumerateAuxPaths(board,3)){
  const value=path.map(p=>p.digit).join('');
  const id=value+'|'+path.map(p=>p.row+':'+p.col).join('>');
  if(unique.has(id))continue;unique.add(id);
  const paths=map.get(value)||[];
  paths.push(path);map.set(value,paths);
 }
 return map;
}
const rankForReading=(value:string,figures:Figure[],board:Board)=>{
 const family=reversibleFamily(value);
 const choices=figures.filter(f=>f.board===board&&f.kind==='VT3'&&
  f.families.includes(family));
 const ranks=choices.flatMap(f=>Object.values(f.bestRanks));
 return ranks.length?Math.min(...ranks):null;
};
const witnessIndex=(roots:Witness[])=>{
 const map=new Map<string,Set<string>>();
 for(const w of roots)if(w.kind==='VT3'&&w.board!=='PLUS11'&&
  w.source==='Santiago-Neuquen'){
  const key=w.board+'|'+w.site;
  const events=map.get(key)||new Set<string>();
  events.add(w.event);map.set(key,events);
 }
 return map;
};
const eventCount=(paths:AuxPath[],board:Board,index:Map<string,Set<string>>)=>{
 const events=new Set<string>();
 for(const p of paths)
  for(const id of index.get(board+'|'+auxCanonicalPath(p))||[])events.add(id);
 return events.size;
};
export function buildExtensionSnapshot(date:string,turn:string,
 mothers:Mother[],yesterday:AuxiliaryBoard,today:AuxiliaryBoard,
 selected:Figure[]=[],roots:Witness[]=[]):ExtensionSnapshot{
 const index=TURNOS.indexOf(turn as typeof TURNOS[number]);
 if(index<0)throw Error('Turno objetivo inválido');
 if(roots.some(r=>r.date>date||
  (r.date===date&&TURNOS.indexOf(r.turn as typeof TURNOS[number])>=index)))
  throw Error('FUGA: testigo de turno objetivo o posterior');
 const rootIndex=witnessIndex(roots);
 const ayer=byReading(yesterday),hoy=byReading(today);
 const groups=[...new Map(mothers.map(m=>[m.family,m])).values()]
  .sort((a,b)=>a.family.localeCompare(b.family)).map(mother=>{
   const options=allowedVT3(mother.family).map(value=>{
    const p=ayer.get(value)||[],q=hoy.get(value)||[];
    const status:ExtensionStatus=p.length&&q.length?'AMBAS':
     p.length?'SOLO_AYER':q.length?'SOLO_HOY':'NINGUNA';
    return {mother:mother.family,value,status,ayer:p.length,hoy:q.length,
     rankVT3Ayer:rankForReading(value,selected,'AUX_AYER'),
     rankVT3Hoy:rankForReading(value,selected,'AUX_HOY'),
     winnerEventsAyer:eventCount(p,'AUX_AYER',rootIndex),
     winnerEventsHoy:eventCount(q,'AUX_HOY',rootIndex),
     exampleAyer:p[0]?.map(c=>({...c}))||null,
     exampleHoy:q[0]?.map(c=>({...c}))||null
    } as ExtensionOption;
   });
   const counts={AMBAS:0,SOLO_AYER:0,SOLO_HOY:0,NINGUNA:0};
   for(const o of options)counts[o.status]++;
   return {family:mother.family,engines:mother.engines,
    ranks:mother.ranks,options,counts};
  });
 return {date,turn,mothers:groups,
  optionsTotal:groups.reduce((n,g)=>n+g.options.length,0),
  optionsBoth:groups.reduce((n,g)=>n+g.counts.AMBAS,0),
  auxBoardCells:{ayer:yesterday.cells.length,hoy:today.cells.length}};
}
export function mothersFromTop(figures:Figure[],enginesOnly?:string[]):Mother[]{
 const map=new Map<string,Mother>();
 for(const fig of figures)if(fig.kind==='VT2'&&fig.board==='PLUS11'){
  const available=fig.engines.filter(x=>!enginesOnly||enginesOnly.includes(x));
  if(!available.length)continue;
  for(const family of fig.families){
   const old=map.get(family)||{family,engines:[],ranks:{}};
   for(const engine of available){
    if(!old.engines.includes(engine))old.engines.push(engine);
    old.ranks[engine]=Math.min(old.ranks[engine]??Infinity,
     fig.bestRanks[engine]??Infinity);
   }
   map.set(family,old);
  }
 }
 return [...map.values()];
}
export type GroupCounts={candidates:Record<ExtensionStatus,number>;
 winnerReadings:Record<ExtensionStatus,number>;
 conditionalExpected:Record<ExtensionStatus,number>;
 mothers:number;motherHeads:number;observedHeads:number;
 mothersWithBoth:number;
 distinctActualHeadsByCategory:Record<ExtensionStatus,number>};
export function evaluateSnapshotPOST(snapshot:ExtensionSnapshot,
 heads:{jur:string;head:string}[]):GroupCounts{
 const counts:Record<ExtensionStatus,number>=
  {AMBAS:0,SOLO_AYER:0,SOLO_HOY:0,NINGUNA:0};
 const wins={...counts},expected={...counts},byHead={...counts};
 let motherHeads=0;
 for(const group of snapshot.mothers){
  const options=new Map(group.options.map(o=>[o.value,o]));
  for(const option of group.options)counts[option.status]++;
  for(const h of heads){
   if(!/^\d{4,5}$/.test(h.head))continue;
   const value=h.head.slice(-3),option=options.get(value);
   if(!option)continue;
   motherHeads++;wins[option.status]++;
   byHead[option.status]++;
   for(const status of Object.keys(counts) as ExtensionStatus[])
    expected[status]+=group.counts[status]/group.options.length;
  }
 }
 return {candidates:counts,winnerReadings:wins,
  conditionalExpected:expected,mothers:snapshot.mothers.length,
  motherHeads,observedHeads:heads.filter(h=>/^\d{4,5}$/.test(h.head)).length,
  mothersWithBoth:snapshot.mothers.filter(g=>g.counts.AMBAS>0).length,
  distinctActualHeadsByCategory:byHead};
}
export function equalBudgetComparison(snapshot:ExtensionSnapshot,
 heads:{jur:string;head:string}[]){
 // Predefinido: si hay ambas y una sola AUX, comparar 1 opción
 // por grupo con apoyo en ambas contra 1 control sólo AUX.
 // Criterio de desempate PRE: mayor número de eventos históricos
 // distintos en la misma casilla; luego menor número total de rutas;
 // finalmente valor lexicográfico para que NO entre el resultado.
 const chosen:Record<string,{both:ExtensionOption;single:ExtensionOption}>= {};
 const order=(a:ExtensionOption,b:ExtensionOption)=>
  b.winnerEventsAyer+b.winnerEventsHoy-
    a.winnerEventsAyer-a.winnerEventsHoy||
  (a.ayer+a.hoy)-(b.ayer+b.hoy)||
  a.value.localeCompare(b.value);
 for(const group of snapshot.mothers){
  const both=group.options.filter(o=>o.status==='AMBAS').sort(order)[0];
  const single=group.options.filter(o=>
   o.status==='SOLO_AYER'||o.status==='SOLO_HOY').sort(order)[0];
  if(both&&single)chosen[group.family]={both,single};
 }
 const suffixes=new Set(heads.filter(h=>/^\d{4,5}$/.test(h.head))
  .map(h=>h.head.slice(-3)));
 const rows=Object.entries(chosen).map(([mother,x])=>({
  mother,both:x.both.value,single:x.single.value,
  bothHit:suffixes.has(x.both.value),
  singleHit:suffixes.has(x.single.value),
  bothWitnesses:x.both.winnerEventsAyer+x.both.winnerEventsHoy,
  singleWitnesses:x.single.winnerEventsAyer+x.single.winnerEventsHoy
 }));
 return {pairs:rows.length,
  bothHits:rows.filter(x=>x.bothHit).length,
  singleHits:rows.filter(x=>x.singleHit).length,
  bothOnly:rows.filter(x=>x.bothHit&&!x.singleHit).length,
  singleOnly:rows.filter(x=>x.singleHit&&!x.bothHit).length,
  rows};
}
