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
 
const experts=rules.filter(r=>r!=='separacion');
const windows=[7,15,30] as const;
const START=process.env.TEST_FROM||'2026-09-01';
const policies=['fijo_igual','global_mensual',...windows.flatMap(w=>['duro_'+w,'gradual_'+w])] as string[];
const K=32;
type Row={date:string;turn:Turno;hits:number[];expected:number;heads:number;random:number[][]};
const history:Row[]=[];
type Metric={cuts:number;heads:number;hits:number;expected:number;globalRandom:number[];matchedRandom:number[]};
const metric=():Metric=>({cuts:0,heads:0,hits:0,expected:0,globalRandom:Array(K).fill(0),matchedRandom:Array(K).fill(0)});
const totals:Record<string,Record<string,Metric>>={};
const days:Record<string,Record<string,number>>={};
const changes:Record<string,Record<string,number>>={};
const trainingMin:Record<number,number>={7:4,15:8,30:15};
function train(date:string,t:Turno,w:number){
 const from=shiftDay(date,-w);
 return history.filter(r=>r.turn===t&&r.date>=from&&r.date<date);
}
function counts(rows:Row[],mode=-1,index=0){
 const out=Array(experts.length).fill(0);
 for(const r of rows)for(let i=0;i<out.length;i++)out[i]+=mode<0?r.hits[i]:r.random[mode][(index+i)%N];
 return out;
}
const uniform=()=>experts.map(()=>1/experts.length);
function choose(c:number[],enough:boolean){
 if(!enough)return 0;
 return c.indexOf(Math.max(...c));
}
function weights(c:number[],enough:boolean){
 if(!enough)return uniform();
 // Shrink recent counts toward equal preferences; bounded update, not a fit.
 const mx=Math.max(...c),e=c.map(x=>Math.exp((x-mx)/2));
 const total=e.reduce((s,x)=>s+x,0);
 return e.map(x=>.5/experts.length+.5*x/total);
}
const previous=new Map<string,number[]>();
function smooth(id:string,w:number[]){
 const p=previous.get(id)||uniform();const q=w.map((x,i)=>.75*p[i]+.25*x);previous.set(id,q);return q;
}
function ensemble(fs:Family[],picks:Family[][],w:number[],target:Family[],date:string,t:Turno){
 const vote=new Map<string,number>();
 picks.forEach((p,i)=>p.forEach(f=>vote.set(f.v,(vote.get(f.v)||0)+w[i])));
 const order=[...fs].sort((a,b)=>(vote.get(b.v)||0)-(vote.get(a.v)||0)||hash('vote|'+date+'|'+t+'|'+a.v)-hash('vote|'+date+'|'+t+'|'+b.v)||a.v.localeCompare(b.v));
 return quotaTop(order,target,k0);
}
function add(policy:string,t:Turno,date:string,h:number,expected:number,heads:number,global:number[],matched:number[]){
 if(date<START)return;
 for(const key of ['total',t,date.slice(0,7)]){
  const a=totals[policy]||(totals[policy]={}),m=a[key]||(a[key]=metric());
  m.cuts++;m.heads+=heads;m.hits+=h;m.expected+=expected;
  global.forEach((n,i)=>m.globalRandom[i]+=n);matched.forEach((n,i)=>m.matchedRandom[i]+=n);
 }
 const d=days[date]||(days[date]={});d[policy]=(d[policy]||0)+h;
}
function audit(date:string,t:Turno,fs:Family[],heads:string[]){
 if(!fs.length)return;
 const baseline=fs.filter(f=>f.admitted).sort((a,b)=>a.rank-b.rank).slice(0,10);
 if(!baseline.length)return;
 const original=quotaTop(ranked(fs,'historico_mas_fisico',date,t),baseline,k0);
 const geo=new Map(fs.map(f=>[f.v,geometry(f)]));
 const picks=experts.map(r=>r==='actual'?baseline:r==='combinado_original'?original:quotaTop(order(fs,r,date,t,geo),original,key.admision_bloques));
 const suffix=heads.map(x=>x.slice(-3)),expected=heads.length*exact(baseline).size/1000;
 const hit=(p:Family[])=>{const a=exact(p);return suffix.filter(x=>a.has(x)).length};
 const hits=picks.map(hit);
 // Two placebo families: completely physical random and admission/block
 // matched random. Same experts, same time window, same update rule.
 const randomPicks=[[],[]] as Family[][][];
 for(let i=0;i<N;i++){
  const rnd=shuffled(fs,'turnadapt|'+date+'|'+t+'|'+i);
  randomPicks[0].push(quotaTop(rnd,baseline,k0));randomPicks[1].push(quotaTop(rnd,original,key.admision_bloques));
 }
 const random=randomPicks.map(p=>p.map(hit));
 const placebo=(rows:Row[],enough:boolean,kind:'duro'|'gradual'|'igual',tag:string,mode:number)=>{
  const out:number[]=[];
  for(let i=0;i<K;i++){
   const c=counts(rows,mode,i),ps=experts.map((_,j)=>randomPicks[mode][(i+j)%N]);
   if(kind==='duro')out.push(hit(ps[choose(c,enough)]));
   else{const w=kind==='igual'?uniform():smooth('rnd|'+mode+'|'+i+'|'+t+'|'+tag,weights(c,enough));out.push(hit(ensemble(fs,ps,w,baseline,date,t)))}
  }
  return out;
 };
 for(let i=0;i<experts.length;i++)add('fijo_'+experts[i],t,date,hits[i],expected,heads.length,random[0].slice(0,K),random[1].slice(0,K));
 const equal=hit(ensemble(fs,picks,uniform(),baseline,date,t));
 add('fijo_igual',t,date,equal,expected,heads.length,placebo([],false,'igual','equal',0),placebo([],false,'igual','equal',1));
 const start=date.slice(0,7)+'-01',end=shiftDay(start,-1),from=end.slice(0,7)+'-01';
 const monthRows=history.filter(r=>r.date>=from&&r.date<=end);
 const monthCounts=counts(monthRows),enoughMonth=new Set(monthRows.map(r=>r.date)).size>=15;
 const monthRule=enoughMonth&&Math.max(...monthCounts)>monthRows.reduce((s,r)=>s+r.expected,0)?choose(monthCounts,true):0;
 add('global_mensual',t,date,hits[monthRule],expected,heads.length,placebo(monthRows,enoughMonth,'duro','month',0),placebo(monthRows,enoughMonth,'duro','month',1));
 for(const w of windows){
  const rows=train(date,t,w),enough=rows.length>=trainingMin[w],c=counts(rows),winner=choose(c,enough);
  const soft=smooth('real|'+t+'|'+w,weights(c,enough));
  for(const kind of ['duro','gradual'] as const){
   const tag=kind+'_'+w;
   const h=kind==='duro'?hits[winner]:hit(ensemble(fs,picks,soft,baseline,date,t));
   add(tag,t,date,h,expected,heads.length,placebo(rows,enough,kind,tag,0),placebo(rows,enough,kind,tag,1));
   if(date>=START){const k=tag+'|'+t,v=kind==='duro'?experts[winner]:experts[soft.indexOf(Math.max(...soft))];const a=changes[k]||(changes[k]={});a[v]=(a[v]||0)+1}
  }
 }
 // Append only after all predictions and controls for this cut.
 history.push({date,turn:t,hits,expected,heads:heads.length,random});
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
  const routes=enumerateAuxPaths(auxiliaryBoard(cut,t),3).map(path=>({source:'aux',path}));
  audit(d,t,pool(routes,rank[3].map(f=>f.family)),heads);day.cuts++;
 }
 return day.cuts?day:null;
}


function selfTest(){
 const fs=pool(plusRoutes([{id:'prevNocturno',values:['12','34','56','78','90','12']}]),[]);
 const a=fs.slice(0,10),p=ensemble(fs,experts.map(()=>a),uniform(),a,'2026-08-01','Previa');
 if(exact(p).size!==exact(a).size)throw Error('Presupuesto distinto');
 const w=weights([5,...experts.slice(1).map(()=>0)],true);
 if(Math.abs(w.reduce((s,x)=>s+x,0)-1)>1e-10||w[0]<=w[1])throw Error('Pesos inválidos');
 history.push({date:'2026-08-01',turn:'Previa',hits:experts.map(()=>0),expected:0,heads:0,random:[[],[]]},{date:'2026-08-02',turn:'Previa',hits:experts.map(()=>99),expected:0,heads:0,random:[[],[]]});
 if(train('2026-08-02','Previa',7).length!==1||train('2026-08-02','Primera',7).length!==0)throw Error('Fuga temporal selección');
 history.length=0;console.log('TURN_ADAPT_SELF_TEST_OK');
}
async function main(){
 selfTest();const skips:{date:string;error:string}[]=[];let n=0;
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  const h=history.length;
  try{const day=await build(d);if(day){n++;if(d>=START)console.log('TURN_ADAPT_DAY',JSON.stringify({date:d,hits:days[d]}))}}
  catch(e){if(history.length!==h||/Fuga temporal|Presupuesto distinto|Ruta física inválida|Histórica sin ruta física|Geometría inválida|Pesos inválidos/.test(String(e)))throw e;skips.push({date:d,error:String(e)})}
 }
 if(!Object.keys(days).length)throw Error('Sin muestra de evaluación');
 console.log('TURN_ADAPT_TOTAL',JSON.stringify({from:FROM,to:TO,start:START,days:n,skips,experts,totals,changes}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
