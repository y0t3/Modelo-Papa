import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const DATE='2026-10-14',TURN='Previa';
const BASE='auditorias/vt3-prospectivo-14oct2026-previa/';
const OLD='auditorias/vt3-atlas-genealogia-previa-14oct2026/';
const OUT='auditorias/vt3-posiciones-previa-14oct2026/';
const PROTO='PROTOCOLO_PRE_VT3_POSICIONES_PREVIA_14OCT2026.md';
const CODE='scripts/vt3-prospectivo-posiciones-previa-14oct2026.mjs';
const read=f=>readFileSync(f,'utf8'),json=f=>JSON.parse(read(f));
const hash=s=>createHash('sha256').update(s).digest('hex');
const save=(f,x)=>writeFileSync(OUT+f,JSON.stringify(x,null,2)+'\n');
const family=v=>[v,[...v].reverse().join('')].sort().join('/');
const pt=v=>{const [row,col]=v.split(':').map(Number);return {row,col};};
const sig=path=>{
 const x=path.map(p=>typeof p==='string'?pt(p):p);
 const mv=arr=>arr.slice(1).map((p,i)=>(p.row-arr[i].row)+','+(p.col-arr[i].col)).join(';');
 return [mv(x),mv([...x].reverse())].sort()[0];
};
const crd=p=>p.row+':'+p.col;
const coords=cells=>[cells.map(crd).join('>'),cells.slice().reverse().map(crd).join('>')].sort()[0];
const pos=p=>({row:Math.min(...p.map(x=>x.row)),col:Math.min(...p.map(x=>x.col))});
const sourceRank=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
function parseRoot(id,now){
 const x=id.split('|');
 assert.equal(x.length,8);
 const [date,period,turn,jurisdiction,head,kind,source,oldRoute]=x;
 assert.ok(date<now);
 assert.ok(period==='D−1'||period==='D−7');assert.equal(kind,'vt3');
 assert.match(head,/^\d{4}$/);
 const old=oldRoute.split('>');
 assert.equal(old.length,3);
 assert.equal(new Set(old).size,3);
 for(let i=1;i<3;i++){
  const a=pt(old[i-1]),b=pt(old[i]);
  assert.equal(Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col)),1);
 }
 return {id,date,period,turn,jurisdiction,head,source,old,shape:sig(old),pos:pos(old.map(pt))};
}
const rootEvent=r=>[r.date,r.turn,r.jurisdiction,r.head].join('|');
function allPhysical(values,source){
 const cells=[];
 values.forEach((v,row)=>{if(/^\d{2}$/.test(v))
   cells.push({row,col:0,digit:v[0]},{row,col:1,digit:v[1]});
  else assert.equal(v,'--','value missing token');});
 const visited=new Set(),out=[];
 const walk=path=>{
  if(path.length===3){
   const key=source+'|'+coords(path);
   if(!visited.has(key)){
    visited.add(key);out.push({key,source,path,shape:sig(path),pos:pos(path)});
   }return;
  }
  const last=path.at(-1);
  for(const next of cells){
   if(path.includes(next))continue;
   if(Math.max(Math.abs(next.row-last.row),Math.abs(next.col-last.col))===1)
    walk([...path,next]);
  }
 };
 for(const start of cells)walk([start]);
 return out;
}
function geomSort(paths,mode){
 const rank=(a,b)=>sourceRank.indexOf(a.source)-sourceRank.indexOf(b.source)||
  a.pos.row-b.pos.row||a.pos.col-b.pos.col||a.key.localeCompare(b.key);
 const out=paths.slice();
 if(mode==='GEO_RAICES')
  out.sort((a,b)=>b.rootEvents-a.rootEvents||Number(b.far)-Number(a.far)||
   b.maxShift-a.maxShift||rank(a,b));
 else if(mode==='GEO_DESPLAZAMIENTO')
  out.sort((a,b)=>Number(b.far)-Number(a.far)||b.maxShift-a.maxShift||
   b.rootEvents-a.rootEvents||rank(a,b));
 else if(mode==='HASH_NEUTRO')
  out.sort((a,b)=>hash(DATE+'|'+TURN+'|'+a.key).localeCompare(hash(DATE+'|'+TURN+'|'+b.key)));
 else throw Error('Unsupported '+mode);
 // Deliberately no access to path.digit, value or family while ranking.
 return out;
}
function finish(sorted){
 const chosen=[],seen=new Set();
 const strict={};
 for(let i=0;i<sorted.length;i++){
  if([3,5,10].includes(i+1))
   strict[i+1]={paths:sorted.slice(0,i+1).map(x=>x.key),
    families:[...new Set(sorted.slice(0,i+1).map(x=>family(x.path.map(p=>p.digit).join(''))))]};
  const r=sorted[i];const value=r.path.map(p=>p.digit).join(''),f=family(value);
  if(!seen.has(f)){
   seen.add(f);
   if(chosen.length<10)chosen.push({
    family:f,value,source:r.source,cells:r.path.map(crd),
    sourceHistoryEvents:r.rootEvents,far:r.far,maxShift:r.maxShift,geomKey:r.key});
  }
 }
 for(const k of [3,5,10])if(!strict[k])
  strict[k]={paths:sorted.slice(0,k).map(x=>x.key),
   families:[...new Set(sorted.slice(0,k).map(x=>family(x.path.map(p=>p.digit).join(''))))]};
 return {top3:chosen.slice(0,3).map(x=>x.family),
  top5:chosen.slice(0,5).map(x=>x.family),
  top10:chosen.slice(0,10).map(x=>x.family),
  chosen,strict};
}
assert.equal(process.argv[2],'pre');
mkdirSync(OUT,{recursive:true});
assert.ok(!existsSync(OUT+'POST_14OCT.json'),'POST cannot coexist with PRE');
const oldSeal=json(OLD+'SELLO.json'),originalSeal=json(BASE+'SELLO.json');
assert.equal(originalSeal.phase,'PRE_PENDIENTE_SORTEO');
assert.equal(oldSeal.originalPre,originalSeal.pre);
assert.equal(oldSeal.originalSeal,hash(read(BASE+'SELLO.json')));
assert.equal(oldSeal.pre,hash(read(OLD+'PRE_14OCT_PREVIA_ATLAS.json')));
assert.equal(originalSeal.pre,hash(read(BASE+'PRE_14OCT_PREVIA.json')));
const prior=json(BASE+'PRE_14OCT_PREVIA.json'),genealogy=json(OLD+'PRE_14OCT_PREVIA_ATLAS.json');
assert.equal(prior.date,DATE);assert.equal(prior.turn,TURN);
assert.equal(genealogy.date,DATE);assert.equal(genealogy.turn,TURN);
assert.equal(genealogy.targetHeadsLoaded,0);
assert.equal(prior.noTargetLoaded,true);
assert.deepEqual(genealogy.results.official.top10,prior.official.top10);
const visible=prior.knownSources.filter(x=>x.source==='prevNocturno');
assert.equal(visible.length,1);
assert.deepEqual(visible[0].values,genealogy.knownSource);
assert.ok(prior.knownSources.slice(1).every(x=>x.values.every(v=>v==='--')));
const rawRoots=new Map();
for(const f of genealogy.ranked)for(const p of f.connections){
 if(!rawRoots.has(p.rootId))rawRoots.set(p.rootId,parseRoot(p.rootId,DATE));
}
assert.ok(rawRoots.size>0);
const grouped=new Map();
for(const a of rawRoots.values()){
 const key=a.source+'|'+a.shape;
 if(!grouped.has(key))grouped.set(key,[]);
 grouped.get(key).push(a);
}
const paths=[];
for(const col of visible)for(const candidate of allPhysical(col.values,col.source)){
 const ancestors=grouped.get(candidate.source+'|'+candidate.shape)||[];
 if(!ancestors.length)continue;
 const distinct=new Set(ancestors.map(rootEvent));
 const maxShift=Math.max(...ancestors.map(a=>
  Math.abs(candidate.pos.row-a.pos.row)+Math.abs(candidate.pos.col-a.pos.col)));
 const far=ancestors.some(a=>Math.abs(candidate.pos.row-a.pos.row)>=2);
 paths.push({...candidate,rootEvents:distinct.size,oldRootPaths:ancestors.length,
  far,maxShift});
}
assert.ok(paths.length>=10);
const approaches=Object.fromEntries(['GEO_RAICES','GEO_DESPLAZAMIENTO','HASH_NEUTRO'].map(m=>
 [m,finish(geomSort(paths,m))]));
const output={
 date:DATE,turn:TURN,phase:'PRE_POSICIONES_ANTES_CIFRAS',
 createdAtUtc:new Date().toISOString(),
 previousProspectivePre:originalSeal.pre,
 previousGenealogyPre:oldSeal.pre,
 sources:visible.map(c=>({source:c.source,values:c.values})),
 targetHeadsLoaded:0,
 registeredHistoricRootPaths:rawRoots.size,
 uniqueHistoricWinningEvents:new Set([...rawRoots.values()].map(rootEvent)).size,
 physicalRoutes:visible.reduce((n,x)=>n+allPhysical(x.values,x.source).length,0),
 eligiblePositions:paths.length,
 actualLine:prior.official,
 paths:paths.map(p=>({source:p.source,cells:p.path.map(crd),
  geoKey:p.key,shape:p.shape,oldWinningEvents:p.rootEvents,far:p.far,maxShift:p.maxShift})),
 approaches,
 note:'Se ordena por geometría y huellas previas; cifras actuales se leen únicamente para consolidar familias al terminar el orden. No se conoce el resultado del sorteo.'
};
save('PRE_14OCT_PREVIA_POSICIONES.json',output);
const seal={
 phase:'PRE_PENDIENTE_SORTEO',date:DATE,turn:TURN,createdAtUtc:output.createdAtUtc,
 sourceOfficialSeal:hash(read(BASE+'SELLO.json')),sourceOfficialPre:originalSeal.pre,
 sourceGenealogySeal:hash(read(OLD+'SELLO.json')),sourceGenealogyPre:oldSeal.pre,
 protocol:hash(read(PROTO)),code:hash(read(CODE)),
 pre:hash(read(OUT+'PRE_14OCT_PREVIA_POSICIONES.json'))
};
save('SELLO.json',seal);
console.log('PRE_POSICIONES_14OCT_OK',JSON.stringify({
 date:DATE,time:output.createdAtUtc,heads:output.targetHeadsLoaded,
 roots:rawRoots.size,positions:paths.length,
 official:output.actualLine.top3,
 geoRoots:approaches.GEO_RAICES.top3,geoShift:approaches.GEO_DESPLAZAMIENTO.top3,
 geoShiftTop10:approaches.GEO_DESPLAZAMIENTO.top10,
 control:approaches.HASH_NEUTRO.top3,seal},null,2));
