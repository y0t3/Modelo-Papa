/**
 * Auditoría de continuidad DE LA JORNADA, sin cambiar ni escoger Tops.
 *
 * En cada corte PRE se clasifica cada familia física como:
 *   - marcada POST de un turno anterior y suma OTRA fuente física,
 *   - marcada y meramente persistente,
 *   - físicamente presente pero todavía NO marcada,
 *   - inexistente físicamente.
 *
 * En todos los casos se registran VT2 / VT3 / VT4, cabeza exacta,
 * pruebas de contacto, fuentes +11 (sin cruces) y AUX (cruces legales).
 * Compara el número de terminaciones físicas que ocupa cada grupo:
 * más coincidencias sin contar exposición no significa más información.
 *
 * Cada resultado utilizado al evaluar un corte es SOLO la verdad posterior
 * para cotejar; no afecta la construcción PRE del conjunto candidato.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import type {CabezasDia} from '../src/domain';
import {TURNOS,JURS} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {sameDaySequence} from '../src/withinDayMarkContinuity';
import type {TurnFrame,N,PriorFamily} from '../src/withinDayMarkContinuity';

const PERIOD=process.env.LAB_YEAR||'2026';
const end=PERIOD+'-10-20',start=PERIOD+'-07-28',evalStart=PERIOD+'-08-01';
const allDates:string[]=[];
for(let ts=Date.parse(start+'T12:00:00Z');ts<=Date.parse(end+'T12:00:00Z');ts+=86400000)
 allDates.push(new Date(ts).toISOString().slice(0,10));
const KINDS:N[]=[2,3,4];
const valid=(s:string)=>/^\d{4}$/.test(s);
const groups=['NUEVA_FUENTE','PERSISTE','SIN_MARCA','SIN_GEOMETRIA'] as const;
type Group=typeof groups[number];
type Count={heads:number;selectedNumbers:number;
 expectedUniform:number;familyCount:number;cutWithCandidates:number;
 detailedHits:{date:string;turn:string;jur:string;head:string;
  family:string;roots:number;firstRootTurn:string;sourceKind:string}[]};
const empty=():Count=>({heads:0,selectedNumbers:0,expectedUniform:0,
 familyCount:0,cutWithCandidates:0,detailedHits:[]});
const summary=()=>Object.fromEntries(KINDS.map(k=>[k,
 Object.fromEntries(groups.map(g=>[g,empty()]))])) as Record<N,Record<Group,Count>>;
type Stat={originEvents:number;stillFormable:number;gainedPlus:number;
 gainedAux:number;becameTwoBoards:number;reachedTwoPlus:number;reachedTwoAux:number;
 oldSourcesOnly:number;rootedFamilies:number};
const newStat=():Stat=>({originEvents:0,stillFormable:0,gainedPlus:0,
 gainedAux:0,becameTwoBoards:0,reachedTwoPlus:0,reachedTwoAux:0,
 oldSourcesOnly:0,rootedFamilies:0});
const overall=summary();
const byTurn=Object.fromEntries(TURNOS.slice(1).map(t=>[t,summary()])) as
 Record<string,ReturnType<typeof summary>>;
const attr=Object.fromEntries(KINDS.map(n=>[n,newStat()])) as Record<N,Stat>;
const dateCases:any[]=[];const errors:Record<string,string>={};
let position=0;
const draws=new Map<string,CabezasDia>(),auxiliary=new Map<string,AuxiliaryHeads>();
async function main(){
await Promise.all(Array.from({length:8},async()=>{
 while(position<allDates.length){
  const day=allDates[position++];
  try{
   const [a,b]=await Promise.all([descargarCabezas(day,true),fetchAuxiliaryHeads(day)]);
   draws.set(day,a);auxiliary.set(day,b.heads);
  }catch(e){errors[day]=String(e);}
 }
}));
if(PERIOD==='2026'&&(auxiliary.get('2026-10-20')?.Previa.Santiago!=='8067'||
 auxiliary.get('2026-10-20')?.Primera.Santiago!=='6142'||
 auxiliary.get('2026-10-20')?.Matutino.Neuquen!=='0210'))
 throw Error('Santiago Neuquén 20/10 no corresponde al dato verificado');
if(Object.keys(errors).length>10)throw Error('Demasiados fallos de fuente');
const good=allDates.filter(d=>draws.has(d)&&auxiliary.has(d)&&
 hasDrawResults(draws.get(d)!)&&hasNocturnoBase(draws.get(d)!));
let days=0,cuts=0,headsTotal=0;
for(let i=1;i<good.length;i++){
 const date=good[i];if(date<evalStart)continue;
 days++;
 const current=draws.get(date)!,aux=auxiliary.get(date)!,
  sheet=buildSheet(current,draws.get(good[i-1])!);
 const frames=sameDaySequence(date,current,sheet,aux);
 for(const frame of frames){
  if(frame.index===0)continue;
  cuts++;
  const headList=JURS.flatMap(jur=>{
   const head=current[frame.target]?.[jur]||'';
   return valid(head)?[{jur,head}]:[];
  });
  headsTotal+=headList.length;
  const cutCase:any={date,turn:frame.target,heads:headList.length,kinds:{}};
  for(const n of KINDS){
   const physical=new Map(frame.physical[n].map(p=>[p.family,p]));
   const rootBy=new Map(frame.rooted[n].map(p=>[p.family,p]));
   const sets:Record<Group,Set<string>>={
    NUEVA_FUENTE:new Set(),PERSISTE:new Set(),
    SIN_MARCA:new Set(),SIN_GEOMETRIA:new Set()
   };
   const families:Record<Group,number>={
    NUEVA_FUENTE:0,PERSISTE:0,SIN_MARCA:0,SIN_GEOMETRIA:0};
   const detail:Record<Group,{family:string;prior:PriorFamily|null}[]>={
    NUEVA_FUENTE:[],PERSISTE:[],SIN_MARCA:[],SIN_GEOMETRIA:[]
   };
   const roots=frame.rooted[n];
   attr[n].originEvents+=frame.roots[n].length;
   attr[n].rootedFamilies+=roots.length;
   for(const family of roots){
    attr[n].stillFormable++;
    if(family.newPlusSources.length)attr[n].gainedPlus++;
    if(family.newAuxSources.length)attr[n].gainedAux++;
    if(family.becameDualSheet)attr[n].becameTwoBoards++;
    if(family.reachedSecondPlus)attr[n].reachedTwoPlus++;
    if(family.reachedSecondAux)attr[n].reachedTwoAux++;
    if(family.status==='PERSISTE')attr[n].oldSourcesOnly++;
   }
   for(const p of physical.values()){
    const prior=rootBy.get(p.family)||null;
    const group:Group=prior?(prior.status==='FUENTE_NUEVA'?
     'NUEVA_FUENTE':'PERSISTE'):'SIN_MARCA';
    for(const v of p.values)sets[group].add(v);
    families[group]++;
    detail[group].push({family:p.family,prior});
   }
   // No geometría = complementos exactos del espacio de 10^n cifras;
   // solo para explicar heads, nunca construir un Top con números imposibles.
   const rootStats=attr[n];
   for(const g of groups.slice(0,3)){
    const rec=overall[n][g],perTurn=byTurn[frame.target][n][g];
    const chosen=sets[g];
    for(const dest of [rec,perTurn]){
     dest.selectedNumbers+=chosen.size;
     dest.expectedUniform+=headList.length*chosen.size/(10**n);
     dest.familyCount+=families[g];
     dest.cutWithCandidates+=Number(chosen.size>0);
    }
   }
   const counters:Record<Group,number>={NUEVA_FUENTE:0,
    PERSISTE:0,SIN_MARCA:0,SIN_GEOMETRIA:0};
   for(const {jur,head} of headList){
    const exact=head.slice(-n);
    const family=frame.physical[n].find(p=>p.values.includes(exact));
    const prior=family?rootBy.get(family.family):undefined;
    const group:Group=!family?'SIN_GEOMETRIA':
     !prior?'SIN_MARCA':
     prior.status==='FUENTE_NUEVA'?'NUEVA_FUENTE':'PERSISTE';
    counters[group]++;
    for(const dest of [overall[n][group],byTurn[frame.target][n][group]]){
     dest.heads++;
     if(group!=='SIN_MARCA'&&group!=='SIN_GEOMETRIA'){
      dest.detailedHits.push({date,turn:frame.target,jur,head,family:family!.family,
       roots:prior!.rootEvents,firstRootTurn:prior!.originTurns[0],
       sourceKind:prior!.physicalBoards.join('+')});
     }
    }
   }
   if(Object.values(counters).reduce((a,b)=>a+b,0)!==headList.length)
    throw Error('Doble conteo de una cabeza');
   if([...sets.NUEVA_FUENTE].some(x=>sets.PERSISTE.has(x)||sets.SIN_MARCA.has(x)))
    throw Error('Grupos superpuestos de terminaciones');
   cutCase.kinds['VT'+n]={
    heads:counters,priorRootFamilies:roots.length,
    newPlus:roots.filter(r=>r.newPlusSources.length).length,
    newAux:roots.filter(r=>r.newAuxSources.length).length,
    newlyDualSheet:roots.filter(r=>r.becameDualSheet).length,
    selectedExact:Object.fromEntries(groups.slice(0,3).map(g=>[g,sets[g].size])),
    winnersFromMarked:headList.filter(({head})=>
     sets.NUEVA_FUENTE.has(head.slice(-n))||sets.PERSISTE.has(head.slice(-n)))
   };
  }
  dateCases.push(cutCase);
 }
}
for(const n of KINDS)for(const part of groups){
 const r=overall[n][part];
 r.expectedUniform=Number(r.expectedUniform.toFixed(4));
}
const concise=(x:Count)=>({heads:x.heads,
 rawSelected:x.selectedNumbers,expectation:x.expectedUniform,
 events:x.familyCount,activeCuts:x.cutWithCandidates});
const out={year:PERIOD,days,cuts,headsTotal,
 methodology:'marcas solo de cabezas realmente publicadas en turnos anteriores, formadas físicamente en PRE de ambas hojas',
 interpretation:'NUEVA_FUENTE añade columna física existente tras sorteo anterior; PERSISTE no añade fuentes',
 modalities:Object.fromEntries(KINDS.map(n=>['vt'+n,Object.fromEntries(
  groups.map(g=>[g,{...concise(overall[n][g]),detailedHits:overall[n][g].detailedHits}])
 )])),
 transitionStats:attr,
 byTurn:Object.fromEntries(Object.entries(byTurn).map(([t,stats])=>
  [t,Object.fromEntries(KINDS.map(n=>['vt'+n,Object.fromEntries(groups.map(
   g=>[g,concise(stats[n][g])]))]))])),
 cases:dateCases,
 errors,
 warnings:['cabezas formables por geometría NO son apuestas ni Tops',
 'familia marcada no significa acierto monetario posterior',
 'cuenta cada cabeza una vez por modalidad, no rutas múltiples',
 'sin premisas sobre ganancia ni probabilidad estable de números sorteados']
};
mkdirSync('lab-results',{recursive:true});
writeFileSync('lab-results/intrajornada-'+PERIOD+'.json',JSON.stringify(out,null,2));
console.log('INTRA_RESUMEN',JSON.stringify({
 year:PERIOD,days,cuts,heads:headsTotal,
 totals:Object.fromEntries(KINDS.map(n=>['VT'+n,Object.fromEntries(
 groups.map(g=>[g,concise(overall[n][g])]))])),
 transitionStats:attr,
 byTurn:out.byTurn,
 exceptions:errors
}));
console.log('INTRA_20OCT',JSON.stringify(dateCases.filter(x=>
 x.date===PERIOD+'-10-20')));

}
void main().catch(e=>{console.error('INTRA_ERROR',e);process.exitCode=1});
