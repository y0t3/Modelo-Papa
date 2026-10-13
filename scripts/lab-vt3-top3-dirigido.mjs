import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ORIGINAL='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-top3-dirigido-115-13oct2026/';
const PROTOCOL='PROTOCOLO_VT3_TOP3_APRENDIZAJE_DIRIGIDO_13OCT2026.md';
const BASE_SHA='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const BAGS=['ANCLADAS','FISICAS'];
const ALGORITHM={epochs:32,starts:['CERO','HISTORICO','GEOMETRIA','ANTIHISTORICO'],weightLimit:8,shrinkage:.0015,baseRate:.38,shapeBuckets:16};
const read=f=>readFileSync(f,'utf8'),parse=f=>JSON.parse(read(f));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(f,v)=>writeFileSync(OUT+f,JSON.stringify(v,null,2)+'\n');
const id=r=>r.date+'|'+r.turn;
const fam=h=>{assert.match(h,/^\d{4}$/);let s=h.slice(-3);return [s,[...s].reverse().join('')].sort().join('/')};
const uniq=a=>[...new Set(a)];
const mean=a=>a.length?a.reduce((n,v)=>n+v,0)/a.length:0;
const clamp=(x,l=0,h=1)=>Math.max(l,Math.min(h,x));
const round=x=>Number(x.toFixed(5));
const monday=date=>{
  const dt=new Date(date+'T12:00:00Z');
  dt.setUTCDate(dt.getUTCDate()-((dt.getUTCDay()+6)%7));
  return dt.toISOString().slice(0,10);
};
function coord(cell){
 const pair=cell.split(':').map(Number);
 assert.ok(pair.length===2&&pair[0]>=0&&pair[0]<6&&pair[1]>=0&&pair[1]<2);
 return pair;
}
function shapeToken(cells){
 const points=cells.map(coord),minR=Math.min(...points.map(x=>x[0])),minC=Math.min(...points.map(x=>x[1]));
 const normalized=points.map(([r,c])=>(r-minR)+':'+(c-minC));
 return [normalized.join('>'),normalized.slice().reverse().join('>')].sort()[0];
}
const FEATURE_NAMES=[
 'raizPropia','ventajaRangoOficial','D1','D7','bifurcaciones','fuentesFisicas',
 'bloquesFisicos','caminosFisicos','caminosAnclados','fraccionAnclada',
 'presenciaFuenteReciente','raizEnFuenteReciente','antiguedadMediaFuente',
 'centroFilasAltas','centroFilasMedias','centroFilasBajas',
 'tramosHorizontales','tramosVerticales','tramosDiagonales',
 'caminosRectos','caminosConGiro','diversidadDeFormas',
 ...Array.from({length:16},(_,i)=>'forma_'+i),
 ...SOURCES.map(x=>'fuente_'+x)
];
assert.equal(FEATURE_NAMES.length,43);
mkdirSync(OUT,{recursive:true});
function extract(candidate,witness,turn){
 const turnIdx=TURNS.indexOf(turn);
 assert.ok(turnIdx>=0);
 const paths=witness.paths;
 assert.ok(paths.length);
 const sources=new Set(),blocks=new Set(),shapes=new Set(),bins=Array(16).fill(0);
 const sourceFreq=Array(5).fill(0);
 const zone=Array(3).fill(0),direction=Array(3).fill(0);
 let anchored=0,newestRoot=0,newestAny=0,ages=0,straight=0;
 const seenRoutes=new Set();
 for(const path of paths){
  assert.ok(SOURCES.includes(path.source));
  const sourceIdx=SOURCES.indexOf(path.source);
  assert.ok(sourceIdx<=turnIdx,'Ruta que proviene del futuro '+path.source);
  assert.equal(path.cells.length,3);assert.equal(new Set(path.cells).size,3);
  const xy=path.cells.map(coord);
  const orientation=[path.cells.join('>'),path.cells.slice().reverse().join('>')].sort()[0];
  const physicalKey=path.source+'|'+orientation;
  assert.ok(!seenRoutes.has(physicalKey),'Ruta duplicada '+physicalKey);
  seenRoutes.add(physicalKey);
  for(let n=0;n<2;n++){
   const [a,b]=[xy[n],xy[n+1]];
   assert.equal(Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])),1);
   const dr=Math.abs(a[0]-b[0]),dc=Math.abs(a[1]-b[1]);
   direction[dr&&dc?2:dr?1:0]++;
  }
  const mid=xy[1][0],token=shapeToken(path.cells);
  zone[Math.min(2,Math.floor(mid/2))]++;
  shapes.add(token);
  bins[parseInt(sha(token).slice(0,5),16)%16]++;
  if(xy[0][0]-xy[1][0]===xy[1][0]-xy[2][0] &&
     xy[0][1]-xy[1][1]===xy[1][1]-xy[2][1])straight++;
  const age=turnIdx-sourceIdx;
  ages+=age/(turnIdx+1);
  newestAny+=Number(age===0);
  sourceFreq[sourceIdx]++;
  sources.add(path.source);
  blocks.add(path.source+'|'+path.cells.slice().sort().join(','));
  if(path.anchored){
   assert.ok(path.rootIds?.length>0);
   anchored++;
   newestRoot+=Number(age===0);
  } else assert.equal(path.rootIds?.length||0,0);
 }
 const n=paths.length,root=Boolean(candidate);
 assert.equal(root,anchored>0,'Anclaje físico/bolsa original contradictorio '+witness.family);
 const v=[
  Number(root),
  root?clamp(1-Math.log(candidate.rank)/Math.log(150)):0,
  clamp((candidate?.d1||0)/3),
  clamp((candidate?.d7||0)/3),
  clamp((candidate?.bif||0)/4),
  clamp(sources.size/5),
  clamp(blocks.size/6),
  clamp(n/10),
  clamp(anchored/10),
  anchored/n,
  newestAny/n,
  anchored?newestRoot/anchored:0,
  ages/n,
  ...zone.map(x=>x/n),
  ...direction.map(x=>x/(2*n)),
  straight/n,1-straight/n,
  shapes.size/n,
  ...bins.map(x=>x/n),
  ...sourceFreq.map(x=>x/n)
 ].map(round);
 assert.equal(v.length,FEATURE_NAMES.length);
 assert.ok(v.every(x=>Number.isFinite(x)&&x>=0&&x<=1.00001));
 return v;
}
function prepare(){
 assert.equal(sha(read(ORIGINAL+'PRE_115.json')),BASE_SHA);
 for(const f of [ORIGINAL+'POST_115.json',ORIGINAL+'NOCTURNA_POST_DIAGNOSTICO.json'])
  assert.ok(!existsSync(f),'POST visible durante preparación '+f);
 const base=parse(ORIGINAL+'PRE_115.json').rows;
 assert.equal(base.length,115);
 const rows=base.map(row=>{
  const ranks=new Map(row.strategies.A_ORIGINAL.map(x=>[x.family,x]));
  const inventory=new Set(row.strategies.B_INVENTARIO.map(x=>x.family));
  const witnesses=new Map(row.witnesses.map(x=>[x.family,x]));
  assert.equal(inventory.size,witnesses.size);
  assert.ok(ranks.size>=10);
  const profiles=[...inventory].map(f=>{
   const w=witnesses.get(f);assert.ok(w);
   const candidate=ranks.get(f);
   return {family:f,rooted:Boolean(candidate),originalRank:candidate?.rank??null,
    feat:extract(candidate,w,row.turn)};
  });
  assert.ok(profiles.every(p=>p.feat.length===FEATURE_NAMES.length));
  const original=row.strategies.A_ORIGINAL.slice(0,10).map(x=>x.family);
  assert.deepEqual(profiles.filter(p=>p.rooted).slice(0,10).map(x=>x.family),original);
  return {date:row.date,turn:row.turn,week:monday(row.date),
   original,physicalCount:profiles.length,rootedCount:ranks.size,profiles};
 });
 const weeks=uniq(rows.map(x=>x.week)).sort();
 assert.equal(weeks.length,4);
 assert.equal(uniq(rows.map(x=>x.date)).length,23);
 assert.deepEqual(rows.filter(r=>r.week===weeks[0]).map(x=>x.turn).slice(0,5),TURNS);
 save('PRE_115.json',{date:'2026-10-13',weeks,rows,
  features:FEATURE_NAMES,hyperparameters:ALGORITHM,
  note:'SÓLO candidaturas y geometrías PRE, sin cabezas ganadoras ni etiquetas.'});
 const seal={origin:BASE_SHA,script:sha(read('scripts/lab-vt3-top3-dirigido.mjs')),
  protocol:sha(read(PROTOCOL)),pre:sha(read(OUT+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('VT3_TOP3_APRENDIZAJE_PRE_OK',JSON.stringify({
  cuts:rows.length,weeks:weeks.map(w=>({week:w,cuts:rows.filter(r=>r.week===w).length})),
  familyExposures:rows.reduce((n,r)=>n+r.physicalCount,0),features:FEATURE_NAMES.length,seal}));
}
function validateSeal(){
 const s=parse(OUT+'SELLO.json');
 assert.equal(s.origin,sha(read(ORIGINAL+'PRE_115.json')));
 assert.equal(s.script,sha(read('scripts/lab-vt3-top3-dirigido.mjs')));
 assert.equal(s.protocol,sha(read(PROTOCOL)));
 assert.equal(s.pre,sha(read(OUT+'PRE_115.json')));
 return s;
}
function vectorScore(p,w){let s=0;for(let j=0;j<w.length;j++)s+=w[j]*p.feat[j];return s}
const rank=(profiles,w)=>profiles.slice().sort((a,b)=>
  vectorScore(b,w)-vectorScore(a,w)||
  (a.originalRank??9999)-(b.originalRank??9999)||a.family.localeCompare(b.family));
function selectPool(row,bag){const candidates=bag==='ANCLADAS'?row.profiles.filter(p=>p.rooted):row.profiles;
 assert.ok(candidates.length>=10);return candidates;}
function trainingStats(train,weights,bag){
 let hits=0,hits5=0,positiveRanks=0,positiveCases=0,top3WinnerTotal=0;
 for(const ex of train){
  const ordered=rank(selectPool(ex.row,bag),weights);
  const positives=ordered.flatMap((p,index)=>ex.goals.has(p.family)?[index+1]:[]);
  if(positives.length){
   positiveCases++;positiveRanks+=1/positives[0];
  }
  hits+=Number(positives.some(x=>x<=3));
  hits5+=Number(positives.some(x=>x<=5));
  top3WinnerTotal+=positives.filter(x=>x<=3).length;
 }
 return {top3:hits,top5:hits5,reciprocal:round(positiveRanks),targetCases:positiveCases,
  chosenWinnerFamilies:top3WinnerTotal};
}
function norm(w){return w.reduce((s,x)=>s+x*x,0)}
function better(a,b){
 if(!b)return true;
 if(a.fit.top3!==b.fit.top3)return a.fit.top3>b.fit.top3;
 if(a.fit.chosenWinnerFamilies!==b.fit.chosenWinnerFamilies)
  return a.fit.chosenWinnerFamilies>b.fit.chosenWinnerFamilies;
 if(a.fit.top5!==b.fit.top5)return a.fit.top5>b.fit.top5;
 if(a.fit.reciprocal!==b.fit.reciprocal)return a.fit.reciprocal>b.fit.reciprocal;
 return norm(a.weights)<norm(b.weights)-1e-8;
}
function init(name){
 const w=Array(FEATURE_NAMES.length).fill(0);
 if(name==='HISTORICO'){w[0]=.45;w[1]=2.4;w[2]=.7;w[3]=.6;w[4]=.9}
 if(name==='GEOMETRIA'){w[5]=.7;w[6]=1.2;w[11]=.35;w[20]=.4;w[21]=.5;}
 if(name==='ANTIHISTORICO'){w[0]=-.2;w[1]=-1.6;w[5]=1.1;w[19]=.7;}
 return w;
}
function learn(train,bag){
 assert.ok(train.length>=20);
 let best=null;
 const first=init('CERO'),initialRoot=trainingStats(train,init('HISTORICO'),bag);
 for(const start of ALGORITHM.starts){
  const w=init(start);
  for(let epoch=0;epoch<=ALGORITHM.epochs;epoch++){
   const fit=trainingStats(train,w,bag);
   const candidate={start,epoch,weights:[...w],fit};
   if(better(candidate,best))best=candidate;
   if(epoch===ALGORITHM.epochs)break;
   // Deterministic cyclic ordering. All labels belong to week X only.
   const shift=(epoch*7)%train.length;
   for(let n=0;n<train.length;n++){
    const ex=train[(n+shift)%train.length],cands=rank(selectPool(ex.row,bag),w);
    const positives=cands.filter(c=>ex.goals.has(c.family));
    if(!positives.length)continue; // impossible family in this candidate pool
    if(cands.slice(0,3).some(c=>ex.goals.has(c.family)))continue;
    const pos=positives[0],neg=cands[2];
    assert.ok(!ex.goals.has(neg.family));
    const lr=ALGORITHM.baseRate/(1+.075*epoch);
    for(let j=0;j<w.length;j++){
     w[j]=Math.max(-ALGORITHM.weightLimit,Math.min(ALGORITHM.weightLimit,
      (1-ALGORITHM.shrinkage)*w[j]+lr*(pos.feat[j]-neg.feat[j])));
    }
   }
  }
 }
 assert.ok(best);
 assert.equal(best.weights.length,FEATURE_NAMES.length);
 return {best,untrainedHistoric:initialRoot};
}
function docente(row,goals,bag){
 const pool=selectPool(row,bag),real=pool.filter(x=>goals.has(x.family));
 const first=[...real.slice(0,3)];
 const seen=new Set(first.map(x=>x.family));
 const base=[...row.original.map(f=>pool.find(x=>x.family===f)).filter(Boolean),...pool];
 for(const p of base){if(first.length===3)break;if(!seen.has(p.family)){first.push(p);seen.add(p.family)}}
 assert.equal(first.length,3);
 return {top:first.map(p=>p.family),
  physicallyAvailableWinnerFamilies:real.map(x=>x.family),
  physicallyPossibleCut:real.length>0,oracleTop3Hit:first.some(p=>goals.has(p.family))};
}
function constructTop10(row,learnedTop3){
 const result=[...learnedTop3];
 const seen=new Set(result);
 for(const family of row.original){if(!seen.has(family)){seen.add(family);result.push(family)}if(result.length===10)break}
 assert.equal(result.length,10);
 assert.equal(seen.size,10);
 return result;
}
function evaluate(){
 const seal=validateSeal();
 const prep=parse(OUT+'PRE_115.json'),rows=prep.rows,weeks=prep.weeks;
 const post=parse(ORIGINAL+'POST_115.json').rows;
 assert.equal(post.length,rows.length);
 const truths=post.map((p,i)=>{
  assert.equal(id(p),id(rows[i]));
  assert.equal(p.targets.length,5);
  return new Set(p.targets.map(fam));
 });
 const perWeek=[],cutDetails=[];
 for(let wi=0;wi<weeks.length-1;wi++){
  const trainIds=rows.flatMap((r,i)=>r.week===weeks[wi]?[i]:[]);
  const testIds=rows.flatMap((r,i)=>r.week===weeks[wi+1]?[i]:[]);
  assert.ok(trainIds.length&&testIds.length);
  assert.ok(trainIds.every(i=>rows[i].date<rows[testIds[0]].date));
  const train=trainIds.map(i=>({row:rows[i],goals:truths[i]}));
  const perBag={};
  for(const bag of BAGS){
   const model=learn(train,bag);
   const fit=model.best.fit;
   const trainDoc=trainIds.map(i=>docente(rows[i],truths[i],bag));
   const teacherHit=trainDoc.filter(x=>x.oracleTop3Hit).length;
   const trainingBaseline=trainIds.filter(i=>rows[i].original.slice(0,3).some(f=>truths[i].has(f))).length;
   const trainingPhysicalCeiling=trainDoc.filter(x=>x.physicallyPossibleCut).length;
   assert.equal(teacherHit,trainingPhysicalCeiling);
   assert.ok(fit.top3<=teacherHit);
   const tested=[];
   for(const index of testIds){
    const r=rows[index],tr=truths[index];
    const top3=rank(selectPool(r,bag),model.best.weights).slice(0,3).map(p=>p.family);
    const top10=constructTop10(r,top3);
    const possible=selectPool(r,bag).filter(p=>tr.has(p.family)).map(p=>p.family);
    const official3=r.original.slice(0,3);
    const official10=r.original;
    const cv={
     index,date:r.date,turn:r.turn,week:r.week,bag,trainedWeek:weeks[wi],
     knownTrainingDates:[rows[trainIds[0]].date,rows[trainIds.at(-1)].date],
     top3,top10,official3,official10,
     hit3:top3.some(f=>tr.has(f)),hit10:top10.some(f=>tr.has(f)),
     officialHit3:official3.some(f=>tr.has(f)),officialHit10:official10.some(f=>tr.has(f)),
     reachable:possible.length>0,availableWinnerFamilies:possible,
     allWinnerFamilies:[...tr],
     top3WinnerFamilies:top3.filter(f=>tr.has(f))
    };
    tested.push(cv);
    cutDetails.push(cv);
   }
   function counts(items){
    const gains=items.filter(x=>x.hit3&&!x.officialHit3).map(id);
    const losses=items.filter(x=>!x.hit3&&x.officialHit3).map(id);
    return {
     cuts:items.length,top3:items.filter(x=>x.hit3).length,
     top10:items.filter(x=>x.hit10).length,
     officialTop3:items.filter(x=>x.officialHit3).length,
     officialTop10:items.filter(x=>x.officialHit10).length,
     reachableCuts:items.filter(x=>x.reachable).length,
     gainsTop3:gains,lossesTop3:losses,
     gainTop10:items.filter(x=>x.hit10&&!x.officialHit10).map(id),
     lossTop10:items.filter(x=>!x.hit10&&x.officialHit10).map(id)
    };
   }
   perBag[bag]={
    teach:{cuts:train.length,originalTop3:trainingBaseline,
     teacherMaxPhysicalTop3:teacherHit,
     teacherUpperBound:trainingPhysicalCeiling,
     physicallyImpossible:train.length-trainingPhysicalCeiling,
     teacherWinnerFamiliesPlaced:trainDoc.reduce((n,x)=>n+x.top.filter(f=>x.physicallyAvailableWinnerFamilies.includes(f)).length,0)},
    fitted:{inSample:fit,initialHistoric:model.untrainedHistoric,
     init:model.best.start,epoch:model.best.epoch,
     nonzeroFeatureWeights:FEATURE_NAMES.map((f,j)=>({feature:f,weight:model.best.weights[j]}))
      .filter(x=>Math.abs(x.weight)>.0001).sort((a,b)=>Math.abs(b.weight)-Math.abs(a.weight))},
    exam:counts(tested)
   };
  }
  perWeek.push({trainWeek:weeks[wi],testWeek:weeks[wi+1],
   trainStart:rows[trainIds[0]].date,trainEnd:rows[trainIds.at(-1)].date,
   testStart:rows[testIds[0]].date,testEnd:rows[testIds.at(-1)].date,
   trainCuts:trainIds.length,testCuts:testIds.length,
   perBag});
 }
 const all=Object.fromEntries(BAGS.map(bag=>{
  const items=cutDetails.filter(x=>x.bag===bag);
  const score={trainFittedTop3Sum:perWeek.reduce((s,r)=>s+r.perBag[bag].fitted.inSample.top3,0),
   trainDocenteTop3Sum:perWeek.reduce((s,r)=>s+r.perBag[bag].teach.teacherMaxPhysicalTop3,0),
   trainBaselineTop3Sum:perWeek.reduce((s,r)=>s+r.perBag[bag].teach.originalTop3,0),
   examCuts:items.length,examTop3:items.filter(x=>x.hit3).length,
   officialExamTop3:items.filter(x=>x.officialHit3).length,
   examTop10:items.filter(x=>x.hit10).length,
   officialExamTop10:items.filter(x=>x.officialHit10).length,
   examPhysicalCeiling:items.filter(x=>x.reachable).length,
   examNewTop3:items.filter(x=>x.hit3&&!x.officialHit3).map(id),
   examLostTop3:items.filter(x=>!x.hit3&&x.officialHit3).map(id),
   examNewTop10:items.filter(x=>x.hit10&&!x.officialHit10).map(id),
   examLostTop10:items.filter(x=>!x.hit10&&x.officialHit10).map(id)};
  return [bag,score];
 }));
 assert.equal(all.ANCLADAS.examCuts,90);
 assert.equal(all.FISICAS.examCuts,90);
 // Honest fit ceilings: this teacher has perfect top3-cut recall of *possible* positives.
 const report={
  date:'2026-10-13',period:'2026-09-15 a 2026-10-10',
  weeks,algorithm:ALGORITHM,features:FEATURE_NAMES,
  perWeek,overall:all,topDetails:cutDetails,
  comparison:'Docente observa X; pesos aprenden sólo X; examen oculto X+1, sin incorporar resultados de la semana evaluada a parámetros o tops.',
  confounds:['El histórico completo ya se exploró para diseñar este estudio; no es un holdout verdaderamente independiente.',
   'Un docente puede memorizar X y lograr techo físico Top3, sin ningún modelo transferible.',
   'La lotería es aleatoria: ninguna forma histórica asegura probabilidad mayor.'],
  seal,postHash:sha(read(ORIGINAL+'POST_115.json'))
 };
 save('POST_115.json',{weeks:perWeek,rows:cutDetails});
 save('RESUMEN.json',report);
 console.log('VT3_TOP3_APRENDIZAJE_POST_OK',JSON.stringify({
  weeks:perWeek.map(w=>({train:w.trainWeek,test:w.testWeek,
   anchored:{teach:w.perBag.ANCLADAS.teach,fitted:w.perBag.ANCLADAS.fitted.inSample,
    exam:w.perBag.ANCLADAS.exam,epoch:w.perBag.ANCLADAS.fitted.epoch},
   physical:{teach:w.perBag.FISICAS.teach,fitted:w.perBag.FISICAS.fitted.inSample,
    exam:w.perBag.FISICAS.exam,epoch:w.perBag.FISICAS.fitted.epoch}})),
  overall:all
 },null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')evaluate();
else throw Error('Usar pre|post');
