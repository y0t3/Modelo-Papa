// Modelo Papá: hipótesis VT3 prioritaria, con apoyo VT2 de OTRO sorteo.
// Sólo reordena las MISMAS figuras VT3 ganadoras D-7, sin cambiar cupo.
// Una marca VT2 histórica NO cuenta si es simplemente el sufijo geométrico
// de un VT3 de LA MISMA cabeza y sorteo histórico.
// Prioridad fija antes del ensayo: EXACTA -> CONTACTO -> ranking combinado.
// Todo permanece dentro de la misma columna física, mismo turno de salida.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {DatedSheet} from './cycle7d';
import {readCombined7D} from './combinedReader7d';
import type {CombinedCandidate} from './combinedReader7d';
import {freezeBeforeTurn7D,physicalPoolBefore7D} from './causalReplay7d';
import {reconstructMarkedMoments} from './markedSheet7d';
import type {MarkedMoment,MarkedPath} from './markedSheet7d';

export type SupportType='EXACTA'|'CONTACTO';
export type VT2SupportEvidence={date:string;turn:Turno;sourceId:string;head:string;
 route:string[];type:SupportType};
export type SupportedVT3={value:string;vt2:string;sourceId:string;cells:string[];
 originalScore:number;originalSignals:string[];exactDates:number;contactDates:number;
 evidence:VT2SupportEvidence[]};
export type VT3SupportSelection={date:string;turn:Turno;baseline:SupportedVT3[];
 supported:SupportedVT3[];eligible:number;requested:number;
 poolWithExact:number;poolWithContact:number;changed:number};
export type VT3SupportTurn={date:string;turn:Turno;heads:string[];
 baseline:string[];supported:string[];selected:VT3SupportSelection;
 hitsBaseline:number;hitsSupported:number;vt2Baseline:number;vt2Supported:number;
 physicalPoolSize:number;physicalWinningValues:number;physicalExpected:number};
export type VT3SupportAudit={protocol:'VT3_INDEPENDENT_VT2_SUPPORT_V1';rows:VT3SupportTurn[];
 turns:number;selectedPicks:number;baselineHits:number;supportedHits:number;
 baselineVT2:number;supportedVT2:number;changedPicks:number;
 turnsImproved:number;turnsWorsened:number;turnsEqual:number;
 independentPoolExact:number;independentPoolContact:number;
 expectedPhysical:number;notes:string[]};

const compare=(a:string,b:string)=>a.localeCompare(b);
const dateMinus7=(d:string)=>{
 const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()-7);
 return x.toISOString().slice(0,10);
};
const key=(p:{row:number;col:number}[])=>p.map(x=>x.row+':'+x.col).join('>');
const str=(p:{row:number;col:number})=>p.row+':'+p.col;
const heads=(sheet:DailySheet,turn:Turno)=>[...new Set((sheet.heads[turn]||[])
 .filter(x=>/^\d{4}$/.test(x)))];
/** Esta cabeza previa tuvo un VT2 auténtico pero no sólo el
 * sufijo automático de un VT3 físico de la MISMA cabeza/columna/huella.
 */
function independentVT2(mark:MarkedPath,moment:MarkedMoment):boolean{
 if(mark.kind!=='vt2')return false;
 const two=mark.cells.join('>');
 return !moment.marks.some(x=>x.kind==='vt3'&&x.sourceId===mark.sourceId&&
  x.head===mark.head&&x.cells.slice(-2).join('>')===two);
}
export function selectVT3ByIndependentVT27D(history:DatedSheet[],current:DailySheet,
 date:string,turn:Turno,requested=3):VT3SupportSelection{
 if(!TURNOS.includes(turn)||requested!==3)throw Error('Turno o cupo VT3 inválido');
 if(history.some(x=>x.date>=date))throw Error('Fuga temporal: historia incluye objetivo');
 const before=freezeBeforeTurn7D(current,turn);
 const predicted=readCombined7D(history,before,date,turn,{vt3Limit:'ALL'});
 const candidates=predicted.candidates.filter(x=>x.kind==='vt3');
 // Se investiga sólo el ciclo entre D-7 y D, sin contar el propio D-7:
 // el VT2 que viene embebido en la terna D-7 NO es un apoyo independiente.
 const d7=dateMinus7(date);
 const completed=history.filter(x=>x.date>d7&&x.date<date);
 const marked=reconstructMarkedMoments(completed).filter(m=>m.turn===turn);
 const enriched:SupportedVT3[]=candidates.map((c:CombinedCandidate)=>{
  const suffix=key(c.path.slice(-2)),suffixCells=new Set(c.path.slice(-2).map(str));
  const exact=new Map<string,VT2SupportEvidence>(),connected=new Map<string,VT2SupportEvidence>();
  for(const m of marked)for(const vt2 of m.marks){
   if(vt2.kind!=='vt2'||vt2.sourceId!==c.sourceId||!independentVT2(vt2,m))continue;
   const type:SupportType|undefined=vt2.cells.join('>')===suffix?'EXACTA':
    vt2.cells.some(x=>suffixCells.has(x))?'CONTACTO':undefined;
   if(!type)continue;
   const evidence:VT2SupportEvidence={date:m.date,turn:m.turn,sourceId:vt2.sourceId,
    head:vt2.head,route:[...vt2.cells],type};
   const moment=m.date+'|'+m.turn;
   if(type==='EXACTA')exact.set(moment,evidence);
   else if(!connected.has(moment))connected.set(moment,evidence);
  }
  // Una sola categoría por sorteo; EXACTA tiene precedencia.
  for(const k of exact.keys())connected.delete(k);
  return {value:c.value,vt2:c.value.slice(-2),sourceId:c.sourceId,
   cells:c.path.map(str),originalScore:c.score,originalSignals:c.signals.map(s=>s.name),
   exactDates:exact.size,contactDates:connected.size,
   evidence:[...exact.values(),...connected.values()].sort((a,b)=>compare(a.date,b.date))};
 });
 const ranked=[...enriched].sort((a,b)=>b.exactDates-a.exactDates||
  b.contactDates-a.contactDates||b.originalScore-a.originalScore||
  compare(a.value,b.value));
 const budget=Math.min(requested,enriched.length);
 const baseline=enriched.slice(0,budget),supported=ranked.slice(0,budget);
 const prev=new Set(baseline.map(x=>x.value));
 return {date,turn,baseline,supported,eligible:enriched.length,requested:budget,
  poolWithExact:enriched.filter(x=>x.exactDates>0).length,
  poolWithContact:enriched.filter(x=>x.contactDates>0).length,
  changed:supported.filter(x=>!prev.has(x.value)).length};
}
export function auditIndependentVT2ForVT37D(input:DatedSheet[]):VT3SupportAudit{
 const ordered=[...input].sort((a,b)=>compare(a.date,b.date));
 if(ordered.some((d,i)=>!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||
  (i>0&&d.date===ordered[i-1].date)))throw Error('Fechas inválidas o repetidas');
 const rows:VT3SupportTurn[]=[];
 let selectedPicks=0,baselineHits=0,supportedHits=0,baselineVT2=0,supportedVT2=0;
 let changedPicks=0,turnsImproved=0,turnsWorsened=0,turnsEqual=0;
 let independentPoolExact=0,independentPoolContact=0,expectedPhysical=0;
 for(let i=6;i<ordered.length;i++){
  const {date,sheet}=ordered[i];
  const history=ordered.slice(i-6,i);
  for(const turn of TURNOS){
   const before=freezeBeforeTurn7D(sheet,turn);
   const selected=selectVT3ByIndependentVT27D(history,before,date,turn);
   const actual=heads(sheet,turn);if(!actual.length)continue;
   const base=selected.baseline.map(x=>x.value),newList=selected.supported.map(x=>x.value);
   if(base.length!==newList.length||new Set(newList).size!==newList.length)
    throw Error('Cupo no emparejado o candidatos duplicados');
   const physical=physicalPoolBefore7D(history,before,date,turn).vt3;
   if([...base,...newList].some(v=>!physical.has(v)))
    throw Error('Candidato fuera del universo físico D-7');
   const winners=new Set(actual.map(x=>x.slice(-3)));
   const twoWinners=new Set(actual.map(x=>x.slice(-2)));
   const nWin=[...physical].filter(x=>winners.has(x)).length;
   const hb=base.filter(x=>winners.has(x)).length;
   const hs=newList.filter(x=>winners.has(x)).length;
   const b2=base.filter(x=>twoWinners.has(x.slice(-2))).length;
   const s2=newList.filter(x=>twoWinners.has(x.slice(-2))).length;
   const expected=physical.size?base.length*nWin/physical.size:0;
   rows.push({date,turn,heads:actual,baseline:base,supported:newList,selected,
    hitsBaseline:hb,hitsSupported:hs,vt2Baseline:b2,vt2Supported:s2,
    physicalPoolSize:physical.size,physicalWinningValues:nWin,physicalExpected:expected});
   selectedPicks+=base.length;baselineHits+=hb;supportedHits+=hs;
   baselineVT2+=b2;supportedVT2+=s2;changedPicks+=selected.changed;
   independentPoolExact+=selected.poolWithExact;
   independentPoolContact+=selected.poolWithContact;expectedPhysical+=expected;
   if(hs>hb)turnsImproved++;else if(hs<hb)turnsWorsened++;else turnsEqual++;
  }
 }
 return {protocol:'VT3_INDEPENDENT_VT2_SUPPORT_V1',rows,turns:rows.length,selectedPicks,
  baselineHits,supportedHits,baselineVT2,supportedVT2,changedPicks,
  turnsImproved,turnsWorsened,turnsEqual,independentPoolExact,
  independentPoolContact,expectedPhysical,notes:[
   'Mismo Top 3 VT3 por turno; ninguna nueva modalidad se impone en la aplicación.',
   'Sólo marcaciones VT2 verdaderas de sorteos posteriores a D-7 y anteriores a D, del mismo turno y columna.',
   'Se excluye el VT2 derivado de un VT3 en la misma cabeza histórica: no es apoyo independiente.',
   'Se prioriza la coincidencia exacta de huella VT2, después contacto físico con sufijo y finalmente ranking previo.',
   'Máximo un apoyo por sorteo y tipo, sin cruzar columnas ni conocer resultados del objetivo.',
   'VT2 contenido se informa aparte: no es segundo acierto independiente.',
   'Periodo histórico explorado; sin validación predictiva prospectiva.'
  ]};
}
