import assert from 'node:assert/strict';
import {selectAuxEmbudo,sourceGroup} from '../src/labAuxEmbudoVT3';
import type {AuxRank} from '../src/motorLaloIntegral';
import type {AuxFormChoice} from '../src/labAuxFormasPrimeroVT3';
const name=(i:number)=>String(i).padStart(3,'0')+'/'+String(i).padStart(3,'0');
const rank=(i:number):AuxRank=>({family:name(i),rank:i+1,mother:null,
 values:[String(i).padStart(3,'0')],roots:1,d1:1,d7:0,paths:[],crossing:false,sources:[]});
const hist=Array.from({length:30},(_,i)=>rank(i));
const physical=Array.from({length:36},(_,i)=>name(i));
const root=(i:number,r:number):AuxFormChoice=>({
 rank:r,family:name(i),value:String(i).padStart(3,'0'),
 path:[],site:'physical:'+i,shape:'flat',rootEvents:2,rootDays:2,
 exactEvents:1,lastDay:true
});
const forms=[root(33,1),root(29,2),root(31,3),root(32,4),root(28,5),root(34,6),root(24,7)];
assert(sourceGroup(null,'unranked'));
assert(!sourceGroup(23,'unranked'));
assert(sourceGroup(23,'deep'));
assert(!sourceGroup(19,'deep'));
assert(sourceGroup(null,'outside20'));
assert(sourceGroup(23,'outside20'));
assert(!sourceGroup(20,'outside20'));
for(const c of ['unranked','deep','outside20'] as const){
 for(const q of [1,3] as const){
  const fixed=selectAuxEmbudo({historical:hist,physical,forms,
   category:c,quota:q,seed:'2026-10-30|Nocturno'});
  assert.equal(fixed.families.length,10);
  assert.equal(new Set(fixed.families).size,10);
  assert(fixed.families.slice(0,10-q).every((x,i)=>x===name(i)));
  assert(fixed.admissions.every(x=>sourceGroup(x.originalRank,c)));
  assert(fixed.families.every(x=>physical.includes(x)));
  const random=selectAuxEmbudo({historical:hist,physical,forms,
   category:c,quota:q,seed:'2026-10-30|Nocturno|neutral',neutral:true});
  assert.equal(random.admissions.length,fixed.admissions.length);
  assert.equal(random.families.length,fixed.families.length);
  assert(random.admissions.every(x=>sourceGroup(x.originalRank,c)));
 }
}
const chosen=selectAuxEmbudo({historical:hist,physical,forms,
 category:'unranked',quota:3,seed:'fixed'});
assert.deepEqual(chosen.admissions.map(x=>x.family),[name(33),name(31),name(32)]);
assert.deepEqual(chosen.dropped,[name(7),name(8),name(9)]);
const deep=selectAuxEmbudo({historical:hist,physical,forms,
 category:'deep',quota:3,seed:'fixed'});
assert.deepEqual(deep.admissions.map(x=>x.family),[name(29),name(28),name(24)]);
const zero=selectAuxEmbudo({historical:hist,physical:physical.slice(0,30),
 forms:forms.filter(f=>Number(f.family.slice(0,3))<30),category:'unranked',
 quota:3,seed:'fixed'});
assert.equal(zero.admissions.length,0);
assert.deepEqual(zero.families,hist.slice(0,10).map(x=>x.family));
const noFuture=selectAuxEmbudo({historical:hist,physical,forms,
 category:'outside20',quota:3,seed:'fixed'});
assert.deepEqual(noFuture.admissions.map(x=>x.family),[name(33),name(29),name(31)]);
console.log('LAB_AUX_EMBUDO_TEST_OK');
