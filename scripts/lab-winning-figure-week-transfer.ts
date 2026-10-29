/**
 * Reconstrucción nocturna por "figuras ganadoras D−7", no por familias numéricas.
 * Solo juegan las huellas de cabezas nocturnas del MISMO día semanal anterior.
 * Recorre VT2 y VT3 independientemente. Evaluación POST al final de cada corte.
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
import {enumerateFigures,winningFigures,moveWinnerFigures,evaluateAgainstShapeControl} from '../src/labWinningFootprintTransfer';
import type {N,Mode,Figure} from '../src/labWinningFootprintTransfer';
const from=process.env.FIG_FROM||'2026-10-12';
const through=process.env.FIG_TO||'2026-10-28';
const label=process.env.FIG_LABEL||'octubre';
const valid=(x:string)=>/^[0-9]{4}$/.test(x);
const getCache=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{if(!getCache.has(d))getCache.set(d,descargarCabezas(d,true));return getCache.get(d)!};
const completeCache=new Map<string,Promise<{date:string;heads:CabezasDia;sheet:ReturnType<typeof buildSheet>}>>();
const complete=async(date:string)=>{
 if(!completeCache.has(date))completeCache.set(date,(async()=>{
  const [heads,base]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(base.missing.length)throw Error('Sin base nocturna '+date);
  return {date,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return completeCache.get(date)!;
};
const modes:Mode[]=['MISMO_SITIO','VERTICAL_1','FUENTE_VECINA','SITIO_O_VERTICAL'];
const headsFor=(actual:CabezasDia)=>JURS.filter(j=>j!=='Montevideo')
 .map(jur=>({jur,head:actual.Nocturno[jur]||''})).filter(x=>valid(x.head));
const group=(f:Figure)=>f.source+'|'+f.shape;
type Case={date:string;past:string;heads:{jur:string;head:string}[];
 data:Record<string,unknown>;pastWinningEvents:Record<string,number>};
async function main(){
 const cases:Case[]=[];
 const skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=through;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  try{
   const pastDate=shiftDay(date,-7);
   const [actual,week,base]=await Promise.all([
    get(date),complete(pastDate),nocturnaAnteriorPorJur(date,get,20)
   ]);
   const heads=headsFor(actual);
   const count=TURNOS.reduce((sum,t)=>sum+JURS.filter(j=>j!=='Montevideo'&&
    valid(actual[t]?.[j]||'')).length,0);
   if(count<20||heads.length<4||!hasDrawResults(week.heads)){
    skipped.push({date,reason:'Jornada incompleta o semana sin sorteo'});continue;
   }
   if(base.missing.length){skipped.push({date,reason:'Nocturna anterior incompleta'});continue}
   const earlier=diaVacio();
   for(const turn of TURNOS.slice(0,4))earlier[turn]={...actual[turn]};
   const pre=preSheetAtCut(buildSheet(earlier,base.heads),'Nocturno',4);
   if(pre.heads.Nocturno.length||pre.matches.Nocturno.length)
    throw Error('FUGA POST NOCTURNA '+date);
   const data:Record<string,unknown>={};
   const pastWinningEvents:Record<string,number>={};
   for(const n of [2,3] as N[]){
    const all=enumerateFigures(pre,n);
    const winners=winningFigures(week.sheet,pastDate,n);
    pastWinningEvents['vt'+n]=winners.length;
    const sameScope=new Set(all.map(f=>group(f)));
    for(const mode of modes){
     const transferred=moveWinnerFigures(winners,all,mode);
     const figures=transferred.selected.map(x=>x.fig);
     const stats=evaluateAgainstShapeControl(figures,all,heads.map(h=>h.head),n);
     const memberSources=[...new Set(figures.map(f=>f.source))];
     const oldCovered=transferred.selected.reduce((s,x)=>s+x.roots.length,0);
     // Las figuras se fijaron primero, los números del objetivo solo POST.
     const key='VT'+n+'_'+mode;
     data[key]={...stats,rootSites:winners.length,rootReused:oldCovered,
      selectedSources:memberSources,shapeGroups:[...new Set(figures.map(group))].length,
      exampleFigures:transferred.selected.slice(0,6).map(x=>({
       source:x.fig.source,shape:x.fig.shape,
       cells:x.fig.path.map(c=>({row:c.row,col:c.col})),
       valuePOST:x.fig.value,
       oldHeads:x.roots.slice(0,3).map(r=>({date:r.date,head:r.head,source:r.source,
        cells:r.path.map(c=>({row:c.row,col:c.col}))}))
      }))};
    }
   }
   cases.push({date,past:pastDate,heads,data,pastWinningEvents});
  }catch(e){
   if(/FUGA/.test(String(e)))throw e;
   skipped.push({date,reason:String(e).slice(0,200)});
  }
  if(cases.length%8===0)console.log('FIG_TRANSFER_PROGRESS',label,cases.length,date);
 }
 const summary:Record<string,unknown>={};
 for(const n of [2,3] as N[])for(const mode of modes){
  const key='VT'+n+'_'+mode;
  const values=cases.map(c=>c.data[key] as ReturnType<typeof evaluateAgainstShapeControl>);
  const sum=(field:'observed'|'expected'|'selectedSites'|'availableSites'|
    'otherPhysicalHeads'|'eligibleHeadsFromSameShape')=>values.reduce((a,x)=>a+x[field],0);
  const byMonth=Object.fromEntries([...new Set(cases.map(x=>x.date.slice(0,7)))].map(mon=>{
   const v=cases.filter(c=>c.date.startsWith(mon)).map(c=>c.data[key] as ReturnType<typeof evaluateAgainstShapeControl>);
   return [mon,{days:v.length,observed:v.reduce((a,x)=>a+x.observed,0),
    expected:v.reduce((a,x)=>a+x.expected,0),sites:v.reduce((a,x)=>a+x.selectedSites,0)}];
  }));
  const winners=cases.filter(c=>(c.data[key] as any)?.observed>0).map(c=>({
   date:c.date,past:c.past,heads:c.heads.map(h=>h.head),
   observed:(c.data[key] as any).observed
  }));
  summary[key]={cuts:cases.length,heads:values.reduce((n,x)=>n+x.heads,0),
   observed:sum('observed'),expected:sum('expected'),
   opportunities:sum('eligibleHeadsFromSameShape'),
   selectedSites:sum('selectedSites'),availableSites:sum('availableSites'),
   otherPhysicalHeads:sum('otherPhysicalHeads'),
   daysWithAny:values.filter(v=>v.selectedSites>0).length,
   byMonth,winningDays:winners};
 }
 const result={label,from,through,days:cases.length,skipped,summary,cases,
  rules:'Los sitios D-7 fueron ganadores físicamente; no se usan cifras viejas para escoger figuras nuevas. Controles aleatorios de igual n, misma fuente y silueta, sin repetición.',
  warning:'Backtest retrospectivo reconstruido, NO pronósticos anticipados sellados. Múltiples rutas pueden cubrir una cabeza; no atribuir causalidad ni ventaja.'};
 fs.mkdirSync('auditorias/figuras-ganadoras-d7',{recursive:true});
 fs.writeFileSync('auditorias/figuras-ganadoras-d7/resultado-'+label+'.json',
  JSON.stringify(result,null,2)+'\n');
 console.log('FIG_TRANSFER_SUMMARY',JSON.stringify({label,days:result.days,
  skipped:skipped.length,summary:Object.fromEntries(Object.entries(summary).map(([k,v])=>
   [k,{...v,winningDays:undefined}]))}));
}
main().catch(e=>{console.error('FIG_TRANSFER_ERROR',e);process.exitCode=1});
