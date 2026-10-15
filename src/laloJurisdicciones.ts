import {JURS} from './domain';
import type {Jurisdiccion,Turno} from './domain';

/**
 * Calendario habitual informado por DNLQ Uruguay:
 * Vespertina uruguaya, 15 h => columna Matutino del tablero argentino.
 * Nocturna uruguaya, 21 h => columna Nocturno.
 * Lun-Vie ambas; sábados solamente Nocturna; domingos ninguna.
 * Feriados, suspensiones y extraordinarios NO están verificados aquí:
 * el usuario confirma los sorteos donde efectivamente apostó.
 */
export function montevideoProgramado(date:string,turn:Turno):boolean{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
 const d=new Date(date+'T12:00:00Z');
 if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==date)return false;
 const weekday=d.getUTCDay();
 if(weekday===0)return false;
 if(turn==='Nocturno')return true; // lunes a sábado
 return turn==='Matutino'&&weekday>=1&&weekday<=5; // Uruguay vespertina 15 h
}
export const ARGENTINA_JURS:readonly Jurisdiccion[]=
 JURS.filter(j=>j!=='Montevideo');

export function jurisdiccionesHabituales(date:string,turn:Turno):Jurisdiccion[]{
 const day=new Date(date+'T12:00:00Z');
 if(Number.isNaN(day.getTime())||day.toISOString().slice(0,10)!==date||day.getUTCDay()===0)return [];
 return [...ARGENTINA_JURS,...(montevideoProgramado(date,turn)?['Montevideo' as const]:[])];
}
export function limpiarJurisdicciones(selected:readonly string[]):Jurisdiccion[]{
 const chosen=new Set(selected);
 return JURS.filter(j=>chosen.has(j));
}
