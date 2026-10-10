// Modelo Papá — reconstrucción de HOJA MARCADA después del sorteo.
// PRIMERO salió la cabeza; DESPUÉS se buscan sus terminaciones en las
// columnas +11 disponibles ANTES de ese turno, se trazan TODAS las rutas
// coincidentes y se anota debajo la cabeza completa que pudo reconstruirse.
// Este módulo NO selecciona candidatos para sorteos futuros ni exige fotos.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';
export type MarcadoModalidad='vt2'|'vt3'|'vt4';
export type TrazoCoincidente={
 kind:MarcadoModalidad;value:string;sourceId:SourceId;
 cells:string[];digits:string;
 provenance:'COINCIDENCIA_RETROSPECTIVA_CABEZA_CONOCIDA';
};
export type CabezaAnotadaDebajo={
 jurisdiction:string;head:string;turn:Turno;
 // Un registro de cabeza COMPLETA, que puede tener múltiples trazos.
 traces:TrazoCoincidente[];
};
export type HojaPosteriorAlTurno={
 protocol:'HOJA_MARCADA_CABEZA_PRIMERO_V1';
 date:string;closedTurn:Turno;
 annotationByTurn:Array<{
  turn:Turno;
  allowedSources:SourceId[];
  headsBelow:CabezaAnotadaDebajo[];
  unmatchedHeads:string[];
 }>;
 headAnnotations:number;physicalTraces:number;
 visualInterpretation:'AUN_NO_REALIZADA';
 notes:string[];
};
const point=(p:{row:number;col:number})=>p.row+':'+p.col;
const adjacent=(p:Path)=>{
 if(new Set(p.map(point)).size!==p.length)return false;
 return p.every((c,i)=>c.row>=0&&c.row<6&&c.col>=0&&c.col<2&&
  (!i||(Math.abs(c.row-p[i-1].row)<=1&&
   Math.abs(c.col-p[i-1].col)<=1&&
   (c.row!==p[i-1].row||c.col!==p[i-1].col))));
};
export function reconstructMarkedSheetAfterDraw7D(
 sheet:DailySheet,date:string,closedTurn:Turno
):HojaPosteriorAlTurno{
 const stop=TURNOS.indexOf(closedTurn);
 if(stop<0||!/^\d{4}-\d{2}-\d{2}$/.test(date))
  throw Error('Fecha o turno finalizado inválidos');
 const byTurn:HojaPosteriorAlTurno['annotationByTurn']=[];
 for(let i=0;i<=stop;i++){
  const turn=TURNOS[i];
  const available=sheet.columns.slice(0,i+1);
  if(available.length!==i+1)throw Error('Tabla +11 incompleta para este turno');
  const allowed=new Set(available.map(c=>c.id));
  const group:HojaPosteriorAlTurno['annotationByTurn'][number]={
   turn,allowedSources:[...allowed],headsBelow:[],unmatchedHeads:[]
  };
  const matches=sheet.matches[turn]||[];
  const headsWithMatch=new Set(matches.map(x=>x.cabeza));
  for(const m of matches){
   if(m.turno!==turn||!/^\d{4}$/.test(m.cabeza))throw Error('Cabeza inválida');
   const traces:TrazoCoincidente[]=[];
   for(const hit of m.hits)for(const path of hit.paths){
    if(!allowed.has(hit.sourceId))throw Error('Recorrido en columna futura');
    const column=available.find(x=>x.id===hit.sourceId);
    if(!column||!adjacent(path)||path.length!==Number(hit.kind.slice(-1))||
     !m.cabeza.endsWith(hit.value)||path.map(p=>p.digit).join('')!==hit.value||
     path.some(p=>column.values[p.row]?.[p.col]!==p.digit))
      throw Error('Recorrido no coincide con cabeza o columna +11');
    traces.push({kind:hit.kind,value:hit.value,sourceId:hit.sourceId,
     cells:path.map(point),digits:path.map(p=>p.digit).join(''),
     provenance:'COINCIDENCIA_RETROSPECTIVA_CABEZA_CONOCIDA'});
   }
   if(traces.length)group.headsBelow.push({
    jurisdiction:m.jurisdiccion,head:m.cabeza,turn,traces
   });
  }
  // Heads not matching any VT2/VT3/VT4 are NOT written as coincidences below.
  for(const head of sheet.heads[turn]||[]){
   if(/^\d{4}$/.test(head)&&!headsWithMatch.has(head))
    group.unmatchedHeads.push(head);
  }
  byTurn.push(group);
 }
 return {protocol:'HOJA_MARCADA_CABEZA_PRIMERO_V1',date,closedTurn,
  annotationByTurn:byTurn,
  headAnnotations:byTurn.reduce((sum,g)=>sum+g.headsBelow.length,0),
  physicalTraces:byTurn.reduce((sum,g)=>sum+
   g.headsBelow.reduce((s,h)=>s+h.traces.length,0),0),
  visualInterpretation:'AUN_NO_REALIZADA',
  notes:[
   'La cabeza se conoce ANTES de dibujar un recorrido coincidente; nunca se usa para pronosticar ese mismo sorteo.',
   'Debajo se anota la cabeza completa una vez por coincidencia comprobada, aunque admita varias rutas o modalidades.',
   'Sólo se inspeccionan columnas +11 que existían ANTES del sorteo de cada cabeza.',
   'Cada trazo válido conserva los tres datos: origen físico, coordenadas ordenadas y cifras; nunca cruza columnas.',
   'Conservar todos los recorridos válidos evita escoger a posteriori el que parezca mejor para otro sorteo.',
   'Las fotos manuscritas sirven para verificar la reproducción EXACTA del dibujo original, no para habilitar coincidencias históricas.',
   'La interpretación de movimiento y la selección para un turno todavía futuro son etapas POSTERIORES Y DISTINTAS.'
  ]};
}
