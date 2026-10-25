/**
 * SELLADO PROSPECTIVO REAL: LUNES 26/10/2026, PREVIA (Argentina).
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

/**
 * PREVIA del lunes 26/10, antes de que exista la jornada.
 * Jamás descarga las cabezas del 26/10; ni siquiera para comprobar
 * que están vacías. El GitHub run y el commit fijan el sello de tiempo.
 */
async function main(){
 const date='2026-10-26',turn='Previa';
 const timestamp=new Date().toISOString();
 const cutoff='2026-10-26T03:00:00.000Z'; // medianoche Argentina, 26/10
 if(timestamp>=cutoff)throw Error('SELLADO TARDÍO: el PRE debe ejecutarse ANTES del día objetivo');
 if(new Date(date+'T12:00:00').getDay()!==1)throw Error('La fecha no es lunes');
 if(TURNOS[0]!==turn)throw Error('Previa no está primera');
 const previous=await loadPreviousDraws(date,6,get);
 const latest=previous.at(-1);
 if(!latest)throw Error('No hay seis jornadas previas');
 if(latest.date!=='2026-10-24')throw Error('Última jornada inesperada: '+latest.date);
 const weekly=shiftDay(date,-7);
 const [base,baseD1,week,baseD7]=await Promise.all([
  nocturnaAnteriorPorJur(date,get,20),
  nocturnaAnteriorPorJur(latest.date,get,20),
  get(weekly),
  nocturnaAnteriorPorJur(weekly,get,20)
 ]);
 if(base.missing.length||baseD1.missing.length||baseD7.missing.length)
  throw Error('Faltan Nocturnas auténticas por jurisdicción');
 if(!hasDrawResults(week))throw Error('No se publicaron cabezas D−7');
 if(previous.some(x=>x.date>=date)||weekly>=date)
  throw Error('Fuga temporal desde raíces');
 const hist:LaloHistorical[]=[
  {date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,baseD1.heads)},
  {date:weekly,period:'D−7',sheet:buildSheet(week,baseD7.heads)}
 ];
 const roots=(await Promise.all(previous.slice().reverse()
  .map(d=>completed(d.date))))
  .flatMap((x,i)=>x.roots.map(r=>({...r,daysBack:i+1})));
 // La hoja PRE no incorpora ninguna cifra sorteada del lunes.
 const pre=diaVacio();
 const sheet=buildSheet(pre,base.heads);
 if(sheet.heads[turn].length!==0||
    Object.values(sheet.heads).some(v=>v.length>0)||
    Object.values(sheet.matches).some(v=>v.length>0))
  throw Error('La hoja PRE contiene resultados objetivo');
 const physical=routes(sheet.columns.slice(0,1));
 const engine=buildMotorLalo(sheet,date,turn,hist);
 const topAll=engine.ranks.vt3.slice(0,10).map(x=>x.family);
 const fMap:Record<string,Features>={};
 for(const family of topAll){
  const route=physical.get(family);
  if(!route?.length)throw Error('Familia sin testigo físico: '+family);
  fMap[family]=features(route,roots,latest.date,weekly);
 }
 const topPulse=[...topAll].sort((a,b)=>
  fMap[b].pulse101-fMap[a].pulse101 ||
  topAll.indexOf(a)-topAll.indexOf(b));
 if(topPulse.length!==topAll.length||
  topPulse.slice().sort().join('|')!==topAll.slice().sort().join('|'))
  throw Error('Top10 alterado');
 if(topAll.length<3)throw Error('Menos de tres candidatas VT3: no se sellará Top3 incompleto');
 const historicDates=[...new Set(previous.map(x=>x.date)
  .concat([latest.date,weekly, ...base.checked, ...baseD1.checked, ...baseD7.checked]))];
 if(historicDates.some(d=>d>=date))throw Error('Raíz igual o posterior al 26/10');
 if([...cache.keys()].some(d=>d>=date))
  throw Error('Se consultaron cabezas del 26/10 o posteriores');
 const headsSnapshot=Object.fromEntries(
  await Promise.all([...cache.keys()].sort().map(async d=>[d,await get(d)])));
 const inputs={
  target:{date,turn},
  sources:{api:'vivitusuerte.com/api/juegos/cabezasDiarias',
   historicalDates:[...cache.keys()].sort()},
  previousSix:previous.map(x=>({date:x.date,heads:x.heads})),
  latest:{date:latest.date,heads:latest.heads},
  weekly:{date:weekly,heads:week},
  priorNocturna:base,
  priorNocturnaD1:baseD1,
  priorNocturnaD7:baseD7,
  headsSnapshot
 };
 const inputDigest=createHash('sha256').update(JSON.stringify(inputs)).digest('hex');
 const payload={
  sealedAtUtc:timestamp,
  stampType:'PROSPECTIVE_PRE_BEFORE_TARGET_DATE',
  expiryGuardUtc:cutoff,
  date,turn,
  rule:'PULSO_TOP10: binary 1-0-1 in six completed draw days, same source, same undirected shape, anchor delta <=2; tie original rank',
  base:topAll.map((family,i)=>({
   rank:i+1,family,physicalRoutes:fMap[family].paths,
   signal:fMap[family].pulse101,
   activationDaysRecentToOld:fMap[family].activePattern,
   sourceCount:fMap[family].sourceCount,
   same6:fMap[family].same6
  })),
  pulse:topPulse.map((family,i)=>({
   rank:i+1,family,originalRank:topAll.indexOf(family)+1,
   signal:fMap[family].pulse101,
   activationDaysRecentToOld:fMap[family].activePattern
  })),
  top3Lalo:topAll.slice(0,3),
  top3Pulso:topPulse.slice(0,3),
  top5Lalo:topAll.slice(0,5),
  top5Pulso:topPulse.slice(0,5),
  top10Lalo:topAll,
  top10Pulso:topPulse,
  inputDigestSha256:inputDigest,
  inputDates:[...cache.keys()].sort(),
  latestNocturnaRows:Object.fromEntries(
   JURS.map(j=>[j,{head:base.heads.Nocturno[j],
    sourceDate:base.dates[j]}])),
  historicalSixDays:previous.map(x=>x.date),
  historicsD1D7:hist.map(x=>({date:x.date,period:x.period})),
  currentDrawHeadsIncluded:0,
  targetHeadCount:0
 };
 const signed={...payload,
  payloadSha256:createHash('sha256').update(JSON.stringify(payload)).digest('hex')};
 const out='auditorias/lalo-pulso-vt3-sellado-26oct/resultados';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/sellado-previa-2026-10-26.json',JSON.stringify(signed,null,2)+'\n');
 fs.writeFileSync(out+'/entradas-historicas.json',JSON.stringify(inputs,null,2)+'\n');
 console.log('SELLO_PREVIA_26OCT',JSON.stringify(signed));
 console.log('SELLO_DIAGNOSTICO',JSON.stringify({
  sealedAtUtc:timestamp,top10Count:topAll.length,
  pulsoPriorityCount:topAll.filter(f=>fMap[f].pulse101>0).length,
  orderChanged:topAll.join('|')!==topPulse.join('|'),
  noFutureDateRequested:true,
  inputDigestSha256:inputDigest,payloadSha256:signed.payloadSha256}));
}
main().catch(e=>{console.error('ERROR_SELLADO',e);process.exitCode=1});
