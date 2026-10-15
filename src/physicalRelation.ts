// Explica por qué una huella de hoy está vinculada a una cabeza histórica.
// No crea ni descarta recorridos: reconstruye la cadena ya admitida por el motor.
import type {LaloRoute,RootRef} from './motorLalo';
import type {PanoramaCell} from './panoramaModel';

export type PhysicalRelation={
 type:'misma-forma'|'bifurcacion'|'sin-verificar';
 explanation:string;
 bridgeCells?:PanoramaCell[];
 bridgeValue?:string;
};
type Point={row:number;col:number};
const point=(p:Point)=>p.row+':'+p.col;
const move=(a:Point,b:Point)=>({row:b.row-a.row,col:b.col-a.col});
const sameMove=(a:Point,b:Point)=>a.row===b.row&&a.col===b.col;
const parse=(cells:string[]):Point[]|null=>{
 const out:Point[]=[];
 for(const item of cells){
  const m=/^([0-5]):([01])$/.exec(item);
  if(!m)return null;
  out.push({row:Number(m[1]),col:Number(m[2])});
 }
 return out;
};
const translation=(older:Point[],newer:Point[]):Point|null=>{
 if(older.length!==newer.length||!older.length)return null;
 for(const old of [older,[...older].reverse()]){
  const offset=move(old[0],newer[0]);
  if(old.every((p,i)=>sameMove(move(p,newer[i]),offset)))return offset;
 }
 return null;
};
const sameEdge=(a:Point[],b:Point[]):Point[]|null=>{
 const edges=(list:Point[])=>list.slice(1).map((p,i)=>
  [point(list[i]),point(p)].sort().join('|'));
 const common=new Set(edges(a));
 for(let i=1;i<b.length;i++){
  const edge=[point(b[i-1]),point(b[i])].sort().join('|');
  if(common.has(edge))return [b[i-1],b[i]];
 }
 return null;
};
const quantity=(n:number,word:string,plural:string)=>Math.abs(n)===1?'una '+word:Math.abs(n)+' '+plural;
export const offsetExplanation=(delta:Point):string=>{
 const changes:string[]=[];
 if(delta.row!==0)changes.push(quantity(delta.row,'fila','filas')+' hacia '+(delta.row<0?'arriba':'abajo'));
 if(delta.col!==0)changes.push(quantity(delta.col,'columna','columnas')+' hacia '+(delta.col<0?'la izquierda':'la derecha'));
 return changes.length?'trasladada '+changes.join(' y '):'en las mismas casillas';
};
export function physicalSupportRelation(
 route:LaloRoute,root:RootRef,familyRoutes:LaloRoute[]
):PhysicalRelation{
 const old=parse(root.oldCells);
 if(!old)return {type:'sin-verificar',explanation:'No se pudo comprobar el recorrido del antecedente.'};
 const direct=translation(old,route.path);
 if(direct)return {
  type:'misma-forma',
  explanation:'Misma forma, '+offsetExplanation(direct)+'. Las cifras pueden ser distintas.'
 };
 // Bifurcación: compartir un BORDE con un testigo directo de ESTA raíz,
 // modalidad, familia y fuente; no alcanza con compartir dos celdas aisladas.
 if(route.kind==='vt3'){
  for(const candidate of familyRoutes){
   if(candidate===route||candidate.origin!=='TRASLADO'||
    candidate.kind!==route.kind||candidate.family!==route.family||
    candidate.sourceId!==route.sourceId||!candidate.rootIds.includes(root.id))continue;
   const offset=translation(old,candidate.path);
   const shared=sameEdge(candidate.path,route.path);
   if(!offset||!shared)continue;
   const sharedKeys=new Set(shared.map(point));
   const removed=candidate.path.find(p=>!sharedKeys.has(point(p)));
   const added=route.path.find(p=>!sharedKeys.has(point(p)));
   if(!removed||!added||point(removed)===point(added))continue;
   const value=candidate.path.map(p=>p.digit).join('');
   const fmt=(p:Point)=>(p.row+1)+(p.col?'D':'I');
   return {
    type:'bifurcacion',bridgeCells:candidate.path.map(p=>({row:p.row,col:p.col})),
    bridgeValue:value,
    explanation:'Primero, la forma anterior aparece '+offsetExplanation(offset)+
     ' y forma '+value+'. Después, este recorrido conserva las casillas '+
     shared.map(fmt).join(' y ')+' y cambia la tercera ('+
     fmt(removed)+' por '+fmt(added)+'). Es una bifurcación, no la misma forma exacta.'
   };
  }
 }
 return {type:'sin-verificar',
  explanation:'El motor vincula este antecedente, pero no pudimos reconstruir una forma idéntica ni una bifurcación comprobable para este recorrido.'};
}
