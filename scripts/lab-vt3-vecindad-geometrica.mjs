import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const EARLIER='auditorias/vt3-cupo-fisico-controles-115-13oct2026/';
const OUTPUT='auditorias/vt3-vecindad-geometrica-115-13oct2026/';
const PROTO='PROTOCOLO_VT3_VECINDAD_GEOMETRICA_13OCT2026.md';
const HASH_ROOT='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const HASH_EARLIER='d5d641d02bdaa7a7ae14878ecfaa3ebdf6a3295fac44b1fa1fbf70eaabafbb0a';
const HASH_EARLIER_SEAL='125d07d3de95242b0d523419a88ee2b4d111d8b3c0bfbd8e36b78d9c3acef551';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const METHODS=['ORIGINAL','BASE_RENOVADA','G_PIVOTE','G_VECINOS','G_FUENTES','G_BLOQUE',
 'G_DENSIDAD','G_UMBRAL2','CONTROL_HASH','CONTROL_BLOQUES','CONTROL_SIN_VECINOS'];
const read=p=>readFileSync(p,'utf8'),parse=p=>JSON.parse(read(p));
const hash=x=>createHash('sha256').update(x).digest('hex');
const save=(name,obj)=>writeFileSync(OUTPUT+name,JSON.stringify(obj,null,2)+'\n');
const id=p=>p.date+'|'+p.turn;
const family=(s)=>[s,[...s].reverse().join('')].sort().join('/');
const target=(s)=>{assert.match(s,/^\d{4}$/);return family(s.slice(-3))};
mkdirSync(OUTPUT,{recursive:true});
const coord=x=>{let [r,c]=x.split(':').map(Number);assert.ok(r>=0&&r<6&&c>=0&&c<2);return [r,c]};
const block=p=>p.cells.slice().sort().join(',');
const edge=(source,a,b)=>source+'|'+[a,b].sort().join('~');
const shape=(p)=>block(p);
const rootIsReal=p=>p.anchored===true&&Array.isArray(p.rootIds)&&p.rootIds.length>0;
const pairEdges=p=>[edge(p.source,p.cells[0],p.cells[1]),edge(p.source,p.cells[1],p.cells[2])];
function edgeFamilies(records){
 const byEdge=new Map(),byBlock=new Map();
 function add(map,k,v){
  if(!map.has(k))map.set(k,[]);
  map.get(k).push(v);
 }
 for(const w of records){
  const dups=new Set();
  for(const path of w.paths){
   assert.equal(path.cells.length,3);assert.equal(new Set(path.cells).size,3);
   assert.equal(family(path.value),w.family);
   const allowed=SOURCES.includes(path.source);
   assert.ok(allowed,'fuente inexistente '+path.source);
   path.cells.forEach(coord);
   for(let i=1;i<3;i++){
    const [r1,c1]=coord(path.cells[i-1]),[r2,c2]=coord(path.cells[i]);
    assert.equal(Math.max(Math.abs(r1-r2),Math.abs(c1-c2)),1);
   }
   if(!path.anchored)assert.equal(path.rootIds.length,0);
   if(!rootIsReal(path))continue;
   const k=path.source+'|'+[path.cells.join('>'),[...path.cells].reverse().join('>')].sort()[0];
   assert.ok(!dups.has(k));dups.add(k);
   const record={family:w.family,source:path.source,middle:path.cells[1],block:shape(path)};
   for(const e of pairEdges(path))add(byEdge,e,record);
   add(byBlock,path.source+'|'+shape(path),record);
  }
 }
 return {byEdge,byBlock};
}
function auditCut(pre,whole){
 assert.equal(id(pre),id(whole));
 const rank=pre.tops.ORIGINAL;
 assert.equal(rank.length,10);
 const input=new Map(whole.witnesses.map(x=>[x.family,x.paths]));
 assert.equal(input.size,whole.witnesses.length);
 const anchoredSet=new Set(whole.strategies.A_ORIGINAL.map(x=>x.family));
 const allowedPhysical=new Set(whole.strategies.B_INVENTARIO.map(x=>x.family));
 assert.ok(pre.eligibles.every(f=>allowedPhysical.has(f)&&!anchoredSet.has(f)));
 const anchoredWitnesses=whole.witnesses.filter(x=>anchoredSet.has(x.family));
 const index=edgeFamilies(anchoredWitnesses);
 const prevEligible=new Set(pre.eligibles);
 const info=[];
 for(const f of pre.eligibles){
  const own=input.get(f);assert.ok(own?.length);
  assert.ok(own.every(x=>!x.anchored&&!x.rootIds.length));
  const neighbors=new Set(),pivots=new Set(),sameBlock=new Set(),
    contactSources=new Set(),hingeBlocks=new Set();
  let totalEdgePairs=0,totalPivotPairs=0,totalBlockPairs=0;
  const physicalBlocks=new Set(),pathsDedup=new Set();
  for(const p of own){
   const key=p.source+'|'+[p.cells.join('>'),[...p.cells].reverse().join('>')].sort()[0];
   assert.ok(!pathsDedup.has(key));pathsDedup.add(key);
   const bk=p.source+'|'+shape(p);
   physicalBlocks.add(bk);
   const seenEdges=new Set(pairEdges(p));
   for(const e of seenEdges)for(const linked of index.byEdge.get(e)||[]){
    if(linked.family===f)continue;
    neighbors.add(linked.family);
    contactSources.add(p.source);
    totalEdgePairs++;
    if(linked.middle===p.cells[1]&&linked.block!==shape(p)){
     pivots.add(linked.family);
     hingeBlocks.add(bk);
     totalPivotPairs++;
    }
   }
   for(const linked of index.byBlock.get(bk)||[]){
    if(linked.family===f)continue;
    sameBlock.add(linked.family);
    totalBlockPairs++;
   }
  }
  const old=whole.strategies.B_INVENTARIO.find(x=>x.family===f);
  assert.ok(old);
  assert.equal(physicalBlocks.size,old.blocks);
  const currentSources=new Set(own.map(x=>x.source));
  assert.equal(currentSources.size,old.sources);
  const details={family:f,anchored:false,
   ownBlocks:physicalBlocks.size,ownPaths:own.length,ownSources:currentSources.size,
   anchoredNeighborFamilies:neighbors.size,
   anchoredPivotFamilies:pivots.size,
   anchoredSameBlockFamilies:sameBlock.size,
   contactSources:contactSources.size,
   pivotBlocks:hingeBlocks.size,
   edgePairs:totalEdgePairs,pivotPairs:totalPivotPairs,blockPairs:totalBlockPairs,
   contactDensity:neighbors.size/physicalBlocks.size,
   latestPhysical:own.some(p=>p.source===SOURCES[TURNS.indexOf(pre.turn)]),
   has2AnchoredNeighbors:neighbors.size>=2
  };
  assert.ok(details.anchoredPivotFamilies<=details.anchoredNeighborFamilies);
  info.push(details);
 }
 assert.equal(info.length,pre.eligibleCount);
 assert.equal(new Set(info.map(x=>x.family)).size,info.length);
 const byFamily=new Map(info.map(x=>[x.family,x]));
 const fallback=(a,b)=>Number(b.latestPhysical)-Number(a.latestPhysical)||
  b.ownBlocks-a.ownBlocks||a.family.localeCompare(b.family);
 const comparators={
  G_PIVOTE:(a,b)=>b.anchoredPivotFamilies-a.anchoredPivotFamilies||b.pivotBlocks-a.pivotBlocks||fallback(a,b),
  G_VECINOS:(a,b)=>b.anchoredNeighborFamilies-a.anchoredNeighborFamilies||b.contactSources-a.contactSources||fallback(a,b),
  G_FUENTES:(a,b)=>b.contactSources-a.contactSources||b.anchoredNeighborFamilies-a.anchoredNeighborFamilies||fallback(a,b),
  G_BLOQUE:(a,b)=>b.anchoredSameBlockFamilies-a.anchoredSameBlockFamilies||b.blockPairs-a.blockPairs||fallback(a,b),
  G_DENSIDAD:(a,b)=>b.contactDensity-a.contactDensity||a.ownBlocks-b.ownBlocks||fallback(a,b),
  G_UMBRAL2:(a,b)=>Number(b.has2AnchoredNeighbors)-Number(a.has2AnchoredNeighbors)||b.contactDensity-a.contactDensity||fallback(a,b),
  CONTROL_HASH:(a,b)=>hash('20261013|'+pre.date+'|'+pre.turn+'|'+a.family).localeCompare(hash('20261013|'+pre.date+'|'+pre.turn+'|'+b.family)),
  CONTROL_BLOQUES:(a,b)=>b.ownBlocks-a.ownBlocks||fallback(a,b),
  CONTROL_SIN_VECINOS:(a,b)=>Number(b.anchoredNeighborFamilies===0)-Number(a.anchoredNeighborFamilies===0)||fallback(a,b)
 };
 const rankings={ORIGINAL:[...rank],BASE_RENOVADA:[...pre.tops.RENEW_LAST_BLOCKS]};
 assert.equal(info.length,pre.eligibles.length);
 for(const [m,cmp] of Object.entries(comparators)){
  const sorted=info.slice().sort(cmp);
  const winner=sorted[0]?.family;
  rankings[m]=winner?rank.slice(0,9).concat(winner):[...rank];
 }
 assert.deepEqual(rankings.BASE_RENOVADA,pre.tops.RENEW_LAST_BLOCKS);
 assert.deepEqual(rankings.CONTROL_HASH,pre.tops.RENEW_HASH_FIXED);
 for(const p of METHODS){
  const arr=rankings[p];
  assert.ok(arr&&arr.length===10&&new Set(arr).size===10);
  if(p!=='ORIGINAL')assert.deepEqual(arr.slice(0,9),rank.slice(0,9));
  const chosen=arr.at(-1);
  assert.ok(chosen===rank.at(-1)||prevEligible.has(chosen),'posición 10 no elegible');
 }
 const pool={
  eligibleCount:info.length,eligibleWithAnyNeighbor:info.filter(x=>x.anchoredNeighborFamilies>0).length,
  eligibleWithPivot:info.filter(x=>x.anchoredPivotFamilies>0).length,
  eligibleWithSameBlock:info.filter(x=>x.anchoredSameBlockFamilies>0).length,
  eligibleWithTwoNeighbors:info.filter(x=>x.has2AnchoredNeighbors).length,
  eligibleWithoutAnyContact:info.filter(x=>x.anchoredNeighborFamilies===0).length
 };
 return {date:pre.date,turn:pre.turn,pool,eligibleProfiles:info,rankings};
}
function createPre(){
 for(const p of [
  ROOT+'POST_115.json',ROOT+'NOCTURNA_POST_DIAGNOSTICO.json',
  EARLIER+'POST_115.json',EARLIER+'NOCTURNA_POST.json',
  'auditorias/vt3-transformaciones-bloque-115-13oct2026/POST_115.json',
  'auditorias/vt3-transformaciones-bloque-115-13oct2026/NOCTURNA_POST.json'
 ])assert.ok(!existsSync(p),'POST visible antes de PRE '+p);
 const all=parse(ROOT+'PRE_115.json').rows;
 const eligible=parse(EARLIER+'PRE_115.json').rows;
 assert.equal(all.length,115);assert.equal(eligible.length,115);
 assert.equal(hash(read(ROOT+'PRE_115.json')),HASH_ROOT);
 assert.equal(hash(read(EARLIER+'PRE_115.json')),HASH_EARLIER);
 assert.equal(hash(read(EARLIER+'SELLO.json')),HASH_EARLIER_SEAL);
 const newPre=all.map((row,i)=>auditCut(eligible[i],row));
 assert.equal(new Set(newPre.map(id)).size,115);
 const n=auditCut(parse(EARLIER+'NOCTURNA_PRE.json'),parse(ROOT+'NOCTURNA_SIMULACION.json').row);
 assert.equal(n.date,'2026-10-12');
 save('PRE_115.json',{rows:newPre,methods:METHODS});
 save('NOCTURNA_PRE.json',n);
 const seal={rootPre:HASH_ROOT,eligiblePre:HASH_EARLIER,
  eligibleSeal:HASH_EARLIER_SEAL,
  protocol:hash(read(PROTO)),script:hash(read('scripts/lab-vt3-vecindad-geometrica.mjs')),
  pre:hash(read(OUTPUT+'PRE_115.json')),nocturnaPre:hash(read(OUTPUT+'NOCTURNA_PRE.json')),
  priorRandomPre:hash(read(EARLIER+'RANDOM_PRE.json'))};
 save('SELLO.json',seal);
 const summary={
  cuts:115,
  eligibleExposures:newPre.reduce((x,r)=>x+r.pool.eligibleCount,0),
  byType:Object.fromEntries(['eligibleWithAnyNeighbor','eligibleWithPivot','eligibleWithSameBlock','eligibleWithTwoNeighbors','eligibleWithoutAnyContact'].map(f=>
   [f,newPre.reduce((x,r)=>x+r.pool[f],0)]))};
 console.log('VT3_VECINDAD_PRE_OK',JSON.stringify({summary,seal}));
}
function evaluate(){
 const s=parse(OUTPUT+'SELLO.json');
 assert.equal(s.rootPre,hash(read(ROOT+'PRE_115.json')));
 assert.equal(s.eligiblePre,hash(read(EARLIER+'PRE_115.json')));
 assert.equal(s.eligibleSeal,hash(read(EARLIER+'SELLO.json')));
 assert.equal(s.script,hash(read('scripts/lab-vt3-vecindad-geometrica.mjs')));
 assert.equal(s.protocol,hash(read(PROTO)));
 assert.equal(s.pre,hash(read(OUTPUT+'PRE_115.json')));
 assert.equal(s.nocturnaPre,hash(read(OUTPUT+'NOCTURNA_PRE.json')));
 assert.equal(s.priorRandomPre,hash(read(EARLIER+'RANDOM_PRE.json')));
 const pre=parse(OUTPUT+'PRE_115.json').rows;
 const post=parse(ROOT+'POST_115.json').rows;
 assert.equal(pre.length,115);assert.equal(post.length,115);
 const observations=pre.map((p,i)=>{
  const r=post[i];assert.equal(id(p),id(r));
  const winning=new Set(r.targets.map(target));
  const result=Object.fromEntries(METHODS.map(m=>{
   const top=p.rankings[m];
   return [m,{top3:top.slice(0,3).some(f=>winning.has(f)),
    top5:top.slice(0,5).some(f=>winning.has(f)),
    top10:top.some(f=>winning.has(f)),
    slot:top[9],slotWinner:winning.has(top[9])}];
  }));
  return {date:p.date,turn:p.turn,heads:r.targets,results:result};
 });
 function summarize(rows){
  return Object.fromEntries(METHODS.map(m=>{
   const wins=rows.filter(r=>r.results[m].top10);
   const gains=rows.filter(r=>r.results[m].top10&&!r.results.ORIGINAL.top10).map(id);
   const losses=rows.filter(r=>!r.results[m].top10&&r.results.ORIGINAL.top10).map(id);
   const vsBaseGains=rows.filter(r=>r.results[m].top10&&!r.results.BASE_RENOVADA.top10).map(id);
   const vsBaseLosses=rows.filter(r=>!r.results[m].top10&&r.results.BASE_RENOVADA.top10).map(id);
   return [m,{cuts:rows.length,top3:rows.filter(r=>r.results[m].top3).length,
    top5:rows.filter(r=>r.results[m].top5).length,top10:wins.length,
    slotWins:rows.filter(r=>r.results[m].slotWinner).length,
    gains,losses,vsBaseGains,vsBaseLosses}];
  }));
 }
 const all=summarize(observations);
 assert.deepEqual([all.ORIGINAL.top3,all.ORIGINAL.top5,all.ORIGINAL.top10,all.ORIGINAL.slotWins],[5,8,15,0]);
 assert.equal(all.BASE_RENOVADA.top10,18);
 const byMonth=Object.fromEntries([...new Set(pre.map(x=>x.date.slice(0,7)))].map(m=>
  [m,summarize(observations.filter(x=>x.date.startsWith(m)))]));
 const byTurn=Object.fromEntries(TURNS.map(t=>[t,summarize(observations.filter(x=>x.turn===t))]));
 const members={};
 for(const f of ['anchoredNeighborFamilies','anchoredPivotFamilies','anchoredSameBlockFamilies']){
  const selected=pre.flatMap((p,i)=>p.eligibleProfiles.map(x=>({...x,winner:post[i].targets.map(target).includes(x.family)})));
  members[f]={exposures:selected.filter(x=>x[f]>0).length,
   winners:selected.filter(x=>x[f]>0&&x.winner).length,
   zeros:selected.filter(x=>x[f]===0).length,
   winnerZeros:selected.filter(x=>x[f]===0&&x.winner).length};
 }
 const neutral=parse(EARLIER+'RANDOM_PRE.json').choices;
 assert.equal(neutral.length,2000);
 const randomTop10=[];
 for(const draw of neutral){
  assert.equal(draw.length,115);let hits=0;
  for(let i=0;i<115;i++){
   const goals=new Set(post[i].targets.map(target)),selected=draw[i];
   const prefix=pre[i].rankings.ORIGINAL.slice(0,9);
   assert.ok(selected===null||pre[i].eligibleProfiles.some(x=>x.family===selected));
   hits+=Number(prefix.some(f=>goals.has(f))||selected!==null&&goals.has(selected));
  }
  randomTop10.push(hits);
 }
 const sortedRandom=[...randomTop10].sort((a,b)=>a-b);
 const randomComparison=Object.fromEntries(METHODS.map(m=>[m,{
   top10:all[m].top10,
   neutralFractionAtLeast:sortedRandom.filter(x=>x>=all[m].top10).length/sortedRandom.length
 }]));
 const days=[...new Set(pre.map(x=>x.date))].sort();
 assert.equal(days.length,23);
 const PRE=new Map(pre.map(x=>[id(x),x])),POST=new Map(post.map(x=>[id(x),x]));
 const matrix=METHODS.map(()=>Array.from({length:23},()=>Array(23).fill(0)));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(const turn of TURNS){
  const a=PRE.get(days[i]+'|'+turn),b=POST.get(days[j]+'|'+turn);
  assert.ok(a&&b);
  const goals=new Set(b.targets.map(target));
  METHODS.forEach((m,k)=>{matrix[k][i][j]+=Number(a.rankings[m].some(f=>goals.has(f)))});
 }
 const indices=days.map((_,i)=>i);
 const count=perm=>METHODS.map((m,k)=>perm.reduce((n,j,i)=>n+matrix[k][i][j],0));
 assert.equal(count(indices)[0],15);
 function xorshift(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 const weekday=d=>new Date(d+'T12:00:00Z').getUTCDay();
 function groups(fn){
  const m=new Map();days.forEach((d,i)=>{const k=fn(d);if(!m.has(k))m.set(k,[]);m.get(k).push(i)});
  return [...m.values()];
 }
 const schemes={all:[indices],sameWeekday:groups(weekday)};
 const permControls={};
 for(const [z,[scheme,sets]] of Object.entries(schemes).entries()){
  const rand=xorshift(20261013+z*97),numbers=Object.fromEntries(METHODS.map(m=>[m,[]]));
  for(let n=0;n<10000;n++){
   const shuffled=[...indices];
   for(const positions of sets){
    const buf=positions.map(pos=>shuffled[pos]);
    for(let k=buf.length-1;k>0;k--){const j=Math.floor(rand()*(k+1));[buf[k],buf[j]]=[buf[j],buf[k]];}
    positions.forEach((pos,k)=>shuffled[pos]=buf[k]);
   }
   const v=count(shuffled),baseline=v[1];
   METHODS.forEach((m,k)=>numbers[m].push(v[k]-baseline));
  }
  permControls[scheme]=Object.fromEntries(METHODS.map(m=>{
   const vals=numbers[m].sort((a,b)=>a-b),observed=all[m].top10-all.BASE_RENOVADA.top10;
   return [m,{observed,mean:Number((vals.reduce((n,v)=>n+v,0)/vals.length).toFixed(4)),
    p05:vals[499],median:vals[4999],p95:vals[9499],
    upperTail:(1+vals.filter(v=>v>=observed).length)/(vals.length+1)}];
  }));
 }
 const npre=parse(OUTPUT+'NOCTURNA_PRE.json');
 const npost=parse(ROOT+'NOCTURNA_POST_DIAGNOSTICO.json');
 const watched=npost.targets.map(head=>{
  const familyId=target(head);
  return {head,family:familyId,eligible:npre.eligibleProfiles.some(x=>x.family===familyId),
   geometry:npre.eligibleProfiles.find(x=>x.family===familyId)||null,
   positions:Object.fromEntries(METHODS.map(m=>[m,npre.rankings[m].indexOf(familyId)<0?null:npre.rankings[m].indexOf(familyId)+1]))};
 });
 save('POST_115.json',{rows:observations});
 save('NOCTURNA_POST.json',{heads:npost.targets,watch:watched,
  note:'Reproducción retrospectiva. No sustituye las predicciones selladas antes de este sorteo.'});
 const stats={date:'2026-10-13',cuts:115,days:23,all,byMonth,byTurn,members,
  eligible:{total:pre.reduce((a,r)=>a+r.pool.eligibleCount,0),
   mean:pre.reduce((a,r)=>a+r.pool.eligibleCount,0)/115,
   anyNeighbor:pre.reduce((a,r)=>a+r.pool.eligibleWithAnyNeighbor,0),
   pivot:pre.reduce((a,r)=>a+r.pool.eligibleWithPivot,0),
   sharedBlock:pre.reduce((a,r)=>a+r.pool.eligibleWithSameBlock,0),
   twoNeighbors:pre.reduce((a,r)=>a+r.pool.eligibleWithTwoNeighbors,0)},
  randomBaseline:{mean:randomTop10.reduce((a,b)=>a+b,0)/2000,
   median:sortedRandom[999],minimum:sortedRandom[0],maximum:sortedRandom.at(-1),
   fractionAtLeast:randomComparison},
  permutationControls:permControls,
  seal:s,
  caveat:'Todas las reglas creadas después de explorar este mismo corpus histórico. Las coincidencias no prueban ventaja predictiva en sorteos aleatorios.'};
 save('RESUMEN.json',stats);
 console.log('VT3_VECINDAD_POST_OK',JSON.stringify({
  eligible:stats.eligible,members,score:Object.fromEntries(METHODS.map(m=>[m,{
   top10:all[m].top10,fromOriginal:all[m].gains,
   vsBaselineGain:all[m].vsBaseGains,vsBaselineLost:all[m].vsBaseLosses,
   randomFraction:randomComparison[m].neutralFractionAtLeast}])),
  controls:permControls,watched
 },null,2));
}
if(process.argv[2]==='pre')createPre();
else if(process.argv[2]==='post')evaluate();
else throw Error('Use pre|post');
