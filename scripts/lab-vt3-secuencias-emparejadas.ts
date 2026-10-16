// Estudio de secuencias físicas VT3, con controles de exposición comparables.
// Importante: DESCRIPTIVO, sin seleccionar reglas de predicción a posteriori.
// No se altera ni la APK ni sus motores.
import {TURNOS} from '../src/domain';
import type {Turno} from '../src/domain';
import type {SourceId} from '../src/sheet';

type Movement='BASE_NOCTURNA'|'NUEVA_FAMILIA'|'REFUERZO_NUEVA_FUENTE'|'SIN_CAMBIO';
export type InputRow={family:string;status:Movement;firstSource:SourceId;
 routeCount:number;shapeCount:number;d1Roots:number;d7Roots:number;winnerHeads:number};
export type InputCut={date:string;turn:Turno;period:string;rows:InputRow[]};
type Exposure={date:string;period:string;turn:Turno;family:string;age:number;
 origin:SourceId;paths:number;shapeCount:number;d7:boolean;d1:boolean;
 win:number;history:string;hadRef:boolean;nowRef:boolean;
 afterPersistenceRef:boolean;previousRefThenPersistent:boolean};
type Flag='hadRef'|'nowRef'|'afterPersistenceRef'|'previousRefThenPersistent';
const FLAGS:Flag[]=['hadRef','nowRef','afterPersistenceRef','previousRefThenPersistent'];
const SOURCES:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const code=(status:Movement)=>status==='REFUERZO_NUEVA_FUENTE'?'R':
 status==='SIN_CAMBIO'?'P':'B';
const band=(n:number)=>n===1?'1':n<=3?'2-3':n<=7?'4-7':'8+';
function exposuresFromCuts(cuts:InputCut[]):Exposure[]{
 const sorted=[...cuts].sort((a,b)=>a.date.localeCompare(b.date)||
  TURNOS.indexOf(a.turn)-TURNOS.indexOf(b.turn));
 const states=new Map<string,string>();
 const all:Exposure[]=[];
 for(const cut of sorted){
  for(const row of cut.rows){
   const id=cut.date+'|'+row.family;
   const prior=states.get(id)||'';
   const age=TURNOS.indexOf(cut.turn)-SOURCES.indexOf(row.firstSource);
   if(age<0||age>4)throw Error('Edad imposible '+id);
   const symbol=code(row.status),history=prior+symbol;
   if((age===0)!==(symbol==='B'))
    throw Error('El nacimiento no coincide con la edad de origen '+id+' '+history);
   if(prior.length!==age||!history.startsWith('B'))
    throw Error('Faltan estados previos de la misma familia '+id+' '+history);
   const oldRef=prior.includes('R');
   all.push({date:cut.date,period:cut.period,turn:cut.turn,
    family:row.family,age,origin:row.firstSource,
    paths:row.routeCount,shapeCount:row.shapeCount,
    d1:row.d1Roots>0,d7:row.d7Roots>0,
    win:row.winnerHeads,history,hadRef:oldRef,
    nowRef:symbol==='R',
    afterPersistenceRef:symbol==='R'&&prior.includes('P'),
    previousRefThenPersistent:symbol==='P'&&oldRef});
   states.set(id,history);
  }
 }
 return all;
}
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++){
 h^=s.charCodeAt(i);h=Math.imul(h,16777619);
}return h>>>0;};
const next=(seed:number)=>(Math.imul(seed,1664525)+1013904223)>>>0;
const quantile=(arr:number[],p:number)=>arr[Math.floor((arr.length-1)*p)];
function compareMatched(rows:Exposure[],flag:Flag,extraMatchRoots:boolean){
 // Búsqueda SOLO en cohortes en las que el patrón tiene sentido: familias
 // nacidas intradía y con al menos dos oportunidades de evolucionar.
 const eligible=rows.filter(r=>r.origin!=='prevNocturno'&&r.age>=2);
 const groups=new Map<string,Exposure[]>();
 for(const row of eligible){
  const key=[row.date,row.turn,row.origin,band(row.paths),
   ...(extraMatchRoots?[row.d7?'D7':'sinD7',row.d1?'D1':'sinD1']:[])].join('|');
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key)!.push(row);
 }
 let obs=0,expectation=0,flagged=0,winning=0,groupsComparable=0;
 const dayStat=new Map<string,{obs:number;expected:number}>();
 for(const group of groups.values()){
  const marked=group.filter(x=>x[flag]);
  const selected=marked.length,total=group.reduce((n,x)=>n+x.win,0);
  const hits=marked.reduce((n,x)=>n+x.win,0);
  obs+=hits;flagged+=selected;winning+=total;
  const expected=selected/group.length*total;
  expectation+=expected;
  const date=group[0].date;
  const slot=dayStat.get(date)||{obs:0,expected:0};
  slot.obs+=hits;slot.expected+=expected;dayStat.set(date,slot);
  if(selected>0&&selected<group.length)groupsComparable++;
 }
 const dayEntries=[...dayStat.values()];
 let seed=next(hash('movimiento|'+flag+'|'+extraMatchRoots));
 const deltas:number[]=[];
 for(let i=0;i<4000;i++){
  let difference=0;
  for(let day=0;day<dayEntries.length;day++){
   seed=next(seed);
   const pick=dayEntries[seed%dayEntries.length];
   difference+=pick.obs-pick.expected;
  }
  deltas.push(difference);
 }
 deltas.sort((a,b)=>a-b);
 return {eligibleFamilyCutExposures:eligible.length,
  flaggedFamilyCutExposures:flagged,
  winningHeadsInEligible:winning,
  winningHeadsInFlagged:obs,
  neutralExpectation:expectation,difference:obs-expectation,
  comparableStrata:groupsComparable,
  dayClusterBootstrap95:[quantile(deltas,.025),quantile(deltas,.975)],
  note:'Intervalo descriptivo, re-muestrea jornadas completas; decisiones exploratorias y observaciones repetidas.'};
}
function summarizeHistory(rows:Exposure[]){
 const histories=['BPP','BPR','BRP','BRR','BPPP','BPRP','BPPR','BRPP','BRPR','BPRR',
  'BPPPP','BPPPR','BPPRP','BPRPP','BRPPP'];
 const table=Object.fromEntries(histories.map(history=>{
  const e=rows.filter(r=>r.origin!=='prevNocturno'&&r.history===history);
  return [history,{familiesPerCut:e.length,winningHeads:e.reduce((n,r)=>n+r.win,0),
   periods:Object.fromEntries([...new Set(rows.map(r=>r.period))].map(p=>{
    const r=e.filter(x=>x.period===p);
    return [p,{familiesPerCut:r.length,winningHeads:r.reduce((n,a)=>n+a.win,0)}];
   }))}];
 }));
 const sections=Object.fromEntries(['TOTAL',...new Set(rows.map(r=>r.period))].map(name=>{
  const slice=name==='TOTAL'?rows:rows.filter(r=>r.period===name);
  const eligible=slice.filter(r=>r.origin!=='prevNocturno'&&r.age>=2);
  const comparable=Object.fromEntries(FLAGS.map(flag=>[flag,{
   matchedByCutOriginAgePaths:compareMatched(slice,flag,false),
   additionallyMatchedByD1D7:compareMatched(slice,flag,true)}]));
  return [name,{days:new Set(slice.map(r=>r.date)).size,
   familyCutExposures:slice.length,
   intradayAgedAtLeastTwo:eligible.length,
   winningHeadsInAgedIntraday:eligible.reduce((n,r)=>n+r.win,0),
   patterns:comparable}];
 }));
 const showcase=rows.filter(r=>r.origin!=='prevNocturno'&&r.age>=2&&r.win>0)
  .map(r=>({date:r.date,turn:r.turn,family:r.family,history:r.history,
   paths:r.paths,winningHeads:r.win,d7:r.d7,d1:r.d1}))
  .slice(0,40);
 return {protocol:{
  codes:'B=primera aparición de familia, P=presencia sin otra fuente, R=nueva fuente física; no se inventan trazos entre fuentes.',
  exposure:'Una familia por corte PRE; una cabeza ganadora es un resultado, no una tasa independiente de éxito.',
  design:'Comparar solo familias nacidas intradía con edad >= 2, mismo PRE, columna origen y banda de recorridos físicos.',
  neutral:'Esperanza condicionada a la proporción de etiquetas dentro de cada estrato, sin usar resultados para ordenar.',
  roots:'Control alternativo añade existencia de una huella D−1 y D−7 del mismo testigo geométrico; raíces de forma y fuente, no de identidad numérica.',
  chronology:'Las fuentes anteriores permanecen fijas; se evalúa después del PRE contra cabeza del turno, nunca contra cabeza futura.',
  uncertainty:'Bootstrap descriptivo por jornada (4000 repeticiones), sin reclamo de validación prospectiva.'
 },sections,histories:table,showcase};
}
export function examineVt3Sequences(cuts:InputCut[]){
 const all=exposuresFromCuts(cuts);
 return summarizeHistory(all);
}
