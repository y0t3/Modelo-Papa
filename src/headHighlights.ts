/**
 * Índice POST compartido por CABEZAS y el salto a HOJA.
 * +11 mantiene recorridos por columna; AUX utiliza RAW de la jornada
 * anterior, disponible antes de cada turno de la jornada objetivo. No consulta rankings PRE.
 */
import {JURS,TURNOS} from './domain';
import type {CabezasDia} from './domain';
import type {DailySheet} from './sheet';
import type {AuxiliaryHeads} from './auxSantiagoNeuquen';
import {auxiliaryBoard,findAuxPaths} from './auxSantiagoNeuquen';
import {dailyHeadOwnerId} from './panoramaModel';
import type {PanoramaKind} from './panoramaModel';

const KINDS:PanoramaKind[]=['vt2','vt3','vt4'];
export type HeadHighlight={
 kinds:PanoramaKind[];plusKinds:PanoramaKind[];auxKinds:PanoramaKind[]
};
export function buildHeadHighlights(data:CabezasDia|null,sheet:DailySheet|null,
 aux:AuxiliaryHeads|null):Record<string,HeadHighlight>{
 const highlights:Record<string,HeadHighlight>={};
 if(!data)return highlights;
 for(const turn of TURNOS){
  const board=aux?auxiliaryBoard(aux,turn):null;
  for(const jur of JURS){
   const head=data[turn]?.[jur]||'';
   if(!/^\d{4}$/.test(head))continue;
   const hits=sheet?.matches[turn]?.filter(m=>
    m.jurisdiccion===jur&&m.cabeza===head)||[];
   const plus=new Set<PanoramaKind>(hits.flatMap(m=>m.hits.map(h=>h.kind)));
   const auxKinds=board?KINDS.filter(kind=>
    findAuxPaths(board,head.slice(-Number(kind.slice(-1)))).length>0):[];
   highlights[dailyHeadOwnerId(turn,jur,head)]={
    plusKinds:KINDS.filter(kind=>plus.has(kind)),
    auxKinds,
    kinds:KINDS.filter(kind=>plus.has(kind)||auxKinds.includes(kind))
   };
  }
 }
 return highlights;
}
