import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ATLAS='auditorias/vt3-atlas-cuatro-dimensiones-115-14oct2026/';
const GEOPREV='auditorias/vt3-posiciones-geometricas-115-14oct2026/';
const BASE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-geometria-completa-vs-anclada-115-14oct2026/';
const PROTOCOL='PROTOCOLO_VT3_GEOMETRIA_COMPLETA_VS_ANCLADA_14OCT2026.md';
const SELF='scripts/lab-vt3-geometria-completa-vs-anclada.mjs';
const BASE_SHA='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const POLICIES=['OFFICIAL','OLD_GEO_SHIFT','A_D1','F_D1','A_D7','F_D7'];
const KEYS=[3,5,10];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const hash=s=>createHash('sha256').update(s).digest('hex');
const save=(p,obj)=>writeFileSync(OUT+p,JSON.stringify(obj,null,2)+'\n');
const family=v=>[v,[...v].reverse().join('')].sort().join('/');
const rowKey=x=>x.date+'|'+x.turn;
const pathKey=e=>{
 const forward=e.cells.join('>'),reverse=[...e.cells].reverse().join('>');
 return e.source+'|'+[forward,reverse].sort()[0];
};
const keyS=e=>e.source+'|'+e.shape;
const minusDays=(date,n)=>new Date(Date.parse(date+'T00:00:00Z')-n*86400000).toISOString().slice(0,10);
const tie=(a,b)=>SOURCES.indexOf(a.source)-SOURCES.indexOf(b.source)||
 a.pos.row-b.pos.row||a.pos.col-b.pos.col||a.key.localeCompare(b.key);
function verifyEvents(r){
 assert.ok(TURNS.includes(r.turn));
 const seen=new Set(),currentSourceIndex=TURNS.indexOf(r.turn);
 for(const e of r.events){
  assert.equal(e.cells.length,3);
  assert.equal(new Set(e.cells).size,3);
  assert.ok(SOURCES.indexOf(e.source)<=currentSourceIndex);
  assert.equal(family(e.value),e.family);
  const expected={row:Math.min(...e.cells.map(c=>Number(c.split(':')[0]))),
   col:Math.min(...e.cells.map(c=>Number(c.split(':')[1])))};
  assert.deepEqual(e.pos,expected);
  for(let k=0;k<3;k++){
   const [row,col]=e.cells[k].split(':').map(Number);
   assert.ok(row>=0&&row<6&&col>=0&&col<2);
   if(k){const [u,v]=e.cells[k-1].split(':').map(Number);
    assert.equal(Math.max(Math.abs(row-u),Math.abs(col-v)),1);}
  }
  const id=pathKey(e);assert.ok(!seen.has(id),'Duplicate position '+rowKey(r)+'|'+id);
  seen.add(id);
 }
}
function byShape(events){
 const m=new Map();
 for(const e of events){const k=keyS(e);
  if(!m.has(k))m.set(k,[]);
  m.get(k).push(e);}
 return m;
}
function context(p,old){
 if(!old)return {present:false,far:false,maxDist:0,count:0,samePosition:false};
 const arr=old.get(keyS(p))||[];
 let far=false,maxDist=0,samePosition=false;
 for(const x of arr){
  const dr=Math.abs(p.pos.row-x.pos.row),dc=Math.abs(p.pos.col-x.pos.col);
  far ||=dr>=2;
  maxDist=Math.max(maxDist,dr+dc);
  samePosition ||=dr===0&&dc===0;
 }
 return {present:arr.length>0,far,maxDist,count:arr.length,samePosition};
}
function checkPrevious(pre,atlas){
 assert.equal(pre.date,atlas.date);assert.equal(pre.turn,atlas.turn);
 const all=new Map(atlas.events.map(e=>[pathKey(e),e]));
 assert.equal(all.size,atlas.events.length);
 const anchored=new Map();
 for(const c of pre.candidates){
  const target=all.get(c.geoKey);
  assert.ok(target,'Rooted physical route absent '+c.geoKey);
  assert.equal(target.family,c.family);
  assert.equal(target.value,c.value);
  assert.deepEqual(target.cells,c.cells);
  assert.equal(target.shape,c.shape);
  assert.ok(!anchored.has(c.geoKey));
  anchored.set(c.geoKey,c);
 }
 assert.equal(anchored.size,pre.eligible);
 return anchored;
}
function featFrame(frame,rooted,d1,d7){
 const old1=d1?byShape(d1.events):null,old7=d7?byShape(d7.events):null;
 const universe=[];
 for(const e of frame.events){
  const key=pathKey(e),parent=rooted.get(key)||null;
  const a=context(e,old1),b=context(e,old7);
  universe.push({
   key,source:e.source,pos:e.pos,cells:e.cells,shape:e.shape,
   rooted:Boolean(parent),rootEvents:parent?.ancestors||0,
   rootFar:Boolean(parent?.far),rootMaxDist:parent?.maxShift||0,
   d1:a,d7:b,
   // Las cifras son datos de la hoja y se leen para output SOLO DESPUES de ordenar rutas.
   family:e.family,value:e.value
  });
 }
 assert.equal(universe.length,frame.events.length);
 assert.equal(universe.filter(x=>x.rooted).length,rooted.size);
 return universe;
}
function scoreTuple(r,m){
 const a=m==='D1'?r.d1:r.d7,b=m==='D1'?r.d7:r.d1;
 // Prioridad estrictamente física, sin consultar la familia ni el valor actual.
 return [Number(a.far),a.maxDist,Number(b.far),b.maxDist,
  Number(r.rootFar),r.rootMaxDist,r.rootEvents];
}
function compareGeom(a,b,method){
 const aS=scoreTuple(a,method),bS=scoreTuple(b,method);
 for(let k=0;k<aS.length;k++)if(aS[k]!==bS[k])return bS[k]-aS[k];
 return tie(a,b);
}
function select(universe,method){
 const order=universe.slice().sort((a,b)=>compareGeom(a,b,method));
 const seen=new Set(),witnesses=[];
 for(const r of order){
  // Primera consulta de la familia DESPUES de congelar el orden geométrico.
  if(seen.has(r.family))continue;
  seen.add(r.family);
  if(witnesses.length<10)witnesses.push({family:r.family,value:r.value,
   key:r.key,source:r.source,cells:r.cells,rooted:r.rooted,features:{
    d1:r.d1,d7:r.d7,rootFar:r.rootFar,rootMaxDist:r.rootMaxDist,
    rootEvents:r.rootEvents
   }});
  if(witnesses.length===10)break;
 }
 assert.equal(witnesses.length,10,'Cupo insuficiente de 10 familias físicas');
 assert.equal(new Set(witnesses.map(x=>x.family)).size,10);
 return {top:witnesses.map(x=>x.family),witnesses};
}
function prepare(){
 assert.ok(!existsSync(BASE+'POST_115.json'),'Leak: POST present during PRE');
 assert.ok(!existsSync(BASE+'NOCTURNA_POST_DIAGNOSTICO.json'),'Leak: nocturnal POST present');
 const aSeal=json(ATLAS+'SELLO.json'),pSeal=json(GEOPREV+'SELLO.json');
 assert.equal(hash(read(ATLAS+'EVENTOS_PRE_115.json')),aSeal.routesPre);
 assert.equal(hash(read(ATLAS+'PRE_115.json')),aSeal.pre);
 assert.equal(hash(read(GEOPREV+'PRE_115.json')),pSeal.pre);
 assert.equal(pSeal.originalBase,BASE_SHA);
 assert.equal(pSeal.sourceEvents,aSeal.routesPre);
 const frames=json(ATLAS+'EVENTOS_PRE_115.json').rows;
 const prior=json(GEOPREV+'PRE_115.json').rows;
 assert.equal(frames.length,115);assert.equal(prior.length,115);
 const uniqueDays=[...new Set(frames.map(x=>x.date))].sort();
 assert.equal(uniqueDays.length,23);
 const frameMap=new Map(frames.map(x=>[rowKey(x),x]));
 assert.equal(frameMap.size,115);
 for(const f of frames)verifyEvents(f);
 let fullN=0,anchoredN=0,rootlessN=0,physicallyPreselected=0;
 const rows=frames.map((frame,i)=>{
  const old=prior[i];const roots=checkPrevious(old,frame);
  const d1=frameMap.get(minusDays(frame.date,1)+'|'+frame.turn)||null;
  const d7=frameMap.get(minusDays(frame.date,7)+'|'+frame.turn)||null;
  assert.ok(!d1||d1.date<frame.date);
  assert.ok(!d7||d7.date<frame.date);
  const all=featFrame(frame,roots,d1,d7),anchored=all.filter(x=>x.rooted);
  assert.ok(anchored.length>=10);
  const selections={};
  for(const m of ['D1','D7']){
   selections['A_'+m]=select(anchored,m);
   selections['F_'+m]=select(all,m);
  }
  assert.equal(old.original.length,10);
  assert.equal(old.byMethod.GEO_DESPLAZAMIENTO.top.length,10);
  const oldTop=old.byMethod.GEO_DESPLAZAMIENTO.top;
  const opening=Object.fromEntries(['D1','D7'].map(m=>[m,
   Object.fromEntries(KEYS.map(n=>[n,selections['F_'+m].witnesses.slice(0,n)
    .filter(x=>!x.rooted).map(x=>({family:x.family,key:x.key,source:x.source,cells:x.cells}))]))]));
  fullN+=all.length;anchoredN+=anchored.length;
  rootlessN+=all.length-anchored.length;
  physicallyPreselected+=new Set([...selections.F_D1.witnesses,...selections.F_D7.witnesses].map(x=>x.key)).size;
  return {date:frame.date,turn:frame.turn,priorD1:d1?.date??null,priorD7:d7?.date??null,
   universe:{full:all.length,anchored:anchored.length,unrooted:all.length-anchored.length},
   official:old.original,originalGeoShift:oldTop,
   selections,opening,
   candidates:all.map(x=>({key:x.key,source:x.source,cells:x.cells,
    family:x.family,value:x.value,rooted:x.rooted,rootEvents:x.rootEvents,
    rootFar:x.rootFar,rootMaxDist:x.rootMaxDist,d1:x.d1,d7:x.d7}))
  };
 });
 assert.equal(fullN,27900);
 assert.equal(anchoredN,8053);
 save('PRE_115.json',{createdAt:'2026-10-14',days:uniqueDays,cuts:115,
  summary:{fullN,anchoredN,rootlessN,physicallyPreselected},
  rows,notes:'Las familias y valores son lecturas posteriores de rutas ya ordenadas geométricamente; NO influyen en la prioridad. No hay resultado objetivo disponible en PRE.'});
 const seal={atlasRoutes:aSeal.routesPre,geoPrior:pSeal.pre,
  basePre:BASE_SHA,protocol:hash(read(PROTOCOL)),script:hash(read(SELF)),
  generatedPre:hash(read(OUT+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('VT3_FULL_GEO_PRE_OK',JSON.stringify({summary:{fullN,anchoredN,rootlessN},
  sample:rows.at(-1)&&{date:rows.at(-1).date,turn:rows.at(-1).turn,
   universes:rows.at(-1).universe,original:rows.at(-1).official.slice(0,3),
   rootedD1:rows.at(-1).selections.A_D1.top.slice(0,3),
   fullD1:rows.at(-1).selections.F_D1.top.slice(0,3),
   rootedD7:rows.at(-1).selections.A_D7.top.slice(0,3),
   fullD7:rows.at(-1).selections.F_D7.top.slice(0,3)},seal}));
}
function rng(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
function randomSubset(all,rand){
 // Elegir una permutación neutral sin reposición hasta tener diez familias únicas,
 // sin utilizar familia para priorizar el orden.
 const bag=all.slice(),seen=new Set(),out=[];
 for(let i=0;i<bag.length&&out.length<10;i++){
  const j=i+Math.floor(rand()*(bag.length-i));
  [bag[i],bag[j]]=[bag[j],bag[i]];
  const p=bag[i];
  if(!seen.has(p.family)){seen.add(p.family);out.push(p.family);}
 }
 assert.equal(out.length,10);
 return out;
}
const nats=xs=>Object.fromEntries(KEYS.map(k=>[k,xs.filter(x=>x['hit'+k]).length]));
const trial=(top,win,n)=>top.slice(0,n).some(f=>win.has(f));
const round=x=>Number(x.toFixed(5));
function comparePost(){
 const seal=json(OUT+'SELLO.json');
 assert.equal(seal.atlasRoutes,hash(read(ATLAS+'EVENTOS_PRE_115.json')));
 assert.equal(seal.geoPrior,hash(read(GEOPREV+'PRE_115.json')));
 assert.equal(seal.basePre,BASE_SHA);
 assert.equal(seal.protocol,hash(read(PROTOCOL)));
 assert.equal(seal.script,hash(read(SELF)));
 assert.equal(seal.generatedPre,hash(read(OUT+'PRE_115.json')));
 const src=json(OUT+'PRE_115.json'),rows=src.rows;
 const post=json(BASE+'POST_115.json').rows;
 assert.equal(rows.length,115);assert.equal(post.length,115);
 const scored=[],stats=Object.fromEntries(POLICIES.map(p=>[p,{top3:0,top5:0,top10:0}]));
 const opportunity={winningFamilyCutRecordsFull:0,winningFamilyCutRecordsAnchored:0,
  winningFamilyCutRecordsOnlyUnrooted:0,cutsWithOnlyUnrootedWinner:0,
  totalWinningFamilyCutRecords:0,selectedUnrootedTop3:{D1:0,D7:0},
  selectedUnrootedTop5:{D1:0,D7:0},selectedUnrootedTop10:{D1:0,D7:0},
  selectedUnrootedWinnersTop10:{D1:0,D7:0}};
 for(let i=0;i<115;i++){
  const r=rows[i],p=post[i];
  assert.equal(rowKey(r),rowKey(p));
  assert.equal(p.targets.length,5);
  const winners=new Set(p.targets.map(head=>{
   assert.match(head,/^\d{4}$/);
   return family(head.slice(-3));
  }));
  const fullSet=new Set(r.candidates.map(x=>x.family));
  const anchoredSet=new Set(r.candidates.filter(x=>x.rooted).map(x=>x.family));
  const onlyUnrooted=[...fullSet].filter(f=>!anchoredSet.has(f));
  const physWin=[...fullSet].filter(f=>winners.has(f));
  const anchorWin=[...anchoredSet].filter(f=>winners.has(f));
  const onlyWin=onlyUnrooted.filter(f=>winners.has(f));
  opportunity.totalWinningFamilyCutRecords+=new Set([...physWin]).size;
  opportunity.winningFamilyCutRecordsFull+=physWin.length;
  opportunity.winningFamilyCutRecordsAnchored+=anchorWin.length;
  opportunity.winningFamilyCutRecordsOnlyUnrooted+=onlyWin.length;
  opportunity.cutsWithOnlyUnrootedWinner+=Number(onlyWin.length>0);
  const lists={OFFICIAL:r.official,OLD_GEO_SHIFT:r.originalGeoShift};
  for(const m of ['D1','D7']){
   lists['A_'+m]=r.selections['A_'+m].top;
   lists['F_'+m]=r.selections['F_'+m].top;
   for(const n of KEYS){
    opportunity['selectedUnrootedTop'+n][m]+=r.selections['F_'+m].witnesses.slice(0,n).filter(x=>!x.rooted).length;
   }
   opportunity.selectedUnrootedWinnersTop10[m]+=
    r.selections['F_'+m].witnesses.filter(x=>!x.rooted&&winners.has(x.family)).length;
  }
  const choices={};
  for(const policy of POLICIES){
   const selected=lists[policy];
   assert.equal(selected.length,10);
   choices[policy]=Object.fromEntries(KEYS.map(n=>['hit'+n,trial(selected,winners,n)]));
   for(const n of KEYS)stats[policy]['top'+n]+=Number(choices[policy]['hit'+n]);
  }
  scored.push({date:r.date,turn:r.turn,opportunity:{full:fullSet.size,
   rooted:anchoredSet.size,onlyUnrooted:onlyUnrooted.length,
   winningFull:physWin,winningAnchored:anchorWin,winningOnlyUnrooted:onlyWin},
   choices,selected:lists});
 }
 assert.deepEqual([stats.OFFICIAL.top3,stats.OFFICIAL.top5,stats.OFFICIAL.top10],[5,8,15]);
 assert.deepEqual([stats.OLD_GEO_SHIFT.top3,stats.OLD_GEO_SHIFT.top5,stats.OLD_GEO_SHIFT.top10],[8,9,14]);
 // Desglose por mes y por turno sin elegir retrospectivamente un estrato favorable
 function group(indices){
  return Object.fromEntries(POLICIES.map(method=>[method,
   Object.fromEntries(KEYS.map(n=>['top'+n,indices.filter(i=>scored[i].choices[method]['hit'+n]).length]))]));
 }
 const months=[...new Set(rows.map(r=>r.date.slice(0,7)))].sort();
 const byMonth=Object.fromEntries(months.map(m=>[m,{
  cuts:rows.filter(r=>r.date.startsWith(m)).length,
  methods:group(rows.map((r,i)=>r.date.startsWith(m)?i:null).filter(i=>i!==null))}]));
 const byTurn=Object.fromEntries(TURNS.map(t=>[t,{
  cuts:rows.filter(r=>r.turn===t).length,
  methods:group(rows.map((r,i)=>r.turn===t?i:null).filter(i=>i!==null))}]));
 const paired=Object.fromEntries(['D1','D7'].map(m=>[m,
  Object.fromEntries(KEYS.map(n=>{
   const a='A_'+m,f='F_'+m,win='hit'+n;
   const gains=scored.filter(r=>r.choices[f][win]&&!r.choices[a][win]).map(rowKey);
   const losses=scored.filter(r=>!r.choices[f][win]&&r.choices[a][win]).map(rowKey);
   return ['top'+n,{gains,losses,delta:gains.length-losses.length}];
  }))]));
 const N=2000,rand=rng(20261014);
 const neutral=Object.fromEntries(['ANCLADA','COMPLETA'].map(t=>[t,
  Object.fromEntries(KEYS.map(n=>['top'+n,[]]))]));
 const populations=rows.map(r=>({
  ANCLADA:r.candidates.filter(x=>x.rooted),COMPLETA:r.candidates
 }));
 const goalSets=post.map(p=>new Set(p.targets.map(h=>family(h.slice(-3)))));
 for(let iteration=0;iteration<N;iteration++){
  const counters={ANCLADA:{top3:0,top5:0,top10:0},COMPLETA:{top3:0,top5:0,top10:0}};
  for(let i=0;i<rows.length;i++)for(const kind of ['ANCLADA','COMPLETA']){
   const selected=randomSubset(populations[i][kind],rand);
   for(const n of KEYS)counters[kind]['top'+n]+=Number(trial(selected,goalSets[i],n));
  }
  for(const kind of ['ANCLADA','COMPLETA'])for(const n of KEYS)
   neutral[kind]['top'+n].push(counters[kind]['top'+n]);
 }
 const neutralStats=Object.fromEntries(Object.entries(neutral).map(([kind,series])=>[kind,
  Object.fromEntries(Object.entries(series).map(([key,vals])=>{
   const sorted=vals.slice().sort((a,b)=>a-b);
   const counterpart=kind==='ANCLADA'?['A_D1','A_D7']:['F_D1','F_D7'];
   const actual=Object.fromEntries(counterpart.map(name=>[name,stats[name][key]]));
   return [key,{runs:N,mean:round(vals.reduce((a,b)=>a+b,0)/N),
    p05:sorted[99],median:sorted[999],p95:sorted[1899],
    actual,tails:Object.fromEntries(counterpart.map(name=>[name,
     round((vals.filter(x=>x>=actual[name]).length+1)/(N+1))]))}];
  }))]));
 const report={scope:'Retrospectiva exploratoria 115 cortes reutilizados. Sin valor predictivo confirmado.',
  days:23,cuts:115,universe:src.summary,
  score:stats,paired,opportunity,byMonth,byTurn,neutral:neutralStats,
  samples:scored.filter(x=>x.opportunity.winningOnlyUnrooted.length||x.choices.F_D1.hit3!==x.choices.A_D1.hit3).slice(0,70),
  interpretations:[
   'Elegibilidad se decide por geometría; número se lee después de congelar ruta.',
   'Acierto observable es familia VT3 presente en cabeza, no la posición geométrica.',
   'Los 115 cortes y scores anteriores fueron explorados repetidamente, y se testean D1/D7 y tres presupuestos, por lo que las colas neutrales son EXPLORATORIAS.',
   'Aun con mejora retrospectiva no se cambia main, motor Lalo, ranking oficial VT3, VT4 o sellos PRE auténticos.'],
  seal,sourcePostSha:hash(read(BASE+'POST_115.json'))};
 save('POST_115.json',{rows:scored});
 save('RESUMEN.json',report);
 console.log('VT3_FULL_GEO_POST_OK',JSON.stringify({score:stats,paired,opportunity,
  byMonth,neutral:neutralStats,universe:src.summary},null,2));
}
if(process.argv[2]==='pre'){mkdirSync(OUT,{recursive:true});prepare();}
else if(process.argv[2]==='post'){mkdirSync(OUT,{recursive:true});comparePost();}
else throw Error('Usage: pre|post');
