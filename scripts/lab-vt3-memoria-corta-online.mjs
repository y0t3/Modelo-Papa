import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const SRC='auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/';
const BASE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-memoria-corta-online-90-13oct2026/';
const DOC='PROTOCOLO_VT3_MEMORIA_CORTA_ONLINE_13OCT2026.md';
const SHA_PRE='42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e';
const METHODS=['OFICIAL','ESTATICA_SEMANA_X','ESTATICA_ULTIMO_DIA_X','ESTATICA_ULTIMOS_3_DIAS_X',
'ONLINE_ACUMULATIVA','ONLINE_DIA_ACTUAL','ONLINE_ULTIMOS_5_TURNOS',
'ONLINE_ULTIMOS_15_TURNOS','ONLINE_NEGATIVAS_5_TURNOS','HASH_FISICO'];
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const read=p=>readFileSync(p,'utf8'),load=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(f,v)=>writeFileSync(OUT+f,JSON.stringify(v,null,2)+'\n');
const key=r=>r.date+'|'+r.turn;
const uniq=a=>[...new Set(a)];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const family=h=>{assert.match(h,/^\d{4}$/);const t=h.slice(-3);return[t,[...t].reverse().join('')].sort().join('/')};
const rng=seed=>{let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}};
mkdirSync(OUT,{recursive:true});
function pre(){
 assert.equal(sha(read(SRC+'PRE_115.json')),SHA_PRE);
 for(const p of [SRC+'POST_115.json',SRC+'RESUMEN.json',
   SRC+'MEMORIA_SEMANA_2026-09-14.json',BASE+'POST_115.json'])
  assert.ok(!existsSync(p),'Archivo POST visible durante sellado PRE: '+p);
 const x=load(SRC+'PRE_115.json');assert.equal(x.rows.length,115);
 assert.equal(x.weeks.length,4);
 const training=x.rows.map((r,i)=>({
  i,date:r.date,week:r.week,turn:r.turn,
  original:r.original,rooted:r.rootedCount,
  physical:r.physicalCount,positiveUnknown:true
 }));
 const tests=training.filter(r=>r.week!==x.weeks[0]);
 assert.equal(tests.length,90);
 const datesPerWeek={};
 for(const w of x.weeks.slice(1)){
  const d=uniq(tests.filter(r=>r.week===w).map(r=>r.date)).sort();
  assert.equal(d.length,6);
  datesPerWeek[w]=d;
 }
 for(const d of uniq(training.map(r=>r.date)))
  assert.deepEqual(training.filter(r=>r.date===d).map(r=>r.turn),TURNS);
 const physicalOffers=tests.map(({i,date,turn,week,original})=>{
  const r=x.rows[i],base=new Set(original);
  const all=r.profiles.filter(p=>!base.has(p.family));
  assert.ok(all.length>=1);assert.ok(all.every(p=>p.geo.shapes.length>0));
  return {i,date,turn,week,baselineTop:original,
   outsiders:all.map(p=>({family:p.family,rooted:p.rooted,rank:p.originalRank,
    paths:p.geo.abs.length,shapeCount:p.geo.shapes.length}))};
 });
 // Exact 2000 uniform choices for each cutoff, all before reading any heads.
 const draw=rng(20261013),SAMPLES=2000;
 const neutral=Array.from({length:SAMPLES},()=>physicalOffers.map(
  r=>Math.floor(draw()*r.outsiders.length)));
 save('PRE_90.json',{date:'2026-10-13',allCuts:training,testCuts:physicalOffers,
  weeks:x.weeks,days:datesPerWeek,methods:METHODS,
  note:'Sólo listados PRE; ninguna cabeza sorteada ni memoria docente disponible en esta fase.'});
 save('NEUTRALES_PRE.json',{seed:20261013,samples:SAMPLES,draws:neutral,
  note:'En cada corte elegir exactamente una de las familias físicas fuera del Top10 original.'});
 const seal={sourcePre:SHA_PRE,protocol:sha(read(DOC)),
  script:sha(read('scripts/lab-vt3-memoria-corta-online.mjs')),
  pre:sha(read(OUT+'PRE_90.json')),neutral:sha(read(OUT+'NEUTRALES_PRE.json'))};
 save('SELLO.json',seal);
 console.log('VT3_MEMORIA_CORTA_PRE_OK',JSON.stringify({
  sourceCuts:training.length,testCuts:physicalOffers.length,days:datesPerWeek,
  meanPhysicalOffers:mean(physicalOffers.map(r=>r.outsiders.length)),
  sealedNeutralReplicas:SAMPLES,seal}));
}
function jaccard(a,b){
 const x=new Set(a),y=new Set(b);let overlap=0;
 for(const v of x)if(y.has(v))overlap++;
 return x.size+y.size?overlap/(x.size+y.size-overlap):0;
}
function score(candidate,examples){
 if(!examples.length)return 0;
 const all=examples.map(ex=>jaccard(candidate.geo.shapes,ex.geo.shapes))
  .sort((a,b)=>b-a);
 return all.slice(0,3).reduce((s,x)=>s+x,0)/Math.min(3,all.length);
}
function choose(row,examples){
 assert.ok(examples.length);
 const unavailable=new Set(row.original);
 const list=row.profiles.filter(p=>!unavailable.has(p.family));
 assert.ok(list.length>0);
 list.sort((a,b)=>{
  const d=score(b,examples)-score(a,examples);
  if(Math.abs(d)>1e-10)return d;
  return Number(b.rooted)-Number(a.rooted)||
   (a.originalRank??9999)-(b.originalRank??9999)||a.family.localeCompare(b.family);
 });
 return list[0].family;
}
function combine(original,third){
 assert.equal(original.length,10);assert.ok(!original.includes(third));
 return [...original.slice(0,2),third,...original.slice(2,9)];
}
function check(top,truth){
 return {top,top3:top.slice(0,3).some(f=>truth.has(f)),
  top5:top.slice(0,5).some(f=>truth.has(f)),
  top10:top.some(f=>truth.has(f)),
  hits:top.filter(f=>truth.has(f))};
}
function positiveExamples(row,truth,i){
 return row.profiles.filter(x=>truth.has(x.family)).map(x=>({
  i,date:row.date,turn:row.turn,family:x.family,geo:x.geo,feat:x.feat
 }));
}
function negativeExamples(row,truth,i,max){
 const all=row.profiles.filter(x=>!truth.has(x.family)).slice().sort((a,b)=>
  sha(row.date+'|'+row.turn+'|'+a.family+'|control')
   .localeCompare(sha(row.date+'|'+row.turn+'|'+b.family+'|control')));
 return all.slice(0,Math.max(1,max)).map(x=>({
  i,date:row.date,turn:row.turn,family:x.family,geo:x.geo,feat:x.feat
 }));
}
function stats(rows,method){
 const success=r=>r.methods[method];
 const gains=rows.filter(r=>success(r).top3&&!r.methods.OFICIAL.top3).map(key);
 const loses=rows.filter(r=>!success(r).top3&&r.methods.OFICIAL.top3).map(key);
 const gains10=rows.filter(r=>success(r).top10&&!r.methods.OFICIAL.top10).map(key);
 const loses10=rows.filter(r=>!success(r).top10&&r.methods.OFICIAL.top10).map(key);
 return {cuts:rows.length,top3:rows.filter(r=>success(r).top3).length,
  top5:rows.filter(r=>success(r).top5).length,
  top10:rows.filter(r=>success(r).top10).length,
  hitFamilyExposures:rows.reduce((s,r)=>s+success(r).hits.length,0),
  physicalCeiling:rows.filter(r=>r.possible.length>0).length,
  gainedTop3:gains,lostTop3:loses,gainedTop10:gains10,lostTop10:loses10};
}
function reportGroup(rows){return Object.fromEntries(METHODS.map(m=>[m,stats(rows,m)]))}
function post(){
 const seal=load(OUT+'SELLO.json');
 for(const [file,hash] of [[SRC+'PRE_115.json',seal.sourcePre],[DOC,seal.protocol],
 ['scripts/lab-vt3-memoria-corta-online.mjs',seal.script],
 [OUT+'PRE_90.json',seal.pre],[OUT+'NEUTRALES_PRE.json',seal.neutral]])
  assert.equal(sha(read(file)),hash,'Alteración PRE: '+file);
 const pre=load(OUT+'PRE_90.json'),src=load(SRC+'PRE_115.json');
 const post=load(BASE+'POST_115.json').rows;
 const frozen=load(SRC+'POST_115.json').rows;
 assert.equal(src.rows.length,115);assert.equal(post.length,115);assert.equal(frozen.length,90);
 const targets=post.map((z,i)=>{
  assert.equal(key(z),key(src.rows[i]));assert.equal(z.targets.length,5);
  return new Set(z.targets.map(family));
 });
 const frozenBy=new Map(frozen.map(x=>[key(x),x]));assert.equal(frozenBy.size,90);
 const all=[],weeks=[];
 for(let w=0;w<pre.weeks.length-1;w++){
  const week=pre.weeks[w],next=pre.weeks[w+1];
  const trainIds=src.rows.flatMap((r,i)=>r.week===week?[i]:[]);
  const testIds=src.rows.flatMap((r,i)=>r.week===next?[i]:[]);
  assert.equal(testIds.length,30);
  assert.ok(trainIds.at(-1)<testIds[0]);
  const oldCasebook=load(SRC+'MEMORIA_SEMANA_'+week+'.json');
  assert.equal(oldCasebook.trainWeek,week);
  assert.equal(oldCasebook.casebook.length,trainIds.length);
  const observedTrain=trainIds.map(i=>{
   const row=src.rows[i],goal=targets[i];
   return {i,date:row.date,turn:row.turn,
    positives:positiveExamples(row,goal,i),
    negatives:negativeExamples(row,goal,i,positiveExamples(row,goal,i).length)};
  });
  const book=oldCasebook.casebook;
  for(let k=0;k<book.length;k++){
   assert.equal(book[k].date,observedTrain[k].date);
   assert.equal(book[k].turn,observedTrain[k].turn);
   assert.deepEqual([...book[k].observedPhysicalPositives].sort(),
    observedTrain[k].positives.map(x=>x.family).sort(),
    'Docente anterior contradice cabezas físicas');
  }
  const baseExamples=book.flatMap(x=>x.exemplars.map(z=>({
   ...z,i:trainIds.find(i=>src.rows[i].date===x.date&&src.rows[i].turn===x.turn),
   date:x.date
  })));
  assert.ok(baseExamples.length);
  const trainDates=uniq(trainIds.map(i=>src.rows[i].date));
  const lastDay=trainDates.at(-1),last3=new Set(trainDates.slice(-3));
  const last1Examples=baseExamples.filter(x=>x.date===lastDay);
  const last3Examples=baseExamples.filter(x=>last3.has(x.date));
  assert.ok(last1Examples.length&&last3Examples.length);
  const completed=[...observedTrain];
  const newCompleted=[];
  const captured=[];
  let trainPhysicalHits=0;
  for(const i of trainIds)trainPhysicalHits+=Number(positiveExamples(src.rows[i],targets[i],i).length>0);
  assert.ok([19,20,21].includes(trainPhysicalHits));
  for(const i of testIds){
   const row=src.rows[i],date=row.date;
   const upto=completed.filter(x=>x.i<i),testUpto=newCompleted;
   assert.equal(upto.length,completed.length);
   const flattened=part=>part.flatMap(x=>x.positives);
   const flattenNeg=part=>part.flatMap(x=>x.negatives);
   const last5=upto.slice(-5),last15=upto.slice(-15);
   const withinDay=testUpto.filter(x=>x.date===date);
   const candidateMemories={
    ESTATICA_SEMANA_X:baseExamples,
    ESTATICA_ULTIMO_DIA_X:last1Examples,
    ESTATICA_ULTIMOS_3_DIAS_X:last3Examples,
    ONLINE_ACUMULATIVA:[...baseExamples,...flattened(testUpto)],
    ONLINE_DIA_ACTUAL:flattened(withinDay).length?flattened(withinDay):baseExamples,
    ONLINE_ULTIMOS_5_TURNOS:flattened(last5).length?flattened(last5):baseExamples,
    ONLINE_ULTIMOS_15_TURNOS:flattened(last15).length?flattened(last15):baseExamples,
    ONLINE_NEGATIVAS_5_TURNOS:flattenNeg(last5),
   };
   assert.ok(candidateMemories.ONLINE_NEGATIVAS_5_TURNOS.length);
   const picks={OFICIAL:row.original};
   for(const method of METHODS.filter(m=>m!=='OFICIAL'&&m!=='HASH_FISICO')){
    const bank=candidateMemories[method];
    assert.ok(bank.length,'Memoria vacía: '+method);
    assert.ok(bank.every(x=>x.i<i),'Fuga de futuro en '+method+' '+key(row));
    const third=choose(row,bank);
    picks[method]=combine(row.original,third);
   }
   const external=row.profiles.filter(p=>!row.original.includes(p.family));
   assert.ok(external.length);
   const hashChoice=external.sort((a,b)=>
     sha('20261013|'+date+'|'+row.turn+'|'+a.family).localeCompare(
      sha('20261013|'+date+'|'+row.turn+'|'+b.family)))[0].family;
   picks.HASH_FISICO=combine(row.original,hashChoice);
   const frozenOne=frozenBy.get(key(row));assert.ok(frozenOne);
   assert.deepEqual(picks.ESTATICA_SEMANA_X,frozenOne.method.FUSION_CONSERVADORA.top10,
    'La memoria estática fue alterada con respecto a los Tops ya sellados');
   for(const method of METHODS){
    assert.equal(picks[method].length,10);
    assert.equal(new Set(picks[method]).size,10);
    assert.ok(picks[method].every(f=>row.profiles.some(p=>p.family===f)));
   }
   // Outcome of the current turn is accessed exclusively after all ranked policies
   // are constructed above, which depend only on trainIds or completed j<i.
   const truth=targets[i];
   const possible=positiveExamples(row,truth,i);
   const methods=Object.fromEntries(METHODS.map(m=>[m,check(picks[m],truth)]));
   const dayRank=pre.days[next].indexOf(date)+1;
   assert.ok(dayRank>=1&&dayRank<=6);
   const audits=Object.fromEntries(Object.entries(candidateMemories).map(([m,x])=>[m,{
    exemplarCount:x.length,latestCutIndex:Math.max(...x.map(y=>y.i)),
    currentWeekExemplars:x.filter(y=>y.i>=testIds[0]).length
   }]));
   assert.ok(Object.values(audits).every(x=>x.latestCutIndex<i));
   captured.push({i,date,turn:row.turn,week:next,trainWeek:week,dayRank,
    possible:possible.map(x=>x.family),impossible:[...truth].filter(f=>!row.profiles.some(p=>p.family===f)),
    previousKnownTurns:newCompleted.length,methods,trainingAudit:audits});
   // Teach *after* outcome; its positives and negatives may affect only later turns.
   const finished={i,date:row.date,turn:row.turn,
    positives:possible,negatives:negativeExamples(row,truth,i,possible.length)};
   completed.push(finished);newCompleted.push(finished);
  }
  assert.equal(captured.length,30);
  all.push(...captured);
  weeks.push({trainWeek:week,testWeek:next,trainCuts:trainIds.length,
   trainPhysicalHitCuts:trainPhysicalHits,testCuts:30,casebookPositiveExposures:baseExamples.length,
   byDay:Object.fromEntries([1,2,3,4,5,6].map(rank=>
    [String(rank),reportGroup(captured.filter(x=>x.dayRank===rank))]))});
 }
 assert.equal(all.length,90);
 const full=reportGroup(all);
 assert.deepEqual([full.OFICIAL.top3,full.OFICIAL.top5,full.OFICIAL.top10],[3,6,11]);
 assert.deepEqual([full.ESTATICA_SEMANA_X.top3,full.ESTATICA_SEMANA_X.top5,
  full.ESTATICA_SEMANA_X.top10],[4,5,12]);
 const first=Object.fromEntries([1,2,3].map(n=>[
  'primeros_'+n+'_dias',reportGroup(all.filter(x=>x.dayRank<=n))]));
 const later=reportGroup(all.filter(x=>x.dayRank>=4));
 const everyDay=Object.fromEntries([1,2,3,4,5,6].map(n=>[
  'dia_'+n,reportGroup(all.filter(x=>x.dayRank===n))]));
 const perWeek=Object.fromEntries(pre.weeks.slice(1).map(week=>[
  week,reportGroup(all.filter(x=>x.week===week))]));
 const perTurn=Object.fromEntries(TURNS.map(turn=>[
  turn,reportGroup(all.filter(x=>x.turn===turn))]));
 // PRE-sealed neutral budgets: an external third, top1–top2 stable, top10 otherwise original.
 const neutral=load(OUT+'NEUTRALES_PRE.json');
 assert.equal(neutral.samples,2000);
 const indexed=new Map(pre.testCuts.map((r,j)=>[key(r),j]));
 const winset=new Map(all.map(r=>[key(r),new Set(
  [...r.possible,...r.impossible]
 )]));
 function scoreReplica(repetition,subset){
  let three=0,five=0,ten=0;
  for(const row of subset){
   const ix=indexed.get(key(row));assert.ok(ix!==undefined);
   const offer=pre.testCuts[ix],j=neutral.draws[repetition][ix];
   const third=offer.outsiders[j].family,top=combine(offer.baselineTop,third);
   const hit=check(top,winset.get(key(row)));
   three+=Number(hit.top3);five+=Number(hit.top5);ten+=Number(hit.top10);
  }
  return {top3:three,top5:five,top10:ten};
 }
 function dist(rows,benchmark){
  const reps=Array.from({length:neutral.samples},(_,t)=>scoreReplica(t,rows));
  const out={};
  for(const dim of ['top3','top5','top10']){
   const a=reps.map(x=>x[dim]).sort((a,b)=>a-b);
   out[dim]={n:a.length,mean:Number(mean(a).toFixed(4)),
    p05:a[99],median:a[999],p95:a[1899],min:a[0],max:a.at(-1),
    benchmark:benchmark[dim],
    fractionAtLeastBenchmark:a.filter(x=>x>=benchmark[dim]).length/a.length};
  }
  return out;
 }
 const neutrals={
  firstDay:dist(all.filter(x=>x.dayRank===1),stats(all.filter(x=>x.dayRank===1),'ONLINE_ACUMULATIVA')),
  firstTwo:dist(all.filter(x=>x.dayRank<=2),stats(all.filter(x=>x.dayRank<=2),'ONLINE_ACUMULATIVA')),
  firstThree:dist(all.filter(x=>x.dayRank<=3),stats(all.filter(x=>x.dayRank<=3),'ONLINE_ACUMULATIVA')),
  complete:dist(all,stats(all,'ONLINE_ACUMULATIVA'))
 };
 const changes={};
 for(const method of METHODS.filter(m=>m!=='OFICIAL'&&m!=='ESTATICA_SEMANA_X')){
  changes[method]={
   thirdDifferentFromStatic:all.filter(r=>r.methods[method].top[2]!==r.methods.ESTATICA_SEMANA_X.top[2]).length,
   withinDayChangedThird:all.filter(r=>r.previousKnownTurns>0&&r.methods[method].top[2]!==r.methods.ESTATICA_SEMANA_X.top[2]).length,
   rescuesVsStatic:all.filter(r=>r.methods[method].top3&&!r.methods.ESTATICA_SEMANA_X.top3).map(key),
   lossesVsStatic:all.filter(r=>!r.methods[method].top3&&r.methods.ESTATICA_SEMANA_X.top3).map(key),
   rescues10VsStatic:all.filter(r=>r.methods[method].top10&&!r.methods.ESTATICA_SEMANA_X.top10).map(key),
   losses10VsStatic:all.filter(r=>!r.methods[method].top10&&r.methods.ESTATICA_SEMANA_X.top10).map(key)
  };
 }
 save('POST_90.json',{rows:all,weeks});
 const summary={date:'2026-10-13',daysTotal:18,cuts:90,full,first,later,everyDay,
  perWeek,perTurn,changes,neutralControls:neutrals,seal,
  frozenSelectionHash:sha(read(SRC+'POST_115.json')),
  postHeadsHash:sha(read(BASE+'POST_115.json')),
  caveats:['Las memorias de entrenamiento reproducían 60/60 cortes físicamente alcanzables por almacenar los resultados conocidos de la semana X. Eso no valida su generalización.',
   'Pocas observaciones: primeros 1–3 días equivalen a 15, 30 y 45 cortes en total, no a muestras independientes nuevas.',
   'La quiniela es aleatoria y todo este corpus ha sido reutilizado para formular hipótesis: el ensayo es descriptivo retrospectivo.']};
 save('RESUMEN.json',summary);
 console.log('VT3_MEMORIA_CORTA_POST_OK',JSON.stringify({
  overall:Object.fromEntries(METHODS.map(m=>[m,{
   top3:full[m].top3,top5:full[m].top5,top10:full[m].top10,
   rescued3:full[m].gainedTop3,loses3:full[m].lostTop3,
   rescued10:full[m].gainedTop10,loses10:full[m].lostTop10
  }])),
  dayWindows:Object.fromEntries(Object.entries(first).map(([k,val])=>[k,
   Object.fromEntries(METHODS.map(m=>[m,{top3:val[m].top3,top5:val[m].top5,top10:val[m].top10}]))])),
  eachDay:Object.fromEntries(Object.entries(everyDay).map(([k,val])=>[k,
   Object.fromEntries(METHODS.map(m=>[m,{top3:val[m].top3,top10:val[m].top10}]))])),
  perWeek:Object.fromEntries(Object.entries(perWeek).map(([k,val])=>[k,
   Object.fromEntries(METHODS.map(m=>[m,{top3:val[m].top3,top10:val[m].top10}]))])),
  changes,neutrals
 },null,2));
}
if(process.argv[2]==='pre')pre();
else if(process.argv[2]==='post')post();
else throw Error('Use pre|post');
