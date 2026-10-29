/**
 * Comparación por huellas VT2 en Nocturna. La identidad de la familia se
 * conserva solo para poder verificar contra resultados reales, nunca para
 * medir la continuidad de figura entre fechas.
 * Periodos ejecutados por CI en paralelo (dos meses / octubre).
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {inspectSlots,overlap} from '../src/labHuellasPorPuesto';
import type {SlotFootprint} from '../src/labHuellasPorPuesto';
const from=process.env.HUELLAS_FROM||'2026-10-12';
const through=process.env.HUELLAS_TO||'2026-10-28';
const label=process.env.HUELLAS_LABEL||'octubre';
const getCache=new Map<string,Promise<CabezasDia>>();
const get=(date:string)=>{
 if(!getCache.has(date))getCache.set(date,descargarCabezas(date,true));
 return getCache.get(date)!;
};
const completeCache=new Map<string,Promise<{date:string;heads:CabezasDia;sheet:ReturnType<typeof buildSheet>}>>();
const complete=async(date:string)=>{
 if(!completeCache.has(date))completeCache.set(date,(async()=>{
  const [heads,base]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(base.missing.length)throw Error('Base incompleta '+date);
  return {date,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return completeCache.get(date)!;
};
const actualNoct=(heads:CabezasDia)=>JURS.filter(j=>j!=='Montevideo')
 .map(jur=>({jur,head:heads.Nocturno[jur]}))
 .filter(x=>/^\d{4}$/.test(x.head));
type Day={date:string;slots:SlotFootprint[];headCount:number};
async function main(){
 const days:Day[]=[];
 const skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=through;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  try{
   const [actual,history,base]=await Promise.all([
    get(date),loadPreviousDraws(date,6,get),nocturnaAnteriorPorJur(date,get,20)
   ]);
   const validAll=TURNOS.reduce((n,t)=>n+
    JURS.filter(j=>j!=='Montevideo'&&/^\d{4}$/.test(actual[t][j]||'')).length,0);
   if(validAll<20||actualNoct(actual).length<4){
    skipped.push({date,reason:'Jornada parcial '+validAll});continue;
   }
   if(base.missing.length){skipped.push({date,reason:'Base incompleta'});continue;}
   const past=await Promise.all(history.map(h=>complete(h.date)));
   const weekDate=shiftDay(date,-7);
   const week=past.find(p=>p.date===weekDate)||await complete(weekDate);
   const refs:LaloHistorical[]=[
    {date:past.at(-1)!.date,period:'D−1',sheet:past.at(-1)!.sheet},
    ...(hasDrawResults(week.heads)&&weekDate<date?[{
     date:weekDate,period:'D−7' as const,sheet:week.sheet}]:[])
   ];
   const earlier=diaVacio();
   for(const turn of TURNOS.slice(0,4))earlier[turn]={...actual[turn]};
   const masked=preSheetAtCut(buildSheet(earlier,base.heads),'Nocturno',4);
   if(masked.heads.Nocturno?.length||masked.matches.Nocturno?.length)
    throw Error('FUGA posterior en PRE');
   const ranks=buildMotorLalo(masked,date,'Nocturno',refs);
   const slots=inspectSlots(ranks.ranks.vt2,actualNoct(actual));
   if(slots.length!==10||slots.some((x,i)=>x.rank!==i+1||
     x.paths.some(p=>p.coords.some(c=>masked.columns.find(s=>s.id===p.source)?.values[c.row]?.[c.col]!==c.digit))))
    throw Error('Inconsistencia física PRE '+date);
   days.push({date,slots,headCount:actualNoct(actual).length});
  }catch(e){
   const reason=String(e);
   if(/FUGA|Inconsistencia/.test(reason))throw e;
   skipped.push({date,reason:reason.slice(0,130)});
  }
  if(days.length%8===0)console.log('HUELLAS_PROGRESO',label,days.length,date);
 }
 type Pair={date:string;past:string;slots:Record<string,unknown>[]};
 const lookup=new Map(days.map(d=>[d.date,d]));
 const pairs:Pair[]=[];
 for(const d of days){
  const prev=lookup.get(shiftDay(d.date,-7));if(!prev)continue;
  const slots=d.slots.map((slot,i)=>{
   const previous=prev.slots[i],cross=overlap(slot,previous);
   const other=prev.slots.filter((_,idx)=>idx!==i).map(o=>overlap(slot,o));
   const pastWinShapes=new Set(previous.hits.flatMap(h=>h.physicalShapes));
   const pastWinSites=new Set(previous.hits.flatMap(h=>h.physicalSites));
   const nowSites=new Set(slot.paths.map(p=>p.site));
   const nowShapes=new Set(slot.paths.map(p=>p.signature));
   return {
    rank:slot.rank,priorHit:previous.hits.length>0,
    hit:slot.hits.length>0,heads:slot.hits.map(h=>h.head),
    priorFamily:previous.family,currentFamily:slot.family,
    sameNumber:previous.family===slot.family,
    ...cross,
    baselineSiteOverlapOthers:other.reduce((a,b)=>a+b.siteJaccard,0)/Math.max(1,other.length),
    baselineShapeOverlapOthers:other.reduce((a,b)=>a+b.shapeJaccard,0)/Math.max(1,other.length),
    pastWinnerSiteVisible:[...pastWinSites].some(x=>nowSites.has(x)),
    pastWinnerShapeVisible:[...pastWinShapes].some(x=>nowShapes.has(x)),
    sameWinningShape:slot.hits.some(h=>h.physicalShapes.some(x=>pastWinShapes.has(x))),
    sameWinningSite:slot.hits.some(h=>h.physicalSites.some(x=>pastWinSites.has(x)))
   };
  });
  pairs.push({date:d.date,past:prev.date,slots});
 }
 const byRank=Array.from({length:10},(_,i)=>{
  const all=days.map(d=>d.slots[i]),paired=pairs.map(p=>p.slots[i]) as any[];
  const hits=all.reduce((n,s)=>n+s.hits.length,0);
  const wins=all.filter(s=>s.hits.length>0).length;
  const mean=(key:string)=>paired.reduce((n,s)=>n+Number(s[key]||0),0)/Math.max(1,paired.length);
  const sum=(key:string)=>paired.filter(s=>s[key]).length;
  return {rank:i+1,heads:hits,daysWithHit:wins,totalDays:days.length,
    siteExposure:all.reduce((n,s)=>n+s.uniqueSites,0),
    meanSources:all.reduce((n,s)=>n+s.uniqueSources,0)/Math.max(1,all.length),
    shapesMean:all.reduce((n,s)=>n+s.distinctShapeSignatures.length,0)/Math.max(1,all.length),
    sameFamilyWeek:sum('sameNumber'),pairedWeeks:paired.length,
    sameDominantWeek:sum('sameDominantShape'),
    meanSiteJaccard:mean('siteJaccard'),
    otherRankSiteControl:mean('baselineSiteOverlapOthers'),
    meanShapeJaccard:mean('shapeJaccard'),
    otherRankShapeControl:mean('baselineShapeOverlapOthers'),
    previousRankHit:sum('priorHit'),bothWeeksHit:paired.filter(s=>s.priorHit&&s.hit).length,
    pastWinnerSiteVisible:sum('pastWinnerSiteVisible'),
    pastWinnerShapeVisible:sum('pastWinnerShapeVisible'),
    sameWinningShape:sum('sameWinningShape'),sameWinningSite:sum('sameWinningSite')
  };
 });
 const sample=days.filter(d=>['2026-10-22','2026-10-23','2026-10-26','2026-10-28'].includes(d.date))
  .map(d=>({date:d.date,seventh:d.slots[6]}));
 const result={label,from,through,days:days.length,
  pairs:pairs.length,heads:days.reduce((n,d)=>n+d.headCount,0),
  ranks:byRank,samples:sample,daysData:days,pairsData:pairs,skipped,
  method:'PRE_RECONSTRUIDO_NO_SELLADO; FORMAS POR PUESTO; D-7 MISMO DIA DE SEMANA',
  note:'La identidad numérica solo permite cotejo POST. Puesto = familia con multiples huellas. Huellas fisicas y aciertos contados sin fusionar varias rutas como eventos independientes.'};
 const dir='auditorias/huellas-por-puesto';
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/huellas-'+label+'.json',JSON.stringify(result,null,2)+'\n');
 console.log('HUELLAS_RESUMEN',JSON.stringify({label,days:result.days,pairs:result.pairs,
  heads:result.heads,ranks:byRank,skipped:skipped.length}));
 console.log('HUELLAS_SAMPLES',JSON.stringify(sample.map(s=>({
  date:s.date,rank:s.seventh.rank,family:s.seventh.family,
  shapes:s.seventh.distinctShapeSignatures,hits:s.seventh.hits,
  paths:s.seventh.uniqueSites,source:s.seventh.uniqueSources,
  dominant:s.seventh.dominantShape
 }))));
}
main().catch(e=>{console.error('HUELLAS_ERROR',e);process.exitCode=1;});
