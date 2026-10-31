/**
 * LAB AUX VT3 · memoria temporal de eventos ganadores geométricamente compatibles.
 *
 * La política PRE no recibe cifras ganadoras del turno objetivo. Cada cabeza
 * histórica se cuenta una sola vez por familia, aunque tenga múltiples rutas.
 * Se compara la misma lista de 20 familias del ranking original, sin nuevas
 * formaciones y sin compartir evidencia entre AUX_AYER y AUX_HOY.
 */
import {auxCanonicalPath} from './auxSantiagoNeuquen';
import type {AuxFamily,AuxPath} from './auxSantiagoNeuquen';
import type {AuxRank} from './motorLaloIntegral';
import {shapeKey} from './labAuxTop20AuditVT3';
import type {auxEvidenceIndex} from './labAuxTop20AuditVT3';

type Index=ReturnType<typeof auxEvidenceIndex>;
export type TemporalEvidence={
 family:string;rank:number;roots:number;d1:number;d7:number;
 eventCount:number;distinctDays:number;latestDayEvents:number;
 maxDayEvents:number;concentration:number;effectiveDays:number;
 dayHistogram:ReadonlyArray<{date:string;events:number}>;
};
export type TemporalSelector='official'|'next'|'spread'|'effective'|
 'cluster'|'recent'|'volume'|'neutral';
const hash=(s:string)=>{
 let h=2166136261;
 for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
};
export function temporalEvidence(
 ranked:readonly AuxRank[],physical:readonly AuxFamily[],index:Index
):TemporalEvidence[]{
 const map=new Map(physical.map(x=>[x.family,x]));
 return ranked.map(rank=>{
  const paths=map.get(rank.family)?.paths||[];
  const ids=new Map<string,string>(),seenSites=new Set<string>();
  for(const path of paths){
   const site=auxCanonicalPath(path);
   if(seenSites.has(site))continue;
   seenSites.add(site);
   const col=Math.min(...path.map(c=>c.col));
   for(const old of index.byShape.get(shapeKey(path))||[]){
    if(Math.abs(old.col-col)>2)continue;
    const prev=ids.get(old.id);
    if(prev&&prev!==old.date)throw Error('FUGA TEMPORAL: mismo evento en dos fechas');
    ids.set(old.id,old.date);
   }
  }
  const days=new Map<string,number>();
  for(const date of ids.values())days.set(date,(days.get(date)||0)+1);
  const counts=[...days.values()];
  const eventCount=ids.size,distinctDays=days.size;
  const maxDayEvents=counts.length?Math.max(...counts):0;
  const sumSquares=counts.reduce((a,b)=>a+b*b,0);
  return {family:rank.family,rank:rank.rank,roots:rank.roots,d1:rank.d1,d7:rank.d7,
   eventCount,distinctDays,latestDayEvents:days.get(index.dates[0])||0,
   maxDayEvents,concentration:eventCount?maxDayEvents/eventCount:0,
   effectiveDays:sumSquares?eventCount*eventCount/sumSquares:0,
   dayHistogram:[...days].map(([date,events])=>({date,events}))
    .sort((a,b)=>b.date.localeCompare(a.date))};
 });
}
/** Desde el mismo Top20, diez familias PRE. Nunca se miran aciertos POST. */
export function temporalTop10(rows:readonly TemporalEvidence[],
 selector:TemporalSelector,seed:string):string[]{
 const input=rows.filter(r=>r.rank<=20);
 if(new Set(input.map(r=>r.family)).size!==input.length)
  throw Error('Familia duplicada en ranking PRE');
 const n=Math.min(input.length,10);
 if(selector==='official')return input.filter(r=>r.rank<=10).map(r=>r.family);
 if(selector==='next')return input.filter(r=>r.rank>10).map(r=>r.family).slice(0,n);
 const priority=(r:TemporalEvidence):number[]=>{
  if(selector==='spread')return [r.distinctDays,r.eventCount,r.latestDayEvents];
  if(selector==='effective')return [r.effectiveDays,r.distinctDays,r.eventCount];
  if(selector==='cluster')return [r.maxDayEvents,r.eventCount,r.distinctDays];
  if(selector==='recent')return [r.latestDayEvents,r.distinctDays,r.eventCount];
  if(selector==='volume')return [r.eventCount,r.distinctDays,r.latestDayEvents];
  return [0];
 };
 const rankCompare=(a:number[],b:number[])=>{
  for(let i=0;i<a.length;i++)if(a[i]!==b[i])return b[i]-a[i];
  return 0;
 };
 return [...input].sort((a,b)=>selector==='neutral'
  ? hash(seed+'|'+a.family)-hash(seed+'|'+b.family)||a.family.localeCompare(b.family)
  : rankCompare(priority(a),priority(b))||a.rank-b.rank).slice(0,n).map(r=>r.family);
}
