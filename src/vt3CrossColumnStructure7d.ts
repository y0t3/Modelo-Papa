// Modelo Papá — censo de COINCIDENCIAS CONCRETAS VT3 entre columnas +11.
// Estructura física invariante: todo 6x2 lleno permite las mismas figuras.
// Por eso nunca interpretamos "misma forma en dos columnas" sin también
// estudiar el valor de tres cifras, origen y celdas independientes.
// No consulta cabezas del objetivo, memoria D−7 ni resultados posteriores.
// No produce candidatas, scores ni juegos; sólo un diagnóstico.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import {freezeBeforeTurn7D} from './causalReplay7d';

type Coordinate={row:number;col:number};
export type Route3Geometry={cells:[string,string,string];positions:[Coordinate,Coordinate,Coordinate];shape:string};
export type Route3Example={sourceId:SourceId;value:string;cells:string[];shape:string};
export type CrossColumnValue={value:string;sourceIds:SourceId[];
 sameExactCoordinates:boolean;sameRelativeShape:boolean;
 examples:Route3Example[]};
export type VT3ColumnStatistic={sourceId:SourceId;complete:boolean;
 pathCount:number;distinctShapes:number;distinctValues:number};
export type VT3CrossMetrics={columns:number;completeColumns:number;allPhysicalRoutes:number;
 uniqueVT3Values:number;repeatedValueAcrossColumns:number;
 sameValueSameShape:number;sameValueSameCoordinates:number;
 sharedVT2Suffixes:number;shapesSharedAcrossAllColumns:number};
export type VT3PermutationControl={repetitions:number;
 expectedRepeatedValue:number;expectedValueSameShape:number;
 expectedValueSameCoordinates:number;expectedSharedVT2:number;
 fractionAtLeastObservedRepeated:number;
 fractionAtLeastObservedSameCells:number};
export type VT3CrossColumnObservation={
 protocol:'VT3_SAME_VALUE_CROSS_COLUMN_GEOMETRY_V1';
 date:string;target:Turno;available:VT3ColumnStatistic[];
 geometricInvariant:{routesPerFullColumn:number;shapeTypesPerFullColumn:number;
  note:string};
 observed:VT3CrossMetrics;control:VT3PermutationControl;
 examples:CrossColumnValue[];
 status:'GEOMETRY_ONLY_NOT_PREDICTIVE';notes:string[];
};
const allCells:Coordinate[]=Array.from({length:12},(_,i)=>({row:Math.floor(i/2),col:i%2}));
const coord=(c:Coordinate)=>c.row+':'+c.col;
const adj=(a:Coordinate,b:Coordinate)=>(a.row!==b.row||a.col!==b.col)&&
 Math.abs(a.row-b.row)<=1&&Math.abs(a.col-b.col)<=1;
const signature=(p:Coordinate[])=>p.slice(1).map((x,i)=>
 (x.row-p[i].row)+','+(x.col-p[i].col)).join('>');
export const VT3_PHYSICAL_TOPOLOGY:Route3Geometry[]=[];
for(const a of allCells)for(const b of allCells){
 if(!adj(a,b))continue;
 for(const c of allCells){
  if(c===a||c===b||!adj(b,c))continue;
  VT3_PHYSICAL_TOPOLOGY.push({cells:[coord(a),coord(b),coord(c)],
   positions:[a,b,c],shape:signature([a,b,c])});
 }
}
export const VT3_PHYSICAL_SHAPES=[...new Set(VT3_PHYSICAL_TOPOLOGY.map(x=>x.shape))];
const valuesFrom=(values:string[],sourceId:SourceId):Route3Example[]=>{
 const routes:Route3Example[]=[];
 for(const t of VT3_PHYSICAL_TOPOLOGY){
  const digits=t.positions.map(c=>values[c.row]?.[c.col]||'');
  if(digits.every(x=>/^\d$/.test(x)))routes.push({sourceId,
   value:digits.join(''),cells:[...t.cells],shape:t.shape});
 }
 return routes;
};
function summarize(columns:Array<{id:SourceId;values:string[]}>){
 const available:VT3ColumnStatistic[]=[],all:Route3Example[]=[];
 const shapeSets:Array<Set<string>>=[];
 for(const column of columns){
  const paths=valuesFrom(column.values,column.id);all.push(...paths);
  const complete=column.values.length===6&&column.values.every(x=>/^\d{2}$/.test(x));
  shapeSets.push(new Set(paths.map(x=>x.shape)));
  available.push({sourceId:column.id,complete,pathCount:paths.length,
   distinctShapes:new Set(paths.map(x=>x.shape)).size,
   distinctValues:new Set(paths.map(x=>x.value)).size});
 }
 const byValue=new Map<string,Route3Example[]>();
 for(const path of all)byValue.set(path.value,[...(byValue.get(path.value)||[]),path]);
 const matched:CrossColumnValue[]=[];
 const suffixSources=new Map<string,Set<string>>();
 for(const path of all){
  const suffix=path.value.slice(-2);
  if(!suffixSources.has(suffix))suffixSources.set(suffix,new Set());
  suffixSources.get(suffix)!.add(path.sourceId);
 }
 let sameShape=0,sameCells=0;
 for(const [value,paths]of byValue){
  const sources=[...new Set(paths.map(p=>p.sourceId))];
  if(sources.length<2)continue;
  const mapShape=new Map<string,Set<string>>();
  const mapCells=new Map<string,Set<string>>();
  for(const p of paths){
   const ss=mapShape.get(p.shape)||new Set<string>();
   ss.add(p.sourceId);mapShape.set(p.shape,ss);
   const c=p.cells.join('>');
   const cs=mapCells.get(c)||new Set<string>();
   cs.add(p.sourceId);mapCells.set(c,cs);
  }
  const eqShape=[...mapShape.values()].some(x=>x.size>=2);
  const eqCells=[...mapCells.values()].some(x=>x.size>=2);
  if(eqShape)sameShape++;
  if(eqCells)sameCells++;
  matched.push({value,sourceIds:sources as SourceId[],
   sameExactCoordinates:eqCells,sameRelativeShape:eqShape,
   examples:paths.slice(0,12)});
 }
 matched.sort((a,b)=>Number(b.sameExactCoordinates)-Number(a.sameExactCoordinates)||
  Number(b.sameRelativeShape)-Number(a.sameRelativeShape)||
  b.sourceIds.length-a.sourceIds.length||a.value.localeCompare(b.value));
 const sharedShapes=shapeSets.length>=2?
  [...shapeSets[0]].filter(s=>shapeSets.every(col=>col.has(s))).length:0;
 const metrics:VT3CrossMetrics={
  columns:columns.length,completeColumns:available.filter(c=>c.complete).length,
  allPhysicalRoutes:all.length,
  uniqueVT3Values:byValue.size,repeatedValueAcrossColumns:matched.length,
  sameValueSameShape:sameShape,sameValueSameCoordinates:sameCells,
  sharedVT2Suffixes:[...suffixSources.values()].filter(x=>x.size>=2).length,
  shapesSharedAcrossAllColumns:sharedShapes
 };
 return {metrics,available,matched};
}
function hash(s:string):number{
 let n=2166136261;
 for(let i=0;i<s.length;i++){n^=s.charCodeAt(i);n=Math.imul(n,16777619);}
 return n>>>0;
}
function shuffleColumn(values:string[],seed:number):string[]{
 const cells=values.map(x=>/^\d{2}$/.test(x)?[x[0],x[1]]:[null,null]).flat();
 const indices=cells.map((x,i)=>x===null?-1:i).filter(x=>x>=0);
 let rnd=seed||0x12345678;
 const next=()=>{rnd^=rnd<<13;rnd^=rnd>>>17;rnd^=rnd<<5;return rnd>>>0;};
 const shuffled=[...cells];
 for(let i=indices.length-1;i>0;i--){
  const j=next()%(i+1),a=indices[i],b=indices[j];
  [shuffled[a],shuffled[b]]=[shuffled[b],shuffled[a]];
 }
 return Array.from({length:6},(_,r)=>{
  const a=shuffled[2*r],b=shuffled[2*r+1];
  return typeof a==='string'&&typeof b==='string'?a+b:'--';
 });
}
export function inspectCrossColumnVT37D(full:DailySheet,date:string,target:Turno,
 permutations=32):VT3CrossColumnObservation{
 if(!TURNOS.includes(target)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||
  !Number.isInteger(permutations)||permutations<1||permutations>256)
  throw Error('Turno, fecha o número de permutaciones inválidos');
 const frozen=freezeBeforeTurn7D(full,target);
 const columns=frozen.columns.map(c=>({id:c.id,values:[...c.values]}));
 const original=summarize(columns);
 let nRepeated=0,nShape=0,nCells=0,nSuffix=0,atLeastRepeated=0,atLeastCells=0;
 for(let i=0;i<permutations;i++){
  const shuffled=columns.map((c,j)=>({
   id:c.id,values:shuffleColumn(c.values,hash(date+'|'+target+'|'+i+'|'+j))
  }));
  const m=summarize(shuffled).metrics;
  nRepeated+=m.repeatedValueAcrossColumns;nShape+=m.sameValueSameShape;
  nCells+=m.sameValueSameCoordinates;nSuffix+=m.sharedVT2Suffixes;
  atLeastRepeated+=Number(m.repeatedValueAcrossColumns>=original.metrics.repeatedValueAcrossColumns);
  atLeastCells+=Number(m.sameValueSameCoordinates>=original.metrics.sameValueSameCoordinates);
 }
 return {protocol:'VT3_SAME_VALUE_CROSS_COLUMN_GEOMETRY_V1',
  date,target,available:original.available,
  geometricInvariant:{routesPerFullColumn:VT3_PHYSICAL_TOPOLOGY.length,
   shapeTypesPerFullColumn:VT3_PHYSICAL_SHAPES.length,
   note:'En cualquier columna 6×2 llena las formas y rutas posibles son idénticas, independientemente de sus cifras.'},
  observed:original.metrics,control:{repetitions:permutations,
   expectedRepeatedValue:nRepeated/permutations,
   expectedValueSameShape:nShape/permutations,
   expectedValueSameCoordinates:nCells/permutations,
   expectedSharedVT2:nSuffix/permutations,
   fractionAtLeastObservedRepeated:atLeastRepeated/permutations,
   fractionAtLeastObservedSameCells:atLeastCells/permutations},
  examples:original.matched.slice(0,12),
  status:'GEOMETRY_ONLY_NOT_PREDICTIVE',
  notes:[
   'Todas las rutas se forman dentro de UNA columna +11, sin saltos ni reutilización de celdas.',
   'La forma relativa por sí sola siempre se repite entre columnas COMPLETAS y no constituye una señal predictiva.',
   'La coincidencia de un VALOR VT3 en múltiples columnas es más específica; se informa también si coincide forma o ruta exacta.',
   'El control baraja las posiciones de los dígitos separadamente en cada columna, conservando su frecuencia y celdas faltantes. NO baraja ni predice resultados de sorteos.',
   'El porcentaje de permutaciones que alcanzan las cifras observadas es descriptivo; no es un p-valor validado para apuestas.',
   'Una coincidencia entre múltiples rutas del mismo número NO cuenta como múltiples sorteos independientes.',
   'El resultado del turno objetivo jamás participa en el informe. No se eligen Top3 ni se aumentan candidatos.',
   'No se afirma que una coincidencia espacial o numérica implique ventaja frente al azar en los sorteos.'
  ]
 };
}
