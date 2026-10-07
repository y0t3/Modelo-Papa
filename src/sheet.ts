import {JURS,TURNOS,mas11,sufijosValidos} from './domain';
import type {CabezasDia,Turno} from './domain';
import {findPaths} from './paths';
import type {Path} from './paths';
export type SheetColumn={turno:Turno;sourceLabel:string;values:string[]};
export type Match={turno:Turno;jurisdiccion:string;cabeza:string;vt2?:Path[];vt3?:Path[];vt4?:Path[]};
export type DailySheet={columns:SheetColumn[];matches:Record<string,Match[]>};
const values=(dia:CabezasDia|undefined,t:string)=>JURS.map(j=>{const h=dia?.[t]?.[j]||'----';return h==='----'?'--':mas11(h)});
export function buildSheet(current:CabezasDia,previous:CabezasDia):DailySheet{
 const cols:SheetColumn[]=[
  {turno:'Previa',sourceLabel:'Nocturna anterior',values:values(previous,'Nocturno')},
  {turno:'Primera',sourceLabel:'Previa',values:values(current,'Previa')},
  {turno:'Matutino',sourceLabel:'Primera',values:values(current,'Primera')},
  {turno:'Vespertino',sourceLabel:'Matutino',values:values(current,'Matutino')},
  {turno:'Nocturno',sourceLabel:'Vespertino',values:values(current,'Vespertino')}
 ];
 const matches:Record<string,Match[]>=Object.fromEntries(TURNOS.map(t=>[t,[]]));
 for(const col of cols){
  for(const j of JURS){
   const cabeza=current[col.turno]?.[j]; if(!cabeza||cabeza==='----')continue;
   const s=sufijosValidos(cabeza); if(!s)continue;
   const vt2=findPaths(col.values,s.vt2),vt3=findPaths(col.values,s.vt3),vt4=findPaths(col.values,s.vt4);
   if(vt2.length||vt3.length||vt4.length)matches[col.turno].push({turno:col.turno,jurisdiccion:j,cabeza,vt2:vt2.length?vt2:undefined,vt3:vt3.length?vt3:undefined,vt4:vt4.length?vt4:undefined});
  }
 }
 return {columns:cols,matches};
}
