import assert from 'node:assert/strict';
import {extractVt2EdgesFromVt3} from '../src/vt3EdgePreview';
import {evaluateRankPulses} from '../src/labPulsosPuestosVt3';
const board=['50','13','45','67','89','01'];
// 5 (0,0), 1 (1,0), 3 (1,1): valid physical path
const cells=[{row:0,col:0},{row:1,col:0},{row:1,col:1}];
const edges=extractVt2EdgesFromVt3(board,cells);
assert.deepEqual(edges.map(x=>x.reading),['13','15']);
assert.deepEqual(edges.map(x=>x.family),['13/31','15/51']);
assert.deepEqual(edges[0].cells,cells.slice(1));
assert.deepEqual(edges[1].cells,[cells[1],cells[0]]);
assert.deepEqual(extractVt2EdgesFromVt3(board,[
 {row:0,col:0},{row:1,col:0},{row:4,col:0}
]),[],'NUNCA saltar celdas');
const observations=[0,1,1,0,1,0,0].map((n,i)=>({
 date:'2026-10-'+String(i+12).padStart(2,'0'),
 turn:'Nocturno',rank:7,exposed:2,hits:n,
 mothers:['123/321'],families:['13/31','15/51']
}));
const pulse=evaluateRankPulses(observations,3,2);
assert.equal(pulse.eligible,4);
assert.equal(pulse.alerts,3);
assert.equal(pulse.alertedHits,1);
assert(pulse.slots['Nocturno|7']);
assert.throws(()=>evaluateRankPulses([...observations,observations[0]],3,2),
 /Duplicación/);
console.log('VT3_RANK_PULSE_AND_MINI_EDGES_TEST_OK');
