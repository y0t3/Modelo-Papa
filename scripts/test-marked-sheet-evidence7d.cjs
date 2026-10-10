// TEST: leer sólo marcas visuales verificadas, nunca rutas generadas
// retrospectivamente para una cabeza. Caso real documentado: Provincia
// Vespertino 0261 (7/10/2026), sin atribución manual de ninguna ruta.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(root,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const compiled=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(p,mod);
 const req=n=>n.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(p),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+compiled+'\n})',{filename:p})(req,mod,mod.exports);
 return mod.exports;
}
const {readMarkedSheetEvidenceBefore7D,validateMarkedWitness7D}=
 load('src/markedSheetEvidenceReader7d.ts');
const {diaVacio,JURS,TURNOS}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const audit=JSON.parse(fs.readFileSync(path.join(root,
 'evidencia-visual/octubre-07-0261-por-verificar.json'),'utf8'));
const d=diaVacio(),before=diaVacio();
const plus11={
 prevNocturno:['07','56','49','87','92','42'],
 Previa:['77','69','02','21','27','--'],
 Primera:['00','71','26','52','23','--'],
 Matutino:['59','57','12','64','58','54'],
 Vespertino:['39','72','88','52','88','--']
};
function undoPlus11(p){
 if(p==='--')return '----';
 return '00'+String((Number(p)+89)%100).padStart(2,'0');
}
for(let i=0;i<JURS.length;i++){
 before.Nocturno[JURS[i]]=undoPlus11(plus11.prevNocturno[i]);
 for(const turn of TURNOS.slice(0,4))
  d[turn][JURS[i]]=undoPlus11(plus11[turn][i]);
}
d.Vespertino.Provincia='0261'; // resultado PUBLICADO, no dibujo inferido
const oct07=buildSheet(d,before);
const october08=diaVacio();
const prev08=buildSheet(october08,d);
const beforeV=readMarkedSheetEvidenceBefore7D([],oct07,'2026-10-07',
 'Vespertino',[audit]);
assert.equal(beforeV.witnessesAvailable,0,
 'La cabeza de Vespertino no puede estar marcada ANTES de Vespertino');
const afterV=readMarkedSheetEvidenceBefore7D([],oct07,'2026-10-07',
 'Nocturno',[audit]);
assert.equal(afterV.witnessesAvailable,4);
assert.equal(afterV.confirmedManualTraces,0,
 'TRES rutas reconstruidas de 0261 no prueban que papá haya marcado ninguna');
assert.equal(afterV.pendingOriginalImageCheck,1);
assert.equal(afterV.automaticReconstructionsExcluded,3);
assert.equal(afterV.decision,'INTERPRETACION_VISUAL_PENDIENTE');
assert.equal(afterV.reviews.some(x=>x.currentRead!==undefined),false);
assert.deepEqual(afterV.visibleColumns,['prevNocturno','Previa','Primera','Matutino','Vespertino']);
const nextDay=readMarkedSheetEvidenceBefore7D(
 [{date:'2026-10-07',sheet:oct07}],prev08,'2026-10-08','Previa',[audit]);
assert.equal(nextDay.confirmedManualTraces,0);
assert.equal(nextDay.witnessesAvailable,4);
assert.equal(nextDay.decision,'INTERPRETACION_VISUAL_PENDIENTE');
// Contraprueba sintética: si realmente tuviéramos un fotograma legible
// con el orden 2:0→2:1→1:1 y la cabeza debajo, habilita SOLO esa ruta.
const confirmed={...audit.witnesses[1],id:'solo-para-prueba-sintetica',
 status:'TRAZO_MANUAL_ORDENADO_VERIFICADO',headLocation:'DEBAJO_VISIBLE',
 reference:'ESCENARIO SINTÉTICO DE TEST — no trazo original del padre'};
const synthetic={date:'2026-10-07',mediaReferences:['PRUEBA SINTÉTICA — no fuente real'],
 witnesses:[confirmed]};
const testing=readMarkedSheetEvidenceBefore7D(
 [{date:'2026-10-07',sheet:oct07}],prev08,'2026-10-08','Previa',[synthetic]);
assert.equal(testing.confirmedManualTraces,1);
assert.equal(testing.reviews[0].originalRead,'261');
assert.equal(testing.reviews[0].sourceVisibleNow,false);
assert.equal(testing.reviews[0].currentRead,undefined);
// Los campos son válidos individualmente, pero una cabeza distinta NO
// puede justificar ese recorrido en la hoja manuscrita.
assert.throws(()=>readMarkedSheetEvidenceBefore7D(
 [{date:'2026-10-07',sheet:oct07}],prev08,'2026-10-08','Previa',[
 {...synthetic,witnesses:[{...confirmed,headCoincidente:'0000'}]}
 ]),/no coinciden/);
assert.throws(()=>validateMarkedWitness7D({
 ...confirmed,status:'FOTOGRAMA_REFERENCIADO_SIN_CELDAS_DIGITALIZADAS'
}),/No se pueden atribuir/);
assert.throws(()=>readMarkedSheetEvidenceBefore7D(
 [{date:'2026-10-08',sheet:prev08}],prev08,'2026-10-08','Previa',[audit]),
 /fuga temporal/);
console.log('OK: 0261 tres rutas automáticas quedan FUERA de lectura manual; cabezas futuras ocultas y sólo dibujo sintético con fuente verificada habilita lectura');
