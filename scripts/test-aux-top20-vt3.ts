import assert from 'node:assert/strict';
import {auxiliaryBoard,emptyAuxiliaryHeads,collectAuxFamilies,auxFamily}
 from '../src/auxSantiagoNeuquen';
import {auxEvidenceIndex,auxRankEvidence,selectRanked20,shapeKey}
 from '../src/labAuxTop20AuditVT3';
import type {AuxiliaryHistorical,AuxRank} from '../src/motorLaloIntegral';

const heads=emptyAuxiliaryHeads();
heads.Previa={Santiago:'1234',Neuquen:'5678'};
heads.Primera={Santiago:'9012',Neuquen:'3456'};
heads.Matutino={Santiago:'7890',Neuquen:'1234'};
const board=auxiliaryBoard(heads,'Nocturno');
const family=collectAuxFamilies(board,3).find(f=>f.paths.length>0)!;
const route=family.paths[0];
assert.equal(shapeKey(route),shapeKey([...route].reverse()));
const fakeRank:AuxRank={family:family.family,rank:12,mother:null,
 values:family.values,roots:1,d1:1,d7:0,paths:[route],
 crossing:new Set(route.map(x=>x.source)).size>1,
 sources:[...new Set(route.map(x=>x.source))]};
const history:AuxiliaryHistorical[]=[{
 date:'2026-10-28',period:'D−1',aux:{date:'2026-10-28',events:{2:[],4:[],3:[{
 id:'test|28|family',date:'2026-10-28',turn:'Nocturno',jur:'Ciudad',
 head:'0123',length:3,paths:[route,[...route].reverse()]
 }]}}
}];
const index=auxEvidenceIndex(history,'2026-10-29');
const observed=auxRankEvidence([fakeRank],[family],index)[0];
assert.equal(observed.exactEvents,1,'No contar la misma cabeza dos veces por rutas invertidas');
assert.equal(observed.exactDays,1);
assert(observed.physicalSites>=1);
assert.equal(observed.family,family.family);
assert.throws(()=>auxEvidenceIndex([{...history[0],date:'2026-10-29'}],
 '2026-10-29'),/FUGA/);
assert.throws(()=>auxEvidenceIndex([{...history[0],aux:{...history[0].aux,date:'2026-10-28',
 events:{...history[0].aux.events,3:[{...history[0].aux.events[3][0],date:'2026-10-29'}]}}}],
 '2026-10-30'),/FUGA/);
const demos=Array.from({length:20},(_,i)=>({
 ...observed,rank:i+1,family:String(i).padStart(3,'0')+'/'+String(i).padStart(3,'0'),
 exactDays:i===11?2:0,exactEvents:i===11?2:0,
 shiftDays:i===12?2:0,shiftEvents:i===12?2:0,
 crossingSites:i===13?2:0
}));
const k='2026-10-29|Nocturno|anterior';
for(const variant of ['official','next','exact','shift','cross','root','neutral'] as const){
 const chosen=selectRanked20(demos,variant,k);
 assert.equal(chosen.length,10);
 assert.equal(new Set(chosen).size,10);
 assert(chosen.every(f=>demos.some(x=>x.family===f)));
}
assert(selectRanked20(demos,'exact',k).includes(demos[11].family));
assert(selectRanked20(demos,'shift',k).includes(demos[12].family));
assert(selectRanked20(demos,'cross',k).includes(demos[13].family));
assert.deepEqual(selectRanked20(demos,'official',k),demos.slice(0,10).map(x=>x.family));
assert.deepEqual(selectRanked20(demos,'next',k),demos.slice(10).map(x=>x.family));
console.log('LAB_AUX_TOP20_TEST_OK');
