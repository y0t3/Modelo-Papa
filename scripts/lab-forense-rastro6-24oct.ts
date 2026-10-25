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

type Mode='BASE'|'PULSO_TOP10'|'RACHA_TOP10'|'DERECHA_TOP10';
const MODES:Mode[]=['BASE','PULSO_TOP10','RACHA_TOP10','DERECHA_TOP10'];
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

/** Test POST descriptivo con lista PRE de familias elegibles congelada.
 * Los únicos ganadores usados después de formar pools son las cabezas
 * de cada turno; ninguna raíz histórica puede ser igual o posterior al
 * objetivo. No se emplea la cabeza del mismo día para armar el pool.
 */
async function main(){
 const date='2026-10-24',today=await get(date);
 const previous=await loadPreviousDraws(date,6,get);
 const last=previous.at(-1)!;
 const weekly=shiftDay(date,-7);
 const [base,d1Base,week,d7Base]=await Promise.all([
  nocturnaAnteriorPorJur(date,get,20),
  nocturnaAnteriorPorJur(last.date,get,20),
  get(weekly),nocturnaAnteriorPorJur(weekly,get,20)
 ]);
 if(base.missing.length||d1Base.missing.length||d7Base.missing.length)
  throw Error('Missing historical Nocturna');
 const hist:LaloHistorical[]=[
  {date:last.date,period:'D−1',sheet:buildSheet(last.heads,d1Base.heads)},
  ...(hasDrawResults(week)?[{
   date:weekly,period:'D−7' as const,sheet:buildSheet(week,d7Base.heads)
  }]:[])
 ];
 const six=previous.slice().reverse();
 const roots=(await Promise.all(six.map(d=>completed(d.date))))
  .flatMap((x,i)=>x.roots.map(r=>({...r,daysBack:i+1})));
 if(roots.some(r=>r.date>=date)||previous.some(d=>d.date>=date))
  throw Error('Temporal leak');
 const check=['9379','1573','9321','5693','5739'];
 const targetEvents:any[]=[],stats:any[]=[];
 for(const [idx,turn] of TURNOS.entries()){
  const pre=diaVacio();
  for(const t of TURNOS.slice(0,idx))pre[t]={...today[t]};
  const sheet=buildSheet(pre,base.heads);
  if(TURNOS.slice(idx).some(t=>sheet.heads[t].length))
   throw Error('Fuga PRE');
  const physical=routes(sheet.columns.slice(0,idx+1)),
   view=buildMotorLalo(sheet,date,turn,hist),
   rank=new Map(view.ranks.vt3.map(f=>[f.family,f.rank]));
  const pools:Record<string,string[]>={
   ANY:[...physical.keys()].filter(f=>!rank.has(f)),
   SAME_6:[],NEIGHBOR_3:[],NEIGHBOR_6:[],OVERLAP_6:[],
   OTHER_SHAPE_6:[]
  };
  const all:Record<string,Features>={};
  for(const [family,paths] of physical){
   if(rank.has(family))continue;
   const f=features(paths,roots,last.date,weekly);all[family]=f;
   if(f.same6>0)pools.SAME_6.push(family);
   if(f.neighbor3>0)pools.NEIGHBOR_3.push(family);
   if(f.neighbor6>0)pools.NEIGHBOR_6.push(family);
   if(f.overlap6>0)pools.OVERLAP_6.push(family);
   if(f.anyRoots6>0)pools.OTHER_SHAPE_6.push(family);
  }
  const realHeads=JURS.filter(j=>j!=='Montevideo'||turn==='Nocturno')
   .map(j=>({jur:j,head:today[turn]?.[j]||''}))
   .filter(x=>/^\d{4}$/.test(x.head));
  const goals=realHeads.filter(x=>check.includes(x.head));
  for(const x of goals){
   const family=reversibleFamily(x.head.slice(-3));
   if(!physical.has(family))continue;
   if(rank.has(family))throw Error('Expected unrecognized head '+x.head);
   const f=all[family],paths=physical.get(family)!;
   const sources=[...new Set(paths.map(x=>x.source))];
   const related=roots.flatMap(r=>paths.filter(p=>
    p.shape===r.shape&&Math.abs(p.anchor-r.anchor)<=2)
    .map(p=>({
     rootDate:r.date,daysBack:r.daysBack,
     rootSource:r.source,targetSource:p.source,
     rootTurn:r.event.split('|')[1],rootJur:r.event.split('|')[2],
     oldHead:r.event.split('|')[3],oldFamily:r.family,
     oldValue:r.value,newValue:p.value,
     anchorShift:p.anchor-r.anchor,
     sameSource:p.source===r.source,
     sourceDistance:Math.abs(order.indexOf(p.source)-order.indexOf(r.source))
    })));
   const event={
    turn,jur:x.jur,head:x.head,family,
    sources,physicalPaths:paths.length,
    rootsD1D7SameShapeSameSource:f.exactD1D7,
    sameSourceRootEventsSix:f.same6,activeDaysLast6:f.sameDays,
    neighbourRootEventsLast3:f.neighbor3,
    neighbourRootEventsSix:f.neighbor6,
    overlapRootEventsSix:f.overlap6,
    anyShapeRootsSix:f.anyRoots6,
    patternNewestFirst:f.activePattern,
    poolsContainingFamily:Object.fromEntries(Object.entries(pools)
     .map(([k,ls])=>[k,ls.includes(family)])),
    eligibleCountsAtOwnCut:Object.fromEntries(Object.entries(pools)
     .map(([k,ls])=>[k,ls.length])),
    matchedWinningRootExamples:related.slice(0,16)
   };
   targetEvents.push(event);
  }
  stats.push({turn,heads:realHeads.length,
   totalPhysicalFamilies:physical.size,
   engineRecognizedFamilies:view.ranks.vt3.length,
   unrecognizedFamilies:pools.ANY.length,
   poolCounts:Object.fromEntries(Object.entries(pools).map(([k,v])=>[k,v.length])),
   actualUnrecognizedWinners:realHeads.filter(x=>
    pools.ANY.includes(reversibleFamily(x.head.slice(-3)))).map(x=>({
    jur:x.jur,head:x.head,family:reversibleFamily(x.head.slice(-3))
   })),
   conditionalWinnerPools:Object.fromEntries(Object.entries(pools).map(([k,ls])=>[
    k,realHeads.filter(x=>ls.includes(reversibleFamily(x.head.slice(-3))))
     .map(x=>({jur:x.jur,head:x.head}))]))
  });
 }
 const report={
  date,method:'RETROSPECTIVE_AS_OF_PRE_6_HISTORIC_DRAWS',
  drawDaysNewestFirst:six.map(x=>x.date),
  note:'Witnesses only from actual winning figures on preceding dates. A family may be physically formable without historic witness; pool counts are PRE candidates, not selected by POST.',
  stats,targetEvents
 };
 const out='auditorias/lalo-forense-rastro6-24oct/resultados';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/seis-jornadas.json',JSON.stringify(report,null,2));
 console.log('RASTRO6_24OCT',JSON.stringify(report));
}
main().catch(e=>{console.error('RASTRO6_ERROR',e);process.exitCode=1});
