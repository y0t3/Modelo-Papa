import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import type {AuxiliaryHistorical} from '../src/motorLaloIntegral';
import {auxFamily,auxiliaryBoard,collectAuxFamilies,enumerateAuxPaths} from '../src/auxSantiagoNeuquen';
import {selectAuxFormFirst} from '../src/labAuxFormasPrimeroVT3';
import {formPositions} from '../src/motorFormasPrimero';

const FROM=process.env.VT4_FROM||'2026-11-02';
const TO=process.env.VT4_TO||'2026-11-23';
const headJurs=JURS.filter(j=>j!=='Montevideo');
const valid=(s:string)=>/^\d{4}$/.test(s);
const hash=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const drawCache=new Map<string,Promise<CabezasDia>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
function draw(d:string){
 let promise=drawCache.get(d);
 if(!promise){promise=descargarCabezas(d,true);drawCache.set(d,promise)}
 return promise;
}
function aux(d:string){
 let promise=auxCache.get(d);
 if(!promise){promise=fetchAuxiliaryHeads(d);auxCache.set(d,promise)}
 return promise;
}

type PathCell={row:number;col:number;digit:string};
type Route={sheet:string;source:string;block:string;shape:string};
type Pool=Map<string,Route[]>;
const sheets=['lalo','ayer','hoy'] as const;
const shape=(p:PathCell[])=>p.slice(1).map((c,i)=>(c.row-p[i].row)+','+(c.col-p[i].col)).join(';');
const block=(p:PathCell[])=>p.map(c=>c.row+':'+c.col).sort().join('|');
function put(pool:Pool,sheet:string,source:string,p:PathCell[]){
 const v=p.map(c=>c.digit).join('');
 if(!valid(v)||new Set(p.map(c=>c.row+':'+c.col)).size!==4)throw Error('Invalid VT4 path');
 const a=pool.get(v)||[];a.push({sheet,source,block:block(p),shape:shape(p)});pool.set(v,a);
}
function scan(pool:Pool,sheet:string,source:string,cells:PathCell[]){
 const walk=(p:PathCell[])=>{
  if(p.length===4){put(pool,sheet,source,p);return;}
  const q=p.at(-1)!;
  for(const c of cells)if(!p.includes(c)&&Math.max(Math.abs(c.row-q.row),Math.abs(c.col-q.col))===1)walk([...p,c]);
 };
 for(const c of cells)walk([c]);
}
function addRoot(roots:Map<string,Set<string>>,sheet:string,source:string,p:PathCell[],event:string){
 const k=sheet+'|'+source+'|'+shape(p);const e=roots.get(k)||new Set<string>();e.add(event);roots.set(k,e);
}

function geometryAudit(pool:Pool,heads:string[]){
 const out:Record<string,{pool:number;hit:number;expected:number}>={};
 for(const sheet of sheets){
  const blocks=new Map<string,{paths:number;values:Set<string>}>();
  const exact=new Set<string>();
  const byValue=new Map<string,Set<string>>();
  for(const [v,rs] of pool)for(const r of rs){
   if(r.sheet!==sheet)continue;
   exact.add(v);const id=r.source+'|'+r.block;
   const b=blocks.get(id)||{paths:0,values:new Set<string>()};b.paths++;b.values.add(v);blocks.set(id,b);
   const memberships=byValue.get(v)||new Set<string>();memberships.add(id);byValue.set(v,memberships);
  }
  const categories=new Map<string,Set<string>>();
  const put=(k:string,v:string)=>{const p=categories.get(k)||new Set<string>();p.add(v);categories.set(k,p)};
  // Capacidad geométrica = recorridos dirigidos físicamente posibles, contando
  // cada recorrido una sola vez (aunque repita los mismos dígitos).
  for(const b of blocks.values())for(const v of b.values){
   put('capacidad_'+b.paths,v);
   put('ordenes_distintos_'+(b.values.size<=4?'1-4':b.values.size<=12?'5-12':'13-24'),v);
  }
  for(const [v,ids] of byValue){
   const bs=[...ids].map(id=>blocks.get(id)!);
   const cap=[...new Set(bs.map(b=>b.paths))];
   if(cap.length===1)put('solo_capacidad_'+cap[0],v);
   const min=Math.min(...bs.map(b=>b.values.size));
   put('min_ordenes_'+(min<=4?'1-4':min<=12?'5-12':'13-24'),v);
   put('bloques_'+(ids.size===1?'1':ids.size===2?'2':'3+'),v);
  }
  const family=new Set([...exact].map(v=>[...v].sort().join('')));
  const permutations=new Set<string>();
  const perm=(a:string[],p:string)=>{if(!a.length){permutations.add(p);return;}for(let i=0;i<a.length;i++){if(i&&a[i]===a[i-1])continue;perm(a.filter((_,k)=>k!==i),p+a[i]);}};
  for(const f of family)perm([...f],'');
  categories.set('exacto',exact);
  categories.set('familia_sin_orden',permutations);
  categories.set('familia_sin_camino_exacto',new Set([...permutations].filter(v=>!exact.has(v))));
  for(const [k,values] of categories)out[sheet+'|'+k]={pool:values.size,hit:heads.filter(h=>values.has(h)).length,expected:heads.length*values.size/10000};
 }
 return out;
}
function aggregateGeometry(rows:any[]){
 const out:Record<string,{poolSum:number;hit:number;expected:number;cuts:number;heads:number}>={};
 for(const r of rows)for(const [k,v] of Object.entries(r.geometry) as [string,{pool:number;hit:number;expected:number}][]){
  const a=out[k]||{poolSum:0,hit:0,expected:0,cuts:0,heads:0};
  a.poolSum+=v.pool;a.hit+=v.hit;a.expected+=v.expected;a.cuts++;a.heads+=r.heads.length;out[k]=a;
 }
 return out;
}



/** Distribution of hit count from a uniform sample of k distinct exact values,
 * conditional on the known pool and the observed heads. Repeated heads retain
 * their multiplicity. The analytical control does not use a chosen hash seed. */
function conditionalDistribution(pool:Set<string>,heads:string[],k:number):number[]{
 const n=pool.size; k=Math.min(k,n);
 if(!n||!k)return [1];
 const counts=new Map<string,number>();
 for(const h of heads)if(pool.has(h))counts.set(h,(counts.get(h)||0)+1);
 const weights=[...counts.values()],out=Array(heads.length+1).fill(0);
 function visit(i:number,chosen:number,hits:number,prob:number){
  if(i===weights.length){out[hits]+=prob;return;}
  const p=(k-chosen)/(n-i);
  if(p>0)visit(i+1,chosen+1,hits+weights[i],prob*p);
  if(p<1)visit(i+1,chosen,hits,prob*(1-p));
 }
 visit(0,0,0,1);return out;
}
function conditionalAudit(rows:any[]){
 const results:Record<string,any>={};
 for(const sheet of sheets)for(const name of ['solo_dos','control']){
  const key=sheet+'|'+name;
  let dist=[1],observed=0,expected=0,cuts=0,heads=0;
  for(const row of rows){
   const m=row.pairs.comparisons[key],d=row.pairs.nulls[key];
   if(!d)continue;
   observed+=m.hits[2];cuts++;heads+=row.heads.length;
   expected+=d.reduce((a:number,p:number,i:number)=>a+p*i,0);
   const next=Array(dist.length+d.length-1).fill(0);
   for(let i=0;i<dist.length;i++)for(let j=0;j<d.length;j++)next[i+j]+=dist[i]*d[j];
   dist=next;
  }
  results[key]={observed,expected,cuts,heads,tail:dist.slice(observed).reduce((a,b)=>a+b,0)};
 }
 return results;
}

function auditPairStructure(pool:Pool,heads:string[],date:string,turn:string){
 const out:Record<string,{pool:number;hit:number;expected:number}>={};
 const comparisons:Record<string,Metric>={};
 const nulls:Record<string,number[]>={};
 for(const sheet of sheets){
  const categories=new Map<string,Set<string>>();
  const values=new Map<string,{source:string;block:string;shape:string}[]>();
  const add=(category:string,v:string)=>{const set=categories.get(category)||new Set<string>();set.add(v);categories.set(category,set)};
  for(const [v,routes] of pool){
   const own=routes.filter(r=>r.sheet===sheet);
   if(own.length)values.set(v,own);
  }
  for(const [v,routes] of values){
   const distinct=new Map<string,{source:string;block:string;shapes:Set<string>}>();
   for(const route of routes){
    const key=route.source+'|'+route.block;
    const b=distinct.get(key)||{source:route.source,block:route.block,shapes:new Set<string>()};
    b.shapes.add(route.shape);distinct.set(key,b);
   }
   add('todos',v);
   if(distinct.size!==2)continue;
   add('dos',v);
   const [a,b]=[...distinct.values()];
   const sameSource=a.source===b.source;
   const shared=sameSource?a.block.split('|').filter(c=>b.block.split('|').includes(c)).length:0;
   const sameShape=[...a.shapes].some(x=>b.shapes.has(x));
   const relation=sameSource?'misma_fuente_'+shared:'distinta_fuente';
   add(relation,v);
   add(relation+(sameShape?'_misma_forma':'_otra_forma'),v);
   add(sameShape?'dos_misma_forma':'dos_otra_forma',v);
   const sources=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
   if(!sameSource){
    const gap=Math.abs(sources.indexOf(a.source)-sources.indexOf(b.source));
    add(gap===1?'fuentes_vecinas':'fuentes_no_vecinas',v);
   }
  }
  for(const [k,vs] of categories)out[sheet+'|'+k]={pool:vs.size,hit:heads.filter(h=>vs.has(h)).length,expected:heads.length*vs.size/10000};
  // Fixed ten-number budget, hash tie-break identical to current app.
  const all=[...values.keys()];
  const count=(v:string)=>new Set(values.get(v)!.map(r=>r.source+'|'+r.block)).size;
  const hashOrder=(a:string,b:string)=>hash(date+'|'+turn+'|'+a)-hash(date+'|'+turn+'|'+b)||a.localeCompare(b);
  const ranks={
   actual:[...all].sort((a,b)=>count(b)-count(a)||hashOrder(a,b)),
   solo_dos:[...all].filter(v=>count(v)===2).sort(hashOrder),
   control:[...all].sort(hashOrder)
  };
  for(const [name,list] of Object.entries(ranks)){
   const m=metric();score(m,list,new Set(all),heads,date,turn);comparisons[sheet+'|'+name]=m;
   if(name==='solo_dos'||name==='control')nulls[sheet+'|'+name]=conditionalDistribution(new Set(list),heads,10);
  }
 }
 return {categories:out,comparisons,nulls};
}
function aggregatePairs(rows:any[]){
 const geometry=aggregateGeometry(rows.map(r=>({...r,geometry:r.pairs.categories})));
 const ranks:Record<string,{hits:number[];expected:number[];conditional:number[]}>={};
 for(const r of rows)for(const [k,m] of Object.entries(r.pairs.comparisons) as [string,Metric][]){
  const a=ranks[k]||{hits:[0,0,0],expected:[0,0,0],conditional:[0,0,0]};
  for(let i=0;i<3;i++){a.hits[i]+=m.hits[i];a.expected[i]+=m.expected[i];a.conditional[i]+=m.conditional[i]}
  ranks[k]=a;
 }
 return {geometry,ranks};
}

const methods=['actual_lalo','actual_ayer','actual_hoy','bloques_lalo','bloques_ayer','bloques_hoy','fisico_union','consenso','historia_D1D7','nacimiento','control_union'] as const;
type Metric={n:number;heads:number;hits:number[];expected:number[];conditional:number[];examples:{date:string;turn:string;head:string;rank:number}[]};
const metric=():Metric=>({n:0,heads:0,hits:[0,0,0],expected:[0,0,0],conditional:[0,0,0],examples:[]});
function score(m:Metric,list:string[],pool:Set<string>,heads:string[],date:string,turn:string){
 m.n++;m.heads+=heads.length;
 [3,5,10].forEach((k,i)=>{const top=list.slice(0,k);m.hits[i]+=heads.filter(h=>top.includes(h)).length;m.expected[i]+=top.length*heads.length/10000;
 m.conditional[i]+=pool.size?heads.filter(h=>pool.has(h)).length*top.length/pool.size:0;});
 for(const h of heads){const rank=list.indexOf(h)+1;if(rank>0&&rank<=10)m.examples.push({date,turn,head:h,rank});}
}
const uniq=(x:string[])=>[...new Set(x)];
function exact(groups:string[][],date:string,turn:string){
 return uniq(groups.flatMap(g=>uniq(g).sort((a,b)=>hash(date+'|'+turn+'|'+a)-hash(date+'|'+turn+'|'+b)||a.localeCompare(b))));
}
async function one(date:string){
 const weekDate=shiftDay(date,-7);
 const [current,previous,weekly,noctBase]=await Promise.all([
  draw(date),loadPreviousDraws(date,6,draw),draw(weekDate),
  nocturnaAnteriorPorJur(date,draw)
 ]);
 const hist:LaloHistorical[]=[];
 const latest=previous.at(-1)!,before=previous.at(-2)!;
 hist.push({date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,before.heads)});
 if(weekDate<date&&hasDrawResults(weekly)){
  const beforeWeek=await loadPreviousDraws(weekDate,1,draw);
  hist.push({date:weekDate,period:'D−7',sheet:buildSheet(weekly,beforeWeek[0].heads)});
 }
 const historicalRefs=hist.map(ref=>({
  date:ref.date,period:ref.period,
  heads:ref.date===latest.date?latest.heads:weekly
 }));
 const auxDays=new Set<string>([date,auxiliarySourceDate(date)]);
 for(const p of previous){
  auxDays.add(p.date);auxDays.add(auxiliarySourceDate(p.date));
 }
 for(const ref of historicalRefs){
  auxDays.add(ref.date);auxDays.add(auxiliarySourceDate(ref.date));
 }
 const observations=new Map(await Promise.all([...auxDays].map(async d=>
  [d,(await aux(d)).heads] as const)));
 const auxHist={} as Record<AuxMode,AuxiliaryHistorical[]>;
 const sixHist={} as Record<AuxMode,AuxiliaryHistorical[]>;
 for(const mode of ['anterior','intrajornada'] as const){
  const refDate=(day:string)=>mode==='anterior'?auxiliarySourceDate(day):day;
  auxHist[mode]=historicalRefs.map(ref=>({
   date:ref.date,period:ref.period,
   aux:extractAuxHistoryMode(ref.date,observations.get(refDate(ref.date))!,
    ref.heads,mode)
  }));
  sixHist[mode]=previous.map(p=>({
   date:p.date,period:'D−1' as const,
   aux:extractAuxHistoryMode(p.date,observations.get(refDate(p.date))!,
    p.heads,mode)
  }));
 }
 const whole=buildSheet(current,noctBase.heads);

 const roots=new Map<string,Set<string>>();
 for(const h of hist)for(const t of TURNOS)for(const match of h.sheet.matches[t]||[]){
  if(!headJurs.includes(match.jurisdiccion as typeof headJurs[number]))continue;
  const event=[h.date,t,match.jurisdiccion,match.cabeza].join('|');
  for(const hit of match.hits)if(hit.kind==='vt4')for(const p of hit.paths)addRoot(roots,'lalo',hit.sourceId,p,event);
 }
 for(const mode of ['anterior','intrajornada'] as const)for(const h of auxHist[mode])for(const event of h.aux.events[4]){
  if(!headJurs.includes(event.jur as typeof headJurs[number]))continue;
  for(const p of event.paths)addRoot(roots,mode==='anterior'?'ayer':'hoy','aux',p,[event.date,event.turn,event.jur,event.head].join('|'));
 }
 let prev=new Set<string>(); const rows:any[]=[];
 for(const turn of TURNOS){
  const t=TURNOS.indexOf(turn);const pre=preSheetAtCut(whole,turn,t);
  const pool:Pool=new Map();
  for(const col of pre.columns.slice(0,t+1)){
   const cells:PathCell[]=[];col.values.forEach((v,row)=>{if(/^\d{2}$/.test(v))for(let c=0;c<2;c++)cells.push({row,col:c,digit:v[c]});});
   scan(pool,'lalo',col.id,cells);
  }
  const a=auxAtCut(observations.get(auxiliarySourceDate(date))!,turn,'anterior');
  const b=auxAtCut(observations.get(date)!,turn,'intrajornada');
  for(const [name,board] of [['ayer',auxiliaryBoard(a,turn)],['hoy',auxiliaryBoard(b,turn)]] as const)
   for(const p of enumerateAuxPaths(board,4))put(pool,name,'aux',p);
  const subsets=Object.fromEntries(sheets.map(s=>[s,new Set([...pool].filter(([v,ps])=>ps.some(p=>p.sheet===s)).map(([v])=>v))])) as Record<typeof sheets[number],Set<string>>;
  const set=new Set(pool.keys());const features=new Map<string,{blocks:number;sheetCount:number;rootCount:number;fresh:number;perSheet:Record<string,number>}>();
  for(const [v,ps] of pool){
   const events=new Set<string>();for(const p of ps)for(const e of roots.get(p.sheet+'|'+p.source+'|'+p.shape)||[])events.add(e);
   const count=(s?:string)=>new Set(ps.filter(p=>!s||p.sheet===s).map(p=>p.sheet+'|'+p.source+'|'+p.block)).size;
   features.set(v,{blocks:count(),sheetCount:new Set(ps.map(p=>p.sheet)).size,rootCount:events.size,fresh:Number(!prev.has(v)),perSheet:Object.fromEntries(sheets.map(s=>[s,count(s)]))});
  }
  const rank=(p:Set<string>,f:(v:string)=>number[])=>[...p].sort((a,b)=>{
   const x=f(a),y=f(b);for(let i=0;i<x.length;i++){const d=y[i]-x[i];if(d)return d;}
   return hash(date+'|'+turn+'|'+a)-hash(date+'|'+turn+'|'+b)||a.localeCompare(b);
  });
  const f=(v:string)=>features.get(v)!;
  const l=buildMotorLalo(pre,date,turn,hist).ranks.vt4.map(x=>x.paths.map(p=>p.value));
  const ar=buildAuxIndependent(date,turn,a,auxHist.anterior)[4].map(x=>x.values);
  const br=buildAuxIndependent(date,turn,b,auxHist.intrajornada)[4].map(x=>x.values);
  const candidates:Record<typeof methods[number],{list:string[];pool:Set<string>}>={
   actual_lalo:{list:exact(l,date,turn).filter(v=>subsets.lalo.has(v)),pool:subsets.lalo},
   actual_ayer:{list:exact(ar,date,turn).filter(v=>subsets.ayer.has(v)),pool:subsets.ayer},
   actual_hoy:{list:exact(br,date,turn).filter(v=>subsets.hoy.has(v)),pool:subsets.hoy},
   bloques_lalo:{list:rank(subsets.lalo,v=>[f(v).perSheet.lalo]),pool:subsets.lalo},
   bloques_ayer:{list:rank(subsets.ayer,v=>[f(v).perSheet.ayer]),pool:subsets.ayer},
   bloques_hoy:{list:rank(subsets.hoy,v=>[f(v).perSheet.hoy]),pool:subsets.hoy},
   fisico_union:{list:rank(set,v=>[f(v).blocks]),pool:set},
   consenso:{list:rank(set,v=>[f(v).sheetCount,f(v).blocks]),pool:set},
   historia_D1D7:{list:rank(set,v=>[f(v).rootCount,f(v).sheetCount,f(v).blocks]),pool:set},
   nacimiento:{list:rank(set,v=>[f(v).fresh,f(v).blocks]),pool:set},
   control_union:{list:rank(set,v=>[]),pool:set}
  };
  // Only after all PRE lists are built consult objective heads.
  const heads=headJurs.map(j=>current[turn]?.[j]||'').filter(valid);
  const coverage=Object.fromEntries([...sheets,'union'].map(s=>{const p=s==='union'?set:subsets[s as typeof sheets[number]];return [s,{pool:p.size,hit:heads.filter(h=>p.has(h)).length,expected:p.size*heads.length/10000}]}));
  const buckets=[1,2,3].map(k=>({k,pool:[...set].filter(v=>f(v).sheetCount===k).length,hit:heads.filter(h=>features.get(h)?.sheetCount===k).length}));
  rows.push({date,turn,heads,coverage,buckets,geometry:geometryAudit(pool,heads),pairs:auditPairStructure(pool,heads,date,turn),methods:Object.fromEntries(methods.map(m=>{const x=candidates[m],s=metric();score(s,x.list,x.pool,heads,date,turn);return [m,{...s,top:x.list.slice(0,10),budget:Math.min(x.list.length,10)}]}))});
  prev=set;
 }
 return rows;
}
function summarize(rows:any[]){
 const r=Object.fromEntries(methods.map(m=>[m,{cuts:rows.length,heads:rows.reduce((n,x)=>n+x.heads.length,0),hits:[0,1,2].map(i=>rows.reduce((n,x)=>n+x.methods[m].hits[i],0)),expected:[0,1,2].map(i=>rows.reduce((n,x)=>n+x.methods[m].expected[i],0)),conditional:[0,1,2].map(i=>rows.reduce((n,x)=>n+x.methods[m].conditional[i],0)),budget10:rows.reduce((n,x)=>n+x.methods[m].budget,0),examples:rows.flatMap(x=>x.methods[m].examples)}]));
 const coverage=Object.fromEntries([...sheets,'union'].map(s=>[s,{hits:rows.reduce((n,x)=>n+x.coverage[s].hit,0),expected:rows.reduce((n,x)=>n+x.coverage[s].expected,0),avgPool:rows.length?rows.reduce((n,x)=>n+x.coverage[s].pool,0)/rows.length:0}]));
 const buckets=[1,2,3].map(k=>({k,hits:rows.reduce((n,x)=>n+x.buckets[k-1].hit,0),expected:rows.reduce((n,x)=>n+x.buckets[k-1].pool*x.heads.length/10000,0)}));
 return {cuts:rows.length,heads:rows.reduce((n,x)=>n+x.heads.length,0),coverage,buckets,methods:r};
}
async function main(){
 const rows:any[]=[],skipped:any[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  try{const day=await one(d);rows.push(...day.filter(x=>x.heads.length===5));console.log('VT4_DAY',d,JSON.stringify(day.map(x=>({turn:x.turn,heads:x.heads.length,coverage:x.coverage}))));}
  catch(e){skipped.push({date:d,error:String(e)});console.log('VT4_SKIP',d,String(e));}
 }
 const result={from:FROM,to:TO,skipped,conditional:conditionalAudit(rows),pairs:aggregatePairs(rows),pairsByTurn:Object.fromEntries(TURNOS.map(t=>[t,aggregatePairs(rows.filter(x=>x.turn===t))])),geometry:aggregateGeometry(rows),geometryByTurn:Object.fromEntries(TURNOS.map(t=>[t,aggregateGeometry(rows.filter(x=>x.turn===t))])),all:summarize(rows),early:summarize(rows.filter(x=>x.date<'2026-11-18')),later:summarize(rows.filter(x=>x.date>='2026-11-18')),common:summarize(rows.filter(x=>x.turn!=='Previa'&&x.coverage.hoy.pool>0)),byTurn:Object.fromEntries(TURNOS.map(t=>[t,summarize(rows.filter(x=>x.turn===t))]))};
 console.log('VT4_JSON_START');console.log(JSON.stringify(result));console.log('VT4_JSON_END');
 if(!rows.length)throw Error('No complete cuts');
}
main().catch(e=>{console.error(e);process.exitCode=1});
