/**
 * LAB · Lalo VT3: "una celda cambia, borde de dos se conserva".
 *
 * Reglas:
 * - raíces: ÚNICAMENTE recorridos VT3 realmente ganadores en las SEIS
 *   últimas jornadas válidas ANTERIORES a la fecha objetivo.
 * - cabeza histórica completa, recorrido exacto y mismo SourceId.
 * - figura nueva: comparte un BORDE DE DOS celdas (coordenadas) con
 *   raíz vieja en esa misma columna, pero la tercera es OTRA celda.
 * - cada camino nuevo sigue sus propios contactos físicos sin saltos.
 * - no se inventan familias: sale de dígitos en hoja PRE.
 * - diagnóstico y ranking sombra sin alterar MV1 / VT2 / VT4.
 * - 1 sola sustitución: puesto #10 del Top10 (o llenar un puesto vacío).
 * - diferencia entre acierto familiar reversible y recorrido exacto.
 *
 * Selecciones FIJAS: RECENCIA, MEMORIA_6, CONVERGENCIA_2.
 * El mismo código y reglas aplica junio-septiembre, octubre 1-23
 * y el 24/10 como verificación temporal descriptiva (un solo día).
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {DailySheet,SourceId} from '../src/sheet';
import {cellsFromPlus11,findPaths} from '../src/paths';
import type {Path} from '../src/paths';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';

type Mode='RECENCIA'|'MEMORIA_6'|'CONVERGENCIA_2';
const MODES:Mode[]=['RECENCIA','MEMORIA_6','CONVERGENCIA_2'];
type C={row:number;col:number;digit:string};
type Root={date:string;dayLag:number;turn:string;jur:string;head:string;
 source:SourceId;coordKeys:Set<string>;coords:string[];pathValue:string;
 rootId:string;family:string};
type Route={source:SourceId;value:string;family:string;coords:string[];
 coordKeys:Set<string>;path:Path};
type Evidence={rootId:string;date:string;dayLag:number;turn:string;
 jur:string;head:string;source:SourceId;oldCoords:string[];
 newCoords:string[];oldValue:string;newValue:string};
type Candidate={family:string;routes:Route[];evidence:Evidence[];
 dates:string[];recent3:number;sourceCount:number;sourceWithSupport:number;
 distinctEvents:number;d1:boolean;exactOrientedValues:string[]};
type Snapshot={date:string;turn:string;mode:Mode;chosen:string|null;
 pool:string[];poolSize:number;base10:string[];originalRank10:string|null;
 resultCounts:Record<string,number>;exactResults:Record<string,number>};
const memo=new Map<string,Promise<CabezasDia>>();
async function get(date:string){
 if(!memo.has(date))memo.set(date,descargarCabezas(date,true));
 return memo.get(date)!;
}
const nHeads=(data:CabezasDia)=>TURNOS.reduce((a,t)=>a+JURS.filter(j=>
 /^\d{4}$/.test(data[t]?.[j]||'')).length,0);
const idCell=(c:C)=>c.row+':'+c.col;
const keyCells=(p:Path)=>p.map(idCell).sort().join(',');
const same=(a:Set<string>,b:Set<string>)=>{
 let n=0;for(const x of a)if(b.has(x))n++;return n;
};
const areAdjacent=(a:string,b:string)=>{
 const [ar,ac]=a.split(':').map(Number),[br,bc]=b.split(':').map(Number);
 return Math.max(Math.abs(ar-br),Math.abs(ac-bc))===1;
};
const sharedBorder=(a:Set<string>,b:Set<string>)=>{
 const overlap=[...a].filter(x=>b.has(x));
 return overlap.length===2&&areAdjacent(overlap[0],overlap[1]);
};
// Lista normalizada: una ruta física no suma dos veces por orientación inversa.
function enumerate(cols:DailySheet['columns']):Map<string,Route[]>{
 const out=new Map<string,Route[]>(),seen=new Set<string>();
 for(const col of cols){
  const cells=cellsFromPlus11(col.values);
  const dfs=(p:Path)=>{
   if(p.length===3){
    const val=p.map(x=>x.digit).join(''),family=reversibleFamily(val);
    // Una misma terna de celdas puede permitir órdenes distintos:
    // agrupar por familia además de posiciones (nunca perder VT3 válidas).
    const geom=col.id+'|'+family+'|'+keyCells(p);
    if(seen.has(geom))return;
    seen.add(geom);
    const item:Route={source:col.id,value:val,family,
     coords:p.map(idCell),coordKeys:new Set(p.map(idCell)),path:p};
    const set=out.get(family)||[];set.push(item);out.set(family,set);
    return;
   }
   for(const next of cells){
    if(p.some(x=>x.row===next.row&&x.col===next.col))continue;
    const last=p[p.length-1];
    if(Math.max(Math.abs(last.row-next.row),Math.abs(last.col-next.col))!==1)continue;
    dfs([...p,next]);
   }
  };
  for(const start of cells)dfs([start]);
 }
 return out;
}
async function previousSix(date:string){
 const found:Array<{date:string;draws:CabezasDia;sheet:DailySheet}>=[];
 let day=date,iterations=0;
 while(found.length<6&&iterations++<17){
  day=previousDrawDay(day);
  if(day>=date)throw Error('Fuga temporal '+day+' vs '+date);
  const heads=await get(day);
  if(nHeads(heads)<20)continue; // no declarar desaparición en feriados.
  const sheet=buildSheet(heads,await get(previousDrawDay(day)));
  found.push({date:day,draws:heads,sheet});
 }
 if(found.length!==6)throw Error('Sin 6 jornadas válidas '+date);
 return found;
}
function winningRoots(history:Awaited<ReturnType<typeof previousSix>>):Root[]{
 const roots:Root[]=[],seen=new Set<string>();
 for(const [i,day] of history.entries()){
  for(const turn of TURNOS)for(const m of day.sheet.matches[turn]||[]){
   if(m.jurisdiccion==='Montevideo'||!/^\d{4}$/.test(m.cabeza))continue;
   for(const h of m.hits){
    if(h.kind!=='vt3'||!m.cabeza.endsWith(h.value))continue;
    for(const p of h.paths){
     const event=day.date+'|'+turn+'|'+m.jurisdiccion+'|'+m.cabeza;
     const rootId=event+'|'+h.sourceId+'|'+keyCells(p);
     if(seen.has(rootId))continue;
     seen.add(rootId);
     roots.push({date:day.date,dayLag:i+1,turn,jur:m.jurisdiccion,
      head:m.cabeza,source:h.sourceId,coordKeys:new Set(p.map(idCell)),
      coords:p.map(idCell),pathValue:h.value,rootId,
      family:reversibleFamily(h.value)});
    }
   }
  }
 }
 return roots;
}
function evaluate(universe:Map<string,Route[]>,roots:Root[],
 excluded:Set<string>):Candidate[]{
 const bySource=new Map<SourceId,Root[]>();
 for(const r of roots){
  const list=bySource.get(r.source)||[];
  list.push(r);bySource.set(r.source,list);
 }
 const result:Candidate[]=[];
 for(const [family,routes] of universe){
  if(excluded.has(family))continue;
  const support=new Map<string,Evidence>();
  for(const path of routes)for(const root of bySource.get(path.source)||[]){
   // EXACTAMENTE dos celdas en misma posición + borde de contacto;
   // la tercera siempre cambió, no es una copia exacta de 3 celdas.
   if(!sharedBorder(path.coordKeys,root.coordKeys))continue;
   const k=root.rootId;
   if(!support.has(k))support.set(k,{
    rootId:k,date:root.date,dayLag:root.dayLag,
    turn:root.turn,jur:root.jur,head:root.head,source:root.source,
    oldCoords:root.coords,newCoords:path.coords,
    oldValue:root.pathValue,newValue:path.value});
  }
  if(support.size===0)continue;
  const evidence=[...support.values()];
  const dates=[...new Set(evidence.map(x=>x.date))];
  const sources=[...new Set(evidence.map(x=>x.source))];
  const events=[...new Set(evidence.map(x=>
   x.date+'|'+x.turn+'|'+x.jur+'|'+x.head))];
  result.push({family,routes,evidence,dates,
   recent3:dates.filter(d=>evidence.some(x=>x.date===d&&x.dayLag<=3)).length,
   sourceCount:new Set(routes.map(x=>x.source)).size,
   sourceWithSupport:sources.length,distinctEvents:events.length,
   d1:evidence.some(x=>x.dayLag===1),
   exactOrientedValues:[...new Set(routes.map(x=>x.value))]});
 }
 return result;
}
function poolFor(xs:Candidate[],m:Mode){
 return xs.filter(x=>m==='CONVERGENCIA_2'?
  x.sourceCount>=2&&x.sourceWithSupport>=2&&x.dates.length>=2:true);
}
function priority(x:Candidate,m:Mode){
 if(m==='RECENCIA')return [Number(x.d1),x.recent3,x.dates.length,
  x.sourceWithSupport,x.distinctEvents,x.sourceCount];
 if(m==='MEMORIA_6')return [x.dates.length,x.recent3,
  Number(x.d1),x.sourceWithSupport,x.distinctEvents,x.sourceCount];
 return [x.sourceWithSupport,x.sourceCount,x.dates.length,
  x.recent3,Number(x.d1),x.distinctEvents];
}
function choice(xs:Candidate[],mode:Mode):Candidate|null{
 const sorted=poolFor(xs,mode).sort((a,b)=>{
  const ap=priority(a,mode),bp=priority(b,mode);
  for(let i=0;i<ap.length;i++)if(ap[i]!==bp[i])return bp[i]-ap[i];
  return a.family.localeCompare(b.family);
 });
 return sorted[0]||null;
}
function replace10(base:string[],candidate:string|null){
 const list=[...base];
 if(candidate){
  if(list.length>=10)list[9]=candidate;
  else list.push(candidate);
 }
 return list;
}
/**
 * Diagnóstico de los recorridos exactos cuyo par de celdas no se
 * vincula con ganadores de seis jornadas anteriores. NO prioriza.
 */
function signature(coords:string[]):string{
 const q=coords.map(s=>s.split(':').map(Number));
 const mr=Math.min(...q.map(x=>x[0])),mc=Math.min(...q.map(x=>x[1]));
 const direct=q.map(x=>(x[0]-mr)+':'+(x[1]-mc)).join('>');
 const reverse=[...q].reverse().map(x=>(x[0]-mr)+':'+(x[1]-mc)).join('>');
 return [direct,reverse].sort()[0];
}
function unmatchedClass(
 paths:Array<{source:SourceId;cells:string[]}>,past:Root[]
){
 let exact=0,twoUnjoined=0,one=0,
  shapeSame=0,shapeOther=0,anySameSource=0;
 const witness:any[]=[];
 for(const current of paths){
  const cs=new Set(current.cells),signatureNow=signature(current.cells);
  for(const prior of past){
   const matched=sharedCells(cs,prior.coordKeys);
   const sameSource=prior.source===current.source;
   const matchingShape=signatureNow===signature(prior.coords);
   if(sameSource){
    anySameSource++;
    if(matched===3)exact++;
    if(matched===2&&!sharedBorder(cs,prior.coordKeys))twoUnjoined++;
    if(matched===1)one++;
    if(matchingShape)shapeSame++;
   }else if(matchingShape)shapeOther++;
   if((sameSource&&matched>=1)||matchingShape){
    if(witness.length<6)witness.push({
     rootDate:prior.date,lag:prior.dayLag,turn:prior.turn,jur:prior.jur,
     head:prior.head,source:prior.source,
     currentSource:current.source,
     overlap:matched,shapeSame:matchingShape
    });
   }
  }
 }
 const category=exact?'COPIA_TRES':
  twoUnjoined?'DOS_SIN_BORDE':
  shapeSame?'MISMA_FORMA_OTRO_SITIO':
  one?'CONTACTO_UNA_CELDA':
  shapeOther?'FORMA_EN_OTRA_FUENTE':
  anySameSource?'OTRA_ESTRUCTURA':'SIN_RAICES_EN_FUENTE';
 return {category,exact,twoUnjoined,one,shapeSame,shapeOther,
  rootsFromSameSource:anySameSource,witness};
}
const sharedCells=(a:Set<string>,b:Set<string>)=>{
 let count=0;for(const v of a)if(b.has(v))count++;
 return count;
};
function period(date:string){
 return date<='2026-07-31'?'JUN_JUL':
  date<='2026-09-30'?'AGO_SEP':
  date<='2026-10-23'?'OCT_01_23':'24_OCT';
}
const randomSeed=20261025;
function rng(seed:number){
 let state=seed|0;
 return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)/4294967296};
}
async function main(){
 const dates:string[]=[];
 for(let d='2026-06-01';d<='2026-10-24';d=shiftDay(d,1))
  if(new Date(d+'T12:00:00').getDay()!==0)dates.push(d);
 const heads:any[]=[],cuts:any[]=[],families:any[]=[],snapshots:Snapshot[]=[],unmatched:any[]=[],discontinuityPools:any[]=[],discontinuityHeads:any[]=[],orderCases:any[]=[];
 for(const date of dates){
  const actual=await get(date),valid=nHeads(actual);
  if(valid<20){console.log('MUTACION_OMITIDA',date,valid);continue}
  const d1=previousDrawDay(date),d1b=previousDrawDay(d1);
  const d7=shiftDay(date,-7),d7b=previousDrawDay(d7);
  const [old,older,week,weekOlder,six]=await Promise.all([
   get(d1),get(d1b),get(d7),get(d7b),previousSix(date)
  ]);
  const hist:LaloHistorical[]=[
   {date:d1,period:'D−1',sheet:buildSheet(old,older)},
   {date:d7,period:'D−7',sheet:buildSheet(week,weekOlder)}
  ];
  const past=winningRoots(six);
  for(const [idx,turn] of TURNOS.entries()){
   const pre=diaVacio();
   for(const t of TURNOS.slice(0,idx))pre[t]={...actual[t]};
   const sheet=buildSheet(pre,old),cols=sheet.columns.slice(0,idx+1);
   const official=buildMotorLalo(sheet,date,turn,hist);
   const all=enumerate(cols),excluded=new Set(official.ranks.vt3.map(x=>x.family));
   const mutation=evaluate(all,past,excluded);
   const base=official.ranks.vt3.slice(0,10).map(x=>x.family);
   const resultHeads=JURS.map(j=>({jur:j,head:actual[turn]?.[j]||''}))
    .filter(x=>/^\d{4}$/.test(x.head));
   const familyCounts:Record<string,number>={};
   const orientedCounts:Record<string,number>={};
   for(const h of resultHeads){
    const v=h.head.slice(-3),family=reversibleFamily(v);
    familyCounts[family]=(familyCounts[family]||0)+1;
    if(cols.some(c=>findPaths(c.values,v).length>0))
     orientedCounts[family]=(orientedCounts[family]||0)+1;
   }
   const picks:Record<Mode,Candidate|null>=Object.fromEntries(
    MODES.map(m=>[m,choice(mutation,m)])) as Record<Mode,Candidate|null>;
   // Clasificar TODAS las familias posibles PRE fuera de la categoría
   // 2/3 borde, no solo las que resultarán ganadoras POST.
   const mutatedFamilies=new Set(mutation.map(x=>x.family));
   const unclassified=[...all.entries()]
    .filter(([f])=>!excluded.has(f)&&!mutatedFamilies.has(f))
    .map(([family,paths])=>{
     const z=unmatchedClass(paths.map(p=>({
      source:p.source,cells:p.coords})),past);
     return {family,category:z.category,
      nearest:Math.min(99,...z.witness.map(w=>w.lag||99)),
      witnesses:z.witness.length,
      routes:paths.length,
      sources:new Set(paths.map(p=>p.source)).size,
      detail:z.witness.slice(0,2)};
    });
   const modalities={
    CONTACTO_UNA:'CONTACTO_UNA_CELDA',
    FORMA_OTRA_FUENTE:'FORMA_EN_OTRA_FUENTE',
    FORMA_OTRO_SITIO:'MISMA_FORMA_OTRO_SITIO',
    MISMAS_TRES:'COPIA_TRES',
    CUALQUIERA:'ALL'
   };
   const picksU:any={},poolsU:any={};
   for(const [mode,category] of Object.entries(modalities)){
    const group=unclassified.filter(x=>category==='ALL'||x.category===category);
    group.sort((a,b)=>a.nearest-b.nearest||b.sources-a.sources||
     b.witnesses-a.witnesses||b.routes-a.routes||a.family.localeCompare(b.family));
    picksU[mode]=group[0]||null;
    poolsU[mode]=group.map(x=>x.family);
   }
   // Las familias se seleccionaron exclusivamente con trazos PRE.
   // Los resultados de las seis jurisdicciones SOLO puntúan después.
   for(const [mode,pool] of Object.entries(poolsU)){
    const chosen=picksU[mode];
    discontinuityPools.push({date,turn,mode,pool,
     chosen:chosen?.family||null,chosenCategory:chosen?.category||null,
     witness:chosen?.detail||[],originalRank10:base[9]||null});
   }
   const preRankings=Object.fromEntries(MODES.map(m=>[
    m,replace10(base,picks[m]?.family||null)
   ])) as Record<Mode,string[]>;
   for(const m of MODES){
    const pool=poolFor(mutation,m).map(x=>x.family);
    snapshots.push({date,turn,mode:m,chosen:picks[m]?.family||null,
     pool,poolSize:pool.length,base10:base,originalRank10:base[9]||null,
     resultCounts:familyCounts,exactResults:orientedCounts});
   }
   cuts.push({date,turn,knownColumns:cols.map(x=>x.id),
    headsInTarget:resultHeads.length,historicalDays:six.map(x=>x.date),
    rootPaths:past.length,physicalFamilies:all.size,
    familiesInMotor:excluded.size,
    mutatedNotRecognized:mutation.length,
    d1Eligible:mutation.filter(x=>x.d1).length,
    repeated6:mutation.filter(x=>x.dates.length>=2).length,
    multipleSource:mutation.filter(x=>x.sourceWithSupport>=2).length,
    convergenceEligible:poolFor(mutation,'CONVERGENCIA_2').length,
    selected:Object.fromEntries(MODES.map(m=>[m,picks[m]?.family||null]))});
   families.push(...mutation.map(f=>({date,turn,family:f.family,
    dates:f.dates,routeCount:f.routes.length,sourceCount:f.sourceCount,
    distinctEvents:f.distinctEvents,day1:f.d1,
    sourceWithSupport:f.sourceWithSupport,
    evidence:f.evidence.slice(0,14).map(e=>({
     day:e.date,lag:e.dayLag,turn:e.turn,jur:e.jur,head:e.head,
     source:e.source,original:e.oldValue,current:e.newValue,
     originalCells:e.oldCoords,currentCells:e.newCoords
    }))})));
   for(const h of resultHeads){
    const value=h.head.slice(-3),family=reversibleFamily(value);
    const exactPaths=cols.flatMap(x=>findPaths(x.values,value).map(p=>({
     source:x.id,cells:p.map(idCell)
    })));
    const officialRank=official.ranks.vt3.find(x=>x.family===family)?.rank||null;
    const shadow=mutation.find(x=>x.family===family);
    const residual=unclassified.find(x=>x.family===family);
    if(exactPaths.length>0&&officialRank===null&&residual){
     discontinuityHeads.push({date,turn,jur:h.jur,head:h.head,
      family,category:residual.category,witness:residual.detail});
     if(residual.category==='COPIA_TRES'){
      const matches:any[]=[];
      for(const path of exactPaths){
       const loc=new Set(path.cells);
       for(const root of past){
        if(root.source!==path.source||sharedCells(loc,root.coordKeys)!==3)continue;
        const forward=path.cells.join('>');
        const prior=root.coords.join('>');
        const oldReverse=[...root.coords].reverse().join('>');
        matches.push({rootDate:root.date,daysBack:root.dayLag,
         oldWinner:root.head,oldJur:root.jur,oldTurn:root.turn,
         source:root.source,oldVT3:root.pathValue,
         newVT3:value,oldCells:root.coords,newCells:path.cells,
         orderStatus:forward===prior?'MISMO_SENTIDO':
          forward===oldReverse?'INVERTIDO':'ORDEN_DISTINTO'});
       }
      }
      orderCases.push({date,turn,jur:h.jur,head:h.head,family,
       physicalPaths:exactPaths.length,
       tripleMatches:matches.length,
       matches:matches.slice(0,80)});
     }
    }
    if(exactPaths.length>0&&officialRank===null&&!shadow){
     unmatched.push({date,turn,jur:h.jur,head:h.head,value,family,
      ...unmatchedClass(exactPaths,past)});
    }
    heads.push({date,turn,jur:h.jur,head:h.head,value,family,
     period:period(date),physicalExact:exactPaths.length>0,
     physicalPaths:exactPaths,officialRank,
     physicalButUnrecognized:exactPaths.length>0&&officialRank===null,
     mutationEvidence:shadow?{
      activationDays:shadow.dates.length,recent3:shadow.recent3,
      distinctEvents:shadow.distinctEvents,
      sources:shadow.sourceCount,sourceWithSupport:shadow.sourceWithSupport,
      witness:shadow.evidence.slice(0,8)
     }:null,
     ranks:Object.fromEntries(MODES.map(m=>[
      m,preRankings[m].indexOf(family)>=0?
       preRankings[m].indexOf(family)+1:null
     ])),
     baselineTop10:base.includes(family)});
   }
  }
  console.log('MUTACION_DIA',date,valid);
 }
 const allPeriods=['JUN_JUL','AGO_SEP','OCT_01_23','24_OCT','TOTAL'];
 const report:any[]=[];
 for(const p of allPeriods){
  const sample=heads.filter(x=>p==='TOTAL'||x.period===p);
  const baseTop10=sample.filter(x=>x.baselineTop10).length;
  const possible=sample.filter(x=>x.physicalExact);
  const notRecognized=possible.filter(x=>x.officialRank===null);
  for(const m of MODES){
   const good=sample.filter(x=>x.ranks[m]!==null);
   const newWon=good.filter(x=>!x.baselineTop10);
   const oldLost=sample.filter(x=>x.baselineTop10&&x.ranks[m]===null);
   const exactNew=newWon.filter(x=>x.physicalExact);
   report.push({period:p,mode:m,heads:sample.length,
    physicallyPossible:possible.length,notRecognized:notRecognized.length,
    notRecognizedWithMutatedWitness:notRecognized.filter(x=>x.mutationEvidence).length,
    baselineTop10:baseTop10,
    top10:good.length,gained:newWon.length,lost:oldLost.length,
    exactNew:exactNew.length,
    gains:newWon.map(x=>({date:x.date,turn:x.turn,jur:x.jur,
     head:x.head,family:x.family,physicalExact:x.physicalExact,
     evidence:x.mutationEvidence})),
    losses:oldLost.map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head}))
   });
  }
 }
 const countByCut=new Map<string,Record<string,number>>();
 const byDatePeriod=(date:string)=>period(date);
 for(const x of heads){
  const id=x.date+'|'+x.turn;
  const counts=countByCut.get(id)||{};
  counts[x.family]=(counts[x.family]||0)+1;
  countByCut.set(id,counts);
 }
 const modesU=['CONTACTO_UNA','FORMA_OTRA_FUENTE',
  'FORMA_OTRO_SITIO','MISMAS_TRES','CUALQUIERA'];
 const randomDisc=rng(20261026),discReport:any[]=[];
 for(const mode of modesU){
  const allMode=discontinuityPools.filter(x=>x.mode===mode);
  const eligible=allMode.filter(x=>x.chosen!==null);
  const gain=eligible.reduce((n,x)=>n+(countByCut.get(x.date+'|'+x.turn)?.[x.chosen]||0),0);
  const loss=eligible.reduce((n,x)=>n+(x.originalRank10?
   (countByCut.get(x.date+'|'+x.turn)?.[x.originalRank10]||0):0),0);
  const samples:number[]=[];
  for(let rep=0;rep<12000;rep++){
   let won=0;
   for(const cut of eligible){
    const selected=cut.pool[Math.floor(randomDisc()*cut.pool.length)];
    won+=countByCut.get(cut.date+'|'+cut.turn)?.[selected]||0;
   }
   samples.push(won);
  }
  samples.sort((a,b)=>a-b);
  const mean=samples.reduce((a,b)=>a+b,0)/samples.length;
  const periods=['JUN_JUL','AGO_SEP','OCT_01_23','24_OCT'];
  discReport.push({mode,exposures:allMode.reduce((a,x)=>a+x.pool.length,0),
   eligibleCuts:eligible.length,
   meanPoolSize:allMode.reduce((a,x)=>a+x.pool.length,0)/Math.max(1,eligible.length),
   gained:gain,lost:loss,net:gain-loss,
   randomMean:mean,randomP95:samples[Math.floor(samples.length*.95)],
   randomAtLeastObserved:samples.filter(x=>x>=gain).length/samples.length,
   byPeriod:periods.map(k=>{
    const group=eligible.filter(x=>byDatePeriod(x.date)===k);
    return {period:k,cuts:group.length,
     gained:group.reduce((a,x)=>a+(countByCut.get(x.date+'|'+x.turn)?.[x.chosen]||0),0),
     lost:group.reduce((a,x)=>a+(x.originalRank10?
      (countByCut.get(x.date+'|'+x.turn)?.[x.originalRank10]||0):0),0)};
   })});
 }
 const categories=['CONTACTO_UNA_CELDA','FORMA_EN_OTRA_FUENTE',
  'MISMA_FORMA_OTRO_SITIO','COPIA_TRES','SIN_RAICES_EN_FUENTE',
  'OTRA_ESTRUCTURA','DOS_SIN_BORDE'];
 const typesToModes:any={
  CONTACTO_UNA_CELDA:'CONTACTO_UNA',
  FORMA_EN_OTRA_FUENTE:'FORMA_OTRA_FUENTE',
  MISMA_FORMA_OTRO_SITIO:'FORMA_OTRO_SITIO',
  COPIA_TRES:'MISMAS_TRES'
 };
 const exposureByTurn=TURNOS.map(turn=>{
  const xs=discontinuityPools.filter(x=>x.turn===turn);
  const wins=discontinuityHeads.filter(x=>x.turn===turn);
  return {turn,cuts:xs.filter(x=>x.mode==='CUALQUIERA').length,
   exposures:xs.filter(x=>x.mode==='CUALQUIERA')
    .reduce((a,x)=>a+x.pool.length,0),
   winners:wins.length,
   categories:Object.fromEntries(categories.map(c=>[
    c,{exposures:xs.filter(x=>x.mode===typesToModes[c])
      .reduce((a,x)=>a+x.pool.length,0),
     winners:wins.filter(x=>x.category===c).length}
   ]))};
 });
 const simulations=15000,random=rng(randomSeed),controls:any[]=[];
 for(const m of MODES){
  const s=snapshots.filter(x=>x.mode===m);
  const observed=report.find(x=>x.period==='TOTAL'&&x.mode===m)!.gained;
  const simulated:number[]=[];
  for(let rep=0;rep<simulations;rep++){
   let n=0;
   for(const cut of s){
    if(cut.pool.length===0)continue;
    const choose=cut.pool[Math.floor(random()*cut.pool.length)];
    n+=cut.resultCounts[choose]||0;
   }
   simulated.push(n);
  }
  simulated.sort((a,b)=>a-b);
  const mean=simulated.reduce((a,b)=>a+b,0)/simulations;
  const observedTotal=report.find(x=>x.period==='TOTAL'&&x.mode===m)!;
  controls.push({mode:m,selectedGains:observed,
   selectedExactGains:observedTotal.exactNew,
   lost:observedTotal.lost,net:observed-observedTotal.lost,
   avgRandomGains:mean,randomP95:simulated[Math.floor(.95*simulations)],
   randomAtLeastObserved:simulated.filter(x=>x>=observed).length/simulations,
   eligibleCuts:s.filter(x=>x.pool.length>0).length,
   meanPoolSize:s.reduce((n,x)=>n+x.pool.length,0)/
    Math.max(1,s.filter(x=>x.pool.length>0).length)});
 }
 const out='auditorias/lalo-vt3-discontinuidades-42-25oct/resultados';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/resumen.json',JSON.stringify({report,controls},null,2));
 fs.writeFileSync(out+'/cabezas.json',JSON.stringify(heads,null,2));
 fs.writeFileSync(out+'/cortes.json',JSON.stringify(cuts,null,2));
 fs.writeFileSync(out+'/familias-testigos.json',JSON.stringify(families,null,2));
 fs.writeFileSync(out+'/control-aleatorio.json',JSON.stringify(controls,null,2));
 fs.writeFileSync(out+'/mismas-tres-celdas.json',JSON.stringify(orderCases,null,2));
 fs.writeFileSync(out+'/discontinuidades.json',
  JSON.stringify({discReport,exposureByTurn,discontinuityHeads},null,2));
 fs.writeFileSync(out+'/discontinuidades-por-corte.json',
  JSON.stringify(discontinuityPools.map(x=>({
   ...x,poolSize:x.pool.length,pool:undefined
  })),null,2));
 fs.writeFileSync(out+'/familias-sin-mutacion.json',JSON.stringify(unmatched,null,2));
 console.log('MUTACION_RESULTADOS',JSON.stringify(report.map(x=>({
  period:x.period,mode:x.mode,heads:x.heads,possible:x.physicallyPossible,
  noRecognized:x.notRecognized,eligible:witnessed(x),
  base:x.baselineTop10,top10:x.top10,gained:x.gained,
  lost:x.lost,exactGains:x.exactNew
 }))));
 console.log('MUTACION_AZAR',JSON.stringify(controls));
 console.log('DISCONTINUIDADES_RESUMEN',JSON.stringify(discReport));
 console.log('DISCONTINUIDADES_TURNOS',JSON.stringify(exposureByTurn));
 console.log('DISCONTINUIDADES_CASOS',JSON.stringify(discontinuityHeads));
 console.log('DISCONTINUIDADES_MISMAS_TRES',JSON.stringify(orderCases.map(x=>({
  date:x.date,turn:x.turn,head:x.head,
  matches:x.tripleMatches,examples:x.matches.slice(0,8)
 }))));
 console.log('MUTACION_NO_CUBIERTAS',JSON.stringify({
  count:unmatched.length,
  byTurn:Object.fromEntries(TURNOS.map(t=>[t,unmatched.filter(x=>x.turn===t).length])),
  categories:Object.fromEntries([...new Set(unmatched.map(x=>x.category))]
   .map(k=>[k,unmatched.filter(x=>x.category===k).length])),
  examples:unmatched.slice(0,18).map(x=>({
   date:x.date,turn:x.turn,jur:x.jur,head:x.head,
   category:x.category,witness:x.witness.slice(0,2)
  }))
 }));
 console.log('MUTACION_CASOS',JSON.stringify(report.filter(x=>x.period==='TOTAL')
  .map(x=>({mode:x.mode,gains:x.gains,losses:x.losses}))));
 console.log('MUTACION_CORTES',JSON.stringify({days:[...new Set(cuts.map(x=>x.date))].length,
  cuts:cuts.length,heads:heads.length,meanEligible:cuts.reduce((n,x)=>n+
  x.mutatedNotRecognized,0)/cuts.length}));
}
function witnessed(x:any){return x.notRecognizedWithMutatedWitness}
void main().catch(e=>{console.error('MUTACION_ERROR',e);process.exitCode=1});
