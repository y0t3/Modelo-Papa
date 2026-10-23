/**
 * Estudio VT3 ciego en otras fechas y diagnóstico de los 5 VT3 del 22/10.
 * Compara rerankings PRE fijos: NO añade familias ni cambia las geometrías.
 * Fecha 22/10 permanece excluida del conjunto de validación.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {TURNOS,JURS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {previousDrawDay,shiftDay} from '../src/dates';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from '../src/motorLaloAuxiliar';
import type {AuxiliarFamily,AuxiliarHistory} from '../src/motorLaloAuxiliar';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {auxiliaryBoard,findAuxPaths} from '../src/auxSantiagoNeuquen';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';

const dates:string[]=[];
for(let day='2026-10-01';day<='2026-10-22';day=shiftDay(day,1))
 if(new Date(day+'T12:00:00').getDay()!==0)dates.push(day);
const modes=['anterior','intrajornada'] as const;
const strategies=['ORIGINAL','D1_PRIMERO','D7_PRIMERO',
 'MAS_FUENTES','CRUCE_PRIMERO','CAMINOS_PRIMERO'] as const;
type Strategy=typeof strategies[number];
type Day={heads:CabezasDia;aux:AuxiliaryHeads};
const cache=new Map<string,Promise<Day>>();
function get(date:string):Promise<Day>{
 if(!cache.has(date))cache.set(date,Promise.all([
  descargarCabezas(date,true),fetchAuxiliaryHeads(date)
 ]).then(([heads,x])=>({heads,aux:x.heads})));
 return cache.get(date)!;
}
async function getHistory(date:string,mode:AuxMode):Promise<AuxiliarHistory[]>{
 const refs=[
  {date:previousDrawDay(date),period:'D−1' as const},
  {date:shiftDay(date,-7),period:'D−7' as const}
 ];
 const history:AuxiliarHistory[]=[];
 for(const ref of refs){
  if(ref.date>=date)throw Error('ref FUTURA '+date);
  const sourceDate=mode==='anterior'?previousDrawDay(ref.date):ref.date;
  const [draw,source]=await Promise.all([get(ref.date),get(sourceDate)]);
  history.push({date:ref.date,period:ref.period,
   heads:source.aux,aux:mode==='anterior'?
    extractAuxiliarHistory(ref.date,source.aux,draw.heads):
    extractAuxHistoryMode(ref.date,source.aux,draw.heads,'intrajornada'),
   ...(mode==='anterior'?{sourceDate}:{})});
 }
 return history;
}
function sorted(families:AuxiliarFamily[],style:Strategy):AuxiliarFamily[]{
 if(style==='ORIGINAL')return families;
 const by=(f:AuxiliarFamily)=>({
  roots:f.roots,d1:f.d1,d7:f.d7,
  sources:f.sources.length,paths:f.paths,cross:f.crossing?1:0});
 const patterns:Record<Exclude<Strategy,'ORIGINAL'>,Array<keyof ReturnType<typeof by>>>={
  D1_PRIMERO:['d1','roots','d7','cross','paths','sources'],
  D7_PRIMERO:['d7','roots','d1','cross','paths','sources'],
  MAS_FUENTES:['sources','roots','d1','d7','cross','paths'],
  CRUCE_PRIMERO:['cross','roots','d1','d7','paths','sources'],
  CAMINOS_PRIMERO:['paths','roots','d1','d7','cross','sources']
 };
 const attrs=patterns[style];
 return [...families].sort((a,b)=>{
  const x=by(a),y=by(b);
  for(const field of attrs)if(x[field]!==y[field])return y[field]-x[field];
  return a.rank-b.rank;
 }).map((f,i)=>({...f,rank:i+1}));
}
const labels=[
 {turn:'Matutino',jur:'Entre Ríos',head:'7886'},
 {turn:'Matutino',jur:'Montevideo',head:'8970'},
 {turn:'Vespertino',jur:'Ciudad',head:'0684'},
 {turn:'Vespertino',jur:'Córdoba',head:'3622'},
 {turn:'Vespertino',jur:'Entre Ríos',head:'3340'}
];
async function main(){
 const audit:any[]=[],diagnostic:any[]=[];
 for(const date of dates){
  const today=await get(date);
  const yesterday=await get(previousDrawDay(date));
  const [histOld,histLive]=await Promise.all([
   getHistory(date,'anterior'),getHistory(date,'intrajornada')]);
  for(const turn of TURNOS){
   for(const mode of modes){
    const raw=mode==='anterior'?yesterday.aux:today.aux;
    const cut=auxAtCut(raw,turn,mode);
    const board=auxiliaryBoard(cut,turn);
    const history=mode==='anterior'?histOld:histLive;
    const view=buildMotorLaloAuxiliar(date,turn,cut,history);
    const ranked=Object.fromEntries(strategies.map(name=>
     [name,sorted(view.ranks[3],name)])) as Record<Strategy,AuxiliarFamily[]>;
    for(const jur of JURS){
     const head=today.heads[turn]?.[jur]||'';
     if(!/^\d{4}$/.test(head))continue;
     const value=head.slice(-3);
     const matches={} as Record<Strategy,number|null>;
     for(const name of strategies){
      const found=ranked[name].find(f=>f.values.includes(value));
      matches[name]=found?.rank||null;
     }
     const exact=findAuxPaths(board,value);
     const entry={date,turn,jur,head,value,mode,
      candidates:view.ranks[3].length,
      exactRoutes:exact.length,
      matches,
      topCount:Object.fromEntries(strategies.map(name=>
       [name,ranked[name].slice(0,10).length]))
     };
     audit.push(entry);
     if(date==='2026-10-22'&&labels.some(e=>
      e.turn===turn&&e.jur===jur&&e.head===head)){
      const best=view.ranks[3].find(f=>f.values.includes(value));
      const top10=view.ranks[3].slice(0,10);
      diagnostic.push({
       ...entry,
       baseFeatures:best?{
        family:best.family,rank:best.rank,roots:best.roots,
        d1:best.d1,d7:best.d7,paths:best.paths,
        sources:best.sources,crossing:best.crossing
       }:null,
       top10Features:top10.map(f=>({
        family:f.family,rank:f.rank,roots:f.roots,
        d1:f.d1,d7:f.d7,paths:f.paths,
        sources:f.sources,crossing:f.crossing
       })),
       exactPhysical:exact.map(p=>p.map(c=>({
        row:c.row,col:c.col,digit:c.digit,source:c.source
       }))),
       rootWitnesses:history.flatMap(h=>h.aux.events[3].map(e=>({
        period:h.period,sourceDate:h.sourceDate||h.date,
        date:h.date,turn:e.turn,jur:e.jur,head:e.head,
        paths:e.paths.length
       })))
     });
     }
    }
   }
  }
  console.log('VT3_DIA_PROCESADO',date,'filas',audit.filter(e=>e.date===date).length);
 }
 const samples=audit.filter(e=>e.date<='2026-10-21');
 const summary:any[]=[];
 for(const mode of modes)for(const name of strategies){
  const pool=samples.filter(e=>e.mode===mode);
  const late=pool.filter(e=>['Vespertino','Nocturno'].includes(e.turn));
  const mid=pool.filter(e=>e.date<='2026-10-10');
  const last=pool.filter(e=>e.date>='2026-10-12');
  const stats=(rows:typeof pool,top:number,onlyExact=false)=>
   rows.filter(e=>e.matches[name]!==null&&e.matches[name]<=top&&
    (!onlyExact||e.exactRoutes>0)).length;
  summary.push({mode,strategy:name,total:pool.length,
   t3:stats(pool,3),t5:stats(pool,5),t10:stats(pool,10),
   physicalT3:stats(pool,3,true),
   physicalT5:stats(pool,5,true),physicalT10:stats(pool,10,true),
   formable:pool.filter(e=>e.exactRoutes>0).length,
   lateTop10:stats(late,10),latePhysicalTop10:stats(late,10,true),
   firstDays:mid.length,firstT10:stats(mid,10),firstPhysicalT10:stats(mid,10,true),
   lastDays:last.length,lastT10:stats(last,10),lastPhysicalT10:stats(last,10,true)});
 }
 const target=audit.filter(e=>e.date==='2026-10-22');
 const targetStats=summary.map(s=>{
  const rows=target.filter(e=>e.mode===s.mode);
  return {mode:s.mode,strategy:s.strategy,
   total:rows.length,t3:rows.filter(e=>e.matches[s.strategy]!==null&&e.matches[s.strategy]<=3).length,
   t5:rows.filter(e=>e.matches[s.strategy]!==null&&e.matches[s.strategy]<=5).length,
   t10:rows.filter(e=>e.matches[s.strategy]!==null&&e.matches[s.strategy]<=10).length,
   physicalT10:rows.filter(e=>e.exactRoutes>0&&e.matches[s.strategy]!==null&&e.matches[s.strategy]<=10).length};
 });
 const out='auditorias/22oct2026-motores/profundizacion';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/diagnostico-5-vt3.json',JSON.stringify(diagnostic,null,2));
 fs.writeFileSync(out+'/retrospectiva-vt3.json',JSON.stringify({summary,targetStats},null,2));
 fs.writeFileSync(out+'/casos-individuales.json',JSON.stringify(audit,null,2));
 console.log('VT3_RESUMEN_PREVIO',JSON.stringify(summary));
 console.log('VT3_REPLAY_22',JSON.stringify(targetStats));
 console.log('VT3_DIAGNOSTICO_22',JSON.stringify(diagnostic.map(x=>({
  turn:x.turn,head:x.head,mode:x.mode,exactRoutes:x.exactRoutes,
  rank:x.baseFeatures?.rank,base:x.baseFeatures,
  relativeRanks:x.matches,top10:x.top10Features.slice(0,5)
 }))));
}
void main().catch(e=>{console.error('VT3_STUDY_ERROR',e);process.exitCode=1});
