import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const DIR='auditorias/vt4-transferencia-rutas-ganadoras-115-13oct2026/';
const GOALS='auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json';
const FUTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const PROTO='PROTOCOLO_VT4_CONTROL_PERMUTACION_RUTAS_13OCT2026.md';
const sha=t=>createHash('sha256').update(t).digest('hex');
const read=p=>readFileSync(p,'utf8'),j=p=>JSON.parse(read(p));
const save=(f,v)=>writeFileSync(DIR+f,JSON.stringify(v,null,2)+'\n');
const SEED=20261013,N=500;
const rng=(seed)=>{let state=seed>>>0;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296}};
function shuffle(a,r){
 const v=a.slice();for(let i=v.length-1;i>0;i--){const k=Math.floor(r()*(i+1));[v[k],v[i]]=[v[i],v[k]]}return v;
}
function score(signal){return [signal.d7exact,signal.d1exact,signal.d7shape,signal.d1shape]}
function select(groups,assigned){
 const used=new Set(),out=[];
 for(let mother=1;mother<=5;mother++){
  const siblings=groups.filter(g=>g.motherRank===mother);
  const sorted=siblings.slice().sort((a,b)=>{
   const x=score(assigned.get(a.rank)),y=score(assigned.get(b.rank));
   for(let k=0;k<4;k++)if(x[k]!==y[k])return y[k]-x[k];
   return a.rank-b.rank;
  });
  let n=0;
  for(const g of sorted){
   if(n===2)break;
   if(g.values.some(v=>used.has(v)))continue;
   out.push(g.rank);n++;
   for(const val of g.values)used.add(val);
  }
  assert.equal(n,2);
 }
 assert.equal(out.length,10);
 return out;
}
const original=()=>j(DIR+'PRE_115.json').rows;
const inventory=()=>j(DIR+'INVENTARIO_RUTAS_PRE_115.json').rows;
function pre(){
 assert.ok(!existsSync(GOALS));assert.ok(!existsSync(FUTURE));
 const rows=original(),bank=inventory();assert.equal(rows.length,115);assert.equal(bank.length,115);
 const rnd=rng(SEED),output=[];
 for(let i=0;i<115;i++){
  const row=rows[i],b=bank[i];
  assert.equal(row.date,b.date);assert.equal(row.turn,b.turn);
  const base=new Map(b.groups.map(g=>[g.rank,g.signal]));
  assert.deepEqual(select(b.groups,base),row.methods.D7_D1_COMBINADO.map(x=>x.oldRank));
  const controls=[];
  for(let n=0;n<N;n++){
   const fake=new Map();
   for(let mother=1;mother<=5;mother++){
    const sisters=b.groups.filter(g=>g.motherRank===mother);
    const shuffled=shuffle(sisters.map(x=>x.signal),rnd);
    sisters.forEach((g,k)=>fake.set(g.rank,shuffled[k]));
   }
   controls.push(select(b.groups,fake));
  }
  output.push({date:row.date,turn:row.turn,groups:b.groups.map(g=>({rank:g.rank,values:g.values})),controls});
 }
 save('PLACEBO_PRE_500.json',{seed:SEED,replicates:N,rows:output});
 const seal={code:sha(read('scripts/lab-vt4-rutas-placebo.mjs')),
   protocol:sha(read(PROTO)),original:sha(read(DIR+'PRE_115.json')),
   inventory:sha(read(DIR+'INVENTARIO_RUTAS_PRE_115.json')),
   file:sha(read(DIR+'PLACEBO_PRE_500.json'))};
 save('PLACEBO_SELLO.json',seal);
 console.log('VT4_PLACEBO_PRE_OK',JSON.stringify({repetitions:N,cuts:115,seal,bytes:read(DIR+'PLACEBO_PRE_500.json').length}));
}
function quantile(list,p){const k=Math.min(list.length-1,Math.floor(p*(list.length-1)));return list[k]}
function dist(nums,target){
 const sorted=nums.slice().sort((a,b)=>a-b);
 return {mean:Number((nums.reduce((s,x)=>s+x,0)/nums.length).toFixed(3)),
  min:sorted[0],p05:quantile(sorted,.05),median:quantile(sorted,.5),
  p95:quantile(sorted,.95),max:sorted.at(-1),
  threshold:target,replicasAtLeast:nums.filter(x=>x>=target).length,
  fractionAtLeast:Number((nums.filter(x=>x>=target).length/nums.length).toFixed(4))};
}
function post(){
 const seal=j(DIR+'PLACEBO_SELLO.json');
 for(const [file,digest] of [
  ['scripts/lab-vt4-rutas-placebo.mjs',seal.code],[PROTO,seal.protocol],
  [DIR+'PRE_115.json',seal.original],[DIR+'INVENTARIO_RUTAS_PRE_115.json',seal.inventory],
  [DIR+'PLACEBO_PRE_500.json',seal.file]])assert.equal(sha(read(file)),digest);
 const pre=j(DIR+'PLACEBO_PRE_500.json').rows,goals=j(GOALS).rows;
 assert.equal(pre.length,115);assert.equal(goals.length,115);
 const acc=Array.from({length:N},()=>({heads:0,cuts:0,top3:0,top5:0,top10:0}));
 const actual=j(DIR+'ANALISIS_CABEZAS_Y_5832_POST.json');
 assert.deepEqual([actual.methodTotals.D7_D1_COMBINADO.turns,
  actual.methodTotals.D7_D1_COMBINADO.heads],[4,5]);
 for(let i=0;i<115;i++){
  const x=pre[i],goal=goals[i];
  assert.equal(x.date,goal.date);assert.equal(x.turn,goal.turn);
  const byRank=new Map(x.groups.map(g=>[g.rank,g]));
  const heads=new Set(goal.heads);
  for(let n=0;n<N;n++){
   const groups=x.controls[n].map(rank=>byRank.get(rank));
   assert.ok(groups.every(Boolean));
   const found=new Set();
   const isHit=limit=>groups.slice(0,limit).some(g=>g.values.some(v=>heads.has(v)));
   for(const g of groups)for(const v of g.values)if(heads.has(v))found.add(v);
   const row=acc[n];
   row.heads+=found.size;row.cuts+=Number(found.size>0);
   row.top3+=Number(isHit(3));row.top5+=Number(isHit(5));row.top10+=Number(isHit(10));
  }
 }
 const summary={date:'2026-10-13',replicates:N,cuts:115,
  realCombined:{heads:5,cuts:4,top3:0,top5:0,top10:4},
  baseline:{heads:4,cuts:4,top3:0,top5:0,top10:4},
  controls:Object.fromEntries(['heads','cuts','top3','top5','top10'].map(k=>[k,
   dist(acc.map(x=>x[k]),k==='heads'?5:k==='cuts'||k==='top10'?4:0)])),
  seal,caveat:'Control adicional decidido después de examinar el aumento de 4 a 5 cabezas; resultados exploratorios sobre corpus reutilizado.'};
 save('PLACEBO_RESUMEN.json',summary);
 console.log('VT4_PLACEBO_POST_OK',JSON.stringify(summary,null,2));
}
if(process.argv[2]==='pre')pre();else if(process.argv[2]==='post')post();else throw Error('Uso: pre/post');
