// Control de la regla rectora: Matutina puede leer Previa + Primera de HOY
// sin exigir ninguna hoja D-7 y sin usar las cabezas de Matutina.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
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
const {diaVacio,JURS}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {findPaths}=load('src/paths.ts');
const {freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const {reconstructMarkedMoments}=load('src/markedSheet7d.ts');
const {readCombined7D}=load('src/combinedReader7d.ts');
const prev=diaVacio(),day=diaVacio();
for(let i=0;i<3;i++){
 prev.Nocturno[JURS[i]]=['0012','0023','0034'][i];
 day.Previa[JURS[i]]=['0012','0023','0034'][i];
 day.Primera[JURS[i]]=['0012','0023','0034'][i];
}
day.Previa[JURS[3]]='0234';
day.Primera[JURS[3]]='0234';
day.Matutino[JURS[0]]='9999'; // DATO OBJETIVO PROHIBIDO
const full=buildSheet(day,prev),frozen=freezeBeforeTurn7D(full,'Matutino');
assert.deepEqual(frozen.columns.map(c=>c.id),['prevNocturno','Previa','Primera']);
assert.equal(frozen.heads.Previa.length,4);
assert.equal(frozen.heads.Primera.length,4);
assert.deepEqual(frozen.heads.Matutino,[]);
assert.deepEqual(frozen.matches.Matutino,[]);
const moments=reconstructMarkedMoments([{date:'2026-10-09',sheet:frozen}]);
const previa=moments.find(m=>m.turn==='Previa');
const primera=moments.find(m=>m.turn==='Primera');
assert(previa.marks.some(m=>m.kind==='vt3'&&m.value==='234'),'Marcas VT3 de Previa hoy');
assert(primera.marks.some(m=>m.kind==='vt3'&&m.value==='234'),'Marcas VT3 de Primera hoy');
for(const sourceId of ['Previa','Primera']){
 const col=frozen.columns.find(c=>c.id===sourceId);
 assert(findPaths(col.values,'234').length>0,
  'El tablero ya dispone de un VT3 dentro de la columna '+sourceId);
}
const old=readCombined7D([],frozen,'2026-10-09','Matutino');
assert.equal(old.decision,'NO JUGAR','Lector viejo bloquea por D-7');
assert.equal(old.candidates.length,0);
const withoutTarget=diaVacio();
for(let i=0;i<3;i++){
 withoutTarget.Previa[JURS[i]]=['0012','0023','0034'][i];
 withoutTarget.Primera[JURS[i]]=['0012','0023','0034'][i];
}
withoutTarget.Previa[JURS[3]]='0234';
withoutTarget.Primera[JURS[3]]='0234';
const other=freezeBeforeTurn7D(buildSheet(withoutTarget,prev),'Matutino');
assert.deepEqual(other,frozen,'La cabeza objetivo no puede alterar el tablero visible ni marcas previas');
console.log('OK: Previa/Primera visibles, VT3 físicos en cada columna y marcas del mismo día antes de Matutino; D-7 NO es requisito de lectura.');
console.log('Límite actual demostrado: el lector combinado aún se abstiene por ausencia de D-7, aunque hoy tiene señales.');
