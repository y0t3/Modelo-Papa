// Lector experimental aislado: configuración comprobada en dos cabezas distintas,
// ternas solapadas en una fuente histórica y trasladadas a OTRA fuente +11 PRE.
// Reutiliza sin alterar el detector y proyector del laboratorio del 17/10/2026.
import type {DailySheet,SourceId} from './sheet';
import type {Turno} from './domain';
import {TURNOS} from './domain';
import {reversibleFamily} from './motorLalo';
import {allPhysicalVt3} from './vt3Shadow';
import {connectedWinnerPairs,projectVerifiedConfigurations} from './connectedGeometry';
import type {Mark,Proposal,Trace} from './connectedGeometry';
export type ConnectedDay={date:string;sheet:DailySheet};
export type ConnectedSelection={target:Turno;top:Proposal[];availableFamilies:number;
 historicalDays:number;historicalPairs:number};
const coord=(c:{row:number;col:number})=>c.row+':'+c.col;
const canon=(cs:string[])=>[cs.join('>'),[...cs].reverse().join('>')].sort()[0];

export function verifiedMarks(day:ConnectedDay):Mark[]{
 const out:Mark[]=[],seen=new Set<string>();
 for(const turn of TURNOS)for(const m of day.sheet.matches[turn]||[]){
  if(m.jurisdiccion==='Montevideo'||!/^[0-9]{4}$/.test(m.cabeza))continue;
  for(const hit of m.hits){
   if(hit.kind!=='vt3'||!m.cabeza.endsWith(hit.value))continue;
   for(const route of hit.paths){
    const cells=route.map(coord);
    if(route.map(x=>x.digit).join('')!==hit.value)continue;
    const key=[day.date,turn,m.jurisdiccion,m.cabeza,hit.sourceId,canon(cells)].join('|');
    if(seen.has(key))continue;seen.add(key);
    out.push({date:day.date,turn,jur:m.jurisdiccion,head:m.cabeza,
     source:hit.sourceId,cells});
   }
  }
 }
 return out;
}
export function buildConnectedVt3(pre:DailySheet,date:string,target:Turno,
 days:ConnectedDay[]):ConnectedSelection{
 const distinct=new Map<string,ConnectedDay>();
 for(const day of days){
  if(day.date>=date)throw Error('Conectadas: datos históricos del objetivo o del futuro');
  distinct.set(day.date,day);
 }
 // Únicamente seis jornadas reales más recientes. D−7 queda incluido si aparece
 // en la ventana; jamás añadimos jornadas antiguas para fabricar respaldo.
 const previous=[...distinct.values()].sort((a,b)=>b.date.localeCompare(a.date))
  .filter(day=>TURNOS.some(t=>(day.sheet.heads[t]||[]).length>0)).slice(0,6);
 const historical=connectedWinnerPairs(previous.flatMap(verifiedMarks));
 const traces:Trace[]=[];
 const seen=new Set<string>();
 for(const col of pre.columns.slice(0,TURNOS.indexOf(target)+1)){
  for(const route of allPhysicalVt3(col.values)){
   const cells=route.map(coord),key=col.id+'|'+canon(cells);
   if(seen.has(key))continue;seen.add(key);
   const value=route.map(c=>c.digit).join('');
   traces.push({source:col.id as SourceId,cells,value,family:reversibleFamily(value)});
  }
 }
 const weekly=new Date(date+'T00:00:00Z');
 weekly.setUTCDate(weekly.getUTCDate()-7);
 const d7=weekly.toISOString().slice(0,10);
 const proposals=projectVerifiedConfigurations(historical,traces,date,
  previous.some(x=>x.date===d7)?d7:null,'SOLAPADAS_OTRA');
 return {target,top:proposals.slice(0,10),availableFamilies:proposals.length,
  historicalDays:previous.length,historicalPairs:historical.length};
}
