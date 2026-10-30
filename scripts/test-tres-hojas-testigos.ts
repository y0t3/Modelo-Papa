import assert from 'node:assert/strict';
import {figuresInTop} from '../src/labRadarFiguras';
import {auxiliaryWitnesses,figureSupport,postSupportMetrics} from '../src/labTresHojasTestigos';
const event=(date:string,head:string)=>({
 id:date+'|Nocturno|Santa Fe|'+head+'|VT2',date,
 turn:'Nocturno',jur:'Santa Fe',head,length:2 as const,
 paths:[[{
  row:0,col:1,source:'Previa',digit:'1'
 },{row:0,col:2,source:'Previa',digit:'3'}],
 [{
  row:0,col:1,source:'Previa',digit:'1'
 },{row:0,col:2,source:'Previa',digit:'3'}]]
});
const hist=[
 {date:'2026-10-22',period:'D−7',aux:{
  date:'2026-10-22',events:{2:[event('2026-10-22','9813')],3:[],4:[]}
 }},
 {date:'2026-10-28',period:'D−1',aux:{
  date:'2026-10-28',events:{2:[event('2026-10-28','2813')],3:[],4:[]}
 }}
] as any;
const roots=auxiliaryWitnesses(hist,'AUX_AYER');
assert.equal(roots.length,2,'No contar la ruta duplicada de una cabeza dos veces');
const figs=figuresInTop([{
 date:'2026-10-29',turn:'Nocturno',board:'AUX_AYER',source:'Santiago-Neuquen',
 kind:'VT2',engine:'AUX_AYER',rank:4,family:'13/31',
 reading:'13',cells:[{row:0,col:1},{row:0,col:2}]
 },{
 date:'2026-10-29',turn:'Nocturno',board:'AUX_HOY',source:'Santiago-Neuquen',
 kind:'VT2',engine:'AUX_HOY',rank:1,family:'13/31',
 reading:'13',cells:[{row:0,col:1},{row:0,col:2}]
 }]);
const support=figureSupport(figs[0],roots,'2026-10-29');
assert.equal(support.board,'AUX_AYER');
assert.equal(support.exactEvents,2);
assert.equal(support.exactDays,2);
const metrics=postSupportMetrics(figs,roots,'2026-10-29',[
 {jur:'Santa Fe',head:'2813'}
]) as any;
assert.equal(metrics.AUX_AYER_VT2.headWins.onlySupported,1);
assert.equal(metrics.AUX_HOY_VT2.headWins.onlyUnsupported,1);
assert.throws(()=>auxiliaryWitnesses(hist,'PLUS11'),/PLUS11/);
console.log('TRES_HOJAS_TESTIGOS_TEST_OK');
