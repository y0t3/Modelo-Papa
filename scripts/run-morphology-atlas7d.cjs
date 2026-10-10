// Atlas OCULAR de cambios entre hojas ya MARCADAS de Modelo Papá.
// No enumera candidatos en tabla vacía, no puntúa, no pronostica.
// Requiere primero ejecutar run-visual-chain7d.cjs para construir 7 hojas reales.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const argv=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const input=path.resolve(ROOT,argv.input||'out/cadena-visual-septiembre');
const output=path.resolve(ROOT,argv.out||'out/atlas-cambios-visuales-septiembre');
const TURNOS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const JURS=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const TYPES=['misma_huella','sentido_invertido','traslacion_mismo_origen',
 'giro_con_extremo_comun','forma_analoga_otro_origen'];
function cell(p){const [r,c]=p.split(':').map(Number);
 assert(Number.isInteger(r)&&r>=0&&r<6&&[0,1].includes(c),'Celda inválida '+p);
 return [r,c];
}
function within(t){assert(['vt2','vt3','vt4'].includes(t.kind));
 assert(t.cells.length===Number(t.kind.slice(-1)));
 assert(new Set(t.cells).size===t.cells.length,'Celda reutilizada');
 for(let i=0;i<t.cells.length;i++){
  const [r,c]=cell(t.cells[i]);
  if(i){const [pr,pc]=cell(t.cells[i-1]);
   assert(Math.abs(pr-r)<=1&&Math.abs(pc-c)<=1&&(pr!==r||pc!==c),'Celdas no contiguas');}
 }
 assert(t.sourceId,'Origen vacío');
}
function signature(t){return t.kind+'|'+t.sourceId+'|'+t.cells.join('>');}
function canonical(strokes){
 const paths=new Map();
 for(const tr of strokes){
  within(tr);const id=signature(tr);
  if(!paths.has(id))paths.set(id,{kind:tr.kind,sourceId:tr.sourceId,
   cells:[...tr.cells],annotations:[],values:[]});
  const p=paths.get(id);
  const label=tr.fullHead+' / '+tr.turn+' / '+tr.jurisdiction;
  if(!p.annotations.includes(label))p.annotations.push(label);
  if(!p.values.includes(tr.value))p.values.push(tr.value);
 }
 return [...paths.values()].sort((a,b)=>signature(a).localeCompare(signature(b)));
}
function steps(cells){return cells.slice(1).map((c,i)=>{
 const [r,s]=cell(c),[pr,ps]=cell(cells[i]);return [r-pr,s-ps].join(',');
}).join(';');}
function classify(a,b){
 if(a.kind!==b.kind)return null;
 const sameSource=a.sourceId===b.sourceId,ac=a.cells,bc=b.cells;
 if(sameSource&&ac.join('>')===bc.join('>'))return 'misma_huella';
 if(sameSource&&ac.join('>')===[...bc].reverse().join('>'))
  return 'sentido_invertido';
 if(sameSource&&steps(ac)===steps(bc)){
  const [ar,as]=cell(ac[0]),[br,bs]=cell(bc[0]);
  if(ar!==br||as!==bs)return 'traslacion_mismo_origen';
 }
 if(sameSource&&(ac[0]===bc[0]||ac[ac.length-1]===bc[bc.length-1]))
  return 'giro_con_extremo_comun';
 if(!sameSource&&steps(ac)===steps(bc)&&ac.length>=3)
  return 'forma_analoga_otro_origen';
 return null;
}
function compare(old,newer){
 const links=[],oldRelations=new Map(),pivotBranches=new Map();
 for(const a of old)for(const b of newer){
  const type=classify(a,b);if(!type)continue;
  const aId=signature(a),bId=signature(b);
  links.push({type,aId,bId,prior:a,current:b});
  (oldRelations.get(aId)||oldRelations.set(aId,new Set()).get(aId)).add(type);
  if(type==='giro_con_extremo_comun'&&a.kind!=='vt2'){
   const anchor= a.cells[0]===b.cells[0]?'inicio': 'final';
   const key=aId+'|'+anchor;
   (pivotBranches.get(key)||pivotBranches.set(key,new Set()).get(key)).add(bId);
  }
 }
 const counts=Object.fromEntries(TYPES.map(type=>[type,links.filter(x=>x.type===type).length]));
 return {links,counts,distinctOld:old.length,distinctCurrent:newer.length,
  oldWithAnyRelation:oldRelations.size,
  oldWithoutRelation:old.length-oldRelations.size,
  visualForks:[...pivotBranches.entries()].filter(([id,targets])=>targets.size>=2)
   .map(([id,targets])=>({prior:id.split('|').slice(0,3).join('|'),
    pivot:id.split('|').at(-1),branches:[...targets]}))};
}
function fmt(x){return x?x.join(' → '):'—';}
function read(date,stage){
 const file=path.join(input,date+'-'+stage+'-'+TURNOS[stage-1]+'.json');
 const v=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.equal(v.date,date);assert.equal(v.closedTurn,TURNOS[stage-1]);
 return v;
}
function columns(t,view){
 const c=view.columns.find(x=>x.id===t.sourceId);
 assert(c,'Columna no visible '+t.sourceId);
 return {sourceId:c.id,values:c.values,label:c.label};
}
function htmlSafe(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')
 .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function pageHTML(data){
 const links=data.transitions.flatMap((p,idx)=>p.links.map(l=>({
  dates:p.dates,prior:l.prior,current:l.current,type:l.type,
  prevColumn:columns(l.prior,data.views[p.dates[0]]),
  nowColumn:columns(l.current,data.views[p.dates[1]])})));
 const options=links.map((l,i)=>'<option value="'+i+'">'+htmlSafe(
  l.dates[0]+'→'+l.dates[1]+' · '+l.prior.kind+' · '+l.type+
  ' · '+l.prior.sourceId+' → '+l.current.sourceId+
  ' · '+l.prior.cells.join('→')+' / '+l.current.cells.join('→'))+'</option>').join('');
 const legend=TYPES.map(x=>'<label><input type="checkbox" data-type="'+x+
  '" checked> '+htmlSafe(x.replace(/_/g,' '))+'</label>').join(' ');
 const source='<!doctype html><html lang="es"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Modelo Papá · Atlas de recorridos marcados</title>'+
 '<style>body{font:15px system-ui;background:#faf9fd;color:#302744;max-width:1500px;margin:auto;padding:18px}'+
 'h1{font-size:24px}h2{font-size:19px}p{line-height:1.5}a{color:#613ab0}'+
 '.panels{display:grid;grid-template-columns:1fr 1fr;gap:12px}iframe{width:100%;height:530px;border:1px solid #dad3e7;border-radius:8px;background:white}'+
 '.box{border:1px solid #dcd4ea;background:white;border-radius:9px;padding:12px;margin:12px 0}'+
 '.small{font-size:12px;color:#68617a}.controls{display:flex;gap:13px;flex-wrap:wrap}select{max-width:100%;width:100%;padding:9px}'+
 '.routeBoards{display:grid;grid-template-columns:1fr 1fr;gap:18px}.btable{border-collapse:collapse;width:100%}'+
 '.btable td,.btable th{border:1px solid #dcd6e9;padding:8px;text-align:center}.btable td{font-size:24px;font-weight:650;position:relative}'+
 '.btable td.lit{background:#e2d5ff;color:#5122a1}.btable sup{font:11px system-ui;position:absolute;left:4px;top:2px}'+
 '@media(max-width:900px){.panels,.routeBoards{grid-template-columns:1fr}}</style></head><body>'+
 '<h1>Modelo Papá · Atlas de transformaciones de huellas MARCADAS</h1>'+
 '<p>No es un selector de números. Toda relación compara recorridos ya confirmados de dos jornadas. '+
 'El origen físico de cada recorrido permanece intacto; las formas parecidas de distintas columnas son sólo una analogía visual, no una ruta que atraviese columnas.</p>'+
 '<div class="box"><div class="controls">'+legend+'</div>'+
 '<p><label>Comparación (sin orden de acierto): <select id="route">'+options+'</select></label></p>'+
 '<p class="small" id="total">Todos los pares se conservan y el filtro sólo los oculta.</p>'+
 '<p id="label"></p><div class="routeBoards"><section><h3>Jornada histórica anterior</h3><div id="prior"></div></section>'+
 '<section><h3>Jornada histórica actual</h3><div id="now"></div></section></div>'+
 '<p class="small" id="provenance"></p></div>'+
 '<h2>Contexto completo: dos hojas con TODAS las marcas</h2>'+
 '<div class="panels"><section><h3 id="leftdate"></h3><iframe id="left" title="Hoja anterior completa"></iframe></section>'+
 '<section><h3 id="rightdate"></h3><iframe id="right" title="Hoja actual completa"></iframe></section></div>'+
 '<p class="small">En las dos hojas completas se puede tocar cada cabeza para ver sus trazos. Arriba se iluminan aisladamente '+
 'las dos rutas relacionadas, sus celdas reales y el orden de lectura.</p>'+
 '<h2>Por qué esto NO valida una predicción</h2><p>Las relaciones se registran DESPUÉS de que dos jornadas ya fueron sorteadas. '+
 'Las semejanzas de VT2 son abundantes por la cuadrícula pequeña. Las bifurcaciones y los contactos no demuestran continuidad futura. '+
 'Antes de proponer cualquier número hay que justificar por qué destacar una huella sobre las alternativas que NO se confirmaron.</p>'+
 '<script>(function(){const routes='+JSON.stringify(links).replace(/</g,'\\u003c')+';'+
 'const sel=document.querySelector("#route"),filters=[...document.querySelectorAll("[data-type]")];'+
 'function board(cells,col){const order=new Map(cells.map((c,i)=>[c,i+1]));'+
 'const rows=col.values.map((v,r)=>"<tr><th>"+'+JSON.stringify(JURS)+
 '[r]+"</th>"+[0,1].map(s=>{const key=r+":"+s,n=order.get(key);'+
 'return "<td"+(n?" class=lit":"")+">"+(n?"<sup>"+n+"</sup>":"")+(v.length===2?v[s]:"—")+"</td>"}).join("")+"</tr>").join("");'+
 'return "<p><b>"+col.label+" · "+col.sourceId+"</b></p><table class=btable><tbody>"+rows+"</tbody></table>";}'+
 'function show(){const i=Number(sel.value);if(!Number.isInteger(i)||!routes[i])return;const x=routes[i];'+
 'document.querySelector("#prior").innerHTML=board(x.prior.cells,x.prevColumn);'+
 'document.querySelector("#now").innerHTML=board(x.current.cells,x.nowColumn);'+
 'document.querySelector("#label").textContent=x.prior.kind.toUpperCase()+" · "+x.type.replaceAll("_"," ")+
 " | "+x.prior.cells.join("→")+" → "+x.current.cells.join("→");'+
 'document.querySelector("#provenance").textContent="Antes: "+x.prior.annotations.join("; ")+
 " · cifras marcadas "+x.prior.values.join("/")+
 " | Después: "+x.current.annotations.join("; ")+
 " · cifras marcadas "+x.current.values.join("/");'+
 'for(const [id,day]of [["left",x.dates[0]],["right",x.dates[1]]]){'+
 'document.querySelector("#"+id).src=day+"-5-Nocturno.html";'+
 'document.querySelector("#"+(id==="left"?"leftdate":"rightdate")).textContent=day;}'+
 '}function apply(){const active=new Set(filters.filter(f=>f.checked).map(f=>f.dataset.type));'+
 'let first=null,count=0;for(const o of sel.options){const on=active.has(routes[Number(o.value)].type);o.hidden=!on;'+
 'if(on){count++;if(first===null)first=o.value;}}'+
 'if(!active.has(routes[Number(sel.value)]?.type)&&first!==null)sel.value=first;'+
 'document.querySelector("#total").textContent=count+" relaciones visibles. Esta vista no ordena candidatos ni aciertos.";show();}'+
 'filters.forEach(f=>f.addEventListener("change",apply));sel.addEventListener("change",show);apply();})();</script>'+
 '</body></html>';
 return source;
}
function test(){
 const t=(k,src,c)=>({kind:k,sourceId:src,cells:c,fullHead:'1234',turn:'Previa',
  jurisdiction:'Ciudad',value:'34'});
 const a=t('vt3','Previa',['1:0','2:0','3:1']);
 assert.equal(classify(a,a),'misma_huella');
 assert.equal(classify(a,t('vt3','Previa',['3:1','2:0','1:0'])),'sentido_invertido');
 assert.equal(classify(a,t('vt3','Previa',['2:0','3:0','4:1'])),'traslacion_mismo_origen');
 assert.equal(classify(a,t('vt3','Previa',['1:0','2:1','3:1'])),'giro_con_extremo_comun');
 assert.equal(classify(a,t('vt3','Primera',['1:0','2:0','3:1'])),'forma_analoga_otro_origen');
 assert.equal(classify(a,t('vt2','Previa',['1:0','2:0'])),null);
 assert.equal(classify(a,t('vt3','Previa',['0:1','1:1','2:1'])),null);
 within(t('vt2','Primera',['1:0','0:0']));
 assert.throws(()=>within(t('vt2','Primera',['1:0','3:1'])));
 assert.equal(canonical([a,a]).length,1,'Cabeza repetida no crea ruta nueva');
 console.log('TEST_ATLAS_OK: exacta, inversa, traslación, giro, analogía sin cruce, negativos y deduplicación');
}
function main(){
 test();if(argv['test-only']==='true')return;
 const days=fs.readdirSync(input).filter(f=>/^\d{4}-\d{2}-\d{2}-5-Nocturno\.json$/.test(f))
  .map(f=>f.slice(0,10)).sort();
 assert(days.length>=3,'Requiere tres jornadas o más de hojas ya marcadas');
 fs.mkdirSync(output,{recursive:true});
 const views=Object.fromEntries(days.map(d=>[d,read(d,5)]));
 const transitions=[],md=['# Atlas de figuras ya marcadas: desplazamientos, giros y sentidos','',
 '**REPLAY RETROSPECTIVO, NO pronóstico ni ranking.**',
 'Se parte de todas las marcas reales reconstruidas y cabeza completa.',
 'Se deduplica por modalidad, origen y celdas ordenadas; una cabeza puede producir muchas rutas.',
 'Cada ruta queda en su columna; nunca se unen dígitos de fuentes distintas.','',
 '## Familias de cambio y precauciones','',
 '- **Misma huella:** mismas celdas, mismo orden y misma fuente en dos hojas.',
 '- **Sentido invertido:** exactamente mismas celdas en orden inverso dentro de la misma fuente.',
 '- **Traslación:** pasos idénticos, pero ruta desplazada físicamente dentro del MISMO origen.',
 '- **Giro con extremo común:** se conserva inicio o final pero varía la ruta dentro del mismo origen.',
 '- **Forma análoga en otro origen:** sólo comparación de dibujos de VT3/VT4 en distintas columnas, no conexión física ni desplazamiento probado.',
 '- **Bifurcación:** una huella vieja se relaciona con dos o más giros de VT3/VT4; no confirma movimiento dirigido.',
 'La clasificación es un índice para MIRAR el dibujo, no un criterio predictivo.',
 'Las cantidades de pares son dependientes (muchos pares pueden compartir la misma cabeza o ruta).','',
 '| Fechas | Geometrías antiguas únicas | Nuevas únicas | Exactas | Invertidas | Trasladadas | Giros | Analogías entre orígenes | Viejas sin relación de este catálogo |',
 '|---|---:|---:|---:|---:|---:|---:|---:|---:|'];
 const cuts=['## Lectura progresiva antes de cada turno','',
  'Sólo se comparan marcas antiguas completas con las marcas de HOY que ya estaban comprobadas antes del turno objetivo.',
  'Ninguna marca del sorteo objetivo (o posterior) figura en el corte. No se generan candidatos.','',
  '| Día anterior → actual | Antes de | Nuevas rutas marcadas hoy | Pares exactos | Invertidos | Traslaciones | Giros | Analogías |',
  '|---|---|---:|---:|---:|---:|---:|---:|'];
 for(let k=1;k<days.length;k++){
  const before=days[k-1],now=days[k];
  const old=canonical(views[before].strokes),curr=canonical(views[now].strokes);
  const report=compare(old,curr);
  const links=report.links.map(l=>({type:l.type,prior:l.prior,current:l.current}));
  transitions.push({dates:[before,now],links,counts:report.counts,
   oldUnique:report.distinctOld,currentUnique:report.distinctCurrent,
   oldWithoutRelation:report.oldWithoutRelation,visualForks:report.visualForks});
  const vals=TYPES.map(t=>report.counts[t]);
  md.push('| '+before+' → '+now+' | '+old.length+' | '+curr.length+
   ' | '+vals.join(' | ')+' | '+report.oldWithoutRelation+' |');
  console.log('ATLAS_PAR '+before+' -> '+now+' | antiguas='+old.length+
   ' nuevas='+curr.length+' exactas='+vals[0]+' inversas='+vals[1]+
   ' trasladadas='+vals[2]+' giros='+vals[3]+' analogias='+vals[4]+
   ' sin_relacion='+report.oldWithoutRelation+' bifurcaciones='+report.visualForks.length);
  for(const type of TYPES){
   const examples=report.links.filter(l=>l.type===type&&l.prior.kind==='vt3');
   if(!examples.length)continue;
   // Ejemplo de lectura por orden estable de geometría, NO éxito ni resultado futuro.
   const ex=examples[0];
   console.log('EJEMPLO_VT3 '+before+' -> '+now+' | '+type+' | '+
    ex.prior.sourceId+':'+ex.prior.cells.join('>')+' ['+ex.prior.values.join('/')+'] -> '+
    ex.current.sourceId+':'+ex.current.cells.join('>')+' ['+ex.current.values.join('/')+']'+
    ' | cabeza_ant='+ex.prior.annotations[0]+' cabeza_hoy='+ex.current.annotations[0]);
  }
  // Sólo usar marcas de turnos CERRADOS a este punto del día. El Nocturno
  // del día anterior es memoria histórica, nunca resultado nuevo del objetivo.
  for(let i=0;i<TURNOS.length;i++){
   const target=TURNOS[i];const closed=i===0?[]:read(now,i).strokes;
   const r=compare(old,canonical(closed));
   cuts.push('| '+before+' → '+now+' | '+target+' | '+canonical(closed).length+
    ' | '+TYPES.map(t=>r.counts[t]).join(' | ')+' |');
  }
 }
 md.push('','## Ejemplos que deben inspeccionarse con el atlas (sin selección por acierto)','',
 'El visor muestra TODAS las relaciones del catálogo, permite filtrar clase',
 'y deja visibles las dos hojas completas originales detrás de cada ejemplo.',
 'Un conteo abundante de giros VT2 es esperable en una cuadrícula 6×2.',
 'Para distinguir continuidad visual real hará falta registrar observación PREVIA',
 'de un siguiente sorteo y comparar con alternativas/abstenciones.','',...cuts,'',
 '## Resultado','',
 'Este atlas documenta transformaciones físicas DESPUÉS de ambos sorteos.',
 'No permite elegir a priori cuál relación se repetirá y NO reemplaza',
 'el motor ni el criterio ocular del papá.','');
 for(const day of days){
  fs.copyFileSync(path.join(input,day+'-5-Nocturno.html'),
   path.join(output,day+'-5-Nocturno.html'));
 }
 const data={protocol:'ATLAS_OCULAR_RETROSPECTIVO_V1',dates:days,
  views,transitions,notes:['Todas las relaciones son retrospectivas y no predicen sorteos.',
   'Ningún recorrido atraviesa columnas, y las analogías intercolumnas nunca se concatenan.',
   'La tabla progresiva no contiene marcas del turno objetivo o posteriores.']};
 fs.writeFileSync(path.join(output,'ATLAS_RELACIONES.json'),JSON.stringify(
  {protocol:data.protocol,dates:days,transitions,notes:data.notes},null,2));
 fs.writeFileSync(path.join(output,'ESTUDIO_DESCRIPTIVO.md'),md.join('\n'));
 fs.writeFileSync(path.join(output,'index.html'),pageHTML(data));
 console.log('ATLAS_OK '+days.length+' hojas, '+transitions.length+
  ' pares, '+transitions.reduce((n,t)=>n+t.links.length,0)+
  ' relaciones catalogadas sin ranking ni candidatos');
}
main();
