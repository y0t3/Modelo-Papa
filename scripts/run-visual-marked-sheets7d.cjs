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
 const html='<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+
  '<title>Hojas +11 marcadas — jornadas históricas</title>'+
  '<style>body{font:16px system-ui, sans-serif;background:#f7f5fb;color:#28243a;padding:28px;max-width:950px;margin:auto}'+
  'a{display:block;background:white;padding:14px;border:1px solid #ddd7e7;border-radius:8px;margin:8px 0;color:#5e369f}'+
  'small{color:#5c556d}</style></head><body><h1>Hojas +11 marcadas</h1>'+
  '<p>Documentos reconstruidos <strong>después de cada sorteo</strong>. Todas las coincidencias VT2, VT3 y VT4 y sus cabezas completas. Tocá una etapa para ver los recorridos.</p>'+
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
