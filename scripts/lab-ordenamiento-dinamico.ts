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
import {cellsFromPlus11} from '../src/paths';
import {auxiliaryBoard,enumerateAuxPaths} from '../src/auxSantiagoNeuquen';
const FROM=process.env.ADAPT_FROM||'2026-09-15',TO=process.env.ADAPT_TO||'2026-11-23';
const windows=[5,10,20,30] as const;
const rules=['actual','D1','D7','fisico','fuentes','control'] as const;
const vt4rules=['actual','dos','fuentes','permanencia','control'] as const;
type F={v:string;rank:number;d1:number;d7:number;blocks:number;sources:number;age:number};
type Result={hits:number;expected:number;exposure:number;familyCount:number;any:number;heads:number;conditional:number};
type DayRow={date:string;turn:Turno;engine:string;kind:number;results:Record<string,Result>};
type Frame=Omit<DayRow,'results'>&{fs:F[];heads:string[];physical:Set<string>};
type Position={physicalHits:number;physicalExpected:number;admittedHits:number;admittedExpected:number;bins:number[];expected:number[];conditional:number[];pool:number;families:number;rankFraction:number;rankCount:number};
const emptyPosition=():Position=>({physicalHits:0,physicalExpected:0,admittedHits:0,admittedExpected:0,bins:Array(5).fill(0),expected:Array(5).fill(0),conditional:Array(5).fill(0),pool:0,families:0,rankFraction:0,rankCount:0});
function plusPhysical(columns:{values:string[]}[],n:number){
 const out=new Set<string>();
 for(const col of columns){
  const cells=cellsFromPlus11(col.values);
  const walk=(p:typeof cells)=>{
   if(p.length===n){out.add(p.map(c=>c.digit).join(''));return;}
   const last=p[p.length-1];
   for(const c of cells)if(!p.includes(c)&&Math.max(Math.abs(c.row-last.row),Math.abs(c.col-last.col))===1)walk([...p,c]);
  };
  for(const c of cells)walk([c]);
 }
 return out;
}
const names=(kind:number):string[]=>[...(kind===4?vt4rules:rules)];
const activeRules=(kind:number)=>names(kind).filter(x=>x!=='control');
const capacity=(f:F)=>new Set(f.v.split('/')).size;
function sameBudget(ranking:F[],baseline:F[]){
 const quotas=new Map<number,number>();
 for(const f of baseline){const n=capacity(f);quotas.set(n,(quotas.get(n)||0)+1);}
 const remaining=new Map(quotas),chosen:F[]=[],rest:F[]=[];
 for(const f of ranking){
  const n=capacity(f),q=remaining.get(n)||0;
  if(q){chosen.push(f);remaining.set(n,q-1)}else rest.push(f);
 }
 if(chosen.length!==baseline.length||chosen.reduce((n,f)=>n+capacity(f),0)!==baseline.reduce((n,f)=>n+capacity(f),0))throw Error('Exposición distinta');
 return [...chosen,...rest];
}
function positions(out:Position,ranking:F[],physical:Set<string>,heads:string[],kind:number){
 const h=heads.map(x=>x.slice(-kind)),den=10**kind;
 const lookup=new Map<string,number>();
 const bin=(p:number)=>p<=5?0:p<=10?1:p<=20?2:p<=30?3:4;
 const counts=Array(5).fill(0);
 ranking.forEach((f,i)=>{for(const v of new Set(f.v.split('/'))){
  if(lookup.has(v))throw Error('Valor duplicado');
  lookup.set(v,i+1);counts[bin(i+1)]++;
 }});
 for(const v of lookup.keys())if(!physical.has(v))throw Error('Candidato sin formación física '+v);
 const formed=h.filter(x=>lookup.has(x)).length;
 out.physicalHits+=h.filter(x=>physical.has(x)).length;
 out.physicalExpected+=h.length*physical.size/den;
 out.admittedHits+=formed;out.admittedExpected+=h.length*lookup.size/den;
 out.pool+=lookup.size;out.families+=ranking.length;
 for(const x of h){const p=lookup.get(x);if(p){out.bins[bin(p)]++;out.rankCount++;out.rankFraction+=p/ranking.length;}}
 for(let i=0;i<5;i++){out.expected[i]+=h.length*counts[i]/den;out.conditional[i]+=lookup.size?formed*counts[i]/lookup.size:0;}
}

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
function score(r:Frame,history:DayRow[]){
 const {fs,date:d,turn:t,kind,heads}=r;
 const h=heads.map(x=>x.slice(-kind)),pool=new Set(fs.flatMap(f=>f.v.split('/')));
 const formed=h.filter(x=>pool.has(x)).length;
 const rankings:Record<string,F[]>=Object.fromEntries(names(kind).map(rule=>[rule,ordered(fs,rule,d,t)]));
 const baseline=rankings.actual.slice(0,10);
 const result:Record<string,Result>={},selected:Record<string,string>={},weights:Record<string,Record<string,number>>={};
 const put=(rule:string,ranking:F[])=>{
  const full=sameBudget(ranking,baseline);
  rankings[rule]=full;
  const chosen=full.slice(0,baseline.length),values=new Set(chosen.flatMap(f=>f.v.split('/')));
  const hits=h.filter(x=>values.has(x)).length;
  result[rule]={hits,expected:h.length*values.size/10**kind,exposure:values.size,familyCount:chosen.length,
   any:Number(hits>0),heads:h.length,conditional:pool.size?formed*values.size/pool.size:0};
 };
 for(const rule of names(kind))put(rule,rankings[rule]);
 for(const w of windows){
  const sample=history.slice(-w),available=sample.length===w;
  const eligible=activeRules(kind);
  const gain=(rule:string,rows:DayRow[])=>rows.reduce((n,x)=>n+x.results[rule].hits-x.results.actual.hits,0);
  const direct=choose(history,w);
  selected['adapt_'+w]=direct;
  put('adapt_'+w,rankings[direct]);
  // Stable: positive paired gains in both halves, total at least two.
  // No evidence -> fallback to current. Thresholds fixed before data.
  let stable='actual',best=0;
  if(available)for(const rule of eligible.filter(x=>x!=='actual')){
   const a=gain(rule,sample.slice(0,Math.floor(w/2))),b=gain(rule,sample.slice(Math.floor(w/2)));
   if(a>0&&b>0&&a+b>=2&&a+b>best){stable=rule;best=a+b;}
  }
  selected['stable_'+w]=stable;
  put('stable_'+w,rankings[stable]);
  // Weighted: fixed anchor plus positive recent paired evidence, shrink by
  // two pseudo-hits. No recent evidence -> exact baseline. Control excluded.
  const evidence=eligible.filter(x=>x!=='actual').map(rule=>({rule,gain:available?Math.max(0,gain(rule,sample)):0}));
  const total=evidence.reduce((n,x)=>n+x.gain,0);
  const ws:Record<string,number>={actual:2/(total+2)};
  for(const x of evidence)ws[x.rule]=x.gain/(total+2);
  weights['weighted_'+w]=ws;
  if(!total){put('weighted_'+w,rankings.actual);continue;}
  const strength=new Map(fs.map(f=>[f.v,0]));
  for(const [rule,v] of Object.entries(ws))if(v>0){
   rankings[rule].forEach((f,i)=>strength.set(f.v,strength.get(f.v)!+v/(10+i+1)));
  }
  const combined=[...fs].sort((a,b)=>strength.get(b.v)!-strength.get(a.v)!||a.rank-b.rank);
  put('weighted_'+w,combined);
 }
 return {result,rankings,selected,weights};
}
async function build(d:string):Promise<Frame[]>{
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
 const rows:Frame[]=[];
 for(const t of TURNOS){
  const heads=JURS.filter(j=>j!=='Montevideo').map(j=>current[t]?.[j]||'');
  if(!heads.every(x=>/^\d{4}$/.test(x)))continue;
  const push=(engine:string,kind:number,fs:F[],physical:Set<string>)=>{
   // Empty admitted pools still count in physical coverage, but have no
   // ranking. AUX HOY before Previa has no physical cells.
   if(!physical.size&&!fs.length)return;
   rows.push({date:d,turn:t,engine,kind,fs,heads,physical});
  };
  const view=buildMotorLalo(sheet,d,t,hist);
  for(const k of [2,3] as const)push('lalo',k,view.ranks[k===2?'vt2':'vt3'].map(f=>({v:f.family,rank:f.rank,d1:f.d1Roots,d7:f.d7Roots,blocks:f.physicalBlocks,sources:f.sourceCount,age:0})),plusPhysical(sheet.columns.slice(0,TURNOS.indexOf(t)+1),k));
  push('lalo',4,rankPlusVt4(sheet,d,t).map(f=>{
   const since=unchangedSince(plusVt4Timeline(sheet,f.paths,t));
   return {v:f.family,rank:f.rank,d1:0,d7:0,blocks:f.physicalBlocks,sources:f.sourceCount,age:since?TURNOS.indexOf(t)-TURNOS.indexOf(since):0};
  }),plusPhysical(sheet.columns.slice(0,TURNOS.indexOf(t)+1),4));
  for(const input of auxInputs){
   if(!input)continue;
   const engine=input.mode==='anterior'?'ayer':'hoy',cut=auxAtCut(input.raw,t,input.mode);
   const ranks=buildAuxIndependent(d,t,cut,input.history);
   const physical=(k:2|3|4)=>new Set(enumerateAuxPaths(auxiliaryBoard(cut,t),k).map(p=>p.map(c=>c.digit).join('')));
   for(const k of [2,3] as const)push(engine,k,ranks[k].map(f=>({v:f.family,rank:f.rank,d1:f.d1,d7:f.d7,blocks:new Set(f.paths.map(block)).size,sources:f.sources.length,age:0})),physical(k));
   push(engine,4,rankAuxVt4(cut,d,t).map(f=>{
    const since=unchangedSince(auxVt4Timeline(f.routes,t,engine));
    return {v:f.family,rank:f.rank,d1:0,d7:0,blocks:f.physicalBlocks,sources:f.sources.length,age:since?TURNOS.indexOf(t)-TURNOS.indexOf(since):0};
   }),physical(4));
  }
 }
 return rows;
}
const empty=():Aggregate=>({cuts:0,hits:0,expected:0,exposure:0,familyCount:0,any:0,heads:0,conditional:0});
function add(a:Aggregate,b:Result){a.cuts++;for(const k of ['hits','expected','exposure','familyCount','any','heads','conditional'] as const)a[k]+=b[k];}
const key=(r:Pick<DayRow,'engine'|'kind'|'turn'>)=>[r.engine,r.kind,r.turn].join('|');
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
 const past=new Map<string,DayRow[]>(),aggregate:Record<string,Aggregate>={},choices:Record<string,number>={},days:Record<string,Record<string,Aggregate>>={},positionStats:Record<string,Position>={},weightSums:Record<string,number>={},skips:{date:string;error:string}[]=[];
 let warm=0,evaluated=0;
 for(let d=shiftDay(FROM,-50);d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  let rows:Frame[];
  try{rows=await build(d)}catch(e){skips.push({date:d,error:String(e)});continue;}
  if(!rows.length)continue;
  if(d<FROM)warm++;else evaluated++;
  for(const r of rows){
   const k=key(r),history=past.get(k)||[];
   if(history.some(x=>x.date>=d))throw Error('Fuga temporal');
   const {result,rankings,selected,weights}=score(r,history);
   if(d>=FROM){
    const day=days[d]||(days[d]={});
    const record=(name:string,result:Result)=>{
     const id=k+'|'+name;add(aggregate[id]||(aggregate[id]=empty()),result);
     const global=r.engine+'|'+r.kind+'|'+name;add(day[global]||(day[global]=empty()),result);
     positions(positionStats[id]||(positionStats[id]=emptyPosition()),rankings[name],r.physical,r.heads,r.kind);
    };
    for(const [rule,res] of Object.entries(result))record(rule,res);
    for(const [name,rule] of Object.entries(selected)){const id=k+'|'+name+'|'+rule;choices[id]=(choices[id]||0)+1;}
    for(const [name,ws] of Object.entries(weights))for(const [rule,v] of Object.entries(ws)){
     const id=k+'|'+name+'|'+rule;weightSums[id]=(weightSums[id]||0)+v;
    }
   }
   if(r.fs.length){history.push({date:r.date,turn:r.turn,engine:r.engine,kind:r.kind,results:result});past.set(k,history.slice(-30));}
  }
  console.log('ADAPT_DAY',d,rows.length,d<FROM?'warm':'eval');
 }
 if(!evaluated)throw Error('Sin jornadas evaluadas');
 for(const [date,metrics] of Object.entries(days))console.log('ADAPT_DAILY',JSON.stringify({date,metrics:Object.fromEntries(Object.entries(metrics).map(([k,v])=>[k,[v.hits,v.expected,v.heads,v.cuts]]))}));
 console.log('ADAPT_JSON_START');console.log(JSON.stringify({from:FROM,to:TO,warm,evaluated,skips}));console.log('ADAPT_JSON_END');
 for(const engine of ['lalo','ayer','hoy'])for(const kind of [2,3,4]){
  const prefix=engine+'|'+kind+'|';
  const subset=<T>(x:Record<string,T>)=>Object.fromEntries(Object.entries(x).filter(([k])=>k.startsWith(prefix)));
  console.log('ORDER_METRICS',JSON.stringify({engine,kind,aggregate:subset(aggregate),choices:subset(choices),positionStats:subset(positionStats),weightSums:subset(weightSums)}));
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});
