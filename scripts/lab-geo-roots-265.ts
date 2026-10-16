// Backtest de 265 cortes por turno con tres alternativas fijadas antes de ejecutar.
// Solo histórico: se conoce el resultado al diseñar esta prueba, no es sello real.
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {descargarCabezas} from '../src/cabezas';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {buildVt3Shadow,allPhysicalVt3} from '../src/vt3Shadow';
import {buildWinningRootsGeo} from './lab-geo-winning-roots';
import type {ExperimentalMode} from './lab-geo-winning-roots';

type Method='LALO_OFICIAL'|'GEOMETRIA_COMPLETA'|ExperimentalMode;
const methods:Method[]=['LALO_OFICIAL','GEOMETRIA_COMPLETA',
 'HUELLAS_DISTANCIA','HUELLAS_EVENTOS','HUELLAS_CON_RAIZ'];
type ResultDay={date:string;heads:CabezasDia};
type Winner={jur:string;head:string;family:string;physical:boolean;
 ranks:Record<Method,number|null>};
type Cut={date:string;turn:Turno;period:'AGOSTO'|'SEPTIEMBRE_OCTUBRE';
 prev:string;week:string|null;headCount:number;winners:Winner[];
 totalPhysicalFamilies:number;roots:number;rootedPhysicalFamilies:number;
 top:Record<Method,string[]>;hits:Record<Method,{top3:number;top5:number;top10:number}>;
 incomplete:Record<Method,boolean>;rootSamples:any[]};
const from='2026-08-15',to='2026-10-15',periodSplit='2026-09-14';
function dates(start:string,end:string){
 const result:string[]=[];
 for(let time=Date.parse(start+'T12:00:00Z'),max=Date.parse(end+'T12:00:00Z');
  time<=max;time+=86400000)result.push(new Date(time).toISOString().slice(0,10));
 return result;
}
const addDays=(d:string,n:number)=>
 new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
const key=(p:{row:number;col:number})=>p.row+':'+p.col;
const rank=(names:string[],family:string)=>{const idx=names.indexOf(family);return idx<0?null:idx+1};
async function download(){
 const required=dates('2026-07-20',to),saved:ResultDay[]=[];
 for(let i=0;i<required.length;i+=6){
  const current=required.slice(i,i+6);
  const received=await Promise.all(current.map(async date=>{
   for(let tryNo=0;tryNo<3;tryNo++){
    try{return {date,heads:await descargarCabezas(date,true)}}
    catch(e){if(tryNo===2)throw Error('Error descargando '+date+': '+String(e))}
   }
   throw Error('Error persistente en '+date);
  }));
  saved.push(...received);
 }
 return saved.filter(item=>hasDrawResults(item.heads)&&hasNocturnoBase(item.heads))
  .sort((a,b)=>a.date.localeCompare(b.date));
}
const summarize=(cuts:Cut[])=>{
 const result:Record<Method,any>={} as Record<Method,any>;
 for(const m of methods)result[m]={
  heads:cuts.reduce((n,r)=>n+r.hits[m].top3,0),
  top5:cuts.reduce((n,r)=>n+r.hits[m].top5,0),
  top10:cuts.reduce((n,r)=>n+r.hits[m].top10,0),
  cutsWithHit3:cuts.filter(r=>r.hits[m].top3>0).length,
  incompleteTop3:cuts.filter(r=>r.incomplete[m]).length
 };
 return {days:new Set(cuts.map(c=>c.date)).size,cuts:cuts.length,
  heads:cuts.reduce((n,c)=>n+c.headCount,0),
  physicalWinningHeads:cuts.reduce((n,c)=>n+c.winners.filter(w=>w.physical).length,0),
  methods:result};
};
function temporalStability(cuts:Cut[]){
 const rows:any[]=[];
 for(const item of cuts){
  if(item.turn==='Previa')continue;
  const idx=TURNOS.indexOf(item.turn);
  const before=cuts.find(c=>c.date===item.date&&c.turn===TURNOS[idx-1]);
  if(!before)continue;
  const changes=Object.fromEntries(methods.map(m=>[m,
   item.top[m].slice(0,3).filter(f=>!before.top[m].slice(0,3).includes(f)).length]));
  rows.push({date:item.date,turn:item.turn,changes});
 }
 return {transitions:rows.length,changed:Object.fromEntries(methods.map(m=>
  [m,rows.filter(x=>x.changes[m]>0).length]))};
}
function exclusives(cuts:Cut[],other:Method){
 return cuts.filter(c=>c.hits.HUELLAS_DISTANCIA.top3>0&&c.hits[other].top3===0)
  .map(c=>({date:c.date,turn:c.turn,heads:c.winners.filter(w=>w.ranks.HUELLAS_DISTANCIA!==null&&w.ranks.HUELLAS_DISTANCIA<=3)}));
}
async function main(){
 const valid=await download(),byDate=new Map(valid.map(d=>[d.date,d]));
 const cuts:Cut[]=[];
 for(const day of valid.filter(x=>x.date>=from&&x.date<=to)){
  const before=valid.filter(x=>x.date<day.date);
  if(before.length<2)continue;
  const prev=before.at(-1)!,prevprev=before.at(-2)!;
  const weekly=byDate.get(addDays(day.date,-7));
  const beforeWeekly=weekly?valid.filter(x=>x.date<weekly.date).at(-1):null;
  const historical:LaloHistorical[]=[
   {date:prev.date,period:'D−1',sheet:buildSheet(prev.heads,prevprev.heads)},
   ...(weekly&&beforeWeekly?[{date:weekly.date,period:'D−7' as const,
    sheet:buildSheet(weekly.heads,beforeWeekly.heads)}]:[])
  ];
  for(const turn of TURNOS){
   const partial=diaVacio();
   for(const older of TURNOS.slice(0,TURNOS.indexOf(turn)))
    for(const j of JURS)partial[older][j]=day.heads[older][j];
   const pre=buildSheet(partial,prev.heads);
   if(pre.heads[turn]?.length||pre.matches[turn]?.length)
    throw Error('Fuga del resultado en '+day.date+' '+turn);
   const official=buildMotorLalo(pre,day.date,turn,historical);
   const geometry=buildVt3Shadow(pre,day.date,turn,historical,official);
   const alternatives=Object.fromEntries((['HUELLAS_DISTANCIA',
     'HUELLAS_EVENTOS','HUELLAS_CON_RAIZ'] as ExperimentalMode[])
    .map(m=>[m,buildWinningRootsGeo(pre,day.date,turn,official,m)]))
      as Record<ExperimentalMode,ReturnType<typeof buildWinningRootsGeo>>;
   const basenames=official.ranks.vt3.map(f=>f.family);
   const geoNames=geometry.top.map(f=>f.family);
   const top:Record<Method,string[]>={LALO_OFICIAL:basenames.slice(0,10),
    GEOMETRIA_COMPLETA:geoNames,
    HUELLAS_DISTANCIA:alternatives.HUELLAS_DISTANCIA.top.map(r=>r.family),
    HUELLAS_EVENTOS:alternatives.HUELLAS_EVENTOS.top.map(r=>r.family),
    HUELLAS_CON_RAIZ:alternatives.HUELLAS_CON_RAIZ.top.map(r=>r.family)};
   for(const m of methods)if(new Set(top[m]).size!==top[m].length)
    throw Error('Familia repetida '+day.date+' '+turn+' '+m);
   const available=pre.columns.slice(0,TURNOS.indexOf(turn)+1);
   const pool=new Set(available.flatMap(c=>allPhysicalVt3(c.values)
    .map(p=>reversibleFamily(p.map(x=>x.digit).join('')))));
   const families=alternatives.HUELLAS_DISTANCIA.poolFamilies;
   if(pool.size!==families||geometry.availableFamilies!==pool.size)
    throw Error('Incongruencia bolsa física '+day.date+' '+turn);
   const winners:Winner[]=[];
   for(const jur of JURS.filter(j=>j!=='Montevideo')){
    const head=day.heads[turn][jur];
    if(!/^\d{4}$/.test(head))continue;
    const family=reversibleFamily(head.slice(-3));
    winners.push({jur,head,family,physical:pool.has(family),
     ranks:Object.fromEntries(methods.map(m=>[m,rank(top[m],family)])) as Record<Method,number|null>});
   }
   if(!winners.length)continue;
   // Las formas/raíces actuales deben coincidir físicamente con la hoja PRE;
   // las antiguas provienen ÚNICAMENTE de raíces ya verificadas por Lalo.
   for(const m of ['HUELLAS_DISTANCIA','HUELLAS_EVENTOS','HUELLAS_CON_RAIZ'] as const)
    for(const t of alternatives[m].top){
     const c=available.find(x=>x.id===t.source);
     if(!c||!allPhysicalVt3(c.values).some(p=>
       p.map(key).join('>')===t.cells.join('>')&&
       reversibleFamily(p.map(x=>x.digit).join(''))===t.family))
      throw Error('Familia experimental sin camino físico real');
    }
   const hits={} as Record<Method,{top3:number;top5:number;top10:number}>;
   for(const m of methods)hits[m]={
    top3:winners.filter(w=>w.ranks[m]!==null&&w.ranks[m]!<=3).length,
    top5:winners.filter(w=>w.ranks[m]!==null&&w.ranks[m]!<=5).length,
    top10:winners.filter(w=>w.ranks[m]!==null&&w.ranks[m]!<=10).length
   };
   cuts.push({date:day.date,turn,period:day.date<=periodSplit?'AGOSTO':'SEPTIEMBRE_OCTUBRE',
    prev:prev.date,week:weekly&&beforeWeekly?weekly.date:null,
    headCount:winners.length,winners,totalPhysicalFamilies:pool.size,
    roots:alternatives.HUELLAS_DISTANCIA.rootEvents,
    rootedPhysicalFamilies:alternatives.HUELLAS_DISTANCIA.eligibleAnchoredFamilies,
    top,hits,incomplete:Object.fromEntries(methods.map(m=>[m,top[m].length<3])) as Record<Method,boolean>,
    rootSamples:alternatives.HUELLAS_DISTANCIA.top.slice(0,3).map(t=>({
     family:t.family,source:t.source,rootYesterday:t.rootsYesterday,rootWeek:t.rootsWeek,
     evidence:t.historicalEvidence.slice(0,4)}))
   });
  }
 }
 const all=summarize(cuts);
 const august=summarize(cuts.filter(c=>c.period==='AGOSTO'));
 const sep=summarize(cuts.filter(c=>c.period==='SEPTIEMBRE_OCTUBRE'));
 if(all.cuts!==265||august.cuts!==130||sep.cuts!==135)
  throw Error('Muestra histórica desalineada: '+JSON.stringify({all,august,sep}));
 // Sanidad: la reconstrucción y universo comparados deben reproducir el
 // laboratorio histórico previo de ambos motores oficiales, sin retoques.
 if(august.methods.GEOMETRIA_COMPLETA.heads!==1||sep.methods.GEOMETRIA_COMPLETA.heads!==10||
  august.methods.LALO_OFICIAL.heads!==1||sep.methods.LALO_OFICIAL.heads!==5)
  throw Error('No se reprodujeron exactamente los 265 cortes del baseline');
 const report={purpose:'Huella ganadora verificada (D-1 y D-7) frente a tablas completas',
  status:'Retrospectivo sobre historia ya estudiada; no apuesta ni sello prospectivo',
  sample:{start:from,end:to,days:all.days,cuts:all.cuts,heads:all.heads},
  methods:{
   LALO_OFICIAL:'Original sin cambios',
   GEOMETRIA_COMPLETA:'Original: todas las formas posibles de hojas anteriores',
   HUELLAS_DISTANCIA:'Distancias físicas solo a rutas históricas VT3 marcadas y verificadas',
   HUELLAS_EVENTOS:'Cantidad de eventos ganadores independientes, primero los de ayer y luego semana',
   HUELLAS_CON_RAIZ:'Selecciona exclusivamente familias físicas con huella histórica VT3 verificable'},
  safeguards:['PRE solo columnas anteriores','Raíces basadas en cabezas publicadas anteriores',
   'Una cabeza ganadora cuenta como un evento aunque tenga varias rutas',
   'Sin mezclar columnas ni saltar casillas','Ambos motores originales intactos',
   'No usar VT2 como éxito VT3 ni confundir Top3 con cuatro cifras exactas'],
  all,august,sep,stability:temporalStability(cuts),
  exclusiveVsOriginal:exclusives(cuts,'GEOMETRIA_COMPLETA'),
  cuts};
 mkdirSync('lab-results',{recursive:true});
 const path='lab-results/GEOMETRIA_HUELLAS_GANADORAS_265_CORTES.json';
 writeFileSync(path,JSON.stringify(report,null,2)+'\n');
 console.log('ROOTS265_START');
 console.log(JSON.stringify({sample:report.sample,all,august,sep,
  stability:report.stability,exclusive:report.exclusiveVsOriginal},null,2));
 console.log('ROOTS265_END');
 console.log('ROOTS265_SHA256',createHash('sha256').update(JSON.stringify(report)).digest('hex'));
}
main().catch(e=>{console.error('ROOTS265_ERROR',e);process.exitCode=1});
