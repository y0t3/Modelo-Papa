// Modelo Papá: extend the existing fully blind 95-cut viewer with a human
// comparative notebook. Never fills a prediction or peeks at target heads.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('=')).map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const input=path.resolve(root,args.input||'out/examen-ciego-95-septiembre');
const output=path.resolve(root,args.out||'out/lab-cuaderno-ocular95');
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const safe=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const digest=cut=>crypto.createHash('sha256').update(JSON.stringify(cut)).digest('hex');
function html(cut,opts={}){
 const live=opts.session==='LIVE';
 assert.equal(cut.mode,'ANTES_DEL_SORTEO_OBJETIVO');
 assert.equal(cut.noAutomatedCandidate,true);
 const ix=turns.indexOf(cut.target);assert(ix>=0);
 assert.equal(cut.columns.length,ix+1);
 assert(cut.knownToday.every(s=>turns.indexOf(s.turn)<ix));
 const d=digest(cut);
 const serialized=JSON.stringify({cut,digest:d,session:live?'LIVE':'REPLAY_HISTORICO'}).replace(/</g,'\\u003c');
 const before=cut.date+'-ANTES-'+cut.target;
 return '<!doctype html><html lang="es"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width, initial-scale=1">'+
  '<title>Cuaderno ocular comparativo '+safe(cut.date)+' '+safe(cut.target)+'</title>'+
  '<link rel="stylesheet" href="lab-comparativa.css"></head><body><main>'+
  '<h1>Modelo Papá · cuaderno ocular comparativo</h1>'+
  '<p><strong>'+safe(cut.date)+' · ANTES de '+safe(cut.target)+'</strong> · recuerdo D−1: '+safe(cut.priorDate)+
  (cut.d7Date?' · memoria D−7: '+safe(cut.d7Date):'')+'</p>'+
  '<p class="muted"><strong>'+(live?'CAPTURA EN TIEMPO REAL; DECISIÓN TODAVÍA NO SELLADA.':'REPLAY HISTÓRICO.')+'</strong> No contiene la cabeza objetivo ni el resultado futuro. '+
  'Se pueden comparar todas las rutas realmente marcadas en la hoja anterior, sus giros/inversiones y las demás alternativas. '+
  'No se elige un número automáticamente. El JSON local no certifica anterioridad: para ello hace falta un sello remoto previo al sorteo.</p>'+
  '<div class="panels"><section class="panel"><h2>Hoja anterior ya MARCADA · cabezas completas</h2>'+
  '<iframe src="'+safe(cut.priorDate)+'-5-Nocturno.html" title="Todas las cabezas y sus caminos"></iframe>'+
  '<p><a href="'+safe(before)+'.html">Abrir visor completo: dibujar otros recorridos manualmente</a></p></section>'+
  '<section class="panel"><h2>+11 disponible en ese momento</h2><p class="muted" id="all-count"></p>'+
  '<div class="board"><svg id="board" xmlns="http://www.w3.org/2000/svg" height="412" role="img" aria-label="Todos los recorridos heredados y marcas conocidas de hoy"></svg></div>'+
  '<p class="muted">Violeta: rutas históricas D−1 / D−7. Verde: marcas de hoy ya comprobadas. '+
  'Rosa: huella elegida para inspección. Una inversión es OTRA lectura del mismo dibujo, no otro dibujo.</p></section></div>'+
  '<section class="panel"><h2>Decisión personal y contraste con alternativas</h2>'+
  '<fieldset><legend>¿Hay alguna huella que de verdad se distinga?</legend>'+
  '<label><input type="radio" name="decision" id="abstain" checked> OBSERVAR / NO JUGAR</label>'+
  '<label><input type="radio" name="decision" id="hypothesis"> Explorar hipótesis visual</label></fieldset>'+
  '<div id="abstention-panel"><label class="block" for="abstain-reason">Por qué ninguna figura se destaca de las otras</label>'+
  '<textarea id="abstain-reason" placeholder="Qué trazos parecen prometedores, qué trayectorias compiten, por qué no se puede elegir..."></textarea></div>'+
  '<div id="hypothesis-panel" hidden>'+
  '<label class="block" for="path">Huella de una cabeza histórica anterior (todos los recorridos disponibles)</label>'+
  '<select id="path"></select><p id="head-proof"></p>'+
  '<label class="block" for="direction">Sentido elegido expresamente antes de ver la cabeza objetivo</label>'+
  '<select id="direction"><option value="directa">Directa (orden trazado)</option><option value="inversa">Inversa (recorrer al revés)</option></select>'+
  '<p id="read-preview"></p>'+
  '<label class="block" for="reason">Por qué esta huella y no las demás</label>'+
  '<textarea id="reason" placeholder="Describí ubicación, forma, giro, avance, convergencia y tu lectura. No inventes contactos."></textarea>'+
  '<label class="block" for="rival">La alternativa visible que también podría haberse elegido</label>'+
  '<select id="rival"></select><p id="rival-preview"></p>'+
  '<label class="block" for="rival-reason">Contraargumento: por qué NO elegir esa alternativa</label>'+
  '<textarea id="rival-reason" placeholder="Escribí un motivo visual verificable, o explicá por qué no hay alternativas."></textarea>'+
  '<button type="button" id="add">Registrar esta comparación (máximo 3)</button>'+
  '<p id="counter"></p><div id="entries"></div></div>'+
  '<p><button id="save" type="button" class="primary">Exportar registro JSON para verificación</button></p>'+
  '<p id="message" role="status"></p>'+
  '<p class="muted">Este visor NO consulta resultados del objetivo. Una persona debe elegir o abstenerse. '+
  'Para cualquier ensayo verdaderamente prospectivo, publicar el registro en un repositorio con sello temporal '+
  'ANTES de la hora real del sorteo y luego hacer un cotejo separado.</p></section>'+
  '<p><a href="index.html">Volver a los 95 cortes</a></p>'+
  '<script type="application/json" id="cut-data">'+serialized+'</script>'+
  '<script src="lab-comparativa.js"></script></main></body></html>';
}
function tests(){
 const sample={date:'2026-09-30',target:'Matutino',priorDate:'2026-09-29',
  d7Date:'2026-09-23',mode:'ANTES_DEL_SORTEO_OBJETIVO',noAutomatedCandidate:true,
  columns:[{id:'prevNocturno'},{id:'Previa'},{id:'Primera'}],
  knownToday:[{turn:'Previa'}],inherited:[],d7Inherited:[]};
 const a=html(sample),b=html(sample);
 assert.equal(a,b);
 assert(a.includes('OBSERVAR / NO JUGAR'));
 assert(a.includes('por qué NO elegir esa alternativa'));
 assert(!a.includes('6778'),'No inyectar el sorteo objetivo en datos de muestra');
 assert.throws(()=>html({...sample,knownToday:[{turn:'Matutino'}]}));
 console.log('TEST_CUADERNO_HTML_OK no resultado objetivo, modo abstencion, motivo comparativo, firma de fuente');
}
function main(){
 tests();if(args['test-only']==='true')return;
 const names=fs.readdirSync(input);
 const files=names.filter(x=>/^\d{4}-\d{2}-\d{2}-ANTES-(Previa|Primera|Matutino|Vespertino|Nocturno)\.json$/.test(x)).sort();
 assert.equal(files.length,95,'Faltan los 95 cortes completos');
 fs.mkdirSync(output,{recursive:true});
 for(const n of names){
  const orig=path.join(input,n);
  if(fs.statSync(orig).isFile())fs.copyFileSync(orig,path.join(output,n));
 }
 fs.copyFileSync(path.join(root,'scripts/lab-comparativa95.js'),path.join(output,'lab-comparativa.js'));
 fs.copyFileSync(path.join(root,'scripts/lab-comparativa95.css'),path.join(output,'lab-comparativa.css'));
 const links=[],seen=new Set();
 for(const name of files){
  const cut=JSON.parse(fs.readFileSync(path.join(input,name),'utf8'));
  const fn='MIRADA-'+cut.date+'-ANTES-'+cut.target+'.html';
  fs.writeFileSync(path.join(output,fn),html(cut));
  const id=cut.date+'|'+cut.target;
  assert(!seen.has(id));seen.add(id);
  links.push({date:cut.date,target:cut.target,file:fn});
 }
 assert.equal(links.length,95);
 const groups=[...new Set(links.map(x=>x.date))].sort().map(date=>
  '<section><h2>'+safe(date)+'</h2>'+
  links.filter(x=>x.date===date).map(l=>'<a href="'+safe(l.file)+'">ANTES '+safe(l.target)+'</a>').join('')+
  '</section>').join('');
 const index='<!doctype html><html lang="es"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<link rel="stylesheet" href="lab-comparativa.css"><title>Cuaderno ocular · 95 cortes</title></head><body><main>'+
  '<h1>Cuaderno ocular comparativo · 95 cortes históricos</h1>'+
  '<p>Elegí personalmente una huella y una alternativa rival, o registrá OBSERVAR / NO JUGAR. '+
  'No hay resultados del turno objetivo, pronósticos automáticos ni prioridad dada por el motor. '+
  'Cada fecha es una simulación retrospectiva, no prueba de predicción anterior al sorteo.</p>'+
  '<p><a href="README_CUADERNO.md">Instrucciones de registro y validación</a></p>'+
  groups+'</main></body></html>';
 fs.writeFileSync(path.join(output,'index.html'),index);
 fs.writeFileSync(path.join(output,'README_CUADERNO.md'),[
  '# Cuaderno ocular comparativo de Modelo Papá','',
  'Abrí index.html offline, elegí fecha y turno y revisá la hoja antigua completa.',
  'Violeta = recorridos heredados; verde = marcas de sorteos del día ya cerrados.',
  'Elegí al menos una figura antigua, sentido y alternativa rival, y justificá ambos',
  'por escrito; o elegí OBSERVAR/NO JUGAR y explicá por qué.',
  'Exportá el JSON y validalo con:',
  'node scripts/check-cuaderno-ocular.cjs --record=<archivo-exportado> --cut=<fecha-ANTES-turno.json>',
  '',
  'El hash de la lámina prueba integridad referencial, no hora de creación.',
  'Los 95 turnos de septiembre son replay histórico: no sirven para atribuirse',
  'pronósticos reales realizados antes de esos sorteos.',''].join('\n'));
 console.log('CUADERNO_OCULAR_READY '+links.length+' vistas comparativas completas, no selecciona cifras');
}
if(require.main===module)main();
module.exports={html,digest};
