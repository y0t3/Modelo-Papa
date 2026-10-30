import assert from 'node:assert/strict';
import {positionDays,rankSummary,alertSummary,fixedWinnerTrainTest}
 from '../src/labVt3TopPositions';
const cut={
 date:'2026-10-29',turn:'Nocturno',
 top2:['13','31','15'],
 rows:[
  {rank:1,tails:['13','51']},
  {rank:2,tails:['51','06']},
  {rank:3,tails:['06','06']}
 ],
 heads:[{jur:'Santa Fe',head:'2813'},{jur:'Córdoba',head:'6906'},
  {jur:'Provincia',head:'9251'}]
};
const rows=positionDays([cut]);
assert.equal(rows.length,3);
assert.equal(rows[0].hits,2);
assert.equal(rows[0].incrementalHits,1);
assert.equal(rows[0].uniqueHits,0,'51 compartido con #2');
assert.equal(rows[1].hits,2);
assert.equal(rows[1].incrementalHits,2);
assert.equal(rows[1].uniqueHits,0,'51 con #1 y 06 con #3');
assert.equal(rows[2].distinct,1,'No duplicar 06/06');
assert.equal(rows[2].incrementalHits,1);
assert.equal(rows[2].uniqueHits,0);
assert.equal(rankSummary(rows)[0].outsideExposures,1);
assert.throws(()=>positionDays([cut,cut]),/Observación repetida/);
const obs=[0,1,1,0,1,0,0].map((n,i)=>({
 date:'2026-10-'+String(i+12).padStart(2,'0'),turn:'Nocturno',
 top2:[],rows:[{rank:7,tails:['13','51']}],
 heads:n?[{jur:'Ciudad',head:'2813'}]:[{jur:'Ciudad',head:'2899'}]
}));
const pulse=alertSummary(positionDays(obs).filter(x=>x.rank===7),3,2);
assert.equal(pulse.alerts,3);
assert.equal(pulse.hitsAfterAlert,1);
assert.equal(pulse.withoutAlert,1);
const cv=fixedWinnerTrainTest(obs,'2026-10-16');
assert.equal(cv.comparison.Nocturno.trainedRank,7);
assert.equal(cv.comparison.Nocturno.test?.exposed,6);
console.log('PUESTOS_VT3_EXCLUSIVOS_TEST_OK');
