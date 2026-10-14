// Diagnóstico de lectura PRE sobre el motor Lalo oficial; nunca modifica Tops.
// No consulta sheet.heads ni sheet.matches del turno que queremos anticipar.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import {findPaths} from './paths';
import type {Path} from './paths';
import {reversibleFamily} from './motorLalo';
import type {LaloFamily,LaloRoute,LaloView,RootRef} from './motorLalo';

export type Vt3DiagnosticStatus='SIN_FORMACION'|'FISICA_SIN_ANCLAJE'|'EN_TOP3'|'EN_TOP10'|'FUERA_TOP10';
export type Vt3AuditRoute={
 source:SourceId; value:string; cells:string[]; physicalKey:string;
 admitted:boolean; rootEvents:Vt3RootEvent[];
};
export type Vt3RootEvent={
 id:string;period:'D−1'|'D−7';date:string;turn:Turno;
 jurisdiction:string;head:string;source:SourceId;
};
export type Vt3RankingReason={
 cutoff:3|10;boundaryFamily:string;boundaryRank:number;
 decisiveCriterion:string;candidateValue:number;boundaryValue:number;
};
export type Vt3FamilyDiagnostic={
 requested:string;family:string;status:Vt3DiagnosticStatus;
 physicalRoutes:number;admittedRoutes:number;unadmittedRoutes:number;
 physicalSources:number;independentRootEvents:number;d1Events:number;d7Events:number;
 officialRank:number|null;top3:boolean;top10:boolean;
 priorityReasons:Vt3RankingReason[];routes:Vt3AuditRoute[];
 explanation:string;rootedBlocks:number;branchBlocks:number;
};
const crd=(p:{row:number;col:number})=>p.row+':'+p.col;
const position=(p:Path)=>p.map(crd).join('>');
const physicalKey=(source:SourceId,p:Path)=>source+'|'+
 [position(p),position([...p].reverse())].sort()[0];
const criteria=[
 'Presencia de bifurcación física propia',
 'Cantidad de bloques bifurcados (máximo 15)',
 'Cantidad de eventos raíz D−1 (máximo 10)',
 'Cantidad de eventos raíz D−7 (máximo 10)',
 'Cantidad de fuentes físicas',
 'Cantidad de bloques físicos'
] as const;
function priority(f:LaloFamily):number[]{
 return [Number(f.branchBlocks>0),Math.min(f.branchBlocks,15),
  Math.min(f.d1Roots,10),Math.min(f.d7Roots,10),
  f.sourceCount,f.physicalBlocks];
}
function rootEvent(root:RootRef):Vt3RootEvent{
 return {id:[root.date,root.period,root.oldTurn,root.jurisdiction,root.head].join('|'),
  date:root.date,period:root.period,turn:root.oldTurn,
  jurisdiction:root.jurisdiction,head:root.head,source:root.sourceId};
}
function explainPriority(candidate:LaloFamily,boundary:LaloFamily,cutoff:3|10):Vt3RankingReason{
 const ca=priority(candidate),ba=priority(boundary);
 for(let k=0;k<criteria.length;k++)if(ca[k]!==ba[k])
  return {cutoff,boundaryFamily:boundary.family,boundaryRank:boundary.rank,
   decisiveCriterion:criteria[k],candidateValue:ca[k],boundaryValue:ba[k]};
 return {cutoff,boundaryFamily:boundary.family,boundaryRank:boundary.rank,
  decisiveCriterion:'Desempate alfabético entre prioridades iguales',
  candidateValue:0,boundaryValue:0};
}
export function normalizeVt3Query(input:string):{requested:string;family:string}|null{
 const value=input.trim();
 let digits='';
 if(/^\d{3,4}$/.test(value))digits=value.slice(-3);
 else if(/^\d{3}\/\d{3}$/.test(value)){
  const [a,b]=value.split('/');
  if([...a].reverse().join('')!==b)return null;
  digits=a;
 }else return null;
 return {requested:value,family:reversibleFamily(digits)};
}

/** PRE puro. Incluye caminos físicos sin raíz, pero nunca los inventa como rankeados. */
export function auditVt3Family(sheet:DailySheet,view:LaloView,target:Turno,input:string):Vt3FamilyDiagnostic|null{
 const query=normalizeVt3Query(input);
 if(!query)return null;
 if(view.target!==target)throw Error('El turno del motor y la hoja auditada no coinciden');
 const targetIndex=TURNOS.indexOf(target);
 if(targetIndex<0)throw Error('Turno inválido');
 const [a,b]=query.family.split('/');
 const candidate=view.ranks.vt3.find(f=>f.family===query.family);
 const accepted=new Map<string,LaloRoute>();
 for(const p of candidate?.paths||[])accepted.set(physicalKey(p.sourceId,p.path),p);
 const roots=new Map(view.roots.map(r=>[r.id,r]));
 const paths=new Map<string,Vt3AuditRoute>();
 const visible=sheet.columns.slice(0,targetIndex+1);
 for(const source of visible){
  for(const v of [...new Set([a,b])]){
   for(const p of findPaths(source.values,v)){
    const id=physicalKey(source.id,p);
    if(paths.has(id))continue;
    const acceptedRoute=accepted.get(id);
    const events=new Map<string,Vt3RootEvent>();
    for(const r of acceptedRoute?.rootIds||[]){
     const root=roots.get(r);
     if(!root)throw Error('La ruta admitida contiene una raíz histórica inexistente');
     const event=rootEvent(root);
     events.set(event.id,event);
    }
    paths.set(id,{source:source.id,value:v,cells:p.map(crd),physicalKey:id,
     admitted:Boolean(acceptedRoute),rootEvents:[...events.values()]});
   }
  }
 }
 for(const id of accepted.keys()){
  if(!paths.has(id))throw Error('VT3 del motor usa una ruta que no está en la hoja visible: '+id);
 }
 const all=[...paths.values()].sort((x,y)=>x.source.localeCompare(y.source)||x.physicalKey.localeCompare(y.physicalKey));
 const events=new Map<string,Vt3RootEvent>();
 for(const route of all)for(const e of route.rootEvents)events.set(e.id,e);
 const rootList=[...events.values()];
 const officialRank=candidate?.rank??null;
 const priorityReasons:Vt3RankingReason[]=[];
 if(candidate&&candidate.rank>3&&view.ranks.vt3[2])
  priorityReasons.push(explainPriority(candidate,view.ranks.vt3[2],3));
 if(candidate&&candidate.rank>10&&view.ranks.vt3[9])
  priorityReasons.push(explainPriority(candidate,view.ranks.vt3[9],10));
 let status:Vt3DiagnosticStatus,explanation:string;
 if(!all.length){
  status='SIN_FORMACION';
  explanation='La terna no forma ningún camino válido de tres celdas contiguas en las fuentes disponibles para este turno.';
 }else if(!candidate){
  status='FISICA_SIN_ANCLAJE';
  explanation='La familia existe físicamente, pero no fue admitida por Lalo: carece de un traslado/bifurcación con raíz histórica propia comprobada. No tiene puesto oficial; no se le presta respaldo de otra familia.';
 }else if(candidate.rank<=3){
  status='EN_TOP3';
  explanation='Está admitida y se encuentra dentro del Top3 oficial.';
 }else if(candidate.rank<=10){
  status='EN_TOP10';
  explanation='Está admitida dentro del Top10, aunque detrás del corte de Top3.';
 }else{
  status='FUERA_TOP10';
  explanation='Está admitida con respaldo propio, pero su puesto queda fuera de Top10. La prioridad del motor considera primero las bifurcaciones y luego los eventos D−1/D−7, fuentes y bloques.';
 }
 return {
  requested:query.requested,family:query.family,status,
  physicalRoutes:all.length,
  admittedRoutes:all.filter(p=>p.admitted).length,
  unadmittedRoutes:all.filter(p=>!p.admitted).length,
  physicalSources:new Set(all.map(x=>x.source)).size,
  independentRootEvents:rootList.length,
  d1Events:rootList.filter(r=>r.period==='D−1').length,
  d7Events:rootList.filter(r=>r.period==='D−7').length,
  officialRank,top3:officialRank!==null&&officialRank<=3,
  top10:officialRank!==null&&officialRank<=10,
  priorityReasons,routes:all,
  explanation,rootedBlocks:candidate?.physicalBlocks??0,branchBlocks:candidate?.branchBlocks??0
 };
}
