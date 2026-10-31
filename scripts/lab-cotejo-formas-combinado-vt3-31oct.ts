/** Diagnóstico exclusivamente de lectura, PRE reconstruido del 31/10/2026.
 * La cabeza real se usa solo para cotejar, jamás para puntuar candidatos.
 * NO representa prueba de guardado PRE cronológico en el dispositivo del usuario.
 */
import {descargarCabezas} from '../src/cabezas';
import {buildSheet} from '../src/sheet';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {shiftDay} from '../src/dates';
import {preSheetAtCut} from '../src/infoCandidatos';
import {TURNOS,JURS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {loadCombinedMemory,buildCombinedTop} from '../src/laloCombinedRuntime';
import {buildFormFirstMotor,formPositions} from '../src/motorFormasPrimero';
import {physicalAnatomy} from '../src/labLaloAnatomiaSinPuestoVT3';
import {priorFrequencies} from '../src/labLaloEstadisticoVT3';
import {featuresFor,geoFactor} from '../src/labLaloBayesGeometriaVT3';
import {FROZEN_GEOMETRY} from '../src/laloCombinedFrozenWeights';
const date='2026-10-31';
const jur=JURS.filter(j=>j!=='Montevideo');
const memoryDay=new Map<string,Promise<CabezasDia>>();
async function fetchDay(d:string){let t=memoryDay.get(d);if(!t){t=descargarCabezas(d,true);memoryDay.set(d,t)}return t}
async function sheetFor(d:string){
 const [current,base]=await Promise.all([fetchDay(d),nocturnaAnteriorPorJur(d,fetchDay,20)]);
 return buildSheet(current,base.heads);
}
async function run(){
 const [heads,sheet,memory]=await Promise.all([fetchDay(date),sheetFor(date),loadCombinedMemory(date)]);
 const d1=memory.prior.at(-1)?.date;
 if(!d1)throw Error('Falta D-1');
 const d7=shiftDay(date,-7);
 const hist:LaloHistorical[]=[{date:d1,period:'D−1',sheet:await sheetFor(d1)}];
 if(memory.prior.some(x=>x.date===d7))hist.push({date:d7,period:'D−7',sheet:await sheetFor(d7)});
 console.log('DATOS: fecha '+date+' D1 '+d1+' D7 '+d7+' D7valida '+hist.some(x=>x.period==='D−7')+' 30 dias '+memory.prior.length+' seis '+memory.lastSix.length);
 for(const turn of ['Previa','Matutino'] as Turno[]){
  const pre=preSheetAtCut(sheet,turn,TURNOS.indexOf(turn));
  const form=buildFormFirstMotor(pre,date,turn,memory.lastSix,100);
  const combined=buildCombinedTop(pre,date,turn,hist,memory);
  const original=buildMotorLalo(pre,date,turn,hist).ranks.vt3;
  const positions=formPositions(pre,turn,'vt3');
  const physical=physicalAnatomy(pre,turn,positions);
  const frequency=priorFrequencies(memory.prior,date);
  const originalRanks=new Map(original.map(x=>[x.family,x.rank]));
  const formRanks=new Map(form.top.map(x=>[x.family,x.rank]));
  const scores=physical.map(p=>{
    const feature=featuresFor(p,originalRanks.get(p.family)??null,formRanks.get(p.family)??null);
    const count=frequency.counts.get(p.family)||0;
    const posterior=(count+500*p.members/1000)/(frequency.n+500);
    const gf=geoFactor(feature,FROZEN_GEOMETRY);
    return {family:p.family,score:posterior*gf,geoFactor:gf,frequency:count,
     rankedForm:formRanks.get(p.family)||null,rankedLalo:originalRanks.get(p.family)||null,
     features:feature,paths:p.pathCount,sources:p.sourceIds};
  }).sort((a,b)=>b.score-a.score||a.family.localeCompare(b.family));
  const winners=jur.map(j=>({jurisdiction:j,head:heads[turn]?.[j]||'----'}))
   .filter(x=>/^\d{4}$/.test(x.head))
   .map(x=>({...x,vt3:x.head.slice(-3),family:reversibleFamily(x.head.slice(-3))}));
  console.log('INSPECCION '+JSON.stringify({turn,winners,
    formasTop10:form.top.slice(0,10).map(x=>({rank:x.rank,family:x.family,value:x.value,source:x.source,shape:x.shape,events:x.support.events,days:x.support.days})),
    combinadoTop10:combined.top.map(x=>({rank:x.rank,family:x.family,frequency30:x.seenPreviously,paths:x.paths.length})),
    laloTop10:original.slice(0,10).map(x=>({rank:x.rank,family:x.family})),
    winningRanks:winners.map(w=>({...w,
      form:formRanks.get(w.family)||null,
      combinado:combined.top.find(x=>x.family===w.family)?.rank||null,
      combinadoAllRank:scores.findIndex(x=>x.family===w.family)+1||null,
      lalo:originalRanks.get(w.family)||null,
      details:scores.find(x=>x.family===w.family)||null
    })),
    top20Scores:scores.slice(0,20)
   }));
 }
}
run().catch(e=>{console.error('COTEJO_FALLO',e);process.exitCode=1});
