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
const rules=['actual','combinado_original','compacidad','independientes','separacion','menos_solapamiento','mas_solapamiento','bordes_distintos','grupos_separados'] as const;
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
type Geometry={independent:number;disjoint:number;overlap:number;edges:number;components:number;compact:number};
// Physical blocks are unordered cell triples; paths reversed do not count twice.
// Exact set packing, branching on one occupied cell and memoizing available cells.
function geometry(f:Family):Geometry{
 const blocks=[...f.blocks].map(b=>b.split('|').slice(1));
 const cells=[...new Set(blocks.flat())];
 if(cells.length>30||blocks.some(b=>b.length!==3||new Set(b).size!==3))throw Error('Geometría inválida');
 const masks=blocks.map(b=>b.reduce((m,p)=>m|(1<<cells.indexOf(p)),0));
 const memo=new Map<number,number>();
 function pack(available:number):number{
  const cached=memo.get(available);if(cached!==undefined)return cached;
  const possible=masks.filter(m=>(m&available)===m);
  if(!possible.length)return 0;
  const used=possible.reduce((s,m)=>s|m,0),pivot=used&-used;
  let best=pack(used&~pivot);
  for(const m of possible)if(m&pivot)best=Math.max(best,1+pack(used&~m));
  memo.set(available,best);return best;
 }
 let disjoint=0,overlap=0,edgeShared=0,pairs=0;
 const parent=blocks.map((_,i)=>i);
 const root=(i:number):number=>parent[i]===i?i:root(parent[i]);
 // Edge sharing means two cells used by both blocks, regardless of path order.
 for(let i=0;i<blocks.length;i++)for(let j=i+1;j<blocks.length;j++){
  const common=blocks[i].filter(p=>blocks[j].includes(p)).length;pairs++;
  if(!common)disjoint++;else{parent[root(i)]=root(j);overlap+=common;if(common>=2)edgeShared++}
 }
 return {independent:pack(masks.reduce((s,m)=>s|m,0)),disjoint:disjoint/Math.max(1,pairs),overlap:overlap/Math.max(1,pairs),edges:edgeShared/Math.max(1,pairs),components:new Set(parent.map((_,i)=>root(i))).size,compact:f.compact.size/Math.max(1,f.blocks.size)};
}
function order(fs:Family[],rule:Rule,d:string,t:Turno,geo:Map<string,Geometry>){
 const score=(f:Family)=>{const g=geo.get(f.v)!;switch(rule){
 case 'compacidad':return [g.compact];
 case 'independientes':return [g.independent,g.disjoint];
 case 'separacion':return [g.disjoint];
 case 'menos_solapamiento':return [-g.overlap];
 case 'mas_solapamiento':return [g.overlap];
 case 'bordes_distintos':return [-g.edges];
 case 'grupos_separados':return [g.components];
 default:return [0];
 }};
 return [...fs].sort((a,b)=>{const x=score(a),y=score(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];return hash(d+'|'+t+'|'+a.v)-hash(d+'|'+t+'|'+b.v)||a.v.localeCompare(b.v)});
}

const experts=rules.filter(r=>r!=='separacion');
const START=process.env.TEST_FROM||'2026-09-01';
const K=32;
const windows=[15,30] as const;
const names=['diversidad','repeticion','vecinos_iguales','simetria_filas','fuentes_cruzadas','cobertura','admision','multiples_bloques','compacidad','solapamiento','cambio_posicional','cambio_cobertura'];
type Row={date:string;turn:Turno;x:number[];cells:Map<string,string>;hits:number[];expected:number;random:number[]};
const history:Row[]=[];
type M={cuts:number;heads:number;hits:number;expected:number;random:number[];permuted:number[];changed:number;neff:number;eligible:number};
const make=():M=>({cuts:0,heads:0,hits:0,expected:0,random:Array(K).fill(0),permuted:Array(K).fill(0),changed:0,neff:0,eligible:0});
const totals:Record<string,Record<string,M>>={},daily:Record<string,Record<string,number>>={};
const uniform=()=>experts.map(()=>1/experts.length);
const mean=(a:number[])=>a.reduce((s,x)=>s+x,0)/Math.max(1,a.length);
function context(fs:Family[],cells:Cell[],geo:Map<string,Geometry>,prev?:Row){
 const counts=Array(10).fill(0);cells.forEach(c=>counts[Number(c.digit)]++);
 let adjacent=0,equal=0,vertical=0,vequal=0;
 for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++){const a=cells[i],b=cells[j];if(Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1){adjacent++;equal+=+(a.digit===b.digit)}if(a.col===b.col&&a.row!==b.row){vertical++;vequal+=+(a.digit===b.digit)}}
 const map=new Map(cells.map(c=>[c.row+':'+c.col,c.digit])),shared=[...map].filter(([k])=>prev?.cells.has(k));
 const coverage=exact(fs).size/1000;
 const x=[counts.filter(n=>n>0).length/10,counts.reduce((s,n)=>s+n*(n-1),0)/Math.max(1,cells.length*(cells.length-1)),equal/Math.max(1,adjacent),vequal/Math.max(1,vertical),
 mean(fs.map(f=>+(f.sources.size>1))),coverage,mean(fs.map(f=>+f.admitted)),mean(fs.map(f=>+(f.blocks.size>1))),mean(fs.map(f=>geo.get(f.v)!.compact)),mean(fs.map(f=>geo.get(f.v)!.overlap))/2,
 prev?mean(shared.map(([k,v])=>+(prev.cells.get(k)!==v))):0,prev?Math.abs(coverage-prev.x[5]):0];
 if(x.some(v=>!Number.isFinite(v)))throw Error('Contexto inválido');
 return {x,map};
}
function getRows(date:string,t:Turno,w:number){const from=shiftDay(date,-w);return history.filter(r=>r.turn===t&&r.date>=from&&r.date<date)}
function similarityWeights(rows:Row[],x:number[]){
 if(!rows.length)return [];
 const scales=x.map((_,i)=>{const a=rows.map(r=>r.x[i]),m=mean(a);return Math.max(.05,Math.sqrt(mean(a.map(v=>(v-m)**2))))});
 // Bounded, standardized distance: no learned feature selection.
 const dist=rows.map(r=>mean(x.map((v,i)=>Math.min(9,((v-r.x[i])/scales[i])**2))));
 const k=dist.map(d=>Math.exp(-d/2)),s=k.reduce((a,b)=>a+b,0);
 // Half uniform, half context to prevent one past day dominating.
 return k.map(v=>.5/rows.length+.5*v/Math.max(s,1e-12));
}
function expWeights(rows:Row[],w:number[],mode=-1){
 if(!rows.length)return uniform();
 const n=experts.length,c=Array(n).fill(0);
 for(let i=0;i<rows.length;i++)for(let j=0;j<n;j++)c[j]+=w[i]*rows[i].hits[j]*rows.length;
 const mx=Math.max(...c),e=c.map(v=>Math.exp((v-mx)/2)),sum=e.reduce((a,b)=>a+b,0);
 return e.map(v=>.5/n+.5*v/sum);
}
function mix(fs:Family[],picks:Family[][],w:number[],target:Family[],date:string,t:Turno){
 const vote=new Map<string,number>();picks.forEach((p,i)=>p.forEach(f=>vote.set(f.v,(vote.get(f.v)||0)+w[i])));
 const order=[...fs].sort((a,b)=>(vote.get(b.v)||0)-(vote.get(a.v)||0)||hash('vote|'+date+'|'+t+'|'+a.v)-hash('vote|'+date+'|'+t+'|'+b.v)||a.v.localeCompare(b.v));
 return quotaTop(order,target,k0);
}
function add(p:string,t:Turno,date:string,hits:number,expected:number,heads:number,random:number[],permuted:number[],changed=0,neff=0,eligible=0){
 if(date<START)return;
 for(const k of ['total',t,date.slice(0,7)]){const a=totals[p]||(totals[p]={}),m=a[k]||(a[k]=make());m.cuts++;m.heads+=heads;m.hits+=hits;m.expected+=expected;m.changed+=changed;m.neff+=neff;m.eligible+=eligible;random.forEach((v,i)=>m.random[i]+=v);permuted.forEach((v,i)=>m.permuted[i]+=v)}
 const d=daily[date]||(daily[date]={});d[p]=(d[p]||0)+hits;
}
function audit(date:string,t:Turno,fs:Family[],cells:Cell[],heads:string[]){
 if(!fs.length)return;
 const baseline=fs.filter(f=>f.admitted).sort((a,b)=>a.rank-b.rank).slice(0,10);if(!baseline.length)return;
 const original=quotaTop(ranked(fs,'historico_mas_fisico',date,t),baseline,k0),geo=new Map(fs.map(f=>[f.v,geometry(f)]));
 const picks=experts.map(r=>r==='actual'?baseline:r==='combinado_original'?original:quotaTop(order(fs,r,date,t,geo),original,key.admision_bloques));
 const prev=[...history].reverse().find(r=>r.turn===t&&r.date<date),{x,map}=context(fs,cells,geo,prev);
 const suffix=heads.map(v=>v.slice(-3)),expected=heads.length*exact(baseline).size/1000;
 const hit=(p:Family[])=>{const s=exact(p);return suffix.filter(v=>s.has(v)).length};
 const hits=picks.map(hit);
 const random=Array.from({length:K},(_,i)=>hit(quotaTop(shuffled(fs,'context|'+date+'|'+t+'|'+i),original,key.admision_bloques)));
 const equal=mix(fs,picks,uniform(),baseline,date,t);
 for(let i=0;i<experts.length;i++)add('fijo_'+experts[i],t,date,hits[i],expected,heads.length,random,[]);
 add('fijo_igual',t,date,hit(equal),expected,heads.length,random,[]);
 for(const w of windows){
  const rows=getRows(date,t,w),enough=rows.length>=(w===15?8:15);
  if(rows.some(r=>r.date>=date))throw Error('Fuga temporal contexto');
  const flat=rows.map(()=>1/rows.length),sw=enough?similarityWeights(rows,x):flat;
  const baseW=enough?expWeights(rows,flat):uniform(),ctxW=enough?expWeights(rows,sw):uniform();
  const rec=mix(fs,picks,baseW,baseline,date,t),ctx=mix(fs,picks,ctxW,baseline,date,t);
  const changed=[...exact(ctx)].filter(v=>!exact(rec).has(v)).length;
  const neff=enough?1/sw.reduce((s,v)=>s+v*v,0):0;
  // Same historical expert hits, same dates, same weights; break only the
  // correspondence between contexts and their outcomes (cyclic shifts).
  const controls=Array.from({length:K},(_,i)=>{
   if(!enough)return hit(rec);
   const shift=1+i%(rows.length-1),permuted=sw.map((_,j)=>sw[(j+shift)%sw.length]);
   return hit(mix(fs,picks,expWeights(rows,permuted),baseline,date,t));
  });
  add('reciente_'+w,t,date,hit(rec),expected,heads.length,random,[],0,rows.length,+enough);
  add('contexto_'+w,t,date,hit(ctx),expected,heads.length,random,controls,changed,neff,+enough);
 }
 history.push({date,turn:t,x,cells:map,hits,expected,random});
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
 const day={date:d,cuts:0};
 for(const t of TURNOS){
  const heads=JURS.filter(j=>j!=='Montevideo').map(j=>current[t]?.[j]||'');
  if(!heads.every(x=>/^\d{4}$/.test(x)))continue;
  const cut=auxAtCut(raw.heads,t,'anterior'),rank=buildAuxIndependent(d,t,cut,history);
  const board=auxiliaryBoard(cut,t),routes=enumerateAuxPaths(board,3).map(path=>({source:'aux',path}));
  audit(d,t,pool(routes,rank[3].map(f=>f.family)),board.cells,heads);day.cuts++;
 }
 return day.cuts?day:null;
}



function selfTest(){
 const rs=[{x:[0],hits:experts.map((_,i)=>+(i===0))},{x:[1],hits:experts.map((_,i)=>+(i===1))}] as Row[];
 const a=similarityWeights(rs,[0]),b=similarityWeights(rs,[1]);if(a[0]<=a[1]||b[1]<=b[0]||Math.abs(a.reduce((s,v)=>s+v,0)-1)>1e-9)throw Error('Contexto inválido');
 if(expWeights(rs,a)[0]<=expWeights(rs,a)[1])throw Error('Contexto inválido');
 const fs=pool(plusRoutes([{id:'prevNocturno',values:['12','34','56','78','90','12']}]),[]),p=fs.slice(0,10);
 if(exact(mix(fs,experts.map(()=>p),uniform(),p,'2025-01-01','Previa')).size!==exact(p).size)throw Error('Presupuesto distinto');
 console.log('CONTEXT_SELF_TEST_OK');
}
async function main(){
 selfTest();let n=0;const skips=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  const h=history.length;
  try{const day=await build(d);if(day){n++;if(d>=START)console.log('CONTEXT_DAY',JSON.stringify({date:d,hits:daily[d]}))}}
  catch(e){if(history.length!==h||/Fuga temporal|Presupuesto distinto|Ruta física inválida|Histórica sin ruta física|Geometría inválida|Contexto inválido/.test(String(e)))throw e;skips.push({date:d,error:String(e)})}
 }
 if(!Object.keys(daily).length)throw Error('Sin muestra de evaluación');
 console.log('CONTEXT_TOTAL',JSON.stringify({from:FROM,to:TO,start:START,days:n,skips,names,experts,totals}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
