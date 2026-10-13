import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-aprendizaje-semanal-115-13oct2026/';
const DOC='PROTOCOLO_VT3_APRENDIZAJE_SEMANAL_13OCT2026.md';
const INPUT_SHA='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const METHODS=['OFICIAL','FORMA_RAIZ','CONTEXT_RAIZ','CONSERVADOR_RAIZ','FORMA_FISICA','MIX_9_1','MIX_8_2','NEUTRAL_9_1','NEUTRAL_8_2'];
const MODES=['SEMANA_ANTERIOR','ACUMULATIVO'];
const read=p=>readFileSync(p,'utf8'),parse=p=>JSON.parse(read(p));
const sha=x=>createHash('sha256').update(x).digest('hex');
const save=(name,o)=>writeFileSync(OUT+name,JSON.stringify(o,null,2)+'\n');
const key=r=>r.date+'|'+r.turn;
const fam=h=>{assert.match(h,/^\d{4}$/);const t=h.slice(-3);return [t,[...t].reverse().join('')].sort().join('/')};
const uniq=x=>[...new Set(x)];
const compare=(a,b)=>a.family.localeCompare(b.family);
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const fixed=v=>Number(v.toFixed(5));
mkdirSync(OUT,{recursive:true});
function monday(date){
 const d=new Date(date+'T12:00:00Z');
 assert.ok(!Number.isNaN(d.getTime()));
 d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));
 return d.toISOString().slice(0,10);
}
function coord(x){
 const v=x.split(':').map(Number);
 assert.equal(v.length,2);assert.ok(v[0]>=0&&v[0]<6&&v[1]>=0&&v[1]<2);
 return v;
}
function shape(p){
 const pts=p.cells.map(coord);
 const a=Math.min(...pts.map(x=>x[0])),b=Math.min(...pts.map(x=>x[1]));
 const codes=pts.map(([r,c])=>(r-a)+':'+(c-b));
 return [codes.join('>'),codes.slice().reverse().join('>')].sort()[0];
}
function geoFeature(paths,turn){
 const i=TURNS.indexOf(turn);assert.ok(i>=0);
 const token=new Set(),shapeNames=new Set(),sourceNames=new Set(),blocks=new Set();
 let rooted=0,rootedNew=0;
 for(const p of paths){
  assert.ok(SOURCES.includes(p.source),'fuente desconocida');
  const si=SOURCES.indexOf(p.source);
  assert.ok(si<=i,'camino de una fuente futura');
  assert.equal(p.cells.length,3);assert.equal(new Set(p.cells).size,3);
  for(let n=1;n<3;n++){
   const a=coord(p.cells[n-1]),b=coord(p.cells[n]);
   assert.equal(Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])),1,'ruta no contigua');
  }
  const norm=shape(p);shapeNames.add(norm);sourceNames.add(p.source);
  blocks.add(p.source+'|'+p.cells.slice().sort().join(','));
  const age=i-si;
  token.add('A:'+age);
  const middle=coord(p.cells[1]);
  token.add('Z:'+Math.min(2,Math.floor(middle[0]/2)));
  const segments=[0,1].map(k=>{
   const x=coord(p.cells[k]),y=coord(p.cells[k+1]);
   const dr=Math.abs(x[0]-y[0]),dc=Math.abs(x[1]-y[1]);
   return dr&&dc?'D':dr?'V':'H';
  }).sort().join('');
  token.add('D:'+segments);
  if(p.anchored){assert.ok(p.rootIds.length);rooted++;if(age===0)rootedNew++}
  else assert.equal(p.rootIds.length,0);
 }
 const geo=['SC:'+Math.min(3,sourceNames.size),
  'BL:'+Math.min(5,blocks.size),'PP:'+Math.min(5,paths.length),
  ...[...shapeNames].sort().slice(0,4).map(x=>'SH:'+x),
  ...[...token].sort()];
 return {geo:uniq(geo),rootedPaths:rooted,rootedNewest:rootedNew,
  sources:sourceNames.size,blocks:blocks.size,physicalPaths:paths.length};
}
function build(row){
 const ti=TURNS.indexOf(row.turn);assert.ok(ti>=0);
 const anchor=new Map(row.strategies.A_ORIGINAL.map(x=>[x.family,x]));
 const physical=new Map(row.strategies.B_INVENTARIO.map(x=>[x.family,x]));
 const witness=new Map(row.witnesses.map(x=>[x.family,x.paths]));
 assert.equal(physical.size,row.strategies.B_INVENTARIO.length);
 assert.equal(witness.size,row.witnesses.length);
 assert.deepEqual([...anchor.keys()],row.strategies.A_ORIGINAL.map(x=>x.family));
 assert.ok(anchor.size>=10);
 const fams=[];
 for(const [family,base] of physical){
  const paths=witness.get(family);
  assert.ok(paths?.length);
  const x=geoFeature(paths,row.turn),root=anchor.get(family);
  const flags=[
   'ROOT:'+Number(Boolean(root)),
   'D1:'+Math.min(3,root?.d1||0),
   'D7:'+Math.min(3,root?.d7||0),
   'BIF:'+Math.min(3,root?.bif||0),
   'RA:'+Math.min(4,x.rootedPaths),
   'RN:'+Number(x.rootedNewest>0)
  ];
  const candidate={family,
   rooted:Boolean(root),rank:root?.rank??null,
   geo:x.geo,ctx:uniq([...x.geo,...flags]),
   counts:{paths:x.physicalPaths,rootedPaths:x.rootedPaths,
     sources:x.sources,blocks:x.blocks,d1:root?.d1||0,d7:root?.d7||0,
     bif:root?.bif||0}};
  assert.equal(root!==undefined,x.rootedPaths>0,'inconsistencia anclaje propio '+family);
  fams.push(candidate);
 }
 assert.equal(fams.length,witness.size);
 const original=[...anchor.keys()].slice(0,10);
 assert.deepEqual(original,row.strategies.A_ORIGINAL.slice(0,10).map(x=>x.family));
 return {date:row.date,turn:row.turn,week:monday(row.date),
  original,physicalCount:fams.length,rootedCount:anchor.size,
  profiles:fams};
}
function prepare(){
 for(const file of [ROOT+'POST_115.json',ROOT+'NOCTURNA_POST_DIAGNOSTICO.json'])
  assert.ok(!existsSync(file),'POST disponible antes de sellar PRE: '+file);
 assert.equal(sha(read(ROOT+'PRE_115.json')),INPUT_SHA);
 const all=parse(ROOT+'PRE_115.json').rows;assert.equal(all.length,115);
 const rows=all.map(build);
 const dates=uniq(rows.map(r=>r.date)).sort();assert.equal(dates.length,23);
 for(const date of dates)assert.deepEqual(rows.filter(r=>r.date===date).map(r=>r.turn),TURNS);
 const weeks=uniq(rows.map(r=>r.week)).sort();
 assert.equal(weeks.length,4,'Esperábamos 4 semanas calendario, verificar fechas');
 for(const w of weeks)assert.ok(rows.some(r=>r.week===w));
 save('PRE_115.json',{rows,dates,weeks,methods:METHODS,modes:MODES,
  note:'PRE físico puro: sin cabezas ganadoras ni etiquetas, ni modelos ajustados.'});
 const seal={basePre:INPUT_SHA,code:sha(read('scripts/lab-vt3-aprendizaje-semanal.mjs')),
  protocol:sha(read(DOC)),pre:sha(read(OUT+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('VT3_APRENDIZAJE_PRE_OK',JSON.stringify({
  cuts:rows.length,dates:dates.length,weeks:weeks.map(w=>({
   week:w,days:uniq(rows.filter(r=>r.week===w).map(r=>r.date)).length,
   cuts:rows.filter(r=>r.week===w).length
  })),totalFamilyExposures:rows.reduce((n,r)=>n+r.profiles.length,0),seal}));
}
function verifySeal(){
 const seal=parse(OUT+'SELLO.json');
 for(const [file,expected] of [[ROOT+'PRE_115.json',seal.basePre],
  ['scripts/lab-vt3-aprendizaje-semanal.mjs',seal.code],
  [DOC,seal.protocol],[OUT+'PRE_115.json',seal.pre]])
  assert.equal(sha(read(file)),expected,'SHA alterado: '+file);
 return seal;
}
function train(rows,trainingTargets,variant){
 assert.equal(rows.length,trainingTargets.length);
 let positives=0,negatives=0;
 const counts=new Map();
 for(let i=0;i<rows.length;i++){
  const target=trainingTargets[i];
  assert.ok(target instanceof Set);
  for(const p of rows[i].profiles){
   const yes=target.has(p.family);
   if(yes)positives++;else negatives++;
   for(const token of p[variant]){
    let n=counts.get(token);
    if(!n){n=[0,0];counts.set(token,n)}
    n[yes?0:1]++;
   }
  }
 }
 assert.ok(positives>0&&negatives>0);
 const contributions=new Map();
 for(const [token,[yes,no]] of counts){
  const prior=(yes+no+1)/(positives+negatives+2);
  const p=(yes+8*prior)/(positives+8);
  const q=(no+8*prior)/(negatives+8);
  const shrink=Math.min(1,(yes+no)/20);
  contributions.set(token,Math.log(p/q)*shrink);
 }
 return {positiveFamilyExposures:positives,negativeFamilyExposures:negatives,
  tokenCount:contributions.size,contributions};
}
function score(p,model,kind){return mean(p[kind].map(t=>model.contributions.get(t)||0))}
function predict(r,shapeModel,contextModel){
 const rooted=r.profiles.filter(x=>x.rooted);
 const unrooted=r.profiles.filter(x=>!x.rooted);
 assert.ok(rooted.length>=10);
 const priority=(a,b)=>a.rank-b.rank;
 const best=(pool,model,kind)=>pool.slice().sort((a,b)=>
   score(b,model,kind)-score(a,model,kind)||priority(a,b)||compare(a,b));
 const geomRoot=best(rooted,shapeModel,'geo');
 const ctxRoot=best(rooted,contextModel,'ctx');
 const geomAll=best(r.profiles,shapeModel,'geo');
 const ctxUnroot=best(unrooted,contextModel,'ctx');
 const conservative=rooted.slice().sort((a,b)=>{
  const value=x=>0.6*(1-Math.min(1,(x.rank-1)/20))+
      0.4*(0.5+0.5*Math.tanh(score(x,contextModel,'ctx')/2));
  return value(b)-value(a)||priority(a,b)||compare(a,b);
 });
 const neutral=unrooted.slice().sort((a,b)=>
  sha('20261013|'+r.date+'|'+r.turn+'|'+a.family+'|control').localeCompare(
  sha('20261013|'+r.date+'|'+r.turn+'|'+b.family+'|control')));
 const withMix=(rootedSorted,rest,n)=>rootedSorted.slice(0,10-n)
  .concat(rest.slice(0,n)).concat(rootedSorted.slice(10-n)).slice(0,10)
  .map(p=>p.family);
 const out={
  OFICIAL:r.original,
  FORMA_RAIZ:geomRoot.slice(0,10).map(p=>p.family),
  CONTEXT_RAIZ:ctxRoot.slice(0,10).map(p=>p.family),
  CONSERVADOR_RAIZ:conservative.slice(0,10).map(p=>p.family),
  FORMA_FISICA:geomAll.slice(0,10).map(p=>p.family),
  MIX_9_1:withMix(ctxRoot,ctxUnroot,1),
  MIX_8_2:withMix(ctxRoot,ctxUnroot,2),
  NEUTRAL_9_1:withMix(rooted.slice().sort(priority),neutral,1),
  NEUTRAL_8_2:withMix(rooted.slice().sort(priority),neutral,2)
 };
 for(const method of METHODS){
  const v=out[method];assert.equal(v.length,10,'Top<10');
  assert.equal(new Set(v).size,10,'Familia repetida');
  assert.ok(v.every(f=>r.profiles.some(x=>x.family===f)),'Familia fuera de PRE');
 }
 return out;
}
function test(){
 const seal=verifySeal();
 const pre=parse(OUT+'PRE_115.json'),post=parse(ROOT+'POST_115.json').rows;
 assert.equal(pre.rows.length,115);assert.equal(post.length,115);
 const rows=pre.rows,weeks=pre.weeks;
 const goals=post.map((p,i)=>{
  assert.equal(key(p),key(rows[i]));
  assert.equal(p.targets.length,5);
  return new Set(p.targets.map(fam));
 });
 const actualHeads=post.map(p=>p.targets);
 const cuts=[],training=[],rounds=[];
 for(let wk=1;wk<weeks.length;wk++){
  const currentWeek=weeks[wk];
  const testIndices=rows.flatMap((r,i)=>r.week===currentWeek?[i]:[]);
  const lastIndices=rows.flatMap((r,i)=>r.week===weeks[wk-1]?[i]:[]);
  const cumIndices=rows.flatMap((r,i)=>pre.weeks.indexOf(r.week)<wk?[i]:[]);
  assert.ok(testIndices.length&&lastIndices.length&&cumIndices.length);
  for(const mode of MODES){
   const indices=mode==='SEMANA_ANTERIOR'?lastIndices:cumIndices;
   assert.ok(indices.every(i=>rows[i].week<currentWeek));
   assert.ok(indices.every(i=>!testIndices.includes(i)));
   const shape=train(indices.map(i=>rows[i]),indices.map(i=>goals[i]),'geo');
   const context=train(indices.map(i=>rows[i]),indices.map(i=>goals[i]),'ctx');
   const details={
    week:currentWeek,mode,
    sourceWeeks:uniq(indices.map(i=>rows[i].week)),
    trainCutIndices:indices,trainDateRange:[rows[indices[0]].date,rows[indices.at(-1)].date],
    testCutIndices:testIndices,
    trained:{geo:{positives:shape.positiveFamilyExposures,negatives:shape.negativeFamilyExposures,
      features:shape.tokenCount},ctx:{positives:context.positiveFamilyExposures,
      negatives:context.negativeFamilyExposures,features:context.tokenCount}},
    topPositiveGeom:[...shape.contributions].sort((a,b)=>b[1]-a[1]).slice(0,12),
    topNegativeGeom:[...shape.contributions].sort((a,b)=>a[1]-b[1]).slice(0,12)
   };
   training.push(details);
   for(const i of testIndices){
    const r=rows[i],tops=predict(r,shape,context);
    const physical=new Set(r.profiles.map(x=>x.family));
    const truth=goals[i];
    const possible=[...truth].filter(f=>physical.has(f));
    const unavailable=[...truth].filter(f=>!physical.has(f));
    assert.ok(possible.length<=5);
    assert.ok(possible.length<=10); // training oracle always can include all physically available
    const methodResults=Object.fromEntries(METHODS.map(m=>{
      const top=tops[m],winners=top.filter(f=>truth.has(f));
      return [m,{top,winners,top3:top.slice(0,3).some(f=>truth.has(f)),
       top5:top.slice(0,5).some(f=>truth.has(f)),
       top10:winners.length>0}];
    }));
    cuts.push({index:i,date:r.date,turn:r.turn,week:r.week,mode,
      trainLatestDate:rows[indices.at(-1)].date,targets:actualHeads[i],
      physicallyPossible:possible,physicallyUnavailable:unavailable,
      physicallyPossibleCount:possible.length,physicalFamilyCount:r.physicalCount,
      methodResults});
   }
   rounds.push(details);
  }
 }
 assert.equal(cuts.length,rows.filter(r=>r.week!==weeks[0]).length*2);
 const collect=(rs,m)=>{
  const hits=rs.filter(r=>r.methodResults[m].top10),ref=rs.filter(r=>r.methodResults.OFICIAL.top10);
  return {
   cuts:rs.length,top3:rs.filter(r=>r.methodResults[m].top3).length,
   top5:rs.filter(r=>r.methodResults[m].top5).length,top10:hits.length,
   winningFamilyExposures:rs.reduce((n,r)=>n+r.methodResults[m].winners.length,0),
   newHits:rs.filter(r=>r.methodResults[m].top10&&!r.methodResults.OFICIAL.top10).map(key),
   lostHits:rs.filter(r=>!r.methodResults[m].top10&&r.methodResults.OFICIAL.top10).map(key),
   sourcePhysicalCutCeiling:rs.filter(r=>r.physicallyPossibleCount>0).length,
   sourcePhysicalFamilyCeiling:rs.reduce((s,r)=>s+r.physicallyPossibleCount,0),
   physicallyUnavailableFamilyExposures:rs.reduce((s,r)=>s+r.physicallyUnavailable.length,0)};
 };
 const overall=Object.fromEntries(MODES.map(mode=>[mode,
  Object.fromEntries(METHODS.map(m=>[m,collect(cuts.filter(x=>x.mode===mode),m)]))]));
 const byWeek=Object.fromEntries(weeks.slice(1).map(week=>[week,
  Object.fromEntries(MODES.map(mode=>[mode,
   Object.fromEntries(METHODS.map(m=>[m,collect(cuts.filter(x=>x.week===week&&x.mode===mode),m)]))]))]));
 const byTurn=Object.fromEntries(TURNS.map(turn=>[turn,
  Object.fromEntries(MODES.map(mode=>[mode,
   Object.fromEntries(METHODS.map(m=>[m,collect(cuts.filter(x=>x.turn===turn&&x.mode===mode),m)]))]))]));
 const trainOracle=weeks.map(week=>{
  const ix=rows.flatMap((r,i)=>r.week===week?[i]:[]);
  return {week,cuts:ix.length,physicallyPossibleCutCount:ix.filter(i=>
    rows[i].profiles.some(x=>goals[i].has(x.family))).length,
   physicallyPossibleWinnerFamilies:ix.reduce((s,i)=>s+rows[i].profiles.filter(x=>goals[i].has(x.family)).length,0),
   physicallyMissingWinnerFamilies:ix.reduce((s,i)=>s+
    [...goals[i]].filter(x=>!rows[i].profiles.some(p=>p.family===x)).length,0)};
 });
 // Explicit null: same rooted ranks as original, but one or two physical unrooted
 // selected without any geometry labels; re-rank comparison is in matched TEST cuts.
 const comparisons=Object.fromEntries(MODES.map(mode=>{
  const rs=cuts.filter(c=>c.mode===mode);
  const diff=(a,b)=>{
   const gains=rs.filter(x=>x.methodResults[a].top10&&!x.methodResults[b].top10);
   const losses=rs.filter(x=>!x.methodResults[a].top10&&x.methodResults[b].top10);
   return {a,b,delta:gains.length-losses.length,
    gains:gains.map(key),losses:losses.map(key)};
  };
  return [mode,{
   contextVsOfficial:diff('CONTEXT_RAIZ','OFICIAL'),
   mix9VsNeutral:diff('MIX_9_1','NEUTRAL_9_1'),
   mix8VsNeutral:diff('MIX_8_2','NEUTRAL_8_2'),
   shapeVsOfficial:diff('FORMA_RAIZ','OFICIAL'),
   fullShapeVsOfficial:diff('FORMA_FISICA','OFICIAL')
  }];
 }));
 const report={date:'2026-10-13',experiment:'Aprendizaje semanal de rutas físicas',
  weeks,trainOracle,rounds,
  overall,byWeek,byTurn,comparisons,
  constraints:{nTrainingWeeksInitial:1,testWeeks:weeks.length-1,
    neverTrainUsingSameWeekResults:true,physicallyPossibleOnly:true,
    topCount:10,unit:'familia reversible por corte',
    samplesReused:true},
  seal,postHash:sha(read(ROOT+'POST_115.json')),
  warning:'Secuencia cronológica retrospectiva, sin fuga de semanas futuras durante entrenamiento. El conjunto de características proviene de un corpus previamente conocido; no es validación independiente ni prueba de anticipación del azar.'};
 save('POST_115.json',{rows:cuts});
 save('RESUMEN.json',report);
 console.log('VT3_APRENDIZAJE_POST_OK',JSON.stringify({
  oracle:trainOracle,
  overall:Object.fromEntries(MODES.map(mode=>[mode,Object.fromEntries(
   METHODS.map(m=>[m,{top3:overall[mode][m].top3,top5:overall[mode][m].top5,
    top10:overall[mode][m].top10,gains:overall[mode][m].newHits,
    losses:overall[mode][m].lostHits}]))])),
  byWeek:Object.fromEntries(Object.entries(byWeek).map(([wk,m])=>[wk,
   Object.fromEntries(MODES.map(mode=>[mode,
    Object.fromEntries(METHODS.map(method=>[method,m[mode][method].top10]))]))])),
  comparisons,rounds:rounds.map(x=>({week:x.week,mode:x.mode,priorWeeks:x.sourceWeeks,
   positives:x.trained.geo.positives,geoFeatures:x.trained.geo.features}))
 },null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')test();
else throw Error('Use pre|post');
