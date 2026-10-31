/** Anatomía de familias VT3 formables de +11, no nuevo selector. */
import type {DailySheet,SourceId} from './sheet';
import type {Turno} from './domain';
import type {FormLocation} from './motorFormasPrimero';
import {reversibleFamily} from './motorLalo';
import {TURNOS} from './domain';

export type Frontier='UNICA_COLUMNA'|'SOLO_NUEVA'|'SOLO_ANTIGUAS'|'NUEVA_Y_ANTIGUAS';
export type Multiplicity='UN_CAMINO'|'DOS_TRES'|'CUATRO_MAS';
export type PhysicalAnatomy={
 family:string;pathCount:number;sourceCount:number;shapes:number;
 frontier:Frontier;multiplicity:Multiplicity;members:1|2;
 expectedHeadHitsPerJur:number;sourceIds:SourceId[];
};
export const sourceClass=(sources:readonly SourceId[],target:Turno):Frontier=>{
 const order:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
 const visible=TURNOS.indexOf(target)+1;
 if(visible<1)throw Error('Turno inválido para fuente');
 if(visible===1)return 'UNICA_COLUMNA';
 const newest=order[visible-1];
 const n=sources.includes(newest),old=sources.some(s=>s!==newest);
 return n&&old?'NUEVA_Y_ANTIGUAS':n?'SOLO_NUEVA':'SOLO_ANTIGUAS';
};
export const multiplicity=(n:number):Multiplicity=>
 n<=1?'UN_CAMINO':n<=3?'DOS_TRES':'CUATRO_MAS';
const signature=(p:FormLocation)=>p.source+'|'+p.positionKey;
export function physicalAnatomy(
 sheet:DailySheet,target:Turno,positions:readonly FormLocation[]
):PhysicalAnatomy[]{
 const order:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
 const visible=new Set(order.slice(0,TURNOS.indexOf(target)+1));
 const entries=new Map<string,{sites:Set<string>;sources:Set<SourceId>;shapes:Set<string>}>();
 for(const p of positions){
  if(!visible.has(p.source))throw Error('FUGA: camino de columna futura');
  const column=sheet.columns.find(c=>c.id===p.source);
  if(!column)throw Error('Columna física ausente');
  if(p.cells.length!==3||new Set(p.cells.map(x=>x.row+':'+x.col)).size!==3||
   p.cells.some((c,i)=>c.row<0||c.row>=6||c.col<0||c.col>=2||
    (i>0&&Math.max(Math.abs(c.row-p.cells[i-1].row),
     Math.abs(c.col-p.cells[i-1].col))!==1)))
    throw Error('FUGA: recorrido que salta, cruza o repite celdas');
  const value=p.cells.map(c=>column.values[c.row]?.[c.col]||'').join('');
  if(!/^\d{3}$/.test(value))throw Error('FUGA: cifra física inválida');
  const family=reversibleFamily(value);
  let e=entries.get(family);
  if(!e){e={sites:new Set(),sources:new Set(),shapes:new Set()};entries.set(family,e)}
  e.sites.add(signature(p));e.sources.add(p.source);e.shapes.add(p.shape);
 }
 const result=[...entries].map(([family,e])=>{
  const pathCount=e.sites.size;
  const sourceIds=order.filter(s=>e.sources.has(s));
  const members=family.split('/')[0]===family.split('/')[1]?1:2;
  return {family,pathCount,sourceCount:sourceIds.length,shapes:e.shapes.size,
   frontier:sourceClass(sourceIds,target),multiplicity:multiplicity(pathCount),
   members:members as 1|2,expectedHeadHitsPerJur:members/1000,sourceIds};
 });
 if(new Set(result.map(x=>x.family)).size!==result.length)
  throw Error('Familias duplicadas');
 return result;
}
