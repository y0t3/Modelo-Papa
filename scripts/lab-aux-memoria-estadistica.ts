/**
 * Errores de inferencia: comparar LOS MISMOS sorteos y pronósticos PRE,
 * jamás reordenar cabezas dentro de mes sin reentrenar. Bootstrap por día.
 *
 * El archivo input lo generó el motor en la misma acción, antes de POST.
 * P-values a posteriori no válidos para probar ventaja por exploración;
 * intervalos son descriptivos y visibles por variante.
 */
import {readFileSync,writeFileSync} from 'node:fs';
const file='lab-results/aux-memoria-marcas-2026.json';
const raw=JSON.parse(readFileSync(file,'utf-8'));
type Method='AUX_MARCAS'|'AUX_DENSIDAD'|'AUX_RANDOM'|'LALO'|'LALO_RERANK_MARCAS';
type Cut={date:string;turn:string;
 hits:Record<Method,{top5:number}>;
 controlRandomTop5:number[];winnerCases:{
  head:string;family:string;rankAux:number|null;markedRootCount:number;
  formedAux:boolean;rankLalo:number|null}[]};
const cuts:Cut[]=raw.cuts;
const days=[...new Set(cuts.map(x=>x.date))];
const refMethods:Method[]=['AUX_DENSIDAD','AUX_RANDOM','LALO','LALO_RERANK_MARCAS'];
const comparisons=[...refMethods,'CONTROL_FORMAS_9' as const];
const values=days.map(date=>{
 const x=cuts.filter(c=>c.date===date);
 const positive=x.reduce((sum,c)=>sum+c.hits.AUX_MARCAS.top5,0);
 const ref=refMethods.map(m=>x.reduce((sum,c)=>sum+c.hits[m].top5,0));
 const nine=x.reduce((sum,c)=>sum+
  c.controlRandomTop5.reduce((n,h)=>n+h,0)/9,0);
 return {date,root:positive,reference:[...ref,nine]};
});
let state=0x36e2ab7d;
const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
 return(state>>>0)/4294967296;};
const reps=2999;
const metrics=comparisons.map((method,i)=>{
 const deltas=values.map(d=>d.root-d.reference[i]);
 const original=deltas.reduce((a,b)=>a+b,0);
 const bootstrap:number[]=[],nullData:number[]=[];
 for(let iteration=0;iteration<reps;iteration++){
  let boot=0,signed=0;
  for(let j=0;j<deltas.length;j++){
   boot+=deltas[Math.floor(rand()*deltas.length)];
   signed+=deltas[j]*(rand()<0.5?-1:1);
  }
  bootstrap.push(boot);
  nullData.push(signed);
 }
 bootstrap.sort((a,b)=>a-b);
 return {method,observedDifferenceTotal:original,
  ci95:[bootstrap[Math.floor(0.025*reps)],bootstrap[Math.floor(0.975*reps)]],
  favorableDays:deltas.filter(x=>x>0).length,
  unfavorableDays:deltas.filter(x=>x<0).length,
  tiedDays:deltas.filter(x=>x===0).length,
  signFlipExploratoryP:(1+nullData.filter(x=>x>=original).length)/(reps+1)};
});
const cases=cuts.flatMap(c=>c.winnerCases.map(x=>({...x,date:c.date,turn:c.turn})))
 .filter(x=>x.rankAux!==null&&x.rankAux<=5)
 .map(x=>({date:x.date,turn:x.turn,head:x.head,family:x.family,
  auxRank:x.rankAux,laloRank:x.rankLalo,historicalRootEvents:x.markedRootCount}));
const summary={test:'paired day-level uncertainty (retrospectivo)',
 days:days.length,cuts:cuts.length,bootstrapReplications:reps,
 reference:'Los deltas en cabezas se interpretan como root marks menos control; >0 favorece memoria',
 methods:metrics,rootTop5Heads:cases,
 warning:'Se han comparado numerosos modelos en estas fechas; no interpretar P sin corrección global ni pruebas prospectivas.'};
console.log('MEMORIA_ESTADISTICA',JSON.stringify(summary));
writeFileSync('lab-results/aux-memoria-estadistica-2026.json',JSON.stringify(summary,null,2));
