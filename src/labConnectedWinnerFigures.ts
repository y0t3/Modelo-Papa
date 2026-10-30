/**
 * LAB: intersecciones y zonas entre FIGURAS ganadoras de D−7.
 * La cifra antigua solo valida que la figura marcó una cabeza pasada.
 * Las cifras PRE actuales NO intervienen en formar ni priorizar componentes.
 * En +11 los recorridos permanecen dentro de UNA fuente, aunque se comparen
 * figuras de fuentes diferentes como antecedentes (sin cruzar para formar cifras).
 */
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';
import {enumerateFigures,figureKey,evaluateAgainstShapeControl} from './labWinningFootprintTransfer';
import type {Figure,N} from './labWinningFootprintTransfer';
export type PastWindow='NOCTURNO'|'TODOS';
export type PhysicalWitness={event:string;date:string;turn:string;jur:string;head:string};
export type MarkedSite={key:string;source:SourceId;path:Path;witnesses:PhysicalWitness[]};
export type Zone={source:SourceId;sites:MarkedSite[];members:Figure[];
 witnesses:PhysicalWitness[];events:number;positions:number;
 sharedCellPairs:number;touchingPairs:number;cellCount:number;
 rowMin:number;rowMax:number;colMin:number;colMax:number;label:string;
};
const ckey=(c:{row:number;col:number})=>c.row+':'+c.col;
const key=(s:SourceId,p:Path)=>figureKey(s,p);
const sameCell=(a:Path,b:Path)=>a.some(c=>b.some(x=>ckey(x)===ckey(c)));
const touch=(a:Path,b:Path)=>a.some(c=>b.some(x=>
 Math.max(Math.abs(c.row-x.row),Math.abs(c.col-x.col))<=1));
const uniqEvent=(items:PhysicalWitness[])=>[...new Map(items.map(x=>[x.event,x])).values()];
const isValid=(p:Path,n:N,values:string[])=>p.length===n&&
 new Set(p.map(ckey)).size===n&&p.every((c,i)=>
 c.row>=0&&c.row<values.length&&c.col>=0&&c.col<2&&
 values[c.row]?.[c.col]===c.digit&&
 (!i||Math.max(Math.abs(c.row-p[i-1].row),Math.abs(c.col-p[i-1].col))===1));
/** Lee exclusivamente POST HISTÓRICO D−7, nunca POST de jornada objetivo. */
export function historicWinningSites(sheet:DailySheet,date:string,n:N,window:PastWindow){
 const seen=new Map<string,MarkedSite>();
 const turns=window==='NOCTURNO'?['Nocturno']:
  ['Previa','Primera','Matutino','Vespertino','Nocturno'];
 for(const turn of turns)for(const match of sheet.matches[turn]||[]){
  if(match.jurisdiccion==='Montevideo'||!/^[0-9]{4,5}$/.test(match.cabeza))
   continue;
  const suffix=match.cabeza.slice(-n);
  const witness:PhysicalWitness={event:
   [date,turn,match.jurisdiccion,match.cabeza].join('|'),
   date,turn,jur:match.jurisdiccion,head:match.cabeza};
  for(const hit of match.hits){
   if(hit.kind!=='vt'+n||hit.value!==suffix)continue;
   const col=sheet.columns.find(c=>c.id===hit.sourceId);
   if(!col)continue;
   for(const path of hit.paths){
    if(!isValid(path,n,col.values)||path.map(c=>c.digit).join('')!==suffix)
     continue;
    const id=key(col.id,path);
    const prior=seen.get(id)||{key:id,source:col.id,
     path,witnesses:[]};
    if(!prior.witnesses.some(w=>w.event===witness.event))
     prior.witnesses.push(witness);
    seen.set(id,prior);
   }
  }
 }
 return [...seen.values()];
}
export function projectSites(marks:MarkedSite[],available:Figure[]):MarkedSite[]{
 const now=new Map(available.map(x=>[x.key,x]));
 return marks.flatMap(m=>{
  const f=now.get(m.key);
  return f?[{key:f.key,source:f.source,path:f.path,
    witnesses:uniqEvent(m.witnesses)}]:[];
 });
}
export function connectedZones(marks:MarkedSite[],available:Figure[]):Zone[]{
 const active=projectSites(marks,available);
 const groups=new Map<string,MarkedSite[]>();
 for(const s of active){
  const old=groups.get(s.source)||[];old.push(s);groups.set(s.source,old);
 }
 const lookup=new Map(available.map(x=>[x.key,x]));
 const result:Zone[]=[];
 for(const [source,marks] of groups){
  const parent=marks.map((_,i)=>i);
  const root=(i:number):number=>parent[i]===i?i:(parent[i]=root(parent[i]));
  const union=(i:number,j:number)=>{
   const a=root(i),b=root(j);if(a!==b)parent[b]=a;
  };
  for(let i=0;i<marks.length;i++)for(let j=i+1;j<marks.length;j++){
   if(touch(marks[i].path,marks[j].path))union(i,j);
  }
  const comps=new Map<number,MarkedSite[]>();
  marks.forEach((m,i)=>{
   const k=root(i),xs=comps.get(k)||[];xs.push(m);comps.set(k,xs);
  });
  for(const component of comps.values()){
   const witnesses=uniqEvent(component.flatMap(p=>p.witnesses));
   const members=component.map(p=>lookup.get(p.key)!).filter(Boolean);
   const cells=new Set(component.flatMap(p=>p.path.map(ckey)));
   const coords=component.flatMap(p=>p.path),rows=coords.map(c=>c.row),cols=coords.map(c=>c.col);
   let shared=0,neighbor=0;
   for(let i=0;i<component.length;i++)for(let j=i+1;j<component.length;j++){
    if(sameCell(component[i].path,component[j].path))shared++;
    else if(touch(component[i].path,component[j].path))neighbor++;
   }
   const rowMin=Math.min(...rows),rowMax=Math.max(...rows);
   const colMin=Math.min(...cols),colMax=Math.max(...cols);
   result.push({source,sites:component,members,
    witnesses,events:witnesses.length,positions:component.length,
    sharedCellPairs:shared,touchingPairs:neighbor,cellCount:cells.size,
    rowMin,rowMax,colMin,colMax,
    label:source+' · filas '+(rowMin+1)+'–'+(rowMax+1)});
  }
 }
 return result.sort((a,b)=>b.events-a.events||
  a.cellCount-b.cellCount||b.positions-a.positions||
  a.source.localeCompare(b.source)||a.rowMin-b.rowMin);
}
export const byDistinctWinningEvents=(zones:Zone[],n=2)=>
 zones.filter(z=>z.events>=n&&z.positions>=2);
/** Una única zona por foco; no exigir un Top numérico, ni cruzar fuentes. */
export function topFoci(zones:Zone[],count:1|2=2){
 return byDistinctWinningEvents(zones).slice(0,count);
}
export function zoneFigures(zones:Zone[]):Figure[]{
 const m=new Map<string,Figure>();
 for(const z of zones)for(const f of z.members)m.set(f.key,f);
 return [...m.values()];
}
export function evaluateZoneSelection(zones:Zone[],all:Figure[],heads:string[],n:N){
 const selected=zoneFigures(zones);
 return {...evaluateAgainstShapeControl(selected,all,heads,n),
  zones:zones.length,independentOldEvents:
   new Set(zones.flatMap(z=>z.witnesses.map(w=>w.event))).size,
  sharedCellPairs:zones.reduce((sum,z)=>sum+z.sharedCellPairs,0),
  touchingPairs:zones.reduce((sum,z)=>sum+z.touchingPairs,0)};
}
