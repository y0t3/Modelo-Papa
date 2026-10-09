// Lecturas VISUALES congeladas antes del sorteo: exacta, inversa,
// relectura sobre LAS MISMAS CELDAS y sufijo VT2 inverso.
// No transforma una coincidencia geometrica en un acierto numerico exacto.
// No modifica el selector oficial ni reordena los focos persistidos.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';
import type {CycleKind} from './cycle7d';

export type ReadingClass7D='EXACTA'|'INVERSA_COMPLETA'|'MISMA_HUELLA'|'VT2_INVERSO'|'SIN_COINCIDENCIA';
export type FigureFrozen7D={
 date:string;target:Turno;kind:CycleKind;sourceId:SourceId;
 coordinates:string[];digits:string;figure:'L'|'RECTA'|'OTRA';
 direct:string;reverse:string;footprintAlternatives:string[];vt2Inverse?:string;
};
export type FigureReadingEvidence7D={
 frozen:FigureFrozen7D;headsChecked:number;numericExact:boolean;
 reverseFull:boolean;sameFootprint:boolean;vt2Inverse:boolean;
 geometricCompatible:boolean;primaryClass:ReadingClass7D;headsByClass:Partial<Record<ReadingClass7D,string[]>>;
};
const digitsOnly=(s:string)=>/^\d{4}$/.test(s);
const coord=(c:{row:number;col:number})=>c.row+':'+c.col;
const validStep=(a:{row:number;col:number},b:{row:number;col:number})=>
 Math.abs(a.row-b.row)<=1&&Math.abs(a.col-b.col)<=1&&(a.row!==b.row||a.col!==b.col);
const permutations=<T>(a:T[]):T[][]=>a.length<=1?[a]:a.flatMap((x,i)=>permutations([...a.slice(0,i),...a.slice(i+1)]).map(rest=>[x,...rest]));
const figure=(path:Path):FigureFrozen7D['figure']=>{
 if(path.length===3){
  const a=path[0],b=path[1],c=path[2];
  const hv=a.row===b.row&&b.col===c.col&&a.col!==b.col&&b.row!==c.row;
  const vh=a.col===b.col&&b.row===c.row&&a.row!==b.row&&b.col!==c.col;
  if(hv||vh)return 'L';
 }
 if(path.every((c,i)=>i===0||((c.row-path[i-1].row)===(path[1].row-path[0].row)&&(c.col-path[i-1].col)===(path[1].col-path[0].col))))return 'RECTA';
 return 'OTRA';
};
export function freezeFigureReadings7D(sheet:DailySheet,date:string,target:Turno,kind:CycleKind,sourceId:SourceId,path:Path):FigureFrozen7D{
 const at=TURNOS.indexOf(target),n=Number(kind.slice(-1));
 if(at<0||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)||path.length!==n||n<2||n>4)throw Error('Fecha, turno o modalidad invalida');
 const col=sheet.columns.slice(0,at+1).find(c=>c.id===sourceId);
 if(!col)throw Error('No se pueden leer columnas futuras o inexistentes');
 const cells=new Set<string>();
 const numbers=path.map((p,i)=>{
  if(p.row<0||p.row>=6||p.col<0||p.col>=2||(i>0&&!validStep(path[i-1],p)))throw Error('Recorrido fuera de columna o no contiguo');
  const id=coord(p);if(cells.has(id))throw Error('Recorrido repite celda');cells.add(id);
  const pair=col.values[p.row]||'',digit=pair[p.col]||'';
  if(!/^\d{2}$/.test(pair)||!/^[0-9]$/.test(digit)||p.digit!==digit)throw Error('Ruta no coincide con las celdas disponibles');
  return digit;
 });
 const direct=numbers.join(''),reverse=numbers.slice().reverse().join('');
 // SOLO permutaciones de estas mismas celdas, validadas por adyacencia fisica.
 const footprintAlternatives=[...new Set(permutations(path.map((p,i)=>({row:p.row,col:p.col,digit:numbers[i]})))
  .filter(perm=>perm.every((p,i)=>i===0||validStep(perm[i-1],p)))
  .map(perm=>perm.map(p=>p.digit).join('')))].filter(x=>x!==direct&&x!==reverse).sort();
 const vt2Inverse=n>=3?numbers.slice(-2).reverse().join(''):undefined;
 return {date,target,kind,sourceId,coordinates:path.map(coord),digits:direct,figure:figure(path),
  direct,reverse,footprintAlternatives,vt2Inverse};
}
// Esta funcion SOLO se llama cuando se conoce el resultado. No reescribe la lectura congelada.
export function evaluateFigureReadings7D(frozen:FigureFrozen7D,heads:string[]):FigureReadingEvidence7D{
 const actual=[...new Set(heads.filter(digitsOnly))];
 const by:Partial<Record<ReadingClass7D,string[]>>={};
 let numericExact=false,reverseFull=false,sameFootprint=false,vt2Inverse=false;
 const n=Number(frozen.kind.slice(-1));
 for(const h of actual){
  const suffix=h.slice(-n),two=h.slice(-2);
  const exact=suffix===frozen.direct;
  const reverse=!exact&&suffix===frozen.reverse;
  const footprint=!exact&&!reverse&&frozen.footprintAlternatives.includes(suffix);
  const twoInverse=!!frozen.vt2Inverse&&two===frozen.vt2Inverse;
  numericExact||=exact;reverseFull||=reverse;sameFootprint||=footprint;vt2Inverse||=twoInverse;
  const classification:ReadingClass7D=exact?'EXACTA':reverse?'INVERSA_COMPLETA':footprint?'MISMA_HUELLA':twoInverse?'VT2_INVERSO':'SIN_COINCIDENCIA';
  (by[classification]||=([])).push(h);
 }
 const primaryClass:ReadingClass7D=numericExact?'EXACTA':reverseFull?'INVERSA_COMPLETA':sameFootprint?'MISMA_HUELLA':vt2Inverse?'VT2_INVERSO':'SIN_COINCIDENCIA';
 return {frozen,headsChecked:actual.length,numericExact,reverseFull,sameFootprint,vt2Inverse,
  geometricCompatible:numericExact||reverseFull||sameFootprint,
  primaryClass,headsByClass:by};
}
// Observacion DESCRIPTIVA. No modifica estado, apuestas, puntajes ni selector.
export const observationOfFigure7D=(e:FigureReadingEvidence7D)=>
 e.numericExact?'ACIERTO_NUMERICO_EXACTO':
 e.geometricCompatible?'APOYO_GEOMETRICO_SIN_EXACTITUD':
 e.vt2Inverse?'COINCIDENCIA_PARCIAL_VT2':
 'SIN_CONFIRMACION';
