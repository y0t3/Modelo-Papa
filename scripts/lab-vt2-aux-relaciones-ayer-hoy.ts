/**
 * Piloto de relaciones VT2 para Lalo Auxiliar, con modalidad AYER y HOY
 * separadas. Descarga resultados reales de 2026-10-12 a 2026-10-28,
 * reconstruye PRE en el orden cronológico de la app y coteja POST.
 * No amplía ni modifica los rankings AUX, y no toca MV1.
 */
import fs from 'node:fs';
import {TURNOS,JURS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {descargarCabezas} from '../src/cabezas';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {shiftDay} from '../src/dates';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';
import {buildMotorLaloAuxiliar} from '../src/motorLaloAuxiliar';
import type {AuxiliarHistory} from '../src/motorLaloAuxiliar';
import {reversibleFamily} from '../src/motorLalo';

type Row={date:string;mode:AuxMode;turn:Turno;ranked:string[];
 heads:{jur:string;head:string;family:string;rank:number|null}[];
 prevWinningFamilies:string[];sourceDates:{current:string;d1:string;d7:string|null};
 marks:string[];missing:Record<string,boolean>};
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
const valid=(x:string)=>/^\d{4}$/.test(x);
function period(d:string){return d<='2026-10-20'?'OCT_12_20':'OCT_21_28'}
async function main(){
 const records:Row[]=[];
 const missingDates=[] as string[];
 let assessed=0;
 for(let date='2026-10-12';date<='2026-10-28';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  const [current,prior,week]=await Promise.all([
   draw(date),loadPreviousDraws(date,4,draw),draw(shiftDay(date,-7))]);
  if(!hasDrawResults(current))continue;
  const last=prior[3],weekDate=shiftDay(date,-7);
  const refs=[{date:last.date,period:'D−1' as const,heads:last.heads},
   ...(hasDrawResults(week)?[{date:weekDate,period:'D−7' as const,heads:week}]:[])];
  const sources=[date,auxiliarySourceDate(date),...refs.flatMap(r=>[r.date,auxiliarySourceDate(r.date)])];
  let raw:Map<string,Awaited<ReturnType<typeof aux>>>;
  try{
   const fetches=await Promise.all([...new Set(sources)].map(async d=>[d,await aux(d)] as const));
   raw=new Map(fetches);
  }catch(e){
   missingDates.push(date+': '+String(e));continue;
  }
  if(!raw.get(date)||!raw.get(auxiliarySourceDate(date)))throw Error('Aux data missing '+date);
  for(const mode of ['anterior','intrajornada'] as AuxMode[]){
   const history:AuxiliarHistory[]=refs.map(ref=>{
    const sourceDate=mode==='anterior'?auxiliarySourceDate(ref.date):ref.date;
    const observation=raw.get(sourceDate)!;
    return {date:ref.date,period:ref.period,
     sourceDate:mode==='anterior'?sourceDate:undefined,
     heads:observation.heads,
     aux:extractAuxHistoryMode(ref.date,observation.heads,ref.heads,mode)};
   });
   const rawBoard=raw.get(mode==='anterior'?auxiliarySourceDate(date):date)!.heads;
   const won=new Set<string>();
   for(const turn of TURNOS){
    const board=auxAtCut(rawBoard,turn,mode);
    const view=buildMotorLaloAuxiliar(date,turn,board,history);
    const ranked=view.ranks[2].slice(0,10).map(f=>f.family);
    const heads=JURS.map(jur=>({jur,head:current[turn]?.[jur]||''}))
     .filter(x=>valid(x.head))
     .map(x=>({...x,family:reversibleFamily(x.head.slice(-2)),
      rank:ranked.indexOf(reversibleFamily(x.head.slice(-2)))<0?null:
       ranked.indexOf(reversibleFamily(x.head.slice(-2)))+1}));
    const prevWinningFamilies=[...won];
    const missing={emptyBoard:!board||view.ranks[2].length===0,
     noOutcome:heads.length===0};
    records.push({date,mode,turn,ranked,heads,prevWinningFamilies,
     marks:ranked.filter(f=>won.has(f)),missing,
     sourceDates:{current:mode==='anterior'?auxiliarySourceDate(date):date,
      d1:last.date,d7:hasDrawResults(week)?weekDate:null}});
    for(const h of heads)if(h.rank!==null)won.add(h.family);
   }
  }
  assessed++;
  console.log('AUX_PILOT_DAY',date);
 }
 function summarize(rows:Row[]){
  const total=(f:(r:Row)=>number)=>rows.reduce((n,r)=>n+f(r),0);
  const modes=['anterior','intrajornada'] as const;
  return Object.fromEntries(modes.map(mode=>[mode,Object.fromEntries(TURNOS.map(turn=>{
   const sub=rows.filter(r=>r.mode===mode&&r.turn===turn);
   const headWins=totalSafe(sub,r=>r.heads.filter(x=>x.rank!==null).length);
   const baseline2=totalSafe(sub,r=>r.heads.filter(x=>x.rank!==null&&x.rank<=2).length);
   const repeated2=totalSafe(sub,r=>{
    const chosen=[...r.marks,...r.ranked.filter(f=>!r.marks.includes(f))].slice(0,2);
    return r.heads.filter(h=>h.rank!==null&&chosen.includes(h.family)).length;
   });
   const repeatTop10=totalSafe(sub,r=>r.heads.filter(h=>h.rank!==null&&
    r.prevWinningFamilies.includes(h.family)).length);
   return [turn,{cuts:sub.length,withBoard:sub.filter(r=>r.ranked.length>0).length,
    headResults:totalSafe(sub,r=>r.heads.length),
    top10HeadHits:headWins,top2:baseline2,repeatedTop2:repeated2,
    repeatTop10,meanRankCount:sub.length?totalSafe(sub,r=>r.ranked.length)/sub.length:0}];
  }))]));
 }
 const totalSafe=(rows:Row[],fn:(r:Row)=>number)=>rows.reduce((n,r)=>n+fn(r),0);
 const byPeriod=Object.fromEntries(['OCT_12_20','OCT_21_28','ALL'].map(p=>
  [p,summarize(records.filter(r=>p==='ALL'||period(r.date)===p))]));
 const result={type:'AUX_PILOT_2026_10_12_28_NO_PROSPECTIVE_PRE',
  days:assessed,cuts:records.length,providerFailed:missingDates,
  byPeriod,records,
  caveats:[
   'Mode anterior uses Santiago/Neuquen RAW prior draw-day, mode intrajornada only heads earlier than the target turn.',
   'Only observed heads are outcomes; non-drawn or unreported jurisdiction missing is not considered a loss.',
   'Exactly same 2 family slots per PRE policy and only candidates among the Auxiliary Top10.',
   'AUX source for D-1 is the actual previous draw day, not a frozen literal d-1.',
   'Small exploratory October pilot, not a statistical conclusion and never comparable as if it were the 127-day Lalo principal sample.'
  ]};
 const dir='auditorias/aux-vt2-relaciones';
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/resultados.json',JSON.stringify(result,null,2)+'\n');
 console.log('AUX_PILOT_SUMMARY',JSON.stringify({
  days:assessed,cuts:records.length,errors:missingDates,byPeriod}));
 if(assessed<8)throw Error('Muestra insuficiente AUX: '+assessed+' dias');
}
main().catch(e=>{console.error('AUX_PILOT_ERROR',e);process.exitCode=1});
