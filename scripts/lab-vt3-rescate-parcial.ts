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
const START=process.env.TEST_FROM||'2026-09-01',K=32;
const features=['admision','rango_historico','bloques','fuentes','rectos','compactos','independientes','solapamiento','bordes','grupos','centro_comun','borde_comun','densidad','fila_santiago','columna','extension','repite_ayer','repite_semana','misma_zona_ayer','misma_zona_semana'] as const;
const P=features.length,windows=[15,30] as const,groups=['libre','equiparado'] as const;
type Group=typeof groups[number];
type Entry={f:Family;x:number[];positions:Set<string>};
type Row={date:string;turn:Turno;context:number[];entries:Map<string,Entry>;observed:Record<Group,number[]>;nulls:Record<Group,number[][]>;formed:number};
const history:Row[]=[];
const zero=()=>Array(P).fill(0) as number[];
const mean=(a:number[])=>a.reduce((s,x)=>s+x,0)/Math.max(1,a.length);
const groupKey:Record<Group,(f:Family)=>string>={libre:k0,equiparado:key.admision_bloques};
function intersect(a:Set<string>,b?:Set<string>){return b?[...a].filter(v=>b.has(v)).length/Math.max(1,new Set([...a,...b]).size):0}
function entries(fs:Family[],prev?:Row,week?:Row):Entry[]{
 return fs.map(f=>{
  const bs=[...f.blocks].map(b=>b.split('|').slice(1)),pos=new Set(bs.flat()),g=geometry(f),freq=new Map<string,number>(),pairs=new Map<string,number>();
  for(const b of bs){for(const c of b)freq.set(c,(freq.get(c)||0)+1);for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++){const q=[b[i],b[j]].sort().join('|');pairs.set(q,(pairs.get(q)||0)+1)}}
  const cols=[...pos].map(c=>Number(c.split(':')[1])),span=Math.max(...cols)-Math.min(...cols),n=f.blocks.size;
  const a=prev?.entries.get(f.v),w=week?.entries.get(f.v);
  const x=[+f.admitted,f.admitted?1/Math.sqrt(f.rank):0,Math.log1p(n),f.sources.size,f.straight.size/n,g.compact,g.independent,g.overlap,g.edges,g.components,
  Math.max(...freq.values())/n,Math.max(...pairs.values())/n,3*n/pos.size,mean([...pos].map(c=>+(c.split(':')[0]==='0'))),mean(cols)/11,span/11,+!!a,+!!w,intersect(pos,a?.positions),intersect(pos,w?.positions)];
  if(x.length!==P||x.some(v=>!Number.isFinite(v)))throw Error('Características inválidas');return {f,x,positions:pos};
 });
}
function standardize(es:Entry[],group:Group){
 const g=new Map<string,Entry[]>();for(const e of es){const k=groupKey[group](e.f),a=g.get(k)||[];a.push(e);g.set(k,a)}
 const out=new Map<string,number[]>();
 for(const a of g.values()){
  const m=features.map((_,i)=>mean(a.map(e=>e.x[i]))),sd=features.map((_,i)=>Math.sqrt(mean(a.map(e=>(e.x[i]-m[i])**2))));
  for(const e of a)out.set(e.f.v,e.x.map((v,i)=>sd[i]<1e-9?0:Math.max(-3,Math.min(3,(v-m[i])/sd[i]))));
  // Center again after winsorization so the stratum null expectation is zero.
  const mu=features.map((_,i)=>mean(a.map(e=>out.get(e.f.v)![i])));
  for(const e of a)out.set(e.f.v,out.get(e.f.v)!.map((v,i)=>v-mu[i]));
 }
 return {g,z:out};
}
function context(es:Entry[],cells:Cell[]){
 const counts=Array(10).fill(0);for(const c of cells)counts[Number(c.digit)]++;
 let adjacent=0,equal=0;for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++){const a=cells[i],b=cells[j];if(Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1){adjacent++;equal+=+(a.digit===b.digit)}}
 return [counts.filter(Boolean).length/10,counts.reduce((s,n)=>s+n*(n-1),0)/Math.max(1,cells.length*(cells.length-1)),equal/Math.max(1,adjacent),exact(es.map(e=>e.f)).size/1000,mean(es.map(e=>+e.f.admitted)),mean(es.map(e=>e.x[5]))];
}
function trainWeights(rows:Row[],x:number[],contextual:boolean){
 if(!rows.length)return [];
 if(!contextual)return rows.map(()=>1);
 const scale=x.map((_,i)=>{const a=rows.map(r=>r.context[i]),m=mean(a);return Math.max(.05,Math.sqrt(mean(a.map(v=>(v-m)**2))))});
 const raw=rows.map(r=>Math.exp(-mean(x.map((v,i)=>Math.min(9,((v-r.context[i])/scale[i])**2)))/2));
 const avg=mean(raw);return raw.map(v=>.5+.5*v/Math.max(avg,1e-12));
}
function learn(rows:Row[],w:number[],group:Group,seed=-1){
 const out=zero();let n=0;
 for(let i=0;i<rows.length;i++){const r=rows[i],a=seed<0?r.observed[group]:r.nulls[group][seed];for(let j=0;j<P;j++)out[j]+=w[i]*a[j];n+=w[i]*r.formed}
 // Fixed shrinkage, no hyperparameter search. Each coefficient expresses a
 // recent standardized excess among observed hits vs matched physical null.
 return out.map(v=>v/(n+20));
}
function scoreOrder(fs:Family[],z:Map<string,number[]>,beta:number[],date:string,t:Turno){
 const scores=new Map(fs.map(f=>[f.v,z.get(f.v)!.reduce((s,v,i)=>s+v*beta[i],0)]));
 return [...fs].sort((a,b)=>scores.get(b.v)!-scores.get(a.v)!||hash('family|'+date+'|'+t+'|'+a.v)-hash('family|'+date+'|'+t+'|'+b.v)||a.v.localeCompare(b.v));
}

const keeps=[5,7] as const;
const rankBin=(f:Family)=>!f.admitted?'no_admitida':f.rank<=10?'1-10':f.rank<=20?'11-20':f.rank<=50?'21-50':'51+';
const binKey=(f:Family)=>k0(f)+'|'+rankBin(f);
type Bin={families:number;exposure:number;hits:number;expected:number};
type M={cuts:number;heads:number;hits:number;expected:number;added:number;removed:number;addedHits:number;lostHits:number;bins:Record<string,Bin>;random:number[];matched:number[];trainedNull:number[];eligible:number};
const blank=():M=>({cuts:0,heads:0,hits:0,expected:0,added:0,removed:0,addedHits:0,lostHits:0,bins:{},random:Array(K).fill(0),matched:Array(K).fill(0),trainedNull:Array(K).fill(0),eligible:0});
const totals:Record<string,Record<string,M>>={},daily:Record<string,Record<string,number>>={};
const partialHistory:Record<number,Row[]>={5:[],7:[]};
const strata:Record<string,Bin>={};
function countBins(out:Record<string,Bin>,fs:Family[],heads:string[]){
 const bins=new Map<string,Family[]>();for(const f of fs){const k=rankBin(f),a=bins.get(k)||[];a.push(f);bins.set(k,a)}
 for(const [k,a] of bins){const e=exact(a),v=out[k]||(out[k]={families:0,exposure:0,hits:0,expected:0});v.families+=a.length;v.exposure+=e.size;v.hits+=heads.filter(x=>e.has(x)).length;v.expected+=heads.length*e.size/1000}
}
function add(name:string,date:string,t:Turno,pick:Family[],baseline:Family[],locked:Family[],heads:string[],random:number[]=[],matched:number[]=[],trainedNull:number[]=[],eligible=false){
 if(date<START)return;
 const s=exact(pick),base=exact(baseline),fixed=exact(locked);
 if(pick.length!==baseline.length||s.size!==base.size||[...fixed].some(v=>!s.has(v)))throw Error('Presupuesto distinto o bloque protegido perdido');
 const added=new Set([...s].filter(v=>!base.has(v))),lost=new Set([...base].filter(v=>!s.has(v)));
 const h=heads.filter(v=>s.has(v)).length,ah=heads.filter(v=>added.has(v)).length,lh=heads.filter(v=>lost.has(v)).length;
 if(h-heads.filter(v=>base.has(v)).length!==ah-lh)throw Error('Balance inválido');
 for(const k of ['total',t,date.slice(0,7)]){const a=totals[name]||(totals[name]={}),m=a[k]||(a[k]=blank());m.cuts++;m.heads+=heads.length;m.hits+=h;m.expected+=heads.length*s.size/1000;m.added+=added.size;m.removed+=lost.size;m.addedHits+=ah;m.lostHits+=lh;m.eligible+=+eligible;
  countBins(m.bins,pick.filter(f=>!base.has(f.values[0])),heads);
  random.forEach((v,i)=>m.random[i]+=v);matched.forEach((v,i)=>m.matched[i]+=v);trainedNull.forEach((v,i)=>m.trainedNull[i]+=v);
 }
 const d=daily[date]||(daily[date]={});d[name]=(d[name]||0)+h;
}
function audit(date:string,t:Turno,fs:Family[],cells:Cell[],heads:string[]){
 if(!fs.length)return;
 const baseline=fs.filter(f=>f.admitted).sort((a,b)=>a.rank-b.rank).slice(0,10);if(!baseline.length)return;
 const suffix=heads.map(v=>v.slice(-3)),hit=(p:Family[])=>{const s=exact(p);return suffix.filter(v=>s.has(v)).length};
 const prev=[...history].reverse().find(r=>r.turn===t&&r.date<date),week=history.find(r=>r.turn===t&&r.date===shiftDay(date,-7));
 const es=entries(fs,prev,week),x=context(es,cells),entryMap=new Map(es.map(e=>[e.f.v,e])),byValue=new Map(es.flatMap(e=>e.f.values.map(v=>[v,e] as const)));
 const formed=suffix.filter(v=>byValue.has(v));
 if(date>=START)countBins(strata,fs,suffix);
 add('actual',date,t,baseline,baseline,[],suffix);
 const combined=quotaTop(ranked(fs,'historico_mas_fisico',date,t),baseline,k0);
 add('combinado',date,t,combined,baseline,[],suffix);
 const geo=new Map(fs.map(f=>[f.v,geometry(f)]));
 for(const keep of keeps){
  const locked=baseline.slice(0,keep),tail=baseline.slice(keep),locks=new Set(locked.map(f=>f.v)),pool=fs.filter(f=>!locks.has(f.v));
  const res=es.filter(e=>!locks.has(e.f.v)),st=standardize(res,'libre'),z=st.z;
  const remainingHits=formed.filter(v=>!locks.has(byValue.get(v)!.f.v));
  const select=(o:Family[])=>[...locked,...quotaTop(o,tail,k0)];
  const shuffledOrders=Array.from({length:K},(_,i)=>shuffled(pool,'partial|'+date+'|'+t+'|'+keep+'|'+i));
  const random=shuffledOrders.map(o=>hit(select(o)));
  function report(name:string,pick:Family[],nulls:number[]=[],enough=false){
   // Match both exact-value budget and rank-band mix of the chosen tail.
   const chosen=pick.filter(f=>!locks.has(f.v));
   const matched=shuffledOrders.map(o=>hit([...locked,...quotaTop(o,chosen,binKey)]));
   add('k'+keep+'_'+name,date,t,pick,baseline,locked,suffix,random,matched,nulls,enough);
  }
  report('sin_aprendizaje',select(scoreOrder(pool,z,zero(),date,t)));
  report('bloques',select(ranked(pool,'bloques',date,t)));
  report('compacidad',select(order(pool,'compacidad',date,t,geo)));
  for(const w of windows){
   const rows=partialHistory[keep].filter(r=>r.turn===t&&r.date>=shiftDay(date,-w)&&r.date<date),enough=rows.length>=(w===15?8:15);
   if(rows.some(r=>r.date>=date))throw Error('Fuga temporal selección');
   for(const contextual of [false,true]){
    const weights=trainWeights(rows,x,contextual),beta=enough?learn(rows,weights,'libre'):zero();
    const pick=select(scoreOrder(pool,z,beta,date,t));
    const nulls=Array.from({length:K},(_,i)=>hit(select(scoreOrder(pool,z,enough?learn(rows,weights,'libre',i):zero(),date,t))));
    report((contextual?'contextual_':'reciente_')+w,pick,nulls,enough);
   }
  }
  // Learn only from suffixes in the remaining pool, not protected slots.
  const o=zero(),n=Array.from({length:K},zero);
  for(const v of remainingHits){const e=byValue.get(v)!,a=z.get(e.f.v)!;
   for(let j=0;j<P;j++)o[j]+=a[j];
   const bin=st.g.get(k0(e.f))!;
   for(let i=0;i<K;i++){const rnd=shuffled(bin.map(q=>q.f),'partial-label|'+date+'|'+t+'|'+keep+'|'+v+'|'+i)[0],b=z.get(rnd.v)!;for(let j=0;j<P;j++)n[i][j]+=b[j]}
  }
  partialHistory[keep].push({date,turn:t,context:x,entries:entryMap,observed:{libre:o,equiparado:zero()},nulls:{libre:n,equiparado:[]},formed:remainingHits.length});
 }
 history.push({date,turn:t,context:x,entries:entryMap,observed:{libre:zero(),equiparado:zero()},nulls:{libre:[],equiparado:[]},formed:formed.length});
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
 const all=pool(plusRoutes([{id:'prevNocturno',values:['12','34','56','78','90','12']}]),[]);
 const fs=pool(plusRoutes([{id:'prevNocturno',values:['12','34','56','78','90','12']}]),all.slice(0,10).map(f=>f.v));
 const baseline=fs.filter(f=>f.admitted),locked=baseline.slice(0,7),tail=baseline.slice(7),ids=new Set(locked.map(f=>f.v)),rest=fs.filter(f=>!ids.has(f.v));
 const chosen=quotaTop(shuffled(rest,'test'),tail,k0),match=quotaTop(shuffled(rest,'test2'),chosen,binKey),full=[...locked,...match];
 if(exact(full).size!==exact(baseline).size||locked.some(f=>!full.includes(f)))throw Error('Presupuesto distinto');
 const st=standardize(entries(rest),'libre');for(const a of st.g.values())for(let j=0;j<P;j++)if(Math.abs(mean(a.map(e=>st.z.get(e.f.v)![j])))>1e-9)throw Error('Características inválidas');
 console.log('PARTIAL_SELF_TEST_OK');
}
async function main(){
 selfTest();let n=0;const skips=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  const h=history.length,p=partialHistory[5].length,q=partialHistory[7].length;
  try{const day=await build(d);if(day){n++;if(d>=START)console.log('PARTIAL_DAY',JSON.stringify({date:d,hits:daily[d]}))}}
  catch(e){if(history.length!==h||partialHistory[5].length!==p||partialHistory[7].length!==q||!/Aux: datos no encontrados|HTTP|fetch failed|Sin sorteos|sin resultados/i.test(String(e)))throw e;skips.push({date:d,error:String(e)})}
 }
 if(!Object.keys(daily).length)throw Error('Sin muestra de evaluación');
 console.log('PARTIAL_TOTAL',JSON.stringify({from:FROM,to:TO,start:START,days:n,skips,strata,totals,primary:'k7_contextual_30'}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
