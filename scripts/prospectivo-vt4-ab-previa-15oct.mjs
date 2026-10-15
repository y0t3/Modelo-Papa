import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';

const OUT='auditorias/prospectivo-vt4-ab-previa-15oct2026/';
const PRE=OUT+'PRE_15OCT_PREVIA.json',SEAL=OUT+'SELLO_SHA256.json';
const GOALS='auditorias/cotejo-14oct-vt234-15oct2026/RESULTADOS_14OCT_VERIFICADOS.json';
const OLD14='auditorias/vt3-cotejo-nocturna-13oct2026/OBJETIVOS_POST_13OCT.json';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const TARGET='2026-10-15',TARGET_TURN='Previa';
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const hash=x=>createHash('sha256').update(x).digest('hex');
const current=read('src/motorLalo.ts');
const replace='const ranked4=distributeVt4ByMother(daughtersByPhysicalStrength,selectedMothers);';
assert.equal(current.split(replace).length,2);
const old=current.replace(replace,'const ranked4=daughtersByPhysicalStrength;');
const root='resultados/runtime-prospectivo-vt4-15oct/';
for(const name of ['domain','dates','paths','sheet','motorLalo','concentrado']){
 const content=name==='motorLalo'?current:name==='concentrado'?old:read('src/'+name+'.ts');
 const output=resolve(root,name+'.mjs');mkdirSync(dirname(output),{recursive:true});
 writeFileSync(output,stripTypeScriptTypes(content).replace(
  /from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
}
const imp=async name=>import(pathToFileURL(resolve(root,name+'.mjs')).href);
const [{buildMotorLalo:rounds,vt4PrefixFamily},
 {buildMotorLalo:concentrated},{TURNOS,JURS,diaVacio},{buildSheet}]=await Promise.all(
 ['motorLalo','concentrado','domain','sheet'].map(imp));

const day13=json(OLD14);
assert.equal(day13.date,'2026-10-13');
const day14=json(GOALS);
assert.equal(day14.date,'2026-10-14');
assert.deepEqual(day14.jurisdictions,JURS);
const historical=JSON.parse(gunzipSync(Buffer.from(read(FIXTURE).trim(),'base64')).toString('utf8'));
assert.ok(!historical[TARGET],'No puede haber resultados futuros del 15/10');
assert.ok(historical['2026-10-08']&&historical['2026-10-07']);
function fromMatrix(matrix){
 const day=diaVacio();
 for(let i=0;i<TURNOS.length;i++)for(let j=0;j<JURS.length;j++){
  const v=matrix?.[i]?.[j]||'----';
  assert.match(v,/^(----|\d{4})$/);
  day[TURNOS[i]][JURS[j]]=v;
 }
 return day;
}
const prev13=fromMatrix(TURNOS.map(t=>[...day13.turns[t],'----']));
const prev14=fromMatrix(TURNOS.map(t=>day14.turns[t]));
const d08=fromMatrix(historical['2026-10-08']);
const d07=fromMatrix(historical['2026-10-07']);
const refs=[
 {date:'2026-10-14',period:'D−1',sheet:buildSheet(prev14,prev13)},
 {date:'2026-10-08',period:'D−7',sheet:buildSheet(d08,d07)}
];
assert.ok(refs.every(h=>h.date<TARGET));
const available=buildSheet(diaVacio(),prev14);
assert.equal(available.heads.Previa.length,0);
assert.ok(available.columns.slice(1).every(c=>c.values.every(v=>v==='--')));
const oldView=concentrated(available,TARGET,TARGET_TURN,refs);
const newView=rounds(available,TARGET,TARGET_TURN,refs);
assert.deepEqual(oldView.roots,newView.roots);
assert.deepEqual(oldView.ranks.vt3,newView.ranks.vt3);
assert.deepEqual(oldView.ranks.vt2,newView.ranks.vt2);
const sortView=v=>v.ranks.vt4.map(f=>({
 family:f.family,values:[...new Set(f.paths.map(p=>p.value))].sort(),
 parents:f.parentFamilies,sourceCount:f.sourceCount,
 physicalBlocks:f.physicalBlocks
})).sort((a,b)=>a.family.localeCompare(b.family));
assert.deepEqual(sortView(oldView),sortView(newView));
assert.deepEqual(vt4PrefixFamily('044/440','3'),['3044','3440']);
const detail=f=>({
 rank:f.rank,family:f.family,
 values:[...new Set(f.paths.map(p=>p.value))].sort(),
 parents:f.parentFamilies,
 witnesses:f.paths.map(p=>({source:p.sourceId,value:p.value,
  cells:p.path.map(c=>c.row+':'+c.col),mother:p.mother,addedDigit:p.addedDigit}))
});
const summary=view=>{
 const t=view.ranks.vt4.slice(0,10);
 return {
  totalVt4Families:view.ranks.vt4.length,
  top3:t.slice(0,3).map(detail),
  top5:t.slice(0,5).map(detail),
  top10:t.map(detail),
  mothersTop10:[...new Set(t.flatMap(f=>f.parentFamilies))],
  exactNumbersTop10:[...new Set(t.flatMap(f=>f.paths.map(p=>p.value)))].sort()
 };
};
const output={date:TARGET,turn:TARGET_TURN,
 phase:'PRE_PROSPECTIVO_VT4_A_B_SIN_CABEZAS_OBJETIVO',
 generatedAtUtc:new Date().toISOString(),
 algorithm:'VT4 solo prefijo físico, comparación viejo concentrado vs diversificado por rondas',
 engineSha256:hash(current),controlEngineSha256:hash(old),
 source14Sha256:hash(read(GOALS)),source13Sha256:hash(read(OLD14)),
 previousDayNocturnas:Object.fromEntries(JURS.map(j=>[j,prev14.Nocturno[j]])),
 missingNocturnaSantaFe:prev14.Nocturno['Santa Fé']==='----',
 historicRefs:refs.map(r=>({date:r.date,period:r.period})),
 visibleColumns:available.columns.slice(0,1).map(c=>({id:c.id,values:c.values})),
 vt3Mothers:newView.ranks.vt3.slice(0,10).map(f=>({family:f.family,rank:f.rank})),
 control:summary(oldView),rounds:summary(newView),
 warning:'El resultado de la Previa 15/10 NO se leyó; este archivo es la selección guardada antes del sorteo. Santa Fé Nocturna 14/10 incompleta y no inventada.'
};
assert.ok(!existsSync(PRE),'No se sobrescribe pronóstico prospectivo sellado');
assert.ok(!existsSync(SEAL),'No se reemplaza SHA PRE');
mkdirSync(OUT,{recursive:true});
writeFileSync(PRE,JSON.stringify(output,null,2)+'\n');
writeFileSync(SEAL,JSON.stringify({
 date:TARGET,turn:TARGET_TURN,kind:'PRE_PROSPECTIVO',
 preSha256:hash(read(PRE)),engineSha256:hash(current),
 sealedAtUtc:new Date().toISOString(),
 notes:'El sello local se publica con commit inmutable y marca horaria de GitHub Actions.'
},null,2)+'\n');
console.log('PRE_VT4_AB_15OCT_OK',JSON.stringify({
 date:TARGET,turn:TARGET_TURN,source14:output.previousDayNocturnas,
 controlTop10:output.control.top10.map(x=>x.family),
 roundsTop10:output.rounds.top10.map(x=>x.family),
 hash:hash(read(PRE))
},null,2));
