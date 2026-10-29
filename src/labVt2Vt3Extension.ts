/**
 * LAB independiente: extender TOP10 VT2 -> VT3 con una cifra a la IZQUIERDA.
 * No altera MV1, AUX, VT4 ni el estado de APK.
 * PRE: solo recibe columnas visibles y rankings de dos cifras preexistentes.
 * Prohibidos los saltos, repetición de celda, cruces entre +11 y combinaciones
 * entre tableros. En AUX sí se permite cruzar los tres turnos adyacentes.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import {cellsFromPlus11} from './paths';
import type {Cell,Path} from './paths';
import type {LaloView} from './motorLalo';
import {reversibleFamily} from './motorLalo';
import {auxiliaryBoard,auxAdjacent,findAuxPaths} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads,AuxCell,AuxPath} from './auxSantiagoNeuquen';
import type {AuxiliarView} from './motorLaloAuxiliar';

export type ExtensionMode='RONDAS'|'CUADRADO'|'FUENTES';
export type Vt2Vt3Trace={
  board:'PLUS11'|'AUX';parent:string;parentRank:number;
  value:string;source:string;cells:{row:number;col:number;digit:string}[];
  squareReady:boolean;
};
export type Vt2Vt3Candidate={
  family:string;rank:number;motherRank:number;mothers:string[];
  sourceCount:number;pathCount:number;squareReady:boolean;
  traces:Vt2Vt3Trace[];
};
export type Vt2Vt3Result={
  board:'PLUS11'|'AUX';mode:ExtensionMode;target:Turno;date:string;
  candidates:Vt2Vt3Candidate[];
  top10:Vt2Vt3Candidate[];
  motherCount:number;
};
const loc=(c:{row:number;col:number})=>c.row+':'+c.col;
const adj=(a:{row:number;col:number},b:{row:number;col:number})=>
  loc(a)!==loc(b)&&Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
const value=(path:{digit:string}[])=>path.map(c=>c.digit).join('');
const sameCells=(a:{row:number;col:number},b:{row:number;col:number})=>
  a.row===b.row&&a.col===b.col;
const legal=(path:{row:number;col:number}[])=>
  path.length===3&&new Set(path.map(loc)).size===3&&
  path.every((c,i)=>i===0||adj(path[i-1],c));
const pathId=(t:Vt2Vt3Trace)=>t.source+'|'+t.cells.map(loc).join('>');
/** Posibilidad REAL de cuarta celda que continúe el recorrido por la izquierda
 * y complete exactamente un bloque 2x2. No puntúa un acierto, solo una figura. */
function isSquareReady<T extends {row:number;col:number}>(path:T[],cells:T[]):boolean{
 const start=path[0];
 for(const c of cells){
  if(path.some(p=>sameCells(p,c))||!adj(c,start))continue;
  const four=[c,...path];
  const minR=Math.min(...four.map(p=>p.row));
  const minC=Math.min(...four.map(p=>p.col));
  if(four.every(p=>p.row>=minR&&p.row<=minR+1&&
    p.col>=minC&&p.col<=minC+1))return true;
 }
 return false;
}
function aggregate(traces:Vt2Vt3Trace[],target:Turno,date:string,
 board:'PLUS11'|'AUX',mode:ExtensionMode,motherCount:number):Vt2Vt3Result{
 const byFamily=new Map<string,Map<string,Vt2Vt3Trace>>();
 for(const t of traces){
  const f=reversibleFamily(t.value),seen=byFamily.get(f)||new Map();
  const k=pathId(t);
  const prior=seen.get(k);
  if(!prior||t.parentRank<prior.parentRank)seen.set(k,t);
  byFamily.set(f,seen);
 }
 const all:Vt2Vt3Candidate[]=[...byFamily].map(([family,m])=>{
  const paths=[...m.values()];
  return {family,rank:0,motherRank:Math.min(...paths.map(t=>t.parentRank)),
    mothers:[...new Set(paths.map(t=>t.parent))],
    sourceCount:new Set(paths.map(t=>t.source)).size,pathCount:paths.length,
    squareReady:paths.some(t=>t.squareReady),traces:paths};
 });
 // Cada candidata ocupa UN cupo, aunque tenga muchos recorridos o madres.
 // Una madre no llena por sí sola todos los puestos: distribuir por rondas.
 const score=(c:Vt2Vt3Candidate):number[]=>mode==='FUENTES'?
  [c.sourceCount,c.pathCount,Number(c.squareReady)]:
  mode==='CUADRADO'?
  [Number(c.squareReady),c.sourceCount,c.pathCount]:
  [c.sourceCount,c.pathCount,Number(c.squareReady)];
 const compare=(a:Vt2Vt3Candidate,b:Vt2Vt3Candidate)=>{
  const x=score(a),y=score(b);
  for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];
  return a.family.localeCompare(b.family);
 };
 let ordered:Vt2Vt3Candidate[];
 if(mode==='FUENTES'){
  ordered=[...all].sort((a,b)=>compare(a,b)||
   a.motherRank-b.motherRank||a.family.localeCompare(b.family));
 }else{
  const buckets=Array.from({length:motherCount},(_,idx)=>
   all.filter(c=>c.traces.some(t=>t.parentRank===idx+1)).sort(compare));
  ordered=[];const selected=new Set<string>();
  for(let round=0;round<all.length;round++){
   let any=false;
   for(const bucket of buckets){
    const next=bucket.filter(c=>!selected.has(c.family))[round===0?0:0];
    if(!next)continue;
    any=true;selected.add(next.family);ordered.push(next);
   }
   if(!any)break;
  }
  for(const left of [...all].sort(compare))
   if(!selected.has(left.family))ordered.push(left);
 }
 const candidates=ordered.map((c,i)=>({...c,rank:i+1}));
 return {board,mode,target,date,motherCount,candidates,top10:candidates.slice(0,10)};
}
export function extendPlusVt2ToVt3(sheet:DailySheet,view:LaloView,
 mode:ExtensionMode='RONDAS'):Vt2Vt3Result{
 const target=view.target,idx=TURNOS.indexOf(target);
 if(idx<0)throw Error('Turno desconocido');
 const visible=sheet.columns.slice(0,idx+1);
 const traces:Vt2Vt3Trace[]=[];
 const moms=view.ranks.vt2.slice(0,10);
 for(const mother of moms){
  for(const route of mother.paths){
   const column=visible.find(c=>c.id===route.sourceId);
   if(!column||route.path.length!==2)continue;
   const cells=cellsFromPlus11(column.values);
   for(const pair of [route.path,[...route.path].reverse()]){
    if(!pair.every(c=>cells.some(x=>sameCells(x,c)&&x.digit===c.digit))||
      !adj(pair[0],pair[1])||
      !mother.family.split('/').includes(value(pair)))continue;
    for(const third of cells){
     if(pair.some(p=>sameCells(p,third))||!adj(third,pair[0]))continue;
     const three=[third,...pair];
     if(!legal(three))continue;
     traces.push({board:'PLUS11',parent:mother.family,parentRank:mother.rank,
      value:value(three),source:column.id,
      cells:three.map(c=>({row:c.row,col:c.col,digit:c.digit})),
      squareReady:isSquareReady(three,cells)});
    }
   }
  }
 }
 return aggregate(traces,target,view.date,'PLUS11',mode,moms.length);
}
export function extendAuxVt2ToVt3(date:string,target:Turno,
 heads:AuxiliaryHeads,view:AuxiliarView,
 mode:ExtensionMode='RONDAS'):Vt2Vt3Result{
 if(view.turn!==target||view.date!==date)
  throw Error('Vista AUX no corresponde al turno y fecha PRE');
 const board=auxiliaryBoard(heads,target);
 const traces:Vt2Vt3Trace[]=[];
 const moms=view.ranks[2].slice(0,10);
 for(const mother of moms){
  const pairPaths:AuxPath[]=mother.family.split('/')
   .flatMap(v=>findAuxPaths(board,v));
  for(const pair of pairPaths){
   for(const third of board.cells){
    if(pair.some(p=>sameCells(p,third))||!auxAdjacent(third,pair[0]))continue;
    const three:AuxCell[]=[third,...pair];
    if(!legal(three))continue;
    traces.push({board:'AUX',parent:mother.family,parentRank:mother.rank,
     value:value(three),source:[...new Set(three.map(c=>c.source))].sort().join('+'),
     cells:three.map(c=>({row:c.row,col:c.col,digit:c.digit})),
     squareReady:isSquareReady(three,board.cells)});
   }
  }
 }
 return aggregate(traces,target,date,'AUX',mode,moms.length);
}
export function evaluateVt3(result:Vt2Vt3Result,heads:string[],top:3|5|10=10){
 const rows=result.top10.slice(0,top);
 const families=new Set(rows.map(r=>r.family));
 const observed=heads.filter(h=>/^\d{4}$/.test(h));
 return {
  byFamily:observed.filter(h=>families.has(reversibleFamily(h.slice(-3)))).length,
  exactPhysical:observed.filter(h=>rows.some(r=>r.traces.some(
   t=>t.value===h.slice(-3)))).length
 };
}
