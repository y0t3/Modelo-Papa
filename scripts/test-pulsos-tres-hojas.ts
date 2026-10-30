import assert from 'node:assert/strict';
import {figuresInTop} from '../src/labRadarFiguras';
import {pulsesForSnapshot,summarizePulses} from '../src/labPulsosTresHojas';
const make=(date:string,reading:string,board:'PLUS11'|'AUX_AYER'|'AUX_HOY')=>{
 const fig=figuresInTop([{date,turn:'Nocturno',board,
  source:board==='PLUS11'?'Vespertino':'Santiago-Neuquen',
  engine:board==='PLUS11'?'LALO':board,
  kind:'VT2',family:reading+'/'+[...reading].reverse().join(''),
  reading,rank:7,cells:[{row:0,col:0},{row:0,col:1}]}]);
 return {date,turn:'Nocturno',figures:fig};
};
const previous=[
 make('2026-10-22','13','PLUS11'),
 make('2026-10-23','94','PLUS11'),
 make('2026-10-24','35','PLUS11'),
 make('2026-10-26','68','PLUS11')
];
const now=make('2026-10-27','02','PLUS11');
const pulse=pulsesForSnapshot(now,previous);
assert.equal(pulse.length,1);
assert.equal(pulse[0].seenInLast6,4);
assert.equal(pulse[0].seenInLast3,3);
assert.equal(pulse[0].wasPresentPreviousDay,true);
assert.equal(pulse[0].newAfterThree,false);
assert.equal(pulse[0].repeatedOnThreeDays,true);
assert.equal(summarizePulses(pulse).PLUS11_VT2.atLeast3Days,1);
const auxNow=make('2026-10-27','02','AUX_AYER');
assert.equal(pulsesForSnapshot(auxNow,previous)[0].seenInLast6,0,
 'No confundir sitio de +11 con el sitio de una auxiliar');
assert.throws(()=>pulsesForSnapshot(now,[now]),/futura/);
console.log('PULSOS_TRES_HOJAS_TEST_OK');
