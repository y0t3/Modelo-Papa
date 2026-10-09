// Ejecuta el TS real con TypeScript instalado, sin alterar el motor de quiniela.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const src=fs.readFileSync(path.join(__dirname,'../src/figureSpatialWatch7d.ts'),'utf8');
const compiled=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
const mod={exports:{}};
vm.runInThisContext('(function(module,exports){'+compiled.outputText+'\n})',{filename:'figureSpatialWatch7d.ts'})(mod,mod.exports);
const f=mod.exports;
let p=f.describeSpatialPair7D(['0:0','1:0'],['1:0','2:0']);
assert.equal(p.fixed.zone,'ALTA');assert.equal(p.shifted.zone,'ALTA');assert.equal(p.vertical,'ABAJO');
p=f.describeSpatialPair7D(['2:1','3:1'],['1:1','2:1']);
assert.equal(p.fixed.zone,'MEDIA');assert.equal(p.shifted.zone,'ALTA');assert.equal(p.vertical,'ARRIBA');
const t=f.freezeSpatialWatch7D({date:'2026-10-09',turn:'Nocturno',sourceId:'Previa',root:['2:1','3:1'],shifted:['1:1','2:1'],fixedPhase:'REPOSO',shiftedPhase:'REACTIVACION_1',shiftLastSupport:'2026-10-08'});
assert.equal(t.observation,'REACTIVACION_REGISTRADA');assert.equal(t.promoteAutomatically,false);
assert.throws(()=>f.freezeSpatialWatch7D({date:'2026-10-09',turn:'Nocturno',sourceId:'Previa',root:['2:1','3:1'],shifted:['1:1','2:1'],fixedPhase:'REPOSO',shiftedPhase:'REACTIVACION_1',shiftLastSupport:'2026-10-09'}),/Fuga temporal/);
assert.throws(()=>f.describeSpatialPair7D(['0:0','1:0'],['2:0','3:0']),/rigida cercana/);
assert.throws(()=>f.describeSpatialPair7D(['0:0','0:0'],['1:0','1:0']),/repite/);
assert.throws(()=>f.describeSpatialPair7D(['0:0','2:0'],['1:0','3:0']),/no contigua/);
console.log('OK: zona, direccion, geometria 6x2, reposo registrado y sin fuga del turno objetivo');
