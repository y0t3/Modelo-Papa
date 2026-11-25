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


/** Short-memory family-level contrast. Every suffix has equal null probability.
 * No candidate is excluded by the historical rank; matched variant is a separate
 * ablation. Training uses only preceding days of the same target turn.
 */

/** Frozen exploratory contrast: 15 calendar days, same turn, no tuning.
 * Primary: zone residual learned conditional on admission, block count
 * and number of exact suffixes. Same strata quotas as combined baseline.
 * Secondary: free selection, shared-pair connectivity, static exposure.
 */
const START=process.env.TEST_FROM||'2026-06-01',K=32,Z=10,W=15;
type Group='libre'|'equiparado';
const groups=['libre','equiparado'] as const;
const gkey:Record<Group,(f:Family)=>string>={libre:k0,equiparado:key.admision_bloques};
type E={f:Family;z:number[];pairs:Set<string>;link:number};
type R={date:string;turn:Turno;observed:Record<Group,number[]>;nulls:Record<Group,number[][]>;exposure:Record<Group,number[]>;hits:number};
const history:R[]=[];
const zeros=()=>Array(Z+1).fill(0) as number[];
const mean=(a:number[])=>a.reduce((s,v)=>s+v,0)/Math.max(1,a.length);
function representation(fs:Family[]):E[]{
 const owners=new Map<string,Set<string>>();
 const out=fs.map(f=>{
  const z=Array(Z).fill(0),pairs=new Set<string>();
  for(const id of f.blocks){
   const cells=id.split('|').slice(1),cols=cells.map(p=>Number(p.split(':')[1]));
   const lo=Math.min(...cols),hi=Math.max(...cols),windows=Array.from({length:Z},(_,i)=>i).filter(i=>i<=lo&&hi<=i+2);
   if(!windows.length)throw Error('Zona inválida');
   for(const i of windows)z[i]+=1/(windows.length*f.blocks.size);
   for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++)pairs.add([cells[i],cells[j]].sort().join('|'));
  }
  if(Math.abs(z.reduce((s,v)=>s+v,0)-1)>1e-9)throw Error('Zona inválida: masa');
  for(const p of pairs){const a=owners.get(p)||new Set<string>();a.add(f.v);owners.set(p,a)}
  return {f,z,pairs,link:0};
 });
 for(const e of out){const linked=new Set<string>();for(const p of e.pairs)for(const v of owners.get(p)!)if(v!==e.f.v)linked.add(v);e.link=Math.log1p(linked.size)}
 return out;
}
function stats(es:E[],group:Group){
 const bins=new Map<string,E[]>(),x=new Map<string,number[]>();
 for(const e of es){const k=gkey[group](e.f),a=bins.get(k)||[];a.push(e);bins.set(k,a)}
 for(const a of bins.values()){
  const m=Array.from({length:Z},(_,i)=>mean(a.map(e=>e.z[i]))),l=mean(a.map(e=>e.link)),sd=Math.sqrt(mean(a.map(e=>(e.link-l)**2)));
  for(const e of a)x.set(e.f.v,[...e.z.map((v,i)=>v-m[i]),sd>1e-9?(e.link-l)/sd:0]);
 }
 return {bins,x};
}
function learn(rows:R[],group:Group,seed=-1){
 const o=zeros(),v=zeros();
 for(const r of rows){const a=seed<0?r.observed[group]:r.nulls[group][seed];for(let i=0;i<o.length;i++){o[i]+=a[i];v[i]+=r.exposure[group][i]}}
 // Standardized residuals with fixed regularization; no fitting on test days.
 return o.map((n,i)=>n/Math.sqrt(v[i]+5));
}
function ranking(fs:Family[],scores:Map<string,number>,date:string,t:Turno){
 return [...fs].sort((a,b)=>scores.get(b.v)!-scores.get(a.v)!||hash('zone|'+date+'|'+t+'|'+a.v)-hash('zone|'+date+'|'+t+'|'+b.v)||a.v.localeCompare(b.v));
}
type M={cuts:number;heads:number;hits:number;expected:number;added:number;addedHits:number;lostHits:number;random:number[];matched:number[];labelNull:number[];eligible:number;formed:number;changedVsStatic:number};
const make=():M=>({cuts:0,heads:0,hits:0,expected:0,added:0,addedHits:0,lostHits:0,random:Array(K).fill(0),matched:Array(K).fill(0),labelNull:Array(K).fill(0),eligible:0,formed:0,changedVsStatic:0});
const totals:Record<string,Record<string,M>>={},daily:Record<string,Record<string,number>>={};
const zoneTotals=Array.from({length:Z},()=>({observed:0,expected:0,conditional:0,residual:0}));
function add(p:string,date:string,t:Turno,pick:Family[],baseline:Family[],heads:string[],formed:number,random:number[]=[],matched:number[]=[],labelNull:number[]=[],eligible=false,staticPick?:Family[]){
 if(date<START)return;
 const s=exact(pick),base=exact(baseline),a=new Set([...s].filter(v=>!base.has(v))),lost=new Set([...base].filter(v=>!s.has(v)));
 if(s.size!==base.size||pick.length!==baseline.length)throw Error('Presupuesto distinto');
 const h=heads.filter(v=>s.has(v)).length,ah=heads.filter(v=>a.has(v)).length,lh=heads.filter(v=>lost.has(v)).length;
 if(h-heads.filter(v=>base.has(v)).length!==ah-lh)throw Error('Balance inválido');
 const fixed=staticPick?exact(staticPick):s,changed=[...s].filter(v=>!fixed.has(v)).length;
 for(const k of ['total',t,date.slice(0,7)]){const a=totals[p]||(totals[p]={}),m=a[k]||(a[k]=make());m.cuts++;m.heads+=heads.length;m.hits+=h;m.expected+=heads.length*s.size/1000;m.added+=s.size-[...s].filter(v=>base.has(v)).length;m.addedHits+=ah;m.lostHits+=lh;m.eligible+=+eligible;m.formed+=formed;m.changedVsStatic+=changed;
 random.forEach((v,i)=>m.random[i]+=v);matched.forEach((v,i)=>m.matched[i]+=v);labelNull.forEach((v,i)=>m.labelNull[i]+=v)}
 const d=daily[date]||(daily[date]={});d[p]=(d[p]||0)+h;
}
function audit(date:string,t:Turno,fs:Family[],cells:Cell[],heads:string[]){
 if(!fs.length)return;
 const baseline=fs.filter(f=>f.admitted).sort((a,b)=>a.rank-b.rank).slice(0,10);if(!baseline.length)return;
 const original=quotaTop(ranked(fs,'historico_mas_fisico',date,t),baseline,k0),geo=new Map(fs.map(f=>[f.v,geometry(f)]));
 const es=representation(fs),byValue=new Map(es.flatMap(e=>e.f.values.map(v=>[v,e] as const))),suffix=heads.map(v=>v.slice(-3)),formed=suffix.filter(v=>byValue.has(v));
 const hit=(p:Family[])=>{const s=exact(p);return suffix.filter(v=>s.has(v)).length};
 const rows=history.filter(r=>r.turn===t&&r.date>=shiftDay(date,-W)&&r.date<date),enough=rows.length>=8;
 if(rows.some(r=>r.date>=date))throw Error('Fuga temporal selección');
 add('actual',date,t,baseline,baseline,suffix,formed.length);
 add('combinado',date,t,original,baseline,suffix,formed.length);
 add('compacidad',date,t,quotaTop(order(fs,'compacidad',date,t,geo),original,key.admision_bloques),baseline,suffix,formed.length);
 const observed={} as Record<Group,number[]>,nulls={} as Record<Group,number[][]>,exposure={} as Record<Group,number[]>;
 const density=Array.from({length:Z},(_,i)=>es.reduce((s,e)=>s+e.z[i]*e.f.values.length,0));
 for(const group of groups){
  const {bins,x}=stats(es,group),target=group==='libre'?baseline:original;
  const select=(sc:Map<string,number>)=>quotaTop(ranking(fs,sc,date,t),target,gkey[group]);
  const rands=Array.from({length:K},(_,i)=>shuffled(fs,'zone-control|'+date+'|'+t+'|'+i));
  const random=rands.map(o=>hit(quotaTop(o,baseline,k0))),matched=rands.map(o=>hit(quotaTop(o,target,gkey[group])));
  const staticPick=select(new Map(es.map(e=>[e.f.v,e.z.reduce((s,v,i)=>s+v*density[i],0)])));
  const fixedLink=select(new Map(es.map(e=>[e.f.v,e.link])));
  add('densidad_'+group,date,t,staticPick,baseline,suffix,formed.length,random,matched);
  add('vinculos_fijos_'+group,date,t,fixedLink,baseline,suffix,formed.length,random,matched);
  const beta=enough?learn(rows,group):zeros(),bs=Array.from({length:K},(_,i)=>enough?learn(rows,group,i):zeros());
  for(const kind of ['zona','vinculo','zona_vinculo'] as const){
   const predict=(b:number[])=>select(new Map(es.map(e=>{
    const z=x.get(e.f.v)!,zone=z.slice(0,Z).reduce((s,v,i)=>s+v*b[i],0),link=z[Z]*b[Z];
    return [e.f.v,kind==='zona'?zone:kind==='vinculo'?link:zone+link/2];
   })));
   add(kind+'_'+group,date,t,predict(beta),baseline,suffix,formed.length,random,matched,bs.map(b=>hit(predict(b))),enough,staticPick);
  }
  const o=zeros(),n=Array.from({length:K},zeros),v=zeros();
  // Conditional null holds fixed the number of formed heads in each stratum.
  for(const value of formed){
   const e=byValue.get(value)!,a=x.get(e.f.v)!,bin=bins.get(gkey[group](e.f))!;
   for(let j=0;j<a.length;j++){o[j]+=a[j];v[j]+=mean(bin.map(q=>x.get(q.f.v)![j]**2))}
   for(let i=0;i<K;i++){
    const f=shuffled(bin.map(q=>q.f),'zone-label|'+date+'|'+t+'|'+value+'|'+i)[0],b=x.get(f.v)!;
    for(let j=0;j<b.length;j++)n[i][j]+=b[j];
   }
   if(group==='equiparado'&&date>=START)for(let j=0;j<Z;j++){zoneTotals[j].observed+=e.z[j];zoneTotals[j].conditional+=mean(bin.map(q=>q.z[j]));zoneTotals[j].residual+=a[j]}
  }
  observed[group]=o;nulls[group]=n;exposure[group]=v;
 }
 if(date>=START)for(let j=0;j<Z;j++)zoneTotals[j].expected+=suffix.length*density[j]/1000;
 history.push({date,turn:t,observed,nulls,exposure,hits:formed.length});
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
 const f=(v:string,blocks:string[])=>({v,values:[v],blocks:new Set(blocks),sources:new Set(),paths:new Set(),straight:new Set(),compact:new Set(),admitted:true,rank:1} as Family);
 const es=representation([f('121',['aux|0:0|0:1|0:2']),f('232',['aux|0:1|0:2|1:2']),f('343',['aux|0:9|0:10|0:11'])]);
 if(es[0].z[0]!==1||es[2].z[9]!==1||es[0].link<=es[2].link||Math.abs(es[1].z.reduce((a,b)=>a+b,0)-1)>1e-9)throw Error('Zona inválida');
 const s=stats(es,'libre');for(let j=0;j<Z+1;j++)if(Math.abs(mean(es.map(e=>s.x.get(e.f.v)![j])))>1e-9)throw Error('Zona inválida: centrado');
 console.log('ZONE_SELF_TEST_OK');
}
async function main(){
 selfTest();let n=0;const skips=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  const h=history.length;
  try{const day=await build(d);if(day){n++;if(d>=START)console.log('ZONE_DAY',JSON.stringify({date:d,hits:daily[d]}))}}
  catch(e){if(history.length!==h||!/Aux: datos no encontrados|HTTP|fetch failed|Sin sorteos|sin resultados/i.test(String(e)))throw e;skips.push({date:d,error:String(e)})}
 }
 if(!Object.keys(daily).length)throw Error('Sin muestra de evaluación');
 console.log('ZONE_TOTAL',JSON.stringify({from:FROM,to:TO,start:START,days:n,skips,zoneTotals,totals,primary:'zona_equiparado'}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
