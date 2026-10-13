import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const DOM='auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/';
const PHY='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const VOTE='auditorias/vt3-voto-unico-forma-90-13oct2026/';
const CONTROL='auditorias/vt3-control-tercer-puesto-90-13oct2026/';
const OUT='auditorias/vt3-presencia-abundancia-90-13oct2026/';
const DOC='PROTOCOLO_VT3_PRESENCIA_ABUNDANCIA_13OCT2026.md';
const DOM_SHA='42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e';
const PHY_SHA='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const ROUNDS=500,SEED=20261013;
const MODELS=['PRESENCIA_FORMAS','MAYOR_RUTAS','MAYOR_FORMAS','BANCO_TODAS_FISICAS_X','BANCO_TOP10_X'];
const xread=p=>readFileSync(p,'utf8'),jread=p=>JSON.parse(xread(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(name,obj)=>writeFileSync(OUT+name,JSON.stringify(obj,null,2)+'\n');
const key=r=>r.date+'|'+r.turn,uniq=a=>[...new Set(a)];
const family=h=>{assert.match(h,/^\d{4}$/);const s=h.slice(-3);return [s,[...s].reverse().join('')].sort().join('/')};
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const fix=n=>Number(n.toFixed(6));
const routBin=n=>n<=1?'1':n<=3?'2-3':n<=7?'4-7':'8+';
const rng=seed=>{let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296; }};

mkdirSync(OUT,{recursive:true});

function prepare(){
 assert.equal(sha(xread(DOM+'PRE_115.json')),DOM_SHA);
 assert.equal(sha(xread(PHY+'PRE_115.json')),PHY_SHA);
 for(const f of [DOM+'POST_115.json',PHY+'POST_115.json',VOTE+'POST_90.json',CONTROL+'POST_90.json'])
  assert.ok(!existsSync(f),'POST disponible antes del sello PRE: '+f);
 const rows=jread(DOM+'PRE_115.json').rows;
 assert.equal(rows.length,115);
 const firstWeek=rows[0].week;
 const test=rows.flatMap((r,i)=>r.week===firstWeek?[]:[{
  i,date:r.date,turn:r.turn,week:r.week,original:r.original,
  physicalOutsiders:r.profiles.filter(p=>!r.original.includes(p.family)).map(p=>({
   family:p.family,rooted:p.rooted,rank:p.originalRank,
   routes:p.geo.abs.length,forms:p.geo.shapes.length,
   sources:new Set(p.geo.sameSource.map(x=>x.split('|')[0])).size
  }))
 }]);
 assert.equal(test.length,90);
 assert.equal(uniq(test.map(x=>x.date)).length,18);
 const sourceFormats=new Set(rows.flatMap(r=>r.profiles.flatMap(p=>p.geo.shapes)));
 save('PRE_90.json',{date:'2026-10-13',rows:test,
  shapeVocabulary:sourceFormats.size,models:MODELS,rounds:ROUNDS,seed:SEED,
  note:'PRE exclusivamente físico; no se han cargado resultados ganadores ni elecciones aprendidas.'});
 save('SELLO.json',{physical:PHY_SHA,dom:DOM_SHA,
  code:sha(xread('scripts/lab-vt3-presencia-abundancia.mjs')),
  protocol:sha(xread(DOC)),pre:sha(xread(OUT+'PRE_90.json'))});
 console.log('PRESENCIA_ABUNDANCIA_PRE_OK',JSON.stringify({
  cuts:90,uniqueShapes:sourceFormats.size,meanExternal:fix(avg(test.map(x=>x.physicalOutsiders.length))),
  seal:jread(OUT+'SELLO.json')}));
}
function assertSeal(){
 const s=jread(OUT+'SELLO.json');
 for(const [file,value] of [[DOM+'PRE_115.json',s.dom],[PHY+'PRE_115.json',s.physical],
  ['scripts/lab-vt3-presencia-abundancia.mjs',s.code],[DOC,s.protocol],[OUT+'PRE_90.json',s.pre]])
  assert.equal(sha(xread(file)),value,'Sello alterado: '+file);
 return s;
}
function unionShapes(profiles){return uniq(profiles.flatMap(p=>p.geo.shapes))}
function jaccard(a,b){
 const bs=new Set(b);
 let common=0;
 for(const x of a)if(bs.has(x))common++;
 return a.length+b.length?common/(a.length+b.length-common):0;
}
function comparator(a,b){return Number(b.rooted)-Number(a.rooted)||(a.originalRank??9999)-(b.originalRank??9999)||a.family.localeCompare(b.family)}
function select(row,method,shapes){
 const external=row.profiles.filter(p=>!row.original.includes(p.family));
 assert.ok(external.length>=1);
 let scored=external.map(p=>({p,s:method==='MAYOR_RUTAS'?p.geo.abs.length:
    method==='MAYOR_FORMAS'?p.geo.shapes.length:jaccard(p.geo.shapes,shapes)}));
 scored.sort((a,b)=>b.s-a.s||comparator(a.p,b.p));
 return scored[0].p.family;
}
function compose(original,third){
 assert.equal(original.length,10);assert.ok(!original.includes(third));
 return [...original.slice(0,2),third,...original.slice(2,9)];
}
const evaluation=(top,goal)=>({top3:top.slice(0,3).some(x=>goal.has(x)),top5:top.slice(0,5).some(x=>goal.has(x)),top10:top.some(x=>goal.has(x)),
  thirdWin:goal.has(top[2])});
function scoreRows(rows,name){
 const scores=rows.map(x=>x.results[name]);
 return {cuts:rows.length,top3:scores.filter(x=>x.top3).length,
  top5:scores.filter(x=>x.top5).length,top10:scores.filter(x=>x.top10).length,
  thirdWinnerExposures:scores.filter(x=>x.thirdWin).length,
  gains3:rows.filter(x=>x.results[name].top3&&!x.results.OFICIAL.top3).map(key),
  losses3:rows.filter(x=>!x.results[name].top3&&x.results.OFICIAL.top3).map(key),
  gains10:rows.filter(x=>x.results[name].top10&&!x.results.OFICIAL.top10).map(key),
  losses10:rows.filter(x=>!x.results[name].top10&&x.results.OFICIAL.top10).map(key)};
}
function pickPseudo(trainIds,rows,heads,random,matching){
 const forms=[];
 for(const i of trainIds){
  const r=rows[i],trueWins=r.profiles.filter(p=>heads[i].has(p.family));
  const used=new Set();
  for(const original of trueWins){
   const eligible=r.profiles.filter(p=>!used.has(p.family));
   let pool=eligible;
   if(matching){
    pool=eligible.filter(p=>p.rooted===original.rooted&&routBin(p.geo.abs.length)===routBin(original.geo.abs.length));
    if(!pool.length)pool=eligible.filter(p=>p.rooted===original.rooted);
    if(!pool.length)pool=eligible;
   }
   assert.ok(pool.length);
   const chosen=pool[Math.floor(random()*pool.length)];
   used.add(chosen.family);
   forms.push(...chosen.geo.shapes);
  }
 }
 return uniq(forms);
}
function pearson(xs,ys){
 const x=avg(xs),y=avg(ys);
 const numer=xs.reduce((s,v,i)=>s+(v-x)*(ys[i]-y),0);
 const dx=Math.sqrt(xs.reduce((s,v)=>s+(v-x)*(v-x),0));
 const dy=Math.sqrt(ys.reduce((s,v)=>s+(v-y)*(v-y),0));
 return dx&&dy?numer/(dx*dy):0;
}
function drawReport(list,real){
 const a=list.slice().sort((a,b)=>a-b);
 return {n:a.length,mean:fix(avg(a)),min:a[0],p05:a[24],median:a[249],p95:a[474],max:a.at(-1),
  observed:real,fracAtLeastObserved:a.filter(x=>x>=real).length/a.length,
  hist:Object.fromEntries(uniq(a).map(v=>[String(v),a.filter(x=>x===v).length]))};
}
function originalPathData(witness){
 assert.ok(witness?.paths?.length);
 const events=new Set(),out=[];
 for(const x of witness.paths){
  assert.equal(x.cells.length,3);
  const pathKey=x.source+'|'+[x.cells.join('>'),x.cells.slice().reverse().join('>')].sort()[0];
  const ownerEvents=[];
  for(const root of x.rootIds||[]){
   const tokens=root.split('|');assert.equal(tokens.length,8);
   const ev=tokens.slice(0,5).join('|');
   events.add(ev);ownerEvents.push(ev);
  }
  out.push({source:x.source,cells:x.cells,physicalKey:pathKey,digits:x.value,
   anchored:x.anchored,events:uniq(ownerEvents)});
 }
 return {paths:out,uniquePaths:uniq(out.map(x=>x.physicalKey)).length,independentRootEvents:[...events].sort()};
}
function main(){
 const seal=assertSeal();
 const d=jread(DOM+'PRE_115.json'),p=jread(PHY+'PRE_115.json').rows;
 const targets=jread(PHY+'POST_115.json').rows;
 const votes=jread(VOTE+'POST_90.json').rows;
 const controls=jread(CONTROL+'POST_90.json').rows;
 assert.equal(d.rows.length,115);assert.equal(p.length,115);
 assert.equal(targets.length,115);assert.equal(votes.length,90);assert.equal(controls.length,90);
 const truth=targets.map((r,i)=>{assert.equal(key(r),key(d.rows[i]));return new Set(r.targets.map(family))});
 const frozenVotes=new Map(votes.map(r=>[key(r),r]));
 const frozenControls=new Map(controls.map(r=>[key(r),r]));
 const worlds=[];
 const rounds=[];
 for(let w=1;w<d.weeks.length;w++){
  const current=d.weeks[w],prev=d.weeks[w-1];
  const trainIds=d.rows.flatMap((r,i)=>r.week===prev?[i]:[]);
  const testIds=d.rows.flatMap((r,i)=>r.week===current?[i]:[]);
  assert.equal(testIds.length,30);assert.ok(trainIds.every(i=>i<testIds[0]));
  const winners=trainIds.flatMap(i=>d.rows[i].profiles.filter(x=>truth[i].has(x.family)));
  const learned=unionShapes(winners);
  const all=unionShapes(trainIds.flatMap(i=>d.rows[i].profiles));
  const top=unionShapes(trainIds.flatMap(i=>d.rows[i].profiles.filter(profile=>d.rows[i].original.includes(profile.family))));
  rounds.push({week:current,learnedWeek:prev,trainCuts:trainIds.length,trainWinners:winners.length,
   shapeUnionWinner:learned.length,shapeUnionPhysical:all.length,shapeUnionTop10:top.length,
   shapesMissingWinner:all.filter(s=>!learned.includes(s))});
  const selections=[];
  // Generate every Top for this test week from pre features and ONLY train results.
  for(const i of testIds){
   const row=d.rows[i];
   const choice={
    PRESENCIA_FORMAS:select(row,'PRESENCIA_FORMAS',learned),
    MAYOR_RUTAS:select(row,'MAYOR_RUTAS',null),
    MAYOR_FORMAS:select(row,'MAYOR_FORMAS',null),
    BANCO_TODAS_FISICAS_X:select(row,'BANCO_TODAS_FISICAS_X',all),
    BANCO_TOP10_X:select(row,'BANCO_TOP10_X',top)
   };
   const v=frozenVotes.get(key(row)),c=frozenControls.get(key(row));
   assert.ok(v&&c);
   assert.equal(choice.PRESENCIA_FORMAS,v.methods.ESTATICA.PRESENCIA_FORMAS.top[2],'No reproduce alumno congelado');
   assert.equal(choice.MAYOR_RUTAS,c.scores.RECUENTO_RUTAS.chosen,'No reproduce control de rutas congelado');
   assert.deepEqual(compose(row.original,choice.PRESENCIA_FORMAS),v.methods.ESTATICA.PRESENCIA_FORMAS.top);
   selections.push({i,row,choice,bankWinner:learned,bankAll:all,bankTop:top});
  }
  // Evaluate exclusively after all predictions for X+1 are sealed in selections.
  for(const {i,row,choice,bankWinner,bankAll,bankTop} of selections){
   const t=truth[i],choices={OFICIAL:row.original};
   for(const [m,c] of Object.entries(choice))choices[m]=compose(row.original,c);
   const results=Object.fromEntries(Object.entries(choices).map(([m,top])=>[m,evaluation(top,t)]));
   const out=row.profiles.filter(x=>!row.original.includes(x.family));
   const pres=out.find(x=>x.family===choice.PRESENCIA_FORMAS);
   const abundance=out.find(x=>x.family===choice.MAYOR_RUTAS);
   const scores=out.map(x=>({
    family:x.family,score:jaccard(x.geo.shapes,bankWinner),
    routeCount:x.geo.abs.length,shapeCount:x.geo.shapes.length,
    rooted:x.rooted,rank:x.originalRank
   }));
   const rankByPresence=scores.slice().sort((a,b)=>b.score-a.score||Number(b.rooted)-Number(a.rooted)||(a.rank??9999)-(b.rank??9999)||a.family.localeCompare(b.family));
   const observedWinning=[...t].filter(f=>row.profiles.some(x=>x.family===f));
   const witness=p[i].witnesses;
   const success=choice.PRESENCIA_FORMAS===choice.MAYOR_RUTAS;
   worlds.push({i,date:row.date,turn:row.turn,week:row.week,
    chosen:choice,samePresAndAbundance:success,
    originalTop:row.original,
    currentHeads:targets[i].targets,
    physicalWinners:observedWinning,
    results,
    candidateStats:{
     presence:{routes:pres.geo.abs.length,shapes:pres.geo.shapes.length,rooted:pres.rooted,rank:pres.originalRank,score:fix(jaccard(pres.geo.shapes,bankWinner))},
     abundance:{routes:abundance.geo.abs.length,shapes:abundance.geo.shapes.length,rooted:abundance.rooted,rank:abundance.originalRank,score:fix(jaccard(abundance.geo.shapes,bankWinner))}
    },
    scoresCorrelationWithRouteCount:fix(pearson(scores.map(x=>x.score),scores.map(x=>x.routeCount))),
    scoresCorrelationWithShapeCount:fix(pearson(scores.map(x=>x.score),scores.map(x=>x.shapeCount))),
    candidateCount:out.length,
    allOutsiderShapes:unionShapes(out).length,
    trainingWinnerShapes:bankWinner.length,
    candidateShapeCoverage:fix(pres.geo.shapes.filter(s=>bankWinner.includes(s)).length/pres.geo.shapes.length),
    rankPresence:rankByPresence.findIndex(x=>x.family===choice.PRESENCIA_FORMAS)+1,
    first5Presence:rankByPresence.slice(0,5),
    winnerWitnesses:results.PRESENCIA_FORMAS.thirdWin?originalPathData(witness.find(x=>x.family===choice.PRESENCIA_FORMAS)):null
   });
  }
 }
 assert.equal(worlds.length,90);
 const aggregate=names=>Object.fromEntries(names.map(n=>[n,scoreRows(worlds,n)]));
 const summary=aggregate(['OFICIAL',...MODELS]);
 assert.deepEqual([summary.OFICIAL.top3,summary.OFICIAL.top10],[3,11]);
 assert.deepEqual([summary.PRESENCIA_FORMAS.top3,summary.PRESENCIA_FORMAS.top10],[5,13]);
 assert.deepEqual([summary.MAYOR_RUTAS.top3,summary.MAYOR_RUTAS.top10],[5,13]);
 const coincidences=worlds.filter(x=>x.samePresAndAbundance);
 assert.equal(coincidences.length,66);
 const disagreed=worlds.filter(x=>!x.samePresAndAbundance);
 assert.equal(disagreed.length,24);
 const winsPresence=worlds.filter(x=>x.results.PRESENCIA_FORMAS.thirdWin);
 const winsRoutes=worlds.filter(x=>x.results.MAYOR_RUTAS.thirdWin);
 assert.equal(winsPresence.length,2);assert.equal(winsRoutes.length,2);
 assert.deepEqual(winsPresence.map(key),winsRoutes.map(key));
 const random=rng(SEED),neutral={uniform:[],matched:[]},agreements={uniform:[],matched:[]};
 // Fixed 500 placebo re-labellings; each uses week X only to form its memory and
 // pre-frozen physical pool of X+1 for exactly one outsider per cut.
 for(let n=0;n<ROUNDS;n++){
  const allPred={uniform:[],matched:[]};
  for(let w=1;w<d.weeks.length;w++){
   const train=d.rows.flatMap((r,i)=>r.week===d.weeks[w-1]?[i]:[]);
   const test=d.rows.flatMap((r,i)=>r.week===d.weeks[w]?[i]:[]);
   const banks={
    uniform:pickPseudo(train,d.rows,truth,random,false),
    matched:pickPseudo(train,d.rows,truth,random,true)
   };
   for(const i of test){
    const row=d.rows[i];
    for(const method of Object.keys(banks)){
     const choose=select(row,'PRESENCIA_FORMAS',banks[method]);
     allPred[method].push(choose);
    }
   }
  }
  for(const method of ['uniform','matched']){
   const candidates=allPred[method];
   assert.equal(candidates.length,90);
   let three=0,five=0,ten=0,agreement=0;
   for(let i=0;i<90;i++){
    const x=worlds[i],t=truth[x.i],hit=evaluation(compose(x.originalTop,candidates[i]),t);
    three+=Number(hit.top3);five+=Number(hit.top5);ten+=Number(hit.top10);
    agreement+=Number(candidates[i]===x.chosen.PRESENCIA_FORMAS);
   }
   neutral[method].push({top3:three,top5:five,top10:ten});
   agreements[method].push(agreement);
  }
 }
 const randomSummaries=Object.fromEntries(['uniform','matched'].map(type=>{
  const xs=neutral[type];
  return [type,{top3:drawReport(xs.map(x=>x.top3),summary.PRESENCIA_FORMAS.top3),
   top10:drawReport(xs.map(x=>x.top10),summary.PRESENCIA_FORMAS.top10),
   agreement:drawReport(agreements[type],90)}];
 }));
 const byWeek=Object.fromEntries(d.weeks.slice(1).map(week=>[week,aggregateSubset(worlds.filter(x=>x.week===week))]));
 function aggregateSubset(x){return Object.fromEntries(['OFICIAL',...MODELS].map(n=>[n,scoreRows(x,n)]));}
 const details=winsPresence.map(x=>({
  date:x.date,turn:x.turn,
  family:x.chosen.PRESENCIA_FORMAS,
  heads:x.currentHeads,
  otherPhysicalWinners:x.physicalWinners,
  thirdLearnedAndMaxRoutesAgree:x.samePresAndAbundance,
  tests:x.candidateStats,
  winningWitnesses:x.winnerWitnesses,
  candidates:x.candidateCount,
  trainingSourceWeek:rounds.find(r=>r.week===x.week),
  uniqueWinnerShapesSeenInTraining:x.trainingWinnerShapes,
  candidateShapeCoverage:x.candidateShapeCoverage,
  highestRankByPresence:x.first5Presence
 }));
 const comparisons={
  sameThirdIn90:coincidences.length,
  differentThirdIn90:disagreed.length,
  sameWinnerCases:winsPresence.map(key),
  differencesThatWonByEither:disagreed.filter(x=>x.results.PRESENCIA_FORMAS.thirdWin||x.results.MAYOR_RUTAS.thirdWin).map(key),
  meanScoreRoutePearson:fix(avg(worlds.map(x=>x.scoresCorrelationWithRouteCount))),
  meanScoreShapePearson:fix(avg(worlds.map(x=>x.scoresCorrelationWithShapeCount))),
  meanPresenceCandidateRoutes:fix(avg(worlds.map(x=>x.candidateStats.presence.routes))),
  meanMaxRoutesCandidateRoutes:fix(avg(worlds.map(x=>x.candidateStats.abundance.routes))),
  meanCandidateCoverage:fix(avg(worlds.map(x=>x.candidateShapeCoverage))),
  allShapesCoveredInPresenceCandidate:worlds.filter(x=>x.candidateShapeCoverage===1).length,
  meanPhysicalCandidateShapes:fix(avg(worlds.map(x=>x.allOutsiderShapes)))
 };
 save('POST_90.json',{rows:worlds.map(x=>({
  i:x.i,date:x.date,turn:x.turn,week:x.week,original:x.originalTop,
  heads:x.currentHeads,physicalWinners:x.physicalWinners,
  chosen:x.chosen,results:x.results,
  candidateStats:x.candidateStats,
  scoresCorrelationWithRouteCount:x.scoresCorrelationWithRouteCount,
  scoresCorrelationWithShapeCount:x.scoresCorrelationWithShapeCount,
  candidateShapeCoverage:x.candidateShapeCoverage
 }))});
 save('RESUMEN.json',{date:'2026-10-13',cuts:90,trainRounds:rounds,summary,
  byWeek,comparisons,winningCases:details,placebo:randomSummaries,seal,
  votesFrozenHash:sha(xread(VOTE+'POST_90.json')),
  pathsFrozenHash:sha(xread(CONTROL+'POST_90.json')),
  warning:'La quiniela es aleatoria. Controles de etiquetas placebo retrospectivos sobre 23 fechas largamente investigadas, no test prospectivo ni prueba concluyente.'});
 console.log('PRESENCIA_ABUNDANCIA_POST_OK',JSON.stringify({
  summary:Object.fromEntries(Object.entries(summary).map(([m,s])=>[m,{top3:s.top3,top5:s.top5,top10:s.top10,gains3:s.gains3}])),
  comparisons,trainRounds:rounds,placebo:Object.fromEntries(Object.entries(randomSummaries).map(([k,v])=>[k,{
   top3:v.top3,top10:v.top10,agreement:v.agreement
  }])),winners:details.map(x=>({date:x.date,turn:x.turn,family:x.family,tests:x.tests,
   candidates:x.candidates,winningWitnesses:x.winningWitnesses,source:x.trainingSourceWeek}))
 },null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')main();
else throw Error('Usar pre|post');
