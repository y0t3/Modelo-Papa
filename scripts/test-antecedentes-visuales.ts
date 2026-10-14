import assert from 'node:assert/strict';
import {TURNOS} from '../src/domain';
import type {DailySheet,SheetColumn,Match} from '../src/sheet';
import type {Path} from '../src/paths';
import {buildMotorLalo} from '../src/motorLalo';
import {buildPredictivePanorama,visualAntecedent,routeCellText} from '../src/panoramaModel';

const sources:SheetColumn['id'][]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const blank=['--','--','--','--','--','--'];
const currentValues=['76','48','93','21','34','56'];
const oldValues=['58','16','79','02','23','14'];
const oldPath:Path=[
 {row:0,col:0,digit:'5'},{row:1,col:0,digit:'1'},{row:2,col:0,digit:'7'}
];
const matched=(head:string,jurisdiction:string):Match=>({
 turno:'Previa',jurisdiccion:jurisdiction,cabeza:head,
 hits:[{kind:'vt3',value:'517',sourceId:'prevNocturno',
  sourceTurn:'Nocturno anterior',paths:[oldPath,[...oldPath].reverse()]}]
});
function makeSheet(values:string[],targetHeads:string[],historical=false):DailySheet{
 return {
  columns:sources.map((id,i)=>({id,turno:TURNOS[i],sourceLabel:id==='prevNocturno'?'Nocturna anterior':id,
   values:i===0?values:blank})),
  heads:Object.fromEntries(TURNOS.map(t=>[t,t==='Primera'?targetHeads:[]])),
  matches:Object.fromEntries(TURNOS.map(t=>[t,t==='Previa'&&historical?[
   matched('2517','Ciudad'),matched('9517','Provincia')
  ]:[]]))
 };
}
const old=makeSheet(oldValues,[],true);
const current=makeSheet(currentValues,['7492']);
const historical=[{date:'2026-10-05',period:'D−7' as const,sheet:old}];
const today='2026-10-12',target='Primera' as const;
const motor=buildMotorLalo(current,today,target,historical);
const withVisual=buildPredictivePanorama(motor,historical);
const withoutVisual=buildPredictivePanorama(motor);
assert.deepEqual(withVisual.groups,withoutVisual.groups,
 'Los Tops y familias permanecen iguales con o sin historial visual');
assert.deepEqual(withVisual.routes.map(r=>r.cells),
 withoutVisual.routes.map(r=>r.cells),'Los recorridos actuales no cambian');
assert.ok(motor.ranks.vt3.some(f=>f.family==='749/947'));
const mother=withVisual.routes.filter(x=>x.ownerId==='vt3|749/947');
assert.ok(mother.length>0,'Debe haber VT3 trasladadas por la raíz válida');
const byRoute=mother.filter(x=>(x.antecedents||[]).length>=2);
assert.ok(byRoute.length>0,'Ambas cabezas históricas deben respaldar la misma ruta física');
for(const a of byRoute[0].antecedents||[]){
 assert.equal(a.date,'2026-10-05');
 assert.equal(a.period,'D−7');
 assert.equal(a.turn,'Previa');
 assert.equal(a.sourceId,'prevNocturno');
 assert.deepEqual(a.values,oldValues,'Las cifras vienen exclusivamente de la hoja histórica');
 assert.deepEqual(a.cells,[{row:0,col:0},{row:1,col:0},{row:2,col:0}]);
 assert.equal(a.reading,'517');
 assert.equal(routeCellText(a.cells),'1I → 2I → 3I');
 assert.ok(['2517','9517'].includes(a.head));
 assert.notEqual(a.reading,'749','La columna anterior no puede dibujarse con cifras actuales');
}
assert.equal(new Set(byRoute[0].antecedents?.map(x=>x.id)).size,2,
 'Múltiples dibujos inversos del mismo evento no duplican antecedentes');
const validRoot=motor.roots.find(x=>x.oldCells.length===3);
assert.ok(validRoot);
assert.equal(visualAntecedent(validRoot,[]),null,'Sin hoja histórica, no inventar miniatura');
assert.equal(visualAntecedent({...validRoot,oldCells:['0:0','2:0','3:0']},historical),null,
 'Nunca dibujar saltos físicos en el antecedente');
assert.equal(visualAntecedent({...validRoot,head:'9999'},historical),null,
 'El recorrido antiguo debe formar la terminación de esa cabeza histórica');
const another=makeSheet(currentValues,['0000']);
assert.deepEqual(buildPredictivePanorama(buildMotorLalo(another,today,target,historical),historical),
 withVisual,'Cambiar una cabeza objetivo ya sorteada no altera el PRE ni sus respaldos visuales');
console.log('RESPALDO_VISUAL_OK: dos raíces reales, fuente histórica exacta, orden de celdas, PRE sin fugas y Tops intactos.');
