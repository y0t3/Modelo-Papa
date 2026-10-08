// Cronología de TRANSFORMACIONES observadas: ningún resultado futuro participa.
// Descriptiva: no introduce votos ni nuevos candidatos al selector 5D.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {VisualMark} from './visualMemory5d';
import {signature} from './visualMemory5d';

type PathView={key:string;source:string;cells:Set<string>;edges:Set<string>;rowMin:number;rowMax:number};
export type ShapeChange={fromDay:number;fromTurn:Turno;toDay:number;toTurn:Turno;relation:'REAPARECE'|'SE DESPLAZA'|'SE RAMIFICA'|'CONVERGE'|'CAMBIA';kind:'vt2'|'vt3'|'vt4';sourceId:string;fromHead:string;toHead:string;fromValue:string;toValue:string;sharedCells:number;sharedEdges:number;fromRoutes:number;toRoutes:number};
export type VisualEvolution={changes:ShapeChange[];turnChanges:number;dayChanges:number;transformed:number;reappeared:number};

function paths(mark:VisualMark):PathView[]{
 return mark.paths.map(p=>{
  const cells=new Set(p.map(c=>c.row+':'+c.col));
  const edges=new Set(p.slice(1).map((c,i)=>p[i].row+':'+p[i].col+'>'+c.row+':'+c.col));
  const rows=p.map(c=>c.row);
  return {key:signature(p),source:mark.sourceId,cells,edges,rowMin:Math.min(...rows),rowMax:Math.max(...rows)};
 });
}
function similarity(a:VisualMark,b:VisualMark){
 const A=paths(a),B=paths(b);
 let sharedCells=0,sharedEdges=0;
 for(const x of A)for(const y of B){
  let cells=0,edges=0;
  for(const c of x.cells)if(y.cells.has(c))cells++;
  for(const e of x.edges)if(y.edges.has(e))edges++;
  if(edges>sharedEdges||(edges===sharedEdges&&cells>sharedCells)){sharedCells=cells;sharedEdges=edges}
 }
 const commonShape=A.some(x=>B.some(y=>x.key===y.key));
 const relation:ShapeChange['relation']=commonShape?'REAPARECE':sharedEdges>0&&B.length>A.length?'SE RAMIFICA':sharedEdges>0&&B.length<A.length?'CONVERGE':sharedEdges>0?'CAMBIA':sharedCells>0?'SE DESPLAZA':'CAMBIA';
 return {sharedCells,sharedEdges,relation};
}
export function analyzeVisualEvolution(marks:VisualMark[],target:Turno):VisualEvolution{
 const moments=new Map<string,VisualMark[]>();
 for(const mark of marks){
  const k=mark.day+':'+TURNOS.indexOf(mark.turn),list=moments.get(k)||[];
  list.push(mark);moments.set(k,list);
 }
 const changes:ShapeChange[]=[];
 // Sólo parejas cronológicas vecinas y misma columna física. No cruzar turnos en un recorrido.
 for(let d=0;d<=5;d++)for(let t=0;t<TURNOS.length;t++){
  const prior=moments.get(d+':'+t)||[];
  const nextKeys:string[]=[];
  if(t+1<TURNOS.length)nextKeys.push(d+':'+(t+1));
  if(d<5)nextKeys.push((d+1)+':'+t);
  for(const k of nextKeys) {
   const later=moments.get(k)||[];
   const [dayString,turnString]=k.split(':');
   for(const a of prior)for(const b of later){
    if(a.kind!==b.kind||a.sourceId!==b.sourceId)continue;
    const sim=similarity(a,b);
    if(sim.sharedCells===0&&sim.relation!=='REAPARECE')continue;
    changes.push({fromDay:d,fromTurn:TURNOS[t],toDay:Number(dayString),toTurn:TURNOS[Number(turnString)],kind:a.kind,sourceId:a.sourceId,fromHead:a.head,toHead:b.head,fromValue:a.value,toValue:b.value,sharedCells:sim.sharedCells,sharedEdges:sim.sharedEdges,fromRoutes:a.paths.length,toRoutes:b.paths.length,relation:sim.relation});
   }
  }
 }
 return {changes,turnChanges:changes.filter(c=>c.toDay===c.fromDay).length,dayChanges:changes.filter(c=>c.toDay>c.fromDay).length,transformed:changes.filter(c=>c.relation!=='REAPARECE').length,reappeared:changes.filter(c=>c.relation==='REAPARECE').length};
}
