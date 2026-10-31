/** LAB VT3 LALO: ranking de frecuencia previa, sin geometría de puntuación.
 * El universo elegible SIEMPRE son familias físicamente formables en +11.
 * Nulo pareado: mismo número de familias de una/dos orientaciones.
 */
import type {CabezasDia} from './domain';
import {JURS,TURNOS} from './domain';
import {reversibleFamily} from './motorLalo';
import type {PhysicalAnatomy} from './labLaloAnatomiaSinPuestoVT3';
export type StatFamily={family:string;members:1|2;count:number;
 posterior:number;rank:number};
const valid=(x:string)=>/^\d{4}$/.test(x);
const factor=(f:string)=>f.split('/')[0]===f.split('/')[1]?1:2;
/** Esta memoria excluye TOTALMENTE la jornada objetivo. */
export function priorFrequencies(
 previous:readonly {date:string;heads:CabezasDia}[],
 date:string,priorStrength=500
):{n:number;rates:Map<string,number>;counts:Map<string,number>}{
 if(previous.some(p=>p.date>=date))throw Error('FUGA estadística: memoria contiene objetivo');
 const counts=new Map<string,number>();let n=0;
 for(const p of previous)for(const t of TURNOS)for(const j of JURS){
  if(j==='Montevideo')continue;
  const h=p.heads[t]?.[j]||'';
  if(!valid(h))continue;
  n++;const f=reversibleFamily(h.slice(-3));
  counts.set(f,(counts.get(f)||0)+1);
 }
 const rates=new Map<string,number>();
 for(const [f,c] of counts)rates.set(f,(c+priorStrength*factor(f)/1000)/(n+priorStrength));
 return {n,counts,rates};
}
export function rankedByFrequency(
 physical:readonly PhysicalAnatomy[],stats:ReturnType<typeof priorFrequencies>,
 priorStrength=500
):StatFamily[]{
 if(priorStrength<=0)throw Error('Prior debe ser positivo');
 const all=physical.map(x=>({
  family:x.family,members:x.members,count:stats.counts.get(x.family)||0,
  posterior:((stats.counts.get(x.family)||0)+priorStrength*x.members/1000)/
   (stats.n+priorStrength),rank:0
 }));
 all.sort((a,b)=>b.posterior-a.posterior||
  b.members-a.members||a.family.localeCompare(b.family));
 return all.map((x,i)=>({...x,rank:i+1}));
}
const hash=(x:string)=>{let h=2166136261;for(const c of x){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
/** Control ciego al POST, cuota exactamente igual por 1/2 orientaciones. */
export function neutralMatched(
 physical:readonly PhysicalAnatomy[],target:readonly string[],seed:string
):string[]{
 const targetMembers=target.map(f=>factor(f));
 const result:string[]=[];
 for(const members of [1,2]){
  const count=targetMembers.filter(n=>n===members).length;
  const candidates=physical.filter(f=>f.members===members)
   .sort((a,b)=>hash(seed+'|'+a.family)-hash(seed+'|'+b.family)||
    a.family.localeCompare(b.family));
  if(candidates.length<count)throw Error('Control sin suficientes orientaciones');
  result.push(...candidates.slice(0,count).map(f=>f.family));
 }
 if(new Set(result).size!==result.length||result.length!==target.length)
  throw Error('Presupuesto neutral distinto');
 return result;
}
export function expectedUniform(families:readonly string[],nHeads:number){
 return nHeads*families.reduce((s,f)=>s+factor(f),0)/1000;
}
