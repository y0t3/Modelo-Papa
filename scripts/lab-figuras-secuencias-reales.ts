// Laboratorio de secuencias COMPROBADAS de figuras VT3 antes del próximo sorteo.
// No hay memoria de números: las cifras se leen exclusivamente en el PRE +11.
import type {SourceId} from '../src/sheet';
export type RealMark={date:string;source:SourceId;shape:string;head:string;turn:string;jur:string};
export type AvailablePath={source:SourceId;shape:string;cells:string[];value:string};
export type SequenceEvidence={
 latestDay:string|null;sourceDays:number;shapeDays:number;otherSources:number;
 activeDays:number;recentTwo:boolean;twoOfThree:boolean;
 phaseAAB:boolean;phaseAABB:boolean;intradaySame:boolean;intradayOther:boolean;
 lastExclusiveSource:SourceId|null;activity:string[];
};
// days contains exactly the six most recent REAL completed draw jornadas, ascending.
export function sequenceEvidence(t:AvailablePath,previous:RealMark[],
 completedDays:string[],intraday:RealMark[]):SequenceEvidence{
 const daily=new Map<string,Set<SourceId>>();
 for(const e of previous){
  if(e.shape!==t.shape||!completedDays.includes(e.date))continue;
  let s=daily.get(e.date);if(!s){s=new Set();daily.set(e.date,s)}
  s.add(e.source);
 }
 const active=completedDays.filter(d=>daily.has(d));
 const contains=(day:string)=>daily.get(day)?.has(t.source)===true;
 const sourceDays=active.filter(contains).length;
 const allSources=new Set(active.flatMap(d=>[...(daily.get(d)||new Set<SourceId>())]));
 const recentTwo=completedDays.length>=2&&completedDays.slice(-2).every(contains);
 const twoOfThree=completedDays.slice(-3).filter(contains).length>=2;
 const singleton=(d:string)=>{const x=daily.get(d);return x?.size===1?[...x][0]:null};
 const last3=active.slice(-3),last4=active.slice(-4);
 // Only a sequence of physically CONFIRMED single-source marks A→A→B
 // or A→A→B→B. Last active mark must be from the most recent completed day.
 // Missing dates are NOT silently counted as continued activity.
 const recent=active.at(-1)===completedDays.at(-1);
 const aab=recent&&last3.length===3&&last3.every(d=>singleton(d)!==null)&&
  singleton(last3[0])===singleton(last3[1])&&
  singleton(last3[0])!==singleton(last3[2])&&singleton(last3[2])===t.source;
 const aabb=recent&&last4.length===4&&last4.every(d=>singleton(d)!==null)&&
  singleton(last4[0])===singleton(last4[1])&&
  singleton(last4[2])===singleton(last4[3])&&
  singleton(last4[0])!==singleton(last4[2])&&singleton(last4[3])===t.source;
 const same=intraday.some(e=>e.shape===t.shape&&e.source===t.source);
 const other=intraday.some(e=>e.shape===t.shape&&e.source!==t.source);
 return {
  latestDay:active.at(-1)||null,sourceDays,shapeDays:active.length,
  otherSources:allSources.size-(allSources.has(t.source)?1:0),
  activeDays:active.length,recentTwo,twoOfThree,phaseAAB:Boolean(aab),
  phaseAABB:Boolean(aabb),intradaySame:same,intradayOther:other,
  lastExclusiveSource:active.length?singleton(active.at(-1)!):null,
  activity:active.map(d=>d+':'+[...(daily.get(d)||[])].join(','))
 };
}
export type SequenceMode='DOS_SEGUIDAS'|'AAB'|'AABB'|'INTRADIA'|'DOS_E_INTRADIA';
export const sequenceModes:SequenceMode[]=['DOS_SEGUIDAS','AAB','AABB','INTRADIA','DOS_E_INTRADIA'];
export const flagged=(s:SequenceEvidence,mode:SequenceMode):boolean=>
 mode==='DOS_SEGUIDAS'?s.recentTwo:
 mode==='AAB'?s.phaseAAB:
 mode==='AABB'?s.phaseAABB:
 mode==='INTRADIA'?s.intradaySame:s.recentTwo&&s.intradaySame;
export function rankSequenceEvidence(s:SequenceEvidence,mode:SequenceMode):number[]{
 // Confirmed geometry first; number of routes NEVER becomes a fake history.
 // Days and source evidence are only tie-breaks, not candidate IDs.
 return [Number(flagged(s,mode)),Number(s.intradaySame),Number(s.recentTwo),
  Number(s.twoOfThree),s.sourceDays,s.shapeDays,s.otherSources];
}
