/**
 * Real, PRE-eligible historical winning activation motion, VT2 and VT3.
 * No current digits or target POST are used. A figure may be repeated in
 * the same exact place, shifted vertically/horizontally/diagonally within
 * the same source, or supported by a different historical source.
 */
import type {FormCell,FormChoice,FormLocation,FormRoot} from './motorFormasPrimero';

const position=(cells:FormCell[])=>
 [cells.map(c=>c.row+':'+c.col).join('>'),
  [...cells].reverse().map(c=>c.row+':'+c.col).join('>')].sort()[0];
const eventCount=(roots:FormRoot[])=>new Set(roots.map(r=>r.event)).size;
const minCol=(cells:FormCell[])=>Math.min(...cells.map(c=>c.col));
export type MotionCategory=
 'MISMA_POSICION'|'DESPLAZAMIENTO_VERTICAL'|'DESPLAZAMIENTO_HORIZONTAL'|
 'DESPLAZAMIENTO_DIAGONAL'|'CAMBIO_FUENTE'|'SIN_TESTIGO';
export type FigureMotion={
 source:string;shape:string;anchor:number;
 exactEvents:number;verticalEvents:number;horizontalEvents:number;
 diagonalEvents:number;sourceChangeEvents:number;
 exactDays:number;verticalDays:number;horizontalDays:number;
 diagonalDays:number;sourceChangeDays:number;
 verticalOffsets:number[];horizontalOffsets:number[];
 diagonalOffsets:{row:number;col:number}[];sourceOffsets:string[];
 categories:MotionCategory[];
 predominant:MotionCategory;
};
export function classifyFigureMotion(location:Pick<FormChoice,'source'|'shape'|'anchor'|'cells'|'support'>):FigureMotion{
 const roots=location.support.roots.filter(r=>r.shape===location.shape);
 const current=position(location.cells);
 const currentCol=minCol(location.cells);
 const sameSource=roots.filter(r=>r.source===location.source);
 const exact=sameSource.filter(r=>position(r.cells)===current);
 const other=sameSource.filter(r=>position(r.cells)!==current);
 const vertical=other.filter(r=>location.anchor!==r.anchor&&currentCol===minCol(r.cells));
 const horizontal=other.filter(r=>location.anchor===r.anchor&&currentCol!==minCol(r.cells));
 const diagonal=other.filter(r=>location.anchor!==r.anchor&&currentCol!==minCol(r.cells));
 // If the shape is the same and position differs, at least row or col differs.
 const sourceChange=roots.filter(r=>r.source!==location.source);
 const counts={
  exactEvents:eventCount(exact),verticalEvents:eventCount(vertical),
  horizontalEvents:eventCount(horizontal),diagonalEvents:eventCount(diagonal),
  sourceChangeEvents:eventCount(sourceChange),
  exactDays:new Set(exact.map(x=>x.date)).size,
  verticalDays:new Set(vertical.map(x=>x.date)).size,
  horizontalDays:new Set(horizontal.map(x=>x.date)).size,
  diagonalDays:new Set(diagonal.map(x=>x.date)).size,
  sourceChangeDays:new Set(sourceChange.map(x=>x.date)).size
 };
 const categories:MotionCategory[]=[];
 if(counts.exactEvents)categories.push('MISMA_POSICION');
 if(counts.verticalEvents)categories.push('DESPLAZAMIENTO_VERTICAL');
 if(counts.horizontalEvents)categories.push('DESPLAZAMIENTO_HORIZONTAL');
 if(counts.diagonalEvents)categories.push('DESPLAZAMIENTO_DIAGONAL');
 if(counts.sourceChangeEvents)categories.push('CAMBIO_FUENTE');
 const predominant=categories[0]||'SIN_TESTIGO';
 return {source:location.source,shape:location.shape,anchor:location.anchor,
  ...counts,
  verticalOffsets:[...new Set(vertical.map(r=>location.anchor-r.anchor))].sort((a,b)=>a-b),
  horizontalOffsets:[...new Set(horizontal.map(r=>currentCol-minCol(r.cells)))].sort((a,b)=>a-b),
  diagonalOffsets:[...new Set(diagonal.map(r=>(location.anchor-r.anchor)+':'+(currentCol-minCol(r.cells))))]
   .map(v=>({row:Number(v.split(':')[0]),col:Number(v.split(':')[1])})),
  sourceOffsets:[...new Set(sourceChange.map(r=>r.source+' → '+location.source))].sort(),
  categories,predominant};
}
/** Two lengths, identical physical definitions. */
export const summarizeFigureMotions=(items:FormLocation[])=>
 items.map(x=>({positionKey:x.positionKey,motion:classifyFigureMotion(x)}));

/**
 * A physical position is "active" on a historical day iff a real published
 * winning head was explained by exactly that source and route. Inactive days
 * are observations in the six-day window, not proof that the figure vanished
 * from the board (it may still be physically formable).
 */
export type ExactActivationState=
 'SIN_ACTIVACION_EXACTA'|'ACTIVACION_NUEVA'|'ACTIVA_REPETIDA'|
 'REAPARECIO_TRAS_PAUSA'|'SIN_ACTIVACION_RECIENTE';
export type ExactActivationTimeline={
 dates:string[];activated:boolean[];days:number;lastDayActive:boolean;
 currentStreak:number;state:ExactActivationState;lastWinDate:string|null;
};
export function exactActivationTimeline(
 location:Pick<FormChoice,'source'|'shape'|'cells'|'support'>,
 previousDays:string[]
):ExactActivationTimeline{
 const dates=[...new Set(previousDays)].sort((a,b)=>b.localeCompare(a));
 const here=position(location.cells);
 const won=new Set(location.support.roots.filter(r=>
  r.source===location.source&&r.shape===location.shape&&position(r.cells)===here).map(r=>r.date));
 const activated=dates.map(d=>won.has(d));
 const days=activated.filter(Boolean).length;
 const first=activated.indexOf(true);
 const lastDayActive=activated[0]||false;
 let currentStreak=0;
 for(const value of activated){if(!value)break;currentStreak++;}
 let state:ExactActivationState;
 if(!days)state='SIN_ACTIVACION_EXACTA';
 else if(!lastDayActive)state='SIN_ACTIVACION_RECIENTE';
 else if(days===1)state='ACTIVACION_NUEVA';
 else if(activated.some((v,i)=>!v&&activated.slice(i+1).some(Boolean)))
  state='REAPARECIO_TRAS_PAUSA';
 else state='ACTIVA_REPETIDA';
 return {dates,activated,days,lastDayActive,currentStreak,state,
  lastWinDate:first<0?null:dates[first]};
}
