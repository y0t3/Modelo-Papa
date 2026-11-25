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


type Route={source:string;path:Cell[]};
type Point={r:number;c:number};
type Block={id:string;shape:string;points:Point[]};
type Event={jur:string;blocks:Block[]};
type Cut={date:string;turn:Turno;events:Event[];pool:Block[];visible:Set<string>};
const previousCuts=new Map<string,Cut>();
const exact=(fs:Family[])=>new Set(fs.flatMap(f=>f.values));
const sources=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const xy=(p:Point)=>p.r+':'+p.c;
const dist=(a:Point,b:Point)=>Math.abs(a.r-b.r)+Math.abs(a.c-b.c);
function makeBlock(engine:string,r:Route):Block{
 const pts=r.path.map(c=>({r:c.row,c:c.col+(engine==='lalo'?2*sources.indexOf(r.source):0)})).sort((a,b)=>a.r-b.r||a.c-b.c);
 const minR=Math.min(...pts.map(p=>p.r)),minC=Math.min(...pts.map(p=>p.c));
 return {id:pts.map(xy).join('|'),shape:pts.map(p=>(p.r-minR)+':'+(p.c-minC)).join('|'),points:pts};
}
function uniqueBlocks(engine:string,rs:Route[]){return [...new Map(rs.map(r=>{const b=makeBlock(engine,r);return [b.id,b]})).values()];}
function record(engine:string,d:string,t:Turno,routes:Route[],heads:string[]){
 const pool=uniqueBlocks(engine,routes),jur=JURS.filter(j=>j!=='Montevideo');
 const events=heads.flatMap((h,i)=>{
  const blocks=uniqueBlocks(engine,routes.filter(r=>r.path.map(c=>c.digit).join('')===h.slice(-3)));
  return blocks.length?[{jur:jur[i],blocks}]:[];
 });
 previousCuts.set(engine+'|'+t,{date:d,turn:t,events,pool,visible:new Set(pool.flatMap(b=>b.points.map(xy)))});
}
function past(engine:string,d:string,t:Turno){
 return TURNOS.slice(0,TURNOS.indexOf(t)).flatMap(turn=>{
  const cut=previousCuts.get(engine+'|'+turn);if(!cut)return [];
  if(cut.date!==d||TURNOS.indexOf(cut.turn)>=TURNOS.indexOf(t))throw Error('Fuga temporal');
  return [cut];
 });
}
function permutation(cut:Cut,seed:string){
 const groups=new Map<string,Block[]>();
 for(const b of cut.pool){const a=groups.get(b.shape)||[];a.push(b);groups.set(b.shape,a);}
 const map=new Map<string,Block>();
 for(const [shape,bs] of groups){
  const a=[...bs].sort((x,y)=>x.id.localeCompare(y.id)),b=[...bs].sort((x,y)=>hash(seed+'|'+shape+'|'+x.id)-hash(seed+'|'+shape+'|'+y.id)||x.id.localeCompare(y.id));
  a.forEach((x,i)=>map.set(x.id,b[i]));
 }
 return cut.events.map(e=>({jur:e.jur,blocks:e.blocks.map(b=>map.get(b.id)!)}));
}
// Each actual head contributes unit mass; its alternative blocks share that
// mass equally. Placebos permute within exact translated block-shape classes
// of the ORIGINAL pre-draw board; no extra cells or future columns.
const seeds=['p1','p2','p3','p4'];
const names=['concentracion','expansion','poco_usada','intermedia','nueva_zona','concentracion_reciente'] as const;
type Influence={mass:Map<string,{p:Point;w:number}>;events:number;covered:Set<string>};
function influence(cuts:Cut[],seed?:string,recent=false):Influence{
 const mass=new Map<string,{p:Point;w:number}>(),covered=new Set<string>();let events=0;
 const use=recent?cuts.slice(-1):cuts;
 for(const cut of use){
  for(const k of cut.visible)covered.add(k);
  const es=seed?permutation(cut,seed+'|'+cut.date+'|'+cut.turn):cut.events;
  for(const e of es){events++;for(const b of e.blocks)for(const p of b.points){const k=xy(p),old=mass.get(k)||{p,w:0};old.w+=1/(3*e.blocks.length);mass.set(k,old);}}
 }
 if(events)for(const a of mass.values())a.w/=events;
 return {mass,events,covered};
}
function cellScore(p:Point,map:Influence){
 let near=0,ring=0,mid=0;
 for(const a of map.mass.values()){
  const d=dist(p,a.p);
  near+=a.w*Math.exp(-d/1.5);
  ring+=a.w*Math.exp(-((d-2)**2)/2);
  mid+=a.w*Math.exp(-((d-1)**2)/2);
 }
 return [near,ring,map.covered.has(xy(p))?1-near:0,mid,Number(!map.covered.has(xy(p)))];
}
function profiles(engine:string,fs:Family[],routes:Route[],cuts:Cut[],seed?:string){
 const all=influence(cuts,seed),last=influence(cuts,seed,true);
 const groups=new Map<string,Block[]>();
 for(const r of routes){const k=label(r.path.map(c=>c.digit).join('')),a=groups.get(k)||[];a.push(makeBlock(engine,r));groups.set(k,a);}
 const cache=new Map<string,number[]>();
 function score(b:Block){
  let v=cache.get(b.id);if(v)return v;
  const cs=b.points.map(p=>cellScore(p,all)),rs=b.points.map(p=>cellScore(p,last));
  v=Array.from({length:5},(_,i)=>cs.reduce((n,x)=>n+x[i],0)/3);
  v.push(last.events?rs.reduce((n,x)=>n+x[0],0)/3:0);
  cache.set(b.id,v);return v;
 }
 return fs.map(f=>{const xs=groups.get(f.v)||[],v=Array(names.length).fill(0);for(const b of xs){const q=score(b);for(let i=0;i<v.length;i++)v[i]=Math.max(v[i],q[i]);}return {f,x:v};});
}
const methods=['actual','control','bloques','compactos','historico_mas_fisico',...names,...seeds.flatMap(s=>names.map(n=>s+'_'+n))];
type Result=Metric&{formed:number;position:number;eligible:number;both:number;onlyMethod:number;onlyActual:number};
const measures:Record<string,Result>={},days:Record<string,Record<string,number>>={};
const featureAudit:Record<string,{n:number;hit:number;expected:number}>={};
const availability:Record<string,{cuts:number;eligible:number;events:number;blocks:number;ambiguous:number}>={};
function select(fs:Family[],d:string,t:Turno,eligible:boolean,real:{f:Family;x:number[]}[],controls:{f:Family;x:number[]}[][],recent:boolean){
 const hist=ranked(fs.filter(f=>f.admitted),'actual',d,t),baseline=hist.slice(0,10);
 const tie=(a:Family,b:Family)=>hash(d+'|'+t+'|'+a.v)-hash(d+'|'+t+'|'+b.v)||a.v.localeCompare(b.v);
 const orders:Record<string,Family[]>={actual:hist,control:ranked(fs,'control',d,t),bloques:ranked(fs,'bloques',d,t),compactos:ranked(fs,'compactos',d,t),historico_mas_fisico:ranked(fs,'historico_mas_fisico',d,t)};
 for(const [prefix,rows] of [['',real] as const,...controls.map((r,i)=>[seeds[i]+'_',r] as const)]){
  for(let i=0;i<names.length;i++){const score=new Map(rows.map(r=>[r.f.v,r.x[i]]));orders[prefix+names[i]]=eligible&&(i!==5||recent)?[...fs].sort((a,b)=>score.get(b.v)!-score.get(a.v)!||tie(a,b)):hist;}
 }
 const quota=new Map<number,number>();for(const f of baseline)quota.set(f.values.length,(quota.get(f.values.length)||0)+1);
 const out:Record<string,{top:Family[];full:Family[]}>={};
 for(const name of methods){const rem=new Map(quota),top:Family[]=[],rest:Family[]=[];
  for(const f of orders[name]){const q=rem.get(f.values.length)||0;if(q){top.push(f);rem.set(f.values.length,q-1);}else rest.push(f);}
  if(top.length!==baseline.length||exact(top).size!==exact(baseline).size)throw Error('Cobertura diferente');
  out[name]={top,full:[...top,...rest]};
 }
 return out;
}
function audit(engine:string,t:Turno,d:string,fs:Family[],routes:Route[],heads:string[]){
 const cuts=past(engine,d,t),events=cuts.flatMap(c=>c.events),eligible=events.length>0,recent=!!cuts.at(-1)?.events.length;
 if(!fs.length){record(engine,d,t,routes,heads);return;}
 const real=profiles(engine,fs,routes,cuts),controls=seeds.map(s=>profiles(engine,fs,routes,cuts,s));
 const picks=select(fs,d,t,eligible,real,controls,recent);
 const h=heads.map(x=>x.slice(-3)),all=exact(fs),formed=h.filter(x=>all.has(x)).length,a=exact(picks.actual.top);
 for(const key of [engine,engine+'|'+t]){
  const z=availability[key]||(availability[key]={cuts:0,eligible:0,events:0,blocks:0,ambiguous:0});
  z.cuts++;z.eligible+=Number(eligible);z.events+=events.length;z.blocks+=events.reduce((n,e)=>n+e.blocks.length,0);z.ambiguous+=events.filter(e=>e.blocks.length>1).length;
 }
 for(const [name,p] of Object.entries(picks)){
  const set=exact(p.top),hits=h.filter(v=>set.has(v)).length,ranks=new Map<string,number>();let before=0;
  for(const f of p.full){for(const v of f.values)ranks.set(v,1-(before+f.values.length/2)/all.size);before+=f.values.length;}
  const tail=(all.size-before)/2/all.size,position=h.reduce((s,v)=>s+(all.has(v)?ranks.get(v)??tail:0),0);
  for(const key of [engine+'|'+name,engine+'|'+t+'|'+name,...(eligible?[engine+'|elegible|'+name]:[])]){
   const m=measures[key]||(measures[key]={...empty(),formed:0,position:0,eligible:0,both:0,onlyMethod:0,onlyActual:0});
   m.cuts++;m.heads+=h.length;m.hits+=hits;m.expected+=h.length*set.size/1000;m.conditional+=formed*set.size/all.size;m.size+=set.size;m.any+=Number(hits>0);m.formed+=formed;m.position+=position;m.eligible+=Number(eligible);
   m.both+=h.filter(v=>a.has(v)&&set.has(v)).length;m.onlyActual+=h.filter(v=>a.has(v)&&!set.has(v)).length;m.onlyMethod+=h.filter(v=>set.has(v)&&!a.has(v)).length;
  }
  const daily=days[d]||(days[d]={}),key=engine+'|'+name;daily[key]=(daily[key]||0)+hits;
 }
 if(eligible)for(const [prefix,rows] of [['',real] as const,...controls.map((r,i)=>[seeds[i]+'_',r] as const)])for(let i=0;i<names.length;i++){
  const key=engine+'|'+prefix+names[i],z=featureAudit[key]||(featureAudit[key]={n:0,hit:0,expected:0});z.n+=formed;
  z.hit+=rows.reduce((s,r)=>s+h.filter(v=>r.f.values.includes(v)).length*r.x[i],0);z.expected+=formed*rows.reduce((s,r)=>s+r.f.values.length*r.x[i],0)/all.size;
 }
 record(engine,d,t,routes,heads);
}
async function build(d:string):Promise<number>{
 const current=await draw(d);if(!hasDrawResults(current))return 0;
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

 let completeCuts=0;
 for(const t of TURNOS){
  const heads=JURS.filter(j=>j!=='Montevideo').map(j=>current[t]?.[j]||'');
  if(!heads.every(x=>/^\d{4}$/.test(x)))continue;
  completeCuts++;
  const view=buildMotorLalo(sheet,d,t,hist);
  const pr=plusRoutes(sheet.columns.slice(0,TURNOS.indexOf(t)+1));
  audit('lalo',t,d,pool(pr,view.ranks.vt3.map(f=>f.family)),pr,heads);
  for(const input of auxInputs){
   if(!input)continue;
   const engine=input.mode==='anterior'?'ayer':'hoy',cut=auxAtCut(input.raw,t,input.mode);
   const ranks=buildAuxIndependent(d,t,cut,input.history);
   const routes=enumerateAuxPaths(auxiliaryBoard(cut,t),3).map(path=>({source:'aux',path}));
   audit(engine,t,d,pool(routes,ranks[3].map(f=>f.family)),routes,heads);
  }
 }
 return completeCuts;
}




function selfTest(){
 const routes=plusRoutes([{id:'prevNocturno',values:['12','34','56','78','90','12']}]),full=pool(routes,[]),fs=pool(routes,full.slice(0,10).map(f=>f.v)),d='2026-11-25';
 record('lalo',d,'Previa',routes,['0123','0124','0789','0111','0222']);
 const cuts=past('lalo',d,'Primera'),c=cuts[0],p=permutation(c,'test'),map=influence(cuts);
 if(!c.events.length||Math.abs([...map.mass.values()].reduce((s,x)=>s+x.w,0)-1)>1e-9)throw Error('Masa no normalizada');
 for(let i=0;i<p.length;i++)for(let j=0;j<p[i].blocks.length;j++)if(p[i].blocks[j].shape!==c.events[i].blocks[j].shape||!c.pool.some(b=>b.id===p[i].blocks[j].id))throw Error('Control invalido');
 const real=profiles('lalo',fs,routes,cuts),ctrl=seeds.map(s=>profiles('lalo',fs,routes,cuts,s));
 const picks=select(fs,d,'Primera',true,real,ctrl,true);for(const x of Object.values(picks))if(exact(x.top).size!==exact(picks.actual.top).size)throw Error('Cobertura diferente');
 let rejected=false;previousCuts.set('lalo|Previa',{...c,date:'2026-11-26'});try{past('lalo',d,'Primera')}catch(e){rejected=String(e).includes('Fuga temporal');}if(!rejected)throw Error('No rechazó futuro');
 previousCuts.clear();console.log('INFLUENCE_SELF_TEST_OK');
}
async function main(){
 selfTest();let count=0;const skips:{date:string;error:string}[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  previousCuts.clear();try{if(await build(d))count++;}catch(e){if(previousCuts.size||/Ruta física inválida|Histórica sin ruta física|Cobertura diferente|Fuga temporal/.test(String(e)))throw e;skips.push({date:d,error:String(e)});}
 }
 if(!count)throw Error('Sin jornadas');
 console.log('INFLUENCE_JSON',JSON.stringify({from:FROM,to:TO,days:count,skips,availability,seeds}));
 for(const engine of ['lalo','ayer','hoy'])console.log('INFLUENCE_ENGINE',JSON.stringify({engine,metrics:Object.fromEntries(Object.entries(measures).filter(([k])=>k.startsWith(engine+'|')&&(k.split('|').length===2||k.includes('|elegible|')))),features:Object.fromEntries(Object.entries(featureAudit).filter(([k])=>k.startsWith(engine+'|')))}));
 for(const engine of ['lalo','ayer','hoy'])console.log('INFLUENCE_TURNS',JSON.stringify({engine,metrics:Object.fromEntries(Object.entries(measures).filter(([k])=>k.startsWith(engine+'|')&&k.split('|').length===3&&!k.includes('|elegible|')))}));
 for(const [date,metrics] of Object.entries(days))console.log('INFLUENCE_DAY',JSON.stringify({date,metrics}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
