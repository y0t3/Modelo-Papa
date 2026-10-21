/**
 * MODELO DE ESTADOS COLECTIVOS V0 — laboratorio independiente.
 * No +11, hoja, celdas, raíces, familias candidatas, ni recorridos.
 *
 * Pronostica PROPIEDADES de un grupo futuro de cinco cabezas, no números:
 * P: mayoría de terminaciones impares (>=3/5)
 * A: mayoría de terminaciones altas (dígito final >=5, >=3/5)
 * S: suma de los cinco sufijos de 2 cifras >=250
 * R: alguna unidad repetida entre cinco (secundario)
 *
 * PRE: estado formado por cinco cabezas del turno INMEDIATO anterior;
 * en Previa, cinco cabezas de la Nocturna anterior disponible.
 * Entrenamiento: a lo sumo 120 episodios de fechas anteriores del mismo
 * turno; en 2026 se congela entrenamiento en 2025-12-31.
 *
 * Modelo principal: 25 episodios anteriores con huella colectiva más cercana,
 * sin exactitudes de números. Control: tasa por turno del mismo training;
 * modelo secundario: grupo de estados parecidos según tres banderas;
 * control adicional: copiar tendencia del último turno.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';

type Characteristic='PARES'|'ALTAS'|'SUMA250'|'REPITE_UNIDAD';
type Model='TASA_HISTORICA'|'VECINOS_25'|'ESTADOS_8'|'PERSISTENCIA';
const CHARACTERISTICS:Characteristic[]=['PARES','ALTAS','SUMA250','REPITE_UNIDAD'];
const MODELS:Model[]=['TASA_HISTORICA','VECINOS_25','ESTADOS_8','PERSISTENCIA'];
const MAIN:Characteristic[]=['PARES','ALTAS','SUMA250'];
const JUR=JURS.filter(j=>j!=='Montevideo');
type Episode={date:string;turn:Turno;source:string[];future:string[];feature:number[];
 sourceState:Record<Characteristic,0|1>;
 outcome:Record<Characteristic,0|1>;signature:number;};
type Cut={date:string;turn:Turno;
 outcome:Record<Characteristic,0|1>;
 forecasts:Record<Model,Record<Characteristic,number>>;
 neighborExamples:{date:string;distance:number}[];
 trainingSize:number;};
const isHead=(s:string)=>/^\d{4}$/.test(s);
const getHeads=(d:CabezasDia,t:Turno)=>JUR.map(j=>d[t]?.[j]||'----');
const full=(a:string[])=>a.length===5&&a.every(isHead);
const range=(start:string,end:string)=>{const dates:string[]=[];
 for(let ms=Date.parse(start+'T12:00:00Z');ms<=Date.parse(end+'T12:00:00Z');ms+=86400000)
  dates.push(new Date(ms).toISOString().slice(0,10));
 return dates;
};
function state(heads:string[]):Record<Characteristic,0|1>{
 const d=heads.map(h=>Number(h.slice(-1)));
 return {PARES:Number(d.filter(x=>x%2===0).length>=3) as 0|1,
  ALTAS:Number(d.filter(x=>x>=5).length>=3) as 0|1,
  SUMA250:Number(heads.reduce((n,h)=>n+Number(h.slice(-2)),0)>=250) as 0|1,
  REPITE_UNIDAD:Number(new Set(d).size<5) as 0|1};
}
function fingerprint(heads:string[]):number[]{
 const units=Array(10).fill(0) as number[],tens=Array(10).fill(0) as number[];
 const last2=heads.map(h=>Number(h.slice(-2)));
 for(const n of last2){units[n%10]++;tens[Math.floor(n/10)]++;}
 const even=last2.filter(n=>n%2===0).length/5;
 const high=last2.filter(n=>n%10>=5).length/5;
 const sum=last2.reduce((a,b)=>a+b,0)/500;
 const spread=(Math.max(...last2)-Math.min(...last2))/100;
 const repeat=(5-new Set(last2.map(n=>n%10)).size)/4;
 // Posición de la jurisdicción NO tiene lugar en esta huella;
 // describe únicamente el colectivo de las cinco cabezas.
 return [...units.map(x=>x/10),...tens.map(x=>x/10),
  even*0.2,high*0.2,sum*0.75,spread*0.35,repeat*0.35];
}
function dist(a:number[],b:number[]){
 if(a.length!==b.length)throw Error('Features incompatibles');
 return a.reduce((n,x,i)=>n+Math.abs(x-b[i]),0);
}
function signature(state:Record<Characteristic,0|1>){
 return state.PARES*4+state.ALTAS*2+state.REPITE_UNIDAD;
}
function makeEpisodes(days:{date:string;data:CabezasDia}[]):Episode[]{
 const episodes:Episode[]=[];
 for(let d=0;d<days.length;d++){
  const day=days[d],prior=days[d-1];
  for(let t=0;t<TURNOS.length;t++){
   const turn=TURNOS[t],future=getHeads(day.data,turn);
   const source=t?getHeads(day.data,TURNOS[t-1]):prior?getHeads(prior.data,'Nocturno'):[];
   if(!full(source)||!full(future))continue;
   const sourceState=state(source);
   episodes.push({date:day.date,turn,source,future,sourceState,feature:fingerprint(source),
    outcome:state(future),signature:signature(sourceState)});
  }
 }
 return episodes;
}
const bounded=(p:number)=>Math.min(0.99,Math.max(0.01,p));
function forecasts(query:Episode,train:Episode[]):{
 probabilities:Record<Model,Record<Characteristic,number>>;
 neighbors:{date:string;distance:number}[]}{
 const prior=Object.fromEntries(CHARACTERISTICS.map(k=>[k,
  (train.reduce((s,r)=>s+r.outcome[k],0)+2)/(train.length+4)
 ])) as Record<Characteristic,number>;
 const ordered=train.map(e=>({ep:e,distance:dist(query.feature,e.feature)}))
  .sort((a,b)=>a.distance-b.distance||b.ep.date.localeCompare(a.ep.date)).slice(0,25);
 const matching=train.filter(e=>e.signature===query.signature);
 const freqRate=(records:Episode[],key:Characteristic,base:number,pseudo:number,weight?:(e:Episode)=>number)=>{
  const entries=records.map(r=>({val:r.outcome[key],w:weight?weight(r):1}));
  const pos=entries.reduce((s,r)=>s+r.val*r.w,0);
  const total=entries.reduce((s,r)=>s+r.w,0);
  return bounded((pos+pseudo*base)/(total+pseudo));
 };
 const probs=Object.fromEntries(MODELS.map(model=>[model,
  Object.fromEntries(CHARACTERISTICS.map(key=>{
   const base=prior[key];
   let value=base;
   if(model==='VECINOS_25'){
    const weights=new Map(ordered.map(({ep,distance})=>[ep,1/(1+3*distance)]));
    value=freqRate(ordered.map(x=>x.ep),key,base,8,ep=>weights.get(ep)||1);
   }else if(model==='ESTADOS_8')
    value=freqRate(matching,key,base,20);
   else if(model==='PERSISTENCIA')
    value=query.sourceState[key]?0.65:0.35;
   return [key,value];
  }))
 ])) as Record<Model,Record<Characteristic,number>>;
 return {probabilities:probs,neighbors:ordered.slice(0,5).map(({ep,distance})=>({
  date:ep.date,distance:Number(distance.toFixed(3))}))};
}
function makeCuts(episodes:Episode[]){
 const cuts:Cut[]=[];
 for(const query of episodes){
  const maxDate=query.date<'2026-01-01'?query.date:'2026-01-01';
  const train=episodes.filter(ep=>ep.turn===query.turn&&ep.date<maxDate).slice(-120);
  if(train.length<50)continue;
  const prediction=forecasts(query,train);
  if(prediction.neighbors.some(n=>n.date>=maxDate))throw Error('Fuga de datos al PRE');
  cuts.push({date:query.date,turn:query.turn,outcome:query.outcome,
   forecasts:prediction.probabilities,neighborExamples:prediction.neighbors,
   trainingSize:train.length});
 }
 return cuts;
}
function stats(cuts:Cut[],subset:Characteristic[]){
 const output=Object.fromEntries(MODELS.map(method=>[method,
  {brier:0,logloss:0,correct:0,observations:0}
 ])) as Record<Model,{brier:number;logloss:number;correct:number;observations:number}>;
 for(const c of cuts)for(const k of subset)for(const method of MODELS){
  const y=c.outcome[k],p=c.forecasts[method][k],target=output[method];
  target.brier+=(p-y)**2;
  target.logloss+=-(y*Math.log(p)+(1-y)*Math.log(1-p));
  target.correct+=Number(Number(p>=0.5)===y);
  target.observations++;
 }
 return Object.fromEntries(MODELS.map(m=>[m,{
  n:output[m].observations,
  brier:Number((output[m].brier/output[m].observations).toFixed(5)),
  logloss:Number((output[m].logloss/output[m].observations).toFixed(5)),
  accuracy:Number((output[m].correct/output[m].observations).toFixed(5)),
 }]));
}
function paired(cuts:Cut[],subset:Characteristic[],candidate:Model,reps=1999){
 const dates=[...new Set(cuts.map(c=>c.date))];
 const days=dates.map(date=>cuts.filter(c=>c.date===date).reduce((sum,c)=>
  sum+subset.reduce((s,k)=>
   s+(c.forecasts.TASA_HISTORICA[k]-c.outcome[k])**2-
     (c.forecasts[candidate][k]-c.outcome[k])**2,0),0));
 const total=days.reduce((a,b)=>a+b,0),units=cuts.length*subset.length;
 let seed=0x31415926+(candidate==='VECINOS_25'?1:candidate==='ESTADOS_8'?2:3);
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 const boots:number[]=[],signed:number[]=[];
 for(let r=0;r<reps;r++){
  let boot=0,alt=0;
  for(let i=0;i<days.length;i++){
   boot+=days[Math.floor(random()*days.length)];
   alt+=days[i]*(random()<0.5?-1:1);
  }
  boots.push(boot/units);signed.push(alt/units);
 }
 boots.sort((a,b)=>a-b);
 return {candidate,baseline:'TASA_HISTORICA',
  improvementPositive:total/units,
  bootstrap95:[boots[Math.floor(reps*0.025)],boots[Math.floor(reps*0.975)]],
  pOneSidedExploratory:(1+signed.filter(x=>x>=total/units).length)/(reps+1),
  days:dates.length,unit:'variación de pérdida Brier por jornada, bloques de cinco turnos',
  note:'No corregido por múltiples resultados explorados. No es una validación prospectiva.'};
}
function summarize(cuts:Cut[],name:string){
 const dataset=cuts.filter(c=>name==='VALIDACION_2025'?
  c.date>='2025-07-01'&&c.date<'2026-01-01':
  c.date>='2026-01-01'&&c.date<='2026-10-20');
 return {name,cuts:dataset.length,days:new Set(dataset.map(c=>c.date)).size,
  all:stats(dataset,CHARACTERISTICS),main:stats(dataset,MAIN),
  byCharacteristic:Object.fromEntries(CHARACTERISTICS.map(k=>[k,{
   actualPrevalence:Number((dataset.reduce((s,c)=>s+c.outcome[k],0)/dataset.length).toFixed(4)),
   scores:stats(dataset,[k])
  }])),
  comparisons:MODELS.filter(m=>m!=='TASA_HISTORICA').map(m=>
   paired(dataset,MAIN,m)),
  byMonth:[...new Set(dataset.map(x=>x.date.slice(0,7)))].map(month=>{
   const rows=dataset.filter(x=>x.date.startsWith(month));
   const st=stats(rows,MAIN);
   return {month,n:rows.length,
    brier:Object.fromEntries(MODELS.map(m=>[m,st[m].brier]))};
  })};
}
async function main(){
 const dt=range('2025-01-01','2026-10-20');
 const responses:(CabezasDia|null)[]=Array(dt.length).fill(null);
 const errors:{date:string;reason:string}[]=[];let cursor=0;
 async function worker(){while(cursor<dt.length){
  const i=cursor++,date=dt[i];
  try{responses[i]=await descargarCabezas(date,true);}
  catch(e){errors.push({date,reason:String(e)})}
 }}
 await Promise.all(Array.from({length:9},()=>worker()));
 const days=dt.flatMap((date,i)=>{
  const data=responses[i];
  return data&&TURNOS.some(t=>full(getHeads(data,t)))?[{date,data}]:[];
 });
 const episodes=makeEpisodes(days),cuts=makeCuts(episodes);
 const results=['VALIDACION_2025','CONTRASTE_2026'].map(name=>summarize(cuts,name));
 const current=cuts.filter(c=>c.date==='2026-10-20').map(c=>({
  date:c.date,turn:c.turn,truth:c.outcome,nearest:c.neighborExamples,
  predicted:c.forecasts}));
 const report={name:'Estados Colectivos V0',date:'2026-10-21',definition:{
  independent:'sin +11, hoja, recorridos, familias ni rankings Lalo',
  target:'propiedades del conjunto de cinco resultados, no números ni familias exactas',
  kNearest:25,train:'2025 móvil para validación 2025; únicamente 2025 congelado para todos los cortes 2026',
  horizon:'PRE del turno a partir de cinco cabezas del turno anterior',
  significance:'Brier como criterio principal; remuestreo de jornadas, control contra tasa histórica',
  freeze:'Los pesos, características y horizontes se definieron antes de mirar resultados de este laboratorio',
  limitation:'Años ya observados en otros proyectos; cortes retrospectivos no sellados'},
  downloaded:{calendar:dt.length,validDays:days.length,first:days[0]?.date,last:days.at(-1)?.date,
   errors:errors.slice(0,25)},episodes:episodes.length,cuts:cuts.length,results,current};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/estados-colectivos-v0.json',JSON.stringify(report,null,2));
 console.log('COLECTIVOS_DATOS',JSON.stringify({
  calendar:dt.length,validDays:days.length,episodes:episodes.length,cuts:cuts.length,
  errors:errors.length,last:days.at(-1)?.date}));
 for(const result of results)console.log('COLECTIVOS_RESULTADO',JSON.stringify(result));
 console.log('COLECTIVOS_ULTIMO',JSON.stringify(current));
}
void main().catch(e=>{console.error('COLECTIVOS_ERROR',e);process.exitCode=1});
