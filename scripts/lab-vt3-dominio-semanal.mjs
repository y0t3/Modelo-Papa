import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const BASE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const FEATURES_SRC='auditorias/vt3-top3-dirigido-115-13oct2026/';
const OUT='auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/';
const PROTO='PROTOCOLO_VT3_DOMINIO_SEMANAL_13OCT2026.md';
const BASEHASH='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const FEATUREHASH='32319d0c1f0c38908d6a14d964e43907ee75417ca1144bc486ee9cef495f9a67';
const TYPES=['OFICIAL','PATRON_GLOBAL','PATRON_MISMO_TURNO','CASILLAS_FUENTE',
 'VECINO_GEOMETRICO','VECINO_RESPALDO','FUSION_CONSERVADORA','CONTROL_NEGATIVAS'];
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=x=>createHash('sha256').update(x).digest('hex');
const save=(p,x)=>writeFileSync(OUT+p,JSON.stringify(x,null,2)+'\n');
const id=x=>x.date+'|'+x.turn;
const family=h=>{assert.match(h,/^\d{4}$/);const s=h.slice(-3);return[s,[...s].reverse().join('')].sort().join('/')};
const unique=x=>[...new Set(x)];
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const medWeek=d=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()-((x.getUTCDay()+6)%7));return x.toISOString().slice(0,10)};
const clip=x=>Math.max(0,Math.min(1,x));
mkdirSync(OUT,{recursive:true});
function vec(k){
 const [r,c]=k.split(':').map(Number);
 assert.ok(Number.isInteger(r)&&r>=0&&r<6&&Number.isInteger(c)&&c>=0&&c<2,'celda inválida '+k);
 return [r,c];
}
function normalized(cells){
 const a=cells.map(vec),lowR=Math.min(...a.map(x=>x[0])),lowC=Math.min(...a.map(x=>x[1]));
 const sequence=a.map(([r,c])=>(r-lowR)+':'+(c-lowC));
 return [sequence.join('>'),sequence.slice().reverse().join('>')].sort()[0];
}
function absolute(cells){return[cells.join('>'),cells.slice().reverse().join('>')].sort()[0]}
function tokens(paths,turn){
 const index=TURNS.indexOf(turn),sources=['prevNocturno',...TURNS.slice(0,4)];
 const groups={shapes:new Set(),sameSource:new Set(),abs:new Set()};
 for(const p of paths){
  assert.ok(sources.includes(p.source));
  assert.ok(sources.indexOf(p.source)<=index,'fuente de futuro');
  assert.equal(p.cells.length,3);assert.equal(new Set(p.cells).size,3);
  for(let i=0;i<2;i++){
   const a=vec(p.cells[i]),b=vec(p.cells[i+1]);
   assert.equal(Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])),1,'ruta inválida');
  }
  const sh=normalized(p.cells),ab=absolute(p.cells);
  groups.shapes.add(sh);groups.sameSource.add(p.source+'|'+sh);
  groups.abs.add(p.source+'|'+ab);
 }
 return Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,[...v].sort()]));
}
function prepare(){
 assert.equal(sha(read(BASE+'PRE_115.json')),BASEHASH);
 assert.equal(sha(read(FEATURES_SRC+'PRE_115.json')),FEATUREHASH);
 for(const p of [BASE+'POST_115.json',FEATURES_SRC+'POST_115.json'])
  assert.ok(!existsSync(p),'POST visible antes del sellado: '+p);
 const physical=json(BASE+'PRE_115.json').rows,prior=json(FEATURES_SRC+'PRE_115.json');
 assert.equal(physical.length,115);assert.equal(prior.rows.length,115);
 const rows=physical.map((r,i)=>{
  const p=prior.rows[i];assert.equal(id(r),id(p));
  const witnesses=new Map(r.witnesses.map(w=>[w.family,w.paths]));
  assert.equal(witnesses.size,p.profiles.length);
  const profiles=p.profiles.map(q=>{
   const paths=witnesses.get(q.family);
   assert.ok(paths?.length,'faltan caminos propios '+q.family);
   assert.ok(q.feat.length===43);
   return {...q,geo:tokens(paths,r.turn)};
  });
  assert.ok(p.original.every(f=>profiles.some(x=>x.family===f&&x.rooted)));
  return {date:r.date,turn:r.turn,week:medWeek(r.date),original:p.original,
   profiles,physicalCount:profiles.length,rootedCount:profiles.filter(x=>x.rooted).length};
 });
 const weeks=unique(rows.map(x=>x.week)).sort();assert.equal(weeks.length,4);
 const dates=unique(rows.map(x=>x.date));assert.equal(dates.length,23);
 for(const d of dates)assert.deepEqual(rows.filter(r=>r.date===d).map(r=>r.turn),TURNS);
 // Fingerprint by actual candidate geometry, not by the winning outcomes.
 for(const r of rows)r.fingerprint=sha(JSON.stringify(
  r.profiles.map(x=>[x.family,x.rooted,x.originalRank,x.geo,x.feat])));
 const known=new Set(rows.map(r=>id(r)));
 assert.equal(known.size,115);
 save('PRE_115.json',{rows,weeks,dates,methods:TYPES,
  note:'Perfiles, geometrías y huellas exclusivamente PRE. Sin ganador en esta etapa.'});
 const seal={sourcePre:BASEHASH,profilePre:FEATUREHASH,
  protocol:sha(read(PROTO)),code:sha(read('scripts/lab-vt3-dominio-semanal.mjs')),
  data:sha(read(OUT+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('VT3_DOMINIO_PRE_OK',JSON.stringify({cuts:rows.length,weeks,
  physicalFamilyExposures:rows.reduce((n,r)=>n+r.physicalCount,0),seal}));
}
function assertSeal(){
 const s=json(OUT+'SELLO.json');
 assert.equal(s.sourcePre,sha(read(BASE+'PRE_115.json')));
 assert.equal(s.profilePre,sha(read(FEATURES_SRC+'PRE_115.json')));
 assert.equal(s.protocol,sha(read(PROTO)));
 assert.equal(s.code,sha(read('scripts/lab-vt3-dominio-semanal.mjs')));
 assert.equal(s.data,sha(read(OUT+'PRE_115.json')));
 return s;
}
function targetCount(row,goals){
 const have=new Set(row.profiles.map(p=>p.family));
 const reached=[...goals].filter(f=>have.has(f));
 assert.ok(reached.length<=5);
 return {reached,missing:[...goals].filter(f=>!have.has(f))};
}
function teacher(row,goals){
 const target=targetCount(row,goals).reached;
 const rank=new Map(row.original.map((f,i)=>[f,i]));
 const rootOrder=new Map(row.profiles.filter(p=>p.rooted).map(p=>[p.family,p.originalRank]));
 const positives=target.slice().sort((a,b)=>Number(rootOrder.has(b))-Number(rootOrder.has(a))||
  (rootOrder.get(a)||999)-(rootOrder.get(b)||999)||a.localeCompare(b));
 const minTop=positives.length>3?5:3;
 const list=[...positives];
 const all=[...row.original,...row.profiles.map(p=>p.family)];
 for(const f of all){if(list.length>=10)break;if(!list.includes(f))list.push(f)}
 assert.equal(list.length,10);assert.equal(new Set(list).size,10);
 assert.ok(positives.every(f=>list.slice(0,minTop).includes(f)));
 return {positives,expectedTop:minTop,top10:list};
}
function memoryModel(rows,goals){
 assert.equal(rows.length,goals.length);
 const entries=rows.map((row,i)=>{
  const lesson=teacher(row,goals[i]);
  const lookup=new Map(row.profiles.map(p=>[p.family,p]));
  return {date:row.date,turn:row.turn,fingerprint:row.fingerprint,
   observedPhysicalPositives:lesson.positives,
   top10:lesson.top10,expectedTop:lesson.expectedTop,
   exemplars:lesson.positives.map(f=>{
    const p=lookup.get(f);assert.ok(p);
    return {family:f,turn:row.turn,geo:p.geo,feat:p.feat};
   }),
   negativeExamples:row.profiles.filter(x=>!lesson.positives.includes(x.family))
    .sort((a,b)=>sha(row.date+'|'+row.turn+'|'+a.family+'|control')
      .localeCompare(sha(row.date+'|'+row.turn+'|'+b.family+'|control')))
    .slice(0,Math.max(1,lesson.positives.length))
    .map(x=>({family:x.family,turn:row.turn,geo:x.geo,feat:x.feat}))
  };
 });
 assert.equal(new Set(entries.map(e=>e.date+'|'+e.turn)).size,entries.length);
 return entries;
}
function memorizeInfer(row,memory){
 const record=memory.find(e=>e.date===row.date&&e.turn===row.turn);
 if(!record||record.fingerprint!==row.fingerprint)return null;
 const present=new Set(row.profiles.map(p=>p.family));
 assert.ok(record.top10.every(f=>present.has(f)));
 return {top10:record.top10,expectedTop:record.expectedTop};
}
function jaccard(a,b){
 const as=new Set(a),bs=new Set(b);
 if(!as.size&&!bs.size)return 0;
 let k=0;for(const x of as)if(bs.has(x))k++;
 return k/(as.size+bs.size-k);
}
function nnScore(p,example,withRoots){
 // Shape/route features 5–42; roots+official priority 0–4 in expanded variant.
 const from=withRoots?0:5;
 let distance=0;
 for(let i=from;i<43;i++){
  const delta=p.feat[i]-example.feat[i];
  distance+=delta*delta;
 }
 return 1/(1+Math.sqrt(distance));
}
function predictUnseen(row,book){
 assert.equal(memorizeInfer(row,book),null,'Hoja objetivo memorizada por error');
 const positive=book.flatMap(r=>r.exemplars),negative=book.flatMap(r=>r.negativeExamples);
 const scores=(p,method)=>{
  let pool=positive;
  if(method==='CONTROL_NEGATIVAS')pool=negative;
  if(method==='PATRON_MISMO_TURNO'){
   const same=positive.filter(x=>x.turn===row.turn);
   if(same.length)pool=same;
  }
  if(!pool.length)return 0;
  const similarity=ex=>{
   switch(method){
    case 'CASILLAS_FUENTE':return jaccard(p.geo.abs,ex.geo.abs);
    case 'PATRON_MISMO_TURNO':return jaccard(p.geo.sameSource,ex.geo.sameSource);
    case 'PATRON_GLOBAL':
    case 'FUSION_CONSERVADORA':
    case 'CONTROL_NEGATIVAS':return jaccard(p.geo.shapes,ex.geo.shapes);
    case 'VECINO_GEOMETRICO':return nnScore(p,ex,false);
    case 'VECINO_RESPALDO':return nnScore(p,ex,true);
    default:throw Error('Método no válido '+method);
   }
  };
  // Mean of 3 most similar exemplar families, not votes from multiple paths.
  const matches=pool.map(similarity).sort((a,b)=>b-a);
  return matches.slice(0,3).reduce((s,x)=>s+x,0)/Math.min(3,matches.length);
 };
 const candidates=row.profiles;
 const full={OFICIAL:row.original};
 for(const method of TYPES.slice(1)){
  const ordered=candidates.slice().sort((a,b)=>{
   const d=scores(b,method)-scores(a,method);
   if(Math.abs(d)>1e-10)return d;
   return Number(b.rooted)-Number(a.rooted)||
     (a.originalRank??9999)-(b.originalRank??9999)||a.family.localeCompare(b.family);
  }).map(p=>p.family);
  let ranked=ordered;
  if(method==='FUSION_CONSERVADORA'){
   ranked=[...row.original.slice(0,2),...ordered.filter(f=>!row.original.slice(0,2).includes(f))];
  }
  full[method]=ranked.slice(0,10);
 }
 for(const [m,top] of Object.entries(full)){
  assert.equal(top.length,10,m);assert.equal(new Set(top).size,10);
  assert.ok(top.every(f=>row.profiles.some(p=>p.family===f)));
 }
 return full;
}
function cutScore(top,truth){
 return {top10:top,top3:top.slice(0,3).filter(f=>truth.has(f)),
  top5:top.slice(0,5).filter(f=>truth.has(f)),
  hit3:top.slice(0,3).some(f=>truth.has(f)),
  hit5:top.slice(0,5).some(f=>truth.has(f)),
  hit10:top.some(f=>truth.has(f))};
}
function post(){
 const seal=assertSeal();
 const PRE=json(OUT+'PRE_115.json'),rows=PRE.rows;
 const results=json(BASE+'POST_115.json').rows;
 assert.equal(results.length,115);
 const truth=results.map((r,i)=>{assert.equal(id(r),id(rows[i]));return new Set(r.targets.map(family))});
 const rounds=[],exams=[];
 for(let w=0;w<PRE.weeks.length-1;w++){
  const trainIndices=rows.flatMap((r,i)=>r.week===PRE.weeks[w]?[i]:[]);
  const testIndices=rows.flatMap((r,i)=>r.week===PRE.weeks[w+1]?[i]:[]);
  assert.ok(trainIndices.length&&testIndices.length);
  const trainRows=trainIndices.map(i=>rows[i]),trainGoal=trainIndices.map(i=>truth[i]);
  const model=memoryModel(trainRows,trainGoal);
  // Save actual learnt book, then read it back. Inference below reads NO labels.
  const bookName='MEMORIA_SEMANA_'+PRE.weeks[w]+'.json';
  save(bookName,{trainWeek:PRE.weeks[w],casebook:model});
  const learned=json(OUT+bookName).casebook;
  assert.equal(learned.length,trainRows.length);
  const trainingEval=trainRows.map((r,i)=>{
   const inferred=memorizeInfer(r,learned);
   assert.ok(inferred,'El aprendiz debe reproducir X sin consultar POST');
   const expected=learned[i];
   assert.deepEqual(inferred.top10,expected.top10);
   assert.equal(inferred.expectedTop,expected.expectedTop);
   const score=cutScore(inferred.top10,trainGoal[i]);
   const truePossible=targetCount(r,trainGoal[i]).reached;
   assert.ok(truePossible.every(f=>inferred.top10.slice(0,inferred.expectedTop).includes(f)),
     'No reproduce todas las terminaciones físicamente posibles');
   return {date:r.date,turn:r.turn,expectedTop:inferred.expectedTop,
    positiveCount:truePossible.length,top:inferred.top10.slice(0,inferred.expectedTop),
    covered:score.top10.filter(f=>truePossible.includes(f)).length,
    allCovered:truePossible.every(f=>score.top5.includes(f))};
  });
  const counted={zero:0,oneToThree:0,fourOrFive:0};
  trainingEval.forEach(x=>{if(!x.positiveCount)counted.zero++;
   else if(x.positiveCount<=3)counted.oneToThree++;
   else counted.fourOrFive++;});
  assert.equal(trainingEval.filter(x=>x.positiveCount>0&&x.allCovered).length,
    trainingEval.filter(x=>x.positiveCount>0).length);
  assert.equal(trainingEval.filter(x=>x.positiveCount>=4).every(x=>x.expectedTop===5),true);
  // The entire week's unseen predictions are constructed BEFORE examining its goals.
  const predicted=testIndices.map(i=>{
   const row=rows[i];
   assert.ok(!learned.some(e=>e.date===row.date));
   return {i,top:predictUnseen(row,learned)};
  });
  const checked=predicted.map(({i,top})=>{
   const goal=truth[i],row=rows[i],availability=targetCount(row,goal);
   return {date:row.date,turn:row.turn,week:row.week,
    trainWeek:PRE.weeks[w],physicallyAvailable:availability.reached,
    physicallyMissing:availability.missing,
    method:Object.fromEntries(TYPES.map(m=>[m,cutScore(top[m],goal)]))};
  });
  const round={trainWeek:PRE.weeks[w],testWeek:PRE.weeks[w+1],
   trainCuts:trainRows.length,testCuts:checked.length,
   trainingDistribution:counted,
   trainedPhysicalPositiveFamilies:trainingEval.reduce((s,x)=>s+x.positiveCount,0),
   trainingReproduction:{possibleCuts:trainingEval.filter(x=>x.positiveCount>0).length,
    fullyReproducedCuts:trainingEval.filter(x=>x.allCovered).length,
    status:trainingEval.every(x=>x.allCovered)?'100pct_in_sample':'FAILED'},
   examReached:checked.filter(x=>x.physicallyAvailable.length>0).length,
   casebookName:bookName,casebookSha:sha(read(OUT+bookName)),
   trainExamples:trainingEval,testIndices};
  rounds.push(round);exams.push(...checked);
 }
 function score(cuts,m){
  const gain=cuts.filter(x=>x.method[m].hit3&&!x.method.OFICIAL.hit3);
  const loss=cuts.filter(x=>!x.method[m].hit3&&x.method.OFICIAL.hit3);
  const gain10=cuts.filter(x=>x.method[m].hit10&&!x.method.OFICIAL.hit10);
  const loss10=cuts.filter(x=>!x.method[m].hit10&&x.method.OFICIAL.hit10);
  return {cuts:cuts.length,top3:cuts.filter(x=>x.method[m].hit3).length,
   top5:cuts.filter(x=>x.method[m].hit5).length,
   top10:cuts.filter(x=>x.method[m].hit10).length,
   winnerFamilyTop3:cuts.reduce((s,x)=>s+x.method[m].top3.length,0),
   winnerFamilyTop5:cuts.reduce((s,x)=>s+x.method[m].top5.length,0),
   gained3:gain.map(id),lost3:loss.map(id),
   gained10:gain10.map(id),lost10:loss10.map(id)};
 }
 const reportMethods=cuts=>Object.fromEntries(TYPES.map(m=>[m,score(cuts,m)]));
 const overall=reportMethods(exams);
 const byWeek=Object.fromEntries(PRE.weeks.slice(1).map(w=>
  [w,reportMethods(exams.filter(x=>x.week===w))]));
 const byTurn=Object.fromEntries(TURNS.map(t=>[t,reportMethods(exams.filter(x=>x.turn===t))]));
 const trainingTotal={cases:rounds.reduce((s,r)=>s+r.trainCuts,0),
  physicalPositiveFamilyExposures:rounds.reduce((s,r)=>s+r.trainedPhysicalPositiveFamilies,0),
  reachableCases:rounds.reduce((s,r)=>s+r.trainingReproduction.possibleCuts,0),
  fullyReproducedCases:rounds.reduce((s,r)=>s+r.trainingReproduction.fullyReproducedCuts,0),
  distribution:Object.fromEntries(['zero','oneToThree','fourOrFive'].map(k=>
   [k,rounds.reduce((s,r)=>s+r.trainingDistribution[k],0)]))};
 assert.equal(trainingTotal.cases,85);
 assert.equal(trainingTotal.reachableCases,trainingTotal.fullyReproducedCases);
 assert.equal(exams.length,90);
 assert.equal(overall.OFICIAL.top3,3);
 assert.equal(overall.OFICIAL.top10,11);
 save('POST_115.json',{rounds,rows:exams});
 save('RESUMEN.json',{date:'2026-10-13',rounds:rounds.map(x=>({
   trainWeek:x.trainWeek,testWeek:x.testWeek,trainCuts:x.trainCuts,testCuts:x.testCuts,
   trainingDistribution:x.trainingDistribution,
   trainingReproduction:x.trainingReproduction,
   casebookName:x.casebookName,casebookSha:x.casebookSha
  })),trainingTotal,overall,byWeek,byTurn,seal,
  postSha:sha(read(BASE+'POST_115.json')),
  conclusions:'La memoria aprende a reproducir las hojas X con respuestas conocidas; fuera de X aplica geometría, no memorias de números ni resultados futuros.',
  warning:'El libro de casos memoriza literalmente cabezas conocidas para dominar X. Su 100% NO implica poder anticipar X+1. Muestra ya examinada muchas veces; quiniela aleatoria.'});
 console.log('VT3_DOMINIO_POST_OK',JSON.stringify({
  trainingTotal,
  overall:Object.fromEntries(TYPES.map(m=>[m,{top3:overall[m].top3,top5:overall[m].top5,
    top10:overall[m].top10,gained3:overall[m].gained3,lost3:overall[m].lost3,
    gained10:overall[m].gained10,lost10:overall[m].lost10}])),
  byWeek:Object.fromEntries(Object.entries(byWeek).map(([k,v])=>[k,
   Object.fromEntries(TYPES.map(m=>[m,{top3:v[m].top3,top10:v[m].top10}]))]))
 },null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')post();
else throw Error('Uso: pre|post');
