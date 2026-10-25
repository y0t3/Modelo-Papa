/**
 * REPLAY RETROSPECTIVO: sábado 24/10. NO es sellado previo real.
 * PRE: todas las familias formadas en la hoja visible, nunca cabezas del turno objetivo.
 * POST: solo verifica aciertos después de guardar selección.
 * Bases Nocturna actual/D1/D7/6 días = última real POR jurisdicción.
 * Columna +11 estricta (sin cruces); familia reversible; un voto por
 * evento ganador de cabeza, nunca por cantidad de dibujos superpuestos.
 * NUEVA AUDITORÍA: emparejar ganadoras/no ganadoras dentro de cada corte.
 * Hipótesis FIJAS:
 *   VECINA_3: misma silueta en fuente inmediatamente vecina, ±2 filas
 *             activada en últimos tres días (no necesita mismo dígito).
 *   MISMA_6: misma silueta en misma fuente, ±2 filas,
 *            activada en últimos seis días.
 * Si se dispone de testigo, se sustituye solamente posición #10 del Top10.
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {descargarCabezas} from '../src/cabezas';
import {shiftDay} from '../src/dates';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import type {DailySheet,SourceId} from '../src/sheet';
import {cellsFromPlus11,findPaths} from '../src/paths';
import type {Path} from '../src/paths';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';

type Mode='BASE'|'PULSO_TOP10';
const MODES:Mode[]=['BASE','PULSO_TOP10'];
const order:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const valid=(x:string)=>/^\d{4}$/.test(x);
const cache=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{
 if(!cache.has(d))cache.set(d,descargarCabezas(d,true));
 return cache.get(d)!;
};
const count=(h:CabezasDia)=>TURNOS.reduce((n,t)=>
 n+JURS.filter(j=>valid(h[t]?.[j]||'')).length,0);
const geometry=(p:Path)=>{
 const mr=Math.min(...p.map(x=>x.row)),mc=Math.min(...p.map(x=>x.col));
 const coords=p.map(x=>(x.row-mr)+':'+(x.col-mc)).join('>');
 const rev=[...p].reverse().map(x=>(x.row-mr)+':'+(x.col-mc)).join('>');
 return [coords,rev].sort()[0];
};
const coord=(x:Path[number])=>x.row+':'+x.col;
const block=(p:Path)=>p.map(coord).sort().join(',');
const sequenceKey=(p:Path)=>{
 const forward=p.map(coord).join('>');
 const backward=[...p].reverse().map(coord).join('>');
 return [forward,backward].sort()[0];
};
const anchor=(p:Path)=>Math.min(...p.map(x=>x.row));
type Route={source:SourceId;shape:string;anchor:number;coords:string[];
 value:string;family:string;};
type Root=Route&{date:string;daysBack:number;event:string};
const cacheCompleted=new Map<string,Promise<{date:string;roots:Root[]}>>();
async function completed(date:string){
 if(!cacheCompleted.has(date))cacheCompleted.set(date,(async()=>{
  const [heads,base]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(base.missing.length)throw Error('Sin Nocturna previa '+date);
  const sheet=buildSheet(heads,base.heads),roots:Root[]=[];
  const seen=new Set<string>();
  for(const t of TURNOS)for(const m of sheet.matches[t]||[]){
   if(m.jurisdiccion==='Montevideo'||!valid(m.cabeza))continue;
   for(const hit of m.hits){
    if(hit.kind!=='vt3'||!m.cabeza.endsWith(hit.value))continue;
    for(const p of hit.paths){
     const event=[date,t,m.jurisdiccion,m.cabeza].join('|');
     const key=event+'|'+hit.sourceId+'|'+sequenceKey(p);
     if(seen.has(key))continue;
     seen.add(key);
     roots.push({date,daysBack:0,event,source:hit.sourceId,
      shape:geometry(p),anchor:anchor(p),coords:p.map(coord),
      value:hit.value,family:reversibleFamily(hit.value)});
    }
   }
  }
  return {date,roots};
 })());
 return cacheCompleted.get(date)!;
}
function routes(columns:DailySheet['columns']){
 const families=new Map<string,Route[]>();
 for(const col of columns){
  const cells=cellsFromPlus11(col.values);
  const seen=new Set<string>();
  const walk=(path:Path)=>{
   if(path.length===3){
    const bk=sequenceKey(path);if(seen.has(bk))return;
    seen.add(bk);
    const value=path.map(x=>x.digit).join(''),
      family=reversibleFamily(value);
    const old=families.get(family)||[];
    old.push({source:col.id,shape:geometry(path),anchor:anchor(path),
     coords:path.map(coord),value,family});
    families.set(family,old);
    return;
   }
   for(const next of cells){
    if(path.some(c=>c.row===next.row&&c.col===next.col))continue;
    const last=path[path.length-1];
    if(Math.max(Math.abs(last.row-next.row),Math.abs(last.col-next.col))!==1)continue;
    walk([...path,next]);
   }
  };
  for(const c of cells)walk([c]);
 }
 return families;
}
type Features={
 same6:number;neighbor3:number;neighbor6:number;overlap6:number;
 exactD1D7:number;anyRoots6:number;sourceCount:number;paths:number;
 sameDays:number;recent2:number;lastDay:number;ratio:number;
 activePattern:string;pulse101:number;streak11:number;rightWalk:number;
 witnesses:Partial<Record<'same'|'neighbor'|'overlap',any>>;
};
function features(paths:Route[],roots:Root[],d1:string,d7:string):Features{
 const f:Features={same6:0,neighbor3:0,neighbor6:0,overlap6:0,
  exactD1D7:0,anyRoots6:0,sourceCount:new Set(paths.map(p=>p.source)).size,
  paths:paths.length,sameDays:0,recent2:0,lastDay:7,ratio:0,
  activePattern:'000000',pulse101:0,streak11:0,rightWalk:0,witnesses:{}};
 const activeDays=new Set<number>();
 const rightTransitions=new Set<string>();
 const events={same:new Set<string>(),neighbor3:new Set<string>(),
  neighbor6:new Set<string>(),overlap:new Set<string>(),d:new Set<string>(),
  any:new Set<string>(),recent:new Set<string>(),days:new Set<string>()};
 for(const p of paths)for(const r of roots){
  const distance=Math.abs(p.anchor-r.anchor);
  const diff=Math.abs(order.indexOf(p.source)-order.indexOf(r.source));
  const shape=p.shape===r.shape;
  const direct=diff===0;
  if(direct&&shape&&distance<=2){
   events.same.add(r.event);
   events.days.add(r.date);
   activeDays.add(r.daysBack);
   if(r.daysBack<=2)events.recent.add(r.event);
   f.lastDay=Math.min(f.lastDay,r.daysBack);
   if(r.date===d1||r.date===d7)events.d.add(r.event);
   f.witnesses.same??={date:r.date,source:r.source,shape:r.shape,
    oldValue:r.value,newValue:p.value,oldAnchor:r.anchor,newAnchor:p.anchor};
  }
  if(diff===1&&shape&&distance<=2){
   events.neighbor6.add(r.event);
   if(r.daysBack<=3)events.neighbor3.add(r.event);
   f.witnesses.neighbor??={date:r.date,oldSource:r.source,newSource:p.source,
    shape:r.shape,oldValue:r.value,newValue:p.value,
    oldAnchor:r.anchor,newAnchor:p.anchor,daysBack:r.daysBack};
  }
  if(direct){
   const a=new Set(p.coords),overlap=r.coords.filter(c=>a.has(c)).length;
   if(overlap>=2){
    events.overlap.add(r.event);
    f.witnesses.overlap??={date:r.date,source:r.source,oldValue:r.value,
     newValue:p.value,sharedCells:overlap};
   }
  }
  if(shape&&distance<=2)events.any.add(r.event);
 }
 f.same6=events.same.size;f.neighbor3=events.neighbor3.size;
 f.neighbor6=events.neighbor6.size;f.overlap6=events.overlap.size;
 f.exactD1D7=events.d.size;f.anyRoots6=events.any.size;
 f.sameDays=events.days.size;f.recent2=events.recent.size;
 f.ratio=Number((f.same6/Math.max(1,f.paths)).toFixed(8));
 f.activePattern=Array.from({length:6},(_,i)=>activeDays.has(i+1)?'1':'0').join('');
 f.pulse101=Number(f.activePattern[0]==='1'&&f.activePattern[1]==='0'&&
  f.activePattern.slice(2).includes('1'));
 f.streak11=Number(f.activePattern.startsWith('11'));
 // Evidencia de migración cronológica: raíz más antigua en s-2,
 // raíz reciente en s-1, ruta del candidato físicamente en s.
 // Jamás implica tocar celdas ENTRE columnas en una misma hoja.
 for(const path of paths){
  const si=order.indexOf(path.source);
  if(si<2)continue;
  const newer=roots.filter(r=>r.shape===path.shape&&
   order.indexOf(r.source)===si-1&&r.daysBack<=3&&
   Math.abs(r.anchor-path.anchor)<=2);
  const older=roots.filter(r=>r.shape===path.shape&&
   order.indexOf(r.source)===si-2&&r.daysBack<=6);
  for(const a of newer)for(const b of older){
   if(b.daysBack<=a.daysBack||b.daysBack-a.daysBack>2)continue;
   if(Math.abs(b.anchor-a.anchor)>2)continue;
   rightTransitions.add(b.event+'>'+a.event);
  }
 }
 f.rightWalk=rightTransitions.size;
 return f;
}
function classOf(f:Features){
 if(f.exactD1D7)return 'FORMA_MISMA_FUENTE_D1D7';
 if(f.same6)return 'FORMA_MISMA_FUENTE_6';
 if(f.neighbor3)return 'FORMA_FUENTE_VECINA_3';
 if(f.neighbor6)return 'FORMA_FUENTE_VECINA_6';
 if(f.overlap6)return 'ROCE_DOS_CELDAS_6';
 if(f.anyRoots6)return 'FORMA_OTRA_FUENTE_6';
 return 'SIN_TESTIGO_6';
}
type Cut={date:string;turn:string;block:string;heads:string[];
 base:string[];familyInfo:Record<string,Features>;pool:Record<Exclude<Mode,'BASE'>,string[]>;
 picks:Record<Mode,string[]>;candidateCount:number;};
const cases:any[]=[],cuts:Cut[]=[];


/** REPLAY histórico "como si": hoy ya es conocido, pero cada corte
 * PRE solo recibe filas de turnos ANTERIORES del 24/10, y raíces
 * anteriores al 24. Prohibido emplear las cabezas del turno objetivo
 * o posteriores en cálculos de prioridades. POST se ejecuta aparte.
 */
type FamilyPick={rank:number;family:string;physicalValues:string[];
 motherFamilies:string[];physicalSources:string[]};
const out='auditorias/lalo-retro-sabado24-vt234/resultados';
const iso=()=>new Date().toISOString();
const encodeTop=(entries:ReturnType<typeof buildMotorLalo>['ranks']['vt3']):FamilyPick[]=>
 entries.slice(0,10).map((f,k)=>({
  rank:k+1,family:f.family,
  physicalValues:[...new Set(f.paths.map(p=>p.value))].sort(),
  motherFamilies:f.parentFamilies,
  physicalSources:[...new Set(f.paths.map(p=>p.sourceId))].sort()
 }));
async function main(){
 const date='2026-10-24',replayedAtUtc=iso();
 const target=await get(date); // ONLY used to feed earlier turns, not current turn
 const previous=await loadPreviousDraws(date,6,get);
 const latest=previous.at(-1);
 if(!latest||latest.date>=date)throw Error('Invalid prior day');
 const weekly=shiftDay(date,-7);
 const [base,baseD1,week,baseD7]=await Promise.all([
  nocturnaAnteriorPorJur(date,get,20),
  nocturnaAnteriorPorJur(latest.date,get,20),
  get(weekly),
  nocturnaAnteriorPorJur(weekly,get,20)
 ]);
 if(base.missing.length||baseD1.missing.length||baseD7.missing.length)
  throw Error('Root Nocturnas incomplete');
 const historical:LaloHistorical[]=[
  {date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,baseD1.heads)},
  ...(weekly<date&&hasDrawResults(week)?[{
   date:weekly,period:'D−7' as const,sheet:buildSheet(week,baseD7.heads)
  }]:[])
 ];
 const six=previous.slice().reverse();
 const allRoots=(await Promise.all(six.map(d=>completed(d.date))))
  .flatMap((x,i)=>x.roots.map(r=>({...r,daysBack:i+1})));
 if([...previous.map(x=>x.date),weekly,...historical.map(x=>x.date),
  ...base.checked,...baseD1.checked,...baseD7.checked].some(x=>x>=date))
  throw Error('Post 24/10 historical source');
 const cuts:any[]=[];
 for(const [idx,turn] of TURNOS.entries()){
  const sanitized=diaVacio();
  for(const earlier of TURNOS.slice(0,idx))sanitized[earlier]={...target[earlier]};
  // The target rows cannot leak through sanitized into buildMotorLalo/features.
  const sheet=buildSheet(sanitized,base.heads);
  if(sheet.heads[turn].length||sheet.matches[turn].length)
   throw Error('PRE contaminate '+turn);
  if(TURNOS.slice(idx).some(t=>sheet.heads[t].length||
   sheet.matches[t].length))throw Error('Future rows visible '+turn);
  const currentColumns=sheet.columns.slice(0,idx+1);
  const physical=routes(currentColumns);
  const view=buildMotorLalo(sheet,date,turn,historical);
  const baseTop=encodeTop(view.ranks.vt3);
  const featuresMap:Record<string,Features>={};
  for(const f of baseTop){
   const paths=physical.get(f.family);
   if(!paths?.length)throw Error('Missing VT3 physical family '+f.family);
   featuresMap[f.family]=features(paths,allRoots,latest.date,weekly);
  }
  const pulseTop=[...baseTop].sort((a,b)=>
   featuresMap[b.family].pulse101-featuresMap[a.family].pulse101||
   a.rank-b.rank).map((f,k)=>({...f,rank:k+1}));
  if(pulseTop.length!==baseTop.length||
   pulseTop.map(x=>x.family).sort().join('|')!==baseTop.map(x=>x.family).sort().join('|'))
   throw Error('Pulse changed top10 membership '+turn);
  const primary={
   vt2:encodeTop(view.ranks.vt2),
   vt3:baseTop,
   vt4:encodeTop(view.ranks.vt4)
  };
  const pulse={
   vt3:pulseTop
  };
  const known:Record<string,Record<string,string>>={};
  for(const old of TURNOS.slice(0,idx))known[old]={...sanitized[old]};
  cuts.push({
   date,turn,asOf:'BEFORE_'+turn,retrospective:true,
   usedCurrentDateTurnRows:Object.keys(known),usedEarlierHeads:known,
   knownSourceColumns:currentColumns.map(x=>({id:x.id,values:x.values})),
   basic:primary,pulse,
   pulseFlags:baseTop.map(x=>({
    family:x.family,baselineRank:x.rank,
    signal:featuresMap[x.family].pulse101,
    activationDaysRecentFirst:featuresMap[x.family].activePattern,
    historyEvents:featuresMap[x.family].same6
   })),
   rankingCounts:Object.fromEntries((['vt2','vt3','vt4'] as const)
    .map(kind=>[kind,view.ranks[kind].length]))
  });
 }
 const replay={
  kind:'RETROSPECTIVE_CUTOFF_REPLAY_NOT_PROSPECTIVE',
  performedAtUtc:replayedAtUtc,targetDate:date,
  noTruePreDrawTimestamp:true,
  protocol:'Target 24/10 data loaded only as already published earlier turns for each as-of cutoff. Predictions do not receive heads from target turn or later. Outcomes compared by separate script.',
  historyDates:previous.map(x=>x.date),
  historicalRoots:historical.map(x=>({date:x.date,period:x.period})),
  nocturnaBasePerJur:base.dates,
  rows:cuts
 };
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/retro-pre-24oct.json',JSON.stringify(replay,null,2)+'\n');
 console.log('RETRO_PRE_DIAGNOSTICO',JSON.stringify({
  turns:cuts.map(x=>({turn:x.turn,top3VT2:x.basic.vt2.slice(0,3).map((v:FamilyPick)=>v.family),
   top3VT3:x.basic.vt3.slice(0,3).map((v:FamilyPick)=>v.family),
   top3Pulso:x.pulse.vt3.slice(0,3).map((v:FamilyPick)=>v.family),
   top3VT4:x.basic.vt4.slice(0,3).map((v:FamilyPick)=>v.family),
   pulsoCount:x.pulseFlags.filter((f:any)=>f.signal>0).length,
   total:x.rankingCounts
  })),
  roots:historical.map(x=>({date:x.date,period:x.period})),
  nocturnaBasePerJur:base.dates
 }));
 console.log('RETRO_PRE_JSON',JSON.stringify(replay));
}
main().catch(e=>{console.error('RETRO_PRE_ERROR',e);process.exitCode=1});
