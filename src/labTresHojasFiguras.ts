/**
 * Auditoría de tres hojas con dos longitudes de igual jerarquía.
 * Las rutas se descubren en PRE. Los resultados se añaden exclusivamente
 * a evaluateParallelPOST(), sin alterar ni repetir el orden de ningún Top.
 * Un apoyo entre tableros es coincidencia de lectura actual, NO un camino
 * que atraviese tableros (estaría prohibido).
 */
import {reversibleFamily} from './motorLalo';
import type {ShapeRoute,Board,Kind,Figure} from './labRadarFiguras';
import {figuresInTop} from './labRadarFiguras';
export type Head={jur:string;head:string};
export const BOARDS:Board[]=['PLUS11','AUX_AYER','AUX_HOY'];
export const KINDS:Kind[]=['VT2','VT3'];
export type Preview={date:string;turn:string;routes:ShapeRoute[]};
export type SharedFamily={kind:Kind;family:string;boards:Board[];
 sources:{board:Board;engines:string[];bestRank:number;figureCount:number}[]};
export type Extension={mother:string;child:string;boardVT2:Board;
 boardVT3:Board;parentFigures:number;childFigures:number};
const length=(k:Kind)=>k==='VT2'?2:k==='VT3'?3:4;
const validHead=(h:string)=>/^\d{4,5}$/.test(h);
function boardFigureFamilies(figures:Figure[],board:Board,kind:Kind){
 const map=new Map<string,Figure[]>();
 for(const fig of figures)if(fig.board===board&&fig.kind===kind)
 for(const f of fig.families){
  const list=map.get(f)||[];
  if(!list.includes(fig))list.push(fig);
  map.set(f,list);
 }
 return map;
}
export function validatePRE(preview:Preview){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(preview.date))throw Error('Fecha PRE inválida');
 for(const route of preview.routes){
  if(route.date!==preview.date||route.turn!==preview.turn)
   throw Error('La ruta no pertenece al corte PRE');
  if(!KINDS.includes(route.kind))throw Error('Solo VT2 y VT3');
  if(route.board==='PLUS11'&&
   (route.cells.some(c=>c.row>5||c.col>1)||!route.source))
    throw Error('Celdas PLUS11 fuera de su columna');
  if(route.board!=='PLUS11'&&route.cells.some(c=>
   c.row>1||c.col>11||c.row<0||c.col<0))
    throw Error('Celdas auxiliares fuera de 2x12');
  if(route.reading){
   if(route.reading.length!==length(route.kind)||
    !/^\d+$/.test(route.reading))throw Error('Lectura física inválida');
   if(route.family&&reversibleFamily(route.reading)!==route.family)
    throw Error('Familia no corresponde a cifra física PRE');
  }
 }
 return figuresInTop(preview.routes);
}
export function sharedFamilies(figures:Figure[],kind:Kind):SharedFamily[]{
 const group=new Map<string,Map<Board,Figure[]>>();
 for(const board of BOARDS){
  const families=boardFigureFamilies(figures,board,kind);
  for(const [family,locations] of families){
   if(!group.has(family))group.set(family,new Map());
   group.get(family)!.set(board,locations);
  }
 }
 return [...group].filter(([,m])=>m.size>=2).map(([family,byBoard])=>({
  kind,family,boards:BOARDS.filter(b=>byBoard.has(b)),
  sources:[...byBoard].map(([board,locations])=>({
   board,engines:[...new Set(locations.flatMap(p=>p.engines))],
   bestRank:Math.min(...locations.flatMap(p=>Object.values(p.bestRanks))),
   figureCount:locations.length
  }))
 })).sort((a,b)=>b.boards.length-a.boards.length||
  a.family.localeCompare(b.family));
}
/** VT3 must be its own valid physical path; never compose two paths
 * from different sheets. The mother relationship is just evidence
 * that the *current* reading has an existing VT2 suffix. */
export function physicalExtensions(figures:Figure[]):Extension[]{
 const parents=BOARDS.flatMap(board=>[...boardFigureFamilies(figures,board,'VT2')]
  .map(([family,arr])=>({board,family,arr})));
 const children=BOARDS.flatMap(board=>[...boardFigureFamilies(figures,board,'VT3')]
  .map(([family,arr])=>({board,family,arr})));
 const result:Extension[]=[];
 for(const p of parents)for(const c of children){
  if(!c.arr.some(fig=>fig.readings.some(read=>
   reversibleFamily(read.slice(1))===p.family)))continue;
  result.push({mother:p.family,child:c.family,
   boardVT2:p.board,boardVT3:c.board,
   parentFigures:p.arr.length,childFigures:c.arr.length});
 }
 return result;
}
export type BoardHit={kind:Kind;head:Head;ending:string;family:string;
 boards:Board[];numberBoards:number;actualRouteBoards:Board[];
 selectedFigures:number};
export type ParallelSummary={date:string;turn:string;preFigures:number;
  byKind:Record<'VT2'|'VT3',{
   uniqueFamilies:Record<Board,number>;
   selectedFigures:Record<Board,number>;
   sharedFamilies2:number;sharedFamilies3:number;
   heads:number;headHitsByBoard:Record<Board,number>;
   headHitsOneBoard:number;headHitsTwoBoards:number;
   headHitsThreeBoards:number;headHitsZeroBoards:number;
   headsWithExactSelectedPhysicalRoute:number;
   sharedSelectedExposures:number;
  }>;
 hits:BoardHit[];shared:SharedFamily[];
 extensionCount:number;crossBoardExtensions:number;examples:Extension[]};
export function evaluateParallelPOST(preview:Preview,heads:Head[]):ParallelSummary{
 const figures=validatePRE(preview);
 const shared=KINDS.flatMap(k=>sharedFamilies(figures,k));
 const extensions=physicalExtensions(figures);
 const hits:BoardHit[]=[];
 const out={} as ParallelSummary['byKind'];
 for(const kind of KINDS.filter(x=>x==='VT2'||x==='VT3') as ('VT2'|'VT3')[]){
  const byBoard=Object.fromEntries(BOARDS.map(b=>
   [b,boardFigureFamilies(figures,b,kind)])) as Record<Board,Map<string,Figure[]>>;
  const totalFamilies=new Set([...BOARDS.flatMap(b=>[...byBoard[b].keys()])]);
  const relevant=shared.filter(x=>x.kind===kind);
  const kHeads=heads.filter(x=>validHead(x.head));
  const observed:BoardHit[]=[];
  for(const h of kHeads){
   const ending=h.head.slice(-length(kind));
   const fam=reversibleFamily(ending);
   const boards=BOARDS.filter(b=>byBoard[b].has(fam));
   // Path exact includes its reverse physical traversal, valid in each
   // board independently. The ranking is frozen before checking heads.
   const actuallyOnPath=boards.filter(b=>(byBoard[b].get(fam)||[]).some(f=>
    f.readings.includes(ending)||f.readings.includes([...ending].reverse().join(''))));
   observed.push({kind,head:h,ending,family:fam,boards,
    numberBoards:boards.length,actualRouteBoards:actuallyOnPath,
    selectedFigures:boards.reduce((n,b)=>n+(byBoard[b].get(fam)?.length||0),0)});
  }
  hits.push(...observed);
  const n=(f:(x:BoardHit)=>boolean)=>observed.filter(f).length;
  out[kind]={
   uniqueFamilies:Object.fromEntries(BOARDS.map(b=>[b,byBoard[b].size])) as Record<Board,number>,
   selectedFigures:Object.fromEntries(BOARDS.map(b=>
    [b,figures.filter(f=>f.board===b&&f.kind===kind).length])) as Record<Board,number>,
   sharedFamilies2:relevant.filter(x=>x.boards.length===2).length,
   sharedFamilies3:relevant.filter(x=>x.boards.length===3).length,
   heads:observed.length,
   headHitsByBoard:Object.fromEntries(BOARDS.map(b=>
    [b,n(x=>x.boards.includes(b))])) as Record<Board,number>,
   headHitsOneBoard:n(x=>x.numberBoards===1),
   headHitsTwoBoards:n(x=>x.numberBoards===2),
   headHitsThreeBoards:n(x=>x.numberBoards===3),
   headHitsZeroBoards:n(x=>x.numberBoards===0),
   headsWithExactSelectedPhysicalRoute:n(x=>x.actualRouteBoards.length>0),
   sharedSelectedExposures:relevant.length,
  };
  void totalFamilies;
 }
 return {date:preview.date,turn:preview.turn,
  preFigures:figures.length,byKind:out,hits,shared,
  extensionCount:extensions.length,
  crossBoardExtensions:extensions.filter(x=>x.boardVT2!==x.boardVT3).length,
  examples:extensions.slice(0,8)};
}
