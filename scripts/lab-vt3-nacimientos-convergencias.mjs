import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const inputDir='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const out='auditorias/vt3-nacimientos-convergencias-115-13oct2026/';
const protocol='PROTOCOLO_VT3_NACIMIENTOS_CONVERGENCIAS_13OCT2026.md';
const inputHash='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const sources=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const policies=['ORIGINAL','ANCHOR_CONVERGE','ANCHOR_SOURCE_NEW','ANCHOR_BIRTH',
 'OPEN_BIRTH_1','OPEN_CONVERGE_1','OPEN_FRESH_1','OPEN_BRIDGE_1',
 'OPEN_FRESH_2','OPEN_BRIDGE_2','OPEN_FRESH_NULL_1'];
const read=x=>readFileSync(x,'utf8');
const json=x=>JSON.parse(read(x));
const sha=x=>createHash('sha256').update(x).digest('hex');
const save=(name,obj)=>writeFileSync(out+name,JSON.stringify(obj,null,2)+'\n');
const key=x=>x.date+'|'+x.turn;
const rev=x=>[...x].reverse().join('');
const family=x=>[x,rev(x)].sort().join('/');
const unique=x=>[...new Set(x)];
const sorted=x=>[...x].sort();
const routeKey=p=>p.source+'|'+[p.cells.join('>'),[...p.cells].reverse().join('>')].sort()[0];
const blockKey=p=>p.source+'|'+sorted(p.cells).join(',');
const edges=p=>p.cells.slice(1).map((c,i)=>p.source+'|'+[p.cells[i],c].sort().join('~'));
const sourceIndex=s=>{const i=sources.indexOf(s);assert.ok(i>=0,'Fuente desconocida '+s);return i;};
const win=h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3));};
const prefHash=(date,turn,f)=>sha('20261013|'+date+'|'+turn+'|'+f).slice(0,16);
mkdirSync(out,{recursive:true});
assert.equal(sha(read(inputDir+'PRE_115.json')),inputHash);

function describe(row,ti){
 const anchors=row.strategies.A_ORIGINAL;
 const index=new Map(anchors.map(f=>[f.family,f]));
 const witnessMap=new Map(row.witnesses.map(x=>[x.family,x.paths]));
 assert.equal(witnessMap.size,row.witnesses.length);
 const edgeAnchors=new Map();
 for(const [f,paths] of witnessMap)if(index.has(f)){
  for(const p of paths.filter(x=>x.anchored))for(const e of edges(p)){
   if(!edgeAnchors.has(e))edgeAnchors.set(e,new Set());
   edgeAnchors.get(e).add(f);
  }
 }
 const out=[];
 for(const f of row.strategies.B_INVENTARIO){
  const paths=witnessMap.get(f.family);
  assert.ok(paths?.length);
  const physSources=unique(paths.map(p=>p.source));
  const currentSources=physSources.map(sourceIndex);
  assert.ok(currentSources.every(i=>i<=ti),'Fuente futura en PRE');
  const firstIndex=Math.min(...currentSources);
  const latest=physSources.includes(sources[ti]);
  const earlier=physSources.some(s=>sourceIndex(s)<ti);
  const birth=ti>0&&latest&&!earlier;
  const converge=ti>0&&latest&&earlier;
  const state=ti===0?'INICIAL':birth?'NACE_FISICAMENTE':converge?'CONVERGE_FUENTES':'YA_PRESENTE';
  const anchor=index.get(f.family);
  const latestPaths=paths.filter(p=>p.source===sources[ti]);
  const latestAnchored=latestPaths.filter(p=>p.anchored);
  const edgeNeighbors=new Set();
  if(!anchor)for(const p of paths)for(const e of edges(p))
   for(const candidate of edgeAnchors.get(e)||[])if(candidate!==f.family)edgeNeighbors.add(candidate);
  const profile={family:f.family,originalRank:anchor?.rank??null,anchored:Boolean(anchor),
   state,firstSource:sources[firstIndex],ageTurns:ti-firstIndex,latestSource:latest,
   latestAnchored:latestAnchored.length>0,olderPhysicalSource:earlier,firstAtThisTurn:birth,
   sources:physSources.length,physicalBlocks:f.blocks,
   latestBlocks:new Set(latestPaths.map(blockKey)).size,
   latestPaths:latestPaths.length,physicalPaths:paths.length,
   anchoredNeighborFamilies:edgeNeighbors.size,hasBridge:edgeNeighbors.size>0};
  if(anchor)assert.ok(paths.some(p=>p.anchored));
  else assert.ok(paths.every(p=>!p.anchored));
  out.push(profile);
 }
 assert.equal(new Set(out.map(x=>x.family)).size,out.length);
 return out;
}
function rankPolicies(row,ti,profiles){
 const anchor=profiles.filter(x=>x.anchored);
 const official=row.strategies.A_ORIGINAL.map(x=>x.family);
 assert.deepEqual(anchor.map(x=>x.family),official,'Inventario cambia orden de ancladas');
 const unanchor=profiles.filter(x=>!x.anchored);
 const officialMap=new Set(official);
 const original=[...official].slice(0,10);
 assert.equal(original.length,10);
 const byOfficial=(fn)=>[...anchor].sort((a,b)=>Number(fn(b))-Number(fn(a))||a.originalRank-b.originalRank)
  .slice(0,10).map(x=>x.family);
 const byUnanchor=(eligible,cmp,count)=> {
  const x=unanchor.filter(eligible).sort(cmp).slice(0,count).map(x=>x.family);
  assert.ok(x.every(f=>!officialMap.has(f)));
  return original.slice(0,10-x.length).concat(x);
 };
 const compareNumbers=(a,b)=>b-a;
 const birthCmp=(a,b)=>compareNumbers(a.latestBlocks,b.latestBlocks)||
   compareNumbers(a.latestPaths,b.latestPaths)||a.family.localeCompare(b.family);
 const convergeCmp=(a,b)=>compareNumbers(a.sources,b.sources)||
   compareNumbers(a.latestBlocks,b.latestBlocks)||
   compareNumbers(a.physicalBlocks,b.physicalBlocks)||a.family.localeCompare(b.family);
 const freshCmp=(a,b)=>a.ageTurns-b.ageTurns||
   compareNumbers(a.sources,b.sources)||compareNumbers(a.physicalBlocks,b.physicalBlocks)||
   a.family.localeCompare(b.family);
 const bridgeCmp=(a,b)=>compareNumbers(a.anchoredNeighborFamilies,b.anchoredNeighborFamilies)||
   a.ageTurns-b.ageTurns||compareNumbers(a.sources,b.sources)||
   compareNumbers(a.physicalBlocks,b.physicalBlocks)||a.family.localeCompare(b.family);
 const activeToday=x=>ti>0&&x.ageTurns<=2;
 const table={
  ORIGINAL:original,
  ANCHOR_CONVERGE:byOfficial(x=>x.state==='CONVERGE_FUENTES'),
  ANCHOR_SOURCE_NEW:byOfficial(x=>ti>0&&x.latestAnchored),
  ANCHOR_BIRTH:byOfficial(x=>x.state==='NACE_FISICAMENTE'),
  OPEN_BIRTH_1:byUnanchor(x=>x.state==='NACE_FISICAMENTE',birthCmp,1),
  OPEN_CONVERGE_1:byUnanchor(x=>x.state==='CONVERGE_FUENTES',convergeCmp,1),
  OPEN_FRESH_1:byUnanchor(activeToday,freshCmp,1),
  OPEN_BRIDGE_1:byUnanchor(x=>activeToday(x)&&x.hasBridge,bridgeCmp,1),
  OPEN_FRESH_2:byUnanchor(activeToday,freshCmp,2),
  OPEN_BRIDGE_2:byUnanchor(x=>activeToday(x)&&x.hasBridge,bridgeCmp,2),
  OPEN_FRESH_NULL_1:byUnanchor(activeToday,(a,b)=>
   prefHash(row.date,row.turn,a.family).localeCompare(prefHash(row.date,row.turn,b.family)),1)
 };
 for(const [name,arr] of Object.entries(table)){
  assert.ok(policies.includes(name));assert.equal(arr.length,10,name);
  assert.equal(new Set(arr).size,10,name);
  const open=arr.filter(f=>!officialMap.has(f));
  if(name.startsWith('OPEN_')){
   assert.ok(open.length<=Number(name.match(/_(\d)$/)?.[1]||1));
   assert.deepEqual(arr.slice(0,10-open.length),original.slice(0,10-open.length));
  }else assert.ok(!open.length);
 }
 return table;
}
function invariant(prev,now){
 if(!prev)return {checked:0,changes:0};
 const current=new Map(now.witnesses.map(x=>[x.family,new Map(x.paths.map(p=>[routeKey(p),p]))]));
 let checked=0;
 for(const w of prev.witnesses){
  const f=current.get(w.family);
  assert.ok(f,'Familia física desapareció al añadir una fuente');
  for(const p of w.paths){
   const q=f.get(routeKey(p));
   assert.ok(q,'Ruta física previa desapareció '+w.family+' '+routeKey(p));
   assert.equal(q.anchored,p.anchored,'Cambió anclaje de ruta en fuente antigua');
   checked++;
  }
 }
 return {checked,changes:0};
}
function prepare(){
 assert.ok(!existsSync(inputDir+'POST_115.json'),'Fuga: mover POST primero');
 assert.ok(!existsSync(inputDir+'NOCTURNA_POST_DIAGNOSTICO.json'),'Fuga: mover POST nocturno primero');
 const raw=json(inputDir+'PRE_115.json').rows;
 assert.equal(raw.length,115);
 const lookup=new Map(raw.map(r=>[key(r),r]));
 const dates=unique(raw.map(x=>x.date)).sort();
 assert.equal(dates.length,23);
 let checks=0;
 const rows=[],stateCounts={};
 for(const date of dates)for(let ti=0;ti<5;ti++){
  const turn=turns[ti],row=lookup.get(date+'|'+turn);
  const prev=ti?lookup.get(date+'|'+turns[ti-1]):null;
  assert.ok(row);if(ti)assert.ok(prev);
  checks+=invariant(prev,row).checked;
  const profiles=describe(row,ti),ranking=rankPolicies(row,ti,profiles);
  for(const f of profiles){
   const key=(f.anchored?'ANCLADA_':'NO_ANCLADA_')+f.state;
   stateCounts[key]=(stateCounts[key]||0)+1;
  }
  rows.push({date,turn,ti,profiles,rankings:ranking,
   stats:{physical:profiles.length,anchored:profiles.filter(x=>x.anchored).length,
    unanchored:profiles.filter(x=>!x.anchored).length}});
 }
 const summary={dates,cuts:115,verifiedHistoricalPathRetention:checks,states:stateCounts,
  policyNames:policies,days:dates.length};
 save('PRE_115.json',{summary,rows});
 const seal={sourcePre:inputHash,protocol:sha(read(protocol)),
  script:sha(read('scripts/lab-vt3-nacimientos-convergencias.mjs')),
  generatedPre:sha(read(out+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('VT3_NACIMIENTOS_PRE_PASS',JSON.stringify({summary,seal}));
}
function evaluate(){
 const seal=json(out+'SELLO.json');
 assert.equal(seal.sourcePre,sha(read(inputDir+'PRE_115.json')));
 assert.equal(seal.protocol,sha(read(protocol)));
 assert.equal(seal.script,sha(read('scripts/lab-vt3-nacimientos-convergencias.mjs')));
 assert.equal(seal.generatedPre,sha(read(out+'PRE_115.json')));
 const pre=json(out+'PRE_115.json').rows;
 const post=json(inputDir+'POST_115.json').rows;
 assert.equal(pre.length,115);assert.equal(post.length,115);
 const actualRows=[];
 for(let i=0;i<115;i++){
  const cut=pre[i],r=post[i];assert.equal(key(cut),key(r));
  const wins=new Set(r.targets.map(win));
  const cases=Object.fromEntries(policies.map(p=>{
   const names=cut.rankings[p],hits=names.filter(f=>wins.has(f));
   const anchored=new Set(cut.profiles.filter(f=>f.anchored).map(f=>f.family));
   return [p,{top3:names.slice(0,3).some(f=>wins.has(f)),
    top5:names.slice(0,5).some(f=>wins.has(f)),
    top10:hits.length>0,hits,
    admittedWithoutRoot:names.filter(f=>!anchored.has(f)),
    newWinningFamilies:hits.filter(f=>!anchored.has(f))}];
  }));
  actualRows.push({date:cut.date,turn:cut.turn,heads:r.targets,cases});
 }
 function stats(rows){
  const counts=Object.fromEntries(policies.map(p=>[p,{cuts:0,top3:0,top5:0,top10:0,
   winningFamilies:0,unanchoredSelected:0,unanchoredWinning:0}]));
  const losses=Object.fromEntries(policies.filter(p=>p!=='ORIGINAL')
   .map(p=>[p,{rescued:[],lost:[],changedTop10:0}]));
  for(const row of rows)for(const p of policies){
   const c=row.cases[p],s=counts[p];
   s.cuts++;s.top3+=Number(c.top3);s.top5+=Number(c.top5);
   s.top10+=Number(c.top10);s.winningFamilies+=c.hits.length;
   s.unanchoredSelected+=c.admittedWithoutRoot.length;
   s.unanchoredWinning+=c.newWinningFamilies.length;
   if(p!=='ORIGINAL'){
    if(c.top10&&!row.cases.ORIGINAL.top10)losses[p].rescued.push(key(row));
    if(!c.top10&&row.cases.ORIGINAL.top10)losses[p].lost.push(key(row));
   }
  }
  return {counts,paired:losses};
 }
 const all=stats(actualRows);
 assert.deepEqual([all.counts.ORIGINAL.top3,all.counts.ORIGINAL.top5,all.counts.ORIGINAL.top10],[5,8,15]);
 const byTurn=Object.fromEntries(turns.map(t=>[t,stats(actualRows.filter(x=>x.turn===t))]));
 const months=unique(actualRows.map(x=>x.date.slice(0,7)));
 const byMonth=Object.fromEntries(months.map(m=>[m,stats(actualRows.filter(x=>x.date.startsWith(m)))]));
 const stateStats={};
 for(let i=0;i<115;i++){
  const cut=pre[i],wins=new Set(post[i].targets.map(win));
  for(const f of cut.profiles){
   const k=(f.anchored?'ANCLADA_':'NO_ANCLADA_')+f.state;
   if(!stateStats[k])stateStats[k]={exposures:0,winningFamilies:0,
     familiesInOriginalTop10:0,winnersInOriginalTop10:0};
   const s=stateStats[k],inTop=cut.rankings.ORIGINAL.includes(f.family);
   s.exposures++;s.winningFamilies+=Number(wins.has(f.family));
   s.familiesInOriginalTop10+=Number(inTop);
   s.winnersInOriginalTop10+=Number(inTop&&wins.has(f.family));
  }
 }
 // Negative controls: preserve day blocks of all five turns; only move POST bundles.
 const dates=unique(pre.map(x=>x.date)).sort();
 const imap=new Map(pre.map(x=>[key(x),x]));
 const omap=new Map(post.map(x=>[key(x),x]));
 const K=policies.length;
 const mx=Array.from({length:K},()=>Array.from({length:23},()=>Array(23).fill(0)));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(const turn of turns){
  const cut=imap.get(dates[i]+'|'+turn),p=omap.get(dates[j]+'|'+turn);
  const targets=new Set(p.targets.map(win));
  for(let k=0;k<K;k++)mx[k][i][j]+=Number(cut.rankings[policies[k]].some(f=>targets.has(f)));
 }
 const identity=dates.map((_,i)=>i);
 function score(assign){
  return Object.fromEntries(policies.map((p,k)=>[p,assign.reduce((s,j,i)=>s+mx[k][i][j],0)]));
 }
 assert.equal(score(identity).ORIGINAL,15);
 function random(seed){let state=seed>>>0;return ()=>{
  state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;
 }}
 function shuffle(rng){
  const a=[...identity];
  for(let i=a.length-1;i>0;i--){
   const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];
  }return a;
 }
 const rng=random(20261013),N=10000,permutations=policies.map(()=>[]),rotations=policies.map(()=>[]);
 for(let shift=1;shift<23;shift++){
  const m=score(identity.map(i=>(i+shift)%23));
  policies.forEach((p,k)=>rotations[k].push(m[p]-m.ORIGINAL));
 }
 for(let z=0;z<N;z++){
  const s=score(shuffle(rng));
  policies.forEach((p,k)=>permutations[k].push(s[p]-s.ORIGINAL));
 }
 function quantile(v,p){const a=[...v].sort((a,b)=>a-b);return a[Math.floor((a.length-1)*p)]}
 const nullVsOriginal=Object.fromEntries(policies.filter(p=>p!=='ORIGINAL').map((p)=>{
  const k=policies.indexOf(p),obs=all.counts[p].top10-15,v=permutations[k];
  return [p,{observedDifference:obs,permutationMean:Number((v.reduce((a,b)=>a+b,0)/N).toFixed(4)),
   p05:quantile(v,.05),median:quantile(v,.5),p95:quantile(v,.95),
   tailAtLeastObserved:(1+v.filter(x=>x>=obs).length)/(N+1),
   rotationMin:Math.min(...rotations[k]),rotationMax:Math.max(...rotations[k]),
   rotationsAtLeast:rotations[k].filter(x=>x>=obs).length}];
 }));
 const summary={date:'2026-10-13',source:'23 fechas, 115 cortes, mismo PRE original',
  all,byTurn,byMonth,stateStats,nullVsOriginal,seal,
  inputPostHash:sha(read(inputDir+'POST_115.json')),
  limitation:'Ensayo retrospectivo entre familias físicamente posibles; los sorteos aleatorios no tienen por qué seguir trazos. El mismo corpus se usó en muchas hipótesis, no es holdout.'};
 save('POST_115.json',{rows:actualRows});
 save('RESUMEN.json',summary);
 console.log('VT3_NACIMIENTOS_POST_PASS',JSON.stringify({
  preStates:json(out+'PRE_115.json').summary.states,
  scores:all.counts,
  paired:Object.fromEntries(Object.entries(all.paired).map(([k,v])=>[k,{rescued:v.rescued,lost:v.lost}])),
  perTurn:Object.fromEntries(Object.entries(byTurn).map(([k,v])=>[k,Object.fromEntries(Object.entries(v.counts).map(([p,q])=>[p,q.top10]))])),
  stateStats,nullVsOriginal},null,2));
}
const mode=process.argv[2];
if(mode==='pre')prepare();else if(mode==='post')evaluate();else throw Error('Use pre|post');
