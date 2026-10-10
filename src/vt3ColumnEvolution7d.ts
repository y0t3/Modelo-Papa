// MODELO PAPÁ — observador de la diferencia entre cortes +11 consecutivos.
// No propone cifras nuevas. Distingue el efecto de la columna recién sumada
// del cambio de memoria debido al sorteo que acaba de finalizar.
// Todos los cortes excluyen las cabezas del objetivo y turnos futuros.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {DatedSheet} from './cycle7d';
import {inspectBeforeVT3Selection7D} from './vt3SelectedVsExcluded7d';
import type {VT3PoolInspectCandidate7D} from './vt3SelectedVsExcluded7d';
import {observeProgressiveBoard7D} from './progressiveBoard7d';
import type {ProgressiveMark7D} from './progressiveBoard7d';
import {freezeBeforeTurn7D} from './causalReplay7d';
import {allPhysicalVT3Before7D} from './vt3NetworkCoverage7d';

export type ColumnDeltaCandidate7D={
 value:string;sourceId:SourceId;cells:string[];shape:string;
 oldRank:number|null;newRank:number;oldState:string|null;newState:string;
 oldScore:number|null;newScore:number;
 previouslySelected:boolean;selectedNow:boolean;
 newlyEligible:boolean;comesFromNewColumn:boolean;
 newMarks:{sameShapeSameColumn:number;sameShapeOtherColumn:number;
  samePhysicalCells:number;contactSameColumn:number};
};
export type ColumnDelta7D={
 protocol:'VT3_INCREMENTAL_COLUMN_DELTA_V1';
 date:string;justCompletedTurn:Turno;previousTarget:Turno;nextTarget:Turno;
 previousColumns:number;currentColumns:number;
 newColumn:{id:SourceId;values:string[]};
 newRecordedHeads:string[];newVerifiedVT3Marks:number;
 physicalBefore:number;physicalAfter:number;physicalNewSource:number;
 physicalNewValues:number;
 eligibleBefore:number;eligibleAfter:number;
 newlyEligible:number;newlyEligibleFromNewColumn:number;
 newlyEligibleFromOldColumns:number;noLongerEligible:number;
 top3Before:string[];top3After:string[];
 retainedTop3:string[];enteredTop3:string[];leftTop3:string[];
 rankOrStatusChangeWithoutEntering:number;
 candidateDetails:ColumnDeltaCandidate7D[];
 explanation:string[];
};
const shapeOf=(c:string)=>c.replaceAll('>',';');
const relation=(candidate:VT3PoolInspectCandidate7D,marks:ProgressiveMark7D[])=>
 marks.reduce((out,m)=>{
  if(m.kind!=='vt3')return out;
  const sameSource=m.sourceId===candidate.sourceId;
  if(m.shape.replaceAll('>',';')===shapeOf(candidate.shape)){
   if(sameSource)out.sameShapeSameColumn++;else out.sameShapeOtherColumn++;
  }
  if(sameSource){
   if(m.cells.join('>')===candidate.cells.join('>'))out.samePhysicalCells++;
   if(m.cells.some(x=>candidate.cells.includes(x)))out.contactSameColumn++;
  }
  return out;
 },{sameShapeSameColumn:0,sameShapeOtherColumn:0,
    samePhysicalCells:0,contactSameColumn:0});
/** Compara SOLO dos cortes consecutivos de la misma fecha, sin alterar
 * el orden ni el Top3 de ninguno. Las marcas recién conocidas pertenecen
 * al turno finalizado al pasar de un corte al siguiente.
 */
export function compareNextColumnVT37D(history:DatedSheet[],full:DailySheet,
 date:string,justCompletedTurn:Turno):ColumnDelta7D{
 const index=TURNOS.indexOf(justCompletedTurn);
 if(index<0||index>=TURNOS.length-1)throw Error('No existe un siguiente turno');
 if(history.some(x=>x.date>=date)||new Set(history.map(x=>x.date)).size!==history.length)
  throw Error('Historia repetida o fuga temporal');
 const previousTarget=justCompletedTurn,nextTarget=TURNOS[index+1];
 const oldSheet=freezeBeforeTurn7D(full,previousTarget);
 const nextSheet=freezeBeforeTurn7D(full,nextTarget);
 const before=inspectBeforeVT3Selection7D(history,oldSheet,date,previousTarget);
 const after=inspectBeforeVT3Selection7D(history,nextSheet,date,nextTarget);
 const board=observeProgressiveBoard7D(history,nextSheet,date,nextTarget);
 if(after.columns!==before.columns+1||after.columns!==index+2)
  throw Error('La progresión de +11 no tiene exactamente una columna nueva');
 const column=board.visibleColumns[board.visibleColumns.length-1];
 if(column.id!==justCompletedTurn)throw Error('Origen de nueva columna inesperado');
 const newMarks=board.marksToday.filter(m=>m.winningTurn===justCompletedTurn&&m.kind==='vt3');
 const beforeByValue=new Map(before.pool.map(x=>[x.value,x]));
 const afterByValue=new Map(after.pool.map(x=>[x.value,x]));
 const beforeSelected=new Set(before.selected);
 const afterSelected=new Set(after.selected);
 const details:ColumnDeltaCandidate7D[]=after.pool.map(x=>{
  const older=beforeByValue.get(x.value);
  return {value:x.value,sourceId:x.sourceId,cells:[...x.cells],
   shape:x.shape,oldRank:older?.rank??null,newRank:x.rank,
   oldState:older?.life??null,newState:x.life,oldScore:older?.score??null,
   newScore:x.score,previouslySelected:beforeSelected.has(x.value),
   selectedNow:afterSelected.has(x.value),newlyEligible:!older,
   comesFromNewColumn:x.sourceId===column.id,
   newMarks:relation(x,newMarks)};
 });
 const oldPhysical=allPhysicalVT3Before7D(oldSheet);
 const afterPhysical=allPhysicalVT3Before7D(nextSheet);
 const newSourcePhysical=allPhysicalVT3Before7D({...nextSheet,columns:[
  nextSheet.columns[nextSheet.columns.length-1]
 ]});
 const retainedTop3=after.selected.filter(x=>beforeSelected.has(x));
 const enteredTop3=after.selected.filter(x=>!beforeSelected.has(x));
 const leftTop3=before.selected.filter(x=>!afterSelected.has(x));
 const newlyEligible=details.filter(x=>x.newlyEligible);
 const noLonger=[...beforeByValue.keys()].filter(x=>!afterByValue.has(x));
 const moves=details.filter(x=>!x.newlyEligible&&x.oldRank!==x.newRank);
 const heads=(full.heads[justCompletedTurn]||[]).filter(x=>/^\d{4}$/.test(x));
 return {protocol:'VT3_INCREMENTAL_COLUMN_DELTA_V1',
  date,justCompletedTurn,previousTarget,nextTarget,
  previousColumns:before.columns,currentColumns:after.columns,
  newColumn:{id:column.id,values:[...column.values]},
  newRecordedHeads:[...heads],newVerifiedVT3Marks:newMarks.length,
  physicalBefore:oldPhysical.size,physicalAfter:afterPhysical.size,
  physicalNewSource:newSourcePhysical.size,
  physicalNewValues:[...afterPhysical].filter(x=>!oldPhysical.has(x)).length,
  eligibleBefore:before.pool.length,eligibleAfter:after.pool.length,
  newlyEligible:newlyEligible.length,
  newlyEligibleFromNewColumn:newlyEligible.filter(x=>x.comesFromNewColumn).length,
  newlyEligibleFromOldColumns:newlyEligible.filter(x=>!x.comesFromNewColumn).length,
  noLongerEligible:noLonger.length,
  top3Before:[...before.selected],top3After:[...after.selected],
  retainedTop3,enteredTop3,leftTop3,
  rankOrStatusChangeWithoutEntering:moves.length,
  candidateDetails:details,
  explanation:[
   'El corte siguiente incorpora UNA columna +11 y las marcas ganadoras del turno recién terminado; ambos hechos pueden alterar el ranking.',
   'Un valor nuevo en columna antigua no es una columna nueva: puede activarse por memoria de un turno comprobado recién incorporado.',
   'Los conjuntos físicamente formables son techos de geometría, no listas para jugar ni nuevos candidatos.',
   'Coincidencias de formas entre columnas NO mezclan sus celdas. Contactos y mismas celdas se cuentan sólo dentro de una columna.',
   'Las marcas de hoy proceden de cabezas conocidas tras el turno completado, no de resultados del objetivo siguiente.',
   'Ningún cambio de Top3 demuestra predictibilidad sin contrastarlo en sorteos posteriores.'
  ]};
}
export type DayColumnEvolution7D={date:string;
 stages:ColumnDelta7D[];
 top3ByTurn:{turn:Turno;selected:string[]}[];
 changesTotal:number;newlyEligibleFromNewColumns:number;stageWithNoChange:number;
};
export function traceDayColumnEvolution7D(history:DatedSheet[],full:DailySheet,
 date:string):DayColumnEvolution7D{
 const stages=TURNOS.slice(0,-1).map(t=>compareNextColumnVT37D(history,full,date,t));
 return {date,stages,
  top3ByTurn:[
   {turn:'Previa',selected:[...stages[0].top3Before]},
   ...stages.map(s=>({turn:s.nextTarget,selected:[...s.top3After]}))
  ],
  changesTotal:stages.reduce((n,s)=>n+s.enteredTop3.length,0),
  newlyEligibleFromNewColumns:stages.reduce((n,s)=>n+s.newlyEligibleFromNewColumn,0),
  stageWithNoChange:stages.filter(s=>s.enteredTop3.length===0).length};
}
