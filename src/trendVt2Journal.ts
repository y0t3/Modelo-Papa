/**
 * Registro local VT2: PRE completo por motor y turno, y resultado POST.
 * No altera el orden de los Top10 ni aplica políticas predictivas.
 * Al recuperar sorteos históricos, marca PRE reconstruido (NO sellado).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TURNOS} from './domain';
import type {CabezasDia,Turno} from './domain';
import {
 TREND_ENGINES,TREND_WINDOW,VT2_TRENDS,
 motorSharesFrom
} from './trendHistoryVt2';
import type {HalfRecord,TrendEngine,TurnRecord} from './trendHistoryVt2';

export const TREND_STORE_KEY='modelo-lalo:vt2-trends-rolling-v1';
export type TrendPeriod='acumulado'|'reciente';
export type PreOrigin='capturado'|'reconstruido';
export type TrendSaved={
 date:string;turn:Turno;engine:TrendEngine;
 top:string[];origin:PreOrigin;createdAt:string;
 /** Sólo se fija cuando se publicaron las cinco jurisdicciones. */
 heads?:string[];
};
export type TrendJournal={version:1;items:TrendSaved[]};
export const emptyTrendJournal=():TrendJournal=>({version:1,items:[]});
const valid=(x:string)=>/^\d{4}$/.test(x);
const key=(r:Pick<TrendSaved,'date'|'turn'|'engine'>)=>r.date+'|'+r.turn+'|'+r.engine;
export function cleanTop(families:string[]):string[]|null{
 const top=families.slice(0,10);
 if(top.length!==10||new Set(top).size!==10||
  top.some(f=>!/^(\d{2})(\/\d{2})?$/.test(f)))return null;
 return top;
}
export function fiveHeads(data:CabezasDia,turn:Turno):string[]|null{
 const jurs=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos'];
 const heads=jurs.map(j=>data[turn]?.[j]||'');
 return heads.every(valid)?heads:null;
}
function safeEntry(x:unknown):x is TrendSaved{
 if(!x||typeof x!=='object')return false;
 const r=x as TrendSaved;
 return /^\d{4}-\d{2}-\d{2}$/.test(r.date)&&r.date>TREND_WINDOW.end&&
  TURNOS.includes(r.turn)&&TREND_ENGINES.includes(r.engine)&&
  (r.origin==='capturado'||r.origin==='reconstruido')&&
  typeof r.createdAt==='string'&&!!cleanTop(r.top)&&
  (!r.heads||(r.heads.length===5&&r.heads.every(valid)));
}
export function parseJournal(raw:string|null):TrendJournal{
 if(!raw)return emptyTrendJournal();
 try{
  const x=JSON.parse(raw) as TrendJournal;
  if(x.version!==1||!Array.isArray(x.items))return emptyTrendJournal();
  const seen=new Set<string>();
  return {version:1,items:x.items.filter(item=>{
   if(!safeEntry(item)||seen.has(key(item)))return false;
   seen.add(key(item));return true;
  })};
 }catch{return emptyTrendJournal()}
}
export const loadTrendJournal=async()=>parseJournal(await AsyncStorage.getItem(TREND_STORE_KEY));
export const saveTrendJournal=(journal:TrendJournal)=>
 AsyncStorage.setItem(TREND_STORE_KEY,JSON.stringify(journal));

/** El primer PRE registrado queda congelado; resultados pueden añadirse
 * después. Nunca reemplazamos la selección mirando una cabeza POST. */
export function recordTrend(journal:TrendJournal,candidate:TrendSaved):TrendJournal{
 if(!safeEntry(candidate))return journal;
 const existing=journal.items.find(x=>key(x)===key(candidate));
 if(existing){
  if(existing.heads||!candidate.heads)return journal;
  return {version:1,items:journal.items.map(x=>key(x)===key(candidate)?
   {...x,heads:candidate.heads}:x)};
 }
 return {version:1,items:[...journal.items,candidate]};
}
export function trendHits(record:TrendSaved):{first:number;last:number}|null{
 if(!record.heads||record.top.length!==10)return null;
 const ends=record.heads.map(h=>h.slice(-2));
 let first=0,last=0;
 for(const head of ends){
  const rank=record.top.findIndex(f=>f.split('/').includes(head));
  if(rank>=0&&rank<5)first++;
  else if(rank>=5&&rank<10)last++;
 }
 return {first,last};
}
function copy(r:HalfRecord):HalfRecord{return {...r}}
function empty():HalfRecord{return {first:0,last:0,cuts:0}}
export type TrendSnapshot={
 period:TrendPeriod;totals:Record<Turno,TurnRecord>;
 latestDate:string;newDateCount:number;loggedCuts:number;
 reconstructedCuts:number;liveCapturedCuts:number;
 /** Cuántas fechas con al menos un sorteo completo están registradas. */
 recentDateCount:number;
 historicalBase:boolean;
};
const makeTotals=(base:boolean):Record<Turno,TurnRecord>=>Object.fromEntries(TURNOS.map(turn=>[
 turn,Object.fromEntries(TREND_ENGINES.map(engine=>[
  engine,base?copy(VT2_TRENDS[turn][engine]):empty()
 ]))
])) as Record<Turno,TurnRecord>;
export function buildTrendSnapshot(journal:TrendJournal,period:TrendPeriod):TrendSnapshot{
 const completed=journal.items.map(item=>({item,h:trendHits(item)}))
  .filter((x):x is {item:TrendSaved;h:{first:number;last:number}}=>x.h!==null);
 const dates=[...new Set(completed.map(x=>x.item.date))].sort();
 const recent=new Set(dates.slice(-30));
 const visible=period==='reciente'?completed.filter(x=>recent.has(x.item.date)):completed;
 const totals=makeTotals(period==='acumulado');
 for(const {item,h} of visible){
  const row=totals[item.turn][item.engine];
  row.cuts++;row.first+=h.first;row.last+=h.last;
 }
 return {
  period,totals,
  latestDate:visible.length?visible.map(x=>x.item.date).sort().at(-1)!:TREND_WINDOW.end,
  newDateCount:dates.length,loggedCuts:visible.length,
  reconstructedCuts:visible.filter(x=>x.item.origin==='reconstruido').length,
  liveCapturedCuts:visible.filter(x=>x.item.origin==='capturado').length,
  recentDateCount:Math.min(30,dates.length),
  historicalBase:period==='acumulado'
 };
}
export function snapshotShares(snapshot:TrendSnapshot,turn:Turno){
 return motorSharesFrom(snapshot.totals[turn]);
}
export function newestJournalDay(journal:TrendJournal){
 return [...journal.items].filter(x=>x.heads).map(x=>x.date).sort().at(-1)||null;
}
