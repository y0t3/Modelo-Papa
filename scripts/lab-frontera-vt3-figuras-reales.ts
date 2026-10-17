// Reproducción exacta del dibujo, no de sus cifras: control VT3 sin raíces oficiales.
// Sólo figuras que explicaron cabezas reales pueden dar una señal histórica.
// TODAS las familias y negativos deben formarse físicamente en la MISMA columna +11.
// Las cabezas objetivo jamás se usan para construir características ni rankings.
import type {DailySheet,SourceId} from '../src/sheet';
import type {Turno} from '../src/domain';
import {TURNOS} from '../src/domain';
import {reversibleFamily} from '../src/motorLalo';

export type PhysicalPath={source:SourceId;cells:string[];value:string};
export type PhysicalFamily={family:string;paths:PhysicalPath[];sources:SourceId[]};
export type MarkedShape={date:string;turn:Turno;jur:string;head:string;
 source:SourceId;cells:string[];shape:string};
const p=(c:string)=>c.split(':').map(Number);
const steps=(cells:string[])=>{
 const a=cells.map(p);
 return a.slice(1).map((x,i)=>(x[0]-a[i][0])+','+(x[1]-a[i][1])).join(';');
};
export const physicalShape=(cells:string[])=>
 [steps(cells),steps([...cells].reverse())].sort()[0];
const poskey=(cells:string[])=>
 [cells.join('>'),[...cells].reverse().join('>')].sort()[0];
// La forma geométrica debe haber sido un recorrido ganador comprobado,
// asociado con cabeza completa, turno, jurisdicción, fecha y fuente.
export function verifiedShapes(sheet:DailySheet,date:string):MarkedShape[]{
 const results:MarkedShape[]=[],seen=new Set<string>();
 for(const turn of TURNOS)for(const match of sheet.matches[turn]||[]){
  if(match.jurisdiccion==='Montevideo')continue;
  if(!/^\d{4}$/.test(match.cabeza))continue;
  for(const hit of match.hits){
   if(hit.kind!=='vt3'||!match.cabeza.endsWith(hit.value))continue;
   for(const route of hit.paths){
    const cells=route.map(c=>c.row+':'+c.col);
    const digits=route.map(c=>c.digit).join('');
    if(digits!==hit.value)throw Error('La figura histórica no formó la cabeza');
    const key=[date,turn,match.jurisdiccion,match.cabeza,hit.sourceId,poskey(cells)].join('|');
    if(seen.has(key))continue;seen.add(key);
    results.push({date,turn,jur:match.jurisdiccion,head:match.cabeza,
     source:hit.sourceId,cells,shape:physicalShape(cells)});
   }
  }
 }
 return results;
}
export type NonAdmittedRow={
 family:string;hit:number;source:SourceId;sourceCount:number;routes:number;
 onlyLatestSource:boolean;historySameSource:boolean;historyOtherSource:boolean;
 historyExactPosition:boolean;historyExactSameSource:boolean;
 historyNearSameSource:boolean;
 historyAnySource:boolean;earlierTodayShape:boolean;historicalEventCount:number;
 prevWinningFigures:{date:string;turn:Turno;head:string;source:SourceId;
  cells:string[];shape:string}[];currentPaths:PhysicalPath[];
};
export const featureNames=['onlyLatestSource','historySameSource','historyOtherSource',
 'historyExactPosition','historyExactSameSource','historyNearSameSource',
 'historyAnySource','earlierTodayShape'] as const;
export type Feature=typeof featureNames[number];
export function analyzeNonAdmitted(args:{
 physical:Map<string,PhysicalFamily>;admitted:Set<string>;
 winnerFamilies:string[];historical:MarkedShape[];earlierToday:MarkedShape[];
 newestSource:SourceId;
}):NonAdmittedRow[]{
 const rows:NonAdmittedRow[]=[];
 const {physical,admitted,winnerFamilies,historical,earlierToday,newestSource}=args;
 const occurrences=new Map<string,number>();
 for(const family of winnerFamilies)occurrences.set(family,(occurrences.get(family)||0)+1);
 for(const f of physical.values()){
  if(admitted.has(f.family))continue;
  const witnesses=historical.filter(old=>f.paths.some(path=>
    old.shape===physicalShape(path.cells)));
  const intra=earlierToday.some(old=>f.paths.some(path=>
    old.shape===physicalShape(path.cells)));
  const same=witnesses.some(old=>f.paths.some(path=>old.source===path.source&&
    old.shape===physicalShape(path.cells)));
  const other=witnesses.some(old=>f.paths.some(path=>old.source!==path.source&&
    old.shape===physicalShape(path.cells)));
  const matched=(old:MarkedShape,path:PhysicalPath)=>
   old.shape===physicalShape(path.cells);
  const samePlace=(old:MarkedShape,path:PhysicalPath)=>
   matched(old,path)&&poskey(old.cells)===poskey(path.cells);
  const nearPlace=(old:MarkedShape,path:PhysicalPath)=>{
   if(!matched(old,path))return false;
   const ca=old.cells.map(p),cb=path.cells.map(p);
   return Math.min(...ca.map(q=>q[1]))===Math.min(...cb.map(q=>q[1]))&&
    Math.abs(Math.min(...ca.map(q=>q[0]))-Math.min(...cb.map(q=>q[0])))<=1;
  };
  const exact=witnesses.some(old=>f.paths.some(path=>samePlace(old,path)));
  const exactOwn=witnesses.some(old=>f.paths.some(path=>
   old.source===path.source&&samePlace(old,path)));
  const nearOwn=witnesses.some(old=>f.paths.some(path=>
   old.source===path.source&&nearPlace(old,path)));
  const events=new Set(witnesses.map(w=>[w.date,w.turn,w.jur,w.head].join('|')));
  const noDuplicateWitnesses=new Map<string,MarkedShape>();
  for(const w of witnesses)noDuplicateWitnesses.set([w.date,w.turn,w.jur,w.head,
   w.source,w.shape].join('|'),w);
  rows.push({
   family:f.family,hit:occurrences.get(f.family)||0,
   source:f.sources[0],sourceCount:f.sources.length,routes:f.paths.length,
   onlyLatestSource:f.sources.length===1&&f.sources[0]===newestSource,
   historySameSource:same,historyOtherSource:other,
   historyExactPosition:exact,historyExactSameSource:exactOwn,
   historyNearSameSource:nearOwn,
   historyAnySource:same||other,earlierTodayShape:intra,
   historicalEventCount:events.size,
   prevWinningFigures:[...noDuplicateWitnesses.values()].slice(0,12).map(w=>({
    date:w.date,turn:w.turn,head:w.head,source:w.source,cells:w.cells,shape:w.shape
   })),currentPaths:f.paths
  });
 }
 return rows;
}
const band=(n:number)=>n<=1?'1':n===2?'2':n<=5?'3-5':
 n<=12?'6-12':'13+';
export type Control={exposures:number;positive:number;winnerHeads:number;
 positiveHeads:number;neutralExpected:number;strata:number;
 matchedPositive:number;matchedNegative:number;matchedHeads:number;
 matchedPositiveHeads:number;matchedExpected:number};
export function compareFeatures(rows:NonAdmittedRow[]):Record<Feature,Control>{
 const result={} as Record<Feature,Control>;
 for(const key of featureNames){
  const groups=new Map<string,NonAdmittedRow[]>();
  const control:Control={exposures:rows.length,
   positive:rows.filter(r=>r[key]).length,
   winnerHeads:rows.reduce((n,r)=>n+r.hit,0),
   positiveHeads:rows.filter(r=>r[key]).reduce((n,r)=>n+r.hit,0),
   neutralExpected:0,strata:0,matchedPositive:0,matchedNegative:0,
   matchedHeads:0,matchedPositiveHeads:0,matchedExpected:0};
  const total=rows.reduce((n,r)=>n+r.hit,0);
  control.neutralExpected=rows.length?
   rows.filter(r=>r[key]).length/rows.length*total:0;
  // Fuente de PRIMERA APARICIÓN y disponibilidad física comparable en el
  // mismo PRE. Sin "falsos negativos" de números imposibles de trazar.
  for(const row of rows){
   const classKey=[row.source,band(row.routes),
    row.sourceCount===1?'una':'multiples'].join('|');
   if(!groups.has(classKey))groups.set(classKey,[]);
   groups.get(classKey)!.push(row);
  }
  for(const group of groups.values()){
   const pos=group.filter(r=>r[key]),neg=group.filter(r=>!r[key]);
   if(!pos.length||!neg.length)continue;
   const heads=group.reduce((n,r)=>n+r.hit,0);
   control.strata++;
   control.matchedPositive+=pos.length;
   control.matchedNegative+=neg.length;
   control.matchedHeads+=heads;
   control.matchedPositiveHeads+=pos.reduce((n,r)=>n+r.hit,0);
   control.matchedExpected+=pos.length/group.length*heads;
  }
  result[key]=control;
 }
 return result;
}
export function sumFeatureControls(parts:Record<Feature,Control>[]):Record<Feature,Control>{
 const result={} as Record<Feature,Control>;
 for(const feature of featureNames){
  const row={} as Control;
  for(const k of Object.keys(parts[0]?.[feature]||{}) as (keyof Control)[])
   row[k]=parts.reduce((n,part)=>n+part[feature][k],0);
  result[feature]=row;
 }
 return result;
}
