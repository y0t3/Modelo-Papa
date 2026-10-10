// CUADERNO OCULAR COMPARATIVO — sólo datos PRE objetivo.
(function(){
'use strict';
const data=JSON.parse(document.getElementById('cut-data').textContent);
const cut=data.cut,digest=data.digest;
const $=id=>document.getElementById(id),SVG='http://www.w3.org/2000/svg';
const uniq=a=>[...new Set(a)],reverse=s=>[...s].reverse().join('');
const canonical=c=>[c.join('>'),[...c].reverse().join('>')].sort()[0];
const idOf=t=>t.kind+'|'+t.sourceId+'|'+canonical(t.cells);
const columns=new Map(cut.columns.map((c,i)=>[c.id,{...c,index:i}]));
const positions=(i,c)=>{const [r,s]=c.split(':').map(Number);return {x:98+i*134+37*s,y:96+49*r}};
const traces=[
 ...cut.inherited.map(t=>({t,source:'D-1'})),
 ...(cut.d7Inherited||[]).map(t=>({t,source:'D-7'}))
];
const all=new Map();
for(const {t,source} of traces){
 const col=columns.get(t.sourceId);
 if(!col)throw Error('Huella heredada en columna no visible');
 const value=t.cells.map(p=>{const [r,s]=p.split(':').map(Number);return col.values[r]?.[s]}).join('');
 if(!/^[0-9]{2,4}$/.test(value)||value.length!==t.cells.length)throw Error('Lectura inválida en tablero');
 const key=idOf(t);
 if(!all.has(key)){
  all.set(key,{id:key,kind:t.kind,sourceId:t.sourceId,cells:[...t.cells],
   direct:value,inverse:reverse(value),heads:[],historicSources:[]});
 }
 const a=all.get(key);
 const head=source+' | '+t.turn+' | '+t.jurisdiction+' | '+t.fullHead;
 if(!a.heads.includes(head))a.heads.push(head);
 if(!a.historicSources.includes(source))a.historicSources.push(source);
}
const paths=[...all.values()].sort((a,b)=>a.kind.localeCompare(b.kind)||
 a.sourceId.localeCompare(b.sourceId)||a.id.localeCompare(b.id));
const byId=new Map(paths.map(p=>[p.id,p])),selected=[];
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[ch]);
const place=(tag,attrs={},txt)=>{
 const node=document.createElementNS(SVG,tag);
 for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));
 if(txt!==undefined)node.textContent=txt;
 return node;
};
function showBoard(){
 const board=$('board'),w=155+134*cut.columns.length;
 board.setAttribute('viewBox','0 0 '+w+' 412');board.setAttribute('width',w);
 const labels=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
 for(const [i,c] of cut.columns.entries()){
  board.appendChild(place('text',{x:85+i*134,y:30,'font-size':12,'font-weight':'bold'},c.label||c.id));
  for(let r=0;r<6;r++)for(let s=0;s<2;s++){
   const p=positions(i,r+':'+s),value=c.values[r]||'--',dig=/^\d{2}$/.test(value)?value[s]:'—';
   board.appendChild(place('rect',{x:p.x-17,y:p.y-20,width:34,height:40,rx:4,fill:'#fff',stroke:'#ddd0e9'}));
   board.appendChild(place('text',{x:p.x,y:p.y+7,'text-anchor':'middle','font-size':20,fill:'#26203c'},dig));
  }
 }
 labels.forEach((v,i)=>board.appendChild(place('text',{x:2,y:100+i*49,'font-size':10},v)));
 const stroke=(t,color,wide,dash,label)=>{
  const col=columns.get(t.sourceId);if(!col)return;
  const pts=t.cells.map(p=>positions(col.index,p));
  const line=place('polyline',{points:pts.map(p=>p.x+','+p.y).join(' '),
   stroke:color,'stroke-width':wide,'stroke-linejoin':'round',
   'stroke-linecap':'round',fill:'none',opacity:'.42',
   'stroke-dasharray':dash||'',class:label||''});
  board.appendChild(line);
 };
 for(const p of paths)stroke(p,'#8a51b9',2,'5 3','inherited');
 for(const p of cut.knownToday)stroke(p,'#0b8c71',4,'','known');
 window.paintSelection=()=>{
  board.querySelectorAll('.highlight').forEach(x=>x.remove());
  const id=$('path').value;
  if(!byId.has(id))return;
  stroke(byId.get(id),'#dd4978',6,'','highlight');
 };
 window.paintSelection();
}
function option(p){
 return p.kind.toUpperCase()+' · '+p.sourceId+' · '+p.cells.join('→')+
  ' · '+p.direct+'/'+p.inverse+' · '+p.historicSources.join('+')+
  ' · '+p.heads.length+' cabeza(s)';
}
function populate(){
 const list=$('path'),rival=$('rival');
 const empty=(node,label)=>{const o=document.createElement('option');o.value='';
  o.textContent=label;node.appendChild(o)};
 empty(list,'Seleccioná un recorrido marcado previo');
 empty(rival,'Seleccioná una alternativa rival');
 for(const p of paths){
  for(const node of [list,rival]){
   const o=document.createElement('option');o.value=p.id;o.textContent=option(p);
   node.appendChild(o);
  }
 }
 const lone=document.createElement('option');lone.value='SIN_ALTERNATIVA_VISIBLE';
 lone.textContent='No hay otra huella disponible en este corte';
 rival.appendChild(lone);
 $('all-count').textContent=paths.length+' huellas únicas disponibles; '+
  cut.inherited.length+' anotaciones heredadas D−1 y '+
  (cut.d7Inherited||[]).length+' anotaciones D−7. Una figura y su inversa cuentan UNA sola.';
}
function refresh(){
 const p=byId.get($('path').value),r=byId.get($('rival').value);
 $('head-proof').textContent=p?'Cabezas previas que marcaron esta geometría: '+p.heads.join(' · '):
 'Seleccioná una huella para ver todas sus cabezas históricas.';
 $('read-preview').textContent=p?('Lectura elegida: '+($('direction').value==='inversa'?p.inverse:p.direct)+
  ' · alternativa de orientación '+($('direction').value==='inversa'?p.direct:p.inverse)):'';
 $('rival-preview').textContent=r?'Alternativa visible: '+r.kind.toUpperCase()+' '+r.direct+'/'+r.inverse+
  ' · '+r.sourceId+' · '+r.cells.join('→'):'';
 if(typeof window.paintSelection==='function')window.paintSelection();
}
function drawSelected(){
 $('entries').innerHTML='';
 for(const [i,c] of selected.entries()){
  const box=document.createElement('div');box.className='entry';
  const descr=(i+1)+'. '+c.kind.toUpperCase()+' '+c.value+' ('+c.direction+') · '+c.sourceId+
   ' · '+c.cells.join('→')+' · rival '+c.rivalPathId;
  const title=document.createElement('strong');title.textContent=descr;
  const p=document.createElement('p');p.textContent='Justificación: '+c.reason+
   ' / Contraargumento: '+c.rivalReason;
  const remove=document.createElement('button');remove.type='button';remove.textContent='Quitar esta hipótesis';
  remove.onclick=()=>{selected.splice(i,1);drawSelected()};
  box.append(title,p,remove);$('entries').appendChild(box);
 }
 $('counter').textContent=selected.length+' de 3 hipótesis comparativas registradas';
}
function message(s){$('message').textContent=s}
function validText(s){return typeof s==='string'&&s.trim().length>=16}
function toggle(){
 const abstain=$('abstain').checked;
 $('hypothesis-panel').hidden=abstain;
 $('abstention-panel').hidden=!abstain;
}
$('abstain').onchange=toggle;
$('hypothesis').onchange=toggle;
$('path').onchange=refresh;
$('direction').onchange=refresh;
$('rival').onchange=refresh;
$('add').onclick=()=>{
 if(selected.length>=3)return message('Máximo tres hipótesis. También podés abstenerte.');
 const p=byId.get($('path').value),rival=$('rival').value;
 const reason=$('reason').value.trim(),rivalReason=$('rival-reason').value.trim();
 if(!p)return message('Primero elegí una huella heredada verificable.');
 if(!validText(reason)||!validText(rivalReason))
  return message('Explicá la preferencia Y la comparación rival en al menos 16 caracteres cada una.');
 if(!rival)return message('Elegí una alternativa rival visible o declarala ausente.');
 if(rival===p.id)return message('La misma huella no cuenta como rival.');
 if(rival==='SIN_ALTERNATIVA_VISIBLE'&&paths.length>1)
  return message('Hay otras huellas visibles; seleccioná al menos una como rival.');
 if(rival!=='SIN_ALTERNATIVA_VISIBLE'&&!byId.has(rival))
  return message('La alternativa no existe en la hoja.');
 if(selected.some(c=>c.pathId===p.id))return message('Esa figura ya está registrada: invertirla no crea otra.');
 const direction=$('direction').value;
 const cells=direction==='inversa'?[...p.cells].reverse():[...p.cells];
 selected.push({pathId:p.id,kind:p.kind,sourceId:p.sourceId,cells,
  direction,value:direction==='inversa'?p.inverse:p.direct,
  otherReading:direction==='inversa'?p.direct:p.inverse,
  historicHeads:[...p.heads],historicSources:[...p.historicSources],
  rivalPathId:rival,reason,rivalReason});
 $('reason').value='';$('rival-reason').value='';drawSelected();
 message('Hipótesis registrada. Podés revisar otras figuras antes de exportar.');
};
$('save').onclick=()=>{
 const abstain=$('abstain').checked;
 const why=$('abstain-reason').value.trim();
 if(abstain&&!validText(why))return message('Explicá visualmente por qué ninguna figura se distingue.');
 if(!abstain&&!selected.length)return message('Registrá una huella o elegí OBSERVAR / NO JUGAR.');
 const file={
  protocol:'CUADERNO_OCULAR_COMPARATIVO_V1',
  trial:'REPLAY_HISTORICO_NO_PROSPECTIVO',
  date:cut.date,target:cut.target,priorDate:cut.priorDate,
  d7Date:cut.d7Date||null,availableSources:cut.columns.map(x=>x.id),
  sourceDigest:digest,createdLocalAt:new Date().toISOString(),
  mode:abstain?'OBSERVAR_NO_JUGAR':'HIPOTESIS_VISUAL',
  abstentionReason:abstain?why:null,
  candidates:abstain?[]:selected,
  hasTargetResult:false,
  proof:'La fecha local no certifica anterioridad; para un ensayo real, publicar el registro antes del sorteo mediante commit verificable.'
 };
 const blob=new Blob([JSON.stringify(file,null,2)],{type:'application/json'});
 const link=document.createElement('a');link.href=URL.createObjectURL(blob);
 link.download='CUADERNO-'+cut.date+'-ANTES-'+cut.target+'.json';
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(link.href),1000);
 message('JSON exportado: conservá también el corte fuente para verificarlo. Esto sigue siendo replay histórico.');
};
populate();showBoard();toggle();refresh();drawSelected();
})();