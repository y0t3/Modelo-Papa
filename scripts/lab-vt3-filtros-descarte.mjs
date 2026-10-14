import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const G='auditorias/vt3-geometria-completa-vs-anclada-115-14oct2026/';
const BASE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-filtros-descarte-115-14oct2026/';
const PROTOCOL='PROTOCOLO_VT3_FILTROS_DESCARTE_14OCT2026.md';
const SCRIPT='scripts/lab-vt3-filtros-descarte.mjs';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const RULES=['REPETIDA_RUTA_D1','REPETIDA_RUTA_D7','REPETIDA_FUENTE_D1',
 'PERSISTE_FAMILIA_D7_D14','PERSISTE_RUTA_D7_D14',
 'ESTABLE_INTRADIA_Y_D1','PERSISTE_4_SEMANAS'];
const budgets=[3,5,10];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(name,data)=>writeFileSync(OUT+name,JSON.stringify(data,null,2)+'\n');
const key=r=>r.date+'|'+r.turn;
const dateMinus=(iso,days)=>new Date(Date.parse(iso+'T00:00:00Z')-days*86400000).toISOString().slice(0,10);
const fam=v=>[v,[...v].reverse().join('')].sort().join('/');
function geomTuple(p){return [Number(p.d1.far),p.d1.maxDist,Number(p.d7.far),p.d7.maxDist,
 Number(p.rootFar),p.rootMaxDist,p.rootEvents];}
function pos(p){const xs=p.cells.map(c=>c.split(':').map(Number));
 return {row:Math.min(...xs.map(x=>x[0])),col:Math.min(...xs.map(x=>x[1]))};}
function geomCompare(a,b){
 const x=geomTuple(a),y=geomTuple(b);
 for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];
 const d=SOURCES.indexOf(a.source)-SOURCES.indexOf(b.source);
 if(d)return d;
 const p=pos(a),q=pos(b);
 return p.row-q.row||p.col-q.col||a.key.localeCompare(b.key);
}
function sortedUnique(row){
 const ranked=row.candidates.slice().sort(geomCompare);
 const selected=[],seen=new Set();
 for(const p of ranked)if(!seen.has(p.family)){
  assert.equal(fam(p.family.slice(0,3)),p.family);
  seen.add(p.family);selected.push(p.family);
 }
 assert.ok(selected.length>=10);
 assert.deepEqual(selected.slice(0,10),row.selections.F_D1.top,
  'La reconstrucción del orden físico debe coincidir EXACTAMENTE con el PRE original '+key(row));
 assert.equal(new Set(selected).size,selected.length);
 return selected;
}
function familyIndex(row){
 const set=new Set(),route=new Set(),source=new Set(),byFamily=new Map(),newSource=SOURCES[TURNS.indexOf(row.turn)];
 for(const p of row.candidates){
  assert.match(p.family,/^\d{3}\/\d{3}$/);
  assert.equal(fam(p.family.slice(0,3)),p.family);
  assert.equal(typeof p.source,'string');
  assert.ok(SOURCES.indexOf(p.source)<=TURNS.indexOf(row.turn));
  assert.equal(p.cells.length,3);
  set.add(p.family);source.add(p.family+'|'+p.source);
  const id=p.family+'|'+p.key;
  assert.ok(!route.has(id),'Ruta duplicada dentro del corte '+key(row)+' '+id);
  route.add(id);
  if(!byFamily.has(p.family))byFamily.set(p.family,{sourceNew:false});
  if(p.source===newSource)byFamily.get(p.family).sourceNew=true;
 }
 return {set,route,source,byFamily};
}
function makeFilterFlags(current,earlier,idx){
 const dates=[1,7,14,21,28];
 const prev=Object.fromEntries(dates.map(n=>[n,earlier.get(dateMinus(current.date,n)+'|'+current.turn)||null]));
 const available={};
 for(const n of dates)available[n]=Boolean(prev[n]);
 const eligible={
  REPETIDA_RUTA_D1:available[1],
  REPETIDA_RUTA_D7:available[7],
  REPETIDA_FUENTE_D1:available[1],
  PERSISTE_FAMILIA_D7_D14:available[7]&&available[14],
  PERSISTE_RUTA_D7_D14:available[7]&&available[14],
  ESTABLE_INTRADIA_Y_D1:available[1]&&current.turn!=='Previa',
  PERSISTE_4_SEMANAS:available[7]&&available[14]&&available[21]&&available[28]
 };
 const flagged=Object.fromEntries(RULES.map(n=>[n,new Set()]));
 const p1=prev[1],p7=prev[7],p14=prev[14];
 for(const [family,x] of idx.byFamily){
  const curPaths=current.candidates.filter(p=>p.family===family);
  const curIds=curPaths.map(p=>family+'|'+p.key);
  const curSrc=curPaths.map(p=>family+'|'+p.source);
  if(eligible.REPETIDA_RUTA_D1&&curIds.some(k=>p1.route.has(k)))
   flagged.REPETIDA_RUTA_D1.add(family);
  if(eligible.REPETIDA_RUTA_D7&&curIds.some(k=>p7.route.has(k)))
   flagged.REPETIDA_RUTA_D7.add(family);
  if(eligible.REPETIDA_FUENTE_D1&&curSrc.some(k=>p1.source.has(k)))
   flagged.REPETIDA_FUENTE_D1.add(family);
  if(eligible.PERSISTE_FAMILIA_D7_D14&&p7.set.has(family)&&p14.set.has(family))
   flagged.PERSISTE_FAMILIA_D7_D14.add(family);
  if(eligible.PERSISTE_RUTA_D7_D14&&curIds.some(k=>p7.route.has(k)&&p14.route.has(k)))
   flagged.PERSISTE_RUTA_D7_D14.add(family);
  if(eligible.ESTABLE_INTRADIA_Y_D1&&!x.sourceNew&&curSrc.some(k=>p1.source.has(k)))
   flagged.ESTABLE_INTRADIA_Y_D1.add(family);
  if(eligible.PERSISTE_4_SEMANAS&&
    curIds.some(k=>[7,14,21,28].every(n=>prev[n].route.has(k))))
   flagged.PERSISTE_4_SEMANAS.add(family);
 }
 return {eligible,flagged,available};
}
function pre(){
 for(const p of [BASE+'POST_115.json',BASE+'NOCTURNA_POST_DIAGNOSTICO.json',
  G+'POST_115.json'])assert.ok(!existsSync(p),'POST visible durante PRE: '+p);
 const seal=json(G+'SELLO.json');
 assert.equal(seal.generatedPre,sha(read(G+'PRE_115.json')));
 const prior=json(G+'PRE_115.json').rows;
 assert.equal(prior.length,115);
 const map=new Map(prior.map(r=>[key(r),r]));
 assert.equal(map.size,115);
 const cache=new Map([...map].map(([k,r])=>[k,familyIndex(r)]));
 const rows=[],universeStats={families:0,filters:{}};
 for(const n of RULES)universeStats.filters[n]={eligibleCuts:0,discarded:0,eligibleFamilies:0,maxDiscardedPerCut:0};
 let lastDate='0000';
 for(const current of prior){
  assert.ok(current.date>=lastDate);lastDate=current.date;
  const id=key(current),fullOrder=sortedUnique(current);
  const past=new Map();
  for(const n of [1,7,14,21,28]){
   const other=map.get(dateMinus(current.date,n)+'|'+current.turn);
   if(other){assert.ok(other.date<current.date,'Fuga temporal');
    past.set(key(other),cache.get(key(other)));}
  }
  const f=makeFilterFlags(current,past,cache.get(id));
  const rejected={},selected={};
  for(const n of RULES){
   rejected[n]=[...f.flagged[n]].sort();
   selected[n]=fullOrder.filter(name=>!f.flagged[n].has(name)).slice(0,10);
   if(f.eligible[n]){
    assert.equal(selected[n].length,10,'Más descartes que capacidad de top10 '+id+' '+n);
    const info=universeStats.filters[n];info.eligibleCuts++;
    info.eligibleFamilies+=fullOrder.length;
    info.discarded+=rejected[n].length;
    info.maxDiscardedPerCut=Math.max(info.maxDiscardedPerCut,rejected[n].length);
   }else{
    assert.equal(rejected[n].length,0);
    assert.deepEqual(selected[n],fullOrder.slice(0,10));
   }
  }
  universeStats.families+=fullOrder.length;
  rows.push({date:current.date,turn:current.turn,eligible:f.eligible,
   availableHistoricalDays:f.available,
   physicalCount:current.candidates.length,
   universeFamilies:fullOrder.length,
   orderedFamilies:fullOrder,
   official:current.official,
   baselineTop10:fullOrder.slice(0,10),
   rejected,selected});
 }
 assert.equal(rows.length,115);assert.equal(universeStats.filters.PERSISTE_4_SEMANAS.eligibleCuts,0);
 save('PRE_115.json',{scope:'Laboratorio retrospectivo: universo PRE completo, filtro de descarte sin reorder',cuts:115,
  dates:[...new Set(rows.map(r=>r.date))],
  policy:'Descartar en PRE; NO ajustar ranking ni cupos; ignorar filtros sin historia exacta completa.',
  universeStats,rows});
 const s={previousGeometryPre:seal.generatedPre,
  sourceBasePre:seal.basePre,script:sha(read(SCRIPT)),protocol:sha(read(PROTOCOL)),
  pre:sha(read(OUT+'PRE_115.json'))};
 save('SELLO.json',s);
 console.log('DESCARTE_PRE_OK '+JSON.stringify({summary:universeStats,seal:s}));
}
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};}
const trial=(chosen,wins,k)=>chosen.slice(0,k).some(f=>wins.has(f));
function randomReject(ordered,count,rand){
 if(!count)return new Set();
 const indices=Array.from({length:ordered.length},(_,i)=>i);
 for(let j=0;j<count;j++){
  const k=j+Math.floor(rand()*(indices.length-j));
  [indices[j],indices[k]]=[indices[k],indices[j]];
 }
 return new Set(indices.slice(0,count));
}
function percentile(arr){
 const x=arr.slice().sort((a,b)=>a-b);
 return {p05:x[Math.floor((x.length-1)*.05)],median:x[Math.floor((x.length-1)*.5)],
  p95:x[Math.floor((x.length-1)*.95)]};
}
function post(){
 const seal=json(OUT+'SELLO.json'),priorSeal=json(G+'SELLO.json');
 assert.equal(seal.previousGeometryPre,priorSeal.generatedPre);
 assert.equal(seal.previousGeometryPre,sha(read(G+'PRE_115.json')));
 assert.equal(seal.sourceBasePre,priorSeal.basePre);
 assert.equal(seal.script,sha(read(SCRIPT)));assert.equal(seal.protocol,sha(read(PROTOCOL)));
 assert.equal(seal.pre,sha(read(OUT+'PRE_115.json')));
 const pre=json(OUT+'PRE_115.json'),results=json(BASE+'POST_115.json').rows;
 const rows=pre.rows;assert.equal(rows.length,115);assert.equal(results.length,115);
 const obs=rows.map((r,i)=>{
  const p=results[i];assert.equal(key(r),key(p));assert.equal(p.targets.length,5);
  const win=new Set(p.targets.map(h=>{assert.match(h,/^\d{4}$/);return fam(h.slice(-3));}));
  const inPool=r.orderedFamilies.filter(f=>win.has(f));
  const flags=Object.fromEntries(RULES.map(n=>[n,{
   retainedWinners:inPool.filter(f=>!r.rejected[n].includes(f)),
   lostWinners:inPool.filter(f=>r.rejected[n].includes(f)),
   hit3:trial(r.selected[n],win,3),hit5:trial(r.selected[n],win,5),
   hit10:trial(r.selected[n],win,10)}]));
  return {date:r.date,turn:r.turn,wins:inPool,baseline:{
   top3:trial(r.baselineTop10,win,3),top5:trial(r.baselineTop10,win,5),
   top10:trial(r.baselineTop10,win,10)},official:{
   top3:trial(r.official,win,3),top5:trial(r.official,win,5),
   top10:trial(r.official,win,10)},flags};
 });
 assert.equal(obs.reduce((acc,r)=>acc+r.wins.length,0),143);
 function aggregate(rowsIdx,n){
  const only=rowsIdx.filter(i=>rows[i].eligible[n]);
  const obj={
   eligibleCuts:only.length,eligibleExposures:0,discardedExposures:0,
   winnerExposures:0,winnerDiscarded:0,
   score:{top3:0,top5:0,top10:0},baseline:{top3:0,top5:0,top10:0},
   topChanges:{top3:0,top5:0,top10:0},removedFromBaselineTop10:0,
   removedWinningFromBaselineTop10:0,
   gains:{top3:[],top5:[],top10:[]},losses:{top3:[],top5:[],top10:[]}
  };
  for(const i of only){
   const r=rows[i],o=obs[i],f=o.flags[n];
   obj.eligibleExposures+=r.universeFamilies;
   obj.discardedExposures+=r.rejected[n].length;
   obj.winnerExposures+=o.wins.length;
   obj.winnerDiscarded+=f.lostWinners.length;
   const discarded=new Set(r.rejected[n]);
   obj.removedFromBaselineTop10+=r.baselineTop10.filter(x=>discarded.has(x)).length;
   obj.removedWinningFromBaselineTop10+=r.baselineTop10.filter(x=>discarded.has(x)&&o.wins.includes(x)).length;
   for(const k of budgets){
    const b='top'+k,t=f['hit'+k];
    obj.score[b]+=Number(t);obj.baseline[b]+=Number(o.baseline[b]);
    obj.topChanges[b]+=Number(JSON.stringify(r.selected[n].slice(0,k))!==JSON.stringify(r.baselineTop10.slice(0,k)));
    if(t&&!o.baseline[b])obj.gains[b].push(key(r));
    if(!t&&o.baseline[b])obj.losses[b].push(key(r));
   }
  }
  obj.discardRate=obj.eligibleExposures?+(obj.discardedExposures/obj.eligibleExposures).toFixed(5):null;
  obj.winnerRetention=obj.winnerExposures?+(1-obj.winnerDiscarded/obj.winnerExposures).toFixed(5):null;
  obj.delta=Object.fromEntries(budgets.map(k=>['top'+k,obj.score['top'+k]-obj.baseline['top'+k]]));
  return obj;
 }
 const ids=rows.map((_,i)=>i),rules=Object.fromEntries(RULES.map(n=>[n,aggregate(ids,n)]));
 const byMonth=Object.fromEntries([...new Set(rows.map(r=>r.date.slice(0,7)))].map(m=>[m,
  Object.fromEntries(RULES.map(n=>[n,aggregate(ids.filter(i=>rows[i].date.startsWith(m)),n)]))]));
 const byTurn=Object.fromEntries(TURNS.map(t=>[t,Object.fromEntries(RULES.map(n=>[n,
  aggregate(ids.filter(i=>rows[i].turn===t),n)]))]));
 const baseline={top3:obs.filter(o=>o.baseline.top3).length,
  top5:obs.filter(o=>o.baseline.top5).length,top10:obs.filter(o=>o.baseline.top10).length};
 const official={top3:obs.filter(o=>o.official.top3).length,
  top5:obs.filter(o=>o.official.top5).length,top10:obs.filter(o=>o.official.top10).length};
 assert.deepEqual(baseline,{top3:8,top5:10,top10:16});
 assert.deepEqual(official,{top3:5,top5:8,top10:15});
 const N=2000,rand=rng(20261014);
 const neutral=Object.fromEntries(RULES.map(n=>[n,{top3:[],top5:[],top10:[],lostWinners:[]}]));
 const winSets=obs.map(o=>new Set(o.wins));
 for(let sim=0;sim<N;sim++){
  const tally=Object.fromEntries(RULES.map(n=>[n,{top3:0,top5:0,top10:0,lostWinners:0}]));
  for(let i=0;i<rows.length;i++){
   const row=rows[i],w=winSets[i];
   for(const n of RULES)if(row.eligible[n]){
    const discardCount=row.rejected[n].length;
    if(!discardCount){
     for(const k of budgets)tally[n]['top'+k]+=Number(obs[i].baseline['top'+k]);
     continue;
    }
    const drawn=randomReject(row.orderedFamilies,discardCount,rand);
    let lost=0;for(const j of drawn)lost+=Number(w.has(row.orderedFamilies[j]));
    tally[n].lostWinners+=lost;
    const chosen=[];
    for(let j=0;j<row.orderedFamilies.length&&chosen.length<10;j++)
     if(!drawn.has(j))chosen.push(row.orderedFamilies[j]);
    assert.equal(chosen.length,10);
    for(const k of budgets)tally[n]['top'+k]+=Number(trial(chosen,w,k));
   }
  }
  for(const n of RULES)for(const f of ['top3','top5','top10','lostWinners'])
   neutral[n][f].push(tally[n][f]);
 }
 const nullStats=Object.fromEntries(RULES.map(n=>[n,
  Object.fromEntries(['top3','top5','top10','lostWinners'].map(field=>{
   const vals=neutral[n][field],mean=+(vals.reduce((a,b)=>a+b,0)/N).toFixed(5);
   const actual=field==='lostWinners'?rules[n].winnerDiscarded:rules[n].score[field];
   const favorable=vals.filter(v=>field==='lostWinners'?v<=actual:v>=actual).length;
   return [field,{runs:N,mean,...percentile(vals),
    actual,tailFavorable:Number(((favorable+1)/(N+1)).toFixed(5))}];
  }))]));
 const highlights=obs.map((o,i)=>({date:o.date,turn:o.turn,actualWinningFamilies:o.wins,
  affected:Object.fromEntries(RULES.filter(n=>rows[i].eligible[n]&&
   (o.flags[n].lostWinners.length||budgets.some(k=>o.flags[n]['hit'+k]!==o.baseline['top'+k])))
   .map(n=>[n,{discardedWinners:o.flags[n].lostWinners,
    removed:rows[i].rejected[n].length,after:rows[i].selected[n].slice(0,10),
    top3:o.flags[n].hit3,top5:o.flags[n].hit5,top10:o.flags[n].hit10}]))}))
  .filter(x=>Object.keys(x.affected).length);
 const report={scope:'Estudio retrospectivo exploratorio, 23 días/115 cortes, 5 cabezas por corte. No es validación prospectiva.',
  rankingBaseline:baseline,official,universe:pre.universeStats,
  rules,byMonth,byTurn,neutral:nullStats,
  notEvaluable:{PERSISTE_4_SEMANAS:'Ningún corte dispone de D-7,D-14,D-21,D-28 previos completos en este corpus; NO se probó el candidato original de cuatro semanas.'},
  inspectedCases:highlights.slice(0,85),
  notes:[
   'Un no-acierto constituye la mayoría de familias: medir retención de las ganadoras es esencial.',
   'Nunca tratar una jornada ausente del corpus como ausencia física real.',
   'Los filtros operan sobre familias completas, no rutas individuales, y jamás reconstruyen el ranking tras ver POST.',
   'Control neutral descarta igual número de familias por corte y repone del ranking geométrico original.',
   'Los mismos 115 cortes ya fueron utilizados numerosas veces. No hay inferencia causal ni ventaja futura demostrada.',
   'No modificar src/motorLalo.ts, main, VT4, marcaciones o sellos prospectivos ya existentes.'
  ],seal,postSha:sha(read(BASE+'POST_115.json'))};
 save('POST_115.json',{rows:obs.map(o=>({date:o.date,turn:o.turn,wins:o.wins,
  baseline:o.baseline,official:o.official,
  filters:Object.fromEntries(RULES.map(n=>[n,{lostWinners:o.flags[n].lostWinners,
   hit3:o.flags[n].hit3,hit5:o.flags[n].hit5,hit10:o.flags[n].hit10}]))}))});
 save('RESUMEN.json',report);
 console.log('DESCARTE_POST_OK '+JSON.stringify({
  baseline,official,rules:Object.fromEntries(RULES.map(n=>[n,{
   eligibleCuts:rules[n].eligibleCuts,discardedExposures:rules[n].discardedExposures,
   discardRate:rules[n].discardRate,winnerExposures:rules[n].winnerExposures,
   winnerDiscarded:rules[n].winnerDiscarded,winnerRetention:rules[n].winnerRetention,
   score:rules[n].score,baseline:rules[n].baseline,delta:rules[n].delta}])),
  neutral:nullStats},null,2));
}
if(process.argv[2]==='pre'){mkdirSync(OUT,{recursive:true});pre();}
else if(process.argv[2]==='post'){mkdirSync(OUT,{recursive:true});post();}
else throw Error('Usage: pre | post');
