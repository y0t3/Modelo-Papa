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
async function main(){
 for(let date='2026-06-01';date<='2026-10-24';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const [today,previous,base]=await Promise.all([
   get(date),loadPreviousDraws(date,6,get),nocturnaAnteriorPorJur(date,get,20)
  ]);
  if(count(today)<20)continue;
  if(base.missing.length)throw Error('Actual incompleta '+date);
  const six=previous.slice().reverse();
  const rootDays=await Promise.all(six.map(d=>completed(d.date)));
  const allRoots:Root[]=rootDays.flatMap((x,i)=>x.roots.map(r=>({...r,daysBack:i+1})));
  const latest=previous[5],weekly=shiftDay(date,-7);
  const [baseD1,week,baseD7]=await Promise.all([
   nocturnaAnteriorPorJur(latest.date,get,20),get(weekly),
   nocturnaAnteriorPorJur(weekly,get,20)
  ]);
  if(baseD1.missing.length||baseD7.missing.length)throw Error('Raíces incompletas '+date);
  const history:LaloHistorical[]=[
   {date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,baseD1.heads)},
   ...(weekly<date&&hasDrawResults(week)?[{
    date:weekly,period:'D−7' as const,sheet:buildSheet(week,baseD7.heads)
   }]:[])
  ];
  if([...six.map(x=>x.date),...history.map(x=>x.date)].some(d=>d>=date))
   throw Error('FUGA '+date);
  for(const [i,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const t of TURNOS.slice(0,i))pre[t]={...today[t]};
   const sheet=buildSheet(pre,base.heads);
   if(sheet.heads[turn].length||sheet.matches[turn].length)
    throw Error('FUGA PRE '+date+' '+turn);
   const columns=sheet.columns.slice(0,i+1),physical=routes(columns);
   const view=buildMotorLalo(sheet,date,turn,history);
   const rank=new Map(view.ranks.vt3.map(f=>[f.family,f.rank]));
   const baseTop=view.ranks.vt3.slice(0,10).map(f=>f.family);
   const fMap:Record<string,Features>={};
   for(const [family,paths] of physical)
    fMap[family]=features(paths,allRoots,latest.date,weekly);
   const unavailable=[...physical].filter(([family])=>!rank.has(family));
   // REORDENAR EXCLUSIVAMENTE las diez familias reconocidas:
   // ninguna entrada ni salida. Fijar las tres señales ANTES de POST.
   const picks=(Object.fromEntries(MODES.map(m=>[m,[...baseTop]]))) as Record<Mode,string[]>;
   const pool:Record<Exclude<Mode,'BASE'>,string[]>={
    PULSO_TOP10:baseTop.filter(f=>fMap[f]?.pulse101>0),
    RACHA_TOP10:baseTop.filter(f=>fMap[f]?.streak11>0),
    DERECHA_TOP10:baseTop.filter(f=>fMap[f]?.rightWalk>0)
   };
   for(const mode of MODES.slice(1)){
    const field=mode==='PULSO_TOP10'?'pulse101':
     mode==='RACHA_TOP10'?'streak11':'rightWalk';
    const candidates=[...baseTop];
    candidates.sort((a,b)=>(fMap[b]?.[field]||0)-(fMap[a]?.[field]||0)||
     baseTop.indexOf(a)-baseTop.indexOf(b));
    picks[mode]=candidates;
    if(candidates.length!==baseTop.length||
     candidates.slice().sort().join('|')!==baseTop.slice().sort().join('|'))
     throw Error('TOP10 MODIFICADO '+date+' '+turn+' '+mode);
   }
   const actual=JURS.map(j=>({jur:j,head:today[turn]?.[j]||''}))
    .filter(x=>valid(x.head));
   cuts.push({date,turn,block:date<='2026-07-31'?'JUN_JUL':
    date<='2026-09-30'?'AGO_SEP':'OCT',heads:actual.map(x=>reversibleFamily(x.head.slice(-3))),
    base:baseTop,familyInfo:fMap,pool,picks,candidateCount:physical.size});
   for(const {jur,head} of actual){
    const family=reversibleFamily(head.slice(-3));
    const suffix=head.slice(-3);
    const path=columns.flatMap(c=>findPaths(c.values,suffix));
    const physicallyPossible=path.length>0,originalRank=rank.get(family)??null,
     trace=fMap[family]||null;
    const category=!physicallyPossible?'NO_FORMABLE':
     originalRank===null?'FORMABLE_NO_RECONOCIDA':
     originalRank>10?'RECONOCIDA_FUERA_TOP10':
     originalRank>5?'TOP6_10':originalRank>3?'TOP4_5':'TOP1_3';
    cases.push({date,turn,jur,head,suffix,family,category,
     physicallyPossible,originalRank,
     traceClass:trace?classOf(trace):null,trace,
     predicted:Object.fromEntries(MODES.map(m=>[m,
      cuts[cuts.length-1].picks[m].indexOf(family)>=0?
      cuts[cuts.length-1].picks[m].indexOf(family)+1:null]))});
   }
  }
  console.log('RASTRO_DIA',date);
 }
 const stages=['NO_FORMABLE','FORMABLE_NO_RECONOCIDA','RECONOCIDA_FUERA_TOP10',
  'TOP6_10','TOP4_5','TOP1_3'];
 const categories=['FORMA_MISMA_FUENTE_D1D7','FORMA_MISMA_FUENTE_6',
  'FORMA_FUENTE_VECINA_3','FORMA_FUENTE_VECINA_6',
  'ROCE_DOS_CELDAS_6','FORMA_OTRA_FUENTE_6','SIN_TESTIGO_6'];
 const summaries:any[]=[];
 for(const p of ['JUN_JUL','AGO_SEP','OCT','TOTAL']){
  const subset=cases.filter(x=>p==='TOTAL'||(x.date<='2026-07-31'?'JUN_JUL':
   x.date<='2026-09-30'?'AGO_SEP':'OCT')===p);
  const row:any={period:p,total:subset.length,
   countByStage:Object.fromEntries(stages.map(k=>[k,subset.filter(x=>x.category===k).length])),
   noRecognizedByTrace:Object.fromEntries(categories.map(k=>[k,subset.filter(
    x=>x.category==='FORMABLE_NO_RECONOCIDA'&&x.traceClass===k).length])),
   candidatesWithUnrecognizedWitness:subset.filter(x=>
    x.category==='FORMABLE_NO_RECONOCIDA'&&x.trace&&
    (x.trace.same6+x.trace.neighbor6+x.trace.overlap6)>0).length};
  row.byMode=Object.fromEntries(MODES.map(m=>[m,Object.fromEntries(
   [3,5,10].map(n=>['top'+n,subset.filter(x=>
    x.predicted[m]!==null&&x.predicted[m]<=n).length]))]));
  summaries.push(row);
 }
 const changes:any[]=[];
 for(const m of MODES.slice(1)){
  const gained=cases.filter(x=>x.predicted.BASE===null&&x.predicted[m]!==null),
   lost=cases.filter(x=>x.predicted.BASE!==null&&x.predicted[m]===null);
  changes.push({mode:m,gained:gained.length,lost:lost.length,
   net:gained.length-lost.length,exampleGained:gained.slice(0,16),
   exampleLost:lost.slice(0,16)});
 }
 // Azar condicional: tres familias elegidas sin reemplazo del mismo
 // Top10 en el mismo corte; conserva exactamente la exposición de MV1.
 let rngState=20261025;
 const rand=()=>{rngState^=rngState<<13;rngState^=rngState>>>17;
  rngState^=rngState<<5;return (rngState>>>0)/4294967296};
 const random:any[]=[];
 for(const mode of MODES.slice(1)){
  for(const period of ['JUN_JUL','AGO_SEP','OCT','TOTAL']){
   const rows=cuts.filter(c=>period==='TOTAL'||c.block===period);
   const observed=rows.reduce((n,c)=>n+
    c.heads.filter(f=>c.picks[mode].slice(0,3).includes(f)).length,0);
   const original=rows.reduce((n,c)=>n+
    c.heads.filter(f=>c.base.slice(0,3).includes(f)).length,0);
   const dist:number[]=[];
   for(let iter=0;iter<10000;iter++){
    let hits=0;
    for(const c of rows){
     const list=[...c.base],n=Math.min(3,list.length);
     for(let i=0;i<n;i++){
      const j=i+Math.floor(rand()*(list.length-i));
      [list[i],list[j]]=[list[j],list[i]];
     }
     hits+=c.heads.filter(f=>list.slice(0,n).includes(f)).length;
    }
    dist.push(hits);
   }
   dist.sort((a,b)=>a-b);
   random.push({mode,period,cuts:rows.length,top3:observed,baseTop3:original,
    mean:dist.reduce((n,x)=>n+x,0)/dist.length,
    p95:dist[Math.floor(.95*dist.length)],
    equalOrBetter:dist.filter(x=>x>=observed).length/dist.length});
  }
 }
 const profiles:any[]=[];
 for(const period of ['JUN_JUL','AGO_SEP','OCT','TOTAL']){
  const rows=cuts.filter(c=>period==='TOTAL'||c.block===period);
  const marks=['pulse101','streak11','rightWalk'] as const;
  profiles.push({period,cuts:rows.length,
   withSignal:Object.fromEntries(marks.map(k=>[k,rows.filter(c=>
    c.base.some(f=>(c.familyInfo[f]?.[k]||0)>0)).length])),
   averageTop10FamiliesWithSignal:Object.fromEntries(marks.map(k=>[
    k,rows.reduce((n,c)=>n+c.base.filter(f=>(c.familyInfo[f]?.[k]||0)>0).length,0)/
     Math.max(1,rows.length)]))});
 }
 const total=summaries.find(x=>x.period==='TOTAL');
 if(!total||total.total!==3321)throw Error('Muestra distinta de 3321');
 if(total.countByStage.FORMABLE_NO_RECONOCIDA!==542)
  throw Error('542 no replicadas: '+total.countByStage.FORMABLE_NO_RECONOCIDA);
 if(total.byMode.BASE.top10!==59||total.byMode.BASE.top3!==17)
  throw Error('Base del motor no replica 59/17');
 if(cuts.length!==620)throw Error('No son 620 cortes: '+cuts.length);
 const out='auditorias/lalo-vt3-transiciones-top10-25oct/resultados';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/resumen.json',JSON.stringify({summaries,changes,random,
  days:new Set(cuts.map(c=>c.date)).size,cuts:cuts.length,heads:cases.length},null,2));
 fs.writeFileSync(out+'/cabezas.json',JSON.stringify(cases,null,2));
 fs.writeFileSync(out+'/cortes.json',JSON.stringify(cuts,null,2));
 fs.writeFileSync(out+'/perfiles-top10.json',JSON.stringify(profiles,null,2));
 console.log('RASTRO_RESUMEN',JSON.stringify(summaries));
 console.log('TOP10_AZAR',JSON.stringify(random));
 console.log('TOP10_PERFILES',JSON.stringify(profiles));
 console.log('RASTRO_CAMBIOS',JSON.stringify(changes.map(z=>({
  mode:z.mode,gained:z.gained,lost:z.lost,net:z.net,
  sampleGained:z.exampleGained.slice(0,6).map(({date,turn,jur,head,traceClass})=>({date,turn,jur,head,traceClass})),
  sampleLost:z.exampleLost.slice(0,6).map(({date,turn,jur,head})=>({date,turn,jur,head}))
 }))));
}
main().catch(e=>{console.error('RASTRO_ERROR',e);process.exitCode=1});
