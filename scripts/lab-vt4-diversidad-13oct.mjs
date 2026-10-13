import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';

const OUT='auditorias/vt4-diversidad-madres-top10-115-13oct2026/';
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



const ref=jread('auditorias/vt4-familia-madre-orientada-13oct2026/RECONSTRUCCION_VT4_MADRE.json');
const originalMatPath='auditorias/vt3-en-vivo-13oct2026/MATUTINA_PRE_SELLADA.json';
const knownSHA='067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41';
assert.equal(sha(read(originalMatPath)),knownSHA);
assert.deepEqual(staged[2].top10,jread(originalMatPath).top10);
const TOPS=['ORIGINAL_CORREGIDO','UNICO_NUMERO','CUPO_1','CUPO_2','CUPO_3','RONDA_MADRES','BASE_NEUTRAL'];
function allOf(view){
 const ranked=view.ranks.vt4;
 const motherRank=new Map(view.ranks.vt3.map(x=>[x.family,x.rank]));
 return ranked.map(r=>{
  assert.equal(r.parentFamilies.length,1);
  const mother=r.parentFamilies[0];
  assert.ok(motherRank.get(mother)<=10);
  const nums=[...new Set(r.paths.map(p=>p.value))].sort();
  assert.ok(nums.length);
  return {family:r.family,orderRank:r.rank,mother,
   motherRank:motherRank.get(mother),nums};
 });
}
function select(all,mode,seed){
 const listed=mode==='BASE_NEUTRAL'?all.slice().sort((a,b)=>sha(seed+'|'+a.family).localeCompare(sha(seed+'|'+b.family))):all;
 if(mode==='ORIGINAL_CORREGIDO')return {chosen:all.slice(0,10),backfill:0};
 const seen=new Set(),numbers=new Set(),chosen=[],mothers=new Map();
 const good=g=>!seen.has(g.orderRank)&&!g.nums.some(x=>numbers.has(x));
 const add=g=>{assert.ok(good(g));chosen.push(g);seen.add(g.orderRank);
  for(const v of g.nums)numbers.add(v);
  mothers.set(g.mother,(mothers.get(g.mother)||0)+1)};
 let backfill=0;
 if(mode.startsWith('CUPO_')){
  const n=Number(mode.slice(-1));
  for(const g of all)if(chosen.length<10&&good(g)&&(mothers.get(g.mother)||0)<n)add(g);
  const before=chosen.length;
  for(const g of all)if(chosen.length<10&&good(g))add(g);
  backfill=chosen.length-before;
 }else if(mode==='RONDA_MADRES'){
  for(let round=1;round<=10&&chosen.length<10;round++)
   for(let m=1;m<=10&&chosen.length<10;m++){
    const c=all.find(x=>x.motherRank===m&&good(x)&&(mothers.get(x.mother)||0)<round);
    if(c)add(c);
   }
  for(const c of all)if(chosen.length<10&&good(c))add(c);
 }else{
  for(const c of listed)if(chosen.length<10&&good(c))add(c);
 }
 assert.equal(chosen.length,10);
 return {chosen,backfill};
}
const historyResults={
 Primera:['5485','0310','8857','3385','4084'],
 Matutino:['3376','1057','2413','3723','2284','3629']
};
const cases=staged.slice(1).map(stage=>{
 const all=allOf(stage.view);
 const baseline=ref.reports.find(x=>x.turn===stage.turn);
 assert.deepEqual(all.slice(0,10).map(x=>x.family),baseline.afterTop10);
 const out=Object.fromEntries(TOPS.map(mode=>{
  const s=select(all,mode,'20261013|'+stage.turn);
  const drawn=historyResults[stage.turn],eligible=stage.turn==='Matutino'?drawn.slice(0,5):drawn;
  const hit=arr=>s.chosen.slice(0,arr).some(g=>g.nums.some(n=>eligible.includes(n)));
  const montHit=arr=>s.chosen.slice(0,arr).some(g=>g.nums.some(n=>drawn.includes(n)));
  return [mode,{top3:s.chosen.slice(0,3).map(x=>x.family),
   top5:s.chosen.slice(0,5).map(x=>x.family),top10:s.chosen.map(x=>x.family),
   bestMotherPositions:s.chosen.map(g=>g.motherRank),
   distinctMothers:new Set(s.chosen.map(g=>g.mother)).size,
   uniqueNumeric4:new Set(s.chosen.flatMap(g=>g.nums)).size,
   backfill:s.backfill,
   argentina:{top3:hit(3),top5:hit(5),top10:hit(10)},
   six:{top3:montHit(3),top5:montHit(5),top10:montHit(10)},
   targetRepresented:s.chosen.some(g=>g.nums.includes(stage.turn==='Primera'?'5485':'1057'))
  }];
 }));
 return {date:'2026-10-13',turn:stage.turn,validation:'POST_RECONSTRUCTION_NOT_PROSPECTIVE',
  originalSeal:knownSHA,preSources:stage.sourceColumns.map(x=>x.source),
  pool:all.length,heads:historyResults[stage.turn],policies:out};
});
save('13OCT_POST.json',{date:'2026-10-13',cases,note:'Reconstrucción retrospectiva con PRE anterior a cada turno, no VT4 previamente sellado; cinco jurisdicciones y seis separadas.'});
console.log('VT4_DIVERSIDAD_13OCT_OK',JSON.stringify({cases},null,2));
