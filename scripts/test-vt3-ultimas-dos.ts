import assert from 'node:assert/strict';
import {twoLastFromVt3Readings,topVt3AsVt2PRE,evaluateTailPOST,
 rankTailsPulses} from '../src/labVt3Terminations';
import type {LaloView,LaloFamily} from '../src/motorLalo';
assert.deepEqual(twoLastFromVt3Readings(['513','351']),['13','51']);
assert.deepEqual(twoLastFromVt3Readings(['513','315']),['13','15']);
assert.deepEqual(twoLastFromVt3Readings(['412','214']),['12','14']);
assert.deepEqual(twoLastFromVt3Readings(['310','013']),['10','13']);
assert.deepEqual(twoLastFromVt3Readings(['001','100']),['01','00']);
assert.throws(()=>twoLastFromVt3Readings(['513']),/dos lecturas/);
const family=(kind:'vt2'|'vt3',family:string,rank:number)=>
 ({kind,family,rank,paths:[]} as LaloFamily);
const view={
 date:'2026-10-29',target:'Nocturno',
 ranks:{vt2:[family('vt2','31/13',1),family('vt2','25/52',2)],
 vt3:[family('vt3','315/513',1),family('vt3','214/412',2),
  family('vt3','013/310',3)],vt4:[]}
} as LaloView;
const pre=topVt3AsVt2PRE(view);
assert.deepEqual(pre.rows.map(r=>r.tails),[['15','13'],['14','12'],['13','10']]);
assert.equal(pre.rows.length,3);
const post=evaluateTailPOST(pre,[
 {jur:'Santa Fe',head:'2813'}, {jur:'Ciudad',head:'4715'},
 {jur:'Provincia',head:'1214'}, {jur:'Córdoba',head:'4510'},
 {jur:'Entre Ríos',head:'9752'}]);
assert.equal(post.heads,5);
assert.equal(post.vt2TopHitHeads,2); // 13 and 52
assert.equal(post.vt3TailHitHeads,4); // 13,15,14,10
assert.equal(post.tailOnly,3);
assert.equal(post.both,1);
assert.equal(post.topOnly,1);
assert.equal(post.neither,0);
assert.equal(post.exactVt3HitHeads,0);
assert.equal(post.ranks[0].hitHeads,2);
assert.equal(post.ranks[2].hitHeads,2); // 13 and 10
const alerts=rankTailsPulses(
 [1,1,0,1,0].map((n,i)=>({
  date:'2026-10-'+String(i+12).padStart(2,'0'),
  turn:'Nocturno',rank:7,exposed:2,
  hit:Boolean(n),hitHeads:n})),3,2);
assert.equal(alerts.alerts,2);
assert.equal(alerts.alertHits,1);
assert.equal(alerts.nonAlerts,0);
assert.deepEqual(alerts.pulses.slice(0,3).map(p=>p.active),[false,false,false]);
console.log('VT3_LITERAL_TWO_SUFFIXES_TEST_OK');
