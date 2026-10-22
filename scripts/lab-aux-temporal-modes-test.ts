import {strict as assert} from 'node:assert';
import {TURNOS,diaVacio} from '../src/domain';
import {auxiliaryBoard,emptyAuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {auxAtCut,extractHistoryMode,predictMode} from '../src/auxTemporalModes';
const raw=emptyAuxiliaryHeads();
raw.Previa.Santiago='8067';raw.Previa.Neuquen='0469';
raw.Primera.Santiago='6142';raw.Primera.Neuquen='0245';
raw.Matutino.Santiago='9634';raw.Matutino.Neuquen='0210';
for(const [i,turn] of TURNOS.entries()){
 const a=auxiliaryBoard(auxAtCut(raw,turn,'anterior'),turn);
 const b=auxiliaryBoard(auxAtCut(raw,turn,'intrajornada'),turn);
 assert.equal(a.cells.length,24);
 assert.equal(b.cells.length,Math.min(i,3)*8);
 assert(b.cells.every(c=>['Previa','Primera','Matutino'].indexOf(c.source)<i));
}
const observed=diaVacio();
observed.Previa.Ciudad='8067';observed.Primera.Provincia='8067';
observed.Nocturno.Ciudad='2697';
const before=extractHistoryMode('2026-10-20',raw,observed,'anterior');
const live=extractHistoryMode('2026-10-20',raw,observed,'intrajornada');
assert(before.events[4].some(e=>e.turn==='Previa'&&e.head==='8067'));
assert(!live.events[4].some(e=>e.turn==='Previa'));
assert(live.events[4].some(e=>e.turn==='Primera'&&e.head==='8067'));
assert(live.events[3].some(e=>e.turn==='Nocturno'&&e.head==='2697'));
assert.throws(()=>predictMode('2026-10-20','Nocturno',raw,
 [{date:'2026-10-20',period:'D−1',aux:live}],'intrajornada'),/Fuga temporal/);
const history=[{date:'2026-10-20',period:'D−1' as const,aux:live}];
assert.equal(predictMode('2026-10-21','Previa',raw,history,'intrajornada').ranks[3].length,0);
assert(predictMode('2026-10-21','Primera',raw,history,'intrajornada').ranks[3].length>0);
console.log('AUX_AB_MODOS_OK',
 JSON.stringify({anterior:[24,24,24,24,24],intrajornada:[0,8,16,24,24]}));
