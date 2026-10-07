import type {DailySheet,SourceId} from './sheet';
import type {Turno} from './domain';
import type {Path} from './paths';

export type ProvenRoute={
 dateOffset:number; target:Turno; head:string; jurisdiction:string;
 family:string; value:string; sourceId:SourceId; sourceTurn:string;
 path:Path; signature:string;
};
export type RouteTemplate={
 signature:string; sourceId:SourceId; sourceTurn:string;
 proven:ProvenRoute[]; weeks:number[]; heads:string[];
};

const family=(v:string)=>{const r=v.split('').reverse().join('');return v<=r?v+'/'+r:r+'/'+v};
export const routeSignature=(p:Path)=>p.slice(1).map((x,i)=>`${x.row-p[i].row},${x.col-p[i].col}`).join(';');

export function provenRoutes(sheet:DailySheet,target:Turno,dateOffset:number):ProvenRoute[]{
 const out:ProvenRoute[]=[];
 for(const m of sheet.matches[target]) for(const h of m.hits){
  if(h.kind!=='vt3')continue;
  for(const path of h.paths)out.push({
   dateOffset,target,head:m.cabeza,jurisdiction:m.jurisdiccion,
   family:family(h.value),value:h.value,sourceId:h.sourceId,sourceTurn:h.sourceTurn,
   path,signature:routeSignature(path)
  });
 }
 return out;
}

export function buildRouteHistory(sheetsNewestFirst:DailySheet[],target:Turno):RouteTemplate[]{
 const all=sheetsNewestFirst.flatMap((s,i)=>provenRoutes(s,target,i+1));
 const map=new Map<string,RouteTemplate>();
 for(const r of all){
  // A historical template keeps the physical source role as part of its identity.
  const key=r.sourceId+'|'+r.signature;
  let x=map.get(key);
  if(!x){x={signature:r.signature,sourceId:r.sourceId,sourceTurn:r.sourceTurn,proven:[],weeks:[],heads:[]};map.set(key,x)}
  x.proven.push(r);
  if(!x.weeks.includes(r.dateOffset))x.weeks.push(r.dateOffset);
  if(!x.heads.includes(r.head))x.heads.push(r.head);
 }
 return [...map.values()].sort((a,b)=>b.weeks.length-a.weeks.length||b.proven.length-a.proven.length||a.signature.localeCompare(b.signature));
}
