// Modelo Papá: cadena de HOJAS MARCADAS históricas, sin selector ni ranking.
// Replay descriptivo: no es un pronóstico sellado antes del sorteo.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(name){
 const p=path.resolve(root,name.endsWith('.ts')?name:name+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(p,mod);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  x=>x.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(p),x))):require(x),mod,mod.exports);
 return mod.exports;
}
const {TURNOS,JURS}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {buildVisualMarkedSheet7D,renderVisualMarkedSheetHTML7D}=load('src/visualMarkedSheet7d.ts');
const {descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const arg=Object.fromEntries(process.argv.slice(2).filter(s=>s.startsWith('--')&&s.includes('='))
 .map(s=>s.slice(2).split(/=(.*)/s).slice(0,2)));
const from=arg.from||'2026-09-23',to=arg.to||'2026-09-30';
const out=path.resolve(root,arg.out||'out/cadena-visual-septiembre');
const ms=d=>Date.parse(d+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||
 !Number.isFinite(ms(from))||!Number.isFinite(ms(to))||ms(to)<ms(from)||
 ms(to)-ms(from)>13*86400000)throw Error('Fechas: máximo 14 días cronológicos.');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
 .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const signature=t=>t.kind+'|'+t.sourceId+'|'+t.cells.join('>');
function overlap(a,b){
 return a.sourceId===b.sourceId&&a.cells.some(c=>b.cells.includes(c));
}
function readTrace(t,cols){
 const col=cols.find(c=>c.id===t.sourceId);
 if(!col)return null;
 const digits=t.cells.map(p=>{
  const [r,s]=p.split(':').map(Number);
  return col.values[r]?.[s]||'';
 });
 return digits.every(c=>/^\d$/.test(c))?digits.join(''):null;
}
function boardSvg(cols,priorRoutes,knownRoutes){
 const width=150+cols.length*138,height=432;
 const pos=(i,c)=>{const [r,s]=c.split(':').map(Number);return [103+i*138+s*37,102+r*48]};
 const heads=cols.map((col,i)=>'<text x="'+(89+i*138)+'" y="32" font-size="12" font-weight="700">'+
  esc(col.sourceLabel)+'</text>').join('');
 const cells=cols.map((col,i)=>col.values.flatMap((v,r)=>[0,1].map(s=>{
  const [x,y]=pos(i,r+':'+s);return '<rect x="'+(x-17)+'" y="'+(y-18)+
  '" width="34" height="36" rx="4" stroke="#ccc4de" fill="#fff"/>'+
  '<text x="'+x+'" y="'+(y+7)+'" font-size="21" font-weight="600" text-anchor="middle">'+
  esc(/^\d{2}$/.test(v)?v[s]:'—')+'</text>';
 })).join('')).join('');
 const labels=JURS.map((j,r)=>'<text x="3" y="'+(106+r*48)+'" font-size="10">'+esc(j)+'</text>').join('');
 function stroke(t,i,layer){
  const col=cols.findIndex(x=>x.id===t.sourceId);
  if(col<0)throw Error('Fuga de columna no disponible');
  const pts=t.cells.map(c=>pos(col,c));
  const d=pts.map((p,k)=>(k?'L':'M')+p[0]+' '+p[1]).join(' ');
  const caption=(layer==='old'?'Herencia anterior: ':'Marca comprobada hoy: ')+
   t.fullHead+' '+t.kind+' '+(layer==='old'?t.value+'→'+t.readNow:t.value);
  return '<g class="trace '+layer+'" data-key="'+layer+i+'"><title>'+esc(caption)+
   ' | '+esc(t.sourceId)+' '+esc(t.cells.join('→'))+'</title><path d="'+d+
   '" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
   '<circle cx="'+pts[0][0]+'" cy="'+pts[0][1]+'" r="3" fill="currentColor"/></g>';
 }
 return '<svg viewBox="0 0 '+width+' '+height+'" width="'+width+
  '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cuadrícula +11 completa disponible con recorridos físicos">'+
  heads+labels+cells+priorRoutes.map((t,i)=>stroke(t,i,'old')).join('')+
  knownRoutes.map((t,i)=>stroke(t,i,'known')).join('')+'</svg>';
}
function renderCut(cut,prior){
 const hist=prior.date+'-5-Nocturno.html';
 const option=cut.inherited.map((x,i)=>'<option value="old'+i+'">'+esc(
  x.fullHead+' '+x.turn+' '+x.kind.toUpperCase()+' '+x.sourceId+' '+x.cells.join('→')+
  ' ('+x.value+'→'+x.readNow+')')+'</option>').join('');
 const details=cut.inherited.map(x=>'<div class="route"><b>'+esc(x.fullHead)+
  '</b> · '+esc(x.turn)+' · '+x.kind.toUpperCase()+' · '+esc(x.sourceId)+
  ' · '+esc(x.cells.join(' → '))+' · '+esc(x.value)+' → '+esc(x.readNow)+
  (x.exactKnown?' · MISMA RUTA YA MARCADA HOY':x.contactKnown?' · contacto físico':' · sin contacto')+
  '</div>').join('');
 return '<!doctype html><html lang="es"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>Cadena marcada '+esc(cut.previous)+' → '+esc(cut.date)+' ANTES '+esc(cut.target)+'</title>'+
 '<style>body{font:14px system-ui,sans-serif;background:#f8f6fb;color:#302745;margin:0;padding:16px}'+
 'h1{font-size:22px}p{line-height:1.5}.pair{display:grid;grid-template-columns:1fr 1fr;gap:15px}'+
 '.panel{background:white;border:1px solid #dad1e8;border-radius:9px;padding:10px;min-width:0;overflow:auto}'+
 'iframe{border:0;width:100%;height:620px}.panel svg{max-width:none}.trace{pointer-events:none;opacity:.32}'+
 '.trace.old{color:#7040c1;stroke-dasharray:5 3}.trace.known{color:#0d977e;opacity:.78}'+
 '.trace.focus{opacity:1;stroke-width:7}.route{padding:9px;border-bottom:1px solid #ded8e8}'+
 'select{max-width:100%;padding:8px}a{color:#60349f}@media(max-width:1000px){.pair{grid-template-columns:1fr}}</style>'+
 '</head><body><h1>Huella marcada '+esc(cut.previous)+' → '+esc(cut.date)+
 ' · ANTES de '+esc(cut.target)+'</h1>'+
 '<p>Replay retrospectivo con resultado OBJETIVO excluido. La izquierda contiene todos los trazos VT2/VT3/VT4 marcados del día anterior. '+
 'La derecha sólo reinterpreta esas mismas celdas en las columnas disponibles antes del objetivo; en verde se ven las marcas ya confirmadas del día actual.</p>'+
 '<p><b>'+cut.inherited.length+' rutas heredadas legibles</b> · '+cut.columns.length+
 ' columnas disponibles · '+cut.knownToday.length+' rutas ya comprobadas hoy. Ninguna ruta es candidata por sí sola.</p>'+
 '<label>Resaltar ruta heredada en el tablero derecho: <select id="focus"><option value="">Ver todas</option>'+
 option+'</select></label> &nbsp; <label><input type="checkbox" id="known" checked> Mostrar marcas comprobadas hoy</label>'+
 '<div class="pair"><section class="panel"><h2>Hoja MARCADA completa '+esc(prior.date)+'</h2>'+
 '<iframe src="'+hist+'" title="Hoja completa anterior con todas las cabezas"></iframe></section>'+
 '<section class="panel"><h2>Tabla +11 de '+esc(cut.date)+' antes de '+esc(cut.target)+'</h2>'+
 boardSvg(cut.columns,cut.inherited,cut.knownToday)+'</section></div>'+
 '<h2>Todos los recorridos heredados (sin ranking)</h2>'+details+
 '<p><b>Interpretación:</b> una coincidencia física, contacto o repetición no demuestra capacidad predictiva. '+
 'No se asignaron prioridades ni candidaturas. <a href="index.html">Volver al índice</a>.</p>'+
 '<script>(function(){const q=s=>document.querySelector(s);function paint(){const f=q("#focus").value;'+
 'for(const e of document.querySelectorAll(".trace")){const known=e.classList.contains("known");'+
 'e.style.display=known&&!q("#known").checked?"none":"";'+
 'e.classList.toggle("focus",!!f&&e.dataset.key===f);'+
 'if(!known)e.style.opacity=f&&e.dataset.key!==f?".05":"";}}'+
 'q("#focus").addEventListener("change",paint);q("#known").addEventListener("change",paint);paint();})()</script>'+
 '</body></html>';
}
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const raw=[];
 // Abarcar antecedentes suficientes para Nocturna anterior incluso con domingo sin sorteos.
 for(let n=ms(from)-12*86400000;n<=ms(to);n+=86400000){
  const date=new Date(n).toISOString().slice(0,10);
  if(new Date(n).getUTCDay()===0)continue;
  const heads=await descargarCabezas(date,true);
  if(hasDrawResults(heads)&&hasNocturnoBase(heads))raw.push({date,heads});
 }
 const days=[];
 for(let i=1;i<raw.length;i++){
  const day=raw[i];if(day.date<from||day.date>to)continue;
  const prev=raw[i-1],full=buildSheet(day.heads,prev.heads);
  const views=[];
  for(let k=0;k<TURNOS.length;k++){
   const turn=TURNOS[k],view=buildVisualMarkedSheet7D(full,day.date,turn);
   const fn=day.date+'-'+(k+1)+'-'+turn;
   fs.writeFileSync(path.join(out,fn+'.html'),renderVisualMarkedSheetHTML7D(view));
   fs.writeFileSync(path.join(out,fn+'.json'),JSON.stringify(view,null,2));
   views.push({turn,heads:view.totals.heads,routes:view.totals.strokes,
    vt2:view.totals.vt2,vt3:view.totals.vt3,vt4:view.totals.vt4});
  }
  days.push({date:day.date,base:prev.date,heads:day.heads,full,
   marked:buildVisualMarkedSheet7D(full,day.date,'Nocturno'),views});
  console.log('HOJA '+day.date+' | base='+prev.date+' | cabezas_marcadas='+
   views[4].heads+' | VT2='+views[4].vt2+' VT3='+views[4].vt3+' VT4='+views[4].vt4);
 }
 if(days.length<3)throw Error('Faltan al menos tres jornadas reales completas.');
 const all=[],links=[],summary=[
 '# Cadena ocular de hojas marcadas · '+from+' a '+to,'',
 '**Reconstrucción retrospectiva; NO predicción prospectiva.**',
 'Todas las rutas VT2/VT3/VT4 marcadas de la hoja anterior se vuelven a leer',
 'sobre las mismas celdas físicas de la tabla siguiente, antes de cada turno.',
 'Los resultados objetivo/futuros se excluyen de cada corte. Cada ruta queda dentro de su columna.','',
 '| Jornada anterior → actual | Corte previo a | Huellas heredadas legibles | VT2 | VT3 | VT4 | Tocan marcas conocidas hoy | Misma huella ya marcada hoy |',
 '|---|---|---:|---:|---:|---:|---:|---:|'
 ];
 for(let i=1;i<days.length;i++){
  const old=days[i-1],today=days[i];
  for(let k=0;k<TURNOS.length;k++){
   const target=TURNOS[k],cols=today.full.columns.slice(0,k+1);
   const known=k===0?[]:buildVisualMarkedSheet7D(today.full,today.date,TURNOS[k-1]).strokes;
   const inherited=old.marked.strokes.filter(t=>cols.some(c=>c.id===t.sourceId))
     .map(t=>({...t,readNow:readTrace(t,cols)})).filter(t=>t.readNow!==null)
     .map(t=>({...t,exactKnown:known.some(v=>signature(v)===signature(t)),
      contactKnown:known.some(v=>overlap(t,v))}));
   // Prueba causal: censurar cabeza del objetivo y todas las posteriores
   // no altera la tabla anterior al sorteo ni sus relecturas.
   const censored=JSON.parse(JSON.stringify(today.heads));
   for(const late of TURNOS.slice(k))for(const j of JURS)censored[late][j]='----';
   const blind=buildSheet(censored,old.heads);
   assert.deepEqual(blind.columns.slice(0,k+1),cols,'Fuga de columna futura');
   assert.deepEqual(inherited.map(t=>t.readNow),
    inherited.map(t=>readTrace(t,blind.columns.slice(0,k+1))),
    'El resultado objetivo alteró la lectura previa');
   const cut={previous:old.date,date:today.date,target,columns:cols,
    inherited,knownToday:known,provenance:'REPLAY_RETROSPECTIVO_CABEZA_OBJETIVO_EXCLUIDA'};
   const fn=old.date+'-a-'+today.date+'-ANTES-'+target;
   fs.writeFileSync(path.join(out,fn+'.json'),JSON.stringify(cut,null,2));
   fs.writeFileSync(path.join(out,fn+'.html'),renderCut(cut,old));
   const count=kind=>inherited.filter(t=>t.kind===kind).length;
   const contacts=inherited.filter(t=>t.contactKnown).length;
   const exact=inherited.filter(t=>t.exactKnown).length;
   summary.push('| '+old.date+' → '+today.date+' | '+target+' | '+inherited.length+
    ' | '+count('vt2')+' | '+count('vt3')+' | '+count('vt4')+
    ' | '+contacts+' | '+exact+' |');
   all.push(cut);
   links.push({previous:old.date,date:today.date,target,file:fn+'.html',count:inherited.length});
   console.log('CADENA '+old.date+' -> '+today.date+' ANTES '+target+
    ' | rutas='+inherited.length+' | contacto='+contacts+' | huella_ya_marcada='+exact+
    ' | VT2='+count('vt2')+' VT3='+count('vt3')+' VT4='+count('vt4'));
   for(const t of inherited.filter(t=>t.exactKnown).slice(0,2))
    console.log('HUELLA_REAPARECIDA '+old.date+' -> '+today.date+' ANTES '+target+
    ' | '+t.fullHead+' '+t.kind+' '+t.sourceId+' '+t.cells.join('>')+
    ' | '+t.value+' -> '+t.readNow);
  }
 }
 summary.push('','**Interpretación correcta:** contacto y misma huella ya ganadora son',
 'propiedades retrospectivas de los recorridos, no prioridades ni pronósticos.',
 'Los conteos aumentan con las columnas y las marcas acumuladas; no se tratan',
 'rutas de una misma cabeza como confirmaciones independientes.','',
 'Cada archivo ANTES separa las marcas conocidas hasta el turno previo; no incluye',
 'la cabeza del turno objetivo. Abstenerse continúa siendo una posibilidad válida.','');
 fs.writeFileSync(path.join(out,'ESTUDIO_DESCRIPTIVO.md'),summary.join('\n'));
 fs.writeFileSync(path.join(out,'CADENA_CORTES_CAUSALES.json'),JSON.stringify(all,null,2));
 const group=days.map(d=>'<section><h2>'+d.date+' · base '+d.base+'</h2>'+
 d.views.map((v,k)=>'<a href="'+d.date+'-'+(k+1)+'-'+v.turn+'.html">'+
  'Hoja DESPUÉS de '+v.turn+' · '+v.heads+' cabezas completas · '+v.routes+' trazos</a>').join('')+
 '</section>').join('');
 const comparisons=links.reduce((acc,l)=>{
  const id=l.previous+' → '+l.date;
  (acc[id]??=[]).push(l);return acc;
 },{});
 const pairs=Object.entries(comparisons).map(([pair,stages])=>
  '<section><h2>'+pair+'</h2>'+stages.map(s=>
   '<a href="'+s.file+'">ANTES de '+s.target+' · '+s.count+' rutas heredadas</a>').join('')+
  '</section>').join('');
 const page='<!doctype html><html lang="es"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Modelo Papá · cadena visual histórica</title>'+
 '<style>body{font:15px system-ui,sans-serif;max-width:1100px;margin:auto;padding:22px;'+
 'background:#f8f6fc;color:#302745}a{display:inline-block;background:white;padding:9px;'+
 'border:1px solid #d8cfe8;border-radius:7px;margin:4px;color:#59389a}section{border-top:1px solid #ddd;padding:10px}</style>'+
 '</head><body><h1>Cadena visual de hojas marcadas: '+from+' → '+to+'</h1>'+
 '<p>Primero observá las hojas ya marcadas con TODOS los recorridos VT2, VT3 y VT4. '+
 'Después compará las huellas físicas entre fechas, sin ver el resultado del turno objetivo. '+
 'Es un replay retrospectivo, no predicción prospectiva ni ranking.</p>'+
 '<h2>Hojas históricas completas</h2>'+group+'<h2>Comparaciones con censura del objetivo</h2>'+
 pairs+'<p>Ver también ESTUDIO_DESCRIPTIVO.md y CADENA_CORTES_CAUSALES.json.</p></body></html>';
 fs.writeFileSync(path.join(out,'index.html'),page);
 console.log('FIN CADENA: '+days.length+' hojas completas; '+all.length+
  ' cortes cronológicos; HTML + JSON y estudio descriptivo en '+out);
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
