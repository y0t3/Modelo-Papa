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
import {sequenceEvidence,sequenceModes,rankSequenceEvidence,flagged} from './lab-figuras-secuencias-reales';
import type {SequenceMode,SequenceEvidence} from './lab-figuras-secuencias-reales';

const periods=[['2026-06-01','2026-07-31','JUNIO_JULIO'],
 ['2026-08-15','2026-10-15','AGOSTO_OCTUBRE']] as const;
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
     const key=[date,turn,match.jurisdiccion,match.cabeza,t.source,t.shape].join('|');
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
 const list=range('2026-05-14','2026-10-15');
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
 const cuts:CutResult[]=[];
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
 if(cuts.length!==520||cuts.reduce((n,x)=>n+x.physicalWinningHeads,0)!==654)
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
 const aggregates=(xs:typeof controlByCut)=>{
  return Object.fromEntries(controls.map(k=>[k,xs.reduce((out,c)=>plus(out,c.res[k]),emptyControl())]));
 };
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
   sequences:seqTotals(seqByCut.filter(x=>p==='TOTAL'||x.period===p)),
   metrics:{avgAvailableFamilies:sel.reduce((n,x)=>n+x.availableFamilies,0)/sel.length,
    avgActiveShapes:sel.reduce((n,x)=>n+x.distinctActiveShapes,0)/sel.length,
    avgHistoryEvents:sel.reduce((n,x)=>n+x.verifiedEventCount,0)/sel.length}}];
 })),byTurn:Object.fromEntries(TURNOS.map(t=>{
  const xs=cuts.filter(x=>x.turn===t);
  return [t,{...makeTotals(xs),controls:aggregates(controlByCut.filter(x=>x.turn===t)),
   sequences:seqTotals(seqByCut.filter(x=>x.turn===t))}];
 })),checksums:dataHashes,
 cuts,sequenceCuts:seqByCut};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/FIGURAS_COMPROBADAS_A_PRE_520.json',JSON.stringify(report,null,2)+'\n');
 console.log('SECUENCIAS_PRE_INICIO');
 console.log(JSON.stringify({periods:Object.fromEntries(
  Object.entries(report.summary).map(([p,v])=>[p,{
   days:v.days,cuts:v.cuts,physicalWinners:v.physicalWinners,
   baseline:v.methods,sequences:v.sequences}])),
  byTurn:Object.fromEntries(Object.entries(report.byTurn).map(([k,v])=>[k,v.sequences]))
 },null,2));
 console.log('SECUENCIAS_PRE_FIN');
 console.log('FIGURAS_PRE_RESULTADOS_INICIO');
 console.log(JSON.stringify({summary:report.summary,byTurn:report.byTurn},null,2));
 console.log('FIGURAS_PRE_RESULTADOS_FIN');
}
main().catch(e=>{console.error('FIGURAS_PRE_ERROR',e);process.exitCode=1});
