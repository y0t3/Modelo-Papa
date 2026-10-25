/**
 * LAB: Nocturna anterior auténtica por jurisdicción, sin rellenar sorteos.
 * No toca la política oficial de raíces D−1 / D−7 ni la app.
 * Un día incompleto puede ser válido para unas jurisdicciones y no
 * para otras (ej. Uruguay con sorteo durante un feriado argentino).
 * La trazabilidad de fecha se guarda por cada fila del tablero.
 */
import {previousDrawDay} from './dates';
import {JURS,diaVacio} from './domain';
import type {CabezasDia,Jurisdiccion} from './domain';

export type NocturnaProvenance={
 target:string;heads:CabezasDia;
 dates:Partial<Record<Jurisdiccion,string>>;
 missing:Jurisdiccion[];
 checked:string[];
};
export async function nocturnaAnteriorPorJur(
 target:string,
 download:(day:string)=>Promise<CabezasDia>,
 maxLookback=20
):Promise<NocturnaProvenance>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(target)||
  Number.isNaN(new Date(target+'T12:00:00').getTime()))
  throw new Error('Fecha objetivo inválida: '+target);
 if(!Number.isInteger(maxLookback)||maxLookback<1||maxLookback>90)
  throw new Error('Lookback inválido');
 const heads=diaVacio();
 const missing=new Set<Jurisdiccion>(JURS),dates:Partial<Record<Jurisdiccion,string>>={};
 const checked:string[]=[];
 let date=target;
 for(let k=0;k<maxLookback&&missing.size;k++){
  date=previousDrawDay(date);
  if(date>=target)throw new Error('Fuga temporal en Nocturna base');
  checked.push(date);
  const draws=await download(date);
  for(const jur of [...missing]){
   const head=draws.Nocturno?.[jur]||'----';
   if(!/^\d{4}$/.test(head))continue;
   heads.Nocturno[jur]=head;
   dates[jur]=date;
   missing.delete(jur);
  }
 }
 // Si alguna jurisdicción carece de historia, no inventar cifras.
 return {target,heads,dates,missing:[...missing],checked};
}

/** En la galería INFO una noche parcial actualiza solo lo realmente salido. */
export function fusionarNocturnasPorJur(previous:CabezasDia,published:CabezasDia):CabezasDia{
 const next=diaVacio();
 for(const jur of JURS){
  const n=published.Nocturno?.[jur]||'----';
  const p=previous.Nocturno?.[jur]||'----';
  next.Nocturno[jur]=/^\d{4}$/.test(n)?n:/^\d{4}$/.test(p)?p:'----';
 }
 return next;
}
