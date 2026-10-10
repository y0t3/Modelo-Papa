// Test integral del expediente VT3: reconstrucción real de celdas y
// cifras desde hoja +11, cinco cortes sin fuga, NO selección nueva.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ts=require('typescript'),base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const filePath=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(filePath))return cache.get(filePath).exports;
 const js=ts.transpileModule(fs.readFileSync(filePath,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(filePath,mod);
 const req=n=>n.startsWith('.')?
  load(path.relative(base,path.resolve(path.dirname(filePath),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',
  {filename:filePath})(req,mod,mod.exports);
 return mod.exports;
}
const {TURNOS,JURS,diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {findPaths}=load('src/paths.ts');
const {inspectBeforeVT3Selection7D}=load('src/vt3SelectedVsExcluded7d.ts');
const {buildVisualDossierBefore7D,renderVisualDossierMarkdown7D}=
 load('src/vt3VisualDossier7d.ts');
const previous=diaVacio(),current=diaVacio();
for(let i=0;i<6;i++)previous.Nocturno[JURS[i]]=
 ['0012','0023','0034','0045','0056','0067'][i];
for(const turn of TURNOS)for(let i=0;i<5;i++)
 current[turn][JURS[i]]=['0234','0345','0456','0567','0678'][i];
const dates=['2026-10-01','2026-10-02','2026-10-03','2026-10-05',
 '2026-10-06','2026-10-07','2026-10-08','2026-10-09'];
const prior=dates.map(date=>({date,sheet:buildSheet(current,previous)}));
const targetDate='2026-10-10',full=buildSheet(current,previous);
let previousCount=0;
for(let i=0;i<TURNOS.length;i++){
 const target=TURNOS[i];
 const snapshot=buildVisualDossierBefore7D(prior,full,targetDate,target,3);
 const existing=inspectBeforeVT3Selection7D(prior,full,targetDate,target);
 assert.equal(snapshot.phase,'ANTES_DEL_SORTEO');
 assert.equal(snapshot.columns.length,i+1);
 assert.equal(snapshot.completedTurns.length,i);
 assert.deepEqual(snapshot.top3.map(x=>x.value),existing.selected);
 assert.equal(snapshot.poolSize,existing.pool.length);
 assert(snapshot.top3.length<=3&&snapshot.alternatives.length<=3);
 assert(!snapshot.top3.some(x=>snapshot.alternatives.some(y=>x.value===y.value)));
 for(const fig of [...snapshot.top3,...snapshot.alternatives]){
  assert.equal(fig.vt2Suffix,fig.value.slice(-2));
  assert(fig.allPhysicalRoutes.length>0);
  const unique=new Set();
  for(const route of fig.allPhysicalRoutes){
   assert(route.cells.length===3);
   assert.equal(route.digits,fig.value);
   const col=snapshot.columns.find(x=>x.id===route.sourceId);
   assert(col,'La ruta siempre tiene un origen físico conocido');
   assert(findPaths(col.values,fig.value).some(x=>
    x.map(p=>p.row+':'+p.col).join('>')===route.cells.join('>')));
   const k=route.sourceId+'|'+route.cells.join('>');
   assert(!unique.has(k));unique.add(k);
  }
  assert(fig.todayLinks.every(x=>TURNOS.indexOf(x.turn)<i));
  assert(fig.todayLinks.every(x=>x.relation!=='OTRA_FORMA'));
  assert(fig.otherColumnLinks.every(x=>x.relation==='MISMA_FORMA'));
 }
 const md=renderVisualDossierMarkdown7D(snapshot);
 assert(md.includes('Tablero +11 visible'));
 assert(md.includes('ANTES DEL SORTEO'));
 assert(md.includes('Resultado real:'));
 // Cambiar las cabezas del objetivo y todas las posteriores NO PUEDE
 // reescribir el expediente. Se conservaron todos los resultados anteriores.
 const altered=diaVacio();
 for(let k=0;k<TURNOS.length;k++)for(let j=0;j<JURS.length;j++)
  altered[TURNOS[k]][JURS[j]]=
   k<i?current[TURNOS[k]][JURS[j]]:(k===i?'9999':'8888');
 const blinded=buildVisualDossierBefore7D(prior,
  buildSheet(altered,previous),targetDate,target,3);
 assert.deepEqual(blinded,snapshot,'Fuga futura para '+target);
 assert.equal(JSON.stringify(blinded).includes('9999'),false);
 if(i>0)previousCount+=snapshot.top3.length;
}
assert(previousCount>0);
assert.throws(()=>buildVisualDossierBefore7D(
 [...prior,{date:targetDate,sheet:full}],full,targetDate,'Matutino',3),/fuga temporal/);
assert.throws(()=>buildVisualDossierBefore7D(prior,full,targetDate,'Previa',11),
 /comparativas inválido/);
console.log('OK: expedientes VT3 +11 de los 5 turnos; todas las rutas físicas, alternativas y trazas visibles, sin fuga futura ni cambio Top3');
