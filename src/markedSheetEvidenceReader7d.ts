// AUDITORÍA OPCIONAL DE FIDELIDAD A UNA FOTO MANUSCRITA.
// No participa de la RECONSTRUCCIÓN HISTÓRICA del método: para ésta,
// cada cabeza YA SORTEADA se busca en +11 previo al turno, y se dibujan
// sus coincidencias (src/markedSheetAfterDraw7d.ts / markedSheet7d.ts).
// Sólo si queremos reproducir exactamente qué tinta/flecha se ve en
// una fotografía, necesitamos certificar orden/celdas del papel.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {DatedSheet} from './cycle7d';
import {freezeBeforeTurn7D} from './causalReplay7d';
import {tagVisualSource7D,assessMarkAgainstRoute7D} from './manualMarkProvenance7d';
import type {ManualMark7D} from './manualMarkProvenance7d';

export type VisualEvidenceStatus7D=
 'FOTOGRAMA_REFERENCIADO_SIN_CELDAS_DIGITALIZADAS'|
 'CELDAS_MANUALES_RESALTADAS_SIN_ORDEN'|
 'TRAZO_MANUAL_ORDENADO_VERIFICADO'|
 'RUTA_AUTOMATICA_NO_MANUAL';
export type MarkedSheetWitness7D={
 id:string;date:string;turn:Turno;
 sourceId:SourceId;kind:'VT2'|'VT3'|'VT4';
 // Cabeza coincidente conocida; su posición en la hoja se verifica aparte.
 headCoincidente:string;
 // Evita suponer que el número estaba legible debajo cuando sólo
 // se recuperó del resultado publicado.
 headLocation:'DEBAJO_VISIBLE'|'RESULTADO_CONOCIDO_ANOTACION_NO_VERIFICADA';
 status:VisualEvidenceStatus7D;
 cells:string[];
 // Video: nombre y segundo exacto; imagen: nombre de archivo+zona;
 // si sólo hay informe previo, se declara que la ruta NO fue inspeccionada.
 reference:string;observation:string;
};
export type MarkedSheetRecord7D={
 date:string;mediaReferences:string[];
 // Es una hoja con marcas: aunque no podamos leer la dirección,
 // la fuente real existe y no se inventan coordenadas.
 witnesses:MarkedSheetWitness7D[];
};
export type MarkedWitnessReview7D={
 id:string;date:string;turn:Turno;headCoincidente:string;
 headLocation:'DEBAJO_VISIBLE'|'RESULTADO_CONOCIDO_ANOTACION_NO_VERIFICADA';sourceId:SourceId;
 status:VisualEvidenceStatus7D;
 manualTraceConfirmed:boolean;
 sourceExistsBeforeOwnDraw:boolean;
 sourceVisibleNow:boolean;
 originalRead?:string;
 currentRead?:string;
 coordinates:string[];
 warning?:string;
};
export type MarkedSheetVisualReading7D={
 date:string;target:Turno;visibleColumns:SourceId[];
 realHistoricalSheets:number;witnessesAvailable:number;
 confirmedManualTraces:number;
 pendingOriginalImageCheck:number;unverifiedHighlightedGroups:number;
 automaticReconstructionsExcluded:number;
 reviews:MarkedWitnessReview7D[];
 decision:'FOTO_PENDIENTE_DE_VERIFICACION'|'FOTO_CON_TRAZOS_VERIFICADOS';
 notes:string[];
};
const idx=(turn:Turno)=>TURNOS.indexOf(turn);
const existsBefore=(date:string,turn:Turno,goalDate:string,target:Turno)=>
 date<goalDate||(date===goalDate&&idx(turn)<idx(target));
const cellsRead=(values:string[],cells:string[])=>{
 const digits=cells.map(c=>{const [r,side]=c.split(':').map(Number);
  return values[r]?.[side]||'';
 });
 return digits.every(d=>/^\d$/.test(d))?digits.join(''):undefined;
};
export function validateMarkedWitness7D(w:MarkedSheetWitness7D):MarkedSheetWitness7D{
 if(!w.id.trim()||!['DEBAJO_VISIBLE','RESULTADO_CONOCIDO_ANOTACION_NO_VERIFICADA'].includes(w.headLocation)||!/^\d{4}-\d{2}-\d{2}$/.test(w.date)||
  !TURNOS.includes(w.turn)||!/^\d{4}$/.test(w.headCoincidente)||
  !w.reference.trim())throw Error('Testimonio sin identidad, fecha, cabeza o fuente visual');
 if(w.status==='FOTOGRAMA_REFERENCIADO_SIN_CELDAS_DIGITALIZADAS'){
  if(w.cells.length)throw Error('No se pueden atribuir celdas a un fotograma sin digitalización');
  return {...w,cells:[]};
 }
 const p:ManualMark7D['provenance']=w.status==='TRAZO_MANUAL_ORDENADO_VERIFICADO'?
  'MANUAL_TRAZO_ORDENADO':
  w.status==='CELDAS_MANUALES_RESALTADAS_SIN_ORDEN'?
  'MANUAL_CELDAS_RESALTADAS':'AUTO_DESPUES_CABEZA';
 tagVisualSource7D({
  date:w.date,turn:w.turn,kind:w.kind,sourceId:w.sourceId,
  provenance:p,cells:w.cells,supportReference:w.reference
 });
 if(w.status==='TRAZO_MANUAL_ORDENADO_VERIFICADO'&&
  assessMarkAgainstRoute7D({
   date:w.date,turn:w.turn,kind:w.kind,sourceId:w.sourceId,
   provenance:p,cells:w.cells,supportReference:w.reference
  },w.cells)!=='TRAZO_EXACTO_VERIFICADO')throw Error('No se verificó el recorrido ordenado');
 return {...w,cells:[...w.cells]};
}
/** Auditoría de coincidencia con una FOTO original, no condición de acceso
 * a los recorridos retrospectivos válidos. Los matches ya reconstruidos
 * en markedSheetAfterDraw7d.ts siguen siendo la hoja marcada estudiable.
 */
export function readMarkedSheetEvidenceBefore7D(
 history:DatedSheet[],full:DailySheet,date:string,target:Turno,
 records:MarkedSheetRecord7D[]):MarkedSheetVisualReading7D{
 if(idx(target)<0||!/^\d{4}-\d{2}-\d{2}$/.test(date)||
  history.some(x=>x.date>=date)||new Set(history.map(x=>x.date)).size!==history.length)
  throw Error('Historia o turno inválido: fuga temporal');
 const frozen=freezeBeforeTurn7D(full,target);
 const historyByDate=new Map(history.map(x=>[x.date,x.sheet]));
 const seen=new Set<string>(),reviews:MarkedWitnessReview7D[]=[];
 const historical=new Set<string>();
 for(const r of records){
  if(!r.mediaReferences.length||r.mediaReferences.some(x=>!x.trim())||
   r.date>date)throw Error('Registro sin evidencia o posterior a la hoja actual');
  if(r.date<date)historical.add(r.date);
  for(const original of r.witnesses){
   const w=validateMarkedWitness7D(original);
   if(w.date!==r.date||seen.has(w.id))throw Error('Testimonio con fecha incongruente o duplicado');
   seen.add(w.id);
   if(!existsBefore(w.date,w.turn,date,target))continue;
   const historicalSheet=w.date===date?frozen:historyByDate.get(w.date);
   // No afirmar que un trazo manual es verificable contra una hoja
   // histórica si ni siquiera conservamos la columna fuente.
   const col=historicalSheet?.columns.find(x=>x.id===w.sourceId);
   const currently=frozen.columns.find(x=>x.id===w.sourceId);
   const isExact=w.status==='TRAZO_MANUAL_ORDENADO_VERIFICADO';
   const originalRead=isExact&&col?cellsRead(col.values,w.cells):undefined;
   if(isExact&&col&&originalRead&&
    !w.headCoincidente.endsWith(originalRead))
    throw Error('Trazo manual y cabeza anotada debajo no coinciden');
   const active=isExact&&w.headLocation==='DEBAJO_VISIBLE'&&
    !!col&&originalRead!==undefined&&w.headCoincidente.endsWith(originalRead);
   reviews.push({id:w.id,date:w.date,turn:w.turn,headCoincidente:w.headCoincidente,
    headLocation:w.headLocation,
    sourceId:w.sourceId,status:w.status,
    manualTraceConfirmed:active,
    sourceExistsBeforeOwnDraw:!!col,sourceVisibleNow:!!currently,
    ...(originalRead?{originalRead}:{}),
    ...(active&&currently?{currentRead:cellsRead(currently.values,w.cells)}:{}),
    coordinates:[...w.cells],
    ...(!active?{warning:
      isExact?'No se puede comprobar el trazo con la hoja histórica disponible':
      'El fotograma, las celdas sin dirección o una ruta automática NO identifican un recorrido manual elegido'}:{})
   });
  }
 }
 const real=reviews.filter(x=>x.manualTraceConfirmed).length;
 return {date,target,visibleColumns:frozen.columns.map(c=>c.id),
  realHistoricalSheets:historical.size,witnessesAvailable:reviews.length,
  confirmedManualTraces:real,
  pendingOriginalImageCheck:reviews.filter(x=>x.status==='FOTOGRAMA_REFERENCIADO_SIN_CELDAS_DIGITALIZADAS').length,
  unverifiedHighlightedGroups:reviews.filter(x=>x.status==='CELDAS_MANUALES_RESALTADAS_SIN_ORDEN').length,
  automaticReconstructionsExcluded:reviews.filter(x=>x.status==='RUTA_AUTOMATICA_NO_MANUAL').length,
  reviews,decision:real?'FOTO_CON_TRAZOS_VERIFICADOS':'FOTO_PENDIENTE_DE_VERIFICACION',
  notes:[
   'La unidad de partida es la HOJA MARCADA + su cabeza coincidente debajo, jamás el universo geométrico de rutas.',
   'Sin fotograma legible no inventar coordenadas ni dirección de lectura.',
   'Una celda resaltada sin flecha no equivale a un recorrido ordenado.',
   'Los caminos reconstruidos tras conocer la cabeza SON la base válida de la hoja marcada; esta herramienta sólo distingue cuáles aparecen específicamente en el papel original.',
   'No usamos esta auditoría fotográfica como veto para reconstruir las hojas históricas, estudiar su evolución ni interpretar recorridos.',
   'El turno objetivo y las columnas futuras permanecen ocultos; D−7 es contexto opcional.'
  ]};
}
