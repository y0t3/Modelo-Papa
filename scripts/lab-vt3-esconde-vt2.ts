/**
 * Ensayo cronológico de los VT2 implícitos en las huellas VT3 Top10.
 * Sólo +11, sin usar auxiliares ni ranking experimental.
 * Cada turno tiene corte PRE real; las cabezas se incorporan sólo al evaluar.
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
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import {vt2InsideVt3PRE,evaluateEmbeddedVt2POST,equalBudgetPOST} from '../src/labVt3SufijosVt2';
import {evaluateRankPulses,evaluateAdjacentTurnPulses} from '../src/labPulsosPuestosVt3';
import type {RankObservation} from '../src/labPulsosPuestosVt3';
const from=process.env.VT3TO2_FROM||'2026-10-12';
const to=process.env.VT3TO2_TO||'2026-10-29';
const label=process.env.VT3TO2_LABEL||'octubre';
const memo=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{
 if(!memo.has(d))memo.set(d,descargarCabezas(d,true));
 return memo.get(d)!;
};
const sheetCache=new Map<string,Promise<ReturnType<typeof buildSheet>>>();
const full=(d:string)=>{
 if(!sheetCache.has(d))sheetCache.set(d,(async()=>{
  const [heads,base]=await Promise.all([
   get(d),nocturnaAnteriorPorJur(d,get,20)]);
  if(base.missing.length)throw Error('BASE PRE incompleta para '+d);
  return buildSheet(heads,base.heads);
 })());
 return sheetCache.get(d)!;
};
const complete=(heads:CabezasDia)=>
 TURNOS.every(t=>JURS.filter(j=>j!=='Montevideo')
  .every(j=>/^\d{4}$/.test(heads[t]?.[j]||'')));
type DayRecord={
 date:string;turn:Turno;
 heads:{jur:string;head:string}[];
 topVt2:string[];topVt3:string[];
 vt2All:number;vt2Derived:number;vt2Hidden:number;
 derivedOutsideTopAtRanks:number[];
 allBordes:number;numberOfMothers:number;physicalBlocks:number;
 scores:ReturnType<typeof evaluateEmbeddedVt2POST>;
 budgets:ReturnType<typeof equalBudgetPOST>;
 plainRankBudgets:{size:number;rank11Hits:number;count:number;extraOverlap:number}[];
 rankRows:RankObservation[];
};
async function main(){
 const rows:DayRecord[]=[],skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=to;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  try{
   const [today,history,base]=await Promise.all([
    get(date),loadPreviousDraws(date,6,get),
    nocturnaAnteriorPorJur(date,get,20)
   ]);
   if(base.missing.length||!complete(today))throw Error('Jornada o base incompleta');
   const weekDate=shiftDay(date,-7);
   const d1=history.at(-1)!.date;
   const weekSheet=await full(weekDate);
   const weekHeads=await get(weekDate);
   const historical=[{date:d1,period:'D−1' as const,sheet:await full(d1)},
    ...(hasDrawResults(weekHeads)?[
     {date:weekDate,period:'D−7' as const,sheet:weekSheet}
    ]:[])];
   for(let i=0;i<TURNOS.length;i++){
    const turn=TURNOS[i],earlier=diaVacio();
    for(const past of TURNOS.slice(0,i))earlier[past]={...today[past]};
    const pre=preSheetAtCut(buildSheet(earlier,base.heads),turn,i);
    if(pre.heads[turn]?.length||pre.matches[turn]?.length)
     throw Error('FUGA POST '+date+' '+turn);
    const lalo=buildMotorLalo(pre,date,turn,historical);
    const shown=vt2InsideVt3PRE(lalo);
    // El actual motor declara explícitamente la derivación VT3->VT2
    // en SU lista VT2 global, incluso si no la priorizó en el top10.
    if(shown.derived.some(x=>x.allVt2Rank===null))
     throw Error('VT2 real derivada pero NO registrada en Lalo: '+date+' '+turn);
    const heads=JURS.filter(j=>j!=='Montevideo')
     .map(j=>({jur:j,head:today[turn]?.[j]||''}))
     .filter(x=>/^\d{4}$/.test(x.head));
    const scores=evaluateEmbeddedVt2POST(shown,heads);
    const budgets=equalBudgetPOST(shown,lalo.ranks.vt2,heads);
    const rankRows:RankObservation[]=lalo.ranks.vt3.slice(0,10).map(mother=>{
     const same=shown.missingFromVt2Top.filter(x=>
      x.motherRanks.includes(mother.rank));
     const set=new Set(same.map(x=>x.family));
     const hits=scores.cases.filter(x=>set.has(x.vt2)).length;
     return {date,turn,rank:mother.rank,exposed:same.length,
      hits,mothers:[mother.family],families:[...set]};
    });
    const plainRankBudgets=budgets.map(b=>{
     const rank11=new Set(lalo.ranks.vt2.slice(10,10+b.focusSize).map(x=>x.family));
     const vals=heads.map(h=>reversibleFamily(h.head.slice(-2)));
     return {size:b.focusSize,count:rank11.size,
      rank11Hits:vals.filter(x=>rank11.has(x)).length,
      extraOverlap:b.focusFamilies.filter(x=>rank11.has(x)).length};
    });
    rows.push({date,turn,heads,topVt2:shown.vt2Top,topVt3:shown.vt3Top,
     vt2All:shown.allVt2Families,vt2Derived:shown.derived.length,
     vt2Hidden:shown.hiddenFamilies,derivedOutsideTopAtRanks:shown.missingVt2Ranks,
     allBordes:shown.derived.reduce((n,x)=>n+x.edges.length,0),
     physicalBlocks:shown.derived.reduce((n,x)=>n+x.uniqueSites,0),
     numberOfMothers:shown.vt3Top.length,scores,budgets,plainRankBudgets,rankRows});
   }
   console.log('VT3TO2_DAY',date,JSON.stringify(
    rows.filter(x=>x.date===date).map(x=>({
     turn:x.turn,hidden:x.vt2Hidden,
     topWins:x.scores.top10Wins,hiddenWins:x.scores.extraWins,
     daughterCount:x.vt2Derived}))));
  }catch(error){
   if(String(error).includes('FUGA')||String(error).includes('derivada pero'))
    throw error;
   skipped.push({date,reason:String(error).slice(0,250)});
   console.log('VT3TO2_SKIP',date,String(error).slice(0,200));
  }
 }
 const sum=(rs:DayRecord[],fn:(r:DayRecord)=>number)=>
  rs.reduce((n,r)=>n+fn(r),0);
 const reportOf=(part:DayRecord[])=>{
  const budgets=[3,5,10,15,20].map(k=>{
   const data=part.flatMap(x=>x.budgets.filter(b=>b.budget===k)
    .map(b=>({...b,pl:x.plainRankBudgets.find(y=>y.size===b.focusSize)})));
   return {k,shownFamilies:sum(part,x=>x.budgets.find(b=>b.budget===k)!.focusSize),
    focusHeads:data.reduce((n,x)=>n+x.focusHitHeads,0),
    disjointControlHeads:data.reduce((n,x)=>n+x.controlHitHeads,0),
    controlFamilies:data.reduce((n,x)=>n+x.controlSize,0),
    plainVt2NextHeads:data.reduce((n,x)=>n+(x.pl?.rank11Hits||0),0),
    plainNextFamilies:data.reduce((n,x)=>n+(x.pl?.count||0),0),
    overlapNext:sum(part,x=>x.plainRankBudgets.find(b=>
     b.size===x.budgets.find(z=>z.budget===k)!.focusSize)?.extraOverlap||0)
   };
  });
  return {cuts:part.length,
   heads:sum(part,r=>r.scores.heads),
   vt2TopHits:sum(part,r=>r.scores.top10Wins),
   vt2DerivedHits:sum(part,r=>r.scores.derivedWins),
   vt2DerivedOnly:sum(part,r=>r.scores.extraWins),
   vt2TopOnly:sum(part,r=>r.scores.topOnlyWins),
   hitsBoth:sum(part,r=>r.scores.bothWins),
   hitsNeither:sum(part,r=>r.scores.neitherWins),
   vt3FullHits:sum(part,r=>r.scores.vt3ExactWins),
   vt2FamiliesInTop:sum(part,r=>r.scores.topFamilies),
   derivedFamiliesExposed:sum(part,r=>r.vt2Derived),
   derivedExtraFamiliesExposed:sum(part,r=>r.vt2Hidden),
   extraFamilyShare:sum(part,r=>r.vt2Derived)?
    Number((sum(part,r=>r.vt2Hidden)/sum(part,r=>r.vt2Derived)*100).toFixed(1)):null,
   derivedPhysicalEdges:sum(part,r=>r.allBordes),
   avgHiddenPerCut:part.length?
    Number((sum(part,r=>r.vt2Hidden)/part.length).toFixed(1)):null,
   top10AndDerivedUnionHitHeads:sum(part,r=>r.scores.top10Wins+r.scores.extraWins),
   derivedExtraNotFullVt3:sum(part,r=>r.scores.cases.filter(x=>
    x.inDerived&&!x.inTop10&&!x.vt3FullInTop).length),
   budgets};
 };
 const noct=rows.filter(x=>x.turn==='Nocturno');
 const months=[...new Set(rows.map(x=>x.date.slice(0,7)))].sort();
 const byMonth=Object.fromEntries(months.map(month=>[month,{
  all:reportOf(rows.filter(x=>x.date.startsWith(month))),
  nocturna:reportOf(noct.filter(x=>x.date.startsWith(month)))
 }]));
 // Las ventanas se forman por JORNADAS SORTEABLES, no por días
 // calendario, y son disjuntas para no contar una semana cinco veces.
 const windows5=Array.from({length:Math.ceil(noct.length/5)},(_,i)=>{
  const part=noct.slice(5*i,5*i+5);
  return {from:part[0].date,to:part.at(-1)!.date,
   days:part.length,summary:reportOf(part)};
 });
 const windowCounts={
  total:windows5.length,
  positive5:windows5.filter(w=>w.summary.budgets[1].focusHeads>
   w.summary.budgets[1].disjointControlHeads).length,
  negative5:windows5.filter(w=>w.summary.budgets[1].focusHeads<
   w.summary.budgets[1].disjointControlHeads).length,
  tied5:windows5.filter(w=>w.summary.budgets[1].focusHeads===
   w.summary.budgets[1].disjointControlHeads).length
 };
 const rankPulses=Object.fromEntries([
  ['2_en_3',3,2],['2_en_5',5,2],['3_en_5',5,3]
 ].map(([name,window,minimum])=>[
  name,evaluateRankPulses(rows.flatMap(r=>r.rankRows),
   Number(window),Number(minimum))
 ]));
 const noctRankPulses=Object.fromEntries([
  ['2_en_3',3,2],['2_en_5',5,2],['3_en_5',5,3]
 ].map(([name,window,minimum])=>[
  name,evaluateRankPulses(noct.flatMap(r=>r.rankRows),
   Number(window),Number(minimum))
 ]));
 const crossTurnPulses=evaluateAdjacentTurnPulses(rows.flatMap(x=>x.rankRows));
 const report={
  rankPulses,noctRankPulses,crossTurnPulses,
  method:'REPLAY PRE_RECONSTRUIDO, motor Lalo ORIGINAL, segmentos físicos contiguos de Top10 VT3, sin modelos AUX',
  period:{from,to,label},dates:new Set(rows.map(x=>x.date)).size,
  skipped,byMonth,windows5,windowCounts,summary:reportOf(rows),
  byTurn:Object.fromEntries(TURNOS.map(t=>
   [t,reportOf(rows.filter(x=>x.turn===t))])),
  nocturna:reportOf(noct),
  first:reportOf(rows.filter(x=>x.date<='2026-10-20')),
  second:reportOf(rows.filter(x=>x.date>='2026-10-21'&&x.date<='2026-10-28')),
  day29:reportOf(rows.filter(x=>x.date==='2026-10-29')),
  examples:rows.flatMap(x=>x.scores.cases.filter(y=>
   y.inDerived&&!y.inTop10).map(y=>({
   date:x.date,turn:x.turn,...y,
   vt2TopRank:'FUERA TOP10',
   daughterRanks:y.fromMotherRanks,
   vt3TopReallyMatched:y.vt3FullInTop
  }))).slice(-75),
  lastDays:rows.filter(x=>x.date>='2026-10-27').map(x=>({
   date:x.date,turn:x.turn,hidden:x.vt2Hidden,
   top:x.scores.top10Wins,hiddenWins:x.scores.extraWins,
   wins:x.scores.cases.filter(c=>c.inTop10||c.inDerived).map(c=>({
    jur:c.jur,head:c.head,vt2:c.vt2,
    inTop10:c.inTop10,inVT3Edges:c.inDerived,
    motherRanks:c.fromMotherRanks,vt2Rank:c.vt2Rank
   })),
   derivedRanking:x.budgets.find(z=>z.budget===10)?.focusFamilies
  }))
 };
 fs.mkdirSync('auditorias/vt3-esconde-vt2',{recursive:true});
 fs.writeFileSync('auditorias/vt3-esconde-vt2/'+label+'.json',
  JSON.stringify(report,null,2)+'\n');
 console.log('VT3TO2_RESUMEN',JSON.stringify({
  dates:report.dates,cuts:rows.length,skipped:skipped.length,
  summary:report.summary,byTurn:report.byTurn,
  nocturna:report.nocturna,byMonth:report.byMonth,
  windowCounts:report.windowCounts,windows5:report.windows5,
  rankPulses:report.rankPulses,
  noctRankPulses:report.noctRankPulses,
  crossTurnPulses:report.crossTurnPulses,
  first:report.first,second:report.second,
  day29:report.day29,examples:report.examples.slice(-12)
 }));
 if(rows.length<45)throw Error('Menos de 45 cortes históricos: '+rows.length);
}
main().catch(e=>{console.error('VT3TO2_ERROR',e);process.exitCode=1;});
