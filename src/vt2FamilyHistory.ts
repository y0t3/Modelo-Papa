/**
 * Lectura visual de antecedentes de una familia VT2 Lalo.
 * Sólo usa cabezas publicadas en turnos ANTERIORES al PRE objetivo
 * y sus recorridos físicos confirmados por buildSheet.
 * Las marcas del turno objetivo no entran aquí, ni siquiera si la hoja
 * histórica ya contiene su resultado POST.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';
import {reversibleFamily} from './motorLalo';
import type {InfoVisualDay} from './infoTurnHistory';

export type Vt2Witness={
 id:string;date:string;turn:Turno;jurisdiction:string;head:string;
 value:string;family:string;sourceId:SourceId;sourceLabel:string;
 values:string[];paths:Path[];scope:'HOY'|'ANTERIOR';
};

export const vt2FamilyKey=(v:string)=>
 /^[0-9]{2}$/.test(v)?reversibleFamily(v):v;

export function buildVt2FamilyWitnesses(
 date:string,target:Turno,family:string,
 currentSheet:DailySheet|null,days:InfoVisualDay[]
):Vt2Witness[]{
 const targetIndex=TURNOS.indexOf(target);
 if(targetIndex<0||!/^\d{4}-\d{2}-\d{2}$/.test(date))return [];
 const results:Vt2Witness[]=[],seen=new Set<string>();
 const append=(day:string,sheet:DailySheet,scope:'HOY'|'ANTERIOR',until:number)=>{
  for(let i=0;i<until;i++){
   const turn=TURNOS[i];
   for(const mark of sheet.matches[turn]||[]){
    // Montevideo no es raíz histórica de Lalo MV1; sus POST siguen en Hoja.
    if(scope==='ANTERIOR'&&mark.jurisdiccion==='Montevideo')continue;
    if(!/^\d{4}$/.test(mark.cabeza)||
      vt2FamilyKey(mark.cabeza.slice(-2))!==family)continue;
    for(const hit of mark.hits){
     if(hit.kind!=='vt2'||!mark.cabeza.endsWith(hit.value)||
       vt2FamilyKey(hit.value)!==family)continue;
     const column=sheet.columns.find(c=>c.id===hit.sourceId);
     if(!column)continue;
     // Sólo conservar caminos que la hoja real podía contener.
     const paths=hit.paths.filter(p=>p.length===2&&p.every(c=>
      column.values[c.row]?.[c.col]===c.digit)&&
      p.map(c=>c.digit).join('')===hit.value);
     if(!paths.length)continue;
     const id=[day,turn,mark.jurisdiccion,mark.cabeza,hit.sourceId,hit.value].join('|');
     if(seen.has(id))continue;seen.add(id);
     results.push({
      id,date:day,turn,jurisdiction:mark.jurisdiccion,head:mark.cabeza,
      value:hit.value,family,sourceId:hit.sourceId,sourceLabel:column.sourceLabel,
      values:[...column.values],paths,scope
     });
    }
   }
  }
 };
 const historic=[...new Map(days.filter(d=>d.date<date&&
  TURNOS.some(t=>(d.sheet.heads[t]||[]).length>0))
  .map(d=>[d.date,d])).values()]
  .sort((a,b)=>a.date.localeCompare(b.date)).slice(-6);
 for(const d of historic)append(d.date,d.sheet,'ANTERIOR',TURNOS.length);
 if(currentSheet)append(date,currentSheet,'HOY',targetIndex);
 return results.sort((a,b)=>b.date.localeCompare(a.date)||
  TURNOS.indexOf(b.turn)-TURNOS.indexOf(a.turn)||
  a.id.localeCompare(b.id));
}
