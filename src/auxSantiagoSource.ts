/**
 * Adaptador del proveedor Vivitusuerte de la app para la hoja auxiliar.
 *
 * Corrección verificada en Vivitusuerte por el usuario, 20/10/2026:
 * Santiago: Previa=8067, Primera=6142, Matutino=9634.
 * Neuquén: Previa=0469, Primera=0245, Matutino=0210.
 *
 * Ambas jurisdicciones siguen el MISMO mapa:
 * momento_5=Previa, momento_1=Primera, momento_2=Matutino.
 * No imponer vacíos ni desplazar sorteos desde otras webs.
 *
 * Los turnos ausentes en la respuesta real se mantienen '----'.
 * Exclusivamente laboratorio, sin modificar src/cabezas.ts.
 */
import {FUENTE} from './cabezas';
import {previousDrawDay} from './dates';
import {emptyAuxiliaryHeads} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads} from './auxSantiagoNeuquen';

const numeric=(x:unknown):string=>{
 if(x===undefined||x===null||x==='----'||x==='')return '----';
 const v=typeof x==='object'&&x!==null?
  ((x as Record<string,unknown>).cabeza??
   (x as Record<string,unknown>).numero??
   (x as Record<string,unknown>).resultado??
   (x as Record<string,unknown>).valor??''):x;
 if(!/^\d{1,5}$/.test(String(v)))return '----';
 return String(v).slice(-4).padStart(4,'0');
};
export type AuxSourceObservation={
 date:string;heads:AuxiliaryHeads;
 mapping:'VIVITUSUERTE_ID10_SANTIAGO_ID11_NEUQUEN';
 rawSantiago:{previa:string;primera:string;matutino:string};
 rawNeuquen:{previa:string;primera:string;matutino:string};
};
export function parseAuxiliaryHeads(date:string,json:unknown):AuxSourceObservation{
 const raw=(json as {datos?:Record<string,Record<string,unknown>>}|null)?.datos;
 if(!raw||typeof raw!=='object')throw Error('Aux: datos no encontrados '+date);
 const s=raw['10']||{},n=raw['11']||{};
 const heads=emptyAuxiliaryHeads();
 const Santiago={
  previa:numeric(s.momento_5),primera:numeric(s.momento_1),
  matutino:numeric(s.momento_2)
 };
 const Neuquen={
  previa:numeric(n.momento_5),primera:numeric(n.momento_1),
  matutino:numeric(n.momento_2)
 };
 heads.Previa.Santiago=Santiago.previa;
 heads.Primera.Santiago=Santiago.primera;
 heads.Matutino.Santiago=Santiago.matutino;
 heads.Previa.Neuquen=Neuquen.previa;
 heads.Primera.Neuquen=Neuquen.primera;
 heads.Matutino.Neuquen=Neuquen.matutino;
 return {date,heads,mapping:'VIVITUSUERTE_ID10_SANTIAGO_ID11_NEUQUEN',
  rawSantiago:Santiago,rawNeuquen:Neuquen};
}
export async function fetchAuxiliaryHeads(date:string):Promise<AuxSourceObservation>{
 const response=await fetch(FUENTE+'?fecha='+encodeURIComponent(date)+'&_='+Date.now(),{
  headers:{Accept:'application/json','Cache-Control':'no-cache'}
 });
 if(!response.ok)throw Error('Aux: proveedor respondió '+response.status);
 return parseAuxiliaryHeads(date,await response.json());
}

/** La hoja AUX del día D usa la jornada sorteable anterior, nunca D. */
export const auxiliarySourceDate=(targetDate:string)=>previousDrawDay(targetDate);
export type AuxiliaryDailyBase=AuxSourceObservation & {sourceDate:string};
export async function fetchAuxiliaryBaseForDate(targetDate:string):Promise<AuxiliaryDailyBase>{
 const sourceDate=auxiliarySourceDate(targetDate);
 if(sourceDate>=targetDate)throw Error('AUX: fecha base no anterior al objetivo');
 const observation=await fetchAuxiliaryHeads(sourceDate);
 return {...observation,sourceDate,date:targetDate};
}
