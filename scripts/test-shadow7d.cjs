const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ts=require('typescript'),cache=new Map(),base=path.resolve(__dirname,'..');
function load(file){
 const resolved=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(resolved))return cache.get(resolved).exports;
 const source=fs.readFileSync(resolved,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(resolved,mod);
 const req=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(resolved),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:resolved})(req,mod,mod.exports);
 return mod.exports;
}
const {diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {auditCombinedChronologically7D}=load('src/causalReplay7d.ts');
const {auditShadow7D}=load('src/dualFocusShadow7d.ts');
const prev=diaVacio();prev.Nocturno.Ciudad='0012'; // +11 = 23
const dates=['2026-10-02','2026-10-03','2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09'];
function make(date,head){
 const data=diaVacio();if(head)data.Previa.Ciudad=head;
 return {date,sheet:buildSheet(data,prev)};
}
const history=dates.map((d,i)=>make(d,i===0||i===6?'0023':null));
const baseline=auditCombinedChronologically7D(history);
const report=auditShadow7D(history,baseline.rows);
assert.equal(report.turns,1);
assert.equal(report.candidatesEach,baseline.byKind.find(x=>x.kind==='vt2').candidates);
assert.equal(report.baselineHits,1);
assert.equal(report.shadowHits,1);
assert.equal(report.selectedShift,0);
assert.equal(report.actualChanges,0);
assert.equal(report.matchedBudget,true);
assert.equal(report.rows[0].baseline.length,report.rows[0].shadow.length);
assert.equal(report.rows[0].choices[0].sourceId,'prevNocturno');
assert.throws(()=>load('src/dualFocusShadow7d.ts').selectShadowForTurn7D(
 [...history.slice(0,6),history[6]],history[6].sheet,dates[6],'Previa',
 baseline.rows[0].candidates),/futuro/);
const changed=dates.map((d,i)=>make(d,i===0?'0023':i===6?'9999':null));
const other=auditShadow7D(changed,auditCombinedChronologically7D(changed).rows);
assert.deepEqual(other.rows[0].shadow,report.rows[0].shadow,
 'No se puede cambiar el foco al revelar resultados del objetivo');
assert.equal(other.shadowHits,0);
console.log('OK: shadow VT2 equal budget, root preservation, target chronology, no result leakage');
