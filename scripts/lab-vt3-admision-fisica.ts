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
const methods=['actual','bloques','fuentes','compactos','rectos','lecturas','historico_mas_fisico','solo_descartadas','mixto','control'];
function tops(fs:Family[],d:string,t:Turno){
 const hist=ranked(fs.filter(f=>f.admitted),'actual',d,t).slice(0,10);
 const quotas=new Map<number,number>();
 for(const f of hist)quotas.set(f.values.length,(quotas.get(f.values.length)||0)+1);
 const out:Record<string,Family[]>={};
 for(const rule of methods){
  const ranking=rule==='actual'?hist:rule==='mixto'?
   [...hist.slice(0,5),...ranked(fs.filter(f=>!f.admitted),'bloques',d,t),...ranked(fs,'bloques',d,t)]:ranked(fs,rule,d,t);
  const remaining=new Map(quotas),seen=new Set<string>(),selected:Family[]=[];
  for(const f of ranking){
   const q=remaining.get(f.values.length)||0;
   if(q&&!seen.has(f.v)){seen.add(f.v);selected.push(f);remaining.set(f.values.length,q-1);}
   if(selected.length===hist.length)break;
  }
  if(selected.length!==hist.length||selected.reduce((n,f)=>n+f.values.length,0)!==hist.reduce((n,f)=>n+f.values.length,0))throw Error('Cobertura diferente');
  out[rule]=selected;
 }
 return out;
}
// Primary comparisons frozen on discovery data. Other criteria are descriptive.
const primary:Record<string,string>={lalo:'bloques',ayer:'compactos',hoy:'historico_mas_fisico'};
type Paired={cuts:number;heads:number;both:number;onlyActual:number;onlyVariant:number;neither:number;exclusive:number;expected:number;controlHits:number;variantHits:number;actualHits:number};
const paired:Record<string,Paired>={},daily:Record<string,Paired>={};
const emptyPair=():Paired=>({cuts:0,heads:0,both:0,onlyActual:0,onlyVariant:0,neither:0,exclusive:0,expected:0,controlHits:0,variantHits:0,actualHits:0});
function pairAudit(engine:string,t:Turno,d:string,top:Record<string,Family[]>,actual:string[]){
 const a=new Set(top.actual.flatMap(f=>f.values)),b=new Set(top[primary[engine]].flatMap(f=>f.values)),control=new Set(top.control.flatMap(f=>f.values));
 if(a.size!==b.size||a.size!==control.size)throw Error('Cobertura diferente');
 const exclusive=[...b].filter(v=>!a.has(v)).length;
 const keys=[[paired,engine],[paired,engine+'|'+t],[daily,d+'|'+engine]] as const;
 for(const [store,key] of keys){
  const p=store[key]||(store[key]=emptyPair());p.cuts++;p.heads+=actual.length;p.exclusive+=exclusive;p.expected+=actual.length*a.size/1000;
  for(const x of actual){
   const aa=a.has(x),bb=b.has(x);
   p.actualHits+=Number(aa);p.variantHits+=Number(bb);p.controlHits+=Number(control.has(x));
   if(aa&&bb)p.both++;else if(aa)p.onlyActual++;else if(bb)p.onlyVariant++;else p.neither++;
  }
 }
}
function audit(engine:string,t:Turno,d:string,fs:Family[],heads:string[]){
 if(!fs.length)return;
 const actual=heads.map(h=>h.slice(-3)),all=new Set(fs.flatMap(f=>f.values)),formed=actual.filter(h=>all.has(h)).length;
 const add=(name:string,group:Family[])=>{
  const vals=new Set(group.flatMap(f=>f.values)),hits=actual.filter(h=>vals.has(h)).length;
  for(const [store,key] of [[stats,engine+'|'+name],[byTurn,engine+'|'+t+'|'+name]] as const){
   const a=store[key]||(store[key]=empty());
   a.cuts++;a.heads+=heads.length;a.hits+=hits;a.expected+=heads.length*vals.size/1000;a.conditional+=formed*vals.size/all.size;a.size+=vals.size;a.any+=Number(hits>0);
  }
 };
 add('universo',fs);add('admitidas',fs.filter(f=>f.admitted));add('descartadas',fs.filter(f=>!f.admitted));
 const top=tops(fs,d,t);
 pairAudit(engine,t,d,top,actual);
 for(const [rule,group] of Object.entries(top))add('top_'+rule,group);
 for(const f of fs){
  const v=f.values[0],mult=new Set(v).size,blocks=f.blocks.size===1?'1':f.blocks.size===2?'2':'3+';
  const key=[engine,t,mult,blocks,f.sources.size===1?'una':'varias',f.admitted?'admitida':'descartada'].join('|');
  const a=strata[key]||(strata[key]={hits:0,expected:0,size:0});
  a.hits+=actual.filter(h=>f.values.includes(h)).length;a.expected+=heads.length*f.values.length/1000;a.size+=f.values.length;
 }
 for(const [name,test] of Object.entries({
  bloque1:(f:Family)=>f.blocks.size===1,
  bloque2:(f:Family)=>f.blocks.size===2,
  bloque3mas:(f:Family)=>f.blocks.size>=3,
  variasFuentes:(f:Family)=>f.sources.size>=2,
  compacto:(f:Family)=>f.compact.size>0,
  recto:(f:Family)=>f.straight.size>0,
  variasLecturas:(f:Family)=>f.paths.size>f.blocks.size
 })){
  for(const admitted of [true,false])add((admitted?'admitidas_':'descartadas_')+name,fs.filter(f=>f.admitted===admitted&&test(f)));
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
  audit('lalo',t,d,pool(plusRoutes(sheet.columns.slice(0,TURNOS.indexOf(t)+1)),view.ranks.vt3.map(f=>f.family)),heads);
  for(const input of auxInputs){
   if(!input)continue;
   const engine=input.mode==='anterior'?'ayer':'hoy',cut=auxAtCut(input.raw,t,input.mode);
   const ranks=buildAuxIndependent(d,t,cut,input.history);
   const routes=enumerateAuxPaths(auxiliaryBoard(cut,t),3).map(path=>({source:'aux',path}));
   audit(engine,t,d,pool(routes,ranks[3].map(f=>f.family)),heads);
  }
 }
 return completeCuts;
}
function selfTest(){
 const routes=plusRoutes([{id:'p',values:['12','34','56','78','90','12']}]);
 const full=pool(routes,[]),hist=full.slice(0,10).map(f=>f.v),fs=pool(routes,hist);
 if(!fs.length||!fs.some(f=>!f.admitted)||fs.filter(f=>f.admitted).length!==hist.length)throw Error('Prueba admisión');
 const a=tops(fs,'2026-11-24','Previa');
 if(a.actual.map(f=>f.v).join('|')!==hist.join('|'))throw Error('Top histórico alterado');
 for(const group of Object.values(a))if(group.length!==hist.length||new Set(group.map(f=>f.v)).size!==group.length)throw Error('Prueba presupuesto');
 console.log('ADMISSION_SELF_TEST_OK');
}
async function main(){
 selfTest();let days=0;const skips:{date:string;error:string}[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  // Fail loudly on broken invariants. Skip only unavailable source data.
  try{if(await build(d))days++;}catch(e){
   if(/Ruta física inválida|Histórica sin ruta física|Cobertura diferente/.test(String(e)))throw e;
   skips.push({date:d,error:String(e)});
  }
 }
 if(!stats['lalo|universo']?.cuts)throw Error('Sin cortes');
 console.log('ADM_JSON_START');console.log(JSON.stringify({from:FROM,to:TO,days,skips,stats,primary,paired}));console.log('ADM_JSON_END');
 for(const [key,metric] of Object.entries(daily))console.log('ADM_PAIRED_DAY',JSON.stringify({key,metric}));
 for(const engine of ['lalo','ayer','hoy']){
  const subset=<T>(x:Record<string,T>)=>Object.fromEntries(Object.entries(x).filter(([k])=>k.startsWith(engine+'|')));
  console.log('ADM_DETAIL',JSON.stringify({engine,byTurn:subset(byTurn),strata:subset(strata)}));
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
