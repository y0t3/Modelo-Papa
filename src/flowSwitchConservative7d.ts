// Variante conservadora 7D. No altera el controlador original ni selecciona apuestas.
// Requiere liderazgo UNICO de al menos dos confirmaciones sobre cualquier otra categoría.
// Mantiene el foco previo mientras el líder sea ambiguo. Recalcula solo con marcas anteriores.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {CycleKind,DatedSheet} from './cycle7d';
import {observeSpatialFlow7D} from './spatialFlow7d';
import type {FlowTrend} from './spatialFlow7d';
import type {FlowDecision,FlowFocus,FlowSwitchResult} from './flowSwitch7d';
const focus=(x:FlowTrend):FlowFocus=>({kind:x.kind,sourceId:x.sourceId,winningTurn:x.winningTurn,zone:x.zone});
const key=(x:FlowFocus)=>[x.kind,x.sourceId,x.winningTurn,x.zone].join('|');
const rank=(a:FlowTrend,b:FlowTrend)=>b.recentDraws-a.recentDraws||b.totalDraws-a.totalDraws||key(focus(a)).localeCompare(key(focus(b)));
export function decideConservativeFlow7D(history:DatedSheet[],current:DailySheet,date:string,target:Turno):FlowSwitchResult{
 const at=TURNOS.indexOf(target);if(at<0)throw new Error('Turno inválido');
 const safe:DailySheet={...current,matches:Object.fromEntries(TURNOS.map((t,i)=>[t,i<at?(current.matches[t]||[]):[]]))};
 const mem=observeSpatialFlow7D([...history.filter(x=>x.date<date),{date,sheet:safe}],date,target);
 const decisions:FlowDecision[]=[];
 for(const kind of ['vt2','vt3','vt4'] as CycleKind[]){
  const trends=mem.trends.filter(t=>t.kind===kind).sort(rank);
  const older=[...trends].sort((a,b)=>b.previousDraws-a.previousDraws||rank(a,b))[0];
  const lead=trends[0],second=trends[1],previous=older?.previousDraws>0?focus(older):undefined;
  if(!lead||lead.recentDraws<2){
   decisions.push({kind,action:lead?'OBSERVAR_NUEVA':'ABSTENERSE',focus:lead?focus(lead):undefined,previous,
    recentConfirmations:lead?.recentDraws||0,previousConfirmations:older?.previousDraws||0,
    explanation:'Sin una tendencia con dos confirmaciones recientes; no se cambia de rumbo.'});continue;
  }
  const margin=lead.recentDraws-(second?.recentDraws||0);
  if(margin<2){
   decisions.push({kind,action:'OBSERVAR_NUEVA',focus:previous||focus(lead),previous,
    recentConfirmations:lead.recentDraws,previousConfirmations:older?.previousDraws||0,
    explanation:'El líder no supera a TODAS las alternativas por dos confirmaciones. Se conserva la referencia anterior como observación.'});continue;
  }
  const next=focus(lead);
  const action=previous&&key(previous)!==key(next)?'CAMBIAR':'MANTENER';
  decisions.push({kind,action,focus:next,previous,recentConfirmations:lead.recentDraws,
   previousConfirmations:older?.previousDraws||0,
   explanation:action==='CAMBIAR'?'Cambio con liderazgo único de al menos dos confirmaciones.':'Foco dominante conservado.'});
 }
 return {date,target,status:'EXPERIMENTAL',windowDays:mem.days,decisions,
 warning:'Variante conservadora descriptiva con umbral heurístico; no demuestra ventaja predictiva y no altera las apuestas.'};
}
