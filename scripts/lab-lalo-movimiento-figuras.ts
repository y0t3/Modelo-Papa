/**
 * Estudio de movimiento de figuras en la hoja +11 de Lalo.
 * No crea familias ni cruza columnas: compara firmas geométricas entre
 * las columnas YA reveladas antes del objetivo. Solo reordena Top10 VT3.
 *
 * Hipótesis predefinidas:
 * - BASE: orden Lalo.
 * - D1: bifurcación > raíces D−1 > bifurcaciones (referencia previa).
 * - PUENTE: bifurcación > misma forma en fuente nueva y previa > BASE.
 * - PERSISTE: bifurcación > familia vista en >=2 fuentes > BASE.
 * - NACE: bifurcación > solo fuente recién disponible > BASE.
 * - ULTIMA: bifurcación > ruta en nueva fuente > BASE.
 * - CAMINA: bifurcación > misma forma trasladada 1-2 filas entre
 *   fuente nueva y anterior > BASE.
 * NO se mira salida del turno objetivo para crear features.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloHistorical} from '../src/motorLalo';
import type {Path} from '../src/paths';

const first='2026-07-01',last='2026-10-23';
const strategies=['BASE','D1','PUENTE','PERSISTE','NACE','ULTIMA','CAMINA'] as const;
type Method=typeof strategies[number];
const memo=new Map<string,Promise<CabezasDia>>();
const get=(date:string)=>{
 if(!memo.has(date))memo.set(date,descargarCabezas(date,true));
 return memo.get(date)!;
};
const colOrder=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
function shape(path:Path){
 const minRow=Math.min(...path.map(x=>x.row));
 const minCol=Math.min(...path.map(x=>x.col));
 const forward=path.map(x=>(x.row-minRow)+':'+(x.col-minCol)).join('>');
 const backward=[...path].reverse().map(x=>(x.row-minRow)+':'+(x.col-minCol)).join('>');
 return [forward,backward].sort()[0];
}
type Feature={
 latestSupport:boolean;onlyLatest:boolean;persist:boolean;
 bridge:boolean;walk:boolean;newPaths:number;priorPaths:number;
 bridgePairs:number;branchLatest:number;allSources:string[];
};
function features(f:LaloFamily,turnIndex:number):Feature{
 const latest=colOrder[turnIndex],prev=colOrder[turnIndex-1]||'';
 const ls=f.paths.filter(p=>p.sourceId===latest);
 const older=f.paths.filter(p=>p.sourceId!==latest);
 const ps=f.paths.filter(p=>p.sourceId===prev);
 // Comparar huellas NO leer dígitos futuros: todos los caminos ya eran PRE.
 const shared=ls.flatMap(a=>ps.filter(b=>shape(a.path)===shape(b.path))
  .map(b=>({
   aRow:Math.min(...a.path.map(x=>x.row)),
   bRow:Math.min(...b.path.map(x=>x.row))
  })));
 return {latestSupport:ls.length>0,onlyLatest:turnIndex>0&&ls.length>0&&older.length===0,
  persist:f.sourceCount>=2,bridge:shared.length>0,
  walk:shared.some(x=>Math.abs(x.aRow-x.bRow)>=1&&
   Math.abs(x.aRow-x.bRow)<=2),
  bridgePairs:shared.length,newPaths:ls.length,priorPaths:older.length,
  branchLatest:ls.filter(p=>p.origin==='BIFURCACIÓN').length,
  allSources:[...new Set(f.paths.map(p=>p.sourceId))].sort()};
}
function ordered(original:LaloFamily[],method:Method,turnIndex:number){
 if(method==='BASE')return original;
 const pool=original.slice(0,10);
 const scored=pool.map(f=>{
  const feat=features(f,turnIndex);
  const w=method==='D1'?[
    Number(f.branchBlocks>0),f.d1Roots,f.branchBlocks,
    f.d7Roots,f.sourceCount,f.physicalBlocks
   ]:method==='PUENTE'?[
    Number(f.branchBlocks>0),Number(feat.bridge)
   ]:method==='PERSISTE'?[
    Number(f.branchBlocks>0),Number(feat.persist)
   ]:method==='NACE'?[
    Number(f.branchBlocks>0),Number(feat.onlyLatest)
   ]:method==='ULTIMA'?[
    Number(f.branchBlocks>0),Number(feat.latestSupport)
   ]:[
    Number(f.branchBlocks>0),Number(feat.walk)
   ];
  return {f,weight:w};
 });
 scored.sort((a,b)=>{
  for(let i=0;i<Math.max(a.weight.length,b.weight.length);i++)
   if(a.weight[i]!==b.weight[i])return b.weight[i]-a.weight[i];
  return a.f.rank-b.f.rank;
 });
 return [...scored.map(x=>x.f),...original.slice(10)]
  .map((f,i)=>({...f,rank:i+1}));
}
const period=(d:string)=>d<='2026-07-31'?'JULIO':
 d<='2026-08-31'?'AGOSTO':d<='2026-09-30'?'SEPTIEMBRE':'OCTUBRE';
async function main(){
 const rows:any[]=[],candidateRows:any[]=[],cuts:any[]=[];
 for(let date=first;date<=last;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const d1=previousDrawDay(date),d1prev=previousDrawDay(d1);
  const d7=shiftDay(date,-7),d7prev=previousDrawDay(d7);
  const [today,old,old2,week,week2]=await Promise.all([
   get(date),get(d1),get(d1prev),get(d7),get(d7prev)
  ]);
  const hist:LaloHistorical[]=[
   {date:d1,period:'D−1',sheet:buildSheet(old,old2)},
   {date:d7,period:'D−7',sheet:buildSheet(week,week2)}
  ];
  for(const [turnIdx,turn] of TURNOS.entries()){
   const current=diaVacio();
   for(const t of TURNOS.slice(0,turnIdx))current[t]={...today[t]};
   const currentSheet=buildSheet(current,old);
   const view=buildMotorLalo(currentSheet,date,turn,hist,'ORIGINAL');
   const ranked=Object.fromEntries(strategies.map(s=>
    [s,ordered(view.ranks.vt3,s,turnIdx)])) as Record<Method,LaloFamily[]>;
   const originalMothers=view.ranks.vt3.slice(0,10).map(f=>f.family).sort().join('|');
   for(const method of strategies){
    const mothers=ranked[method].slice(0,10).map(f=>f.family).sort().join('|');
    if(mothers!==originalMothers)throw Error('Change Top10 '+date+turn+method);
   }
   const snapshot:any={date,turn,sourceCount:turnIdx+1,
    families:view.ranks.vt3.length,top10:[]};
   for(const f of view.ranks.vt3.slice(0,10)){
    const feat=features(f,turnIdx);
    const ranks=Object.fromEntries(strategies.map(s=>
     [s,ranked[s].find(x=>x.family===f.family)?.rank||null]));
    candidateRows.push({date,turn,family:f.family,ranks,
     branchBlocks:f.branchBlocks,d1:f.d1Roots,d7:f.d7Roots,
     sources:f.sourceCount,paths:f.paths.length,...feat});
    snapshot.top10.push({family:f.family,ranks,features:feat});
   }
   cuts.push(snapshot);
   for(const jur of JURS){
    const head=today[turn]?.[jur]||'';
    if(!/^\d{4}$/.test(head))continue;
    const family=reversibleFamily(head.slice(-3));
    const inside=ranked.BASE.find(x=>x.family===family)||null;
    const ranks={} as Record<Method,number|null>;
    for(const method of strategies)
     ranks[method]=ranked[method].find(x=>x.family===family)?.rank||null;
    rows.push({date,turn,jur,head,family,period:period(date),
     possibleFamily:inside!==null,
     originalRank:inside?.rank||null,
     originalFeature:inside?features(inside,turnIdx):null,
     rank:ranks
    });
   }
  }
  console.log('MOVIMIENTO_DIA',date,'heads',rows.filter(x=>x.date===date).length);
 }
 const summarized:any[]=[];
 for(const block of ['JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','TOTAL'])
  for(const method of strategies){
   const cases=rows.filter(x=>block==='TOTAL'||x.period===block);
   const win=(m:Method,limit:number)=>cases.filter(x=>
    x.rank[m]!==null&&x.rank[m]<=limit);
   const gained=cases.filter(x=>(x.rank.BASE===null||x.rank.BASE>3)&&
    x.rank[method]!==null&&x.rank[method]<=3);
   const lost=cases.filter(x=>x.rank.BASE!==null&&x.rank.BASE<=3&&
    (x.rank[method]===null||x.rank[method]>3));
   summarized.push({block,method,heads:cases.length,
    baseT3:win('BASE',3).length,top3:win(method,3).length,
    top5:win(method,5).length,top10:win(method,10).length,
    gain3:gained.length,loss3:lost.length,
    wins3:win(method,3).map(x=>({date:x.date,turn:x.turn,
     jur:x.jur,head:x.head,rank:x.rank[method]})),
    gained:gained.map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head,
     before:x.rank.BASE,after:x.rank[method]})),
    lost:lost.map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head,
     before:x.rank.BASE,after:x.rank[method]}))
   });
  }
 const featureReport:any[]=[];
 for(const block of ['JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','TOTAL']){
  const pool=candidateRows.filter(x=>block==='TOTAL'||period(x.date)===block);
  for(const feat of ['bridge','persist','onlyLatest','latestSupport','walk'] as const){
   const good=pool.filter(x=>x[feat]),bad=pool.filter(x=>!x[feat]);
   const counters=(group:typeof pool)=>({
    exposure:group.length,
    top10Hits:rows.filter(x=>
     (block==='TOTAL'||x.period===block)&&x.rank.BASE!==null&&x.rank.BASE<=10&&
     group.some(y=>y.date===x.date&&y.turn===x.turn&&y.family===x.family)
    ).length
   });
   featureReport.push({block,feat,true:counters(good),false:counters(bad)});
  }
 }
 const folder='auditorias/lalo-figuras-transiciones-24oct/resultados';
 fs.mkdirSync(folder,{recursive:true});
 fs.writeFileSync(folder+'/resumen.json',JSON.stringify(summarized,null,2));
 fs.writeFileSync(folder+'/candidatos-geometria.json',JSON.stringify(candidateRows,null,2));
 fs.writeFileSync(folder+'/cabezas-rankings.json',JSON.stringify(rows,null,2));
 fs.writeFileSync(folder+'/cortes-pre.json',JSON.stringify(cuts,null,2));
 fs.writeFileSync(folder+'/rasgos-por-periodo.json',JSON.stringify(featureReport,null,2));
 console.log('MOVIMIENTO_VT3_RESUMEN',JSON.stringify(summarized.map(x=>({
  block:x.block,method:x.method,heads:x.heads,
  top3:x.top3,top5:x.top5,top10:x.top10,
  gain3:x.gain3,loss3:x.loss3
 }))));
 console.log('MOVIMIENTO_VT3_CAMBIOS',JSON.stringify(summarized.filter(x=>
  x.block==='TOTAL'&&x.method!=='BASE').map(x=>({method:x.method,
   gained:x.gained,lost:x.lost}))));
 console.log('MOVIMIENTO_VT3_RASGOS',JSON.stringify(featureReport));
 console.log('MOVIMIENTO_VT3_CORTES',cuts.length);
}
void main().catch(e=>{console.error('MOVIMIENTO_VT3_ERROR',e);process.exitCode=1});
