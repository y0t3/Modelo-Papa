// Modelo Papá — lámina visual INTERACTIVA de hoja +11, DESPUÉS del sorteo.
// Parte EXCLUSIVAMENTE de las coincidencias de cabeza conocidas VT2/VT3/VT4.
// NO enumera formas en grilla vacía, NO genera ni rankea candidatos futuros.
import {TURNOS,JURS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import {reconstructMarkedSheetAfterDraw7D} from './markedSheetAfterDraw7d';
import type {MarcadoModalidad} from './markedSheetAfterDraw7d';

export type VisualHeadAnnotation7D={
 id:string;turn:Turno;jurisdiction:string;fullHead:string;
 modalities:MarcadoModalidad[];traceCount:number;
};
export type VisualStroke7D={
 headId:string;turn:Turno;jurisdiction:string;fullHead:string;
 kind:MarcadoModalidad;value:string;sourceId:SourceId;cells:string[];
};
export type VisualMarkedSheet7D={
 protocol:'HOJA_MARCADA_VISUAL_COMPLETA_V1';date:string;
 closedTurn:Turno;phase:'POSTERIOR_AL_SORTEO';
 columns:Array<{id:SourceId;label:string;values:string[];newSinceDraw:boolean}>;
 annotations:VisualHeadAnnotation7D[];strokes:VisualStroke7D[];
 unmatchedByTurn:Array<{turn:Turno;count:number}>;
 totals:{heads:number;strokes:number;vt2:number;vt3:number;vt4:number};
 notes:string[];
};
const escaped=(x:string)=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;')
 .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const headKey=(turn:Turno,j:string,head:string)=>[turn,j,head].join('|');
export function buildVisualMarkedSheet7D(sheet:DailySheet,date:string,
 closedTurn:Turno):VisualMarkedSheet7D{
 const marked=reconstructMarkedSheetAfterDraw7D(sheet,date,closedTurn);
 const last=TURNOS.indexOf(closedTurn);
 const columns=sheet.columns.slice(0,Math.min(5,last+2)).map((col,i)=>({
  id:col.id,label:col.sourceLabel,values:[...col.values],
  newSinceDraw:i===last+1
 }));
 const annotations:VisualHeadAnnotation7D[]=[],strokes:VisualStroke7D[]=[];
 for(const group of marked.annotationByTurn){
  for(const head of group.headsBelow){
   const id=headKey(group.turn,head.jurisdiction,head.head);
   const modalities=[...new Set(head.traces.map(x=>x.kind))];
   annotations.push({id,turn:group.turn,jurisdiction:head.jurisdiction,
    fullHead:head.head,modalities,traceCount:head.traces.length});
   for(const trace of head.traces){
    if(!columns.some(c=>c.id===trace.sourceId&&!c.newSinceDraw))
     throw Error('Un trazo no puede ocupar una columna todavía inexistente al sortear');
    strokes.push({headId:id,turn:group.turn,jurisdiction:head.jurisdiction,
     fullHead:head.head,kind:trace.kind,value:trace.value,
     sourceId:trace.sourceId,cells:[...trace.cells]});
   }
  }
 }
 const counts=(kind:MarcadoModalidad)=>strokes.filter(s=>s.kind===kind).length;
 return {protocol:'HOJA_MARCADA_VISUAL_COMPLETA_V1',date,closedTurn,
  phase:'POSTERIOR_AL_SORTEO',columns,annotations,strokes,
  unmatchedByTurn:marked.annotationByTurn.map(x=>({
   turn:x.turn,count:x.unmatchedHeads.length})),
  totals:{heads:annotations.length,strokes:strokes.length,
   vt2:counts('vt2'),vt3:counts('vt3'),vt4:counts('vt4')},
  notes:[
   'Las cabezas ya habían salido: se buscan TODAS las coincidencias VT2, VT3 y VT4 en las columnas +11 que existían antes de cada sorteo.',
   'La cabeza COMPLETA se anota debajo, una vez por jurisdicción/turno, aunque produzca muchos recorridos y modalidades.',
   'La última columna de la vista, cuando aparece punteada, se incorporó tras el último sorteo y todavía NO puede justificar esa cabeza.',
   'Todos los trazos de cada coincidencia permanecen en una única columna; se dibujan encima de las cifras reales de esa tabla.',
   'El sentido de un trazo indica el orden de cifras de la terminación encontrada, NO afirma que exista una flecha manuscrita en la foto.',
   'Esta hoja reconstruida es el PUNTO DE PARTIDA de la interpretación visual. No predice números ni ordena candidatos.'
  ]};
}
const pos=(sourceIndex:number,cell:string)=>{
 const [row,side]=cell.split(':').map(Number);
 if(!Number.isInteger(row)||row<0||row>=6||side!==0&&side!==1)
  throw Error('Celda fuera del tablero 6x2');
 return {x:100+sourceIndex*146+side*38,y:124+row*52};
};
/** HTML autocontenido (sin librerías, redes ni CDN) para abrir en un navegador.
 * El selector no elige pronósticos: sólo ilumina caminos YA marcados después
 * del sorteo. Por defecto muestra todas las cabezas y todas las modalidades.
 */
export function renderVisualMarkedSheetHTML7D(view:VisualMarkedSheet7D):string{
 const width=170+view.columns.length*146,height=508;
 const labels=view.columns.map((c,i)=>{
  const x=78+i*146;
  return '<g class="column-head">'+
   '<text x="'+x+'" y="46" font-size="13" font-weight="700">'+escaped(c.label)+'</text>'+
   (c.newSinceDraw?'<text x="'+x+'" y="65" font-size="11" fill="#9a5b11">Nueva: turno siguiente</text>':'')+
   '</g>';
 }).join('');
 const board=view.columns.map((c,i)=>{
  const x=79+i*146;
  const bg='<rect x="'+(x-13)+'" y="90" width="128" height="333" rx="8" fill="'+
   (c.newSinceDraw?'#fff8ec':'#faf9ff')+'" stroke="'+
   (c.newSinceDraw?'#cb9345':'#c8c3da')+'" '+(c.newSinceDraw?'stroke-dasharray="6 5"':'')+'/>';
  const cells=c.values.flatMap((v,row)=>[0,1].map(side=>{
   const center=pos(i,row+':'+side);
   const glyph=/^\d{2}$/.test(v)?v[side]:'—';
   return '<rect x="'+(center.x-16)+'" y="'+(center.y-19)+
    '" width="32" height="38" rx="5" fill="white" stroke="#ddd9e9"/>'+
    '<text x="'+center.x+'" y="'+(center.y+7)+'" text-anchor="middle" class="digit">'+
    escaped(glyph)+'</text>';
  })).join('');
  return bg+cells;
 }).join('');
 const strokes=view.strokes.map((trace,index)=>{
  const source=view.columns.findIndex(x=>x.id===trace.sourceId);
  if(source<0)throw Error('No se puede dibujar un origen oculto');
  const centers=trace.cells.map(c=>pos(source,c));
  const d=centers.map((p,j)=>(j===0?'M':'L')+p.x+' '+p.y).join(' ');
  const kindLabel=trace.kind.toUpperCase(),id=escaped(trace.headId);
  return '<g class="trazo" data-head="'+id+'" data-kind="'+trace.kind+
   '" aria-label="'+escaped(kindLabel+' '+trace.value+' de cabeza '+trace.fullHead)+
   '"><title>'+escaped(trace.turn+' '+trace.jurisdiction+': '+trace.fullHead+
    ' → '+kindLabel+' '+trace.value+' ('+trace.sourceId+': '+trace.cells.join(' → ')+')')+
   '</title><path d="'+d+'" fill="none" stroke="currentColor" stroke-width="5" '+
   'stroke-linecap="round" stroke-linejoin="round"/>'+
   '<circle cx="'+centers[0].x+'" cy="'+centers[0].y+
   '" r="6" fill="white" stroke="currentColor" stroke-width="3"/>'+
   '<circle cx="'+centers[centers.length-1].x+'" cy="'+centers[centers.length-1].y+
   '" r="3" fill="currentColor"/></g>';
 }).join('');
 const groups=TURNOS.slice(0,TURNOS.indexOf(view.closedTurn)+1).map(turn=>{
  const heads=view.annotations.filter(h=>h.turn===turn);
  return '<section class="head-group"><h3>'+escaped(turn)+'</h3>'+
   (heads.length?heads.map(h=>'<button type="button" class="head-chip" data-filter="'+
    escaped(h.id)+'" aria-pressed="false"><span class="head-number">'+
    escaped(h.fullHead)+'</span><small>'+escaped(h.jurisdiction)+' · '+
    h.modalities.map(k=>k.toUpperCase()).join('/')+' · '+h.traceCount+' recorridos</small>'+
    '</button>').join(''):'<p class="empty">Sin cabezas coincidentes</p>')+
   '</section>';
 }).join('');
 return '<!doctype html><html lang="es"><head><meta charset="utf-8"/>'+
  '<meta name="viewport" content="width=device-width,initial-scale=1"/>'+
  '<title>Hoja +11 marcada · '+escaped(view.date)+' · '+escaped(view.closedTurn)+'</title>'+
  '<style>body{font-family:system-ui,Arial,sans-serif;color:#29243c;background:#f8f7fb;margin:0;padding:20px}'+
  'main{max-width:1100px;margin:auto}h1{font-size:24px;margin-bottom:8px}.sub{color:#605976}'+
  '.board{overflow-x:auto;background:white;padding:14px;border:1px solid #ddd8e8;border-radius:12px}'+
  'svg{min-width:470px;display:block;margin:auto}.digit{font:600 22px system-ui;fill:#24203a}'+
  '.column-head{text-anchor:start;fill:#392f60}.trazo{opacity:.19;pointer-events:none}'+
  '.trazo[data-kind="vt2"]{color:#078778}.trazo[data-kind="vt3"]{color:#7540d5}'+
  '.trazo[data-kind="vt4"]{color:#d68a22}.trazo.active{opacity:.97;stroke-width:6}'+
  '.head-group{margin-top:16px;border-top:1px solid #ddd8e8;padding-top:8px}'+
  '.head-chip{display:inline-flex;flex-direction:column;gap:2px;cursor:pointer;border:1px solid #d8d1e6;'+
  'border-radius:8px;background:white;margin:4px;padding:7px 11px;text-align:left;color:inherit}'+
  '.head-chip[aria-pressed="true"]{border:2px solid #7540d5;background:#f0ebfc}'+
  '.head-number{font-weight:700;font-size:17px}small,.empty{color:#686178}'+
  '.controls{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin:18px 0}'+
  'button.reset{padding:8px 14px;border:1px solid #bfb7d8;border-radius:7px;background:white;cursor:pointer}'+
  '.help{line-height:1.55;color:#52496a;font-size:14px}'+
  '.stats{font-size:14px;color:#514a61;margin-top:12px}label{white-space:nowrap}'+
  '</style></head><body><main>'+
  '<h1>Hoja +11 marcada · '+escaped(view.date)+'</h1><p class="sub">Después de '+escaped(view.closedTurn)+
  ' · Cabezas YA sorteadas → coincidencias VT2, VT3, VT4 → recorridos marcados</p>'+
  '<div class="controls"><button class="reset" id="show-all" type="button">Ver todas las marcas</button>'+
  '<label><input type="checkbox" data-kind-filter="vt2" checked/> VT2</label>'+
  '<label><input type="checkbox" data-kind-filter="vt3" checked/> VT3</label>'+
  '<label><input type="checkbox" data-kind-filter="vt4" checked/> VT4</label>'+
  '</div><div class="board"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+
  width+' '+height+'" width="'+width+'" role="img" aria-label="Columnas +11 con cifras y recorridos coincidentes">'+
  labels+board+strokes+
  '<text x="70" y="463" fill="#756d84" font-size="12">Las líneas unen dígitos de una sola columna. Los colores distinguen VT2, VT3 y VT4.</text>'+
  '</svg></div><p class="stats">Cabezas completas anotadas abajo: <strong>'+
  view.totals.heads+'</strong> · Recorridos: <strong>'+view.totals.strokes+
  '</strong> · VT2 '+view.totals.vt2+' / VT3 '+view.totals.vt3+' / VT4 '+view.totals.vt4+'</p>'+
  '<h2>Cabezas completas coincidentes — debajo de la hoja</h2><p class="help">'+
  'Tocá una cabeza para aislar sus recorridos. Esto NO elige un pronóstico: sólo muestra las marcas históricas.</p>'+
  groups+
  '<p class="help"><strong>Importante:</strong> la columna punteada, si aparece, se agregó '+
  'después del turno y sólo podrá utilizarse en el siguiente. Cada cabeza se buscó exclusivamente '+
  'en columnas disponibles antes de su sorteo. La hoja es retrospectiva; no hay predicciones aquí.</p>'+
  '</main><script>(function(){const strokes=[...document.querySelectorAll(".trazo")];'+
  'const chips=[...document.querySelectorAll(".head-chip")];'+
  'const toggles=[...document.querySelectorAll("[data-kind-filter]")];let selected=null;'+
  'function paint(){const enabled=new Set(toggles.filter(x=>x.checked).map(x=>x.dataset.kindFilter));'+
  'for(const s of strokes){const on=enabled.has(s.dataset.kind)&&(!selected||s.dataset.head===selected);'+
  's.style.display=on?"":"none";s.classList.toggle("active",!!selected&&on)}'+
  'for(const b of chips)b.setAttribute("aria-pressed",String(b.dataset.filter===selected))}'+
  'for(const b of chips)b.addEventListener("click",()=>{selected=selected===b.dataset.filter?null:b.dataset.filter;paint()});'+
  'for(const box of toggles)box.addEventListener("change",paint);'+
  'document.getElementById("show-all").addEventListener("click",()=>{selected=null;paint()});'+
  'paint()})();</script></body></html>';
}
