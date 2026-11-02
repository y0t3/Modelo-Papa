/**
 * Prueba retrospectiva AUX AYER VT3 Previa: ¿es justificable el desempate
 * que favorece cruces entre columnas? No cambia motor ni introduce
 * resultados POST en los candidatos. Compara meses sep/oct de 2026.
 *
 * Reglas fijadas independientemente de las cabezas del día objetivo:
 * A oficial raíces/D1/D7, cruce, bloques, etiqueta
 * B sin preferencia por cruces: raíces/D1/D7, bloques, etiqueta
 * C preferencia por recorrido en franja única (cruce invertido)
 * D candidatos originales #11–#20 (no altera ranking)
 * E 5 controles de desempate aleatorio solo entre empatados raíz/D1/D7.
 */
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {shiftDay} from '../src/dates';
import {JURS} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {extractAuxHistoryMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import type {AuxiliaryHistorical,AuxRank} from '../src/motorLaloIntegral';
import {auxiliaryBoard,collectAuxFamilies,auxFamily} from '../src/auxSantiagoNeuquen';
const from=process.env.AUDIT_FROM||'2026-09-01';
const to=process.env.AUDIT_TO||'2026-10-30';
const draws=new Map<string,Promise<CabezasDia>>();
const auxes=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
function draw(d:string){
 let p=draws.get(d);if(!p){p=descargarCabezas(d,true);draws.set(d,p)}return p
}
function aux(d:string){
 let p=auxes.get(d);if(!p){p=fetchAuxiliaryHeads(d);auxes.set(d,p)}return p
}
const valid=(x:string)=>/^\d{4}$/.test(x);
const headJur=JURS.filter(j=>j!=='Montevideo');
const hash=(s:string)=>{
 let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;
};
const blocks=(r:AuxRank)=>new Set(r.paths.map(p=>
 p.map(c=>c.row+':'+c.col).sort().join(','))).size;
function alternate(xs:AuxRank[],d:string,mode:'no-cross'|'single-franja'|number):AuxRank[]{
 return [...xs].sort((a,b)=>{
  const roots=b.roots-a.roots||b.d1-a.d1||b.d7-a.d7;
  if(roots)return roots;
  if(mode==='single-franja')return
   Number(a.crossing)-Number(b.crossing)||
   blocks(b)-blocks(a)||a.family.localeCompare(b.family);
  if(mode==='no-cross')return blocks(b)-blocks(a)||a.family.localeCompare(b.family);
  const ha=hash(d+'|Previa|desempate|'+mode+'|'+a.family);
  const hb=hash(d+'|Previa|desempate|'+mode+'|'+b.family);
  return ha-hb||a.family.localeCompare(b.family);
 });
}
type Result={
 date:string;heads:number;formable:number;
 hits:Record<string,number>;
 available:number;ranked:number;
 wins:{head:string;jur:string;family:string;formable:boolean;
  original:number|null;noCross:number|null;single:number|null;
  originalCrossing:boolean|null;originalBlocks:number|null}[];
};
const options=['oficial','puestos11a20','sinCruce','franjaUnica','control0','control1','control2','control3','control4'] as const;
async function one(date:string):Promise<Result|null>{
 const week=shiftDay(date,-7),src=auxiliarySourceDate(date);
 const [today,previous,weekly,raw]=await Promise.all([
  draw(date),loadPreviousDraws(date,1,draw),draw(week),aux(src)
 ]);
 const outcomes=headJur.map(jur=>({jur,head:today.Previa?.[jur]||''}));
 if(outcomes.some(x=>!valid(x.head)))return null;
 const hist=[{date:previous[0].date,heads:previous[0].heads,period:'D−1' as const},
  ...(hasDrawResults(weekly)?[{date:week,heads:weekly,period:'D−7' as const}]:[])];
 const refs:AuxiliaryHistorical[]=await Promise.all(hist.map(async ref=>{
  const p=(await aux(auxiliarySourceDate(ref.date))).heads;
  return {date:ref.date,period:ref.period,
   aux:extractAuxHistoryMode(ref.date,p,ref.heads,'anterior')};
 }));
 const ranked=buildAuxIndependent(date,'Previa',raw.heads,refs)[3];
 const physical=new Set(collectAuxFamilies(auxiliaryBoard(raw.heads,'Previa'),3).map(x=>x.family));
 const noCross=alternate(ranked,date,'no-cross'),single=alternate(ranked,date,'single-franja');
 const sorts=[ranked,ranked.slice(10,20),noCross,single,
  ...Array.from({length:5},(_,i)=>alternate(ranked,date,i))];
 const winners=outcomes.map(x=>{
  const family=auxFamily(x.head.slice(-3));
  const original=ranked.find(z=>z.family===family);
  return {...x,family,formable:physical.has(family),
   original:original?.rank??null,
   noCross:noCross.findIndex(z=>z.family===family)+1||null,
   single:single.findIndex(z=>z.family===family)+1||null,
   originalCrossing:original?.crossing??null,
   originalBlocks:original?blocks(original):null
  };
 });
 const hits=Object.fromEntries(options.map((key,i)=>{
  const set=new Set(sorts[i].slice(0,10).map(x=>x.family));
  return [key,winners.filter(w=>set.has(w.family)).length]
 }));
 return {date,heads:winners.length,formable:winners.filter(x=>x.formable).length,
  hits,available:physical.size,ranked:ranked.length,wins:winners};
}
function summary(rows:Result[]){
 const sum=(f:(r:Result)=>number)=>rows.reduce((n,r)=>n+f(r),0);
 const cum=Object.fromEntries(options.map(o=>[o,sum(r=>r.hits[o])]));
 const valid=rows.flatMap(r=>r.wins.filter(x=>x.formable));
 const ranked=valid.filter(x=>x.original!==null);
 const observed=ranked.filter(x=>x.original!<=10);
 const outside=ranked.filter(x=>x.original!>10&&x.original!<=20);
 const crosses=observed.filter(x=>x.originalCrossing);
 const without=observed.filter(x=>!x.originalCrossing);
 return {cuts:rows.length,heads:sum(x=>x.heads),formable:sum(x=>x.formable),
  rankedWins:ranked.length,officialTop10Wins:observed.length,
  ranked11to20Wins:outside.length,
  officialWinsCrossing:crosses.length,officialWinsFranjaUnica:without.length,
  winnersByRankZone:{
   first:ranked.filter(x=>x.original!<=5).length,
   sixToTen:ranked.filter(x=>x.original!>=6&&x.original!<=10).length,
   elevenToTwenty:outside.length,
   beyondTwenty:ranked.filter(x=>x.original!>20).length
  },
  hits:cum,
  delta:{
   sinCruceVsOficial:cum.sinCruce-cum.oficial,
   franjaUnicaVsOficial:cum.franjaUnica-cum.oficial,
   segundoTop10VsPrimero:cum.puestos11a20-cum.oficial
  },
  daysImproved:Object.fromEntries(options.slice(2,4).map(o=>[
   o,rows.filter(r=>r.hits[o]>r.hits.oficial).length
  ])),
  daysWorse:Object.fromEntries(options.slice(2,4).map(o=>[
   o,rows.filter(r=>r.hits[o]<r.hits.oficial).length
  ]))
 };
}
async function main(){
 const allDays:string[]=[];
 for(let d=from;d<=to;d=shiftDay(d,1))
  if(new Date(d+'T12:00:00Z').getUTCDay()!==0)allDays.push(d);
 const rows:Result[]=[],skipped:{date:string;reason:string}[]=[];
 for(let i=0;i<allDays.length;i+=3){
  const block=await Promise.allSettled(allDays.slice(i,i+3).map(one));
  for(let j=0;j<block.length;j++){
   const x=block[j],date=allDays[i+j];
   if(x.status==='fulfilled'&&x.value)rows.push(x.value);
   else skipped.push({date,reason:x.status==='rejected'?String(x.reason):'Previa parcial'});
  }
  console.log('AUDIT17_PROGRESS',Math.min(i+3,allDays.length),allDays.length);
 }
 const output={from,to,eligibleDates:allDays.length,rows:rows.length,
  skipped,definition:'AUX AYER PREVIA: selección PRE con raíces D−1/D−7 anteriores; cinco cabezas POST independientes',
  monthly:Object.fromEntries([...new Set(rows.map(r=>r.date.slice(0,7)))].sort()
   .map(m=>[m,summary(rows.filter(r=>r.date.startsWith(m)))])),
  all:summary(rows),
  examples11to20:rows.flatMap(r=>r.wins.filter(w=>w.original!==null&&w.original>10&&w.original<=20)
   .map(w=>({date:r.date,jur:w.jur,head:w.head,family:w.family,
    rank:w.original,crossing:w.originalCrossing,blocks:w.originalBlocks,
    noCrossRank:w.noCross,singleRank:w.single}))).slice(-30),
  paired:rows.map(r=>({date:r.date,hits:r.hits,formable:r.formable}))};
 console.log('HIST17_JSON_START');
 console.log(JSON.stringify(output,null,2));
 console.log('HIST17_JSON_END');
 if(rows.length<35)throw Error('Ventana histórica incompleta: '+rows.length);
}
main().catch(e=>{console.error('HIST17_ERROR',e);process.exitCode=1});
