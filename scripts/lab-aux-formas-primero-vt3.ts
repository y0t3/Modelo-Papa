/**
 * Comparación PRE reproducible de tres selectores VT3 por AUX:
 * A) motor histórico top 1-10, B) posiciones 11-20 (igual presupuesto),
 * C) FORMAS PRIMERO (top10 de sitios físicos seleccionados ANTES de
 * leer dígitos). Controles neutrales 5 semillas y 10 familias físicas.
 *
 * Ayer y Hoy siempre independientes. Las cabezas ganadoras sólo se
 * introducen al cotejo POST, nunca en las decisiones de selección.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS} from '../src/domain';
import type {Turno,CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws} from '../src/drawHistory';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import type {AuxiliaryHistorical} from '../src/motorLaloIntegral';
import {auxFamily,auxiliaryBoard,collectAuxFamilies}
 from '../src/auxSantiagoNeuquen';
import {selectAuxFormFirst} from '../src/labAuxFormasPrimeroVT3';

const from=process.env.AUXFORMS_FROM||'2026-06-01';
const to=process.env.AUXFORMS_TO||'2026-08-31';
const label=process.env.AUXFORMS_LABEL||'entrenamiento';
const ignoreEarlyOctober=process.env.AUXFORMS_SKIP_OCT_EARLY==='1';
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
const fixedSeed=(s:string)=>{
 let hash=2166136261;
 for(const ch of s){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
 return hash>>>0;
};
const neutral=(families:string[],date:string,turn:Turno,mode:AuxMode,seed:number)=>
 [...families].sort((a,b)=>fixedSeed(date+'|'+turn+'|'+mode+'|'+seed+'|'+a)-
 fixedSeed(date+'|'+turn+'|'+mode+'|'+seed+'|'+b)||a.localeCompare(b)).slice(0,10);
const physical=(h:string)=>/^\d{4,5}$/.test(h);
const modes=['anterior','intrajornada'] as const;
const bname=(mode:AuxMode)=>mode==='anterior'?'AUX_AYER':'AUX_HOY';
type Cut={
 date:string;turn:Turno;board:'AUX_AYER'|'AUX_HOY';
 heads:number;formable:number;
 availablePhysical:number;availableRanked:number;eligiblePositions:number;
 historyRoots:number;supportedSelected:number;
 sizes:{old:number;next:number;forms:number;neutral:number[]};
 hits:{old:number;next:number;forms:number;neutral:number[]};
 top:{old:string[];next:string[];forms:string[]};
 examples:{jur:string;head:string;family:string;
  old:boolean;next:boolean;forms:boolean;
  rankOriginal:number|null;shapeSupport:{events:number;days:number}|null}[];
};
const summarize=(part:Cut[])=>{
 const sum=(f:(x:Cut)=>number)=>part.reduce((n,x)=>n+f(x),0);
 const heads=sum(x=>x.heads),formable=sum(x=>x.formable);
 const aggregate=(key:'old'|'next'|'forms')=>({
  picked:sum(x=>x.sizes[key]),hitHeads:sum(x=>x.hits[key]),
  hitPct:heads?Number((100*sum(x=>x.hits[key])/heads).toFixed(2)):null,
  formableCapturedPct:formable?
   Number((100*sum(x=>x.hits[key])/formable).toFixed(2)):null
 });
 const neutralHits=Array.from({length:5},(_,i)=>sum(x=>x.hits.neutral[i]));
 const neutralCandidates=Array.from({length:5},(_,i)=>sum(x=>x.sizes.neutral[i]));
 return {cuts:part.length,heads,physicalWinnerHeads:formable,
  avgPhysicalFamilies:part.length?
   Number((sum(x=>x.availablePhysical)/part.length).toFixed(1)):null,
  avgHistoricFamilies:part.length?
   Number((sum(x=>x.availableRanked)/part.length).toFixed(1)):null,
  avgEligibleSites:part.length?
   Number((sum(x=>x.eligiblePositions)/part.length).toFixed(1)):null,
  avgSupportedSlots:part.length?
   Number((sum(x=>x.supportedSelected)/part.length).toFixed(2)):null,
  old:aggregate('old'),next:aggregate('next'),forms:aggregate('forms'),
  neutral:{hits:neutralHits,
   candidates:neutralCandidates,
   meanHits:Number((neutralHits.reduce((a,b)=>a+b,0)/5).toFixed(2)),
   minHits:Math.min(...neutralHits),maxHits:Math.max(...neutralHits)},
  paired:{formsVsOld:sum(x=>x.hits.forms-x.hits.old),
   formsVsNext:sum(x=>x.hits.forms-x.hits.next),
   formsBetterThanOld:part.filter(x=>x.hits.forms>x.hits.old).length,
   oldBetterThanForms:part.filter(x=>x.hits.old>x.hits.forms).length,
   tied:part.filter(x=>x.hits.old===x.hits.forms).length},
  totalFamiliesPicked:{old:sum(x=>x.sizes.old),next:sum(x=>x.sizes.next),
   forms:sum(x=>x.sizes.forms)}
 };
};
async function main(){
 const rows:Cut[]=[];
 const skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=to;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  if(ignoreEarlyOctober&&date>='2026-10-01'&&date<'2026-10-12')continue;
  try{
   const [today,previous]=await Promise.all([
    draw(date),loadPreviousDraws(date,6,draw)]);
   if(TURNOS.some(t=>JURS.filter(j=>j!=='Montevideo')
    .some(j=>!/^\d{4}$/.test(today[t]?.[j]||''))))
    throw Error('Jornada incompleta');
   const dates=new Set<string>([date,auxiliarySourceDate(date)]);
   for(const prev of previous){
    dates.add(prev.date);dates.add(auxiliarySourceDate(prev.date));
   }
   const observations=new Map(await Promise.all([...dates].map(async d=>
    [d,(await aux(d)).heads] as const)));
   const history={} as Record<AuxMode,AuxiliaryHistorical[]>;
   for(const mode of modes){
    history[mode]=previous.map(p=>{
     const src=mode==='anterior'?auxiliarySourceDate(p.date):p.date;
     return {date:p.date,period:'D−1' as const,
      aux:extractAuxHistoryMode(p.date,observations.get(src)!,p.heads,mode)};
    });
   }
   const dayRows:Cut[]=[];
   for(const turn of TURNOS){
    const postHeads=JURS.filter(j=>j!=='Montevideo')
     .map(jur=>({jur,head:today[turn]?.[jur]||''}))
     .filter(h=>physical(h.head));
    for(const mode of modes){
     const input=mode==='anterior'?
      observations.get(auxiliarySourceDate(date))!:
      observations.get(date)!;
     const board=auxiliaryBoard(auxAtCut(input,turn,mode),turn);
     const families=collectAuxFamilies(board,3).map(f=>f.family);
     const possible=new Set(families);
     const historic=buildAuxIndependent(date,turn,
      auxAtCut(input,turn,mode),history[mode])[3];
     const selected=selectAuxFormFirst(board,history[mode],date,bname(mode));
     const old=historic.slice(0,10).map(x=>x.family);
     const next=historic.slice(10,20).map(x=>x.family);
     const forms=selected.top.map(x=>x.family);
     const neutralPicks=Array.from({length:5},(_,i)=>neutral(families,date,turn,mode,i));
     const winners=postHeads.map(h=>({...h,
      vt3:h.head.slice(-3),family:auxFamily(h.head.slice(-3))}));
     const count=(arr:string[])=>{
      const set=new Set(arr);
      return winners.filter(h=>set.has(h.family)).length;
     };
     const ranked=new Map(historic.map(x=>[x.family,x.rank]));
     const fromForms=new Map(selected.top.map(x=>[x.family,x]));
     const examples=winners.filter(h=>possible.has(h.family)).map(h=>({
      jur:h.jur,head:h.head,family:h.family,
      old:old.includes(h.family),next:next.includes(h.family),
      forms:forms.includes(h.family),
      rankOriginal:ranked.get(h.family)??null,
      shapeSupport:fromForms.has(h.family)?{
       events:fromForms.get(h.family)!.rootEvents,
       days:fromForms.get(h.family)!.rootDays
      }:null
     }));
     dayRows.push({date,turn,board:bname(mode),heads:winners.length,
      formable:winners.filter(h=>possible.has(h.family)).length,
      availablePhysical:families.length,availableRanked:historic.length,
      historyRoots:selected.winnerRoots,eligiblePositions:selected.eligibleSites,
      supportedSelected:selected.supportedChosen,
      sizes:{old:old.length,next:next.length,forms:forms.length,
       neutral:neutralPicks.map(p=>p.length)},
      hits:{old:count(old),next:count(next),forms:count(forms),
       neutral:neutralPicks.map(count)},top:{old,next,forms},examples});
     if(forms.some(f=>!possible.has(f)))throw Error('FUGA FÍSICA VT3 '+date+' '+turn);
     if(historic.some(h=>!possible.has(h.family)))throw Error('FUGA AUX PRE '+date);
    }
   }
   rows.push(...dayRows);
   console.log('AUXFORMS_DAY',date,JSON.stringify(dayRows.map(x=>({
    turn:x.turn,board:x.board,physical:x.formable,
    old:x.hits.old,next:x.hits.next,forms:x.hits.forms
   }))));
  }catch(e){
   if(String(e).includes('FUGA'))throw e;
   skipped.push({date,reason:String(e).slice(0,270)});
   console.log('AUXFORMS_SKIP',date,String(e).slice(0,210));
  }
 }
 const boards=['AUX_AYER','AUX_HOY'] as const;
 const byBoard=Object.fromEntries(boards.map(b=>[b,{
  all:summarize(rows.filter(x=>x.board===b)),
  byTurn:Object.fromEntries(TURNOS.map(t=>
   [t,summarize(rows.filter(x=>x.board===b&&x.turn===t))])),
  byMonth:Object.fromEntries([...new Set(rows.map(x=>x.date.slice(0,7)))].sort().map(m=>
   [m,summarize(rows.filter(x=>x.board===b&&x.date.startsWith(m)))]))
 }]));
 const result={
  label,from,to,dates:[...new Set(rows.map(x=>x.date))].length,
  cuts:rows.length,skipped,
  method:'PRE reconstruido +11 no interviene; AUX_AYER y AUX_HOY independientes. Formas prioriza sitios PRE sin leer cifras. 10 familias por tablero; neutral 5 semillas',
  byBoard,
  byPeriod:Object.fromEntries([
   ['junio-agosto',x=>x.date<'2026-09-01'],
   ['septiembre',x=>x.date>='2026-09-01'&&x.date<'2026-10-01'],
   ['octubre',x=>x.date>='2026-10-01']
  ].map(([name,p])=>[name,Object.fromEntries(boards.map(b=>[b,
   summarize(rows.filter(x=>x.board===b&&(p as (r:Cut)=>boolean)(x)))]))])),
  nocturnaExamples:rows.filter(x=>x.turn==='Nocturno'&&x.date>='2026-10-27')
   .map(x=>({date:x.date,board:x.board,
    formable:x.formable,old:x.top.old,forms:x.top.forms,
    examples:x.examples})).slice(-8),
  dailyComparisons:rows.map(x=>({date:x.date,turn:x.turn,board:x.board,
   formable:x.formable,old:x.hits.old,next:x.hits.next,forms:x.hits.forms,
   neutral:x.hits.neutral,supported:x.supportedSelected,
   size:x.sizes.forms}))
 };
 fs.mkdirSync('auditorias/aux-formas-vt3',{recursive:true});
 fs.writeFileSync('auditorias/aux-formas-vt3/'+label+'.json',
  JSON.stringify(result,null,2)+'\n');
 console.log('AUXFORMS_SUMMARY',JSON.stringify({
  label,dates:result.dates,cuts:rows.length,skipped,
  byBoard,byPeriod:result.byPeriod,
  nocturnaExamples:result.nocturnaExamples
 }));
 const min=process.env.AUXFORMS_MIN_CUTS?Number(process.env.AUXFORMS_MIN_CUTS):100;
 if(rows.length<min)throw Error('Revisión incompleta: '+rows.length+' < '+min);
}
main().catch(e=>{console.error('AUXFORMS_ERROR',e);process.exitCode=1});
