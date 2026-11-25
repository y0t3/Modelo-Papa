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
import {cellsFromPlus11} from '../src/paths';
import {auxiliaryBoard,enumerateAuxPaths} from '../src/auxSantiagoNeuquen';

const FROM=process.env.ADM_FROM||'2026-09-15',TO=process.env.ADM_TO||'2026-11-23';
type Cell={row:number;col:number;digit:string;source?:string};
type Family={v:string;values:string[];blocks:Set<string>;sources:Set<string>;straight:Set<string>;compact:Set<string>;paths:Set<string>;admitted:boolean;rank:number};
type Metric={cuts:number;heads:number;hits:number;expected:number;conditional:number;size:number;any:number};
const stats:Record<string,Metric>={},byTurn:Record<string,Metric>={},strata:Record<string,{hits:number;expected:number;size:number}>={};
const empty=():Metric=>({cuts:0,heads:0,hits:0,expected:0,conditional:0,size:0,any:0});
const rev=(v:string)=>[...v].reverse().join('');
const label=(v:string)=>[v,rev(v)].sort().join('/');
const values=(v:string)=>[...new Set(v.split('/'))];
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

function pool(routes:{source:string;path:Cell[]}[],historical:string[]):Family[]{
 const groups=new Map<string,Family>(),ranks=new Map(historical.map((v,i)=>[v,i+1]));
 for(const {source,path} of routes){
  const v=path.map(c=>c.digit).join('');
  if(!/^\d{3}$/.test(v)||new Set(path.map(c=>c.row+':'+c.col)).size!==3)throw Error('Ruta física inválida');
  const f=label(v),id=source+'|'+block(path);
  let g=groups.get(f);
  if(!g){g={v:f,values:values(f),blocks:new Set(),sources:new Set(),straight:new Set(),compact:new Set(),paths:new Set(),admitted:ranks.has(f),rank:ranks.get(f)||Infinity};groups.set(f,g);}
  g.blocks.add(id);
  for(const c of path)g.sources.add(c.source||source);
  const p=path.map(c=>c.row+':'+c.col).join('>'),q=path.slice().reverse().map(c=>c.row+':'+c.col).join('>');
  g.paths.add(source+'|'+[p,q].sort()[0]);
  if(path[1].row-path[0].row===path[2].row-path[1].row&&path[1].col-path[0].col===path[2].col-path[1].col)g.straight.add(id);
  if(Math.max(...path.map(c=>c.row))-Math.min(...path.map(c=>c.row))<=1&&Math.max(...path.map(c=>c.col))-Math.min(...path.map(c=>c.col))<=1)g.compact.add(id);
 }
 for(const f of historical)if(!groups.has(f))throw Error('Histórica sin ruta física '+f);
 return [...groups.values()];
}
function plusRoutes(columns:{id:string;values:string[]}[]){
 const out:{source:string;path:Cell[]}[]=[];
 for(const col of columns){
  const cells=cellsFromPlus11(col.values);
  const walk=(p:Cell[])=>{
   if(p.length===3){out.push({source:col.id,path:p});return;}
   const last=p[p.length-1];
   for(const c of cells)if(!p.includes(c)&&Math.max(Math.abs(c.row-last.row),Math.abs(c.col-last.col))===1)walk([...p,c]);
  };
  for(const c of cells)walk([c]);
 }
 return out;
}
function ranked(fs:Family[],rule:string,d:string,t:Turno){
 const features=(f:Family)=>rule==='bloques'?[f.blocks.size,f.sources.size]:rule==='fuentes'?[f.sources.size,f.blocks.size]:
 rule==='compactos'?[f.compact.size,f.blocks.size]:rule==='rectos'?[f.straight.size,f.blocks.size]:
 rule==='lecturas'?[f.paths.size,f.blocks.size]:rule==='historico_mas_fisico'?[Number(f.admitted),f.blocks.size,f.sources.size]:
 rule==='solo_descartadas'?[Number(!f.admitted),f.blocks.size,f.sources.size]:[];
 const tie=(a:Family,b:Family)=>hash(d+'|'+t+'|'+a.v)-hash(d+'|'+t+'|'+b.v)||a.v.localeCompare(b.v);
 return [...fs].sort((a,b)=>{
  if(rule==='actual')return a.rank-b.rank||tie(a,b);
  if(rule==='control')return tie(a,b);
  const x=features(a),y=features(b);
  for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];
  return tie(a,b);
 });
}



/** Frozen audit: no fitting or selection of a winner after observing POST.
 * Only AUX AYER, one observation per jurisdiction, equal exact-value budgets.
 * Conditional comparisons weight each exact suffix, not each route.
 */
const seeds=Array.from({length:32},(_,i)=>'fixed-control-'+i);
const scores:Record<string,(f:Family)=>number>={
 admitted:f=>Number(f.admitted),
 blocks:f=>f.blocks.size,
 compact:f=>f.compact.size,
 straight:f=>f.straight.size,
 sources:f=>f.sources.size,
 paths:f=>f.paths.size,
 official_rank:f=>f.admitted?-f.rank:-1e9,
 historical_physical:f=>Number(f.admitted)*10000+f.blocks.size*100+f.sources.size
};
type Contrast={n:number;observed:number;expected:number;informative:number;informativeSum:number};
type Daily={date:string;cuts:number;heads:number;formed:number;expectedPhysical:number;
 actual:number;combined:number;expected:number;conditional:number;controls:number[];
 contrast:Record<string,Contrast>};
const daily:Daily[]=[];
const make=(date:string):Daily=>({date,cuts:0,heads:0,formed:0,expectedPhysical:0,actual:0,combined:0,expected:0,conditional:0,controls:seeds.map(()=>0),contrast:{}});
const exact=(fs:Family[])=>new Set(fs.flatMap(f=>f.values));
function quotaTop(order:Family[],baseline:Family[]){
 const quota=new Map<number,number>();
 for(const f of baseline)quota.set(f.values.length,(quota.get(f.values.length)||0)+1);
 const out:Family[]=[];
 for(const f of order){const q=quota.get(f.values.length)||0;if(q){out.push(f);quota.set(f.values.length,q-1)}}
 if(out.length!==baseline.length||exact(out).size!==exact(baseline).size)throw Error('Presupuesto distinto');
 return out;
}
const strata:Record<string,(f:Family)=>string>={
 exact:f=>String(f.values.length),
 admission:f=>f.values.length+'|'+Number(f.admitted),
 geometry:f=>f.values.length+'|'+Number(f.admitted)+'|'+f.blocks.size,
 geometrySources:f=>f.values.length+'|'+Number(f.admitted)+'|'+f.blocks.size+'|'+f.sources.size
};
function percentile(f:Family,group:Family[],fn:(f:Family)=>number){
 // Midrank of every exact possible suffix in the matched group, including ties.
 const s=fn(f);let below=0,tied=0,total=0;
 for(const x of group){const n=x.values.length,q=fn(x);total+=n;if(q<s)below+=n;else if(q===s)tied+=n;}
 return {v:(below+tied/2)/total,informative:tied!==total};
}
function audit(day:Daily,t:Turno,fs:Family[],heads:string[]){
 if(!fs.length)return;
 const hist=fs.filter(f=>f.admitted).sort((a,b)=>a.rank-b.rank),baseline=hist.slice(0,10);
 const all=exact(fs),h=heads.map(x=>x.slice(-3)),formed=h.filter(x=>all.has(x));
 day.cuts++;day.heads+=h.length;day.formed+=formed.length;day.expectedPhysical+=h.length*all.size/1000;
 const a=exact(baseline),combined=exact(quotaTop(ranked(fs,'historico_mas_fisico',day.date,t),baseline));
 day.actual+=h.filter(x=>a.has(x)).length;day.combined+=h.filter(x=>combined.has(x)).length;
 day.expected+=h.length*a.size/1000;day.conditional+=formed.length*a.size/all.size;
 seeds.forEach((seed,i)=>{
  const order=[...fs].sort((a,b)=>hash(seed+'|'+day.date+'|'+t+'|'+a.v)-hash(seed+'|'+day.date+'|'+t+'|'+b.v)||a.v.localeCompare(b.v));
  const set=exact(quotaTop(order,baseline));day.controls[i]+=h.filter(x=>set.has(x)).length;
 });
 const byValue=new Map(fs.flatMap(f=>f.values.map(v=>[v,f] as const)));
 for(const [stratum,groupKey] of Object.entries(strata)){
  const groups=new Map<string,Family[]>();
  for(const f of fs){const key=groupKey(f),g=groups.get(key)||[];g.push(f);groups.set(key,g)}
  for(const [name,fn] of Object.entries(scores)){
   const key=stratum+'|'+name,c=day.contrast[key]||(day.contrast[key]={n:0,observed:0,expected:0,informative:0,informativeSum:0});
   for(const value of formed){const f=byValue.get(value)!;const p=percentile(f,groups.get(groupKey(f))!,fn);
    c.n++;c.observed+=p.v;c.expected+=0.5;if(p.informative){c.informative++;c.informativeSum+=p.v}
   }
  }
 }
}
async function build(d:string){
 const current=await draw(d);if(!hasDrawResults(current))return null;
 const week=shiftDay(d,-7);
 const [previous,weekly,raw]=await Promise.all([loadPreviousDraws(d,1,draw),draw(week),base(d)]);
 if(raw.sourceDate>=d)throw Error('Fuga temporal AUX');
 const refs:{date:string;period:'D−1'|'D−7'}[]=[{date:previous[0].date,period:'D−1'}];
 if(hasDrawResults(weekly))refs.push({date:week,period:'D−7'});
 const history:AuxiliaryHistorical[]=await Promise.all(refs.map(async r=>{
  if(r.date>=d)throw Error('Fuga temporal raíces');return {...r,aux:await roots(r.date,'anterior')};
 }));
 const day=make(d);
 for(const t of TURNOS){
  const heads=JURS.filter(j=>j!=='Montevideo').map(j=>current[t]?.[j]||'');
  if(!heads.every(x=>/^\d{4}$/.test(x)))continue;
  const cut=auxAtCut(raw.heads,t,'anterior'),rank=buildAuxIndependent(d,t,cut,history);
  const routes=enumerateAuxPaths(auxiliaryBoard(cut,t),3).map(path=>({source:'aux',path}));
  audit(day,t,pool(routes,rank[3].map(f=>f.family)),heads);
 }
 return day.cuts?day:null;
}
function selfTest(){
 const routes=plusRoutes([{id:'prevNocturno',values:['12','34','56','78','90','12']}]);
 const all=pool(routes,[]),fs=pool(routes,all.slice(0,10).map(f=>f.v)),day=make('2025-01-01');
 const group=fs.filter(f=>f.values.length===2);
 for(const fn of Object.values(scores)){
  const n=group.reduce((s,f)=>s+f.values.length,0);
  const mean=group.reduce((s,f)=>s+f.values.length*percentile(f,group,fn).v,0)/n;
  if(Math.abs(mean-0.5)>1e-10)throw Error('Control de percentiles inválido');
 }
 audit(day,'Previa',fs,['0123','0321','0124','0789','0000']);
 if(day.controls.length!==32||day.heads!==5)throw Error('Control de auditoría');
 console.log('DISCRIMINATION_SELF_TEST_OK');
}
async function main(){
 selfTest();const skips:{date:string;error:string}[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  try{const day=await build(d);if(day)daily.push(day)}
  catch(e){if(/Fuga temporal|Presupuesto distinto|Ruta física inválida|Histórica sin ruta física/.test(String(e)))throw e;skips.push({date:d,error:String(e)});}
 }
 if(!daily.length)throw Error('Sin jornadas');
 const total=make('total');
 for(const day of daily){
  for(const k of ['cuts','heads','formed','expectedPhysical','actual','combined','expected','conditional'] as const)total[k]+=day[k];
  day.controls.forEach((n,i)=>total.controls[i]+=n);
  for(const [k,x] of Object.entries(day.contrast)){const y=total.contrast[k]||(total.contrast[k]={n:0,observed:0,expected:0,informative:0,informativeSum:0});for(const p of ['n','observed','expected','informative','informativeSum'] as const)y[p]+=x[p]}
  console.log('DISCRIMINATION_DAY',JSON.stringify(day));
 }
 console.log('DISCRIMINATION_TOTAL',JSON.stringify({from:FROM,to:TO,days:daily.length,skips,total,seeds}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
