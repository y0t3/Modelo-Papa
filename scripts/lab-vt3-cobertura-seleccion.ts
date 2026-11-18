/**
 * Auditoría nueva, fechada 18/11/2026. Compara los motores reales de Modelo
 * Lalo para jornadas COMPLETAS 02-17/11/2026 (18/11 excluido por Nocturno).
 * Rank PRE reconstruido por cortes, resultados POST sólo para cotejo final.
 *
 * Motores: Lalo +11, Aux Ayer / Hoy y Formas Primero (aux cada política).
 * Modalidades: VT2, VT3, lugares 1–5/6–10, top3/5/10 y #11–20.
 * No compara auxiliares usando la misma disponibilidad del turno si no la
 * tenían; Aux Hoy Previa nunca es evaluable.
 * No cambia componentes de producción.
 */
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import type {AuxiliaryHistorical,AuxRank} from '../src/motorLaloIntegral';
import {auxFamily,auxiliaryBoard,collectAuxFamilies,enumerateAuxPaths} from '../src/auxSantiagoNeuquen';
import {selectAuxFormFirst} from '../src/labAuxFormasPrimeroVT3';
import {formPositions,buildFormFirstMotor} from '../src/motorFormasPrimero';
import {buildFigureTracking} from '../src/figureTracking';

const FROM=process.env.VT3_FROM||'2026-11-02',TO=process.env.VT3_TO||'2026-11-17';
const headJurs=JURS.filter(j=>j!=='Montevideo');
const valid=(s:string)=>/^\d{4}$/.test(s);
const hash=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const drawCache=new Map<string,Promise<CabezasDia>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
function draw(d:string){
 let promise=drawCache.get(d);
 if(!promise){promise=descargarCabezas(d,true);drawCache.set(d,promise)}
 return promise;
}
function aux(d:string){
 let promise=auxCache.get(d);
 if(!promise){promise=fetchAuxiliaryHeads(d);auxCache.set(d,promise)}
 return promise;
}
type Model='lalo'|'aux_ayer'|'aux_hoy'|'formas_ayer'|'formas_hoy';
type VT3Model='lalo'|'aux_ayer'|'aux_hoy';
type Vt3Variant='original'|'independentRoots'|'recentFirst'|'balancedD1D7'|
 'shapeBreadth'|'noCrossOrBranch'|'shapePriority'|'sparse';
const variantNames:Vt3Variant[]=[
 'original','independentRoots','recentFirst','balancedD1D7',
 'shapeBreadth','noCrossOrBranch','shapePriority','sparse'
];
type ShadowTrial={date:string;turn:Turno;heads:number;
 baseline:number;rootlessWitness:number;rootlessStrong:number;
 rootlessWitnessFamilies:number;rootlessStrongFamilies:number;
 promotedWinningHeads:number;strongWinningHeads:number;
 sameSourcePromoted:number;chosenWithTwoEvents:number;
 totalStrongCandidates:number;totalRootlessCandidates:number;
};
type ShapeTrial={date:string;turn:Turno;heads:number;
 original:number;formasPrimero:number;mix8y2:number;
 formasCount:number;mixCount:number;newFamilies:number;
 rootlessPromoted:number;rootlessWinners:number};
type VT3Cut={
 date:string;turn:Turno;model:VT3Model;
 heads:number;physicalHeads:number;rankedHeads:number;top10Heads:number;
 ranked11to20:number;ranked21plus:number;physicalWithoutRoot:number;
 notFormable:number;rankedFamilies:number;physicallyPossibleFamilies:number;
 variants:Record<Vt3Variant,number>;
 winners:{jur:string;head:string;family:string;physical:boolean;rank:number|null}[];
};
/**
 * Pre-registradas, sin seleccionar variantes según resultados objetivos:
 * Original orden intacto; alternativas reordenan exactamente las familias
 * generadas del mismo motor, sin traer ganadoras físicamente imposibles.
 */
function altRankVT3(model:VT3Model,ranked:(LaloFamily|AuxRank)[]):Record<Vt3Variant,string[]>{
 const isLalo=model==='lalo';
 const normalized=ranked.map((r,i)=>{
  const laro=r as LaloFamily,aux=r as AuxRank;
  const blocks=isLalo?laro.physicalBlocks:new Set(aux.paths.map(p=>
   p.map(c=>c.row+':'+c.col).sort().join(','))).size;
  return {family:r.family,original:i,
   root:isLalo?laro.directRoots:aux.roots,
   d1:isLalo?laro.d1Roots:aux.d1,
   d7:isLalo?laro.d7Roots:aux.d7,
   branch:isLalo?laro.branchBlocks:Number(aux.crossing),
   breadth:isLalo?laro.sourceCount:aux.sources.length,
   blocks};
 });
 const score=(r:typeof normalized[number],v:Vt3Variant):number[]=>{
  const classic=[r.root,r.d1,r.d7,r.branch,r.breadth,r.blocks];
  switch(v){
   case 'independentRoots':return classic;
   case 'recentFirst':return [r.d1,r.root,r.d7,r.branch,r.breadth,r.blocks];
   case 'balancedD1D7':return [Math.min(r.d1,r.d7),r.root,r.d1,
    r.branch,r.breadth,r.blocks];
   case 'shapeBreadth':return [r.breadth,r.root,r.d1,r.d7,r.blocks,r.branch];
   case 'noCrossOrBranch':return [r.root,r.d1,r.d7,r.breadth,r.blocks];
   case 'shapePriority':return [r.blocks,r.root,r.d1,r.d7,r.breadth,r.branch];
   case 'sparse':return [-r.blocks,r.root,r.d1,r.d7,r.breadth,r.branch];
   default:return [-r.original];
  }
 };
 const order=Object.fromEntries(variantNames.map(v=>[v,
  [...normalized].sort((a,b)=>{
   const A=score(a,v),B=score(b,v);
   for(let i=0;i<A.length;i++)if(A[i]!==B[i])return B[i]-A[i];
   return a.original-b.original;
  }).map(r=>r.family)
 ]));
 return order as Record<Vt3Variant,string[]>;
}
function diagnosticVT3(date:string,turn:Turno,model:VT3Model,
 ranked:LaloFamily[]|AuxRank[],physicalFamilies:string[],
 observed:{jur:string;head:string}[]):VT3Cut{
 const paths=new Set(physicalFamilies);
 const original=ranked.map(x=>x.family);
 const positions=new Map(original.map((fam,i)=>[fam,i+1]));
 const allVariants=altRankVT3(model,ranked);
 const variants=Object.fromEntries(variantNames.map(v=>{
  const top=new Set(allVariants[v].slice(0,10));
  return [v,observed.filter(x=>top.has(auxFamily(x.head.slice(-3)))).length];
 })) as Record<Vt3Variant,number>;
 const winners=observed.map(x=>{
  const family=auxFamily(x.head.slice(-3));
  return {...x,family,physical:paths.has(family),rank:positions.get(family)||null};
 });
 return {
  date,turn,model,heads:winners.length,
  physicalHeads:winners.filter(w=>w.physical).length,
  rankedHeads:winners.filter(w=>w.rank!==null).length,
  top10Heads:winners.filter(w=>w.rank!==null&&w.rank<=10).length,
  ranked11to20:winners.filter(w=>w.rank!==null&&w.rank>=11&&w.rank<=20).length,
  ranked21plus:winners.filter(w=>w.rank!==null&&w.rank>20).length,
  physicalWithoutRoot:winners.filter(w=>w.physical&&w.rank===null).length,
  notFormable:winners.filter(w=>!w.physical).length,
  rankedFamilies:original.length,physicallyPossibleFamilies:paths.size,
  variants,winners
 };
}
function summarizeVt3(rows:VT3Cut[]){
 const total=(k:keyof VT3Cut)=>rows.reduce((n,r)=>n+Number(r[k]),0);
 const variants=Object.fromEntries(variantNames.map(v=>[v,rows.reduce(
  (n,r)=>n+r.variants[v],0)]));
 const byDate=[...new Set(rows.map(x=>x.date))].sort();
 const dayLines=byDate.map(date=>Object.fromEntries(variantNames.map(v=>[v,
  rows.filter(x=>x.date===date).reduce((n,r)=>n+r.variants[v],0)])));
 return {
  cuts:rows.length,heads:total('heads'),physicalHeads:total('physicalHeads'),
  rankedHeads:total('rankedHeads'),top10Heads:total('top10Heads'),
  ranked11to20:total('ranked11to20'),ranked21plus:total('ranked21plus'),
  physicalWithoutRoot:total('physicalWithoutRoot'),notFormable:total('notFormable'),
  avgRanked:rows.length?Number((total('rankedFamilies')/rows.length).toFixed(2)):0,
  avgPhysicalFamilies:rows.length?Number((total('physicallyPossibleFamilies')/rows.length).toFixed(2)):0,
  variants,byDate,
  betterDays:Object.fromEntries(variantNames.slice(1).map(v=>[v,
   dayLines.filter(day=>day[v]>day.original).length])),
  worseDays:Object.fromEntries(variantNames.slice(1).map(v=>[v,
   dayLines.filter(day=>day[v]<day.original).length]))
 };
}

type Vt='VT2'|'VT3'|'VT4';
type Datum={
 date:string;turn:Turno;model:Model;vt:Vt;
 top:string[];topLength:number;top3:number|null;top5:number|null;
 top10:number|null;first:number|null;second:number|null;
 rank11to20:number|null;winnerDetails:{
  jur:string;head:string;family:string;rank:number|null
 }[];
 formable:number|null;historicalRoots?:number;
 controls:number[];physicalFamilies:number;
};
const rankOnce=(date:string,turn:Turno,model:Model,vt:Vt,top:string[],
 winners:{jur:string;head:string}[],formable:number|null,
 physicalPool:string[],historicalRoots?:number):Datum=>{
 const familyOf=(s:string)=>vt==='VT2'?reversibleFamily(s):auxFamily(s);
 const details=winners.map(w=>{
  const f=vt==='VT4'?w.head:familyOf(w.head.slice(vt==='VT2'?-2:-3));
  const pos=top.findIndex(family=>vt==='VT4'?family.split('/').includes(f):family===f);
  return {...w,family:f,rank:pos<0?null:pos+1};
 });
 const hit=(l:number,h:number)=>details.filter(x=>x.rank!==null&&x.rank>=l&&x.rank<=h).length;
 const n=top.length;
 const controls=n>=10&&vt!=='VT4'?Array.from({length:20},(_,seed)=>{
  const list=[...new Set(physicalPool)].sort((a,b)=>
   hash(date+'|'+turn+'|'+model+'|'+vt+'|control'+seed+'|'+a)-
   hash(date+'|'+turn+'|'+model+'|'+vt+'|control'+seed+'|'+b)||a.localeCompare(b)).slice(0,10);
  const selected=new Set(list);
  return details.filter(x=>selected.has(x.family)).length;
 }):[];
 return {date,turn,model,vt,top,topLength:n,controls,
  physicalFamilies:new Set(physicalPool).size,
  top3:n>=3?hit(1,3):null,top5:n>=5?hit(1,5):null,
  top10:n>=10?hit(1,10):null,
  first:n>=10?hit(1,5):null,second:n>=10?hit(6,10):null,
  rank11to20:n>=20?hit(11,20):null,
  winnerDetails:details,formable,historicalRoots
 };
};
function summarize(xs:Datum[]){
 const score=(k:keyof Datum)=>xs.reduce((s,r)=>s+(typeof r[k]==='number'&&r[k]!==null?(r[k] as number):0),0);
 const eligible=(k:keyof Datum)=>xs.filter(r=>r[k]!==null&&typeof r[k]==='number').length;
 const sum=xs.reduce((s,r)=>s+r.winnerDetails.length,0);
 const headHits=xs.filter(x=>x.top10!==null).flatMap(x=>
  x.winnerDetails.filter(z=>z.rank!==null&&z.rank<=10));
 const allRanked=xs.flatMap(x=>x.winnerDetails.filter(z=>z.rank!==null));
 return {
  cuts:xs.length,heads:sum,top10EligibleCuts:eligible('top10'),
  top10EligibleHeads:eligible('top10')*5,
  hitsTop3:score('top3'),cutsTop3:eligible('top3'),
  hitsTop5:score('top5'),cutsTop5:eligible('top5'),
  hitsTop10:score('top10'),turnsWithOneOrMoreTop10:xs.filter(x=>(x.top10??0)>0).length,
  hitsFirst5:score('first'),hitsSecond5:score('second'),
  top11to20Hits:score('rank11to20'),top11to20Cuts:eligible('rank11to20'),
  allRankedHeads:allRanked.length,rankedButOutsideTop10:allRanked.filter(x=>x.rank!>10).length,
  validHeadsFormable:xs.filter(x=>x.formable!==null).reduce((s,x)=>s+x.formable!,0),
  headsOnFormableCuts:xs.filter(x=>x.formable!==null).length*5,
  neutralControl:(()=>{
   const totals=Array.from({length:20},(_,i)=>xs.reduce((sum,r)=>sum+(r.controls[i]||0),0));
   return {mean:Number((totals.reduce((a,b)=>a+b,0)/20).toFixed(2)),
    min:Math.min(...totals),max:Math.max(...totals)};
  })(),
  top10HitExamples:headHits.slice(0,20).map(x=>({jur:x.jur,head:x.head,family:x.family,rank:x.rank}))
 };
}
async function one(date:string):Promise<{date:string;rows:Datum[];diagnostics:VT3Cut[];
 shapeTrials:ShapeTrial[];shadowTrials:ShadowTrial[];
 missing:{turn:Turno;found:number}[]}>{
 const weekDate=shiftDay(date,-7);
 const [current,previous,weekly,noctBase]=await Promise.all([
  draw(date),loadPreviousDraws(date,6,draw),draw(weekDate),
  nocturnaAnteriorPorJur(date,draw)
 ]);
 const hist:LaloHistorical[]=[];
 const latest=previous.at(-1)!,before=previous.at(-2)!;
 hist.push({date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,before.heads)});
 if(weekDate<date&&hasDrawResults(weekly)){
  const beforeWeek=await loadPreviousDraws(weekDate,1,draw);
  hist.push({date:weekDate,period:'D−7',sheet:buildSheet(weekly,beforeWeek[0].heads)});
 }
 const historicalRefs=hist.map(ref=>({
  date:ref.date,period:ref.period,
  heads:ref.date===latest.date?latest.heads:weekly
 }));
 const auxDays=new Set<string>([date,auxiliarySourceDate(date)]);
 for(const p of previous){
  auxDays.add(p.date);auxDays.add(auxiliarySourceDate(p.date));
 }
 for(const ref of historicalRefs){
  auxDays.add(ref.date);auxDays.add(auxiliarySourceDate(ref.date));
 }
 const observations=new Map(await Promise.all([...auxDays].map(async d=>
  [d,(await aux(d)).heads] as const)));
 const auxHist={} as Record<AuxMode,AuxiliaryHistorical[]>;
 const sixHist={} as Record<AuxMode,AuxiliaryHistorical[]>;
 for(const mode of ['anterior','intrajornada'] as const){
  const refDate=(day:string)=>mode==='anterior'?auxiliarySourceDate(day):day;
  auxHist[mode]=historicalRefs.map(ref=>({
   date:ref.date,period:ref.period,
   aux:extractAuxHistoryMode(ref.date,observations.get(refDate(ref.date))!,
    ref.heads,mode)
  }));
  sixHist[mode]=previous.map(p=>({
   date:p.date,period:'D−1' as const,
   aux:extractAuxHistoryMode(p.date,observations.get(refDate(p.date))!,
    p.heads,mode)
  }));
 }
 const whole=buildSheet(current,noctBase.heads);
 const visualDays=await Promise.all(previous.map(async p=>{
  const prevNoct=await nocturnaAnteriorPorJur(p.date,draw);
  return {date:p.date,heads:p.heads,sheet:buildSheet(p.heads,prevNoct.heads)};
 }));
 const rows:Datum[]=[],diagnostics:VT3Cut[]=[],shapeTrials:ShapeTrial[]=[],
  shadowTrials:ShadowTrial[]=[],missing:{turn:Turno;found:number}[]=[];
 for(const turn of TURNOS){
  const observed=headJurs.map(jur=>({jur,head:current[turn]?.[jur]||''}));
  if(observed.some(x=>!valid(x.head))){
   missing.push({turn,found:observed.filter(x=>valid(x.head)).length});
   continue;
  }
  const pre=preSheetAtCut(whole,turn,TURNOS.indexOf(turn));
  const lalo=buildMotorLalo(pre,date,turn,hist);
  const physicallyLalo=[...new Set(formPositions(pre,turn,'vt3').map(loc=>{
   const col=pre.columns.find(c=>c.id===loc.source)!;
   return reversibleFamily(loc.cells.map(cell=>col.values[cell.row][cell.col]).join(''));
  }))];
  diagnostics.push(diagnosticVT3(date,turn,'lalo',lalo.ranks.vt3,physicallyLalo,observed));
  // Formas Primero Lalo: se ordenan primero siluetas con 6 jornadas
  // PRE previas y recién entonces se leen las cifras actuales.
  const physicalForms=buildFormFirstMotor(pre,date,turn,visualDays,10,'vt3');
  const official=lalo.ranks.vt3.slice(0,10).map(x=>x.family);
  const shapeTop=physicalForms.top.map(x=>x.family);
  const blend=[...official.slice(0,8),...shapeTop.filter(x=>
   !official.slice(0,8).includes(x)).slice(0,2)];
  const actual=observed.map(x=>auxFamily(x.head.slice(-3)));
  const hit=(top:string[])=>actual.filter(x=>top.includes(x)).length;

  // SHADOW DE FIGURAS, sin usar un solo POST: cada testigo es
  // un evento histórico ganador distinto, NO cada trazo/minihoja.
  // El motor Lalo oficial no cambia. Se prueba sustitución limitada
  // de 2 puestos al final del Top10, junto con variante más estricta.
  const trace=buildFigureTracking(date,turn,pre,visualDays,lalo);
  const shadow=trace.records.filter(x=>!x.recognized&&x.antecedents.length)
   .map(x=>{
    const events=new Set(x.antecedents.map(a=>
     [a.date,a.turn,a.jurisdiction,a.head].join('|')));
    const sameSource=new Set(x.antecedents.filter(a=>a.relation==='MISMA_FUENTE')
     .map(a=>[a.date,a.turn,a.jurisdiction,a.head].join('|')));
    const nearest=Math.min(...x.antecedents.map(a=>Math.abs(a.verticalShift)));
    const days=new Set(x.antecedents.map(a=>a.date));
    return {family:x.family,events:events.size,sameSource:sameSource.size,
     nearest,days:days.size,roots:x.antecedents.length};
   }).sort((a,b)=>b.events-a.events||b.days-a.days||
    b.sameSource-a.sameSource||a.nearest-b.nearest||
    a.family.localeCompare(b.family));
  const choose=(xs:typeof shadow)=>{
   const extras=xs.slice(0,2).map(x=>x.family);
   const first=official.slice(0,8),remaining=official.slice(8);
   return [...first,...extras.filter(x=>!first.includes(x)),
    ...remaining.filter(x=>!first.includes(x)&&!extras.includes(x))].slice(0,10);
  };
  const witnessTop=choose(shadow);
  const strong=shadow.filter(x=>x.events>=2&&x.days>=2&&x.nearest<=1);
  const strongTop=choose(strong);
  const rootlessWinners=actual.filter(x=>!lalo.ranks.vt3.some(r=>r.family===x));
  const chosenFrom=(chosen:string[])=>chosen.filter(x=>!official.includes(x));
  const inserted=chosenFrom(witnessTop),insertedStrong=chosenFrom(strongTop);
  shadowTrials.push({date,turn,heads:actual.length,baseline:hit(official),
   rootlessWitness:hit(witnessTop),rootlessStrong:hit(strongTop),
   rootlessWitnessFamilies:inserted.length,
   rootlessStrongFamilies:insertedStrong.length,
   promotedWinningHeads:rootlessWinners.filter(x=>inserted.includes(x)).length,
   strongWinningHeads:rootlessWinners.filter(x=>insertedStrong.includes(x)).length,
   sameSourcePromoted:shadow.filter(x=>inserted.includes(x)&&x.sameSource>0).length,
   chosenWithTwoEvents:shadow.filter(x=>inserted.includes(x)&&x.events>=2).length,
   totalStrongCandidates:strong.length,totalRootlessCandidates:shadow.length
  });

  shapeTrials.push({date,turn,heads:actual.length,
   original:hit(official),formasPrimero:shapeTop.length===10?hit(shapeTop):0,
   mix8y2:blend.length===10?hit(blend):0,
   formasCount:shapeTop.length,mixCount:blend.length,
   newFamilies:blend.filter(x=>!official.includes(x)).length,
   rootlessPromoted:blend.filter(x=>!lalo.ranks.vt3.some(r=>r.family===x)).length,
   rootlessWinners:actual.filter(x=>blend.includes(x)&&
    !lalo.ranks.vt3.some(r=>r.family===x)).length
  });
  for(const [vt,k] of [['VT2','vt2'],['VT3','vt3'],['VT4','vt4']] as const){
   const ranks=lalo.ranks[k].map(x=>x.family);
   const possible=k==='vt4'?ranks:[...new Set(formPositions(pre,turn,k)
    .map(loc=>{
     const col=pre.columns.find(c=>c.id===loc.source)!;
     return reversibleFamily(loc.cells.map(cell=>col.values[cell.row][cell.col]).join(''));
    }))];
   rows.push(rankOnce(date,turn,'lalo',vt,ranks,observed,null,possible));
  }
  for(const mode of ['anterior','intrajornada'] as const){
   const name:Model=mode==='anterior'?'aux_ayer':'aux_hoy';
   const formName:Model=mode==='anterior'?'formas_ayer':'formas_hoy';
   const source=mode==='anterior'?auxiliarySourceDate(date):date;
   const boardHeads=auxAtCut(observations.get(source)!,turn,mode);
   const board=auxiliaryBoard(boardHeads,turn);
   const ranks=buildAuxIndependent(date,turn,boardHeads,auxHist[mode]);
   const physicalVt3=collectAuxFamilies(board,3).map(x=>x.family);
   diagnostics.push(diagnosticVT3(date,turn,name,ranks[3],physicalVt3,observed));
   for(const [vt,length] of [['VT2',2],['VT3',3],['VT4',4]] as const){
    const values=ranks[length].map(x=>x.family);
    if(length===4){
     const formed=new Set(enumerateAuxPaths(board,4)
      .map(p=>p.map(c=>c.digit).join('')));
     rows.push(rankOnce(date,turn,name,vt,values,observed,
      observed.filter(x=>formed.has(x.head)).length,values));
    }else{
     const physical=collectAuxFamilies(board,length);
     const possible=new Set(physical.map(x=>x.family));
     const hit=observed.filter(x=>possible.has(auxFamily(x.head.slice(-length)))).length;
     rows.push(rankOnce(date,turn,name,vt,values,observed,hit,physical.map(x=>x.family)));
    }
   }
   const forms=selectAuxFormFirst(board,sixHist[mode],date,name);
   const families=forms.top.map(x=>x.family);
   const physical=collectAuxFamilies(board,3).map(x=>x.family);
   const physicalSet=new Set(physical);
   rows.push(rankOnce(date,turn,formName,'VT3',families,observed,
    observed.filter(x=>physicalSet.has(auxFamily(x.head.slice(-3)))).length,
    physical,forms.winnerRoots));
  }
 }
 return {date,rows,diagnostics,shapeTrials,shadowTrials,missing};
}
async function main(){
 const dates:string[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1))
  if(new Date(d+'T12:00:00Z').getUTCDay()!==0)dates.push(d);
 const successes:Awaited<ReturnType<typeof one>>[]=[];
 const skipped:{date:string;error:string}[]=[];
 for(const date of dates){
  try{
   const result=await one(date);
   successes.push(result);
   const scores=Object.fromEntries(
    (['lalo','aux_ayer','aux_hoy','formas_ayer','formas_hoy'] as Model[])
     .map(model=>[model,Object.fromEntries((['VT2','VT3'] as Vt[])
      .map(vt=>[vt,result.rows.filter(x=>x.model===model&&x.vt===vt)
       .reduce((s,x)=>s+(x.top10??0),0)]))]));
   console.log('BALANCE_DAY',date,
    JSON.stringify({cuts:TURNOS.length-result.missing.length,
     missing:result.missing,score:scores}));
  }catch(e){
   skipped.push({date,error:String(e).slice(0,280)});
   console.log('BALANCE_SKIP',date,String(e).slice(0,250));
  }
 }
 const all=successes.flatMap(x=>x.rows);
 const models=['lalo','aux_ayer','aux_hoy','formas_ayer','formas_hoy'] as Model[];
 const vts=['VT2','VT3','VT4'] as Vt[];
 const byModel=Object.fromEntries(models.map(m=>[m,Object.fromEntries(vts
  .filter(v=>!m.startsWith('formas')||v==='VT3')
  .map(v=>[v,summarize(all.filter(x=>x.model===m&&x.vt===v))]))]));
 const byTurn=Object.fromEntries(TURNOS.map(turn=>[
  turn,Object.fromEntries(models.map(m=>[m,Object.fromEntries(vts
   .filter(v=>!m.startsWith('formas')||v==='VT3')
   .map(v=>[v,summarize(all.filter(x=>x.turn===turn&&x.model===m&&x.vt===v))]))]))
 ]));
 const comparable=Object.fromEntries(vts.map(vt=>{
  const groups=new Map<string,Datum[]>();
  for(const r of all.filter(x=>x.vt===vt&&['lalo','aux_ayer','aux_hoy'].includes(x.model))){
   const id=r.date+'|'+r.turn;
   const pool=groups.get(id)||[];pool.push(r);groups.set(id,pool);
  }
  const common=[...groups.values()].filter(rs=>rs.length===3&&rs.every(r=>r.top10!==null));
  return [vt,{cuts:common.length,heads:common.length*5,
   byMotor:Object.fromEntries((['lalo','aux_ayer','aux_hoy'] as Model[]).map(m=>{
    const xs=common.map(rs=>rs.find(r=>r.model===m)!);
    return [m,summarize(xs)];
   }))}];
 }));
 const pairs=[
  ['aux_hoy','lalo'],['aux_hoy','aux_ayer'],['aux_ayer','lalo'],
  ['formas_ayer','aux_ayer'],['formas_hoy','aux_hoy']
 ] as const;
 const pairedTests=Object.fromEntries(vts.map(vt=>[vt,Object.fromEntries(pairs
  .filter(([a,b])=>vt==='VT3'||(!a.startsWith('formas')&&!b.startsWith('formas')))
  .map(([a,b],p)=>{
   const daily=successes.map(day=>{
    let hitsA=0,hitsB=0,cuts=0;
    for(const turn of TURNOS){
     const A=day.rows.find(r=>r.turn===turn&&r.vt===vt&&r.model===a);
     const B=day.rows.find(r=>r.turn===turn&&r.vt===vt&&r.model===b);
     if(A?.top10===null||B?.top10===null||!A||!B)continue;
     cuts++;hitsA+=A.top10;hitsB+=B.top10;
    }
    return {date:day.date,hitsA,hitsB,cuts,delta:hitsA-hitsB};
   });
   let seed=(20261118+p*197+Number(vt==='VT3')*2003)>>>0;
   const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};
   const bSamples=Array.from({length:3000},()=>{
    let total=0;
    for(let i=0;i<daily.length;i++)total+=daily[Math.floor(random()*daily.length)].delta;
    return total;
   }).sort((x,y)=>x-y);
   return [a+'__'+b,{
    cuts:daily.reduce((n,x)=>n+x.cuts,0),
    hitsA:daily.reduce((n,x)=>n+x.hitsA,0),
    hitsB:daily.reduce((n,x)=>n+x.hitsB,0),
    difference:daily.reduce((n,x)=>n+x.delta,0),
    dayBootstrap95:[bSamples[74],bSamples[2924]],
    daysBetter:daily.filter(x=>x.delta>0).length,
    daysWorse:daily.filter(x=>x.delta<0).length,
    daysTied:daily.filter(x=>x.delta===0).length
   }];
  }))]));
 const allDiagnostic=successes.flatMap(d=>d.diagnostics);
 const vt3Diagnostic=Object.fromEntries((['lalo','aux_ayer','aux_hoy'] as VT3Model[]).map(model=>[
  model,{all:summarizeVt3(allDiagnostic.filter(x=>x.model===model)),
   byTurn:Object.fromEntries(TURNOS.map(t=>[t,summarizeVt3(allDiagnostic.filter(
    x=>x.model===model&&x.turn===t))]))}
 ]));

 const allShadow=successes.flatMap(x=>x.shadowTrials);
 const shadowCount=(field:keyof ShadowTrial,rows=allShadow)=>
  rows.reduce((n,r)=>n+Number(r[field]),0);
 const shadowSummary=(rows:ShadowTrial[])=>({
  cuts:rows.length,heads:shadowCount('heads',rows),
  baseline:shadowCount('baseline',rows),
  witness:shadowCount('rootlessWitness',rows),
  strong:shadowCount('rootlessStrong',rows),
  promotedFamilies:shadowCount('rootlessWitnessFamilies',rows),
  strongPromoted:shadowCount('rootlessStrongFamilies',rows),
  promotedReal:shadowCount('promotedWinningHeads',rows),
  strongReal:shadowCount('strongWinningHeads',rows),
  meanRootless:rows.length?Number((shadowCount('totalRootlessCandidates',rows)/rows.length).toFixed(1)):0,
  meanStrong:rows.length?Number((shadowCount('totalStrongCandidates',rows)/rows.length).toFixed(1)):0,
 });
 const shadowEvidence={
  all:shadowSummary(allShadow),
  byTurn:Object.fromEntries(TURNOS.map(t=>[t,shadowSummary(allShadow.filter(x=>x.turn===t))])),
  byDate:Object.fromEntries([...new Set(allShadow.map(x=>x.date))].sort()
   .map(d=>[d,shadowSummary(allShadow.filter(x=>x.date===d))]))
 };

 const allShapes=successes.flatMap(x=>x.shapeTrials);
 const sum=(name:keyof ShapeTrial,rows=allShapes)=>rows.reduce((n,x)=>n+Number(x[name]),0);
 const shapes={cuts:allShapes.length,formsFull:allShapes.filter(x=>x.formasCount===10).length,
  mixFull:allShapes.filter(x=>x.mixCount===10).length,
  original:sum('original'),formasPrimero:sum('formasPrimero'),mix8y2:sum('mix8y2'),
  mixedNewFamilies:sum('newFamilies'),mixedRootless:sum('rootlessPromoted'),
  mixedRootlessWins:sum('rootlessWinners'),
  byTurn:Object.fromEntries(TURNOS.map(turn=>{const x=allShapes.filter(t=>t.turn===turn);
   return [turn,{cuts:x.length,original:sum('original',x),
    formasPrimero:sum('formasPrimero',x),mix8y2:sum('mix8y2',x)}]})),
  byDate:Object.fromEntries([...new Set(allShapes.map(x=>x.date))].sort().map(date=>{
   const x=allShapes.filter(t=>t.date===date);
   return [date,{original:sum('original',x),formasPrimero:sum('formasPrimero',x),
    mix8y2:sum('mix8y2',x)}]}))
 };
 const result={
  dates:dates,dayCount:successes.length,from:FROM,to:TO,comparable,pairedTests,vt3Diagnostic,shapes,shadowEvidence,
  skipped,missingDraws:successes.filter(x=>x.missing.length).map(x=>({
   date:x.date,missing:x.missing})),
  method:'PRE reconstruido: +11 y Aux Ayer/Hoy D−1 y D−7, Formas Primero seis jornadas. Montevideo sólo como fuente, no objetivo. 5 jurisdicciones objetivo por corte. Top10 requiere 10 familias completas.',
  byModel,byTurn,
  rankedExamples:all.filter(x=>x.vt==='VT3'&&x.top10!==null)
   .flatMap(x=>x.winnerDetails.filter(y=>y.rank!==null&&y.rank<=20)
    .map(y=>({date:x.date,turn:x.turn,model:x.model,...y}))).slice(-75),
  daily:successes.map(x=>({date:x.date,cuts:5-x.missing.length,
   hits:Object.fromEntries(models.map(m=>[m,Object.fromEntries(vts
    .filter(v=>!m.startsWith('formas')||v==='VT3')
    .map(v=>[v,x.rows.filter(y=>y.model===m&&y.vt===v)
     .reduce((s,y)=>s+(y.top10??0),0)]))]))}))
 };
 console.log('VT3_SHADOW_START');
 console.log(JSON.stringify({from:FROM,to:TO,shadowEvidence}));
 console.log('VT3_SHADOW_END');
 console.log('VT3_FORMAS_START');
 console.log(JSON.stringify({window:[FROM,TO],shapes}));
 console.log('VT3_FORMAS_END');
 console.log('VT3_DIAGNOSTICO_START');
 console.log(JSON.stringify({from:FROM,to:TO,days:successes.length,skipped,vt3Diagnostic,
  examples:allDiagnostic.flatMap(x=>x.winners.filter(w=>w.physical&&w.rank===null)
   .map(w=>({date:x.date,turn:x.turn,model:x.model,...w}))).slice(-25)}));
 console.log('VT3_DIAGNOSTICO_END');
 console.log('BALANCE_JSON_START');
 console.log(JSON.stringify(result));
 console.log('BALANCE_JSON_END');
 if(successes.length<10)throw Error('Menos de 10 fechas completas con recursos: '+
  JSON.stringify(skipped));
}
main().catch(e=>{console.error('BALANCE_ERROR',e);process.exitCode=1});
