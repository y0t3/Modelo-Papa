// Compara huellas REALES ya marcadas del 29 con las mismas celdas +11
// visibles ANTES de cada turno del 30. No produce predicciones ni Top3.
// Todas las modalidades VT2/VT3/VT4 permanecen, con cabeza completa.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(name){
 const p=path.resolve(root,name.endsWith('.ts')?name:name+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(p,m);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  x=>x.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(p),x))):require(x),m,m.exports);
 return m.exports;
}
const {TURNOS,JURS}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {buildVisualMarkedSheet7D}=load('src/visualMarkedSheet7d.ts');
const {descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const OLD='2026-09-29',NOW='2026-09-30';
const out='out/lectura-real-marcada-29-30-sep';
const key=x=>x.join('>');
function closeTouch(a,b){
 return a.sourceId===b.sourceId&&a.cells.some(c=>b.cells.includes(c));
}
function readSameCells(route,cols){
 const col=cols.find(x=>x.id===route.sourceId);
 if(!col)return null;
 const d=route.cells.map(cell=>{
  const [r,c]=cell.split(':').map(Number);return col.values[r]?.[c]||'';
 });
 return d.every(x=>/^\d$/.test(x))?d.join(''):null;
}
function getCut(old,full,turn){
 const ix=TURNOS.indexOf(turn),cols=full.columns.slice(0,ix+1);
 const known=ix===0?[]:buildVisualMarkedSheet7D(full,NOW,TURNOS[ix-1]).strokes;
 const traces=old.strokes.filter(x=>cols.some(c=>c.id===x.sourceId)).map(x=>({
  ...x,readNow:readSameCells(x,cols),
  exactKnown:known.some(y=>y.sourceId===x.sourceId&&key(y.cells)===key(x.cells)),
  contactKnown:known.some(y=>closeTouch(x,y))
 })).filter(x=>x.readNow!==null);
 return {turn,columns:cols,knownToday:known,sourceDay:OLD,
  records:traces,excludedFutureRows:old.strokes.length-traces.length};
}
function gridFor(col,cells){
 const active=new Set(cells),rows=[];
 for(let r=0;r<6;r++){
  const v=col.values[r]||'--';
  rows.push('| '+JURS[r]+' | '+[0,1].map(c=>{
   const d=v[c]||'—';return active.has(r+':'+c)?'**'+d+'**':d;
  }).join(' | ')+' |');
 }
 return '| Fila | Izq. | Der. |\n|---|:---:|:---:|\n'+rows.join('\n');
}
function formatCase(record,old,newCols){
 const past=old.columns.find(c=>c.id===record.sourceId);
 const current=newCols.find(c=>c.id===record.sourceId);
 return [
  '#### Cabeza '+record.fullHead+' ('+record.turn+' del 29) · '+record.kind.toUpperCase(),
  '',
  '**Columna física '+record.sourceId+'**, ruta ordenada '+record.cells.join(' → ')+
   ', cifra que explicó: **'+record.value+'**, relectura el 30: **'+record.readNow+'**.',
  '',
  '| Hoja del 29 | Hoja del 30, antes del objetivo |',
  '|---|---|',
  '| '+record.value+' en '+record.sourceId+' | '+record.readNow+' en el mismo origen |',
  '',
  '**29/09, con celdas de la ruta resaltadas**',
  '',
  gridFor(past,record.cells),'',
  '**30/09, relectura sobre esas mismas celdas**',
  '',
  gridFor(current,record.cells),'',
  'Relación con recorridos que ya se habían comprobado HOY: '+
   (record.exactKnown?'misma huella física marcada':record.contactKnown?
    'comparte una o más celdas':'sin contacto con marcas previas conocidas en esa columna'),
  ''
 ].join('\n');
}
function buildMarkdown(old,cut){
 const lines=['# Lectura visual del 29 sobre la tabla +11 del 30',
  '','**Objetivo todavía no sorteado:** '+cut.turn+' del 30/09/2026',
  '',
  'La hoja del 29 se construyó con las cabezas YA SORTEADAS, marcando',
  'TODOS los recorridos VT2/VT3/VT4 coincidentes. Esta página muestra',
  'qué leen esos MISMOS recorridos en las columnas +11 disponibles',
  'ANTES de '+cut.turn+'. No añade trayectorias a una hoja vacía.',
  '',
  '**Columnas visibles ahora:** '+cut.columns.map(c=>c.id).join(', '),
  '',
  '**Marcas ya comprobadas en turnos anteriores de hoy:** '+cut.knownToday.length+
   ' recorridos. No se utilizan cabezas de '+cut.turn+' ni turnos siguientes.',
  '',
  '| Modalidad | Recorridos del 29 legibles hoy | Con contacto a marcas anteriores de hoy |',
  '|---|---:|---:|'];
 for(const k of ['vt2','vt3','vt4']){
  const r=cut.records.filter(x=>x.kind===k);
  lines.push('| '+k.toUpperCase()+' | '+r.length+' | '+
   r.filter(x=>x.contactKnown).length+' |');
 }
 lines.push('','## Todas las relecturas físicas (sin ranking)',
  '','| Cabeza completa anterior | Modalidad | Columna | Celdas ordenadas | Marcó en 29 | Lee ahora | Marca anterior de hoy |',
  '|---|---|---|---|---|---|---|');
 for(const x of cut.records)lines.push('| '+x.fullHead+' ('+x.turn+') | '+
  x.kind.toUpperCase()+' | '+x.sourceId+' | '+x.cells.join(' → ')+
  ' | '+x.value+' | '+x.readNow+' | '+(x.exactKnown?'misma huella':x.contactKnown?'contacto':'—')+' |');
 lines.push('','## Fichas visuales de recorridos históricos','',
  'Cada ficha muestra las seis filas de UNA columna original, resaltando las celdas marcadas',
  'y su relectura en el mismo origen del día siguiente. No se elige ninguna cifra por acertar.',
  '');
 // TODAS las rutas legibles, sin elegir retrospectivamente casos favorables.
 for(const x of cut.records)lines.push(formatCase(x,old,cut.columns));
 lines.push('','## Límite de la interpretación','',
  'La permanencia de una huella y el número que ahora se lee son hechos',
  'geométricos. No prueban que el resultado del sorteo objetivo coincida.',
  'La interpretación visual exige estudiar el conjunto de recorridos',
  'marcados, su desplazamiento y sus vínculos, no convertir cada',
  'relectura en una recomendación o sumar candidatos.');
 return lines.join('\n')+'\n';
}

// Galería estática y navegable: se ven dos tableros 6x2, con las celdas
// de CADA recorrido histórico resaltadas y numeradas en su orden real.
// Sin scripts, sin selección de pronósticos y sin nuevos caminos.
function htmlEscape(x){return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;')
 .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function boardHtml(col,cells){
 const order=new Map(cells.map((cell,i)=>[cell,i+1]));
 return '<table class="board"><thead><tr><th>Fila</th><th>Izq.</th><th>Der.</th></tr></thead><tbody>'+
  JURS.map((jur,r)=>'<tr><th>'+htmlEscape(jur)+'</th>'+
   [0,1].map(side=>{
    const cell=r+':'+side;
    const digit=col.values[r]?.[side]||'—';
    const n=order.get(cell);
    return '<td'+(n?' class="lit"':'')+'>'+
     (n?'<sup>'+n+'</sup>':'')+htmlEscape(digit)+'</td>';
   }).join('')+'</tr>').join('')+'</tbody></table>';
}
function htmlGallery(old,cut){
 const details=cut.records.map((x,i)=>{
  const oldCol=old.columns.find(c=>c.id===x.sourceId);
  const newCol=cut.columns.find(c=>c.id===x.sourceId);
  const relation=x.exactKnown?'Misma ruta ya marcada en turno anterior de hoy':
   x.contactKnown?'Contacto con una marca previa de hoy':'Sin contacto con marcas previas de hoy';
  return '<details><summary><strong>'+htmlEscape(x.fullHead)+'</strong> ('+
   htmlEscape(x.turn)+' del 29) · '+x.kind.toUpperCase()+' · '+
   htmlEscape(x.sourceId)+' · '+htmlEscape(x.value)+' → '+
   htmlEscape(x.readNow)+'</summary><div class="pair"><section>'+
   '<h3>29 de septiembre · marcas de cabeza '+htmlEscape(x.fullHead)+'</h3>'+
   boardHtml(oldCol,x.cells)+'</section><section><h3>30 de septiembre · antes de '+
   htmlEscape(cut.turn)+'</h3>'+boardHtml(newCol,x.cells)+'</section></div>'+
   '<p>Ruta ordenada: '+htmlEscape(x.cells.join(' → '))+
   ' · '+htmlEscape(relation)+'.</p></details>';
 }).join('');
 return '<!doctype html><html lang="es"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<title>Hoja marcada 29 → 30 | antes de '+htmlEscape(cut.turn)+'</title>'+
  '<style>body{font:16px system-ui,sans-serif;color:#2d2540;background:#faf9fd;'+
  'padding:16px;max-width:1050px;margin:auto}h1{font-size:23px}p{line-height:1.5}'+
  '.intro{color:#615978}details{border:1px solid #d4cce8;border-radius:9px;'+
  'padding:13px;margin:9px 0;background:#fff}summary{cursor:pointer;font-size:15px}'+
  '.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}'+
  'section{min-width:0}h3{font-size:14px}.board{border-collapse:collapse;width:100%;}'+
  '.board th,.board td{border:1px solid #dbd5e7;text-align:center;padding:8px}'+
  '.board th{font-size:12px;font-weight:500}.board td{font-weight:700;font-size:21px;'+
  'position:relative;min-width:40px}.board td.lit{background:#e5dbff;color:#5021a3}'+
  'sup{font:10px system-ui;position:absolute;top:2px;left:4px}'+
  '@media(max-width:640px){.pair{grid-template-columns:1fr}}'+
  'a{color:#5939a6}</style></head><body>'+
  '<h1>Hojas marcadas: 29 → 30 de septiembre</h1>'+
  '<p class="intro">Antes de '+htmlEscape(cut.turn)+' del 30. Las dos tablas de cada ficha '+
  'corresponden a la MISMA columna y las MISMAS celdas: a la izquierda la coincidencia '+
  'histórica ya marcada; a la derecha, cómo se leen esos dígitos hoy. Los números '+
  'pequeños señalan el orden de lectura del recorrido.</p>'+
  '<p><strong>'+cut.records.length+' recorridos históricos visibles</strong> sobre '+
  cut.columns.length+' columnas disponibles. Todos se muestran, sin priorizar '+
  'ninguno por su cifra ni por los resultados del objetivo.</p>'+
  details+'<p class="intro">No se generaron candidatos, rankings ni nuevos recorridos '+
  'en una hoja vacía. <a href="index.html">Volver al índice</a>.</p></body></html>';
}

async function main(){
 const dates=['2026-09-28',OLD,NOW],data=[];
 for(const date of dates){
  const heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads))
   throw Error('Falta una jornada requerida '+date);
  data.push(heads);
 }
 const original=buildSheet(data[1],data[0]);
 const prior=buildVisualMarkedSheet7D(original,OLD,'Nocturno');
 const full=buildSheet(data[2],data[1]);
 const cuts=TURNOS.map(t=>getCut(prior,full,t));
 for(let i=0;i<TURNOS.length;i++){
  const altered=JSON.parse(JSON.stringify(data[2]));
  for(let k=i;k<TURNOS.length;k++)
   for(const jurisdiction of JURS)altered[TURNOS[k]][jurisdiction]='9999';
  const blind=getCut(prior,buildSheet(altered,data[1]),TURNOS[i]);
  if(JSON.stringify(cuts[i])!==JSON.stringify(blind))
   throw Error('Fuga del sorteo futuro: '+TURNOS[i]);
 }
 fs.mkdirSync(path.resolve(root,out),{recursive:true});
 for(const [i,cut]of cuts.entries()){
  const label=String(i+1)+'-ANTES-'+cut.turn;
  fs.writeFileSync(path.resolve(root,out,label+'.md'),buildMarkdown(prior,cut));
  fs.writeFileSync(path.resolve(root,out,label+'.html'),htmlGallery(prior,cut));
  fs.writeFileSync(path.resolve(root,out,label+'.json'),JSON.stringify(cut,null,2)+'\n');
  console.log('LECTURA_REAL '+cut.turn+' | columnas='+cut.columns.length+
   ' | relecturas='+cut.records.length+
   ' | VT2='+cut.records.filter(x=>x.kind==='vt2').length+
   ' | VT3='+cut.records.filter(x=>x.kind==='vt3').length+
   ' | VT4='+cut.records.filter(x=>x.kind==='vt4').length+
   ' | contactos_ya_comprobados_hoy='+cut.records.filter(x=>x.contactKnown).length);
  for(const kind of ['vt2','vt3','vt4']){
   const example=cut.records.find(x=>x.kind===kind);
   if(example)console.log('TRAZA '+cut.turn+' '+kind+
    ' | cabeza='+example.fullHead+' '+example.turn+
    ' | fuente='+example.sourceId+' | celdas='+key(example.cells)+
    ' | antes='+example.value+' | ahora='+example.readNow+
    ' | contacto_hoy='+example.contactKnown);
  }
 }
 const index=['# Índice — huellas MARCADAS del 29, reinterpretadas antes de cada turno del 30',
  '',
  'Partimos únicamente de las cabezas coincidentes y todos sus recorridos marcados.',
  'Cada documento incluye cada ruta VT2/VT3/VT4 y dos cuadrículas legibles,',
  'sin fórmulas ni rankings. Los resultados del turno objetivo siempre están ocultos.',
  '',...TURNOS.map((t,i)=>'- '+String(i+1)+'-ANTES-'+t+'.html (galería visual), también en .md'),
  '','No se entregan predicciones.',''];
 fs.writeFileSync(path.resolve(root,out,'00-INDICE.md'),index.join('\n'));
 console.log('LECTURA_REAL_COMPLETA: '+cuts.length+' cortes → '+out);
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
