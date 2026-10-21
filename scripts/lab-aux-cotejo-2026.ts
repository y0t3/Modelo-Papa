/**
 * Replay PRE de Lalo con segunda hoja del padre, 12-20 octubre 2026.
 *
 * Los TESTIGOS ganadores se marcan POST. Top Lalo, +11 y auxiliar se obtienen
 * sin leer las cabezas del turno objetivo. No cambia ni recalifica MV1.
 *
 * Unidad de conteo: cabeza real de seis jurisdicciones, una vez por modalidad;
 * cada ruta física queda documentada, pero rutas distintas NO son votos
 * estadísticos independientes. VT4 exige 4 cifras exactas en ambas hojas.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {allPhysicalVt3} from '../src/vt3Shadow';
import {findPaths} from '../src/paths';
import {
 auxiliaryBoard,collectAuxFamilies,findAuxPaths,auxFamily,
 serializeAuxPath,findAuxFamily
} from '../src/auxSantiagoNeuquen';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import type {AuxSourceObservation} from '../src/auxSantiagoSource';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';

const DATES=['02','03','05','06','07','08','09','10','12','13','14','15','16','17','19','20']
 .map(d=>'2026-10-'+d);
const CONTROL_FROM='2026-10-12',TARGET='2026-10-20';
const valid=(s:string)=>/^\d{4}$/.test(s);
const rev=(s:string)=>[...s].reverse().join('');
const coord=(c:{row:number;col:number})=>c.row+':'+c.col;
const minus7=(date:string)=>{
 const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-7);
 return d.toISOString().slice(0,10);
};
const plusFamily=(sheet:DailySheet,turn:Turno)=>
 new Set(sheet.columns.slice(0,TURNOS.indexOf(turn)+1).flatMap(col=>
  allPhysicalVt3(col.values).map(p=>reversibleFamily(p.map(x=>x.digit).join('')))));
const plusPaths=(sheet:DailySheet,turn:Turno,head:string,n:2|3|4)=>{
 const suffix=head.slice(-n);
 return sheet.columns.slice(0,TURNOS.indexOf(turn)+1).flatMap(col=>
  findPaths(col.values,suffix).map(path=>({source:col.id,
   coords:path.map(coord),value: suffix})));
};
type Outcome='ambas'|'solo_plus11'|'solo_auxiliar'|'ninguna';
type Hit={date:string;turn:Turno;jur:string;head:string;
 vt2:{plusExact:number;auxExact:number;auxFamily:number;auxCrossTurn:number};
 vt3:{family:string;outcome:Outcome;plusExact:number;auxExact:number;
  auxFamily:number;auxCrossTurn:number;plusPaths:any[];auxPaths:any[]};
 vt4:{plusExact:number;auxExact:number;auxCrossTurn:number};
 admittedLalo:boolean;rankLalo:number|null};
type Cut={date:string;turn:Turno;
 sourceHeads:any;availableAuxTurns:string[];validSourceHeads:number;
 auxCells:number;auxFamilies2:number;auxFamilies3:number;
 plusFamilies3:number;
 familyOverlaps:{both:number;onlyPlus:number;onlyAux:number};
 auxCrossTurnFamilies3:number;
 top6:{family:string;rank:number;auxiliary:boolean;
 auxCrossTurn:boolean;sourceTurns:string[];resultHits:number}[];
 winnerHits:Hit[]};
const stat=(cuts:Cut[])=>{
 const h=cuts.flatMap(x=>x.winnerHits);
 const out:Record<string,any>={cuts:cuts.length,heads:h.length,withVT3:{
  ambas:0,solo_plus11:0,solo_auxiliar:0,ninguna:0
 }};
 for(const x of h)out.withVT3[x.vt3.outcome]++;
 out.vt2={main:h.filter(x=>x.vt2.plusExact).length,
  auxExact:h.filter(x=>x.vt2.auxExact).length,
  unionExact:h.filter(x=>x.vt2.auxExact||x.vt2.plusExact).length};
 out.vt3={mainExact:h.filter(x=>x.vt3.plusExact).length,
  auxExact:h.filter(x=>x.vt3.auxExact).length,
  bothExact:h.filter(x=>x.vt3.auxExact&&x.vt3.plusExact).length,
  auxFamily:h.filter(x=>x.vt3.auxFamily).length,
  unionFamily:h.filter(x=>x.vt3.outcome!=='ninguna').length,
  crossingsExact:h.filter(x=>x.vt3.auxCrossTurn).length};
 out.vt4={mainExact:h.filter(x=>x.vt4.plusExact).length,
  auxExact:h.filter(x=>x.vt4.auxExact).length,
  unionExact:h.filter(x=>x.vt4.auxExact||x.vt4.plusExact).length,
  crossingExact:h.filter(x=>x.vt4.auxCrossTurn).length};
 const top=cuts.flatMap(x=>x.top6);
 out.laloTop6={candidateOccurrences:top.length,
  withAux:top.filter(x=>x.auxiliary).length,
  withoutAux:top.filter(x=>!x.auxiliary).length,
  winningHeadsWithAux:top.filter(x=>x.auxiliary).reduce((n,x)=>n+x.resultHits,0),
  winningHeadsWithoutAux:top.filter(x=>!x.auxiliary).reduce((n,x)=>n+x.resultHits,0),
  withCrossTurn:top.filter(x=>x.auxCrossTurn).length};
 return out;
};
async function main(){
 const fetched=new Map<string,CabezasDia>();
 const aux=new Map<string,AuxSourceObservation>();
 const errors:Record<string,string>={};
 await Promise.all(DATES.map(async date=>{
  try{
   const [base,other]=await Promise.all([descargarCabezas(date,true),fetchAuxiliaryHeads(date)]);
   fetched.set(date,base);aux.set(date,other);
  }catch(e){errors[date]=String(e);}
 }));
 const good=DATES.filter(d=>fetched.has(d)&&aux.has(d)&&
  hasDrawResults(fetched.get(d)!)&&hasNocturnoBase(fetched.get(d)!));
 if(good.length<14)throw Error('Faltan demasiadas jornadas '+JSON.stringify(errors));
 const oct20=aux.get(TARGET);
 if(!oct20)throw Error('Falta hoja auxiliar 20oct');
 if(oct20.heads.Previa.Santiago!=='8067'||
  oct20.heads.Previa.Neuquen!=='0469'||
  oct20.heads.Primera.Santiago!=='----'||
  oct20.heads.Primera.Neuquen!=='0245'||
  oct20.heads.Matutino.Santiago!=='6142'||
  oct20.heads.Matutino.Neuquen!=='0210')
  throw Error('No coincide con cabezas cotejadas externamente '+JSON.stringify(oct20));
 const sheets=new Map<string,DailySheet>();
 for(let i=1;i<good.length;i++)sheets.set(good[i],
  buildSheet(fetched.get(good[i])!,fetched.get(good[i-1])!));
 const cuts:Cut[]=[];
 for(let i=2;i<good.length;i++){
  const date=good[i];if(date<CONTROL_FROM)continue;
  const hist:LaloHistorical[]=[
   {date:good[i-1],period:'D−1',sheet:sheets.get(good[i-1])!},
   ...(sheets.has(minus7(date))?
    [{date:minus7(date),period:'D−7' as const,sheet:sheets.get(minus7(date))!}]:[])
  ];
  const sheet=buildSheet(fetched.get(date)!,fetched.get(good[i-1])!);
  const today=fetched.get(date)!,input=aux.get(date)!.heads;
  for(const turn of TURNOS){
   const pre=preSheetAtCut(sheet,turn,TURNOS.indexOf(turn));
   if(pre.heads[turn].length||pre.matches[turn].length)throw Error('Fuga cabezas en +11 PRE');
   const board=auxiliaryBoard(input,turn);
   if(board.cells.some(c=>!board.visibleTurns.includes(c.source)))throw Error('Fuga futura auxiliar');
   const vt2=collectAuxFamilies(board,2),vt3=collectAuxFamilies(board,3);
   const family2=new Map(vt2.map(x=>[x.family,x]));
   const family3=new Map(vt3.map(x=>[x.family,x]));
   const plus3=plusFamily(pre,turn);
   const lalo=buildMotorLalo(pre,date,turn,hist);
   const top6=lalo.ranks.vt3.slice(0,6).map(x=>{
    const auxiliary=family3.get(x.family);
    const headMatches=JURS.map(j=>today[turn][j]).filter(valid).filter(h=>
     reversibleFamily(h.slice(-3))===x.family).length;
    return {family:x.family,rank:x.rank,auxiliary:!!auxiliary,
     auxCrossTurn:!!auxiliary?.crossTurnPaths,
     sourceTurns:auxiliary?.turnSources||[],resultHits:headMatches};
   });
   const winnerHits:Hit[]=JURS.flatMap(jur=>{
    const head=today[turn][jur];if(!valid(head))return [];
    const plus2=plusPaths(pre,turn,head,2),
      plus3Paths=plusPaths(pre,turn,head,3),plus4=plusPaths(pre,turn,head,4);
    const aux2=findAuxPaths(board,head.slice(-2)),
      aux3=findAuxPaths(board,head.slice(-3)),aux4=findAuxPaths(board,head);
    const f3=reversibleFamily(head.slice(-3)),f2=auxFamily(head.slice(-2));
    const p=plus3.has(f3),a=family3.has(f3);
    const outcome:Outcome=p&&a?'ambas':p?'solo_plus11':a?'solo_auxiliar':'ninguna';
    return [{date,turn,jur,head,
     vt2:{plusExact:plus2.length,auxExact:aux2.length,
      auxFamily:family2.get(f2)?.paths.length||0,
      auxCrossTurn:aux2.filter(path=>new Set(path.map(c=>c.source)).size>1).length},
     vt3:{family:f3,outcome,plusExact:plus3Paths.length,
      auxExact:aux3.length,auxFamily:family3.get(f3)?.paths.length||0,
      auxCrossTurn:aux3.filter(path=>new Set(path.map(c=>c.source)).size>1).length,
      plusPaths:plus3Paths.slice(0,25),
      auxPaths:aux3.slice(0,25).map(serializeAuxPath)},
     vt4:{plusExact:plus4.length,auxExact:aux4.length,
      auxCrossTurn:aux4.filter(path=>new Set(path.map(c=>c.source)).size>1).length},
     admittedLalo:laloHas(lalo.ranks.vt3.map(x=>x.family),f3),
     rankLalo:laloRank(lalo.ranks.vt3.map(x=>x.family),f3)}];
   });
   const both=[...plus3].filter(f=>family3.has(f)).length;
   const item:Cut={date,turn,sourceHeads:input,
    availableAuxTurns:board.visibleTurns,
    validSourceHeads:board.cells.length/4,
    auxCells:board.cells.length,
    auxFamilies2:vt2.length,auxFamilies3:vt3.length,
    plusFamilies3:plus3.size,
    familyOverlaps:{both,onlyPlus:plus3.size-both,onlyAux:vt3.length-both},
    auxCrossTurnFamilies3:vt3.filter(f=>f.crossTurnPaths).length,top6,winnerHits};
   cuts.push(item);
   if(date===TARGET)console.log('AUX_CORTE_20OCT',JSON.stringify({
    turn,sources:item.sourceHeads,visible:item.availableAuxTurns,auxCells:item.auxCells,
    vt3Families:{plus:item.plusFamilies3,aux:item.auxFamilies3,...item.familyOverlaps,
     crossing:item.auxCrossTurnFamilies3},
    top6:item.top6,
    heads:winnerHits.map(({jur,head,vt3,vt4,rankLalo})=>({
     jur,head,family:vt3.family,formation:vt3.outcome,
     plusExact:vt3.plusExact,auxExact:vt3.auxExact,
     auxFamily:vt3.auxFamily,auxCrossing:vt3.auxCrossTurn,
     aux4Exact:vt4.auxExact,laloRank:rankLalo,
     witnessAux:vt3.auxPaths.slice(0,5)
    }))
   }));
  }
 }
 function laloHas(names:string[],f:string){return names.includes(f)}
 function laloRank(names:string[],f:string){const n=names.indexOf(f);return n<0?null:n+1}
 const dates=[...new Set(cuts.map(c=>c.date))];
 const byDay=dates.map(date=>({date,stats:stat(cuts.filter(c=>c.date===date))}));
 const report={name:'Segunda Hoja Santiago/Neuquen · Lalo · laboratorio 21oct',
  title:'Dos filas, hasta tres turnos reales, sin +11, contacto entre columnas permitido',
  validation:'PRE retrospectivo sin datos del turno objetivo; no equivale a Tops históricos sellados',
  extraSource:'Viví tu Suerte API ID10 Santiago, ID11 Neuquén',
  caveat:'Santiago no registra Primera en fuente contrastada: momento_1 de ID10 es Matutina. Se deja blanco. Nunca adelantar Matutino a Primera.',
  source20Oct:oct20,errors,byDay,
  total:stat(cuts),lastDay:stat(cuts.filter(c=>c.date===TARGET)),
  cuts};
 console.log('AUX_RESUMEN',JSON.stringify({
  total:report.total,lastDay:report.lastDay,byDay:report.byDay,
  missingHeads:errors,source20:oct20.heads
 }));
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/aux-santiago-neuquen-cotejo-2026.json',JSON.stringify(report,null,2));
}
void main().catch(e=>{console.error('AUX_COTEJO_ERROR',e);process.exitCode=1});
