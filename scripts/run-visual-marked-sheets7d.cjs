// Reproduce DOS hojas reales completas y todas sus etapas marcadas.
// Se dibuja DESPUÉS de los sorteos conocidos, incluyendo VT2+VT3+VT4
// y la cabeza COMPLETA debajo. No se calculan candidaturas futuras.
// Ejemplo: --from=2026-09-29 --to=2026-09-30 --out=out/hojas-marcadas
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(name){
 const file=path.resolve(root,name.endsWith('.ts')?name:name+'.ts');
 if(cache.has(file))return cache.get(file).exports;
 const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(file,mod);
 vm.runInThisContext('(function(require,module,exports){'+compiled+'\n})',
  {filename:file})(n=>n.startsWith('.')?
   load(path.relative(root,path.resolve(path.dirname(file),n))):require(n),mod,mod.exports);
 return mod.exports;
}
const {TURNOS}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {buildVisualMarkedSheet7D,renderVisualMarkedSheetHTML7D}=load('src/visualMarkedSheet7d.ts');
const args=Object.fromEntries(process.argv.slice(2)
 .filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from||'2026-09-29',to=args.to||'2026-09-30';
const out=args.out||'out/hojas-marcadas-2026-09';
const millis=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||
 !Number.isFinite(millis(from))||!Number.isFinite(millis(to))||
 millis(from)>millis(to)||millis(to)-millis(from)>8*86400000)
 throw Error('Elegir de una a nueve jornadas, con fechas válidas');
const safeName=x=>x.replace(/[^0-9A-Za-z-]/g,'-');
async function main(){
 const raw=[];
 for(let t=millis(from)-9*86400000;t<=millis(to);t+=86400000){
  const d=new Date(t);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10);
  const heads=await descargarCabezas(date,true);
  if(hasDrawResults(heads)&&hasNocturnoBase(heads))raw.push({date,heads});
 }
 const dir=path.resolve(root,out);fs.mkdirSync(dir,{recursive:true});
 const records=[],links=[];
 for(const day of raw.filter(x=>x.date>=from&&x.date<=to)){
  const i=raw.findIndex(x=>x.date===day.date);
  if(i===0)continue;
  // Nunca se mezclan resultados de futuras jornadas.
  const previous=raw[i-1],full=buildSheet(day.heads,previous.heads);
  const views=[];
  for(const [idx,turn]of TURNOS.entries()){
   const view=buildVisualMarkedSheet7D(full,day.date,turn);
   const name=day.date+'-'+String(idx+1)+'-'+safeName(turn);
   fs.writeFileSync(path.join(dir,name+'.html'),renderVisualMarkedSheetHTML7D(view)+'\n');
   fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify(view,null,2)+'\n');
   views.push({file:name+'.html',date:day.date,turn,
    columns:view.columns.length,counts:view.totals});
   links.push({file:name+'.html',date:day.date,turn,counts:view.totals});
   console.log('HOJA '+day.date+' DESPUES '+turn+
    ' | columnas='+view.columns.length+
    ' | cabezas_completas='+view.totals.heads+
    ' | VT2='+view.totals.vt2+' VT3='+view.totals.vt3+' VT4='+view.totals.vt4);
  }
  records.push({date:day.date,previous:previous.date,views});
 }
 if(!records.length)throw Error('No se pudieron reconstruir las jornadas reales');

 if(records.length>=2){
  // Comparador ocular, no un selector: la persona contempla el mismo turno
  // de dos hojas marcadas en paralelo, con las cabezas y rutas reales.
  const a=records[records.length-2],b=records[records.length-1];
  const map=TURNOS.map(t=>({
   turn:t,left:a.views.find(v=>v.turn===t).file,
   right:b.views.find(v=>v.turn===t).file
  }));
  const compareHTML='<!doctype html><html lang="es"><head><meta charset="utf-8">'+
   '<meta name="viewport" content="width=device-width,initial-scale=1">'+
   '<title>Comparar hojas marcadas '+a.date+' y '+b.date+'</title>'+
   '<style>body{font:16px system-ui,sans-serif;background:#f8f7fb;color:#29243c;padding:14px}'+
   'h1{font-size:22px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}'+
   'iframe{background:white;width:100%;height:82vh;border:1px solid #d8d0e6;border-radius:8px}'+
   '@media(max-width:1000px){.pair{grid-template-columns:1fr} iframe{height:70vh}}'+
   'select{padding:9px;border:1px solid #c7bfd9;border-radius:7px}'+
   'p{color:#5c5470}</style></head><body>'+
   '<h1>Comparación visual de dos hojas +11 MARCADAS</h1>'+
   '<p>Elegí el mismo turno de ambas jornadas. Sólo figuran recorridos VT2, VT3, VT4 comprobados TRAS los sorteos y las cabezas completas debajo.</p>'+
   '<label>Etapa posterior al turno: <select id="turn">'+
   TURNOS.map((t,i)=>'<option value="'+i+'"'+(i===4?' selected':'')+'>'+t+'</option>').join('')+
   '</select></label><div class="pair">'+
   '<section><h2>'+a.date+'</h2><iframe id="left" title="Hoja '+a.date+'"></iframe></section>'+
   '<section><h2>'+b.date+'</h2><iframe id="right" title="Hoja '+b.date+'"></iframe></section></div>'+
   '<p><strong>Qué mirar:</strong> la distribución de marcas, continuidad de trazos, zonas compartidas, ramificaciones y desplazamientos. No se muestran pronósticos ni puntuaciones.</p>'+
   '<p><a href="index.html">Volver al índice</a></p>'+
   '<script>(function(){const stages='+JSON.stringify(map)+';const select=document.getElementById("turn");'+
   'function show(){const s=stages[Number(select.value)];document.getElementById("left").src=s.left;'+
   'document.getElementById("right").src=s.right;} select.addEventListener("change",show);show()})()</script>'+
   '</body></html>';
  fs.writeFileSync(path.join(dir,'comparar.html'),compareHTML);
  console.log('COMPARADOR_OCULAR: '+a.date+' versus '+b.date+' | comparar.html');
 }

 const html='<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+
  '<title>Hojas +11 marcadas — jornadas históricas</title>'+
  '<style>body{font:16px system-ui, sans-serif;background:#f7f5fb;color:#28243a;padding:28px;max-width:950px;margin:auto}'+
  'a{display:block;background:white;padding:14px;border:1px solid #ddd7e7;border-radius:8px;margin:8px 0;color:#5e369f}'+
  'small{color:#5c556d}</style></head><body><h1>Hojas +11 marcadas</h1>'+
  '<p>Documentos reconstruidos <strong>después de cada sorteo</strong>. Todas las coincidencias VT2, VT3 y VT4 y sus cabezas completas. Tocá una etapa para ver los recorridos.</p>'+
  (records.length>=2?'<p><a href="comparar.html"><strong>Comparar lado a lado las dos jornadas</strong> — mismo turno, hojas completas y trazos originales reconstruidos</a></p>':'')+
  records.map(day=>'<section><h2>'+day.date+'</h2><small>Base: Nocturna anterior '+day.previous+'</small>'+
   day.views.map(v=>'<a href="'+v.file+'"><strong>Después de '+v.turn+'</strong> · '+
    v.columns+' columnas · '+v.counts.heads+' cabezas debajo · '+v.counts.strokes+
    ' rutas (VT2 '+v.counts.vt2+', VT3 '+v.counts.vt3+', VT4 '+v.counts.vt4+')</a>').join('')+
   '</section>').join('')+
  '<p><small>No se generaron pronósticos, rankings ni nuevas rutas sobre una hoja vacía. Cada trazo viene de una cabeza conocida.</small></p></body></html>';
 fs.writeFileSync(path.join(dir,'index.html'),html);
 fs.writeFileSync(path.join(dir,'00-LEEME.md'),[
  '# Reconstrucción de hojas marcadas '+from+' → '+to,'',
  'Abrir **index.html** y seleccionar la etapa posterior a cada turno.',
  'Si hay dos fechas, abrir **comparar.html** para ver las hojas lado a lado por turno.',
  'Los dibujos marcan TODOS los recorridos VT2, VT3 y VT4 encontrados',
  'tras conocer las cabezas; anotan abajo la cabeza COMPLETA.',
  'Los archivos *.json guardan celdas y procedencias para analizar',
  'más tarde la evolución visual entre jornadas y turnos.',
  'En las imágenes una columna punteada se añadió AL FINAL del último',
  'turno: no participó en la búsqueda de su cabeza; sí estará disponible',
  'para el turno posterior.',
  '',
  'Esta entrega sólo reconstruye hojas HISTÓRICAS. No contiene pronósticos.'
 ].join('\n')+'\n');
 console.log('HOJAS_MARCADAS_COMPLETAS: '+records.length+
  ' jornadas, '+links.length+' etapas, '+out+'/index.html');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
