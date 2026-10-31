/** +11 VT3 probabilístico y geométrico: entrenar Jun-Jul, evaluar Ago y Sep-Oct.
 * Ninguna señal se decide con datos de agosto en adelante.
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
import {buildFormFirstMotor,formPositions} from '../src/motorFormasPrimero';
import type {InfoVisualDay} from '../src/infoTurnHistory';
import {physicalAnatomy} from '../src/labLaloAnatomiaSinPuestoVT3';
import {priorFrequencies,rankedByFrequency,neutralMatched,expectedUniform}
 from '../src/labLaloEstadisticoVT3';
import {featuresFor,trainEvidence,selectBayes}
 from '../src/labLaloBayesGeometriaVT3';
import type {LabeledFamily,GeometricEvidence} from '../src/labLaloBayesGeometriaVT3';

const valid=(x:string)=>/^\d{4}$/.test(x),end='2026-10-29';
const nControls=20;
type Method='MV1'|'FREC30'|'GEO_CAL'|'HIBRIDO';
const methods:Method[]=['MV1','FREC30','GEO_CAL','HIBRIDO'];
type Sample={date:string;turn:Turno;stage:'temprana'|'completa';period:string;
 countHeads:number;physicalCount:number;
 samples:Record<Method,{hits:number;uniform:number;slots:number;orientations:number;
  controls:number[];top:string[]}>;
 witnesses:{jur:string;head:string;family:string;methods:Method[]}[];
};
const train:LabeledFamily[]=[],holdout:Sample[]=[],skips:any[]=[];
const drawCache=new Map<string,Promise<CabezasDia>>();
const completedCache=new Map<string,Promise<{date:string;heads:CabezasDia;
 sheet:ReturnType<typeof buildSheet>}>>();
function get(date:string){
 if(!drawCache.has(date))drawCache.set(date,descargarCabezas(date,true));
 return drawCache.get(date)!;
}
async function full(date:string){
 if(!completedCache.has(date))completedCache.set(date,(async()=>{
  const [heads,prior]=await Promise.all([get(date),nocturnaAnteriorPorJur(date,get,20)]);
  if(prior.missing.length)throw Error('No hay Nocturna anterior '+date);
  return {date,heads,sheet:buildSheet(heads,prior.heads)};
 })());
 return completedCache.get(date)!;
}
function sum(x:Sample[],m:Method){
 const rows=x.map(r=>r.samples[m]);
 const controls=Array.from({length:nControls},(_,i)=>rows.reduce((a,b)=>a+b.controls[i],0));
 return {hits:rows.reduce((a,b)=>a+b.hits,0),
  expected:+rows.reduce((a,b)=>a+b.uniform,0).toFixed(3),
  controlsMean:+(controls.reduce((a,b)=>a+b,0)/nControls).toFixed(2),
  controlsMin:Math.min(...controls),controlsMax:Math.max(...controls),
  controls,slots:rows.reduce((a,b)=>a+b.slots,0),
  orientations:rows.reduce((a,b)=>a+b.orientations,0)};
}
function summary(x:Sample[]){
 return {days:new Set(x.map(r=>r.date)).size,cuts:x.length,
  heads:x.reduce((a,b)=>a+b.countHeads,0),
  methods:Object.fromEntries(methods.map(m=>[m,sum(x,m)]))};
}
async function main(){
 let model:GeometricEvidence|null=null;
 const trainingDates=new Set<string>();
 for(let date='2026-06-01';date<=end;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  if(date>='2026-10-01'&&date<'2026-10-12')continue;
  try{
   const [heads,priorDays]=await Promise.all([get(date),loadPreviousDraws(date,30,get,60)]);
   if(TURNOS.some(t=>JURS.filter(j=>j!=='Montevideo')
    .some(j=>!valid(heads[t]?.[j]||''))))throw Error('Jornada sin 25 cabezas');
   const six=await Promise.all(priorDays.slice(-6).map(d=>full(d.date)));
   const recent=[...six].reverse();
   const d1=priorDays.at(-1)!;
   const weekDate=shiftDay(date,-7);
   const prev=[{date:d1.date,period:'D−1' as const,sheet:(await full(d1.date)).sheet}];
   const week=priorDays.find(x=>x.date===weekDate);
   if(week&&hasDrawResults(week.heads))prev.push({date:weekDate,period:'D−7' as const,
    sheet:(await full(weekDate)).sheet});
   const info:InfoVisualDay[]=recent.map(d=>({date:d.date,sheet:d.sheet,heads:d.heads}));
   const previous=await nocturnaAnteriorPorJur(date,get,20);
   if(previous.missing.length)throw Error('Nocturna base incompleta');
   const stats30=priorFrequencies(priorDays,date);
   const localTrain:LabeledFamily[]=[],localTest:Sample[]=[];
   for(const [idx,turn] of TURNOS.entries()){
    const masked=diaVacio();
    for(const t of TURNOS.slice(0,idx))masked[t]={...heads[t]};
    const pre=preSheetAtCut(buildSheet(masked,previous.heads),turn,idx);
    if(TURNOS.slice(idx).some(t=>pre.heads[t]?.length||pre.matches[t]?.length))
     throw Error('FUGA: cabezas futuras en PRE');
    const physical=physicalAnatomy(pre,turn,formPositions(pre,turn));
    const original=buildMotorLalo(pre,date,turn,prev).ranks.vt3;
    const formFirst=buildFormFirstMotor(pre,date,turn,info,100).top;
    const originalMap=new Map(original.map(x=>[x.family,x.rank]));
    const formMap=new Map(formFirst.map(x=>[x.family,x.rank]));
    const available=new Set(physical.map(x=>x.family));
    if(original.some(x=>!available.has(x.family))||
       formFirst.some(x=>!available.has(x.family)))throw Error('FUGA: ruta no física');
    const actual=JURS.filter(j=>j!=='Montevideo').map(jur=>({
     jur,head:heads[turn][jur],family:reversibleFamily(heads[turn][jur].slice(-3))
    }));
    const frequency=new Map<string,number>();
    for(const h of actual)frequency.set(h.family,(frequency.get(h.family)||0)+1);
    const scored=physical.map(p=>({family:p.family,members:p.members,
      features:featuresFor(p,originalMap.get(p.family)??null,formMap.get(p.family)??null),
      freq30:stats30.counts.get(p.family)||0,trainingN:stats30.n
    }));
    if(date<='2026-07-31'){
     for(const x of scored)localTrain.push({family:x.family,members:x.members,
      features:x.features,hits:frequency.get(x.family)||0,heads:actual.length});
     continue;
    }
    if(!model)throw Error('FUGA: el modelo debe congelarse antes de evaluar');
    const tops:Record<Method,string[]>={
     MV1:original.slice(0,10).map(x=>x.family),
     FREC30:rankedByFrequency(physical,stats30).slice(0,10).map(x=>x.family),
     GEO_CAL:selectBayes(scored,model,date+'|'+turn,'GEOMETRIA_CALIBRADA'),
     HIBRIDO:selectBayes(scored,model,date+'|'+turn,'HISTORIA_Y_GEOMETRIA')
    };
    const samples={} as Sample['samples'];
    for(const method of methods){
     const top=tops[method];
     if(top.some(f=>!available.has(f))||new Set(top).size!==top.length)
      throw Error('FUGA: candidato no formable');
     const neutral=Array.from({length:nControls},(_,i)=>
      neutralMatched(physical,top,[date,turn,method,i].join('|')));
     const orient=(xs:string[])=>xs.reduce((n,f)=>n+(f.split('/')[0]===f.split('/')[1]?1:2),0);
     const orientations=orient(top);
     if(neutral.some(x=>x.length!==top.length||orient(x)!==orientations))
      throw Error('FUGA: control no pareado');
     samples[method]={top,hits:actual.filter(h=>top.includes(h.family)).length,
      uniform:expectedUniform(top,actual.length),slots:top.length,orientations,
      controls:neutral.map(xs=>actual.filter(h=>xs.includes(h.family)).length)};
    }
    localTest.push({date,turn,stage:idx<3?'temprana':'completa',
     period:date<='2026-08-31'?'AGOSTO_VALIDACION':'SEP_OCT_CONTRASTE',
     countHeads:actual.length,physicalCount:physical.length,samples,
     witnesses:actual.map(h=>({...h,methods:methods.filter(m=>tops[m].includes(h.family))}))
    });
   }
   if(date<='2026-07-31'){
    train.push(...localTrain);trainingDates.add(date);
   }else{
    holdout.push(...localTest);
   }
   if(date==='2026-07-31'){
    model=trainEvidence(train);
    console.log('BAYES_FREEZE',JSON.stringify({date,days:trainingDates.size,
     exposures:train.length,model}));
   }
   if(date>='2026-08-01')console.log('BAYES_DAY',date,JSON.stringify(localTest.map(x=>({
    turn:x.turn,MV1:x.samples.MV1.hits,
    FREC30:x.samples.FREC30.hits,
    GEO_CAL:x.samples.GEO_CAL.hits,HIBRIDO:x.samples.HIBRIDO.hits
   }))));
  }catch(e){
   if(String(e).includes('FUGA'))throw e;
   skips.push({date,error:String(e).slice(0,220)});
   console.log('BAYES_SKIP',date,String(e).slice(0,180));
  }
 }
 if(!model||trainingDates.size<48||holdout.length<325)
  throw Error('FUGA cobertura insuficiente; entrenamiento '+trainingDates.size+' test '+holdout.length);
 const periods=['AGOSTO_VALIDACION','SEP_OCT_CONTRASTE','AMBOS'] as const;
 const report={method:'Jun-Jul entrenar, agosto validar, sep-oct contrastar. Sin actualizar pesos. Empirical Bayes en cuatro categorias fisicas con pseudoesperanza 20 y multiplicador acotado a .75..1.25 por factor, potencia .5. Frecuencia 30 suavizada con 500. Familias vt3 físicas, 20 nulos iguales orientaciones.',
  trainingDays:trainingDates.size,trainingExposures:train.length,
  trainingDates:[...trainingDates],evidence:model,skips,
  comparisons:Object.fromEntries(periods.map(period=>{
   const x=holdout.filter(r=>period==='AMBOS'||r.period===period);
   return [period,{all:summary(x),
    byStage:Object.fromEntries(['temprana','completa'].map(s=>[s,summary(x.filter(z=>z.stage===s))])),
    byMonth:Object.fromEntries([...new Set(x.map(z=>z.date.slice(0,7)))].sort()
     .map(m=>[m,summary(x.filter(z=>z.date.startsWith(m)))]))}];
  })),
  cuts:holdout
 };
 fs.mkdirSync('auditorias/lalo-bayes-geometria',{recursive:true});
 fs.writeFileSync('auditorias/lalo-bayes-geometria/resultado.json',JSON.stringify(report,null,2)+'\n');
 console.log('BAYES_RESULT',JSON.stringify({...report,cuts:undefined}));
}
main().catch(e=>{console.error('BAYES_ERROR',e);process.exitCode=1});
