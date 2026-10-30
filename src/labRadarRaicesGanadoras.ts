/**
 * Evidencia REAL de una figura: cabezas históricas efectivamente formables.
 * Los testimonios son eventos distintos (fecha+turno+jurisdicción+cabeza),
 * NO caminos multiplicados de la misma cabeza.
 * Se usa antes del sorteo objetivo, nunca para fabricar aciertos del futuro.
 */
import type {DailySheet} from './sheet';
import {TURNOS} from './domain';
import type {Figure,Kind,Point} from './labRadarFiguras';
import {silhouette} from './labRadarFiguras';
export type Root={
 event:string;date:string;turn:string;head:string;jur:string;
 kind:Kind;source:string;site:string;shape:string;cells:Point[]
};
const site=(p:Point[])=>[p.map(x=>x.row+':'+x.col).join('>'),
 [...p].reverse().map(x=>x.row+':'+x.col).join('>')].sort()[0];
const neighbors=(a:Point,b:Point)=>
 Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
const sources=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
export function winnerRoots(date:string,sheet:DailySheet):Root[]{
 const seen=new Map<string,Root>();
 for(const turn of TURNOS)for(const m of sheet.matches[turn]||[]){
  if(m.jurisdiccion==='Montevideo'||!/^\d{4,5}$/.test(m.cabeza))continue;
  for(const hit of m.hits){
   const n=hit.kind==='vt2'?2:hit.kind==='vt3'?3:4;
   if(m.cabeza.slice(-n)!==hit.value)continue;
   const col=sheet.columns.find(c=>c.id===hit.sourceId);
   if(!col)continue;
   for(const p of hit.paths){
    const cells=p.map(c=>({row:c.row,col:c.col}));
    if(cells.length!==n||new Set(cells.map(x=>x.row+':'+x.col)).size!==n||
     cells.some((x,i)=>col.values[x.row]?.[x.col]!==p[i].digit||
      (i>0&&!neighbors(cells[i-1],x))))continue;
    const event=[date,turn,m.jurisdiccion,m.cabeza].join('|');
    const id=event+'|'+hit.kind+'|'+hit.sourceId+'|'+site(cells);
    if(!seen.has(id))seen.set(id,{event,date,turn,
     head:m.cabeza,jur:m.jurisdiccion,
     kind:hit.kind.toUpperCase() as Kind,source:hit.sourceId,
     site:site(cells),shape:silhouette(cells),cells});
   }
  }
 }
 return [...seen.values()];
}
export type Evidence={
 figureId:string;winnerEvents:number;winnerDays:number;
 exactEvents:number;oneRowEvents:number;sourceNeighborEvents:number;
 sameSilhouetteFarEvents:number;
 independentEvents:{date:string;turn:string;jur:string;head:string;
  contact:'MISMO_SITIO'|'MUEVE_UNA_FILA'|'FUENTE_VECINA'|'SOLO_SILUETA'}[]
};
export function evidenceForFigure(now:Figure,history:Root[]):Evidence{
 const related=now.board==='PLUS11'?history.filter(x=>x.kind===now.kind&&x.shape===now.shape):[];
 const m=new Map<string,Evidence['independentEvents'][number]>();
 const diff=(a:string,b:string)=>Math.abs(sources.indexOf(a)-sources.indexOf(b))===1&&
  sources.includes(a)&&sources.includes(b);
 const anchor=(p:Point[])=>Math.min(...p.map(x=>x.row));
 for(const root of related){
  let contact:Evidence['independentEvents'][number]['contact']='SOLO_SILUETA';
  if(root.source===now.source&&root.site===now.site)
   contact='MISMO_SITIO';
  else if(root.source===now.source&&
   Math.abs(anchor(root.cells)-anchor(now.cells))===1)
   contact='MUEVE_UNA_FILA';
  else if(now.board==='PLUS11'&&diff(root.source,now.source)&&
    root.site===now.site)contact='FUENTE_VECINA';
  const old=m.get(root.event);
  const importance={MISMO_SITIO:4,MUEVE_UNA_FILA:3,
   FUENTE_VECINA:2,SOLO_SILUETA:1};
  if(!old||importance[contact]>importance[old.contact])
   m.set(root.event,{date:root.date,turn:root.turn,jur:root.jur,
    head:root.head,contact});
 }
 const events=[...m.values()];
 return {figureId:now.id,winnerEvents:events.length,
  winnerDays:new Set(events.map(x=>x.date)).size,
  exactEvents:events.filter(x=>x.contact==='MISMO_SITIO').length,
  oneRowEvents:events.filter(x=>x.contact==='MUEVE_UNA_FILA').length,
  sourceNeighborEvents:events.filter(x=>x.contact==='FUENTE_VECINA').length,
  sameSilhouetteFarEvents:events.filter(x=>x.contact==='SOLO_SILUETA').length,
  independentEvents:events};
}
export function strongestEvidence(figure:Figure,history:Root[]){
 const e=evidenceForFigure(figure,history);
 return e.exactEvents>=2&&e.winnerDays>=2?'HUELLA_REITERADA':
  e.exactEvents>=1?'ANTECEDENTE_EN_MISMO_SITIO':
  e.oneRowEvents>=2&&e.winnerDays>=2?'FORMA_MOVIENDOSE':
  e.sourceNeighborEvents>=2&&e.winnerDays>=2?'FORMA_ENTRE_FUENTES':
  'SOLO_DISPONIBLE_O_SIN_RESPALDO_CERCANO';
}
