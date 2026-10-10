// Real reference: Provincia / Vespertino 0261 on Oct 7.
// It is a RESULT first. The 261 is then found on both Primera and
// Matutino +11, the three admissible routes are marked, and 0261
// is entered ONCE under the day sheet. Not a pre-result prediction.
const fs=require('fs'),path=require('path'),vm=require('vm');
const assert=require('node:assert/strict'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(p,mod);
 const req=n=>n.startsWith('.')?
  load(path.relative(base,path.resolve(path.dirname(p),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',
  {filename:p})(req,mod,mod.exports);
 return mod.exports;
}
const {TURNOS,JURS,diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {reconstructMarkedSheetAfterDraw7D}=load('src/markedSheetAfterDraw7d.ts');
const prev=diaVacio(),curr=diaVacio();
const pairs={
 prevNocturno:['07','56','49','87','92','42'],
 Previa:['77','69','02','21','27','--'],
 Primera:['00','71','26','52','23','--'],
 Matutino:['59','57','12','64','58','54'],
 Vespertino:['39','72','88','52','88','--']
};
const fromPlus11=s=>s==='--'?'----':'00'+String((Number(s)+89)%100).padStart(2,'0');
for(let i=0;i<6;i++){
 prev.Nocturno[JURS[i]]=fromPlus11(pairs.prevNocturno[i]);
 for(const turn of TURNOS.slice(0,4))
  curr[turn][JURS[i]]=fromPlus11(pairs[turn][i]);
}
curr.Vespertino.Provincia='0261';
const d='2026-10-07',sheet=buildSheet(curr,prev);
const earlier=reconstructMarkedSheetAfterDraw7D(sheet,d,'Matutino');
assert(!earlier.annotationByTurn.some(x=>x.turn==='Vespertino'));
const marked=reconstructMarkedSheetAfterDraw7D(sheet,d,'Vespertino');
assert.equal(marked.annotationByTurn.length,4);
const v=marked.annotationByTurn[3];
assert.deepEqual(v.allowedSources,['prevNocturno','Previa','Primera','Matutino']);
const province=v.headsBelow.find(x=>x.head==='0261'&&x.jurisdiction==='Provincia');
assert(province,'Aparece la cabeza completa 0261 anotada debajo');
assert.equal(v.headsBelow.filter(x=>x.head==='0261'&&x.jurisdiction==='Provincia').length,1);
const vt3=province.traces.filter(x=>x.kind==='vt3'&&x.value==='261');
assert.equal(vt3.length,3,'El caso real tiene tres recorridos VT3');
assert.deepEqual(vt3.map(x=>x.sourceId+' '+x.cells.join('>')).sort(),[
 'Matutino 2:1>3:0>2:0',
 'Primera 2:0>2:1>1:1',
 'Primera 3:1>2:1>1:1'
].sort());
assert(vt3.every(x=>x.provenance==='COINCIDENCIA_RETROSPECTIVA_CABEZA_CONOCIDA'));
assert(province.traces.every(x=>!['Vespertino','Nocturno'].includes(x.sourceId)));
assert(marked.physicalTraces>=3);
 // El primer dígito de la cabeza COMPLETA no altera la coincidencia VT3.
 // Ejemplo expresamente aclarado: 3261 produce la misma ruta 261,
 // y la anotación inferior debe quedar como 3261 (no '261').
 const example=diaVacio();
 for(const turn of TURNOS)for(const j of JURS)example[turn][j]=curr[turn][j];
 example.Vespertino.Provincia='3261';
 const e=reconstructMarkedSheetAfterDraw7D(buildSheet(example,prev),d,'Vespertino');
 const changedHead=e.annotationByTurn[3].headsBelow.find(x=>x.head==='3261'&&
  x.jurisdiction==='Provincia');
 assert(changedHead);
 assert.equal(changedHead.traces.filter(x=>x.kind==='vt3'&&x.value==='261').length,3);
 assert(!e.annotationByTurn[3].headsBelow.some(x=>x.head==='0261'&&
  x.jurisdiction==='Provincia'));
const changed=diaVacio();
for(const turn of TURNOS)for(const j of JURS)
 changed[turn][j]=curr[turn][j];
changed.Nocturno.Provincia='3261'; // FUTURE NOCTURNO irrelevant after Vespertino
assert.deepEqual(reconstructMarkedSheetAfterDraw7D(
 buildSheet(changed,prev),d,'Vespertino'),marked);
for(const turn of TURNOS){
 const result=reconstructMarkedSheetAfterDraw7D(sheet,d,turn);
 assert.equal(result.annotationByTurn.length,TURNOS.indexOf(turn)+1);
 for(const t of result.annotationByTurn)for(const h of t.headsBelow){
  assert(h.traces.length>0);
  assert(h.traces.every(x=>h.head.endsWith(x.value)));
  assert(h.traces.every(x=>t.allowedSources.includes(x.sourceId)));
 }
}
const tampered=buildSheet(curr,prev);
const m=tampered.matches.Vespertino.find(x=>x.cabeza==='0261');
const h=m.hits.find(x=>x.kind==='vt3');
h.sourceId='Vespertino';
assert.throws(()=>reconstructMarkedSheetAfterDraw7D(tampered,d,'Vespertino'),/futura/);
console.log('OK: 7/10 cabeza 0261 conocida -> tres trazos VT3 en Primera/Matutino -> 0261 completa anotada debajo; nunca columnas futuras ni candidatos inventados');
