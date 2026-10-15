import assert from 'node:assert/strict';
import {compareMotorLaloAfterDraw} from '../src/motorLalo';
import type {LaloView} from '../src/motorLalo';

// El motor ya seleccionó las hijas que disponen de TESTIGO VT4 real.
// El POST debe cotejar los valores de esos testigos, no invertir 4 cifras.
const view={
 ranks:{
  vt2:[{family:'47/74'}],
  vt3:[{family:'749/947'}],
  vt4:[{family:'7492/9472',paths:[{value:'7492'}]}]
 }
} as unknown as LaloView;
const literal=compareMotorLaloAfterDraw(view,['7492']);
assert.deepEqual(literal.vt4,['7492/9472'],'Acierto exacto comprobado por testigo físico');
assert.deepEqual(literal.vt3,[],'La cabeza 7492 termina 492, no 749');
const reversed=compareMotorLaloAfterDraw(view,['2947']);
assert.deepEqual(reversed.vt4,[],'Invertir toda la cuaterna no genera acierto');
const sister=compareMotorLaloAfterDraw(view,['9472']);
assert.deepEqual(sister.vt4,[],'La hermana sin testigo propio no hereda el acierto');
const withSister={ranks:{vt2:[],vt3:[],vt4:[
 {family:'7492/9472',paths:[{value:'7492'},{value:'9472'}]}
]}} as unknown as LaloView;
assert.deepEqual(compareMotorLaloAfterDraw(withSister,['9472']).vt4,['7492/9472'],
 'Hermana válida sólo con su propio recorrido físico');
assert.deepEqual(compareMotorLaloAfterDraw(view,['0047']).vt2,['47/74'],
 'El cotejo VT2 reversible permanece idéntico');
assert.deepEqual(compareMotorLaloAfterDraw(view,['1749']).vt3,['749/947'],
 'El cotejo VT3 reversible permanece idéntico');
console.log('COTEJO_VT4_MADRE_FIJA_OK: valor testigo exacto sin inversas inventadas.');
