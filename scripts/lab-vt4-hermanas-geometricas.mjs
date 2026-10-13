import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';

const IN='auditorias/vt4-diversidad-madres-top10-115-13oct2026/INPUT_PRE_115.json';
const OLD='auditorias/vt4-diversidad-madres-top10-115-13oct2026/PRE_115.json';
const TARGET='auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const DIR='auditorias/vt4-hermanas-geometricas-115-13oct2026/';
const PROTO='PROTOCOLO_VT4_HERMANAS_GEOMETRICAS_13OCT2026.md';
const SIMPLE=['BASE_CUPO2','MAS_CAMINOS','MAS_FORMAS','CONVERGENCIA','UNICA_FORMA','CONTROL_HASH'];
const MEMORY=['MEMORIA_X_GANADORA','MEMORIA_X_NO_GANADORA'];
const read=p=>readFileSync(p,'utf8'),j=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(f,x)=>writeFileSync(DIR+f,JSON.stringify(x,null,2)+'\n');
const key=x=>x.date+'|'+x.turn;
const uniq=xs=>[...new Set(xs)];
const avg=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
const pt=p=>p.row+':'+p.col;
const bkey=(source,cells)=>source+'|'+cells.map(pt).sort().join(',');
const fshape=cells=>{
 const loR=Math.min(...cells.map(x=>x.row)),loC=Math.min(...cells.map(x=>x.col));
 const normalized=cells.map(c=>(c.row-loR)+':'+(c.col-loC));
 return [normalized.join('>'),normalized.slice().reverse().join('>')].sort()[0];
};
const jaccard=(a,b)=>{
 if(!a.length&&!b.length)return 0;
 const set=new Set(b),common=a.filter(x=>set.has(x)).length;
 return common/(a.length+b.length-common);
};
mkdirSync(DIR,{recursive:true});
const runtime='resultados/runtime-vt4-hermanas';
for(const name of ['domain','dates','paths','sheet','motorLalo']){
 const dest=resolve(runtime,name+'.mjs');mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,stripTypeScriptTypes(read('src/'+name+'.ts')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
}
const {buildMotorLalo}=await import(pathToFileURL(resolve(runtime,'motorLalo.mjs')).href);

function eligible(view){
 const ranks=new Map(view.ranks.vt3.map(x=>[x.family,x.rank]));
 const groups=view.ranks.vt4.map(f=>{
  assert.equal(f.parentFamilies.length,1,'VT4 group has ambiguous mother');
  const mother=f.parentFamilies[0],motherRank=ranks.get(mother);
  assert.ok(motherRank>=1&&motherRank<=10);
  const shapes=uniq(f.paths.map(p=>fshape(p.path))).sort();
  const blocks=uniq(f.paths.map(p=>bkey(p.sourceId,p.path))).sort();
  const routings=uniq(f.paths.map(p=>p.path.slice(1).map((c,i)=>
   [c.row-p.path[i].row,c.col-p.path[i].col].join(':')).join('>'))).sort();
  const values=uniq(f.paths.map(p=>p.value)).sort();
  assert.ok(values.length);
  for(const p of f.paths){
   assert.equal(p.path.length,4);
   assert.equal(uniq(p.path.map(pt)).length,4);
   for(let i=1;i<4;i++)assert.equal(
    Math.max(Math.abs(p.path[i].row-p.path[i-1].row),
             Math.abs(p.path[i].col-p.path[i-1].col)),1);
   assert.equal(p.path.map(x=>x.digit).join(''),p.value);
   assert.ok(p.mothers?.includes(mother));
  }
  return {id:f.rank,family:f.family,mother,motherRank,
   values,rank:f.rank,
   paths:f.paths.length,blocks:blocks.length,sources:f.sourceCount,
   shapes,routings,shapeCount:shapes.length,routeCount:routings.length,
   fractionUnique:shapes.length/f.paths.length,
   // Complete physical evidence for explainer, separately from grouping label.
   witnesses:f.paths.map(p=>({source:p.sourceId,read:p.value,cells:p.path.map(pt),
    shape:fshape(p.path),maternalMother:p.mother}))
  };
 });
 assert.ok(groups.length>=10);
 return groups;
}
function rankScore(g,kind,training){
 if(kind==='MAS_CAMINOS')return [g.paths,g.blocks,g.sources];
 if(kind==='MAS_FORMAS')return [g.shapeCount,g.paths,g.sources];
 if(kind==='CONVERGENCIA')return [g.sources,g.blocks,g.paths];
 if(kind==='UNICA_FORMA')return [g.fractionUnique,g.shapeCount,g.sources];
 if(kind==='CONTROL_HASH')return [0];
 if(kind.startsWith('MEMORIA_')){
  const values=training.map(ex=>jaccard(g.shapes,ex.shapes));
  const sorted=values.sort((a,b)=>b-a);
  return [sorted[0]??0,avg(sorted.slice(0,3))];
 }
 return [0];
}
function sortSiblings(groups,kind,training=[],seed=''){
 if(kind==='BASE_CUPO2')return groups.slice().sort((a,b)=>a.rank-b.rank);
 if(kind==='CONTROL_HASH')return groups.slice().sort((a,b)=>{
  const h1=sha(seed+'|'+a.mother+'|'+a.family+'|'+a.id);
  const h2=sha(seed+'|'+b.mother+'|'+b.family+'|'+b.id);
  return h1.localeCompare(h2)||a.rank-b.rank;
 });
 return groups.slice().sort((a,b)=>{
  const x=rankScore(a,kind,training),y=rankScore(b,kind,training);
  for(let i=0;i<Math.max(x.length,y.length);i++){
   const delta=(y[i]??0)-(x[i]??0);
   if(Math.abs(delta)>1e-10)return delta;
  }
  return a.rank-b.rank;
 });
}
function pickTen(groups,kind,train=[],seed=''){
 const byMother=new Map();
 for(const f of groups)if(f.motherRank<=5){
  if(!byMother.has(f.motherRank))byMother.set(f.motherRank,[]);
  byMother.get(f.motherRank).push(f);
 }
 assert.equal(byMother.size,5,'Could not find five mothers');
 const chosen=[],used=new Set(),collisions=[];
 for(let m=1;m<=5;m++){
  const list=sortSiblings(byMother.get(m),kind,train,seed);
  let n=0;
  for(const g of list){
   if(n===2)break;
   if(g.values.some(v=>used.has(v))){collisions.push(g.family);continue}
   chosen.push(g);
   for(const val of g.values)used.add(val);
   n++;
  }
  assert.equal(n,2,'Two unique-number daughters unavailable for mother #'+m);
 }
 assert.equal(chosen.length,10);
 return {chosen,collisions};
}
function serialize(picked){
 return {top10:picked.chosen.map(x=>({rank:x.rank,motherRank:x.motherRank,family:x.family,
   mother:x.mother,values:x.values,paths:x.paths,shapes:x.shapeCount})),
  exactFour:uniq(picked.chosen.flatMap(x=>x.values)).length,
  chosenMothers:uniq(picked.chosen.map(x=>x.mother)).length,
  siblingsSkippedNumericalCollision:picked.collisions.length};
}
function cohort(date){
 if(date>='2026-09-15'&&date<='2026-09-19')return 'X1';
 if(date>='2026-09-21'&&date<='2026-09-26')return 'Y1';
 if(date>='2026-09-28'&&date<='2026-10-03')return 'Y2';
 if(date>='2026-10-05'&&date<='2026-10-10')return 'Y3';
 throw Error('Uncovered date '+date);
}
function pre(){
 assert.ok(!existsSync(TARGET),'POST visible in PRE');
 assert.ok(!existsSync(FIXTURE),'historical results visible in PRE');
 const raw=j(IN).rows,older=j(OLD).rows;assert.equal(raw.length,115);
 const rows=[];
 for(let i=0;i<115;i++){
  const x=raw[i],reference=older[i];
  assert.equal(key(x),key(reference));
  assert.equal(x.current.heads[x.turn].length,0);
  assert.ok(x.history.every(h=>h.date<x.date));
  const view=buildMotorLalo(x.current,x.date,x.turn,x.history);
  const groups=eligible(view);
  const options=Object.fromEntries(SIMPLE.map(method=>[method,
   serialize(pickTen(groups,method,[],key(x)))]));
  assert.deepEqual(options.BASE_CUPO2.top10.map(x=>x.family),
   reference.options.CUPO_2.ranked.map(x=>x.family),'Baseline reproduction failed '+key(x));
  for(const m of SIMPLE)assert.equal(options[m].top10.length,10);
  const mothers=new Map();
  for(const g of groups.filter(x=>x.motherRank<=5)){
   mothers.set(g.mother,(mothers.get(g.mother)||0)+1);
  }
  rows.push({i,date:x.date,turn:x.turn,cohort:cohort(x.date),
   topMothers:view.ranks.vt3.slice(0,5).map(x=>({family:x.family,rank:x.rank,
    paths:x.paths.length,d1:x.d1Roots,d7:x.d7Roots,branch:x.branchBlocks})),
   physicalGroups:groups,
   top5MotherPhysicalGroups:groups.filter(g=>g.motherRank<=5).length,
   candidateSiblings:Object.fromEntries([...mothers]),
   options});
  if(i%20===19)console.log('VT4_HERMANAS_PRE',i+1);
 }
 save('PRE_115.json',{date:'2026-10-13',rows,
  methods:SIMPLE,controlMemoryModes:MEMORY});
 save('SELLO.json',{engine:sha(read('src/motorLalo.ts')),
  code:sha(read('scripts/lab-vt4-hermanas-geometricas.mjs')),
  protocol:sha(read(PROTO)),source:sha(read(IN)),old:sha(read(OLD)),
  pre:sha(read(DIR+'PRE_115.json')),nCuts:rows.length});
 console.log('VT4_HERMANAS_PRE_OK',JSON.stringify({
  cuts:rows.length,avgPhysicalGroups:avg(rows.map(x=>x.physicalGroups.length)),
  meanSiblingGroups:avg(rows.map(x=>x.top5MotherPhysicalGroups)),
  seal:j(DIR+'SELLO.json')}));
}
function evaluate(option,heads){
 const arr=option.top10;
 const hits=n=>arr.slice(0,n).some(g=>g.values.some(v=>heads.includes(v)));
 return {top3:hits(3),top5:hits(5),top10:hits(10),
  winners:arr.flatMap((g,i)=>g.values.filter(v=>heads.includes(v)).map(v=>
   ({head:v,rank:i+1,family:g.family,mother:g.mother}))),
  countFour:option.exactFour};
}
const stats=(rows,method,base='BASE_CUPO2')=>{
 const v=rows.map(x=>x.methods[method]);
 return {cuts:rows.length,top3:v.filter(x=>x.top3).length,
  top5:v.filter(x=>x.top5).length,top10:v.filter(x=>x.top10).length,
  gains10:rows.filter(x=>x.methods[method].top10&&!x.methods[base].top10).map(key),
  losses10:rows.filter(x=>!x.methods[method].top10&&x.methods[base].top10).map(key),
  gains3:rows.filter(x=>x.methods[method].top3&&!x.methods[base].top3).map(key),
  losses3:rows.filter(x=>!x.methods[method].top3&&x.methods[base].top3).map(key),
  meanExactFour:Math.round(1000*avg(v.map(x=>x.countFour)))/1000};
};
function post(){
 const seal=j(DIR+'SELLO.json');
 for(const [p,s] of [['src/motorLalo.ts',seal.engine],
  ['scripts/lab-vt4-hermanas-geometricas.mjs',seal.code],
  [PROTO,seal.protocol],[IN,seal.source],[OLD,seal.old],
  [DIR+'PRE_115.json',seal.pre]])
  assert.equal(sha(read(p)),s,'PRE altered '+p);
 const pre=j(DIR+'PRE_115.json').rows,goals=j(TARGET).rows;
 assert.equal(pre.length,115);assert.equal(goals.length,115);
 const byKey=new Map(pre.map((x,i)=>[key(x),goals[i].heads]));
 assert.equal(byKey.size,115);
 const rows=pre.map((r,i)=>{
  const target=goals[i];
  assert.equal(key(target),key(r));
  assert.equal(target.heads.length,5);
  return {date:r.date,turn:r.turn,cohort:r.cohort,heads:target.heads,
   methods:Object.fromEntries(SIMPLE.map(method=>[method,
    evaluate(r.options[method],target.heads)]))};
 });
 // Memory X teacher may use only known winning real VT4 groups from X,
 // never a group labelled positive in the target X+1.
 const transitions=[
  {label:'15-19sep_TO_21-26sep',train:'X1',test:'Y1'},
  {label:'21-26sep_TO_28sep-03oct',train:'Y1',test:'Y2'},
  {label:'28sep-03oct_TO_05-10oct',train:'Y2',test:'Y3'}
 ];
 const memoryDetails=[];
 for(const t of transitions){
  const sample=pre.filter(r=>r.cohort===t.train),test=pre.filter(r=>r.cohort===t.test);
  assert.ok(sample.length===25||sample.length===30);
  assert.equal(test.length,30);
  assert.ok(sample.at(-1).i<test[0].i,'Train must precede test');
  const positives=[],negatives=[];
  for(const entry of sample){
   const target=byKey.get(key(entry));
   for(const g of entry.physicalGroups.filter(g=>g.motherRank<=5)){
    const token={shapes:g.shapes,motherRank:g.motherRank,date:entry.date,turn:entry.turn,
     family:g.family,rank:g.rank};
    if(g.values.some(v=>target.includes(v)))positives.push(token);
    else negatives.push(token);
   }
  }
  for(const record of test){
   const rr=rows[record.i];
   assert.equal(key(record),key(rr));
   for(const [method,bank] of [
    ['MEMORIA_X_GANADORA',positives],
    ['MEMORIA_X_NO_GANADORA',negatives]
   ]){
    const option=serialize(pickTen(record.physicalGroups,method,bank,key(record)));
    rr.methods[method]=evaluate(option,rr.heads);
    rr.methods[method].top10Groups=option.top10.map(x=>x.family);
   }
  }
  memoryDetails.push({transition:t.label,
   trainCuts:sample.length,testCuts:test.length,
   winnerExampleGroups:positives.length,nonWinnerExampleGroups:negatives.length,
   distinctWinnerShapes:uniq(positives.flatMap(x=>x.shapes)).length,
   trainedPositiveHeads:uniq(positives.map(x=>x.date+'|'+x.turn+'|'+x.family)).length});
 }
 const total=Object.fromEntries(SIMPLE.map(m=>[m,stats(rows,m)]));
 const exam=rows.filter(r=>r.cohort!=='X1');
 const examStats=Object.fromEntries([...SIMPLE,...MEMORY].map(m=>[m,stats(exam,m)]));
 const byWeek=Object.fromEntries(['Y1','Y2','Y3'].map(w=>[w,Object.fromEntries(
  [...SIMPLE,...MEMORY].map(m=>[m,stats(rows.filter(r=>r.cohort===w),m)]))]));
 const availableWins=pre.map((r,i)=>{
  const target=goals[i].heads;
  const all=r.physicalGroups.filter(g=>g.motherRank<=5);
  const physicalCount=uniq(all.flatMap(g=>g.values)).filter(v=>target.includes(v)).length;
  const groups=all.filter(g=>g.values.some(v=>target.includes(v)));
  const winners=uniq(groups.flatMap(g=>g.values.filter(v=>target.includes(v))));
  return {date:r.date,turn:r.turn,physicalWinningNumbers:winners,
   physicalGroupCount:groups.length,
   nPhysicalSiblings:all.length,
   capturedByBase:rows[i].methods.BASE_CUPO2.top10,
   missed:groups.filter(g=>!r.options.BASE_CUPO2.top10.some(x=>x.rank===g.rank))
     .map(g=>({family:g.family,mother:g.mother,motherRank:g.motherRank,
      values:g.values.filter(v=>target.includes(v)),paths:g.paths,shapeCount:g.shapeCount,
      rank:g.rank}))};
 });
 const opportunities=availableWins.filter(r=>r.physicalWinningNumbers.length);
 save('POST_115.json',{rows});
 save('RESUMEN.json',{date:'2026-10-13',cuts:115,examCuts:exam.length,
  total,exam:examStats,byWeek,memoryTraining:memoryDetails,
  opportunities:{
   cutsWithWinningVT4WithinTop5Mothers:opportunities.length,
   totalWinnerNumbersPhysical:availableWins.reduce((s,r)=>s+r.physicalWinningNumbers.length,0),
   physicalWinningGroupExposures:availableWins.reduce((s,r)=>s+r.physicalGroupCount,0),
   examples:opportunities
  },seal,
  warning:'Los sorteos son aleatorios; este corpus es fuertemente exploratorio. Memoria X entrenada únicamente sobre días anteriores a los cortes evaluados.'});
 console.log('VT4_HERMANAS_POST_OK',JSON.stringify({
  total,exam:examStats,memoryTraining:memoryDetails,
  physicalOpportunities:opportunities.map(x=>({date:x.date,turn:x.turn,
   winners:x.physicalWinningNumbers,missed:x.missed,base:x.capturedByBase}))
 },null,2));
}
if(process.argv[2]==='pre')pre();
else if(process.argv[2]==='post')post();
else throw Error('Usar pre|post');
