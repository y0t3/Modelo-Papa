import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const INPUT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const ORIGINAL='auditorias/vt3-control-tercer-puesto-90-13oct2026/';
const EARLIER='auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/';
const OUT='auditorias/vt3-inercia-tercero-90-13oct2026/';
const DOC='PROTOCOLO_VT3_INERCIA_TERCERO_13OCT2026.md';
const SHA_PHYSICAL='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const SHA_OUTSIDERS='5f506c1cde4988105da3bb7d1914379f9ebd5a3f8c68770b93022f1625bdacf0';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const METHODS=['APRENDIDO','RANGO11','HASH_FIJO','RECUENTO_RUTAS'];
const N=5000,SEED=20261013;
const read=p=>readFileSync(p,'utf8'),load=p=>JSON.parse(read(p));
const sha=x=>createHash('sha256').update(x).digest('hex');
const save=(f,x)=>writeFileSync(OUT+f,JSON.stringify(x,null,2)+'\n');
const id=r=>r.date+'|'+r.turn;
const unique=arr=>[...new Set(arr)];
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const bucket=n=>n<=1?'1':n<=3?'2-3':n<=7?'4-7':'8+';
const setsDiff=(a,b)=>a.filter(x=>!new Set(b).has(x));
function rand(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;}}
function canonical(cells){
 assert.equal(cells.length,3);assert.equal(new Set(cells).size,3);
 const pts=cells.map(x=>x.split(':').map(Number));
 for(const [r,c] of pts)assert.ok(Number.isInteger(r)&&r>=0&&r<=5&&Number.isInteger(c)&&c>=0&&c<=1);
 for(let i=1;i<3;i++)assert.equal(Math.max(Math.abs(pts[i][0]-pts[i-1][0]),Math.abs(pts[i][1]-pts[i-1][1])),1,'ruta no vecina');
 return [cells.join('>'),cells.slice().reverse().join('>')].sort()[0];
}
function rootEvent(id){
 const f=id.split('|');
 assert.equal(f.length,8,'Identificador raíz con estructura inesperada');
 assert.match(f[0],/^\d{4}-\d{2}-\d{2}$/);
 assert.ok(f[1]==='D−1'||f[1]==='D−7');
 assert.match(f[4],/^\d{4}$/);
 assert.equal(f[5],'vt3');
 return f.slice(0,5).join('|');
}
function footprint(entry,turn){
 const newest=SOURCES[TURNS.indexOf(turn)];
 const paths=new Set(),events=new Set(),rootedRoute=new Set();
 const srcCounts=Object.fromEntries(SOURCES.map(x=>[x,0]));
 for(const p of entry.paths){
  const index=SOURCES.indexOf(p.source);
  assert.ok(index>=0&&index<=TURNS.indexOf(turn));
  const key=p.source+'|'+canonical(p.cells);
  paths.add(key);srcCounts[p.source]++;
  if(p.anchored){
   assert.ok(p.rootIds?.length);
   rootedRoute.add(key);
  }else assert.equal(p.rootIds?.length||0,0);
  for(const root of p.rootIds||[])events.add(rootEvent(root));
 }
 return {paths:[...paths].sort(),events:[...events].sort(),sourceCounts:srcCounts,
  newestSource:newest,newestSourceRoutes:[...paths].filter(x=>x.startsWith(newest+'|')).length,
  rootedRouteCount:rootedRoute.size};
}
function compare(previous,current){
 const newPaths=previous?setsDiff(current.paths,previous.paths):current.paths;
 const disappeared=previous?setsDiff(previous.paths,current.paths):[];
 const newlyRooted=previous?setsDiff(current.events,previous.events):current.events;
 const lostRoots=previous?setsDiff(previous.events,current.events):[];
 const newSrc=SOURCES[0];
 let type='sinCorteAnterior';
 if(previous){
  if(newlyRooted.length)type='nuevoEventoRaiz';
  else if(newPaths.length)type='nuevasRutasSinEvento';
  else if(disappeared.length||lostRoots.length)type='pierdeEvidencia';
  else type='identica';
 }else if(current.prevIndex!==undefined)type='primeraAparicion';
 return {
  type,hadPrior:Boolean(previous),
  addedRoutes:newPaths.length,droppedRoutes:disappeared.length,
  addedRoots:newlyRooted.length,droppedRoots:lostRoots.length,
  retainedRoutes:previous?current.paths.filter(p=>previous.paths.includes(p)).length:0,
  newestSourceAdded:newPaths.filter(p=>p.startsWith(current.newestSource+'|')).length,
  addedPathIds:newPaths,
  addedRootEvents:newlyRooted
 };
}
function prepare(){
 assert.equal(sha(read(INPUT+'PRE_115.json')),SHA_PHYSICAL);
 assert.equal(sha(read(ORIGINAL+'PRE_90.json')),SHA_OUTSIDERS);
 for(const p of [INPUT+'POST_115.json',ORIGINAL+'POST_90.json',EARLIER+'POST_115.json'])
  assert.ok(!existsSync(p),'POST visible durante preparación PRE: '+p);
 mkdirSync(OUT,{recursive:true});
 const all=load(INPUT+'PRE_115.json').rows;assert.equal(all.length,115);
 const old=load(ORIGINAL+'PRE_90.json').rows;assert.equal(old.length,90);
 const byCut=new Map(all.map((row,i)=>[id(row),i]));assert.equal(byCut.size,115);
 const records=all.map(row=>{
  const map=new Map();
  for(const w of row.witnesses){
   assert.ok(!map.has(w.family));
   map.set(w.family,footprint(w,row.turn));
  }
  assert.equal(map.size,row.strategies.B_INVENTARIO.length);
  return map;
 });
 const output=old.map(r=>{
  const i=byCut.get(id(r));assert.ok(i!==undefined);
  const index=TURNS.indexOf(r.turn);assert.ok(index>=0);
  const previousIndex=index?i-1:null;
  if(previousIndex!==null){
   assert.equal(all[previousIndex].date,r.date);
   assert.equal(TURNS.indexOf(all[previousIndex].turn),index-1);
  }
  const originalSet=new Set(r.originalTop);
  const out=r.outsiders.map(c=>{
   const current=records[i].get(c.family);
   assert.ok(current,'Familia no existe en testigo PRE: '+c.family);
   assert.equal(c.routeCount,current.paths.length);
   const previous=previousIndex!==null?records[previousIndex].get(c.family):undefined;
   const transition=compare(previous,current);
   if(previousIndex===null)transition.type='sinCorteAnterior';
   else if(!previous)transition.type='primeraAparicion';
   assert.ok(!originalSet.has(c.family));
   return {family:c.family,rooted:c.rooted,rank:c.rank,
    routeCount:c.routeCount,routeBin:c.routeBin,
    events:current.events,paths:current.paths,
    newestSourceRoutes:current.newestSourceRoutes,rootedRouteCount:current.rootedRouteCount,
    transition};
  });
  assert.equal(out.length,r.outsiderCount);
  return {date:r.date,turn:r.turn,week:r.week,prevTurn:index?TURNS[index-1]:null,
   originalTop:r.originalTop,
   outsiders:out,available:out.length};
 });
 const weeks=unique(output.map(x=>x.week)).sort();
 assert.equal(weeks.length,3);assert.equal(unique(output.map(x=>x.date)).length,18);
 save('PRE_90.json',{rows:output,weeks,seed:SEED,replicates:N,
  note:'Testigos propios físicos deduplicados + comparación turno anterior exclusivamente PRE; no hay tercera elegida ni resultados objetivos.'});
 const seal={physical:SHA_PHYSICAL,outsiders:SHA_OUTSIDERS,
  code:sha(read('scripts/lab-vt3-inercia-tercero.mjs')),protocol:sha(read(DOC)),
  pre:sha(read(OUT+'PRE_90.json'))};
 save('SELLO.json',seal);
 console.log('VT3_INERCIA_PRE_OK',JSON.stringify({
  cases:output.length,meanOutsiders:avg(output.map(x=>x.outsiders.length)),
  totalPhysicalRoutes:output.reduce((n,r)=>n+r.outsiders.reduce((s,f)=>s+f.routeCount,0),0),
  seal}));
}
function measureSequence(rows,methodSelections){
 assert.equal(rows.length,methodSelections.length);
 const usedGlobal=new Set(),usedInDay=new Set(),lastByDay=new Map();
 let immediatelyRepeated=0,earlierSameDay=0,crossDayRepeat=0;
 let noNewPaths=0,newRoot=0,newPathsOnly=0,first=0,unchanged=0,dropped=0;
 let cumulativeNewPaths=0,cumulativeNewRoots=0,cumulativeNewFromLatest=0;
 let priorSameFamily=0,sumPathRetention=0,priorEventRepeat=0;
 const selected=[];
 for(let i=0;i<rows.length;i++){
  const row=rows[i],name=methodSelections[i];
  const p=row.outsiders.find(x=>x.family===name);
  assert.ok(p,'Third outsider absent from PRE physical pool '+id(row)+' '+name);
  const last=lastByDay.get(row.date);
  const sameDayKey=row.date+'|'+name;
  const immediate=last===name;
  const intraday=usedInDay.has(sameDayKey);
  const historic=usedGlobal.has(name);
  immediatelyRepeated+=Number(immediate);
  earlierSameDay+=Number(intraday);
  crossDayRepeat+=Number(historic&&!intraday);
  const t=p.transition;
  if(row.prevTurn){
   noNewPaths+=Number(t.hadPrior&&t.addedRoutes===0);
   newRoot+=Number(t.addedRoots>0&&t.hadPrior);
   newPathsOnly+=Number(t.hadPrior&&t.addedRoutes>0&&t.addedRoots===0);
   first+=Number(!t.hadPrior);
   unchanged+=Number(t.type==='identica');
   dropped+=Number(t.droppedRoutes>0||t.droppedRoots>0);
   cumulativeNewPaths+=t.addedRoutes;
   cumulativeNewRoots+=t.addedRoots;
   cumulativeNewFromLatest+=t.newestSourceAdded;
   priorSameFamily+=Number(t.hadPrior);
   if(t.hadPrior){
    sumPathRetention+=t.retainedRoutes/Math.max(1,p.routeCount);
    priorEventRepeat+=Number(t.addedRoots===0);
   }
  }
  selected.push({date:row.date,turn:row.turn,family:name,repeatImmediate:immediate,
   repeatEarlierInDay:intraday,repeatHistorically:historic,
   ...t,rooted:p.rooted,rank:p.rank,routeCount:p.routeCount,routeBin:p.routeBin,
   rootedRouteCount:p.rootedRouteCount,currentEvents:p.events,
   newestSourceRoutes:p.newestSourceRoutes});
  usedGlobal.add(name);usedInDay.add(sameDayKey);lastByDay.set(row.date,name);
 }
 return {selected,
  summary:{
   distinctFamilies:usedGlobal.size,repeatImmediatelySameDay:immediatelyRepeated,
   repeatAnywhereSameDay:earlierSameDay,globalPreviouslySeen:rows.length-usedGlobal.size,
   crossDayRepeat,
   adjacentEligibleCases:rows.filter(x=>x.prevTurn!==null).length,
   candidatePresentPrior:priorSameFamily,firstAppearanceInTurn:first,
   identicalPhysicalAndRoots:unchanged,
   anyNewIndependentRootEvent:newRoot,addedPathsWithoutNewRoot:newPathsOnly,
   noNewPathsWhenPresent:noNewPaths,
   anyLostEvidence:dropped,
   totalNewPaths:cumulativeNewPaths,totalNewRootEvents:cumulativeNewRoots,
   newPathsInAddedSource:cumulativeNewFromLatest,
   meanRetainedRouteFractionWhenPresent:priorSameFamily?sumPathRetention/priorSameFamily:0,
   fractionPriorWithNoNewRoot:priorSameFamily?priorEventRepeat/priorSameFamily:0
  }};
}
function describe(values,actual){
 const a=values.slice().sort((x,y)=>x-y);
 return {samples:a.length,observed:actual,mean:Number(avg(a).toFixed(4)),
  min:a[0],p05:a[Math.floor(.05*(a.length-1))],
  median:a[Math.floor(.5*(a.length-1))],
  p95:a[Math.floor(.95*(a.length-1))],max:a.at(-1),
  percentileLessOrEqual:a.filter(x=>x<=actual).length/a.length,
  fractionAtLeastObserved:a.filter(x=>x>=actual).length/a.length};
}
function evaluate(){
 const seal=load(OUT+'SELLO.json');
 for(const [file,expected] of [[INPUT+'PRE_115.json',seal.physical],
  [ORIGINAL+'PRE_90.json',seal.outsiders],
  ['scripts/lab-vt3-inercia-tercero.mjs',seal.code],
  [DOC,seal.protocol],[OUT+'PRE_90.json',seal.pre]])
  assert.equal(sha(read(file)),expected,'Sello de PRE no coincide: '+file);
 const rows=load(OUT+'PRE_90.json').rows;
 const frozen=load(ORIGINAL+'POST_90.json').rows;
 const first=load(EARLIER+'POST_115.json').rows;
 assert.equal(rows.length,90);assert.equal(frozen.length,90);assert.equal(first.length,90);
 const firstMap=new Map(first.map(x=>[id(x),x]));
 assert.equal(firstMap.size,90);
 const names=Object.fromEntries(METHODS.map(x=>[x,[]]));
 const results=new Map();
 for(let i=0;i<90;i++){
  const r=rows[i],f=frozen[i],former=firstMap.get(id(r));
  assert.equal(id(r),id(f));assert.ok(former);
  assert.deepEqual(f.originalTop,r.originalTop);
  assert.deepEqual(former.method.OFICIAL.top10,r.originalTop);
  const third=former.method.FUSION_CONSERVADORA.top10[2];
  assert.equal(third,f.selectedFamilyThird);
  assert.equal(third,f.learnedThird.family);
  assert.equal(f.scores.APRENDIDO.chosen,third);
  for(const m of METHODS){
   const outsider=f.scores[m].chosen;
   assert.ok(r.outsiders.some(x=>x.family===outsider),m);
   names[m].push(outsider);
  }
  results.set(id(r),f.resultHeads.map(h=>{
   assert.match(h,/^\d{4}$/);
   const q=h.slice(-3);return [q,[...q].reverse().join('')].sort().join('/');
  }));
 }
 const analysed=Object.fromEntries(METHODS.map(m=>[m,measureSequence(rows,names[m])]));
 const successes={};
 for(const method of METHODS){
  const chosen=analysed[method].selected;
  const counts={winningThird:0,winningWithAddedRoot:0,winningSameFootprint:0,
   winnerExamples:[],losingNoRootCases:0,losingWithNewRootCases:0};
  for(const r of chosen){
   const win=results.get(id(r)).includes(r.family);
   if(win){
    counts.winningThird++;
    counts.winningWithAddedRoot+=Number(r.addedRoots>0);
    counts.winningSameFootprint+=Number(r.type==='identica');
    counts.winnerExamples.push({date:r.date,turn:r.turn,family:r.family,
     transition:r.type,addedRoutes:r.addedRoutes,addedRoots:r.addedRoots,
     newFromLatest:r.newestSourceAdded,rooted:r.rooted,rank:r.rank,
     repeatedEarlierInDay:r.repeatEarlierInDay,repeatImmediate:r.repeatImmediate});
   }else if(r.prevTurn!==null){
    counts.losingWithNewRootCases+=Number(r.addedRoots>0);
    counts.losingNoRootCases+=Number(r.addedRoots===0);
   }
  }
  successes[method]=counts;
 }
 assert.equal(successes.APRENDIDO.winningThird,1);
 const expectedPrior={repeatImmediatelySameDay:0,distinctFamilies:0,
   identicalPhysicalAndRoots:0,anyNewIndependentRootEvent:0,totalNewPaths:0,
   totalNewRootEvents:0,meanRetainedRouteFractionWhenPresent:0,
   firstAppearanceInTurn:0,addedPathsWithoutNewRoot:0,repeatAnywhereSameDay:0};
 // 5000 neutral sequences preserve identical set of source cuts, one choice each.
 // Matched neutral uses class rooted/unrooted + routeBin of frozen selection, BEFORE
 // checking any future heads. No win optimisation in controls.
 const randomGenerator=rand(20261013);
 const sampleNames=['FISICA_UNIFORME','IGUAL_RAIZ_Y_CANTIDAD_RUTAS'];
 const simulations=Object.fromEntries(sampleNames.map(m=>[m,[]]));
 for(let replicate=0;replicate<N;replicate++){
  const drawn={FISICA_UNIFORME:[],IGUAL_RAIZ_Y_CANTIDAD_RUTAS:[]};
  for(let i=0;i<90;i++){
   const row=rows[i],selected= row.outsiders.find(x=>x.family===names.APRENDIDO[i]);
   assert.ok(selected);
   const matched=row.outsiders.filter(p=>p.rooted===selected.rooted&&p.routeBin===selected.routeBin);
   assert.ok(matched.length);
   drawn.FISICA_UNIFORME.push(row.outsiders[Math.floor(randomGenerator()*row.outsiders.length)].family);
   drawn.IGUAL_RAIZ_Y_CANTIDAD_RUTAS.push(matched[Math.floor(randomGenerator()*matched.length)].family);
  }
  for(const method of sampleNames){
   const s=measureSequence(rows,drawn[method]).summary;
   simulations[method].push(s);
  }
 }
 const stats=['distinctFamilies','repeatImmediatelySameDay','repeatAnywhereSameDay',
  'identicalPhysicalAndRoots','anyNewIndependentRootEvent',
  'addedPathsWithoutNewRoot','firstAppearanceInTurn','noNewPathsWhenPresent',
  'totalNewPaths','totalNewRootEvents','newPathsInAddedSource',
  'candidatePresentPrior','meanRetainedRouteFractionWhenPresent'];
 const neutrals=Object.fromEntries(sampleNames.map(m=>[m,Object.fromEntries(
  stats.map(stat=>[stat,describe(simulations[m].map(x=>x[stat]),analysed.APRENDIDO.summary[stat])])
 )]));
 const byTurn=Object.fromEntries(TURNS.map(turn=>{
  const idx=rows.flatMap((r,i)=>r.turn===turn?[i]:[]);
  return [turn,{cuts:idx.length,
   learner:idx.map(i=>analysed.APRENDIDO.selected[i]).reduce((acc,x)=>{
    acc.identical+=Number(x.type==='identica');
    acc.newRoot+=Number(x.addedRoots>0);
    acc.newRoutesNoRoot+=Number(x.addedRoutes>0&&x.addedRoots===0);
    acc.firstAppearance+=Number(x.type==='primeraAparicion');
    acc.winning+=Number(results.get(id(x)).includes(x.family));
    return acc;
   },{identical:0,newRoot:0,newRoutesNoRoot:0,firstAppearance:0,winning:0})}];
 }));
 const byWeek=Object.fromEntries(unique(rows.map(r=>r.week)).map(week=>{
  const subset=analysed.APRENDIDO.selected.filter(r=>rows.some(x=>id(x)===id(r)&&x.week===week));
  const count=subset.reduce((a,r)=>{
   a.newEvent+=Number(r.addedRoots>0);a.unchanged+=Number(r.type==='identica');
   a.newPaths+=r.addedRoutes;a.wins+=Number(results.get(id(r)).includes(r.family));
   return a;
  },{newEvent:0,unchanged:0,newPaths:0,wins:0});
  return [week,{cuts:subset.length,...count,uniqueThird:unique(subset.map(x=>x.family)).length}];
 }));
 const frequency=Object.entries(names.APRENDIDO.reduce((a,f)=>{a[f]=(a[f]||0)+1;return a;},{}))
  .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 const repeated=frequency.filter(([f,n])=>n>=3).map(([f,n])=>{
  const r=analysed.APRENDIDO.selected.filter(x=>x.family===f);
  return {family:f,count:n,cuts:r.map(x=>x.date+'|'+x.turn),
   atNewRoot:r.filter(x=>x.addedRoots>0).length,
   atSamePhysical:r.filter(x=>x.type==='identica').length,
   atFirstAppearance:r.filter(x=>x.type==='primeraAparicion').length,
   winCount:r.filter(x=>results.get(id(x)).includes(x.family)).length,
   rootStatus:unique(r.map(x=>x.rooted)),allPaths:r.map(x=>x.routeCount)};
 });
 const commonShared=analysed.APRENDIDO.selected.filter(x=>x.repeatImmediate||x.repeatEarlierInDay);
 const report={
  date:'2026-10-13',cuts:90,days:18,byTurn,byWeek,
  summaries:Object.fromEntries(METHODS.map(m=>[m,analysed[m].summary])),
  success:successes,
  neutralComparison:neutrals,
  frequencies:frequency,
  repeatedFamilies:repeated,
  repeatedWithinDay:commonShared.map(x=>({date:x.date,turn:x.turn,family:x.family,
   repeatImmediate:x.repeatImmediate,previousSameDay:x.repeatEarlierInDay,
   routes:x.routeCount,addedRoutes:x.addedRoutes,
   rootEvents:x.currentEvents.length,addedRoots:x.addedRoots,
   kind:x.type})),
  seal,preHash:sha(read(OUT+'PRE_90.json')),
  frozenSelection:sha(read(ORIGINAL+'POST_90.json')),
  warning:'La persistencia de familia o ruta no implica mayor probabilidad de salir. Etiquetas actuales sólo se consultaron después de fijar y validar terceros previamente congelados; muestra histórica reiteradamente estudiada.'
 };
 save('POST_90.json',{rows:analysed.APRENDIDO.selected.map((x,i)=>({
   ...x,headsAreResultFamilies:results.get(id(x)),
   isWinner:results.get(id(x)).includes(x.family),
   rootEvidenceIsOwnPhysical:true}))});
 save('RESUMEN.json',report);
 console.log('VT3_INERCIA_POST_OK',JSON.stringify({
  summary:report.summaries,successes,
  contrasts:Object.fromEntries(sampleNames.map(m=>[m,Object.fromEntries([
   'distinctFamilies','repeatImmediatelySameDay','repeatAnywhereSameDay',
   'identicalPhysicalAndRoots','anyNewIndependentRootEvent',
   'addedPathsWithoutNewRoot','firstAppearanceInTurn','newPathsInAddedSource'
  ].map(x=>[x,neutrals[m][x]]))])),
  repeated:repeated.slice(0,12),byTurn
 },null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')evaluate();
else throw Error('Uso: pre|post');
