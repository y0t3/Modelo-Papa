// Verifica genealogía física VT3 con dígitos originales y actuales.
// Cambiar cabezas del turno objetivo NUNCA cambia el diagnóstico previo.
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
const {traceConcreteVT3Before7D}=load('src/vt3ConcreteEvolution7d.ts');
const noct=diaVacio();
for(let i=0;i<6;i++)noct.Nocturno[JURS[i]]=
 ['0012','0023','0034','0045','0056','0067'][i];
function heads(target='0234'){
 const d=diaVacio();
 for(const t of TURNOS)for(let i=0;i<6;i++)
  d[t][JURS[i]]=['0234','0345','0456','0567','0678','0789'][i];
 d.Matutino.Ciudad=target;
 return d;
}
const dates=['2026-10-02','2026-10-05','2026-10-06','2026-10-08','2026-10-09'];
const past=dates.map(date=>({date,sheet:buildSheet(heads(),noct)}));
const date='2026-10-10',full=buildSheet(heads('9999'),noct);
for(let i=0;i<TURNOS.length;i++){
 const t=TURNOS[i],observed=traceConcreteVT3Before7D(past,full,date,t,5);
 assert.equal(observed.visibleSources.length,i+1);
 assert.deepEqual(observed.completedToday,TURNOS.slice(0,i));
 assert.deepEqual(observed.previousDrawDates,dates);
 assert.equal(observed.status,'SOLO_OBSERVACION');
 assert(observed.episodesInMemory>0);
 assert(observed.projections.every(p=>p.anchor.provenance==='RECONSTRUIDA_DE_MATCHES'));
 assert(observed.projections.every(p=>p.originalVT3===p.anchor.wonVT3));
 assert(observed.projections.every(p=>p.originalVT2===p.originalVT3.slice(-2)));
 assert(observed.projections.every(p=>p.todayVT2===p.todayValue?.slice(-2)));
 assert(observed.projections.every(p=>p.anchor.cells.length===3));
 assert(observed.projections.every(p=>p.predecessor===undefined||
   p.predecessor.earlier.sourceId===p.predecessor.later.sourceId));
 assert(observed.projections.every(p=>p.independentOtherColumnAnalogies.every(
  x=>x.sourceId!==p.anchor.sourceId)));
 assert(observed.projections.every(p=>p.anchor.date<date||
   TURNOS.indexOf(p.anchor.turn)<i));
 assert(observed.projections.every(p=>p.availableInCurrentBoard===
  (p.todayValue!==undefined)));
 const altered=diaVacio();
 for(let k=0;k<TURNOS.length;k++)for(let j=0;j<JURS.length;j++)
  altered[TURNOS[k]][JURS[j]]=k<i?
   heads('9999')[TURNOS[k]][JURS[j]]:(k===i?'0000':'8888');
 const other=traceConcreteVT3Before7D(past,buildSheet(altered,noct),date,t,5);
 assert.deepEqual(other,observed,'Fuga del objetivo '+t);
}
const m=traceConcreteVT3Before7D(past,full,date,'Matutino',5);
assert(m.anchors>0&&m.readableProjections>0);
assert(m.projections.some(x=>x.predecessor?.relation==='EXACTA'),
 'Alguna huella VT3 debe repetirse entre jornadas, misma fuente y celdas');
const noWeek=traceConcreteVT3Before7D(past,full,date,'Matutino',5);
assert(noWeek.projections.length>0,'No se exige D-7');
const noHistory=traceConcreteVT3Before7D([],full,date,'Matutino');
assert(noHistory.previousDrawDates.length===0);
assert(noHistory.projections.every(x=>x.anchor.date===date),
 'Con sólo hoy, no se inventan marcas anteriores');
assert.throws(()=>traceConcreteVT3Before7D([...past,{date,sheet:full}],full,
 date,'Matutino'),/fuga temporal/);
assert.throws(()=>traceConcreteVT3Before7D([...past,past[0]],full,
 date,'Matutino'),/repetida/);
assert.throws(()=>traceConcreteVT3Before7D(past,full,date,'Matutino',0),/inválidos/);
console.log('OK: cinco cortes +11; cifras originales y proyectadas, huellas exactas, memoria hoy/ayer, cero D7 obligado y cero futuro');
