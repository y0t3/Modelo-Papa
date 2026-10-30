/**
 * Embudo de VT3 AUX, NO es motor predictivo:
 *   1) existe en la geometría PRE de Santiago/Neuquén,
 *   2) recibió un puesto mediante testimonios/traslados históricos,
 *   3) entra en Top10.  POST se aplica DESPUÉS.
 *
 * La misma cabeza cuenta una vez por tablero y corte. Los caminos
 * alternativos no son aciertos adicionales.
 */
import {auxFamily,enumerateAuxPaths} from './auxSantiagoNeuquen';
import type {AuxiliaryBoard} from './auxSantiagoNeuquen';
import type {AuxRank} from './motorLaloIntegral';

export type HeadPOST={jur:string;head:string};
export type AuxFunnelCase={
 jur:string;head:string;vt3:string;family:string;
 physical:boolean;rank:number|null;
 stage:'IMPOSIBLE'|'SIN_TESTIGO'|'TOP_1_10'|'PUESTO_11_20'|
  'PUESTO_21_50'|'PUESTO_51_MAS';
};
export type AuxVt3Funnel={
 cells:number;physicalFamilies:number;projectedFamilies:number;
 rankedTop10:number;heads:number;
 physicalHeadHits:number;projectedHeadHits:number;
 top10HeadHits:number;rank11to20Hits:number;
 rank21to50Hits:number;rank51plusHits:number;
 physicalUnrankedHeadHits:number;impossibleHeadHits:number;
 cases:AuxFunnelCase[];
};
export function evaluateAuxVt3Funnel(
 board:AuxiliaryBoard,ranked:readonly AuxRank[],heads:readonly HeadPOST[]
):AuxVt3Funnel{
 const physicallyPossible=new Set(
  enumerateAuxPaths(board,3).map(path=>
   auxFamily(path.map(c=>c.digit).join('')))
 );
 const projected=new Map(ranked.map(f=>[f.family,f.rank]));
 // Un candidato AUX proyectado DEBE tener camino físico real en SU tablero.
 for(const f of ranked)if(!physicallyPossible.has(f.family))
  throw Error('Puesto AUX no físicamente formable: '+f.family);
 const cases=heads.filter(h=>/^\d{4,5}$/.test(h.head))
 .map(h=>{
  const vt3=h.head.slice(-3),family=auxFamily(vt3);
  const physical=physicallyPossible.has(family),rank=projected.get(family)??null;
  const stage:AuxFunnelCase['stage']=!physical?'IMPOSIBLE':
   rank===null?'SIN_TESTIGO':
   rank<=10?'TOP_1_10':
   rank<=20?'PUESTO_11_20':
   rank<=50?'PUESTO_21_50':'PUESTO_51_MAS';
  return {jur:h.jur,head:h.head,vt3,family,physical,rank,stage};
 });
 const n=(f:(c:AuxFunnelCase)=>boolean)=>cases.filter(f).length;
 return {cells:board.cells.length,
  physicalFamilies:physicallyPossible.size,
  projectedFamilies:ranked.length,
  rankedTop10:ranked.slice(0,10).length,
  heads:cases.length,
  physicalHeadHits:n(c=>c.physical),
  projectedHeadHits:n(c=>c.rank!==null),
  top10HeadHits:n(c=>c.stage==='TOP_1_10'),
  rank11to20Hits:n(c=>c.stage==='PUESTO_11_20'),
  rank21to50Hits:n(c=>c.stage==='PUESTO_21_50'),
  rank51plusHits:n(c=>c.stage==='PUESTO_51_MAS'),
  physicalUnrankedHeadHits:n(c=>c.stage==='SIN_TESTIGO'),
  impossibleHeadHits:n(c=>c.stage==='IMPOSIBLE'),cases};
}
export function summarizeAuxVt3Funnel(cuts:readonly AuxVt3Funnel[]){
 const sum=(fn:(x:AuxVt3Funnel)=>number)=>cuts.reduce((n,x)=>n+fn(x),0);
 return {cuts:cuts.length,heads:sum(x=>x.heads),
  avgCells:cuts.length?sum(x=>x.cells)/cuts.length:0,
  avgPhysicalFamilies:cuts.length?
   Number((sum(x=>x.physicalFamilies)/cuts.length).toFixed(1)):0,
  avgProjectedFamilies:cuts.length?
   Number((sum(x=>x.projectedFamilies)/cuts.length).toFixed(1)):0,
  formable:sum(x=>x.physicalHeadHits),
  inRankedPool:sum(x=>x.projectedHeadHits),
  top10:sum(x=>x.top10HeadHits),
  next10:sum(x=>x.rank11to20Hits),
  rank21to50:sum(x=>x.rank21to50Hits),
  rank51plus:sum(x=>x.rank51plusHits),
  physicalNotRanked:sum(x=>x.physicalUnrankedHeadHits),
  physicallyImpossible:sum(x=>x.impossibleHeadHits),
  formablePct:sum(x=>x.heads)?
   Number((100*sum(x=>x.physicalHeadHits)/sum(x=>x.heads)).toFixed(1)):null,
  top10OfFormablePct:sum(x=>x.physicalHeadHits)?
   Number((100*sum(x=>x.top10HeadHits)/sum(x=>x.physicalHeadHits)).toFixed(1)):null};
}
