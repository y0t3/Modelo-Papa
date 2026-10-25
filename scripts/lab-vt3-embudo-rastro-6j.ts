/**
 * LAB VT3 · Embudo físico y rastro de figuras, 6 jornadas.
 * PRE: todas las familias formadas en la hoja visible, nunca cabezas del turno objetivo.
 * POST: solo verifica aciertos después de guardar selección.
 * Bases Nocturna actual/D1/D7/6 días = última real POR jurisdicción.
 * Columna +11 estricta (sin cruces); familia reversible; un voto por
 * evento ganador de cabeza, nunca por cantidad de dibujos superpuestos.
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

type Mode='BASE'|'VECINA_3'|'MISMA_6';
const MODES:Mode[]=['BASE','VECINA_3','MISMA_6'];
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
 witnesses:Partial<Record<'same'|'neighbor'|'overlap',any>>;
};
function features(paths:Route[],roots:Root[],d1:string,d7:string):Features{
 const f:Features={same6:0,neighbor3:0,neighbor6:0,overlap6:0,
  exactD1D7:0,anyRoots6:0,sourceCount:new Set(paths.map(p=>p.source)).size,
  paths:paths.length,witnesses:{}};
 const events={same:new Set<string>(),neighbor3:new Set<string>(),
  neighbor6:new Set<string>(),overlap:new Set<string>(),d:new Set<string>(),
  any:new Set<string>()};
 for(const p of paths)for(const r of roots){
  const distance=Math.abs(p.anchor-r.anchor);
  const diff=Math.abs(order.indexOf(p.source)-order.indexOf(r.source));
  const shape=p.shape===r.shape;
  const direct=diff===0;
  if(direct&&shape&&distance<=2){
   events.same.add(r.event);
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
   const pool={
    VECINA_3:unavailable.filter(([family])=>fMap[family].neighbor3>0)
     .map(([family])=>family),
    MISMA_6:unavailable.filter(([family])=>fMap[family].same6>0)
     .map(([family])=>family)
   };
   const choose=(mode:Exclude<Mode,'BASE'>)=>{
    const prioritized=[...pool[mode]].sort((a,b)=>{
     const x=fMap[a],y=fMap[b];
     const primary=(u:Features)=>mode==='VECINA_3'?u.neighbor3:u.same6;
     return primary(y)-primary(x)||
      y.sourceCount-x.sourceCount||
      y.paths-x.paths||a.localeCompare(b);
    });
    return prioritized[0]??null;
   };
   const picks:Cut['picks']={BASE:baseTop,VECINA_3:[...baseTop],MISMA_6:[...baseTop]};
   for(const mode of ['VECINA_3','MISMA_6'] as const){
    const candidate=choose(mode);
    if(candidate){
     if(picks[mode].length===10)picks[mode][9]=candidate;
     else picks[mode].push(candidate);
    }
    if(picks[mode].length>10)throw Error('Exceso de cupo');
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
 // Randomización condicional: igual # de reemplazos y exactamente el
 // mismo conjunto elegible que pudo seleccionar cada criterio.
 const random:any[]=[];
 let state=20261025;
 const random01=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)/4294967296};
 for(const mode of MODES.slice(1)){
  for(const p of ['JUN_JUL','AGO_SEP','OCT','TOTAL']){
   const ss=cuts.filter(c=>p==='TOTAL'||c.block===p),
    observed=ss.reduce((n,c)=>n+c.heads.filter(f=>c.picks[mode].includes(f)&&
     !c.picks.BASE.includes(f)).length,0);
   const lost=ss.reduce((n,c)=>n+c.heads.filter(f=>c.picks.BASE.includes(f)&&
     !c.picks[mode].includes(f)).length,0);
   const dist:number[]=[];
   for(let i=0;i<10000;i++){
    let gain=0;
    for(const c of ss){
     const eligible=c.pool[mode];
     if(!eligible.length)continue;
     const x=eligible[Math.floor(random01()*eligible.length)];
     gain+=c.heads.filter(f=>f===x&&!c.base.includes(f)).length;
    }
    dist.push(gain);
   }
   dist.sort((a,b)=>a-b);
   random.push({mode,period:p,cuts:ss.length,
    withChoice:ss.filter(c=>c.pool[mode].length>0).length,
    meanPoolSize:ss.reduce((n,c)=>n+c.pool[mode].length,0)/
     Math.max(1,ss.filter(c=>c.pool[mode].length>0).length),
    observedGain:observed,lost,net:observed-lost,
    randomMean:dist.reduce((a,b)=>a+b,0)/dist.length,
    randomP95:dist[Math.floor(.95*dist.length)],
    randomAtLeastObserved:dist.filter(x=>x>=observed).length/dist.length});
  }
 }
 const total=summaries.find(x=>x.period==='TOTAL');
 if(!total||total.total!==3321)throw Error('Muestra distinta de 3321');
 if(total.countByStage.FORMABLE_NO_RECONOCIDA!==542)
  throw Error('542 no replicadas: '+total.countByStage.FORMABLE_NO_RECONOCIDA);
 if(total.byMode.BASE.top10!==59||total.byMode.BASE.top3!==17)
  throw Error('Base del motor no replica 59/17');
 if(cuts.length!==620)throw Error('No son 620 cortes: '+cuts.length);
 const out='auditorias/lalo-embudo-rastro6-25oct/resultados';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/resumen.json',JSON.stringify({summaries,changes,random,
  days:new Set(cuts.map(c=>c.date)).size,cuts:cuts.length,heads:cases.length},null,2));
 fs.writeFileSync(out+'/cabezas.json',JSON.stringify(cases,null,2));
 fs.writeFileSync(out+'/cortes.json',JSON.stringify(cuts,null,2));
 console.log('RASTRO_RESUMEN',JSON.stringify(summaries));
 console.log('RASTRO_AZAR',JSON.stringify(random));
 console.log('RASTRO_CAMBIOS',JSON.stringify(changes.map(z=>({
  mode:z.mode,gained:z.gained,lost:z.lost,net:z.net,
  sampleGained:z.exampleGained.slice(0,6).map(({date,turn,jur,head,traceClass})=>({date,turn,jur,head,traceClass})),
  sampleLost:z.exampleLost.slice(0,6).map(({date,turn,jur,head})=>({date,turn,jur,head}))
 }))));
}
main().catch(e=>{console.error('RASTRO_ERROR',e);process.exitCode=1});
