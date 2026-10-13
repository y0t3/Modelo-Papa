import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';

const OUT='auditorias/vt4-13oct2026/';
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

const {findPaths}=await load('paths');
const originalDir='auditorias/vt3-en-vivo-13oct2026/';
const sealSource=readFileSync(originalDir+'MATUTINA_PRE_SELLADA.json','utf8');
const originalMat=JSON.parse(sealSource);
const originalSHA='067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41';
assert.equal(sha(sealSource),originalSHA);
assert.equal(originalMat.sealedAtUtc,'2026-10-13T16:52:03.733Z');
assert.deepEqual(staged[2].top10,originalMat.top10);
assert.deepEqual(staged[2].sourceColumns,originalMat.sourceColumns);
assert.equal(staged[2].rootCount,originalMat.rootCount);
const origEarly=jread(originalDir+'PREVIA_PRIMERA_RECONSTRUIDAS_PRE.json').stages;
for(let i=0;i<2;i++){
 assert.equal(origEarly[i].turn,staged[i].turn);
 assert.deepEqual(origEarly[i].top10,staged[i].top10);
 assert.deepEqual(origEarly[i].sourceColumns,staged[i].sourceColumns);
 assert.equal(origEarly[i].rootCount,staged[i].rootCount);
}
const pathPoint=x=>x.row+':'+x.col;
const cellKey=p=>p.map(pathPoint).join('>');
const canonicalPath=(s,p)=>s+'|'+[cellKey(p),cellKey([...p].reverse())].sort()[0];
const motherHash=(s,p)=>canonicalPath(s,p);
const vt4View=staged.slice(1).map(({turn,sourceColumns,view})=>{
 const candidates=view.ranks.vt4;
 const mothers=view.ranks.vt3.slice(0,10);
 const motherPositions=new Map(view.ranks.vt3.map(x=>[x.family,x.rank]));
 const momPaths=new Map();
 for(const m of mothers)for(const r of m.paths){
  const k=motherHash(r.sourceId,r.path);
  const old=momPaths.get(k)||new Set();
  old.add(m.family);momPaths.set(k,old);
 }
 return {date:DATE,turn,
  vt3SealParents:mothers.map(f=>({family:f.family,rank:f.rank,paths:f.paths.length})),
  vt4Rankings:candidates.map(f=>{
   const roots=new Set(f.paths.flatMap(p=>p.rootIds));
   return {family:f.family,rank:f.rank,pathCount:f.paths.length,
    sources:f.sourceCount,physicalBlocks:f.physicalBlocks,
    parentFamilies:f.parentFamilies,
    bestMotherRank:Math.min(...f.parentFamilies.map(x=>motherPositions.get(x)||99)),
    roots:f.directRoots,explanation:f.rationale,
    paths:f.paths.map(p=>({
     source:p.sourceId,value:p.value,cells:p.path.map(pathPoint),
     physicalKey:canonicalPath(p.sourceId,p.path),
     mothers:p.mothers|| (p.mother?[p.mother]:[]),
     digitAdded:p.addedDigit,origin:p.origin
    }))}
  }),
  first10:candidates.slice(0,10).map(f=>f.family),
  top3:candidates.slice(0,3).map(f=>f.family),
  top5:candidates.slice(0,5).map(f=>f.family),
  sourceColumns,visibleVT3Mothers:motherPositions.size,
  physicalMotherPaths:momPaths.size
 };
});
function annotate(v,head,jur){
 const family4=[head,[...head].reverse().join('')].sort().join('/');
 const rank=v.vt4Rankings.find(x=>x.family===family4);
 const momLookup=new Map();
 for(const m of v.vt3SealParents)momLookup.set(m.family,m.rank);
 const src=staged.find(s=>s.turn===v.turn),byMom=new Map();
 for(const m of src.view.ranks.vt3.slice(0,10))for(const p of m.paths){
  const k=motherHash(p.sourceId,p.path);
  const list=byMom.get(k)||new Set();list.add(m.family);byMom.set(k,list);
 }
 const physical=new Map();
 const [one,two]=family4.split('/');
 for(const source of v.sourceColumns)for(const term of new Set([one,two])){
  for(const path of findPaths(source.values,term)){
   const id=canonicalPath(source.source,path);
   if(physical.has(id))continue;
   const ownMothers=new Set();
   for(const segment of [path.slice(0,3),path.slice(1,4)])
    for(const m of byMom.get(motherHash(source.source,segment))||[])ownMothers.add(m);
   const matched=rank?.paths.filter(p=>p.physicalKey===id)||[];
   physical.set(id,{source:source.source,read:term,
    cells:path.map(pathPoint),
    viableTop10MotherFamilies:[...ownMothers].sort(),
    includedInLaloVT4:Boolean(matched.length),
    creditedMothers:[...new Set(matched.flatMap(p=>p.mothers))].sort()});
  }
 }
 const all=[...physical.values()];
 const rankedRoutes=all.filter(p=>p.includedInLaloVT4);
 assert.equal(rankedRoutes.length,rank?.pathCount||0,
  'Las rutas físicas admitidas no coinciden con Lalo '+v.turn+' '+head);
 if(rank){
  assert.ok(rank.parentFamilies.length&&rank.bestMotherRank>=1&&rank.bestMotherRank<=10,
   'VT4 admitida sin madre Top10');
 }
 let reason='NO_FORMACION_FISICA';
 if(all.length&&!rank)reason='FISICA_SIN_MADRE_VT3_TOP10_FISICA';
 else if(rank&&rank.rank<=3)reason='TOP3';
 else if(rank&&rank.rank<=5)reason='TOP5';
 else if(rank&&rank.rank<=10)reason='TOP10';
 else if(rank)reason='RANKEADA_FUERA_TOP10';
 return {jurisdiction:jur,head,family4,
  physicalRoutes:all.length,admittedPaths:rankedRoutes.length,
  rank:rank?.rank??null,bestMotherRank:rank?.bestMotherRank??null,
  motherFamilies:rank?.parentFamilies??[],
  reason,allPhysical:all,
  firstPhysicalMothersFromTop10:[...new Set(all.flatMap(p=>p.viableTop10MotherFamilies))],
  rankData:rank?{sources:rank.sources,physicalBlocks:rank.physicalBlocks,
   parentFamilies:rank.parentFamilies,explanation:rank.explanation}:null};
}
const cutoff=3;
if(process.argv[2]==='pre'){
 const time=new Date().toISOString();
 const pre={date:DATE,timeOfReconstructionUtc:time,
  reviewCategory:'RETROSPECTIVE_RECONSTRUCTION_NOT_PRE_DRAW_SEALED',
  note:'Los resultados 13/10 ya eran conocidos al generar esto. Sólo Matutino VT3, NO VT4, estaba sellado a las 13:52. Las fuentes precedentes son auténticas del corte.',
  existingVt3MatSeal:originalSHA,
  referenceVt3MatTop10:originalMat.top10,
  stages:vt4View
 };
 save('RECONSTRUCCION_PRE_VT4.json',pre);
 save('SELLO.json',{sha256:sha(readFileSync(OUT+'RECONSTRUCCION_PRE_VT4.json','utf8')),
  motor:sha(readFileSync('src/motorLalo.ts','utf8')),
  originalVt3MatSeal:originalSHA,
  priorScript:sha(readFileSync('scripts/lab-vt3-en-vivo-13oct2026.mjs','utf8')),
  stage:'RECONSTRUCTION_POST_SORT_STATIC_INPUTS'});
 console.log('VT4_RECONSTRUCCION_PRE_OK',JSON.stringify({
  time,originalVt3MatSeal:originalSHA,
  stages:vt4View.map(v=>({turn:v.turn,nRanks:v.vt4Rankings.length,top3:v.top3,top5:v.top5,top10:v.first10,
  family5485:v.vt4Rankings.find(r=>r.family==='5485/5845')||null,
  family1057:v.vt4Rankings.find(r=>r.family==='1057/7501')||null
  }))},null,2));
}else if(process.argv[2]==='post'){
 const before=jread(OUT+'RECONSTRUCCION_PRE_VT4.json'),seal=jread(OUT+'SELLO.json');
 assert.equal(sha(readFileSync(OUT+'RECONSTRUCCION_PRE_VT4.json','utf8')),seal.sha256);
 assert.equal(sha(readFileSync('src/motorLalo.ts','utf8')),seal.motor);
 assert.deepEqual(before.stages,vt4View);
 const observations={
  Primera:[['Ciudad','5485'],['Provincia','0310'],['Córdoba','8857'],['Santa Fe','3385'],['Entre Ríos','4084']],
  Matutino:[['Ciudad','3376'],['Provincia','1057'],['Córdoba','2413'],['Santa Fe','3723'],['Entre Ríos','2284'],['Montevideo','3629']]
 };
 const check=turn=>{
  const v=vt4View.find(x=>x.turn===turn);
  const all=observations[turn].map(([jur,head])=>annotate(v,head,jur));
  const calc=a=>({headCount:a.length,physicalHeads:a.filter(x=>x.physicalRoutes>0).length,
   admittedHeads:a.filter(x=>x.rank!==null).length,
   top3:a.some(x=>x.rank!==null&&x.rank<=3),
   top5:a.some(x=>x.rank!==null&&x.rank<=5),
   top10:a.some(x=>x.rank!==null&&x.rank<=10)});
  return {date:DATE,turn,heads:all,
   argentina5:calc(all.slice(0,5)),
   withMontevideo:turn==='Matutino'?calc(all):null,
   rankingVT4Top10:v.first10,
   rankingPool:v.vt4Rankings.length};
 };
 const results=[check('Primera'),check('Matutino')];
 assert.equal(results[0].heads[0].head,'5485');
 assert.equal(results[0].heads[0].family4,'5485/5845');
 assert.equal(results[1].heads[1].head,'1057');
 assert.equal(results[1].heads[1].family4,'1057/7501');
 const summary={date:DATE,review:'POST_RESULTADO_CON_VT4_RECONSTRUIDO_NO_SELLADO_ANTES_DEL_SORTEO',
  vt3MatSealSHA:originalSHA,
  comparables:results.map(r=>({
   turn:r.turn,fromPublishedFive:r.argentina5,withMontevideo:r.withMontevideo,
   top3:r.rankingVT4Top10.slice(0,3),top5:r.rankingVT4Top10.slice(0,5),top10:r.rankingVT4Top10,
   pool:r.rankingPool,
   highlighted:r.heads.filter(h=>h.physicalRoutes>0).map(h=>({
    jurisdiction:h.jurisdiction,head:h.head,family:h.family4,
    physicalRoutes:h.physicalRoutes,admitted:h.admittedPaths,
    rank:h.rank,mothers:h.motherFamilies,bestMotherRank:h.bestMotherRank,
    reason:h.reason,physicalMotherFamilies:h.firstPhysicalMothersFromTop10
   }))
  })),
  warning:'App colores VT4 sólo documentan coincidencia física POST. Rank VT4 no se guardó a las 13:52; su cotejo es retrospectivo a partir de PRE disponible, no un acierto VT4 sellado antes de sorteo.'};
 save('POST_13OCT_VT4.json',{rows:results,readFrom:'captura del usuario y reconstrucción del 13/10'});
 save('RESUMEN.json',summary);
 console.log('VT4_RECONSTRUCCION_POST_OK',JSON.stringify(summary,null,2));
}else throw Error('Modo pre|post');
