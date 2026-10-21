/**
 * Modelo Lalo / hoja del padre: bitácora POST de cabezas REALMENTE publicadas.
 *
 * La entrada geométrica es el tablero PRE de cada turno; la cabeza observada
 * sólo se usa para iluminar testigos físicos DESPUÉS de sortear.
 * No se marca ningún candidato como si hubiera salido.
 *
 * +11: jamás cruzar columnas de origen.
 * Santiago/Neuquén: 2x12, sí cruzar franjas por contacto contiguo.
 * La bitácora preserva tanto VT2 como VT3 y VT4 exacto.
 */
import {TURNOS,JURS} from './domain';
import type {CabezasDia,Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import {findPaths} from './paths';
import {auxiliaryBoard,findAuxPaths,collectAuxFamilies,auxFamily,enumerateAuxPaths}
 from './auxSantiagoNeuquen';
import type {AuxiliaryHeads,AuxPath,AuxSourceTurn} from './auxSantiagoNeuquen';

export type MarkKind='vt2'|'vt3'|'vt4';
export type MarkBoard='plus11'|'aux';
export type MarkPath={source:string;cells:{row:number;col:number;digit:string}[];
 crossesTurn:boolean};
export type KindMark={kind:MarkKind;value:string;family:string;
 aux:MarkPath[];plus11:MarkPath[]};
export type DrawMark={key:string;date:string;turn:Turno;jur:string;
 head:string;modalities:Record<MarkKind,KindMark>};
export type MarkStage={target:Turno;auxCells:number;
 firstAvailable:Record<MarkKind,number>;
 newSecondSource:Record<MarkKind,number>;
 withMultipleSources:Record<MarkKind,number>;
 withCrossTurn:Record<MarkKind,number>};
export type MarkLedger={date:string;reviewThrough:Turno;
 marks:DrawMark[];stages:MarkStage[];
 summary:Record<MarkKind,{observedHeads:number;formableAux:number;
 formablePlus11:number;both:number;onlyAux:number;onlyPlus11:number;
 neither:number;auxCrossTurnHeads:number;auxPaths:number;plusPaths:number}>;
};
const KINDS:MarkKind[]=['vt2','vt3','vt4'];
const EMPTY=():Record<MarkKind,number>=>({vt2:0,vt3:0,vt4:0});
const indexOf=(t:Turno)=>TURNOS.indexOf(t);
const maskValue=(head:string,kind:MarkKind)=>head.slice(-Number(kind.slice(-1)));
const familyOf=(value:string,kind:MarkKind)=>{
 if(kind==='vt4'){
  // Grupo = dígito antepuesto a madre VT3, no invertir 4 cifras.
  return [...new Set(auxFamily(value.slice(1)).split('/').map(x=>value[0]+x))].join('/');
 }
 return auxFamily(value);
};
const canonical=(cells:{row:number;col:number;digit:string}[])=>
 cells.map(c=>c.row+':'+c.col).join('>');
export function buildAuxPostLedger(date:string,aux:AuxiliaryHeads,
 current:CabezasDia,plus:DailySheet,reviewThrough:Turno):MarkLedger{
 const latest=indexOf(reviewThrough);
 if(latest<0)throw Error('Turno de revisión inválido');
 const marks:DrawMark[]=[];
 const summary=Object.fromEntries(KINDS.map(k=>[k,{
  observedHeads:0,formableAux:0,formablePlus11:0,both:0,
  onlyAux:0,onlyPlus11:0,neither:0,
  auxCrossTurnHeads:0,auxPaths:0,plusPaths:0
 }])) as MarkLedger['summary'];
 for(let targetIdx=0;targetIdx<=latest;targetIdx++){
  const turn=TURNOS[targetIdx],board=auxiliaryBoard(aux,turn);
  const visible=plus.columns.slice(0,targetIdx+1);
  for(const jur of JURS){
   const head=current[turn]?.[jur]||'';
   if(!/^\d{4}$/.test(head))continue;
   const modalities={} as DrawMark['modalities'];
   for(const kind of KINDS){
    const value=maskValue(head,kind);
    // IMPORTANTE: buscar sufijo EXACTO de una cabeza publicada. Inversa
    // cuenta como familia de candidato, no como marca del ganador invertida.
    const auxPaths=findAuxPaths(board,value).map(p=>({
     source:[...new Set(p.map(c=>c.source))].join('+'),
     cells:p.map(c=>({row:c.row,col:c.col,digit:c.digit})),
     crossesTurn:new Set(p.map(c=>c.source)).size>1
    }));
    const plusPaths=visible.flatMap(col=>findPaths(col.values,value).map(p=>({
     source:col.id as SourceId,
     cells:p.map(c=>({row:c.row,col:c.col,digit:c.digit})),
     crossesTurn:false
    })));
    modalities[kind]={kind,value,family:familyOf(value,kind),
     aux:auxPaths,plus11:plusPaths};
    const stat=summary[kind];
    stat.observedHeads++;
    const a=auxPaths.length>0,b=plusPaths.length>0;
    if(a)stat.formableAux++;
    if(b)stat.formablePlus11++;
    if(a&&b)stat.both++;
    else if(a)stat.onlyAux++;
    else if(b)stat.onlyPlus11++;
    else stat.neither++;
    if(auxPaths.some(p=>p.crossesTurn))stat.auxCrossTurnHeads++;
    stat.auxPaths+=auxPaths.length;
    stat.plusPaths+=plusPaths.length;
   }
   marks.push({key:date+'|'+turn+'|'+jur+'|'+head,date,turn,jur,head,modalities});
  }
 }
 // PRE por destino; comparar familias formables al entrar otra fuente auxiliar.
 // La medición es descriptiva: nunca genera predicción ni suma votos
 // por repetición de caminos físicos de una misma familia.
 const stages:MarkStage[]=[];
 let previous:Record<MarkKind,Map<string,Set<string>>>={
  vt2:new Map(),vt3:new Map(),vt4:new Map()
 };
 for(const target of TURNOS){
  if(indexOf(target)>latest)break;
  const board=auxiliaryBoard(aux,target);
  const actual:Record<MarkKind,Map<string,Set<string>>>={
   vt2:new Map(),vt3:new Map(),vt4:new Map()
  };
  for(const kind of KINDS){
   const n=Number(kind.slice(-1)) as 2|3|4;
   for(const path of enumerateAuxPaths(board,n)){
    const value=path.map(c=>c.digit).join('');
    const family=familyOf(value,kind);
    const s=actual[kind].get(family)||new Set<string>();
    path.forEach(c=>s.add(c.source));
    actual[kind].set(family,s);
   }
  }
  const firstAvailable=EMPTY(),newSecondSource=EMPTY(),
   withMultipleSources=EMPTY(),withCrossTurn=EMPTY();
  for(const kind of KINDS){
   for(const [family,sources] of actual[kind]){
    const earlier=previous[kind].get(family);
    if(!earlier)firstAvailable[kind]++;
    if(sources.size>=2)withMultipleSources[kind]++;
    if(sources.size>=2&&(earlier?.size||0)<2)newSecondSource[kind]++;
   }
   // Cruce real = un recorrido cuyos dígitos atraviesan el límite.
   // Múltiples fuentes sin recorrido de cruce son otra observación.
   const cross=new Set<string>();
   for(const path of enumerateAuxPaths(board,Number(kind.slice(-1)) as 2|3|4)){
    if(new Set(path.map(c=>c.source)).size>=2)
     cross.add(familyOf(path.map(c=>c.digit).join(''),kind));
   }
   withCrossTurn[kind]=cross.size;
  }
  stages.push({target,auxCells:board.cells.length,
   firstAvailable,newSecondSource,withMultipleSources,withCrossTurn});
  previous=actual;
 }
 return {date,reviewThrough,marks,stages,summary};
}
export function highlightAuxMarks(ledger:MarkLedger,kinds:MarkKind[]){
 const highlights:Record<string,{kinds:MarkKind[];routes:number;draws:string[]}>= {};
 for(const event of ledger.marks)for(const kind of kinds){
  const matched=new Set<string>();
  for(const path of event.modalities[kind].aux){
   for(const c of path.cells){
    const key=c.row+':'+c.col;
    const item=highlights[key]||{kinds:[],routes:0,draws:[]};
    if(!item.kinds.includes(kind))item.kinds.push(kind);
    const eventPathKey=event.key+'|'+kind+'|'+canonical(path.cells);
    // Count one physical route per event once for this cell.
    if(!matched.has(eventPathKey+'|'+key)){
     item.routes++;matched.add(eventPathKey+'|'+key);
    }
    if(!item.draws.includes(event.key))item.draws.push(event.key);
    highlights[key]=item;
   }
  }
 }
 return highlights;
}
export function groupAuxMarks(ledger:MarkLedger,kind:MarkKind){
 return ledger.marks.filter(e=>e.modalities[kind].aux.length>0)
  .map(e=>({key:e.key,turn:e.turn,jur:e.jur,head:e.head,
   exact:e.modalities[kind].value,
   family:e.modalities[kind].family,
   paths:e.modalities[kind].aux.length,
   crossing:e.modalities[kind].aux.filter(p=>p.crossesTurn).length,
   alsoPlus:e.modalities[kind].plus11.length>0}));
}
