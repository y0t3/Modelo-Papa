// Procedencia de recorridos físicos: NO suponer que una ruta que coincide
// retrospectivamente con una cabeza fue resaltada o elegida por papá.
// Una huella manuscrita sin flechas NO autoriza inferir el orden de lectura.
export type MarkProvenance7D='AUTO_DESPUES_CABEZA'|'MANUAL_CELDAS_RESALTADAS'|'MANUAL_TRAZO_ORDENADO';
export type ManualMark7D={date:string;turn:'Previa'|'Primera'|'Matutino'|'Vespertino'|'Nocturno';
 kind:'VT2'|'VT3'|'VT4';sourceId:'prevNocturno'|'Previa'|'Primera'|'Matutino'|'Vespertino';
 provenance:MarkProvenance7D;cells:string[];supportReference:string};
export type RouteManualMatch7D='TRAZO_EXACTO_VERIFICADO'|'HUELLA_POSIBLE_DIRECCION_NO_VERIFICADA'|'SOLO_AUTO_RECONSTRUIDO'|'NO_COINCIDE';
const T=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const SRC=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const point=(s:string)=>{
 const m=/^([0-5]):([01])$/.exec(s);if(!m)throw Error('Coordenada fuera de la columna física 6x2');
 return {row:Number(m[1]),col:Number(m[2])};
};
const touches=(a:string,b:string)=>{
 const p=point(a),q=point(b);
 return a!==b&&Math.abs(p.row-q.row)<=1&&Math.abs(p.col-q.col)<=1;
};
const exact=(a:string[],b:string[])=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const isWithinHighlightedArea=(highlighted:string[],route:string[])=>route.every(x=>highlighted.includes(x));
export function tagVisualSource7D(m:ManualMark7D):ManualMark7D{
 const n=Number(m.kind[2]);
 if((m.provenance==='MANUAL_CELDAS_RESALTADAS'?(m.cells.length<1||m.cells.length>12):m.cells.length!==n)||n<2||n>4||!T.includes(m.turn)||!SRC.includes(m.sourceId)||
  SRC.indexOf(m.sourceId)>T.indexOf(m.turn))throw Error('Turno, fuente o modalidad inválida');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(m.date))throw Error('Fecha inválida');
 if(!m.supportReference.trim())throw Error('Es necesaria una referencia visual o de resultado');
 for(const c of m.cells)point(c);
 if(new Set(m.cells).size!==m.cells.length)throw Error('El recorrido repite una celda');
 if(m.provenance!=='MANUAL_CELDAS_RESALTADAS'&&
   m.cells.slice(1).some((p,i)=>!touches(m.cells[i],p)))throw Error('Trazo no contiguo');
 return {...m,cells:[...m.cells]};
}
export function assessMarkAgainstRoute7D(mark:ManualMark7D,route:string[]):RouteManualMatch7D{
 if(mark.provenance==='AUTO_DESPUES_CABEZA')return 'SOLO_AUTO_RECONSTRUIDO';
 if(mark.provenance==='MANUAL_TRAZO_ORDENADO')return exact(mark.cells,route)?'TRAZO_EXACTO_VERIFICADO':'NO_COINCIDE';
 return isWithinHighlightedArea(mark.cells,route)?'HUELLA_POSIBLE_DIRECCION_NO_VERIFICADA':'NO_COINCIDE';
}
export function manualPriority7D(mark:ManualMark7D,targetDate:string){
 if(targetDate<=mark.date)return 'NO_PRIORIDAD_MANUAL' as const;
 if(mark.provenance==='MANUAL_TRAZO_ORDENADO')return 'GEOMETRIA_MANUAL_APTA' as const;
 if(mark.provenance==='MANUAL_CELDAS_RESALTADAS')return 'SOLO_ZONA_MANUAL' as const;
 return 'NO_PRIORIDAD_MANUAL' as const;
}
