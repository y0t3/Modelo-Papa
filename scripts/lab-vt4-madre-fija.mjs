import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {stripTypeScriptTypes} from 'node:module';
import {pathToFileURL} from 'node:url';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';

const OUT='auditorias/vt4-madre-fija-115-13oct2026/';
const OLD_SHA='c0aeea35831efb7a926c0f26b45f07a644f4e1a4';
const MAT_SHA='067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41';
const PRE='resultados/replay-lalo-115/INPUT_PRE_115.json';
const POST='resultados/replay-lalo-115/OBJETIVOS_POST_115.json';
const LABELS=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const hash=s=>createHash('sha256').update(s).digest('hex');
const read=f=>readFileSync(f,'utf8'),j=f=>JSON.parse(read(f));
const save=(f,x)=>writeFileSync(OUT+f,JSON.stringify(x,null,2)+'\n');
const coords=p=>p.map(x=>x.row+':'+x.col),v=p=>p.map(x=>x.digit).join('');
const rev=s=>[...s].reverse().join('');
const family=s=>[s,rev(s)].sort().join('/');
const pathKey=(source,p)=>source+'|'+[coords(p).join('>'),coords([...p].reverse()).join('>')].sort()[0];
const assertPrefix=(r,term)=>{assert.equal(r.date,'2026-10-13');assert.equal(r.target,term)};
mkdirSync(OUT,{recursive:true});
const runtime='resultados/runtime-vt4-madre-fija';
const compile=(k,source)=>{const f=resolve(runtime,k+'.mjs');
 mkdirSync(dirname(f),{recursive:true});
 writeFileSync(f,stripTypeScriptTypes(source).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
 return pathToFileURL(f).href;
};
for(const file of ['domain','dates','paths','sheet'])
 compile('src/'+file,read('src/'+file+'.ts'));
compile('src/motorNuevo',read('src/motorLalo.ts'));
compile('src/motorLalo',read('src/motorLalo.ts')); // Import exacto requerido por replay histórico.
const original=execFileSync('git',['show',OLD_SHA+':src/motorLalo.ts'],{encoding:'utf8'});
compile('src/motorAnterior',original);
const load=x=>import(pathToFileURL(resolve(runtime,x+'.mjs')).href);
const nuevo=await load('src/motorNuevo'),anterior=await load('src/motorAnterior'),
 {TURNOS,diaVacio}=await load('src/domain'),{buildSheet}=await load('src/sheet');
assert.equal(nuevo.vt4MotherFamily('226/622','3','ANTES'),'3226/3622');
assert.equal(nuevo.vt4MotherFamily('226/622','3','DESPUES'),'2263/6223');
assert.equal(nuevo.vt4MotherFamily('485/584','5','ANTES'),'5485/5584');
assert.equal(nuevo.vt4MotherFamily('548/845','5','DESPUES'),'5485/8455');
const NOCT='auditorias/vt3-en-vivo-13oct2026/MATUTINA_PRE_SELLADA.json';
assert.equal(hash(read(NOCT)),MAT_SHA);
const originalMat=j(NOCT);
const oldFirst=j('auditorias/vt3-en-vivo-13oct2026/PREVIA_PRIMERA_RECONSTRUIDAS_PRE.json').stages;
const old13=j('auditorias/vt4-13oct2026/RECONSTRUCCION_PRE_VT4.json').stages;

function validate(view,sheet,target){
 const sources=sheet.columns.slice(0,TURNOS.indexOf(target)+1);
 const sourceMap=new Map(sources.map(s=>[s.id,s]));
 const moms=new Map(view.ranks.vt3.slice(0,10).map(f=>[f.family,
  new Set(f.paths.map(p=>pathKey(p.sourceId,p.path)))]));
 const seenNumeric=new Map(),labelSeen=new Map();
 for(const f of view.ranks.vt4){
  assert.ok(f.vt4Meta);
  const {motherFamily,addedDigit,side}=f.vt4Meta;
  assert.ok(moms.has(motherFamily),'VT4 con madre fuera del Top10');
  assert.equal(f.family,nuevo.vt4MotherFamily(motherFamily,addedDigit,side));
  assert.ok(f.paths.length>=1);
  assert.deepEqual(f.parentFamilies,[motherFamily]);
  assert.deepEqual(f.physicalValues,[...new Set(f.paths.map(x=>x.value))].sort());
  labelSeen.set(f.family,(labelSeen.get(f.family)||0)+1);
  for(const p of f.paths){
   assert.equal(p.path.length,4);
   assert.equal(new Set(coords(p.path)).size,4);
   const source=sourceMap.get(p.sourceId);assert.ok(source);
   assert.ok(p.path.every(x=>source.values[x.row]?.[x.col]===x.digit));
   assert.ok(p.path.slice(1).every((x,i)=>Math.max(
    Math.abs(x.row-p.path[i].row),Math.abs(x.col-p.path[i].col)
   )===1));
   assert.equal(v(p.path),p.value);
   assert.ok(f.family.split('/').includes(p.value));
   assert.equal(p.addedDigit,addedDigit);
   const mom=side==='ANTES'?p.path.slice(1,4):p.path.slice(0,3);
   assert.equal(family(v(mom)),motherFamily,'Madre no coincide con el segmento real');
   assert.equal(side==='ANTES'?p.path[0].digit:p.path[3].digit,addedDigit);
   assert.ok(moms.get(motherFamily).has(pathKey(p.sourceId,mom)),
    'Ruta materna no heredada físicamente del Top10 VT3');
  }
  for(const value of f.physicalValues){
   if(!seenNumeric.has(value))seenNumeric.set(value,[]);
   seenNumeric.get(value).push({family:f.family,rank:f.rank,mother:motherFamily,side});
  }
 }
 return {rankedFamilies:view.ranks.vt4.length,
  exactDuplicateFamilyLabels:[...labelSeen].filter(([_,n])=>n>1),
  overlappedNumericValues:[...seenNumeric].filter(([_,list])=>list.length>1),
  top3:view.ranks.vt4.slice(0,3).map(x=>x.family),
  top5:view.ranks.vt4.slice(0,5).map(x=>x.family),
  top10:view.ranks.vt4.slice(0,10).map(x=>x.family),
  perMotherTop10:Object.fromEntries([...new Set(view.ranks.vt4.slice(0,10).map(x=>x.vt4Meta.motherFamily))]
   .map(m=>[m,view.ranks.vt4.slice(0,10).filter(x=>x.vt4Meta.motherFamily===m).length]))};
}

const data=JSON.parse(gunzipSync(Buffer.from(read('fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64').trim(),'base64')));
data['2026-10-12']=[
 ['7447','0334','5276','4616','2403','----'],
 ['3825','9554','3107','2696','7634','----'],
 ['2436','3489','1099','8362','2400','----'],
 ['2716','3433','4801','4903','3245','----'],
 ['9851','1615','7242','8290','3264','----']
];
function day(date){
 const out=diaVacio();
 for(let i=0;i<TURNOS.length;i++)
  for(let j=0;j<LABELS.length;j++)out[TURNOS[i]][LABELS[j]]=data[date][i][j];
 return out;
}
const history=[
 {date:'2026-10-12',period:'D−1',sheet:buildSheet(day('2026-10-12'),day('2026-10-10'))},
 {date:'2026-10-06',period:'D−7',sheet:buildSheet(day('2026-10-06'),day('2026-10-05'))}
];
const earlier={
 Previa:['6448','6337','5546','5119','1495'],
 Primera:['5485','0310','8857','3385','4084']
};
const stages=['Primera','Matutino'].map((turn,i)=>{
 const current=diaVacio();
 for(const prior of TURNOS.slice(0,TURNOS.indexOf(turn))){
  assert.ok(earlier[prior]);
  for(let k=0;k<5;k++)current[prior][LABELS[k]]=earlier[prior][k];
 }
 const sheet=buildSheet(current,day('2026-10-12'));
 assert.equal(sheet.heads[turn].length,0);
 const old=anterior.buildMotorLalo(sheet,'2026-10-13',turn,history);
 const fresh=nuevo.buildMotorLalo(sheet,'2026-10-13',turn,history);
 assert.deepEqual(old.ranks.vt3,fresh.ranks.vt3,'VT3 cambió en 13oct');
 assert.deepEqual(old.ranks.vt2,fresh.ranks.vt2,'VT2 cambió en 13oct');
 assert.deepEqual(old.ranks.vt4.slice(0,10).map(f=>f.family),old13[i].first10);
 const vt3=turn==='Matutino'?originalMat:oldFirst[1];
 assert.deepEqual(fresh.ranks.vt3.slice(0,10).map(f=>f.family),vt3.top10);
 const diagnostic=validate(fresh,sheet,turn);
 return {date:'2026-10-13',turn,
  oldVT4:old.ranks.vt4.map(x=>x.family),
  newVT4:fresh.ranks.vt4.map(x=>({family:x.family,rank:x.rank,
   meta:x.vt4Meta,physicalValues:x.physicalValues,
   sourceCount:x.sourceCount,physicalBlocks:x.physicalBlocks,
   paths:x.paths.map(p=>({source:p.sourceId,value:p.value,cells:coords(p.path)}))})),
  oldTop10:old.ranks.vt4.slice(0,10).map(f=>f.family),
  diagnostics:diagnostic};
});

if(process.argv[2]==='prepare'){
 // Prepare PRE and outcome files using existing replay (POST will be physically hidden
 // by workflow before doing any prediction).
 compile('scripts/replay-lalo115',read('scripts/replay-lalo115.ts'));
 await import(pathToFileURL(resolve(runtime,'scripts/replay-lalo115.mjs')).href);
 console.log('VT4_MADRE_FIJA_PREPARE_OK');
}else if(process.argv[2]==='pre'){
 assert.ok(!existsSync(POST),'Resultados visibles en fase PRE');
 const input=j(PRE).rows;
 assert.equal(input.length,115);
 const cuts=[];
 for(const [i,r] of input.entries()){
  assert.ok(r.history.every(h=>h.date<r.date));
  assert.equal(r.current.heads[r.turn].length,0);
  const old=anterior.buildMotorLalo(r.current,r.date,r.turn,r.history);
  const fresh=nuevo.buildMotorLalo(r.current,r.date,r.turn,r.history);
  assert.deepEqual(fresh.ranks.vt3,old.ranks.vt3,'VT3 alterado: '+r.date+' '+r.turn);
  assert.deepEqual(fresh.ranks.vt2,old.ranks.vt2,'VT2 alterado');
  const info=validate(fresh,r.current,r.turn);
  cuts.push({date:r.date,turn:r.turn,oldTop10:old.ranks.vt4.slice(0,10).map(x=>x.family),
   oldRanking:old.ranks.vt4.map(x=>x.family),newTop10:info.top10,
   newRankings:fresh.ranks.vt4.map(x=>({family:x.family,rank:x.rank,
    side:x.vt4Meta.side,mother:x.vt4Meta.motherFamily,added:x.vt4Meta.addedDigit,
    physicalValues:x.physicalValues,paths:x.paths.length})),
   ...info});
  if((i+1)%25===0)console.log('VT4_MADRE_FIJA_PRE_PROCESSED',i+1);
 }
 save('PRE_115.json',{date:'2026-10-13',rows:cuts,
  note:'No se leyó POST. VT2/VT3 verificados bit a bit contra motor anterior fijado por commit.'});
 save('PRE_13OCT.json',{date:'2026-10-13',stages,
  note:'Reproducción histórica 13oct, NO sello VT4 anterior a sorteos. Matutino VT3 comprobado contra sello original.'});
 save('SELLO.json',{oldVersion:OLD_SHA,
  oldMotor:hash(original),newMotor:hash(read('src/motorLalo.ts')),
  script:hash(read('scripts/lab-vt4-madre-fija.mjs')),
  protocol:hash(read('PROTOCOLO_VT4_FAMILIA_MADRE_FIJA_13OCT2026.md')),
  preInput:hash(read(PRE)),pre115:hash(read(OUT+'PRE_115.json')),
  pre13:hash(read(OUT+'PRE_13OCT.json')),
  oldMatSeal:MAT_SHA});
 console.log('VT4_MADRE_FIJA_PRE_OK',JSON.stringify({cuts:cuts.length,
  first:cuts[0].newTop10,oldFirst:cuts[0].oldTop10,
  oct13:stages.map(x=>({turn:x.turn,old:x.oldTop10,new:x.diagnostics.top10,
   pool:x.diagnostics.rankedFamilies,
   duplicates:x.diagnostics.exactDuplicateFamilyLabels.length,
   overlaps:x.diagnostics.overlappedNumericValues.length}))},null,2));
}else if(process.argv[2]==='post'){
 const seal=j(OUT+'SELLO.json');
 assert.equal(seal.oldMotor,hash(original));
 assert.equal(seal.newMotor,hash(read('src/motorLalo.ts')));
 assert.equal(seal.pre115,hash(read(OUT+'PRE_115.json')));
 assert.equal(seal.pre13,hash(read(OUT+'PRE_13OCT.json')));
 assert.equal(seal.preInput,hash(read(PRE)));
 assert.equal(seal.protocol,hash(read('PROTOCOLO_VT4_FAMILIA_MADRE_FIJA_13OCT2026.md')));
 assert.equal(seal.script,hash(read('scripts/lab-vt4-madre-fija.mjs')));
 const out=j(OUT+'PRE_115.json').rows,targets=j(POST).rows;
 assert.equal(targets.length,115);
 const summary={};
 const n=[3,5,10],oldCount={3:0,5:0,10:0},newCount={3:0,5:0,10:0};
 const rows=out.map((row,i)=>{
  const h=targets[i];
  assert.equal(h.date,row.date);assert.equal(h.turn,row.turn);
  const oldSet=new Set(h.targetHeads.map(x=>family(x)));
  const oldPos=new Map(row.oldRanking.map((f,k)=>[f,k+1]));
  // POST matching new grouping must be by actually formed physical 4-digit value.
  const actual=new Set(h.targetHeads);
  const hitNew=row.newRankings.filter(x=>x.physicalValues.some(v=>actual.has(v)));
  const hitOld=row.oldRanking.filter(x=>oldSet.has(x));
  const statuses={};
  for(const top of n){
   const was=hitOld.some(x=>oldPos.get(x)<=top);
   const newer=hitNew.some(x=>x.rank<=top);
   oldCount[top]+=Number(was);newCount[top]+=Number(newer);
   statuses['top'+top]={old:was,new:newer};
  }
  return {date:row.date,turn:row.turn,targetHeads:h.targetHeads,
   oldHitFamilies:hitOld,newHitFamilies:hitNew.map(x=>({family:x.family,rank:x.rank,physicalValues:x.physicalValues,mother:x.mother,side:x.side})),
   ...statuses};
 });
 const oct={Primera:[['Ciudad','5485'],['Provincia','0310'],['Córdoba','8857'],['Santa Fe','3385'],['Entre Ríos','4084']],
  Matutino:[['Ciudad','3376'],['Provincia','1057'],['Córdoba','2413'],['Santa Fe','3723'],['Entre Ríos','2284'],['Montevideo','3629']]};
 const local=stages.map(st=>{
  const heads=oct[st.turn].map(([jur,head])=>{
   const families=st.newVT4.filter(f=>f.physicalValues.includes(head));
   return {jurisdiction:jur,head,oldFamily:family(head),
    matchedNewFamilies:families.map(x=>({family:x.family,rank:x.rank,mother:x.meta.motherFamily,
     extra:x.meta.addedDigit,side:x.meta.side,physicalValues:x.physicalValues})),
    newTop3:families.some(x=>x.rank<=3),newTop5:families.some(x=>x.rank<=5),
    newTop10:families.some(x=>x.rank<=10)};
  });
  return {turn:st.turn,heads,top3:st.diagnostics.top3,top5:st.diagnostics.top5,
   top10:st.diagnostics.top10,oldTop10:st.oldTop10,
   argentina5:{top3:heads.slice(0,5).some(x=>x.newTop3),top5:heads.slice(0,5).some(x=>x.newTop5),
    top10:heads.slice(0,5).some(x=>x.newTop10)},
   includingMontevideo:heads.length===6?{
    top3:heads.some(x=>x.newTop3),top5:heads.some(x=>x.newTop5),
    top10:heads.some(x=>x.newTop10)}:null,
   duplicateFamilies:st.diagnostics.exactDuplicateFamilyLabels,
   overlappingNumberExamples:st.diagnostics.overlappedNumericValues.slice(0,8)};
 });
 const metrics={cuts:115,old:oldCount,new:newCount,
  perCut:rows.map(x=>({date:x.date,turn:x.turn,top3:x.top3,top5:x.top5,top10:x.top10})),
  avgOldPool:out.reduce((a,x)=>a+x.oldRanking.length,0)/out.length,
  avgNewPool:out.reduce((a,x)=>a+x.newRankings.length,0)/out.length,
  countCutsDuplicateFamilyLabels:out.filter(x=>x.exactDuplicateFamilyLabels.length>0).length,
  countCutsNumericOverlaps:out.filter(x=>x.overlappedNumericValues.length>0).length,
  totalUniqueNewFamiliesOver115:new Set(out.flatMap(x=>x.newRankings.map(y=>y.family))).size,
  oct13:local,
  strictInterpretation:'VT4 de esta rama es estructural: madre VT3+posición de cifra. Sus variantes textuales NO equivalen a rutas salvo si physicalValues contiene esa cifra. POST cotejado contra p.value físico, no inversión total automática.',
  noProspectiveClaim:'El histórico de 115 cortes y VT4 13oct son retrospectivos; el sello original Matutino previo era VT3, no VT4.'};
 save('POST_115.json',{rows});
 save('RESUMEN.json',metrics);
 console.log('VT4_MADRE_FIJA_POST_OK',JSON.stringify({
  old:metrics.old,new:metrics.new,
  oldPool:metrics.avgOldPool,newPool:metrics.avgNewPool,
  dupeCuts:metrics.countCutsDuplicateFamilyLabels,
  numericOverlapCuts:metrics.countCutsNumericOverlaps,
  oct13:local},null,2));
}else throw Error('Modo prepare|pre|post');
