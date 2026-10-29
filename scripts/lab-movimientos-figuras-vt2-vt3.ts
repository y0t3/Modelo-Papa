/**
 * Ensayo retrospectivo FORMAS PRIMERO VT3 vs Lalo MV1 en idénticos cortes PRE.
 * NO son predicciones selladas. POST se abre SOLO tras guardar ambos Tops.
 *
 * Experimento de validación: Octubre 12–28 (excluyendo domingos y fechas
 * sin mínimo 20 cabezas verificadas). Se divide en dos subperíodos fijos.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {buildFormFirstMotor,buildFormFirstVt2,formPositions} from '../src/motorFormasPrimero';
import type {FormKind} from '../src/motorFormasPrimero';
import {classifyFigureMotion} from '../src/figureMotionAudit';
import type {InfoVisualDay} from '../src/infoTurnHistory';
import {buildFigureRescueAudit} from '../src/figureRescueAudit';

const from=process.env.FORMAS_FROM||'2026-06-01';
const through=process.env.FORMAS_THROUGH||'2026-09-30';
const label=process.env.FORMAS_PERIOD||'historico';
const getCache=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{
 if(!getCache.has(d))getCache.set(d,descargarCabezas(d,true));
 return getCache.get(d)!;
};
type Completed={date:string;heads:CabezasDia;sheet:ReturnType<typeof buildSheet>};
const completedCache=new Map<string,Promise<Completed>>();
const complete=async(date:string)=>{
 if(!completedCache.has(date))completedCache.set(date,(async()=>{
  const [heads,base]=await Promise.all([get(date),
   nocturnaAnteriorPorJur(date,get,20)]);
  if(base.missing.length)throw Error('Faltan fuentes nocturnas '+date+
   ' '+base.missing.join(','));
  return {date,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return completedCache.get(date)!;
};
const headsFor=(data:CabezasDia,turn:typeof TURNOS[number])=>
 JURS.filter(j=>j!=='Montevideo').map(j=>({
  jur:j,head:data[turn]?.[j]||''
 })).filter(x=>/^\d{4,5}$/.test(x.head));
type Cut={kind:FormKind;date:string;turn:string;period:string;heads:{jur:string;head:string;family:string}[];
 lalo:string[];forms:string[];physicalFamilies:number;physicallyFormableHeads:number;
 formRoots:number;formPositions:number;formCandidates:number;formSourceDays:number};
type RescueCase={
 kind:FormKind;movement:string;movementCategories:string[];
 exactEvents:number;verticalEvents:number;horizontalEvents:number;
 diagonalEvents:number;sourceChangeEvents:number;
 verticalOffsets:number[];horizontalOffsets:number[];
 diagonalOffsets:{row:number;col:number}[];sourceOffsets:string[];
 date:string;turn:string;period:string;rank:number;family:string;reading:string;
 source:string;shape:string;anchor:number;path:{row:number;col:number}[];
 roots:number;rootDays:number;sameSourceRoots:number;d1:boolean;d7:boolean;
 closestSource:number;closestVertical:number;
 pastWitnesses:{date:string;turn:string;source:string;head:string;
  jur:string;reading:string;anchor:number;cells:{row:number;col:number}[]}[];
 headCount:number;actualHeads:{jur:string;head:string;selectedRouteMatches:boolean;
  physicalRouteCount:number}[];
 matchedSourceShapePool:number;matchedSourceShapeExpected:number;
 genericOutsideLaloPool:number;genericOutsideLaloExpected:number;
};
async function main(){
 const cuts:Cut[]=[];
 const rescues:RescueCase[]=[];
 const skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=through;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  const [actual,previous]=await Promise.all([
   get(date),loadPreviousDraws(date,6,get)
  ]);
  const valid=TURNOS.reduce((n,t)=>n+headsFor(actual,t).length,0);
  if(valid<20){skipped.push({date,reason:'Jornada parcial '+valid});continue}
  if(previous.length<6){skipped.push({date,reason:'Menos de seis jornadas'});continue}
  const past=await Promise.all(previous.map(x=>complete(x.date)));
  const recent=past.slice().reverse();
  const week=shiftDay(date,-7),weekSource=recent.find(d=>d.date===week)||
   await complete(week);
  const d1=recent[0],roots:LaloHistorical[]=[
   {date:d1.date,period:'D−1',sheet:d1.sheet},
   ...(week<date&&hasDrawResults(weekSource.heads)?[{
    date:week,period:'D−7' as const,sheet:weekSource.sheet
   }]:[])
  ];
  const days:InfoVisualDay[]=recent.map(d=>({
   date:d.date,sheet:d.sheet,heads:d.heads
  }));
  const base=await nocturnaAnteriorPorJur(date,get,20);
  if(base.missing.length)throw Error('Nocturnas PRE '+date);
  for(const [idx,turn] of TURNOS.entries()){
   const earlier=diaVacio();
   for(const prev of TURNOS.slice(0,idx))earlier[prev]={...actual[prev]};
   const sheet=buildSheet(earlier,base.heads);
   const pre=preSheetAtCut(sheet,turn,idx);
   if(pre.heads[turn].length||pre.matches[turn].length||
    TURNOS.slice(idx).some(t=>pre.heads[t].length||pre.matches[t].length))
    throw Error('FUGA POST al corte '+date+' '+turn);
   const lalo=buildMotorLalo(pre,date,turn,roots);
   for(const kind of ['vt2','vt3'] as const){
   const forms=kind==='vt2'?buildFormFirstVt2(pre,date,turn,days):buildFormFirstMotor(pre,date,turn,days);
   const laloTop=lalo.ranks[kind].slice(0,10).map(x=>x.family);
   const formTop=forms.top.map(x=>x.family);
   if(formTop.length>10||new Set(formTop).size!==formTop.length)
    throw Error('Top Formas repetido en '+date+' '+turn);
   // El valor de cada propuesta debe venir de su columna y camino PRE.
   for(const x of forms.top){
    const column=pre.columns.find(c=>c.id===x.source);
    if(x.value!==x.cells.map(c=>column?.values[c.row]?.[c.col]||'').join(''))
     throw Error('Se generó número fuera de la figura PRE');
    if(!x.support.roots.length||
     x.support.roots.some(r=>r.date>=date||r.shape!==x.shape))
     throw Error('Testigo de figura inválido o posterior');
   }
   const real=headsFor(actual,turn).map(h=>({
    ...h,family:reversibleFamily(h.head.slice(kind==='vt2'?-2:-3))
   }));
   const positions=formPositions(pre,turn,kind);
   const physicalSet=new Set(positions.map(p=>{
    const source=pre.columns.find(c=>c.id===p.source)!;
    return reversibleFamily(p.cells.map(c=>source.values[c.row][c.col]).join(''));
   }));
   // Evaluación POST: sólo se abre después de calcular ambos Tops PRE.
   const audit=buildFigureRescueAudit(date,turn,pre,forms,lalo,headsFor(actual,turn));
   const official=new Set(laloTop);
   const pool=new Map<string,Set<string>>(),outside=new Set<string>();
   for(const p of positions){
    const source=pre.columns.find(x=>x.id===p.source)!;
    const f=reversibleFamily(p.cells.map(c=>source.values[c.row][c.col]).join(''));
    if(official.has(f))continue;
    outside.add(f);
    const group=p.source+'|'+p.shape;
    const ls=pool.get(group)||new Set<string>();ls.add(f);pool.set(group,ls);
   }
   const headCounts=new Map<string,number>();
   for(const h of real)headCounts.set(h.family,(headCounts.get(h.family)||0)+1);
   const mean=(members:Set<string>)=>members.size?
    [...members].reduce((n,f)=>n+(headCounts.get(f)||0),0)/members.size:0;
   const genericExpected=mean(outside);
   for(const r of audit.forms.filter(r=>r.kind==='RESCATE')){
    const f=r.choice,selectedPool=pool.get(f.source+'|'+f.shape)||new Set<string>();
    if(!selectedPool.has(f.family))throw Error('Rescate sin camino físico '+date+' '+turn);
    if(r.published.some(h=>!h.selectedPositionMatches||!h.physicalPaths.length))
     throw Error('Coincidencia numérica sin ruta válida '+date+' '+turn);
    const movement=classifyFigureMotion(f);
    rescues.push({kind,movement:movement.predominant,
     movementCategories:movement.categories,
     exactEvents:movement.exactEvents,verticalEvents:movement.verticalEvents,
     horizontalEvents:movement.horizontalEvents,diagonalEvents:movement.diagonalEvents,
     sourceChangeEvents:movement.sourceChangeEvents,
     verticalOffsets:movement.verticalOffsets,horizontalOffsets:movement.horizontalOffsets,
     diagonalOffsets:movement.diagonalOffsets,sourceOffsets:movement.sourceOffsets,
     date,turn,period:date<='2026-07-31'?'JUN_JUL':
      date<='2026-09-30'?'AGO_SEP':'OCT',rank:f.rank,family:f.family,reading:f.value,
     source:f.source,shape:f.shape,anchor:f.anchor,path:f.cells,
     roots:f.support.events,rootDays:f.support.days,
     sameSourceRoots:f.support.sameSource,d1:f.support.d1,d7:f.support.d7,
     closestSource:f.support.sourceDistance,
     closestVertical:f.support.verticalDistance,
     pastWitnesses:f.support.roots.map(x=>({
      date:x.date,turn:x.turn,source:x.source,head:x.head,jur:x.jurisdiction,
      reading:x.reading,anchor:x.anchor,cells:x.cells
     })),
     headCount:r.published.length,
     actualHeads:r.published.map(x=>({jur:x.jur,head:x.head,
      selectedRouteMatches:x.selectedPositionMatches,
      physicalRouteCount:x.physicalPaths.length
     })),
     matchedSourceShapePool:selectedPool.size,
     matchedSourceShapeExpected:mean(selectedPool),
     genericOutsideLaloPool:outside.size,
     genericOutsideLaloExpected:genericExpected});
   }
   cuts.push({kind,date,turn,period:date<='2026-07-31'?'JUN_JUL':date<='2026-09-30'?'AGO_SEP':'OCT',
    heads:real,lalo:laloTop,forms:formTop,
    physicalFamilies:physicalSet.size,
    physicallyFormableHeads:real.filter(x=>physicalSet.has(x.family)).length,
    formRoots:forms.validRoots,formPositions:forms.physicalPositions,
    formCandidates:forms.top.length,formSourceDays:forms.rootDays.length});
   } // VT2 y VT3 con el mismo corte PRE.
  }
  console.log('MOVIMIENTO_VT2_VT3_DIA',date,'cortes',cuts.length);
 }
 const ranges=[3,5,10];
 const countHits=(cs:Cut[],model:'lalo'|'forms',k:number)=>cs.reduce((n,c)=>
  n+c.heads.filter(h=>c[model].slice(0,k).includes(h.family)).length,0);
 const groups=(['vt2','vt3'] as const).flatMap(kind=>['JUN_JUL','AGO_SEP','OCT','TODOS'].map(period=>{
  const subset=cuts.filter(c=>c.kind===kind&&(period==='TODOS'||c.period===period));
  const comparison=Object.fromEntries(ranges.map(k=>{
   let both=0,onlyLalo=0,onlyForms=0,neither=0,formUniqueTop10=0;
   for(const c of subset)for(const h of c.heads){
    const a=c.lalo.slice(0,k).includes(h.family);
    const b=c.forms.slice(0,k).includes(h.family);
    const newCandidate=c.forms.slice(0,k).includes(h.family)&&
      !c.lalo.slice(0,10).includes(h.family);
    if(a&&b)both++;else if(a)onlyLalo++;else if(b)onlyForms++;else neither++;
    if(newCandidate)formUniqueTop10++;
   }
   return ['top'+k,{lalo:countHits(subset,'lalo',k),
    forms:countHits(subset,'forms',k),both,onlyLalo,onlyForms,neither,
    formWinsOutsideLaloTop10:formUniqueTop10}];
  }));
  return {kind,period,cuts:subset.length,
   dates:new Set(subset.map(x=>x.date)).size,
   heads:subset.reduce((n,c)=>n+c.heads.length,0),
   formCoverage:subset.filter(x=>x.forms.length>0).length,
   formTop10Full:subset.filter(x=>x.forms.length===10).length,
   meanFormTop:subset.reduce((n,c)=>n+c.forms.length,0)/Math.max(1,subset.length),
   physicallyFormableHeads:subset.reduce((n,c)=>n+c.physicallyFormableHeads,0),
   randomExpectedTop:Object.fromEntries(ranges.map(k=>['top'+k,
    Number(subset.reduce((n,c)=>n+(c.physicalFamilies?
     c.physicallyFormableHeads*Math.min(k,c.physicalFamilies)/c.physicalFamilies:0),0).toFixed(3))
   ])),comparison};
 }));
 const histograms=(subset:RescueCase[])=>{
  const group=(key:string,select:(x:RescueCase)=>boolean)=>{
   const cases=subset.filter(select);
   const exposures=cases.length,headHits=cases.reduce((n,c)=>n+c.headCount,0);
   return {key,exposures,headHits,
    hitsPer100Exposures:Number((100*headHits/Math.max(1,exposures)).toFixed(4)),
    matchedGeometrySourceExpected:Number(cases.reduce((n,c)=>
      n+c.matchedSourceShapeExpected,0).toFixed(4)),
    outsideLaloExpected:Number(cases.reduce((n,c)=>
      n+c.genericOutsideLaloExpected,0).toFixed(4))};
  };
  return [
   group('EXACTA_ACTIVADA',x=>x.exactEvents>0),
   group('SIN_EXACTA',x=>x.exactEvents===0),
   group('DESPLAZO_VERTICAL',x=>x.verticalEvents>0),
   group('DESPLAZO_HORIZONTAL',x=>x.horizontalEvents>0),
   group('DESPLAZO_DIAGONAL',x=>x.diagonalEvents>0),
   group('SIN_DESPLAZO',x=>x.verticalEvents===0),
   group('CAMBIO_FUENTE',x=>x.sourceChangeEvents>0),
   group('SIN_CAMBIO_FUENTE',x=>x.sourceChangeEvents===0),
   group('SOLO_EXACTA',x=>x.movement==='MISMA_POSICION'),
   group('SOLO_VERTICAL',x=>x.movement==='DESPLAZAMIENTO_VERTICAL'),
   group('SOLO_CAMBIO_FUENTE',x=>x.movement==='CAMBIO_FUENTE'),
   group('MISMA_FUENTE_CON_TESTIGO',x=>x.sameSourceRoots>0),
   group('SOLO_FUENTE_VECINA',x=>x.sameSourceRoots===0),
   group('D1',x=>x.d1),group('SIN_D1',x=>!x.d1),
   group('DOS_MAS_JORNADAS',x=>x.rootDays>=2),
   group('UNA_JORNADA',x=>x.rootDays===1),
   group('SUPERIOR',x=>x.anchor<2),
   group('CENTRAL',x=>x.anchor>=2&&x.anchor<4),
   group('INFERIOR',x=>x.anchor>=4),
   ...['prevNocturno','Previa','Primera','Matutino','Vespertino'].map(source=>
    group('FUENTE_'+source,x=>x.source===source))
  ];
 };
 const audited=(['vt2','vt3'] as const).flatMap(kind=>['JUN_JUL','AGO_SEP','OCT','TODOS'].map(period=>{
  const subset=rescues.filter(x=>x.kind===kind&&(period==='TODOS'||x.period===period));
  return {kind,period,cases:subset.length,dates:new Set(subset.map(x=>x.date)).size,
   heads:subset.reduce((n,c)=>n+c.headCount,0),
   successfulCases:subset.filter(x=>x.headCount>0).length,
   exactSelectedRouteVerified:subset.every(x=>
    x.actualHeads.every(h=>h.selectedRouteMatches)),
   geometrySourceMatchedNull:Number(subset.reduce((n,c)=>
    n+c.matchedSourceShapeExpected,0).toFixed(4)),
   outsideOfficialNull:Number(subset.reduce((n,c)=>
    n+c.genericOutsideLaloExpected,0).toFixed(4)),
   groups:histograms(subset)};
 }));
 const report={
  method:'RETROSPECTIVE_RECONSTRUCTION_NOT_PRE_SEALED',
  from,through,days:new Set(cuts.map(c=>c.date)).size,cuts:cuts.length,
  heads:cuts.reduce((n,c)=>n+c.heads.length,0),skipped,groups,
  selection:'FORMA/LOCALIZACION primero, lectura VT2/VT3 después',
  rescueAudit:{definition:'Familias Formas Top10 fuera de Lalo Top10, con PRE físico y POST independiente',
   groups:audited,interpretation:'Controles emparejan silueta+fuente, no garantizan exposición idéntica a todos los recorridos; las rutas POST son verificaciones aritméticas, NO prueba causal del recorrido.'},
  futureHeadsNeverUsedToRank:true,unchangedMotorLalo:true,
  limitations:[
   'La repetición de formas puede ser común y generar muchos candidatos.',
   'La comparación es retrospectiva, no un PRE externo sellado antes del sorteo.',
   'No se ajustaron criterios en función de los resultados objetivos.',
   'No se puede afirmar ventaja predictiva por coincidencia en una muestra pequeña.'
  ]
 };
 const dir='auditorias/movimientos-figuras-vt2-vt3';
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/resumen-'+label+'.json',JSON.stringify(report,null,2)+'\n');
 fs.writeFileSync(dir+'/cortes-'+label+'.json',JSON.stringify(cuts,null,2)+'\n');
 fs.writeFileSync(dir+'/rescates-'+label+'.json',JSON.stringify(rescues,null,2)+'\n');
 console.log('MOVIMIENTOS_FIGURAS_VT2_VT3',JSON.stringify({label,...report}));
}
main().catch(e=>{console.error('FORMAS_PRIMERO_ERROR',e);process.exitCode=1});