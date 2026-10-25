/** LAB VT3 — cadenas geométricas de dos activaciones reales y aterrizaje PRE.
  * Comparación exploratoria, no modificar MV1. Solo la hoja +11; raíces 
  * históricas de cabezas efectivamente sorteadas, nunca de figura abstracta.
  * Consecutividad equivale a jornadas con resultados, no días calendario.
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

// Tipos de selección declarados en el bloque de cadenas PRE.
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

type ShapeRoot={event:string;source:SourceId;anchor:number;daysBack:number;
 shape:string;date:string;value:string};
type Witness={priorDate:string;recentDate:string;oldSource:SourceId;
 recentSource:SourceId;targetSource:SourceId;oldAnchor:number;
 recentAnchor:number;targetAnchor:number;events:string[];shape:string};
type Signature={CHAINS:number;VERTICAL:number;RIGHT:number;
 chainWitness?:Witness;verticalWitness?:Witness;rightWitness?:Witness;
 freshDaysBack:number;recentEvents:number};
type Mode='CHAINS'|'VERTICAL'|'RIGHT';
const MODES:Mode[]=['CHAINS','VERTICAL','RIGHT'];
type Cut={
 date:string;turn:string;block:string;heads:string[];base:string[];
 pool:Record<Mode,string[]>;pick:Record<Mode,string[]>;
 signature:Record<string,Signature>;physicalCount:number;unrecognized:number
};
const allCuts:Cut[]=[];
function chainsFor(paths:Route[],rootsByShape:Map<string,ShapeRoot[]>):Signature{
 const s:Signature={CHAINS:0,VERTICAL:0,RIGHT:0,
  freshDaysBack:7,recentEvents:0};
 const pairs:{id:string;older:ShapeRoot;newer:ShapeRoot}[]=[];
 const shapes=new Set(paths.map(x=>x.shape));
 for(const shape of shapes){
  const roots=rootsByShape.get(shape)||[];
  for(const older of roots)for(const newer of roots){
   if(older.daysBack!==newer.daysBack+1)continue;
   if(Math.abs(newer.anchor-older.anchor)>1)continue;
   if(Math.abs(order.indexOf(newer.source)-order.indexOf(older.source))>1)continue;
   // A single published head is one event, regardless of how many
   // equivalent geometric paths it has.
   const id=[older.event,newer.event,older.source,newer.source,
    older.anchor,newer.anchor,shape].join('|');
   pairs.push({id,older,newer});
  }
 }
 const found:{CHAINS:Map<string,Witness>;VERTICAL:Map<string,Witness>;RIGHT:Map<string,Witness>}={
  CHAINS:new Map(),VERTICAL:new Map(),RIGHT:new Map()
 };
 const recent=new Set<string>();
 for(const p of paths){
  const si=order.indexOf(p.source);
  for(const pair of pairs){
   const {older,newer}=pair;
   if(p.shape!==older.shape)continue;
   const a=order.indexOf(older.source),b=order.indexOf(newer.source);
   if(Math.abs(si-b)>1||Math.abs(p.anchor-newer.anchor)>1)continue;
   const witness:Witness={
    priorDate:older.date,recentDate:newer.date,oldSource:older.source,
    recentSource:newer.source,targetSource:p.source,
    oldAnchor:older.anchor,recentAnchor:newer.anchor,targetAnchor:p.anchor,
    events:[older.event,newer.event],shape:p.shape
   };
   // Dos cabezas reales en dos jornadas son una sola pareja testigo;
   // no multiplicar votos por recorridos equivalentes o posiciones.
   const k=older.event+'>'+newer.event;
   found.CHAINS.set(k,witness);
   recent.add(newer.event);
   s.freshDaysBack=Math.min(s.freshDaysBack,newer.daysBack);
   const dr1=newer.anchor-older.anchor,dr2=p.anchor-newer.anchor;
   if(a===b&&b===si&&dr1===dr2){
    found.VERTICAL.set(k,witness);
   }
   if(b-a===1&&si-b===1){
    found.RIGHT.set(k,witness);
   }
  }
 }
 for(const m of MODES){
  s[m]=found[m].size;
 }
 s.chainWitness=found.CHAINS.values().next().value;
 s.verticalWitness=found.VERTICAL.values().next().value;
 s.rightWitness=found.RIGHT.values().next().value;
 s.recentEvents=recent.size;
 return s;
}
const empty=()=>({CHAINS:0,VERTICAL:0,RIGHT:0,freshDaysBack:7,
 recentEvents:0} as Signature);
async function main(){
 for(let date='2026-06-01';date<='2026-10-24';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const [today,previous,base]=await Promise.all([
   get(date),loadPreviousDraws(date,6,get),nocturnaAnteriorPorJur(date,get,20)
  ]);
  if(count(today)<20)continue;
  if(base.missing.length)throw Error('Actual Nocturna incompleta '+date);
  const six=previous.slice().reverse(),
   rootDays=await Promise.all(six.map(x=>completed(x.date)));
  const roots:ShapeRoot[]=rootDays.flatMap((x,i)=>x.roots.map(r=>({
   event:r.event,source:r.source,anchor:r.anchor,shape:r.shape,
   daysBack:i+1,date:r.date,value:r.value
  })));
  const rootsByShape=new Map<string,ShapeRoot[]>();
  for(const r of roots)rootsByShape.set(r.shape,[...(rootsByShape.get(r.shape)||[]),r]);
  const previousDay=previous.at(-1)!,weekly=shiftDay(date,-7);
  const [d1Base,weeklyHeads,d7Base]=await Promise.all([
   nocturnaAnteriorPorJur(previousDay.date,get,20),get(weekly),
   nocturnaAnteriorPorJur(weekly,get,20)
  ]);
  if(d1Base.missing.length||d7Base.missing.length)
   throw Error('Raíz histórica incompleta '+date);
  const history:LaloHistorical[]=[
   {date:previousDay.date,period:'D−1',sheet:buildSheet(previousDay.heads,d1Base.heads)},
   ...(hasDrawResults(weeklyHeads)?[{
    date:weekly,period:'D−7' as const,
    sheet:buildSheet(weeklyHeads,d7Base.heads)
   }]:[])
  ];
  if([...six.map(x=>x.date),...history.map(x=>x.date),
   ...base.checked,...d1Base.checked,...d7Base.checked].some(d=>d>=date))
   throw Error('Fuga temporal '+date);
  for(const [idx,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const t of TURNOS.slice(0,idx))pre[t]={...today[t]};
   const sheet=buildSheet(pre,base.heads);
   if(TURNOS.slice(idx).some(t=>sheet.heads[t].length||sheet.matches[t].length))
    throw Error('FUGA PRE '+date+' '+turn);
   const phys=routes(sheet.columns.slice(0,idx+1)),
    view=buildMotorLalo(sheet,date,turn,history),
    recognized=new Set(view.ranks.vt3.map(x=>x.family)),
    baseTop=view.ranks.vt3.slice(0,10).map(x=>x.family);
   const missing=[...phys].filter(([f])=>!recognized.has(f));
   const signature:Record<string,Signature>={};
   for(const [f,paths] of missing)signature[f]=chainsFor(paths,rootsByShape);
   const pool=Object.fromEntries(MODES.map(mode=>[
    mode,missing.filter(([f])=>signature[f][mode]>0).map(([f])=>f)
   ])) as Record<Mode,string[]>;
   const pick=(Object.fromEntries(MODES.map(mode=>[mode,[...baseTop]]))) as Record<Mode,string[]>;
   for(const mode of MODES){
    const candidates=[...pool[mode]].sort((a,b)=>{
     const sa=signature[a],sb=signature[b];
     return sb[mode]-sa[mode]||
      sa.freshDaysBack-sb.freshDaysBack||
      sb.recentEvents-sa.recentEvents||
      a.localeCompare(b);
    });
    const candidate=candidates[0];
    if(candidate){
     if(pick[mode].length===10)pick[mode][9]=candidate;
     else pick[mode].push(candidate);
    }
    if(pick[mode].length>10)throw Error('Top >10');
    if(pick[mode].slice(0,Math.min(9,baseTop.length)).join('|')!==
     baseTop.slice(0,Math.min(9,baseTop.length)).join('|'))
     throw Error('Los primeros 9 cambiaron');
   }
   const heads=JURS.filter(j=>j!=='Montevideo'||turn==='Nocturno')
    .map(j=>today[turn]?.[j]||'').filter(valid).map(h=>reversibleFamily(h.slice(-3)));
   allCuts.push({date,turn,block:date<='2026-07-31'?'JUN_JUL':
    date<='2026-09-30'?'AGO_SEP':'OCT',
    heads,base:baseTop,pool,pick,signature,
    physicalCount:phys.size,unrecognized:missing.length});
  }
  console.log('CADENAS_DIA',date);
 }
 if(allCuts.length!==620)throw Error('No son 620 cortes: '+allCuts.length);
 const p='2026-10-24',octCuts=allCuts.filter(c=>c.date===p);
 const wanted=[
  {turn:'Primera',head:'9379'},
  {turn:'Primera',head:'1573'},
  {turn:'Matutino',head:'9321'},
  {turn:'Vespertino',head:'5693'},
  {turn:'Nocturno',head:'5739'}
 ];
 const five=wanted.map(w=>{
  const family=reversibleFamily(w.head.slice(-3)),
    cut=octCuts.find(x=>x.turn===w.turn)!;
  return {...w,family,signature:cut.signature[family]||empty(),
   eligiblePoolSizes:Object.fromEntries(MODES.map(m=>[m,cut.pool[m].length])),
   matchedModes:MODES.filter(m=>cut.pool[m].includes(family)),
   selectedModes:MODES.filter(m=>cut.pick[m].includes(family))};
 });
 if(five.some(x=>!octCuts.find(c=>c.turn===x.turn)?.signature[x.family]))
  throw Error('Faltan cinco casos reales del sábado');
 const summaries:any[]=[];
 for(const period of ['JUN_JUL','AGO_SEP','OCT','TOTAL']){
  const ss=allCuts.filter(c=>period==='TOTAL'||c.block===period);
  const perMode=Object.fromEntries(MODES.map(mode=>{
   const observed={gained:0,lost:0,base3:0,base5:0,base10:0,modified10:0};
   const hitChance:{size:number;hits:number;selected:string|null}[]=[];
   for(const cut of ss){
    const chosen=cut.pick[mode].at(9)||null,removed=cut.base.at(9)||null;
    observed.gained+=cut.heads.filter(f=>chosen===f&&!cut.base.includes(f)).length;
    observed.lost+=cut.heads.filter(f=>removed===f&&!cut.pick[mode].includes(f)).length;
    observed.base3+=cut.heads.filter(f=>cut.base.slice(0,3).includes(f)).length;
    observed.base5+=cut.heads.filter(f=>cut.base.slice(0,5).includes(f)).length;
    observed.base10+=cut.heads.filter(f=>cut.base.includes(f)).length;
    observed.modified10+=cut.heads.filter(f=>cut.pick[mode].includes(f)).length;
    hitChance.push({size:cut.pool[mode].length,
     hits:cut.heads.filter(f=>cut.pool[mode].includes(f)).length,selected:chosen});
   }
   let seed=20261025+MODES.indexOf(mode)+4*['JUN_JUL','AGO_SEP','OCT','TOTAL'].indexOf(period);
   const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
    return (seed>>>0)/4294967296};
   const dist:number[]=[];
   for(let rep=0;rep<10000;rep++){
    let gains=0;
    for(const c of ss){
     const options=c.pool[mode];
     if(!options.length)continue;
     const family=options[Math.floor(rand()*options.length)];
     gains+=c.heads.filter(f=>f===family&&!c.base.includes(f)).length;
    }
    dist.push(gains);
   }
   dist.sort((a,b)=>a-b);
   const average=dist.reduce((a,b)=>a+b,0)/dist.length;
   return [mode,{...observed,net:observed.gained-observed.lost,
    withPool:hitChance.filter(x=>x.size>0).length,
    meanPoolSize:hitChance.filter(x=>x.size>0).reduce((n,x)=>n+x.size,0)/
     Math.max(1,hitChance.filter(x=>x.size>0).length),
    poolWinnerHeads:hitChance.reduce((n,x)=>n+x.hits,0),
    randomizedMeanGains:average,
    randomizedP95:dist[Math.floor(.95*dist.length)],
    randomizedAtLeastObserved:dist.filter(x=>x>=observed.gained).length/dist.length}];
  }));
  summaries.push({period,cuts:ss.length,methods:perMode});
 }
 const outputs={hypothesis:'Two real winner activations on CONSECUTIVE preceding draw days, same undirected 3-cell shape, anchor steps <=1, source steps <=1. CHAINS: all; VERTICAL: all sources same + constant signed anchor shift; RIGHT: source moves +1 each step. Only missing families physically formable, one replacement of #10.',
  sample:{days:new Set(allCuts.map(x=>x.date)).size,cuts:allCuts.length},
  saturdayFive:five,saturdayCuts:octCuts.map(c=>({
   turn:c.turn,unrecognized:c.unrecognized,physical:c.physicalCount,
   byMode:Object.fromEntries(MODES.map(m=>[m,{
    poolSize:c.pool[m].length,
    chosen:c.pick[m].at(9)||null,
    headHits:c.heads.filter(f=>c.pool[m].includes(f)).length
   }]))
  })),summaries};
 const dir='auditorias/lalo-cadenas-activadas-25oct/resultados';
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/resumen.json',JSON.stringify(outputs,null,2));
 fs.writeFileSync(dir+'/cortes.json',JSON.stringify(allCuts,null,2));
 console.log('CADENAS_RESULTADOS',JSON.stringify(outputs));
}
main().catch(e=>{console.error('CADENAS_ERROR',e);process.exitCode=1});
