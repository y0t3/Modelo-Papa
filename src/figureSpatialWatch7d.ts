// Observador espacial puro: no recibe cabezas del turno objetivo ni cambia el selector.
// Las celdas pertenecen a la MISMA columna fisica 6x2.
export type Zone7D='ALTA'|'MEDIA'|'BAJA';
export type Displacement7D='ARRIBA'|'ABAJO'|'MISMA_FILA';
export type Lateral7D='IZQUIERDA'|'DERECHA'|'MISMA_COLUMNA';
export type TrackedPhase7D='SIN_APOYO'|'ACTIVO'|'REPOSO'|'REACTIVACION_1'|'REACTIVACION_CONFIRMADA';
export type SpatialCoordinates7D={row:number;col:number};
export type SpatialFigure7D={coordinates:string[];zone:Zone7D;
 orientation:'HORIZONTAL'|'VERTICAL'|'DIAGONAL_O_QUEBRADA';
 minRow:number;maxRow:number;meanRow:number};
export type SpatialPair7D={fixed:SpatialFigure7D;shifted:SpatialFigure7D;
 deltaRow:number;deltaCol:number;vertical:Displacement7D;lateral:Lateral7D};
export type SpatialWatchBefore7D={date:string;turn:string;sourceId:string;pair:SpatialPair7D;
 fixedPhase:TrackedPhase7D;shiftedPhase:TrackedPhase7D;shiftLastSupport?:string;
 observation:'REPOSO'|'REACTIVACION_REGISTRADA'|'RECONFIRMACION_REGISTRADA'|'OBSERVAR';
 promoteAutomatically:false};
const read=(text:string):SpatialCoordinates7D=>{
 const parts=text.split(':');
 if(parts.length!==2||!parts.every(s=>/^\d+$/.test(s)))throw Error('Coordenada invalida');
 const [row,col]=parts.map(Number);
 if(row<0||row>5||col<0||col>1)throw Error('Celda fuera de la columna fisica 6x2');
 return {row,col};
};
const key=(p:SpatialCoordinates7D)=>p.row+':'+p.col;
const validStep=(a:SpatialCoordinates7D,b:SpatialCoordinates7D)=>
 (a.row!==b.row||a.col!==b.col)&&Math.abs(a.row-b.row)<=1&&Math.abs(a.col-b.col)<=1;
const classify=(coordinates:string[]):SpatialFigure7D=>{
 if(coordinates.length<2||coordinates.length>4)throw Error('Longitud VT invalida');
 const cells=coordinates.map(read),seen=new Set<string>();
 for(let i=0;i<cells.length;i++){
  if(seen.has(key(cells[i])))throw Error('Ruta repite una celda');
  seen.add(key(cells[i]));
  if(i>0&&!validStep(cells[i-1],cells[i]))throw Error('Ruta no contigua');
 }
 const rows=cells.map(c=>c.row),meanRow=rows.reduce((a,b)=>a+b,0)/rows.length;
 const zone:Zone7D=meanRow<2?'ALTA':meanRow<4?'MEDIA':'BAJA';
 const start=cells[0],end=cells[cells.length-1];
 const orientation=start.row===end.row?'HORIZONTAL':start.col===end.col?'VERTICAL':'DIAGONAL_O_QUEBRADA';
 return {coordinates:[...coordinates],zone,orientation,minRow:Math.min(...rows),maxRow:Math.max(...rows),meanRow};
};
export function describeSpatialPair7D(fixed:string[],shifted:string[]):SpatialPair7D{
 const a=classify(fixed),b=classify(shifted);
 if(fixed.length!==shifted.length)throw Error('VT diferente');
 const aa=fixed.map(read),bb=shifted.map(read);
 const deltaRow=bb[0].row-aa[0].row,deltaCol=bb[0].col-aa[0].col;
 if((!deltaRow&&!deltaCol)||Math.abs(deltaRow)>1||Math.abs(deltaCol)>1||
   !aa.every((p,i)=>bb[i].row-p.row===deltaRow&&bb[i].col-p.col===deltaCol))
  throw Error('No es una traslacion rigida cercana');
 return {fixed:a,shifted:b,deltaRow,deltaCol,
  vertical:deltaRow<0?'ARRIBA':deltaRow>0?'ABAJO':'MISMA_FILA',
  lateral:deltaCol<0?'IZQUIERDA':deltaCol>0?'DERECHA':'MISMA_COLUMNA'};
}
/** Estado observado ANTES del sorteo; no acepta resultados objetivo. */
export function freezeSpatialWatch7D(args:{date:string;turn:string;sourceId:string;
 root:string[];shifted:string[];fixedPhase:TrackedPhase7D;shiftedPhase:TrackedPhase7D;
 shiftLastSupport?:string}):SpatialWatchBefore7D{
 const pair=describeSpatialPair7D(args.root,args.shifted);
 if(args.shiftLastSupport&&args.shiftLastSupport>=args.date)throw Error('Fuga temporal: apoyo futuro');
 const observation:SpatialWatchBefore7D['observation']=
  args.shiftedPhase==='REACTIVACION_CONFIRMADA'?'RECONFIRMACION_REGISTRADA':
  args.shiftedPhase==='REACTIVACION_1'?'REACTIVACION_REGISTRADA':
  args.fixedPhase==='REPOSO'||args.shiftedPhase==='REPOSO'?'REPOSO':'OBSERVAR';
 return {date:args.date,turn:args.turn,sourceId:args.sourceId,pair,
  fixedPhase:args.fixedPhase,shiftedPhase:args.shiftedPhase,shiftLastSupport:args.shiftLastSupport,
  observation,promoteAutomatically:false};
}
