/**
 * Backtest PRE, familias VT2, corte 1-5 vs 6-10 en rankings reales.
 * Lalo +11 (oficial), Aux Santiago/Neuquén AYER, Aux HOY intrajornada,
 * y Formas Primero VT2 (experimental, separado).
 * Excluye resultados objetivo de entradas predictivas; nunca cambia la app.
 */
import assert from 'node:assert/strict';
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay,previousDrawDay} from '../src/dates';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from '../src/motorLaloAuxiliar';
import type {AuxiliarHistory} from '../src/motorLaloAuxiliar';
import {extractAuxHistoryMode,auxAtCut} from '../src/auxTemporalModes';
import {emptyAuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {buildFormFirstVt2} from '../src/motorFormasPrimero';
import {preSheetAtCut} from '../src/infoCandidatos';

type Model='Lalo +11 VT2'|'Auxiliar AYER VT2'|'Auxiliar HOY VT2'|'Formas Primero VT2';
const MODELS:Model[]=['Lalo +11 VT2','Auxiliar AYER VT2','Auxiliar HOY VT2','Formas Primero VT2'];
const FROM='2026-04-20',FIRST='2026-06-01',LAST='2026-10-30';
const TARGET_JURS=JURS.filter(j=>j!=='Montevideo');
const dates:string[]=[];
for(let d=FROM;d<=LAST;d=shiftDay(d,1))
 if(new Date(d+'T12:00:00Z').getUTCDay()!==0)dates.push(d);
const draws=new Map<string,CabezasDia>();
const rawAux=new Map<string,AuxiliaryHeads>();
const sheets=new Map<string,DailySheet>();
const historicalAux=new Map<string,ReturnType<typeof extractAuxiliarHistory>>();
const historicalIntra=new Map<string,ReturnType<typeof extractAuxHistoryMode>>();
const valid=(x:string)=>/^\d{4}$/.test(x);
const hasDraw=(date:string)=>{
 const heads=draws.get(date);
 return !!heads&&TURNOS.some(t=>JURS.some(j=>valid(heads[t]?.[j]||'')))&&
  JURS.some(j=>valid(heads.Nocturno?.[j]||''));
};
const hasAux=(aux:AuxiliaryHeads|undefined)=>!!aux&&Object.values(aux).some(by=>Object.values(by).some(valid));
async function retry<T>(task:()=>Promise<T>,label:string):Promise<T>{
 let reason:unknown;
 for(let n=0;n<3;n++){
  try{return await task()}catch(e){reason=e;await new Promise(resolve=>setTimeout(resolve,300*(n+1)))}
 }
 throw Error('Error recuperando '+label+': '+String(reason));
}
async function load(){
 for(let i=0;i<dates.length;i+=8){
  await Promise.all(dates.slice(i,i+8).map(async d=>{
   const [draw,aux]=await Promise.all([
    retry(()=>descargarCabezas(d,true),'sorteo '+d),
    retry(()=>fetchAuxiliaryHeads(d),'auxiliar '+d)
   ]);
   draws.set(d,draw);rawAux.set(d,aux.heads);
  }));
  if(i%40===0)console.log('DATOS_VT2 '+Math.min(i+8,dates.length)+'/'+dates.length);
 }
}
function sheet(date:string):DailySheet{
 const cached=sheets.get(date);if(cached)return cached;
 const current=draws.get(date);
 assert.ok(current,'Sorteos de la fecha faltantes: '+date);
 const before=Object.fromEntries(TURNOS.map(t=>[t,Object.fromEntries(JURS.map(j=>[j,'----']))])) as CabezasDia;
 for(const j of JURS){
  const previous=dates.findLast(d=>d<date&&valid(draws.get(d)?.Nocturno?.[j]||''));
  if(!previous)throw Error('Falta nocturna anterior '+date+' '+j);
  before.Nocturno[j]=draws.get(previous)!.Nocturno[j];
 }
 const result=buildSheet(current,before);sheets.set(date,result);return result;
}
function oldAux(date:string,mode:'anterior'|'intrajornada'){
 const cache=mode==='anterior'?historicalAux:historicalIntra;
 let result=cache.get(date);
 if(result)return result;
 const sourceDate=mode==='anterior'?previousDrawDay(date):date;
 const raw=rawAux.get(sourceDate);
 if(!raw)throw Error('Fuente AUX histórica ausente '+sourceDate);
 const observed=draws.get(date);
 if(!observed)throw Error('Cabezas históricas ausentes '+date);
 result=mode==='anterior'
  ?extractAuxiliarHistory(date,raw,observed)
  :extractAuxHistoryMode(date,raw,observed,'intrajornada');
 cache.set(date,result);return result;
}
type Pick={family:string;values:string[]};
type Match={jur:string;head:string;lastTwo:string};
type Row={date:string;turn:Turno;model:Model;heads:Match[];
 top:Pick[];rankHits:number[];coverage:[number,number];
};
const values=(family:string)=>[...new Set(family.split('/'))];
const uniq=(xs:Pick[])=>new Set(xs.map(x=>x.family)).size===xs.length;
const countValues=(xs:Pick[])=>new Set(xs.flatMap(x=>x.values)).size;
function collect(date:string,turn:Turno,eligible:string[]):Row[]{
 const prior=eligible.filter(d=>d<date);
 const prev=prior.at(-1);
 if(!prev)throw Error('Sin D-1');
 const d7=shiftDay(date,-7);
 const historical:LaloHistorical[]=[{date:prev,period:'D−1',sheet:sheet(prev)}];
 if(eligible.includes(d7)&&d7<date)
  historical.push({date:d7,period:'D−7',sheet:sheet(d7)});
 const current=sheet(date);
 const pre=preSheetAtCut(current,turn,TURNOS.indexOf(turn));
 const original=buildMotorLalo(pre,date,turn,historical);
 const selected:Record<Model,Pick[]> = {
  'Lalo +11 VT2':original.ranks.vt2.slice(0,10).map(x=>({family:x.family,values:values(x.family)})),
  'Auxiliar AYER VT2':[],
  'Auxiliar HOY VT2':[],
  'Formas Primero VT2':[]
 };
 for(const mode of ['anterior','intrajornada'] as const){
  const source=mode==='anterior'?previousDrawDay(date):date;
  const auxRaw=rawAux.get(source)||emptyAuxiliaryHeads();
  if(!hasAux(auxRaw))continue;
  const history:AuxiliarHistory[]=historical.map(h=>({
   date:h.date,period:h.period,
   ...(mode==='anterior'?{sourceDate:previousDrawDay(h.date)}:{}),
   aux:oldAux(h.date,mode)
  }));
  const live=buildMotorLaloAuxiliar(date,turn,auxAtCut(auxRaw,turn,mode),history);
  selected[mode==='anterior'?'Auxiliar AYER VT2':'Auxiliar HOY VT2']=
   live.ranks[2].slice(0,10).map(x=>({family:x.family,values:[...new Set(x.values)]}));
 }
 const past6=prior.slice(-6).map(d=>({date:d,heads:draws.get(d)!,sheet:sheet(d)}));
 selected['Formas Primero VT2']=buildFormFirstVt2(pre,date,turn,past6,10)
  .top.map(x=>({family:x.family,values:values(x.family)}));
 const heads=TARGET_JURS.map(j=>({jur:j,head:draws.get(date)![turn]?.[j]||''}))
  .filter(x=>valid(x.head)).map(x=>({...x,lastTwo:x.head.slice(-2)}));
 return MODELS.map(model=>{
  const top=selected[model];
  assert.ok(top.length<=10&&uniq(top),'Ranking VT2 no es único: '+model+' '+date+' '+turn);
  assert.ok(top.every(p=>p.values.every(v=>/^\d{2}$/.test(v))),'Valor VT2 incorrecto');
  const hitRanks=heads.map(h=>top.findIndex(p=>p.values.includes(h.lastTwo))+1);
  const coverage:[number,number]=[
   countValues(top.slice(0,5)),countValues(top.slice(5,10))
  ];
  return {date,turn,model,heads,top,rankHits:hitRanks,coverage};
 });
}
type Score={
 cuts:number;heads:number;first:number;last:number;total:number;
 firstTurns:number;lastTurns:number;bothTurns:number;emptyTurns:number;
 firstBetter:number;lastBetter:number;ties:number;
 coverageFirstPct:number;coverageLastPct:number;
 expectedFirst:number;expectedLast:number;
 ranks:number[];firstTopPositions:number;lastTopPositions:number;
};
function score(rows:Row[]):Score{
 const x:Score={cuts:rows.length,heads:0,first:0,last:0,total:0,
  firstTurns:0,lastTurns:0,bothTurns:0,emptyTurns:0,
  firstBetter:0,lastBetter:0,ties:0,
  coverageFirstPct:0,coverageLastPct:0,expectedFirst:0,expectedLast:0,
  ranks:Array(10).fill(0),firstTopPositions:0,lastTopPositions:0};
 for(const row of rows){
  const f=row.rankHits.filter(n=>n>=1&&n<=5).length;
  const l=row.rankHits.filter(n=>n>=6&&n<=10).length;
  x.heads+=row.heads.length;x.first+=f;x.last+=l;x.total+=f+l;
  x.firstTurns+=Number(f>0);x.lastTurns+=Number(l>0);
  x.bothTurns+=Number(f>0&&l>0);x.emptyTurns+=Number(f+l===0);
  x.firstBetter+=Number(f>l);x.lastBetter+=Number(l>f);x.ties+=Number(f===l);
  x.coverageFirstPct+=row.coverage[0];x.coverageLastPct+=row.coverage[1];
  x.expectedFirst+=row.heads.length*row.coverage[0]/100;
  x.expectedLast+=row.heads.length*row.coverage[1]/100;
  x.firstTopPositions+=Math.min(row.top.length,5);
  x.lastTopPositions+=Math.max(0,row.top.length-5);
  row.rankHits.forEach(n=>{if(n>0&&n<=10)x.ranks[n-1]++});
 }
 x.expectedFirst=+x.expectedFirst.toFixed(2);x.expectedLast=+x.expectedLast.toFixed(2);
 x.coverageFirstPct=+(x.coverageFirstPct/Math.max(1,x.cuts)).toFixed(2);
 x.coverageLastPct=+(x.coverageLastPct/Math.max(1,x.cuts)).toFixed(2);
 return x;
}
function samples(rows:Row[]){
 const complete=rows.filter(row=>row.top.length===10);
 const incomplete=rows.filter(row=>row.top.length<10);
 return {eligibleCuts:complete.length,incompleteCuts:incomplete.length,
  incompleteByTurn:TURNOS.map(turn=>({turn,count:incomplete.filter(r=>r.turn===turn).length})),
  result:score(complete)};
}
function bootstrap(rows:Row[],seed=193712,rep=2500){
 const perDate=new Map<string,number>();
 for(const row of rows){
  const delta=row.rankHits.filter(n=>n>=1&&n<=5).length-
   row.rankHits.filter(n=>n>=6&&n<=10).length;
  perDate.set(row.date,(perDate.get(row.date)||0)+delta);
 }
 const diffs=[...perDate.values()];
 let state=seed;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 const res:number[]=[];
 for(let k=0;k<rep;k++){
  let x=0;for(let d=0;d<diffs.length;d++)x+=diffs[Math.floor(random()*diffs.length)];
  res.push(x);
 }
 res.sort((a,b)=>a-b);
 return {days:diffs.length,observed:diffs.reduce((a,b)=>a+b,0),
  bootstrap95:[res[Math.floor(rep*0.025)],res[Math.floor(rep*0.975)]]};
}
async function main(){
 await load();
 const validDates=dates.filter(hasDraw);
 const reasons:string[]=[];const all:Row[]=[];
 for(const date of validDates){
  if(date<FIRST||date>LAST)continue;
  if(validDates.filter(x=>x<date).length<30){reasons.push(date+' sin 30 previas');continue}
  for(const turn of TURNOS){
   const count=TARGET_JURS.filter(j=>valid(draws.get(date)![turn]?.[j]||'')).length;
   if(count<4){reasons.push(date+' '+turn+' solo '+count+' cabezas');continue}
   try{all.push(...collect(date,turn,validDates))}
   catch(e){reasons.push(date+' '+turn+' '+String(e))}
  }
  if(all.length%400<20)console.log('CORTES_VT2 '+all.length);
 }
 const train=(x:Row)=>x.date<='2026-08-31';
 const validate=(x:Row)=>x.date>='2026-09-01';
 const months=['2026-06','2026-07','2026-08','2026-09','2026-10'];
 const report=Object.fromEntries(MODELS.map(model=>{
  const rows=all.filter(r=>r.model===model);
  const full=rows.filter(r=>r.top.length===10);
  const training=full.filter(train),holdout=full.filter(validate);
  const trendByTurn=TURNOS.map(turn=>{
   const old=training.filter(r=>r.turn===turn);
   const later=holdout.filter(r=>r.turn===turn);
   const a=score(old),b=score(later);
   const chosen=a.first===a.last?'sin_dominancia':a.first>a.last?'primera':'segunda';
   const favored=chosen==='primera'?b.first:chosen==='segunda'?b.last:null;
   const counter=chosen==='primera'?b.last:chosen==='segunda'?b.first:null;
   return {turn,selectionByJunAug:chosen,
    trainCuts:old.length,train:{first:a.first,last:a.last},
    testCuts:later.length,test:{first:b.first,last:b.last},
    holdoutFavoredHits:favored,holdoutOppositeHits:counter,
    persists:favored===null?null:favored>counter};
  });
  return [model,{
   all:samples(rows),
   trainJunAug:{...samples(training),bootstrap:bootstrap(training,31225)},
   validationSepOct:{...samples(holdout),bootstrap:bootstrap(holdout,41699)},
   months:months.map(month=>({month,...samples(rows.filter(r=>r.date.startsWith(month)))})),
   byTurn:TURNOS.map(turn=>({turn,...samples(rows.filter(r=>r.turn===turn))})),
   validationByTurn:TURNOS.map(turn=>({turn,...samples(holdout.filter(r=>r.turn===turn))})),
   trendByTurn
  }];
 }));
 const result={methods:MODELS,from:FIRST,to:LAST,
  inputDates:dates.length,drawDates:validDates.length,
  completeSampling:'5 selected ranks per side; exclude ranking with fewer than 10',
  heads:'only valid heads in Ciudad Provincia Córdoba Santa Fé Entre Ríos',
  expected:'per-head uniform 00-99 reference adjusted by exact orientation coverage',
  auxRules:'AYER full previous day; HOY current source only before target turn (Previa no data)',
  observations:all.length,skipped:reasons.length,errors:reasons.slice(0,35),
  report};
 console.log('MITADES_VT2_JSON_START');
 console.log(JSON.stringify(result,null,2));
 console.log('MITADES_VT2_JSON_END');
}
main().catch(err=>{console.error('MITADES_VT2_ERROR',err);process.exitCode=1});
