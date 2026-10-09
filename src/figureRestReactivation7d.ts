// Memoria reversible de reposo y reactivacion para DOS figuras: raiz y traslacion.
// La lectura ya quedo congelada ANTES del resultado en figurePromotion7d.ts.
// Este archivo lee UNICAMENTE observaciones guardadas de sorteos terminados.
import type {TranslationObservation7D} from './figureTranslationMemory7d';
import type {PromotionFocusState7D} from './figurePromotion7d';
import type {TranslationPair7D} from './figureTranslation7d';

export type FigureRestPhase7D='SIN_APOYO'|'ACTIVO'|'REPOSO'|'REACTIVACION_1'|'REACTIVACION_CONFIRMADA';
export type FigureRestRecord7D={
 phase:FigureRestPhase7D; quietValidDraws:number;restEvents:number;reappearEvents:number;
 reconfirmEvents:number;lastSupportDate?:string;reappearedAt?:number;
};
export type PairRestView7D={fixed:FigureRestRecord7D;shifted:FigureRestRecord7D;observedDraws:number};
export type RestPriorityRule7D='CONSERVAR_FIJA'|'TRASLADADA_INMEDIATA'|'REPOSO_Y_REGRESO'|'REPOSO_Y_RECONFIRMACION'|'REPOSO_Y_ACTIVIDAD';
export type RestPriorityDecision7D={
 date:string;target:PromotionFocusState7D['origin']['target'];rule:RestPriorityRule7D;
 focus:'FIJA'|'TRASLADADA';stateBefore:PairRestView7D;projected?:string;
 reason:string;rootPreserved:true;
};
const initial=():FigureRestRecord7D=>({
 phase:'SIN_APOYO',quietValidDraws:0,restEvents:0,reappearEvents:0,reconfirmEvents:0
});
const update=(before:FigureRestRecord7D,support:boolean|null,index:number,date:string,
 previousReappearanceIndex:number|undefined)=>{
 const next:FigureRestRecord7D={...before};
 let reappearance=previousReappearanceIndex;
 if(support===null)return {next,reappearance};
 if(support){
  next.lastSupportDate=date;
  if(before.phase==='REPOSO'){
   next.phase='REACTIVACION_1';next.reappearedAt=index;
   next.reappearEvents++;reappearance=index;
  }else if(before.phase==='REACTIVACION_1'&&reappearance!==undefined&&index-reappearance<=2){
   next.phase='REACTIVACION_CONFIRMADA';next.reconfirmEvents++;
  }else if(before.phase!=='REACTIVACION_CONFIRMADA'){
   next.phase='ACTIVO';
  }
  next.quietValidDraws=0;
 }else{
  next.quietValidDraws++;
  if(before.phase==='REACTIVACION_1'&&reappearance!==undefined&&index-reappearance>2)next.phase='ACTIVO';
  if(before.phase!=='SIN_APOYO'&&next.quietValidDraws>=2){
   if(before.phase!=='REPOSO')next.restEvents++;
   next.phase='REPOSO';
  }
 }
 return {next,reappearance};
};
/** Indices are COMPLETED target-turn opportunities already recorded.
 * Unavailable physical readings neither kill a figure nor reactivate it.
 * Partial VT2 by itself is NOT full geometric support.
 */
export function readPairRest7D(events:TranslationObservation7D[]):PairRestView7D{
 let fixed=initial(),shifted=initial();
 let reFixed:number|undefined,reShifted:number|undefined;
 for(let i=0;i<events.length;i++){
  const e=events[i];
  if(i>0&&events[i-1].date>=e.date)throw Error('Observaciones no cronologicas o repetidas');
  const f=update(fixed,e.fixedReadings===0?null:e.fixedGeometric,i+1,e.date,reFixed);
  const s=update(shifted,e.translatedReadings===0?null:e.translatedGeometric,i+1,e.date,reShifted);
  fixed=f.next;shifted=s.next;reFixed=f.reappearance;reShifted=s.reappearance;
 }
 return {fixed,shifted,observedDraws:events.length};
}
export function decideRestPriority7D(state:PromotionFocusState7D,
 preview:TranslationPair7D,rule:RestPriorityRule7D):RestPriorityDecision7D{
 if(preview.turn!==state.origin.target||preview.date<=state.origin.dateStarted||
   state.observations.some(x=>x.date>=preview.date))throw Error('El objetivo debe ser posterior a todas las evidencias');
 if(preview.fixed&&preview.fixed.coordinates.join('>')!==state.fixedCoordinates.join('>'))throw Error('Raiz incorrecta');
 if(preview.shifted&&preview.shifted.coordinates.join('>')!==state.shiftedCoordinates.join('>'))throw Error('Traslacion incorrecta');
 const before=readPairRest7D(state.observations),f=before.fixed,sh=before.shifted;
 const resting=f.phase==='REPOSO';
 const supportedNow=sh.quietValidDraws===0&&sh.lastSupportDate!==undefined;
 const allow=rule==='TRASLADADA_INMEDIATA'||
  rule==='REPOSO_Y_REGRESO'&&resting&&supportedNow&&['REACTIVACION_1','REACTIVACION_CONFIRMADA'].includes(sh.phase)||
  rule==='REPOSO_Y_RECONFIRMACION'&&resting&&supportedNow&&sh.phase==='REACTIVACION_CONFIRMADA'||
  rule==='REPOSO_Y_ACTIVIDAD'&&resting&&supportedNow;
 const shifted=!!preview.shifted&&allow;
 return {date:preview.date,target:preview.turn,rule,
  focus:shifted?'TRASLADADA':'FIJA',stateBefore:before,
  projected:(shifted?preview.shifted:preview.fixed)?.direct,rootPreserved:true,
  reason:shifted?'La prioridad de la traslacion se apoya en estados anteriores; la raiz permanece registrada.':
   'Se mantiene la figura original. Una ausencia no borra su geometria.'};
}
