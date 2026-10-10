'use strict';
// Comparación visual posterior de todas las hojas reconstruidas de septiembre.
// Sin elección automática ni suposición de continuidad causal.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('=')).map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const input=path.resolve(root,args.input||'out/cadena-visual-08-30-septiembre');
const out=path.resolve(root,args.out||'out/atlas-zonas-orientaciones-septiembre');
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const JURS=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const KINDS=['vt2','vt3','vt4'];
const CLASSES=['MISMA_HUELLA','MISMA_FORMA_DESPLAZADA','TOQUE_EN_EXTREMO','TOQUE_INTERNO','SIN_CONTACTO','SIN_FIGURA_COMPARABLE'];
const uniq=a=>[...new Set(a)],rev=a=>[...a].reverse(),point=s=>s.split(':').map(Number);
const stamp=t=>t.kind+'|'+t.sourceId+'|'+[t.cells.join('>'),rev(t.cells).join('>')].sort()[0];
const keyValues=(cells,col)=>cells.map(p=>{const [r,c]=point(p);return col.values[r]?.[c]||''}).join('');
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const epoch=s=>Date.parse(s+'T12:00:00Z');
const zone=cells=>{
 const zoneOf=r=>r<=1?'ARRIBA':r<=3?'CENTRO':'ABAJO';
 const z=uniq(cells.map(c=>zoneOf(point(c)[0])));
 return ['ARRIBA','CENTRO','ABAJO'].filter(x=>z.includes(x)).join('→');
};
const sense=cells=>{
 const delta=cells.slice(1).map((x,i)=>point(x)[0]-point(cells[i])[0]);
 return delta.every(x=>x<0)?'SUBE':delta.every(x=>x>0)?'BAJA':
  delta.every(x=>x===0)?'HORIZONTAL':'MIXTO';
};
const sig=cells=>{
 const shapes=[cells,rev(cells)].map(q=>q.slice(1).map((s,i)=>{
  const [r,c]=point(s),[pr,pc]=point(q[i]);return (r-pr)+','+(c-pc);
 }).join(';'));
 return shapes.sort()[0];
};
function validate(t,columns){
 assert(KINDS.includes(t.kind),'VT no aceptada');
 assert(t.cells.length===Number(t.kind.slice(-1)),'Número de celdas diferente de modalidad');
 assert(uniq(t.cells).length===t.cells.length,'Reuso de celda');
 const col=columns.find(x=>x.id===t.sourceId);assert(col,'Fuente inexistente');
 for(let i=0;i<t.cells.length;i++){
  const [r,c]=point(t.cells[i]);assert(Number.isInteger(r)&&r>=0&&r<6&&(c===0||c===1));
  assert(/^\d{2}$/.test(col.values[r]),'No atravesar vacíos');
  if(i){const [pr,pc]=point(t.cells[i-1]);
   assert(Math.max(Math.abs(r-pr),Math.abs(c-pc))===1,'Salto prohibido');}
 }
 assert.equal(keyValues(t.cells,col),t.value,'Las cifras no están en las celdas del tablero');
 assert(/^\d{4}$/.test(t.fullHead)&&t.fullHead.endsWith(t.value),'Cabeza completa no justifica la ruta');
 assert(TURNS.includes(t.turn)&&JURS.includes(t.jurisdiction));
}
function compress(view){
 const fig=new Map();
 for(const t of view.strokes){
  validate(t,view.columns);
  const id=stamp(t);
  if(!fig.has(id)){
   const ordered=[t.cells,rev(t.cells)].sort((a,b)=>a.join('>').localeCompare(b.join('>')))[0];
   const src=view.columns.find(x=>x.id===t.sourceId),direct=keyValues(ordered,src);
   fig.set(id,{id,kind:t.kind,sourceId:t.sourceId,cells:ordered,
    zone:zone(ordered),topology:sig(ordered),readings:uniq([direct,rev(direct.split('')).join('')]),
    headMarks:[],orientations:[],winningTurns:[]});
  }
  const f=fig.get(id),headId=t.turn+'|'+t.jurisdiction+'|'+t.fullHead;
  const label=t.cells.join('>')===f.cells.join('>')?'CANONICA':'INVERSA';
  const mark={headId,turn:t.turn,jurisdiction:t.jurisdiction,
   fullHead:t.fullHead,read:t.value,orientation:label,direction:sense(t.cells)};
  if(!f.headMarks.some(h=>JSON.stringify(h)===JSON.stringify(mark)))f.headMarks.push(mark);
  if(!f.orientations.includes(label))f.orientations.push(label);
  if(!f.winningTurns.includes(t.turn))f.winningTurns.push(t.turn);
 }
 return [...fig.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
function relationship(a,b){
 assert(a.kind===b.kind&&a.sourceId===b.sourceId);
 if(a.id===b.id)return 'MISMA_HUELLA';
 if(a.topology===b.topology)return 'MISMA_FORMA_DESPLAZADA';
 const endpointsA=[a.cells[0],a.cells[a.cells.length-1]];
 const endpointsB=[b.cells[0],b.cells[b.cells.length-1]];
 if(endpointsA.some(c=>endpointsB.includes(c)))return 'TOQUE_EN_EXTREMO';
 if(a.cells.some(c=>b.cells.includes(c)))return 'TOQUE_INTERNO';
 return 'SIN_CONTACTO';
}
function directedRelation(oldFig,newFig){
 const a=oldFig.orientations,b=newFig.orientations;
 if(!a.length||!b.length)return 'DESCONOCIDA';
 if(a.length===2||b.length===2)return 'AMBAS_DIRECCIONES_REGISTRADAS';
 return a[0]===b[0]?'MISMO_SENTIDO_CANONICO':'SOLO_SENTIDO_INVERSO';
}
function compare(source,following,fromDate,toDate,axis){
 const past=compress(source),now=compress(following),nowById=new Map(now.map(x=>[x.id,x]));
 const summary=[],relatedNew=new Set();
 for(const old of past){
  const candidates=now.filter(n=>n.kind===old.kind&&n.sourceId===old.sourceId);
  const links=candidates.map(n=>{
   const relation=relationship(old,n);
   if(relation!=='SIN_CONTACTO')relatedNew.add(n.id);
   return {id:n.id,relation,zone:n.zone,readings:n.readings,
    newHeads:n.headMarks,newWinningTurns:n.winningTurns,
    sameWinningTurn:old.winningTurns.some(t=>n.winningTurns.includes(t)),
    orientation:relation==='MISMA_HUELLA'?directedRelation(old,n):null,
    relativeOrigin:relation==='MISMA_FORMA_DESPLAZADA'?[
     point(n.cells[0])[0]-point(old.cells[0])[0],
     point(n.cells[0])[1]-point(old.cells[0])[1]
    ]:null};
  });
  const priority=CLASSES.find(c=>links.some(l=>l.relation===c))||
   (candidates.length?'SIN_CONTACTO':'SIN_FIGURA_COMPARABLE');
  const onlyStrong=links.filter(x=>x.relation===priority);
  summary.push({...old,priority,
   hasStrongWithSameWinningTurn:onlyStrong.some(x=>x.sameWinningTurn),
   strongestLinks:onlyStrong,allLinks:links});
 }
 const counts=Object.fromEntries(KINDS.map(kind=>{
  const a=summary.filter(x=>x.kind===kind);
  return [kind,{old:a.length,new:now.filter(x=>x.kind===kind).length,
   ...Object.fromEntries(CLASSES.map(cat=>[cat,a.filter(x=>x.priority===cat).length])),
   noOldContact:now.filter(x=>x.kind===kind&&!relatedNew.has(x.id)).length}];
 }));
 for(const k of KINDS)assert.equal(CLASSES.reduce((s,c)=>s+counts[k][c],0),counts[k].old);
 return {axis,fromDate,toDate,oldUnique:past.length,newUnique:now.length,
  priorityCounts:counts,old:summary,
  newWithoutAnyPhysicalRelation:now.filter(x=>!relatedNew.has(x.id)),
  newAll:now,headsBefore:source.annotations,headsAfter:following.annotations,
  boards:{old:source.columns.map(c=>({id:c.id,label:c.label,values:c.values})),
   current:following.columns.map(c=>({id:c.id,label:c.label,values:c.values}))}};
}
function physicalAvailable(col){
 const cells=[];
 for(let row=0;row<6;row++)if(/^\d{2}$/.test(col.values[row]))for(let side=0;side<2;side++)
  cells.push(row+':'+side);
 const sets=Object.fromEntries(KINDS.map(k=>[k,new Set()]));
 function walk(p){
  if(p.length>=2){const kind='vt'+p.length;sets[kind].add(stamp({kind,sourceId:col.id,cells:p}));}
  if(p.length===4)return;
  for(const next of cells){
   if(p.includes(next))continue;
   const [r,c]=point(p[p.length-1]),[nr,nc]=point(next);
   if(Math.max(Math.abs(r-nr),Math.abs(c-nc))===1)walk([...p,next]);
  }
 }
 for(const first of cells)walk([first]);
 return Object.fromEntries(KINDS.map(k=>[k,sets[k].size]));
}
function tests(){
 const cols=[{id:'prevNocturno',values:['12','34','56','78','90','12']}];
 const old={kind:'vt3',sourceId:'prevNocturno',cells:['0:0','1:0','2:1'],
  value:'136',fullHead:'7136',turn:'Previa',jurisdiction:'Ciudad'};
 validate(old,cols);
 const newReversed={...old,cells:rev(old.cells),value:'631',fullHead:'9631'};
 const a=compress({columns:cols,strokes:[old,newReversed]});
 assert.equal(a.length,1);assert.equal(a[0].headMarks.length,2);
 assert.deepEqual(a[0].orientations.sort(),['CANONICA','INVERSA']);
 assert.equal(sense(old.cells),'BAJA');assert.equal(sense(newReversed.cells),'SUBE');
 const x=compress({columns:cols,strokes:[old]})[0];
 const y=compress({columns:cols,strokes:[newReversed]})[0];
 assert.equal(relationship(x,y),'MISMA_HUELLA');
 assert.equal(directedRelation(x,y),'SOLO_SENTIDO_INVERSO');
 const step={...old,cells:['1:0','2:0','3:1'],value:'358',fullHead:'9358'};
 const moved=compress({columns:cols,strokes:[step]})[0];
 assert.equal(relationship(x,moved),'MISMA_FORMA_DESPLAZADA');
 const gone=compare({columns:cols,strokes:[old],annotations:[]},
  {columns:cols,strokes:[],annotations:[]},'2026-09-08','2026-09-15','D-7');
 assert.equal(gone.old[0].priority,'SIN_FIGURA_COMPARABLE');
 const reversed=compare({columns:cols,strokes:[old],annotations:[]},
  {columns:cols,strokes:[newReversed],annotations:[]},'2026-09-08','2026-09-15','D-7');
 assert.equal(reversed.old[0].priority,'MISMA_HUELLA');
 assert.equal(reversed.old[0].strongestLinks[0].orientation,'SOLO_SENTIDO_INVERSO');
 assert.throws(()=>validate({...old,cells:['0:0','4:0','2:1']},cols));
 assert.throws(()=>validate({...old,sourceId:'Previa'},cols));
 assert.equal(zone(['0:0','1:1']),'ARRIBA');
 assert.equal(zone(['1:0','2:1','3:0']),'ARRIBA→CENTRO');
 console.log('TEST_SEGUIMIENTO_OK: inversa, zonas, sentido ascendente, traslación, ausencia, no saltos, no cruces, todas las clases');
}
function drawSvg(board,figures,slot){
 const width=112+5*119,height=388;
 const p=(ci,cell)=>{const [r,c]=point(cell);return [86+ci*119+c*30,91+r*46]};
 const v=['<svg viewBox="0 0 '+width+' '+height+'" aria-label="Todos los recorridos de la hoja '+slot+'" role="img" xmlns="http://www.w3.org/2000/svg">'];
 for(const [i,col] of board.entries()){
  v.push('<rect x="'+(68+i*119)+'" y="31" width="104" height="315" fill="#fbf9fe" stroke="#e0d6e9" rx="8"/>');
  v.push('<text x="'+(74+i*119)+'" y="20" font-size="11" font-weight="700">'+safe(col.id)+'</text>');
  for(let r=0;r<6;r++)for(let c=0;c<2;c++){
   const [x,y]=p(i,r+':'+c);
   v.push('<rect x="'+(x-14)+'" y="'+(y-17)+'" width="29" height="34" rx="5" fill="white" stroke="#e5dded"/>');
  }
 }
 for(let r=0;r<6;r++)v.push('<text x="0" y="'+(96+r*46)+'" font-size="10">'+safe(JURS[r])+'</text>');
 for(const route of figures){
  const ci=board.findIndex(c=>c.id===route.sourceId);if(ci<0)continue;
  const d=route.cells.map((cell,k)=>{const [x,y]=p(ci,cell);return (k?'L':'M')+x+' '+y}).join(' ');
  const h=(slot==='old'?route.headMarks:route.headMarks);
  const owned=uniq(h.map(x=>x.headId)).join(',');
  const z=route.priority||'NUEVA';
  const kindColor=route.kind==='vt2'?'#c75081':route.kind==='vt3'?'#0c99a3':'#bf912e';
  v.push('<path class="stroke" data-slot="'+slot+'" data-id="'+safe(route.id)+'" data-heads="'+safe(owned)+
   '" data-priority="'+z+'" d="'+d+'" stroke="'+kindColor+'" stroke-width="3.2" opacity=".38"'+
   ' fill="none" stroke-linejoin="round" stroke-linecap="round"><title>'+
   safe(route.kind+' '+route.readings.join('/')+' · '+route.zone+' · '+z+' · '+h.map(x=>x.fullHead).join(', '))+'</title></path>');
 }
 for(const [i,col] of board.entries())for(let r=0;r<6;r++)for(let c=0;c<2;c++){
  const [x,y]=p(i,r+':'+c);
  v.push('<text x="'+x+'" y="'+(y+7)+'" font-size="19" text-anchor="middle" font-weight="700" fill="#322841">'+
   safe(/^\d{2}$/.test(col.values[r])?col.values[r][c]:'—')+'</text>');
 }
 return v.join('')+'</svg>';
}
function visual(pair){
 const old=pair.old,newF=pair.newAll;
 const oldToNew=Object.fromEntries(old.map(x=>[x.id,
  x.allLinks.filter(r=>r.relation!=='SIN_CONTACTO').map(r=>r.id)]));
 const heads=uniq(old.flatMap(x=>x.headMarks.map(h=>h.headId)));
 const choices=heads.map(h=>{
  const info=old.flatMap(x=>x.headMarks).find(x=>x.headId===h);
  const count=old.filter(x=>x.headMarks.some(z=>z.headId===h)).length;
  return '<button class="head" data-head="'+safe(h)+'">'+safe(info.turn+' · '+info.fullHead+' · '+info.jurisdiction)+
   ' ('+count+')</button>';
 }).join('');
 const headsNew=uniq(newF.flatMap(x=>x.headMarks.map(h=>h.headId)));
 const newChoices=headsNew.map(h=>{
  const info=newF.flatMap(x=>x.headMarks).find(x=>x.headId===h);
  return '<button class="head-new" data-head="'+safe(h)+'">'+safe(info.turn+' · '+info.fullHead+' · '+info.jurisdiction)+'</button>';
 }).join('');
 const stats=pair.priorityCounts;
 const options=CLASSES.map(cat=>'<button class="filter" data-category="'+cat+'">'+safe(cat.replaceAll('_',' '))+
  ' ('+KINDS.reduce((n,k)=>n+stats[k][cat],0)+')</button>').join('');
 const payload=JSON.stringify(oldToNew).replace(/</g,'\\u003c');
 const curToOld={};
 for(const x of old)for(const r of x.allLinks)if(r.relation!=='SIN_CONTACTO'){
  if(!curToOld[r.id])curToOld[r.id]=[];curToOld[r.id].push(x.id);
 }
 return '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<title>Geometría '+safe(pair.fromDate)+' → '+safe(pair.toDate)+' '+pair.axis+'</title>'+
  '<style>body{font:14px system-ui,Arial;background:#f7f5fa;color:#2f2940;margin:0;padding:14px}main{max-width:1480px;margin:auto}h1{font-size:22px}'+
  '.boards{display:grid;grid-template-columns:1fr 1fr;gap:12px}.card{background:white;border:1px solid #ded3e7;border-radius:11px;padding:12px;min-width:0}'+
  '.canvas{overflow:auto}.canvas svg{width:100%;min-width:465px}.stroke{pointer-events:none}.stroke.on{opacity:1;stroke-width:6;filter:drop-shadow(0 0 2px white)}'+
  '.stroke.dim{opacity:.1}.chips{display:flex;gap:5px;flex-wrap:wrap;max-height:185px;overflow:auto}button{border:1px solid #d1c2de;background:#fff;padding:7px;border-radius:7px;color:#543b79;cursor:pointer}button.active{background:#e9ddf6;border-color:#8751a6}'+
  '.muted{font-size:12px;color:#777084}.mini{display:flex;gap:12px;flex-wrap:wrap}'+
  '@media(max-width:900px){.boards{grid-template-columns:1fr}}</style><main>'+
  '<h1>'+safe(pair.fromDate)+' → '+safe(pair.toDate)+' · '+safe(pair.axis)+'</h1>'+
  '<p>Hojas marcadas completas. **Retrospectiva**: ninguna geometría de esta pantalla fue elegida como pronóstico antes del resultado.'+
  ' Las figuras invertidas son el mismo dibujo. Las otras rutas permanecen visibles al seleccionar.</p>'+
  '<div class="mini"><div class="card">Antes: <b>'+pair.oldUnique+'</b> figuras</div>'+
  '<div class="card">Después: <b>'+pair.newUnique+'</b></div>'+
  '<div class="card">Misma huella: <b>'+KINDS.reduce((s,k)=>s+stats[k].MISMA_HUELLA,0)+'</b></div>'+
  '<div class="card">Sin figura nueva comparable: <b>'+KINDS.reduce((s,k)=>s+stats[k].SIN_FIGURA_COMPARABLE,0)+'</b></div></div>'+
  '<div class="boards"><section class="card"><h2>Hoja anterior · todas las marcas</h2><div class="canvas">'+
  drawSvg(pair.boards.old,old,'old')+'</div></section>'+
  '<section class="card"><h2>Hoja posterior · todas las marcas</h2><div class="canvas">'+
  drawSvg(pair.boards.current,newF,'new')+'</div></section></div>'+
  '<section class="card"><h2>Seleccionar una cabeza completa de la hoja anterior</h2>'+
  '<button id="reset">Ver todo</button><div class="chips">'+choices+'</div></section>'+
  '<section class="card"><h2>O seleccionar una cabeza de la hoja posterior</h2><div class="chips">'+newChoices+'</div></section>'+
  '<section class="card"><h2>Ver la suerte de TODAS las figuras viejas, incluidas las ausentes</h2><div class="chips">'+options+'</div>'+
  '<p class="muted">En la hoja nueva se destacan todas las figuras que tienen relación física; no se interpreta «se movió» como conexión causal.</p></section>'+
  '<p><a href="index.html">Volver al atlas</a></p>'+
  '<script>const oldToNew='+payload+',newToOld='+JSON.stringify(curToOld).replace(/</g,'\\u003c')+';'+
  'const strokes=[...document.querySelectorAll("path.stroke")];const buttons=[...document.querySelectorAll("button.head,button.head-new,button.filter")];'+
  'function paint(oldIds,newIds,category,clicked){for(const el of strokes){const slot=el.dataset.slot;const id=el.dataset.id;'+
  'const yes=category?(slot==="old"&&el.dataset.priority===category):slot==="old"?oldIds.includes(id):newIds.includes(id);'+
  'el.classList.toggle("on",yes);el.classList.toggle("dim",(oldIds.length||newIds.length||category)&&!yes);}'+
  'buttons.forEach(b=>b.classList.toggle("active",b===clicked));}'+
  'for(const b of document.querySelectorAll("button.head"))b.onclick=()=>{const h=b.dataset.head;'+
  'const olds=strokes.filter(s=>s.dataset.slot==="old"&&s.dataset.heads.split(",").includes(h)).map(s=>s.dataset.id);'+
  'paint(olds,[...new Set(olds.flatMap(i=>oldToNew[i]||[]))],null,b);};'+
  'for(const b of document.querySelectorAll("button.head-new"))b.onclick=()=>{const h=b.dataset.head;'+
  'const news=strokes.filter(s=>s.dataset.slot==="new"&&s.dataset.heads.split(",").includes(h)).map(s=>s.dataset.id);'+
  'paint([...new Set(news.flatMap(i=>newToOld[i]||[]))],news,null,b);};'+
  'for(const b of document.querySelectorAll("button.filter"))b.onclick=()=>paint([],[],b.dataset.category,b);'+
  'document.getElementById("reset").onclick=()=>paint([],[],null,null);</script></main>';
}
function main(){
 tests();if(args['test-only']==='true')return;
 const names=fs.readdirSync(input).filter(x=>/^\d{4}-\d{2}-\d{2}-5-Nocturno\.json$/.test(x)).sort();
 assert.equal(names.length,20,'Esperábamos 20 hojas completas históricas 08..30/09');
 const days=names.map(x=>{
  const view=JSON.parse(fs.readFileSync(path.join(input,x),'utf8'));
  assert.equal(view.date,x.slice(0,10));assert.equal(view.closedTurn,'Nocturno');
  assert.deepEqual(view.columns.map(c=>c.id),SOURCES);
  const f=compress(view);
  return {date:view.date,view,figures:f};
 });
 const byDate=new Map(days.map(d=>[d.date,d]));
 fs.mkdirSync(out,{recursive:true});
 const cases=[],links=[];
 for(let i=1;i<days.length;i++){
  const cur=days[i],yesterday=days[i-1];
  const candidates=[['D-1',yesterday]];
  const date7=new Date(epoch(cur.date)-7*86400000).toISOString().slice(0,10);
  if(byDate.has(date7))candidates.push(['D-7',byDate.get(date7)]);
  for(const [axis,previous] of candidates){
   assert(axis!=='D-7'||epoch(cur.date)-epoch(previous.date)===7*86400000);
   const result=compare(previous.view,cur.view,previous.date,cur.date,axis);
   const fname=axis+'-'+previous.date+'-a-'+cur.date+'.html';
   fs.writeFileSync(path.join(out,fname),visual(result));
   cases.push(result);
   links.push({axis,from:previous.date,to:cur.date,url:fname});
  }
 }
 const byAxis={};
 for(const axis of ['D-1','D-7']){
  const subset=cases.filter(c=>c.axis===axis);
  const total={pairs:subset.length,allOld:subset.reduce((s,c)=>s+c.oldUnique,0),allNew:subset.reduce((s,c)=>s+c.newUnique,0)};
  for(const kind of KINDS){
   total[kind]={old:subset.reduce((s,c)=>s+c.priorityCounts[kind].old,0),
    new:subset.reduce((s,c)=>s+c.priorityCounts[kind].new,0),
    ...Object.fromEntries(CLASSES.map(cat=>[cat,subset.reduce((s,c)=>s+c.priorityCounts[kind][cat],0)])),
    newWithoutOldContact:subset.reduce((s,c)=>s+c.priorityCounts[kind].noOldContact,0)};
  }
  byAxis[axis]=total;
 }
 const direction=[];
 for(const axis of ['D-1','D-7'])for(const kind of KINDS){
  const old=cases.filter(c=>c.axis===axis).flatMap(c=>c.old.filter(x=>x.kind===kind));
  const exact=old.filter(x=>x.priority==='MISMA_HUELLA');
  const orientation=Object.fromEntries(['MISMO_SENTIDO_CANONICO','SOLO_SENTIDO_INVERSO','AMBAS_DIRECCIONES_REGISTRADAS','DESCONOCIDA'].map(v=>
   [v,exact.filter(x=>x.strongestLinks.some(l=>l.orientation===v)).length]));
  const sameTurn=exact.filter(x=>x.strongestLinks.some(l=>l.sameWinningTurn)).length;
  direction.push({axis,kind,exact:exact.length,sameWinningTurn:sameTurn,orientation});
 }
 const overview={protocol:'ATLAS_RETROSPECTIVO_ZONAS_DIRECCIONES_D7_D1_V1',
  dates:days.map(d=>d.date),byAxis,direction,
  cases:cases.map(c=>({axis:c.axis,fromDate:c.fromDate,toDate:c.toDate,
   old:c.oldUnique,new:c.newUnique,counts:c.priorityCounts})),
  noForecasts:true,originalInkValidated:false};
 fs.writeFileSync(path.join(out,'RESUMEN.json'),JSON.stringify(overview,null,2));
 fs.writeFileSync(path.join(out,'TODOS_LOS_CAMINOS_PARES_Y_NEGATIVOS.json'),JSON.stringify(cases,null,2));
 const tableRows=[];
 for(const axis of ['D-1','D-7']){
  for(const kind of KINDS){
   const r=byAxis[axis][kind];
   tableRows.push('| '+axis+' | '+kind.toUpperCase()+' | '+r.old+' | '+r.MISMA_HUELLA+' | '+
    r.MISMA_FORMA_DESPLAZADA+' | '+r.TOQUE_EN_EXTREMO+' | '+r.TOQUE_INTERNO+
    ' | '+r.SIN_CONTACTO+' | '+r.SIN_FIGURA_COMPARABLE+' |');
  }
 }
 const markdown=[
  '# Modelo Papá — Seguimiento visual de todas las huellas 08..30/09/2026','',
  '**Reconstrucción retrospectiva, sin pronósticos previos ni tinta original validada cuadro por cuadro.**',
  'No se eligió una huella por resultado. Se conservan todas las que no reaparecieron.',
  'Se compara D−7 mismo día semanal **separado** de D−1 jornada de sorteo anterior.','',
  '| Eje | VT | Viejas | Exacta | Trasladada | Toque extremo | Toque interno | Sin contacto | Sin figura comparable |',
  '|---|---|---:|---:|---:|---:|---:|---:|---:|',
  ...tableRows,'',
  '## Orientaciones de las mismas huellas que reaparecieron','',
  '| Eje | VT | Exactas | Alguna en el mismo turno ganador | Sentido marcado igual | Solo inverso | Ambas direcciones marcadas |',
  '|---|---|---:|---:|---:|---:|---:|',
  ...direction.map(d=>'| '+d.axis+' | '+d.kind.toUpperCase()+' | '+d.exact+' | '+d.sameWinningTurn+
    ' | '+d.orientation.MISMO_SENTIDO_CANONICO+' | '+d.orientation.SOLO_SENTIDO_INVERSO+
    ' | '+d.orientation.AMBAS_DIRECCIONES_REGISTRADAS+' |'),
  '','## Lectura adecuada','',
  '- Las clases son exclusivas y priorizadas por figura vieja; **el JSON conserva además TODOS los pares y rivales**, incluyendo no contacto.',
  '- Exacta significa misma ubicación y modalidad, pero no necesariamente misma lectura ni turno ganador.',
  '- Trasladada significa mismo patrón de pasos en diferente ubicación; no significa que la ruta se movió de verdad.',
  '- «Sin contacto» y «sin figura comparable» describen ausencia de **una marca confirmada** en la hoja posterior, no imposibilidad de formar un número.',
  '- Se listan todas las figuras posteriores que no tocan físicamente ninguna figura vieja del mismo VT y fuente.',
  '- Cuando distintas cabezas justifican el mismo trazo se conservan todas, pero se cuenta una sola huella.',
  '- No atribuir a esta investigación poder de predicción; no se efectuaron elecciones antes de los sorteos de septiembre.',
  '','## Archivos',
  '- index.html: enlaces a los visores de todos los pares.',
  '- D-7-*.html / D-1-*.html: doble hoja interactiva por cabeza, con rutas antiguas y posteriores simultáneamente.',
  '- TODOS_LOS_CAMINOS_PARES_Y_NEGATIVOS.json: lista exhaustiva, todos los enlaces y desapariciones.',
  '- RESUMEN.json: conteos y orientaciones.',
  ''];
 fs.writeFileSync(path.join(out,'INFORME_ATLAS_ZONAS_DIRECCIONES.md'),markdown.join('\n'));
 const groups=['D-7','D-1'].map(axis=>'<section class="panel"><h2>'+axis+
  ' · '+byAxis[axis].pairs+' pares</h2>'+links.filter(x=>x.axis===axis).map(l=>
   '<a href="'+l.url+'">'+safe(l.from+' → '+l.to)+'</a>').join('')+'</section>').join('');
 fs.writeFileSync(path.join(out,'index.html'),
  '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<title>Atlas ocular D−7 y D−1</title><style>body{font:15px system-ui;background:#f8f6fc;color:#372c45;margin:0;padding:18px}main{max-width:1000px;margin:auto}.panel{background:#fff;border:1px solid #d6cce2;padding:18px;border-radius:12px;margin-bottom:15px}.panel a{display:block;margin:7px 0;color:#683ca0;padding:8px;background:#f2ecfa;border-radius:6px}</style>'+
  '<main><h1>Atlas ocular: mismo día de la semana D−7 y jornada anterior D−1</h1>'+
  '<p>20 hojas manuscritas reconstruidas digitalmente, todas las marcas comprobadas y todas las ausencias posteriores. '+
  '<strong>Retrospectivo: no es un registro de predicciones.</strong> Tocá una cabeza antigua para ver todas sus formas y en qué se parecen a las posteriores.</p>'+
  groups+'<p><a href="INFORME_ATLAS_ZONAS_DIRECCIONES.md">Abrir informe resumido</a></p></main>');
 assert(byAxis['D-1'].pairs===19);
 assert(byAxis['D-7'].pairs>=10,'Exigir comparaciones semanales verdaderas');
 console.log('ATLAS_ZONAS_DIR_COMPLETO '+JSON.stringify({dates:days.length,
  byAxis,direction,views:cases.length}));
}
main();
