import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ROOT='auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/';
const HEADS='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OLD='auditorias/vt3-memoria-corta-online-90-13oct2026/';
const OUT='auditorias/vt3-atribucion-online-90-13oct2026/';
const DOC='PROTOCOLO_VT3_ATRIBUCION_ONLINE_13OCT2026.md';
const PRE_SHA='42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e';
const MODES=['ESTATICA_SEMANA_X','ONLINE_ACUMULATIVA','ONLINE_DIA_ACTUAL','ONLINE_ULTIMOS_5_TURNOS','ONLINE_ULTIMOS_15_TURNOS','ONLINE_NEGATIVAS_5_TURNOS'];
const read=p=>readFileSync(p,'utf8'),load=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(f,obj)=>writeFileSync(OUT+f,JSON.stringify(obj,null,2)+'\n');
const key=r=>r.date+'|'+r.turn;
const uniq=a=>[...new Set(a)];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const family=h=>{assert.match(h,/^\d{4}$/);const t=h.slice(-3);return[t,[...t].reverse().join('')].sort().join('/')};
mkdirSync(OUT,{recursive:true});

function pre(){
 assert.equal(sha(read(ROOT+'PRE_115.json')),PRE_SHA);
 for(const p of [ROOT+'POST_115.json',HEADS+'POST_115.json',OLD+'POST_90.json'])
  assert.ok(!existsSync(p),'POST disponible antes del PRE: '+p);
 const data=load(ROOT+'PRE_115.json');assert.equal(data.rows.length,115);
 const test=data.rows.flatMap((r,i)=>r.week===data.weeks[0]?[]:[{
  i,date:r.date,turn:r.turn,week:r.week,original:r.original,
  outside:r.profiles.filter(p=>!r.original.includes(p.family)).map(p=>({
   family:p.family,rooted:p.rooted,rank:p.originalRank,
   shapes:p.geo.shapes,sourceShapes:p.geo.sameSource,paths:p.geo.abs
  }))
 }]);
 assert.equal(test.length,90);
 assert.ok(test.every(r=>r.outside.length>=1));
 save('PRE_90.json',{weekStarts:data.weeks,rows:test,
  note:'Inventarios físicos sin cabezas, decisiones docentes o candidatos pospuestos.'});
 const seal={input:PRE_SHA,
  protocol:sha(read(DOC)),
  script:sha(read('scripts/lab-vt3-atribucion-online.mjs')),
  pre:sha(read(OUT+'PRE_90.json'))};
 save('SELLO.json',seal);
 console.log('VT3_ATRIBUCION_PRE_OK',JSON.stringify({cuts:test.length,seal}));
}

function jaccard(a,b){
 const bset=new Set(b),cnt=a.filter(x=>bset.has(x)).length;
 return a.length+b.length?cnt/(a.length+b.length-cnt):0;
}
function geometricScore(p,exemplars){
 const nearest=exemplars.map(x=>({ex:x,
  similarity:jaccard(p.geo.shapes,x.geo.shapes)}))
  .sort((a,b)=>b.similarity-a.similarity);
 const top=nearest.slice(0,3);
 return {score:top.reduce((s,x)=>s+x.similarity,0)/top.length,top};
}
function rankBest(r,bank){
 assert.ok(bank.length);
 const options=r.profiles.filter(p=>!r.original.includes(p.family));
 const scored=options.map(p=>({p,score:geometricScore(p,bank).score}));
 scored.sort((a,b)=>Math.abs(b.score-a.score)>1e-10?b.score-a.score:
  Number(b.p.rooted)-Number(a.p.rooted)||
  (a.p.originalRank??9999)-(b.p.originalRank??9999)||a.p.family.localeCompare(b.p.family));
 return scored[0].p.family;
}
function getPositives(r,w,i){
 return r.profiles.filter(p=>w.has(p.family)).map(p=>({
  i,date:r.date,turn:r.turn,family:p.family,
  geo:p.geo,feat:p.feat
 }));
}
function negatives(r,w,i,k){
 const x=r.profiles.filter(p=>!w.has(p.family)).slice().sort((a,b)=>
  sha(r.date+'|'+r.turn+'|'+a.family+'|control')
   .localeCompare(sha(r.date+'|'+r.turn+'|'+b.family+'|control')));
 return x.slice(0,Math.max(1,k)).map(p=>({
  i,date:r.date,turn:r.turn,family:p.family,geo:p.geo,feat:p.feat
 }));
}
function explain(candidate,bank,staticBank,cutIndex){
 const s=geometricScore(candidate,bank);
 const prevShapes=new Set(staticBank.flatMap(e=>e.geo.shapes));
 const histogram=new Map();
 for(const ex of bank)for(const shape of ex.geo.shapes)
  histogram.set(shape,(histogram.get(shape)||0)+1);
 const influential=s.top.map(({ex,similarity})=>{
  const overlaps=ex.geo.shapes.filter(x=>candidate.geo.shapes.includes(x));
  const exactSrc=ex.geo.sameSource.filter(x=>candidate.geo.sameSource.includes(x));
  const exactCells=ex.geo.abs.filter(x=>candidate.geo.abs.includes(x));
  const isNew=ex.i>=cutIndex.firstTestIndex;
  return {
   priorDate:ex.date,priorTurn:ex.turn,priorFamily:ex.family,
   sourceCutIndex:ex.i,
   fromCurrentWeek:isNew,
   similarScore:Number(similarity.toFixed(6)),
   physicalCandidatePaths:candidate.geo.abs,
   historicalExemplarPaths:ex.geo.abs,
   sameShapes:overlaps,
   samePhysicalShapeAndSource:exactSrc,
   sameActualCellsAndSource:exactCells,
   formsUnseenInTrainingWeek:overlaps.filter(x=>!prevShapes.has(x)),
   repeatedFormsInMemory:overlaps.filter(x=>(histogram.get(x)||0)>1),
   uniquePhysicalSources:uniq(ex.geo.sameSource.map(x=>x.split('|')[0]))
  };
 });
 return {score:Number(s.score.toFixed(9)),
  rooted:candidate.rooted,originalRank:candidate.originalRank,
  ownPathCount:candidate.geo.abs.length,
  ownShapeCount:candidate.geo.shapes.length,
  hitsFromRecent:influential.filter(x=>x.fromCurrentWeek).length,
  influential,
  zeroSimilarity:s.top.every(x=>x.similarity===0),
  currentWeekNovelInfluential:influential.filter(x=>x.fromCurrentWeek&&x.formsUnseenInTrainingWeek.length>0).length,
  currentWeekReusedInfluential:influential.filter(x=>x.fromCurrentWeek&&
   x.sameShapes.length>0&&x.formsUnseenInTrainingWeek.length===0).length
 };
}
function attributeMargin(oldP,newP,bank,added){
 const initial=geometricScore(newP,bank).score-geometricScore(oldP,bank).score;
 const impacts=added.map(ex=>{
  const remaining=bank.filter(x=>x!==ex);
  const without=geometricScore(newP,remaining).score-geometricScore(oldP,remaining).score;
  return {i:ex.i,date:ex.date,turn:ex.turn,family:ex.family,
   deltaMargin:Number((initial-without).toFixed(9)),
   shapes:Array.from(new Set(ex.geo.shapes)),
   candidateShapeOverlap:ex.geo.shapes.filter(x=>newP.geo.shapes.includes(x)),
   oldShapeOverlap:ex.geo.shapes.filter(x=>oldP.geo.shapes.includes(x))};
 }).sort((a,b)=>Math.abs(b.deltaMargin)-Math.abs(a.deltaMargin));
 return {currentMargin:Number(initial.toFixed(9)),topInfluences:impacts.slice(0,8),
  positiveEffects:impacts.filter(x=>x.deltaMargin>1e-9).length,
  negativeEffects:impacts.filter(x=>x.deltaMargin< -1e-9).length};
}
function sampleResults(data){
 const collection=data.map(r=>Object.fromEntries(MODES.map(mode=>[mode,r.methods[mode]])));
 return Object.fromEntries(MODES.map(mode=>{
  const vals=collection.map(x=>x[mode]);
  return [mode,{
   top3:vals.filter(x=>x.top3).length,top5:vals.filter(x=>x.top5).length,
   top10:vals.filter(x=>x.top10).length
  }];
 }));
}

function post(){
 const seal=load(OUT+'SELLO.json');
 for(const [f,h] of [[ROOT+'PRE_115.json',seal.input],[DOC,seal.protocol],
  ['scripts/lab-vt3-atribucion-online.mjs',seal.script],
  [OUT+'PRE_90.json',seal.pre]])
  assert.equal(sha(read(f)),h,'Sello inválido '+f);
 const orig=load(ROOT+'PRE_115.json'),targets=load(HEADS+'POST_115.json').rows;
 const frozen=load(OLD+'POST_90.json').rows;
 const input=load(OUT+'PRE_90.json').rows;
 assert.equal(targets.length,115);assert.equal(frozen.length,90);
 const fixed=new Map(frozen.map(r=>[key(r),r]));assert.equal(fixed.size,90);
 const heads=targets.map((r,i)=>{
  assert.equal(key(r),key(orig.rows[i]));
  return new Set(r.targets.map(family));
 });
 const output=[],byWeek={};
 for(let w=0;w<orig.weeks.length-1;w++){
  const week=orig.weeks[w],next=orig.weeks[w+1];
  const train=orig.rows.flatMap((r,i)=>r.week===week?[i]:[]);
  const test=orig.rows.flatMap((r,i)=>r.week===next?[i]:[]);
  assert.equal(test.length,30);
  const firstTestIndex=test[0];
  const books=load(ROOT+'MEMORIA_SEMANA_'+week+'.json').casebook;
  assert.equal(books.length,train.length);
  const staticBank=books.flatMap(b=>b.exemplars.map(ex=>({
   ...ex,
   date:b.date,
   i:train.find(i=>orig.rows[i].date===b.date&&orig.rows[i].turn===b.turn)
  })));
  assert.ok(staticBank.length);
  const trained=train.map(i=>{
   const r=orig.rows[i],positives=getPositives(r,heads[i],i);
   return {i,date:r.date,turn:r.turn,positives,negatives:negatives(r,heads[i],i,positives.length)};
  });
  const completed=[...trained],current=[];
  const testOutputs=[];
  for(const i of test){
   const r=orig.rows[i],known=fixed.get(key(r));
   assert.ok(known);
   const last5=completed.slice(-5),last15=completed.slice(-15);
   const day=current.filter(x=>x.date===r.date);
   const pos=a=>a.flatMap(x=>x.positives),neg=a=>a.flatMap(x=>x.negatives);
   const bank={
    ESTATICA_SEMANA_X:staticBank,
    ONLINE_ACUMULATIVA:[...staticBank,...pos(current)],
    ONLINE_DIA_ACTUAL:pos(day).length?pos(day):staticBank,
    ONLINE_ULTIMOS_5_TURNOS:pos(last5).length?pos(last5):staticBank,
    ONLINE_ULTIMOS_15_TURNOS:pos(last15).length?pos(last15):staticBank,
    ONLINE_NEGATIVAS_5_TURNOS:neg(last5)
   };
   for(const examples of Object.values(bank)){
    assert.ok(examples.length);
    assert.ok(examples.every(x=>x.i<i),'Fuga temporal en '+key(r));
   }
   const third=Object.fromEntries(MODES.map(mode=>[mode,rankBest(r,bank[mode])]));
   for(const mode of MODES){
    assert.equal(third[mode],known.methods[mode].top[2],
      'Tercero congelado incompatible en '+key(r)+' '+mode);
   }
   const origin=third.ESTATICA_SEMANA_X;
   const details={};
   for(const mode of MODES){
    const selected=r.profiles.find(p=>p.family===third[mode]);
    const original=r.profiles.find(p=>p.family===origin);
    assert.ok(selected&&original);
    const ex=bank[mode];
    const about={
      selected:third[mode],oldThird:origin,
      differentFromStatic:third[mode]!==origin,
      examples:ex.length,recentExamples:ex.filter(e=>e.i>=firstTestIndex).length,
      origin:explain(original,ex,staticBank,{firstTestIndex}),
      selectedEvidence:explain(selected,ex,staticBank,{firstTestIndex}),
      originalAgainstStatic:Number(geometricScore(original,staticBank).score.toFixed(9)),
      selectedAgainstStatic:Number(geometricScore(selected,staticBank).score.toFixed(9)),
      newlyKnownPositiveShapes:uniq(ex.filter(e=>e.i>=firstTestIndex).flatMap(e=>e.geo.shapes)),
      memorySignatureCount:new Set(ex.map(e=>e.geo.shapes.slice().sort().join('||'))).size,
      priorTurnIndices:uniq(ex.map(e=>e.i)).sort((a,b)=>a-b)
    };
    if(mode==='ONLINE_ACUMULATIVA'){
      assert.equal(rankBest(r,staticBank),origin,'Ablación total recientes no vuelve a estática');
      about.marginAttribution=attributeMargin(original,selected,ex,
       ex.filter(e=>e.i>=firstTestIndex));
      about.shapeNovelty=about.newlyKnownPositiveShapes.filter(s=>
       !new Set(staticBank.flatMap(q=>q.geo.shapes)).has(s));
    }else if(mode==='ONLINE_DIA_ACTUAL'&&day.some(x=>x.positives.length)){
      assert.equal(rankBest(r,staticBank),origin);
    }
    details[mode]=about;
   }
   // All selections above use past targets only; this cut's outcome labels follow.
   const truth=heads[i];
   const results=Object.fromEntries(MODES.map(mode=>[mode,{
    top3:known.methods[mode].top3,
    top5:known.methods[mode].top5,
    top10:known.methods[mode].top10,
    winningThird:truth.has(third[mode])
   }]));
   const record={
    i,date:r.date,turn:r.turn,trainWeek:week,testWeek:next,
    originalTop:r.original,
    physicallyPossible:orig.rows[i].profiles.filter(x=>truth.has(x.family)).map(x=>x.family),
    examplesAvailableBeforeTurn:current.length,
    details,methods:results
   };
   output.push(record);testOutputs.push(record);
   const nextPositive=getPositives(r,truth,i);
   const nextCase={i,date:r.date,turn:r.turn,
    positives:nextPositive,
    negatives:negatives(r,truth,i,nextPositive.length)};
   current.push(nextCase);completed.push(nextCase);
  }
  byWeek[next]=sampleResults(testOutputs);
 }
 assert.equal(output.length,90);
 for(const mode of MODES){
  const counts=sampleResults(output)[mode];
  const oldCount={
   ESTATICA_SEMANA_X:[4,5,12],
   ONLINE_ACUMULATIVA:[4,5,12],
   ONLINE_DIA_ACTUAL:[3,4,11],
   ONLINE_ULTIMOS_5_TURNOS:[3,4,11],
   ONLINE_ULTIMOS_15_TURNOS:[4,5,12],
   ONLINE_NEGATIVAS_5_TURNOS:[3,4,11]
  }[mode];
  assert.deepEqual([counts.top3,counts.top5,counts.top10],oldCount);
 }
 function summaryMode(mode){
  const all=output.map(x=>x.details[mode]),changed=all.filter(x=>x.differentFromStatic);
  const winning=output.filter(x=>x.methods[mode].winningThird);
  const top3Recent=changed.filter(x=>x.selectedEvidence.hitsFromRecent>0);
  const novel=changed.filter(x=>x.selectedEvidence.currentWeekNovelInfluential>0);
  const repeated=changed.filter(x=>x.selectedEvidence.currentWeekReusedInfluential>0);
  return {
   changedCuts:changed.length,
   changedWithRecentAmongTop3:top3Recent.length,
   changedWithNovelShapeAmongRecentTop3:novel.length,
   changedWithRepeatedShapeAmongRecentTop3:repeated.length,
   changedNoRecentTop3:changed.length-top3Recent.length,
   changedDespiteZeroSimilarity:changed.filter(x=>x.selectedEvidence.zeroSimilarity).length,
   meanBankSize:mean(all.map(x=>x.examples)),
   meanDistinctShapeSignatures:mean(all.map(x=>x.memorySignatureCount)),
   meanRecentExamples:mean(all.map(x=>x.recentExamples)),
   thirdWinnerExposures:winning.length,
   rescuesVsStatic:output.filter(x=>x.methods[mode].top3&&!x.methods.ESTATICA_SEMANA_X.top3).map(key),
   lossesVsStatic:output.filter(x=>!x.methods[mode].top3&&x.methods.ESTATICA_SEMANA_X.top3).map(key),
   allChangedCases:output.filter(x=>x.details[mode].differentFromStatic).map(x=>key(x)),
   uniqueChangedThirds:uniq(output.filter(x=>x.details[mode].differentFromStatic).map(x=>x.details[mode].selected)).length
  };
 }
 const summaries=Object.fromEntries(MODES.map(mode=>[mode,summaryMode(mode)]));
 assert.equal(summaries.ONLINE_ACUMULATIVA.changedCuts,43);
 assert.equal(summaries.ONLINE_DIA_ACTUAL.changedCuts,53);
 assert.equal(summaries.ONLINE_ULTIMOS_5_TURNOS.changedCuts,84);
 assert.equal(summaries.ONLINE_ULTIMOS_15_TURNOS.changedCuts,75);
 assert.equal(summaries.ONLINE_NEGATIVAS_5_TURNOS.changedCuts,88);
 const hits=output.filter(x=>
  x.methods.ESTATICA_SEMANA_X.winningThird||
  Object.entries(x.methods).some(([m,s])=>m!=='ESTATICA_SEMANA_X'&&s.winningThird)
 ).map(x=>({
  date:x.date,turn:x.turn,physicalWinnerFamilies:x.physicallyPossible,
  modes:Object.fromEntries(MODES.map(m=>[m,{
   selected:x.details[m].selected,hit:x.methods[m].winningThird,
   changed:x.details[m].differentFromStatic,
   recentTop3:x.details[m].selectedEvidence.hitsFromRecent,
   explanation:x.details[m].selectedEvidence.influential
  }]))
 }));
 const newInfluence=output.filter(x=>x.details.ONLINE_ACUMULATIVA.differentFromStatic)
  .map(x=>({date:x.date,turn:x.turn,third:x.details.ONLINE_ACUMULATIVA.selected,
   oldThird:x.details.ONLINE_ACUMULATIVA.oldThird,
   recentExamples:x.details.ONLINE_ACUMULATIVA.recentExamples,
   novelTop3:x.details.ONLINE_ACUMULATIVA.selectedEvidence.currentWeekNovelInfluential,
   repeatedTop3:x.details.ONLINE_ACUMULATIVA.selectedEvidence.currentWeekReusedInfluential,
   margins:x.details.ONLINE_ACUMULATIVA.marginAttribution,
   winningThird:x.methods.ONLINE_ACUMULATIVA.winningThird
  }));
 const byTurn=Object.fromEntries(['Previa','Primera','Matutino','Vespertino','Nocturno'].map(turn=>
  [turn,Object.fromEntries(MODES.map(m=>[m,
   output.filter(x=>x.turn===turn&&x.details[m].differentFromStatic).length]))]));
 const byDay=Object.fromEntries(uniq(output.map(x=>x.date)).map(d=>
  [d,Object.fromEntries(MODES.map(m=>[m,
   output.filter(x=>x.date===d&&x.details[m].differentFromStatic).length]))]));
 save('POST_90.json',{rows:output});
 save('RESUMEN.json',{
  date:'2026-10-13',cuts:90,
  byWeek,byTurn,byDay,overall:sampleResults(output),
  summaries,newInfluence,winnerExplanations:hits,
  seal,
  priorFrozen:sha(read(OLD+'POST_90.json')),
  headsPost:sha(read(HEADS+'POST_115.json')),
  interpretation:'Análisis de contribuciones Jaccard de los tres ejemplos más cercanos; una forma repetida no es un recorrido histórico independiente. La selección de todos los Tops se verificó contra los 90 anteriores congelados.',
  warning:'Explicaciones retrospectivas de un motor de similitud, no una relación causal con los resultados de quiniela aleatorios. Corpus muy explorado.'
 });
 console.log('VT3_ATRIBUCION_POST_OK',JSON.stringify({
  sums:Object.fromEntries(Object.entries(summaries).map(([k,v])=>[k,{
   changes:v.changedCuts,withRecent:v.changedWithRecentAmongTop3,
   novel:v.changedWithNovelShapeAmongRecentTop3,
   repeated:v.changedWithRepeatedShapeAmongRecentTop3,
   noRecent:v.changedNoRecentTop3,meanBank:v.meanBankSize,
   meanSignature:v.meanDistinctShapeSignatures,
   winning:v.thirdWinnerExposures
  }])),
  hits:hits.map(x=>({date:x.date,turn:x.turn,winners:x.physicalWinnerFamilies,
   thirds:Object.fromEntries(Object.entries(x.modes).map(([m,v])=>[m,{
    third:v.selected,hit:v.hit,changed:v.changed,recentTop3:v.recentTop3
   }]))})),
  byTurn
 },null,2));
}
if(process.argv[2]==='pre')pre();
else if(process.argv[2]==='post')post();
else throw Error('Usar pre|post');
