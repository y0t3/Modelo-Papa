// Estadísticas descriptivas de cabezas publicadas. NUNCA usa la hoja +11 ni sus motores.
import type {CabezasDia,Turno} from './domain';
import type {HistoricHeadsDay} from './historicalHeadFrequency';
export const STAT_JURS=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos'] as const;
export type StatScope='todas'|typeof STAT_JURS[number];
export type StatMode='atrasados'|'frios'|'calientes'|'recientes';
export type StatEvent={date:string;jur:string;head:string};
export type StatNumber={value:string;count:number;daysSeen:number;lastDate:string|null;
 lastJur:string|null;delay:number|null;events:StatEvent[]};
export type StatResult={all:StatNumber[];ranked:StatNumber[];top:StatNumber[];
 days:number;heads:number;window:number;missingDates:number;
 oldestDate:string|null;latestDate:string|null;unseen:number;
 scope:StatScope;mode:StatMode};
export const STAT_MODE_LABELS:Record<StatMode,string>={
 atrasados:'Atrasados',frios:'Fríos',calientes:'Calientes',recientes:'Recientes'
};
const two=(n:number)=>String(n).padStart(2,'0');
export function headStats(days:HistoricHeadsDay[],date:string,turn:Turno,
 window:60|110,mode:StatMode,scope:StatScope='todas'):StatResult{
 const unique=new Map<string,CabezasDia>();
 for(const day of days)if(day.date&&day.date<date)unique.set(day.date,day.heads);
 const sorted=[...unique.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
 // Exigir las cinco cabezas evita mezclar jornadas parciales con completas.
 const full=sorted.filter(([,heads])=>STAT_JURS.every(j=>
  /^\d{4}$/.test(heads?.[turn]?.[j]||'')));
 const observed=full.slice(-window);
 const jurs=scope==='todas'?STAT_JURS:[scope];
 const all:StatNumber[]=Array.from({length:100},(_,n)=>({
  value:two(n),count:0,daysSeen:0,lastDate:null,lastJur:null,delay:null,events:[]
 }));
 for(const [day,heads] of observed){
  const seen=new Set<string>();
  for(const jur of jurs){
   const head=heads[turn][jur],x=all[Number(head.slice(-2))];
   x.count++;x.lastDate=day;x.lastJur=jur;
   x.events.push({date:day,jur,head});
   seen.add(x.value);
  }
  for(const v of seen)all[Number(v)].daysSeen++;
 }
 const index=new Map(observed.map(([d],i)=>[d,i]));
 for(const x of all)if(x.lastDate)x.delay=observed.length-1-(index.get(x.lastDate)||0);
 const ranked=[...all].filter(x=>mode!=='atrasados'||x.lastDate!==null);
 ranked.sort((a,b)=>{
  if(mode==='atrasados')return (b.delay??-1)-(a.delay??-1)||
   a.count-b.count||a.value.localeCompare(b.value);
  if(mode==='frios')return a.count-b.count||
   (b.delay??observed.length)-(a.delay??observed.length)||
   a.value.localeCompare(b.value);
  if(mode==='calientes')return b.count-a.count||b.daysSeen-a.daysSeen||
   (b.lastDate||'').localeCompare(a.lastDate||'')||a.value.localeCompare(b.value);
  return (b.lastDate||'').localeCompare(a.lastDate||'')||
   b.count-a.count||a.value.localeCompare(b.value);
 });
 return {all,ranked,top:ranked.slice(0,6),days:observed.length,
  heads:observed.length*jurs.length,window,
  missingDates:sorted.length-full.length,
  oldestDate:observed[0]?.[0]||null,latestDate:observed.at(-1)?.[0]||null,
  unseen:all.filter(x=>!x.lastDate).length,scope,mode};
}
