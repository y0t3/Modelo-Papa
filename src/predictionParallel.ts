/**
 * Presentador PURO: MV1 (solo +11) vs AUX (solo Santiago–Neuquén).
 * Comparador de familias coincidentes SIN crear nuevos candidatos
 * ni alterar ninguno de los dos rankings PRE.
 */
import type {LaloView,LaloKind} from './motorLalo';
import type {AuxiliarView} from './motorLaloAuxiliar';
import type {IntegralKind} from './motorLaloIntegral';
export type ModelChoice='lalo'|'auxiliar';
export type HeadEvent={jur:string;head:string};
export type RankedFamily={
 kind:LaloKind;family:string;key:string;rank:number;values:string[];
 source:string;details:string[];canFocusPlus:boolean
};
const kinds:LaloKind[]=['vt2','vt3','vt4'];
const asN=(kind:LaloKind)=>Number(kind.slice(-1)) as IntegralKind;
export function familyKey(family:string):string{
 return [...new Set(family.split('/'))].sort().join('/');
}
function labelMembers(label:string):string[]{
 return [...new Set(label.split('/'))].sort();
}
export function rowsForModel(model:ModelChoice,kind:LaloKind,
 lalo:LaloView|null,aux:AuxiliarView|null):RankedFamily[]{
 if(model==='lalo')return (lalo?.ranks[kind]||[]).map(f=>({
  kind,family:f.family,key:familyKey(f.family),rank:f.rank,
  values:kind==='vt4'?[...new Set(f.paths.map(p=>p.value))]:labelMembers(f.family),
  source:'Modelo Lalo · +11',
  details:[
   'Fuentes +11: '+[...new Set(f.paths.map(p=>p.sourceId))].join(', '),
   'Antecedentes D−1: '+f.d1Roots+' · D−7: '+f.d7Roots,
   f.rationale
  ],canFocusPlus:true
 }));
 return (aux?.ranks[asN(kind)]||[]).map(f=>({
  kind,family:f.family,key:familyKey(f.family),rank:f.rank,
  values:f.values,source:'Lalo Auxiliar · Santiago–Neuquén',
  details:[
   'Hoja auxiliar RAW, sin +11',
   'Fuentes AUX: '+(f.sources.join(', ')||'ninguna')+
    (f.crossing?' · recorrido con cruce legal entre turnos':''),
   'Raíces ganadoras históricas: '+f.roots+
    ' · D−1: '+f.d1+' · D−7: '+f.d7,
   'Recorridos físicos válidos: '+f.paths,
   ...(kind==='vt4'&&f.mother?['Madre VT3 auxiliar: '+f.mother]:[]),
   'Terminaciones físicas: '+f.values.join(' / ')
  ],canFocusPlus:false
 }));
}
export const publishedHeadEvents=(heads:HeadEvent[])=>heads.filter(x=>/^\d{4}$/.test(x.head));
export function hitsForFamily(f:RankedFamily,heads:HeadEvent[]):HeadEvent[]{
 const n=asN(f.kind),values=new Set(f.values);
 return publishedHeadEvents(heads).filter(x=>values.has(x.head.slice(-n)));
}
export function comparePrediction(lalo:LaloView|null,aux:AuxiliarView|null,
 heads:HeadEvent[],limit:3|5|10){
 return kinds.map(kind=>{
  const l=rowsForModel('lalo',kind,lalo,aux).slice(0,limit);
  const a=rowsForModel('auxiliar',kind,lalo,aux).slice(0,limit);
  const left=new Map(l.map(f=>[f.key,f]));
  const right=new Map(a.map(f=>[f.key,f]));
  // El Top general de coincidencias es la INTERSECCIÓN de los Tops
  // independientes. No se inventa una tercera predicción.
  const shared=[...left].filter(([key])=>right.has(key))
   .map(([key,f])=>{
    const auxFamily=right.get(key)!;
    const matchingExact=new Set(auxFamily.values);
    const commonValues=f.values.filter(v=>matchingExact.has(v));
    const bothHeads=publishedHeadEvents(heads).filter(h=>
     commonValues.includes(h.head.slice(-asN(kind))));
    return {family:f.family,lalo:f.rank,auxiliar:auxFamily.rank,
     valuesInBoth:commonValues,heads:bothHeads};
   })
   .sort((x,y)=>(x.lalo+x.auxiliar)-(y.lalo+y.auxiliar)||
    Math.max(x.lalo,x.auxiliar)-Math.max(y.lalo,y.auxiliar)||
    familyKey(x.family).localeCompare(familyKey(y.family)));
  const onlyOriginal=l.filter(f=>!right.has(f.key));
  const onlyAuxiliar=a.filter(f=>!left.has(f.key));
  const winning=publishedHeadEvents(heads).map(h=>{
   const value=h.head.slice(-asN(kind));
   const lf=l.find(f=>f.values.includes(value));
   const af=a.find(f=>f.values.includes(value));
   return {...h,kind,lalo:lf?.rank||null,auxiliar:af?.rank||null};
  }).filter(h=>h.lalo!==null||h.auxiliar!==null);
  return {kind,shared,onlyOriginal,onlyAuxiliar,winning,
   laloCount:l.length,auxiliarCount:a.length};
 });
}
