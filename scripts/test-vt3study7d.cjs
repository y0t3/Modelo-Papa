// Prueba sobre TS real del experimento VT3, sin editar el selector oficial.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const cache=new Map(),base=path.resolve(__dirname,'..');
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
const {readCombined7D}=load('src/combinedReader7d.ts');
const {auditVT3Chronological7D}=load('src/vt3Study7d.ts');
const {freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const baseNoct=diaVacio();
baseNoct.Nocturno.Ciudad='0012';baseNoct.Nocturno.Provincia='0023';
baseNoct.Nocturno['Córdoba']='0034'; // +11: 23, 34, 45
const dates=['2026-10-02','2026-10-03','2026-10-05','2026-10-06',
 '2026-10-07','2026-10-08','2026-10-09'];
function sheet(d,i,target='0234'){
 const head=diaVacio();
 if(i===0)head.Previa.Ciudad='0234';
 if(i===6)head.Previa.Ciudad=target;
 return {date:d,sheet:buildSheet(head,baseNoct)};
}
const rows=dates.map((d,i)=>sheet(d,i));
const before=freezeBeforeTurn7D(rows[6].sheet,'Previa');
const normal=readCombined7D(rows.slice(0,6),before,dates[6],'Previa');
const explicit=readCombined7D(rows.slice(0,6),before,dates[6],'Previa',{vt3Limit:3});
assert.deepEqual(normal,explicit,'Modo normal y Top3 explicito son idénticos');
const more=readCombined7D(rows.slice(0,6),before,dates[6],'Previa',{vt3Limit:5});
assert.deepEqual(normal.candidates.filter(x=>x.kind==='vt3'),
 more.candidates.filter(x=>x.kind==='vt3').slice(0,3),
 'Top5 no reordena el ranking Top3');
assert.throws(()=>readCombined7D(rows.slice(0,6),before,dates[6],'Previa',{vt3Limit:7}),/inválido/);
const a=auditVT3Chronological7D(rows,3),b=auditVT3Chronological7D(rows,5);
assert.equal(a.turns,1);
assert(a.exactVT3>=1,'VT3=234 comprobado');
assert(a.vt2Covered>=a.exactVT3,'Todo acierto VT3 contiene su sufijo VT2');
assert(b.exactVT3>=a.exactVT3,'Top5 preserva aciertos Top3');
assert(a.rows[0].ranked.some(x=>x.exactVT3&&x.vt2==='34'));
assert(a.rows[0].ranked.some(x=>x.extensionsVT4.includes('3234')),
 'Una celda adicional debe ser contigua y de la misma columna');
const changed=dates.map((d,i)=>sheet(d,i,'0034'));
const c=auditVT3Chronological7D(changed,3);
assert.deepEqual(c.rows[0].ranked.map(x=>[x.value,x.cells,x.signals,x.extensionsVT4]),
 a.rows[0].ranked.map(x=>[x.value,x.cells,x.signals,x.extensionsVT4]),
 'Cambiar la cabeza objetivo NO puede cambiar la proyección');
assert.equal(c.exactVT3,0);
assert(c.vt2Only>=1,'VT2 integrado puede salir aun cuando VT3 no salga');
assert.equal(c.extensionCoverage,0,'No confundir extension geométrica con predicción VT4');
console.log('OK: VT3 top3/top5, VT2 anidado, extension VT4 física, sin fuga temporal');
