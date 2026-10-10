// Modelo Papá — etapa histórica: RESULTADO CONOCIDO -> buscar en columnas +11
// anteriores al turno -> dibujar coincidencias -> anotar cabeza completa debajo.
// Estas rutas encontradas DESPUÉS de la cabeza son precisamente el material
// para reconstruir y ESTUDIAR las hojas marcadas; no son predicciones.
// Una foto puede precisar qué tinta/flecha había en el manuscrito original,
// pero NO habilita ni invalida la coincidencia física ya reconstruida.
// Nunca convertir estas rutas retrospectivas en aciertos prospectivos.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';
import type {DatedSheet} from './cycle7d';

export type MarkedPath={date:string;turn:Turno;kind:'vt2'|'vt3'|'vt4';sourceId:SourceId;head:string;value:string;route:Path;cells:string[];edges:string[];provenance:'RECONSTRUIDA_DE_MATCHES'};
export type MarkedMoment={date:string;turn:Turno;marks:MarkedPath[];sharedCells:number;branchCells:number;convergenceCells:number;vt2:number;vt3:number;vt4:number};
const cells=(p:Path)=>p.map(c=>c.row+':'+c.col);
const edges=(p:Path)=>p.slice(1).map((c,i)=>p[i].row+':'+p[i].col+'>'+c.row+':'+c.col);
export function reconstructMarkedMoments(days:DatedSheet[]):MarkedMoment[]{
 const ordered=[...days].sort((a,b)=>a.date.localeCompare(b.date));
 if(ordered.some((x,i)=>i>0&&x.date===ordered[i-1].date))throw new Error('Fecha repetida');
 return ordered.flatMap(({date,sheet})=>TURNOS.map(turn=>{
  const marks:MarkedPath[]=[];
  for(const match of sheet.matches[turn]||[])for(const hit of match.hits)for(const route of hit.paths){
   if(!sheet.columns.slice(0,TURNOS.indexOf(turn)+1).some(c=>c.id===hit.sourceId))throw new Error('Marca en columna futura o inexistente');
   if(!route.length||route.length!==Number(hit.kind.slice(-1))||route.map(c=>c.digit).join('')!==hit.value)throw new Error('Ruta inválida en hoja marcada');
   if(route.some((c,i)=>c.col<0||c.col>1||c.row<0||c.row>=6||(i>0&&(Math.abs(c.row-route[i-1].row)>1||Math.abs(c.col-route[i-1].col)>1||(c.row===route[i-1].row&&c.col===route[i-1].col)))))throw new Error('Ruta no contigua');
   if(new Set(cells(route)).size!==route.length)throw new Error('La ruta repite una celda');
   // Validar contra la HOJA fisica, no solo contra la cadena guardada en la ruta.
   const physical=sheet.columns.find(c=>c.id===hit.sourceId);
   if(!physical||route.some(c=>physical.values[c.row]?.[c.col]!==c.digit))throw new Error('La ruta no coincide con las celdas de la hoja');
   if(!/^\d{4}$/.test(match.cabeza)||!match.cabeza.endsWith(hit.value))throw new Error('Ruta no coincide con la cabeza ganadora');

   marks.push({date,turn,kind:hit.kind,sourceId:hit.sourceId,head:match.cabeza,value:hit.value,route,cells:cells(route),edges:edges(route),provenance:'RECONSTRUIDA_DE_MATCHES'});
  }
  const owners=new Map<string,Set<number>>(),incoming=new Map<string,Set<string>>(),outgoing=new Map<string,Set<string>>();
  marks.forEach((m,i)=>{
   m.cells.forEach(c=>{const k=m.sourceId+'|'+c,s=owners.get(k)||new Set<number>();s.add(i);owners.set(k,s)});
   m.edges.forEach(e=>{const [a,b]=e.split('>'),ka=m.sourceId+'|'+a,kb=m.sourceId+'|'+b;
    const o=outgoing.get(ka)||new Set<string>(),inn=incoming.get(kb)||new Set<string>();o.add(b);inn.add(a);outgoing.set(ka,o);incoming.set(kb,inn)});
  });
  return {date,turn,marks,vt2:marks.filter(m=>m.kind==='vt2').length,vt3:marks.filter(m=>m.kind==='vt3').length,vt4:marks.filter(m=>m.kind==='vt4').length,sharedCells:[...owners.values()].filter(s=>s.size>1).length,branchCells:[...outgoing.values()].filter(s=>s.size>1).length,convergenceCells:[...incoming.values()].filter(s=>s.size>1).length};
 }));
}
export function priorMarkedMoments(moments:MarkedMoment[],date:string,turn:Turno):MarkedMoment[]{
 const i=TURNOS.indexOf(turn);
 return moments.filter(m=>m.date<date||(m.date===date&&TURNOS.indexOf(m.turn)<i));
}
