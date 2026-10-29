/**
 * DOS LECTORES VT2 solo para Experimental (no se conectan a Lalo MV1).
 * A) Geometría: examina siluetas físicas y sus desplazamientos de fuente/fila
 * frente a testigos POST anteriores; la cifra se lee en la hoja PRE actual.
 * B) Conectadas: pares de FORMAS VT2 ganadoras de eventos independientes en
 * la MISMA fuente histórica, con contacto real, proyectados a OTRA fuente PRE.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {SourceId,DailySheet} from './sheet';
import type {LaloHistorical} from './motorLalo';
import type {InfoVisualDay} from './infoTurnHistory';
import {cellsFromPlus11} from './paths';
import {reversibleFamily} from './motorLalo';
import {physicalShape} from './shapeWitnesses';
type Pt={row:number;col:number;digit:string};
type Path=Pt[];
const SOURCES:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const coord=(c:Pt)=>c.row+':'+c.col;
const family=(p:Path)=>reversibleFamily(p.map(c=>c.digit).join(''));
const key=(path:Path)=>[path.map(coord).join('>'),[...path].reverse().map(coord).join('>')].sort()[0];
export type Vt2ExperimentalItem={
 family:string;source:SourceId;cells:string[];value:string;
 shape:string;score:number[];witnesses:number;historicalDates:string[];
 pastHeads:string[];note:string
};
export type Vt2Experimental={
 date:string;turn:Turno;geometric:Vt2ExperimentalItem[];
 connected:Vt2ExperimentalItem[];allRoutes:number;historicalEvents:number
};
type Route={source:SourceId;cells:string[];value:string;family:string;shape:string;
 anchor:number;path:Path};
type Witness=Route&{date:string;turn:Turno;head:string;jur:string;event:string};
function physical2(sheet:DailySheet,turn:Turno):Route[]{
 const result:Route[]=[],end=TURNOS.indexOf(turn),used=new Set<string>();
 for(const column of sheet.columns.slice(0,end+1)){
  const points=cellsFromPlus11(column.values);
  for(const a of points)for(const b of points){
   if(a===b||Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))!==1)continue;
   const path=[a,b],canon=column.id+'|'+key(path);
   if(used.has(canon))continue;used.add(canon);
   result.push({source:column.id,cells:path.map(coord),value:path.map(c=>c.digit).join(''),
    family:family(path),shape:physicalShape(path),anchor:Math.min(a.row,b.row),path});
  }
 }
 return result;
}
function winners(date:string,sheet:DailySheet):Witness[]{
 const out:Witness[]=[],used=new Set<string>();
 for(const turn of TURNOS)for(const mark of sheet.matches[turn]||[]){
  if(mark.jurisdiccion==='Montevideo'||!/^\d{4}$/.test(mark.cabeza))continue;
  for(const hit of mark.hits){
   if(hit.kind!=='vt2'||!mark.cabeza.endsWith(hit.value))continue;
   const col=sheet.columns.find(c=>c.id===hit.sourceId);
   if(!col||SOURCES.indexOf(hit.sourceId)>TURNOS.indexOf(turn))continue;
   for(const path of hit.paths){
    if(path.length!==2||path.map(c=>c.digit).join('')!==hit.value||
     path.some(c=>col.values[c.row]?.[c.col]!==c.digit))continue;
    const event=[date,turn,mark.jurisdiccion,mark.cabeza].join('|');
    const id=event+'|'+hit.sourceId+'|'+key(path);
    if(used.has(id))continue;used.add(id);
    out.push({date,turn,head:mark.cabeza,jur:mark.jurisdiccion,
     event,source:hit.sourceId,cells:path.map(coord),value:hit.value,
     family:family(path),shape:physicalShape(path),
     anchor:Math.min(...path.map(c=>c.row)),path});
   }
  }
 }
 return out;
}
const compare=(a:number[],b:number[])=>{
 for(let i=0;i<Math.max(a.length,b.length);i++)if(a[i]!==b[i])return b[i]-a[i];
 return 0;
};
const normalize=(path:Path)=>path.map(c=>{
 const min=Math.min(...path.map(p=>p.row));
 return (c.row-min)+':'+c.col;
});
const pairKey=(a:Witness,b:Witness)=>{
 const keys=[normalize(a.path).join('>'),normalize(b.path).join('>')].sort();
 return keys.join('||');
};
function contact(a:Witness,b:Witness){
 if(key(a.path)===key(b.path))return false;
 return a.path.some(x=>b.path.some(y=>
  Math.max(Math.abs(x.row-y.row),Math.abs(x.col-y.col))<=1));
}
export function buildExperimentalVt2(
 pre:DailySheet,date:string,turn:Turno,
 days:Array<InfoVisualDay|LaloHistorical>
):Vt2Experimental{
 if(!date||!pre)throw Error('Falta corte PRE experimental VT2');
 if(days.some(x=>x.date>=date))throw Error('VT2 experimental no acepta sorteo objetivo o futuro');
 const recent=[...new Map(days.map(x=>[x.date,x])).values()]
  .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 const historic=recent.flatMap(day=>winners(day.date,day.sheet));
 const current=physical2(pre,turn);
 const geom:Vt2ExperimentalItem[]=[];
 for(const route of current){
  const old=historic.filter(w=>w.source===route.source&&w.shape===route.shape);
  const events=new Set(old.map(w=>w.event)),dates=new Set(old.map(w=>w.date));
  const shift=old.length?Math.max(...old.map(w=>Math.abs(w.anchor-route.anchor))):0;
  geom.push({family:route.family,source:route.source,cells:route.cells,
   value:route.value,shape:route.shape,witnesses:events.size,
   historicalDates:[...dates],pastHeads:[...new Set(old.map(w=>w.head))],
   score:[Number(shift>=2),shift,events.size,dates.size],
   note:old.length?'Misma forma, posible movimiento de fila':'Figura física sin raíz ganadora de esa forma en la ventana'});
 }
 const geometric:Vt2ExperimentalItem[]=[],geoFamilies=new Set<string>();
 geom.sort((a,b)=>compare(a.score,b.score)||
  SOURCES.indexOf(a.source)-SOURCES.indexOf(b.source)||
  a.cells.join('>').localeCompare(b.cells.join('>')));
 for(const g of geom){
  if(geoFamilies.has(g.family))continue;
  geoFamilies.add(g.family);
  if(geometric.length<10)geometric.push(g);
 }
 // Las parejas se agrupan por DIA + FUENTE, y obligatoriamente por
 // eventos independientes. La misma cabeza con dos rutas no hace pareja.
 const grouped=new Map<string,Witness[]>();
 for(const old of historic){
  const k=old.date+'|'+old.source,a=grouped.get(k)||[];
  a.push(old);grouped.set(k,a);
 }
 const byTemplate=new Map<string,{
  one:Witness;two:Witness;events:Set<string>;dates:Set<string>
 }>();
 for(const list of grouped.values())for(let i=0;i<list.length;i++)
 for(let j=i+1;j<list.length;j++){
  const a=list[i],b=list[j];
  if(a.event===b.event||!contact(a,b))continue;
  const id=a.source+'|'+pairKey(a,b);
  let g=byTemplate.get(id);
  if(!g){
   g={one:a,two:b,events:new Set(),dates:new Set()};
   byTemplate.set(id,g);
  }
  g.events.add([a.event,b.event].sort().join('&'));g.dates.add(a.date);
 }
 const traceMap=new Map(current.map(r=>[r.source+'|'+key(r.path),r]));
 const result:Vt2ExperimentalItem[]=[];
 for(const g of byTemplate.values()){
  const base=g.one,other=g.two;
  const min=Math.min(...base.path.map(p=>p.row),...other.path.map(p=>p.row));
  const oldRelative=[base.path,other.path].map(path=>path.map(p=>
   ({row:p.row-min,col:p.col})));
  for(const source of SOURCES.slice(0,TURNOS.indexOf(turn)+1)){
   if(source===base.source)continue;
   for(let origin=0;origin<=5;origin++){
    const mapped=oldRelative.map(path=>path.map(p=>({
     row:p.row+origin,col:p.col
    })));
    if(mapped.flat().some(p=>p.row<0||p.row>5))continue;
    const matched=mapped.map(path=>{
     const coords=path.map(p=>p.row+':'+p.col);
     const canonical=[coords.join('>'),[...coords].reverse().join('>')].sort()[0];
     return traceMap.get(source+'|'+canonical);
    });
    if(!matched[0]||!matched[1])continue;
    for(const route of matched){
     const r=route!,moved=Math.abs(origin-min);
     result.push({family:r.family,source:r.source,cells:r.cells,
      value:r.value,shape:r.shape,score:[g.dates.size,g.events.size,moved],
      witnesses:g.events.size,historicalDates:[...g.dates],
      pastHeads:[base.head,other.head],
      note:'Par de formas VT2 ganadoras distintas; '+base.source+' → '+source+
       ' · desplazamiento '+moved+' fila(s)'});
    }
   }
  }
 }
 result.sort((a,b)=>compare(a.score,b.score)||
  SOURCES.indexOf(a.source)-SOURCES.indexOf(b.source)||
  a.cells.join('>').localeCompare(b.cells.join('>')));
 const connected:Vt2ExperimentalItem[]=[],conFamilies=new Set<string>();
 for(const r of result){
  if(conFamilies.has(r.family))continue;
  conFamilies.add(r.family);if(connected.length<10)connected.push(r);
 }
 return {date,turn,geometric,connected,allRoutes:current.length,
  historicalEvents:new Set(historic.map(w=>w.event)).size};
}
