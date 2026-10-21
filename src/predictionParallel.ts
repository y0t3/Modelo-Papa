/**
 * Presentador PURO para dos motores independientes. Sólo usa Tops PRE y
 * comprueba resultados publicados POST (no altera ni reordena candidatos).
 */
import type {LaloView,LaloKind} from './motorLalo';
import type {IntegralPrediction,IntegralKind} from './motorLaloIntegral';
import type {Turno} from './domain';
export type ModelChoice='lalo'|'integral';
export type HeadEvent={jur:string;head:string};
export type RankedFamily={
 kind:LaloKind;family:string;key:string;rank:number;values:string[];
 source:string;details:string[];
 canFocusPlus:boolean
};
const kinds:LaloKind[]=['vt2','vt3','vt4'];
const intKind=(k:LaloKind)=>Number(k.slice(-1)) as IntegralKind;
export function familyKey(label:string):string{
 return [...new Set(label.split('/'))].sort().join('/');
}
function valuesFromLabel(label:string):string[]{
 return [...new Set(label.split('/'))].sort();
}
export function rowsForModel(
 model:ModelChoice,kind:LaloKind,lalo:LaloView|null,
 integral:IntegralPrediction|null
):RankedFamily[]{
 if(model==='lalo')return (lalo?.ranks[kind]||[]).map(x=>({
  kind,family:x.family,key:familyKey(x.family),rank:x.rank,
  values:kind==='vt4'?[...new Set(x.paths.map(p=>p.value))]:valuesFromLabel(x.family),
  source:'Lalo MV1 (+11)',
  details:[
   'Fuentes +11: '+[...new Set(x.paths.map(p=>p.sourceId))].join(', '),
   'Antecedentes D−1: '+x.d1Roots+' · D−7: '+x.d7Roots,
   x.rationale
  ],canFocusPlus:true
 }));
 return (integral?.ranks[intKind(kind)]||[]).map(x=>({
  kind,family:x.family,key:familyKey(x.family),rank:x.rank,values:x.values,
  source:x.evidence==='DOS_HOJAS'?'Ambas hojas':
   x.evidence==='AUX'?'Santiago–Neuquén':'Hoja +11',
  details:[
   'Lalo #'+(x.laloRank??'—')+' · Auxiliar #'+(x.auxRank??'—'),
   'Fuentes +11: '+(x.plus11Sources.join(', ')||'ninguna'),
   'Fuentes AUX: '+(x.auxSources.join(', ')||'ninguna')+
    (x.auxCrossTurn?' · con cruce legal de turnos':''),
   'Raíces ganadoras históricas AUX: '+x.rootEvents+
    ' (D−1: '+x.d1Roots+'; D−7: '+x.d7Roots+')',
   'Terminaciones exactas: '+x.values.join(' / ')
  ],canFocusPlus:x.laloRank!==null
 }));
}
export function publishedHeadEvents(heads:HeadEvent[]):HeadEvent[]{
 return heads.filter(x=>/^[0-9]{4}$/.test(x.head));
}
export function hitsForFamily(f:RankedFamily,heads:HeadEvent[]):HeadEvent[]{
 const n=intKind(f.kind),allowed=new Set(f.values);
 return publishedHeadEvents(heads).filter(h=>
  allowed.has(h.head.slice(-n)));
}
export function comparePrediction(lalo:LaloView|null,
 integral:IntegralPrediction|null,heads:HeadEvent[],limit:3|5|10){
 return kinds.map(kind=>{
  const mv=rowsForModel('lalo',kind,lalo,integral).slice(0,limit);
  const it=rowsForModel('integral',kind,lalo,integral).slice(0,limit);
  const original=new Map(mv.map(f=>[f.key,f]));
  const combined=new Map(it.map(f=>[f.key,f]));
  const both=[...original].filter(([key])=>combined.has(key))
   .map(([key,f])=>({family:f.family,lalo:f.rank,
    integral:combined.get(key)!.rank,heads:hitsForFamily(f,heads)}));
  const onlyOriginal=[...original].filter(([key])=>!combined.has(key))
   .map(([,f])=>f);
  const onlyIntegral=[...combined].filter(([key])=>!original.has(key))
   .map(([,f])=>f);
  const winning=publishedHeadEvents(heads).map(head=>{
   const ending=head.head.slice(-intKind(kind));
   const l=mv.find(f=>f.values.includes(ending));
   const i=it.find(f=>f.values.includes(ending));
   return {...head,lalo:l?.rank||null,integral:i?.rank||null,
    kind};
  }).filter(h=>h.lalo!==null||h.integral!==null);
  return {kind,shared:both,onlyOriginal,onlyIntegral,winning,
   laloCount:mv.length,integralCount:it.length};
 });
}
