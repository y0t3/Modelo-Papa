const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const full=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(full))return cache.get(full).exports;
 const js=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(full,mod);
 const req=name=>name.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(full),name))):require(name);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:full})(req,mod,mod.exports);
 return mod.exports;
}
const {diaVacio}=load('src/domain.ts'),{buildSheet}=load('src/sheet.ts');
const {freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const {selectRepeatedGeometryVT3,auditRepeatedGeometryVT3}=load('src/vt3RepeatedD14d7.ts');
const dates=['2026-09-25','2026-09-26','2026-09-28','2026-09-29','2026-09-30',
 '2026-10-01','2026-10-02','2026-10-03','2026-10-05','2026-10-06',
 '2026-10-07','2026-10-08','2026-10-09'];
const prev=diaVacio();
prev.Nocturno.Ciudad='0012';prev.Nocturno.Provincia='0023';
prev.Nocturno['Córdoba']='0034'; // rows +11 => 23,34,45
function make(i,target='0234',d14='0234'){
 const heads=diaVacio();
 if(i===0)heads.Previa.Ciudad=d14;
 if(i===6)heads.Previa.Ciudad='0234';
 if(i===12)heads.Previa.Ciudad=target;
 return {date:dates[i],sheet:buildSheet(heads,prev)};
}
const rows=dates.map((date,i)=>make(i));
const before=freezeBeforeTurn7D(rows[12].sheet,'Previa');
const sel=selectRepeatedGeometryVT3(rows.slice(0,12),before,dates[12],'Previa');
assert.equal(sel.hasBothWeeks,true);
assert(sel.baseline.length>0);
assert(sel.repeated.some(x=>x.value==='234'&&x.proofs.some(p=>p.headD7==='0234'&&p.headD14==='0234')));
assert.equal(sel.baseline.length,sel.repeated.length,'Cupo igualado');
const out=auditRepeatedGeometryVT3(rows);
assert.equal(out.turns,1);
assert(out.baselineHits>=1);
assert(out.repeatedHits>=1);
assert(out.repeatEligible>=1);
const alternate=dates.map((date,i)=>make(i,'9999'));
const proof2=selectRepeatedGeometryVT3(alternate.slice(0,12),
 freezeBeforeTurn7D(alternate[12].sheet,'Previa'),dates[12],'Previa');
assert.deepEqual(proof2,sel,'El resultado del turno objetivo no altera continuidad');
const missing=dates.map((date,i)=>make(i,'0234','9999'));
const noD14=selectRepeatedGeometryVT3(missing.slice(0,12),
 freezeBeforeTurn7D(missing[12].sheet,'Previa'),dates[12],'Previa');
assert.equal(noD14.hasBothWeeks,true);
assert.equal(noD14.repeatEligible,0,'No inventar figura repetida si D14 no tiene VT3');
assert.throws(()=>selectRepeatedGeometryVT3(rows,before,dates[12],'Previa'),/fuga temporal/);
assert.equal(auditRepeatedGeometryVT3(rows.slice(6)).turns,0,
 'Sin D14 no se cuantifican oportunidades como si hubiese memoria');
console.log('OK: geometría VT3 marcada D14 y D7, ruta exacta, misma columna y turno, sin fuga ni cambio de presupuesto');
