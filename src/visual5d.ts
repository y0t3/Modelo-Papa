// ANÁLISIS Visual 5D: extensión experimental, independiente del motor semanal.
// Entradas: cinco jornadas YA sorteadas, de la más antigua a la más reciente.
// La fecha/turno objetivo NO se utiliza para construir candidatos.
import type {DailySheet, SourceId} from './sheet';
import type {Turno} from './domain';
import {TURNOS} from './domain';
import {findPaths} from './paths';
import type {Path} from './paths';

type Trace={day:number;turn:Turno;sourceId:SourceId;signature:string;path:Path;head:string;value:string};
export type Visual5DCandidate={value:string;sourceId:SourceId;sourceTurn:string;path:Path;days:number;transitions:number;lastSeen:number;traces:number};
export type Visual5DResult={target:Turno;decision:'TOP 3'|'TOP 5'|'OBSERVAR'|'NO JUGAR';candidates:Visual5DCandidate[];historyDays:number;reason:string;experimental:true};

export const shape=(p:Path)=>p.slice(1).map((c,i)=>[c.row-p[i].row,c.col-p[i].col].join(',')).join(';');
const key=(p:Path)=>p.map(c=>c.row+','+c.col).join('>');
const toMoves=(signature:string):[number,number][]=>
 signature.split(';').filter(Boolean).map(s=>{const [r,c]=s.split(',').map(Number);return [r,c]});
function project(values:string[],signature:string):Path[]{
 const moves=toMoves(signature),out:Path[]=[];
 if(moves.length!==2)return out;
 for(let r=0;r<values.length;r++)for(let c=0;c<2;c++){
  if(!/^\d{2}$/.test(values[r]))continue;
  const pos:[[number,number]]=[[r,c]];
  let rr=r,cc=c,valid=true;
  for(const [dr,dc] of moves){
   rr+=dr;cc+=dc;
   if(rr<0||rr>=values.length||cc<0||cc>1||!/^\d{2}$/.test(values[rr])||pos.some(([a,b])=>a===rr&&b===cc)){valid=false;break}
   pos.push([rr,cc]);
  }
  if(valid)out.push(pos.map(([a,b])=>({row:a,col:b,digit:values[a][b]})));
 }
 return out;
}
function confirmedTraces(history:DailySheet[],target:Turno,includesCurrent=false):Trace[]{
 const ti=TURNOS.indexOf(target),out:Trace[]=[];
 history.forEach((day,dayIndex)=>{
  for(const turn of TURNOS.slice(0,includesCurrent&&dayIndex===history.length-1?ti:TURNOS.length)){
   for(const m of day.matches[turn]||[])for(const hit of m.hits){
    if(hit.kind!=='vt3')continue;
    for(const path of hit.paths){
     out.push({day:dayIndex,turn,sourceId:hit.sourceId,signature:shape(path),path,head:m.cabeza,value:hit.value});
    }
   }
  }
 });
 return out;
}
export function analyzeVisual5D(current:DailySheet,historyOldestFirst:DailySheet[],target:Turno):Visual5DResult{
 const days=historyOldestFirst.slice(-5),empty=(reason:string):Visual5DResult=>({target,decision:'NO JUGAR',candidates:[],historyDays:days.length,reason,experimental:true});
 if(days.length<5)return empty('Faltan jornadas anteriores: se requieren cinco jornadas completas para 5D.');
 // Del día actual sólo se permiten marcas de turnos ANTERIORES al objetivo.
 const records=confirmedTraces([...days,current],target,true),groups=new Map<string,Trace[]>();
 for(const x of records){const k=x.sourceId+'|'+x.signature;const xs=groups.get(k)||[];xs.push(x);groups.set(k,xs)}
 const available=current.columns.slice(0,TURNOS.indexOf(target)+1);
 const found:Visual5DCandidate[]=[];
 for(const [k,xs] of groups){
  const distinct=[...new Set(xs.map(x=>x.day))].sort((a,b)=>a-b);
  // Un único día no constituye continuidad temporal. Sólo mirar hacia adelante.
  if(distinct.length<2)continue;
  const transitions=distinct.slice(1).filter((d,i)=>d-distinct[i]===1).length;
  if(transitions===0)continue;
  const [sourceId,signature]=k.split('|') as [SourceId,string];
  const source=available.find(x=>x.id===sourceId);if(!source)continue;
  for(const path of project(source.values,signature)){
   const value=path.map(x=>x.digit).join('');
   // La proyección debe poder trazarse efectivamente en la columna de destino.
   if(!findPaths(source.values,value).some(p=>key(p)===key(path)))continue;
   found.push({value,sourceId,sourceTurn:source.sourceLabel,path,days:distinct.length,transitions,lastSeen:distinct[distinct.length-1],traces:xs.length});
  }
 }
 const unique=new Map<string,Visual5DCandidate>();
 for(const x of found){const k=x.value+'|'+x.sourceId+'|'+key(x.path);if(!unique.has(k))unique.set(k,x)}
 const ranked=[...unique.values()].sort((a,b)=>b.transitions-a.transitions||b.lastSeen-a.lastSeen||b.days-a.days||a.value.localeCompare(b.value));
 // Una sola geometría no debe multiplicar evidencia por sus rutas superpuestas.
 const numbers:Visual5DCandidate[]=[];for(const x of ranked)if(!numbers.some(y=>y.value===x.value))numbers.push(x);
 if(!numbers.length)return empty('No se detectaron continuidades VT3 confirmadas en días consecutivos que puedan proyectarse en el tablero actual.');
 if(numbers.length>15)return {target,decision:'NO JUGAR',candidates:[],historyDays:5,reason:'Demasiadas proyecciones equivalentes: dispersión elevada; se evita forzar un top.',experimental:true};
 if(numbers[0].lastSeen<4)return {target,decision:'OBSERVAR',candidates:numbers.slice(0,5),historyDays:5,reason:'Continuidades antiguas dentro de la ventana; falta confirmación reciente.',experimental:true};
 if(numbers[0].transitions<2)return {target,decision:'OBSERVAR',candidates:numbers.slice(0,5),historyDays:5,reason:'Hay continuidad de dos jornadas, pero no alcanza el mínimo conservador para seleccionar.',experimental:true};
 return {target,decision:numbers.length<=3?'TOP 3':'TOP 5',candidates:numbers.slice(0,numbers.length<=3?3:5),historyDays:5,reason:'Geometrías ganadoras VT3 continuas en días consecutivos, proyectadas hacia adelante sobre celdas válidas. Señal experimental no validada.',experimental:true};
}
