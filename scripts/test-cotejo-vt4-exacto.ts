import assert from 'node:assert/strict';
import {compareMotorLaloAfterDraw,vt4PrefixFamily} from '../src/motorLalo';
import type {LaloView} from '../src/motorLalo';

// VT4: hija = cifra nueva + madre VT3. El POST sólo confirma valores
// exactos que dispongan de camino físico propio.
assert.deepEqual(vt4PrefixFamily('044/440','3'),['3044','3440']);
const view={
 ranks:{
  vt2:[{family:'47/74'}],
  vt3:[{family:'749/947'}],
  vt4:[{family:'2749/2947',paths:[{value:'2749'}]}]
 }
} as unknown as LaloView;
assert.deepEqual(compareMotorLaloAfterDraw(view,['2749']).vt4,['2749/2947'],
 'Acierto exacto 2+749 con testigo físico');
assert.deepEqual(compareMotorLaloAfterDraw(view,['9472']).vt4,[],
 'Agregar 2 a la derecha crea otra VT3 y nunca confirma a 2+749');
assert.deepEqual(compareMotorLaloAfterDraw(view,['9472']).vt3,[],
 'VT3 termina en 472, no 749');
assert.deepEqual(compareMotorLaloAfterDraw(view,['2947']).vt4,[],
 'La orientación alternativa exige su propio testigo físico');
const withSister={ranks:{vt2:[],vt3:[],vt4:[
 {family:'2749/2947',paths:[{value:'2749'},{value:'2947'}]}
]}} as unknown as LaloView;
assert.deepEqual(compareMotorLaloAfterDraw(withSister,['2947']).vt4,['2749/2947'],
 'Madre invertida válida sólo con su propia extensión física izquierda');
assert.deepEqual(compareMotorLaloAfterDraw(view,['0047']).vt2,['47/74'],
 'VT2 conserva reversibilidad');
assert.deepEqual(compareMotorLaloAfterDraw(view,['1749']).vt3,['749/947'],
 'VT3 conserva reversibilidad');
console.log('COTEJO_VT4_MADRE_FIJA_OK: familia prefijada y cotejo exacto propio.');
