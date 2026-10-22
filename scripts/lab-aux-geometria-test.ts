import {strict as assert} from 'node:assert';
import {
 emptyAuxiliaryHeads,auxiliaryBoard,findAuxPaths,findAuxFamily,
 collectAuxFamilies,auxAdjacent,serializeAuxPath
} from '../src/auxSantiagoNeuquen';
function heads(){const h=emptyAuxiliaryHeads();
 h.Previa.Santiago='1234';h.Previa.Neuquen='6789';
 h.Primera.Santiago='5678';h.Primera.Neuquen='0123';
 h.Matutino.Santiago='9012';h.Matutino.Neuquen='4567';return h;
}
const h=heads();
const pre=auxiliaryBoard(h,'Previa');
assert.equal(pre.cells.length,24,'en Previa ya está la grilla completa de AYER');
const first=auxiliaryBoard(h,'Primera');
assert.equal(first.cells.length,24,'en Primera la grilla completa de AYER');
assert(findAuxPaths(first,'45').length>0,'Primera de AYER puede alimentar PRE');
const mat=auxiliaryBoard(h,'Matutino');
assert.equal(mat.cells.length,24);
const across=findAuxPaths(mat,'456');
assert(across.some(p=>p.map(c=>c.row+':'+c.col).join('>')==='0:3>0:4>0:5'),
 'camino horizontal cruza de Previa a Primera');
const diagonal=findAuxPaths(mat,'40');
assert(diagonal.some(p=>p.map(c=>c.row+':'+c.col).join('>')==='0:3>1:4'),
 'diagonal adyacente atraviesa límite de turnos');
const vesp=auxiliaryBoard(h,'Vespertino'),noct=auxiliaryBoard(h,'Nocturno');
assert.equal(vesp.cells.length,24);
assert.equal(noct.cells.length,24);
assert(findAuxPaths(vesp,'890').some(p=>p.map(c=>c.row+':'+c.col).join('>')==='0:7>0:8>0:9'));
assert(findAuxPaths(first,'567').some(p=>p.some(x=>x.col>=4)),
 'Se pueden recorrer todas las franjas de AYER desde la Previa');
assert.equal(auxAdjacent({row:0,col:3,digit:'4',source:'Previa'},
 {row:0,col:5,digit:'6',source:'Primera'}),false,'no salteos');
const missing=heads();missing.Primera.Santiago='----';
const withGap=auxiliaryBoard(missing,'Vespertino');
assert.equal(withGap.cells.length,20);
assert(!withGap.cells.some(c=>c.row===0&&c.col>=4&&c.col<=7));
assert(findAuxPaths(withGap,'90').some(p=>p.map(c=>c.row+':'+c.col).join('>')==='1:3>1:4'),
 'fila Neuquén permite continuidad real aunque Santiago no sorteó');
assert(!findAuxPaths(withGap,'45').some(p=>p.map(c=>c.row+':'+c.col).join('>')==='0:3>0:4'));
const f=findAuxFamily(mat,'456');
assert.equal(f.family,'456/654');
assert(f.crossTurnPaths>0);
const list=collectAuxFamilies(mat,3);
assert(list.some(f=>f.family==='456/654'&&f.crossTurnPaths>0));
const one=emptyAuxiliaryHeads();one.Previa.Santiago='1000';
const oneboard=auxiliaryBoard(one,'Primera');
assert.equal(findAuxPaths(oneboard,'111').length,0,'no reusar la única celda 1');
assert.equal(findAuxPaths(oneboard,'123').length,0,'no crear dígitos');
assert.deepEqual(serializeAuxPath(across[0]).value,'456');
console.log('AUX_GEOMETRIA_OK',JSON.stringify({pruebas:14,grid2x12:24,
 paths456:across.length,crossing456:f.crossTurnPaths,
 families3:list.length,missingCase:'Santiago Primera ausente conserva huecos reales'}));
