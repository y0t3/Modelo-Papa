import {strict as assert} from 'node:assert';
import {diaVacio} from '../src/domain';
import {emptyAuxiliaryHeads,auxiliaryBoard,findAuxPaths,auxCanonicalPath}
 from '../src/auxSantiagoNeuquen';
import {extractWinningMarks,projectAuxShape,replayMemory,randomizedRootShape}
 from '../src/auxWinningMemory';

const heads=emptyAuxiliaryHeads();
heads.Previa.Santiago='8067';
heads.Previa.Neuquen='0469';
heads.Primera.Santiago='6142';
heads.Primera.Neuquen='0245';
heads.Matutino.Santiago='9634';
heads.Matutino.Neuquen='0210';

const outcomes=diaVacio();
outcomes.Primera['Santa Fé']='8568'; // no VT3 568 en Previa aux
outcomes.Vespertino['Entre Ríos']='4066'; // sí 066 en Previa aux
outcomes.Nocturno.Ciudad='2697'; // sí 697 y cruza franjas
outcomes.Nocturno.Provincia='7310'; // sí 310 en Matutino
outcomes.Previa.Provincia='8067'; // no debe marcar antes de Previa auxiliar

const day=extractWinningMarks('2026-10-20',heads,outcomes);
const id=(head:string)=>day.marks.find(m=>m.head===head);
assert(!id('8568'),'La futura Primera no debe filtrarse en PRE Primera');
assert(!id('8067'),'No había auxiliar antes de Previa');
assert.equal(id('4066')?.family,'066/660');
assert.equal(id('2697')?.family,'697/796');
assert.equal(id('7310')?.family,'013/310');
const win=id('2697')!;
assert(win.paths.some(path=>new Set(path.map(x=>x.source)).size>1),
 'marca real 2697 cruza turnos');
assert(win.paths.every(path=>path.map(c=>c.digit).join('')==='697'),
 'sólo terminación exacta de cabeza realmente salida');
const pre=auxiliaryBoard(heads,'Previa');
const pri=auxiliaryBoard(heads,'Primera');
const ves=auxiliaryBoard(heads,'Vespertino');
assert.equal(projectAuxShape(pre,win.paths[0]).length,0,'no hay celdas en Previa');
assert(projectAuxShape(ves,win.paths[0]).every(path=>path.every(
(c,i)=>i===0||Math.max(Math.abs(c.row-path[i-1].row),
 Math.abs(c.col-path[i-1].col))===1)),'sin saltos');
const reference=[{day,period:'D−1' as const}];
const projected=replayMemory(ves,reference);
assert(projected.size>0,'raíces válidas generan familias PRE');
assert([...projected.values()].every(f=>f.rootIds.every(rootId=>
 day.marks.some(m=>m.id===rootId))),'solo eventos ganadores POST previos');
const control=randomizedRootShape(win,heads,0,2);
assert(!win.paths.map(auxCanonicalPath).includes(auxCanonicalPath(control)),
 'control no debe reciclar el mismo recorrido ganador');
assert(findAuxPaths(pri,'963').length===0,'Matutino no puede entrar a Primera');
console.log('AUX_MEMORIA_TEST_OK',JSON.stringify({
 marks:day.marks.map(m=>({head:m.head,paths:m.paths.length})),
 projectedFamilies:projected.size,checks:13
}));
