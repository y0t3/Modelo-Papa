// Reglas de procedencia sobre TS real. No se permite elevar un hallazgo
// matematico posterior a marca manual.
const fs=require('fs'),assert=require('assert/strict'),vm=require('vm'),path=require('path'),ts=require('typescript');
const content=fs.readFileSync(path.join(__dirname,'../src/manualMarkProvenance7d.ts'),'utf8');
const compiled=ts.transpileModule(content,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
const mod={exports:{}};vm.runInThisContext('(function(module,exports){'+compiled.outputText+'\n})')(mod,mod.exports);
const {tagVisualSource7D,assessMarkAgainstRoute7D,manualPriority7D}=mod.exports;
const opt={date:'2026-10-07',turn:'Vespertino',kind:'VT3',sourceId:'Primera'};
const L=['2:0','2:1','1:1'],line=['3:1','2:1','1:1'];
const auto=tagVisualSource7D({...opt,provenance:'AUTO_DESPUES_CABEZA',cells:L,supportReference:'Provincia 0261'});
assert.equal(manualPriority7D(auto,'2026-10-08'),'NO_PRIORIDAD_MANUAL');
assert.equal(assessMarkAgainstRoute7D(auto,L),'SOLO_AUTO_RECONSTRUIDO');
const trace=tagVisualSource7D({...opt,provenance:'MANUAL_TRAZO_ORDENADO',cells:L,supportReference:'video minuto 12, verificado'});
assert.equal(assessMarkAgainstRoute7D(trace,L),'TRAZO_EXACTO_VERIFICADO');
assert.equal(assessMarkAgainstRoute7D(trace,line),'NO_COINCIDE');
assert.equal(manualPriority7D(trace,'2026-10-08'),'GEOMETRIA_MANUAL_APTA');
assert.equal(manualPriority7D(trace,'2026-10-07'),'NO_PRIORIDAD_MANUAL');
const highlighted=tagVisualSource7D({...opt,provenance:'MANUAL_CELDAS_RESALTADAS',cells:[...L,'3:1'],supportReference:'video'});
assert.equal(assessMarkAgainstRoute7D(highlighted,L),'HUELLA_POSIBLE_DIRECCION_NO_VERIFICADA');
assert.equal(assessMarkAgainstRoute7D(highlighted,line),'HUELLA_POSIBLE_DIRECCION_NO_VERIFICADA');
assert.equal(manualPriority7D(highlighted,'2026-10-08'),'SOLO_ZONA_MANUAL');
assert.throws(()=>tagVisualSource7D({...opt,provenance:'MANUAL_TRAZO_ORDENADO',cells:L,supportReference:''}),/referencia visual/);
assert.throws(()=>tagVisualSource7D({...opt,provenance:'MANUAL_TRAZO_ORDENADO',cells:['0:0','2:0','3:0'],supportReference:'video'}),/no contigua/);
assert.throws(()=>tagVisualSource7D({...opt,provenance:'MANUAL_TRAZO_ORDENADO',cells:['0:0','0:0','1:0'],supportReference:'video'}),/repite/);
console.log('OK: trazos originales, huellas resaltadas y rutas reconstruidas separadas');
