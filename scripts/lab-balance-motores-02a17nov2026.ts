/**
 * Auditoría nueva, fechada 18/11/2026. Compara los motores reales de Modelo
 * Lalo para jornadas COMPLETAS 02-17/11/2026 (18/11 excluido por Nocturno).
 * Rank PRE reconstruido por cortes, resultados POST sólo para cotejo final.
 *
 * Motores: Lalo +11, Aux Ayer / Hoy y Formas Primero (aux cada política).
 * Modalidades: VT2, VT3, lugares 1–5/6–10, top3/5/10 y #11–20.
 * No compara auxiliares usando la misma disponibilidad del turno si no la
 * tenían; Aux Hoy Previa nunca es evaluable.
 * No cambia componentes de producción.
 */
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import type {AuxiliaryHistorical} from '../src/motorLaloIntegral';
import {auxFamily,auxiliaryBoard,collectAuxFamilies} from '../src/auxSantiagoNeuquen';
import {selectAuxFormFirst} from '../src/labAuxFormasPrimeroVT3';

const FROM='2026-11-02',TO='2026-11-17';
const headJurs=JURS.filter(j=>j!=='Montevideo');
const valid=(s:string)=>/^\d{4}$/.test(s);
const drawCache=new Map<string,Promise<CabezasDia>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
function draw(d:string){
 let promise=drawCache.get(d);
 if(!promise){promise=descargarCabezas(d,true);drawCache.set(d,promise)}
 return promise;
}
function aux(d:string){
 let promise=auxCache.get(d);
 if(!promise){promise=fetchAuxiliaryHeads(d);auxCache.set(d,promise)}
 return promise;
}
type Model='lalo'|'aux_ayer'|'aux_hoy'|'formas_ayer'|'formas_hoy';
type Vt='VT2'|'VT3';
type Datum={
 date:string;turn:Turno;model:Model;vt:Vt;
 top:string[];topLength:number;top3:number|null;top5:number|null;
 top10:number|null;first:number|null;second:number|null;
 rank11to20:number|null;winnerDetails:{
  jur:string;head:string;family:string;rank:number|null
 }[];
 formable:number|null;historicalRoots?:number;
};
const rankOnce=(date:string,turn:Turno,model:Model,vt:Vt,top:string[],
 winners:{jur:string;head:string}[],formable:number|null,
 historicalRoots?:number):Datum=>{
 const familyOf=vt==='VT2'?
  (s:string)=>reversibleFamily(s):(s:string)=>auxFamily(s);
 const details=winners.map(w=>{
  const f=familyOf(w.head.slice(vt==='VT2'?-2:-3));
  const pos=top.indexOf(f);
  return {...w,family:f,rank:pos<0?null:pos+1};
 });
 const hit=(l:number,h:number)=>details.filter(x=>x.rank!==null&&x.rank>=l&&x.rank<=h).length;
 const n=top.length;
 return {date,turn,model,vt,top,topLength:n,
  top3:n>=3?hit(1,3):null,top5:n>=5?hit(1,5):null,
  top10:n>=10?hit(1,10):null,
  first:n>=10?hit(1,5):null,second:n>=10?hit(6,10):null,
  rank11to20:n>=20?hit(11,20):null,
  winnerDetails:details,formable,historicalRoots
 };
};
function summarize(xs:Datum[]){
 const score=(k:keyof Datum)=>xs.reduce((s,r)=>s+(typeof r[k]==='number'&&r[k]!==null?(r[k] as number):0),0);
 const eligible=(k:keyof Datum)=>xs.filter(r=>r[k]!==null&&typeof r[k]==='number').length;
 const sum=xs.reduce((s,r)=>s+r.winnerDetails.length,0);
 const headHits=xs.filter(x=>x.top10!==null).flatMap(x=>
  x.winnerDetails.filter(z=>z.rank!==null&&z.rank<=10));
 const allRanked=xs.flatMap(x=>x.winnerDetails.filter(z=>z.rank!==null));
 return {
  cuts:xs.length,heads:sum,top10EligibleCuts:eligible('top10'),
  top10EligibleHeads:eligible('top10')*5,
  hitsTop3:score('top3'),cutsTop3:eligible('top3'),
  hitsTop5:score('top5'),cutsTop5:eligible('top5'),
  hitsTop10:score('top10'),turnsWithOneOrMoreTop10:xs.filter(x=>(x.top10??0)>0).length,
  hitsFirst5:score('first'),hitsSecond5:score('second'),
  top11to20Hits:score('rank11to20'),top11to20Cuts:eligible('rank11to20'),
  allRankedHeads:allRanked.length,rankedButOutsideTop10:allRanked.filter(x=>x.rank!>10).length,
  validHeadsFormable:xs.filter(x=>x.formable!==null).reduce((s,x)=>s+x.formable!,0),
  headsOnFormableCuts:xs.filter(x=>x.formable!==null).length*5,
  top10HitExamples:headHits.slice(0,20).map(x=>({jur:x.jur,head:x.head,family:x.family,rank:x.rank}))
 };
}
async function one(date:string):Promise<{date:string;rows:Datum[];missing:{turn:Turno;found:number}[]}>{
 const weekDate=shiftDay(date,-7);
 const [current,previous,weekly,noctBase]=await Promise.all([
  draw(date),loadPreviousDraws(date,6,draw),draw(weekDate),
  nocturnaAnteriorPorJur(date,draw)
 ]);
 const hist:LaloHistorical[]=[];
 const latest=previous.at(-1)!,before=previous.at(-2)!;
 hist.push({date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,before.heads)});
 if(weekDate<date&&hasDrawResults(weekly)){
  const beforeWeek=await loadPreviousDraws(weekDate,1,draw);
  hist.push({date:weekDate,period:'D−7',sheet:buildSheet(weekly,beforeWeek[0].heads)});
 }
 const historicalRefs=hist.map(ref=>({
  date:ref.date,period:ref.period,
  heads:ref.date===latest.date?latest.heads:weekly
 }));
 const auxDays=new Set<string>([date,auxiliarySourceDate(date)]);
 for(const p of previous){
  auxDays.add(p.date);auxDays.add(auxiliarySourceDate(p.date));
 }
 for(const ref of historicalRefs){
  auxDays.add(ref.date);auxDays.add(auxiliarySourceDate(ref.date));
 }
 const observations=new Map(await Promise.all([...auxDays].map(async d=>
  [d,(await aux(d)).heads] as const)));
 const auxHist={} as Record<AuxMode,AuxiliaryHistorical[]>;
 const sixHist={} as Record<AuxMode,AuxiliaryHistorical[]>;
 for(const mode of ['anterior','intrajornada'] as const){
  const refDate=(day:string)=>mode==='anterior'?auxiliarySourceDate(day):day;
  auxHist[mode]=historicalRefs.map(ref=>({
   date:ref.date,period:ref.period,
   aux:extractAuxHistoryMode(ref.date,observations.get(refDate(ref.date))!,
    ref.heads,mode)
  }));
  sixHist[mode]=previous.map(p=>({
   date:p.date,period:'D−1' as const,
   aux:extractAuxHistoryMode(p.date,observations.get(refDate(p.date))!,
    p.heads,mode)
  }));
 }
 const whole=buildSheet(current,noctBase.heads);
 const rows:Datum[]=[],missing:{turn:Turno;found:number}[]=[];
 for(const turn of TURNOS){
  const observed=headJurs.map(jur=>({jur,head:current[turn]?.[jur]||''}));
  if(observed.some(x=>!valid(x.head))){
   missing.push({turn,found:observed.filter(x=>valid(x.head)).length});
   continue;
  }
  const pre=preSheetAtCut(whole,turn,TURNOS.indexOf(turn));
  const lalo=buildMotorLalo(pre,date,turn,hist);
  for(const [vt,k] of [['VT2','vt2'],['VT3','vt3']] as const){
   const ranks=lalo.ranks[k].map(x=>x.family);
   rows.push(rankOnce(date,turn,'lalo',vt,ranks,observed,null));
  }
  for(const mode of ['anterior','intrajornada'] as const){
   const name:Model=mode==='anterior'?'aux_ayer':'aux_hoy';
   const formName:Model=mode==='anterior'?'formas_ayer':'formas_hoy';
   const source=mode==='anterior'?auxiliarySourceDate(date):date;
   const boardHeads=auxAtCut(observations.get(source)!,turn,mode);
   const board=auxiliaryBoard(boardHeads,turn);
   const ranks=buildAuxIndependent(date,turn,boardHeads,auxHist[mode]);
   for(const [vt,length] of [['VT2',2],['VT3',3]] as const){
    const values=ranks[length].map(x=>x.family);
    const physical=new Set(collectAuxFamilies(board,length));
    const possible=new Set([...physical].map(x=>x.family));
    const hit=observed.filter(x=>possible.has(auxFamily(x.head.slice(-length)))).length;
    rows.push(rankOnce(date,turn,name,vt,values,observed,hit));
   }
   const forms=selectAuxFormFirst(board,sixHist[mode],date,name);
   const families=forms.top.map(x=>x.family);
   const physical=collectAuxFamilies(board,3).map(x=>x.family);
   const physicalSet=new Set(physical);
   rows.push(rankOnce(date,turn,formName,'VT3',families,observed,
    observed.filter(x=>physicalSet.has(auxFamily(x.head.slice(-3)))).length,
    forms.winnerRoots));
  }
 }
 return {date,rows,missing};
}
async function main(){
 const dates:string[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1))
  if(new Date(d+'T12:00:00Z').getUTCDay()!==0)dates.push(d);
 const successes:Awaited<ReturnType<typeof one>>[]=[];
 const skipped:{date:string;error:string}[]=[];
 for(const date of dates){
  try{
   const result=await one(date);
   successes.push(result);
   const scores=Object.fromEntries(
    (['lalo','aux_ayer','aux_hoy','formas_ayer','formas_hoy'] as Model[])
     .map(model=>[model,Object.fromEntries((['VT2','VT3'] as Vt[])
      .map(vt=>[vt,result.rows.filter(x=>x.model===model&&x.vt===vt)
       .reduce((s,x)=>s+(x.top10??0),0)]))]));
   console.log('BALANCE_DAY',date,
    JSON.stringify({cuts:TURNOS.length-result.missing.length,
     missing:result.missing,score:scores}));
  }catch(e){
   skipped.push({date,error:String(e).slice(0,280)});
   console.log('BALANCE_SKIP',date,String(e).slice(0,250));
  }
 }
 const all=successes.flatMap(x=>x.rows);
 const models=['lalo','aux_ayer','aux_hoy','formas_ayer','formas_hoy'] as Model[];
 const vts=['VT2','VT3'] as Vt[];
 const byModel=Object.fromEntries(models.map(m=>[m,Object.fromEntries(vts
  .filter(v=>!(m.startsWith('formas')&&v==='VT2'))
  .map(v=>[v,summarize(all.filter(x=>x.model===m&&x.vt===v))]))]));
 const byTurn=Object.fromEntries(TURNOS.map(turn=>[
  turn,Object.fromEntries(models.map(m=>[m,Object.fromEntries(vts
   .filter(v=>!(m.startsWith('formas')&&v==='VT2'))
   .map(v=>[v,summarize(all.filter(x=>x.turn===turn&&x.model===m&&x.vt===v))]))]))
 ]));
 const result={
  dates:dates,dayCount:successes.length,from:FROM,to:TO,
  skipped,missingDraws:successes.filter(x=>x.missing.length).map(x=>({
   date:x.date,missing:x.missing})),
  method:'PRE reconstruido: +11 y Aux Ayer/Hoy D−1 y D−7, Formas Primero seis jornadas. Montevideo sólo como fuente, no objetivo. 5 jurisdicciones objetivo por corte. Top10 requiere 10 familias completas.',
  byModel,byTurn,
  rankedExamples:all.filter(x=>x.vt==='VT3'&&x.top10!==null)
   .flatMap(x=>x.winnerDetails.filter(y=>y.rank!==null&&y.rank<=20)
    .map(y=>({date:x.date,turn:x.turn,model:x.model,...y}))).slice(-75),
  daily:successes.map(x=>({date:x.date,cuts:5-x.missing.length,
   hits:Object.fromEntries(models.map(m=>[m,Object.fromEntries(vts
    .filter(v=>!(m.startsWith('formas')&&v==='VT2'))
    .map(v=>[v,x.rows.filter(y=>y.model===m&&y.vt===v)
     .reduce((s,y)=>s+(y.top10??0),0)]))]))}))
 };
 console.log('BALANCE_JSON_START');
 console.log(JSON.stringify(result));
 console.log('BALANCE_JSON_END');
 if(successes.length<10)throw Error('Menos de 10 fechas completas con recursos: '+
  JSON.stringify(skipped));
}
main().catch(e=>{console.error('BALANCE_ERROR',e);process.exitCode=1});
