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
  '',...TURNOS.map((t,i)=>'- '+String(i+1)+'-ANTES-'+t+'.md'),
  '','No se entregan predicciones.',''];
 fs.writeFileSync(path.resolve(root,out,'00-INDICE.md'),index.join('\n'));
 console.log('LECTURA_REAL_COMPLETA: '+cuts.length+' cortes → '+out);
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
