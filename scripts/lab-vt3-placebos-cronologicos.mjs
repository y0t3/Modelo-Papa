import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const source='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const out='auditorias/vt3-placebos-cronologicos-115-13oct2026/';
const protocol='PROTOCOLO_VT3_PLACEBOS_CRONOLOGICOS_13OCT2026.md';
const turnos=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const methods={A:'A_ORIGINAL',B:'B_INVENTARIO',C:'C_SIN_PRIORIDAD_BIF',D:'D_AMBOS'};
const metrics=['A.top3','A.top5','A.top10','A.pool','B.top10','B.pool','C.top3','C.top5','C.top10','D.top3','D.top5','D.top10','C.minusA.top10'];
const reps=20000;
const initialSeed=20261013;
const expectedPre='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const read=p=>readFileSync(p,'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const json=p=>JSON.parse(read(p));
const save=(p,x)=>writeFileSync(out+p,JSON.stringify(x,null,2)+'\n');
const family=x=>[x,[...x].reverse().join('')].sort().join('/');
const key=(r)=>r.date+'|'+r.turn;
mkdirSync(out,{recursive:true});
assert.equal(hash(read(source+'PRE_115.json')),expectedPre,'PRE histórico cambiado');
const originalSeal=json(source+'SELLO.json');
assert.equal(originalSeal.preHash,expectedPre);
const pre=json(source+'PRE_115.json').rows;
const post=json(source+'POST_115.json').rows;
assert.equal(pre.length,115);assert.equal(post.length,115);
const pindex=new Map(pre.map(r=>[key(r),r]));
const oindex=new Map(post.map(r=>[key(r),r]));
assert.equal(pindex.size,115);assert.equal(oindex.size,115);
const dates=[...new Set(pre.map(r=>r.date))].sort();
assert.equal(dates.length,23);
const pdata=dates.map(d=>turnos.map(t=>{
 const p=pindex.get(d+'|'+t);
 assert.ok(p,'falta PRE '+d+' '+t);
 return p;
}));
const odata=dates.map(d=>turnos.map(t=>{
 const o=oindex.get(d+'|'+t);
 assert.ok(o,'falta POST '+d+' '+t);
 assert.ok(o.targets.length===5);
 return new Set(o.targets.map(h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3))}));
}));
for(const [i,d] of dates.entries())for(const [j,t] of turnos.entries()){
 assert.equal(pdata[i][j].date,d);assert.equal(pdata[i][j].turn,t);
}
const wins=(arr,target)=>Number(arr.some(f=>target.has(f.family)));
const calc=(row,target)=>{
 const A=row.strategies[methods.A],B=row.strategies[methods.B],
       C=row.strategies[methods.C],D=row.strategies[methods.D];
 const a10=wins(A.slice(0,10),target), c10=wins(C.slice(0,10),target);
 return [
  wins(A.slice(0,3),target),wins(A.slice(0,5),target),a10,wins(A,target),
  wins(B.slice(0,10),target),wins(B,target),
  wins(C.slice(0,3),target),wins(C.slice(0,5),target),c10,
  wins(D.slice(0,3),target),wins(D.slice(0,5),target),wins(D.slice(0,10),target),
  c10-a10
 ];
};
// One 23×23 matrix per measure, entire date bundles retained across all 5 draws.
const matrix=metrics.map(()=>Array.from({length:23},()=>Array(23).fill(0)));
for(let i=0;i<23;i++)for(let j=0;j<23;j++)
 for(let t=0;t<5;t++){
  const arr=calc(pdata[i][t],odata[j][t]);
  for(let m=0;m<metrics.length;m++)matrix[m][i][j]+=arr[m];
 }
const evaluate=assignment=>matrix.map(mm=>assignment.reduce((sum,j,i)=>sum+mm[i][j],0));
const identity=Array.from({length:23},(_,i)=>i);
const actual=evaluate(identity);
const observed=Object.fromEntries(metrics.map((m,i)=>[m,actual[i]]));
assert.equal(observed['A.top3'],5);
assert.equal(observed['A.top5'],8);
assert.equal(observed['A.top10'],15);
assert.equal(observed['A.pool'],46);
assert.equal(observed['B.top10'],15);
assert.equal(observed['B.pool'],80);
assert.equal(observed['C.top10'],16);
assert.equal(observed['D.top10'],15);
const realDetail=dates.map((d,i)=>({
 date:d,
 shifts:turnos.map((turn,t)=>{
  const result=calc(pdata[i][t],odata[i][t]);
  const map=Object.fromEntries(metrics.map((m,k)=>[m,result[k]]));
  const orig=pdata[i][t].strategies[methods.A];
  return {turn,actualVT3:[...odata[i][t]],top3:orig.slice(0,3).map(f=>f.family),
    top10:orig.slice(0,10).map(f=>f.family),...map};
 })
}));
const byMonth=Object.fromEntries([...new Set(dates.map(d=>d.slice(0,7)))].map(month=>{
 const rows=realDetail.filter(d=>d.date.startsWith(month)).flatMap(d=>d.shifts);
 return [month,Object.fromEntries(metrics.map(m=>[m,rows.reduce((s,r)=>s+r[m],0)]))];
}));
const topPersistence=realDetail.map(d=>{
 const first=d.shifts[0].top3.join('|'),first10=d.shifts[0].top10.join('|');
 return {date:d.date,top3UnchangedAllDay:d.shifts.every(x=>x.top3.join('|')===first),
   top10UnchangedAllDay:d.shifts.every(x=>x.top10.join('|')===first10),
   distinctTop10Families:new Set(d.shifts.flatMap(x=>x.top10)).size,
   top10RepeatedOnAll5:d.shifts[0].top10.filter(x=>d.shifts.every(y=>y.top10.includes(x))).length};
});
save('REAL.json',{note:'PRE original fijo; POST real de las mismas 23 jornadas, ningún sorteo nuevo',observed,byMonth,realDetail,topPersistence});
const shifts=Array.from({length:22},(_,i)=>{
 const shift=i+1;
 const a=evaluate(identity.map(j=>(j+shift)%23));
 return {shiftOperationalDays:shift,score:Object.fromEntries(metrics.map((m,k)=>[m,a[k]]))};
});
function random(seed){
 let state=seed>>>0;
 return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
}
function shuffleInGroups(rng,groups){
 const result=[...identity];
 for(const group of groups){
  const pool=group.map(x=>result[x]);
  for(let i=pool.length-1;i>0;i--){
   const j=Math.floor(rng()*(i+1));
   [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  group.forEach((pos,i)=>result[pos]=pool[i]);
 }
 assert.equal(new Set(result).size,23);
 return result;
}
const fullGroups=[identity];
const weekday=d=>new Date(d+'T12:00:00Z').getUTCDay();
function groupBy(fn){
 const map=new Map();
 dates.forEach((d,i)=>{const x=fn(d);if(!map.has(x))map.set(x,[]);map.get(x).push(i)});
 return [...map.values()];
}
const groupSchemes={
 all:fullGroups,
 sameWeekday:groupBy(d=>weekday(d)),
 sameMonth:groupBy(d=>d.slice(0,7))
};
function q(v,p){const a=[...v].sort((a,b)=>a-b);return a[Math.floor((a.length-1)*p)]}
const permutations={};
for(const [gidx,[name,groups]] of Object.entries(groupSchemes).entries()){
 const rng=random(initialSeed+gidx*1009);
 const dists=metrics.map(()=>[]);
 for(let n=0;n<reps;n++){
  const assignment=shuffleInGroups(rng,groups),values=evaluate(assignment);
  values.forEach((v,m)=>dists[m].push(v));
 }
 permutations[name]={repetitions:reps,groups:groups.map(x=>x.map(i=>dates[i])),metrics:
  Object.fromEntries(metrics.map((name,m)=>{
   const v=dists[m],mean=v.reduce((a,b)=>a+b,0)/reps;
   return [name,{observed:actual[m],mean:Number(mean.toFixed(5)),min:Math.min(...v),
     p05:q(v,0.05),p50:q(v,0.5),p95:q(v,0.95),max:Math.max(...v),
     countAtLeastObserved:v.filter(x=>x>=actual[m]).length,
     empiricalTail:(1+v.filter(x=>x>=actual[m]).length)/(reps+1)}];
  }))};
 console.log('PLACEBO_FINISHED',name,reps,permutations[name].metrics['A.top10'],permutations[name].metrics['B.pool']);
}
const report={
 metadata:{date:'2026-10-13',dates:23,cuts:115,seed:initialSeed,repetitionsPerScheme:reps,
   originalPreSha256:expectedPre,originalPostSha256:hash(read(source+'POST_115.json')),
   protocolSha256:hash(read(protocol)),scriptSha256:hash(read('scripts/lab-vt3-placebos-cronologicos.mjs'))},
 observed,byMonth,
 persistence:{
  identicalTop3All5:topPersistence.filter(x=>x.top3UnchangedAllDay).length,
  identicalTop10All5:topPersistence.filter(x=>x.top10UnchangedAllDay).length,
  meanDistinctTop10AcrossDay:topPersistence.reduce((s,x)=>s+x.distinctTop10Families,0)/23,
  meanTop10RepeatedAll5:topPersistence.reduce((s,x)=>s+x.top10RepeatedOnAll5,0)/23
 },
 rotation:{count:shifts.length,metrics:Object.fromEntries(metrics.map(m=>[m,{
  observed:observed[m],min:Math.min(...shifts.map(s=>s.score[m])),
  median:q(shifts.map(s=>s.score[m]),0.5),
  max:Math.max(...shifts.map(s=>s.score[m])),
  rotationsAtLeastActual:shifts.filter(s=>s.score[m]>=observed[m]).length
 }]))},
 permutations,
 limitation:'Mismo corpus septiembre-octubre 2026 ya optimizado y explorado. Permutaciones no reparan sesgo de selección de hipótesis ni prueban ventaja futura. Controles de resultados completos por fecha (5 turnos, 5 jurisdicciones), sin tocar geometría o Top.'
};
save('RESUMEN.json',report);
save('ROTACIONES_22.json',{note:'22 asignaciones POST falsas por desplazamiento de jornada operativa, para las mismas hojas PRE',shifts});
save('SELLO.json',{protocol:report.metadata.protocolSha256,script:report.metadata.scriptSha256,
 inputPre:expectedPre,inputPost:report.metadata.originalPostSha256,
 resumen:hash(read(out+'RESUMEN.json')),real:hash(read(out+'REAL.json')),rotaciones:hash(read(out+'ROTACIONES_22.json'))});
console.log('VT3_PLACEBO_115_OK',JSON.stringify({observed,rotation:report.rotation.metrics,permutations:Object.fromEntries(Object.entries(permutations).map(([x,v])=>[x,{A:v.metrics['A.top10'],B:v.metrics['B.pool'],CminusA:v.metrics['C.minusA.top10']}]))},null,2));
