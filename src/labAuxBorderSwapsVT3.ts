/**
 * LAB VT3 AUX — intercambio mínimo de candidatas cerca del límite Top10.
 *
 * Una candidata del puesto 11-13 solo sustituye a una de 8-10 cuando su
 * evidencia PRE conjunta supera el umbral y sus raíces oficiales no son
 * más de una inferiores. No se usan resultados del turno que se evalúa.
 * Simulaciones neutrales conservan EL MISMO número de intercambios.
 */
import type {AuxRankEvidence} from './labAuxTop20AuditVT3';
import type {TemporalEvidence} from './labAuxTemporalVT3';
export type BorderEvidence=AuxRankEvidence&TemporalEvidence;
export type BorderPolicy='one'|'two';
export type BorderSwap={
 out:string;outRank:number;in:string;inRank:number;
 oldScore:number;newScore:number;margin:number;
 evidence:{outDays:number;inDays:number;outExact:number;inExact:number;
  outCross:number;inCross:number;outRoots:number;inRoots:number}
};
export type BorderChoice={selected:string[];swaps:BorderSwap[]};
const hash=(s:string)=>{
 let h=2166136261;
 for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
};
export function borderScore(r:BorderEvidence){
 // Escala fija y deliberadamente simple, no entrenada con el POST.
 return 2*Math.min(r.distinctDays,4)+2*Math.min(r.exactDays,2)
  +Math.min(r.shiftDays,3)*0.5+Number(r.crossingSites>0)
  +Math.min(r.roots,5)*0.5+Number(r.d1>0&&r.d7>0);
}
const compare=(a:BorderEvidence,b:BorderEvidence)=>
 borderScore(b)-borderScore(a)||a.rank-b.rank;
const evidence=(out:BorderEvidence,inside:BorderEvidence)=>({
 outDays:out.distinctDays,inDays:inside.distinctDays,
 outExact:out.exactDays,inExact:inside.exactDays,
 outCross:out.crossingSites,inCross:inside.crossingSites,
 outRoots:out.roots,inRoots:inside.roots
});
/** Intercambia como máximo uno o dos puestos. Conserva 1..7, jamás amplía el Top10. */
export function borderTop10(
 ranks:readonly BorderEvidence[],policy:BorderPolicy):BorderChoice{
 const ordered=[...ranks].sort((a,b)=>a.rank-b.rank);
 const base=ordered.filter(r=>r.rank<=10);
 if(new Set(ordered.map(r=>r.family)).size!==ordered.length)
  throw Error('FUGA: familia PRE duplicada en límites');
 if(ordered.length<20||base.length!==10)
  return {selected:base.map(r=>r.family),swaps:[]};
 const incumbent=ordered.filter(r=>r.rank>=8&&r.rank<=10);
 const challengers=ordered.filter(r=>r.rank>=11&&r.rank<=13);
 const matches: Array<{out:BorderEvidence;inside:BorderEvidence;margin:number}>=[];
 for(const out of incumbent)for(const inside of challengers){
  const margin=borderScore(inside)-borderScore(out);
  if(inside.roots>=out.roots-1&&margin>=1)
   matches.push({out,inside,margin});
 }
 matches.sort((a,b)=>b.margin-a.margin||
  compare(a.inside,b.inside)||b.out.rank-a.out.rank);
 const usedOut=new Set<string>(),usedIn=new Set<string>(),swaps:BorderSwap[]=[];
 for(const m of matches){
  if(usedOut.has(m.out.family)||usedIn.has(m.inside.family))continue;
  usedOut.add(m.out.family);usedIn.add(m.inside.family);
  swaps.push({out:m.out.family,outRank:m.out.rank,in:m.inside.family,
   inRank:m.inside.rank,oldScore:borderScore(m.out),
   newScore:borderScore(m.inside),margin:m.margin,
   evidence:evidence(m.out,m.inside)});
  if(swaps.length>=(policy==='one'?1:2))break;
 }
 return {selected:base.filter(r=>!usedOut.has(r.family)).map(r=>r.family)
  .concat(swaps.map(s=>s.in)),swaps};
}
/** Control nulo: swaps del mismo borde y cantidad que la política evaluada. */
export function borderNeutral(
 ranks:readonly BorderEvidence[],count:number,seed:string):BorderChoice{
 const ordered=[...ranks].sort((a,b)=>a.rank-b.rank);
 const base=ordered.filter(r=>r.rank<=10);
 if(ordered.length<20||base.length!==10||count===0)
  return {selected:base.map(r=>r.family),swaps:[]};
 if(count<0||count>2)throw Error('Conteo de swaps fuera del presupuesto');
 const from=ordered.filter(r=>r.rank>=8&&r.rank<=10)
  .sort((a,b)=>hash(seed+'|OUT|'+a.family)-hash(seed+'|OUT|'+b.family)||
   a.rank-b.rank).slice(0,count);
 const into=ordered.filter(r=>r.rank>=11&&r.rank<=13)
  .sort((a,b)=>hash(seed+'|IN|'+a.family)-hash(seed+'|IN|'+b.family)||
   a.rank-b.rank).slice(0,count);
 const swaps=from.map((out,i)=>({out:out.family,outRank:out.rank,
  in:into[i].family,inRank:into[i].rank,oldScore:borderScore(out),
  newScore:borderScore(into[i]),margin:borderScore(into[i])-borderScore(out),
  evidence:evidence(out,into[i])}));
 const removed=new Set(from.map(r=>r.family));
 return {selected:base.filter(r=>!removed.has(r.family)).map(r=>r.family)
  .concat(into.map(r=>r.family)),swaps};
}
