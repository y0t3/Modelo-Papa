// Prueba con TypeScript REAL: topología de red de VT3 y cobertura de D−7/D−14.
// La cabeza D NO puede cambiar el informe previo, aunque sí su evaluación.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ts=require('typescript'),base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const full=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(full))return cache.get(full).exports;
 const js=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(full,mod);
 const req=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(full),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:full})(req,mod,mod.exports);
 return mod.exports;
}
const {diaVacio}=load('src/domain.ts'),{buildSheet}=load('src/sheet.ts');
const {freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const {graphProfileVT37D,graphChangesVT37D,allPhysicalVT3Before7D,
 projectedHistoricalVT37D,previewVT3NetworkCoverage7D,
 auditVT3NetworkCoverage7D}=load('src/vt3NetworkCoverage7d.ts');
const {reconstructMarkedMoments}=load('src/markedSheet7d.ts');
const dates=['2026-09-25','2026-09-26','2026-09-28','2026-09-29','2026-09-30',
 '2026-10-01','2026-10-02','2026-10-03','2026-10-05','2026-10-06',
 '2026-10-07','2026-10-08','2026-10-09'];
const basePrevious=diaVacio();
basePrevious.Nocturno.Ciudad='0012';basePrevious.Nocturno.Provincia='0023';
basePrevious.Nocturno['Córdoba']='0034';
basePrevious.Nocturno['Santa Fé']='0045';
function make(i,target='0345'){
 const h=diaVacio();
 if(i===0)h.Previa.Ciudad='0234';
 if(i===6)h.Previa.Ciudad='0345';
 if(i===12)h.Previa.Ciudad=target;
 return {date:dates[i],sheet:buildSheet(h,basePrevious)};
}
const days=dates.map((_,i)=>make(i)),before=freezeBeforeTurn7D(days[12].sheet,'Previa');
const prior=days.slice(0,12);
const frozen=previewVT3NetworkCoverage7D(prior,before,dates[12],'Previa');
assert(frozen.hasD7&&frozen.hasD14);
assert(frozen.graphD7.uniqueRoutes>=1);
assert(frozen.pools.pool7.has('345'));
assert(frozen.pools.any.has('345'));
assert(frozen.pools.union.has('345'));
const marked=reconstructMarkedMoments([days[0],days[6]]);
const m14=marked.find(m=>m.date===days[0].date&&m.turn==='Previa');
const m7=marked.find(m=>m.date===days[6].date&&m.turn==='Previa');
assert(m14&&m7);
const pg=graphProfileVT37D(m7.marks);
assert(pg.uniqueRoutes>0&&pg.shapes>0&&pg.uniqueEdges>0);
assert.equal(pg.sources,1);
const changes=graphChangesVT37D(m14.marks,m7.marks);
assert(changes.routesTranslated>=1,'D14 234 y D7 345 tienen traslación VT3 descendente');
const doubleProfile=graphProfileVT37D([...m7.marks,...m7.marks]);
assert.deepEqual(doubleProfile,pg,'La misma ruta repetida por cabezas no aumenta los nodos de red');
const physical=allPhysicalVT3Before7D(before);
assert(physical.has('345')&&!physical.has('999'));
const old=projectedHistoricalVT37D(m14.marks,before);
assert([...old].every(x=>physical.has(x)),'D14 proyectado sólo contiene ternas físicas');
const changed=dates.map((_,i)=>make(i,'9999'));
const changedBefore=freezeBeforeTurn7D(changed[12].sheet,'Previa');
const frozenOther=previewVT3NetworkCoverage7D(changed.slice(0,12),
 changedBefore,dates[12],'Previa');
assert.deepEqual(frozenOther,frozen,
 'El resultado desconocido D no puede cambiar los recorridos y las redes previas');
const audit=auditVT3NetworkCoverage7D(days),auditOther=auditVT3NetworkCoverage7D(changed);
assert.equal(audit.turns,1);
assert.equal(audit.top3Hits,1);
assert.equal(audit.d7OracleHits,1);
assert.equal(audit.physicalHits,1);
assert.equal(audit.notPhysical,0);
assert.equal(auditOther.notPhysical,1,'999 no puede formarse en ningún recorrido');
assert.equal(auditOther.d7OracleHits,0);
assert.equal(auditOther.top3Hits,0);
assert.throws(()=>previewVT3NetworkCoverage7D(days,before,dates[12],'Previa'),/fuga temporal/);
assert.equal(auditVT3NetworkCoverage7D(days.slice(6)).turns,0,
 'Sin calentamiento no hay turno apto');
console.log('OK: VT3 network graph, forks, unique paths, D7/D14 coverage ceilings, and target blinding');
