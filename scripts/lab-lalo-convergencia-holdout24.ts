/**
 * Auditoría de techo físico y filtro histórico de VT3 Lalo.
 * Separa: imposible en hoja PRE / posible sin candidato del motor /
 * candidato con puesto >10 / candidato Top10 (1-3,4-5,6-10).
 * Sombra experimental: solo familias VT3 físicamente posibles, fuera del
 * Top10, con dos celdas físicas compartidas con ganadora anterior
 * (misma columna; D1 o D7, sin necesitar igualdad numérica).
 * Reemplaza máximo UN puesto, el #10 del Top10 del motor, nunca amplía
 * cupo ni afecta la app ni las madres VT4 oficiales.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {DailySheet,SourceId} from '../src/sheet';
import {cellsFromPlus11,findPaths} from '../src/paths';
import type {Path} from '../src/paths';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';

const MODES=['BASE','SHADOW_D1','SHADOW_ANY','SHADOW_BOTH','SHADOW_CONVERGENCE'] as const;
type Mode=typeof MODES[number];
type Root={period:'D−1'|'D−7';source:SourceId;coords:Set<string>;
 event:string;shape:string;anchor:number};
type Route={source:SourceId;coords:Set<string>;shape:string;anchor:number;
 value:string;family:string};
type Candidate={family:string;paths:Route[];d1:Set<string>;
 d7:Set<string>;d1Exact:Set<string>;d7Exact:Set<string>;
 sourceCount:number;routeCount:number};
const dates:string[]=[];
for(let d='2026-10-24';d<='2026-10-24';d=shiftDay(d,1))
 if(new Date(d+'T12:00:00').getDay()!==0)dates.push(d);
const cache=new Map<string,Promise<CabezasDia>>();
const get=(date:string)=>{
 if(!cache.has(date))cache.set(date,descargarCabezas(date,true));
 return cache.get(date)!;
};
const headsCount=(heads:CabezasDia)=>
 TURNOS.reduce((x,t)=>x+JURS.filter(j=>/^\d{4}$/.test(heads[t]?.[j]||'')).length,0);
const cell=(x:Path[number])=>x.row+':'+x.col;
const shape=(p:Path)=>{
 const mr=Math.min(...p.map(x=>x.row)),mc=Math.min(...p.map(x=>x.col));
 const a=p.map(x=>(x.row-mr)+':'+(x.col-mc)).join('>');
 const b=[...p].reverse().map(x=>(x.row-mr)+':'+(x.col-mc)).join('>');
 return [a,b].sort()[0];
};
const anchor=(p:Path)=>Math.min(...p.map(x=>x.row));
const routeKey=(p:Path)=>p.map(cell).sort().join(',');
function enumerate(cols:DailySheet['columns']):Map<string,Route[]>{
 const out=new Map<string,Route[]>();
 for(const col of cols){
  const cells=cellsFromPlus11(col.values);
  const rec=(path:Path)=>{
   if(path.length===3){
    const value=path.map(x=>x.digit).join('');
    const family=reversibleFamily(value);
    const route={source:col.id,coords:new Set(path.map(cell)),
     shape:shape(path),anchor:anchor(path),value,family};
    let xs=out.get(family);
    if(!xs){xs=[];out.set(family,xs)}
    // Dos sentidos de la misma ruta física no suman dos testigos.
    if(!xs.some(x=>x.source===col.id&&
     [...x.coords].sort().join(',')===routeKey(path)))xs.push(route);
    return;
   }
   for(const next of cells){
    if(path.some(c=>c.row===next.row&&c.col===next.col))continue;
    const last=path[path.length-1];
    if(Math.max(Math.abs(last.row-next.row),
     Math.abs(last.col-next.col))!==1)continue;
    rec([...path,next]);
   }
  };
  for(const x of cells)rec([x]);
 }
 return out;
}
function historyRoots(hist:LaloHistorical[]):Root[]{
 const result:Root[]=[];
 const unique=new Set<string>();
 for(const h of hist)for(const turn of TURNOS)
  for(const m of h.sheet.matches[turn]||[]){
   if(m.jurisdiccion==='Montevideo'||!/^\d{4}$/.test(m.cabeza))continue;
   for(const hit of m.hits){
    if(hit.kind!=='vt3'||!m.cabeza.endsWith(hit.value))continue;
    for(const path of hit.paths){
     const event=h.date+'|'+turn+'|'+m.jurisdiccion+'|'+m.cabeza;
     const id=event+'|'+hit.sourceId+'|'+routeKey(path);
     if(unique.has(id))continue;unique.add(id);
     result.push({period:h.period,source:hit.sourceId,
      coords:new Set(path.map(cell)),event,shape:shape(path),anchor:anchor(path)});
    }
   }
  }
 return result;
}
const shared=(a:Set<string>,b:Set<string>)=>{
 let n=0;for(const v of a)if(b.has(v))n++;return n;
};
function shadowRoutes(cols:DailySheet['columns'],roots:Root[],baseFamilies:Set<string>)
 :Candidate[]{
 const universe=enumerate(cols);
 const grouped=new Map<SourceId,Root[]>();
 for(const r of roots){const group=grouped.get(r.source)||[];
  group.push(r);grouped.set(r.source,group)}
 const candidates:Candidate[]=[];
 for(const [family,paths] of universe){
  if(baseFamilies.has(family))continue;
  const d1=new Set<string>(),d7=new Set<string>();
  const d1Exact=new Set<string>(),d7Exact=new Set<string>();
  for(const p of paths)for(const h of grouped.get(p.source)||[]){
   // Mismo sitio: comparte un borde físico completo (2 de 3 celdas)
   // con un dibujo que explicó una cabeza PRE en D−1 o D−7.
   if(shared(p.coords,h.coords)>=2){
    (h.period==='D−1'?d1:d7).add(h.event);
   }
   // Control de invariantes de traslado: forma y misma fuente (sin
   // mirar las cifras); si está soportada así, debería existir en MV1.
   if(p.shape===h.shape){
    (h.period==='D−1'?d1Exact:d7Exact).add(h.event);
   }
  }
  if(d1.size+d7.size===0&&d1Exact.size+d7Exact.size===0)continue;
  candidates.push({family,paths,d1,d7,d1Exact,d7Exact,
   sourceCount:new Set(paths.map(x=>x.source)).size,
   routeCount:paths.length});
 }
 return candidates;
}
function score(c:Candidate,mode:Mode):number[]{
 if(mode==='SHADOW_CONVERGENCE')
  return [c.sourceCount,c.d1.size+c.d7.size,
   c.d1.size,c.routeCount];
 if(mode==='SHADOW_BOTH')
  return [Number(c.d1.size>0&&c.d7.size>0),c.d1.size+c.d7.size,
   c.d1.size,c.sourceCount,c.routeCount];
 if(mode==='SHADOW_D1')return [c.d1.size,
  c.d7.size,c.sourceCount,c.routeCount];
 return [c.d1.size+c.d7.size,c.d1.size,c.d7.size,
  c.sourceCount,c.routeCount];
}
function bestShadow(xs:Candidate[],mode:Mode):Candidate|null{
 const qualified=xs.filter(x=>mode==='SHADOW_D1'?x.d1.size>0:
  mode==='SHADOW_BOTH'?x.d1.size>0&&x.d7.size>0:
  mode==='SHADOW_CONVERGENCE'?x.sourceCount>=2&&
    x.d1.size+x.d7.size>0:
  x.d1.size+x.d7.size>0);
 qualified.sort((a,b)=>{
  const x=score(a,mode),y=score(b,mode);
  for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];
  return a.family.localeCompare(b.family);
 });
 return qualified[0]||null;
}
const block=(date:string)=>date<='2026-07-31'?'JUN_JUL':
 date<='2026-09-30'?'AGO_SEP':'OCT';
const categories=['IMPOSIBLE','POSIBLE_NO_RECONOCIDA','RECONOCIDA_FUERA_TOP10',
 'TOP6_10','TOP4_5','TOP1_3'] as const;
async function main(){
 const results:any[]=[],dayAudit:any[]=[],cutAudit:any[]=[];
 for(const date of dates){
  const d1=previousDrawDay(date),d1b=previousDrawDay(d1);
  const d7=shiftDay(date,-7),d7b=previousDrawDay(d7);
  const [today,prev,prev2,week,week2]=await Promise.all([
   get(date),get(d1),get(d1b),get(d7),get(d7b)
  ]);
  // Se considera comprobable una jornada solo con >=20 cabezas.
  if(headsCount(today)<20){console.log('HOLDOUT_OMITIDA',date,headsCount(today));continue}
  const hist:LaloHistorical[]=[
   {date:d1,period:'D−1',sheet:buildSheet(prev,prev2)},
   {date:d7,period:'D−7',sheet:buildSheet(week,week2)}
  ];
  const roots=historyRoots(hist);
  for(const [idx,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const t of TURNOS.slice(0,idx))pre[t]={...today[t]};
   const sheet=buildSheet(pre,prev),columns=sheet.columns.slice(0,idx+1);
   const view=buildMotorLalo(sheet,date,turn,hist);
   const familyRanks=new Map(view.ranks.vt3.map(x=>[x.family,x.rank]));
   const shadow=shadowRoutes(columns,roots,new Set(familyRanks.keys()));
   const picks=Object.fromEntries(MODES.slice(1).map(m=>
    [m,bestShadow(shadow,m)])) as Record<Exclude<Mode,'BASE'>,Candidate|null>;
   const ranks:Record<Mode,string[]>={BASE:view.ranks.vt3.slice(0,10)
    .map(x=>x.family),SHADOW_D1:[],SHADOW_ANY:[],SHADOW_BOTH:[],SHADOW_CONVERGENCE:[]};
   for(const m of MODES.slice(1)){
    const base=[...ranks.BASE];
    const alternate=picks[m];
    // Solo reemplazar el último cupo real; sin cupo libre no se anexa,
    // salvo cuando motor tiene menos de 10 familias (no exceder 10).
    if(alternate){
     if(base.length>=10)base[9]=alternate.family;
     else base.push(alternate.family);
    }
    ranks[m]=base;
   }
   const rootPossible=shadow.filter(x=>x.d1Exact.size+x.d7Exact.size>0);
   cutAudit.push({date,turn,roots:roots.length,availableColumns:columns.length,
    engineFamilies:familyRanks.size,shadowCandidates:shadow.length,
    exactShapeUnrecognized:rootPossible.length,
    supportedD1:shadow.filter(x=>x.d1.size>0).length,
    supportedAny:shadow.filter(x=>x.d1.size+x.d7.size>0).length,
    supportedBoth:shadow.filter(x=>x.d1.size>0&&x.d7.size>0).length,
    chosen:Object.fromEntries(MODES.slice(1).map(m=>[m,picks[m]?.family||null])),
    originalRank10:ranks.BASE[9]||null,
    publishedFamilyCounts:Object.fromEntries(JURS.map(j=>today[turn]?.[j]||'')
      .filter(h=>/^\d{4}$/.test(h))
      .map(h=>reversibleFamily(h.slice(-3)))
      .reduce((map,f)=>map.set(f,(map.get(f)||0)+1),new Map<string,number>())),
    poolD1:shadow.filter(x=>x.d1.size>0).map(x=>x.family),
    poolAny:shadow.filter(x=>x.d1.size+x.d7.size>0).map(x=>x.family),
    poolBoth:shadow.filter(x=>x.d1.size>0&&x.d7.size>0).map(x=>x.family),
    poolConvergence:shadow.filter(x=>x.sourceCount>=2&&
     x.d1.size+x.d7.size>0).map(x=>x.family)});
   for(const jur of JURS){
    const head=today[turn]?.[jur]||'';
    if(!/^\d{4}$/.test(head))continue;
    const suffix=head.slice(-3),family=reversibleFamily(suffix);
    // Verifica SOLO orientación exacta sorteada en columnas físicas PRE:
    // 006 y 600 no se confunden con valor realmente dibujable.
    const physical=columns.filter(x=>findPaths(x.values,suffix).length>0)
     .map(x=>x.id);
    const rank=familyRanks.get(family)||null;
    const label=physical.length===0?'IMPOSIBLE':rank===null?'POSIBLE_NO_RECONOCIDA':
     rank>10?'RECONOCIDA_FUERA_TOP10':
     rank>5?'TOP6_10':rank>3?'TOP4_5':'TOP1_3';
    const shadowInfo=shadow.find(x=>x.family===family)||null;
    const actualShadow=shadowInfo?{
     d1:shadowInfo.d1.size,d7:shadowInfo.d7.size,
     d1Exact:shadowInfo.d1Exact.size,d7Exact:shadowInfo.d7Exact.size,
     sources:shadowInfo.sourceCount,paths:shadowInfo.routeCount}:null;
    const alt=Object.fromEntries(MODES.map(m=>[m,
     ranks[m].indexOf(family)>=0?ranks[m].indexOf(family)+1:null]));
    results.push({date,turn,jur,head,suffix,family,block:block(date),
     category:label,physicalSources:physical,originalRank:rank,
     shadow:actualShadow,alternativeRanks:alt});
   }
  }
  dayAudit.push({date,heads:headsCount(today)});
  console.log('HOLDOUT_DIA',date,'cabezas',headsCount(today));
 }
 if(dayAudit.length!==1||results.length<20)
  throw Error('Holdout 24/10 incompleto: '+dayAudit.length+' jornadas, '+results.length+' cabezas');
 const distribution:any[]=[];
 for(const period of ['JUN_JUL','AGO_SEP','OCT','TOTAL']){
  const xs=results.filter(x=>period==='TOTAL'||x.block===period);
  const d:any={period,total:xs.length};
  for(const cat of categories)d[cat]=xs.filter(x=>x.category===cat).length;
  d.PHYSICALLY_POSSIBLE=xs.filter(x=>x.category!=='IMPOSIBLE').length;
  d.RANKED=xs.filter(x=>x.originalRank!==null).length;
  d.OUTSIDE_TOP10_WITH_GEOMETRY=xs.filter(x=>
   x.category==='RECONOCIDA_FUERA_TOP10').length;
  d.SHADOW_RESCUABLE=xs.filter(x=>x.category==='POSIBLE_NO_RECONOCIDA'&&
   x.shadow&&(x.shadow.d1+x.shadow.d7)>0).length;
  for(const m of MODES){
   d['TOP10_'+m]=xs.filter(x=>x.alternativeRanks[m]!==null).length;
   d['TOP3_'+m]=xs.filter(x=>x.alternativeRanks[m]!==null&&
    x.alternativeRanks[m]<=3).length;
  }
  distribution.push(d);
 }
 const wins:Record<Mode,{gained:any[];lost:any[]}>=Object.fromEntries(
  MODES.slice(1).map(m=>[m,{gained:[],lost:[]}])) as any;
 for(const m of MODES.slice(1)){
  wins[m].gained=results.filter(x=>x.alternativeRanks.BASE===null&&
   x.alternativeRanks[m]!==null)
   .map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head,
    family:x.family,support:x.shadow}));
  wins[m].lost=results.filter(x=>x.alternativeRanks.BASE!==null&&
   x.alternativeRanks[m]===null)
   .map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head,family:x.family}));
 }
 // Control aleatorio CONDICIONAL a los mismos conjuntos de familias
 // formables. No implica predicción aleatoria de la quiniela:
 // compara solo criterio de selección dentro de la oportunidad geométrica.
 const seeded=(value:number)=>{
  let state=value|0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
   return (state>>>0)/4294967296};
 };
 const rand=seeded(20261025);
 const randomControl:any={};
 for(const mode of MODES.slice(1)){
  const key=mode==='SHADOW_D1'?'poolD1':mode==='SHADOW_ANY'?'poolAny':
   mode==='SHADOW_BOTH'?'poolBoth':'poolConvergence';
  const observed=wins[mode].gained.length;
  const losses=wins[mode].lost.length;
  const draws=15000;
  const simulated:number[]=[];
  for(let iteration=0;iteration<draws;iteration++){
   let successes=0;
   for(const cut of cutAudit){
    const pool=(cut as any)[key] as string[];
    if(!pool.length)continue;
    const chosen=pool[Math.floor(rand()*pool.length)];
    successes+=(cut.publishedFamilyCounts[chosen]||0);
   }
   simulated.push(successes);
  }
  simulated.sort((a,b)=>a-b);
  const mean=simulated.reduce((a,b)=>a+b,0)/draws;
  const tail=simulated.filter(x=>x>=observed).length/draws;
  randomControl[mode]={observedGained:observed,
   observedLost:losses,net:observed-losses,
   simulations:draws,averageRandomGains:mean,
   medianRandomGains:simulated[Math.floor(draws/2)],
   randomP95:simulated[Math.floor(draws*.95)],
   randomAtLeastObserved:tail,
   cutsWithChoice:cutAudit.filter(c=>(c as any)[key].length>0).length,
   averagePoolSize:cutAudit.reduce((n,c)=>n+(c as any)[key].length,0)/
    Math.max(1,cutAudit.filter(c=>(c as any)[key].length>0).length)};
 }
 const out='auditorias/lalo-filtro-vt3-25oct/holdout-24oct';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/resumen.json',JSON.stringify({distribution,wins},null,2));
 fs.writeFileSync(out+'/cabezas.json',JSON.stringify(results,null,2));
 fs.writeFileSync(out+'/cortes-y-testigos.json',JSON.stringify(cutAudit,null,2));
 fs.writeFileSync(out+'/jornadas.json',JSON.stringify(dayAudit,null,2));
 fs.writeFileSync(out+'/control-aleatorio-condicional.json',
  JSON.stringify(randomControl,null,2));
 console.log('HOLDOUT_DISTRIBUCION',JSON.stringify(distribution));
 console.log('HOLDOUT_SHADOW_DIFF',JSON.stringify(Object.fromEntries(
  MODES.slice(1).map(m=>[m,{gains:wins[m].gained.length,
   losses:wins[m].lost.length,exampleGains:wins[m].gained.slice(0,15),
   exampleLosses:wins[m].lost.slice(0,15)}]))));
 console.log('HOLDOUT_RANDOM_CONTROL',JSON.stringify(randomControl));
 console.log('HOLDOUT_CORTES',JSON.stringify({days:dayAudit.length,
  cuts:cutAudit.length,heads:results.length,
  avgUnrecognizedStrict:cutAudit.reduce((n,x)=>n+x.supportedD1,0)/cutAudit.length,
  sampleSource:cutAudit.slice(0,3)}));
}
void main().catch(e=>{console.error('HOLDOUT_ERROR',e);process.exitCode=1});
