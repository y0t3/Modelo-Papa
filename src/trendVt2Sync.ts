/**
 * Actualización del registro VT2 desde los resultados públicos.
 *
 * La app intenta guardar las tres selecciones ANTES del resultado. Si no
 * estuvo abierta, reconstruye el corte PRE usando exclusivamente fuentes
 * cronológicamente anteriores al turno; se indica como reconstruido,
 * NUNCA como predicción sellada antes del sorteo.
 *
 * Revisa el día actual y hasta 10 jornadas sorteables anteriores al abrir
 * o actualizar, para recuperar períodos con la app cerrada sin servicios.
 */
import {descargarCabezas} from './cabezas';
import {JURS,TURNOS} from './domain';
import type {CabezasDia,Turno} from './domain';
import {shiftDay,previousDrawDay,shiftDrawDay} from './dates';
import {loadPreviousDraws,hasDrawResults} from './drawHistory';
import {nocturnaAnteriorPorJur} from './nocturnaAnteriorPorJur';
import {buildSheet} from './sheet';
import {preSheetAtCut} from './infoCandidatos';
import {buildMotorLalo} from './motorLalo';
import type {LaloHistorical} from './motorLalo';
import {fetchAuxiliaryHeads} from './auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from './auxTemporalModes';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from './motorLaloAuxiliar';
import type {AuxiliarHistory} from './motorLaloAuxiliar';
import type {AuxiliaryHeads} from './auxSantiagoNeuquen';
import {TREND_WINDOW} from './trendHistoryVt2';
import type {TrendEngine} from './trendHistoryVt2';
import {
 cleanTop,emptyTrendJournal,fiveHeads,
 loadTrendJournal,recordTrend,saveTrendJournal
} from './trendVt2Journal';
import type {TrendJournal,TrendSaved} from './trendVt2Journal';

export const TREND_BACKFILL_DRAW_DAYS=10;
const valid=(s:string)=>/^\d{4}$/.test(s);
export const localDay=()=>{
 const d=new Date();
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
export function trendSyncDates(today:string,limit=TREND_BACKFILL_DRAW_DAYS):string[]{
 if(today<=TREND_WINDOW.end)return [];
 const found:string[]=[];
 let d=today;
 for(let i=0;i<limit&&d>TREND_WINDOW.end;i++){
  if(new Date(d+'T12:00:00').getDay()!==0)found.push(d);
  d=shiftDrawDay(d,-1);
 }
 return found.reverse();
}
type Sources={
 getDraw:(day:string)=>Promise<CabezasDia>;
 getAux:(day:string)=>Promise<AuxiliaryHeads>
};
export async function replayOneTrendDate(date:string,today:string,
 journal:TrendJournal,sources:Sources):Promise<{journal:TrendJournal;changed:boolean;complete:boolean;finalizable:boolean}>{
 if(date<=TREND_WINDOW.end||date>today)return {journal,changed:false,complete:false,finalizable:false};
 const current=await sources.getDraw(date);
 const complete=TURNOS.every(turn=>fiveHeads(current,turn)!==null);
 let result=journal,changed=false;
 // Si no hay resultados y ya es un día anterior, tampoco se inventa PRE.
 if(!hasDrawResults(current)&&date<today)return {journal,changed:false,complete:false,finalizable:false};
 const past=await loadPreviousDraws(date,4,sources.getDraw);
 const last=past[3],beforeLast=past[2];
 const historical:LaloHistorical[]=[{
  date:last.date,period:'D−1',sheet:buildSheet(last.heads,beforeLast.heads)
 }];
 const week=shiftDay(date,-7);
 const weekHeads=await sources.getDraw(week);
 if(week<date&&hasDrawResults(weekHeads)){
  const prev=await loadPreviousDraws(week,1,sources.getDraw);
  historical.push({date:week,period:'D−7',sheet:buildSheet(weekHeads,prev[0].heads)});
 }
 const noct=await nocturnaAnteriorPorJur(date,sources.getDraw);
 const full=buildSheet(current,noct.heads);
 const auxCache=new Map<string,Promise<AuxiliaryHeads|null>>();
 const aux=async(d:string)=>{
  let promise=auxCache.get(d);
  if(!promise){promise=sources.getAux(d).catch(()=>null);auxCache.set(d,promise)}
  return promise;
 };
 const refs:Record<'ayer'|'hoy',AuxiliarHistory[]|null>={ayer:null,hoy:null};
 for(const mode of ['ayer','hoy'] as const){
  const history:AuxiliarHistory[]=[];
  let failed=false;
  for(const ref of historical){
   const observed=ref.date===last.date?last.heads:weekHeads;
   const sourceDate=mode==='ayer'?previousDrawDay(ref.date):ref.date;
   const raw=await aux(sourceDate);
   if(!raw){failed=true;break}
   history.push({date:ref.date,period:ref.period,
    ...(mode==='ayer'?{sourceDate}:{}),
    aux:mode==='ayer'?extractAuxiliarHistory(ref.date,raw,observed):
     extractAuxHistoryMode(ref.date,raw,observed,'intrajornada')
   });
  }
  refs[mode]=failed?null:history;
 }
 const auxYesterday=await aux(previousDrawDay(date)),auxToday=await aux(date);
 for(const turn of TURNOS){
  // No se confirma un resultado parcial como jornada completa.
  const published=fiveHeads(current,turn);
  // Con al menos una cabeza publicada sólo podemos reconstruir el PRE;
  // el ranking de hoy no se presenta como capturado antes del sorteo.
  const exists=JURS.some(j=>valid(current[turn]?.[j]||''));
  // Sólo congelar el Top de un turno cuando las cabezas anteriores,
  // que alimentan su hoja +11, ya están completas.
  if(date===today&&!exists&&TURNOS.slice(0,TURNOS.indexOf(turn)).some(
   earlier=>fiveHeads(current,earlier)===null))continue;
  if(exists&&!published&&date===today)continue;
  const origin:TrendSaved['origin']=date===today&&!exists?'capturado':'reconstruido';
  const cutoff=preSheetAtCut(full,turn,TURNOS.indexOf(turn));
  const pre=buildMotorLalo(cutoff,date,turn,historical);
  const picks:Partial<Record<TrendEngine,string[]>>={
   lalo:pre.ranks.vt2.slice(0,10).map(f=>f.family)
  };
  if(refs.ayer&&auxYesterday){
   const v=buildMotorLaloAuxiliar(date,turn,auxAtCut(auxYesterday,turn,'anterior'),refs.ayer);
   picks.ayer=v.ranks[2].slice(0,10).map(f=>f.family);
  }
  if(refs.hoy&&auxToday){
   const v=buildMotorLaloAuxiliar(date,turn,auxAtCut(auxToday,turn,'intrajornada'),refs.hoy);
   picks.hoy=v.ranks[2].slice(0,10).map(f=>f.family);
  }
  for(const engine of ['lalo','ayer','hoy'] as const){
   const top=cleanTop(picks[engine]||[]);
   if(!top)continue;
   const candidate:TrendSaved={date,turn,engine,top,origin,
    createdAt:new Date().toISOString(),
    ...(published?{heads:published}:{})};
   const next=recordTrend(result,candidate);
   if(next!==result){result=next;changed=true}
  }
 }
 return {journal:result,changed,complete,
  finalizable:!!auxYesterday&&!!auxToday&&!!refs.ayer&&!!refs.hoy};
}
export async function syncTrendJournal(today=localDay(),
 onUpdated?:(journal:TrendJournal)=>void):Promise<TrendJournal>{
 let journal=await loadTrendJournal();
 onUpdated?.(journal);
 const cachedDraw=new Map<string,Promise<CabezasDia>>();
 const cachedAux=new Map<string,Promise<AuxiliaryHeads>>();
 const sources:Sources={
  getDraw:(date)=>{
   let p=cachedDraw.get(date);
   if(!p){p=descargarCabezas(date,true);cachedDraw.set(date,p)}
   return p;
  },
  getAux:(date)=>{
   let p=cachedAux.get(date);
   if(!p){p=fetchAuxiliaryHeads(date).then(x=>x.heads);cachedAux.set(date,p)}
   return p;
  }
 };
 for(const date of trendSyncDates(today)){
  if(date<today&&journal.scannedDates.includes(date))continue;
  try{
   const outcome=await replayOneTrendDate(date,today,journal,sources);
   if(outcome.changed)journal=outcome.journal;
   const scanned=outcome.complete&&outcome.finalizable&&date<today&&
    !journal.scannedDates.includes(date);
   if(scanned)journal={...journal,scannedDates:[...journal.scannedDates,date]};
   if(outcome.changed||scanned){
    await saveTrendJournal(journal);
    onUpdated?.(journal);
   }
  }catch{
   // La consulta de tendencias nunca bloquea la hoja, ni convierte una
   // falla de red en una nueva distribución estadística inventada.
  }
 }
 return journal;
}
