import assert from 'node:assert/strict';
import {emptyAuxiliaryHeads,auxiliaryBoard,findAuxPaths} from '../src/auxSantiagoNeuquen';
import {figuresInTop} from '../src/labRadarFiguras';
import {allowedVT3,buildExtensionSnapshot,evaluateSnapshotPOST,
 equalBudgetComparison,mothersFromTop} from '../src/labExtensionesAux';

const date='2026-10-29',turn='Nocturno';
const ayer=emptyAuxiliaryHeads(),hoy=emptyAuxiliaryHeads();
ayer.Previa.Santiago='8135';
ayer.Previa.Neuquen='5134';
hoy.Previa.Santiago='8130';
hoy.Previa.Neuquen='0000';
const boardA=auxiliaryBoard(ayer,turn),boardH=auxiliaryBoard(hoy,turn);
assert(findAuxPaths(boardA,'813').length>0);
assert(findAuxPaths(boardH,'813').length>0);
assert(findAuxPaths(boardA,'513').length>0);
assert.equal(findAuxPaths(boardH,'513').length,0);
assert.equal(allowedVT3('13/31').length,20);

const figures=figuresInTop([{
 date,turn,board:'PLUS11',engine:'LALO',kind:'VT2',
 source:'Vespertino',rank:7,family:'13/31',reading:'13',
 cells:[{row:0,col:0},{row:0,col:1}]
},{
 date,turn,board:'PLUS11',engine:'GEOMETRIA',kind:'VT2',
 source:'Vespertino',rank:1,family:'13/31',reading:'13',
 cells:[{row:0,col:0},{row:0,col:1}]
},{
 date,turn,board:'PLUS11',engine:'FORMAS_PRIMERO',kind:'VT3',
 source:'Vespertino',rank:5,family:'315/513',reading:'513',
 cells:[{row:3,col:0},{row:3,col:1},{row:4,col:0}]
}]);
const mothers=mothersFromTop(figures);
assert.equal(mothers.length,1);
assert.deepEqual(mothers[0].engines.sort(),['GEOMETRIA','LALO'].sort());
const snapshot=buildExtensionSnapshot(date,turn,mothers,boardA,boardH,figures);
const options=snapshot.mothers[0].options;
const eight=options.find(x=>x.value==='813')!;
const five=options.find(x=>x.value==='513')!;
assert.equal(eight.status,'AMBAS');
assert.equal(five.status,'SOLO_AYER');
assert(eight.exampleAyer&&eight.exampleHoy);
assert.equal(eight.rankVT3Ayer,null,'813 fisicamente presente SIN entrar TOP AUX');
assert.equal(eight.rankVT3Hoy,null);
assert.equal(five.rankVT3Hoy,null);
assert.equal(options.length,20);
assert.equal(options.reduce((s,x)=>s+x.status.includes('SOLO')*1,0)>0,true);
const actual=evaluateSnapshotPOST(snapshot,[{jur:'Santa Fe',head:'2813'}]);
assert.equal(actual.motherHeads,1);
assert.equal(actual.winnerReadings.AMBAS,1);
assert.equal(actual.winnerReadings.SOLO_AYER,0);
assert(Math.abs(Object.values(actual.conditionalExpected).reduce((s,x)=>s+x,0)-1)<1e-9);
const budget=equalBudgetComparison(snapshot,[{jur:'Santa Fe',head:'2813'}]);
assert.equal(budget.pairs,1);
assert(budget.rows[0].both);
assert(budget.rows[0].single);
assert.throws(()=>allowedVT3('99/31'),/Familia VT2 inválida/);
console.log('EXTENSIONES_AUX_FUERA_TOP_TEST_OK');
