/**
 * Auditoría retrospectiva de 3 HOJAS independientes, VT2 y VT3 por separado.
 * PRE: 5 cortes diarios; cada motor genera rutas sin leer cabezas objetivo.
 * POST: recién entonces se registra qué sufijos fueron cabezas publicadas.
 * El ranking de más de un motor +11 NO vale como varios tableros.
 */
import fs from 'node:fs';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {descargarCabezas} from '../src/cabezas';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {shiftDay} from '../src/dates';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import type {AuxiliaryHistorical,AuxRank} from '../src/motorLaloIntegral';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo} from '../src/motorLalo';
import {buildExperimentalVt2} from '../src/experimentalVt2';
import {buildFormFirstMotor} from '../src/motorFormasPrimero';
import {evaluateParallelPOST} from '../src/labTresHojasFiguras';
import type {Head,ParallelSummary} from '../src/labTresHojasFiguras';
import type {ShapeRoute,Board,Kind} from '../src/labRadarFiguras';
import {figuresInTop,compareSnapshots} from '../src/labRadarFiguras';
import {auxCanonicalPath,auxiliaryBoard} from '../src/auxSantiagoNeuquen';
import {buildExtensionSnapshot,mothersFromTop,evaluateSnapshotPOST,equalBudgetComparison}
 from '../src/labExtensionesAux';
import {winnerRoots} from '../src/labRadarRaicesGanadoras';
import {auxiliaryWitnesses,plus11Witnesses,postSupportMetrics} from '../src/labTresHojasTestigos';
import {pulsesForSnapshot,summarizePulses} from '../src/labPulsosTresHojas';
import {prepareChangeAlerts,matchedControls,evaluateChangeAlertsPOST}
 from '../src/labAlertasCambios';

const from=process.env.TRES_FROM||'2026-10-12';
const to=process.env.TRES_TO||'2026-10-28';
const label=process.env.TRES_LABEL||'octubre';
const drawCache=new Map<string,Promise<CabezasDia>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
const fullCache=new Map<string,Promise<{date:string;heads:CabezasDia;sheet:ReturnType<typeof buildSheet>}>>();
const draw=(date:string)=>{
 if(!drawCache.has(date))drawCache.set(date,descargarCabezas(date,true));
 return drawCache.get(date)!;
};
const aux=(date:string)=>{
 if(!auxCache.has(date))auxCache.set(date,fetchAuxiliaryHeads(date));
 return auxCache.get(date)!;
};
const full=(date:string)=>{
 if(!fullCache.has(date))fullCache.set(date,(async()=>{
  const [heads,base]=await Promise.all([draw(date),nocturnaAnteriorPorJur(date,draw,20)]);
  if(base.missing.length)throw Error('Nocturna anterior incompleta');
  return {date,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return fullCache.get(date)!;
};
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
const valid=(s:string)=>/^\d{4}$/.test(s);
const summed=(rows:ParallelSummary[],fn:(x:ParallelSummary)=>number)=>
 rows.reduce((n,r)=>n+fn(r),0);
const routesFromAux=(ranks:Record<2|3|4,AuxRank[]>,date:string,
 turn:Turno,board:Board):ShapeRoute[]=>{
 const routes:ShapeRoute[]=[];
 for(const kind of [2,3] as const)for(const f of ranks[kind].slice(0,10)){
  const unique=new Set<string>();
  for(const p of f.paths){
   const key=auxCanonicalPath(p);if(unique.has(key))continue;unique.add(key);
   routes.push({date,turn,board,source:'Santiago-Neuquen',
    engine:board==='AUX_AYER'?'AUX_AYER':'AUX_HOY',
    kind:('VT'+kind) as Kind,rank:f.rank,family:f.family,
    reading:p.map(c=>c.digit).join(''),
    cells:p.map(c=>({row:c.row,col:c.col}))});
  }
 }
 return routes;
};
async function main(){
 const days:{date:string;cuts:{turn:Turno;summary:ParallelSummary;
  selected:ReturnType<typeof figuresInTop>;support:ReturnType<typeof postSupportMetrics>;
  alert:ReturnType<typeof prepareChangeAlerts>;
  matched:ReturnType<typeof matchedControls>;
  outcomes:ReturnType<typeof evaluateChangeAlertsPOST>;
  extension:{
   lalo:{snapshot:ReturnType<typeof buildExtensionSnapshot>;post:ReturnType<typeof evaluateSnapshotPOST>;equal:ReturnType<typeof equalBudgetComparison>};
   combined:{snapshot:ReturnType<typeof buildExtensionSnapshot>;post:ReturnType<typeof evaluateSnapshotPOST>;equal:ReturnType<typeof equalBudgetComparison>}
  }}[];
  pulse:ReturnType<typeof summarizePulses>}[]=[];
 const skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=to;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  try{
   const [today,old,base]=await Promise.all([
    draw(date),loadPreviousDraws(date,6,draw),
    nocturnaAnteriorPorJur(date,draw,20)
   ]);
   if(base.missing.length)throw Error('Base +11 incompleta');
   const checks=TURNOS.reduce((n,t)=>n+
    JURS.filter(j=>j!=='Montevideo'&&valid(today[t]?.[j]||'')).length,0);
   if(checks<20)throw Error('Jornada con resultados insuficientes');
   const previous=await Promise.all(old.map(x=>full(x.date)));
   const weekDate=shiftDay(date,-7);
   const week=previous.find(p=>p.date===weekDate)||await full(weekDate);
   const d1=previous.at(-1)!;
   const refs=[{date:d1.date,period:'D−1' as const,heads:d1.heads,sheet:d1.sheet},
    ...(hasDrawResults(week.heads)?[{date:weekDate,period:'D−7' as const,
     heads:week.heads,sheet:week.sheet}]:[])];
   const needed=new Set<string>([date,auxiliarySourceDate(date)]);
   for(const ref of refs){needed.add(ref.date);needed.add(auxiliarySourceDate(ref.date));}
   const source=new Map(await Promise.all([...needed].map(async d=>[d,await aux(d)] as const)));
   const auxRefs={} as Record<AuxMode,AuxiliaryHistorical[]>;
   for(const mode of ['anterior','intrajornada'] as AuxMode[]){
    auxRefs[mode]=refs.map(ref=>{
     const sourceDate=mode==='anterior'?auxiliarySourceDate(ref.date):ref.date;
     const observed=source.get(sourceDate)!.heads;
     return {date:ref.date,period:ref.period,
      aux:extractAuxHistoryMode(ref.date,observed,ref.heads,mode)};
    });
   }
   const historic11=refs.flatMap(r=>winnerRoots(r.date,r.sheet));
   const historicAux=[
    ...auxiliaryWitnesses(auxRefs.anterior,'AUX_AYER'),
    ...auxiliaryWitnesses(auxRefs.intrajornada,'AUX_HOY')
   ];
   const cuts=[] as (typeof days)[number]['cuts'];
   for(let i=0;i<TURNOS.length;i++){
    const turn=TURNOS[i];
    const earlier=diaVacio();
    for(const t of TURNOS.slice(0,i))earlier[t]={...today[t]};
    const pre=preSheetAtCut(buildSheet(earlier,base.heads),turn,i);
    if(pre.heads[turn]?.length||pre.matches[turn]?.length)
     throw Error('FUGA POST '+date+' '+turn);
    const lal=buildMotorLalo(pre,date,turn,refs.map(x=>({
     date:x.date,period:x.period,sheet:x.sheet
    })));
    const experimental=buildExperimentalVt2(pre,date,turn,
     previous.map(p=>({date:p.date,period:'D−1' as const,sheet:p.sheet})));
    const shapeDays=previous.map(p=>({
     date:p.date,heads:p.heads,sheet:p.sheet
    }));
    const form2=buildFormFirstMotor(pre,date,turn,shapeDays,10,'vt2');
    const form3=buildFormFirstMotor(pre,date,turn,shapeDays,10,'vt3');
    const routes:ShapeRoute[]=[];
    const auxBoards={} as Record<'AUX_AYER'|'AUX_HOY',ReturnType<typeof auxiliaryBoard>>;
    for(const kind of ['vt2','vt3'] as const)
     for(const f of lal.ranks[kind].slice(0,10))
      for(const p of f.paths){
       if(p.path.length!==(kind==='vt2'?2:3))continue;
       routes.push({date,turn,board:'PLUS11',source:p.sourceId,
        engine:'LALO',kind:kind.toUpperCase() as Kind,rank:f.rank,
        family:f.family,reading:p.path.map(c=>c.digit).join(''),
        cells:p.path.map(c=>({row:c.row,col:c.col}))});
      }
    for(const [engine,items] of [
     ['GEOMETRIA',experimental.geometric],
     ['CONECTADAS',experimental.connected]
    ] as const)
     for(const [rank,item] of items.slice(0,10).entries())
      routes.push({date,turn,board:'PLUS11',source:item.source,
       engine,kind:'VT2',rank:rank+1,family:item.family,reading:item.value,
       cells:item.cells.map(s=>{const [row,col]=s.split(':').map(Number);
        return {row,col};})});
    for(const [kind,motor] of [['VT2',form2],['VT3',form3]] as const)
     for(const f of motor.top)
      routes.push({date,turn,board:'PLUS11',source:f.source,
       engine:'FORMAS_PRIMERO',kind,rank:f.rank,
       family:f.family,reading:f.value,cells:f.cells});
    for(const mode of ['anterior','intrajornada'] as AuxMode[]){
     const raw=source.get(mode==='anterior'?auxiliarySourceDate(date):date)!.heads;
     const cut=auxAtCut(raw,turn,mode);
     auxBoards[mode==='anterior'?'AUX_AYER':'AUX_HOY']=auxiliaryBoard(cut,turn);
     if(mode==='intrajornada'&&turn==='Previa'&&
      Object.values(cut).some(x=>Object.values(x).some(h=>valid(h))))
      throw Error('FUGA AUX HOY PREVIA');
     const ranks=buildAuxIndependent(date,turn,cut,auxRefs[mode]);
     routes.push(...routesFromAux(ranks,date,turn,
      mode==='anterior'?'AUX_AYER':'AUX_HOY'));
    }
    const postHeads:Head[]=JURS.filter(j=>j!=='Montevideo').map(j=>({
     jur:j,head:today[turn]?.[j]||''
    })).filter(x=>valid(x.head));
    const preview={date,turn,routes};
    const summary=evaluateParallelPOST(preview,postHeads);
    const selected=figuresInTop(routes);
    const currentAux=[
     ...auxiliaryWitnesses([{date,period:'D−1',aux:extractAuxHistoryMode(
      date,source.get(auxiliarySourceDate(date))!.heads,earlier,'anterior')}],
      'AUX_AYER'),
     ...auxiliaryWitnesses([{date,period:'D−1',aux:extractAuxHistoryMode(
      date,source.get(date)!.heads,earlier,'intrajornada')}],
      'AUX_HOY')
    ];
    const known=[
     ...plus11Witnesses([...historic11,...winnerRoots(date,pre)]),
     ...historicAux,...currentAux
    ];
    if(known.some(x=>x.date>date))throw Error('FUGA testigo futuro');
    const support=postSupportMetrics(selected,known,date,postHeads);
    // Todas las VT3 AUX físicamente posibles, incluso FUERA del Top10.
    const ext=(mothers:ReturnType<typeof mothersFromTop>)=>{
     const snapshot=buildExtensionSnapshot(date,turn,mothers,
      auxBoards.AUX_AYER,auxBoards.AUX_HOY,selected,known);
     return {snapshot,post:evaluateSnapshotPOST(snapshot,postHeads),
      equal:equalBudgetComparison(snapshot,postHeads)};
    };
    const extension={lalo:ext(mothersFromTop(selected,['LALO'])),
     combined:ext(mothersFromTop(selected))};
    // Clasificar ANTES de evaluar: no entra resultado del turno objetivo
    // al radar ni a los pares de control.
    const priorPhotos=days.slice(-6).map(p=>({
     date:p.date,turn,figures:p.cuts[i].selected
    }));
    const alert=prepareChangeAlerts({date,turn,figures:selected},priorPhotos,known);
    const matched=matchedControls(alert,selected,postHeads);
    const outcomes=evaluateChangeAlertsPOST(alert,selected,postHeads);
    cuts.push({turn,summary,selected,support,alert,matched,outcomes,extension});
   }
   const last=cuts.at(-1)!;
   const older=days.slice(-6).map(p=>({
    date:p.date,turn:'Nocturno',figures:p.cuts.at(-1)!.selected
   }));
   const pulse=summarizePulses(pulsesForSnapshot({
    date,turn:'Nocturno',figures:last.selected
   },older));
   days.push({date,cuts,pulse});
   console.log('TRES_HOJAS_DAY',date,JSON.stringify(cuts.map(x=>({
    turn:x.turn,
    VT2:x.summary.byKind.VT2.headHitsByBoard,
    VT3:x.summary.byKind.VT3.headHitsByBoard,
    shared2:x.summary.byKind.VT2.sharedFamilies2+
     x.summary.byKind.VT2.sharedFamilies3
   }))));
  }catch(e){
   if(/FUGA/.test(String(e)))throw e;
   skipped.push({date,reason:String(e).slice(0,180)});
   console.log('TRES_HOJAS_SKIP',date,String(e).slice(0,180));
  }
 }
 const cuts=days.flatMap(d=>d.cuts.map(c=>({date:d.date,turn:c.turn,...c})));
 const byTurn=Object.fromEntries(TURNOS.map(t=>{
  const sub=cuts.filter(c=>c.turn===t);
  return [t,Object.fromEntries(['VT2','VT3'].map(k=>{
   const kind=k as 'VT2'|'VT3';
   return [kind,{
    cuts:sub.length,heads:summed(sub.map(x=>x.summary),x=>x.byKind[kind].heads),
    familiesExposed:Object.fromEntries(['PLUS11','AUX_AYER','AUX_HOY'].map(b=>
     [b,summed(sub.map(x=>x.summary),x=>x.byKind[kind].uniqueFamilies[b as Board])])),
    physicalSitesExposed:Object.fromEntries(['PLUS11','AUX_AYER','AUX_HOY'].map(b=>
     [b,summed(sub.map(x=>x.summary),x=>x.byKind[kind].selectedFigures[b as Board])])),
    hitsByBoard:Object.fromEntries(['PLUS11','AUX_AYER','AUX_HOY'].map(b=>
     [b,summed(sub.map(x=>x.summary),x=>x.byKind[kind].headHitsByBoard[b as Board])])),
    winsExclusive:summed(sub.map(x=>x.summary),x=>x.byKind[kind].headHitsOneBoard),
    winsShared2:summed(sub.map(x=>x.summary),x=>x.byKind[kind].headHitsTwoBoards),
    winsShared3:summed(sub.map(x=>x.summary),x=>x.byKind[kind].headHitsThreeBoards),
    winsNone:summed(sub.map(x=>x.summary),x=>x.byKind[kind].headHitsZeroBoards),
    sharedFam2:summed(sub.map(x=>x.summary),x=>x.byKind[kind].sharedFamilies2),
    sharedFam3:summed(sub.map(x=>x.summary),x=>x.byKind[kind].sharedFamilies3),
   }];
  }))];
 }));
 const boardContinuity=Object.fromEntries(['PLUS11','AUX_AYER','AUX_HOY'].flatMap(
  board=>['VT2','VT3'].map(kind=>{
   const changes:any[]=[];
   for(const day of days){
    for(let i=1;i<day.cuts.length;i++){
     const previous=day.cuts[i-1].selected.filter(f=>f.board===board&&f.kind===kind);
     const current=day.cuts[i].selected.filter(f=>f.board===board&&f.kind===kind);
     const s=compareSnapshots(previous,current);
     changes.push({date:day.date,turn:day.cuts[i].turn,
      sitesBefore:previous.length,sitesNow:current.length,
      kept:s.persistentExact,new:s.newSites,moved:s.moveOneRow,
      sameNumber:s.retainedSameFamily});
    }
   }
   return [board+'_'+kind,{turnTransitions:changes.length,
    sitesNow:changes.reduce((n,x)=>n+x.sitesNow,0),
    kept:changes.reduce((n,x)=>n+x.kept,0),
    new:changes.reduce((n,x)=>n+x.new,0),
    recent:changes.slice(-4)}];
  })
 ));

 const supportSummary=Object.fromEntries(
  ['PLUS11','AUX_AYER','AUX_HOY'].flatMap(board=>
   (['VT2','VT3'] as const).map(kind=>{
    const key=board+'_'+kind;
    const records=cuts.map(x=>x.support[key] as any);
    const sum=(fn:(x:any)=>number)=>records.reduce((n,x)=>n+fn(x),0);
    return [key,{
     cuts:records.length,physicalSiteExposures:sum(x=>x.figures),
     withExactHistoricWinner:sum(x=>x.withExactRoots),
     withDistinctWinningDays2:sum(x=>x.withRepeatedDays),
     headHitsSupportedOnly:sum(x=>x.headWins.onlySupported),
     headHitsUnmarkedOnly:sum(x=>x.headWins.onlyUnsupported),
     headHitsBoth:sum(x=>x.headWins.both),
     headHitsNeither:sum(x=>x.headWins.neither),
     examples:records.slice(-1).flatMap(x=>x.examples)
    }];
   })
  )
 );
 const pulseSummary=Object.fromEntries(['PLUS11','AUX_AYER','AUX_HOY']
  .flatMap(board=>(['VT2','VT3'] as const).map(kind=>{
   const key=board+'_'+kind;
   const a=days.map(x=>x.pulse[key] as any);
   const sum=(name:string)=>a.reduce((v,x)=>v+Number(x[name]||0),0);
   return [key,{daySnapshots:a.length,
    sites:sum('sites'),withEnoughHistory:sum('withEnoughHistory'),
    newAfter3:sum('newAfter3'),previousDay:sum('previousDay'),
    atLeast3Days:sum('atLeast3Days'),
    recent:a.slice(-3).map(x=>x.topExamples)}];
  })));
 const alertSummary=Object.fromEntries(['VT2','VT3'].map(kind=>{
  const same=cuts.map(c=>({c,alerts:c.alert.proposed.filter(x=>x.kind===kind),
   focus:c.alert.focus.filter(x=>x.kind===kind),
   scored:c.outcomes.focus.filter(x=>x.kind===kind),
   paired:c.matched.pairs.filter(x=>x.signal.kind===kind)}));
  const total=(fn:(x:typeof same[number])=>number)=>
   same.reduce((n,r)=>n+fn(r),0);
  const boardBreakdown=Object.fromEntries(['PLUS11','AUX_AYER','AUX_HOY'].map(board=>
   [board,{all:total(x=>x.alerts.filter(y=>y.board===board).length),
    focused:total(x=>x.focus.filter(y=>y.board===board).length),
    focusedHit:total(x=>x.scored.filter(y=>y.board===board&&y.hit).length),
    matchedPairs:total(x=>x.paired.filter(y=>y.signal.board===board).length),
    controlHits:total(x=>x.paired.filter(y=>y.signal.board===board&&y.controlHit).length),
    pairSignalHits:total(x=>x.paired.filter(y=>y.signal.board===board&&y.signalHit).length)}]));
  const exact=total(x=>x.paired.filter(y=>y.match==='EXACTO').length);
  const matchedPairs=total(x=>x.paired.length);
  return [kind,{
   cuts:same.length,alertsTotal:total(x=>x.alerts.length),
   focusedTotal:total(x=>x.focus.length),
   focusedHits:total(x=>x.scored.filter(y=>y.hit).length),
   totalPairs:matchedPairs,exactGeometryPairs:exact,
   relaxedPairs:matchedPairs-exact,
   pairedAlertHits:total(x=>x.paired.filter(y=>y.signalHit).length),
   pairedControlHits:total(x=>x.paired.filter(y=>y.controlHit).length),
   pairedSignalOnly:total(x=>x.paired.filter(y=>y.signalHit&&!y.controlHit).length),
   pairedControlOnly:total(x=>x.paired.filter(y=>!y.signalHit&&y.controlHit).length),
   pairedBoth:total(x=>x.paired.filter(y=>y.signalHit&&y.controlHit).length),
   pairedNeither:total(x=>x.paired.filter(y=>!y.signalHit&&!y.controlHit).length),
   exactGeometrySignalHits:total(x=>x.paired.filter(y=>y.match==='EXACTO'&&y.signalHit).length),
   exactGeometryControlHits:total(x=>x.paired.filter(y=>y.match==='EXACTO'&&y.controlHit).length),
   unmatchedFocus:total(x=>x.c.matched.unmatched),
   byBoard:boardBreakdown,
   alertsByType:Object.fromEntries([
    'NACE_CON_TESTIGO','REAPARECE_CON_TESTIGO',
    'REFUERZO_REAL_INTRADIA','MADRE_CON_EXTENSION_AUXILIAR'
   ].map(flag=>[flag,total(x=>x.alerts.filter(y=>
    y.alertKinds.includes(flag as any)).length)]))
  }];
 }));
 const periodComparison=Object.fromEntries(
  ['12-20 OCT','21-28 OCT'].map(period=>{
   const sub=cuts.filter(c=>period==='12-20 OCT'?
    c.date<='2026-10-20':c.date>='2026-10-21');
   return [period,Object.fromEntries(['VT2','VT3'].map(kind=>{
    const focused=sub.flatMap(x=>x.outcomes.focus.filter(h=>h.kind===kind));
    const pair=sub.flatMap(x=>x.matched.pairs.filter(h=>h.signal.kind===kind));
    return [kind,{
     cuts:sub.length,focused:focused.length,
     focusedHits:focused.filter(x=>x.hit).length,
     paired:pair.length,
     signalHits:pair.filter(x=>x.signalHit).length,
     controlHits:pair.filter(x=>x.controlHit).length,
     exact:pair.filter(x=>x.match==='EXACTO').length
    }];
   }))];
  })
 );
 const extensionSummary=Object.fromEntries(
  (['lalo','combined'] as const).map(cohort=>{
   const sub=cuts.map(x=>({
    date:x.date,turn:x.turn,
    e:x.extension[cohort],
    real:x.summary.hits.filter(h=>h.kind==='VT3')
   }));
   const statuses=['AMBAS','SOLO_AYER','SOLO_HOY','NINGUNA'] as const;
   const stats=(rows:typeof sub)=>{
    const sum=(fn:(x:typeof sub[number])=>number)=>
     rows.reduce((n,x)=>n+fn(x),0);
    return {
     cuts:rows.length,mothers:sum(x=>x.e.post.mothers),
     motherHeads:sum(x=>x.e.post.motherHeads),
     optionsByStatus:Object.fromEntries(statuses.map(k=>
      [k,sum(x=>x.e.post.candidates[k])])),
     winnersByStatus:Object.fromEntries(statuses.map(k=>
      [k,sum(x=>x.e.post.winnerReadings[k])])),
     conditionalExpected:Object.fromEntries(statuses.map(k=>
      [k,Number(sum(x=>x.e.post.conditionalExpected[k]).toFixed(3))])),
     bothWithoutTop10:sum(x=>x.e.snapshot.mothers.reduce((n,g)=>
      n+g.options.filter(o=>o.status==='AMBAS'&&
       o.rankVT3Ayer===null&&o.rankVT3Hoy===null).length,0)),
     hitsBothWithoutTop10:sum(x=>x.e.snapshot.mothers.reduce((n,g)=>
      n+x.real.filter(h=>g.options.some(o=>o.value===h.ending&&
       o.status==='AMBAS'&&o.rankVT3Ayer===null&&
       o.rankVT3Hoy===null)).length,0)),
     equalBudget:{
      pairs:sum(x=>x.e.equal.pairs),
      bothHits:sum(x=>x.e.equal.bothHits),
      singleHits:sum(x=>x.e.equal.singleHits),
      bothOnly:sum(x=>x.e.equal.bothOnly),
      singleOnly:sum(x=>x.e.equal.singleOnly)
     }
    };
   };
   return [cohort,{
    all:stats(sub),
    byTurn:Object.fromEntries(TURNOS.map(t=>
     [t,stats(sub.filter(x=>x.turn===t))])),
    first:stats(sub.filter(x=>x.date<='2026-10-20')),
    second:stats(sub.filter(x=>x.date>='2026-10-21'))
   }];
  })
 );
 const report={
  periodComparison,
  extensionSummary,
  method:'PRE_RECONSTRUIDO_NO_SELLADO; 3 HOJAS SEPARADAS; VT2 VT3 IGUAL IMPORTANCIA',
  period:{label,from,to},
  days:days.length,cuts:cuts.length,skipped,
  byTurn,boardContinuity,supportSummary,pulseSummary,alertSummary,
  totalExtensions:cuts.reduce((n,c)=>n+c.summary.extensionCount,0),
  crossBoardExtensions:cuts.reduce((n,c)=>n+c.summary.crossBoardExtensions,0),
  lastThree:days.slice(-3).map(d=>({date:d.date,pulse:d.pulse,cuts:d.cuts.map(c=>({
   turn:c.turn,byKind:c.summary.byKind,support:c.support,
   expandedVT3:{
    lalo:{
     mothers:c.extension.lalo.snapshot.mothers.length,
     counts:c.extension.lalo.post.candidates,
     winnerByStatus:c.extension.lalo.post.winnerReadings,
     examples:c.extension.lalo.snapshot.mothers
      .filter(g=>g.counts.AMBAS>0).slice(0,4).map(g=>({
       mother:g.family,rank:g.ranks,
       alternatives:g.options.filter(o=>o.status==='AMBAS')
        .slice(0,3).map(o=>({value:o.value,
         rankAyer:o.rankVT3Ayer,rankHoy:o.rankVT3Hoy,
         witnessesAyer:o.winnerEventsAyer,
         witnessesHoy:o.winnerEventsHoy,
         routeAyer:o.exampleAyer,routeHoy:o.exampleHoy}))
      }))
    },
    combined:{
     mothers:c.extension.combined.snapshot.mothers.length,
     counts:c.extension.combined.post.candidates,
     winnerByStatus:c.extension.combined.post.winnerReadings
    }
   },
   alerts:c.alert.focus,alertCount:c.alert.proposed.length,
   alertPOST:c.outcomes.focus,matchedControls:{
    pairs:c.matched.pairs.length,
    exact:c.matched.exactGeometry,
    relaxed:c.matched.relaxedGeometry,
    unmatched:c.matched.unmatched},
   shared:c.summary.shared.filter(s=>s.boards.length>=2).slice(0,20),
   extensions:c.summary.examples,
   physicalSites:c.selected.length
  }))})),
  precautions:[
   'La coincidencia de familia entre tableros es una referencia de lectura actual, nunca un recorrido mixto.',
   'Una cabeza se cuenta una sola vez por longitud y jurisdicción, aunque haya muchas rutas.',
   'Tres motores de +11 cuentan como UNA hoja en el apoyo inter-tablero.',
   'AUX AYER usa el día sorteable anterior; AUX HOY utiliza únicamente las franjas terminadas antes del turno objetivo.',
   'Formas Primero y MV1 se mantienen independientes; ambos se incluyen para localizar recorridos en sus Top10.',
   'La relación VT2→VT3 exige que ambos recorridos existan físicamente en sus hojas respectivas.',
   'El laboratorio no propone apuestas ni valida mejora predictiva: compara cubrimiento PRE contra POST en replay histórico.'
  ]
 };
 fs.mkdirSync('auditorias/radar-tres-hojas',{recursive:true});
 fs.writeFileSync('auditorias/radar-tres-hojas/'+label+'.json',
  JSON.stringify(report,null,2)+'\n');
 console.log('TRES_HOJAS_SUMMARY',JSON.stringify({
  label,days:report.days,cuts:report.cuts,skipped:skipped.length,
  byTurn:report.byTurn,boardContinuity:report.boardContinuity,
  totalExtensions:report.totalExtensions,
  crossBoardExtensions:report.crossBoardExtensions,
  alertSummary:report.alertSummary,
  periodComparison:report.periodComparison,
  extensionSummary:report.extensionSummary
 }));
 if(days<8)throw Error('Menos de 8 jornadas válidas '+days);
}
main().catch(e=>{console.error('TRES_HOJAS_ERROR',e);process.exitCode=1});
