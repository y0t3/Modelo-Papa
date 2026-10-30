import assert from 'node:assert/strict';
import {extensionReviewPOST,plus11Rankings} from '../src/extensionReview';

const pending=extensionReviewPOST('813',[
 {jur:'Ciudad',head:'----'},{jur:'Santa Fe',head:''}
]);
assert.equal(pending.status,'PENDIENTE');
assert.equal(pending.observed,0);
assert.equal(pending.matches.length,0);

const one=extensionReviewPOST('813',[
 {jur:'Santa Fe',head:'2813'},{jur:'Ciudad',head:'----'}
]);
assert.equal(one.status,'COINCIDIO');
assert.deepEqual(one.matches,[{
 jur:'Santa Fe',head:'2813',ending:'813',direction:'DIRECTA'
}]);
assert.equal(one.observed,1);
assert.equal(extensionReviewPOST('513',[{jur:'Santa Fe',head:'2813'}])
 .status,'SIN_COINCIDENCIA_PUBLICADA');

const inverse=extensionReviewPOST('813',[{jur:'Córdoba',head:'5318'}]);
assert.equal(inverse.matches[0].direction,'INVERSA');
assert.equal(inverse.matches[0].ending,'318');
assert.equal(extensionReviewPOST('013',[{jur:'Santa Fe',head:'00013'}])
 .matches[0].head,'00013','Preservar cero y cinco cifras');
const dup=extensionReviewPOST('813',[
 {jur:'Santa Fe',head:'2813'},{jur:'Santa Fe',head:'2813'}
]);
assert.equal(dup.matches.length,1,'No duplicar el mismo resultado');

const premade=[
 {engine:'LALO' as const,rank:7,family:'318/813'},
 {engine:'FORMAS_PRIMERO' as const,rank:5,family:'315/513'}
];
assert.equal(plus11Rankings('813',premade).length,1);
assert.equal(plus11Rankings('513',premade)[0].rank,5);
assert.equal(plus11Rankings('413',premade).length,0);

// Se permite sólo analizar resultados PUBLICADOS, nunca reescribir
// rankings ni distinguir las extensiones por el acierto previo a sorteo.
assert.deepEqual(plus11Rankings('813',premade),
 plus11Rankings('813',premade));
console.log('EXTENSIONES_COTEJO_UI_TEST_OK');
