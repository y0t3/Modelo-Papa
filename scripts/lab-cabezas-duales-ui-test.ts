import {strict as assert} from 'node:assert';
import {diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {emptyAuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {buildHeadHighlights} from '../src/headHighlights';
import {dailyHeadOwnerId} from '../src/panoramaModel';
import {hitsForFamily} from '../src/predictionParallel';
import type {RankedFamily} from '../src/predictionParallel';

// Caso sintético equivalente a Córdoba Matutina 5440: sólo AUX, sin +11.
const aux=emptyAuxiliaryHeads();
aux.Previa.Santiago='5440';
aux.Previa.Neuquen='1234';
const yesterday=diaVacio();
yesterday.Nocturno.Ciudad='0000'; // +11 contiene 11, no 5440.
const today=diaVacio();
today.Previa.Provincia='5440'; // El turno todavía no tiene cifras AUX.
today.Matutino['Córdoba']='5440'; // AUX Previa publicada antes de Matutino.
today.Primera.Ciudad='3311'; // Ejemplo con coincidencia exclusiva del +11.
today.Matutino.Provincia='9999'; // Sin formación en las dos hojas.
const sheet=buildSheet(today,yesterday);
const highlights=buildHeadHighlights(today,sheet,aux);
const get=(turn:'Previa'|'Primera'|'Matutino',jur:string,head:string)=>
 highlights[dailyHeadOwnerId(turn,jur,head)];
assert.deepEqual(get('Matutino','Córdoba','5440').plusKinds,[]);
assert(get('Matutino','Córdoba','5440').auxKinds.includes('vt4'));
assert(get('Matutino','Córdoba','5440').kinds.includes('vt2'));
assert.equal(get('Previa','Provincia','5440').kinds.length,0,
 'No revelar la Previa AUX antes del sorteo Previa');
assert(get('Primera','Ciudad','3311').plusKinds.includes('vt2'));
assert.equal(get('Primera','Ciudad','3311').auxKinds.length,0);
assert.equal(get('Matutino','Provincia','9999').kinds.length,0);
assert.equal(buildHeadHighlights(today,sheet,null)
 [dailyHeadOwnerId('Matutino','Córdoba','5440')].kinds.length,0,
 'Ausencia de AUX no inventa coincidencias');
const both=diaVacio();
both.Matutino.Ciudad='5440';
const prior=diaVacio();
prior.Nocturno.Ciudad='5429'; // +11 = 40, testigo VT2 de 5440.
const dual=buildHeadHighlights(both,buildSheet(both,prior),aux);
const c=dual[dailyHeadOwnerId('Matutino','Ciudad','5440')];
assert(c.plusKinds.includes('vt2')&&c.auxKinds.includes('vt4'),
 'Un mismo evento integra modalidades de ambas hojas');
// Una familia compartida entre motores no es necesariamente un acierto POST.
const family:RankedFamily={kind:'vt2',family:'79/97',key:'79/97',
 rank:10,values:['79','97'],source:'AUX',details:[],canFocusPlus:false};
const otherTop10=new Map([['79/97',10]]);
assert.equal(otherTop10.has(family.key),true);
assert.equal(hitsForFamily(family,[{jur:'Córdoba',head:'5440'}]).length,0);
console.log('CABEZAS_DUALES_UI_OK: AUX-only 5440, +11-only, doble hoja, turno PRE y POST vs Tops.');
