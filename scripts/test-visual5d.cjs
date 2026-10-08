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

const {loadPreviousDraws,hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {diaVacio}=load('src/domain.ts');
const mock=(date)=>{
 const data=diaVacio();
 if(date==='2026-06-18')data.Previa.Ciudad='1234';
 else if(date!=='2026-06-20')data.Nocturno.Ciudad='1234';
 return Promise.resolve(data);
};
(async()=>{
 assert.equal(hasDrawResults(diaVacio()),false);
 assert.equal(hasNocturnoBase(diaVacio()),false);
 const history=await loadPreviousDraws('2026-06-23',7,mock);
 assert.equal(history.length,7);
 assert(!history.some(x=>x.date==='2026-06-20'),'skip holiday with no results');
 assert(!history.some(x=>x.date==='2026-06-18'),'skip incomplete drawing day without Nocturna');
 assert(history.every(x=>hasNocturnoBase(x.heads)),'every historical day can seed +11');
 assert.equal(history[history.length-1].date,'2026-06-22');
 assert.equal(history[0].date,'2026-06-12');
 assert(history.every((x,i)=>i===0||x.date>history[i-1].date),'chronological oldest first');
 console.log('OK: six actual drawing days + preceding base day, holiday skipped');
})().catch(e=>{console.error(e);process.exitCode=1});

const {buildCycle7DBitacora,cycleSnapshot}=load('src/cycle7d.ts');
const weekly=buildCycle7DBitacora([
 {date:'2026-06-15',sheet:sheet(true)},
 {date:'2026-06-16',sheet:sheet(true)},
 {date:'2026-06-17',sheet:sheet(false)}
]);
assert(weekly.some(x=>x.kind==='vt2'&&x.classification==='NACE'),'VT2 has independent birth');
assert(weekly.some(x=>x.kind==='vt3'&&x.classification==='NACE'),'VT3 has independent birth');
assert(weekly.filter(x=>x.date==='2026-06-16').every(x=>x.classification==='RECONFIRMA'),'next-day geometry independently reconfirmed');
const beforeDraw=cycleSnapshot(weekly,'2026-06-15','Previa');
assert.equal(beforeDraw.before.length,0,'no future leak before first drawing');
assert(beforeDraw.newEvents.length>0,'confirmations known only after drawing');
assert.equal(cycleSnapshot(weekly,'2026-06-16','Previa').before.filter(x=>x.date==='2026-06-16').length,0,'exclude target turn from antecedents');
console.log('OK: independent VT2/VT3/VT4 histories and target-turn exclusion');

const syntheticPath=[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'2'}];
const vt4Path=[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'2'},{row:1,col:0,digit:'3'},{row:1,col:1,digit:'4'}];
function markedDay(heads){
 const x=sheet();
 x.matches.Previa=heads.map(h=>({cabeza:h,hits:[
  {kind:'vt2',sourceId:'prevNocturno',value:'12',paths:[syntheticPath,syntheticPath]},
  {kind:'vt4',sourceId:'prevNocturno',value:'1234',paths:[vt4Path]}
 ]}));
 return x;
}
const independent=buildCycle7DBitacora([
 {date:'2026-06-15',sheet:markedDay(['0012','1112'])},
 {date:'2026-06-16',sheet:markedDay(['2212'])}
]);
assert(independent.some(x=>x.kind==='vt4'&&x.classification==='NACE'),'VT4 observed independently');
assert(independent.filter(x=>x.date==='2026-06-15').every(x=>x.priorOccurrences===0),'all same-turn paths are simultaneous');
assert(independent.filter(x=>x.date==='2026-06-16').every(x=>x.priorOccurrences===1),'multiple paths and heads in one drawing count once');
console.log('OK: same-turn route multiplicity does not inflate historical confirmations');

const formations=load('src/cycle7d.ts').priorCycleFormations;
assert.equal(formations(independent,'2026-06-15','Previa').length,0);
assert(formations(independent,'2026-06-16','Previa').some(x=>x.kind==='vt2'&&x.confirmingDraws===1));
assert(formations(independent,'2026-06-17','Previa').some(x=>x.kind==='vt2'&&x.confirmingDraws===2));
console.log('OK: causal snapshots');

const {reconstructMarkedMoments,priorMarkedMoments}=load('src/markedSheet7d.ts');
const markedMoments=reconstructMarkedMoments([{date:'2026-06-15',sheet:sheet(true)},{date:'2026-06-16',sheet:sheet(true)}]);
assert.equal(markedMoments.length,10,'one snapshot for each turn');
assert(markedMoments.find(m=>m.date==='2026-06-15'&&m.turn==='Previa').vt2>0,'marked VT2 is visible');
assert(markedMoments.find(m=>m.date==='2026-06-15'&&m.turn==='Previa').vt3>0,'marked VT3 is visible');
assert.equal(priorMarkedMoments(markedMoments,'2026-06-15','Previa').length,0,'no marked future turn read');
assert.equal(priorMarkedMoments(markedMoments,'2026-06-16','Previa').length,5,'all five prior completed turns');
const invalidFuture=sheet(true);
invalidFuture.matches.Previa[0].hits[0].sourceId='Matutino';
assert.throws(()=>reconstructMarkedMoments([{date:'2026-06-15',sheet:invalidFuture}]),/futura/,'no column from future turn');
console.log('OK: historical marked sheets read first; target and later turns excluded');
