// Ensayo exploratorio de puntuación RELATIVA entre formas y posiciones.
// Se normaliza usando SOLO los caminos físicos disponibles en el PRE actual.
// No se usan resultados futuros, fechas posteriores ni parámetros calibrados.
// No modifica src/vt3Shadow.ts ni Modelo Lalo.
export type NormalMode='ORIGINAL'|'MISMA_FUENTE_FORMA'|'MISMA_FUENTE_POSICION'|'COMBINADO';
export const NORMAL_MODES:NormalMode[]=[
 'ORIGINAL','MISMA_FUENTE_FORMA','MISMA_FUENTE_POSICION','COMBINADO'
];
export type NormalRoute={
 source:string;shape:string;family:string;cells:string[];
 pos:{row:number;col:number};score:number[];className:string;rootCount:number;key:string
};
const scoreCompare=(a:number[],b:number[])=>{
 for(let i=0;i<Math.max(a.length,b.length);i++){
  const d=(b[i]||0)-(a[i]||0);
  if(d)return d;
 }
 return 0;
};
const sourceOrder=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const sourceIndex=(s:string)=>sourceOrder.indexOf(s);
const originalCompare=(a:NormalRoute,b:NormalRoute)=>
 scoreCompare(a.score,b.score)||sourceIndex(a.source)-sourceIndex(b.source)||
 a.pos.row-b.pos.row||a.pos.col-b.pos.col||a.key.localeCompare(b.key);
// Empate verdadero recibe rango central, evita que una forma con un solo camino
// gane por tener estrato mínimo. No asigna premios a figuras particulares.
function rankWithin(route:NormalRoute,group:NormalRoute[]):number{
 const n=group.length;
 if(!n)throw Error('Estrato sin caminos');
 const ahead=group.filter(x=>scoreCompare(x.score,route.score)<0).length;
 const equal=group.filter(x=>scoreCompare(x.score,route.score)===0).length;
 return (n-ahead-equal/2)/n;
}
export function normalizeCut(
 paths:NormalRoute[],originalTop:string[],winners:string[],date:string,turn:string
){
 const byShape=new Map<string,NormalRoute[]>(),byPlace=new Map<string,NormalRoute[]>();
 const keyShape=(r:NormalRoute)=>r.source+'|'+r.shape;
 const keyPlace=(r:NormalRoute)=>r.source+'|'+r.pos.row+'|'+r.pos.col;
 for(const r of paths){
  const ks=keyShape(r),kp=keyPlace(r);
  if(!byShape.has(ks))byShape.set(ks,[]);
  if(!byPlace.has(kp))byPlace.set(kp,[]);
  byShape.get(ks)!.push(r);byPlace.get(kp)!.push(r);
 }
 const scored=paths.map(p=>{
  const gs=byShape.get(keyShape(p))!,gp=byPlace.get(keyPlace(p))!;
  const pctShape=rankWithin(p,gs),pctPlace=rankWithin(p,gp);
  return {path:p,pctShape,pctPlace,shapePool:gs.length,placePool:gp.length};
 });
 const choose=(mode:NormalMode)=>{
  const scoreOf=(r:typeof scored[number])=>mode==='MISMA_FUENTE_FORMA'?r.pctShape:
   mode==='MISMA_FUENTE_POSICION'?r.pctPlace:
   (r.pctShape+r.pctPlace)/2;
  const ranking=[...scored].sort((a,b)=>
   (mode==='ORIGINAL'?0:scoreOf(b)-scoreOf(a))||
   originalCompare(a.path,b.path));
  const selection:typeof scored=[];
  const seen=new Set<string>();
  for(const item of ranking){
   if(seen.has(item.path.family))continue;
   seen.add(item.path.family);selection.push(item);
   if(selection.length===3)break;
  }
  if(selection.length!==3||new Set(selection.map(p=>p.path.family)).size!==3)
   throw Error('No se pudieron elegir tres familias físicas únicas');
  return selection;
 };
 const all=Object.fromEntries(NORMAL_MODES.map(mode=>[mode,choose(mode)]))
  as Record<NormalMode,ReturnType<typeof choose>>;
 const orig=all.ORIGINAL.map(p=>p.path.family);
 if(orig.join('|')!==originalTop.join('|'))
  throw Error('Control Top3 cambió el orden original '+date+' '+turn);
 const results=Object.fromEntries(NORMAL_MODES.map(mode=>{
  const selected=all[mode];
  const families=selected.map(s=>s.path.family);
  return [mode,{
   families,headHits:winners.filter(x=>families.includes(x)).length,
   ddRepresentatives:selected.filter(x=>x.path.className==='dos diagonales').length,
   ddAlternativeFamilies:selected.filter(s=>paths.some(x=>x.family===s.path.family&&
    x.className==='dos diagonales')).length,
   sourceCounts:Object.fromEntries(sourceOrder.map(s=>[s,selected.filter(x=>x.path.source===s).length])),
   items:selected.map(x=>({family:x.path.family,source:x.path.source,
    className:x.path.className,cells:x.path.cells,score:x.path.score,
    percentileShape:x.pctShape,percentilePosition:x.pctPlace,
    sourceShapePool:x.shapePool,sourcePositionPool:x.placePool,
    linkedHistoricShapeEvents:x.path.rootCount}))
  }];
 })) as Record<NormalMode,{
  families:string[];headHits:number;ddRepresentatives:number;
  ddAlternativeFamilies:number;sourceCounts:Record<string,number>;
  items:{family:string;source:string;className:string;cells:string[];score:number[];
   percentileShape:number;percentilePosition:number;
   sourceShapePool:number;sourcePositionPool:number;linkedHistoricShapeEvents:number}[]
 }>;
 return {date,turn,results,strata:{
  paths:paths.length,shapeStrata:byShape.size,positionStrata:byPlace.size,
  singletonShapeGroups:[...byShape.values()].filter(g=>g.length===1).length,
  singletonPositionGroups:[...byPlace.values()].filter(g=>g.length===1).length,
  meanShapeGroupSize:paths.reduce((s,p)=>s+byShape.get(keyShape(p))!.length,0)/paths.length,
  meanPositionGroupSize:paths.reduce((s,p)=>s+byPlace.get(keyPlace(p))!.length,0)/paths.length
 }};
}
export type NormalCut=ReturnType<typeof normalizeCut>&{period:string;headFamilies:string[]};
export function summarizeNormalization(cuts:NormalCut[]){
 const periods=[...new Set(cuts.map(c=>c.period))];
 const groups=[['TOTAL',cuts] as [string,NormalCut[]],
  ...periods.map(p=>[p,cuts.filter(x=>x.period===p)] as [string,NormalCut[]])];
 const summarize=(slice:NormalCut[])=>{
  const original=slice.reduce((s,c)=>s+c.results.ORIGINAL.headHits,0);
  const strategies=Object.fromEntries(NORMAL_MODES.map(mode=>{
   const rows=slice.map(c=>({c,sel:c.results[mode],baseline:c.results.ORIGINAL}));
   const won=rows.filter(r=>r.sel.headHits>r.baseline.headHits);
   const lost=rows.filter(r=>r.sel.headHits<r.baseline.headHits);
   return [mode,{
    cuts:slice.length,hits:rows.reduce((s,r)=>s+r.sel.headHits,0),
    originalHits:original,
    changedTop3:rows.filter(r=>r.sel.families.some(f=>!r.baseline.families.includes(f))).length,
    exactSameThree:rows.filter(r=>r.sel.families.join('|')===r.baseline.families.join('|')).length,
    doubleDiagonalRepresentatives:rows.reduce((s,r)=>s+r.sel.ddRepresentatives,0),
    doubleDiagonalAvailableAmongTop3Families:rows.reduce((s,r)=>s+r.sel.ddAlternativeFamilies,0),
    sources:Object.fromEntries(sourceOrder.map(src=>[src,
     rows.reduce((n,r)=>n+(r.sel.sourceCounts[src]||0),0)])),
    gained:won.map(r=>({
     date:r.c.date,turn:r.c.turn,extra:r.sel.headHits-r.baseline.headHits,
     entering:r.sel.families.filter(f=>!r.baseline.families.includes(f)),
     won:r.c.headFamilies.filter(f=>r.sel.families.includes(f)&&!r.baseline.families.includes(f))})),
    lost:lost.map(r=>({
     date:r.c.date,turn:r.c.turn,lost:r.baseline.headHits-r.sel.headHits,
     exiting:r.baseline.families.filter(f=>!r.sel.families.includes(f)),
     lostFamilies:r.c.headFamilies.filter(f=>r.baseline.families.includes(f)&&!r.sel.families.includes(f))}))
   }];
  }));
  return {days:new Set(slice.map(c=>c.date)).size,cuts:slice.length,strategies,
   structure:{
    meanSourceShapePool:slice.reduce((n,c)=>n+c.strata.meanShapeGroupSize,0)/Math.max(1,slice.length),
    meanSourcePositionPool:slice.reduce((n,c)=>n+c.strata.meanPositionGroupSize,0)/Math.max(1,slice.length),
    singletonShapeStrata:slice.reduce((n,c)=>n+c.strata.singletonShapeGroups,0),
    singletonPositionStrata:slice.reduce((n,c)=>n+c.strata.singletonPositionGroups,0)
   }};
 };
 return {summary:Object.fromEntries(groups.map(([name,cs])=>[name,summarize(cs)])),
  cuts,methodology:'Percentiles de puntaje calculados solo entre rutas físicas disponibles en PRE dentro de misma fuente y forma o misma fuente y posición mínima; rango central para empates, desempate original. Variantes post hoc NO son pronósticos sellados.'};
}
