import assert from 'node:assert/strict';
import {allowedVT3} from '../src/labExtensionesAux';
import type {MotherSnapshot,ExtensionOption} from '../src/labExtensionesAux';
import {BUDGETS,STRATEGIES,shortlistMother,shortlistSnapshot,evaluateShortlistsPOST}
 from '../src/labReduccionExtensiones';
const date='2026-10-29',turn='Nocturno';
const mother='13/31';
const options:ExtensionOption[]=allowedVT3(mother).map(value=>({
 mother,value,status:value==='813'||value==='513'?'AMBAS':
  value==='613'?'SOLO_AYER':value==='913'?'SOLO_HOY':'NINGUNA',
 ayer:value==='813'?4:value==='513'?6:value==='613'?1:0,
 hoy:value==='813'?2:value==='513'?2:value==='913'?1:0,
 rankVT3Ayer:value==='513'?4:null,rankVT3Hoy:null,
 winnerEventsAyer:value==='813'?1:0,
 winnerEventsHoy:value==='513'?1:0,
 exampleAyer:value==='813'?[{row:0,col:0,source:'Previa',digit:'8'},
 {row:1,col:1,source:'Previa',digit:'1'},
 {row:0,col:2,source:'Previa',digit:'3'}]:null,
 exampleHoy:value==='813'?[{row:0,col:10,source:'Matutino',digit:'8'},
 {row:1,col:11,source:'Matutino',digit:'1'},
 {row:0,col:11,source:'Matutino',digit:'3'}]:null
}));
const group:MotherSnapshot={family:mother,engines:['LALO','GEOMETRIA'],
 ranks:{LALO:7,GEOMETRIA:1},options,
 counts:{AMBAS:2,SOLO_AYER:1,SOLO_HOY:1,NINGUNA:16}};
for(const strategy of STRATEGIES)for(const budget of BUDGETS){
 const a=shortlistMother(date,turn,group,strategy,budget);
 assert.equal(a.eligible,4);
 assert.equal(a.shown.length,Math.min(budget,4));
 assert.equal(a.hidden,4-a.shown.length);
 assert.equal(new Set(a.shown.map(x=>x.value)).size,a.shown.length);
 assert(a.shown.every(x=>x.status!=='NINGUNA'));
 assert.equal(a.allPhysical.length,4);
 assert.equal(a.remaining.length+a.shown.length,4);
 const next=shortlistMother(date,turn,group,strategy,budget);
 assert.deepEqual(a.shown.map(x=>x.value),next.shown.map(x=>x.value));
 const measured=evaluateShortlistsPOST([a],[{jur:'Santa Fe',head:'2813'}]);
 assert.equal(measured.headsWithMother,1);
 assert.equal(measured.headsPhysicallyCovered,1);
 assert.equal(measured.wonFromShown,
  a.shown.some(x=>x.value==='813')?1:0);
 assert.equal(measured.availableOptions,4);
 assert.equal(measured.shownOptions,Math.min(budget,4));
}
const at10=shortlistMother(date,turn,group,'DIVERSIDAD',10);
assert(at10.shown.some(x=>x.value==='813'));
assert(at10.shown.some(x=>x.value==='513'));
assert.equal(shortlistSnapshot({date,turn,mothers:[group],optionsTotal:20,
 optionsBoth:2,auxBoardCells:{ayer:24,hoy:24}},'DIVERSIDAD',3).length,1);
assert.equal(evaluateShortlistsPOST([at10],[{jur:'Santa Fe',head:'2813'}])
 .retainedAmongPhysical,1);
assert.equal(evaluateShortlistsPOST([at10],[{jur:'Santa Fe',head:'9999'}])
 .headsPhysicallyCovered,0);
console.log('REDUCCION_EXT_AUX_TEST_OK');
