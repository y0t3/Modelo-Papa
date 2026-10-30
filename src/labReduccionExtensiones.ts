/**
 * Reducción VISUAL de opciones VT3. Nunca elimina recorridos físicamente
 * posibles: "destacadas" es sólo primera vista, "restantes" siempre abribles.
 *
 * No se miran cabezas ganadoras para producir una selección. VT2 permanece
 * independiente, sin alterar ningún Top10 oficial.
 */
import type {ExtensionOption,ExtensionSnapshot,ExtensionStatus,MotherSnapshot}
 from './labExtensionesAux';

export type FilterStrategy='NEUTRO'|'TESTIGOS'|'RUTAS'|'DIVERSIDAD';
export type FilterBudget=2|3|5|8|10;
export type Shortlist={
 mother:string;date:string;turn:string;strategy:FilterStrategy;
 budget:number;eligible:number;hidden:number;allPhysical:ExtensionOption[];
 shown:ExtensionOption[];remaining:ExtensionOption[];
};
const physical=(x:ExtensionOption)=>x.status!=='NINGUNA';
const witnesses=(x:ExtensionOption)=>x.winnerEventsAyer+x.winnerEventsHoy;
const routes=(x:ExtensionOption)=>x.ayer+x.hoy;
const tops=(x:ExtensionOption)=>Math.min(
 x.rankVT3Ayer??99,x.rankVT3Hoy??99);
const both=(x:ExtensionOption)=>Number(x.status==='AMBAS');
const siteShape=(cells:ExtensionOption['exampleAyer'])=>{
 if(!cells)return '';
 const row=Math.min(...cells.map(c=>c.row));
 const col=Math.min(...cells.map(c=>c.col));
 const s=cells.map(c=>(c.row-row)+':'+(c.col-col)).join('>');
 const inv=[...cells].reverse().map(c=>(c.row-row)+':'+(c.col-col)).join('>');
 return [s,inv].sort()[0];
};
const shapeKeys=(option:ExtensionOption)=>[
 ...(option.exampleAyer?['AYER:'+siteShape(option.exampleAyer)]:[]),
 ...(option.exampleHoy?['HOY:'+siteShape(option.exampleHoy)]:[])
];
const compareDesc=(a:number,b:number)=>b-a;
const tie=(a:ExtensionOption,b:ExtensionOption)=>a.value.localeCompare(b.value);
const hash=(v:string,seed:number)=>{
 let state=(2166136261^seed)>>>0;
 for(const char of v){state^=char.charCodeAt(0);state=Math.imul(state,16777619)>>>0;}
 return state;
};
export function shortlistMother(date:string,turn:string,group:MotherSnapshot,
 strategy:FilterStrategy,budget:FilterBudget,seed=0):Shortlist{
 if(![2,3,5,8,10].includes(budget))throw Error('Budget no válido');
 const eligible=group.options.filter(physical);
 const sorted=[...eligible];
 if(strategy==='NEUTRO'){
  sorted.sort((a,b)=>hash(date+'|'+turn+'|'+group.family+'|'+a.value,seed)-
   hash(date+'|'+turn+'|'+group.family+'|'+b.value,seed)||tie(a,b));
 }else if(strategy==='TESTIGOS'){
  sorted.sort((a,b)=>compareDesc(witnesses(a),witnesses(b))||
   compareDesc(both(a),both(b))||
   compareDesc(Number(tops(a)<99),Number(tops(b)<99))||
   compareDesc(routes(a),routes(b))||tie(a,b));
 }else if(strategy==='RUTAS'){
  sorted.sort((a,b)=>compareDesc(routes(a),routes(b))||
   compareDesc(both(a),both(b))||
   compareDesc(witnesses(a),witnesses(b))||tie(a,b));
 }else if(strategy==='DIVERSIDAD'){
  // Greedy PRE: cubrir diferentes siluetas de recorrido y ambas
  // subfuentes. Cada opción sólo aporta el ejemplo real de cada tablero.
  // Un mismo dibujo numérico no se cuenta como nueva forma.
  const usedShapes=new Set<string>();
  const chosen=new Set<string>();
  while(sorted.length&&chosen.size<Math.min(budget,eligible.length)){
   const ranked=sorted.filter(x=>!chosen.has(x.value)).sort((a,b)=>{
    const novel=(x:ExtensionOption)=>shapeKeys(x).filter(s=>!usedShapes.has(s)).length;
    return compareDesc(novel(a),novel(b))||
     compareDesc(witnesses(a),witnesses(b))||
     compareDesc(Number(tops(a)<99),Number(tops(b)<99))||
     compareDesc(both(a),both(b))||
     compareDesc(routes(a),routes(b))||tie(a,b);
   });
   const next=ranked[0];
   chosen.add(next.value);
   for(const key of shapeKeys(next))usedShapes.add(key);
  }
  sorted.sort((a,b)=>Number(chosen.has(b.value))-Number(chosen.has(a.value))||
   compareDesc(witnesses(a),witnesses(b))||tie(a,b));
 }
 const shown=sorted.slice(0,budget);
 return {mother:group.family,date,turn,strategy,budget,
  eligible:eligible.length,hidden:eligible.length-shown.length,
  allPhysical:eligible,shown,remaining:sorted.slice(budget)};
}
export const shortlistSnapshot=(snapshot:ExtensionSnapshot,
 strategy:FilterStrategy,budget:FilterBudget,seed=0)=>
 snapshot.mothers.map(g=>shortlistMother(snapshot.date,snapshot.turn,g,
  strategy,budget,seed));
export const STRATEGIES:FilterStrategy[]=['NEUTRO','TESTIGOS','RUTAS','DIVERSIDAD'];
export const BUDGETS:FilterBudget[]=[2,3,5,8,10];

export type BudgetResult={
 mothers:number;headsWithMother:number;headsPhysicallyCovered:number;
 observedHeads:number;availableOptions:number;shownOptions:number;
 wonFromShown:number;uniqueHeadHits:number;
 retainedAmongPhysical:number|null;
 coverageVsAllMothers:number|null;
 keepRatio:number|null;
 winningExamples:{date:string;turn:string;mother:string;head:string;
  winningValue:string;shown:boolean;rank:number|null;status:ExtensionStatus}[];
};
/** heads belong to a particular mother by their exact suffix VT2.
 * No head is double counted when more than one +11 motor selected
 * the same mother. Outcome is used ONLY here, after shortlist. */
export function evaluateShortlistsPOST(
 rows:Shortlist[],heads:{jur:string;head:string}[]):BudgetResult{
 const answer:BudgetResult={mothers:rows.length,
  headsWithMother:0,headsPhysicallyCovered:0,observedHeads:heads.filter(h=>/^\d{4,5}$/.test(h.head)).length,
  availableOptions:0,shownOptions:0,wonFromShown:0,uniqueHeadHits:0,
  retainedAmongPhysical:null,coverageVsAllMothers:null,keepRatio:null,
  winningExamples:[]};
 const byMother=new Map(rows.map(x=>[x.mother,x]));
 for(const row of rows){answer.availableOptions+=row.eligible;
  answer.shownOptions+=row.shown.length;}
 const motherId=(two:string)=>[two,[...two].reverse().join('')].sort().join('/');
 for(const h of heads)if(/^\d{4,5}$/.test(h.head)){
  const m=motherId(h.head.slice(-2));
  const list=byMother.get(m);if(!list)continue;
  answer.headsWithMother++;
  const vt3=h.head.slice(-3);
  const present=list.allPhysical.find(x=>x.value===vt3);
  if(!present)continue;
  answer.headsPhysicallyCovered++;
  const chosenIndex=list.shown.findIndex(x=>x.value===vt3);
  if(chosenIndex>=0)answer.wonFromShown++;
  answer.winningExamples.push({date:list.date,turn:list.turn,
   mother:m,head:h.jur+' '+h.head,winningValue:vt3,
   shown:chosenIndex>=0,rank:chosenIndex>=0?chosenIndex+1:null,
   status:present.status});
 }
 answer.uniqueHeadHits=answer.wonFromShown;
 answer.retainedAmongPhysical=answer.headsPhysicallyCovered?
  answer.wonFromShown/answer.headsPhysicallyCovered:null;
 answer.coverageVsAllMothers=answer.headsWithMother?
  answer.wonFromShown/answer.headsWithMother:null;
 answer.keepRatio=answer.availableOptions?
  answer.shownOptions/answer.availableOptions:null;
 return answer;
}

/**
 * Compresión VISUAL sin pérdida: la madre 13/31 se muestra en como mucho
 * DOS líneas, "x13" y "x31", con todos los dígitos iniciales disponibles.
 * No se pierde ninguna opción ni se pretende escoger el prefijo ganador.
 * Cada opción conserva TODOS sus caminos en la ficha expandible.
 */
export type OrientationBand={
 mother:string;orientedSuffix:string;
 digits:string[];values:string[];
 count:number;withTwoBoards:number;
 withPreviousWinner:number;
 byStatus:Record<ExtensionStatus,string[]>;
 options:ExtensionOption[];
};
export function groupByOrientedMother(group:MotherSnapshot):OrientationBand[]{
 const groups=new Map<string,ExtensionOption[]>();
 for(const x of group.options.filter(physical)){
  const suffix=x.value.slice(1);
  const arr=groups.get(suffix)||[];
  arr.push(x);
  groups.set(suffix,arr);
 }
 return [...groups].sort(([a],[b])=>a.localeCompare(b)).map(([suffix,items])=>{
  const options=[...items].sort((a,b)=>a.value.localeCompare(b.value));
  const byStatus={AMBAS:[],SOLO_AYER:[],SOLO_HOY:[],NINGUNA:[]}
   as Record<ExtensionStatus,string[]>;
  for(const item of options)byStatus[item.status].push(item.value[0]);
  return {mother:group.family,orientedSuffix:suffix,
   digits:options.map(x=>x.value[0]),
   values:options.map(x=>x.value),count:options.length,
   withTwoBoards:options.filter(x=>x.status==='AMBAS').length,
   withPreviousWinner:options.filter(x=>witnesses(x)>0).length,
   byStatus,options};
 });
}
export function compactionStats(snapshot:ExtensionSnapshot){
 const all=snapshot.mothers.flatMap(groupByOrientedMother);
 const eligible=all.reduce((n,x)=>n+x.count,0);
 const dist=all.reduce((m,x)=>{
  m[x.count]=(m[x.count]||0)+1;
  return m;
 },{} as Record<number,number>);
 return {mothers:snapshot.mothers.length,
  eligibleOptions:eligible,visualBands:all.length,
  optionsPerBand:all.length?Number((eligible/all.length).toFixed(3)):0,
  lineReduction:eligible?Number(((1-all.length/eligible)*100).toFixed(1)):0,
  noCandidateLoss:true,
  withBoth:all.reduce((n,x)=>n+x.withTwoBoards,0),
  bandsWithMultipleOptions:all.filter(x=>x.count>=2).length,
  bandsBySize:dist
 };
}
