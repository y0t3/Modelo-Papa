/**
 * Auditoría descriptiva de RESCATES VT3.
 * PRE (Formas / Lalo) y POST (cabezas publicadas) se mantienen separados.
 * No altera rankings, no aprende del POST ni confunde la coincidencia de
 * familia con evidencia independiente del éxito de una figura.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import {preSheetAtCut} from './infoCandidatos';
import {formPositions} from './motorFormasPrimero';
import type {FormCell,FormChoice,FormMotorView} from './motorFormasPrimero';
import type {LaloRoute,LaloView} from './motorLalo';
import {reversibleFamily} from './motorLalo';

export type AuditPublishedHead={jur:string;head:string};
export type AuditedPhysicalRoute={
 source:SourceId;cells:FormCell[];reading:string;
 orientation:'DIRECTA'|'INVERSA';positionKey:string;
};
export type AuditedHead=AuditPublishedHead&{
 suffix:string;family:string;physicalPaths:AuditedPhysicalRoute[];
 selectedPositionMatches:boolean;
};
export type AuditedFormChoice={
 kind:'RESCATE'|'COMPARTIDO';choice:FormChoice;
 laloRank:number|null;published:AuditedHead[];
};
export type AuditedLaloOnly={
 family:string;rank:number;routes:LaloRoute[];
 published:AuditedHead[];
};
export type FigureRescueAudit={
 date:string;turn:Turno;mode:'RECONSTRUCCION_PRE_NO_SELLADA';
 publicationCount:number;physicalRoutes:number;physicalFamilies:number;
 rescueCount:number;sharedCount:number;laloOnlyCount:number;
 rescueHeadHits:number;sharedHeadHits:number;laloOnlyHeadHits:number;
 forms:AuditedFormChoice[];laloOnly:AuditedLaloOnly[];
};
/** Pure and deterministic: no current target heads enter ranking. */
export function buildFigureRescueAudit(
 date:string,turn:Turno,pre:DailySheet,forms:FormMotorView,lalo:LaloView,
 published:AuditPublishedHead[]
):FigureRescueAudit{
 const idx=TURNOS.indexOf(turn);
 if(idx<0||forms.kind!=='vt3'||forms.date!==date||forms.turn!==turn||
  lalo.date!==date||lalo.target!==turn)
  throw Error('Auditoría PRE de figuras: fechas, tipo o turnos no coinciden');
 // Mask future and target matches even if an external caller passes a full sheet.
 const safe=preSheetAtCut(pre,turn,idx);
 const paths=formPositions(safe,turn,'vt3');
 const ranked=new Map(lalo.ranks.vt3.slice(0,10).map(f=>[f.family,f]));
 const formSet=new Set(forms.top.map(f=>f.family));
 const valid=published.filter(h=>h.jur!=='Montevideo'&&
  /^\d{4,5}$/.test(h.head)&&!!h.jur);
 const allByFamily=new Map<string,AuditedPhysicalRoute[]>();
 for(const path of paths){
  const column=safe.columns.find(c=>c.id===path.source)!;
  const reading=path.cells.map(c=>column.values[c.row]?.[c.col]||'').join('');
  if(!/^\d{3}$/.test(reading))continue;
  const f=reversibleFamily(reading);
  const list=allByFamily.get(f)||[];
  // Route appears once (the reverse orientation is derived on demand).
  list.push({source:path.source,cells:path.cells,reading,
   orientation:'DIRECTA',positionKey:path.positionKey});
  allByFamily.set(f,list);
 }
 const matches=(family:string,chosen?:FormChoice):AuditedHead[]=>
  valid.filter(x=>reversibleFamily(x.head.slice(-3))===family).map(x=>{
   const suffix=x.head.slice(-3);
   const physicalPaths=(allByFamily.get(family)||[]).map(p=>{
    if(p.reading===suffix)return p;
    if([...p.reading].reverse().join('')===suffix)return{
     ...p,cells:[...p.cells].reverse(),reading:suffix,
     orientation:'INVERSA' as const
    };
    return null;
   }).filter((p):p is AuditedPhysicalRoute=>p!==null);
   return {...x,suffix,family,physicalPaths,
    selectedPositionMatches:!!chosen&&physicalPaths.some(p=>
     p.positionKey===chosen.positionKey)};
  });
 const auditedForms:AuditedFormChoice[]=forms.top.map(choice=>{
  const official=ranked.get(choice.family);
  return {kind:official?'COMPARTIDO':'RESCATE',choice,
   laloRank:official?.rank??null,
   published:matches(choice.family,choice)};
 });
 const laloOnly:AuditedLaloOnly[]=lalo.ranks.vt3.slice(0,10)
  .filter(f=>!formSet.has(f.family))
  .map(f=>({family:f.family,rank:f.rank,routes:f.paths,
   published:matches(f.family)}));
 const rescues=auditedForms.filter(f=>f.kind==='RESCATE');
 const shared=auditedForms.filter(f=>f.kind==='COMPARTIDO');
 const count=(records:{published:AuditedHead[]}[])=>
  records.reduce((n,x)=>n+x.published.length,0);
 return {date,turn,mode:'RECONSTRUCCION_PRE_NO_SELLADA',
  publicationCount:valid.length,physicalRoutes:paths.length,
  physicalFamilies:allByFamily.size,
  rescueCount:rescues.length,sharedCount:shared.length,
  laloOnlyCount:laloOnly.length,
  rescueHeadHits:count(rescues),sharedHeadHits:count(shared),
  laloOnlyHeadHits:count(laloOnly),
  forms:auditedForms,laloOnly};
}
