// Modelo Temporal Puro · laboratorio aislado. SOLO cabezas / fechas / turnos / jurisdicciones.
// Ni hoja, ni +11, ni recorridos ni motor Lalo. Hipótesis y cortes fijados antes de medir.
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';

type RecordHead={date:string;turn:Turno;jur:string;head:string;raw3:string;family:string;last2:string};
type Day={date:string;data:CabezasDia;events:RecordHead[]};
type Method='ALEATORIO_FIJO'|'FRECUENCIA'|'ECO_TEMPORAL'|'RED_TRANSICIONES'|'RECOMBINACION';
type Choice={method:Method;top3:string[];top5:string[];top10:string[];scores:{family:string;score:number}[]};
type Cut={date:string;turn:Turno;phase:string;heads:string[];families:string[];choices:Choice[]};
const METHODS:Method[]=['ALEATORIO_FIJO','FRECUENCIA','ECO_TEMPORAL','RED_TRANSICIONES','RECOMBINACION'];
const JUR=JURS.filter(x=>x!=='Montevideo');
const family=(x:string)=>[x,[...x].reverse().join('')].sort().join('/');
const candidateFamilies=[...new Set(Array.from({length:1000},(_,n)=>family(String(n).padStart(3,'0'))))].sort();
const candidatePairs=[...new Set(Array.from({length:100},(_,n)=>family(String(n).padStart(2,'0'))))].sort();
const forms=(f:string)=>[...new Set(f.split('/'))];
const valid=(h:string)=>/^\d{4}$/.test(h);
const scoreMap=()=>new Map<string,number>();
const add=(m:Map<string,number>,s:string,v:number)=>m.set(s,(m.get(s)||0)+v);
const hash=(str:string)=>{let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const noise=(date:string,turn:Turno,name:Method,f:string)=>hash([date,turn,name,f].join('|'))/4294967295;
const phase=(date:string)=>date<'2026-07-01'?'EXPLORACION':date<'2026-09-01'?'VALIDACION':'RESERVA';
const range=(start:string,end:string)=>{
 const dates:string[]=[];
 for(let t=Date.parse(start+'T12:00:00Z');t<=Date.parse(end+'T12:00:00Z');t+=86400000)
  dates.push(new Date(t).toISOString().slice(0,10));
 return dates;
};
const makeDay=(date:string,data:CabezasDia):Day=>({
 date,data,events:TURNOS.flatMap(turn=>JUR.flatMap(jur=>{
  const head=data[turn]?.[jur];if(!valid(head))return [];
  const raw3=head.slice(-3);
  return [{date,turn,jur,head,raw3,family:family(raw3),last2:head.slice(-2)}];
 }))
});
const lookback=(days:Day[],n:number)=>days.slice(-n);
const condScore=(historical:Day[],prevContext:RecordHead[],prevNight:RecordHead[],turn:Turno)=>{
 // Aprendizaje de transiciones DIRECTAS: dos cifras del turno anterior
 // -> última terna / pareja / dígito inicial del resultado siguiente.
 // Solo jornadas ANTERIORES; el corte objetivo no está presente.
 const prior=lookback(historical,90);
 const coF=scoreMap(),coP=scoreMap(),coD=scoreMap(),totals=scoreMap();
 // La primera jornada de entrenamiento no puede ver la Nocturna del futuro.
 let beforeNight:RecordHead[]=[];
 for(let i=0;i<prior.length;i++){
  const day=prior[i],prev=prior[i-1];
  const w=Math.exp(-(prior.length-1-i)/30);
  for(let t=0;t<TURNOS.length;t++){
   const here=day.events.filter(x=>x.turn===TURNOS[t]);
   if(!here.length)continue;
   const lead=t===0?(prev?prev.events.filter(x=>x.turn==='Nocturno'):beforeNight):
    day.events.filter(x=>x.turn===TURNOS[t-1]);
   if(!lead.length)continue;
   for(const ctx of lead){
    const ww=w/lead.length;
    for(const head of here){
     const key=ctx.last2+'|';
     add(totals,ctx.last2,ww);
     add(coF,key+head.family,ww);
     add(coP,key+head.raw3.slice(-2),ww);
     add(coD,key+head.raw3[0],ww);
    }
   }
  }
  beforeNight=day.events.filter(x=>x.turn==='Nocturno');
 }
 const ctx=prevContext.length?prevContext:prevNight;
 return (f:string)=>{
  if(!ctx.length)return 0;
  let score=0;
  for(const predecessor of ctx){
   const den=totals.get(predecessor.last2)||0;
   if(!den)continue;
   const key=predecessor.last2+'|';
   let best=0;
   for(const raw3 of forms(f)){
    const s=(coF.get(key+f)||0)*1.0+
     (coP.get(key+raw3.slice(-2))||0)*0.45+
     (coD.get(key+raw3[0])||0)*0.15;
    best=Math.max(best,s);
   }
   score+=best/den;
  }
  return score/ctx.length;
 };
};
function rankCandidates(date:string,turn:Turno,historical:Day[],todayBefore:RecordHead[]):Choice[]{
 const prior6=lookback(historical,6),prior60=lookback(historical,60);
 const allRecent=[...prior6.flatMap(x=>x.events),...todayBefore];
 const observed=scoreMap(),recency=scoreMap(),pairs=scoreMap(),digits=scoreMap();
 const recentWeights=new Map(prior6.map((d,i)=>[d.date,1/(1+prior6.length-i)]));
 for(const e of allRecent){
  const w=e.date===date?1.3:(recentWeights.get(e.date)||0);
  add(recency,e.family,w*(e.turn===turn?1.25:1));
  add(pairs,e.last2,w);
  for(const digit of new Set(e.raw3))add(digits,digit,w);
 }
 for(const [i,day] of prior60.entries()){
  const weight=Math.exp(-(prior60.length-i-1)/20);
  for(const e of day.events)add(observed,e.family,weight);
 }
 for(const e of todayBefore)add(observed,e.family,1.2);
 const prevTurnIndex=TURNOS.indexOf(turn)-1;
 const lastContext=prevTurnIndex>=0?todayBefore.filter(e=>e.turn===TURNOS[prevTurnIndex]):[];
 const nightContext=historical.at(-1)?.events.filter(e=>e.turn==='Nocturno')||[];
 const conditional=condScore(historical,lastContext,nightContext,turn);
 const ranks:Choice[]=[];
 for(const method of METHODS){
  const scores=candidateFamilies.map(f=>{
   const base=observed.get(f)||0,recent=recency.get(f)||0;
   const combined=Math.max(...forms(f).flatMap(raw=>[
    (pairs.get(raw.slice(0,2))||0)*(digits.get(raw[2])||0),
    (pairs.get(raw.slice(1,3))||0)*(digits.get(raw[0])||0)
   ]));
   const score=method==='ALEATORIO_FIJO'?noise(date,turn,method,f):
    method==='FRECUENCIA'?base:
    method==='ECO_TEMPORAL'?recent+base*0.01:
    method==='RECOMBINACION'?combined+base*0.001:
    conditional(f)+base*0.0001;
   return {family:f,score};
  }).sort((a,b)=>b.score-a.score||noise(date,turn,method,b.family)-noise(date,turn,method,a.family));
  ranks.push({method,top3:scores.slice(0,3).map(x=>x.family),
   top5:scores.slice(0,5).map(x=>x.family),top10:scores.slice(0,10).map(x=>x.family),
   scores:scores.slice(0,10)});
 }
 return ranks;
}
// Segundo contraste independiente: parejas VT2, suficiente frecuencia para observar
// desviaciones que quedarían ocultas con unas pocas cabezas VT3.
function rankPairs(date:string,turn:Turno,historical:Day[],todayBefore:RecordHead[]):Choice[]{
 const prior6=lookback(historical,6),prior60=lookback(historical,60);
 const seen=[...prior6.flatMap(x=>x.events),...todayBefore];
 const counts=scoreMap(),recent=scoreMap(),digit=scoreMap();
 const weights=new Map(prior6.map((d,i)=>[d.date,1/(1+prior6.length-i)]));
 for(const e of seen){
  const w=e.date===date?1.3:weights.get(e.date)||0;
  add(recent,family(e.last2),w*(e.turn===turn?1.25:1));
  for(const d of e.last2)add(digit,d,w);
 }
 for(const [i,d] of prior60.entries()){
  const w=Math.exp(-(prior60.length-i-1)/20);
  for(const e of d.events)add(counts,family(e.last2),w);
 }
 for(const e of todayBefore)add(counts,family(e.last2),1.2);
 const hist=lookback(historical,90),pairs=scoreMap(),total=scoreMap();
 for(let i=0;i<hist.length;i++){
  const day=hist[i],weight=Math.exp(-(hist.length-1-i)/30);
  for(let t=0;t<TURNOS.length;t++){
   const current=day.events.filter(x=>x.turn===TURNOS[t]);
   const context=t===0?i>0?hist[i-1].events.filter(x=>x.turn==='Nocturno'):[]:
    day.events.filter(x=>x.turn===TURNOS[t-1]);
   if(!context.length||!current.length)continue;
   for(const a of context)for(const b of current){
    const w=weight/context.length;
    add(pairs,a.last2+'|'+family(b.last2),w);
    add(total,a.last2,w);
   }
  }
 }
 const t=TURNOS.indexOf(turn);
 const priorContext=t===0?(historical.at(-1)?.events.filter(x=>x.turn==='Nocturno')||[]):
   todayBefore.filter(x=>x.turn===TURNOS[t-1]);
 const ranked:Choice[]=[];
 for(const method of METHODS){
  const scores=candidatePairs.map(f=>{
   const base=counts.get(f)||0,echo=recent.get(f)||0;
   const conditional=priorContext.length?priorContext.reduce((s,e)=>
    s+(pairs.get(e.last2+'|'+f)||0)/(total.get(e.last2)||1),0)/priorContext.length:0;
   const recombination=Math.max(...forms(f).map(v=>(digit.get(v[0])||0)*(digit.get(v[1])||0)));
   const score=method==='ALEATORIO_FIJO'?noise(date,turn,method,f):
    method==='FRECUENCIA'?base:
    method==='ECO_TEMPORAL'?echo+base*0.01:
    method==='RED_TRANSICIONES'?conditional+base*0.0001:
    recombination+base*0.001;
   return {family:f,score};
  }).sort((a,b)=>b.score-a.score||noise(date,turn,method,b.family)-noise(date,turn,method,a.family));
  ranked.push({method,top3:scores.slice(0,3).map(x=>x.family),
   top5:scores.slice(0,5).map(x=>x.family),top10:scores.slice(0,10).map(x=>x.family),
   scores:scores.slice(0,10)});
 }
 return ranked;
}
function evaluatePairs(days:Day[]){
 const cuts:Cut[]=[],historical:Day[]=[];
 for(const day of days){
  const before:RecordHead[]=[];
  for(const turn of TURNOS){
   const heads=day.events.filter(e=>e.turn===turn);
   if(historical.length>=30&&heads.length>=4)
    cuts.push({date:day.date,turn,phase:phase(day.date),
     heads:heads.map(e=>e.head),families:heads.map(e=>family(e.last2)),
     choices:rankPairs(day.date,turn,historical,before)});
   before.push(...heads);
  }
  historical.push(day);
 }
 const stages=['EXPLORACION','VALIDACION','RESERVA'].map(stage=>aggregate(cuts,stage,100));
 const test=shuffledCheck(cuts);
 const testMonth=shuffledCheck(cuts,800,true);
 return {stages,test,testMonth,definition:'55 familias reversibles VT2, mismo calendario, objetivos y resguardo temporal que VT3',
  latest:cuts.filter(c=>c.date==='2026-10-19').map(c=>({turn:c.turn,
   top5:Object.fromEntries(c.choices.map(p=>[p.method,p.top5]))}))};
}

async function download(){
 const dates=range('2026-01-01','2026-10-19');
 const outputs:(Day|null)[]=Array(dates.length).fill(null);
 const errors:{date:string;error:string}[]=[];
 let cursor=0;
 async function worker(){
  while(cursor<dates.length){
   const i=cursor++,date=dates[i];
   try{
    const data=await descargarCabezas(date,true);
    outputs[i]=makeDay(date,data);
   }catch(e){errors.push({date,error:String(e)});}
  }
 }
 await Promise.all(Array.from({length:8},()=>worker()));
 return {days:outputs.filter((x):x is Day=>!!x&&x.events.length>0),errors,totalDates:dates.length};
}
function aggregate(cuts:Cut[],stage:string,space=1000){
 const x=cuts.filter(x=>x.phase===stage),heads=x.reduce((s,c)=>s+c.heads.length,0);
 const results=METHODS.map(method=>{
  const out:any={method,cuts:x.length,heads};
  for(const k of [3,5,10] as const){
   let matchedHeads=0,matchedCuts=0,expectedHeads=0;
   for(const cut of x){
    const picked=cut.choices.find(z=>z.method===method)!;
    const chosen=picked[('top'+k) as 'top3'|'top5'|'top10'];
    const set=new Set(chosen);
    const n=cut.families.filter(f=>set.has(f)).length;
    matchedHeads+=n;if(n)matchedCuts++;
    const values=new Set(chosen.flatMap(forms));
    expectedHeads+=cut.heads.length*values.size/space;
   }
   out['top'+k]={matchedHeads,matchedCuts,expectedHeads:Number(expectedHeads.toFixed(2))};
  }
  return out;
 });
 return {phase:stage,cuts:x.length,heads,results};
}
function shuffledCheck(cuts:Cut[],reps=800,monthly=false){
 const x=cuts.filter(c=>c.phase==='RESERVA');
 const groups=new Map<string,Cut[]>();
 for(const c of x){
  const key=c.turn+(monthly?'|'+c.date.slice(0,7):'');
  const arr=groups.get(key)||[];arr.push(c);groups.set(key,arr);
 }
 const alternative=METHODS.filter(m=>m!=='ALEATORIO_FIJO');
 const observed=Object.fromEntries(METHODS.map(m=>[m,x.reduce((n,c)=>n+c.families.filter(f=>
  c.choices.find(z=>z.method===m)!.top5.includes(f)).length,0)])) as Record<Method,number>;
 const nullScores=Object.fromEntries(METHODS.map(m=>[m,[] as number[]])) as Record<Method,number[]>;
 let seed=monthly?0x13579bdf:0x1550c0de;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 for(let r=0;r<reps;r++){
  const perm=new Map<Cut,Cut>();
  for(const items of groups.values()){
   const shuffled=[...items];
   for(let i=shuffled.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
   }
   for(let i=0;i<items.length;i++)perm.set(items[i],shuffled[i]);
  }
  const score=Object.fromEntries(METHODS.map(m=>[m,0])) as Record<Method,number>;
  for(const c of x){
   const outcomes=perm.get(c)!.families;
   for(const selection of c.choices)
    score[selection.method]+=outcomes.filter(f=>selection.top5.includes(f)).length;
  }
  for(const m of METHODS)nullScores[m].push(score[m]);
 }
 const mean=Object.fromEntries(METHODS.map(m=>[m,
  nullScores[m].reduce((a,b)=>a+b,0)/reps])) as Record<Method,number>;
 const sd=Object.fromEntries(METHODS.map(m=>{
  const variance=nullScores[m].reduce((a,b)=>a+(b-mean[m])**2,0)/reps;
  return [m,Math.sqrt(variance)||1];
 })) as Record<Method,number>;
 const obsZ=Object.fromEntries(METHODS.map(m=>[m,(observed[m]-mean[m])/sd[m]])) as Record<Method,number>;
 const maxObserved=Math.max(...alternative.map(m=>obsZ[m]));
 let adjustedCount=0;
 for(let i=0;i<reps;i++){
  const maxPerm=Math.max(...alternative.map(m=>(nullScores[m][i]-mean[m])/sd[m]));
  if(maxPerm>=maxObserved)adjustedCount++;
 }
 return {replications:reps,withinMonth:monthly,observed,
  permutationMean:mean,observedStandardizedExcess:obsZ,
  permutationUpperTail:Object.fromEntries(METHODS.map(m=>[m,
   (1+nullScores[m].filter(n=>n>=observed[m]).length)/(reps+1)])),
  bestOfFour:{standardizedExcess:maxObserved,
   familyWisePermutationP:(1+adjustedCount)/(reps+1)},
  note:'Permuta las cabezas dentro del mismo turno'+
   (monthly?' y mismo mes':' durante toda la reserva')+
   '; corrección de búsqueda entre cuatro selectores vía máximo exceso normalizado.'};
}
async function main(){
 const dataset=await download();
 console.log('DESCARGA_TEMPORAL',JSON.stringify({dates:dataset.totalDates,actualDays:dataset.days.length,
  errors:dataset.errors.length,first:dataset.days[0]?.date,last:dataset.days.at(-1)?.date}));
 const days=dataset.days,history:Day[]=[],cuts:Cut[]=[];
 for(const day of days){
  const earlier:RecordHead[]=[];
  for(const turn of TURNOS){
   const heads=day.events.filter(e=>e.turn===turn);
   if(history.length>=30&&heads.length>=4){
    const choices=rankCandidates(day.date,turn,history,earlier);
    cuts.push({date:day.date,turn,phase:phase(day.date),
     heads:heads.map(e=>e.head),families:heads.map(e=>e.family),choices});
   }
   // Las cabezas de turnos incompletos también forman parte del PRE siguiente.
   earlier.push(...heads);
  }
  history.push(day);
 }
 const stages=['EXPLORACION','VALIDACION','RESERVA'].map(stage=>aggregate(cuts,stage));
 const test=shuffledCheck(cuts);
 const testMonth=shuffledCheck(cuts,800,true);
 const byMonth=[...new Set(cuts.map(x=>x.date.slice(0,7)))].map(month=>{
  const x=cuts.filter(c=>c.date.startsWith(month));
  return {month,cuts:x.length,
   hits:Object.fromEntries(METHODS.map(method=>[method,x.reduce((n,c)=>n+c.families.filter(f=>
    c.choices.find(z=>z.method===method)!.top5.includes(f)).length,0)]))};
 });
 const vt2=evaluatePairs(days);
 const report={definition:{dataset:'Cabezas RAW de Viví tu Suerte; sin +11 ni hoja',
   endDate:'2026-10-19',headJurisdictions:JUR,models:METHODS,
   experiment:'enero-junio',validation:'julio-agosto',holdout:'septiembre-19 octubre',
   family:'reversa de tres cifras, sin rotaciones adicionales',
   filters:'al menos 4 cabezas argentinas disponibles; 30 jornadas previas mínimo',
   windows:'frecuencia 60 jornadas; eco/recombinación 6; condicional 90',
   metric:'aciertos de cabeza en Top3/5/10, no ganancia monetaria',
   methodology:'hipótesis fijadas antes de ejecutar; reserva retrospectiva, NO sellada prospectiva'},
  vt2,
  download:{totalDates:dataset.totalDates,actualDays:days.length,errors:dataset.errors,
   validDays:days.map(x=>x.date)},stages,byMonth,test,testMonth,
  latest:cuts.filter(x=>x.date==='2026-10-19').map(x=>({
   turn:x.turn,heads:x.heads,top5:Object.fromEntries(x.choices.map(c=>[c.method,c.top5]))})),
  cuts:cuts.map(x=>({date:x.date,turn:x.turn,phase:x.phase,
   heads:x.heads,families:x.families,
   choices:Object.fromEntries(x.choices.map(c=>[c.method,{top3:c.top3,top5:c.top5,top10:c.top10}]))}))};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/temporal-puro-2026.json',JSON.stringify(report,null,2));
 console.log('RESULTADO_VT2',JSON.stringify(vt2));
 console.log('RESULTADO_TEMPORAL',JSON.stringify({stages,byMonth,test,testMonth,latest:report.latest,
  downloads:{calendarDays:dataset.totalDates,drawDays:days.length,errors:dataset.errors.length}}));
}
void main().catch(e=>{console.error('LAB_TEMPORAL_ERROR',e);process.exitCode=1});
