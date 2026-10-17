// Figuras comprobadas por cabezas reales: episodios con pausas y varias fuentes.
// Sólo acontecimientos anteriores al PRE objetivo; NO lee resultados posteriores.
import type {SourceId} from '../src/sheet';
export type EpisodeMark={date:string;source:SourceId;shape:string;head:string;turn:string;jur:string};
export type EpisodePath={source:SourceId;shape:string;cells:string[];value:string};
export type EpisodeMode=
 'RETORNA_TRAS_SILENCIO'|'RETORNA_MISMA_FUENTE'|'RETORNA_OTRA_FUENTE'|
 'MULTIFUENTE_AYER'|'MULTIFUENTE_PERSISTENTE'|'VUELVE_A_SU_FUENTE';
export const episodeModes:EpisodeMode[]=[
 'RETORNA_TRAS_SILENCIO','RETORNA_MISMA_FUENTE','RETORNA_OTRA_FUENTE',
 'MULTIFUENTE_AYER','MULTIFUENTE_PERSISTENTE','VUELVE_A_SU_FUENTE'
];
export type EpisodeEvidence={
 shapeDays:number;sourceDays:number;distinctSources:number;
 lastDaySources:SourceId[];beforeLastSources:SourceId[];
 priorSourceDays:number;silentDays:number;
 comeback:boolean;returnSame:boolean;returnOther:boolean;
 multiYesterday:boolean;multiPersistent:boolean;sourceReentry:boolean;
 history:{date:string;sources:SourceId[]}[];
};
export function episodeEvidence(path:EpisodePath,previous:EpisodeMark[],
 dates:string[]):EpisodeEvidence{
 if(dates.length!==6||new Set(dates).size!==6||dates.some((d,i)=>i>0&&d<=dates[i-1]))
  throw Error('Se esperan seis jornadas REALES anteriores en orden creciente');
 const daily=new Map<string,Set<SourceId>>();
 for(const mark of previous){
  if(mark.shape!==path.shape||!dates.includes(mark.date))continue;
  let sources=daily.get(mark.date);
  if(!sources){sources=new Set<SourceId>();daily.set(mark.date,sources)}
  sources.add(mark.source);
 }
 const d1=dates[5],d2=dates[4];
 const recent=daily.get(d1)||new Set<SourceId>(),before=daily.get(d2)||new Set<SourceId>();
 const earlier=dates.slice(0,4);
 const someEarlier=earlier.some(d=>daily.has(d));
 const earlierInCurrentSource=earlier.some(d=>daily.get(d)?.has(path.source));
 const earlierInOtherSource=earlier.some(d=>[...(daily.get(d)||[])].some(x=>x!==path.source));
 const restored=recent.has(path.source)&&before.size===0&&someEarlier;
 const oldMultisource=dates.slice(0,5).some(d=>(daily.get(d)?.size||0)>=2);
 const multi=recent.size>=2&&recent.has(path.source);
 const movedBack=recent.has(path.source)&&before.size>0&&!before.has(path.source)&&
  earlierInCurrentSource;
 const distinctSources=new Set([...daily.values()].flatMap(x=>[...x])).size;
 return {
  shapeDays:daily.size,sourceDays:dates.filter(d=>daily.get(d)?.has(path.source)).length,
  distinctSources,
  lastDaySources:[...recent].sort(),beforeLastSources:[...before].sort(),
  priorSourceDays:earlier.filter(d=>daily.get(d)?.has(path.source)).length,
  silentDays:dates.filter(d=>!daily.has(d)).length,
  comeback:restored,
  returnSame:restored&&earlierInCurrentSource,
  returnOther:restored&&earlierInOtherSource,
  multiYesterday:multi,
  multiPersistent:multi&&oldMultisource,
  sourceReentry:movedBack,
  history:dates.map(d=>({date:d,sources:[...(daily.get(d)||[])].sort()}))
 };
}
export const episodeFlag=(s:EpisodeEvidence,m:EpisodeMode):boolean=>
 m==='RETORNA_TRAS_SILENCIO'?s.comeback:
 m==='RETORNA_MISMA_FUENTE'?s.returnSame:
 m==='RETORNA_OTRA_FUENTE'?s.returnOther:
 m==='MULTIFUENTE_AYER'?s.multiYesterday:
 m==='MULTIFUENTE_PERSISTENTE'?s.multiPersistent:s.sourceReentry;
export function episodeScore(s:EpisodeEvidence,m:EpisodeMode):number[]{
 return [Number(episodeFlag(s,m)),s.sourceDays,s.shapeDays,s.distinctSources,
  -s.silentDays];
}
