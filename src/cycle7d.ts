// Bitácora 7D: reconstrucción causal VT2 / VT3 / VT4. NO selecciona apuestas.
// Cada observación se agrega DESPUÉS del resultado del turno correspondiente.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';

export type CycleKind='vt2'|'vt3'|'vt4';
export type DatedSheet={date:string;sheet:DailySheet};
export type CycleEvent={
 date:string;turn:Turno;kind:CycleKind;sourceId:SourceId;signature:string;
 head:string;value:string;route:Path;
 classification:'NACE'|'RECONFIRMA';
 priorOccurrences:number;priorLastDate?:string; // cantidad de sorteos anteriores que confirmaron esa geometría
};
export type CycleSnapshot={
 before:CycleEvent[]; // Sólo resultados de turnos previos, nunca el objetivo.
 newEvents:CycleEvent[]; // Se conoce recién después de sortear el objetivo.
};
const sig=(path:Path)=>path.slice(1).map((c,i)=>(c.row-path[i].row)+','+(c.col-path[i].col)).join(';');
const key=(e:Pick<CycleEvent,'kind'|'sourceId'|'signature'>)=>e.kind+'|'+e.sourceId+'|'+e.signature;
const validDate=(d:string)=>/^\d{4}-\d{2}-\d{2}$/.test(d);
export function buildCycle7DBitacora(dated:DatedSheet[]):CycleEvent[]{
 const ordered=[...dated].sort((a,b)=>a.date.localeCompare(b.date));
 if(ordered.some(x=>!validDate(x.date))||new Set(ordered.map(x=>x.date)).size!==ordered.length)
  throw new Error('Fechas inválidas o duplicadas en la bitácora 7D');
 const prior=new Map<string,{count:number;date:string}>();
 const out:CycleEvent[]=[];
 for(const {date,sheet} of ordered)for(const turn of TURNOS){
  const current:CycleEvent[]=[];
  for(const match of sheet.matches[turn]||[])for(const hit of match.hits){
   for(const route of hit.paths){
    const signature=sig(route),k=hit.kind+'|'+hit.sourceId+'|'+signature;
    const before=prior.get(k);
    current.push({date,turn,kind:hit.kind,sourceId:hit.sourceId,signature,
     head:match.cabeza,value:hit.value,route,
     classification:before?'RECONFIRMA':'NACE',
     priorOccurrences:before?.count||0,priorLastDate:before?.date});
   }
  }
  // Todos los caminos del mismo turno se comparan contra una memoria congelada
  // antes del sorteo, no contra otros caminos del mismo resultado.
  const momentKeys=new Set(current.map(key));
  for(const k of momentKeys){
   const last=prior.get(k);
   // Varias cabezas o rutas en un mismo turno son una sola oportunidad temporal de confirmación.
   prior.set(k,{count:(last?.count||0)+1,date});
  }
  out.push(...current);
 }
 return out;
}
export function cycleSnapshot(events:CycleEvent[],date:string,turn:Turno):CycleSnapshot{
 const index=TURNOS.indexOf(turn);
 if(index<0)throw new Error('Turno inválido');
 const before=events.filter(x=>x.date<date||(x.date===date&&TURNOS.indexOf(x.turn)<index));
 const newEvents=events.filter(x=>x.date===date&&x.turn===turn);
 return {before,newEvents};
}

/**
 * Estado observable ANTES del turno indicado. No etiqueta MUERE/DECAE:
 * ausencia de nuevos aciertos no equivale a extinción de una figura.
 */
export type CycleFormation={
 kind:CycleKind;sourceId:SourceId;signature:string;
 confirmingDraws:number;firstConfirmed:string;lastConfirmed:string;
 heads:string[];values:string[];routeCount:number;
};
export function priorCycleFormations(events:CycleEvent[],date:string,turn:Turno):CycleFormation[]{
 const {before}=cycleSnapshot(events,date,turn);
 const grouped=new Map<string,{
  formation:CycleFormation;moments:Set<string>;routes:Set<string>;heads:Set<string>;values:Set<string>
 }>();
 for(const e of before){
  const k=key(e);
  let x=grouped.get(k);
  if(!x){
   x={formation:{kind:e.kind,sourceId:e.sourceId,signature:e.signature,confirmingDraws:0,
    firstConfirmed:e.date+' '+e.turn,lastConfirmed:e.date+' '+e.turn,heads:[],values:[],routeCount:0},
    moments:new Set(),routes:new Set(),heads:new Set(),values:new Set()};
   grouped.set(k,x);
  }
  const moment=e.date+'|'+e.turn;
  if(!x.moments.has(moment)){
   x.moments.add(moment);
   x.formation.lastConfirmed=e.date+' '+e.turn;
  }
  x.heads.add(e.head);x.values.add(e.value);
  x.routes.add(e.route.map(c=>c.row+','+c.col).join('>'));
 }
 return [...grouped.values()].map(x=>({
  ...x.formation,confirmingDraws:x.moments.size,routeCount:x.routes.size,
  heads:[...x.heads],values:[...x.values]
 })).sort((a,b)=>b.confirmingDraws-a.confirmingDraws||a.kind.localeCompare(b.kind)||a.sourceId.localeCompare(b.sourceId));
}
