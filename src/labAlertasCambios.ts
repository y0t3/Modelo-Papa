/**
 * Radar de CAMBIOS DE FIGURA; NO modifica ningun motor.
 *
 * Cada señal depende únicamente de rutas PRE, TOPs PRE y cabezas
 * verdaderamente ganadoras en fechas/turnos ANTERIORES al objetivo.
 *
 * La identidad es tablero/fuente/celdas/longitud, nunca una familia.
 * VT2 y VT3 tienen un presupuesto igual de DOS focos por turno.
 * La evaluación de cabezas POST vive en evaluateChangeAlertsPOST().
 */
import type {Figure,Board,Kind} from './labRadarFiguras';
import type {Witness} from './labTresHojasTestigos';
import {figureSupport} from './labTresHojasTestigos';
import {reversibleFamily} from './motorLalo';
import {TURNOS} from './domain';

export type RecordOfTop={date:string;turn:string;figures:Figure[]};
export type AlertKind='NACE_CON_TESTIGO'|'REAPARECE_CON_TESTIGO'|
 'REFUERZO_REAL_INTRADIA'|'MADRE_CON_EXTENSION_AUXILIAR';
export type FigureAlert={
 id:string;date:string;turn:string;board:Board;kind:Kind;
 source:string;shape:string;site:string;engines:string[];
 ranks:Record<string,number>;readings:string[];families:string[];
 alertKinds:AlertKind[];winnerEvents:number;winnerDays:number;
 seenPrev3:number;seenPrev6:number;
 reasons:{date:string;turn:string;jur:string;head:string}[];
};
export type AlertPreview={date:string;turn:string;
 proposed:FigureAlert[];focus:FigureAlert[];
 eligibleFigureCount:Record<'VT2'|'VT3',number>;
 maxFocusPerKind:2;
};
const figureKey=(f:Figure)=>[f.board,f.kind,f.source,f.site].join('|');
const shortList=(x:FigureAlert)=>{
 const isBirth=x.alertKinds.includes('NACE_CON_TESTIGO');
 const reappear=x.alertKinds.includes('REAPARECE_CON_TESTIGO');
 const intraday=x.alertKinds.includes('REFUERZO_REAL_INTRADIA');
 const bonus=x.alertKinds.includes('MADRE_CON_EXTENSION_AUXILIAR');
 return [Number(isBirth),Number(reappear),Number(intraday),
   Number(bonus),Math.min(x.winnerDays,3),
   Math.min(x.winnerEvents,4),
   10-Math.min(10,...Object.values(x.ranks))];
};
const compare=(a:FigureAlert,b:FigureAlert)=>{
 const x=shortList(a),y=shortList(b);
 for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];
 return a.id.localeCompare(b.id);
};
const kindLength=(x:Kind)=>x==='VT2'?2:x==='VT3'?3:4;
const concatHistory=(older:RecordOfTop[],date:string,turn:string)=>{
 if(older.some(x=>x.date>=date||x.turn!==turn))
  throw Error('FUGA: fotos históricas deben ser anteriores y del mismo turno');
 const recent=[...older].sort((a,b)=>a.date.localeCompare(b.date)).slice(-6);
 if(new Set(recent.map(x=>x.date)).size!==recent.length)
  throw Error('FUGA: fecha histórica duplicada');
 return recent;
};
export function prepareChangeAlerts(
 current:RecordOfTop,older:RecordOfTop[],witnesses:Witness[]
):AlertPreview{
 if(current.figures.some(f=>f.date!==current.date||f.turn!==current.turn))
  throw Error('FUGA: figura de otro corte');
 const recent=concatHistory(older,current.date,current.turn);
 const targetIndex=TURNOS.indexOf(current.turn as typeof TURNOS[number]);
 if(targetIndex<0)throw Error('Turno no reconocido');
 if(witnesses.some(w=>w.date>current.date||
    (w.date===current.date&&
     TURNOS.indexOf(w.turn as typeof TURNOS[number])>=targetIndex)))
  throw Error('FUGA: testigo del objetivo o del futuro');
 const recentSets=recent.map(x=>new Set(x.figures.map(figureKey)));
 const today=recent.at(-1)?.date;
 const proposed:FigureAlert[]=[];
 const byBoard=new Map<string,Set<Board>>();
 for(const fig of current.figures){
  for(const fam of fig.families){
   const key=fig.kind+'|'+fam;
   const set=byBoard.get(key)||new Set<Board>();
   set.add(fig.board);byBoard.set(key,set);
  }
 }
 // Extension VERIFICADA como lectura actual de ruta VT3 seleccionada
 // en cada auxiliar; no combina casillas y nunca usa resultado POST.
 const auxExtensions=new Map<string,Set<Board>>();
 for(const f of current.figures.filter(x=>x.kind==='VT3'&&x.board!=='PLUS11')){
  for(const reading of f.readings){
   const mother=reversibleFamily(reading.slice(1));
   const set=auxExtensions.get(mother)||new Set<Board>();
   set.add(f.board);auxExtensions.set(mother,set);
  }
 }
 for(const f of current.figures){
  if(f.kind!=='VT2'&&f.kind!=='VT3')continue;
  const prev6=recentSets.filter(set=>set.has(figureKey(f))).length;
  const prev3=recentSets.slice(-3).filter(set=>set.has(figureKey(f))).length;
  const support=figureSupport(f,witnesses,current.date);
  // No depender de los seis ejemplos visuales, que son sólo una muestra
  // de los testigos. La identidad física puede contener más antecedentes.
  const exactRoots=witnesses.filter(w=>w.kind===f.kind&&w.board===f.board&&
   w.source===f.source&&w.site===f.site);
  const rootsToday=exactRoots.some(w=>w.date===current.date);
  const historicalRoots=exactRoots.some(w=>w.date<current.date);
  const kinds:AlertKind[]=[];
  if(recent.length>=3&&prev6===0&&historicalRoots>0)
   kinds.push('NACE_CON_TESTIGO');
  // Debe haber figurado antes, estar ausente en la última jornada y
  // retornar tras al menos una jornada de intervalo.
  if(recent.length>=3&&prev6>0&&
    !recentSets.at(-1)!.has(figureKey(f))&&support.exactEvents>0)
   kinds.push('REAPARECE_CON_TESTIGO');
  if(rootsToday)kinds.push('REFUERZO_REAL_INTRADIA');
  // Conserva la lectura VT2 destacada en una hoja y sus dos opciones
  // de extensión VT3 realmente presentes en sendas auxiliares.
  if(f.kind==='VT2'&&f.families.some(fam=>
    auxExtensions.get(fam)?.size===2))
   kinds.push('MADRE_CON_EXTENSION_AUXILIAR');
  if(kinds.length)proposed.push({
   id:f.id,date:current.date,turn:current.turn,
   board:f.board,kind:f.kind,source:f.source,shape:f.shape,
   site:f.site,engines:f.engines,
   ranks:f.bestRanks,readings:f.readings,families:f.families,
   alertKinds:kinds,winnerEvents:support.exactEvents,
   winnerDays:support.exactDays,seenPrev3:prev3,seenPrev6:prev6,
   reasons:support.exactWitnesses
  });
 }
 const chosen:FigureAlert[]=[];
 for(const kind of ['VT2','VT3'] as const){
  const same=proposed.filter(x=>x.kind===kind).sort(compare);
  // Primero cada tablero por separado (sin mezclar geometrías), luego
  // dos focos por longitud. No se decide segun cifras del futuro.
  const topByBoard=['PLUS11','AUX_AYER','AUX_HOY']
   .map(board=>same.find(x=>x.board===board)).filter(Boolean) as FigureAlert[];
  chosen.push(...topByBoard.sort(compare).slice(0,2));
  if(chosen.filter(x=>x.kind===kind).length<2)
   for(const a of same)if(chosen.filter(x=>x.kind===kind).length<2&&
     !chosen.includes(a))chosen.push(a);
 }
 return {date:current.date,turn:current.turn,
  proposed,focus:chosen,maxFocusPerKind:2,
  eligibleFigureCount:{
   VT2:current.figures.filter(f=>f.kind==='VT2').length,
   VT3:current.figures.filter(f=>f.kind==='VT3').length
  }};
}
export type EventResult={figureId:string;board:Board;kind:Kind;
  hit:boolean;headCount:number;headLabels:string[]};
export const physicalHit=(fig:Pick<Figure,'kind'|'readings'>,
 heads:{jur:string;head:string}[])=>{
 const n=kindLength(fig.kind);
 const hits=heads.filter(h=>/^\d{4,5}$/.test(h.head)).filter(h=>{
  const suffix=h.head.slice(-n);
  return fig.readings.some(v=>v===suffix||
   [...v].reverse().join('')===suffix);
 });
 return {hit:hits.length>0,heads:hits.map(h=>h.jur+' '+h.head)};
};
export function evaluateChangeAlertsPOST(
 preview:AlertPreview,figures:Figure[],
 heads:{jur:string;head:string}[]
){
 const byId=new Map(figures.map(f=>[f.id,f]));
 const scored=(a:FigureAlert):EventResult=>{
  const f=byId.get(a.id);
  if(!f)throw Error('Foco no tiene figura física PRE');
  const h=physicalHit(f,heads);
  return {figureId:a.id,board:a.board,kind:a.kind,
   hit:h.hit,headCount:h.heads.length,headLabels:h.heads};
 };
 return {proposed:preview.proposed.map(scored),focus:preview.focus.map(scored)};
}
export type MatchedPair={signal:Figure;control:Figure;
  signalHit:boolean;controlHit:boolean;match:'EXACTO'|'MISMA_HOJA_LONGITUD'};
export type MatchedControl={pairs:MatchedPair[];unmatched:number;
 exactGeometry:number;relaxedGeometry:number};
export function matchedControls(
 preview:AlertPreview,figures:Figure[],
 heads:{jur:string;head:string}[]
):MatchedControl{
 // Matching prioritario: MISMO corte, tablero, longitud, fuente y
 // silueta. Si no existe, mismo tablero/longitud (relajado y explícito).
 // No usar el resultado POST para decidir los pares.
 const flagged=new Set(preview.proposed.map(x=>x.id));
 const used=new Set<string>();
 const pairs:MatchedPair[]=[];
 let unmatched=0,exactGeometry=0,relaxedGeometry=0;
 for(const x of preview.focus){
  const left=figures.find(f=>f.id===x.id);
  if(!left)throw Error('Foco seleccionado PRE ausente');
  const candidates=figures.filter(f=>!flagged.has(f.id)&&!used.has(f.id)&&
   f.board===x.board&&f.kind===x.kind).sort((a,b)=>
    a.id.localeCompare(b.id));
  const exact=candidates.find(f=>f.source===x.source&&f.shape===x.shape);
  const alt=exact||candidates[0];
  if(!alt){unmatched++;continue;}
  used.add(alt.id);
  const match=exact?'EXACTO':'MISMA_HOJA_LONGITUD';
  if(exact)exactGeometry++;else relaxedGeometry++;
  pairs.push({signal:left,control:alt,
   signalHit:physicalHit(left,heads).hit,
   controlHit:physicalHit(alt,heads).hit,match});
 }
 return {pairs,unmatched,exactGeometry,relaxedGeometry};
}
