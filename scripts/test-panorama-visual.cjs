// Tests for whole-sheet marking, every valid route and same-head simultaneity.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(name){
 const fn=path.resolve(root,name.endsWith('.ts')?name:name+'.ts');
 if(cache.has(fn))return cache.get(fn).exports;
 const code=ts.transpileModule(fs.readFileSync(fn,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(fn,m);
 vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:fn})(
  x=>x.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(fn),x))):require(x),m,m.exports);
 return m.exports;
}
const {buildDailyPanorama,buildPredictivePanorama,physicalKey,routesForOwner}=load('src/panoramaModel.ts');
const {diaVacio}=load('src/domain.ts');
const cells=s=>s.map(([r,c],i)=>({row:r,col:c,digit:String(i)}));
const columns=['prevNocturno','Previa','Primera','Matutino','Vespertino'].map(id=>({
 id,turno:'Previa',sourceLabel:id,values:['12','23','34','45','56','67']}));
const a=cells([[0,0],[1,0],[2,1]]),b=cells([[1,0],[1,1],[2,1]]),c=cells([[3,0],[4,0]]),
 d=cells([[1,0],[2,0],[3,1],[4,1]]);
const hits=[
 {kind:'vt3',value:'123',sourceId:'prevNocturno',paths:[a,[...a].reverse(),b]},
 {kind:'vt3',value:'123',sourceId:'Previa',paths:[a]},
 {kind:'vt2',value:'23',sourceId:'Primera',paths:[c]},
 {kind:'vt4',value:'1234',sourceId:'Vespertino',paths:[d]}
];
const head1={cabeza:'7123',jurisdiccion:'Ciudad',hits};
const head2={cabeza:'7123',jurisdiccion:'Provincia',hits:[hits[0]]};
const data=diaVacio();data.Nocturno.Ciudad='7123';data.Nocturno.Provincia='7123';
const sheet={columns,matches:{Previa:[],Primera:[],Matutino:[],Vespertino:[],Nocturno:[head1,head2]},
 heads:{Previa:[],Primera:[],Matutino:[],Vespertino:[],Nocturno:['7123']}};
const panorama=buildDailyPanorama(sheet,data);
assert.equal(panorama.groups.length,2,'Cabezas iguales de distintas jurisdicciones deben ser distintas');
const own=routesForOwner(panorama,'Nocturno|Ciudad|7123');
assert.equal(own.length,5,'Todos VT2,VT3,VT4 y fuentes (inversa deduplicada)');
assert.deepEqual(new Set(own.map(x=>x.kind)),new Set(['vt2','vt3','vt4']));
assert.equal(new Set(own.map(x=>x.sourceId)).size,4,'Recorridos de muchas columnas siempre simultáneos');
assert.equal(own.filter(x=>x.kind==='vt3').length,3);
assert.equal(routesForOwner(panorama,'Nocturno|Provincia|7123').length,2);
assert.equal(routesForOwner(panorama,null).length,7);
assert.equal(physicalKey('vt3','Previa',a.map(({row,col})=>({row,col}))),
 physicalKey('vt3','Previa',[...a].reverse().map(({row,col})=>({row,col}))));
const predictive={target:'Matutino',routes:[
 {family:'289/982',value:'289',sourceId:'prevNocturno',path:a,antecedents:[]},
 {family:'289/982',value:'982',sourceId:'prevNocturno',path:[...a].reverse(),antecedents:[]},
 {family:'289/982',value:'289',sourceId:'Primera',path:b,antecedents:[]},
 {family:'778/877',value:'778',sourceId:'Previa',path:a,antecedents:[]}
 ],hotFamilies:[
 {family:'289/982',state:'OBSERVAR'},{family:'778/877',state:'NACE'}]};
const pp=buildPredictivePanorama(predictive);
assert.equal(routesForOwner(pp,'289/982').length,2,'Todas las columnas de la familia a la vez');
assert.equal(routesForOwner(pp,'778/877').length,1);
assert(pp.routes.every(x=>x.kind==='vt3'),'No generar VT2/VT4 artificial');
assert(pp.groups.every(g=>g.routeCount>0));
console.log('TEST_PANORAMA_OK: cabezas completas, todas las modalidades, todas las columnas, mismas rutas invertidas y selección por familia');
