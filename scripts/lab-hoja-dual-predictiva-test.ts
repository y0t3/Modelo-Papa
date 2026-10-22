import {strict as assert} from 'node:assert';
import {diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {auxiliaryBoard,emptyAuxiliaryHeads,auxAdjacent} from '../src/auxSantiagoNeuquen';
import {buildAuxPostLedger} from '../src/auxMarkLedger';
import {buildAuxDailyVisual,buildAuxPredictiveVisual} from '../src/auxVisualModel';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from '../src/motorLaloAuxiliar';
import {dailyHeadOwnerId} from '../src/panoramaModel';

const date='2026-10-20',raw=emptyAuxiliaryHeads();
raw.Previa.Santiago='8067';raw.Previa.Neuquen='0469';
raw.Primera.Santiago='6142';raw.Primera.Neuquen='0245';
raw.Matutino.Santiago='9634';raw.Matutino.Neuquen='0210';
const previous=diaVacio(),current=diaVacio();
previous.Nocturno.Ciudad='0099';
current.Nocturno.Ciudad='2697';
current.Vespertino['Entre Ríos']='4066';
current.Nocturno.Provincia='7310';
const sheet=buildSheet(current,previous);
const ledger=buildAuxPostLedger(date,raw,current,sheet,'Nocturno');
const board=auxiliaryBoard(raw,'Nocturno');
const daily=buildAuxDailyVisual(ledger,board);
const group=daily.groups.find(x=>x.head==='2697');
assert(group&&group.routeCount>0);
assert.equal(group.id,dailyHeadOwnerId('Nocturno','Ciudad','2697'));
assert(daily.routes.some(r=>r.ownerId===group.id&&r.kind==='vt3'&&
 r.reading==='697'&&new Set(r.cells.map(c=>c.source)).size>1),
 'cabeza 2697 marca rutas VT3 que cruzan Previa y Primera');
assert(!daily.routes.some(r=>r.reading==='796'&&r.ownerId===group.id),
 'cabeza POST nunca se invierte para crear otro ganador');
assert(daily.groups.some(g=>g.head==='4066'&&g.kinds.includes('vt2')));
for(const route of daily.routes){
 for(let i=1;i<route.cells.length;i++)assert(auxAdjacent(route.cells[i-1],route.cells[i]),
  'no saltos ni huecos');
 assert(route.cells.every(c=>board.cells.some(x=>x.row===c.row&&x.col===c.col)));
}
const older=diaVacio();older.Nocturno.Ciudad='2697';
const history=[{date:'2026-10-19',period:'D−1' as const,heads:raw,
 aux:extractAuxiliarHistory('2026-10-19',raw,older)}];
const view=buildMotorLaloAuxiliar(date,'Nocturno',raw,history);
const prediction=buildAuxPredictiveVisual(date,'Nocturno',board,view,history);
assert(prediction.groups.some(g=>g.id.startsWith('vt3|')&&g.routeCount>0));
assert(prediction.routes.length>0);
assert(prediction.routes.every(r=>r.rootEvents.length>0));
assert(prediction.routes.every(r=>r.rootEvents.every(x=>
 x.head==='2697'&&x.date<'2026-10-20')));
assert(prediction.routes.every(r=>r.rootEvents.every(x=>x.board?.target==='Nocturno')));
const before=auxiliaryBoard(raw,'Primera');
const beforeView=buildMotorLaloAuxiliar(date,'Primera',raw,history);
const previousRoutes=buildAuxPredictiveVisual(date,'Primera',before,beforeView,history);
assert(previousRoutes.routes.every(r=>r.cells.every(c=>c.source==='Previa')),
 'Previas únicamente al corte Primera');
assert.throws(()=>buildAuxPredictiveVisual('2026-10-19','Nocturno',
 board,view,history),/otro corte|futuro/);
assert.throws(()=>buildAuxPredictiveVisual(date,'Nocturno',
 board,view,[{...history[0],date}]),/histórico futuro/);
console.log('HOJA_DUAL_PREDICTIVA_TEST_OK',JSON.stringify({
 dailyGroups:daily.groups.length,dailyRoutes:daily.routes.length,
 vt3Head2697:daily.routes.filter(r=>r.ownerId===group.id&&r.kind==='vt3').length,
 predictiveGroups:prediction.groups.length,predictiveRoutes:prediction.routes.length,
 sample:prediction.routes.find(r=>r.kind==='vt3')?.rootEvents[0]?.relation
}));
