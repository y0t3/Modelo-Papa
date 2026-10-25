/**
 * LALO VT3 · CICLO DE VIDA DE FIGURAS (5-6 jornadas anteriores).
 *
 * "Figura" = firma geométrica de 3 celdas contiguas, normalizada por
 * traslación e inversión (no rotación/mirada al azar).
 * "Activación" = cabeza REAL publicada que tiene ese recorrido válido
 * dentro de UNA columna de una hoja histórica terminada.
 * No confundir activación con existencia física (estructural) de la forma.
 * "Nace"/"reaparece"/"desaparece" = estado de ACTIVACIÓN en ventana,
 * jamás afirmación sobre inexistencia geométrica.
 *
 * El corte PRE del día objetivo jamás recibe su resultado POST.
 * Solo se reordena el MISMO Top10 del MV1: no alteramos familias ni VT2/VT4.
 * 3 bloques previos: junio-julio (exploratorio), agosto-septiembre
 * (comprobación intermedia), octubre 1-23 (validación temporal final).
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {DailySheet,SourceId} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloHistorical} from '../src/motorLalo';
import type {Path} from '../src/paths';

type Method='BASE'|'D1'|'ULTIMA_ACTIVA'|'DOS_SEGUIDAS'|'REACTIVADA'|
 'ACTIVA_3'|'ACTIVA_6'|'MISMA_FUENTE'|'A_DERECHA'|
 'SITE_D1'|'SITE_STREAK'|'SITE_3'|'SITE_6'|'SITE_REVIVE'|'SITE_BIRTH'|'CORRIDOR_D1'|'CORRIDOR_3';
const METHODS:Method[]=['BASE','SITE_6'];
const sourceOrder:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const drawingCache=new Map<string,Promise<CabezasDia>>();
const completedCache=new Map<string,Promise<Completed>>();
const load=(date:string)=>{
 if(!drawingCache.has(date))drawingCache.set(date,descargarCabezas(date,true));
 return drawingCache.get(date)!;
};
const shape=(p:Path)=>{
 const mr=Math.min(...p.map(x=>x.row)),mc=Math.min(...p.map(x=>x.col));
 const f=p.map(x=>[x.row-mr,x.col-mc].join(':')).join('>');
 const b=[...p].reverse().map(x=>[x.row-mr,x.col-mc].join(':')).join('>');
 return [f,b].sort()[0];
};
const sourceRow=(p:Path)=>Math.min(...p.map(x=>x.row));
type Evidence={sig:string;source:SourceId;minRow:number;turn:string;jur:string;head:string};
type Completed={date:string;validHeads:number;sheet:DailySheet;
 active:Map<string,Evidence[]>;uniqueEvents:number};
const validHeads=(draws:CabezasDia)=>
 TURNOS.reduce((n,t)=>n+JURS.filter(j=>/^\d{4}$/.test(draws[t]?.[j]||'')).length,0);
async function completed(date:string):Promise<Completed>{
 if(!completedCache.has(date))completedCache.set(date,(async()=>{
  const [draws,base]=await Promise.all([
   load(date),nocturnaAnteriorPorJur(date,load,20)
  ]);
  if(base.missing.length)throw Error('Base histórica incompleta '+date);
  const sheet=buildSheet(draws,base.heads);
  const h=validHeads(draws);
  const active=new Map<string,Evidence[]>();
  const events=new Set<string>();
  // No asignar estado "no activo" a fechas sin sorteos o con tablero incompleto.
  if(h>=20){
   for(const t of TURNOS)for(const m of sheet.matches[t]||[]){
    // Mismo criterio de soporte que las raíces VT3 del motor Lalo.
    if(m.jurisdiccion==='Montevideo')continue;
    for(const hit of m.hits){
     if(hit.kind!=='vt3'||!m.cabeza.endsWith(hit.value))continue;
     for(const p of hit.paths){
      const event=[t,m.jurisdiccion,m.cabeza,hit.sourceId,shape(p),sourceRow(p)].join('|');
      if(events.has(event))continue;
      events.add(event);
      const key=shape(p),v=active.get(key)||[];
      v.push({sig:key,source:hit.sourceId,minRow:sourceRow(p),
       turn:t,jur:m.jurisdiccion,head:m.cabeza});
      active.set(key,v);
     }
    }
   }
  }
  return {date,validHeads:h,sheet,active,uniqueEvents:events.size};
 })());
 return completedCache.get(date)!;
}
async function priorSix(date:string):Promise<Completed[]>{
 const days:Completed[]=[];
 let d=date;
 let retries=0;
 while(days.length<6&&retries<14){
  d=previousDrawDay(d);retries++;
  const c=await completed(d);
  if(c.validHeads>=20)days.push(c);
 }
 if(days.length<6)throw Error('Faltan seis jornadas históricas válidas: '+date);
 return days;
}
type Life={
 state:'ACTIVA_D1'|'PERSISTENTE'|'REACTIVADA'|'PRIMERA_EN_VENTANA'|
       'ACTIVA_ANTERIOR'|'SIN_ACTIVACIONES';
 daysActive:number;active3:number;active6:number;
 day1:boolean;day2:boolean;daysSinceLast:number|null;
 consecutive:number;reactivated:boolean;firstObserved:boolean;
 sameSource:boolean;movedRight:boolean;rowWalk:boolean;
 previousEvidence:string[];byDay:number[];
 siteD1:boolean;siteStreak:number;siteDays3:number;siteDays6:number;
 siteRevive:boolean;siteBirth:boolean;siteGone:boolean;
 corridorD1:boolean;corridorDays3:number;siteByDay:number[];
};
function life(f:LaloFamily,history:Completed[]):Life{
 const paths=f.paths;
 const sigs=new Set(paths.map(p=>shape(p.path)));
 const byDay=history.map(c=>{
  const matched=[...sigs].flatMap(k=>c.active.get(k)||[]);
  return matched;
 });
 const active=byDay.map(x=>x.length>0);
 const daysActive=active.filter(Boolean).length;
 const n3=active.slice(0,3).filter(Boolean).length;
 const day1=active[0]||false,day2=active[1]||false;
 const since=active.indexOf(true);
 let consecutive=0;
 for(const yes of active){if(!yes)break;consecutive++}
 const reactivated=day1&&!day2&&active.slice(2).some(Boolean);
 const firstObserved=day1&&!active.slice(1).some(Boolean);
 const recent=byDay[0]||[];
 const sameSource=paths.some(p=>recent.some(r=>r.source===p.sourceId&&
  r.sig===shape(p.path)));
 const movedRight=paths.some(p=>recent.some(r=>
  sourceOrder.indexOf(p.sourceId)===sourceOrder.indexOf(r.source)+1&&
  shape(p.path)===r.sig&&
  Math.abs(sourceRow(p.path)-r.minRow)<=2));
 const rowWalk=paths.some(p=>recent.some(r=>r.source===p.sourceId&&
  shape(p.path)===r.sig&&
  Math.abs(sourceRow(p.path)-r.minRow)>=1&&
  Math.abs(sourceRow(p.path)-r.minRow)<=2));
 // Diferenciar figura abstracta de sitio físico. Cada comparación une
 // DOS caminos válidos en sus propias hojas, nunca recorre entre columnas.
 const evidence=(c:Completed,cross:boolean)=>paths.flatMap(p=>
  (c.active.get(shape(p.path))||[]).filter(h=>{
   const dist=sourceOrder.indexOf(p.sourceId)-sourceOrder.indexOf(h.source);
   return (cross?Math.abs(dist)<=1:dist===0)&&
    Math.abs(sourceRow(p.path)-h.minRow)<=2;
  }));
 const siteByDay=history.map(c=>evidence(c,false).length);
 const corridorByDay=history.map(c=>evidence(c,true).length);
 const on=siteByDay.map(n=>n>0),coOn=corridorByDay.map(n=>n>0);
 let siteStreak=0;for(const v of on){if(!v)break;siteStreak++}
 const siteD1=on[0]||false;
 const siteRevive=siteD1&&!on[1]&&on.slice(2).some(Boolean);
 const siteBirth=siteD1&&!on.slice(1).some(Boolean);
 const siteGone=!siteD1&&on.slice(1).some(Boolean);
 const state=daysActive===0?'SIN_ACTIVACIONES':
   consecutive>=2?'PERSISTENTE':
   reactivated?'REACTIVADA':
   firstObserved?'PRIMERA_EN_VENTANA':
   day1?'ACTIVA_D1':'ACTIVA_ANTERIOR';
 return {state,daysActive,active3:n3,active6:daysActive,
  day1,day2,daysSinceLast:since<0?null:since+1,
  consecutive,reactivated,firstObserved,sameSource,movedRight,rowWalk,
  previousEvidence:recent.slice(0,4).map(x=>x.turn+' '+x.jur+' '+x.head+' '+x.source),
  byDay:byDay.map(x=>x.length),siteD1,siteStreak,
  siteDays3:on.slice(0,3).filter(Boolean).length,
  siteDays6:on.filter(Boolean).length,siteRevive,siteBirth,siteGone,
  corridorD1:coOn[0]||false,
  corridorDays3:coOn.slice(0,3).filter(Boolean).length,siteByDay};
}
function rerank(original:LaloFamily[],method:Method,hist:Completed[]){
 if(method==='BASE')return original;
 const top=original.slice(0,10).map(f=>{
  const x=life(f,hist);
  const branched=Number(f.branchBlocks>0);
  const score=method==='D1'?
   [branched,f.d1Roots,f.branchBlocks,f.d7Roots,f.sourceCount,f.physicalBlocks]:
   method==='SITE_D1'?[branched,Number(x.siteD1)]:
   method==='SITE_STREAK'?[branched,Number(x.siteStreak>=2)]:
   method==='SITE_3'?[branched,x.siteDays3]:
   method==='SITE_6'?[branched,x.siteDays6]:
   method==='SITE_REVIVE'?[branched,Number(x.siteRevive)]:
   method==='SITE_BIRTH'?[branched,Number(x.siteBirth)]:
   method==='CORRIDOR_D1'?[branched,Number(x.corridorD1)]:
   method==='CORRIDOR_3'?[branched,x.corridorDays3]:
   method==='ULTIMA_ACTIVA'?[branched,Number(x.day1)]:
   method==='DOS_SEGUIDAS'?[branched,Number(x.consecutive>=2)]:
   method==='REACTIVADA'?[branched,Number(x.reactivated)]:
   method==='ACTIVA_3'?[branched,x.active3]:
   method==='ACTIVA_6'?[branched,x.active6]:
   method==='MISMA_FUENTE'?[branched,Number(x.sameSource)]:
   [branched,Number(x.movedRight)];
  return {f,score};
 });
 top.sort((a,b)=>{
  for(let i=0;i<a.score.length;i++)
   if(a.score[i]!==b.score[i])return b.score[i]-a.score[i];
  return a.f.rank-b.f.rank;
 });
 return [...top.map(x=>x.f),...original.slice(10)]
  .map((f,i)=>({...f,rank:i+1}));
}
function block(date:string){
 if(date<='2026-07-31')return 'JUN_JUL';
 if(date<='2026-09-30')return 'AGO_SEP';
 return 'OCT_REFERENCIA';
}
async function main(){
 const candidates:any[]=[],heads:any[]=[],daily:any[]=[];
 for(let date='2026-06-01';date<='2026-10-24';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const weekly=shiftDay(date,-7);
  const [today,previous,week,base,six]=await Promise.all([
   load(date),loadPreviousDraws(date,4,load),load(weekly),
   nocturnaAnteriorPorJur(date,load,20),priorSix(date)
  ]);
  if(validHeads(today)<20){console.log('SITIO_OMITIDA',date,validHeads(today));continue}
  if(base.missing.length)throw Error('Nocturna actual incompleta '+date);
  const latest=previous[3];
  const [baseD1,baseD7]=await Promise.all([
   nocturnaAnteriorPorJur(latest.date,load,20),
   nocturnaAnteriorPorJur(weekly,load,20)
  ]);
  if(baseD1.missing.length||baseD7.missing.length)
   throw Error('Raíz histórica incompleta '+date);
  const roots:LaloHistorical[]=[
   {date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,baseD1.heads)},
   ...(weekly<date&&hasDrawResults(week)?[
    {date:weekly,period:'D−7' as const,sheet:buildSheet(week,baseD7.heads)}
   ]:[])
  ];
  if(roots.some(r=>r.date>=date)||six.some(r=>r.date>=date))
   throw Error('Fuga temporal '+date);
  for(const [idx,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const t of TURNOS.slice(0,idx))pre[t]={...today[t]};
   const view=buildMotorLalo(buildSheet(pre,base.heads),date,turn,roots);
   const rankings=Object.fromEntries(METHODS.map(m=>[
    m,rerank(view.ranks.vt3,m,six)
   ])) as Record<Method,LaloFamily[]>;
   const motherSet=view.ranks.vt3.slice(0,10).map(f=>f.family).sort().join('|');
   for(const m of METHODS)if(rankings[m].slice(0,10)
    .map(f=>f.family).sort().join('|')!==motherSet)
    throw Error('Cambio de madres VT3 '+date+' '+turn+' '+m);
   for(const f of view.ranks.vt3.slice(0,10)){
    const l=life(f,six);
    candidates.push({date,turn,family:f.family,rank:f.rank,
     branch:f.branchBlocks,d1:f.d1Roots,d7:f.d7Roots,
     sources:f.sourceCount,paths:f.paths.length,
     ...l,ranks:Object.fromEntries(METHODS.map(m=>[
      m,rankings[m].find(y=>y.family===f.family)?.rank||null
     ]))});
   }
   for(const jur of JURS){
    const head=today[turn]?.[jur]||'';
    if(!/^\d{4}$/.test(head))continue;
    const family=reversibleFamily(head.slice(-3));
    const ranks=Object.fromEntries(METHODS.map(m=>[
     m,rankings[m].find(y=>y.family===family)?.rank||null
    ]));
    heads.push({date,turn,jur,head,family,block:block(date),ranks});
   }
  }
  daily.push({date,block:block(date),heads:validHeads(today),
   history:six.map(x=>({date:x.date,heads:x.validHeads,
    activatedShapes:x.active.size,events:x.uniqueEvents}))});
  console.log('SITIO_DIA',date);
 }
 const report:any[]=[];
 const periods=['JUN_JUL','AGO_SEP','OCT_REFERENCIA','TOTAL'];
 for(const p of periods)for(const m of METHODS){
  const rows=heads.filter(x=>p==='TOTAL'||x.block===p);
  const won=(method:Method,k:number)=>rows.filter(x=>
   x.ranks[method]!==null&&x.ranks[method]<=k);
  const win3=won(m,3),base3=won('BASE',3);
  const gained=win3.filter(x=>x.ranks.BASE===null||x.ranks.BASE>3);
  const lost=base3.filter(x=>x.ranks[m]===null||x.ranks[m]>3);
  report.push({period:p,method:m,examined:rows.length,
   top3:win3.length,top5:won(m,5).length,top10:won(m,10).length,
   gains:gained.length,losses:lost.length,
   gainHeads:gained.map(x=>({date:x.date,turn:x.turn,jur:x.jur,
    head:x.head,original:x.ranks.BASE,new:x.ranks[m]})),
   lossHeads:lost.map(x=>({date:x.date,turn:x.turn,jur:x.jur,
    head:x.head,original:x.ranks.BASE,new:x.ranks[m]}))});
 }
 const states:any[]=[];
 for(const state of ['ACTIVA_D1','PERSISTENTE','REACTIVADA',
  'PRIMERA_EN_VENTANA','ACTIVA_ANTERIOR','SIN_ACTIVACIONES']){
  for(const p of periods){
   const pool=candidates.filter(x=>x.state===state&&(p==='TOTAL'||block(x.date)===p));
   const wins=heads.filter(x=>p==='TOTAL'||x.block===p)
    .filter(x=>x.ranks.BASE!==null&&x.ranks.BASE<=10);
   const hit=wins.filter(x=>pool.some(f=>f.date===x.date&&
    f.turn===x.turn&&f.family===x.family)).length;
   states.push({period:p,state,exposures:pool.length,top10Hit:hit});
  }
 }
 const dir='auditorias/lalo-sitio6-raices-reales-25oct/resultados';
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/resumen.json',JSON.stringify(report,null,2));
 fs.writeFileSync(dir+'/candidatos-estado.json',JSON.stringify(candidates,null,2));
 fs.writeFileSync(dir+'/por-cabeza.json',JSON.stringify(heads,null,2));
 fs.writeFileSync(dir+'/historial-previo.json',JSON.stringify(daily,null,2));
 fs.writeFileSync(dir+'/estados-por-periodo.json',JSON.stringify(states,null,2));
 console.log('SITIO_RESUMEN',JSON.stringify(report.map(x=>({
  period:x.period,method:x.method,heads:x.examined,
  top3:x.top3,top5:x.top5,top10:x.top10,
  gains:x.gains,losses:x.losses
 }))));
 console.log('SITIO_ESTADOS',JSON.stringify(states));
 console.log('SITIO_DIFERENCIAS',JSON.stringify(report.filter(x=>
  x.period==='TOTAL'&&x.method!=='BASE').map(x=>({
   method:x.method,gainHeads:x.gainHeads,lossHeads:x.lossHeads
 }))));
 // Azar condicional: seleccionar tres familias del mismo Top10
 // en los mismos cortes, sin modificar el número de candidatos.
 const key=(x:{date:string;turn:string})=>x.date+'|'+x.turn;
 const cuts=new Map<string,{families:string[];heads:string[];period:string}>();
 for(const c of candidates){const id=key(c),row=cuts.get(id)||{families:[],heads:[],period:block(c.date)};
  row.families.push(c.family);cuts.set(id,row)}
 for(const h of heads){const row=cuts.get(key(h));if(row)row.heads.push(h.family)}
 let seed=20261025;
 const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296};
 const randomControl:any[]=[];
 for(const name of ['JUN_JUL','AGO_SEP','OCT_REFERENCIA','HOLDOUT','TOTAL']){
  const take=(p:string)=>name==='TOTAL'||(name==='HOLDOUT'?p!=='JUN_JUL':p===name);
  const cutsHere=[...cuts.values()].filter(c=>take(c.period));
  const observed=heads.filter(h=>take(h.block)&&h.ranks.SITE_6!==null&&h.ranks.SITE_6<=3).length;
  const baseline=heads.filter(h=>take(h.block)&&h.ranks.BASE!==null&&h.ranks.BASE<=3).length;
  const dist:number[]=[];
  for(let n=0;n<10000;n++){
   let wins=0;
   for(const cut of cutsHere){
    const a=[...cut.families],k=Math.min(a.length,3);
    for(let i=0;i<k;i++){const j=i+Math.floor(rand()*(a.length-i));
     [a[i],a[j]]=[a[j],a[i]]}
    const picked=new Set(a.slice(0,k));
    wins+=cut.heads.filter(f=>picked.has(f)).length;
   }
   dist.push(wins);
  }
  dist.sort((a,b)=>a-b);
  randomControl.push({period:name,cuts:cutsHere.length,observed,baseline,
   randomMean:dist.reduce((a,b)=>a+b,0)/dist.length,
   randomP95:dist[Math.floor(.95*dist.length)],
   randomAtLeastObserved:dist.filter(x=>x>=observed).length/dist.length});
 }
 fs.writeFileSync(dir+'/azar-condicional.json',JSON.stringify(randomControl,null,2));
 console.log('SITIO6_AZAR',JSON.stringify(randomControl));
 console.log('SITIO_CONTEO',JSON.stringify({days:daily.length,
  cuts:daily.length*5,heads:heads.length,candidates:candidates.length}));
}
void main().catch(e=>{console.error('SITIO_ERROR',e);process.exitCode=1});
