/**
 * LAB conectividad entre raíces ganadoras D-7. Objetivo Nocturno.
 * Se elige un foco por un DIBUJO con >=2 EVENTOS GANADORES HISTÓRICOS
 * distintos, nunca por coincidencia de familias numéricas.
 * Dos ventanas: D-7 solo Nocturno y D-7 todos los turnos publicados.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {enumerateFigures,matchesSuffix} from '../src/labWinningFootprintTransfer';
import type {Figure,N} from '../src/labWinningFootprintTransfer';
import {historicWinningSites,connectedZones,topFoci,zoneFigures,evaluateZoneSelection} from '../src/labConnectedWinnerFigures';
import type {PastWindow,Zone} from '../src/labConnectedWinnerFigures';
const from=process.env.ZONAS_FROM||'2026-10-12';
const through=process.env.ZONAS_TO||'2026-10-28';
const label=process.env.ZONAS_LABEL||'octubre';
const valid=(x:string)=>/^[0-9]{4}$/.test(x);
const getCache=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{if(!getCache.has(d))getCache.set(d,descargarCabezas(d,true));return getCache.get(d)!};
const completeCache=new Map<string,Promise<{date:string;heads:CabezasDia;sheet:ReturnType<typeof buildSheet>}>>();
const complete=async(date:string)=>{
 if(!completeCache.has(date))completeCache.set(date,(async()=>{
  const [heads,base]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(base.missing.length)throw Error('Sin base D−7 '+date);
  return {date,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return completeCache.get(date)!;
};
const headsFor=(actual:CabezasDia)=>JURS.filter(j=>j!=='Montevideo')
 .map(jur=>({jur,head:actual.Nocturno[jur]||''})).filter(x=>valid(x.head));
const group=(p:Figure)=>p.source+'|'+p.shape;
const stable=(s:string)=>{
 let x=2166136261;for(let i=0;i<s.length;i++)x=Math.imul(x^s.charCodeAt(i),16777619);return x>>>0;
};
/** Comparación con figuras desconectadas de la MISMA FUENTE y SILUETA,
 * con igual número de posiciones si existen; comunicar faltantes siempre. */
function selectIsolatedMatch(selected:Figure[],isolated:Figure[],date:string){
 const controls:Figure[]=[];
 const chosen=new Set(selected.map(f=>f.key));
 let shortfall=0;
 const groups=new Map<string,number>();
 for(const f of selected)groups.set(group(f),(groups.get(group(f))||0)+1);
 for(const [g,n] of groups){
  const eligible=isolated.filter(f=>group(f)===g&&!chosen.has(f.key))
   .sort((a,b)=>stable(date+'|'+a.key)-stable(date+'|'+b.key)||a.key.localeCompare(b.key));
  const xs=eligible.slice(0,n);
  controls.push(...xs);shortfall+=n-xs.length;
 }
 return {figures:controls,shortfall,required:selected.length};
}
type Evaluated=ReturnType<typeof evaluateZoneSelection>;
type Choice={observed:number;expected:number;selectedSites:number;zones:number;
 matchedControlHits:number;matchedControlShortfall:number;matchedControlSites:number};
type Case={date:string;past:string;heads:{jur:string;head:string}[];
 summary:Record<string,{
  marks:number;regions:number;connectedZones:number;isolatedZones:number;
  coveredSites:number;largestEvents:number;largestSites:number;
  biggestCellCount:number;multiEventHeadCoverage:number;
  all:Choice;connected:Choice;top2:Choice;
  exampleZones:{source:string;rows:string;events:number;sites:number;
    sharedPairs:number;touchPairs:number;witnesses:string[];values:string[]}[];
 }>};
const makeChoice=(z:Zone[],all:Figure[],isolated:Figure[],heads:string[],date:string,n:N):Choice=>{
 const stats=evaluateZoneSelection(z,all,heads,n);
 const matched=selectIsolatedMatch(zoneFigures(z),isolated,date);
 const matchedControlHits=heads.filter(h=>matched.figures.some(f=>matchesSuffix(f,h,n))).length;
 return {observed:stats.observed,expected:stats.expected,
  selectedSites:stats.selectedSites,zones:z.length,matchedControlHits,
  matchedControlShortfall:matched.shortfall,matchedControlSites:matched.figures.length};
};
async function main(){
 const cases:Case[]=[],skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=through;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  try{
   const weekDate=shiftDay(date,-7);
   const [today,lastWeek,base]=await Promise.all([
    get(date),complete(weekDate),nocturnaAnteriorPorJur(date,get,20)
   ]);
   const heads=headsFor(today);
   const validCount=TURNOS.reduce((n,t)=>n+JURS.filter(j=>j!=='Montevideo'&&
    valid(today[t]?.[j]||'')).length,0);
   if(validCount<20||heads.length<4||!hasDrawResults(lastWeek.heads)){
    skipped.push({date,reason:'Jornada parcial o D−7 sin resultados'});continue;
   }
   if(base.missing.length){skipped.push({date,reason:'Faltan cabezas Nocturna base'});continue;}
   const earlier=diaVacio();
   for(const turn of TURNOS.slice(0,4))earlier[turn]={...today[turn]};
   const pre=preSheetAtCut(buildSheet(earlier,base.heads),'Nocturno',4);
   if(pre.heads.Nocturno.length||pre.matches.Nocturno.length)
    throw Error('FUGA POST: objetivo en PRE '+date);
   const summary={} as Case['summary'];
   for(const n of [2,3] as N[]){
    const all=enumerateFigures(pre,n);
    for(const window of ['NOCTURNO','TODOS'] as PastWindow[]){
     const roots=historicWinningSites(lastWeek.sheet,weekDate,n,window);
     if(roots.some(r=>r.witnesses.some(w=>w.date!==weekDate||w.date>=date)))
      throw Error('FUGA TEMPORAL en testigos');
     const regions=connectedZones(roots,all);
     const connected=regions.filter(z=>z.events>=2&&z.positions>=2);
     const disconnected=regions.filter(z=>z.events===1);
     const isolated=zoneFigures(disconnected);
     const foci=topFoci(regions,2);
     const headVals=heads.map(h=>h.head);
     const coverage=headVals.filter(h=>zoneFigures(connected).some(f=>matchesSuffix(f,h,n))).length;
     const key='VT'+n+'_'+window;
     summary[key]={
      marks:roots.length,regions:regions.length,connectedZones:connected.length,
      isolatedZones:disconnected.length,
      coveredSites:zoneFigures(regions).length,
      largestEvents:regions[0]?.events||0,
      largestSites:regions[0]?.positions||0,
      biggestCellCount:regions[0]?.cellCount||0,
      multiEventHeadCoverage:coverage,
      all:makeChoice(regions,all,isolated,headVals,date,n),
      connected:makeChoice(connected,all,isolated,headVals,date,n),
      top2:makeChoice(foci,all,isolated,headVals,date,n),
      exampleZones:foci.map(z=>({
       source:z.source,rows:(z.rowMin+1)+'–'+(z.rowMax+1),
       events:z.events,sites:z.positions,sharedPairs:z.sharedCellPairs,
       touchPairs:z.touchingPairs,
       witnesses:z.witnesses.slice(0,5).map(w=>w.turn+' '+w.jur+' '+w.head),
       values:[...new Set(z.members.map(x=>x.value))].slice(0,16)
      }))
     };
    }
   }
   cases.push({date,past:weekDate,heads,summary});
  }catch(e){
   if(/FUGA/.test(String(e)))throw e;
   skipped.push({date,reason:String(e).slice(0,150)});
  }
  if(cases.length%8===0)console.log('ZONAS_PROGRESS',label,cases.length,date);
 }
 const summary:Record<string,unknown>={};
 for(const key of ['VT2_NOCTURNO','VT2_TODOS','VT3_NOCTURNO','VT3_TODOS']){
  const subset=cases.map(c=>c.summary[key]);
  const num=(k:keyof Case['summary'][string])=>subset.reduce((s,c)=>s+(Number(c[k])||0),0);
  const sums=(which:'all'|'connected'|'top2')=>
   Object.fromEntries(['observed','expected','selectedSites','matchedControlHits',
    'matchedControlShortfall','matchedControlSites','zones'].map(prop=>[
     prop,subset.reduce((s,c)=>s+Number(c[which][prop as keyof Choice]),0)
   ]));
  summary[key]={days:subset.length,marks:num('marks'),regions:num('regions'),
   connectedZones:num('connectedZones'),daysWithConnected:subset.filter(x=>x.connectedZones>0).length,
   daysWithTwoConnected:subset.filter(x=>x.connectedZones>1).length,
   isolatedZones:num('isolatedZones'),
   largeClusterDays:subset.filter(x=>x.largestSites>=6).length,
   regionsWith2Events:subset.reduce((s,c)=>s+c.connectedZones,0),
   all:sums('all'),connected:sums('connected'),top2:sums('top2'),
   byPeriod:Object.fromEntries([...new Set(cases.map(c=>c.date.slice(0,7)))].map(month=>[
    month,Object.fromEntries(['all','connected','top2'].map(sel=>{
     const rows=cases.filter(c=>c.date.startsWith(month)).map(c=>c.summary[key][sel as 'all'|'connected'|'top2']);
     return [sel,{
      observed:rows.reduce((s,c)=>s+c.observed,0),
      expected:rows.reduce((s,c)=>s+c.expected,0),
      selectedSites:rows.reduce((s,c)=>s+c.selectedSites,0),
      control:rows.reduce((s,c)=>s+c.matchedControlHits,0)
     }];
    }))
   ]))}
 }
 const report={method:'PRE_RECONSTRUIDO_NO_SELLADO',label,from,through,days:cases.length,
  heads:cases.reduce((s,c)=>s+c.heads.length,0),skipped,summary,cases,
  note:'Figura primero; una cabeza antigua con muchas rutas suma un solo EVENTO histórico; componentes jamás cruzan columnas; neutral condicionado a fuente y silueta.'};
 fs.mkdirSync('auditorias/figuras-conectadas-d7',{recursive:true});
 fs.writeFileSync('auditorias/figuras-conectadas-d7/'+label+'.json',
  JSON.stringify(report,null,2)+'\n');
 console.log('ZONAS_SUMMARY',JSON.stringify({label,days:report.days,
  skipped:skipped.length,summary}));
}
main().catch(e=>{console.error('ZONAS_ERROR',e);process.exitCode=1;});
