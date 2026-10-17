import assert from 'node:assert/strict';
import {configurationCurrentCells,networkSupport,reorderDaughtersByNetwork} from './lab-vt4-hija-red';
import type {Proposal} from './lab-vt3-configuraciones-conectadas';
import type {Vt4Candidate} from './lab-conectadas-derivaciones-vt2-vt4';
const mother:Proposal={
 family:'226/622',source:'prevNocturno',cells:['0:0','1:0','2:0'],digits:'226',
 score:[2,0,1,0],firstDate:'2026-10-13',lastDate:'2026-10-14',
 historicConfiguration:'real',historySource:'Previa',pastHeads:['1234','4567'],
 proof:[['0:0','1:0','2:0'],['2:0','3:0','3:1']],relativeShift:2,currentOffset:0,historyDays:2
};
const outside:Vt4Candidate={family:'8226/8622',mother:mother.family,
 source:'prevNocturno',addedDigit:'8',
 paths:[{value:'8226',cells:['1:1','0:0','1:0','2:0']}]};
const supported:Vt4Candidate={family:'3226/3622',mother:mother.family,
 source:'prevNocturno',addedDigit:'3',
 paths:[{value:'3622',cells:['3:0','2:0','1:0','0:0']}]};
assert.equal(configurationCurrentCells(mother).size,5);
assert.equal(networkSupport(outside,mother),0);
assert.equal(networkSupport(supported,mother),1);
const ranked=reorderDaughtersByNetwork([outside,supported],[mother],'RED_PRIMERO');
assert.equal(ranked[0],supported);
assert.equal(ranked[1],outside);
assert.equal(reorderDaughtersByNetwork([outside,supported],[mother],'SOLO_HIJAS_RED').length,1);
assert.deepEqual(ranked.map(c=>c.paths),[supported.paths,outside.paths],
 'El ranking no debe crear, invertir ni alterar hijas físicas');
assert.throws(()=>configurationCurrentCells({...mother,cells:['5:0','4:0','3:0']}));
console.log('OK: cuarta casilla dentro de otra rama real, misma madre/fuente, sin cambiar VT4');
