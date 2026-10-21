import {strict as assert} from 'node:assert';
import {diaVacio,TURNOS} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {emptyAuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {sameDaySequence} from '../src/withinDayMarkContinuity';
const date='2026-10-20';
const prev=diaVacio(),current=diaVacio(),aux=emptyAuxiliaryHeads();
for(const t of ['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'])
 prev.Nocturno[t]='0099';  // +11 10 en la columna Nocturna anterior
current.Previa.Ciudad='4310'; // VT2 10 tiene ruta antes del sorteo
current.Primera.Ciudad='1110'; // También cuenta POST dentro de las fuentes disponibles
current.Matutino.Ciudad='7510';
current.Vespertino.Ciudad='1200'; // agrega 11 a +11, NO otro 10
current.Nocturno.Ciudad='0055';
aux.Previa.Santiago='0010';aux.Previa.Neuquen='9867';
aux.Primera.Santiago='8067';aux.Primera.Neuquen='0245';
aux.Matutino.Santiago='9634';aux.Matutino.Neuquen='0210';
const sheet=buildSheet(current,prev);
const frames=sameDaySequence(date,current,sheet,aux);
assert.equal(frames.length,5);
assert.equal(frames[0].roots[2].length,0);
assert.equal(frames[0].visibleAux.length,0);
assert.equal(frames[1].visibleAux.join(','),'Previa');
const key='01/10';
const first=frames[1].rooted[2].find(x=>x.family===key);
assert(first,'Cabeza Previa 4310 = ruta previa en +11');
assert.deepEqual(first.rootBoards,['PLUS']);
assert(first.newAuxSources.includes('Previa'),'aux aparece recién después de la Previa');
assert.equal(first.becameDualSheet,true);
assert(first.values.includes('10'));
const later=frames[2].rooted[2].find(x=>x.family===key);
assert(later?.rootEvents>=2,'la cabeza Primera suma evento POST comprobado');
assert.equal(later?.newPlusSources.includes('Primera'),false,'fuente distinta se atribuye solo si hay ruta');
const end=frames[4].rooted[2].find(x=>x.family===key);
assert(end);
assert(!end.newAuxSources.length,'Nocturno no añade columnas Santiago/Neuquén');
assert.equal(end.newPlusSources.includes('Vespertino'),false,'sin cabeza que agregue 10 no se inventa refuerzo');
for(const frame of frames){
 assert.equal(frame.roots[2].filter(e=>TURNOS.indexOf(e.turn)>=frame.index).length,0,
 'no admitir cabezas del propio turno ni futuras');
 for(const k of [2,3,4] as const)for(const root of frame.roots[k]){
  assert(root.plusPaths+root.auxPaths>0);
  assert(root.head.endsWith(root.exact));
 }
}
const poisoned=diaVacio();
poisoned.Nocturno.Ciudad='9999';
poisoned.Vespertino.Ciudad='9999';
const alternate=diaVacio();
for(const turn of TURNOS)alternate[turn]={...current[turn]};
alternate.Vespertino.Ciudad='9999';
alternate.Nocturno.Ciudad='9999';
const mutatedSheet=buildSheet(alternate,prev);
const framesAfter=sameDaySequence(date,alternate,mutatedSheet,aux);
assert.deepEqual(frames.slice(0,3),framesAfter.slice(0,3),
 'resultado de turnos futuros no contamina estados anteriores');
for(const k of [2,3,4] as const)for(const frame of frames){
 for(const family of frame.rooted[k]){
  assert(family.rootEvents>=1);
  assert(new Set(family.physicalBoards).size===family.physicalBoards.length);
  if(k===4)assert(family.values.every(v=>v.length===4));
 }
}
console.log('INTRAJORNADA_TEST_OK',JSON.stringify({
 checks:17,root:first,firstThreeStages:frames.slice(0,3).map(f=>({
  turn:f.target,roots:f.roots[2].length,rootedVt2:f.rooted[2].length,
  newVt2:f.rooted[2].filter(x=>x.status==='FUENTE_NUEVA').length
 }))
}));
