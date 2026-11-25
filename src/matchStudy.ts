import {TURNOS} from './domain';
import type {CabezasDia,Turno} from './domain';
import type {LaloKind,LaloView} from './motorLalo';
import type {AuxiliarView} from './motorLaloAuxiliar';
import {STAT_JURS} from './headStats';

export const MATCH_ENGINES=['lalo','ayer','hoy'] as const;
export type MatchEngine=typeof MATCH_ENGINES[number];
export const MATCH_LABELS:Record<MatchEngine,string>={lalo:'Lalo +11',ayer:'Aux. ayer',hoy:'Aux. hoy'};
export const MATCH_KINDS=['vt2','vt3','vt4'] as const;
export type RankedFamily={rank:number;family:string;values:string[]};
export type MatchRanks=Record<LaloKind,RankedFamily[]>;
export type MatchHit={jur:string;head:string;rank:number;family:string;value:string};
export type MatchSnapshot={date:string;turn:Turno;engine:MatchEngine;createdAt:string;ranks:MatchRanks};
const valid=(v:string)=>/^\d{4}$/.test(v);
const size=(k:LaloKind)=>Number(k.slice(-1));
const values=(family:string,n:number)=>[...new Set(family.split('/').filter(v=>v.length===n&&/^\d+$/.test(v)))];
export function plusMatchRanks(view:LaloView):MatchRanks{
 return Object.fromEntries(MATCH_KINDS.map(k=>[k,view.ranks[k].map(f=>({
  rank:f.rank,family:f.family,values:k==='vt4'?[f.family]:values(f.family,size(k))
 }))])) as MatchRanks;
}
export function auxMatchRanks(view:AuxiliarView):MatchRanks{
 return Object.fromEntries(MATCH_KINDS.map(k=>[k,view.ranks[size(k) as 2|3|4].map(f=>({
  rank:f.rank,family:f.family,values:k==='vt4'?f.values:values(f.family,size(k))
 }))])) as MatchRanks;
}
/** One observation per jurisdiction and engine; rank is never reassigned after POST. */
export function compareRankedHeads(rows:RankedFamily[],heads:CabezasDia,turn:Turno,kind:LaloKind):MatchHit[]{
 const byValue=new Map<string,RankedFamily>();
 for(const row of rows)for(const value of row.values){
  const old=byValue.get(value);
  if(!old||row.rank<old.rank)byValue.set(value,row);
 }
 return STAT_JURS.flatMap(jur=>{
  const head=heads[turn]?.[jur]||'';
  if(!valid(head))return [];
  const value=head.slice(-size(kind)),r=byValue.get(value);
  return r?[{jur,head,rank:r.rank,family:r.family,value}]:[];
 }).sort((a,b)=>a.rank-b.rank||a.jur.localeCompare(b.jur));
}
export const validHeadCount=(heads:CabezasDia,turn:Turno)=>STAT_JURS.filter(j=>valid(heads[turn]?.[j]||'')).length;
