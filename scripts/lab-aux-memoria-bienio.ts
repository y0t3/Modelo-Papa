/**
 * Diagnóstico conjunto sin recalibración de 2025+2026:
 * - exposición real al azar uniforme (familias reversibles no tienen siempre
 *   dos orientaciones, palíndromas solo una),
 * - remuestreo pareado estratificado por año y por jornada,
 * - no tratar rutas múltiples ni repeticiones de familias como cabezas extra.
 *
 * No atribuir p-values confirmatorios: estudio diseñado tras investigación
 * en ambos años; esta es sólo una auditoría descriptiva de estabilidad.
 */
import {readFileSync,writeFileSync} from 'node:fs';
type Method='AUX_MARCAS'|'AUX_DENSIDAD'|'AUX_RANDOM'|'LALO'|
 'LALO_RERANK_MARCAS';
type Cut={
 date:string;turn:string;heads:{jur:string;head:string;family:string}[];
 candidates:Record<Method,string[]>;
 hits:Record<Method,{top5:number}>;
 controlRandomTop5:number[];
};
const years=['2025','2026'] as const;
const inputs=years.map(year=>{
 const data=JSON.parse(readFileSync('lab-results/aux-memoria-marcas-'+year+'.json','utf-8'));
 return {year,cuts:data.cuts as Cut[]};
});
const methods:Method[]=['AUX_MARCAS','AUX_DENSIDAD','AUX_RANDOM','LALO',
 'LALO_RERANK_MARCAS'];
function expected(cut:Cut,method:Method){
 const values=new Set(cut.candidates[method].slice(0,5).flatMap(x=>x.split('/')));
 return cut.heads.length*values.size/1000;
}
const coverage=inputs.map(({year,cuts})=>({
 year,days:new Set(cuts.map(x=>x.date)).size,cuts:cuts.length,
 heads:cuts.reduce((n,c)=>n+c.heads.length,0),
 methods:methods.map(method=>{
  const observed=cuts.reduce((n,c)=>n+c.hits[method].top5,0);
  const uniformExpectation=cuts.reduce((n,c)=>n+expected(c,method),0);
  return {method,observed,uniformExpectation:Number(uniformExpectation.toFixed(3)),
   excess:Number((observed-uniformExpectation).toFixed(3)),
   caveat:'uniforme no contempla eventuales dependencias entre jurisdicciones'};
 })
}));
const dayBlocks=inputs.map(({year,cuts})=>{
 const dates=[...new Set(cuts.map(x=>x.date))];
 return {year,blocks:dates.map(date=>{
  const day=cuts.filter(x=>x.date===date);
  const winner=day.reduce((n,c)=>n+c.hits.AUX_MARCAS.top5,0);
  const against=methods.slice(1).map(method=>
   winner-day.reduce((n,c)=>n+c.hits[method].top5,0));
  const shape=winner-day.reduce((n,c)=>n+
   c.controlRandomTop5.reduce((a,b)=>a+b,0)/9,0);
  return [...against,shape];
 })};
});
let state=0x45ab128d;const random=()=>{state^=state<<13;state^=state>>>17;
 state^=state<<5;return(state>>>0)/4294967296;};
const comparators=[...methods.slice(1),'CONTROL_FORMAS_9'];
const reps=3999;
const comparisons=comparators.map((method,j)=>{
 const observed=dayBlocks.reduce((s,group)=>s+group.blocks.reduce((x,v)=>x+v[j],0),0);
 const samples:number[]=[];
 for(let i=0;i<reps;i++){
  let n=0;
  // Estratificar 2025 y 2026, unidad de bootstrap = jornada completa.
  for(const group of dayBlocks)for(let index=0;index<group.blocks.length;index++)
   n+=group.blocks[Math.floor(random()*group.blocks.length)][j];
  samples.push(n);
 }
 samples.sort((a,b)=>a-b);
 return {method,totalDifference:observed,
  ci95:[samples[Math.floor(reps*0.025)],samples[Math.floor(reps*0.975)]],
  explanatory:'diferencia raíz ganadora menos control, número de cabezas'};
});
const result={description:'2025 y 2026 con configuración congelada del mismo motor auxiliar',
 coverage,comparison:{days:dayBlocks.reduce((x,g)=>x+g.blocks.length,0),
  yearlyStratifiedDayBootstrap:reps,comparisons},
 caveat:'Comparación retrospectiva luego de múltiples investigaciones; no demuestra predictibilidad ni ganancias futuras.'};
console.log('MEMORIA_BIENIO',JSON.stringify(result));
writeFileSync('lab-results/aux-memoria-bienio-2025-2026.json',
 JSON.stringify(result,null,2));
