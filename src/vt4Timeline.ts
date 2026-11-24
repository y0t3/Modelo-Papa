/** Observación retrospectiva de los mismos bloques físicos de un VT4.
 * No puntúa, no modifica el ranking ni consulta cabezas objetivo.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
import {AUX_SOURCE_TURNS} from './auxSantiagoNeuquen';
import type {AuxPath} from './auxSantiagoNeuquen';
import type {LaloRoute} from './motorLalo';
import type {DailySheet} from './sheet';

type Cell={row:number;col:number};
type Birth={key:string;at:number};
export type TimelineEntry={turn:Turno;blocks:number;state:'Ausente'|'Aparece'|'Suma bloques'|'Sin cambios'};
const block=(p:Cell[])=>p.map(c=>c.row+':'+c.col).sort().join('|');

export function timelineFromBirths(births:Birth[],target:Turno):TimelineEntry[]{
 const end=TURNOS.indexOf(target);
 const unique=new Map<string,number>();
 for(const {key,at} of births){
  if(!Number.isInteger(at)||at<0||at>end)continue;
  unique.set(key,Math.min(unique.get(key)??at,at));
 }
 let previous=0;
 return TURNOS.slice(0,end+1).map((turn,i)=>{
  const blocks=[...unique.values()].filter(at=>at<=i).length;
  const state:TimelineEntry['state']=!blocks?'Ausente':!previous?'Aparece':blocks>previous?'Suma bloques':'Sin cambios';
  previous=blocks;
  return {turn,blocks,state};
 });
}
export function plusVt4Timeline(sheet:DailySheet,routes:LaloRoute[],target:Turno){
 return timelineFromBirths(routes.map(r=>({
  key:r.sourceId+'|'+block(r.path),at:sheet.columns.findIndex(c=>c.id===r.sourceId)
 })),target);
}
export function auxVt4Timeline(routes:AuxPath[],target:Turno,mode:'ayer'|'hoy'){
 return timelineFromBirths(routes.map(p=>({
  key:block(p),at:mode==='ayer'?0:1+Math.max(...p.map(c=>AUX_SOURCE_TURNS.indexOf(c.source)))
 })),target);
}
export function unchangedSince(entries:TimelineEntry[]):Turno|null{
 const last=entries[entries.length-1];
 if(!last?.blocks)return null;
 return entries.find(e=>e.blocks===last.blocks)?.turn??null;
}
