// Auditoría PRE de decisiones VT3: 6 jornadas completas de octubre.
// SOLAMENTE cuentan cabezas con terminación VT3 físicamente formada en +11.
// No se evalúan ni se usan para extraer reglas las cabezas NO formables.
// No modifica el motor. Alternativas de ranking fijadas ANTES de ver salidas.
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {Turno,CabezasDia} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {SourceId} from '../src/sheet';
import {allPhysicalVt3,buildVt3Shadow} from '../src/vt3Shadow';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloHistorical} from '../src/motorLalo';
import {verifiedShapes,analyzeNonAdmitted,compareFeatures,sumFeatureControls} from './lab-frontera-vt3-figuras-reales';
import type {NonAdmittedRow,Control,Feature} from './lab-frontera-vt3-figuras-reales';

const targetDates=['2026-10-10','2026-10-12','2026-10-13',
 '2026-10-14','2026-10-15','2026-10-16'];
const historyFrom='2026-10-01',historyTo='2026-10-16';
const targetJur=JURS.filter(j=>j!=='Montevideo');
const sources:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const dated=(x:string)=>Date.parse(x+'T12:00:00Z');
const back=(date:string,n:number)=>
 new Date(dated(date)-n*86400000).toISOString().slice(0,10);
const calendar=(a:string,b:string)=>{
 const result:string[]=[];for(let d=dated(a);d<=dated(b);d+=86400000)
  result.push(new Date(d).toISOString().slice(0,10));return result;
};
const complete=(d:CabezasDia)=>TURNOS.every(turn=>targetJur.every(j=>
 /^\d{4}$/.test(d[turn][j])));
const hasBase=(d:CabezasDia)=>targetJur.some(j=>/^\d{4}$/.test(d.Nocturno[j]));
const reverseKey=(p:{row:number;col:number}[])=>
 [p.map(c=>c.row+':'+c.col).join('>'),[...p].reverse().map(c=>c.row+':'+c.col).join('>')].sort()[0];
type Physical={source:SourceId;cells:string[];value:string};
type FamilyPhysical={family:string;paths:Physical[];sources:SourceId[]};
function physicalFamilies(sheet:ReturnType<typeof buildSheet>,turn:Turno){
 const out=new Map<string,FamilyPhysical>();
 for(const column of sheet.columns.slice(0,TURNOS.indexOf(turn)+1)){
  for(const path of allPhysicalVt3(column.values)){
   const value=path.map(c=>c.digit).join(''),family=reversibleFamily(value);
   let row=out.get(family);
   if(!row){row={family,paths:[],sources:[]};out.set(family,row)}
   if(!row.sources.includes(column.id))row.sources.push(column.id);
   const key=reverseKey(path);
   if(!row.paths.some(p=>p.source===column.id&&
    reverseKey(p.cells.map(c=>{const [r,k]=c.split(':').map(Number);return {row:r,col:k}}))===key)){
    row.paths.push({source:column.id,value,cells:path.map(c=>c.row+':'+c.col)});
   }
  }
 }
 return out;
}
type Scheme='OFICIAL'|'RAIZ_D1_PRIMERO'|'RAIZ_TOTAL_PRIMERO';
const schemes:Scheme[]=['OFICIAL','RAIZ_D1_PRIMERO','RAIZ_TOTAL_PRIMERO'];
const cmp=(a:number[],b:number[])=>{
 for(let i=0;i<Math.max(a.length,b.length);i++){
  const d=(b[i]||0)-(a[i]||0);if(d)return d;
 }return 0;
};
export function rankWithoutNewCandidates(original:LaloFamily[],scheme:Scheme):LaloFamily[]{
 if(scheme==='OFICIAL')return original;
 const key=(x:LaloFamily):number[]=>
  scheme==='RAIZ_D1_PRIMERO'?
  [Number(x.d1Roots>0),x.d1Roots,Number(x.d7Roots>0),x.d7Roots,
   Number(x.branchBlocks>0),x.branchBlocks,x.sourceCount,x.physicalBlocks]:
  [Number(x.directRoots>0),x.directRoots,Number(x.branchBlocks>0),
   x.branchBlocks,x.d1Roots,x.d7Roots,x.sourceCount,x.physicalBlocks];
 return [...original].sort((a,b)=>cmp(key(a),key(b))||a.rank-b.rank);
}
type Head={jur:string;head:string;family:string;originSources:SourceId[];
 physicalPaths:Physical[];admitted:boolean;rankOfficial:number|null;
 rankD1:number|null;rankRoots:number|null;geometryRank:number|null;
 familyTraits:{d1:number;d7:number;direct:number;branch:number;
  sources:number;blocks:number;state:string}|null};
type Cut={date:string;turn:Turno;headsPhysical:Head[];
 physicallyAvailableFamilies:number;admittedFamilies:number;admittedNonWinners:number;
 variants:Record<Scheme,{top3:number;top5:number;top6:number;top10:number;
  familiesTop6:string[]}>;geometry:{top3:number;top5:number;top6:number};
 control:{admitExpectedUniform:number;admitExpectedBySource:number;
  top6ExpectedWithinAdmitted:number;branchExpectedWithinAdmitted:number;
  branchObservedHeads:number;branchPhysicalMatched:{strata:number;branchHeads:number;
   expected:number;branchExposures:number;rootOnlyExposures:number}};
 rankedFamilyRows:{family:string;hit:number;rank:number;rankD1:number;rankRoots:number;
 d1:number;d7:number;roots:number;branches:number;blocks:number;
 sourceCount:number;source:SourceId|null}[];
 negativeControls:{rootOnly:{families:number;heads:number};branch:{families:number;heads:number};
 rootAndBranch:{families:number;heads:number};neither:{families:number;heads:number}};
};
function classify(f:LaloFamily){
 return f.directRoots>0&&f.branchBlocks===0?'rootOnly':
  f.directRoots>0&&f.branchBlocks>0?'rootAndBranch':
  f.branchBlocks>0?'branch':'neither';
}
async function main(){
 const allDates=calendar(historyFrom,historyTo);
 const downloaded=await Promise.all(allDates.map(async date=>{
  let result:CabezasDia|null=null;
  for(let attempt=0;attempt<3&&!result;attempt++)try{
   result=await descargarCabezas(date,true);
  }catch(e){if(attempt===2)throw Error('Descarga: '+date+': '+String(e))}
  return {date,heads:result!};
 }));
 const byDate=new Map(downloaded.map(x=>[x.date,x]));
 for(const date of targetDates){
  const row=byDate.get(date);
  if(!row||!complete(row.heads))
   throw Error('Jornada objetivo incompleta: '+date);
 }
 const drawDays=downloaded.filter(x=>hasBase(x.heads));
 const drawIndex=new Map(drawDays.map((d,i)=>[d.date,i]));
 for(const date of targetDates)if(!drawIndex.has(date))
  throw Error('Día incompleto/nocturna ausente '+date);
 const sheets=new Map<string,ReturnType<typeof buildSheet>>();
 for(let i=1;i<drawDays.length;i++)sheets.set(drawDays[i].date,
  buildSheet(drawDays[i].heads,drawDays[i-1].heads));
 const cuts:Cut[]=[];
 const borderCuts:{date:string;turn:Turno;rows:NonAdmittedRow[];
  controls:Record<Feature,Control>;physicalWinnerHeads:number;
  nonAdmittedWinnerHeads:number;inputSourceDays:string[]}[]=[];
 const historyMarked=new Map([...sheets.entries()].map(([date,sheet])=>
  [date,verifiedShapes(sheet,date)]));
 for(const date of targetDates){
  const day=byDate.get(date)!;
  const index=drawIndex.get(date)!;
  if(index<1)throw Error('Sin Nocturna previa '+date);
  const prior=drawDays[index-1];
  const d7=byDate.get(back(date,7));
  const hist:LaloHistorical[]=[{
   date:prior.date,period:'D−1',
   sheet:sheets.get(prior.date)||buildSheet(prior.heads,drawDays[index-2].heads)
  }];
  if(d7&&hasBase(d7.heads)){
   const idx=drawIndex.get(d7.date);
   if(idx===undefined||idx<1)throw Error('Sin base de D-7 '+d7.date);
   hist.push({date:d7.date,period:'D−7',sheet:sheets.get(d7.date)||
    buildSheet(d7.heads,drawDays[idx-1].heads)});
  }
  for(const turn of TURNOS){
   const current=diaVacio(),idx=TURNOS.indexOf(turn);
   for(const t of TURNOS.slice(0,idx))
    for(const j of JURS)current[t][j]=day.heads[t][j];
   const pre=buildSheet(current,prior.heads);
   if(pre.heads[turn].length!==0||pre.matches[turn].length!==0)
    throw Error('Fuga de cabezas objetivo '+date+' '+turn);
   const physical=physicalFamilies(pre,turn);
   const model=buildMotorLalo(pre,date,turn,hist);
   const geometry=buildVt3Shadow(pre,date,turn,hist,model);
   const alternatives=Object.fromEntries(schemes.map(s=>[
    s,rankWithoutNewCandidates(model.ranks.vt3,s)])) as Record<Scheme,LaloFamily[]>;
   const rankMaps=Object.fromEntries(schemes.map(s=>[
    s,new Map(alternatives[s].map((x,i)=>[x.family,i+1]))])) as
    Record<Scheme,Map<string,number>>;
   const geoRanks=new Map(geometry.top.map((x,i)=>[x.family,i+1]));
   const eligibleHeads:Head[]=[];
   for(const jur of targetJur){
    const head=day.heads[turn][jur];
    const family=reversibleFamily(head.slice(-3));
    const witness=physical.get(family);
    if(!witness)continue; // Exclusión TOTAL de cabezas no formables.
    const official=model.ranks.vt3.find(x=>x.family===family);
    eligibleHeads.push({jur,head,family,
     originSources:witness.sources,physicalPaths:witness.paths,
     admitted:!!official,rankOfficial:rankMaps.OFICIAL.get(family)||null,
     rankD1:rankMaps.RAIZ_D1_PRIMERO.get(family)||null,
     rankRoots:rankMaps.RAIZ_TOTAL_PRIMERO.get(family)||null,
     geometryRank:geoRanks.get(family)||null,
     familyTraits:official?{d1:official.d1Roots,d7:official.d7Roots,
      direct:official.directRoots,branch:official.branchBlocks,
      sources:official.sourceCount,blocks:official.physicalBlocks,
      state:official.state}:null});
   }
   // Comprobaciones PRE estrictas: historia hasta D−1 (6 jornadas reales)
   // y cabezas del mismo día en turnos ANTERIORES, jamás el turno objetivo.
   const oldDraws=drawDays.slice(Math.max(0,index-6),index);
   const history=oldDraws.flatMap(d=>historyMarked.get(d.date)||[]);
   if(history.some(x=>x.date>=date))throw Error('Fuga de futuro histórico');
   const earlier=verifiedShapes(pre,date);
   if(earlier.some(e=>TURNOS.indexOf(e.turn)>=idx))
    throw Error('Fuga de cabeza actual en marcas previas');
   const unadmitted=analyzeNonAdmitted({
    physical,admitted:new Set(model.ranks.vt3.map(f=>f.family)),
    winnerFamilies:eligibleHeads.filter(h=>!h.admitted).map(h=>h.family),
    historical:history,earlierToday:earlier,newestSource:sources[idx]});
   const featureControl=compareFeatures(unadmitted);
   const absent=eligibleHeads.filter(h=>!h.admitted).length;
   if(unadmitted.reduce((n,x)=>n+x.hit,0)!==absent)
    throw Error('Se contaron cabezas no formables o se perdió algún VT3 físico');
   if(unadmitted.some(x=>x.currentPaths.length===0))
    throw Error('Candidato VT3 sin testigo físico');
   borderCuts.push({date,turn,rows:unadmitted,controls:featureControl,
    physicalWinnerHeads:eligibleHeads.length,
    nonAdmittedWinnerHeads:absent,inputSourceDays:oldDraws.map(x=>x.date)});
   const hitMap=new Map<string,number>();
   for(const h of eligibleHeads)hitMap.set(h.family,(hitMap.get(h.family)||0)+1);
   const rankedFamilyRows=model.ranks.vt3.map(f=>({
    family:f.family,hit:hitMap.get(f.family)||0,rank:f.rank,
    rankD1:rankMaps.RAIZ_D1_PRIMERO.get(f.family)!,
    rankRoots:rankMaps.RAIZ_TOTAL_PRIMERO.get(f.family)!,
    d1:f.d1Roots,d7:f.d7Roots,roots:f.directRoots,
    branches:f.branchBlocks,blocks:f.physicalBlocks,sourceCount:f.sourceCount,
    source:f.paths[0]?.sourceId||null
   }));
   const controls={rootOnly:{families:0,heads:0},branch:{families:0,heads:0},
    rootAndBranch:{families:0,heads:0},neither:{families:0,heads:0}};
   for(const f of model.ranks.vt3){
    const type=classify(f);
    controls[type].families++;
    controls[type].heads+=hitMap.get(f.family)||0;
   }
   const firstPhysicalSource=(family:string)=>physical.get(family)?.sources[0];
   const admitSet=new Set(model.ranks.vt3.map(f=>f.family));
   const physicalBySource=new Map<SourceId,{all:number;admitted:number}>();
   for(const row of physical.values()){
    const source=row.sources[0];
    const v=physicalBySource.get(source)||{all:0,admitted:0};
    v.all++;
    if(admitSet.has(row.family))v.admitted++;
    physicalBySource.set(source,v);
   }
   const admitExpectedUniform=physical.size?
    eligibleHeads.length*model.ranks.vt3.length/physical.size:0;
   const admitExpectedBySource=eligibleHeads.reduce((n,h)=>{
    const group=physicalBySource.get(firstPhysicalSource(h.family)!)!;
    return n+(group.all?group.admitted/group.all:0);
   },0);
   const rankAdmitted=eligibleHeads.filter(h=>h.admitted);
   const top6ExpectedWithinAdmitted=model.ranks.vt3.length?
    rankAdmitted.length*Math.min(6,model.ranks.vt3.length)/model.ranks.vt3.length:0;
   const branchFamilies=model.ranks.vt3.filter(x=>x.branchBlocks>0).length;
   const branchExpectedWithinAdmitted=model.ranks.vt3.length?
    rankAdmitted.length*branchFamilies/model.ranks.vt3.length:0;
   const branchObservedHeads=rankAdmitted.filter(h=>
    (h.familyTraits?.branch||0)>0).length;
   // Comparación estricta entre ramas/no ramas con las mismas raíces,
   // fuente física y bandas de caminos; grupos sin ambas clases no cuentan.
   const match=new Map<string,{branch:boolean;heads:number}[]>();
   const band=(n:number)=>n<=1?'1':n===2?'2':n<=5?'3-5':'6+';
   for(const f of model.ranks.vt3){
    const p=physical.get(f.family);
    if(!p)throw Error('Familia Lalo no tiene camino físico '+date+' '+turn);
    const key=p.sources[0]+'|'+Number(f.d1Roots>0)+'|'+Number(f.d7Roots>0)+
     '|'+band(p.paths.length)+'|'+(f.sourceCount===1?'una':'varias');
    if(!match.has(key))match.set(key,[]);
    match.get(key)!.push({branch:f.branchBlocks>0,heads:hitMap.get(f.family)||0});
   }
   const branchPhysicalMatched={strata:0,branchHeads:0,expected:0,
    branchExposures:0,rootOnlyExposures:0};
   for(const group of match.values()){
    const branch=group.filter(x=>x.branch),simple=group.filter(x=>!x.branch);
    if(!branch.length||!simple.length)continue;
    const wins=group.reduce((n,x)=>n+x.heads,0);
    branchPhysicalMatched.strata++;
    branchPhysicalMatched.branchExposures+=branch.length;
    branchPhysicalMatched.rootOnlyExposures+=simple.length;
    branchPhysicalMatched.branchHeads+=branch.reduce((n,x)=>n+x.heads,0);
    branchPhysicalMatched.expected+=branch.length/group.length*wins;
   }
   const control={admitExpectedUniform,admitExpectedBySource,
    top6ExpectedWithinAdmitted,branchExpectedWithinAdmitted,
    branchObservedHeads,branchPhysicalMatched};
   const variants=Object.fromEntries(schemes.map(s=>{
    const names=alternatives[s].map(x=>x.family);
    const count=(n:number)=>eligibleHeads.filter(x=>names.slice(0,n).includes(x.family)).length;
    return [s,{top3:count(3),top5:count(5),top6:count(6),top10:count(10),
     familiesTop6:names.slice(0,6)}];
   })) as Cut['variants'];
   const g=(n:number)=>eligibleHeads.filter(x=>geoRanks.get(x.family)!>0&&
    geoRanks.get(x.family)!<=n).length;
   cuts.push({date,turn,headsPhysical:eligibleHeads,
    physicallyAvailableFamilies:physical.size,
    admittedFamilies:model.ranks.vt3.length,
    admittedNonWinners:model.ranks.vt3.filter(f=>!hitMap.has(f.family)).length,
    control,variants,geometry:{top3:g(3),top5:g(5),top6:g(6)},
    rankedFamilyRows,negativeControls:controls});
  }
 }
 if(cuts.length!==30||new Set(cuts.map(x=>x.date)).size!==6)
  throw Error('No se procesaron 30 PRE de seis jornadas cerradas');
 for(const cut of cuts){
  const totalHits=cut.headsPhysical.length;
  if(cut.variants.OFICIAL.top6>totalHits)throw Error('Acierto imposible');
  if(cut.rankedFamilyRows.length!==cut.admittedFamilies)throw Error('Se alteraron las familias admitidas');
  for(const s of schemes){
   const baseline=new Set(cut.rankedFamilyRows.map(x=>x.family));
   if(cut.variants[s].familiesTop6.some(x=>!baseline.has(x)))
    throw Error('Ranking alternativo inventó familia');
  }
 }
 const totals=(items:Cut[])=>{
  const qualifying=items.flatMap(x=>x.headsPhysical);
  const byScenario=Object.fromEntries(schemes.map(s=>[s,
   {top3:items.reduce((n,x)=>n+x.variants[s].top3,0),
    top5:items.reduce((n,x)=>n+x.variants[s].top5,0),
    top6:items.reduce((n,x)=>n+x.variants[s].top6,0),
    top10:items.reduce((n,x)=>n+x.variants[s].top10,0)}]));
  return {cuts:items.length,qualifiedHeads:qualifying.length,
   qualifiedAdmitted:qualifying.filter(x=>x.admitted).length,
   qualifiedNotAdmitted:qualifying.filter(x=>!x.admitted).length,
   control:{
    admissionUniformExpected:items.reduce((n,x)=>n+x.control.admitExpectedUniform,0),
    admissionBySourceExpected:items.reduce((n,x)=>n+x.control.admitExpectedBySource,0),
    top6AmongAdmittedExpected:items.reduce((n,x)=>n+x.control.top6ExpectedWithinAdmitted,0),
    branchAmongAdmittedExpected:items.reduce((n,x)=>n+x.control.branchExpectedWithinAdmitted,0),
    branchAmongAdmittedObserved:items.reduce((n,x)=>n+x.control.branchObservedHeads,0),
    branchStrictMatched:{
     strata:items.reduce((n,x)=>n+x.control.branchPhysicalMatched.strata,0),
     branchHeads:items.reduce((n,x)=>n+x.control.branchPhysicalMatched.branchHeads,0),
     expected:items.reduce((n,x)=>n+x.control.branchPhysicalMatched.expected,0),
     branchExposures:items.reduce((n,x)=>n+x.control.branchPhysicalMatched.branchExposures,0),
     rootOnlyExposures:items.reduce((n,x)=>n+x.control.branchPhysicalMatched.rootOnlyExposures,0)
    }
   },
   officialAdmittedFamilies:items.reduce((n,x)=>n+x.admittedFamilies,0),
   physicallyAvailableFamilies:items.reduce((n,x)=>n+x.physicallyAvailableFamilies,0),
   byScenario,geometry:{
    top3:items.reduce((n,x)=>n+x.geometry.top3,0),
    top6:items.reduce((n,x)=>n+x.geometry.top6,0)},
   byRankBin:Object.fromEntries(['1–3','4–6','7–10','11+','NO_ADMITIDA'].map(bin=>[
    bin,qualifying.filter(x=>
     bin==='NO_ADMITIDA'?!x.admitted:
     x.rankOfficial!==null&&(
      bin==='1–3'?x.rankOfficial<=3:
      bin==='4–6'?x.rankOfficial>=4&&x.rankOfficial<=6:
      bin==='7–10'?x.rankOfficial>=7&&x.rankOfficial<=10:
       x.rankOfficial>=11)).length
   ])),
   traits:Object.fromEntries(['rootOnly','rootAndBranch','branch','neither'].map(k=>[
    k,{families:items.reduce((n,c)=>n+c.negativeControls[k as keyof typeof c.negativeControls].families,0),
       qualifiedHeads:items.reduce((n,c)=>n+c.negativeControls[k as keyof typeof c.negativeControls].heads,0)}]))
  };
 };
 const total=totals(cuts);
 const borderSummary=(records:typeof borderCuts)=>{
  const controls=sumFeatureControls(records.map(x=>x.controls));
  return {cuts:records.length,
   physicalHeads:records.reduce((n,c)=>n+c.physicalWinnerHeads,0),
   unadmittedPhysicalHeads:records.reduce((n,c)=>n+c.nonAdmittedWinnerHeads,0),
   unadmittedPhysicalFamilies:records.reduce((n,c)=>n+c.rows.length,0),
   controls,
   winningExamples:records.flatMap(c=>c.rows.filter(x=>x.hit>0).map(r=>({
    date:c.date,turn:c.turn,family:r.family,heads:r.hit,
    firstSource:r.source,sources:r.sourceCount,physicalRoutes:r.routes,
    onlyLatestSource:r.onlyLatestSource,
    previouslyWinningShapeSameSource:r.historySameSource,
    previouslyWinningShapeOtherSource:r.historyOtherSource,
    historicalExactPosition:r.historyExactPosition,
    historicalExactSameSource:r.historyExactSameSource,
    historicalNearSameSource:r.historyNearSameSource,
    earlierTodayVerifiedShape:r.earlierTodayShape,
    historicalEvents:r.historicalEventCount,
    oldWitnesses:r.prevWinningFigures.slice(0,4),
    presentPaths:r.currentPaths.slice(0,4)
   })))
  };
 };
 const borderFull={protocol:{
  exactPeriod:targetDates,
  admitted:'Fuera del ranking oficial; sólo familias VT3 físicas NO admitidas',
  control:'Todas las demás familias VT3 no admitidas que también pueden formarse físicamente en cada PRE',
  evidence:'Figura geométrica previamente marcada por cabezas completas realmente sorteadas, no valores heredados',
  chronology:'6 jornadas anteriores más marcas reales de turnos previos del día; sin POST objetivo',
  disclaimer:'Contraste exploratorio retrospectivo, seis jornadas reutilizadas, sin PRE prospectivo sellado'
 },total:borderSummary(borderCuts),
  byPeriod:{
   OCT_10_13:borderSummary(borderCuts.filter(x=>x.date<='2026-10-13')),
   OCT_14_16:borderSummary(borderCuts.filter(x=>x.date>='2026-10-14'))
  },
  byTurn:Object.fromEntries(TURNOS.map(t=>[t,borderSummary(borderCuts.filter(x=>x.turn===t))])),
  cuts:borderCuts};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/FRONTERA_VT3_NO_ADMITIDAS_6_JORNADAS.json',
  JSON.stringify(borderFull,null,2)+'\n');
 console.log('FRONTERA_NO_ADMITIDAS_INICIO');
 console.log(JSON.stringify({
  protocol:borderFull.protocol,total:borderFull.total,
  byPeriod:borderFull.byPeriod,
  byTurn:Object.fromEntries(TURNOS.map(t=>[t,{
   cuts:borderFull.byTurn[t].cuts,
   unadmittedPhysicalHeads:borderFull.byTurn[t].unadmittedPhysicalHeads,
   families:borderFull.byTurn[t].unadmittedPhysicalFamilies,
   controls:borderFull.byTurn[t].controls
  }]))
 },null,2));
 console.log('FRONTERA_NO_ADMITIDAS_FIN');
 const report={protocol:{
  period:targetDates,mode:'RECONSTRUCCION_HISTORICA_SIN_PRE_SELLADO',
  eligible:'Cabezas con VT3 formado físicamente dentro de columna +11, otras no entran en numerador ni denominador analítico',
  fixedAlternatives:'D1-prioridad y raíz-total-prioridad sobre las mismas familias ya ADMITIDAS por Lalo; no crean candidatas',
  negativeControls:'Familias físicamente posibles y admitidas que no salieron; agrupadas por bifurcación y raíz',
  modelUnmodified:true,
  inputHash:createHash('sha256').update(JSON.stringify(targetDates.map(d=>
   [d,byDate.get(d)!.heads]))).digest('hex')
 },totals:total,byDate:Object.fromEntries(targetDates.map(d=>[
  d,totals(cuts.filter(x=>x.date===d))])),
 byTurn:Object.fromEntries(TURNOS.map(t=>[
  t,totals(cuts.filter(x=>x.turn===t))])),
 cases:cuts.filter(x=>x.headsPhysical.length>0).map(c=>({
  date:c.date,turn:c.turn,qualified:c.headsPhysical.length,
  qualifiedHeads:c.headsPhysical.map(h=>({
   head:h.head,jur:h.jur,family:h.family,
   physicallyValidSources:h.originSources,physicalPaths:h.physicalPaths,
   officialRank:h.rankOfficial,rootFirstRank:h.rankRoots,
   d1FirstRank:h.rankD1,geometryRank:h.geometryRank,
   traits:h.familyTraits
  })),
  officialTop6:c.variants.OFICIAL.familiesTop6,
  d1FirstTop6:c.variants.RAIZ_D1_PRIMERO.familiesTop6,
  rootFirstTop6:c.variants.RAIZ_TOTAL_PRIMERO.familiesTop6,
  admittedNonWinnerCount:c.admittedNonWinners,
  competingPhysicalCandidates:c.rankedFamilyRows.filter(f=>
   f.rank<=6||f.rankD1<=6||f.rankRoots<=6),
  admittedDistribution:c.negativeControls,control:c.control
 }))};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/DECISIONES_VT3_ULTIMAS_6_JORNADAS.json',
  JSON.stringify(report,null,2)+'\n');
 console.log('DECISIONES_VT3_INICIO');
 console.log(JSON.stringify(report,null,2));
 console.log('DECISIONES_VT3_FIN');
}
main().catch(e=>{console.error(e);process.exitCode=1});
