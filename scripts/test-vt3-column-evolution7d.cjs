// Toda transición +11 se analiza ANTES del turno siguiente.
// Asegura huellas inmutables y coincide con Top3 adaptativo ya existente.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(p,m);vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  x=>x.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(p),x))):require(x),m,m.exports);
 return m.exports;
}
const {TURNOS,JURS,diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const {inspectBeforeVT3Selection7D}=load('src/vt3SelectedVsExcluded7d.ts');
const {traceDayColumnEvolution7D,compareNextColumnVT37D}=load('src/vt3ColumnEvolution7d.ts');
const noct=diaVacio(),today=diaVacio();
for(let i=0;i<6;i++)noct.Nocturno[JURS[i]]=
 ['0012','0023','0034','0045','0056','0067'][i];
for(const turn of TURNOS)for(let i=0;i<6;i++)
 today[turn][JURS[i]]=['0234','0345','0456','0567','0678','0789'][i];
const history=['2026-10-01','2026-10-02','2026-10-03','2026-10-05',
 '2026-10-06','2026-10-07','2026-10-08','2026-10-09']
 .map(date=>({date,sheet:buildSheet(today,noct)}));
const full=buildSheet(today,noct),date='2026-10-10';
const d=traceDayColumnEvolution7D(history,full,date);
assert.equal(d.stages.length,4);
assert.equal(d.top3ByTurn.length,5);
for(const [i,stage]of d.stages.entries()){
 const before=TURNOS[i],after=TURNOS[i+1];
 const a=inspectBeforeVT3Selection7D(history,freezeBeforeTurn7D(full,before),date,before);
 const b=inspectBeforeVT3Selection7D(history,freezeBeforeTurn7D(full,after),date,after);
 assert.equal(stage.previousColumns,i+1);
 assert.equal(stage.currentColumns,i+2);
 assert.equal(stage.newColumn.id,before);
 assert.equal(stage.newColumn.values.length,6);
 assert.deepEqual(stage.top3Before,a.selected);
 assert.deepEqual(stage.top3After,b.selected);
 assert.equal(stage.eligibleBefore,a.pool.length);
 assert.equal(stage.eligibleAfter,b.pool.length);
 assert.equal(stage.candidateDetails.length,b.pool.length);
 assert.equal(stage.newlyEligible,stage.candidateDetails.filter(x=>x.newlyEligible).length);
 assert.equal(stage.enteredTop3.length,stage.leftTop3.length,
  'Cada corte siempre Top3 completo en este fixture');
 assert(stage.candidateDetails.every(x=>/^\d{3}$/.test(x.value)&&x.cells.length===3));
 assert(stage.newVerifiedVT3Marks>=1,
  'La columna recién cerrada aporta marcas reales comprobadas');
 const different=diaVacio();
 for(let t=0;t<TURNOS.length;t++)for(let j=0;j<JURS.length;j++)
  different[TURNOS[t]][JURS[j]]=
   t<=i?today[TURNOS[t]][JURS[j]]:(t===i+1?'9999':'8888');
 const other=compareNextColumnVT37D(history,buildSheet(different,noct),date,before);
 assert.deepEqual(other,stage,'No leer resultados del turno siguiente ni posteriores: '+after);
}
assert.throws(()=>compareNextColumnVT37D([...history,{date,sheet:full}],full,date,'Previa'),/fuga temporal/);
assert.throws(()=>compareNextColumnVT37D(history,full,date,'Nocturno'),/No existe/);
const empty=diaVacio();const less=buildSheet(empty,noct);
const x=compareNextColumnVT37D(history,less,date,'Previa');
assert.equal(x.newVerifiedVT3Marks,0);
assert.equal(x.newColumn.values.every(v=>v==='--'),true);
console.log('OK: 4 saltos intradiarios sobre las 5 columnas +11; cambio de Top3 exacto, origen físico y no-lookahead confirmado');
