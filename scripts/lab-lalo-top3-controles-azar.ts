/**
 * Control de aleatoriedad que usa EXACTAMENTE el mismo universo elegible:
 * unión del Top6 de Lalo y Top6 de la memoria auxiliar en cada corte.
 * 399 órdenes fijos generados sin mirar el resultado, con presupuesto bruto
 * <= terminaciones del Top3 Lalo y máximo tres familias indivisibles.
 * Comparar resultados de PUENTE / DOS_UNO / AUX vs la distribución nula.
 */
import {readFileSync,writeFileSync} from 'node:fs';
type N=2|3|4;
type F={family:string;values:string[]};
type Cut={year:string;date:string;turn:string;heads:{jur:string;head:string}[];
 ranks:Record<N,Record<'LALO_MV1'|'AUX_RAICES',F[]>>};
type Row={year:string;date:string;turn:string;kind:N;method:string;
 budgeted:boolean;result:{hits:number;expected:number}};
const triple:Cut[]=['2024','2025','2026'].flatMap(y=>
 (JSON.parse(readFileSync('lab-results/lalo-triple-modalidad-'+y+'.json','utf8')).cuts as Cut[])
 .filter(c=>c.turn!=='Previa'));
const earlier=JSON.parse(readFileSync('lab-results/lalo-top3-doble-hoja.json','utf8'));
const rows:Row[]=earlier.rows;
const fnv=(s:string)=>{let h=2166136261;for(const c of s){
 h^=c.charCodeAt(0);h=Math.imul(h,16777619);
 }return h>>>0;};
const unique=<T>(xs:T[])=>[...new Set(xs)];
const covered=(items:F[])=>new Set(items.flatMap(x=>x.values));
function pick(pool:F[],budget:number){
 const arr:F[]=[];const cv=new Set<string>();
 for(const f of pool){
  if(arr.length===3)break;
  const more=f.values.filter(x=>!cv.has(x));
  if(!more.length||cv.size+more.length>budget)continue;
  arr.push(f);more.forEach(x=>cv.add(x));
 }
 return [...cv];
}
const COUNT=399;
const KINDS:N[]=[2,3,4];
const YEARS=['2024','2025','2026'];
type Score={hits:number;expected:number;adjusted:number};
const out:any={controls:COUNT,definition:'Pool union Lalo Top6 + AUX Top6; 399 órdenes determinísticos independientes del sorteo objetivo; idéntico límite de terminaciones y familias que Top3 MV1',year:[]};
for(const year of YEARS){
 const sample=triple.filter(c=>c.year===year);
 const kinds:any[]=[];
 for(const kind of KINDS){
  const controls:Score[]=Array.from({length:COUNT},()=>({hits:0,expected:0,adjusted:0}));
  for(const c of sample){
   const core=c.ranks[kind].LALO_MV1.slice(0,6);
   const aux=c.ranks[kind].AUX_RAICES.slice(0,6);
   const seen=new Set<string>();
   const pool=[...core,...aux].filter(f=>{
    if(seen.has(f.family))return false;seen.add(f.family);return true;
   });
   const budget=covered(core.slice(0,3)).size;
   for(let seed=0;seed<COUNT;seed++){
    const ordered=[...pool].sort((a,b)=>fnv(c.date+'|'+c.turn+'|'+kind+'|'+seed+'|'+a.family)-
      fnv(c.date+'|'+c.turn+'|'+kind+'|'+seed+'|'+b.family));
    const selected=new Set(pick(ordered,budget));
    const hits=c.heads.filter(h=>selected.has(h.head.slice(-kind))).length;
    controls[seed].hits+=hits;
    controls[seed].expected+=c.heads.length*selected.size/(10**kind);
   }
  }
  for(const x of controls)x.adjusted=x.hits-x.expected;
  const sorted=controls.map(x=>x.adjusted).sort((a,b)=>a-b);
  const real=Object.fromEntries(['MV1','AUX','DOS_UNO','CONFIRMACION','PUENTE'].map(method=>{
   const subset=rows.filter(r=>r.year===year&&r.kind===kind&&r.method===method&&r.budgeted);
   const hits=subset.reduce((n,x)=>n+x.result.hits,0);
   const expected=subset.reduce((n,x)=>n+x.result.expected,0);
   const score=hits-expected;
   return [method,{hits,expected:Number(expected.toFixed(3)),adjusted:Number(score.toFixed(3)),
    percentileAgainstRandom:Number((100*sorted.filter(x=>x<=score).length/COUNT).toFixed(1)),
    upperTailExploratoryP:Number(((1+sorted.filter(x=>x>=score).length)/(COUNT+1)).toFixed(4))}];
  }));
  const nullHits=controls.map(x=>x.hits).sort((a,b)=>a-b);
  kinds.push({kind,actual:real,randomControl:{
   meanHits:Number((controls.reduce((a,x)=>a+x.hits,0)/COUNT).toFixed(3)),
   hitRange:[nullHits[0],nullHits.at(-1)],
   adjustedMean:Number((sorted.reduce((a,x)=>a+x,0)/COUNT).toFixed(3)),
   adjustedQuantiles95:[Number(sorted[Math.floor(COUNT*.025)].toFixed(3)),
    Number(sorted[Math.floor(COUNT*.975)].toFixed(3))]
  }});
 }
 out.year.push({year,cuts:sample.length,kinds});
}
console.log('PUENTE_CONTROL',JSON.stringify(out));
writeFileSync('lab-results/lalo-top3-controles-azar.json',JSON.stringify(out,null,2));
