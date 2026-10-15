import assert from 'node:assert/strict';
import {diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo} from '../src/motorLalo';
import {buildTurnHistory,readableWeekday,visibleTurnRoutes} from '../src/infoTurnHistory';
import type {InfoVisualDay} from '../src/infoTurnHistory';

const before=diaVacio();
before.Nocturno.Ciudad='0000';   // +11 -> 11
before.Nocturno.Provincia='0001'; // +11 -> 12
const day=()=>{
 const heads=diaVacio();
 heads.Previa.Ciudad='0100';
 heads.Vespertino.Ciudad='0112'; // Coincide con 1-1-2 en nocturna anterior
 heads.Nocturno.Ciudad='1200';
 return heads;
};
const dates=['2026-10-14','2026-10-13','2026-10-12','2026-10-08'];
const visuals:InfoVisualDay[]=dates.map(date=>({date,heads:day(),sheet:buildSheet(day(),before)}));
const future=day();
future.Vespertino.Ciudad='9999';
const full=buildSheet(future,before);
const date='2026-10-15';
const view=buildMotorLalo(full,date,'Vespertino',[]);
const gallery=buildTurnHistory(date,'Vespertino',full,view,visuals);
assert.deepEqual(gallery.frames.map(f=>f.id),
 dates.map(d=>'dia-'+d).concat(['proximo']));
assert.deepEqual(gallery.frames.map(f=>f.title),[
 'Última jornada','Dos jornadas atrás','Tres jornadas atrás','Hace una semana',
 'Para el próximo Vespertino'
]);
assert.equal(readableWeekday('2026-10-08'),'Jueves 08/10');
assert.equal(readableWeekday('2026-10-14'),'Miércoles 14/10');
assert.ok(gallery.frames.slice(0,4).every(f=>
 f.kind==='historico'&&f.markedHeads>=1&&f.routes.every(r=>
 ['vt2','vt3','vt4'].includes(r.kind))));
assert.equal(gallery.frames[0].routes.length,visibleTurnRoutes(gallery.frames[0],'todos').length);
assert.ok(visibleTurnRoutes(gallery.frames[0],'vt3').every(r=>r.kind==='vt3'));
const coming=gallery.frames[4];
assert.equal(coming.kind,'proximo');
assert.deepEqual(coming.sheet.columns.map(c=>c.id),
 ['prevNocturno','Previa','Primera','Matutino']);
assert.deepEqual(coming.sheet.heads.Vespertino,[]);
assert.deepEqual(coming.sheet.matches.Vespertino,[]);
const changed=day();
changed.Vespertino.Ciudad='8888';
changed.Nocturno.Ciudad='4444';
const changedGallery=buildTurnHistory(date,'Vespertino',
 buildSheet(changed,before),view,visuals);
assert.deepEqual(changedGallery.frames.slice(0,4),gallery.frames.slice(0,4),
 'Los sorteos posteriores no deben alterar las cuatro hojas históricas');
assert.ok(!coming.sheet.columns.some(c=>c.id==='Vespertino'),
 'Nunca exponer la fuente que sólo existe después del objetivo');
assert.ok(!gallery.summary.includes('garantiza'));
const noDuplicates=buildTurnHistory(date,'Vespertino',full,view,[visuals[0],visuals[0]]);
assert.equal(noDuplicates.frames.filter(f=>f.kind==='historico').length,1);
console.log('OK: INFO por jornadas del mismo turno, fechas, filtros y sin resultados futuros');
