import assert from 'node:assert/strict';
import {figuresInTop} from '../src/labRadarFiguras';
import type {Figure,ShapeRoute,Board} from '../src/labRadarFiguras';
import type {Witness} from '../src/labTresHojasTestigos';
import {prepareChangeAlerts,evaluateChangeAlertsPOST,matchedControls} from '../src/labAlertasCambios';
const date='2026-10-29',turn='Nocturno';
const mk=(d:string,board:Board,engine:ShapeRoute['engine'],
 reading:string,rank:number,row=0):Figure=>figuresInTop([{
  date:d,turn,board,engine,rank,kind:'VT2',
  source:board==='PLUS11'?'Previa':'Santiago-Neuquen',
  cells:[{row,col:0},{row,col:1}],reading,
  family:[reading,[...reading].reverse().join('')].sort().join('/')
}])[0];
const now=[mk(date,'PLUS11','LALO','13',7),
 mk(date,'PLUS11','GEOMETRIA','61',5,1),
 mk(date,'PLUS11','LALO','84',3,2),
 mk(date,'AUX_AYER','AUX_AYER','92',4),
 mk(date,'AUX_AYER','AUX_AYER','41',9,1),
 mk(date,'AUX_HOY','AUX_HOY','70',8)];
const oldDates=['2026-10-24','2026-10-26','2026-10-27','2026-10-28'];
const older=oldDates.map((d,i)=>({
 date:d,turn,figures:i===0?
 [mk(d,'PLUS11','LALO','13',7)]:i===3?
 [mk(d,'PLUS11','LALO','84',3),
  mk(d,'AUX_AYER','AUX_AYER','41',9,1)]:
 [mk(d,'PLUS11','LALO','84',3,2)]
}));
const witnessed=(fig:Figure,historyDate:string,head:string):Witness=>({
 event:historyDate+'|Vespertino|Ciudad|'+head,
 date:historyDate,turn:'Vespertino',head,jur:'Ciudad',
 board:fig.board,kind:fig.kind,source:fig.source,
 shape:fig.shape,site:fig.site,cells:fig.cells
});
const roots=[witnessed(now[0],'2026-10-24','9913'),
 witnessed(now[1],'2026-10-27','9961'),
 witnessed(now[3],'2026-10-28','9992')];
const preview=prepareChangeAlerts({date,turn,figures:now},older,roots);
assert(preview.proposed.some(x=>x.site===now[0].site&&
 x.board==='PLUS11'&&x.alertKinds.includes('REAPARECE_CON_TESTIGO')));
assert(preview.proposed.some(x=>x.site===now[1].site&&
 x.board==='PLUS11'&&x.alertKinds.includes('NACE_CON_TESTIGO')));
assert(preview.focus.filter(x=>x.kind==='VT2').length<=2);
assert(preview.focus.every(x=>x.kind==='VT2'||
 x.kind==='VT3'));
assert.equal(preview.eligibleFigureCount.VT2,6);
const post=evaluateChangeAlertsPOST(preview,now,[{jur:'Santa Fe',head:'2813'}]);
assert(post.focus.every(x=>x.figureId));
assert.equal(post.proposed.some(x=>x.hit),true,
 'Cotejo POST con ruta 13 debe reconocerse');
const control=matchedControls(preview,now,[{jur:'Santa Fe',head:'2813'}]);
assert(control.pairs.length+control.unmatched===preview.focus.length);
assert.throws(()=>prepareChangeAlerts({date,turn,figures:now},[
 {date,turn,figures:now}],roots),/FUGA/);
assert.throws(()=>prepareChangeAlerts({date,turn,figures:now},older,[
 ...roots,witnessed(now[0],'2026-10-30','9913')]),/FUGA/);
const aux=mk(date,'AUX_AYER','AUX_AYER','13',4);
const geo=mk(date,'PLUS11','LALO','13',4);
assert.notEqual(aux.id,geo.id,'Distintos tableros nunca son mismo sitio');
console.log('ALERTAS_CAMBIOS_TEST_OK');
