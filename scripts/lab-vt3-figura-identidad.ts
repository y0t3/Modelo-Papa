// Identidad de una figura VT3 comprobada por cabezas reales, no por números.
import type {SourceId} from '../src/sheet';
export type FigureMark={date:string;source:SourceId;shape:string;cells:string[];
 head:string;turn:string;jur:string};
export type FigureTrace={source:SourceId;shape:string;cells:string[];value:string};
export type FigureMode='FORMA_GLOBAL'|'MISMA_FUENTE'|'CERCA_1_FILA'|
 'MISMAS_CASILLAS'|'DESPLAZADA_2_FILAS'|'CAMBIO_FUENTE';
export const figureModes:FigureMode[]=[
 'FORMA_GLOBAL','MISMA_FUENTE','CERCA_1_FILA','MISMAS_CASILLAS',
 'DESPLAZADA_2_FILAS','CAMBIO_FUENTE'
];
const cellKey=(cells:string[])=>[cells.join('>'),[...cells].reverse().join('>')].sort()[0];
const minRow=(cells:string[])=>Math.min(...cells.map(c=>Number(c.split(':')[0])));
export type FigureWitness={date:string;source:SourceId;head:string;
 turn:string;jur:string;cells:string[];rowDistance:number};
export function confirmedTrace(t:FigureTrace,marks:FigureMark[],
 mode:FigureMode):FigureWitness[]{
 const row=minRow(t.cells);
 const exact=cellKey(t.cells);
 const out:FigureWitness[]=[];
 const seen=new Set<string>();
 for(const m of marks){
  if(m.shape!==t.shape)continue;
  if(mode==='MISMA_FUENTE'&&m.source!==t.source)continue;
  if(mode==='CERCA_1_FILA'&&(m.source!==t.source||Math.abs(minRow(m.cells)-row)>1))continue;
  if(mode==='MISMAS_CASILLAS'&&(m.source!==t.source||cellKey(m.cells)!==exact))continue;
  if(mode==='DESPLAZADA_2_FILAS'&&(m.source!==t.source||Math.abs(minRow(m.cells)-row)<2))continue;
  if(mode==='CAMBIO_FUENTE'&&m.source===t.source)continue;
  // Distintas rutas del mismo resultado solo cuentan como un acontecimiento
  // de cabeza/fuente/fecha; no multiplicar evidencia por la dirección.
  const key=[m.date,m.turn,m.jur,m.head,m.source,m.shape].join('|');
  if(seen.has(key))continue;
  seen.add(key);
  out.push({date:m.date,source:m.source,head:m.head,turn:m.turn,jur:m.jur,
   cells:m.cells,rowDistance:Math.abs(minRow(m.cells)-row)});
 }
 return out;
}
export type FigureInfo={days:number;heads:number;lastDistance:number;weekly:boolean;
 witnesses:FigureWitness[]};
export function inspectFigure(t:FigureTrace,old:FigureMark[],weekly:FigureMark[],
 date:string,mode:FigureMode):FigureInfo{
 const witnesses=confirmedTrace(t,old,mode);
 const days=new Set(witnesses.map(x=>x.date)).size;
 const age=(d:string)=>(Date.parse(date+'T12:00:00Z')-Date.parse(d+'T12:00:00Z'))/86400000;
 const lastDistance=witnesses.length?Math.min(...witnesses.map(x=>age(x.date))):99;
 const sameWeek=confirmedTrace(t,weekly,mode).length>0;
 if(witnesses.some(x=>x.date>=date)||weekly.some(x=>x.date>=date))
  throw Error('Intento de leer una cabeza futura para elegir figura');
 return {days,heads:witnesses.length,lastDistance,weekly:sameWeek,witnesses};
}
export const figureScore=(x:FigureInfo)=>[
 x.days,Number(x.weekly),-x.lastDistance,x.heads];
export function allGeometricShapes():string[]{
 const points=Array.from({length:12},(_,i)=>({row:Math.floor(i/2),col:i%2}));
 const adjacent=(a:typeof points[number],b:typeof points[number])=>
  a!==b&&Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
 const shapes=new Set<string>();
 for(const a of points)for(const b of points)for(const c of points){
  if(new Set([a,b,c]).size<3||!adjacent(a,b)||!adjacent(b,c))continue;
  const shape=(arr:typeof points)=>arr.slice(1).map((p,i)=>
   (p.row-arr[i].row)+','+(p.col-arr[i].col)).join(';');
  shapes.add([shape([a,b,c]),shape([c,b,a])].sort()[0]);
 }
 return [...shapes].sort();
}
