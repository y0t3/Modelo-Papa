// Experimento cerrado de desempates: una sola sustitución del puesto 3,
// nunca ampliar la cantidad de familias ni inventar antecedentes.
// El respaldo pertenece al recorrido testigo elegido por Geometría, en la
// MISMA fuente y MISMA forma física de una cabeza histórica comprobada.
import type {LaloView,RootRef} from '../src/motorLalo';
import type {ShadowMother} from '../src/vt3Shadow';
import {canonicalShape} from './lab-geo-winning-roots';

export type TieMethod='ORIGINAL'|'VECINO_4_MISMA_FORMA'|
 'VECINO_5_MISMA_FORMA_2_RAICES'|'VECINO_5_MISMA_FUENTE_2_RAICES'|
 'VECINO_5_MISMA_FUENTE_MAS_2_RAICES';
const eventKey=(r:RootRef)=>[r.date,r.oldTurn,r.jurisdiction,r.head].join('|');
type Evidence={family:string;rank:number;source:string;shape:string;
 roots:number;yesterday:number;week:number;events:string[]};
export function localTieBreak(top:ShadowMother[],view:LaloView){
 const candidates=top.slice(0,5);
 const evidence:Evidence[]=candidates.map((p,i)=>{
  const seen=new Map<string,RootRef>();
  for(const root of view.roots){
   if(root.oldCells.length!==3||root.sourceId!==p.source||
     canonicalShape(root.oldCells)!==canonicalShape(p.cells))continue;
   seen.set(eventKey(root),root);
  }
  const roots=[...seen.values()];
  return {family:p.family,rank:i+1,source:p.source,
   shape:canonicalShape(p.cells),roots:roots.length,
   yesterday:roots.filter(r=>r.period==='D−1').length,
   week:roots.filter(r=>r.period==='D−7').length,
   events:[...seen.keys()]};
 });
 const third=evidence[2];
 if(!third)throw Error('Top geométrico no cuenta con tres familias');
 const result={} as Record<TieMethod,string[]>;
 const reasons={} as Record<TieMethod,string>;
 result.ORIGINAL=top.slice(0,3).map(x=>x.family);
 reasons.ORIGINAL='Geometría completa sin cambios';
 const methods:TieMethod[]=['VECINO_4_MISMA_FORMA','VECINO_5_MISMA_FORMA_2_RAICES',
  'VECINO_5_MISMA_FUENTE_2_RAICES','VECINO_5_MISMA_FUENTE_MAS_2_RAICES'];
 for(const mode of methods){
  let replacement:Evidence|undefined;
  if(third.roots===0||mode==='VECINO_5_MISMA_FUENTE_MAS_2_RAICES'){
   const pool=evidence.slice(3,mode==='VECINO_4_MISMA_FORMA'?4:5);
   replacement=pool.find(x=>{
    const sameSource=x.source===third.source;
    const sameShape=x.shape===third.shape;
    if(mode==='VECINO_4_MISMA_FORMA')return sameSource&&sameShape&&x.roots>=1;
    if(mode==='VECINO_5_MISMA_FORMA_2_RAICES')return sameSource&&sameShape&&x.roots>=2;
    if(mode==='VECINO_5_MISMA_FUENTE_MAS_2_RAICES')return sameSource&&x.roots>=third.roots+2;
    return sameSource&&x.roots>=2;
   });
  }
  result[mode]=[...result.ORIGINAL.slice(0,2),replacement?.family||third.family];
  reasons[mode]=replacement?
   'Sustituir tercero sin raíz por puesto '+replacement.rank+
   ' con '+replacement.roots+' cabezas históricas independientes en su testigo físico':
   'No se cumplen condiciones de sustitución: Top3 original intacto';
  if(result[mode].length!==3||new Set(result[mode]).size!==3)
   throw Error('Desempate no conserva exactamente tres familias');
 }
 return {result,evidence,reasons};
}
