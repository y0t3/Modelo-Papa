import {strict as assert} from 'node:assert';
import {diaVacio,TURNOS} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {emptyAuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {buildMotorLaloIntegral,buildAuxIndependent,
 extractIntegralAuxHistory} from '../src/motorLaloIntegral';

const historic=diaVacio(),yesterday=diaVacio(),current=diaVacio();
historic.Nocturno.Ciudad='2697';  // raíz VT3 697 posible en auxiliar
for(const jur of ['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'])
 yesterday.Nocturno[jur]='0099';
current.Primera.Ciudad='1111';
current.Vespertino.Ciudad='9999';
const raw=emptyAuxiliaryHeads();
raw.Previa.Santiago='8067';raw.Previa.Neuquen='0469';
raw.Primera.Santiago='6142';raw.Primera.Neuquen='0245';
raw.Matutino.Santiago='9634';raw.Matutino.Neuquen='0210';
const memories=extractIntegralAuxHistory('2026-10-19',raw,historic);
assert(memories.events[3].some(x=>x.head==='2697'));
assert(memories.events[3].every(x=>x.head.endsWith(x.head.slice(-3))));
assert(!memories.events[3].some(x=>x.turn==='Previa'),
 'no dibujar raíz auxiliar antes de que existan celdas');

const originalSheet=buildSheet(current,yesterday);
const historicSheet=buildSheet(historic,yesterday);
const history=[{date:'2026-10-19' as const,period:'D−1' as const,
 plus11:historicSheet,aux:memories}];
const beforePrev=buildMotorLaloIntegral('2026-10-20','Previa',
 preSheetAtCut(originalSheet,'Previa',0),raw,history);
assert(beforePrev.ranks[2].every(f=>f.auxRank===null));
assert.equal(buildAuxIndependent('2026-10-20','Previa',raw,history)[3].length,0);
const beforeNoct=buildMotorLaloIntegral('2026-10-20','Nocturno',
 preSheetAtCut(originalSheet,'Nocturno',4),raw,history);
assert(beforeNoct.ranks[3].some(x=>x.auxRank!==null),
 'fuente independiente crea familias de tres cifras');
assert(beforeNoct.ranks[2].some(x=>x.auxRank!==null),
 'VT2 no es secundario ni queda fuera del integral');
for(const n of [2,3,4] as const){
 for(const c of beforeNoct.ranks[n]){
  assert(c.values.every(x=>x.length===n));
  assert(c.rank>=1);
  if(c.laloRank!==null)assert(c.plus11Paths>0);
  if(c.auxRank!==null)assert(c.rootEvents>0);
  if(n===4){
   assert(c.mother);
   assert(beforeNoct.ranks[3].slice(0,10).some(m=>m.family===c.mother));
   for(const value of c.values)assert(c.family.split('/').includes(value));
  }
 }
}
assert.throws(()=>buildMotorLaloIntegral('2026-10-20','Nocturno',
 preSheetAtCut(originalSheet,'Nocturno',4),raw,
 [{...history[0],date:'2026-10-20'}]),/Fuga temporal/);
const altered=structuredClone(raw);
altered.Matutino.Santiago='9999';altered.Matutino.Neuquen='9999';
const beforePrimera=buildMotorLaloIntegral('2026-10-20','Primera',
 preSheetAtCut(originalSheet,'Primera',1),raw,history);
const beforePrimeraAltered=buildMotorLaloIntegral('2026-10-20','Primera',
 preSheetAtCut(originalSheet,'Primera',1),altered,history);
assert.deepEqual(beforePrimera.ranks,beforePrimeraAltered.ranks,
 'un sorteo futuro de Santiago no debe entrar a Primera');

const injected=diaVacio();
for(const t of TURNOS)injected[t]={...current[t]};
injected.Primera.Ciudad='0123';
injected.Vespertino.Ciudad='0012';
const changed=buildMotorLaloIntegral('2026-10-20','Primera',
 preSheetAtCut(buildSheet(injected,yesterday),'Primera',1),raw,history);
assert.deepEqual(beforePrimera.ranks,changed.ranks,
 'cabezas objetivo POST y futuras no cambian el PRE');
console.log('INTEGRAL_TEST_OK',JSON.stringify({
 checks:16,
 atPrevia:{auxCandidates:beforePrev.ranks[3].filter(f=>f.auxRank!==null).length},
 atNocturno:{
  vt2:beforeNoct.ranks[2].length,vt3:beforeNoct.ranks[3].length,
  vt4:beforeNoct.ranks[4].length,
  auxVt3:beforeNoct.ranks[3].filter(f=>f.auxRank!==null).length,
  top3:beforeNoct.ranks[3].slice(0,3).map(x=>({family:x.family,
   rankL:x.laloRank,rankA:x.auxRank,score:x.score}))
 }
}));
