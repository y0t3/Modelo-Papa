/**
 * Auditoría FIGURA POR PUESTO, sin seguir valores numéricos.
 * Una familia VT2 puede tener múltiples recorridos; NO se afirma que el
 * rango #7 sea una silueta fija. Se guarda el abanico de huellas PRE.
 * POST únicamente etiqueta aciertos y sus huellas físicas verdaderas.
 */
import {reversibleFamily} from './motorLalo';
import type {LaloFamily} from './motorLalo';
import type {SourceId} from './sheet';
import type {Path} from './paths';
export type PairShape='HORIZONTAL'|'VERTICAL'|'DIAGONAL_A'|'DIAGONAL_B';
export type PhysicalFootprint={
 source:SourceId;site:string;shape:PairShape;zone:'superior'|'central'|'inferior';
 signature:string;shapeSignature:string;digits:string;
 coords:{row:number;col:number;digit:string}[];
};
export type SlotFootprint={
 rank:number;family:string;paths:PhysicalFootprint[];
 uniqueSites:number;uniqueSources:number;
 dominantShape:string|null;dominantSite:string|null;
 distinctShapeSignatures:string[];
 hits:{jur:string;head:string;physicalSites:string[];physicalShapes:string[]}[];
};
const loc=(c:{row:number;col:number})=>c.row+':'+c.col;
export const cellSite=(source:SourceId,p:Path)=>source+'|'+p.map(loc).sort().join('|');
export const shapeOf=(p:Path):PairShape=>{
 if(p.length!==2)throw Error('La huella requiere dos celdas');
 const a=p[0],b=p[1];
 if(a.row===b.row)return 'HORIZONTAL';
 if(a.col===b.col)return 'VERTICAL';
 return (a.row-b.row)*(a.col-b.col)>0?'DIAGONAL_A':'DIAGONAL_B';
};
export const zoneOf=(p:Path):PhysicalFootprint['zone']=>{
 const row=Math.min(...p.map(c=>c.row));
 return row<2?'superior':row<4?'central':'inferior';
};
export function footprintsOf(f:LaloFamily):PhysicalFootprint[]{
 const unique=new Map<string,PhysicalFootprint>();
 for(const route of f.paths){
  if(route.path.length!==2)continue;
  const p=route.path,site=cellSite(route.sourceId,p);
  if(unique.has(site))continue;
  const shape=shapeOf(p),zone=zoneOf(p);
  unique.set(site,{
   source:route.sourceId,site,shape,zone,
   signature:route.sourceId+'|'+shape+'|'+zone,
   shapeSignature:route.sourceId+'|'+shape,
   digits:p.map(c=>c.digit).join(''),
   coords:p.map(c=>({...c}))
  });
 }
 return [...unique.values()];
}
const dominant=(keys:string[]):string|null=>{
 if(!keys.length)return null;
 const n=new Map<string,number>();
 for(const x of keys)n.set(x,(n.get(x)||0)+1);
 return [...n].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0][0];
};
export function inspectSlots(
 families:LaloFamily[],real:{jur:string;head:string}[]
):SlotFootprint[]{
 const entries:SlotFootprint[]=[];
 for(const f of families.slice(0,10)){
  const paths=footprintsOf(f);
  const hits=real.filter(h=>/^\d{4}$/.test(h.head)&&
    reversibleFamily(h.head.slice(-2))===f.family)
   .map(h=>{
    const exact=paths.filter(p=>p.digits===h.head.slice(-2)||
      [...p.digits].reverse().join('')===h.head.slice(-2));
    return {jur:h.jur,head:h.head,physicalSites:exact.map(p=>p.site),
     physicalShapes:[...new Set(exact.map(p=>p.signature))]};
   });
  entries.push({rank:f.rank,family:f.family,paths,
   uniqueSites:paths.length,
   uniqueSources:new Set(paths.map(p=>p.source)).size,
   dominantShape:dominant(paths.map(p=>p.signature)),
   dominantSite:dominant(paths.map(p=>p.site)),
   distinctShapeSignatures:[...new Set(paths.map(p=>p.signature))],
   hits});
 }
 return entries;
}
export function overlap(a:SlotFootprint,b:SlotFootprint){
 const aa=new Set(a.paths.map(x=>x.site)),bb=new Set(b.paths.map(x=>x.site));
 const common=[...aa].filter(s=>bb.has(s)).length;
 const shapeA=new Set(a.paths.map(x=>x.signature)),shapeB=new Set(b.paths.map(x=>x.signature));
 const shapeCommon=[...shapeA].filter(s=>shapeB.has(s)).length;
 return {sites:common,siteJaccard:common/Math.max(1,aa.size+bb.size-common),
  shapes:shapeCommon,shapeJaccard:shapeCommon/Math.max(1,shapeA.size+shapeB.size-shapeCommon),
  sameDominantShape:!!a.dominantShape&&a.dominantShape===b.dominantShape};
}
export function markForActualWinner(slot:SlotFootprint){
 return slot.hits.some(h=>h.physicalSites.length>0);
}
