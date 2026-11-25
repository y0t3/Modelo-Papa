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

const N=64;
const rules=['actual','combinado_original','solo_historia','solo_bloques','historia_bloques','historia_fuentes','historia_bloques_dispersion','historia_bloques_compacidad'] as const;
type Rule=typeof rules[number];
const modes=['global','admision','admision_bloques','admision_bloques_fuentes'] as const;
type Mode=typeof modes[number];
const exact=(fs:Family[])=>new Set(fs.flatMap(f=>f.values));
const k0=(f:Family)=>String(f.values.length);
const key:Record<Mode,(f:Family)=>string>={
 global:k0,
 admision:f=>[k0(f),+f.admitted].join('|'),
 admision_bloques:f=>[k0(f),+f.admitted,f.blocks.size].join('|'),
 admision_bloques_fuentes:f=>[k0(f),+f.admitted,f.blocks.size,f.sources.size].join('|')
};
function quotaTop(order:Family[],target:Family[],group:(f:Family)=>string){
 const quota=new Map<string,number>();for(const f of target){const k=group(f);quota.set(k,(quota.get(k)||0)+1)}
 const out:Family[]=[];for(const f of order){const k=group(f),q=quota.get(k)||0;if(q){out.push(f);quota.set(k,q-1)}}
 if(out.length!==target.length||exact(out).size!==exact(target).size||[...quota.values()].some(q=>q!==0))throw Error('Presupuesto distinto');
 return out;
}
function shuffled(fs:Family[],seed:string){
 let state=hash(seed)||1;const a=[...fs].sort((x,y)=>x.v.localeCompare(y.v));
 for(let i=a.length-1;i>0;i--){state^=state<<13;state^=state>>>17;state^=state<<5;const j=Math.floor((state>>>0)/4294967296*(i+1));[a[i],a[j]]=[a[j],a[i]]}
 return a;
}
function distribution(f:Family){
 const cells=new Set<string>();let min=Infinity,max=-Infinity;
 for(const b of f.blocks){for(const p of b.split('|').slice(1)){cells.add(p);const col=Number(p.split(':')[1]);min=Math.min(min,col);max=Math.max(max,col)}}
 return [max-min,cells.size/Math.max(1,f.blocks.size),f.compact.size/Math.max(1,f.blocks.size)];
}
function order(fs:Family[],rule:Rule,d:string,t:Turno){
 const dis=new Map(fs.map(f=>[f.v,distribution(f)]));
 const score=(f:Family)=>{const [span,spread,compact]=dis.get(f.v)!;switch(rule){
 case 'solo_historia':return [+f.admitted];
 case 'solo_bloques':return [f.blocks.size];
 case 'historia_bloques':return [+f.admitted,f.blocks.size];
 case 'historia_fuentes':return [+f.admitted,f.sources.size];
 case 'historia_bloques_dispersion':return [+f.admitted,f.blocks.size,span,spread];
 case 'historia_bloques_compacidad':return [+f.admitted,f.blocks.size,compact];
 default:return [+f.admitted,f.blocks.size,f.sources.size];
 }};
 return [...fs].sort((a,b)=>{const x=score(a),y=score(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];return hash(d+'|'+t+'|'+a.v)-hash(d+'|'+t+'|'+b.v)||a.v.localeCompare(b.v)});
}
type Daily={date:string;cuts:number;heads:number;formed:number;expectedPhysical:number;expected:number;hits:Record<Rule,number>;control:Record<Mode,number[]>;conditional:Record<Mode,number>;admittedHeads:number;admittedExpected:number;deltaByTurn:Record<string,{cuts:number;actual:number;combined:number;expected:number}>};
const make=(date:string):Daily=>({date,cuts:0,heads:0,formed:0,expectedPhysical:0,expected:0,hits:Object.fromEntries(rules.map(k=>[k,0])) as Record<Rule,number>,control:Object.fromEntries(modes.map(k=>[k,Array(N).fill(0)])) as Record<Mode,number[]>,conditional:Object.fromEntries(modes.map(k=>[k,0])) as Record<Mode,number>,admittedHeads:0,admittedExpected:0,deltaByTurn:{}});
const daily:Daily[]=[];
function audit(day:Daily,t:Turno,fs:Family[],heads:string[]){
 if(!fs.length)return;
 const baseline=fs.filter(f=>f.admitted).sort((a,b)=>a.rank-b.rank).slice(0,10);
 if(!baseline.length)return;
 const all=exact(fs),h=heads.map(x=>x.slice(-3)),formed=h.filter(x=>all.has(x)),admitted=exact(fs.filter(f=>f.admitted));
 const original=quotaTop(ranked(fs,'historico_mas_fisico',day.date,t),baseline,k0);
 const picks=Object.fromEntries(rules.map(rule=>[rule,rule==='actual'?baseline:rule==='combinado_original'?original:quotaTop(order(fs,rule,day.date,t),baseline,k0)])) as Record<Rule,Family[]>;
 const hits=(f:Family[])=>{const s=exact(f);return h.filter(x=>s.has(x)).length};
 day.cuts++;day.heads+=h.length;day.formed+=formed.length;day.expectedPhysical+=h.length*all.size/1000;day.expected+=h.length*exact(baseline).size/1000;
 day.admittedHeads+=h.filter(x=>admitted.has(x)).length;day.admittedExpected+=h.length*admitted.size/1000;
 for(const r of rules)day.hits[r]+=hits(picks[r]);
 const turn=day.deltaByTurn[t]||(day.deltaByTurn[t]={cuts:0,actual:0,combined:0,expected:0});turn.cuts++;turn.actual+=hits(baseline);turn.combined+=hits(original);turn.expected+=h.length*exact(baseline).size/1000;
 // Match actual composition of the ORIGINAL combined selection. Controls
 // condition on successively more information; any residual is NOT assumed causal.
 const byValue=new Map(fs.flatMap(f=>f.values.map(v=>[v,f] as const)));
 for(const m of modes){
  const group=key[m],counts=new Map<string,number>(),selected=new Map<string,number>();
  for(const f of fs){const k=group(f);counts.set(k,(counts.get(k)||0)+f.values.length)}
  for(const f of original){const k=group(f);selected.set(k,(selected.get(k)||0)+f.values.length)}
  for(const v of formed){const k=group(byValue.get(v)!);day.conditional[m]+=(selected.get(k)||0)/counts.get(k)!}
 }
 for(let i=0;i<N;i++){
  const rnd=shuffled(fs,'decompose|'+day.date+'|'+t+'|'+i);
  for(const m of modes)day.control[m][i]+=hits(quotaTop(rnd,original,key[m]));
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
  if(r.date>=d)throw Error('Fuga temporal raíces');const prior=await base(r.date);if(prior.sourceDate>=r.date)throw Error('Fuga temporal fuente histórica');return {...r,aux:await roots(r.date,'anterior')};
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
 const all=pool(routes,[]),fs=pool(routes,all.slice(0,10).map(f=>f.v)),d=make('2025-01-01');
 const baseline=fs.filter(f=>f.admitted),rnd=shuffled(fs,'test');
 if(new Set(rnd.map(f=>f.v)).size!==fs.length)throw Error('Control duplicado');
 for(const m of modes){const target=quotaTop(rnd,baseline,key[m]);if(exact(target).size!==exact(baseline).size)throw Error('Presupuesto distinto');for(const k of new Set(baseline.map(key[m])))if(target.filter(f=>key[m](f)===k).length!==baseline.filter(f=>key[m](f)===k).length)throw Error('Estrato distinto')}
 audit(d,'Previa',fs,['0123','0321','0124','0789','0000']);
 if(d.control.global.length!==N||d.heads!==5)throw Error('Control de auditoría');
 console.log('DECOMPOSE_SELF_TEST_OK');
}
async function main(){
 selfTest();const skips:{date:string;error:string}[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  try{const day=await build(d);if(day)daily.push(day)}
  catch(e){if(/Fuga temporal|Presupuesto distinto|Ruta física inválida|Histórica sin ruta física|Estrato distinto/.test(String(e)))throw e;skips.push({date:d,error:String(e)})}
 }
 const total=make('total');
 for(const day of daily){
  for(const k of ['cuts','heads','formed','expectedPhysical','expected','admittedHeads','admittedExpected'] as const)total[k]+=day[k];
  for(const r of rules)total.hits[r]+=day.hits[r];
  for(const m of modes){total.conditional[m]+=day.conditional[m];day.control[m].forEach((v,i)=>total.control[m][i]+=v)}
  for(const [t,v] of Object.entries(day.deltaByTurn)){const x=total.deltaByTurn[t]||(total.deltaByTurn[t]={cuts:0,actual:0,combined:0,expected:0});for(const k of ['cuts','actual','combined','expected'] as const)x[k]+=v[k]}
  console.log('DECOMPOSE_DAY',JSON.stringify(day));
 }
 console.log('DECOMPOSE_TOTAL',JSON.stringify({from:FROM,to:TO,status:total.cuts?'evaluado':'sin_muestra',days:daily.length,skips,total,rules,modes,N}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
