/**
 * Revisión Oct 26–28 inclusive: hoja +11 oficial, AUX AYER/HOY,
 * Geometría, Nueva Prueba, Conectadas y reglas geométricas de laboratorio.
 * PRE reconstruido a cada turno, POST solo mide, NUNCA pretende sello auténtico.
 * Contrasta en un bloque separado el único PRE GitHub firmado antes del 26/10.
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay,previousDrawDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import type {DailySheet,SourceId} from '../src/sheet';
import {cellsFromPlus11} from '../src/paths';
import type {Path} from '../src/paths';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {buildVt3Shadow} from '../src/vt3Shadow';
import {buildVt3Trial} from '../src/vt3Trial';
import {buildConnectedVt3} from '../src/connectedVt3';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import {buildMotorLaloAuxiliar} from '../src/motorLaloAuxiliar';
import type {AuxiliarHistory} from '../src/motorLaloAuxiliar';

const valid=(x:string)=>/^\d{4}$/.test(x);
const drawsCache=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{
 if(!drawsCache.has(d))drawsCache.set(d,descargarCabezas(d,true));
 return drawsCache.get(d)!;
};
const rawCache=new Map<string,Promise<AuxiliaryHeads>>();
const auxRaw=async(d:string)=>{
 if(!rawCache.has(d))rawCache.set(d,fetchAuxiliaryHeads(d).then(x=>x.heads));
 return rawCache.get(d)!;
};
const count=(h:CabezasDia)=>TURNOS.reduce((n,t)=>n+
 JURS.filter(j=>valid(h[t]?.[j]||'')).length,0);
const completedSheets=new Map<string,Promise<{
 date:string;heads:CabezasDia;sheet:DailySheet}>>();
const complete=async(date:string)=>{
 if(!completedSheets.has(date))completedSheets.set(date,(async()=>{
  const [heads,base]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(base.missing.length)throw Error('Sin base Nocturna por jurisdiccion '+date);
  return {date,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return completedSheets.get(date)!;
};
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


type Name='LALO'|'GEOMETRIA'|'NUEVA_PRUEBA'|'CONECTADAS'|
 'PULSO_TOP10'|'MISMA_6'|'PASO_RECIENTE'|'VECTOR_CONTINUO'|'AUX_AYER'|'AUX_HOY';
type Kind='vt2'|'vt3'|'vt4';
type Pick={family:string;values:string[];originalRank?:number};
type Ranking={vt2:Pick[];vt3:Pick[];vt4:Pick[]};
const names:Name[]=['LALO','GEOMETRIA','NUEVA_PRUEBA','CONECTADAS',
 'PULSO_TOP10','MISMA_6','PASO_RECIENTE','VECTOR_CONTINUO','AUX_AYER','AUX_HOY'];
const kinds:Kind[]=['vt2','vt3','vt4'];
type Win={jur:string;head:string;vt2:string;vt3:string;vt4:string};
type Case={
 date:string;turn:Turno;sourceDates:{base:Record<string,string>;
 d1:string;d7:string;auxAyer:string};
 old6:string[];rawAuxAvailable:{ayer:number;hoy:number;hoyVisible:number};
 heads:Win[];ranks:Record<Name,Ranking>;
 eligibleOriginal:Record<Kind,number>;
 physicalVt3:number;formableWinners:Record<Kind,number>;
 originalMissedWinners:string[];
 signals:{
 same2DaysAll:number;pulsoOriginalTop10:number;
 misma6Eligible:number;pasoEligible:number;vectorEligible:number;
 };
};
const cases:Case[]=[];
const noRankChanges=(v:any,b:any)=>JSON.stringify(v.ranks)===b;
const order:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const blank=():Ranking=>({vt2:[],vt3:[],vt4:[]});
const makePick=(f:{family:string;values?:string[];rank?:number;paths?:{value:string}[]}):Pick=>({
 family:f.family,
 values:[...new Set((f.values||f.paths?.map(p=>p.value)||f.family.split('/')))],
 originalRank:f.rank
});
const winnerFamily=(head:string,kind:Kind)=>reversibleFamily(head.slice(-Number(kind[2])));
function matches(kind:Kind,x:Pick,head:string):boolean{
 return kind==='vt4'?x.values.includes(head):x.family===winnerFamily(head,kind);
}
const countHits=(c:Case,who:Name,kind:Kind,n:number)=>{
 const list=c.ranks[who][kind].slice(0,n);
 return c.heads.filter(h=>list.some(p=>matches(kind,p,h.head))).length;
};
async function main(){
 for(const date of ['2026-10-26','2026-10-27','2026-10-28']){
  const [actual,previous,base,liveAux,yesterdayAux]=await Promise.all([
   get(date),loadPreviousDraws(date,6,get),nocturnaAnteriorPorJur(date,get,20),
   auxRaw(date),auxRaw(previousDrawDay(date))
  ]);
  if(base.missing.length)throw Error('Base actual incompleta '+date);
  const validHeadCount=count(actual);
  if(validHeadCount<25)throw Error('La jornada no es completa '+date+' / '+validHeadCount);
  const previous6=await Promise.all(previous.map(x=>complete(x.date)));
  const latest=previous.at(-1)!;
  const wkDate=shiftDay(date,-7);
  const [baseWeek,weekHeads,auxD1old,auxD7old,auxD1same,auxD7same]=await Promise.all([
   nocturnaAnteriorPorJur(wkDate,get,20),get(wkDate),
   auxRaw(previousDrawDay(latest.date)),
   auxRaw(previousDrawDay(wkDate)),
   auxRaw(latest.date),
   auxRaw(wkDate)
  ]);
  if(baseWeek.missing.length)throw Error('Base semanal incompleta '+date);
  const week=buildSheet(weekHeads,baseWeek.heads);
  const refs:LaloHistorical[]=[
   {date:latest.date,period:'D−1',sheet:previous6.at(-1)!.sheet},
   ...(hasDrawResults(weekHeads)?[{date:wkDate,period:'D−7' as const,sheet:week}]:[])
  ];
  const connectedDays=[
   ...previous6.map(d=>({date:d.date,sheet:d.sheet})),
   ...(previous6.some(d=>d.date===wkDate)||!hasDrawResults(weekHeads)?
    []:[{date:wkDate,sheet:week}])
  ];
  if([...refs,...connectedDays].some(d=>d.date>=date))throw Error('Fuga D−1/D−7');
  const pastAuxAyer:AuxiliarHistory[]=[
   {date:latest.date,period:'D−1',
    sourceDate:previousDrawDay(latest.date),
    aux:extractAuxHistoryMode(latest.date,auxD1old,latest.heads,'anterior')},
   ...(hasDrawResults(weekHeads)?[{
    date:wkDate,period:'D−7' as const,
    sourceDate:previousDrawDay(wkDate),
    aux:extractAuxHistoryMode(wkDate,auxD7old,weekHeads,'anterior')
   }]:[])
  ];
  const pastAuxHoy:AuxiliarHistory[]=[
   {date:latest.date,period:'D−1',
    sourceDate:latest.date,
    aux:extractAuxHistoryMode(latest.date,auxD1same,latest.heads,'intrajornada')},
   ...(hasDrawResults(weekHeads)?[{
    date:wkDate,period:'D−7' as const,
    sourceDate:wkDate,
    aux:extractAuxHistoryMode(wkDate,auxD7same,weekHeads,'intrajornada')
   }]:[])
  ].map(({sourceDate,...rest})=>rest); // HOY uses same-day data PRE at its historic turn;
  // no special sourceDate<date rule is required for same-day AUX history
  // but all historic dates remain strictly earlier than target day.
  const six=previous.slice().reverse();
  const marks:Root[]=(await Promise.all(six.map(x=>completed(x.date))))
   .flatMap((d,i)=>d.roots.map(r=>({...r,daysBack:i+1})));
  const physicalDay=buildSheet(actual,base.heads);
  for(const [index,turn] of TURNOS.entries()){
   const historicalOnly=diaVacio();
   for(const earlier of TURNOS.slice(0,index))
    historicalOnly[earlier]={...actual[earlier]};
   const pre=buildSheet(historicalOnly,base.heads);
   const safe=preSheetAtCut(pre,turn,index);
   if(TURNOS.slice(index).some(t=>safe.heads[t]?.length||safe.matches[t]?.length))
    throw Error('Fuga PRE del turno '+date+' '+turn);
   const view=buildMotorLalo(safe,date,turn,refs);
   const frozenView=JSON.stringify(view.ranks);
   const geo=buildVt3Shadow(safe,date,turn,refs,view);
   const trial=buildVt3Trial(view,geo);
   const connected=buildConnectedVt3(safe,date,turn,connectedDays);
   const families=routes(safe.columns.slice(0,index+1));
   const fMap:Record<string,Features>={};
   for(const [f,p] of families)fMap[f]=features(p,marks,latest.date,wkDate);
   const baseTop=view.ranks.vt3.slice(0,10).map(f=>f.family);
   const baseSet=new Set(view.ranks.vt3.map(f=>f.family));
   const unavailable=[...families.keys()].filter(f=>!baseSet.has(f));
   // PULSO_TOP10 uses exactly the same ten families, only reorders by
   // historical 101 source activation. Reproduces prior seal's criterion.
   const pulse=[...baseTop].sort((a,b)=>
    (fMap[b]?.pulse101||0)-(fMap[a]?.pulse101||0)||
    baseTop.indexOf(a)-baseTop.indexOf(b));
   const poolSame=unavailable.filter(f=>fMap[f].same6>0);
   const sameScore=(f:string)=>[fMap[f].same6,fMap[f].sourceCount,fMap[f].paths];
   const poolPaso=unavailable.filter(f=>fMap[f].pasoReciente>0);
   const pasoScore=(f:string)=>[
    fMap[f].pasoReciente,fMap[f].neighbor3,fMap[f].sourceCount,fMap[f].paths
   ];
   const poolVector=unavailable.filter(f=>fMap[f].vectorContinuo>0);
   const vecScore=(f:string)=>[
    fMap[f].vectorContinuo,fMap[f].pasoReciente,fMap[f].sourceCount,fMap[f].paths
   ];
   const choose=(xs:string[],score:(f:string)=>number[])=>[...xs].sort((a,b)=>{
    const aa=score(a),bb=score(b);
    for(let k=0;k<aa.length;k++)if(aa[k]!==bb[k])return bb[k]-aa[k];
    return a.localeCompare(b);
   })[0]||null;
   const replaceBottom=(family:string|null)=>family?[
    ...baseTop.slice(0,Math.max(0,baseTop.length>=10?9:baseTop.length)),family
   ]:baseTop;
   const selectSame=replaceBottom(choose(poolSame,sameScore));
   const selectPaso=replaceBottom(choose(poolPaso,pasoScore));
   const selectVector=replaceBottom(choose(poolVector,vecScore));
   const ayer=buildMotorLaloAuxiliar(date,turn,
    auxAtCut(yesterdayAux,turn,'anterior'),pastAuxAyer);
   const hoyCut=auxAtCut(liveAux,turn,'intrajornada');
   const hoy=buildMotorLaloAuxiliar(date,turn,hoyCut,pastAuxHoy);
   const toVt3=(xs:string[]):Ranking=>({
    vt2:[],vt3:xs.map(f=>({family:f,values:f.split('/')})),vt4:[]
   });
   const official:Ranking={
    vt2:view.ranks.vt2.slice(0,10).map(makePick),
    vt3:view.ranks.vt3.slice(0,10).map(makePick),
    vt4:view.ranks.vt4.slice(0,10).map(makePick)
   };
   const fromAux=(a:typeof ayer):Ranking=>({
    vt2:a.ranks[2].slice(0,10).map(makePick),
    vt3:a.ranks[3].slice(0,10).map(makePick),
    vt4:a.ranks[4].slice(0,10).map(makePick)
   });
   const ranks:Record<Name,Ranking>={
    LALO:official,
    GEOMETRIA:toVt3(geo.top.slice(0,10).map(x=>x.family)),
    NUEVA_PRUEBA:toVt3(trial.top.slice(0,10).map(x=>x.family)),
    CONECTADAS:toVt3(connected.top.slice(0,10).map(x=>x.family)),
    PULSO_TOP10:toVt3(pulse),
    MISMA_6:toVt3(selectSame),
    PASO_RECIENTE:toVt3(selectPaso),
    VECTOR_CONTINUO:toVt3(selectVector),
    AUX_AYER:fromAux(ayer),
    AUX_HOY:fromAux(hoy)
   };
   if(!noRankChanges(view,frozenView))throw Error('Motor Lalo mutado');
   for(const [name,kinds] of Object.entries(ranks))for(const kind of ['vt2','vt3','vt4'] as const){
    const list=kinds[kind];
    if(list.length>10||new Set(list.map(x=>x.family)).size!==list.length)
     throw Error('Top duplicado '+name+' '+kind+' '+date+' '+turn);
   }
   const actualHeads=JURS.map(jur=>({jur,head:actual[turn]?.[jur]||''}))
    .filter(x=>valid(x.head))
    .map(x=>({...x,vt2:reversibleFamily(x.head.slice(-2)),
     vt3:reversibleFamily(x.head.slice(-3)),vt4:x.head}));
   const physicalAvailable=physicalDay.matches[turn]||[];
   const formableWinners:Record<Kind,number>={vt2:0,vt3:0,vt4:0};
   for(const win of actualHeads){
    const matching=physicalAvailable.find(m=>m.jurisdiccion===win.jur&&m.cabeza===win.head);
    for(const kind of kinds)if(matching?.hits.some(hit=>hit.kind===kind))
     formableWinners[kind]++;
   }
   const twoSame=unavailable.filter(f=>fMap[f].sameDays>=2&&fMap[f].same6>0).length;
   cases.push({
    date,turn,sourceDates:{
     base:base.dates,d1:latest.date,d7:wkDate,auxAyer:previousDrawDay(date)
    },old6:previous.map(x=>x.date),
    rawAuxAvailable:{
     ayer:Object.values(yesterdayAux).flatMap(v=>Object.values(v)).filter(valid).length,
     hoy:Object.values(liveAux).flatMap(v=>Object.values(v)).filter(valid).length,
     hoyVisible:Object.values(hoyCut).flatMap(v=>Object.values(v)).filter(valid).length
    },heads:actualHeads,ranks,eligibleOriginal:{
     vt2:view.ranks.vt2.length,vt3:view.ranks.vt3.length,
     vt4:view.ranks.vt4.length
    },physicalVt3:families.size,formableWinners,
    originalMissedWinners:actualHeads.filter(h=>!ranks.LALO.vt3.some(p=>
     p.family===h.vt3)).map(h=>h.jur+' '+h.head),
    signals:{
     same2DaysAll:twoSame,pulsoOriginalTop10:baseTop.filter(f=>fMap[f]?.pulse101).length,
     misma6Eligible:poolSame.length,pasoEligible:poolPaso.length,vectorEligible:poolVector.length
    }
   });
  }
  console.log('CIERRE_DIA_OK',date,validHeadCount);
 }
 const dates=['2026-10-26','2026-10-27','2026-10-28'];
 const stats=Object.fromEntries(names.map(n=>[n,Object.fromEntries(kinds.map(kind=>[
  kind,Object.fromEntries([3,5,10].map(top=>['top'+top,
   cases.reduce((acc,c)=>acc+countHits(c,n,kind,top),0)]))
 ]))])) as Record<Name,Record<Kind,Record<string,number>>>;
 const byDate=dates.map(date=>({
  date,heads:cases.filter(c=>c.date===date).reduce((sum,c)=>sum+c.heads.length,0),
  stats:Object.fromEntries(names.map(n=>[n,Object.fromEntries(kinds.map(kind=>[
   kind,Object.fromEntries([3,5,10].map(top=>['top'+top,
    cases.filter(c=>c.date===date).reduce((sum,c)=>sum+countHits(c,n,kind,top),0)]))
  ]))]))
 }));
 const perTurn=cases.map(c=>({
  date:c.date,turn:c.turn,heads:c.heads.map(x=>x.jur+':'+x.head),
  hitTop3:Object.fromEntries(names.map(name=>[name,
   c.heads.filter(h=>c.ranks[name].vt3.slice(0,3).some(f=>
    matches('vt3',f,h.head))).map(h=>h.jur+':'+h.head)])),
  hitTop10:Object.fromEntries(names.map(name=>[name,
   c.heads.filter(h=>c.ranks[name].vt3.slice(0,10).some(f=>
    matches('vt3',f,h.head))).map(h=>h.jur+':'+h.head)])),
  top3vt3:Object.fromEntries(names.map(name=>[name,c.ranks[name].vt3.slice(0,3).map(x=>x.family)])),
  physical:c.formableWinners,signals:c.signals
 }));
 const totals={
  days:dates.length,cuts:cases.length,
  heads:cases.reduce((sum,c)=>sum+c.heads.length,0),
  physical:Object.fromEntries(kinds.map(k=>[k,cases.reduce((n,c)=>n+c.formableWinners[k],0)])),
  stats,byDate,perTurn,
  note:'Except GitHub sealed PRE Monday 26/10 Previa: all rankings reconstructed retrospectively from only PRE-known inputs. Local user APK snapshots unavailable.',
  validity:'Retrospective reconstruction is NOT a genuine ex ante prospective evaluation.'
 };
 fs.mkdirSync('auditorias/cierre-26a28oct',{recursive:true});
 fs.writeFileSync('auditorias/cierre-26a28oct/resultado-cortes.json',
  JSON.stringify({totals,cases},null,2)+'\n');
 console.log('CIERRE_TOTALES',JSON.stringify({
  days:totals.days,cuts:totals.cuts,heads:totals.heads,physical:totals.physical,
  stats:totals.stats,byDate:totals.byDate,perTurn:totals.perTurn
 }));
 // Authentic Oct 26 PRE was saved and committed before target date: verify hash,
 // compare *only* the immutable lists, never recalculated rankings as that seal.
 const sealPath='auditorias/lalo-pulso-vt3-sellado-26oct/sellado-previa-2026-10-26.json';
 const seal=JSON.parse(fs.readFileSync(sealPath,'utf8'));
 const {payloadSha256,...payload}=seal;
 const SHA='3d4c8bc10b24f8f23290c2f41b7692aef9a1897163c1cb1d684c6609b00f8771';
 const digest=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
 if(digest!==SHA||seal.payloadSha256!==SHA||
  seal.sealedAtUtc>=seal.expiryGuardUtc||seal.date!=='2026-10-26'||seal.turn!=='Previa')
  throw Error('Sello prospective alterado/no válido');
 const pre=cases.find(x=>x.date==='2026-10-26'&&x.turn==='Previa');
 if(!pre)throw Error('No Monday PRE');
 const actual=pre.heads.filter(x=>x.jur!=='Montevideo');
 const score=(xs:string[])=>actual.filter(h=>xs.includes(h.vt3)).map(h=>({
  jurisdiction:h.jur,head:h.head,rank:xs.indexOf(h.vt3)+1
 }));
 const sealResult={
  genuinePre:true,sealedAtUtc:seal.sealedAtUtc,sha256:SHA,
  date:'2026-10-26',turn:'Previa',heads:actual,
  Lalo:{top3:score(seal.top3Lalo),top5:score(seal.top5Lalo),top10:score(seal.top10Lalo)},
  Pulso:{top3:score(seal.top3Pulso),top5:score(seal.top5Pulso),top10:score(seal.top10Pulso)},
  sameTop10:seal.top10Lalo.join('|')===seal.top10Pulso.join('|')
 };
 fs.writeFileSync('auditorias/cierre-26a28oct/pre-sellado-26oct-comparacion.json',
  JSON.stringify(sealResult,null,2)+'\n');
 console.log('CIERRE_SELLO_PREVIA',JSON.stringify(sealResult));
}
main().catch(error=>{console.error('CIERRE_ERROR',error);process.exitCode=1});
