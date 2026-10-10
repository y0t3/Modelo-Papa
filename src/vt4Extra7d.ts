// VT4 EXTRA — prefijo de mil elegido ANTES del sorteo para cada VT3.
// NO altera tablero, memorias fisicas, lector VT3 ni selector de la APK.
// Extensión NO FÍSICA explícita cuando el prefijo elegido no puede añadirse
// a la ruta contigua de VT3 en la columna de origen.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DatedSheet} from './cycle7d';
import type {DailySheet} from './sheet';
import type {CombinedCandidate} from './combinedReader7d';
import {readCombined7D} from './combinedReader7d';
import {freezeBeforeTurn7D} from './causalReplay7d';
import {geometricVT4Extensions7D} from './vt3Study7d';

export type PrefixMemoryRule7D='ULTIMO_VT2'|'ULTIMA_CABEZA'|'MODA_6D';
export type PrefixExtra7D={
 vt3:string;vt2:string;candidateVT4?:string;prefix?:string;
 sourceId:string;route:string[];physicalVT4:boolean;
 reason:string;memoryRule:PrefixMemoryRule7D;
 vt3Matched:boolean;vt4Matched:boolean;
 possibleWinningPrefixes:number;expectedRandomVT4:number;
};
export type PrefixExtraTurn7D={date:string;turn:Turno;heads:string[];
 byRule:Record<PrefixMemoryRule7D,PrefixExtra7D[]>};
export type PrefixExtraStats7D={rule:PrefixMemoryRule7D;
 vt3Selected:number;proposedVT4:number;abstained:number;
 vt3MatchedWithProposal:number;vt4Exact:number;
 physicalProposals:number;nonPhysicalProposals:number;
 physicalHits:number;nonPhysicalHits:number;
 uniformExpected:number;conditionalChance:number};
export type PrefixExtraAudit7D={protocol:'VT4_EXTRA_PREFIX_V1';topVT3:3|5;
 rows:PrefixExtraTurn7D[];byRule:PrefixExtraStats7D[];
 note:string[]};
const RULES:PrefixMemoryRule7D[]=['ULTIMO_VT2','ULTIMA_CABEZA','MODA_6D'];
const validHeads=(sheet:DailySheet,turn:Turno)=>
 (sheet.heads[turn]||[]).filter(v=>/^\d{4}$/.test(v));
const recentMoment=(history:DatedSheet[],date:string,turn:Turno)=>
 history.filter(d=>d.date<date).sort((a,b)=>b.date.localeCompare(a.date))
  .slice(0,6).flatMap(d=>validHeads(d.sheet,turn).map((head,index)=>({head,date:d.date,index})));
/** Sin cabezas del turno objetivo. No elegir por lo que funcionó luego. */
export function prefixFromMemory7D(history:DatedSheet[],date:string,turn:Turno,
 vt3:string,rule:PrefixMemoryRule7D):{prefix?:string;reason:string}{
 if(!TURNOS.includes(turn)||!/^\d{3}$/.test(vt3))throw Error('Turno o VT3 inválido');
 if(history.some(x=>x.date>=date))throw Error('Fuga temporal en memoria VT4');
 const recent=recentMoment(history,date,turn);
 if(!recent.length)return {reason:'SIN_ANTECEDENTES'};
 if(rule==='ULTIMO_VT2'){
  const linked=recent.find(x=>x.head.slice(-2)===vt3.slice(-2));
  return linked?{prefix:linked.head[0],reason:'VT2_RECIENTE_MISMO_TURNO'}:
   {reason:'NO_APOYO_VT2_PREVIO'};
 }
 if(rule==='ULTIMA_CABEZA'){
  const first=recent[0];
  return {prefix:first.head[0],reason:'ULTIMA_CABEZA_ANTERIOR_MISMO_TURNO'};
 }
 if(rule==='MODA_6D'){
  const counts=new Map<string,number>(),recentIndex=new Map<string,number>();
  recent.forEach((x,i)=>{
   counts.set(x.head[0],(counts.get(x.head[0])||0)+1);
   if(!recentIndex.has(x.head[0]))recentIndex.set(x.head[0],i);
  });
  const best=[...counts.keys()].sort((a,b)=>counts.get(b)!-counts.get(a)!||
   recentIndex.get(a)!-recentIndex.get(b)!||a.localeCompare(b))[0];
  return {prefix:best,reason:'MODA_PREFIJO_ULTIMAS_6_JORNADAS'};
 }
 throw Error('Regla experimental desconocida');
}
export function previewVT4Extra7D(history:DatedSheet[],before:DailySheet,
 date:string,turn:Turno,candidate:CombinedCandidate,rule:PrefixMemoryRule7D):{
 vt3:string;vt2:string;candidateVT4?:string;prefix?:string;sourceId:string;
 route:string[];physicalVT4:boolean;reason:string;memoryRule:PrefixMemoryRule7D
}{
 if(candidate.kind!=='vt3'||! /^\d{3}$/.test(candidate.value))throw Error('Se necesita VT3');
 const memory=prefixFromMemory7D(history,date,turn,candidate.value,rule);
 const candidateVT4=memory.prefix?memory.prefix+candidate.value:undefined;
 const possiblePhysical=geometricVT4Extensions7D(candidate,before);
 return {vt3:candidate.value,vt2:candidate.value.slice(-2),
  sourceId:candidate.sourceId,route:candidate.path.map(p=>p.row+':'+p.col),
  prefix:memory.prefix,candidateVT4,
  physicalVT4:!!candidateVT4&&possiblePhysical.includes(candidateVT4),
  reason:memory.reason,memoryRule:rule};
}
export function auditVT4Extra7D(input:DatedSheet[],top:3|5=3):PrefixExtraAudit7D{
 if(top!==3&&top!==5)throw Error('Top VT3 fuera del protocolo');
 const sorted=[...input].sort((a,b)=>a.date.localeCompare(b.date));
 if(sorted.some((x,i)=>i>0&&x.date===sorted[i-1].date))throw Error('Fechas duplicadas');
 const totals=Object.fromEntries(RULES.map(rule=>[rule,{
  rule,vt3Selected:0,proposedVT4:0,abstained:0,vt3MatchedWithProposal:0,
  vt4Exact:0,physicalProposals:0,nonPhysicalProposals:0,
  physicalHits:0,nonPhysicalHits:0,uniformExpected:0,conditionalChance:0
 }])) as Record<PrefixMemoryRule7D,PrefixExtraStats7D>;
 const rows:PrefixExtraTurn7D[]=[];
 for(let i=6;i<sorted.length;i++){
  const day=sorted[i],history=sorted.slice(i-6,i);
  for(const turn of TURNOS){
   const before=freezeBeforeTurn7D(day.sheet,turn);
   const ranked=readCombined7D(history,before,day.date,turn,{vt3Limit:top})
    .candidates.filter(x=>x.kind==='vt3');
   // El resultado se descubre exclusivamente después de fijar TODOS los prefijos.
   const previews=Object.fromEntries(RULES.map(rule=>[rule,ranked.map(x=>
    previewVT4Extra7D(history,before,day.date,turn,x,rule))])) as Record<
     PrefixMemoryRule7D,ReturnType<typeof previewVT4Extra7D>[]>;
   const heads=validHeads(day.sheet,turn);
   if(!heads.length)continue;
   const settled=Object.fromEntries(RULES.map(rule=>[rule,previews[rule].map(p=>{
    const matching=heads.filter(h=>h.slice(-3)===p.vt3);
    const variants=new Set(matching.map(h=>h[0])).size;
    const vt4Matched=!!p.candidateVT4&&heads.includes(p.candidateVT4);
    return {...p,vt3Matched:matching.length>0,vt4Matched,
     possibleWinningPrefixes:variants,expectedRandomVT4:p.candidateVT4?variants/10:0};
   })])) as Record<PrefixMemoryRule7D,PrefixExtra7D[]>;
   for(const rule of RULES){
    for(const p of settled[rule]){
     const s=totals[rule];s.vt3Selected++;
     if(!p.candidateVT4){s.abstained++;continue}
     s.proposedVT4++;
     s.vt3MatchedWithProposal+=Number(p.vt3Matched);
     s.vt4Exact+=Number(p.vt4Matched);
     s.uniformExpected+=p.expectedRandomVT4;
     if(p.physicalVT4){s.physicalProposals++;s.physicalHits+=Number(p.vt4Matched)}
     else{s.nonPhysicalProposals++;s.nonPhysicalHits+=Number(p.vt4Matched)}
    }
   }
   rows.push({date:day.date,turn,heads,byRule:settled});
  }
 }
 for(const rule of RULES){
  const s=totals[rule];s.conditionalChance=s.vt3MatchedWithProposal?
   s.vt4Exact/s.vt3MatchedWithProposal:0;
 }
 return {protocol:'VT4_EXTRA_PREFIX_V1',topVT3:top,rows,byRule:RULES.map(x=>totals[x]),
  note:[
   'VT3 se congela primero a partir de recorridos D-7 y respeta la prioridad del Modelo Papa.',
   'Los tres prefijos son reglas de comparación EXPLORATORIAS, fijadas antes de revisar resultados.',
   'ULTIMO_VT2 puede abstenerse. Los otros dos siempre eligen una cifra si existe historial.',
   'El VT4 extra se etiqueta como NO FISICO si el prefijo no está conectado al VT3 en la misma columna.',
   'Una cifra acertada sólo cuenta como VT4 si coincide la cabeza completa, no si coincidió sólo VT3.',
   'Control aleatorio uniforme condicionado a los prefijos de todas las cabezas reales que contienen ese VT3.',
   'Los resultados históricos no demuestran causalidad ni mejor rendimiento futuro.'
  ]};
}
