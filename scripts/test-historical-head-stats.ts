// Modelo estadístico aislado: cifras publicadas, sin dependencia de hoja +11.
import {strict as assert} from 'node:assert';
import {historicalHeadFrequency} from '../src/historicalHeadFrequency';
import type {HistoricHeadsDay} from '../src/historicalHeadFrequency';
const days:HistoricHeadsDay[]=[
 {date:'2026-11-10',heads:{Nocturno:{Ciudad:'1234',Provincia:'2234',Córdoba:'9999','Santa Fé':'7777','Entre Ríos':'5555',Montevideo:'1234'}}},
 {date:'2026-11-11',heads:{Nocturno:{Ciudad:'3234',Provincia:'5000',Córdoba:'0001','Santa Fé':'3333','Entre Ríos':'7777',Montevideo:'1234'}}},
 {date:'2026-11-12',heads:{Nocturno:{Ciudad:'1234',Provincia:'2234',Córdoba:'0001','Santa Fé':'7777','Entre Ríos':'3333',Montevideo:'1234'}}},
 {date:'2026-11-13',heads:{Nocturno:{Ciudad:'9999',Provincia:'9999',Córdoba:'9999','Santa Fé':'9999','Entre Ríos':'9999',Montevideo:'9999'}}}
];
const a=historicalHeadFrequency(days,'2026-11-13','Nocturno',2);
assert.equal(a.observations,15);
assert.equal(a.days,3);
assert.equal(a.top[0].value,'34');
assert.equal(a.top[0].count,5);
const b=historicalHeadFrequency(days,'2026-11-13','Nocturno',4);
assert.equal(b.top[0].value,'7777');
assert.equal(b.top[0].count,3);
assert.equal(historicalHeadFrequency(days,'2026-11-10','Nocturno',2).observations,0);
assert.equal(historicalHeadFrequency(days,'2026-11-14','Previa',2).observations,0);
assert.equal(historicalHeadFrequency(days,'2026-11-14','Nocturno',4).observations,20);
console.log('Frecuencia histórica por turno: OK (sin futuro, sin Montevideo, cifras exactas).');
