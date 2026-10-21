/**
 * Auditoría secundaria: familias VT3 físicamente válidas pero NO admitidas
 * por raíz ganadora de Lalo. ¿Es relevante tener varias columnas?
 *
 * DEFINICIÓN congela ANTES de calcular aciertos:
 * - Múltiple fuente = al menos 2 columnas distintas, no 2 caminos en la misma.
 * - Unidad de exposición = familia reversible; duplicados de recorrido no votos.
 * - Control = misma familia sin raíces presente en 1 columna.
 * - Propuesta de rescate Top6 = reemplazar puesto 6 de Lalo por la primera
 *   familia fría con >=2 fuentes, elegida por N fuentes > N bloques físicos
 *   > familia alfabética. Selección independiente de cabezas futuras.
 * - Controles del 12 al 19 son retrospectivos; 20 inspira hipótesis y por
 *   eso NO es validación fuera de muestra.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {allPhysicalVt3} from '../src/vt3Shadow';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
const dates=['02','03','05','06','07','08','09','10','12','13','14','15','16','17','19','20']
.map(d=>'2026-10-'+d);
const JUR=JURS.filter(j=>j!=='Montevideo');
const valid=(h:string)=>/^\d{4}$/.test(h);
const key=(x:{row:number;col:number})=>x.row+':'+x.col;
const d7=(iso:string)=>{const x=new Date(iso+'T00:00:00Z');x.setUTCDate(x.getUTCDate()-7);
 return x.toISOString().slice(0,10)};
type Fam={family:string;sources:string[];sourceCount:number;blocks:number;witness:string[]};
type S={date:string;turn:Turno;cold1:Fam[];cold2:Fam[];admitted:number;
 available:number;before:string[];replaced:string|null;nextCold2:string|null;
 actual:string[];cold2Winner:string[];cold1Winner:string[];originalHits:number;
 swapHits:number;cold2RankForWinner:{family:string;rank:number}[]};
async function main(){
 const store=new Map<string,CabezasDia>(),errors:Record<string,string>={};
 for(const date of dates)try{store.set(date,await descargarCabezas(date,true))}
 catch(e){errors[date]=String(e)}
 const good=dates.filter(d=>store.has(d)&&hasDrawResults(store.get(d)!)&&hasNocturnoBase(store.get(d)!));
 const sheets=new Map<string,ReturnType<typeof buildSheet>>();
 for(let i=1;i<good.length;i++)sheets.set(good[i],buildSheet(store.get(good[i])!,store.get(good[i-1])!));
 const cuts:S[]=[];
 for(let i=2;i<good.length;i++){
  const date=good[i];if(date<'2026-10-12')continue;
  const hist:LaloHistorical[]=[{period:'D−1',date:good[i-1],sheet:sheets.get(good[i-1])!},
   ...(sheets.has(d7(date))?[{period:'D−7' as const,date:d7(date),sheet:sheets.get(d7(date))!}]:[])];
  const full=buildSheet(store.get(date)!,store.get(good[i-1])!);
  for(const turn of TURNOS){
   const pre=preSheetAtCut(full,turn,TURNOS.indexOf(turn));
   const lal=buildMotorLalo(pre,date,turn,hist),admitted=new Set(lal.ranks.vt3.map(x=>x.family));
   const by=new Map<string,{sources:Set<string>;physical:Set<string>;witness:string[]}>();
   for(const col of pre.columns.slice(0,TURNOS.indexOf(turn)+1))
    for(const path of allPhysicalVt3(col.values)){
     const family=reversibleFamily(path.map(x=>x.digit).join(''));
     const x=by.get(family)||{sources:new Set(),physical:new Set(),witness:[]};
     const positions=path.map(key);
     x.sources.add(col.id);x.physical.add(col.id+'|'+positions.slice().sort().join(','));
     if(x.witness.length<12)x.witness.push(col.id+':'+positions.join('>'));
     by.set(family,x);
    }
   const cold:Fam[]=[...by].filter(([f])=>!admitted.has(f)).map(([family,x])=>({
    family,sources:[...x.sources],sourceCount:x.sources.size,blocks:x.physical.size,witness:x.witness
   })).sort((a,b)=>b.sourceCount-a.sourceCount||b.blocks-a.blocks||
    a.family.localeCompare(b.family));
   const cold2=cold.filter(x=>x.sourceCount>=2);
   const cold1=cold.filter(x=>x.sourceCount===1);
   const before=lal.ranks.vt3.slice(0,6).map(x=>x.family);
   const swap=[...before.slice(0,5),...(cold2[0]?[cold2[0].family]:before.slice(5,6))];
   const actual=JUR.flatMap(jur=>{
    const h=store.get(date)![turn][jur];
    return valid(h)?[reversibleFamily(h.slice(-3))]:[];
   });
   const hit=(families:string[])=>actual.filter(x=>families.includes(x)).length;
   const cold2Winner=actual.filter(f=>cold2.some(x=>x.family===f));
   const cold1Winner=actual.filter(f=>cold1.some(x=>x.family===f));
   const snapshot:S={date,turn,cold1,cold2,admitted:admitted.size,
    available:by.size,before,replaced:before[5]||null,
    nextCold2:cold2[0]?.family||null,actual,cold2Winner,cold1Winner,
    originalHits:hit(before),swapHits:hit(swap),
    cold2RankForWinner:cold2Winner.map(f=>({family:f,
     rank:cold2.findIndex(x=>x.family===f)+1}))};
   cuts.push(snapshot);
   if(date==='2026-10-20')console.log('FRIOS_20OCT',JSON.stringify({
    date,turn,cold2Count:cold2.length,cold1Count:cold1.length,
    cold2Top10:cold2.slice(0,10).map(x=>({family:x.family,sources:x.sources,
     blocks:x.blocks})),winnersCold2:cold2Winner,
    winnersCold2Rank:snapshot.cold2RankForWinner,
    originalHits:snapshot.originalHits,swapHits:snapshot.swapHits,
    selectedCold2:snapshot.nextCold2
   }));
  }
 }
 function summarized(rows:S[]){
  return {cuts:rows.length,totalCold1:rows.reduce((s,x)=>s+x.cold1.length,0),
   totalCold2:rows.reduce((s,x)=>s+x.cold2.length,0),
   cold1WinningHeads:rows.reduce((s,x)=>s+x.cold1Winner.length,0),
   cold2WinningHeads:rows.reduce((s,x)=>s+x.cold2Winner.length,0),
   cold2SelectedHits:rows.reduce((s,x)=>s+x.actual.filter(f=>f===x.nextCold2).length,0),
   originalTop6:rows.reduce((s,x)=>s+x.originalHits,0),
   swappedTop6:rows.reduce((s,x)=>s+x.swapHits,0),
   eligibleRescueCuts:rows.filter(x=>x.nextCold2).length};
 }
 const reports=['2026-10-12','2026-10-19','2026-10-20'].map(start=>({
  start,stats:summarized(cuts.filter(x=>start==='2026-10-12'?x.date<'2026-10-20':
   start==='2026-10-19'?x.date==='2026-10-19':x.date==='2026-10-20'))
 }));
 const byDay=[...new Set(cuts.map(x=>x.date))].map(date=>({date,
  ...summarized(cuts.filter(x=>x.date===date))}));
 const report={date:'2026-10-20',hypothesis:'Sin raíces, más de una fuente física',
  caveat:'Hipótesis sugerida tras observar la cabeza 8568 del 20oct: NO considerar el 20 como prueba ciega.',
  selection:'Top6 con intercambio único del puesto sexto y prioridad por fuentes distintas, bloques físicos, familia alfabética',
  reports,byDay,errors,cuts};
 console.log('RESUMEN_FRIOS',JSON.stringify({reports,byDay}));
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/frontera-fria-lalo-20oct2026.json',JSON.stringify(report,null,2));
}
void main().catch(e=>{console.error('ERROR_FRIOS',e);process.exitCode=1});
