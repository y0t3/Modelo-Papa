import assert from 'node:assert/strict';
import {deriveFromMothers,vt2Hits,vt4Hits} from './lab-conectadas-derivaciones-vt2-vt4';
import {reversibleFamily} from '../src/motorLalo';
import type {SheetColumn} from '../src/sheet';
const cols:SheetColumn[]=[
 {id:'prevNocturno',turno:'Previa',sourceLabel:'Nocturna anterior',
  values:['23','20','63','00','00','00']}
];
const mother={family:reversibleFamily('226'),source:'prevNocturno' as const,
 cells:['0:0','1:0','2:0'],value:'226'};
const derived=deriveFromMothers([mother],cols);
assert.deepEqual(derived.vt2.map(f=>f.family),['22/22','26/62']);
const four=derived.vt4.find(x=>x.addedDigit==='3');
assert.ok(four,'Debe existir prefijo 3 con madres 226/622');
assert.equal(four.family,'3226/3622');
assert.ok(four.paths.some(x=>x.value==='3226'));
assert.ok(four.paths.some(x=>x.value==='3622'));
assert.ok(derived.vt4.every(x=>!x.paths.some(p=>p.value==='6223')));
assert.equal(vt4Hits(derived.vt4,['3226','3622','6223'],100),2);
assert.equal(vt2Hits(derived.vt2.map(x=>x.family),['0022','0126','0162','0211']),3);
assert.throws(()=>deriveFromMothers([{...mother,value:'999'}],cols),/madre/);
assert.deepEqual(deriveFromMothers([mother],[],10).vt4,[]);
console.log('OK: VT2 segmentos madre, VT4 prefijo físico y madre reversible, sin invertir cuaterna');
