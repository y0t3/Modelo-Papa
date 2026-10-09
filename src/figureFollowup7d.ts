// Seguimiento causal de la MISMA figura en oportunidades posteriores del mismo turno.
// El apoyo visual anterior no se convierte en acierto exacto ni obliga a cambiar de foco.
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {CycleKind} from './cycle7d';
import {freezeFigureReadings7D,evaluateFigureReadings7D} from './figureReadings7d';
import type {FigureFrozen7D,FigureReadingEvidence7D,ReadingClass7D} from './figureReadings7d';

export type FigureOriginStatus7D='EXACTO'|'APOYO_GEOMETRICO_SIN_EXACTITUD'|'APOYO_VT2_PARCIAL'|'SIN_APOYO';
export type FigureFutureObservation7D={date:string;turn:Turno;projectable:boolean;projected?:string;
 exact:boolean;geometry:boolean;partialVT2:boolean;class?:ReadingClass7D};
export type FigureFollowup7D={dateStarted:string;kind:CycleKind;target:Turno;sourceId:SourceId;
 originCoordinates:string[];originStatus:FigureOriginStatus7D;observations:FigureFutureObservation7D[]};
export type FigurePreview7D={date:string;target:Turno;projectable:boolean;frozen?:FigureFrozen7D;reason?:string};
const dateOK=(d:string)=>/^\d{4}-\d{2}-\d{2}$/.test(d);
export function startFigureFollowup7D(e:FigureReadingEvidence7D):FigureFollowup7D{
 const status:FigureOriginStatus7D=e.numericExact?'EXACTO':e.geometricCompatible?'APOYO_GEOMETRICO_SIN_EXACTITUD':
  e.vt2Inverse?'APOYO_VT2_PARCIAL':'SIN_APOYO';
 return {dateStarted:e.frozen.date,kind:e.frozen.kind,target:e.frozen.target,sourceId:e.frozen.sourceId,
  originCoordinates:[...e.frozen.coordinates],originStatus:status,observations:[]};
}
export function previewFigureFollowup7D(memory:FigureFollowup7D,sheet:DailySheet,date:string,target:Turno):FigurePreview7D{
 const prev=memory.observations[memory.observations.length-1];
 if(!dateOK(date)||date<=memory.dateStarted||(prev&&date<=prev.date))throw Error('Evaluacion posterior no cronologica');
 if(target!==memory.target)throw Error('No mezclar turnos de salida');
 const col=sheet.columns.find(c=>c.id===memory.sourceId);
 if(!col)return {date,target,projectable:false,reason:'Falta columna de origen'};
 const route=memory.originCoordinates.map(x=>{
  const parts=x.split(':').map(Number),row=parts[0],column=parts[1];
  return {row,col:column,digit:col.values[row]?.[column]||''};
 });
 if(route.some(c=>!/^\d{2}$/.test(col.values[c.row]||'')||!/^[0-9]$/.test(c.digit)))
  return {date,target,projectable:false,reason:'Celdas no disponibles en el tablero previo'};
 return {date,target,projectable:true,
  frozen:freezeFigureReadings7D(sheet,date,target,memory.kind,memory.sourceId,route)};
}
export function settleFigureFollowup7D(memory:FigureFollowup7D,preview:FigurePreview7D,heads:string[]):FigureFollowup7D{
 const prev=memory.observations[memory.observations.length-1];
 if(preview.target!==memory.target||preview.date<=memory.dateStarted||(prev&&preview.date<=prev.date))
  throw Error('Seguimiento no cronologico o turno incorrecto');
 if(heads.filter(h=>/^\d{4}$/.test(h)).length===0)throw Error('No hay resultados de sorteo para evaluar');
 let observed:FigureFutureObservation7D={date:preview.date,turn:preview.target,
  projectable:preview.projectable,exact:false,geometry:false,partialVT2:false};
 if(preview.projectable){
  if(!preview.frozen||preview.frozen.date!==preview.date||preview.frozen.target!==preview.target||
    preview.frozen.sourceId!==memory.sourceId||preview.frozen.kind!==memory.kind||
    preview.frozen.coordinates.join('>')!==memory.originCoordinates.join('>'))throw Error('Previsualizacion no coincide con la figura congelada');
  const result=evaluateFigureReadings7D(preview.frozen,heads);
  observed={...observed,projected:preview.frozen.direct,exact:result.numericExact,
   geometry:result.geometricCompatible,partialVT2:result.vt2Inverse,class:result.primaryClass};
 }
 return {...memory,observations:[...memory.observations,observed]};
}
export function summarizedFollowup7D(memory:FigureFollowup7D){
 const eligible=memory.observations.filter(x=>x.projectable);
 return {originStatus:memory.originStatus,opportunities:memory.observations.length,
  projectable:eligible.length,exact:eligible.filter(x=>x.exact).length,
  geometry:eligible.filter(x=>x.geometry).length,partialVT2:eligible.filter(x=>x.partialVT2).length,
  keepFigureInMemory:true};
}
