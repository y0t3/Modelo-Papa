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
import {auxEvidenceIndex,auxRankEvidence,selectRanked20} from '../src/labAuxTop20AuditVT3';
import type {AuxRankEvidence,Selector} from '../src/labAuxTop20AuditVT3';

const from=process.env.VT3TOP20_FROM||'2026-06-01';
const to=process.env.VT3TOP20_TO||'2026-08-31';
const label=process.env.VT3TOP20_LABEL||'dev';
const skipEarly=process.env.VT3TOP20_SKIP_OCT_EARLY==='1';
const modes=['anterior','intrajornada'] as const;
const bname=(mode:AuxMode)=>mode==='anterior'?'AUX_AYER':'AUX_HOY';
const variants=['official','next','exact','shift','cross','root','neutral'] as const;
type Candidate=AuxRankEvidence&{date:string;turn:Turno;board:string;stage:string;
 headHits:number;winningHeads:{jur:string;head:string}[]};
type Cut={date:string;turn:Turno;board:string;stage:string;
 headCount:number;formable:number;ranked:number;candidateCount:number;
 selection:Record<string,{slots:number;hitHeads:number;hitFamilies:number}>};
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
 }
 return false;
};
const flags=['exact','shift','cross','multipleDays','d1d7'];
function summarize(cuts:Cut[],rows:Candidate[]){
 const candidateRows=rows.filter(r=>r.rank<=20);
 const countCuts=cuts.length,heads=total(cuts,c=>c.headCount),
  formable=total(cuts,c=>c.formable);
 const metrics=Object.fromEntries([...variants,'neutral1','neutral2','neutral3','neutral4'].map(v=>[v,{
  hitHeads:total(cuts,c=>c.selection[v]?.hitHeads||0),
  hitFamilies:total(cuts,c=>c.selection[v]?.hitFamilies||0),
  slots:total(cuts,c=>c.selection[v]?.slots||0)
 }]));
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
 return {cuts:countCuts,full20Cuts:cuts.filter(c=>c.ranked>=20).length,
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
     if(evidence.some(e=>!possible.has(e.family)))
      throw Error('FUGA: familia sin recorrido PRE');
     const stage=turn==='Vespertino'||turn==='Nocturno'?'completa':'temprana';
     const all:Candidate[]=evidence.map(e=>({...e,date,turn,board:bname(mode),stage,
      winningHeads:winners.filter(w=>w.family===e.family).map(w=>({jur:w.jur,head:w.head})),
      headHits:winners.filter(w=>w.family===e.family).length}));
     dayRows.push(...all);
     const select=(v:Selector,seed=0)=>selectRanked20(evidence,v,
      [date,turn,mode,seed].join('|'));
     const picks=Object.fromEntries([...variants,'neutral1','neutral2','neutral3','neutral4']
      .map((v,i)=>{
       const raw=v.startsWith('neutral')?'neutral':v as Selector;
       const chosen=select(raw as Selector,raw==='neutral'?Number(v.replace('neutral',''))||0:0);
       if(chosen.length>10||new Set(chosen).size!==chosen.length||
        chosen.some(f=>!possible.has(f)))throw Error('Selección AUX inválida');
       const chosenSet=new Set(chosen);
       return [v,{slots:chosen.length,
        hitHeads:winners.filter(w=>chosenSet.has(w.family)).length,
        hitFamilies:all.filter(r=>chosenSet.has(r.family)&&r.headHits>0).length
       }];
      }));
     dayCuts.push({date,turn,board:bname(mode),stage,headCount:winners.length,
      formable:winners.filter(w=>possible.has(w.family)).length,
      ranked:ranks.length,candidateCount:all.length,selection:picks});
    }
   }
   cuts.push(...dayCuts);rows.push(...dayRows);
   console.log('TOP20_DAY',date,'cuts',dayCuts.length,'winnersNext',
    dayRows.filter(r=>r.rank>10&&r.headHits>0).length);
  }catch(e){
   if(String(e).includes('FUGA')||String(e).includes('Selección AUX inválida'))throw e;
   skipped.push({date,reason:String(e).slice(0,230)});
   console.log('TOP20_SKIP',date,String(e).slice(0,200));
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
  cuts:cuts.length,skipped,method:'PRE reconstruido; raiz 6 dias, ranking original D-1/D-7; comparacion 10 familias dentro de Top20; NUNCA mezclar hojas ni POST en selector',
  summary,
  winnersNext:winnersNext.map(r=>({date:r.date,turn:r.turn,board:r.board,
   rank:r.rank,family:r.family,heads:r.winningHeads,
   evidence:{roots:r.roots,d1:r.d1,d7:r.d7,exactEvents:r.exactEvents,
    exactDays:r.exactDays,shiftEvents:r.shiftEvents,shiftDays:r.shiftDays,
    crossingSites:r.crossingSites,physicalSites:r.physicalSites}})),
  cutsDetail:cuts,rankRows:rows
 };
 fs.mkdirSync('auditorias/aux-top20-vt3',{recursive:true});
 fs.writeFileSync('auditorias/aux-top20-vt3/'+label+'.json',JSON.stringify(result,null,2)+'\n');
 console.log('TOP20_SUMMARY',JSON.stringify({label,dates:result.dates,cuts:cuts.length,
  skipped,winnersNext:result.winnersNext.length,
  boards:Object.fromEntries(boards.map(board=>[board,
   Object.fromEntries(stages.map(stage=>[stage,
    Object.fromEntries(Object.entries(summary[board][stage].overall.metrics)
     .map(([k,v]:[string,any])=>[k,v.hitHeads]))
   ]))
  ]))}));
 if(cuts.length<Number(process.env.VT3TOP20_MIN_CUTS||100))
  throw Error('Cortes insuficientes: '+cuts.length);
}
main().catch(e=>{console.error('TOP20_ERROR',e);process.exitCode=1});
