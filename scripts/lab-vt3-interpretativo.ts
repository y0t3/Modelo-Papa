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

/** Every candidate must have a real PRE path. Historical event contributes
 * once, via its maximum similarity across available paths. No future target
 * digits in ranking. Geometric evidence does not imply probability. */
type Route={source:string;path:Cell[]};
type Shape={a:string;b:string;span:string;location:number;source:string};
type Event={id:string;period:'D−1'|'D−7';turn:Turno;shapes:Shape[]};
const vec=(r:number,c:number)=>r+','+c;
function shape(route:Route):Shape[]{
 const p=route.path;
 const out:Shape[]=[];
 for(const q of [p,[...p].reverse()]){
  const [x,y,z]=q,dr=y.row-x.row,dc=y.col-x.col,er=z.row-y.row,ec=z.col-y.col;
  out.push({a:vec(dr,dc),b:vec(er,ec),span:vec(Math.abs(z.row-x.row),Math.abs(z.col-x.col)),location:y.row,source:route.source==='aux'?[...new Set(q.map(c=>c.source||'aux'))].sort().join('+'):route.source});
 }
 return out;
}
const reflect=(v:string,axis:number)=>{const [a,b]=v.split(',').map(Number);return vec(axis&1?-a:a,axis&2?-b:b);};
function similarity(x:Shape,y:Shape){
 if(x.a===y.a&&x.b===y.b)return 1;
 for(const axis of [1,2,3])if(x.a===reflect(y.a,axis)&&x.b===reflect(y.b,axis))return .85;
 // Keep a full directed edge, but allow the other cell to move.
 if(x.a===y.a||x.b===y.b)return .55;
 for(const axis of [1,2,3])if(x.a===reflect(y.a,axis)||x.b===reflect(y.b,axis))return .40;
 return x.span===y.span?.2:0;
}
function uniqueShapes(routes:Route[]){
 const map=new Map<string,Shape>();
 for(const r of routes)for(const s of shape(r))map.set(JSON.stringify(s),s);
 return [...map.values()];
}
function plusEvents(hist:LaloHistorical[]):Event[]{
 const out:Event[]=[];
 for(const h of hist)for(const t of TURNOS)for(const m of h.sheet.matches[t]||[]){
  if(m.jurisdiccion==='Montevideo'||!/^\d{4}$/.test(m.cabeza))continue;
  const routes:Route[]=[];
  for(const hit of m.hits.filter(x=>x.kind==='vt3'&&m.cabeza.endsWith(x.value))){
   const col=h.sheet.columns.slice(0,TURNOS.indexOf(t)+1).find(c=>c.id===hit.sourceId);
   if(!col)continue;
   for(const p of hit.paths)if(p.length===3&&p.map(c=>c.digit).join('')===hit.value&&p.every(c=>col.values[c.row]?.[c.col]===c.digit))routes.push({source:hit.sourceId,path:p});
  }
  if(routes.length)out.push({id:[h.date,t,m.jurisdiccion,m.cabeza].join('|'),period:h.period,turn:t,shapes:uniqueShapes(routes)});
 }
 return out;
}
function auxEvents(history:AuxiliaryHistorical[]):Event[]{
 const out:Event[]=[];
 for(const h of history)for(const e of h.aux.events[3]){
  if(e.jur==='Montevideo')continue;
  const routes=e.paths.filter(p=>p.length===3&&p.map(c=>c.digit).join('')===e.head.slice(-3)).map(path=>({source:'aux',path}));
  if(routes.length)out.push({id:e.id,period:h.period,turn:e.turn,shapes:uniqueShapes(routes)});
 }
 return out;
}
type Evidence={rigid:number;flex:number;context:number;recent:number;weekly:number;rarity:number};
function evidence(fs:Family[],routes:Route[],events:Event[],t:Turno){
 const profiles=new Map<string,Map<string,Shape>>();
 for(const r of routes){
  const f=label(r.path.map(c=>c.digit).join('')),p=profiles.get(f)||new Map<string,Shape>();
  for(const s of shape(r))p.set(JSON.stringify(s),s);
  profiles.set(f,p);
 }
 const result=new Map(fs.map(f=>[f.v,{rigid:0,flex:0,context:0,recent:0,weekly:0,rarity:0} as Evidence]));
 const seen=new Set<string>();
 for(const e of events){
  if(seen.has(e.id))continue;seen.add(e.id);
  const per:{f:string;rigid:number;flex:number;context:number}[]=[];
  for(const f of fs){
   let rigid=0,flex=0,context=0;
   for(const x of profiles.get(f.v)?.values()||[])for(const y of e.shapes){
    const s=similarity(x,y);
    // Exact old source and directed steps: rigid reference.
    rigid=Math.max(rigid,Number(s===1&&x.source===y.source));
    flex=Math.max(flex,s);
    // Source/position/turn are soft preferences, never gates.
    const src=x.source===y.source?1:.70;
    const loc=1/(1+.12*Math.abs(x.location-y.location));
    const turn=1/(1+.15*Math.abs(TURNOS.indexOf(t)-TURNOS.indexOf(e.turn)));
    context=Math.max(context,s*(.5+.25*src+.25*loc)*turn);
   }
   per.push({f:f.v,rigid,flex,context});
  }
  // Discount patterns that match almost every family. A broadly compatible
  // historical event is weak evidence, even if many routes fit it.
  const total=per.reduce((n,p)=>n+p.flex,0),mean=total/Math.max(1,per.length);
  for(const p of per){
   const a=result.get(p.f)!;a.rigid+=p.rigid;a.flex+=p.flex;a.context+=p.context;
   if(e.period==='D−1')a.recent+=p.context;else a.weekly+=p.context;
   a.rarity+=p.flex*(1-mean);
  }
 }
 return result;
}
const methods=['actual','bloques','compactos','control','rigido','flexible','contexto','flex_D1','flex_D7','flex_raro','mixto_fisico'];
type Result=Metric&{formed:number;position:number;admitted:number;onlyActual:number;onlyMethod:number;onlyCompact:number;onlyMethodCompact:number};
const measures:Record<string,Result>={},days:Record<string,Record<string,number>>={};
function select(fs:Family[],routes:Route[],events:Event[],d:string,t:Turno){
 const hist=ranked(fs.filter(f=>f.admitted),'actual',d,t),baseline=hist.slice(0,10);
 const ev=evidence(fs,routes,events,t);
 const orderBy=(fn:(f:Family)=>number)=>[...fs].sort((a,b)=>fn(b)-fn(a)||hash(d+'|'+t+'|'+a.v)-hash(d+'|'+t+'|'+b.v)||a.v.localeCompare(b.v));
 const geometry=ranked(fs,'compactos',d,t);
 const contextual=orderBy(f=>ev.get(f.v)!.context);
 const cr=new Map(contextual.map((f,i)=>[f.v,i+1])),gr=new Map(geometry.map((f,i)=>[f.v,i+1]));
 const orders:Record<string,Family[]>={actual:hist,bloques:ranked(fs,'bloques',d,t),compactos:geometry,control:ranked(fs,'control',d,t),
 rigido:orderBy(f=>ev.get(f.v)!.rigid),flexible:orderBy(f=>ev.get(f.v)!.flex),contexto:contextual,
 flex_D1:orderBy(f=>ev.get(f.v)!.recent),flex_D7:orderBy(f=>ev.get(f.v)!.weekly),
 flex_raro:orderBy(f=>ev.get(f.v)!.rarity),mixto_fisico:orderBy(f=>1/(10+cr.get(f.v)!)+1/(10+gr.get(f.v)!))};
 const quotas=new Map<number,number>();
 for(const f of baseline)quotas.set(f.values.length,(quotas.get(f.values.length)||0)+1);
 const out:Record<string,{top:Family[];full:Family[]}>= {};
 for(const name of methods){
  const rem=new Map(quotas),top:Family[]=[],rest:Family[]=[];
  for(const f of orders[name]){
   const q=rem.get(f.values.length)||0;
   if(q){top.push(f);rem.set(f.values.length,q-1);}else rest.push(f);
  }
  if(top.length!==baseline.length||top.reduce((n,f)=>n+f.values.length,0)!==baseline.reduce((n,f)=>n+f.values.length,0))throw Error('Cobertura diferente');
  out[name]={top,full:[...top,...rest]};
 }
 return out;
}
const exact=(f:Family[])=>new Set(f.flatMap(x=>x.values));
function audit(engine:string,t:Turno,d:string,fs:Family[],routes:Route[],events:Event[],heads:string[]){
 if(!fs.length)return;
 const picks=select(fs,routes,events,d,t);
 const h=heads.map(x=>x.slice(-3)),all=exact(fs),formed=h.filter(x=>all.has(x)).length;
 const a=exact(picks.actual.top),c=exact(picks.compactos.top);
 for(const [name,p] of Object.entries(picks)){
  const set=exact(p.top),hits=h.filter(v=>set.has(v)).length;
  const ranks=new Map<string,number>();let before=0;
  for(const f of p.full){for(const v of f.values)ranks.set(v,1-(before+f.values.length/2)/all.size);before+=f.values.length;}
  const tail=(all.size-before)/2/all.size;
  const position=h.reduce((n,v)=>n+(all.has(v)?ranks.get(v)??tail:0),0);
  for(const key of [engine+'|'+name,engine+'|'+t+'|'+name]){
   const m=measures[key]||(measures[key]={...empty(),formed:0,position:0,admitted:0,onlyActual:0,onlyMethod:0,onlyCompact:0,onlyMethodCompact:0});
   m.cuts++;m.heads+=h.length;m.hits+=hits;m.expected+=h.length*set.size/1000;m.conditional+=formed*set.size/all.size;m.size+=set.size;m.any+=Number(hits>0);m.formed+=formed;m.position+=position;
   m.admitted+=p.top.filter(f=>f.admitted).length;
   m.onlyActual+=h.filter(v=>a.has(v)&&!set.has(v)).length;m.onlyMethod+=h.filter(v=>set.has(v)&&!a.has(v)).length;
   m.onlyCompact+=h.filter(v=>c.has(v)&&!set.has(v)).length;m.onlyMethodCompact+=h.filter(v=>set.has(v)&&!c.has(v)).length;
  }
  const daily=days[d]||(days[d]={}),key=engine+'|'+name;daily[key]=(daily[key]||0)+hits;
 }
}
async function build(d:string):Promise<number>{
 const current=await draw(d);if(!hasDrawResults(current))return 0;
 const week=shiftDay(d,-7);
 const [previous,weekly,beforeWeek,noct]=await Promise.all([loadPreviousDraws(d,2,draw),draw(week),loadPreviousDraws(week,1,draw),nocturnaAnteriorPorJur(d,draw)]);
 const last=previous[1],before=previous[0];
 const hist:LaloHistorical[]=[{date:last.date,period:'D−1',sheet:buildSheet(last.heads,before.heads)}];
 if(hasDrawResults(weekly))hist.push({date:week,period:'D−7',sheet:buildSheet(weekly,beforeWeek[0].heads)});
 const sheet=buildSheet(current,noct.heads);
 const pastEvents=plusEvents(hist);
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
  audit('lalo',t,d,pool(pr,view.ranks.vt3.map(f=>f.family)),pr,pastEvents,heads);
  for(const input of auxInputs){
   if(!input)continue;
   const engine=input.mode==='anterior'?'ayer':'hoy',cut=auxAtCut(input.raw,t,input.mode);
   const ranks=buildAuxIndependent(d,t,cut,input.history);
   const routes=enumerateAuxPaths(auxiliaryBoard(cut,t),3).map(path=>({source:'aux',path}));
   audit(engine,t,d,pool(routes,ranks[3].map(f=>f.family)),routes,auxEvents(input.history),heads);
  }
 }
 return completeCuts;
}

function selfTest(){
 const routes=plusRoutes([{id:'p',values:['12','34','56','78','90','12']}]);
 const fs0=pool(routes,[]),hist=fs0.slice(0,10).map(f=>f.v),fs=pool(routes,hist);
 const old=routes[0],sh=shape(old);
 if(similarity(sh[0],sh[0])!==1)throw Error('Prueba semejanza exacta');
 const e:Event={id:'old',period:'D−1',turn:'Previa',shapes:sh};
 const a=evidence(fs,routes,[e],'Previa'),b=evidence(fs,routes,[e,e],'Previa');
 for(const [k,v] of a)if(JSON.stringify(v)!==JSON.stringify(b.get(k)))throw Error('Raíz duplicada');
 const p=select(fs,routes,[e],'2026-11-25','Previa');
 if(p.actual.top.map(f=>f.v).join('|')!==hist.join('|'))throw Error('Referencia alterada');
 for(const x of Object.values(p))if(exact(x.top).size!==exact(p.actual.top).size)throw Error('Cobertura diferente');
 console.log('INTERPRET_SELF_TEST_OK');
}
async function main(){
 selfTest();let count=0;const skips:{date:string;error:string}[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  try{if(await build(d))count++;}catch(e){
   if(/Ruta física inválida|Histórica sin ruta física|Cobertura diferente/.test(String(e)))throw e;
   skips.push({date:d,error:String(e)});
  }
 }
 if(!count)throw Error('Sin jornadas');
 console.log('INTERPRET_JSON',JSON.stringify({from:FROM,to:TO,days:count,skips,metrics:Object.fromEntries(Object.entries(measures).filter(([k])=>k.split('|').length===2))}));
 for(const engine of ['lalo','ayer','hoy'])console.log('INTERPRET_TURNS',JSON.stringify({engine,metrics:Object.fromEntries(Object.entries(measures).filter(([k])=>k.startsWith(engine+'|')&&k.split('|').length===3))}));
 for(const [date,metrics] of Object.entries(days))console.log('INTERPRET_DAY',JSON.stringify({date,metrics}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
