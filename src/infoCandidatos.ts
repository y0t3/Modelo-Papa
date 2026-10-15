// Secuencia PRE reconstructiva para INFO. Motor y fuentes intactos:
// sólo se ocultan columnas y resultados futuros respecto de cada corte.
import {JURS,TURNOS} from './domain';
import type {CabezasDia,Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import type {LaloHistorical,LaloKind,LaloView} from './motorLalo';
import {buildMotorLalo} from './motorLalo';
import type {Path} from './paths';

export type MovementMode='todos'|LaloKind;
export const MOVEMENT_KINDS=['vt2','vt3','vt4'] as const;
export const MOVEMENT_SOURCES:SourceId[]=[
 'prevNocturno','Previa','Primera','Matutino','Vespertino'
];
export type MovementSource={
 id:SourceId; label:string;
 counts:Record<LaloKind,number[][]>;families:Record<LaloKind,string[]>;
 cellFamilies:Record<LaloKind,string[][][]>;units:Record<LaloKind,number>
};
export type CandidateFrame={
 id:string;label:string;note:string;cut:number;
 isActual:boolean;turn:Turno;totalFamilies:Record<LaloKind,number>;
 sources:MovementSource[];
 sourceLeader:SourceId|null;zoneLeader:string|null;
 currentFamilies:Record<LaloKind,string[]>;
 comparison:string;available:boolean
};
export type CandidateSequence={
 date:string;turn:Turno;frames:CandidateFrame[];
 warning:string
};
export const movementSourceName=(id:SourceId)=>({
 prevNocturno:'Nocturna anterior',Previa:'Previa',Primera:'Primera',
 Matutino:'Matutina',Vespertino:'Vespertina'
})[id];
const blankCounts=()=>Array.from({length:6},()=>[0,0]);
const blankFamilies=()=>Array.from({length:6},()=>[[],[]] as string[][]);
const makeSource=(id:SourceId):MovementSource=>({
 id,label:movementSourceName(id),
 counts:{vt2:blankCounts(),vt3:blankCounts(),vt4:blankCounts()},
 cellFamilies:{vt2:blankFamilies(),vt3:blankFamilies(),vt4:blankFamilies()},
 families:{vt2:[],vt3:[],vt4:[]},units:{vt2:0,vt3:0,vt4:0}
});
export const positionsForMode=(view:MovementSource,mode:MovementMode)=>
 mode==='todos'?MOVEMENT_KINDS.filter(k=>view.units[k]>0):[mode].filter(k=>view.units[k]>0);
const zoneFor=(path:Path):'superior'|'central'|'inferior'=>{
 const avg=path.reduce((sum,p)=>sum+p.row,0)/path.length;
 return avg<2?'superior':avg<4?'central':'inferior';
};
const strongest=(counts:Map<string,number>)=>{
 const sorted=[...counts].filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 return !sorted.length||sorted[1]?.[1]===sorted[0][1]?null:sorted[0][0];
};

/**
 * Fuente visible de la etapa: columna 0 siempre es la Nocturna anterior,
 * luego sólo las columnas de turnos que YA terminaron.
 * Los matches y heads de turnos posteriores desaparecen también de la hoja.
 */
export function preSheetAtCut(sheet:DailySheet,target:Turno,cut:number):DailySheet{
 const targetIdx=TURNOS.indexOf(target);
 if(targetIdx<0||cut<0||cut>targetIdx||!Number.isInteger(cut))
  throw new Error('Corte PRE fuera del turno objetivo');
 const columns=sheet.columns.map((col,i)=>({
  ...col,values:i<=cut?[...col.values]:Array(6).fill('--')
 }));
 const heads:Record<string,string[]>={};
 const matches:DailySheet['matches']={};
 for(let i=0;i<TURNOS.length;i++){
  const turn=TURNOS[i];
  heads[turn]=i<cut?[...(sheet.heads[turn]||[])]:[];
  matches[turn]=i<cut?[...(sheet.matches[turn]||[])]:[];
 }
 return {columns,heads,matches};
}

function frameFromView(id:string,label:string,note:string,cut:number,
 isActual:boolean,turn:Turno,view:LaloView,masked:DailySheet):CandidateFrame{
 const sources=masked.columns.slice(0,cut+1).map(c=>makeSource(c.id));
 const bySource=new Map(sources.map(s=>[s.id,s]));
 const sourceMass=new Map<string,number>();
 const zones=new Map<string,number>();
 const currentFamilies={
  vt2:view.ranks.vt2.slice(0,10).map(f=>f.family),
  vt3:view.ranks.vt3.slice(0,10).map(f=>f.family),
  vt4:view.ranks.vt4.slice(0,10).map(f=>f.family)
 };
 for(const kind of MOVEMENT_KINDS){
  for(const family of view.ranks[kind].slice(0,10)){
   const grouped=new Map<SourceId,Path[]>();
   for(const route of family.paths){
    if(!bySource.has(route.sourceId))continue;
    if(route.kind!==kind)continue;
    const paths=grouped.get(route.sourceId)||[];
    paths.push(route.path);grouped.set(route.sourceId,paths);
   }
   for(const [sourceId,paths] of grouped){
    const source=bySource.get(sourceId)!;
    // Una familia y fuente suman una unidad; dos rutas físicas de la
    // misma familia no generan dos aportes independientes.
    source.units[kind]++;
    source.families[kind].push(family.family);
    sourceMass.set(sourceId,(sourceMass.get(sourceId)||0)+1);
    const uniqueZones=new Set(paths.map(zoneFor));
    for(const z of uniqueZones)zones.set(z,(zones.get(z)||0)+1);
    const occupied=new Set<string>();
    for(const route of paths)
     for(const cell of route)
      if(cell.row>=0&&cell.row<6&&cell.col>=0&&cell.col<2)
       occupied.add(cell.row+':'+cell.col);
    for(const location of occupied){
     const [row,col]=location.split(':').map(Number);
     source.counts[kind][row][col]++;
     source.cellFamilies[kind][row][col].push(family.family);
    }
   }
  }
 }
 return {
  id,label,note,cut,isActual,turn,
  totalFamilies:Object.fromEntries(MOVEMENT_KINDS.map(kind=>[kind,currentFamilies[kind].length]))
   as Record<LaloKind,number>,
  sources,sourceLeader:strongest(sourceMass) as SourceId|null,
  zoneLeader:strongest(zones),currentFamilies,
  comparison:'',available:sourceMass.size>0
 };
}
export function sequenceMovementSummary(current:CandidateFrame,previous:CandidateFrame|null):string{
 const candidates=MOVEMENT_KINDS.reduce((n,k)=>n+current.totalFamilies[k],0);
 if(!candidates)return 'Este corte todavía no reúne familias admitidas en los Tops físicos.';
 const currentSource=current.sourceLeader?movementSourceName(current.sourceLeader):null;
 const now=currentSource?
  'Mayor concentración de familias por fuente: '+currentSource+'.':
  'No hay una única fuente predominante.';
 const sector=current.zoneLeader?
  ' Sector más recorrido: '+current.zoneLeader+'.':
  ' Sin sector único predominante.';
 if(!previous)return 'Panorama inicial con '+candidates+' familias en los Tops disponibles. '+now+sector;
 if(current.isActual&&previous.cut===current.cut)
  return 'Resumen PRE del turno: utiliza el mismo último corte disponible, sin agregar resultados nuevos. '+now+sector;
 const before=new Set(MOVEMENT_KINDS.flatMap(k=>previous.currentFamilies[k].map(f=>k+'|'+f)));
 const after=new Set(MOVEMENT_KINDS.flatMap(k=>current.currentFamilies[k].map(f=>k+'|'+f)));
 const added=[...after].filter(x=>!before.has(x)).length;
 const removed=[...before].filter(x=>!after.has(x)).length;
 const shift=current.sourceLeader&&previous.sourceLeader&&
  current.sourceLeader!==previous.sourceLeader?
  ' La fuente más representada cambió de '+movementSourceName(previous.sourceLeader)+
   ' a '+movementSourceName(current.sourceLeader)+'.':'';
 return 'Cambio de Tops desde el corte anterior: '+added+' familia(s) ingresan y '+
  removed+' salen. '+now+sector+shift;
}

/**
 * Todos los cortes evalúan EL MISMO TURNO OBJETIVO. Las cabezas posteriores
 * nunca entran, aunque el usuario abra una jornada histórica ya finalizada.
 * Es reconstrucción PRE con los datos históricos actuales, no un PRE sellado
 * realmente antes de cada sorteo.
 */
export function buildCandidateSequence(date:string,target:Turno,
 data:CabezasDia|null,sheet:DailySheet|null,historical:LaloHistorical[]):CandidateSequence{
 const warning='Secuencia PRE reconstruida: cada cuadro usa solamente columnas conocidas hasta ese corte. '+ 
  'No son pronósticos históricos sellados ni seguimiento de la misma cabeza; los Tops se recalculan de manera descriptiva.';
 if(!date||!sheet)return {date,turn:target,frames:[],warning};
 const targetIdx=TURNOS.indexOf(target);
 if(targetIdx<0)return {date,turn:target,frames:[],warning};
 const cuts:{id:string;label:string;note:string;cut:number;actual:boolean}[]=[
  {id:'base',label:'Inicio',note:'Nocturna anterior',cut:0,actual:false}
 ];
 for(let i=0;i<targetIdx;i++){
  const turn=TURNOS[i];
  const hasDraw=JURS.some(j=>/^\d{4}$/.test(data?.[turn]?.[j]||''));
  if(!hasDraw)continue;
  cuts.push({id:'tras-'+turn,label:'Tras '+turn,
   note:'Con las cabezas ya registradas de '+turn,cut:i+1,actual:false});
 }
 const last=cuts[cuts.length-1];
 cuts.push({id:'pre',label:'PRE · '+target,note:'Panorama antes de '+target,
  cut:last.cut,actual:true});
 const frames:CandidateFrame[]=[];
 for(const stage of cuts){
  const trimmed=preSheetAtCut(sheet,target,stage.cut);
  const view=buildMotorLalo(trimmed,date,target,historical);
  const frame=frameFromView(stage.id,stage.label,stage.note,
   stage.cut,stage.actual,target,view,trimmed);
  frame.comparison=sequenceMovementSummary(frame,frames[frames.length-1]||null);
  frames.push(frame);
 }
 return {date,turn:target,frames,warning};
}
