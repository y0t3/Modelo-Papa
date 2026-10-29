/**
 * Geometric motion signatures. Only real PRE-eligible winning roots are input;
 * the current digits, target POST and a candidate's numeric family are never
 * inspected to classify position movement.
 */
import type {FormCell,FormChoice,FormLocation,FormRoot} from './motorFormasPrimero';

const position=(cells:FormCell[])=>
 [cells.map(c=>c.row+':'+c.col).join('>'),
  [...cells].reverse().map(c=>c.row+':'+c.col).join('>')].sort()[0];
const eventCount=(roots:FormRoot[])=>new Set(roots.map(r=>r.event)).size;
export type FigureMotion={
 source:string;shape:string;anchor:number;
 exactEvents:number;verticalEvents:number;sourceChangeEvents:number;
 /** A root can match more than one category? No, source/anchor partition is strict. */
 exactDays:number;verticalDays:number;sourceChangeDays:number;
 verticalOffsets:number[];sourceOffsets:string[];
 categories:('MISMA_POSICION'|'DESPLAZAMIENTO_VERTICAL'|'CAMBIO_FUENTE')[];
 predominant:'MISMA_POSICION'|'DESPLAZAMIENTO_VERTICAL'|'CAMBIO_FUENTE'|'SIN_TESTIGO';
};
export function classifyFigureMotion(location:Pick<FormChoice,'source'|'shape'|'anchor'|'cells'|'support'>):FigureMotion{
 const candidates=location.support.roots.filter(r=>r.shape===location.shape);
 const exact=candidates.filter(r=>r.source===location.source&&
  position(r.cells)===position(location.cells));
 const vertical=candidates.filter(r=>r.source===location.source&&
  position(r.cells)!==position(location.cells));
 const sourceChange=candidates.filter(r=>r.source!==location.source);
 const counts={
  exactEvents:eventCount(exact),
  verticalEvents:eventCount(vertical),
  sourceChangeEvents:eventCount(sourceChange),
  exactDays:new Set(exact.map(x=>x.date)).size,
  verticalDays:new Set(vertical.map(x=>x.date)).size,
  sourceChangeDays:new Set(sourceChange.map(x=>x.date)).size
 };
 const categories:FigureMotion['categories']=[];
 if(counts.exactEvents)categories.push('MISMA_POSICION');
 if(counts.verticalEvents)categories.push('DESPLAZAMIENTO_VERTICAL');
 if(counts.sourceChangeEvents)categories.push('CAMBIO_FUENTE');
 // Report priority is descriptive: no numeric priority is changed.
 const predominant=counts.exactEvents?'MISMA_POSICION':
  counts.verticalEvents?'DESPLAZAMIENTO_VERTICAL':
   counts.sourceChangeEvents?'CAMBIO_FUENTE':'SIN_TESTIGO';
 return {source:location.source,shape:location.shape,anchor:location.anchor,
  ...counts,verticalOffsets:[...new Set(vertical.map(r=>location.anchor-r.anchor))].sort((a,b)=>a-b),
  sourceOffsets:[...new Set(sourceChange.map(r=>r.source+' → '+location.source))].sort(),
  categories,predominant};
}
/** Stable, cross-length comparison: identical definitions for VT2 and VT3. */
export const summarizeFigureMotions=(items:FormLocation[])=>
 items.map(x=>({positionKey:x.positionKey,motion:classifyFigureMotion(x)}));
