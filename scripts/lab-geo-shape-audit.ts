// Auditoría independiente: forma, posición y empate geométrico.
// Copia EXACTA de los criterios F_D1 de src/vt3Shadow.ts; se exige concordancia
// de Top10 y de recorridos representantes antes de evaluar las cabezas.
import {TURNOS} from '../src/domain';
import type {Turno} from '../src/domain';
import type {DailySheet,SourceId} from '../src/sheet';
import {allPhysicalVt3} from '../src/vt3Shadow';
import type {ShadowSelection} from '../src/vt3Shadow';
import {reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical,LaloView,RootRef} from '../src/motorLalo';

const sources:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
type Ablation='ORIGINAL'|'SIN_MAX_DISTANCIA_AYER'|'TOPE_DISTANCIA_AYER_2'|'SIN_REFERENCIA_AYER';
const ablations:Ablation[]=['ORIGINAL','SIN_MAX_DISTANCIA_AYER',
 'TOPE_DISTANCIA_AYER_2','SIN_REFERENCIA_AYER'];
type Point={row:number;col:number};
type Route={source:SourceId;shape:string;cells:string[];value:string;family:string;
 pos:Point;key:string;className:string;zone:string;score:number[];rootCount:number};
const pts=(cells:string[]):Point[]=>cells.map(c=>{
 const [row,col]=c.split(':').map(Number);return {row,col};
});
const pos=(cells:string[]):Point=>{
 const p=pts(cells);return {row:Math.min(...p.map(x=>x.row)),
  col:Math.min(...p.map(x=>x.col))};
};
const geom=(cells:string[]):string=>{
 const ss=(x:Point[])=>x.slice(1).map((q,i)=>
  (q.row-x[i].row)+','+(q.col-x[i].col)).join(';');
 const p=pts(cells);return [ss(p),ss([...p].reverse())].sort()[0];
};
const canon=(cells:string[])=>[cells.join('>'),[...cells].reverse().join('>')].sort()[0];
const groupKey=(x:{source:SourceId;shape:string})=>x.source+'|'+x.shape;
const zone=(r:number)=>r<=1?'superior':r<=3?'central':'inferior';
export function classOf(cells:string[]):string{
 const p=pts(cells),edges=p.slice(1).map((q,i)=>{
  const a=p[i],dr=Math.abs(q.row-a.row),dc=Math.abs(q.col-a.col);
  return dc===0?'vertical':dr===0?'horizontal':'diagonal';
 });
 if(edges[0]==='vertical'&&edges[1]==='vertical')return 'recta vertical';
 if(edges[0]==='diagonal'&&edges[1]==='diagonal')return 'dos diagonales';
 if(edges.includes('diagonal')&&edges.includes('vertical'))return 'diagonal + vertical';
 if(edges.includes('diagonal')&&edges.includes('horizontal'))return 'diagonal + horizontal';
 if(edges.includes('horizontal')&&edges.includes('vertical'))return 'horizontal + vertical';
 return edges.join(' + ');
}
function physical(sheet:DailySheet,turn:Turno){
 const out:Omit<Route,'score'|'rootCount'>[]=[];
 for(const c of sheet.columns.slice(0,TURNOS.indexOf(turn)+1))
  for(const p of allPhysicalVt3(c.values)){
   const cells=p.map(x=>x.row+':'+x.col),value=p.map(x=>x.digit).join('');
   out.push({source:c.id,shape:geom(cells),cells,value,
    family:reversibleFamily(value),pos:pos(cells),
    key:c.id+'|'+canon(cells),className:classOf(cells),zone:zone(pos(cells).row)});
  }
 return out;
}
type Reference={pos:Point};
const dist=(a:Point,b:Point)=>Math.abs(a.row-b.row)+Math.abs(a.col-b.col);
const referents=(sheet:DailySheet,turn:Turno)=>{
 const out=new Map<string,Reference[]>();
 for(const r of physical(sheet,turn)){
  const key=groupKey(r);
  if(!out.has(key))out.set(key,[]);
  out.get(key)!.push({pos:r.pos});
 }
 return out;
};
const historicalRoots=(roots:RootRef[])=>{
 const out=new Map<string,{pos:Point;event:string}[]>();
 for(const r of roots){
  if(r.oldCells.length!==3)continue;
  const k=r.sourceId+'|'+geom(r.oldCells);
  if(!out.has(k))out.set(k,[]);
  out.get(k)!.push({pos:pos(r.oldCells),
   event:[r.date,r.oldTurn,r.jurisdiction,r.head].join('|')});
 }
 return out;
};
const evidence=(now:Point,records:{pos:Point}[])=>{
 let far=0,maxDist=0;
 for(const r of records){
  maxDist=Math.max(maxDist,dist(now,r.pos));
  if(Math.abs(now.row-r.pos.row)>=2)far=1;
 }
 return {far,maxDist};
};
const compareScore=(a:number[],b:number[])=>{
 for(let k=0;k<a.length;k++)if(a[k]!==b[k])return b[k]-a[k];return 0;
};
const compare=(a:Route,b:Route)=>compareScore(a.score,b.score)||
 sources.indexOf(a.source)-sources.indexOf(b.source)||
 a.pos.row-b.pos.row||a.pos.col-b.pos.col||a.key.localeCompare(b.key);
export type ShapeCut={date:string;turn:Turno;period:string;
 selected:{family:string;source:string;className:string;zone:string;
  row:number;shape:string;score:number[];rootCount:number;
  sameShapeSourceFamilies:number;scoreTieFamilies:number}[];
 winningPhysical:{family:string;win:boolean;representativeRank:number|null;
  bestSource:string;bestClass:string;bestZone:string;bestShape:string;
  bestScore:number[];scoreCompareToThird:'superior'|'igual'|'inferior';
  routeCount:number;availableClasses:string[];firstLossFactor:string|null;sharesTopShape:boolean;
  sharesTopShapeAndSource:boolean}[];
 physicalRoutes:number;physicalFamilies:number;shapesAvailable:number;
 thirdScoreTiedFamilies:number;firstScoreTiedFamilies:number;
 ablation:Record<Ablation,{families:string[];headHits:number;doubleDiagonal:number}>;
 sourceWitnesses:Record<string,number>;zoneWitnesses:Record<string,number>;
 routeClasses:Record<string,number>;familyClasses:Record<string,number>};
export function inspectShapeCut(date:string,turn:Turno,pre:DailySheet,
 historical:LaloHistorical[],view:LaloView,geo:ShadowSelection,
 winners:string[],period:string):ShapeCut{
 const d1=historical.find(x=>x.period==='D−1');
 const d7=historical.find(x=>x.period==='D−7');
 const prev1=d1?referents(d1.sheet,turn):new Map<string,Reference[]>();
 const prev7=d7?referents(d7.sheet,turn):new Map<string,Reference[]>();
 const roots=historicalRoots(view.roots);
 const pool:Route[]=physical(pre,turn).map(x=>{
  const key=groupKey(x),a=evidence(x.pos,prev1.get(key)||[]),
   b=evidence(x.pos,prev7.get(key)||[]);
  const rootList=roots.get(key)||[];
  const c=evidence(x.pos,rootList);
  const events=new Set(rootList.map(r=>r.event)).size;
  return {...x,score:[a.far,a.maxDist,b.far,b.maxDist,c.far,c.maxDist,events],
   rootCount:events};
 }).sort(compare);
 const familyFirst=new Map<string,Route>();
 for(const r of pool)if(!familyFirst.has(r.family))familyFirst.set(r.family,r);
 const reps=[...familyFirst.values()];
 if(geo.availableFamilies!==reps.length||geo.routes!==pool.length)
  throw Error('Cantidad de caminos/familias no coincide con el motor');
 for(let k=0;k<geo.top.length;k++){
  const r=reps[k],expected=geo.top[k];
  if(!r||r.family!==expected.family||r.source!==expected.source||
   r.cells.join('>')!==expected.cells.join('>'))
   throw Error('Orden F_D1 no reproducido: '+date+' '+turn+' puesto '+(k+1));
 }
 const scoreFor=(p:Route,mode:Ablation):number[]=>{
  if(mode==='SIN_MAX_DISTANCIA_AYER')return p.score.filter((_,i)=>i!==1);
  if(mode==='SIN_REFERENCIA_AYER')return p.score.slice(2);
  if(mode==='TOPE_DISTANCIA_AYER_2')return p.score.map((v,i)=>i===1?Math.min(v,2):v);
  return p.score;
 };
 const ablation={} as ShapeCut['ablation'];
 for(const mode of ablations){
  const ranked=[...pool].sort((a,b)=>compareScore(scoreFor(a,mode),scoreFor(b,mode))||
   sources.indexOf(a.source)-sources.indexOf(b.source)||
   a.pos.row-b.pos.row||a.pos.col-b.pos.col||a.key.localeCompare(b.key));
  const chosen:Route[]=[],seen=new Set<string>();
  for(const q of ranked){
   if(seen.has(q.family))continue;
   seen.add(q.family);
   chosen.push(q);
   if(chosen.length===3)break;
  }
  if(chosen.length!==3)throw Error('Selección de menos de tres familias');
  ablation[mode]={families:chosen.map(q=>q.family),
   headHits:winners.filter(f=>chosen.some(q=>q.family===f)).length,
   doubleDiagonal:chosen.filter(q=>q.className==='dos diagonales').length};
 }
 if(ablation.ORIGINAL.families.join('|')!==geo.top.slice(0,3).map(p=>p.family).join('|'))
  throw Error('Baseline de ablación se apartó del motor');
 const third=reps[2],first=reps[0];
 if(!third||!first)throw Error('Menos de tres familias físicas');
 const classTop=new Set(reps.slice(0,3).map(r=>r.shape));
 const classTopWithSource=new Set(reps.slice(0,3).map(r=>groupKey(r)));
 const selected=reps.slice(0,3).map(r=>({
  family:r.family,source:r.source,className:r.className,zone:r.zone,row:r.pos.row+1,
  shape:r.shape,score:r.score,rootCount:r.rootCount,
  sameShapeSourceFamilies:new Set(pool.filter(p=>groupKey(p)===groupKey(r)).map(p=>p.family)).size,
  scoreTieFamilies:reps.filter(p=>compareScore(p.score,r.score)===0).length
 }));
 const lossNames=['desplazamiento de dos filas respecto de ayer',
  'distancia máxima de la forma respecto de ayer',
  'desplazamiento de dos filas respecto de la semana anterior',
  'distancia máxima respecto de la semana anterior',
  'desplazamiento de dos filas respecto de raíces ganadoras',
  'distancia máxima respecto de raíces ganadoras',
  'cantidad de cabezas históricas independientes'];
 const winnersPhysical=winners.filter(f=>familyFirst.has(f)).map(f=>{
  const p=familyFirst.get(f)!,all=pool.filter(q=>q.family===f);
  const idx=reps.findIndex(q=>q.family===f),scoreComparison=compareScore(p.score,third.score);
  return {family:f,win:idx<3,representativeRank:idx<10?idx+1:null,
   bestSource:p.source,bestClass:p.className,bestZone:p.zone,bestShape:p.shape,
   bestScore:p.score,
   scoreCompareToThird:(scoreComparison<0?'superior':scoreComparison>0?'inferior':'igual') as
    'superior'|'inferior'|'igual',
   routeCount:all.length,availableClasses:[...new Set(all.map(q=>q.className))],
   firstLossFactor:scoreComparison>0?
    lossNames[p.score.findIndex((value,i)=>value!==third.score[i])]||'sin identificar':null,
   sharesTopShape:all.some(q=>classTop.has(q.shape)),
   sharesTopShapeAndSource:all.some(q=>classTopWithSource.has(groupKey(q)))};
 });
 return {date,turn,period,selected,ablation,winningPhysical:winnersPhysical,physicalRoutes:pool.length,
  physicalFamilies:reps.length,
  shapesAvailable:new Set(pool.map(p=>p.shape)).size,
  thirdScoreTiedFamilies:reps.filter(p=>compareScore(p.score,third.score)===0).length,
  firstScoreTiedFamilies:reps.filter(p=>compareScore(p.score,first.score)===0).length,
  sourceWitnesses:Object.fromEntries(sources.map(s=>[s,pool.filter(p=>p.source===s).length])),
  zoneWitnesses:Object.fromEntries(['superior','central','inferior']
   .map(z=>[z,pool.filter(p=>p.zone===z).length])),
  routeClasses:Object.fromEntries([...new Set(pool.map(p=>p.className))]
   .map(cls=>[cls,pool.filter(p=>p.className===cls).length])),
  familyClasses:Object.fromEntries([...new Set(pool.map(p=>p.className))]
   .map(cls=>[cls,new Set(pool.filter(p=>p.className===cls).map(p=>p.family)).size]))};
}
export function shapeReport(cuts:ShapeCut[]){
 const periods=[...new Set(cuts.map(c=>c.period))];
 const allGroups=[['TOTAL',cuts] as [string,ShapeCut[]],
  ...periods.map(p=>[p,cuts.filter(c=>c.period===p)] as [string,ShapeCut[]])];
 const summary=Object.fromEntries(allGroups.map(([label,subset])=>{
  const winners=subset.flatMap(c=>c.winningPhysical),
   selected=subset.flatMap(c=>c.selected),
   count=(items:object[],key:string)=>Object.fromEntries(
    [...new Set(items.map(x=>(x as any)[key]))].sort().map(k=>[k,items.filter(x=>(x as any)[key]===k).length]));
  const winTop=winners.filter(w=>w.win),miss=winners.filter(w=>!w.win);
  const byShape=Object.fromEntries([...new Set(subset.flatMap(r=>Object.keys(r.routeClasses)))].sort()
   .map(cls=>[cls,{selected:selected.filter(s=>s.className===cls).length,
    winningSelected:subset.reduce((n,c)=>n+c.selected.filter(s=>s.className===cls&&
     c.winningPhysical.some(w=>w.family===s.family&&w.win)).length,0),
    physicalWinningBest:winners.filter(w=>w.bestClass===cls).length,
    availableRouteDenominator:subset.reduce((n,c)=>n+(c.routeClasses[cls]||0),0),
    availableFamilyDenominator:subset.reduce((n,c)=>n+(c.familyClasses[cls]||0),0)}]));
  return [label,{
   days:new Set(subset.map(c=>c.date)).size,cuts:subset.length,
   selectedSlots:selected.length,physicalWinningFamilies:winners.length,
   winningTop3:winTop.length,physicalMisses:miss.length,
   top3Source:count(selected,'source'),
   top3Zone:count(selected,'zone'),
   winningBestSource:count(winners,'bestSource'),
   winningBestZone:count(winners,'bestZone'),
   byShape,
   missedByScore:count(miss,'scoreCompareToThird'),
   missedByFirstPriorityFactor:count(miss.filter(w=>w.firstLossFactor!==null),'firstLossFactor'),
   missedSharingTopShape:miss.filter(w=>w.sharesTopShape).length,
   missedSharingTopShapeSource:miss.filter(w=>w.sharesTopShapeAndSource).length,
   meanTiesAtThird:subset.reduce((n,c)=>n+c.thirdScoreTiedFamilies,0)/Math.max(1,subset.length),
   medianTiesAtThird:[...subset.map(c=>c.thirdScoreTiedFamilies)]
    .sort((a,b)=>a-b)[Math.floor(subset.length/2)]||0,
   thirdWithTwoOrMoreTied:subset.filter(c=>c.thirdScoreTiedFamilies>1).length,
   thirdWithTenOrMoreTied:subset.filter(c=>c.thirdScoreTiedFamilies>=10).length,
   highScoreMissExamples:subset.flatMap(c=>c.winningPhysical.filter(w=>
    !w.win&&w.scoreCompareToThird==='igual').map(w=>({
     date:c.date,turn:c.turn,family:w.family,source:w.bestSource,
     shape:w.bestClass,region:w.bestZone,rank:w.representativeRank
    }))).slice(0,20)
  }];
 }));
 const ablationSummary=Object.fromEntries(allGroups.map(([period,subset])=>[
  period,Object.fromEntries(ablations.map(method=>{
   const originalHits=subset.reduce((n,c)=>n+c.ablation.ORIGINAL.headHits,0);
   return [method,{
    cuts:subset.length,
    hits:subset.reduce((n,c)=>n+c.ablation[method].headHits,0),
    top3Changed:subset.filter(c=>c.ablation[method].families.some(f=>
     !c.ablation.ORIGINAL.families.includes(f))).length,
    doubleDiagonalSlots:subset.reduce((n,c)=>n+c.ablation[method].doubleDiagonal,0),
    gained:subset.filter(c=>c.ablation[method].headHits>c.ablation.ORIGINAL.headHits)
     .map(c=>({date:c.date,turn:c.turn,
      before:c.ablation.ORIGINAL.families,after:c.ablation[method].families,
      won:c.winningPhysical.filter(w=>c.ablation[method].families.includes(w.family)&&
       !c.ablation.ORIGINAL.families.includes(w.family)).map(w=>w.family)})),
    lost:subset.filter(c=>c.ablation[method].headHits<c.ablation.ORIGINAL.headHits)
     .map(c=>({date:c.date,turn:c.turn,
      before:c.ablation.ORIGINAL.families,after:c.ablation[method].families,
      lost:c.winningPhysical.filter(w=>!c.ablation[method].families.includes(w.family)&&
       c.ablation.ORIGINAL.families.includes(w.family)).map(w=>w.family)}))
   }];
  }))]
 ]));
 return {ablations:ablationSummary,note:'Familias físicas ganadoras consideradas una vez por cabeza y corte. Las distintas formas posibles de una familia NO son confirmaciones independientes. El empate de score se resuelve por orden de fuente y casillas.',
  summary,cuts};
}
