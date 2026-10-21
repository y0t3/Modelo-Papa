/**
 * Experimento independiente: memoria de las MARCAS ganadoras reales en la
 * hoja Santiago-Neuquén. No crea cabezas ganadoras ni cambia MV1.
 *
 * Captura POST (cabeza completa sorteada de las seis jurisdicciones):
 * - SOLO terminación exacta de tres dígitos en la hoja que existía PRE
 * - TODOS los recorridos contiguos; cruce entre turnos permitido.
 * - La raíz es un EVENTO cabeza+turno+jurisdicción+fecha. Un evento puede
 *   tener veinte rutas, pero cuenta una sola vez por familia futura.
 *
 * Traslación PRE:
 * - toma desplazamientos físicos de cada marca anterior, preserva su forma,
 *   y prueba sus posiciones posibles en la hoja auxiliar actual.
 * - los nuevos dígitos tienen que existir en cada celda tocada; no se
 *   transfieren números ni se inventan huecos.
 * - genera familias VT3 reversibles de los dígitos FÍSICOS actuales.
 */
import {TURNOS,JURS} from './domain';
import type {CabezasDia,Turno} from './domain';
import {auxiliaryBoard,findAuxPaths,auxFamily,enumerateAuxPaths,auxCanonicalPath}
 from './auxSantiagoNeuquen';
import type {AuxiliaryHeads,AuxCell,AuxPath,AuxiliaryBoard} from './auxSantiagoNeuquen';

export type AuxMark={
 id:string;date:string;turn:Turno;jur:string;head:string;
 family:string;paths:AuxPath[];
};
export type AuxMemoryDay={date:string;aux:AuxiliaryHeads;outcomes:CabezasDia;
 marks:AuxMark[]};
export type AuxTransfer={family:string;currentPaths:AuxPath[];
 rootIds:string[];d1Events:number;d7Events:number;
 fromPastMarkedPaths:number;crossTurnPaths:number};
const valid=(s:string)=>/^\d{4}$/.test(s);
const coord=(cell:AuxCell)=>cell.row+':'+cell.col;
const keyPath=(path:AuxPath)=>path.map(coord).join('>');
const keyBlock=(path:AuxPath)=>path.map(coord).sort().join(',');
const rootKey=(d:string,t:Turno,j:string,h:string)=>[d,t,j,h].join('|');
const period=(n:string,date:string):'D−1'|'D−7'=>n==='D−7'?'D−7':'D−1';

export function extractWinningMarks(date:string,aux:AuxiliaryHeads,
 outcomes:CabezasDia):AuxMemoryDay{
 const marks:AuxMark[]=[];
 for(const turn of TURNOS){
  const board=auxiliaryBoard(aux,turn); // Turno objetivo sigue OCULTO
  for(const jur of JURS){
   const head=outcomes[turn]?.[jur]||'';
   if(!valid(head))continue;
   const paths=findAuxPaths(board,head.slice(-3));
   if(!paths.length)continue;
   const id=rootKey(date,turn,jur,head);
   marks.push({id,date,turn,jur,head,family:auxFamily(head.slice(-3)),paths});
  }
 }
 return {date,aux,outcomes,marks};
}
function shapeMoves(path:AuxPath):Array<[number,number]>{
 return path.slice(1).map((c,i)=>[c.row-path[i].row,c.col-path[i].col]);
}
/** Proyectar geometría de un recorrido a todas las posiciones posibles. */
export function projectAuxShape(board:AuxiliaryBoard,shape:AuxPath):AuxPath[]{
 if(shape.length<2||shape.length>4)return [];
 const out:AuxPath[]=[];
 const indices=new Map(board.cells.map(c=>[coord(c),c]));
 const moves=shapeMoves(shape);
 for(const start of board.cells){
  const current=[start];let validPath=true;
  for(const [dr,dc] of moves){
   const prev=current[current.length-1];
   const next=indices.get((prev.row+dr)+':'+(prev.col+dc));
   if(!next||current.some(c=>coord(c)===coord(next))){
    validPath=false;break;
   }
   current.push(next);
  }
  if(validPath)out.push(current);
 }
 return out;
}
const randomPathPools=new Map<string,AuxPath[]>();
export function randomizedRootShape(root:AuxMark,historicalAux:AuxiliaryHeads,
 index:number,seed:number):AuxPath{
 const key=root.date+'|'+root.turn;
 let pool=randomPathPools.get(key);
 if(!pool){
  pool=enumerateAuxPaths(auxiliaryBoard(historicalAux,root.turn),3);
  randomPathPools.set(key,pool);
 }
 if(!pool.length)throw Error('Histórico sin caminos al sortear '+root.id);
 const hash=(s:string)=>{let h=2166136261;for(const c of s){
  h^=c.charCodeAt(0);h=Math.imul(h,16777619);
 }return h>>>0;};
 const original=new Set(root.paths.map(p=>auxCanonicalPath(p)));
 let i=hash(root.id+'|'+index+'|'+seed)%pool.length;
 // Elegir otro RECORRIDO de la misma cuadrícula; nunca transportar un
 // antiguo recorrido ganador en el control si hay alguna alternativa.
 for(let probe=0;probe<pool.length;probe++){
  const path=pool[i];
  if(!original.has(auxCanonicalPath(path)))return path;
  i=(i+1)%pool.length;
 }
 return pool[i];
}
export function replayMemory(board:AuxiliaryBoard,
 references:Array<{day:AuxMemoryDay;period:'D−1'|'D−7'}>,
 controlSeed:null|number=null):Map<string,AuxTransfer>{
 const groups=new Map<string,{paths:Map<string,AuxPath>;roots:Set<string>;
  d1:Set<string>;d7:Set<string>;cross:Set<string>;shapeUse:number}>();
 for(const {day,period} of references){
  for(const mark of day.marks){
   for(let i=0;i<mark.paths.length;i++){
    const oldPath=controlSeed===null?mark.paths[i]:
     randomizedRootShape(mark,day.aux,i,controlSeed);
    const projected=projectAuxShape(board,oldPath);
    for(const path of projected){
     const value=path.map(x=>x.digit).join('');
     const family=auxFamily(value);
     const g=groups.get(family)||{
      paths:new Map<string,AuxPath>(),roots:new Set<string>(),
      d1:new Set<string>(),d7:new Set<string>(),cross:new Set<string>(),
      shapeUse:0
     };
     const pkey=auxCanonicalPath(path);
     if(!g.paths.has(pkey))g.paths.set(pkey,path);
     g.roots.add(mark.id);
     (period==='D−7'?g.d7:g.d1).add(mark.id);
     g.shapeUse++;
     if(new Set(path.map(c=>c.source)).size>1)g.cross.add(pkey);
     groups.set(family,g);
    }
   }
  }
 }
 return new Map([...groups].map(([family,g])=>[family,{
  family,currentPaths:[...g.paths.values()],
  rootIds:[...g.roots],d1Events:g.d1.size,d7Events:g.d7.size,
  fromPastMarkedPaths:g.shapeUse,crossTurnPaths:g.cross.size
 }]));
}
export function sortMemoryRanks(date:string,turn:Turno,
 groups:Map<string,AuxTransfer>,variant:'ROOTS'|'DENSITY'|'RANDOM'):{
 family:string;rootEvents:number;d1:number;d7:number;
 physicalBlocks:number;crossTurnPaths:number}[]{
 const hash=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);
  h=Math.imul(h,16777619);}return h>>>0};
 const ranked=[...groups.values()].map(x=>({
  family:x.family,rootEvents:x.rootIds.length,d1:x.d1Events,d7:x.d7Events,
  physicalBlocks:new Set(x.currentPaths.map(keyBlock)).size,
  crossTurnPaths:x.crossTurnPaths
 }));
 ranked.sort((a,b)=>{
  if(variant==='ROOTS'){
   const attrs:[number,number][]=[
    [b.rootEvents,a.rootEvents],[b.d1,a.d1],[b.d7,a.d7],
    [b.crossTurnPaths,a.crossTurnPaths],[b.physicalBlocks,a.physicalBlocks]];
   for(const [x,y] of attrs)if(x!==y)return x-y;
  }else if(variant==='DENSITY'){
   if(a.physicalBlocks!==b.physicalBlocks)return b.physicalBlocks-a.physicalBlocks;
   if(a.crossTurnPaths!==b.crossTurnPaths)return b.crossTurnPaths-a.crossTurnPaths;
  }
  const z=hash([date,turn,'AUX',variant,a.family].join('|'));
  const w=hash([date,turn,'AUX',variant,b.family].join('|'));
  return z-w||a.family.localeCompare(b.family);
 });
 return ranked;
}
