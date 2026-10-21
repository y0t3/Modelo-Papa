/**
 * Presentador puro de la secuencia visual PRE → POST por familia.
 * No crea Tops. No muestra cabezas aún no sorteadas ni simula datos de
 * turnos que excedan el corte solicitado.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {HistoricalMark,PriorFamily,TurnFrame,N} from './withinDayMarkContinuity';
export type TimelineItem={
 turn:Turno;index:number;available:boolean;
 preFormable:boolean;prePlus:string[];preAux:string[];
 priorRoots:number;origins:HistoricalMark[];
 newPlus:string[];newAux:string[];
 change:'SIN_GEOMETRIA'|'FORMABLE_SIN_MARCA'|'MARCA_PERSISTE'|'SUMA_FUENTE';
 posted:HistoricalMark[];
 crossingAux:boolean;
};
export type FamilyChoice={family:string;firstPosted:Turno;
 postedEvents:number;exactValues:string[]};
export function timelineFamilyChoices(frames:TurnFrame[],n:N):FamilyChoice[]{
 const choices=new Map<string,FamilyChoice>();
 for(const frame of frames)for(const event of frame.post[n]){
  const prior=choices.get(event.family);
  if(!prior)choices.set(event.family,{
   family:event.family,firstPosted:frame.target,postedEvents:1,
   exactValues:[event.exact]
  });
  else{
   prior.postedEvents++;
   if(!prior.exactValues.includes(event.exact))prior.exactValues.push(event.exact);
  }
 }
 return [...choices.values()].sort((a,b)=>
  TURNOS.indexOf(a.firstPosted)-TURNOS.indexOf(b.firstPosted)||
  b.postedEvents-a.postedEvents||a.family.localeCompare(b.family));
}
export function timelineForFamily(frames:TurnFrame[],n:N,family:string,
 through:Turno):TimelineItem[]{
 const last=TURNOS.indexOf(through);
 if(last<0)throw Error('Turno inválido');
 if(frames.some((f,i)=>f.index!==i||f.index>last))
  throw Error('No se permiten cuadros POST de turnos futuros');
 return TURNOS.map((turn,index)=>{
  const frame=index<=last?frames[index]:undefined;
  if(!frame)return {turn,index,available:false,
   preFormable:false,prePlus:[],preAux:[],priorRoots:0,origins:[],
   newPlus:[],newAux:[],change:'SIN_GEOMETRIA' as const,
   posted:[],crossingAux:false};
  const physical=frame.physical[n].find(f=>f.family===family);
  const rooted=frame.rooted[n].find(f=>f.family===family);
  const origins=frame.roots[n].filter(f=>f.family===family);
  const posted=frame.post[n].filter(f=>f.family===family);
  const change:TimelineItem['change']=rooted?
   rooted.status==='FUENTE_NUEVA'?'SUMA_FUENTE':'MARCA_PERSISTE':
   physical?'FORMABLE_SIN_MARCA':'SIN_GEOMETRIA';
  return {turn,index,available:true,preFormable:!!physical,
   prePlus:physical?.plusSources||[],preAux:physical?.auxSources||[],
   priorRoots:rooted?.rootEvents||0,origins,
   newPlus:rooted?.newPlusSources||[],newAux:rooted?.newAuxSources||[],
   change,posted,crossingAux:!!physical?.crossAux};
 });
}
