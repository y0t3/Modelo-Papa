import assert from 'node:assert/strict';
import {auxiliaryBoard,emptyAuxiliaryHeads,collectAuxFamilies}
 from '../src/auxSantiagoNeuquen';
import {auxEvidenceIndex} from '../src/labAuxTop20AuditVT3';
import {temporalEvidence,temporalTop10}
 from '../src/labAuxTemporalVT3';
import type {AuxiliaryHistorical,AuxRank} from '../src/motorLaloIntegral';

const heads=emptyAuxiliaryHeads();
heads.Previa={Santiago:'1234',Neuquen:'5678'};
heads.Primera={Santiago:'9012',Neuquen:'3456'};
heads.Matutino={Santiago:'7890',Neuquen:'1234'};
const physical=collectAuxFamilies(auxiliaryBoard(heads,'Nocturno'),3);
const f=physical[0],path=f.paths[0];
const event=(id:string,date:string)=>({
 id,date,turn:'Nocturno' as const,jur:'Ciudad',head:'0123',
 length:3 as const,paths:[path,[...path].reverse()]
});
const record=(date:string,ids:string[]):AuxiliaryHistorical=>({
 date,period:'D−1',aux:{date,events:{2:[],4:[],
  3:ids.map(id=>event(id,date))}}
});
const history=[record('2026-10-27',['e1','e2']),record('2026-10-28',['e3'])];
const index=auxEvidenceIndex(history,'2026-10-29');
const rank:AuxRank={family:f.family,rank:12,mother:null,values:f.values,
 roots:3,d1:3,d7:0,paths:[path],crossing:false,sources:['Previa']};
const result=temporalEvidence([rank],[f],index)[0];
assert.equal(result.eventCount,3,'Múltiples recorridos no son múltiples cabezas');
assert.equal(result.distinctDays,2);
assert.equal(result.maxDayEvents,2);
assert.equal(result.latestDayEvents,1);
assert.equal(result.concentration,2/3);
assert.equal(result.effectiveDays,9/5);
assert.deepEqual(result.dayHistogram.map(d=>d.events),[1,2]);
assert.throws(()=>auxEvidenceIndex([record('2026-10-29',['future'])],'2026-10-29'),/FUGA/);
const examples=Array.from({length:20},(_,i)=>({
 ...result,rank:i+1,family:String(i).padStart(3,'0')+'/'+String(i).padStart(3,'0'),
 eventCount:i===10?7:i===11?4:1,
 distinctDays:i===10?4:i===11?1:1,
 effectiveDays:i===10?3.5:i===11?1:1,
 maxDayEvents:i===11?4:1,
 latestDayEvents:i===12?3:0
}));
for(const policy of ['official','next','spread','effective','cluster',
 'recent','volume','neutral'] as const){
 const top=temporalTop10(examples,policy,'2026-10-29|Nocturno|AUX_AYER');
 assert.equal(top.length,10);
 assert.equal(new Set(top).size,10);
 assert(top.every(x=>examples.some(r=>r.family===x)));
}
assert(temporalTop10(examples,'spread','fixed').includes(examples[10].family));
assert(temporalTop10(examples,'effective','fixed').includes(examples[10].family));
assert(temporalTop10(examples,'cluster','fixed').includes(examples[11].family));
assert(temporalTop10(examples,'recent','fixed').includes(examples[12].family));
assert.deepEqual(temporalTop10(examples,'official','fixed'),
 examples.slice(0,10).map(r=>r.family));
assert.deepEqual(temporalTop10(examples,'next','fixed'),
 examples.slice(10,20).map(r=>r.family));
assert.deepEqual(temporalTop10(examples,'spread','fixed'),
 temporalTop10(examples,'spread','another-key'),
 'El orden geométrico/temporal debe ser independiente del azar neutral');
console.log('LAB_AUX_TEMPORAL_VT3_TEST_OK');
