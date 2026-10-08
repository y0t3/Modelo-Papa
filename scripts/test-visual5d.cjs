// Smoke tests using installed TypeScript compiler to execute the actual engine files.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const ts=require('typescript'),cache=new Map(),base=path.resolve(__dirname,'..');
function load(file){
 const resolved=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(resolved))return cache.get(resolved).exports;
 const source=fs.readFileSync(resolved,'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const module={exports:{}};cache.set(resolved,module);
 const localRequire=(name)=>name.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(resolved),name))):require(name);
 vm.runInThisContext('(function(require,module,exports){'+compiled+'\n})',{filename:resolved})(localRequire,module,module.exports);
 return module.exports;
}
const {analyzeVisual5D}=load('src/visual5d.ts');
const {buildVisualMemory}=load('src/visualMemory5d.ts');
const {analyzeVisualEvolution}=load('src/visualEvolution5d.ts');
const {findPaths}=load('src/paths.ts');
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
function sheet(head=false){
 const values=['12','23','34','45','56','67'];
 const columns=[{id:'prevNocturno',sourceLabel:'Nocturna anterior',values},
  {id:'Previa',sourceLabel:'Previa',values},{id:'Primera',sourceLabel:'Primera',values},
  {id:'Matutino',sourceLabel:'Matutino',values},{id:'Vespertino',sourceLabel:'Vespertino',values}];
 const matches=Object.fromEntries(turns.map(x=>[x,[]]));
 if(head)matches.Previa=[{cabeza:'1123',hits:[{kind:'vt2',value:'23',sourceId:'prevNocturno',paths:findPaths(values,'23')},{kind:'vt3',value:'123',sourceId:'prevNocturno',paths:findPaths(values,'123')},{kind:'vt4',value:'1123',sourceId:'prevNocturno',paths:findPaths(values,'1123')}]}];
 return {columns,matches,heads:{}};
}
const blank=sheet(),old=[sheet(),sheet(),sheet(),sheet(),sheet(),sheet()];
const insufficient=analyzeVisual5D(blank,old.slice(0,5),'Nocturno');
assert.equal(insufficient.decision,'NO JUGAR');
assert.equal(insufficient.historyDays,5);
assert(insufficient.reason.includes('seis jornadas'),'explicit six-day minimum');
assert.equal(analyzeVisual5D(blank,old,'Nocturno').decision,'NO JUGAR');
assert.equal(analyzeVisual5D(blank,old,'Nocturno').historyDays,6);
const baseMemory=buildVisualMemory(blank,old,'Primera');assert.equal(baseMemory.marks.length,0);
const oldWithHit=[sheet(true),sheet(true),sheet(true),sheet(true),sheet(true),sheet(true)];
const mem=buildVisualMemory(blank,oldWithHit,'Primera');
assert.equal(mem.transitions.length,31,'6 historical days x 5 turns and current Previa');
assert.equal(mem.transitions[0].persistingColumns,0);
assert.equal(mem.transitions[0].newColumns,1);
assert.equal(mem.transitions[1].persistingColumns,1);
assert.equal(mem.transitions[1].newColumns,1);
assert(mem.transitions[0].newRoutesOnNewColumn>0,'new routes are marked in the available column');
assert(mem.vt2>0&&mem.vt3>0&&mem.vt4>=0,'historical kinds are preserved');
assert(mem.sequentialDayLinks>0,'continuities between days');
const evo=analyzeVisualEvolution(mem.marks,'Primera');
assert(evo.dayChanges>0,'observed geometry evolution between consecutive days');
assert(evo.changes.every(x=>x.toDay>=x.fromDay),'no backward transitions');

const r=analyzeVisual5D(blank,oldWithHit,'Nocturno');
assert(['TOP 3','TOP 5','OBSERVAR','NO JUGAR'].includes(r.decision));
assert(r.candidates.every(x=>x.path.every(p=>p.col>=0&&p.col<=1)));
const current=sheet(true);
const first=analyzeVisual5D(current,old,'Previa');
const altered=sheet(true);altered.matches.Previa.push({cabeza:'9999',hits:[{kind:'vt3',value:'999',sourceId:'prevNocturno',paths:[]}]});
assert.deepStrictEqual(analyzeVisual5D(altered,old,'Previa'),first,'target-turn result must never leak');
assert.deepStrictEqual(buildVisualMemory(altered,old,'Previa'),buildVisualMemory(current,old,'Previa'),'target excluded from memory');
assert.deepStrictEqual(analyzeVisualEvolution(buildVisualMemory(altered,old,'Previa').marks,'Previa'),analyzeVisualEvolution(buildVisualMemory(current,old,'Previa').marks,'Previa'),'target excluded from geometry evolution');
console.log('OK: 8 checks — 6 days, no signals, VT2/VT3/VT4, continuity, physical columns, temporal causality');
