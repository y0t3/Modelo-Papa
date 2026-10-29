/**
 * Evaluación exclusivamente POST de los dos lectores VT2 experimentales.
 * Recibe rankings PRE ya construidos y cabezas publicadas del turno.
 * Nunca recalcula, promociona ni reordena candidatas con resultados posteriores.
 */
import {reversibleFamily} from './motorLalo';
import type {Vt2Experimental,Vt2ExperimentalItem} from './experimentalVt2';

export type Vt2PublishedHead={jur:string;head:string};
export type Vt2MatchedHead=Vt2PublishedHead&{ending:string};
export type Vt2PostMatch={
 rank:number;family:string;heads:Vt2MatchedHead[];
};
export type Vt2PostReader={
 matches:Vt2PostMatch[];
 matchedFamilies:number;matchedHeads:number;
 top3Families:number;top3Heads:number;
};
export type Vt2PostResult={
 published:Vt2MatchedHead[];
 geometric:Vt2PostReader;connected:Vt2PostReader
};
const valid=(x:string)=>/^\d{4,5}$/.test(x);
export function evaluateExperimentalVt2Post(
 pre:Pick<Vt2Experimental,'geometric'|'connected'>,
 heads:Vt2PublishedHead[]
):Vt2PostResult{
 const unique=new Map<string,Vt2MatchedHead>();
 for(const h of heads){
  const head=String(h.head||'');
  if(!valid(head))continue;
  const jur=String(h.jur||'').trim();
  const id=jur+'|'+head;
  unique.set(id,{jur,head,ending:head.slice(-2)});
 }
 const published=[...unique.values()];
 const evaluate=(ranking:Vt2ExperimentalItem[]):Vt2PostReader=>{
  const matches:Vt2PostMatch[]=[];
  for(const [i,item] of ranking.slice(0,10).entries()){
   const found=published.filter(h=>reversibleFamily(h.ending)===item.family);
   if(found.length)matches.push({rank:i+1,family:item.family,heads:found});
  }
  const uniqueHits=(found:Vt2PostMatch[])=>
   new Set(found.flatMap(m=>m.heads.map(h=>h.jur+'|'+h.head))).size;
  const top3=matches.filter(m=>m.rank<=3);
  return {
   matches,matchedFamilies:matches.length,matchedHeads:uniqueHits(matches),
   top3Families:top3.length,top3Heads:uniqueHits(top3)
  };
 };
 return {published,geometric:evaluate(pre.geometric),connected:evaluate(pre.connected)};
}
