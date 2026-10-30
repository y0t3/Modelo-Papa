/**
 * Testigos físicos de un tablero, sin transformar cifras en formas ni
 * duplicar una cabeza por sus rutas alternativas.
 * AUX usa solamente eventos PRE históricos de SU MISMA política temporal.
 * PLUS11 usa exclusivamente raíces +11 ya validadas.
 */
import {silhouette} from './labRadarFiguras';
import type {Board,Figure,Kind,Point} from './labRadarFiguras';
import type {AuxiliaryHistorical} from './motorLaloIntegral';
import type {Root} from './labRadarRaicesGanadoras';
export type Witness={
 event:string;date:string;turn:string;head:string;jur:string;
 board:Board;kind:Kind;site:string;shape:string;source:string;
 cells:Point[]
};
const canon=(p:Point[])=>[
 p.map(c=>c.row+':'+c.col).join('>'),
 [...p].reverse().map(c=>c.row+':'+c.col).join('>')].sort()[0];
export function auxiliaryWitnesses(history:AuxiliaryHistorical[],board:Board):Witness[]{
 if(board==='PLUS11')throw Error('Roots PLUS11 deben provenir de PLUS11');
 const found=new Map<string,Witness>();
 for(const record of history){
  for(const kind of [2,3] as const){
   for(const mark of record.aux.events[kind]){
    if(mark.date!==record.date)throw Error('Evento histórico mal fechado');
    for(const path of mark.paths){
     if(path.length!==kind||new Set(path.map(x=>x.row+':'+x.col)).size!==kind)
      throw Error('Raíz auxiliar incompleta o duplicada');
     const cells=path.map(x=>({row:x.row,col:x.col}));
     const site=canon(cells),event=mark.id;
     const key=event+'|'+site;
     if(!found.has(key))found.set(key,{event,date:mark.date,turn:mark.turn,
      head:mark.head,jur:mark.jur,board,kind:('VT'+kind) as Kind,site,
      shape:silhouette(cells),source:'Santiago-Neuquen',cells});
    }
   }
  }
 }
 return [...found.values()];
}
export function plus11Witnesses(roots:Root[]):Witness[]{
 return roots.map(x=>({
  event:x.event,date:x.date,turn:x.turn,head:x.head,jur:x.jur,
  board:'PLUS11' as const,kind:x.kind,source:x.source,
  site:x.site,shape:x.shape,cells:x.cells
 }));
}
export type FigureSupport={
 figureId:string;board:Board;kind:Kind;
 exactEvents:number;exactDays:number;shapeEvents:number;
 exactWitnesses:{date:string;turn:string;jur:string;head:string}[];
};
export function figureSupport(fig:Figure,roots:Witness[],date:string):FigureSupport{
 const related=roots.filter(x=>x.date<=date&&x.board===fig.board&&
  x.kind===fig.kind&&x.source===fig.source&&x.shape===fig.shape);
 const byEvent=new Map<string,{r:Witness;exact:boolean}>();
 for(const root of related){
  const exact=root.site===fig.site,old=byEvent.get(root.event);
  if(!old||exact&&!old.exact)byEvent.set(root.event,{r:root,exact});
 }
 const exact=[...byEvent.values()].filter(x=>x.exact);
 return {figureId:fig.id,board:fig.board,kind:fig.kind,
  exactEvents:exact.length,exactDays:new Set(exact.map(x=>x.r.date)).size,
  shapeEvents:byEvent.size,
  exactWitnesses:exact.slice(0,6).map(({r})=>({
   date:r.date,turn:r.turn,jur:r.jur,head:r.head
  }))};
}
export function postSupportMetrics(figures:Figure[],roots:Witness[],
 date:string,heads:{jur:string;head:string}[]){
 return Object.fromEntries(['PLUS11','AUX_AYER','AUX_HOY'].flatMap(board=>
  (['VT2','VT3'] as Kind[]).map(kind=>{
   const selected=figures.filter(f=>f.board===board&&f.kind===kind);
   const supported=selected.map(f=>({f,s:figureSupport(f,roots,date)}));
   const n=kind==='VT2'?2:3;
   const validHeads=heads.filter(h=>/^\d{4,5}$/.test(h.head));
   const winnerType={onlySupported:0,onlyUnsupported:0,both:0,neither:0};
   for(const head of validHeads){
    const last=head.head.slice(-n);
    const matches=(r:typeof supported[number])=>
     r.f.readings.some(v=>v===last||[...v].reverse().join('')===last);
    const s=supported.some(x=>x.s.exactEvents>0&&matches(x));
    const u=supported.some(x=>x.s.exactEvents===0&&matches(x));
    if(s&&u)winnerType.both++;
    else if(s)winnerType.onlySupported++;
    else if(u)winnerType.onlyUnsupported++;
    else winnerType.neither++;
   }
   return [board+'_'+kind,{figures:selected.length,
    withExactRoots:supported.filter(x=>x.s.exactEvents>0).length,
    withRepeatedDays:supported.filter(x=>x.s.exactDays>=2).length,
    withoutExactRoots:supported.filter(x=>x.s.exactEvents===0).length,
    headWins:winnerType,
    examples:supported.filter(x=>x.s.exactEvents>0)
     .sort((a,b)=>b.s.exactDays-a.s.exactDays||
      b.s.exactEvents-a.s.exactEvents).slice(0,3).map(x=>({
       source:x.f.source,site:x.f.site,
       shape:x.f.shape,reading:x.f.readings,
       rank:x.f.bestRanks,witnesses:x.s.exactWitnesses
      }))
   }];
  })
 ));
}
