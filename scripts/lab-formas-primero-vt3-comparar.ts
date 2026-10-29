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
import {buildFormFirstMotor,formPositions} from '../src/motorFormasPrimero';
import type {InfoVisualDay} from '../src/infoTurnHistory';

const from='2026-10-12',through='2026-10-28';
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
type Cut={date:string;turn:string;period:string;heads:{jur:string;head:string;family:string}[];
 lalo:string[];forms:string[];physicalFamilies:number;physicallyFormableHeads:number;
 formRoots:number;formPositions:number;formCandidates:number;formSourceDays:number};
async function main(){
 const cuts:Cut[]=[];
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
   const forms=buildFormFirstMotor(pre,date,turn,days);
   const laloTop=lalo.ranks.vt3.slice(0,10).map(x=>x.family);
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
    ...h,family:reversibleFamily(h.head.slice(-3))
   }));
   const positions=formPositions(pre,turn);
   const physicalSet=new Set(positions.map(p=>{
    const source=pre.columns.find(c=>c.id===p.source)!;
    return reversibleFamily(p.cells.map(c=>source.values[c.row][c.col]).join(''));
   }));
   cuts.push({date,turn,period:date<='2026-10-20'?'12_AL_20':'21_AL_28',
    heads:real,lalo:laloTop,forms:formTop,
    physicalFamilies:physicalSet.size,
    physicallyFormableHeads:real.filter(x=>physicalSet.has(x.family)).length,
    formRoots:forms.validRoots,formPositions:forms.physicalPositions,
    formCandidates:forms.top.length,formSourceDays:forms.rootDays.length});
  }
  console.log('FORMAS_DIA',date,'cortes',cuts.length);
 }
 const ranges=[3,5,10];
 const countHits=(cs:Cut[],model:'lalo'|'forms',k:number)=>cs.reduce((n,c)=>
  n+c.heads.filter(h=>c[model].slice(0,k).includes(h.family)).length,0);
 const groups=['12_AL_20','21_AL_28','TODOS'].map(period=>{
  const subset=cuts.filter(c=>period==='TODOS'||c.period===period);
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
  return {period,cuts:subset.length,
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
 });
 const report={
  method:'RETROSPECTIVE_RECONSTRUCTION_NOT_PRE_SEALED',
  from,through,days:new Set(cuts.map(c=>c.date)).size,cuts:cuts.length,
  heads:cuts.reduce((n,c)=>n+c.heads.length,0),skipped,groups,
  selection:'FORMA/LOCALIZACION primero, lectura VT3 después',
  futureHeadsNeverUsedToRank:true,unchangedMotorLalo:true,
  limitations:[
   'La repetición de formas puede ser común y generar muchos candidatos.',
   'La comparación es retrospectiva, no un PRE externo sellado antes del sorteo.',
   'No se ajustaron criterios en función de los resultados objetivos.',
   'No se puede afirmar ventaja predictiva por coincidencia en una muestra pequeña.'
  ]
 };
 const dir='auditorias/formas-primero-vt3';
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/resumen.json',JSON.stringify(report,null,2)+'\n');
 fs.writeFileSync(dir+'/cortes.json',JSON.stringify(cuts,null,2)+'\n');
 console.log('FORMAS_PRIMERO_COMPARACION',JSON.stringify(report));
}
main().catch(e=>{console.error('FORMAS_PRIMERO_ERROR',e);process.exitCode=1});