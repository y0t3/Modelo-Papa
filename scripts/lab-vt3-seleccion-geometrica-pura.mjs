import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ATLAS='auditorias/vt3-atlas-cuatro-dimensiones-115-14oct2026/';
const BASE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-posiciones-geometricas-115-14oct2026/';
const PROTO='PROTOCOLO_VT3_SELECCION_GEOMETRICA_PURA_14OCT2026.md';
const FILE='scripts/lab-vt3-seleccion-geometrica-pura.mjs';
const REF_BASE='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const MODES=['GEO_RAICES','GEO_DESPLAZAMIENTO'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(f,x)=>writeFileSync(OUT+f,JSON.stringify(x,null,2)+'\n');
const canonical=v=>[v,[...v].reverse().join('')].sort().join('/');
const recKey=p=>{const a=p.cells.join('>'),b=[...p.cells].reverse().join('>');
 return p.source+'|'+[a,b].sort()[0];};
const moveSig=cells=>{
 const x=cells.map(p=>p.split(':').map(Number));
 const moves=path=>path.slice(1).map(([r,c],i)=>(r-path[i][0])+','+(c-path[i][1])).join(';');
 return [moves(x),moves([...x].reverse())].sort()[0];
};
const pos=cells=>({row:Math.min(...cells.map(s=>Number(s.split(':')[0]))),
 col:Math.min(...cells.map(s=>Number(s.split(':')[1])))});
const headKey=a=>[a.date,a.turn,a.jurisdiction,a.head].join('|');
function root(id,now){
 const parts=id.split('|');
 assert.equal(parts.length,8,'Unexpected historical rootId '+id);
 const [date,period,turn,jurisdiction,head,kind,source,oldRoute]=parts;
 assert.ok(date<now,'future root '+date+' >= '+now);
 assert.match(head,/^\d{4}$/);assert.equal(kind,'vt3');
 assert.ok(['D−1','D−7'].includes(period));
 assert.ok(SOURCES.includes(source));
 const cells=oldRoute.split('>');
 assert.equal(cells.length,3);
 assert.equal(new Set(cells).size,3);
 for(let i=0;i<cells.length;i++){
  const [r,c]=cells[i].split(':').map(Number);
  assert.ok(Number.isInteger(r)&&r>=0&&r<6&&Number.isInteger(c)&&c>=0&&c<2);
  if(i){const [rr,cc]=cells[i-1].split(':').map(Number);
   assert.equal(Math.max(Math.abs(r-rr),Math.abs(c-cc)),1);}
 }
 return {id,date,period,turn,jurisdiction,head,source,cells,
  shape:moveSig(cells),position:pos(cells)};
}
function assertPath(e,cut){
 assert.equal(e.cells.length,3);
 assert.equal(new Set(e.cells).size,3);
 assert.equal(moveSig(e.cells),e.shape);
 assert.deepEqual(pos(e.cells),e.pos);
 assert.ok(SOURCES.indexOf(e.source)>=0);
 assert.ok(SOURCES.indexOf(e.source)<=['Previa','Primera','Matutino','Vespertino','Nocturno'].indexOf(cut.turn));
 assert.equal(canonical(e.value),e.family);
 for(let i=1;i<3;i++){
  const [r,c]=e.cells[i].split(':').map(Number);
  const [rr,cc]=e.cells[i-1].split(':').map(Number);
  assert.equal(Math.max(Math.abs(r-rr),Math.abs(c-cc)),1);
 }
}
function geometricalPool(frame,ranking){
 assert.equal(frame.date,ranking.date);assert.equal(frame.turn,ranking.turn);
 const history=new Map();
 for(const e of frame.events){
  assertPath(e,frame);
  for(const id of e.rootIds){
   if(!history.has(id))history.set(id,root(id,frame.date));
  }
 }
 const known=new Map();
 for(const ancestor of history.values()){
  const k=ancestor.source+'|'+ancestor.shape;
  if(!known.has(k))known.set(k,[]);
  known.get(k).push(ancestor);
 }
 const seen=new Set(),eligible=[];
 let anchoredInPool=0;
 for(const e of frame.events){
  const geoKey=recKey(e);
  assert.ok(!seen.has(geoKey),'ruta duplicada '+frame.date+frame.turn+geoKey);
  seen.add(geoKey);
  const roots=known.get(e.source+'|'+e.shape)||[];
  if(!roots.length)continue;
  const present={source:e.source,shape:e.shape,cells:e.cells,
   pos:e.pos,geoKey, family:e.family,value:e.value};
  const events=new Map();
  let maxShift=0,far=false,originatingRootIds=0,d7=0;
  for(const a of roots){
   // Evidencia antigua solo para geometría y fuente; no emparejar VALORES actuales.
   assert.equal(a.shape,e.shape);assert.equal(a.source,e.source);
   const shift=Math.abs(e.pos.row-a.position.row)+Math.abs(e.pos.col-a.position.col);
   maxShift=Math.max(maxShift,shift);
   far ||=Math.abs(e.pos.row-a.position.row)>=2;
   originatingRootIds++;
   const k=headKey(a);
   if(!events.has(k)){events.set(k,a);d7+=Number(a.period==='D−7');}
  }
  assert.ok(originatingRootIds>=events.size);
  const x={...present,ancestorEvents:events.size,d7Events:d7,rootPaths:originatingRootIds,
   far, maxShift};
  eligible.push(x);
  if(e.anchored)anchoredInPool++;
 }
 assert.ok(eligible.length>=3,'Menos de tres posiciones elegibles '+frame.date+'|'+frame.turn);
 assert.equal(eligible.length,new Set(eligible.map(x=>x.geoKey)).size);
 return {eligible,availablePhysical:frame.events.length,roots:history.size,anchoredInPool,
  uniqueOldWinningEvents:new Set([...history.values()].map(headKey)).size};
}
const geomTie=(a,b)=>{
 const sourceDiff=SOURCES.indexOf(a.source)-SOURCES.indexOf(b.source);
 return sourceDiff||a.pos.row-b.pos.row||a.pos.col-b.pos.col||a.geoKey.localeCompare(b.geoKey);
};
function sortGeom(pool,policy){
 const arr=pool.slice();
 if(policy==='GEO_RAICES')arr.sort((a,b)=>
  b.ancestorEvents-a.ancestorEvents||Number(b.far)-Number(a.far)||
  b.maxShift-a.maxShift||geomTie(a,b));
 else if(policy==='GEO_DESPLAZAMIENTO')arr.sort((a,b)=>
  Number(b.far)-Number(a.far)||b.maxShift-a.maxShift||
  b.ancestorEvents-a.ancestorEvents||geomTie(a,b));
 else throw Error('Política desconocida '+policy);
 // Nunca se consulta la familia ni los dígitos antes de terminar este orden.
 return arr;
}
function realize(order){
 const seen=new Set(),unique=[],strict={};
 for(let i=0;i<order.length;i++){
  if([3,5,10].includes(i+1)){
   const first=order.slice(0,i+1);
   strict[i+1]={routes:first.map(x=>x.geoKey),
    families:[...new Set(first.map(x=>x.family))]};
  }
  // DESPUÉS del orden geométrico: leer números, consolidar duplicados.
  const r=order[i];
  if(!seen.has(r.family)){seen.add(r.family);
   if(unique.length<10)unique.push({geoKey:r.geoKey,source:r.source,
    cells:r.cells,ancestorEvents:r.ancestorEvents,far:r.far,maxShift:r.maxShift,
    family:r.family,value:r.value});}
 }
 for(const k of [3,5,10])if(!strict[k]){
  const prefix=order.slice(0,k);
  strict[k]={routes:prefix.map(x=>x.geoKey),families:[...new Set(prefix.map(x=>x.family))]};
 }
 return {top:unique.map(x=>x.family), witnesses:unique,strict};
}
function pre(){
 assert.ok(!existsSync(BASE+'POST_115.json'),'POST accesible en PRE');
 assert.ok(!existsSync(BASE+'NOCTURNA_POST_DIAGNOSTICO.json'));
 const atlasSeal=json(ATLAS+'SELLO.json');
 assert.equal(atlasSeal.sourcePre,REF_BASE);
 assert.equal(atlasSeal.pre,sha(read(ATLAS+'PRE_115.json')));
 assert.equal(atlasSeal.routesPre,sha(read(ATLAS+'EVENTOS_PRE_115.json')));
 const src=json(ATLAS+'EVENTOS_PRE_115.json').rows;
 const sourceRank=json(ATLAS+'PRE_115.json').rows;
 assert.equal(src.length,115);assert.equal(sourceRank.length,115);
 let allEligible=0,allPhysical=0,totalRoots=0, rootEvents=0;
 const rows=src.map((row,i)=>{
  const rank=sourceRank[i];
  const p=geometricalPool(row,rank);
  allEligible+=p.eligible.length;allPhysical+=p.availablePhysical;
  totalRoots+=p.roots;rootEvents+=p.uniqueOldWinningEvents;
  const byMethod=Object.fromEntries(MODES.map(m=>{
   const ordered=sortGeom(p.eligible,m);
   return [m,realize(ordered)];
  }));
  assert.equal(rank.ranking.OFICIAL.length,10);
  const candidates=p.eligible.map(x=>({geoKey:x.geoKey,source:x.source,cells:x.cells,
   pos:x.pos,shape:x.shape,family:x.family,value:x.value,ancestors:x.ancestorEvents,
   d7:x.d7Events,rootPaths:x.rootPaths,far:x.far,maxShift:x.maxShift}));
  // Orden neutral se sortea solo en POST pero población/orden geométrico queda SELLADO
  return {date:row.date,turn:row.turn,eligible:p.eligible.length,physical:p.availablePhysical,
   historicalRootPaths:p.roots,historicalWinningEvents:p.uniqueOldWinningEvents,
   original:rank.ranking.OFICIAL,candidates,byMethod};
 });
 const out={date:'2026-10-14',protocolVersion:'GEOMETRIA_ANTES_QUE_CIFRAS_V1',
  cuts:115,summary:{allPhysical,allEligible,totalRoots,rootEvents,
   cutsWithFullTen:Object.fromEntries(MODES.map(m=>[m,rows.filter(x=>x.byMethod[m].top.length===10).length]))},
  rows,limit:'Son elecciones basadas en posiciones PRE; el resultado del sorteo no publica coordenadas.'};
 save('PRE_115.json',out);
 const seal={protocol:sha(read(PROTO)),code:sha(read(FILE)),
  sourceAtlasPre:atlasSeal.pre,sourceEvents:atlasSeal.routesPre,
  originalBase:REF_BASE,pre:sha(read(OUT+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('GEO_PRIMERO_PRE_OK',JSON.stringify({summary:out.summary,seal,
  sample:rows.at(-1)&&{date:rows.at(-1).date,turn:rows.at(-1).turn,
   eligible:rows.at(-1).eligible,official:rows.at(-1).original,
   geom:rows.at(-1).byMethod.GEO_RAICES.witnesses.slice(0,5)}}));
}
function prng(seed){
 let s=seed>>>0;
 return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};
}
function chooseUniform(pool,rand){
 const arr=pool.slice(),order=[];
 let upto=0,unique=new Set();
 while(upto<arr.length&&unique.size<10){
  const j=upto+Math.floor(rand()*(arr.length-upto));
  [arr[upto],arr[j]]=[arr[j],arr[upto]];
  const pick=arr[upto++];
  order.push(pick);
  unique.add(pick.family);
 }
 // Uniform random order, only first ~10–many required for scoring.
 return realize(order);
}
const trial=(names,wins,howMany)=>names.slice(0,howMany).some(x=>wins.has(x));
function post(){
 const seal=json(OUT+'SELLO.json');
 assert.equal(seal.protocol,sha(read(PROTO)));
 assert.equal(seal.code,sha(read(FILE)));
 assert.equal(seal.pre,sha(read(OUT+'PRE_115.json')));
 assert.equal(seal.sourceAtlasPre,sha(read(ATLAS+'PRE_115.json')));
 assert.equal(seal.sourceEvents,sha(read(ATLAS+'EVENTOS_PRE_115.json')));
 assert.equal(seal.originalBase,REF_BASE);
 const obj=json(OUT+'PRE_115.json'),rows=obj.rows;
 const posts=json(BASE+'POST_115.json').rows;
 assert.equal(rows.length,115);assert.equal(posts.length,115);
 const wins=posts.map((p,i)=>{
  assert.equal(rows[i].date,p.date);assert.equal(rows[i].turn,p.turn);
  assert.equal(p.targets.length,5);
  for(const h of p.targets)assert.match(h,/^\d{4}$/);
  return new Set(p.targets.map(h=>canonical(h.slice(-3))));
 });
 const keys=['OFICIAL',...MODES];
 const score=Object.fromEntries(keys.map(k=>[k,{top3:0,top5:0,top10:0}]));
 const strict=Object.fromEntries(MODES.map(k=>[k,{top3:0,top5:0,top10:0,
  sumUnique3:0,sumUnique5:0,sumUnique10:0}]));
 const scored=[];
 for(let i=0;i<115;i++){
  const x=rows[i],w=wins[i],observed={};
  const original=x.original;
  for(const k of ['OFICIAL',...MODES]){
   const top=k==='OFICIAL'?original:x.byMethod[k].top;
   observed[k]={top3:trial(top,w,3),top5:trial(top,w,5),
    top10:trial(top,w,10),families:top};
   for(const budget of [3,5,10])score[k]['top'+budget]+=Number(observed[k]['top'+budget]);
  }
  for(const k of MODES)for(const n of [3,5,10]){
   const names=x.byMethod[k].strict[n].families;
   strict[k]['top'+n]+=Number(trial(names,w,n));
   strict[k]['sumUnique'+n]+=names.length;
  }
  scored.push({date:x.date,turn:x.turn,eligible:x.eligible,
   official:observed.OFICIAL,geoRoots:observed.GEO_RAICES,
   geoShift:observed.GEO_DESPLAZAMIENTO});
 }
 assert.deepEqual([score.OFICIAL.top3,score.OFICIAL.top5,score.OFICIAL.top10],[5,8,15]);
 const random=prng(20261014);
 const N=2000, distributions={top3:[],top5:[],top10:[]};
 for(let t=0;t<N;t++){
  let counts={top3:0,top5:0,top10:0};
  for(let i=0;i<115;i++){
   const x=rows[i],out=chooseUniform(x.candidates,random),w=wins[i];
   for(const n of [3,5,10])counts['top'+n]+=Number(trial(out.top,w,n));
  }
  for(const k of ['top3','top5','top10'])distributions[k].push(counts[k]);
 }
 const neutral=Object.fromEntries(Object.entries(distributions).map(([n,values])=>{
  const sorted=values.slice().sort((a,b)=>a-b);
  return [n,{runs:N,mean:Number((values.reduce((s,v)=>s+v,0)/N).toFixed(4)),
   p05:sorted[99],median:sorted[999],p95:sorted[1899],max:sorted.at(-1),
   tails:Object.fromEntries(MODES.map(k=>[k,
    (values.filter(v=>v>=score[k][n]).length+1)/(N+1)]))}];
 }));
 const familyTotals=Object.fromEntries(MODES.map(k=>[k,{
  avgRoutesFor3:Number((strict[k].sumUnique3/115).toFixed(4)),
  avgRoutesFor5:Number((strict[k].sumUnique5/115).toFixed(4)),
  avgRoutesFor10:Number((strict[k].sumUnique10/115).toFixed(4)),
  complete10:rows.filter(r=>r.byMethod[k].top.length===10).length}]));
 const paired=Object.fromEntries(MODES.map(k=>{
  let gains3=[],losses3=[],gains5=[],losses5=[],gains10=[],losses10=[];
  for(const c of scored)for(const n of [3,5,10]){
   const y=c[k==='GEO_RAICES'?'geoRoots':'geoShift']['top'+n];
   const old=c.official['top'+n],id=c.date+'|'+c.turn;
   if(y&&!old){if(n===3)gains3.push(id);else if(n===5)gains5.push(id);else gains10.push(id);}
   else if(old&&!y){if(n===3)losses3.push(id);else if(n===5)losses5.push(id);else losses10.push(id);}
  }
  return [k,{gains3,losses3,gains5,losses5,gains10,losses10}];
 }));
 const report={scope:'Histórico exploratorio 115 cortes; no es prospectivo ni predice coordenadas sorteadas',
  days:23,cuts:115,
  opportunity:obj.summary,score,strict,familyTotals,paired,neutral,
  samples:scored.filter((x,i)=>i%5===4||paired.GEO_RAICES.gains3.includes(x.date+'|'+x.turn)).slice(0,30),
  notes:[
   'El orden de rutas se calcula sin mirar números actuales; la familia se lee y deduplica recién después.',
   'La bolsa de raíces antiguas se obtiene de rootIds existentes, después se unen TODAS las posiciones por fuente y firma, sin imponer familia actual.',
   'Un acierto geométrico único no es observable en la quiniela; sólo se mide si la terna leída en PRE salió entre las cinco cabezas.',
   'Las 23 fechas se emplearon previamente muchas veces; este cotejo no es evidencia de poder predictivo.',
   'El modelo geométrico no cambió src/motorLalo.ts, rankings oficiales, VT4, ni sellos prospectivos.'
  ],seal,postHash:sha(read(BASE+'POST_115.json'))};
 save('POST_115.json',{rows:scored});
 save('RESUMEN.json',report);
 console.log('GEO_PRIMERO_POST_OK',JSON.stringify({score,strict,familyTotals,
  paired,neutral,opportunity:obj.summary},null,2));
}
if(process.argv[2]==='pre'){mkdirSync(OUT,{recursive:true});pre();}
else if(process.argv[2]==='post'){mkdirSync(OUT,{recursive:true});post();}
else throw Error('Esperado pre|post');
