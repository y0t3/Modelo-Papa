// Examen ocular PRE-OBJETIVO, 30 cortes sin resultados del turno futuro.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const INPUT=path.resolve(ROOT,args.input||'out/cadena-visual-08-30-septiembre');
const OUT=path.resolve(ROOT,args.out||'out/examen-ciego-95-septiembre');
const TURNOS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const COLS=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
 .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function load(date,stage){
 const data=JSON.parse(fs.readFileSync(path.join(INPUT,date+'-'+stage+'-'+TURNOS[stage-1]+'.json'),'utf8'));
 assert.equal(data.date,date);assert.equal(data.closedTurn,TURNOS[stage-1]);return data;
}
function reading(trace,cols){
 const col=cols.find(c=>c.id===trace.sourceId);if(!col)return null;
 const chars=trace.cells.map(p=>{const [r,s]=p.split(':').map(Number);
  assert(Number.isInteger(r)&&r>=0&&r<6&&[0,1].includes(s));
  return col.values[r]?.[s]||'';});
 return chars.every(c=>/^\d$/.test(c))?chars.join(''):null;
}
function makeCut(prior,stage,k,weekly=null){
 assert(k>=0&&k<TURNOS.length);
 const columns=stage.columns.slice(0,k+1).map(c=>({id:c.id,label:c.label,values:[...c.values]}));
 assert.deepEqual(columns.map(c=>c.id),COLS.slice(0,k+1));
 // For Previa the source stage includes the result of Previa;
 // suppress ALL its strokes and its newly added column.
 const knownToday=k===0?[]:stage.strokes.map(t=>({...t,cells:[...t.cells]}));
 assert(knownToday.every(t=>TURNOS.indexOf(t.turn)<k),
  'Future head detected in previous-turn marked sheet');
 const mapPrevious=v=>v.strokes.filter(t=>columns.some(c=>c.id===t.sourceId))
  .map(t=>({...t,cells:[...t.cells],todayReading:reading(t,columns)}))
  .filter(t=>t.todayReading!==null);
 const inherited=mapPrevious(prior),d7Inherited=weekly?mapPrevious(weekly):[];
 return {protocol:'EXAMEN_OCULAR_CIEGO_RETROSPECTIVO_V1',date:stage.date,
  target:TURNOS[k],priorDate:prior.date,d7Date:weekly?.date||null,
  columns,priorStrokes:prior.strokes,inherited,knownToday,d7Inherited,
  mode:'ANTES_DEL_SORTEO_OBJETIVO',noAutomatedCandidate:true,
  note:'La hoja anterior se marcó DESPUÉS de sus sorteos. Este examen histórico no es un pronóstico real.'};
}
function page(cut){
 const title=cut.date+' · ANTES de '+cut.target;
 const data=JSON.stringify(cut).replace(/</g,'\\u003c');
 const week=cut.d7Date?'<details><summary>Hoja D−7 opcional: '+cut.d7Date+
  '</summary><iframe src="'+cut.d7Date+'-5-Nocturno.html" title="Hoja D-7 completa"></iframe></details>':'';
 return '<!doctype html><html lang="es"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Modelo Papá · '+esc(title)+'</title>'+
  '<link rel="stylesheet" href="visor-ciego.css"></head><body>'+
  '<main><h1>Modelo Papá · '+esc(title)+'</h1>'+
  '<p><b>Corte histórico congelado.</b> El resultado del turno objetivo no está en este archivo. '+
  'Se ve la hoja previa completa y la tabla +11 de hoy SOLO con las columnas que existían en ese momento. '+
  'A la derecha podés examinar todas las marcas conocidas, y dibujar tu propia interpretación sobre celdas físicas.</p>'+
  '<div class="panels"><section class="panel"><h2>Hoja histórica ya marcada · '+cut.priorDate+'</h2>'+
  '<iframe src="'+cut.priorDate+'-5-Nocturno.html" title="Hoja completa anterior con todas sus cabezas y marcas"></iframe>'+
  week+'</section><section class="panel"><h2>Hoy: tablero +11 ANTES de '+cut.target+'</h2>'+
  '<p class="sm" id="count"></p>'+
  '<div class="controls"><label><input type="checkbox" data-layer="past" checked> Rutas de ayer releídas</label>'+
  '<label><input type="checkbox" data-layer="known" checked> Marcas ya comprobadas hoy</label>'+
  '<label><input type="checkbox" data-layer="d7"> Memoria D−7 (opcional)</label>'+
  '<label><input type="checkbox" data-kind="vt2" checked> VT2</label>'+
  '<label><input type="checkbox" data-kind="vt3" checked> VT3</label>'+
  '<label><input type="checkbox" data-kind="vt4" checked> VT4</label>'+
  '<label>Resaltar recorrido histórico: <select id="focus"><option value="">Todos</option></select></label></div>'+
  '<div id="boardWrap"><svg id="board" aria-label="Tabla progresiva con rutas físicas" role="img"></svg></div>'+
  '<p class="sm">Cada ruta permanece dentro de una sola columna. Los trazos violetas vienen de la hoja marcada anterior; '+
  'los verdes son las marcas comprobadas hasta el último sorteo cerrado. El ocre muestra D−7 si se habilita.</p>'+
  '</section></div>'+
  '<section class="panel"><h2>Interpretación propia (sin ver el sorteo objetivo)</h2>'+
  '<p>Tocá entre 2 y 4 celdas contiguas de una sola columna para dibujar una formación. '+
  'No podés saltar filas, mezclar columnas ni repetir celdas. No hay obligación de proponer números; abstenerse es válido.</p>'+
  '<p id="route">Trazo manual: vacío</p>'+
  '<button id="clear" type="button">Borrar trazo manual</button>'+
  '<p><label for="reason">Motivo VISUAL frente a las otras alternativas</label></p>'+
  '<textarea id="reason" placeholder="Describí una huella, orientación, continuidad, giro, convergencia o por qué ninguna se destaca."></textarea>'+
  '<p><button id="add" type="button">Guardar hipótesis manual (máximo 3)</button></p>'+
  '<div id="candidates"></div>'+
  '<p><button id="save" type="button" class="primary">Exportar registro JSON local</button> <span id="status" role="status"></span></p>'+
  '<p class="sm">Si no agregás ninguna ruta, el registro indicará OBSERVAR / NO JUGAR. '+
  'Esto es un replay de fechas pasadas; el archivo descargado NO certifica que la observación se hizo antes del sorteo real.</p>'+
  '</section><p><a href="index.html">Volver al índice de los 30 cortes</a></p></main>'+
  '<script id="cut-data" type="application/json">'+data+'</script>'+
  '<script src="visor-ciego.js"></script></body></html>';
}
function test(){
 const old={date:'2026-09-29',strokes:[{kind:'vt2',sourceId:'prevNocturno',
  cells:['1:0','0:0'],value:'54',fullHead:'0154',turn:'Primera'}]};
 const stage={date:'2026-09-30',columns:[
  {id:'prevNocturno',values:['00','11','22','33','44','55']},
  {id:'Previa',values:['44','33','66','77','88','99']},
  {id:'Primera',values:['88','99','00','11','22','33']}],
  strokes:[{kind:'vt2',sourceId:'prevNocturno',cells:['0:0','1:0'],
   turn:'Previa',fullHead:'1553',value:'01'}]};
 const a=makeCut(old,stage,0);
 assert.equal(a.columns.length,1);assert.equal(a.knownToday.length,0);
 const b=makeCut(old,stage,1);
 assert.equal(b.columns.length,2);assert.equal(b.knownToday.length,1);
 assert.equal(b.inherited[0].todayReading,'10');
 const future={...stage,strokes:[...stage.strokes,{...stage.strokes[0],
  turn:'Primera',fullHead:'0910'}]};
 assert.throws(()=>makeCut(old,future,1),/Future head/);
 const html=page(b);assert(!html.includes('0910'));assert(html.includes('EXAMEN_OCULAR_CIEGO'));
 console.log('TEST_BLIND_OK: progressive stage, target censorship, path rereading, unsafe stage rejection');
}
function main(){
 test();if(args['test-only']==='true')return;
 const dates=fs.readdirSync(INPUT).filter(f=>/^\d{4}-\d{2}-\d{2}-5-Nocturno\.json$/.test(f))
  .map(x=>x.slice(0,10)).sort();
 assert.equal(dates.length,20,'Se requieren exactamente 20 hojas completas del 08 al 30 de septiembre');
 fs.mkdirSync(OUT,{recursive:true});
 fs.copyFileSync(path.resolve(ROOT,'scripts/visor-ciego7d.js'),path.join(OUT,'visor-ciego.js'));
 fs.copyFileSync(path.resolve(ROOT,'scripts/visor-ciego7d.css'),path.join(OUT,'visor-ciego.css'));
 const records=[],groups=[];
 for(let i=1;i<dates.length;i++){
  const date=dates[i],priorDate=dates[i-1],prior=load(priorDate,5);
  const day7=dates.find(d=>Date.parse(date+'T12:00:00Z')-Date.parse(d+'T12:00:00Z')===7*86400000);
  const weekly=day7?load(day7,5):null;
  for(const d of [priorDate,day7].filter(Boolean)){
   const filename=d+'-5-Nocturno.html',dest=path.join(OUT,filename);
   if(!fs.existsSync(dest))fs.copyFileSync(path.join(INPUT,filename),dest);
  }
  const links=[];
  for(let k=0;k<5;k++){
   const stage=load(date,k===0?1:k);
   const cut=makeCut(prior,stage,k,weekly);
   const label=date+'-ANTES-'+TURNOS[k],html=page(cut);
   fs.writeFileSync(path.join(OUT,label+'.html'),html);
   // There is no full-day current state and no future heads in these JSON files.
   fs.writeFileSync(path.join(OUT,label+'.json'),JSON.stringify(cut,null,2));
   const record={date,turn:TURNOS[k],old:priorDate,columns:cut.columns.length,
    inherited:cut.inherited.length,known:cut.knownToday.length,d7:day7||null,file:label+'.html'};
   records.push(record);
   links.push('<a href="'+label+'.html">ANTES '+TURNOS[k]+
    ' · columnas '+record.columns+' · rutas de ayer '+record.inherited+
    ' · marcas anteriores de hoy '+record.known+'</a>');
   console.log('EXAMEN '+date+' ANTES '+TURNOS[k]+' | columnas='+record.columns+
    ' | heredadas='+record.inherited+' | conocidas='+record.known+' | D7='+(day7||'no'));
  }
  groups.push('<section><h2>'+date+' · hoja anterior '+priorDate+'</h2>'+links.join('')+'</section>');
 }
 fs.writeFileSync(path.join(OUT,'index.html'),'<html lang="es"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<link rel="stylesheet" href="visor-ciego.css"><title>Examen ocular · 95 cortes</title></head><body><main>'+
  '<h1>Modelo Papá · 95 exámenes visuales sin resultado objetivo</h1>'+
  '<p>Simulaciones retrospectivas del 09 al 30 de septiembre, sobre 20 hojas del 08 al 30. Partimos de las hojas MARCADAS completas; '+
  'cada corte conserva únicamente columnas y marcas que existían ANTES del turno. '+
  'El visor deja dibujar VT2, VT3, VT4 a mano, justificar o abstenerse. NO es validación prospectiva.</p>'+
  groups.join('')+'</main></body></html>');
 fs.writeFileSync(path.join(OUT,'AUDITORIA_CORTES.json'),JSON.stringify(records,null,2));
 assert.equal(records.length,95,'19 transiciones × 5 turnos = 95 cortes previos');
 console.log('EXAMEN_CIEGO_OK '+records.length+' cortes, sin resultados del objetivo en páginas');
}
main();
