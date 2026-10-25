
/** Huella geométrica semanal: una columna a la derecha (NO trazos cruzados). */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloHistorical} from '../src/motorLalo';
import type {Path} from '../src/paths';
import type {DailySheet} from '../src/sheet';

const fields=['BASE','WEEK_RIGHT','WEEK_SAME','DAY_RIGHT','WEEK_RIGHT_D1','D1'] as const;
type Key=typeof fields[number];
const sources=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const cache=new Map<string,Promise<any>>();
const fetchDay=(day:string)=>{
 if(!cache.has(day))cache.set(day,descargarCabezas(day,true));
 return cache.get(day)!;
};
function signature(p:Path){
 const mr=Math.min(...p.map(x=>x.row)),mc=Math.min(...p.map(x=>x.col));
 const direct=p.map(x=>(x.row-mr)+':'+(x.col-mc)).join('>');
 const reverse=[...p].reverse().map(x=>(x.row-mr)+':'+(x.col-mc)).join('>');
 return [direct,reverse].sort()[0];
}
const firstRow=(p:Path)=>Math.min(...p.map(x=>x.row));
type Witness={source:string;sig:string;row:number;id:string};
function winners(sheet:DailySheet,date:string):Witness[]{
 const out=new Map<string,Witness>();
 for(const turn of TURNOS)for(const match of sheet.matches[turn]||[]){
  if(match.jurisdiccion==='Montevideo')continue;
  for(const hit of match.hits){
   if(hit.kind!=='vt3'||!match.cabeza.endsWith(hit.value))continue;
   for(const p of hit.paths){
    const id=[date,turn,match.jurisdiccion,match.cabeza,hit.sourceId,signature(p),firstRow(p)].join('|');
    out.set(id,{id,source:hit.sourceId,sig:signature(p),row:firstRow(p)});
   }
  }
 }
 return [...out.values()];
}
function features(f:LaloFamily,day:Witness[],week:Witness[]){
 const matches=(witnesses:Witness[],delta:number)=>f.paths.some(p=>
  witnesses.some(w=>sources.indexOf(p.sourceId)===sources.indexOf(w.source)+delta&&
   signature(p.path)===w.sig&&Math.abs(firstRow(p.path)-w.row)<=2));
 return {weekRight:matches(week,1),weekSame:matches(week,0),
  dayRight:matches(day,1)};
}
function rerank(pool:LaloFamily[],method:Key,day:Witness[],week:Witness[]){
 if(method==='BASE')return pool;
 const top=pool.slice(0,10).map(f=>{
  const x=features(f,day,week);
  const score=method==='WEEK_RIGHT'?[Number(f.branchBlocks>0),Number(x.weekRight)]:
   method==='WEEK_SAME'?[Number(f.branchBlocks>0),Number(x.weekSame)]:
   method==='DAY_RIGHT'?[Number(f.branchBlocks>0),Number(x.dayRight)]:
   method==='WEEK_RIGHT_D1'?[Number(f.branchBlocks>0),Number(x.weekRight),f.d1Roots]:
    [Number(f.branchBlocks>0),f.d1Roots,f.branchBlocks,
     f.d7Roots,f.sourceCount,f.physicalBlocks];
  return {f,score};
 });
 top.sort((a,b)=>{
  for(let i=0;i<a.score.length;i++)
   if(a.score[i]!==b.score[i])return b.score[i]-a.score[i];
  return a.f.rank-b.f.rank;
 });
 return [...top.map(x=>x.f),...pool.slice(10)].map((f,i)=>({...f,rank:i+1}));
}
async function main(){
 const heads:any[]=[],candidates:any[]=[],cuts:any[]=[];
 for(let date='2026-06-01';date<='2026-10-23';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const prev=previousDrawDay(date),prevPrev=previousDrawDay(prev);
  const week=shiftDay(date,-7),weekPrev=previousDrawDay(week);
  const [actual,day1,day2,week1,week2]=await Promise.all([
   fetchDay(date),fetchDay(prev),fetchDay(prevPrev),fetchDay(week),fetchDay(weekPrev)
  ]);
  const sheetD1=buildSheet(day1,day2),sheetD7=buildSheet(week1,week2);
  const hist:LaloHistorical[]=[
   {date:prev,period:'D−1',sheet:sheetD1},
   {date:week,period:'D−7',sheet:sheetD7}
  ];
  const dayW=winners(sheetD1,prev),weekW=winners(sheetD7,week);
  for(const [idx,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const t of TURNOS.slice(0,idx))pre[t]={...actual[t]};
   const view=buildMotorLalo(buildSheet(pre,day1),date,turn,hist);
   const ordered=Object.fromEntries(fields.map(x=>[
    x,rerank(view.ranks.vt3,x,dayW,weekW)
   ])) as Record<Key,LaloFamily[]>;
   const expected=view.ranks.vt3.slice(0,10).map(x=>x.family).sort().join('|');
   for(const mode of fields)
    if(ordered[mode].slice(0,10).map(x=>x.family).sort().join('|')!==expected)
     throw Error('Top10 cambiado '+date+turn+mode);
   cuts.push({date,turn,candidates:view.ranks.vt3.length,
    d1Witnesses:dayW.length,d7Witnesses:weekW.length});
   for(const f of view.ranks.vt3.slice(0,10)){
    candidates.push({date,turn,family:f.family,features:features(f,dayW,weekW),
     ranks:Object.fromEntries(fields.map(x=>[x,ordered[x].find(y=>y.family===f.family)?.rank||null]))});
   }
   for(const jur of JURS){
    const head=actual[turn]?.[jur]||'';
    if(!/^\d{4}$/.test(head))continue;
    const family=reversibleFamily(head.slice(-3));
    heads.push({date,turn,jur,head,family,period:date.slice(0,7),
     rank:Object.fromEntries(fields.map(x=>[
      x,ordered[x].find(y=>y.family===family)?.rank||null
     ]))});
   }
  }
  console.log('MOVIMIENTO_SEMANAL_DIA',date);
 }
 const results:any[]=[];
 for(const period of ['2026-06','2026-07','2026-08','2026-09','2026-10','TOTAL'])
 for(const method of fields){
  const relevant=heads.filter(x=>period==='TOTAL'||x.period===period);
  const count=(top:number)=>relevant.filter(x=>x.rank[method]!==null&&x.rank[method]<=top).length;
  const gain=relevant.filter(x=>(x.rank.BASE===null||x.rank.BASE>3)&&
   x.rank[method]!==null&&x.rank[method]<=3);
  const loss=relevant.filter(x=>x.rank.BASE!==null&&x.rank.BASE<=3&&
   (x.rank[method]===null||x.rank[method]>3));
  results.push({period,method,examined:relevant.length,
   t3:count(3),t5:count(5),t10:count(10),gained:gain.length,lost:loss.length,
   gains:gain.map(x=>({date:x.date,turn:x.turn,jur:x.jur,
    head:x.head,old:x.rank.BASE,now:x.rank[method]})),
   losses:loss.map(x=>({date:x.date,turn:x.turn,jur:x.jur,
    head:x.head,old:x.rank.BASE,now:x.rank[method]}))});
 }
 const stats:any[]=[];
 for(const feature of ['weekRight','weekSame','dayRight'] as const){
  const yes=candidates.filter(x=>x.features[feature]);
  const no=candidates.filter(x=>!x.features[feature]);
  const wins=heads.filter(x=>x.rank.BASE!==null&&x.rank.BASE<=10);
  const count=(xs:typeof candidates)=>wins.filter(x=>
   xs.some(f=>f.date===x.date&&f.turn===x.turn&&f.family===x.family)).length;
  stats.push({feature,yes:{exposure:yes.length,wins:count(yes)},
   no:{exposure:no.length,wins:count(no)}});
 }
 const folder='auditorias/lalo-figuras-transiciones-24oct/semanas';
 fs.mkdirSync(folder,{recursive:true});
 fs.writeFileSync(folder+'/resumen.json',JSON.stringify(results,null,2));
 fs.writeFileSync(folder+'/candidatos.json',JSON.stringify(candidates,null,2));
 fs.writeFileSync(folder+'/cabezas.json',JSON.stringify(heads,null,2));
 fs.writeFileSync(folder+'/cortes.json',JSON.stringify(cuts,null,2));
 fs.writeFileSync(folder+'/prevalencia.json',JSON.stringify(stats,null,2));
 console.log('SEMANA_FIGURA_RESUMEN',JSON.stringify(results.map(x=>({
  period:x.period,method:x.method,heads:x.examined,
  top3:x.t3,top5:x.t5,top10:x.t10,win:x.gained,loss:x.lost
 }))));
 console.log('SEMANA_FIGURA_RASGOS',JSON.stringify(stats));
 console.log('SEMANA_FIGURA_CAMBIOS',JSON.stringify(results.filter(x=>x.period==='TOTAL'&&x.method!=='BASE')
  .map(x=>({method:x.method,gains:x.gains,losses:x.losses}))));
 console.log('SEMANA_FIGURA_CORTES',cuts.length);
}
void main().catch(e=>{console.error('SEMANA_FIGURA_ERROR',e);process.exitCode=1});
