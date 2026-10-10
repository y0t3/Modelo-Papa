// El lector vivo adapta un módulo EXISTENTE, sin exigir D-7.
// Verifica las cinco etapas progresivas, el límite Top3 VT3 y el corte
// temporal estricto respecto del resultado objetivo.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ts=require('typescript'),base=path.resolve(__dirname,'..'),cache=new Map();
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
const {TURNOS,JURS,diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {readLiveVT3Pilot7D,auditLiveVT3Pilot7D}=load('src/liveVT3Pilot7d.ts');
const basePrev=diaVacio(),today=diaVacio(),prior=diaVacio();
for(let i=0;i<6;i++)basePrev.Nocturno[JURS[i]]=
 ['0012','0023','0034','0045','0056','0067'][i];
for(const turn of TURNOS)for(let i=0;i<5;i++)today[turn][JURS[i]]=
 ['0012','0023','0034','0045','0234'][i];
prior.Previa.Ciudad='0234';
const full=buildSheet(today,basePrev);
const date='2026-10-10';
const yday={date:'2026-10-09',sheet:buildSheet(prior,basePrev)};
for(let i=0;i<TURNOS.length;i++){
 const target=TURNOS[i];
 const r=readLiveVT3Pilot7D([yday],full,date,target);
 assert.equal(r.availableColumns,i+1);
 assert.equal(r.completedTurns,i);
 assert.equal(r.hasD7,false,'El día semanal anterior no es obligatorio');
 assert(r.candidates.length<=3);
 assert.equal(new Set(r.candidates.map(c=>c.value)).size,r.candidates.length);
 assert(r.candidates.every(c=>/^\d{3}$/.test(c.value)&&c.path.length===3));
 const altered=diaVacio();
 for(let t=0;t<TURNOS.length;t++)for(let j=0;j<6;j++)
  altered[TURNOS[t]][JURS[j]]=t<i?today[TURNOS[t]][JURS[j]]:'9999';
 const changed=readLiveVT3Pilot7D([yday],buildSheet(altered,basePrev),date,target);
 assert.deepEqual(changed,r,'El resultado objetivo no puede alterar el Top3 en '+target);
}
const beforeFirst=readLiveVT3Pilot7D([yday],full,date,'Previa');
assert(beforeFirst.candidates.length>0,'Nocturna anterior + memoria de ayer puede sostener VT3 sin D7');
const withToday=readLiveVT3Pilot7D([],full,date,'Matutino');
assert(withToday.candidates.length>0,
 'Previa y Primera de HOY deben sostener VT3 incluso SIN ayer ni D7');
assert(withToday.candidates.some(c=>c.supportedByToday),
 'Deben provenir de recorrido ganador en turno previo de la misma jornada');
const dated=['2026-10-01','2026-10-02','2026-10-05','2026-10-06','2026-10-08','2026-10-09']
 .map(date=>({date,sheet:buildSheet(prior,basePrev)}));
dated.push({date,sheet:full});
const audit=auditLiveVT3Pilot7D(dated);
assert.equal(audit.turns,5);
assert.equal(audit.byTurn.Matutino.turns,1);
assert(audit.pilotPicks>0&&audit.pilotPicks<=15);
assert.equal(audit.byTurn.Previa.turns,1);
assert.throws(()=>readLiveVT3Pilot7D([{date,sheet:full}],full,date,'Matutino'),/fuga temporal/);
console.log('OK: piloto adaptativo +11 para los cinco turnos, VT3 Top3 sin D7, marcas de hoy y futuro ciego');
