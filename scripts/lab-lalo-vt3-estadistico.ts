/**
 * BASELINE ESTADISTICO VT3 LALO, sin apostar ni editar motores.
 * Ranking entre TODAS las familias físicas de +11 usando exclusivamente
 * frecuencia de cabezas publicadas antes de la jornada objetivo.
 * Comparación PRE/POST contra 20 controles aleatorios PAREADOS por
 * orientaciones reversibles y contra MV1 oficial.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import {shiftDay} from '../src/dates';
import type {CabezasDia,Turno} from '../src/domain';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {formPositions} from '../src/motorFormasPrimero';
import {physicalAnatomy} from '../src/labLaloAnatomiaSinPuestoVT3';
import {priorFrequencies,rankedByFrequency,neutralMatched,expectedUniform}
 from '../src/labLaloEstadisticoVT3';

const from=process.env.ESTAD_FROM||'2026-06-01';
const to=process.env.ESTAD_TO||'2026-08-31';
const label=process.env.ESTAD_LABEL||'junio-agosto';
const skipOctober=process.env.ESTAD_SKIP_OCT_EARLY==='1';
const nControls=20;
const valid=(v:string)=>/^\d{4}$/.test(v);
const cache=new Map<string,Promise<CabezasDia>>();
function get(d:string){
 if(!cache.has(d))cache.set(d,descargarCabezas(d,true));
 return cache.get(d)!;
}
type Complete={date:string;heads:CabezasDia;sheet:ReturnType<typeof buildSheet>};
const completedCache=new Map<string,Promise<Complete>>();
async function completed(date:string):Promise<Complete>{
 if(!completedCache.has(date))completedCache.set(date,(async()=>{
  const [heads,base]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(base.missing.length)throw Error('Falta Nocturna PRE '+date);
  return {date,heads,sheet:buildSheet(heads,base.heads)};
 })());
 return completedCache.get(date)!;
}
type Method='ORIGINAL'|'FRECUENCIA_6'|'FRECUENCIA_30';
const METHODS:Method[]=['ORIGINAL','FRECUENCIA_6','FRECUENCIA_30'];
type Cut={date:string;turn:Turno;stage:'temprana'|'completa';
 sample6:number;sample30:number;familyPool:number;
 heads:{jur:string;head:string;family:string}[];
 methods:Record<Method,{top:string[];hits:number;uniformExpected:number;
  controls:number[];orientationSlots:number}>;
};
const cuts:Cut[]=[],skips:{date:string;error:string}[]=[];
const sums=(r:Cut[],method:Method)=>{
 const rows=r.map(x=>x.methods[method]);
 const controls=Array.from({length:nControls},(_,i)=>rows.reduce((n,x)=>n+x.controls[i],0));
 return {hits:rows.reduce((n,x)=>n+x.hits,0),
  slots:rows.reduce((n,x)=>n+x.top.length,0),
  nominal:+rows.reduce((n,x)=>n+x.uniformExpected,0).toFixed(3),
  controls,neutralAverage:+(controls.reduce((a,b)=>a+b,0)/nControls).toFixed(3),
  neutralMin:Math.min(...controls),neutralMax:Math.max(...controls),
  orientationSlots:rows.reduce((n,x)=>n+x.orientationSlots,0)};
};
const aggregate=(r:Cut[])=>({days:new Set(r.map(x=>x.date)).size,
 cuts:r.length,heads:r.reduce((n,x)=>n+x.heads.length,0),
 meanPhysicalFamilies:+(r.reduce((n,x)=>n+x.familyPool,0)/Math.max(1,r.length)).toFixed(2),
 methods:Object.fromEntries(METHODS.map(k=>[k,sums(r,k)]))});
async function main(){
 for(let date=from;date<=to;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  if(skipOctober&&date>='2026-10-01'&&date<'2026-10-12')continue;
  try{
   const [actual,previous]=await Promise.all([
    get(date),loadPreviousDraws(date,30,get,60)
   ]);
   const targetHeads=TURNOS.reduce((n,t)=>n+
    JURS.filter(j=>j!=='Montevideo'&&valid(actual[t]?.[j]||'')).length,0);
   if(targetHeads!==25)throw Error('Jornada incompleta '+targetHeads);
   const d1=previous[previous.length-1],weekDate=shiftDay(date,-7);
   if(!d1||d1.date>=date)throw Error('FUGA pasado insuficiente');
   const weekInfo=previous.find(x=>x.date===weekDate);
   const old=await completed(d1.date);
   const week=weekInfo&&hasDrawResults(weekInfo.heads)?await completed(weekDate):null;
   const roots:LaloHistorical[]=[
    {date:old.date,period:'D−1',sheet:old.sheet},
    ...(week?[{date:week.date,period:'D−7' as const,sheet:week.sheet}]:[])
   ];
   const base=await nocturnaAnteriorPorJur(date,get,20);
   if(base.missing.length)throw Error('Base PRE '+date);
   const stats6=priorFrequencies(previous.slice(-6),date);
   const stats30=priorFrequencies(previous,date);
   const day:Cut[]=[];
   for(const [idx,turn] of TURNOS.entries()){
    const masked=diaVacio();
    for(const t of TURNOS.slice(0,idx))masked[t]={...actual[t]};
    const pre=preSheetAtCut(buildSheet(masked,base.heads),turn,idx);
    if(TURNOS.slice(idx).some(t=>pre.heads[t]?.length||pre.matches[t]?.length))
     throw Error('FUGA POST '+turn);
    const ranked=buildMotorLalo(pre,date,turn,roots).ranks.vt3;
    const families=physicalAnatomy(pre,turn,formPositions(pre,turn));
    const available=new Set(families.map(f=>f.family));
    const official=ranked.slice(0,10).map(x=>x.family);
    if(official.some(x=>!available.has(x)))throw Error('FUGA candidato original');
    const frequency6=rankedByFrequency(families,stats6).slice(0,10).map(x=>x.family);
    const frequency30=rankedByFrequency(families,stats30).slice(0,10).map(x=>x.family);
    const heads=JURS.filter(j=>j!=='Montevideo')
     .map(jur=>({jur,head:actual[turn][jur]}))
     .map(x=>({...x,family:reversibleFamily(x.head.slice(-3))}));
    const methods={} as Cut['methods'];
    for(const [method,top] of [
     ['ORIGINAL',official],
     ['FRECUENCIA_6',frequency6],
     ['FRECUENCIA_30',frequency30]
    ] as const){
     const controls=Array.from({length:nControls},(_,i)=>
      neutralMatched(families,top,date+'|'+turn+'|'+method+'|'+i));
     if(controls.some(v=>v.length!==top.length))throw Error('FUGA cupo neutro');
     const orientations=top.reduce((n,f)=>n+(f.split('/')[0]===f.split('/')[1]?1:2),0);
     if(controls.some(v=>v.reduce((n,f)=>n+(f.split('/')[0]===f.split('/')[1]?1:2),0)!==orientations))
      throw Error('FUGA neutral no coincide en orientaciones');
     methods[method]={
      top,hits:heads.filter(h=>top.includes(h.family)).length,
      uniformExpected:expectedUniform(top,heads.length),
      controls:controls.map(v=>heads.filter(h=>v.includes(h.family)).length),
      orientationSlots:orientations
     };
    }
    day.push({date,turn,stage:idx<3?'temprana':'completa',
     sample6:stats6.n,sample30:stats30.n,familyPool:families.length,
     heads,methods});
   }
   cuts.push(...day);
   console.log('ESTAD_DIA',date,JSON.stringify(day.map(x=>({turn:x.turn,
    pool:x.familyPool,original:x.methods.ORIGINAL.hits,
    six:x.methods.FRECUENCIA_6.hits,thirty:x.methods.FRECUENCIA_30.hits}))));
  }catch(e){
   if(String(e).includes('FUGA'))throw e;
   skips.push({date,error:String(e).slice(0,240)});
   console.log('ESTAD_SKIP',date,String(e).slice(0,140));
  }
 }
 const stages=['temprana','completa','todas'] as const;
 const summary=Object.fromEntries(stages.map(stage=>{
  const rows=cuts.filter(x=>stage==='todas'||x.stage===stage);
  return [stage,{all:aggregate(rows),
   byMonth:Object.fromEntries([...new Set(rows.map(x=>x.date.slice(0,7)))].sort()
    .map(m=>[m,aggregate(rows.filter(x=>x.date.startsWith(m)))])),
   byTurn:Object.fromEntries(TURNOS.filter(t=>rows.some(x=>x.turn===t))
    .map(t=>[t,aggregate(rows.filter(x=>x.turn===t))]))
  }];
 }));
 const result={label,from,to,days:new Set(cuts.map(x=>x.date)).size,
  cuts:cuts.length,skips,
  algorithm:'Frecuencias previas 6/30 jornadas, entre familias VT3 fisicas +11. Posterior Dirichlet con fuerza equivalente 500 cabezas, familias reversibles de 1/2 orientaciones. Nulo 20 controles de igual numero de familias y orientaciones. Cabezas POST solo para evaluacion.',
  summary,cutsDetail:cuts};
 fs.mkdirSync('auditorias/lalo-vt3-estadistico',{recursive:true});
 fs.writeFileSync('auditorias/lalo-vt3-estadistico/'+label+'.json',JSON.stringify(result,null,2)+'\n');
 console.log('ESTAD_SUMMARY',JSON.stringify({label,days:result.days,cuts:result.cuts,skips,summary,
  friday:cuts.filter(x=>x.date==='2026-10-30').map(x=>({
   turn:x.turn,heads:x.heads,
   top:Object.fromEntries(METHODS.map(m=>[m,x.methods[m].top])),
   hits:Object.fromEntries(METHODS.map(m=>[m,x.methods[m].hits]))
  }))
 }));
 if(cuts.length<Number(process.env.ESTAD_MIN_CUTS||100))
  throw Error('Muestra incompleta '+cuts.length);
}
main().catch(e=>{console.error('ESTAD_ERROR',e);process.exitCode=1});
