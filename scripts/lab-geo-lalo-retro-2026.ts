// Investigación retrospectiva PRE: Modelo Lalo oficial vs Geometría completa.
// Misma información para ambos. No entrena ni modifica el algoritmo existente.
// Cada corte de 2026-09-15 a 2026-10-15 se reconstruye ANTES de conocer
// las cabezas objetivo; éstas se consultan sólo después, para puntuar.
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {buildSheet} from '../src/sheet';
import {diaVacio,TURNOS,JURS} from '../src/domain';
import type {Turno,CabezasDia} from '../src/domain';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {allPhysicalVt3,buildVt3Shadow} from '../src/vt3Shadow';
import {buildVt3Variant} from './lab-geo-variants';
import type {GeoVariant} from './lab-geo-variants';
import {analyzeGeometryMemory,neutralComparison,profileCut} from './lab-geo-matched-control';
import type {CutProfile} from './lab-geo-matched-control';

const jurs=JURS.filter(x=>x!=='Montevideo');
const start='2026-09-15',end='2026-10-15';
const sampleBreak='2026-10-10';
const daysBetween=(first:string,last:string):string[]=>{
 const all:string[]=[];let n=Date.parse(first+'T12:00:00Z');
 const stop=Date.parse(last+'T12:00:00Z');
 for(;n<=stop;n+=86400000)all.push(new Date(n).toISOString().slice(0,10));
 return all;
};
const previousWeek=(date:string)=>new Date(Date.parse(date+'T12:00:00Z')-7*86400000).toISOString().slice(0,10);
type RecordDay={date:string;heads:CabezasDia};
type Win={jur:string;head:string;family:string;officialRank:number|null;geometryRank:number|null;physical:boolean};
type Cut={date:string;turn:Turno;set:'EXPLORADO'|'POSTERIOR';validHeads:number;
 physicalFamilyPool:number;winningPhysicalHeads:number;
 winners:Win[];topGeo:string[];topOff:string[];
 geoRootAnchoredTop3:number;geoAvailableFamilies:number;geoPhysicalRoutes:number;
 geoHit:{top3:number;top5:number;top10:number};offHit:{top3:number;top5:number;top10:number};
 expectedNeutralPhysical:{top3:number;top5:number;top10:number};
 expectedNeutralCut:{top3:number;top5:number;top10:number};
 baseDates:{previous:string;weekly:string|null};};
const tally=(rows:Cut[],kind:'geo'|'off')=>{
 const totals={cuts:rows.length,heads:0,top3:0,top5:0,top10:0,
  cut3:0,cut5:0,cut10:0};
 for(const r of rows){
  totals.heads+=r.validHeads;
  totals.top3+=r[kind==='geo'?'geoHit':'offHit'].top3;totals.top5+=r[kind==='geo'?'geoHit':'offHit'].top5;totals.top10+=r[kind==='geo'?'geoHit':'offHit'].top10;
  totals.cut3+=Number(r[kind==='geo'?'geoHit':'offHit'].top3>0);
  totals.cut5+=Number(r[kind==='geo'?'geoHit':'offHit'].top5>0);
  totals.cut10+=Number(r[kind==='geo'?'geoHit':'offHit'].top10>0);
 }
 return totals;
};
function unbiasedCutProbability(size:number,winning:number,take:number){
 if(!size||!winning)return 0;
 const n=Math.min(take,size);
 let probabilityOfZero=1;
 for(let i=0;i<n;i++)probabilityOfZero*=Math.max(0,(size-winning-i)/(size-i));
 return 1-probabilityOfZero;
}
const summary=(rows:Cut[])=>{
 const anyWinnerPhysical=rows.reduce((s,r)=>s+r.winningPhysicalHeads,0);
 const neutral=Object.fromEntries((['top3','top5','top10'] as const).map(k=>
  [k,{heads:rows.reduce((s,r)=>s+r.expectedNeutralPhysical[k],0),
       cuts:rows.reduce((s,r)=>s+r.expectedNeutralCut[k],0)}]));
 const exclusive={
  geometryTop3Only:rows.filter(r=>r.geoHit.top3>0&&r.offHit.top3===0).map(r=>r.date+' '+r.turn),
  officialTop3Only:rows.filter(r=>r.offHit.top3>0&&r.geoHit.top3===0).map(r=>r.date+' '+r.turn),
  geometryTop10Only:rows.filter(r=>r.geoHit.top10>0&&r.offHit.top10===0).map(r=>r.date+' '+r.turn),
  officialTop10Only:rows.filter(r=>r.offHit.top10>0&&r.geoHit.top10===0).map(r=>r.date+' '+r.turn)
 };
 const transitions=rows.filter(r=>r.turn!=='Previa').map(r=>{
  const predecessor=rows.find(p=>p.date===r.date&&TURNOS.indexOf(p.turn)===TURNOS.indexOf(r.turn)-1);
  if(!predecessor)return null;
  const current=new Set(r.topGeo.slice(0,3));
  const prior=new Set(predecessor.topGeo.slice(0,3));
  return {date:r.date,turn:r.turn,different:[...current].filter(x=>!prior.has(x)).length};
 }).filter((x):x is {date:string;turn:Turno;different:number}=>!!x);
 return {geometry:tally(rows,'geo'),official:tally(rows,'off'),
  physicalWinnerHeads:anyWinnerPhysical,neutral,exclusive,
  geometryTop3StableTransitions:transitions.filter(t=>t.different===0).length,
  geometryTop3ChangedTransitions:transitions.filter(t=>t.different>0).length,
  totalTransitions:transitions.length,
  geometryTop3UnanchoredSelections:rows.reduce((s,r)=>s+3-r.geoRootAnchoredTop3,0),
  top3HeadCases:rows.flatMap(r=>r.winners.filter(w=>(w.geometryRank??99)<=3||(w.officialRank??99)<=3)
    .map(w=>({date:r.date,turn:r.turn,...w})))};
};
async function loadAll(){
 const dates=daysBetween('2026-09-01',end);
 const rows:RecordDay[]=[];
 // No reintentar masivamente sobre la fuente y no saturar su API.
 for(let pos=0;pos<dates.length;pos+=6){
  const batch=dates.slice(pos,pos+6);
  const fetched=await Promise.all(batch.map(async date=>{
   for(let retry=0;retry<3;retry++){
    try{return {date,heads:await descargarCabezas(date,true)}}
    catch(e){if(retry===2)throw new Error('No se pudo descargar '+date+': '+String(e))}
   }
   throw new Error('Descarga fallida '+date);
  }));
  rows.push(...fetched);
 }
 return rows;
}
async function main(){
 const fetched=await loadAll();
 const valid=fetched.filter(d=>hasDrawResults(d.heads)&&hasNocturnoBase(d.heads))
  .sort((a,b)=>a.date.localeCompare(b.date));
 const byDate=new Map(valid.map(d=>[d.date,d]));
 const all:Cut[]=[];
 const warnings:string[]=[];
 type Strategy='GEOMETRIA'|'OFICIAL'|'SIN_AYER'|'SIN_SEMANA'|'RAICES_PRIMERO'|'NUEVA_FUENTE'|'OFICIAL_2_GEO_1'|'GEO_2_OFICIAL_1';
 type ExperimentCut={date:string;turn:Turno;week:string;set:'EXPLORADO'|'POSTERIOR';
  families:Record<Strategy,string[]>;hits:Record<Strategy,number>;winnerNames:string[];
  newFamilyWinners:string[];previousTop3:string[];selectedGeoNewSource:string[];
  officialAdmittedGeoTop3:number;};
 const experiments:ExperimentCut[]=[];
 const matchedProfiles:CutProfile[]=[];
 const previousPool=new Map<string,Set<string>>();
 const previousGeoTop3=new Map<string,string[]>();
 const strategies:Strategy[]=['GEOMETRIA','OFICIAL','SIN_AYER','SIN_SEMANA','RAICES_PRIMERO','NUEVA_FUENTE','OFICIAL_2_GEO_1','GEO_2_OFICIAL_1'];
 const mergeLimited=(first:string[],second:string[],firstSlots:number)=>{
  const out=[...new Set(first.slice(0,firstSlots))];
  for(const f of second)if(out.length<3&&!out.includes(f))out.push(f);
  for(const f of first)if(out.length<3&&!out.includes(f))out.push(f);
  return out.slice(0,3);
 };
 const weekStart=(d:string)=>{const date=new Date(d+'T12:00:00Z');
  const delta=(date.getUTCDay()+6)%7;
  return new Date(date.getTime()-delta*86400000).toISOString().slice(0,10);
 };
 for(const current of valid.filter(d=>d.date>=start&&d.date<=end)){
  const earlier=valid.filter(p=>p.date<current.date);
  if(earlier.length<2){warnings.push('Faltan anteriores para '+current.date);continue}
  const prev=earlier.at(-1)!;
  const prevprev=earlier.at(-2)!;
  const weekly=byDate.get(previousWeek(current.date));
  const weekPrevious=weekly?valid.filter(p=>p.date<weekly.date).at(-1):null;
  const historical:LaloHistorical[]=[
   {date:prev.date,sheet:buildSheet(prev.heads,prevprev.heads),period:'D−1'},
   ...(weekly&&weekPrevious?[{date:weekly.date,sheet:buildSheet(weekly.heads,weekPrevious.heads),period:'D−7' as const}]:[])
  ];
  for(const turn of TURNOS){
   const partial=diaVacio();
   for(const older of TURNOS.slice(0,TURNOS.indexOf(turn)))
    for(const jur of JURS)partial[older][jur]=current.heads[older][jur];
   const pre=buildSheet(partial,prev.heads);
   // Ninguna columna futura ni heads/matches del turno se entrega al motor.
   if(pre.heads[turn].length||pre.matches[turn].length)
    throw Error('Fuga temporal en '+current.date+' '+turn);
   const off=buildMotorLalo(pre,current.date,turn,historical);
   const geo=buildVt3Shadow(pre,current.date,turn,historical,off);
   const base=geo.top.map((x,i)=>({...x,rank:i+1}));
   const official=off.ranks.vt3;
   // Control estricto: el duplicado experimental BASE debe ser idéntico al motor
   // Geometría completa que realmente figura en la APK.
   const duplicate=buildVt3Variant(pre,current.date,turn,historical,off,'BASE');
   if(JSON.stringify(duplicate.top)!==JSON.stringify(geo.top)||
      duplicate.availableFamilies!==geo.availableFamilies||
      duplicate.routes!==geo.routes)
     throw Error('Divergencia de BASE geométrica en '+current.date+' '+turn);
   const variantKeys:Exclude<GeoVariant,'BASE'>[]=['SIN_AYER','SIN_SEMANA','RAICES_PRIMERO','NUEVA_FUENTE'];
   const variants=Object.fromEntries(variantKeys.map(key=>[
    key,buildVt3Variant(pre,current.date,turn,historical,off,key).top.map(x=>x.family)
   ])) as Record<Exclude<GeoVariant,'BASE'>,string[]>;
   const pool=new Set<string>();
   for(const column of pre.columns.slice(0,TURNOS.indexOf(turn)+1))
    for(const path of allPhysicalVt3(column.values))
     pool.add(reversibleFamily(path.map(p=>p.digit).join('')));
   const winners:Win[]=[];
   for(const jur of jurs){
    const head=current.heads[turn][jur];
    if(!/^\d{4}$/.test(head))continue;
    const family=reversibleFamily(head.slice(-3));
    winners.push({jur,head,family,
     officialRank:official.find(x=>x.family===family)?.rank??null,
     geometryRank:base.find(x=>x.family===family)?.rank??null,
     physical:pool.has(family)});
   }
   if(!winners.length)continue;
   matchedProfiles.push(profileCut(current.date,turn,pre,geo.top,winners.map(w=>w.family)));
   const geometryNames=base.map(x=>x.family);
   const officialNames=official.map(x=>x.family);
   const families:Record<Strategy,string[]>={
    GEOMETRIA:geometryNames.slice(0,3),
    OFICIAL:officialNames.slice(0,3),
    SIN_AYER:variants.SIN_AYER.slice(0,3),
    SIN_SEMANA:variants.SIN_SEMANA.slice(0,3),
    RAICES_PRIMERO:variants.RAICES_PRIMERO.slice(0,3),
    NUEVA_FUENTE:variants.NUEVA_FUENTE.slice(0,3),
    OFICIAL_2_GEO_1:mergeLimited(officialNames,geometryNames,2),
    GEO_2_OFICIAL_1:mergeLimited(geometryNames,officialNames,2)
   };
   for(const names of Object.values(families))if(names.length!==3||new Set(names).size!==3)
    throw Error('Top3 híbrido incompleto o repetido en '+current.date+' '+turn);
   const winnersNames=winners.map(w=>w.family);
   const previous=previousPool.get(current.date)||new Set<string>();
   const newFamilyWinners=winners.filter(w=>w.physical&&!previous.has(w.family)).map(w=>w.family);
   const priorGeo=previousGeoTop3.get(current.date)||[];
   const newSource=geometryNames.slice(0,3).filter(f=>!previous.has(f));
   const accepted=new Set(officialNames);
   const hits=Object.fromEntries(strategies.map(method=>[method,
    winnersNames.filter(f=>families[method].includes(f)).length])) as Record<Strategy,number>;
   experiments.push({date:current.date,turn,week:weekStart(current.date),
    set:current.date<=sampleBreak?'EXPLORADO':'POSTERIOR',
    families,hits,winnerNames:winnersNames,newFamilyWinners,
    previousTop3:priorGeo,selectedGeoNewSource:newSource,
    officialAdmittedGeoTop3:families.GEOMETRIA.filter(f=>accepted.has(f)).length
   });
   previousPool.set(current.date,pool);
   previousGeoTop3.set(current.date,families.GEOMETRIA);
   const geoHit={top3:0,top5:0,top10:0},offHit={top3:0,top5:0,top10:0};
   for(const w of winners){
    for(const n of [3,5,10] as const){
     if(w.geometryRank!==null&&w.geometryRank<=n)geoHit[('top'+n) as 'top3'|'top5'|'top10']++;
     if(w.officialRank!==null&&w.officialRank<=n)offHit[('top'+n) as 'top3'|'top5'|'top10']++;
    }
   }
   const winningPhysical=winners.filter(w=>w.physical).length;
   const distinctWinnerPhysical=new Set(winners.filter(w=>w.physical).map(w=>w.family)).size;
   const expectedNeutralPhysical={top3:0,top5:0,top10:0};
   const expectedNeutralCut={top3:0,top5:0,top10:0};
   for(const n of [3,5,10] as const){
    expectedNeutralPhysical[('top'+n) as 'top3'|'top5'|'top10']=winningPhysical*Math.min(n,pool.size)/Math.max(pool.size,1);
    expectedNeutralCut[('top'+n) as 'top3'|'top5'|'top10']=unbiasedCutProbability(pool.size,distinctWinnerPhysical,n);
   }
   all.push({
    date:current.date,turn,set:current.date<=sampleBreak?'EXPLORADO':'POSTERIOR',
    validHeads:winners.length,physicalFamilyPool:pool.size,winningPhysicalHeads:winningPhysical,
    winners,topGeo:base.map(x=>x.family),topOff:official.slice(0,10).map(x=>x.family),
    geoRootAnchoredTop3:base.slice(0,3).filter(x=>x.anchored).length,
    geoAvailableFamilies:geo.availableFamilies,geoPhysicalRoutes:geo.routes,
    geoHit,offHit,expectedNeutralPhysical,expectedNeutralCut,
    baseDates:{previous:prev.date,weekly:weekly&&weekPrevious?weekly.date:null}
   });
  }
 }
 const ranges=['EXPLORADO','POSTERIOR'] as const;
 const sections=Object.fromEntries(ranges.map(name=>
  [name,summary(all.filter(r=>r.set===name))]));
 const groupedByTurn=Object.fromEntries(TURNOS.map(turn=>
  [turn,summary(all.filter(r=>r.turn===turn))]));
 const byWeek=Object.fromEntries([...new Set(all.map(x=>{
  const t=new Date(x.date+'T12:00:00Z'),delta=(t.getUTCDay()+6)%7;
  return new Date(t.getTime()-delta*86400000).toISOString().slice(0,10);
 }))].map(week=>[week,summary(all.filter(x=>{
   const d=new Date(x.date+'T12:00:00Z'),delta=(d.getUTCDay()+6)%7;
   return new Date(d.getTime()-delta*86400000).toISOString().slice(0,10)===week;
 }))]));
 const report={audit:'COMPARACION_RETROSPECTIVA_GEOMETRIA_Y_LALO',createdAt:new Date().toISOString(),
  source:'VivituSuerte cabezasDiarias; backtest por cortes estrictamente PRE',
  seal:'NINGUNO: reconstrucción histórica posterior, no validación prospectiva',
  inputCode:{official:'src/motorLalo.ts',geometric:'src/vt3Shadow.ts'},
  frozenPolicy:'Sin calibrar: se usa el código actual con sus reglas idénticas en todos los cortes',
  range:{start,end,earliestFetched:'2026-09-01',sampleBreak},warnings,
  dayCount:new Set(all.map(r=>r.date)).size,
  total:summary(all),sections,groupedByTurn,byWeek,cuts:all};
 mkdirSync('lab-results',{recursive:true});
 const path='lab-results/GEOMETRIA_LALO_RETRO_15SEP_15OCT2026.json';
 writeFileSync(path,JSON.stringify(report,null,2));
 // Prueba A/B por bloques de jornada. Selecciones congeladas de antemano; no hay
 // optimización sobre los resultados ni se trasladan los sorteos futuros al PRE.
 const summarizeStrategies=(rows:ExperimentCut[])=>{
  const byMethod=Object.fromEntries(strategies.map(name=>[name,{
   cuts:rows.length,
   headHits:rows.reduce((n,r)=>n+r.hits[name],0),
   cutsWithHit:rows.filter(r=>r.hits[name]>0).length
  }])) as Record<Strategy,{cuts:number;headHits:number;cutsWithHit:number}>;
  const changes=rows.filter(r=>r.turn!=='Previa').map(r=>{
   const p=rows.find(x=>x.date===r.date&&TURNOS.indexOf(x.turn)===TURNOS.indexOf(r.turn)-1);
   return p?{newGeo:r.families.GEOMETRIA.filter(f=>!p.families.GEOMETRIA.includes(f)).length,
    newOfficial:r.families.OFICIAL.filter(f=>!p.families.OFICIAL.includes(f)).length,
    newGeoPriority:r.families.NUEVA_FUENTE.filter(f=>!p.families.NUEVA_FUENTE.includes(f)).length,
    newPhysicalWinner:r.newFamilyWinners.length,date:r.date,turn:r.turn}:null;
  }).filter((v):v is NonNullable<typeof v>=>!!v);
  return {byMethod,transitions:{
   total:changes.length,
   geoChanges:changes.filter(x=>x.newGeo>0).length,
   officialChanges:changes.filter(x=>x.newOfficial>0).length,
   newSourcePriorityChanges:changes.filter(x=>x.newGeoPriority>0).length
  },newPhysicalWinningFamilies:rows.reduce((n,r)=>n+r.newFamilyWinners.length,0),
  geoTop3NotAdmitted:rows.reduce((n,r)=>n+3-r.officialAdmittedGeoTop3,0),
  combinationWins:rows.filter(r=>r.hits.OFICIAL_2_GEO_1>0).map(r=>r.date+'|'+r.turn),
  geoUniqueTop3Wins:rows.filter(r=>r.hits.GEOMETRIA>0&&!r.hits.OFICIAL).map(r=>({
   date:r.date,turn:r.turn,families:r.families.GEOMETRIA,heads:r.winnerNames
  }))};
 };
 const exploratory=experiments.filter(r=>r.set==='EXPLORADO');
 const later=experiments.filter(r=>r.set==='POSTERIOR');
 const summaryExp={all:summarizeStrategies(experiments),explored:summarizeStrategies(exploratory),
  later:summarizeStrategies(later)};
 // Remuestreo pareado por jornadas (no cortes), exclusivamente descriptivo.
 const dates=[...new Set(experiments.map(r=>r.date))].sort();
 const byDay=dates.map(date=>experiments.filter(r=>r.date===date));
 let state=20261016;const rnd=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
 const differences={} as Record<Strategy,number[]>;
 for(const method of strategies)differences[method]=[];
 for(let b=0;b<12000;b++){
  const sample=Array.from({length:byDay.length},()=>byDay[Math.floor(rnd()*byDay.length)]).flat();
  const officialCount=sample.reduce((n,r)=>n+r.hits.OFICIAL,0);
  for(const method of strategies)
   differences[method].push(sample.reduce((n,r)=>n+r.hits[method],0)-officialCount);
 }
 const confidence=Object.fromEntries(strategies.map(m=>{
  const sorted=differences[m].sort((a,b)=>a-b);
  return [m,{difference:summaryExp.all.byMethod[m].headHits-summaryExp.all.byMethod.OFICIAL.headHits,
   descriptive95:[sorted[Math.floor(.025*sorted.length)],sorted[Math.floor(.975*sorted.length)]]}];
 }));
 const memory=analyzeGeometryMemory(matchedProfiles);
 const neutral=neutralComparison(matchedProfiles,2500);
 const byPeriod={
  EXPLORADO:neutralComparison(matchedProfiles.filter(p=>p.date<=sampleBreak),1600),
  POSTERIOR:neutralComparison(matchedProfiles.filter(p=>p.date>sampleBreak),1600)
 };
 const sourceStats={
  leaderSources:Object.fromEntries([...new Set(matchedProfiles.flatMap(p=>p.top3.map(t=>t.source)))]
   .map(source=>[source,matchedProfiles.reduce((n,p)=>n+p.top3.filter(t=>t.source===source).length,0)])),
  averagePhysicalPerLeader:matchedProfiles.reduce((n,p)=>n+p.pathsPerTop3.reduce((x,y)=>x+y,0),0)
   /Math.max(1,matchedProfiles.length*3),
  averageSourcesPerLeader:matchedProfiles.reduce((n,p)=>n+p.sourcesPerTop3.reduce((x,y)=>x+y,0),0)
   /Math.max(1,matchedProfiles.length*3),
  meanMatchedShapePool:matchedProfiles.reduce((n,p)=>n+p.top3.reduce((x,t)=>x+t.sameShapeCandidates,0),0)
   /Math.max(1,matchedProfiles.length*3),
  shapePoolOneCount:matchedProfiles.reduce((n,p)=>n+p.top3.filter(t=>t.sameShapeCandidates===1).length,0),
  totalLeaderSlots:matchedProfiles.length*3
 };
 const memoryReport={protocol:'No outcome used in ranking; retrospective, not prospective',
  sample:{days:new Set(matchedProfiles.map(p=>p.date)).size,cuts:matchedProfiles.length},
  sourceStats,memory,neutral,byPeriod,profiles:matchedProfiles};
 writeFileSync('lab-results/GEOMETRIA_MEMORIA_NEUTRAL_15SEP_15OCT2026.json',
  JSON.stringify(memoryReport,null,2));
 const experimentReport={kind:'EXPERIMENTAL_ABLACIONES_RETROSPECTIVAS',
  createdAt:new Date().toISOString(),branch:'lab/geo-ablaciones-inercia-hibrido-16oct2026',
  facts:{days:dates.length,cuts:experiments.length,
   headline:'8 métodos congelados antes de ejecutar este cotejo; NO sello prospectivo',
   cutoffs:'septiembre y octubre ya explorados; 12-15oct posterior descriptivo, no holdout virgen'},
  methods:{
   GEOMETRIA:'GEO F_D1 sin cambios',
   OFICIAL:'Motor Lalo VT3 original',
   SIN_AYER:'sin prioridad de semejanza a jornada anterior',
   SIN_SEMANA:'sin prioridad de semejanza al mismo día de la semana anterior',
   RAICES_PRIMERO:'evidencia histórica verificable antes de desplazamiento',
   NUEVA_FUENTE:'prioriza una nueva columna de turno cuando existe',
   OFICIAL_2_GEO_1:'primeras dos del Oficial y primera exclusiva de Geometría',
   GEO_2_OFICIAL_1:'primeras dos de Geometría y primera exclusiva del Oficial'
  },summary:summaryExp,confidence,rows:experiments};
 writeFileSync('lab-results/GEOMETRIA_ABLACIONES_15SEP_15OCT2026.json',JSON.stringify(experimentReport,null,2));
 const headline={dayCount:report.dayCount,heads:all.reduce((v,r)=>v+r.validHeads,0),
  total:report.total,sections,groupedByTurn,warnings};
 console.log('GEO_LALO_RETRO_START');
 console.log(JSON.stringify(headline,null,2));
 console.log('GEO_LALO_RETRO_END');
 console.log('GEO_ABLACIONES_START');
 console.log(JSON.stringify({methods:experimentReport.methods,summary:summaryExp,
  confidence,facts:experimentReport.facts},null,2));
 console.log('GEO_ABLACIONES_END');
 console.log('GEO_MEMORIA_NEUTRAL_START');
 console.log(JSON.stringify({sample:memoryReport.sample,sourceStats,memory:{
  stable:memory.stable,changed:memory.changed,enteredFromNewSource:memory.enteredFromNewSource,
  changedWitnessForSameFamily:memory.changedWitnessForSameFamily,
  selectedInPrevia:memory.allWinningTop3SelectedInPrevia,
  eligibleInPrevia:memory.allWinningTop3EligibleInPrevia,
  hits:memory.winningTop3,transitions:memory.transitions.slice(0,6)
 },neutral,byPeriod},null,2));
 console.log('GEO_MEMORIA_NEUTRAL_END');
 console.log('SHA256',createHash('sha256').update(JSON.stringify(report)).digest('hex'));
}
main().catch(e=>{console.error('RETRO_ERROR',e);process.exitCode=1});
