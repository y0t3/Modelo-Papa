/** Minihojas AUX semanales (POST físico histórico, PRE para hoy). */
import {JURS} from './domain';
import type {CabezasDia,Turno} from './domain';
import {auxiliaryBoard,findAuxPaths} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads,AuxiliaryBoard,AuxPath} from './auxSantiagoNeuquen';
import {auxAtCut} from './auxTemporalModes';
import type {AuxMode} from './auxTemporalModes';
import {readableWeekday} from './infoTurnHistory';
export type AuxGalleryDay={date:string;heads:CabezasDia;
 yesterday:AuxiliaryHeads|null;today:AuxiliaryHeads|null;sourceDate:string|null};
export type AuxGalleryMark={jur:string;head:string;kind:'vt2'|'vt3'|'vt4';path:AuxPath};
export type AuxGalleryFrame={date:string;label:string;isCurrent:boolean;
 board:AuxiliaryBoard|null;marks:AuxGalleryMark[];
 matchedHeads:string[];sourceDate:string|null};
const KINDS=['vt2','vt3','vt4'] as const;
export function buildInfoAuxFrames(days:AuxGalleryDay[],current:AuxGalleryDay|null,
 turn:Turno,mode:AuxMode):AuxGalleryFrame[]{
 const input=[...days].filter(d=>d.date&&(!current||d.date<current.date))
  .sort((a,b)=>a.date.localeCompare(b.date));
 if(current)input.push(current);
 const frames:AuxGalleryFrame[]=[];
 for(const day of input){
  const raw=mode==='intrajornada'?day.today:day.yesterday;
  const board=raw?auxiliaryBoard(auxAtCut(raw,turn,mode),turn):null;
  const isCurrent=!!current&&day.date===current.date;
  const marks:AuxGalleryMark[]=[];
  if(board&&!isCurrent){
   for(const jur of JURS){
    const head=day.heads[turn]?.[jur]||'';
    if(!/^\d{4}$/.test(head))continue;
    for(const kind of KINDS){
     const value=head.slice(-Number(kind.slice(-1)));
     for(const path of findAuxPaths(board,value))
      marks.push({jur,head,kind,path});
    }
   }
  }
  const matchedHeads=[...new Set(marks.map(m=>m.jur+' · '+m.head))];
  frames.push({date:day.date,label:readableWeekday(day.date),
   isCurrent,board,marks,matchedHeads,
   sourceDate:mode==='intrajornada'?day.date:day.sourceDate});
 }
 return frames;
}
