/**
 * Replay PRE, con las lecturas literales del Top10 VT3:
 * #N ABC/CBA -> BC/BA, sólo último par de CADA lectura.
 * No invierte los VT2, no corta trayectos, ni crea familias.
 * POST usa las cabezas únicamente para cotejar.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo} from '../src/motorLalo';
import {topVt3AsVt2PRE,evaluateTailPOST,rankTailsPulses}
 from '../src/labVt3Terminations';
import type {PublishedHead} from '../src/labVt3Terminations';

const from=process.env.VT3TAIL_FROM||'2026-10-12';
const to=process.env.VT3TAIL_TO||'2026-10-29';
const label=process.env.VT3TAIL_LABEL||'octubre';
const memo=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{
 if(!memo.has(d))memo.set(d,descargarCabezas(d,true));
 return memo.get(d)!;
};
const cache=new Map<string,Promise<ReturnType<typeof buildSheet>>>();
const full=(d:string)=>{
 if(!cache.has(d))cache.set(d,(async()=>{
  const [heads,base]=await Promise.all([
   get(d),nocturnaAnteriorPorJur(d,get,20)]);
  if(base.missing.length)throw Error('BASE incompleta '+d);
  return buildSheet(heads,base.heads);
 })());
 return cache.get(d)!;
};
const validDay=(h:CabezasDia)=>TURNOS.every(t=>
 JURS.filter(j=>j!=='Montevideo').every(j=>
  /^\d{4}$/.test(h[t]?.[j]||'')));
type RecordOne={
 date:string;turn:Turno;heads:PublishedHead[];
 vt3Ranks:{rank:number;vt3:string[];tails:string[]}[];
 vt2TopTails:string[];uniqueTails:string[];
 scores:ReturnType<typeof evaluateTailPOST>;
};
async function main(){
 const rows:RecordOne[]=[],skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=to;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  try{
   const [today,history,base]=await Promise.all([
    get(date),loadPreviousDraws(date,6,get),
    nocturnaAnteriorPorJur(date,get,20)]);
   if(base.missing.length||!validDay(today))
    throw Error('Jornada o base incompleta');
   const d1=history.at(-1)!.date;
   const weekDate=shiftDay(date,-7),weekHeads=await get(weekDate);
   const historical=[{date:d1,period:'D−1' as const,sheet:await full(d1)},
    ...(hasDrawResults(weekHeads)?[
     {date:weekDate,period:'D−7' as const,sheet:await full(weekDate)}
    ]:[])];
   for(let i=0;i<TURNOS.length;i++){
    const turn=TURNOS[i],earlier=diaVacio();
    for(const previous of TURNOS.slice(0,i))earlier[previous]={...today[previous]};
    const pre=preSheetAtCut(buildSheet(earlier,base.heads),turn,i);
    if(pre.heads[turn]?.length||pre.matches[turn]?.length)
     throw Error('FUGA POST en '+date+' '+turn);
    const engine=buildMotorLalo(pre,date,turn,historical);
    const preview=topVt3AsVt2PRE(engine);
    if(preview.rows.length>10)throw Error('Top VT3 excede 10 puestos');
    const heads=JURS.filter(j=>j!=='Montevideo')
     .map(j=>({jur:j,head:today[turn]?.[j]||''}))
     .filter(x=>/^\d{4}$/.test(x.head));
    const scores=evaluateTailPOST(preview,heads);
    rows.push({date,turn,heads,vt3Ranks:preview.rows.map(r=>({
     rank:r.rank,vt3:r.vt3,tails:r.tails})),
     vt2TopTails:preview.vt2TopTails,uniqueTails:preview.uniqueTails,scores});
   }
  }catch(error){
   if(String(error).includes('FUGA POST'))throw error;
   skipped.push({date,reason:String(error).slice(0,210)});
   console.log('VT3_TAIL_SKIP',date,String(error).slice(0,160));
  }
 }
 const stats=(part:RecordOne[])=>{
  const sum=(fn:(r:RecordOne)=>number)=>part.reduce((n,r)=>n+fn(r),0);
  return {cuts:part.length,heads:sum(r=>r.scores.heads),
   top2:sum(r=>r.scores.vt2TopHitHeads),
   vt3Tails:sum(r=>r.scores.vt3TailHitHeads),
   both:sum(r=>r.scores.both),
   tailOnly:sum(r=>r.scores.tailOnly),
   topOnly:sum(r=>r.scores.topOnly),
   none:sum(r=>r.scores.neither),
   fullVt3:sum(r=>r.scores.exactVt3HitHeads),
   avgUniqueSuffixes:part.length?
    Number((sum(r=>r.scores.distinctTails)/part.length).toFixed(2)):null,
   avgOfficialVt2Suffixes:part.length?
    Number((sum(r=>r.scores.distinctTop2)/part.length).toFixed(2)):null};
 };
 const rankRecords=rows.flatMap(r=>r.scores.ranks.map(x=>({
  date:r.date,turn:r.turn,rank:x.rank,exposed:x.exposed,
  hit:x.hit,hitHeads:x.hitHeads})));
 const pulse=(items:typeof rankRecords)=>Object.fromEntries(
  [['dos_en_tres',3,2],['dos_en_cinco',5,2],
   ['tres_en_cinco',5,3]].map(([name,window,minimum])=>{
   const p=rankTailsPulses(items,Number(window),Number(minimum));
   return [name,{eligible:p.eligible,alerts:p.alerts,
    alertHits:p.alertHits,nonAlerts:p.nonAlerts,
    nonAlertHits:p.nonAlertHits,byRank:p.byRank,
    recent:p.pulses.filter(x=>x.date>='2026-10-25')}];
  }));
 const byMonth=Object.fromEntries([...new Set(rows.map(x=>x.date.slice(0,7)))]
  .sort().map(month=>[month,{
   all:stats(rows.filter(r=>r.date.startsWith(month))),
   nocturna:stats(rows.filter(r=>r.date.startsWith(month)&&r.turn==='Nocturno'))
  }]));
 const byTurn=Object.fromEntries(TURNOS.map(turn=>[
  turn,{summary:stats(rows.filter(r=>r.turn===turn)),
   pulses:pulse(rankRecords.filter(x=>x.turn===turn)),
   rankSummary:Object.fromEntries(Array.from({length:10},(_,i)=>i+1)
    .map(rank=>[rank,{
     exposed:rows.filter(r=>r.turn===turn).reduce((n,r)=>
      n+Number(r.scores.ranks.some(x=>x.rank===rank)),0),
     hitDays:rows.filter(r=>r.turn===turn).reduce((n,r)=>
      n+Number(r.scores.ranks.some(x=>x.rank===rank&&x.hit)),0),
     hitHeads:rows.filter(r=>r.turn===turn).reduce((n,r)=>
      n+r.scores.ranks.filter(x=>x.rank===rank)
       .reduce((z,x)=>z+x.hitHeads,0),0)
    }]))
  }]));
 const latest=rows.filter(r=>r.date>='2026-10-27').map(r=>({
  date:r.date,turn:r.turn,
  ranks:r.scores.ranks.map(x=>({rank:x.rank,vt3:x.pair,
   tails:x.tails,hitHeads:x.hitHeads,matched:x.matched})),
  extra:r.scores.extras
 }));
 const report={method:'LECTURA LITERAL DOS ULTIMAS CIFRAS DE DOS VT3 POR PUESTO, no familias VT2 ni rutas parciales',
  period:{from,to,label},days:new Set(rows.map(r=>r.date)).size,cuts:rows.length,
  skipped,overall:stats(rows),byTurn,byMonth,
  pulses:pulse(rankRecords),
  nocturna:stats(rows.filter(r=>r.turn==='Nocturno')),
  nocturnaPulses:pulse(rankRecords.filter(x=>x.turn==='Nocturno')),
  first:stats(rows.filter(x=>x.date<='2026-10-20')),
  second:stats(rows.filter(x=>x.date>='2026-10-21'&&x.date<='2026-10-28')),
  day29:stats(rows.filter(x=>x.date==='2026-10-29')),
  latest};
 fs.mkdirSync('auditorias/vt3-ultimas-dos',{recursive:true});
 fs.writeFileSync('auditorias/vt3-ultimas-dos/'+label+'.json',
  JSON.stringify(report,null,2)+'\n');
 console.log('VT3_TAIL_REPORT',JSON.stringify({
  days:report.days,cuts:report.cuts,skipped:skipped.length,
  overall:report.overall,nocturna:report.nocturna,byMonth:report.byMonth,
  byTurn:Object.fromEntries(TURNOS.map(t=>[t,{
   summary:byTurn[t].summary,rankSummary:byTurn[t].rankSummary,
   pulses:byTurn[t].pulses.dos_en_tres
  }])),nocturnaPulses:report.nocturnaPulses,
  day29:report.day29,latest:report.latest.filter(r=>r.turn==='Nocturno').slice(-3)
 }));
 if(rows.length<45)throw Error('Muestra insuficiente '+rows.length);
}
main().catch(e=>{console.error('VT3_TAIL_ERROR',e);process.exitCode=1});
