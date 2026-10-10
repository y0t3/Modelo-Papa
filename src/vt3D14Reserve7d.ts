// Modelo Papá VT3: reserva geométrica D−14 para cupos Top3 VACÍOS.
// Mantiene intactos todos los candidatos D−7 ya elegidos.
// Si faltan cupos, ofrece rutas ganadoras de D−14 proyectables en D,
// excluyendo valores que ya pertenezcan al conjunto FÍSICO completo D−7.
// Prioridad neutral, congelada sin resultados: columna de origen en orden
// de tablero y después coordenadas de ruta ascendente; NO es un selector validado.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DatedSheet} from './cycle7d';
import type {DailySheet,SourceId} from './sheet';
import {readCombined7D} from './combinedReader7d';
import {freezeBeforeTurn7D,physicalPoolBefore7D} from './causalReplay7d';
import {reconstructMarkedMoments} from './markedSheet7d';
import {allPhysicalVT3Before7D} from './vt3NetworkCoverage7d';
export type D14ReserveCandidate={value:string;sourceId:SourceId;cells:string[];
 headD14:string;origin:'D14_RESERVA'};
export type D14ReserveSelection={
 date:string;turn:Turno;hasD7:boolean;hasD14:boolean;
 original:string[];combined:string[];added:D14ReserveCandidate[];
 d7PoolSize:number;exclusivePool:string[];availableSlots:number;
};
export type D14ReserveTurn={
 date:string;turn:Turno;heads:string[];selection:D14ReserveSelection;
 originalHits:number;combinedHits:number;addedHits:number;
 randomExpectedAdditions:number;oracleExtraHits:number;
 physicalRescueWithSpace:number;
};
export type D14ReserveAudit={
 protocol:'VT3_D14_RESERVE_WHEN_TOP3_NOT_FULL_V1';
 turns:number;eligibleTurns:number;originalPicks:number;reservePicks:number;
 combinedPicks:number;originalHits:number;combinedHits:number;
 oracleExtraHits:number;physicalRescueWithSpace:number;
 randomExpectedAdditions:number;rescueHitTurns:number;
 rows:D14ReserveTurn[];notes:string[];
};
const subtractDays=(date:string,n:number)=>{
 const x=new Date(date+'T12:00:00Z');x.setUTCDate(x.getUTCDate()-n);
 return x.toISOString().slice(0,10);
};
const physicalRead=(day:DailySheet,sourceId:string,points:{row:number;col:number}[])=>{
 const column=day.columns.find(x=>x.id===sourceId);if(!column)return;
 const digits=points.map(p=>column.values[p.row]?.[p.col]||'');
 return digits.length===3&&digits.every(d=>/^\d$/.test(d))?digits.join(''):undefined;
};
export function selectD14ReserveVT3(history:DatedSheet[],full:DailySheet,
 date:string,turn:Turno):D14ReserveSelection{
 if(!TURNOS.includes(turn)||history.some(x=>x.date>=date))
  throw Error('Fuga temporal o turno inválido');
 const safe=freezeBeforeTurn7D(full,turn);
 const week=history.find(x=>x.date===subtractDays(date,7));
 const fortnight=history.find(x=>x.date===subtractDays(date,14));
 const last6=[...history].sort((a,b)=>a.date.localeCompare(b.date)).slice(-6);
 const original=readCombined7D(last6,safe,date,turn).candidates
  .filter(x=>x.kind==='vt3').map(x=>x.value);
 const d7=physicalPoolBefore7D(history,safe,date,turn).vt3;
 const spaces=Math.max(0,3-original.length);
 const marks=fortnight?reconstructMarkedMoments([fortnight])
  .find(x=>x.date===fortnight.date&&x.turn===turn)?.marks.filter(x=>x.kind==='vt3')||[]:[];
 const sourceOrder=new Map(safe.columns.map((x,i)=>[x.id,i]));
 const candidates=new Map<string,D14ReserveCandidate>();
 for(const mark of marks){
  const value=physicalRead(safe,mark.sourceId,mark.route);
  if(!value||d7.has(value)||candidates.has(value))continue;
  candidates.set(value,{value,sourceId:mark.sourceId,
   cells:[...mark.cells],headD14:mark.head,origin:'D14_RESERVA'});
 }
 const exclusive=[...candidates.values()].sort((a,b)=>
  (sourceOrder.get(a.sourceId)??999)-(sourceOrder.get(b.sourceId)??999)||
  a.cells.join('>').localeCompare(b.cells.join('>'))||a.value.localeCompare(b.value));
 const added=week&&fortnight?exclusive.slice(0,spaces):[];
 const combined=[...original,...added.map(x=>x.value)];
 if(combined.length>3||new Set(combined).size!==combined.length||
  combined.some(x=>!allPhysicalVT3Before7D(safe).has(x)))
  throw Error('Reserva VT3 repitió candidata, cambió cupo o violó tablero');
 return {date,turn,hasD7:!!week,hasD14:!!fortnight,original,combined,added,
  d7PoolSize:d7.size,exclusivePool:week&&fortnight?exclusive.map(x=>x.value):[],
  availableSlots:spaces};
}
export function auditD14ReserveVT3(input:DatedSheet[]):D14ReserveAudit{
 const days=[...input].sort((a,b)=>a.date.localeCompare(b.date));
 if(days.some((x,i)=>!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||
  (i>0&&x.date===days[i-1].date)))throw Error('Fechas duplicadas o inválidas');
 const rows:D14ReserveTurn[]=[];
 let eligibleTurns=0,originalPicks=0,reservePicks=0,combinedPicks=0;
 let originalHits=0,combinedHits=0,oracleExtraHits=0,physicalRescueWithSpace=0;
 let randomExpectedAdditions=0,rescueHitTurns=0;
 for(let i=6;i<days.length;i++){
  const {date,sheet}=days[i],history=days.slice(0,i);
  for(const turn of TURNOS){
   const safe=freezeBeforeTurn7D(sheet,turn);
   const choice=selectD14ReserveVT3(history,safe,date,turn);
   const heads=[...new Set((sheet.heads[turn]||[]).filter(x=>/^\d{4}$/.test(x)))];
   if(!heads.length||!choice.hasD7)continue;
   const winners=new Set(heads.map(h=>h.slice(-3)));
   const baseline=choice.original.filter(x=>winners.has(x)).length;
   const newWins=choice.added.filter(x=>winners.has(x.value)).length;
   const oracle=choice.exclusivePool.filter(x=>winners.has(x)).length;
   const rescues=choice.availableSlots>0?oracle:0;
   const expected=choice.exclusivePool.length?
    choice.added.length*oracle/choice.exclusivePool.length:0;
   rows.push({date,turn,heads,selection:choice,originalHits:baseline,
    combinedHits:baseline+newWins,addedHits:newWins,
    randomExpectedAdditions:expected,oracleExtraHits:oracle,
    physicalRescueWithSpace:rescues});
   if(choice.hasD14)eligibleTurns++;
   originalPicks+=choice.original.length;reservePicks+=choice.added.length;
   combinedPicks+=choice.combined.length;
   originalHits+=baseline;combinedHits+=baseline+newWins;
   oracleExtraHits+=oracle;physicalRescueWithSpace+=rescues;
   randomExpectedAdditions+=expected;
   if(newWins)rescueHitTurns++;
  }
 }
 return {protocol:'VT3_D14_RESERVE_WHEN_TOP3_NOT_FULL_V1',turns:rows.length,
  eligibleTurns,originalPicks,reservePicks,combinedPicks,
  originalHits,combinedHits,oracleExtraHits,physicalRescueWithSpace,
  randomExpectedAdditions,rescueHitTurns,rows,notes:[
   'El lector Top3 D−7 permanece absolutamente intacto; sólo completa plazas libres, nunca reemplaza VT3 existentes.',
   'Las cifras agregadas proceden de recorridos ganadores VT3 D−14 del mismo turno y una misma columna física, proyectados antes del resultado D.',
   'No agrega una candidata que ya pertenezca al conjunto completo de recorridos físicos ganadores D−7.',
   'El orden de D−14 es neutral por columna y celdas; NO demuestra selección geométrica optimizada.',
   'El control iguala el número de reservas y sortea uniformemente del mismo conjunto exclusivo D−14 por turno.',
   'ORÁCULO EXTRA es cobertura retrospectiva máxima del conjunto, NO aciertos predichos.',
   'Aumentar candidatas frente a un lector que se abstiene parcialmente no prueba ventaja: se compara ganancia con azar de igual presupuesto.',
   'Todos estos períodos históricos han sido explorados previamente. No es validación prospectiva.'
  ]};
}
