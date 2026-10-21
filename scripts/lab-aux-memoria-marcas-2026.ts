/**
 * Backtest ciego reconstructivo de MARCAS ganador-as en hoja auxiliar.
 * Control experimental frente a:
 * - la geometría actual sin memoria (densidad),
 * - memoria con raíces históricas pero formas físicas aleatorizadas,
 * - Lalo original sin intervención, y reranking acotado del Top10 Lalo.
 *
 * CUIDADO: no es predicción prospectiva sellada; resultados históricos
 * sirvieron a investigadores de otras variantes. Nunca modificar MV1.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {auxiliaryBoard,collectAuxFamilies,auxFamily} from '../src/auxSantiagoNeuquen';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import type {AuxSourceObservation} from '../src/auxSantiagoSource';
import {
 extractWinningMarks,replayMemory,sortMemoryRanks
} from '../src/auxWinningMemory';
import type {AuxMemoryDay,AuxTransfer} from '../src/auxWinningMemory';

const MIN_DAY='2026-07-15',MAX_DAY='2026-10-20',FIRST='2026-08-01';
const valid=(s:string)=>/^\d{4}$/.test(s);
const range=(start:string,end:string)=>{
 const days:string[]=[];for(let d=Date.parse(start+'T12:00:00Z');
 d<=Date.parse(end+'T12:00:00Z');d+=86400000)
 days.push(new Date(d).toISOString().slice(0,10));return days;
};
const minus7=(iso:string)=>{const d=new Date(iso+'T12:00:00Z');
 d.setUTCDate(d.getUTCDate()-7);return d.toISOString().slice(0,10)};
type V='AUX_MARCAS'|'AUX_DENSIDAD'|'AUX_RANDOM'|
 'LALO'|'LALO_RERANK_MARCAS'|'LALO_RERANK_CONTROL';
const METHODS:V[]=['AUX_MARCAS','AUX_DENSIDAD','AUX_RANDOM','LALO',
 'LALO_RERANK_MARCAS','LALO_RERANK_CONTROL'];
type Cut={
 date:string;turn:Turno;heads:{jur:string;head:string;family:string}[];
 eligibleSources:string[];availableCells:number;currentFamilies:number;
 historical:{day:string;period:string;marks:number;eventsWithPath:number}[];
 memoryRoots:number;memoryFamilies:number;markedCrossings:number;
 candidates:Record<V,string[]>;
 hits:Record<V,{top3:number;top5:number;top6:number;top10:number}>;
 winnerCases:{jur:string;head:string;family:string;formedAux:boolean;
  markedRootCount:number;d1:number;d7:number;marksBefore:boolean;
  rankAux:number|null;rankLalo:number|null}[];
 controlRandomTop5:number[];
};
function topNumbers(families:string[],observed:string[]){
 const count=(n:number)=>observed.filter(x=>families.slice(0,n).includes(x)).length;
 return {top3:count(3),top5:count(5),top6:count(6),top10:count(10)};
}
function summarize(cuts:Cut[]){
 const result:Record<string,any>={days:new Set(cuts.map(x=>x.date)).size,cuts:cuts.length,
  heads:cuts.reduce((n,c)=>n+c.heads.length,0),
  auxMarkedHistoryEvents:cuts.reduce((n,c)=>n+c.memoryRoots,0),
  historicalMarksByPeriod:{d1:0,d7:0},
  rootSupportedWinningHeads:0,
  auxiliaryFormableWinningHeads:0};
 for(const cut of cuts){
  result.historicalMarksByPeriod.d1+=cut.historical.filter(x=>x.period==='D−1')
   .reduce((n,r)=>n+r.marks,0);
  result.historicalMarksByPeriod.d7+=cut.historical.filter(x=>x.period==='D−7')
   .reduce((n,r)=>n+r.marks,0);
  result.rootSupportedWinningHeads+=cut.winnerCases.filter(x=>x.markedRootCount>0).length;
  result.auxiliaryFormableWinningHeads+=cut.winnerCases.filter(x=>x.formedAux).length;
 }
 for(const m of METHODS)
  result[m]=Object.fromEntries((['top3','top5','top6','top10'] as const).map(k=>
   [k,cuts.reduce((n,c)=>n+c.hits[m][k],0)]));
 const randoms=cuts.flatMap(c=>c.controlRandomTop5);
 result.randomShapeControlSeeds=9;
 result.controlRootShapeBySeed=Array.from({length:9},(_,seed)=>
  cuts.reduce((n,c)=>n+(c.controlRandomTop5[seed]||0),0));
 return result;
}
function rerankLalo(official:string[],root:Map<string,AuxTransfer>):string[]{
 // El motor de producción queda intacto: se usa la lista ya calculada.
 // Sólo se modifica el ORDEN en una comparación experimental acotada.
 const top10=official.slice(0,10);
 const byIndex=new Map(top10.map((family,i)=>[family,i]));
 return [...top10].sort((a,b)=>{
  const aRoot=root.get(a),bRoot=root.get(b);
  const d=(bRoot?.rootIds.length||0)-(aRoot?.rootIds.length||0);
  if(d)return d;
  const e=(bRoot?.d1Events||0)-(aRoot?.d1Events||0);
  if(e)return e;
  return (byIndex.get(a)??99)-(byIndex.get(b)??99);
 });
}
async function main(){
 const dates=range(MIN_DAY,MAX_DAY);
 const base=new Map<string,CabezasDia>();
 const aux=new Map<string,AuxSourceObservation>();
 const errors:Record<string,string>={};let cursor=0;
 await Promise.all(Array.from({length:8},async()=>{
  while(cursor<dates.length){
   const date=dates[cursor++];
   try{const [x,y]=await Promise.all([
    descargarCabezas(date,true),fetchAuxiliaryHeads(date)
   ]);base.set(date,x);aux.set(date,y);}
   catch(e){errors[date]=String(e);}
  }
 }));
 const good=dates.filter(d=>base.has(d)&&aux.has(d)&&hasDrawResults(base.get(d)!)&&
  hasNocturnoBase(base.get(d)!));
 const d20=aux.get('2026-10-20')?.heads;
 if(!d20||d20.Primera.Santiago!=='6142'||d20.Matutino.Santiago!=='9634')
  throw Error('Corta: fuente de Santiago 20/oct incorrecta');
 if(Object.keys(errors).length>10)throw Error('Demasiados fallos de fuente');
 const sheets=new Map<string,DailySheet>();
 const marks=new Map<string,AuxMemoryDay>();
 for(let i=1;i<good.length;i++){
  const d=good[i],previous=good[i-1];
  sheets.set(d,buildSheet(base.get(d)!,base.get(previous)!));
 }
 for(const d of good)
  marks.set(d,extractWinningMarks(d,aux.get(d)!.heads,base.get(d)!));
 // Asegurar que las marcas antiguas son POST, nunca visibles en el mismo corte.
 const cuts:Cut[]=[];
 for(let i=2;i<good.length;i++){
  const date=good[i];if(date<FIRST)continue;
  const prev=good[i-1],week=minus7(date);
  const hist:LaloHistorical[]=[
   {date:prev,period:'D−1',sheet:sheets.get(prev)!},
   ...(sheets.has(week)?[{date:week,period:'D−7' as const,sheet:sheets.get(week)!}]:[])
  ];
  const refer=[
   {date:prev,period:'D−1' as const},
   ...(marks.has(week)&&week!==prev?[{date:week,period:'D−7' as const}]:[])
  ];
  const prevData=refer.map(x=>({day:marks.get(x.date)!,period:x.period}));
  if(prevData.some(x=>x.day.date>=date))throw Error('Fuga temporal marca auxiliar');
  const today=base.get(date)!,sheet=sheets.get(date)!;
  for(const turn of TURNOS){
   const pre=preSheetAtCut(sheet,turn,TURNOS.indexOf(turn));
   if(pre.heads[turn].length||pre.matches[turn].length)
    throw Error('Fuga destino hoja principal');
   const board=auxiliaryBoard(aux.get(date)!.heads,turn);
   if(board.cells.some(c=>!board.visibleTurns.includes(c.source)))
    throw Error('Fuga física de turno auxiliar');
   const available=new Map(collectAuxFamilies(board,3).map(x=>[x.family,x]));
   const mem=replayMemory(board,prevData);
   const memoryRanking=sortMemoryRanks(date,turn,mem,'ROOTS');
   // Controles de geometría sin memoria: universo completo de familias
   // físicamente presentes. NO restringir controles a las trasladas.
   const physical=new Map([...available].map(([family,x])=>[family,{
    family,currentPaths:x.paths,rootIds:[],d1Events:0,d7Events:0,
    fromPastMarkedPaths:0,crossTurnPaths:x.crossTurnPaths
   }]));
   const densityRank=sortMemoryRanks(date,turn,physical,'DENSITY');
   const randomRank=sortMemoryRanks(date,turn,physical,'RANDOM');
   const official=buildMotorLalo(pre,date,turn,hist).ranks.vt3.map(x=>x.family);
   const controlRanks=Array.from({length:9},(_,seed)=>{
    const roots=replayMemory(board,prevData,seed);
    return sortMemoryRanks(date,turn,roots,'ROOTS').map(x=>x.family);
   });
   const control=controlRanks[0];
   const candidates:Record<V,string[]>={
    AUX_MARCAS:memoryRanking.map(x=>x.family),
    AUX_DENSIDAD:densityRank.map(x=>x.family),
    AUX_RANDOM:randomRank.map(x=>x.family),
    LALO:official,
    LALO_RERANK_MARCAS:rerankLalo(official,mem),
    LALO_RERANK_CONTROL:rerankLalo(official,replayMemory(board,prevData,0))
   };
   const heads=JURS.flatMap(jur=>{
    const head=today[turn]?.[jur]||'';
    return valid(head)?[{jur,head,family:auxFamily(head.slice(-3))}]:[];
   });
   const observed=heads.map(x=>x.family);
   const hits=Object.fromEntries(METHODS.map(m=>
    [m,topNumbers(candidates[m],observed)])) as Cut['hits'];
   const winnerCases=heads.map(h=>{
    const root=mem.get(h.family);
    const rankAux=candidates.AUX_MARCAS.indexOf(h.family);
    const rankLalo=official.indexOf(h.family);
    return {...h,formedAux:available.has(h.family),
     markedRootCount:root?.rootIds.length||0,
     d1:root?.d1Events||0,d7:root?.d7Events||0,marksBefore:!!root,
     rankAux:rankAux<0?null:rankAux+1,rankLalo:rankLalo<0?null:rankLalo+1};
   });
   const cut:Cut={date,turn,heads,eligibleSources:board.visibleTurns,
    availableCells:board.cells.length,currentFamilies:available.size,
    historical:refer.map(x=>({day:x.date,period:x.period,
     marks:marks.get(x.date)!.marks.length,
     eventsWithPath:marks.get(x.date)!.marks.length})),
    memoryRoots:prevData.reduce((n,x)=>n+x.day.marks.length,0),
    memoryFamilies:mem.size,
    markedCrossings:memoryRanking.filter(x=>x.crossTurnPaths>0).length,
    candidates:Object.fromEntries(METHODS.map(m=>[m,candidates[m].slice(0,12)])) as Cut['candidates'],
    hits,winnerCases,
    controlRandomTop5:controlRanks.map(names=>topNumbers(names,observed).top5)};
   cuts.push(cut);
   if(date==='2026-10-20')console.log('MEMORIA_20OCT',JSON.stringify({
    turn,availableCells:cut.availableCells,historical:cut.historical,
    memoryFamilies:cut.memoryFamilies,
    top5:Object.fromEntries(METHODS.map(m=>[m,candidates[m].slice(0,5)])),
    hits:cut.hits,winnerCases:cut.winnerCases.filter(x=>x.formedAux||x.markedRootCount)
   }));
  }
 }
 const whole=summarize(cuts);
 const months=[...new Set(cuts.map(c=>c.date.slice(0,7)))].map(month=>({
  month,stats:summarize(cuts.filter(c=>c.date.startsWith(month)))
 }));
 const byTurn=TURNOS.map(turn=>({turn,stats:summarize(cuts.filter(x=>x.turn===turn))}));
 console.log('MEMORIA_RESUMEN',JSON.stringify({whole,months,byTurn,downloadErrors:errors,
  daysDownloaded:good.length,first:good[0],last:good.at(-1)}));
 const out={name:'Memoria ganadora hoja auxiliar V0',created:'2026-10-21',
  dateRange:{first:FIRST,last:MAX_DAY,downloaded:good.length},
  protocol:'Marcas POST estrictas; proyectar únicamente geometría de esas marcas al PRE futuro',
  nullControl:'Reemplazar formas ganadoras por formas válidas no ganadoras del mismo tablero pasado, con 9 semillas fijas',
  caveat:'Prueba retrospectiva y múltiples enfoques ya investigados; NO equivale a pronósticos sellados',
  errors,whole,months,byTurn,cuts};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/aux-memoria-marcas-2026.json',JSON.stringify(out,null,2));
}
void main().catch(e=>{console.error('MEMORIA_ERROR',e);process.exitCode=1});
