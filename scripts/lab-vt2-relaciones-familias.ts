/**
 * LAB — movimiento de familias VT2 entre turnos y últimas seis jornadas.
 * Consume exclusivamente los cortes PRE reconstruidos mediante el motor
 * real de Lalo por scripts/lab-vt2-posiciones-libres.ts.
 * No altera los Tops, ni propone apuestas, ni modifica la APK.
 */
import fs from 'node:fs';
import {TURNOS} from '../src/domain';

type ResultHead={jur:string;head:string;family:string;position:number|null};
type Cut={date:string;turn:string;turnIndex:number;rankedFamilies:string[];
 usedBefore:number[];heads:ResultHead[];freePositions:number[]};
type Win={position:number;family:string;jur:string;head:string};
type Night={
 date:string;hits:Win[];priorWinners:(Win&{turn:string})[];
 markedFamilyPositions:number[];markedRankPositions:number[];
 markedFamilies:string[];rankedFamilies:string[];
 hitsPriorFamily:number;hitsPriorRank:number;
 familySlotCount:number;rankSlotCount:number;
 familiesFromPreviousTurn:number[];
 exactSameRankAsPreviousTurn:number[];
 priorSixSameTurnFamilies:number[];
};

const path='auditorias/vt2-posiciones-libres/resultados.json';
const json=JSON.parse(fs.readFileSync(path,'utf8'));
const rows=json.rows as Cut[];
const dates=[...new Set(rows.map(r=>r.date))];
if(rows.length!==635||dates.length!==127||json.baselineTop.top10!==674)
 throw Error('Desajuste con los 635 PRE de Lalo VT2');
const key=(date:string,turn:string)=>date+'|'+turn;
const lookup=new Map(rows.map(r=>[key(r.date,r.turn),r]));
function get(date:string,turn:string):Cut{
 const v=lookup.get(key(date,turn));
 if(!v)throw Error('No hay corte '+date+' '+turn);
 return v;
}
const wins=(r:Cut):Win[]=>(r.heads||[]).filter(h=>h.position!==null)
 .map(h=>({position:h.position as number,family:h.family,jur:h.jur,head:h.head}));
const nights:Night[]=[];
for(const [i,date] of dates.entries()){
 const pre=TURNOS.slice(0,4).map(t=>get(date,t));
 const noct=get(date,'Nocturno');
 // Solo cabezas reales del día anteriores a Nocturna que coincidieron con
 // el Top PRE de SU respectivo turno. No presupone ninguna repetición.
 const priorWinners=pre.flatMap(r=>wins(r).map(w=>({...w,turn:r.turn})));
 const wonFamilies=new Set(priorWinners.map(w=>w.family));
 const wonRanks=new Set(priorWinners.map(w=>w.position));
 const markedFamilies=noct.rankedFamilies.filter(f=>wonFamilies.has(f));
 const markedFamilyPositions=noct.rankedFamilies.flatMap((f,k)=>wonFamilies.has(f)?[k+1]:[]);
 const markedRankPositions=noct.rankedFamilies.flatMap((f,k)=>wonRanks.has(k+1)?[k+1]:[]);
 const hits=wins(noct);
 const previous=get(date,'Vespertino');
 const familiesFromPreviousTurn=noct.rankedFamilies.flatMap((f,k)=>
  previous.rankedFamilies.includes(f)?[k+1]:[]);
 const exactSameRankAsPreviousTurn=noct.rankedFamilies.flatMap((f,k)=>
  previous.rankedFamilies[k]===f?[k+1]:[]);
 const lastSix=dates.slice(Math.max(0,i-6),i).map(d=>get(d,'Nocturno'));
 const sixPool=new Set(lastSix.flatMap(r=>r.rankedFamilies));
 const priorSixSameTurnFamilies=noct.rankedFamilies.flatMap((f,k)=>sixPool.has(f)?[k+1]:[]);
 const hFam=hits.filter(h=>wonFamilies.has(h.family)).length;
 const hRank=hits.filter(h=>wonRanks.has(h.position)).length;
 nights.push({date,hits,priorWinners,markedFamilies,markedFamilyPositions,
  markedRankPositions,rankedFamilies:noct.rankedFamilies,hitsPriorFamily:hFam,
  hitsPriorRank:hRank,familySlotCount:markedFamilyPositions.length,
  rankSlotCount:markedRankPositions.length,
  familiesFromPreviousTurn,exactSameRankAsPreviousTurn,priorSixSameTurnFamilies});
}
const periods=[
 {name:'Junio–julio',from:'2026-06-01',to:'2026-07-31'},
 {name:'Agosto–septiembre',from:'2026-08-01',to:'2026-09-30'},
 {name:'Octubre 1–24',from:'2026-10-01',to:'2026-10-24'},
 {name:'Octubre 26–28',from:'2026-10-26',to:'2026-10-28'},
 {name:'Total',from:'2026-06-01',to:'2026-10-28'}
];
function periodStats(a:Night[]){
 const sum=(f:(n:Night)=>number)=>a.reduce((x,n)=>x+f(n),0);
 const hits=sum(n=>n.hits.length),priorFamilyHits=sum(n=>n.hitsPriorFamily);
 const priorRankHits=sum(n=>n.hitsPriorRank);
 const famPositions=sum(n=>n.familySlotCount);
 const rankPositions=sum(n=>n.rankSlotCount);
 const expectedUniform=sum(n=>n.hits.length*n.familySlotCount/10);
 const exactFamilyHitSlots=sum(n=>new Set(n.hits.filter(h=>n.markedFamilyPositions.includes(h.position))
  .map(h=>h.position)).size);
 return {nights:a.length,nocturnalHits:hits,
  priorFamilyHits,priorRankHits,priorFamilySlots:famPositions,
  priorRankSlots:rankPositions,expectedUniform,
  hitShare: hits?priorFamilyHits/hits:0,
  rankHitShare:hits?priorRankHits/hits:0,
  slotShare:a.length?famPositions/(a.length*10):0,
  nightWithRepeat:a.filter(n=>n.hitsPriorFamily>0).length,
  markHasAHitSlots:exactFamilyHitSlots,
  slotsMarkedNoHit:famPositions-exactFamilyHitSlots};
}
const byPeriod=periods.map(p=>({
 period:p.name,...periodStats(nights.filter(n=>n.date>=p.from&&n.date<=p.to))}));

// Por 6 jornadas completas anteriores se observa SI LA CONCENTRACIÓN
// ANTERIOR EXISTÍA ANTES DE LA NOCHE; se prueba sin ajustar umbrales.
const rolling=[] as any[];
for(const window of [5,6])for(const requiredNights of [2,3]){
 const selected=nights.filter((n,i)=>i>=window&&
  nights.slice(i-window,i).filter(d=>d.hitsPriorFamily>0).length>=requiredNights);
 for(const p of periods){
  const sub=selected.filter(n=>n.date>=p.from&&n.date<=p.to);
  rolling.push({window,requiredNights,period:p.name,...periodStats(sub)});
 }
}
let seed=20261029;
const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
const rep=25000;
const winsActual=nights.reduce((total,n)=>total+n.hitsPriorFamily,0);
const randomWithinCut:number[]=[];
for(let z=0;z<rep;z++){
 let hits=0;
 for(const n of nights){
  const swap=[1,2,3,4,5,6,7,8,9,10];
  for(let i=9;i>0;i--){const j=Math.floor(rand()*(i+1));[swap[i],swap[j]]=[swap[j],swap[i]]}
  for(const w of n.hits)if(n.markedFamilyPositions.includes(swap[w.position-1]))hits++;
 }
 randomWithinCut.push(hits);
}
const byStrata=new Map<string,number[]>();
for(const [i,n] of nights.entries()){
 const dow=new Date(n.date+'T12:00:00Z').getUTCDay();
 const k=n.date.slice(0,7)+'|'+dow;
 const v=byStrata.get(k)||[];v.push(i);byStrata.set(k,v);
}
const stratified:number[]=[];
for(let z=0;z<rep;z++){
 const swapped=nights.map(n=>n.markedFamilyPositions);
 for(const indices of byStrata.values()){
  const group=indices.map(i=>swapped[i]);
  for(let i=group.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[group[i],group[j]]=[group[j],group[i]]}
  for(let i=0;i<indices.length;i++)swapped[indices[i]]=group[i];
 }
 let x=0;
 for(const [i,n] of nights.entries())
  x+=n.hits.filter(h=>swapped[i].includes(h.position)).length;
 stratified.push(x);
}
function distribution(x:number[]){
 const sorted=[...x].sort((a,b)=>a-b);
 const avg=x.reduce((a,b)=>a+b,0)/x.length;
 const upper=x.filter(v=>v>=winsActual).length;
 const lower=x.filter(v=>v<=winsActual).length;
 return {actual:winsActual,expected:avg,interval95:[
  sorted[Math.floor(x.length*.025)],sorted[Math.floor(x.length*.975)]],
  oneSidedMoreP:(upper+1)/(x.length+1),
  twoSidedP:Math.min(1,2*Math.min((upper+1)/(x.length+1),(lower+1)/(x.length+1))),
  permutations:x.length};
}
const selectionTests={
 shuffledNightPositions:distribution(randomWithinCut),
 shuffledWithinMonthAndWeekday:distribution(stratified),
 strata:byStrata.size};
const windowDays=nights.slice(-6).map(n=>({
 date:n.date,priorHits:n.priorWinners.map(w=>({...w})),
 nocturno:n.rankedFamilies.map((family,i)=>({
  rank:i+1,family,
  alreadyWonFamily:n.markedFamilyPositions.includes(i+1),
  alreadyWonRank:n.markedRankPositions.includes(i+1),
  presentPreviousTurn:n.familiesFromPreviousTurn.includes(i+1),
  stillAtSameRank:n.exactSameRankAsPreviousTurn.includes(i+1),
  seenWithinPriorSixNights:n.priorSixSameTurnFamilies.includes(i+1),
  matchedHeads:n.hits.filter(h=>h.position===i+1).map(h=>({jur:h.jur,head:h.head}))
 })),
 summary:{nightHits:n.hits.length,repeatFamilyHits:n.hitsPriorFamily,
  previousWinningFamilies:n.markedFamilies.length}
}));
const data={type:'RETROSPECTIVE_PRE_REPLAY_NOT_PROSPECTIVE',
 source:'LALO_VT2',days:dates.length,cuts:rows.length,byPeriod,rolling,
 selectionTests,
 notes:[
  'The position #7 at Previa need not be the same number as #7 at Nocturno.',
  'A family prior win means its same reversible VT2 family was in the Top10 of an earlier turn and matched the actual head.',
  'The family can move to a different rank; never mix prior rank with prior family.',
  'Top10 family membership is reconstructed PRE before the evaluated turn.',
  'The random controls are post-hoc and do not validate gambling predictions.',
  'The 5/6-day thresholds were chosen for exploration and must not be promoted without new data.',
  'A non-matching ranked position is not necessarily a losing monetary ticket; the study has no stake model.'
 ]};
const out='auditorias/vt2-relaciones-familias';
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/resumen.json',JSON.stringify(data,null,2)+'\n');
fs.writeFileSync(out+'/ventana-seis-jornadas.json',JSON.stringify(windowDays,null,2)+'\n');
console.log('VT2_RELACIONES_RESUMEN',JSON.stringify({
 days:data.days,cuts:data.cuts,byPeriod,rolling,selectionTests,
 lastSix:windowDays.map(x=>({date:x.date,summary:x.summary}))}));
