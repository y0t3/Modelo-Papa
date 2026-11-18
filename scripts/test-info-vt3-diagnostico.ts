import assert from 'node:assert/strict';
import {TURNOS,diaVacio} from '../src/domain';
import {auditVt3Family,normalizeVt3Query} from '../src/vt3Audit';
import type {DailySheet} from '../src/sheet';
import type {LaloView} from '../src/motorLalo';
const values=['12','34','56','78','10','12'];
const sheet:DailySheet={
 columns:[
  {id:'prevNocturno',turno:'Previa',sourceLabel:'Nocturna anterior',values},
  {id:'Previa',turno:'Primera',sourceLabel:'Previa',values:['--','--','--','--','--','--']},
  {id:'Primera',turno:'Matutino',sourceLabel:'Primera',values:['--','--','--','--','--','--']},
  {id:'Matutino',turno:'Vespertino',sourceLabel:'Matutino',values:['--','--','--','--','--','--']},
  {id:'Vespertino',turno:'Nocturno',sourceLabel:'Vespertino',values:['--','--','--','--','--','--']}
 ],heads:Object.fromEntries(TURNOS.map(turn=>[turn,[]])),
 matches:Object.fromEntries(TURNOS.map(turn=>[turn,[]]))
};
const view:LaloView={
 target:'Previa',date:'2026-11-18',status:'EXPERIMENTAL_SIN_VALIDACIÓN',
 roots:[],ranks:{vt2:[],vt3:[],vt4:[]}
};
assert.deepEqual(normalizeVt3Query('9123'),{requested:'9123',family:'123/321'});
assert.equal(normalizeVt3Query('123/456'),null);
const physically=auditVt3Family(sheet,view,'Previa','9123');
assert.ok(physically);
assert.equal(physically.family,'123/321');
assert.equal(physically.status,'FISICA_SIN_ANCLAJE');
assert.ok(physically.physicalRoutes>0);
assert.equal(physically.officialRank,null);
assert.equal(physically.independentRootEvents,0);
const impossible=auditVt3Family(sheet,view,'Previa','999');
assert.equal(impossible?.status,'SIN_FORMACION');
const withFuture:DailySheet=JSON.parse(JSON.stringify(sheet));
withFuture.columns[1].values=['99','99','99','99','99','99'];
withFuture.heads.Previa=['9123'];
withFuture.matches.Previa=[{turno:'Previa',jurisdiccion:'Ciudad',cabeza:'9123',hits:[]}];
assert.deepEqual(auditVt3Family(withFuture,view,'Previa','9123'),physically,
 'No debe cambiar el PRE al cargar resultados ni columnas posteriores');
assert.throws(()=>auditVt3Family(sheet,view,'Matutino','9123'),/turno/);
assert.equal(auditVt3Family(sheet,view,'Previa','12345'),null);
console.log('VT3_INFO_AUDITORIA_OK: físicas, raíces, sin formación, PRE aislado y status.');
