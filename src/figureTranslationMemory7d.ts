// Registro de UNA oportunidad con dos lecturas prefijadas: FIJA y TRASLADADA.
// La identidad de la figura raiz permanece fija; no suma "dos aciertos" en el turno.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {FigureFollowup7D} from './figureFollowup7d';
import type {TranslationPair7D} from './figureTranslation7d';
import {evaluateFigureReadings7D} from './figureReadings7d';
export type TranslationStatus7D='SIN_PROYECCION'|'SIN_APOYO'|'SOLO_FIJA'|'SOLO_TRASLADADA'|'AMBAS';
export type TranslationObservation7D={date:string;turn:Turno;status:TranslationStatus7D;
 fixedExact:boolean;translatedExact:boolean;fixedGeometric:boolean;translatedGeometric:boolean;
 fixedReadings:number;translatedReadings:number;unionReadings:number;headsCount:number;};
export type TranslationMemory7D={rootId:string;turn:Turno;observations:TranslationObservation7D[]};
const sourceKey=(f:FigureFollowup7D)=>f.kind+'|'+f.sourceId+'|'+f.originCoordinates.join('>');
const coordKey=(p:string[])=>p.join('>');
export const initialTranslationMemory7D=(f:FigureFollowup7D):TranslationMemory7D=>
 ({rootId:sourceKey(f),turn:f.target,observations:[]});
export function observeTranslatedFigure7D(state:TranslationMemory7D,original:FigureFollowup7D,
 frozen:TranslationPair7D,heads:string[]):TranslationMemory7D{
 const previous=state.observations[state.observations.length-1];
 if(state.rootId!==sourceKey(original)||frozen.turn!==state.turn||
  frozen.date<=original.dateStarted||
  (previous&&(frozen.date<previous.date||
    frozen.date===previous.date&&TURNOS.indexOf(frozen.turn)<=TURNOS.indexOf(previous.turn))))
  throw Error('Identidad o cronologia incompatible');
 if(!heads.some(h=>/^\d{4}$/.test(h)))throw Error('No hay resultado para la evaluacion posterior');
 if(frozen.fixed&&
  (frozen.fixed.sourceId!==original.sourceId||frozen.fixed.kind!==original.kind||
   coordKey(frozen.fixed.coordinates)!==coordKey(original.originCoordinates)))throw Error('Figura raiz alterada');
 const f=frozen.fixed?evaluateFigureReadings7D(frozen.fixed,heads):undefined;
 const t=frozen.shifted?evaluateFigureReadings7D(frozen.shifted,heads):undefined;
 if(frozen.shifted&&
  (frozen.shifted.kind!==original.kind||frozen.shifted.sourceId!==original.sourceId||
   frozen.shifted.date!==frozen.date||frozen.shifted.target!==frozen.turn))
  throw Error('Traslacion no corresponde a la figura');
 const fg=!!f?.geometricCompatible,tg=!!t?.geometricCompatible;
 const status:TranslationStatus7D=!frozen.fixed&&!frozen.shifted?'SIN_PROYECCION':
  fg&&tg?'AMBAS':fg?'SOLO_FIJA':tg?'SOLO_TRASLADADA':'SIN_APOYO';
 const readings=new Set([...(frozen.fixed?[frozen.fixed.direct,frozen.fixed.reverse,...frozen.fixed.footprintAlternatives]:[]),
  ...(frozen.shifted?[frozen.shifted.direct,frozen.shifted.reverse,...frozen.shifted.footprintAlternatives]:[])]);
 const obs:TranslationObservation7D={date:frozen.date,turn:frozen.turn,status,
  fixedExact:!!f?.numericExact,translatedExact:!!t?.numericExact,
  fixedGeometric:fg,translatedGeometric:tg,
  fixedReadings:frozen.fixed?new Set([frozen.fixed.direct,frozen.fixed.reverse,...frozen.fixed.footprintAlternatives]).size:0,
  translatedReadings:frozen.shifted?new Set([frozen.shifted.direct,frozen.shifted.reverse,...frozen.shifted.footprintAlternatives]).size:0,
  unionReadings:readings.size,headsCount:new Set(heads.filter(h=>/^\d{4}$/.test(h))).size};
 return {...state,observations:[...state.observations,obs]};
}
