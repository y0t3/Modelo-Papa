/**
 * Auditoría geométrica del puesto #17 VT3 AUX AYER del 02/11/2026.
 * Compara la mecánica EXACTA de orden original: raíces distintas,
 * D−1 / D−7, cruce entre turnos, bloques físicos y desempate alfabético.
 * Testigos trazados: eventos POST ANTERIORES al objetivo, y proyecciones
 * sobre el tablero 31/10; nunca usa la cabeza objetivo para el ranking.
 */
import {descargarCabezas} from '../src/cabezas';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {shiftDay} from '../src/dates';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {extractAuxHistoryMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import {auxiliaryBoard,auxCanonicalPath,findAuxFamily} from '../src/auxSantiagoNeuquen';
import type {AuxiliaryHistorical,AuxWinningEvent} from '../src/motorLaloIntegral';
import type {AuxCell,AuxPath} from '../src/auxSantiagoNeuquen';
import {projectAuxShape} from '../src/auxWinningMemory';

const target='2026-11-02',baseDate=auxiliarySourceDate(target),weekDate=shiftDay(target,-7);
const drawCache=new Map<string,ReturnType<typeof descargarCabezas>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
const draw=(d:string)=>{if(!drawCache.has(d))drawCache.set(d,descargarCabezas(d,true));return drawCache.get(d)!;};
const aux=(d:string)=>{if(!auxCache.has(d))auxCache.set(d,fetchAuxiliaryHeads(d));return auxCache.get(d)!;};
const coords=(p:AuxPath)=>p.map(x=>x.row+':'+x.col).sort().join(',');
const path=(p:AuxPath)=>p.map(c=>({row:c.row,col:c.col,digit:c.digit,source:c.source}));
const reverse=(s:string)=>s.split('').reverse().join('');
const family=(s:string)=>[s,reverse(s)].sort().join('/');
const crossing=(p:AuxPath)=>new Set(p.map(x=>x.source)).size>1;

async function main(){
 const [history,weekHeads,boardHeads]=await Promise.all([
  loadPreviousDraws(target,6,draw),draw(weekDate),aux(baseDate)
 ]);
 const refInfo=[{date:history.at(-1)!.date,heads:history.at(-1)!.heads,period:'D−1' as const},
  ...(hasDrawResults(weekHeads)?[{date:weekDate,heads:weekHeads,period:'D−7' as const}]:[])];
 const refData=await Promise.all(refInfo.map(async h=>({
  ...h,sourceDate:auxiliarySourceDate(h.date),
  raw:(await aux(auxiliarySourceDate(h.date))).heads
 })));
 const refs:AuxiliaryHistorical[]=refData.map(x=>({date:x.date,period:x.period,
  aux:extractAuxHistoryMode(x.date,x.raw,x.heads,'anterior')}));
 const board=auxiliaryBoard(boardHeads.heads,'Previa');
 const ranked=buildAuxIndependent(target,'Previa',boardHeads.heads,refs)[3];
 const byFamily=new Map<string,{
  roots:Set<string>;d1:Set<string>;d7:Set<string>;
  blocks:Set<string>;paths:Map<string,AuxPath>;
  rootEvents:Map<string,{date:string;period:string;turn:string;jur:string;head:string;
    sourceDate:string;priorValues:string[];priorRoutes:number;
    translations:number; currentPaths:{path:ReturnType<typeof path>;value:string}[]}>
 }>();
 for(const ref of refData){
  const marks=extractAuxHistoryMode(ref.date,ref.raw,ref.heads,'anterior').events[3];
  for(const mark of marks){
   let projectedTotal=0;
   for(const old of mark.paths){
    for(const now of projectAuxShape(board,old)){
     projectedTotal++;
     const vt=now.map(x=>x.digit).join(''),f=family(vt);
     const g=byFamily.get(f)||{
      roots:new Set<string>(),d1:new Set<string>(),d7:new Set<string>(),
      blocks:new Set<string>(),paths:new Map<string,AuxPath>(),
      rootEvents:new Map()
     };
     g.roots.add(mark.id);
     (ref.period==='D−1'?g.d1:g.d7).add(mark.id);
     g.blocks.add(coords(now));g.paths.set(auxCanonicalPath(now),now);
     let origin=g.rootEvents.get(mark.id);
     if(!origin){
      origin={date:ref.date,period:ref.period,turn:mark.turn,jur:mark.jur,
       head:mark.head,sourceDate:ref.sourceDate,
       priorValues:mark.paths.map(p=>p.map(c=>c.digit).join('')),
       priorRoutes:mark.paths.length,translations:0,currentPaths:[]};
     }
     origin.translations++;
     origin.currentPaths.push({path:path(now),value:vt});
     g.rootEvents.set(mark.id,origin);
     byFamily.set(f,g);
    }
   }
  }
 }
 const ranking=ranked.map(r=>{
  const x=byFamily.get(r.family)!;
  const matches=Number(x.roots.size===r.roots&&x.d1.size===r.d1&&
   x.d7.size===r.d7&&
   x.blocks.size===new Set(r.paths.map(coords)).size);
  if(!matches)throw Error('No coincide auditoría con ranking real: '+r.family);
  return {rank:r.rank,family:r.family,roots:r.roots,
   d1:r.d1,d7:r.d7,crossing:r.crossing,blocks:x.blocks.size,
   paths:r.paths.length,sourceTurns:r.sources};
 });
 const winner='155/551',idx=ranking.findIndex(x=>x.family===winner);
 const details=byFamily.get(winner);
 if(!details||idx<0)throw Error('Familia 155 ausente');
 const sample=findAuxFamily(board,'155');
 const tie=ranking.filter(x=>x.roots===ranking[idx].roots&&
  x.d1===ranking[idx].d1&&x.d7===ranking[idx].d7);
 const sameCross=tie.filter(x=>x.crossing===ranking[idx].crossing);
 const exact=tie.filter(x=>x.crossing===ranking[idx].crossing&&
  x.blocks===ranking[idx].blocks);
 const output={target,turn:'Previa',sourceDate:baseDate,
  refInfo:refData.map(x=>({date:x.date,sourceDate:x.sourceDate,period:x.period})),
  sourceBoard:boardHeads.heads,
  totalRanked:ranked.length,
  winner:ranking[idx],physicalReadings:sample.paths.map(x=>({
   value:x.map(c=>c.digit).join(''),cells:path(x),crossTurn:crossing(x)
  })),
  relevantTies:{
   threeRootCriteria:tie,
   sameCrossing:sameCross,
   sameCrossingAndBlocks:exact,
   tieCount:tie.length,
   reasonComparator:'roots desc, D−1 desc, D−7 desc, cruce desc, bloques físicos desc, familia alfabética'
  },
  historicalWinningWitnesses:[...details.rootEvents.values()].map(x=>({
   ...x,currentPaths:x.currentPaths.slice(0,8)
  })).sort((a,b)=>a.date.localeCompare(b.date)||a.head.localeCompare(b.head)),
  top23:ranking.slice(0,23),
  nearby:ranking.slice(Math.max(0,idx-5),idx+5)
 };
 console.log('ROOT17_AUDIT_START');
 console.log(JSON.stringify(output,null,2));
 console.log('ROOT17_AUDIT_END');
}
main().catch(e=>{console.error('ROOT17_AUDIT_ERROR',e);process.exitCode=1});
