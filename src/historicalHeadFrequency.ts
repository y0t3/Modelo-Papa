// Resultados publicados únicamente. Independiente de hojas, motores y pronósticos.
import {JURS} from './domain';
import type {CabezasDia,Turno} from './domain';

export type HistoricHeadsDay={date:string;heads:CabezasDia};
export type FrequencyRank={value:string;count:number;days:number;lastSeen:string};
export type FrequencyResult={top:FrequencyRank[];observations:number;days:number;
 distinct:number;thirdTied:boolean};
const JURISDICTIONS=JURS.filter(j=>j!=='Montevideo');
export function historicalHeadFrequency(days:HistoricHeadsDay[],date:string,turn:Turno,
 digits:2|3|4):FrequencyResult{
 const byDate=new Map<string,CabezasDia>();
 for(const day of days){
  if(day.date&&day.date<date)byDate.set(day.date,day.heads);
 }
 const counts=new Map<string,{value:string;count:number;dates:Set<string>;lastSeen:string}>();
 let observations=0,observedDays=0;
 for(const [day,heads] of [...byDate.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
  let seen=false;
  for(const jur of JURISDICTIONS){
   const head=heads?.[turn]?.[jur]||'';
   if(!/^\d{4}$/.test(head))continue;
   seen=true;observations++;
   const value=head.slice(-digits);
   const existing=counts.get(value)||{value,count:0,dates:new Set<string>(),lastSeen:day};
   existing.count++;
   existing.dates.add(day);
   if(day>existing.lastSeen)existing.lastSeen=day;
   counts.set(value,existing);
  }
  if(seen)observedDays++;
 }
 const all=[...counts.values()].map(x=>({value:x.value,count:x.count,
  days:x.dates.size,lastSeen:x.lastSeen})).sort((a,b)=>
  b.count-a.count||b.days-a.days||b.lastSeen.localeCompare(a.lastSeen)||
  a.value.localeCompare(b.value));
 const third=all[2];
 return {top:all.slice(0,3),observations,days:observedDays,distinct:all.length,
  thirdTied:!!third&&all.slice(3).some(x=>x.count===third.count)};
}
