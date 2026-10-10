// Pruebas sobre TypeScript real: la forma VT3 se mueve de posición SIN
// cambiar sus pasos, turno ni columna entre hojas ganadoras D−14/D−7.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const full=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(full))return cache.get(full).exports;
 const source=fs.readFileSync(full,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(full,mod);
 const req=name=>name.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(full),name))):require(name);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:full})(req,mod,mod.exports);
 return mod.exports;
}
const {diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const {readCombined7D}=load('src/combinedReader7d.ts');
const {selectTranslatedVT3D14D7,auditTranslatedVT3D14D7}=load('src/vt3TranslatedD14d7.ts');
const dates=['2026-09-25','2026-09-26','2026-09-28','2026-09-29','2026-09-30',
 '2026-10-01','2026-10-02','2026-10-03','2026-10-05','2026-10-06',
 '2026-10-07','2026-10-08','2026-10-09'];
const previous=diaVacio();
previous.Nocturno.Ciudad='0012';previous.Nocturno.Provincia='0023';
previous.Nocturno['Córdoba']='0034';previous.Nocturno['Santa Fé']='0045';
previous.Nocturno['Entre Ríos']='0056';previous.Nocturno.Montevideo='0067';
// +11 columns rows: 23,34,45,56,67,78
function make(i,target='0345',ancient='0234',weekly='0345'){
 const h=diaVacio();
 if(i===0&&ancient)h.Previa.Ciudad=ancient;
 if(i===6&&weekly)h.Previa.Ciudad=weekly;
 if(i===12&&target)h.Previa.Ciudad=target;
 return {date:dates[i],sheet:buildSheet(h,previous)};
}
const days=dates.map((_,i)=>make(i));
const before=freezeBeforeTurn7D(days[12].sheet,'Previa');
const orig=readCombined7D(days.slice(6,12),before,dates[12],'Previa')
 .candidates.filter(c=>c.kind==='vt3');
const result=selectTranslatedVT3D14D7(days.slice(0,12),before,dates[12],'Previa');
assert(result.bothWeeks);
assert(result.baseline.length>0);
assert.deepEqual(result.baseline.map(c=>c.value),orig.map(c=>c.value),
 'Top3 base debe ser idéntico al lector original');
const translated=result.translated.find(c=>c.value==='345');
assert(translated&&translated.proofs.length,'VT3 345 debe tener forma trasladada');
assert(translated.proofs.some(p=>p.moveRows===1&&p.moveCols===0&&
 p.headD14==='0234'&&p.headD7==='0345'&&p.sourceId==='prevNocturno'&&
 p.coordinatesD14.join('>')!==p.coordinatesD7.join('>')),
 'Se requiere figura antigua 234 trasladada abajo para 345');
assert.equal(result.baseline.length,result.translated.length);
assert(result.translated.every(c=>c.proofs.every(p=>p.coordinatesD14.length===3&&
 p.coordinatesD7.length===3)));
const tally=auditTranslatedVT3D14D7(days);
assert.equal(tally.turns,1);
assert(tally.movementEligible>=1);
assert(tally.translatedHits>=1);
const changed=dates.map((_,i)=>make(i,'9999'));
const frozen=selectTranslatedVT3D14D7(changed.slice(0,12),
 freezeBeforeTurn7D(changed[12].sheet,'Previa'),dates[12],'Previa');
assert.deepEqual(frozen,result,'La cabeza futura no puede alterar el movimiento');
const noAncient=dates.map((_,i)=>make(i,'0345',null));
const noMovement=selectTranslatedVT3D14D7(noAncient.slice(0,12),
 freezeBeforeTurn7D(noAncient[12].sheet,'Previa'),dates[12],'Previa');
assert.equal(noMovement.movementEligible,0,'Sin VT3 ganador D14 no hay continuidad inventada');
const noWeek=dates.map((_,i)=>make(i,'0345','0234',null));
const noD7=selectTranslatedVT3D14D7(noWeek.slice(0,12),
 freezeBeforeTurn7D(noWeek[12].sheet,'Previa'),dates[12],'Previa');
assert.equal(noD7.movementEligible,0,'D−7 sin rutas ganadoras debe abstenerse');
assert.throws(()=>selectTranslatedVT3D14D7(days,before,dates[12],'Previa'),/Fuga temporal/);
assert.equal(auditTranslatedVT3D14D7(days.slice(6)).turns,0,
 'Sin hoja D14 real no se evalúa como ciclo completo');
console.log('OK: traslación VT3 D14/D7 misma forma y columna, presupuesto Top3 y resultado D ciego');
