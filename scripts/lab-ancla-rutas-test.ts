import {strict as assert} from 'node:assert';
import {diaVacio} from '../src/domain';
import {emptyAuxiliaryHeads,auxiliaryBoard,findAuxPaths} from '../src/auxSantiagoNeuquen';
import {collectWitnesses,anchorPath,evaluateAnchors,familyFor} from '../src/auxAnchoredMemory';
const aux=emptyAuxiliaryHeads();
aux.Previa.Santiago='8067';aux.Previa.Neuquen='0469';
aux.Primera.Santiago='6142';aux.Primera.Neuquen='0245';
aux.Matutino.Santiago='9634';aux.Matutino.Neuquen='0210';
const observed=diaVacio();
observed.Previa.Provincia='8067'; // no auxiliar PRE previa
observed.Primera['Santa Fé']='8568'; // no origen 568
observed.Vespertino['Entre Ríos']='4066';
observed.Nocturno.Ciudad='2697';
observed.Nocturno.Provincia='7310';
const day=collectWitnesses('2026-10-20',aux,observed);
for(const kind of [2,3,4] as const)
 assert(day.byKind[kind].every(r=>r.target!=='Previa'),
 'una cabeza Previa jamás genera raíz auxiliar');
assert(!day.byKind[3].some(r=>r.head==='8568'));
const head=day.byKind[3].find(r=>r.head==='2697');
assert(head&&head.paths.length===3);
const crossing=head.paths.find(p=>new Set(p.map(x=>x.source)).size===2);
assert(crossing,'697 tuvo un camino cruzando franjas');
const current=auxiliaryBoard(aux,'Nocturno');
const actual=anchorPath(current,crossing);
assert(actual&&actual.map(x=>x.digit).join('')==='697');
assert(actual.every((c,i)=>c.row===crossing[i].row&&c.col===crossing[i].col));
const mutated=structuredClone(aux);
mutated.Primera.Santiago='1142';
const different=anchorPath(auxiliaryBoard(mutated,'Nocturno'),crossing);
assert(different&&different.map(x=>x.digit).join('')!=='697',
 'mantener coordenadas, leer nuevos dígitos; no copiar la cabeza antigua');
const hidden=anchorPath(auxiliaryBoard(mutated,'Primera'),crossing);
assert.equal(hidden,null,'no atravesar turnos aún no publicados');
assert.deepEqual(familyFor(4,'2697').split('/'),['2697','2796'],
 'VT4 sólo invierte madre 697/796, no las cuatro cifras');
const refs=[{period:'D−1' as const,day}];
const winner=evaluateAnchors(current,refs,3);
const control=evaluateAnchors(current,refs,3,7);
assert(winner.ranked.some(x=>x.family==='697/796'&&x.roots>=1));
assert(winner.ranked.every(x=>x.roots<=winner.rootEvents));
assert(control.ranked.every(x=>x.roots<=control.rootEvents));
assert(control.nullFallbackPaths===0,'al elegir rutas no ganadoras sobran alternativas');
assert.equal(evaluateAnchors(auxiliaryBoard(aux,'Previa'),refs,3).candidates,0);
for(const n of [2,3,4] as const){
 const x=evaluateAnchors(current,refs,n);
 assert(x.ranked.every(f=>f.values.every(v=>v.length===n)));
}
console.log('ANCLA_TEST_OK',JSON.stringify({
 checked:16,winnerRoots:winner.rootEvents,
 winningPaths:winner.positionedPaths,
 controlledPaths:control.positionedPaths,
 family697:winner.ranked.find(x=>x.family==='697/796')
}));
