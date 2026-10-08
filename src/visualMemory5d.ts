// Memoria visual 5D: observación descriptiva de marcas comprobadas.
// No genera ni puntúa candidatos; no utiliza resultados del turno objetivo.
import type {DailySheet,SourceId} from './sheet';
import type {Turno} from './domain';
import {TURNOS} from './domain';
import type {Path} from './paths';
export type VisualMark={day:number;turn:Turno;sourceId:SourceId;head:string;kind:'vt2'|'vt3'|'vt4';value:string;paths:Path[]};
export type VisualMoment={day:number;turn:Turno;marks:number;heads:number;routes:number};
export type VisualGeometry={kind:'vt2'|'vt3'|'vt4';signature:string;days:number[];turns:Turno[];occurrences:number;lastDay:number};
export type VisualTransition={day:number;turn:Turno;persistingColumns:number;newColumns:number;newMatches:number;newRoutes:number;newRoutesOnOldColumns:number;newRoutesOnNewColumn:number;repeatedShapesFromPreviousTurn:number};
export type VisualMemory={transitions:VisualTransition[];marks:VisualMark[];timeline:VisualMoment[];geometries:VisualGeometry[];overlapCells:number;branchCells:number;convergenceCells:number;vt2:number;vt3:number;vt4:number;sequentialTurnLinks:number;sequentialDayLinks:number};
export const signature=(p:Path)=>p.slice(1).map((cell,i)=>[cell.row-p[i].row,cell.col-p[i].col].join(',')).join(';');
const id=(p:Path[number],sourceId:SourceId)=>sourceId+':'+p.row+':'+p.col;
export function buildVisualMemory(current:DailySheet,olderOldestFirst:DailySheet[],target:Turno):VisualMemory{
 const sheets=[...olderOldestFirst.slice(-5),current],marks:VisualMark[]=[],timeline:VisualMoment[]=[];
 sheets.forEach((sheet,day)=>{
  const turns=day===sheets.length-1?TURNOS.slice(0,TURNOS.indexOf(target)):TURNOS;
  for(const turn of turns){
   let count=0,heads=0,routes=0;
   for(const match of sheet.matches[turn]||[]){
    if(!match.hits.length)continue;
    heads++;
    for(const h of match.hits){
     marks.push({day,turn,sourceId:h.sourceId,head:match.cabeza,kind:h.kind,value:h.value,paths:h.paths});
     count++;routes+=h.paths.length;
    }
   }
   timeline.push({day,turn,marks:count,heads,routes});
  }
 });
 const map=new Map<string,{kind:VisualGeometry['kind'];signature:string;days:Set<number>;turns:Set<Turno>;occurrences:Set<string>;lastDay:number}>();
 let overlapCells=0,branchCells=0,convergenceCells=0;
 for(const sheetDay of [...new Set(marks.map(m=>m.day))]){
  const local=marks.filter(m=>m.day===sheetDay),cellOwners=new Map<string,Set<string>>(),outgoing=new Map<string,Set<string>>(),incoming=new Map<string,Set<string>>();
  for(const mark of local){
   mark.paths.forEach((path,pi)=>{
    const s=signature(path),k=mark.kind+'|'+mark.sourceId+'|'+s;
    let g=map.get(k);if(!g){g={kind:mark.kind,signature:s,days:new Set(),turns:new Set(),occurrences:new Set(),lastDay:sheetDay};map.set(k,g)}
    g.days.add(sheetDay);g.turns.add(mark.turn);g.occurrences.add(sheetDay+'|'+mark.turn+'|'+mark.head+'|'+mark.sourceId);g.lastDay=Math.max(g.lastDay,sheetDay);
    // Agrupar todas las rutas alternativas de una misma cabeza como UNA evidencia,
    // pero conservar sus distintas celdas y conexiones.
    const owner=sheetDay+'|'+mark.turn+'|'+mark.head+'|'+mark.kind+'|'+mark.sourceId;
    for(let i=0;i<path.length;i++){
     const a=id(path[i],mark.sourceId),owners=cellOwners.get(a)||new Set<string>();owners.add(owner);cellOwners.set(a,owners);
     if(i+1<path.length){
      const b=id(path[i+1],mark.sourceId);
      const outs=outgoing.get(a)||new Set<string>();outs.add(b);outgoing.set(a,outs);
      const ins=incoming.get(b)||new Set<string>();ins.add(a);incoming.set(b,ins);
     }
    }
   });
  }
  overlapCells+=[...cellOwners.values()].filter(x=>x.size>1).length;
  branchCells+=[...outgoing.values()].filter(x=>x.size>1).length;
  convergenceCells+=[...incoming.values()].filter(x=>x.size>1).length;
 }
 const transitions:VisualTransition[]=[];
 for(let day=0;day<sheets.length;day++){
  const sheet=sheets[day],limit=day===sheets.length-1?TURNOS.indexOf(target):TURNOS.length;
  for(let ti=0;ti<limit;ti++){
   const turn=TURNOS[ti],available=sheet.columns.slice(0,ti+1);
   const prior=sheet.columns.slice(0,ti);
   const fresh=marks.filter(m=>m.day===day&&m.turn===turn);
   const previous=ti?marks.filter(m=>m.day===day&&m.turn===TURNOS[ti-1]):[];
   const previousShapes=new Set(previous.flatMap(m=>m.paths.map(p=>m.kind+"|"+m.sourceId+"|"+signature(p))));
   const freshShapes=new Set(fresh.flatMap(m=>m.paths.map(p=>m.kind+"|"+m.sourceId+"|"+signature(p))));
   transitions.push({day,turn,persistingColumns:prior.length,newColumns:available.length-prior.length,newMatches:new Set(fresh.map(m=>m.head+"|"+m.sourceId)).size,newRoutes:fresh.reduce((n,m)=>n+m.paths.length,0),newRoutesOnOldColumns:fresh.filter(m=>prior.some(c=>c.id===m.sourceId)).reduce((n,m)=>n+m.paths.length,0),newRoutesOnNewColumn:fresh.filter(m=>m.sourceId===available[available.length-1]?.id).reduce((n,m)=>n+m.paths.length,0),repeatedShapesFromPreviousTurn:[...freshShapes].filter(x=>previousShapes.has(x)).length});
  }
 }
 const geometries=[...map.values()].map(g=>({kind:g.kind,signature:g.signature,days:[...g.days].sort((a,b)=>a-b),turns:[...g.turns],occurrences:g.occurrences.size,lastDay:g.lastDay})).sort((a,b)=>b.days.length-a.days.length||b.lastDay-a.lastDay||a.signature.localeCompare(b.signature));
 let sequentialTurnLinks=0,sequentialDayLinks=0;
 const signaturesByMoment=new Map<string,Set<string>>();
 for(const mark of marks){const k=mark.day+'|'+TURNOS.indexOf(mark.turn),s=signaturesByMoment.get(k)||new Set<string>();mark.paths.forEach(p=>s.add(mark.kind+'|'+mark.sourceId+'|'+signature(p)));signaturesByMoment.set(k,s)}
 for(let day=0;day<sheets.length;day++)for(let ti=0;ti<TURNOS.length;ti++){
  const s=signaturesByMoment.get(day+'|'+ti);if(!s)continue;
  const next=signaturesByMoment.get(day+'|'+(ti+1));if(next&&[...s].some(v=>next.has(v)))sequentialTurnLinks++;
  const tomorrow=signaturesByMoment.get((day+1)+'|'+ti);if(tomorrow&&[...s].some(v=>tomorrow.has(v)))sequentialDayLinks++;
 }
 return {transitions,marks,timeline,geometries,overlapCells,branchCells,convergenceCells,vt2:marks.filter(m=>m.kind==='vt2').length,vt3:marks.filter(m=>m.kind==='vt3').length,vt4:marks.filter(m=>m.kind==='vt4').length,sequentialTurnLinks,sequentialDayLinks};
}
