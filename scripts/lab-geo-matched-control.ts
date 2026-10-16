// SOLO AUDITORÍA: controles neutrales estratificados por fuente/forma,
// manteniendo una prioridad estable dentro de cada jornada. No modifica
// el motor de Geometría completa ni el motor Lalo.
import {allPhysicalVt3} from '../src/vt3Shadow';
import {reversibleFamily} from '../src/motorLalo';
import {TURNOS} from '../src/domain';
import type {Turno} from '../src/domain';
import type {DailySheet,SourceId} from '../src/sheet';
import type {ShadowMother} from '../src/vt3Shadow';

type Point={row:number;col:number};
export type RouteCandidate={family:string;source:SourceId;shape:string;cells:string[]};
export type CutProfile={
 date:string;turn:Turno;headFamilies:string[];
 top3:{family:string;source:SourceId;shape:string;cells:string[];sameSourceCandidates:number;sameShapeCandidates:number}[];
 top10:{family:string;source:SourceId;cells:string[]}[];
 routes:RouteCandidate[];
 distinctFamilyCount:number;
 distinctFamiliesBySource:Record<string,number>;
 pathsPerTop3:number[];
 sourcesPerTop3:number[];
 sourceCountPerFamily:Record<string,number>;
 distinctFamilySources:string[];
};
const toKey=(p:Point)=>p.row+':'+p.col;
const coords=(cells:string[]):Point[]=>cells.map(x=>{
 const [row,col]=x.split(':').map(Number);return {row,col};
});
export function geomShape(cells:string[]):string{
 const ps=coords(cells);
 const steps=(items:Point[])=>items.slice(1).map((p,i)=>
  (p.row-items[i].row)+','+(p.col-items[i].col)).join(';');
 return [steps(ps),steps([...ps].reverse())].sort()[0];
}
export function profileCut(date:string,turn:Turno,sheet:DailySheet,
 top:ShadowMother[],headFamilies:string[]):CutProfile{
 const routes:RouteCandidate[]=[];
 for(const c of sheet.columns.slice(0,TURNOS.indexOf(turn)+1)){
  for(const p of allPhysicalVt3(c.values)){
   const cells=p.map(toKey);
   routes.push({family:reversibleFamily(p.map(d=>d.digit).join('')),
    source:c.id,shape:geomShape(cells),cells});
  }
 }
 const families=new Set(routes.map(x=>x.family));
 const sourceByFam=new Map<string,Set<string>>();
 const distinctBySource=new Map<string,Set<string>>();
 for(const route of routes){
  if(!sourceByFam.has(route.family))sourceByFam.set(route.family,new Set());
  sourceByFam.get(route.family)!.add(route.source);
  if(!distinctBySource.has(route.source))distinctBySource.set(route.source,new Set());
  distinctBySource.get(route.source)!.add(route.family);
 }
 const leaders=top.slice(0,3).map(t=>{
  const shape=geomShape(t.cells);
  return {family:t.family,source:t.source,shape,cells:t.cells,
   sameSourceCandidates:new Set(routes.filter(r=>r.source===t.source).map(r=>r.family)).size,
   sameShapeCandidates:new Set(routes.filter(r=>r.source===t.source&&r.shape===shape).map(r=>r.family)).size};
 });
 for(const t of leaders)if(!routes.some(r=>r.family===t.family&&r.source===t.source&&
   r.shape===t.shape&&r.cells.join('>')===t.cells.join('>')))
  throw new Error('La huella elegida no está en la hoja: '+date+' '+turn+' '+t.family);
 return {
  date,turn,headFamilies,top3:leaders,top10:top.map(t=>({family:t.family,source:t.source,cells:t.cells})),routes,
  distinctFamilyCount:families.size,
  distinctFamiliesBySource:Object.fromEntries([...distinctBySource].map(([k,v])=>[k,v.size])),
  pathsPerTop3:leaders.map(t=>routes.filter(r=>r.family===t.family).length),
  sourcesPerTop3:leaders.map(t=>sourceByFam.get(t.family)?.size||0),
  sourceCountPerFamily:Object.fromEntries([...sourceByFam].map(([k,v])=>[k,v.size])),
  distinctFamilySources:[...new Set(routes.map(r=>r.source))]};
}
const hashString=(s:string):number=>{
 let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
 return h>>>0;
};
const mixing=(x:number)=>{x=(x^x>>>16)>>>0;x=Math.imul(x,0x7feb352d);x=(x^x>>>15)>>>0;
 x=Math.imul(x,0x846ca68b);return (x^x>>>16)>>>0;};
type MatchedMethod='MISMA_FUENTE'|'MISMA_FORMA_Y_FUENTE';
export function sampleNeutral(cut:CutProfile,method:MatchedMethod,seed:number):{
 selected:string[];headHits:number;fallbacks:number;sizes:number[]
}{
 const selected:string[]=[];let fallbacks=0;
 const sizes:number[]=[];
 for(const leader of cut.top3){
  const strict=new Set(cut.routes.filter(r=>
   r.source===leader.source&&(method==='MISMA_FUENTE'||r.shape===leader.shape))
   .map(r=>r.family));
  const available=[...strict].filter(x=>!selected.includes(x));
  let options=available;
  if(!options.length){
   fallbacks++;
   const bySource=[...new Set(cut.routes.filter(r=>r.source===leader.source).map(r=>r.family))]
     .filter(x=>!selected.includes(x));
   options=bySource.length?bySource:[...new Set(cut.routes.map(r=>r.family))].filter(x=>!selected.includes(x));
  }
  if(!options.length)throw Error('Bolsa neutral vacía');
  sizes.push(strict.size);
  const key=cut.date+'|'+(method==='MISMA_FUENTE'?leader.source:leader.source+'|'+leader.shape);
  // Orden pseudoaleatorio de familias estable durante el día para cada estrato
  // y réplica. No re-sortear arbitrariamente entre turnos de la misma fecha.
  let best=options[0],bestH=0xffffffff;
  for(const candidate of options){
   const h=mixing(hashString(candidate+'|'+key)^seed);
   if(h<bestH||(h===bestH&&candidate<best)){bestH=h;best=candidate}
  }
  selected.push(best);
 }
 return {selected,headHits:cut.headFamilies.filter(f=>selected.includes(f)).length,
  fallbacks,sizes};
}
export function analyzeGeometryMemory(profiles:CutProfile[]){
 const ordered=[...profiles].sort((a,b)=>a.date.localeCompare(b.date)||
  TURNOS.indexOf(a.turn)-TURNOS.indexOf(b.turn));
 const transitions:any[]=[];
 const winningTop3:any[]=[];
 for(const p of ordered){
  const turnIdx=TURNOS.indexOf(p.turn);
  const prev=turnIdx?ordered.find(c=>c.date===p.date&&TURNOS.indexOf(c.turn)===turnIdx-1):undefined;
  const initial=ordered.find(c=>c.date===p.date&&c.turn==='Previa');
  const inInitial=new Set(initial?.routes.map(r=>r.family)||[]);
  const top3InInitial=new Set(initial?.top3.map(x=>x.family)||[]);
  for(const family of p.headFamilies.filter(h=>p.top3.some(t=>t.family===h)))
   winningTop3.push({date:p.date,turn:p.turn,family,
    selectedSincePrevia:top3InInitial.has(family),
    eligibleSincePrevia:inInitial.has(family),
    currentTopSource:p.top3.find(t=>t.family===family)?.source});
  if(!prev)continue;
  const oldSet=new Set(prev.top3.map(x=>x.family)),newSet=new Set(p.top3.map(x=>x.family));
  const prevSources=new Set(prev.routes.map(r=>r.source)),latest=p.routes
   .filter(r=>!prevSources.has(r.source));
  const newlyAvailable=new Set(latest.map(r=>r.family));
  const newlyInTop=p.top3.filter(t=>!oldSet.has(t.family));
  const unchanged=p.top3.filter(t=>oldSet.has(t.family));
  transitions.push({date:p.date,turn:p.turn,stableFamilies:newlyInTop.length===0,
   newTopFamilies:newlyInTop.map(t=>t.family),
   newTopFromJustAddedSource:newlyInTop.filter(t=>!prevSources.has(t.source)).map(t=>t.family),
   totalNewlyAvailableFamilies:[...new Set(p.routes.map(r=>r.family))]
    .filter(f=>!prev.routes.some(x=>x.family===f)).length,
   latestSource:latest[0]?.source||null,
   winningFamilyNewInPhysical: p.headFamilies.filter(f=>newlyAvailable.has(f)&&
     !prev.routes.some(r=>r.family===f)),
   persistentTopSourcesChanged:unchanged.filter(t=>{
    const old=prev.top3.find(x=>x.family===t.family)!;
    return old.source!==t.source}).map(t=>t.family),
   persistentTopWitnessMoved:unchanged.filter(t=>{
    const old=prev.top3.find(x=>x.family===t.family)!;
    return old.source!==t.source||old.cells.join('>')!==t.cells.join('>')}).map(t=>t.family)
  });
 }
 return {transitions,winningTop3,
  stable:transitions.filter(t=>t.stableFamilies).length,changed:transitions.filter(t=>!t.stableFamilies).length,
  enteredFromNewSource:transitions.reduce((n,t)=>n+t.newTopFromJustAddedSource.length,0),
  changedWitnessForSameFamily:transitions.reduce((n,t)=>n+t.persistentTopWitnessMoved.length,0),
  allWinningTop3SelectedInPrevia:winningTop3.filter(t=>t.selectedSincePrevia).length,
  allWinningTop3EligibleInPrevia:winningTop3.filter(t=>t.eligibleSincePrevia).length,
  weeklySnapshots:transitions};
}
export function frozenPreviaComparison(profiles:CutProfile[]){
 const dates=[...new Set(profiles.map(p=>p.date))].sort();
 const rows:any[]=[];
 for(const date of dates){
  const day=profiles.filter(p=>p.date===date).sort((a,b)=>
   TURNOS.indexOf(a.turn)-TURNOS.indexOf(b.turn));
  const previa=day.find(p=>p.turn==='Previa');
  if(!previa)continue;
  const original=previa.top3.map(t=>t.family);
  for(const cut of day){
   const current=cut.top3.map(t=>t.family);
   const fixedHits=cut.headFamilies.filter(f=>original.includes(f)).length;
   const dynamicHits=cut.headFamilies.filter(f=>current.includes(f)).length;
   rows.push({date,turn:cut.turn,original,current,
    fixedHits,dynamicHits,delta:dynamicHits-fixedHits,
    unchanged:current.every(x=>original.includes(x)),
    fixedPresentPhysically:original.every(f=>cut.routes.some(r=>r.family===f))});
  }
 }
 if(rows.some(x=>!x.fixedPresentPhysically))throw Error('Familia inicial desapareció de la hoja posterior');
 const get=(arr:typeof rows)=>({
  cuts:arr.length,staticHits:arr.reduce((n,r)=>n+r.fixedHits,0),
  dynamicHits:arr.reduce((n,r)=>n+r.dynamicHits,0),
  dynamicImproved:arr.filter(r=>r.delta>0),dynamicWorsened:arr.filter(r=>r.delta<0),
  dynamicIdenticalHeadHits:arr.filter(r=>r.delta===0).length,
  daysWithAnyTop3Change:new Set(arr.filter(r=>!r.unchanged).map(r=>r.date)).size
 });
 return {all:get(rows),afterPrevia:get(rows.filter(r=>r.turn!=='Previa')),
  explored:get(rows.filter(r=>r.date<='2026-10-10')),
  later:get(rows.filter(r=>r.date>'2026-10-10')),
  byTurn:Object.fromEntries(TURNOS.map(t=>[t,get(rows.filter(r=>r.turn===t))])),rows};
}
export function neutralComparison(cuts:CutProfile[],draws=2500){
 const methods:MatchedMethod[]=['MISMA_FUENTE','MISMA_FORMA_Y_FUENTE'];
 const observed=cuts.reduce((n,c)=>n+c.headFamilies.filter(f=>c.top3.some(t=>t.family===f)).length,0);
 const byMethod:any={};
 for(const method of methods){
  const counts:number[]=[],fallbacks:number[]=[];
  let realFallbacks=0;
  for(let rep=0;rep<draws;rep++){
   let n=0,falls=0;
   const seed=mixing(rep+20261016);
   for(const cut of cuts){
    const sample=sampleNeutral(cut,method,seed);n+=sample.headHits;falls+=sample.fallbacks;
   }
   counts.push(n);fallbacks.push(falls);
  }
  counts.sort((a,b)=>a-b);
  const mean=counts.reduce((a,b)=>a+b,0)/draws;
  realFallbacks=fallbacks.reduce((a,b)=>a+b,0)/draws;
  const select=(p:number)=>counts[Math.floor(p*(draws-1))];
  byMethod[method]={
   observed,draws,mean,interval95:[select(.025),select(.975)],
   tailAtLeastObserved:counts.filter(x=>x>=observed).length/draws,
   expectedFallbackSlots:realFallbacks,
   medianStratumSize:undefined,
   note:'Descriptivo y post hoc. Desempates neutralizados dentro del mismo día, fuente y forma; no estima probabilidad prospectiva.'
  };
 }
 return {observed,byMethod};
}
