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


// Panel de observación del tablero COMPLETO: marca primero, lectura después.
// Izquierda: todas las marcas retrospectivas del 29 (37 trazos).
// Derecha: sólo sus rutas posibles dentro de la tabla +11 ANTES de Primera,
// más las marcas de Previa del 30 que YA se conocen en ese momento.
// No se carga ni dibuja ninguna cabeza del sorteo Primera del 30.
function renderWholeBoardBeforeFirst(old,cut){
 if(cut.turn!=='Primera'||cut.columns.length!==2)
  throw Error('El panel ciego sólo corresponde a antes de Primera');
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 const cx=(col,c)=>{const [r,side]=c.split(':').map(Number);
  if(!Number.isInteger(r)||r<0||r>5||side!==0&&side!==1)throw Error('Fuera de hoja');
  return [100+col*122+side*37,105+r*47];
 };
 const svg=(cols,traces,name)=>{
  const w=145+cols.length*122,h=435;
  const labels=cols.map((col,i)=>'<text x="'+(87+i*122)+
   '" y="34" font-size="13" font-weight="650">'+esc(col.label||col.id)+'</text>').join('');
  const rows=cols.map((col,i)=>col.values.flatMap((row,r)=>[0,1].map(side=>{
   const [x,y]=cx(i,r+':'+side),char=/^\d{2}$/.test(row)?row[side]:'—';
   return '<rect x="'+(x-17)+'" y="'+(y-19)+'" width="34" height="38" rx="5" fill="#fff" stroke="#d9d2e7"/>'+
    '<text x="'+x+'" y="'+(y+7)+'" class="digit" text-anchor="middle">'+esc(char)+'</text>';
  })).join('')).join('');
  const headers=JURS.map((j,r)=>'<text x="2" y="'+(109+r*47)+'" font-size="10">'+esc(j)+'</text>').join('');
  const lines=traces.map((tr,i)=>{
   const column=cols.findIndex(c=>c.id===tr.sourceId);
   if(column<0)throw Error('Recorrido fuera de columnas visibles');
   const points=tr.cells.map(cell=>cx(column,cell));
   const path=points.map((p,n)=>(n?'L':'M')+p[0]+' '+p[1]).join(' ');
   const id=esc(tr.reviewId||''),kind=esc(tr.kind);
   const css=tr.layer==='today'?'today':'inherit';
   const desc=tr.layer==='today'?
    ('Ya comprobada Previa 30: cabeza '+tr.fullHead+' '+tr.kind+' '+tr.value):
    ('Marcada 29: '+tr.fullHead+' '+tr.kind+' '+tr.value+(tr.readNow?' → lee '+tr.readNow:''));
   return '<g class="trace '+css+'" data-kind="'+kind+'" data-id="'+id+'">'+
    '<title>'+esc(desc)+' · '+esc(tr.sourceId)+' '+esc(tr.cells.join('→'))+'</title>'+
    '<path d="'+path+'" stroke="currentColor" stroke-width="4" fill="none" '+
     'stroke-linecap="round" stroke-linejoin="round"'+
     (css==='inherit'?' stroke-dasharray="4 4"':'')+'/></g>';
  }).join('');
  return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+
   '" role="img" aria-label="'+esc(name)+'" xmlns="http://www.w3.org/2000/svg">'+
    labels+headers+rows+lines+'</svg>';
 };
 const older=old.strokes.map((x,i)=>({...x,layer:'old',reviewId:'p'+i}));
 const current=cut.records.map((x,i)=>({...x,layer:'inherit',reviewId:'r'+i}));
 const today=cut.knownToday.map((x,i)=>({...x,layer:'today',reviewId:'t'+i}));
 const options=cut.records.map((x,i)=>'<option value="r'+i+'">'+
  esc('Ruta '+(i+1)+' · '+x.fullHead+' ('+x.turn+') · '+x.kind.toUpperCase()+
   ' · '+x.sourceId+' · '+x.cells.join('→'))+'</option>').join('');
 const cards=cut.records.map((x,i)=>'<div class="route" data-route="r'+i+'">'+
  '<label><input class="observe" type="checkbox" value="r'+i+'"/> '+
  esc('Cabeza '+x.fullHead+' · '+x.turn+' 29 · '+x.kind.toUpperCase()+
   ' · '+x.sourceId+' '+x.cells.join('→'))+'</label>'+
  '<span class="muted">Marcó '+esc(x.value)+' / ahora se lee '+esc(x.readNow)+
   (x.contactKnown?' · contacto con marcas conocidas de Previa 30':' · sin contacto con Previa 30')+
   '</span></div>').join('');
 const total=cut.records.length;
 return '<!doctype html><html lang="es"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<title>Examen visual completo · ANTES de Primera 30/09</title>'+
  '<style>body{font:15px system-ui,sans-serif;background:#f9f7fc;color:#29243b;padding:20px;margin:auto;max-width:1450px}'+
   'h1{font-size:25px}p{line-height:1.5}.muted{color:#6c617e;font-size:12px;display:block}'+
   '.panels{display:grid;grid-template-columns:1.3fr 1fr;gap:12px}.panel{border:1px solid #d6cee2;'+
   'border-radius:9px;background:white;padding:12px;overflow:auto}svg{display:block;margin:auto}.digit{font:600 23px system-ui;fill:#251c38}'+
   '.trace{opacity:.15;pointer-events:none}.trace.old,.trace.inherit{color:#7041be}'+
   '.trace.today{color:#129083}.trace.focus{opacity:.98;stroke-width:5}'+
   '.trace.today.showToday{opacity:.85}h2{font-size:18px}label{cursor:pointer}'+
   '.controls{background:#fff;padding:12px;border-radius:9px;border:1px solid #d6cee2;margin:13px 0}'+
   '.route{border-bottom:1px solid #e6e0ef;padding:9px}.route.observed{background:#eae2ff}'+
   'textarea{width:100%;box-sizing:border-box;min-height:90px;font:14px system-ui;padding:12px}'+
   'button{padding:10px;border:1px solid #bdb1d8;border-radius:7px;background:#fff;cursor:pointer}'+
   'select{padding:8px;width:100%;max-width:720px}'+
   '@media(max-width:900px){.panels{grid-template-columns:1fr}}</style></head><body>'+
  '<h1>Examen ocular — hojas marcadas del 29 → tabla +11 del 30</h1>'+
  '<p><strong>Momento congelado: antes de Primera, 30/09/2026.</strong> '+
   'En el panel izquierdo están TODAS las marcas VT2, VT3 y VT4 que surgieron tras los sorteos del 29. '+
   'En el derecho, sólo las '+total+' huellas heredadas físicamente legibles en las dos columnas que ya existían antes de Primera. '+
   'Las cifras de las cabezas del sorteo objetivo NO se incluyen en este archivo.</p>'+
  '<div class="controls"><label><input type="checkbox" id="prev" checked/> Dibujar marcas del 29</label> &nbsp;'+
   '<label><input type="checkbox" id="inherit" checked/> Dibujar huellas heredadas del 29 en el 30</label> &nbsp;'+
   '<label><input type="checkbox" id="today"/> Agregar marcas de Previa ya comprobadas el 30</label>'+
   '<p><label>Resaltar una ruta concreta sin elegir un número:<select id="focus">'+
    '<option value="">Todas las rutas</option>'+options+'</select></label></p>'+
   '<label><input type="checkbox" id="vt2" checked/> VT2</label> &nbsp;'+
   '<label><input type="checkbox" id="vt3" checked/> VT3</label> &nbsp;'+
   '<label><input type="checkbox" id="vt4" checked/> VT4</label></div>'+
  '<div class="panels"><section class="panel"><h2>29/09, después de Nocturna · '+old.strokes.length+' marcas</h2>'+
   svg(old.columns,older,'Hoja completa del 29, marcas de cabezas ya sorteadas')+
   '</section><section class="panel"><h2>30/09, antes de Primera · 2 columnas</h2>'+
   svg(cut.columns,[...current,...today],'Huellas heredadas y marcas ya comprobadas de Previa 30')+
   '</section></div>'+
  '<h2>Recorridos del 29 legibles antes de Primera del 30</h2>'+
   '<p class="muted">Todos los recorridos, sin ordenar por aciertos ni asignarles puntos. '+
    'Elegir una ruta sólo sirve para estudiar su trazo.</p>'+cards+
  '<h2>Registrar una lectura visual (ensayo retrospectivo)</h2>'+
   '<p>Podés señalar hasta tres trazos para estudiar, o ninguno. '+
   'La elección y la explicación deben hacerse sin abrir el resultado real de Primera. '+
   'Esto es un REPLAY histórico, no una predicción prospectiva auténtica.</p>'+
   '<p><label>¿Qué movimiento, contacto o continuidad observaste?</label></p>'+
   '<textarea id="note" placeholder="Describí el dibujo y por qué una ruta llama la atención frente a las demás. Si no hay distinción, indicá observar/no jugar."></textarea>'+
   '<p><button type="button" id="save">Guardar lectura en un archivo JSON</button> '+
   '<span id="status" role="status"></span></p>'+
   '<p><strong>Resultados del turno objetivo:</strong> no están en este documento. '+
    'Abrirlos sólo después de guardar el registro y contrastarlos por separado.</p>'+
  '<script>(function(){const q=s=>document.querySelector(s),trace=[...document.querySelectorAll(".trace")],'+
   'pick=[...document.querySelectorAll(".observe")];'+
   'function show(){const kind=new Set(["vt2","vt3","vt4"].filter(k=>q("#"+k).checked));'+
    'for(const t of trace){const isToday=t.classList.contains("today");'+
     'const visible=(isToday?q("#today").checked:t.classList.contains("old")?q("#prev").checked:q("#inherit").checked)&&'+
      'kind.has(t.dataset.kind);t.style.display=visible?"":"none";'+
      'const on=t.dataset.id===q("#focus").value;'+
      't.classList.toggle("focus",!!q("#focus").value&&on);'+
      't.classList.toggle("showToday",isToday&&q("#today").checked)}'+
    '}document.querySelectorAll(".controls input,.controls select").forEach(e=>e.addEventListener("change",show));'+
    'pick.forEach(x=>x.addEventListener("change",()=>{'+
     'const chosen=pick.filter(z=>z.checked);if(chosen.length>3){x.checked=false;'+
      'q("#status").textContent="Se pueden registrar hasta tres trazos, o ninguno.";}'+
     'x.closest(".route").classList.toggle("observed",x.checked)}));'+
    'q("#save").addEventListener("click",()=>{'+
     'const chosen=pick.filter(x=>x.checked).map(x=>Number(x.value.slice(1)));'+
     'const data='+JSON.stringify(cut.records.map((x,i)=>({
       id:'r'+i,head:x.fullHead,turn:x.turn,kind:x.kind,sourceId:x.sourceId,
       cells:x.cells,priorValue:x.value,currentReading:x.readNow
     })))+';'+
     'const record={kind:"OBSERVACION_RETROSPECTIVA_NO_PROSPECTIVA",date:"2026-09-30",'+
      'target:"Primera",historicalMarkedDay:"2026-09-29",recordedAt:new Date().toISOString(),'+
      'routeIds:chosen.map(i=>"r"+i),routes:chosen.map(i=>data[i]),notes:q("#note").value,'+
      'abstain:chosen.length===0};const a=document.createElement("a");'+
     'const blob=new Blob([JSON.stringify(record,null,2)],{type:"application/json"});'+
     'const url=URL.createObjectURL(blob);a.href=url;a.download="lectura_visual_antes_primera_30-09.json";'+
     'a.click();URL.revokeObjectURL(url);q("#status").textContent="Archivo de lectura generado."});show()})()</script>'+
  '<p><a href="00-INDICE.md">Volver al índice</a></p></body></html>';
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
 fs.writeFileSync(path.resolve(root,out,'2-ANTES-Primera-TABLERO-COMPLETO.html'),
  renderWholeBoardBeforeFirst(prior,cuts[1]));
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
  const contacts=[];
  for(const older of cut.records)for(const newer of cut.knownToday){
   if(!closeTouch(older,newer))continue;
   const shared=older.cells.filter(p=>newer.cells.includes(p));
   contacts.push({older,newer,shared});
  }
  console.log('CONTACTOS '+cut.turn+' | relaciones_directas='+contacts.length+
   ' | mismas_rutas='+contacts.filter(x=>key(x.older.cells)===key(x.newer.cells)).length);
  for(const x of contacts.slice(0,2))
   console.log('CONTACTO_VISIBLE ANTES '+cut.turn+
    ' | 29 cabeza='+x.older.fullHead+' '+x.older.kind+
    ' '+x.older.sourceId+'['+key(x.older.cells)+']'+
    ' | 30 cabeza_ya_cerrada='+x.newer.fullHead+' '+x.newer.kind+
    ' '+x.newer.sourceId+'['+key(x.newer.cells)+']'+
    ' | mismas_celdas='+x.shared.join(','));
  if(cut.turn==='Primera'){
   for(const [i,trace] of cut.records.entries())
    console.log('LECTURA_COMPLETA_ANTES_PRIMERA '+String(i+1).padStart(2,'0')+
     ' | cabeza='+trace.fullHead+' '+trace.turn+
     ' | '+trace.kind+' | origen='+trace.sourceId+
     ' | ruta='+trace.cells.join('>')+' | marcada='+trace.value+
     ' | relectura='+trace.readNow+' | contacto_previa='+trace.contactKnown+
     ' | misma_ruta_previa='+trace.exactKnown);
  }
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
  '','2-ANTES-Primera-TABLERO-COMPLETO.html: doble tablero con todas las marcas y registro de interpretación',
  '','No se entregan predicciones.',''];
 fs.writeFileSync(path.resolve(root,out,'00-INDICE.md'),index.join('\n'));
 console.log('LECTURA_REAL_COMPLETA: '+cuts.length+' cortes → '+out);
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
