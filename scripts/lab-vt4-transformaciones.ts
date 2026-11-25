/**
 * VT4: parentesco con una cabeza histórica formable de la misma jurisdicción
 * y turno, D-1 sorteable y D-7 calendario, exclusivamente con cortes PRE.
 * No modifica motores ni selecciona apuestas. Categorías de cobertura,
 * comparadas con su tamaño y con el universo formable de cada corte.
 */
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut} from '../src/auxTemporalModes';
import {rankPlusVt4,rankAuxVt4} from '../src/vt4Independent';
const FROM=process.env.VT4_FROM||'2026-09-15',TO=process.env.VT4_TO||'2026-11-23';
const sheets=['lalo','ayer','hoy'] as const;
type Engine=typeof sheets[number];
type Cell={row:number;col:number;digit:string};
type Route={source:string;cells:Cell[]};
type Pool=Map<string,Route[]>;
const valid=(v:string)=>/^\d{4}$/.test(v);
const drawCache=new Map<string,Promise<CabezasDia>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
const dayCache=new Map<string,Promise<Day>>();
function draw(d:string){let p=drawCache.get(d);if(!p){p=descargarCabezas(d,true);drawCache.set(d,p)}return p;}
function aux(d:string){let p=auxCache.get(d);if(!p){p=fetchAuxiliaryHeads(d);auxCache.set(d,p)}return p;}
type Day={heads:CabezasDia;cuts:Map<Turno,Record<Engine,Pool>>};
function day(d:string){
 let p=dayCache.get(d);if(p)return p;
 p=(async()=>{
  const heads=await draw(d);
  const prev=await nocturnaAnteriorPorJur(d,draw);
  const sheet=buildSheet(heads,prev.heads);
  const [a,b]=await Promise.all([aux(auxiliarySourceDate(d)),aux(d)]);
  const cuts=new Map<Turno,Record<Engine,Pool>>();
  for(const t of TURNOS){
   const lalo=new Map(rankPlusVt4(sheet,d,t).map(f=>[f.family,f.paths.map(p=>({source:p.sourceId,cells:p.path}))]));
   const make=(mode:'anterior'|'intrajornada',raw:typeof a.heads)=>new Map(rankAuxVt4(auxAtCut(raw,t,mode),d,t).map(f=>[f.family,f.routes.map(cells=>({source:'aux',cells}))]));
   cuts.set(t,{lalo,ayer:make('anterior',a.heads),hoy:make('intrajornada',b.heads)});
  }
  return {heads,cuts};
 })();dayCache.set(d,p);return p;
}
const pos=(p:Route)=>p.source+'|'+p.cells.map(c=>c.row+':'+c.col).join(';');
const shape=(p:Route,rr=1,cc=1)=>p.cells.slice(1).map((c,i)=>rr*(c.row-p.cells[i].row)+','+cc*(c.col-p.cells[i].col)).join(';');
const names=['universo','repite_4','conserva_3_pos','conserva_3_sin_orden','mismo_recorrido','traslado','otra_columna','reflejo','mismo_recorrido_3','traslado_3','reflejo_3','mismas_casillas_3'] as const;
type Name=typeof names[number];
type Metric={n:number;pool:number;hits:number;expected:number;formed:number;conditional:number};
type Stats=Record<string,Metric>;
function add(out:Stats,key:string,pool:Set<string>,all:Pool,h:string){
 const m=out[key]||{n:0,pool:0,hits:0,expected:0,formed:0,conditional:0};
 m.n++;m.pool+=pool.size;m.hits+=Number(pool.has(h));m.expected+=pool.size/10000;
 if(all.has(h)){m.formed++;m.conditional+=all.size?pool.size/all.size:0;}out[key]=m;
}
function overlap(a:string,b:string){
 const x=[...b];let n=0;for(const c of a){const i=x.indexOf(c);if(i>=0){n++;x.splice(i,1);}}return n;
}
function groups(all:Pool,root:string,rs:Route[]):Record<Name,Set<string>>{
 const g=Object.fromEntries(names.map(n=>[n,new Set<string>()])) as Record<Name,Set<string>>;
 const exactPositions=new Set(rs.map(pos));
 const shapes=new Set(rs.map(p=>shape(p)));
 const byShape=new Map<string,Set<string>>();
 for(const p of rs){const k=shape(p),s=byShape.get(k)||new Set<string>();s.add(p.source);byShape.set(k,s);}
 const mirrors=new Set(rs.flatMap(p=>[shape(p,-1,1),shape(p,1,-1),shape(p,-1,-1)]));
 for(const [v,paths] of all){
  g.universo.add(v);
  const same=[...v].filter((c,i)=>c===root[i]).length;
  if(same===4)g.repite_4.add(v);
  if(same===3)g.conserva_3_pos.add(v);
  if(overlap(v,root)===3)g.conserva_3_sin_orden.add(v);
  for(const p of paths){
   const sh=shape(p),exact=exactPositions.has(pos(p));
   const translated=shapes.has(sh)&&!exact;
   const reflected=mirrors.has(sh)&&!shapes.has(sh);
   if(exact)g.mismo_recorrido.add(v);
   if(translated)g.traslado.add(v);
   if(byShape.has(sh)&&[...byShape.get(sh)!].some(s=>s!==p.source))g.otra_columna.add(v);
   if(reflected)g.reflejo.add(v);
   if(same===3&&exact)g.mismas_casillas_3.add(v);
   if(same===3&&shapes.has(sh))g.mismo_recorrido_3.add(v);
   if(same===3&&translated)g.traslado_3.add(v);
   if(same===3&&reflected)g.reflejo_3.add(v);
  }
 }
 return g;
}
async function main(){
 const stats:Stats={},byTurn:Stats={},skipped:{date:string;ref?:string;error:string}[]=[];
 let cuts=0,heads=0;
 for(let d=FROM;d<=TO;d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  let now:Day,refs:{lag:string;date:string;value:Day}[]=[];
  try{
   if(!hasDrawResults(await draw(d)))continue;
   now=await day(d);
  }catch(e){skipped.push({date:d,error:String(e)});continue;}
  try{
   const prev=(await loadPreviousDraws(d,1,draw))[0];
   refs.push({lag:'D1',date:prev.date,value:await day(prev.date)});
  }catch(e){skipped.push({date:d,ref:'D1',error:String(e)});}
  try{
   const w=shiftDay(d,-7);if(hasDrawResults(await draw(w)))refs.push({lag:'D7',date:w,value:await day(w)});
  }catch(e){skipped.push({date:d,ref:'D7',error:String(e)});}
  for(const t of TURNOS){
   const js=JURS.filter(j=>j!=='Montevideo');
   if(!js.every(j=>valid(now.heads[t]?.[j]||'')))continue;
   cuts++;heads+=js.length;
   for(const ref of refs)for(const sheet of sheets)for(const j of js){
    const all=now.cuts.get(t)![sheet],old=ref.value.cuts.get(t)![sheet],root=ref.value.heads[t]?.[j]||'';
    const rs=old.get(root);if(!rs?.length||!all.size)continue;
    // Classification does not receive the target head; only scoring does.
    const g=groups(all,root,rs);
    const h=now.heads[t][j];
    for(const n of names){
     const key=sheet+'|'+ref.lag+'|'+n;
     add(stats,key,g[n],all,h);add(byTurn,t+'|'+key,g[n],all,h);
    }
   }
  }
  console.log('VT4_DAY',d,'refs',refs.map(r=>r.lag+':'+r.date).join(','));
  // Bound caches on longer runs, without changing the reference selection.
  if(dayCache.size>20)for(const k of dayCache.keys())if(k<shiftDay(d,-14))dayCache.delete(k);
 }
 if(!cuts)throw Error('No complete cuts');
 console.log('VT4_JSON_START');console.log(JSON.stringify({from:FROM,to:TO,heads,cuts,skipped,stats,byTurn}));console.log('VT4_JSON_END');
}
main().catch(e=>{console.error(e);process.exitCode=1});
