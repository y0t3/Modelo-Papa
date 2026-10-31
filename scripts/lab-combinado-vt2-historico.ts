/**
 * LABORATORIO COMBINADO VT2 — 31/10/2026
 * No modifica la aplicación ni los parámetros del Combinado VT3.
 * Entrenamiento: junio-julio; evaluaciones: agosto, septiembre-octubre.
 * El objetivo y los turnos posteriores jamás participan del PRE.
 */
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {buildSheet} from '../src/sheet';
import type {DailySheet,SourceId} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {buildFormFirstVt2,formPositions} from '../src/motorFormasPrimero';
import {preSheetAtCut} from '../src/infoCandidatos';
import type {InfoVisualDay} from '../src/infoTurnHistory';
import assert from 'node:assert/strict';

const START='2026-04-20', END='2026-10-30';
const TRAIN_END='2026-07-31', VALID_END='2026-08-31';
const LOOKBACK=30, SHRINK=500, PRIOR_LIFT=200;
const J5=JURS.filter(j=>j!=='Montevideo');
type Features={original:string;form:string;frontier:string;paths:string};
type Candidate={family:string;members:1|2;features:Features;count:number;n:number};
type Row={date:string;turn:Turno;heads:string[];choices:Candidate[];lalo:string[]};
type Obs={expected:number;observed:number;exposures:number};
type Bins=Record<keyof Features,Record<string,Obs>>;
const valid=(x:string)=>/^[0-9]{4}$/.test(x);
const member=(f:string):1|2=>f.split('/')[0]===f.split('/')[1]?1:2;
const toFamily=(h:string)=>reversibleFamily(h.slice(-2));
const days:string[]=[];
for(let d=START;d<=END;d=shiftDay(d,1)){
 if(new Date(d+'T12:00:00Z').getUTCDay()!==0)days.push(d);
}
const sources:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const all=new Map<string,CabezasDia>();
async function read(d:string):Promise<void>{
 let last:unknown;
 for(let i=0;i<3;i++){
  try{all.set(d,await descargarCabezas(d,true));return}
  catch(e){last=e;await new Promise(r=>setTimeout(r,400*(i+1)))}
 }
 throw new Error('Descarga '+d+' falló: '+String(last));
}
async function load():Promise<void>{
 // Lotes pequeños para no saturar el proveedor de resultados.
 for(let i=0;i<days.length;i+=4){
  await Promise.all(days.slice(i,i+4).map(read));
  if(i%40===0)console.log('DATOS: '+Math.min(days.length,i+4)+'/'+days.length);
 }
}
const active=(d:string)=>all.get(d)!;
const validDay=(d:string)=>all.has(d)&&
 TURNOS.some(t=>J5.some(j=>valid(active(d)[t]?.[j]||'')))&&
 JURS.some(j=>valid(active(d).Nocturno?.[j]||''));
const seenDates=()=>days.filter(validDay);
const sheetCache=new Map<string,DailySheet>();
function sheetFor(date:string):DailySheet{
 const existing=sheetCache.get(date);if(existing)return existing;
 const before=diaVacio();
 for(const j of JURS){
  const past=days.filter(d=>d<date).reverse().find(d=>valid(active(d).Nocturno?.[j]||''));
  if(past)before.Nocturno[j]=active(past).Nocturno[j];
 }
 const sheet=buildSheet(active(date),before);
 sheetCache.set(date,sheet);
 return sheet;
}
const tiers=(rank:number|undefined,edges:number[])=>{
 if(rank===undefined)return 'OUTSIDE';
 for(let i=0;i<edges.length;i++)if(rank<=edges[i])return String(i);
 return String(edges.length);
};
const hash=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function stats(prior:string[]){
 let n=0;const counts=new Map<string,number>();
 for(const d of prior)for(const t of TURNOS)for(const j of J5){
  const h=active(d)[t]?.[j]||'';
  if(!valid(h))continue;
  const f=toFamily(h);counts.set(f,(counts.get(f)||0)+1);n++;
 }
 return {counts,n};
}
function makeRow(date:string,turn:Turno,observed:string[]):Row{
 const current=sheetFor(date);
 const pre=preSheetAtCut(current,turn,TURNOS.indexOf(turn));
 const past=observed.filter(d=>d<date).slice(-LOOKBACK);
 if(past.length<LOOKBACK)throw Error('Sin 30 jornadas anteriores para '+date);
 const pastSix=observed.filter(d=>d<date).slice(-6)
  .map(d=>({date:d,sheet:sheetFor(d)})) as InfoVisualDay[];
 const d1=observed.filter(d=>d<date).slice(-1)[0];
 const week=shiftDay(date,-7);
 const refs:LaloHistorical[]=[{date:d1,period:'D−1',sheet:sheetFor(d1)}];
 if(observed.includes(week)&&week<date)
  refs.push({date:week,period:'D−7',sheet:sheetFor(week)});
 const lalo=buildMotorLalo(pre,date,turn,refs).ranks.vt2;
 const laloRanks=new Map(lalo.map(x=>[x.family,x.rank]));
 const form=buildFormFirstVt2(pre,date,turn,pastSix,100);
 const formRanks=new Map(form.top.map(x=>[x.family,x.rank]));
 const locations=formPositions(pre,turn,'vt2');
 const grouped=new Map<string,{sites:Set<string>;src:Set<SourceId>}>();
 for(const p of locations){
  const col=pre.columns.find(c=>c.id===p.source);
  assert.ok(col);
  assert.equal(p.cells.length,2);
  assert.equal(new Set(p.cells.map(c=>c.row+':'+c.col)).size,2);
  assert.ok(Math.max(Math.abs(p.cells[0].row-p.cells[1].row),Math.abs(p.cells[0].col-p.cells[1].col))===1);
  const value=p.cells.map(c=>col!.values[c.row][c.col]).join('');
  assert.match(value,/^[0-9]{2}$/);
  const family=reversibleFamily(value);
  const info=grouped.get(family)||{sites:new Set<string>(),src:new Set<SourceId>()};
  info.sites.add(p.positionKey);info.src.add(p.source);grouped.set(family,info);
 }
 const freq=stats(past);
 const newest=sources[TURNOS.indexOf(turn)];
 const choices=[...grouped].map(([family,e])=>{
  const n=e.src.has(newest),old=[...e.src].some(x=>x!==newest);
  const features:Features={
   original:tiers(laloRanks.get(family),[10,20]),
   form:tiers(formRanks.get(family),[10,30,100]),
   frontier:TURNOS.indexOf(turn)===0?'ONE_COLUMN':n&&old?'BOTH':n?'ONLY_NEW':'ONLY_OLD',
   paths:e.sites.size===1?'ONE':'MULTI'
  };
  return {family,members:member(family),features,
   count:freq.counts.get(family)||0,n:freq.n};
 });
 assert.equal(new Set(choices.map(x=>x.family)).size,choices.length);
 assert.ok(choices.every(x=>x.n>0));
 return {date,turn,heads:J5.map(j=>active(date)[turn]?.[j]||'').filter(valid),
  choices,lalo:lalo.slice(0,10).map(x=>x.family)};
}
function train(rows:Row[]):Bins{
 const bins:Bins={original:{},form:{},frontier:{},paths:{}};
 for(const row of rows)for(const c of row.choices)
  for(const k of Object.keys(bins) as (keyof Features)[]){
   const key=c.features[k],v=bins[k][key]||{expected:0,observed:0,exposures:0};
   v.expected+=row.heads.length*c.members/100;
   v.observed+=row.heads.filter(h=>toFamily(h)===c.family).length;
   v.exposures++;bins[k][key]=v;
  }
 return bins;
}
function geometry(c:Candidate,bins:Bins){
 let s=0;
 for(const k of Object.keys(bins) as (keyof Features)[]){
  const b=bins[k][c.features[k]];
  const lift=b?(b.observed+PRIOR_LIFT)/(b.expected+PRIOR_LIFT):1;
  s+=Math.log(Math.max(0.75,Math.min(1.25,lift)));
 }
 return Math.exp(0.5*s);
}
type Variant='lalo'|'frecuencia'|'geometria'|'combinado'|'neutral';
function order(row:Row,bins:Bins,method:Variant,k=10):string[]{
 if(method==='lalo')return row.lalo.slice(0,k);
 const ranks=row.choices.map(c=>{
  const base=c.members/100;
  const posterior=(c.count+SHRINK*base)/(c.n+SHRINK);
  const geo=geometry(c,bins);
  const score=method==='frecuencia'?posterior:
   method==='geometria'?base*geo:posterior*geo;
  return {family:c.family,score,members:c.members};
 });
 ranks.sort((a,b)=>b.score-a.score||
  hash(row.date+'|'+row.turn+'|'+a.family)-hash(row.date+'|'+row.turn+'|'+b.family)||
  a.family.localeCompare(b.family));
 if(method==='neutral'){
  // Control de idéntica cantidad de orientaciones/palíndromos que Combinado.
  const reference=order(row,bins,'combinado',k);
  const wanted={1:reference.filter(f=>member(f)===1).length,2:reference.filter(f=>member(f)===2).length};
  return [1,2].flatMap(m=>ranks.filter(x=>x.members===m)
   .sort((a,b)=>hash('neutral|'+row.date+'|'+row.turn+'|'+a.family)-
    hash('neutral|'+row.date+'|'+row.turn+'|'+b.family))
   .slice(0,wanted[m as 1|2]).map(x=>x.family));
 }
 return ranks.slice(0,k).map(x=>x.family);
}
function per(row:Row,selected:string[]){
 const set=new Set(selected);
 const h=row.heads.filter(v=>set.has(toFamily(v))).length;
 const probability=selected.reduce((s,f)=>s+member(f),0)/100;
 return {hits:h,expected:probability*row.heads.length,cover:100*probability,
  any:h>0?1:0,units:selected.length};
}
function groupReport(rows:Row[],bins:Bins,k:number){
 const methods:Variant[]=['lalo','frecuencia','geometria','combinado','neutral'];
 const by=Object.fromEntries(methods.map(m=>[m,{hits:0,expected:0,any:0,cover:0,units:0}])) as
  Record<Variant,{hits:number;expected:number;any:number;cover:number;units:number}>;
 const pair={better:0,same:0,worse:0,rescues:0,lost:0,rescuedHeads:0,lostHeads:0};
 let totalHeads=0;
 for(const row of rows){
  totalHeads+=row.heads.length;
  const picks={} as Record<Variant,string[]>;
  for(const m of methods){
   const s=picks[m]=order(row,bins,m,k),p=per(row,s),b=by[m];
   b.hits+=p.hits;b.expected+=p.expected;b.any+=p.any;
   b.cover+=p.cover;b.units+=p.units;
  }
  const a=per(row,picks.lalo).hits,b=per(row,picks.combinado).hits;
  if(b>a)pair.better++;else if(b<a)pair.worse++;else pair.same++;
  const laloSet=new Set(picks.lalo),comSet=new Set(picks.combinado);
  const newHit=row.heads.filter(h=>comSet.has(toFamily(h))&&!laloSet.has(toFamily(h))).length;
  const oldHit=row.heads.filter(h=>laloSet.has(toFamily(h))&&!comSet.has(toFamily(h))).length;
  if(newHit)pair.rescues++;
  if(oldHit)pair.lost++;
  pair.rescuedHeads+=newHit;pair.lostHeads+=oldHit;
 }
 const methodsResult=Object.fromEntries(methods.map(m=>{
  const v=by[m];
  return [m,{hits:v.hits,expected:+v.expected.toFixed(1),
   pctHeads:+(totalHeads?100*v.hits/totalHeads:0).toFixed(2),
   pctTurns:+(rows.length?100*v.any/rows.length:0).toFixed(2),
   avgCoverage:+(rows.length?v.cover/rows.length:0).toFixed(2),
   avgFamilies:+(rows.length?v.units/rows.length:0).toFixed(2)}];
 }));
 return {cuts:rows.length,heads:totalHeads,top:k,models:methodsResult,paired:pair};
}
async function main(){
 await load();
 const observed=seenDates();
 if(observed.length<115)throw Error('Historial insuficiente: '+observed.length);
 console.log('JORNADAS '+observed.length+' desde '+observed[0]+' hasta '+observed.at(-1));
 const rows:Row[]=[];let skipped=0;
 for(const date of observed){
  if(date<'2026-06-01'||date>END)continue;
  const past=observed.filter(x=>x<date);
  if(past.length<LOOKBACK){skipped++;continue}
  for(const turn of TURNOS){
   const heads=J5.map(j=>active(date)[turn]?.[j]||'').filter(valid);
   if(heads.length<4)continue; // Corte comparable; no jornadas parciales como 5 cabezas.
   rows.push(makeRow(date,turn,observed));
  }
  if(rows.length%150<5)console.log('CORTES calculados '+rows.length);
 }
 const trainRows=rows.filter(r=>r.date<=TRAIN_END);
 const validRows=rows.filter(r=>r.date>TRAIN_END&&r.date<=VALID_END);
 const holdRows=rows.filter(r=>r.date>VALID_END);
 if(trainRows.length<100||validRows.length<30||holdRows.length<100)
  throw Error('Muestras insuficientes '+[trainRows.length,validRows.length,holdRows.length]);
 assert.ok(rows.every(r=>r.choices.every(c=>c.n>0)));
 const bins=train(trainRows);
 const report={
  version:'COMBINADO_VT2_LAB_V1_20261031',train:'2026-06-01..2026-07-31',
  data:{eligibleDays:observed.length,trainCuts:trainRows.length,
   augustCuts:validRows.length,sepOctCuts:holdRows.length,skipped},
  hyperparameters:{frequencyWindow:30,priorDraws:500,liftPriorExpected:200,
   liftClamp:[0.75,1.25],logGeometryWeight:0.5},
  trainedLift:Object.fromEntries((Object.keys(bins) as (keyof Features)[]).map(k=>
   [k,Object.fromEntries(Object.entries(bins[k]).map(([v,b])=>[v,{
    observed:b.observed,expected:+b.expected.toFixed(1),
    lift:+((b.observed+PRIOR_LIFT)/(b.expected+PRIOR_LIFT)).toFixed(4)}]))])),
  august:[3,5,10].map(k=>groupReport(validRows,bins,k)),
  sepOct:[3,5,10].map(k=>groupReport(holdRows,bins,k)),
  augustByTurn:TURNOS.map(t=>({turn:t,
   top10:groupReport(validRows.filter(r=>r.turn===t),bins,10)})),
  sepOctByMonth:['2026-09','2026-10'].map(month=>({month,
   top3:groupReport(holdRows.filter(r=>r.date.startsWith(month)),bins,3),
   top10:groupReport(holdRows.filter(r=>r.date.startsWith(month)),bins,10)})),
  sepOctByTurn:TURNOS.map(t=>({turn:t,
   top10:groupReport(holdRows.filter(r=>r.turn===t),bins,10)}))
 };
 console.log('VT2_LAB_RESULT_JSON_START');
 console.log(JSON.stringify(report,null,2));
 console.log('VT2_LAB_RESULT_JSON_END');
}
main().catch(e=>{console.error('VT2_LAB_FAILED',e);process.exitCode=1});
