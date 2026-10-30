import assert from 'node:assert/strict';
import {enumerateFigures} from '../src/labWinningFootprintTransfer';
import {historicWinningSites,projectSites,connectedZones,topFoci,evaluateZoneSelection,
 zoneFigures} from '../src/labConnectedWinnerFigures';
import type {DailySheet,Hit,Match} from '../src/sheet';
const vals=['12','34','56','78','90','21'];
const horiz=(row:number,digits:string)=>[
 {row,col:0,digit:digits[0]},{row,col:1,digit:digits[1]}
];
const event=(turn:string,jur:string,head:string,row:number):Match=>({
 turno:turn as 'Nocturno',jurisdiccion:jur,cabeza:head,
 hits:[{kind:'vt2',value:head.slice(-2),sourceId:'prevNocturno',
 sourceTurn:'Nocturna anterior',paths:[horiz(row,head.slice(-2))]}]
});
const sheet=(values=vals):DailySheet=>({
 columns:[{id:'prevNocturno',turno:'Previa',sourceLabel:'Nocturna anterior',values}],
 heads:{Previa:[],Primera:[],Matutino:[],Vespertino:[],Nocturno:[]},
 matches:{Previa:[],Primera:[],Matutino:[],Vespertino:[],Nocturno:[
  event('Nocturno','Ciudad','9912',0),
  event('Nocturno','Provincia','9934',1)
 ]}
});
const past=historicWinningSites(sheet(),'2026-10-22',2,'NOCTURNO');
assert.equal(past.length,2);
const now=enumerateFigures(sheet(['56','78',...vals.slice(2)]),2);
const cluster=connectedZones(past,now);
assert.equal(cluster.length,1);
assert.equal(cluster[0].events,2);
assert.equal(cluster[0].positions,2);
assert.equal(cluster[0].source,'prevNocturno');
assert.equal(topFoci(cluster,2).length,1);
const evalResult=evaluateZoneSelection(topFoci(cluster),now,['0956','2278'],2);
assert.equal(evalResult.observed,2);
const changed=enumerateFigures(sheet(['98','76',...vals.slice(2)]),2);
assert.deepEqual(zoneFigures(connectedZones(past,changed)).map(x=>x.key),
 zoneFigures(cluster).map(x=>x.key),'Las figuras deben ser independientes de cifras actuales');
const sameEventSheet=sheet();
sameEventSheet.matches.Nocturno=[
 event('Nocturno','Ciudad','9912',0),
 {...event('Nocturno','Ciudad','9912',0),hits:[
  {kind:'vt2',sourceId:'prevNocturno',sourceTurn:'Nocturna anterior',
   value:'12',paths:[horiz(0,'12'),[
    {row:0,col:0,digit:'1'},{row:1,col:0,digit:'3'}
   ]]} as Hit
 ]}];
const solo=historicWinningSites(sameEventSheet,'2026-10-22',2,'NOCTURNO');
const soloZones=connectedZones(solo,enumerateFigures(sheet(),2));
assert.equal(topFoci(soloZones).length,0,
 'Dos dibujos para una cabeza NO equivalen a dos antecedentes ganadores');
const extra=sheet();
extra.matches.Previa=[event('Previa','Entre Ríos','9956',2)];
assert.equal(historicWinningSites(extra,'2026-10-22',2,'NOCTURNO').length,2);
assert.equal(historicWinningSites(extra,'2026-10-22',2,'TODOS').length,3);
assert.equal(topFoci(connectedZones(past,[])).length,0,
 'No se inventan posiciones en hoja actual');
console.log('CONNECTED_FIGURES_TEST_OK');
