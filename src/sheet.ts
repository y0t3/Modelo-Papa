import {JURS,TURNOS,mas11,sufijosValidos} from './domain';
import type {CabezasDia,Turno} from './domain';
import {findPaths} from './paths';
import type {Path} from './paths';

export type SourceId='prevNocturno'|'Previa'|'Primera'|'Matutino'|'Vespertino';
export type SheetColumn={id:SourceId;turno:Turno;sourceLabel:string;values:string[]};
export type Hit={kind:'vt2'|'vt3'|'vt4';value:string;sourceId:SourceId;sourceTurn:string;paths:Path[]};
export type Match={turno:Turno;jurisdiccion:string;cabeza:string;hits:Hit[]};
export type DailySheet={columns:SheetColumn[];matches:Record<string,Match[]>;heads:Record<string,string[]>};

const values=(dia:CabezasDia|undefined,t:string)=>JURS.map(j=>{const h=dia?.[t]?.[j]||'----';return h==='----'?'--':mas11(h)});
const sourceTurn=(c:SheetColumn)=>c.id==='prevNocturno'?'Nocturno anterior':c.id;

export function buildSheet(current:CabezasDia,previous:CabezasDia):DailySheet{
 const columns:SheetColumn[]=[
  {id:'prevNocturno',turno:'Previa',sourceLabel:'Nocturna anterior',values:values(previous,'Nocturno')},
  {id:'Previa',turno:'Primera',sourceLabel:'Previa',values:values(current,'Previa')},
  {id:'Primera',turno:'Matutino',sourceLabel:'Primera',values:values(current,'Primera')},
  {id:'Matutino',turno:'Vespertino',sourceLabel:'Matutino',values:values(current,'Matutino')},
  {id:'Vespertino',turno:'Nocturno',sourceLabel:'Vespertino',values:values(current,'Vespertino')}
 ];
 const matches:Record<string,Match[]>=Object.fromEntries(TURNOS.map(t=>[t,[]]));
 TURNOS.forEach((target,targetIndex)=>{
  const available=columns.slice(0,targetIndex+1);
  for(const j of JURS){
   const cabeza=current[target]?.[j]; if(!cabeza||cabeza==='----')continue;
   const suffix=sufijosValidos(cabeza); if(!suffix)continue;
   const hits:Hit[]=[];
   for(const col of available){
    (['vt4','vt3','vt2'] as const).forEach(kind=>{
      const paths=findPaths(col.values,suffix[kind]);
      if(paths.length)hits.push({kind,value:suffix[kind],sourceId:col.id,sourceTurn:sourceTurn(col),paths});
    });
   }
   if(hits.length)matches[target].push({turno:target,jurisdiccion:j,cabeza,hits});
  }
 });
 const heads:Record<string,string[]>=Object.fromEntries(TURNOS.map(t=>[t,JURS.map(j=>current[t]?.[j]).filter((x):x is string=>!!x&&x!=='----')]));
 return {columns,matches,heads};
}
