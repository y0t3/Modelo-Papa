'use strict';
// Informe POST de foto PRE inmutable; cero pronósticos elegidos.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm');
const assert=require('node:assert/strict'),root=path.resolve(__dirname,'..');
const params=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('=')).map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const DATE='2026-10-10',RUN='38050639551';
const SHA='19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b';
const J=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const T=['Previa','Primera','Matutino','Vespertino','Nocturno'],K=['vt2','vt3','vt4'];
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const rev=a=>[...a].reverse(),uniq=a=>[...new Set(a)],coordinates=x=>x.split(':').map(Number);
const shape=x=>x.kind+'|'+x.sourceId+'|'+[x.cells.join('>'),rev(x.cells).join('>')].sort()[0];
function read(cells,col){return cells.map(x=>{const [r,c]=coordinates(x);return col.values[r]?.[c]||''}).join('')}
function validateTrace(t,col){
 assert(K.includes(t.kind));assert.equal(t.sourceId,'prevNocturno');
 assert.equal(t.sourceId,col.id);assert.equal(t.cells.length,Number(t.kind.slice(2)));
 assert.equal(uniq(t.cells).length,t.cells.length);
 for(let i=0;i<t.cells.length;i++){
  const [r,c]=coordinates(t.cells[i]);assert(Number.isInteger(r)&&r>=0&&r<6&&(c===0||c===1));
  if(i){const [pr,pc]=coordinates(t.cells[i-1]);assert.equal(Math.max(Math.abs(r-pr),Math.abs(c-pc)),1);}
 }
 assert.equal(read(t.cells,col),t.todayReading);
 assert(/^\d{4}$/.test(t.fullHead)&&t.fullHead.endsWith(t.value));
}
function seal(cut,m){
 assert.equal(m.actionRunId,RUN);assert.equal(m.cutSha256,SHA);
 assert.equal(sha(cut),SHA);assert.equal(m.protocol,'CAPTURA_PROSPECTIVA_SIN_DECISION_V1');
 assert(Date.parse(m.capturedAtUtc)<Date.parse('2026-10-10T10:05:00-03:00'));
 assert.equal(m.humanSelections,0);assert.equal(m.forecastMade,false);
 assert.equal(m.targetHeadCountInSnapshot,0);assert.equal(m.postTargetHeadCountInSnapshot,0);
 assert.equal(cut.date,DATE);assert.equal(cut.target,'Previa');
 assert.equal(cut.priorDate,'2026-10-09');assert.equal(cut.d7Date,'2026-10-03');
 assert.equal(cut.mode,'ANTES_DEL_SORTEO_OBJETIVO');
 assert.equal(cut.columns.length,1);assert.equal(cut.columns[0].id,'prevNocturno');
 assert.equal(cut.knownToday.length,0);
 assert.equal(cut.inherited.length,11);assert.equal(cut.d7Inherited.length,15);
 for(const tr of [...cut.inherited,...cut.d7Inherited])validateTrace(tr,cut.columns[0]);
}
function merge(cut){
 const result=new Map();
 for(const [origin,list] of [['D-1',cut.inherited],['D-7',cut.d7Inherited]]){
  for(const t of list){
   const id=shape(t);
   if(!result.has(id)){
    const cells=[t.cells,rev(t.cells)].sort((a,b)=>a.join('>').localeCompare(b.join('>')))[0];
    const forward=read(cells,cut.columns[0]),backward=rev(forward.split('')).join('');
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
function diagram(cut,rows,preHeads){
 const y=r=>83+40*r,x=c=>95+35*c;
 const svg=['<svg viewBox="0 0 223 352" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tablero +11 capturado antes del sorteo">'];
 svg.push('<rect x="72" y="40" width="93" height="273" rx="8" fill="#faf8ff" stroke="#ccc2da"/>');
 for(let r=0;r<6;r++){
  svg.push('<text x="2" y="'+(y(r)+3)+'" font-size="10" fill="#555">'+xml(J[r])+'</text>');
  for(let c=0;c<2;c++)svg.push('<rect x="'+(x(c)-14)+'" y="'+(y(r)-17)+'" width="28" height="34" rx="5" fill="#fff" stroke="#ddd6e5"/>');
 }
 for(const t of rows){
  const yes=t.status==='COINCIDE';
  const fill=yes?'#008c83':t.origins.length===2?'#874db2':t.origins.includes('D-7')?'#bb8b3e':'#7959aa';
  const stroke=t.cells.map((cell,i)=>{const [r,c]=coordinates(cell);return (i?'L':'M')+x(c)+' '+y(r)}).join(' ');
  svg.push('<path d="'+stroke+'" data-kind="'+t.kind+'" data-origin="'+t.origins.join(' ')+'" data-yes="'+yes+
   '" fill="none" stroke="'+fill+'" opacity="'+(yes?.9:.24)+'" stroke-width="'+(yes?4.7:2.5)+'" stroke-linecap="round" stroke-linejoin="round"><title>'+
   xml(t.kind.toUpperCase()+' '+t.readings.join('/')+' · '+t.origins.join('+')+' · '+t.matches.map(m=>m.jurisdiction+' '+m.fullHead).join('; '))+'</title></path>');
 }
 for(let r=0;r<6;r++)for(let c=0;c<2;c++)
  svg.push('<text x="'+x(c)+'" y="'+(y(r)+6)+'" font-size="19" font-weight="800" text-anchor="middle" fill="#272035">'+xml(cut.columns[0].values[r][c])+'</text>');
 svg.push('</svg>');return svg.join('');
}
function html(cut,rows,heads){
 const pos=rows.filter(r=>r.status==='COINCIDE'),neg=rows.filter(r=>r.status==='NO_COINCIDE');
 const s=count(rows);
 return '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<title>Modelo Papá: resultados contra hoja PRE</title><style>body{font:15px system-ui,Arial;background:#f8f6fc;color:#30243d;margin:0;padding:14px}main{max-width:1050px;margin:auto}'+
  '.card{background:white;padding:14px;border-radius:12px;border:1px solid #d9d0e5;margin:10px 0}button{padding:9px;background:#eee8f5;border:1px solid #d2c3de;border-radius:7px;margin:3px;cursor:pointer}svg{width:100%;max-width:430px}'+
  '.layout{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:750px){.layout{grid-template-columns:1fr}}li{padding:4px}small{color:#655b70}</style>'+
  '<main><h1>Previa 10/10 · la hoja real, antes y después</h1>'+
  '<p>Tablero archivado a las <strong>09:04:33 ART</strong> (antes del sorteo). Ningún recorrido u orientación fue elegido como pronóstico. Los resultados se añadieron únicamente en este cotejo posterior.</p>'+
  '<div class="card"><strong>Las seis cabezas de Previa:</strong> '+xml(heads.map(h=>h.jurisdiction+': '+h.head).join(' · '))+'</div>'+
  '<div class="layout"><section class="card"><h2>Todos los trazos físicos heredados</h2>'+
  '<p><button data-filter="all">Todos</button><button data-filter="d1">D−1</button><button data-filter="d7">D−7</button><button data-filter="yes">Compatibles</button><button data-filter="no">No coinciden</button></p>'+
  diagram(cut,rows,heads)+
  '<p><small>Verde: compatible con algún resultado. Violeta: huellas anteriores. Ocre: D−7. Las figuras invertidas no se duplican.</small></p></section>'+
  '<section class="card"><h2>Balance, sin selección</h2>'+
  K.map(k=>'<p><strong>'+k.toUpperCase()+'</strong> · '+s[k].total+' figuras · '+s[k].yes+' compatibles · '+s[k].no+' sin coincidencia · '+s[k].unknown+' indeterminadas</p>').join('')+
  '<details open><summary>Todos los recorridos compatibles ('+pos.length+')</summary><ul>'+
  pos.map(p=>'<li>'+p.kind.toUpperCase()+' <strong>'+xml(p.readings.join('/'))+'</strong> · '+xml(p.origins.join('+'))+' · '+xml(p.cells.join('→'))+
   ' · '+xml(p.matches.map(m=>m.jurisdiction+' '+m.fullHead).join('; '))+'</li>').join('')+'</ul></details>'+
  '<details><summary>Todos los que NO coincidieron ('+neg.length+')</summary><ul>'+
  neg.map(p=>'<li>'+p.kind.toUpperCase()+' '+xml(p.readings.join('/'))+' · '+xml(p.origins.join('+'))+' · '+xml(p.cells.join('→'))+'</li>').join('')+
  '</ul></details><p><a href="HOJA_COMPLETA_POST_10OCT.html">Hoja completa del sábado después de todos los sorteos</a></p></section></div>'+
  '<p><strong>Interpretación:</strong> que exista alguna ruta previa compatible NO demuestra una predicción acertada. El tablero pre tenía una sola columna; las demás se reconstruyeron posteriormente.</p>'+
  '<script>for(const b of document.querySelectorAll("button[data-filter]"))b.addEventListener("click",()=>{'+
  'const mode=b.dataset.filter;for(const p of document.querySelectorAll("svg path[data-kind]")){'+
  'p.style.display=mode==="all"||mode==="d1"&&p.dataset.origin.includes("D-1")||mode==="d7"&&p.dataset.origin.includes("D-7")||'+
  'mode==="yes"&&p.dataset.yes==="true"||mode==="no"&&p.dataset.yes==="false"?"":"none";}});</script></main>';
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
 const source=path.resolve(root,params.pre||'out/snapshot-pre-original');
 const out=path.resolve(root,params.out||'out/comparacion-real-10oct');
 const cut=JSON.parse(fs.readFileSync(path.join(source,DATE+'-ANTES-Previa.json'),'utf8'));
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
 const heads=J.map(j=>({jurisdiction:j,head:today.Previa[j]||'----'}));
 assert(heads.some(x=>/^\d{4}$/.test(x.head)),'No hay datos de Previa');
 const frozenPaths=merge(cut),rows=compare(frozenPaths,heads);
 const base=compare(allShapes(cut.columns[0]),heads);
 const group={};for(const origin of ['D-1','D-7'])
  group[origin]={sourceAnnotations:(origin==='D-1'?cut.inherited:cut.d7Inherited).length,
   figures:rows.filter(r=>r.origins.includes(origin))};
 const overlap=rows.filter(r=>r.origins.length===2);
 const coverage=Object.fromEntries(T.map(t=>[t,J.filter(j=>/^\d{4}$/.test(today[t][j]||'')).length]));
 const allHeads=Object.fromEntries(T.map(t=>[t,J.map(j=>({jurisdiction:j,head:today[t][j]||'----'}))]));
 const doc={protocol:'COMPARACION_PRESELLADA_10OCT2026_V1',
  preSource:{runId:RUN,capturedAtUtc:manifest.capturedAtUtc,sha256:SHA,
   columns:cut.columns.map(c=>c.id),humanSelections:0},
  resultRetrievedAtUtc:new Date().toISOString(),date:DATE,
  actualHeadsPrevia:heads,allHeads,coverage,
  byMemory:{'D-1':{annotations:11,summary:count(group['D-1'].figures),figures:group['D-1'].figures},
   'D-7':{annotations:15,summary:count(group['D-7'].figures),figures:group['D-7'].figures}},
  union:{summary:count(rows),figures:rows},
  commonGeometry:{summary:count(overlap),figures:overlap},
  neutralAllPaths:{summary:count(base),figures:base.length},
  forecastScore:null,humanForecastCount:0,
  interpretation:'Todas las rutas y ambas lecturas se conocían como alternativas, ninguna fue elegida antes.'};
 const prior=await descargarCabezas('2026-10-09',true);
 const finalTurn=[...T].reverse().find(t=>coverage[t])||'Previa';
 const fullMarked=buildVisualMarkedSheet7D(buildSheet(today,prior),DATE,finalTurn);
 fs.mkdirSync(out,{recursive:true});
 fs.copyFileSync(path.join(source,DATE+'-ANTES-Previa.json'),
  path.join(out,'FOTO_ORIGINAL_ANTES_PREVIA.json'));
 fs.copyFileSync(path.join(source,'MANIFIESTO_CAPTURA.json'),
  path.join(out,'MANIFIESTO_PRE_ORIGINAL.json'));
 fs.writeFileSync(path.join(out,'COMPARACION_COMPLETA_CON_NEGATIVOS.json'),JSON.stringify(doc,null,2));
 fs.writeFileSync(path.join(out,'index.html'),html(cut,rows,heads));
 fs.writeFileSync(path.join(out,'HOJA_COMPLETA_POST_10OCT.html'),renderVisualMarkedSheetHTML7D(fullMarked));
 fs.writeFileSync(path.join(out,'HOJA_COMPLETA_POST_10OCT.json'),JSON.stringify(fullMarked,null,2));
 const lines=['# Sorteo 10/10/2026 — cotejo de recorridos congelados ANTES de Previa','',
  'Fuente PRE: https://github.com/y0t3/Modelo-Papa/actions/runs/'+RUN,
  'Capturado: '+manifest.capturedAtUtc+' · SHA256: '+SHA,'',
  '## Cabezas Previa (6 jurisdicciones)','',
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
  'La captura previa real tenía UNA columna; no contiene columnas futuras.',
  'No hubo ninguna decisión humana pre-sorteo, por lo que el total de',
  'pronósticos realizados y evaluables es CERO. Ninguna coincidencia se presenta',
  'como un acierto de pronóstico.','');
 fs.writeFileSync(path.join(out,'INFORME_CON_COMPARACION_Y_NEGATIVOS.md'),lines.join('\n'));
 console.log('SALDO_REAL_OCT10 '+JSON.stringify({
  captureUtc:manifest.capturedAtUtc,heads,coverage,
  d1:count(group['D-1'].figures),d7:count(group['D-7'].figures),
  union:count(rows),shared:count(overlap),baseline:count(base),
  humanForecasts:0,postFullSheetUntil:finalTurn}));
 console.log('FINAL_POST_OCT10_VALIDATED');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
