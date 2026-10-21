/**
 * MEMORIA POSICIONAL (no traslado libre): un dibujo de una cabeza
 * efectivamente ganadora sólo se conserva si las MISMAS CELDAS FÍSICAS
 * existen en el tablero PRE siguiente. Se leen los nuevos dígitos.
 *
 * Dos hechos separados: (1) huella ganadora POST histórica, (2) lectura
 * de un futuro tablero PRE. Nunca copiar el número viejo ni desplazar
 * libremente la figura. La hoja auxiliar sí permite cruces entre turnos.
 *
 * Control equivalente: reemplazar CADA ruta histórica ganadora por otra
 * ruta válida del mismo tablero PRE antiguo y con LAS MISMAS FRANJAS físicas
 * involucradas (si existen alternativas), excluyendo toda ruta ganadora
 * exacta de esa modalidad/turno. Conserva día, turno, cantidad de eventos
 * y cantidad de rutas por evento; no privilegia "ganadoras" en el control.
 */
import {TURNOS,JURS} from './domain';
import type {Turno,CabezasDia} from './domain';
import {
 auxiliaryBoard,auxFamily,enumerateAuxPaths,findAuxPaths,
 auxPathKey,auxCanonicalPath
} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads,AuxiliaryBoard,AuxPath,AuxCell} from './auxSantiagoNeuquen';

export type Length=2|3|4;
export type Period='D−1'|'D−7';
export type RootEvent={id:string,date:string,target:Turno,jur:string;
 head:string;kind:Length;paths:AuxPath[]};
export type WitnessDay={date:string;aux:AuxiliaryHeads;
 byKind:Record<Length,RootEvent[]>;
 pools:Record<Length,Partial<Record<Turno,AuxPath[]>>>;
 winningCoordinates:Record<Length,Partial<Record<Turno,Set<string>>>>};
export type AnchoredFamily={family:string;values:string[];
 roots:number;d1:number;d7:number;crossing:boolean;
 witnessRoutes:number;sources:string[];sampleRoots:string[]};
export type AnchorEvaluation={
 ranked:AnchoredFamily[];candidates:number;rootEvents:number;
 positionedPaths:number;invalidCoordinates:number;
 nullFallbackPaths:number;
};
const KINDS:Length[]=[2,3,4];
const val=(p:AuxPath)=>p.map(c=>c.digit).join('');
const coord=(c:AuxCell)=>c.row+':'+c.col;
const hash=(s:string)=>{let h=2166136261;for(const c of s){
 h^=c.charCodeAt(0);h=Math.imul(h,16777619);
 }return h>>>0;};
export const motherFamily=(v:string)=>auxFamily(v.slice(1));
export function familyFor(n:Length,v:string):string{
 if(n!==4)return auxFamily(v);
 const mother=motherFamily(v);
 return [...new Set(mother.split('/').map(x=>v[0]+x))].join('/');
}
export function collectWitnesses(date:string,aux:AuxiliaryHeads,draws:CabezasDia):WitnessDay{
 const byKind={2:[],3:[],4:[]} as Record<Length,RootEvent[]>;
 const winningCoordinates={2:{},3:{},4:{}} as WitnessDay['winningCoordinates'];
 const pools={2:{},3:{},4:{}} as WitnessDay['pools'];
 for(const target of TURNOS){
  const board=auxiliaryBoard(aux,target);
  if(!board.cells.length)continue;
  for(const kind of KINDS){
   const winning=new Set<string>();
   for(const jur of JURS){
    const head=draws[target]?.[jur]||'';
    if(!/^\d{4}$/.test(head))continue;
    const paths=findAuxPaths(board,head.slice(-kind));
    if(!paths.length)continue;
    const id=[date,target,jur,head,'VT'+kind].join('|');
    byKind[kind].push({id,date,target,jur,head,kind,paths});
    for(const path of paths)winning.add(auxCanonicalPath(path));
   }
   winningCoordinates[kind][target]=winning;
   // La geometría alternativa sólo se usa como nulo. Ninguna cabeza
   // objetivo futura participa aquí.
   pools[kind][target]=enumerateAuxPaths(board,kind);
  }
 }
 return {date,aux,byKind,pools,winningCoordinates};
}
/** Misma coordenada original, misma dirección de lectura. Sin traslación. */
export function anchorPath(now:AuxiliaryBoard,original:AuxPath):AuxPath|null{
 const lookup=new Map(now.cells.map(c=>[coord(c),c]));
 const result:AuxPath=[];
 for(const old of original){
  const c=lookup.get(coord(old));
  if(!c)return null;
  result.push(c);
 }
 if(result.length!==original.length||new Set(result.map(coord)).size!==result.length)return null;
 for(let i=1;i<result.length;i++){
  if(Math.max(Math.abs(result[i].row-result[i-1].row),
   Math.abs(result[i].col-result[i-1].col))!==1)return null;
 }
 return result;
}
const sourceMask=(p:AuxPath)=>
 [...new Set(p.map(c=>c.source))].sort().join('+');
const randomControl=(day:WitnessDay,root:RootEvent,path:AuxPath,index:number,seed:number)=>{
 const pool=day.pools[root.kind][root.target]||[];
 if(!pool.length)return {path:null as AuxPath|null,fallback:true};
 const forbidden=day.winningCoordinates[root.kind][root.target]||new Set<string>();
 const candidate=pool.filter(x=>!forbidden.has(auxCanonicalPath(x)));
 const source=sourceMask(path);
 let admissible=candidate.filter(p=>sourceMask(p)===source);
 let fallback=false;
 if(!admissible.length){fallback=true;admissible=candidate;}
 if(!admissible.length){fallback=true;admissible=pool;}
 if(!admissible.length)return {path:null as AuxPath|null,fallback:true};
 return {path:admissible[hash(root.id+'|'+index+'|'+seed)%admissible.length],fallback};
};
export function evaluateAnchors(now:AuxiliaryBoard,
 refs:{period:Period;day:WitnessDay}[],kind:Length,
 seed:number|null=null):AnchorEvaluation{
 type Group={values:Set<string>;roots:Set<string>;d1:Set<string>;
 d7:Set<string>;sources:Set<string>;cross:boolean;routes:Set<string>};
 const groups=new Map<string,Group>();
 let count=0,invalid=0,fallbacks=0;
 let totalRoots=0;
 for(const {period,day} of refs){
  for(const root of day.byKind[kind]){
   totalRoots++;
   for(let i=0;i<root.paths.length;i++){
    const old=root.paths[i];
    let chosen:AuxPath|null=old;
    if(seed!==null){
     const control=randomControl(day,root,old,i,seed);
     chosen=control.path;
     fallbacks+=Number(control.fallback);
    }
    if(!chosen)continue;
    const current=anchorPath(now,chosen);
    if(!current){invalid++;continue;}
    count++;
    const v=val(current),family=familyFor(kind,v);
    const g=groups.get(family)||{values:new Set<string>(),roots:new Set<string>(),
     d1:new Set<string>(),d7:new Set<string>(),sources:new Set<string>(),
     cross:false,routes:new Set<string>()};
    // La unidad de respaldo es raíz histórica, NO número de caminos.
    g.roots.add(root.id);
    (period==='D−1'?g.d1:g.d7).add(root.id);
    g.routes.add(auxCanonicalPath(current));
    current.forEach(c=>g.sources.add(c.source));
    if(new Set(current.map(c=>c.source)).size>1)g.cross=true;
    if(kind===4)g.values.add(v); // No inventar VT4 inversa no formada.
    else for(const f of family.split('/'))g.values.add(f);
    groups.set(family,g);
   }
  }
 }
 const ranked=[...groups].map(([family,g])=>({
  family,values:[...g.values].sort(),roots:g.roots.size,
  d1:g.d1.size,d7:g.d7.size,crossing:g.cross,
  witnessRoutes:g.routes.size,sources:[...g.sources],
  sampleRoots:[...g.roots].slice(0,6)
 }));
 ranked.sort((a,b)=>b.roots-a.roots||b.d1-a.d1||
  b.d7-a.d7||Number(b.crossing)-Number(a.crossing)||
  b.witnessRoutes-a.witnessRoutes||a.family.localeCompare(b.family));
 return {ranked,candidates:ranked.length,rootEvents:totalRoots,
  positionedPaths:count,invalidCoordinates:invalid,nullFallbackPaths:fallbacks};
}
