// Laboratorio aislado: datos RAW, sin +11, rutas ni MV1.
// Hipótesis predefinidas: heterogeneidad marginal, sincronías entre jurisdicciones
// y ventaja de modelos separados por jurisdicción sobre el modelo conjunto.
// 2025=exploración; 2026=contraste retrospectivo no utilizado para elegir reglas.
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';

type J=typeof JURS[number];
type Observation={date:string;turn:Turno;jur:J;head:string;vt2:string;vt3:string};
type Draw={date:string;turn:Turno;heads:Observation[];month:string};
type Daily={date:string;draws:Draw[];events:Observation[]};
type Mode='AZAR_FIJO'|'GLOBAL'|'JURISDICCION'|'JUR_TURNO'|'MIXTO';
type Kind='vt2'|'vt3';
type Trial={date:string;turn:Turno;jur:J;kind:Kind;truth:string;
 ranks:Record<Mode,string[]>;hits:Record<Mode,{top5:number;top10:number;exp5:number}>};
const JUR=JURS.filter(x=>x!=='Montevideo'),MODES:Mode[]=[
 'AZAR_FIJO','GLOBAL','JURISDICCION','JUR_TURNO','MIXTO'
];
const seedHash=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);
 h=Math.imul(h,16777619);}return h>>>0;};
const rng=(init:number)=>{let s=init>>>0;return ()=>{s^=s<<13;s^=s>>>17;
 s^=s<<5;return (s>>>0)/4294967296;}};
const family=(v:string)=>[v,[...v].reverse().join('')].sort().join('/');
const variants=(f:string)=>[...new Set(f.split('/'))];
const valid=(s:string)=>/^\d{4}$/.test(s);
const universe=(n:number)=>[...new Set(Array.from({length:10**n},(_,i)=>
 family(String(i).padStart(n,'0'))))].sort();
const universes={vt2:universe(2),vt3:universe(3)};
const span=(a:string,b:string)=>{const res:string[]=[];
 for(let ms=Date.parse(a+'T12:00:00Z');ms<=Date.parse(b+'T12:00:00Z');ms+=86400000)
  res.push(new Date(ms).toISOString().slice(0,10));return res;};
const byDate=(a:Draw,b:Draw)=>a.date.localeCompare(b.date)||
 TURNOS.indexOf(a.turn)-TURNOS.indexOf(b.turn);
function makeDay(date:string,data:CabezasDia):Daily{
 const draws:Draw[]=TURNOS.map(turn=>{
  const heads=JUR.flatMap(jur=>{const head=data[turn]?.[jur]||'';
   return valid(head)?[{date,turn,jur,head,vt2:family(head.slice(-2)),
    vt3:family(head.slice(-3))}]:[];});
  return {date,turn,heads,month:date.slice(0,7)};
 });
 return {date,draws,events:draws.flatMap(x=>x.heads)};
}
async function download():Promise<{days:Daily[];errors:{date:string;error:string}[]}>{
 const dates=span('2025-01-01','2026-10-19'),out:(Daily|null)[]=Array(dates.length).fill(null);
 const errors:{date:string;error:string}[]=[];let next=0;
 async function worker(){while(next<dates.length){const i=next++,date=dates[i];
  try{out[i]=makeDay(date,await descargarCabezas(date,true));}
  catch(e){errors.push({date,error:String(e)});}
 }}
 await Promise.all(Array.from({length:10},worker));
 return {days:out.filter((d):d is Daily=>!!d&&d.events.length>0),errors};
}
const percentile=(nums:number[],p:number)=>[...nums].sort((a,b)=>a-b)[
 Math.min(nums.length-1,Math.max(0,Math.floor(p*(nums.length-1))))];
const oneStd=(xs:number[])=>{const mean=xs.reduce((s,n)=>s+n,0)/xs.length;
 const sd=Math.sqrt(xs.reduce((s,x)=>s+(x-mean)**2,0)/xs.length);
 return {mean,sd};};
function distribution(draws:Draw[],year:string,reps=999){
 // Todos los cinco resultados del mismo turno deben existir.
 const complete=draws.filter(d=>d.heads.length===JUR.length);
 const rows=complete.map(d=>JUR.map(j=>d.heads.find(x=>x.jur===j)!.head.slice(-3)));
 const digits=[0,1,2];
 const calc=(samples:string[][])=>{
  const details=digits.map(pos=>{
   const counts=Array.from({length:5},()=>Array(10).fill(0));
   for(const row of samples)for(let j=0;j<5;j++)counts[j][Number(row[j][pos])]++;
   const totals=Array.from({length:10},(_,d)=>counts.reduce((a,b)=>a+b[d],0));
   const chi=counts.reduce((sum,x)=>sum+x.reduce((s,o,d)=>{
    const expect=totals[d]/5;return s+(expect>0?(o-expect)**2/expect:0);},0),0);
   const highest=counts.flatMap((items,j)=>items.map((obs,d)=>({jur:JUR[j],digit:d,
    observed:obs,expected:totals[d]/5,
    excess:obs-(totals[d]/5)}))).sort((a,b)=>Math.abs(b.excess)-Math.abs(a.excess));
   return {pos,chi,highest:highest.slice(0,5)};
  });
  return details;
 };
 const observed=calc(rows),samples:number[][]=[];
 const rand=rng(0x19381122+Number(year));
 for(let r=0;r<reps;r++){
  const perm=rows.map(raw=>{
   const x=[...raw];for(let j=4;j>0;j--){const k=Math.floor(rand()*(j+1));
    [x[j],x[k]]=[x[k],x[j]];}return x;
  });
  samples.push(calc(perm).map(x=>x.chi));
 }
 const raw=observed.map((o,k)=>({
  ...o,nullMean:oneStd(samples.map(x=>x[k])).mean,
  p:(1+samples.filter(x=>x[k]>=o.chi).length)/(reps+1),
  maxAdjustedP:(1+samples.filter(x=>Math.max(...x)>=o.chi).length)/(reps+1)
 }));
 return {year,cuts:complete.length,heads:complete.length*5,
  null:'permuta jurisdicciones dentro del mismo día y turno; conserva el conjunto de resultados',
  positions:['centenas','decenas','unidades'],results:raw};
}
function crossSync(draws:Draw[],year:string,reps=999){
 const complete=draws.filter(d=>d.heads.length===JUR.length).sort(byDate);
 const pairs:{a:number;b:number}[]=[];for(let a=0;a<5;a++)for(let b=a+1;b<5;b++)pairs.push({a,b});
 // Rehacer resultados con emparejamiento exacto date+turn y orden fijo.
 const heads=complete.map(d=>JUR.map(j=>d.heads.find(x=>x.jur===j)!.head));
 const counts=(rows:string[][])=>pairs.map(({a,b})=>rows.reduce((n,x)=>
  n+Number(x[a].slice(-2)===x[b].slice(-2)),0));
 const obs=counts(heads),series:number[][]=[];
 const groups=new Map<string,number[]>();
 for(let i=0;i<complete.length;i++){
  const key=complete[i].month+'|'+complete[i].turn;
  const ids=groups.get(key)||[];ids.push(i);groups.set(key,ids);
 }
 const rand=rng(0x12fd3940+Number(year));
 for(let r=0;r<reps;r++){
  const p=heads.map(x=>[...x]);
  // Permuta cada jurisdicción por separado dentro de mes y turno:
  // rompe sincronía diaria, conserva frecuencia marginal y calendario.
  for(let j=0;j<5;j++)for(const ids of groups.values()){
   const xs=ids.map(i=>heads[i][j]);
   for(let k=xs.length-1;k>0;k--){const t=Math.floor(rand()*(k+1));
    [xs[k],xs[t]]=[xs[t],xs[k]];}
   for(let k=0;k<ids.length;k++)p[ids[k]][j]=xs[k];
  }
  series.push(counts(p));
 }
 const means=obs.map((_,k)=>oneStd(series.map(x=>x[k])));
 const z=(v:number,k:number)=>(v-means[k].mean)/(means[k].sd||1);
 const ranked=obs.map((n,k)=>({from:JUR[pairs[k].a],to:JUR[pairs[k].b],
  matches:n,nullMean:Number(means[k].mean.toFixed(2)),z:Number(z(n,k).toFixed(2)),
  pRaw:(1+series.filter(x=>Math.abs(z(x[k],k))>=Math.abs(z(n,k))).length)/(reps+1),
  pFamilyWise:(1+series.filter(x=>Math.max(...x.map((v,i)=>Math.abs(z(v,i))))>=
   Math.abs(z(n,k))).length)/(reps+1)
 })).sort((a,b)=>Math.abs(b.z)-Math.abs(a.z));
 return {year,cuts:complete.length,headPairs:complete.length*pairs.length,
  null:'se permutan las fechas independientemente por jurisdicción dentro de cada mes y turno',
  tests:ranked,correctedMax:ranked[0]?.pFamilyWise};
}
function scoreOf(history:Daily[],jur:J,turn:Turno,kind:Kind){
 const pools:Record<'global'|'local'|'strict',Map<string,number>>={
  global:new Map(),local:new Map(),strict:new Map()};
 const den={global:0,local:0,strict:0};
 const past=history.slice(-45);
 for(let i=0;i<past.length;i++){
  const w=Math.exp(-(past.length-i-1)/15);
  for(const e of past[i].events){
   const val=e[kind];pools.global.set(val,(pools.global.get(val)||0)+w);den.global+=w;
   if(e.jur===jur){
    pools.local.set(val,(pools.local.get(val)||0)+w);den.local+=w;
    if(e.turn===turn){pools.strict.set(val,(pools.strict.get(val)||0)+w);den.strict+=w;}
   }
  }
 }
 return {pools,den};
}
function rank(date:string,turn:Turno,jur:J,kind:Kind,history:Daily[]){
 const stats=scoreOf(history,jur,turn,kind);
 const all=universes[kind];
 const scored=all.map(f=>{
  const global=(stats.pools.global.get(f)||0)/(stats.den.global||1);
  const local=(stats.pools.local.get(f)||0)/(stats.den.local||1);
  const strict=(stats.pools.strict.get(f)||0)/(stats.den.strict||1);
  return {f,scores:{
   AZAR_FIJO:seedHash(date+'|'+turn+'|'+jur+'|'+kind+'|'+f)/4294967295,
   GLOBAL:global,JURISDICCION:local,JUR_TURNO:strict,
   MIXTO:0.5*global+0.5*local
  }};
 });
 return Object.fromEntries(MODES.map(mode=>[mode,[...scored].sort((a,b)=>
  b.scores[mode]-a.scores[mode]||a.f.localeCompare(b.f)).slice(0,10).map(x=>x.f)])) as
 Record<Mode,string[]>;
}
function predictive(days:Daily[]){
 const history:Daily[]=[],trials:Trial[]=[];
 for(const day of days){
  for(const draw of day.draws){
   if(history.length<45)continue;
   for(const e of draw.heads){
    for(const kind of ['vt2','vt3'] as Kind[]){
     const ranks=rank(day.date,draw.turn,e.jur,kind,history);
     const truth=e[kind],space=kind==='vt2'?100:1000;
     const hits=Object.fromEntries(MODES.map(mode=>{
      const fs=ranks[mode];
      return [mode,{top5:Number(fs.slice(0,5).includes(truth)),
       top10:Number(fs.includes(truth)),
       exp5:fs.slice(0,5).reduce((s,f)=>s+variants(f).length/space,0)}];
     })) as Trial['hits'];
     trials.push({date:day.date,turn:draw.turn,jur:e.jur,kind,truth,ranks,hits});
    }
   }
  }
  history.push(day);
 }
 return trials;
}
function summarize(trials:Trial[],year:string,kind:Kind){
 const xs=trials.filter(x=>x.date.startsWith(year)&&x.kind===kind);
 const baseline=xs.filter(x=>x.jur===JUR[0]).length;
 const totals=Object.fromEntries(MODES.map(mode=>[mode,{
  top5:xs.reduce((s,x)=>s+x.hits[mode].top5,0),
  top10:xs.reduce((s,x)=>s+x.hits[mode].top10,0),
  expectedTop5:Number(xs.reduce((s,x)=>s+x.hits[mode].exp5,0).toFixed(2))
 }])) as Record<Mode,{top5:number;top10:number;expectedTop5:number}>;
 const comparisons=MODES.filter(m=>m!=='GLOBAL'&&m!=='AZAR_FIJO');
 const dayDiffs=new Map<string,number[]>();
 const dayNames=[...new Set(xs.map(x=>x.date))];
 for(const date of dayNames){
  const on=xs.filter(x=>x.date===date);
  dayDiffs.set(date,comparisons.map(m=>on.reduce((s,x)=>s+
   x.hits[m].top5-x.hits.GLOBAL.top5,0)));
 }
 const deltas=comparisons.map((m,k)=>({method:m,
  count:dayNames.reduce((s,d)=>s+dayDiffs.get(d)![k],0)}));
 const rand=rng(0xaced1234+Number(year)+(kind==='vt2'?1:12));
 const boot:number[][]=[],signs:number[][]=[],iters=1499;
 for(let b=0;b<iters;b++){
  const bt=Array(comparisons.length).fill(0),st=Array(comparisons.length).fill(0);
  for(let n=0;n<dayNames.length;n++){
   const chosen=dayDiffs.get(dayNames[Math.floor(rand()*dayNames.length)])!;
   for(let k=0;k<comparisons.length;k++)bt[k]+=chosen[k];
   const draw=dayDiffs.get(dayNames[n])!,sign=rand()<0.5?-1:1;
   for(let k=0;k<comparisons.length;k++)st[k]+=draw[k]*sign;
  }
  boot.push(bt);signs.push(st);
 }
 const nullSds=comparisons.map((_,k)=>oneStd(signs.map(s=>s[k])).sd||1);
 const stat=(row:number[])=>Math.max(...row.map((x,k)=>Math.abs(x/nullSds[k])));
 const full=stat(deltas.map(x=>x.count));
 const pAll=(1+signs.filter(row=>stat(row)>=full).length)/(iters+1);
 const byComparison=deltas.map((x,k)=>{
  const sorted=boot.map(row=>row[k]);
  const z=Math.abs(x.count/nullSds[k]);
  return {...x,bootstrap95:[percentile(sorted,0.025),percentile(sorted,0.975)],
   pFamilyWise:(1+signs.filter(row=>stat(row)>=z).length)/(iters+1)};
 });
 const byJur=JUR.map(j=>{
  const sub=xs.filter(x=>x.jur===j);
  return {jur:j,n:sub.length,
   global:sub.reduce((s,x)=>s+x.hits.GLOBAL.top5,0),
   local:sub.reduce((s,x)=>s+x.hits.JURISDICCION.top5,0),
   mixed:sub.reduce((s,x)=>s+x.hits.MIXTO.top5,0)};
 });
 return {year,kind,heads:xs.length,days:dayNames.length,totals,
  deltaAgainstGlobal:byComparison,overallBestOfThreeAdjustedP:pAll,
  perJurisdiction:byJur,nBaseline:baseline,
  note:'Top5 exacto de familias reversibles; remuestreo por fecha y contraste pareado de métodos; decisiones fijadas antes de ver los resultados'};
}
async function main(){
 const dataset=await download();
 console.log('DESCARGA_JUR',JSON.stringify({days:dataset.days.length,
  first:dataset.days[0]?.date,last:dataset.days.at(-1)?.date,
  errors:dataset.errors.length}));
 if(dataset.errors.length>20)throw Error('Demasiados errores de descarga para una auditoría confiable');
 const draws=dataset.days.flatMap(d=>d.draws).filter(x=>x.heads.length===JUR.length);
 const evidence=[] as any[];
 for(const year of ['2025','2026']){
  const sub=draws.filter(d=>d.date.startsWith(year));
  const dist=distribution(sub,year);
  const sync=crossSync(sub,year);
  evidence.push({year,dist,sync});
  console.log('DISTRIBUCION_JUR',JSON.stringify(dist));
  console.log('SINCRONIAS_JUR',JSON.stringify(sync));
 }
 const tests=predictive(dataset.days);
 const scored=['2025','2026'].flatMap(y=>(['vt2','vt3'] as Kind[])
  .map(k=>summarize(tests,y,k)));
 for(const summary of scored)console.log('PREDICCION_JUR',JSON.stringify(summary));
 const report={description:'Jurisdicciones temporales RAW sin +11 ni hoja',
  exploratory:'2025',holdout:'2026 (retrospectivo)',
  limitation:'2026 no está sellado prospectivamente y estudios previos ya observaron este histórico',
  noLeakage:'ranking sólo con los 45 días anteriores; nada del día objetivo para generar Tops',
  years:dataset.days.reduce((a,d)=>({...a,[d.date.slice(0,4)]:(a[d.date.slice(0,4)]||0)+1}),
   {} as Record<string,number>),
  downloadErrors:dataset.errors,evidence,scored,
  experiment:{draws:draws.length,heads:tests.length/2,
   totalRawDays:dataset.days.length,unit:'cabeza por jurisdicción y turno',
   modes:MODES,tests:'999 permutaciones, 1499 remuestreos por jornada'},
 };
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/jurisdicciones-temporal-2025-2026.json',JSON.stringify(report,null,2));
 console.log('RESUMEN_JUR',JSON.stringify({
  draws:draws.length,days:dataset.days.length,
  2025:evidence[0]&&{distribution:evidence[0].dist.results.map((x:any)=>x.maxAdjustedP),
   sync:evidence[0].sync.correctedMax},
  2026:evidence[1]&&{distribution:evidence[1].dist.results.map((x:any)=>x.maxAdjustedP),
   sync:evidence[1].sync.correctedMax},
  prediction:scored.map(x=>({year:x.year,kind:x.kind,heads:x.heads,
   totals:x.totals,p:x.overallBestOfThreeAdjustedP,
   deltas:x.deltaAgainstGlobal}))}));
}
void main().catch(e=>{console.error('ERROR_JUR',e);process.exitCode=1});
