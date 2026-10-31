/**
 * LAB VT3 AUX: separar falta de ranking histórico de orden demasiado bajo.
 * Rellena exactamente 10 familias, reemplazando como máximo 1 o 3
 * candidatas oficiales por familias físicamente formables de otra fuente.
 *
 * Todas las decisiones PRE; Formas Primero prioriza SITIOS antes de leer
 * las cifras. Controles neutrales emparejados por hoja, pool y presupuesto.
 */
import type {AuxRank} from './motorLaloIntegral';
import type {AuxFormChoice} from './labAuxFormasPrimeroVT3';
export type SourceClass='unranked'|'deep'|'outside20';
export type Quota=1|3;
export type Admission={family:string;originalRank:number|null;
 siteRank:number;rootEvents:number;rootDays:number;
 exactEvents:number;sourceClass:SourceClass};
export type EmbudoSelection={families:string[];
 admissions:Admission[];dropped:string[];candidatePool:number;
 rankedPool:number;rankedPhysical:number;formFirstInspected:number};
const seedHash=(s:string)=>{
 let h=2166136261;
 for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
};
export function sourceGroup(rank:number|null,category:SourceClass):boolean{
 return category==='unranked'?rank===null:
  category==='deep'?rank!==null&&rank>20:
  rank===null||rank>20;
}
/** Ordena un Top10 con los mismos 10 puestos y sin repetir familias. */
export function selectAuxEmbudo(args:{
 historical:readonly AuxRank[];
 physical:readonly string[];
 forms:readonly AuxFormChoice[];
 category:SourceClass;quota:Quota;seed:string;
 neutral?:boolean;
}):EmbudoSelection{
 const {historical,physical,forms,category,quota,seed,neutral=false}=args;
 const known=new Map(historical.map(r=>[r.family,r.rank]));
 const physicalSet=new Set(physical);
 const original=historical.slice(0,10).map(r=>r.family);
 const full=new Set(physical);
 if(new Set(original).size!==original.length)
  throw Error('Top10 histórico duplicado');
 if(original.some(f=>!full.has(f)))
  throw Error('FUGA: ranking con familia sin camino físico');
 if(historical.length===0)return {families:[],admissions:[],dropped:[],
  candidatePool:0,rankedPool:0,rankedPhysical:physical.length,formFirstInspected:forms.length};
 const eligible=physical.filter(f=>sourceGroup(known.get(f)??null,category));
 const pool=new Set(eligible);
 const orderedForms=forms.filter(c=>pool.has(c.family));
 const dedup=[...new Map(orderedForms.map(c=>[c.family,c])).values()];
 const target=Math.min(quota,dedup.length,eligible.length);
 const selected=neutral?
  [...eligible].sort((a,b)=>seedHash(seed+'|'+a)-seedHash(seed+'|'+b)||
    a.localeCompare(b)).slice(0,target):
  dedup.slice(0,target).map(c=>c.family);
 const pickedSet=new Set(selected);
 const fromForms=new Map(dedup.map(c=>[c.family,c]));
 const admissions=selected.map(f=>{
  const r=fromForms.get(f);
  return {family:f,originalRank:known.get(f)??null,siteRank:r?.rank??0,
   rootEvents:r?.rootEvents??0,rootDays:r?.rootDays??0,
   exactEvents:r?.exactEvents??0,sourceClass:category};
 });
 const keep=original.slice(0,original.length-selected.length);
 // En caso de primeros turnos con menos de 10 raíces históricas, conservamos
 // exactamente su presupuesto original y reportamos los nuevos cupos.
 const families=[...keep,...selected];
 const dropped=original.slice(original.length-selected.length);
 if(new Set(families).size!==families.length||families.some(f=>!physicalSet.has(f)))
  throw Error('FUGA: candidato nuevo duplicado o no formable');
 if(keep.length+admissions.length!==original.length)throw Error('Presupuesto desigual');
 return {families,admissions,dropped,candidatePool:eligible.length,
  rankedPool:known.size,rankedPhysical:physical.length,
  formFirstInspected:forms.length};
}
