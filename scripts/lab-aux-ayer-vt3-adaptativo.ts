import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {fetchAuxiliaryBaseForDate,fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
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

/** AUX AYER VT3. Historical/compact frozen exactly as previous lab.
 * Position signal: common physical exact-value universe, missing historical
 * families tied at bottom, midrank percentile (mean .5 under uniform physical).
 * Use only prior days; shared memory pools all turns of each prior day.
 */
const windows=[5,10,20,30] as const;
type Frame={date:string;turn:Turno;fs:Family[];heads:string[]};
type Observation={date:string;turn:Turno;hitDiff:number;positionDiff:number};
type PairMetric=Metric&{histOnly:number;methodOnly:number;compactOnly:number;methodOnlyCompact:number;position:number;positionExpected:number;formed:number;weightHist:number};
const metrics:Record<string,PairMetric>={},daily:Record<string,{h:number;c:number;hits:number;expected:number;heads:number}>={};
const memory=new Map<string,Observation[]>();
function budget(fs:Family[],hist:Family[]){
 const quotas=new Map<number,number>();
 for(const f of hist)quotas.set(f.values.length,(quotas.get(f.values.length)||0)+1);
 const chosen:Family[]=[],rest:Family[]=[];
 for(const f of fs){const n=f.values.length,q=quotas.get(n)||0;if(q){chosen.push(f);quotas.set(n,q-1);}else rest.push(f);}
 if(chosen.length!==hist.length||chosen.reduce((n,f)=>n+f.values.length,0)!==hist.reduce((n,f)=>n+f.values.length,0))throw Error('Cobertura diferente');
 return {top:chosen,full:[...chosen,...rest]};
}
const exact=(fs:Family[])=>new Set(fs.flatMap(f=>f.values));
function percentiles(ranking:Family[],universe:Family[]){
 const n=exact(universe).size,score=new Map<string,number>();let before=0;
 for(const f of ranking){
  const k=f.values.length;
  for(const v of f.values){if(score.has(v))throw Error('Duplicado');score.set(v,1-(before+k/2)/n);}
  before+=k;
 }
 const tail=(n-before)/2/n;
 for(const v of exact(universe))if(!score.has(v))score.set(v,tail);
 if(Math.abs([...score.values()].reduce((a,b)=>a+b,0)/n-0.5)>1e-9)throw Error('Percentil sesgado');
 return score;
}
function prior(scope:string,t:Turno,d:string,w:number,mem:Map<string,Observation[]>){
 const all=mem.get(scope==='turno'?t:'todos')||[];
 if(all.some(x=>x.date>=d))throw Error('Fuga temporal');
 const dates=[...new Set(all.map(x=>x.date))].slice(-w);
 return dates.length===w?all.filter(x=>dates.includes(x.date)):[];
}
function decisions(rows:Observation[],signal:'hits'|'pos'){
 const diff=rows.reduce((a,b)=>a+(signal==='hits'?b.hitDiff:b.positionDiff),0);
 // Shrink toward compact (fixed alternative), not a probability.
 const weight=rows.length?Math.max(0,Math.min(1,0.5+diff/(2*(4+Math.abs(diff))))):0;
 return {choice:diff>0?'historico':'compacto',weight};
}
function evaluate(r:Frame,mem:Map<string,Observation[]>,collect:boolean){
 const {date:d,turn:t,fs,heads}=r;
 const h=ranked(fs.filter(f=>f.admitted),'actual',d,t);
 const baseline=h.slice(0,10),c=budget(ranked(fs,'compactos',d,t),baseline);
 const control=budget(ranked(fs,'control',d,t),baseline);
 const hp=percentiles(h,fs),cp=percentiles(c.full,fs);
 const hs=exact(baseline),cs=exact(c.top),all=exact(fs);
 const actual=heads.map(x=>x.slice(-3));
 const formed=actual.filter(v=>all.has(v)).length;
 const pos=(p:Map<string,number>)=>actual.reduce((a,v)=>a+(p.get(v)||0),0);
 const count=(x:Set<string>)=>actual.filter(v=>x.has(v)).length;
 const observation={date:d,turn:t,hitDiff:count(hs)-count(cs),positionDiff:pos(hp)-pos(cp)};
 const choices:Record<string,{top:Family[];full:Family[];weight:number}>={historico:{top:baseline,full:h,weight:1},compacto:{...c,weight:0},control:{...control,weight:0}};
 function mixed(w:number){
  if(w===0)return {...c,weight:w};if(w===1)return {top:baseline,full:h,weight:w};
  // Reciprocal ranking blend: historical absent families receive no
  // historical vote, compact always covers the physical universe.
  const hr=new Map(h.map((f,i)=>[f.v,i+1])),cr=new Map(c.full.map((f,i)=>[f.v,i+1]));
  const score=(f:Family)=>w*(hr.has(f.v)?1/(10+hr.get(f.v)!):0)+(1-w)/(10+cr.get(f.v)!);
  const order=[...fs].sort((a,b)=>score(b)-score(a)||cr.get(a.v)!-cr.get(b.v)!);
  return {...budget(order,baseline),weight:w};
 }
 choices.mezcla_fija=mixed(.5);
 for(const scope of ['turno','todos'])for(const w of windows){
  const sample=prior(scope,t,d,w,mem);
  for(const signal of ['hits','pos'] as const){
   const a=decisions(sample,signal),suffix=scope+'_'+signal+'_'+w;
   choices['elige_'+suffix]=choices[a.choice];
   choices['pondera_'+suffix]=mixed(a.weight);
  }
 }
 for(const [method,x] of Object.entries(choices)){
  const set=exact(x.top);
  if(set.size!==hs.size||x.top.length!==baseline.length)throw Error('Cobertura diferente');
  if(!collect)continue;
  const score=percentiles(x.full,fs),hits=count(set),expected=actual.length*set.size/1000;
  for(const k of [method,t+'|'+method]){
   const m=metrics[k]||(metrics[k]={...empty(),histOnly:0,methodOnly:0,compactOnly:0,methodOnlyCompact:0,position:0,positionExpected:0,formed:0,weightHist:0});
   m.cuts++;m.heads+=actual.length;m.hits+=hits;m.expected+=expected;m.conditional+=formed*set.size/all.size;m.size+=set.size;m.any+=Number(hits>0);
   m.histOnly+=actual.filter(v=>hs.has(v)&&!set.has(v)).length;m.methodOnly+=actual.filter(v=>set.has(v)&&!hs.has(v)).length;
   m.compactOnly+=actual.filter(v=>cs.has(v)&&!set.has(v)).length;m.methodOnlyCompact+=actual.filter(v=>set.has(v)&&!cs.has(v)).length;
   m.position+=pos(score);m.positionExpected+=formed*.5;m.formed+=formed;m.weightHist+=x.weight;
  }
  const k=d+'|'+method,a=daily[k]||(daily[k]={h:0,c:0,hits:0,expected:0,heads:0});
  a.h+=count(hs);a.c+=count(cs);a.hits+=hits;a.expected+=expected;a.heads+=actual.length;
 }
 return {observation,choices};
}
async function buildAyer(d:string):Promise<Frame[]>{
 const current=await draw(d);if(!hasDrawResults(current))return [];
 const week=shiftDay(d,-7);
 const [previous,weekly,raw]=await Promise.all([loadPreviousDraws(d,1,draw),draw(week),base(d)]);
 const last=previous[0];if(!last||last.date>=d)throw Error('Raíz anterior inválida');
 const dates:{date:string;period:'D−1'|'D−7'}[]=[{date:last.date,period:'D−1'}];
 if(hasDrawResults(weekly)&&week!==last.date)dates.push({date:week,period:'D−7'});
 const history=await Promise.all(dates.map(async h=>({...h,aux:await roots(h.date,'anterior')})));
 const frames:Frame[]=[];
 for(const t of TURNOS){
  const heads=JURS.filter(j=>j!=='Montevideo').map(j=>current[t]?.[j]||'');
  if(!heads.every(x=>/^\d{4}$/.test(x)))continue;
  const cut=auxAtCut(raw.heads,t,'anterior');
  const hist=buildAuxIndependent(d,t,cut,history)[3].map(f=>f.family);
  const routes=enumerateAuxPaths(auxiliaryBoard(cut,t),3).map(path=>({source:'aux',path}));
  const fs=pool(routes,hist);
  if(!fs.length||!hist.length)continue;
  frames.push({date:d,turn:t,fs,heads});
 }
 return frames;
}
function selfTest(){
 const routes=plusRoutes([{id:'p',values:['12','34','56','78','90','12']}]);
 const all=pool(routes,[]),hist=all.slice(0,10).map(f=>f.v),fs=pool(routes,hist);
 const r:Frame={date:'2026-11-24',turn:'Previa',fs,heads:['0372','0123','0999','0456','0789']};
 const mem=new Map<string,Observation[]>();
 const days=Array.from({length:30},(_,i)=>({date:shiftDay(r.date,i-30),turn:r.turn,hitDiff:1,positionDiff:-1}));
 mem.set('Previa',days);mem.set('todos',days);
 const a=evaluate(r,mem,false),b=evaluate({...r,heads:['0000','1111','2222','3333','4444']},mem,false);
 for(const [k,v] of Object.entries(a.choices)){
  if(v.top.map(f=>f.v).join('|')!==b.choices[k].top.map(f=>f.v).join('|'))throw Error('Fuga de objetivo');
  if(v.top.length!==hist.length)throw Error('Cobertura diferente');
 }
 if(a.choices.elige_turno_hits_5.weight!==1||a.choices.elige_turno_pos_5.weight!==0)throw Error('Selector incorrecto');
 mem.set('todos',[...days,{...days[0],date:r.date}]);let rejected=false;
 try{evaluate(r,mem,false)}catch(e){rejected=String(e).includes('Fuga temporal');}
 if(!rejected)throw Error('No rechazó memoria de hoy');
 console.log('AYER_ADAPT_SELF_TEST_OK');
}
async function main(){
 selfTest();let warm=0,days=0;const skips:{date:string;error:string}[]=[];
 for(let d=shiftDay(FROM,-50);d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  let frames:Frame[];
  try{frames=await buildAyer(d)}catch(e){if(/Ruta física inválida|Histórica sin ruta física|Raíz anterior inválida/.test(String(e)))throw e;skips.push({date:d,error:String(e)});continue;}
  if(!frames.length)continue;
  if(d<FROM)warm++;else days++;
  const obs=frames.map(r=>evaluate(r,memory,d>=FROM).observation);
  // No turn today contributes to any other prediction today.
  for(const o of obs){for(const k of [o.turn,'todos']){const a=memory.get(k)||[];a.push(o);const dates=[...new Set(a.map(x=>x.date))].slice(-30);memory.set(k,a.filter(x=>dates.includes(x.date)));}}
 }
 if(!days)throw Error('Sin jornadas evaluadas');
 console.log('AYER_ADAPT_JSON',JSON.stringify({from:FROM,to:TO,warm,days,skips,metrics:Object.fromEntries(Object.entries(metrics).filter(([k])=>!k.includes('|')))}));
 for(const t of TURNOS)console.log('AYER_ADAPT_TURN',JSON.stringify({turn:t,metrics:Object.fromEntries(Object.entries(metrics).filter(([k])=>k.startsWith(t+'|')))}));
 for(const d of [...new Set(Object.keys(daily).map(k=>k.split('|')[0]))])console.log('AYER_ADAPT_DAY',JSON.stringify({date:d,metrics:Object.fromEntries(Object.entries(daily).filter(([k])=>k.startsWith(d+'|')).map(([k,v])=>[k.split('|')[1],v]))}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
