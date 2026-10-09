// Seguimiento de GEOMETRIAS GANADORAS, no de categorias espaciales.
// Solo reconstruye caminos ya marcados; no fabrica rutas sobre tableros vacios.
// Los turnos se cuentan una vez por episodio y se excluye el turno objetivo.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {DatedSheet,CycleKind} from './cycle7d';
import type {MarkedPath} from './markedSheet7d';
import {reconstructMarkedMoments,priorMarkedMoments} from './markedSheet7d';
export type LineageRelation='MISMA_RUTA'|'MISMO_MOVIMIENTO'|'RAMIFICA'|'SIN_RELACION';
export type RouteLineage={kind:CycleKind;sourceId:SourceId;signature:string;coordinates:string;firstMoment:string;lastMoment:string;confirmedDraws:number;exactDraws:number;motionDraws:number;branchDraws:number;daysSinceLast:number;status:'RECIENTE'|'EN_REPOSO';route:MarkedPath['route']};
export type RouteLineageReport={date:string;turn:Turno;windowDays:number;lineages:RouteLineage[];notice:string};
const coords=(m:MarkedPath)=>m.cells.join('>');
const motion=(m:MarkedPath)=>m.route.slice(1).map((c,i)=>(c.row-m.route[i].row)+','+(c.col-m.route[i].col)).join(';');
const moment=(m:MarkedPath)=>m.date+'|'+String(TURNOS.indexOf(m.turn));
const days=(a:string,b:string)=>Math.round((Date.parse(a+'T12:00:00Z')-Date.parse(b+'T12:00:00Z'))/86400000);
export function relationOf(a:MarkedPath,b:MarkedPath):LineageRelation{
 if(a.kind!==b.kind||a.sourceId!==b.sourceId)return 'SIN_RELACION';
 if(coords(a)===coords(b))return 'MISMA_RUTA';
 if(motion(a)===motion(b))return 'MISMO_MOVIMIENTO';
 const shared=a.cells.some(x=>b.cells.includes(x));
 const differentiated=a.edges.some(x=>!b.edges.includes(x))&&b.edges.some(x=>!a.edges.includes(x));
 return shared&&differentiated?'RAMIFICA':'SIN_RELACION';
}
export function readRouteLineages7D(history:DatedSheet[],current:DailySheet,date:string,turn:Turno):RouteLineageReport{
 const at=TURNOS.indexOf(turn);if(at<0)throw Error('Turno invalido');
 const safe:DailySheet={...current,matches:Object.fromEntries(TURNOS.map((t,i)=>[t,i<at?(current.matches[t]||[]):[]]))};
 const past=priorMarkedMoments(reconstructMarkedMoments([...history.filter(x=>x.date<date),{date,sheet:safe}]),date,turn);
 const dates=[...new Set(past.map(m=>m.date))].sort().slice(-6);
 const marks=past.filter(m=>dates.includes(m.date)).flatMap(m=>m.marks);
 const ordered=[...marks].sort((a,b)=>moment(a).localeCompare(moment(b)));
 const groups=new Map<string,MarkedPath[]>();
 for(const m of ordered){
  const id=[m.kind,m.sourceId,coords(m)].join('|');
  groups.set(id,[...(groups.get(id)||[]),m]);
 }
 const lineages:RouteLineage[]=[];
 for(const group of groups.values()){
  const origin=group[0];
  const related=ordered.filter(m=>relationOf(origin,m)!=='SIN_RELACION');
  const unique=(predicate:(m:MarkedPath)=>boolean)=>new Set(related.filter(predicate).map(moment)).size;
  const last=related[related.length-1];
  lineages.push({kind:origin.kind,sourceId:origin.sourceId,signature:motion(origin),coordinates:coords(origin),
   firstMoment:moment(origin),lastMoment:moment(last),confirmedDraws:new Set(related.map(moment)).size,
   exactDraws:unique(m=>relationOf(origin,m)==='MISMA_RUTA'),
   motionDraws:unique(m=>relationOf(origin,m)==='MISMO_MOVIMIENTO'),
   branchDraws:unique(m=>relationOf(origin,m)==='RAMIFICA'),
   daysSinceLast:days(date,last.date),status:days(date,last.date)<=2?'RECIENTE':'EN_REPOSO',route:origin.route});
 }
 return {date,turn,windowDays:dates.length,lineages:lineages.sort((a,b)=>b.confirmedDraws-a.confirmedDraws||a.coordinates.localeCompare(b.coordinates)),
 notice:'Relaciones geometricas descriptivas de rutas ganadoras; reposo no significa muerte. Un sorteo se cuenta una vez por linaje, pero los linajes superpuestos no son observaciones independientes.'};
}
