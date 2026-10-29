/** Pruebas aisladas del historial VT2: sin futura cabeza objetivo. */
import assert from 'node:assert/strict';
import {diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {reversibleFamily} from '../src/motorLalo';
import {buildVt2FamilyWitnesses} from '../src/vt2FamilyHistory';
import type {InfoVisualDay} from '../src/infoTurnHistory';

const family=reversibleFamily('45');
assert.equal(family,reversibleFamily('54'));
const noc=diaVacio();
noc.Nocturno.Ciudad='1234'; // +11 = 45, solo primera fila física.
const actual=diaVacio();
actual.Previa.Provincia='0045';
actual.Primera.Provincia='9945'; // Todavía NO se puede conocer en Primera PRE.
actual.Matutino.Provincia='7754'; // Misma familia reversible, distinto turno.
const sheet=buildSheet(actual,noc);
const historic=diaVacio();
historic.Matutino.Provincia='4455'; // No corresponde a la familia 45.
historic.Vespertino.Provincia='0045'; // Testigo histórico real.
const historicalSheet=buildSheet(historic,noc);
const visualDays:InfoVisualDay[]=[
 {date:'2026-10-22',heads:historic,sheet:historicalSheet},
 // Una jornada del futuro NO debe ser fuente aun si se incluye por error.
 {date:'2026-10-30',heads:historic,sheet:historicalSheet}
];
const preFirst=buildVt2FamilyWitnesses('2026-10-29','Primera',family,sheet,visualDays);
console.log('DEBUG_VT2_FAMILY',JSON.stringify({family,prevColumn:sheet.columns[0],prevMatches:sheet.matches.Previa,preFirst},null,2));
assert.ok(preFirst.some(x=>x.scope==='HOY'&&x.turn==='Previa'&&x.head==='0045'));
assert.ok(preFirst.some(x=>x.scope==='ANTERIOR'&&x.turn==='Vespertino'&&x.head==='0045'));
assert.ok(!preFirst.some(x=>x.scope==='HOY'&&x.turn==='Primera'));
assert.ok(!preFirst.some(x=>x.date>='2026-10-29'&&x.scope==='ANTERIOR'));
assert.ok(preFirst.every(x=>x.paths.length>0&&x.paths.every(p=>p.length===2)));
assert.ok(preFirst.every(x=>x.paths.every(p=>p.every(c=>x.values[c.row]?.[c.col]===c.digit))));
const prePrevia=buildVt2FamilyWitnesses('2026-10-29','Previa',family,sheet,visualDays);
assert.ok(!prePrevia.some(x=>x.scope==='HOY'));
const preNoct=buildVt2FamilyWitnesses('2026-10-29','Nocturno',family,sheet,visualDays);
assert.ok(preNoct.some(x=>x.scope==='HOY'&&x.turn==='Primera'&&x.head==='9945'));
assert.ok(!preNoct.some(x=>x.scope==='HOY'&&x.turn==='Nocturno'));
assert.ok(!buildVt2FamilyWitnesses('2026-10-29','Primera','00/00',sheet,visualDays)
 .some(x=>x.head==='0045'));
console.log('PASS: VT2 historial usa solo testigos anteriores, familias reversibles y rutas físicas reales.');
