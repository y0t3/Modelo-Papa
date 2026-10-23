/** Auditoría reproducible del 22/10/2026, cortes PRE separados del POST. */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo} from '../src/motorLalo';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from '../src/motorLaloAuxiliar';
import type {AuxiliarHistory} from '../src/motorLaloAuxiliar';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import {auxiliaryBoard,findAuxPaths} from '../src/auxSantiagoNeuquen';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {rowsForModel} from '../src/predictionParallel';
import type {RankedFamily} from '../src/predictionParallel';
const date='2026-10-22',prior=previousDrawDay(date),old=previousDrawDay(prior);
const week=shiftDay(date,-7),weekBefore=previousDrawDay(week);
const MODES=['MV1','AYER','HOY','ETAPAS'] as const;
const KINDS=['vt2','vt3','vt4'] as const,TOPS=[3,5,10] as const;
type Kind=typeof KINDS[number];type Mode=typeof MODES[number];
type Day={draws:CabezasDia;aux:AuxiliaryHeads};
const memo=new Map<string,Promise<Day>>();
async function get(d:string):Promise<Day>{
 if(!memo.has(d))memo.set(d,Promise.all([
  descargarCabezas(d,true),fetchAuxiliaryHeads(d)
 ]).then(([draws,raw])=>({draws,aux:raw.heads})));
 return memo.get(d)!;
}
function preOnly(day:CabezasDia,target:Turno):CabezasDia{
 const out=diaVacio();
 for(const t of TURNOS.slice(0,TURNOS.indexOf(target)))out[t]={...day[t]};
 return out;
}
async function main(){
 const [today,yesterday,beforeYesterday,weekly,weeklyBefore]=await Promise.all([
  get(date),get(prior),get(old),get(week),get(weekBefore)]);
 const historical=[
  {date:prior,period:'D−1' as const,sheet:buildSheet(yesterday.draws,beforeYesterday.draws)},
  {date:week,period:'D−7' as const,sheet:buildSheet(weekly.draws,weeklyBefore.draws)}
 ];
 const rootsYesterday:AuxiliarHistory[]=[
  {date:prior,period:'D−1',sourceDate:old,heads:beforeYesterday.aux,
   aux:extractAuxiliarHistory(prior,beforeYesterday.aux,yesterday.draws)},
  {date:week,period:'D−7',sourceDate:weekBefore,heads:weeklyBefore.aux,
   aux:extractAuxiliarHistory(week,weeklyBefore.aux,weekly.draws)}
 ];
 const rootsToday:AuxiliarHistory[]=[
  {date:prior,period:'D−1',heads:yesterday.aux,
   aux:extractAuxHistoryMode(prior,yesterday.aux,yesterday.draws,'intrajornada')},
  {date:week,period:'D−7',heads:weekly.aux,
   aux:extractAuxHistoryMode(week,weekly.aux,weekly.draws,'intrajornada')}
 ];
 const postSheet=buildSheet(today.draws,yesterday.draws);
 const events:any[]=[],cuts:any[]=[];
 for(const turn of TURNOS){
  // PRE: ni una cabeza del turno evaluado ni de turnos futuros.
  const preSheet=buildSheet(preOnly(today.draws,turn),yesterday.draws);
  const mv=buildMotorLalo(preSheet,date,turn,historical);
  const cutYesterday=auxAtCut(yesterday.aux,turn,'anterior');
  const cutToday=auxAtCut(today.aux,turn,'intrajornada');
  const auxYesterday=buildMotorLaloAuxiliar(date,turn,cutYesterday,rootsYesterday);
  const auxToday=buildMotorLaloAuxiliar(date,turn,cutToday,rootsToday);
  const boardBefore=auxiliaryBoard(cutYesterday,turn);
  const boardLive=auxiliaryBoard(cutToday,turn);
  const rows={} as Record<Mode,Record<Kind,RankedFamily[]>>;
  for(const mode of MODES)rows[mode]={} as Record<Kind,RankedFamily[]>;
  for(const kind of KINDS){
   rows.MV1[kind]=rowsForModel('lalo',kind,mv,null);
   rows.AYER[kind]=rowsForModel('auxiliar',kind,null,auxYesterday);
   rows.HOY[kind]=rowsForModel('auxiliar',kind,null,auxToday);
   rows.ETAPAS[kind]=TURNOS.indexOf(turn)<=2?rows.AYER[kind]:rows.HOY[kind];
  }
  const sealed:any={turn,date,cells:{AYER:boardBefore.cells.length,
   HOY:boardLive.cells.length},
   candidates:{}};
  for(const mode of MODES){
   sealed.candidates[mode]={};
   for(const kind of KINDS)sealed.candidates[mode][kind]=rows[mode][kind]
    .slice(0,10).map(f=>({rank:f.rank,family:f.family,values:f.values}));
  }
  cuts.push(sealed); // solo después de este punto se coteja POST
  for(const jur of JURS){
   const head=today.draws[turn]?.[jur]||'';
   if(!/^\d{4}$/.test(head))continue;
   const event:any={turn,jur,head,physical:{plus11:postSheet.matches[turn]
    .some(m=>m.jurisdiccion===jur&&m.cabeza===head)},modalities:{}};
   for(const kind of KINDS){
    const n=Number(kind.slice(-1)),suffix=head.slice(-n);
    const entry:any={suffix,physical:{
     AYER:findAuxPaths(boardBefore,suffix).length,
     HOY:findAuxPaths(boardLive,suffix).length},rank:{}};
    for(const mode of MODES){
     const f=rows[mode][kind].find(x=>x.values.includes(suffix));
     entry.rank[mode]=f?{rank:f.rank,family:f.family}:null;
    }
    event.modalities[kind]=entry;
   }
   events.push(event);
  }
 }
 if(events.length<20)throw Error('La fuente solo trajo '+events.length+' cabezas');
 const totals:any[]=[];
 for(const kind of KINDS)for(const top of TOPS)for(const mode of MODES){
  const successes=events.filter(e=>e.modalities[kind].rank[mode]?.rank<=top);
  totals.push({kind,top,mode,hits:successes.length,sample:events.length,
   successes:successes.map(e=>({turn:e.turn,jur:e.jur,head:e.head,
    rank:e.modalities[kind].rank[mode].rank,
    family:e.modalities[kind].rank[mode].family}))});
 }
 const turnBreakdown:any[]=[];
 for(const turn of TURNOS)for(const kind of KINDS)for(const mode of MODES){
  const successes=events.filter(e=>e.turn===turn&&
   e.modalities[kind].rank[mode]?.rank<=10);
  turnBreakdown.push({turn,kind,mode,hits:successes.length,
   heads:successes.map(e=>e.jur+' '+e.head+' #'+e.modalities[kind].rank[mode].rank)});
 }
 const geometry=KINDS.map(kind=>({kind,
  AYER:events.filter(e=>e.modalities[kind].physical.AYER>0).length,
  HOY:events.filter(e=>e.modalities[kind].physical.HOY>0).length,
  AMBOS:events.filter(e=>e.modalities[kind].physical.AYER>0&&
   e.modalities[kind].physical.HOY>0).length}));
 const sourceHeads=Object.fromEntries(TURNOS.map(t=>[t,
  Object.fromEntries(JURS.map(j=>[j,today.draws[t]?.[j]||'----']))]));
 const sources={date,prior,week,
  rawAnterior:yesterday.aux,rawIntrajornada:today.aux,sourceHeads};
 const report={sources,totals,turnBreakdown,geometry,events,cuts};
 const dir='auditorias/22oct2026-motores/resultados';
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/REPLAY-22oct.json',JSON.stringify(report,null,2));
 fs.writeFileSync(dir+'/tops-ANTES-de-cada-turno.json',JSON.stringify(cuts,null,2));
 const lines=['# Auditoría 22/10/2026 · MV1 / AUX Ayer / AUX Hoy','',
  'Resultado de replay histórico con cinco cortes PRE y contraste POST.',
  'No son pronósticos prospectivos sellados previamente. ETAPAS experimental.',
  'Muestra: '+events.length+' cabezas, D−1 '+prior+', D−7 '+week+'.','','| VT | Top | MV1 | AYER | HOY | ETAPAS |',
  '| --- | --- | ---: | ---: | ---: | ---: |'];
 for(const kind of KINDS)for(const top of TOPS){
  const num=(mode:Mode)=>totals.find(x=>x.kind===kind&&x.top===top&&x.mode===mode)?.hits||0;
  lines.push('| '+kind.toUpperCase()+' | '+top+' | '+num('MV1')+
   ' | '+num('AYER')+' | '+num('HOY')+' | '+num('ETAPAS')+' |');
 }
 lines.push('','## VT3 Top10 por turno','',
  '| Turno | MV1 | AYER | HOY |',
  '| --- | ---: | ---: | ---: |');
 for(const turn of TURNOS){
  const num=(mode:Mode)=>turnBreakdown.find(x=>x.turn===turn&&x.kind==='vt3'&&x.mode===mode)?.hits||0;
  lines.push('| '+turn+' | '+num('MV1')+' | '+num('AYER')+' | '+num('HOY')+' |');
 }
 lines.push('','## Familias acertadas Top10','');
 for(const kind of KINDS)for(const mode of MODES){
  const rows=totals.find(x=>x.kind===kind&&x.top===10&&x.mode===mode)?.successes||[];
  lines.push('- '+kind.toUpperCase()+' '+mode+': '+(rows.map((r:any)=>
   r.turn+' '+r.jur+' '+r.head+' (#'+r.rank+' '+r.family+')').join('; ')||'ninguna'));
 }
 lines.push('','Acierto de Top no equivale a formación geométrica sin selección.');
 fs.writeFileSync(dir+'/RESUMEN.md',lines.join('\n')+'\n');
 console.log('AUDITORIA_22OCT',JSON.stringify({n:events.length,sources,
  totals:totals.map(({kind,top,mode,hits})=>({kind,top,mode,hits})),
  turnBreakdown,geometry}));
 console.log('AUDITORIA_22OCT_WINNERS',JSON.stringify(totals
  .filter(x=>x.top===10&&x.successes.length)
  .map(x=>({kind:x.kind,mode:x.mode,successes:x.successes}))));
}
void main().catch(e=>{console.error('AUDITORIA_22OCT_ERROR',e);process.exitCode=1});
