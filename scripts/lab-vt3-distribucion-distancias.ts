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
type Influence={mass:Map<string,{p:Point;w:number}>;events:number;covered:Set<string>;eventMass:Map<string,{p:Point;w:number}>[]};
function influence(cuts:Cut[],seed?:string,recent=false):Influence{
 const mass=new Map<string,{p:Point;w:number}>(),covered=new Set<string>(),eventMass:Influence['eventMass']=[];let events=0;
 const use=recent?cuts.slice(-1):cuts;
 for(const cut of use){
  for(const k of cut.visible)covered.add(k);
  const es=seed?permutation(cut,seed+'|'+cut.date+'|'+cut.turn):cut.events;
  for(const e of es){events++;const em=new Map<string,{p:Point;w:number}>();for(const b of e.blocks)for(const p of b.points){const k=xy(p),w=1/(3*e.blocks.length),old=mass.get(k)||{p,w:0},own=em.get(k)||{p,w:0};old.w+=w;own.w+=w;mass.set(k,old);em.set(k,own);}eventMass.push(em);}
 }
 if(events)for(const a of mass.values())a.w/=events;
 return {mass,events,covered,eventMass};
}

// No ranking or Top 10. Uniform conditional null over exact formable values.
// Each value gets unit mass; alternative physical blocks share it equally.
// Two definitions: nearest marked cell to each candidate cell, and all
// candidate/antecedent cell pairs weighted by the observed-head mass.
const axes=['total','vertical','horizontal'] as const;
const modes=['cercana','pares'] as const;
const N=6,bin=(d:number)=>Math.min(5,d);
type Hist=number[][];
const blank=():Hist=>axes.map(()=>Array(N).fill(0));
function add(a:Hist,b:Hist,w=1){for(let i=0;i<a.length;i++)for(let j=0;j<N;j++)a[i][j]+=w*b[i][j];}
function put(a:Hist,p:Point,q:Point,w:number){
 const dr=Math.abs(p.r-q.r),dc=Math.abs(p.c-q.c);
 a[0][bin(dr+dc)]+=w;a[1][bin(dr)]+=w;a[2][bin(dc)]+=w;
}
function cellHist(p:Point,m:Influence){
 const near=blank(),pairs=blank(),pts=[...m.mass.values()];
 let best=Infinity;for(const a of pts){best=Math.min(best,dist(p,a.p));put(pairs,p,a.p,a.w);}
 const tied=pts.filter(a=>dist(p,a.p)===best);
 for(const a of tied)put(near,p,a.p,1/tied.length);
 return [near,pairs];
}
function distributions(engine:string,routes:Route[],m:Influence){
 const grouped=new Map<string,Map<string,Block>>();
 for(const r of routes){
  const value=r.path.map(c=>c.digit).join(''),b=makeBlock(engine,r),bs=grouped.get(value)||new Map<string,Block>();
  bs.set(b.id,b);grouped.set(value,bs);
 }
 const cellCache=new Map<string,Hist[]>(),blockCache=new Map<string,Hist[]>();
 function blockHist(b:Block){
  let h=blockCache.get(b.id);if(h)return h;
  h=modes.map(()=>blank());for(const p of b.points){
   let q=cellCache.get(xy(p));if(!q){q=cellHist(p,m);cellCache.set(xy(p),q);}
   q.forEach((v,i)=>add(h![i],v,1/3));
  }blockCache.set(b.id,h);return h;
 }
 const out=new Map<string,Hist[]>();
 for(const [v,bs] of grouped){const h=modes.map(()=>blank());for(const b of bs.values())blockHist(b).forEach((x,i)=>add(h[i],x,1/bs.size));out.set(v,h);}
 return out;
}
type MetricDist={cuts:number;heads:number;formed:number;observed:Hist;expected:Hist};
const metrics:Record<string,MetricDist>={},daily:Record<string,Record<string,MetricDist>>={};
const availability:Record<string,{cuts:number;eligible:number;heads:number;formed:number;eligibleFormed:number;events:number}>={};
function accumulate(store:Record<string,MetricDist>,key:string,heads:number,formed:number,o:Hist,e:Hist){
 const a=store[key]||(store[key]={cuts:0,heads:0,formed:0,observed:blank(),expected:blank()});a.cuts++;a.heads+=heads;a.formed+=formed;add(a.observed,o);add(a.expected,e);
}
function audit(engine:string,t:Turno,d:string,fs:Family[],routes:Route[],heads:string[]){
 const cuts=past(engine,d,t),events=cuts.flatMap(c=>c.events),eligible=events.length>0;
 const h=heads.map(x=>x.slice(-3)),all=exact(fs),formed=h.filter(v=>all.has(v));
 for(const k of [engine,engine+'|'+t]){
  const a=availability[k]||(availability[k]={cuts:0,eligible:0,heads:0,formed:0,eligibleFormed:0,events:0});a.cuts++;a.heads+=h.length;a.formed+=formed.length;a.eligible+=Number(eligible&&all.size>0);a.eligibleFormed+=eligible?formed.length:0;a.events+=events.length;
 }
 if(eligible&&all.size){
  for(const seed of ['real',...seeds]){
   const m=influence(cuts,seed==='real'?undefined:seed),ds=distributions(engine,routes,m);
   if(ds.size!==all.size||[...all].some(v=>!ds.has(v)))throw Error('Universo físico diferente');
   for(let i=0;i<modes.length;i++){
    const o=blank(),e=blank();for(const v of formed)add(o,ds.get(v)![i]);
    for(const x of ds.values())add(e,x[i],formed.length/ds.size);
    for(const a of [...o,...e])if(Math.abs(a.reduce((s,v)=>s+v,0)-formed.length)>1e-7)throw Error('Masa incorrecta');
    const k=[engine,seed,modes[i]].join('|');
    accumulate(metrics,k,h.length,formed.length,o,e);
    accumulate(metrics,[engine,t,seed,modes[i]].join('|'),h.length,formed.length,o,e);
    accumulate(daily[d]||(daily[d]={}),k,h.length,formed.length,o,e);
   }
  }
 }
 // POST only, no current outcome used to construct its own antecedent map.
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
 const p={r:1,c:2},q={r:3,c:5},z=blank();put(z,p,q,1);
 if(z[0][5]!==1||z[1][2]!==1||z[2][3]!==1)throw Error('Distancia incorrecta');
 const m:Influence={mass:new Map([['a',{p:{r:1,c:1},w:.25}],['b',{p:{r:2,c:2},w:.75}]]),events:1,covered:new Set(),eventMass:[]};
 const [near,pairs]=cellHist({r:1,c:2},m);
 if(near[0][1]!==1||near[1][0]!==.5||near[2][0]!==.5||pairs[1][0]!==.25||pairs[2][0]!==.75)throw Error('Empates o masa incorrecta');
 const routes=plusRoutes([{id:'prevNocturno',values:['12','34','56','78','90','12']}]),fs=pool(routes,[]),d='2026-11-25';
 record('lalo',d,'Previa',routes,['0123','0124','0789','0111','0222']);
 const cuts=past('lalo',d,'Primera'),c=cuts[0],ctrl=permutation(c,'test');
 if(!c.events.length)throw Error('Sin antecedentes de prueba');
 for(let i=0;i<ctrl.length;i++)for(let j=0;j<ctrl[i].blocks.length;j++)if(ctrl[i].blocks[j].shape!==c.events[i].blocks[j].shape||!c.pool.some(b=>b.id===ctrl[i].blocks[j].id))throw Error('Control invalido');
 const h=distributions('lalo',routes,influence(cuts));
 if(h.size!==exact(fs).size)throw Error('Universo físico diferente');
 for(const hs of h.values())for(const a of hs)for(const row of a)if(Math.abs(row.reduce((s,v)=>s+v,0)-1)>1e-9)throw Error('Masa incorrecta');
 let rejected=false;previousCuts.set('lalo|Previa',{...c,date:'2026-11-26'});try{past('lalo',d,'Primera')}catch(e){rejected=String(e).includes('Fuga temporal');}if(!rejected)throw Error('No rechazó futuro');
 previousCuts.clear();console.log('DISTANCE_SELF_TEST_OK');
}
async function main(){
 selfTest();let count=0;const skips:{date:string;error:string}[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  previousCuts.clear();try{if(await build(d))count++;}catch(e){if(previousCuts.size||/Ruta física inválida|Histórica sin ruta física|Universo físico diferente|Masa incorrecta|Fuga temporal/.test(String(e)))throw e;skips.push({date:d,error:String(e)});}
 }
 if(!count)throw Error('Sin jornadas');
 console.log('DISTANCE_JSON',JSON.stringify({from:FROM,to:TO,days:count,skips,availability,axes,modes,seeds}));
 for(const engine of ['lalo','ayer','hoy'])console.log('DISTANCE_ENGINE',JSON.stringify({engine,metrics:Object.fromEntries(Object.entries(metrics).filter(([k])=>k.startsWith(engine+'|')&&k.split('|').length===3))}));
 for(const engine of ['lalo','ayer','hoy'])console.log('DISTANCE_TURNS',JSON.stringify({engine,metrics:Object.fromEntries(Object.entries(metrics).filter(([k])=>k.startsWith(engine+'|')&&k.split('|').length===4))}));
 for(const [date,v] of Object.entries(daily))console.log('DISTANCE_DAY',JSON.stringify({date,metrics:v}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
