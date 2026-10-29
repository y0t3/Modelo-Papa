/**
 * Laboratorio histórico de 6 semanas: reconstrucciones PRE reales, sin alterar motores ni APP.
 * Compara extension VT2->VT3 en semanas preelegidas JUN/JUL/AGO/SEP/OCT, con
 * presupuesto de 3/5/10 familias, control físico exacto y oráculo sin ranking.
 * El oráculo NO es predictivo: solo mide techo de cobertura disponible.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay,previousDrawDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import {buildMotorLaloAuxiliar} from '../src/motorLaloAuxiliar';
import type {AuxiliarHistory} from '../src/motorLaloAuxiliar';
import {extendPlusVt2ToVt3,extendAuxVt2ToVt3,evaluateVt3} from '../src/labVt2Vt3Extension';
import type {ExtensionMode,Vt2Vt3Result} from '../src/labVt2Vt3Extension';
import {previousPlusVt2Marks,previousAuxVt2Marks,findVisualFoci,evaluateFoci} from '../src/labVisualFocusVt2';
import type {FocusMode,VisualFocus} from '../src/labVisualFocusVt2';
const dates=["2026-06-01","2026-06-02","2026-06-03","2026-06-04","2026-06-05","2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-09-14","2026-09-15","2026-09-16","2026-09-17","2026-09-18","2026-10-19","2026-10-20","2026-10-21","2026-10-22","2026-10-23","2026-10-26","2026-10-27","2026-10-28"];
const modes:ExtensionMode[]=['RONDAS','CUADRADO','FUENTES'];
const focusModes:FocusMode[]=['SITIO_EXACTO','VECINDAD'];
const valid=(x:string)=>/^\d{4}$/.test(x);
const cache=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{if(!cache.has(d))cache.set(d,descargarCabezas(d,true));return cache.get(d)!;};
const auxCache=new Map<string,Promise<AuxiliaryHeads>>();
const aux=(d:string)=>{if(!auxCache.has(d))auxCache.set(d,fetchAuxiliaryHeads(d).then(x=>x.heads));return auxCache.get(d)!;};
const completeCache=new Map<string,Promise<{date:string;heads:CabezasDia;sheet:ReturnType<typeof buildSheet>}>>();
const complete=async(d:string)=>{
 if(!completeCache.has(d))completeCache.set(d,(async()=>{
  const [heads,base]=await Promise.all([get(d),nocturnaAnteriorPorJur(d,get,20)]);
  if(base.missing.length)throw Error('Base incompleta '+d);
  return {date:d,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return completeCache.get(d)!;
};
type Row={date:string;turn:Turno;jur:string;head:string};
type Model='LALO'|'AUX_AYER'|'AUX_HOY';
type RankingKey=`${Model}_${ExtensionMode}`;
type Case={date:string;turn:Turno;heads:Row[];
 baselines:Record<Model,string[]>;variants:Record<RankingKey,{
 top3:string[];top5:string[];top10:string[];
 full:string[];exact:string[];motherTop:string[];
 potentialFamily:string[];potentialExact:string[];
 traces:Record<string,unknown>[];
 }>};
async function main(){
 const all:Case[]=[];
 const focusCases:Record<string,unknown>[]=[];
 for(const date of dates){
  const [today,history,base,liveAux]=await Promise.all([
   get(date),loadPreviousDraws(date,6,get),nocturnaAnteriorPorJur(date,get,20),aux(date)
  ]);
  if(base.missing.length)throw Error('Base incompleta '+date);
  const previous=await Promise.all(history.map(h=>complete(h.date)));
  // Ventana visual: seis jornadas efectivas anteriores. Sin resultados del objetivo.
  const [auxPastAyer,auxPastHoy]=await Promise.all([
    Promise.all(history.map(h=>aux(previousDrawDay(h.date)))),
    Promise.all(history.map(h=>aux(h.date)))
  ]);
  const visualHistAyer:AuxiliarHistory[]=history.map((h,i)=>({
   date:h.date,period:'D−1',aux:extractAuxHistoryMode(
    h.date,auxPastAyer[i],h.heads,'anterior')
  }));
  const visualHistHoy:AuxiliarHistory[]=history.map((h,i)=>({
   date:h.date,period:'D−1',aux:extractAuxHistoryMode(
    h.date,auxPastHoy[i],h.heads,'intrajornada')
  }));
  const plusMarks=previousPlusVt2Marks(previous);
  const auxAyerMarks=previousAuxVt2Marks(visualHistAyer);
  const auxHoyMarks=previousAuxVt2Marks(visualHistHoy);
  const last=history.at(-1)!;
  const weekDay=shiftDay(date,-7);
  const [weekHeads,weekBase,auxOld,auxD1old,auxD7old,auxD1same,auxD7same]=await Promise.all([
   get(weekDay),nocturnaAnteriorPorJur(weekDay,get,20),aux(previousDrawDay(date)),
   aux(previousDrawDay(last.date)),aux(previousDrawDay(weekDay)),
   aux(last.date),aux(weekDay)
  ]);
  if(weekBase.missing.length)throw Error('Semana sin base '+date);
  const refs:LaloHistorical[]=[
   {date:last.date,period:'D−1',sheet:previous.at(-1)!.sheet},
   ...(hasDrawResults(weekHeads)?[{date:weekDay,period:'D−7' as const,
    sheet:buildSheet(weekHeads,weekBase.heads)}]:[])
  ];
  const histAuxAyer:AuxiliarHistory[]=[
   {date:last.date,period:'D−1',sourceDate:previousDrawDay(last.date),
    aux:extractAuxHistoryMode(last.date,auxD1old,last.heads,'anterior')},
   ...(hasDrawResults(weekHeads)?[{
    date:weekDay,period:'D−7' as const,sourceDate:previousDrawDay(weekDay),
    aux:extractAuxHistoryMode(weekDay,auxD7old,weekHeads,'anterior')
   }]:[])
  ];
  const histAuxHoy:AuxiliarHistory[]=[
   {date:last.date,period:'D−1',
    aux:extractAuxHistoryMode(last.date,auxD1same,last.heads,'intrajornada')},
   ...(hasDrawResults(weekHeads)?[{
    date:weekDay,period:'D−7' as const,
    aux:extractAuxHistoryMode(weekDay,auxD7same,weekHeads,'intrajornada')
   }]:[])
  ];
  for(const [idx,turn] of TURNOS.entries()){
   const available=diaVacio();
   for(const earlier of TURNOS.slice(0,idx))available[earlier]={...today[earlier]};
   const pre=preSheetAtCut(buildSheet(available,base.heads),turn,idx);
   if(pre.heads[turn]?.length||pre.matches[turn]?.length)
    throw Error('Fuga del objetivo '+date+' '+turn);
   const official=buildMotorLalo(pre,date,turn,refs);
   const ayerHeads=auxAtCut(auxOld,turn,'anterior');
   const hoyHeads=auxAtCut(liveAux,turn,'intrajornada');
   const ayer=buildMotorLaloAuxiliar(date,turn,ayerHeads,histAuxAyer);
   const hoy=buildMotorLaloAuxiliar(date,turn,hoyHeads,histAuxHoy);
   const candidates:Record<Model,(mode:ExtensionMode)=>Vt2Vt3Result>={
    LALO:mode=>extendPlusVt2ToVt3(pre,official,mode),
    AUX_AYER:mode=>extendAuxVt2ToVt3(date,turn,ayerHeads,ayer,mode),
    AUX_HOY:mode=>extendAuxVt2ToVt3(date,turn,hoyHeads,hoy,mode)
   };
   const mothers:Record<Model,string[]>={
    LALO:official.ranks.vt2.slice(0,10).map(f=>f.family),
    AUX_AYER:ayer.ranks[2].slice(0,10).map(f=>f.family),
    AUX_HOY:hoy.ranks[2].slice(0,10).map(f=>f.family)
   };
   const baselines:Record<Model,string[]>={
    LALO:official.ranks.vt3.slice(0,10).map(f=>f.family),
    AUX_AYER:ayer.ranks[3].slice(0,10).map(f=>f.family),
    AUX_HOY:hoy.ranks[3].slice(0,10).map(f=>f.family)
   };
   const heads=JURS.map(jur=>({date,turn,jur,head:today[turn]?.[jur]||''}))
    .filter(h=>valid(h.head));
   const variants={} as Case['variants'];
   for(const model of ['LALO','AUX_AYER','AUX_HOY'] as Model[]){
    for(const mode of modes){
     const result=candidates[model](mode),top=result.top10;
     if(top.length>10||new Set(top.map(x=>x.family)).size!==top.length)
      throw Error('Duplicadas '+model+' '+date+' '+turn);
     const evalResult=evaluateVt3(result,heads.map(h=>h.head),10);
     const exactHeads=heads.filter(h=>top.some(row=>row.traces.some(
      t=>t.value===h.head.slice(-3))));
     if(exactHeads.length!==evalResult.exactPhysical)throw Error('Cotejo');
     const full=result.candidates;
     const potentialExact=heads.filter(h=>full.some(row=>row.traces.some(
      t=>t.value===h.head.slice(-3))));
     const potentialFamily=heads.filter(h=>full.some(row=>
      row.family===reversibleFamily(h.head.slice(-3))));
     variants[(model+'_'+mode) as RankingKey]={
      top3:top.slice(0,3).map(x=>x.family),
      top5:top.slice(0,5).map(x=>x.family),
      top10:top.map(x=>x.family),
      full:full.map(x=>x.family),
      exact:exactHeads.map(x=>x.jur+':'+x.head),
      motherTop:mothers[model],
      potentialFamily:potentialFamily.map(x=>x.jur+':'+x.head),
      potentialExact:potentialExact.map(x=>x.jur+':'+x.head),
      traces:top.map(x=>({family:x.family,rank:x.rank,
       parents:x.mothers,parentRank:x.motherRank,
       square:x.squareReady,pathCount:x.pathCount,sources:x.sourceCount,
       example:x.traces[0]}))
     };
    }
   }
   all.push({date,turn,heads,baselines,variants});
   // La evaluación mira SUFIJOS EXACTOS de VT3; no basta la reversibilidad.
   // Se muestra a Lalo 1/2 familias y dentro de cada una UNA zona elegida.
   const physical={
    LALO:extendPlusVt2ToVt3(pre,official,'RONDAS'),
    AUX_AYER:extendAuxVt2ToVt3(date,turn,ayerHeads,ayer,'RONDAS'),
    AUX_HOY:extendAuxVt2ToVt3(date,turn,hoyHeads,hoy,'RONDAS')
   };
   const historicMarks={
    LALO:plusMarks,AUX_AYER:auxAyerMarks,AUX_HOY:auxHoyMarks
   };
   const focusCase:Record<string,unknown>={date,turn,heads:heads.map(h=>h.jur+':'+h.head)};
   for(const model of ['LALO','AUX_AYER','AUX_HOY'] as Model[]){
    const ext=physical[model],parent=mothers[model],marks=historicMarks[model];
    const base2=findVisualFoci(ext,parent.slice(0,2),marks,date,'SITIO_EXACTO',2);
    const baseEval=evaluateFoci(ext,base2,heads.map(h=>h.head));
    const baseline1=findVisualFoci(ext,parent.slice(0,1),marks,date,'SITIO_EXACTO',1);
    const firstEval=evaluateFoci(ext,baseline1,heads.map(h=>h.head));
    const familiesAll=new Set(ext.candidates.flatMap(c=>c.traces.map(t=>t.parent)));
    const oracle=heads.filter(h=>ext.candidates.some(c=>c.traces.some(
      t=>t.value===h.head.slice(-3)))).length;
    const focusSummary:Record<string,unknown>={
     first:firstEval,top2:baseEval,oracle,
     originalTop10:parent,randomExpected2:baseEval.meanRandom,
     allParents:familiesAll.size,byMode:{}
    };
    for(const mode of focusModes){
     const selected1=findVisualFoci(ext,parent,marks,date,mode,1);
     const selected2=findVisualFoci(ext,parent,marks,date,mode,2);
     const results=([selected1,selected2] as VisualFocus[][]).map(foci=>({
      ...evaluateFoci(ext,foci,heads.map(h=>h.head)),
      foci:foci.map(f=>({
        family:f.family,rank:f.originalRank,
        source:f.zone.source,cells:f.zone.cells,shape:f.zone.shape,
        exactDays:f.zone.sameDays,nearDays:f.zone.nearDays,
        latestAge:f.zone.latestAge,witness:f.hasWitness,
        extensions:f.zone.extensions,witnesses:f.zone.witnesses
      }))
     }));
     (focusSummary.byMode as Record<string,unknown>)[mode]={one:results[0],two:results[1]};
    }
    focusCase[model]=focusSummary;
   }
   focusCases.push(focusCase);
  }
  console.log('VT2_VT3_HISTORICO_DIA',date,'cortes:',all.filter(c=>c.date===date).length);
 }
 const summary:Record<string,unknown>={};
 for(const model of ['LALO','AUX_AYER','AUX_HOY'] as Model[]){
  const base=all.reduce((n,c)=>n+c.heads.filter(h=>c.baselines[model].includes(
   reversibleFamily(h.head.slice(-3)))).length,0);
  summary[model]={baselineTop10:base};
  for(const mode of modes){
   const key=(model+'_'+mode) as RankingKey;
   const hit=(top:3|5|10)=>all.reduce((n,c)=>n+c.heads.filter(h=>
    c.variants[key]['top'+top].includes(reversibleFamily(h.head.slice(-3)))).length,0);
   const exact=all.reduce((n,c)=>n+c.variants[key].exact.length,0);
   const parent=all.reduce((n,c)=>n+c.heads.filter(h=>
    c.variants[key].motherTop.includes(reversibleFamily(h.head.slice(-2)))).length,0);
   const potentialExact=all.reduce((n,c)=>n+c.variants[key].potentialExact.length,0);
   const potentialFamily=all.reduce((n,c)=>n+c.variants[key].potentialFamily.length,0);
   const exclusive=all.reduce((n,c)=>n+c.heads.filter(h=>
    c.variants[key].top10.includes(reversibleFamily(h.head.slice(-3)))&&
    !c.baselines[model].includes(reversibleFamily(h.head.slice(-3)))).length,0);
   (summary[model] as Record<string,unknown>)[mode]={
    top3:hit(3),top5:hit(5),top10:hit(10),exactPhysicalTop10:exact,
    motherVt2Top10:parent,potentialExact,potentialFamily,exclusiveTop10:exclusive};
  }
 }
 const report={method:'RETROSPECTIVE_PRE_NOT_SEALED',start:dates[0],end:dates.at(-1),
  cuts:all.length,heads:all.reduce((n,c)=>n+c.heads.length,0),summary,cases:all,
  warning:'Reconstruction only. No statistical edge established. Exact physical evaluation distinct from reversible family match.'};
 const focusSummaries:Record<string,unknown>={};
 for(const model of ['LALO','AUX_AYER','AUX_HOY'] as Model[]){
  const select=(obj:any,path:string)=>path.split('.').reduce((a,k)=>a?.[k],obj);
  const sum=(path:string)=>focusCases.reduce((n,c)=>n+Number(
   select(c[model],path)||0),0);
  const period=(start:string,end:string)=>focusCases.filter(c=>
   String(c.date)>=start&&String(c.date)<=end);
  const perPeriod=Object.fromEntries([
   ['JUN_JUL','2026-06-01','2026-07-31'],
   ['AGO_SEP','2026-08-01','2026-09-30'],
   ['OCT','2026-10-01','2026-10-31']
  ].map(([label,a,b])=>[label,Object.fromEntries([
   'top2.exact','byMode.SITIO_EXACTO.two.exact','byMode.SITIO_EXACTO.two.zoneExact',
   'byMode.VECINDAD.two.exact','byMode.VECINDAD.two.zoneExact'
  ].map(path=>[path,period(a,b).reduce((n,c)=>n+
     Number(select(c[model],path)||0),0)]))]));
  focusSummaries[model]={
   baselineOne:sum('first.exact'),baselineTwo:sum('top2.exact'),
   expectedRandomTwo:sum('randomExpected2'),oracleTen:sum('oracle'),
   exactTwo:sum('byMode.SITIO_EXACTO.two.exact'),
   nearTwo:sum('byMode.VECINDAD.two.exact'),
   exactZoneTwo:sum('byMode.SITIO_EXACTO.two.zoneExact'),
   nearZoneTwo:sum('byMode.VECINDAD.two.zoneExact'),
   exactOne:sum('byMode.SITIO_EXACTO.one.exact'),
   nearOne:sum('byMode.VECINDAD.one.exact'),
   witnessExactTwo:sum('byMode.SITIO_EXACTO.two.withWitness'),
   witnessNearTwo:sum('byMode.VECINDAD.two.withWitness'),
   perPeriod
  };
 }
 const focusReport={method:'RECONSTRUCCION_PRE_NO_SELLADA',
  cuts:focusCases.length,heads:focusCases.reduce((n,c)=>
   n+(c.heads as string[]).length,0),summary:focusSummaries,cases:focusCases,
  interpretation:'Una zona por familia, sin probabilidades; los ejemplos de ganador solo se miran POST.'};
 const folder='auditorias/foco-visual-vt2'; 
 fs.mkdirSync(folder,{recursive:true});
 fs.writeFileSync(folder+'/resultado.json',JSON.stringify(focusReport,null,2)+'\n');
 console.log('FOCO_VISUAL_RESUMEN',JSON.stringify(focusSummaries));
 fs.mkdirSync('auditorias/vt2-hacia-vt3-historico',{recursive:true});
 const oldFolder='auditorias/vt2-hacia-vt3-historico';
 fs.mkdirSync(oldFolder,{recursive:true});
 fs.writeFileSync(oldFolder+'/resultado.json',JSON.stringify(report,null,2)+'\n');
 console.log('VT2_VT3_HISTORICO_RESUMEN',JSON.stringify({cuts:report.cuts,heads:report.heads,summary}));
 for(const date of ['2026-10-26','2026-10-28']){
  const c=all.find(x=>x.date===date&&x.turn==='Nocturno')!;
  console.log('VT2_VT3_NOCTURNA',date,JSON.stringify({
   heads:c.heads,baselines:c.baselines,
   extend:Object.fromEntries(Object.entries(c.variants).map(([k,v])=>[k,{
    top10:v.top10,exact:v.exact,potentialExact:v.potentialExact}]))
  }));
 }
}
main().catch(e=>{console.error('VT2_VT3_ERROR',e);process.exitCode=1;});
