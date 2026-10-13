import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const OUT='auditorias/vt3-explicabilidad-app-115-13oct2026/';
const LALO_PRE='resultados/replay-lalo-115/INPUT_PRE_115.json';
const LALO_POST='resultados/replay-lalo-115/OBJETIVOS_POST_115.json';
const REF='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json';
const NIGHT='auditorias/vt3-nocturna-12oct2026/NOCTURNA_PRE_SELLADO.json';
const hash=x=>createHash('sha256').update(x).digest('hex');
const read=f=>readFileSync(f,'utf8'),j=f=>JSON.parse(read(f));
const save=(f,x)=>writeFileSync(OUT+f,JSON.stringify(x,null,2)+'\n');
const key=r=>r.date+'|'+r.turn;
mkdirSync(OUT,{recursive:true});
const runtime='resultados/runtime-vt3-explicabilidad';
for(const f of ['domain','dates','paths','sheet','motorLalo','vt3Audit']){
 const from='src/'+f+'.ts',to=resolve(runtime,f+'.mjs');
 mkdirSync(dirname(to),{recursive:true});
 const src=stripTypeScriptTypes(read(from)).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'");
 writeFileSync(to,src);
}
const loadModule=async n=>import(pathToFileURL(resolve(runtime,n+'.mjs')).href);
const {buildMotorLalo,reversibleFamily}=await loadModule('motorLalo');
const {auditVt3Family,normalizeVt3Query}=await loadModule('vt3Audit');
const {buildSheet}=await loadModule('sheet');
const {TURNOS,JURS,diaVacio}=await loadModule('domain');
assert.deepEqual(normalizeVt3Query('9851'),{requested:'9851',family:'158/851'});
assert.deepEqual(normalizeVt3Query('851'),{requested:'851',family:'158/851'});
assert.equal(normalizeVt3Query('158/815'),null);
function labels(goal){return new Set(goal.map(h=>reversibleFamily(h.slice(-3))))}
function verifyAudit(sheet,view,turn,f,sourceWitness){
 const before=view.ranks.vt3.map(x=>[x.family,x.rank,x.paths.length]);
 const d=auditVt3Family(sheet,view,turn,f);
 assert.ok(d);
 assert.equal(d.family,f);
 if(sourceWitness){
  assert.equal(d.physicalRoutes,sourceWitness.paths.length,'Inventario físico distinto '+turn+' '+f);
  assert.equal(d.admittedRoutes,sourceWitness.paths.filter(p=>p.anchored).length,'Caminos admitidos distintos');
 }
 const official=view.ranks.vt3.find(x=>x.family===f);
 assert.equal(d.officialRank,official?.rank??null);
 assert.equal(d.independentRootEvents,official?.directRoots??0);
 assert.equal(d.d1Events,official?.d1Roots??0);
 assert.equal(d.d7Events,official?.d7Roots??0);
 assert.equal(d.physicalRoutes,d.admittedRoutes+d.unadmittedRoutes);
 if(!official&&d.physicalRoutes)assert.equal(d.status,'FISICA_SIN_ANCLAJE');
 if(official){
  assert.ok(d.admittedRoutes>=1,'Familia admitida sin caminos');
  assert.equal(d.top3,official.rank<=3);
  assert.equal(d.top10,official.rank<=10);
  if(official.rank>3&&view.ranks.vt3.length>=3)
   assert.ok(d.priorityReasons.some(r=>r.cutoff===3));
  if(official.rank>10&&view.ranks.vt3.length>=10)
   assert.ok(d.priorityReasons.some(r=>r.cutoff===10));
 }
 assert.deepEqual(view.ranks.vt3.map(x=>[x.family,x.rank,x.paths.length]),before,'Diagnóstico alteró ranking');
 return d;
}
if(process.argv[2]==='pre'){
 assert.ok(!existsSync(LALO_POST),'POST históricos visibles durante prueba PRE');
 const input=j(LALO_PRE).rows,ref=j(REF).rows;
 assert.equal(input.length,115);assert.equal(ref.length,115);
 const rows=[];let totalTested=0,totalOut=0,totalAnchored=0;
 for(let i=0;i<input.length;i++){
  const x=input[i],source=ref[i],view=buildMotorLalo(x.current,x.date,x.turn,x.history);
  assert.equal(key(x),key(source));assert.equal(view.target,x.turn);
  assert.deepEqual(view.ranks.vt3.map(f=>f.family),source.strategies.A_ORIGINAL.map(f=>f.family));
  const map=new Map(source.witnesses.map(w=>[w.family,w]));
  const official=view.ranks.vt3;
  const chosen=new Set([...official.slice(0,10),...official.slice(-2)].map(x=>x.family));
  for(const witness of source.witnesses.filter(w=>!official.some(f=>f.family===w.family)).slice(0,15))
   chosen.add(witness.family);
  for(const family of chosen){
   const d=verifyAudit(x.current,view,x.turn,family,map.get(family));
   const altered={...x.current,
    heads:{...x.current.heads,[x.turn]:['9999','0000']},
    matches:{...x.current.matches,[x.turn]:[{turno:x.turn,jurisdiccion:'Ciudad',cabeza:'9999',hits:[]}]}};
   assert.deepEqual(auditVt3Family(altered,view,x.turn,family),d,
    'Diagnóstico PRE depende del resultado objetivo');
   totalTested++;
   if(!d.officialRank)totalOut++;else totalAnchored++;
  }
  const n=official.length;
  rows.push({date:x.date,turn:x.turn,officialTop3:official.slice(0,3).map(p=>p.family),
   officialTop10:official.slice(0,10).map(p=>p.family),
   officialPool:n,physicallyPossible:source.witnesses.length,
   physicallyOnly:source.witnesses.filter(w=>!official.some(f=>f.family===w.family)).length,
   testedCandidates:chosen.size});
 }
 assert.equal(rows.length,115);
 const sealed=j(NIGHT);
 assert.equal(sealed.date,'2026-10-12');assert.equal(sealed.target,'Nocturno');
 const raw=JSON.parse(gunzipSync(Buffer.from(read('fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64').trim(),'base64')));
 const jurisdictions=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
 function past(date){
  const result=diaVacio();
  assert.ok(raw[date]);
  for(let t=0;t<TURNOS.length;t++)for(let k=0;k<jurisdictions.length;k++)
   result[TURNOS[t]][jurisdictions[k]]=raw[date][t][k];
  return result;
 }
 const history=[
  {date:'2026-10-10',period:'D−1',sheet:buildSheet(past('2026-10-10'),past('2026-10-09'))},
  {date:'2026-10-05',period:'D−7',sheet:buildSheet(past('2026-10-05'),past('2026-10-03'))}
 ];
 const now={columns:sealed.sourceColumns,heads:Object.fromEntries(TURNOS.map(t=>[t,[]])),
  matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))};
 const motor=buildMotorLalo(now,'2026-10-12','Nocturno',history);
 assert.deepEqual(motor.ranks.vt3.map(f=>f.family),sealed.ranks.vt3.map(f=>f.family));
 const night={date:'2026-10-12',turn:'Nocturno',
  queries:Object.fromEntries(['9851','1615','7242','8290','3264'].map(query=>{
   const d=auditVt3Family(now,motor,'Nocturno',query);
   return [query,d];
  }))};
 assert.equal(night.queries['9851'].family,'158/851');
 assert.equal(night.queries['9851'].status,'FISICA_SIN_ANCLAJE');
 assert.equal(night.queries['1615'].family,'516/615');
 assert.equal(night.queries['1615'].officialRank,54);
 assert.equal(night.queries['7242'].family,'242/242');
 assert.equal(night.queries['7242'].officialRank,25);
 for(const q of Object.values(night.queries))assert.equal(q.physicalRoutes,q.admittedRoutes+q.unadmittedRoutes);
 save('PRE_115.json',{rows,summary:{
  cuts:115,tests:totalTested,anchoredChecks:totalAnchored,physicallyOnlyChecks:totalOut,
  officialRankingModified:false,resultLabelsAccessed:false}});
 save('NOCTURNA_PRE.json',night);
 save('SELLO.json',{code:hash(read('src/vt3Audit.ts')),
  app:hash(read('App.tsx')),ui:hash(read('src/ui/Vt3Explainer.tsx')),
  source:hash(read(LALO_PRE)),legacyPhysical:hash(read(REF)),
  cases:hash(read(OUT+'PRE_115.json')),night:hash(read(OUT+'NOCTURNA_PRE.json'))});
 console.log('VT3_EXPLICABILIDAD_PRE_OK',JSON.stringify({
  cuts:115,checked:totalTested,physicalWithoutAdmission:totalOut,
  nocturna:Object.fromEntries(Object.entries(night.queries).map(([q,x])=>[q,{
   family:x.family,rank:x.officialRank,paths:x.physicalRoutes,rootD1:x.d1Events,rootD7:x.d7Events,status:x.status
  }]))}));
}else if(process.argv[2]==='post'){
 const seal=j(OUT+'SELLO.json');
 assert.equal(hash(read('src/vt3Audit.ts')),seal.code);
 assert.equal(hash(read('App.tsx')),seal.app);
 assert.equal(hash(read('src/ui/Vt3Explainer.tsx')),seal.ui);
 assert.equal(hash(read(LALO_PRE)),seal.source);
 assert.equal(hash(read(REF)),seal.legacyPhysical);
 assert.equal(hash(read(OUT+'PRE_115.json')),seal.cases);
 assert.equal(hash(read(OUT+'NOCTURNA_PRE.json')),seal.night);
 const inputs=j(LALO_PRE).rows,targets=j(LALO_POST).rows;
 const before=j(OUT+'PRE_115.json').rows;assert.equal(targets.length,115);
 let physical=0,anchored=0,outside=0,missed=0,top3=0,top10=0;
 const rows=[];
 for(let i=0;i<115;i++){
  const x=inputs[i],goal=targets[i],r=before[i];
  assert.equal(key(x),key(goal));assert.equal(key(x),key(r));
  const view=buildMotorLalo(x.current,x.date,x.turn,x.history);
  const fams=labels(goal.targetHeads);
  const diag=[...fams].map(f=>auditVt3Family(x.current,view,x.turn,f));
  const hit3=diag.some(d=>d.top3),hit10=diag.some(d=>d.top10);
  top3+=Number(hit3);top10+=Number(hit10);
  for(const d of diag){
   if(!d.physicalRoutes)missed++;
   else{
    physical++;if(d.officialRank!==null)anchored++;else outside++;
   }
  }
  rows.push({date:x.date,turn:x.turn,families:diag.map(d=>({
   family:d.family,status:d.status,rank:d.officialRank,
   physicalRoutes:d.physicalRoutes,admittedRoutes:d.admittedRoutes,
   d1:d.d1Events,d7:d.d7Events
  })),hit3,hit10});
 }
 assert.equal(top3,5);assert.equal(top10,15);
 const summary={cuts:115,top3,top10,
  physicalFamilyExposures:physical,admittedFamilyExposures:anchored,
  physicallyOnlyFamilyExposures:outside,
  absentFamilyExposures:missed,
  explanationDoesNotAlterRanking:true,
  validatedExampleNight:{
   '851':'158/851 fisica sin anclaje',
   '615':'516/615 rango 54',
   '242':'242/242 rango 25'
  },seal};
 save('POST_115.json',{rows});
 save('RESUMEN.json',summary);
 console.log('VT3_EXPLICABILIDAD_POST_OK',JSON.stringify(summary));
}else throw Error('Usar pre/post');
