// Modelo Papá 7D: continuidad de geometrías VT3 ganadoras D-14 -> D-7 -> D.
// Única hipótesis experimental: misma ruta física (coordenadas ordenadas),
// turno y columna que fueron marcados por cabezas reales en ambas semanas.
// Sin usar resultados de D ni permitir rutas de otra columna.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {DatedSheet} from './cycle7d';
import {readCombined7D} from './combinedReader7d';
import {freezeBeforeTurn7D,physicalPoolBefore7D} from './causalReplay7d';
import {reconstructMarkedMoments} from './markedSheet7d';
import type {MarkedPath} from './markedSheet7d';

export type RepeatedVT3Proof={route:string[];sourceId:string;headD14:string;headD7:string};
export type D14CandidateVT3={value:string;vt2:string;sourceId:string;
 representativeRoute:string[];score:number;proofs:RepeatedVT3Proof[]};
export type D14SelectionVT3={date:string;turn:Turno;hasBothWeeks:boolean;
 poolSize:number;repeatEligible:number;baseline:D14CandidateVT3[];
 repeated:D14CandidateVT3[];changes:number};
export type D14TurnVT3={date:string;turn:Turno;heads:string[];
 baseline:string[];repeated:string[];selection:D14SelectionVT3;
 hitsBaseline:number;hitsRepeated:number;vt2Baseline:number;vt2Repeated:number;
 expectedPhysical:number;physicalPoolSize:number};
export type D14ReportVT3={protocol:'VT3_REPEATED_EXACT_GEOMETRY_D14_D7_V1';
 turns:number;withBothWeeks:number;selectedPicks:number;repeatEligible:number;
 changes:number;baselineHits:number;repeatedHits:number;
 vt2Baseline:number;vt2Repeated:number;
 turnsWon:number;turnsLost:number;turnsTied:number;
 expectedPhysical:number;rows:D14TurnVT3[];notes:string[]};
const weekAgo=(date:string,days:number)=>{
 const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-days);
 return d.toISOString().slice(0,10);
};
const coord=(p:{row:number;col:number}[])=>p.map(x=>x.row+':'+x.col);
const uniqueHeads=(sheet:DailySheet,turn:Turno)=>
 [...new Set((sheet.heads[turn]||[]).filter(x=>/^\d{4}$/.test(x)))];
const k=(source:string,cells:string[])=>source+'|'+cells.join('>');
const project=(route:MarkedPath,board:DailySheet):string|undefined=>{
 const col=board.columns.find(c=>c.id===route.sourceId);
 if(!col)return;
 const digits=route.route.map(p=>col.values[p.row]?.[p.col]||'');
 return digits.every(x=>/^\d$/.test(x))?digits.join(''):undefined;
};
/**
 * priorDays contiene jornadas previas, incluso D-14 cuando existe.
 * El lector ORIGINAL recibe sus últimas seis jornadas, no el histórico
 * completo, para conservar sus mismas ponderaciones.
 */
export function selectRepeatedGeometryVT3(priorDays:DatedSheet[],before:DailySheet,
 date:string,turn:Turno):D14SelectionVT3{
 if(!TURNOS.includes(turn)||priorDays.some(x=>x.date>=date))
  throw Error('Turno inválido o fuga temporal D-14');
 const safe=freezeBeforeTurn7D(before,turn);
 const last6=[...priorDays].sort((a,b)=>a.date.localeCompare(b.date)).slice(-6);
 const projected=readCombined7D(last6,safe,date,turn,{vt3Limit:'ALL'})
  .candidates.filter(x=>x.kind==='vt3');
 const d7=priorDays.find(x=>x.date===weekAgo(date,7));
 const d14=priorDays.find(x=>x.date===weekAgo(date,14));
 let week7:MarkedPath[]=[],week14:MarkedPath[]=[];
 if(d7&&d14){
  const moments=reconstructMarkedMoments([d14,d7]);
  week7=moments.find(x=>x.date===d7.date&&x.turn===turn)?.marks.filter(x=>x.kind==='vt3')||[];
  week14=moments.find(x=>x.date===d14.date&&x.turn===turn)?.marks.filter(x=>x.kind==='vt3')||[];
 }
 const byPath14=new Map(week14.map(p=>[k(p.sourceId,p.cells),p]));
 const enriched:D14CandidateVT3[]=projected.map(c=>{
  const proofs:RepeatedVT3Proof[]=[];
  const paths=new Set<string>();
  for(const mark of week7){
   if(mark.sourceId!==c.sourceId||project(mark,safe)!==c.value)continue;
   const key=k(mark.sourceId,mark.cells),old=byPath14.get(key);
   if(!old||paths.has(key))continue;
   paths.add(key);
   proofs.push({route:[...mark.cells],sourceId:c.sourceId,
    headD14:old.head,headD7:mark.head});
  }
  return {value:c.value,vt2:c.value.slice(-2),sourceId:c.sourceId,
   representativeRoute:coord(c.path),score:c.score,proofs};
 });
 const budget=Math.min(3,enriched.length);
 const baseline=enriched.slice(0,budget);
 const repeated=[...enriched].sort((a,b)=>Number(b.proofs.length>0)-Number(a.proofs.length>0)||
  b.score-a.score||a.value.localeCompare(b.value)).slice(0,budget);
 const baseValues=new Set(baseline.map(x=>x.value));
 return {date,turn,hasBothWeeks:!!d7&&!!d14,poolSize:enriched.length,
  repeatEligible:enriched.filter(x=>x.proofs.length).length,baseline,repeated,
  changes:repeated.filter(x=>!baseValues.has(x.value)).length};
}
export function auditRepeatedGeometryVT3(input:DatedSheet[]):D14ReportVT3{
 const ordered=[...input].sort((a,b)=>a.date.localeCompare(b.date));
 if(ordered.some((x,i)=>!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||
  (i>0&&x.date===ordered[i-1].date)))throw Error('Fechas inválidas o repetidas');
 const rows:D14TurnVT3[]=[];
 let withBothWeeks=0,selectedPicks=0,repeatEligible=0,changes=0;
 let baselineHits=0,repeatedHits=0,vt2Baseline=0,vt2Repeated=0;
 let turnsWon=0,turnsLost=0,turnsTied=0,expectedPhysical=0;
 for(let i=6;i<ordered.length;i++){
  const day=ordered[i],priorDays=ordered.slice(0,i);
  for(const turn of TURNOS){
   const safe=freezeBeforeTurn7D(day.sheet,turn);
   const selection=selectRepeatedGeometryVT3(priorDays,safe,day.date,turn);
   const actual=uniqueHeads(day.sheet,turn);if(!actual.length)continue;
   // Solo evaluar fechas que tienen ambas hojas semanales disponibles.
   if(!selection.hasBothWeeks)continue;
   const baseline=selection.baseline.map(x=>x.value);
   const repeated=selection.repeated.map(x=>x.value);
   if(baseline.length!==repeated.length||new Set(repeated).size!==repeated.length)
    throw Error('Cupo desigual o lectura duplicada');
   const physical=physicalPoolBefore7D(priorDays,safe,day.date,turn).vt3;
   if([...baseline,...repeated].some(x=>!physical.has(x)))
    throw Error('Candidata fuera de las geometrías ganadoras D-7');
   const win3=new Set(actual.map(x=>x.slice(-3))),win2=new Set(actual.map(x=>x.slice(-2)));
   const hb=baseline.filter(x=>win3.has(x)).length;
   const hr=repeated.filter(x=>win3.has(x)).length;
   const b2=baseline.filter(x=>win2.has(x.slice(-2))).length;
   const r2=repeated.filter(x=>win2.has(x.slice(-2))).length;
   const exp=physical.size?baseline.length*[...physical].filter(x=>win3.has(x)).length/physical.size:0;
   rows.push({date:day.date,turn,heads:actual,baseline,repeated,selection,
    hitsBaseline:hb,hitsRepeated:hr,vt2Baseline:b2,vt2Repeated:r2,
    expectedPhysical:exp,physicalPoolSize:physical.size});
   withBothWeeks++;selectedPicks+=baseline.length;
   repeatEligible+=selection.repeatEligible;changes+=selection.changes;
   baselineHits+=hb;repeatedHits+=hr;vt2Baseline+=b2;vt2Repeated+=r2;
   expectedPhysical+=exp;
   if(hr>hb)turnsWon++;else if(hr<hb)turnsLost++;else turnsTied++;
  }
 }
 return {protocol:'VT3_REPEATED_EXACT_GEOMETRY_D14_D7_V1',
  rows,turns:rows.length,withBothWeeks,selectedPicks,repeatEligible,changes,
  baselineHits,repeatedHits,vt2Baseline,vt2Repeated,turnsWon,turnsLost,
  turnsTied,expectedPhysical,notes:[
   'D-14 y D-7 deben existir como fechas reales del mismo día semanal.',
   'Se comparan TODOS los recorridos VT3 ganadores de ambas hojas; una figura es la secuencia EXACTA de coordenadas, dentro de la misma columna física y turno.',
   'No exige las mismas cifras antiguas, porque se sigue la geometría, no el número.',
   'La hoja D se proyecta desde las marcas de D-7; nunca se usa su resultado para priorizar.',
   'Se conserva el mismo Top3 por turno y las mismas rutas elegibles, cambiando solo prioridad binaria por repetición de geometría.',
   'Se informa VT2 contenido sin contabilizarlo como segundo evento independiente.',
   'Validación histórica retrospectiva exploratoria, no prueba de ventaja futura.'
  ]};
}
