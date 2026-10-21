/**
 * Modelo Lalo · continuidad intrajornada. DESCRIPTIVO, sin apuestas ni tops.
 * Un evento es "marca comprobada" solo si su cabeza exacta ya salió y
 * su sufijo de longitud n tenía al menos UN testigo físico PRE en alguna hoja.
 * +11: recorridos dentro de UNA fuente/columna. AUX: puede cruzar franjas.
 * Retiene unidades "familia" y "evento cabeza" sin multiplicar por rutas.
 */
import {JURS,TURNOS} from './domain';
import type {CabezasDia,Turno} from './domain';
import type {DailySheet} from './sheet';
import {cellsFromPlus11,findPaths} from './paths';
import type {Cell,Path} from './paths';
import {auxiliaryBoard,enumerateAuxPaths,findAuxPaths} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads,AuxPath,AuxiliaryBoard} from './auxSantiagoNeuquen';
import {familyFor} from './auxAnchoredMemory';
export type N=2|3|4;
export const MODALITIES:N[]=[2,3,4];
export type Physical={family:string;values:string[];
 plusSources:string[];auxSources:string[];crossAux:boolean;
 plusPaths:number;auxPaths:number};
export type HistoricalMark={key:string;date:string;turn:Turno;jur:string;
 head:string;length:N;family:string;exact:string;
 boards:('PLUS'|'AUX')[];plusPaths:number;auxPaths:number;
 plusExample:string|null;auxExample:string|null};
export type PriorFamily={family:string;values:string[];rootEvents:number;
 rootBoards:('PLUS'|'AUX')[];originTurns:Turno[];
 physicalBoards:('PLUS'|'AUX')[];newPlusSources:string[];
 newAuxSources:string[];oldPlusSources:string[];
 oldAuxSources:string[];status:'PERSISTE'|'FUENTE_NUEVA';
 reachedSecondPlus:boolean;reachedSecondAux:boolean;becameDualSheet:boolean};
export type TurnFrame={target:Turno;index:number;
 visiblePlus:string[];visibleAux:string[];
 physical:Record<N,Physical[]>;roots:Record<N,HistoricalMark[]>;
 rooted:Record<N,PriorFamily[]>};
const letters=(s:string)=>[...s].reverse().join('');
const groupName=(n:N,v:string)=>familyFor(n,v);
const key=(a:{row:number;col:number})=>a.row+':'+a.col;
function walks(cells:Cell[],n:N):Path[]{
 const out:Path[]=[];
 function rec(path:Path){
  const at=path[path.length-1];
  if(path.length===n){out.push([...path]);return;}
  for(const c of cells)if(!path.some(p=>key(p)===key(c))&&
   Math.max(Math.abs(c.row-at.row),Math.abs(c.col-at.col))===1)rec([...path,c]);
 }
 for(const c of cells)rec([c]);
 return out;
}
type Mutable={family:string;values:Set<string>;plus:Set<string>;
 aux:Set<string>;crossAux:boolean;plusPaths:number;auxPaths:number};
const ensure=(m:Map<string,Mutable>,family:string)=>{
 const old=m.get(family);if(old)return old;
 const x:Mutable={family,values:new Set(),plus:new Set(),aux:new Set(),
  crossAux:false,plusPaths:0,auxPaths:0};
 m.set(family,x);return x;
};
export function geometryAt(plus:DailySheet,aux:AuxiliaryHeads,target:Turno):
 Record<N,Map<string,Physical>>{
 const cutoff=TURNOS.indexOf(target),auxBoard=auxiliaryBoard(aux,target);
 const physical={} as Record<N,Map<string,Physical>>;
 for(const n of MODALITIES){
  const m=new Map<string,Mutable>();
  for(const col of plus.columns.slice(0,cutoff+1)){
   const available=cellsFromPlus11(col.values);
   for(const p of walks(available,n)){
    const value=p.map(x=>x.digit).join(''),g=ensure(m,groupName(n,value));
    g.plus.add(col.id);g.plusPaths++;
    if(n===4)g.values.add(value);
    else {g.values.add(value);g.values.add(letters(value));}
   }
  }
  for(const p of enumerateAuxPaths(auxBoard,n)){
   const value=p.map(x=>x.digit).join(''),g=ensure(m,groupName(n,value));
   const sources=new Set(p.map(x=>x.source));
   sources.forEach(x=>g.aux.add(x));
   g.crossAux||=sources.size>1;g.auxPaths++;
   if(n===4)g.values.add(value);
   else {g.values.add(value);g.values.add(letters(value));}
  }
  physical[n]=new Map([...m].map(([f,g])=>[f,{
   family:f,values:[...g.values].sort(),plusSources:[...g.plus],
   auxSources:[...g.aux],crossAux:g.crossAux,
   plusPaths:g.plusPaths,auxPaths:g.auxPaths
  }]));
 }
 return physical;
}
function prove(plus:DailySheet,board:AuxiliaryBoard,target:Turno,head:string,n:N):
 {plusPaths:number;auxPaths:number;plusExample:string|null;auxExample:string|null}{
 const suffix=head.slice(-n),idx=TURNOS.indexOf(target);
 let plusPaths=0,plusExample:string|null=null;
 for(const col of plus.columns.slice(0,idx+1)){
  const paths=findPaths(col.values,suffix);
  plusPaths+=paths.length;
  if(!plusExample&&paths.length)plusExample=col.id+':'+paths[0].map(key).join('>');
 }
 const auxPaths=findAuxPaths(board,suffix);
 return {plusPaths,auxPaths:auxPaths.length,plusExample,
  auxExample:auxPaths.length?auxPaths[0].map(p=>p.source+':'+key(p)).join('>'):null};
}
export function sameDaySequence(date:string,draws:CabezasDia,
 plus:DailySheet,aux:AuxiliaryHeads):TurnFrame[]{
 const frames:TurnFrame[]=[];
 const rooted:Record<N,HistoricalMark[]>={2:[],3:[],4:[]};
 let previous:Record<N,Map<string,Physical>>={2:new Map(),3:new Map(),4:new Map()};
 for(let idx=0;idx<TURNOS.length;idx++){
  const target=TURNOS[idx],board=auxiliaryBoard(aux,target);
  const now=geometryAt(plus,aux,target);
  const frame:TurnFrame={
   target,index:idx,
   visiblePlus:plus.columns.slice(0,idx+1).map(x=>x.id),
   visibleAux:board.visibleTurns,
   physical:{2:[...now[2].values()],3:[...now[3].values()],
    4:[...now[4].values()]},
   roots:{2:[...rooted[2]],3:[...rooted[3]],4:[...rooted[4]]},
   rooted:{2:[],3:[],4:[]}
  };
  for(const n of MODALITIES){
   const groups=new Map<string,HistoricalMark[]>();
   for(const root of rooted[n]){
    const arr=groups.get(root.family)||[];arr.push(root);groups.set(root.family,arr);
   }
   for(const [family,events] of groups){
    const current=now[n].get(family);
    if(!current)throw Error('Una marca física previa se perdió antes de '+target+': '+family);
    const older=previous[n].get(family);
    const newPlus=current.plusSources.filter(x=>!older?.plusSources.includes(x));
    const newAux=current.auxSources.filter(x=>!older?.auxSources.includes(x));
    const boards:('PLUS'|'AUX')[]=[
     ...(current.plusSources.length?['PLUS' as const]:[]),
     ...(current.auxSources.length?['AUX' as const]:[])
    ];
    const original=[...new Set(events.flatMap(x=>x.boards))] as ('PLUS'|'AUX')[];
    frame.rooted[n].push({
     family,values:current.values,rootEvents:events.length,
     rootBoards:original,originTurns:[...new Set(events.map(x=>x.turn))],
     physicalBoards:boards,newPlusSources:newPlus,newAuxSources:newAux,
     oldPlusSources:older?.plusSources||[],oldAuxSources:older?.auxSources||[],
     status:newPlus.length||newAux.length?'FUENTE_NUEVA':'PERSISTE',
     reachedSecondPlus:current.plusSources.length>=2&&(older?.plusSources.length||0)<2,
     reachedSecondAux:current.auxSources.length>=2&&(older?.auxSources.length||0)<2,
     becameDualSheet:boards.length===2&&
      !(older?.plusSources.length&&older?.auxSources.length)
    });
   }
  }
  frames.push(frame);
  // POST: sumar SOLO las cabezas ya sorteadas de ESTE turno, comprobadas
  // con recorridos exactos y geometría que existía ANTES del propio turno.
  for(const jur of JURS){
   const head=draws[target]?.[jur]||'';
   if(!/^\d{4}$/.test(head))continue;
   for(const n of MODALITIES){
    const exact=head.slice(-n),family=groupName(n,exact);
    if(!now[n].get(family)?.values.includes(exact))continue;
    const witness=prove(plus,board,target,head,n);
    if(!witness.plusPaths&&!witness.auxPaths)
     throw Error('Familia sin recorrido exacto: '+head);
    rooted[n].push({
     key:[date,target,jur,head,'VT'+n].join('|'),date,turn:target,jur,
     head,length:n,family,exact,
     boards:[...(witness.plusPaths?['PLUS' as const]:[]),
      ...(witness.auxPaths?['AUX' as const]:[])],
     ...witness
    });
   }
  }
  previous=now;
 }
 return frames;
}
