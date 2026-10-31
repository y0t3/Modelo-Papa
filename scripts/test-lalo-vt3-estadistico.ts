import assert from 'node:assert/strict';
import {reversibleFamily} from '../src/motorLalo';
import {diaVacio} from '../src/domain';
import {priorFrequencies,rankedByFrequency,neutralMatched,expectedUniform}
 from '../src/labLaloEstadisticoVT3';
import type {PhysicalAnatomy} from '../src/labLaloAnatomiaSinPuestoVT3';
const history=diaVacio();
history.Previa.Ciudad='1432'; // 432/234
history.Previa.Provincia='3555'; // 555/555
history.Previa.Córdoba='1432';
const day={date:'2026-10-30',heads:history};
const stats=priorFrequencies([day],'2026-10-31');
assert.equal(stats.n,3);
assert.equal(stats.counts.get(reversibleFamily('432')),2);
assert.equal(stats.counts.get(reversibleFamily('555')),1);
assert.throws(()=>priorFrequencies([day],'2026-10-30'),/FUGA/);
const mk=(i:number,members:1|2):PhysicalAnatomy=>{
 const a=String(i).padStart(3,'0');
 const family=members===1?reversibleFamily(String(i%10).repeat(3)):reversibleFamily(a);
 return {family,pathCount:1,sourceCount:1,shapes:1,
  frontier:'UNICA_COLUMNA',multiplicity:'UN_CAMINO',members,
  expectedHeadHitsPerJur:members/1000,sourceIds:['prevNocturno']};
};
const pool=[
 {family:reversibleFamily('432'),members:2},
 {family:reversibleFamily('555'),members:1},
 {family:reversibleFamily('123'),members:2},
 {family:reversibleFamily('131'),members:2},
 {family:reversibleFamily('456'),members:2},
 {family:reversibleFamily('987'),members:2},
 {family:reversibleFamily('222'),members:1},
 {family:reversibleFamily('111'),members:1},
 {family:reversibleFamily('333'),members:1},
 {family:reversibleFamily('777'),members:1}
].map(({family,members})=>({
 ...mk(0,members as 1|2),family,members:members as 1|2
}));
const ranked=rankedByFrequency(pool,stats);
assert.equal(ranked[0].family,reversibleFamily('432'));
assert.equal(new Set(ranked.map(x=>x.family)).size,10);
assert.equal(ranked.length,10);
const top=ranked.slice(0,7).map(x=>x.family);
const seeds=Array.from({length:20},(_,i)=>neutralMatched(pool,top,'seed'+i));
for(const pick of seeds){
 assert.equal(pick.length,top.length);
 assert.equal(new Set(pick).size,top.length);
 assert.equal(expectedUniform(pick,5),expectedUniform(top,5));
 assert(pick.every(f=>pool.some(x=>x.family===f)));
}
assert.equal(expectedUniform([reversibleFamily('555')],5),0.005);
assert.equal(expectedUniform([reversibleFamily('432')],5),0.01);
console.log('LALO_ESTADISTICO_VT3_TEST_OK');
