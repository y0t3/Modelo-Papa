// Hipótesis preregistrada: sin NUEVA evidencia VT3, probar no expulsar
// todo un Top3 por el reloj, manteniendo el mismo presupuesto.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(p,m);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  x=>x.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(p),x))):require(x),m,m.exports);
 return m.exports;
}
const {TURNOS,JURS,diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {previewStabilityGuardVT37D,auditStabilityGuardVT37D}=load('src/vt3StabilityGuard7d.ts');
const {compareNextColumnVT37D}=load('src/vt3ColumnEvolution7d.ts');
const baseHeads=diaVacio(),today=diaVacio();
for(let i=0;i<6;i++)baseHeads.Nocturno[JURS[i]]=
 ['0012','0023','0034','0045','0056','0067'][i];
for(const t of TURNOS)for(let i=0;i<6;i++)today[t][JURS[i]]=
 ['0234','0345','0456','0567','0678','0789'][i];
const dates=['2026-10-01','2026-10-02','2026-10-03','2026-10-05',
 '2026-10-06','2026-10-07','2026-10-08','2026-10-09'];
const history=dates.map(date=>({date,sheet:buildSheet(today,baseHeads)}));
const date='2026-10-10',full=buildSheet(today,baseHeads);
for(let i=0;i<4;i++){
 const turn=TURNOS[i];
 const old=compareNextColumnVT37D(history,full,date,turn);
 const preview=previewStabilityGuardVT37D(history,full,date,turn);
 assert.equal(preview.nextTarget,TURNOS[i+1]);
 assert.deepEqual(preview.original,old.top3After);
 assert.equal(preview.conservative.length,preview.original.length);
 assert(preview.conservative.length<=3);
 assert.equal(new Set(preview.conservative).size,preview.conservative.length);
 if(preview.reason==='SIN_MARCA_NI_NUEVO_ELEGIBLE')
  assert.deepEqual(preview.conservative,old.top3Before);
 else assert.deepEqual(preview.conservative,old.top3After);
 if(preview.active)assert(old.enteredTop3.length>0);
 const different=diaVacio();
 for(let t=0;t<5;t++)for(let j=0;j<6;j++)
  different[TURNOS[t]][JURS[j]]=t<=i?today[TURNOS[t]][JURS[j]]:
   t===i+1?'9999':'8888';
 const hidden=previewStabilityGuardVT37D(history,
  buildSheet(different,baseHeads),date,turn);
 assert.deepEqual(hidden,preview,'Fuga temporal: '+preview.nextTarget);
}
const sample=auditStabilityGuardVT37D([...history,{date,sheet:full}]);
assert(sample.testedTargets>0);
assert.equal(sample.rows.reduce((n,x)=>n+x.original.length,0),
 sample.rows.reduce((n,x)=>n+x.conservative.length,0));
assert.equal(sample.rows.reduce((n,x)=>n+x.originalHits,0),sample.originalHits);
assert.equal(sample.rows.reduce((n,x)=>n+x.conservativeHits,0),sample.conservativeHits);
assert.throws(()=>previewStabilityGuardVT37D([...history,{date,sheet:full}],full,date,'Previa'),/fuga temporal/);
console.log('OK: retención VT3 solo sin marca ni nuevos elegibles, igual Top3, físico, no consume resultados futuros');
