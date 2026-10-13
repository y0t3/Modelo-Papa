import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const DIR='auditorias/vt3-auditoria-puestos-115-13oct2026/';
const PROTOCOL='PROTOCOLO_VT3_AUDITORIA_PUESTOS_9_10_13OCT2026.md';
const SOURCE_HASH='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const N_RANDOM=2000,SEED=20261013;
const POLICIES=['OFICIAL','REEMPLAZAR_9_10_POR_11_12','REEMPLAZAR_10_POR_11','MEZCLAR_EMPATES_9_10'];
const read=p=>readFileSync(p,'utf8');
const load=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
mkdirSync(DIR,{recursive:true});
const save=(f,x)=>writeFileSync(DIR+f,JSON.stringify(x,null,2)+'\n');
const identity=r=>r.date+'|'+r.turn;
const rev=s=>[...s].reverse().join('');
const fam=h=>{assert.match(h,/^\d{4}$/);const t=h.slice(-3);return [t,rev(t)].sort().join('/')};
const take=(r,k)=>r.strategies.A_ORIGINAL.slice(0,k).map(x=>x.family);
function tuple(c){return [Number(c.bif>0),Math.min(c.bif,15),Math.min(c.d1,10),
 Math.min(c.d7,10),c.sources,c.blocks]};
const tupleId=c=>tuple(c).join('/');
function compare(a,b){
 const x=tuple(a),y=tuple(b);
 for(let k=0;k<x.length;k++)if(x[k]!==y[k])return y[k]-x[k];
 return a.family.localeCompare(b.family);
}
function cmpExact(a,b){
 const ta=tuple(a),tb=tuple(b);
 return ta.every((v,k)=>v===tb[k]);
}
function seeded(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}}
function makeCut(row){
 const candidates=row.strategies.A_ORIGINAL;
 assert.ok(candidates.length>=10);
 assert.equal(new Set(candidates.map(x=>x.family)).size,candidates.length);
 for(let k=0;k<candidates.length;k++){
  assert.equal(candidates[k].rank,k+1,'Rank no consecutivo');
  for(const f of ['bif','d1','d7','sources','blocks','anchoredPaths']){
   assert.ok(Number.isFinite(candidates[k][f]),'Falta variable de ranking '+f);
  }
  assert.ok(candidates[k].bif>=0&&candidates[k].d1>=0&&candidates[k].d7>=0);
  if(k)assert.ok(compare(candidates[k-1],candidates[k])<=0,
   'Orden lexicográfico del motor no coincide con matriz PRE en '+identity(row)+' '+k);
 }
 const top=candidates.slice(0,10).map(x=>x.family);
 const profiles=candidates.slice(0,30).map((c,k)=>({
  rank:k+1,family:c.family,
  bif:c.bif,d1:c.d1,d7:c.d7,
  sources:c.sources,blocks:c.blocks,anchoredPaths:c.anchoredPaths,
  tuple:tuple(c),tieToPrevious:k>0&&cmpExact(candidates[k-1],c),
  tieToNext:k+1<candidates.length&&cmpExact(c,candidates[k+1])
 }));
 const tieBorder=candidates.length>10&&cmpExact(candidates[9],candidates[10]);
 const tie98=cmpExact(candidates[7],candidates[8]);
 const tie910=cmpExact(candidates[8],candidates[9]);
 const tie1112=candidates.length>11&&cmpExact(candidates[10],candidates[11]);
 const n=candidates.length;
 const pairReplace11_12=n>=12?
  top.slice(0,8).concat([candidates[10].family,candidates[11].family]):
  top;
 const only11=n>=11?top.slice(0,9).concat(candidates[10].family):top;
 // The original top eight are never altered in the tie experiment.
 const hashOf=(salt,c)=>sha(SEED+'|'+row.date+'|'+row.turn+'|'+salt+'|'+c.family);
 function resolveTie(salt){
  const first8=candidates.slice(0,8);
  let tail=candidates.slice(8);
  const groups=[],seen=new Map();
  for(const c of tail){
   const k=tupleId(c);
   if(!seen.has(k)){const group=[];groups.push(group);seen.set(k,group)}
   seen.get(k).push(c);
  }
  tail=groups.flatMap(group=>group.slice().sort((a,b)=>hashOf(salt,a).localeCompare(hashOf(salt,b))));
  // Identical tuple sorting may reorder ranks9/10 even without a cross-boundary tie.
  const result=first8.concat(tail.slice(0,2)).map(x=>x.family);
  assert.equal(result.length,10);assert.equal(new Set(result).size,10);
  assert.deepEqual(result.slice(0,8),top.slice(0,8));
  if(!tieBorder)assert.deepEqual(new Set(result),new Set(top),
   'Sin empate cruzando frontera, ningún miembro debe cambiar');
  return result;
 }
 const rankings={
  OFICIAL:top,
  REEMPLAZAR_9_10_POR_11_12:pairReplace11_12,
  REEMPLAZAR_10_POR_11:only11,
  MEZCLAR_EMPATES_9_10:resolveTie('FIXED')
 };
 for(const m of POLICIES){
  assert.equal(rankings[m].length,10);
  assert.equal(new Set(rankings[m]).size,10);
 }
 const fullTieCandidates=tieBorder?
  candidates.slice(8).filter(c=>cmpExact(c,candidates[9])).map(c=>c.family):[];
 return {date:row.date,turn:row.turn,pool:n,profiles,
  candidateFamilies:candidates.map(x=>x.family),
  rankings,
  borders:{tie8_9:tie98,tie9_10:tie910,tie10_11:tieBorder,tie11_12:tie1112,
   sameTuple910:tie910,strictDropAt10:!tieBorder,fullTieCandidates},
  comparatorSuffix10:candidates[9].family,
  comparatorSuffix11:candidates[10]?.family||null};
}
function prepare(){
 assert.ok(!existsSync(ROOT+'POST_115.json'),'Hay POST visible: abortar PRE');
 assert.ok(!existsSync(ROOT+'NOCTURNA_POST_DIAGNOSTICO.json'));
 assert.equal(sha(read(ROOT+'PRE_115.json')),SOURCE_HASH);
 const base=load(ROOT+'PRE_115.json').rows;
 assert.equal(base.length,115);
 const rows=base.map(makeCut);
 const dates=[...new Set(rows.map(x=>x.date))].sort();
 assert.equal(dates.length,23);
 for(const day of dates)assert.deepEqual(rows.filter(x=>x.date===day).map(x=>x.turn),TURNS);
 const R=seeded(SEED),randomChoices=[];
 const numAndFamily=new Map(rows.map((x,i)=>[identity(x),base[i].strategies.A_ORIGINAL]));
 for(let rep=0;rep<N_RANDOM;rep++){
  const decision11to20=[],decisionTies=[];
  for(const p of rows){
   const bag=numAndFamily.get(identity(p));
   const n=bag.length;
   const eligible=bag.slice(10,Math.min(20,n));
   const f=eligible.length?eligible[Math.floor(R()*eligible.length)].family:null;
   decision11to20.push(f);
   // Salt is determined before POST; ranking only within tied tuples.
   const k='RANDOM_'+rep+'|'+p.date+'|'+p.turn;
   const suffix=bag.slice(8);
   const byPriority=new Map();
   for(const x of suffix){
    const key=tupleId(x);
    if(!byPriority.has(key))byPriority.set(key,[]);
    byPriority.get(key).push(x);
   }
   const groups=[...byPriority.values()].flatMap(g=>g.slice().sort((a,b)=>
    sha(k+'|'+a.family).localeCompare(sha(k+'|'+b.family))));
   const selected=groups.slice(0,2).map(x=>x.family);
   assert.equal(selected.length,2);
   decisionTies.push(selected);
  }
  randomChoices.push({decision11to20,decisionTies});
 }
 save('PRE_115.json',{days:dates,rows,policies:POLICIES});
 save('RANDOM_PRE.json',{seed:SEED,repetitions:N_RANDOM,rows:randomChoices});
 const sourceSeal={
  input:SOURCE_HASH,protocol:sha(read(PROTOCOL)),
  code:sha(read('scripts/lab-vt3-auditoria-puestos.mjs')),
  pre:sha(read(DIR+'PRE_115.json')),
  neutralPre:sha(read(DIR+'RANDOM_PRE.json'))
 };
 save('SELLO.json',sourceSeal);
 console.log('VT3_PUESTOS_PRE_OK',JSON.stringify({
  cuts:rows.length,ties10_11:rows.filter(x=>x.borders.tie10_11).length,
  ties9_10:rows.filter(x=>x.borders.tie9_10).length,
  ties8_9:rows.filter(x=>x.borders.tie8_9).length,
  poolMin:Math.min(...rows.map(x=>x.pool)),
  poolMax:Math.max(...rows.map(x=>x.pool)),seal:sourceSeal}));
}
function checkSeal(){
 const s=load(DIR+'SELLO.json');
 assert.equal(sha(read(ROOT+'PRE_115.json')),s.input);
 assert.equal(sha(read(PROTOCOL)),s.protocol);
 assert.equal(sha(read('scripts/lab-vt3-auditoria-puestos.mjs')),s.code);
 assert.equal(sha(read(DIR+'PRE_115.json')),s.pre);
 assert.equal(sha(read(DIR+'RANDOM_PRE.json')),s.neutralPre);
 return s;
}
function evaluate(){
 const seal=checkSeal();
 const cuts=load(DIR+'PRE_115.json').rows;
 const post=load(ROOT+'POST_115.json').rows;
 assert.equal(cuts.length,115);assert.equal(post.length,115);
 const random=load(DIR+'RANDOM_PRE.json').rows;
 assert.equal(random.length,N_RANDOM);
 const outcomes=cuts.map((c,i)=>{
  const p=post[i];assert.equal(identity(c),identity(p));
  const target=new Set(p.targets.map(fam));
  const ranks=c.profiles.map(x=>({...x,winner:target.has(x.family)}));
  const methods=Object.fromEntries(POLICIES.map(m=>{
   const names=c.rankings[m],hits=names.filter(x=>target.has(x));
   return [m,{top3:names.slice(0,3).some(x=>target.has(x)),
    top5:names.slice(0,5).some(x=>target.has(x)),top10:hits.length>0,
    hits,selected:names}];
  }));
  return {date:c.date,turn:c.turn,heads:p.targets,goals:[...target],
   rankedHits:ranks.filter(x=>x.winner),methods};
 });
 const byRank=Array.from({length:30},(_,i)=>({rank:i+1,appearances:0,
  hits:0,distinct:new Set(),features:{bif:[],d1:[],d7:[],sources:[],blocks:[],anchoredPaths:[]},
  rootKinds:{d1:0,d7:0,both:0,none:0},tiedBefore:0,tiedAfter:0}));
 for(let i=0;i<115;i++)for(const x of outcomes[i].rankedHits){
  assert.ok(x.rank>=1&&x.rank<=30);
 }
 for(const cut of cuts)for(const v of cut.profiles){
  const row=byRank[v.rank-1];row.appearances++;
  row.distinct.add(v.family);
  for(const f of Object.keys(row.features))row.features[f].push(v[f]);
  row.tiedBefore+=Number(v.tieToPrevious);row.tiedAfter+=Number(v.tieToNext);
  const k=v.d1>0&&v.d7>0?'both':v.d1>0?'d1':v.d7>0?'d7':'none';
  row.rootKinds[k]++;
 }
 for(const o of outcomes)for(const h of o.rankedHits)byRank[h.rank-1].hits++;
 const mean=list=>list.length?Number((list.reduce((a,b)=>a+b,0)/list.length).toFixed(4)):null;
 const median=list=>list.length?list.slice().sort((a,b)=>a-b)[Math.floor((list.length-1)/2)]:null;
 const slotSummary=byRank.map(r=>({rank:r.rank,appearances:r.appearances,hits:r.hits,
  distinctFamilies:r.distinct.size,rootKinds:r.rootKinds,
  average:Object.fromEntries(Object.entries(r.features).map(([k,list])=>[k,mean(list)])),
  median:Object.fromEntries(Object.entries(r.features).map(([k,list])=>[k,median(list)])),
  tiedBefore:r.tiedBefore,tiedAfter:r.tiedAfter}));
 assert.equal(slotSummary[8].hits,0);assert.equal(slotSummary[9].hits,0);
 const switches=[];
 for(let d=0;d<23;d++){
  const day=cuts.slice(d*5,d*5+5);
  for(let t=1;t<5;t++){
   const previous=day[t-1],current=day[t];
   const obj={date:current.date,from:previous.turn,to:current.turn};
   for(const rank of [8,9,10,11,12]){
    const a=previous.candidateFamilies[rank-1]||null,b=current.candidateFamilies[rank-1]||null;
    obj['sameRank'+rank]=a===b;
   }
   obj.samePair9_10=
    previous.candidateFamilies.slice(8,10).join('|')===current.candidateFamilies.slice(8,10).join('|');
   obj.sameSet9_10=previous.candidateFamilies.slice(8,10).slice().sort().join('|')===
    current.candidateFamilies.slice(8,10).slice().sort().join('|');
   switches.push(obj);
  }
 }
 function summarize(rows){
  return Object.fromEntries(POLICIES.map(p=>{
   const gained=rows.filter(x=>x.methods[p].top10&&!x.methods.OFICIAL.top10).map(identity);
   const lost=rows.filter(x=>!x.methods[p].top10&&x.methods.OFICIAL.top10).map(identity);
   return [p,{cuts:rows.length,top3:rows.filter(x=>x.methods[p].top3).length,
    top5:rows.filter(x=>x.methods[p].top5).length,
    top10:rows.filter(x=>x.methods[p].top10).length,gained,lost}];
  }));
 }
 const overall=summarize(outcomes);
 assert.deepEqual([overall.OFICIAL.top3,overall.OFICIAL.top5,overall.OFICIAL.top10],[5,8,15]);
 const byMonth=Object.fromEntries([...new Set(cuts.map(x=>x.date.slice(0,7)))].map(m=>[m,summarize(outcomes.filter(x=>x.date.startsWith(m)))]));
 const byTurn=Object.fromEntries(TURNS.map(t=>[t,summarize(outcomes.filter(x=>x.turn===t))]));
 const dates=[...new Set(cuts.map(x=>x.date))].sort();assert.equal(dates.length,23);
 const cutMap=new Map(cuts.map(x=>[identity(x),x])),outcomeMap=new Map(post.map(x=>[identity(x),x]));
 // Day-paired rank distribution: take the rank 9/10 families PRE date i and map to same-turn
 // target date j, preserving all five turns per date.
 const slots=[8,9,10,11,12],observed=Object.fromEntries(slots.map(r=>[r,slotSummary[r-1].hits]));
 const mx=Object.fromEntries(slots.map(r=>[r,Array.from({length:23},()=>Array(23).fill(0))]));
 const targetSet=Array.from({length:23},(_,i)=>TURNS.map(t=>new Set(outcomeMap.get(dates[i]+'|'+t).targets.map(fam))));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(let t=0;t<5;t++){
  const p=cutMap.get(dates[i]+'|'+TURNS[t]),g=targetSet[j][t];
  for(const r of slots){const f=p.candidateFamilies[r-1];
   mx[r][i][j]+=Number(Boolean(f)&&g.has(f));}
 }
 const measure=assign=>{
  const result=Object.fromEntries(slots.map(r=>[r,assign.reduce((n,j,i)=>n+mx[r][i][j],0)]));
  result.pair9_10=result[9]+result[10];result.pair11_12=result[11]+result[12];
  return result;
 };
 const ids=dates.map((_,i)=>i);
 assert.equal(measure(ids).pair9_10,0);
 assert.equal(measure(ids).pair11_12,3);
 function rand(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}}
 function groups(fn){const m=new Map();dates.forEach((d,i)=>{
  const key=fn(d);if(!m.has(key))m.set(key,[]);m.get(key).push(i);
 });return [...m.values()];}
 const weekday=d=>new Date(d+'T12:00:00Z').getUTCDay();
 const schemes={free:[ids],weekday:groups(weekday)};
 const permutations={};
 for(const [i,[name,clusters]] of Object.entries(schemes).entries()){
  const rng=rand(SEED+97*i),N=20000,rows=[];
  for(let z=0;z<N;z++){
   const a=[...ids];
   for(const positions of clusters){
    const copied=positions.map(index=>a[index]);
    for(let t=copied.length-1;t>0;t--){const k=Math.floor(rng()*(t+1));[copied[t],copied[k]]=[copied[k],copied[t]]}
    positions.forEach((index,k)=>a[index]=copied[k]);
   }
   rows.push(measure(a));
  }
  permutations[name]=Object.fromEntries([...slots.map(String),'pair9_10','pair11_12'].map(r=>{
   const values=rows.map(x=>x[r]).sort((a,b)=>a-b),obs=measure(ids)[r];
   return [r,{observed:obs,mean:mean(values),
    p05:values[Math.floor((N-1)*.05)],median:values[Math.floor((N-1)*.5)],
    p95:values[Math.floor((N-1)*.95)],
    tailAtMostObserved:(1+values.filter(x=>x<=obs).length)/(N+1)}];
  }));
 }
 const rotation=Array.from({length:22},(_,lag)=>({lag:lag+1,
  values:measure(ids.map(i=>(i+lag+1)%23))}));
 const sim=[];
 for(const generated of random){
  let tailWins=0,tieWins=0,allTail=0,allTie=0;
  for(let i=0;i<115;i++){
   const goals=new Set(outcomes[i].goals);
   const original9=cuts[i].rankings.OFICIAL.slice(0,9);
   const new11to20=generated.decision11to20[i];
   const randTies=generated.decisionTies[i];
   assert.ok(new11to20===null||cuts[i].candidateFamilies.slice(10,20).includes(new11to20));
   assert.equal(randTies.length,2);
   assert.ok(randTies.every(x=>cuts[i].candidateFamilies.slice(8).includes(x)));
   const winHead=goals.has(new11to20)||original9.some(f=>goals.has(f));
   const winTie=cuts[i].rankings.OFICIAL.slice(0,8).some(f=>goals.has(f))||randTies.some(f=>goals.has(f));
   allTail+=Number(winHead);allTie+=Number(winTie);
   tailWins+=Number(Boolean(new11to20)&&goals.has(new11to20));
   tieWins+=randTies.filter(f=>goals.has(f)).length;
  }
  sim.push({top10Tail:allTail,top10Tie:allTie,tailSlotWins:tailWins,tieSlotWins:tieWins});
 }
 const distr=(field)=>{
  const vals=sim.map(x=>x[field]).sort((a,b)=>a-b);
  return {mean:mean(vals),min:vals[0],max:vals.at(-1),median:median(vals),
   p05:vals[Math.floor((vals.length-1)*.05)],p95:vals[Math.floor((vals.length-1)*.95)],
   probabilityAtLeast18:vals.filter(v=>v>=18).length/vals.length};
 };
 const persistence={
  transitions:switches.length,
  eachRank:Object.fromEntries([8,9,10,11,12].map(rank=>[rank,{
   same:switches.filter(x=>x['sameRank'+rank]).length,
   changed:switches.filter(x=>!x['sameRank'+rank]).length}])),
  unchangedPair9_10:switches.filter(x=>x.samePair9_10).length,
  unchangedSet9_10:switches.filter(x=>x.sameSet9_10).length
 };
 const ties={
  comparisons:cuts.length,
  tie8_9:cuts.filter(x=>x.borders.tie8_9).length,
  tie9_10:cuts.filter(x=>x.borders.tie9_10).length,
  tie10_11:cuts.filter(x=>x.borders.tie10_11).length,
  tie11_12:cuts.filter(x=>x.borders.tie11_12).length,
  exactTenthVsEleventh:cuts.filter(x=>x.borders.tie10_11).map(x=>({date:x.date,turn:x.turn,
   rank10:x.comparatorSuffix10,rank11:x.comparatorSuffix11,tiedPool:x.borders.fullTieCandidates}))
 };
 const report={date:'2026-10-13',cuts:115,days:23,slotSummary,persistence,ties,
  controls:overall,byMonth,byTurn,dayPlacebo:permutations,rotations:rotation,
  simulated:{randomReps:N_RANDOM,
   rank11to20:distr('top10Tail'),tieShuffle:distr('top10Tie'),
   candidateRank11to20Hits:distr('tailSlotWins'),tiedRank9to10Hits:distr('tieSlotWins')},
  seal,postHash:sha(read(ROOT+'POST_115.json')),
  warning:'Mismo histórico intensamente reutilizado; puestos vacíos pueden ser azar. Evaluación retrospectiva, sin prueba prospectiva ni ventaja de sorteo.'};
 save('POST_115.json',{rows:outcomes});
 save('RESUMEN.json',report);
 console.log('VT3_PUESTOS_POST_OK',JSON.stringify({
  slots:slotSummary.slice(0,20).map(x=>({rank:x.rank,hits:x.hits,avg:x.average,median:x.median,tiedBefore:x.tiedBefore,tiedAfter:x.tiedAfter})),
  controls:overall,ties,persistence,dayPlacebo:permutations,
  simulated:report.simulated},null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')evaluate();
else throw new Error('Uso: pre | post');