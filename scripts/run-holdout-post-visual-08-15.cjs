// Fase POSTERIOR separada del holdout ocular anterior a Matutina.
// Descarga exclusivamente resultados después de recibir el artefacto CIEGO
// congelado del job anterior. No cambia criterios ni crea nuevos candidatos.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
const argv=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const input=path.resolve(root,argv.input||'out/holdout-ciego-08-15');
const out=path.resolve(root,argv.out||'out/holdout-08-15-resultados-posteriores');
const JURS=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
function load(name){
 const filename=path.resolve(root,name.endsWith('.ts')?name:name+'.ts');
 if(cache.has(filename))return cache.get(filename).exports;
 const js=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(filename,m);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename})(
  n=>n.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(filename),n))):require(n),m,m.exports);
 return m.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
function after(cut,raw){
 assert.equal(cut.target,'Matutino');
 assert(!Object.prototype.hasOwnProperty.call(cut,'targetHeads'));
 const actual=JURS.map(j=>({jurisdiction:j,fullHead:raw?.Matutino?.[j]||'----'}));
 const observed=actual.filter(x=>/^\d{4}$/.test(x.fullHead));
 const complete=observed.length===JURS.length;
 const evaluated=cut.families.map(f=>{
  const len=Number(f.kind.slice(2));assert([2,3,4].includes(len));
  const hits=observed.map(h=>({...h,suffix:h.fullHead.slice(-len)}))
   .filter(h=>f.readings.includes(h.suffix));
  return {id:f.id,kind:f.kind,readings:f.readings,
   eligibleByFrozenRule:f.meetsFrozenVT3Rule,
   originHeadCount:f.oldHeadCount,physicalShapeCount:f.uniquePhysicalShapeCount,
   touchingShapeCount:f.touchingShapes,
   matches:hits,outcome:hits.length?'MATCH_RETROSPECTIVO_EN_UNA_ORIENTACION':
    complete?'SIN_MATCH_SEIS_CABEZAS':'INDETERMINADO_COBERTURA_PARCIAL'};
 });
 const selected=evaluated.filter(f=>f.eligibleByFrozenRule);
 assert.deepEqual(selected.map(x=>x.id),cut.eligibleFamilyIds,
  'No se pueden cambiar familias después de leer el resultado');
 const ext=cut.category==='EXTERNO_A_FORMULACION';
 const state=selected.length===1?
  selected[0].matches.length?'UNA_FAMILIA_DOBLE_CON_MATCH_RETROSPECTIVO':
   complete?'UNA_FAMILIA_DOBLE_SIN_MATCH':'UNA_FAMILIA_CON_COBERTURA_PARCIAL':
  selected.length>1?'AMBIGUO_MULTIPLES_FAMILIAS':'OBSERVAR_SIN_FAMILIA';
 return {date:cut.date,category:cut.category,externalSample:ext,
  target:'Matutino',statusBefore:cut.status,eligibleFamilyIds:cut.eligibleFamilyIds,
  headCoverage:observed.length,coverageComplete:complete,actualHeads:actual,
  evaluated,eligibleEvaluated:selected,resultState:state,
  disclaimer:'Lectura retrospectiva de AMBAS orientaciones. No es acierto pronosticado ni apuesta real.'};
}
function test(){
 const cut={date:'2026-09-16',target:'Matutino',category:'EXTERNO_A_FORMULACION',
  status:'UNA_FAMILIA_SIN_ORIENTACION_ELEGIDA',eligibleFamilyIds:['vt3|178'],
  families:[{id:'vt3|178',kind:'vt3',readings:['178','871'],
   meetsFrozenVT3Rule:true,oldHeadCount:2,uniquePhysicalShapeCount:2,
   touchingShapes:2}]};
 const raw={Matutino:{Ciudad:'1178',Provincia:'0000',Córdoba:'0000',
  'Santa Fé':'0000','Entre Ríos':'0000',Montevideo:'0000'}};
 const a=after(cut,raw);
 assert.equal(a.eligibleEvaluated[0].matches.length,1);
 assert.equal(a.resultState,'UNA_FAMILIA_DOBLE_CON_MATCH_RETROSPECTIVO');
 raw.Matutino.Ciudad='0000';
 assert.equal(after(cut,raw).resultState,'UNA_FAMILIA_DOBLE_SIN_MATCH');
 raw.Matutino.Montevideo='----';
 assert.equal(after(cut,raw).resultState,'UNA_FAMILIA_CON_COBERTURA_PARCIAL');
 assert.throws(()=>after({...cut,eligibleFamilyIds:['vt3|wrong']},raw));
 console.log('TEST_POST_HOLDOUT_OK blinded memberships frozen, reverse readings, absent jurisdictions');
}
async function main(){
 test();if(argv['test-only']==='true')return;
 const registry=JSON.parse(fs.readFileSync(path.join(input,'REGISTRO_CIEGO_PREVIO.json'),'utf8'));
 assert(registry.length>0);
 const records=registry.map(r=>{
  const file=path.join(input,r.date+'-ANTES-Matutino.json');
  const v=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.equal(v.date,r.date);assert.equal(v.status,r.status);
  assert.deepEqual(v.eligibleFamilyIds,r.eligibleFamilyIds);
  assert(v.knownToday.every(s=>['Previa','Primera'].includes(s.turn)));
  assert.equal(v.columns.length,3);assert.equal(v.noFutureDrawResults,true);
  return v;
 });
 // Only AFTER all files and fixed membership were loaded are actual
 // Matutina results fetched; the artifact from the prior job is unmodified.
 const outcomes=[];fs.mkdirSync(out,{recursive:true});
 for(const cut of records){
  const real=await descargarCabezas(cut.date,true);
  const result=after(cut,real);
  outcomes.push(result);
  fs.writeFileSync(path.join(out,cut.date+'-POST-Matutino.json'),JSON.stringify(result,null,2));
  console.log('HOLDOUT_RESULTADO '+cut.date+' | cat='+cut.category+
   ' | headCoverage='+result.headCoverage+'/6 | pre='+result.statusBefore+
   ' | resultado='+result.resultState+' | eligible='+JSON.stringify(result.eligibleEvaluated.map(f=>({
    family:f.id,readings:f.readings,matches:f.matches.map(x=>x.fullHead)}))));
 }
 const mainSample=outcomes.filter(x=>x.externalSample);
 const overlap=outcomes.filter(x=>!x.externalSample);
 const counts={externalDays:mainSample.length,overlapDays:overlap.length,
  oneFamily:mainSample.filter(x=>x.eligibleEvaluated.length===1).length,
  ambiguous:mainSample.filter(x=>x.eligibleEvaluated.length>1).length,
  observeNoFamily:mainSample.filter(x=>x.eligibleEvaluated.length===0).length,
  oneFamilyMatched:mainSample.filter(x=>x.eligibleEvaluated.length===1&&
   x.eligibleEvaluated[0].matches.length>0).length,
  oneFamilyWithoutMatchComplete:mainSample.filter(x=>x.eligibleEvaluated.length===1&&
   x.coverageComplete&&!x.eligibleEvaluated[0].matches.length).length,
  oneFamilyUnknown:mainSample.filter(x=>x.eligibleEvaluated.length===1&&
   !x.coverageComplete&&!x.eligibleEvaluated[0].matches.length).length};
 assert.equal(counts.externalDays+counts.overlapDays,outcomes.length);
 const summary=['# Verificación externa 08–15 sept, con 23 como solapamiento','',
  '**TODOS los resultados se consultaron DESPUÉS de cerrar el registro ciego.**',
  'La descripción VT3 de dos cabezas y dos dibujos distintos en una misma',
  'columna, ambos tocados por marcas de Primera, fue fijada por escrito',
  'antes de ejecutar este contraste. Se conservan TODAS las familias y las',
  'dos orientaciones posibles. NO constituye una predicción de una cifra.',
  'Una coincidencia retrospectiva con alguna de seis cabezas y cualquiera',
  'de las dos lecturas NO equivale al éxito de una apuesta individual.','',
  '| Día | Muestra | Corte ciego | Familias VT3 calificadas | Matutina disponible | Resultado posterior |',
  '|---|---|---|---|---|---|'];
 for(const r of outcomes){
  summary.push('| '+r.date+' | '+(r.externalSample?'EXTERNA':'SOLAPADA')+
   ' | '+r.statusBefore+' | '+(r.eligibleEvaluated.map(f=>f.readings.join('/')).join('; ')||'Ninguna')+
   ' | '+r.headCoverage+'/6 | '+r.resultState+' |');
 }
 summary.push('','## Balance EXCLUSIVAMENTE externo, sin contar el 15/09','',
  'Fechas externas observadas: '+counts.externalDays,
  'Con única familia geométrica: '+counts.oneFamily,
  'Con varias familias (ambiguo): '+counts.ambiguous,
  'Sin familia (observar): '+counts.observeNoFamily,
  'Entre las únicas: coincidencias retrospectivas permisivas en cualquiera de las dos orientaciones: '+counts.oneFamilyMatched,
  'Entre las únicas: ausencia comprobada con las seis cabezas: '+counts.oneFamilyWithoutMatchComplete,
  'Entre las únicas: ausencia indeterminada por cobertura incompleta: '+counts.oneFamilyUnknown,
  '','### Detalle completo de positivos, negativos y ausencias','');
 for(const r of outcomes){
  summary.push('#### '+r.date+' · '+(r.externalSample?'externa':'solapamiento'), '',
   'Cabezas Matutina: '+r.actualHeads.map(h=>h.jurisdiction+':'+h.fullHead).join(' · '),'');
  for(const f of r.evaluated)summary.push('- '+f.kind.toUpperCase()+' '+f.readings.join('/')+
   ' · familia precalificada='+(f.eligibleByFrozenRule?'SÍ':'NO')+
   ', cabezas antiguas='+f.originHeadCount+', dibujos='+f.physicalShapeCount+
   ', dibujos tocados='+f.touchingShapeCount+', '+f.outcome+
   (f.matches.length?' [sufijos '+f.matches.map(h=>h.suffix+' ('+h.fullHead+')').join(', ')+']':''));
  summary.push('');
 }
 summary.push('**Límites:** retrospectivo; muestra corta, orientaciones dobles,',
  'seis jurisdicciones por turno. No se deriva porcentaje de predicción',
  'real, ventaja estadística, TOP de candidatos ni recomendación de jugar.','');
 fs.writeFileSync(path.join(out,'RESULTADO_CONTRASTE_EXTERNO.md'),summary.join('\n'));
 fs.writeFileSync(path.join(out,'RESULTADO_CONTRASTE_EXTERNO.json'),JSON.stringify({
  protocol:'HOLDOUT_POSTERIOR_V1',counts,outcomes},null,2));
 console.log('HOLDOUT_POST_FIN '+JSON.stringify(counts));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
