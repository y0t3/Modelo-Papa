// Controlador con foco verdaderamente persistido entre turnos.
// La evidencia procede del ciclo corto anterior al objetivo; NO lee su resultado.
// No modifica las candidatas. Las decisiones deben confirmarse explícitamente.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {CycleKind,DatedSheet} from './cycle7d';
import {observeSpatialFlow7D} from './spatialFlow7d';
import type {FlowTrend} from './spatialFlow7d';
import type {FlowDecision,FlowFocus,FlowSwitchResult} from './flowSwitch7d';
import {lastFocus7D} from './decisionMemory7d';
import type {DecisionMemory7D} from './decisionMemory7d';
const focus=(x:FlowTrend):FlowFocus=>({kind:x.kind,sourceId:x.sourceId,winningTurn:x.winningTurn,zone:x.zone});
const key=(f:FlowFocus)=>[f.kind,f.sourceId,f.winningTurn,f.zone].join('|');
const rank=(a:FlowTrend,b:FlowTrend)=>b.recentDraws-a.recentDraws||b.totalDraws-a.totalDraws||key(focus(a)).localeCompare(key(focus(b)));
export function decidePersistentFlow7D(memory:DecisionMemory7D,history:DatedSheet[],current:DailySheet,date:string,target:Turno):FlowSwitchResult{
 const at=TURNOS.indexOf(target);
 if(at<0)throw Error('Turno inválido');
 const safe:DailySheet={...current,matches:Object.fromEntries(TURNOS.map((t,i)=>[t,i<at?(current.matches[t]||[]):[]]))};
 const snapshot=observeSpatialFlow7D([...history.filter(x=>x.date<date),{date,sheet:safe}],date,target);
 const decisions:FlowDecision[]=[];
 for(const kind of ['vt2','vt3','vt4'] as CycleKind[]){
  const trends=snapshot.trends.filter(t=>t.kind===kind).sort(rank);
  const leader=trends[0],runnerUp=trends[1];
  const previous=lastFocus7D(memory,kind);
  const tracked=previous?trends.find(x=>key(focus(x))===key(previous)):undefined;
  if(!leader||leader.recentDraws<2){
   decisions.push({kind,action:leader?'OBSERVAR_NUEVA':'ABSTENERSE',focus:previous,previous,recentConfirmations:leader?.recentDraws||0,previousConfirmations:tracked?.recentDraws||0,explanation:'Actividad reciente insuficiente; no se altera el foco persistido.'});
   continue;
  }
  const top=focus(leader),margin=leader.recentDraws-(runnerUp?.recentDraws||0);
  if(margin<2){
   decisions.push({kind,action:'OBSERVAR_NUEVA',focus:previous,previous,recentConfirmations:leader.recentDraws,previousConfirmations:tracked?.recentDraws||0,explanation:'Liderazgo ambiguo o empate. Se mantiene el foco persistido mientras se observa.'});
   continue;
  }
  if(!previous){
   decisions.push({kind,action:'MANTENER',focus:top,recentConfirmations:leader.recentDraws,previousConfirmations:0,explanation:'Primer foco confirmado con liderazgo claro.'});
  }else if(key(previous)===key(top)){
   decisions.push({kind,action:'MANTENER',focus:previous,previous,recentConfirmations:leader.recentDraws,previousConfirmations:tracked?.recentDraws||0,explanation:'La tendencia persistida continúa liderando.'});
  }else{
   decisions.push({kind,action:'CAMBIAR',focus:top,previous,recentConfirmations:leader.recentDraws,previousConfirmations:tracked?.recentDraws||0,explanation:'La nueva tendencia supera a todas las alternativas por dos confirmaciones y desplaza el foco persistido.'});
  }
 }
 return {date,target,status:'EXPERIMENTAL',windowDays:snapshot.days,decisions,warning:'Registro experimental. Requiere fijar manualmente la decisión antes del sorteo; no implica señal ganadora.'};
}
