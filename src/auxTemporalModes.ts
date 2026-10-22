/** Dos lecturas físicas independientes, sin modificar el motor o la app. */
import {JURS,TURNOS,diaVacio} from './domain';
import type {CabezasDia,Turno} from './domain';
import {AUX_ROWS,AUX_SOURCE_TURNS,emptyAuxiliaryHeads} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads} from './auxSantiagoNeuquen';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from './motorLaloAuxiliar';
import type {AuxiliarHistory,AuxiliarView} from './motorLaloAuxiliar';
import type {IntegralAuxHistory,IntegralKind} from './motorLaloIntegral';

export type AuxTemporalMode='anterior'|'intrajornada';
const LENGTHS:IntegralKind[]=[2,3,4];
export function auxAtCut(raw:AuxiliaryHeads,turn:Turno,mode:AuxTemporalMode):AuxiliaryHeads{
 const n=TURNOS.indexOf(turn);
 if(n<0)throw Error('Turno inválido');
 const available=AUX_SOURCE_TURNS.slice(0,Math.min(n,3));
 const out=emptyAuxiliaryHeads();
 for(const src of AUX_SOURCE_TURNS){
  if(mode==='intrajornada'&&!available.includes(src))continue;
  for(const jur of AUX_ROWS)out[src][jur]=raw[src]?.[jur]||'----';
 }
 return out;
}
export function extractHistoryMode(date:string,raw:AuxiliaryHeads,
 observed:CabezasDia,mode:AuxTemporalMode):IntegralAuxHistory{
 if(mode==='anterior')return extractAuxiliarHistory(date,raw,observed);
 const events={2:[],3:[],4:[]} as IntegralAuxHistory['events'];
 for(const turn of TURNOS){
  const single=diaVacio();
  for(const jur of JURS)single[turn][jur]=observed[turn]?.[jur]||'----';
  const extracted=extractAuxiliarHistory(date,auxAtCut(raw,turn,mode),single);
  for(const n of LENGTHS)events[n].push(...extracted.events[n]);
 }
 return {date,events};
}
export function predictMode(date:string,turn:Turno,raw:AuxiliaryHeads,
 history:AuxiliarHistory[],mode:AuxTemporalMode):AuxiliarView{
 return buildMotorLaloAuxiliar(date,turn,auxAtCut(raw,turn,mode),history);
}
