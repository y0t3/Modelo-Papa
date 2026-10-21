/** Regresión del mapeo real de Santiago y Neuquén en Vivitusuerte. */
import {strict as assert} from 'node:assert';
import {parseAuxiliaryHeads} from '../src/auxSantiagoSource';
import {auxiliaryBoard,findAuxPaths} from '../src/auxSantiagoNeuquen';
const raw={datos:{
 '10':{momento_5:'8067',momento_1:'6142',momento_2:'9634'},
 '11':{momento_5:'0469',momento_1:'0245',momento_2:'0210'}
}};
const data=parseAuxiliaryHeads('2026-10-20',raw).heads;
assert.deepEqual(data,{
 Previa:{Santiago:'8067',Neuquen:'0469'},
 Primera:{Santiago:'6142',Neuquen:'0245'},
 Matutino:{Santiago:'9634',Neuquen:'0210'}
});
const previa=auxiliaryBoard(data,'Previa'),
 primera=auxiliaryBoard(data,'Primera'),
 matutina=auxiliaryBoard(data,'Matutino'),
 vespertina=auxiliaryBoard(data,'Vespertino'),
 nocturna=auxiliaryBoard(data,'Nocturno');
assert.equal(previa.cells.length,0);
assert.equal(primera.cells.length,8);
assert.equal(matutina.cells.length,16);
assert.equal(vespertina.cells.length,24);
assert.equal(nocturna.cells.length,24);
assert(primera.cells.every(c=>c.col<4),'Primera no puede usar cabezas de Primera');
assert(matutina.cells.filter(c=>c.col>=4&&c.col<8).some(c=>c.row===0&&c.digit==='6'),
 'Santiago Primera 6142 debe estar disponible antes de Matutino');
assert(vespertina.cells.filter(c=>c.row===0&&c.col>=8).map(c=>c.digit).join('')==='9634',
 'Santiago Matutino 9634 debe incorporarse tras ese sorteo');
const incomplete=parseAuxiliaryHeads('2026-10-20',{datos:{
 '10':{momento_5:'8067',momento_1:'----',momento_2:'9634'},
 '11':{momento_5:'0469',momento_1:'0245',momento_2:'0210'}
}}).heads;
assert.equal(incomplete.Primera.Santiago,'----','no inventar cabeza real faltante');
assert.equal(auxiliaryBoard(incomplete,'Vespertino').cells.length,20,
 'si falta una cabeza, mantener cuatro huecos en su sitio');
console.log('AUX_MAPEO_CORRECTO',JSON.stringify({
 verified:'20/10/2026 Vivitusuerte',heads:data,geometryCells:{
 Previa:previa.cells.length,Primera:primera.cells.length,
 Matutino:matutina.cells.length,Vespertino:vespertina.cells.length,
 Nocturno:nocturna.cells.length
 },checks:10}));
