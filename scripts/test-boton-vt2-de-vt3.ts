import assert from 'node:assert/strict';
import type {LaloView,LaloFamily} from '../src/motorLalo';
import {topVt3AsVt2PRE,twoLastFromVt3Readings,
 evaluateTailPOST} from '../src/labVt3Terminations';

assert.deepEqual(twoLastFromVt3Readings(['513','351']),['13','51']);
assert.deepEqual(twoLastFromVt3Readings(['513','315']),['13','15']);
assert.deepEqual(twoLastFromVt3Readings(['412','214']),['12','14']);
assert.deepEqual(twoLastFromVt3Readings(['310','013']),['10','13']);
assert.deepEqual(twoLastFromVt3Readings(['001','100']),['01','00']);

const family=(kind:'vt2'|'vt3',name:string,rank:number)=>
 ({kind,family:name,rank,paths:[]} as LaloFamily);
const view={date:'2026-10-29',target:'Nocturno',
 ranks:{vt3:[family('vt3','315/513',1),
  family('vt3','214/412',2),
  family('vt3','013/310',3)],
 vt2:[family('vt2','13/31',10),family('vt2','15/51',6)],
 vt4:[]}
} as LaloView;
const pre=topVt3AsVt2PRE(view);
assert.equal(pre.rows.length,3,'Mismos puestos que en Top10 VT3');
assert.deepEqual(pre.rows.map(x=>x.rank),[1,2,3]);
assert.deepEqual(pre.rows.map(x=>x.tails),[
 ['15','13'],['14','12'],['13','10']
]);
assert.deepEqual(pre.vt2TopTails,['13','31','15','51']);
const heads=[
 {jur:'Santa Fe',head:'2813'},
 {jur:'Córdoba',head:'6906'},
 {jur:'Ciudad',head:'4715'},
 {jur:'Provincia',head:'1214'},
 {jur:'Entre Ríos',head:'9510'}
];
const post=evaluateTailPOST(pre,heads);
assert.equal(post.ranks[0].hitHeads,2,'#1 15 y 13');
assert.equal(post.ranks[1].hitHeads,1,'#2 14');
assert.equal(post.ranks[2].hitHeads,2,'#3 13 y 10');
assert.deepEqual(post.ranks[0].matched.map(x=>x.head),['2813','4715']);
assert.deepEqual(post.ranks[2].matched.map(x=>x.head),['2813','9510']);
assert.equal(post.vt3TailHitHeads,4,'Una cabeza presente en 2 puestos cuenta una sola vez en cobertura');
assert.equal(post.both,2,'Coincidencias también presentes en VT2 siguen contando para puesto VT3');
assert.equal(post.tailOnly,2);
assert.equal(evaluateTailPOST(pre,[]).ranks.every(x=>!x.hit),true,
 'No anticipar aciertos si el sorteo todavía no ocurrió');
console.log('BOTON_VT2_DE_VT3_TEST_OK');
