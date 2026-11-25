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

/** Transition evidence is strictly intraday. Each prior jurisdiction's head
 * contributes at most once per feature. Prior routes are frozen at THEIR
 * PRE cut; never retrospectively reconstructed using the current board.
 * A sequence is not a prediction of digits: rank physically available families.
 */
type Mark={jur:string;date:string;turn:Turno;routes:Route[]};
type CutMarks={date:string;turn:Turno;marks:Mark[]};
const marks=new Map<string,CutMarks>();
const exact=(fs:Family[])=>new Set(fs.flatMap(f=>f.values));
const plusSources=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
function center(r:Route,engine:string){
 const p=r.path, row=p.reduce((s,c)=>s+c.row,0)/3,col=p.reduce((s,c)=>s+c.col,0)/3;
 return engine==='lalo'?[row,col+plusSources.indexOf(r.source)*2]:[row,col];
}
function distance(a:number[],b:number[]){return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);}
function sourceSet(r:Route){return new Set(r.path.map(c=>c.source||r.source));}
function cellKeys(r:Route){return new Set(r.path.map(c=>r.source+'|'+c.row+':'+c.col));}
function common(a:Iterable<string>,b:Iterable<string>){const q=new Set(b);return [...a].filter(x=>q.has(x)).length;}
function digitOverlap(a:Route,b:Route){const x=a.path.map(c=>c.digit),y=b.path.map(c=>c.digit);let n=0;for(const v of x){const i=y.indexOf(v);if(i>=0){n++;y.splice(i,1);}}return n;}
function priorMark(engine:string,d:string,t:Turno,lag:number){
 const i=TURNOS.indexOf(t)-lag;if(i<0)return [];
 const p=marks.get(engine+'|'+TURNOS[i]);if(!p)return [];
 if(p.date!==d||TURNOS.indexOf(p.turn)>=TURNOS.indexOf(t))throw Error('Fuga temporal de marcas');
 return p.marks;
}
function recordMarks(engine:string,d:string,t:Turno,routes:Route[],heads:string[]){
 const jurs=JURS.filter(j=>j!=='Montevideo');
 const ms:Mark[]=heads.flatMap((h,i)=>{
  const rr=routes.filter(r=>r.path.map(c=>c.digit).join('')===h.slice(-3));
  return rr.length?[{jur:jurs[i],date:d,turn:t,routes:rr}]:[];
 });
 marks.set(engine+'|'+t,{date:d,turn:t,marks:ms});
}

// Frozen comparison: all movement methods use the same matched antecedent
// events and the same exact-value coverage. Swapping endpoints preserves
// both observed positions and jurisdiction, only reverses temporal order.
type Point=number[];
type Pair={old:Point;recent:Point};
type Sequence={jur:string;pairs:Pair[]};
const eps=.25;
const uniqueCenters=(rs:Route[],engine:string)=>[...new Map(rs.map(r=>{const c=center(r,engine);return [c.join(','),c]})).values()];
function sequence(engine:string,p1:Mark[],p2:Mark[]){
 const out:Sequence[]=[];
 for(const a of p2){
  const b=p1.find(m=>m.jur===a.jur);if(!b)continue;
  const pairs:Pair[]=[];
  for(const old of uniqueCenters(a.routes,engine))for(const recent of uniqueCenters(b.routes,engine))pairs.push({old,recent});
  if(pairs.length)out.push({jur:a.jur,pairs});
 }
 return out;
}
const project=(a:Point,b:Point)=>[2*b[0]-a[0],2*b[1]-a[1]];
const near=(a:Point,b:Point)=>1/(1+distance(a,b));
const names=['permanencia','reciente','retorno','desplazamiento','invertido','sin_orden','continuidad_pura','continuidad_invertida','continuidad_sin_orden'] as const;
function movement(c:Point,p:Pair){
 const {old:a,recent:b}=p,move=distance(a,b);
 const f=move>=eps?near(c,project(a,b)):0,rev=move>=eps?near(c,project(b,a)):0;
 // permanence is close to both, not merely one endpoint. Return requires
 // a nonzero displacement. Scores use Manhattan distance on real centers.
 return [Math.min(near(c,a),near(c,b)),near(c,b),move>=eps?near(c,a):0,f,rev,(f+rev)/2,f+.25*near(c,b),rev+.25*near(c,a),(f+rev)/2+.125*(near(c,a)+near(c,b))];
}
function profiles(engine:string,fs:Family[],routes:Route[],seq:Sequence[]){
 const grouped=new Map<string,Route[]>();
 for(const r of routes){const k=label(r.path.map(c=>c.digit).join('')),a=grouped.get(k)||[];a.push(r);grouped.set(k,a);}
 // One event contributes once; each feature can take best physical route.
 // Symmetric controls average the two event-level best direction scores.
 return fs.map(f=>{
  const x=Array(names.length).fill(0);
  for(const e of seq){
   const best=Array(names.length).fill(0);
   for(const c of uniqueCenters(grouped.get(f.v)||[],engine))for(const p of e.pairs){
    const v=movement(c,p);
    for(let i=0;i<v.length;i++)best[i]=Math.max(best[i],v[i]);
   }
   best[5]=(best[3]+best[4])/2;best[8]=(best[6]+best[7])/2;
   for(let i=0;i<x.length;i++)x[i]+=best[i]/seq.length;
  }
  return {f,x};
 });
}
const methods=['actual','control','bloques','compactos','historico_mas_fisico',...names];
type Result=Metric&{formed:number;position:number;eligible:number;both:number;onlyMethod:number;onlyActual:number};
const measures:Record<string,Result>={},days:Record<string,Record<string,number>>={};
const features:Record<string,{n:number;hit:number;expected:number}>={};
const paired:Record<string,{both:number;onlyReal:number;onlyControl:number;neither:number}>={};
const availability:Record<string,{cuts:number;matched:number;moving:number;events:number;movingEvents:number;ambiguous:number}>={};
function select(fs:Family[],rows:{f:Family;x:number[]}[],d:string,t:Turno,eligible:boolean,moving:boolean){
 const hist=ranked(fs.filter(f=>f.admitted),'actual',d,t),baseline=hist.slice(0,10);
 const tie=(a:Family,b:Family)=>hash(d+'|'+t+'|'+a.v)-hash(d+'|'+t+'|'+b.v)||a.v.localeCompare(b.v);
 const orders:Record<string,Family[]>={actual:hist,control:ranked(fs,'control',d,t),bloques:ranked(fs,'bloques',d,t),compactos:ranked(fs,'compactos',d,t),historico_mas_fisico:ranked(fs,'historico_mas_fisico',d,t)};
 for(let i=0;i<names.length;i++){const score=new Map(rows.map(r=>[r.f.v,r.x[i]]));orders[names[i]]=(i<2?eligible:moving)?[...fs].sort((a,b)=>score.get(b.v)!-score.get(a.v)!||tie(a,b)):hist;}
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
 const p1=priorMark(engine,d,t,1),p2=priorMark(engine,d,t,2),seq=sequence(engine,p1,p2);
 const eligible=seq.length>0;
 const moving=seq.some(e=>e.pairs.some(p=>distance(p.old,p.recent)>=eps));
 if(!fs.length){recordMarks(engine,d,t,routes,heads);return;}
 const rows=profiles(engine,fs,routes,seq),picks=select(fs,rows,d,t,eligible,moving);
 const h=heads.map(x=>x.slice(-3)),all=exact(fs),formed=h.filter(x=>all.has(x)).length,a=exact(picks.actual.top);
 for(const key of [engine,engine+'|'+t]){
  const z=availability[key]||(availability[key]={cuts:0,matched:0,moving:0,events:0,movingEvents:0,ambiguous:0});
  z.cuts++;z.matched+=Number(eligible);z.moving+=Number(moving);z.events+=seq.length;z.movingEvents+=seq.filter(e=>e.pairs.some(p=>distance(p.old,p.recent)>=eps)).length;z.ambiguous+=seq.filter(e=>e.pairs.length>1).length;
 }
 for(const [name,p] of Object.entries(picks)){
  const set=exact(p.top),hits=h.filter(v=>set.has(v)).length,ranks=new Map<string,number>();let before=0;
  for(const f of p.full){for(const v of f.values)ranks.set(v,1-(before+f.values.length/2)/all.size);before+=f.values.length;}
  const tail=(all.size-before)/2/all.size,position=h.reduce((s,v)=>s+(all.has(v)?ranks.get(v)??tail:0),0);
  for(const key of [engine+'|'+name,engine+'|'+t+'|'+name,...(eligible?[engine+'|elegible|'+name]:[]),...(moving?[engine+'|movimiento|'+name]:[])]){
   const m=measures[key]||(measures[key]={...empty(),formed:0,position:0,eligible:0,both:0,onlyMethod:0,onlyActual:0});
   m.cuts++;m.heads+=h.length;m.hits+=hits;m.expected+=h.length*set.size/1000;m.conditional+=formed*set.size/all.size;m.size+=set.size;m.any+=Number(hits>0);m.formed+=formed;m.position+=position;m.eligible+=Number(eligible);
   m.both+=h.filter(v=>a.has(v)&&set.has(v)).length;m.onlyActual+=h.filter(v=>a.has(v)&&!set.has(v)).length;m.onlyMethod+=h.filter(v=>set.has(v)&&!a.has(v)).length;
  }
  const daily=days[d]||(days[d]={}),key=engine+'|'+name;daily[key]=(daily[key]||0)+hits;
  if(moving){const k=engine+'|movimiento|'+name;daily[k]=(daily[k]||0)+hits;}
 }
 if(moving){
  for(const [real,ctrl] of [['desplazamiento','invertido'],['desplazamiento','sin_orden'],['desplazamiento','reciente'],['continuidad_pura','continuidad_invertida'],['continuidad_pura','continuidad_sin_orden'],['continuidad_pura','reciente']]){
   const aa=exact(picks[real].top),bb=exact(picks[ctrl].top);
   for(const key of [engine+'|'+real+'|'+ctrl,engine+'|'+t+'|'+real+'|'+ctrl]){
    const q=paired[key]||(paired[key]={both:0,onlyReal:0,onlyControl:0,neither:0});
    for(const v of h){const x=aa.has(v),y=bb.has(v);if(x&&y)q.both++;else if(x)q.onlyReal++;else if(y)q.onlyControl++;else q.neither++;}
   }
  }
  for(let i=0;i<names.length;i++){
   const k=engine+'|'+names[i],z=features[k]||(features[k]={n:0,hit:0,expected:0});
   z.n+=formed;z.hit+=rows.reduce((a,r)=>a+h.filter(v=>r.f.values.includes(v)).length*r.x[i],0);
   z.expected+=formed*rows.reduce((a,r)=>a+r.f.values.length*r.x[i],0)/all.size;
  }
 }
 recordMarks(engine,d,t,routes,heads);
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
 const a=[1,1],b=[2,2],c=[3,3];
 const x=movement(c,{old:a,recent:b}),y=movement(c,{old:b,recent:a});
 if(x[3]!==1||x[4]!==y[3]||x[5]!==y[5]||x[8]!==y[8]||x[3]<=x[4])throw Error('Control temporal incorrecto');
 if(movement(a,{old:a,recent:a})[3]!==0||movement(a,{old:a,recent:b})[2]!==1)throw Error('Movimiento nulo o retorno incorrecto');
 const routes=plusRoutes([{id:'prevNocturno',values:['12','34','56','78','90','12']}]);
 const full=pool(routes,[]),fs=pool(routes,full.slice(0,10).map(f=>f.v)),d='2026-11-25',h=['0123','0124','0789','0111','0222'];
 recordMarks('lalo',d,'Previa',routes,h);recordMarks('lalo',d,'Primera',routes,h);
 const seq=sequence('lalo',priorMark('lalo',d,'Matutino',1),priorMark('lalo',d,'Matutino',2));
 const rows=profiles('lalo',fs,routes,seq),swapped=profiles('lalo',fs,routes,seq.map(e=>({...e,pairs:e.pairs.map(p=>({old:p.recent,recent:p.old}))})));
 for(let i=0;i<rows.length;i++)if(rows[i].x[3]!==swapped[i].x[4]||rows[i].x[5]!==swapped[i].x[5])throw Error('Control invertido no conserva eventos');
 const p=select(fs,rows,d,'Matutino',!!seq.length,seq.some(e=>e.pairs.some(p=>distance(p.old,p.recent)>=eps)));for(const v of Object.values(p))if(exact(v.top).size!==exact(p.actual.top).size)throw Error('Cobertura diferente');
 let rejected=false;marks.set('lalo|Previa',{date:'2026-11-26',turn:'Previa',marks:[]});
 try{priorMark('lalo',d,'Primera',1)}catch(e){rejected=String(e).includes('Fuga temporal');}if(!rejected)throw Error('No rechazó futuro');
 marks.clear();console.log('SEQUENCE_SELF_TEST_OK');
}
async function main(){
 selfTest();let count=0;const skips:{date:string;error:string}[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  marks.clear();
  try{if(await build(d))count++;}catch(e){if(marks.size||/Ruta física inválida|Histórica sin ruta física|Cobertura diferente|Fuga temporal/.test(String(e)))throw e;skips.push({date:d,error:String(e)});}
 }
 if(!count)throw Error('Sin jornadas');
 console.log('SEQUENCE_JSON',JSON.stringify({from:FROM,to:TO,days:count,skips,availability,paired}));
 for(const engine of ['lalo','ayer','hoy'])console.log('SEQUENCE_ENGINE',JSON.stringify({engine,metrics:Object.fromEntries(Object.entries(measures).filter(([k])=>k.startsWith(engine+'|')&&(k.split('|').length===2||k.includes('|elegible|')||k.includes('|movimiento|')))),features:Object.fromEntries(Object.entries(features).filter(([k])=>k.startsWith(engine+'|')))}));
 for(const engine of ['lalo','ayer','hoy'])console.log('SEQUENCE_TURNS',JSON.stringify({engine,metrics:Object.fromEntries(Object.entries(measures).filter(([k])=>k.startsWith(engine+'|')&&k.split('|').length===3&&!k.includes('|elegible|')&&!k.includes('|movimiento|')))}));
 for(const [date,metrics] of Object.entries(days))console.log('SEQUENCE_DAY',JSON.stringify({date,metrics}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
