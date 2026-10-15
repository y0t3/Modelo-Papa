// INFO: lectura descriptiva de la jornada. No entrena ni modifica el motor.
// Las rutas históricas son POST de sorteos YA publicados; las actuales son PRE.
import {JURS,TURNOS} from './domain';
import type {CabezasDia,Turno} from './domain';
import type {DailySheet,SourceId,Match} from './sheet';
import type {LaloHistorical,LaloView,LaloRoute} from './motorLalo';
import type {Path} from './paths';
import {jurisdiccionesHabituales} from './laloJurisdicciones';

export type InfoZone='Superior'|'Central'|'Inferior';
export type InfoFrame={
 id:string;label:string;context?:string;phase:'POST'|'PRE';
 heads:number;units:number;available:boolean;
 sourceCounts:Record<string,number>;zoneCounts:Record<InfoZone,number>;
 cells:number[][];mainSource:string|null;mainZone:InfoZone|null;
};
export type InfoReport={
 date:string;turn:Turno;observed:{jurisdiction:string;head:string}[];
 expected:string[];withoutHead:string[];availableSources:{id:SourceId;label:string;active:boolean}[];
 historyLabels:string[];frames:InfoFrame[];
 narrative:string[];notices:string[];
};
const SOURCE_NAMES:Record<SourceId,string>={
 prevNocturno:'Nocturna anterior',Previa:'Previa',Primera:'Primera',
 Matutino:'Matutina',Vespertino:'Vespertina'
};
export const sourceLabel=(id:SourceId)=>SOURCE_NAMES[id];
export function readableDrawDate(iso:string):string{
 if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(iso))return iso;
 const day=new Date(iso+'T12:00:00Z');
 if(Number.isNaN(day.getTime())||day.toISOString().slice(0,10)!==iso)return iso;
 const weekday=['dom','lun','mar','mié','jue','vie','sáb'][day.getUTCDay()];
 return weekday+' '+iso.slice(8,10)+'/'+iso.slice(5,7);
}

const zone=(path:Path):InfoZone=>{
 const avg=path.reduce((n,c)=>n+c.row,0)/path.length;
 return avg<2?'Superior':avg<4?'Central':'Inferior';
};
const emptyZones=():Record<InfoZone,number>=>({Superior:0,Central:0,Inferior:0});
const topKey=(items:Record<string,number>):string|null=>{
 const candidates=Object.entries(items).filter(([,v])=>v>0)
  .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 // Empates se describen como distribuidos, nunca como dominancia única.
 return !candidates.length||candidates[1]?.[1]===candidates[0][1]?null:candidates[0][0];
};
const addUnit=(frame:InfoFrame,key:string,source:SourceId,paths:Path[],
 observedKeys:Set<string>)=>{
 const unique=key+'|'+source;
 if(observedKeys.has(unique)||!paths.length)return;
 observedKeys.add(unique);frame.units++;
 frame.sourceCounts[source]=(frame.sourceCounts[source]||0)+1;
 const cells=new Set<string>();
 const areas=new Set<InfoZone>();
 for(const path of paths){
  areas.add(zone(path));
  for(const c of path)cells.add(c.row+':'+c.col);
 }
 for(const area of areas)frame.zoneCounts[area]++;
 for(const position of cells){
  const [row,col]=position.split(':').map(Number);
  if(frame.cells[row]?.[col]!==undefined)frame.cells[row][col]++;
 }
};
const newFrame=(id:string,label:string,phase:'POST'|'PRE',heads=0):InfoFrame=>({
 id,label,phase,heads,units:0,available:false,sourceCounts:{},
 zoneCounts:emptyZones(),cells:Array.from({length:6},()=>[0,0]),
 mainSource:null,mainZone:null
});
const finish=(frame:InfoFrame)=>{
 frame.available=frame.units>0;
 frame.mainSource=topKey(frame.sourceCounts);
 frame.mainZone=topKey(frame.zoneCounts) as InfoZone|null;
 return frame;
};
const matchesForTurn=(sheet:DailySheet,turn:Turno)=>sheet.matches[turn]||[];
export function postMovementFrame(id:string,label:string,sheet:DailySheet,
 turn:Turno,rawHeads?:CabezasDia|null):InfoFrame{
 // POST: la unidad es (cabeza real, jurisdicción, fuente), no cada
 // recorrido geométrico de una misma cabeza.
 const declared=rawHeads?JURS.filter(j=>/^\d{4}$/.test(rawHeads[turn]?.[j]||'')).length:
   sheet.heads[turn]?.length||0;
 const frame=newFrame(id,label,'POST',declared);
 const seen=new Set<string>();
 for(const match of matchesForTurn(sheet,turn)){
  for(const hit of match.hits.filter(h=>h.kind==='vt3')){
   addUnit(frame,match.jurisdiccion+'|'+match.cabeza,hit.sourceId,hit.paths,seen);
  }
 }
 return finish(frame);
}
export function preMovementFrame(view:LaloView|null,turn:Turno):InfoFrame{
 const frame=newFrame('pre','Hoy · candidatos para '+turn,'PRE');
 if(!view||view.target!==turn)return frame;
 const seen=new Set<string>();
 for(const family of view.ranks.vt3.slice(0,10)){
  const bySource=new Map<SourceId,Path[]>();
  for(const route of family.paths){
   const paths=bySource.get(route.sourceId)||[];
   paths.push(route.path);bySource.set(route.sourceId,paths);
  }
  for(const [source,paths] of bySource)addUnit(frame,family.family,source,paths,seen);
 }
 return finish(frame);
}
export function buildInfoReport(date:string,turn:Turno,data:CabezasDia|null,
 sheet:DailySheet|null,historical:LaloHistorical[],view:LaloView|null):InfoReport{
 const expected=jurisdiccionesHabituales(date,turn);
 const observed=JURS.filter(j=>/^\d{4}$/.test(data?.[turn]?.[j]||''))
  .map(j=>({jurisdiction:j,head:data![turn][j]}));
 const observedKeys=new Set(observed.map(x=>x.jurisdiction));
 const withoutHead=expected.filter(j=>!observedKeys.has(j));
 const availableSources=(sheet?.columns.slice(0,TURNOS.indexOf(turn)+1)||[])
  .map(col=>({id:col.id,label:sourceLabel(col.id),
   active:col.values.some(v=>/^\d{2}$/.test(v))}));
 const historyLabels=historical.filter(h=>h.date<date)
  .map(h=>h.period+' ('+h.date+')');
 const frames:InfoFrame[]=[];
 for(const period of ['D−7','D−1'] as const){
  const hist=historical.find(h=>h.period===period&&h.date<date);
  if(hist){
   const title=period==='D−7'?'Semana pasada':'Jornada anterior';
   const frame=postMovementFrame(period,readableDrawDate(hist.date)+' · '+turn,
    hist.sheet,turn);
   frame.context=title;
   frames.push(frame);
  }
 }
 const targetIdx=TURNOS.indexOf(turn);
 const prior=[...TURNOS.slice(0,targetIdx)].reverse()
  .find(t=>JURS.some(j=>/^\d{4}$/.test(data?.[t]?.[j]||'')));
 if(prior&&sheet)frames.push(postMovementFrame('today-post',
  'Hoy · '+prior+' (resultado)',sheet,prior,data));
 frames.push(preMovementFrame(view,turn));
 const pre=frames[frames.length-1];
 const before=[...frames.slice(0,-1)].reverse().find(f=>f.available);
 const narrative:string[]=[];
 if(!sheet||!view){
  narrative.push('Actualizá la hoja para obtener una lectura de sus recorridos reales.');
 }else if(!pre.available){
  narrative.push('Todavía no hay familias VT3 con recorridos admitidos en el Top10 para este turno. No se puede identificar un sector principal.');
 }else{
  const count=pre.units;
  narrative.push('El Top10 VT3 disponible para '+turn+' tiene '+count+
   ' aporte(s) de familia y fuente física. '+
   (pre.mainSource?'La fuente con más familias representadas es '+sourceLabel(pre.mainSource as SourceId)+'.':
    'No hay una única fuente dominante entre esos aportes.')+' '+
   (pre.mainZone?'El sector más recorrido es el '+pre.mainZone.toLowerCase()+'.':
    'No se distingue un único sector dominante.'));
  if(before){
   const priorSource=before.mainSource?sourceLabel(before.mainSource as SourceId):null;
   const currentSource=pre.mainSource?sourceLabel(pre.mainSource as SourceId):null;
   const sectorCompare=pre.mainZone&&before.mainZone?
    (pre.mainZone===before.mainZone?'La zona de mayor actividad coincide con '+before.label+'.':
     'La zona más recorrida pasó de '+before.mainZone.toLowerCase()+' a '+pre.mainZone.toLowerCase()+
      ' al comparar '+before.label+' con este PRE.'):
    'No hay suficientes datos para establecer continuidad de zona.';
   const sourceCompare=currentSource&&priorSource?
    (currentSource===priorSource?'La fuente principal es la misma en ambas lecturas.':
     'La fuente principal cambió de '+priorSource+' a '+currentSource+'.'):
     'La distribución entre fuentes no permite señalar un cambio único.';
   narrative.push(sectorCompare+' '+sourceCompare);
  }else narrative.push('No hay coincidencias VT3 anteriores suficientes para contrastar desplazamientos con este PRE.');
 }
 const notices=[
  'Los cuadros históricos son coincidencias reales POST. El último cuadro muestra recorridos candidatos PRE, no resultados.',
  'Los cambios de zona o fuente describen dónde aparecen recorridos; no demuestran que el próximo sorteo repita o siga ese movimiento.',
  'Los aportes se cuentan una vez por familia/fuente (PRE) o cabeza/fuente (POST), sin multiplicar pruebas por rutas alternativas.'
 ];
 return {date,turn,observed,expected,withoutHead,availableSources,
  historyLabels,frames,narrative,notices};
}
