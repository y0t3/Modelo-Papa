/**
 * Registro VISUAL por forma física, no por identidad de la familia.
 *
 * Sólo utiliza marcas POST reales de fechas anteriores, y para la misma
 * jornada únicamente sorteos anteriores al turno objetivo. La cabeza
 * del turno que queremos anticipar NUNCA se consulta.
 *
 * Un testigo de forma no se convierte en voto ni en raíz del motor.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {PanoramaCell,PanoramaKind,PanoramaRoute} from './panoramaModel';
import type {InfoVisualDay} from './infoTurnHistory';

export type ShapeWitness={
 id:string;date:string;turn:Turno;jurisdiction:string;head:string;
 source:SourceId;sourceLabel:string;values:string[];cells:PanoramaCell[];
 reading:string;scope:'DIA_ANTERIOR'|'MISMO_DIA';shape:string;
 rowShift:number;sourceChanged:boolean
};
const coord=(p:PanoramaCell)=>p.row+':'+p.col;
const cols:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const norm=(points:PanoramaCell[])=>{
 const row=Math.min(...points.map(p=>p.row)),col=Math.min(...points.map(p=>p.col));
 return points.map(p=>(p.row-row)+':'+(p.col-col)).join('>');
};
export function physicalShape(points:PanoramaCell[]):string{
 if(points.length<2||points.length>4)return '';
 return [norm(points),norm([...points].reverse())].sort()[0];
}
const valid=(values:string[],points:PanoramaCell[],expected:string):boolean=>
 points.length===expected.length&&new Set(points.map(coord)).size===points.length&&
 points.every((p,i)=>values[p.row]?.[p.col]===expected[i]&&
 (!i||Math.max(Math.abs(p.row-points[i-1].row),
  Math.abs(p.col-points[i-1].col))===1));

export function shapeWitnesses(
 date:string,target:Turno,current:PanoramaRoute,
 currentSheet:DailySheet,history:InfoVisualDay[]
):ShapeWitness[]{
 const index=TURNOS.indexOf(target);
 if(index<0||!date||current.cells.length<2)return [];
 const selected=currentSheet.columns.find(c=>c.id===current.sourceId);
 if(!selected||cols.indexOf(current.sourceId)>index)return [];
 const form=physicalShape(current.cells);
 const seen=new Set<string>(),items:ShapeWitness[]=[];
 const add=(dayDate:string,sheet:DailySheet,scope:ShapeWitness['scope'],end:number)=>{
  for(let t=0;t<end;t++){
   const turn=TURNOS[t];
   for(const mark of sheet.matches[turn]||[]){
    if(!/^\d{4}$/.test(mark.cabeza)||mark.jurisdiccion==='Montevideo')continue;
    for(const hit of mark.hits){
     if(hit.kind!==current.kind||!mark.cabeza.endsWith(hit.value))continue;
     const column=sheet.columns.find(c=>c.id===hit.sourceId);
     if(!column||cols.indexOf(hit.sourceId)>t)continue;
     for(const path of hit.paths){
      const cells=path.map(p=>({row:p.row,col:p.col}));
      if(!valid(column.values,cells,hit.value)||physicalShape(cells)!==form)continue;
      const id=[dayDate,turn,mark.jurisdiccion,mark.cabeza,hit.sourceId,
       cells.map(coord).join('>')].join('|');
      if(seen.has(id))continue;seen.add(id);
      items.push({id,date:dayDate,turn,jurisdiction:mark.jurisdiccion,
       head:mark.cabeza,source:hit.sourceId,sourceLabel:column.sourceLabel,
       values:[...column.values],cells,reading:hit.value,scope,shape:form,
       rowShift:Math.min(...current.cells.map(p=>p.row))-Math.min(...cells.map(p=>p.row)),
       sourceChanged:hit.sourceId!==current.sourceId});
     }
    }
   }
  }
 };
 const recent=[...new Map(history.filter(day=>day.date<date)
  .map(day=>[day.date,day])).values()].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 for(const day of recent)add(day.date,day.sheet,'DIA_ANTERIOR',TURNOS.length);
 // La fecha actual sólo incorpora marcas de turnos ya sorteados.
 add(date,currentSheet,'MISMO_DIA',index);
 return items.sort((a,b)=>b.date.localeCompare(a.date)||
  TURNOS.indexOf(b.turn)-TURNOS.indexOf(a.turn)||
  a.id.localeCompare(b.id));
}
