// Auditoria temporal del lector visual 7D. NO modifica ni selecciona apuestas.
// Cada turno se proyecta desde una vista que excluye sus cabezas, marcas y
// columnas futuras. Las cabezas reales se abren solo para puntuar al final.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {DatedSheet,CycleKind} from './cycle7d';
import {readCombined7D} from './combinedReader7d';
import type {CombinedResult} from './combinedReader7d';

const KINDS:CycleKind[]=['vt2','vt3','vt4'];
const SIZE:Record<CycleKind,number>={vt2:100,vt3:1000,vt4:10000};
const WIDTH:Record<CycleKind,number>={vt2:2,vt3:3,vt4:4};
export type ReplayCandidate7D={kind:CycleKind;value:string;sourceId:string;
 cells:string[];signals:string[];hit:boolean};
export type ReplayTurn7D={date:string;turn:Turno;heads:string[];
 decision:CombinedResult['decision'];reason:string;eligible:number;
 candidates:ReplayCandidate7D[]};
export type ReplayKindStats7D={kind:CycleKind;turns:number;turnsWithCandidates:number;
 abstentions:number;candidates:number;hits:number;turnsWithHit:number;
 falseCandidates:number;randomExpectedHits:number;randomExpectedTurnsWithHit:number};
export type ReplayAudit7D={protocol:'7D_CAUSAL_REPLAY_V1';historyDays:number;
 evaluatedTurns:number;rows:ReplayTurn7D[];byKind:ReplayKindStats7D[];
 baseline:'AZAR_UNIFORME_MISMA_CANTIDAD_POR_MODALIDAD';notes:string[]};

const cleanHeads=(heads:string[]|undefined)=>[...new Set((heads||[]).filter(h=>/^\d{4}$/.test(h)))];
/** Seguridad extra: nada del turno objetivo o posterior llega al lector. */
export function freezeBeforeTurn7D(full:DailySheet,turn:Turno):DailySheet{
 const at=TURNOS.indexOf(turn);
 if(at<0)throw Error('Turno inválido');
 const matches:DailySheet['matches']={};
 const heads:DailySheet['heads']={};
 for(let i=0;i<TURNOS.length;i++){
  const t=TURNOS[i];
  matches[t]=i<at?[...(full.matches[t]||[])]:[];
  heads[t]=i<at?[...(full.heads[t]||[])]:[];
 }
 return {columns:full.columns.slice(0,at+1).map(c=>({...c,values:[...c.values]})),
  matches,heads};
}
const chanceAtLeastOne=(n:number,winners:number,picks:number)=>{
 let miss=1;
 for(let i=0;i<picks;i++)miss*=Math.max(0,(n-winners-i)/(n-i));
 return 1-miss;
};
/**
 * Mismo protocolo y presupuesto en todos los turnos.
 * Se requieren 6 jornadas anteriores disponibles; NO implica que D-7
 * se reemplace si no existe: el lector original se abstiene en ese caso.
 * Los archivos de entrada deben ser hojas construidas cronologicamente.
 */
export function auditCombinedChronologically7D(input:DatedSheet[]):ReplayAudit7D{
 const ordered=[...input].sort((a,b)=>a.date.localeCompare(b.date));
 if(ordered.some((x,i)=>!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||
  (i>0&&x.date===ordered[i-1].date)))throw Error('Fechas inválidas o repetidas');
 const rows:ReplayTurn7D[]=[];
 const stats:Record<CycleKind,ReplayKindStats7D>={
  vt2:{kind:'vt2',turns:0,turnsWithCandidates:0,abstentions:0,candidates:0,hits:0,turnsWithHit:0,falseCandidates:0,randomExpectedHits:0,randomExpectedTurnsWithHit:0},
  vt3:{kind:'vt3',turns:0,turnsWithCandidates:0,abstentions:0,candidates:0,hits:0,turnsWithHit:0,falseCandidates:0,randomExpectedHits:0,randomExpectedTurnsWithHit:0},
  vt4:{kind:'vt4',turns:0,turnsWithCandidates:0,abstentions:0,candidates:0,hits:0,turnsWithHit:0,falseCandidates:0,randomExpectedHits:0,randomExpectedTurnsWithHit:0}
 };
 for(let i=6;i<ordered.length;i++){
  const {date,sheet}=ordered[i];
  const history=ordered.slice(i-6,i);
  for(const turn of TURNOS){
   const before=freezeBeforeTurn7D(sheet,turn);
   // Proyeccion ANTES de abrir los resultados del objetivo.
   const prediction=readCombined7D(history,before,date,turn);
   const actual=cleanHeads(sheet.heads[turn]);
   // No evaluar sorteos sin cabeza registrada.
   if(!actual.length)continue;
   const candidates:ReplayCandidate7D[]=prediction.candidates.map(c=>({
    kind:c.kind,value:c.value,sourceId:c.sourceId,
    cells:c.path.map(p=>p.row+':'+p.col),signals:c.signals.map(s=>s.name),
    hit:actual.some(h=>h.slice(-WIDTH[c.kind])===c.value)
   }));
   rows.push({date,turn,heads:actual,decision:prediction.decision,
    reason:prediction.reason,eligible:prediction.eligible,candidates});
   for(const kind of KINDS){
    const k=stats[kind],selected=candidates.filter(c=>c.kind===kind);
    const uniqueWinners=new Set(actual.map(h=>h.slice(-WIDTH[kind]))).size;
    const hits=selected.filter(c=>c.hit).length;
    k.turns++;k.candidates+=selected.length;k.hits+=hits;
    k.falseCandidates+=selected.length-hits;
    if(selected.length)k.turnsWithCandidates++;else k.abstentions++;
    if(hits)k.turnsWithHit++;
    k.randomExpectedHits+=selected.length*uniqueWinners/SIZE[kind];
    k.randomExpectedTurnsWithHit+=chanceAtLeastOne(SIZE[kind],uniqueWinners,selected.length);
   }
  }
 }
 return {protocol:'7D_CAUSAL_REPLAY_V1',historyDays:6,evaluatedTurns:rows.length,
  rows,byKind:KINDS.map(k=>stats[k]),
  baseline:'AZAR_UNIFORME_MISMA_CANTIDAD_POR_MODALIDAD',
  notes:[
   'Reproduccion historica ciega por turno. Los resultados del objetivo se usan solo despues de generar candidatos.',
   'Los aciertos de VT2/VT3/VT4 y las abstenciones se contabilizan independientemente.',
   'El control uniforme es preliminar. Falta una referencia que sortee solo rutas fisicas elegibles D-7.',
   'No es evidencia prospectiva, ni demuestra por si sola ventaja estadistica o rentabilidad.'
  ]};
}
