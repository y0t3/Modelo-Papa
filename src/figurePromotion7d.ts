// Memoria causal de figura original y UNA traslacion congelada.
// La confirmacion en sorteos distintos habilita promocion; no convierte inversas en aciertos exactos.
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {Path} from './paths';
import type {FigureFollowup7D} from './figureFollowup7d';
import type {TranslationPair7D} from './figureTranslation7d';
import {freezeFigureReadings7D} from './figureReadings7d';
import {initialTranslationMemory7D,observeTranslatedFigure7D} from './figureTranslationMemory7d';
import type {TranslationObservation7D} from './figureTranslationMemory7d';

export type PromotionRule7D='CONSERVAR'|'TRASLADAR_DESDE_INICIO'|'UNA_NUEVA'|'DOS_NUEVAS'|'MARCA_PREVIA_MAS_UNA';
export type PromotionFocusState7D={origin:FigureFollowup7D;fixedCoordinates:string[];shiftedCoordinates:string[];
 selectedOn:string;historicalExactDraws:number;observations:TranslationObservation7D[]};
export type FocusPriorDecision7D={date:string;turn:Turno;rule:PromotionRule7D;
 role:'PRINCIPAL_FIJA'|'PROMOVER_TRASLADADA'|'MANTENER_TRASLADADA';
 chosenCoordinates:string[];exclusivePriorDraws:number;historicalExactDraws:number;projected?:string;reason:string};
const same=(a:string[],b:string[])=>a.join('>')===b.join('>');
const parse=(id:string)=>{const p=id.split(':').map(Number);
 if(p.length!==2||p.some(x=>!Number.isInteger(x)))throw Error('Coordenada invalida');
 return {row:p[0],col:p[1]};};
const valid=(p:{row:number,col:number}[],vals:string[])=>p.every(c=>c.row>=0&&c.row<6&&c.col>=0&&c.col<2&&/^\d{2}$/.test(vals[c.row]||''));
const attach=(cs:string[],vals:string[]):Path=>cs.map(id=>{const p=parse(id);return {...p,digit:vals[p.row][p.col]};});
const momentOK=(state:PromotionFocusState7D,date:string,target:Turno)=>{
 if(target!==state.origin.target||date<=state.origin.dateStarted)throw Error('Turno o fecha distintos del episodio');
 const last=state.observations[state.observations.length-1];
 if(last&&date<=last.date)throw Error('Sorteo repetido o no cronologico');
};
export function createPromotionFocus7D(origin:FigureFollowup7D,first:TranslationPair7D):PromotionFocusState7D{
 if(!first.fixed||!first.shifted||first.date<=origin.dateStarted||first.turn!==origin.target||
  first.fixed.kind!==origin.kind||first.shifted.kind!==origin.kind||
  first.fixed.sourceId!==origin.sourceId||first.shifted.sourceId!==origin.sourceId||
  !same(first.fixed.coordinates,origin.originCoordinates)||
  same(first.shifted.coordinates,first.fixed.coordinates))throw Error('Raiz y traslacion inicial deben estar disponibles');
 const fixed=first.fixed.coordinates.map(parse),moved=first.shifted.coordinates.map(parse);
 const dr=moved[0].row-fixed[0].row,dc=moved[0].col-fixed[0].col;
 if(Math.abs(dr)>1||Math.abs(dc)>1||(!dr&&!dc)||!fixed.every((p,i)=>
  moved[i].row-p.row===dr&&moved[i].col-p.col===dc))throw Error('Traslacion no rigida o no adyacente');
 return {origin,fixedCoordinates:[...first.fixed.coordinates],shiftedCoordinates:[...first.shifted.coordinates],
  selectedOn:first.date,historicalExactDraws:first.score.exactDraws,observations:[]};
}
export function previewPromotionFocus7D(state:PromotionFocusState7D,sheet:DailySheet,date:string,turn:Turno):TranslationPair7D{
 momentOK(state,date,turn);
 if(date<state.selectedOn)throw Error('La traslacion aun no habia sido seleccionada');
 const col=sheet.columns.find(c=>c.id===state.origin.sourceId);
 if(!col)return {date,turn,validTranslations:0,score:{exactDraws:state.historicalExactDraws,nearDraws:0},reason:'Columna no disponible'};
 const make=(cs:string[])=>{
  const p=cs.map(parse);
  return valid(p,col.values)?freezeFigureReadings7D(sheet,date,turn,state.origin.kind,state.origin.sourceId,attach(cs,col.values)):undefined;
 };
 const fixed=make(state.fixedCoordinates),shifted=make(state.shiftedCoordinates);
 return {date,turn,fixed,shifted,validTranslations:shifted?1:0,
  score:{exactDraws:state.historicalExactDraws,nearDraws:0},reason:'Ambas rutas ya congeladas; no se reelige a partir de resultados'};
}
const exclusiveCount=(state:PromotionFocusState7D)=>state.observations.filter(x=>x.status==='SOLO_TRASLADADA').length;
const qualifies=(rule:PromotionRule7D,count:number,historical:number)=>
 rule==='TRASLADAR_DESDE_INICIO'||rule==='UNA_NUEVA'&&count>=1||
 rule==='DOS_NUEVAS'&&count>=2||rule==='MARCA_PREVIA_MAS_UNA'&&count>=1&&historical>=1;
export function decidePromotionFocus7D(state:PromotionFocusState7D,preview:TranslationPair7D,rule:PromotionRule7D):FocusPriorDecision7D{
 momentOK(state,preview.date,preview.turn);
 if(preview.fixed&&!same(preview.fixed.coordinates,state.fixedCoordinates))throw Error('Cambio no autorizado de raiz');
 if(preview.shifted&&!same(preview.shifted.coordinates,state.shiftedCoordinates))throw Error('Cambio no autorizado de traslacion');
 const count=exclusiveCount(state),canMove=qualifies(rule,count,state.historicalExactDraws)&&!!preview.shifted;
 const prior=state.observations.slice(0,-1).filter(x=>x.status==='SOLO_TRASLADADA').length;
 const wasQualified=qualifies(rule,prior,state.historicalExactDraws);
 const role:FocusPriorDecision7D['role']=canMove?(wasQualified?'MANTENER_TRASLADADA':'PROMOVER_TRASLADADA'):'PRINCIPAL_FIJA';
 return {date:preview.date,turn:preview.turn,rule,role,
  chosenCoordinates:[...(canMove?state.shiftedCoordinates:state.fixedCoordinates)],
  exclusivePriorDraws:count,historicalExactDraws:state.historicalExactDraws,
  projected:(canMove?preview.shifted:preview.fixed)?.direct,
  reason:canMove?'Prioriza traslacion tras evidencia anterior; conserva raiz.':
   qualifies(rule,count,state.historicalExactDraws)?'La traslacion no es legible; conserva la raiz.':
   'Observa traslacion sin promover; apoyo VT2 parcial no es confirmacion suficiente.'};
}
export function recordPromotionOutcome7D(state:PromotionFocusState7D,preview:TranslationPair7D,heads:string[]):PromotionFocusState7D{
 momentOK(state,preview.date,preview.turn);
 if(preview.fixed&&!same(preview.fixed.coordinates,state.fixedCoordinates))throw Error('Raiz cambiada');
 if(preview.shifted&&!same(preview.shifted.coordinates,state.shiftedCoordinates))throw Error('Traslacion cambiada');
 const prev={...initialTranslationMemory7D(state.origin),observations:state.observations};
 const now=observeTranslatedFigure7D(prev,state.origin,preview,heads);
 return {...state,observations:now.observations};
}
