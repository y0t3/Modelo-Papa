// Lector visual combinado 7D. Experimental, determinista y causal.
// Prioriza recorridos GANADORES D-7, conservando geometría, columna y modalidad.
// Cada explicación solo contiene antecedentes anteriores al turno objetivo.
// NO modifica el selector semanal ni garantiza mejora sobre el azar.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';
import type {DatedSheet,CycleKind} from './cycle7d';
import {reconstructMarkedMoments,priorMarkedMoments} from './markedSheet7d';
import {routeZone,observeSpatialFlow7D} from './spatialFlow7d';
import type {VerticalZone} from './spatialFlow7d';

export type CombinedSignal={name:'D7'|'RECONFIRMACION'|'PROXIMIDAD'|'RAMA'|'ESPACIAL'|'CRECIMIENTO';evidence:string;};
export type CombinedCandidate={kind:CycleKind;value:string;sourceId:SourceId;path:Path;zone:VerticalZone;score:number;signals:CombinedSignal[]};
export type CombinedResult={date:string;turn:Turno;decision:'OBSERVAR'|'NO JUGAR';candidates:CombinedCandidate[];evaluated:number;eligible:number;reason:string};
const pathKey=(p:Path)=>p.map(c=>c.row+':'+c.col).join('>');
const sortMoment=(d:string,t:Turno)=>d+'|'+String(TURNOS.indexOf(t));
const weekAgo=(d:string)=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()-7);return x.toISOString().slice(0,10)};
const verified=(p:Path,values:string[])=>p.length>=2&&p.every(c=>c.row>=0&&c.row<6&&c.col>=0&&c.col<2&&/^\d{2}$/.test(values[c.row]||'')&&values[c.row][c.col]===c.digit);
const project=(p:Path,values:string[]):Path|null=>{
 const path=p.map(c=>({...c,digit:values[c.row]?.[c.col]||''}));
 return path.every(c=>/^[0-9]$/.test(c.digit))?path:null;
};
const moveKey=(p:Path)=>p.slice(1).map((c,i)=>(c.row-p[i].row)+','+(c.col-p[i].col)).join(';');
const edges=(p:Path)=>new Set(p.slice(1).map((c,i)=>p[i].row+':'+p[i].col+'>'+c.row+':'+c.col));
export function readCombined7D(dated:DatedSheet[],current:DailySheet,date:string,turn:Turno):CombinedResult{
 if(!TURNOS.includes(turn))throw new Error('Turno inválido');
 const targetIndex=TURNOS.indexOf(turn);
 // No historical sheet with the objective date may carry its own winning marks.
 const clean=dated.filter(x=>x.date<date);
 const moments=reconstructMarkedMoments(clean);
 const historical=priorMarkedMoments(moments,date,turn);
 const sameWeekday=clean.find(d=>d.date===weekAgo(date));
 if(!sameWeekday)return {date,turn,decision:'NO JUGAR',candidates:[],eligible:0,evaluated:0,reason:'Falta la hoja del mismo día de la semana anterior.'};
 const weekly=historical.find(m=>m.date===sameWeekday.date&&m.turn===turn);
 if(!weekly||weekly.marks.length===0)return {date,turn,decision:'NO JUGAR',candidates:[],eligible:0,evaluated:0,reason:'La hoja D-7 no tiene rutas ganadoras marcadas en este turno.'};
 const activeDates=[...new Set(historical.map(m=>m.date))].sort().slice(-6);
 const intermediate=historical.filter(m=>m.date>sameWeekday.date&&activeDates.includes(m.date));
 const flow=observeSpatialFlow7D(clean,date,turn);
 const available=current.columns.slice(0,targetIndex+1);
 const pool=new Map<string,CombinedCandidate>();
 for(const mark of weekly.marks){
  const col=available.find(c=>c.id===mark.sourceId);
  if(!col||!verified(mark.route,sameWeekday.sheet.columns.find(c=>c.id===mark.sourceId)?.values||[]))continue;
  const path=project(mark.route,col.values);
  if(!path)continue;
  const value=path.map(c=>c.digit).join('');
  const zone=routeZone({route:path});
  const signature=moveKey(mark.route),shape=pathKey(mark.route),ee=edges(mark.route);
  const confirmations=new Set<string>(),recent=new Set<string>(),branched=new Set<string>();
  for(const m of intermediate){
   for(const x of m.marks){
    if(x.kind!==mark.kind||x.sourceId!==mark.sourceId)continue;
    const moment=sortMoment(m.date,m.turn);
    if(pathKey(x.route)===shape)confirmations.add(moment);
    if(moveKey(x.route)===signature)recent.add(moment);
    if(x.route.some(c=>mark.route.some(q=>q.row===c.row&&q.col===c.col))&&[...edges(x.route)].some(e=>!ee.has(e)))branched.add(moment);
   }
  }
  const trend=flow.trends.find(x=>x.kind===mark.kind&&x.sourceId===mark.sourceId&&x.winningTurn===turn&&x.zone===zone);
  const signals:CombinedSignal[]=[{name:'D7',evidence:'Ruta ganadora marcada en '+sameWeekday.date+' · '+turn}];
  if(confirmations.size)signals.push({name:'RECONFIRMACION',evidence:confirmations.size+' turnos intermedios con la misma ruta confirmada'});
  if(recent.size)signals.push({name:'PROXIMIDAD',evidence:recent.size+' turnos intermedios con la misma geometría confirmada'});
  if(branched.size)signals.push({name:'RAMA',evidence:branched.size+' turnos con rutas ganadoras conectadas (no confirmación exacta)'});
  if(trend?.recentDraws)signals.push({name:'ESPACIAL',evidence:trend.recentDraws+' turnos recientes con origen '+mark.sourceId+', salida '+turn+' y zona '+zone});
  if(trend&&trend.previousDraws>0&&trend.recentDraws>trend.previousDraws)signals.push({name:'CRECIMIENTO',evidence:'Frecuencia reciente mayor que anterior dentro del ciclo'});
  // Una señal = una familia de evidencia; no suma por cada ruta/cabeza superpuesta.
  const score=signals.reduce((sum,s)=>sum+({D7:1,RECONFIRMACION:2,PROXIMIDAD:1,RAMA:0.5,ESPACIAL:1,CRECIMIENTO:0.5}[s.name]),0);
  const key=mark.kind+'|'+value;
  const candidate={kind:mark.kind,value,sourceId:mark.sourceId,path,zone,score,signals};
  if(!pool.has(key)||score>pool.get(key)!.score)pool.set(key,candidate);
 }
 const ordered=[...pool.values()].sort((a,b)=>b.score-a.score||a.kind.localeCompare(b.kind)||a.value.localeCompare(b.value));
 const caps:Record<CycleKind,number>={vt2:3,vt3:3,vt4:1};
 const candidates:CombinedCandidate[]=[];
 for(const c of ordered)if(candidates.filter(x=>x.kind===c.kind).length<caps[c.kind])candidates.push(c);
 return {date,turn,decision:candidates.length?'OBSERVAR':'NO JUGAR',candidates,evaluated:weekly.marks.length,eligible:ordered.length,
  reason:'Ranking experimental de evidencias independientes sobre recorridos D-7. Pesos heurísticos, sin calibración ni ventaja validada. No es la decisión oficial.'};
}
