// Prueba del replay ciego contra los modulos TypeScript REALES del proyecto.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ts=require('typescript'),cache=new Map(),base=path.resolve(__dirname,'..');
function load(file){
 const resolved=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(resolved))return cache.get(resolved).exports;
 const source=fs.readFileSync(resolved,'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const module={exports:{}};cache.set(resolved,module);
 const localRequire=(name)=>name.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(resolved),name))):require(name);
 vm.runInThisContext('(function(require,module,exports){'+compiled+'\n})',{filename:resolved})(localRequire,module,module.exports);
 return module.exports;
}
const {diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {auditCombinedChronologically7D,freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const {readCombined7D}=load('src/combinedReader7d.ts');
const prev=diaVacio();prev.Nocturno.Ciudad='0012'; // +11 = 23 en la primera columna
const dates=['2026-10-02','2026-10-03','2026-10-05','2026-10-06',
 '2026-10-07','2026-10-08','2026-10-09']; // no hay domingo
function day(date,cabeza){
 const current=diaVacio();
 if(cabeza)current.Previa.Ciudad=cabeza;
 return {date,sheet:buildSheet(current,prev)};
}
const history=dates.map((d,i)=>day(d,i===0||i===6?'0023':undefined));
const safe=freezeBeforeTurn7D(history[6].sheet,'Previa');
assert.equal(safe.columns.length,1,'Solo la columna previa al sorteo');
assert.deepEqual(safe.matches.Previa,[],'Sin marcas del sorteo objetivo');
assert.deepEqual(safe.heads.Previa,[],'Sin cabezas del sorteo objetivo');
const before=readCombined7D(history.slice(0,6),safe,dates[6],'Previa');
assert(before.candidates.some(c=>c.kind==='vt2'&&c.value==='23'),
 'La cabeza 0023 de D-7 sostiene la proyeccion VT2 23');
const audit=auditCombinedChronologically7D(history);
assert.equal(audit.evaluatedTurns,1);
const vt2=audit.byKind.find(x=>x.kind==='vt2');
assert.equal(vt2.turns,1);
assert.equal(vt2.hits,1);
assert(vt2.randomExpectedHits>0&&vt2.randomExpectedHits<1,'Azar con igual presupuesto');
assert.equal(audit.byKind.find(x=>x.kind==='vt3').hits,0,'VT3 no hereda VT2');
const changed=dates.map((d,i)=>day(d,i===0?'0023':i===6?'9999':undefined));
const other=auditCombinedChronologically7D(changed);
assert.deepEqual(other.rows[0].candidates.map(c=>[c.kind,c.value,c.cells,c.signals]),
 audit.rows[0].candidates.map(c=>[c.kind,c.value,c.cells,c.signals]),
 'Cambiar SOLO el resultado objetivo no puede cambiar la prediccion');
assert.equal(other.byKind.find(x=>x.kind==='vt2').hits,0,
 'El resultado objetivo solo cambia la evaluacion posterior');
const noD7=['2026-10-01','2026-10-03','2026-10-05','2026-10-06',
 '2026-10-07','2026-10-08','2026-10-09'].map((d,i)=>day(d,i===0||i===6?'0023':undefined));
const missing=auditCombinedChronologically7D(noD7);
assert.equal(missing.evaluatedTurns,1);
assert.equal(missing.byKind.find(x=>x.kind==='vt2').abstentions,1,
 'Nunca sustituir D-7 exacta por una fecha diferente');
assert.equal(auditCombinedChronologically7D(history.slice(0,6)).evaluatedTurns,0,
 'Las jornadas de calentamiento no son evaluaciones');
assert.throws(()=>auditCombinedChronologically7D([history[0],history[0]]),/repetidas/);
console.log('OK: replay cronologico VT2/VT3/VT4; azar; turno objetivo ciego; D-7 exacta; sin datos duplicados');
