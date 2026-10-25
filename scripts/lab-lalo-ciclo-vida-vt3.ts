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
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {DailySheet,SourceId} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloHistorical} from '../src/motorLalo';
import type {Path} from '../src/paths';

type Method='BASE'|'D1'|'ULTIMA_ACTIVA'|'DOS_SEGUIDAS'|'REACTIVADA'|
 'ACTIVA_3'|'ACTIVA_6'|'MISMA_FUENTE'|'A_DERECHA';
const METHODS:Method[]=['BASE','D1','ULTIMA_ACTIVA','DOS_SEGUIDAS',
 'REACTIVADA','ACTIVA_3','ACTIVA_6','MISMA_FUENTE','A_DERECHA'];
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
  const prev=previousDrawDay(date);
  const [draws,previous]=await Promise.all([load(date),load(prev)]);
  const sheet=buildSheet(draws,previous);
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
  r.sig===shape(p.path))));
 const movedRight=paths.some(p=>recent.some(r=>
  sourceOrder.indexOf(p.sourceId)===sourceOrder.indexOf(r.source)+1&&
  shape(p.path)===r.sig&&
  Math.abs(sourceRow(p.path)-r.minRow)<=2));
 const rowWalk=paths.some(p=>recent.some(r=>r.source===p.sourceId&&
  shape(p.path)===r.sig&&
  Math.abs(sourceRow(p.path)-r.minRow)>=1&&
  Math.abs(sourceRow(p.path)-r.minRow)<=2));
 const state=daysActive===0?'SIN_ACTIVACIONES':
   consecutive>=2?'PERSISTENTE':
   reactivated?'REACTIVADA':
   firstObserved?'PRIMERA_EN_VENTANA':
   day1?'ACTIVA_D1':'ACTIVA_ANTERIOR';
 return {state,daysActive,active3:n3,active6:daysActive,
  day1,day2,daysSinceLast:since<0?null:since+1,
  consecutive,reactivated,firstObserved,sameSource,movedRight,rowWalk,
  previousEvidence:recent.slice(0,4).map(x=>x.turn+' '+x.jur+' '+x.head+' '+x.source),
  byDay:byDay.map(x=>x.length)};
}
function rerank(original:LaloFamily[],method:Method,hist:Completed[]){
 if(method==='BASE')return original;
 const top=original.slice(0,10).map(f=>{
  const x=life(f,hist);
  const branched=Number(f.branchBlocks>0);
  const score=method==='D1'?
   [branched,f.d1Roots,f.branchBlocks,f.d7Roots,f.sourceCount,f.physicalBlocks]:
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
 for(let date='2026-06-01';date<='2026-10-23';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const prev=previousDrawDay(date),prevprev=previousDrawDay(prev);
  const weekly=shiftDay(date,-7),weeklyPrev=previousDrawDay(weekly);
  const [today,one,older,week,weekOld,six]=await Promise.all([
   load(date),load(prev),load(prevprev),load(weekly),load(weeklyPrev),
   priorSix(date)
  ]);
  const roots:LaloHistorical[]=[
   {date:prev,period:'D−1',sheet:buildSheet(one,older)},
   {date:weekly,period:'D−7',sheet:buildSheet(week,weekOld)}
  ];
  const isComplete=validHeads(today)>=20;
  if(!isComplete){console.log('CICLO_OMITIDA',date,validHeads(today));continue}
  for(const [idx,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const t of TURNOS.slice(0,idx))pre[t]={...today[t]};
   const view=buildMotorLalo(buildSheet(pre,one),date,turn,roots);
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
  console.log('CICLO_DIA',date);
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
 const dir='auditorias/lalo-ciclo-vida-figuras-25oct/resultados';
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/resumen.json',JSON.stringify(report,null,2));
 fs.writeFileSync(dir+'/candidatos-estado.json',JSON.stringify(candidates,null,2));
 fs.writeFileSync(dir+'/por-cabeza.json',JSON.stringify(heads,null,2));
 fs.writeFileSync(dir+'/historial-previo.json',JSON.stringify(daily,null,2));
 fs.writeFileSync(dir+'/estados-por-periodo.json',JSON.stringify(states,null,2));
 console.log('CICLO_RESUMEN',JSON.stringify(report.map(x=>({
  period:x.period,method:x.method,heads:x.examined,
  top3:x.top3,top5:x.top5,top10:x.top10,
  gains:x.gains,losses:x.losses
 }))));
 console.log('CICLO_ESTADOS',JSON.stringify(states));
 console.log('CICLO_DIFERENCIAS',JSON.stringify(report.filter(x=>
  x.period==='TOTAL'&&x.method!=='BASE').map(x=>({
   method:x.method,gainHeads:x.gainHeads,lossHeads:x.lossHeads
 }))));
 console.log('CICLO_CONTEO',JSON.stringify({days:daily.length,
  cuts:daily.length*5,heads:heads.length,candidates:candidates.length}));
}
void main().catch(e=>{console.error('CICLO_ERROR',e);process.exitCode=1});
