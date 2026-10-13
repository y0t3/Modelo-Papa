import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const SRC='auditorias/vt3-diversidad-antecedentes-115-13oct2026/';
const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-anatomia-intercambios-115-13oct2026/';
const PROTOCOL='PROTOCOLO_VT3_ANATOMIA_INTERCAMBIOS_13OCT2026.md';
const S_PRE='b190ed0a4715220501f564dee3300264c32efeccef7bc49fbfb1dee10999908e';
const S_CONTROL='c59b509ba99d5c484f331885007c9e3c8f995b0d58669e9fd9aeeba0fcc36346';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const POLICIES=['OFICIAL','COB20_P3','CONTROL_MAS_EVENTOS_20'];
const TESTS=['COB20_P3','CONTROL_MAS_EVENTOS_20'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
mkdirSync(OUT,{recursive:true});
const save=(f,v)=>writeFileSync(OUT+f,JSON.stringify(v,null,2)+'\n');
const key=r=>r.date+'|'+r.turn;
const family=h=>{assert.match(h,/^\d{4}$/);const t=h.slice(-3);
 return [t,[...t].reverse().join('')].sort().join('/')};
const uniq=items=>[...new Set(items)];
const mean=arr=>arr.length?arr.reduce((n,x)=>n+x,0)/arr.length:0;
const evt=pool=>uniq(pool.flatMap(p=>p.events));
function rootStats(families,by){
 const events=new Map();
 for(const familyName of families){
  const p=by.get(familyName);assert.ok(p,'Familia sin ficha anclada: '+familyName);
  for(const e of p.events)events.set(e,(events.get(e)||0)+1);
 }
 const total=[...events.values()].reduce((s,x)=>s+x,0);
 return {uniqueEvents:events.size,eventIncidences:total,
  maxSharing:Math.max(0,...events.values()),
  HHI:total?[...events.values()].reduce((s,x)=>s+(x/total)**2,0):0,
  events:[...events.keys()].sort()};
}
function profile(f,by,commonEvents){
 const c=by.get(f);assert.ok(c);
 const newVsCommon=c.events.filter(e=>!commonEvents.has(e));
 const sharedWithCommon=c.events.filter(e=>commonEvents.has(e));
 return {family:f,originalRank:c.originalRank,
  eventCount:c.events.length,events:c.events,
  historicalRootsD1:c.d1,historicalRootsD7:c.d7,
  blocks:c.blocks,bif:c.bif,sources:c.sources,
  rootedPaths:c.rootedPaths,physicalPaths:c.physicalPaths,
  newVsSharedCore:newVsCommon,
  newVsSharedCoreCount:newVsCommon.length,
  alreadyPresentInCoreCount:sharedWithCommon.length,
  anchorFraction:c.rootedPaths/c.physicalPaths};
}
function comparePolicy(r,policy){
 const original=r.choices.OFICIAL.families,other=r.choices[policy].families;
 const by=new Map(r.pool.map(c=>[c.family,c]));
 assert.equal(original.length,10);assert.equal(other.length,10);
 assert.equal(new Set(original).size,10);assert.equal(new Set(other).size,10);
 assert.deepEqual(original.slice(0,3),other.slice(0,3));
 const oSet=new Set(original),aSet=new Set(other);
 const common=original.filter(f=>aSet.has(f));
 const entering=other.filter(f=>!oSet.has(f));
 const leaving=original.filter(f=>!aSet.has(f));
 assert.equal(entering.length,leaving.length);
 assert.deepEqual(entering.every(f=>by.get(f).originalRank<=20),true);
 const baseEvents=new Set(evt(common.map(f=>by.get(f))));
 const origStats=rootStats(original,by),newStats=rootStats(other,by);
 const oldCovered=new Set(origStats.events),newCovered=new Set(newStats.events);
 const commonStats=rootStats(common,by);
 const given={
  policy,original,chosen:other,
  common,entering,leaving,swapCount:entering.length,
  commonStats,
  originalStats:{...origStats,events:undefined},
  chosenStats:{...newStats,events:undefined},
  gainedEvents:[...newCovered].filter(e=>!oldCovered.has(e)).sort(),
  lostEvents:[...oldCovered].filter(e=>!newCovered.has(e)).sort(),
  enteredProfiles:entering.map(f=>profile(f,by,baseEvents)),
  displacedProfiles:leaving.map(f=>profile(f,by,baseEvents)),
  changeOfCoverage:newStats.uniqueEvents-origStats.uniqueEvents,
  changedRootConcentration:newStats.maxSharing-origStats.maxSharing,
  changedHHI:Number((newStats.HHI-origStats.HHI).toFixed(9))
 };
 assert.equal(given.gainedEvents.length-given.lostEvents.length,given.changeOfCoverage);
 return given;
}
function producePre(){
 assert.ok(!existsSync(SRC+'POST_115.json'),'POST leakage');
 assert.ok(!existsSync(SRC+'RESUMEN.json'),'POST summary leakage');
 assert.ok(!existsSync(ROOT+'POST_115.json'),'POST goals leakage');
 assert.equal(sha(read(SRC+'PRE_115.json')),S_PRE);
 assert.equal(sha(read(SRC+'CONTROLES_PRE.json')),S_CONTROL);
 const old=json(SRC+'PRE_115.json'),raw=old.rows;
 assert.equal(raw.length,115);assert.equal(old.days.length,23);
 const rows=raw.map((r,i)=>{
  assert.equal(r.date,old.days[Math.floor(i/5)]);assert.equal(r.turn,TURNS[i%5]);
  const by=new Map(r.pool.map(p=>[p.family,p]));
  assert.equal(by.size,r.pool.length);
  const of=r.choices.OFICIAL.families;
  const core=new Set(evt(of.slice(0,3).map(f=>by.get(f))));
  const outside=r.pool.filter(c=>c.originalRank>=11&&c.originalRank<=20);
  const opponentProfiles=outside.map(c=>({
   ...profile(c.family,by,core),selectedByDiversity:r.choices.COB20_P3.families.includes(c.family),
   selectedByAbundance:r.choices.CONTROL_MAS_EVENTOS_20.families.includes(c.family)
  }));
  const pairs=Object.fromEntries(TESTS.map(p=>[p,comparePolicy(r,p)]));
  const dSet=new Set(r.choices.COB20_P3.families),aSet=new Set(r.choices.CONTROL_MAS_EVENTOS_20.families);
  const selectedOnlyD=[...dSet].filter(f=>!aSet.has(f));
  const selectedOnlyA=[...aSet].filter(f=>!dSet.has(f));
  assert.equal(selectedOnlyD.length,selectedOnlyA.length);
  return {date:r.date,turn:r.turn,
   policyTops:Object.fromEntries(POLICIES.map(p=>[p,r.choices[p].families])),
   originalTopRootMetrics:r.choices.OFICIAL.metrics,
   competition:opponentProfiles,
   analysis:pairs,
   directDiversityVsAbundance:{shared:uniq([...dSet].filter(f=>aSet.has(f))),selectedOnlyD,selectedOnlyA,
    eventOnlyD:[...new Set(evt([...dSet].map(f=>by.get(f))))].filter(e=>!new Set(evt([...aSet].map(f=>by.get(f)))).has(e)),
    eventOnlyA:[...new Set(evt([...aSet].map(f=>by.get(f))))].filter(e=>!new Set(evt([...dSet].map(f=>by.get(f)))).has(e))}
  };
 });
 const diffD=rows.reduce((s,r)=>s+r.analysis.COB20_P3.swapCount,0);
 const diffA=rows.reduce((s,r)=>s+r.analysis.CONTROL_MAS_EVENTOS_20.swapCount,0);
 assert.equal(diffD,136);
 assert.equal(diffA,287);
 const neutralSource=json(SRC+'CONTROLES_PRE.json');
 assert.equal(neutralSource.randomSelections.length,2000);
 assert.equal(neutralSource.rewiredRootSelections.length,500);
 // Controls with *exactly the same kept families* and *same number of swaps* per cut.
 // Only randomness is which eligible position 11–20 replaces the incoming names.
 const seed=20261013;
 let state=seed>>>0;
 const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296};
 const controls={seed,samples:2000,policies:{}};
 for(const policy of TESTS){
  const reps=[];
  for(let repetition=0;repetition<2000;repetition++){
   const draws=[];
   for(const row of rows){
    const {swapCount}=row.analysis[policy];
    const candidates=row.competition.map(x=>x.originalRank);
    assert.ok(swapCount<=candidates.length);
    const deck=[...candidates];
    for(let k=0;k<swapCount;k++){
     const j=k+Math.floor(rng()*(deck.length-k));
     [deck[j],deck[k]]=[deck[k],deck[j]];
    }
    draws.push(deck.slice(0,swapCount));
   }
   reps.push(draws);
  }
  controls.policies[policy]=reps;
 }
 save('PRE_115.json',{date:'2026-10-13',days:old.days,rows,policyNames:POLICIES,
  warning:'Sin cabezas objetivo ni etiquetas de ganador; auditoría de intercambios existentes'});
 save('CONTROLES_PAREADOS_PRE.json',controls);
 const seal={source:S_PRE,neutralSource:S_CONTROL,
  code:sha(read('scripts/lab-vt3-anatomia-intercambios.mjs')),
  protocol:sha(read(PROTOCOL)),pre:sha(read(OUT+'PRE_115.json')),
  control:sha(read(OUT+'CONTROLES_PAREADOS_PRE.json'))};
 save('SELLO.json',seal);
 console.log('VT3_INTERCAMBIOS_PRE_OK',JSON.stringify({cuts:rows.length,
  swapsDiversity:diffD,swapsAbundance:diffA,
  changedCutsDiversity:rows.filter(r=>r.analysis.COB20_P3.swapCount).length,
  changedCutsAbundance:rows.filter(r=>r.analysis.CONTROL_MAS_EVENTOS_20.swapCount).length,seal}));
}
function runPost(){
 const seal=json(OUT+'SELLO.json');
 const equal=(p,v)=>assert.equal(sha(read(p)),v,'SHA fallo '+p);
 equal(SRC+'PRE_115.json',seal.source);
 equal(SRC+'CONTROLES_PRE.json',seal.neutralSource);
 equal('scripts/lab-vt3-anatomia-intercambios.mjs',seal.code);
 equal(PROTOCOL,seal.protocol);equal(OUT+'PRE_115.json',seal.pre);
 equal(OUT+'CONTROLES_PAREADOS_PRE.json',seal.control);
 const pre=json(OUT+'PRE_115.json').rows,posts=json(ROOT+'POST_115.json').rows,
  neutral=json(OUT+'CONTROLES_PAREADOS_PRE.json');
 assert.equal(pre.length,115);assert.equal(posts.length,115);
 assert.equal(neutral.samples,2000);
 const d=new Map(pre.map((r,i)=>[key(r),i]));
 assert.equal(d.size,115);
 const results=pre.map((row,i)=>{
  const outcome=posts[i];assert.equal(key(row),key(outcome));
  const goals=new Set(outcome.targets.map(family));
  const policies=Object.fromEntries(POLICIES.map(policy=>{
   const top=row.policyTops[policy],hits=top.filter(f=>goals.has(f));
   return [policy,{top10:hits.length>0,winnerFamilies:hits,top3:top.slice(0,3).some(f=>goals.has(f)),
    top5:top.slice(0,5).some(f=>goals.has(f))}];
  }));
  const swaps=Object.fromEntries(TESTS.map(policy=>{
   const a=row.analysis[policy];
   return [policy,{enteringWins:a.entering.filter(f=>goals.has(f)),
    leavingWins:a.leaving.filter(f=>goals.has(f)),
    commonWins:a.common.filter(f=>goals.has(f)),swapped:a.swapCount,
    gainedHistoricalEvents:a.gainedEvents.length,lostHistoricalEvents:a.lostEvents.length}];
  }));
  const eligibleOutcome=row.competition.map(x=>({
   family:x.family,rank:x.originalRank,win:goals.has(x.family),
   events:x.eventCount,
   noveltyVsCore:x.newVsSharedCoreCount,
   divSelected:x.selectedByDiversity,
   abundanceSelected:x.selectedByAbundance
  }));
  return {date:row.date,turn:row.turn,heads:outcome.targets,
   winningPool11to20:eligibleOutcome.filter(x=>x.win),
   eligibleOutcome,swaps,policies};
 });
 function sum(rows,policy){
  const ix=rows.map(x=>d.get(key(x)));
  const a=rows.map(r=>r.policies[policy]);
  const plus=rows.filter(x=>x.policies[policy].top10&&!x.policies.OFICIAL.top10).map(key);
  const minus=rows.filter(x=>!x.policies[policy].top10&&x.policies.OFICIAL.top10).map(key);
  return {cuts:rows.length,top3:a.filter(x=>x.top3).length,top5:a.filter(x=>x.top5).length,
   top10:a.filter(x=>x.top10).length,familyWinnerExposures:a.reduce((s,x)=>s+x.winnerFamilies.length,0),
   gains:plus,losses:minus,
   swapExposures:policy==='OFICIAL'?0:ix.reduce((s,i)=>s+pre[i].analysis[policy].swapCount,0),
   enteringWinnerExposures:policy==='OFICIAL'?0:rows.reduce((s,x)=>s+x.swaps[policy].enteringWins.length,0),
   leavingWinnerExposures:policy==='OFICIAL'?0:rows.reduce((s,x)=>s+x.swaps[policy].leavingWins.length,0)};
 }
 function breakdown(rows){
  return Object.fromEntries(POLICIES.map(p=>[p,sum(rows,p)]));
 }
 const all=breakdown(results);
 assert.equal(all.OFICIAL.top10,15);assert.equal(all.COB20_P3.top10,17);
 assert.equal(all.CONTROL_MAS_EVENTOS_20.top10,17);
 const byTurn=Object.fromEntries(TURNS.map(t=>[t,breakdown(results.filter(r=>r.turn===t))]));
 const byMonth=Object.fromEntries([...new Set(results.map(r=>r.date.slice(0,7)))].map(m=>[m,breakdown(results.filter(r=>r.date.startsWith(m)))]));
 const opportunity=results.reduce((memo,r)=>{
  memo.outOfOfficialPoolExposures+=r.eligibleOutcome.length;
  memo.outOfOfficialWinners+=r.eligibleOutcome.filter(x=>x.win).length;
  memo.cutsWithWinnerOutsideTop+=Number(r.winningPool11to20.length>0);
  memo.cutsWithRescuePossible+=Number(r.winningPool11to20.length>0&&!r.policies.OFICIAL.top10);
  return memo;
 },{outOfOfficialPoolExposures:0,outOfOfficialWinners:0,cutsWithWinnerOutsideTop:0,cutsWithRescuePossible:0});
 const slices=Object.fromEntries(TESTS.map(p=>{
  const changed=results.filter(r=>r.swaps[p].swapped>0),
   entrant=changed.reduce((s,r)=>s+r.swaps[p].enteringWins.length,0),
   displaced=changed.reduce((s,r)=>s+r.swaps[p].leavingWins.length,0);
  const array=pre.map((r,i)=>({r,win:results[i]})).filter(x=>x.r.analysis[p].swapCount);
  const stats={changedCuts:changed.length,swapExposures:array.reduce((s,x)=>s+x.r.analysis[p].swapCount,0),
   entrantWinningExposures:entrant,displacedWinningExposures:displaced,
   losingEntrantExposures:array.reduce((s,x)=>s+x.r.analysis[p].swapCount,0)-entrant,
   averageIncomingRank:mean(array.flatMap(x=>x.r.analysis[p].enteredProfiles.map(f=>f.originalRank))),
   averageOutgoingRank:mean(array.flatMap(x=>x.r.analysis[p].displacedProfiles.map(f=>f.originalRank))),
   averageIncomingRootEvents:mean(array.flatMap(x=>x.r.analysis[p].enteredProfiles.map(f=>f.eventCount))),
   averageOutgoingRootEvents:mean(array.flatMap(x=>x.r.analysis[p].displacedProfiles.map(f=>f.eventCount))),
   averageIncomingNovelToCore:mean(array.flatMap(x=>x.r.analysis[p].enteredProfiles.map(f=>f.newVsSharedCoreCount))),
   averageOutgoingNovelToCore:mean(array.flatMap(x=>x.r.analysis[p].displacedProfiles.map(f=>f.newVsSharedCoreCount))),
   gainedEventTotal:array.reduce((s,x)=>s+x.r.analysis[p].gainedEvents.length,0),
   lostEventTotal:array.reduce((s,x)=>s+x.r.analysis[p].lostEvents.length,0),
   increasedCoverageCuts:array.filter(x=>x.r.analysis[p].changeOfCoverage>0).length,
   unchangedCoverageCuts:array.filter(x=>x.r.analysis[p].changeOfCoverage===0).length,
   declinedCoverageCuts:array.filter(x=>x.r.analysis[p].changeOfCoverage<0).length,
   negativeExamples:array.filter(x=>x.win.swaps[p].enteringWins.length===0).length,
   changesHHI:mean(array.map(x=>x.r.analysis[p].changedHHI)),
   rootD1Incoming:mean(array.flatMap(x=>x.r.analysis[p].enteredProfiles.map(f=>f.historicalRootsD1))),
   rootD1Outgoing:mean(array.flatMap(x=>x.r.analysis[p].displacedProfiles.map(f=>f.historicalRootsD1))),
   rootD7Incoming:mean(array.flatMap(x=>x.r.analysis[p].enteredProfiles.map(f=>f.historicalRootsD7))),
   rootD7Outgoing:mean(array.flatMap(x=>x.r.analysis[p].displacedProfiles.map(f=>f.historicalRootsD7)))
  };
  return [p,stats];
 }));
 const directComparison=results.reduce((a,r,i)=>{
  const dp=r.policies.COB20_P3.top10,ab=r.policies.CONTROL_MAS_EVENTOS_20.top10;
  if(dp&&!ab)a.onlyD.push(key(r));
  if(ab&&!dp)a.onlyAbundance.push(key(r));
  if(dp&&ab)a.bothWin.push(key(r));
  if(!dp&&!ab)a.bothFail++;
  if(pre[i].directDiversityVsAbundance.selectedOnlyD.length>0)a.differentTops++;
  return a;
 },{onlyD:[],onlyAbundance:[],bothWin:[],bothFail:0,differentTops:0});
 const changedCaseKeys=[
  '2026-09-16|Matutino','2026-09-18|Nocturno',
  '2026-10-02|Matutino','2026-10-05|Vespertino'
 ];
 const caseStudies=changedCaseKeys.map(k=>{
  const i=d.get(k);assert.ok(i!==undefined);
  const P=pre[i],R=results[i];return {date:P.date,turn:P.turn,heads:R.heads,
   officialHits:R.policies.OFICIAL.winnerFamilies,
   divHits:R.policies.COB20_P3.winnerFamilies,
   abundanceHits:R.policies.CONTROL_MAS_EVENTOS_20.winnerFamilies,
   pool11to20Winners:R.winningPool11to20,
   diversity:P.analysis.COB20_P3,
   abundance:P.analysis.CONTROL_MAS_EVENTOS_20,
   divergences:P.directDiversityVsAbundance
  };
 });
 // Fixed sets and exact budgets from PRE; only randomization varies which candidate fills the
 // already displaced k slots. No POST-based selection or choice of the best replicate.
 const matched={};
 for(const p of TESTS){
  const samples=neutral.policies[p];assert.equal(samples.length,2000);
  const scores=[];
  const entrantHits=[];
  for(const draw of samples){
   assert.equal(draw.length,115);let winnerCuts=0,winIncoming=0;
   for(let i=0;i<115;i++){
    const P=pre[i],R=results[i],old=P.analysis[p];
    const selectedRanks=draw[i],byRank=new Map(P.competition.map(x=>[x.originalRank,x.family]));
    assert.equal(selectedRanks.length,old.swapCount);
    const selected=selectedRanks.map(rank=>{const f=byRank.get(rank);assert.ok(f);return f});
    assert.equal(new Set(selected).size,selected.length);
    const trial=[...old.common,...selected];
    assert.equal(trial.length,10);
    const targetHeads=new Set(R.heads.map(family));
    winnerCuts+=Number(trial.some(f=>targetHeads.has(f)));
    winIncoming+=selected.filter(f=>targetHeads.has(f)).length;
   }
   scores.push(winnerCuts);entrantHits.push(winIncoming);
  }
  function dist(xs,actual){
   const sorted=xs.slice().sort((a,b)=>a-b);
   return {n:sorted.length,actual,mean:Number(mean(sorted).toFixed(5)),
    min:sorted[0],p05:sorted[99],median:sorted[999],p95:sorted[1899],max:sorted.at(-1),
    fractionAtLeastObserved:sorted.filter(x=>x>=actual).length/sorted.length,
    countAtLeastObserved:sorted.filter(x=>x>=actual).length};
  }
  matched[p]={top10:dist(scores,all[p].top10),
   selectedWinnerFamilies:dist(entrantHits,slices[p].entrantWinningExposures)};
 }
 // Paired day bundles: compare DIVERSITY with simple ABUNDANCE, NOT merely each vs original.
 const days=[...new Set(pre.map(x=>x.date))].sort();
 assert.equal(days.length,23);
 const matrix=TESTS.map(()=>Array.from({length:23},()=>Array(23).fill(0)));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(let t=0;t<5;t++){
  const choices=pre[i*5+t].policyTops,goal=new Set(posts[j*5+t].targets.map(family));
  TESTS.forEach((policy,k)=>matrix[k][i][j]+=Number(choices[policy].some(x=>goal.has(x))));
 }
 const counts=assignment=>TESTS.map((_,i)=>assignment.reduce((s,j,k)=>s+matrix[i][k][j],0));
 const ids=days.map((_,i)=>i);
 assert.deepEqual(counts(ids),[17,17]);
 const weekday=d=>new Date(d+'T12:00:00Z').getUTCDay(),groups=new Map();
 days.forEach((d,i)=>{const k=weekday(d);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(i)});
 function seeded(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296};}
 const placebos={};
 for(const [seedKey,[name,cohorts]] of Object.entries({free:[ids],sameWeekday:[...groups.values()]}).entries()){
  const rand=seeded(20261013+seedKey*53),diffs=[];
  for(let iteration=0;iteration<10000;iteration++){
   const mapping=[...ids];
   for(const group of cohorts){
    const tmp=group.map(i=>mapping[i]);
    for(let j=tmp.length-1;j>0;j--){const k=Math.floor(rand()*(j+1));[tmp[j],tmp[k]]=[tmp[k],tmp[j]]}
    group.forEach((i,j)=>mapping[i]=tmp[j]);
   }
   const [d,a]=counts(mapping);diffs.push(d-a);
  }
  const sorted=diffs.slice().sort((a,b)=>a-b);
  placebos[name]={observedDelta:0,averageDelta:Number(mean(diffs).toFixed(4)),
   p05:sorted[499],median:sorted[4999],p95:sorted[9499],
   positiveFraction:diffs.filter(v=>v>0).length/diffs.length,
   negativeFraction:diffs.filter(v=>v<0).length/diffs.length,
   twoSidedTailAroundNull:Math.min(1,2*Math.min(
    (1+diffs.filter(x=>x<=0).length)/(diffs.length+1),
    (1+diffs.filter(x=>x>=0).length)/(diffs.length+1)))};
 }
 const report={date:'2026-10-13',days:23,cuts:115,all,byTurn,byMonth,
  opportunity,slices,directComparison,caseStudies,matchedSlotControls:matched,
  comparativePlacebos:placebos,seal,sourcePost:sha(read(ROOT+'POST_115.json')),
  limitation:'Investigación retrospectiva de muchas hipótesis sobre 23 jornadas; distinguir mecanismos geométricos no confiere probabilidad superior en sorteos aleatorios.'};
 save('POST_115.json',{rows:results});
 save('RESUMEN.json',report);
 console.log('VT3_INTERCAMBIOS_POST_OK',JSON.stringify({all,opportunity,slices,
  directComparison,matched,placebos,caseStudies:caseStudies.map(x=>({
  date:x.date,turn:x.turn,official:x.officialHits,diversity:x.divHits,
  abundance:x.abundanceHits,divEnter:x.diversity.enteredProfiles.map(q=>q.family),
  divOut:x.diversity.displacedProfiles.map(q=>q.family),
  newRootEvents:x.diversity.gainedEvents.length,lostRootEvents:x.diversity.lostEvents.length}))},null,2));
}
if(process.argv[2]==='pre')producePre();
else if(process.argv[2]==='post')runPost();
else throw Error('Use pre | post');
