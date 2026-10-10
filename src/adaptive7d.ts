// Modelo Papá — adaptación 7D experimental, NO sustituye el motor semanal.
// Lee exclusivamente HOJAS HISTÓRICAS MARCADAS y actualiza después de cada turno.
// El estado se recalcula desde cero para cada corte: impide usar resultados futuros.
import {TURNOS} from './domain';
import {observeSpatialFlow7D} from './spatialFlow7d';
import type {SpatialFlow7D} from './spatialFlow7d';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';
import {reconstructMarkedMoments,priorMarkedMoments} from './markedSheet7d';
import type {DatedSheet, CycleKind} from './cycle7d';

export type AdaptiveLife='NACE'|'OBSERVAR'|'CONFIRMA'|'ACTIVA'|'DECAE'|'MUERE';
export type AdaptiveCandidate={kind:CycleKind;value:string;sourceId:SourceId;path:Path;state:AdaptiveLife;score:number;confirmations:number;lastSeenDraws:number;signature:string};
export type Adaptive7DResult={date:string;target:Turno;mode:'EXPERIMENTAL';historyDays:number;candidates:AdaptiveCandidate[];tracked:number;reason:string;spatialFlow:SpatialFlow7D};
type Track={kind:CycleKind;sourceId:SourceId;signature:string;score:number;confirmations:number;last:number;first:number;};
const sig=(path:Path)=>path.slice(1).map((c,i)=>(c.row-path[i].row)+','+(c.col-path[i].col)).join(';');
function apply(values:string[],signature:string):Path[]{
 const moves=signature.split(';').filter(Boolean).map(s=>s.split(',').map(Number));
 const out:Path[]=[];
 for(let row=0;row<6;row++)for(let col=0;col<2;col++){
  if(!/^\d{2}$/.test(values[row]||''))continue;
  const coords:Array<[number,number]>=[[row,col]];
  let r=row,c=col,ok=true;
  for(const [dr,dc] of moves){
   r+=dr;c+=dc;
   if(r<0||r>=6||c<0||c>1||Math.abs(dr)>1||Math.abs(dc)>1||(dr===0&&dc===0)||!/^\d{2}$/.test(values[r]||'')||coords.some(([a,b])=>a===r&&b===c)){ok=false;break}
   coords.push([r,c]);
  }
  if(ok)out.push(coords.map(([a,b])=>({row:a,col:b,digit:values[a][b]})));
 }
 return out;
}
function life(x:Track,lastIndex:number):AdaptiveLife{
 const stale=lastIndex-x.last;
 if(stale>=12)return 'MUERE';
 if(stale>=5)return 'DECAE';
 if(x.confirmations>=3&&x.score>=1.7)return 'ACTIVA';
 if(x.confirmations>=2&&x.score>=1.1)return 'CONFIRMA';
 if(x.confirmations>=2)return 'OBSERVAR';
 return 'NACE';
}
export function analyzeAdaptive7D(dated:DatedSheet[],current:DailySheet,date:string,target:Turno):Adaptive7DResult{
 if(!TURNOS.includes(target))throw new Error('Turno objetivo inválido');
 // La ventana no contiene resultados del turno objetivo ni posteriores.
 const marked=reconstructMarkedMoments(dated);
 const history=priorMarkedMoments(marked,date,target);
 // Sólo un sorteo con cabezas efectivamente publicadas es una oportunidad
 // temporal de la figura. Reconstruir una hoja genera también momentos vacíos
 // para turnos no sorteados: contarlos hacía decaer indebidamente el recorrido.
 const completed=new Set(dated.flatMap(d=>TURNOS.filter(t=>
  (d.sheet.heads[t]||[]).some(h=>/^\d{4}$/.test(h))).map(t=>d.date+'|'+t)));
 const actualDraws=history.filter(m=>completed.has(m.date+'|'+m.turn));
 const priorDates=[...new Set(actualDraws.map(x=>x.date))].sort().slice(-6);
 const moments=actualDraws.filter(x=>priorDates.includes(x.date));
 const tracks=new Map<string,Track>();
 // Cada turno es un avance temporal; la memoria decae incluso cuando no se confirma nada.
 moments.forEach((m,index)=>{
  for(const tr of tracks.values())tr.score*=0.90;
  const observed=new Set<string>();
  for(const mark of m.marks){
   const signature=sig(mark.route),k=mark.kind+'|'+mark.sourceId+'|'+signature;
   if(observed.has(k))continue;
   observed.add(k);
   let tr=tracks.get(k);
   if(!tr){tr={kind:mark.kind,sourceId:mark.sourceId,signature,score:0,confirmations:0,last:index,first:index};tracks.set(k,tr)}
   tr.score+=1;tr.confirmations++;tr.last=index;
  }
 });
 const currentIndex=moments.length;
 const available=current.columns.slice(0,TURNOS.indexOf(target)+1);
 const candidates:AdaptiveCandidate[]=[];
 for(const t of tracks.values()){
  const state=life(t,currentIndex);
  if(state==='MUERE'||state==='DECAE')continue;
  const source=available.find(c=>c.id===t.sourceId);
  if(!source)continue;
  for(const path of apply(source.values,t.signature)){
   if(path.length!==Number(t.kind.slice(-1)))continue;
   candidates.push({kind:t.kind,value:path.map(c=>c.digit).join(''),sourceId:t.sourceId,path,
    state,score:t.score,confirmations:t.confirmations,lastSeenDraws:currentIndex-t.last,signature:t.signature});
  }
 }
 const rank:Record<AdaptiveLife,number>={ACTIVA:4,CONFIRMA:3,OBSERVAR:2,NACE:1,DECAE:0,MUERE:0};
 candidates.sort((a,b)=>rank[b.state]-rank[a.state]||b.score-a.score||b.confirmations-a.confirmations||a.value.localeCompare(b.value));
 // Evita multiplicar apoyo por rutas superpuestas del mismo número.
 const limits:Record<CycleKind,number>={vt2:3,vt3:3,vt4:1};
 const chosen:AdaptiveCandidate[]=[];
 for(const candidate of candidates){
  if(chosen.filter(c=>c.kind===candidate.kind).length>=limits[candidate.kind])continue;
  if(chosen.some(c=>c.kind===candidate.kind&&c.value===candidate.value))continue;
  chosen.push(candidate);
 }
 return {date,target,mode:'EXPERIMENTAL',historyDays:priorDates.length,candidates:chosen,tracked:tracks.size,spatialFlow:observeSpatialFlow7D(dated,date,target),
  reason:'Memoria dinámica de figuras ganadoras ya marcadas; pesos heurísticos no validados. No reemplaza el selector semanal.'};
}
