// Bitácora causal de decisiones: conserva el foco realmente elegido, NO lo reconstruye
// con una clasificación posterior. Funciones puras para persistencia externa (AsyncStorage).
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {CycleKind} from './cycle7d';
import type {FlowFocus,FlowDecision,FlowAction} from './flowSwitch7d';
export type DecisionRecord7D={date:string;turn:Turno;kind:CycleKind;action:FlowAction;focus?:FlowFocus;previous?:FlowFocus;reason:string;confirmed?:boolean};
export type DecisionMemory7D={version:1;records:DecisionRecord7D[]};
export const emptyDecisionMemory7D=():DecisionMemory7D=>({version:1,records:[]});
const order=(date:string,turn:Turno)=>date+'|'+String(TURNOS.indexOf(turn));
const same=(a?:FlowFocus,b?:FlowFocus)=>a&&b?[a.kind,a.sourceId,a.winningTurn,a.zone].join('|')===[b.kind,b.sourceId,b.winningTurn,b.zone].join('|'):!a&&!b;
export function lastFocus7D(memory:DecisionMemory7D,kind:CycleKind):FlowFocus|undefined{
 for(let i=memory.records.length-1;i>=0;i--){
  const r=memory.records[i];
  if(r.kind===kind&&r.focus&&(r.action==='CAMBIAR'||r.action==='MANTENER'))return r.focus;
 }
 return undefined;
}
export function recordDecisions7D(memory:DecisionMemory7D,date:string,turn:Turno,decisions:FlowDecision[]):DecisionMemory7D{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!TURNOS.includes(turn))throw Error('Fecha o turno inválido');
 const moment=order(date,turn),last=memory.records[memory.records.length-1];
 if(last&&order(last.date,last.turn)>=moment)throw Error('La bitácora solo admite nuevos turnos posteriores');
 const found=new Set<CycleKind>();
 const added:DecisionRecord7D[]=decisions.map(d=>{
  if(found.has(d.kind))throw Error('Modalidad duplicada en el turno');
  found.add(d.kind);
  const previous=lastFocus7D(memory,d.kind);
  // OBSERVAR no desplaza el foco registrado. CAMBIAR exige un foco distinto real.
  const candidate=d.action==='OBSERVAR_NUEVA'||d.action==='ABSTENERSE'?previous:d.focus;
  if(d.action==='CAMBIAR'&&(!previous||!d.focus||same(previous,d.focus)))throw Error('CAMBIAR sin foco persistido distinto');
  if(d.action==='MANTENER'&&previous&&!same(previous,d.focus))throw Error('MANTENER no puede sustituir el foco');
  return {date,turn,kind:d.kind,action:d.action,focus:candidate,previous,reason:d.explanation};
 });
 return {version:1,records:[...memory.records,...added]};
}
// Evaluación posterior únicamente. Nunca altera la decisión registrada.
export function evaluateDecision7D(memory:DecisionMemory7D,date:string,turn:Turno,kind:CycleKind,confirmed:boolean):DecisionMemory7D{
 const index=memory.records.findIndex(r=>r.date===date&&r.turn===turn&&r.kind===kind);
 if(index<0)throw Error('Decisión inexistente');
 if(memory.records[index].confirmed!==undefined)throw Error('Resultado ya anotado');
 const records=memory.records.map((r,i)=>i===index?{...r,confirmed}:r);
 return {version:1,records};
}
