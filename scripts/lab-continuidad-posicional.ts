/**
 * Cotejo cronológico D−1 + D−7 del MISMO dibujo en las MISMAS celdas.
 *
 * Separa:
 * - memoria anclada a posiciones: raíces que explicaron una cabeza POST real,
 * - control de rutas POST no ganadoras, mismas franjas, misma raíz y cantidad
 *   de rutas, 99 semillas fijas;
 * - geometría completa PRE sin saber cuáles figuras fueron ganadoras,
 * - Lalo MV1 con raíces +11, sin alterar ranking.
 *
 * Evalúa VT2 VT3 VT4 por separado, en Primera/Matutino/Vespertino/Nocturno.
 * Acierto = cabeza real termina en uno de los valores seleccionados. No
 * implica premio cobrado si no se apostó esa modalidad.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {Turno,CabezasDia} from '../src/domain';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {
 auxiliaryBoard,enumerateAuxPaths,auxCanonicalPath
} from '../src/auxSantiagoNeuquen';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {
 collectWitnesses,evaluateAnchors,familyFor
} from '../src/auxAnchoredMemory';
import type {Length,AnchoredFamily,WitnessDay,Period} from '../src/auxAnchoredMemory';

const WINDOW=process.env.LAB_WINDOW==='early'?'early':'late';
const YEARS=(process.env.LAB_YEARS||'2024,2025,2026').split(',');
const KINDS:Length[]=[2,3,4];
const CUTS=TURNOS.slice(1);
const SEEDS=99;
const initial=(year:string)=>year+(WINDOW==='early'?'-01-15':'-07-15');
const finalDay=(year:string)=>year+(WINDOW==='early'?'-05-31':'-10-20');
const firstEvaluation=(year:string)=>year+(WINDOW==='early'?'-02-01':'-08-01');
const ranges=(year:string)=>{
 const dates:string[]=[];
 for(let ms=Date.parse(initial(year)+'T12:00:00Z');
 ms<=Date.parse(finalDay(year)+'T12:00:00Z');ms+=86400000)
 dates.push(new Date(ms).toISOString().slice(0,10));
 return dates;
};
const minus7=(date:string)=>{
 const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-7);
 return d.toISOString().slice(0,10);
};
const hash=(s:string)=>{let h=2166136261;for(const c of s){
 h^=c.charCodeAt(0);h=Math.imul(h,16777619);
 }return h>>>0;};
type Candidate={family:string;values:string[];roots?:number};
type Metric={hit3:number;hit5:number;raw3:number;raw5:number;
 expected3:number;expected5:number;active3:number;active5:number};
type Cut={
 date:string;turn:Turno;heads:{jur:string;head:string}[];
 sourceCells:number;
 byLength:Record<Length,{
  anchored:{candidates:number;roots:number;validPaths:number;fallback:number};
  methods:{ANCLADO:Metric;GEOMETRIA:Metric;LALO:Metric};
  nulls:Metric[];top5:{ANCLADO:Candidate[];GEOMETRIA:Candidate[];LALO:Candidate[]};
  winningHeads:{jur:string;head:string;hitAnchored:boolean;
   hitLalo:boolean;rootFamilies:AnchoredFamily[]}[];
 }>;
};
function familyFromPhysical(board:ReturnType<typeof auxiliaryBoard>,kind:Length,
 date:string,turn:Turno):Candidate[]{
 const groups=new Map<string,{paths:Set<string>;values:Set<string>}>();
 for(const path of enumerateAuxPaths(board,kind)){
  const v=path.map(c=>c.digit).join(''),family=familyFor(kind,v);
  const g=groups.get(family)||{paths:new Set(),values:new Set()};
  g.paths.add(auxCanonicalPath(path));
  if(kind===4)g.values.add(v);
  else family.split('/').forEach(x=>g.values.add(x));
  groups.set(family,g);
 }
 return [...groups].map(([family,g])=>({
  family,values:[...g.values],roots:g.paths.size
 })).sort((a,b)=>(b.roots||0)-(a.roots||0)||
  hash(date+'|'+turn+'|'+kind+'|'+a.family)-
  hash(date+'|'+turn+'|'+kind+'|'+b.family));
}
function compact(sets:Candidate[],heads:{jur:string;head:string}[],length:Length):Metric{
 const calc=(k:number)=>{
  const values=new Set(sets.slice(0,k).flatMap(x=>x.values));
  return {hits:heads.filter(h=>values.has(h.head.slice(-length))).length,
   raw:values.size,expected:heads.length*values.size/(10**length)};
 };
 const x=calc(3),y=calc(5);
 return {hit3:x.hits,hit5:y.hits,raw3:x.raw,raw5:y.raw,
  expected3:x.expected,expected5:y.expected,
  active3:Number(x.raw>0),active5:Number(y.raw>0)};
}
const add=(data:Metric[])=>{
 const n=(p:keyof Metric)=>data.reduce((sum,x)=>sum+x[p],0);
 return {top3:{hits:n('hit3'),expected:Number(n('expected3').toFixed(3)),
  rawSelections:n('raw3'),activeCuts:n('active3')},
  top5:{hits:n('hit5'),expected:Number(n('expected5').toFixed(3)),
  rawSelections:n('raw5'),activeCuts:n('active5')}};
};
function aggregate(cuts:Cut[]){
 const total={days:new Set(cuts.map(c=>c.date)).size,cuts:cuts.length,
  heads:cuts.reduce((n,c)=>n+c.heads.length,0),modalities:{} as Record<string,any>};
 for(const kind of KINDS){
  const blocks=cuts.map(c=>c.byLength[kind]);
  const methods={} as Record<string,any>;
  for(const name of ['ANCLADO','GEOMETRIA','LALO'] as const)
   methods[name]=add(blocks.map(b=>b.methods[name]));
  const bySeed=Array.from({length:SEEDS},(_,seed)=>add(blocks.map(b=>b.nulls[seed])));
  methods.CONTROL={top3:{
   meanHits:Number((bySeed.reduce((n,x)=>n+x.top3.hits,0)/SEEDS).toFixed(2)),
   meanExpected:Number((bySeed.reduce((n,x)=>n+x.top3.expected,0)/SEEDS).toFixed(3)),
   hitRange:[Math.min(...bySeed.map(x=>x.top3.hits)),Math.max(...bySeed.map(x=>x.top3.hits))],
   perSeed:bySeed.map(x=>x.top3)
  },top5:{
   meanHits:Number((bySeed.reduce((n,x)=>n+x.top5.hits,0)/SEEDS).toFixed(2)),
   meanExpected:Number((bySeed.reduce((n,x)=>n+x.top5.expected,0)/SEEDS).toFixed(3)),
   hitRange:[Math.min(...bySeed.map(x=>x.top5.hits)),Math.max(...bySeed.map(x=>x.top5.hits))],
   perSeed:bySeed.map(x=>x.top5)
  }};
  total.modalities['vt'+kind]={
   methods,
   anchoredEligibleCuts:blocks.filter(b=>b.anchored.candidates>0).length,
   currentCells:blocks.reduce((n,b)=>n+b.anchored.validPaths,0),
   nullFallbacks:blocks.reduce((n,b)=>n+b.anchored.fallback,0)
  };
 }
 return total;
}
async function yearRun(year:string){
 const dates=ranges(year),draws=new Map<string,CabezasDia>(),
  auxiliary=new Map<string,AuxiliaryHeads>(),errors:Record<string,string>={};
 let idx=0;
 await Promise.all(Array.from({length:8},async()=>{
  while(idx<dates.length){
   const date=dates[idx++];
   try{
    const [base,aux]=await Promise.all([
     descargarCabezas(date,true),fetchAuxiliaryHeads(date)
    ]);
    draws.set(date,base);auxiliary.set(date,aux.heads);
   }catch(e){errors[date]=String(e);}
  }
 }));
 if(Object.keys(errors).length>10)throw Error('Problema descarga '+year+' '+JSON.stringify(errors));
 if(year==='2026'&&(auxiliary.get('2026-10-20')?.Primera.Santiago!=='6142'||
  auxiliary.get('2026-10-20')?.Matutino.Santiago!=='9634'))
  throw Error('Mapeo Santiago incorrecto');
 const good=dates.filter(x=>draws.has(x)&&auxiliary.has(x)&&
  hasDrawResults(draws.get(x)!)&&hasNocturnoBase(draws.get(x)!));
 const dayMarks=new Map<string,WitnessDay>(),sheets=new Map<string,DailySheet>();
 for(let i=0;i<good.length;i++){
  const date=good[i];
  dayMarks.set(date,collectWitnesses(date,auxiliary.get(date)!,draws.get(date)!));
  if(i>0)sheets.set(date,buildSheet(draws.get(date)!,draws.get(good[i-1])!));
 }
 const cuts:Cut[]=[];
 for(let i=2;i<good.length;i++){
  const date=good[i];if(date<firstEvaluation(year))continue;
  const previous=good[i-1],week=minus7(date);
  const refs:[{period:Period;day:WitnessDay},...{period:Period;day:WitnessDay}[]]=[
   {period:'D−1',day:dayMarks.get(previous)!},
   ...(dayMarks.has(week)&&week!==previous?
    [{period:'D−7' as Period,day:dayMarks.get(week)!}]:[])
  ];
  if(refs.some(x=>x.day.date>=date))throw Error('Fuga de cabeza futura');
  const hist:LaloHistorical[]=[{date:previous,period:'D−1',sheet:sheets.get(previous)!},
   ...(sheets.has(week)&&week!==previous?
    [{date:week,period:'D−7' as const,sheet:sheets.get(week)!}]:[])
  ];
  for(const turn of CUTS){
   const pre=preSheetAtCut(sheets.get(date)!,turn,TURNOS.indexOf(turn));
   if(pre.heads[turn].length||pre.matches[turn].length)throw Error('Fuga en +11 PRE');
   const current=auxiliaryBoard(auxiliary.get(date)!,turn);
   if(current.cells.some(c=>!current.visibleTurns.includes(c.source)))
    throw Error('Fuga en hoja auxiliar PRE');
   const actual=JURS.flatMap(jur=>{
    const head=draws.get(date)![turn]?.[jur]||'';
    return /^\d{4}$/.test(head)?[{jur,head}]:[];
   });
   const official=buildMotorLalo(pre,date,turn,hist);
   const byLength={} as Cut['byLength'];
   for(const kind of KINDS){
    const anchored=evaluateAnchors(current,refs,kind);
    const nulls=Array.from({length:SEEDS},(_,seed)=>
     evaluateAnchors(current,refs,kind,seed+1));
    const density=familyFromPhysical(current,kind,date,turn);
    const original=official.ranks[('vt'+kind) as 'vt2'|'vt3'|'vt4']
     .map(f=>({
      family:f.family,
      // VT4: solo extensiones físicas, no invertir 4 cifras ni asumir variantes
      values:kind===4?[...new Set(f.paths.map(p=>p.value))]:[...new Set(f.family.split('/'))],
      roots:f.directRoots
     })).filter(f=>f.values.length>0);
    const winnerCases=actual.map(({jur,head})=>{
     const family=familyFor(kind,head.slice(-kind));
     const matches=anchored.ranked.filter(c=>c.family===family);
     const selected=new Set(anchored.ranked.slice(0,5).flatMap(x=>x.values));
     const main=new Set(original.slice(0,5).flatMap(x=>x.values));
     return {jur,head,hitAnchored:selected.has(head.slice(-kind)),
      hitLalo:main.has(head.slice(-kind)),rootFamilies:matches.slice(0,3)};
    });
    byLength[kind]={anchored:{
     candidates:anchored.candidates,roots:anchored.rootEvents,
     validPaths:anchored.positionedPaths,
     fallback:nulls.reduce((n,x)=>n+x.nullFallbackPaths,0)
    },methods:{
     ANCLADO:compact(anchored.ranked,actual,kind),
     GEOMETRIA:compact(density,actual,kind),
     LALO:compact(original,actual,kind)
    },nulls:nulls.map(x=>compact(x.ranked,actual,kind)),
     top5:{ANCLADO:anchored.ranked.slice(0,5),
      GEOMETRIA:density.slice(0,5),LALO:original.slice(0,5)},
     winningHeads:winnerCases.filter(x=>x.hitAnchored||x.hitLalo)};
   }
   const cut:Cut={date,turn,heads:actual,sourceCells:current.cells.length,byLength};
   cuts.push(cut);
   if(date===finalDay(year))console.log('ANCLA_CORTE_FINAL',JSON.stringify({
    date,turn,available:current.cells.length,
    outcomes:KINDS.map(kind=>({kind,
     methods:cut.byLength[kind].methods,
     winners:cut.byLength[kind].winningHeads,
     top3:cut.byLength[kind].top5.ANCLADO.slice(0,3)
    }))
   }));
  }
 }
 const summary=aggregate(cuts);
 const result={year,window:WINDOW,period:{start:firstEvaluation(year),end:finalDay(year)},
  daysDownloaded:good.length,
  protocol:'misma celda absoluta PRE de una raíz POST anterior D−1 o D−7',
  controls:'99 formas no ganadoras por raíz, turno, número de caminos y franjas físicas iguales',
  warning:'todas las evaluaciones son retroactivas; fechas inspeccionadas en estudios previos',
  errors,summary,
  byTurn:CUTS.map(t=>({turn:t,stats:aggregate(cuts.filter(c=>c.turn===t))})),
  cuts};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/continuidad-posicional-'+WINDOW+'-'+year+'.json',
  JSON.stringify(result,null,2));
 console.log('ANCLA_RESUMEN',JSON.stringify({
  year,window:WINDOW,summary,downloadErrors:errors,
  byTurn:result.byTurn.map(x=>({turn:x.turn,modalities:Object.fromEntries(
   KINDS.map(n=>['vt'+n,{
    ANCLADO:x.stats.modalities['vt'+n].methods.ANCLADO,
    LALO:x.stats.modalities['vt'+n].methods.LALO
   }]))
  }))
 }));
 return summary;
}
async function main(){
 for(const year of YEARS)await yearRun(year);
}
void main().catch(err=>{console.error('ANCLA_ERROR',err);process.exitCode=1});
