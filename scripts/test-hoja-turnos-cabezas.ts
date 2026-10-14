import assert from 'node:assert/strict';
import {diaVacio,TURNOS} from '../src/domain';
import type {DailySheet,Match,Hit,SheetColumn} from '../src/sheet';
import type {Path} from '../src/paths';
import {buildDailyPanorama,dailyHeadOwnerId,routesForDailyTurn} from '../src/panoramaModel';

const ids:SheetColumn['id'][]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const full=['12','34','56','78','90','12'];
const path2:Path=[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'2'}];
const path3:Path=[...path2,{row:1,col:0,digit:'3'}];
const path4:Path=[...path3,{row:1,col:1,digit:'4'}];
const match=(turn:typeof TURNOS[number],jurisdiction:string,head:string,
 kind:Hit['kind'],path:Path):Match=>({
 turno:turn,jurisdiccion:jurisdiction,cabeza:head,
 hits:[{kind,value:path.map(c=>c.digit).join(''),sourceId:'prevNocturno',
  sourceTurn:'Nocturno anterior',paths:[path,[...path].reverse()]}]
});
const values=diaVacio();
values.Previa.Ciudad='9912';
values.Previa.Provincia='9123';
values.Primera['Córdoba']='1234';
values.Matutino.Ciudad='0000'; // Sin recorridos físicos: no debe saltar desde Cabezas.
const matches:DailySheet['matches']=Object.fromEntries(TURNOS.map(t=>[t,[]]));
matches.Previa=[
 match('Previa','Ciudad','9912','vt2',path2),
 match('Previa','Provincia','9123','vt3',path3),
];
matches.Primera=[match('Primera','Córdoba','1234','vt4',path4)];
const sheet:DailySheet={
 columns:ids.map((id,i)=>({id,turno:TURNOS[i],sourceLabel:id,values:i===0?full:Array(6).fill('--')})),
 matches,heads:Object.fromEntries(TURNOS.map(t=>[t,[]]))
};
const data=buildDailyPanorama(sheet,values);
assert.equal(data.groups.length,4,'Grupos de cabezas incluyendo no coincidentes');
const previa=routesForDailyTurn(data,'Previa');
const primera=routesForDailyTurn(data,'Primera');
const matutino=routesForDailyTurn(data,'Matutino');
assert.equal(previa.length,2,'Incluye las dos cabezas distintas del turno');
assert.equal(primera.length,1,'No arrastra marcas de Previa en el filtro Primera');
assert.equal(matutino.length,0,'La cabeza sin coincidencia no dibuja rutas');
assert.deepEqual(new Set(previa.map(x=>x.kind)),new Set(['vt2','vt3']));
assert.deepEqual(new Set(primera.map(x=>x.kind)),new Set(['vt4']));
assert.deepEqual(new Set(previa.map(x=>x.ownerId)),
 new Set([dailyHeadOwnerId('Previa','Ciudad','9912'),
  dailyHeadOwnerId('Previa','Provincia','9123')]));
const cityId=dailyHeadOwnerId('Previa','Ciudad','9912');
const city=data.groups.find(x=>x.id===cityId);
assert.equal(city?.routeCount,1,'Los recorridos de la cabeza se deduplican al invertir la ruta');
assert.equal(city?.turn,'Previa');
assert.equal(city?.label,'9912');
assert.equal(data.routes.filter(x=>x.ownerId===cityId).length,1);
assert.ok(data.routes.some(x=>x.ownerId!==cityId));
const provinceId=dailyHeadOwnerId('Previa','Provincia','9123');
assert.notEqual(cityId,provinceId,'Turno/jurisdicción/cabeza identifican la selección');
assert.equal(data.routes.length,3,'El filtrado visual no cambia el inventario original');
assert.equal(data.groups.find(g=>g.id===dailyHeadOwnerId('Matutino','Ciudad','0000'))?.routeCount,0,
 'La cabeza sin marca permanece visible y no debe navegar como coincidencia');
assert.equal(routesForDailyTurn(data,'Nocturno').length,0);
console.log('HOJA_TURNO_CABEZAS_OK: 3 modos, 2 cabezas agregadas, IDs exactos, inmutabilidad e inexistentes.');
