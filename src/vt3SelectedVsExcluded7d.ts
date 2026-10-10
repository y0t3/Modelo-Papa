// Modelo Papá — diagnóstico de Top3 VT3, NO nueva regla de pronóstico.
// Se inspecciona el pool adaptativo que YA EXISTÍA antes del sorteo,
// sin modificar la selección. Después se abre la cabeza objetivo para
// clasificar qué VT3 acertaron, cuáles se omitieron y cuáles no eran elegibles.
// Las marcas son rutas automáticas reconstruidas de resultados ANTERIORES,
// no presuntos trazos manuscritos seleccionados por el padre.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DatedSheet} from './cycle7d';
import type {DailySheet,SourceId} from './sheet';
import {freezeBeforeTurn7D} from './causalReplay7d';
import {analyzeAdaptive7D} from './adaptive7d';
import type {AdaptiveCandidate} from './adaptive7d';
import {observeProgressiveBoard7D} from './progressiveBoard7d';
import type {ProgressiveMark7D} from './progressiveBoard7d';
import {allPhysicalVT3Before7D} from './vt3NetworkCoverage7d';
import {routeZone} from './spatialFlow7d';

export type FeatureKey='HOY_MISMA_FORMA_Y_ORIGEN'|'HOY_FORMA_OTRA_COLUMNA'|
 'HOY_MISMAS_CELDAS'|'HOY_CONTACTO'|'HOY_RAMIFICACION'|
 'AYER_MISMA_FORMA_Y_ORIGEN'|'SEMANA_MISMA_FORMA_Y_ORIGEN'|
 'VT2_HOY_MISMO_SUFFIX_FISICO'|'ZONA_ARRIBA'|'ZONA_CENTRO'|
 'ZONA_ABAJO'|'ZONA_CRUZA';
export type VT3PoolInspectCandidate7D={
 value:string;sourceId:SourceId;cells:string[];shape:string;
 life:AdaptiveCandidate['state'];score:number;confirmations:number;
 lastSeenDraws:number;selected:boolean;features:FeatureKey[];
 rank:number;winning:false|true;zone:string;
};
export type VT3Inspect7D={
 date:string;turn:Turno;hasD7:boolean;columns:number;
 selected:string[];pool:VT3PoolInspectCandidate7D[];
 physicalPoolSize:number;inspectedPoolSize:number;
};
export type FeatureCount={selectedCount:number;selectedHits:number;
 excludedCount:number;excludedHits:number};
export type AuditTurn7D={
 date:string;turn:Turno;heads:string[];selected:string[];
 observedWinningValues:string[];selectedHits:number;
 eligibleWinningValues:string[];excludedWinningValues:string[];
 physicallyPossibleWinningValues:string[];notInEligiblePool:string[];
 selectedCount:number;poolCount:number;physicalCount:number;
};
export type MissedExample7D={date:string;turn:Turno;headVT3:string;
 missed:VT3PoolInspectCandidate7D;
 chosen:VT3PoolInspectCandidate7D[]};
export type VT3SelectionAudit7D={
 protocol:'VT3_SELECTED_VS_EXCLUDED_VISUAL_DIAGNOSTIC_V1';
 turns:number;turnsWithCandidates:number;selectedCandidates:number;
 selectedHits:number;eligibleCandidates:number;eligibleWinningValues:number;
 missedEligibleWinners:number;physicalWinningValues:number;
 winnersOutsideAdaptivePool:number;
 featureCounts:Record<FeatureKey,FeatureCount>;
 byTurn:Record<Turno,{turns:number;selected:number;hits:number;
  eligibleWinners:number;missedWinners:number;outsidePool:number}>;
 examples:MissedExample7D[];rows:AuditTurn7D[];
 notes:string[];
};
const FEATURE_KEYS:FeatureKey[]=[
 'HOY_MISMA_FORMA_Y_ORIGEN','HOY_FORMA_OTRA_COLUMNA',
 'HOY_MISMAS_CELDAS','HOY_CONTACTO','HOY_RAMIFICACION',
 'AYER_MISMA_FORMA_Y_ORIGEN','SEMANA_MISMA_FORMA_Y_ORIGEN',
 'VT2_HOY_MISMO_SUFFIX_FISICO','ZONA_ARRIBA','ZONA_CENTRO',
 'ZONA_ABAJO','ZONA_CRUZA'];
const shape=(p:{row:number;col:number}[])=>p.slice(1).map((c,i)=>
 (c.row-p[i].row)+','+(c.col-p[i].col)).join('>');
const edges=(cells:string[])=>cells.slice(1).map((v,i)=>cells[i]+'>'+v);
const allHeads=(sheet:DailySheet,turn:Turno)=>
 [...new Set((sheet.heads[turn]||[]).filter(x=>/^\d{4}$/.test(x)))];
function featureSet(c:AdaptiveCandidate, today:ProgressiveMark7D[],
 previous:ProgressiveMark7D[],week:ProgressiveMark7D[]):FeatureKey[]{
 const s=c.signature,coord=c.path.map(p=>p.row+':'+p.col);
 const normalized=(p:ProgressiveMark7D)=>p.shape.replaceAll('>',';');
 const same=(p:ProgressiveMark7D)=>p.kind==='vt3'&&normalized(p)===s;
 const sameSource=(p:ProgressiveMark7D)=>p.sourceId===c.sourceId;
 const t=today.filter(p=>p.kind==='vt3'&&sameSource(p));
 const prev=previous.filter(p=>same(p)&&sameSource(p));
 const weekly=week.filter(p=>same(p)&&sameSource(p));
 const exact=t.some(p=>same(p)&&p.cells.join('>')===coord.join('>'));
 const edgeSet=new Set(edges(coord));
 const branch=t.some(p=>p.cells.some(x=>coord.includes(x))&&
  edges(p.cells).some(x=>!edgeSet.has(x))&&edges(coord).some(x=>!edges(p.cells).includes(x)));
 const overlap=t.some(p=>p.cells.some(x=>coord.includes(x)));
 const includedVT2=today.some(p=>p.kind==='vt2'&&p.sourceId===c.sourceId&&
  p.cells.join('>')===coord.slice(-2).join('>'));
 const z=routeZone({route:c.path});
 const out:FeatureKey[]=[];
 if(t.some(same))out.push('HOY_MISMA_FORMA_Y_ORIGEN');
 if(today.some(p=>same(p)&&!sameSource(p)))out.push('HOY_FORMA_OTRA_COLUMNA');
 if(exact)out.push('HOY_MISMAS_CELDAS');
 if(overlap)out.push('HOY_CONTACTO');
 if(branch)out.push('HOY_RAMIFICACION');
 if(prev.length)out.push('AYER_MISMA_FORMA_Y_ORIGEN');
 if(weekly.length)out.push('SEMANA_MISMA_FORMA_Y_ORIGEN');
 if(includedVT2)out.push('VT2_HOY_MISMO_SUFFIX_FISICO');
 if(z==='ARRIBA')out.push('ZONA_ARRIBA');
 if(z==='CENTRO')out.push('ZONA_CENTRO');
 if(z==='ABAJO')out.push('ZONA_ABAJO');
 if(z==='CRUZA_ZONAS')out.push('ZONA_CRUZA');
 return out;
}
export function inspectBeforeVT3Selection7D(history:DatedSheet[],full:DailySheet,
 date:string,turn:Turno):VT3Inspect7D{
 if(!TURNOS.includes(turn)||history.some(x=>x.date>=date))
  throw Error('Turno inválido o fuga temporal');
 const before=freezeBeforeTurn7D(full,turn);
 const board=observeProgressiveBoard7D(history,before,date,turn);
 const engine=analyzeAdaptive7D([...history,{date,sheet:before}],before,
  date,turn,{inspectVT3Pool:true});
 const selected=engine.candidates.filter(x=>x.kind==='vt3').map(x=>x.value);
 const selectedSet=new Set(selected);
 const source=engine.vt3PoolForAudit||[];
 if(selected.some(v=>!source.some(x=>x.value===v)))
  throw Error('La instrumentación no reproduce el Top3 original');
 const physical=allPhysicalVT3Before7D(before);
 const pool:VT3PoolInspectCandidate7D[]=source.map((c,i)=>{
  if(!physical.has(c.value)||!/^\d{3}$/.test(c.value))
   throw Error('Ruta VT3 fuera de la columna física');
  const marks=featureSet(c,board.marksToday,
   board.lastDraw?.marks||[],board.previousWeek?.marks||[]);
  return {value:c.value,sourceId:c.sourceId,
   cells:c.path.map(p=>p.row+':'+p.col),shape:shape(c.path),life:c.state,
   score:c.score,confirmations:c.confirmations,
   lastSeenDraws:c.lastSeenDraws,selected:selectedSet.has(c.value),
   features:marks,rank:i+1,winning:false,zone:routeZone({route:c.path})};
 });
 if(pool.filter(x=>x.selected).length!==selected.length||
  pool.slice(0,selected.length).some((c,i)=>c.value!==selected[i]))
  throw Error('Pool VT3 alteró orden o contenido de la selección original');
 return {date,turn,hasD7:!!board.previousWeek,columns:board.visibleColumns.length,
  selected,pool,physicalPoolSize:physical.size,inspectedPoolSize:pool.length};
}
export function auditSelectedVsExcludedVT37D(input:DatedSheet[],maxExamples=20):VT3SelectionAudit7D{
 const days=[...input].sort((a,b)=>a.date.localeCompare(b.date));
 if(days.some((x,i)=>!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||
  (i>0&&x.date===days[i-1].date)))throw Error('Fechas repetidas o inválidas');
 const featureCounts=Object.fromEntries(FEATURE_KEYS.map(k=>[k,{
  selectedCount:0,selectedHits:0,excludedCount:0,excludedHits:0
 }])) as Record<FeatureKey,FeatureCount>;
 const byTurn=Object.fromEntries(TURNOS.map(t=>[t,{
  turns:0,selected:0,hits:0,eligibleWinners:0,missedWinners:0,outsidePool:0
 }])) as VT3SelectionAudit7D['byTurn'];
 const examples:MissedExample7D[]=[],rows:AuditTurn7D[]=[];
 let turnsWithCandidates=0,selectedCandidates=0,selectedHits=0;
 let eligibleCandidates=0,eligibleWinningValues=0,missedEligibleWinners=0;
 let physicalWinningValues=0,winnersOutsideAdaptivePool=0;
 for(let i=6;i<days.length;i++){
  const day=days[i],history=days.slice(Math.max(0,i-10),i);
  for(const turn of TURNOS){
   // Inspección congelada: no utiliza cabezas del turno a evaluar.
   const snapshot=inspectBeforeVT3Selection7D(history,day.sheet,day.date,turn);
   const heads=allHeads(day.sheet,turn);if(!heads.length)continue;
   const winners=[...new Set(heads.map(h=>h.slice(-3)))];
   const win=new Set(winners),poolSet=new Set(snapshot.pool.map(x=>x.value));
   const physical=allPhysicalVT3Before7D(freezeBeforeTurn7D(day.sheet,turn));
   const selectable=winners.filter(x=>poolSet.has(x));
   const missed=selectable.filter(x=>!snapshot.selected.includes(x));
   const outside=winners.filter(x=>!poolSet.has(x));
   const canPhysicallyForm=winners.filter(x=>physical.has(x));
   const hits=snapshot.selected.filter(x=>win.has(x)).length;
   for(const cand of snapshot.pool){
    const winning=win.has(cand.value);
    for(const key of cand.features){
     const count=featureCounts[key];
     if(cand.selected){
      count.selectedCount++;count.selectedHits+=Number(winning);
     }else{
      count.excludedCount++;count.excludedHits+=Number(winning);
     }
    }
   }
   for(const value of missed)if(examples.length<maxExamples){
    const sample=snapshot.pool.find(x=>x.value===value)!;
    examples.push({date:day.date,turn,headVT3:value,
     missed:{...sample,winning:true},
     chosen:snapshot.pool.filter(x=>x.selected).map(x=>({
      ...x,winning:win.has(x.value)
     }))});
   }
   rows.push({date:day.date,turn,heads,selected:snapshot.selected,
    observedWinningValues:winners,selectedHits:hits,
    eligibleWinningValues:selectable,excludedWinningValues:missed,
    physicallyPossibleWinningValues:canPhysicallyForm,
    notInEligiblePool:outside,selectedCount:snapshot.selected.length,
    poolCount:snapshot.pool.length,physicalCount:physical.size});
   const per=byTurn[turn];per.turns++;per.selected+=snapshot.selected.length;
   per.hits+=hits;per.eligibleWinners+=selectable.length;
   per.missedWinners+=missed.length;per.outsidePool+=outside.length;
   turnsWithCandidates+=Number(snapshot.selected.length>0);
   selectedCandidates+=snapshot.selected.length;selectedHits+=hits;
   eligibleCandidates+=snapshot.pool.length;
   eligibleWinningValues+=selectable.length;missedEligibleWinners+=missed.length;
   physicalWinningValues+=canPhysicallyForm.length;
   winnersOutsideAdaptivePool+=outside.length;
  }
 }
 return {protocol:'VT3_SELECTED_VS_EXCLUDED_VISUAL_DIAGNOSTIC_V1',
  turns:rows.length,turnsWithCandidates,selectedCandidates,selectedHits,
  eligibleCandidates,eligibleWinningValues,missedEligibleWinners,
  physicalWinningValues,winnersOutsideAdaptivePool,
  featureCounts,byTurn,examples,rows,notes:[
   'La instrumentación entrega TODAS las cifras distintas consideradas por el adaptativo antes del corte Top3, en el mismo orden.',
   'Las marcas, relaciones espaciales y antecedentes HOY/AYER/D−7 se calculan ANTES del resultado objetivo; no alteran ranking ni pesos.',
   'Las cabezas futuras se consultan exclusivamente para etiquetar ganador/no ganador DESPUÉS.',
   'Contar candidatas y episodios no multiplica sorteos independientes; VT2 contenido no se suma como acierto aparte.',
   'La diferencia seleccionados/excluidos puede ser sesgada por volumen, repetición y otras características: no demuestra causalidad.',
   'La cifra ganadora fuera del pool adaptativo no es error de ranking; distinguir límites del pool, físico y Top3.',
   'Primeros ejemplos de VT3 omitidos en orden cronológico (no seleccionados por resultado favorable).',
   'No promover una nueva regla sobre estos mismos períodos explorados sin prospectivo pre-sorteo.'
  ]};
}
