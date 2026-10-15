import assert from 'node:assert/strict';
import {readableDrawDate,buildInfoReport} from '../src/infoInterpretacion';
import {diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {LaloHistorical} from '../src/motorLalo';
import {pushNavigation,backNavigation,safeScrollY} from '../src/tabNavigation';
import type {NavigationEntry} from '../src/tabNavigation';

assert.equal(readableDrawDate('2026-10-14'),'mié 14/10');
assert.equal(readableDrawDate('2026-10-08'),'jue 08/10');
assert.equal(readableDrawDate('2026-10-15'),'jue 15/10');
assert.equal(readableDrawDate('2026-10-12'),'lun 12/10');
assert.equal(readableDrawDate('2026-10-11'),'dom 11/10');
assert.equal(readableDrawDate('2026-10-32'),'2026-10-32');
assert.equal(readableDrawDate('2026-2-3'),'2026-2-3');
const previous=diaVacio();previous.Nocturno.Ciudad='0000';
const historic=buildSheet(previous,previous);
const week:LaloHistorical[]=[
 {date:'2026-10-14',period:'D−1',sheet:historic},
 {date:'2026-10-08',period:'D−7',sheet:historic}
];
const report=buildInfoReport('2026-10-15','Nocturno',diaVacio(),
 buildSheet(diaVacio(),previous),week,null);
assert.deepEqual(report.frames.slice(0,2).map(f=>({
 id:f.id,label:f.label,context:f.context,phase:f.phase
})),[
 {id:'D−7',label:'jue 08/10 · Nocturno',context:'Semana pasada',phase:'POST'},
 {id:'D−1',label:'mié 14/10 · Nocturno',context:'Jornada anterior',phase:'POST'}
]);
assert.ok(report.frames[2].phase==='PRE');
const monday=buildInfoReport('2026-10-19','Previa',diaVacio(),
 null,[{period:'D−1',date:'2026-10-17',sheet:historic}],null);
assert.equal(monday.frames[0].label,'sáb 17/10 · Previa',
 'D−1 debe mostrar sábado cuando la jornada anterior no fue ayer (domingo)');

const entry=(screen:NavigationEntry['screen'],scrollY:number):NavigationEntry=>({
 screen,scrollY,selectedTurn:'Nocturno',
 focused:null,hojaFocused:null,hojaTurn:'Previa'
});
let history:NavigationEntry[]=[];
history=pushNavigation(history,entry('info',1382),'hoja');
history=pushNavigation(history,entry('hoja',247),'predictiva');
history=pushNavigation(history,entry('predictiva',543),'prediccion');
assert.equal(history.length,3);
const b1=backNavigation(history);
assert.equal(b1.entry?.screen,'predictiva');
assert.equal(b1.entry?.scrollY,543);
const b2=backNavigation(b1.remaining);
assert.equal(b2.entry?.screen,'hoja');
assert.equal(b2.entry?.scrollY,247);
const b3=backNavigation(b2.remaining);
assert.equal(b3.entry?.screen,'info');
assert.equal(b3.entry?.scrollY,1382);
assert.equal(backNavigation(b3.remaining).entry,null,
 'Sin historial, permitir comportamiento Android original');
assert.equal(pushNavigation([],entry('info',900),'info').length,0,
 'Tocar la pestaña actual no agrega bucles de Atrás');
assert.equal(safeScrollY(-30),0);
assert.equal(safeScrollY(Number.NaN),0);
assert.equal(safeScrollY(1020),1020);
assert.equal(pushNavigation([],entry('hoja',-100),'info')[0].scrollY,0);
let capped:NavigationEntry[]=[];
for(let i=0;i<70;i++)capped=pushNavigation(capped,entry(i%2?'hoja':'info',i),'prediccion');
assert.equal(capped.length,50,'El historial no crece sin límite');
console.log('FECHAS_ATRAS_OK: fecha real de sorteo, sábado anterior, historial y scroll/foco reversible.');
