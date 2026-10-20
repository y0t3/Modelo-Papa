// Auditoría 19/10: replay SIN anticipar resultados, separado de MV1 y de la APK.
// Fuente de cabezas: mismo endpoint que usa la app. No inventa PRE sellados.
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildInfoWeek} from '../src/infoWeek';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical,LaloKind} from '../src/motorLalo';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildVt3Shadow} from '../src/vt3Shadow';
import {buildVt3Trial} from '../src/vt3Trial';
import {buildConnectedVt3} from '../src/connectedVt3';
import {findPaths} from '../src/paths';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
const dates=['2026-10-09','2026-10-10','2026-10-12','2026-10-13',
 '2026-10-14','2026-10-15','2026-10-16','2026-10-17','2026-10-19'];
const data=new Map<string,CabezasDia>(),errors:Record<string,string>={};
for(const date of dates){
 try {
  const x=await descargarCabezas(date,true);
  data.set(date,x);
  console.log('FUENTE',date,JSON.stringify(Object.fromEntries(TURNOS.map(t=>
   [t,Object.fromEntries(JURS.map(j=>[j,x[t][j]]))]))));
 }catch(e){errors[date]=String(e);console.log('ERROR_FUENTE',date,String(e))}
}
const date='2026-10-19',today=data.get(date);
if(!today)throw Error('El endpoint no devolvió las cabezas del 19/10');
const full=Object.fromEntries(TURNOS.map(t=>[t,JURS.filter(j=>j!=='Montevideo')
 .map(j=>({jur:j,head:today[t][j]}))]));
const completeness=TURNOS.map(t=>({
 turn:t,verified:Object.values(today[t]).filter(h=>/^[0-9]{4}$/.test(h)).length,
 argentina:JURS.filter(j=>j!=='Montevideo'&&/^[0-9]{4}$/.test(today[t][j])).length,
 heads:Object.fromEntries(JURS.map(j=>[j,today[t][j]]))
}));
const valid=dates.filter(d=>d<date&&data.has(d)&&hasDrawResults(data.get(d)!)&&
 hasNocturnoBase(data.get(d)!));
const previous=valid.at(-1),beforePrevious=valid.at(-2);
if(!previous||!beforePrevious)throw Error('No hay dos jornadas Nocturnas previas');
const lastSheet=buildSheet(data.get(previous)!,data.get(beforePrevious)!);
const weekDay=data.get('2026-10-12'),weekPrevious=data.get('2026-10-10');
if(!weekDay||!weekPrevious)throw Error('Faltan datos para D−7 de la app');
const historical:LaloHistorical[]=[
 {date:previous,period:'D−1',sheet:lastSheet},
 {date:'2026-10-12',period:'D−7',sheet:buildSheet(weekDay,weekPrevious)}
];
const daysFromWeek=dates.filter(d=>d>='2026-10-12'&&d<date&&data.has(d))
 .map(d=>({date:d,heads:data.get(d)!}));
const visualDays=buildInfoWeek('2026-10-12',date,daysFromWeek,weekPrevious);
const todaySheet=buildSheet(today,data.get(previous)!);
const metricNames=['Lalo VT2','Lalo VT3','Lalo VT4','Geometría VT3','Nueva Prueba VT3','Conectadas VT3'] as const;
const totals=Object.fromEntries(metricNames.map(n=>[n,{top3:0,top5:0,top10:0}])) as
 Record<typeof metricNames[number],{top3:number;top5:number;top10:number}>;
const daily=[];
for(const turn of TURNOS){
 const idx=TURNOS.indexOf(turn);
 const pre=preSheetAtCut(todaySheet,turn,idx);
 const lalo=buildMotorLalo(pre,date,turn,historical);
 const geo=buildVt3Shadow(pre,date,turn,historical,lalo);
 const trial=buildVt3Trial(lalo,geo);
 const connected=buildConnectedVt3(pre,date,turn,visualDays);
 const rows=Object.fromEntries(metricNames.map(n=>[n,[] as string[]])) as Record<typeof metricNames[number],string[]>;
 rows['Lalo VT2']=lalo.ranks.vt2.slice(0,10).map(f=>f.family);
 rows['Lalo VT3']=lalo.ranks.vt3.slice(0,10).map(f=>f.family);
 rows['Lalo VT4']=lalo.ranks.vt4.slice(0,10).map(f=>f.family);
 rows['Geometría VT3']=geo.top.slice(0,10).map(f=>f.family);
 rows['Nueva Prueba VT3']=trial.top.slice(0,10).map(f=>f.family);
 rows['Conectadas VT3']=connected.top.slice(0,10).map(f=>f.family);
 const items=[] as any[];
 for(const jur of JURS.filter(j=>j!=='Montevideo')){
  const head=today[turn][jur];
  if(!/^[0-9]{4}$/.test(head))continue;
  const family={vt2:reversibleFamily(head.slice(-2)),vt3:reversibleFamily(head.slice(-3))};
  const physical=Object.fromEntries((['vt2','vt3','vt4'] as LaloKind[]).map(kind=>{
   const suffix=head.slice(-Number(kind.slice(-1)));
   const links=pre.columns.slice(0,idx+1).flatMap(col=>{
    const ways=findPaths(col.values,suffix);
    return ways.length?[{source:col.id,ways:ways.length}]:[];
   });
   return [kind,links];
  }));
  const rank:Record<string,number|null>={};
  for(const name of metricNames){
   const group=name.endsWith('VT2')?'vt2':name.endsWith('VT4')?'vt4':'vt3';
   let n=rows[name].indexOf(group==='vt4'?head:family[group as 'vt2'|'vt3'])+1;
   if(group==='vt4'){
    // Para VT4 exigir la cuarta cifra exacta en un testigo físico, nunca invertir.
    const f=lalo.ranks.vt4[n-1];
    if(n&&(!f||!f.paths.some(p=>p.value===head)))n=0;
   }
   rank[name]=n||null;
   for(const limit of [3,5,10] as const)
    if(n>0&&n<=limit)totals[name][('top'+limit) as 'top3'|'top5'|'top10']++;
  }
  items.push({jur,head,physical,rank});
 }
 daily.push({turn,heads:items,topFamilies:rows,connectedHistoryDays:connected.historicalDays,
  connectedHistoricalPairs:connected.historicalPairs,connectedCandidates:connected.availableFamilies,
  counts:Object.fromEntries(metricNames.map(n=>[n,Object.fromEntries(([3,5,10] as const).map(k=>
   ['top'+k,items.filter(x=>x.rank[n]&&x.rank[n]<=k).length]))]))});
 console.log('CORTE',turn,JSON.stringify(daily.at(-1)));
}
const report={date,source:'vivitusuerte.com/api/juegos/cabezasDiarias',errors,complete:
 TURNOS.every(t=>JURS.filter(j=>j!=='Montevideo').every(j=>/^[0-9]{4}$/.test(today[t][j]))),
 completeness,previous,refs:historical.map(x=>({date:x.date,period:x.period})),
 visualDays:visualDays.map(x=>x.date),daily,totals};
mkdirSync('lab-results',{recursive:true});
writeFileSync('lab-results/contraste-19oct2026.json',JSON.stringify(report,null,2));
console.log('RESUMEN_FINAL_19OCT',JSON.stringify({complete:report.complete,
 completeness,previous,refs:report.refs,totals,errors}));
