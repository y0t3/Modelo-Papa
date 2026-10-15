import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';

const OUT='auditorias/cotejo-14oct-vt234-15oct2026/';
const POST_FILE=OUT+'RESULTADOS_14OCT_VERIFICADOS.json';
const PRE_FILE=OUT+'RECONSTRUCCION_PRE_5_TURNOS.json';
const POST_OUT=OUT+'DIAGNOSTICO_POST_5_TURNOS.json';
const SUMMARY=OUT+'RESUMEN.json';
const D='2026-10-14';
const JUR=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const src13='auditorias/vt3-cotejo-nocturna-13oct2026/OBJETIVOS_POST_13OCT.json';
const preSeal='auditorias/vt3-prospectivo-14oct2026-previa/PRE_14OCT_PREVIA.json';
const fixture='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const previous12=[
 ['7447','0334','5276','4616','2403','----'],
 ['3825','9554','3107','2696','7634','----'],
 ['2436','3489','1099','8362','2400','----'],
 ['2716','3433','4801','4903','3245','----'],
 ['9851','1615','7242','8290','3264','----']
];
const read=p=>readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const hash=x=>createHash('sha256').update(x).digest('hex');
const save=(p,x)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(x,null,2)+'\n');};
const phase=process.argv[2];
assert.ok(['pre','post'].includes(phase),'Uso: node script.mjs pre|post');
const historical=JSON.parse(gunzipSync(Buffer.from(read(fixture).trim(),'base64')).toString('utf8'));
const prev13=json(src13);
assert.equal(prev13.date,'2026-10-13');
historical['2026-10-12']=previous12;
historical['2026-10-13']=Object.values(prev13.turns).map(x=>[...x,'----']);
for(const x of ['2026-10-06','2026-10-07','2026-10-12','2026-10-13'])assert.ok(historical[x]);
assert.ok(!historical[D],'No se permite filtrar el objetivo vía fixtures históricos');
const runtime='resultados/runtime-14oct-vt234-post';
for(const k of ['domain','dates','paths','sheet','motorLalo']){
 const file=resolve(runtime,k+'.mjs');mkdirSync(dirname(file),{recursive:true});
 writeFileSync(file,stripTypeScriptTypes(read('src/'+k+'.ts')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
}
const load=async k=>import(pathToFileURL(resolve(runtime,k+'.mjs')).href);
const {TURNOS,diaVacio}=await load('domain');
const {buildSheet}=await load('sheet');
const {buildMotorLalo,reversibleFamily}=await load('motorLalo');
const {findPaths}=await load('paths');
function day(matrix){
 const d=diaVacio();
 for(let ti=0;ti<TURNOS.length;ti++)for(let ji=0;ji<JUR.length;ji++){
  const s=matrix?.[ti]?.[ji]??'----';
  assert.match(s,/^(----|\d{4})$/);
  d[TURNOS[ti]][JUR[ji]]=s;
 }
 return d;
}
const draw=d=>day(historical[d]);
const historicRefs=[
 {date:'2026-10-13',period:'D−1',sheet:buildSheet(draw('2026-10-13'),draw('2026-10-12'))},
 {date:'2026-10-07',period:'D−7',sheet:buildSheet(draw('2026-10-07'),draw('2026-10-06'))}
];
assert.deepEqual(historicRefs.map(x=>x.date),['2026-10-13','2026-10-07']);

if(phase==='pre'){
 assert.ok(!existsSync(POST_FILE),'PROHIBIDO tener resultados del 14 durante la reconstrucción');
 assert.ok(!existsSync(POST_OUT),'PROHIBIDO haber corrido POST antes de PRE');
 // La reconstrucción es RETROSPECTIVA, aunque se genere con datos previos:
 // NO tiene firma ni sello temporal de los turnos 2 a 5 antes del sorteo.
 const reconstructed=[];
 const official=json(preSeal);
 for(let i=0;i<TURNOS.length;i++){
  const target=TURNOS[i],known=diaVacio();
  // Entradas de turnos anteriores de la jornada se completan sólo en POST;
  // fase PRE recibe explicitamente una matriz de resultados anteriores,
  // que no debe estar presente por las reglas de aislamiento.
  // Por eso PRE auténticamente reproducible queda limitado a Previa.
  if(i!==0)continue;
  const sheet=buildSheet(known,draw('2026-10-13'));
  assert.equal(sheet.heads[target].length,0);
  const view=buildMotorLalo(sheet,D,target,historicRefs);
  const top=view.ranks.vt3.slice(0,10).map(x=>x.family);
  assert.deepEqual(top,official.official.top10,'La reconstrucción debe coincidir con el PRE originalmente sellado');
  reconstructed.push({
   turn:target,method:'PRE_GENUINO_14OCT',sealCreatedAtUtc:official.createdAtUtc,
   knownSources:sheet.columns.slice(0,i+1).map(x=>({source:x.id,values:x.values})),
   counts:Object.fromEntries(['vt2','vt3','vt4'].map(k=>[k,view.ranks[k].length])),
   ranks:Object.fromEntries(['vt2','vt3','vt4'].map(k=>[k,view.ranks[k].map(f=>({
    family:f.family,rank:f.rank,d1:f.d1Roots,d7:f.d7Roots,sources:f.sourceCount,
    branch:f.branchBlocks,blocks:f.physicalBlocks,values:[...new Set(f.paths.map(p=>p.value))]
   }))]))
  });
 }
 save(PRE_FILE,{date:D,phase:'RECONSTRUCCION_SOLO_PREVIA_SELLADA',createdAtUtc:new Date().toISOString(),
  originalPreCreatedAtUtc:official.createdAtUtc,originalPreSha256:hash(read(preSeal)),
  readsTargetHeads:false,rows:reconstructed});
 console.log('PRE_RECONSTRUCCION_14OCT_OK',{turns:reconstructed.length,seal:official.createdAtUtc,vt3top10:reconstructed[0].ranks.vt3.slice(0,10).map(x=>x.family)});
}else{
 assert.ok(existsSync(POST_FILE),'Necesarios resultados cotejados POST');
 assert.ok(existsSync(PRE_FILE),'Falta reconstrucción PRE previa, imposible cotejar');
 const targets=json(POST_FILE);
 assert.equal(targets.date,D);
 assert.deepEqual(targets.jurisdictions,JUR);
 const actual=TURNOS.map(t=>targets.turns[t]);
 assert.ok(actual.every(x=>x.length===6));
 const real=day(actual),observations=[],perTurn=[];
 const sealed=json(PRE_FILE);
 assert.deepEqual(sealed.rows[0].ranks.vt3.slice(0,10).map(x=>x.family),
  json(preSeal).official.top10);
 const reportKinds=['vt2','vt3','vt4'];
 for(let i=0;i<TURNOS.length;i++){
  const target=TURNOS[i],known=diaVacio();
  for(let before=0;before<i;before++)
   for(let j=0;j<JUR.length;j++)known[TURNOS[before]][JUR[j]]=real[TURNOS[before]][JUR[j]];
  const sheet=buildSheet(known,draw('2026-10-13'));
  assert.equal(sheet.heads[target].length,0,'No usar resultados de turno objetivo');
  assert.ok(sheet.columns.slice(i+1).every(x=>x.values.every(v=>v==='--')),'Fuga de una fuente posterior');
  const view=buildMotorLalo(sheet,D,target,historicRefs);
  if(i===0)assert.deepEqual(view.ranks.vt3.slice(0,10).map(x=>x.family),
   sealed.rows[0].ranks.vt3.slice(0,10).map(x=>x.family),'Previa debe reproducir sello original');
  const available=sheet.columns.slice(0,i+1);
  const knownPrev=TURNOS.slice(0,i);
  const cells=JUR.slice(0,5).map((jur,j)=>{
   const head=actual[i][j];
   if(!/^\d{4}$/.test(head))return {jur,head,excluded:true};
   const all={jur,head};
   for(const kind of reportKinds){
    const n=+kind.at(-1),suffix=head.slice(-n),
     paths=available.flatMap(col=>findPaths(col.values,suffix).map(p=>({source:col.id,cells:p.map(c=>c.row+':'+c.col)})));
    const family=reversibleFamily(suffix);
    const ranked=view.ranks[kind];
    const pos=ranked.findIndex(f=>kind==='vt4'?f.paths.some(p=>p.value===head):f.family===family);
    all[kind]={
     family:kind==='vt4'?head:family,
     physicallyAvailable:paths.length>0,
     physicalPaths:paths.length,
     sources:[...new Set(paths.map(x=>x.source))],
     admitted:pos>=0,rank:pos>=0?pos+1:null,
     top3:pos>=0&&pos<3,top5:pos>=0&&pos<5,top10:pos>=0&&pos<10,
     diagnostic:paths.length===0?'FUERA_DE_TABLERO':pos<0?'NO_ADMITIDA':
      pos>=10?'FUERA_TOP10':'DENTRO_TOP10'
    };
   }
   return all;
  });
  perTurn.push({
   turn:target,phase:i===0?'PRE_SELLADO_ANTES_SORTEO':'PRE_RETROSPECTIVO_SIN_CABEZA_OBJETIVO',
   knownPreviousTurns:knownPrev,
   totalHeads:cells.filter(x=>!x.excluded).length,
   presentRoots:view.roots.length,
   ranks:reportKinds.reduce((obj,k)=>(obj[k]=view.ranks[k].slice(0,10).map(x=>({family:x.family,values:k==='vt4'?[...new Set(x.paths.map(p=>p.value))]:undefined})),obj),{}),
   cells
  });
  observations.push(...cells.filter(x=>!x.excluded).map(x=>({...x,turn:target})));
 }
 const totals={};
 for(const kind of reportKinds){
  const entries=observations.map(x=>x[kind]);
  totals[kind]={
   heads:entries.length,
   physicallyAvailable:entries.filter(e=>e.physicallyAvailable).length,
   admitted:entries.filter(e=>e.admitted).length,
   top3:entries.filter(e=>e.top3).length,
   top5:entries.filter(e=>e.top5).length,
   top10:entries.filter(e=>e.top10).length,
   reasons:entries.reduce((s,e)=>(s[e.diagnostic]=(s[e.diagnostic]||0)+1,s),{})
  };
 }
 const result={date:D,phase:'POST_CON_PREVIA_SELLADA_Y_4_TURNOS_RETROSPECTIVOS',denominator:observations.length,
  omitted:5*5-observations.length,
  sourceIntegrity:{
   truePre14Seal:sealed.originalPreCreatedAtUtc,
   partialSantaFeNocturna:true,
   note:'Otros cuatro turnos reconstruidos DESPUÉS del resultado: análisis descriptivo, no nuevos PRE prospectivos.'
  },turns:perTurn,totals};
 save(POST_OUT,result);
 save(SUMMARY,{date:D,phase:result.phase,denominator:observations.length,totals,
  individual:observations.map(x=>({turn:x.turn,jur:x.jur,head:x.head,vt2:x.vt2,vt3:x.vt3,vt4:x.vt4}))});
 console.log('POST_14OCT_VT234_OK '+JSON.stringify({heads:observations.length,totals,perTurn:perTurn.map(x=>({
  turn:x.turn,heads:x.totalHeads,miss3:x.cells.filter(c=>!c.excluded&&c.vt3.diagnostic!=='DENTRO_TOP10').map(c=>c.head+'='+c.vt3.diagnostic)
 }))},null,2));
}
