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
