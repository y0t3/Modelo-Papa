/**
 * Modelo Regímenes RAW V0 · sin +11, columnas ni transformaciones.
 * Propósito: distinguir cambios de distribución real de oscilaciones aleatorias,
 * y comprobar si una memoria adaptable mejora el pronóstico de dígitos RAW.
 *
 * Congelado antes de cotejar: 18 contrastes de cambio por año (global y cinco
 * jurisdicciones × unidades/decenas/centenas); puntos de corte 25%-75%;
 * 499 permutaciones conjuntas de cabezas dentro de jurisdicción+turno;
 * familia de 18 pruebas corregida por estadístico máximo.
 *
 * Pronóstico independiente: probabilidad para el siguiente dígito bruto,
 * entrenada en 2025 y evaluada online sin futuro en 2026. Comparar tasa fija
 * de 2025 con reciente local (últimos 30 resultados de mismo j+turno)
 * y reciente global (últimos 300 resultados), 20%/80% mezcla.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia} from '../src/domain';

type Obs={date:string;turn:string;jur:string;head:string};
type Label={id:string;position:number;jur:string|null};
type Scan={label:string;cutDate:string;cutIndex:number;n:number;stat:number;
 leadingDigits:{digit:number;before:number;after:number;delta:number}[]};
type Prediction={date:string;group:string;position:number;observed:number;
 base:number;local:number;pooled:number};
const JUR=JURS.filter(j=>j!=='Montevideo');
const LABELS:Label[]=[...Array.from({length:3},(_,pos)=>({id:'GLOBAL:'+pos,
 position:pos,jur:null as string|null})),
 ...JUR.flatMap(jur=>Array.from({length:3},(_,pos)=>({id:jur+':'+pos,
 position:pos,jur})))];
const valid=(x:string)=>/^\d{4}$/.test(x);
const daysBetween=(start:string,end:string)=>{
 const dates:string[]=[];for(let ms=Date.parse(start+'T12:00:00Z');ms<=Date.parse(end+'T12:00:00Z');ms+=86400000)
  dates.push(new Date(ms).toISOString().slice(0,10));return dates;};
const fnv=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const seeded=(text:string)=>{let s=fnv(text);return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;}};
function scan(series:Obs[],label:Label):Scan{
 const obs=series.filter(x=>label.jur===null||x.jur===label.jur);
 const values=obs.map(o=>Number(o.head.slice(-3)[label.position]));
 const n=values.length;
 if(n<120)throw Error('Muestra insuficiente '+label.id);
 const total=Array(10).fill(0) as number[];for(const d of values)total[d]++;
 const left=Array(10).fill(0) as number[];
 const min=Math.ceil(n*0.25),max=Math.floor(n*0.75);
 const stride=Math.max(1,Math.floor(n/75));
 let best=-Infinity,bestI=min,bestLeft=left.slice();
 for(let i=1;i<=max;i++){
  left[values[i-1]]++;
  if(i<min||((i-min)%stride!==0&&i!==max))continue;
  const f=i/n;
  const stat=total.reduce((sum,whole,d)=>{
   const expected=whole*f,den=whole*f*(1-f);
   return sum+(den>0?(left[d]-expected)**2/den:0);
  },0);
  if(stat>best){best=stat;bestI=i;bestLeft=[...left];}
 }
 const changes=bestLeft.map((x,d)=>({digit:d,before:x/bestI,
  after:(total[d]-x)/(n-bestI),delta:x/bestI-(total[d]-x)/(n-bestI)}));
 return {label:label.id,cutDate:obs[bestI]?.date||obs.at(-1)!.date,
  cutIndex:bestI,n,stat:Number(best.toFixed(3)),
  leadingDigits:changes.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta))
   .slice(0,3).map(x=>({digit:x.digit,before:Number(x.before.toFixed(4)),
    after:Number(x.after.toFixed(4)),delta:Number(x.delta.toFixed(4))}))};
}
function regime(year:string,rows:Obs[],reps=499){
 const perYear=rows.filter(x=>x.date.startsWith(year));
 const actual=LABELS.map(l=>scan(perYear,l));
 // Permutación conjunta de CABEZAS, no de dígitos por separado:
 // respeta correlaciones entre posiciones y distribuciones estáticas de
 // jurisdicción+turno, destruye únicamente el orden cronológico.
 const groups=new Map<string,number[]>();
 for(let i=0;i<perYear.length;i++){
  const group=perYear[i].jur+'|'+perYear[i].turn;
  const ls=groups.get(group)||[];ls.push(i);groups.set(group,ls);
 }
 const random=seeded('drift/'+year);
 const nullScores:Array<number[]>=Array.from({length:LABELS.length},()=>[]);
 const maxima:number[]=[];
 for(let rep=0;rep<reps;rep++){
  const shuffled=perYear.map(x=>({...x}));
  for(const ids of groups.values()){
   const heads=ids.map(i=>perYear[i].head);
   for(let i=heads.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));[heads[i],heads[j]]=[heads[j],heads[i]];
   }
   for(let k=0;k<ids.length;k++)shuffled[ids[k]].head=heads[k];
  }
  let largest=-Infinity;
  for(let i=0;i<LABELS.length;i++){
   const value=scan(shuffled,LABELS[i]).stat;
   nullScores[i].push(value);largest=Math.max(value,largest);
  }
  maxima.push(largest);
 }
 const results=actual.map((a,i)=>({
  ...a,pRaw:(1+nullScores[i].filter(x=>x>=a.stat).length)/(reps+1),
  pFamilyWise:(1+maxima.filter(x=>x>=a.stat).length)/(reps+1),
  nullMean:Number((nullScores[i].reduce((s,x)=>s+x,0)/reps).toFixed(2))
 })).sort((a,b)=>a.pFamilyWise-b.pFamilyWise||b.stat-a.stat);
 return {year,heads:perYear.length,tests:LABELS.length,
  permutations:reps,significant:results.filter(x=>x.pFamilyWise<=0.05),
  strongest:results.slice(0,8),all:results,
  null:'permutaciones de cabezas dentro de jurisdicción y turno; max test de 18 señales'};
}
const ones=()=>Array(10).fill(1) as number[];
const normalize=(count:number[],alpha=1)=>{const s=count.reduce((a,b)=>a+b,0)+10*alpha;
 return count.map(x=>(x+alpha)/s);};
function evaluation(all:Obs[],year:'2025'|'2026'){
 const histories=new Map<string,number[][]>();
 const baseCount=new Map<string,number[][]>();
 const globalPrevious:Obs[]=[];
 const scores:Prediction[]=[];
 const trainingEnd=year==='2026'?'2026-01-01':'2025-07-01';
 const start=trainingEnd,end=year==='2026'?'2026-10-21':'2026-01-01';
 const available=all.filter(x=>x.date<end);
 // Una unidad PRE es el turno completo: NO actualizar las fuentes con cabezas
 // de la misma tanda todavía no sorteada, ni siquiera de otra jurisdicción.
 const byDraw=new Map<string,Obs[]>();
 for(const e of available){
  const key=e.date+'|'+e.turn,items=byDraw.get(key)||[];
  items.push(e);byDraw.set(key,items);
 }
 for(const block of byDraw.values()){
  for(const r of block){
   const group=r.jur+'|'+r.turn;
   const history=histories.get(group)||[];
   const counts=baseCount.get(group)||Array.from({length:3},()=>Array(10).fill(0));
   if(r.date>=start){
    const localHistory=history.slice(-30);
    const poolHistory=globalPrevious.slice(-300);
    for(let p=0;p<3;p++){
     const truth=Number(r.head.slice(-3)[p]);
     const base=normalize(counts[p],1);
     const localDigits=Array(10).fill(0) as number[];
     const poolDigits=Array(10).fill(0) as number[];
     for(const prev of localHistory)localDigits[prev[p]]++;
     for(const prev of poolHistory)poolDigits[Number(prev.head.slice(-3)[p])]++;
     const l=normalize(localDigits,2),g=normalize(poolDigits,2);
     scores.push({date:r.date,group,position:p,observed:truth,
      base:-Math.log(base[truth]),
      local:-Math.log(0.8*base[truth]+0.2*l[truth]),
      pooled:-Math.log(0.8*base[truth]+0.2*g[truth])});
    }
   }
  }
  // La tanda recién pasa a ser dato histórico una vez evaluadas las cinco cabezas.
  for(const r of block){
   const group=r.jur+'|'+r.turn;
   const history=histories.get(group)||[];
   const counts=baseCount.get(group)||Array.from({length:3},()=>Array(10).fill(0));
   if(r.date<start&&r.date>='2025-01-01')
    for(let p=0;p<3;p++)counts[p][Number(r.head.slice(-3)[p])]++;
   history.push([Number(r.head[1]),Number(r.head[2]),Number(r.head[3])]);
   histories.set(group,history);
   baseCount.set(group,counts);
   globalPrevious.push(r);
  }
 }
 return scores;
}
function forecastScores(scores:Prediction[],year:string,rep=1499){
 const models=['base','local','pooled'] as const;
 const overall=Object.fromEntries(models.map(m=>[m,
  Number((scores.reduce((s,x)=>s+x[m],0)/scores.length).toFixed(5))]));
 const byPosition=[0,1,2].map(p=>{
  const part=scores.filter(x=>x.position===p);
  return {position:p,n:part.length,scores:Object.fromEntries(models.map(m=>[m,
   Number((part.reduce((s,x)=>s+x[m],0)/part.length).toFixed(5))]))};
 });
 const dates=[...new Set(scores.map(x=>x.date))];
 const delta=dates.map(d=>{
  const v=scores.filter(x=>x.date===d);
  return [v.reduce((s,x)=>s+x.base-x.local,0),
   v.reduce((s,x)=>s+x.base-x.pooled,0)] as const;
 });
 const random=seeded('bootstrap/regimes/'+year);
 const total=scores.length;
 const estimates:Array<number[]>=[];
 for(let i=0;i<rep;i++){
  const x=[0,0];
  for(let k=0;k<dates.length;k++){
   const row=delta[Math.floor(random()*dates.length)];
   x[0]+=row[0];x[1]+=row[1];
  }
  estimates.push(x.map(n=>n/total));
 }
 const intervals=[0,1].map(index=>{
  const vals=estimates.map(v=>v[index]).sort((a,b)=>a-b);
  return {model:index===0?'local':'pooled',improvement:
   delta.reduce((s,v)=>s+v[index],0)/total,
   ci95:[vals[Math.floor(rep*.025)],vals[Math.floor(rep*.975)]]};
 });
 return {year,draws:scores.length/3,headsTimesPositions:scores.length,
  days:dates.length,overall,byPosition,paired:intervals,
  reference:'ideal uniform logloss=ln(10)=2.302585; cuanto menor mejor',
  method:'PRE secuencial, baseline de 2025 congelada al principio de 2026, 20% memoria corta'};
}
async function main(){
 const calendar=daysBetween('2025-01-01','2026-10-20');
 const fetched:(CabezasDia|null)[]=Array(calendar.length).fill(null);
 const errors:{date:string;message:string}[]=[];
 let pointer=0;
 async function worker(){while(pointer<calendar.length){
  const i=pointer++,date=calendar[i];
  try{fetched[i]=await descargarCabezas(date,true);}
  catch(e){errors.push({date,message:String(e)})}
 }}
 await Promise.all(Array.from({length:9},worker()));
 const observations:Obs[]=calendar.flatMap((date,index)=>{
  const item=fetched[index];if(!item)return [];
  return TURNOS.flatMap(turn=>JUR.flatMap(jur=>{
   const head=item[turn]?.[jur]||'';
   return valid(head)?[{date,turn,jur,head}]:[];
  }));
 });
 console.log('REGIMEN_DATOS',JSON.stringify({
  calendar:calendar.length,datesWithData:new Set(observations.map(x=>x.date)).size,
  observations:observations.length,errors:errors.length,
  first:observations[0]?.date,last:observations.at(-1)?.date}));
 if(errors.length>10)throw Error('Descargas fallidas');
 const scans=['2025','2026'].map(year=>regime(year,observations));
 const tests=(['2025','2026'] as const).map(year=>forecastScores(evaluation(observations,year),year));
 for(const a of scans)console.log('REGIMEN_CAMBIOS',JSON.stringify({
  year:a.year,heads:a.heads,significant:a.significant,strongest:a.strongest}));
 for(const t of tests)console.log('REGIMEN_PRONOSTICO',JSON.stringify(t));
 const report={name:'Motor Regímenes RAW V0',runDate:'2026-10-21',
  independent:'Sin +11 ni hoja. Cambios estadísticos RAW de cifras en orden temporal.',
  decision:'Escaneo de cambio de distribución 2025/2026 y evaluación online de memoria adaptable.',
  limits:'Períodos retrospectivos ya observados previamente en el proyecto; p ajustados solo por 18 scans de cada año, no por todo el espacio de modelos históricamente investigados.',
  parameters:{labels:LABELS.map(x=>x.id),split:'25%-75%',
   null:'499 permutaciones conjuntas dentro de j+turn; máximo de 18 pruebas',
   model:'probabilidades RAW de unidades, decenas, centenas; blend 80% baseline+20% memoria',
   baseline:'2025 fijo para 2026; enero-junio 2025 para validación segundo semestre',
   localWindow:30,globalWindow:300,alphaBaseline:1,alphaRecent:2},
  scans,forecast:tests,downloadErrors:errors};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/cambios-regimen-raw-v0.json',JSON.stringify(report,null,2));
}
void main().catch(e=>{console.error('REGIMEN_ERROR',e);process.exitCode=1});
