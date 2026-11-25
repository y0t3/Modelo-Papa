import type {Turno,CabezasDia} from './domain';
import type {DailySheet} from './sheet';
import type {LaloKind} from './motorLalo';
import type {SourceId} from './sheet';
import {sha256} from './sha256';
import type {AuxiliaryHeads} from './auxSantiagoNeuquen';
import type {MatchEngine,MatchHit} from './matchStudy';
export type MatchFrame={date:string;turn:Turno;engine:MatchEngine;count:number;published:number;
 available:boolean;captured:boolean;hits:MatchHit[];sheet?:DailySheet;aux?:AuxiliaryHeads;
 routes?:Record<string,{sourceId:SourceId;value:string;path:{row:number;col:number}[]}[]>};
export type PreparedDay={date:string;signature:string;storedAt:number;
 frames:Record<LaloKind,MatchFrame[]>;complete:boolean};
export type PreparedStudy={date:string;dates:string[];days:PreparedDay[];progress:number;working:boolean;error:string;retry:()=>void};
export function selectMatchFrames(days:PreparedDay[],dates:string[],kind:LaloKind,engines:MatchEngine[],turns:Turno[]){
 const selected=new Set(dates);
 return days.filter(d=>selected.has(d.date)).flatMap(d=>d.frames[kind].filter(f=>engines.includes(f.engine)&&turns.includes(f.turn)));
}
export const compactSignature=(heads:CabezasDia,columns:DailySheet['columns'],refs:unknown)=>sha256(JSON.stringify([heads,columns,refs]));
