// Asegura que inspeccionar TODOS los VT3 no altera la selección
// original y que los rasgos HOY/AYER/D7 se conocen ANTES del objetivo.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ts=require('typescript'),cache=new Map(),base=path.resolve(__dirname,'..');
function load(file){
 const p=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(p,mod);
 const req=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(p),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(req,mod,mod.exports);
 return mod.exports;
}
const {diaVacio,JURS,TURNOS}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {analyzeAdaptive7D}=load('src/adaptive7d.ts');
const {freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const {inspectBeforeVT3Selection7D,auditSelectedVsExcludedVT37D}=
 load('src/vt3SelectedVsExcluded7d.ts');
const previous=diaVacio();for(let i=0;i<6;i++)
 previous.Nocturno[JURS[i]]=['0012','0023','0034','0045','0056','0067'][i];
const dates=['2026-10-01','2026-10-02','2026-10-03','2026-10-05',
 '2026-10-06','2026-10-07','2026-10-08','2026-10-09'];
function heads(target='0000'){
 const h=diaVacio();
 for(const turn of TURNOS)for(let i=0;i<5;i++)
  h[turn][JURS[i]]=['0234','0345','0456','0567','0678'][i];
 h.Matutino.Ciudad=target;return h;
}
const historic=dates.map(date=>({date,sheet:buildSheet(heads('0234'),previous)}));
const date='2026-10-10',full=buildSheet(heads('0999'),previous);
const before=freezeBeforeTurn7D(full,'Matutino');
const baseline=analyzeAdaptive7D([...historic,{date,sheet:before}],
 before,date,'Matutino');
const instrument=analyzeAdaptive7D([...historic,{date,sheet:before}],
 before,date,'Matutino',{inspectVT3Pool:true});
const {vt3PoolForAudit,...noAudit}=instrument;
assert.deepEqual(noAudit,baseline,'El modo inspección no altera nada de la salida original');
const selected=baseline.candidates.filter(c=>c.kind==='vt3').map(c=>c.value);
assert(vt3PoolForAudit.length>=selected.length);
assert.deepEqual(vt3PoolForAudit.slice(0,selected.length).map(x=>x.value),
 selected,'Ranking original debe conservarse exactamente en el pool');
const preview=inspectBeforeVT3Selection7D(historic,full,date,'Matutino');
assert.deepEqual(preview.selected,selected);
assert.deepEqual(preview.pool.slice(0,selected.length).map(x=>x.value),selected);
assert(preview.pool.every(x=>x.cells.length===3&&/^\d{3}$/.test(x.value)));
assert(preview.pool.some(x=>x.features.includes('HOY_MISMA_FORMA_Y_ORIGEN')),
 'La evidencia de turno terminado hoy está disponible ANTES de Matutino');
const altered=heads('0999');
for(const turn of ['Matutino','Vespertino','Nocturno'])
 for(const j of JURS)altered[turn][j]='9999';
const shifted=inspectBeforeVT3Selection7D(historic,
 buildSheet(altered,previous),date,'Matutino');
assert.deepEqual(shifted,preview,'La cabeza del objetivo y los turnos posteriores son invisibles');
assert.throws(()=>inspectBeforeVT3Selection7D([...historic,{date,sheet:full}],full,date,'Matutino'),
 /fuga temporal/);
const historical=[...historic];
const report=auditSelectedVsExcludedVT37D(historical,5);
assert(report.turns>0);
assert.equal(report.eligibleWinningValues-report.selectedHits,
 report.missedEligibleWinners);
assert.equal(report.rows.reduce((s,x)=>s+x.selectedCount,0),
 report.selectedCandidates);
assert(report.eligibleCandidates>=report.selectedCandidates);
console.log('OK: diagnóstico VS Top3 sin alterar pesos, con marcas físicas de hoy y ayer, causa previa al objetivo, candidatos únicos');
