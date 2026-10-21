/**
 * MOTOR EPISODIOS ANÁLOGOS V0 · experimental, separado de la app y de MV1.
 *
 * Hipótesis: un estado RAW de cinco cabezas ya publicadas puede identificar
 * contextos históricos similares y sus siguientes resultados. Cero +11,
 * recorridos, transformaciones o figuras de la hoja. Es predicción por analogía
 * de EPISODIOS, no frecuencia de ternas ni transiciones cabeza->cabeza.
 *
 * Parámetros congelados antes del cotejo:
 *  - 90 jornadas de entrenamiento previas, 12 vecinos por corte.
 *  - Dos distancias independientes: posición RAW y huella multiconjunto de dígitos.
 *  - Controles: doce episodios más recientes y frecuencia de 90 episodios.
 *  - 2025 Sep-Dic y 2026 Ene-19Oct comparados como tramos retrospectivos.
 *  - Permutación mensual/turno y comparación pareada para descartar azar.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';

const JUR=JURS.filter(j=>j!=='Montevideo'),K=12,LOOKBACK=90;
type Kind='vt2'|'vt3';
type Method='ANALOGIA_DIRECTA'|'ANALOGIA_HUELLA'|'RECIENTES_12'|'FRECUENCIA_90'|'ALEATORIO_FIJO';
const METHODS:Method[]=['ANALOGIA_DIRECTA','ANALOGIA_HUELLA','RECIENTES_12','FRECUENCIA_90','ALEATORIO_FIJO'];
const ANALOGS:Method[]=['ANALOGIA_DIRECTA','ANALOGIA_HUELLA'];
type Episode={date:string;turn:Turno;source:string[];heads:string[];sourceTurn:string};
type Choice={top3:string[];top5:string[];top10:string[];explain:{date:string;distance:number}[]};
type Cut={date:string;turn:Turno;phase:string;heads:string[];results:{
 vt2:Record<Method,Choice>;vt3:Record<Method,Choice>}};
const valid=(s:string)=>/^\d{4}$/.test(s);
const family=(s:string)=>[s,[...s].reverse().join('')].sort().join('/');
const forms=(f:string)=>[...new Set(f.split('/'))];
const universe=(n:number)=>[...new Set(Array.from({length:10**n},(_,i)=>family(String(i).padStart(n,'0'))))].sort();
const FAMILIES={vt2:universe(2),vt3:universe(3)};
const hash=(str:string)=>{let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const source=(data:CabezasDia,turn:Turno)=>JUR.map(j=>data[turn]?.[j]||'----');
const complete=(numbers:string[])=>numbers.length===5&&numbers.every(valid);
const dates=(start:string,end:string)=>{
 const values:string[]=[];
 for(let ms=Date.parse(start+'T12:00:00Z');ms<=Date.parse(end+'T12:00:00Z');ms+=86400000)
  values.push(new Date(ms).toISOString().slice(0,10));
 return values;
};
async function load(){
 const dateList=dates('2025-01-01','2026-10-19'),out:(CabezasDia|null)[]=Array(dateList.length).fill(null);
 const errors:{date:string;message:string}[]=[];let cursor=0;
 async function run(){while(cursor<dateList.length){const i=cursor++,date=dateList[i];
  try{out[i]=await descargarCabezas(date,true);}
  catch(e){errors.push({date,message:String(e)});}
 }}
 await Promise.all(Array.from({length:9},run));
 return {days:dateList.flatMap((date,i)=>{
  const data=out[i];return data&&TURNOS.some(t=>complete(source(data,t)))?[{date,data}]:[];
 }),errors,requested:dateList.length};
}
function buildEpisodes(days:{date:string;data:CabezasDia}[]):Episode[]{
 const episodes:Episode[]=[];
 for(let d=0;d<days.length;d++){
  const day=days[d],prev=d>0?days[d-1]:null;
  for(let t=0;t<TURNOS.length;t++){
   const turn=TURNOS[t],heads=source(day.data,turn);
   const previousTurn=t?TURNOS[t-1]:'Nocturno';
   const lead=t?source(day.data,previousTurn):prev?source(prev.data,'Nocturno'):[];
   if(!complete(heads)||!complete(lead))continue;
   episodes.push({date:day.date,turn,source:lead,heads,
    sourceTurn:t?previousTurn:'Nocturno anterior'});
  }
 }
 return episodes;
}
const suffix2=(head:string)=>head.slice(-2);
const digits=(head:string)=>head.slice(-2).split('').map(Number);
const histogram=(heads:string[])=>{
 const hist=Array(10).fill(0) as number[];
 for(const h of heads)for(const d of digits(h))hist[d]++;
 return hist;
};
const repeatPairs=(heads:string[])=>heads.reduce((sum,h,i)=>sum+
 heads.slice(i+1).filter(other=>suffix2(h)===suffix2(other)).length,0);
const hamming=(a:Episode,b:Episode)=>a.source.reduce((sum,h,i)=>{
 const a2=suffix2(h),b2=suffix2(b.source[i]);
 return sum+(a2[0]===b2[0]?0:1)+(a2[1]===b2[1]?0:1);
},0);
const fingerprint=(a:Episode,b:Episode)=>{
 const x=histogram(a.source),y=histogram(b.source);
 const l1=x.reduce((sum,n,i)=>sum+Math.abs(n-y[i]),0)/2;
 const pairDiff=Math.abs(repeatPairs(a.source)-repeatPairs(b.source));
 return l1+2*pairDiff;
};
function contextScore(query:Episode,ref:Episode,method:Method){
 return method==='ANALOGIA_DIRECTA'?hamming(query,ref):fingerprint(query,ref);
}
function select(query:Episode,training:Episode[],kind:Kind,method:Method):Choice{
 let refs:{ep:Episode;distance:number}[]=[];
 if(method==='ANALOGIA_DIRECTA'||method==='ANALOGIA_HUELLA'){
  refs=training.map(ep=>({ep,distance:contextScore(query,ep,method)}))
   .sort((a,b)=>a.distance-b.distance||b.ep.date.localeCompare(a.ep.date)).slice(0,K);
 }else if(method==='RECIENTES_12')refs=training.slice(-K).reverse()
  .map(ep=>({ep,distance:0}));
 else if(method==='FRECUENCIA_90')refs=[...training].reverse()
  .map(ep=>({ep,distance:0}));
 const weights=new Map<string,number>();
 if(method!=='ALEATORIO_FIJO')for(let n=0;n<refs.length;n++){
  const {ep,distance}=refs[n];
  // Mismo peso por episodio; en analogías se penaliza suavemente la distancia.
  const w=method.startsWith('ANALOGIA_')?1/(1+distance):1;
  for(const head of ep.heads){
   const f=family(head.slice(-Number(kind.slice(-1))));
   weights.set(f,(weights.get(f)||0)+w);
  }
 }
 const ranked=FAMILIES[kind].map(f=>({f,weight:method==='ALEATORIO_FIJO'?
  hash([query.date,query.turn,kind,f,'AZAR'].join('|'))/4294967295:
  weights.get(f)||0})).sort((a,b)=>b.weight-a.weight||
  hash([query.date,query.turn,kind,a.f].join('|'))-
  hash([query.date,query.turn,kind,b.f].join('|')));
 return {top3:ranked.slice(0,3).map(x=>x.f),
  top5:ranked.slice(0,5).map(x=>x.f),
  top10:ranked.slice(0,10).map(x=>x.f),
  explain:refs.slice(0,5).map(x=>({date:x.ep.date,distance:x.distance}))};
}
const groupPhase=(d:string)=>d<'2025-09-01'?'EXPLORACION':
 d<'2026-01-01'?'VALIDACION_2025':'CONTRASTE_2026';
function evaluate(episodes:Episode[]):Cut[]{
 const cuts:Cut[]=[];
 for(let i=0;i<episodes.length;i++){
  const query=episodes[i];
  const previous=episodes.slice(0,i).filter(ep=>ep.date<query.date&&ep.turn===query.turn)
   .slice(-LOOKBACK);
  if(previous.length<30)continue;
  const results={} as Cut['results'];
  for(const kind of ['vt2','vt3'] as Kind[]){
   results[kind]=Object.fromEntries(METHODS.map(method=>[method,
    select(query,previous,kind,method)])) as Record<Method,Choice>;
  }
  cuts.push({date:query.date,turn:query.turn,phase:groupPhase(query.date),
   heads:query.heads,results});
 }
 return cuts;
}
type Metric={method:Method;top3:number;top5:number;top10:number;expected5:number};
function hits(cut:Cut,kind:Kind,method:Method,k:3|5|10){
 const f=new Set(cut.results[kind][method][('top'+k) as 'top3'|'top5'|'top10']);
 return cut.heads.reduce((n,head)=>n+Number(f.has(family(head.slice(-Number(kind.slice(-1)))))),0);
}
function count(cuts:Cut[],kind:Kind):Metric[]{
 const size=kind==='vt2'?100:1000;
 return METHODS.map(method=>({
  method,top3:cuts.reduce((s,c)=>s+hits(c,kind,method,3),0),
  top5:cuts.reduce((s,c)=>s+hits(c,kind,method,5),0),
  top10:cuts.reduce((s,c)=>s+hits(c,kind,method,10),0),
  expected5:Number(cuts.reduce((s,c)=>s+
   5*c.results[kind][method].top5.flatMap(forms).length/size,0).toFixed(2))
 }));
}
function pairedTest(cuts:Cut[],kind:Kind,baseline:'FRECUENCIA_90'|'RECIENTES_12',reps=1999){
 // Comparación causalmente segura: todos los selectores se cotejan contra las
 // MISMAS cabezas reales, sin reordenar el pasado y los pronósticos. El
 // remuestreo preserva el bloque de jornada completa (hasta cinco turnos).
 const dates=[...new Set(cuts.map(x=>x.date))];
 const variants=ANALOGS;
 const days=dates.map(date=>{
  const group=cuts.filter(x=>x.date===date);
  return variants.map(m=>group.reduce((sum,c)=>sum+
   hits(c,kind,m,5)-hits(c,kind,baseline,5),0));
 });
 const totals=variants.map((_,i)=>days.reduce((sum,row)=>sum+row[i],0));
 let seed=hash(['paired',kind,baseline,dates.at(-1)||''].join('|'));
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 const samples:number[][]=[],nulls:number[][]=[];
 for(let rep=0;rep<reps;rep++){
  const bootstrap=Array(variants.length).fill(0),nullrow=Array(variants.length).fill(0);
  for(let i=0;i<days.length;i++){
   const sampled=days[Math.floor(random()*days.length)],sign=random()<0.5?-1:1;
   for(let j=0;j<variants.length;j++){
    bootstrap[j]+=sampled[j];nullrow[j]+=sign*days[i][j];
   }
  }
  samples.push(bootstrap);nulls.push(nullrow);
 }
 const maximum=Math.max(...totals);
 return {baseline,block:'jornada real: muestra completa de los cinco turnos',
  days:days.length,replications:reps,
  comparisons:variants.map((method,j)=>{
   const ordered=samples.map(x=>x[j]).sort((a,b)=>a-b);
   return {method,deltaTotal:totals[j],ci95:[
    ordered[Math.floor(reps*0.025)],ordered[Math.floor(reps*0.975)]],
    favorableDays:days.filter(x=>x[j]>0).length,
    unfavorableDays:days.filter(x=>x[j]<0).length};
  }),
  bestOfTwoOneSidedP:(1+nulls.filter(row=>Math.max(...row)>=maximum).length)/(reps+1),
  warning:'Remuestreo retrospectivo y prueba de cambio de signo por jornada; no sustituye una validación prospectiva'};
}
function report(cuts:Cut[],phase:string){
 const selected=cuts.filter(x=>x.phase===phase);
 return {phase,cuts:selected.length,heads:selected.length*5,
  vt2:{metrics:count(selected,'vt2'),
   pairedAgainstFrequency:pairedTest(selected,'vt2','FRECUENCIA_90'),
   pairedAgainstRecent:pairedTest(selected,'vt2','RECIENTES_12')},
  vt3:{metrics:count(selected,'vt3'),
   pairedAgainstFrequency:pairedTest(selected,'vt3','FRECUENCIA_90'),
   pairedAgainstRecent:pairedTest(selected,'vt3','RECIENTES_12')}};
}
function verifyNoLeakage(cuts:Cut[]){
 for(const c of cuts)for(const kind of ['vt2','vt3'] as Kind[]){
  const examples=c.results[kind].ANALOGIA_DIRECTA.explain;
  if(examples.some(e=>e.date>=c.date))
   throw Error('Se usó un episodio del presente/futuro en el ranking PRE '+c.date);
 }
}
async function main(){
 const dataset=await load();
 console.log('DESCARGA_ANALOGOS',JSON.stringify({requested:dataset.requested,
  days:dataset.days.length,errors:dataset.errors.length,
  first:dataset.days[0]?.date,last:dataset.days.at(-1)?.date}));
 if(dataset.errors.length>15)throw Error('Fuentes incompletas');
 const episodes=buildEpisodes(dataset.days),cuts=evaluate(episodes);
 verifyNoLeakage(cuts);
 console.log('RESUMEN_EPISODIOS',JSON.stringify({total:episodes.length,cuts:cuts.length,
  withLeadByTurn:TURNOS.map(t=>({turn:t,episodes:episodes.filter(x=>x.turn===t).length})),
  windows:{lookback:LOOKBACK,neighbors:K}}));
 const results=['VALIDACION_2025','CONTRASTE_2026'].map(phase=>report(cuts,phase));
 for(const result of results)console.log('RESULTADO_ANALOGOS',JSON.stringify(result));
 const examples=cuts.filter(c=>c.date==='2026-10-19').map(c=>({
  date:c.date,turn:c.turn,heads:c.heads,
  directNeighbors:c.results.vt3.ANALOGIA_DIRECTA.explain,
  fingerprintNeighbors:c.results.vt3.ANALOGIA_HUELLA.explain,
  vt3:Object.fromEntries(METHODS.map(m=>[m,c.results.vt3[m].top5])),
  vt2:Object.fromEntries(METHODS.map(m=>[m,c.results.vt2[m].top5]))
 }));
 console.log('EJEMPLOS_19OCT',JSON.stringify(examples));
 const full={name:'Motor Episodios Análogos V0',date:'2026-10-21',
  separacion:'No utiliza +11, hoja, rutas, raíces ni ranking del motor Lalo',
  limitation:'Retrospectivo; 2025/2026 ya consultados en el proyecto; nunca equivalen a sellados prospectivos',
  dataset:{calendarDates:dataset.requested,validDays:dataset.days.length,downloadErrors:dataset.errors,
   episodeCount:episodes.length,eligibleCuts:cuts.length},
  rules:{lookbackDays:LOOKBACK,kNearestEpisodes:K,
   nearestContext:'Cabezas RAW del turno inmediatamente anterior en cinco jurisdicciones',
   firstCut:'Previa usa Nocturna de la jornada anterior',
   directDistance:'Hamming por jurisdicción de dos cifras del contexto, 0..10',
   fingerprintDistance:'Diferencia de histogramas de diez dígitos + repetición de pares',
   outputs:'Candidatas VT2/VT3 a partir de las cabezas de los episodios históricos vecinos',
   scoring:'votos de 5 cabezas por episodio; peso 1/(1+distancia); top familia reversible',
   baseline:'12 episodios recientes y frecuencia acumulada de 90 episodios del mismo turno',
   checks:'PRE sin fugas; cotejo pareado de jornadas y bootstrap por bloque temporal'},
  results,examples,cuts:cuts.map(c=>({date:c.date,turn:c.turn,phase:c.phase,heads:c.heads,
   vt2:Object.fromEntries(METHODS.map(m=>[m,c.results.vt2[m].top10])),
   vt3:Object.fromEntries(METHODS.map(m=>[m,c.results.vt3[m].top10]))}))};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/motor-episodios-analogos-v0.json',JSON.stringify(full,null,2));
}
void main().catch(e=>{console.error('ERROR_ANALOGOS',e);process.exitCode=1});
