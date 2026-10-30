import assert from 'node:assert/strict';
import {auxiliaryBoard,emptyAuxiliaryHeads,auxFamily}
 from '../src/auxSantiagoNeuquen';
import {selectAuxFormFirst} from '../src/labAuxFormasPrimeroVT3';
import {selectAuxSupportPolicy} from '../src/labAuxRespaldosVT3';
import type {AuxiliaryHistorical} from '../src/motorLaloIntegral';
const a=emptyAuxiliaryHeads();
a.Previa={Santiago:'1234',Neuquen:'5678'};
a.Primera={Santiago:'1293',Neuquen:'4560'};
a.Matutino={Santiago:'7538',Neuquen:'9876'};
const board=auxiliaryBoard(a,'Nocturno');
const past=emptyAuxiliaryHeads();
past.Previa={Santiago:'1234',Neuquen:'5678'};
past.Primera={Santiago:'1293',Neuquen:'4560'};
past.Matutino={Santiago:'7538',Neuquen:'9876'};
const first=[board.cells.find(c=>c.col===1&&c.row===0)!,
 board.cells.find(c=>c.col===2&&c.row===0)!,
 board.cells.find(c=>c.col===3&&c.row===0)!];
const roots:AuxiliaryHistorical[]=[{
 date:'2026-10-28',period:'D−1',aux:{
 date:'2026-10-28',events:{2:[],4:[],3:[{
 id:'2026-10-28|Nocturno|Ciudad|1123|VT3',
 date:'2026-10-28',turn:'Nocturno',jur:'Ciudad',
 head:'1123',length:3,paths:[first]
 }]}}
}];
const one=selectAuxFormFirst(board,roots,'2026-10-29','AUX_AYER');
assert.equal(one.top.length,10);
assert.equal(new Set(one.top.map(x=>x.family)).size,10);
assert(one.top.every(x=>x.path.length===3));
assert(one.top.some(x=>x.rootEvents>=1));
assert(one.top.some(x=>x.exactEvents>=1));
const swapped=emptyAuxiliaryHeads();
swapped.Previa={Santiago:'7650',Neuquen:'0123'};
swapped.Primera={Santiago:'9781',Neuquen:'2345'};
swapped.Matutino={Santiago:'5432',Neuquen:'8967'};
const two=selectAuxFormFirst(auxiliaryBoard(swapped,'Nocturno'),
 roots,'2026-10-29','AUX_AYER');
assert.deepEqual(one.prioritySites,two.prioritySites,
 'La prioridad de sitios NO puede depender de las cifras del día');
const empty=selectAuxFormFirst(auxiliaryBoard(emptyAuxiliaryHeads(),'Previa'),
 [],'2026-10-29','AUX_HOY');
assert.equal(empty.top.length,0);
assert.throws(()=>selectAuxFormFirst(board,[
 {...roots[0],date:'2026-10-29'}], '2026-10-29','AUX_AYER'),/FUGA/);
const bad=one.top.find(x=>x.family!==auxFamily(x.value));
assert.equal(bad,undefined);

for(const policy of ['exact','shift'] as const){
 const q=selectAuxSupportPolicy(board,roots,'2026-10-29','AUX_AYER',10,policy);
 const r=selectAuxSupportPolicy(auxiliaryBoard(swapped,'Nocturno'),
  roots,'2026-10-29','AUX_AYER',10,policy);
 assert.equal(q.top.length,10);
 assert.equal(new Set(q.top.map(x=>x.family)).size,10);
 assert(q.top.every(x=>x.path.length===3));
 assert.deepEqual(q.prioritySites,r.prioritySites,'La seleccion de sitios debe anteceder los digitos');
 assert.throws(()=>selectAuxSupportPolicy(board,[{...roots[0],date:'2026-10-29'}],
  '2026-10-29','AUX_AYER',10,policy),/FUGA/);
}
console.log('AUX_RESPALDOS_POLICY_PRE_TEST_OK');
