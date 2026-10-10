// Modelo Papa VT3: censo causal de la RED de caminos ganadores + techo de cobertura.
// NO decide apuestas ni modifica el selector. D14/D7 se leen antes del sorteo D;
// los resultados de D se abren EXCLUSIVAMENTE para clasificar cobertura posterior.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {DatedSheet} from './cycle7d';
import type {MarkedPath} from './markedSheet7d';
import {reconstructMarkedMoments} from './markedSheet7d';
import {readCombined7D} from './combinedReader7d';
import {freezeBeforeTurn7D,physicalPoolBefore7D} from './causalReplay7d';
import {cellsFromPlus11} from './paths';
import {routeZone} from './spatialFlow7d';

export type VT3GraphProfile7D={
 uniqueRoutes:number;uniqueCells:number;uniqueEdges:number;
 sharedCells:number;forkCells:number;convergenceCells:number;
 sources:number;zones:Record<string,number>;
 shapes:number;
};
export type VT3GraphChanges7D={
 routesExact:number;shapesShared:number;
 routesTranslated:number;zoneMoved:number;edgesRetained:number;
};
export type VT3CoverageTurn7D={
 date:string;turn:Turno;heads:string[];outcomes:string[];
 hasD7:boolean;hasD14:boolean;
 graphD7:VT3GraphProfile7D;graphD14?:VT3GraphProfile7D;
 change?:VT3GraphChanges7D;
 candidatePools:{anyPhysical:number;d7:number;d14:number;union:number;top3:number};
 covered:{anyPhysical:number;d7:number;d14:number;union:number;top3:number};
 missedByD7:string[];newFromD14:string[];notPhysical:string[];
};
export type VT3NetworkCoverageReport7D={
 protocol:'VT3_NETWORK_COVERAGE_D14_D7_V1';
 turns:number;turnsWithD7:number;turnsWithBothWeeks:number;
 observedDistinctVT3:number;physicalHits:number;d7OracleHits:number;
 d14OracleHits:number;unionOracleHits:number;top3Hits:number;
 missedByD7:number;newFromD14:number;notPhysical:number;
 d7CandidateValues:number;d14CandidateValues:number;
 network:{routesD7:number;sharedCellsD7:number;forkCellsD7:number;
  convergenceCellsD7:number;translatedRoutes:number;zoneMoves:number};
 rows:VT3CoverageTurn7D[];warnings:string[];
};
const emptyProfile=():VT3GraphProfile7D=>({uniqueRoutes:0,uniqueCells:0,
 uniqueEdges:0,sharedCells:0,forkCells:0,convergenceCells:0,sources:0,zones:{},shapes:0});
const dateBack=(date:string,n:number)=>{
 const x=new Date(date+'T12:00:00Z');x.setUTCDate(x.getUTCDate()-n);
 return x.toISOString().slice(0,10);
};
const pathKey=(m:MarkedPath)=>m.sourceId+'|'+m.cells.join('>');
const shapeKey=(m:MarkedPath)=>m.sourceId+'|'+m.route.slice(1).map((c,i)=>
 (c.row-m.route[i].row)+','+(c.col-m.route[i].col)).join('>');
const uniqueRoutes=(marks:MarkedPath[])=>{
 const by=new Map<string,MarkedPath>();
 for(const m of marks)if(m.kind==='vt3'&&!by.has(pathKey(m)))by.set(pathKey(m),m);
 return [...by.values()];
};
/** Métricas en una columna 6x2: las rutas simultáneas no son
 * sorteos independientes. La red está construida retrospectivamente
 * sobre un sorteo PASADO, nunca sobre el objetivo D.
 */
export function graphProfileVT37D(marks:MarkedPath[]):VT3GraphProfile7D{
 const routes=uniqueRoutes(marks),p=emptyProfile();
 const cellOwners=new Map<string,number>(),incoming=new Map<string,Set<string>>();
 const outgoing=new Map<string,Set<string>>(),edges=new Set<string>();
 const sources=new Set<string>(),shapes=new Set<string>();
 for(const m of routes){
  sources.add(m.sourceId);shapes.add(shapeKey(m));
  const zone=routeZone({route:m.route});
  p.zones[zone]=(p.zones[zone]||0)+1;
  for(const cell of m.cells){
   const key=m.sourceId+'|'+cell;
   cellOwners.set(key,(cellOwners.get(key)||0)+1);
  }
  for(const edge of m.edges){
   const [from,to]=edge.split('>');
   const a=m.sourceId+'|'+from,b=m.sourceId+'|'+to;
   edges.add(a+'>'+b);
   if(!outgoing.has(a))outgoing.set(a,new Set());
   if(!incoming.has(b))incoming.set(b,new Set());
   outgoing.get(a)!.add(b);incoming.get(b)!.add(a);
  }
 }
 p.uniqueRoutes=routes.length;p.uniqueCells=cellOwners.size;p.uniqueEdges=edges.size;
 p.sharedCells=[...cellOwners.values()].filter(n=>n>=2).length;
 p.forkCells=[...outgoing.values()].filter(s=>s.size>=2).length;
 p.convergenceCells=[...incoming.values()].filter(s=>s.size>=2).length;
 p.sources=sources.size;p.shapes=shapes.size;
 return p;
}
export function graphChangesVT37D(oldMarks:MarkedPath[],newMarks:MarkedPath[]):VT3GraphChanges7D{
 const a=uniqueRoutes(oldMarks),b=uniqueRoutes(newMarks);
 const oldRoutes=new Set(a.map(pathKey)),byShape=new Map<string,MarkedPath[]>();
 const oldEdges=new Set(a.flatMap(m=>m.edges.map(e=>m.sourceId+'|'+e)));
 for(const m of a){const k=shapeKey(m);byShape.set(k,[...(byShape.get(k)||[]),m]);}
 const sharedShapes=new Set<string>();
 let routesExact=0,routesTranslated=0,zoneMoved=0,edgesRetained=0;
 for(const m of b){
  const k=shapeKey(m),ancestors=byShape.get(k)||[];
  if(!ancestors.length)continue;
  sharedShapes.add(k);
  if(oldRoutes.has(pathKey(m)))routesExact++;
  else {
   routesTranslated++;
   if(ancestors.some(o=>routeZone({route:o.route})!==routeZone({route:m.route})))zoneMoved++;
  }
 }
 const newEdges=new Set(b.flatMap(m=>m.edges.map(e=>m.sourceId+'|'+e)));
 for(const edge of newEdges)if(oldEdges.has(edge))edgesRetained++;
 return {routesExact,shapesShared:sharedShapes.size,routesTranslated,zoneMoved,edgesRetained};
}
const contiguous=(a:{row:number;col:number},b:{row:number;col:number})=>
 (a.row!==b.row||a.col!==b.col)&&Math.abs(a.row-b.row)<=1&&Math.abs(a.col-b.col)<=1;
/** Todos los valores de 3 cifras formables físicamente antes del turno,
 * sin exigir que su ruta fuera ganadora en D-7. Se usa SÓLO para medir
 * el techo geométrico, NUNCA para publicar candidatas nuevas.
 */
export function allPhysicalVT3Before7D(before:DailySheet):Set<string>{
 const values=new Set<string>();
 for(const col of before.columns){
  const cells=cellsFromPlus11(col.values);
  for(const a of cells)for(const b of cells){
   if(!contiguous(a,b))continue;
   for(const c of cells)if(c!==a&&contiguous(b,c))
    values.add(a.digit+b.digit+c.digit);
  }
 }
 return values;
}
export function projectedHistoricalVT37D(marks:MarkedPath[],before:DailySheet):Set<string>{
 const values=new Set<string>();
 for(const m of uniqueRoutes(marks)){
  const source=before.columns.find(c=>c.id===m.sourceId);
  if(!source)continue;
  const digits=m.route.map(p=>source.values[p.row]?.[p.col]||'');
  if(digits.length===3&&digits.every(x=>/^\d$/.test(x)))values.add(digits.join(''));
 }
 return values;
}
/** La vista previa debe ser congelada antes del turno. */
export function previewVT3NetworkCoverage7D(history:DatedSheet[],before:DailySheet,
 date:string,turn:Turno){
 if(!TURNOS.includes(turn)||history.some(x=>x.date>=date))
  throw Error('Turno inválido o fuga temporal de futuro');
 const safe=freezeBeforeTurn7D(before,turn);
 const d7=history.find(x=>x.date===dateBack(date,7));
 const d14=history.find(x=>x.date===dateBack(date,14));
 const marks=reconstructMarkedMoments([...(d14?[d14]:[]),...(d7?[d7]:[])]);
 const beforeMarks=marks.find(m=>m.date===d14?.date&&m.turn===turn)?.marks||[];
 const recentMarks=marks.find(m=>m.date===d7?.date&&m.turn===turn)?.marks||[];
 const graphD7=graphProfileVT37D(recentMarks);
 const graphD14=d14?graphProfileVT37D(beforeMarks):undefined;
 const change=d7&&d14?graphChangesVT37D(beforeMarks,recentMarks):undefined;
 const pool7=physicalPoolBefore7D(history,safe,date,turn).vt3;
 const pool14=projectedHistoricalVT37D(beforeMarks,safe);
 const any=allPhysicalVT3Before7D(safe);
 const union=new Set([...pool7,...pool14]);
 const last6=[...history].sort((a,b)=>a.date.localeCompare(b.date)).slice(-6);
 const top3=readCombined7D(last6,safe,date,turn).candidates
  .filter(x=>x.kind==='vt3').map(x=>x.value);
 if([...union,...top3].some(v=>!any.has(v)))
  throw Error('Histórico produjo una terna que no existe físicamente en D');
 if(top3.some(v=>!pool7.has(v)))throw Error('Top3 no pertenece a D−7');
 return {hasD7:!!d7,hasD14:!!d14,graphD7,graphD14,change,
  pools:{any,pool7,pool14,union,top3}};
}
export function auditVT3NetworkCoverage7D(input:DatedSheet[]):VT3NetworkCoverageReport7D{
 const sorted=[...input].sort((a,b)=>a.date.localeCompare(b.date));
 if(sorted.some((x,i)=>!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||
  (i>0&&x.date===sorted[i-1].date)))throw Error('Fechas inválidas o repetidas');
 const rows:VT3CoverageTurn7D[]=[];
 const summary={turns:0,turnsWithD7:0,turnsWithBothWeeks:0,observedDistinctVT3:0,
  physicalHits:0,d7OracleHits:0,d14OracleHits:0,unionOracleHits:0,top3Hits:0,
  missedByD7:0,newFromD14:0,notPhysical:0,d7CandidateValues:0,
  d14CandidateValues:0,network:{routesD7:0,sharedCellsD7:0,forkCellsD7:0,
   convergenceCellsD7:0,translatedRoutes:0,zoneMoves:0}};
 for(let i=6;i<sorted.length;i++){
  const {date,sheet}=sorted[i],history=sorted.slice(0,i);
  for(const turn of TURNOS){
   const safe=freezeBeforeTurn7D(sheet,turn);
   const preview=previewVT3NetworkCoverage7D(history,safe,date,turn);
   const winners=[...new Set((sheet.heads[turn]||[]).filter(h=>/^\d{4}$/.test(h)))];
   if(!winners.length||!preview.hasD7)continue;
   const actual=[...new Set(winners.map(h=>h.slice(-3)))];
   const {any,pool7,pool14,union,top3}=preview.pools;
   const count=(p:Set<string>)=>actual.filter(v=>p.has(v)).length;
   const misses=actual.filter(v=>!pool7.has(v));
   const notPhysical=actual.filter(v=>!any.has(v));
   const extra=actual.filter(v=>!pool7.has(v)&&pool14.has(v));
   const covered={anyPhysical:count(any),d7:count(pool7),d14:count(pool14),
    union:count(union),top3:count(new Set(top3))};
   const {network}=summary;
   network.routesD7+=preview.graphD7.uniqueRoutes;
   network.sharedCellsD7+=preview.graphD7.sharedCells;
   network.forkCellsD7+=preview.graphD7.forkCells;
   network.convergenceCellsD7+=preview.graphD7.convergenceCells;
   network.translatedRoutes+=preview.change?.routesTranslated||0;
   network.zoneMoves+=preview.change?.zoneMoved||0;
   rows.push({date,turn,heads:winners,outcomes:actual,hasD7:true,
    hasD14:preview.hasD14,graphD7:preview.graphD7,graphD14:preview.graphD14,
    change:preview.change,candidatePools:{
     anyPhysical:any.size,d7:pool7.size,d14:pool14.size,union:union.size,top3:top3.length},
    covered,missedByD7:misses,newFromD14:extra,notPhysical});
   summary.turns++;summary.turnsWithD7++;
   if(preview.hasD14)summary.turnsWithBothWeeks++;
   summary.observedDistinctVT3+=actual.length;
   summary.physicalHits+=covered.anyPhysical;
   summary.d7OracleHits+=covered.d7;summary.d14OracleHits+=covered.d14;
   summary.unionOracleHits+=covered.union;summary.top3Hits+=covered.top3;
   summary.missedByD7+=misses.length;summary.newFromD14+=extra.length;
   summary.notPhysical+=notPhysical.length;
   summary.d7CandidateValues+=pool7.size;summary.d14CandidateValues+=pool14.size;
  }
 }
 return {protocol:'VT3_NETWORK_COVERAGE_D14_D7_V1',...summary,rows,warnings:[
  'Una cabeza VT3 puede estar en varias rutas/columnas. Los conteos de aciertos son cifras distintas por turno, no rutas ni sorteos independientes.',
  'Las métricas de D−7 y D−14 se computan sobre resultados históricos previos a D; la cabeza de D sólo se usa para evaluar cobertura después.',
  'Cota ANY PHYSICAL describe lo que sería posible en el tablero D; NO es predicción, ni equivale a una señal ganadora.',
  'Cota ORÁCULO D−7 describe si el resultado estuvo en alguna ruta D−7; NO es acierto de selección. TOP3 es la salida real del lector.',
  'La unión D−7 + D−14 puede describir cobertura potencial adicional pero no autoriza candidatos extra al motor original.',
  'Los recorridos son reconstrucciones automáticas de cabezas anteriores, no transcripción de trazos manuscritos.',
  'Este estudio es retrospectivo exploratorio; no demuestra previsibilidad de sorteos.'
 ]};
}
