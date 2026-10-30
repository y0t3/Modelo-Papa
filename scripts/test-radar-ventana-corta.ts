import assert from 'node:assert/strict';
import {pulseOfRank,detectCooccurrence,maternalExtension,trackableSignals} from '../src/labRadarVentanaCorta';
import type {Entry} from '../src/labRadarVentanaCorta';
const dates=['2026-10-22','2026-10-23','2026-10-24','2026-10-26',
 '2026-10-27','2026-10-28','2026-10-29'];
const yes=[true,true,false,false,false,true,true];
const rank7:Entry[]=dates.map((date,i)=>({
 date,turn:'Nocturno',source:'LALO',sheet:'PLUS11',length:'VT2',
 rank:7,family:['67/76','89/98','36/63','67/76','23/32','01/10','13/31'][i],
 physicalRoutes:['Vespertino:2:0>3:1'],
 matchedHeads:yes[i]?['head-'+i]:[],preReconstructed:true
}));
const status=pulseOfRank(rank7).map(p=>p.state);
assert.deepEqual(status,[
 'SIN_APARICION','NACIMIENTO','PAUSA','PAUSA','PAUSA',
 'REAPARICION','EN_SEGUIMIENTO'
]);
assert.equal(pulseOfRank(rank7)[5].history,'✓✓···✓');
assert.equal(pulseOfRank(rank7)[5].pastSix,3);
const longer=[...rank7,...[30,31,32,33].map((num,i)=>({
 ...rank7.at(-1)!,date:'2026-11-'+String(num-29).padStart(2,'0'),
 matchedHeads:[]
}))];
assert.equal(pulseOfRank(longer).at(-1)!.state,'FINALIZADO');
assert(maternalExtension('13/31','513/315'));
assert(maternalExtension('13/31','813/318'));
assert(!maternalExtension('13/31','514/415'));
const cross:Entry[]=[
 rank7[6],
 {...rank7[6],source:'GEOMETRIA',rank:1},
 {...rank7[6],source:'AUX_AYER',sheet:'AUX_AYER',rank:4}
];
const co=detectCooccurrence(cross);
assert.equal(co.length,1);
assert.equal(co[0].engines.length,3);
assert.equal(co[0].physicalSheets.length,2);
assert(co[0].acrossIndependentBoards);
assert(!detectCooccurrence(cross.slice(0,2))[0].acrossIndependentBoards);
assert(trackableSignals(rank7).some(x=>x.date==='2026-10-28'&&
 x.state==='REAPARICION'));
assert.throws(()=>pulseOfRank([rank7[0],rank7[0]]),/duplicar/);
console.log('RADAR_VENTANA_CORTA_TEST_OK');
