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

type Mode='BASE'|'PASO_RECIENTE'|'VECTOR_CONTINUO';
const MODES:Mode[]=['BASE','PASO_RECIENTE','VECTOR_CONTINUO'];
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
 pasoReciente:number;vectorContinuo:number;
 witnesses:Partial<Record<'same'|'neighbor'|'overlap',any>>;
};
function features(paths:Route[],roots:Root[],d1:string,d7:string):Features{
 const f:Features={same6:0,neighbor3:0,neighbor6:0,overlap6:0,
  exactD1D7:0,anyRoots6:0,sourceCount:new Set(paths.map(p=>p.source)).size,
  paths:paths.length,sameDays:0,recent2:0,lastDay:7,ratio:0,
  activePattern:'000000',pulse101:0,streak11:0,rightWalk:0,
  pasoReciente:0,vectorContinuo:0,witnesses:{}};
 const activeDays=new Set<number>();
 const rightTransitions=new Set<string>();
 const pasos=new Set<string>();
 const vectors=new Set<string>();
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
   // Continuidad exacta del movimiento vertical: los dos pasos
   // s-2 → s-1 → s deben tener el MISMO delta de fila (-1/0/+1).
   // Los eventos de activación son de jornadas consecutivas PRE.
   const d1=a.anchor-b.anchor,d2=path.anchor-a.anchor;
   if(a.daysBack<=2&&b.daysBack===a.daysBack+1&&
    Math.abs(d1)<=1&&d1===d2)
    vectors.add(b.event+'>'+a.event+'>'+path.source+'@'+path.anchor);

  }
 }
 f.rightWalk=rightTransitions.size;
 // Paso sencillo de fuente inmediatamente anterior, sólo si hubo
 // activación ganadora durante 2 últimas jornadas, ±1 fila.
 // Un candidato con varios caminos de la misma silueta no multiplica
 // eventos históricos al contarlos.
 for(const path of paths){
  const idx=order.indexOf(path.source);
  if(idx===0)continue;
  for(const r of roots){
   if(r.daysBack>2||r.source!==order[idx-1]||
    r.shape!==path.shape||Math.abs(r.anchor-path.anchor)>1)continue;
   pasos.add(r.event);
  }
 }
 f.pasoReciente=pasos.size;
 f.vectorContinuo=vectors.size;
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

/**
 * REGLAS OBSERVACIONALES CONGELADAS ANTES DEL COTEJO POST.
 *
 * Población: todos los VT3 físicamente posibles pero NO reconocidos
 * por MV1 en el momento del corte. No reordena ni añade a ningún TOP.
 *
 * DOS_DIAS: mismas siluetas activadas por cabezas publicadas en >=2
 * jornadas previas, una misma o vecina fuente y ancla ±2 filas.
 * DOS_MISMA: >=2 jornadas con misma fuente y ancla ±1 fila.
 * CADENA: misma silueta con dos fechas anteriores ordenadas,
 * s-2 -> s-1 -> s, sin diagonales inter-columna, ±2 filas por salto.
 *
 * Se guardan conteos por corte para distinguir ganadoras de
 * centenares de testigos similares no ganadores. Todo PRE antes de POST.
 */
type Flag='DOS_DIAS'|'DOS_MISMA'|'CADENA';
const FLAGS:Flag[]=['DOS_DIAS','DOS_MISMA','CADENA'];
type Track={family:string;dosDias:boolean;dosMisma:boolean;cadena:boolean;
 marks:number;dates:number;datesSame:number;
 witnessEvents:{date:string;daysBack:number;event:string;source:SourceId;value:string;
  currentSource:SourceId;rowShift:number}[]};
type DiagnosticCut={date:string;turn:string;period:string;
 familyCount:number;recognisedCount:number;missingCount:number;
 winningMissing:string[];missingTop10FromWinner:string[];
 winnersCount:number;
 eligible:Record<Flag,number>;hit:Record<Flag,number>;
 allWitnessCases:Track[];
};
function track(family:string,paths:Route[],roots:Root[]):Track{
 const used=new Map<string,{
  date:string;daysBack:number;event:string;source:SourceId;value:string;
  currentSource:SourceId;rowShift:number}>();
 const dates=new Set<string>(),datesSame=new Set<string>();
 let chain=false;
 for(const p of paths){
  const si=order.indexOf(p.source);
  const matched=roots.filter(r=>r.shape===p.shape&&
   Math.abs(r.anchor-p.anchor)<=2&&
   Math.abs(si-order.indexOf(r.source))<=1);
  for(const r of matched){
   const key=[r.event,r.source,p.source].join('|');
   if(!used.has(key))used.set(key,{
    date:r.date,daysBack:r.daysBack,event:r.event,source:r.source,
    value:r.value,currentSource:p.source,rowShift:p.anchor-r.anchor
   });
   dates.add(r.date);
   if(r.source===p.source&&Math.abs(r.anchor-p.anchor)<=1)
    datesSame.add(r.date);
  }
  // Eje cronológico antiguo→reciente→actual. Fuente siempre s−2,s−1,s.
  if(si>=2){
   const newer=roots.filter(r=>r.shape===p.shape&&
    order.indexOf(r.source)===si-1&&
    Math.abs(r.anchor-p.anchor)<=2&&r.daysBack<=3);
   const older=roots.filter(r=>r.shape===p.shape&&
    order.indexOf(r.source)===si-2&&r.daysBack<=6);
   for(const a of newer)for(const b of older){
    if(a.date===b.date||b.daysBack<=a.daysBack||b.daysBack-a.daysBack>2||
      Math.abs(b.anchor-a.anchor)>2||Math.abs(a.anchor-p.anchor)>2)continue;
    chain=true;
   }
  }
 }
 return {family,dosDias:dates.size>=2,dosMisma:datesSame.size>=2,
  cadena:chain,marks:used.size,dates:dates.size,datesSame:datesSame.size,
  witnessEvents:[...used.values()].sort((a,b)=>b.date.localeCompare(a.date))};
}
const keyOf=(r:Track,f:Flag)=>f==='DOS_DIAS'?r.dosDias:
 f==='DOS_MISMA'?r.dosMisma:r.cadena;
const cuts:DiagnosticCut[]=[];
const combinedHeads:{date:string;turn:string;jur:string;head:string;
 family:string;knownInTop10:boolean;physicallyFormable:boolean;
 track:Track|null}[]=[];
async function main(){
 let totalHeads=0,baseline3=0,baseline5=0,baseline10=0;
 for(let date='2026-06-01';date<='2026-10-24';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const [today,previous,base]=await Promise.all([
   get(date),loadPreviousDraws(date,6,get),nocturnaAnteriorPorJur(date,get,20)
  ]);
  if(count(today)<20)continue;
  if(base.missing.length)throw Error('Sin Nocturna previa '+date);
  const six=previous.slice().reverse();
  const allRoots:Root[]=(await Promise.all(six.map(d=>completed(d.date))))
    .flatMap((x,i)=>x.roots.map(r=>({...r,daysBack:i+1})));
  const latest=previous[5],weekly=shiftDay(date,-7);
  const [baseD1,week,baseD7]=await Promise.all([
   nocturnaAnteriorPorJur(latest.date,get,20),get(weekly),
   nocturnaAnteriorPorJur(weekly,get,20)
  ]);
  if(baseD1.missing.length||baseD7.missing.length)throw Error('Histórico incompleto '+date);
  const history:LaloHistorical[]=[
   {date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,baseD1.heads)},
   ...(weekly<date&&hasDrawResults(week)?[{
    date:weekly,period:'D−7' as const,sheet:buildSheet(week,baseD7.heads)
   }]:[])
  ];
  if(six.some(d=>d.date>=date)||history.some(h=>h.date>=date))
   throw Error('FUGA de histórico '+date);
  for(const [index,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const earlier of TURNOS.slice(0,index))pre[earlier]={...today[earlier]};
   const sheet=buildSheet(pre,base.heads);
   if(sheet.heads[turn].length||sheet.matches[turn].length)
    throw Error('FUGA PRE '+date+' '+turn);
   const physical=routes(sheet.columns.slice(0,index+1));
   const view=buildMotorLalo(sheet,date,turn,history);
   const recognized=new Set(view.ranks.vt3.map(x=>x.family));
   const top=view.ranks.vt3.slice(0,10).map(x=>x.family);
   const missing=[...physical].filter(([family])=>!recognized.has(family));
   const tracks=missing.map(([family,paths])=>track(family,paths,allRoots));
   const trackMap=new Map(tracks.map(r=>[r.family,r]));
   const eligible=Object.fromEntries(FLAGS.map(f=>[f,tracks.filter(x=>keyOf(x,f)).length]))
    as Record<Flag,number>;

   // Etiquetas POST: solamente después de fijar físicamente el conjunto PRE.
   const actual=JURS.map(jur=>({jur,head:today[turn]?.[jur]||''}))
    .filter(x=>valid(x.head));
   const winners=actual.map(x=>reversibleFamily(x.head.slice(-3)));
   const winningMissing=[...new Set(winners.filter(f=>trackMap.has(f)))];
   const hit=Object.fromEntries(FLAGS.map(f=>[
    f,tracks.filter(x=>keyOf(x,f)&&winningMissing.includes(x.family)).length
   ])) as Record<Flag,number>;
   const missingTop10FromWinner=winners.filter(f=>!top.includes(f));
   cuts.push({date,turn,period:date<='2026-07-31'?'JUN_JUL':
    date<='2026-09-30'?'AGO_SEP':'OCT',
    familyCount:physical.size,recognisedCount:view.ranks.vt3.length,
    missingCount:tracks.length,winnersCount:winningMissing.length,
    winningMissing,missingTop10FromWinner,eligible,hit,
    // Per-family tracks are PRE and POST labels are separate fields.
    allWitnessCases:tracks});
   for(const x of actual){
    const family=reversibleFamily(x.head.slice(-3));
    const originalIndex=top.indexOf(family);
    totalHeads++;
    if(originalIndex>=0){
     baseline10++;
     if(originalIndex<5)baseline5++;
     if(originalIndex<3)baseline3++;
    }
    combinedHeads.push({date,turn,jur:x.jur,head:x.head,family,
     knownInTop10:originalIndex>=0,
     physicallyFormable:physical.has(family),track:trackMap.get(family)||null});
   }
  }
  console.log('OBS_RASTROS_DIA',date);
 }
 if(cuts.length!==620||totalHeads!==3321||baseline3!==17||
  baseline5!==35||baseline10!==59)
  throw Error('Falla control contra MV1 histórico '+JSON.stringify({
   cuts:cuts.length,totalHeads,baseline3,baseline5,baseline10}));
 const summary:any[]=[];
 let seed=20261025;
 const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296};
 for(const period of ['JUN_JUL','AGO_SEP','OCT','TOTAL']){
  const ss=cuts.filter(x=>period==='TOTAL'||x.period===period);
  for(const flag of FLAGS){
   const eligible=ss.reduce((n,c)=>n+c.eligible[flag],0);
   const won=ss.reduce((n,c)=>n+c.hit[flag],0);
   const totalMissing=ss.reduce((n,c)=>n+c.missingCount,0);
   const totalWinners=ss.reduce((n,c)=>n+c.winnersCount,0);
   const expected=ss.reduce((n,c)=>n+(c.missingCount?
    c.eligible[flag]*c.winnersCount/c.missingCount:0),0);
   // Control aleatorio intra-corte: igual cuota de familias elegibles
   // y mismo número de ganadoras, sin mezclar días ni columnas.
   const nontrivial=ss.filter(c=>c.missingCount>0&&c.winnersCount>0&&
    c.eligible[flag]>0&&c.eligible[flag]<c.missingCount);
   let more=0,simSum=0;const simulations=5000;
   for(let iter=0;iter<simulations;iter++){
    let total=0;
    for(const c of ss){
     let remaining=c.missingCount,success=c.eligible[flag];
     for(let j=0;j<c.winnersCount;j++){
      if(rand()*remaining<success){total++;success--;}
      remaining--;
     }
    }
    simSum+=total;
    if(total>=won)more++;
   }
   const matchingCuts=ss.filter(c=>c.winnersCount>0&&
    c.eligible[flag]>0&&c.eligible[flag]<c.missingCount);
   const delta=matchingCuts.reduce((n,c)=>n+
    c.hit[flag]/c.eligible[flag]-
    (c.winnersCount-c.hit[flag])/(c.missingCount-c.eligible[flag]),0)/
    Math.max(1,matchingCuts.length);
   summary.push({period,flag,cuts:ss.length,
    candidateExposures:totalMissing,candidatesWithFlag:eligible,
    notWinningExposures:eligible-won,physicalWinnerFamilies:totalWinners,
    winningFamiliesWithFlag:won,expectedWinningFamiliesRandom:expected,
    randomAverage:simSum/simulations,pRandomAtLeastObserved:more/simulations,
    gainOverRandom:won-expected,
    matchedCutCount:matchingCuts.length,meanWithinCutWinnerRateDelta:delta,
    // Estas son familias por corte, no aciertos en el TOP.
    testedPreRankChange:false
   });
  }
 }
 const saturday=cuts.filter(c=>c.date==='2026-10-24').map(c=>({
  turn:c.turn,winners:c.winningMissing,
  missingCandidates:c.missingCount,
  signals:Object.fromEntries(FLAGS.map(f=>[
   f,{eligible:c.eligible[f],winning:c.hit[f]}
  ])),
  winnerTracks:c.allWitnessCases.filter(t=>c.winningMissing.includes(t.family))
 }));
 const out='auditorias/lalo-vt3-rastros-discriminacion-25oct/resultados';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/comparacion.json',JSON.stringify({
  summary,saturday,metadata:{cuts:cuts.length,heads:totalHeads,
   originalTop3:baseline3,originalTop5:baseline5,originalTop10:baseline10,
   targetResultsNeverUsedInPRE:true,
   noRankChanges:true}
 },null,2));
 fs.writeFileSync(out+'/cortes.json',JSON.stringify(cuts,null,2));
 fs.writeFileSync(out+'/cabezas.json',JSON.stringify(combinedHeads,null,2));
 console.log('SEGUIMIENTO_DISCRIMINACION',JSON.stringify(summary));
 console.log('SEGUIMIENTO_SABADO',JSON.stringify(saturday.map(x=>({
  turn:x.turn,winners:x.winners,missingCandidates:x.missingCandidates,
  signals:x.signals,
  winners:x.winnerTracks.map(r=>({family:r.family,dates:r.dates,
   marks:r.marks,dosDias:r.dosDias,dosMisma:r.dosMisma,cadena:r.cadena}))
 }))));
 console.log('SEGUIMIENTO_INVARIANTES',JSON.stringify({
  cuts:cuts.length,heads:totalHeads,
  top3:baseline3,top5:baseline5,top10:baseline10,noRankChanges:true
 }));
}
main().catch(e=>{console.error('SEGUIMIENTO_ERROR',e);process.exitCode=1});
