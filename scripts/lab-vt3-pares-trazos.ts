// LABORATORIO: parejas de familias físicamente semejantes.
// Solo cortes PRE: las cabezas posteriores se usan para evaluar, nunca para
// generar rutas ni modificar el puntaje. No se modifica ningún motor original.
import type {Turno} from '../src/domain';
import type {SourceId} from '../src/sheet';

type Stage='BASE_NOCTURNA'|'NUEVA_FAMILIA'|'REFUERZO_NUEVA_FUENTE'|'SIN_CAMBIO';
type Route={source:SourceId;shape:string;cells:string[];value:string};
export type PairCandidate={
 family:string;state:Stage;origin:SourceId;paths:number;shapes:number;
 sources:number;d1:number;d7:number;win:number;geoTop:boolean;laloTop:boolean;
 addedPaths:number;addedShapes:number;
 routes:Route[];repeatsOldShapeOnNewSource:boolean;
 addsShapeUnseenBefore:boolean;
};
export type PairCut={date:string;period:string;turn:Turno;candidates:PairCandidate[]};
const segment=(cells:string[]):string=>{
 const pts=cells.map(x=>x.split(':').map(Number));
 const parts=pts.slice(1).map((p,i)=>{
  const dy=Math.abs(p[0]-pts[i][0]),dx=Math.abs(p[1]-pts[i][1]);
  return dy===1&&dx===1?'D':dy===1&&dx===0?'V':dy===0&&dx===1?'H':'?';
 });
 return parts.sort().join('');
};
const band=(n:number)=>n===1?'1':n<=3?'2-3':n<=7?'4-7':'8+';
const simpleHash=(s:string)=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const rng=(x:number)=>(Math.imul(x,1664525)+1013904223)>>>0;
const quantile=(xs:number[],q:number)=>xs[Math.floor(q*(xs.length-1))];
function matchedDifference(cuts:PairCut[],flag:'repeatsOldShapeOnNewSource'|'hasDD',
 refineRoots:boolean,refineSpatial=false){
 const byDay=new Map<string,{obs:number;expected:number}>();
 let n=0,flagged=0,winners=0,obs=0,expected=0,matched=0,comparable=0;
 for(const cut of cuts){
  const groups=new Map<string,PairCandidate[]>();
  for(const c of cut.candidates){
   if(flag==='repeatsOldShapeOnNewSource'&&c.state!=='REFUERZO_NUEVA_FUENTE')continue;
   const fullSources=[...new Set(c.routes.map(r=>r.source))].sort().join(',');
   const centerRow=Math.floor(meanRow(c)/2);
   const key=[c.origin,c.state,c.sources,band(c.paths),
    ...(refineSpatial?[fullSources,band(c.shapes),centerRow]:[]),
    ...(flag==='repeatsOldShapeOnNewSource'?[band(c.addedPaths)]:[]),
    ...(refineRoots?[c.d1>0?1:0,c.d7>0?1:0]:[])].join('|');
   if(!groups.has(key))groups.set(key,[]);
   groups.get(key)!.push(c);
  }
  for(const group of groups.values()){
   let selected=0,hits=0,total=0;
   for(const c of group){
    if((flag==='hasDD'?c.routes.some(r=>segment(r.cells)==='DD'):
     c.repeatsOldShapeOnNewSource)){selected++;hits+=c.win}
    total+=c.win;
   }
   n+=group.length;flagged+=selected;obs+=hits;winners+=total;
   const e=selected/group.length*total;
   expected+=e;
   if(selected&&selected<group.length){comparable++;matched+=group.length}
   const day=byDay.get(cut.date)||{obs:0,expected:0};day.obs+=hits;day.expected+=e;
   byDay.set(cut.date,day);
  }
 }
 const days=[...byDay.values()];
 let seed=simpleHash('matching|'+flag+'|'+refineRoots+'|'+refineSpatial);
 const samples:number[]=[];
 for(let k=0;k<2500;k++){
  let delta=0;
  for(let i=0;i<days.length;i++){
   seed=rng(seed);
   const pick=days[seed%days.length];
   delta+=pick.obs-pick.expected;
  }
  samples.push(delta);
 }
 samples.sort((a,b)=>a-b);
 return {familyCutExposures:n,flaggedExposures:flagged,
  winnerHeadsInCohort:winners,flaggedWinnerHeads:obs,neutralExpected:expected,
  difference:obs-expected,comparableStrata:comparable,exposuresInComparableStrata:matched,
  dayBootstrap95:[quantile(samples,.025),quantile(samples,.975)]};
}
function jaccard<T>(a:Set<T>,b:Set<T>){
 const both=[...a].filter(k=>b.has(k)).length;
 return both/(a.size+b.size-both||1);
}
const formSet=(c:PairCandidate)=>new Set(c.routes.map(p=>p.source+'|'+p.shape));
const morphology=(c:PairCandidate)=>new Set(c.routes.map(p=>p.source+'|'+segment(p.cells)));
const meanRow=(c:PairCandidate)=>{
 const ps=c.routes.flatMap(r=>r.cells.map(x=>Number(x.split(':')[0])));
 return ps.reduce((n,x)=>n+x,0)/Math.max(1,ps.length);
};
function nearestPairs(cuts:PairCut[],count:number){
 const found:{date:string;turn:Turno;winner:string;control:string;
  morphologyOverlap:number;shapeOverlap:number;rowDistance:number;
  birth:string;winnerRoutes:Route[];controlRoutes:Route[];
  winnerState:string;controlState:string;
  winnerD7:number;controlD7:number}[]=[];
 let eligibleWinningExposures=0,withStrictControl=0,withExactMorphology=0;
 const overlap:number[]=[];
 for(const cut of cuts){
  const winners=cut.candidates.filter(c=>c.win>0);
  const losers=cut.candidates.filter(c=>c.win===0);
  for(const win of winners){
   eligibleWinningExposures+=win.win;
   const pool=losers.filter(c=>c.origin===win.origin&&c.sources===win.sources&&
    band(c.paths)===band(win.paths)&&c.state===win.state);
   if(!pool.length)continue;
   withStrictControl+=win.win;
   const wMorph=morphology(win),wShape=formSet(win);
   const matched=pool.map(c=>({c,
    morph:jaccard(wMorph,morphology(c)),
    shape:jaccard(wShape,formSet(c)),
    rowGap:Math.abs(meanRow(c)-meanRow(win))}))
    .sort((a,b)=>b.shape-a.shape||b.morph-a.morph||a.rowGap-b.rowGap||
     a.c.family.localeCompare(b.c.family))[0];
   overlap.push(matched.shape);
   if(matched.morph===1)withExactMorphology+=win.win;
   found.push({date:cut.date,turn:cut.turn,winner:win.family,
    control:matched.c.family,morphologyOverlap:matched.morph,
    shapeOverlap:matched.shape,rowDistance:matched.rowGap,
    birth:win.origin,winnerRoutes:win.routes,controlRoutes:matched.c.routes,
    winnerState:win.state,controlState:matched.c.state,
    winnerD7:win.d7,controlD7:matched.c.d7});
  }
 }
 found.sort((a,b)=>b.shapeOverlap-a.shapeOverlap||
  a.rowDistance-b.rowDistance||a.date.localeCompare(b.date));
 overlap.sort((a,b)=>a-b);
 return {winnersPhysicallyPresent:eligibleWinningExposures,
  winnersWithMatchedNegative:withStrictControl,
  matchedNegativeWithIdenticalMorphology:withExactMorphology,
  medianShapeOverlap:overlap.length?quantile(overlap,.5):null,
  pairsTopSimilarity:found.slice(0,count),
  pairsLowSimilarity:[...found].reverse().slice(0,8)};
}
function analyzePeriod(cuts:PairCut[]){
 const all=cuts.flatMap(c=>c.candidates);
 const reinforced=all.filter(c=>c.state==='REFUERZO_NUEVA_FUENTE');
 const repeat=reinforced.filter(c=>c.repeatsOldShapeOnNewSource);
 const novel=reinforced.filter(c=>c.addsShapeUnseenBefore);
 const dd=all.filter(c=>c.routes.some(r=>segment(r.cells)==='DD'));
 return {days:new Set(cuts.map(c=>c.date)).size,cuts:cuts.length,
  families:all.length,physicalHeadHits:all.reduce((n,c)=>n+c.win,0),
  reinforced:{exposures:reinforced.length,
   copiedEarlierShapeExposures:repeat.length,
   copiedEarlierShapeHeadHits:repeat.reduce((n,c)=>n+c.win,0),
   addedDifferentShapeExposures:novel.length,
   addedDifferentShapeHeadHits:novel.reduce((n,c)=>n+c.win,0),
   withBoth:reinforced.filter(c=>c.repeatsOldShapeOnNewSource&&c.addsShapeUnseenBefore).length},
  doubleDiagonal:{exposures:dd.length,headHits:dd.reduce((n,c)=>n+c.win,0)},
  controls:{
   repeatedSameShape:matchedDifference(cuts,'repeatsOldShapeOnNewSource',false),
   repeatedSameShapeRootsMatched:matchedDifference(cuts,'repeatsOldShapeOnNewSource',true),
   repeatedSameShapeStrictSpatial:matchedDifference(cuts,'repeatsOldShapeOnNewSource',true,true),
   doubleDiagonal:matchedDifference(cuts,'hasDD',false),
   doubleDiagonalRootsMatched:matchedDifference(cuts,'hasDD',true),
   doubleDiagonalStrictSpatial:matchedDifference(cuts,'hasDD',true,true)}
 };
}
export function analyzePairedGeometry(cuts:PairCut[]){
 const periods=[...new Set(cuts.map(c=>c.period))];
 return {methodology:{
  sameShape:'Cuando una fuente NUEVA forma un camino con la misma figura física de un camino ya disponible de la familia, sin exigir que sus tres celdas sean iguales.',
  shapeJaccard:'Similitud por conjuntos {fuente|figura} de todos los caminos. La pareja negativa es un candidato sin coincidencia del mismo PRE, origen, estado, número de fuentes y banda de recorridos; no se fabrica ninguna ruta.',
  controls:'Etiquetas evaluadas contra expectativa neutral dentro de mismo corte, origen, estado, cantidad de fuentes y banda de recorridos. Control secundario iguala si hay raíces D−1 y D−7.',
  uncertainty:'Bootstrap descriptivo por jornada; datos históricos reutilizados y diferencias exploratorias, no validez prospectiva.',
  temporal:'Las cabezas del sorteo objetivo solo se usan después de formar todos los caminos y características PRE.'},
  summary:{TOTAL:analyzePeriod(cuts),...Object.fromEntries(periods.map(p=>
   [p,analyzePeriod(cuts.filter(c=>c.period===p))]))},
  matchedPairs:nearestPairs(cuts,24)};
}
