/** Los resultados POST deben marcar los dos lectores VT2 SIN reordenar PRE. */
import {strict as assert} from 'node:assert';
import type {Vt2Experimental,Vt2ExperimentalItem} from '../src/experimentalVt2';
import {evaluateExperimentalVt2Post} from '../src/vt2ExperimentalPost';
const item=(family:string):Vt2ExperimentalItem=>({
 family,source:'prevNocturno',cells:['0:0','0:1'],value:family.slice(0,2),
 shape:'0:0>0:1',score:[0],witnesses:1,historicalDates:['2026-10-22'],
 pastHeads:['9912'],note:'Prueba'
});
const geometric=['12/21','34/43','56/65','07/70','89/98'].map(item);
const connected=['89/98','12/21','34/43','01/10'].map(item);
const pre:Vt2Experimental={
 date:'2026-10-29',turn:'Matutino',geometric,connected,
 allRoutes:20,historicalEvents:6
};
const original=JSON.stringify(pre);
const pending=evaluateExperimentalVt2Post(pre,[]);
assert.equal(pending.published.length,0);
assert.equal(pending.geometric.matches.length,0);
assert.equal(pending.connected.matches.length,0);
const after=evaluateExperimentalVt2Post(pre,[
 {jur:'Ciudad',head:'9912'},
 {jur:'Provincia',head:'4534'},
 {jur:'Santa Fé',head:'80307'}, // 5 dígitos -> 0307, últimas 2 07
 {jur:'Córdoba',head:'0121'}, // familia VT2 12/21 (sentido inverso)
 {jur:'Entre Ríos',head:'0000'},
 {jur:'Provincia',head:'4534'}, // duplicado de cabeza/evento
 {jur:'Sin publicar',head:'----'}
]);
assert.equal(after.published.length,5);
assert.deepEqual(after.geometric.matches.map(m=>[m.rank,m.family,m.heads.length]),[
 [1,'12/21',2],[2,'34/43',1],[4,'07/70',1]
]);
assert.deepEqual(after.connected.matches.map(m=>[m.rank,m.family,m.heads.length]),[
 [2,'12/21',2],[3,'34/43',1]
]);
assert.equal(after.geometric.matchedFamilies,3);
assert.equal(after.geometric.matchedHeads,4);
assert.equal(after.geometric.top3Families,2);
assert.equal(after.geometric.top3Heads,3);
assert.equal(after.connected.matchedFamilies,2);
assert.equal(after.connected.matchedHeads,3);
assert.equal(after.connected.top3Families,2);
assert.equal(after.connected.top3Heads,3);
assert.equal(JSON.stringify(pre),original,'El POST nunca debe modificar el TOP PRE');

const noHits=evaluateExperimentalVt2Post(pre,[{jur:'Ciudad',head:'0044'}]);
assert.equal(noHits.published.length,1);
assert.equal(noHits.geometric.matchedFamilies,0);
assert.equal(noHits.connected.matchedFamilies,0);
const zeros=evaluateExperimentalVt2Post({
 geometric:[item('00/00')],connected:[]
},[{jur:'Santa Fé',head:'10000'}]);
assert.equal(zeros.geometric.matches[0].heads[0].ending,'00',
 'Los ceros iniciales nunca deben perderse');
console.log('VT2_POST_VALIDO',{
 published:after.published.length,
 geometric:after.geometric,
 connected:after.connected,
 noFutureLeak:true,
 preUnmodified:true
});