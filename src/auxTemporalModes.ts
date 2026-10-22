/**
 * Dos políticas cronológicas de Santiago–Neuquén. Sin conexión con MV1.
 * ANTERIOR: seis cabezas de jornada sorteable previa, disponibles en Previa.
 * INTRAJORNADA: cabezas publicadas HOY antes de cada turno objetivo.
 * Cortes de la intrajornada: 0/8/16/24/24 cifras.
 * Cada raíz histórica se coteja con SU PROPIA política de disponibilidad.
 */
import {TURNOS,JURS,diaVacio} from './domain';
import type {CabezasDia,Turno} from './domain';
import {AUX_SOURCE_TURNS,AUX_ROWS,emptyAuxiliaryHeads} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads} from './auxSantiagoNeuquen';
import {extractAuxiliarHistory} from './motorLaloAuxiliar';
import type {IntegralAuxHistory,IntegralKind} from './motorLaloIntegral';

export type AuxMode='intrajornada'|'anterior';
const KINDS:IntegralKind[]=[2,3,4];
export function auxAtCut(raw:AuxiliaryHeads,target:Turno,mode:AuxMode):AuxiliaryHeads{
 const n=TURNOS.indexOf(target);
 if(n<0)throw Error('Turno AUX inválido');
 const available=AUX_SOURCE_TURNS.slice(0,Math.min(n,3));
 const out=emptyAuxiliaryHeads();
 for(const source of AUX_SOURCE_TURNS){
  if(mode==='intrajornada'&&!available.includes(source))continue;
  for(const jurisdiction of AUX_ROWS)
   out[source][jurisdiction]=raw[source]?.[jurisdiction]||'----';
 }
 return out;
}
export function extractAuxHistoryMode(date:string,raw:AuxiliaryHeads,
 draws:CabezasDia,mode:AuxMode):IntegralAuxHistory{
 if(mode==='anterior')return extractAuxiliarHistory(date,raw,draws);
 const events={2:[],3:[],4:[]} as IntegralAuxHistory['events'];
 for(const turn of TURNOS){
  const one=diaVacio();
  for(const jur of JURS)one[turn][jur]=draws[turn]?.[jur]||'----';
  const cut=auxAtCut(raw,turn,mode);
  const measured=extractAuxiliarHistory(date,cut,one);
  for(const length of KINDS)events[length].push(...measured.events[length]);
 }
 return {date,events};
}
