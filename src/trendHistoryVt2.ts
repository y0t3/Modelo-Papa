/**
 * Fotografía estadística reproducible del laboratorio de mitades VT2:
 * PR #45 - https://github.com/y0t3/Modelo-Papa/pull/45
 * Corte histórico: 01/09/2026 a 30/10/2026 (52 jornadas de sorteo).
 *
 * Observaciones POST agregadas, no probabilidades de sorteo futuro.
 * Las cabezas objetivo nunca entran en el ranking PRE reconstruido.
 * No confundir cantidad de coincidencias con cantidad de premios/apuestas.
 *
 * Compartir porcentaje por motor requiere ajustar por cortes disponibles:
 * Aux HOY Previa no tiene hoja, y Primera tiene menos Top10 completos.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';

export type TrendEngine='lalo'|'ayer'|'hoy';
export type TrendHalf='primera'|'segunda';
export type HalfRecord={first:number;last:number;cuts:number};
export type TurnRecord=Record<TrendEngine,HalfRecord>;
export const TREND_WINDOW={
 start:'2026-09-01',end:'2026-10-30',label:'Septiembre–octubre 2026',
 source:'Laboratorio VT2 · PR #45 · 31/10/2026'
} as const;
export const TREND_ENGINES:TrendEngine[]=['lalo','ayer','hoy'];
export const TREND_LABELS:Record<TrendEngine,string>={
 lalo:'Lalo +11',ayer:'Auxiliar Ayer',hoy:'Auxiliar Hoy'
};
export const TREND_COLORS:Record<TrendEngine,string>={
 lalo:'#207EEA',ayer:'#9B55CA',hoy:'#00B9C0'
};
export const HALF_COLORS={first:'#207EEA',last:'#E5AE28'} as const;
/**
 * Cinco cabezas válidas por corte. Los distintos tamaños de muestra NO
 * son fallas: en AUX intrajornada Previa aún no tiene hoja, y Primera
 * a veces produce menos de diez familias distintas.
 */
export const VT2_TRENDS:Record<Turno,TurnRecord>={
 Previa:{lalo:{first:33,last:24,cuts:50},ayer:{first:28,last:26,cuts:52},hoy:{first:0,last:0,cuts:0}},
 Primera:{lalo:{first:27,last:29,cuts:52},ayer:{first:27,last:29,cuts:52},hoy:{first:12,last:17,cuts:39}},
 Matutino:{lalo:{first:29,last:24,cuts:52},ayer:{first:22,last:24,cuts:52},hoy:{first:26,last:22,cuts:52}},
 Vespertino:{lalo:{first:28,last:19,cuts:52},ayer:{first:27,last:34,cuts:52},hoy:{first:20,last:27,cuts:52}},
 Nocturno:{lalo:{first:23,last:25,cuts:52},ayer:{first:24,last:18,cuts:52},hoy:{first:20,last:22,cuts:52}}
};

export const hits=(record:HalfRecord)=>record.first+record.last;
/** Dos porcentajes enteros que siempre suman 100; null si no hay aciertos. */
export function halfPercent(record:HalfRecord):[number,number]|null{
 const sum=hits(record);
 if(!record.cuts||!sum)return null;
 const first=Math.round(record.first*100/sum);
 return [first,100-first];
}
/** Cuota relativa de aciertos POR CORTE elegible, no tasa de éxito futura.
 * Igualar las exposiciones evita favorecer Lalo/Ayer en Primera, cuando
 * el auxiliar HOY solo produjo Top10 completo en 39 de 52 jornadas.
 * No deduplica cabezas compartidas por motores: no son sucesos exclusivos.
 */
export function motorShares(turn:Turno):Record<TrendEngine,number>{
 const row=VT2_TRENDS[turn];
 const rates=TREND_ENGINES.map(id=>row[id].cuts?hits(row[id])/row[id].cuts:0);
 const total=rates.reduce((n,x)=>n+x,0);
 if(total===0)return {lalo:0,ayer:0,hoy:0};
 const exact=rates.map(x=>x/total*100);
 const base=exact.map(Math.floor);
 let remainder=100-base.reduce((a,b)=>a+b,0);
 const ranked=[0,1,2].sort((a,b)=>(exact[b]-base[b])-(exact[a]-base[a])||a-b);
 for(let i=0;i<remainder;i++)base[ranked[i]]++;
 return {lalo:base[0],ayer:base[1],hoy:base[2]};
}
export function totalHeads(record:HalfRecord):number{return record.cuts*5}
export function isRetrospective(selectedDate:string):boolean{
 return !!selectedDate&&selectedDate<=TREND_WINDOW.end;
}
export function trendCoverageCheck():boolean{
 return TURNOS.every(t=>TREND_ENGINES.every(id=>{
  const r=VT2_TRENDS[t][id];
  return Number.isInteger(r.first)&&Number.isInteger(r.last)&&
   Number.isInteger(r.cuts)&&r.first>=0&&r.last>=0&&r.cuts>=0&&
   (r.cuts>0||hits(r)===0)&&
   (r.first+r.last<=r.cuts*5);
 })&&Object.values(motorShares(t)).reduce((a,b)=>a+b,0)===100);
}
