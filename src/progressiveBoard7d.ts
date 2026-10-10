// Modelo Papá — observador causal de la tabla +11 progresiva.
// La base Nocturna +11 existe antes de Previa. Tras cada turno, su nueva
// columna +11 se incorpora a la misma hoja para interpretar el siguiente.
// D−7 es memoria opcional, NO fuente obligatoria ni filtro de candidatos.
// Observa geometrías físicas de hojas y coincidencias YA conocidas;
// no genera, ordena ni recomienda apuestas.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DatedSheet} from './cycle7d';
import type {DailySheet,SourceId} from './sheet';
import {reconstructMarkedMoments} from './markedSheet7d';
import type {MarkedMoment,MarkedPath} from './markedSheet7d';
import {freezeBeforeTurn7D} from './causalReplay7d';

type Kind='vt2'|'vt3'|'vt4';
export type ProgressiveMark7D={
 date:string;winningTurn:Turno;kind:Kind;sourceId:SourceId;
 head:string;value:string;cells:string[];shape:string;
 provenance:'RECONSTRUIDA_DE_MATCHES';
};
export type FormRelation7D={
 kind:Kind;shape:string;winningTurns:Turno[];sourceIds:SourceId[];
 episodes:number;exampleRoutes:string[];
};
export type HistoricalFormLink7D={
 kind:Kind;shape:string;previousDate:string;currentTurns:Turno[];
 previousTurns:Turno[];currentSourceIds:SourceId[];
 previousSourceIds:SourceId[];sameSourceAvailable:boolean;
};
export type ProgressiveBoard7D={
 date:string;target:Turno;completedTurns:Turno[];
 visibleColumns:{id:SourceId;label:string;values:string[]}[];
 marksToday:ProgressiveMark7D[];
 lastDraw?:{date:string;marks:ProgressiveMark7D[]};
 previousWeek?:{date:string;marks:ProgressiveMark7D[]};
 crossTurnSameDay:FormRelation7D[];
 crossColumnSameDay:FormRelation7D[];
 linksToLastDraw:HistoricalFormLink7D[];
 linksToPreviousWeek:HistoricalFormLink7D[];
 counts:{completedTurns:number;visibleColumns:number;
  vt2:number;vt3:number;vt4:number;uniqueForms:number};
 status:'OBSERVACION_NO_PREDICTIVA';
 explanation:string;
};
const minus7=(date:string)=>{
 const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-7);
 return d.toISOString().slice(0,10);
};
const signature=(route:MarkedPath['route'])=>route.slice(1).map((p,i)=>
 (p.row-route[i].row)+','+(p.col-route[i].col)).join('>');
const flatten=(moments:MarkedMoment[]):ProgressiveMark7D[]=>moments.flatMap(m=>
 m.marks.map(p=>({date:m.date,winningTurn:m.turn,
  kind:p.kind,sourceId:p.sourceId,head:p.head,value:p.value,
  cells:[...p.cells],shape:signature(p.route),provenance:p.provenance
 })));
const unique=<T>(a:T[])=>[...new Set(a)];
const groupKey=(m:ProgressiveMark7D)=>m.kind+'|'+m.shape;
function relations(marks:ProgressiveMark7D[],axis:'TURNOS'|'COLUMNAS'):FormRelation7D[]{
 const groups=new Map<string,ProgressiveMark7D[]>();
 for(const m of marks)groups.set(groupKey(m),[...(groups.get(groupKey(m))||[]),m]);
 const out:FormRelation7D[]=[];
 for(const a of groups.values()){
  const turns=unique(a.map(x=>x.winningTurn));
  const sources=unique(a.map(x=>x.sourceId));
  if((axis==='TURNOS'?turns.length:sources.length)<2)continue;
  out.push({kind:a[0].kind,shape:a[0].shape,
   winningTurns:turns.sort((x,y)=>TURNOS.indexOf(x)-TURNOS.indexOf(y)),
   sourceIds:sources,episodes:unique(a.map(x=>x.date+'|'+x.winningTurn)).length,
   exampleRoutes:unique(a.map(x=>x.sourceId+'|'+x.cells.join('>'))).slice(0,12)});
 }
 return out.sort((a,b)=>b.episodes-a.episodes||a.kind.localeCompare(b.kind)||
  a.shape.localeCompare(b.shape));
}
function links(today:ProgressiveMark7D[],old:ProgressiveMark7D[],date:string):
 HistoricalFormLink7D[]{
 const byOld=new Map<string,ProgressiveMark7D[]>();
 for(const m of old)byOld.set(groupKey(m),[...(byOld.get(groupKey(m))||[]),m]);
 const todayGroups=new Map<string,ProgressiveMark7D[]>();
 for(const m of today)todayGroups.set(groupKey(m),[...(todayGroups.get(groupKey(m))||[]),m]);
 const out:HistoricalFormLink7D[]=[];
 for(const [key,newMarks] of todayGroups){
  const oldMarks=byOld.get(key);if(!oldMarks)continue;
  const curSources=unique(newMarks.map(x=>x.sourceId));
  const oldSources=unique(oldMarks.map(x=>x.sourceId));
  out.push({kind:newMarks[0].kind,shape:newMarks[0].shape,previousDate:date,
   currentTurns:unique(newMarks.map(x=>x.winningTurn)),
   previousTurns:unique(oldMarks.map(x=>x.winningTurn)),
   currentSourceIds:curSources,previousSourceIds:oldSources,
   sameSourceAvailable:curSources.some(x=>oldSources.includes(x))});
 }
 return out.sort((a,b)=>a.kind.localeCompare(b.kind)||a.shape.localeCompare(b.shape));
}
/** Lee TODAS las columnas que existen antes del turno objetivo.
 * Ningún resultado, marca o columna del turno objetivo/futuro es accesible.
 * La hoja semanal puede faltar; aun así las señales de hoy sobreviven.
 */
export function observeProgressiveBoard7D(history:DatedSheet[],
 full:DailySheet,date:string,target:Turno):ProgressiveBoard7D{
 const index=TURNOS.indexOf(target);
 if(index<0||!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Fecha o turno inválidos');
 if(history.some(x=>x.date>=date)||new Set(history.map(x=>x.date)).size!==history.length)
  throw Error('Historial duplicado o fuga temporal');
 const before=freezeBeforeTurn7D(full,target);
 const prev=[...history].sort((a,b)=>a.date.localeCompare(b.date));
 const marked=reconstructMarkedMoments([...prev,{date,sheet:before}]);
 const completed=TURNOS.slice(0,index).filter(t=>(before.heads[t]||[]).length>0);
 const today=flatten(marked.filter(x=>x.date===date&&completed.includes(x.turn)));
 const mostRecent=prev[prev.length-1];
 const priorMarks=mostRecent?flatten(marked.filter(m=>m.date===mostRecent.date)):[];
 const weekly=prev.find(x=>x.date===minus7(date));
 const weeklyMarks=weekly?flatten(marked.filter(m=>m.date===weekly.date)):[];
 return {date,target,completedTurns:completed,
  visibleColumns:before.columns.map(c=>({id:c.id,label:c.sourceLabel,values:[...c.values]})),
  marksToday:today,
  lastDraw:mostRecent?{date:mostRecent.date,marks:priorMarks}:undefined,
  previousWeek:weekly?{date:weekly.date,marks:weeklyMarks}:undefined,
  crossTurnSameDay:relations(today,'TURNOS'),
  crossColumnSameDay:relations(today,'COLUMNAS'),
  linksToLastDraw:mostRecent?links(today,priorMarks,mostRecent.date):[],
  linksToPreviousWeek:weekly?links(today,weeklyMarks,weekly.date):[],
  counts:{completedTurns:completed.length,visibleColumns:before.columns.length,
   vt2:today.filter(x=>x.kind==='vt2').length,
   vt3:today.filter(x=>x.kind==='vt3').length,
   vt4:today.filter(x=>x.kind==='vt4').length,
   uniqueForms:unique(today.map(groupKey)).length},
  status:'OBSERVACION_NO_PREDICTIVA',
  explanation:'Tabla +11 progresiva, relaciones físicas y marcas de turnos terminados. '+
   'Las comparaciones entre columnas no permiten unir celdas de dos columnas. '+
   'D−7 es opcional; no se seleccionan candidatas ni se presume ventaja predictiva.'
 };
}
