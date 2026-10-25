/**
 * LAB VT3 · Embudo físico y rastro de figuras, 6 jornadas.
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

type Mode='BASE'|'MISMA_6'|'DOS_DIAS'|'RECIENTE_2'|'DENSIDAD';
const MODES:Mode[]=['BASE','MISMA_6','DOS_DIAS','RECIENTE_2','DENSIDAD'];
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
 witnesses:Partial<Record<'same'|'neighbor'|'overlap',any>>;
};
function features(paths:Route[],roots:Root[],d1:string,d7:string):Features{
 const f:Features={same6:0,neighbor3:0,neighbor6:0,overlap6:0,
  exactD1D7:0,anyRoots6:0,sourceCount:new Set(paths.map(p=>p.source)).size,
  paths:paths.length,sameDays:0,recent2:0,lastDay:7,ratio:0,witnesses:{}};
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

/** Diagnóstico POST seleccionado sobre familias ausentes, pero información
 * geométrica calculada PRE con seis jornadas previas y hoja por corte.
 * No se permite usar la cabeza objetivo para construir la columna.
 */
const targetsPost=[
 {turn:'Primera',jur:'Provincia',head:'9379'},
 {turn:'Primera',jur:'Córdoba',head:'1573'},
 {turn:'Matutino',jur:'Ciudad',head:'9321'},
 {turn:'Vespertino',jur:'Provincia',head:'5693'},
 {turn:'Nocturno',jur:'Córdoba',head:'5739'}
];
async function main(){
 const date='2026-10-24',today=await get(date);
 const prev=await loadPreviousDraws(date,6,get);
 const rootDays=await Promise.all(prev.slice().reverse().map(d=>completed(d.date)));
 const roots:Root[]=rootDays.flatMap((x,i)=>
  x.roots.map(y=>({...y,daysBack:i+1})));
 const base=await nocturnaAnteriorPorJur(date,get,20);
 if(base.missing.length)throw Error('Base nocturna incompleta');
 const weekly=shiftDay(date,-7);
 const observed:any[]=[];
 for(const test of targetsPost){
  if(today[test.turn]?.[test.jur]!==test.head)
   throw Error('El resultado seleccionado POST no coincide '+test.turn+' '+test.jur);
  const idx=TURNOS.indexOf(test.turn as any);
  if(idx<0)throw Error('Turno inválido');
  const pre=diaVacio();
  for(const old of TURNOS.slice(0,idx))pre[old]={...today[old]};
  const sheet=buildSheet(pre,base.heads);
  if(sheet.heads[test.turn].length||sheet.matches[test.turn].length)
   throw Error('FUGA temporal');
  const candidateValue=test.head.slice(-3),candidateFamily=reversibleFamily(candidateValue);
  const currentPaths:Route[]=sheet.columns.slice(0,idx+1).flatMap(col=>
   findPaths(col.values,candidateValue).map(p=>({source:col.id,
    shape:geometry(p),anchor:anchor(p),coords:p.map(coord),
    value:candidateValue,family:candidateFamily})));
  if(!currentPaths.length)throw Error('El caso no es formable '+test.head);
  const signals=features(currentPaths,roots,prev[5].date,weekly);
  const matched=roots.filter(r=>currentPaths.some(p=>
   r.shape===p.shape&&Math.abs(r.anchor-p.anchor)<=2))
   .map(r=>({
    date:r.date,daysBack:r.daysBack,source:r.source,
    oldHead:r.event.split('|').at(-1),oldValue:r.value,
    sameSource:currentPaths.some(p=>p.shape===r.shape&&
     p.source===r.source&&Math.abs(p.anchor-r.anchor)<=2),
    sourceDistance:Math.min(...currentPaths
     .filter(p=>p.shape===r.shape)
     .map(p=>Math.abs(order.indexOf(p.source)-order.indexOf(r.source)))),
    oldAnchor:r.anchor,newAnchors:currentPaths
     .filter(p=>p.shape===r.shape).map(p=>p.anchor),
    shape:r.shape
   }));
  // El mismo evento publicado puede producir varias rutas; mantener
  // eventos independientes y testigos geométricos sin multiplicar votos.
  const eventKeys=new Set(matched.map(r=>r.date+'|'+r.oldHead+'|'+r.source));
  observed.push({
   turn:test.turn,jur:test.jur,head:test.head,family:candidateFamily,
   validPhysicalRoutes:currentPaths.map(p=>({
    source:p.source,anchor:p.anchor,shape:p.shape,coords:p.coords,value:p.value
   })),
   history6:prev.map(d=>d.date),
   signal:{same6:signals.same6,sameDays:signals.sameDays,
    neighbor3:signals.neighbor3,neighbor6:signals.neighbor6,
    overlap6:signals.overlap6,anyRoots6:signals.anyRoots6,
    recent2:signals.recent2,exactD1D7:signals.exactD1D7,
    activePattern:signals.activePattern,pulse101:signals.pulse101,
    sameSourceWitness:signals.witnesses.same,
    nearbySourceWitness:signals.witnesses.neighbor},
   matchedEvents:eventKeys.size,matchedRoutes:matched.length,
   matched
  });
 }
 const output={date,
  note:'Las cabezas objetivo solo identifican los cinco casos POST; nunca se usan para construir candidatos PRE. Historial: fuentes geométricas ganadoras publicadas anteriores al 24/10.',
  records:observed};
 const out='auditorias/lalo-retro-sabado24-vt234';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/seis-jornadas-testigos-faltantes.json',
  JSON.stringify(output,null,2)+'\n');
 console.log('RASTRO_SEIS',JSON.stringify(observed.map(x=>({
  turn:x.turn,jur:x.jur,head:x.head,
  family:x.family,
  routes:x.validPhysicalRoutes,
  signal:x.signal,
  matchedEvents:x.matchedEvents,
  matched:x.matched
 }))));
}
main().catch(e=>{console.error('RASTRO_SEIS_ERROR',e);process.exitCode=1});
