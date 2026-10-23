/**
 * INFO: la última minihoja debe proyectar los mismos TOP3 físicos que
 * PREDICTIVA para cada modo. Las anteriores conservan solamente POST.
 */
import {strict as assert} from 'node:assert';
import {diaVacio} from '../src/domain';
import {emptyAuxiliaryHeads,auxAdjacent} from '../src/auxSantiagoNeuquen';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import {buildMotorLaloAuxiliar} from '../src/motorLaloAuxiliar';
import {buildInfoAuxFrames} from '../src/infoAuxGallery';
import type {AuxMode} from '../src/auxTemporalModes';
import {auxiliaryBoard} from '../src/auxSantiagoNeuquen';
import {buildAuxPredictiveVisual} from '../src/auxVisualModel';

const raw=emptyAuxiliaryHeads();
raw.Previa.Santiago='8067';raw.Previa.Neuquen='0469';
raw.Primera.Santiago='6142';raw.Primera.Neuquen='0245';
raw.Matutino.Santiago='9634';raw.Matutino.Neuquen='0210';
const draws=diaVacio();
draws.Previa.Ciudad='8067';
draws.Primera.Provincia='8067';
draws.Nocturno.Ciudad='2697';
const day={date:'2026-10-21',heads:diaVacio(),today:raw,yesterday:raw,
 sourceDate:'2026-10-20'};
for(const mode of ['intrajornada','anterior'] as AuxMode[]){
 const origin=extractAuxHistoryMode('2026-10-20',raw,draws,mode);
 const roots=[{date:'2026-10-20',period:'D−1' as const,aux:origin,heads:raw,
  ...(mode==='anterior'?{sourceDate:'2026-10-19'}:{})}];
 const turn='Nocturno' as const;
 const cut=auxAtCut(raw,turn,mode);
 const view=buildMotorLaloAuxiliar(day.date,turn,cut,roots);
 const result=buildInfoAuxFrames([],day,turn,mode,view,roots);
 assert.equal(result.length,1);
 assert.equal(result[0].board?.cells.length,24);
 assert(result[0].top3.length>0);
 assert(result[0].top3.length<=9);
 assert(result[0].marks.length>0,'TOP3 sin rutas físicas visibles: '+mode);
 const predictive=buildAuxPredictiveVisual(day.date,turn,auxiliaryBoard(cut,turn),
  view,roots,mode);
 const topIds=new Set((['vt2','vt3','vt4'] as const).flatMap(kind=>
  view.ranks[Number(kind.slice(-1)) as 2|3|4].slice(0,3)
  .map(x=>kind+'|'+x.family)));
 const expected=predictive.routes.filter(r=>topIds.has(r.ownerId));
 assert.equal(result[0].marks.length,expected.length,
  'INFO difiere de las rutas PRE de PREDICTIVA');
 for(const m of result[0].marks){
  assert.equal(m.path.length,Number(m.kind.slice(-1)));
  assert.equal(m.head,m.path.map(x=>x.digit).join(''));
  for(let i=1;i<m.path.length;i++)assert(auxAdjacent(m.path[i-1],m.path[i]));
 }
 const earlier={...day,date:'2026-10-20',heads:draws,
  sourceDate:'2026-10-19'};
 const hist=buildInfoAuxFrames([earlier],day,turn,mode,view,roots);
 assert(hist[0].marks.every(x=>x.jur!=='Top #1'));
 assert(hist[0].marks.some(x=>x.head==='2697'),
  'Las minihojas antiguas conservan las marcas POST');
 assert.equal(hist[1].marks.length,expected.length);
 console.log('INFO_AUX_TOP3_OK',mode,{tops:result[0].top3.length,routes:expected.length});
}
// En HOY antes de Previa no hay celdas; no crear candidatas irreales.
const before=buildInfoAuxFrames([],day,'Previa','intrajornada');
assert.equal(before[0].board?.cells.length,0);
assert.equal(before[0].marks.length,0);
