/**
 * INFO AUX: contraste visual de una marca POST antigua con una hoja PRE actual.
 * La proyección conserva solo desplazamientos de casillas, no la cifra ganadora.
 * No suma candidatas ni reordena rankings. Usar siempre la grilla ya enmascarada
 * por el modo AYER/HOY y el turno objetivo.
 */
import type {AuxGalleryFrame,AuxGalleryMark} from './infoAuxGallery';
import type {AuxiliarView} from './motorLaloAuxiliar';
import type {AuxPath} from './auxSantiagoNeuquen';
import {auxCanonicalPath,auxAdjacent} from './auxSantiagoNeuquen';
import {projectAuxShape} from './auxWinningMemory';
import {reversibleFamily} from './motorLalo';

export type AuxTraceKind='vt2'|'vt3'|'vt4';
export type AuxTraceProjection={
 path:AuxPath;value:string;family:string;recognizedRank:number|null;
 mother:string|null;motherRank:number|null
};
export type AuxHistoricalTrace={
 oldDate:string;oldSourceDate:string|null;targetDate:string;
 kind:AuxTraceKind;oldHead:string;oldJur:string;oldReading:string;
 oldPath:AuxPath;oldBoard:NonNullable<AuxGalleryFrame['board']>;
 targetBoard:NonNullable<AuxGalleryFrame['board']>;
 projections:AuxTraceProjection[];rankingAvailable:boolean
};
const key=(p:AuxPath)=>auxCanonicalPath(p);
const reading=(p:AuxPath)=>p.map(c=>c.digit).join('');
const matchCells=(board:NonNullable<AuxGalleryFrame['board']>,path:AuxPath)=>
 path.every(p=>board.cells.some(c=>c.row===p.row&&c.col===p.col&&c.digit===p.digit));
const wellFormed=(path:AuxPath,n:number)=>
 path.length===n&&new Set(path.map(c=>c.row+':'+c.col)).size===n&&
 path.every((c,i)=>!i||auxAdjacent(path[i-1],c));

export function buildAuxHistoricalTrace(
 past:AuxGalleryFrame,now:AuxGalleryFrame,mark:AuxGalleryMark,
 prediction:AuxiliarView|null
):AuxHistoricalTrace{
 if(past.isCurrent||!now.isCurrent||past.date>=now.date||
  !past.board||!now.board||past.board.target!==now.board.target)
  throw Error('INFO AUX: comparar solo un POST anterior contra PRE de hoy');
 const n=Number(mark.kind.slice(-1)) as 2|3|4;
 const suffix=mark.head.slice(-n);
 if(!/^\d{4}$/.test(mark.head)||!wellFormed(mark.path,n)||
  reading(mark.path)!==suffix||!matchCells(past.board,mark.path)||
  !past.marks.some(m=>m.jur===mark.jur&&m.head===mark.head&&
   m.kind===mark.kind&&key(m.path)===key(mark.path)))
  throw Error('INFO AUX: antecedente no corroborado físicamente');
 const available=!!prediction&&prediction.date===now.date&&
  prediction.turn===now.board.target;
 const ranks=available?prediction!.ranks[n]:[];
 const mothers=available?prediction!.ranks[3]:[];
 const unique=new Map<string,AuxTraceProjection>();
 for(const path of projectAuxShape(now.board,mark.path)){
  if(!wellFormed(path,n)||!matchCells(now.board,path))continue;
  const value=reading(path),family=n===4?value:reversibleFamily(value);
  const ranked=ranks.find(r=>n===4?r.values.includes(value):r.family===family);
  const mother=n===4?reversibleFamily(value.slice(1)):null;
  const parent=mother?mothers.find(r=>r.family===mother):null;
  if(!unique.has(key(path)))unique.set(key(path),{
   path,value,family,recognizedRank:ranked?.rank??null,
   mother,motherRank:parent?.rank??null
  });
 }
 return {oldDate:past.date,oldSourceDate:past.sourceDate,targetDate:now.date,
  kind:mark.kind,oldHead:mark.head,oldJur:mark.jur,
  oldReading:suffix,oldPath:mark.path,oldBoard:past.board,
  targetBoard:now.board,projections:[...unique.values()],
  rankingAvailable:available};
}
