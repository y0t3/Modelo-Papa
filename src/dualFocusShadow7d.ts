// Ensayo de doble foco VT2 con presupuesto exactamente emparejado.
// No modifica el motor D-7, el selector, ni la APK.
// La figura raiz se elige por el lector combinado D-7; la traslacion se
// congela en la PRIMERA oportunidad posterior a D-7 donde ambas son legibles.
// Su seguimiento se actualiza con resultados de sorteos YA TERMINADOS.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {DatedSheet} from './cycle7d';
import type {ReplayTurn7D} from './causalReplay7d';
import {physicalPoolBefore7D,freezeBeforeTurn7D} from './causalReplay7d';
import {prefreezeFixedAndTranslated7D} from './figureTranslation7d';
import type {FigureFollowup7D} from './figureFollowup7d';
import {createPromotionFocus7D,previewPromotionFocus7D,recordPromotionOutcome7D} from './figurePromotion7d';
import {decideRestPriority7D} from './figureRestReactivation7d';
export type ShadowRule7D='REPOSO_Y_RECONFIRMACION'|'REPOSO_Y_ACTIVIDAD';

export const SHADOW_RULE_7D='REPOSO_Y_RECONFIRMACION' as const;
export type ShadowChoice7D={original:string;chosen:string;sourceId:string;
 root:string[];shifted?:string[];focus:'FIJA'|'TRASLADADA';
 priorObservations:number;rootPhase?:string;shiftedPhase?:string;reason:string};
export type ShadowTurn7D={date:string;turn:Turno;heads:string[];
 baseline:string[];shadow:string[];choices:ShadowChoice7D[];
 hitsBaseline:number;hitsShadow:number;eligibleUnion:number;
 expectedSameBudget:number;replaced:number};
export type ShadowReport7D={rule:ShadowRule7D;rows:ShadowTurn7D[];
 turns:number;matchedBudget:boolean;candidatesEach:number;
 baselineHits:number;shadowHits:number;gained:number;lost:number;ties:number;
 selectedShift:number;actualChanges:number;physicalExpectedBoth:number;notes:string[]};

const weekAgo=(date:string)=>{
 const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-7);
 return d.toISOString().slice(0,10);
};
const ckey=(p:{row:number;col:number}[])=>p.map(x=>x.row+':'+x.col);
const known=(day:DailySheet,turn:Turno)=>[...new Set((day.heads[turn]||[]).filter(x=>/^\d{4}$/.test(x)))];
const hit=(value:string,heads:string[])=>heads.some(h=>h.endsWith(value));
/**
 * Una unica figura original VT2 y UNA traslacion. Si faltan lecturas,
 * si el cambio duplica otra candidata o si no hubo tiempo de seguimiento,
 * conserva la candidata original.
 */
export function selectShadowForTurn7D(history:DatedSheet[],before:DailySheet,
 date:string,turn:Turno,candidates:ReplayTurn7D['candidates'],
 rule:ShadowRule7D=SHADOW_RULE_7D):{
 choices:ShadowChoice7D[];physicalAlternatives:Set<string>}{
 if(history.some(x=>x.date>=date))throw Error('Historia incluye sorteo objetivo o futuro');
 const anchor=weekAgo(date);
 const out:ShadowChoice7D[]=[];
 const physicalAlternatives=physicalPoolBefore7D(history,before,date,turn).vt2;
 const occupied=new Set<string>();
 const originalValues=new Set(candidates.filter(x=>x.kind==='vt2').map(x=>x.value));
 for(const cand of candidates.filter(x=>x.kind==='vt2')){
  const original=cand.value,root=[...cand.cells];
  let choice:ShadowChoice7D={original,chosen:original,sourceId:cand.sourceId,
   root,focus:'FIJA',priorObservations:0,reason:'Sin reconfirmacion previa'};
  if(!history.some(x=>x.date===anchor)){out.push(choice);occupied.add(original);continue}
  const origin:FigureFollowup7D={
   dateStarted:anchor,kind:'vt2',target:turn,
   sourceId:cand.sourceId as FigureFollowup7D['sourceId'],
   originCoordinates:root,originStatus:'EXACTO',observations:[]
  };
  let state:ReturnType<typeof createPromotionFocus7D>|undefined;
  const earlier=history.filter(d=>d.date>anchor&&d.date<date).sort((a,b)=>a.date.localeCompare(b.date));
  for(const entry of earlier){
   const heads=known(entry.sheet,turn);
   if(!heads.length)continue;
   const safe=freezeBeforeTurn7D(entry.sheet,turn);
   if(!state){
    const pair=prefreezeFixedAndTranslated7D(origin,history.filter(x=>x.date<entry.date),safe,entry.date,turn);
    if(!pair.fixed||!pair.shifted)continue;
    state=createPromotionFocus7D(origin,pair);
   }
   const frozen=previewPromotionFocus7D(state,safe,entry.date,turn);
   state=recordPromotionOutcome7D(state,frozen,heads);
  }
  if(state){
   const preview=previewPromotionFocus7D(state,before,date,turn);
   if(preview.shifted)physicalAlternatives.add(preview.shifted.direct);
   const decision=decideRestPriority7D(state,preview,rule);
   const shifted=decision.focus==='TRASLADADA';
   const projected=decision.projected;
   const usable=shifted&&projected&&projected!==original&&!occupied.has(projected)&&!originalValues.has(projected);
   choice={original,chosen:usable?projected:original,sourceId:cand.sourceId,
    root,shifted:preview.shifted?.coordinates,
    focus:usable?'TRASLADADA':'FIJA',priorObservations:state.observations.length,
    rootPhase:decision.stateBefore.fixed.phase,
    shiftedPhase:decision.stateBefore.shifted.phase,
    reason:usable?decision.reason:
     shifted?'Traslacion duplicada o no diferente; se conserva raiz':decision.reason};
  }
  if(occupied.has(choice.chosen))throw Error('Presupuesto duplicado en doble foco');
  occupied.add(choice.chosen);
  out.push(choice);
 }
 return {choices:out,physicalAlternatives};
}
export function auditShadow7D(ordered:DatedSheet[],baselineRows:ReplayTurn7D[],
 rule:ShadowRule7D=SHADOW_RULE_7D):ShadowReport7D{
 const sorted=[...ordered].sort((a,b)=>a.date.localeCompare(b.date));
 if(sorted.some((x,i)=>i>0&&x.date===sorted[i-1].date))throw Error('Fechas repetidas');
 const rows:ShadowTurn7D[]=[];
 let baselineHits=0,shadowHits=0,gained=0,lost=0,ties=0;
 let selectedShift=0,actualChanges=0,physicalExpectedBoth=0,candidatesEach=0;
 for(const row of baselineRows){
  const current=sorted.find(x=>x.date===row.date);
  if(!current)throw Error('Falta fecha evaluada '+row.date);
  const history=sorted.filter(x=>x.date<row.date);
  const before=freezeBeforeTurn7D(current.sheet,row.turn);
  const {choices,physicalAlternatives}=selectShadowForTurn7D(history,before,row.date,row.turn,row.candidates,rule);
  const base=row.candidates.filter(c=>c.kind==='vt2').map(c=>c.value);
  const shadow=choices.map(c=>c.chosen);
  if(shadow.length!==base.length||new Set(shadow).size!==shadow.length)
   throw Error('Presupuesto desigual o candidato duplicado');
  if(choices.some(c=>c.focus==='TRASLADADA'&&c.priorObservations===0))
   throw Error('Traslacion promovida sin sorteos previos');
  if(base.some(v=>!physicalAlternatives.has(v))||shadow.some(v=>!physicalAlternatives.has(v)))
   throw Error('Prediccion fuera de la union de lecturas fisicas');
  const winners=known(current.sheet,row.turn);
  if(!winners.length)throw Error('Turno sin cabezas para cotejar');
  const hb=base.filter(v=>hit(v,winners)).length,hs=shadow.filter(v=>hit(v,winners)).length;
  baselineHits+=hb;shadowHits+=hs;candidatesEach+=base.length;
  if(hs>hb)gained++;else if(hs<hb)lost++;else ties++;
  selectedShift+=choices.filter(c=>c.focus==='TRASLADADA').length;
  actualChanges+=choices.filter(c=>c.chosen!==c.original).length;
  const winning=new Set(winners.map(x=>x.slice(-2)));
  const hitsInPool=[...physicalAlternatives].filter(v=>winning.has(v)).length;
  const exp=physicalAlternatives.size?base.length*hitsInPool/physicalAlternatives.size:0;
  physicalExpectedBoth+=exp;
  rows.push({date:row.date,turn:row.turn,heads:winners,
   baseline:base,shadow,choices,hitsBaseline:hb,hitsShadow:hs,
   eligibleUnion:physicalAlternatives.size,expectedSameBudget:exp,
   replaced:choices.filter(c=>c.chosen!==c.original).length});
 }
 return {rule,rows,turns:rows.length,matchedBudget:true,
  candidatesEach,baselineHits,shadowHits,gained,lost,ties,
  selectedShift,actualChanges,physicalExpectedBoth,notes:[
   'La variante NO elige raíces nuevas; usa las rutas VT2 priorizadas por el lector D-7 congelado.',
   'Cada traslado nace en una oportunidad anterior, se congela y mantiene su identidad; no se lo elige mirando el resultado objetivo.',
   'Se exige reposo de la raiz, más actividad previa de la traslacion segun la regla congelada para este ensayo.',
   'Mismo número exacto de candidatas VT2 por turno, sin sumar raíz y traslado como apuestas distintas.',
   'Los períodos comparados ya fueron examinados; cualquier diferencia es retrospectiva exploratoria.'
 ]};
}
