// Offline blind replay viewer. Does not load target-day heads or any network data.
(function(){
'use strict';
const q=s=>document.querySelector(s),qa=s=>Array.from(document.querySelectorAll(s));
const data=JSON.parse(q('#cut-data').textContent);
const ns='http://www.w3.org/2000/svg',board=q('#board'),working=[],chosen=[];
const traces=[...data.inherited.map((t,i)=>({trace:t,layer:'past',id:'past'+i})),
 ...data.knownToday.map((t,i)=>({trace:t,layer:'known',id:'known'+i})),
 ...data.d7Inherited.map((t,i)=>({trace:t,layer:'d7',id:'d7'+i}))];
const order=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const colors={past:'#8150d1',known:'#0d9884',d7:'#d19a2b'};
const sourceIndex=new Map(data.columns.map((c,i)=>[c.id,i]));
const el=(name,attrs={},content)=>{
 const node=document.createElementNS(ns,name);
 for(const [key,value]of Object.entries(attrs))node.setAttribute(key,String(value));
 if(content!==undefined)node.textContent=content;
 return node;
};
const pos=(index,cell)=>{
 const [r,s]=cell.split(':').map(Number);
 return {x:96+index*134+s*38,y:96+r*48};
};
const L=id=>document.getElementById(id);
const warn=message=>{L('status').textContent=message;};
function addLabel(x,y,value,attrs={}){
 board.appendChild(el('text',{x,y,'font-size':'11',fill:'#4f435f',...attrs},value));
}
function renderBoard(){
 const width=135+134*data.columns.length;
 board.setAttribute('viewBox','0 0 '+width+' 408');
 board.setAttribute('width',width);board.setAttribute('height',408);
 data.columns.forEach((col,i)=>{
  addLabel(83+i*134,28,col.label||col.id,{'font-weight':'700'});
  for(let r=0;r<6;r++)for(let s=0;s<2;s++){
   const cell=r+':'+s,loc=pos(i,cell),row=col.values[r]||'--';
   const digit=/^\d{2}$/.test(row)?row[s]:'—';
   const group=el('g',{'class':'spot','data-source':col.id,'data-cell':cell,
     'data-digit':digit,'data-x':loc.x,'data-y':loc.y});
   group.appendChild(el('rect',{x:loc.x-18,y:loc.y-19,width:37,height:38,
    rx:5,fill:'#fff',stroke:'#d3cbdc','stroke-width':1}));
   group.appendChild(el('text',{x:loc.x,y:loc.y+7,'font-size':22,
    'font-weight':650,'text-anchor':'middle',fill:'#261d33'},digit));
   board.appendChild(group);
  }
 });
 order.forEach((jur,r)=>addLabel(3,100+r*48,jur,{'font-size':10}));
 for(const item of traces){
  const col=sourceIndex.get(item.trace.sourceId);
  if(col===undefined)throw Error('Recorrido fuera del tablero visible');
  const points=item.trace.cells.map(c=>pos(col,c));
  const path=el('path',{'class':'trace','data-kind':item.trace.kind,
   'data-layer':item.layer,'data-id':item.id,
   d:points.map((c,i)=>(i===0?'M':'L')+c.x+' '+c.y).join(' '),
   fill:'none',stroke:colors[item.layer],'stroke-width':4,
   'stroke-dasharray':item.layer==='known'?'':'5 4',
   'stroke-linecap':'round','stroke-linejoin':'round',
   'pointer-events':'none'});
  path.appendChild(el('title',{},item.trace.fullHead+' · '+item.trace.kind+
   ' '+item.trace.value+' · '+item.trace.sourceId+' · '+item.trace.cells.join('→')));
  board.appendChild(path);
 }
 const manual=el('polyline',{id:'manualPath',fill:'none',stroke:'#e0507b',
  'stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round',
  'pointer-events':'none'});
 board.appendChild(manual);
 for(const item of traces){
  const t=item.trace,opt=document.createElement('option');
  opt.value=item.id;opt.textContent=(item.layer==='past'?'Ayer':
   item.layer==='known'?'Hoy':'D−7')+' · '+t.fullHead+' · '+t.turn+' · '+
   t.kind.toUpperCase()+' · '+t.sourceId+' · '+t.cells.join('→')+
   (t.todayReading?' · ahora '+t.todayReading:'');
  L('focus').appendChild(opt);
 }
 L('count').textContent=data.inherited.length+' rutas históricas heredadas, '+
  data.knownToday.length+' marcas comprobadas hoy, '+data.columns.length+
  ' columnas disponibles'+(data.d7Date?', memoria D−7 opcional de '+data.d7Date:'');
}
function paint(){
 const visibleLayers=new Set(qa('[data-layer]:checked').map(x=>x.dataset.layer));
 const visibleKinds=new Set(qa('[data-kind]:checked').map(x=>x.dataset.kind));
 const highlighted=L('focus').value;
 for(const path of qa('.trace')){
  const on=visibleLayers.has(path.dataset.layer)&&visibleKinds.has(path.dataset.kind);
  path.style.display=on?'':'none';
  path.style.opacity=!on?'0':highlighted?(path.dataset.id===highlighted?'1':'0.045'):
   path.dataset.layer==='known'?'0.78':'0.29';
  path.setAttribute('stroke-width',highlighted&&path.dataset.id===highlighted?'7':'4');
 }
 for(const group of qa('.spot')){
  const selected=working.some(v=>v.cell===group.dataset.cell&&v.sourceId===group.dataset.source);
  group.querySelector('rect').setAttribute('fill',selected?'#ffe6f0':'#fff');
  group.querySelector('rect').setAttribute('stroke',selected?'#e0507b':'#d3cbdc');
  group.querySelector('rect').setAttribute('stroke-width',selected?'3':'1');
 }
 L('manualPath').setAttribute('points',working.map(v=>v.x+','+v.y).join(' '));
 L('route').textContent=working.length?'Trazo manual: '+
  working.map(v=>v.digit).join('')+' · origen '+working[0].sourceId+
  ' · '+working.map(v=>v.cell).join(' → '):'Trazo manual: vacío';
}
board.addEventListener('click',function(event){
 const spot=event.target.closest('.spot');if(!spot)return;
 const {source:sourceId,cell,digit}=spot.dataset;
 if(!/^\d$/.test(digit))return warn('No se puede utilizar una celda vacía');
 if(working.length>=4)return warn('La formación puede tener como máximo cuatro cifras');
 if(working.some(x=>x.cell===cell&&x.sourceId===sourceId))
  return warn('Una ruta no puede repetir una misma celda');
 if(working.length){
  const last=working[working.length-1];
  if(last.sourceId!==sourceId)return warn('Una ruta no puede cruzar columnas de turno');
  const [r,s]=last.cell.split(':').map(Number),[nr,ns]=cell.split(':').map(Number);
  if(Math.abs(r-nr)>1||Math.abs(s-ns)>1)
   return warn('Se exige contacto físico horizontal, vertical o diagonal sin saltos');
 }
 working.push({sourceId,cell,digit,x:+spot.dataset.x,y:+spot.dataset.y});
 warn('');paint();
});
L('clear').addEventListener('click',()=>{working.length=0;warn('');paint();});
L('add').addEventListener('click',()=>{
 if(working.length<2)return warn('Dibujá entre dos y cuatro cifras para registrar la hipótesis');
 if(chosen.length>=3)return warn('Se permiten hasta tres hipótesis manuales, o ninguna');
 const reason=L('reason').value.trim();
 if(reason.length<12)return warn('Explicá visualmente por qué preferís esta ruta frente a otras');
 const c={kind:'vt'+working.length,value:working.map(x=>x.digit).join(''),
  sourceId:working[0].sourceId,cells:working.map(x=>x.cell),reason};
 if(chosen.some(x=>x.kind===c.kind&&x.sourceId===c.sourceId&&
  x.cells.join('>')===c.cells.join('>')))return warn('Esa ruta ya está registrada');
 chosen.push(c);working.length=0;L('reason').value='';
 const line=document.createElement('p');line.className='candidate';
 line.textContent=chosen.length+'. '+c.kind.toUpperCase()+' '+c.value+' · '+
   c.sourceId+' · '+c.cells.join(' → ')+' · '+reason;
 L('candidates').appendChild(line);
 warn('Hipótesis anotada: falta exportar el archivo JSON');paint();
});
L('save').addEventListener('click',()=>{
 const abstain=chosen.length===0,reason=L('reason').value.trim();
 if(abstain&&reason.length<12)
  return warn('Si elegís observar/no jugar, registrá por qué no hay una figura preferente');
 const record={protocol:data.protocol,kind:'REPLAY_RETROSPECTIVO_NO_PROSPECTIVO',
  date:data.date,target:data.target,priorDate:data.priorDate,
  availableSources:data.columns.map(c=>c.id),registeredLocalAt:new Date().toISOString(),
  abstain,candidates:chosen,abstentionReason:abstain?reason:null,
  hasTargetDrawResults:false,seal:'ARCHIVO_LOCAL_NO_CERTIFICA_FECHA_PREVIA'};
 const blob=new Blob([JSON.stringify(record,null,2)],{type:'application/json'});
 const a=document.createElement('a'),url=URL.createObjectURL(blob);
 a.href=url;a.download='EXAMEN-'+data.date+'-ANTES-'+data.target+'.json';
 a.click();URL.revokeObjectURL(url);
 warn('Registro local exportado. No cambies la decisión después de consultar los resultados.');
});
qa('.controls input').forEach(x=>x.addEventListener('change',paint));
L('focus').addEventListener('change',paint);
renderBoard();paint();
})();
