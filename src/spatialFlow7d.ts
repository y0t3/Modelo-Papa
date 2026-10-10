// Memoria espacial-temporal 7D: OBSERVACIONES, no pronósticos.
// "columna de origen -> turno ganador" y ubicación vertical de rutas marcadas.
// Ningún dato del turno objetivo participa en su perfil previo.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {SourceId} from './sheet';
import type {CycleKind,DatedSheet} from './cycle7d';
import {reconstructMarkedMoments,priorMarkedMoments} from './markedSheet7d';
import type {MarkedPath} from './markedSheet7d';

export type VerticalZone='ARRIBA'|'CENTRO'|'ABAJO'|'CRUZA_ZONAS';
export type FlowCount={sourceId:SourceId;winningTurn:Turno;kind:CycleKind;zone:VerticalZone;confirmedDraws:number;lastDate:string};
export type FlowObservation={date:string;turn:Turno;events:FlowCount[]};
export type FlowTrend={sourceId:SourceId;winningTurn:Turno;kind:CycleKind;zone:VerticalZone;recentDraws:number;previousDraws:number;totalDraws:number;direction:'SUBE'|'BAJA'|'ESTABLE'|'SIN_BASE';};
export type SpatialFlow7D={date:string;target:Turno;days:number;observations:FlowObservation[];trends:FlowTrend[];status:'EXPLORATORIO';warning:string};
export function routeZone(mark:Pick<MarkedPath,'route'>):VerticalZone{
 const zs=new Set(mark.route.map(c=>c.row<2?'ARRIBA':c.row<4?'CENTRO':'ABAJO'));
 return zs.size===1?[...zs][0] as VerticalZone:'CRUZA_ZONAS';
}
function validBefore(date:string,turn:Turno,targetDate:string,targetTurn:Turno):boolean{
 return date<targetDate||(date===targetDate&&TURNOS.indexOf(turn)<TURNOS.indexOf(targetTurn));
}
export function observeSpatialFlow7D(dated:DatedSheet[],date:string,target:Turno):SpatialFlow7D{
 if(!TURNOS.includes(target))throw new Error('Turno objetivo inválido');
 const moments=priorMarkedMoments(reconstructMarkedMoments(dated),date,target);
 const dates=[...new Set(moments.map(m=>m.date))].sort().slice(-6);
 const relevant=moments.filter(m=>dates.includes(m.date)&&validBefore(m.date,m.turn,date,target));
 const observations:FlowObservation[]=relevant.map(m=>{
  // Un mismo sorteo cuenta una vez por fuente/turno/VT/zona,
  // aunque tenga varias cabezas y recorridos en la red.
  const uniq=new Map<string,FlowCount>();
  for(const mark of m.marks){
   const zone=routeZone(mark);
   const key=[mark.sourceId,m.turn,mark.kind,zone].join('|');
   if(!uniq.has(key))uniq.set(key,{sourceId:mark.sourceId,winningTurn:m.turn,kind:mark.kind,zone,confirmedDraws:1,lastDate:m.date});
  }
  return {date:m.date,turn:m.turn,events:[...uniq.values()]};
 });
 const keys=new Map<string,{prototype:FlowCount;times:number[];lastDate:string}>();
 observations.forEach((obs,i)=>obs.events.forEach(e=>{
  const k=[e.sourceId,e.winningTurn,e.kind,e.zone].join('|');
  const item=keys.get(k)||{prototype:e,times:[],lastDate:obs.date};
  item.times.push(i);item.lastDate=obs.date;keys.set(k,item);
 }));
 // Comparar mitades cronológicas de turnos observados dentro del ciclo corto.
 const midpoint=Math.floor(observations.length/2);
 const trends:FlowTrend[]=[...keys.values()].map((x):FlowTrend=>{
  const recent=x.times.filter(i=>i>=midpoint).length;
  const previous=x.times.length-recent;
  return {sourceId:x.prototype.sourceId,winningTurn:x.prototype.winningTurn,kind:x.prototype.kind,zone:x.prototype.zone,
    recentDraws:recent,previousDraws:previous,totalDraws:x.times.length,
    direction:previous===0?'SIN_BASE':recent>previous?'SUBE':recent<previous?'BAJA':'ESTABLE'};
 }).sort((a,b)=>b.recentDraws-a.recentDraws||b.totalDraws-a.totalDraws||a.sourceId.localeCompare(b.sourceId));
 return {date,target,days:dates.length,observations,trends,status:'EXPLORATORIO',
  warning:'Las tendencias son frecuencia descriptiva de sorteos con marcas; SUBE no significa probabilidad mayor, ni prueba causal. Sin calibración estadística ni selector nuevo.'};
}
