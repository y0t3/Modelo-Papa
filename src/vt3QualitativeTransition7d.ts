// MODELO PAPÁ — hipótesis congelada de TRANSICIÓN visual VT3.
// Misma tabla +11 progresiva, mismo conjunto adaptativo y mismo Top3.
// La señal no es el conteo de confirmaciones: examina un cambio físico de
// dirección de una figura VT3 ya ganadora en un turno anterior de HOY,
// en la MISMA columna de origen, con contacto de celdas y posible antecedente
// del movimiento en la jornada anterior. Las cabezas del objetivo se abren
// solo para evaluar, NUNCA para elegir las ternas.
// Es una hipótesis experimental, no el método manual verificado de papá.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DatedSheet} from './cycle7d';
import type {DailySheet,SourceId} from './sheet';
import {inspectBeforeVT3Selection7D} from './vt3SelectedVsExcluded7d';
import type {VT3PoolInspectCandidate7D} from './vt3SelectedVsExcluded7d';
import {observeProgressiveBoard7D} from './progressiveBoard7d';
import type {ProgressiveMark7D} from './progressiveBoard7d';
import {freezeBeforeTurn7D} from './causalReplay7d';

export type VisualTransitionClass7D='PUENTE_AYER_HOY_GIRO'|'GIRO_HOY'|'SIN_GIRO';
export type VisualTransition7D={
 signal:VisualTransitionClass7D;level:0|1|2;
 sourceId:SourceId;candidateVT3:string;candidateCells:string[];
 anchor?:{date:string;winningTurn:Turno;head:string;cells:string[];shape:string};
 antecedentYesterday?:{date:string;winningTurn:Turno;head:string;
  cells:string[];shape:string};
 sharedCells:string[];
};
export type TransitionCandidate7D={
 value:string;sourceId:SourceId;cells:string[];rankOriginal:number;
 scoreOriginal:number;transition:VisualTransition7D;
};
export type TransitionSelection7D={
 date:string;turn:Turno;columns:number;hasPreviousWeek:boolean;
 sameBudget:number;eligiblePoolSize:number;changed:number;
 baseline:TransitionCandidate7D[];transformed:TransitionCandidate7D[];
 allQualified:{bridge:number;intraday:number};
};
export type TransitionReplayRow7D={
 date:string;turn:Turno;heads:string[];selectedOriginal:string[];
 selectedVisual:string[];originalHits:number;visualHits:number;
 budget:number;poolSize:number;changed:number;bridgeSelected:number;
 intradaySelected:number;expectedSamePool:number;
};
export type TransitionReplay7D={
 protocol:'VT3_QUALITATIVE_INTRADAY_TRANSITION_V1';
 turns:number;turnsChanged:number;changedPicks:number;picks:number;
 baselineHits:number;visualHits:number;randomExpectedSamePool:number;
 turnsImproved:number;turnsWorsened:number;turnsEqual:number;
 totalBridges:number;totalIntraday:number;
 byTurn:Record<Turno,{turns:number;changed:number;baselineHits:number;
  visualHits:number;picks:number;expectedSamePool:number}>;
 rows:TransitionReplayRow7D[];notes:string[];
};
const normShape=(m:ProgressiveMark7D)=>m.shape.replaceAll('>',';');
const compare=(a:string,b:string)=>a.localeCompare(b);
/** Retorna una sola evidencia representativa por candidata.
 * No multiplica apoyo por cantidad de marcas o rutas de una cabeza.
 * Prioridad predefinida: PUENTE ayer→hoy→giro, luego giro hoy, luego
 * orden adaptativo PREEXISTENTE. Ningún ajuste con resultados.
 */
export function classifyVisualTransitionVT37D(
 candidate:Pick<VT3PoolInspectCandidate7D,'value'|'sourceId'|'cells'|'shape'>,
 today:ProgressiveMark7D[],yesterday:ProgressiveMark7D[]
):VisualTransition7D{
 if(candidate.cells.length!==3||!/^\d{3}$/.test(candidate.value)||
  new Set(candidate.cells).size!==3)throw Error('Candidata VT3 física inválida');
 const base={sourceId:candidate.sourceId,candidateVT3:candidate.value,
  candidateCells:[...candidate.cells]};
 const anchors=today.filter(m=>m.kind==='vt3'&&
  m.sourceId===candidate.sourceId&&m.cells.length===3&&
  normShape(m)!==candidate.shape&&m.cells.some(x=>candidate.cells.includes(x)));
 if(!anchors.length)return {...base,signal:'SIN_GIRO',level:0,sharedCells:[]};
 // Cualquier antecedente relevante debe ser de otro sorteo ya finalizado
 // (jornada anterior), misma fuente física y MISMA forma del ancla actual.
 // El cambio a la ruta candidata constituye el giro observable de HOY.
 const linked=anchors.map(anchor=>({
  anchor,old:yesterday.find(m=>m.kind==='vt3'&&
   m.sourceId===anchor.sourceId&&normShape(m)===normShape(anchor))
 }));
 const best=linked.find(x=>!!x.old)||linked[0];
 const a=best.anchor,o=best.old;
 return {...base,signal:o?'PUENTE_AYER_HOY_GIRO':'GIRO_HOY',
  level:o?2:1,sharedCells:candidate.cells.filter(x=>a.cells.includes(x)),
  anchor:{date:a.date,winningTurn:a.winningTurn,head:a.head,
   cells:[...a.cells],shape:normShape(a)},
  ...(o?{antecedentYesterday:{date:o.date,winningTurn:o.winningTurn,
   head:o.head,cells:[...o.cells],shape:normShape(o)}}:{})};
}
export function selectQualitativeVT3Transition7D(
 history:DatedSheet[],full:DailySheet,date:string,turn:Turno
):TransitionSelection7D{
 if(!TURNOS.includes(turn)||history.some(x=>x.date>=date))
  throw Error('Turno inválido o fuga temporal');
 const before=freezeBeforeTurn7D(full,turn);
 const inspected=inspectBeforeVT3Selection7D(history,before,date,turn);
 const observed=observeProgressiveBoard7D(history,before,date,turn);
 const ranked:TransitionCandidate7D[]=inspected.pool.map(c=>({
  value:c.value,sourceId:c.sourceId,cells:[...c.cells],rankOriginal:c.rank,
  scoreOriginal:c.score,
  transition:classifyVisualTransitionVT37D(c,observed.marksToday,
   observed.lastDraw?.marks||[])
 }));
 const count=inspected.selected.length;
 const original=ranked.slice(0,count);
 const visual=[...ranked].sort((a,b)=>
  b.transition.level-a.transition.level||
  a.rankOriginal-b.rankOriginal).slice(0,count);
 const values=new Set(original.map(x=>x.value));
 if(visual.length!==original.length||new Set(visual.map(x=>x.value)).size!==visual.length||
   original.some((x,i)=>x.value!==inspected.selected[i]))
  throw Error('El selector visual alteró cupo, datos o referencia original');
 return {date,turn,columns:inspected.columns,hasPreviousWeek:inspected.hasD7,
  sameBudget:count,eligiblePoolSize:ranked.length,
  changed:visual.filter(x=>!values.has(x.value)).length,
  baseline:original,transformed:visual,
  allQualified:{bridge:ranked.filter(x=>x.transition.level===2).length,
   intraday:ranked.filter(x=>x.transition.level===1).length}};
}
export function auditQualitativeVT3Transition7D(input:DatedSheet[]):TransitionReplay7D{
 const dated=[...input].sort((a,b)=>compare(a.date,b.date));
 if(dated.some((d,i)=>!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||
  (i>0&&d.date===dated[i-1].date)))throw Error('Historial inválido o duplicado');
 const byTurn=Object.fromEntries(TURNOS.map(t=>[t,{
  turns:0,changed:0,baselineHits:0,visualHits:0,picks:0,expectedSamePool:0
 }])) as TransitionReplay7D['byTurn'];
 const rows:TransitionReplayRow7D[]=[];
 let turnsChanged=0,changedPicks=0,picks=0,baselineHits=0,visualHits=0;
 let randomExpectedSamePool=0,turnsImproved=0,turnsWorsened=0;
 let turnsEqual=0,totalBridges=0,totalIntraday=0;
 for(let i=6;i<dated.length;i++){
  const day=dated[i],prior=dated.slice(Math.max(0,i-10),i);
  for(const turn of TURNOS){
   // Totalmente ciego: se congela la selección ANTES de leer las cabezas.
   const projection=selectQualitativeVT3Transition7D(prior,day.sheet,day.date,turn);
   const heads=[...new Set((day.sheet.heads[turn]||[])
    .filter(h=>/^\d{4}$/.test(h)))];
   if(!heads.length)continue;
   const actual=new Set(heads.map(h=>h.slice(-3)));
   const base=projection.baseline.map(x=>x.value);
   const trans=projection.transformed.map(x=>x.value);
   const hb=base.filter(x=>actual.has(x)).length;
   const hv=trans.filter(x=>actual.has(x)).length;
   // Pool de valores elegibles completo: su máximo retrospectivo
   // NO debe confundirse con candidatos publicados.
   const all=inspectBeforeVT3Selection7D(prior,day.sheet,day.date,turn).pool;
   const countInPool=all.filter(x=>actual.has(x.value)).length;
   const expected=all.length?base.length*countInPool/all.length:0;
   rows.push({date:day.date,turn,heads,
    selectedOriginal:base,selectedVisual:trans,originalHits:hb,
    visualHits:hv,budget:base.length,poolSize:all.length,
    changed:projection.changed,
    bridgeSelected:projection.transformed.filter(x=>x.transition.level===2).length,
    intradaySelected:projection.transformed.filter(x=>x.transition.level===1).length,
    expectedSamePool:expected});
   const r=byTurn[turn];r.turns++;r.changed+=projection.changed;
   r.baselineHits+=hb;r.visualHits+=hv;r.picks+=base.length;
   r.expectedSamePool+=expected;
   turnsChanged+=Number(projection.changed>0);
   changedPicks+=projection.changed;picks+=base.length;
   baselineHits+=hb;visualHits+=hv;randomExpectedSamePool+=expected;
   totalBridges+=projection.transformed.filter(x=>x.transition.level===2).length;
   totalIntraday+=projection.transformed.filter(x=>x.transition.level===1).length;
   if(hv>hb)turnsImproved++;else if(hv<hb)turnsWorsened++;else turnsEqual++;
  }
 }
 return {protocol:'VT3_QUALITATIVE_INTRADAY_TRANSITION_V1',
  turns:rows.length,turnsChanged,changedPicks,picks,baselineHits,
  visualHits,randomExpectedSamePool,turnsImproved,turnsWorsened,turnsEqual,
  totalBridges,totalIntraday,byTurn,rows,notes:[
   'La hipótesis se fijó antes del cotejo: un giro hoy en misma columna, más su ancla geométrica en la jornada anterior, tiene prioridad sobre un giro sin antecedente, y éste sobre figuras sin giro.',
   'Un giro es ruta VT3 físicamente válida que comparte celdas con una figura VT3 ganadora anterior de HOY, pero tiene secuencia distinta de movimientos.',
   'Cada ruta individual está contenida en una sola columna física +11; relaciones entre columnas no autorizan cruzar celdas.',
   'La cifra candidata se toma EXCLUSIVAMENTE del pool adaptativo preexistente; cupo Top3 y desempate conservan el orden previo.',
   'El resultado objetivo se abre después de elegir las mismas tres ternas; se compara lector original y control uniforme del mismo pool/cupo.',
   'Un respaldo de ayer sólo se usa cuando existe realmente; D−7 NO es requisito.',
   'Los períodos ya inspeccionados son exploratorios; sin prueba prospectiva no hay ventaja predictiva demostrada.'
  ]};
}
