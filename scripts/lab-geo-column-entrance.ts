// Laboratorio: atribuir cada familia VT3 a la primera columna donde físicamente
// aparece y medir su selección en tres puestos. Sin cruzamientos, sin fuga.
// "Una nueva ruta en otra columna" NO significa "una familia numérica nueva".
import {TURNOS} from '../src/domain';
import type {Turno} from '../src/domain';
import type {NormalCut,NormalMode} from './lab-geo-normalization';
import {NORMAL_MODES} from './lab-geo-normalization';

const sources=['prevNocturno','Previa','Primera','Matutino','Vespertino'] as const;
type Source=typeof sources[number];
export type CutPools=Record<Source,string[]>;
export type ColumnRecord={
 date:string;turn:Turno;period:string;justAddedSource:Source;
 availableFamilies:number;newFamiliesFromAddedSource:number;
 reinforcedFamiliesFromAddedSource:number;
 heads:{family:string;firstSource:Source|null;physical:boolean;
  newlyAvailableForTarget:boolean;bornAfterNocturna:boolean}[];
 results:Record<NormalMode,{
  families:string[];headHits:number;
  newFamilySlots:number;olderFamilyOnNewSourceSlots:number;
  hitsByFirstSource:Record<string,number>;hitsByWitnessSource:Record<string,number>;
  hitsBornAfterNocturna:number;hitsBornInLatestColumn:number;
  selected:{family:string;witnessSource:Source;firstSource:Source;rank:number;headHits:number}[]
 }>;
};
export function inspectColumnEntrance(c:NormalCut,pools:CutPools):ColumnRecord{
 const target=c.turn as Turno;
 if(!TURNOS.includes(target))throw Error('Turno desconocido '+c.turn);
 const idx=TURNOS.indexOf(target);
 const available=sources.slice(0,idx+1);
 const latest=available[available.length-1];
 const visited=new Set<string>(),birth=new Map<string,Source>();
 const poolSetBySource=new Map<Source,Set<string>>();
 for(const source of available){
  const group=new Set(pools[source]||[]);
  poolSetBySource.set(source,group);
  for(const family of group){
   if(!birth.has(family))birth.set(family,source);
   visited.add(family);
  }
 }
 const prev=new Set(available.slice(0,-1).flatMap(src=>pools[src]||[]));
 const latestFamilies=poolSetBySource.get(latest)||new Set<string>();
 const newFamiliesFromAddedSource=[...latestFamilies].filter(f=>!prev.has(f)).length;
 const reinforcedFamiliesFromAddedSource=[...latestFamilies].filter(f=>prev.has(f)).length;
 if(idx===0&&reinforcedFamiliesFromAddedSource!==0)
  throw Error('La Previa no incorpora otra fuente');
 const heads=c.headFamilies.map(family=>({
  family,firstSource:birth.get(family)||null,physical:birth.has(family),
  newlyAvailableForTarget:birth.get(family)===latest,
  bornAfterNocturna:!!birth.get(family)&&birth.get(family)!=='prevNocturno'
 }));
 const results={} as ColumnRecord['results'];
 for(const mode of NORMAL_MODES){
  const selected=c.results[mode].items;
  if(selected.length!==3)throw Error('Top3 incompleto '+mode+' '+c.date+' '+c.turn);
  const mapped=selected.map((s,rank)=>{
   const first=birth.get(s.family);
   const witness=s.source as Source;
   if(!first||!poolSetBySource.get(witness)?.has(s.family))
    throw Error('Testigo no existe en su columna física: '+mode+' '+c.date+' '+c.turn);
   return {family:s.family,witnessSource:witness,firstSource:first,rank:rank+1,
    headHits:c.headFamilies.filter(f=>f===s.family).length};
  });
  const counts=(key:'firstSource'|'witnessSource')=>Object.fromEntries(sources.map(src=>[
   src,mapped.reduce((n,e)=>n+(e[key]===src?e.headHits:0),0)
  ]));
  const hits=mapped.reduce((n,e)=>n+e.headHits,0);
  if(hits!==c.results[mode].headHits)throw Error('Aciertos inconsistentes '+mode);
  results[mode]={
   families:mapped.map(p=>p.family),headHits:hits,
   newFamilySlots:mapped.filter(p=>p.firstSource!=='prevNocturno').length,
   olderFamilyOnNewSourceSlots:mapped.filter(p=>p.firstSource==='prevNocturno'&&
    p.witnessSource!=='prevNocturno').length,
   hitsByFirstSource:counts('firstSource'),hitsByWitnessSource:counts('witnessSource'),
   hitsBornAfterNocturna:mapped.filter(p=>p.firstSource!=='prevNocturno')
    .reduce((n,p)=>n+p.headHits,0),
   hitsBornInLatestColumn:mapped.filter(p=>p.firstSource===latest)
    .reduce((n,p)=>n+p.headHits,0),
   selected:mapped
  };
 }
 // A la fecha de la Previa, ambas variantes con restricciones de fuente
 // deben coincidir exactamente, no solo en aciertos.
 if(c.turn==='Previa'&&(
  results.COMBINADO.families.join('|')!==results.COMBINADO_SOLO_NOCTURNA.families.join('|')||
  results.COMBINADO.families.join('|')!==results.COMBINADO_2_NOCTURNA_1_OTRA.families.join('|')))
  throw Error('Las fuentes futuras alteraron la Previa '+c.date);
 return {date:c.date,turn:target,period:c.period,justAddedSource:latest,
  availableFamilies:visited.size,newFamiliesFromAddedSource,
  reinforcedFamiliesFromAddedSource,
  heads,results};
}
export function summarizeColumns(rows:ColumnRecord[]){
 const groups=[['TOTAL',rows] as [string,ColumnRecord[]],
  ...[...new Set(rows.map(r=>r.period))].map(p=>
   [p,rows.filter(r=>r.period===p)] as [string,ColumnRecord[]])];
 const makeSummary=(items:ColumnRecord[])=>{
  const validHeads=items.reduce((n,r)=>n+r.heads.length,0);
  const winnersPhysical=items.reduce((n,r)=>n+r.heads.filter(h=>h.physical).length,0);
  const laterBirthHeads=items.reduce((n,r)=>n+r.heads.filter(h=>h.bornAfterNocturna).length,0);
  const bornLatestHeads=items.reduce((n,r)=>n+r.heads.filter(h=>h.newlyAvailableForTarget).length,0);
  const byMethod=Object.fromEntries(NORMAL_MODES.map(mode=>[mode,{
   hits:items.reduce((n,r)=>n+r.results[mode].headHits,0),
   cutsWithHit:items.filter(r=>r.results[mode].headHits>0).length,
   candidatesBornAfterNocturna:items.reduce((n,r)=>n+r.results[mode].newFamilySlots,0),
   previouslyAvailableFamiliesRepresentedOnOtherSource:items.reduce((n,r)=>
    n+r.results[mode].olderFamilyOnNewSourceSlots,0),
   headHitsBornAfterNocturna:items.reduce((n,r)=>
    n+r.results[mode].hitsBornAfterNocturna,0),
   headHitsBornInLatestColumn:items.reduce((n,r)=>
    n+r.results[mode].hitsBornInLatestColumn,0),
   hitsByFirstSource:Object.fromEntries(sources.map(src=>[src,items.reduce((n,r)=>
    n+(r.results[mode].hitsByFirstSource[src]||0),0)])),
   hitsByWitnessSource:Object.fromEntries(sources.map(src=>[src,items.reduce((n,r)=>
    n+(r.results[mode].hitsByWitnessSource[src]||0),0)]))
  }]));
  const changes=items.filter(r=>r.results.COMBINADO.families.some(f=>
   !r.results.COMBINADO_SOLO_NOCTURNA.families.includes(f)));
  const gains=items.filter(r=>r.results.COMBINADO.headHits>r.results.COMBINADO_SOLO_NOCTURNA.headHits);
  const losses=items.filter(r=>r.results.COMBINADO.headHits<r.results.COMBINADO_SOLO_NOCTURNA.headHits);
  const cases=(xs:ColumnRecord[])=>xs.map(r=>({
   date:r.date,turn:r.turn,winning:r.heads.filter(h=>h.physical),
   combined:r.results.COMBINADO.selected,onlyNocturna:r.results.COMBINADO_SOLO_NOCTURNA.selected,
   effect:r.results.COMBINADO.headHits-r.results.COMBINADO_SOLO_NOCTURNA.headHits
  }));
  return {days:new Set(items.map(r=>r.date)).size,cuts:items.length,heads:validHeads,
   physicallyPresentHeads:winnersPhysical,
   physicallyBornInLaterColumnHeads:laterBirthHeads,
   physicallyBornInLastAddedColumnHeads:bornLatestHeads,
   newFamilyArrivals:items.reduce((n,r)=>n+r.newFamiliesFromAddedSource,0),
   reinforcedFamilyArrivals:items.reduce((n,r)=>n+r.reinforcedFamiliesFromAddedSource,0),
   byMethod,comparison:{
    combinedVsNocturnaChanges:changes.length,
    combinedVsNocturnaGains:cases(gains),combinedVsNocturnaLosses:cases(losses),
    sameResultsCuts:items.filter(r=>r.results.COMBINADO.headHits===
     r.results.COMBINADO_SOLO_NOCTURNA.headHits).length
   }};
 };
 return {methodology:{
  firstSource:'Primera fuente física de la familia numérica reversible VT3 en orden de aparición de columnas.',
  sourceWitness:'Columna del recorrido concreto elegido por el Top3; puede ser distinta de primera aparición.',
  unit:'Cabeza por corte para aciertos, familia por corte para disponibilidad; eventos de una jornada no son independientes.',
  comparison:'Selecciones Top3 a igualdad de criterios de normalización, con fuentes libres, solo Nocturna anterior, o dos de Nocturna más una alternativa.',
  caveat:'Prueba retrospectiva sobre jornadas exploradas; no demuestra predictibilidad ni tasa prospectiva.'
 },summary:Object.fromEntries(groups.map(([k,v])=>[k,makeSummary(v)])),
  byTurn:Object.fromEntries(TURNOS.map(turn=>[turn,makeSummary(rows.filter(r=>r.turn===turn))])),
  rows};
}
