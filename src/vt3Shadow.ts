// Segundo lector puramente geométrico. EXPERIMENTAL: no modifica el ranking Lalo.
// Imita la política exploratoria F_D1 (mismas fuentes y forma física, prioridad a
// desplazamiento, luego eventos de raíces verificadas). No usa cabezas objetivo.
import type {DailySheet,SourceId} from './sheet';
import type {Turno} from './domain';
import {TURNOS} from './domain';
import {cellsFromPlus11} from './paths';
import type {Cell,Path} from './paths';
import {reversibleFamily} from './motorLalo';
import type {LaloHistorical,LaloView,RootRef} from './motorLalo';

export type ShadowMother={
 family:string; value:string; source:SourceId; cells:string[];
 anchored:boolean; rootEvents:number; d1Distance:number; d7Distance:number;
};
export type ShadowSelection={target:Turno;method:'GEO_COMPLETA_F_D1';top:ShadowMother[];availableFamilies:number;routes:number};
const sources:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const id=(c:{row:number;col:number})=>c.row+':'+c.col;
const points=(cells:string[])=>cells.map(c=>c.split(':').map(Number));
const geom=(cells:string[]):string=>{
 const st=(xy:number[][])=>xy.slice(1).map((q,i)=>(q[0]-xy[i][0])+','+(q[1]-xy[i][1])).join(';');
 const ps=points(cells);
 return [st(ps),st([...ps].reverse())].sort()[0];
};
const position=(cells:string[])=>{const p=points(cells);
 return {row:Math.min(...p.map(x=>x[0])),col:Math.min(...p.map(x=>x[1]))};
};
const canon=(cells:string[])=>[cells.join('>'),[...cells].reverse().join('>')].sort()[0];
const validNext=(a:Cell,b:Cell)=>a!==b&&Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
export function allPhysicalVt3(values:string[]):Path[]{
 const cs=cellsFromPlus11(values),out:Path[]=[];
 function go(path:Path){
  if(path.length===3){out.push(path);return;}
  const last=path[path.length-1];
  for(const p of cs)if(!path.includes(p)&&validNext(last,p))go([...path,p]);
 }
 for(const p of cs)go([p]);
 const seen=new Set<string>();
 return out.filter(p=>{
  const k=canon(p.map(id));
  if(seen.has(k))return false;
  seen.add(k);return true;
 });
}
type Position={row:number;col:number};
type Physical={
 source:SourceId;shape:string;pos:Position;cells:string[];key:string;
 family:string;value:string;
};
const frame=(sheet:DailySheet,turn:Turno):Physical[]=>{
 const n=TURNOS.indexOf(turn);
 const results:Physical[]=[];
 for(const col of sheet.columns.slice(0,n+1)){
  for(const path of allPhysicalVt3(col.values)){
   const cells=path.map(id),value=path.map(x=>x.digit).join('');
   results.push({source:col.id,shape:geom(cells),pos:position(cells),
    cells,key:col.id+'|'+canon(cells),value,family:reversibleFamily(value)});
  }
 }
 return results;
};
type Referent={shape:string;source:SourceId;pos:Position};
const shift=(a:Position,b:Position)=>Math.abs(a.row-b.row)+Math.abs(a.col-b.col);
const keyOf=(x:{source:SourceId;shape:string})=>x.source+'|'+x.shape;
const put=(m:Map<string,Referent[]>,r:Referent)=>{
 const k=keyOf(r),a=m.get(k)||[];a.push(r);m.set(k,a);
};
const makeReference=(sheet:DailySheet,turn:Turno)=>{
 const m=new Map<string,Referent[]>();
 for(const r of frame(sheet,turn))put(m,r);
 return m;
};
const context=(p:Physical,m:Map<string,Referent[]>)=>{
 let far=0,maxDist=0;
 for(const old of m.get(keyOf(p))||[]){
  const diff=shift(p.pos,old.pos);maxDist=Math.max(maxDist,diff);
  if(Math.abs(p.pos.row-old.pos.row)>=2)far=1;
 }
 return {far,maxDist};
};
function rootEvidence(p:Physical,m:Map<string,{ref:Referent;event:string}[]>){
 let far=0,maxDist=0;
 const events=new Set<string>();
 for(const root of m.get(keyOf(p))||[]){
  events.add(root.event);
  const diff=shift(p.pos,root.ref.pos);
  maxDist=Math.max(maxDist,diff);
  if(Math.abs(p.pos.row-root.ref.pos.row)>=2)far=1;
 }
 return {far,maxDist,events:events.size};
}
export function buildVt3Shadow(sheet:DailySheet,date:string,target:Turno,
 historical:LaloHistorical[],view:LaloView):ShadowSelection{
 if(view.target!==target||view.date!==date)throw Error('Vista oficial y sombra VT3 deben representar el mismo PRE');
 if(historical.some(h=>h.date>=date))throw Error('La sombra no acepta referencias futuras');
 const d1=historical.find(h=>h.period==='D−1');
 const d7=historical.find(h=>h.period==='D−7');
 const older1=d1?makeReference(d1.sheet,target):new Map<string,Referent[]>();
 const older7=d7?makeReference(d7.sheet,target):new Map<string,Referent[]>();
 const roots=new Map<string,{ref:Referent;event:string}[]>();
 for(const root of view.roots){
  if(!root.oldCells||root.oldCells.length!==3)continue;
  const v:{ref:Referent;event:string}={
   ref:{source:root.sourceId,shape:geom(root.oldCells),pos:position(root.oldCells)},
   event:[root.date,root.oldTurn,root.jurisdiction,root.head].join('|')};
  const k=keyOf(v.ref),arr=roots.get(k)||[];arr.push(v);roots.set(k,arr);
 }
 const pool=frame(sheet,target);
 const sorted=pool.map(p=>{
  const a=context(p,older1),b=context(p,older7),c=rootEvidence(p,roots);
  const order=[a.far,a.maxDist,b.far,b.maxDist,c.far,c.maxDist,c.events];
  return {...p,order,anchored:c.events>0,d1Distance:a.maxDist,d7Distance:b.maxDist,rootEvents:c.events};
 }).sort((a,b)=>{
  for(let k=0;k<a.order.length;k++)if(a.order[k]!==b.order[k])return b.order[k]-a.order[k];
  return sources.indexOf(a.source)-sources.indexOf(b.source)||
    a.pos.row-b.pos.row||a.pos.col-b.pos.col||a.key.localeCompare(b.key);
 });
 const top:ShadowMother[]=[],seen=new Set<string>();
 for(const p of sorted){
  if(seen.has(p.family))continue;
  seen.add(p.family);
  if(top.length<10)top.push({family:p.family,value:p.value,source:p.source,
   cells:p.cells,anchored:p.anchored,rootEvents:p.rootEvents,
   d1Distance:p.d1Distance,d7Distance:p.d7Distance});
 }
 return {target,method:'GEO_COMPLETA_F_D1',top,
  availableFamilies:seen.size,routes:pool.length};
}
