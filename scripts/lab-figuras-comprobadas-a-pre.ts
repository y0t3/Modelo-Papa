// Modelo Lalo · laboratorio cronológico FIGURA -> +11 -> NUEVAS CIFRAS.
// SOLO figuras geométricas VT3 respaldadas por cabezas coincidentes ya sorteadas;
// testigos físicos siempre dentro de una misma columna (+11 dos dígitos).
// Variantes descriptivas. Nunca consulta la cabeza objetivo para elegir el Top.
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {buildSheet} from '../src/sheet';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {allPhysicalVt3,buildVt3Shadow} from '../src/vt3Shadow';
import type {Path} from '../src/paths';
import type {SourceId,DailySheet} from '../src/sheet';
import {findPaths} from '../src/paths';
import {deriveFromMothers,vt2Hits,vt4Hits} from './lab-conectadas-derivaciones-vt2-vt4';
import {connectedWinnerPairs,projectVerifiedConfigurations,pairModes} from './lab-vt3-configuraciones-conectadas';
import type {PairMode,Pair} from './lab-vt3-configuraciones-conectadas';
import {allGeometricShapes,inspectFigure,figureScore,figureModes} from './lab-vt3-figura-identidad';
import type {FigureMode} from './lab-vt3-figura-identidad';
import {episodeEvidence,episodeFlag,episodeScore,episodeModes} from './lab-figuras-episodios';
import type {EpisodeMode} from './lab-figuras-episodios';
import {sequenceEvidence,sequenceModes,rankSequenceEvidence,flagged} from './lab-figuras-secuencias-reales';
import type {SequenceMode,SequenceEvidence} from './lab-figuras-secuencias-reales';

const extra16=process.env.LAB_EVALUAR_16_OCT==='1';
const endDate=extra16?'2026-10-16':'2026-10-15';
const periods=[['2026-06-01','2026-07-31','JUNIO_JULIO'],
 ['2026-08-15',endDate,'AGOSTO_OCTUBRE']] as const;
const sources:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
type Day={date:string;heads:CabezasDia};
type Verified={date:string;turn:Turno;head:string;jur:string;shape:string;source:SourceId;cells:string[]};
type Trace={source:SourceId;shape:string;cells:string[];value:string;family:string};
type Family={family:string;firstSource:SourceId;traces:Trace[];witness:Record<RankingMethod,RankedTrace>};
type RankedTrace={trace:Trace;score:number[];anyDays:number;sameDays:number;differentSources:number;weekly:boolean;distance:number};
type RankingMethod='FIGURA_REITERADA'|'MISMA_FUENTE'|'CAMBIO_DE_FUENTE';
type MatchMethod=RankingMethod|'LALO'|'GEOMETRIA';
type CutResult={
 date:string;turn:Turno;period:string;heads:string[];winners:string[];availableFamilies:number;
 physicalWinningHeads:number;verifiedEventCount:number;distinctActiveShapes:number;
 shapeAvailability:{name:string;qualifiedFamilies:number;qualifiedWinningHeads:number}[];
 scores:Record<MatchMethod,{top3:number;top5:number;top10:number;topFamilies:string[]}>;
 neutral:{top3:number;top5:number;top10:number};
 physicalWinnerDetails:{head:string;family:string;source:string;shape:string;paths:number;
  ranks:Record<MatchMethod,number|null>}[];
};
const strDate=(date:string)=>Date.parse(date+'T12:00:00Z');
const back=(date:string,n:number)=>new Date(strDate(date)-n*86400000).toISOString().slice(0,10);
const range=(first:string,last:string)=>{
 const out:string[]=[];for(let t=strDate(first);t<=strDate(last);t+=86400000)
  out.push(new Date(t).toISOString().slice(0,10));
 return out;
};
const coord=(c:{row:number;col:number})=>c.row+':'+c.col;
const positionKey=(cells:string[])=>[cells.join('>'),[...cells].reverse().join('>')].sort()[0];
const pathShape=(cells:string[])=>{
 const ps=cells.map(c=>c.split(':').map(Number));
 const steps=(p:number[][])=>p.slice(1).map((v,i)=>
  (v[0]-p[i][0])+','+(v[1]-p[i][1])).join(';');
 return [steps(ps),steps([...ps].reverse())].sort()[0];
};
const pathTrace=(p:Path,source:SourceId):Trace=>{
 const cells=p.map(coord),value=p.map(c=>c.digit).join('');
 return {source,shape:pathShape(cells),cells,value,family:reversibleFamily(value)};
};
function witnessed(sheet:DailySheet,date:string):Verified[]{
 const events:Verified[]=[],seen=new Set<string>();
 for(const turn of TURNOS){
  for(const match of sheet.matches[turn]){
   if(match.jurisdiccion==='Montevideo'||!/^\d{4}$/.test(match.cabeza))continue;
   for(const hit of match.hits){
    if(hit.kind!=='vt3')continue;
    if(!match.cabeza.endsWith(hit.value))throw Error('No es cabeza coincidente');
    for(const route of hit.paths){
     const t=pathTrace(route,hit.sourceId);
     if(t.value!==hit.value)throw Error('Celdas no coinciden con cabeza real');
     const key=[date,turn,match.jurisdiccion,match.cabeza,t.source,t.shape,
       positionKey(t.cells)].join('|');
     if(seen.has(key))continue;seen.add(key);
     events.push({date,turn,head:match.cabeza,jur:match.jurisdiccion,
      source:t.source,shape:t.shape,cells:t.cells});
    }
   }
  }
 }
 return events;
}
function familyPool(sheet:DailySheet,turn:Turno):Family[]{
 const families=new Map<string,Family>();
 for(const column of sheet.columns.slice(0,TURNOS.indexOf(turn)+1)){
  for(const p of allPhysicalVt3(column.values)){
   const t=pathTrace(p,column.id);
   const f=families.get(t.family)||{family:t.family,firstSource:column.id,
    traces:[],witness:{} as Family['witness']};
   if(!f.traces.some(x=>x.source===t.source&&positionKey(x.cells)===positionKey(t.cells)))
    f.traces.push(t);
   families.set(f.family,f);
  }
 }
 return [...families.values()];
}
const traceKeys=(e:{source:SourceId;shape:string})=>e.source+'|'+e.shape;
const methods:RankingMethod[]=['FIGURA_REITERADA','MISMA_FUENTE','CAMBIO_DE_FUENTE'];
function assess(t:Trace,previous:Verified[],weekly:Verified[],targetDate:string,method:RankingMethod):RankedTrace{
 const sameShape=previous.filter(e=>e.shape===t.shape);
 const sameSource=sameShape.filter(e=>e.source===t.source);
 const anyDays=new Set(sameShape.map(e=>e.date)).size;
 const sameDays=new Set(sameSource.map(e=>e.date)).size;
 const differentSources=new Set(sameShape.map(e=>e.source)).size;
 const weeklySupport=weekly.some(e=>e.shape===t.shape&&e.source===t.source);
 const distinctAges=[...new Set(sameShape.map(e=>Math.round((strDate(targetDate)-strDate(e.date))/86400000)))];
 const distance=distinctAges.length?Math.min(...distinctAges):99;
 const sameAgain= sameDays>=2?1:0;
 const multipleSources= differentSources>=2?1:0;
 // Prioridad PRE por sucesos ganadores reales, nunca mera disponibilidad
 // geométrica. Sin puntos fabricados ni contar rutas de la misma cabeza.
 const score=method==='FIGURA_REITERADA'?
  [Number(anyDays>=2),anyDays,sameDays,multipleSources,Number(weeklySupport),-distance]:
  method==='MISMA_FUENTE'?
  [sameAgain,sameDays,Number(weeklySupport),anyDays,multipleSources,-distance]:
  [multipleSources,Math.min(differentSources,4),anyDays,sameDays,
   Number(weeklySupport),-distance];
 return {trace:t,score,anyDays,sameDays,differentSources,
  weekly:weeklySupport,distance};
}
const compareScore=(a:number[],b:number[])=>{
 for(let i=0;i<Math.max(a.length,b.length);i++){
  const diff=(b[i]||0)-(a[i]||0);
  if(diff)return diff;
 }
 return 0;
};
function scoredCandidates(families:Family[],previous:Verified[],weekly:Verified[],
 currentDate:string,method:RankingMethod){
 const found=families.map(f=>{
  const infos=f.traces.map(t=>assess(t,previous,weekly,currentDate,method));
  infos.sort((a,b)=>compareScore(a.score,b.score)||
    sources.indexOf(a.trace.source)-sources.indexOf(b.trace.source)||
    positionKey(a.trace.cells).localeCompare(positionKey(b.trace.cells)));
  return {family:f.family,info:infos[0]};
 });
 found.sort((a,b)=>compareScore(a.info.score,b.info.score)||
  sources.indexOf(a.info.trace.source)-sources.indexOf(b.info.trace.source)||
  positionKey(a.info.trace.cells).localeCompare(positionKey(b.info.trace.cells))||
  a.family.localeCompare(b.family));
 return found;
}
type ControlLine={activeExposures:number;inactiveExposures:number;
 activeWinners:number;inactiveWinners:number;expected:number;observed:number;
 matchedActive:number;matchedInactive:number;matchedActiveHeads:number;
 matchedInactiveHeads:number;matchedStrata:number;};
const emptyControl=():ControlLine=>({activeExposures:0,inactiveExposures:0,activeWinners:0,
 inactiveWinners:0,expected:0,observed:0,matchedActive:0,matchedInactive:0,
 matchedActiveHeads:0,matchedInactiveHeads:0,matchedStrata:0});
type ControlMethod='FORMAS_DOS_JORNADAS'|'MISMA_FUENTE_DOS_JORNADAS'|'MISMA_FUENTE_ESTRICTA'|'MOVIO_FUENTE';
function controlled(cutRows:{family:string;hit:number;source:SourceId;witnessSource:SourceId;sourceCount:number;routes:number;
 anyDays:number;sameDays:number;differentSources:number}[],name:ControlMethod){
 const metric=(r:typeof cutRows[number])=>name==='FORMAS_DOS_JORNADAS'?r.anyDays>=2:
  name.startsWith('MISMA_FUENTE')?r.sameDays>=2:r.differentSources>=2;
 const groups=new Map<string,typeof cutRows>();
 const res=emptyControl();
 for(const r of cutRows){
  const isActive=metric(r);
  if(isActive){res.activeExposures++;res.activeWinners+=r.hit}
  else{res.inactiveExposures++;res.inactiveWinners+=r.hit}
  // Emparejar sólo dentro del PRE, origen y banda de número de testigos;
  // evita confundir abundancia de familias y repetición por una misma fuente.
  const band=r.routes<=1?'1':r.routes<=2?'2':r.routes<=5?'3-5':r.routes<=12?'6-12':'13+';
  const key=r.source+'|'+(name==='MISMA_FUENTE_ESTRICTA'?
   r.witnessSource+'|'+(r.sourceCount===1?'una':'varias')+'|':'')+band;
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key)!.push(r);
 }
 for(const rows of groups.values()){
  const a=rows.filter(metric),b=rows.filter(r=>!metric(r));
  if(!a.length||!b.length)continue;
  const wa=a.reduce((n,r)=>n+r.hit,0),wb=b.reduce((n,r)=>n+r.hit,0);
  res.matchedStrata++;
  res.matchedActive+=a.length;res.matchedInactive+=b.length;
  res.matchedActiveHeads+=wa;res.matchedInactiveHeads+=wb;
  res.observed+=wa;res.expected+=a.length/(a.length+b.length)*(wa+wb);
 }
 return res;
}
const controls:ControlMethod[]=['FORMAS_DOS_JORNADAS','MISMA_FUENTE_DOS_JORNADAS','MISMA_FUENTE_ESTRICTA','MOVIO_FUENTE'];
const plus=(a:ControlLine,b:ControlLine):ControlLine=>{
 const result=emptyControl();
 for(const k of Object.keys(result) as (keyof ControlLine)[])result[k]=a[k]+b[k];
 return result;
};
function makeTotals(rows:CutResult[]){
 const names:MatchMethod[]=['LALO','GEOMETRIA',...methods];
 const methodsResult=Object.fromEntries(names.map(k=>[k,{
  top3:rows.reduce((n,r)=>n+r.scores[k].top3,0),
  top5:rows.reduce((n,r)=>n+r.scores[k].top5,0),
  top10:rows.reduce((n,r)=>n+r.scores[k].top10,0)}]));
 return {days:new Set(rows.map(x=>x.date)).size,cuts:rows.length,
  heads:rows.reduce((n,r)=>n+r.heads.length,0),
  physicalWinners:rows.reduce((n,r)=>n+r.physicalWinningHeads,0),
  neutral:{top3:rows.reduce((n,r)=>n+r.neutral.top3,0),
   top5:rows.reduce((n,r)=>n+r.neutral.top5,0),
   top10:rows.reduce((n,r)=>n+r.neutral.top10,0)},
  methods:methodsResult,
  threeExamples:rows.flatMap(r=>r.physicalWinnerDetails.map(x=>({
   date:r.date,turn:r.turn,...x}))).filter(x=>x.ranks.FIGURA_REITERADA!==null&&
   x.ranks.FIGURA_REITERADA!<=3).slice(0,9)};
}
async function download(){
 const result:Day[]=[];
 const list=range('2026-05-14',endDate);
 for(let i=0;i<list.length;i+=8){
  const xs=await Promise.all(list.slice(i,i+8).map(async date=>{
   for(let j=0;j<3;j++)try{return {date,heads:await descargarCabezas(date,true)}}
   catch(e){if(j===2)throw Error('No se pudo consultar '+date+': '+e)}
   throw Error('Sin resultados: '+date);
  }));
  result.push(...xs);
 }
 const valid=result.filter(x=>hasDrawResults(x.heads)&&hasNocturnoBase(x.heads))
  .sort((a,b)=>a.date.localeCompare(b.date));
 for(const [date,head] of Object.entries({'2026-06-20':'0963','2026-07-09':'0802'})){
  if(valid.find(d=>d.date===date)?.heads.Nocturno.Montevideo!==head)
   throw Error('Montevideo parcial corregido alterado: '+date);
 }
 return valid;
}
async function main(){
 const days=await download();
 const byDate=new Map(days.map((day,i)=>[day.date,{day,i}]));
 const histories=new Map<string,{sheet:DailySheet;events:Verified[]}>();
 for(let i=1;i<days.length;i++){
  const current=days[i],older=days[i-1];
  const sheet=buildSheet(current.heads,older.heads);
  histories.set(current.date,{sheet,events:witnessed(sheet,current.date)});
 }
 const connectedHistory=new Map<string,Pair[]>();
 for(const [date,record] of histories)
  connectedHistory.set(date,connectedWinnerPairs(record.events));
 type PairControl={treated:number;control:number;hitT:number;hitC:number;
  observed:number;expected:number;strata:number};
 type ConnectedCut={date:string;turn:Turno;period:string;historyPairs:number;
  modes:Record<PairMode,{candidates:number;top3:number;top5:number;top10:number;
   families:string[];witnesses:any[]}>;
  controls:Record<PairMode,PairControl>};
 const connectedCuts:ConnectedCut[]=[];
 type DerivedKind='vt2'|'vt4';
 type DerivedMode='LALO'|'GEOMETRIA_DERIVADA'|'CONECTADAS_DERIVADA';
 const derivedModes:DerivedMode[]=['LALO','GEOMETRIA_DERIVADA','CONECTADAS_DERIVADA'];
 type DerivedScores=Record<DerivedMode,Record<DerivedKind,{
   count:number;top3:number;top5:number;top6:number;top10:number;
   firstFamilies:string[];matchedHeads:{head:string;family:string;position:number}[]}>>;
 const derivedCuts:{date:string;period:string;turn:Turno;heads:string[];
  physicalVt2:number;physicalVt4:number;scores:DerivedScores}[]=[];

 type Sensitivity='ULTIMAS_3'|'ULTIMAS_6'|'ULTIMAS_6_D7'|
  'ANTIGUAS_7_A_12'|'SOLO_D7';
 const sensitivityNames:Sensitivity[]=['ULTIMAS_3','ULTIMAS_6',
  'ULTIMAS_6_D7','ANTIGUAS_7_A_12','SOLO_D7'];
 const sensitivityCuts:{date:string;period:string;turn:Turno;
  methods:Record<Sensitivity,{eligible:number;top3:number;top5:number;top10:number;
   top3Families:string[];source:string|null}>}[]=[];
 const cuts:CutResult[]=[];
 type FigControl={treated:number;control:number;hitT:number;hitC:number;observed:number;expected:number;strata:number};
 type FigRecord={date:string;turn:Turno;period:string;
  availableShapes:number;historyShapes:number;shapeNames:string[];
  modes:Record<FigureMode,{eligibleFamilies:number;top3:number;top5:number;top10:number;
   topFamilies:string[];topWitnesses:any[]}>;
  controls:Record<FigureMode,FigControl>};
 const figureCuts:FigRecord[]=[];
 const theoreticalShapes=allGeometricShapes();
 if(theoreticalShapes.length!==19)throw Error('Cambio inesperado en el tablero físico VT3');
 type CohortStats={treated:number;control:number;hitT:number;hitC:number;
  observed:number;expected:number;strata:number};
 type EpisodeCut={date:string;turn:Turno;period:string;
  modes:Record<EpisodeMode,{candidates:number;top3:number;top5:number;top10:number;
   topFamilies:string[];selectedProofs:any[]}>;
  broad:Record<EpisodeMode,CohortStats>;tight:Record<EpisodeMode,CohortStats>};
 const episodeCuts:EpisodeCut[]=[];
 const seqByCut:{date:string;period:string;turn:Turno;
  modes:Record<SequenceMode,{available:number;top3:number;top5:number;top10:number;
   topFamilies:string[];topWitnesses:any[]}>;
  control:Record<SequenceMode,{treated:number;control:number;hitsT:number;hitsC:number;
   expected:number;observed:number;strata:number}>}[]=[];
 const controlByCut:{date:string;period:string;turn:Turno;res:Record<ControlMethod,ControlLine>}[]=[];
 const dataHashes:Object=Object.fromEntries(days.map(d=>
  [d.date,createHash('sha256').update(JSON.stringify(d.heads)).digest('hex')]));
 for(const [from,to,period] of periods){
  const rangeDays=days.filter(d=>d.date>=from&&d.date<=to&&
   TURNOS.some(t=>JURS.some(j=>j!=='Montevideo'&&/^\d{4}$/.test(d.heads[t][j]))));
  for(const day of rangeDays){
   const index=byDate.get(day.date)?.i;
   if(index===undefined||index<7)throw Error('Falta historia '+day.date);
   const prior=days[index-1],beforePrior=days[index-2];
   const week=byDate.get(back(day.date,7));
   const weekBefore=week?.i!==undefined&&week.i>0?days[week.i-1]:null;
   const historical:LaloHistorical[]=[
    {date:prior.date,period:'D−1',sheet:histories.get(prior.date)?.sheet||
     buildSheet(prior.heads,beforePrior.heads)},
    ...(week&&weekBefore?[{date:week.day.date,period:'D−7' as const,
     sheet:histories.get(week.day.date)?.sheet||buildSheet(week.day.heads,weekBefore.heads)}]:[])
   ];
   const lastDays=days.slice(Math.max(0,index-6),index);
   const previous=lastDays.flatMap(d=>histories.get(d.date)?.events||[]);
   const weekly=week?histories.get(week.day.date)?.events||[]:[];
   for(const turn of TURNOS){
    const idx=TURNOS.indexOf(turn);
    const partial=diaVacio();
    for(const older of TURNOS.slice(0,idx))for(const jur of JURS)
     partial[older][jur]=day.heads[older][jur];
    const pre=buildSheet(partial,prior.heads);
    if(pre.heads[turn].length||pre.matches[turn].length)
     throw Error('Fuga temporal en '+day.date+' '+turn);
    const families=familyPool(pre,turn);
    const earlierToday=witnessed(pre,day.date);
    if(earlierToday.some(e=>TURNOS.indexOf(e.turn)>=idx))throw Error('Fuga POST intradía');
    const completedDates=lastDays.map(d=>d.date);
    // PRE válido con una sola pareja Nocturna uruguaya: cero VT3, NO eliminar el turno.
    const eligible=new Map(families.map(f=>[f.family,f]));
    const actualHeads=JURS.filter(j=>j!=='Montevideo')
     .map(j=>day.heads[turn][j]).filter(h=>/^\d{4}$/.test(h));
    if(actualHeads.length!==5)throw Error('Faltan cabezas argentinas '+day.date+' '+turn);
    const winning=actualHeads.map(h=>({head:h,family:reversibleFamily(h.slice(-3))}));
    const wins=new Map<string,number>();
    for(const x of winning)wins.set(x.family,(wins.get(x.family)||0)+1);
    const physicalWinningHeads=winning.filter(w=>eligible.has(w.family)).length;
    const official=buildMotorLalo(pre,day.date,turn,historical);
    const geo=buildVt3Shadow(pre,day.date,turn,historical,official);
    if(geo.availableFamilies!==families.length)
     throw Error('Las familias físicas no concuerdan con Geometría '+day.date+' '+turn);
    const rankings:Record<MatchMethod,string[]>={
     LALO:official.ranks.vt3.map(f=>f.family),
     GEOMETRIA:geo.top.map(f=>f.family),
     FIGURA_REITERADA:[],MISMA_FUENTE:[],CAMBIO_DE_FUENTE:[]
    };
    const scoreRows=new Map<RankingMethod,ReturnType<typeof scoredCandidates>>();
    for(const method of methods){
     const ranked=scoredCandidates(families,previous,weekly,day.date,method);
     scoreRows.set(method,ranked);rankings[method]=ranked.map(f=>f.family);
    }
    // Para cada prueba usar el testigo que mejor representa ESA propiedad.
    // No atribuir todos los atributos al primer testigo de un ranking distinto.
    const evidenceByMethod=Object.fromEntries(methods.map(k=>[
     k,new Map(scoreRows.get(k)!.map(r=>[r.family,r.info]))
    ])) as Record<RankingMethod,Map<string,RankedTrace>>;
    const currentRows=families.map(f=>{
     const figure=evidenceByMethod.FIGURA_REITERADA.get(f.family)!;
     const ownSource=evidenceByMethod.MISMA_FUENTE.get(f.family)!;
     const migration=evidenceByMethod.CAMBIO_DE_FUENTE.get(f.family)!;
     return {family:f.family,hit:wins.get(f.family)||0,source:f.firstSource,
      witnessSource:ownSource.trace.source,
      sourceCount:new Set(f.traces.map(t=>t.source)).size,
      routes:f.traces.length,anyDays:figure.anyDays,sameDays:ownSource.sameDays,
      differentSources:migration.differentSources};
    });
    const historyByFamily=families.map(f=>({
     family:f.family,firstSource:f.firstSource,traces:f.traces,
     choices:f.traces.map(trace=>({trace,evidence:sequenceEvidence(trace,
      previous,completedDates,earlierToday)}))
    }));
    const seqModes={} as (typeof seqByCut)[number]['modes'];
    const seqControls={} as (typeof seqByCut)[number]['control'];
    for(const mode of sequenceModes){
     const pool=historyByFamily.map(f=>{
      const valid=f.choices.filter(c=>flagged(c.evidence,mode))
       .sort((a,b)=>compareScore(rankSequenceEvidence(a.evidence,mode),
        rankSequenceEvidence(b.evidence,mode))||
        sources.indexOf(a.trace.source)-sources.indexOf(b.trace.source)||
        positionKey(a.trace.cells).localeCompare(positionKey(b.trace.cells)));
      return valid[0]?{family:f.family,...valid[0]}:null;
     }).filter((x):x is NonNullable<typeof x>=>x!==null)
      .sort((a,b)=>compareScore(rankSequenceEvidence(a.evidence,mode),
       rankSequenceEvidence(b.evidence,mode))||
       sources.indexOf(a.trace.source)-sources.indexOf(b.trace.source)||
       positionKey(a.trace.cells).localeCompare(positionKey(b.trace.cells))||
       a.family.localeCompare(b.family));
     const familiesRanked=pool.map(x=>x.family);
     seqModes[mode]={
      available:pool.length,
      top3:winning.filter(w=>familiesRanked.slice(0,3).includes(w.family)).length,
      top5:winning.filter(w=>familiesRanked.slice(0,5).includes(w.family)).length,
      top10:winning.filter(w=>familiesRanked.slice(0,10).includes(w.family)).length,
      topFamilies:familiesRanked.slice(0,10),
      topWitnesses:pool.slice(0,3).map(x=>({
       family:x.family,source:x.trace.source,shape:x.trace.shape,
       cells:x.trace.cells,digits:x.trace.value,
       history:x.evidence.activity,intraday:x.evidence.intradaySame
      }))
     };
     const groups=new Map<string,{marked:boolean;hit:number}[]>();
     for(const f of historyByFamily){
      const marked=f.choices.filter(c=>flagged(c.evidence,mode));
      const base=marked.length?marked:f.choices;
      const choice=base.slice().sort((a,b)=>compareScore(
       rankSequenceEvidence(a.evidence,mode),rankSequenceEvidence(b.evidence,mode))||
       sources.indexOf(a.trace.source)-sources.indexOf(b.trace.source))[0];
      if(!choice)continue;
      const band=f.traces.length<=1?'1':f.traces.length<=2?'2':
       f.traces.length<=5?'3-5':f.traces.length<=12?'6-12':'13+';
      // El control AAB iguala la cantidad previa de marcas en esa fuente:
      // estudiar el ORDEN de los hechos, no la mera intensidad histórica.
      const daysBand=choice.evidence.sourceDays===0?'0':
       choice.evidence.sourceDays===1?'1':
       choice.evidence.sourceDays===2?'2':'3+';
      const key=f.firstSource+'|'+choice.trace.source+'|'+band+'|'+
       (['DOS_SEGUIDAS','AAB','AABB'].includes(mode)?daysBand:'*');
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key)!.push({marked:marked.length>0,hit:wins.get(f.family)||0});
     }
     let treated=0,control=0,hitsT=0,hitsC=0,expected=0,observed=0,strata=0;
     for(const rows of groups.values()){
      const yes=rows.filter(x=>x.marked),no=rows.filter(x=>!x.marked);
      if(!yes.length||!no.length)continue;
      const wy=yes.reduce((n,x)=>n+x.hit,0),wn=no.reduce((n,x)=>n+x.hit,0);
      treated+=yes.length;control+=no.length;hitsT+=wy;hitsC+=wn;
      observed+=wy;expected+=yes.length/(yes.length+no.length)*(wy+wn);strata++;
     }
     seqControls[mode]={treated,control,hitsT,hitsC,expected,observed,strata};
    }
    seqByCut.push({date:day.date,period,turn,modes:seqModes,control:seqControls});
    // Solo cabezas ANTERIORES y recorridos del PRE objetivo, no resultados POST.
    const episodeRanks={} as EpisodeCut['modes'];
    const episodeBroad={} as EpisodeCut['broad'];
    const episodeTight={} as EpisodeCut['tight'];
    const episodeRows=families.map(f=>({
     family:f.family,origin:f.firstSource,routes:f.traces.length,
     sources:new Set(f.traces.map(t=>t.source)).size,
     hit:wins.get(f.family)||0,
     choices:f.traces.map(trace=>({trace,evidence:episodeEvidence(trace,previous,
      lastDays.map(d=>d.date))}))
    }));
    for(const mode of episodeModes){
     const ranked=episodeRows.map(f=>{
      const options=f.choices.filter(c=>episodeFlag(c.evidence,mode))
       .sort((a,b)=>compareScore(episodeScore(a.evidence,mode),
        episodeScore(b.evidence,mode))||
        sources.indexOf(a.trace.source)-sources.indexOf(b.trace.source)||
        positionKey(a.trace.cells).localeCompare(positionKey(b.trace.cells)));
      return options[0]?{family:f.family,trace:options[0].trace,
       evidence:options[0].evidence}:null;
     }).filter((x):x is NonNullable<typeof x>=>x!==null)
      .sort((a,b)=>compareScore(episodeScore(a.evidence,mode),
       episodeScore(b.evidence,mode))||
       sources.indexOf(a.trace.source)-sources.indexOf(b.trace.source)||
       positionKey(a.trace.cells).localeCompare(positionKey(b.trace.cells))||
       a.family.localeCompare(b.family));
     const top=ranked.map(x=>x.family);
     episodeRanks[mode]={
      candidates:ranked.length,
      top3:winning.filter(w=>top.slice(0,3).includes(w.family)).length,
      top5:winning.filter(w=>top.slice(0,5).includes(w.family)).length,
      top10:winning.filter(w=>top.slice(0,10).includes(w.family)).length,
      topFamilies:top.slice(0,10),
      selectedProofs:ranked.slice(0,3).map(x=>({
       family:x.family,shape:x.trace.shape,source:x.trace.source,
       digits:x.trace.value,cells:x.trace.cells,days:x.evidence.history
      }))
     };
     // Un testigo por familia PRE, con comparadores del mismo PRE y fuente.
     const base=episodeRows.map(f=>{
      const positive=f.choices.filter(c=>episodeFlag(c.evidence,mode));
      const choice=(positive.length?positive:f.choices).slice()
       .sort((a,b)=>compareScore(episodeScore(a.evidence,mode),
        episodeScore(b.evidence,mode))||
        sources.indexOf(a.trace.source)-sources.indexOf(b.trace.source)||
        positionKey(a.trace.cells).localeCompare(positionKey(b.trace.cells)))[0];
      return choice?{...f,active:positive.length>0,choice}:null;
     }).filter((x):x is NonNullable<typeof x>=>x!==null);
     const pair=(tight:boolean):CohortStats=>{
      const groups=new Map<string,typeof base>();
      const band=(n:number)=>n<=1?'1':n===2?'2':n<=5?'3-5':n<=12?'6-12':'13+';
      const hist=(n:number)=>n===0?'0':n===1?'1':n===2?'2':'3+';
      for(const x of base){
       const h=x.choice.evidence;
       const key=x.origin+'|'+x.choice.trace.source+'|'+band(x.routes)+'|'+
        (x.sources===1?'una':'varias')+
        (tight?'|'+hist(h.shapeDays)+'|'+hist(h.sourceDays)+
         '|'+hist(h.distinctSources):'');
       if(!groups.has(key))groups.set(key,[]);
       groups.get(key)!.push(x);
      }
      const out:CohortStats={treated:0,control:0,hitT:0,hitC:0,observed:0,
       expected:0,strata:0};
      for(const xs of groups.values()){
       const a=xs.filter(x=>x.active),b=xs.filter(x=>!x.active);
       if(!a.length||!b.length)continue;
       const ha=a.reduce((n,x)=>n+x.hit,0),hb=b.reduce((n,x)=>n+x.hit,0);
       out.treated+=a.length;out.control+=b.length;out.hitT+=ha;out.hitC+=hb;
       out.observed+=ha;out.expected+=a.length/(a.length+b.length)*(ha+hb);
       out.strata++;
      }
      return out;
     };
     episodeBroad[mode]=pair(false);episodeTight[mode]=pair(true);
    }
    episodeCuts.push({date:day.date,turn,period,modes:episodeRanks,
     broad:episodeBroad,tight:episodeTight});
    const figureSelection={} as FigRecord['modes'];
    const figureControls={} as FigRecord['controls'];
    const refs=families.map(f=>({
     family:f.family,firstSource:f.firstSource,routeCount:f.traces.length,
     hit:wins.get(f.family)||0,
     all:f.traces.map(t=>({trace:t,
      infoByMode:Object.fromEntries(figureModes.map(mode=>[
       mode,inspectFigure(t,previous,weekly,day.date,mode)])) as
       Record<FigureMode,ReturnType<typeof inspectFigure>>}))
    }));
    for(const mode of figureModes){
     const chosen=refs.map(f=>{
      const witnesses=f.all.filter(t=>t.infoByMode[mode].days>0)
       .sort((a,b)=>compareScore(figureScore(a.infoByMode[mode]),
        figureScore(b.infoByMode[mode]))||
        sources.indexOf(a.trace.source)-sources.indexOf(b.trace.source)||
        positionKey(a.trace.cells).localeCompare(positionKey(b.trace.cells)));
      const best=witnesses[0];
      return best?{family:f.family,...best}:null;
     }).filter((x):x is NonNullable<typeof x>=>x!==null)
      .sort((a,b)=>compareScore(figureScore(a.infoByMode[mode]),
       figureScore(b.infoByMode[mode]))||
       sources.indexOf(a.trace.source)-sources.indexOf(b.trace.source)||
       positionKey(a.trace.cells).localeCompare(positionKey(b.trace.cells))||
       a.family.localeCompare(b.family));
     const rank=chosen.map(x=>x.family);
     figureSelection[mode]={
      eligibleFamilies:rank.length,
      top3:winning.filter(x=>rank.slice(0,3).includes(x.family)).length,
      top5:winning.filter(x=>rank.slice(0,5).includes(x.family)).length,
      top10:winning.filter(x=>rank.slice(0,10).includes(x.family)).length,
      topFamilies:rank.slice(0,10),
      topWitnesses:chosen.slice(0,3).map(x=>({
       family:x.family,shape:x.trace.shape,source:x.trace.source,
       digits:x.trace.value,cells:x.trace.cells,
       witnesses:x.infoByMode[mode].witnesses.slice(0,8)}))
     };
     const groups=new Map<string,{marked:boolean;hit:number}[]>();
     const band=(n:number)=>n<=1?'1':n===2?'2':n<=5?'3-5':n<=12?'6-12':'13+';
     for(const f of refs){
      const active=f.all.filter(t=>t.infoByMode[mode].days>0);
      const comparable=(active.length?active:f.all).slice().sort((a,b)=>
       compareScore(figureScore(a.infoByMode[mode]),
        figureScore(b.infoByMode[mode]))||
       sources.indexOf(a.trace.source)-sources.indexOf(b.trace.source))[0];
      if(!comparable)continue;
      const key=f.firstSource+'|'+comparable.trace.source+'|'+band(f.routeCount);
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key)!.push({marked:active.length>0,hit:f.hit});
     }
     const stats:FigControl={treated:0,control:0,hitT:0,hitC:0,
      observed:0,expected:0,strata:0};
     for(const arr of groups.values()){
      const a=arr.filter(x=>x.marked),b=arr.filter(x=>!x.marked);
      if(!a.length||!b.length)continue;
      const ha=a.reduce((n,x)=>n+x.hit,0),hb=b.reduce((n,x)=>n+x.hit,0);
      stats.treated+=a.length;stats.control+=b.length;
      stats.hitT+=ha;stats.hitC+=hb;
      stats.observed+=ha;stats.expected+=a.length/(a.length+b.length)*(ha+hb);
      stats.strata++;
     }
     figureControls[mode]=stats;
    }
    const currentShapes=[...new Set(families.flatMap(f=>f.traces.map(t=>t.shape)))];
    if(currentShapes.some(sh=>!theoreticalShapes.includes(sh)))
     throw Error('Figura no pertenece a las 19 VT3 del +11');
    const historyShapes=new Set(previous.map(e=>e.shape));
    figureCuts.push({date:day.date,turn,period,
     availableShapes:currentShapes.length,historyShapes:historyShapes.size,
     shapeNames:currentShapes,modes:figureSelection,controls:figureControls});
    // Configuraciones apoyadas en DOS cabezas anteriores independientes.
    const historicalPairs=lastDays.flatMap(d=>connectedHistory.get(d.date)||[]);
    if(week&&!lastDays.some(d=>d.date===week.day.date))
     historicalPairs.push(...(connectedHistory.get(week.day.date)||[]));
    if(historicalPairs.some(p=>p.date>=day.date))
     throw Error('Una configuración histórica contiene el sorteo objetivo');
    const currentTraces=families.flatMap(f=>f.traces);
    const combined={} as ConnectedCut['modes'];
    const pairControls={} as ConnectedCut['controls'];
    for(const mode of pairModes){
     const ranking=projectVerifiedConfigurations(historicalPairs,currentTraces,
      day.date,week?.day.date||null,mode);
     const names=ranking.map(p=>p.family);
     combined[mode]={
      candidates:ranking.length,
      top3:winning.filter(w=>names.slice(0,3).includes(w.family)).length,
      top5:winning.filter(w=>names.slice(0,5).includes(w.family)).length,
      top10:winning.filter(w=>names.slice(0,10).includes(w.family)).length,
      families:names.slice(0,10),
      witnesses:ranking.slice(0,3).map(p=>({
       family:p.family,source:p.source,actualDigits:p.digits,actualCells:p.cells,
       oldHeads:p.pastHeads,oldSource:p.historySource,config:p.historicConfiguration,
       firstDate:p.firstDate,lastDate:p.lastDate,historyDays:p.historyDays,
       physicalShift:p.relativeShift
      }))
     };
     const eligible=new Set(names);
     const strata=new Map<string,{hit:number;yes:boolean}[]>();
     for(const f of families){
      const n=f.traces.length;
      const band=n<=1?'1':n===2?'2':n<=5?'3-5':n<=12?'6-12':'13+';
      const sourcesN=new Set(f.traces.map(t=>t.source)).size;
      const key=f.firstSource+'|'+band+'|'+(sourcesN===1?'una':'varias');
      if(!strata.has(key))strata.set(key,[]);
      strata.get(key)!.push({hit:wins.get(f.family)||0,yes:eligible.has(f.family)});
     }
     const z:PairControl={treated:0,control:0,hitT:0,hitC:0,
      observed:0,expected:0,strata:0};
     for(const values of strata.values()){
      const yes=values.filter(x=>x.yes),no=values.filter(x=>!x.yes);
      if(!yes.length||!no.length)continue;
      const hitA=yes.reduce((n,x)=>n+x.hit,0),hitB=no.reduce((n,x)=>n+x.hit,0);
      z.treated+=yes.length;z.control+=no.length;
      z.hitT+=hitA;z.hitC+=hitB;z.observed+=hitA;
      z.expected+=yes.length/values.length*(hitA+hitB);z.strata++;
     }
     pairControls[mode]=z;
    }
    connectedCuts.push({date:day.date,turn,period,
     historyPairs:historicalPairs.length,modes:combined,controls:pairControls});
    const conMothers=projectVerifiedConfigurations(
     historicalPairs,currentTraces,day.date,week?.day.date||null,'SOLAPADAS_OTRA');
    const visibleCols=pre.columns.slice(0,idx+1);
    const geoder=deriveFromMothers(geo.top.map(p=>({
     family:p.family,source:p.source,cells:p.cells,value:p.value
    })),visibleCols,10);
    const connectedDer=deriveFromMothers(conMothers.map(p=>({
     family:p.family,source:p.source,cells:p.cells,value:p.digits
    })),visibleCols,10);
    const daughterRankings:Record<DerivedMode,Record<DerivedKind,{
     family:string;values:string[]}[]>>={
     LALO:{
      vt2:official.ranks.vt2.map(f=>({family:f.family,
       values:[...new Set(f.paths.map(p=>p.value))]})),
      vt4:official.ranks.vt4.map(f=>({family:f.family,
       values:[...new Set(f.paths.map(p=>p.value))]}))
     },
     GEOMETRIA_DERIVADA:{
      vt2:geoder.vt2.map(f=>({family:f.family,values:f.values})),
      vt4:geoder.vt4.map(f=>({family:f.family,
       values:[...new Set(f.paths.map(x=>x.value))]}))
     },
     CONECTADAS_DERIVADA:{
      vt2:connectedDer.vt2.map(f=>({family:f.family,values:f.values})),
      vt4:connectedDer.vt4.map(f=>({family:f.family,
       values:[...new Set(f.paths.map(x=>x.value))]}))
     }
    };
    const derivedScores={} as DerivedScores;
    for(const mode of derivedModes){
     derivedScores[mode]={} as DerivedScores[DerivedMode];
     for(const kind of ['vt2','vt4'] as const){
      const available=daughterRankings[mode][kind];
      const matches=(n:number)=>actualHeads.filter(h=>available.slice(0,n)
       .some(f=>kind==='vt2'?
        f.family===reversibleFamily(h.slice(-2)):f.values.includes(h))).length;
      derivedScores[mode][kind]={
       count:available.length,top3:matches(3),top5:matches(5),
       top6:matches(6),top10:matches(10),
       firstFamilies:available.slice(0,10).map(f=>f.family),
       matchedHeads:actualHeads.flatMap(h=>{
        const pos=available.findIndex(f=>kind==='vt2'?
         f.family===reversibleFamily(h.slice(-2)):f.values.includes(h));
        return pos<0?[]:[{head:h,family:available[pos].family,position:pos+1}];
       })
      };
     }
    }
    // Cobertura física TOTAL (no confundir acierto de ranking con
    // existencia de dos / cuatro casillas en la hoja predictiva).
    const physicalVt2=actualHeads.filter(h=>visibleCols.some(c=>
     findPaths(c.values,h.slice(-2)).length>0)).length;
    const physicalVt4=actualHeads.filter(h=>visibleCols.some(c=>
     findPaths(c.values,h).length>0)).length;
    derivedCuts.push({date:day.date,period,turn,heads:actualHeads,
     physicalVt2,physicalVt4,scores:derivedScores});
    // Sensibilidad temporal: no se ajusta el algoritmo ni se leen cabezas POST.
    // Control con el mismo horizonte de seis jornadas, pero más antiguo.
    const historicalSets:Record<Sensitivity,Pair[]>={
     ULTIMAS_3:days.slice(index-3,index).flatMap(d=>connectedHistory.get(d.date)||[]),
     ULTIMAS_6:days.slice(index-6,index).flatMap(d=>connectedHistory.get(d.date)||[]),
     ULTIMAS_6_D7:historicalPairs,
     ANTIGUAS_7_A_12:days.slice(Math.max(0,index-12),index-6)
      .flatMap(d=>connectedHistory.get(d.date)||[]),
     SOLO_D7:week?(connectedHistory.get(week.day.date)||[]):[]
    };
    const sensitivityResults={} as (typeof sensitivityCuts)[number]['methods'];
    for(const key of sensitivityNames){
     const proposals=projectVerifiedConfigurations(historicalSets[key],currentTraces,
      day.date,week?.day.date||null,'SOLAPADAS_OTRA');
     const top=proposals.map(p=>p.family);
     sensitivityResults[key]={eligible:proposals.length,
      top3:winning.filter(w=>top.slice(0,3).includes(w.family)).length,
      top5:winning.filter(w=>top.slice(0,5).includes(w.family)).length,
      top10:winning.filter(w=>top.slice(0,10).includes(w.family)).length,
      top3Families:top.slice(0,3),source:proposals[0]?.historySource||null};
    }
    sensitivityCuts.push({date:day.date,period,turn,methods:sensitivityResults});
    const memberScores=evidenceByMethod.FIGURA_REITERADA;
    const checks=Object.fromEntries(controls.map(method=>
     [method,controlled(currentRows,method)])) as Record<ControlMethod,ControlLine>;
    controlByCut.push({date:day.date,period,turn,res:checks});
    const scores=Object.fromEntries((Object.keys(rankings) as MatchMethod[]).map(k=>[
     k,{top3:winning.filter(w=>rankings[k].slice(0,3).includes(w.family)).length,
      top5:winning.filter(w=>rankings[k].slice(0,5).includes(w.family)).length,
      top10:winning.filter(w=>rankings[k].slice(0,10).includes(w.family)).length,
      topFamilies:rankings[k].slice(0,10)}
    ])) as CutResult['scores'];
    const physicalWinnerDetails=winning.filter(w=>eligible.has(w.family)).map(w=>{
     const f=eligible.get(w.family)!;
     const witness=memberScores.get(w.family)!.trace;
     const actualPast=previous.filter(e=>e.shape===witness.shape).map(e=>({
      date:e.date,turn:e.turn,jur:e.jur,head:e.head,source:e.source,
      historicalCells:e.cells
     }));
     return {head:w.head,family:w.family,source:witness.source,shape:witness.shape,
      currentCells:witness.cells,currentDigits:witness.value,
      sameSourceHistoricalEvidence:actualPast.filter(e=>e.source===witness.source).slice(0,12),
      otherSourceHistoricalEvidence:actualPast.filter(e=>e.source!==witness.source).slice(0,12),
      weeklySameSourceEvidence:weekly.filter(e=>e.shape===witness.shape&&e.source===witness.source)
       .map(e=>({date:e.date,turn:e.turn,jur:e.jur,head:e.head,source:e.source,
        historicalCells:e.cells})).slice(0,12),
      paths:f.traces.length,
      ranks: Object.fromEntries((Object.keys(rankings) as MatchMethod[]).map(k=>[
       k, rankings[k].indexOf(w.family)>=0 ? rankings[k].indexOf(w.family)+1 : null
      ])) as Record<MatchMethod,number|null>};
    });
    cuts.push({date:day.date,turn,period,heads:actualHeads,
     winners:winning.map(w=>w.family),availableFamilies:families.length,
     physicalWinningHeads,verifiedEventCount:previous.length,
     distinctActiveShapes:new Set(previous.map(e=>e.shape)).size,
     shapeAvailability:controls.map(m=>({name:m,qualifiedFamilies:checks[m].activeExposures,
      qualifiedWinningHeads:checks[m].activeWinners})),
     scores,
     neutral:{top3:physicalWinningHeads*Math.min(3,families.length)/Math.max(families.length,1),
      top5:physicalWinningHeads*Math.min(5,families.length)/Math.max(families.length,1),
      top10:physicalWinningHeads*Math.min(10,families.length)/Math.max(families.length,1)},
     physicalWinnerDetails});
   }
  }
 }
 if(cuts.length!==(extra16?525:520)||
  cuts.reduce((n,x)=>n+x.physicalWinningHeads,0)!==(extra16?657:654))
  throw Error('El histórico corregido dejó de coincidir con 520/654: '+
   cuts.length+'/'+cuts.reduce((n,x)=>n+x.physicalWinningHeads,0));
 const seqTotals=(items:typeof seqByCut)=>Object.fromEntries(sequenceModes.map(mode=>{
  const x={top3:0,top5:0,top10:0,cutsWithCandidates:0,cutsWithAtLeast3:0,
   qualifiedSlots:0,treated:0,control:0,hitsT:0,hitsC:0,expected:0,observed:0,strata:0};
  for(const item of items){
   const m=item.modes[mode],c=item.control[mode];
   x.top3+=m.top3;x.top5+=m.top5;x.top10+=m.top10;
   x.cutsWithCandidates+=Number(m.available>0);
   x.cutsWithAtLeast3+=Number(m.available>=3);
   x.qualifiedSlots+=Math.min(3,m.available);
   x.treated+=c.treated;x.control+=c.control;
   x.hitsT+=c.hitsT;x.hitsC+=c.hitsC;
   x.expected+=c.expected;x.observed+=c.observed;x.strata+=c.strata;
  }
  return [mode,x];
 }));
 const summarizeEpisodes=(xs:typeof episodeCuts)=>Object.fromEntries(episodeModes.map(mode=>{
  const r={cutsWithCandidates:0,cutsAtLeast3:0,top3:0,top5:0,top10:0,
   eligibleFamilies:0,broad:{treated:0,control:0,hitT:0,hitC:0,observed:0,expected:0,strata:0},
   tight:{treated:0,control:0,hitT:0,hitC:0,observed:0,expected:0,strata:0}};
  for(const cut of xs){
   const a=cut.modes[mode];r.cutsWithCandidates+=Number(a.candidates>0);
   r.cutsAtLeast3+=Number(a.candidates>=3);r.eligibleFamilies+=a.candidates;
   r.top3+=a.top3;r.top5+=a.top5;r.top10+=a.top10;
   for(const key of ['broad','tight'] as const){
    const t=cut[key][mode];
    for(const k of Object.keys(t) as (keyof CohortStats)[])r[key][k]+=t[k];
   }
  }
  return [mode,r];
 }));
 const summarizeFigures=(xs:typeof figureCuts)=>Object.fromEntries(figureModes.map(mode=>{
  const v={cutsWithCandidates:0,cutsWith3:0,totalEligible:0,
   top3:0,top5:0,top10:0,
   matched:{treated:0,control:0,hitT:0,hitC:0,observed:0,expected:0,strata:0}};
  for(const x of xs){
   const m=x.modes[mode],c=x.controls[mode];
   v.cutsWithCandidates+=Number(m.eligibleFamilies>0);
   v.cutsWith3+=Number(m.eligibleFamilies>=3);
   v.totalEligible+=m.eligibleFamilies;
   v.top3+=m.top3;v.top5+=m.top5;v.top10+=m.top10;
   for(const k of Object.keys(c) as (keyof FigControl)[])v.matched[k]+=c[k];
  }
  return [mode,v];
 }));
 const summarizeConnected=(all:typeof connectedCuts)=>Object.fromEntries(pairModes.map(mode=>{
  const out={cutsWithCandidates:0,cutsAtLeast3:0,availableFamilies:0,
   top3:0,top5:0,top10:0,
   control:{treated:0,control:0,hitT:0,hitC:0,observed:0,expected:0,strata:0}};
  for(const cut of all){
   const x=cut.modes[mode],z=cut.controls[mode];
   out.cutsWithCandidates+=Number(x.candidates>0);
   out.cutsAtLeast3+=Number(x.candidates>=3);
   out.availableFamilies+=x.candidates;
   out.top3+=x.top3;out.top5+=x.top5;out.top10+=x.top10;
   for(const key of Object.keys(z) as (keyof PairControl)[])
    out.control[key]+=z[key];
  }
  return [mode,out];
 }));
 const aggregates=(xs:typeof controlByCut)=>{
  return Object.fromEntries(controls.map(k=>[k,xs.reduce((out,c)=>plus(out,c.res[k]),emptyControl())]));
 };
 const episodeComparisons=Object.fromEntries(episodeModes.map(mode=>{
  const matched=episodeCuts.filter(x=>x.modes[mode].candidates>=3);
  const keys=new Set(matched.map(x=>x.date+'|'+x.turn));
  const subset=cuts.filter(x=>keys.has(x.date+'|'+x.turn));
  return [mode,{eligibleCuts:subset.length,
   experimental:makeTotals(subset).methods,
   episodeRankings:{
    top3:matched.reduce((n,x)=>n+x.modes[mode].top3,0),
    top5:matched.reduce((n,x)=>n+x.modes[mode].top5,0),
    top10:matched.reduce((n,x)=>n+x.modes[mode].top10,0)},
   byPeriod:Object.fromEntries(['JUNIO_JULIO','AGOSTO_OCTUBRE'].map(p=>{
    const ss=subset.filter(x=>x.period===p);
    const es=matched.filter(x=>x.period===p);
    return [p,{cuts:ss.length,
     LALO:makeTotals(ss).methods.LALO,
     GEOMETRIA:makeTotals(ss).methods.GEOMETRIA,
     episodes:{top3:es.reduce((n,x)=>n+x.modes[mode].top3,0),
      top5:es.reduce((n,x)=>n+x.modes[mode].top5,0),
      top10:es.reduce((n,x)=>n+x.modes[mode].top10,0)}}];
   }))}];
 }));
 const episodeExamples=Object.fromEntries(episodeModes.map(mode=>{
  const all=episodeCuts.flatMap(x=>{
   const cut=cuts.find(c=>c.date===x.date&&c.turn===x.turn)!;
   return x.modes[mode].selectedProofs.flatMap(proof=>{
    const matching=cut.winners.map((f,i)=>({family:f,head:cut.heads[i]}))
     .filter(w=>w.family===proof.family);
    if(!matching.length)return [];
    const index=byDate.get(x.date)?.i??0;
    const priorDays=days.slice(Math.max(0,index-6),index);
    const history=priorDays.flatMap(d=>(histories.get(d.date)?.events||[])
     .filter(e=>e.shape===proof.shape).map(e=>({
      date:e.date,turn:e.turn,jur:e.jur,head:e.head,
      source:e.source,cells:e.cells
     })));
    return matching.map(w=>({date:x.date,period:x.period,turn:x.turn,
     head:w.head,family:w.family,source:proof.source,
     digits:proof.digits,cells:proof.cells,shape:proof.shape,history}));
   });
  });
  return [mode,{total:all.length,examples:[
    ...all.filter(x=>x.period==='JUNIO_JULIO').slice(0,3),
    ...all.filter(x=>x.period==='AGOSTO_OCTUBRE').slice(0,3)
   ]}];
 }));
 const report={protocol:{
  sequence:'CABEZA REAL publicada en jornada anterior -> RECORRIDO VT3 exacto en columna +11 -> FIGURA normalizada por pasos -> REAPARICIÓN en +11 PRE de una fecha futura -> LECTURA de tres cifras nuevas -> familia reversible -> evaluación posterior.',
  historicalOnly:'Seis jornadas anteriores con Nocturna real, además del mismo día calendario D−7 cuando existe.',
  units:'Cada cabeza real × fuente × figura × turno antiguo cuenta una vez (inversiones/caminos repetidos no multiplican evidencia).',
  path:'Tres casillas adyacentes sin salto y sin cruzar dos columnas del turno de origen; familias reversibles.',
  noLeak:'Ninguna cabeza del turno objetivo o posterior se entrega al lector; no se alteran hojas anteriores.',
  ranking:'FIGURA_REITERADA por días distintos de coincidencia real; MISMA_FUENTE por días con la misma figura y columna; CAMBIO_DE_FUENTE por figura confirmada en más de una fuente. Desempate físico determinista, no escogido mirando resultados.',
  controls:'Dentro de cada PRE + primera fuente física y banda de rutas, comparar familias con figura ganadora repetida contra otras familias geométricamente disponibles; no confundir rutas con cabezas.',
  sample:'104 jornadas, 520 PRE históricos corregidos y 2600 cabezas argentinas, Montevideo solo fuente física.'
 },summary:Object.fromEntries([...periods.map(x=>x[2]),'TOTAL'].map(p=>{
  const sel=p==='TOTAL'?cuts:cuts.filter(x=>x.period===p);
  const cont=p==='TOTAL'?controlByCut:controlByCut.filter(x=>x.period===p);
  return [p,{...makeTotals(sel),controls:aggregates(cont),
   connected:summarizeConnected(connectedCuts.filter(x=>p==='TOTAL'||x.period===p)),
   figureIdentity:summarizeFigures(figureCuts.filter(x=>p==='TOTAL'||x.period===p)),
   episodes:summarizeEpisodes(episodeCuts.filter(x=>p==='TOTAL'||x.period===p)),
   sequences:seqTotals(seqByCut.filter(x=>p==='TOTAL'||x.period===p)),
   metrics:{avgAvailableFamilies:sel.reduce((n,x)=>n+x.availableFamilies,0)/sel.length,
    avgActiveShapes:sel.reduce((n,x)=>n+x.distinctActiveShapes,0)/sel.length,
    avgHistoryEvents:sel.reduce((n,x)=>n+x.verifiedEventCount,0)/sel.length}}];
 })),byTurn:Object.fromEntries(TURNOS.map(t=>{
  const xs=cuts.filter(x=>x.turn===t);
  return [t,{...makeTotals(xs),controls:aggregates(controlByCut.filter(x=>x.turn===t)),
   sequences:seqTotals(seqByCut.filter(x=>x.turn===t)),
   episodes:summarizeEpisodes(episodeCuts.filter(x=>x.turn===t)),
   figureIdentity:summarizeFigures(figureCuts.filter(x=>x.turn===t)),
   connected:summarizeConnected(connectedCuts.filter(x=>x.turn===t))}];
 })),episodeComparisons,episodeExamples,checksums:dataHashes,
 cuts,sequenceCuts:seqByCut,episodeCuts,figureCuts,connectedCuts,sensitivityCuts,derivedCuts};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/FIGURAS_COMPROBADAS_A_PRE_'+(extra16?'525':'520')+'.json',
  JSON.stringify(report,null,2)+'\n');
 const traceExamples=seqByCut.filter(x=>
  x.modes.AABB.top3>0||x.modes.AAB.top3>0).map(x=>{
   const cut=cuts.find(c=>c.date===x.date&&c.turn===x.turn)!;
   const result=(['AAB','AABB'] as SequenceMode[]).flatMap(mode=>{
    const top=x.modes[mode].topWitnesses;
    return top.filter(w=>cut.winners.includes(w.family)).map(w=>{
     const headIndex=cut.winners.findIndex((family,i)=>family===w.family);
     const olderDates=days.filter(d=>d.date<x.date).slice(-6).map(d=>d.date);
     const confirmed=olderDates.flatMap(d=>
      (histories.get(d)?.events||[]).filter(e=>e.shape===w.shape)
       .map(e=>({date:e.date,turn:e.turn,jur:e.jur,head:e.head,
        source:e.source,cells:e.cells})));
     return {date:x.date,turn:x.turn,mode,head:cut.heads[headIndex],
      family:w.family,currentSource:w.source,currentDigits:w.digits,
      currentCells:w.cells,shape:w.shape,verifiedTimeline:confirmed};
    });
   });
   return result;
  }).flat();
 console.log('SECUENCIAS_CASOS_INICIO');
 console.log(JSON.stringify(traceExamples.slice(0,20),null,2));
 console.log('SECUENCIAS_CASOS_FIN');
 console.log('SECUENCIAS_PRE_INICIO');
 console.log(JSON.stringify({periods:Object.fromEntries(
  Object.entries(report.summary).map(([p,v])=>[p,{
   days:v.days,cuts:v.cuts,physicalWinners:v.physicalWinners,
   baseline:v.methods,sequences:v.sequences}])),
  byTurn:Object.fromEntries(Object.entries(report.byTurn).map(([k,v])=>[k,v.sequences]))
 },null,2));
 console.log('SECUENCIAS_PRE_FIN');
 console.log('EPISODIOS_COMPARABLES_INICIO');
 console.log(JSON.stringify({comparisons:episodeComparisons,examples:episodeExamples},null,2));
 console.log('EPISODIOS_COMPARABLES_FIN');
 console.log('EPISODIOS_PRE_RESULTADOS_INICIO');
 console.log(JSON.stringify({summary:Object.fromEntries(
  Object.entries(report.summary).map(([p,v])=>[p,{cuts:v.cuts,
   heads:v.heads,physicalWinners:v.physicalWinners,baselines:v.methods,
   episodes:v.episodes}])),
  byTurn:Object.fromEntries(Object.entries(report.byTurn).map(([p,v])=>[p,v.episodes]))
 },null,2));
 console.log('EPISODIOS_PRE_RESULTADOS_FIN');
 const figureMatched=Object.fromEntries(figureModes.map(mode=>{
  const chosen=figureCuts.filter(c=>c.modes[mode].eligibleFamilies>=3);
  const dates=new Set(chosen.map(c=>c.date+'|'+c.turn));
  const same=cuts.filter(c=>dates.has(c.date+'|'+c.turn));
  return [mode,{eligibleCuts:chosen.length,reference:{
   LALO:makeTotals(same).methods.LALO,
   GEOMETRIA:makeTotals(same).methods.GEOMETRIA
  },candidate:{top3:chosen.reduce((n,c)=>n+c.modes[mode].top3,0),
   top5:chosen.reduce((n,c)=>n+c.modes[mode].top5,0),
   top10:chosen.reduce((n,c)=>n+c.modes[mode].top10,0)}}];
 }));
 const oldProofs=[...histories.values()].flatMap(x=>x.events);
 const physicalVerifiedPathCount=oldProofs.length;
 const distinctHistoricalHeads=new Set(oldProofs.map(x=>
  [x.date,x.turn,x.jur,x.head,x.source,x.shape].join('|'))).size;
 const multiplePhysicalRoutes=physicalVerifiedPathCount-distinctHistoricalHeads;
 if(multiplePhysicalRoutes<0)throw Error('Conteo de testigos físicos inconsistente');
 const figureSummary={physicalVerifiedPathCount,distinctHistoricalHeads,
  multiplePhysicalRoutes,theoreticalShapes:theoreticalShapes.length,
  seenOnPre:[...new Set(figureCuts.flatMap(c=>c.shapeNames))].length,
  minOnPre:Math.min(...figureCuts.map(c=>c.availableShapes)),
  maxOnPre:Math.max(...figureCuts.map(c=>c.availableShapes)),
  avgOnPre:figureCuts.reduce((n,c)=>n+c.availableShapes,0)/figureCuts.length,
  medianOnPre:figureCuts.map(c=>c.availableShapes).sort((a,b)=>a-b)[Math.floor(figureCuts.length/2)],
  preWithAll19:figureCuts.filter(c=>c.availableShapes===19).length,
  pastAvgUnique:figureCuts.reduce((n,c)=>n+c.historyShapes,0)/figureCuts.length};
 const shiftedCases=figureCuts.flatMap(f=>{
  const winning=cuts.find(x=>x.date===f.date&&x.turn===f.turn)!;
  const available=f.modes.DESPLAZADA_2_FILAS.topWitnesses;
  return available.filter(x=>winning.winners.includes(x.family)).map(x=>({
   date:f.date,period:f.period,turn:f.turn,family:x.family,
   winningHeads:winning.heads.filter((h,i)=>winning.winners[i]===x.family),
   source:x.source,shape:x.shape,newDigits:x.digits,currentCells:x.cells,
   verifiedOldHeads:x.witnesses.slice(0,5),
   geometryTop3:winning.scores.GEOMETRIA.topFamilies.slice(0,3),
   laloTop3:winning.scores.LALO.topFamilies.slice(0,3)
  }));
 });
 const byTurnIdentity=Object.fromEntries(TURNOS.map(t=>{
  const part=figureCuts.filter(x=>x.turn===t);
  const base=cuts.filter(x=>x.turn===t);
  return [t,{shiftTop3:part.reduce((n,x)=>n+x.modes.DESPLAZADA_2_FILAS.top3,0),
   geoTop3:base.reduce((n,x)=>n+x.scores.GEOMETRIA.top3,0),
   laloTop3:base.reduce((n,x)=>n+x.scores.LALO.top3,0),
   shiftedCandidates:part.reduce((n,x)=>n+x.modes.DESPLAZADA_2_FILAS.eligibleFamilies,0),
   cuts:part.length}];
 }));
 console.log('FIGURA_IDENTIDAD_CASOS_INICIO');
 console.log(JSON.stringify({byTurnIdentity,examples:shiftedCases.slice(0,25)},null,2));
 console.log('FIGURA_IDENTIDAD_CASOS_FIN');
 console.log('FIGURA_IDENTIDAD_INICIO');
 console.log(JSON.stringify({figureSummary,figureMatched,periods:Object.fromEntries(
  Object.entries(report.summary).map(([key,value])=>[key,{
   days:value.days,cuts:value.cuts,reference:value.methods,
   modes:value.figureIdentity}]))},null,2));
 console.log('FIGURA_IDENTIDAD_FIN');
 // Comparación de complementariedad sin crear nuevas familias ni mover MV1:
 // dos puestos de un lector + uno del otro, siempre con números del PRE.
 const hybridModes=['GEO2_CON1','GEO1_CON2','CON2_GEO1','CON1_GEO2'] as const;
 type Hybrid=typeof hybridModes[number];
 const connectedByKey=new Map(connectedCuts.map(x=>[x.date+'|'+x.turn,x]));
 const hybridCut=cuts.map(cut=>{
  const other=connectedByKey.get(cut.date+'|'+cut.turn)!;
  const geo=cut.scores.GEOMETRIA.topFamilies;
  const con=other.modes.SOLAPADAS_OTRA.families;
  const pick=(first:string[],second:string[],a:number,b:number)=>{
   const result:string[]=[];
   for(const family of first)if(result.length<a&&!result.includes(family))
    result.push(family);
   for(const family of second)if(result.length<a+b&&!result.includes(family))
    result.push(family);
   for(const family of [...first,...second])
    if(result.length<3&&!result.includes(family))result.push(family);
   return result.slice(0,3);
  };
  const lists:Record<Hybrid,string[]>={
   GEO2_CON1:pick(geo,con,2,1),GEO1_CON2:pick(geo,con,1,2),
   CON2_GEO1:pick(con,geo,2,1),CON1_GEO2:pick(con,geo,1,2)
  };
  const winners=cut.winners;
  // Dos Top3 independientes permiten hasta 6 familias distintas; no debe
  // contarse una repetición compartida como un candidato adicional.
  const distinctTop6=[...new Set([...geo.slice(0,3),...con.slice(0,3)])];
  const six=[...distinctTop6];
  for(const f of [...geo,...con])if(six.length<6&&!six.includes(f))six.push(f);
  const sixMetrics={
   slotsWithoutFill:distinctTop6.length,
   duoUpToSix:winners.filter(x=>distinctTop6.includes(x)).length,
   duoSixFilled:winners.filter(x=>six.includes(x)).length,
   geoSix:winners.filter(x=>geo.slice(0,6).includes(x)).length,
   connectedSix:winners.filter(x=>con.slice(0,6).includes(x)).length
  };
  const both=winners.filter(f=>geo.slice(0,3).includes(f)&&con.slice(0,3).includes(f)).length;
  const geoOnly=winners.filter(f=>geo.slice(0,3).includes(f)&&!con.slice(0,3).includes(f)).length;
  const connectedOnly=winners.filter(f=>!geo.slice(0,3).includes(f)&&con.slice(0,3).includes(f)).length;
  return {date:cut.date,period:cut.period,turn:cut.turn,both,geoOnly,connectedOnly,sixMetrics,
   byMode:Object.fromEntries(hybridModes.map(m=>[m,
    winners.filter(f=>lists[m].includes(f)).length])) as Record<Hybrid,number>,
   examples:winners.map((f,i)=>({family:f,head:cut.heads[i],
    geo:geo.slice(0,3).indexOf(f)+1,connected:con.slice(0,3).indexOf(f)+1}))
    .filter(x=>x.geo===0&&x.connected>0).slice(0,2)
  };
 });
 const hybridReport=Object.fromEntries(['JUNIO_JULIO','AGOSTO_OCTUBRE','TOTAL'].map(period=>{
  const subset=hybridCut.filter(x=>period==='TOTAL'||x.period===period);
  const full=cuts.filter(x=>period==='TOTAL'||x.period===period);
  const con=connectedCuts.filter(x=>period==='TOTAL'||x.period===period);
  return [period,{cuts:subset.length,
   geometry:full.reduce((n,x)=>n+x.scores.GEOMETRIA.top3,0),
   connected:con.reduce((n,x)=>n+x.modes.SOLAPADAS_OTRA.top3,0),
   both:subset.reduce((n,x)=>n+x.both,0),
   geometryOnly:subset.reduce((n,x)=>n+x.geoOnly,0),
   connectedOnly:subset.reduce((n,x)=>n+x.connectedOnly,0),
   sixFamilyComparisons:{
    unionTop3PlusTop3:subset.reduce((n,x)=>n+x.sixMetrics.duoUpToSix,0),
    unionBackfilledSix:subset.reduce((n,x)=>n+x.sixMetrics.duoSixFilled,0),
    geometryTop6:subset.reduce((n,x)=>n+x.sixMetrics.geoSix,0),
    connectedTop6:subset.reduce((n,x)=>n+x.sixMetrics.connectedSix,0),
    averageUniqueSlots:subset.reduce((n,x)=>n+x.sixMetrics.slotsWithoutFill,0)/
      Math.max(1,subset.length)
   },
   hybrids:Object.fromEntries(hybridModes.map(m=>[m,subset.reduce((n,x)=>n+x.byMode[m],0)])),
   connectedUniqueExamples:subset.flatMap(x=>x.examples.map(e=>({
    date:x.date,turn:x.turn,...e}))).slice(0,6)
  }];
 }));
 const connectedMatched=Object.fromEntries(pairModes.map(mode=>{
  const eligible=connectedCuts.filter(c=>c.modes[mode].candidates>=3);
  const keys=new Set(eligible.map(x=>x.date+'|'+x.turn));
  const refCuts=cuts.filter(x=>keys.has(x.date+'|'+x.turn));
  return [mode,{cuts:eligible.length,official:makeTotals(refCuts).methods.LALO,
   geometry:makeTotals(refCuts).methods.GEOMETRIA,
   connected:{top3:eligible.reduce((n,x)=>n+x.modes[mode].top3,0),
    top5:eligible.reduce((n,x)=>n+x.modes[mode].top5,0),
    top10:eligible.reduce((n,x)=>n+x.modes[mode].top10,0)}}];
 }));
 const connectedExamples=Object.fromEntries(pairModes.map(mode=>{
  const winners=connectedCuts.flatMap(cut=>{
   const actual=cuts.find(x=>x.date===cut.date&&x.turn===cut.turn)!;
   return cut.modes[mode].witnesses.flatMap(w=>{
    const heads=actual.heads.filter((head,i)=>actual.winners[i]===w.family);
    return heads.map(head=>({date:cut.date,period:cut.period,turn:cut.turn,
     head,...w,geometryTop3:actual.scores.GEOMETRIA.topFamilies.slice(0,3)}));
   });
  });
  return [mode,{count:winners.length,examples:[
   ...winners.filter(x=>x.period==='JUNIO_JULIO').slice(0,3),
   ...winners.filter(x=>x.period==='AGOSTO_OCTUBRE').slice(0,3)]}];
 }));
 const historicPairInventory={
  total:[...connectedHistory.values()].reduce((n,x)=>n+x.length,0),
  days:[...connectedHistory.values()].filter(x=>x.length>0).length,
  types:Object.fromEntries(['COMPARTEN_UNA_CASILLA','COMPARTEN_DOS_CASILLAS','SOLO_ROCE']
   .map(k=>[k,[...connectedHistory.values()].flat().filter(p=>p.kind===k).length]))
 };
 const sensitivityReport=Object.fromEntries(['JUNIO_JULIO','AGOSTO_OCTUBRE','TOTAL'].map(period=>[
  period,Object.fromEntries(sensitivityNames.map(mode=>{
   const sub=sensitivityCuts.filter(x=>period==='TOTAL'||x.period===period);
   const withSlots=sub.filter(x=>x.methods[mode].eligible>=3);
   const keys=new Set(withSlots.map(x=>x.date+'|'+x.turn));
   const same=cuts.filter(x=>keys.has(x.date+'|'+x.turn));
   return [mode,{eligibleCuts:withSlots.length,
    candidates:sub.reduce((n,x)=>n+x.methods[mode].eligible,0),
    top3:sub.reduce((n,x)=>n+x.methods[mode].top3,0),
    top5:sub.reduce((n,x)=>n+x.methods[mode].top5,0),
    top10:sub.reduce((n,x)=>n+x.methods[mode].top10,0),
    geometryInSameCuts:makeTotals(same).methods.GEOMETRIA.top3,
    top1HistoricalSources:Object.fromEntries(sources.map(source=>[
      source,sub.filter(x=>x.methods[mode].source===source).length]))}];
  }))
 ]));
 // Cortes y tasas honestas VT2 y VT4: cobertura física, no aciertos
 // VT4 familiares ficticios por invertir el número completo.
 const derivedReport=Object.fromEntries(['JUNIO_JULIO','AGOSTO_OCTUBRE','TOTAL'].map(period=>{
  const subset=derivedCuts.filter(x=>period==='TOTAL'||x.period===period);
  const summaries=Object.fromEntries(derivedModes.map(mode=>[
   mode,Object.fromEntries((['vt2','vt4'] as DerivedKind[]).map(kind=>[
    kind,{top3:subset.reduce((n,x)=>n+x.scores[mode][kind].top3,0),
     top5:subset.reduce((n,x)=>n+x.scores[mode][kind].top5,0),
     top6:subset.reduce((n,x)=>n+x.scores[mode][kind].top6,0),
     top10:subset.reduce((n,x)=>n+x.scores[mode][kind].top10,0),
     avgCandidates:subset.reduce((n,x)=>n+x.scores[mode][kind].count,0)/
      Math.max(1,subset.length),
     cutsWithSix:subset.filter(x=>x.scores[mode][kind].count>=6).length,
     examples:subset.flatMap(x=>x.scores[mode][kind].matchedHeads
      .filter(h=>h.position<=6).map(h=>({date:x.date,turn:x.turn,...h}))).slice(0,6)}
   ]))
  ]));
  return [period,{days:new Set(subset.map(x=>x.date)).size,cuts:subset.length,
   heads:subset.reduce((n,x)=>n+x.heads.length,0),
   physicalVt2:subset.reduce((n,x)=>n+x.physicalVt2,0),
   physicalVt4:subset.reduce((n,x)=>n+x.physicalVt4,0),
   modes:summaries}];
 }));
 const derivedByTurn=Object.fromEntries(TURNOS.map(turn=>{
  const subset=derivedCuts.filter(x=>x.turn===turn);
  return [turn,{heads:subset.reduce((n,x)=>n+x.heads.length,0),
   physicalVt2:subset.reduce((n,x)=>n+x.physicalVt2,0),
   physicalVt4:subset.reduce((n,x)=>n+x.physicalVt4,0),
   results:Object.fromEntries(derivedModes.map(mode=>[mode,{
    vt2:subset.reduce((n,x)=>n+x.scores[mode].vt2.top6,0),
    vt4:subset.reduce((n,x)=>n+x.scores[mode].vt4.top6,0)}]))}];
 }));
 console.log('LAB_CONECTADAS_VT2_VT4_INICIO');
 console.log(JSON.stringify({notes:{
  derivation:'VT2 dos parejas físicas de madre VT3; VT4 cuarta cifra antepuesta por roce físico a VT3 madre o su inversa.',
  fourDigits:'Acierto VT4 exacto: cabeza cuatro cifras igual a una ruta física del PRE; nunca inversión completa.',
  geometryBaseline:'GEOMETRIA_DERIVADA es un laboratorio VT2/VT4 obtenido de madres VT3 de Geometría Completa, no un ranking independiente preexistente.',
  connectedBaseline:'CONECTADAS_DERIVADA toma los primeros 10 testigos de configuraciones ganadoras solapadas reproducidas en otra fuente.',
  protocol:'Todas las madres se eligen ANTES de conocer la cabeza objetivo; los resultados futuros solo se usan para evaluar.'
 },periods:derivedReport,byTurn:derivedByTurn},null,2));
 console.log('LAB_CONECTADAS_VT2_VT4_FIN');
 console.log('CONFIGURACIONES_CONECTADAS_INICIO');
 console.log(JSON.stringify({inventory:historicPairInventory,
  matched:connectedMatched,sensitivity:sensitivityReport,hybrid:hybridReport,examples:connectedExamples,
  periods:Object.fromEntries(Object.entries(report.summary).map(([p,v])=>[p,{
   cuts:v.cuts,heads:v.heads,physical:v.physicalWinners,
   reference:v.methods,connected:v.connected}]))},null,2));
 console.log('CONFIGURACIONES_CONECTADAS_FIN');
 if(extra16){
  const selected=cuts.filter(x=>x.date==='2026-10-16');
  const checked=selected.map(cut=>{
   const comp=connectedCuts.find(x=>x.date===cut.date&&x.turn===cut.turn)!;
   const con=comp.modes.SOLAPADAS_OTRA.families;
   const geo=cut.scores.GEOMETRIA.topFamilies;
   return {date:cut.date,turn:cut.turn,heads:cut.heads,
    headsAndFamilies:cut.heads.map((h,i)=>({head:h,family:cut.winners[i],
     physicallyAvailable:cut.physicalWinnerDetails.some(x=>x.head===h),
     geometryTop3:geo.slice(0,3).includes(cut.winners[i]),
     geometryTop6:geo.slice(0,6).includes(cut.winners[i]),
     connectedTop3:con.slice(0,3).includes(cut.winners[i]),
     connectedTop6:con.slice(0,6).includes(cut.winners[i])})),
    geometryTop6:geo.slice(0,6),
    connectedTop6:con.slice(0,6),
    witnesses:comp.modes.SOLAPADAS_OTRA.witnesses
   };
  });
  console.log('CONTROL_RECONSTRUIDO_16_OCT_INICIO');
  console.log(JSON.stringify({status:'RETROSPECTIVA_NO_SELLADA',
   date:'2026-10-16',cuts:checked,totals:{
    physical:checked.reduce((n,x)=>n+x.headsAndFamilies.filter(y=>y.physicallyAvailable).length,0),
    geometryTop3:checked.reduce((n,x)=>n+x.headsAndFamilies.filter(y=>y.geometryTop3).length,0),
    connectedTop3:checked.reduce((n,x)=>n+x.headsAndFamilies.filter(y=>y.connectedTop3).length,0),
    geometryTop6:checked.reduce((n,x)=>n+x.headsAndFamilies.filter(y=>y.geometryTop6).length,0),
    connectedTop6:checked.reduce((n,x)=>n+x.headsAndFamilies.filter(y=>y.connectedTop6).length,0)
   }},null,2));
  console.log('CONTROL_RECONSTRUIDO_16_OCT_FIN');
 }
 console.log('FIGURAS_PRE_RESULTADOS_INICIO');
 console.log(JSON.stringify({summary:report.summary,byTurn:report.byTurn},null,2));
 console.log('FIGURAS_PRE_RESULTADOS_FIN');
}
main().catch(e=>{console.error('FIGURAS_PRE_ERROR',e);process.exitCode=1});
