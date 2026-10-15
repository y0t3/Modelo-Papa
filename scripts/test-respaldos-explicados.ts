import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TURNOS} from '../src/domain';
import type {DailySheet,SheetColumn,Match} from '../src/sheet';
import type {Path} from '../src/paths';
import {buildMotorLalo} from '../src/motorLalo';
import {buildPredictivePanorama} from '../src/panoramaModel';
import {physicalSupportRelation} from '../src/physicalRelation';

const sources:SheetColumn['id'][]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
function makeSheet(values:string[],historical:boolean):DailySheet{
 const columns=sources.map((id,i)=>({
  id,turno:TURNOS[i],
  sourceLabel:id==='prevNocturno'?'Nocturna anterior':id,
  values:i?['--','--','--','--','--','--']:values
 }));
 const path:Path=[
  {row:2,col:1,digit:'0'},
  {row:3,col:0,digit:'3'},
  {row:4,col:1,digit:'3'}
 ];
 const matched:Match={turno:'Nocturno',jurisdiccion:'Córdoba',cabeza:'2033',
  hits:[{kind:'vt3',value:'033',sourceId:'prevNocturno',
   sourceTurn:'Nocturna anterior',paths:[path]}]};
 return {columns,
  matches:Object.fromEntries(TURNOS.map(t=>[t,t==='Nocturno'&&historical?[matched]:[]])),
  heads:Object.fromEntries(TURNOS.map(t=>[t,[]]))};
}
const old=makeSheet(['83','45','40','36','03','28'],true);
const current=makeSheet(['67','20','44','04','33','79'],false);
const historical=[{date:'2026-10-14',period:'D−1' as const,sheet:old}];
const motor=buildMotorLalo(current,'2026-10-15','Previa',historical);
const family=motor.ranks.vt3.find(f=>f.family==='044/440');
assert.ok(family,'La terna 044/440 debe surgir de este antecedente');
const direct=family.paths.find(r=>r.origin==='TRASLADO'&&
 r.path.map(c=>c.row+':'+c.col).join('>')==='1:1>2:0>3:1');
assert.ok(direct,'033 llega como 044 mediante la misma geometría trasladada una fila');
const other=family.paths.find(r=>r.origin==='BIFURCACIÓN'&&
 ['1:1','2:0','2:1'].every(c=>r.path.some(p=>p.row+':'+p.col===c)));
assert.ok(other,'Un segundo recorrido gira sobre las dos casillas compartidas');
const root=motor.roots.find(r=>r.head==='2033'&&r.oldTurn==='Nocturno');
assert.ok(root);
assert.ok(other.rootIds.includes(root.id));
const d=physicalSupportRelation(direct,root,family.paths);
const b=physicalSupportRelation(other,root,family.paths);
assert.equal(d.type,'misma-forma');
assert.match(d.explanation,/una fila hacia arriba/);
assert.equal(b.type,'bifurcacion');
assert.equal(b.bridgeValue,'044');
assert.deepEqual(b.bridgeCells?.map(p=>p.row+':'+p.col),['1:1','2:0','3:1']);
assert.match(b.explanation,/una fila hacia arriba/);
assert.match(b.explanation,/cambia la tercera/);
assert.match(b.explanation,/4D por 3D/);
const panorama=buildPredictivePanorama(motor,historical);
const displayed=panorama.routes.find(r=>r.ownerId==='vt3|044/440'&&
 ['1:1','2:0','2:1'].every(c=>r.cells.some(p=>p.row+':'+p.col===c)));
assert.ok(displayed);
const oldShown=displayed.antecedents?.find(a=>a.head==='2033');
assert.ok(oldShown);
assert.equal(oldShown.reading,'033');
assert.equal(oldShown.relation?.type,'bifurcacion');
assert.equal(oldShown.relation?.bridgeValue,'044');
assert.ok(!oldShown.relation?.explanation.includes('misma forma exacta. Las cifras'),
 'La bifurcación no puede presentarse como traslación directa');
const noVisual=buildPredictivePanorama(motor);
assert.deepEqual(noVisual.groups,panorama.groups);
assert.deepEqual(noVisual.routes.map(r=>r.cells),panorama.routes.map(r=>r.cells),
 'La explicación visual no cambia la selección ni las celdas del motor');
const ui=readFileSync('src/ui/MiniRoutePreview.tsx','utf8');
assert.ok(ui.includes('readableWeekday'));
assert.ok(ui.includes('Paso intermedio en la hoja actual'));
assert.ok(!ui.includes('route.headSources.slice(0,3)'),
 'No mostrar nuevamente D−1 en texto técnico');
assert.ok(ui.includes('Nocturna anterior'));
console.log('RESPALDO_033_OK: 033 → 044 trasladado una fila → bifurcación 440/044; texto y prueba visual sin alterar el motor');
