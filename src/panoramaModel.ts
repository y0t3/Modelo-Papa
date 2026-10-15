// Presentación visual pura: ninguna modificación al motor o a las elecciones.
// Una huella física y su inversa son un único trazo, aunque ambas lecturas
// puedan justificar cabezas distintas.
import type {DailySheet,SourceId} from './sheet';
import type {CabezasDia,Turno} from './domain';
import {JURS,TURNOS} from './domain';
import type {LaloView,LaloKind,LaloHistorical,RootRef} from './motorLalo';
import type {Path} from './paths';
import {physicalSupportRelation} from './physicalRelation';
import type {PhysicalRelation} from './physicalRelation';

export type PanoramaKind='vt2'|'vt3'|'vt4';
export type PanoramaCell={row:number;col:number};
export type PanoramaAntecedent={
 id:string;period:RootRef['period'];date:string;head:string;jurisdiction:string;
 turn:Turno;sourceId:SourceId;sourceLabel:string;values:string[];
 cells:PanoramaCell[];reading:string;relation?:PhysicalRelation;
};
export type PanoramaRoute={
 id:string;ownerId:string;sourceId:SourceId;kind:PanoramaKind;
 cells:PanoramaCell[];readings:string[];headSources:string[];
 antecedents?:PanoramaAntecedent[];
};
export type PanoramaGroup={
 id:string;label:string;subtitle:string;turn?:Turno;head?:string;
 routeCount:number;kinds:PanoramaKind[];
};
export type PanoramaData={routes:PanoramaRoute[];groups:PanoramaGroup[]};
const routeSteps=(p:Path):PanoramaCell[]=>p.map(x=>({row:x.row,col:x.col}));
const pathText=(p:PanoramaCell[])=>p.map(x=>x.row+':'+x.col).join('>');
const reverseString=(s:string)=>s.split('').reverse().join('');
export const routeCellText=(cells:PanoramaCell[])=>cells.map(c=>(c.row+1)+(c.col?'D':'I')).join(' → ');
export const physicalKey=(kind:PanoramaKind,sourceId:SourceId,cells:PanoramaCell[])=>
 kind+'|'+sourceId+'|'+[pathText(cells),pathText([...cells].reverse())].sort()[0];

/** Identidad estable de una cabeza concreta; la comparten Hoja y Cabezas. */
export const dailyHeadOwnerId=(turn:Turno,jurisdiction:string,head:string)=>
 turn+'|'+jurisdiction+'|'+head;

/** Conserva TODOS los caminos VT2/VT3/VT4 de todas las cabezas coincidentes de un turno. */
export function routesForDailyTurn(data:PanoramaData,turn:Turno):PanoramaRoute[]{
 const owners=new Set(data.groups.filter(g=>g.turn===turn&&g.routeCount>0).map(g=>g.id));
 return data.routes.filter(r=>owners.has(r.ownerId));
}

export function buildDailyPanorama(sheet:DailySheet,heads:CabezasDia|null):PanoramaData{
 const routes:PanoramaRoute[]=[],groups:PanoramaGroup[]=[];
 for(const turn of TURNOS){
  for(const jurisdiction of JURS){
   const head=heads?.[turn]?.[jurisdiction]||'----';
   if(!/^\d{4}$/.test(head))continue;
   const id=dailyHeadOwnerId(turn,jurisdiction,head);
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
/**
 * Construye exclusivamente una prueba visual de la raíz física que YA admitió
 * Lalo. No descubre raíces nuevas ni altera ranking o selección.
 * Las casillas corresponden al recorrido HISTÓRICO, no se proyectan desde la
 * ruta de hoy. Ante historia incompleta, no se inventa el respaldo.
 */
export function visualAntecedent(root:RootRef,historical:LaloHistorical[]):PanoramaAntecedent|null{
 const entry=historical.find(h=>h.date===root.date&&h.period===root.period);
 if(!entry)return null;
 const source=entry.sheet.columns.slice(0,TURNOS.indexOf(root.oldTurn)+1)
  .find(c=>c.id===root.sourceId);
 if(!source||!/^\d{4}$/.test(root.head)||![2,3].includes(root.oldCells.length))return null;
 const cells=root.oldCells.map(raw=>{
  const m=/^([0-5]):([01])$/.exec(raw);
  return m?{row:Number(m[1]),col:Number(m[2])}:null;
 });
 if(cells.some(c=>c===null))return null;
 const physical=cells as PanoramaCell[];
 if(new Set(root.oldCells).size!==root.oldCells.length)return null;
 for(let i=1;i<physical.length;i++)if(Math.max(
  Math.abs(physical[i].row-physical[i-1].row),
  Math.abs(physical[i].col-physical[i-1].col))!==1)return null;
 const reading=physical.map(c=>source.values[c.row]?.[c.col]||'').join('');
 if(!/^\d{2,3}$/.test(reading)||!root.head.endsWith(reading))return null;
 return {id:root.id,period:root.period,date:root.date,head:root.head,
  jurisdiction:root.jurisdiction,turn:root.oldTurn,sourceId:root.sourceId,
  sourceLabel:source.sourceLabel,values:[...source.values],cells:physical,reading};
}

export function buildPredictivePanorama(view:LaloView,historical:LaloHistorical[]=[]):PanoramaData{
 const routes:PanoramaRoute[]=[],groups:PanoramaGroup[]=[];
 const rootMap=new Map(view.roots.map(r=>[r.id,r]));
 const antecedentMap=new Map(view.roots.map(r=>[r.id,visualAntecedent(r,historical)]));
 for(const kind of ['vt2','vt3','vt4'] as LaloKind[]){
  for(const family of view.ranks[kind]){
   const id=kind+'|'+family.family,unique=new Map<string,PanoramaRoute>();
   for(const r of family.paths){
    const cells=routeSteps(r.path),key=physicalKey(kind,r.sourceId,cells);
    if(!unique.has(key))unique.set(key,{id:key,ownerId:id,kind,sourceId:r.sourceId,
     cells,readings:[],headSources:[],antecedents:[]});
    const p=unique.get(key)!;
    for(const v of [r.value,reverseString(r.value)])
     if(!p.readings.includes(v))p.readings.push(v);
    for(const rootId of r.rootIds){
     const root=rootMap.get(rootId);
     if(root){
      const label=root.period+' · '+root.date+' · '+root.head+
       ' · '+root.jurisdiction+' ('+root.oldTurn+')';
      if(!p.headSources.includes(label))p.headSources.push(label);
      const ancestor=antecedentMap.get(rootId);
      if(ancestor&&!p.antecedents?.some(a=>a.id===ancestor.id))
       p.antecedents?.push({...ancestor,relation:physicalSupportRelation(r,root,family.paths)});
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
