/** Diagnóstico SIN cambiar el motor Lalo ni seleccionar top adicionales. */
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
import type {PhysicalAnatomy} from '../src/labLaloAnatomiaSinPuestoVT3';
const from=process.env.ANATOMIA_FROM||'2026-06-01';
const to=process.env.ANATOMIA_TO||'2026-08-31';
const label=process.env.ANATOMIA_LABEL||'historico';
const skipOct=process.env.ANATOMIA_SKIP_OCT_EARLY==='1';
const valid=(x:string)=>/^\d{4}$/.test(x);
const allCache=new Map<string,Promise<CabezasDia>>();
function draw(d:string){if(!allCache.has(d))allCache.set(d,descargarCabezas(d,true));return allCache.get(d)!;}
type Day={date:string;heads:CabezasDia;sheet:ReturnType<typeof buildSheet>};
const completeCache=new Map<string,Promise<Day>>();
async function full(d:string){
 if(!completeCache.has(d))completeCache.set(d,(async()=>{
  const [heads,prev]=await Promise.all([draw(d),nocturnaAnteriorPorJur(d,draw,20)]);
  if(prev.missing.length)throw Error('Falta Nocturna anterior '+d);
  return {date:d,heads,sheet:buildSheet(heads,prev.heads)};
 })());
 return completeCache.get(d)!;
}
type CellCount={families:number;heads:number;nominalExpected:number;
 oneOrientation:number;twoOrientations:number;pathSum:number};
const fresh=():CellCount=>({families:0,heads:0,nominalExpected:0,
 oneOrientation:0,twoOrientations:0,pathSum:0});
const add=(dst:CellCount,src:CellCount)=>{dst.families+=src.families;dst.heads+=src.heads;
 dst.nominalExpected+=src.nominalExpected;dst.oneOrientation+=src.oneOrientation;
 dst.twoOrientations+=src.twoOrientations;dst.pathSum+=src.pathSum;};
const normalized=(x:CellCount)=>({...x,nominalExpected:+x.nominalExpected.toFixed(3),
 obsOverNominal:x.nominalExpected?+(x.heads/x.nominalExpected).toFixed(3):null,
 headPer1000Families:x.families?+(1000*x.heads/x.families).toFixed(3):null});
type Case={date:string;turn:Turno;jur:string;head:string;family:string;
 rank:number|null;formRank:number|null;physical:boolean;
 anatomy:PhysicalAnatomy|null};
type Cut={date:string;turn:Turno;stage:'temprana'|'completa';
 heads:number;formable:number;rankedCount:number;formFirstCount:number;
 byRank:Record<string,CellCount>;
 rootlessByFrontier:Record<string,CellCount>;
 rootlessByMultiplicity:Record<string,CellCount>;
 rootlessBySourceCount:Record<string,CellCount>;
 rootlessByFormsRank:Record<string,CellCount>;
 rootlessByFrontierAndMultiplicity:Record<string,CellCount>;
 cases:Case[]};
const rootCategory=(r:number|null)=>r===null?'SIN_PUESTO':r<=10?'TOP10':r<=20?'11_A_20':'21_MAS';
const formsCategory=(r:number|null)=>r===null?'FUERA_100':r<=10?'FORMAS_1_A_10':r<=30?'FORMAS_11_A_30':'FORMAS_31_A_100';
const columns=['UNICA_COLUMNA','SOLO_NUEVA','SOLO_ANTIGUAS','NUEVA_Y_ANTIGUAS'];
const paths=['UN_CAMINO','DOS_TRES','CUATRO_MAS'];
const counts=['UNA_FUENTE','DOS_MAS_FUENTES'];
const buckets=['FORMAS_1_A_10','FORMAS_11_A_30','FORMAS_31_A_100','FUERA_100'];
const ranks=['TOP10','11_A_20','21_MAS','SIN_PUESTO'];
const init=(keys:readonly string[])=>Object.fromEntries(keys.map(k=>[k,fresh()])) as Record<string,CellCount>;
const tally=(obj:Record<string,CellCount>,key:string,r:PhysicalAnatomy,headHits:number,heads:number)=>{
 if(!obj[key])obj[key]=fresh();
 const x=obj[key];x.families++;x.heads+=headHits;x.pathSum+=r.pathCount;
 x.nominalExpected+=heads*r.expectedHeadHitsPerJur;
 (r.members===1?x.oneOrientation++:x.twoOrientations++);
};
const dateRows:Cut[]=[],errors:{date:string;reason:string}[]=[];
async function main(){
 for(let date=from;date<=to;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  if(skipOct&&date>='2026-10-01'&&date<'2026-10-12')continue;
  try{
   const [today,previous]=await Promise.all([draw(date),loadPreviousDraws(date,6,draw)]);
   if(TURNOS.some(t=>JURS.filter(j=>j!=='Montevideo').some(j=>!valid(today[t]?.[j]||''))))
    throw Error('Jornada incompleta');
   const recent=[...(await Promise.all(previous.map(x=>full(x.date))))].reverse();
   const week=shiftDay(date,-7);
   const weekly=recent.find(p=>p.date===week)||await full(week);
   const old=recent[0];
   const historical:LaloHistorical[]=[
    {date:old.date,period:'D−1',sheet:old.sheet},
    ...(hasDrawResults(weekly.heads)?[{date:week,period:'D−7' as const,sheet:weekly.sheet}]:[])
   ];
   const histories:InfoVisualDay[]=recent.map(x=>({date:x.date,heads:x.heads,sheet:x.sheet}));
   if([...historical.map(h=>h.date),...histories.map(h=>h.date)].some(d=>d>=date))
    throw Error('FUGA: historial contiene fecha objetivo');
   const prev=await nocturnaAnteriorPorJur(date,draw,20);
   if(prev.missing.length)throw Error('Nocturnas del PRE incompletas');
   const day:Cut[]=[];
   for(const [index,turn] of TURNOS.entries()){
    const masked=diaVacio();
    for(const t of TURNOS.slice(0,index))masked[t]={...today[t]};
    const pre=preSheetAtCut(buildSheet(masked,prev.heads),turn,index);
    if(TURNOS.slice(index).some(t=>pre.heads[t]?.length||pre.matches[t]?.length))
     throw Error('FUGA: POST en la hoja PRE');
    const ranked=buildMotorLalo(pre,date,turn,historical).ranks.vt3;
    const forms=buildFormFirstMotor(pre,date,turn,histories,100).top;
    const rankMap=new Map(ranked.map(x=>[x.family,x.rank]));
    const formMap=new Map(forms.map(x=>[x.family,x.rank]));
    const positions=formPositions(pre,turn);
    const physical=physicalAnatomy(pre,turn,positions);
    const families=new Map(physical.map(x=>[x.family,x]));
    if(ranked.some(x=>!families.has(x.family))||forms.some(x=>!families.has(x.family)))
     throw Error('FUGA: ranking o formas sin camino físico');
    const actual=JURS.filter(j=>j!=='Montevideo').map(jur=>({jur,head:today[turn][jur]}))
     .filter(h=>valid(h.head)).map(h=>({...h,family:reversibleFamily(h.head.slice(-3))}));
    const frequency=new Map<string,number>();
    for(const h of actual)frequency.set(h.family,(frequency.get(h.family)||0)+1);
    const byRank=init(ranks),rootlessByFrontier=init(columns),
     rootlessByMultiplicity=init(paths),rootlessBySourceCount=init(counts),
     rootlessByFormsRank=init(buckets),
     rootlessByFrontierAndMultiplicity=init(columns.flatMap(a=>paths.map(b=>a+'|'+b)));
    for(const anatomy of physical){
     const r=rankMap.get(anatomy.family)??null;
     const hits=frequency.get(anatomy.family)||0;
     const category=rootCategory(r);
     tally(byRank,category,anatomy,hits,actual.length);
     if(category!=='SIN_PUESTO')continue;
     tally(rootlessByFrontier,anatomy.frontier,anatomy,hits,actual.length);
     tally(rootlessByMultiplicity,anatomy.multiplicity,anatomy,hits,actual.length);
     tally(rootlessBySourceCount,anatomy.sourceCount===1?'UNA_FUENTE':'DOS_MAS_FUENTES',anatomy,hits,actual.length);
     tally(rootlessByFormsRank,formsCategory(formMap.get(anatomy.family)??null),anatomy,hits,actual.length);
     tally(rootlessByFrontierAndMultiplicity,anatomy.frontier+'|'+anatomy.multiplicity,anatomy,hits,actual.length);
    }
    const cases=actual.filter(h=>families.has(h.family)).map(h=>({
     ...h,date,turn,rank:rankMap.get(h.family)??null,
     formRank:formMap.get(h.family)??null,
     physical:true,anatomy:families.get(h.family)!
    }));
    const checks=[byRank.SIN_PUESTO, ...Object.values(rootlessByFrontier)];
    if(checks[0].heads!==checks.slice(1).reduce((n,x)=>n+x.heads,0)||
     byRank.SIN_PUESTO.families!==checks.slice(1).reduce((n,x)=>n+x.families,0))
     throw Error('FUGA: particiones no coinciden');
    day.push({date,turn,stage:index<=2?'temprana':'completa',heads:actual.length,
     formable:actual.filter(x=>families.has(x.family)).length,
     rankedCount:ranked.length,formFirstCount:forms.length,
     byRank,rootlessByFrontier,rootlessByMultiplicity,
     rootlessBySourceCount,rootlessByFormsRank,rootlessByFrontierAndMultiplicity,cases});
   }
   dateRows.push(...day);
   console.log('ANATOMIA_DAY',date,JSON.stringify(day.map(c=>({
    turn:c.turn,formable:c.formable,rootless:c.byRank.SIN_PUESTO.heads,
    new:c.rootlessByFrontier.SOLO_NUEVA.heads,old:c.rootlessByFrontier.SOLO_ANTIGUAS.heads,
    multiple:c.rootlessByFrontier.NUEVA_Y_ANTIGUAS.heads
   }))));
  }catch(e){
   if(String(e).includes('FUGA'))throw e;
   errors.push({date,reason:String(e).slice(0,220)});
   console.log('ANATOMIA_SKIP',date,String(e).slice(0,180));
  }
 }
 const stages=['temprana','completa','todas'];
 const kinds=['byRank','rootlessByFrontier','rootlessByMultiplicity',
  'rootlessBySourceCount','rootlessByFormsRank','rootlessByFrontierAndMultiplicity'] as const;
 const aggregate=(cuts:Cut[])=>{
  const obj=Object.fromEntries(kinds.map(k=>{
   const result:Record<string,CellCount>={};
   for(const c of cuts)for(const [g,x] of Object.entries(c[k])){
    if(!result[g])result[g]=fresh();
    add(result[g],x);
   }
   return [k,Object.fromEntries(Object.entries(result).map(([g,v])=>[g,normalized(v)]))];
  }));
  return {cuts:cuts.length,days:new Set(cuts.map(c=>c.date)).size,
   heads:cuts.reduce((n,c)=>n+c.heads,0),formable:cuts.reduce((n,c)=>n+c.formable,0),
   ...obj};
 };
 const summary=Object.fromEntries(stages.map(stage=>{
  const stageCuts=dateRows.filter(c=>stage==='todas'||c.stage===stage);
  return [stage,{all:aggregate(stageCuts),
   byMonth:Object.fromEntries([...new Set(stageCuts.map(c=>c.date.slice(0,7)))].sort()
    .map(m=>[m,aggregate(stageCuts.filter(c=>c.date.startsWith(m)))])),
   byTurn:Object.fromEntries(TURNOS.filter(t=>stageCuts.some(c=>c.turn===t))
    .map(t=>[t,aggregate(stageCuts.filter(c=>c.turn===t))]))
  }];
 }));
 const report={label,from,to,days:new Set(dateRows.map(x=>x.date)).size,
  cuts:dateRows.length,skipped:errors,summary,
  cases:dateRows.flatMap(c=>c.cases.filter(x=>x.rank===null)),
  detail:dateRows};
 fs.mkdirSync('auditorias/lalo-anatomia-vt3',{recursive:true});
 fs.writeFileSync('auditorias/lalo-anatomia-vt3/'+label+'.json',JSON.stringify(report,null,2)+'\n');
 console.log('ANATOMIA_SUMMARY',JSON.stringify({
  label,days:report.days,cuts:report.cuts,skipped:errors,summary,
  octoberCases:report.cases.filter(x=>x.date>='2026-10-27').slice(-25)
 }));
 if(dateRows.length<Number(process.env.ANATOMIA_MIN_CUTS||100))
  throw Error('Muestra de cortes incompleta');
}
main().catch(e=>{console.error('ANATOMIA_ERROR',e);process.exitCode=1});
