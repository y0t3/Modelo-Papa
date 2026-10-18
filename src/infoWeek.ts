// Semana histórica completa de INFO; sólo hechos de fechas anteriores.
import type {CabezasDia} from './domain';
import {hasDrawResults,hasNocturnoBase} from './drawHistory';
import type {InfoVisualDay} from './infoTurnHistory';
import {buildSheet} from './sheet';
export type DatedHeads={date:string;heads:CabezasDia};
export function buildInfoWeek(start:string,endExclusive:string,
 days:DatedHeads[],previousNight:CabezasDia):InfoVisualDay[]{
 let base=previousNight;
 const result:InfoVisualDay[]=[];
 const ordered=[...days].filter(x=>x.date>=start&&x.date<endExclusive)
  .sort((a,b)=>a.date.localeCompare(b.date));
 for(const day of ordered){
  if(hasDrawResults(day.heads))
   result.push({date:day.date,heads:day.heads,sheet:buildSheet(day.heads,base)});
  if(hasNocturnoBase(day.heads))base=day.heads;
 }
 // La galería avanza desde D−7 hacia la jornada más reciente.
 // Se construyen las hojas en este mismo orden para mantener la Nocturna base.
 return result;
}
