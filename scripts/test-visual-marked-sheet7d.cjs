// Prueba integral de hoja dibujada sobre cifras +11 y cabezas completas
// conocidas DESPUÉS del sorteo. No se rellenan candidatos ni puntuaciones.
const fs=require('fs'),path=require('path'),vm=require('vm');
const assert=require('node:assert/strict'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(name){
 const p=path.resolve(base,name.endsWith('.ts')?name:name+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(p,m);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  x=>x.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(p),x))):require(x),m,m.exports);
 return m.exports;
}
const {diaVacio,JURS,TURNOS}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {buildVisualMarkedSheet7D,renderVisualMarkedSheetHTML7D}=load('src/visualMarkedSheet7d.ts');
const baseHeads=diaVacio(),today=diaVacio();
const fromPlus11=s=>'00'+String((Number(s)+89)%100).padStart(2,'0');
// La columna Nocturna anterior reproduce 36/21:
// 3621 completo, 621 y 21 también son VT válidos.
baseHeads.Nocturno.Ciudad=fromPlus11('36');
baseHeads.Nocturno.Provincia=fromPlus11('21');
today.Previa.Provincia='3621';
const date='2026-10-10';
const full=buildSheet(today,baseHeads);
const first=buildVisualMarkedSheet7D(full,date,'Previa');
assert.equal(first.phase,'POSTERIOR_AL_SORTEO');
assert.equal(first.columns.length,2,'Después de Previa se ve la nueva columna para Primera');
assert.deepEqual(first.columns.map(c=>c.id),['prevNocturno','Previa']);
assert.equal(first.columns[1].newSinceDraw,true);
assert.equal(first.annotations.length,1);
assert.equal(first.annotations[0].fullHead,'3621');
assert.deepEqual(new Set(first.annotations[0].modalities),
 new Set(['vt2','vt3','vt4']));
assert(first.strokes.some(s=>s.kind==='vt4'&&s.value==='3621'&&
  s.cells.join('>')==='0:0>0:1>1:0>1:1'));
assert(first.strokes.some(s=>s.kind==='vt3'&&s.value==='621'));
assert(first.strokes.some(s=>s.kind==='vt2'&&s.value==='21'));
assert.equal(first.totals.vt2+first.totals.vt3+first.totals.vt4,
 first.strokes.length);
assert(first.strokes.every(s=>s.sourceId==='prevNocturno',
 'Nunca se marca en columna Previa, que aún no existía antes de Previa'));
const html=renderVisualMarkedSheetHTML7D(first);
assert(html.includes('<svg'));
assert(html.includes('3621'));
assert(html.includes('data-kind="vt2"')&&html.includes('data-kind="vt3"')&&
 html.includes('data-kind="vt4"'));
assert(html.includes('data-filter="Previa|Provincia|3621"'));
assert(html.includes('id="show-all"'));
assert(html.includes('Nueva: turno siguiente'));
assert(html.includes('Cabezas completas coincidentes'));
assert(!html.includes('Candidatos predictivos'));
// Si únicamente existe 21, se dibuja sólo VT2 y debajo SIGUE 3621.
const onlyTwo=diaVacio();onlyTwo.Nocturno.Ciudad=fromPlus11('21');
const reduced=buildVisualMarkedSheet7D(buildSheet(today,onlyTwo),date,'Previa');
assert.equal(reduced.annotations.length,1);
assert.equal(reduced.annotations[0].fullHead,'3621');
assert(reduced.strokes.length>0&&reduced.strokes.every(s=>s.kind==='vt2'));
assert.equal(reduced.totals.vt3,0);
assert.equal(reduced.totals.vt4,0);
// Si no existe coincidencia, debajo no aparece la cabeza.
const nothing=diaVacio();nothing.Nocturno.Ciudad=fromPlus11('88');
const noMatch=buildVisualMarkedSheet7D(buildSheet(today,nothing),date,'Previa');
assert.equal(noMatch.annotations.length,0);
assert.equal(noMatch.strokes.length,0);
// El resultado FUTURO no puede modificar la hoja al cierre de Previa.
const future=diaVacio();
for(const t of TURNOS)for(const j of JURS)future[t][j]=today[t][j];
future.Primera.Ciudad='9999';
future.Matutino.Provincia='8888';
future.Vespertino.Córdoba='7777';
future.Nocturno.Santa_Fé='6666';
assert.deepEqual(buildVisualMarkedSheet7D(buildSheet(future,baseHeads),date,'Previa'),first);
// Las cinco etapas incrementan columnas y recogen las coincidencias acumuladas
// de los turnos ya cerrados; no fabrican trazos de columnas posteriores.
const active=diaVacio();for(const t of TURNOS)active[t].Provincia='3621';
const sheet=buildSheet(active,baseHeads);
for(const [i,turn]of TURNOS.entries()){
 const view=buildVisualMarkedSheet7D(sheet,date,turn);
 assert.equal(view.columns.length,Math.min(5,i+2));
 assert.equal(view.phase,'POSTERIOR_AL_SORTEO');
 assert(view.annotations.every(a=>TURNOS.indexOf(a.turn)<=i));
 assert(view.strokes.every(s=>view.columns.some(c=>c.id===s.sourceId&&!c.newSinceDraw)));
 assert.equal(view.totals.heads,view.annotations.length);
 assert.equal(view.totals.strokes,view.strokes.length);
 assert(renderVisualMarkedSheetHTML7D(view).includes('VT2'));
}
console.log('OK: hoja +11 visual con TODAS las coincidencias VT2 VT3 VT4, cabeza completa debajo y cinco cortes causales; sin ranking ni fugas');
