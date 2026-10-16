// LABORATORIO INDEPENDIENTE: ¿aporta información un segundo origen físico
// de la MISMA familia que ya existía en Previa?
// No cambia src/motorLalo ni src/vt3Shadow, ni usa cabezas futuras para ordenar.
import {TURNOS} from '../src/domain';
import type {Turno} from '../src/domain';
import type {CutProfile} from './lab-geo-matched-control';

type Method='ORIGINAL'|'FUENTES_PRIMERO_TOP10'|'BONO_UNA_POSICION_TOP10'|'PREVIA_FIJA';
type Exposure={
 date:string;turn:Turno;family:string;
 priorPaths:number;priorRank:number|null;rankBand:'1-3'|'4-10'|'11+';
 pathBand:'1'|'2-3'|'4+';
 sourceCount:number;reinforced:boolean;
 winningFamily:boolean;top3Original:boolean
};
type ScoreRow={date:string;turn:Turno;method:Method;top3:string[];hitHeads:number;hitFamilies:number};
const rankBand=(rank:number|null):Exposure['rankBand']=>
 rank!==null&&rank<=3?'1-3':rank!==null&&rank<=10?'4-10':'11+';
const pathBand=(n:number):Exposure['pathBand']=>n===1?'1':n<=3?'2-3':'4+';
const sourceMap=(p:CutProfile)=>{
 const map=new Map<string,Set<string>>();
 for(const r of p.routes){
  if(!map.has(r.family))map.set(r.family,new Set());
  map.get(r.family)!.add(r.source);
 }
 return map;
};
const tally=(rows:Exposure[])=>({
 exposures:rows.length,
 familyHits:rows.filter(r=>r.winningFamily).length,
 headEquivalent:'Se cuenta una vez por familia ganadora y corte, no por cada ruta',
 cutsWithWinner:new Set(rows.filter(r=>r.winningFamily).map(r=>r.date+'|'+r.turn)).size,
 daysWithWinner:new Set(rows.filter(r=>r.winningFamily).map(r=>r.date)).size,
});
const byTurn=(rows:Exposure[])=>Object.fromEntries(TURNOS.slice(1).map(t=>
 [t,tally(rows.filter(r=>r.turn===t))]));
const metric=(rows:ScoreRow[],method:Method)=>({
 hits:rows.filter(r=>r.method===method).reduce((n,r)=>n+r.hitHeads,0),
 distinctFamilyHits:rows.filter(r=>r.method===method).reduce((n,r)=>n+r.hitFamilies,0),
 cutsWithHead:rows.filter(r=>r.method===method&&r.hitHeads>0).length,
});
const hash=(text:string)=>{let h=2166136261;for(let i=0;i<text.length;i++){
 h^=text.charCodeAt(i);h=Math.imul(h,16777619);
}return h>>>0;};
const seedStep=(x:number)=>(Math.imul(x,1664525)+1013904223)>>>0;
const percentile=(a:number[],p:number)=>a[Math.floor((a.length-1)*p)];
function permutedReinforcement(rows:Exposure[],replicas=3000){
 // MISMO CORTE, MISMA banda de ranking del PRE y MISMA densidad física inicial.
 // Preserva cuántas familias reciben nueva columna dentro del estrato;
 // permuta la etiqueta de "reforzada", no resultados ni caminos.
 const groups=new Map<string,Exposure[]>();
 for(const e of rows){
  const key=[e.date,e.turn,e.rankBand,e.pathBand].join('|');
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key)!.push(e);
 }
 const strata=[...groups.values()].map(g=>({
  size:g.length,reinforced:g.filter(x=>x.reinforced).length,
  wins:g.map(x=>Number(x.winningFamily))
 })).filter(g=>g.reinforced>0);
 const observed=rows.filter(x=>x.reinforced&&x.winningFamily).length;
 const counts:number[]=[];
 for(let i=0;i<replicas;i++){
  let random=seedStep(i+hash('refuerzo-fuente-2026')),hits=0;
  for(const s of strata){
   // Fisher-Yates parcial sin reemplazo dentro del mismo estrato.
   const order=Array.from({length:s.size},(_,k)=>k);
   for(let k=0;k<s.reinforced;k++){
    random=seedStep(random);
    const j=k+(random%(s.size-k));
    [order[k],order[j]]=[order[j],order[k]];
    hits+=s.wins[order[k]];
   }
  }
  counts.push(hits);
 }
 counts.sort((a,b)=>a-b);
 return {observed,mean:counts.reduce((a,b)=>a+b,0)/replicas,
  central95:[percentile(counts,.025),percentile(counts,.975)],
  fractionAtLeastObserved:counts.filter(c=>c>=observed).length/replicas,
  replicas,strataWithReinforcement:strata.length,
  note:'Control descriptivo condicionado al corte, densidad inicial y rango de Previa; no es validación prospectiva ni prueba causal.'};
}
function selection(cut:CutProfile,sourceCounts:Map<string,Set<string>>):
 Record<Exclude<Method,'PREVIA_FIJA'>,string[]>{
 const full=cut.top10.map((x,i)=>({family:x.family,rank:i+1,
  sources:sourceCounts.get(x.family)?.size||1}));
 if(full.length!==10)throw Error('Faltan diez familias geométricas en '+cut.date+' '+cut.turn);
 const original=full.slice(0,3).map(x=>x.family);
 const sourceFirst=[...full].sort((a,b)=>b.sources-a.sources||a.rank-b.rank)
  .slice(0,3).map(x=>x.family);
 // Bonificación limitada a UN escalón y medio si suma al menos una fuente.
 // Solo puede desplazar una candidata vecina; nunca habilita familias fuera de Top10.
 const bonus=[...full].sort((a,b)=>
  (a.rank-(a.sources>1?1.5:0))-(b.rank-(b.sources>1?1.5:0))||
  a.rank-b.rank).slice(0,3).map(x=>x.family);
 for(const arr of [original,sourceFirst,bonus])if(new Set(arr).size!==3)
  throw Error('Se repite una familia en '+cut.date+' '+cut.turn);
 return {ORIGINAL:original,FUENTES_PRIMERO_TOP10:sourceFirst,
  BONO_UNA_POSICION_TOP10:bonus};
}
export function studyIndependentSources(profiles:CutProfile[]){
 const byDate=new Map<string,CutProfile[]>();
 for(const p of profiles){
  if(!byDate.has(p.date))byDate.set(p.date,[]);
  byDate.get(p.date)!.push(p);
 }
 const exposures:Exposure[]=[],scores:ScoreRow[]=[];
 const transitions:any[]=[],newSourcesTop3:any[]=[];
 for(const [date,unsorted] of byDate){
  const day=[...unsorted].sort((a,b)=>TURNOS.indexOf(a.turn)-TURNOS.indexOf(b.turn));
  const pre=day.find(d=>d.turn==='Previa');
  if(!pre)throw Error('Sin Previa '+date);
  const initialPaths=new Map<string,number>();
  for(const r of pre.routes)initialPaths.set(r.family,(initialPaths.get(r.family)||0)+1);
  const priorRanks=new Map(pre.top10.map((t,i)=>[t.family,i+1]));
  const preSelected=pre.top3.map(t=>t.family);
  for(const cut of day){
   const currentSources=sourceMap(cut);
   const selected=selection(cut,currentSources);
   const methods:Record<Method,string[]>={...selected,PREVIA_FIJA:preSelected};
   const heads=cut.headFamilies;
   for(const method of Object.keys(methods) as Method[]){
    const chosen=methods[method];
    scores.push({date,turn:cut.turn,method,top3:chosen,
     hitHeads:heads.filter(x=>chosen.includes(x)).length,
     hitFamilies:new Set(heads.filter(x=>chosen.includes(x))).size});
   }
   if(cut.turn==='Previa')continue;
   const prior=cut.turn==='Primera'?pre:day[TURNOS.indexOf(cut.turn)-1];
   if(!prior||TURNOS.indexOf(prior.turn)!==TURNOS.indexOf(cut.turn)-1)
    throw Error('Falta un PRE cronológico anterior '+date+' '+cut.turn);
   const formerSources=sourceMap(prior);
   const countsPerTurn={newIndependentFamilySupport:0,newTop3IndependentSupport:0,
    newTop3AdditionalPathsSameSource:0,
    winningFromExtraSource:0};
   for(const [family,numPaths] of initialPaths){
    const current=currentSources.get(family);
    if(!current)throw Error('Familia de Previa desaparecida '+date+' '+family);
    const e:Exposure={date,turn:cut.turn,family,priorPaths:numPaths,
     priorRank:priorRanks.get(family)||null,rankBand:rankBand(priorRanks.get(family)||null),
     pathBand:pathBand(numPaths),sourceCount:current.size,
     reinforced:current.size>1,
     winningFamily:heads.includes(family),
     top3Original:selected.ORIGINAL.includes(family)};
    exposures.push(e);
   }
   const priorByFamilyPaths=new Map<string,number>();
   const currentByFamilyPaths=new Map<string,number>();
   for(const r of prior.routes)priorByFamilyPaths.set(r.family,(priorByFamilyPaths.get(r.family)||0)+1);
   for(const r of cut.routes)currentByFamilyPaths.set(r.family,(currentByFamilyPaths.get(r.family)||0)+1);
   for(const [family,nowSources] of currentSources){
    const oldSources=formerSources.get(family)||new Set<string>();
    const added=[...nowSources].filter(x=>!oldSources.has(x));
    if(oldSources.size&&added.length){
     countsPerTurn.newIndependentFamilySupport++;
     if(selected.ORIGINAL.includes(family)){
      countsPerTurn.newTop3IndependentSupport++;
      if(heads.includes(family))countsPerTurn.winningFromExtraSource++;
     }
    }
    if(!added.length&&oldSources.size&&selected.ORIGINAL.includes(family)&&
      (currentByFamilyPaths.get(family)||0)>(priorByFamilyPaths.get(family)||0))
      countsPerTurn.newTop3AdditionalPathsSameSource++;
   }
   newSourcesTop3.push({date,turn:cut.turn,...countsPerTurn});
   const selectedOriginal=selected.ORIGINAL;
   const count=(name:Method)=>heads.filter(f=>methods[name].includes(f)).length;
   transitions.push({date,turn:cut.turn,topOriginal:selectedOriginal,
    topSourceFirst:methods.FUENTES_PRIMERO_TOP10,
    topOnePosition:methods.BONO_UNA_POSICION_TOP10,
    topFrozen:preSelected,
    winningHeads:heads,
    sourceFirstDiff:count('FUENTES_PRIMERO_TOP10')-count('ORIGINAL'),
    onePositionDiff:count('BONO_UNA_POSICION_TOP10')-count('ORIGINAL'),
    sourceFirstChanges:methods.FUENTES_PRIMERO_TOP10.some(f=>!selectedOriginal.includes(f)),
    onePositionChanges:methods.BONO_UNA_POSICION_TOP10.some(f=>!selectedOriginal.includes(f)),
    supportAdded:countsPerTurn.newIndependentFamilySupport});
  }
 }
 const exposed=exposures.filter(e=>e.reinforced);
 const unexposed=exposures.filter(e=>!e.reinforced);
 const methods:Method[]=['ORIGINAL','PREVIA_FIJA','FUENTES_PRIMERO_TOP10','BONO_UNA_POSICION_TOP10'];
 const byMethod=Object.fromEntries(methods.map(m=>[m,metric(scores,m)]));
 const byPeriod=Object.fromEntries(['EXPLORADO','POSTERIOR'].map(period=>{
  const test=(date:string)=>period==='EXPLORADO'?date<='2026-08-31':date>'2026-08-31';
  return [period,Object.fromEntries(methods.map(m=>[m,metric(scores.filter(r=>test(r.date)),m)]))];
 }));
 const conditional=Object.fromEntries(TURNOS.slice(1).map(t=>[
  t,{reinforced:tally(exposed.filter(e=>e.turn===t)),
   noExtra:tally(unexposed.filter(e=>e.turn===t))}
 ]));
 const sourceGroupRank=Object.fromEntries(['1-3','4-10','11+'].map(b=>[
  b,{reinforced:tally(exposed.filter(e=>e.rankBand===b)),
    noExtra:tally(unexposed.filter(e=>e.rankBand===b))}
 ]));
 const summary={days:byDate.size,cuts:profiles.length,comparedPostPrevia:profiles.length-byDate.size,
  familyExposures:exposures.length,
  reinforced:tally(exposed),singleSource:tally(unexposed),
  byTurn:conditional,byPreviaRank:sourceGroupRank,
  control:permutedReinforcement(exposures),
  selectedTop3FamilyExposures:{reinforced:tally(exposed.filter(e=>e.top3Original)),
   singleSource:tally(unexposed.filter(e=>e.top3Original))},
  methods:byMethod,byPeriod,
  effectOnUpdates:{
   nextTurnSupportEvents:newSourcesTop3.reduce((n,r)=>n+r.newIndependentFamilySupport,0),
   top3NewIndependentSupport:newSourcesTop3.reduce((n,r)=>n+r.newTop3IndependentSupport,0),
   top3ExtraRoutesWithoutNewSource:newSourcesTop3.reduce((n,r)=>n+r.newTop3AdditionalPathsSameSource,0),
   newSourceReinforcedTop3Wins:newSourcesTop3.reduce((n,r)=>n+r.winningFromExtraSource,0),
   sourceFirstChangedCuts:transitions.filter(r=>r.sourceFirstChanges).length,
   onePositionChangedCuts:transitions.filter(r=>r.onePositionChanges).length,
   sourceFirstImproved:transitions.filter(r=>r.sourceFirstDiff>0),
   sourceFirstWorsened:transitions.filter(r=>r.sourceFirstDiff<0),
   onePositionImproved:transitions.filter(r=>r.onePositionDiff>0),
   onePositionWorsened:transitions.filter(r=>r.onePositionDiff<0)
  }};
 if(summary.reinforced.exposures+summary.singleSource.exposures!==summary.familyExposures)
  throw Error('Denominadores inconsistentes');
 const full={protocol:{time:'Solo datos previos al objetivo, reconstruido después',
  scope:'Familias VT3 presentes desde Previa. Refuerzo = distintas columnas de origen.',
  caveat:'Selección de criterios posterior a observar 15/10; no es validación prospectiva.',
  unit:'Exposición de familia y turno; familias y turnos repetidos NO independientes.'},
  summary,exposures,selection:scores,transitions,newSourcesTop3};
 return full;
}
