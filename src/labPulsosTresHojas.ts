/**
 * Pulso cronológico por HUELLA elegida en los Tops.
 * Sin agrupar por número, sin reordenar motores y sin consultar resultados.
 * Cada tablero conserva su propio espacio de coordenadas.
 */
import type {Board,Figure,Kind} from './labRadarFiguras';
export type Photo={date:string;turn:string;figures:Figure[]};
export type Pulse={
 date:string;turn:string;board:Board;kind:Kind;source:string;site:string;
 shape:string;engines:string[];currentReadings:string[];
 previousDays:number;seenInLast3:number;seenInLast6:number;
 wasPresentPreviousDay:boolean;newAfterThree:boolean;
 repeatedOnThreeDays:boolean;previousDates:string[];
};
const key=(f:Figure)=>[f.board,f.kind,f.source,f.site].join('|');
export function pulsesForSnapshot(current:Photo,older:Photo[],window=6):Pulse[]{
 if(older.some(p=>p.date>=current.date))throw Error('Radar temporal leyó jornada presente/futura');
 if(current.figures.some(f=>f.date!==current.date||f.turn!==current.turn))
  throw Error('Figura fuera del corte actual');
 const recent=[...older].sort((a,b)=>a.date.localeCompare(b.date)).slice(-window);
 const uniqueDays=new Set(recent.map(x=>x.date));
 if(uniqueDays.size!==recent.length)throw Error('Hay fechas anteriores duplicadas');
 const maps=recent.map(p=>new Set(p.figures.map(key)));
 return current.figures.map(f=>{
  const match=maps.map((m,i)=>m.has(key(f))?recent[i].date:null)
   .filter((d):d is string=>!!d);
  return {
   date:current.date,turn:current.turn,board:f.board,kind:f.kind,
   source:f.source,site:f.site,shape:f.shape,
   engines:f.engines,currentReadings:f.readings,
   previousDays:recent.length,seenInLast3:match.filter(x=>
    recent.slice(-3).some(p=>p.date===x)).length,
   seenInLast6:match.length,
   wasPresentPreviousDay:match.includes(recent.at(-1)?.date||''),
   newAfterThree:recent.length>=3&&!match.some(x=>
    recent.slice(-3).some(p=>p.date===x)),
   repeatedOnThreeDays:match.length>=2,
   previousDates:match
  };
 });
}
/** Counts only ACTUAL selected sites. Not all physically possible routes. */
export function summarizePulses(pulses:Pulse[]){
 return Object.fromEntries((['PLUS11','AUX_AYER','AUX_HOY'] as Board[])
  .flatMap(board=>(['VT2','VT3'] as Kind[]).map(kind=>{
   const items=pulses.filter(x=>x.board===board&&x.kind===kind);
   const readable=items.filter(x=>x.previousDays>=3);
   return [board+'_'+kind,{
    sites:items.length,withEnoughHistory:readable.length,
    newAfter3:readable.filter(x=>x.newAfterThree).length,
    previousDay:readable.filter(x=>x.wasPresentPreviousDay).length,
    atLeast3Days:readable.filter(x=>x.repeatedOnThreeDays).length,
    topExamples:readable.filter(x=>x.repeatedOnThreeDays)
     .sort((a,b)=>b.seenInLast6-a.seenInLast6)
     .slice(0,3).map(p=>({source:p.source,site:p.site,
      count:p.seenInLast6,dates:p.previousDates,
      readingsNow:p.currentReadings,engines:p.engines}))
   }];
  })));
}
