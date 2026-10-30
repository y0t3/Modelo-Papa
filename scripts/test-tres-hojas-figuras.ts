import assert from 'node:assert/strict';
import type {ShapeRoute} from '../src/labRadarFiguras';
import {evaluateParallelPOST,validatePRE,physicalExtensions,sharedFamilies} from '../src/labTresHojasFiguras';
const date='2026-10-29',turn='Nocturno';
const route=(board:ShapeRoute['board'],engine:ShapeRoute['engine'],
 kind:ShapeRoute['kind'],rank:number,reading:string,cells:{row:number;col:number}[]):ShapeRoute=>({
 date,turn,board,engine,kind,rank,reading,
 family:reading.split('').reverse().join('')<reading?
 reading.split('').reverse().join('')+'/'+reading:
 reading+'/'+reading.split('').reverse().join(''),
 source:board==='PLUS11'?'Vespertino':'AUX_GRID',cells
});
const two=[{row:0,col:0},{row:0,col:1}];
const input=[
 route('PLUS11','LALO','VT2',7,'13',two),
 route('PLUS11','GEOMETRIA','VT2',1,'13',two),
 route('AUX_AYER','AUX_AYER','VT2',4,'13',[{row:0,col:1},{row:1,col:1}]),
 route('AUX_AYER','AUX_AYER','VT3',3,'813',
  [{row:0,col:2},{row:0,col:1},{row:1,col:1}]),
 route('AUX_HOY','AUX_HOY','VT3',9,'813',
  [{row:1,col:5},{row:1,col:6},{row:1,col:7}]),
 route('PLUS11','FORMAS_PRIMERO','VT3',5,'513',
  [{row:3,col:0},{row:3,col:1},{row:4,col:0}])
];
const result=evaluateParallelPOST({date,turn,routes:input},[{jur:'Santa Fe',head:'2813'}]);
assert.equal(result.byKind.VT2.headHitsTwoBoards,1);
assert.equal(result.byKind.VT2.headHitsThreeBoards,0);
assert.equal(result.byKind.VT3.headHitsTwoBoards,1);
assert.equal(result.byKind.VT3.headHitsZeroBoards,0);
assert.equal(result.byKind.VT2.selectedFigures.PLUS11,1,
 'Misma ruta de dos motores en +11 es UNA figura física');
assert.equal(result.byKind.VT3.headHitsByBoard.PLUS11,0,
 'No transformar 513 elegido en 813 ganador');
assert.equal(result.hits.find(x=>x.kind==='VT3')!.actualRouteBoards.length,2);
assert(physicalExtensions(validatePRE({date,turn,routes:input})).some(x=>
 x.mother==='13/31'&&x.child==='318/813'&&x.boardVT2==='PLUS11'&&x.boardVT3==='AUX_AYER'));
assert.equal(sharedFamilies(validatePRE({date,turn,routes:input}),'VT2').length,1);
assert.throws(()=>validatePRE({date,turn,routes:[{...input[0],cells:[{row:0,col:0},{row:4,col:0}]}]}),
 /salto físico/);
assert.throws(()=>validatePRE({date,turn,routes:[{...input[0],reading:'93'}]}),
 /Familia no corresponde/);
console.log('TRES_HOJAS_FIGURAS_TEST_OK');
