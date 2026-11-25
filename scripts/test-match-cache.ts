import assert from 'node:assert/strict';
import {compactSignature,selectMatchFrames} from '../src/matchStudyCache';
import {diaVacio} from '../src/domain';
import type {PreparedDay,MatchFrame} from '../src/matchStudyCache';
const frame:MatchFrame={date:'2026-11-24',turn:'Vespertino',engine:'lalo',count:90,published:5,available:true,captured:false,hits:[{jur:'Ciudad',head:'3412',rank:83,family:'12/21',value:'12'}]};
const d:PreparedDay={date:frame.date,signature:'test',storedAt:0,complete:true,frames:{vt2:[frame],vt3:[],vt4:[]}};
assert.equal(selectMatchFrames([d],[d.date],'vt2',['lalo'],['Vespertino'])[0],frame);
assert.equal(selectMatchFrames([d],[d.date],'vt2',['lalo'],['Vespertino'])[0].hits[0].rank,83);
assert.deepEqual(selectMatchFrames([d],[d.date],'vt3',['lalo'],['Vespertino']),[]);
assert.deepEqual(selectMatchFrames([d],[d.date],'vt2',['ayer'],['Vespertino']),[]);
assert.deepEqual(selectMatchFrames([d],[d.date],'vt2',['lalo'],['Previa']),[]);
assert.deepEqual(selectMatchFrames([d],['2026-11-23'],'vt2',['lalo'],['Vespertino']),[]);
console.log('Filtros sobre resultados preparados conservan puesto y datos originales');

const heads=diaVacio();const signature=compactSignature(heads,[],[]);assert.equal(signature.length,64);assert.equal(compactSignature(heads,[],[]),signature);heads.Vespertino.Ciudad='3412';assert.notEqual(compactSignature(heads,[],[]),signature);
