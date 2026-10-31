import type {Turno} from './domain';
import type {DayOverview} from './homeDaySummary';
import type {LaloKind} from './motorLalo';

export type DayCandidate={kind:LaloKind;family:string;rank:number;
 details:{value:string;head:string;jur:string;turn:Turno}[]};

/** Datos puros para portada/Info; filtrar por turno antes de agrupar. */
export function dayCandidates(overview:DayOverview,onlyTurn?:Turno):DayCandidate[]{
 const found=new Map<string,DayCandidate>();
 for(const event of overview.matches.filter(x=>!onlyTurn||x.turn===onlyTurn))
  for(const m of event.kinds){
   const id=m.kind+'|'+m.family;
   let item=found.get(id);
   if(!item){item={kind:m.kind,family:m.family,rank:m.rank,details:[]};found.set(id,item)}
   const detail={value:event.head.slice(-Number(m.kind.slice(-1))),
    head:event.head,jur:event.jur,turn:event.turn};
   if(!item.details.some(x=>x.head===detail.head&&x.jur===detail.jur&&x.turn===detail.turn))
    item.details.push(detail);
  }
 const order=(k:LaloKind)=>k==='vt2'?0:k==='vt3'?1:2;
 return [...found.values()].sort((a,b)=>order(a.kind)-order(b.kind)||
  a.rank-b.rank||a.family.localeCompare(b.family));
}
