// Modelo Papá — test conservador de ESTABILIDAD temporal VT3.
// No modifica el adaptativo oficial. Si el turno cerrado no agregó
// ni una marca VT3 ganadora ni una terna elegible al pool, no obliga
// a reemplazar un Top3 solo por decaimiento del reloj heurístico.
// Misma cantidad de candidatas, misma tabla +11 y cero fuga de resultados.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DatedSheet} from './cycle7d';
import type {DailySheet} from './sheet';
import {compareNextColumnVT37D} from './vt3ColumnEvolution7d';
import {freezeBeforeTurn7D} from './causalReplay7d';
import {allPhysicalVT3Before7D} from './vt3NetworkCoverage7d';

export type StabilityGuard7D={
 date:string;justCompletedTurn:Turno;nextTarget:Turno;
 active:boolean;reason:'SIN_MARCA_NI_NUEVO_ELEGIBLE'|'CONTINUA_ADAPTATIVO';
 original:string[];conservative:string[];
 changes:number;sharedPool:string[];
 originalRankedFromPrevious:string[];
};
export type StabilityGuardTurn7D={
 date:string;target:Turno;justCompletedTurn:Turno;
 changed:boolean;original:string[];conservative:string[];
 winners:string[];originalHits:number;conservativeHits:number;
 randomUnionExpected:number;budget:number;poolUnionSize:number;
};
export type StabilityGuardAudit7D={
 protocol:'VT3_HOLD_UNCHANGED_EVIDENCE_V1';
 eligibleTransitions:number;changedTransitions:number;
 testedTargets:number;originalHits:number;conservativeHits:number;
 originalHitsChanged:number;conservativeHitsChanged:number;
 expectedRandomUnionChanged:number;improvedTurns:number;
 worseTurns:number;tiedTurns:number;rows:StabilityGuardTurn7D[];
 notes:string[];
};
export function previewStabilityGuardVT37D(history:DatedSheet[],full:DailySheet,
 date:string,justCompletedTurn:Turno):StabilityGuard7D{
 const d=compareNextColumnVT37D(history,full,date,justCompletedTurn);
 const physical=allPhysicalVT3Before7D(freezeBeforeTurn7D(full,d.nextTarget));
 const canHold=d.newVerifiedVT3Marks===0&&d.newlyEligible===0&&
  d.top3Before.length===d.top3After.length&&
  d.top3Before.every(x=>physical.has(x));
 const conservative=canHold?[...d.top3Before]:[...d.top3After];
 if(conservative.length!==d.top3After.length||new Set(conservative).size!==conservative.length)
  throw Error('Se alteró cupo VT3 o se repitió una terna');
 return {date,justCompletedTurn,nextTarget:d.nextTarget,
  active:canHold&&d.enteredTop3.length>0,
  reason:canHold?'SIN_MARCA_NI_NUEVO_ELEGIBLE':'CONTINUA_ADAPTATIVO',
  original:[...d.top3After],conservative,changes:d.enteredTop3.length,
  sharedPool:[...new Set([...d.top3Before,...d.top3After])],
  originalRankedFromPrevious:[...d.top3Before]};
}
export function auditStabilityGuardVT37D(input:DatedSheet[]):StabilityGuardAudit7D{
 const days=[...input].sort((a,b)=>a.date.localeCompare(b.date));
 if(days.some((x,i)=>!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||
  (i>0&&x.date===days[i-1].date)))throw Error('Fechas inválidas o repetidas');
 const rows:StabilityGuardTurn7D[]=[];
 let eligibleTransitions=0,changedTransitions=0,testedTargets=0;
 let originalHits=0,conservativeHits=0,originalHitsChanged=0,conservativeHitsChanged=0;
 let expectedRandomUnionChanged=0,improvedTurns=0,worseTurns=0,tiedTurns=0;
 for(let i=6;i<days.length;i++){
  const day=days[i],history=days.slice(Math.max(0,i-10),i);
  for(const turn of TURNOS.slice(0,-1)){
   // Ambas políticas se congelan ANTES de abrir el sorteo objetivo.
   const preview=previewStabilityGuardVT37D(history,day.sheet,day.date,turn);
   const outcome=[...new Set((day.sheet.heads[preview.nextTarget]||[])
    .filter(h=>/^\d{4}$/.test(h)).map(h=>h.slice(-3)))];
   if(!outcome.length)continue;
   const win=new Set(outcome),original=preview.original,conservative=preview.conservative;
   const hb=original.filter(x=>win.has(x)).length;
   const hg=conservative.filter(x=>win.has(x)).length;
   const union=preview.sharedPool;
   const exp=union.length?original.length*union.filter(x=>win.has(x)).length/union.length:0;
   const changed=preview.active;
   rows.push({date:day.date,target:preview.nextTarget,justCompletedTurn:turn,
    changed,original,conservative,winners:outcome,originalHits:hb,
    conservativeHits:hg,randomUnionExpected:exp,
    budget:original.length,poolUnionSize:union.length});
   testedTargets++;originalHits+=hb;conservativeHits+=hg;
   if(preview.reason==='SIN_MARCA_NI_NUEVO_ELEGIBLE')eligibleTransitions++;
   if(changed){
    changedTransitions++;originalHitsChanged+=hb;conservativeHitsChanged+=hg;
    expectedRandomUnionChanged+=exp;
    if(hg>hb)improvedTurns++;else if(hg<hb)worseTurns++;else tiedTurns++;
   }
  }
 }
 return {protocol:'VT3_HOLD_UNCHANGED_EVIDENCE_V1',
  eligibleTransitions,changedTransitions,testedTargets,originalHits,
  conservativeHits,originalHitsChanged,conservativeHitsChanged,
  expectedRandomUnionChanged,improvedTurns,worseTurns,tiedTurns,rows,
  notes:[
   'La estabilidad conserva provisionalmente el Top3 anterior SÓLO cuando el turno cerrado no agregó ninguna marca ganadora VT3 ni ningún nuevo valor elegible.',
   'La candidata vieja debe seguir siendo físicamente legible en la tabla +11 al empezar el turno siguiente.',
   'No se ajustan pesos ni se amplía cupo. El lector original permanece intacto.',
   'El conjunto control del mismo presupuesto es la unión de valores del Top3 antiguo y nuevo en cada transición; sirve solo como referencia descriptiva.',
   'La ausencia de una marca VT3 no prueba que no haya ninguna otra información visual relevante en la columna nueva.',
   'El reloj adaptativo puede hacer DECAE o MUERE a varias figuras con una sola oportunidad sin reconfirmación; se evalúa si ello perjudica, sin asumirlo.',
   'Ensayo retrospectivo sobre datos usados anteriormente: no demuestra ventajas futuras.'
  ]};
}
