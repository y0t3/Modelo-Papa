// Presentación visual pura: ninguna modificación al motor o a las elecciones.
// Una huella física y su inversa son un único trazo, aunque ambas lecturas
// puedan justificar cabezas distintas.
import type {DailySheet,SourceId} from './sheet';
import type {CabezasDia,Turno} from './domain';
import {JURS,TURNOS} from './domain';
import type {LaloView,LaloKind} from './motorLalo';
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

/**
 * Única visualización PRE: exactamente los recorridos que creó Motor Lalo.
 * Los nombres de madres e hijas se agrupan por modalidad: una familia VT4 no
 * toma prestado el respaldo de la hermana.
 */
export function buildPredictivePanorama(view:LaloView):PanoramaData{
 const routes:PanoramaRoute[]=[],groups:PanoramaGroup[]=[];
 const rootMap=new Map(view.roots.map(r=>[r.id,r]));
 for(const kind of ['vt2','vt3','vt4'] as LaloKind[]){
  for(const family of view.ranks[kind]){
   const id=kind+'|'+family.family,unique=new Map<string,PanoramaRoute>();
   for(const r of family.paths){
    const cells=routeSteps(r.path),key=physicalKey(kind,r.sourceId,cells);
    if(!unique.has(key))unique.set(key,{id:key,ownerId:id,kind,sourceId:r.sourceId,
     cells,readings:[],headSources:[]});
    const p=unique.get(key)!;
    for(const v of [r.value,reverseString(r.value)])
     if(!p.readings.includes(v))p.readings.push(v);
    for(const rootId of r.rootIds){
     const root=rootMap.get(rootId);
     if(root){
      const label=root.period+' · '+root.date+' · '+root.head+
       ' · '+root.jurisdiction+' ('+root.oldTurn+')';
      if(!p.headSources.includes(label))p.headSources.push(label);
     }
    }
    for(const mother of r.mothers||[]){
     const label='Extensión propia de madre VT3 '+mother;
     if(!p.headSources.includes(label))p.headSources.push(label);
    }
   }
   routes.push(...unique.values());
   groups.push({id,label:family.family,subtitle:family.rationale,
    routeCount:unique.size,kinds:unique.size?[kind]:[]});
  }
 }
 return {routes,groups};
}

// Para render y auditoría: seleccionar UNA cabeza o familia siempre activa
// todo su conjunto, jamás sólo el primer camino o una modalidad.
export function routesForOwner(data:PanoramaData,ownerId:string|null):PanoramaRoute[]{
 return ownerId===null?data.routes:data.routes.filter(x=>x.ownerId===ownerId);
}
