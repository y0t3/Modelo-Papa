/**
 * Modelo Lalo VT3: secuencias temporales de activación física (6 jornadas).
 * NO predice por dígitos históricos, ni usa resultados futuros.
 * Identidad de figura: sourceId + camino ordenado 3 celdas, reversible
 * (invierte el sentido del mismo camino, pero NO crea nuevas rotaciones).
 * Activación: ruta que explicó una cabeza completa POST en una jornada
 * ANTERIOR completa, en la misma fuente de la hoja +11.
 * Histórico de 6 jornadas, no días sin sorteo / incompletos.
 * Por corte, TODAS las familias VT3 formables físicas en PRE, incluso
 * las que MV1 descarta, para medir denominadores de forma honesta.
 * Tres prioridades sombra fijas (racha, reactivación, repetición); si
 * desplazan #10 nunca modifican el motor oficial, VT2 ni VT4.
 * Control aleatorio usa el mismo conjunto elegible del corte.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {DailySheet,SourceId} from '../src/sheet';
import {cellsFromPlus11,findPaths} from '../src/paths';
import type {Path} from '../src/paths';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';

type Mode='RACHA_DOS'|'REACTIVADA'|'INTERMITENTE';
const MODES:Mode[]=['RACHA_DOS','REACTIVADA','INTERMITENTE'];
type Route={source:SourceId;family:string;value:string;key:string;cells:string[]};
type Completed={date:string;headCount:number;active:Set<string>;activations:number};
type Life={key:string;bits:string;days:number;streak:number;bounce:boolean;gap:boolean;
 source:SourceId;value:string};
type Candidate={family:string;routes:Route[];tracks:Life[];sourceCount:number;
 pathCount:number; bestByMode:Record<Mode,Life|null>;qualifies:Record<Mode,boolean>};
type Cut={date:string;turn:string;mode:Mode;family:string|null;
 pool:string[];base10:string[];original10:string|null;
 wins:Record<string,number>;exactWins:Record<string,number>;
 history:string[]};
const cache=new Map<string,Promise<CabezasDia>>();
const completedCache=new Map<string,Promise<Completed>>();
function load(date:string){
 if(!cache.has(date))cache.set(date,descargarCabezas(date,true));
 return cache.get(date)!;
}
const countHeads=(day:CabezasDia)=>TURNOS.reduce((n,t)=>
 n+JURS.filter(j=>/^\d{4}$/.test(day[t]?.[j]||'')).length,0);
const cell=(c:Path[number])=>c.row+':'+c.col;
function canonical(p:Path){
 const a=p.map(cell).join('>');
 const b=[...p].reverse().map(cell).join('>');
 return [a,b].sort()[0];
}
const key=(source:SourceId,p:Path)=>source+'|'+canonical(p);
async function completed(date:string):Promise<Completed>{
 if(!completedCache.has(date))completedCache.set(date,(async()=>{
  const draws=await load(date);
  const headCount=countHeads(draws),active=new Set<string>();
  if(headCount>=20){
   const sheet=buildSheet(draws,await load(previousDrawDay(date)));
   for(const turn of TURNOS)for(const m of sheet.matches[turn]||[]){
    if(m.jurisdiccion==='Montevideo')continue;
    for(const h of m.hits){
     if(h.kind!=='vt3'||!m.cabeza.endsWith(h.value))continue;
     for(const path of h.paths){
      // Confirmar el recorrido y el valor exacto, no una simple familia.
      if(path.map(c=>c.digit).join('')!==h.value)continue;
      active.add(key(h.sourceId,path));
     }
    }
   }
  }
  return {date,headCount,active,activations:active.size};
 })());
 return completedCache.get(date)!;
}
async function priorSix(date:string){
 const six:Completed[]=[];
 let d=date,loops=0;
 while(six.length<6&&loops++<17){
  d=previousDrawDay(d);
  if(d>=date)throw Error('Fuga de tiempo en '+date);
  const c=await completed(d);
  if(c.headCount>=20)six.push(c);
 }
 if(six.length!==6)throw Error('Faltan seis días completos en '+date);
 return six.reverse(); // índices 0..5 corresponden D−6..D−1
}
function enumerate(columns:DailySheet['columns']):Map<string,Route[]>{
 const families=new Map<string,Route[]>(),dedup=new Set<string>();
 for(const column of columns){
  const cells=cellsFromPlus11(column.values);
  const dfs=(p:Path)=>{
   if(p.length===3){
    const value=p.map(x=>x.digit).join('');
    const family=reversibleFamily(value);
    const k=key(column.id,p);
    const unique=family+'|'+k;
    if(dedup.has(unique))return;
    dedup.add(unique);
    const items=families.get(family)||[];
    items.push({source:column.id,value,family,key:k,cells:p.map(cell)});
    families.set(family,items);return;
   }
   for(const c of cells){
    if(p.some(x=>x.row===c.row&&x.col===c.col))continue;
    const last=p[p.length-1];
    if(Math.max(Math.abs(last.row-c.row),Math.abs(last.col-c.col))!==1)continue;
    dfs([...p,c]);
   }
  };
  for(const c of cells)dfs([c]);
 }
 return families;
}
function life(route:Route,history:Completed[]):Life{
 const bits=history.map(d=>d.active.has(route.key)?'1':'0').join('');
 const days=[...bits].filter(x=>x==='1').length;
 let streak=0;
 for(let i=5;i>=0&&bits[i]==='1';i--)streak++;
 const bounce=bits[5]==='1'&&bits[4]==='0'&&
  bits.slice(0,4).includes('1');
 const gap=bits[5]==='1'&&days>=3&&bits.slice(0,5).includes('0');
 return {key:route.key,bits,days,streak,bounce,gap,
  source:route.source,value:route.value};
}
function qualifies(track:Life,m:Mode){
 return m==='RACHA_DOS'?track.streak>=2:
  m==='REACTIVADA'?track.bounce:
  track.gap;
}
function priority(track:Life,m:Mode){
 if(m==='RACHA_DOS')return [track.streak,track.days];
 if(m==='REACTIVADA')return [track.days,Number(track.gap),track.streak];
 return [track.days,track.streak];
}
function better(a:number[],b:number[]){
 for(let i=0;i<Math.max(a.length,b.length);i++)
  if((a[i]||0)!==(b[i]||0))return (b[i]||0)-(a[i]||0);
 return 0;
}
function classify(family:string,routes:Route[],six:Completed[]):Candidate{
 const tracks=routes.map(r=>life(r,six));
 const bestByMode={} as Record<Mode,Life|null>;
 const qualifiesByMode={} as Record<Mode,boolean>;
 for(const m of MODES){
  const available=tracks.filter(t=>qualifies(t,m));
  available.sort((a,b)=>better(priority(a,m),priority(b,m))||
   a.key.localeCompare(b.key));
  bestByMode[m]=available[0]||null;
  qualifiesByMode[m]=!!available.length;
 }
 return {family,routes,tracks,sourceCount:new Set(routes.map(x=>x.source)).size,
  pathCount:routes.length,bestByMode,qualifies:qualifiesByMode};
}
function rankCandidate(a:Candidate,b:Candidate,m:Mode){
 const at=a.bestByMode[m]!,bt=b.bestByMode[m]!;
 return better(priority(at,m),priority(bt,m))||
  b.sourceCount-a.sourceCount||
  b.pathCount-a.pathCount||
  a.family.localeCompare(b.family);
}
const rng=(seed:number)=>{
 let state=seed|0;
 return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)/4294967296};
};
const period=(date:string)=>date<='2026-07-31'?'JUN_JUL':
 date<='2026-09-30'?'AGO_SEP':date<='2026-10-23'?'OCT_01_23':'24_OCT';
async function main(){
 const cuts:Cut[]=[],cases:any[]=[],diagnostics:any[]=[],allCandidates:any[]=[];
 const patternCounts=new Map<string,{exposures:number;wins:number}>();
 const patternExposure=new Map<string,Map<string,number>>();
 let days=0;
 for(let date='2026-06-01';date<='2026-10-24';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const today=await load(date);
  if(countHeads(today)<20){
   console.log('SECUENCIA_OMITIDA',date,countHeads(today));continue;
  }
  const prior=previousDrawDay(date),prior2=previousDrawDay(prior);
  const week=shiftDay(date,-7),weekPrior=previousDrawDay(week);
  const [d1,d1b,d7,d7b,six]=await Promise.all([
   load(prior),load(prior2),load(week),load(weekPrior),priorSix(date)]);
  const hist:LaloHistorical[]=[
   {date:prior,period:'D−1',sheet:buildSheet(d1,d1b)},
   {date:week,period:'D−7',sheet:buildSheet(d7,d7b)}
  ];
  days++;
  for(const [idx,turn] of TURNOS.entries()){
   const masked=diaVacio();
   for(const priorTurn of TURNOS.slice(0,idx))
    masked[priorTurn]={...today[priorTurn]};
   const sheet=buildSheet(masked,d1);
   const cols=sheet.columns.slice(0,idx+1);
   const official=buildMotorLalo(sheet,date,turn,hist);
   const base10=official.ranks.vt3.slice(0,10).map(f=>f.family);
   const acknowledged=new Set(official.ranks.vt3.map(f=>f.family));
   const physical=enumerate(cols);
   const candidates=[...physical.entries()].map(([f,rs])=>classify(f,rs,six));
   const exclusions=candidates.filter(x=>!acknowledged.has(x.family));
   const chosenByMode={} as Record<Mode,Candidate|null>;
   const familyWins:Record<string,number>={},exactWins:Record<string,number>={};
   const events=JURS.map(j=>({jur:j,head:today[turn]?.[j]||''}))
    .filter(x=>/^\d{4}$/.test(x.head));
   for(const e of events){
    const suffix=e.head.slice(-3),family=reversibleFamily(suffix);
    familyWins[family]=(familyWins[family]||0)+1;
    const exact=cols.some(c=>findPaths(c.values,suffix).length>0);
    if(exact)exactWins[family]=(exactWins[family]||0)+1;
    const entry=physical.get(family);
    cases.push({date,turn,jur:e.jur,head:e.head,family,
     exact,originalRank:official.ranks.vt3.find(f=>f.family===family)?.rank||null,
     casePattern:entry?classify(family,entry,six).tracks.map(t=>t.bits):[],
     period:period(date)});
   }
   // Exposición por familias no por rutas. Una familia que ofrece diez
   // figuras simultáneas cuenta UNA sola exposición por corte.
   for(const c of candidates){
    const patterns=[...new Set(c.tracks.map(t=>t.bits))];
    for(const pattern of patterns){
     const group=patternCounts.get(pattern)||{exposures:0,wins:0};
     group.exposures++;
     group.wins+=exactWins[c.family]||0;
     patternCounts.set(pattern,group);
    }
   }
   for(const mode of MODES){
    const pool=exclusions.filter(x=>x.qualifies[mode]);
    pool.sort((a,b)=>rankCandidate(a,b,mode));
    const picked=pool[0]||null;
    chosenByMode[mode]=picked;
    cuts.push({date,turn,mode,family:picked?.family||null,
     pool:pool.map(x=>x.family),base10,original10:base10[9]||null,
     wins:familyWins,exactWins,
     history:six.map(x=>x.date)});
   }
   diagnostics.push({date,turn,physicalFamilies:physical.size,
    acknowledged:acknowledged.size,unrecognized:exclusions.length,
    exactWinnerHeads:Object.values(exactWins).reduce((a,b)=>a+b,0),
    top10Baseline:base10.reduce((n,f)=>n+(familyWins[f]||0),0),
    top10BaselineExact:base10.reduce((n,f)=>n+(exactWins[f]||0),0),
    poolSizes:Object.fromEntries(MODES.map(m=>[m,
     exclusions.filter(x=>x.qualifies[m]).length]))});
   for(const c of exclusions){
    if(!MODES.some(m=>c.qualifies[m]))continue;
    allCandidates.push({date,turn,family:c.family,
     sources:c.sourceCount,paths:c.pathCount,
     patterns:c.tracks.map(x=>({bits:x.bits,key:x.key})),
     flags:c.qualifies, exactHeadMatches:exactWins[c.family]||0});
   }
  }
  console.log('SECUENCIA_DIA',date);
 }
 const blocks=['JUN_JUL','AGO_SEP','OCT_01_23','24_OCT','TOTAL'];
 const totalReport:any[]=[],randomReport:any[]=[];
 for(const mode of MODES){
  const subset=cuts.filter(x=>x.mode===mode);
  for(const block of blocks){
   const cs=subset.filter(x=>block==='TOTAL'||period(x.date)===block);
   const gains=cs.flatMap(c=>{
    if(!c.family)return [];
    const count=c.wins[c.family]||0;
    return count?[{date:c.date,turn:c.turn,family:c.family,count,
     exact:c.exactWins[c.family]||0}]:[];
   });
   const loss=cs.flatMap(c=>{
    if(!c.family||!c.original10)return [];
    const count=c.wins[c.original10]||0;
    return count?[{date:c.date,turn:c.turn,family:c.original10,count}]:[];
   });
   const baseline=cs.reduce((n,c)=>n+c.base10.reduce((a,f)=>a+(c.wins[f]||0),0),0);
   totalReport.push({mode,block,cuts:cs.length,
    withChoice:cs.filter(x=>x.family).length,
    poolExposures:cs.reduce((a,x)=>a+x.pool.length,0),
    baselineTop10:baseline,gained:gains.reduce((a,x)=>a+x.count,0),
    exactGained:gains.reduce((a,x)=>a+x.exact,0),
    lost:loss.reduce((a,x)=>a+x.count,0),
    gains,loss});
  }
  const simulationCuts=subset.filter(x=>x.pool.length);
  const observed=totalReport.find(x=>x.mode===mode&&x.block==='TOTAL')!;
  const random=rng(20261025+MODES.indexOf(mode)),draws=10000;
  const sample:number[]=[];
  for(let i=0;i<draws;i++){
   let gained=0;
   for(const cut of simulationCuts){
    const randomFamily=cut.pool[Math.floor(random()*cut.pool.length)];
    gained+=cut.wins[randomFamily]||0;
   }
   sample.push(gained);
  }
  sample.sort((a,b)=>a-b);
  randomReport.push({mode,draws,
   observedGained:observed.gained,observedExactGained:observed.exactGained,
   lost:observed.lost,net:observed.gained-observed.lost,
   randomMean:sample.reduce((a,b)=>a+b,0)/sample.length,
   randomP95:sample[Math.floor(.95*sample.length)],
   randomAtLeastObserved:sample.filter(x=>x>=observed.gained).length/sample.length,
   eligibleCuts:simulationCuts.length,
   meanPoolSize:observed.poolExposures/Math.max(1,simulationCuts.length)});
 }
 const sequenceSummary=[...patternCounts].map(([pattern,x])=>({
  sequence:pattern,exposures:x.exposures,headsExact:x.wins,
  descriptiveRate:x.wins/Math.max(1,x.exposures)
 })).sort((a,b)=>b.exposures-a.exposures);
 const dir='auditorias/lalo-vt3-secuencias-fisicas-25oct/resultados';
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/resumen.json',JSON.stringify({totalReport,randomReport,sequenceSummary,
  counts:{days,cuts:diagnostics.length,heads:cases.length}},null,2));
 fs.writeFileSync(dir+'/cortes-pre.json',JSON.stringify(diagnostics,null,2));
 fs.writeFileSync(dir+'/familias-candidatas.json',JSON.stringify(allCandidates,null,2));
 fs.writeFileSync(dir+'/cabezas.json',JSON.stringify(cases,null,2));
 fs.writeFileSync(dir+'/secuencias-fisicas.json',JSON.stringify(sequenceSummary,null,2));
 console.log('SECUENCIA_RESUMEN',JSON.stringify(totalReport.map(x=>({
  mode:x.mode,block:x.block,cuts:x.cuts,withChoice:x.withChoice,
  exposures:x.poolExposures,base:x.baselineTop10,
  gains:x.gained,exactGains:x.exactGained,loss:x.lost
 }))));
 console.log('SECUENCIA_AZAR',JSON.stringify(randomReport));
 console.log('SECUENCIA_FRECUENCIAS',JSON.stringify(sequenceSummary.slice(0,35)));
 console.log('SECUENCIA_CASOS',JSON.stringify(totalReport.filter(x=>x.block==='TOTAL')
  .map(x=>({mode:x.mode,gains:x.gains,losses:x.loss}))));
 console.log('SECUENCIA_CORTES',JSON.stringify({days,cuts:diagnostics.length,
  heads:cases.length,sequencePatterns:sequenceSummary.length}));
}
void main().catch(e=>{console.error('SECUENCIA_ERROR',e);process.exitCode=1});
