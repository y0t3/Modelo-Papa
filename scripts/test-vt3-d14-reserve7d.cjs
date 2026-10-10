const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(p,mod);
 const req=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(p),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(req,mod,mod.exports);
 return mod.exports;
}
const {diaVacio}=load('src/domain.ts'),{buildSheet}=load('src/sheet.ts');
const {freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const {selectD14ReserveVT3,auditD14ReserveVT3}=load('src/vt3D14Reserve7d.ts');
const dates=['2026-09-25','2026-09-26','2026-09-28','2026-09-29','2026-09-30',
 '2026-10-01','2026-10-02','2026-10-03','2026-10-05','2026-10-06',
 '2026-10-07','2026-10-08','2026-10-09'];
const previous=diaVacio();
previous.Nocturno.Ciudad='0012';previous.Nocturno.Provincia='0023';
previous.Nocturno['Córdoba']='0034';previous.Nocturno['Santa Fé']='0045';
function day(i,target='0345'){
 const h=diaVacio();
 if(i===0)h.Previa.Ciudad='0234';
 if(i===6)h.Previa.Ciudad='0345';
 if(i===12)h.Previa.Ciudad=target;
 return {date:dates[i],sheet:buildSheet(h,previous)};
}
const days=dates.map((_,i)=>day(i));
const safe=freezeBeforeTurn7D(days[12].sheet,'Previa');
const preview=selectD14ReserveVT3(days.slice(0,12),safe,dates[12],'Previa');
assert(preview.hasD14&&preview.hasD7);
assert(preview.original.includes('345'));
assert(preview.combined.slice(0,preview.original.length).every((v,i)=>v===preview.original[i]),
 'Nunca desplazar, quitar o reordenar el Top3 original');
assert(preview.combined.length<=3);
assert(preview.added.every(x=>!preview.original.includes(x.value)));
assert(preview.added.every(x=>!x.value.includes(' ')));
const altered=dates.map((_,i)=>day(i,'9999'));
const frozen=selectD14ReserveVT3(altered.slice(0,12),
 freezeBeforeTurn7D(altered[12].sheet,'Previa'),dates[12],'Previa');
assert.deepEqual(frozen,preview,'No usar las cabezas D para elegir reservas');
const report=auditD14ReserveVT3(days);
assert(report.turns>=1);
assert(report.combinedPicks>=report.originalPicks);
assert(report.combinedHits>=report.originalHits);
assert(report.reservePicks===report.combinedPicks-report.originalPicks);
const fake=auditD14ReserveVT3(altered);
const a=report.rows.find(x=>x.date===dates[12]);
const b=fake.rows.find(x=>x.date===dates[12]);
assert(a&&b);
assert.deepEqual(a.selection,b.selection);
assert(b.combinedHits<=a.combinedHits,'Cambiar resultado sólo afecta posterior evaluación');
assert.throws(()=>selectD14ReserveVT3(days,safe,dates[12],'Previa'),/Fuga temporal/);
console.log('OK: top3 D7 intacto, reserva D14 sólo en cupos libres y control de fuga temporal');
