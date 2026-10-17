// Auditoría descriptiva PRE de VT2 Nocturna: no utiliza la cabeza posterior
// para seleccionar familias. Los controles neutralizan volumen de candidatas
// y distribución de fuentes dentro del MISMO PRE. NO prueba causalidad.
import {reversibleFamily} from '../src/motorLalo';
import type {SourceId} from '../src/sheet';
export type FamilyWitness={
 family:string;source:SourceId;motherRank:number;
 historySource:SourceId;historyDays:number;priorDate:string;
 shape:string;cells:string[];historicalHeads:[string,string];
};
export type NightCandidate={family:string;source:SourceId;mother:string};
export type NightAudit={
 date:string;period:string;
 observed:{connected:number;official:number;both:number;onlyConnected:number;onlyOfficial:number};
 universe:{families:number;selected:number;winInPool:number;expectedUniform:number;expectedBySource:number};
 variant:{matutinoFirst:number;matutinoOnly:number;prevNocturnoFirst:number};
 group:Record<string,{pool:number;selected:number;winnerHeadsInPool:number;
  winnerHeadsSelected:number;expected:number}>;
 winningCases:{head:string;family:string;category:'onlyConnected'|'onlyOfficial'|'both'|'neither';
  connectedRank:number;officialRank:number;witness?:FamilyWitness}[];
 top6:{family:string;source:SourceId;motherRank:number;historyDays:number;hit:number}[];
};
export function analyzeNightCut(args:{
 date:string;period:string;heads:string[];
 all:NightCandidate[];officialFamilies:string[];mothers:FamilyWitness[];
}):NightAudit{
 const {date,period,heads,all,officialFamilies,mothers}=args;
 if(heads.some(h=>!/^\d{4}$/.test(h)))throw Error('Cabeza Nocturna incompleta');
 if(new Set(all.map(x=>x.family)).size!==all.length)
  throw Error('VT2 repetido en el listado de candidatas');
 const keys=heads.map(h=>reversibleFamily(h.slice(-2)));
 const occurrences=new Map<string,number>();
 for(const key of keys)occurrences.set(key,(occurrences.get(key)||0)+1);
 const witnesses=new Map(mothers.map(x=>[x.family,x]));
 const subset=all.slice(0,6),top=new Set(subset.map(x=>x.family));
 const officialTop=new Set(officialFamilies.slice(0,6));
 const group:NightAudit['group']={};
 const bySource=new Map<SourceId,{pool:NightCandidate[];selected:NightCandidate[]}>();
 for(const candidate of all){
  if(!bySource.has(candidate.source))bySource.set(candidate.source,{pool:[],selected:[]});
  const b=bySource.get(candidate.source)!;b.pool.push(candidate);
 }
 for(const candidate of subset)bySource.get(candidate.source)!.selected.push(candidate);
 let sourceExpected=0;
 for(const [source,b] of bySource){
  const inPool=b.pool.reduce((n,c)=>n+(occurrences.get(c.family)||0),0);
  const inSelected=b.selected.reduce((n,c)=>n+(occurrences.get(c.family)||0),0);
  const expected=b.pool.length?b.selected.length/b.pool.length*inPool:0;
  group[source]={pool:b.pool.length,selected:b.selected.length,
   winnerHeadsInPool:inPool,winnerHeadsSelected:inSelected,expected};
  sourceExpected+=expected;
 }
 const firstFromSource=(source:SourceId,only:boolean)=>{
  const from=all.filter(x=>x.source===source);
  const others=only?[]:all.filter(x=>x.source!==source);
  return new Set([...from,...others].slice(0,6).map(x=>x.family));
 };
 const matFirst=firstFromSource('Matutino',false);
 const matOnly=firstFromSource('Matutino',true);
 const prevFirst=firstFromSource('prevNocturno',false);
 const variant={
  matutinoFirst:keys.filter(x=>matFirst.has(x)).length,
  matutinoOnly:keys.filter(x=>matOnly.has(x)).length,
  prevNocturnoFirst:keys.filter(x=>prevFirst.has(x)).length
 };
 const winningCases=heads.map((head,i)=>{
  const family=keys[i],connectedRank=all.findIndex(x=>x.family===family)+1,
   officialRank=officialFamilies.indexOf(family)+1,
   c=top.has(family),o=officialTop.has(family);
  const category:NightAudit['winningCases'][number]['category']=
   c?(o?'both':'onlyConnected'):(o?'onlyOfficial':'neither');
  const selected=all.find(x=>x.family===family);
  return {head,family,category,connectedRank,officialRank,
   witness:selected?witnesses.get(selected.mother):undefined};
 });
 const tally=(category:NightAudit['winningCases'][number]['category'])=>
  winningCases.filter(x=>x.category===category).length;
 const found=winningCases.filter(x=>x.connectedRank>0).length;
 return {
  date,period,
  observed:{
   connected:tally('onlyConnected')+tally('both'),
   official:tally('onlyOfficial')+tally('both'),
   both:tally('both'),onlyConnected:tally('onlyConnected'),
   onlyOfficial:tally('onlyOfficial')
  },
  universe:{
   families:all.length,selected:subset.length,winInPool:found,
   expectedUniform:all.length?Math.min(6,all.length)/all.length*found:0,
   expectedBySource:sourceExpected
  },variant,group,winningCases,
  top6:subset.map(candidate=>{
   const witness=witnesses.get(candidate.mother);
   if(!witness)throw Error('VT2 huérfano de madre comprobada');
   return {family:candidate.family,source:candidate.source,
    motherRank:witness.motherRank,historyDays:witness.historyDays,
    hit:occurrences.get(candidate.family)||0};
  })
 };
}
export function summarizeNight(records:NightAudit[]){
 const totals={
  days:records.length,heads:records.length*5,connected:0,official:0,
  both:0,onlyConnected:0,onlyOfficial:0,
  poolSize:0,selectedSize:0,winInPool:0,
  variant:{matutinoFirst:0,matutinoOnly:0,prevNocturnoFirst:0},
  uniformExpected:0,sourceExpected:0,
  connectedBetterDays:0,officialBetterDays:0,equalDays:0,
  source:{} as Record<string,{pool:number;selected:number;winnersInPool:number;
   winnersSelected:number;expected:number}>,
  mothersByRank:{} as Record<string,{selected:number;wins:number}>,
  historyDays:{} as Record<string,{selected:number;wins:number}>
 };
 for(const v of records){
  totals.connected+=v.observed.connected;
  totals.official+=v.observed.official;
  totals.both+=v.observed.both;
  totals.onlyConnected+=v.observed.onlyConnected;
  totals.onlyOfficial+=v.observed.onlyOfficial;
  totals.poolSize+=v.universe.families;
  totals.selectedSize+=v.universe.selected;
  totals.winInPool+=v.universe.winInPool;
  for(const k of Object.keys(totals.variant) as (keyof NightAudit['variant'])[])
   totals.variant[k]+=v.variant[k];
  totals.uniformExpected+=v.universe.expectedUniform;
  totals.sourceExpected+=v.universe.expectedBySource;
  if(v.observed.connected>v.observed.official)totals.connectedBetterDays++;
  else if(v.observed.connected<v.observed.official)totals.officialBetterDays++;
  else totals.equalDays++;
  for(const [source,c] of Object.entries(v.group)){
   const k=totals.source[source]||={pool:0,selected:0,winnersInPool:0,
    winnersSelected:0,expected:0};
   k.pool+=c.pool;k.selected+=c.selected;
   k.winnersInPool+=c.winnerHeadsInPool;
   k.winnersSelected+=c.winnerHeadsSelected;k.expected+=c.expected;
  }
  for(const candidate of v.top6){
   const rankKey=String(candidate.motherRank<=3?'1–3':candidate.motherRank<=6?'4–6':'7–10');
   const r=totals.mothersByRank[rankKey]||={selected:0,wins:0};
   r.selected++;r.wins+=candidate.hit;
   const d=String(candidate.historyDays>=2?'2+':candidate.historyDays);
   const h=totals.historyDays[d]||={selected:0,wins:0};
   h.selected++;h.wins+=candidate.hit;
  }
 }
 return totals;
}
