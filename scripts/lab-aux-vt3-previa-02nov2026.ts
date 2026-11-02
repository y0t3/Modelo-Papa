/**
 * Corte puntual, PRE reconstruido, Previa del 02/11/2026:
 * AUX AYER VT3 original, #11-20, Formas Primero, 7+3 y cinco testigos.
 * AUX HOY sin columnas/candidatos en Previa. SIN cambiar app.
 * Secuencia de doble fase: construye y congela en RAM listas ANTES
 * de mirar las cabezas objetivo, luego registra el POST por separado.
 */
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS} from '../src/domain';
import type {Turno,CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import type {AuxiliaryHistorical} from '../src/motorLaloIntegral';
import {auxFamily,auxiliaryBoard,collectAuxFamilies,findAuxFamily}
 from '../src/auxSantiagoNeuquen';
import {selectAuxFormFirst} from '../src/labAuxFormasPrimeroVT3';

const date='2026-11-02',turn:Turno='Previa',weekDate=shiftDay(date,-7);
const valid=(s:string)=>/^\d{4}$/.test(s);
const drawCache=new Map<string,Promise<CabezasDia>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
function draw(d:string){
 if(!drawCache.has(d))drawCache.set(d,descargarCabezas(d,true));
 return drawCache.get(d)!;
}
function aux(d:string){
 if(!auxCache.has(d))auxCache.set(d,fetchAuxiliaryHeads(d));
 return auxCache.get(d)!;
}
function hash(s:string){
 let h=2166136261;
 for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
}
function neutral(families:string[],salt:number){
 return [...families].sort((a,b)=>hash(date+'|'+turn+'|'+salt+'|'+a)-
 hash(date+'|'+turn+'|'+salt+'|'+b)||a.localeCompare(b)).slice(0,10);
}
type View={
 mode:string;sourceDate:string|null;sourceHeads:unknown;
 original:{rank:number;family:string;roots:number;d1:number;d7:number}[];
 old:string[];last:string[];forms:string[];hybrid:string[];
 formedFamilies:number;positions:number;physicalSites:number;
 candidateFamilies:string[];
 formsSupport:{rank:number;family:string;events:number;days:number}[];
 neutrals:string[][];
};
async function main(){
 const [today,prev,weekly]=await Promise.all([
  draw(date),loadPreviousDraws(date,6,draw),draw(weekDate)
 ]);
 const refs=[{date:prev.at(-1)!.date,heads:prev.at(-1)!.heads,
  period:'D−1' as const},...(hasDrawResults(weekly)?[
  {date:weekDate,heads:weekly,period:'D−7' as const}]:[])];
 const wanted=new Set<string>([auxiliarySourceDate(date),date]);
 for(const p of prev){wanted.add(p.date);wanted.add(auxiliarySourceDate(p.date))}
 for(const r of refs){wanted.add(r.date);wanted.add(auxiliarySourceDate(r.date))}
 const observations=new Map(await Promise.all([...wanted].map(async d=>
  [d,(await aux(d)).heads] as const)));
 const PRE:View[]=[];
 for(const mode of ['anterior','intrajornada'] as const){
  const sourceDate=mode==='anterior'?auxiliarySourceDate(date):date;
  const raw=observations.get(sourceDate)!;
  const cut=auxAtCut(raw,turn,mode);
  const board=auxiliaryBoard(cut,turn);
  const physical=collectAuxFamilies(board,3);
  const originalHistory:AuxiliaryHistorical[]=refs.map(ref=>{
   const source=mode==='anterior'?auxiliarySourceDate(ref.date):ref.date;
   return {date:ref.date,period:ref.period,
    aux:extractAuxHistoryMode(ref.date,observations.get(source)!,ref.heads,mode)}
  });
  const recentHistory:AuxiliaryHistorical[]=prev.map(ref=>{
   const source=mode==='anterior'?auxiliarySourceDate(ref.date):ref.date;
   return {date:ref.date,period:'D−1' as const,
    aux:extractAuxHistoryMode(ref.date,observations.get(source)!,ref.heads,mode)};
  });
  const ranked=buildAuxIndependent(date,turn,cut,originalHistory)[3];
  const shape=selectAuxFormFirst(board,recentHistory,date,
   mode==='anterior'?'AUX_AYER':'AUX_HOY');
  const old=ranked.slice(0,10).map(x=>x.family);
  const last=ranked.slice(10,20).map(x=>x.family);
  const forms=shape.top.map(x=>x.family);
  const hybrid=[...old.slice(0,7),...last.filter(f=>!old.slice(0,7).includes(f)).slice(0,3)];
  PRE.push({
   mode,sourceDate:mode==='anterior'?sourceDate:null,
   sourceHeads:cut,
   original:ranked.slice(0,30).map(x=>({
    rank:x.rank,family:x.family,roots:x.roots,d1:x.d1,d7:x.d7
   })),
   old,last,forms,hybrid,
   formedFamilies:physical.length,positions:ranked.length,
   physicalSites:shape.physicalSites,
   candidateFamilies:physical.map(x=>x.family),
   formsSupport:shape.top.map(x=>({rank:x.rank,family:x.family,
    events:x.rootEvents,days:x.rootDays})),
   neutrals:Array.from({length:5},(_,i)=>neutral(physical.map(f=>f.family),i))
  });
 }
 // La frontera PRE/POST está explícita. No se usa 'today' en los selectores.
 console.log('AUX_VT3_PRE_JSON_START');
 console.log(JSON.stringify({date,turn,baseline:refs.map(x=>({date:x.date,period:x.period})),
  recentDays:prev.map(x=>x.date),
  pre:PRE.map(({candidateFamilies,neutrals,...v})=>v)},null,2));
 console.log('AUX_VT3_PRE_JSON_END');
 const heads=JURS.filter(j=>j!=='Montevideo').map(jur=>({
  jur,head:today[turn]?.[jur]||''
 })).filter(x=>valid(x.head));
 console.log('AUX_VT3_POST_JSON_START');
 const post=PRE.map(p=>{
  const wins=heads.map(x=>({...x,vt3:x.head.slice(-3),
   family:auxFamily(x.head.slice(-3))}));
  const count=(xs:string[])=>wins.filter(w=>xs.includes(w.family)).length;
  const details=wins.map(w=>({
   ...w,physical:p.candidateFamilies.includes(w.family),
   originalRank:p.original.find(x=>x.family===w.family)?.rank??null,
   inOriginalTop10:p.old.includes(w.family),
   inSecond10:p.last.includes(w.family),
   inFormsTop10:p.forms.includes(w.family),
   inHybrid7plus3:p.hybrid.includes(w.family),
   shapeSupport:p.formsSupport.find(x=>x.family===w.family)??null,
   existsInPhysicalPaths:p.candidateFamilies.includes(w.family)
  }));
  const lookups=details.map(w=>({
   ...w,possibleRoutes:p.mode==='anterior'?
    findAuxFamily(auxiliaryBoard(
     auxAtCut(observations.get(p.sourceDate!)!,turn,'anterior'),turn),w.vt3).paths.length:0
  }));
  return {mode:p.mode,sizes:{original:p.old.length,elevenToTwenty:p.last.length,
    forms:p.forms.length,hybrid:p.hybrid.length},
   heads:wins.length,formable:wins.filter(w=>p.candidateFamilies.includes(w.family)).length,
   hits:{original:count(p.old),elevenToTwenty:count(p.last),
    forms:count(p.forms),hybrid:count(p.hybrid),
    neutral:p.neutrals.map(count)},
   winnerDetails:lookups
  };
 });
 console.log(JSON.stringify({date,turn,heads,complete:heads.length===5,
  previousAuxiliaryDate:auxiliarySourceDate(date),post},null,2));
 console.log('AUX_VT3_POST_JSON_END');
 if(heads.length<4)throw Error('La Previa aún incompleta: '+heads.length+'/5');
 if(PRE[1].old.length)throw Error('AUX HOY no debe tener PRE Previa');
}
main().catch(e=>{console.error('AUX_VT3_ERROR',e);process.exitCode=1});
