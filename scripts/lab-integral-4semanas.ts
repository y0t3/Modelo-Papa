/**
 * Comparación congelada: últimas CUATRO SEMANAS COMPLETAS disponibles
 * antes del 21/10/2026 (23/09–20/10, 28 días calendario).
 *
 * En cada PRE ejecuta realmente y por separado:
 *  - Lalo MV1 (hoja +11)
 *  - auxiliar independiente (raíces POST ganadoras de D−1/D−7)
 *  - Lalo Integral, selector combinado 65/35 y madre VT3 para VT4
 *  - 49 controles de orden aleatorio del mismo pool PRE
 *
 * No se inspecciona cabeza objetivo hasta DESPUÉS de congelar los tops.
 * Se comparan VT2, VT3 y VT4 por familia, número exacto y exposición
 * idéntica al Top3/Top5 de Lalo en el corte.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {buildMotorLaloIntegral,buildAuxIndependent,
 extractIntegralAuxHistory} from '../src/motorLaloIntegral';
import type {IntegralKind,IntegralPast,IntegralPrediction}
 from '../src/motorLaloIntegral';
import {reversibleFamily} from '../src/motorLalo';

const WARMUP='2026-09-05',FIRST='2026-09-23',LAST='2026-10-20';
const KINDS:IntegralKind[]=[2,3,4];
const TARGETS=TURNOS.slice(1);
const METHODS=['MV1','AUX','INTEGRAL','CONTROL'] as const;
type Method=typeof METHODS[number];
type Candidate={family:string;values:string[];sources?:string;
 score?:number;mother?:string|null;roots?:number;rank?:number;
 rankLalo?:number|null;rankAux?:number|null};
type Heads={jur:string;head:string}[];
type Stat={hits:number;expected:number;families:number;
 raw:number;ticketUnits:number;active:number};
type RankRecord={method:Method;mode:'TOP'|'IGUAL_PRESUPUESTO';
 k:3|5;kind:IntegralKind;result:Stat;candidates:Candidate[]};
type Cut={date:string;turn:Turno;heads:Heads;ranking:RankRecord[];
 availableSources:{plus11:number;aux:number};
 poolSizes:Record<IntegralKind,Record<string,number>>;
};
const goodDate=(d:string)=>new Date(d+'T12:00:00Z');
const dateRange=(start:string,end:string)=>{
 const all:string[]=[];
 for(let date=goodDate(start);date<=goodDate(end);
  date=new Date(date.getTime()+86400000))
  all.push(date.toISOString().slice(0,10));
 return all;
};
const minus7=(x:string)=>{
 const d=goodDate(x);d.setUTCDate(d.getUTCDate()-7);
 return d.toISOString().slice(0,10);
};
const valid=(s:string)=>/^\d{4}$/.test(s);
const unique=<T>(x:T[])=>[...new Set(x)];
const endings=(f:Candidate[])=>new Set(f.flatMap(x=>x.values));
const hash=(s:string)=>{
 let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
};
function official(view:IntegralPrediction,kind:IntegralKind):Candidate[]{
 const source=view.baseline.ranks[('vt'+kind) as 'vt2'|'vt3'|'vt4'];
 const seen=new Set<string>();
 return source.filter(f=>{if(seen.has(f.family))return false;
  seen.add(f.family);return true;}).map((f,i)=>({
  family:f.family,rank:i+1,
  values:kind===4?unique(f.paths.map(p=>p.value)):
   unique(f.family.split('/')),
  sources:unique(f.paths.map(p=>p.sourceId)).join('+')
 })).filter(x=>x.values.length>0);
}
function integral(view:IntegralPrediction,kind:IntegralKind):Candidate[]{
 return view.ranks[kind].map(r=>({
  family:r.family,rank:r.rank,values:r.values,score:r.score,
  rankLalo:r.laloRank,rankAux:r.auxRank,mother:r.mother,roots:r.rootEvents,
  sources:[...r.plus11Sources.map(x=>'L:'+x),...r.auxSources.map(x=>'A:'+x)].join('+')
 }));
}
function independent(ind:ReturnType<typeof buildAuxIndependent>,kind:IntegralKind):Candidate[]{
 return ind[kind].map(x=>({
  family:x.family,rank:x.rank,values:x.values,roots:x.roots,
  mother:x.mother,sources:x.sources.join('+')
 }));
}
function orderControl(a:Candidate[],b:Candidate[],date:string,turn:Turno,
 kind:IntegralKind,seed:number):Candidate[]{
 const seen=new Set<string>();
 return [...a.slice(0,12),...b.slice(0,12)].filter(x=>{
  if(seen.has(x.family))return false;
  seen.add(x.family);return true;
 }).sort((a,b)=>
  hash([date,turn,kind,seed,a.family].join('|'))-
  hash([date,turn,kind,seed,b.family].join('|'))||
  a.family.localeCompare(b.family));
}
function top(candidates:Candidate[],limit:number,budget:number|null):Candidate[]{
 const chosen:Candidate[]=[],known=new Set<string>(),taken=new Set<string>();
 for(const family of candidates){
  if(chosen.length===limit)break;
  if(taken.has(family.family))continue;taken.add(family.family);
  const next=family.values.filter(x=>!known.has(x));
  if(!next.length||budget!==null&&known.size+next.length>budget)continue;
  if(next.some(x=>x.length!==family.values[0].length))
   throw Error('Largo inconsistente de terminación');
  chosen.push(family);next.forEach(x=>known.add(x));
 }
 return chosen;
}
function metric(heads:Heads,n:IntegralKind,chosen:Candidate[]):Stat{
 const exact=endings(chosen);
 return {hits:heads.filter(h=>exact.has(h.head.slice(-n))).length,
  expected:heads.length*exact.size/(10**n),families:chosen.length,
  raw:exact.size,ticketUnits:heads.length*exact.size,
  active:Number(exact.size>0)};
}
const add=(records:RankRecord[],k:3|5,kind:IntegralKind,method:Method,
 mode:'TOP'|'IGUAL_PRESUPUESTO')=>{
 const selected=records.filter(r=>r.k===k&&r.kind===kind&&
  r.method===method&&r.mode===mode);
 const sum=(key:keyof Stat)=>selected.reduce((n,r)=>n+r.result[key],0);
 return {hits:sum('hits'),expected:Number(sum('expected').toFixed(3)),
  exposedTickets:sum('ticketUnits'),numberSelections:sum('raw'),
  selectedFamilies:sum('families'),activeCuts:sum('active')};
};
function summarize(cuts:Cut[]){
 const all=cuts.flatMap(c=>c.ranking);
 const kinds:Record<string,any>={};
 for(const kind of KINDS){
  kinds['vt'+kind]={};
  for(const k of [3,5] as const){
   kinds['vt'+kind]['top'+k]={};
   for(const method of METHODS)kinds['vt'+kind]['top'+k][method]={
    open:add(all,k,kind,method,'TOP'),
    matched:add(all,k,kind,method,'IGUAL_PRESUPUESTO')
   };
  }
 }
 const coverage:Record<string,any>={};
 for(const mode of ['TOP','IGUAL_PRESUPUESTO'] as const)
 for(const k of [3,5] as const)
 for(const method of METHODS){
  let uniq=0,occ=0,raw=0;
  for(const c of cuts){
   const sets=KINDS.map(n=>endings(c.ranking.find(r=>r.mode===mode&&
    r.k===k&&r.method===method&&r.kind===n)?.candidates||[]));
   uniq+=c.heads.filter(h=>KINDS.some((n,i)=>sets[i].has(h.head.slice(-n)))).length;
   occ+=c.heads.reduce((acc,h)=>acc+KINDS.filter((n,i)=>
    sets[i].has(h.head.slice(-n))).length,0);
   raw+=sets.reduce((acc,s)=>acc+s.size,0);
  }
  coverage[mode+'|top'+k+'|'+method]={
   headsOnce:uniq,modalityHits:occ,numberSelections:raw};
 }
 return {days:new Set(cuts.map(c=>c.date)).size,cuts:cuts.length,
  heads:cuts.reduce((n,c)=>n+c.heads.length,0),kinds,coverage};
}
async function main(){
 const dates=dateRange(WARMUP,LAST);
 const data=new Map<string,CabezasDia>(),aux=new Map<string,AuxiliaryHeads>();
 let cursor=0;const errors:Record<string,string>={};
 await Promise.all(Array.from({length:8},async()=>{
  while(cursor<dates.length){
   const date=dates[cursor++];
   try{
    const [draw,heads]=await Promise.all([
     descargarCabezas(date,true),fetchAuxiliaryHeads(date)
    ]);
    data.set(date,draw);aux.set(date,heads.heads);
   }catch(e){errors[date]=String(e);}
  }
 }));
 if(Object.keys(errors).length>5)throw Error('Faltan datos de origen: '+JSON.stringify(errors));
 const x=aux.get('2026-10-20');
 if(!x||x.Previa.Santiago!=='8067'||x.Primera.Santiago!=='6142'||
 x.Matutino.Santiago!=='9634'||x.Previa.Neuquen!=='0469'||
 x.Primera.Neuquen!=='0245'||x.Matutino.Neuquen!=='0210')
 throw Error('Mapa Vivitusuerte 20/oct no coincide');
 const good=dates.filter(d=>data.has(d)&&aux.has(d)&&
  hasDrawResults(data.get(d)!)&&hasNocturnoBase(data.get(d)!));
 const sheets=new Map<string,DailySheet>();
 const memory=new Map<string,ReturnType<typeof extractIntegralAuxHistory>>();
 for(let i=0;i<good.length;i++){
  const day=good[i];
  memory.set(day,extractIntegralAuxHistory(day,aux.get(day)!,data.get(day)!));
  if(i>0)sheets.set(day,buildSheet(data.get(day)!,data.get(good[i-1])!));
 }
 const cuts:Cut[]=[];
 for(let i=2;i<good.length;i++){
  const day=good[i];if(day<FIRST)continue;
  const prev=good[i-1],week=minus7(day);
  const older=[{date:prev,period:'D−1' as const},...(
   memory.has(week)&&sheets.has(week)&&week!==prev?
    [{date:week,period:'D−7' as const}]:[])];
  const past:IntegralPast[]=older.map(h=>({
   date:h.date,period:h.period,plus11:sheets.get(h.date)!,
   aux:memory.get(h.date)!
  }));
  if(past.some(p=>p.date>=day))throw Error('Fuga de raíces '+day);
  const current=data.get(day)!;
  for(const turn of TURNOS){
   const pre=preSheetAtCut(sheets.get(day)!,turn,TURNOS.indexOf(turn));
   if(pre.heads[turn].length||pre.matches[turn].length)
    throw Error('Fuga PRE '+day+' '+turn);
   const view=buildMotorLaloIntegral(day,turn,pre,aux.get(day)!,past);
   const auxRanks=buildAuxIndependent(day,turn,aux.get(day)!,past);
   const heads=JURS.flatMap(jur=>{
    const head=current[turn]?.[jur]||'';
    return valid(head)?[{jur,head}]:[];
   });
   if(!heads.length)continue; // Evita turnos inexistentes.
   const ranking:RankRecord[]=[];
   const poolSizes={} as Cut['poolSizes'];
   for(const kind of KINDS){
    const base=official(view,kind),support=independent(auxRanks,kind),
     joined=integral(view,kind);
    poolSizes[kind]={lalo:base.length,aux:support.length,integral:joined.length};
    if(turn==='Previa'&&support.length)throw Error('AUX antes de Previa');
    for(const k of [3,5] as const){
     const baseChosen=top(base,k,null);
     const budget=endings(baseChosen).size;
     const choices:{method:Method;candidates:Candidate[]}[]=[
      {method:'MV1',candidates:base},
      {method:'AUX',candidates:support},
      {method:'INTEGRAL',candidates:joined}
     ];
     for(let seed=0;seed<49;seed++)choices.push({
      method:'CONTROL',candidates:orderControl(base,support,day,turn,kind,seed)
     });
     for(const {method,candidates} of choices)
      for(const mode of ['TOP','IGUAL_PRESUPUESTO'] as const){
       const chosen=top(candidates,k,mode==='TOP'?null:budget);
       if(mode==='IGUAL_PRESUPUESTO'&&endings(chosen).size>budget)
        throw Error('Integral excedió presupuesto exacto');
       ranking.push({method,mode,k,kind,result:metric(heads,kind,chosen),
        candidates:chosen});
      }
    }
   }
   cuts.push({date:day,turn,heads,ranking,
    availableSources:{plus11:pre.columns.slice(0,TURNOS.indexOf(turn)+1).length,
     aux:Math.min(3,TURNOS.indexOf(turn))},
    poolSizes});
   if(day==='2026-10-20'){
    const display=KINDS.map(kind=>({
     kind,methods:['MV1','AUX','INTEGRAL'].map(method=>{
      const chosen=ranking.find(r=>r.method===method&&r.kind===kind&&
       r.k===3&&r.mode==='IGUAL_PRESUPUESTO')!;
      return {method,selected:chosen.candidates,result:chosen.result};
     })
    }));
    console.log('INTEGRAL_20OCT',JSON.stringify({date:day,turn,heads,display}));
   }
  }
 }
 if(!cuts.length)throw Error('No hay cortes históricos evaluables');
 const comparison=cuts.filter(c=>c.turn!=='Previa');
 const weeks=Array.from({length:4},(_,i)=>{
  const from=dates.find(d=>d===dateRange(FIRST,LAST)[i*7])||FIRST;
  const end=dateRange(FIRST,LAST)[i*7+6];
  return {from,to:end,summary:summarize(comparison.filter(c=>c.date>=from&&c.date<=end))};
 });
 const result={
  name:'Modelo Lalo Integral (laboratorio)',
  window:{from:FIRST,to:LAST,days:28,heatupFrom:WARMUP},
  configuration:'Ranking fijo 65/rankLalo + 35/rankAux, sin peso extra por duplicación; VT4 desde top10 madre VT3 integral',
  methodology:'Reconstrucción PRE; usar D−1 último día sorteado y D−7 si existe; seis jurisdicciones; sábado y feriados se respetan',
  limitation:'Evaluación retroactiva y período previamente inspeccionado: NO validación prospectiva',
  sourceErrors:errors,downloadedDays:good.length,
  allTurns:summarize(cuts),
  commonTurns:summarize(comparison),
  weeks,
  byTurn:TARGETS.map(turn=>({turn,summary:summarize(comparison.filter(c=>c.turn===turn))})),
  cuts
 };
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/modelo-lalo-integral-4semanas.json',
  JSON.stringify(result,null,2));
 console.log('INTEGRAL_RESUMEN',JSON.stringify({
  all:result.allTurns,comparable:result.commonTurns,
  weeks:result.weeks,byTurn:result.byTurn,
  sourceErrors:errors,downloadedDays:good.length
 }));
}
void main().catch(e=>{console.error('INTEGRAL_ERROR',e);process.exitCode=1});
