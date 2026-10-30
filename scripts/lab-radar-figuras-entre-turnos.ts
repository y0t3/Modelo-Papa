/**
 * Rastreo visual de TOPS sin perseguir cifras.
 * Mide si las MISMAS HUELLAS forman parte de Tops en turnos sucesivos
 * (no solo si siguen siendo físicamente posibles, que es casi trivial).
 * Las coincidencias exactas por casilla se leen exclusivamente en POST.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo} from '../src/motorLalo';
import {buildExperimentalVt2} from '../src/experimentalVt2';
import {figuresInTop,compareSnapshots} from '../src/labRadarFiguras';
import type {Figure,ShapeRoute,Kind,Source} from '../src/labRadarFiguras';
const from=process.env.FORMS_FROM||'2026-10-12';
const through=process.env.FORMS_TO||'2026-10-28';
const label=process.env.FORMS_LABEL||'octubre';
const getCache=new Map<string,Promise<any>>();
const get=(date:string)=>{
 if(!getCache.has(date))getCache.set(date,descargarCabezas(date,true));
 return getCache.get(date)!;
};
const fullCache=new Map<string,Promise<any>>();
const full=(date:string)=>{
 if(!fullCache.has(date))fullCache.set(date,(async()=>{
  const [heads,base]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(base.missing.length)throw Error('Base faltante '+date);
  return {date,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return fullCache.get(date)!;
};
const valid=(head:string)=>/^\d{4}$/.test(head);
function exactMatches(figures:Figure[],heads:string[],kind:Kind){
 const n=kind==='VT2'?2:kind==='VT3'?3:4;
 return heads.filter(h=>valid(h)&&figures.some(f=>f.kind===kind&&f.readings.some(r=>
  h.slice(-n)===r||h.slice(-n)===[...r].reverse().join('')))).length;
}
const sum=(items:any[],key:string)=>items.reduce((n,x)=>n+Number(x[key]||0),0);
async function main(){
 const days:any[]=[];
 const skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=through;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  try{
   const [actual,history,base]=await Promise.all([
    get(date),loadPreviousDraws(date,6,get),
    nocturnaAnteriorPorJur(date,get,20)
   ]);
   const previous=await Promise.all(history.map(h=>full(h.date)));
   const prevWeekDate=shiftDay(date,-7);
   const lastWeek=previous.find(x=>x.date===prevWeekDate)||await full(prevWeekDate);
   const refs=[{date:previous.at(-1)!.date,period:'D−1' as const,
    sheet:previous.at(-1)!.sheet},
    ...(hasDrawResults(lastWeek.heads)?[{
     date:prevWeekDate,period:'D−7' as const,sheet:lastWeek.sheet}]:[])
   ];
   const available=TURNOS.reduce((n,t)=>n+JURS.filter(j=>j!=='Montevideo'&&
    valid(actual[t]?.[j]||'')).length,0);
   if(available<20||base.missing.length){
    skipped.push({date,reason:'Parcial/nocturna anterior ausente'});continue;
   }
   const cuts:any[]=[];
   for(let i=0;i<TURNOS.length;i++){
    const turn=TURNOS[i];
    const pastOnly=diaVacio();
    for(const prior of TURNOS.slice(0,i))pastOnly[prior]={...actual[prior]};
    const pre=preSheetAtCut(buildSheet(pastOnly,base.heads),turn,i);
    if(pre.heads[turn]?.length||pre.matches[turn]?.length)
     throw Error('FUGA POST '+date+' '+turn);
    const lalo=buildMotorLalo(pre,date,turn,refs);
    const other=buildExperimentalVt2(pre,date,turn,
     previous.map(p=>({date:p.date,sheet:p.sheet,period:'D−1' as const})));
    const routes:ShapeRoute[]=[];
    for(const kind of ['vt2','vt3'] as const)
     lalo.ranks[kind].slice(0,10).forEach((family,k)=>
      family.paths.forEach(p=>{
       if(p.path.length!==(kind==='vt2'?2:3))return;
       routes.push({date,turn,board:'PLUS11',
        engine:'LALO',kind:kind.toUpperCase() as Kind,
        rank:k+1,family:family.family,
        reading:p.path.map(c=>c.digit).join(''),
        source:p.sourceId,cells:p.path.map(c=>({row:c.row,col:c.col}))});
      }));
    for(const [engine,items] of [
     ['GEOMETRIA',other.geometric],['CONECTADAS',other.connected]
    ] as [Source,typeof other.geometric][])
     items.slice(0,10).forEach((item,k)=>routes.push({
      date,turn,board:'PLUS11',engine,kind:'VT2',rank:k+1,
      family:item.family,reading:item.value,source:item.source,
      cells:item.cells.map(x=>{
       const [row,col]=x.split(':').map(Number);
       return {row,col};
      })
     }));
    const figures=figuresInTop(routes);
    const heads=JURS.filter(j=>j!=='Montevideo')
     .map(j=>actual[turn][j]||'').filter(valid);
    cuts.push({turn,figures,
     counts:{vt2:figures.filter(f=>f.kind==='VT2').length,
      vt3:figures.filter(f=>f.kind==='VT3').length},
     actualHeadCount:heads.length,
     post:{vt2:exactMatches(figures,heads,'VT2'),
      vt3:exactMatches(figures,heads,'VT3')},
     // Testimonio ilustrativo: cifras SOLO leídas POST, sin prioridades por ellas
     topOverlap:figures.filter(f=>f.engines.length>=2).slice(0,5).map(f=>({
      source:f.source,shape:f.shape,site:f.site,
      engines:f.engines,families:f.families
     }))});
   }
   const transitions=cuts.slice(1).map((x,i)=>{
    const old=cuts[i],now=x;
    return {
     ...compareSnapshots(old.figures,now.figures),
     fromTurn:old.turn,toTurn:now.turn,
     preNewTopVt2:now.figures.filter((f:Figure)=>f.kind==='VT2'&&
      !old.figures.some((p:Figure)=>p.kind===f.kind&&p.board===f.board&&
       p.source===f.source&&p.site===f.site)).length,
     postExactVt2AmongRetained:exactMatches(now.figures.filter((f:Figure)=>
      f.kind==='VT2'&&old.figures.some((p:Figure)=>p.kind===f.kind&&
       p.source===f.source&&p.site===f.site)),
      JURS.filter(j=>j!=='Montevideo').map(j=>actual[now.turn][j]||''),'VT2')
    };
   });
   days.push({date,cuts,transitions});
  }catch(e){
   if(String(e).includes('FUGA'))throw e;
   skipped.push({date,reason:String(e).slice(0,120)});
  }
  if(days.length%8===0)console.log('FORM_RADAR_PROGRESS',label,date,days.length);
 }
 const byDate=new Map(days.map(d=>[d.date,d]));
 const nocturnoFigures=(d:any,k:'VT2'|'VT3')=>
  (d?.cuts.at(-1)?.figures||[]).filter((f:Figure)=>f.kind===k) as Figure[];
 const crossDay:any[]=[];
 const previousDraw=(date:string)=>days.filter(d=>d.date<date).at(-1);
 for(const day of days){
  for(const kind of ['VT2','VT3'] as const){
   const current=nocturnoFigures(day,kind);
   for(const [period,other] of [
    ['DIA_ANTERIOR',previousDraw(day.date)],
    ['MISMO_DIA_SEMANA_D7',byDate.get(shiftDay(day.date,-7))],
    ['CONTROL_SEMANA_D14',byDate.get(shiftDay(day.date,-14))]
   ] as [string,any][]){
    if(!other)continue;
    const old=nocturnoFigures(other,kind);
    const stats=compareSnapshots(old,current);
    crossDay.push({date:day.date,past:other.date,kind,period,
     current:current.length,pastSites:old.length,
     exact:stats.persistentExact,
     sameFamily:stats.retainedSameFamily,
     changedFamily:stats.retainedChangedFamily,
     movedRow:stats.moveOneRow,movedSource:stats.moveSource,
     sampleChanged:current.filter(f=>old.some(p=>p.source===f.source&&
       p.site===f.site&&!p.families.some(x=>f.families.includes(x))))
      .slice(0,4).map(f=>({source:f.source,site:f.site,
       shape:f.shape,ranks:f.bestRanks,readings:f.readings,
       old:old.find(x=>x.source===f.source&&x.site===f.site)?.readings||[]}))}
    );
   }
  }
 }
 const crossDaySummary=Object.fromEntries(
  ['VT2','VT3'].flatMap(kind=>
   ['DIA_ANTERIOR','MISMO_DIA_SEMANA_D7','CONTROL_SEMANA_D14'].map(period=>{
    const sub=crossDay.filter(x=>x.kind===kind&&x.period===period);
    const count=(field:string)=>sub.reduce((n,x)=>n+Number(x[field]||0),0);
    return [kind+'_'+period,{
     pairs:sub.length,selectedPositions:count('current'),
     exact:count('exact'),
     sameFamily:count('sameFamily'),
     changedFamily:count('changedFamily'),
     movedRow:count('movedRow'),movedSource:count('movedSource'),
     recent:sub.slice(-3).map(x=>({date:x.date,exact:x.exact,
      changedFamily:x.changedFamily,sampleChanged:x.sampleChanged.slice(0,2)}))
    }];
   })
  )
 );
 const transitions=days.flatMap(d=>d.transitions);
 const summary={
  label,days:days.length,cuts:days.reduce((n,d)=>n+d.cuts.length,0),
  crossDay:crossDaySummary,
  transitions:transitions.length,
  siteRepetitions:sum(transitions,'persistentExact'),
  rowOne:sum(transitions,'moveOneRow'),
  neighborSource:sum(transitions,'moveSource'),
  unlinked:sum(transitions,'newSites'),
  headMatchesOnPersistingVt2:sum(transitions,'postExactVt2AmongRetained'),
  siteExposureLast:days.map(d=>d.cuts.at(-1)?.figures.length||0)
   .reduce((a,b)=>a+b,0),
  byTransition:Object.fromEntries(TURNOS.slice(1).map((turn,i)=>{
   const subset=transitions.filter(x=>x.toTurn===turn);
   return [turn,{days:subset.length,exact:sum(subset,'persistentExact'),
    newTopVt2:sum(subset,'preNewTopVt2'),
    sameNumericalFamily:sum(subset,'retainedSameFamily'),
    changedNumericalFamily:sum(subset,'retainedChangedFamily'),
    physicalVt2MatchesPOST:sum(subset,'postExactVt2AmongRetained'),
    matchingMultipleEngines:sum(subset,'crossEngineSameSite')}];
  })),
  lastThree:days.slice(-3).map(d=>({date:d.date,
   transitions:d.transitions,cuts:d.cuts.map((c:any)=>({
    turn:c.turn,counts:c.counts,post:c.post,topOverlap:c.topOverlap
   }))}))
 };
 fs.mkdirSync('auditorias/radar-figuras',{recursive:true});
 fs.writeFileSync('auditorias/radar-figuras/'+label+'.json',
  JSON.stringify({summary,days:days.map(d=>({date:d.date,
   cuts:d.cuts.map((c:any)=>({turn:c.turn,counts:c.counts,
    actualHeadCount:c.actualHeadCount,post:c.post,topOverlap:c.topOverlap})),
   transitions:d.transitions})),crossDay,skipped,
   note:'Los recorridos se comparan por casillas/fuente, no familias. Un sitio que sigue físicamente disponible no es prueba de ventaja; top conserva o abandona esa huella antes de POST. Solo +11, AUX pendiente de replay.'},
   null,2)+'\n');
 console.log('FORM_RADAR_SUMMARY',JSON.stringify({label,...summary,
  lastThree:undefined,skipped:skipped.length}));
}
main().catch(e=>{console.error('FORM_RADAR_ERROR',e);process.exitCode=1});
