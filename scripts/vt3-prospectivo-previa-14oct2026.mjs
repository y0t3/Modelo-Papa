import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';

const DATE='2026-10-14',TURN='Previa';
const OUT='auditorias/vt3-prospectivo-14oct2026-previa/';
const SRC='auditorias/vt3-cotejo-nocturna-13oct2026/OBJETIVOS_POST_13OCT.json';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const PROTO='PROTOCOLO_PRE_PROSPECTIVO_VT3_PREVIA_14OCT2026.md';
const SCRIPT='scripts/vt3-prospectivo-previa-14oct2026.mjs';
const JUR=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const previous12=[
 ['7447','0334','5276','4616','2403','----'],
 ['3825','9554','3107','2696','7634','----'],
 ['2436','3489','1099','8362','2400','----'],
 ['2716','3433','4801','4903','3245','----'],
 ['9851','1615','7242','8290','3264','----']
];
const read=p=>readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const sha=t=>createHash('sha256').update(t).digest('hex');
const save=(name,x)=>writeFileSync(OUT+name,JSON.stringify(x,null,2)+'\n');
assert.equal(process.argv[2],'pre','Solo se admite fase pre, no se leen resultados del 14/10');
mkdirSync(OUT,{recursive:true});
assert.ok(!existsSync(OUT+'POST_14OCT.json'),'POST no permitido durante PRE');
assert.ok(!existsSync('auditorias/vt3-prospectivo-14oct2026-previa/OBJETIVOS_14OCT.json'),'Hay objetivos presentes');
const raw=JSON.parse(gunzipSync(Buffer.from(read(FIXTURE).trim(),'base64')).toString('utf8'));
assert.equal(Object.keys(raw).length,30);
for(const date of ['2026-10-12','2026-10-13',DATE])assert.ok(!raw[date],'Fecha futura en fixture: '+date);
const prev13=json(SRC);
assert.equal(prev13.date,'2026-10-13');
assert.deepEqual(Object.keys(prev13.turns),['Previa','Primera','Matutino','Vespertino','Nocturno']);
assert.equal(prev13.jurisdictions.length,5);
for(const t of Object.keys(prev13.turns)){
 assert.equal(prev13.turns[t].length,5);
 for(const h of prev13.turns[t])assert.match(h,/^\d{4}$/);
}
raw['2026-10-12']=previous12;
raw['2026-10-13']=Object.keys(prev13.turns).map(t=>[...prev13.turns[t],'----']);
for(const d of ['2026-10-06','2026-10-07','2026-10-12','2026-10-13'])assert.ok(raw[d]);
const runtime='resultados/runtime-vt3-prospectivo-previa-14oct';
for(const k of ['domain','dates','paths','sheet','motorLalo','vt3Audit']){
 const dest=resolve(runtime,k+'.mjs');
 mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,stripTypeScriptTypes(read('src/'+k+'.ts')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
}
const load=async k=>import(pathToFileURL(resolve(runtime,k+'.mjs')).href);
const {TURNOS,diaVacio}=await load('domain');
const {buildSheet}=await load('sheet');
const {buildMotorLalo}=await load('motorLalo');
function draw(date){
 const day=diaVacio();
 assert.equal(raw[date].length,TURNOS.length);
 for(let i=0;i<TURNOS.length;i++)for(let k=0;k<JUR.length;k++){
  const h=raw[date][i][k];
  assert.ok(h==='----'||/^\d{4}$/.test(h),'Valor historico invalido');
  day[TURNOS[i]][JUR[k]]=h;
 }
 return day;
}
assert.equal(TURNOS[0],TURN);
const current=diaVacio();
const board=buildSheet(current,draw('2026-10-13'));
assert.equal(board.heads[TURN].length,0,'Previa objetivo contamina PRE');
assert.ok(board.columns.slice(1).every(col=>col.values.every(x=>x==='--')),'Columna futura cargada');
const history=[
 {date:'2026-10-13',period:'D−1',sheet:buildSheet(draw('2026-10-13'),draw('2026-10-12'))},
 {date:'2026-10-07',period:'D−7',sheet:buildSheet(draw('2026-10-07'),draw('2026-10-06'))}
];
assert.ok(history.every(h=>h.date<DATE));
const view=buildMotorLalo(board,DATE,TURN,history);
const rank=view.ranks.vt3;
assert.ok(rank.length>=10);
const original=rank.slice(0,10).map(x=>x.family);
const candidates=rank.slice(2,10);
const chosen=candidates.slice().sort((a,b)=>b.d1Roots-a.d1Roots||b.d7Roots-a.d7Roots||b.physicalBlocks-a.physicalBlocks||a.rank-b.rank)[0];
const neutral=candidates.slice().sort((a,b)=>sha(DATE+'|'+TURN+'|'+a.family).localeCompare(sha(DATE+'|'+TURN+'|'+b.family)))[0];
const promote=f=>[...original.slice(0,2),f,...original.slice(2).filter(x=>x!==f)];
const challenger=promote(chosen.family),hash=promote(neutral.family);
assert.deepEqual(challenger.slice(0,2),original.slice(0,2));
for(const p of [challenger,hash])assert.deepEqual([...p].sort(),[...original].sort());
const ranked=rank.map(x=>({
 family:x.family,rank:x.rank,d1:x.d1Roots,d7:x.d7Roots,
 sources:x.sourceCount,physicalBlocks:x.physicalBlocks,
 branchBlocks:x.branchBlocks,paths:x.paths.length,
 directRoots:x.directRoots, explanation:x.rationale,
 witnesses:x.paths.map(p=>({source:p.source,value:p.value,cells:p.cells}))
}));
const summary={date:DATE,turn:TURN,status:'PRE_PROSPECTIVO_SIN_CABEZAS_OBJETIVO',
 createdAtUtc:new Date().toISOString(),
 antecedents:[{date:'2026-10-13',period:'D−1'},{date:'2026-10-07',period:'D−7'}],
 knownSources:board.columns.map(x=>({source:x.id,values:x.values})),
 historicalRoots:view.roots.length,ranked,
 official:{top3:original.slice(0,3),top5:original.slice(0,5),top10:original},
 challengerD1:{selected:{family:chosen.family,previousRank:chosen.rank,d1:chosen.d1Roots,d7:chosen.d7Roots},
 top3:challenger.slice(0,3),top5:challenger.slice(0,5),top10:challenger},
 neutralHash:{selected:{family:neutral.family,previousRank:neutral.rank},
 top3:hash.slice(0,3),top5:hash.slice(0,5),top10:hash},
 noTargetLoaded:true, note:'Exclusivamente Previa: no hay resultados 14/10 ni columnas futuras.'};
save('PRE_14OCT_PREVIA.json',summary);
save('SELLO.json',{date:DATE,turn:TURN,phase:'PRE_PENDIENTE_SORTEO',
 createdAtUtc:summary.createdAtUtc,
 previousResults13:sha(read(SRC)),fixture:sha(read(FIXTURE)),protocol:sha(read(PROTO)),
 script:sha(read(SCRIPT)),motor:sha(read('src/motorLalo.ts')),
 audit:sha(read('src/vt3Audit.ts')),pre:sha(read(OUT+'PRE_14OCT_PREVIA.json'))});
console.log('PRE_14OCT_PREVIA_OK',JSON.stringify({at:summary.createdAtUtc,headsObjetivo:board.heads[TURN].length,
 sources:summary.knownSources,roots:summary.historicalRoots,
 official:summary.official,challengerD1:summary.challengerD1,neutralHash:summary.neutralHash,
 seal:json(OUT+'SELLO.json')},null,2));
