// Presentación visual pura: ninguna modificación al motor o a las elecciones.
// Una huella física y su inversa son un único trazo, aunque ambas lecturas
// puedan justificar cabezas distintas.
import type {DailySheet,SourceId} from './sheet';
import type {CabezasDia,Turno} from './domain';
import {JURS,TURNOS} from './domain';
import type {PredictiveView} from './predictive';
import type {Path} from './paths';

export type PanoramaKind='vt2'|'vt3'|'vt4';
export type PanoramaCell={row:number;col:number};
export type PanoramaRoute={
 id:string;ownerId:string;sourceId:SourceId;kind:PanoramaKind;
 cells:PanoramaCell[];readings:string[];headSources:string[];
};
export type PanoramaGroup={
 id:string;label:string;subtitle:string;turn?:Turno;head?:string;
 routeCount:number;kinds:PanoramaKind[];
};
export type PanoramaData={routes:PanoramaRoute[];groups:PanoramaGroup[]};
const routeSteps=(p:Path):PanoramaCell[]=>p.map(x=>({row:x.row,col:x.col}));
const pathText=(p:PanoramaCell[])=>p.map(x=>x.row+':'+x.col).join('>');
const reverseString=(s:string)=>s.split('').reverse().join('');
export const physicalKey=(kind:PanoramaKind,sourceId:SourceId,cells:PanoramaCell[])=>
 kind+'|'+sourceId+'|'+[pathText(cells),pathText([...cells].reverse())].sort()[0];

export function buildDailyPanorama(sheet:DailySheet,heads:CabezasDia|null):PanoramaData{
 const routes:PanoramaRoute[]=[],groups:PanoramaGroup[]=[];
 for(const turn of TURNOS){
  for(const jurisdiction of JURS){
   const head=heads?.[turn]?.[jurisdiction]||'----';
   if(!/^\d{4}$/.test(head))continue;
   const id=turn+'|'+jurisdiction+'|'+head;
   const matches=sheet.matches[turn].filter(m=>m.jurisdiccion===jurisdiction&&m.cabeza===head);
   const unique=new Map<string,PanoramaRoute>();
   for(const match of matches)for(const hit of match.hits)for(const path of hit.paths){
    const cells=routeSteps(path),key=physicalKey(hit.kind,hit.sourceId,cells);
    const read=path.map(p=>p.digit).join('');
    if(!unique.has(key))unique.set(key,{id:key,ownerId:id,sourceId:hit.sourceId,
     kind:hit.kind,cells,readings:[],headSources:[]});
    const item=unique.get(key)!;
    if(!item.readings.includes(read))item.readings.push(read);
    if(!item.headSources.includes(turn+' '+jurisdiction))item.headSources.push(turn+' '+jurisdiction);
   }
   const these=[...unique.values()];
   routes.push(...these);
   const kinds=(['vt2','vt3','vt4'] as PanoramaKind[]).filter(k=>these.some(r=>r.kind===k));
   groups.push({id,label:head,subtitle:jurisdiction,turn,head,routeCount:these.length,kinds});
  }
 }
 return {routes,groups};
}

export function buildPredictivePanorama(view:PredictiveView):PanoramaData{
 const routes:PanoramaRoute[]=[],groups:PanoramaGroup[]=[];
 // Mostrar TODAS las familias y TODAS las rutas entregadas por el motor;
 // no hay tope de cinco ni nueva selección, ni conversión VT3 -> "VT4".
 for(const family of view.hotFamilies){
  const unique=new Map<string,PanoramaRoute>();
  for(const r of view.routes.filter(p=>p.family===family.family)){
   const cells=routeSteps(r.path),kind:'vt3'='vt3';
   const key=physicalKey(kind,r.sourceId,cells);
   if(!unique.has(key))unique.set(key,{id:key,ownerId:family.family,
    kind,sourceId:r.sourceId,cells,readings:[],headSources:[]});
   const item=unique.get(key)!;
   for(const reading of [r.value,reverseString(r.value)])
    if(!item.readings.includes(reading))item.readings.push(reading);
   for(const a of r.antecedents){
    const src='D−'+a.week*7+' '+a.head+' '+a.jurisdiction;
    if(!item.headSources.includes(src))item.headSources.push(src);
   }
  }
  const these=[...unique.values()];
  routes.push(...these);
  groups.push({id:family.family,label:family.family,subtitle:family.state,
   routeCount:these.length,kinds:these.length?['vt3']:[]});
 }
 return {routes,groups};
}

// Para render y auditoría: seleccionar UNA cabeza o familia siempre activa
// todo su conjunto, jamás sólo el primer camino o una modalidad.
export function routesForOwner(data:PanoramaData,ownerId:string|null):PanoramaRoute[]{
 return ownerId===null?data.routes:data.routes.filter(x=>x.ownerId===ownerId);
}
