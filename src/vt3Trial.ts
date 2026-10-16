// Tercer lector VT3 de investigación. NO altera Lalo ni alimenta VT4.
import type {LaloView} from './motorLalo';
import type {ShadowSelection} from './vt3Shadow';
export type TrialFamily={family:string;origin:'geometria'|'nueva';reason:string};
export type TrialSelection={method:'DOS_GEOMETRIA_UNA_NUEVA_V1';top:TrialFamily[]};
/**
 * Top3 sellable: dos madres de Geometría y una familia que nace físicamente
 * durante el día y que Lalo admite con testigos propios. Si todavía no existe,
 * la tercera sale de Geometría. Puestos 4..10: resto de la lectura geométrica.
 *
 * Nunca lee cabezas del turno objetivo. Cada madre procede de rutas físicas
 * comprobadas en una fuente habilitada por el turno PRE, sin cruzar columnas.
 */
export function buildVt3Trial(view:LaloView,shadow:ShadowSelection):TrialSelection{
 const output:TrialFamily[]=[];
 const seen=new Set<string>();
 const add=(family:string,origin:TrialFamily['origin'],reason:string)=>{
  if(output.length>=10||seen.has(family))return;
  seen.add(family);output.push({family,origin,reason});
 };
 shadow.top.slice(0,2).forEach(f=>add(f.family,'geometria','Selección geométrica'));
 const newcomer=view.ranks.vt3.find(f=>!seen.has(f.family)&&
  f.paths.some(p=>p.sourceId!=='prevNocturno')&&
  !f.paths.some(p=>p.sourceId==='prevNocturno'));
 if(newcomer)add(newcomer.family,'nueva','Familia nacida durante la jornada');
 // Completar primero el tercer puesto y luego los puestos 4..10 con el
 // orden geométrico. Nunca repetir una familia ni crear inversas nuevas.
 for(const f of shadow.top)add(f.family,'geometria','Selección geométrica');
 return {method:'DOS_GEOMETRIA_UNA_NUEVA_V1',top:output};
}
