/**
 * COMPARATIVA HISTÓRICA EXACTA DE DOS MOTORES VT3, sin tocar app.
 * Desde junio 2026 hasta 31/10/2026; mismos PRE, mismas 5 jurisdicciones,
 * Top10 de familias reversibles, se excluye Montevideo como resultado.
 * Parámetros combinados FROZEN_GEOMETRY del runtime, sin reentrenar.
 */
import assert from 'node:assert/strict';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {buildFormFirstMotor} from '../src/motorFormasPrimero';
import {buildCombinedTop} from '../src/laloCombinedRuntime';
import type {CombinedMemory} from '../src/laloCombinedRuntime';
import {preSheetAtCut} from '../src/infoCandidatos';
import {reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';

const DATA_FROM='2026-04-20',FIRST='2026-06-01',LAST='2026-10-31';
const J5=JURS.filter(x=>x!=='Montevideo');
const dates:string[]=[];
for(let d=DATA_FROM;d<=LAST;d=shiftDay(d,1))
 if(new Date(d+'T12:00:00Z').getUTCDay()!==0)dates.push(d);
const data=new Map<string,CabezasDia>();
const sheets=new Map<string,DailySheet>();
const valid=(h:string)=>/^[0-9]{4}$/.test(h);
const fam=(h:string)=>reversibleFamily(h.slice(-3));
async function readDate(date:string):Promise<void>{
 let failure:unknown;
 for(let i=0;i<3;i++){
  try{
   data.set(date,await descargarCabezas(date,true));
   return;
  }catch(e){
   failure=e;await new Promise(resolve=>setTimeout(resolve,300*(i+1)));
  }
 }
 throw new Error('Falla descarga '+date+': '+failure);
}
async function readAll():Promise<void>{
 for(let i=0;i<dates.length;i+=6){
  await Promise.all(dates.slice(i,i+6).map(readDate));
  if(i%48===0)console.log('DATOS '+Math.min(i+6,dates.length)+'/'+dates.length);
 }
}
const validDay=(date:string)=>{
 const heads=data.get(date);
 return !!heads&&TURNOS.some(t=>JURS.some(j=>valid(heads[t]?.[j]||'')))&&
  JURS.some(j=>valid(heads.Nocturno?.[j]||''));
};
const validDates=()=>dates.filter(validDay);
function createSheet(date:string):DailySheet{
 const cached=sheets.get(date);
 if(cached)return cached;
 const heads=data.get(date);
 assert.ok(heads,'Faltan cabezas de '+date);
 const before=diaVacio();
 for(const j of JURS){
  const previous=dates.findLast(x=>x<date&&valid(data.get(x)?.Nocturno?.[j]||''));
  if(!previous)throw new Error('Falta Nocturna anterior por '+j+' en '+date);
  before.Nocturno[j]=data.get(previous)!.Nocturno[j];
 }
 const sheet=buildSheet(heads,before);
 sheets.set(date,sheet);
 return sheet;
}
type Win={jur:string;head:string;family:string};
type Row={
 date:string;turn:Turno;
 heads:Win[];
 form:string[];
 combined:string[];
 original:string[];
 formStrength:{family:string;rank:number;events:number;days:number;d1:boolean;d7:boolean;sameSource:number}[];
 available:number;
};
function inspect(date:string,turn:Turno,eligible:readonly string[]):Row{
 const before=eligible.filter(d=>d<date);
 const priorDays=before.slice(-30);
 assert.equal(priorDays.length,30,'Memoria de 30 días insuficiente');
 const prior=priorDays.map(d=>({date:d,heads:data.get(d)!}));
 const lastSix=priorDays.slice(-6).map(d=>({date:d,heads:data.get(d)!,sheet:createSheet(d)}));
 const memory:CombinedMemory={prior,lastSix};
 const previous=before.at(-1)!;
 const week=shiftDay(date,-7);
 const historic:LaloHistorical[]=[
  {date:previous,period:'D−1',sheet:createSheet(previous)}
 ];
 if(before.includes(week))
  historic.push({date:week,period:'D−7',sheet:createSheet(week)});
 const sheet=createSheet(date);
 const pre=preSheetAtCut(sheet,turn,TURNOS.indexOf(turn));
 // Los dos motores miran exactamente el mismo PRE y las mismas fuentes.
 const form=buildFormFirstMotor(pre,date,turn,lastSix,10,'vt3');
 const combo=buildCombinedTop(pre,date,turn,historic,memory);
 const formFamilies=form.top.map(x=>x.family);
 const combinedFamilies=combo.top.map(x=>x.family);
 assert.equal(new Set(formFamilies).size,formFamilies.length);
 assert.equal(new Set(combinedFamilies).size,combinedFamilies.length);
 assert.ok(formFamilies.every(f=>/^[0-9]{3}\/[0-9]{3}$/.test(f)));
 assert.ok(combinedFamilies.every(f=>/^[0-9]{3}\/[0-9]{3}$/.test(f)));
 assert.ok(prior.every(p=>p.date<date));
 assert.ok(lastSix.every(p=>p.date<date));
 const winners=J5.map(j=>({jur:j,head:data.get(date)![turn]?.[j]||''}))
  .filter(w=>valid(w.head)).map(w=>({...w,family:fam(w.head)}));
 return {date,turn,heads:winners,form:formFamilies,combined:combinedFamilies,
  formStrength:form.top.map(x=>({family:x.family,rank:x.rank,events:x.support.events,
   days:x.support.days,d1:x.support.d1,d7:x.support.d7,sameSource:x.support.sameSource})),
  original:combo.original,available:combo.available};
}
type Scores={
 cuts:number;heads:number;formHits:number;combinedHits:number;
 formAny:number;combinedAny:number;
 formOnlyHeads:number;combinedOnlyHeads:number;bothHeads:number;
 formBetter:number;combinedBetter:number;ties:number;
 formCoverage:number;combinedCoverage:number;
 formExpected:number;combinedExpected:number;
 overlap:number;formEmpty:number;combinedEmpty:number;
};
function measure(rows:Row[],top=10):Scores{
 const r:Scores={
  cuts:0,heads:0,formHits:0,combinedHits:0,formAny:0,combinedAny:0,
  formOnlyHeads:0,combinedOnlyHeads:0,bothHeads:0,
  formBetter:0,combinedBetter:0,ties:0,
  formCoverage:0,combinedCoverage:0,formExpected:0,combinedExpected:0,
  overlap:0,formEmpty:0,combinedEmpty:0
 };
 const orientations=(xs:string[])=>xs.reduce((n,s)=>{
  const [a,b]=s.split('/');return n+(a===b?1:2);
 },0);
 for(const row of rows){
  const f=row.form.slice(0,top),c=row.combined.slice(0,top);
  const fSet=new Set(f),cSet=new Set(c);
  const hitsF=row.heads.filter(h=>fSet.has(h.family)).length;
  const hitsC=row.heads.filter(h=>cSet.has(h.family)).length;
  const onlyF=row.heads.filter(h=>fSet.has(h.family)&&!cSet.has(h.family)).length;
  const onlyC=row.heads.filter(h=>cSet.has(h.family)&&!fSet.has(h.family)).length;
  r.cuts++;r.heads+=row.heads.length;
  r.formHits+=hitsF;r.combinedHits+=hitsC;
  r.formAny+=Number(hitsF>0);r.combinedAny+=Number(hitsC>0);
  r.formOnlyHeads+=onlyF;r.combinedOnlyHeads+=onlyC;
  r.bothHeads+=row.heads.filter(h=>fSet.has(h.family)&&cSet.has(h.family)).length;
  r.formBetter+=Number(hitsF>hitsC);
  r.combinedBetter+=Number(hitsC>hitsF);
  r.ties+=Number(hitsF===hitsC);
  r.formCoverage+=orientations(f)/1000;
  r.combinedCoverage+=orientations(c)/1000;
  r.formExpected+=orientations(f)*row.heads.length/1000;
  r.combinedExpected+=orientations(c)*row.heads.length/1000;
  r.overlap+=f.filter(x=>cSet.has(x)).length;
  r.formEmpty+=Number(!f.length);
  r.combinedEmpty+=Number(!c.length);
 }
 for(const k of ['formCoverage','combinedCoverage'] as const)
  r[k]=Math.round(r[k]*10000/r.cuts)/100;
 for(const k of ['formExpected','combinedExpected','overlap'] as const)
  r[k]=Math.round(r[k]*100)/100;
 return r;
}
function summary(rows:Row[]){
 const same=rows.filter(r=>r.form.length===10&&r.combined.length===10);
 const different=rows.filter(r=>r.form.length!==10||r.combined.length!==10);
 if(different.length)console.log('ATENCION top inferior a 10 en '+different.length+' cortes; solo se comparan completos');
 return {
  validCuts:same.length,excludedIncompleteTop:different.length,
  top3:measure(same,3),top5:measure(same,5),top10:measure(same,10)
 };
}
function intervals(rows:Row[],reps=2500){
 // Desvío mensual/diario correlacionado: bootstrap por JORNADA, no por cabeza.
 const byDay=new Map<string,Row[]>();
 for(const r of rows){let xs=byDay.get(r.date)||[];xs.push(r);byDay.set(r.date,xs)}
 const days=[...byDay.keys()].sort(),diffs:number[]=[];
 if(!days.length)return null;
 let state=19874231;
 const rng=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 const gains=days.map(d=>{
  let delta=0;
  for(const row of byDay.get(d)!){
   const f=new Set(row.form.slice(0,10)),c=new Set(row.combined.slice(0,10));
   for(const h of row.heads)delta+=Number(f.has(h.family))-Number(c.has(h.family));
  }return delta;
 });
 for(let i=0;i<reps;i++){
  let s=0;
  for(let j=0;j<gains.length;j++)s+=gains[Math.floor(rng()*gains.length)];
  diffs.push(s);
 }
 diffs.sort((a,b)=>a-b);
 return {nDays:days.length,observedGain:gains.reduce((a,b)=>a+b,0),
  bootstrap95:[diffs[Math.floor(0.025*reps)],diffs[Math.floor(0.975*reps)]]};
}

// POLÍTICAS PREFIJADAS EN PRE (sin acceso a las cabezas objetivo).
// Todas preservan un máximo de 10 familias; una sustitución puede rescatar
// un acierto, pero no puede garantizar conservar los aciertos reemplazados.
type Strategy='COMBINADO10'|'FORMAS10'|'C9_F1'|'C8_F2'|'C7_F3'|
 'C9_F1_FUERTE'|'C8_F2_FUERTE'|'C9_F1_TOP3';
const STRATEGIES:Strategy[]=['COMBINADO10','FORMAS10','C9_F1','C8_F2','C7_F3',
 'C9_F1_FUERTE','C8_F2_FUERTE','C9_F1_TOP3'];
const intendedSlots=(s:Strategy)=>s==='C7_F3'?3:
 s==='C8_F2'||s==='C8_F2_FUERTE'?2:1;
function choices(row:Row,s:Strategy):string[]{
 if(s==='COMBINADO10')return row.combined.slice(0,10);
 if(s==='FORMAS10')return row.form.slice(0,10);
 const strict=s.includes('FUERTE'),top3=s==='C9_F1_TOP3';
 const best=row.formStrength.filter(f=>!row.combined.includes(f.family)&&
  (!strict||(f.rank<=6&&f.days>=2&&f.events>=2))&&
  (!top3||f.rank<=3))
 .slice(0,intendedSlots(s)).map(f=>f.family);
 const combined=row.combined.slice(0,10-best.length);
 const result=[...combined,...best];
 assert.equal(result.length,10,'Top10 debe ocupar exactamente diez familias');
 assert.equal(new Set(result).size,10,'Fuga de cupos familiares repetidos');
 return result;
}
function orientation(f:string):number{
 const [a,b]=f.split('/');return a===b?1:2;
}
type HybridScore={
 cuts:number;heads:number;hits:number;expected:number;coveragePct:number;
 turnsWithHit:number;uniqueHeadsRescued:number;headsLost:number;
 deltaVsCombined:number;betterCuts:number;worseCuts:number;equalCuts:number;
 changedCuts:number;replacements:number;
};
function hybridScore(rows:Row[],strategy:Strategy):HybridScore{
 const out:HybridScore={cuts:rows.length,heads:0,hits:0,expected:0,
  coveragePct:0,turnsWithHit:0,uniqueHeadsRescued:0,headsLost:0,
  deltaVsCombined:0,betterCuts:0,worseCuts:0,equalCuts:0,changedCuts:0,replacements:0};
 for(const row of rows){
  const base=new Set(row.combined.slice(0,10));
  const picks=choices(row,strategy),picked=new Set(picks);
  const hit=row.heads.filter(h=>picked.has(h.family)).length;
  const old=row.heads.filter(h=>base.has(h.family)).length;
  const unique=row.heads.filter(h=>picked.has(h.family)&&!base.has(h.family)).length;
  const lost=row.heads.filter(h=>base.has(h.family)&&!picked.has(h.family)).length;
  const swaps=picks.filter(f=>!base.has(f)).length;
  out.heads+=row.heads.length;out.hits+=hit;out.turnsWithHit+=Number(hit>0);
  out.expected+=row.heads.length*picks.reduce((n,f)=>n+orientation(f),0)/1000;
  out.coveragePct+=100*picks.reduce((n,f)=>n+orientation(f),0)/1000;
  out.uniqueHeadsRescued+=unique;out.headsLost+=lost;
  out.deltaVsCombined+=hit-old;
  out.betterCuts+=Number(hit>old);out.worseCuts+=Number(hit<old);
  out.equalCuts+=Number(hit===old);out.changedCuts+=Number(swaps>0);
  out.replacements+=swaps;
 }
 out.expected=+out.expected.toFixed(2);
 out.coveragePct=+(out.coveragePct/Math.max(1,rows.length)).toFixed(3);
 return out;
}
function policyScores(rows:Row[]):Record<Strategy,HybridScore>{
 return Object.fromEntries(STRATEGIES.map(s=>[s,hybridScore(rows,s)])) as Record<Strategy,HybridScore>;
}
function bootstrapGain(rows:Row[],strategy:Strategy,reps=2500){
 const groups=new Map<string,Row[]>();
 for(const row of rows){
  const group=groups.get(row.date)||[];
  group.push(row);groups.set(row.date,group);
 }
 const days=[...groups.keys()].sort();
 const deltas=days.map(date=>groups.get(date)!.reduce((n,row)=>{
  const f=new Set(choices(row,strategy)),c=new Set(row.combined.slice(0,10));
  return n+row.heads.reduce((m,h)=>m+Number(f.has(h.family))-Number(c.has(h.family)),0);
 },0));
 let seed=30610457;
 for(const k of strategy)seed=(Math.imul(seed,31)+k.charCodeAt(0))>>>0;
 const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const vals:number[]=[];
 for(let i=0;i<reps;i++){
  let gain=0;
  for(let j=0;j<deltas.length;j++)gain+=deltas[Math.floor(next()*deltas.length)];
  vals.push(gain);
 }
 vals.sort((a,b)=>a-b);
 return {nDays:days.length,
  observed:deltas.reduce((a,b)=>a+b,0),
  bootstrap95:[vals[Math.floor(reps*.025)],vals[Math.floor(reps*.975)]]};
}

async function main(){
 await readAll();
 const eligible=validDates();
 console.log('ELEGIBLES '+eligible.length+' de '+dates.length+' fechas, desde '+eligible[0]+' hasta '+eligible.at(-1));
 const rows:Row[]=[];
 const reasons:{date:string;turn?:string;why:string}[]=[];
 for(const date of eligible){
  if(date<FIRST||date>LAST)continue;
  if(eligible.filter(d=>d<date).length<30){reasons.push({date,why:'menos de 30 jornadas anteriores'});continue}
  for(const turn of TURNOS){
   const n=J5.filter(j=>valid(data.get(date)![turn]?.[j]||'')).length;
   if(n<4){reasons.push({date,turn,why:'menos de cuatro cabezas: '+n});continue}
   try{rows.push(inspect(date,turn,eligible))}
   catch(e){reasons.push({date,turn,why:String(e)})}
  }
  if(rows.length%150<5)console.log('CORTES '+rows.length);
 }
 const oct31=rows.filter(r=>r.date==='2026-10-31'&&['Previa','Matutino'].includes(r.turn));
 if(oct31.length!==2)console.log('AVISO: el proveedor no suministró ambos cortes del 31/10 en esta ejecución; no atribuir resultados faltantes.');
 for(const row of oct31){
  const target=row.turn==='Previa'?'379/973':'345/543';
  assert.ok(row.heads.some(x=>x.family===target),'No coincide la cabeza histórica de '+row.turn);
  assert.equal(row.form.indexOf(target)+1,row.turn==='Previa'?6:7,'Ranking Formas Primero cambió');
  assert.equal(row.combined.indexOf(target)+1,row.turn==='Previa'?6:0,'Ranking Combinado cambió');
 }
 const completed=rows.filter(r=>r.form.length===10&&r.combined.length===10);
 const months=['2026-06','2026-07','2026-08','2026-09','2026-10'];
 const unavailableDates=dates.filter(d=>d>=FIRST&&!validDay(d));
 const result={
  unavailableDates,
  methodology:{target:'VT3',families:'VT3 reversible; each family counted once per head',
   historical:'2026-06-01..2026-10-31',priorDays:30,formDays:6,
   originalWeights:'FROZEN_GEOMETRY',excludeJurisdiction:'Montevideo',
   noDrawOrPartial:'at least four real heads per turn',
   fairness:'same 10 family slots, identical date/turn/results',
   caution:'June-July can overlap frozen VT3 training; August-October held out'},
  totals:{...summary(rows),bootstrap:intervals(completed)},
  month:months.map(month=>({month,...summary(rows.filter(r=>r.date.startsWith(month)))})),
  validatedAugOct:{
   ...summary(rows.filter(r=>r.date>='2026-08-01')),
   bootstrap:intervals(completed.filter(r=>r.date>='2026-08-01'))
  },
  byTurn:TURNOS.map(turn=>({turn,
   ...summary(rows.filter(r=>r.date>='2026-08-01'&&r.turn===turn))})),
  oct31:oct31.map(row=>({
   turn:row.turn,winners:row.heads,
   forms:row.form,combined:row.combined,
   formWins:row.heads.filter(h=>row.form.includes(h.family)),
   combinedWins:row.heads.filter(h=>row.combined.includes(h.family))
  })),
  hybrids:{
   policy:'Fijo: C9/F1, C8/F2, C7/F3 y condiciones fuertes previas, sin tocar el motor actual',
   periods:{
    august:policyScores(completed.filter(r=>r.date>='2026-08-01'&&r.date<'2026-09-01')),
    septOct:policyScores(completed.filter(r=>r.date>='2026-09-01')),
    augOct:policyScores(completed.filter(r=>r.date>='2026-08-01'))
   },
   months:['2026-06','2026-07','2026-08','2026-09','2026-10'].map(month=>({
    month,models:policyScores(completed.filter(r=>r.date.startsWith(month)))
   })),
   sepOctByTurn:TURNOS.map(turn=>({turn,
    models:policyScores(completed.filter(r=>r.date>='2026-09-01'&&r.turn===turn))
   })),
   sepOctUncertainty:Object.fromEntries(STRATEGIES.filter(s=>s!=='COMBINADO10').map(strategy=>[
    strategy,bootstrapGain(completed.filter(r=>r.date>='2026-09-01'),strategy)
   ]))
  },
  skippedCount:reasons.length,skippedReasons:reasons.slice(0,25)
 };
 console.log('COMPARATIVA_VT3_JSON_START');
 console.log(JSON.stringify(result,null,2));
 console.log('COMPARATIVA_VT3_JSON_END');
}
main().catch(err=>{console.error('COMPARATIVA_VT3_ERROR',err);process.exitCode=1});
