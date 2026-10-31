/**
 * LAB LALO VT3: empírico-bayesiano simple, CONGELADO.
 *
 * Entrenamiento: solo junio y julio de 2026; agosto verifica y
 * septiembre-octubre contrasta por separado. Las familias se seleccionan
 * exclusivamente de los recorridos físicos +11 del PRE.
 *
 * Ni un recorrido es voto, ni una familia reversible cuenta por 2 cuando
 * es palíndroma. Probabilidad uniforme base = miembros/1000 por cabeza.
 */
import type {PhysicalAnatomy} from './labLaloAnatomiaSinPuestoVT3';
export type GeometryFeatures={
 original:'TOP10'|'11_20'|'21_PLUS'|'UNRANKED';
 form:'TOP10'|'11_30'|'31_100'|'OUTSIDE';
 frontier:'ONE_COLUMN'|'ONLY_NEW'|'ONLY_OLD'|'BOTH';
 paths:'ONE'|'MULTI';
};
export type LabeledFamily={family:string;members:1|2;features:GeometryFeatures;
 hits:number;heads:number};
export type Bucket={expected:number;observed:number;exposures:number};
export type GeometricEvidence=Record<keyof GeometryFeatures,Record<string,Bucket>>;
export const categories:Record<keyof GeometryFeatures,readonly string[]>={
 original:['TOP10','11_20','21_PLUS','UNRANKED'],
 form:['TOP10','11_30','31_100','OUTSIDE'],
 frontier:['ONE_COLUMN','ONLY_NEW','ONLY_OLD','BOTH'],
 paths:['ONE','MULTI']
};
export function originalTier(rank:number|null):GeometryFeatures['original']{
 return rank===null?'UNRANKED':rank<=10?'TOP10':rank<=20?'11_20':'21_PLUS';
}
export function formTier(rank:number|null):GeometryFeatures['form']{
 return rank===null?'OUTSIDE':rank<=10?'TOP10':rank<=30?'11_30':'31_100';
}
export function featuresFor(f:PhysicalAnatomy,original:number|null,forms:number|null):GeometryFeatures{
 return {original:originalTier(original),form:formTier(forms),
  frontier:f.frontier==='UNICA_COLUMNA'?'ONE_COLUMN':
   f.frontier==='SOLO_NUEVA'?'ONLY_NEW':
   f.frontier==='SOLO_ANTIGUAS'?'ONLY_OLD':'BOTH',
  paths:f.pathCount===1?'ONE':'MULTI'};
}
export function trainEvidence(rows:readonly LabeledFamily[]):GeometricEvidence{
 const out={} as GeometricEvidence;
 for(const [key,cats] of Object.entries(categories) as [keyof GeometryFeatures,readonly string[]][]){
  out[key]=Object.fromEntries(cats.map(k=>[k,{expected:0,observed:0,exposures:0}]));
 }
 for(const row of rows){
  if(row.members!==1&&row.members!==2)throw Error('Solo familias de 1/2 orientaciones');
  if(row.hits<0||row.hits>row.heads||row.heads<0)throw Error('POST incompleto');
  for(const k of Object.keys(categories) as (keyof GeometryFeatures)[]){
   const b=out[k][row.features[k]];
   if(!b)throw Error('Categoría geométrica no contemplada');
   b.expected+=row.heads*row.members/1000;
   b.observed+=row.hits;
   b.exposures++;
  }
 }
 return out;
}
/** Prior equivale a 20 aciertos esperados neutros por categoría, sin tuning. */
export function smoothedLift(bucket:Bucket,priorExpected=20):number{
 const lift=(bucket.observed+priorExpected)/(bucket.expected+priorExpected);
 return Math.max(0.75,Math.min(1.25,lift));
}
export function geoFactor(x:GeometryFeatures,model:GeometricEvidence){
 // Penalizar multiplicación ingenua de señales correlacionadas (raíz, forma, fuente).
 const logs=(Object.keys(categories) as (keyof GeometryFeatures)[])
  .map(k=>Math.log(smoothedLift(model[k][x[k]])));
 return Math.exp(0.5*logs.reduce((a,b)=>a+b,0));
}
const hash=(s:string)=>{let n=2166136261;
 for(const c of s){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0;};
/** Dos variantes PRE fijas: solo evidencia geométrica o hibridada con frecuencia 30. */
export function selectBayes(
 families:readonly {family:string;members:1|2;features:GeometryFeatures;
 freq30:number;trainingN:number}[],
 model:GeometricEvidence, seed:string,
 method:'GEOMETRIA_CALIBRADA'|'HISTORIA_Y_GEOMETRIA'
):string[]{
 if(!families.length)return [];
 if(new Set(families.map(x=>x.family)).size!==families.length)throw Error('Fuga: duplicados');
 return families.map(f=>{
  const uniform=f.members/1000;
  const factor=geoFactor(f.features,model);
  const posterior=(f.freq30+500*uniform)/(f.trainingN+500);
  const score=(method==='GEOMETRIA_CALIBRADA'?uniform:posterior)*factor;
  return {family:f.family,score,members:f.members};
 }).sort((a,b)=>b.score-a.score||
  hash(seed+'|'+a.family)-hash(seed+'|'+b.family)||a.family.localeCompare(b.family))
  .slice(0,10).map(x=>x.family);
}
