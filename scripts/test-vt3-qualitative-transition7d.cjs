// Prueba de la hipótesis fija: GIRO VT3 en la tabla +11 de HOY,
// apoyo geométrico AYER, mismo origen, sin sumar candidatos ni usar
// cabezas del turno objetivo.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ts=require('typescript'),base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const code=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(p,mod);
 const req=name=>name.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(p),name))):require(name);
 vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:p})(req,mod,mod.exports);
 return mod.exports;
}
const {TURNOS,JURS,diaVacio}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {inspectBeforeVT3Selection7D}=load('src/vt3SelectedVsExcluded7d.ts');
const {classifyVisualTransitionVT37D,selectQualitativeVT3Transition7D,
 auditQualitativeVT3Transition7D}=load('src/vt3QualitativeTransition7d.ts');
const vt3Input={
 value:'345',sourceId:'prevNocturno',cells:['2:0','2:1','3:0'],
 shape:'0,1>1,-1'
};
const mark=(date,winningTurn,sourceId,cells,shape,head='0234')=>
 ({date,winningTurn,sourceId,kind:'vt3',value:'234',head,
 cells,shape,provenance:'RECONSTRUIDA_DE_MATCHES'});
const current=[mark('2026-10-10','Previa','prevNocturno',
 ['2:0','3:0','4:0'],'1,0>1,0')];
const prior=[mark('2026-10-09','Previa','prevNocturno',
 ['0:0','1:0','2:0'],'1,0>1,0')];
const full=classifyVisualTransitionVT37D(vt3Input,current,prior);
assert.equal(full.signal,'PUENTE_AYER_HOY_GIRO');
assert.equal(full.level,2);
assert.deepEqual(full.sharedCells,['2:0','3:0']);
assert.equal(full.anchor.head,'0234');
assert.equal(full.antecedentYesterday.date,'2026-10-09');
assert.equal(classifyVisualTransitionVT37D(vt3Input,current,[]).level,1);
assert.equal(classifyVisualTransitionVT37D(vt3Input,[],
 prior).level,0,'Sin ancla de HOY, ayer solo no autoriza giro');
assert.equal(classifyVisualTransitionVT37D(vt3Input,[
 mark('2026-10-10','Previa','Previa',['2:0','3:0','4:0'],'1,0>1,0')
 ],prior).level,0,'No se permite cruzar columnas de origen');
assert.equal(classifyVisualTransitionVT37D(vt3Input,[
 mark('2026-10-10','Previa','prevNocturno',['2:0','2:1','3:0'],
  '0,1>1,-1')
 ],prior).level,0,'La misma secuencia no representa un giro');
assert.equal(classifyVisualTransitionVT37D(vt3Input,[
 mark('2026-10-10','Previa','prevNocturno',['0:0','0:1','1:0'],
 '0,1>1,-1')
 ],prior).level,0,'Un giro exige al menos una celda de contacto');
const previous=diaVacio();
for(let i=0;i<6;i++)previous.Nocturno[JURS[i]]=
 ['0012','0023','0034','0045','0056','0067'][i];
function generated(target='0234',maskFrom){
 const day=diaVacio();
 for(const turn of TURNOS)for(let i=0;i<5;i++)
  day[turn][JURS[i]]=['0234','0345','0456','0567','0678'][i];
 day.Matutino.Ciudad=target;
 if(maskFrom){const at=TURNOS.indexOf(maskFrom);for(const name of TURNOS.slice(at))
  for(const jurisdiction of JURS)day[name][jurisdiction]='9999';}
 return buildSheet(day,previous);
}
const dates=['2026-10-01','2026-10-02','2026-10-03','2026-10-05',
 '2026-10-06','2026-10-07','2026-10-08','2026-10-09'];
const history=dates.map(date=>({date,sheet:generated()}));
const date='2026-10-10';
for(const turn of TURNOS){
 const day=generated('9999');
 const projected=selectQualitativeVT3Transition7D(history,day,date,turn);
 const original=inspectBeforeVT3Selection7D(history,day,date,turn);
 assert.deepEqual(projected.baseline.map(x=>x.value),original.selected,
  'El orden base debe ser idéntico');
 assert.equal(projected.transformed.length,projected.baseline.length);
 assert(projected.transformed.length<=3);
 assert.equal(new Set(projected.transformed.map(x=>x.value)).size,
  projected.transformed.length);
 assert(projected.transformed.every(x=>projected.fullPool.some(y=>y.value===x.value)));
 if(turn==='Previa')assert.equal(projected.changed,0,
  'Sin resultados de hoy no se priorizan giros inexistentes');
 const other=selectQualitativeVT3Transition7D(history,generated('9999',turn),date,turn);
 assert.deepEqual(other,projected,'La cabeza de Matutina no debe afectar otros turnos');
}
const before=selectQualitativeVT3Transition7D(history,generated('9999'),date,'Matutino');
const after=selectQualitativeVT3Transition7D(history,generated('0000'),date,'Matutino');
assert.deepEqual(before,after,'No se puede consultar la cabeza del turno objetivo');
const audit=auditQualitativeVT3Transition7D([...history,{date,sheet:generated('9999')}]);
assert.equal(audit.turns,5);
assert.equal(audit.picks,audit.rows.reduce((n,x)=>n+x.budget,0));
assert.equal(audit.baselineHits,audit.rows.reduce((n,x)=>n+x.originalHits,0));
assert(audit.rows.every(x=>x.selectedOriginal.length===x.selectedVisual.length));
assert.throws(()=>selectQualitativeVT3Transition7D(
 [...history,{date,sheet:generated()}],generated(),date,'Matutino'),/fuga temporal/);
console.log('OK: giro VT3 intradiario con puente de ayer, misma columna, Top3 idéntico en cupo, sin D-7 ni fuga del objetivo');
