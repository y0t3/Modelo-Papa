// Selecciona jornadas con resultados efectivos, no simples fechas de calendario.
// Sin resultados = no cuenta como jornada. No admite datos del futuro.
import {previousDrawDay} from './dates';
import {JURS,TURNOS} from './domain';
import type {CabezasDia} from './domain';
export type HistoricalDraw={date:string;heads:CabezasDia};
export function hasDrawResults(heads:CabezasDia):boolean{
 return TURNOS.some(t=>JURS.some(j=>/^\d{4}$/.test(heads[t]?.[j]||'')));
}
export async function loadPreviousDraws(
 targetDate:string,
 count:number,
 download:(date:string)=>Promise<CabezasDia>,
 maxLookback=24
):Promise<HistoricalDraw[]>{
 const found:HistoricalDraw[]=[];
 let cursor=targetDate;
 for(let checked=0;checked<maxLookback&&found.length<count;checked++){
  cursor=previousDrawDay(cursor);
  const heads=await download(cursor);
  if(hasDrawResults(heads))found.unshift({date:cursor,heads});
 }
 if(found.length<count)throw new Error('No alcanzan las jornadas efectivamente sorteadas para completar la memoria.');
 return found;
}
