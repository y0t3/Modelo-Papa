/**
 * Auditoría VT3 AUX para puestos 1..20. No modifica motor oficial.
 * Evidencia de raíces previas por sitio o silueta; selección PRE sin POST.
 */
import {auxCanonicalPath} from './auxSantiagoNeuquen';
import type {AuxPath,AuxFamily} from './auxSantiagoNeuquen';
import type {AuxiliaryHistorical,AuxRank} from './motorLaloIntegral';

type Trace={id:string;date:string;shape:string;site:string;col:number};
export type AuxRankEvidence={
 family:string;rank:number;roots:number;d1:number;d7:number;
 physicalSites:number;crossingSites:number;
 exactEvents:number;exactDays:number;shiftEvents:number;shiftDays:number;
 historyDays:number;
};
const coord=(p:{row:number;col:number})=>p.row+':'+p.col;
export const shapeKey=(p:AuxPath)=>{
 const minRow=Math.min(...p.map(x=>x.row));
 const minCol=Math.min(...p.map(x=>x.col));
 const key=(xs:AuxPath)=>xs.map(x=>(x.row-minRow)+':'+(x.col-minCol)).join('>');
 return [key(p),key([...p].reverse())].sort()[0];
};
export function auxEvidenceIndex(history:readonly AuxiliaryHistorical[],targetDate:string){
 if(history.some(h=>h.date>=targetDate))
  throw Error('FUGA AUX VT3: raíz en la fecha objetivo o futura');
 const unique=[...new Map(history.map(h=>[h.date,h])).values()]
  .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 const byShape=new Map<string,Trace[]>();
 for(const h of unique){
  for(const e of h.aux.events[3]){
   if(e.date!==h.date)throw Error('FUGA AUX VT3: fecha de marca incompatible');
   for(const path of e.paths){
    if(path.length!==3||new Set(path.map(coord)).size!==3)
     throw Error('Geometría de raíz AUX inválida');
    const shape=shapeKey(path);
    const group=byShape.get(shape)||[];
    group.push({id:e.id,date:h.date,shape,site:auxCanonicalPath(path),
     col:Math.min(...path.map(c=>c.col))});
    byShape.set(shape,group);
   }
  }
 }
 return {byShape,dates:unique.map(h=>h.date)};
}
export function auxRankEvidence(
 ranked:readonly AuxRank[],physical:readonly AuxFamily[],
 idx:ReturnType<typeof auxEvidenceIndex>):AuxRankEvidence[]{
 const mapped=new Map(physical.map(f=>[f.family,f]));
 return ranked.map(rank=>{
  const paths=mapped.get(rank.family)?.paths||[];
  const siteKeys=new Set<string>(),crossKeys=new Set<string>();
  const exact=new Set<string>(),shift=new Set<string>();
  const exactDates=new Set<string>(),shiftDates=new Set<string>(),anyDays=new Set<string>();
  for(const p of paths){
   const site=auxCanonicalPath(p);
   if(siteKeys.has(site))continue;
   siteKeys.add(site);
   if(new Set(p.map(c=>c.source)).size>1)crossKeys.add(site);
   const column=Math.min(...p.map(c=>c.col));
   for(const old of idx.byShape.get(shapeKey(p))||[]){
    if(Math.abs(old.col-column)>2)continue;
    anyDays.add(old.date);
    if(old.site===site){exact.add(old.id);exactDates.add(old.date);}
    else {shift.add(old.id);shiftDates.add(old.date);}
   }
  }
  return {family:rank.family,rank:rank.rank,roots:rank.roots,d1:rank.d1,d7:rank.d7,
   physicalSites:siteKeys.size,crossingSites:crossKeys.size,
   exactEvents:exact.size,exactDays:exactDates.size,
   shiftEvents:shift.size,shiftDays:shiftDates.size,historyDays:anyDays.size};
 });
}
export type Selector='official'|'next'|'exact'|'shift'|'cross'|'root'|'neutral';
export function selectRanked20(
 entries:readonly AuxRankEvidence[],variant:Selector,key:string):string[]{
 if(variant==='official')return entries.filter(r=>r.rank<=10).map(r=>r.family);
 if(variant==='next')return entries.filter(r=>r.rank>10&&r.rank<=20).map(r=>r.family);
 // Se usa SOLO el Top20 del ranking original: mismas familias y mismo tablero.
 const input=entries.filter(r=>r.rank<=20);
 const n=Math.min(10,input.length);
 if(variant==='neutral'){
  const hash=(s:string)=>{
   let h=2166136261;
   for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
   return h>>>0;
  };
  return [...input].sort((a,b)=>hash(key+'|'+a.family)-hash(key+'|'+b.family)||
   a.family.localeCompare(b.family)).slice(0,n).map(x=>x.family);
 }
 const feature=(r:AuxRankEvidence)=>{
  switch(variant){
   case 'exact': return [r.exactDays,r.exactEvents,r.historyDays];
   case 'shift': return [r.shiftDays,r.shiftEvents,r.historyDays];
   case 'cross': return [Number(r.crossingSites>0),r.crossingSites,r.historyDays];
   case 'root': return [r.roots,r.d1,r.d7];
  }
  return [0];
 };
 const cmp=(a:number[],b:number[])=>{
  for(let i=0;i<a.length;i++)if(a[i]!==b[i])return b[i]-a[i];
  return 0;
 };
 return [...input].sort((a,b)=>cmp(feature(a),feature(b))||a.rank-b.rank)
  .slice(0,n).map(x=>x.family);
}
