// Modelo Papá — PILOTO de VT3 vivo sobre TODA la tabla progresiva +11.
// Usa el motor ADAPTATIVO YA EXISTENTE (estados y pesos intactos), pero le
// entrega los turnos cerrados de HOY antes del objetivo. No exige D−7.
// NUNCA se integra en el selector oficial sin validación fuera de muestra.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {DatedSheet} from './cycle7d';
import {freezeBeforeTurn7D} from './causalReplay7d';
import {analyzeAdaptive7D} from './adaptive7d';
import type {AdaptiveLife} from './adaptive7d';
import {observeProgressiveBoard7D} from './progressiveBoard7d';
import {allPhysicalVT3Before7D} from './vt3NetworkCoverage7d';

export type LiveVT3PilotCandidate={
 value:string;sourceId:SourceId;path:string[];state:AdaptiveLife;
 confirmations:number;score:number;lastSeenDraws:number;
 supportedByToday:boolean;signature:string;
};
export type LiveVT3PilotResult={
 date:string;target:Turno;policy:'ADAPTATIVO_EXISTENTE_SOBRE_TABLA_COMPLETA';
 availableColumns:number;completedTurns:number;hasD7:boolean;
 candidates:LiveVT3PilotCandidate[];trackedShapes:number;
 decision:'OBSERVAR'|'SIN_SENAL';explanation:string;
};
const routeSignature=(p:{row:number;col:number}[])=>p.slice(1)
 .map((x,i)=>(x.row-p[i].row)+','+(x.col-p[i].col)).join(';');
export function readLiveVT3Pilot7D(history:DatedSheet[],full:DailySheet,
 date:string,target:Turno):LiveVT3PilotResult{
 if(!TURNOS.includes(target)||history.some(x=>x.date>=date))
  throw Error('Turno inválido o fuga temporal');
 const safe=freezeBeforeTurn7D(full,target);
 // OBSERVACIÓN de marcas ya verificadas de turnos anteriores DEL MISMO DIA.
 // Nunca se añaden marcas del objetivo ni posteriores.
 const board=observeProgressiveBoard7D(history,safe,date,target);
 const dated=[...history.filter(x=>x.date<date),{date,sheet:safe}];
 const result=analyzeAdaptive7D(dated,safe,date,target);
 const markedToday=new Set(board.marksToday.filter(m=>m.kind==='vt3')
  .map(m=>m.sourceId+'|'+m.shape.replaceAll('>',';')));
 const physical=allPhysicalVT3Before7D(safe);
 const candidates=result.candidates.filter(x=>x.kind==='vt3')
  .map((c):LiveVT3PilotCandidate=>({
   value:c.value,sourceId:c.sourceId,
   path:c.path.map(p=>p.row+':'+p.col),state:c.state,
   confirmations:c.confirmations,score:c.score,
   lastSeenDraws:c.lastSeenDraws,signature:c.signature,
   supportedByToday:markedToday.has(c.sourceId+'|'+c.signature)
  }));
 if(candidates.length>3||new Set(candidates.map(x=>x.value)).size!==candidates.length||
  candidates.some(x=>!physical.has(x.value)))
  throw Error('El adaptativo devolvió VT3 duplicados, extra o no físicos');
 return {date,target,policy:'ADAPTATIVO_EXISTENTE_SOBRE_TABLA_COMPLETA',
  availableColumns:board.visibleColumns.length,
  completedTurns:board.completedTurns.length,
  hasD7:!!board.previousWeek,candidates,trackedShapes:result.tracked,
  decision:candidates.length?'OBSERVAR':'SIN_SENAL',
  explanation:'Piloto con estados y puntuaciones del adaptativo 7D existente. '+
   'Lee progresivamente todas las columnas +11 y marcas previas de hoy; '+
   'D−7 es opcional. El ranking NO está validado ni sustituye el selector.'
 };
}
export type LivePilotTurn7D={date:string;target:Turno;heads:string[];
 live:LiveVT3PilotResult;legacyVT3:string[];liveHits:number;
 legacyHits:number;vt2Contained:number;physicalPool:number;
 randomExpected:number};
export type LivePilotAudit7D={protocol:'LIVE_VT3_PILOT_7D_V1';
 turns:number;withPilot:number;pilotPicks:number;pilotHits:number;
 pilotVT2Contained:number;pilotFromToday:number;
 legacyPicks:number;legacyHits:number;randomPhysicalExpected:number;
 byTurn:Record<Turno,{turns:number;picks:number;hits:number;legacyHits:number;
  withSignal:number;fromToday:number;expected:number}>;
 rows:LivePilotTurn7D[];notes:string[]};
export function auditLiveVT3Pilot7D(input:DatedSheet[]):LivePilotAudit7D{
 const {readCombined7D}=requireCombined();
 const dates=[...input].sort((a,b)=>a.date.localeCompare(b.date));
 if(dates.some((x,i)=>i>0&&x.date===dates[i-1].date))
  throw Error('Fechas repetidas');
 const byTurn=Object.fromEntries(TURNOS.map(t=>[t,{
  turns:0,picks:0,hits:0,legacyHits:0,withSignal:0,fromToday:0,expected:0
 }])) as LivePilotAudit7D['byTurn'];
 const rows:LivePilotTurn7D[]=[];
 let withPilot=0,pilotPicks=0,pilotHits=0,pilotVT2Contained=0;
 let pilotFromToday=0,legacyPicks=0,legacyHits=0,randomPhysicalExpected=0;
 // Misma ventana mínima de historial que las auditorías del lector D−7.
 for(let i=6;i<dates.length;i++){
  const day=dates[i],history=dates.slice(Math.max(0,i-10),i);
  for(const target of TURNOS){
   const safe=freezeBeforeTurn7D(day.sheet,target);
   const pilot=readLiveVT3Pilot7D(history,safe,day.date,target);
   const old=readCombined7D(history.slice(-6),safe,day.date,target)
    .candidates.filter(c=>c.kind==='vt3').map(c=>c.value);
   // Los resultados se abren SÓLO tras fijar piloto y comparador.
   const actual=[...new Set((day.sheet.heads[target]||[]).filter(x=>/^\d{4}$/.test(x)))];
   if(!actual.length)continue;
   const win3=new Set(actual.map(h=>h.slice(-3)));
   const win2=new Set(actual.map(h=>h.slice(-2)));
   const physical=allPhysicalVT3Before7D(safe);
   const physicalWins=[...physical].filter(x=>win3.has(x)).length;
   const picked=pilot.candidates.map(c=>c.value);
   const hits=picked.filter(x=>win3.has(x)).length;
   const vt2=picked.filter(x=>win2.has(x.slice(-2))).length;
   const oldHits=old.filter(x=>win3.has(x)).length;
   const expected=physical.size?picked.length*physicalWins/physical.size:0;
   rows.push({date:day.date,target,heads:actual,live:pilot,legacyVT3:old,
    liveHits:hits,legacyHits:oldHits,vt2Contained:vt2,
    physicalPool:physical.size,randomExpected:expected});
   const b=byTurn[target];b.turns++;b.picks+=picked.length;b.hits+=hits;
   b.legacyHits+=oldHits;b.withSignal+=Number(picked.length>0);
   const fromToday=pilot.candidates.filter(c=>c.supportedByToday).length;
   b.fromToday+=fromToday;b.expected+=expected;
   withPilot+=Number(picked.length>0);pilotPicks+=picked.length;pilotHits+=hits;
   pilotVT2Contained+=vt2;pilotFromToday+=fromToday;
   legacyPicks+=old.length;legacyHits+=oldHits;randomPhysicalExpected+=expected;
  }
 }
 return {protocol:'LIVE_VT3_PILOT_7D_V1',
  turns:rows.length,withPilot,pilotPicks,pilotHits,pilotVT2Contained,
  pilotFromToday,legacyPicks,legacyHits,randomPhysicalExpected,byTurn,rows,
  notes:[
   'Piloto usa la ponderación PREEXISTENTE de adaptive7d.ts, no fue recalibrada en este ensayo.',
   'Los candidatos VT3 del mismo día se evalúan sólo después de cada resultado objetivo.',
   'El piloto no necesita D−7. El comparador restringido D−7 es observador distinto.',
   'Sus cantidades de candidatos pueden diferir: comparar aciertos brutos NO prueba mejora.',
   'Control preliminar azar uniforme sólo entre VT3 físicamente formables sobre el tablero del turno.',
   'VT2 contenido NO es un segundo evento independiente.',
   'Este histórico ya fue explorado: ninguna diferencia demuestra ventaja prospectiva.'
  ]};
}
// Carga estática tardía para mantener la dependencia experimental aislada.
import {readCombined7D} from './combinedReader7d';
function requireCombined(){return {readCombined7D}}
