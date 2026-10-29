/**
 * Laboratorio FORMAS PRIMERO VT3.
 *
 * Novedad frente a Geometría Completa / MV1:
 * (1) verifica raíces GANADORAS previas;
 * (2) escoge la POSICIÓN Y SILUETA sobre el tablero PRE SIN leer sus cifras;
 * (3) lee las cifras de esas posiciones DESPUÉS de ordenar los recorridos;
 * (4) deduplica familias VT3 únicamente al presentar el Top.
 *
 * Nunca reordena un Top de Lalo, ni añade candidatas por coincidencia numérica.
 * Es observación retrospectiva. Un Top no es ventaja probabilística probada.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import {cellsFromPlus11} from './paths';
import type {Path} from './paths';
import {reversibleFamily} from './motorLalo';
import type {InfoVisualDay} from './infoTurnHistory';

export const FORM_SOURCES:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
export type FormKind='vt2'|'vt3';
export type FormCell={row:number;col:number};
export type FormRoot={
 date:string;turn:Turno;jurisdiction:string;head:string;
 source:SourceId;cells:FormCell[];shape:string;anchor:number;
 event:string;reading:string;
};
export type FormLocation={
 source:SourceId;cells:FormCell[];shape:string;anchor:number;positionKey:string;
 /** The rank is defined solely by topology and PRE-existing winner events. */
 support:{events:number;days:number;d1:boolean;d7:boolean;sameSource:number;nearby:number;
  sourceDistance:number;verticalDistance:number;roots:FormRoot[]};
};
export type FormChoice=FormLocation&{
 rank:number;value:string;family:string
};
export type FormMotorView={
 date:string;turn:Turno;method:'FORMA_ANCLA_PRE_6J';kind:FormKind;
 rootDays:string[];validRoots:number;physicalPositions:number;
 selectedPositions:number;availableFamilies:number;top:FormChoice[];
};
/** Directions may reverse but neither rotate nor reflect a figure. */
export function formSignature(path:FormCell[]):string{
 if(!path.length)return '';
 const row=Math.min(...path.map(p=>p.row));
 const col=Math.min(...path.map(p=>p.col));
 const encode=(points:FormCell[])=>points.map(p=>(p.row-row)+':'+(p.col-col)).join('>');
 return [encode(path),encode([...path].reverse())].sort()[0];
}
const cellKey=(p:FormCell)=>p.row+':'+p.col;
const pathKey=(p:FormCell[])=>
 [p.map(cellKey).join('>'),[...p].reverse().map(cellKey).join('>')].sort()[0];
const anchor=(p:FormCell[])=>Math.min(...p.map(c=>c.row));
const physical=(p:FormCell[],sourceValues:string[],length:2|3=3)=>p.length===length&&
 new Set(p.map(cellKey)).size===length&&p.every((c,i)=>c.row>=0&&c.row<6&&
  (c.col===0||c.col===1)&&/^[0-9]$/.test(sourceValues[c.row]?.[c.col]||'')&&
  (!i||Math.max(Math.abs(c.row-p[i-1].row),Math.abs(c.col-p[i-1].col))===1));
export function historicalFormRoots(date:string,days:InfoVisualDay[],kind:FormKind='vt3'):{
 dates:string[];roots:FormRoot[]
}{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Fecha de corte inválida');
 if(days.some(d=>d.date>=date))throw Error('FORMAS: referencia del objetivo o del futuro');
 const recent=[...new Map(days.map(d=>[d.date,d])).values()]
  .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 const roots:FormRoot[]=[],seen=new Set<string>();
 for(const day of recent){
  for(const turn of TURNOS){
   for(const mark of day.sheet.matches[turn]||[]){
    if(mark.jurisdiccion==='Montevideo'||!/^\d{4,5}$/.test(mark.cabeza))continue;
    for(const hit of mark.hits){
     if(hit.kind!==kind||!mark.cabeza.endsWith(hit.value))continue;
     if(FORM_SOURCES.indexOf(hit.sourceId)>TURNOS.indexOf(turn))continue;
     const col=day.sheet.columns.find(c=>c.id===hit.sourceId);
     if(!col)continue;
     for(const route of hit.paths){
      const cells=route.map(c=>({row:c.row,col:c.col}));
      if(!physical(cells,col.values,kind==='vt2'?2:3))continue;
      const reading=cells.map(c=>col.values[c.row][c.col]).join('');
      if(reading!==hit.value)continue;
      const event=[day.date,turn,mark.jurisdiccion,mark.cabeza].join('|');
      const id=event+'|'+hit.sourceId+'|'+pathKey(cells);
      if(seen.has(id))continue;seen.add(id);
      roots.push({date:day.date,turn,jurisdiction:mark.jurisdiccion,
       head:mark.cabeza,source:hit.sourceId,cells,shape:formSignature(cells),
       anchor:anchor(cells),event,reading});
     }
    }
   }
  }
 }
 return {dates:recent.map(d=>d.date),roots};
}
export function formPositions(pre:DailySheet,target:Turno,kind:FormKind='vt3'):FormLocation[]{
 const index=TURNOS.indexOf(target);
 if(index<0)throw Error('Turno de forma desconocido');
 const found:FormLocation[]=[];
 for(const col of pre.columns.slice(0,index+1)){
  const cells=cellsFromPlus11(col.values);
  const visited=new Set<string>();
  const go=(p:Path)=>{
   if(p.length===(kind==='vt2'?2:3)){
    const steps=p.map(x=>({row:x.row,col:x.col}));
    if(!physical(steps,col.values,kind==='vt2'?2:3))return;
    const key=pathKey(steps);
    if(visited.has(key))return;
    visited.add(key);
    found.push({source:col.id,cells:steps,shape:formSignature(steps),
     anchor:anchor(steps),positionKey:col.id+'|'+key,
     support:{events:0,days:0,d1:false,d7:false,sameSource:0,nearby:0,
      sourceDistance:99,verticalDistance:99,roots:[]}});
    return;
   }
   for(const next of cells){
    if(p.some(x=>x.row===next.row&&x.col===next.col))continue;
    const previous=p[p.length-1];
    if(Math.max(Math.abs(previous.row-next.row),Math.abs(previous.col-next.col))===1)
     go([...p,next]);
   }
  };
  for(const first of cells)go([first]);
 }
 return found;
}
/** Score and candidate ranking use only coordinates and past verified marks. */
export function rankFormLocations(
 locations:FormLocation[],roots:FormRoot[],recentDates:string[],limit=10,cutDate=''
):FormLocation[]{
 const d1=recentDates[0];
 const d7Date=cutDate?new Date(Date.parse(cutDate+'T00:00:00Z')-7*86400000)
  .toISOString().slice(0,10):'';
 const d7=recentDates.find(d=>d===d7Date);
 const ordered=locations.map(loc=>{
  const near=roots.filter(r=>r.shape===loc.shape&&
   Math.abs(r.anchor-loc.anchor)<=2&&
   Math.abs(FORM_SOURCES.indexOf(r.source)-FORM_SOURCES.indexOf(loc.source))<=1);
  const events=new Set(near.map(r=>r.event));
  const same=near.filter(r=>r.source===loc.source);
  const distinctDays=new Set(near.map(r=>r.date));
  const sourceDistance=near.length?Math.min(...near.map(r=>
   Math.abs(FORM_SOURCES.indexOf(r.source)-FORM_SOURCES.indexOf(loc.source)))):99;
  const verticalDistance=near.length?Math.min(...near.map(r=>
   Math.abs(r.anchor-loc.anchor))):99;
  return {...loc,support:{
   events:events.size,days:distinctDays.size,
   d1:near.some(r=>r.date===d1),
   d7:near.some(r=>r.date===d7),sameSource:new Set(same.map(r=>r.event)).size,
   nearby:new Set(near.map(r=>r.event)).size,
   sourceDistance,verticalDistance,roots:near}};
 }).filter(loc=>loc.support.events>0);
 const score=(p:FormLocation)=>[
  p.support.sameSource>0?1:0,
  p.support.d1?1:0,
  p.support.days,
  p.support.events,
  -p.support.sourceDistance,
  -p.support.verticalDistance
 ];
 ordered.sort((a,b)=>{
  const x=score(a),y=score(b);
  for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];
  return FORM_SOURCES.indexOf(a.source)-FORM_SOURCES.indexOf(b.source)||
   a.anchor-b.anchor||a.positionKey.localeCompare(b.positionKey);
 });
 // One position per geometric silhouette first, then other corroborated placements.
 const selected:FormLocation[]=[],seen=new Set<string>();
 for(const location of ordered){
  if(!seen.has(location.shape)){seen.add(location.shape);selected.push(location)}
 }
 for(const location of ordered){
  if(selected.includes(location))continue;
  selected.push(location);
 }
 // Limit here is only physical positions; no numerical reading takes place.
 return selected.slice(0,limit);
}
export function buildFormFirstMotor(
 pre:DailySheet,date:string,target:Turno,days:InfoVisualDay[],topLimit=10,
 kind:FormKind='vt3'
):FormMotorView{
 const historical=historicalFormRoots(date,days,kind);
 const locations=formPositions(pre,target,kind);
 // Rank enough *physical* positions for de-duplicating numerical readings later.
 const ranked=rankFormLocations(locations,historical.roots,historical.dates,locations.length,date);
 const availableFamilies=new Set<string>(),top:FormChoice[]=[];
 for(const position of ranked){
  const column=pre.columns.find(c=>c.id===position.source)!;
  const value=position.cells.map(c=>column.values[c.row][c.col]).join('');
  const family=reversibleFamily(value);
  availableFamilies.add(family);
  if(top.length>=topLimit||top.some(x=>x.family===family))continue;
  top.push({...position,rank:top.length+1,value,family});
 }
 return {date,turn:target,method:'FORMA_ANCLA_PRE_6J',kind,rootDays:historical.dates,
  validRoots:historical.roots.length,physicalPositions:locations.length,
  selectedPositions:ranked.length,availableFamilies:availableFamilies.size,top};
}

/** VT2 hace exactamente la misma selección de FIGURAS que VT3, sin heredar prioridades de familias. */
export const buildFormFirstVt2=(pre:DailySheet,date:string,target:Turno,
 days:InfoVisualDay[],topLimit=10):FormMotorView=>
 buildFormFirstMotor(pre,date,target,days,topLimit,'vt2');
