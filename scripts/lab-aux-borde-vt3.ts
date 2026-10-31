/** LAB VT3 AUX: embudo 1-10 vs 11-20 y evidencia PRE.
 * No altera ningún selector oficial ni lleva información POST al ranking.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS} from '../src/domain';
import type {Turno,CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import type {AuxiliaryHistorical} from '../src/motorLaloIntegral';
import {auxFamily,auxiliaryBoard,collectAuxFamilies} from '../src/auxSantiagoNeuquen';
import {auxEvidenceIndex,auxRankEvidence} from '../src/labAuxTop20AuditVT3';
import {temporalEvidence} from '../src/labAuxTemporalVT3';
import type {TemporalEvidence} from '../src/labAuxTemporalVT3';
import {borderTop10,borderNeutral} from '../src/labAuxBorderSwapsVT3';
import type {BorderSwap,BorderEvidence} from '../src/labAuxBorderSwapsVT3';
import type {AuxRankEvidence} from '../src/labAuxTop20AuditVT3';

const from=process.env.VT3TOP20_FROM||'2026-06-01';
const to=process.env.VT3TOP20_TO||'2026-08-31';
const label=process.env.VT3TOP20_LABEL||'dev';
const skipEarly=process.env.VT3TOP20_SKIP_OCT_EARLY==='1';
const modes=['anterior','intrajornada'] as const;
const bname=(mode:AuxMode)=>mode==='anterior'?'AUX_AYER':'AUX_HOY';
const variants=['official','next','swap1','swap2','null1a','null1b','null1c','null1d','null1e','null2a','null2b','null2c','null2d','null2e'] as const;
type Candidate=AuxRankEvidence&TemporalEvidence&{date:string;turn:Turno;board:string;stage:string;
 headHits:number;winningHeads:{jur:string;head:string}[]};
type Cut={date:string;turn:Turno;board:string;stage:string;
 headCount:number;formable:number;ranked:number;candidateCount:number;
 selection:Record<string,{slots:number;hitHeads:number;hitFamilies:number}>;
 swaps:{one:BorderSwap[];two:BorderSwap[]};
 swapEffect:{one:{added:number;lost:number};two:{added:number;lost:number}}};
const drawCache=new Map<string,Promise<CabezasDia>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
const draw=(date:string)=>{
 if(!drawCache.has(date))drawCache.set(date,descargarCabezas(date,true));
 return drawCache.get(date)!;
};
const aux=(date:string)=>{
 if(!auxCache.has(date))auxCache.set(date,fetchAuxiliaryHeads(date));
 return auxCache.get(date)!;
};
const total=<T>(xs:readonly T[],f:(x:T)=>number)=>xs.reduce((s,x)=>s+f(x),0);
const rnd=(s:string)=>{
 let h=2166136261;
 for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
};
const classify=(r:Candidate,feature:string)=>{
 switch(feature){
  case 'exact':return r.exactEvents>0;
  case 'shift':return r.shiftEvents>0;
  case 'cross':return r.crossingSites>0;
  case 'multipleDays':return r.historyDays>=2;
  case 'd1d7':return r.d1>0&&r.d7>0;
  case 'spread2':return r.distinctDays>=2;
  case 'spread3':return r.distinctDays>=3;
  case 'clustered':return r.eventCount>=2&&r.concentration>=0.75;
  case 'latest':return r.latestDayEvents>0;
  case 'manyEvents':return r.eventCount>=3;
 }
 return false;
};
const flags=['spread2','spread3','clustered','latest','manyEvents','exact','shift','cross','multipleDays','d1d7'];
function summarize(cuts:Cut[],rows:Candidate[]){
 const candidateRows=rows.filter(r=>r.rank<=20);
 const countCuts=cuts.length,heads=total(cuts,c=>c.headCount),
  formable=total(cuts,c=>c.formable);
 const metrics=Object.fromEntries(variants.map(v=>[v,{
  hitHeads:total(cuts,c=>c.selection[v]?.hitHeads||0),
  hitFamilies:total(cuts,c=>c.selection[v]?.hitFamilies||0),
  slots:total(cuts,c=>c.selection[v]?.slots||0)
 }]));
 const matched=cuts.filter(c=>c.ranked>=20);
 const matchedOnly={
  cuts:matched.length,heads:total(matched,c=>c.headCount),
  metrics:Object.fromEntries(variants.map(v=>[v,{hitHeads:total(matched,c=>c.selection[v]?.hitHeads||0),
     hitFamilies:total(matched,c=>c.selection[v]?.hitFamilies||0),
     slots:total(matched,c=>c.selection[v]?.slots||0)}]))
 };
 const blocks=Object.fromEntries(['top10','11-20'].map(name=>{
  const part=candidateRows.filter(r=>name==='top10'?r.rank<=10:r.rank>10);
  const win=part.filter(r=>r.headHits>0),lose=part.filter(r=>r.headHits===0);
  const breakdown=Object.fromEntries(flags.map(f=>{
   const a=part.filter(r=>classify(r,f)),b=part.filter(r=>!classify(r,f));
   return [f,{yes:{n:a.length,winningFamilies:a.filter(r=>r.headHits>0).length,
     headHits:total(a,r=>r.headHits)},
    no:{n:b.length,winningFamilies:b.filter(r=>r.headHits>0).length,
     headHits:total(b,r=>r.headHits)}}];
  }));
  return [name,{n:part.length,winners:win.length,nonwinners:lose.length,
   headHits:total(part,r=>r.headHits),featureBreakdown:breakdown,
   average:{roots:part.length?total(part,r=>r.roots)/part.length:null,
    sites:part.length?total(part,r=>r.physicalSites)/part.length:null,
    exact:part.length?total(part,r=>r.exactEvents)/part.length:null,
    shifted:part.length?total(part,r=>r.shiftEvents)/part.length:null}
  }];
 }));
 return {cuts:countCuts,full20Cuts:cuts.filter(c=>c.ranked>=20).length,matchedOnly,
  heads,formable,candidateCount:candidateRows.length,metrics,blocks};
}
async function main(){
 const cuts:Cut[]=[],rows:Candidate[]=[],skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=to;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  if(skipEarly&&date>='2026-10-01'&&date<'2026-10-12')continue;
  try{
   const weekDate=shiftDay(date,-7);
   const [today,previous,weekHeads]=await Promise.all([
    draw(date),loadPreviousDraws(date,6,draw),draw(weekDate)]);
   if(TURNOS.some(t=>JURS.filter(j=>j!=='Montevideo')
     .some(j=>!/^\d{4}$/.test(today[t]?.[j]||''))))
    throw Error('Jornada incompleta');
   const dates=new Set<string>([date,auxiliarySourceDate(date),
    weekDate,auxiliarySourceDate(weekDate)]);
   for(const p of previous){dates.add(p.date);dates.add(auxiliarySourceDate(p.date));}
   const observations=new Map(await Promise.all([...dates].map(async d=>
    [d,(await aux(d)).heads] as const)));
   const last=previous.at(-1)!;
   const refs=[{date:last.date,heads:last.heads,period:'D−1' as const},
    ...(hasDrawResults(weekHeads)?[{date:weekDate,heads:weekHeads,period:'D−7' as const}]:[])];
   const memory={} as Record<AuxMode,AuxiliaryHistorical[]>;
   const baseline={} as Record<AuxMode,AuxiliaryHistorical[]>;
   for(const mode of modes){
    const src=(d:string)=>mode==='anterior'?auxiliarySourceDate(d):d;
    memory[mode]=previous.map(p=>({date:p.date,period:'D−1' as const,
     aux:extractAuxHistoryMode(p.date,observations.get(src(p.date))!,p.heads,mode)}));
    baseline[mode]=refs.map(p=>({date:p.date,period:p.period,
     aux:extractAuxHistoryMode(p.date,observations.get(src(p.date))!,p.heads,mode)}));
   }
   const dayRows:Candidate[]=[],dayCuts:Cut[]=[];
   for(const turn of TURNOS){
    const winners=JURS.filter(j=>j!=='Montevideo').map(jur=>({
     jur,head:today[turn]?.[jur]||''
    })).filter(h=>/^\d{4}$/.test(h.head))
     .map(h=>({...h,family:auxFamily(h.head.slice(-3))}));
    for(const mode of modes){
     const input=mode==='anterior'?observations.get(auxiliarySourceDate(date))!:
      observations.get(date)!;
     const board=auxiliaryBoard(auxAtCut(input,turn,mode),turn);
     const physical=collectAuxFamilies(board,3);
     const possible=new Set(physical.map(f=>f.family));
     const ranks=buildAuxIndependent(date,turn,auxAtCut(input,turn,mode),baseline[mode])[3];
     const idx=auxEvidenceIndex(memory[mode],date);
     const evidence=auxRankEvidence(ranks.slice(0,20),physical,idx);
   const temporal=temporalEvidence(ranks.slice(0,20),physical,idx);
   const temporalByFamily=new Map(temporal.map(r=>[r.family,r]));
   if(temporal.length!==evidence.length||evidence.some(r=>!temporalByFamily.has(r.family)))
    throw Error('FUGA TEMPORAL: familias distintas entre evidencias');
     if(evidence.some(e=>!possible.has(e.family)))
      throw Error('FUGA: familia sin recorrido PRE');
     const stage=turn==='Vespertino'||turn==='Nocturno'?'completa':'temprana';
     const all:Candidate[]=evidence.map(e=>({...e,...temporalByFamily.get(e.family)!,date,turn,board:bname(mode),stage,
      winningHeads:winners.filter(w=>w.family===e.family).map(w=>({jur:w.jur,head:w.head})),
      headHits:winners.filter(w=>w.family===e.family).length}));
     dayRows.push(...all);
     const combined:BorderEvidence[]=evidence.map(e=>({...e,...temporalByFamily.get(e.family)!}));
     const scoreOne=borderTop10(combined,'one');
     const scoreTwo=borderTop10(combined,'two');
     const old=ranks.slice(0,10).map(r=>r.family);
     const next=ranks.slice(10,20).map(r=>r.family);
     const selection:Record<string,string[]>={official:old,next,
      swap1:scoreOne.selected,swap2:scoreTwo.selected};
     for(const [labelSwap,object] of [['1',scoreOne],['2',scoreTwo]] as const){
      for(let n=0;n<5;n++){
       const nullValue=borderNeutral(combined,object.swaps.length,
        [date,turn,mode,labelSwap,n].join('|'));
       if(nullValue.swaps.length!==object.swaps.length)
        throw Error('FUGA: control no emparejado en numero de swaps');
       selection['null'+labelSwap+'abcde'[n]]=nullValue.selected;
      }
     }
     const picks=Object.fromEntries(variants.map(v=>{
      const chosen=selection[v]||[];
      if(chosen.length>10||new Set(chosen).size!==chosen.length||
       chosen.some(f=>!possible.has(f)))throw Error('Selección AUX inválida');
      const chosenSet=new Set(chosen);
      return [v,{slots:chosen.length,
       hitHeads:winners.filter(w=>chosenSet.has(w.family)).length,
       hitFamilies:all.filter(r=>chosenSet.has(r.family)&&r.headHits>0).length
      }];
     }));
     const swapEffect=(swaps:BorderSwap[])=>({
       added:swaps.reduce((n,x)=>n+winners.filter(w=>w.family===x.in).length,0),
       lost:swaps.reduce((n,x)=>n+winners.filter(w=>w.family===x.out).length,0)
     });
     dayCuts.push({date,turn,board:bname(mode),stage,headCount:winners.length,
      formable:winners.filter(w=>possible.has(w.family)).length,
      ranked:ranks.length,candidateCount:all.length,selection:picks,
      swaps:{one:scoreOne.swaps,two:scoreTwo.swaps},
      swapEffect:{one:swapEffect(scoreOne.swaps),two:swapEffect(scoreTwo.swaps)}});
    }
   }
   cuts.push(...dayCuts);rows.push(...dayRows);
   console.log('BORDER_DAY',date,JSON.stringify(dayCuts.map(c=>({
    turn:c.turn,board:c.board,stage:c.stage,ranked:c.ranked,
    swaps1:c.swaps.one.length,swaps2:c.swaps.two.length,
    original:c.selection.official.hitHeads,swap1:c.selection.swap1.hitHeads,
    swap2:c.selection.swap2.hitHeads
   }))));
  }catch(e){
   if(String(e).includes('FUGA')||String(e).includes('Selección AUX inválida'))throw e;
   skipped.push({date,reason:String(e).slice(0,230)});
   console.log('BORDER_SKIP',date,String(e).slice(0,200));
  }
 }
 const boards=['AUX_AYER','AUX_HOY'],stages=['temprana','completa'];
 const forFilter=(f:(r:{date:string;board:string;stage:string;turn:Turno})=>boolean)=>
  summarize(cuts.filter(f),rows.filter(f));
 const summary=Object.fromEntries(boards.map(board=>[board,
  Object.fromEntries(stages.map(stage=>[stage,{
   overall:forFilter(r=>r.board===board&&r.stage===stage),
   byMonth:Object.fromEntries([...new Set(cuts.map(c=>c.date.slice(0,7)))].sort()
    .map(month=>[month,forFilter(r=>r.board===board&&r.stage===stage&&
     r.date.startsWith(month))])),
   byTurn:Object.fromEntries(TURNOS.filter(t=>cuts.some(c=>c.board===board&&
    c.stage===stage&&c.turn===t)).map(turn=>[turn,
    forFilter(r=>r.board===board&&r.stage===stage&&r.turn===turn)]))
  }]))
 ]));
 const winnersNext=rows.filter(r=>r.rank>10&&r.rank<=20&&r.headHits>0);
 const result={label,from,to,dates:new Set(cuts.map(c=>c.date)).size,
  cuts:cuts.length,skipped,method:'PRE reconstruido; combinado geometrico-temporal del borde 8-10 vs 11-13; ranking original D-1/D-7; uno o dos swaps maximo; controles pareados por numero de cambios',
  summary,
  winnersNext:winnersNext.map(r=>({date:r.date,turn:r.turn,board:r.board,
   rank:r.rank,family:r.family,heads:r.winningHeads,
   evidence:{roots:r.roots,d1:r.d1,d7:r.d7,exactEvents:r.exactEvents,
    exactDays:r.exactDays,shiftEvents:r.shiftEvents,shiftDays:r.shiftDays,
    crossingSites:r.crossingSites,physicalSites:r.physicalSites,
    distinctDays:r.distinctDays,eventCount:r.eventCount,
    latestDayEvents:r.latestDayEvents,maxDayEvents:r.maxDayEvents,
    concentration:r.concentration,effectiveDays:r.effectiveDays,
    dayHistogram:r.dayHistogram}})),
  cutsDetail:cuts,rankRows:rows
 };
 fs.mkdirSync('auditorias/aux-borde-vt3',{recursive:true});
 fs.writeFileSync('auditorias/aux-borde-vt3/'+label+'.json',JSON.stringify(result,null,2)+'\n');
 const cutMetrics=(part:Cut[])=>{
  const counted=part.filter(c=>c.ranked>=20);
  const sum=(f:(c:Cut)=>number)=>counted.reduce((n,c)=>n+f(c),0);
  const metric=(v:string)=>sum(c=>c.selection[v]?.hitHeads||0);
  const nulls=(policy:'1'|'2')=>'abcde'.split('').map(k=>metric('null'+policy+k));
  const observed=(v:'one'|'two')=>({
   swaps:sum(c=>c.swaps[v].length),
   cutsWithSwap:counted.filter(c=>c.swaps[v].length>0).length,
   rescued:sum(c=>c.swapEffect[v].added),lost:sum(c=>c.swapEffect[v].lost),
   net:sum(c=>c.swapEffect[v].added-c.swapEffect[v].lost)
  });
  return {cuts:counted.length,heads:sum(c=>c.headCount),
   original:metric('official'),next:metric('next'),
   swap1:metric('swap1'),swap2:metric('swap2'),
   control1:nulls('1'),control2:nulls('2'),
   change1:observed('one'),change2:observed('two')};
 };
 const audit=Object.fromEntries(boards.map(board=>[board,
  Object.fromEntries(stages.map(stage=>{
   const cutset=cuts.filter(c=>c.board===board&&c.stage===stage);
   return [stage,{overall:cutMetrics(cutset),
    byMonth:Object.fromEntries([...new Set(cutset.map(c=>c.date.slice(0,7)))].sort()
     .map(m=>[m,cutMetrics(cutset.filter(c=>c.date.startsWith(m)))])),
    byTurn:Object.fromEntries(TURNOS.filter(t=>cutset.some(c=>c.turn===t))
     .map(t=>[t,cutMetrics(cutset.filter(c=>c.turn===t))]))}];
  }))
 ]));
 const decisions=cuts.filter(c=>c.swaps.two.length>0)
  .map(c=>({date:c.date,turn:c.turn,board:c.board,stage:c.stage,
   swaps:c.swaps,two:c.swapEffect.two,one:c.swapEffect.one}));
 console.log('BORDER_SUMMARY',JSON.stringify({label,dates:result.dates,
  cuts:cuts.length,skipped,audit,decisions}));
 if(cuts.length<Number(process.env.VT3TOP20_MIN_CUTS||100))
  throw Error('Cortes insuficientes: '+cuts.length);
}
main().catch(e=>{console.error('TOP20_ERROR',e);process.exitCode=1});
