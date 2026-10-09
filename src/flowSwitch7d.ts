// 7D: controlador experimental de CAMBIO DE RUMBO, no motor de apuestas.
// La decisión es causal y se reconstruye desde marcas de los últimos días.
// No aprende pesos de los aciertos: estados heurísticos descriptivos pendientes de validar.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {CycleKind,DatedSheet} from './cycle7d';
import {observeSpatialFlow7D} from './spatialFlow7d';
import type {VerticalZone,FlowTrend} from './spatialFlow7d';

export type FlowAction='MANTENER'|'CAMBIAR'|'OBSERVAR_NUEVA'|'ABSTENERSE';
export type FlowFocus={kind:CycleKind;sourceId:SourceId;winningTurn:Turno;zone:VerticalZone};
export type FlowDecision={kind:CycleKind;action:FlowAction;focus?:FlowFocus;previous?:FlowFocus;recentConfirmations:number;previousConfirmations:number;explanation:string};
export type FlowSwitchResult={date:string;target:Turno;status:'EXPERIMENTAL';windowDays:number;decisions:FlowDecision[];warning:string};
const id=(x:FlowFocus)=>[x.kind,x.sourceId,x.winningTurn,x.zone].join('|');
const focus=(x:FlowTrend):FlowFocus=>({kind:x.kind,sourceId:x.sourceId,winningTurn:x.winningTurn,zone:x.zone});
const rank=(a:FlowTrend,b:FlowTrend)=>b.recentDraws-a.recentDraws||b.totalDraws-a.totalDraws||id(focus(a)).localeCompare(id(focus(b)));
export function decideFlowSwitch7D(history:DatedSheet[],current:DailySheet,date:string,target:Turno):FlowSwitchResult{
 const at=TURNOS.indexOf(target);
 if(at<0)throw new Error('Turno inválido');
 // Descarta marcas del objetivo y de turnos posteriores aunque la hoja esté completa.
 const safeCurrent:DailySheet={...current,matches:Object.fromEntries(TURNOS.map((t,i)=>[t,i<at?(current.matches[t]||[]):[]]))};
 const dated=[...history.filter(x=>x.date<date),{date,sheet:safeCurrent}];
 const memory=observeSpatialFlow7D(dated,date,target);
 const decisions:FlowDecision[]=[];
 for(const kind of ['vt2','vt3','vt4'] as CycleKind[]){
  const possible=memory.trends.filter(x=>x.kind===kind).sort(rank);
  // Las dos mitades son episodios observacionales. No equivalen a predicción.
  const older=[...possible].sort((a,b)=>b.previousDraws-a.previousDraws||rank(a,b))[0];
  const newest=possible[0];
  const previous=older&&older.previousDraws>0?focus(older):undefined;
  if(!newest||newest.recentDraws===0){
   decisions.push({kind,action:'ABSTENERSE',previous,recentConfirmations:0,previousConfirmations:older?.previousDraws||0,explanation:'No hay confirmaciones recientes de una categoría espacial.'});
   continue;
  }
  const newFocus=focus(newest);
  if(newest.recentDraws<2){
   decisions.push({kind,action:'OBSERVAR_NUEVA',focus:newFocus,previous,recentConfirmations:newest.recentDraws,previousConfirmations:newest.previousDraws,explanation:'Una confirmación reciente es insuficiente para considerar consolidado el cambio.'});
   continue;
  }
  if(previous&&id(previous)!==id(newFocus)){
   const prevStillActive=possible.find(x=>id(focus(x))===id(previous));
   if(!prevStillActive||newest.recentDraws<prevStillActive.recentDraws+2){
    decisions.push({kind,action:'OBSERVAR_NUEVA',focus:newFocus,previous,recentConfirmations:newest.recentDraws,previousConfirmations:newest.previousDraws,explanation:'Aparece otra categoría, pero aún no supera por dos turnos confirmados a la anterior.'});
   }else{
    decisions.push({kind,action:'CAMBIAR',focus:newFocus,previous,recentConfirmations:newest.recentDraws,previousConfirmations:newest.previousDraws,explanation:'Nueva categoría con al menos dos confirmaciones recientes de ventaja frente a la anterior.'});
   }
   continue;
  }
  decisions.push({kind,action:'MANTENER',focus:newFocus,previous,recentConfirmations:newest.recentDraws,previousConfirmations:newest.previousDraws,explanation:'La categoría más reciente mantiene el foco observado, sin implicar pronóstico.'});
 }
 return {date,target,status:'EXPERIMENTAL',windowDays:memory.days,decisions,warning:'Umbrales 2/2 heurísticos, no validados: cambiar de tendencia no demuestra mayor probabilidad de acierto. No modifica ni filtra apuestas.'};
}
