// Registro local de listas PRE de las cinco jurisdicciones. No mezcla estadísticas y motores.
// Una lista PRE solo se guarda cuando aún NO hay cabezas del turno seleccionado.
import type {CabezasDia,Turno} from './domain';
import type {HistoricHeadsDay} from './historicalHeadFrequency';
import {headStats,STAT_JURS} from './headStats';
import type {StatMode} from './headStats';
export const STATS_JOURNAL_KEY='lalo:stats-top6-pre-post:v1';
export const STAT_MODES:StatMode[]=['atrasados','frios','calientes','recientes'];
export type PublishedHead={jur:string;head:string};
export type Top6Snapshot={
 key:string;date:string;turn:Turno;createdAt:string;window:110;
 historyDays:number;picks:Record<StatMode,string[]>;
 results:PublishedHead[];lastCheckedAt?:string;
};
export type StatHit={value:string;rank:number;jur:string;head:string;mode:StatMode};
const valid=(head:string)=>/^\d{4}$/.test(head);
export function statKey(date:string,turn:Turno){return date+'|'+turn}
export function readStatJournal(json:string|null):Top6Snapshot[]{
 if(!json)return [];
 try{
  const rows=JSON.parse(json);
  if(!Array.isArray(rows))return [];
  return rows.filter((r):r is Top6Snapshot=>!!r&&typeof r.date==='string'&&
   typeof r.turn==='string'&&r.window===110&&typeof r.picks==='object'&&
   STAT_MODES.every(k=>Array.isArray(r.picks[k]))&&Array.isArray(r.results))
   .slice(-160);
 }catch{return []}
}
export function buildTop6Pre(date:string,turn:Turno,history:HistoricHeadsDay[],
 current:CabezasDia|null,createdAt:string):Top6Snapshot|null{
 // No crear listas PRE retrospectivamente a partir de un resultado ya conocido.
 if(!current||STAT_JURS.some(j=>valid(current[turn]?.[j]||'')))return null;
 const summaries=STAT_MODES.map(mode=>headStats(history,date,turn,110,mode));
 if(summaries.some(s=>s.days<60||s.top.length!==6))return null;
 const picks=Object.fromEntries(summaries.map(s=>[s.mode,s.top.map(x=>x.value)])) as
  Record<StatMode,string[]>;
 return {key:statKey(date,turn),date,turn,createdAt,window:110,
  historyDays:summaries[0].days,picks,results:[]};
}
export function mergeStatResults(record:Top6Snapshot,heads:CabezasDia|null,
 checkedAt:string):Top6Snapshot{
 if(!heads)return record;
 const results=STAT_JURS.flatMap(jur=>{
  const head=heads?.[record.turn]?.[jur]||'';
  return valid(head)?[{jur,head}]:[];
 });
 if(!results.length)return record;
 const unchanged=results.length===record.results.length&&
  results.every((x,i)=>x.jur===record.results[i].jur&&x.head===record.results[i].head);
 return unchanged?record:{...record,results,lastCheckedAt:checkedAt};
}
export function hitsForTop6(record:Top6Snapshot,mode:StatMode):StatHit[]{
 const picks=record.picks[mode]||[];
 return record.results.flatMap(({jur,head})=>{
  const value=head.slice(-2),idx=picks.indexOf(value);
  return idx>=0?[{value,rank:idx+1,jur,head,mode}]:[];
 });
}
export function lastStatSnapshots(rows:Top6Snapshot[]):Top6Snapshot[]{
 return [...rows].filter(x=>x.results.length>0).sort((a,b)=>
  b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));
}
