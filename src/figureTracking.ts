/**
 * Seguimiento observacional VT3. No altera rankings ni selecciona apuestas.
 * El tablero del objetivo se toma desde el PRE del turno: no lee cabeza objetivo.
 * Los antecedentes solo cuentan si una cabeza HISTÓRICA publicada generó
 * una marca física legal, nunca por forma geométrica abstracta del tablero.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';
import {allPhysicalVt3} from './vt3Shadow';
import {preSheetAtCut} from './infoCandidatos';
import {reversibleFamily} from './motorLalo';
import type {LaloView} from './motorLalo';
import type {InfoVisualDay} from './infoTurnHistory';
import type {AuxiliarView} from './motorLaloAuxiliar';
import type {AuxiliaryHeads,AuxSourceTurn} from './auxSantiagoNeuquen';
import {auxiliaryBoard,findAuxPaths} from './auxSantiagoNeuquen';
import {auxAtCut} from './auxTemporalModes';
import type {AuxMode} from './auxTemporalModes';

export const TRACK_SOURCES:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
export type FigureRoute={
 source:SourceId;digits:string;shape:string;anchor:number;
 cells:{row:number;col:number;digit:string}[];
};
export type FigureAntecedent=FigureRoute&{
 date:string;turn:Turno;jurisdiction:string;head:string;
 daysAgo:number;relation:'MISMA_FUENTE'|'VECINA'|'OTRA_FUENTE';
 verticalShift:number;sourceShift:number;currentRoute:FigureRoute;
};
export type AuxFigureStatus={
 available:boolean;rankingAvailable:boolean;formable:boolean;pathCount:number;
 recognized:boolean;rank:number|null;top3:boolean;top10:boolean;
 sourceTurns:AuxSourceTurn[];
};
export type FigureRecord={
 family:string;current:FigureRoute[];antecedents:FigureAntecedent[];
 recognized:boolean;rank:number|null;top3:boolean;top10:boolean;
 auxYesterday:AuxFigureStatus;auxToday:AuxFigureStatus;
};
export type FigureTracking={
 date:string;turn:Turno;days:string[];records:FigureRecord[];
 physicallyFormable:number;withoutRecognition:number;
 withWitness:number;unrecognizedWithWitness:number;
};
export type TrackingAuxInput={heads:AuxiliaryHeads|null;view:AuxiliarView|null;mode:AuxMode};
const coord=(c:{row:number;col:number})=>c.row+':'+c.col;
const anchor=(path:Path)=>Math.min(...path.map(p=>p.row));
/** Orientaciones inversas comparten forma, pero no crean familias distintas. */
export function shapeOf(path:Path):string{
 const minRow=anchor(path),minCol=Math.min(...path.map(p=>p.col));
 const points=path.map(c=>(c.row-minRow)+':'+(c.col-minCol));
 return [points.join('>'),[...points].reverse().join('>')].sort()[0];
}
const uniquePath=(source:SourceId,path:Path)=>
 source+'|'+[path.map(coord).join('>'),[...path].reverse().map(coord).join('>')].sort()[0];
function physicalRoutes(sheet:DailySheet,target:Turno):Map<string,FigureRoute[]>{
 const index=TURNOS.indexOf(target);
 if(index<0)throw Error('Turno desconocido');
 const families=new Map<string,FigureRoute[]>();
 for(const column of sheet.columns.slice(0,index+1)){
  const used=new Set<string>();
  for(const path of allPhysicalVt3(column.values)){
   const key=uniquePath(column.id,path);
   if(used.has(key))continue;used.add(key);
   const digits=path.map(c=>c.digit).join(''),family=reversibleFamily(digits);
   const route={source:column.id,digits,shape:shapeOf(path),
    anchor:anchor(path),cells:path.map(c=>({...c}))};
   const list=families.get(family)||[];
   list.push(route);families.set(family,list);
  }
 }
 return families;
}
type HistoricRoot=FigureRoute&{
 date:string;turn:Turno;jurisdiction:string;head:string;
};
function historicRoots(date:string,days:InfoVisualDay[]):{dates:string[];roots:HistoricRoot[]}{
 const dates=[...new Map(days.filter(d=>d.date<date).map(d=>[d.date,d])).values()]
  .sort((a,b)=>a.date.localeCompare(b.date)).slice(-7);
 const roots:HistoricRoot[]=[],used=new Set<string>();
 for(const day of dates){
  for(const turn of TURNOS)for(const mark of day.sheet.matches[turn]||[]){
   // Las raíces oficiales +11 no cuentan coincidencias de Montevideo.
   if(mark.jurisdiccion==='Montevideo'||!/^\d{4}$/.test(mark.cabeza))continue;
   for(const hit of mark.hits){
    if(hit.kind!=='vt3'||!mark.cabeza.endsWith(hit.value))continue;
    const col=day.sheet.columns.find(c=>c.id===hit.sourceId);
    if(!col)continue;
    for(const p of hit.paths){
     if(p.length!==3||p.map(c=>c.digit).join('')!==hit.value||
      p.some(c=>col.values[c.row]?.[c.col]!==c.digit))continue;
     const key=[day.date,turn,mark.jurisdiccion,mark.cabeza,
      uniquePath(hit.sourceId,p)].join('|');
     if(used.has(key))continue;used.add(key);
     roots.push({date:day.date,turn,jurisdiction:mark.jurisdiccion,
      head:mark.cabeza,source:hit.sourceId,digits:hit.value,
      shape:shapeOf(p),anchor:anchor(p),cells:p.map(c=>({...c}))});
    }
   }
  }
 }
 return {dates:dates.map(d=>d.date),roots};
}
const emptyAux=():AuxFigureStatus=>({
 available:false,rankingAvailable:false,formable:false,pathCount:0,recognized:false,
 rank:null,top3:false,top10:false,sourceTurns:[]
});
function auxPresence(family:string,target:Turno,input?:TrackingAuxInput):AuxFigureStatus{
 if(!input?.heads)return emptyAux();
 const pre=auxAtCut(input.heads,target,input.mode);
 const board=auxiliaryBoard(pre,target);
 const members=[...new Set(family.split('/'))];
 const paths=members.flatMap(v=>findAuxPaths(board,v));
 const ranked=input.view?.ranks[3]?.find(x=>x.family===family);
 return {available:true,rankingAvailable:!!input.view,formable:paths.length>0,pathCount:paths.length,
  recognized:!!ranked,rank:ranked?.rank??null,top3:!!ranked&&ranked.rank<=3,
  top10:!!ranked&&ranked.rank<=10,
  sourceTurns:[...new Set(paths.flatMap(p=>p.map(c=>c.source)))]};
}
/**
 * No evalúa resultados del turno objetivo, aunque el caller le entregue
 * una hoja histórica completa: preSheetAtCut oculta esas marcas y columnas.
 */
export function buildFigureTracking(
 date:string,target:Turno,sheet:DailySheet,
 days:InfoVisualDay[],model:LaloView|null,
 yesterday?:TrackingAuxInput,today?:TrackingAuxInput
):FigureTracking{
 const cut=preSheetAtCut(sheet,target,TURNOS.indexOf(target));
 const current=physicalRoutes(cut,target);
 const history=historicRoots(date,days);
 // La comparación necesita sólo fuentes y anclas visibles; nunca
 // modifica los objetos de la hoja ni de los Tops independientes.
 const ranks=new Map(model?.ranks.vt3.map(f=>[f.family,f.rank])||[]);
 const results:FigureRecord[]=[];
 for(const [family,paths] of current){
  const matches=new Map<string,FigureAntecedent>();
  for(const p of paths)for(const old of history.roots){
   if(old.shape!==p.shape||Math.abs(p.anchor-old.anchor)>2)continue;
   const ds=TRACK_SOURCES.indexOf(p.source)-TRACK_SOURCES.indexOf(old.source);
   const relation=ds===0?'MISMA_FUENTE':Math.abs(ds)===1?'VECINA':'OTRA_FUENTE';
   // La fecha posterior siempre es la foto actual; no se simula
   // un recorrido transversal entre columnas dentro de la hoja +11.
   const key=[old.date,old.turn,old.jurisdiction,old.head,
    old.source,p.source,old.shape].join('|');
   if(!matches.has(key))matches.set(key,{...old,
    daysAgo:history.dates.length-history.dates.indexOf(old.date),
    relation,verticalShift:p.anchor-old.anchor,sourceShift:ds,
    currentRoute:{...p,cells:p.cells.map(c=>({...c}))}});
  }
  const evidence=[...matches.values()].sort((a,b)=>
   b.date.localeCompare(a.date)||
   (a.relation==='MISMA_FUENTE'?0:a.relation==='VECINA'?1:2)-
   (b.relation==='MISMA_FUENTE'?0:b.relation==='VECINA'?1:2));
  const rank=ranks.get(family)??null;
  results.push({family,current:paths,antecedents:evidence,
   recognized:rank!==null,rank,top3:rank!==null&&rank<=3,
   top10:rank!==null&&rank<=10,
   auxYesterday:auxPresence(family,target,yesterday),
   auxToday:auxPresence(family,target,today)});
 }
 // Orden de lectura explicativo, no ranking de predicción. Primero
 // familias sin reconocimiento pero con una marca ganadora anterior.
 results.sort((a,b)=>
  Number(!b.recognized&&b.antecedents.length>0)-
   Number(!a.recognized&&a.antecedents.length>0)||
  Number(b.recognized)-Number(a.recognized)||
  a.family.localeCompare(b.family));
 return {date,turn:target,days:history.dates,records:results,
  physicallyFormable:results.length,
  withoutRecognition:results.filter(r=>!r.recognized).length,
  withWitness:results.filter(r=>r.antecedents.length>0).length,
  unrecognizedWithWitness:results.filter(r=>!r.recognized&&r.antecedents.length>0).length};
}
