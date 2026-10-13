import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';

const DIR='auditorias/vt4-diversidad-madres-top10-115-13oct2026/';
const PRE=DIR+'INPUT_PRE_115.json',POST=DIR+'OBJETIVOS_POST_115.json';
const FUTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const DOC='PROTOCOLO_VT4_CONTROLES_NEUTRALES_13OCT2026.md';
const read=f=>readFileSync(f,'utf8'),j=f=>JSON.parse(read(f));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(name,x)=>writeFileSync(DIR+name,JSON.stringify(x,null,2)+'\n');
const modes=['ALEATORIO_UNICO_500','ALEATORIO_1_POR_MADRE_500'];
const rng=seed=>{let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}};
const r=rng(20261013),N=500;
mkdirSync(DIR,{recursive:true});
const runtime='resultados/runtime-vt4-contraste-neutral';
for(const name of ['domain','dates','paths','sheet','motorLalo']){
 const dest=resolve(runtime,name+'.mjs');mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,stripTypeScriptTypes(read('src/'+name+'.ts')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
}
const {buildMotorLalo}=await import(pathToFileURL(resolve(runtime,'motorLalo.mjs')).href);
function shuffle(arr){
 const a=arr.slice();
 for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
 return a;
}
function uniqueSelection(all){
 const pool=shuffle(all),seen=new Set(),selected=[];
 for(const x of pool)if(selected.length<10&&!x.values.some(v=>seen.has(v))){
  selected.push(x.rank);for(const v of x.values)seen.add(v);
 }
 assert.equal(selected.length,10);
 return selected;
}
function balanced(all){
 const bins=Array.from({length:10},(_,i)=>shuffle(all.filter(x=>x.motherRank===i+1)));
 assert.ok(bins.every(x=>x.length>0));
 const used=new Set();
 const chosen=[];
 function solve(i){
  if(i===10)return true;
  for(const group of bins[i]){
   if(group.values.some(v=>used.has(v)))continue;
   for(const val of group.values)used.add(val);
   chosen.push(group.rank);
   if(solve(i+1))return true;
   chosen.pop();
   for(const val of group.values)used.delete(val);
  }
  return false;
 }
 assert.ok(solve(0),'No existen diez hijas no solapadas de las diez madres');
 return chosen;
}
function buildPool(input){
 const view=buildMotorLalo(input.current,input.date,input.turn,input.history);
 const motherRank=new Map(view.ranks.vt3.map(x=>[x.family,x.rank]));
 return view.ranks.vt4.map(x=>{
  const mother=x.parentFamilies[0];
  assert.equal(x.parentFamilies.length,1);
  return {rank:x.rank,motherRank:motherRank.get(mother),
    values:[...new Set(x.paths.map(p=>p.value))].sort()};
 });
}
function pre(){
 assert.ok(!existsSync(POST));
 assert.ok(!existsSync(FUTURE));
 const input=j(PRE).rows,prior=j(DIR+'PRE_115.json').rows;
 assert.equal(input.length,115);
 const rows=[];
 for(let i=0;i<115;i++){
  const x=input[i],p=prior[i];
  assert.equal(x.date,p.date);assert.equal(x.turn,p.turn);
  assert.equal(x.current.heads[x.turn].length,0);
  const groups=buildPool(x);
  assert.equal(groups.length,p.availableGroups);
  const replicates=Object.fromEntries(modes.map(x=>[x,[]]));
  for(let rep=0;rep<N;rep++){
   replicates.ALEATORIO_UNICO_500.push(uniqueSelection(groups));
   replicates.ALEATORIO_1_POR_MADRE_500.push(balanced(groups));
  }
  rows.push({date:x.date,turn:x.turn,groups,replicates});
 }
 save('CONTROL_PRE.json',{seed:20261013,replicates:N,rows});
 const seal={pre:sha(read(DIR+'CONTROL_PRE.json')),input:sha(read(PRE)),
  code:sha(read('scripts/lab-vt4-controles-neutrales.mjs')),protocol:sha(read(DOC))};
 save('CONTROL_SELLO.json',seal);
 console.log('VT4_CONTROL_PRE_OK',JSON.stringify({cuts:115,rounds:N,bytes:read(DIR+'CONTROL_PRE.json').length,seal}));
}
function pct(a,obs){
 const list=a.slice().sort((x,y)=>x-y);
 return {n:list.length,mean:Number((list.reduce((s,x)=>s+x,0)/list.length).toFixed(3)),
  min:list[0],p05:list[24],median:list[249],p95:list[474],max:list.at(-1),
  benchmark:obs,atLeast:list.filter(x=>x>=obs).length/N};
}
function post(){
 const seal=j(DIR+'CONTROL_SELLO.json');
 for(const [f,digest] of [[DIR+'CONTROL_PRE.json',seal.pre],[PRE,seal.input],
  ['scripts/lab-vt4-controles-neutrales.mjs',seal.code],[DOC,seal.protocol]])
  assert.equal(sha(read(f)),digest);
 const prepared=j(DIR+'CONTROL_PRE.json').rows;
 const goals=j(POST).rows;
 assert.equal(prepared.length,115);assert.equal(goals.length,115);
 const output={};
 for(const mode of modes){
  const hits=Array.from({length:N},()=>({top3:0,top5:0,top10:0}));
  for(let i=0;i<115;i++){
   const pre=prepared[i],o=goals[i];
   assert.equal(pre.date,o.date);assert.equal(pre.turn,o.turn);
   const byRank=new Map(pre.groups.map(g=>[g.rank,g]));
   for(let n=0;n<N;n++){
    const ranks=pre.replicates[mode][n];
    assert.equal(ranks.length,10);
    const groups=ranks.map(rank=>byRank.get(rank));
    assert.ok(groups.every(Boolean));
    const vals=new Set();
    for(const g of groups)for(const v of g.values){assert.ok(!vals.has(v));vals.add(v);}
    for(const limit of [3,5,10])
     hits[n]['top'+limit]+=Number(groups.slice(0,limit).some(g=>g.values.some(x=>o.heads.includes(x))));
   }
  }
  output[mode]={top3:pct(hits.map(x=>x.top3),0),top5:pct(hits.map(x=>x.top5),3),
    top10:pct(hits.map(x=>x.top10),4)};
 }
 save('CONTROL_RESUMEN.json',{date:'2026-10-13',cuts:115,
  modes:output,seal,comparison:{cupo2:{top3:0,top5:0,top10:4},cupo1:{top3:0,top5:3,top10:3}},
  warning:'Control complementario exploratorio iniciado después de observar los resultados de las siete políticas; no es experimento confirmatorio.'});
 console.log('VT4_CONTROLES_POST_OK',JSON.stringify(output,null,2));
}
if(process.argv[2]==='pre')pre();
else if(process.argv[2]==='post')post();
else throw Error('uso pre/post');
