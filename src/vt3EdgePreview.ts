/**
 * Dos lecturas VT2 verdaderas contenidas en una ruta VT3 de +11.
 * El sentido inverso usa la otra arista, sin saltar celdas ni inventar
 * una ruta cruzando columnas.
 */
import {reversibleFamily} from './motorLalo';
import type {PanoramaCell} from './panoramaModel';
export type Vt3Vt2Edge={label:'Final directa'|'Final inversa';
 reading:string;family:string;cells:PanoramaCell[]};
export function extractVt2EdgesFromVt3(
 values:string[],cells:PanoramaCell[]):Vt3Vt2Edge[]{
 if(cells.length!==3||new Set(cells.map(c=>c.row+':'+c.col)).size!==3)
  return [];
 if(cells.some(c=>c.row<0||c.row>5||c.col<0||c.col>1))return [];
 for(let i=1;i<cells.length;i++)
  if(Math.max(Math.abs(cells[i].row-cells[i-1].row),
   Math.abs(cells[i].col-cells[i-1].col))!==1)return [];
 const digits=cells.map(c=>values[c.row]?.[c.col]||'');
 if(digits.some(d=>!/^[0-9]$/.test(d)))return [];
 const segments=[
  {label:'Final directa' as const,cells:cells.slice(1,3)},
  {label:'Final inversa' as const,cells:cells.slice(0,2).reverse()}
 ];
 return segments.map(s=>{
  const reading=s.cells.map(c=>values[c.row]?.[c.col]||'').join('');
  return {...s,reading,family:reversibleFamily(reading)};
 });
}
