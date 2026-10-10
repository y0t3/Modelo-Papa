// Modelo Papá: seguimiento concreto VT3, antes de cada sorteo de la tabla +11.
// Conserva CIFRAS, celdas y origen por episodio; nunca confunde recorridos
// retrospectivos reconstruidos con trazos manuales verificados.
// D−7 NO es condición. No puntúa ni selecciona cifras para jugar.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DatedSheet} from './cycle7d';
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';
import {reconstructMarkedMoments,priorMarkedMoments} from './markedSheet7d';
import type {MarkedPath} from './markedSheet7d';
import {familyRelation7D} from './geometryFamily7d';
import type {FamilyRelation7D} from './geometryFamily7d';
import {freezeBeforeTurn7D} from './causalReplay7d';

export type VT3ConcreteEpisode7D={
 date:string;turn:Turno;sourceId:SourceId;cells:string[];
 shape:string;wonVT3:string;heads:string[];
 provenance:'RECONSTRUIDA_DE_MATCHES';
};
export type VT3ConcreteLink7D={
 earlier:VT3ConcreteEpisode7D;later:VT3ConcreteEpisode7D;
 relation:Exclude<FamilyRelation7D,'NO_RELACION'>;
 move?:{rows:number;columns:number};
 numericChanged:boolean;
 scope:'MISMO_DIA'|'ENTRE_JORNADAS';
};
export type VT3ConcreteProjection7D={
 anchor:VT3ConcreteEpisode7D;
 originalVT3:string;todayValue?:string;
 originalVT2:string;todayVT2?:string;
 sameDigitsAsAnchor:boolean;
 samePhysicalTrace:boolean;
 availableInCurrentBoard:boolean;
 predecessor?:VT3ConcreteLink7D;
 independentOtherColumnAnalogies:Array<{
  date:string;turn:Turno;sourceId:SourceId;
  value:string;sameShape:boolean;
 }>;
};
export type VT3ConcreteTrace7D={
 protocol:'VT3_REAL_EPISODES_PROGRESSIVE_PLUS11_V1';
 date:string;target:Turno;
 readOnlyBeforeTarget:true;
 visibleSources:SourceId[];
 previousDrawDates:string[];
 completedToday:Turno[];
 episodesInMemory:number;distinctDrawMoments:number;
 anchors:number;readableProjections:number;
 exactPredecessors:number;translatedPredecessors:number;branchPredecessors:number;
 digitChanges:number;
 crossSourceAnalogies:number;
 projections:VT3ConcreteProjection7D[];
 status:'SOLO_OBSERVACION';
 warnings:string[];
};
const coordinate=(p:{row:number;col:number})=>p.row+':'+p.col;
const momentId=(e:{date:string;turn:Turno})=>
 e.date+'|'+String(TURNOS.indexOf(e.turn));
const episodeIndex=(e:VT3ConcreteEpisode7D)=>
 momentId(e)+'|'+e.sourceId+'|'+e.cells.join('>');
const shapeOf=(path:Path)=>path.slice(1).map((p,i)=>
 (p.row-path[i].row)+','+(p.col-path[i].col)).join('>');
const compareTime=(a:{date:string;turn:Turno},b:{date:string;turn:Turno})=>
 a.date.localeCompare(b.date)||TURNOS.indexOf(a.turn)-TURNOS.indexOf(b.turn);
function episodesFrom(marks:MarkedPath[]):VT3ConcreteEpisode7D[]{
 const groups=new Map<string,VT3ConcreteEpisode7D>();
 for(const m of marks){
  if(m.kind!=='vt3'||!/^\d{3}$/.test(m.value))continue;
  const shape=shapeOf(m.route),cells=m.route.map(coordinate);
  const k=momentId(m)+'|'+m.sourceId+'|'+cells.join('>');
  const old=groups.get(k);
  if(old){if(old.wonVT3!==m.value)throw Error('La misma ruta física cambia de cifra dentro de un turno');
   if(!old.heads.includes(m.head))old.heads.push(m.head);
  }else{
   groups.set(k,{date:m.date,turn:m.turn,sourceId:m.sourceId,
    cells,shape,wonVT3:m.value,heads:[m.head],
    provenance:'RECONSTRUIDA_DE_MATCHES'});
  }
 }
 return [...groups.values()].sort((a,b)=>compareTime(a,b)||
  a.sourceId.localeCompare(b.sourceId)||a.cells.join('>').localeCompare(b.cells.join('>')));
}
const toPath=(e:VT3ConcreteEpisode7D):Path=>
 e.cells.map((c,i)=>{const [row,col]=c.split(':').map(Number);
  return {row,col,digit:e.wonVT3[i]};
 });
function link(earlier:VT3ConcreteEpisode7D,later:VT3ConcreteEpisode7D):VT3ConcreteLink7D|undefined{
 if(compareTime(earlier,later)>=0||earlier.sourceId!==later.sourceId)return undefined;
 const relation=familyRelation7D(
  {kind:'vt3',sourceId:earlier.sourceId,route:toPath(earlier)},
  {kind:'vt3',sourceId:later.sourceId,route:toPath(later)});
 if(relation==='NO_RELACION')return undefined;
 const a=toPath(earlier),b=toPath(later);
 return {earlier,later,relation,
  ...(relation==='TRASLACION_CERCANA'?{move:{
   rows:b[0].row-a[0].row,columns:b[0].col-a[0].col}}:{}),
  numericChanged:earlier.wonVT3!==later.wonVT3,
  scope:earlier.date===later.date?'MISMO_DIA':'ENTRE_JORNADAS'};
}
const weight:Record<Exclude<FamilyRelation7D,'NO_RELACION'>,number>={
 EXACTA:3,TRASLACION_CERCANA:2,RAMA_CERCANA:1};
function closest(episode:VT3ConcreteEpisode7D,all:VT3ConcreteEpisode7D[]){
 const choices:VT3ConcreteLink7D[]=[];
 for(const old of all){
  const candidate=link(old,episode);if(candidate)choices.push(candidate);
 }
 // Primero continuidad temporal real: el antecesor más reciente.
 // En un MISMO episodio sólo elige vínculo más concreto.
 choices.sort((a,b)=>compareTime(b.earlier,a.earlier)||
  weight[b.relation]-weight[a.relation]||
  a.earlier.sourceId.localeCompare(b.earlier.sourceId)||
  a.earlier.cells.join('>').localeCompare(b.earlier.cells.join('>')));
 return choices[0];
}
function replay(e:VT3ConcreteEpisode7D,sheet:DailySheet){
 const col=sheet.columns.find(x=>x.id===e.sourceId);
 if(!col)return undefined;
 const digits=e.cells.map(c=>{const [row,side]=c.split(':').map(Number);
  return col.values[row]?.[side]||'';
 });
 return digits.length===3&&digits.every(d=>/^\d$/.test(d))?digits.join(''):undefined;
}
/**
 * Historial son sólo hojas de jornadas ANTERIORES. Día actual se congela
 * antes del turno objetivo. Sólo observamos rutas que fueron ganadoras
 * en sorteos ya completados; jamás los resultados del objetivo.
 *
 * maxPreviousDrawDays controla cantidad de JORNADAS REALES, no días
 * de calendario; D−7 puede faltar sin bloquear observación.
 */
export function traceConcreteVT3Before7D(history:DatedSheet[],full:DailySheet,
 date:string,target:Turno,maxPreviousDrawDays=6):VT3ConcreteTrace7D{
 const turnAt=TURNOS.indexOf(target);
 if(turnAt<0||!/^\d{4}-\d{2}-\d{2}$/.test(date)||
  !Number.isInteger(maxPreviousDrawDays)||maxPreviousDrawDays<1||
  maxPreviousDrawDays>21)throw Error('Turno, fecha o ventana de historia inválidos');
 if(history.some(x=>x.date>=date)||
  new Set(history.map(x=>x.date)).size!==history.length)
  throw Error('Historia repetida o fuga temporal');
 const safe=freezeBeforeTurn7D(full,target);
 const sorted=[...history].sort((a,b)=>a.date.localeCompare(b.date));
 const prior=sorted.filter(x=>TURNOS.some(t=>(x.sheet.heads[t]||[])
  .some(h=>/^\d{4}$/.test(h)))).slice(-maxPreviousDrawDays);
 const all=priorMarkedMoments(reconstructMarkedMoments([
  ...prior,{date,sheet:safe}]),date,target);
 // La tabla no aporta episodio nuevo si no existe una cabeza comprobada.
 const marks=all.flatMap(m=>m.marks);
 const episodes=episodesFrom(marks);
 const today=TURNOS.slice(0,turnAt).filter(t=>(safe.heads[t]||[])
  .some(h=>/^\d{4}$/.test(h)));
 // Bases: episodios de HOY cuando existen; también último día con marcas
 // VT3, para poder estudiar Previa aunque hoy aún no salió nada.
 const latestHistory=[...new Set(episodes.filter(e=>e.date<date).map(e=>e.date))].pop();
 const anchors=episodes.filter(e=>e.date===date||
  (e.date===latestHistory&&e.date<date));
 const projections:VT3ConcreteProjection7D[]=anchors.map(anchor=>{
  const current=replay(anchor,safe);
  const predecessor=closest(anchor,episodes);
  const analogies=episodes.filter(e=>e.sourceId!==anchor.sourceId&&
   e.wonVT3===anchor.wonVT3&&compareTime(e,anchor)<=0);
  // Analogía entre columnas: mismo VT3, pero no continuación física.
  const independent=analogies.slice(-6).map(e=>({
   date:e.date,turn:e.turn,sourceId:e.sourceId,
   value:e.wonVT3,sameShape:e.shape===anchor.shape}));
  return {anchor,originalVT3:anchor.wonVT3,todayValue:current,
   originalVT2:anchor.wonVT3.slice(-2),todayVT2:current?.slice(-2),
   sameDigitsAsAnchor:current===anchor.wonVT3,
   samePhysicalTrace:true,availableInCurrentBoard:current!==undefined,
   predecessor,
   independentOtherColumnAnalogies:independent};
 });
 return {protocol:'VT3_REAL_EPISODES_PROGRESSIVE_PLUS11_V1',
  date,target,readOnlyBeforeTarget:true,
  visibleSources:safe.columns.map(c=>c.id),
  previousDrawDates:prior.map(x=>x.date),
  completedToday:today,episodesInMemory:episodes.length,
  distinctDrawMoments:new Set(episodes.map(momentId)).size,
  anchors:anchors.length,
  readableProjections:projections.filter(x=>x.availableInCurrentBoard).length,
  exactPredecessors:projections.filter(x=>x.predecessor?.relation==='EXACTA').length,
  translatedPredecessors:projections.filter(x=>x.predecessor?.relation==='TRASLACION_CERCANA').length,
  branchPredecessors:projections.filter(x=>x.predecessor?.relation==='RAMA_CERCANA').length,
  digitChanges:projections.filter(x=>x.availableInCurrentBoard&&!x.sameDigitsAsAnchor).length,
  crossSourceAnalogies:projections.reduce((n,x)=>n+x.independentOtherColumnAnalogies.length,0),
  projections,
  status:'SOLO_OBSERVACION',
  warnings:[
   'Las marcas provienen de coincidencias ganadoras reconstruidas automáticamente, NO son trazos manuales verificados.',
   'Cada ruta VT3 completa permanece dentro de una sola columna física de su propio día.',
   'Relacionar fuentes distintas significa analogía de cifras/forma, nunca un recorrido cruzado.',
   'Releer coordenadas sobre la columna actual puede producir nuevas cifras: son OBSERVACIONES, NO candidatas recomendadas.',
   'Varias rutas pertenecientes a un sorteo NO suman episodios independientes.',
   'D−7 no es filtro; se excluyen las cabezas del turno objetivo y turnos futuros.',
   'No se atribuye poder predictivo ni se altera el Top3 del adaptativo.'
  ]};
}
