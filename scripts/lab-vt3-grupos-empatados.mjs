import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const LAST='auditorias/vt3-auditoria-puestos-115-13oct2026/';
const OUT='auditorias/vt3-grupos-empatados-frontera-115-13oct2026/';
const DOC='PROTOCOLO_VT3_GRUPOS_EMPATADOS_13OCT2026.md';
const HASH='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const LAST_PRE_HASH='aefca578e4b2a5da5cdf8784c7538976452cad7b627481ac0bdee2299b7f72ee';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const N=2000;
const METHODS=['ORIGINAL','MAS_BLOQUES_ANCLADOS','MAS_TRAMOS_ANCLADOS',
 'RAIZ_EN_FUENTE_RECIENTE','AUSENTE_JORNADA_ANTERIOR','PROPORCION_ANCLADA',
 'ALFABETO_INVERSO','HASH_FIJO'];
const read=p=>readFileSync(p,'utf8'),load=p=>JSON.parse(read(p));
const sha=x=>createHash('sha256').update(x).digest('hex');
const save=(f,o)=>writeFileSync(OUT+f,JSON.stringify(o,null,2)+'\n');
const id=r=>r.date+'|'+r.turn;
const family=v=>[v,[...v].reverse().join('')].sort().join('/');
const goal=h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3))};
const tuple=x=>[Number(x.bif>0),Math.min(x.bif,15),Math.min(x.d1,10),
 Math.min(x.d7,10),x.sources,x.blocks];
const tupkey=x=>tuple(x).join('|');
const same=(a,b)=>tupkey(a)===tupkey(b);
function compare(a,b){
 const x=tuple(a),y=tuple(b);
 for(let k=0;k<x.length;k++)if(x[k]!==y[k])return y[k]-x[k];
 return a.family.localeCompare(b.family);
}
const coordPath=p=>p.cells.join('>');
const reversePath=p=>[...p.cells].reverse().join('>');
const routeKey=p=>p.source+'|'+[coordPath(p),reversePath(p)].sort()[0];
const block=p=>p.source+'|'+p.cells.slice().sort().join(',');
const edges=p=>[0,1].map(k=>p.source+'|'+[p.cells[k],p.cells[k+1]].sort().join('~'));
const rootBearing=p=>p.anchored&&p.rootIds.length>0;
const sourceIndex=s=>{const i=SOURCES.indexOf(s);assert.ok(i>=0,'fuente desconocida: '+s);return i};
function rng(seed){
 let s=seed>>>0;
 return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296};
}
function physicalProfile(candidate,witnesses,turn,priorRow){
 const w=witnesses.get(candidate.family);
 assert.ok(w?.length,'sin testigos físicos anclados '+candidate.family);
 const paths=w,rooted=paths.filter(rootBearing);
 assert.ok(rooted.length,'anclada sin ruta con raíz '+candidate.family);
 const allKeys=paths.map(routeKey);
 assert.equal(new Set(allKeys).size,paths.length,'rutas físicas duplicadas');
 for(const p of paths){
  assert.ok(SOURCES.includes(p.source));
  assert.equal(p.cells.length,3);
  assert.equal(new Set(p.cells).size,3);
  if(!p.anchored)assert.equal(p.rootIds.length,0);
 }
 const rootedBlocks=new Set(rooted.map(block));
 const rootedEdges=new Set(rooted.flatMap(edges));
 const rootedMiddles=new Set(rooted.map(p=>p.source+'|'+p.cells[1]));
 const mostRecent=Math.max(...rooted.map(p=>sourceIndex(p.source)));
 const newlyVisible=SOURCES[TURNS.indexOf(turn)];
 const prevPhysical=priorRow?.strategies.B_INVENTARIO.some(x=>x.family===candidate.family);
 const prevAnchored=priorRow?.strategies.A_ORIGINAL.some(x=>x.family===candidate.family);
 const result={
  family:candidate.family,originalRank:candidate.rank,
  rootD1:candidate.d1,rootD7:candidate.d7,
  bif:candidate.bif,sources:candidate.sources,blocks:candidate.blocks,
  physicalPaths:paths.length,rootedRoutes:rooted.length,
  rootedBlocks:rootedBlocks.size,rootedEdges:rootedEdges.size,rootedMiddles:rootedMiddles.size,
  newestRootSource:mostRecent,
  rootedAtLatestSource:rooted.some(p=>p.source===newlyVisible),
  rootedFraction:rooted.length/paths.length,
  previousWindowComplete:Boolean(priorRow),
  physicallyAbsentPreviousSameTurn:Boolean(priorRow&&!prevPhysical),
  rootedAbsentPreviousSameTurn:Boolean(priorRow&&!prevAnchored),
  independentHistoricalEvents:candidate.d1+candidate.d7
 };
 assert.ok(result.rootedBlocks<=candidate.blocks);
 assert.ok(rooted.length<=paths.length);
 assert.ok(candidate.anchoredPaths>=rooted.length || candidate.anchoredPaths===0,
  'conteo anclado inconsistente');
 return result;
}
function makeCut(row,priorRow){
 const list=row.strategies.A_ORIGINAL;
 assert.ok(list.length>=11);
 for(let i=1;i<list.length;i++)assert.ok(compare(list[i-1],list[i])<=0,'Ranking original alterado');
 const original=list.slice(0,10).map(x=>x.family);
 const tie=same(list[9],list[10]);
 const start=tie?list.findIndex(x=>same(x,list[9])):null;
 let end=tie?start:null;
 if(tie)while(end<list.length&&same(list[end],list[9]))end++;
 const witnessMap=new Map(row.witnesses.map(w=>[w.family,w.paths]));
 const allFamilies=new Set(row.strategies.B_INVENTARIO.map(x=>x.family));
 const ranked=new Map(list.map(x=>[x.family,x]));
 for(const f of original)assert.ok(allFamilies.has(f));
 const stronger=tie?list.slice(8,Math.max(8,start)).map(x=>x.family):[];
 const free=tie?list.slice(Math.max(8,start),end):[];
 const slots=tie?2-stronger.length:0;
 if(tie){
  assert.ok(slots>=1&&slots<=2);
  assert.ok(free.length>slots);
  assert.ok(free.every(c=>same(c,list[9])));
 }
 const candidates=free.map(x=>physicalProfile(x,witnessMap,row.turn,priorRow));
 const originalRank=new Map(list.map((x,i)=>[x.family,i+1]));
 const officialOrder=(a,b)=>a.originalRank-b.originalRank;
 function choose(ordered){
  if(!tie)return [...original];
  const chosen=ordered.slice(0,slots).sort(officialOrder).map(x=>x.family);
  const result=[...original.slice(0,8),...stronger,...chosen];
  assert.equal(result.length,10);
  assert.equal(new Set(result).size,10);
  assert.deepEqual(result.slice(0,8),original.slice(0,8));
  return result;
 }
 function pick(cmp){return choose(candidates.slice().sort(cmp));}
 const fallback=(a,b)=>a.originalRank-b.originalRank;
 const methods={
  ORIGINAL:original,
  MAS_BLOQUES_ANCLADOS:pick((a,b)=>b.rootedBlocks-a.rootedBlocks||
   b.rootedEdges-a.rootedEdges||fallback(a,b)),
  MAS_TRAMOS_ANCLADOS:pick((a,b)=>b.rootedEdges-a.rootedEdges||
   b.rootedMiddles-a.rootedMiddles||fallback(a,b)),
  RAIZ_EN_FUENTE_RECIENTE:pick((a,b)=>Number(b.rootedAtLatestSource)-Number(a.rootedAtLatestSource)||
   b.newestRootSource-a.newestRootSource||fallback(a,b)),
  AUSENTE_JORNADA_ANTERIOR:pick((a,b)=>Number(b.physicallyAbsentPreviousSameTurn)-
   Number(a.physicallyAbsentPreviousSameTurn)||fallback(a,b)),
  PROPORCION_ANCLADA:pick((a,b)=>b.rootedFraction-a.rootedFraction||fallback(a,b)),
  ALFABETO_INVERSO:pick((a,b)=>b.family.localeCompare(a.family)),
  HASH_FIJO:pick((a,b)=>sha('20261013|'+row.date+'|'+row.turn+'|'+a.family)
   .localeCompare(sha('20261013|'+row.date+'|'+row.turn+'|'+b.family)))
 };
 for(const m of METHODS){
  assert.equal(methods[m].length,10);
  assert.equal(new Set(methods[m]).size,10);
  if(!tie)assert.deepEqual(methods[m],original);
 }
 if(tie)assert.deepEqual(choose(candidates.slice().sort(officialOrder)),original);
 return {date:row.date,turn:row.turn,tieBoundary:tie,
  boundaryTuple:tupkey(list[9]),
  fullGroupStartRank:tie?start+1:null,fullGroupEndRank:tie?end:null,
  wholeGroupSize:tie?end-start:0,
  protectedFromGroup:tie?Math.max(0,8-start):0,
  strongerAfterRank8:stronger,competitionSlots:slots,
  candidates,rankings:methods,
  officialTop:original,
  originalCrossoverMembers:tie?free.slice(0,slots).map(c=>c.family):[],
  candidateFamilyCount:free.length};
}
function prepare(){
 for(const p of [ROOT+'POST_115.json',ROOT+'NOCTURNA_POST_DIAGNOSTICO.json',
   LAST+'POST_115.json'])assert.ok(!existsSync(p),'POST visible en etapa PRE '+p);
 assert.equal(sha(read(ROOT+'PRE_115.json')),HASH);
 assert.equal(sha(read(LAST+'PRE_115.json')),LAST_PRE_HASH);
 const base=load(ROOT+'PRE_115.json').rows,prior=load(LAST+'PRE_115.json').rows;
 assert.equal(base.length,115);assert.equal(prior.length,115);
 const dates=[...new Set(base.map(x=>x.date))].sort();
 assert.equal(dates.length,23);
 const lookup=new Map(base.map(x=>[id(x),x]));
 const rows=[];
 for(let day=0;day<23;day++)for(const turn of TURNS){
  const row=lookup.get(dates[day]+'|'+turn);
  const priorRow=day>0?lookup.get(dates[day-1]+'|'+turn):null;
  assert.ok(row);if(priorRow)assert.ok(priorRow.date<row.date);
  rows.push(makeCut(row,priorRow));
 }
 assert.deepEqual(rows.map(x=>x.tieBoundary),
   prior.map(x=>x.borders.tie10_11),'número de empates no coincide con auditoría anterior');
 assert.equal(rows.filter(x=>x.tieBoundary).length,62);
 const R=rng(20261013),random=[];
 for(let run=0;run<N;run++){
  const decisions=rows.map(row=>{
   if(!row.tieBoundary)return null;
   const eligible=row.candidates.map(x=>x.family);
   const deck=eligible.slice();
   for(let i=0;i<row.competitionSlots;i++){
    const pick=i+Math.floor(R()*(deck.length-i));
    [deck[pick],deck[i]]=[deck[i],deck[pick]];
   }
   const picked=deck.slice(0,row.competitionSlots);
   picked.sort((a,b)=>row.candidates.find(x=>x.family===a).originalRank-
                        row.candidates.find(x=>x.family===b).originalRank);
   assert.equal(picked.length,row.competitionSlots);
   return picked;
  });
  random.push(decisions);
 }
 save('PRE_115.json',{dates,rows,methods:METHODS});
 save('AZAR_PRE_2000.json',{seed:20261013,repetitions:N,decisions:random});
 const seal={source:HASH,priorPre:LAST_PRE_HASH,
  code:sha(read('scripts/lab-vt3-grupos-empatados.mjs')),
  protocol:sha(read(DOC)),
  pre:sha(read(OUT+'PRE_115.json')),
  randomPre:sha(read(OUT+'AZAR_PRE_2000.json'))};
 save('SELLO.json',seal);
 const border=rows.filter(x=>x.tieBoundary);
 console.log('VT3_GRUPOS_PRE_OK',JSON.stringify({
  cuts:rows.length,boundaries:border.length,
  fullGroups:border.map(x=>x.wholeGroupSize),
  slots:Object.fromEntries([1,2].map(i=>[i,border.filter(x=>x.competitionSlots===i).length])),
  totalCompetingFamilies:border.reduce((a,b)=>a+b.candidates.length,0),seal}));
}
function post(){
 const seal=load(OUT+'SELLO.json');
 for(const [expected,actual] of [
  [seal.source,sha(read(ROOT+'PRE_115.json'))],
  [seal.priorPre,sha(read(LAST+'PRE_115.json'))],
  [seal.code,sha(read('scripts/lab-vt3-grupos-empatados.mjs'))],
  [seal.protocol,sha(read(DOC))],
  [seal.pre,sha(read(OUT+'PRE_115.json'))],
  [seal.randomPre,sha(read(OUT+'AZAR_PRE_2000.json'))]
 ])assert.equal(expected,actual,'Sellos PRE alterados');
 const pre=load(OUT+'PRE_115.json').rows,post=load(ROOT+'POST_115.json').rows;
 const neutral=load(OUT+'AZAR_PRE_2000.json').decisions;
 assert.equal(pre.length,115);assert.equal(post.length,115);assert.equal(neutral.length,N);
 const perCut=pre.map((cut,i)=>{
  const q=post[i];assert.equal(id(cut),id(q));
  const wins=new Set(q.targets.map(goal));
  const methods=Object.fromEntries(METHODS.map(p=>{
   const list=cut.rankings[p],hits=list.filter(x=>wins.has(x));
   return [p,{top3:list.slice(0,3).some(f=>wins.has(f)),
    top5:list.slice(0,5).some(f=>wins.has(f)),top10:hits.length>0,
    winningFamilies:hits}];
  }));
  const tiedWins=cut.candidates.filter(x=>wins.has(x.family)).map(x=>x.family);
  const originalInCut=cut.originalCrossoverMembers.filter(x=>wins.has(x));
  const coreHit=cut.officialTop.slice(0,8).some(f=>wins.has(f));
  const strongerHit=cut.strongerAfterRank8.some(f=>wins.has(f));
  return {date:cut.date,turn:cut.turn,tieBoundary:cut.tieBoundary,
    targetHeads:q.targets,methods,
    familyWinnersInTie:tiedWins,originalChosenWinnersInTie:originalInCut,
    outsideWinnersInTie:tiedWins.filter(x=>!cut.originalCrossoverMembers.includes(x)),
    groupContainsWin:tiedWins.length>0,unavoidableWin:coreHit||strongerHit};
 });
 function summarize(rows){
  const scoring=Object.fromEntries(METHODS.map(m=>{
   const gained=rows.filter(x=>x.methods[m].top10&&!x.methods.ORIGINAL.top10).map(id);
   const lost=rows.filter(x=>!x.methods[m].top10&&x.methods.ORIGINAL.top10).map(id);
   return [m,{cuts:rows.length,top3:rows.filter(x=>x.methods[m].top3).length,
    top5:rows.filter(x=>x.methods[m].top5).length,
    top10:rows.filter(x=>x.methods[m].top10).length,gained,lost}];
  }));
  return scoring;
 }
 const overall=summarize(perCut);
 assert.deepEqual([overall.ORIGINAL.top3,overall.ORIGINAL.top5,overall.ORIGINAL.top10],[5,8,15]);
 const tied=perCut.filter(x=>x.tieBoundary);
 assert.equal(tied.length,62);
 const observedGroupWinners=tied.reduce((sum,x)=>sum+x.familyWinnersInTie.length,0);
 const possibleRescuable=tied.filter(x=>!x.unavoidableWin&&x.outsideWinnersInTie.length>0);
 const exactExpected=pre.reduce((sum,r,i)=>{
  if(!r.tieBoundary)return sum;
  const goalSet=new Set(post[i].targets.map(goal));
  const w=r.candidates.filter(c=>goalSet.has(c.family)).length;
  return sum+r.competitionSlots*w/r.candidates.length;
 },0);
 const randomResults=[];
 for(const draws of neutral){
  assert.equal(draws.length,115);
  let totalHits=0,chosenWinnerExposures=0,chosenWinnerCuts=0;
  for(let i=0;i<115;i++){
   const cut=pre[i],wins=new Set(perCut[i].targetHeads.map(goal)),extra=draws[i];
   let top=cut.officialTop;
   if(cut.tieBoundary){
    assert.equal(extra.length,cut.competitionSlots);
    const free=new Set(cut.candidates.map(c=>c.family));
    assert.equal(new Set(extra).size,extra.length);
    for(const f of extra)assert.ok(free.has(f));
    top=[...cut.officialTop.slice(0,8),...cut.strongerAfterRank8,...extra];
    chosenWinnerExposures+=extra.filter(f=>wins.has(f)).length;
    chosenWinnerCuts+=Number(extra.some(f=>wins.has(f)));
   }else assert.equal(extra,null);
   assert.equal(top.length,10);
   totalHits+=Number(top.some(f=>wins.has(f)));
  }
  randomResults.push({top10:totalHits,winnerExposures:chosenWinnerExposures,
   winnerCuts:chosenWinnerCuts});
 }
 function distribution(field,against=null){
  const vals=randomResults.map(x=>x[field]).sort((a,b)=>a-b);
  return {min:vals[0],p05:vals[99],median:vals[999],p95:vals[1899],max:vals.at(-1),
   mean:Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(5)),
   fractionAtLeastAgainst:against===null?null:vals.filter(x=>x>=against).length/vals.length,
   histogram:Object.fromEntries([...new Set(vals)].map(v=>[String(v),vals.filter(x=>x===v).length]))};
 }
 const controlRandom=Object.fromEntries(METHODS.map(p=>[p,distribution('top10',overall[p].top10)]));
 const month=Object.fromEntries([...new Set(pre.map(x=>x.date.slice(0,7)))].map(x=>
  [x,summarize(perCut.filter(r=>r.date.startsWith(x)))]));
 const turn=Object.fromEntries(TURNS.map(x=>[x,summarize(perCut.filter(r=>r.turn===x))]));
 const dates=[...new Set(pre.map(x=>x.date))].sort();
 const look=new Map(pre.map(x=>[id(x),x]));
 const outcome=new Map(post.map(x=>[id(x),new Set(x.targets.map(goal))]));
 const mx=METHODS.map(()=>Array.from({length:23},()=>Array(23).fill(0)));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(const t of TURNS){
  const row=look.get(dates[i]+'|'+t),wins=outcome.get(dates[j]+'|'+t);
  assert.ok(row&&wins);
  for(let k=0;k<METHODS.length;k++)
   mx[k][i][j]+=Number(row.rankings[METHODS[k]].some(f=>wins.has(f)));
 }
 const ids=dates.map((_,i)=>i);
 const sums=perm=>METHODS.map((_,k)=>perm.reduce((s,j,i)=>s+mx[k][i][j],0));
 assert.equal(sums(ids)[0],15);
 const weekday=d=>new Date(d+'T12:00:00Z').getUTCDay();
 const byWeekday=new Map();
 dates.forEach((d,i)=>{const k=weekday(d);if(!byWeekday.has(k))byWeekday.set(k,[]);byWeekday.get(k).push(i)});
 const schemes={free:[ids],sameWeekday:[...byWeekday.values()]};
 const controls={};
 for(const [idx,[name,groups]] of Object.entries(schemes).entries()){
  const rand=rng(20261013+97*idx),N_PERM=20000,diffs=METHODS.map(()=>[]);
  for(let z=0;z<N_PERM;z++){
   const permutation=[...ids];
   for(const group of groups){
    const shuffled=group.map(pos=>permutation[pos]);
    for(let k=shuffled.length-1;k>0;k--){
     const n=Math.floor(rand()*(k+1));
     [shuffled[k],shuffled[n]]=[shuffled[n],shuffled[k]];
    }
    group.forEach((pos,i)=>permutation[pos]=shuffled[i]);
   }
   const score=sums(permutation);
   score.forEach((v,k)=>diffs[k].push(v-score[0]));
  }
  controls[name]=Object.fromEntries(METHODS.slice(1).map(method=>{
   const idx=METHODS.indexOf(method),real=overall[method].top10-15;
   const arr=diffs[idx].sort((a,b)=>a-b);
   return [method,{observedDelta:real,
    nullMean:Number((arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(4)),
    p05:arr[999],median:arr[9999],p95:arr[18999],
    upperTail:(1+arr.filter(x=>x>=real).length)/(N_PERM+1)}];
  }));
 }
 const report={date:'2026-10-13',cuts:115,tiedCutCount:62,
  group:{
   sizes:pre.filter(x=>x.tieBoundary).map(x=>x.wholeGroupSize),
   minSize:Math.min(...pre.filter(x=>x.tieBoundary).map(x=>x.wholeGroupSize)),
   maxSize:Math.max(...pre.filter(x=>x.tieBoundary).map(x=>x.wholeGroupSize)),
   averageSize:Number((pre.filter(x=>x.tieBoundary).reduce((s,x)=>s+x.wholeGroupSize,0)/62).toFixed(3)),
   eligibleCompetitorExposures:pre.filter(x=>x.tieBoundary).reduce((s,x)=>s+x.candidates.length,0),
   sizesByWindow:Object.fromEntries([1,2].map(i=>[i,pre.filter(x=>x.competitionSlots===i).length])),
   groupContainsWinnerCuts:tied.filter(x=>x.groupContainsWin).length,
   totalWinningFamilyExposuresInGroup:observedGroupWinners,
   rescueOpportunities:possibleRescuable.map(x=>({date:x.date,turn:x.turn,winningOutside:x.outsideWinnersInTie})),
   expectedWinnerFamilyExposuresUnderUniform:exactExpected
  },
  overall,byMonth:month,byTurn:turn,randomControl:controlRandom,
  randomWinnerExposures:distribution('winnerExposures'),
  placebos:controls,seal,sourcePost:sha(read(ROOT+'POST_115.json')),
  warning:'PRE sellado sin objetivos; diseño e hipótesis inspirados por corpus ya conocido. Sin validación prospectiva de sorteos aleatorios.'};
 save('POST_115.json',{rows:perCut});
 save('RESUMEN.json',report);
 console.log('VT3_GRUPOS_POST_OK',JSON.stringify({
  group:report.group,ranking:Object.fromEntries(METHODS.map(m=>[m,overall[m]])),
  month:Object.fromEntries(Object.entries(month).map(([k,v])=>[k,Object.fromEntries(METHODS.map(m=>[m,v[m].top10]))])),
  randomControl:controlRandom,placebos:controls
 },null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')post();
else throw Error('Usar pre o post');
