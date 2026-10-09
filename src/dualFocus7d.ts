// Dos focos observacionales persistentes por modalidad. No selecciona numeros.
// Las observaciones se calculan SOLO con resultados anteriores al objetivo.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {CycleKind,DatedSheet} from './cycle7d';
import type {FlowFocus} from './flowSwitch7d';
import {observeSpatialFlow7D} from './spatialFlow7d';
import type {FlowTrend} from './spatialFlow7d';
export type DualFocusState={kind:CycleKind;primary?:FlowFocus;emerging?:FlowFocus;primaryQuiet:number;emergingStreak:number;primaryResting:boolean};
export type DualAction='SIN_FOCO'|'INICIAR'|'MANTENER'|'OBSERVAR_EMERGENTE'|'PROMOVER'|'REPOSAR'|'REACTIVAR';
export type DualStep={action:DualAction;before:DualFocusState;after:DualFocusState;reason:string;date:string;turn:Turno};
const key=(f:FlowFocus)=>[f.kind,f.sourceId,f.winningTurn,f.zone].join('|');
const focus=(t:FlowTrend):FlowFocus=>({kind:t.kind,sourceId:t.sourceId,winningTurn:t.winningTurn,zone:t.zone});
const eq=(a?:FlowFocus,b?:FlowFocus)=>!!a&&!!b&&key(a)===key(b);
export const initialDualFocus7D=(kind:CycleKind):DualFocusState=>({kind,primaryQuiet:0,emergingStreak:0,primaryResting:false});
// PURE transition, testable without guessing future results. Consecutive evaluations are
// NOT independent draws: streak is only an observational safeguard, not a predictive probability.
export function advanceDualFocusFromTrends7D(state:DualFocusState,trends:FlowTrend[],date:string,turn:Turno):DualStep{
 const available=trends.filter(t=>t.kind===state.kind).sort((a,b)=>b.recentDraws-a.recentDraws||b.totalDraws-a.totalDraws||key(focus(a)).localeCompare(key(focus(b)));
 const best=available[0],challenger=best?focus(best):undefined;
 const second=available[1]?.recentDraws||0;
 const tracked=available.find(t=>eq(focus(t),state.primary));
 const primaryRecent=tracked?.recentDraws||0;
 const quiet=state.primary?(primaryRecent===0?state.primaryQuiet+1:0):0;
 const emit=(action:DualAction,after:DualFocusState,reason:string):DualStep=>({action,before:state,after,reason,date,turn});
 if(!state.primary){
  if(best&&best.recentDraws>=2&&best.recentDraws>second)
   return emit('INICIAR',{...state,primary:challenger,primaryQuiet:0,primaryResting:false},'Dos confirmaciones recientes y ventaja sin empate; se inicia el primer foco.');
  return emit('SIN_FOCO',state,'Sin liderazgo inicial; se conserva la observacion.');
 }
 const resting=quiet>=3;
 if(!best||best.recentDraws===0||eq(challenger,state.primary)){
  const after={...state,primaryQuiet:quiet,primaryResting:resting,emerging:undefined,emergingStreak:0};
  if(state.primaryResting&&primaryRecent>0)return emit('REACTIVAR',after,'Reaparecio el foco principal; no se interpreto el reposo como muerte.');
  return emit(resting?'REPOSAR':'MANTENER',after,'Sin alternativa diferenciada; se mantiene el foco principal registrado.');
 }
 // Never replace an established focus on an isolated return.
 const priorCandidate=eq(state.emerging,challenger);
 const streak=priorCandidate?state.emergingStreak+1:1;
 const after={...state,primaryQuiet:quiet,primaryResting:resting,emerging:challenger,emergingStreak:streak};
 const margin=best.recentDraws-Math.max(second,primaryRecent);
 if(best.recentDraws>=2&&margin>=2&&streak>=2)
  return emit('PROMOVER',{...after,primary:challenger,emerging:state.primary,emergingStreak:0,primaryQuiet:0,primaryResting:false},'Dos evaluaciones consecutivas con liderazgo de dos confirmaciones; anterior conservado como secundario.');
 return emit('OBSERVAR_EMERGENTE',after,'Formacion emergente en seguimiento sin desplazar al foco principal.');
}
export function advanceDualFocus7D(state:DualFocusState,history:DatedSheet[],current:DailySheet,date:string,turn:Turno):DualStep{
 const at=TURNOS.indexOf(turn);if(at<0)throw Error('Turno invalido');
 const safe:DailySheet={...current,matches:Object.fromEntries(TURNOS.map((t,i)=>[t,i<at?(current.matches[t]||[]):[]]))};
 const past=[...history.filter(x=>x.date<date),{date,sheet:safe}];
 return advanceDualFocusFromTrends7D(state,observeSpatialFlow7D(past,date,turn).trends,date,turn);
}
