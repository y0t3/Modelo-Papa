import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-atlas-cuatro-dimensiones-115-14oct2026/';
const PROTOCOL='PROTOCOLO_VT3_ATLAS_CUATRO_DIMENSIONES_14OCT2026.md';
const SELF='scripts/lab-vt3-atlas-cuatro-dimensiones.mjs';
const SOURCE_SHA='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const FLAGS=['A','B','C','D'];
const POLICIES=['OFICIAL','ATLAS_P3','ATLAS_P10_ABIERTO','HASH_P3','HASH_P10_ABIERTO'];
const text=p=>readFileSync(p,'utf8');
const json=p=>JSON.parse(text(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(p,obj)=>writeFileSync(OUT+p,JSON.stringify(obj,null,2)+'\n');
const key=x=>x.date+'|'+x.turn;
const family=v=>[v,[...v].reverse().join('')].sort().join('/');
const cutDateMinus7=d=>new Date(Date.parse(d+'T00:00:00Z')-7*86400000).toISOString().slice(0,10);
const rowIdx=f=>TURNS.indexOf(f);
const cell=c=>{const x=c.split(':').map(Number);assert.equal(x.length,2);
 assert.ok(x[0]>=0&&x[0]<6&&x[1]>=0&&x[1]<2);return x;};
const at=(xy)=>xy[0]+':'+xy[1];
const block=p=>p.cells.slice().sort().join(',');
const orientation=p=>[p.cells.join('>'),[...p.cells].reverse().join('>')].sort()[0];
function signature(cells){
 const points=cells.map(cell);
 const steps=q=>q.slice(1).map(([r,c],i)=>(r-q[i][0])+','+(c-q[i][1])).join(';');
 return [steps(points),steps([...points].reverse())].sort()[0];
}
const position=cells=>{
 const points=cells.map(cell);
 return {row:Math.min(...points.map(p=>p[0])),col:Math.min(...points.map(p=>p[1]))};
};
function validateEvent(p,r,f){
 assert.ok(SOURCES.includes(p.source));
 assert.ok(SOURCES.indexOf(p.source)<=rowIdx(r.turn));
 assert.equal(family(p.value),f);
 assert.equal(p.value.length,3);assert.equal(p.cells.length,3);
 assert.equal(new Set(p.cells).size,3);
 for(let i=1;i<3;i++){
  const a=cell(p.cells[i-1]),b=cell(p.cells[i]);
  assert.equal(Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])),1);
 }
 for(const c of p.cells)cell(c);
 if(!p.anchored)assert.equal(p.rootIds.length,0);
}
function makeFrame(r){
 const official=r.strategies.A_ORIGINAL;
 assert.ok(official.length>=10);
 const anchored=new Map(official.map(x=>[x.family,x]));
 const bag=new Map(r.strategies.B_INVENTARIO.map(x=>[x.family,x]));
 const physical=new Map();const events=[];
 for(const witness of r.witnesses){
  assert.ok(!physical.has(witness.family));
  const seen=new Set();
  for(const p of witness.paths){
   validateEvent(p,r,witness.family);
   const id=p.source+'|'+orientation(p);
   assert.ok(!seen.has(id),'Ruta invertida duplicada '+key(r)+' '+id);
   seen.add(id);
   const event={family:witness.family,value:p.value,source:p.source,cells:p.cells,
    shape:signature(p.cells),pos:position(p.cells),block:block(p),
    anchored:Boolean(p.anchored),rootIds:[...new Set(p.rootIds)].sort()};
   events.push(event);
  }
  physical.set(witness.family,witness.paths.length);
 }
 assert.equal(physical.size,bag.size);
 assert.ok([...physical.keys()].every(f=>bag.has(f)));
 assert.ok([...anchored.keys()].every(f=>bag.has(f)));
 return {date:r.date,turn:r.turn,events,official:official.map(x=>({
  family:x.family,rank:x.rank,d1:x.d1||0,d7:x.d7||0
 })),inventory:r.strategies.B_INVENTARIO.map(x=>({
  family:x.family,sources:x.sources,blocks:x.blocks
 }))};
}
function groupEvents(events,extractor){
 const out=new Map();
 for(const e of events){
  const k=extractor(e);
  if(!out.has(k))out.set(k,[]);
  out.get(k).push(e);
 }
 return out;
}
const samePlace=(a,b)=>a.pos.row===b.pos.row&&a.pos.col===b.pos.col;
const sameNumeric=(a,b)=>a.family===b.family;
const sameCells=(a,b)=>a.block===b.block;
const overlap=(a,b)=>a.cells.filter(c=>b.cells.includes(c)).length;

function describe(current,old,week){
 const byFam=groupEvents(current.events,e=>e.family);
 const oldShape=groupEvents(old?.events||[],e=>e.source+'|'+e.shape);
 const oldFamilySource=groupEvents(old?.events||[],e=>e.family+'|'+e.source);
 const weekShape=groupEvents(week?.events||[],e=>e.source+'|'+e.shape);
 const weekFamily=new Set((week?.events||[]).map(e=>e.family));
 const oldFamily=new Set((old?.events||[]).map(e=>e.family));
 const ranks=new Map(current.official.map(x=>[x.family,x]));
 const profiles=current.inventory.map(({family:f,sources,blocks})=>{
  const events=byFam.get(f)||[];
  assert.ok(events.length>0);
  const own=ranks.get(f);
  const A=new Set(),C=new Set(),D=new Set();
  let exactPrevious=false,sameFamilyShift=false,sameShapeAcrossSources=false,weekSameNumeric=false;
  for(const e of events){
   const oldShapePeers=oldShape.get(e.source+'|'+e.shape)||[];
   if(oldShapePeers.some(p=>sameNumeric(p,e)&&sameCells(p,e)))exactPrevious=true;
   if(oldShapePeers.some(p=>sameNumeric(p,e)&&!samePlace(p,e)))sameFamilyShift=true;
   if(oldShapePeers.some(p=>!sameNumeric(p,e)&&!samePlace(p,e)))
    A.add(e.source+'|'+e.block);
   if((weekShape.get(e.source+'|'+e.shape)||[]).some(p=>!sameNumeric(p,e)))
    C.add(e.source+'|'+e.block);
   if((weekShape.get(e.source+'|'+e.shape)||[]).some(p=>sameNumeric(p,e)))
    weekSameNumeric=true;
   if((oldFamilySource.get(e.family+'|'+e.source)||[]).some(p=>overlap(p,e)===2&&p.shape!==e.shape))
    D.add(e.source+'|'+e.block);
  }
  const shapes=groupEvents(events,e=>e.shape);
  for(const sameShape of shapes.values()){
   if(new Set(sameShape.map(e=>e.source)).size>=2)sameShapeAcrossSources=true;
  }
  const flags={A:A.size>0,B:sameShapeAcrossSources,C:C.size>0,D:D.size>0};
  const score=FLAGS.reduce((s,k)=>s+Number(flags[k]),0);
  return {family:f,anchored:Boolean(own),officialRank:own?.rank??null,
   palindrome:f.split('/')[0]===f.split('/')[1],
   sources,blocks,paths:events.length,d1:own?.d1??0,d7:own?.d7??0,
   flags,score,eventsA:A.size,eventsC:C.size,eventsD:D.size,
   previousPhysicalFamily:oldFamily.has(f),weekPhysicalFamily:weekFamily.has(f),
   sameNumericSameBlockPrevious:exactPrevious,
   sameNumericSameShapeShiftedPrevious:sameFamilyShift,
   sameNumericSameShapeD7:weekSameNumeric};
 });
 const official=current.official.slice(0,10).map(x=>x.family);
 assert.equal(new Set(official).size,10);
 const map=new Map(profiles.map(p=>[p.family,p]));
 const thirdCandidates=official.slice(2,10).map(f=>map.get(f));
 assert.ok(thirdCandidates.every(Boolean));
 const replacementCandidates=profiles.filter(p=>!p.anchored&&p.score>=1)
  .sort((a,b)=>b.score-a.score||b.sources-a.sources||b.blocks-a.blocks||a.family.localeCompare(b.family));
 const hashRank=(purpose,f)=>sha('ATLAS_ABCD_V1|'+purpose+'|'+current.date+'|'+current.turn+'|'+f);
 const thirdBest=thirdCandidates.slice().sort((a,b)=>b.score-a.score||a.officialRank-b.officialRank)[0];
 const thirdNeutral=thirdCandidates.slice().sort((a,b)=>hashRank('P3',a.family).localeCompare(hashRank('P3',b.family)))[0];
 const replaceBest=replacementCandidates[0]||null;
 const replaceNeutral=replacementCandidates.slice().sort((a,b)=>hashRank('P10',a.family).localeCompare(hashRank('P10',b.family)))[0]||null;
 const thirdList=(p)=>official.slice(0,2).concat(p.family,official.slice(2).filter(f=>f!==p.family));
 const ranking={
  OFICIAL:official,
  ATLAS_P3:thirdList(thirdBest),
  ATLAS_P10_ABIERTO:replaceBest?official.slice(0,9).concat(replaceBest.family):official,
  HASH_P3:thirdList(thirdNeutral),
  HASH_P10_ABIERTO:replaceNeutral?official.slice(0,9).concat(replaceNeutral.family):official
 };
 for(const p of POLICIES){
  assert.equal(ranking[p].length,10);
  assert.equal(new Set(ranking[p]).size,10);
 }
 assert.deepEqual(new Set(ranking.ATLAS_P3),new Set(official));
 assert.deepEqual(new Set(ranking.HASH_P3),new Set(official));
 assert.deepEqual(ranking.ATLAS_P10_ABIERTO.slice(0,9),official.slice(0,9));
 return {date:current.date,turn:current.turn,previousDate:old?.date??null,
  weekDate:week?.date??null,profiles,ranking,
  eligibility:{third:thirdCandidates.map(p=>p.family),
   tenth:replacementCandidates.map(p=>p.family)},
  decisions:{third:thirdBest.family,open10:replaceBest?.family??null}};
}
function pre(){
 assert.ok(!existsSync(ROOT+'POST_115.json'),'Prohibido POST en PRE');
 assert.ok(!existsSync(ROOT+'NOCTURNA_POST_DIAGNOSTICO.json'),'Prohibido POST nocturno en PRE');
 assert.equal(sha(text(ROOT+'PRE_115.json')),SOURCE_SHA);
 const r=json(ROOT+'PRE_115.json').rows;
 assert.equal(r.length,115);
 const dates=[...new Set(r.map(x=>x.date))].sort();
 assert.equal(dates.length,23);
 const frames=r.map(makeFrame),index=new Map(frames.map(f=>[key(f),f]));
 assert.equal(index.size,115);
 let events=0,anchoredEvents=0,strictlyPrior=0;
 const rows=frames.map((f,i)=>{
  const di=dates.indexOf(f.date);
  const old=di>0?index.get(dates[di-1]+'|'+f.turn):null;
  const week=index.get(cutDateMinus7(f.date)+'|'+f.turn)||null;
  if(old)assert.ok(old.date<f.date);
  if(week)assert.ok(week.date<f.date);
  events+=f.events.length;
  anchoredEvents+=f.events.filter(e=>e.anchored).length;
  strictlyPrior+=Number(Boolean(old));
  return describe(f,old,week);
 });
 assert.equal(rows.length,115);
 const routeFrames=frames.map(f=>({date:f.date,turn:f.turn,events:f.events}));
 save('EVENTOS_PRE_115.json',{dates,rows:routeFrames,info:'Todos los recorridos físicos, sin cabezas objetivo.'});
 save('PRE_115.json',{dates,rows,policies:POLICIES,features:FLAGS,
  readme:'RETROSPECTIVO: ningún POST objetivo se leyó para generar rutas, señales ni rankings.'});
 const seal={sourcePre:SOURCE_SHA,protocol:sha(text(PROTOCOL)),code:sha(text(SELF)),
  routesPre:sha(text(OUT+'EVENTOS_PRE_115.json')),pre:sha(text(OUT+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('ATLAS_4D_PRE_OK',JSON.stringify({days:dates.length,cuts:rows.length,
  events,anchoredEvents,comparisonsPrevious:strictlyPrior,
  profiles:rows.reduce((s,r)=>s+r.profiles.length,0),seal}));
}
function prng(seed){
 let x=seed>>>0;
 return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296};
}
const outcome=(top,wins)=>({
 top3:top.slice(0,3).some(x=>wins.has(x)),
 top5:top.slice(0,5).some(x=>wins.has(x)),
 top10:top.some(x=>wins.has(x)),
 hits:top.filter(x=>wins.has(x))
});
function post(){
 const seal=json(OUT+'SELLO.json');
 assert.equal(seal.sourcePre,sha(text(ROOT+'PRE_115.json')));
 assert.equal(seal.protocol,sha(text(PROTOCOL)));
 assert.equal(seal.code,sha(text(SELF)));
 assert.equal(seal.routesPre,sha(text(OUT+'EVENTOS_PRE_115.json')));
 assert.equal(seal.pre,sha(text(OUT+'PRE_115.json')));
 const preRows=json(OUT+'PRE_115.json').rows,postRows=json(ROOT+'POST_115.json').rows;
 assert.equal(preRows.length,115);assert.equal(postRows.length,115);
 const status={};
 for(const k of FLAGS.concat('ANY','TWO_PLUS')){
  status[k]={exposures:0,winners:0,anchoredExposures:0,anchoredWinners:0};
 }
 const matched=Object.fromEntries(Object.keys(status).map(k=>[k,{observed:0,expected:0,mixedBins:0,
  excludedWinningRecords:0}]));
 const joint={};
 const comparisons=[],cutRows=[];
 for(let i=0;i<115;i++){
  const r=preRows[i],p=postRows[i];assert.equal(key(r),key(p));
  assert.equal(p.targets.length,5);
  const wins=new Set(p.targets.map(h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3))}));
  const flagsMap=new Map(r.profiles.map(f=>[f.family,f]));
  const bins=new Map();
  for(const f of r.profiles){
   const won=wins.has(f.family);
   const k=FLAGS.map(c=>Number(f.flags[c])).join('');
   if(!joint[k])joint[k]={exposures:0,winners:0};
   joint[k].exposures++;joint[k].winners+=Number(won);
   const each={...f.flags,ANY:f.score>=1,TWO_PLUS:f.score>=2};
   for(const [name,yes] of Object.entries(each))if(yes){
    const x=status[name];x.exposures++;x.winners+=Number(won);
    x.anchoredExposures+=Number(f.anchored);
    x.anchoredWinners+=Number(f.anchored&&won);
   }
   const type=f.d1&&f.d7?'both':f.d1?'d1':f.d7?'d7':'none';
   const bin=[Number(f.anchored),Number(f.palindrome),Math.min(2,f.sources),
    Math.min(3,f.blocks),type].join('|');
   if(!bins.has(bin))bins.set(bin,[]);
   bins.get(bin).push(f);
  }
  for(const group of bins.values()){
   const positive=group.filter(f=>wins.has(f.family));
   if(!positive.length)continue;
   for(const name of Object.keys(status)){
    const yes=f=>name==='ANY'?f.score>=1:name==='TWO_PLUS'?f.score>=2:f.flags[name];
    const freq=group.filter(yes).length;
    if(group.length<2||freq===0||freq===group.length){
     matched[name].excludedWinningRecords+=positive.length;continue;
    }
    matched[name].mixedBins++;
    matched[name].observed+=positive.filter(yes).length;
    matched[name].expected+=positive.length*freq/group.length;
   }
  }
  const scores=Object.fromEntries(POLICIES.map(policy=>[policy,outcome(r.ranking[policy],wins)]));
  cutRows.push({date:r.date,turn:r.turn,targets:p.targets,
   winningPhysicalFamilies:r.profiles.filter(f=>wins.has(f.family)).map(f=>({family:f.family,
    officialRank:f.officialRank,anchored:f.anchored,score:f.score,flags:f.flags})),
   eligibility:{third:r.eligibility.third.length,tenth:r.eligibility.tenth.length},
   outcomes:scores});
  if(scores.ATLAS_P3.top3!==scores.OFICIAL.top3||
   scores.ATLAS_P10_ABIERTO.top10!==scores.OFICIAL.top10)
   comparisons.push({date:r.date,turn:r.turn,wins:[...wins],
    choices:r.decisions,eligibility:r.eligibility.tenth.length,
    official:scores.OFICIAL,atlas3:scores.ATLAS_P3,atlas10:scores.ATLAS_P10_ABIERTO});
 }
 const stats=Object.fromEntries(POLICIES.map(k=>[k,{
  top3:cutRows.filter(x=>x.outcomes[k].top3).length,
  top5:cutRows.filter(x=>x.outcomes[k].top5).length,
  top10:cutRows.filter(x=>x.outcomes[k].top10).length,
  gains:cutRows.filter(x=>x.outcomes[k].top10&&!x.outcomes.OFICIAL.top10).map(key),
  losses:cutRows.filter(x=>!x.outcomes[k].top10&&x.outcomes.OFICIAL.top10).map(key)
 }]));
 assert.deepEqual([stats.OFICIAL.top3,stats.OFICIAL.top5,stats.OFICIAL.top10],[5,8,15]);
 let rand=prng(20261014),nullThird=[],nullTenth=[];
 const select=(arr)=>arr[Math.floor(rand()*arr.length)];
 for(let t=0;t<2000;t++){
  let n3=0,n10=0;
  for(let i=0;i<preRows.length;i++){
   const r=preRows[i];
   const wins=new Set(postRows[i].targets.map(h=>family(h.slice(-3))));
   const third=select(r.eligibility.third);
   const tenth=r.eligibility.tenth.length?select(r.eligibility.tenth):r.ranking.OFICIAL[9];
   n3+=Number(r.ranking.OFICIAL.slice(0,2).some(f=>wins.has(f))||wins.has(third));
   n10+=Number(r.ranking.OFICIAL.slice(0,9).some(f=>wins.has(f))||wins.has(tenth));
  }
  nullThird.push(n3);nullTenth.push(n10);
 }
 const neutral=(nums,observed)=>{const a=nums.slice().sort((a,b)=>a-b),mean=nums.reduce((s,v)=>s+v,0)/nums.length;
  return {controls:nums.length,mean:Number(mean.toFixed(4)),p05:a[99],median:a[999],
   p95:a[1899],max:a.at(-1),observed,upperTail:(nums.filter(v=>v>=observed).length+1)/(nums.length+1)};
 };
 const matchedOut=Object.fromEntries(Object.entries(matched).map(([k,v])=>
  [k,{...v,expected:Number(v.expected.toFixed(4)),
   excess:Number((v.observed-v.expected).toFixed(4))}]));
 const result={
  scope:'Retrospectivo exploratorio, reutiliza 115 cortes; NO representa validación futura',
  days:23,cuts:115,physicalEventCount:json(OUT+'EVENTOS_PRE_115.json').rows.reduce((s,r)=>s+r.events.length,0),
  familyCutRecords:preRows.reduce((s,r)=>s+r.profiles.length,0),
  signalStats:status,jointSignatures:joint,matched:matchedOut,scorecard:stats,
  nullComparisons:{third:neutral(nullThird,stats.ATLAS_P3.top3),
   tenth:neutral(nullTenth,stats.ATLAS_P10_ABIERTO.top10)},
  opportunity:{cutsWithOpenTenth:preRows.filter(r=>r.eligibility.tenth.length>0).length,
   totalOpenTenthCandidates:preRows.reduce((s,r)=>s+r.eligibility.tenth.length,0),
   averageOpenTenth:preRows.reduce((s,r)=>s+r.eligibility.tenth.length,0)/115,
   cutsWhereSelectedThirdChanges:preRows.filter(r=>r.decisions.third!==r.ranking.OFICIAL[2]).length},
  meaningfulDifferences:comparisons,
  seal,sourcePost:sha(text(ROOT+'POST_115.json')),
  caveats:[
   'Las firmas A/C son continuidad GEOMÉTRICA PRE, no huellas premiadas: gana una familia nueva por relectura del tablero.',
   'La misma forma se replica por estructura limitada 6x2; altas tasas de exposición pueden generar asociaciones casuales.',
   'La familia reversible, no la ruta, es la unidad de acierto por corte; una cabeza puede coincidir con varias familias por jurisdicción.',
   'El #10 original no acertó en estos 115 cortes; reemplazarlo está sesgado por conocimiento anterior del histórico.',
   'El selector multidimensional se eligió tras muchas hipótesis anteriores en las mismas 23 jornadas; valores de cola exploratorios, NO p-valores confirmatorios.',
   'Sin modificar motores oficiales, ni VT4, ni la predicción prospectiva ya sellada.'
  ]};
 save('POST_115.json',{rows:cutRows});
 save('RESUMEN.json',result);
 console.log('ATLAS_4D_POST_OK',JSON.stringify({
  cuts:result.cuts,events:result.physicalEventCount,families:result.familyCutRecords,
  signals:result.signalStats,matched:result.matched,
  scorecard:result.scorecard,null:result.nullComparisons,
  opportunity:result.opportunity,changedCases:comparisons.slice(0,12)},null,2));
}
if(process.argv[2]==='pre'){mkdirSync(OUT,{recursive:true});pre();}
else if(process.argv[2]==='post'){mkdirSync(OUT,{recursive:true});post();}
else throw Error('Modo requerido pre|post');
