/** Auditoría real 20/10: Lalo +11 vs Auxiliar RAW, sin mezcla de Tops. */
import {strict as assert} from 'node:assert';
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo} from '../src/motorLalo';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from '../src/motorLaloAuxiliar';
import {TURNOS,JURS} from '../src/domain';
import {comparePrediction} from '../src/predictionParallel';

async function main(){
 const date='2026-10-20',prior='2026-10-19',week='2026-10-13';
 const [today,previous,weekly,beforeLast,beforeWeek,auxToday,auxPrior,auxWeek]=await Promise.all([
  descargarCabezas(date,true),descargarCabezas(prior,true),descargarCabezas(week,true),
  descargarCabezas('2026-10-17',true),descargarCabezas('2026-10-12',true),
  fetchAuxiliaryHeads(date),fetchAuxiliaryHeads(prior),fetchAuxiliaryHeads(week)
 ]);
 const raw=auxToday.heads;
 assert.deepEqual(
  [raw.Previa.Santiago,raw.Primera.Santiago,raw.Matutino.Santiago,
   raw.Previa.Neuquen,raw.Primera.Neuquen,raw.Matutino.Neuquen],
  ['8067','6142','9634','0469','0245','0210'],
  'Datos Santiago-Neuquén tal como fueron verificados');
 const sheet=buildSheet(today,previous);
 const mvHistory=[
  {date:prior,period:'D−1' as const,sheet:buildSheet(previous,beforeLast)},
  {date:week,period:'D−7' as const,sheet:buildSheet(weekly,beforeWeek)}
 ];
 const auxHistory=[
  {date:prior,period:'D−1' as const,aux:extractAuxiliarHistory(prior,auxPrior.heads,previous)},
  {date:week,period:'D−7' as const,aux:extractAuxiliarHistory(week,auxWeek.heads,weekly)}
 ];
 const details:any[]=[];
 for(const target of TURNOS){
  const original=buildMotorLalo(sheet,date,target,mvHistory);
  const snapshot=JSON.stringify(original.ranks);
  const aux=buildMotorLaloAuxiliar(date,target,raw,auxHistory);
  assert.equal(JSON.stringify(original.ranks),snapshot,'No se alteran Tops MV1');
  if(target==='Previa')
   assert([2,3,4].every(n=>aux.ranks[n as 2|3|4].length===0));
  const heads=JURS.map(jur=>({jur,head:today[target]?.[jur]||''}));
  const report=comparePrediction(original,aux,heads,3);
  details.push({turn:target,
   modalities:report.map(s=>({kind:s.kind,
    shared:s.shared.map(x=>({family:x.family,lalo:x.lalo,auxiliar:x.auxiliar})),
    headsLalo:s.winning.filter(x=>x.lalo!==null).map(x=>x.head),
    headsAuxiliar:s.winning.filter(x=>x.auxiliar!==null).map(x=>x.head),
    headsAmbos:s.winning.filter(x=>x.lalo!==null&&x.auxiliar!==null).map(x=>x.head)
   }))
  });
  assert.equal(JSON.stringify(original.ranks),snapshot,
   'El comparador POST no modifica ni reordena MV1');
 }
 console.log('PREDICCION_AUX_20OCT_OK',JSON.stringify({date,details}));
}
void main().catch(error=>{console.error('PREDICCION_AUX_ERROR',error);process.exitCode=1});
