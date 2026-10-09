// Estados de vida del FOCO, no del recorrido. Experimental, sin selección numérica.
// Las ausencias no significan que una ruta haya muerto. El reposo es reversible.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {DatedSheet,CycleKind} from './cycle7d';
import type {FlowFocus} from './flowSwitch7d';
import {observeSpatialFlow7D} from './spatialFlow7d';
import type {FlowTrend} from './spatialFlow7d';
export type FocusPhase='SIN_FOCO'|'OBSERVANDO'|'ACTIVO'|'REPOSO';
export type FocusState={kind:CycleKind;phase:FocusPhase;focus?:FlowFocus;quietTurns:number;started?:string};
export type FocusStep={kind:CycleKind;previous:FocusState;next:FocusState;action:'INICIAR'|'MANTENER'|'OBSERVAR'|'CAMBIAR'|'REPOSAR'|'SEGUIR_EN_REPOSO';explanation:string};
const same=(a?:FlowFocus,b?:FlowFocus)=>!!a&&!!b&&a.kind===b.kind&&a.sourceId===b.sourceId&&a.winningTurn===b.winningTurn&&a.zone===b.zone;
const focus=(t:FlowTrend):FlowFocus=>({kind:t.kind,sourceId:t.sourceId,winningTurn:t.winningTurn,zone:t.zone});
const key=(f:FlowFocus)=>[f.kind,f.sourceId,f.winningTurn,f.zone].join('|');
export const initialFocusState7D=(kind:CycleKind):FocusState=>({kind,phase:'SIN_FOCO',quietTurns:0});
export function advanceFocusLifecycle7D(state:FocusState,history:DatedSheet[],current:DailySheet,date:string,target:Turno):FocusStep{
 const at=TURNOS.indexOf(target);if(at<0)throw Error('Turno inválido');
 const safe:DailySheet={...current,matches:Object.fromEntries(TURNOS.map((t,i)=>[t,i<at?(current.matches[t]||[]):[]]))};
 const trends=observeSpatialFlow7D([...history.filter(x=>x.date<date),{date,sheet:safe}],date,target).trends
  .filter(t=>t.kind===state.kind).sort((a,b)=>b.recentDraws-a.recentDraws||b.totalDraws-a.totalDraws||key(focus(a)).localeCompare(key(focus(b)));
 const leader=trends[0],runner=trends[1];
 const tracked=state.focus?trends.find(t=>same(focus(t),state.focus)):undefined;
 const n=tracked?.recentDraws||0,margin=leader?leader.recentDraws-(runner?.recentDraws||0):0;
 // Reposo, no muerte: se conserva la identidad y no se reinicia artificialmente.
 if(state.focus&&n===0&&state.quietTurns>=2){
  const next={...state,phase:'REPOSO' as FocusPhase,quietTurns:state.quietTurns+1};
  return {kind:state.kind,previous:state,next,action:'REPOSAR',explanation:'Tres evaluaciones consecutivas sin actividad reciente de la categoría. El foco descansa, no muere.'};
 }
 // El primer foco no necesita ganarle a TODAS las categorías, pero sí dos marcas;
 // en empate se observa hasta que aparezca una marca que discrimine.
 if(!state.focus){
  if(leader&&leader.recentDraws>=2&&margin>=1){
   const next:FocusState={kind:state.kind,phase:'ACTIVO',focus:focus(leader),quietTurns:0,started:date+'|'+target};
   return {kind:state.kind,previous:state,next,action:'INICIAR',explanation:'Primer foco con dos confirmaciones recientes y liderazgo sin empate.'};
  }
  const next={...state,phase:'OBSERVANDO' as FocusPhase};
  return {kind:state.kind,previous:state,next,action:'OBSERVAR',explanation:'Todavía no existe una tendencia inicial diferenciada.'};
 }
 // Cambio exige una ventaja frente a todas las demás, no solo frente al foco anterior.
 if(leader&&leader.recentDraws>=2&&margin>=2&&!same(focus(leader),state.focus)){
  const next:FocusState={kind:state.kind,phase:'ACTIVO',focus:focus(leader),quietTurns:0,started:date+'|'+target};
  return {kind:state.kind,previous:state,next,action:'CAMBIAR',explanation:'Otra categoría lidera por dos confirmaciones a todas las alternativas.'};
 }
 if(n>0){
  const next:FocusState={...state,phase:'ACTIVO',quietTurns:0};
  return {kind:state.kind,previous:state,next,action:'MANTENER',explanation:'La categoría persistida sigue activa; no se desplaza por empate.'};
 }
 const next:FocusState={...state,phase:state.phase==='REPOSO'?'REPOSO':'OBSERVANDO',quietTurns:state.quietTurns+1};
 return {kind:state.kind,previous:state,next,action:state.phase==='REPOSO'?'SEGUIR_EN_REPOSO':'OBSERVAR',explanation:'Sin actividad reciente del foco; se observa sin declararlo muerto.'};
}
