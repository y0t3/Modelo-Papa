// D-7 -> episodio fisico -> dos focos con evidencia de sorteos DISTINTOS.
// Experimental: no altera el selector ni produce instrucciones de apuesta.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {Path} from './paths';
import type {DatedSheet,CycleKind} from './cycle7d';
import type {MarkedPath,MarkedMoment} from './markedSheet7d';
import {reconstructMarkedMoments,priorMarkedMoments} from './markedSheet7d';
import {relationOf} from './routeLineage7d';

export type RouteFocusIdentity={kind:CycleKind;sourceId:SourceId;coordinates:string;route:Path};
export type RouteEpisode7D={
 identity:RouteFocusIdentity; anchorDate:string; evidenceIds:string[];
 exact:number; movement:number; branches:number; lastEvidence?:string;
};
export type DualRouteState7D={
 kind:CycleKind;target:Turno;primary?:RouteFocusIdentity;emerging?:RouteFocusIdentity;
 primarySeen:string[];emergingSeen:string[];primaryQuiet:number;resting:boolean;lastMoment?:string;
};
export type DualRouteAction7D='SIN_FOCO'|'INICIAR'|'MANTENER'|'OBSERVAR_EMERGENTE'|'PROMOVER'|'REPOSAR'|'SEGUIR_EN_REPOSO'|'REACTIVAR';
export type DualRouteDecision7D={date:string;turn:Turno;action:DualRouteAction7D;
 before:DualRouteState7D;after:DualRouteState7D;reason:string;leader?:RouteEpisode7D;
 newIndependentEvidence:number;eligibleRoutes:number};
const moment=(date:string,turn:Turno)=>date+'|'+String(TURNOS.indexOf(turn));
const routeId=(f:RouteFocusIdentity)=>[f.kind,f.sourceId,f.coordinates].join('|');
const same=(a?:RouteFocusIdentity,b?:RouteFocusIdentity)=>!!a&&!!b&&routeId(a)===routeId(b);
const identity=(m:MarkedPath):RouteFocusIdentity=>({kind:m.kind,sourceId:m.sourceId,coordinates:m.cells.join('>'),route:m.route});
const weekAgo=(d:string)=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()-7);return x.toISOString().slice(0,10)};
const rank=(a:RouteEpisode7D,b:RouteEpisode7D)=>
 b.evidenceIds.length-a.evidenceIds.length||b.exact-a.exact||b.movement-a.movement||
 routeId(a.identity).localeCompare(routeId(b.identity));
export const initialDualRouteState7D=(kind:CycleKind,target:Turno):DualRouteState7D=>({
 kind,target,primarySeen:[],emergingSeen:[],primaryQuiet:0,resting:false
});
/** Only D-7 marked physical routes are eligible as new candidates.
 * Confirmations are previous actual winning marks in the SAME winning turn,
 * column and modality, deduplicated by distinct drawing date/turn.
 */
export function buildRouteEpisodes7D(history:DatedSheet[],current:DailySheet,date:string,target:Turno,kind:CycleKind):RouteEpisode7D[]{
 const at=TURNOS.indexOf(target);if(at<0)throw Error('Turno objetivo invalido');
 const safe:DailySheet={...current,matches:Object.fromEntries(TURNOS.map((t,i)=>[t,i<at?(current.matches[t]||[]):[]]))};
 const dated=[...history.filter(h=>h.date<date),{date,sheet:safe}];
 const moments=reconstructMarkedMoments(dated);
 const past=priorMarkedMoments(moments,date,target);
 const d7=weekAgo(date);
 const baseline=past.find(x=>x.date===d7&&x.turn===target);
 if(!baseline)return [];
 const available=new Set(current.columns.slice(0,at+1).map(c=>c.id));
 const recent=past.filter(x=>x.date>d7&&x.turn===target);
 const episodes=new Map<string,RouteEpisode7D>();
 for(const anchor of baseline.marks){
  if(anchor.kind!==kind||!available.has(anchor.sourceId))continue;
  const f=identity(anchor),k=routeId(f);
  if(episodes.has(k))continue;
  const events=new Map<string,Set<string>>();
  for(const m of recent)for(const x of m.marks){
   if(x.kind!==kind||x.sourceId!==anchor.sourceId)continue;
   const relation=relationOf(anchor,x);
   if(relation==='SIN_RELACION')continue;
   const id=moment(m.date,m.turn);
   const types=events.get(id)||new Set<string>();types.add(relation);events.set(id,types);
  }
  let exact=0,movement=0,branches=0;
  for(const types of events.values()){
   if(types.has('MISMA_RUTA'))exact++;
   else if(types.has('MISMO_MOVIMIENTO'))movement++;
   else if(types.has('RAMIFICA'))branches++;
  }
  const evidenceIds=[...events.keys()].sort();
  episodes.set(k,{identity:f,anchorDate:d7,evidenceIds,exact,movement,branches,lastEvidence:evidenceIds[evidenceIds.length-1]});
 }
 return [...episodes.values()].sort(rank);
}
/** Pure chronological transition. Repeated preview of the same event cannot
 * be considered a NEW confirmation. Promotion requires a NEW marked drawing
 * since the emerging focus was first observed, not two screen renders.
 */
export function advanceDualRouteFromEpisodes7D(state:DualRouteState7D,episodes:RouteEpisode7D[],date:string,turn:Turno):DualRouteDecision7D{
 if(state.target!==turn||TURNOS.indexOf(turn)<0)throw Error('Turno objetivo distinto del estado');
 const now=moment(date,turn);
 if(state.lastMoment&&state.lastMoment>=now)throw Error('La decision debe avanzar cronologicamente');
 const eligible=episodes.filter(e=>e.identity.kind===state.kind).sort(rank);
 const leader=eligible[0],primaryEpisode=eligible.find(x=>same(x.identity,state.primary));
 const currentEvidence=primaryEpisode?.evidenceIds||[];
 const freshPrimary=currentEvidence.filter(id=>!state.primarySeen.includes(id));
 const quiet=state.primary?(freshPrimary.length?0:state.primaryQuiet+1):0;
 const resting=!!state.primary&&quiet>=3;
 const base:DualRouteState7D={...state,primarySeen:[...new Set([...state.primarySeen,...currentEvidence])],primaryQuiet:quiet,resting,lastMoment:now};
 const make=(action:DualRouteAction7D,after:DualRouteState7D,reason:string,fresh=0):DualRouteDecision7D=>({
  date,turn,action,before:state,after,reason,leader,newIndependentEvidence:fresh,eligibleRoutes:eligible.length
 });
 if(!state.primary){
  if(leader&&leader.evidenceIds.length>0){
   return make('INICIAR',{...base,primary:leader.identity,primarySeen:leader.evidenceIds,primaryQuiet:0,resting:false,
     emerging:undefined,emergingSeen:[]},'Foco inicial D-7 con confirmacion posterior de un sorteo distinto.');
  }
  return make('SIN_FOCO',{...base,emerging:leader?.identity,emergingSeen:leader?.evidenceIds||[]},
    'Hay ruta D-7, pero todavia no tiene otra confirmacion del mismo turno.');
 }
 const alternate=eligible.find(e=>!same(e.identity,state.primary));
 if(!alternate){
  const action:DualRouteAction7D=state.resting&&freshPrimary.length?'REACTIVAR':resting?(state.resting?'SEGUIR_EN_REPOSO':'REPOSAR'):'MANTENER';
  return make(action,{...base,emerging:undefined,emergingSeen:[]},
   freshPrimary.length?'Confirmacion nueva del foco principal.':'No hay alternativa D-7 disponible con geometria distinta.',freshPrimary.length);
 }
 const previouslyObserved=same(state.emerging,alternate.identity);
 const priorSeen=previouslyObserved?state.emergingSeen:[];
 const independentNew=alternate.evidenceIds.filter(x=>!priorSeen.includes(x));
 const next:DualRouteState7D={...base,emerging:alternate.identity,emergingSeen:[...new Set([...priorSeen,...alternate.evidenceIds])]};
 const exceeds=alternate.evidenceIds.length>=2&&alternate.evidenceIds.length>(primaryEpisode?.evidenceIds.length||0);
 if(previouslyObserved&&independentNew.length>0&&exceeds){
  const promoted:DualRouteState7D={...next,primary:alternate.identity,primarySeen:next.emergingSeen,
    emerging:state.primary,emergingSeen:base.primarySeen,primaryQuiet:0,resting:false};
  return make('PROMOVER',promoted,'Promocion solo tras nuevo sorteo confirmatorio independiente y ventaja sobre la ruta principal.',independentNew.length);
 }
 return make('OBSERVAR_EMERGENTE',next,'Se observa otra geometria sin desplazar la principal; no existe evidencia nueva suficiente para promover.',independentNew.length);
}
export function advanceDualRouteFocus7D(state:DualRouteState7D,history:DatedSheet[],current:DailySheet,date:string,turn:Turno):DualRouteDecision7D{
 const episodes=buildRouteEpisodes7D(history,current,date,turn,state.kind);
 return advanceDualRouteFromEpisodes7D(state,episodes,date,turn);
}
