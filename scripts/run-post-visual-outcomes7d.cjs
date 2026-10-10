// Modelo Papá — verificación POSTERIOR, deliberadamente aislada de los
// 30 cortes sin resultado y de sus fichas visuales pre-objetivo.
// Este script no selecciona candidaturas, sólo audita TODAS las alternativas.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const INPUT=path.resolve(ROOT,args.input||'out/topologia-contactos-ciegos');
const OUTPUT=path.resolve(ROOT,args.out||'out/verificacion-posterior-visual');
const TURNOS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const JURS=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const cache=new Map();
function load(name){
 const p=path.resolve(ROOT,name.endsWith('.ts')?name:name+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const compiled=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const obj={exports:{}};cache.set(p,obj);
 vm.runInThisContext('(function(require,module,exports){'+compiled+'\n})',{filename:p})(
  n=>n.startsWith('.')?load(path.relative(ROOT,path.resolve(path.dirname(p),n))):require(n),
  obj,obj.exports);
 return obj.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
function evaluate(cut,heads){
 const source=heads[cut.target]||{};
 const actual=JURS.map(j=>({jurisdiction:j,head:source[j]||'----'}));
 const observed=actual.filter(x=>/^\d{4}$/.test(x.head));
 const complete=observed.length===JURS.length;
 const families=cut.families.map(f=>{
  // A family including both orientations is a search space, NOT a single
  // 2/3/4 digit pick. Showing success for either side is permissive.
  const k=Number(f.kind.slice(-1)),matches=[];
  for(const {jurisdiction,head} of observed){
   const value=head.slice(-k);
   if(f.readings.includes(value))matches.push({jurisdiction,head,
    winningSuffix:value,kind:f.kind});
  }
  const touchingHeads=[...new Set(f.paths.filter(p=>p.contacts.length).map(p=>p.head))];
  return {kind:f.kind,readings:f.readings,priorHeads:f.independentHistoricalHeads,
   touchingPaths:f.touchingPaths,distinctTouchingPriorHeads:touchingHeads.length,
   contactsNewHeads:f.distinctKnownHeads,matched:matches.length>0,
   matchedHeads:matches,
   outcomeStatus:matches.length?'MATCH_RETROSPECTIVO':
    complete?'SIN_MATCH_6_JUR':'INDETERMINADO_COBERTURA_PARCIAL'};
 });
 return {date:cut.date,target:cut.target,priorDate:cut.priorDate,
  caveat:'REPLAY POSTERIOR: ninguna familia fue apuesta pre-sorteo; su orientación tampoco fue elegida.',
  headsObserved:observed.length,headsExpected:JURS.length,coverageComplete:complete,
  heads:actual,families};
}
function test(){
 const base={date:'2026-09-30',target:'Matutino',priorDate:'2026-09-29',
  families:[{kind:'vt3',readings:['778','877'],
   independentHistoricalHeads:2,touchingPaths:2,distinctKnownHeads:['Primera|Córdoba|4107'],
   paths:[{head:'Primera|Entre Ríos|4983',contacts:[{}]},
    {head:'Matutino|Ciudad|7289',contacts:[{}]}]}]};
 const heads={Matutino:{Ciudad:'0000',Provincia:'6778',Córdoba:'----',
  'Santa Fé':'0001','Entre Ríos':'0002',Montevideo:'0003'}};
 const partial=evaluate(base,heads);
 assert.equal(partial.coverageComplete,false);
 assert.equal(partial.families[0].matched,true);
 assert.equal(partial.families[0].matchedHeads[0].winningSuffix,'778');
 heads.Matutino.Provincia='0000';
 const notComplete=evaluate(base,heads);
 assert.equal(notComplete.families[0].outcomeStatus,'INDETERMINADO_COBERTURA_PARCIAL');
 heads.Matutino.Córdoba='0004';
 assert.equal(evaluate(base,heads).families[0].outcomeStatus,'SIN_MATCH_6_JUR');
 console.log('TEST_RESULTADOS_POST_OK: cabezas completas/ausentes, sufijos, dos orientaciones y casos sin match');
}
async function main(){
 test();if(args['test-only']==='true')return;
 const files=fs.readdirSync(INPUT).filter(x=>
  /^\d{4}-\d{2}-\d{2}-ANTES-(Previa|Primera|Matutino|Vespertino|Nocturno)\.json$/.test(x));
 assert.equal(files.length,30,'Faltan cortes ocultos de la primera fase');
 // Primero se cierran todos los análisis visuales desde sus archivos.
 const blind=files.map(f=>JSON.parse(fs.readFileSync(path.join(INPUT,f),'utf8')));
 for(const cut of blind){
  assert(cut.knownToday.every(t=>TURNOS.indexOf(t.turn)<TURNOS.indexOf(cut.target)),
   'Fuga temporal en observaciones ciegas');
  assert(cut.families.every(f=>f.paths.every(p=>cut.columns.some(c=>c.id===p.sourceId))));
 }
 fs.mkdirSync(OUTPUT,{recursive:true});
 const days=[...new Set(blind.map(c=>c.date))].sort();
 const real={};
 // Deliberately retrieves results only AFTER every pre-target analysis is read.
 for(const day of days){
  real[day]=await descargarCabezas(day);
  console.log('RESULTADOS_POST_OBTENIDOS '+day+' | '+TURNOS.map(t=>t+':'+
   JURS.filter(j=>/^\d{4}$/.test(real[day]?.[t]?.[j]||'')).length).join(' '));
 }
 const cases=[];
 for(const cut of blind){
  const outcome=evaluate(cut,real[cut.date]);
  cases.push(outcome);
  const stem=cut.date+'-POST-'+cut.target;
  fs.writeFileSync(path.join(OUTPUT,stem+'.json'),JSON.stringify(outcome,null,2));
  const markdown=['# Verificación posterior SEPARADA: '+cut.date+' '+cut.target,'',
   '**NO predicción.** Todas las familias ya se habían inventariado sin leer este resultado.',
   'Un MATCH retrospectivo sólo significa que alguna de las dos orientaciones',
   'de una familia geométricamente disponible coincide con una cabeza publicada.',
   'No significa que esa orientación, turno y cifra hubieran sido ELEGIDOS ANTES.','',
   'Cobertura de cabezas: '+outcome.headsObserved+' de 6','',
   '| Jurisdicción | Cabeza completa |','|---|---|',
   ...outcome.heads.map(h=>'| '+h.jurisdiction+' | '+h.head+' |'),
   '','| Familia y modalidad | Cabezas históricas | Cabezas históricas que contactan hoy | Resultado histórico | Coincidencias de sufijo |',
   '|---|---:|---:|---|---|',
   ...outcome.families.map(f=>'| '+f.kind.toUpperCase()+' '+f.readings.join('/')+
    ' | '+f.priorHeads+' | '+f.distinctTouchingPriorHeads+' | '+f.outcomeStatus+
    ' | '+(f.matchedHeads.map(x=>x.jurisdiction+':'+x.head).join(', ')||'—')+' |'),
   '','Ninguna familia aquí se debe llamar pronóstico acertado.',''];
  fs.writeFileSync(path.join(OUTPUT,stem+'.md'),markdown.join('\n'));
  console.log('POST '+cut.date+' '+cut.target+' | familias='+outcome.families.length+
   ' | coincidencias='+outcome.families.filter(f=>f.matched).length+
   ' | completas='+outcome.coverageComplete);
 }
 cases.sort((a,b)=>a.date.localeCompare(b.date)||TURNOS.indexOf(a.target)-TURNOS.indexOf(b.target));
 const focus=cases.filter(c=>c.target==='Matutino');
 for(const c of focus){
  const conv=c.families.filter(f=>f.priorHeads>=2);
  const contacted=conv.filter(f=>f.distinctTouchingPriorHeads>=2);
  console.log('CONTROL_RESULTADOS_MAT '+c.date+' '+JSON.stringify({
   headCount:c.headsObserved,complete:c.coverageComplete,
   multiHeadFamilies:conv.map(f=>({kind:f.kind,readings:f.readings,
    touchingHistoricalHeads:f.distinctTouchingPriorHeads,
    touchedNewHeads:f.contactsNewHeads,matched:f.matched,
    matchedValues:f.matchedHeads.map(x=>x.winningSuffix),
    status:f.outcomeStatus})),
   doubleTouchFamilies:contacted.length,doubleTouchMatching:contacted.filter(f=>f.matched).length
  }));
 }
 const rows=['# Verificación posterior de todas las figuras previas','',
  '**ESTO NO SON PREDICCIONES.** Se compararon 30 cortes de observación',
  'histórica con las cabezas reales, después de cerrar los archivos',
  'ciegos. No hubo un selector de valores y tampoco se eligió previamente',
  'un sentido de lectura dentro de la familia (dos alternativas posibles).',
  'Una coincidencia de sufijo en la comparación posterior NO es un acierto',
  'pronosticado ni prueba de ventaja sobre el azar.','',
  '| Fecha | Objetivo | Cabezas obtenidas | Familias visibles | Familias que coinciden retrospectivamente |',
  '|---|---|---:|---:|---:|'];
 for(const c of cases)rows.push('| '+c.date+' | '+c.target+' | '+c.headsObserved+
  '/6 | '+c.families.length+' | '+c.families.filter(f=>f.matched).length+' |');
 rows.push('','## Antes de Matutina: alternativas positivas y negativas','',
  'La selección de estos seis cortes responde al mismo turno, NO a su resultado.',
  'Cada hoja conserva todas las familias incluidas las que no se confirmaron.','');
 for(const c of focus){
  rows.push('### '+c.date+' · Matutina · '+c.headsObserved+'/6 cabezas','');
  const con=c.families.filter(f=>f.priorHeads>=2);
  for(const f of con){
   rows.push('- '+f.kind.toUpperCase()+' '+f.readings.join('/')+
    ' · cabezas viejas='+f.priorHeads+
    ', cabezas viejas con contacto='+f.distinctTouchingPriorHeads+
    ', cabeza(s) nueva(s) contactada(s)='+f.contactsNewHeads.length+
    ' · '+f.outcomeStatus+(f.matchedHeads.length?' ['+f.matchedHeads.map(x=>x.head).join(', ')+']':''));
  }
  rows.push('');
 }
 rows.push('## Advertencias del método','',
  '- Revisar la cobertura de las seis jurisdicciones por turno; falta de datos no significa fallo.',
  '- Distinguir cabezas antiguas diferentes de varias rutas de la MISMA cabeza.',
  '- Un mismo valor y su inversión son dos orientaciones posibles, NO una sola apuesta.',
  '- Comparar el patrón de contacto entre candidatos negativos del mismo corte.',
  '- No cambiar retroactivamente el criterio para explicar las coincidencias;',
  '  si no aparece una diferencia discriminante, registrar OBSERVAR/NO JUGAR.','');
 fs.writeFileSync(path.join(OUTPUT,'RESULTADOS_POSTERIORES.md'),rows.join('\n'));
 fs.writeFileSync(path.join(OUTPUT,'RESULTADOS_POSTERIORES.json'),JSON.stringify(cases,null,2));
 console.log('VERIFICACION_SEPARADA_OK '+cases.length+' cortes, resultados fuera de archivos ciegos');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
