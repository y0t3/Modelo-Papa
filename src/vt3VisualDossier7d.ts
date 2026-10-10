// Modelo Papá — expediente visual PREVIO de un turno, sin nuevos pronósticos.
// Reconstruye la tabla +11 y TODAS las rutas físicas de los VT3 ya elegidos
// por el adaptativo; compara figuras marcadas previamente en hoy / ayer / D−7.
// El expediente PREVIO no contiene la cabeza del turno objetivo.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DatedSheet} from './cycle7d';
import type {DailySheet,SourceId} from './sheet';
import {findPaths} from './paths';
import {inspectBeforeVT3Selection7D} from './vt3SelectedVsExcluded7d';
import type {VT3PoolInspectCandidate7D} from './vt3SelectedVsExcluded7d';
import {observeProgressiveBoard7D} from './progressiveBoard7d';
import type {ProgressiveMark7D,ProgressiveBoard7D} from './progressiveBoard7d';
import {freezeBeforeTurn7D} from './causalReplay7d';

export type FigureTrace7D={
 date:string;turn:Turno;sourceId:SourceId;head:string;vt3:string;
 cells:string[];shape:string;relation:'MISMA_FORMA'|'MISMAS_CELDAS'|'CONTACTO'|'OTRA_FORMA';
};
export type PhysicalRoute7D={sourceId:SourceId;cells:string[];digits:string;shape:string};
export type FigureDossier7D={
 value:string;sourceId:SourceId;selected:boolean;oldRank:number;
 modelState:string;zone:string;originalCells:string[];
 allPhysicalRoutes:PhysicalRoute7D[];representative:PhysicalRoute7D;
 todayLinks:FigureTrace7D[];yesterdayLinks:FigureTrace7D[];
 weekLinks:FigureTrace7D[];otherColumnLinks:FigureTrace7D[];
 vt2Suffix:string;reason:string[];
};
export type VisualDossierBefore7D={
 protocol:'PROGRESSIVE_VT3_HUMAN_READABLE_CASE_V1';
 date:string;target:Turno;phase:'ANTES_DEL_SORTEO';
 columns:{id:SourceId;label:string;values:string[]}[];
 completedTurns:Turno[];hasPreviousWeek:boolean;previousDrawDate?:string;
 top3:FigureDossier7D[];alternatives:FigureDossier7D[];
 poolSize:number;notes:string[];
};
const cell=(p:{row:number;col:number})=>p.row+':'+p.col;
const shape=(coords:{row:number;col:number}[])=>
 coords.slice(1).map((x,i)=>(x.row-coords[i].row)+','+(x.col-coords[i].col)).join('>');
const normalized=(x:string)=>x.replaceAll(';','>');
const relation=(path:PhysicalRoute7D,mark:ProgressiveMark7D):FigureTrace7D['relation']=>{
 if(path.sourceId===mark.sourceId&&path.cells.join('>')===mark.cells.join('>'))
  return 'MISMAS_CELDAS';
 if(path.shape===normalized(mark.shape))return 'MISMA_FORMA';
 if(path.sourceId===mark.sourceId&&path.cells.some(x=>mark.cells.includes(x)))
  return 'CONTACTO';
 return 'OTRA_FORMA';
};
const category=(kind:FigureTrace7D['relation'])=>
 ({MISMAS_CELDAS:0,MISMA_FORMA:1,CONTACTO:2,OTRA_FORMA:3})[kind];
function sourceRoutes(value:string,columns:VisualDossierBefore7D['columns']):PhysicalRoute7D[]{
 const all:PhysicalRoute7D[]=[];
 for(const column of columns){
  for(const path of findPaths(column.values,value))
   all.push({sourceId:column.id,cells:path.map(cell),
    digits:path.map(c=>c.digit).join(''),shape:shape(path)});
 }
 return all;
}
function traceLinks(routes:PhysicalRoute7D[],marks:ProgressiveMark7D[],
 requireSameSource:boolean):FigureTrace7D[]{
 const map=new Map<string,FigureTrace7D>();
 for(const mark of marks){
  if(mark.kind!=='vt3')continue;
  for(const path of routes){
   if(requireSameSource&&path.sourceId!==mark.sourceId)continue;
   // Dos columnas pueden compararse por forma, pero un CONTACTO geométrico
   // entre columnas distintas no es válido como continuidad física.
   const rel=relation(path,mark);
   if(rel==='OTRA_FORMA')continue;
   if(path.sourceId!==mark.sourceId&&rel!=='MISMA_FORMA')continue;
   const key=[mark.date,mark.winningTurn,mark.sourceId,mark.head,
    mark.cells.join('>')].join('|');
   const entry:FigureTrace7D={date:mark.date,turn:mark.winningTurn,
    sourceId:mark.sourceId,head:mark.head,vt3:mark.value,
    cells:[...mark.cells],shape:normalized(mark.shape),relation:rel};
   const existing=map.get(key);
   if(!existing||category(rel)<category(existing.relation))map.set(key,entry);
  }
 }
 return [...map.values()].sort((a,b)=>category(a.relation)-category(b.relation)||
  b.date.localeCompare(a.date)||TURNOS.indexOf(b.turn)-TURNOS.indexOf(a.turn)||
  a.sourceId.localeCompare(b.sourceId));
}
function makeFigure(candidate:VT3PoolInspectCandidate7D,
 board:ProgressiveBoard7D):FigureDossier7D{
 // Enumeramos TODAS las rutas de ese valor y no sólo la huella del
 // adaptativo: una cifra puede estar representada en varias columnas.
 const paths=sourceRoutes(candidate.value,board.visibleColumns);
 const current=paths.find(x=>x.sourceId===candidate.sourceId&&
  x.cells.join('>')===candidate.cells.join('>'));
 if(!current||paths.some(x=>x.digits!==candidate.value))
  throw Error('Cifra o geometría no corresponde a su tablero +11');
 const today=traceLinks(paths,board.marksToday,true);
 const yesterday=traceLinks(paths,board.lastDraw?.marks||[],true);
 const week=traceLinks(paths,board.previousWeek?.marks||[],true);
 // Una analogía entre columnas es SOLO igualdad de forma relativa.
 // No puede presentarse como contacto entre celdas de fuentes diferentes.
 const crossColumn=traceLinks(paths,board.marksToday,false)
  .filter(x=>paths.some(p=>p.sourceId!==x.sourceId&&p.shape===x.shape))
  .map(x=>({...x,relation:'MISMA_FORMA' as const}));
 const reasons=[
  'El valor '+candidate.value+' se lee en '+paths.length+
   ' recorrido(s) físico(s) sobre las columnas actuales; ninguna ruta cruza de columna',
  ...today.slice(0,2).map(x=>x.turn+' de hoy: '+x.relation+
   ' con '+x.vt3+' en '+x.sourceId),
  ...crossColumn.slice(0,1).map(x=>'Analogía entre columnas (no ruta mezclada): '+
   x.shape+' en '+x.sourceId),
  ...yesterday.slice(0,1).map(x=>'Jornada anterior '+x.date+': '+x.relation+
   ' en '+x.sourceId),
  ...week.slice(0,1).map(x=>'Referencia semanal '+x.date+': '+x.relation+
   ' en '+x.sourceId)
 ];
 if(!today.length&&!yesterday.length&&!week.length)
  reasons.push('Sin coincidencia física directa en hoy, ayer ni D−7; el adaptativo puede haber elegido por memoria más antigua');
 return {value:candidate.value,sourceId:candidate.sourceId,
  selected:candidate.selected,oldRank:candidate.rank,modelState:candidate.life,
  zone:candidate.zone,originalCells:[...candidate.cells],
  allPhysicalRoutes:paths,representative:current,
  todayLinks:today,yesterdayLinks:yesterday,weekLinks:week,
  otherColumnLinks:crossColumn,vt2Suffix:candidate.value.slice(-2),reason:reasons};
}
export function buildVisualDossierBefore7D(history:DatedSheet[],full:DailySheet,
 date:string,target:Turno,alternatives=3):VisualDossierBefore7D{
 if(!TURNOS.includes(target)||history.some(x=>x.date>=date))
  throw Error('Turno inválido o fuga temporal');
 if(!Number.isInteger(alternatives)||alternatives<0||alternatives>10)
  throw Error('Número de figuras comparativas inválido');
 const before=freezeBeforeTurn7D(full,target);
 const board=observeProgressiveBoard7D(history,before,date,target);
 const inspected=inspectBeforeVT3Selection7D(history,before,date,target);
 const top3=inspected.pool.filter(x=>x.selected).map(x=>makeFigure(x,board));
 const comparisons=inspected.pool.filter(x=>!x.selected).slice(0,alternatives)
  .map(x=>makeFigure(x,board));
 if(top3.length>3||new Set(top3.map(x=>x.value)).size!==top3.length||
  top3.some((x,i)=>x.value!==inspected.selected[i]))
  throw Error('El expediente cambió la selección Top3 original');
 return {protocol:'PROGRESSIVE_VT3_HUMAN_READABLE_CASE_V1',date,target,
  phase:'ANTES_DEL_SORTEO',
  columns:board.visibleColumns,completedTurns:board.completedTurns,
  hasPreviousWeek:!!board.previousWeek,previousDrawDate:board.lastDraw?.date,
  top3,alternatives:comparisons,poolSize:inspected.pool.length,
  notes:[
   'Figura elegida = salida congelada del adaptativo no validado; NO es una nueva selección visual del padre.',
   'Se exhiben todas las rutas físicas de cada valor, incluso si figuran en varias columnas independientes.',
   'Las marcas históricas se reconstruyeron automáticamente tras conocer cabezas PREVIAS, no se confunden con trazos manuales confirmados.',
   'Las analogías entre columnas se comparan por FORMA; ningún camino combina celdas entre columnas.',
   'Cabezas y resultados del turno objetivo NO forman parte de este expediente previo.',
   'El estado adaptativo no demuestra que alguno de los VT3 vaya a salir; NO JUGAR puede ser apropiado.',
   'El valor VT2 de cada VT3 es su sufijo, no un segundo acierto independiente.'
  ]};
}
export function renderVisualDossierMarkdown7D(dossier:VisualDossierBefore7D):string{
 const lines:string[]=[
  '# Expediente visual +11 — '+dossier.date+' — antes de '+dossier.target,
  '',
  '**FASE:** ANTES DEL SORTEO (reconstrucción cronológica sobre datos históricos)',
  '',
  '## Tablero +11 visible antes del objetivo',
  '',
  '| Fila | '+dossier.columns.map(c=>c.label).join(' | ')+' |',
  '|---|'+dossier.columns.map(()=>'---|').join(''),
 ];
 for(let i=0;i<6;i++)lines.push('| '+(i+1)+' | '+
  dossier.columns.map(c=>c.values[i]||'--').join(' | ')+' |');
 lines.push('',
  'La tabla muestra sólo columnas ya conocidas. Cada número de dos cifras corresponde a la fila física de la columna +11.',
  '',
  '**Turnos cerrados de hoy:** '+(dossier.completedTurns.join(', ')||'ninguno')+
  ' · **Jornada anterior:** '+(dossier.previousDrawDate||'no disponible')+
  ' · **D−7:** '+(dossier.hasPreviousWeek?'disponible':'no disponible'),
  '',
  '## Tres VT3 del lector adaptativo original (NO aprobados como pronóstico)',
  '');
 const print=(f:FigureDossier7D,index:number)=>{
  lines.push('### '+index+'. VT3 '+f.value+' — origen '+f.sourceId+
   ' — lugar previo '+f.oldRank,
   '',
   '**Recorrido seleccionado por el adaptativo:** '+
    f.representative.cells.map((c,i)=>String(i+1)+'→('+c.split(':').map((n,j)=>j?['izq.','der.'][Number(n)]:'fila '+(Number(n)+1)).join(', ')+')').join(' · '),
   '',
   '**Figura:** '+f.representative.shape+
    ' · **Zona:** '+f.zone+' · **VT2 contenido:** '+f.vt2Suffix+
    ' · **Estado heurístico:** '+f.modelState,
   '',
   '**Rutas alternativas del MISMO VT3 sobre la tabla actual:** '+
    f.allPhysicalRoutes.length+' en total',
   '');
  for(const route of f.allPhysicalRoutes.slice(0,10))
   lines.push('- '+route.sourceId+': '+route.cells.join(' → ')+
    ' (forma '+route.shape+')');
  if(f.allPhysicalRoutes.length>10)lines.push('- ... '+(f.allPhysicalRoutes.length-10)+
   ' recorridos físicos adicionales conservados en JSON');
  lines.push('','**Lectura anterior al sorteo:**');
  for(const r of f.reason)lines.push('- '+r);
  lines.push('');
 };
 dossier.top3.forEach((f,i)=>print(f,i+1));
 lines.push('## Alternativas del mismo conjunto adaptativo (no suman propuestas)','');
 dossier.alternatives.forEach((f,i)=>print(f,i+1));
 lines.push('## Límites',...dossier.notes.map(x=>'- '+x),'',
  '**Resultado real:** se guarda en un archivo de evaluación separado. Este expediente no lo contiene.','');
 return lines.join('\n');
}
