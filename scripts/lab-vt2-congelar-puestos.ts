/**
 * Experimento PRE retrospectivo de posiciones específicas:
 * Congelar dos puestos destacados por turno usando junio-julio,
 * medir agosto-septiembre y octubre SIN reajustarlos.
 * Control: dos posiciones elegidas aleatoriamente por turno y congeladas
 * durante todo el período evaluado; no se permutan cabezas ni resultados.
 */
import fs from 'node:fs';
import {TURNOS} from '../src/domain';
type Hist={period:string,turn:string,top10HitHeads:number,slotCounts:{rank:number,hitHeads:number}[]};
const path='auditorias/vt2-posiciones-libres/resumen.json';
const raw=JSON.parse(fs.readFileSync(path,'utf8'));
const h:Hist[]=raw.byPosition;
const get=(p:string,t:string)=>h.find(x=>x.period===p&&x.turn===t)!;
const train=Object.fromEntries(TURNOS.map(t=>{
 const a=get('JUN_JUL',t).slotCounts;
 const choose=[...a].sort((x,y)=>y.hitHeads-x.hitHeads||x.rank-y.rank).slice(0,2)
  .map(x=>x.rank).sort((x,y)=>x-y);
 return [t,choose];
})) as Record<string,number[]>;
const cases=['JUN_JUL','AGO_SEP','OCT_1_24','OCT_26_28','TOTAL'];
const evalPeriod=(p:string)=>{
 const breakdown=TURNOS.map(t=>{
  const x=get(p,t),selected=train[t];
  const captured=selected.reduce((n,r)=>n+x.slotCounts[r-1].hitHeads,0);
  const fixed79=x.slotCounts[6].hitHeads+x.slotCounts[8].hitHeads;
  return {turn:t,selected,top10Hits:x.top10HitHeads,captured,fixed79,
    coverage:x.top10HitHeads?captured/x.top10HitHeads:0,
    positions:x.slotCounts.map(y=>y.hitHeads)};
 });
 return {period:p,breakdown,top10Hits:breakdown.reduce((n,x)=>n+x.top10Hits,0),
  captured:breakdown.reduce((n,x)=>n+x.captured,0),
  fixed79:breakdown.reduce((n,x)=>n+x.fixed79,0)};
};
const results=cases.map(evalPeriod);
let seed=12121212;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
function permutation(p:string,reps=40000){
 const r=results.find(x=>x.period===p)!;
 const observed=r.captured,values=[];
 for(let z=0;z<reps;z++){
  let sum=0;
  for(const row of r.breakdown){
   const a=Math.floor(rand()*10);
   let b=Math.floor(rand()*9);if(b>=a)b++;
   sum+=row.positions[a]+row.positions[b];
  }
  values.push(sum);
 }
 values.sort((a,b)=>a-b);
 const high=values.filter(x=>x>=observed).length;
 const low=values.filter(x=>x<=observed).length;
 return {period:p,actual:observed,expected:values.reduce((s,x)=>s+x,0)/reps,
  chance95:[values[Math.floor(.025*reps)],values[Math.floor(.975*reps)]],
  oneSidedHighP:(high+1)/(reps+1),
  twoSidedP:Math.min(1,2*Math.min((high+1)/(reps+1),(low+1)/(reps+1)))};
}
const test=cases.map(p=>permutation(p));
const report={method:'train June-Jul top2 positions each turn, freeze, validate Aug-Sep, look at Oct; random fixed 2 slots per turn control',
 selected:train,results,randomSlotControl:test,
 interpretation:'App ranks are dynamic; no real prospective PRE snapshots. Secondary analyses post-hoc exploratory.'};
fs.writeFileSync('auditorias/vt2-posiciones-libres/seleccion-congelada.json',JSON.stringify(report,null,2)+'\n');
console.log('VT2_FROZEN_PAIR_SUMMARY',JSON.stringify(report));
