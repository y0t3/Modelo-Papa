'use strict';
// Informe POST de foto PRE inmutable; cero pronósticos elegidos.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm');
const assert=require('node:assert/strict'),root=path.resolve(__dirname,'..');
const params=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('=')).map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const DATE='2026-10-10',RUN='38057490657';
const SHA='99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9';
const J=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const T=['Previa','Primera','Matutino','Vespertino','Nocturno'],K=['vt2','vt3','vt4'];
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const rev=a=>[...a].reverse(),uniq=a=>[...new Set(a)],coordinates=x=>x.split(':').map(Number);
const shape=x=>x.kind+'|'+x.sourceId+'|'+[x.cells.join('>'),rev(x.cells).join('>')].sort()[0];
function read(cells,col){return cells.map(x=>{const [r,c]=coordinates(x);return col.values[r]?.[c]||''}).join('')}
function validateTrace(t,col){
 assert(K.includes(t.kind));assert(['prevNocturno','Previa'].includes(t.sourceId));
 assert.equal(t.sourceId,col.id);assert.equal(t.cells.length,Number(t.kind.slice(2)));
 assert.equal(uniq(t.cells).length,t.cells.length);
 for(let i=0;i<t.cells.length;i++){
  const [r,c]=coordinates(t.cells[i]);assert(Number.isInteger(r)&&r>=0&&r<6&&(c===0||c===1));
  if(i){const [pr,pc]=coordinates(t.cells[i-1]);assert.equal(Math.max(Math.abs(r-pr),Math.abs(c-pc)),1);}
 }
 assert.equal(read(t.cells,col),t.todayReading===undefined?t.value:t.todayReading);
 assert(/^\d{4}$/.test(t.fullHead)&&t.fullHead.endsWith(t.value));
}
function seal(cut,m){
 assert.equal(m.actionRunId,RUN);assert.equal(m.cutSha256,SHA);
 assert.equal(sha(cut),SHA);assert.equal(m.protocol,'CAPTURA_PROSPECTIVA_SIN_DECISION_V1');
 assert(Date.parse(m.capturedAtUtc)<Date.parse('2026-10-10T11:45:00-03:00'));
 assert.equal(m.humanSelections,0);assert.equal(m.forecastMade,false);
 assert.equal(m.targetHeadCountInSnapshot,0);assert.equal(m.postTargetHeadCountInSnapshot,0);
 assert.equal(cut.date,DATE);assert.equal(cut.target,'Primera');
 assert.equal(cut.priorDate,'2026-10-09');assert.equal(cut.d7Date,'2026-10-03');
 assert.equal(cut.mode,'ANTES_DEL_SORTEO_OBJETIVO');
 assert.deepEqual(cut.columns.map(c=>c.id),['prevNocturno','Previa']);
 assert.equal(cut.knownToday.length,3);
 assert(cut.knownToday.every(x=>x.turn==='Previa'));
 assert.equal(cut.inherited.length,25);assert.equal(cut.d7Inherited.length,29);
 for(const tr of [...cut.inherited,...cut.d7Inherited,...cut.knownToday]){
  const col=cut.columns.find(c=>c.id===tr.sourceId);assert(col);
  validateTrace(tr,col);
 }
}
function merge(cut){
 const result=new Map();
 for(const [origin,list] of [['D-1',cut.inherited],['D-7',cut.d7Inherited]]){
  for(const t of list){
   const id=shape(t);
   if(!result.has(id)){
    const cells=[t.cells,rev(t.cells)].sort((a,b)=>a.join('>').localeCompare(b.join('>')))[0];
    const forward=read(cells,cut.columns.find(c=>c.id===t.sourceId)),backward=rev(forward.split('')).join('');
    result.set(id,{id,kind:t.kind,sourceId:t.sourceId,cells,
     readings:uniq([forward,backward]),origins:[],priorHeads:[]});
   }
   const r=result.get(id);
   if(!r.origins.includes(origin))r.origins.push(origin);
   const head={origin,turn:t.turn,jurisdiction:t.jurisdiction,fullHead:t.fullHead,
    oldSuffix:t.value,readingOnNewBoard:t.todayReading,oldCells:t.cells};
   if(!r.priorHeads.some(x=>JSON.stringify(x)===JSON.stringify(head)))r.priorHeads.push(head);
  }
 }
 return [...result.values()].sort((a,b)=>a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id));
}
function compare(rows,heads){
 const found=heads.filter(h=>/^\d{4}$/.test(h.head)),complete=found.length===6;
 return rows.map(r=>{
  const n=Number(r.kind.slice(2));
  const matches=found.filter(h=>r.readings.includes(h.head.slice(-n))).map(h=>{
   const suffix=h.head.slice(-n);
   return {jurisdiction:h.jurisdiction,fullHead:h.head,suffix,
    previouslyMarkedOrientation:r.priorHeads.some(p=>p.readingOnNewBoard===suffix)};
  });
  return {...r,matches,status:matches.length?'COINCIDE':complete?'NO_COINCIDE':'INDETERMINADO'};
 });
}
function allShapes(col){
 const valid=[];
 for(let r=0;r<6;r++)for(let c=0;c<2;c++)if(/^\d{2}$/.test(col.values[r]))valid.push(r+':'+c);
 const found=new Map();
 function walk(cells){
  if(cells.length>=2){
   const kind='vt'+cells.length,id=shape({kind,sourceId:col.id,cells});
   if(!found.has(id)){
    const canonical=[cells,rev(cells)].sort((a,b)=>a.join('>').localeCompare(b.join('>')))[0];
    const forward=read(canonical,col),backward=rev(forward.split('')).join('');
    found.set(id,{id,kind,sourceId:col.id,cells:canonical,
     readings:uniq([forward,backward]),origins:[],priorHeads:[]});
   }
  }
  if(cells.length===4)return;
  for(const next of valid){
   if(cells.includes(next))continue;
   const [pr,pc]=coordinates(cells[cells.length-1]),[nr,nc]=coordinates(next);
   if(Math.max(Math.abs(pr-nr),Math.abs(pc-nc))!==1)continue;
   walk([...cells,next]);
  }
 }
 for(const start of valid)walk([start]);
 return [...found.values()];
}
function count(rows){
 const by={};
 for(const k of K){
  const r=rows.filter(x=>x.kind===k);
  by[k]={total:r.length,yes:r.filter(x=>x.status==='COINCIDE').length,
   no:r.filter(x=>x.status==='NO_COINCIDE').length,
   unknown:r.filter(x=>x.status==='INDETERMINADO').length};
 }
 return by;
}
function xml(s){return String(s).replace(/[&<>"']/g,a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]))}

function diagram(cut,rows,heads,confirmed){
 const width=370,pos=(i,p)=>{const [r,c]=coordinates(p);return [95+i*133+c*35,88+r*44];};
 const arr=['<svg viewBox="0 0 '+width+' 397" role="img" aria-label="Dos columnas +11 antes de Primera" xmlns="http://www.w3.org/2000/svg">'];
 for(const [i,col] of cut.columns.entries()){
  arr.push('<rect x="'+(75+i*133)+'" y="35" width="104" height="314" rx="9" stroke="#d5c9e4" fill="#faf8fd"/>');
  arr.push('<text x="'+(80+i*133)+'" y="24" font-size="12" font-weight="700">'+xml(col.id)+'</text>');
  for(let r=0;r<6;r++)for(let c=0;c<2;c++){
   const [x,y]=pos(i,r+':'+c);
   arr.push('<rect x="'+(x-14)+'" y="'+(y-17)+'" width="28" height="34" fill="white" stroke="#e2d8e9" rx="4"/>');
  }
 }
 for(let r=0;r<6;r++)arr.push('<text x="0" y="'+(92+r*44)+'" font-size="10">'+xml(J[r])+'</text>');
 for(const t of rows){
  const i=cut.columns.findIndex(c=>c.id===t.sourceId);
  const str=t.cells.map((p,k)=>{const [x,y]=pos(i,p);return(k?'L':'M')+x+' '+y}).join(' ');
  const color=t.kind==='vt2'?'#d85d8a':t.kind==='vt3'?'#169c9b':'#c48b27';
  const old=t.priorHeads.map(h=>h.turn+'|'+h.jurisdiction+'|'+h.fullHead).join(';');
  const current=t.matches.map(h=>h.jurisdiction+'|'+h.fullHead).join(';');
  arr.push('<path class="old-route" data-old="'+xml(old)+'" data-new="'+xml(current)+
   '" data-origin="'+t.origins.join(',')+'" data-match="'+(t.matches.length?'yes':'no')+
   '" d="'+str+'" fill="none" stroke="'+color+'" stroke-width="3" opacity=".35" stroke-linejoin="round" stroke-linecap="round"><title>'+
   xml(t.kind.toUpperCase()+' '+t.readings.join('/')+' '+t.origins.join('+')+' → '+t.matches.map(x=>x.fullHead).join(','))+'</title></path>');
 }
 // Newly confirmed Primera paths: drawn only after receipt of real outcomes; include even non-inherited.
 for(const t of confirmed){
  const i=cut.columns.findIndex(c=>c.id===t.sourceId);if(i<0)continue;
  const str=t.cells.map((p,k)=>{const [x,y]=pos(i,p);return(k?'L':'M')+x+' '+y}).join(' ');
  arr.push('<path class="confirmed-route" data-new="'+xml(t.jurisdiction+'|'+t.fullHead)+
   '" d="'+str+'" stroke="#10916c" stroke-width="3.5" opacity=".38" fill="none" stroke-linecap="round" stroke-linejoin="round"><title>'+
   xml('PRIMERA confirmado '+t.fullHead+' '+t.kind+' '+t.value+' '+t.sourceId)+'</title></path>');
 }
 for(const [i,col] of cut.columns.entries())for(let r=0;r<6;r++)for(let c=0;c<2;c++){
  const [x,y]=pos(i,r+':'+c);
  arr.push('<text x="'+x+'" y="'+(y+6)+'" text-anchor="middle" font-weight="800" font-size="19" fill="#292139">'+
   xml(/^\d{2}$/.test(col.values[r])?col.values[r][c]:'—')+'</text>');
 }
 return arr.join('')+'</svg>';
}
function html(cut,rows,heads,confirmed){
 const pos=rows.filter(r=>r.matches.length),neg=rows.filter(r=>!r.matches.length);
 const s=count(rows);
 const old=uniq(rows.flatMap(r=>r.priorHeads.map(h=>h.turn+'|'+h.jurisdiction+'|'+h.fullHead))).sort();
 const headButtons=heads.map(h=>'<button type="button" class="pick" data-type="new" data-id="'+xml(h.jurisdiction+'|'+h.head)+'" '+
  (!/^\d{4}$/.test(h.head)?'disabled':'')+'>'+xml(h.head+' · '+h.jurisdiction)+'</button>').join('');
 const oldButtons=old.map(k=>'<button type="button" class="pick" data-type="old" data-id="'+xml(k)+'">'+xml(k.replaceAll('|',' · '))+'</button>').join('');
 const li=items=>items.map(t=>'<li><b>'+t.kind.toUpperCase()+' '+xml(t.readings.join('/'))+'</b> · '+xml(t.sourceId)+
  ' · '+xml(t.origins.join('+'))+' · '+xml(t.cells.join('→'))+(t.matches.length?' → '+xml(t.matches.map(h=>h.jurisdiction+' '+h.fullHead).join(' / ')):'')+'</li>').join('');
 return '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<title>Modelo Papá · cotejo real Primera</title><style>body{font:15px system-ui,Arial;background:#f8f6fc;color:#30243d;margin:0;padding:14px}main{max-width:1100px;margin:auto}.card{background:white;padding:14px;border:1px solid #d7cce5;border-radius:12px;margin:10px 0}button{border:1px solid #c6b7d8;background:white;color:#563775;padding:7px;border-radius:7px;margin:3px;cursor:pointer}button.active{background:#e9d8f8}button:disabled{opacity:.35}svg{width:100%;max-width:550px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.old-route,.confirmed-route{pointer-events:none}.highlight{opacity:1!important;stroke-width:6!important;filter:drop-shadow(0 0 2px white)}.dim{opacity:.1!important}details{margin:12px 0}summary{cursor:pointer;font-weight:700}li{padding:3px}@media(max-width:850px){.grid{grid-template-columns:1fr}}</style><main>'+
  '<h1>Primera 10/10 · hoja real antes y después</h1>'+
  '<p>La hoja quedó sellada a las <b>10:53:58 ART</b>, SIN cabeza de Primera. Se cotejaron todas las figuras de ayer y D−7 luego del sorteo. No hubo una elección humana antes.</p>'+
  '<div class="card"><h2>Cabezas de Primera</h2><div>'+headButtons+'</div><p>Tocá una para remarcar TODOS los caminos confirmados, incluidos los que no estaban entre las huellas heredadas.</p></div>'+
  '<div class="grid"><div class="card"><h2>Tablero +11 de dos fuentes</h2>'+diagram(cut,rows,heads,confirmed)+
  '<p>Rosa: VT2; turquesa: VT3; ocre: VT4. Verde: marcas del objetivo confirmadas POST, no elegidas antes.</p></div>'+
  '<div class="card"><h2>Cabezas anteriores</h2><button id="reset">Ver todas las marcas</button>'+oldButtons+
  '<h3>Balance</h3>'+K.map(k=>'<p>'+k.toUpperCase()+': '+s[k].total+' dibujos, '+s[k].yes+' compatibles, '+s[k].no+' no coinciden, '+s[k].unknown+' indeterminados</p>').join('')+
  '<details open><summary>Figuras heredadas compatibles ('+pos.length+')</summary><ol>'+li(pos)+'</ol></details>'+
  '<details><summary>Alternativas no compatibles o pendientes ('+neg.length+')</summary><ol>'+li(neg)+'</ol></details></div></div>'+
  '<p><b>Advertencia:</b> una coincidencia posterior en cualquier lectura disponible no es un pronóstico acertado. Una figura y su inversión son un único dibujo físico.</p>'+
  '<script>const paths=[...document.querySelectorAll(".old-route,.confirmed-route")];const bs=[...document.querySelectorAll(".pick")];'+
  'function f(type,key,b){for(const p of paths){let chosen=type==="old"?p.classList.contains("old-route")&&p.dataset.old.split(";").includes(key):'+
  'type==="new"&&p.dataset.new.split(";").includes(key);'+
  'p.classList.toggle("highlight",chosen);p.classList.toggle("dim",!!type&&!chosen);}'+
  'for(const x of bs)x.classList.toggle("active",x===b);}for(const b of bs)b.onclick=()=>f(b.dataset.type,b.dataset.id,b);'+
  'document.getElementById("reset").onclick=()=>f(null,null,null);</script></main>';
}
function tests(){
 const col={id:'prevNocturno',values:['12','34','56','78','90','12']};
 const a={kind:'vt3',sourceId:col.id,cells:['0:0','1:0','2:1'],todayReading:'136',
  fullHead:'2125',value:'125',turn:'Previa',jurisdiction:'Ciudad'};
 const b={...a,cells:rev(a.cells),todayReading:'631',fullHead:'9521',value:'521'};
 validateTrace(a,col);validateTrace(b,col);
 const cut={columns:[col],inherited:[a,b],d7Inherited:[a]};
 const arr=merge(cut);assert.equal(arr.length,1);
 assert.equal(arr[0].readings.length,2);
 assert.deepEqual(arr[0].origins,['D-1','D-7']);
 const full=[{jurisdiction:'Ciudad',head:'9136'},...J.slice(1).map(j=>({jurisdiction:j,head:'0000'}))];
 assert.equal(compare(arr,full)[0].status,'COINCIDE');
 assert.equal(compare(arr,J.map(j=>({jurisdiction:j,head:'0000'})))[0].status,'NO_COINCIDE');
 assert.equal(compare(arr,J.map(j=>({jurisdiction:j,head:'----'})))[0].status,'INDETERMINADO');
 assert(allShapes(col).some(x=>x.id===arr[0].id));
 assert.throws(()=>validateTrace({...a,sourceId:'Primera'},col));
 assert.throws(()=>validateTrace({...a,cells:['0:0','4:0','2:1'],todayReading:'196'},col));
 console.log('TEST_POST_SELLADO_OK geometría, no salto, dos orientaciones, abstención de selección, controles y negativos');
}
async function main(){
 tests();if(params['test-only']==='true')return;
 const source=path.resolve(root,params.pre||'out/snapshot-pre-primera');
 const out=path.resolve(root,params.out||'out/comparacion-primera-real-10oct');
 const cut=JSON.parse(fs.readFileSync(path.join(source,DATE+'-ANTES-Primera.json'),'utf8'));
 const manifest=JSON.parse(fs.readFileSync(path.join(source,'MANIFIESTO_CAPTURA.json'),'utf8'));
 seal(cut,manifest);
 const ts=require('typescript'),cache=new Map();
 function load(name){
  const fn=path.resolve(root,name.endsWith('.ts')?name:name+'.ts');
  if(cache.has(fn))return cache.get(fn).exports;
  const js=ts.transpileModule(fs.readFileSync(fn,'utf8'),{compilerOptions:{
   module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const m={exports:{}};cache.set(fn,m);
  vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:fn})(
   s=>s.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(fn),s))):require(s),m,m.exports);
  return m.exports;
 }
 const {descargarCabezas}=load('src/cabezas.ts');
 const {buildSheet}=load('src/sheet.ts');
 const {buildVisualMarkedSheet7D,renderVisualMarkedSheetHTML7D}=load('src/visualMarkedSheet7d.ts');
 const today=await descargarCabezas(DATE,true);
 const heads=J.map(j=>({jurisdiction:j,head:today.Primera[j]||'----'}));
 assert(heads.some(x=>/^\d{4}$/.test(x.head)),'Todavía no hay resultados de Primera en esta fuente');
 const frozenPaths=merge(cut),rows=compare(frozenPaths,heads);
 const base=compare(cut.columns.flatMap(allShapes),heads);
 const bySource=(a)=>Object.fromEntries(cut.columns.map(col=>[col.id,count(a.filter(r=>r.sourceId===col.id))]));
 const contact=(r)=>{const overlaps=cut.knownToday.filter(t=>t.sourceId===r.sourceId).map(t=>r.cells.filter(c=>t.cells.includes(c)).length);
  const n=Math.max(0,...overlaps);return n>=2?'2_MAS_CELDAS':n===1?'1_CELDA':'SIN_CONTACTO';};
 const contactGroups=Object.fromEntries(['2_MAS_CELDAS','1_CELDA','SIN_CONTACTO'].map(k=>[k,rows.filter(r=>contact(r)===k)]));
 const group={};for(const origin of ['D-1','D-7'])
  group[origin]={sourceAnnotations:(origin==='D-1'?cut.inherited:cut.d7Inherited).length,
   figures:rows.filter(r=>r.origins.includes(origin))};
 const overlap=rows.filter(r=>r.origins.length===2);
 const coverage=Object.fromEntries(T.map(t=>[t,J.filter(j=>/^\d{4}$/.test(today[t][j]||'')).length]));
 const allHeads=Object.fromEntries(T.map(t=>[t,J.map(j=>({jurisdiction:j,head:today[t][j]||'----'}))]));
 const prior=await descargarCabezas('2026-10-09',true);
 const masked=JSON.parse(JSON.stringify(today));
 for(const later of T.slice(2))for(const j of J)masked[later][j]='----';
 const finalTurn='Primera';
 const fullMarked=buildVisualMarkedSheet7D(buildSheet(masked,prior),DATE,finalTurn);
 const confirmed=fullMarked.strokes.filter(t=>t.turn==='Primera'&&cut.columns.some(c=>c.id===t.sourceId));
 const doc={protocol:'COMPARACION_PRESELLADA_PRIMERA_10OCT2026_V1',
  preSource:{runId:RUN,capturedAtUtc:manifest.capturedAtUtc,sha256:SHA,
   columns:cut.columns.map(c=>c.id),humanSelections:0},
  resultRetrievedAtUtc:new Date().toISOString(),date:DATE,
  actualHeadsPrimera:heads,allHeads,coverage,
  byMemory:{'D-1':{annotations:25,summary:count(group['D-1'].figures),figures:group['D-1'].figures},
   'D-7':{annotations:29,summary:count(group['D-7'].figures),figures:group['D-7'].figures}},
  union:{summary:count(rows),bySource:bySource(rows),figures:rows},
  commonGeometry:{summary:count(overlap),figures:overlap},
  neutralAllPaths:{summary:count(base),bySource:bySource(base),figures:base},
  knownPreviaContact:Object.fromEntries(Object.entries(contactGroups).map(([name,list])=>[name,{summary:count(list),figures:list}])),
  confirmedPrimeraStrokes:confirmed,
  forecastScore:null,humanForecastCount:0,
  interpretation:'Todas las rutas y ambas lecturas se conocían como alternativas, ninguna fue elegida antes.'};
 fs.mkdirSync(out,{recursive:true});
 fs.copyFileSync(path.join(source,DATE+'-ANTES-Primera.json'),
  path.join(out,'FOTO_ORIGINAL_ANTES_PRIMERA.json'));
 fs.copyFileSync(path.join(source,'MANIFIESTO_CAPTURA.json'),
  path.join(out,'MANIFIESTO_PRE_ORIGINAL.json'));
 fs.writeFileSync(path.join(out,'COMPARACION_COMPLETA_CON_NEGATIVOS.json'),JSON.stringify(doc,null,2));
 fs.writeFileSync(path.join(out,'index.html'),html(cut,rows,heads,confirmed));
 fs.writeFileSync(path.join(out,'HOJA_COMPLETA_POST_10OCT.html'),renderVisualMarkedSheetHTML7D(fullMarked));
 fs.writeFileSync(path.join(out,'HOJA_COMPLETA_POST_10OCT.json'),JSON.stringify(fullMarked,null,2));
 const lines=['# Sorteo 10/10/2026 — cotejo de recorridos congelados ANTES de Primera','',
  'Fuente PRE: https://github.com/y0t3/Modelo-Papa/actions/runs/'+RUN,
  'Capturado: '+manifest.capturedAtUtc+' · SHA256: '+SHA,'',
  '## Cabezas Primera (6 jurisdicciones)','',
  '| Jurisdicción | Cabeza | VT2 | VT3 | VT4 |',
  '|---|---|---|---|---|'];
 for(const h of heads)lines.push('| '+h.jurisdiction+' | '+h.head+' | '+(h.head==='----'?'—':h.head.slice(-2))+
  ' | '+(h.head==='----'?'—':h.head.slice(-3))+' | '+(h.head==='----'?'—':h.head)+' |');
 lines.push('','## Balance exhaustivo de dibujos físicos','',
  '| Grupo | VT | Figuras únicas | Coinciden | No coinciden | Indeterminadas |',
  '|---|---|---:|---:|---:|---:|');
 const rowsTable=[['D−1',group['D-1'].figures],['D−7',group['D-7'].figures],['Unión única',rows],
  ['Compartidas D−1 y D−7',overlap],['Control: todas las figuras',base]];
 for(const [title,figures] of rowsTable)for(const k of K){
  const c=count(figures)[k];lines.push('| '+title+' | '+k.toUpperCase()+' | '+c.total+
   ' | '+c.yes+' | '+c.no+' | '+c.unknown+' |');
 }
 lines.push('','Cada dibujo se cuenta UNA vez independientemente del sentido; se cotejaron',
  'ambas lecturas de cada figura contra las seis cabezas. Esto no constituye',
  'dos pronósticos. Las figuras compartidas entre D−1 y D−7 tampoco se duplican.','',
  '## Figuras antiguas que posteriormente coincidieron','');
 const matches=rows.filter(x=>x.matches.length);
 if(!matches.length)lines.push('Ninguna de las figuras previas coincidió con una cabeza disponible.');
 for(const r of matches)
  lines.push('- '+r.kind.toUpperCase()+' '+r.readings.join('/')+' · '+r.origins.join(' + ')+
   ' · '+r.cells.join('→')+' · cabezas: '+r.matches.map(h=>h.jurisdiction+' '+h.fullHead).join('; ')+
   ' · antecedentes: '+r.priorHeads.map(h=>h.origin+' '+h.turn+' '+h.jurisdiction+' '+h.fullHead).join(' / '));
 lines.push('','Los negativos y las fichas completas de todos los recorridos figuran en el JSON.','',
  '## Resto del día: reconstrucción posterior, NO fotografía previa','',
  '| Turno | Cabezas disponibles |','|---|---:|');
 for(const t of T)lines.push('| '+t+' | '+coverage[t]+'/6 |');
 lines.push('','La hoja completa del día está disponible como HTML interactivo por cabeza',
  'en HOJA_COMPLETA_POST_10OCT.html, pero se dibujó SOLO tras conocer los resultados.',
  'La captura PRE de Primera tenía DOS columnas, sin ninguna cabeza de Primera. No contiene columnas futuras.',
  'No hubo ninguna decisión humana pre-sorteo, por lo que el total de',
  'pronósticos realizados y evaluables es CERO. Ninguna coincidencia se presenta',
  'como un acierto de pronóstico.','');
 fs.writeFileSync(path.join(out,'INFORME_CON_COMPARACION_Y_NEGATIVOS.md'),lines.join('\n'));
 console.log('SALDO_REAL_PRIMERA_10OCT '+JSON.stringify({
  captureUtc:manifest.capturedAtUtc,heads,coverage,
  d1:count(group['D-1'].figures),d7:count(group['D-7'].figures),
  union:count(rows),shared:count(overlap),baseline:count(base),bySource:bySource(rows),contactSummary:Object.fromEntries(Object.entries(contactGroups).map(([k,v])=>[k,count(v)])),
  confirmedPrimeraStrokes:confirmed.length,
  humanForecasts:0,postFullSheetUntil:finalTurn}));
 console.log('FINAL_POST_PRIMERA_OCT10_VALIDATED');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
