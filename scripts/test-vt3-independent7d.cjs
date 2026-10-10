// Ensayos unitarios sobre módulos reales: VT3 apoyado por VT2 anterior e INDEPENDIENTE.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
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
const {freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const {selectVT3ByIndependentVT27D,auditIndependentVT2ForVT37D}=
 load('src/vt3IndependentSupport7d.ts');
const prev=diaVacio();prev.Nocturno.Ciudad='0012';
prev.Nocturno.Provincia='0023';prev.Nocturno['Córdoba']='0034';
const dates=['2026-10-02','2026-10-03','2026-10-05','2026-10-06',
 '2026-10-07','2026-10-08','2026-10-09'];
function one(i,target='0234',intermediate='9934'){
 const d=diaVacio();
 if(i===0)d.Previa.Ciudad='0234';
 if(i===4&&intermediate)d.Previa.Ciudad=intermediate;
 if(i===6)d.Previa.Ciudad=target;
 return {date:dates[i],sheet:buildSheet(d,prev)};
}
const days=dates.map((d,i)=>one(i));
const before=freezeBeforeTurn7D(days[6].sheet,'Previa');
const original=readCombined7D(days.slice(0,6),before,dates[6],'Previa');
const unlimited=readCombined7D(days.slice(0,6),before,dates[6],'Previa',{vt3Limit:'ALL'});
assert.deepEqual(original.candidates.filter(x=>x.kind==='vt3'),
 unlimited.candidates.filter(x=>x.kind==='vt3').slice(0,3),
 'Enumerar todos los VT3 no cambia el ranking original');
const selection=selectVT3ByIndependentVT27D(days.slice(0,6),before,dates[6],'Previa');
assert(selection.baseline.some(x=>x.value==='234'),'VT3 heredado D-7 234');
assert(selection.supported.some(x=>x.value==='234'&&x.exactDates>=1&&
 x.evidence.some(z=>z.head==='9934'&&z.date===dates[4]&&z.type==='EXACTA')),
 'VT2=34 de otra cabeza sin VT3 debe reforzar la huella de 234');
assert(selection.requested===selection.baseline.length);
assert(selection.supported.length===selection.baseline.length);
const targetChanged=one(6,'9999');
const changed=selectVT3ByIndependentVT27D(days.slice(0,6),
 freezeBeforeTurn7D(targetChanged.sheet,'Previa'),dates[6],'Previa');
assert.deepEqual(changed,selection,'No usar cabezas objetivo para seleccionar apoyos');
const noSupportDays=dates.map((d,i)=>one(i,'0234',null));
const bare=selectVT3ByIndependentVT27D(noSupportDays.slice(0,6),
 freezeBeforeTurn7D(noSupportDays[6].sheet,'Previa'),dates[6],'Previa');
assert.equal(bare.poolWithExact,0,'El VT2 de D-7 no suma como segundo apoyo independiente');
const a=auditIndependentVT2ForVT37D(days);
const b=auditIndependentVT2ForVT37D([...days.slice(0,6),targetChanged]);
assert.equal(a.turns,1);
assert.equal(a.selectedPicks,b.selectedPicks,'Igual cantidad aunque cambie el resultado');
assert.deepEqual(a.rows[0].supported,b.rows[0].supported);
assert(a.selectedPicks<=3);
assert.throws(()=>selectVT3ByIndependentVT27D(days,before,dates[6],'Previa'),/Fuga temporal/);
console.log('OK: VT3 apoyo VT2 físico independiente, mismo Top3, sin doble conteo D-7 ni fuga futura');
