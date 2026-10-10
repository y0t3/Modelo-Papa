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

const {analyzeAdaptive7D}=load('src/adaptive7d.ts');
const adaptiveDays=[
 {date:'2026-06-15',sheet:sheet(true)},
 {date:'2026-06-16',sheet:sheet(true)},
 {date:'2026-06-17',sheet:sheet(true)},
 {date:'2026-06-18',sheet:sheet(false)}
];
const adaptiveA=analyzeAdaptive7D(adaptiveDays,sheet(false),'2026-06-18','Primera');
// Previa del mismo día ya ocurrió antes de Primera y SI puede aportar memoria.
// Alteramos exclusivamente el sorteo objetivo Primera, que aún no existía.
const targetOnly=sheet(false);
targetOnly.matches.Primera=sheet(true).matches.Previa.map(x=>({...x,turno:'Primera'}));
const adaptiveFuture=analyzeAdaptive7D(
 adaptiveDays.map(d=>d.date==='2026-06-18'?{...d,sheet:targetOnly}:d),
 sheet(false),'2026-06-18','Primera');
assert.deepStrictEqual(adaptiveA,adaptiveFuture,'future results cannot influence adaptive decisions');
assert(adaptiveA.candidates.every(c=>['vt2','vt3','vt4'].includes(c.kind)),'all three modes supported');
assert(adaptiveA.candidates.filter(c=>c.kind==='vt2').length<=3);
assert(adaptiveA.candidates.filter(c=>c.kind==='vt3').length<=3);
assert(adaptiveA.candidates.filter(c=>c.kind==='vt4').length<=1);
assert(adaptiveA.candidates.every(c=>c.path.length===Number(c.kind.slice(-1))),'physical routes valid');
assert(adaptiveA.tracked>0,'marked figures tracked');
console.log('OK: adaptive 7D causal cutoff and bounded independent VT2 VT3 VT4');

const spatial=load('src/spatialFlow7d.ts');
assert.equal(spatial.routeZone({route:[{row:0,col:0},{row:1,col:0}]}),'ARRIBA');
assert.equal(spatial.routeZone({route:[{row:1,col:0},{row:2,col:0}]}),'CRUZA_ZONAS');
const spatialBefore=spatial.observeSpatialFlow7D(adaptiveDays,'2026-06-18','Primera');
assert.deepStrictEqual(spatialBefore,adaptiveA.spatialFlow);
assert(spatialBefore.trends.every(x=>x.totalDraws===x.recentDraws+x.previousDraws));
console.log('OK: spatial flow zone and chronology');

const {readCombined7D}=load('src/combinedReader7d.ts');
const d7history=[{date:'2026-06-15',sheet:sheet(true)},{date:'2026-06-16',sheet:sheet(true)},{date:'2026-06-17',sheet:sheet(false)},{date:'2026-06-18',sheet:sheet(false)},{date:'2026-06-19',sheet:sheet(false)},{date:'2026-06-20',sheet:sheet(false)}];
const combined=readCombined7D(d7history,sheet(false),'2026-06-22','Previa');
assert(combined.candidates.length>0,'D-7 winning paths generate candidates');
assert(combined.candidates.every(c=>c.signals[0].name==='D7'));
assert(combined.candidates.filter(c=>c.kind==='vt2').length<=3);
assert(combined.candidates.filter(c=>c.kind==='vt3').length<=3);
assert(combined.candidates.filter(c=>c.kind==='vt4').length<=1);
const missingD7=readCombined7D(d7history,sheet(false),'2026-06-28','Previa');
assert.equal(missingD7.decision,'NO JUGAR','no substitute for missing exact D-7');
const addedFuture=[...d7history,{date:'2026-06-22',sheet:sheet(true)},{date:'2026-06-23',sheet:sheet(true)}];
assert.deepStrictEqual(readCombined7D(addedFuture,sheet(false),'2026-06-22','Previa'),combined,'future data cannot modify combined prediction');
console.log('OK: combined D-7 temporal cutoff, modality caps, exact weekly reference');

const withTargetHeads=readCombined7D(d7history,sheet(true),'2026-06-22','Previa');
assert.deepStrictEqual(withTargetHeads,combined,'target results must not influence the combined reader');
const prevCompleted=readCombined7D(d7history,sheet(true),'2026-06-22','Primera');
const prevIncomplete=readCombined7D(d7history,sheet(false),'2026-06-22','Primera');
assert(prevCompleted.eligible===prevIncomplete.eligible,'prior results may change scores but not D7 candidate universe');
assert(prevCompleted.candidates.length<=7);
console.log('OK: combined current-day cutoff and earlier-turn reading');

const {decideFlowSwitch7D}=load('src/flowSwitch7d.ts');
const switchBase=decideFlowSwitch7D(d7history,sheet(false),'2026-06-22','Primera');
const switchFuture=decideFlowSwitch7D([...d7history,{date:'2026-06-23',sheet:sheet(true)}],sheet(false),'2026-06-22','Primera');
assert.deepStrictEqual(switchBase,switchFuture,'future dated sheet cannot influence switching');
const switchTarget=decideFlowSwitch7D(d7history,sheet(true),'2026-06-22','Previa');
const switchTargetBlank=decideFlowSwitch7D(d7history,sheet(false),'2026-06-22','Previa');
assert.deepStrictEqual(switchTarget,switchTargetBlank,'target marks cannot influence switching');
assert.deepStrictEqual(switchBase.decisions.map(x=>x.kind),['vt2','vt3','vt4']);
assert(switchBase.decisions.every(x=>['MANTENER','CAMBIAR','OBSERVAR_NUEVA','ABSTENERSE'].includes(x.action)));
console.log('OK: flow switch per VT mode and causal cutoff');

const {decideConservativeFlow7D}=load('src/flowSwitchConservative7d.ts');
const consBase=decideConservativeFlow7D(d7history,sheet(false),'2026-06-22','Primera');
const consFuture=decideConservativeFlow7D([...d7history,{date:'2026-06-23',sheet:sheet(true)}],sheet(false),'2026-06-22','Primera');
assert.deepStrictEqual(consBase,consFuture,'conservative flow cannot see later days');
const consTarget=decideConservativeFlow7D(d7history,sheet(true),'2026-06-22','Previa');
const consBlank=decideConservativeFlow7D(d7history,sheet(false),'2026-06-22','Previa');
assert.deepStrictEqual(consTarget,consBlank,'conservative flow cannot see target result');
assert.deepStrictEqual(consBase.decisions.map(x=>x.kind),['vt2','vt3','vt4']);
console.log('OK: conservative switch causal cutoff and independent VT modes');

const dm=load('src/decisionMemory7d.ts');
const focA={kind:'vt2',sourceId:'Primera',winningTurn:'Nocturno',zone:'ARRIBA'};
const focB={kind:'vt2',sourceId:'Previa',winningTurn:'Nocturno',zone:'ABAJO'};
let log=dm.emptyDecisionMemory7D();
log=dm.recordDecisions7D(log,'2026-06-15','Previa',[{kind:'vt2',action:'MANTENER',focus:focA,explanation:'Inicio observado'}]);
assert.deepStrictEqual(dm.lastFocus7D(log,'vt2'),focA);
log=dm.recordDecisions7D(log,'2026-06-15','Primera',[{kind:'vt2',action:'OBSERVAR_NUEVA',focus:focB,explanation:'Empate'}]);
assert.deepStrictEqual(dm.lastFocus7D(log,'vt2'),focA,'observing a new trend does not overwrite chosen focus');
assert.throws(()=>dm.recordDecisions7D(log,'2026-06-15','Primera',[]),/posteriores/);
log=dm.recordDecisions7D(log,'2026-06-15','Matutino',[{kind:'vt2',action:'CAMBIAR',focus:focB,explanation:'Cambio confirmado'}]);
assert.deepStrictEqual(dm.lastFocus7D(log,'vt2'),focB);
const graded=dm.evaluateDecision7D(log,'2026-06-15','Matutino','vt2',false);
assert.equal(graded.records[2].confirmed,false);
assert.equal(log.records[2].confirmed,undefined,'outcome never rewrites previously recorded forecast');
assert.throws(()=>dm.evaluateDecision7D(graded,'2026-06-15','Matutino','vt2',true),/ya anotado/);
console.log('OK: persistent decision-memory causal ordering, focus continuity, immutable evaluation');

const pf=load('src/persistentFlow7d.ts');
const persistentEmpty=dm.emptyDecisionMemory7D();
const persistentPreview=pf.decidePersistentFlow7D(persistentEmpty,d7history,sheet(false),'2026-06-22','Previa');
const persistentFuture=pf.decidePersistentFlow7D(persistentEmpty,[...d7history,{date:'2026-06-23',sheet:sheet(true)}],sheet(false),'2026-06-22','Previa');
assert.deepStrictEqual(persistentPreview,persistentFuture,'future date must not alter persisted controller');
const persistentTarget=pf.decidePersistentFlow7D(persistentEmpty,d7history,sheet(true),'2026-06-22','Previa');
assert.deepStrictEqual(persistentPreview,persistentTarget,'target heads must not alter persisted controller');
assert.deepStrictEqual(persistentPreview.decisions.map(x=>x.kind),['vt2','vt3','vt4']);
console.log('OK: persistent controller causal cutoff, original focus comes from recorded decisions');

const lifecycle=load('src/flowLifecycle7d.ts');
const init=lifecycle.initialFocusState7D('vt2');
const lcBase=lifecycle.advanceFocusLifecycle7D(init,d7history,sheet(false),'2026-06-22','Primera');
const lcFuture=lifecycle.advanceFocusLifecycle7D(init,[...d7history,{date:'2026-06-23',sheet:sheet(true)}],sheet(false),'2026-06-22','Primera');
assert.deepStrictEqual(lcBase,lcFuture,'future sheet changes no lifecycle decisions');
const lcTarget=lifecycle.advanceFocusLifecycle7D(init,d7history,sheet(true),'2026-06-22','Previa');
const lcBlank=lifecycle.advanceFocusLifecycle7D(init,d7history,sheet(false),'2026-06-22','Previa');
assert.deepStrictEqual(lcTarget,lcBlank,'target results must not change lifecycle');
assert.equal(init.phase,'SIN_FOCO');
const dormant={kind:'vt4',phase:'ACTIVO',focus:{kind:'vt4',sourceId:'Previa',winningTurn:'Nocturno',zone:'ABAJO'},quietTurns:2,started:'2026-06-01|Previa'};
const rest=lifecycle.advanceFocusLifecycle7D(dormant,[],sheet(false),'2026-06-22','Previa');
assert.equal(rest.next.phase,'REPOSO');
assert.deepStrictEqual(rest.next.focus,dormant.focus,'rest cannot kill the focus');
console.log('OK: lifecycle causal cutoff and reversible rest');

const lineage=load('src/routeLineage7d.ts');
const rls=lineage.readRouteLineages7D(d7history,sheet(false),'2026-06-22','Previa');
const rlsTarget=lineage.readRouteLineages7D(d7history,sheet(true),'2026-06-22','Previa');
assert.deepStrictEqual(rls,rlsTarget,'target results must never change route lineage');
const rlsFuture=lineage.readRouteLineages7D([...d7history,{date:'2026-06-23',sheet:sheet(true)}],sheet(false),'2026-06-22','Previa');
assert.deepStrictEqual(rls,rlsFuture,'future results must not change route lineage');
assert(rls.lineages.every(x=>x.confirmedDraws>=1&&x.daysSinceLast>=0));
console.log('OK: geometry lineage causality and temporal deduplication');

const priors=lineage.compareRouteLineages7D(rls);
assert.deepStrictEqual(priors.map(x=>x.kind),['vt2','vt3','vt4']);
assert(priors.every(x=>['OBSERVAR','MANTENER_GEOMETRIA','EXAMINAR_RAMA'].includes(x.action)));
console.log('OK: geometric priority does not change the official candidate selector');

const dual=load('src/dualFocus7d.ts');
const trend=(f,n)=>({...f,recentDraws:n,previousDraws:0,totalDraws:n,direction:'SIN_BASE'});
const dfA={kind:'vt2',sourceId:'Previa',winningTurn:'Nocturno',zone:'ARRIBA'};
const dfB={kind:'vt2',sourceId:'Primera',winningTurn:'Nocturno',zone:'CENTRO'};
let ds=dual.initialDualFocus7D('vt2');
let st=dual.advanceDualFocusFromTrends7D(ds,[trend(dfA,3),trend(dfB,1)],'2026-06-10','Primera');
assert.equal(st.action,'INICIAR');ds=st.after;
st=dual.advanceDualFocusFromTrends7D(ds,[trend(dfB,4),trend(dfA,1)],'2026-06-10','Matutino');
assert.equal(st.action,'OBSERVAR_EMERGENTE');
assert.deepStrictEqual(st.after.primary,dfA);ds=st.after;
st=dual.advanceDualFocusFromTrends7D(ds,[trend(dfB,4),trend(dfA,1)],'2026-06-10','Vespertino');
assert.equal(st.action,'PROMOVER');assert.deepStrictEqual(st.after.primary,dfB);ds=st.after;
for(let i=0;i<3;i++){st=dual.advanceDualFocusFromTrends7D(ds,[],'2026-06-11','Previa');ds=st.after;}
assert.equal(ds.primaryResting,true);assert.deepStrictEqual(ds.primary,dfB);
st=dual.advanceDualFocusFromTrends7D(ds,[trend(dfB,2)],'2026-06-11','Primera');
assert.equal(st.action,'REACTIVAR');assert.deepStrictEqual(st.after.primary,dfB);
const dualBase=dual.advanceDualFocus7D(dual.initialDualFocus7D('vt2'),d7history,sheet(false),'2026-06-22','Previa');
const dualFuture=dual.advanceDualFocus7D(dual.initialDualFocus7D('vt2'),[...d7history,{date:'2026-06-23',sheet:sheet(true)}],sheet(true),'2026-06-22','Previa');
assert.deepStrictEqual(dualBase,dualFuture,'future and target marks must not affect dual focus');
console.log('OK: dual focus lifecycle, promotion, rest, reactivation and causal cutoff');

const dr=load('src/dualRouteFocus7d.ts');
const rt1=[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'2'}];
const rt2=[{row:1,col:0,digit:'2'},{row:1,col:1,digit:'3'}];
const anchor1={kind:'vt2',sourceId:'prevNocturno',coordinates:'0:0>0:1',route:rt1};
const anchor2={kind:'vt2',sourceId:'prevNocturno',coordinates:'1:0>1:1',route:rt2};
const makeEp=(identity,evidenceIds)=>({identity,anchorDate:'2026-06-15',projectedValue:'12',evidenceIds,exact:evidenceIds.length,movement:0,branches:0});
let drState=dr.initialDualRouteState7D('vt2','Previa');
let drStep=dr.advanceDualRouteFromEpisodes7D(drState,[makeEp(anchor1,['2026-06-16|0'])],'2026-06-19','Previa');
assert.equal(drStep.action,'INICIAR');drState=drStep.after;
drStep=dr.advanceDualRouteFromEpisodes7D(drState,[makeEp(anchor1,['2026-06-16|0']),makeEp(anchor2,['2026-06-17|0','2026-06-18|0'])],'2026-06-20','Previa');
assert.equal(drStep.action,'OBSERVAR_EMERGENTE');
assert.deepStrictEqual(drStep.after.primary,anchor1);drState=drStep.after;
drStep=dr.advanceDualRouteFromEpisodes7D(drState,[makeEp(anchor1,['2026-06-16|0']),makeEp(anchor2,['2026-06-17|0','2026-06-18|0'])],'2026-06-21','Previa');
assert.equal(drStep.action,'OBSERVAR_EMERGENTE','same evidence must not promote');drState=drStep.after;
drStep=dr.advanceDualRouteFromEpisodes7D(drState,[makeEp(anchor1,['2026-06-16|0']),makeEp(anchor2,['2026-06-17|0','2026-06-18|0','2026-06-21|0'])],'2026-06-22','Previa');
assert.equal(drStep.action,'PROMOVER');
assert.deepStrictEqual(drStep.after.primary,anchor2);
assert.equal(drStep.newIndependentEvidence,1);
assert.throws(()=>dr.advanceDualRouteFromEpisodes7D(drStep.after,[],'2026-06-22','Previa'),/cronologicamente/);
const drHist=dr.buildRouteEpisodes7D(d7history,sheet(false),'2026-06-22','Previa','vt2');
const drTarget=dr.buildRouteEpisodes7D(d7history,sheet(true),'2026-06-22','Previa','vt2');
assert.deepStrictEqual(drHist,drTarget,'D-7 episodes must not see target heads');
const drLater=dr.buildRouteEpisodes7D([...d7history,{date:'2026-06-23',sheet:sheet(true)}],sheet(false),'2026-06-22','Previa','vt2');
assert.deepStrictEqual(drHist,drLater,'D-7 episodes must not see future days');
assert(drHist.every(x=>x.projectedValue.length===2&&x.identity.sourceId==='prevNocturno'));
console.log('OK: route-anchored dual-focus causal split, independent evidence, no duplicate evaluation');

const fam=load('src/geometryFamily7d.ts');
const fid=(kind,sourceId,rs)=>({kind,sourceId,route:rs.map(([row,col])=>({row,col,digit:'1'}))});
const fa=fid('vt2','Primera',[[0,0],[1,0]]);
const fb=fid('vt2','Primera',[[1,0],[2,0]]);
const fc=fid('vt2','Primera',[[2,0],[3,0]]);
assert.equal(fam.familyRelation7D(fa,fa),'EXACTA');
assert.equal(fam.familyRelation7D(fa,fb),'TRASLACION_CERCANA');
assert.equal(fam.familyRelation7D(fa,fc),'NO_RELACION','never merge via transitive one-cell shifts');
assert.equal(fam.familyRelation7D(fa,fid('vt2','Previa',[[0,0],[1,0]])),'NO_RELACION','never cross physical columns');
assert.equal(fam.familyRelation7D(fa,fid('vt3','Primera',[[0,0],[1,0],[2,0]])),'NO_RELACION','never mix VT kinds');
const branchA=fid('vt3','Primera',[[0,0],[1,0],[2,0]]);
const branchB=fid('vt3','Primera',[[0,0],[1,0],[2,1]]);
assert.equal(fam.familyRelation7D(branchA,branchB),'RAMA_CERCANA');
assert.equal(fam.familyRelation7D(fa,fid('vt2','Primera',[[0,0],[0,1]])),'NO_RELACION','VT2 shared-cell alone cannot define a family');
const shiftedEp={...makeEp({kind:'vt2',sourceId:'prevNocturno',coordinates:'1:0>1:1',route:rt2},['2026-06-16|0'])};
const familyRef={kind:'vt2',sourceId:'prevNocturno',coordinates:'0:0>0:1',route:rt1};
let familyState={...dr.initialDualRouteState7D('vt2','Previa'),primary:familyRef,primarySeen:[],lastMoment:'2026-06-18|0'};
const familyMove=dr.advanceDualRouteFromEpisodes7D(familyState,[shiftedEp],'2026-06-19','Previa','FAMILIA');
const exactMove=dr.advanceDualRouteFromEpisodes7D(familyState,[shiftedEp],'2026-06-19','Previa','EXACTA');
assert.deepStrictEqual(familyMove.after.primary,familyRef,'family root identity never changes on translation');
assert.equal(familyMove.after.primaryQuiet,0,'fresh family evidence reactivates root');
assert.equal(exactMove.after.primaryQuiet,1,'exact mode rejects shift');
console.log('OK: bounded D7 families, no transitive merge, VT separation, dual focus continuation');

const visualCases=[
 {kind:'vt2',src:'Previa',root:[[4,1],[4,0]],member:[[3,1],[3,0]],d7:['21','49','05','88','65','--'],now:['96','35','16','09','74','--'],headD7:'2188',projection:'90',relation:'TRASLACION_CERCANA'},
 {kind:'vt2',src:'prevNocturno',root:[[2,1],[1,1]],member:[[2,0],[1,0]],d7:['36','00','36','90','62','12'],now:['73','10','94','39','49','12'],headD7:'7030',projection:'91',relation:'TRASLACION_CERCANA'},
 {kind:'vt3',src:'Previa',root:[[2,0],[3,0],[4,0]],member:[[2,1],[2,0],[3,0]],d7:['04','68','89','91','98','--'],now:['08','06','11','85','68','--'],headD7:'1989',projection:'118',relation:'RAMA_CERCANA'},
 {kind:'vt4',src:'Previa',root:[[0,0],[0,1],[1,0],[2,1]],member:[[2,1],[1,1],[0,0],[0,1]],d7:['07','69','37','81','89','--'],now:['50','50','51','63','61','--'],headD7:'7907',projection:'1050',relation:'RAMA_CERCANA'},
 {kind:'vt2',src:'Vespertino',root:[[2,1],[3,1]],member:[[3,1],[4,1]],d7:['97','71','30','65','27','--'],now:['27','37','68','17','58','--'],headD7:'8857',projection:'78',relation:'TRASLACION_CERCANA'},
];
for(const test of visualCases){
 const make=(positions)=>({kind:test.kind,sourceId:test.src,route:positions.map(([row,col])=>({row,col,digit:''}))});
 assert.equal(fam.familyRelation7D(make(test.root),make(test.member)),test.relation);
 const from=(vals)=>test.member.map(([r,c])=>vals[r][c]).join('');
 assert(test.headD7.endsWith(from(test.d7)),'D-7 marked winner must validate digit path');
 assert.equal(from(test.now),test.projection,'pre-target candidate must depend on available column cells');
}
console.log('OK: five historical visual cases verify real geometric relation and D-7 projection');
