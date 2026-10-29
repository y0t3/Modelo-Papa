/**
 * LAB VT2 — POSICIONES DEL TOP, ANTES DEL SORTEO.
 * Dos hipótesis independientes:
 * 1) ¿La posición 7/9 o cualquier otra es favorable para algún turno?
 * 2) ¿La Nocturna acierta desproporcionadamente en posiciones no usadas antes?
 * Mantiene la lógica oficial de Lalo: Montevideo SÍ en hojas y resultados;
 * NO como raíz histórica. NUNCA lee un futuro al formar el PRE.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
const getCache=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{
 if(!getCache.has(d))getCache.set(d,descargarCabezas(d,true));
 return getCache.get(d)!;
};
const completedCache=new Map<string,Promise<{date:string,heads:CabezasDia,sheet:ReturnType<typeof buildSheet>}>>();
const complete=async(date:string)=>{
 if(!completedCache.has(date))completedCache.set(date,(async()=>{
  const [heads,base]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(base.missing.length)throw Error('Falta Nocturna previa '+date);
  return {date,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return completedCache.get(date)!;
};
const valid=(v:string)=>/^\d{4}$/.test(v);
const countHeads=(data:CabezasDia)=>TURNOS.reduce((acc,t)=>acc+
 JURS.filter(j=>valid(data[t]?.[j]||'')).length,0);
type Row={date:string;turn:string;turnIndex:number;rankedFamilies:string[];
 usedBefore:number[];availablePositions:number[];freePositions:number[];
 heads:{jur:string;head:string;family:string;position:number|null}[];
 numPreviousHits:number;sourceDates:Record<string,string>};
const rows:Row[]=[];
function period(date:string){
 if(date<='2026-07-31')return 'JUN_JUL';
 if(date<='2026-09-30')return 'AGO_SEP';
 if(date<='2026-10-24')return 'OCT_1_24';
 return 'OCT_26_28';
}
async function main(){
let days=0;
for(let date='2026-06-01';date<='2026-10-28';date=shiftDay(date,1)){
 if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
 const [actual,previous,base]=await Promise.all([
  get(date),loadPreviousDraws(date,6,get),nocturnaAnteriorPorJur(date,get,20)]);
 if(countHeads(actual)<20)continue;
 if(base.missing.length)throw Error('Base compuesta incompleta '+date);
 const recent=previous[5],week=shiftDay(date,-7);
 const [old,wk,weekBase]=await Promise.all([
  complete(recent.date),get(week),nocturnaAnteriorPorJur(week,get,20)]);
 if(weekBase.missing.length)throw Error('D-7 incompleto '+week);
 const historical:LaloHistorical[]=[
  {date:recent.date,period:'D−1',sheet:old.sheet},
  ...(hasDrawResults(wk)&&week<date?[{
   date:week,period:'D−7' as const,sheet:buildSheet(wk,weekBase.heads)}]:[])
 ];
 const positionsSeen=new Set<number>();
 let previousHitHeads=0;
 for(const [index,turn] of TURNOS.entries()){
  const before=diaVacio();
  for(const t of TURNOS.slice(0,index))before[t]={...actual[t]};
  const safe=preSheetAtCut(buildSheet(before,base.heads),turn,index);
  if(safe.heads[turn].length||safe.matches[turn].length||
   TURNOS.slice(index).some(t=>safe.heads[t].length||safe.matches[t].length))
   throw Error('Fuga temporal en '+date+' '+turn);
  const top=buildMotorLalo(safe,date,turn,historical).ranks.vt2
   .slice(0,10).map(f=>f.family);
  const available=top.map((_,i)=>i+1);
  const usedBefore=[...positionsSeen].sort((a,b)=>a-b);
  const free=available.filter(p=>!positionsSeen.has(p));
  const heads=JURS.map(jur=>({jur,head:actual[turn]?.[jur]||''}))
   .filter(x=>valid(x.head))
   // No considerar confirmada Santa Fe Nocturno del 28/10; sin alterar PRE.
   .filter(x=>!(date==='2026-10-28'&&turn==='Nocturno'&&x.jur==='Santa Fé'))
   .map(x=>({...x,family:reversibleFamily(x.head.slice(-2)),
    position:(()=>{const p=top.indexOf(reversibleFamily(x.head.slice(-2)));
     return p<0?null:p+1;})()}));
  rows.push({date,turn,turnIndex:index,rankedFamilies:top,usedBefore,
   availablePositions:available,freePositions:free,heads,
   numPreviousHits:previousHitHeads,sourceDates:base.dates as Record<string,string>});
  for(const h of heads)if(h.position!==null){
   positionsSeen.add(h.position);previousHitHeads++;
  }
 }
 days++;
 console.log('VT2_SLOTS_DAY',date);
}
if(days!==127||rows.length!==635)throw Error('No reproduce 127 dias/635 cortes: '+days+'/'+rows.length);
const heads=rows.reduce((n,r)=>n+r.heads.length,0);
if(heads!==3401)throw Error('Cabezas distintas de la auditoría emparejada: '+heads);
const top10=rows.reduce((n,r)=>n+r.heads.filter(h=>h.position!==null).length,0);
if(top10!==674)throw Error('Lalo VT2 original Top10 no se reproduce: '+top10);
const top3=rows.reduce((n,r)=>n+r.heads.filter(h=>h.position!==null&&h.position<=3).length,0);
const top5=rows.reduce((n,r)=>n+r.heads.filter(h=>h.position!==null&&h.position<=5).length,0);
if(top3!==220||top5!==351)throw Error('Lalo VT2 original Top3/5 '+top3+'/'+top5);

const periods=['JUN_JUL','AGO_SEP','OCT_1_24','OCT_26_28','TOTAL'];
const byPosition=[] as any[];
for(const per of periods)for(const turn of TURNOS){
 const sub=rows.filter(r=>r.turn===turn&&(per==='TOTAL'||period(r.date)===per));
 const eligible=sub.reduce((n,r)=>n+r.heads.length,0);
 const totalHits=sub.reduce((n,r)=>n+r.heads.filter(h=>h.position!==null).length,0);
 const slotCounts=Array.from({length:10},(_,i)=>{
  const rank=i+1;
  return {rank,cutsWithRank:sub.filter(r=>r.rankedFamilies.length>=rank).length,
   hitHeads:sub.reduce((n,r)=>n+r.heads.filter(h=>h.position===rank).length,0),
   hitDays:sub.filter(r=>r.heads.some(h=>h.position===rank)).length};
 });
 byPosition.push({period:per,turn,cuts:sub.length,eligibleHeads:eligible,
  top10HitHeads:totalHits,slotCounts,
  rank7and9:slotCounts[6].hitHeads+slotCounts[8].hitHeads});
}
const noct=rows.filter(r=>r.turn==='Nocturno');
const night=periods.map(per=>{
 const sub=noct.filter(r=>per==='TOTAL'||period(r.date)===per);
 const evaluated=sub.filter(r=>r.availablePositions.length>0);
 let hitAll=0,hitFree=0,hitUsed=0,nightWithHit=0;
 let freeSlots=0,usedSlots=0,exposure=0,cutWithPriorSuccess=0,cutsWithAnyPrior=0;
 let conditionalTargetDays=0;
 for(const r of evaluated){
  const a=r.heads.filter(h=>h.position!==null);
  const free=new Set(r.freePositions),used=new Set(r.usedBefore);
  hitAll+=a.length;
  hitFree+=a.filter(h=>free.has(h.position!)).length;
  hitUsed+=a.filter(h=>used.has(h.position!)).length;
  nightWithHit+=Number(a.length>0);
  freeSlots+=r.freePositions.length;
  usedSlots+=r.availablePositions.filter(p=>used.has(p)).length;
  exposure+=r.availablePositions.length;
  cutWithPriorSuccess+=Number(r.numPreviousHits>0);
  cutsWithAnyPrior+=Number(r.usedBefore.length>0);
  conditionalTargetDays+=Number(a.length>0&&r.usedBefore.length>0);
 }
 return {period:per,drawDays:sub.length,evaluated:evaluated.length,
  nocturnalTop10HeadHits:hitAll,nocturnalHitsFree:hitFree,nocturnalHitsUsed:hitUsed,
  nightsWithTop10Hits:nightWithHit,conditionalTargetDays,
  availableFreeSlots:freeSlots,availableUsedSlots:usedSlots,totalSlots:exposure,
  freeSlotShare:exposure?freeSlots/exposure:0,
  freeHitShare:hitAll?hitFree/hitAll:0,
  nightsWithPriorHit:cutWithPriorSuccess,nightsWithEarlierUsedPosition:cutsWithAnyPrior};
});
// Permutar MÁSCARAS de posiciones ya ganadoras dentro del mismo MES y mismo
// DIA DE LA SEMANA. Se conserva fijo el orden de los rankings, posiciones
// nocturnas reales, número de coincidencias y distribución de rangos.
// Rompe ÚNICAMENTE la asociación "estos puestos antes / esta Nocturna".
// Deja filas con domingos fuera y evita intercambio con feriados dispares.
let seed=20261029;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
function testUnused(sub:Row[],reps=12000){
 const groups=new Map<string,Row[]>();
 for(const row of sub){
  const dow=new Date(row.date+'T12:00:00Z').getUTCDay();
  const key=row.date.slice(0,7)+'_'+dow;
  const g=groups.get(key)||[];g.push(row);groups.set(key,g);
 }
 const actual=sub.reduce((n,r)=>n+r.heads.filter(h=>h.position!==null&&!r.usedBefore.includes(h.position)).length,0);
 const draws:number[]=[];
 for(let z=0;z<reps;z++){
  let score=0;
  for(const group of groups.values()){
   const mask=group.map(r=>new Set(r.usedBefore));
   for(let i=mask.length-1;i>0;i--){
    const j=Math.floor(rnd()*(i+1));[mask[i],mask[j]]=[mask[j],mask[i]];
   }
   for(let i=0;i<group.length;i++){
    const row=group[i];
    for(const head of row.heads)if(head.position!==null&&!mask[i].has(head.position))score++;
   }
  }
  draws.push(score);
 }
 draws.sort((a,b)=>a-b);
 const expected=draws.reduce((n,x)=>n+x,0)/reps;
 const high=draws.filter(x=>x>=actual).length;
 const low=draws.filter(x=>x<=actual).length;
 return {n:sub.length,actual,meanRandomized:expected,
  medianRandomized:draws[Math.floor(reps/2)],
  null95:[draws[Math.floor(.025*reps)],draws[Math.floor(.975*reps)]],
  oneSidedMoreFreeP:(high+1)/(reps+1),
  twoSidedDeviationP:Math.min(1,2*Math.min((high+1)/(reps+1),(low+1)/(reps+1))),
  repetitions:reps,groups:groups.size,
  singletonStrata:[...groups.values()].filter(x=>x.length===1).length};
}
const permutation=Object.fromEntries(periods.map(p=>[p,testUnused(noct.filter(r=>p==='TOTAL'||period(r.date)===p),p==='TOTAL'?20000:6000)]));
const targets=byPosition.filter(r=>r.period==='TOTAL');
const result={type:'RETROSPECTIVE_REPLAY_NOT_SEALED',source:'LALO_MV1',
 method:'rank positions exact at each PRE; prior positions from actual earlier heads; chronology no leakage',
 start:'2026-06-01',end:'2026-10-28',days,cuts:rows.length,heads,baselineTop:{top3,top5,top10},
 byPosition,night,permutation,rows,
 caveats:[
  'Rank slots are not constant numeric families across turns; rank 7 can be different numbers each turn.',
  'Positions free = no head had hit that rank in a previous turn of the same day, not no family has appeared.',
  'Randomization conditions on actual night hits and preserves their rank histogram; cannot prove lottery predictability.',
  'Counts are individual head matches, so 2 jurisdictions can win same rank in one turn.',
  'Many positions/hypotheses investigated. Descriptive peaks need preregistration and true PRE validation.'
 ]};
const out='auditorias/vt2-posiciones-libres';
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/resultados.json',JSON.stringify(result,null,2)+'\n');
const brief={days,cuts:rows.length,heads,baselineTop:result.baselineTop,byPosition,night,permutation};
fs.writeFileSync(out+'/resumen.json',JSON.stringify(brief,null,2)+'\n');
console.log('VT2_SLOTS_SUMMARY',JSON.stringify(brief));

}
main().catch(error=>{console.error('VT2_POSICIONES_ERROR',error);process.exitCode=1});
