import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-diversidad-antecedentes-115-13oct2026/';
const DOC='PROTOCOLO_VT3_DIVERSIDAD_ANTECEDENTES_13OCT2026.md';
const BASE='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const POLICIES=['OFICIAL','COB20_P3','COB40_P3','COB20_P5','COB40_P5',
 'VENTANA5_P3','VENTANA10_P3','COB20_P3_HASH','CONTROL_MAS_EVENTOS_20','CONTROL_REV_RANGO_20'];
const read=f=>readFileSync(f,'utf8'),load=f=>JSON.parse(read(f));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(name,v)=>writeFileSync(OUT+name,JSON.stringify(v,null,2)+'\n');
const id=r=>r.date+'|'+r.turn;
const rev=t=>[...t].reverse().join('');
const family=t=>[t,rev(t)].sort().join('/');
const target=h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3));};
function random(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;}}
function uniq(x){return [...new Set(x)];}
function rootEvent(root){
 const fields=root.split('|');
 assert.equal(fields.length,8,'RootId con formato inesperado: '+root);
 assert.match(fields[0],/^\d{4}-\d{2}-\d{2}$/);
 assert.ok(fields[1]==='D−1'||fields[1]==='D−7');
 assert.match(fields[4],/^\d{4}$/);
 assert.equal(fields[5],'vt3');
 assert.ok(fields[6]&&fields[7]);
 return fields.slice(0,5).join('|');
}
function poolFor(row){
 const A=row.strategies.A_ORIGINAL;
 const witnessed=new Map(row.witnesses.map(w=>[w.family,w.paths]));
 assert.equal(witnessed.size,row.witnesses.length);
 assert.ok(A.length>=10);
 const pools=[];
 for(let i=0;i<A.length;i++){
  const candidate=A[i];assert.equal(candidate.rank,i+1);
  const paths=witnessed.get(candidate.family);
  assert.ok(paths?.length,'Candidata anclada sin rutas propias '+candidate.family);
  const rooted=paths.filter(p=>p.anchored&&p.rootIds.length>0);
  assert.ok(rooted.length>0);
  const rootedEventNames=uniq(rooted.flatMap(p=>p.rootIds.map(rootEvent))).sort();
  const directEventCount=rootedEventNames.length;
  const ownD1=rootedEventNames.filter(x=>x.split('|')[1]==='D−1').length;
  const ownD7=rootedEventNames.filter(x=>x.split('|')[1]==='D−7').length;
  assert.ok(ownD1>=0&&ownD7>=0);
  assert.ok(directEventCount>0);
  assert.ok(candidate.d1<=directEventCount+5&&candidate.d7<=directEventCount+5);
  pools.push({family:candidate.family,originalRank:i+1,events:rootedEventNames,
    d1:candidate.d1,d7:candidate.d7,bif:candidate.bif,
    sources:candidate.sources,blocks:candidate.blocks,
    rootedPaths:rooted.length,physicalPaths:paths.length});
 }
 assert.equal(new Set(pools.map(x=>x.family)).size,pools.length);
 return pools;
}
function selectedEvents(selected){
 const events=new Set();
 for(const c of selected)for(const e of c.events)events.add(e);
 return events;
}
function chooseGreedy(pools,poolMax,locked,window=0,overrides=null){
 const pool=pools.slice(0,poolMax);
 assert.ok(pool.length>=10);
 const chosen=pool.slice(0,locked);
 const selected=new Set(chosen.map(x=>x.family));
 const reasons=chosen.map((x,i)=>({family:x.family,rank:x.originalRank,
    newEvents:x.events.filter(e=>!selectedEvents(chosen.slice(0,i)).has(e)).length,
    locked:true}));
 while(chosen.length<10){
  const available=pool.filter(x=>!selected.has(x.family));
  const choices=window?available.slice(0,window):available;
  const supported=selectedEvents(chosen);
  let best=null,maxGain=-1;
  for(const candidate of choices){
   const events=overrides?.get(candidate.family)||candidate.events;
   const gain=events.filter(e=>!supported.has(e)).length;
   if(gain>maxGain||gain===maxGain&&candidate.originalRank<(best?.originalRank||Infinity)){
    maxGain=gain;best=candidate;
   }
  }
  assert.ok(best);
  chosen.push(best);selected.add(best.family);
  reasons.push({family:best.family,rank:best.originalRank,newEvents:maxGain,locked:false});
 }
 assert.equal(chosen.length,10);
 return {families:chosen.map(x=>x.family),reasons};
}
function withRank(pools,ranks,protectedCount){
 const chosen=[...pools.slice(0,protectedCount),...ranks.map(rank=>pools[rank-1])];
 assert.equal(chosen.length,10);
 assert.equal(new Set(chosen.map(x=>x.family)).size,10);
 return chosen.map(x=>x.family);
}
function orderedReason(families,pools){
 const map=new Map(pools.map(x=>[x.family,x]));
 const used=new Set();
 return families.map(f=>{
  const q=map.get(f);assert.ok(q);
  const newer=q.events.filter(e=>!used.has(e));
  q.events.forEach(e=>used.add(e));
  return {family:f,rank:q.originalRank,newEvents:newer.length,locked:false};
 });
}
function metrics(families,pools){
 const by=new Map(pools.map(x=>[x.family,x]));
 const counts=new Map(),covered=new Set();
 const uniqueFamilies=new Set(families);
 assert.equal(uniqueFamilies.size,10);
 for(const f of families){
  const p=by.get(f);assert.ok(p);
  for(const e of p.events){
   covered.add(e);
   counts.set(e,(counts.get(e)||0)+1);
  }
 }
 const totalIncidence=[...counts.values()].reduce((a,b)=>a+b,0);
 const hhi=totalIncidence?
  [...counts.values()].reduce((a,b)=>a+(b/totalIncidence)**2,0):0;
 const mostShared=Math.max(0,...counts.values());
 return {uniqueRootEvents:covered.size,totalEventIncidences:totalIncidence,
  maxFamiliesSharingOneEvent:mostShared,HHI:Math.round(hhi*1e6)/1e6,
  sharedRootEvents:[...counts.entries()].filter(([e,n])=>n>1)
   .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
   .map(([event,families])=>({event,families})),
  eventsByFamily:families.map(f=>({family:f,events:by.get(f).events}))};
}
function build(row){
 const pools=poolFor(row),official=pools.slice(0,10).map(x=>x.family);
 function variant(max,protectedCount,window=0){
  return chooseGreedy(pools,max,protectedCount,window);
 }
 const sortedHash=pools.slice(3,20).sort((a,b)=>
  sha('20261013|'+row.date+'|'+row.turn+'|'+a.family)
  .localeCompare(sha('20261013|'+row.date+'|'+row.turn+'|'+b.family)));
 const countSort=pools.slice(3,20).sort((a,b)=>
  b.events.length-a.events.length||a.originalRank-b.originalRank);
 const reverseRank=pools.slice(3,20).reverse();
 const raw={
  OFICIAL:{families:official,reasons:orderedReason(official,pools)},
  COB20_P3:variant(20,3),
  COB40_P3:variant(40,3),
  COB20_P5:variant(20,5),
  COB40_P5:variant(40,5),
  VENTANA5_P3:variant(20,3,5),
  VENTANA10_P3:variant(20,3,10),
  COB20_P3_HASH:{families:[...official.slice(0,3),...sortedHash.slice(0,7).map(x=>x.family)]},
  CONTROL_MAS_EVENTOS_20:{families:[...official.slice(0,3),...countSort.slice(0,7).map(x=>x.family)]},
  CONTROL_REV_RANGO_20:{families:[...official.slice(0,3),...reverseRank.slice(0,7).map(x=>x.family)]}
 };
 for(const policy of POLICIES){
  const x=raw[policy];
  assert.ok(x);
  assert.equal(x.families.length,10);
  assert.equal(new Set(x.families).size,10);
  const protectedCount=policy.includes('P5')?5:3;
  assert.deepEqual(x.families.slice(0,protectedCount),official.slice(0,protectedCount));
  x.reasons=x.reasons||orderedReason(x.families,pools);
 }
 const choices=Object.fromEntries(POLICIES.map(policy=>[policy,{
  ...raw[policy],metrics:metrics(raw[policy].families,pools),
  changedVsOriginal:raw[policy].families.filter(f=>!official.includes(f)).length}]));
 return {date:row.date,turn:row.turn,originalCandidateCount:pools.length,
  pool:pools.slice(0,40),official,choices};
}
function prepare(){
 assert.ok(!existsSync(ROOT+'POST_115.json'));
 assert.ok(!existsSync(ROOT+'NOCTURNA_POST_DIAGNOSTICO.json'));
 assert.equal(sha(read(ROOT+'PRE_115.json')),BASE);
 mkdirSync(OUT,{recursive:true});
 const raw=load(ROOT+'PRE_115.json').rows;
 assert.equal(raw.length,115);
 const rows=raw.map(build),dates=uniq(rows.map(x=>x.date)).sort();
 assert.equal(dates.length,23);
 for(const date of dates)assert.deepEqual(rows.filter(x=>x.date===date).map(x=>x.turn),TURNS);
 const noct=build(load(ROOT+'NOCTURNA_SIMULACION.json').row);
 assert.equal(noct.date,'2026-10-12');assert.equal(noct.turn,'Nocturno');
 // A documented PRE observation: an event from 10 Oct Entre Rios Nocturna
 // supports eight of the original ten proposed families in the known physical sheet.
 const event='2026-10-10|D−1|Nocturno|Entre Ríos|0564';
 const supporterCount=noct.choices.OFICIAL.metrics.eventsByFamily.filter(x=>x.events.includes(event)).length;
 assert.equal(supporterCount,8);
 const rngUniform=random(20261013);
 const uniform=[];
 for(let sample=0;sample<2000;sample++){
  uniform.push(rows.map(row=>{
   const max=Math.min(20,row.originalCandidateCount);
   const deck=Array.from({length:max-3},(_,i)=>i+4);
   for(let k=0;k<7;k++){
    const j=k+Math.floor(rngUniform()*(deck.length-k));
    [deck[k],deck[j]]=[deck[j],deck[k]];
   }
   return deck.slice(0,7); // original rank positions, sealed
  }));
 }
 const rngRewire=random(20261014),rewired=[];
 for(let replicate=0;replicate<500;replicate++){
  rewired.push(rows.map(row=>{
   const n=Math.min(20,row.originalCandidateCount);
   const subset=row.pool.slice(3,n);
   const index=Array.from({length:subset.length},(_,i)=>i);
   for(let k=index.length-1;k>0;k--){
    const j=Math.floor(rngRewire()*(k+1));
    [index[k],index[j]]=[index[j],index[k]];
   }
   const shuffled=new Map(subset.map((f,i)=>[f.family,subset[index[i]].events]));
   return chooseGreedy(row.pool,20,3,0,shuffled).families
    .slice(3).map(f=>row.pool.find(p=>p.family===f).originalRank);
  }));
 }
 save('PRE_115.json',{days:dates,rows,policies:POLICIES});
 save('NOCTURNA_PRE.json',noct);
 save('CONTROLES_PRE.json',{randomSeed:20261013,rewireSeed:20261014,
  randomSelections:uniform,rewiredRootSelections:rewired});
 const seal={sourcePre:BASE,code:sha(read('scripts/lab-vt3-diversidad-antecedentes.mjs')),
  protocol:sha(read(DOC)),pre:sha(read(OUT+'PRE_115.json')),
  nocturna:sha(read(OUT+'NOCTURNA_PRE.json')),
  controls:sha(read(OUT+'CONTROLES_PRE.json'))};
 save('SELLO.json',seal);
 console.log('VT3_DIVERSIDAD_PRE_OK',JSON.stringify({cuts:rows.length,days:dates.length,
  noctOfficialMaxShare:noct.choices.OFICIAL.metrics.maxFamiliesSharingOneEvent,
  noctEvent0564:8,rootsPerCutAverage:
   rows.reduce((s,r)=>s+r.choices.OFICIAL.metrics.uniqueRootEvents,0)/rows.length,
  controlSelections:2000,permutedRootSelections:500,seal}));
}
function evaluate(){
 const seal=load(OUT+'SELLO.json');
 assert.equal(seal.sourcePre,sha(read(ROOT+'PRE_115.json')));
 assert.equal(seal.code,sha(read('scripts/lab-vt3-diversidad-antecedentes.mjs')));
 assert.equal(seal.protocol,sha(read(DOC)));
 assert.equal(seal.pre,sha(read(OUT+'PRE_115.json')));
 assert.equal(seal.nocturna,sha(read(OUT+'NOCTURNA_PRE.json')));
 assert.equal(seal.controls,sha(read(OUT+'CONTROLES_PRE.json')));
 const rows=load(OUT+'PRE_115.json').rows,post=load(ROOT+'POST_115.json').rows;
 const controls=load(OUT+'CONTROLES_PRE.json');
 assert.equal(rows.length,115);assert.equal(post.length,115);
 const scores=rows.map((r,i)=>{
  const q=post[i];assert.equal(id(r),id(q));
  const wins=new Set(q.targets.map(target));
  const policies=Object.fromEntries(POLICIES.map(policy=>{
   const top=r.choices[policy].families;
   return [policy,{top3:top.slice(0,3).some(f=>wins.has(f)),
    top5:top.slice(0,5).some(f=>wins.has(f)),
    top10:top.some(f=>wins.has(f)),
    familyWinners:top.filter(f=>wins.has(f))}];
  }));
  return {date:r.date,turn:r.turn,heads:q.targets,policies};
 });
 function summarize(cuts){
  return Object.fromEntries(POLICIES.map(p=>{
   const gains=cuts.filter(x=>x.policies[p].top10&&!x.policies.OFICIAL.top10).map(id);
   const losses=cuts.filter(x=>!x.policies[p].top10&&x.policies.OFICIAL.top10).map(id);
   const sourceProfiles=cuts.map(x=>rows.find(r=>id(r)===id(x)).choices[p].metrics);
   const original=cuts.map(x=>rows.find(r=>id(r)===id(x)).choices.OFICIAL);
   const changed=cuts.reduce((s,x)=>{
    const row=rows.find(r=>id(r)===id(x));return s+row.choices[p].changedVsOriginal;
   },0);
   const avg=field=>Number((sourceProfiles.reduce((s,p)=>s+p[field],0)/cuts.length).toFixed(4));
   return [p,{cuts:cuts.length,top3:cuts.filter(x=>x.policies[p].top3).length,
    top5:cuts.filter(x=>x.policies[p].top5).length,
    top10:cuts.filter(x=>x.policies[p].top10).length,
    familyHits:cuts.reduce((s,x)=>s+x.policies[p].familyWinners.length,0),
    changedFamilyExposures:changed,
    averageDistinctEvents:avg('uniqueRootEvents'),avgMaxSharing:avg('maxFamiliesSharingOneEvent'),
    avgHHI:avg('HHI'),gains,losses}];
  }));
 }
 const overall=summarize(scores);
 assert.deepEqual([overall.OFICIAL.top3,overall.OFICIAL.top5,overall.OFICIAL.top10],[5,8,15]);
 const byTurn=Object.fromEntries(TURNS.map(t=>[t,summarize(scores.filter(x=>x.turn===t))]));
 const byMonth=Object.fromEntries(uniq(scores.map(x=>x.date.slice(0,7))).map(m=>
  [m,summarize(scores.filter(x=>x.date.startsWith(m)))]));
 const uniformScores=[];
 for(const choice of controls.randomSelections){
  let hits=0;
  for(let i=0;i<115;i++){
   const actual=new Set(post[i].targets.map(target)),row=rows[i];
   const list=[...row.official.slice(0,3),...choice[i].map(rank=>row.pool[rank-1].family)];
   assert.equal(list.length,10);
   assert.equal(new Set(list).size,10);
   hits+=Number(list.some(f=>actual.has(f)));
  }
  uniformScores.push(hits);
 }
 const rewiredScores=[];
 for(const choice of controls.rewiredRootSelections){
  let hits=0;
  for(let i=0;i<115;i++){
   const actual=new Set(post[i].targets.map(target)),row=rows[i];
   const list=[...row.official.slice(0,3),...choice[i].map(rank=>row.pool[rank-1].family)];
   assert.equal(new Set(list).size,10);
   hits+=Number(list.some(f=>actual.has(f)));
  }
  rewiredScores.push(hits);
 }
 function describeSample(sample,observed){
  const sorted=sample.slice().sort((a,b)=>a-b);
  return {n:sorted.length,mean:Number((sorted.reduce((s,x)=>s+x,0)/sorted.length).toFixed(5)),
   min:sorted[0],median:sorted[Math.floor((sorted.length-1)/2)],
   p05:sorted[Math.floor((sorted.length-1)*.05)],
   p95:sorted[Math.floor((sorted.length-1)*.95)],max:sorted.at(-1),
   fractionAtLeastObserved:sorted.filter(x=>x>=observed).length/sorted.length,
   histogram:Object.fromEntries(uniq(sorted).map(n=>[String(n),sorted.filter(x=>x===n).length]))};
 }
 const dates=uniq(rows.map(r=>r.date)).sort();
 assert.equal(dates.length,23);
 const preMap=new Map(rows.map(x=>[id(x),x])),targetMap=new Map(post.map(x=>[id(x),x]));
 const matrix=POLICIES.map(()=>Array.from({length:23},()=>Array(23).fill(0)));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(const turn of TURNS){
  const r=preMap.get(dates[i]+'|'+turn),q=targetMap.get(dates[j]+'|'+turn);
  const winners=new Set(q.targets.map(target));
  for(let k=0;k<POLICIES.length;k++){
   matrix[k][i][j]+=Number(r.choices[POLICIES[k]].families.some(f=>winners.has(f)));
  }
 }
 const ids=dates.map((_,i)=>i);
 const calculate=permutation=>POLICIES.map((_,k)=>permutation.reduce((n,j,i)=>n+matrix[k][i][j],0));
 assert.equal(calculate(ids)[0],15);
 const weekday=d=>new Date(d+'T12:00:00Z').getUTCDay();
 const groups=new Map();
 dates.forEach((d,i)=>{const w=weekday(d);if(!groups.has(w))groups.set(w,[]);groups.get(w).push(i)});
 const schemes={free:[ids],sameWeekday:[...groups.values()]},placebos={};
 for(const [idx,[name,positions]] of Object.entries(schemes).entries()){
  const R=random(20261013+idx*839),arrays=POLICIES.map(()=>[]);
  for(let iteration=0;iteration<10000;iteration++){
   const shuffled=[...ids];
   for(const segment of positions){
    const copy=segment.map(i=>shuffled[i]);
    for(let k=copy.length-1;k>0;k--){
     const j=Math.floor(R()*(k+1));[copy[k],copy[j]]=[copy[j],copy[k]];
    }
    segment.forEach((i,k)=>shuffled[i]=copy[k]);
   }
   const values=calculate(shuffled);
   values.forEach((x,k)=>arrays[k].push(x-values[0]));
  }
  placebos[name]=Object.fromEntries(POLICIES.slice(1).map(p=>{
   const index=POLICIES.indexOf(p),actual=overall[p].top10-15;
   const sorted=arrays[index].sort((a,b)=>a-b);
   return [p,{realDifference:actual,expectedDifference:Number((sorted.reduce((n,x)=>n+x,0)/sorted.length).toFixed(4)),
    p05:sorted[499],median:sorted[4999],p95:sorted[9499],
    empiricalUpperTail:(1+sorted.filter(x=>x>=actual).length)/(sorted.length+1)}];
  }));
 }
 const noct=load(OUT+'NOCTURNA_PRE.json'),observed=load(ROOT+'NOCTURNA_POST_DIAGNOSTICO.json');
 const watch=observed.targets.map(h=>{
  const f=target(h);
  return {head:h,family:f,anchored:noct.pool.some(x=>x.family===f),
   originalRank:noct.pool.find(x=>x.family===f)?.originalRank??null,
   newRanks:Object.fromEntries(POLICIES.map(p=>[p,
    noct.choices[p].families.indexOf(f)===-1?null:noct.choices[p].families.indexOf(f)+1]))};
 });
 const noctPolicies=Object.fromEntries(POLICIES.map(p=>[p,{
  top:noct.choices[p].families,metrics:noct.choices[p].metrics,
  hits:noct.choices[p].families.filter(f=>observed.targets.map(target).includes(f))}]));
 save('POST_115.json',{rows:scores});
 save('NOCTURNA_POST.json',{date:'2026-10-12',watch,policies:noctPolicies,
  warning:'Simulación POST sobre PRE físico antiguo, no sustituye sellos originales del 12/10'});
 const report={date:'2026-10-13',days:23,cuts:115,
  overall,byTurn,byMonth,
  uniform20:describeSample(uniformScores,overall.COB20_P3.top10),
  rootsRewired20:describeSample(rewiredScores,overall.COB20_P3.top10),
  placebos,seal,sourcePost:sha(read(ROOT+'POST_115.json')),
  limitations:'Muchas hipótesis exploradas sobre mismos 115 cortes. Múltiples rutas por evento deduplicadas; no existe demostración de capacidad predictiva de quiniela aleatoria.'};
 save('RESUMEN.json',report);
 console.log('VT3_DIVERSIDAD_POST_OK',JSON.stringify({
  overall,byTurn:Object.fromEntries(Object.entries(byTurn).map(([k,v])=>[k,Object.fromEntries(POLICIES.map(p=>[p,v[p].top10]))])),
  byMonth:Object.fromEntries(Object.entries(byMonth).map(([k,v])=>[k,Object.fromEntries(POLICIES.map(p=>[p,v[p].top10]))])),
  neutral:report.uniform20,rootsRewired:report.rootsRewired20,placebos,
  nocturna:watch,concentrationNocturna:Object.fromEntries(POLICIES.map(p=>[p,{
   roots:noctPolicies[p].metrics.uniqueRootEvents,maxShare:noctPolicies[p].metrics.maxFamiliesSharingOneEvent}]))
 },null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')evaluate();
else throw Error('Uso: pre | post');