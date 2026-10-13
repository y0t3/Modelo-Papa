import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const SRC='auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/';
const OUT='auditorias/vt3-control-tercer-puesto-90-13oct2026/';
const DOC='PROTOCOLO_VT3_CONTROL_TERCER_PUESTO_13OCT2026.md';
const PRE_HASH='42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e';
const SAMPLE=5000,SEED=20261013;
const METHODS=['APRENDIDO','RANGO11','HASH_FIJO','RECUENTO_RUTAS'];
const SOURCE_BASE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const read=f=>readFileSync(f,'utf8'),parse=f=>JSON.parse(read(f));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(f,x)=>writeFileSync(OUT+f,JSON.stringify(x,null,2)+'\n');
const id=r=>r.date+'|'+r.turn;
const fam=h=>{assert.match(h,/^\d{4}$/);const s=h.slice(-3);return[s,[...s].reverse().join('')].sort().join('/')};
const unique=a=>[...new Set(a)];
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const bucket=n=>n<=1?'1':n<=3?'2-3':n<=7?'4-7':'8+';
function random(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;}}
mkdirSync(OUT,{recursive:true});
function prepare(){
 assert.equal(sha(read(SRC+'PRE_115.json')),PRE_HASH);
 for(const p of [SRC+'POST_115.json',SRC+'RESUMEN.json',SOURCE_BASE+'POST_115.json'])
  assert.ok(!existsSync(p),'Los datos POST no están aislados: '+p);
 const source=parse(SRC+'PRE_115.json');
 assert.equal(source.rows.length,115);assert.equal(source.weeks.length,4);
 const lastWeeks=new Set(source.weeks.slice(1));
 const test=source.rows.filter(r=>lastWeeks.has(r.week));
 assert.equal(test.length,90);
 const dates=unique(test.map(r=>r.date));
 assert.equal(dates.length,18);
 const rows=test.map(r=>{
  const orig=r.original,origSet=new Set(orig);
  assert.equal(orig.length,10);assert.equal(origSet.size,10);
  const outside=r.profiles.filter(p=>!origSet.has(p.family)).map(p=>{
   const routeCount=p.geo.abs.length;
   assert.ok(routeCount>0);
   return {family:p.family,rooted:p.rooted,rank:p.originalRank,
    routeCount,routeBin:bucket(routeCount),
    shapeCount:p.geo.shapes.length,
    sourceShapeCount:p.geo.sameSource.length,
    rootD1:p.rooted?p.feat[2]:0,rootD7:p.rooted?p.feat[3]:0};
  });
  assert.ok(outside.length>10);
  assert.ok(outside.some(p=>p.rooted));
  assert.ok(outside.some(p=>!p.rooted));
  return {date:r.date,turn:r.turn,week:r.week,
   originalTop:orig,outsiders:outside,
   outsiderCount:outside.length,
   rootedCount:outside.filter(p=>p.rooted).length,
   unrootedCount:outside.filter(p=>!p.rooted).length};
 });
 const perCut={seed:SEED,samples:SAMPLE,controls:[
  'AZAR_FISICO','AZAR_MISMA_ADMISION','AZAR_MISMA_ADMISION_Y_RUTAS'
 ],selectionRule:'For replicate r, cutoff i, use deterministic seeded xorshift32 uniform draws in order: all, sameAdmission, sameAdmissionRouteBin. Both matched categories are attributes of the frozen model proposal, not future result.',poolRule:'All candidates physically present but excluded from the original ten VT3 families.'};
 save('PRE_90.json',{dates,weeks:source.weeks.slice(1),rows,
  note:'Sólo familias y atributos PRE. Nada de cabezas futuras ni de decisión del alumno anterior en fase PRE.'});
 save('CONTROLES_PRE.json',perCut);
 const seal={input:PRE_HASH,code:sha(read('scripts/lab-vt3-control-tercer-puesto.mjs')),
  protocol:sha(read(DOC)),pre:sha(read(OUT+'PRE_90.json')),
  controls:sha(read(OUT+'CONTROLES_PRE.json'))};
 save('SELLO.json',seal);
 console.log('VT3_TERCER_PUESTO_PRE_OK',JSON.stringify({cuts:rows.length,dates:dates.length,
  outsiderMean:avg(rows.map(x=>x.outsiderCount)),
  rootMean:avg(rows.map(x=>x.rootedCount)),seal}));
}
function assess(list,winning){
 return {top3:list.slice(0,3).some(f=>winning.has(f)),
  top5:list.slice(0,5).some(f=>winning.has(f)),
  top10:list.some(f=>winning.has(f)),
  winningInThird:winning.has(list[2]),
  wins:list.filter(f=>winning.has(f))};
}
function sampleOne(pool,u){assert.ok(pool.length>0);return pool[Math.floor(u*pool.length)];}
function compose(original,proposal){
 assert.ok(original.length===10);
 assert.ok(!original.includes(proposal),'Nueva candidata dentro del Top original');
 return [...original.slice(0,2),proposal,...original.slice(2,9)];
}
function evaluate(){
 const seal=parse(OUT+'SELLO.json');
 for(const [file,expected] of [[SRC+'PRE_115.json',seal.input],
  ['scripts/lab-vt3-control-tercer-puesto.mjs',seal.code],
  [DOC,seal.protocol],[OUT+'PRE_90.json',seal.pre],
  [OUT+'CONTROLES_PRE.json',seal.controls]])
  assert.equal(sha(read(file)),expected,'Sello alterado: '+file);
 const pre=parse(OUT+'PRE_90.json'),controls=parse(OUT+'CONTROLES_PRE.json');
 assert.equal(controls.samples,SAMPLE);assert.equal(controls.seed,SEED);
 const frozen=parse(SRC+'POST_115.json');
 assert.equal(frozen.rows.length,90);
 const originalOutcomes=parse(SOURCE_BASE+'POST_115.json').rows;
 const targetMap=new Map(originalOutcomes.map(r=>[id(r),r.targets]));
 assert.equal(targetMap.size,115);
 const frozenMap=new Map(frozen.rows.map(r=>[id(r),r]));
 assert.equal(frozenMap.size,90);
 const rows=pre.rows.map(p=>{
  const learned=frozenMap.get(id(p));assert.ok(learned);
  assert.equal(learned.week,p.week);
  assert.deepEqual(learned.method.OFICIAL.top10,p.originalTop,'Top oficial alterado');
  const newThird=learned.method.FUSION_CONSERVADORA.top10[2];
  const candidate=p.outsiders.find(x=>x.family===newThird);
  assert.ok(candidate,'Aprendiz había elegido una familia presente entre diez originales o ausente de inventario: '+newThird);
  const recomposed=compose(p.originalTop,newThird);
  assert.deepEqual(recomposed,learned.method.FUSION_CONSERVADORA.top10,'Regla real de fusión distinta del protocolo');
  const targets=targetMap.get(id(p));assert.ok(targets?.length===5);
  const winning=new Set(targets.map(fam));
  assert.equal(assess(recomposed,winning).top3,learned.method.FUSION_CONSERVADORA.hit3);
  assert.equal(assess(recomposed,winning).top10,learned.method.FUSION_CONSERVADORA.hit10);
  const deterministic={
   APRENDIDO:newThird,
   RANGO11:p.outsiders.filter(x=>x.rooted).sort((a,b)=>a.rank-b.rank)[0].family,
   HASH_FIJO:p.outsiders.slice().sort((a,b)=>
    sha('20261013|'+p.date+'|'+p.turn+'|'+a.family).localeCompare(
    sha('20261013|'+p.date+'|'+p.turn+'|'+b.family)))[0].family,
   RECUENTO_RUTAS:p.outsiders.slice().sort((a,b)=>
    b.routeCount-a.routeCount||Number(b.rooted)-Number(a.rooted)||
    (a.rank??9999)-(b.rank??9999)||a.family.localeCompare(b.family))[0].family
  };
  const scores=Object.fromEntries(METHODS.map(method=>{
   const family=deterministic[method];
   return [method,{chosen:family,selected:p.outsiders.find(x=>x.family===family),
    ...assess(compose(p.originalTop,family),winning)}];
  }));
  const proposedBinPool=p.outsiders.filter(x=>x.rooted===candidate.rooted&&x.routeBin===candidate.routeBin);
  const matchedPool=p.outsiders.filter(x=>x.rooted===candidate.rooted);
  assert.ok(proposedBinPool.length>=1&&matchedPool.length>=1);
  const extraWinners=p.outsiders.filter(x=>winning.has(x.family));
  const base=assess(p.originalTop,winning);
  return {...p,
   learnedThird:candidate,selectedFamilyThird:newThird,
   proposedAdmissionCount:matchedPool.length,proposedBinCount:proposedBinPool.length,
   resultHeads:targets,winningOutsideTop:extraWinners.map(x=>x.family),
   baseline:base,scores,
   exactPhysicalSuccessProb:extraWinners.length/p.outsiders.length,
   conditionalAdmissionSuccessProb:matchedPool.filter(x=>winning.has(x.family)).length/matchedPool.length,
   conditionalBinSuccessProb:proposedBinPool.filter(x=>winning.has(x.family)).length/proposedBinPool.length};
 });
 assert.equal(rows.length,90);
 const statistics=method=>{
  const gain3=rows.filter(r=>r.scores[method].top3&&!r.baseline.top3).map(id);
  const loss3=rows.filter(r=>!r.scores[method].top3&&r.baseline.top3).map(id);
  const gain10=rows.filter(r=>r.scores[method].top10&&!r.baseline.top10).map(id);
  const loss10=rows.filter(r=>!r.scores[method].top10&&r.baseline.top10).map(id);
  return {top3:rows.filter(r=>r.scores[method].top3).length,
   top5:rows.filter(r=>r.scores[method].top5).length,
   top10:rows.filter(r=>r.scores[method].top10).length,
   selectedWinnerExposures:rows.filter(r=>r.scores[method].winningInThird).length,
   gainsTop3:gain3,lossesTop3:loss3,gainsTop10:gain10,lossesTop10:loss10};
 };
 const score=Object.fromEntries(METHODS.map(x=>[x,statistics(x)]));
 const baseline={
  top3:rows.filter(x=>x.baseline.top3).length,
  top5:rows.filter(x=>x.baseline.top5).length,
  top10:rows.filter(x=>x.baseline.top10).length};
 assert.deepEqual(baseline,{top3:3,top5:6,top10:11});
 assert.deepEqual([score.APRENDIDO.top3,score.APRENDIDO.top10],[4,12]);
 // Neutral sampling: first 2 and all subsequent rank 3-9 official families identical.
 // Every control is computed with fixed PRE-sealed RNG, but the original model's
 // admission/route class is only accessed after its frozen selection was validated.
 const rand=random(SEED),distributions={
  AZAR_FISICO:[],AZAR_MISMA_ADMISION:[],AZAR_MISMA_ADMISION_Y_RUTAS:[]
 };
 for(let t=0;t<SAMPLE;t++){
  const state=Object.fromEntries(Object.keys(distributions).map(k=>[k,{top3:0,top5:0,top10:0,thirdWinning:0}]));
  for(const row of rows){
   const goal=new Set(row.resultHeads.map(fam));
   const group={
    AZAR_FISICO:row.outsiders,
    AZAR_MISMA_ADMISION:row.outsiders.filter(c=>c.rooted===row.learnedThird.rooted),
    AZAR_MISMA_ADMISION_Y_RUTAS:row.outsiders.filter(c=>
     c.rooted===row.learnedThird.rooted&&c.routeBin===row.learnedThird.routeBin)
   };
   for(const method of Object.keys(distributions)){
    const chosen=sampleOne(group[method],rand()).family;
    const assessed=assess(compose(row.originalTop,chosen),goal);
    const s=state[method];
    s.top3+=Number(assessed.top3);s.top5+=Number(assessed.top5);
    s.top10+=Number(assessed.top10);s.thirdWinning+=Number(assessed.winningInThird);
   }
  }
  for(const method of Object.keys(distributions))distributions[method].push(state[method]);
 }
 function distribution(samples,metric,actual){
  const vals=samples.map(x=>x[metric]).sort((a,b)=>a-b);
  return {n:vals.length,mean:Number(avg(vals).toFixed(5)),
   min:vals[0],p05:vals[249],median:vals[2499],p95:vals[4749],max:vals.at(-1),
   observed:actual,fractionAtLeastObserved:vals.filter(x=>x>=actual).length/vals.length,
   histogram:Object.fromEntries(unique(vals).map(x=>[String(x),vals.filter(y=>y===x).length]))};
 }
 const neutral=Object.fromEntries(Object.entries(distributions).map(([k,v])=>
  [k,{top3:distribution(v,'top3',score.APRENDIDO.top3),
   top10:distribution(v,'top10',score.APRENDIDO.top10),
   thirdWinners:distribution(v,'thirdWinning',score.APRENDIDO.selectedWinnerExposures)}]));
 const exactExpectation={
  neutralPhysicalExpectedThirdWinners:rows.reduce((s,r)=>s+r.exactPhysicalSuccessProb,0),
  neutralSameAdmissionExpectedThirdWinners:rows.reduce((s,r)=>s+r.conditionalAdmissionSuccessProb,0),
  neutralSameAdmissionAndBinExpectedThirdWinners:rows.reduce((s,r)=>s+r.conditionalBinSuccessProb,0),
  cutsWithOutsideWinningFamily:rows.filter(r=>r.winningOutsideTop.length).length,
  winnerExposuresOutside:rows.reduce((s,r)=>s+r.winningOutsideTop.length,0),
  meanOutsiders:avg(rows.map(r=>r.outsiderCount)),
  learnedRootedCount:rows.filter(r=>r.learnedThird.rooted).length,
  learnedUnrootedCount:rows.filter(r=>!r.learnedThird.rooted).length,
  singletonAdmissionBins:rows.filter(r=>r.proposedBinCount===1).length
 };
 const selectedFamilyFreq=Object.entries(rows.reduce((dict,r)=>{
  const f=r.selectedFamilyThird;dict[f]=(dict[f]||0)+1;return dict;
 },{})).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 const distributionByMonth=Object.fromEntries(unique(rows.map(r=>r.date.slice(0,7))).map(month=>
  [month,Object.fromEntries(METHODS.map(method=>[method,{
   cuts:rows.filter(r=>r.date.startsWith(month)).length,
   top3:rows.filter(r=>r.date.startsWith(month)&&r.scores[method].top3).length,
   top10:rows.filter(r=>r.date.startsWith(month)&&r.scores[method].top10).length
  }]))]));
 const distributionByWeek=Object.fromEntries(unique(rows.map(r=>r.week)).map(week=>
  [week,Object.fromEntries(METHODS.map(method=>[method,{
   cuts:rows.filter(r=>r.week===week).length,
   top3:rows.filter(r=>r.week===week&&r.scores[method].top3).length,
   top10:rows.filter(r=>r.week===week&&r.scores[method].top10).length
  }]))]));
 const examples=rows.filter(x=>x.scores.APRENDIDO.winningInThird).map(r=>({
  date:r.date,turn:r.turn,heads:r.resultHeads,
  firstTwo:r.originalTop.slice(0,2),thirdOld:r.originalTop[2],
  thirdLearned:r.learnedThird,
  extraWinners:r.winningOutsideTop,outsiders:r.outsiderCount,
  rootedOutsiders:r.rootedCount,matchedAdmission:r.proposedAdmissionCount,
  matchedBin:r.proposedBinCount,
  controlRank11:r.scores.RANGO11,
  controlHash:r.scores.HASH_FIJO,
  controlRoutes:r.scores.RECUENTO_RUTAS
 }));
 // Permute complete days, preserving all five jurisdictions/heads inside each turn.
 const dates=unique(rows.map(r=>r.date)).sort();assert.equal(dates.length,18);
 const lookup=new Map(rows.map(r=>[id(r),r]));assert.equal(lookup.size,90);
 const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
 for(const d of dates)assert.ok(TURNS.every(t=>lookup.has(d+'|'+t)));
 const table=Array.from({length:18},()=>Array(18).fill(0));
 for(let i=0;i<18;i++)for(let j=0;j<18;j++)for(const t of TURNS){
  const proposed=lookup.get(dates[i]+'|'+t),target=lookup.get(dates[j]+'|'+t);
  const heads=new Set(target.resultHeads.map(fam));
  table[i][j]+=Number(assess(compose(proposed.originalTop,proposed.selectedFamilyThird),heads).top3)-
    Number(assess(proposed.originalTop,heads).top3);
 }
 const identity=dates.map((_,i)=>i);
 assert.equal(identity.reduce((s,j,i)=>s+table[i][j],0),1);
 const groups=new Map();
 dates.forEach((d,i)=>{const w=new Date(d+'T12:00:00Z').getUTCDay();
  if(!groups.has(w))groups.set(w,[]);groups.get(w).push(i)});
 const permutations={};
 for(const [n,[name,cohorts]] of Object.entries({free:[identity],sameWeekday:[...groups.values()]}).entries()){
  const R=random(SEED+53*n),N=10000,values=[];
  for(let trial=0;trial<N;trial++){
   const perm=[...identity];
   for(const group of cohorts){
    const temp=group.map(i=>perm[i]);
    for(let k=temp.length-1;k>0;k--){const j=Math.floor(R()*(k+1));[temp[j],temp[k]]=[temp[k],temp[j]];}
    group.forEach((i,j)=>perm[i]=temp[j]);
   }
   values.push(perm.reduce((s,j,i)=>s+table[i][j],0));
  }
  const sorted=values.slice().sort((a,b)=>a-b);
  permutations[name]={observedDelta:1,mean:Number(avg(values).toFixed(4)),
   p05:sorted[499],median:sorted[4999],p95:sorted[9499],
   upperTail:(1+values.filter(x=>x>=1).length)/(N+1),
   fractionExact1:values.filter(x=>x===1).length/N};
 }
 // Report compact per-cut data without repeating all unrelated physical paths.
 const observed=rows.map(r=>({
  date:r.date,turn:r.turn,week:r.week,originalTop:r.originalTop,
  learnedThird:r.learnedThird,rootedOutsiders:r.rootedCount,
  physicalOutsiders:r.outsiderCount,matchedAdmission:r.proposedAdmissionCount,
  matchedBin:r.proposedBinCount,heads:r.resultHeads,
  outsideWinners:r.winningOutsideTop,baseline:r.baseline,
  scores:r.scores,exactProbabilities:{
   all:r.exactPhysicalSuccessProb,
   admission:r.conditionalAdmissionSuccessProb,
   bin:r.conditionalBinSuccessProb}
 }));
 save('POST_90.json',{rows:observed});
 const report={date:'2026-10-13',cuts:90,days:18,
  baseline,methods:score,matchedNeutralControls:neutral,
  exactExpectation,selectedFamilyFrequency:selectedFamilyFreq,
  byMonth:distributionByMonth,byWeek:distributionByWeek,
  gainedThirdExamples:examples,permutationControls:permutations,
  originalScriptFrozen:sha(read('scripts/lab-vt3-dominio-semanal.mjs')),
  frozenModelPost:sha(read(SRC+'POST_115.json')),
  originalHeadsPost:sha(read(SOURCE_BASE+'POST_115.json')),
  seal,
  warning:'Control retrospectivo sobre las mismas fechas muy exploradas. El resultado de una cabeza aleatoria no está determinado por raíces ni por similitud. Un reemplazo ganador no demuestra ventaja futura.'};
 save('RESUMEN.json',report);
 console.log('VT3_TERCER_PUESTO_POST_OK',JSON.stringify({
  baseline,methods:score,expectation:exactExpectation,
  neutral:Object.fromEntries(Object.entries(neutral).map(([k,v])=>[k,{
   top3:v.top3,top10:v.top10,thirdWinners:v.thirdWinners
  }])),examples,permutations,repeatFamilies:selectedFamilyFreq.slice(0,10)
 },null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')evaluate();
else throw Error('Uso: pre|post');
