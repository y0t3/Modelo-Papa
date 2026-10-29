/**
 * Ensayo independiente Lalo Auxiliar VT2/VT3/VT4, AYER vs HOY.
 * Toda predicción se construye antes de leer el resultado del corte objetivo.
 * El resultado POST se usa solo para evaluar rutas exactas y rankings congelados.
 * VT4 siempre coteja valores completos físicamente proyectados, nunca la reversa.
 * Salida retrospectiva: NO equivale a pronósticos auténticos sellados.
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
import {auxiliaryBoard,findAuxPaths} from '../src/auxSantiagoNeuquen';
import {buildMotorLaloAuxiliar} from '../src/motorLaloAuxiliar';
import type {AuxiliarHistory,AuxiliarFamily} from '../src/motorLaloAuxiliar';
import {reversibleFamily} from '../src/motorLalo';

type Kind=2|3|4;
const KINDS:Kind[]=[2,3,4];
type Candidate={
 family:string;values:string[];rank:number;roots:number;d1:number;d7:number;
 sourceTurns:string[];crossing:boolean;prior6Top10:number;
 previousSameTurnRank:number|null;
};
type Outcome={
 jur:string;head:string;kind:Kind;exactSuffix:string;family:string;
 formableExact:boolean;recognizedRank:number|null;top10Rank:number|null;
 wasWinnerEarlierToday:boolean;vt4MotherRank:number|null;
};
type Row={
 date:string;turn:Turno;mode:AuxMode;
 sourceDates:{current:string;d1:string;d7:string|null};
 ranks:Record<Kind,Candidate[]>;outcomes:Outcome[];
 priorWinners:Record<Kind,string[]>;
 boardCells:number;
};
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
const valid=(v:string)=>/^\d{4}$/.test(v);
const familyOf=(k:Kind,value:string)=>k===4?value:reversibleFamily(value);
const match=(k:Kind,c:Pick<Candidate,'family'|'values'>,suffix:string)=>
 k===4?c.values.includes(suffix):c.family===reversibleFamily(suffix);
const total=<T>(a:T[],fn:(r:T)=>number)=>a.reduce((s,r)=>s+fn(r),0);
function period(d:string){return d<='2026-10-20'?'OCT_12_20':'OCT_21_28';}
function groupedSummary(rows:Row[]){
 const result:Record<string,unknown>={};
 for(const mode of ['anterior','intrajornada'] as AuxMode[]){
  const byTurn:Record<string,unknown>={};
  for(const turn of TURNOS){
   const rs=rows.filter(r=>r.mode===mode&&r.turn===turn);
   const byKind:Record<string,unknown>={};
   for(const kind of KINDS){
    const candidates=(r:Row)=>r.ranks[kind];
    const observations=(r:Row)=>r.outcomes.filter(o=>o.kind===kind);
    const captured=(r:Row)=>observations(r).filter(o=>o.top10Rank!==null);
    const sameDay=(r:Row)=>candidates(r).filter(c=>
      c.values.some(v=>r.priorWinners[kind].includes(familyOf(kind,v))));
    const repeatedTwo=(r:Row)=>{
     const chosen=[...sameDay(r),...candidates(r).filter(c=>!sameDay(r).includes(c))]
      .slice(0,2);
     return captured(r).filter(o=>chosen.some(c=>match(kind,c,o.exactSuffix))).length;
    };
    const persistentTwo=(r:Row)=>{
     const chosen=[...candidates(r)]
      .sort((a,b)=>b.prior6Top10-a.prior6Top10||a.rank-b.rank).slice(0,2);
     return captured(r).filter(o=>chosen.some(c=>match(kind,c,o.exactSuffix))).length;
    };
    const formed=total(rs,r=>observations(r).filter(o=>o.formableExact).length);
    const recognized=total(rs,r=>observations(r).filter(o=>o.recognizedRank!==null).length);
    const top10=total(rs,r=>captured(r).length);
    byKind['VT'+kind]={
     cuts:rs.length,withRank:rs.filter(r=>candidates(r).length>0).length,
     publishedHeads:total(rs,r=>observations(r).length),
     formableExact:formed,recognizedFullRank:recognized,
     hitTop10:top10,hitTop2:total(rs,r=>captured(r).filter(o=>(o.top10Rank||99)<=2).length),
     hitTop2SameDaySelector:total(rs,repeatedTwo),
     hitTop2Prev6Presence:total(rs,persistentTwo),
     hitTop10WithEarlierWinToday:total(rs,r=>captured(r).filter(o=>o.wasWinnerEarlierToday).length),
     vt4FormableMotherTop10:total(rs,r=>observations(r).filter(o=>o.formableExact&&kind===4&&o.vt4MotherRank!==null&&o.vt4MotherRank<=10).length),
     vt4FormableMotherBelow10:total(rs,r=>observations(r).filter(o=>o.formableExact&&kind===4&&o.vt4MotherRank!==null&&o.vt4MotherRank>10).length),
     vt4FormableMotherAbsent:total(rs,r=>observations(r).filter(o=>o.formableExact&&kind===4&&o.vt4MotherRank===null).length),
     hitTop10PreviouslyRanked6:total(rs,r=>captured(r).filter(o=>
      candidates(r).some(c=>match(kind,c,o.exactSuffix)&&c.prior6Top10>0)).length),
     formableButUnrecognized:total(rs,r=>observations(r).filter(o=>
      o.formableExact&&o.recognizedRank===null).length),
     recognizedBelowTop10:total(rs,r=>observations(r).filter(o=>
      o.recognizedRank!==null&&o.recognizedRank>10).length),
     notFormable:total(rs,r=>observations(r).filter(o=>!o.formableExact).length),
     rankedSlots:total(rs,r=>candidates(r).length)
    };
   }
   byTurn[turn]=byKind;
  }
  result[mode]=byTurn;
 }
 return result;
}
async function main(){
 const records:Row[]=[];
 const failures:string[]=[];
 let days=0;
 for(let date='2026-10-12';date<='2026-10-28';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  let current:CabezasDia,prior:Awaited<ReturnType<typeof loadPreviousDraws>>,week:CabezasDia;
  try{
   [current,prior,week]=await Promise.all([
    draw(date),loadPreviousDraws(date,4,draw),draw(shiftDay(date,-7))]);
  }catch(e){failures.push(date+': resultados: '+String(e));continue;}
  if(!hasDrawResults(current))continue;
  const last=prior[3],weekDate=shiftDay(date,-7);
  const refs=[{date:last.date,period:'D−1' as const,heads:last.heads},
   ...(hasDrawResults(week)?[{date:weekDate,period:'D−7' as const,heads:week}]:[])];
  const sources=[date,auxiliarySourceDate(date),
   ...refs.flatMap(r=>[r.date,auxiliarySourceDate(r.date)])];
  let raw:Map<string,Awaited<ReturnType<typeof aux>>>;
  try{
   raw=new Map(await Promise.all([...new Set(sources)]
    .map(async d=>[d,await aux(d)] as const)));
  }catch(e){failures.push(date+': fuente AUX: '+String(e));continue;}
  for(const mode of ['anterior','intrajornada'] as AuxMode[]){
   const history:AuxiliarHistory[]=refs.map(ref=>{
    const sourceDate=mode==='anterior'?auxiliarySourceDate(ref.date):ref.date;
    const source=raw.get(sourceDate)!;
    return {date:ref.date,period:ref.period,
     sourceDate:mode==='anterior'?sourceDate:undefined,
     heads:source.heads,
     aux:extractAuxHistoryMode(ref.date,source.heads,ref.heads,mode)};
   });
   const rawBoard=raw.get(mode==='anterior'?auxiliarySourceDate(date):date)!.heads;
   const winners:Record<Kind,Set<string>>={2:new Set(),3:new Set(),4:new Set()};
   for(const turn of TURNOS){
    const atCut=auxAtCut(rawBoard,turn,mode);
    const board=auxiliaryBoard(atCut,turn);
    if(mode==='intrajornada'&&turn==='Previa'&&board.cells.length)
     throw Error('Fuga temporal: AUX HOY tiene celdas antes de Previa');
    const view=buildMotorLaloAuxiliar(date,turn,atCut,history);
    const mothers=new Set(view.ranks[3].slice(0,10).map(c=>c.family));
    if(view.ranks[4].some(c=>!c.mother||!mothers.has(c.mother)))
     throw Error('VT4 sin madre VT3 AUX en '+date+' '+mode+' '+turn);
    const ranks={} as Row['ranks'];
    for(const kind of KINDS){
     const sameTurnEarlier=records.filter(r=>r.mode===mode&&r.turn===turn&&r.date<date).slice(-6);
     const prev=sameTurnEarlier.at(-1);
     ranks[kind]=view.ranks[kind].slice(0,10).map((f:AuxiliarFamily)=>({
      family:f.family,values:f.values,rank:f.rank,roots:f.roots,d1:f.d1,d7:f.d7,
      sourceTurns:[...f.sources],crossing:f.crossing,
      prior6Top10:sameTurnEarlier.filter(r=>r.ranks[kind].some(p=>p.family===f.family)).length,
      previousSameTurnRank:prev?.ranks[kind].find(p=>p.family===f.family)?.rank??null
     }));
    }
    // No hay acceso a cabezas del turno objetivo al crear view/ranks.
    const outcomes:Outcome[]=[];
    for(const jur of JURS){
     const head=current[turn]?.[jur]||'';
     if(!valid(head))continue;
     for(const kind of KINDS){
      const exactSuffix=head.slice(-kind);
      const family=familyOf(kind,exactSuffix);
      const idx=view.ranks[kind].findIndex(f=>match(kind,f,exactSuffix));
      const rank=idx<0?null:idx+1;
      const physicalPaths=findAuxPaths(board,exactSuffix);
      const formableExact=physicalPaths.length>0;
      const motherPos=kind===4?view.ranks[3].findIndex(f=>
       f.family===reversibleFamily(exactSuffix.slice(1))):-1;
      const vt4MotherRank=motherPos<0?null:motherPos+1;
      if(kind===4&&formableExact&&vt4MotherRank!==null&&vt4MotherRank<=10){
       const mother=reversibleFamily(exactSuffix.slice(1));
       const siblings=view.ranks[4].filter(f=>f.mother===mother);
       console.log('AUX_VT4_MOTHER_CASE',JSON.stringify({
        date,mode,turn,jur,head,exactSuffix,mother,vt4MotherRank,
        routesFound:physicalPaths.length,
        firstRoute:physicalPaths[0].map(c=>({row:c.row,col:c.col,source:c.source,digit:c.digit})),
        rankedSiblings:siblings.slice(0,12).map(f=>({rank:f.rank,family:f.family,
         values:f.values,roots:f.roots,d1:f.d1,d7:f.d7,paths:f.paths})),
        numberOfRankedSiblings:siblings.length
       }));
      }
      if(rank!==null&&!formableExact)
       throw Error('Candidata sin recorrido exacto: '+date+' '+mode+' '+turn+' '+jur+' VT'+kind);
      outcomes.push({jur,head,kind,exactSuffix,family,formableExact,
       recognizedRank:rank,top10Rank:rank!==null&&rank<=10?rank:null,
       wasWinnerEarlierToday:winners[kind].has(family),vt4MotherRank});
     }
    }
    records.push({date,mode,turn,ranks,outcomes,boardCells:board.cells.length,
     priorWinners:{2:[...winners[2]],3:[...winners[3]],4:[...winners[4]]},
     sourceDates:{current:mode==='anterior'?auxiliarySourceDate(date):date,
      d1:last.date,d7:hasDrawResults(week)?weekDate:null}});
    for(const o of outcomes)if(o.top10Rank!==null)winners[o.kind].add(o.family);
   }
  }
  days++;
  console.log('AUX_VT234_DAY',date);
 }
 if(days<8)throw Error('Muestra insuficiente '+days+' jornadas; '+failures.join(' | '));
 const byPeriod=Object.fromEntries(['OCT_12_20','OCT_21_28','ALL'].map(p=>
  [p,groupedSummary(records.filter(r=>p==='ALL'||period(r.date)===p))]));
 const provisionalHeads=records.filter(r=>r.date==='2026-10-28'&&r.turn==='Nocturno'&&r.mode==='anterior')
  .flatMap(r=>r.outcomes.filter(o=>o.jur==='Santa Fé'&&o.kind===4).map(o=>o.head));
 const withoutProvisional=records.map(r=>({...r,outcomes:r.outcomes.filter(o=>
  !(r.date==='2026-10-28'&&r.turn==='Nocturno'&&o.jur==='Santa Fé'&&o.head==='6666'))}));
 const byPeriodWithoutProvisional=Object.fromEntries(['OCT_12_20','OCT_21_28','ALL'].map(p=>
  [p,groupedSummary(withoutProvisional.filter(r=>p==='ALL'||period(r.date)===p))]));
 const result={study:'AUX_VT234_PRE_RECONSTRUIDO_POST_COTEJADO_NO_PROSPECTIVO',
  dates:{from:'2026-10-12',to:'2026-10-28'},days,cuts:records.length,
  failures,provisionalHeads,byPeriod,byPeriodWithoutProvisional,records,
  rules:[
   'AY​ER usa Santiago y Neuquen RAW de la ultima jornada sorteable anterior; HOY solo columnas anteriores al turno objetivo.',
   'VT2/VT3 se cotejan como familia reversible; VT4 por valor exacto proyectado, sin invertir cuatro cifras.',
   'FormableExact exige ruta continua real en la grilla AUX del corte, antes de leer el resultado objetivo.',
   'RecognizedFullRank incluye puestos superiores a 10; Top10 y Top2 son presupuestos fijos independientes.',
   'La persistencia seis jornadas usa solamente rankings de cortes anteriores del mismo turno/modo.',
   'Aciertos cuentan cabezas reales publicadas, no familias ni ganancias; selectors de Top2 son ensayos retrospectivos.',
   'La ventana de quince jornadas no valida mejoras y las reconstrucciones PRE no equivalen a sellos prospectivos.',
   'Comparar tambien byPeriodWithoutProvisional: Santa Fe Nocturno 28/10 6666 carecia de corroboracion independiente.',
   'vt4MotherRank distingue madre VT3 en Top10, por debajo del puesto 10 o ausente: nunca crea una hija sin ruta exacta.',
   'No compartir geometria, raices ni votos entre AUX AYER, AUX HOY y Lalo +11.'
  ]};
 const dir='auditorias/aux-vt234-controles';
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/resultados.json',JSON.stringify(result,null,2)+'\n');
 console.log('AUX_VT234_SUMMARY',JSON.stringify({
  days,cuts:records.length,failures,provisionalHeads,byPeriod,byPeriodWithoutProvisional}));
}
main().catch(e=>{console.error('AUX_VT234_ERROR',e);process.exitCode=1});
