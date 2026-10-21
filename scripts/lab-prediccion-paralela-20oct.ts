import {strict as assert} from 'node:assert';
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo} from '../src/motorLalo';
import {buildMotorLaloIntegral,extractIntegralAuxHistory} from '../src/motorLaloIntegral';
import {TURNOS,JURS} from '../src/domain';
import {comparePrediction} from '../src/predictionParallel';

async function main(){
 const day='2026-10-20',previous='2026-10-19',week='2026-10-13';
 const [heads,last,weekHeads,beforeLast,beforeWeek,nowAux,lastAux,weekAux]=await Promise.all([
  descargarCabezas(day,true),descargarCabezas(previous,true),
  descargarCabezas(week,true),descargarCabezas('2026-10-17',true),
  descargarCabezas('2026-10-12',true),fetchAuxiliaryHeads(day),
  fetchAuxiliaryHeads(previous),fetchAuxiliaryHeads(week)
 ]);
 const source=nowAux.heads;
 assert.equal(source.Previa.Santiago,'8067');
 assert.equal(source.Primera.Santiago,'6142');
 assert.equal(source.Matutino.Santiago,'9634');
 assert.equal(source.Previa.Neuquen,'0469');
 assert.equal(source.Primera.Neuquen,'0245');
 assert.equal(source.Matutino.Neuquen,'0210');
 // 17/10 es sábado, único Nocturno; 19/10 toma esa base en +11.
 const current=buildSheet(heads,last);
 const historic=[
  {date:previous,period:'D−1' as const,sheet:buildSheet(last,beforeLast)},
  {date:week,period:'D−7' as const,sheet:buildSheet(weekHeads,beforeWeek)}
 ];
 const integralHistory=[
  {date:previous,period:'D−1' as const,plus11:historic[0].sheet,
   aux:extractIntegralAuxHistory(previous,lastAux.heads,last)},
  {date:week,period:'D−7' as const,plus11:historic[1].sheet,
   aux:extractIntegralAuxHistory(week,weekAux.heads,weekHeads)}
 ];
 const cases:any[]=[];
 for(const turn of TURNOS){
  const pure=buildMotorLalo(current,day,turn,historic);
  const mixed=buildMotorLaloIntegral(day,turn,
   preSheetAtCut(current,turn,TURNOS.indexOf(turn)),source,integralHistory);
  assert.deepEqual(mixed.baseline.ranks,pure.ranks,
   'MV1 no debe cambiar al encender el Integral');
  const actual=JURS.map(jur=>({jur,head:heads[turn]?.[jur]||''}));
  const comparison=comparePrediction(pure,mixed,actual,3);
  if(turn==='Previa')assert(mixed.ranks[3].every(x=>x.auxRank===null));
  cases.push({turn,headCount:actual.filter(x=>/^\d{4}$/.test(x.head)).length,
   counts:comparison.map(r=>({kind:r.kind,
    shared:r.shared.map(x=>x.family),
    postBoth:r.winning.filter(x=>x.lalo&&x.integral).map(x=>x.head),
    postLalo:r.winning.filter(x=>x.lalo&&!x.integral).map(x=>x.head),
    postIntegral:r.winning.filter(x=>!x.lalo&&x.integral).map(x=>x.head)
   }))});
 }
 console.log('PREDICCION_APP_20OCT_OK',JSON.stringify({date:day,
  independentMain:true,rendered:cases,
  note:'POST comprobado después de generar PRE para cada turno; no se modificó MV1.'
 }));
}
void main().catch(x=>{console.error('PREDICCION_APP_ERROR',x);process.exitCode=1});
