/** Selecciones ganadoras visibles en el Resumen.
 * Lalo usa cortes PRE; AUX se consulta exclusivamente en el ranking independiente
 * construido ANTES de ese turno. Sin combinar ni reordenar rankings.
 */
import type {Turno,CabezasDia} from './domain';
import {JURS} from './domain';
import type {DayOverview} from './homeDaySummary';
import type {LaloKind} from './motorLalo';
import type {AuxiliarView} from './motorLaloAuxiliar';

export type MatchDetail={value:string;head:string;jur:string;turn:Turno};
export type Candidate={kind:LaloKind;family:string;rank:number;details:MatchDetail[]};

const kindOrder=(kind:LaloKind)=>Number(kind.slice(-1));
function sortCandidates(found:Map<string,Candidate>):Candidate[]{
 return [...found.values()].sort((a,b)=>kindOrder(a.kind)-kindOrder(b.kind)||
  a.rank-b.rank||a.family.localeCompare(b.family));
}
export function dayCandidates(overview:DayOverview,turn?:Turno):Candidate[]{
 const found=new Map<string,Candidate>();
 for(const event of overview.matches){
  if(turn&&event.turn!==turn)continue;
  for(const m of event.kinds){
   const id=m.kind+'|'+m.family;
   let item=found.get(id);
   if(!item){
    item={kind:m.kind,family:m.family,rank:m.rank,details:[]};
    found.set(id,item);
   }
   const detail={value:event.head.slice(-Number(m.kind.slice(-1))),
    head:event.head,jur:event.jur,turn:event.turn};
   if(!item.details.some(x=>x.head===detail.head&&x.jur===detail.jur&&x.turn===detail.turn))
    item.details.push(detail);
  }
 }
 return sortCandidates(found);
}
export function auxDayCandidates(view:AuxiliarView|null,heads:CabezasDia|null,turn:Turno):Candidate[]{
 if(!view||view.turn!==turn||!heads)return [];
 const published=JURS.map(jur=>({jur,head:heads[turn]?.[jur]||''}))
  .filter(x=>/^\d{4}$/.test(x.head));
 const found=new Map<string,Candidate>();
 for(const n of [2,3,4] as const){
  const kind=('vt'+n) as LaloKind;
  for(const family of view.ranks[n].slice(0,10)){
   if(family.rank>10)continue;
   const accepted=new Set(family.values.filter(value=>value.length===n));
   const details=published.filter(x=>accepted.has(x.head.slice(-n)))
    .map(x=>({...x,value:x.head.slice(-n),turn}));
   if(details.length)found.set(kind+'|'+family.family,{
    kind,family:family.family,rank:family.rank,details
   });
  }
 }
 return sortCandidates(found);
}
