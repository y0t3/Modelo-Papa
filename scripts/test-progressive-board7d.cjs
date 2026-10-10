// Prueba de la progresión COMPLETA +11: cinco cortes en orden del sorteo.
// Nocturna anterior → Previa → Primera → Matutino → Vespertino → Nocturno.
// No requiere D−7; lee toda la hoja ya disponible y jamás turnos futuros.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ts=require('typescript'),cache=new Map(),base=path.resolve(__dirname,'..');
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
const {JURS,TURNOS,diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {observeProgressiveBoard7D}=load('src/progressiveBoard7d.ts');
const current=diaVacio(),previous=diaVacio();
for(let i=0;i<6;i++)previous.Nocturno[JURS[i]]=['0012','0023','0034','0045','0056','0067'][i];
// Las 4 primeras cabezas de cada turno hacen que la columna +11 reproduzca
// la misma geometría; la quinta cabeza 0234 es una coincidencia VT3 comprobada.
for(const turn of TURNOS)for(let i=0;i<5;i++){
 current[turn][JURS[i]]=['0012','0023','0034','0045','0234'][i];
}
const sheet=buildSheet(current,previous);
const date='2026-10-10';
for(let i=0;i<TURNOS.length;i++){
 const turn=TURNOS[i];
 const observed=observeProgressiveBoard7D([],sheet,date,turn);
 assert.equal(observed.visibleColumns.length,i+1,turn+' debe tener '+(i+1)+' columnas');
 assert.deepEqual(observed.completedTurns,TURNOS.slice(0,i));
 assert.equal(observed.previousWeek,undefined,'D−7 no es requisito');
 assert.equal(observed.lastDraw,undefined,'Ayer tampoco es requisito');
 assert.equal(observed.status,'OBSERVACION_NO_PREDICTIVA');
 assert(observed.visibleColumns.every(c=>c.values.length===6));
 assert(observed.marksToday.every(m=>TURNOS.indexOf(m.winningTurn)<i),
  'No se admiten marcas del sorteo objetivo ni futuras');
 if(i>0)assert(observed.marksToday.some(m=>m.kind==='vt3'&&m.value==='234'),
  'Las coincidencias VT3 de hoy ya conocidas son accesibles en '+turn);
 if(i>=2){
  assert(observed.crossTurnSameDay.some(x=>x.kind==='vt3'),
   'Previa y Primera comparten forma VT3 y pueden compararse ANTES de Matutino');
  assert(observed.crossColumnSameDay.some(x=>x.kind==='vt3'),
   'La forma VT3 puede compararse entre columnas sin mezclar celdas');
 }
 const altered=diaVacio();
 for(let j=0;j<i;j++)altered[TURNOS[j]]={...current[TURNOS[j]]};
 // Los resultados objetivo y posteriores NO pueden influir en este corte.
 for(let j=i;j<TURNOS.length;j++)for(let k=0;k<6;k++)
  altered[TURNOS[j]][JURS[k]]='9999';
 assert.deepEqual(observeProgressiveBoard7D([],buildSheet(altered,previous),date,turn),
  observed,'Fuga de datos del turno objetivo '+turn);
}
const yesterday=diaVacio();
for(let i=0;i<5;i++)yesterday.Previa[JURS[i]]=['0012','0023','0034','0045','0234'][i];
const oldDate='2026-10-09';
const history=[{date:oldDate,sheet:buildSheet(yesterday,previous)}];
const withYesterday=observeProgressiveBoard7D(history,sheet,date,'Matutino');
assert.equal(withYesterday.lastDraw.date,oldDate);
assert(withYesterday.linksToLastDraw.some(x=>x.kind==='vt3'));
assert.equal(withYesterday.previousWeek,undefined);
assert(withYesterday.visibleColumns.length===3);
assert.throws(()=>observeProgressiveBoard7D([{date,sheet}],sheet,date,'Matutino'),
 /fuga temporal/);
assert.throws(()=>observeProgressiveBoard7D([...history,...history],sheet,date,'Matutino'),
 /duplicado/);
console.log('OK: tabla +11 progresiva 1→5 columnas; cada resultado incorpora marcas VT3;');
console.log('    relaciones entre turnos y columnas, ayer opcional, D−7 opcional y cero fuga futura.');
