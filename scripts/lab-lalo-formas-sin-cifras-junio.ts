/**
 * Segunda prueba de movimiento visual puro: misma firma de forma entre
 * columnas del día, IGNORANDO los dígitos/familia VT3 que ocupan la figura.
 * Cada trayectoria sigue íntegramente DENTRO de su columna; jamás se
 * dibuja ni infiere un camino cruzando dos columnas.
 * Compara solo rutas +11 generadas desde raíces históricas existentes PRE.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloHistorical,LaloView,LaloRoute} from '../src/motorLalo';
import type {Path} from '../src/paths';

const modes=['BASE','ECO_FORMA','CAMINA_1_2','ECOS_2_COLUMNAS','D1_ECO','D1_ORIGINAL'] as const;
type Mode=typeof modes[number];
const sources=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const memory=new Map<string,Promise<CabezasDia>>();
const fetchDay=(d:string)=>{
 if(!memory.has(d))memory.set(d,descargarCabezas(d,true));
 return memory.get(d)!;
};
const shape=(p:Path)=>{
 const mr=Math.min(...p.map(c=>c.row)),mc=Math.min(...p.map(c=>c.col));
 const normalized=p.map(c=>(c.row-mr)+':'+(c.col-mc)).join('>');
 const reverse=[...p].reverse().map(c=>(c.row-mr)+':'+(c.col-mc)).join('>');
 return [normalized,reverse].sort()[0];
};
const anchor=(p:Path)=>Math.min(...p.map(c=>c.row));
type Echo={
 echo:boolean,walk:boolean,echo2:boolean,echoCount:number,
 latestPaths:number,previousShapes:number,matchedShapes:string[],
 exampleMoves:string[]
};
function evaluate(f:LaloFamily,all:LaloFamily[],idx:number):Echo{
 const now=sources[idx];
 const latest=f.paths.filter(x=>x.sourceId===now);
 const reference=all.filter(x=>x.family!==f.family).flatMap(x=>x.paths);
 const prev=reference.filter(x=>x.sourceId===sources[idx-1]);
 const older=reference.filter(x=>sources.indexOf(x.sourceId)<idx&&
  sources.indexOf(x.sourceId)>=0);
 const matched=latest.flatMap(x=>prev.filter(y=>shape(y.path)===shape(x.path))
  .map(y=>({shape:shape(x.path),from:anchor(y.path),to:anchor(x.path)})));
 const anyEarlier=latest.flatMap(x=>older.filter(y=>shape(y.path)===shape(x.path))
  .map(y=>({shape:shape(x.path),source:y.sourceId,
   from:anchor(y.path),to:anchor(x.path)})));
 const sourcesWithEcho=[...new Set(anyEarlier.map(x=>x.source))];
 return {echo:matched.length>0,walk:matched.some(x=>Math.abs(x.from-x.to)>0&&
   Math.abs(x.from-x.to)<=2),
  echo2:sourcesWithEcho.length>=2,echoCount:anyEarlier.length,
  latestPaths:latest.length,previousShapes:prev.length,
  matchedShapes:[...new Set(anyEarlier.map(x=>x.shape))],
  exampleMoves:anyEarlier.slice(0,5).map(x=>
   x.source+' '+x.from+'→'+now+' '+x.to)
 };
}
function order(view:LaloView,mode:Mode,idx:number){
 const old=view.ranks.vt3;
 if(mode==='BASE')return old;
 const ranking=old.slice(0,10).map(f=>{
  const feat=evaluate(f,old,idx);
  const w=mode==='ECO_FORMA'?[Number(f.branchBlocks>0),Number(feat.echo)]:
    mode==='CAMINA_1_2'?[Number(f.branchBlocks>0),Number(feat.walk)]:
    mode==='ECOS_2_COLUMNAS'?[Number(f.branchBlocks>0),Number(feat.echo2)]:
    mode==='D1_ECO'?[Number(f.branchBlocks>0),f.d1Roots,Number(feat.echo),
      f.branchBlocks,f.d7Roots,f.sourceCount,f.physicalBlocks]:
    [Number(f.branchBlocks>0),f.d1Roots,f.branchBlocks,
      f.d7Roots,f.sourceCount,f.physicalBlocks];
  return {f,w};
 });
 ranking.sort((a,b)=>{
  for(let i=0;i<a.w.length;i++)if(a.w[i]!==b.w[i])return b.w[i]-a.w[i];
  return a.f.rank-b.f.rank;
 });
 return [...ranking.map(x=>x.f),...old.slice(10)].map((f,i)=>({...f,rank:i+1}));
}
const period=(d:string)=>d.startsWith('2026-06')?'JUNIO':
 d.startsWith('2026-07')?'JULIO':
 d.startsWith('2026-08')?'AGOSTO':
 d.startsWith('2026-09')?'SEPTIEMBRE':'OCTUBRE';
async function main(){
 const hits:any[]=[],families:any[]=[],cutSummary:any[]=[];
 for(let date='2026-06-01';date<='2026-06-30';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const prior=previousDrawDay(date),prior2=previousDrawDay(prior);
  const week=shiftDay(date,-7),weekBefore=previousDrawDay(week);
  const [today,yesterday,older,lastWeek,weekOld]=await Promise.all([
   fetchDay(date),fetchDay(prior),fetchDay(prior2),fetchDay(week),fetchDay(weekBefore)
  ]);
  const historical:LaloHistorical[]=[
   {date:prior,period:'D−1',sheet:buildSheet(yesterday,older)},
   {date:week,period:'D−7',sheet:buildSheet(lastWeek,weekOld)}
  ];
  for(const [idx,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const t of TURNOS.slice(0,idx))pre[t]={...today[t]};
   const current=buildSheet(pre,yesterday);
   const view=buildMotorLalo(current,date,turn,historical);
   const ranks=Object.fromEntries(modes.map(mode=>[
    mode,order(view,mode,idx)
   ])) as Record<Mode,LaloFamily[]>;
   const baseTop10=view.ranks.vt3.slice(0,10).map(f=>f.family).sort().join('|');
   for(const mode of modes){
    if(ranks[mode].slice(0,10).map(f=>f.family).sort().join('|')!==baseTop10)
      throw Error('Top10 cambió '+date+' '+turn+' '+mode);
   }
   for(const f of view.ranks.vt3.slice(0,10)){
    families.push({date,turn,family:f.family,baseline:f.rank,
     shapeEcho:evaluate(f,view.ranks.vt3,idx),
     ranks:Object.fromEntries(modes.map(mode=>[
      mode,ranks[mode].find(x=>x.family===f.family)?.rank||null
     ]))});
   }
   cutSummary.push({date,turn,candidates:view.ranks.vt3.length});
   for(const jur of JURS){
    const head=today[turn]?.[jur]||'';
    if(!/^\d{4}$/.test(head))continue;
    const family=reversibleFamily(head.slice(-3));
    const rank=Object.fromEntries(modes.map(mode=>[
     mode,ranks[mode].find(x=>x.family===family)?.rank||null
    ]));
    const physical=view.ranks.vt3.find(x=>x.family===family)||null;
    hits.push({date,turn,jur,head,family,period:period(date),rank,
     hasCandidate:!!physical,
     echo:physical?evaluate(physical,view.ranks.vt3,idx):null});
   }
  }
  console.log('MOVIMIENTO_FORMA_DIA',date);
 }
 const summary:any[]=[];
 for(const block of ['JUNIO','TOTAL']){
  const pool=hits.filter(x=>block==='TOTAL'||x.period===block);
  for(const mode of modes){
   const successes=(top:number)=>pool.filter(x=>x.rank[mode]!==null&&
    x.rank[mode]<=top);
   const newW=pool.filter(x=>(x.rank.BASE===null||x.rank.BASE>3)&&
    x.rank[mode]!==null&&x.rank[mode]<=3);
   const lostW=pool.filter(x=>x.rank.BASE!==null&&x.rank.BASE<=3&&
    (x.rank[mode]===null||x.rank[mode]>3));
   summary.push({block,mode,heads:pool.length,
    top3:successes(3).length,top5:successes(5).length,
    top10:successes(10).length,
    gain3:newW.length,loss3:lostW.length,
    gains:newW.map(x=>({date:x.date,turn:x.turn,jur:x.jur,
      head:x.head,from:x.rank.BASE,to:x.rank[mode]})),
    losses:lostW.map(x=>({date:x.date,turn:x.turn,jur:x.jur,
      head:x.head,from:x.rank.BASE,to:x.rank[mode]}))}
   );
  }
 }
 const prevalence:any[]=[];
 for(const block of ['JUNIO','TOTAL']){
  const xs=families.filter(x=>block==='TOTAL'||period(x.date)===block);
  const won=hits.filter(x=>(block==='TOTAL'||x.period===block)&&x.rank.BASE!==null&&x.rank.BASE<=10);
  for(const key of ['echo','walk','echo2'] as const){
   const yes=xs.filter(x=>x.shapeEcho[key]),no=xs.filter(x=>!x.shapeEcho[key]);
   const allWon=(bucket:typeof xs)=>won.filter(x=>
    bucket.some(f=>f.date===x.date&&f.turn===x.turn&&f.family===x.family)).length;
   prevalence.push({block,feature:key,yes:{exposure:yes.length,hits:allWon(yes)},
    no:{exposure:no.length,hits:allWon(no)}});
  }
 }
 const out='auditorias/lalo-figuras-transiciones-24oct/control-junio';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/resumen.json',JSON.stringify(summary,null,2));
 fs.writeFileSync(out+'/candidatos-figuras.json',JSON.stringify(families,null,2));
 fs.writeFileSync(out+'/cabezas.json',JSON.stringify(hits,null,2));
 fs.writeFileSync(out+'/prevalencias.json',JSON.stringify(prevalence,null,2));
 console.log('CONTROL_JUNIO_FORMAS_RESUMEN',JSON.stringify(summary.map(x=>({
  block:x.block,mode:x.mode,heads:x.heads,top3:x.top3,
  top5:x.top5,top10:x.top10,gain3:x.gain3,loss3:x.loss3
 }))));
 console.log('CONTROL_JUNIO_FORMAS_ECOS',JSON.stringify(prevalence));
 console.log('CONTROL_JUNIO_FORMAS_CAMBIOS',JSON.stringify(summary.filter(x=>
  x.block==='TOTAL'&&x.mode!=='BASE').map(x=>({
   mode:x.mode,gains:x.gains,losses:x.losses
 }))));
 console.log('CONTROL_JUNIO_FORMAS_TOTAL',{cuts:cutSummary.length,heads:hits.length});
}
void main().catch(e=>{console.error('CONTROL_JUNIO_FORMAS_ERROR',e);process.exitCode=1});
