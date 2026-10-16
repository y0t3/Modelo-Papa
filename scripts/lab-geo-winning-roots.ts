// LABORATORIO SOLAMENTE.
// Contrafactual de Geometría completa: las referencias de D-1 y D-7 son
// EXCLUSIVAMENTE las huellas VT3 comprobadas de cabezas históricas (view.roots).
// Una cabeza real cuenta como UN EVENTO, aunque tenga múltiples caminos.
// La selección usa la hoja PRE actual; nunca usa la cabeza que intenta predecir.
// No se modifica src/vt3Shadow.ts ni src/motorLalo.ts.
import {TURNOS} from '../src/domain';
import type {Turno} from '../src/domain';
import type {DailySheet,SourceId} from '../src/sheet';
import {allPhysicalVt3} from '../src/vt3Shadow';
import {reversibleFamily} from '../src/motorLalo';
import type {LaloView,RootRef} from '../src/motorLalo';

type Pt={row:number;col:number};
const sources:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
export type ExperimentalMode='HUELLAS_DISTANCIA'|'HUELLAS_EVENTOS'|'HUELLAS_CON_RAIZ';
type Candidate={family:string;value:string;source:SourceId;cells:string[];
 shape:string;pos:Pt;key:string};
export type ExperimentalEntry={
 family:string;value:string;source:SourceId;cells:string[];
 rootsYesterday:number;rootsWeek:number;independentRoots:number;
 distanceYesterday:number;distanceWeek:number;
 displacedYesterday:boolean;displacedWeek:boolean;anchored:boolean;
 historicalEvidence:{period:'D−1'|'D−7';date:string;oldTurn:Turno;
  jurisdiction:string;head:string;oldCells:string[];shiftRows:number;shiftCols:number}[];
};
const coords=(cells:string[])=>cells.map(s=>{
 const [row,col]=s.split(':').map(Number);return {row,col};
});
export function canonicalShape(cells:string[]):string{
 const steps=(a:Pt[])=>a.slice(1).map((c,i)=>[c.row-a[i].row,c.col-a[i].col].join(',')).join(';');
 const list=coords(cells);
 return [steps(list),steps([...list].reverse())].sort()[0];
}
const pos=(cells:string[])=>{const c=coords(cells);
 return {row:Math.min(...c.map(x=>x.row)),col:Math.min(...c.map(x=>x.col))};
};
const eventId=(r:RootRef)=>[r.date,r.oldTurn,r.jurisdiction,r.head].join('|');
const distance=(a:Pt,b:Pt)=>Math.abs(a.row-b.row)+Math.abs(a.col-b.col);
export function buildWinningRootsGeo(
 sheet:DailySheet,date:string,turn:Turno,view:LaloView,mode:ExperimentalMode
):{top:ExperimentalEntry[];poolFamilies:number;rootEvents:number;routeCount:number;
 eligibleAnchoredFamilies:number;rootWitnessMatches:number}{
 if(date!==view.date||turn!==view.target)throw Error('Incongruencia hoja PRE y raíces');
 const available=sheet.columns.slice(0,TURNOS.indexOf(turn)+1);
 if(sheet.heads[turn]?.length||sheet.matches[turn]?.length)
  throw Error('Fuga temporal del turno objetivo');
 const roots=view.roots.filter(r=>r.oldCells.length===3&&r.date<date);
 if(roots.some(r=>!/^(D−1|D−7)$/.test(r.period)))throw Error('Raíz sin período');
 const lookup=new Map<string,RootRef[]>();
 const uniqueAllEvents=new Set<string>();
 for(const root of roots){
  const key=root.sourceId+'|'+canonicalShape(root.oldCells);
  if(!lookup.has(key))lookup.set(key,[]);
  lookup.get(key)!.push(root);
  uniqueAllEvents.add(eventId(root));
 }
 const pool:Candidate[]=[];
 for(const col of available){
  for(const path of allPhysicalVt3(col.values)){
   const cells=path.map(p=>p.row+':'+p.col);
   const value=path.map(p=>p.digit).join('');
   const shape=canonicalShape(cells),family=reversibleFamily(value);
   pool.push({cells,value,shape,family,source:col.id,pos:pos(cells),
    key:col.id+'|'+[cells.join('>'),[...cells].reverse().join('>')].sort()[0]});
  }
 }
 type Ranked=Candidate&{evidence:ExperimentalEntry['historicalEvidence'];
  yesterday:number;week:number;far1:number;far7:number;max1:number;max7:number;all:number;
  score:number[]};
 const evaluated:Ranked[]=pool.map(p=>{
  const entries=lookup.get(p.source+'|'+p.shape)||[];
  const evt1=new Map<string,RootRef>(),evt7=new Map<string,RootRef>();
  let far1=0,far7=0,max1=0,max7=0;
  const evidence:ExperimentalEntry['historicalEvidence']=[];
  for(const old of entries){
   const oldPos=pos(old.oldCells),d=distance(p.pos,oldPos);
   const dy=p.pos.row-oldPos.row,dx=p.pos.col-oldPos.col;
   if(old.period==='D−1'){
    max1=Math.max(max1,d);
    if(Math.abs(dy)>=2)far1=1;
    evt1.set(eventId(old),old);
   }else{
    max7=Math.max(max7,d);
    if(Math.abs(dy)>=2)far7=1;
    evt7.set(eventId(old),old);
   }
   evidence.push({period:old.period,date:old.date,oldTurn:old.oldTurn,
    jurisdiction:old.jurisdiction,head:old.head,oldCells:old.oldCells,
    shiftRows:dy,shiftCols:dx});
  }
  const yesterday=evt1.size,week=evt7.size,all=new Set([...evt1.keys(),...evt7.keys()]).size;
  const score=mode==='HUELLAS_DISTANCIA'?
   [far1,max1,far7,max7,far1||far7?1:0,Math.max(max1,max7),all]:
   mode==='HUELLAS_EVENTOS'?
   [yesterday>0?1:0,yesterday,week>0?1:0,week,far1,far7,max1,max7]:
   [all>0?1:0,yesterday>0?1:0,week>0?1:0,
    yesterday,week,far1,far7,max1,max7];
  return {...p,yesterday,week,all,far1,far7,max1,max7,evidence,score};
 });
 evaluated.sort((a,b)=>{
  for(let i=0;i<Math.max(a.score.length,b.score.length);i++){
   const diff=(b.score[i]||0)-(a.score[i]||0);if(diff)return diff;
  }
  return sources.indexOf(a.source)-sources.indexOf(b.source)||
   a.pos.row-b.pos.row||a.pos.col-b.pos.col||a.key.localeCompare(b.key);
 });
 const seen=new Set<string>(),top:ExperimentalEntry[]=[];
 for(const p of evaluated){
  if(seen.has(p.family))continue;
  seen.add(p.family);
  if(mode==='HUELLAS_CON_RAIZ'&&p.all===0)continue;
  if(top.length<10)top.push({family:p.family,value:p.value,source:p.source,cells:p.cells,
   rootsYesterday:p.yesterday,rootsWeek:p.week,independentRoots:p.all,
   distanceYesterday:p.max1,distanceWeek:p.max7,
   displacedYesterday:!!p.far1,displacedWeek:!!p.far7,
   anchored:p.all>0,historicalEvidence:p.evidence});
 }
 const anchoredFamilyCount=new Set(evaluated.filter(p=>p.all>0).map(p=>p.family)).size;
 return {top,poolFamilies:seen.size,routeCount:pool.length,rootEvents:uniqueAllEvents.size,
  eligibleAnchoredFamilies:anchoredFamilyCount,
  rootWitnessMatches:evaluated.filter(p=>p.all>0).length};
}
