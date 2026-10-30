/**
 * LAB AUX VT3 — FORMAS PRIMERO, sin modificar la selección oficial.
 *
 * Seleccionar SITIOS FÍSICOS del tablero AUX por su historial de marcas
 * ganadoras de las 6 jornadas previas, sin leer las CIFRAS del tablero
 * actual para asignar la prioridad. Las cifras se leen DESPUÉS de ordenar
 * sitios; las familias VT3 se deduplican al presentar máximo diez.
 *
 * La dirección inversa de un recorrido se permite físicamente, NO se
 * unen caminos de hojas distintas. AUX_AYER e AUX_HOY se procesan aparte.
 */
import {auxCanonicalPath,enumerateAuxPaths,auxFamily} from './auxSantiagoNeuquen';
import type {AuxiliaryBoard,AuxPath} from './auxSantiagoNeuquen';
import type {AuxiliaryHistorical} from './motorLaloIntegral';

type Root={date:string;event:string;shape:string;site:string;
 anchorCol:number;source:string};
type Candidate={path:AuxPath;site:string;shape:string;anchorCol:number;
 support:{events:number;days:number;exactEvents:number;exactDays:number;
 shiftedEvents:number;shiftedDays:number;lastDay:boolean;nearEvents:number}};
export type AuxFormChoice={rank:number;family:string;value:string;
 path:AuxPath;site:string;shape:string;rootEvents:number;
 rootDays:number;exactEvents:number;lastDay:boolean};
export type AuxFormSelection={date:string;turn:string;mode:string;
 historyDates:string[];winnerRoots:number;physicalSites:number;
 eligibleSites:number;supportedChosen:number;prioritySites:string[];top:AuxFormChoice[]};
const coord=(c:{row:number;col:number})=>c.row+':'+c.col;
const signature=(p:AuxPath)=>{
 const row=Math.min(...p.map(c=>c.row));
 const col=Math.min(...p.map(c=>c.col));
 const str=(a:AuxPath)=>a.map(c=>(c.row-row)+':'+(c.col-col)).join('>');
 return [str(p),str([...p].reverse())].sort()[0];
};
const anchorCol=(p:AuxPath)=>Math.min(...p.map(c=>c.col));
const src=(p:AuxPath)=>[...new Set(p.map(c=>c.source))].sort().join('+');
const lex=(a:number[],b:number[])=>{
 for(let i=0;i<a.length;i++)if(a[i]!==b[i])return b[i]-a[i];
 return 0;
};
export type AuxSupportPolicy='exact'|'shift';
const sortPath=(a:Candidate,b:Candidate,policy:AuxSupportPolicy)=>{
 const x=a.support,y=b.support;
 const evidence=(v:Candidate['support'])=>policy==='exact'
   ? [Number(v.exactEvents>0),v.exactDays,v.exactEvents,v.shiftedDays,v.shiftedEvents,v.days]
   : [Number(v.shiftedEvents>0),v.shiftedDays,v.shiftedEvents,v.exactDays,v.exactEvents,v.days];
 return lex(evidence(x),evidence(y))||a.site.localeCompare(b.site);
};
function rootList(history:readonly AuxiliaryHistorical[],targetDate:string){
 if(history.some(h=>h.date>=targetDate))throw Error('FUGA POST AUX: fecha >= objetivo');
 const unique=[...new Map(history.map(h=>[h.date,h])).values()]
  .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 const roots:Root[]=[];
 for(const h of unique){
  for(const event of h.aux.events[3]){
   if(event.date!==h.date)throw Error('FUGA AUX: testigo incorrecto');
   for(const path of event.paths){
    if(path.length!==3||new Set(path.map(coord)).size!==3)continue;
    roots.push({date:h.date,event:event.id,shape:signature(path),
     site:auxCanonicalPath(path),anchorCol:anchorCol(path),source:src(path)});
   }
  }
 }
 return {dates:unique.map(h=>h.date),roots};
}
export function auxPhysicalSites(board:AuxiliaryBoard):AuxPath[]{
 const found=new Map<string,AuxPath>();
 for(const p of enumerateAuxPaths(board,3)){
  const key=auxCanonicalPath(p);
  if(!found.has(key))found.set(key,p);
 }
 return [...found.values()];
}
export function selectAuxSupportPolicy(
 board:AuxiliaryBoard,history:readonly AuxiliaryHistorical[],
 date:string,mode:string,limit=10,policy:AuxSupportPolicy='exact'):AuxFormSelection{
 if(limit<1||limit>100)throw Error('Top fuera de rango');
 const {dates,roots}=rootList(history,date);
 const sites=auxPhysicalSites(board);
 const byShape=new Map<string,Root[]>();
 for(const r of roots){
  const arr=byShape.get(r.shape)||[];arr.push(r);byShape.set(r.shape,arr);
 }
 const locations:Candidate[]=sites.map(path=>{
  const site=auxCanonicalPath(path),shape=signature(path),col=anchorCol(path);
  const candidates=(byShape.get(shape)||[]).filter(r=>
   Math.abs(r.anchorCol-col)<=2);
  const events=new Set(candidates.map(r=>r.event));
  const days=new Set(candidates.map(r=>r.date));
  const exactRoots=candidates.filter(r=>r.site===site);
  const shiftedRoots=candidates.filter(r=>r.site!==site);
  const exact=new Set(exactRoots.map(r=>r.event));
  const exactDays=new Set(exactRoots.map(r=>r.date));
  const shiftedEvents=new Set(shiftedRoots.map(r=>r.event));
  const shiftedDays=new Set(shiftedRoots.map(r=>r.date));
  return {path,site,shape,anchorCol:col,support:{
   events:events.size,days:days.size,exactEvents:exact.size,exactDays:exactDays.size,
   shiftedEvents:shiftedEvents.size,shiftedDays:shiftedDays.size,
   lastDay:candidates.some(r=>r.date===dates[0]),
   nearEvents:shiftedEvents.size
  }};
 });
 // Evita llenar los 10 lugares con la misma silueta cuando es posible:
 // una muestra por silueta antes de segundas ubicaciones.
 const supported=locations.filter(l=>l.support.events>0).sort((a,b)=>sortPath(a,b,policy));
 const unsupported=locations.filter(l=>!l.support.events)
  .sort((a,b)=>a.site.localeCompare(b.site));
 const visited=new Set<string>(),ordered:Candidate[]=[];
 for(const x of supported)if(!visited.has(x.shape)){
  visited.add(x.shape);ordered.push(x);
 }
 for(const x of supported)if(!ordered.includes(x))ordered.push(x);
 // Si faltan familias con testigos, completar con sitios neutrales.
 ordered.push(...unsupported);
 const seen=new Set<string>(),top:AuxFormChoice[]=[];
 for(const x of ordered){
  const value=x.path.map(c=>c.digit).join('');
  const family=auxFamily(value);
  if(seen.has(family))continue;
  seen.add(family);
  top.push({rank:top.length+1,family,value,path:x.path,site:x.site,
   shape:x.shape,rootEvents:x.support.events,rootDays:x.support.days,
   exactEvents:x.support.exactEvents,lastDay:x.support.lastDay});
  if(top.length>=limit)break;
 }
 return {date,turn:board.target,mode,historyDates:dates,
  winnerRoots:new Set(roots.map(r=>r.event)).size,
  physicalSites:sites.length,eligibleSites:supported.length,
  prioritySites:ordered.map(x=>x.site),
  supportedChosen:top.filter(x=>x.rootEvents>0).length,top};
}
