/**
 * Regresión: dos fuentes cronológicas en un solo tablero, con
 * memoria independiente y POST exacto, sin fuga entre turnos.
 */
import {strict as assert} from 'node:assert';
import {diaVacio,TURNOS} from '../src/domain';
import {emptyAuxiliaryHeads,auxiliaryBoard,findAuxPaths} from '../src/auxSantiagoNeuquen';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import {buildSheet} from '../src/sheet';
import {buildAuxPostLedger} from '../src/auxMarkLedger';
import {buildHeadHighlights} from '../src/headHighlights';
import {dailyHeadOwnerId} from '../src/panoramaModel';
import {buildMotorLaloAuxiliar} from '../src/motorLaloAuxiliar';
const raw=emptyAuxiliaryHeads();
raw.Previa.Santiago='8067';raw.Previa.Neuquen='0469';
raw.Primera.Santiago='6142';raw.Primera.Neuquen='0245';
raw.Matutino.Santiago='9634';raw.Matutino.Neuquen='0210';
const n=[0,8,16,24,24];
for(const [i,turn] of TURNOS.entries()){
 const previous=auxiliaryBoard(auxAtCut(raw,turn,'anterior'),turn);
 const intraday=auxiliaryBoard(auxAtCut(raw,turn,'intrajornada'),turn);
 assert.equal(previous.cells.length,24);
 assert.equal(intraday.cells.length,n[i]);
}
const draws=diaVacio();
draws.Previa.Provincia='8067';
draws.Primera.Ciudad='8067';
draws.Nocturno.Ciudad='2697';
const yesterday=diaVacio();
yesterday.Nocturno.Ciudad='5566';
const plus=buildSheet(draws,yesterday);
const before=buildAuxPostLedger('2026-10-20',raw,draws,plus,'Nocturno','anterior');
const intraday=buildAuxPostLedger('2026-10-20',raw,draws,plus,'Nocturno','intrajornada');
const mark=(ledger:typeof before,t:string,head:string)=>ledger.marks.find(m=>m.turn===t&&m.head===head);
assert(mark(before,'Previa','8067')?.modalities.vt4.aux.length);
assert.equal(mark(intraday,'Previa','8067')?.modalities.vt4.aux.length,0);
assert(mark(intraday,'Primera','8067')?.modalities.vt4.aux.length);
assert(mark(intraday,'Nocturno','2697')?.modalities.vt3.aux.length);
const id=dailyHeadOwnerId('Previa','Provincia','8067');
const previousHighlights=buildHeadHighlights(draws,plus,raw,'anterior');
const sameHighlights=buildHeadHighlights(draws,plus,raw,'intrajornada');
assert(previousHighlights[id].auxKinds.includes('vt4'));
assert(!sameHighlights[id].auxKinds.length);
const oldHistory=extractAuxHistoryMode('2026-10-20',raw,draws,'anterior');
const intraHistory=extractAuxHistoryMode('2026-10-20',raw,draws,'intrajornada');
assert(oldHistory.events[4].some(e=>e.turn==='Previa'));
assert(!intraHistory.events[4].some(e=>e.turn==='Previa'));
assert(intraHistory.events[4].some(e=>e.turn==='Primera'));
assert(intraHistory.events[3].some(e=>e.turn==='Nocturno'));
assert.equal(buildMotorLaloAuxiliar('2026-10-21','Previa',
 auxAtCut(raw,'Previa','intrajornada'),
 [{date:'2026-10-20',period:'D−1',aux:intraHistory}]).ranks[3].length,0);
assert.throws(()=>buildMotorLaloAuxiliar('2026-10-20','Nocturno',
 raw,[{date:'2026-10-20',period:'D−1',aux:intraHistory}]),/Fuga temporal/);
const projected=auxiliaryBoard(auxAtCut(raw,'Nocturno','intrajornada'),'Nocturno');
assert(findAuxPaths(projected,'697').length>0);
console.log('AUX_DOS_MODOS_REGRESION_OK',{previous:24,
 intraday:n,eventsPrevious:oldHistory.events[4].length,
 eventsIntraday:intraHistory.events[4].length});
