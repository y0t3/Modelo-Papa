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

/** Control NEGATIVO de elegibilidad: medir cuántas familias no ganadoras
 * compartirían los mismos rastros PRE de seis jornadas en el sábado.
 * Se calculan miles de candidatas, no solo las cinco ganadoras POST.
 */
async function main(){
 const date='2026-10-24',today=await get(date);
 const previous=await loadPreviousDraws(date,6,get);
 const latest=previous[5];
 const rootDays=await Promise.all(previous.slice().reverse().map(d=>completed(d.date)));
 const roots:Root[]=rootDays.flatMap((x,i)=>x.roots.map(r=>({...r,daysBack:i+1})));
 const [base,d1,d7h,d7base]=await Promise.all([
  nocturnaAnteriorPorJur(date,get,20),
  nocturnaAnteriorPorJur(latest.date,get,20),
  get(shiftDay(date,-7)),
  nocturnaAnteriorPorJur(shiftDay(date,-7),get,20)
 ]);
 if(base.missing.length||d1.missing.length||d7base.missing.length)
  throw Error('Faltan bases por jurisdicción');
 const hist:LaloHistorical[]=[
  {date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,d1.heads)},
  ...(hasDrawResults(d7h)?[{
    date:shiftDay(date,-7),period:'D−7' as const,
    sheet:buildSheet(d7h,d7base.heads)
  }]:[])
 ];
 const cutsOut:any[]=[];
 for(const [i,turn] of TURNOS.entries()){
  const pre=diaVacio();
  for(const t of TURNOS.slice(0,i))pre[t]={...today[t]};
  const sheet=buildSheet(pre,base.heads);
  if(sheet.heads[turn].length||sheet.matches[turn].length)throw Error('FUGA '+turn);
  const physical=routes(sheet.columns.slice(0,i+1));
  const view=buildMotorLalo(sheet,date,turn,hist);
  const recognized=new Set(view.ranks.vt3.map(f=>f.family));
  const missing=[...physical].filter(([family])=>!recognized.has(family));
  const witnessed=missing.map(([family,paths])=>({
   family,
   metrics:features(paths,roots,latest.date,shiftDay(date,-7))
  }));
  const winners=[...new Set(JURS.map(j=>today[turn]?.[j])
   .filter(x=>valid(x||'')).map(x=>reversibleFamily(x!.slice(-3))))];
  const winMissing=winners.filter(f=>missing.some(([g])=>f===g));
  const predicates={
   same6:(f:Features)=>f.same6>0,
   neighbor3:(f:Features)=>f.neighbor3>0,
   neighbor6:(f:Features)=>f.neighbor6>0,
   sameOrNeighbor6:(f:Features)=>f.same6>0||f.neighbor6>0,
   anyShape6:(f:Features)=>f.anyRoots6>0,
   overlap6:(f:Features)=>f.overlap6>0
  };
  const denominator:any={};
  for(const [name,fn] of Object.entries(predicates)){
   const eligible=witnessed.filter(x=>fn(x.metrics));
   denominator[name]={
    eligibleFamilies:eligible.length,
    winningFamilies:eligible.filter(x=>winMissing.includes(x.family)).length,
    winningLabels:eligible.filter(x=>winMissing.includes(x.family)).map(x=>x.family),
    nonWinningFamilies:eligible.filter(x=>!winMissing.includes(x.family)).length
   };
  }
  cutsOut.push({date,turn,physicalFamilies:physical.size,
   recognizedFamilies:view.ranks.vt3.length,
   unrecognizedPhysicallyFormableFamilies:missing.length,
   postWinningUnrecognizedFamilies:winMissing,denominator,
   // Sólo guardar perfiles de las ganadoras y no los miles de perdedoras.
   winningProfiles:witnessed.filter(x=>winMissing.includes(x.family))
  });
 }
 const output={date,
  explanatoryNote:'Todas las condiciones PRE se calculan antes del turno objetivo; POST etiqueta únicamente los ganadores para mostrar cuántas alternativas comparables no acertaron. No se ajustan reglas basadas en los resultados.',
  cuts:cutsOut};
 const out='auditorias/lalo-retro-sabado24-vt234';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/universo-testigos6-24oct.json',
  JSON.stringify(output,null,2)+'\n');
 console.log('UNIVERSO_TESTIGOS',JSON.stringify(cutsOut.map(c=>({
  turn:c.turn,physicalFamilies:c.physicalFamilies,
  recognized:c.recognizedFamilies,unrecognized:c.unrecognizedPhysicallyFormableFamilies,
  winningMissing:c.postWinningUnrecognizedFamilies,denominator:c.denominator
 }))));
}
main().catch(e=>{console.error('UNIVERSO_ERROR',e);process.exitCode=1});
