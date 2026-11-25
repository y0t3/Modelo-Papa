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

type Path=Cell[];
type Event=AuxiliaryHistorical['aux']['events'][3][number];
type Form={r:number;c:number;a:number[]};
type Pair={week:Form[];recent:Form[];weight?:number};
const controls=Array.from({length:32},(_,i)=>'random-'+i);
const rules=['actual','historico_fisico','proximidad','continuidad','trayectoria','trayectoria_permutada_1','trayectoria_permutada_2','trayectoria_permutada_3','trayectoria_permutada_4'] as const;
type Rule=typeof rules[number];
function forms(paths:Path[]):Form[]{
 const map=new Map<string,Form>();
 for(const p of paths){if(p.length!==3)continue;for(const q of [p,[...p].reverse()]){
  const a=[q[1].row-q[0].row,q[1].col-q[0].col,q[2].row-q[1].row,q[2].col-q[1].col];
  const v={r:q.reduce((s,x)=>s+x.row,0)/3,c:q.reduce((s,x)=>s+x.col,0)/3,a};
  map.set(JSON.stringify(v),v);
 }}
 return [...map.values()];
}
const shapeDist=(a:number[],b:number[])=>a.reduce((s,x,i)=>s+Math.abs(x-b[i]),0)/4;
const orient=(x:Form,y:Form)=>{
 let best=Infinity;
 for(const r of [1,-1])for(const c of [1,-1]){
  const d=shapeDist(x.a,y.a.map((v,i)=>v*(i%2?c:r)))+(r===1&&c===1?0:.25);
  best=Math.min(best,d);
 }
 return Math.exp(-best);
};
const dist=(x:Form,y:Form)=>Math.abs(x.r-y.r)+Math.abs(x.c-y.c);
// Cross-turn and cross-jurisdiction associations are hypotheses, not observed
// trajectories. All events are from completed days before the target.
function pairs(history:AuxiliaryHistorical[],t:Turno,offset:number):Pair[]{
 const recent=history.find(h=>h.period==='D−1'),week=history.find(h=>h.period==='D−7');
 if(!recent||!week||recent.date===week.date)return [];
 const usable=(events:Event[])=>events.filter(e=>e.jur!=='Montevideo').map(e=>({e,forms:forms(e.paths)})).filter(x=>x.forms.length).sort((x,y)=>x.e.id.localeCompare(y.e.id));
 const a=usable(recent.aux.events[3]),b=usable(week.aux.events[3]);
 // Need at least two weekly events to create a non-identity placebo.
 if(!a.length||b.length<2)return [];
 const rotation=offset===0?0:1+(offset-1)%(b.length-1);
 const target=TURNOS.indexOf(t),gap=(x:Turno,y:Turno)=>Math.abs(TURNOS.indexOf(x)-TURNOS.indexOf(y));
 const out:Pair[]=[];
 for(const x of a)for(let i=0;i<b.length;i++){
  const y=b[i],permuted=b[(i+rotation)%b.length];
  // Keep context weights fixed when permuting geometry; no hard filters.
  const weight=(x.e.jur===y.e.jur?1:.65)/(1+.35*gap(x.e.turn,y.e.turn))/(1+.25*Math.abs(TURNOS.indexOf(x.e.turn)-target));
  out.push({recent:x.forms,week:permuted.forms,weight});
 }
 return out;
}
function evidence(x:Form,ps:Pair[]){
 let near=0,continuity=0,trajectory=0,totalWeight=0;
 // Average event evidence; max over alternative historical physical paths.
 for(const p of ps){
  let n=0,c=0,z=0;
  for(const a of p.recent){
   const k=orient(x,a);
   n=Math.max(n,k*Math.exp(-dist(x,a)/3));
   for(const b of p.week){
    const persistence=orient(a,b)*k;
    const unchanged=Math.exp(-dist(x,a)/3);
    // Soft displacement extrapolation: one more geometric step, not a
    // literal constraint or a claim about elapsed calendar time.
    const predicted={...a,r:2*a.r-b.r,c:2*a.c-b.c};
    c=Math.max(c,persistence*unchanged);
    z=Math.max(z,persistence*Math.exp(-dist(x,predicted)/3));
   }
  }
  const w=p.weight??1;near+=w*n;continuity+=w*c;trajectory+=w*z;totalWeight+=w;
 }
 const count=totalWeight||1;
 return [near/count,continuity/count,trajectory/count];
}
function profile(fs:Family[],routes:{source:string;path:Cell[]}[],ps:Pair[][]){
 const groups=new Map<string,Path[]>();
 for(const r of routes){const f=label(r.path.map(c=>c.digit).join('')),a=groups.get(f)||[];a.push(r.path);groups.set(f,a)}
 const memo=new Map<string,number[]>();
 return new Map(fs.map(f=>{
  const v=Array(7).fill(0);
  for(const x of forms(groups.get(f.v)||[])){
   const key=JSON.stringify(x);let q=memo.get(key);
   if(!q){q=[...evidence(x,ps[0]),...ps.slice(1).map(p=>evidence(x,p)[2])];memo.set(key,q)}
   q.forEach((n,i)=>{v[i]=Math.max(v[i],n)});
  }
  return [f.v,v];
 }));
}
const exact=(fs:Family[])=>new Set(fs.flatMap(f=>f.values));
function quotaTop(order:Family[],baseline:Family[]){
 const quota=new Map<number,number>();
 for(const f of baseline)quota.set(f.values.length,(quota.get(f.values.length)||0)+1);
 const out:Family[]=[];
 for(const f of order){const q=quota.get(f.values.length)||0;if(q){out.push(f);quota.set(f.values.length,q-1)}}
 if(out.length!==baseline.length||exact(out).size!==exact(baseline).size)throw Error('Presupuesto distinto');
 return out;
}
type Daily={date:string;cuts:number;eligible:number;heads:number;formed:number;expected:number;conditional:number;hits:Record<Rule,number>;random:number[];contrast:number[];contrastN:number[]};
const make=(date:string):Daily=>({date,cuts:0,eligible:0,heads:0,formed:0,expected:0,conditional:0,hits:Object.fromEntries(rules.map(k=>[k,0])) as Record<Rule,number>,random:controls.map(()=>0),contrast:Array(7).fill(0),contrastN:Array(7).fill(0)});
function audit(day:Daily,t:Turno,fs:Family[],routes:{source:string;path:Cell[]}[],history:AuxiliaryHistorical[],heads:string[]){
 if(!fs.length)return;
 day.cuts++;
 const ps=[0,1,2,3,4].map(i=>pairs(history,t,i));
 if(!ps[0].length)return;
 day.eligible++;
 const a=fs.filter(f=>f.admitted).sort((a,b)=>a.rank-b.rank).slice(0,10);
 const all=exact(fs),h=heads.map(v=>v.slice(-3)),formed=h.filter(v=>all.has(v));
 const v=profile(fs,routes,ps),tie=(a:Family,b:Family)=>hash(day.date+'|'+t+'|'+a.v)-hash(day.date+'|'+t+'|'+b.v)||a.v.localeCompare(b.v);
 const byScore=(i:number)=>[...fs].sort((a,b)=>v.get(b.v)![i]-v.get(a.v)![i]||tie(a,b));
 day.heads+=h.length;day.formed+=formed.length;day.expected+=h.length*exact(a).size/1000;day.conditional+=formed.length*exact(a).size/all.size;
 const orders=[a,ranked(fs,'historico_mas_fisico',day.date,t),...Array.from({length:7},(_,i)=>byScore(i))];
 rules.forEach((rule,i)=>{const set=exact(quotaTop(orders[i],a));day.hits[rule]+=h.filter(x=>set.has(x)).length});
 controls.forEach((seed,i)=>{const order=[...fs].sort((a,b)=>hash(seed+'|'+day.date+'|'+t+'|'+a.v)-hash(seed+'|'+day.date+'|'+t+'|'+b.v)||tie(a,b));const set=exact(quotaTop(order,a));day.random[i]+=h.filter(x=>set.has(x)).length});
 const byValue=new Map(fs.flatMap(f=>f.values.map(x=>[x,f] as const)));
 const key=(f:Family)=>[f.values.length,+f.admitted,f.blocks.size,f.sources.size].join('|');
 const groups=new Map<string,Family[]>();for(const f of fs){const k=key(f),g=groups.get(k)||[];g.push(f);groups.set(k,g)}
 for(const x of formed){const f=byValue.get(x)!,group=groups.get(key(f))!;
  for(let i=0;i<7;i++){
   const n=v.get(f.v)![i];let below=0,equal=0,total=0;
   for(const g of group){const w=g.values.length,s=v.get(g.v)![i];total+=w;if(s<n)below+=w;else if(s===n)equal+=w}
   if(equal!==total){day.contrast[i]+=(below+equal/2)/total;day.contrastN[i]++}
  }
 }
}
async function build(d:string){
 const current=await draw(d);if(!hasDrawResults(current))return null;
 const week=shiftDay(d,-7),[previous,weekly,raw]=await Promise.all([loadPreviousDraws(d,1,draw),draw(week),base(d)]);
 if(raw.sourceDate>=d)throw Error('Fuga temporal AUX');
 const refs:{date:string;period:'D−1'|'D−7'}[]=[{date:previous[0].date,period:'D−1'}];
 if(hasDrawResults(weekly))refs.push({date:week,period:'D−7'});
 const history:AuxiliaryHistorical[]=await Promise.all(refs.map(async r=>{
  if(r.date>=d)throw Error('Fuga temporal raíces');
  const aux=await base(r.date);if(aux.sourceDate>=r.date)throw Error('Fuga temporal fuente histórica');
  return {...r,aux:await roots(r.date,'anterior')};
 }));
 const day=make(d);
 for(const t of TURNOS){
  const heads=JURS.filter(j=>j!=='Montevideo').map(j=>current[t]?.[j]||'');
  if(!heads.every(x=>/^\d{4}$/.test(x)))continue;
  const cut=auxAtCut(raw.heads,t,'anterior'),rank=buildAuxIndependent(d,t,cut,history);
  const routes=enumerateAuxPaths(auxiliaryBoard(cut,t),3).map(path=>({source:'aux',path}));
  audit(day,t,pool(routes,rank[3].map(f=>f.family)),routes,history,heads);
 }
 return day.cuts?day:null;
}
function selfTest(){
 // Test cross-jurisdiction and cross-turn eligibility, and verify controls
 // preserve weights while permuting weekly geometry.
 const p=(col:number)=>[{row:0,col,digit:'1'},{row:0,col:col+1,digit:'2'},{row:1,col:col+1,digit:'3'}];
 const e=(date:string,turn:Turno,jur:string,col:number)=>({id:date+'|'+turn+'|'+jur,date,turn,jur,head:'0123',length:3,paths:[p(col)]});
 const history=[{date:'2025-01-06',period:'D−1',aux:{date:'2025-01-06',events:{2:[],3:[e('2025-01-06','Previa','Ciudad',1)],4:[]}}},{date:'2025-01-01',period:'D−7',aux:{date:'2025-01-01',events:{2:[],3:[e('2025-01-01','Matutino','Provincia',2),e('2025-01-01','Nocturno','Córdoba',5)],4:[]}}}] as AuxiliaryHistorical[];
 const real=pairs(history,'Vespertino',0),placebo=pairs(history,'Vespertino',1);
 if(real.length!==2||placebo.length!==2||real[0].weight!==placebo[0].weight||JSON.stringify(real[0].week)===JSON.stringify(placebo[0].week))throw Error('Control flexible inválido');
 const a:Form={r:0,c:2,a:[0,1,1,0]},b={...a,c:0},x={...a,c:4};
 if(evidence(x,[{recent:[a],week:[b]}])[2]<=evidence(x,[{recent:[a],week:[b]}])[1])throw Error('Trayectoria inválida');
 if(evidence(a,[{recent:[a],week:[b]}])[1]<=evidence(a,[{recent:[a],week:[b]}])[2])throw Error('Continuidad inválida');
 const fs=pool(plusRoutes([{id:'prevNocturno',values:['12','34','56','78','90','12']}]),[]);
 const baseline=fs.slice(0,10);if(exact(quotaTop([...fs].reverse(),baseline)).size!==exact(baseline).size)throw Error('Presupuesto distinto');
 console.log('FLEX_EVOLUTION_SELF_TEST_OK');
}
async function main(){
 selfTest();const total=make('total'),skips:{date:string;error:string}[]=[];let days=0;
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  try{const a=await build(d);if(!a)continue;days++;for(const k of ['cuts','eligible','heads','formed','expected','conditional'] as const)total[k]+=a[k];
   for(const k of rules)total.hits[k]+=a.hits[k];
   for(const k of ['random','contrast','contrastN'] as const)a[k].forEach((v,i)=>total[k][i]+=v);
   console.log('FLEX_EVOLUTION_DAY',JSON.stringify(a));
  }catch(e){if(/Fuga temporal|Presupuesto distinto|Ruta física inválida|Histórica sin ruta física/.test(String(e)))throw e;skips.push({date:d,error:String(e)})}
 }
 if(!days)throw Error('Sin jornadas disponibles');
 const status=total.eligible?'evaluado':'sin_antecedentes_suficientes';
 if(!total.eligible)console.log('FLEX_EVOLUTION_NO_ELIGIBLE_CUTS',FROM,TO);
 console.log('FLEX_EVOLUTION_TOTAL',JSON.stringify({from:FROM,to:TO,status,days,skips,total,rules}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
