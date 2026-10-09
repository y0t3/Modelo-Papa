// Regression checks for frozen, pre-result geometric readings.
// Runs ACTUAL src/figureReadings7d.ts via TypeScript transpiler, not a Python model.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/figureReadings7d.ts'),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},reportDiagnostics:true});
assert.equal(js.diagnostics.length,0,'TypeScript transpilation diagnostics');
const module={exports:{}};
vm.runInThisContext('(function(require,module,exports){'+js.outputText+'\n})',{filename:'figureReadings7d.ts'})(name=>name==='./domain'?{TURNOS:['Previa','Primera','Matutino','Vespertino','Nocturno']}:require(name),module,module.exports);
const {freezeFigureReadings7D,evaluateFigureReadings7D,observationOfFigure7D}=module.exports;
const vals=['34','75','68','19','20','31'];
const sheet={columns:[
 {id:'prevNocturno',values:vals},{id:'Previa',values:vals},{id:'Primera',values:vals},
 {id:'Matutino',values:vals},{id:'Vespertino',values:vals}
],matches:{},heads:{}};
const L=[{row:0,col:0,digit:'3'},{row:0,col:1,digit:'4'},{row:1,col:1,digit:'5'}];
const f=freezeFigureReadings7D(sheet,'2026-10-09','Nocturno','vt3','Primera',L);
assert.equal(f.figure,'L');assert.equal(f.direct,'345');assert.equal(f.reverse,'543');
assert.equal(f.vt2Inverse,'54');
assert(f.footprintAlternatives.includes('354'),'alternate contiguous order of SAME cells pre-authorized');
const cmp=(head,expected)=>{
 const e=evaluateFigureReadings7D(f,[head]);
 assert.equal(e.primaryClass,expected,head);
 return e;
};
assert.equal(cmp('0345','EXACTA').numericExact,true);
assert.equal(cmp('0543','INVERSA_COMPLETA').reverseFull,true);
const reorder=cmp('0354','MISMA_HUELLA');
assert.equal(reorder.sameFootprint,true);
assert.equal(reorder.vt2Inverse,true,'VT2 inverse remains an independent flag, not an extra draw');
assert.equal(reorder.numericExact,false);
assert.equal(observationOfFigure7D(reorder),'APOYO_GEOMETRICO_SIN_EXACTITUD');
const part=cmp('0654','VT2_INVERSO');
assert.equal(part.geometricCompatible,false,'VT2 suffix alone does not confirm physical three-cell footprint');
cmp('0999','SIN_COINCIDENCIA');
assert.equal(evaluateFigureReadings7D(f,['0543','1543']).headsChecked,2);
assert.equal(evaluateFigureReadings7D(f,['0543','0543']).headsChecked,1);
assert.throws(()=>freezeFigureReadings7D(sheet,'2026-10-09','Previa','vt3','Primera',L),/columnas futuras/);
assert.throws(()=>freezeFigureReadings7D(sheet,'2026-10-09','Nocturno','vt3','Primera',L.map((x,i)=>i===0?{...x,digit:'9'}:x)),/no coincide/);
const noRepeat=[L[0],L[1],L[0]];assert.throws(()=>freezeFigureReadings7D(sheet,'2026-10-09','Nocturno','vt3','Primera',noRepeat),/repite celda/);
const broken=[L[0],{row:5,col:1,digit:'1'},L[2]];
assert.throws(()=>freezeFigureReadings7D(sheet,'2026-10-09','Nocturno','vt3','Primera',broken),/no contiguo/);
const two=freezeFigureReadings7D(sheet,'2026-10-09','Nocturno','vt2','Primera',L.slice(1));
assert.equal(two.direct,'45');assert.equal(two.reverse,'54');
assert.equal(evaluateFigureReadings7D(two,['0354']).primaryClass,'INVERSA_COMPLETA');
console.log('OK: TypeScript actual - figure L, 345, 543, 354, inverse VT2, causal cells, no cross columns, deduplicated heads');
