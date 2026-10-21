/**
 * Cotejo de la jornada completa 20/10/2026 con Modelo Lalo MV1 y tres
 * lectores existentes, respetando el protocolo PRE. SÓLO auditoría.
 * Los tops reconstruidos NO son pronósticos sellados.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {DailySheet,SourceId} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical,LaloKind} from '../src/motorLalo';
import {buildVt3Shadow,allPhysicalVt3} from '../src/vt3Shadow';
import {buildVt3Trial} from '../src/vt3Trial';
import {buildConnectedVt3} from '../src/connectedVt3';
import {findPaths} from '../src/paths';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';

const JUR=JURS.filter(j=>j!=='Montevideo');
const days=[
 '02','03','05','06','07','08','09','10','12','13','14','15','16','17','19','20'
].map(d=>'2026-10-'+d);
const start='2026-10-12';
const key=(x:{row:number;col:number})=>x.row+':'+x.col;
const valid=(head:string)=>/^[0-9]{4}$/.test(head);
const historicalDate=(date:string)=>{const d=new Date(date+'T12:00:00Z');
 d.setUTCDate(d.getUTCDate()-7);return d.toISOString().slice(0,10)};
const rankOf=(families:string[],target:string)=>{
 const n=families.indexOf(target);return n<0?null:n+1;
};
type Row={date:string;turn:Turno;jur:string;head:string;
 family2:string;family3:string;physical:Record<LaloKind,any>;
 ranks:Record<string,number|null>;admitted:boolean;rootless:boolean;
 evidence:any;historyD7:any[]};
type Snapshot={date:string;turn:Turno;rows:Row[];
 availableSources:SourceId[];tops:Record<string,string[]>;
 roots:number;admittedFamilies:number;physicalFamilies:number;
 geometryAvailable:number;connectedAvailable:number;
 stats:Record<string,number>};
function physicalFamilies(pre:DailySheet,turn:Turno){
 const index=TURNOS.indexOf(turn),out=new Map<string,{family:string;paths:{
  source:SourceId;value:string;cells:string[]}[]}>();
 for(const col of pre.columns.slice(0,index+1))
  for(const route of allPhysicalVt3(col.values)){
   const value=route.map(x=>x.digit).join(''),family=reversibleFamily(value);
   const item=out.get(family)||{family,paths:[]};
   item.paths.push({source:col.id,value,cells:route.map(key)});
   out.set(family,item);
  }
 return out;
}
const countHit=(rows:Row[],method:string,k:number)=>
 rows.filter(r=>r.ranks[method]!==null&&r.ranks[method]!<=k).length;
const stats=(rows:Row[])=>{
 const z:Record<string,number>={heads:rows.length,
  physicalVT2:rows.filter(x=>x.physical.vt2.length).length,
  physicalVT3:rows.filter(x=>x.physical.vt3.length).length,
  physicalVT4:rows.filter(x=>x.physical.vt4.length).length,
  officialVT4exactTop6:rows.filter(x=>x.ranks.LaloVT4!==null&&x.ranks.LaloVT4!<=6).length
 };
 for(const model of ['LaloVT2','LaloVT3','GeometriaVT3','NuevaPruebaVT3','ConectadasVT3'])
  for(const k of [3,5,6,10])z[model+'Top'+k]=countHit(rows,model,k);
 return z;
};
async function main(){
 const store=new Map<string,CabezasDia>(),errors:Record<string,string>={};
 for(const date of days){
  try{const res=await descargarCabezas(date,true);store.set(date,res);
   if(date>='2026-10-19')console.log('FUENTE_20OCT',JSON.stringify({
    date,heads:Object.fromEntries(TURNOS.map(t=>[t,Object.fromEntries(JURS.map(j=>[j,res[t][j]]))]))
   }));
  }catch(e){errors[date]=String(e)}
 }
 const validDays=days.filter(d=>store.has(d)&&hasDrawResults(store.get(d)!)&&hasNocturnoBase(store.get(d)!));
 const target='2026-10-20',current=store.get(target);
 if(!current)throw Error('Falta objetivo 20oct');
 const coverage=TURNOS.map(turn=>({turn,headCount:JUR.filter(j=>valid(current[turn][j])).length,
  values:Object.fromEntries(JUR.map(j=>[j,current[turn][j]]))}));
 if(coverage.some(c=>c.headCount!==5))
  throw Error('Jornada 20oct incompleta: '+JSON.stringify(coverage));
 const sheets=new Map<string,DailySheet>();
 for(let i=1;i<validDays.length;i++)
  sheets.set(validDays[i],buildSheet(store.get(validDays[i])!,store.get(validDays[i-1])!));
 const snapshots:Snapshot[]=[];
 for(let i=2;i<validDays.length;i++){
  const date=validDays[i];
  if(date<start)continue;
  const previous=validDays[i-1],weekly=historicalDate(date);
  const historical:LaloHistorical[]=[
   {date:previous,period:'D−1',sheet:sheets.get(previous)!},
   ...(sheets.has(weekly)?[{date:weekly,period:'D−7' as const,sheet:sheets.get(weekly)!}]:[])
  ];
  const prev6=validDays.slice(Math.max(1,i-6),i)
   .map(date=>({date,sheet:sheets.get(date)!}));
  const whole=buildSheet(store.get(date)!,store.get(previous)!);
  for(const turn of TURNOS){
   const index=TURNOS.indexOf(turn);
   const pre=preSheetAtCut(whole,turn,index);
   if(pre.heads[turn]?.length||pre.matches[turn]?.length)
    throw Error('FUGA: target visible en PRE '+date+' '+turn);
   for(let n=index+1;n<pre.columns.length;n++)
    if(pre.columns[n].values.some(x=>x!=='--'))throw Error('FUGA: columna posterior visible');
   const view=buildMotorLalo(pre,date,turn,historical);
   const geo=buildVt3Shadow(pre,date,turn,historical,view);
   const trial=buildVt3Trial(view,geo);
   const connected=buildConnectedVt3(pre,date,turn,prev6);
   const physical=physicalFamilies(pre,turn);
   const tops={
    LaloVT2:view.ranks.vt2.slice(0,10).map(x=>x.family),
    LaloVT3:view.ranks.vt3.slice(0,10).map(x=>x.family),
    GeometriaVT3:geo.top.map(x=>x.family),
    NuevaPruebaVT3:trial.top.map(x=>x.family),
    ConectadasVT3:connected.top.map(x=>x.family),
    LaloVT4:view.ranks.vt4.slice(0,10).map(x=>x.family)
   };
   const rows:Row[]=JUR.flatMap(jur=>{
    const head=store.get(date)![turn][jur];if(!valid(head))return [];
    const f2=reversibleFamily(head.slice(-2)),f3=reversibleFamily(head.slice(-3));
    const paths2=pre.columns.slice(0,index+1).flatMap(col=>{
     const paths=[...findPaths(col.values,head.slice(-2)),
      ...findPaths(col.values,[...head.slice(-2)].reverse().join(''))];
     return paths.map(p=>({source:col.id,cells:p.map(key)}));
    });
    const paths3=physical.get(f3)?.paths||[];
    const paths4=pre.columns.slice(0,index+1).flatMap(col=>
     findPaths(col.values,head).map(p=>({source:col.id,cells:p.map(key)})));
    const original=view.ranks.vt3.find(x=>x.family===f3);
    const v4rank=view.ranks.vt4.find(x=>x.paths.some(p=>p.value===head))?.rank??null;
    const physical3=paths3.length>0;
    const previousWeek=historical.find(x=>x.period==='D−7');
    const historicWins=previousWeek?TURNOS.flatMap(t=>
     (previousWeek.sheet.matches[t]||[]).filter(m=>m.jurisdiccion!=='Montevideo'&&
      m.hits.some(h=>h.kind==='vt3'&&reversibleFamily(h.value)===f3))
      .map(m=>({turn:t,jur:m.jurisdiccion,head:m.cabeza,
       sources:m.hits.filter(h=>h.kind==='vt3'&&reversibleFamily(h.value)===f3)
        .map(h=>h.sourceId)}))):[];
    const ranks={
     LaloVT2:rankOf(tops.LaloVT2,f2),
     LaloVT3:rankOf(tops.LaloVT3,f3),
     GeometriaVT3:rankOf(tops.GeometriaVT3,f3),
     NuevaPruebaVT3:rankOf(tops.NuevaPruebaVT3,f3),
     ConectadasVT3:rankOf(tops.ConectadasVT3,f3),
     LaloVT4:v4rank
    };
    return [{date,turn,jur,head,family2:f2,family3:f3,
     physical:{vt2:paths2,vt3:paths3,vt4:paths4},ranks,
     admitted:!!original,rootless:physical3&&!original,
     evidence:original?{rank:original.rank,d1Roots:original.d1Roots,d7Roots:original.d7Roots,
      directRoots:original.directRoots,sourceCount:original.sourceCount,
      branches:original.branchBlocks,blocks:original.physicalBlocks,
      paths:original.paths.slice(0,12).map(p=>({source:p.sourceId,origin:p.origin,
       value:p.value,rootIds:p.rootIds,route:p.path.map(key)}))}:null,
     historyD7:historicWins
    }];
   });
   const item:Snapshot={date,turn,rows,
    availableSources:pre.columns.slice(0,index+1).map(x=>x.id),
    tops,roots:view.roots.length,admittedFamilies:view.ranks.vt3.length,
    physicalFamilies:physical.size,geometryAvailable:geo.availableFamilies,
    connectedAvailable:connected.availableFamilies,
    stats:stats(rows)};
   snapshots.push(item);
   if(date==='2026-10-20')console.log('CORTE_LALO_20OCT',JSON.stringify({
    date,turn,stats:item.stats,roots:item.roots,
    physicalFamilies:item.physicalFamilies,admittedFamilies:item.admittedFamilies,
    top6:Object.fromEntries(Object.entries(tops).map(([k,v])=>[k,v.slice(0,6)])),
    physicalVT3:rows.filter(x=>x.physical.vt3.length).map(x=>({
     jur:x.jur,head:x.head,family:x.family3,ranks:x.ranks,
     paths:x.physical.vt3,official:x.evidence,historyD7:x.historyD7
    })),
    vt4Formable:rows.filter(x=>x.physical.vt4.length).map(x=>({
     jur:x.jur,head:x.head,ranks:x.ranks,mother:x.family3,paths:x.physical.vt4}))
   }));
  }
 }
 const daily=[...new Set(snapshots.map(s=>s.date))].map(date=>{
  const items=snapshots.filter(x=>x.date===date),rows=items.flatMap(x=>x.rows);
  return {date,turns:items.length,stats:stats(rows),cuts:items.map(x=>({
   turn:x.turn,stats:x.stats}))};
 });
 const today=snapshots.filter(s=>s.date===target);
 const all=today.flatMap(x=>x.rows),targets=all.filter(x=>x.physical.vt3.length);
 const notTop6=targets.filter(x=>x.ranks.LaloVT3===null||x.ranks.LaloVT3>6);
 const sourceCandidates={
  cold:targets.filter(x=>x.rootless),
  admittedBehindTop6:targets.filter(x=>x.ranks.LaloVT3!==null&&x.ranks.LaloVT3>6),
  physicallyPossibleButNotTop6:notTop6,
  vt4WithWitnessNoTop6:all.filter(x=>x.physical.vt4.length&&
   (x.ranks.LaloVT4===null||x.ranks.LaloVT4>6))
 };
 const summary={date:target,complete:coverage.every(c=>c.headCount===5),
  previous:validDays[validDays.indexOf(target)-1],
  d7:historicalDate(target),coverage,errors,
  summary:stats(all),byTurn:today.map(s=>({turn:s.turn,stats:s.stats})),
  byDay:daily.map(x=>({date:x.date,stats:x.stats})),
  heads:all.map(x=>({turn:x.turn,jur:x.jur,head:x.head,
   familyVT2:x.family2,familyVT3:x.family3,ranks:x.ranks,
   vt2:!!x.physical.vt2.length,vt3:!!x.physical.vt3.length,
   vt4:!!x.physical.vt4.length,vt3Admitted:x.admitted})),
  frontier:Object.fromEntries(Object.entries(sourceCandidates).map(([kind,rows])=>[
   kind,rows.map(x=>({turn:x.turn,jur:x.jur,head:x.head,family:x.family3,
    sources:[...new Set(x.physical.vt3.map((p:any)=>p.source))],
    pathsVT3:x.physical.vt3,ranks:x.ranks,official:x.evidence,weekly:x.historyD7}))
  ]))};
 console.log('RESUMEN_LALO_20OCT',JSON.stringify(summary));
 if(daily.find(x=>x.date==='2026-10-19')?.stats.physicalVT3!==5)
  throw Error('Invariante: 19oct tuvo 5 cabezas VT3 formables, no coincide: '+
   JSON.stringify(daily.find(x=>x.date==='2026-10-19')?.stats));
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/cotejo-lalo-20oct2026.json',JSON.stringify({
  description:'Cotejo PRE reconstruido sin leakage del 20oct. No fue pronóstico sellado',
  date:target,validDays,daily,snapshots,summary},null,2));
}
void main().catch(e=>{console.error('ERROR_LALO_20OCT',e);process.exitCode=1});
