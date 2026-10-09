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
assert.throws(()=>translation.prefreezeFixedAndTranslated7D(memory,[],sheet(values),futureDay,'Matutino'),/turno/);
const missingShift=sheet(['34','75','--','19','20','31']);
const absent=translation.prefreezeFixedAndTranslated7D(memory,[],missingShift,futureDay,'Nocturno');
assert.equal(absent.validTranslations,0);
assert.equal(absent.shifted,undefined);
assert.equal(absent.fixed.direct,'345');
console.log('OK: frozen fixed/translated figures, bounded rigid shift, no lookahead, missing data');
