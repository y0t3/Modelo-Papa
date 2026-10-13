import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const SRC='auditorias/vt3-diversidad-antecedentes-115-13oct2026/';
const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const DEST='auditorias/vt3-replay-cronologico-115-13oct2026/';
const PROTOCOL='PROTOCOLO_VT3_REPLAY_CRONOLOGICO_13OCT2026.md';
const SOURCE_SHA='b190ed0a4715220501f564dee3300264c32efeccef7bc49fbfb1dee10999908e';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const BASEPOLICIES=['OFICIAL','COB20_P3','COB20_P5','CONTROL_MAS_EVENTOS_20','COND5','COND6'];
const LEARNING=['OFICIAL','COB20_P3','CONTROL_MAS_EVENTOS_20'];
const REPLAYS=[{name:'FWD7_EXP',start:7,rolling:false},{name:'FWD7_ROLL',start:7,rolling:true},
 {name:'FWD10_EXP',start:10,rolling:false}];
const read=f=>readFileSync(f,'utf8'),load=f=>JSON.parse(read(f));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(f,obj)=>writeFileSync(DEST+f,JSON.stringify(obj,null,2)+'\n');
const rowkey=r=>r.date+'|'+r.turn;
const family=h=>{assert.match(h,/^\d{4}$/);const t=h.slice(-3);
 return [t,[...t].reverse().join('')].sort().join('/')};
const average=xs=>xs.length?xs.reduce((s,x)=>s+x,0)/xs.length:null;
function random(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}};
mkdirSync(DEST,{recursive:true});
function pre(){
 assert.ok(!existsSync(SRC+'POST_115.json'));
 assert.ok(!existsSync(SRC+'RESUMEN.json'));
 assert.ok(!existsSync(ROOT+'POST_115.json'));
 assert.equal(sha(read(SRC+'PRE_115.json')),SOURCE_SHA);
 const raw=load(SRC+'PRE_115.json');
 const days=raw.days;
 assert.equal(days.length,23);assert.deepEqual(days,[...days].sort());
 assert.equal(raw.rows.length,115);
 const out=[];
 for(let i=0;i<raw.rows.length;i++){
  const r=raw.rows[i],date=days[Math.floor(i/5)],turn=TURNS[i%5];
  assert.equal(r.date,date);assert.equal(r.turn,turn);
  const original=r.choices.OFICIAL;
  const maxShare=original.metrics.maxFamiliesSharingOneEvent;
  assert.ok(Number.isInteger(maxShare)&&maxShare>=1&&maxShare<=10);
  const fixed=Object.fromEntries(BASEPOLICIES.slice(0,4).map(m=>[m,r.choices[m].families]));
  fixed.COND5=maxShare>=5?fixed.COB20_P3:fixed.OFICIAL;
  fixed.COND6=maxShare>=6?fixed.COB20_P3:fixed.OFICIAL;
  for(const [name,top] of Object.entries(fixed)){
   assert.equal(top.length,10);
   assert.equal(new Set(top).size,10);
   assert.deepEqual(top.slice(0,3),fixed.OFICIAL.slice(0,3));
  }
  const own={
   date,turn,baselineRootEvents:original.metrics.uniqueRootEvents,
   originalMaxRootShare:maxShare,originalRootHHI:original.metrics.HHI,
   diversityRootEvents:r.choices.COB20_P3.metrics.uniqueRootEvents,
   diversityMaxRootShare:r.choices.COB20_P3.metrics.maxFamiliesSharingOneEvent,
   diversityRootHHI:r.choices.COB20_P3.metrics.HHI,
   rankedCandidateCount:r.originalCandidateCount,
   top:fixed,
   changedNames:fixed.COB20_P3.filter(x=>!fixed.OFICIAL.includes(x)),
   droppedNames:fixed.OFICIAL.filter(x=>!fixed.COB20_P3.includes(x))
  };
  out.push(own);
 }
 save('PRE_REPLAY_115.json',{date:'2026-10-13',days,turns:TURNS,
  policies:BASEPOLICIES,learnChoices:LEARNING,replays:REPLAYS,rows:out,
  note:'Exclusivamente listas y métricas PRE; ningún resultado objetivo de fecha futura.'});
 const seal={sourcePre:SOURCE_SHA,protocol:sha(read(PROTOCOL)),
  code:sha(read('scripts/lab-vt3-replay-cronologico.mjs')),
  pre:sha(read(DEST+'PRE_REPLAY_115.json'))};
 save('SELLO.json',seal);
 console.log('VT3_REPLAY_PRE_OK',JSON.stringify({days:days.length,cuts:out.length,
  high5:out.filter(x=>x.originalMaxRootShare>=5).length,
  high6:out.filter(x=>x.originalMaxRootShare>=6).length,seal}));
}
function confirm(){
 const s=load(DEST+'SELLO.json');
 assert.equal(s.sourcePre,sha(read(SRC+'PRE_115.json')));
 assert.equal(s.protocol,sha(read(PROTOCOL)));
 assert.equal(s.code,sha(read('scripts/lab-vt3-replay-cronologico.mjs')));
 assert.equal(s.pre,sha(read(DEST+'PRE_REPLAY_115.json')));
 return s;
}
function after(){
 const seal=confirm();
 const meta=load(DEST+'PRE_REPLAY_115.json'),pre=meta.rows,post=load(ROOT+'POST_115.json').rows;
 assert.equal(pre.length,115);assert.equal(post.length,115);
 const days=meta.days;
 const targets=post.map((r,i)=>{assert.equal(rowkey(r),rowkey(pre[i]));
  assert.equal(r.targets.length,5);return new Set(r.targets.map(family));});
 const ownHits=pre.map((r,i)=>Object.fromEntries(BASEPOLICIES.map(p=>{
  const arr=r.top[p],g=targets[i];
  return [p,{top3:arr.slice(0,3).some(f=>g.has(f)),
    top5:arr.slice(0,5).some(f=>g.has(f)),top10:arr.some(f=>g.has(f)),
    families:arr.filter(f=>g.has(f))}];
 })));
 function summary(indices,method){
  const indicesX=indices||pre.map((_,i)=>i);
  const chosen=indicesX.map(i=>ownHits[i][method]);
  return {cuts:chosen.length,top3:chosen.filter(v=>v.top3).length,
   top5:chosen.filter(v=>v.top5).length,
   top10:chosen.filter(v=>v.top10).length};
 }
 const all=Object.fromEntries(BASEPOLICIES.map(m=>[m,summary(null,m)]));
 assert.deepEqual([all.OFICIAL.top3,all.OFICIAL.top5,all.OFICIAL.top10],[5,8,15]);
 assert.equal(all.COB20_P3.top10,17);
 assert.equal(all.CONTROL_MAS_EVENTOS_20.top10,17);
 const changes=Object.fromEntries(BASEPOLICIES.slice(1).map(p=>{
  const added=[],lost=[];
  for(let i=0;i<115;i++){
   if(ownHits[i][p].top10&&!ownHits[i].OFICIAL.top10)added.push(rowkey(pre[i]));
   if(!ownHits[i][p].top10&&ownHits[i].OFICIAL.top10)lost.push(rowkey(pre[i]));
  }
  return [p,{added,lost,net:added.length-lost.length}];
 }));
 const turnStats=Object.fromEntries(TURNS.map(t=>[t,
  Object.fromEntries(BASEPOLICIES.map(m=>[m,summary(pre.map((r,i)=>r.turn===t?i:null).filter(x=>x!==null),m)]))]));
 const monthStats=Object.fromEntries([...new Set(days.map(d=>d.slice(0,7)))].map(month=>[month,
  Object.fromEntries(BASEPOLICIES.map(m=>[m,summary(pre.map((r,i)=>r.date.startsWith(month)?i:null).filter(x=>x!==null),m)]))]));
 const blocks=Array.from({length:4},(_,n)=>{
  const dateStart=n*6,dateEnd=Math.min(23,(n+1)*6);
  const indices=pre.map((r,i)=>Math.floor(i/5)>=dateStart&&Math.floor(i/5)<dateEnd?i:null).filter(x=>x!==null);
  return {start:days[dateStart],end:days[dateEnd-1],
   counts:Object.fromEntries(BASEPOLICIES.map(m=>[m,summary(indices,m)]))};
 });
 const concentration={};
 for(const threshold of [5,6]){
  const hi=pre.map((r,i)=>r.originalMaxRootShare>=threshold?i:null).filter(x=>x!==null);
  const lo=pre.map((r,i)=>r.originalMaxRootShare<threshold?i:null).filter(x=>x!==null);
  const summarizeGroup=x=>({
   cuts:x.length,
   official:summary(x,'OFICIAL'),
   diversity:summary(x,'COB20_P3'),
   abundance:summary(x,'CONTROL_MAS_EVENTOS_20'),
   condition:summary(x,'COND'+threshold),
   originalConcentrationMean:average(x.map(i=>pre[i].originalMaxRootShare)),
   meanEventIncrease:average(x.map(i=>pre[i].diversityRootEvents-pre[i].baselineRootEvents)),
   meanChangedFamilies:average(x.map(i=>pre[i].changedNames.length))
  });
  concentration[threshold]={high:summarizeGroup(hi),low:summarizeGroup(lo)};
 }
 // y[date][turn][policy] can be reassigned to any target day while maintaining
 // actual same-turn targets together in five-jurisdiction result bundles.
 const matrix=Array.from({length:23},()=>Array.from({length:23},()=>Array.from({length:5},()=>({}))));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(let t=0;t<5;t++){
  const src=pre[i*5+t],goal=targets[j*5+t];
  for(const m of BASEPOLICIES)
   matrix[i][j][t][m]=Number(src.top[m].some(f=>goal.has(f)));
 }
 const natural=days.map((_,i)=>i);
 function dayValues(assigned){
  return assigned.map((j,i)=>BASEPOLICIES.reduce((acc,m)=>{
   acc[m]=TURNS.reduce((s,_,t)=>s+matrix[i][j][t][m],0);
   return acc;
  },{}));
 }
 function decision(training,through,span){
  assert.ok(through>=7);
  const from=span?through-span:0;
  assert.ok(from>=0);
  const totals=Object.fromEntries(LEARNING.map(m=>[m,0]));
  for(let i=from;i<through;i++)for(const m of LEARNING)totals[m]+=training[i][m];
  const winner=LEARNING.slice().sort((a,b)=>totals[b]-totals[a]||LEARNING.indexOf(a)-LEARNING.indexOf(b))[0];
  return {policy:winner,trainingFrom:from,trainingToExclusive:through,
   scoreKnownFromPast:totals};
 }
 function play(order,config,includeDetail=false){
  const daily=dayValues(order),decisionRows=[];
  const counts={replay:0,official:0,diversity:0,abundance:0};
  for(let dateIdx=config.start;dateIdx<23;dateIdx++){
   const selection=decision(daily,dateIdx,config.rolling?7:null);
   const chosen=selection.policy;
   counts.replay+=daily[dateIdx][chosen];
   counts.official+=daily[dateIdx].OFICIAL;
   counts.diversity+=daily[dateIdx].COB20_P3;
   counts.abundance+=daily[dateIdx].CONTROL_MAS_EVENTOS_20;
   if(includeDetail){
    decisionRows.push({targetDate:days[dateIdx],testDayIndex:dateIdx,
     ...selection,
     actualPolicyScorePost:daily[dateIdx][chosen],
     comparatorPost:{official:daily[dateIdx].OFICIAL,
      diversity:daily[dateIdx].COB20_P3,
      abundance:daily[dateIdx].CONTROL_MAS_EVENTOS_20},
     selectedFiveTurnTops:TURNS.map((turn,t)=>({
      turn,families:pre[dateIdx*5+t].top[chosen]}))
    });
   }
  }
  return {counts,deltaVsOfficial:counts.replay-counts.official,
   deltaVsStaticDiversity:counts.replay-counts.diversity,
   decisionRows};
 }
 const replays=Object.fromEntries(REPLAYS.map(c=>[c.name,play(natural,c,true)]));
 for(const cfg of REPLAYS){
  const x=replays[cfg.name];
  assert.equal(x.decisionRows.length,23-cfg.start);
  assert.equal(x.counts.official,
   days.slice(cfg.start).reduce((s,_,di)=>s+dayValues(natural)[di+cfg.start].OFICIAL,0));
 }
 const series=dayValues(natural);
 const perDay=days.map((day,i)=>({date:day,
  ...series[i],highConcentrationCuts5:pre.slice(i*5,i*5+5).filter(x=>x.originalMaxRootShare>=5).length,
  maxConcentration:Math.max(...pre.slice(i*5,i*5+5).map(x=>x.originalMaxRootShare))}));
 // Daily clustered bootstrap (descriptive): 23 dates resampled as bundles of five turns.
 const bootR=random(20261013),bootstrap=[];
 for(let z=0;z<10000;z++){
  let diff=0;for(let j=0;j<23;j++){
   const i=Math.floor(bootR()*23);
   diff+=series[i].COB20_P3-series[i].OFICIAL;
  }
  bootstrap.push(diff);
 }
 bootstrap.sort((a,b)=>a-b);
 const boots={observed:all.COB20_P3.top10-all.OFICIAL.top10,
  mean:average(bootstrap),p025:bootstrap[Math.floor(.025*(bootstrap.length-1))],
  median:bootstrap[Math.floor(.5*(bootstrap.length-1))],
  p975:bootstrap[Math.floor(.975*(bootstrap.length-1))],
  fractionNonPositive:bootstrap.filter(x=>x<=0).length/bootstrap.length};
 function groups(kind){
  if(kind==='free')return [natural];
  const groups=new Map();
  days.forEach((d,i)=>{const day=new Date(d+'T12:00:00Z').getUTCDay();
   if(!groups.has(day))groups.set(day,[]);groups.get(day).push(i)});
  return [...groups.values()];
 }
 const randPlacebo=random(20261013),placebos={};
 for(const grouping of ['free','weekday']){
  const cohorts=groups(grouping),observations=[];
  for(let iteration=0;iteration<10000;iteration++){
   const assignment=[...natural];
   for(const cohort of cohorts){
    const deck=cohort.map(index=>assignment[index]);
    for(let k=deck.length-1;k>0;k--){
     const j=Math.floor(randPlacebo()*(k+1));
     [deck[k],deck[j]]=[deck[j],deck[k]];
    }
    cohort.forEach((index,k)=>assignment[index]=deck[k]);
   }
   const fixed=dayValues(assignment).reduce((s,day)=>s+day.COB20_P3-day.OFICIAL,0);
   const follows=Object.fromEntries(REPLAYS.map(cfg=>{
    const answer=play(assignment,cfg,false);
    return [cfg.name,{vsOfficial:answer.deltaVsOfficial,vsDiversity:answer.deltaVsStaticDiversity}];
   }));
   observations.push({fixed,follows});
  }
  function distribution(values,actual){
   const sorted=values.slice().sort((a,b)=>a-b);
   return {real:actual,mean:Number(average(values).toFixed(4)),
    p05:sorted[499],median:sorted[4999],p95:sorted[9499],
    upperTail:(1+values.filter(x=>x>=actual).length)/(values.length+1)};
  }
  const result={diversityFixed:distribution(observations.map(o=>o.fixed),
    all.COB20_P3.top10-all.OFICIAL.top10)};
  for(const cfg of REPLAYS){
   const real=replays[cfg.name];
   result[cfg.name]={
    vsOfficial:distribution(observations.map(o=>o.follows[cfg.name].vsOfficial),real.deltaVsOfficial),
    vsDiversity:distribution(observations.map(o=>o.follows[cfg.name].vsDiversity),
     real.deltaVsStaticDiversity)
   };
  }
  placebos[grouping]=result;
 }
 const preAvg={original:average(pre.map(x=>x.baselineRootEvents)),
  diversity:average(pre.map(x=>x.diversityRootEvents)),
  rootMaxShareOriginal:average(pre.map(x=>x.originalMaxRootShare)),
  rootMaxShareDiversity:average(pre.map(x=>x.diversityMaxRootShare))};
 save('POST_REPLAY_115.json',{date:'2026-10-13',
  headsByCut:post.map((r,i)=>({date:r.date,turn:r.turn,heads:r.targets,
   scores:ownHits[i]})),
  chronologicalDecisions:replays,concentration,perDay});
 save('RESUMEN.json',{date:'2026-10-13',days:23,cuts:115,
  policies:all,pairedChanges:changes,byTurn:turnStats,byMonth:monthStats,
  chronologicalBlocks:blocks,concentration,
  replays:Object.fromEntries(Object.entries(replays).map(([k,v])=>[k,{
   counts:v.counts,deltaVsOfficial:v.deltaVsOfficial,deltaVsStaticDiversity:v.deltaVsStaticDiversity,
   decisionsByDay:v.decisionRows.map(d=>({date:d.targetDate,
    policy:d.policy,trainingFrom:d.trainingFrom,trainingToExclusive:d.trainingToExclusive,
    priorScore:d.scoreKnownFromPast,postResult:d.actualPolicyScorePost,
    comparators:d.comparatorPost}))
  }])),
  averagePhysicalRootMetrics:preAvg,bootstrap:boots,placebos,
  seal,sourcePost:sha(read(ROOT+'POST_115.json')),
  limitation:'Las decisiones avanzan sin mirar futuros resultados dentro del replay, pero el conjunto de políticas fue elegido tras investigar las mismas 23 jornadas. No es validación prospectiva.'});
 console.log('VT3_REPLAY_POST_OK',JSON.stringify({
  static:all,replays:Object.fromEntries(Object.entries(replays).map(([k,v])=>[k,{
   counts:v.counts,decisions:v.decisionRows.map(r=>r.policy)}])),
  concentration,bootstrap:boots,placebos
 },null,2));
}
if(process.argv[2]==='pre')pre();
else if(process.argv[2]==='post')after();
else throw Error('Use pre|post');
