// Evidencia independiente de FIGURA; nunca borra un recorrido por fallar su numero.
// No es un nuevo selector ni confunde VT2 parcial con acierto VT3/VT4.
// Se actualiza exclusivamente DESPUES de conocerse el resultado del turno.
import {TURNOS} from './domain';
import type {FigureFrozen7D,FigureReadingEvidence7D,ReadingClass7D} from './figureReadings7d';
export type FigureSupportEvent7D={date:string;turn:FigureFrozen7D['target'];class:ReadingClass7D;
 exact:boolean;geometric:boolean;partialVT2:boolean;};
export type FigureSupportMemory7D={identity:string;kind:FigureFrozen7D['kind'];sourceId:FigureFrozen7D['sourceId'];
 rootCoordinates:string[];events:FigureSupportEvent7D[];status:'OBSERVAR'|'CON_APOYO_VISUAL'|'CON_APOYO_PARCIAL';};
const identity=(x:FigureFrozen7D)=>x.kind+'|'+x.sourceId+'|'+x.coordinates.join('>');
const moment=(x:{date:string;turn:FigureFrozen7D['target']})=>x.date+'|'+String(TURNOS.indexOf(x.turn));
export function initialFigureSupport7D(root:FigureFrozen7D):FigureSupportMemory7D{
 return {identity:identity(root),kind:root.kind,sourceId:root.sourceId,
 rootCoordinates:root.coordinates,status:'OBSERVAR',events:[]};
}
export function recordFigureSupport7D(memory:FigureSupportMemory7D,evidence:FigureReadingEvidence7D):FigureSupportMemory7D{
 const f=evidence.frozen;
 // Una figura conservada puede moverse dentro de su familia; la raiz NO se sobreescribe.
 if(memory.kind!==f.kind||memory.sourceId!==f.sourceId)throw Error('Otra modalidad o columna no pertenece a la memoria');
 const previous=memory.events[memory.events.length-1];
 if(previous&&moment(previous)>=moment({date:f.date,turn:f.target}))throw Error('El turno ya fue evaluado o no es posterior');
 const event:FigureSupportEvent7D={date:f.date,turn:f.target,class:evidence.primaryClass,
  exact:evidence.numericExact,geometric:evidence.geometricCompatible,partialVT2:evidence.vt2Inverse};
 const status:FigureSupportMemory7D['status']=event.geometric?'CON_APOYO_VISUAL':event.partialVT2?'CON_APOYO_PARCIAL':'OBSERVAR';
 return {...memory,events:[...memory.events,event],status};
}
// No existe accion MUERE, DESCARTAR o CAMBIAR: la evaluacion numerica sola no debe imponerla.
export const canRemainObserved7D=(_memory:FigureSupportMemory7D)=>true;
