import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const base='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const predecessor='auditorias/vt3-nacimientos-convergencias-115-13oct2026/';
const dest='auditorias/vt3-transiciones-individuales-115-13oct2026/';
const protocol='PROTOCOLO_VT3_TRANSICIONES_INDIVIDUALES_13OCT2026.md';
const BASE_HASH='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const PRED_HASH='512331f2695e2b632c7f2077f2dd7437041d00ee724556cf754e22f986a07f2b';
const NOCT_HASH='86426d26f2a90032ae7266bc094642c558628cf43c02b9838f31134bed33b5d8';
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const sources=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const features=['birth','converge','newSource','newAnchor','newBlocks2',
 'sameShapeAcrossSources','sameEdgeGeometry','reuseOwnHistoricalRoot',
 'pastFamily1','pastFamily2','pastFamily7','sameSourceFamilyLastDay',
 'sameBlockFamilyLastDay','unanchored','nonInitialStable'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(f,x)=>writeFileSync(dest+f,JSON.stringify(x,null,2)+'\n');
const family=s=>[s,[...s].reverse().join('')].sort().join('/');
const key=r=>r.date+'|'+r.turn;
const block=p=>[...p.cells].sort().join(',');
const edge=p=>p.cells.slice(1).map((x,i)=>[p.cells[i],x].sort().join('~'));
const route=p=>p.source+'|'+[p.cells.join('>'),[...p.cells].reverse().join('>')].sort()[0];
const sourceOrder=s=>{let i=sources.indexOf(s);assert.ok(i>=0,'fuente ajena '+s);return i};
const isPalin=f=>f.split('/')[0]===f.split('/')[1];
const turnOrder=t=>{const i=turns.indexOf(t);assert.ok(i>=0);return i};
const presentWindow=(rows,n,f)=>rows.length>=n?rows.slice(-n).filter(row=>row.famSet.has(f)).length:null;
const bandBlocks=x=>Math.min(3,x);
const bandSources=x=>Math.min(2,x);
const rootType=(d1,d7)=>d1>0&&d7>0?'ambas':d1>0?'D-1':d7>0?'D-7':'ninguna';

mkdirSync(dest,{recursive:true});
assert.equal(sha(read(base+'PRE_115.json')),BASE_HASH);
assert.equal(sha(read(predecessor+'PRE_115.json')),PRED_HASH);
assert.equal(sha(read(predecessor+'NOCTURNA_PRE.json')),NOCT_HASH);

function validateWitness(row){
 const ti=turnOrder(row.turn);
 const w=new Map();
 for(const entry of row.witnesses){
  assert.ok(!w.has(entry.family));const routes=new Map();
  for(const p of entry.paths){
   assert.equal(p.cells.length,3);
   assert.equal(new Set(p.cells).size,3);
   assert.ok(sourceOrder(p.source)<=ti);
   assert.equal(family(p.value),entry.family);
   const cells=p.cells.map(c=>{
    const pieces=c.split(':').map(Number);
    assert.equal(pieces.length,2);
    assert.ok(pieces[0]>=0&&pieces[0]<6&&pieces[1]>=0&&pieces[1]<2);
    return pieces;
   });
   for(let i=1;i<3;i++){
    const [a,b]=cells[i-1],[c,d]=cells[i];
    assert.equal(Math.max(Math.abs(a-c),Math.abs(b-d)),1);
   }
   if(!p.anchored)assert.equal(p.rootIds.length,0);
   const rk=route(p);
   assert.ok(!routes.has(rk),'ruta física duplicada '+entry.family+' '+rk);
   routes.set(rk,p);
  }
  w.set(entry.family,[...routes.values()]);
 }
 assert.equal(w.size,row.strategies.B_INVENTARIO.length);
 return w;
}
function assertIntradayPrevious(last,current,lastW,currentW){
 if(!last)return 0;
 let n=0;
 for(const [f,paths] of lastW){
  const following=currentW.get(f);assert.ok(following,'Familia desapareció en la hoja acumulativa');
  const index=new Map(following.map(p=>[route(p),p]));
  for(const p of paths){
   const q=index.get(route(p));
   assert.ok(q,'Ruta en fuente previa modificada '+key(current)+' '+f);
   assert.equal(p.value,q.value);
   assert.equal(p.anchored,q.anchored);
   assert.deepEqual(p.rootIds.slice().sort(),q.rootIds.slice().sort());
   n++;
  }
 }
 return n;
}
function getProfiles(row, wmap, dailyPrior, historicSameTurn){
 const ti=turnOrder(row.turn);
 const anchored=new Map(row.strategies.A_ORIGINAL.map(f=>[f.family,f]));
 const byFamily=new Map(row.strategies.B_INVENTARIO.map(f=>[f.family,f]));
 assert.equal(byFamily.size,wmap.size);
 const output=[];
 for(const [f,witnesses] of wmap){
  const known=anchored.get(f),raw=byFamily.get(f);
  assert.ok(raw);assert.equal(Boolean(known),witnesses.some(p=>p.anchored),'anclaje contradictorio');
  const indexed=witnesses.map(p=>({...p,_i:sourceOrder(p.source),_block:block(p),_edges:edge(p)}));
  const firstIdx=Math.min(...indexed.map(p=>p._i));
  const before=indexed.filter(p=>p._i<ti),recent=indexed.filter(p=>p._i===ti);
  const oldBlocks=new Set(before.map(p=>p._block));
  const oldEdges=new Set(before.flatMap(p=>p._edges));
  const oldRoots=new Set(before.flatMap(p=>p.rootIds));
  const recentRoots=new Set(recent.flatMap(p=>p.rootIds));
  const latestBlocks=new Set(recent.map(p=>p._block));
  const state=ti===0?'INICIAL':recent.length&&before.length?'CONVERGE_FUENTES':
    recent.length?'NACE_FISICAMENTE':'YA_PRESENTE';
  const historical={};
  for(const n of [1,2,7])historical[n]=presentWindow(historicSameTurn,n,f);
  const prev=historicSameTurn.at(-1);
  const prevFamilySources=prev?.familySources.get(f)||[];
  const prevBlocks=prev?.familyBlocks.get(f)||[];
  const familySources=[...new Set(indexed.map(p=>p.source))];
  const currentBlockKeys=new Set(indexed.map(p=>p.source+'|'+p._block));
  const sourceContinuity=prev?prevFamilySources.some(s=>familySources.includes(s)):false;
  const sameBlock=prev?prevBlocks.some(b=>currentBlockKeys.has(b)):false;
  const d1=known?.d1||0,d7=known?.d7||0;
  const profile={
   family:f,anchored:Boolean(known),officialRank:known?.rank??null,
   birth:state==='NACE_FISICAMENTE',converge:state==='CONVERGE_FUENTES',
   newSource:recent.length>0,
   newAnchor:recent.some(p=>p.anchored&&p.rootIds.length>0),
   newBlocks2:latestBlocks.size>=2,
   sameShapeAcrossSources:recent.some(p=>oldBlocks.has(p._block)),
   sameEdgeGeometry:recent.some(p=>p._edges.some(e=>oldEdges.has(e))),
   reuseOwnHistoricalRoot:[...recentRoots].some(x=>oldRoots.has(x)),
   pastFamily1:historical[1]!==null&&historical[1]>0,
   pastFamily2:historical[2]!==null&&historical[2]>0,
   pastFamily7:historical[7]!==null&&historical[7]>0,
   sameSourceFamilyLastDay:sourceContinuity,
   sameBlockFamilyLastDay:sameBlock,
   unanchored:!known,
   nonInitialStable:state==='YA_PRESENTE',
   state,ageTurns:ti-firstIdx,firstSource:sources[firstIdx],
   sourceCount:familySources.length,blockCount:new Set(indexed.map(p=>p.source+'|'+p._block)).size,
   pathCount:indexed.length,
   latestSource:sources[ti],
   latestPathCount:recent.length,latestBlockCount:latestBlocks.size,
   latestAnchoredPaths:recent.filter(p=>p.anchored).length,
   latestSourcesRootIds:recentRoots.size,
   previousDayPhysical:historical[1]!==null?historical[1]>0:null,
   pastDayCounts:historical,
   d1,d7,bif:known?.bif||0,palindrome:isPalin(f),
   stratum:[Number(Boolean(known)),Number(isPalin(f)),
      bandSources(familySources.length),bandBlocks(raw.blocks),rootType(d1,d7)].join('|')
  };
  assert.equal(raw.sources,profile.sourceCount);assert.equal(raw.blocks,profile.blockCount);
  assert.ok(profile.ageTurns>=0);
  if(profile.birth)assert.ok(!before.length&&recent.length);
  if(profile.converge)assert.ok(before.length&&recent.length);
  if(profile.sameShapeAcrossSources)assert.ok(profile.converge);
  if(profile.reuseOwnHistoricalRoot)assert.ok(profile.converge&&profile.anchored);
  if(profile.newAnchor)assert.ok(profile.anchored&&profile.newSource);
  output.push(profile);
 }
 return output.sort((a,b)=>a.family.localeCompare(b.family));
}
function prep(){
 for(const path of [
   base+'POST_115.json',base+'NOCTURNA_POST_DIAGNOSTICO.json',
   predecessor+'POST_115.json',predecessor+'NOCTURNA_POST.json'
 ])assert.ok(!existsSync(path),'POST presente: '+path);
 const orig=json(base+'PRE_115.json').rows;
 const prior=json(predecessor+'PRE_115.json').rows;
 assert.equal(orig.length,115);assert.equal(prior.length,115);
 const pmap=new Map(prior.map(p=>[key(p),p]));
 const dates=[...new Set(orig.map(r=>r.date))].sort();
 assert.equal(dates.length,23);
 const output=[],historical=Object.fromEntries(turns.map(t=>[t,[]]));
 let routeRetentionChecks=0,routeCount=0;
 let prevRow=null,prevW=null;
 for(const r of orig){
  const priorRow=pmap.get(key(r));
  assert.ok(priorRow);
  const physical=validateWitness(r);
  if(prevRow?.date===r.date){
   assert.equal(turnOrder(r.turn),turnOrder(prevRow.turn)+1);
   routeRetentionChecks+=assertIntradayPrevious(prevRow,r,prevW,physical);
  }else{
   assert.equal(r.turn,'Previa');
  }
  const profiles=getProfiles(r,physical,priorRow,historical[r.turn]);
  assert.equal(profiles.length,priorRow.profiles.length);
  for(const p of profiles){
   const old=priorRow.profiles.find(x=>x.family===p.family);
   assert.ok(old);assert.equal(p.anchored,old.anchored);
   assert.equal(p.state,old.state);
   assert.equal(p.firstSource,old.firstSource);
   assert.equal(p.ageTurns,old.ageTurns);
   for(const x of features)assert.equal(typeof p[x],'boolean');
  }
  routeCount+=[...physical.values()].reduce((n,x)=>n+x.length,0);
  output.push({date:r.date,turn:r.turn,profiles});
  const familySources=new Map(),familyBlocks=new Map();
  for(const [f,ps] of physical){
   familySources.set(f,[...new Set(ps.map(p=>p.source))]);
   familyBlocks.set(f,[...new Set(ps.map(p=>p.source+'|'+block(p)))]);
  }
  historical[r.turn].push({date:r.date,famSet:new Set(physical.keys()),familySources,familyBlocks});
  prevRow=r;prevW=physical;
 }
 assert.equal(output.length,115);
 const n=json(base+'NOCTURNA_SIMULACION.json').row;
 assert.equal(n.date,'2026-10-12');assert.equal(n.turn,'Nocturno');
 const noctW=validateWitness(n);
 const noctProfiles=getProfiles(n,noctW,null,historical.Nocturno);
 const profileCount=output.reduce((n,r)=>n+r.profiles.length,0);
 const recap={days:dates.length,cuts:output.length,profileCount,routeCount,
   preservedOldRouteComparisons:routeRetentionChecks,featureNames:features,
   note:'PRE no contiene cabezas objetivo, ni selección basada en resultados'};
 save('PRE_115.json',{recap,rows:output});
 save('NOCTURNA_PRE.json',{date:n.date,turn:n.turn,profiles:noctProfiles});
 const seal={basePre:BASE_HASH,predecessorPre:PRED_HASH,nocturnaPrevious:NOCT_HASH,
  protocol:sha(read(protocol)),script:sha(read('scripts/lab-vt3-transiciones-individuales.mjs')),
  pre:sha(read(dest+'PRE_115.json')),nocturnaPre:sha(read(dest+'NOCTURNA_PRE.json'))};
 save('SELLO.json',seal);
 console.log('VT3_TRANSICIONES_PRE_OK',JSON.stringify({recap,seal}));
}
function evaluate(){
 const seal=json(dest+'SELLO.json');
 assert.equal(seal.basePre,sha(read(base+'PRE_115.json')));
 assert.equal(seal.predecessorPre,sha(read(predecessor+'PRE_115.json')));
 assert.equal(seal.nocturnaPrevious,sha(read(predecessor+'NOCTURNA_PRE.json')));
 assert.equal(seal.protocol,sha(read(protocol)));
 assert.equal(seal.script,sha(read('scripts/lab-vt3-transiciones-individuales.mjs')));
 assert.equal(seal.pre,sha(read(dest+'PRE_115.json')));
 assert.equal(seal.nocturnaPre,sha(read(dest+'NOCTURNA_PRE.json')));
 const pre=json(dest+'PRE_115.json').rows,post=json(base+'POST_115.json').rows;
 assert.equal(pre.length,115);assert.equal(post.length,115);
 const observations=pre.map((cut,i)=>{
  const p=post[i];assert.equal(key(cut),key(p));
  const target=new Set(p.targets.map(h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3))}));
  const winnerList=cut.profiles.filter(x=>target.has(x.family));
  return {date:cut.date,turn:cut.turn,winners:winnerList.map(x=>x.family),
   families:cut.profiles.map(x=>({...x,win:target.has(x.family)}))};
 });
 const expectedAnchored=observations.reduce((n,r)=>n+r.families.filter(x=>x.win&&x.anchored).length,0);
 const expectedPhysical=observations.reduce((n,r)=>n+r.winners.length,0);
 assert.equal(expectedAnchored,64);assert.equal(expectedPhysical,143);
 const months=['2026-09','2026-10'];
 function stat(rows){
  const groups=rows.flatMap(x=>x.families);
  return Object.fromEntries(features.map(feat=>{
   const pool=groups.filter(x=>x[feat]);
   return [feat,{exposures:pool.length,winningExposures:pool.filter(x=>x.win).length,
    winnerCuts:rows.filter(x=>x.families.some(y=>y.win&&y[feat])).length,
    anchoredExposures:pool.filter(x=>x.anchored).length,
    anchoredWins:pool.filter(x=>x.anchored&&x.win).length,
    unanchoredExposures:pool.filter(x=>!x.anchored).length,
    unanchoredWins:pool.filter(x=>!x.anchored&&x.win).length}];
  }));
 }
 // Paired negative controls: strata fixed within each exact date+turn cut.
 // Do not use matches where all families have the same signal: those do not discriminate.
 function matched(rows){
  const tally=Object.fromEntries(features.map(f=>[f,{observed:0,expected:0,
   winsInMixedStrata:0,exposureInMixedStrata:0,mixedStrata:0,
   winStrataWithAlternatives:0,excludedWinningExposures:0}]));
  for(const cut of rows){
   const bins=new Map();
   for(const x of cut.families){
    if(!bins.has(x.stratum))bins.set(x.stratum,[]);
    bins.get(x.stratum).push(x);
   }
   for(const group of bins.values())for(const f of features){
    const k=group.filter(x=>x.win).length;
    if(!k)continue;
    const s=group.filter(x=>x[f]).length;
    if(group.length<2||s===0||s===group.length){
     tally[f].excludedWinningExposures+=k;continue;
    }
    const current=tally[f];
    current.observed+=group.filter(x=>x.win&&x[f]).length;
    current.expected+=k*s/group.length;
    current.winsInMixedStrata+=k;
    current.exposureInMixedStrata+=group.length;
    current.mixedStrata++;
    current.winStrataWithAlternatives++;
   }
  }
  return Object.fromEntries(Object.entries(tally).map(([f,t])=>[f,{
   ...t,expected:Number(t.expected.toFixed(5)),
   observedMinusExpected:Number((t.observed-t.expected).toFixed(5)),
   ratioToMatchedReference:t.expected?Number((t.observed/t.expected).toFixed(4)):null}]));
 }
 const historicDay=[...new Set(pre.map(x=>x.date))].sort();
 assert.equal(historicDay.length,23);
 const P=new Map(observations.map(c=>[key(c),c]));
 const O=new Map(post.map(c=>[key(c),new Set(c.targets.map(h=>family(h.slice(-3))))]));
 const mx=features.map(()=>Array.from({length:23},()=>Array(23).fill(0)));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(const turn of turns){
  const p=P.get(historicDay[i]+'|'+turn),winnerSet=O.get(historicDay[j]+'|'+turn);
  assert.ok(p&&winnerSet);
  for(const x of p.families)if(winnerSet.has(x.family))
   for(let k=0;k<features.length;k++)mx[k][i][j]+=Number(x[features[k]]);
 }
 const ids=historicDay.map((_,i)=>i);
 const scores=assignment=>features.map((_,k)=>assignment.reduce((n,j,i)=>n+mx[k][i][j],0));
 const actual=scores(ids);
 const rand=seed=>{let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}};
 const rng=rand(20261013),N=10000;
 const distributions=features.map(()=>[]);
 for(let m=0;m<N;m++){
  const shuffled=[...ids];
  for(let k=22;k>0;k--){const j=Math.floor(rng()*(k+1));[shuffled[k],shuffled[j]]=[shuffled[j],shuffled[k]];}
  const values=scores(shuffled);
  values.forEach((v,k)=>distributions[k].push(v));
 }
 const control=Object.fromEntries(features.map((f,k)=>{
  const nums=distributions[k],ge=nums.filter(x=>x>=actual[k]).length;
  return [f,{observedWinningFamilyExposures:actual[k],
    mean:Number((nums.reduce((a,b)=>a+b,0)/N).toFixed(4)),
    min:Math.min(...nums),max:Math.max(...nums),
    upperTailEmpirical:(ge+1)/(N+1)}];
 }));
 const noct=json(dest+'NOCTURNA_PRE.json');
 const npost=json(base+'NOCTURNA_POST_DIAGNOSTICO.json');
 assert.equal(npost.targets.length,5);
 const watched=npost.targets.map(head=>{
  const f=family(head.slice(-3)),p=noct.profiles.find(x=>x.family===f);
  return {head,vt3:head.slice(-3),family:f,physical:Boolean(p),anchored:Boolean(p?.anchored),
   profile:p??null};
 });
 save('POST_115.json',{cuts:observations.map(c=>({date:c.date,turn:c.turn,winners:c.winners,
  winningProfiles:c.families.filter(x=>x.win)}))});
 save('NOCTURNA_POST.json',{heads:npost.targets,watched,
  warning:'Diagnóstico retrospectivo de Nocturna 12/10, no sustituye sello verdadero anterior al sorteo'});
 const report={date:'2026-10-13',cuts:115,days:23,physicalWinningExposures:expectedPhysical,
  anchoredWinningExposures:expectedAnchored,
  featureStats:stat(observations),
  byMonth:Object.fromEntries(months.map(m=>[m,stat(observations.filter(x=>x.date.startsWith(m)))])),
  matched:matched(observations),
  matchedByMonth:Object.fromEntries(months.map(m=>[m,matched(observations.filter(x=>x.date.startsWith(m)))])),
  byTurn:Object.fromEntries(turns.map(t=>[t,stat(observations.filter(x=>x.turn===t))])),
  control,seal,
  limitation:'23 jornadas ya explotadas por múltiples hipótesis; controles negativos son exploratorios. Relación espacial NO implica anticipación de resultados aleatorios.'};
 save('RESUMEN.json',report);
 console.log('VT3_TRANSICIONES_POST_OK',JSON.stringify({
  profiles:json(dest+'PRE_115.json').recap,
  observed:report.featureStats,matched:report.matched,control:report.control,
  watched:watched.map(w=>({head:w.head,physical:w.physical,anchored:w.anchored,
   state:w.profile?.state,blockEcho:w.profile?.sameShapeAcrossSources,
   edgeEcho:w.profile?.sameEdgeGeometry,anchorNew:w.profile?.newAnchor,age:w.profile?.ageTurns}))
 },null,2));
}
if(process.argv[2]==='pre')prep();else if(process.argv[2]==='post')evaluate();
else throw Error('Use pre | post');