import assert from 'node:assert/strict';
import {diaVacio,mas11} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {previousDrawDay} from '../src/dates';
import {hasDrawResults,hasNocturnoBase,loadPreviousDraws} from '../src/drawHistory';
import {buildSheet} from '../src/sheet';
import {montevideoProgramado} from '../src/laloJurisdicciones';

// Casos históricamente contrastados con la DNLQ oficial de Uruguay:
// 20/06/2026: sábado con SOLO Nocturno de Montevideo 963 (0963).
// 09/07/2026: jueves con Vespertina 449 y Nocturno 802 (0802).
// No afirmar que hubo un sorteo en una jurisdicción argentina si no está
// corroborado; una jornada puede aportar una o dos cabezas válidas solamente.
const onlyMontevideo=(night:string,afternoon?:string):CabezasDia=>{
 const a=diaVacio();
 a.Nocturno.Montevideo=night;
 if(afternoon)a.Matutino.Montevideo=afternoon;
 return a;
};
const saturday=onlyMontevideo('0963');
const holiday=onlyMontevideo('0802','0449');
assert.equal(hasDrawResults(saturday),true);
assert.equal(hasNocturnoBase(saturday),true,
 'La Nocturna uruguaya legítima SÍ sirve para la columna +11 del siguiente día.');
assert.equal(hasDrawResults(holiday),true);
assert.equal(hasNocturnoBase(holiday),true);
assert.equal(mas11('0963'),'74');
assert.equal(mas11('0802'),'13');
assert.equal(montevideoProgramado('2026-06-20','Matutino'),false);
assert.equal(montevideoProgramado('2026-06-20','Nocturno'),true);
assert.equal(montevideoProgramado('2026-07-09','Matutino'),true);
assert.equal(montevideoProgramado('2026-07-09','Nocturno'),true);
assert.equal(previousDrawDay('2026-06-22'),'2026-06-20');
assert.equal(previousDrawDay('2026-07-10'),'2026-07-09');
const sources=new Map<string,CabezasDia>([
 ['2026-06-20',saturday],['2026-07-09',holiday],
 ['2026-06-19',diaVacio()],['2026-07-08',diaVacio()]
]);
const fetchFixture=async(date:string)=>sources.get(date)||diaVacio();
async function run(){
 const june=await loadPreviousDraws('2026-06-22',1,fetchFixture);
 const july=await loadPreviousDraws('2026-07-10',1,fetchFixture);
 assert.deepEqual(june.map(x=>x.date),['2026-06-20']);
 assert.deepEqual(july.map(x=>x.date),['2026-07-09']);
 const mondaySheet=buildSheet(diaVacio(),june[0].heads);
 const fridaySheet=buildSheet(diaVacio(),july[0].heads);
 assert.deepEqual(mondaySheet.columns[0].values,
  ['--','--','--','--','--','74'],
  'Junio 22 debe heredar la Nocturna REAL de sábado 20, no de viernes 19.');
 assert.deepEqual(fridaySheet.columns[0].values,
  ['--','--','--','--','--','13'],
  'Julio 10 debe heredar la Nocturna REAL de jueves 9, no de miércoles 8.');
 assert.equal(fridaySheet.columns[1].values.every(x=>x==='--'),true,
  'No inventar sorteos en otras fuentes del día objetivo.');
 assert.equal(mas11('0387'),'98','Últimas dos cifras y ceros iniciales');
 assert.equal(mas11('0000'),'11');
 console.log('HISTORICO_JORNADA_PARCIAL_OK: Uruguay 20/06 y 09/07 conservado; +11 sin cabezas inventadas');
}
run().catch(e=>{console.error(e);process.exitCode=1});
