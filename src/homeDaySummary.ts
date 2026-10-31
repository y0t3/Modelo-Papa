/**
 * Resumen real para Inicio/Info: por cada turno, reconstruye SU corte PRE
 * y coteja cabezas POST sin modificar ranking, ni convertir caminos en votos.
 * El resumen reconstruido no prueba que hubiese un PRE guardado.
 */
import {JURS,TURNOS} from './domain';
import type {CabezasDia,Turno} from './domain';
import type {DailySheet} from './sheet';
import type {LaloHistorical,LaloKind,LaloView} from './motorLalo';
import {buildMotorLalo,reversibleFamily} from './motorLalo';
import {preSheetAtCut} from './infoCandidatos';
export type HeadMatch={turn:Turno;jur:string;head:string;
 kinds:{kind:LaloKind;rank:number;family:string}[]};
export type DayOverview={loaded:boolean;heads:number;turnsWithHeads:number;
 status:'no_cargada'|'sin_resultados'|'en_marcha'|'cinco_turnos';
 statusText:string;matches:HeadMatch[];
 matchedHeads:number;byKind:Record<LaloKind,number>;
 countByTurn:Record<Turno,{heads:number;matched:number}>;
 exactHistory:boolean};
const valid=(h:string)=>/^\d{4}$/.test(h);
export function summarizeDay(date:string,heads:CabezasDia|null,sheet:DailySheet|null,
 history:readonly LaloHistorical[],today:string):DayOverview{
 const enoughHistory=!!sheet&&history.length>0&&history.every(h=>h.date<date);
 const countByTurn=Object.fromEntries(TURNOS.map(t=>[t,{heads:0,matched:0}])) as DayOverview['countByTurn'];
 const matches:HeadMatch[]=[];
 const byKind:DayOverview['byKind']={vt2:0,vt3:0,vt4:0};
 let total=0,turnsWithHeads=0,matchedHeads=0;
 for(let i=0;i<TURNOS.length;i++){
  const turn=TURNOS[i];
  const published=JURS.map(jur=>({jur,head:heads?.[turn]?.[jur]||''}))
   .filter(x=>valid(x.head));
  countByTurn[turn].heads=published.length;
  total+=published.length;
  if(published.length)turnsWithHeads++;
  if(!enoughHistory)continue;
  const pre=preSheetAtCut(sheet!,turn,i);
  const view=buildMotorLalo(pre,date,turn,[...history]);
  const ranked={
   vt2:new Map(view.ranks.vt2.slice(0,10).map(x=>[x.family,x.rank])),
   vt3:new Map(view.ranks.vt3.slice(0,10).map(x=>[x.family,x.rank])),
   vt4:new Map(view.ranks.vt4.slice(0,10).map(x=>[x.family,x.rank]))
  };
  for(const h of published){
   const seen:HeadMatch['kinds']=[];
   for(const [kind,n] of [['vt2',2],['vt3',3],['vt4',4]] as const){
    // Cuatro cifras conserva los valores exactos de las hijas; no basta
    // con una familia inversa que no esté físicamente admitida.
    const value=h.head.slice(-n);
    const f=reversibleFamily(value);
    const ranks=ranked[kind];
    const rank=ranks.get(f);
    if(kind==='vt4'){
     const candidate=view.ranks.vt4.slice(0,10)
      .find(x=>x.paths.some(path=>path.value===value));
     if(candidate){seen.push({kind,rank:candidate.rank,family:candidate.family});byKind[kind]++;}
    }else if(rank!==undefined){seen.push({kind,rank,family:f});byKind[kind]++;}
   }
   if(seen.length){matchedHeads++;countByTurn[turn].matched++;matches.push({...h,turn,kinds:seen});}
  }
 }
 const status:DayOverview['status']=!heads?'no_cargada':turnsWithHeads===0?
  'sin_resultados':turnsWithHeads===5?'cinco_turnos':'en_marcha';
 const statusText=status==='no_cargada'?'Cargá la hoja para empezar':
  status==='sin_resultados'?(date>=today?'Todavía no empezó la jornada':'Sin resultados cargados'):
  status==='cinco_turnos'?'Ya salieron cabezas en los cinco turnos':'La jornada está en marcha';
 return {loaded:!!heads,heads:total,turnsWithHeads,status,statusText,
  matches,matchedHeads,byKind,countByTurn,exactHistory:enoughHistory};
}
