import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';

const OUT='auditorias/vt3-en-vivo-13oct2026/';
const APP='lab-vt3-turnos-13oct2026-pre-primera-sello-mat';
const SOURCE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const JUR=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const DATE='2026-10-13';
const HEADS_PUBLISHED={
 Previa:['6448','6337','5546','5119','1495'],
 Primera:['5485','0310','8857','3385','4084']
};
const sha=s=>createHash('sha256').update(s).digest('hex');
const jread=p=>JSON.parse(readFileSync(p,'utf8'));
const read=p=>readFileSync(p,'utf8');
const save=(p,v)=>writeFileSync(OUT+p,JSON.stringify(v,null,2)+'\n');
const canon=h=>{const x=h.slice(-3);return[x,[...x].reverse().join('')].sort().join('/')};
mkdirSync(OUT,{recursive:true});
const runtime='resultados/runtime-vt3-13oct-live';
for(const k of ['domain','dates','paths','sheet','motorLalo','vt3Audit']){
 const dest=resolve(runtime,k+'.mjs');mkdirSync(dirname(dest),{recursive:true});
 const js=stripTypeScriptTypes(read('src/'+k+'.ts')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,path)=>"from '"+path+".mjs'");
 writeFileSync(dest,js);
}
const load=async k=>import(pathToFileURL(resolve(runtime,k+'.mjs')).href);
const {TURNOS,diaVacio}=await load('domain');
const {buildSheet}=await load('sheet');
const {buildMotorLalo}=await load('motorLalo');
const {auditVt3Family}=await load('vt3Audit');
const raw=JSON.parse(gunzipSync(Buffer.from(read(SOURCE).trim(),'base64')).toString('utf8'));
assert.equal(Object.keys(raw).length,30);
assert.ok(!raw[DATE],'No debe existir el día objetivo en el fixture histórico');
// El fixture histórico de 30 fechas termina el 10/10. Agregar como D−1
// la jornada del lunes 12/10 ya PUBLICADA; nunca son objetivos del 13/10.
// Cabezas Ciudad/Provincia/Córdoba/Santa Fé/Entre Ríos verificadas en
// quinielacorrentina.com, lanacion.com.ar, tujugada.com.ar y fuentes oficiales.
// Montevideo se conserva ---- porque no hay cabeza publicada verificable
// para 12/10; nunca se inventa la sexta cifra del tablero.
raw['2026-10-12']=[
 ['7447','0334','5276','4616','2403','----'],
 ['3825','9554','3107','2696','7634','----'],
 ['2436','3489','1099','8362','2400','----'],
 ['2716','3433','4801','4903','3245','----'],
 ['9851','1615','7242','8290','3264','----']
];
for(const date of ['2026-10-05','2026-10-06','2026-10-10','2026-10-12'])assert.ok(raw[date]);
function draw(d){
 const result=diaVacio();
 for(let t=0;t<TURNOS.length;t++)
  for(let j=0;j<JUR.length;j++)result[TURNOS[t]][JUR[j]]=raw[d][t][j];
 return result;
}
const LAST='2026-10-12', BEFORE_LAST='2026-10-10', D7='2026-10-06', D7PREV='2026-10-05';
const history=[
 {date:LAST,period:'D−1',sheet:buildSheet(draw(LAST),draw(BEFORE_LAST))},
 {date:D7,period:'D−7',sheet:buildSheet(draw(D7),draw(D7PREV))}
];
assert.equal(history.length,2);
function stage(turn){
 const targetIdx=TURNOS.indexOf(turn);
 const now=diaVacio();
 for(let ti=0;ti<targetIdx;ti++){
  const earlier=TURNOS[ti],list=HEADS_PUBLISHED[earlier];
  assert.ok(list?.length===5,'Corte anterior incompleto: '+earlier);
  for(let j=0;j<5;j++)now[earlier][JUR[j]]=list[j];
 }
 const sheet=buildSheet(now,draw(LAST));
 assert.equal(sheet.heads[turn].length,0,'Una cabeza objetivo entró en PRE');
 for(const col of sheet.columns.slice(targetIdx+1))
  assert.ok(col.values.every(x=>x==='--'),'Columna futura disponible en PRE');
 const view=buildMotorLalo(sheet,DATE,turn,history);
 const top=view.ranks.vt3;
 assert.ok(top.length>=10);
 const inventorySources=sheet.columns.slice(0,targetIdx+1).map(x=>({source:x.id,values:x.values}));
 return {turn,sheet,view,rootCount:view.roots.length,
  sourceColumns:inventorySources,
  rankings:top.map(x=>({
   family:x.family,rank:x.rank,paths:x.paths.length,
   sources:x.sourceCount,physicalBlocks:x.physicalBlocks,branchBlocks:x.branchBlocks,
   d1:x.d1Roots,d7:x.d7Roots,roots:x.directRoots,explanation:x.rationale
  })),
  top3:top.slice(0,3).map(x=>x.family),
  top5:top.slice(0,5).map(x=>x.family),
  top10:top.slice(0,10).map(x=>x.family)};
}
const turns=['Previa','Primera','Matutino'];
const staged=turns.map(stage);
assert.deepEqual(staged.map(x=>x.turn),turns);
const trim=s=>({
 date:DATE,turn:s.turn,sourceColumns:s.sourceColumns,
 previousDates:[LAST,D7],rootCount:s.rootCount,
 ranking:s.rankings,top3:s.top3,top5:s.top5,top10:s.top10
});
const sealPath='MATUTINA_PRE_SELLADA.json';
if(process.argv[2]==='pre'){
 const entry=staged.find(x=>x.turn==='Matutino');
 const mat=trim(entry);
 mat.sealedAtUtc=new Date().toISOString();
 mat.note='PRE Matutina antes de resultado: con Previa y Primera conocidas; no contiene Matutina 13/10/2026.';
 const prelim={date:DATE,
  note:'Reproducción retrospectiva de cortes ya sorteados; NO fueron sellados antes de Previa ni Primera.',
  asOfUtc:new Date().toISOString(),stages:staged.slice(0,2).map(trim)};
 save('PREVIA_PRIMERA_RECONSTRUIDAS_PRE.json',prelim);
 save(sealPath,mat);
 save('SELLO.json',{date:DATE,
  matutina:sha(read(OUT+sealPath)),
  code:sha(read('src/motorLalo.ts')),
  audit:sha(read('src/vt3Audit.ts')),
  script:sha(read('scripts/lab-vt3-en-vivo-13oct2026.mjs')),
  fixture:sha(read(SOURCE)),phase:'MATUTINA_PRE_SIN_RESULTADOS'});
 console.log('LIVE_VT3_PRE_OK',JSON.stringify({
  sealedAtUtc:mat.sealedAtUtc,top3Matutina:mat.top3,top10Matutina:mat.top10,
  sources:mat.sourceColumns,rootCount:mat.rootCount,
  earlierTop3:staged.slice(0,2).map(x=>({turn:x.turn,top3:x.top3,top10:x.top10}))
 },null,2));
}else if(process.argv[2]==='post'){
 const mat=jread(OUT+sealPath),seal=jread(OUT+'SELLO.json');
 assert.equal(sha(read(OUT+sealPath)),seal.matutina);
 assert.equal(sha(read('src/motorLalo.ts')),seal.code);
 assert.equal(sha(read('src/vt3Audit.ts')),seal.audit);
 assert.equal(sha(read('scripts/lab-vt3-en-vivo-13oct2026.mjs')),seal.script);
 assert.equal(sha(read(SOURCE)),seal.fixture);
 assert.deepEqual(staged[2].top10,mat.top10,'Ranking Matutino mutado');
 const outcome=[];
 for(let n=0;n<2;n++){
  const x=staged[n],drawn=HEADS_PUBLISHED[x.turn];
  assert.equal(drawn.length,5);
  const heads=drawn.map((head,j)=>{
   const d=auditVt3Family(x.sheet,x.view,x.turn,head);
   assert.ok(d);
   return {jurisdiction:JUR[j],head,...d};
  });
  const winners=[...new Set(drawn.map(canon))];
  const allPhys=heads.filter(x=>x.physicalRoutes>0);
  const available=heads.filter(x=>x.officialRank!==null);
  const row={date:DATE,turn:x.turn,roots:x.rootCount,
   heads:heads.map(x=>({
    jurisdiction:x.jurisdiction,head:x.head,family:x.family,status:x.status,rank:x.officialRank,
    physicalRoutes:x.physicalRoutes,admittedRoutes:x.admittedRoutes,
    sources:x.physicalSources,d1:x.d1Events,d7:x.d7Events,
    branchBlocks:x.branchBlocks,
    priorityReasons:x.priorityReasons,
    routes:x.routes.map(r=>({source:r.source,value:r.value,cells:r.cells,admitted:r.admitted,
     rootEvents:r.rootEvents}))
   })),
   winFamilies:winners,physicallyPossible:allPhys.length,admittedFamilies:available.length,
   top3Hit:heads.some(h=>h.top3),top5Hit:heads.some(h=>h.officialRank!==null&&h.officialRank<=5),
   top10Hit:heads.some(h=>h.top10),
   top3:x.top3,top5:x.top5,top10:x.top10,
   note:'Reconstrucción PRE de turno ya sorteado (no es pronóstico sellado antes del sorteo).'};
  outcome.push(row);
 }
 const totals={cuts:2,physicalOutcomeHeads:outcome.reduce((s,x)=>s+x.physicallyPossible,0),
  admittedOutcomeHeads:outcome.reduce((s,x)=>s+x.admittedFamilies,0),
  top3:outcome.filter(x=>x.top3Hit).length,
  top5:outcome.filter(x=>x.top5Hit).length,top10:outcome.filter(x=>x.top10Hit).length};
 save('POST_PREVIA_PRIMERA.json',{rows:outcome,totals,
  disclaimer:'Solo se leyeron como objetivos las 10 cabezas conocidas de Previa/Primera; Matutina continúa sin resultado en este archivo.'});
 save('RESUMEN.json',{date:DATE,asOfUtc:new Date().toISOString(),totals,
  firstTwo:outcome.map(x=>({turn:x.turn,top3:x.top3,top10:x.top10,
   heads:x.heads.map(z=>({head:z.head,family:z.family,rank:z.rank,status:z.status,
    physicalRoutes:z.physicalRoutes,d1:z.d1,d7:z.d7,reason:z.priorityReasons[0]?.decisiveCriterion})),
   top3Hit:x.top3Hit,top10Hit:x.top10Hit})),
  matutina:{seal:seal.matutina,sealedAtUtc:mat.sealedAtUtc,
   top3:mat.top3,top5:mat.top5,top10:mat.top10,
   sources:mat.sourceColumns.map(c=>c.source),
   noTargetLoaded:true},
  warning:'Los cortes Previa y Primera se reconstruyeron después de publicarse. Solo Matutina se selló como pronóstico previo.'});
 console.log('LIVE_VT3_POST_OK',JSON.stringify(jread(OUT+'RESUMEN.json'),null,2));
}else throw Error('Uso: pre|post');
