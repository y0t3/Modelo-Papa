import type {Turno} from './domain';
import type {MarkLedger,MarkKind} from './auxMarkLedger';
import type {AuxiliarView,AuxiliarHistory} from './motorLaloAuxiliar';
import type {AuxiliaryBoard,AuxPath,AuxSourceTurn} from './auxSantiagoNeuquen';
import {auxiliaryBoard,auxCanonicalPath} from './auxSantiagoNeuquen';
import {projectAuxShape} from './auxWinningMemory';
import {dailyHeadOwnerId} from './panoramaModel';

export type AuxVisualKind=MarkKind;
export type AuxVisualAntecedent={
 id:string;date:string;period:'D−1'|'D−7';turn:Turno;jur:string;
 head:string;reading:string;path:AuxPath;relation:string
};
export type AuxVisualRoute={
 id:string;ownerId:string;kind:AuxVisualKind;cells:AuxPath;
 reading:string;rootEvents:AuxVisualAntecedent[];
};
export type AuxVisualGroup={
 id:string;family:string;turn?:Turno;jur?:string;head?:string;
 kinds:AuxVisualKind[];routeCount:number;subtitle:string
};
export type AuxVisualData={routes:AuxVisualRoute[];groups:AuxVisualGroup[]};
const KINDS:AuxVisualKind[]=['vt2','vt3','vt4'];
const coord=(p:AuxPath)=>p.map(c=>c.row+':'+c.col).join('>');
const physicalKey=(kind:MarkKind,p:AuxPath)=>kind+'|'+auxCanonicalPath(p);
const sameCoords=(a:AuxPath,b:AuxPath)=>
 coord(a)===coord(b)||coord(a)===coord([...b].reverse());
/** Solo POST exacto, cada evento es una cabeza real. */
export function buildAuxDailyVisual(ledger:MarkLedger,board:AuxiliaryBoard):AuxVisualData{
 const allowed=new Set(board.cells.map(c=>c.row+':'+c.col));
 const cellAt=new Map(board.cells.map(c=>[c.row+':'+c.col,c]));
 const groups:AuxVisualGroup[]=[],routes:AuxVisualRoute[]=[];
 for(const mark of ledger.marks){
  const id=dailyHeadOwnerId(mark.turn,mark.jur,mark.head);
  const unique=new Map<string,AuxVisualRoute>();
  for(const kind of KINDS)for(const path of mark.modalities[kind].aux){
   const cells=path.cells.map(c=>cellAt.get(c.row+':'+c.col));
   if(cells.some(c=>!c)||cells.some(c=>!allowed.has(c!.row+':'+c!.col)))continue;
   const actual=cells as AuxPath;
   const key=physicalKey(kind,actual);
   if(!unique.has(key))unique.set(key,{
    id:id+'|'+key,ownerId:id,kind,cells:actual,
    reading:mark.modalities[kind].value,rootEvents:[]
   });
  }
  const local=[...unique.values()];routes.push(...local);
  groups.push({id,family:mark.head,head:mark.head,turn:mark.turn,
   jur:mark.jur,routeCount:local.length,
   kinds:KINDS.filter(k=>local.some(r=>r.kind===k)),
   subtitle:mark.jur+' · '+mark.turn});
 }
 return {routes,groups};
}
/** PRE de AUX: rutas nacen SOLO de figuras reales de raíces anteriores.
 * Las huellas históricas se anotan por forma de movimiento, nunca se
 * transportan dígitos viejos. No consulta cabezas del turno objetivo.
 */
export function buildAuxPredictiveVisual(date:string,turn:Turno,
 aux:AuxiliaryBoard,view:AuxiliarView,
 history:AuxiliarHistory[]):AuxVisualData{
 if(view.date!==date||view.turn!==turn)throw Error('Vista AUX de otro corte');
 if(history.some(h=>h.date>=date))throw Error('No usar histórico futuro');
 const routes:AuxVisualRoute[]=[],groups:AuxVisualGroup[]=[];
 for(const kind of KINDS){
  const length=Number(kind.slice(-1)) as 2|3|4;
  for(const family of view.ranks[length]){
   const ownerId=kind+'|'+family.family;
   const members=new Set(family.values);
   const byPath=new Map<string,AuxVisualRoute>();
   for(const {period,aux:old} of history){
    for(const event of old.events[length])for(const former of event.paths){
     for(const current of projectAuxShape(aux,former)){
      const reading=current.map(c=>c.digit).join('');
      if(!members.has(reading))continue;
      const key=physicalKey(kind,current);
      let route=byPath.get(key);
      if(!route){
       route={id:ownerId+'|'+key,ownerId,kind,cells:current,
        reading,rootEvents:[]};
       byPath.set(key,route);
      }
      if(!route.rootEvents.some(a=>a.id===event.id)){
       route.rootEvents.push({
        id:event.id,date:old.date,period,turn:event.turn,jur:event.jur,
        head:event.head,reading:former.map(c=>c.digit).join(''),
        path:former,
        relation:'La cabeza '+event.head+' formó '+former.map(c=>c.digit).join('')+
        ' en '+event.turn+'. Conservamos los desplazamientos de esas casillas '+
        'y los aplicamos sobre cifras actuales visibles: '+reading+'.'
       });
      }
     }
    }
   }
   const candidates=[...byPath.values()];
   routes.push(...candidates);
   groups.push({id:ownerId,family:family.family,routeCount:candidates.length,
    kinds:candidates.length?[kind]:[],
    subtitle:'Puesto #'+family.rank+' · raíces '+family.roots+
     ' (D−1 '+family.d1+' / D−7 '+family.d7+')'});
  }
 }
 return {routes,groups};
}
