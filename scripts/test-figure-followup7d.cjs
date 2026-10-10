const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const name=path.resolve(root,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(name))return cache.get(name).exports;
 const content=fs.readFileSync(name,'utf8');
 const code=ts.transpileModule(content,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(name,mod);
 const req=x=>x==='./domain'?{TURNOS:['Previa','Primera','Matutino','Vespertino','Nocturno']}:
  x.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(name),x))):require(x);
 vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:name})(req,mod,mod.exports);
 return mod.exports;
}
const figure=load('src/figureReadings7d.ts'),follow=load('src/figureFollowup7d.ts');
const values=['34','75','68','19','20','31'];
const sheet=vals=>({columns:['prevNocturno','Previa','Primera','Matutino','Vespertino'].map(id=>({id,values:vals})),matches:{},heads:{}});
const path345=[{row:0,col:0,digit:'3'},{row:0,col:1,digit:'4'},{row:1,col:1,digit:'5'}];
const initial=figure.freezeFigureReadings7D(sheet(values),'2026-08-01','Nocturno','vt3','Primera',path345);
let memory=follow.startFigureFollowup7D(figure.evaluateFigureReadings7D(initial,['0543']));
assert.equal(memory.originStatus,'APOYO_GEOMETRICO_SIN_EXACTITUD');
const next=follow.previewFigureFollowup7D(memory,sheet(values),'2026-08-03','Nocturno');
assert.equal(next.frozen.direct,'345');
memory=follow.settleFigureFollowup7D(memory,next,['0654']);
assert.equal(memory.observations[0].exact,false);
assert.equal(memory.observations[0].geometry,false);
assert.equal(memory.observations[0].partialVT2,true);
assert.throws(()=>follow.previewFigureFollowup7D(memory,sheet(values),'2026-08-03','Nocturno'),/cronologica/);
assert.throws(()=>follow.previewFigureFollowup7D(memory,sheet(values),'2026-08-04','Matutino'),/turnos/);
const missing=follow.previewFigureFollowup7D(memory,sheet(['--',...values.slice(1)]),'2026-08-04','Nocturno');
assert.equal(missing.projectable,false);
memory=follow.settleFigureFollowup7D(memory,missing,['0354']);
assert.equal(follow.summarizedFollowup7D(memory).projectable,1);
assert.equal(follow.summarizedFollowup7D(memory).keepFigureInMemory,true);
console.log('OK: figure followup TS real, frozen before target, inversa, VT2 parcial, same-turn only, missing cells');

const translation=load('src/figureTranslation7d.ts');
const futureDay='2026-08-05';
const baseline=translation.prefreezeFixedAndTranslated7D(memory,[],sheet(values),futureDay,'Nocturno');
assert.equal(baseline.fixed.direct,'345');
assert.equal(baseline.shifted.direct,'758');
assert.equal(baseline.translation.row,1);
assert.equal(baseline.translation.col,0);
assert.equal(baseline.validTranslations,1);
assert.deepStrictEqual(baseline.fixed.coordinates,['0:0','0:1','1:1']);
assert.deepStrictEqual(baseline.shifted.coordinates,['1:0','1:1','2:1']);
const swapped=sheet(values);
swapped.matches.Nocturno=[{cabeza:'2758',hits:[]}];swapped.heads.Nocturno=['2758'];
assert.deepStrictEqual(translation.prefreezeFixedAndTranslated7D(memory,[],swapped,futureDay,'Nocturno'),baseline,
 'target outcome cannot alter fixed or shifted readings');
assert.throws(()=>translation.prefreezeFixedAndTranslated7D(memory,[],sheet(values),'2026-08-01','Nocturno'),/fecha/);
assert.throws(()=>translation.prefreezeFixedAndTranslated7D(memory,[],sheet(values),futureDay,'Matutino'),/turno/i);
const missingShift=sheet(['34','75','--','19','20','31']);
const absent=translation.prefreezeFixedAndTranslated7D(memory,[],missingShift,futureDay,'Nocturno');
assert.equal(absent.validTranslations,0);
assert.equal(absent.shifted,undefined);
assert.equal(absent.fixed.direct,'345');
console.log('OK: frozen fixed/translated figures, bounded rigid shift, no lookahead, missing data');

const pairMemory=load('src/figureTranslationMemory7d.ts');
let tracked=pairMemory.initialTranslationMemory7D(memory);
tracked=pairMemory.observeTranslatedFigure7D(tracked,memory,baseline,['0758']);
assert.equal(tracked.observations[0].status,'SOLO_TRASLADADA');
assert.equal(tracked.observations[0].fixedExact,false);
assert.equal(tracked.observations[0].translatedExact,true);
assert.equal(tracked.observations[0].translatedGeometric,true);
assert.deepStrictEqual(memory.originCoordinates,['0:0','0:1','1:1']);
assert.throws(()=>pairMemory.observeTranslatedFigure7D(tracked,memory,baseline,['0758']),/cronologia/);
const nextPair=translation.prefreezeFixedAndTranslated7D(memory,[],sheet(values),'2026-08-06','Nocturno');
tracked=pairMemory.observeTranslatedFigure7D(tracked,memory,nextPair,['0345','0758']);
assert.equal(tracked.observations[1].status,'AMBAS','two compatible readings stay one event');
assert.equal(tracked.observations.length,2);
assert(tracked.observations[1].unionReadings<=tracked.observations[1].fixedReadings+tracked.observations[1].translatedReadings);
const untouched=translation.prefreezeFixedAndTranslated7D(memory,[],sheet(values),'2026-08-07','Nocturno');
tracked=pairMemory.observeTranslatedFigure7D(tracked,memory,untouched,['0999']);
assert.equal(tracked.observations[2].status,'SIN_APOYO');
assert.equal(tracked.rootId,pairMemory.initialTranslationMemory7D(memory).rootId,
 'lack of hits must never erase the original shape');
console.log('OK: original figure survives shifts, independent observation, no double-counted turn');

const promotion=load('src/figurePromotion7d.ts');
let pinned=promotion.createPromotionFocus7D(memory,baseline);
let p1=promotion.previewPromotionFocus7D(pinned,sheet(values),'2026-08-05','Nocturno');
assert.equal(promotion.decidePromotionFocus7D(pinned,p1,'UNA_NUEVA').role,'PRINCIPAL_FIJA');
assert.equal(promotion.decidePromotionFocus7D(pinned,p1,'DOS_NUEVAS').projected,'345');
pinned=promotion.recordPromotionOutcome7D(pinned,p1,['0758']);
let p2=promotion.previewPromotionFocus7D(pinned,sheet(values),'2026-08-06','Nocturno');
assert.equal(promotion.decidePromotionFocus7D(pinned,p2,'UNA_NUEVA').projected,'758');
assert.equal(promotion.decidePromotionFocus7D(pinned,p2,'DOS_NUEVAS').projected,'345');
assert.equal(promotion.decidePromotionFocus7D(pinned,p2,'MARCA_PREVIA_MAS_UNA').projected,'345');
pinned=promotion.recordPromotionOutcome7D(pinned,p2,['0758']);
let p3=promotion.previewPromotionFocus7D(pinned,sheet(values),'2026-08-07','Nocturno');
assert.equal(promotion.decidePromotionFocus7D(pinned,p3,'DOS_NUEVAS').role,'PROMOVER_TRASLADADA');
assert.equal(promotion.decidePromotionFocus7D(pinned,p3,'DOS_NUEVAS').projected,'758');
assert.equal(promotion.decidePromotionFocus7D(pinned,p3,'DOS_NUEVAS').exclusivePriorDraws,2);
pinned=promotion.recordPromotionOutcome7D(pinned,p3,['0999']);
assert.deepStrictEqual(pinned.fixedCoordinates,['0:0','0:1','1:1']);
assert.deepStrictEqual(pinned.shiftedCoordinates,['1:0','1:1','2:1']);
assert.throws(()=>promotion.previewPromotionFocus7D(pinned,sheet(values),'2026-08-07','Nocturno'),/repetido/);
assert.throws(()=>promotion.previewPromotionFocus7D(pinned,sheet(values),'2026-08-08','Matutino'),/Turno/);
const shiftedUnreadable=promotion.previewPromotionFocus7D(pinned,sheet(['34','75','--','19','20','31']),'2026-08-08','Nocturno');
assert.equal(shiftedUnreadable.shifted,undefined);
assert.equal(promotion.decidePromotionFocus7D(pinned,shiftedUnreadable,'DOS_NUEVAS').projected,'345');
console.log('OK: persistent translation promotion needs new independent complete draws; original never erased');

const restEngine=load('src/figureRestReactivation7d.ts');
let reState=promotion.createPromotionFocus7D(memory,baseline);
const sample=[
 ['2026-08-05',['0345','0758']],
 ['2026-08-06',['0999']],
 ['2026-08-07',['0999']],
 ['2026-08-08',['0758']],
 ['2026-08-09',['0758']]
];
for(const [d,heads] of sample){
 const preview=promotion.previewPromotionFocus7D(reState,sheet(values),d,'Nocturno');
 const before=restEngine.decideRestPriority7D(reState,preview,'REPOSO_Y_REGRESO');
 if(d==='2026-08-05')assert.equal(before.focus,'FIJA');
 if(d==='2026-08-08')assert.equal(before.focus,'FIJA','target reactivation cannot trigger itself');
 if(d==='2026-08-09'){
  assert.equal(before.focus,'TRASLADADA','previous draw reactivation can change next decision');
  assert.equal(before.stateBefore.fixed.phase,'REPOSO');
  assert.equal(before.stateBefore.shifted.phase,'REACTIVACION_1');
  assert.equal(restEngine.decideRestPriority7D(reState,preview,'REPOSO_Y_RECONFIRMACION').focus,'FIJA',
   'requires another confirmed completed draw');
 }
 reState=promotion.recordPromotionOutcome7D(reState,preview,heads);
}
const view=restEngine.readPairRest7D(reState.observations);
assert.equal(view.fixed.phase,'REPOSO');
assert.equal(view.shifted.phase,'REACTIVACION_CONFIRMADA');
assert.equal(view.shifted.reappearEvents,1);
assert.equal(view.shifted.reconfirmEvents,1);
const six=promotion.previewPromotionFocus7D(reState,sheet(values),'2026-08-10','Nocturno');
assert.equal(restEngine.decideRestPriority7D(reState,six,'REPOSO_Y_RECONFIRMACION').focus,'TRASLADADA');
const withOutcome=sheet(values);withOutcome.heads.Nocturno=['0345'];withOutcome.matches.Nocturno=[{cabeza:'0345',hits:[]}];
const afterPeek=promotion.previewPromotionFocus7D(reState,withOutcome,'2026-08-10','Nocturno');
assert.deepStrictEqual(restEngine.decideRestPriority7D(reState,afterPeek,'REPOSO_Y_RECONFIRMACION'),
 restEngine.decideRestPriority7D(reState,six,'REPOSO_Y_RECONFIRMACION'),'target marks cannot affect priority');
const noSource=promotion.previewPromotionFocus7D(reState,sheet(['--','75','68','19','20','31']),'2026-08-10','Nocturno');
assert.equal(restEngine.decideRestPriority7D(reState,noSource,'REPOSO_Y_REGRESO').projected,undefined);
assert.throws(()=>restEngine.decideRestPriority7D(reState,{...six,date:'2026-08-09'},'CONSERVAR_FIJA'),/posterior/);
assert.equal(reState.fixedCoordinates.join('>'),'0:0>0:1>1:1');
console.log('OK: rest and reactivation of original/translated path, new-draw confirmation, no lookahead');
