/**
 * Laboratorio cronológico de reglas fijas vs selección reciente.
 * Mismo universo físico de cada motor, sin modificar la aplicación.
 * PRE: seleccionar con jornadas estrictamente anteriores y turno idéntico.
 * POST: cinco cabezas, aciertos por cabeza y exposición exacta de las familias.
 */
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {fetchAuxiliaryBaseForDate,fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import {buildMotorLalo, type LaloHistorical} from '../src/motorLalo';
import {buildAuxIndependent,type AuxiliaryHistorical} from '../src/motorLaloIntegral';
import {rankPlusVt4,rankAuxVt4} from '../src/vt4Independent';
import {plusVt4Timeline,auxVt4Timeline,unchangedSince} from '../src/vt4Timeline';
const FROM=process.env.ADAPT_FROM||'2026-09-15',TO=process.env.ADAPT_TO||'2026-11-23';
const windows=[5,10,20,30] as const;
const rules=['actual','D1','D7','fisico','fuentes','control'] as const;
const vt4rules=['actual','dos','fuentes','permanencia','control'] as const;
type F={v:string;rank:number;d1:number;d7:number;blocks:number;sources:number;age:number};
type Result={hits:number;expected:number;exposure:number;familyCount:number;any:number;heads:number;conditional:number};
type DayRow={date:string;turn:Turno;engine:string;kind:number;results:Record<string,Result>};
type Aggregate=Result&{cuts:number};
const drawCache=new Map<string,Promise<CabezasDia>>();
const baseCache=new Map<string,ReturnType<typeof fetchAuxiliaryBaseForDate>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
const rootCache=new Map<string,Promise<AuxiliaryHistorical['aux']>>();
function draw(d:string){let p=drawCache.get(d);if(!p){p=descargarCabezas(d,true);drawCache.set(d,p)}return p;}
function base(d:string){let p=baseCache.get(d);if(!p){p=fetchAuxiliaryBaseForDate(d);baseCache.set(d,p)}return p;}
function aux(d:string){let p=auxCache.get(d);if(!p){p=fetchAuxiliaryHeads(d);auxCache.set(d,p)}return p;}
function roots(d:string,mode:'anterior'|'intrajornada'){
 const key=d+'|'+mode;let p=rootCache.get(key);
 if(!p){p=Promise.all([draw(d),mode==='anterior'?base(d):aux(d)]).then(([h,a])=>extractAuxHistoryMode(d,a.heads,h,mode));rootCache.set(key,p)}
 return p;
}
const hash=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const block=(p:{row:number;col:number}[])=>p.map(c=>c.row+':'+c.col).sort().join('|');
function ordered(fs:F[],rule:string,d:string,t:Turno){
 const weight=(f:F)=>rule==='D1'?[f.d1,f.d7]:rule==='D7'?[f.d7,f.d1]:
 rule==='fisico'?[f.blocks]:rule==='fuentes'?[f.sources,f.blocks]:rule==='dos'?[Number(f.blocks===2),f.blocks]:
 rule==='permanencia'?[f.age,f.blocks]:[];
 return [...fs].sort((a,b)=>{
  if(rule==='actual')return a.rank-b.rank;
  if(rule==='control')return hash(d+'|'+t+'|control|'+a.v)-hash(d+'|'+t+'|control|'+b.v)||a.v.localeCompare(b.v);
  const x=weight(a),y=weight(b);
  for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];
  return a.rank-b.rank;
 });
}
function score(fs:F[],d:string,t:Turno,kind:number,heads:string[]):Record<string,Result>{
 const h=heads.map(x=>x.slice(-kind)),pool=new Set(fs.flatMap(f=>f.v.split('/')));
 const formed=h.filter(x=>pool.has(x)).length;
 // Exact same number of distinct families, and exact same total number of
 // distinct values for every method (palindromes have capacity one).
 // Use baseline's count by family capacity, not an extra candidate budget.
 const baseline=ordered(fs,'actual',d,t).slice(0,10);
 const quotas=new Map<number,number>();
 for(const f of baseline){const n=new Set(f.v.split('/')).size;quotas.set(n,(quotas.get(n)||0)+1);}
 return Object.fromEntries((kind===4?vt4rules:rules).map(rule=>{
  const remaining=new Map(quotas),chosen:F[]=[];
  for(const f of ordered(fs,rule,d,t)){
   const n=new Set(f.v.split('/')).size,q=remaining.get(n)||0;
   if(q){chosen.push(f);remaining.set(n,q-1)}
   if(chosen.length===baseline.length)break;
  }
  const values=new Set(chosen.flatMap(f=>f.v.split('/')));
  const hits=h.filter(x=>values.has(x)).length;
  return [rule,{hits,expected:h.length*values.size/10**kind,exposure:values.size,familyCount:chosen.length,
   any:Number(hits>0),heads:h.length,conditional:pool.size?formed*values.size/pool.size:0}];
 }));
}
async function build(d:string):Promise<DayRow[]>{
 const current=await draw(d);if(!hasDrawResults(current))return [];
 const week=shiftDay(d,-7);
 const [previous,weekly,beforeWeek,noct]=await Promise.all([loadPreviousDraws(d,2,draw),draw(week),loadPreviousDraws(week,1,draw),nocturnaAnteriorPorJur(d,draw)]);
 const last=previous[1],before=previous[0];
 const hist:LaloHistorical[]=[{date:last.date,period:'D−1',sheet:buildSheet(last.heads,before.heads)}];
 if(hasDrawResults(weekly))hist.push({date:week,period:'D−7',sheet:buildSheet(weekly,beforeWeek[0].heads)});
 const sheet=buildSheet(current,noct.heads);
 const auxInputs=await Promise.all((['anterior','intrajornada'] as const).map(async mode=>{
  try{
   const raw=await (mode==='anterior'?base(d):aux(d));
   // Match the installed app: VT2/3 are empty when historical roots fail.
   const history=await Promise.all(hist.map(async h=>({date:h.date,period:h.period,aux:await roots(h.date,mode)}))).catch(()=>[]);
   return {mode,raw:raw.heads,history};
  }catch{return null}
 }));
 const rows:DayRow[]=[];
 for(const t of TURNOS){
  const heads=JURS.filter(j=>j!=='Montevideo').map(j=>current[t]?.[j]||'');
  if(!heads.every(x=>/^\d{4}$/.test(x)))continue;
  const push=(engine:string,kind:number,fs:F[])=>{
   if(!fs.length)return;
   rows.push({date:d,turn:t,engine,kind,results:score(fs,d,t,kind,heads)});
  };
  const view=buildMotorLalo(sheet,d,t,hist);
  for(const k of [2,3] as const)push('lalo',k,view.ranks[k===2?'vt2':'vt3'].map(f=>({v:f.family,rank:f.rank,d1:f.d1Roots,d7:f.d7Roots,blocks:f.physicalBlocks,sources:f.sourceCount,age:0})));
  push('lalo',4,rankPlusVt4(sheet,d,t).map(f=>{
   const since=unchangedSince(plusVt4Timeline(sheet,f.paths,t));
   return {v:f.family,rank:f.rank,d1:0,d7:0,blocks:f.physicalBlocks,sources:f.sourceCount,age:since?TURNOS.indexOf(t)-TURNOS.indexOf(since):0};
  }));
  for(const input of auxInputs){
   if(!input)continue;
   const engine=input.mode==='anterior'?'ayer':'hoy',cut=auxAtCut(input.raw,t,input.mode);
   const ranks=buildAuxIndependent(d,t,cut,input.history);
   for(const k of [2,3] as const)push(engine,k,ranks[k].map(f=>({v:f.family,rank:f.rank,d1:f.d1,d7:f.d7,blocks:new Set(f.paths.map(block)).size,sources:f.sources.length,age:0})));
   push(engine,4,rankAuxVt4(cut,d,t).map(f=>{
    const since=unchangedSince(auxVt4Timeline(f.routes,t,engine));
    return {v:f.family,rank:f.rank,d1:0,d7:0,blocks:f.physicalBlocks,sources:f.sources.length,age:since?TURNOS.indexOf(t)-TURNOS.indexOf(since):0};
   }));
  }
 }
 return rows;
}
const empty=():Aggregate=>({cuts:0,hits:0,expected:0,exposure:0,familyCount:0,any:0,heads:0,conditional:0});
function add(a:Aggregate,b:Result){a.cuts++;for(const k of ['hits','expected','exposure','familyCount','any','heads','conditional'] as const)a[k]+=b[k];}
const key=(r:DayRow)=>[r.engine,r.kind,r.turn].join('|');
function choose(past:DayRow[],w:number):string{
 const sample=past.slice(-w);
 if(sample.length<w)return 'actual';
 let selected='actual',best=0;
 for(const rule of Object.keys(sample[0].results)){
  if(rule==='actual'||rule==='control')continue;
  // Paired excess vs fixed baseline. Equal exposure by construction.
  const gain=sample.reduce((n,r)=>n+r.results[rule].hits-r.results.actual.hits,0);
  if(gain>best){selected=rule;best=gain;}
 }
 return selected;
}
async function main(){
 const past=new Map<string,DayRow[]>(),aggregate:Record<string,Aggregate>={},choices:Record<string,number>={},days:Record<string,Record<string,Aggregate>>={},skips:{date:string;error:string}[]=[];
 let warm=0,evaluated=0;
 for(let d=shiftDay(FROM,-50);d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  let rows:DayRow[];
  try{rows=await build(d)}catch(e){skips.push({date:d,error:String(e)});continue;}
  if(!rows.length)continue;
  if(d<FROM)warm++;else evaluated++;
  for(const r of rows){
   const k=key(r),history=past.get(k)||[];
   if(history.some(x=>x.date>=d))throw Error('Fuga temporal');
   const selections=Object.fromEntries(windows.map(w=>['adapt_'+w,choose(history,w)]));
   if(d>=FROM){
    const day=days[d]||(days[d]={});
    const record=(name:string,result:Result)=>{
     const id=k+'|'+name;add(aggregate[id]||(aggregate[id]=empty()),result);
     const global=r.engine+'|'+r.kind+'|'+name;add(day[global]||(day[global]=empty()),result);
    };
    for(const [rule,result] of Object.entries(r.results))record(rule,result);
    for(const [name,rule] of Object.entries(selections)){
     record(name,r.results[rule]);const id=k+'|'+name+'|'+rule;choices[id]=(choices[id]||0)+1;
    }
   }
   history.push(r);past.set(k,history.slice(-30));
  }
  console.log('ADAPT_DAY',d,rows.length,d<FROM?'warm':'eval');
 }
 if(!evaluated)throw Error('Sin jornadas evaluadas');
 console.log('ADAPT_JSON_START');console.log(JSON.stringify({from:FROM,to:TO,warm,evaluated,skips,aggregate,choices,days}));console.log('ADAPT_JSON_END');
}
main().catch(e=>{console.error(e);process.exitCode=1});
