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
import {auxCanonicalPath} from '../src/auxSantiagoNeuquen';

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
  selected:ReturnType<typeof figuresInTop>}[]}[]=[];
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
    cuts.push({turn,summary,selected});
   }
   days.push({date,cuts});
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
 const report={
  method:'PRE_RECONSTRUIDO_NO_SELLADO; 3 HOJAS SEPARADAS; VT2 VT3 IGUAL IMPORTANCIA',
  period:{label,from,to},
  days:days.length,cuts:cuts.length,skipped,
  byTurn,boardContinuity,
  totalExtensions:cuts.reduce((n,c)=>n+c.summary.extensionCount,0),
  crossBoardExtensions:cuts.reduce((n,c)=>n+c.summary.crossBoardExtensions,0),
  lastThree:days.slice(-3).map(d=>({date:d.date,cuts:d.cuts.map(c=>({
   turn:c.turn,byKind:c.summary.byKind,
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
  crossBoardExtensions:report.crossBoardExtensions
 }));
 if(days<8)throw Error('Menos de 8 jornadas válidas '+days);
}
main().catch(e=>{console.error('TRES_HOJAS_ERROR',e);process.exitCode=1});
