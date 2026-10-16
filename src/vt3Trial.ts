// Tercera selección VT3 experimental. Nunca altera el motor ni alimenta VT4.
import type {LaloView} from './motorLalo';
import type {ShadowSelection} from './vt3Shadow';
export type TrialFamily={family:string;origin:'geometria'|'nueva';reason:string};
export type TrialSelection={method:'DOS_GEOMETRIA_UNA_NUEVA_V1';top:TrialFamily[]};
/**
 * Dos madres de Geometría Completa y una familia que sólo aparece en una
 * columna posterior del día. Si no existe tal familia admitida por Lalo,
 * completa por orden geométrico. No usa cabezas del turno objetivo.
 */
export function buildVt3Trial(view:LaloView,shadow:ShadowSelection):TrialSelection{
 const output:TrialFamily[]=[];
 const seen=new Set<string>();
 const add=(family:string,origin:TrialFamily['origin'],reason:string)=>{
  if(output.length>=3||seen.has(family))return;
  seen.add(family);output.push({family,origin,reason});
 };
 shadow.top.slice(0,2).forEach(f=>add(f.family,'geometria','Caminos de Geometría Completa'));
 const newcomer=view.ranks.vt3.find(f=>!seen.has(f.family)&&
  f.paths.some(p=>p.sourceId!=='prevNocturno')&&
  !f.paths.some(p=>p.sourceId==='prevNocturno'));
 if(newcomer)add(newcomer.family,'nueva','Familia que aparece durante la jornada');
 for(const f of shadow.top)add(f.family,'geometria','Caminos de Geometría Completa');
 return {method:'DOS_GEOMETRIA_UNA_NUEVA_V1',top:output};
}
