/**
 * Control del movimiento de rango de familias VT2 que YA ganaron hoy:
 * permutación de etiquetas (SUBE / IGUAL / BAJA) entre distintos días,
 * dentro de mismo período y mismo puesto actual del Top10 nocturno.
 * No utiliza Nocturna para determinar la etiqueta de movimiento.
 */
import fs from 'node:fs';
type Trace={family:string;currentRank:number;priorWon:boolean;
 movement:'SUBE'|'BAJA'|'IGUAL'|'NUEVA';hitHeads:{jur:string;head:string}[]};
type Night={date:string;traces:Trace[]};
const nights=JSON.parse(fs.readFileSync('auditorias/vt2-trayectorias/nocturnas-127.json','utf8')) as Night[];
if(nights.length!==127)throw Error('Noches de estudio VT2 inválidas');
function period(date:string){return date<='2026-07-31'?'JUN_JUL':
 date<='2026-09-30'?'AGO_SEP':date<='2026-10-24'?'OCT_1_24':'OCT_26_28';}
const active=nights.flatMap(n=>n.traces.filter(t=>t.priorWon).map(t=>({...t,date:n.date,period:period(n.date),hits:t.hitHeads.length})));
const counts=Object.fromEntries(['SUBE','IGUAL','BAJA'].map(m=>{
 const rows=active.filter(x=>x.movement===m);
 return [m,{slots:rows.length,hitHeads:rows.reduce((a,x)=>a+x.hits,0),
  dates:new Set(rows.map(x=>x.date)).size}];
})) as Record<string,{slots:number;hitHeads:number;dates:number}>;
if(active.length!==349||counts.SUBE.slots!==33||counts.IGUAL.slots!==237||counts.BAJA.slots!==79||
 counts.SUBE.hitHeads!==9||counts.IGUAL.hitHeads!==35||counts.BAJA.hitHeads!==5)
 throw Error('No coincide soporte de posiciones ganadoras');
const ups=counts.SUBE.hitHeads/counts.SUBE.slots;
const downs=counts.BAJA.hitHeads/counts.BAJA.slots;
const sames=counts.IGUAL.hitHeads/counts.IGUAL.slots;
const observedUD=ups-downs,observedUS=ups-sames;
let seed=20261029;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
const groups=new Map<string,typeof active>();
for(const a of active){const key=a.period+'|'+a.currentRank;
 const list=groups.get(key)||[];list.push(a);groups.set(key,list);}
const runs=30000, statsUD:number[]=[],statsUS:number[]=[];
for(let run=0;run<runs;run++){
 let hitU=0,hitD=0,hitS=0;
 for(const list of groups.values()){
  const labels=list.map(x=>x.movement);
  for(let i=labels.length-1;i>0;i--){
   const j=Math.floor(rand()*(i+1));[labels[i],labels[j]]=[labels[j],labels[i]];
  }
  for(let j=0;j<list.length;j++){
   const h=list[j].hits;
   if(labels[j]==='SUBE')hitU+=h;
   if(labels[j]==='BAJA')hitD+=h;
   if(labels[j]==='IGUAL')hitS+=h;
  }
 }
 statsUD.push(hitU/counts.SUBE.slots-hitD/counts.BAJA.slots);
 statsUS.push(hitU/counts.SUBE.slots-hitS/counts.IGUAL.slots);
}
function summarize(values:number[],observed:number){
 const a=[...values].sort((x,y)=>x-y);
 const greater=values.filter(x=>x>=observed).length;
 const lesser=values.filter(x=>x<=observed).length;
 return {actual:observed,meanNull:values.reduce((a,b)=>a+b,0)/values.length,
  interval95:[a[Math.floor(values.length*.025)],a[Math.floor(values.length*.975)]],
  pOneSidedGreater:(greater+1)/(values.length+1),
  pTwoSided:Math.min(1,2*Math.min((greater+1)/(values.length+1),(lesser+1)/(values.length+1)))};
}
// Bootstrap por jornada (noche completa) de las tres tasas, para que
// múltiples cabezas de misma noche no aparenten observaciones independientes.
const sampled:number[]=[];
for(let run=0;run<10000;run++){
 let hu=0,nu=0,hd=0,nd=0;
 for(let t=0;t<nights.length;t++){
  const day=nights[Math.floor(rand()*nights.length)];
  for(const c of day.traces.filter(x=>x.priorWon)){
   if(c.movement==='SUBE'){nu++;hu+=c.hitHeads.length}
   if(c.movement==='BAJA'){nd++;hd+=c.hitHeads.length}
  }
 }
 if(nu&&nd)sampled.push(hu/nu-hd/nd);
}
sampled.sort((x,y)=>x-y);
const confidence95=[sampled[Math.floor(sampled.length*.025)],
 sampled[Math.floor(sampled.length*.975)]];
const comparison={
 kind:'EXPLORATORY_CONDITIONAL_NULL_NOT_LOTTERY_BASELINE',
 periods:'JUN_JUL/AGO_SEP/OCT_1_24/OCT_26_28',nights:nights.length,
 totalPriorWonSlots:active.length,counts,
 observed:{upRate:ups,downRate:downs,sameRate:sames,
  upMinusDown:observedUD,upMinusSame:observedUS},
 stratification:{groups:groups.size,nontrivial:[...groups.values()].filter(x=>x.length>=2).length,
  permutations:runs,rankAndPeriodPreserved:true},
 rankAndPeriodControl:{upVsDown:summarize(statsUD,observedUD),
  upVsSame:summarize(statsUS,observedUS)},
 clusterBootstrapDifferenceUpMinusDown95:confidence95,
 cautions:[
  'Varias hipótesis se observaron después de explorar el histórico; no hay p-valores ajustados.',
  'No se demuestra ventaja futura ni se infieren probabilidades reales de lotería.',
  'La categoría de movimiento se determina por la última aparición anterior del día, no necesariamente por el turno donde acertó.',
  'No incluye celdas físicas; se estudia ranking de familias reversibles.',
  'El baseline de aleatorización condiciona en los resultados nocturnos y la posición actual de cada familia.'
 ]};
const path='auditorias/vt2-trayectorias';
fs.writeFileSync(path+'/control-puesto-periodo.json',JSON.stringify(comparison,null,2)+'\n');
console.log('VT2_MOVEMENT_CONDITIONAL_TEST',JSON.stringify(comparison));
