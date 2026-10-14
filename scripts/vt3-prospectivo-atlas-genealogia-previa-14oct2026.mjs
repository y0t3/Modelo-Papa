import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
const DATE='2026-10-14',TURN='Previa';
const BASE='auditorias/vt3-prospectivo-14oct2026-previa/';
const OUT='auditorias/vt3-atlas-genealogia-previa-14oct2026/';
const SRC='auditorias/vt3-cotejo-nocturna-13oct2026/OBJETIVOS_POST_13OCT.json';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const PROTO='PROTOCOLO_PRE_VT3_ATLAS_GENEALOGIA_PREVIA_14OCT2026.md';
const SELF='scripts/vt3-prospectivo-atlas-genealogia-previa-14oct2026.mjs';
const JUR=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const previous12=[
 ['7447','0334','5276','4616','2403','----'],
 ['3825','9554','3107','2696','7634','----'],
 ['2436','3489','1099','8362','2400','----'],
 ['2716','3433','4801','4903','3245','----'],
 ['9851','1615','7242','8290','3264','----']
];
const read=f=>readFileSync(f,'utf8'),json=f=>JSON.parse(read(f));
const hash=v=>createHash('sha256').update(v).digest('hex');
const save=(f,x)=>writeFileSync(OUT+f,JSON.stringify(x,null,2)+'\n');
const canonical=v=>[v,[...v].reverse().join('')].sort().join('/');
const pos=p=>({row:Math.min(...p.map(c=>c.row)),col:Math.min(...p.map(c=>c.col))});
const moveSig=p=>{
 const steps=q=>q.slice(1).map((a,i)=>(a.row-q[i].row)+','+(a.col-q[i].col)).join(';');
 return [steps(p),steps([...p].reverse())].sort()[0];
};
const toPoint=c=>{const [row,col]=c.split(':').map(Number);return {row,col};};
assert.equal(process.argv[2],'pre');
mkdirSync(OUT,{recursive:true});
assert.ok(!existsSync(OUT+'POST_14OCT.json'));
assert.ok(!existsSync(BASE+'POST_14OCT.json'));
const baseSeal=json(BASE+'SELLO.json'),prior=json(BASE+'PRE_14OCT_PREVIA.json');
assert.equal(baseSeal.pre,hash(read(BASE+'PRE_14OCT_PREVIA.json')));
assert.equal(baseSeal.phase,'PRE_PENDIENTE_SORTEO');
assert.equal(prior.noTargetLoaded,true);assert.equal(prior.date,DATE);assert.equal(prior.turn,TURN);
assert.equal(baseSeal.fixture,hash(read(FIXTURE)));
assert.equal(baseSeal.previousResults13,hash(read(SRC)));
assert.equal(baseSeal.motor,hash(read('src/motorLalo.ts')));
const raw=JSON.parse(gunzipSync(Buffer.from(read(FIXTURE).trim(),'base64')).toString('utf8'));
assert.equal(Object.keys(raw).length,30);
for(const d of ['2026-10-12','2026-10-13',DATE])assert.ok(!raw[d]);
const prior13=json(SRC);
assert.equal(prior13.date,'2026-10-13');
assert.deepEqual(Object.keys(prior13.turns),TURNS);
for(const t of TURNS)assert.equal(prior13.turns[t].length,5);
raw['2026-10-12']=previous12;
raw['2026-10-13']=TURNS.map(t=>[...prior13.turns[t],'----']);
const runtime='resultados/runtime-vt3-atlas-genealogia-previa-14oct';
for(const k of ['domain','dates','paths','sheet','motorLalo','vt3Audit']){
 const dest=resolve(runtime,k+'.mjs');
 mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,stripTypeScriptTypes(read('src/'+k+'.ts')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
}
const load=async k=>import(pathToFileURL(resolve(runtime,k+'.mjs')).href);
const {diaVacio}=await load('domain');
const {buildSheet}=await load('sheet');
const {buildMotorLalo}=await load('motorLalo');
function draw(date){
 const day=diaVacio();
 assert.equal(raw[date].length,TURNS.length);
 for(let i=0;i<TURNS.length;i++)for(let j=0;j<JUR.length;j++){
  const head=raw[date][i][j];
  assert.ok(head==='----'||/^\d{4}$/.test(head));
  day[TURNS[i]][JUR[j]]=head;
 }
 return day;
}
const sheet=buildSheet(diaVacio(),draw('2026-10-13'));
assert.equal(sheet.heads.Previa.length,0);
assert.ok(sheet.columns.slice(1).every(c=>c.values.every(v=>v==='--')));
const historical=[
 {date:'2026-10-13',period:'D−1',sheet:buildSheet(draw('2026-10-13'),draw('2026-10-12'))},
 {date:'2026-10-07',period:'D−7',sheet:buildSheet(draw('2026-10-07'),draw('2026-10-06'))}
];
const view=buildMotorLalo(sheet,DATE,TURN,historical);
assert.equal(view.roots.length,prior.historicalRoots);
const vt3=view.ranks.vt3;
assert.deepEqual(vt3.map(x=>x.family),prior.ranked.map(x=>x.family));
assert.deepEqual(vt3.map(x=>x.paths.length),prior.ranked.map(x=>x.paths));
for(let i=0;i<vt3.length;i++)
 assert.deepEqual(vt3[i].paths.map(p=>p.value),prior.ranked[i].witnesses.map(x=>x.value));
const rootmap=new Map(view.roots.map(x=>[x.id,x]));
const observed=vt3.map(f=>{
 const connections=[];
 const rootEvents=new Map();
 for(const p of f.paths)for(const id of p.rootIds){
  const root=rootmap.get(id);assert.ok(root,'Raíz no registrada '+id);
  assert.equal(root.sourceId,p.sourceId);
  assert.ok(root.date<DATE);
  const old=root.oldCells.map(toPoint);
  const current=p.path;
  assert.equal(current.length,3);assert.equal(old.length,3);
  const oldFamily=canonical(root.head.slice(-3));
  const deltaRow=pos(current).row-pos(old).row;
  const deltaCol=pos(current).col-pos(old).col;
  const mutation=moveSig(old)!==moveSig(current);
  const changedNumeric=oldFamily!==f.family;
  const row={rootId:id,rootDate:root.date,period:root.period,source:p.sourceId,
   oldHead:root.head,oldFamily,currentFamily:f.family,
   oldCells:root.oldCells,currentCells:current.map(c=>c.row+':'+c.col),
   deltaRow,deltaCol,mutation,changedNumeric};
  connections.push(row);
  const event=[root.date,root.oldTurn,root.jurisdiction,root.head].join('|');
  rootEvents.set(event,true);
 }
 const flags={
  MUTATION:connections.some(x=>x.mutation),
  SHIFT_BIG:connections.some(x=>!x.mutation&&Math.abs(x.deltaRow)>=2),
  CHANGE_NUMERIC:connections.some(x=>x.changedNumeric)
 };
 const score=3*Number(flags.MUTATION)+2*Number(flags.SHIFT_BIG)+Number(flags.CHANGE_NUMERIC);
 assert.equal(f.directRoots,rootEvents.size);
 return {family:f.family,rank:f.rank,flags,score,
  roots:rootEvents.size,routeConnections:connections.length,connections};
});
const original=prior.official.top10;
const third=observed.slice(2,10).sort((a,b)=>b.score-a.score||a.rank-b.rank)[0];
const eligible10=observed.filter(x=>x.rank>10&&x.rank<=30&&x.score>0)
 .sort((a,b)=>b.score-a.score||a.rank-b.rank);
const tenth=eligible10[0]||null;
const neutralSelect=(pool,role)=>pool.slice().sort((a,b)=>
 hash('GENEALOGIA_PRE_14OCT|'+role+'|'+a.family).localeCompare(hash('GENEALOGIA_PRE_14OCT|'+role+'|'+b.family)))[0]||null;
const neutral3=neutralSelect(observed.slice(2,10),'P3'),neutral10=neutralSelect(eligible10,'P10');
const promote=x=>[...original.slice(0,2),x.family,...original.slice(2).filter(f=>f!==x.family)];
const replace=x=>x?original.slice(0,9).concat(x.family):original;
const results={
 official:{top3:original.slice(0,3),top5:original.slice(0,5),top10:original},
 genealogyThird:{selected:third.family,originalRank:third.rank,
  top3:promote(third).slice(0,3),top5:promote(third).slice(0,5),top10:promote(third)},
 genealogyTenth:{selected:tenth?.family??null,originalRank:tenth?.rank??null,
  top3:replace(tenth).slice(0,3),top5:replace(tenth).slice(0,5),top10:replace(tenth)},
 neutralThird:{selected:neutral3.family,originalRank:neutral3.rank,
  top3:promote(neutral3).slice(0,3),top5:promote(neutral3).slice(0,5),top10:promote(neutral3)},
 neutralTenth:{selected:neutral10?.family??null,originalRank:neutral10?.rank??null,
  top3:replace(neutral10).slice(0,3),top5:replace(neutral10).slice(0,5),top10:replace(neutral10)}
};
for(const obj of Object.values(results))assert.equal(new Set(obj.top10).size,10);
assert.deepEqual(results.official.top3,prior.official.top3);
assert.deepEqual(new Set(results.genealogyThird.top10),new Set(original));
assert.deepEqual(results.genealogyTenth.top10.slice(0,9),original.slice(0,9));
const output={date:DATE,turn:TURN,phase:'PRE_PROSPECTIVO_GENEALOGIA',
 originalPreCreatedAtUtc:prior.createdAtUtc,createdAtUtc:new Date().toISOString(),
 originalPreHash:baseSeal.pre,knownSource:sheet.columns[0].values,
 targetHeadsLoaded:sheet.heads.Previa.length,rootCount:view.roots.length,
 ranked:observed,results,eligibility:{third:original.slice(2),tenth:eligible10.map(x=>x.family)},
 note:'PRE paralelo construido de forma independiente del POST. No reescribe el PRE original.'};
save('PRE_14OCT_PREVIA_ATLAS.json',output);
const seal={phase:'PRE_SELLADO_NO_SORTEO',date:DATE,turn:TURN,createdAtUtc:output.createdAtUtc,
 originalSeal:hash(read(BASE+'SELLO.json')),originalPre:baseSeal.pre,
 historicalFixture:baseSeal.fixture,previous13:baseSeal.previousResults13,motor:baseSeal.motor,
 protocol:hash(read(PROTO)),code:hash(read(SELF)),
 pre:hash(read(OUT+'PRE_14OCT_PREVIA_ATLAS.json'))};
save('SELLO.json',seal);
console.log('PRE_GENEALOGIA_14OCT_OK',JSON.stringify({timestamp:output.createdAtUtc,
 original:results.official.top3,genealogyThird:results.genealogyThird,
 genealogyTenth:results.genealogyTenth,neutralThird:results.neutralThird,
 roots:view.roots.length,targetHeads:output.targetHeadsLoaded,seal},null,2));
