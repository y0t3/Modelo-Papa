// INFO: comparación de un mismo turno entre jornadas, separada del motor.
import {TURNOS} from './domain';
import type {CabezasDia,Turno} from './domain';
import type {DailySheet} from './sheet';
import type {LaloView} from './motorLalo';
import type {PanoramaRoute} from './panoramaModel';
import {buildDailyPanorama,buildPredictivePanorama,routesForDailyTurn} from './panoramaModel';
import {preSheetAtCut} from './infoCandidatos';

export type InfoVisualDay={date:string;heads:CabezasDia;sheet:DailySheet};
export type TurnHistoryFrame={
 id:string;date:string;dayLabel:string;title:string;
 kind:'historico'|'proximo';sheet:DailySheet;
 routes:PanoramaRoute[];markedHeads:number;routeCount:number;
};
export type TurnHistory={turn:Turno;frames:TurnHistoryFrame[];summary:string};

export function readableWeekday(iso:string):string{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))return iso;
 const parsed=new Date(iso+'T12:00:00Z');
 if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==iso)return iso;
 const days=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
 return days[parsed.getUTCDay()]+' '+iso.slice(8,10)+'/'+iso.slice(5,7);
}

/** No toma ningún resultado del turno objetivo para dibujar la propuesta. */
export function buildTurnHistory(date:string,turn:Turno,
 sheet:DailySheet|null,view:LaloView|null,days:InfoVisualDay[]):TurnHistory{
 const frames:TurnHistoryFrame[]=[];
 const titles=['Última jornada','Dos jornadas atrás','Tres jornadas atrás','Hace una semana'];
 const seen=new Set<string>();
 for(const day of days.slice(0,4)){
  if(day.date>=date||seen.has(day.date))continue;
  seen.add(day.date);
  const panorama=buildDailyPanorama(day.sheet,day.heads);
  const routes=routesForDailyTurn(panorama,turn);
  frames.push({
   id:'dia-'+day.date,date:day.date,dayLabel:readableWeekday(day.date),
   title:titles[frames.length],kind:'historico',sheet:day.sheet,
   routes,routeCount:routes.length,
   markedHeads:panorama.groups.filter(g=>g.turn===turn&&g.routeCount>0).length
  });
 }
 if(sheet&&view&&view.target===turn){
  const cut=TURNOS.indexOf(turn);
  const visible=preSheetAtCut(sheet,turn,cut);
  const predictive=buildPredictivePanorama(view);
  frames.push({
   id:'proximo',date,dayLabel:readableWeekday(date),title:'Para el próximo '+turn,
   kind:'proximo',sheet:{...visible,columns:visible.columns.slice(0,cut+1)},
   routes:predictive.routes.filter(r=>visible.columns.slice(0,cut+1).some(c=>c.id===r.sourceId)),
   markedHeads:0,routeCount:predictive.routes.length
  });
 }
 const past=frames.filter(f=>f.kind==='historico');
 const matched=past.filter(f=>f.markedHeads>0).length;
 const summary=past.length?
  'En '+matched+' de las '+past.length+' jornadas mostradas hubo números con recorridos coincidentes en el '+turn+
  '. Los colores indican coincidencias observadas, no lo que va a salir.':
  'Todavía no hay jornadas anteriores disponibles para comparar.';
 return {turn,frames,summary};
}

export const visibleTurnRoutes=(frame:TurnHistoryFrame,mode:'todos'|'vt2'|'vt3'|'vt4')=>
 mode==='todos'?frame.routes:frame.routes.filter(r=>r.kind===mode);
