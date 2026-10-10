// Ensayo real TS del prefijo VT4 EXTRA, no tocar selector.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const resolved=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(resolved))return cache.get(resolved).exports;
 const code=ts.transpileModule(fs.readFileSync(resolved,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(resolved,mod);
 const req=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(resolved),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:resolved})(req,mod,mod.exports);
 return mod.exports;
}
const {diaVacio}=load('src/domain.ts'),{buildSheet}=load('src/sheet.ts');
const {auditVT4Extra7D,prefixFromMemory7D}=load('src/vt4Extra7d.ts');
const dates=['2026-10-02','2026-10-03','2026-10-05','2026-10-06',
 '2026-10-07','2026-10-08','2026-10-09'];
const previous=diaVacio();previous.Nocturno.Ciudad='0012';
previous.Nocturno.Provincia='0023';previous.Nocturno['Córdoba']='0034';
function make(d,i,target){
 const heads=diaVacio();
 if(i===0)heads.Previa.Ciudad='0234'; // D-7, sufijo 234, prefijo 0
 if(i===5)heads.Previa.Ciudad='9234'; // prefijo historico 9 mas reciente
 if(i===6)heads.Previa.Ciudad=target;
 return {date:d,sheet:buildSheet(heads,previous)};
}
const days=dates.map((d,i)=>make(d,i,'9234'));
const audit=auditVT4Extra7D(days,3);
assert.equal(audit.rows.length,1);
const row=audit.rows[0];
for(const name of ['ULTIMO_VT2','ULTIMA_CABEZA','MODA_6D']){
 const x=row.byRule[name].find(x=>x.vt3==='234');
 assert(x,'Debe haber candidato VT3=234');
 assert.equal(x.candidateVT4,'9234','La memoria usa antecedente previo y no la cabeza objetivo');
 assert.equal(x.vt4Matched,true);
 assert.equal(x.vt3Matched,true);
 assert.equal(x.physicalVT4,false,'9 no está en la columna física, marcar EXTRA');
 assert.equal(x.expectedRandomVT4,0.1);
}
const altered=dates.map((d,i)=>make(d,i,'1234'));
const other=auditVT4Extra7D(altered,3);
for(const name of ['ULTIMO_VT2','ULTIMA_CABEZA','MODA_6D']){
 const prediction=x=>x.rows[0].byRule[name].map(y=>
  [y.vt3,y.prefix,y.candidateVT4,y.route,y.physicalVT4]);
 assert.deepEqual(prediction(other),prediction(audit),
  'El resultado del turno objetivo no puede alterar el prefijo');
 assert.equal(other.byRule.find(x=>x.rule===name).vt4Exact,0);
 assert(other.byRule.find(x=>x.rule===name).vt3MatchedWithProposal>=1);
}
assert.throws(()=>prefixFromMemory7D(days,dates[6],'Previa','234','ULTIMO_VT2'),/Fuga temporal/);
assert.deepEqual(prefixFromMemory7D([],dates[6],'Previa','234','ULTIMO_VT2'),
 {reason:'SIN_ANTECEDENTES'});
console.log('OK: VT4 EXTRA en cifra izquierda, no fisico etiquetado, azar condicional, memoria causal y cabezas ciegas');
