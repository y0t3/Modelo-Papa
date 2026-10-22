/**
 * HOJA AUXILIAR DEL PADRE · Santiago / Neuquén.
 * Geometría totalmente independiente del tablero +11.
 *
 * 2 FILAS x 12 COLUMNAS: 4 cifras por turno (Previa, Primera, Matutino).
 * Las tres franjas están pegadas: contacto horizontal, vertical o diagonal
 * también vale al atravesar una frontera entre turnos.
 * Vacíos no tienen celdas: ni puentes invisibles ni saltos.
 *
 * Ninguna cabeza de Ciudad/Provincia/etc. genera tablero. Solamente las
 * cabezas reales de Santiago/Neuquén de AYER alimentan sus filas.
 * Las tres franjas están disponibles antes de Previa del día objetivo.
 * El cotejo POST marca los recorridos que explican las cabezas de las seis
 * jurisdicciones observadas (Ciudad/Provincia/Córdoba/Santa Fe/Entre Ríos/
 * Montevideo). El cálculo PRE no recibe cabeza objetivo.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
export const AUX_SOURCE_TURNS=['Previa','Primera','Matutino'] as const;
export type AuxSourceTurn=typeof AUX_SOURCE_TURNS[number];
export const AUX_ROWS=['Santiago','Neuquen'] as const;
export type AuxRow=typeof AUX_ROWS[number];
export type AuxiliaryHeads=Record<AuxSourceTurn,Record<AuxRow,string>>;
export type AuxCell={row:0|1;col:number;digit:string;source:AuxSourceTurn};
export type AuxPath=AuxCell[];
export type AuxiliaryBoard={
 target:Turno;visibleTurns:AuxSourceTurn[];
 input:AuxiliaryHeads;
 cells:AuxCell[];columns:{turn:AuxSourceTurn;heads:Record<AuxRow,string>;
  visible:boolean}[];
};
export type AuxFamily={
 family:string; values:string[];
 paths:AuxPath[];turnCount:number;crossTurnPaths:number;
 turnSources:AuxSourceTurn[];
};
export const emptyAuxiliaryHeads=():AuxiliaryHeads=>({
 Previa:{Santiago:'----',Neuquen:'----'},
 Primera:{Santiago:'----',Neuquen:'----'},
 Matutino:{Santiago:'----',Neuquen:'----'}
});
const valid=(v:string)=>/^\d{4}$/.test(v);
const reverse=(x:string)=>[...x].reverse().join('');
export const auxFamily=(x:string)=>[x,reverse(x)].sort().join('/');
export function auxiliaryBefore(target:Turno):AuxSourceTurn[]{
 if(!TURNOS.includes(target))throw Error('Turno objetivo inválido');
 // Las tres franjas vienen de AYER, no de sorteos pendientes de hoy.
 return [...AUX_SOURCE_TURNS];
}
export function auxiliaryBoard(heads:AuxiliaryHeads,target:Turno):AuxiliaryBoard{
 const allowed=auxiliaryBefore(target),cells:AuxCell[]=[];
 const columns=AUX_SOURCE_TURNS.map((turn,t)=>{
  const visible=allowed.includes(turn);
  const values=heads[turn];
  if(visible)AUX_ROWS.forEach((row,r)=>{
   const head=values[row];
   if(!valid(head))return;
   [...head].forEach((digit,pos)=>cells.push({
    row:r as 0|1,col:t*4+pos,digit,source:turn
   }));
  });
  return {turn,heads:{...values},visible};
 });
 return {target,visibleTurns:allowed,input:heads,cells,columns};
}
export const auxAdjacent=(a:AuxCell,b:AuxCell)=>
 !(a.row===b.row&&a.col===b.col)&&
 Math.abs(a.row-b.row)<=1&&Math.abs(a.col-b.col)<=1;
export const auxPathKey=(p:AuxPath)=>p.map(c=>c.row+':'+c.col).join('>');
export const auxCanonicalPath=(p:AuxPath)=>
 [auxPathKey(p),auxPathKey([...p].reverse())].sort()[0];
export function findAuxPaths(board:AuxiliaryBoard,value:string):AuxPath[]{
 if(!/^\d{2,4}$/.test(value))return [];
 const paths:AuxPath[]=[];
 const go=(path:AuxPath)=>{
  if(path.length===value.length){paths.push(path);return;}
  for(const c of board.cells){
   if(c.digit!==value[path.length]||path.some(p=>p.row===c.row&&p.col===c.col))continue;
   if(!auxAdjacent(path[path.length-1],c))continue;
   go([...path,c]);
  }
 };
 for(const c of board.cells)if(c.digit===value[0])go([c]);
 return paths;
}
export function findAuxFamily(board:AuxiliaryBoard,value:string):AuxFamily{
 if(!/^\d{2,3}$/.test(value))throw Error('Familia auxiliar requiere VT2 o VT3');
 const family=auxFamily(value),members=[...new Set(family.split('/'))];
 const paths=members.flatMap(v=>findAuxPaths(board,v));
 const used=new Set(paths.flatMap(p=>p.map(c=>c.source)));
 return {family,values:members,paths,
  turnCount:used.size,
  crossTurnPaths:paths.filter(p=>new Set(p.map(c=>c.source)).size>=2).length,
  turnSources:AUX_SOURCE_TURNS.filter(t=>used.has(t))};
}
export function collectAuxFamilies(board:AuxiliaryBoard,n:2|3):AuxFamily[]{
 const all=enumerateAuxPaths(board,n),families=new Map<string,AuxPath[]>();
 for(const path of all){
  const f=auxFamily(path.map(c=>c.digit).join(''));
  const arr=families.get(f)||[];arr.push(path);families.set(f,arr);
 }
 return [...families].map(([family,paths])=>{
  const used=new Set(paths.flatMap(p=>p.map(c=>c.source)));
  return {family,values:[...new Set(family.split('/'))],paths,
   turnCount:used.size,
   crossTurnPaths:paths.filter(p=>new Set(p.map(c=>c.source)).size>=2).length,
   turnSources:AUX_SOURCE_TURNS.filter(t=>used.has(t))
  };
 });
}
export function enumerateAuxPaths(board:AuxiliaryBoard,n:2|3|4):AuxPath[]{
 const out:AuxPath[]=[];
 const visit=(path:AuxPath)=>{
  if(path.length===n){out.push(path);return;}
  const last=path[path.length-1];
  for(const c of board.cells){
   if(path.some(p=>p.row===c.row&&p.col===c.col)||!auxAdjacent(last,c))continue;
   visit([...path,c]);
  }
 };
 for(const c of board.cells)visit([c]);
 return out;
}
export const serializeAuxPath=(p:AuxPath)=>({
 value:p.map(c=>c.digit).join(''),
 sourceTurns:[...new Set(p.map(c=>c.source))],
 crossesTurn:new Set(p.map(c=>c.source)).size>1,
 cells:p.map(c=>({row:c.row,col:c.col,source:c.source,digit:c.digit}))
});
