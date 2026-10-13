import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ROOT='auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/';
const HROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const FROZEN='auditorias/vt3-memoria-corta-online-90-13oct2026/';
const OUT='auditorias/vt3-voto-unico-geometrico-90-13oct2026/';
const DOC='PROTOCOLO_VT3_VOTO_UNICO_GEOMETRICO_13OCT2026.md';
const INPUT_SHA='42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e';
const METHODS=['ORIGINAL_STATIC','FIRMA_UNICA_STATIC','FORMA_UNICA_STATIC',
 'ORIGINAL_ONLINE','FIRMA_UNICA_ONLINE','FORMA_UNICA_ONLINE','NEG_FIRMA_UNICA_STATIC'];
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const read=f=>readFileSync(f,'utf8'),load=f=>JSON.parse(read(f));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(f,x)=>writeFileSync(OUT+f,JSON.stringify(x,null,2)+'\n');
const uniq=a=>[...new Set(a)];
const key=x=>x.date+'|'+x.turn;
const family=h=>{assert.match(h,/^\d{4}$/);const t=h.slice(-3);return[t,[...t].reverse().join('')].sort().join('/')};
const routeBucket=n=>n<=1?'1':n<=3?'2-3':n<=7?'4-7':'8+';
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const random=seed=>{let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}};
mkdirSync(OUT,{recursive:true});

function prepare(){
 assert.equal(sha(read(ROOT+'PRE_115.json')),INPUT_SHA);
 for(const file of [ROOT+'POST_115.json',HROOT+'POST_115.json',FROZEN+'POST_90.json'])
  assert.ok(!existsSync(file),'POST visible antes del sello: '+file);
 const d=load(ROOT+'PRE_115.json');assert.equal(d.rows.length,115);
 const rows=d.rows.flatMap((r,i)=>r.week===d.weeks[0]?[]:[{
  i,date:r.date,turn:r.turn,week:r.week,topOfficial:r.original,
  candidates:r.profiles.filter(p=>!r.original.includes(p.family)).map(p=>({
   family:p.family,rooted:p.rooted,originalRank:p.originalRank,
   paths:p.geo.abs.length,shapes:p.geo.shapes.length,bin:routeBucket(p.geo.abs.length)
  }))
 }]);
 assert.equal(rows.length,90);
 const dates=uniq(rows.map(x=>x.date));assert.equal(dates.length,18);
 for(const date of dates)assert.deepEqual(rows.filter(x=>x.date===date).map(x=>x.turn),TURNS);
 assert.ok(rows.every(x=>x.candidates.length>0));
 save('PRE_90.json',{weeks:d.weeks,rows,
  note:'Inventario físico y top oficial exclusivamente PRE. Ninguna etiqueta POST.'});
 save('CONTROL_PRE.json',{seed:20261013,n:2000,
  pseudorandom:'xorshift32, valor en [0,1), opción índice floor(u*pool.length)',
  allPhysical:true,matchedAdmissionAndBin:true,methods:METHODS});
 const seal={source:INPUT_SHA,
  code:sha(read('scripts/lab-vt3-voto-unico-geometrico.mjs')),
  protocol:sha(read(DOC)),pre:sha(read(OUT+'PRE_90.json')),
  control:sha(read(OUT+'CONTROL_PRE.json'))};
 save('SELLO.json',seal);
 console.log('VT3_VOTO_UNICO_PRE_OK',JSON.stringify({
  cuts:90,days:18,avgExternalCandidates:avg(rows.map(r=>r.candidates.length)),seal}));
}
function validate(){
 const x=load(OUT+'SELLO.json');
 for(const [file,hash] of [[ROOT+'PRE_115.json',x.source],
  ['scripts/lab-vt3-voto-unico-geometrico.mjs',x.code],
  [DOC,x.protocol],[OUT+'PRE_90.json',x.pre],[OUT+'CONTROL_PRE.json',x.control]])
  assert.equal(sha(read(file)),hash,'Sello alterado: '+file);
 return x;
}
function groups(bank,kind){
 const map=new Map();
 for(const ex of bank){
  const shapes=ex.geo.shapes;
  assert.ok(shapes?.length>0&&new Set(shapes).size===shapes.length);
  const items=kind==='ORIGINAL'?[{k:ex.i+'|'+ex.family,shapes}]:
   kind==='FIRMA_UNICA'?[{k:shapes.slice().sort().join('||'),shapes}]:
   shapes.map(s=>({k:s,shapes:[s]}));
  for(const item of items){
   if(!map.has(item.k))map.set(item.k,{signature:item.k,shapes:item.shapes,
    contributors:[]});
   map.get(item.k).contributors.push({i:ex.i,date:ex.date,turn:ex.turn,family:ex.family,
    sourcePaths:ex.geo.abs});
  }
 }
 return [...map.values()];
}
function jaccard(a,b){
 const set=new Set(b),overlap=a.filter(x=>set.has(x)).length;
 return a.length+b.length?overlap/(a.length+b.length-overlap):0;
}
function score(p,votes){
 const top=votes.map(group=>({group,sim:jaccard(p.geo.shapes,group.shapes)}))
  .sort((a,b)=>b.sim-a.sim||a.group.signature.localeCompare(b.group.signature)).slice(0,3);
 return {value:top.reduce((s,z)=>s+z.sim,0)/top.length,
  influential:top.map(z=>({
   signature:z.group.signature,similarity:Math.round(z.sim*1000000)/1000000,
   contributors:z.group.contributors.slice(0,12),
   contributingExampleCount:z.group.contributors.length,
   sharedShapes:z.group.shapes.filter(x=>p.geo.shapes.includes(x)),
   sameSourceExactPaths:z.group.contributors.flatMap(x=>
    x.sourcePaths.filter(path=>p.geo.abs.includes(path)))
  }))};
}
function selector(row,votes){
 assert.ok(votes.length);
 const outsiders=row.profiles.filter(p=>!row.original.includes(p.family));
 assert.ok(outsiders.length);
 const all=outsiders.map(p=>({p,s:score(p,votes)}));
 all.sort((a,b)=>Math.abs(b.s.value-a.s.value)>1e-10?b.s.value-a.s.value:
  Number(b.p.rooted)-Number(a.p.rooted)||
  (a.p.originalRank??9999)-(b.p.originalRank??9999)||
  a.p.family.localeCompare(b.p.family));
 const first=all[0],ties=all.filter(x=>Math.abs(x.s.value-first.s.value)<=1e-10);
 return {family:first.p.family,
  score:Math.round(first.s.value*1000000000)/1000000000,
  votes:votes.length,topEvidence:first.s.influential,
  topScoreTies:ties.length,rooted:first.p.rooted,routeCount:first.p.geo.abs.length,
  shapes:first.p.geo.shapes,paths:first.p.geo.abs,
  second:{family:all[1].p.family,score:Math.round(all[1].s.value*1000000000)/1000000000}
 };
}
function combine(original,third){
 assert.equal(original.length,10);assert.ok(!original.includes(third));
 return [...original.slice(0,2),third,...original.slice(2,9)];
}
function metrics(top,wins){
 return {top3:top.slice(0,3).some(f=>wins.has(f)),
  top5:top.slice(0,5).some(f=>wins.has(f)),
  top10:top.some(f=>wins.has(f)),selectedThirdWins:wins.has(top[2]),
  winningFamilies:top.filter(f=>wins.has(f))};
}
function positives(row,wins,i){
 return row.profiles.filter(p=>wins.has(p.family)).map(p=>({
  i,date:row.date,turn:row.turn,family:p.family,geo:p.geo
 }));
}
function negatives(row,wins,i,max){
 const list=row.profiles.filter(p=>!wins.has(p.family)).sort((a,b)=>
  sha(row.date+'|'+row.turn+'|'+a.family+'|control')
   .localeCompare(sha(row.date+'|'+row.turn+'|'+b.family+'|control')));
 return list.slice(0,Math.max(1,max)).map(p=>({
  i,date:row.date,turn:row.turn,family:p.family,geo:p.geo
 }));
}
function compute(rows,method,reference){
 const subset=rows.filter(Boolean);
 return {cuts:subset.length,top3:subset.filter(x=>x.results[method].top3).length,
  top5:subset.filter(x=>x.results[method].top5).length,
  top10:subset.filter(x=>x.results[method].top10).length,
  pickedWinner:subset.filter(x=>x.results[method].selectedThirdWins).length,
  newTop3:subset.filter(x=>x.results[method].top3&&!x.results[reference].top3).map(key),
  lostTop3:subset.filter(x=>!x.results[method].top3&&x.results[reference].top3).map(key),
  newTop10:subset.filter(x=>x.results[method].top10&&!x.results[reference].top10).map(key),
  lostTop10:subset.filter(x=>!x.results[method].top10&&x.results[reference].top10).map(key)
 };
}
function summ(rows,reference='OFICIAL'){
 return Object.fromEntries(['OFICIAL',...METHODS].map(m=>[m,compute(rows,m,reference)]));
}
function post(){
 const seal=validate(),p=load(OUT+'PRE_90.json'),base=load(ROOT+'PRE_115.json');
 const raw=load(HROOT+'POST_115.json').rows;
 const frozen=load(FROZEN+'POST_90.json').rows;
 assert.equal(raw.length,115);assert.equal(frozen.length,90);
 const byFrozen=new Map(frozen.map(x=>[key(x),x]));assert.equal(byFrozen.size,90);
 const truth=raw.map((r,i)=>{
  assert.equal(key(r),key(base.rows[i]));
  return new Set(r.targets.map(family));
 });
 const trials=[],weekMeta=[];
 for(let w=0;w<base.weeks.length-1;w++){
  const prev=base.weeks[w],curr=base.weeks[w+1];
  const ids=base.rows.flatMap((r,i)=>r.week===prev?[i]:[]);
  const future=base.rows.flatMap((r,i)=>r.week===curr?[i]:[]);
  assert.equal(future.length,30);
  const casebook=load(ROOT+'MEMORIA_SEMANA_'+prev+'.json').casebook;
  assert.equal(casebook.length,ids.length);
  const train=ids.map(i=>({i,row:base.rows[i],pos:positives(base.rows[i],truth[i],i)}));
  const bank=casebook.flatMap(entry=>entry.exemplars.map(q=>({
    i:ids.find(i=>base.rows[i].date===entry.date&&base.rows[i].turn===entry.turn),
    date:entry.date,turn:entry.turn,family:q.family,geo:q.geo
  })));
  assert.ok(bank.length);
  for(let k=0;k<ids.length;k++){
   assert.deepEqual([...casebook[k].observedPhysicalPositives].sort(),
    train[k].pos.map(z=>z.family).sort(),'Docencia física alterada');
  }
  const nbank=casebook.flatMap(entry=>entry.negativeExamples.map(q=>({
    i:ids.find(i=>base.rows[i].date===entry.date&&base.rows[i].turn===entry.turn),
    date:entry.date,turn:entry.turn,family:q.family,geo:q.geo
  })));
  assert.ok(nbank.length);
  const completed=[];
  const dates=uniq(future.map(i=>base.rows[i].date));
  assert.equal(dates.length,6);
  let originalSig='',before=0;
  for(const i of future){
   const row=base.rows[i],snapshot=byFrozen.get(key(row));
   assert.ok(snapshot);
   const positivesSoFar=completed.flatMap(z=>z.positive);
   const online=[...bank,...positivesSoFar];
   assert.ok(online.every(x=>x.i<i));
   const voteBanks={
    ORIGINAL_STATIC:groups(bank,'ORIGINAL'),
    FIRMA_UNICA_STATIC:groups(bank,'FIRMA_UNICA'),
    FORMA_UNICA_STATIC:groups(bank,'FORMA_UNICA'),
    ORIGINAL_ONLINE:groups(online,'ORIGINAL'),
    FIRMA_UNICA_ONLINE:groups(online,'FIRMA_UNICA'),
    FORMA_UNICA_ONLINE:groups(online,'FORMA_UNICA'),
    NEG_FIRMA_UNICA_STATIC:groups(nbank,'FIRMA_UNICA')
   };
   const proposals=Object.fromEntries(METHODS.map(m=>[m,selector(row,voteBanks[m])]));
   const built=Object.fromEntries(METHODS.map(m=>[m,combine(row.original,proposals[m].family)]));
   assert.deepEqual(row.original,snapshot.methods.OFICIAL.top);
   assert.deepEqual(built.ORIGINAL_STATIC,snapshot.methods.ESTATICA_SEMANA_X.top,
    'El original fijo cambió después del sellado');
   assert.deepEqual(built.ORIGINAL_ONLINE,snapshot.methods.ONLINE_ACUMULATIVA.top,
    'El original online cambió después del sellado');
   assert.equal(key(row),key(p.rows[trials.length]));
   assert.ok(METHODS.every(m=>built[m].every(f=>row.profiles.some(q=>q.family===f))));
   // CURRENT OUTCOME BELOW: every policy has been constructed from strictly prior examples.
   const wins=truth[i];
   const results={OFICIAL:metrics(row.original,wins),
    ...Object.fromEntries(METHODS.map(m=>[m,metrics(built[m],wins)]))};
   const history={currentWeekPositiveExemplars:positivesSoFar.length,
    currentWeekKnownCutCount:completed.length,
    trainingPositiveExamples:bank.length,
    originalStaticVotes:voteBanks.ORIGINAL_STATIC.length,
    signatureStaticVotes:voteBanks.FIRMA_UNICA_STATIC.length,
    shapeStaticVotes:voteBanks.FORMA_UNICA_STATIC.length,
    originalOnlineVotes:voteBanks.ORIGINAL_ONLINE.length,
    signatureOnlineVotes:voteBanks.FIRMA_UNICA_ONLINE.length,
    shapeOnlineVotes:voteBanks.FORMA_UNICA_ONLINE.length,
    signatureRedundancy:online.length-voteBanks.FIRMA_UNICA_ONLINE.length,
    shapeRedundancy:online.reduce((s,x)=>s+x.geo.shapes.length,0)-voteBanks.FORMA_UNICA_ONLINE.length};
   const rec={i,date:row.date,turn:row.turn,week:curr,trainWeek:prev,
    dayRank:dates.indexOf(row.date)+1,physicallyPossible:row.profiles.filter(q=>wins.has(q.family)).map(q=>q.family),
    results,proposals,history,
    deltaFromStatic:Object.fromEntries(METHODS.map(m=>[m,
     proposals[m].family!==proposals.ORIGINAL_STATIC.family]))};
   trials.push(rec);
   completed.push({i,date:row.date,turn:row.turn,
    positive:positives(row,wins,i),negative:negatives(row,wins,i,positives(row,wins,i).length)});
  }
  weekMeta.push({trainWeek:prev,testWeek:curr,trainCases:ids.length,examCases:future.length,
   teacherPositiveExposures:bank.length,originalNegativeCount:nbank.length});
 }
 assert.equal(trials.length,90);
 const baseline=summ(trials);
 assert.deepEqual([baseline.OFICIAL.top3,baseline.OFICIAL.top5,baseline.OFICIAL.top10],[3,6,11]);
 assert.deepEqual([baseline.ORIGINAL_STATIC.top3,baseline.ORIGINAL_STATIC.top5,baseline.ORIGINAL_STATIC.top10],[4,5,12]);
 assert.deepEqual([baseline.ORIGINAL_ONLINE.top3,baseline.ORIGINAL_ONLINE.top5,baseline.ORIGINAL_ONLINE.top10],[4,5,12]);
 const modes=METHODS.map(m=>({
  mode:m,thirdChangesVsOwnOriginal:trials.filter(r=>
   r.proposals[m].family!==r.proposals[m.includes('ONLINE')?'ORIGINAL_ONLINE':'ORIGINAL_STATIC'].family).length,
  thirdChangesVsStatic:trials.filter(r=>r.deltaFromStatic[m]).length,
  matchOwnOriginalTop3:trials.filter(r=>
    r.proposals[m].family===r.proposals[m.includes('ONLINE')?'ORIGINAL_ONLINE':'ORIGINAL_STATIC'].family).length,
  averageTopScoreTie:avg(trials.map(r=>r.proposals[m].topScoreTies)),
  averageVotes:avg(trials.map(r=>r.proposals[m].votes)),
  uniqueThirdFamilies:uniq(trials.map(r=>r.proposals[m].family)).length
 }));
 const weeks=Object.fromEntries(uniq(trials.map(r=>r.week)).map(w=>
  [w,summ(trials.filter(r=>r.week===w))]));
 const byDay=Object.fromEntries([1,2,3,4,5,6].map(day=>
  ['dia_'+day,summ(trials.filter(r=>r.dayRank===day))]));
 const windows=Object.fromEntries([1,2,3].map(day=>
  ['primeros_'+day,summ(trials.filter(r=>r.dayRank<=day))]));
 const later=summ(trials.filter(r=>r.dayRank>3));
 const byTurn=Object.fromEntries(TURNS.map(t=>
  [t,summ(trials.filter(r=>r.turn===t))]));
 const discordant=trials.filter(r=>METHODS.some(m=>r.proposals[m].family!==r.proposals.ORIGINAL_STATIC.family));
 const examples=discordant.map(r=>({
  date:r.date,turn:r.turn,week:r.week,
  possible:r.physicallyPossible,
  modeResults:Object.fromEntries(METHODS.map(m=>[m,{
   third:r.proposals[m].family,winner:r.results[m].selectedThirdWins,
   matchedShapes:r.proposals[m].topEvidence.flatMap(x=>x.sharedShapes),
   voteSignatures:r.proposals[m].topEvidence.map(x=>({
    signature:x.signature,shared:x.sharedShapes,score:x.similarity,
    examples:x.contributingExampleCount,firstExemplar:x.contributors[0]
   }))
  }]))
 }));
 const ctrl=load(OUT+'CONTROL_PRE.json');
 const seed=random(ctrl.seed);
 const sums={};
 for(const mode of ['FIRMA_UNICA_STATIC','FORMA_UNICA_STATIC','FIRMA_UNICA_ONLINE','FORMA_UNICA_ONLINE']){
  const observed=baseline[mode],statsAll=[],statsMatched=[];
  const indices=trials.map(r=>{
   const p=r.proposals[mode],prof=base.rows[r.i].profiles.find(x=>x.family===p.family);
   const opts=base.rows[r.i].profiles.filter(x=>!base.rows[r.i].original.includes(x.family));
   const match=opts.filter(x=>x.rooted===prof.rooted&&routeBucket(x.geo.abs.length)===routeBucket(prof.geo.abs.length));
   assert.ok(match.length);
   return {options:opts,matched:match,original:base.rows[r.i].original,win:truth[r.i]};
  });
  for(let sim=0;sim<ctrl.n;sim++){
   let a3=0,a5=0,a10=0,b3=0,b5=0,b10=0;
   for(const cut of indices){
    const a=cut.options[Math.floor(seed()*cut.options.length)];
    const b=cut.matched[Math.floor(seed()*cut.matched.length)];
    const aR=metrics(combine(cut.original,a.family),cut.win);
    const bR=metrics(combine(cut.original,b.family),cut.win);
    a3+=Number(aR.top3);a5+=Number(aR.top5);a10+=Number(aR.top10);
    b3+=Number(bR.top3);b5+=Number(bR.top5);b10+=Number(bR.top10);
   }
   statsAll.push([a3,a5,a10]);statsMatched.push([b3,b5,b10]);
  }
  function calc(arr){
   const x=Object.fromEntries(['top3','top5','top10'].map((name,i)=>{
    const vals=arr.map(v=>v[i]).sort((a,b)=>a-b);
    return [name,{mean:Number(avg(vals).toFixed(4)),observed:observed[name],
     min:vals[0],p05:vals[99],median:vals[999],p95:vals[1899],max:vals.at(-1),
     fractionAtLeastObserved:vals.filter(v=>v>=observed[name]).length/ctrl.n}];
   }));
   return x;
  }
  sums[mode]={all:calc(statsAll),matched:calc(statsMatched)};
 }
 const changes=Object.fromEntries(METHODS.map(m=>{
  const original=m.includes('ONLINE')?'ORIGINAL_ONLINE':'ORIGINAL_STATIC';
  const all=trials.filter(x=>x.proposals[m].family!==x.proposals[original].family);
  return [m,{changed:all.length,
   gainedTop3:all.filter(x=>x.results[m].top3&&!x.results[original].top3).map(key),
   lostTop3:all.filter(x=>!x.results[m].top3&&x.results[original].top3).map(key),
   gainedTop10:all.filter(x=>x.results[m].top10&&!x.results[original].top10).map(key),
   lostTop10:all.filter(x=>!x.results[m].top10&&x.results[original].top10).map(key),
   selectingWinner:all.filter(x=>x.results[m].selectedThirdWins).map(key),
   winnerDiscarded:all.filter(x=>x.results[original].selectedThirdWins&&!x.results[m].selectedThirdWins).map(key)
  }];
 }));
 save('POST_90.json',{rows:trials});
 save('RESUMEN.json',{date:'2026-10-13',cuts:90,weekMeta,baseline,modes,
  weeks,byDay,windows,later,byTurn,changes,neutralControls:sums,
  changedCases:examples,seal,
  headsHash:sha(read(HROOT+'POST_115.json')),
  frozenOriginalSelectionsHash:sha(read(FROZEN+'POST_90.json')),
  caveat:'Todas las propuestas se construyen con resultados anteriores al corte objetivo; las selecciones ORIGINALES se verificaron contra su sello previo. Estas pruebas reutilizan 23 fechas ya muy exploradas. No prueban predictibilidad de sorteos aleatorios.'});
 console.log('VT3_VOTO_UNICO_POST_OK',JSON.stringify({
  results:Object.fromEntries(['OFICIAL',...METHODS].map(m=>[m,{
   top3:baseline[m].top3,top5:baseline[m].top5,top10:baseline[m].top10,
   gains:baseline[m].newTop3,losses:baseline[m].lostTop3
  }])),
  modes,changes,windows:Object.fromEntries(Object.entries(windows).map(([period,x])=>[
   period,Object.fromEntries(['OFICIAL',...METHODS].map(m=>[m,{
    top3:x[m].top3,top10:x[m].top10
   }]))])),
  neutral:Object.fromEntries(Object.entries(sums).map(([m,p])=>[m,{
   all:p.all.top3,matched:p.matched.top3
  }]))
 },null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')post();
else throw Error('Usar pre|post');
