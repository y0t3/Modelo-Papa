// El tablero 6x2 tiene la MISMA topología en cualquier columna llena:
// comparar sólo formas sería una falsa señal. Verifica también que
// coincidir las 3 cifras en las mismas celdas entre dos columnas es
// distinguible de la mera disponibilidad de una forma.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ts=require('typescript'),root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(root,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(p,m);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  x=>x.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(p),x))):require(x),m,m.exports);
 return m.exports;
}
const {TURNOS,JURS,diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {VT3_PHYSICAL_TOPOLOGY,VT3_PHYSICAL_SHAPES,
 inspectCrossColumnVT37D}=load('src/vt3CrossColumnStructure7d.ts');
assert.equal(VT3_PHYSICAL_TOPOLOGY.length,184);
assert.equal(VT3_PHYSICAL_SHAPES.length,38);
const paths=new Set(VT3_PHYSICAL_TOPOLOGY.map(p=>p.cells.join('>')));
assert.equal(paths.size,184);
for(const path of VT3_PHYSICAL_TOPOLOGY){
 assert.equal(new Set(path.cells).size,3);
 for(let i=1;i<3;i++){
  const a=path.positions[i-1],b=path.positions[i];
  assert(Math.abs(a.row-b.row)<=1&&Math.abs(a.col-b.col)<=1);
 }
}
const prev=diaVacio(),today=diaVacio();
for(let i=0;i<6;i++){
 const h=['0034','0145','0256','0367','0478','0589'][i];
 prev.Nocturno[JURS[i]]=h;
 today.Previa[JURS[i]]=h; // dos columnas idénticas +11
 today.Primera[JURS[i]]='0'+String(100+i).slice(-3);
 today.Matutino[JURS[i]]='1'+String(100+i).slice(-3);
 today.Vespertino[JURS[i]]='2'+String(100+i).slice(-3);
}
const date='2026-10-10',full=buildSheet(today,prev);
for(let i=0;i<TURNOS.length;i++){
 const result=inspectCrossColumnVT37D(full,date,TURNOS[i],12);
 assert.equal(result.available.length,i+1);
 assert.equal(result.observed.completeColumns,i+1);
 assert.equal(result.observed.columns,i+1);
 assert.equal(result.geometricInvariant.routesPerFullColumn,184);
 assert.equal(result.geometricInvariant.shapeTypesPerFullColumn,38);
 assert(result.available.every(x=>x.complete&&x.pathCount===184&&
  x.distinctShapes===38));
 assert.equal(result.observed.shapesSharedAcrossAllColumns,i===0?0:38,
  'Con una sola columna no existe un cruce entre columnas');
 assert.equal(result.control.repetitions,12);
 if(i===0){
  assert.equal(result.observed.repeatedValueAcrossColumns,0);
  assert.equal(result.observed.sameValueSameCoordinates,0);
 }else{
  assert(result.observed.repeatedValueAcrossColumns>0);
  assert(result.observed.sameValueSameCoordinates>0,
   'Columnas idénticas deben repetir ternas VT3 en posiciones exactas');
 }
 const mutated=diaVacio();
 for(let t=0;t<TURNOS.length;t++)for(let j=0;j<6;j++)
  mutated[TURNOS[t]][JURS[j]]=t<i?
   today[TURNOS[t]][JURS[j]]:t===i?'9999':'8888';
 assert.deepEqual(inspectCrossColumnVT37D(buildSheet(mutated,prev),date,TURNOS[i],12),
  result,'El turno objetivo y futuros deben ser invisibles para la geometría');
 assert.deepEqual(inspectCrossColumnVT37D(full,date,TURNOS[i],12),result,
  'Control de permutaciones reproducible, sin aleatoriedad externa');
}
const incomplete=diaVacio();incomplete.Previa.Ciudad='0234';
const sparse=inspectCrossColumnVT37D(buildSheet(incomplete,prev),date,'Primera',12);
assert.equal(sparse.available[1].complete,false);
assert.equal(sparse.available[1].distinctShapes,0);
assert.equal(sparse.available[1].pathCount,0);
assert.equal(sparse.observed.completeColumns,1);
assert.equal(sparse.observed.shapesSharedAcrossAllColumns,0);
assert.throws(()=>inspectCrossColumnVT37D(full,date,'Matutino',0),/inválidos/);
console.log('OK: 184 rutas y 38 formas invariantes por columna completa;');
console.log('coincidencia VT3 de cifras y celdas sí observable; 5 cortes ciegos y control por barajado reproducible.');
