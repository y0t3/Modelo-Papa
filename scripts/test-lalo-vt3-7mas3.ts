import assert from 'node:assert/strict';
import {selectLalo7mas3,poolAccept} from '../src/labLalo7mas3VT3';
import type {LaloFamily} from '../src/motorLalo';
import type {FormChoice} from '../src/motorFormasPrimero';
const family=(n:number)=>String(n).padStart(3,'0')+'/'+String(n).padStart(3,'0');
const ranks:Array<LaloFamily>=Array.from({length:31},(_,i)=>({
 kind:'vt3',family:family(i),rank:i+1,paths:[],sourceCount:1,
 directRoots:1,d7Roots:0,d1Roots:1,physicalBlocks:1,branchBlocks:1,
 parentFamilies:[],state:'EN_SEGUIMIENTO',rationale:'test'
}));
const choice=(i:number,r:number):FormChoice=>({
 family:family(i),rank:r,value:String(i).padStart(3,'0'),source:'prevNocturno',
 cells:[{row:0,col:0},{row:1,col:0},{row:2,col:0}],shape:'0:0>1:0>2:0',
 anchor:0,positionKey:'prevNocturno|test:'+i,
 support:{events:2,days:2,d1:true,d7:false,sameSource:1,nearby:2,
 sourceDistance:0,verticalDistance:0,roots:[]}
});
const forms=[choice(30,1),choice(28,2),choice(34,3),choice(26,4),
 choice(32,5),choice(21,6),choice(35,7),choice(9,8)];
assert(poolAccept(null,'unranked'));
assert(!poolAccept(12,'deep'));
assert(poolAccept(25,'deep'));
assert(!poolAccept(11,'outside20'));
for(const poolKind of ['deep','unranked','outside20'] as const)
 for(const quota of [1,3] as const){
  const out=selectLalo7mas3({ranks,forms,poolKind,quota,seed:'sample'});
  const nul=selectLalo7mas3({ranks,forms,poolKind,quota,seed:'sample',neutral:true});
  assert.equal(out.top.length,10);
  assert.equal(new Set(out.top).size,10);
  assert.equal(nul.top.length,10);
  assert.equal(nul.admissions.length,out.admissions.length);
  assert(out.admissions.every(x=>poolAccept(x.rankOriginal,poolKind)));
  assert(out.dropped.every(x=>!out.top.includes(x)));
  assert.deepEqual(out.top.slice(0,10-out.admissions.length),
   ranks.slice(0,10-out.admissions.length).map(x=>x.family));
 }
const d=selectLalo7mas3({ranks,forms,poolKind:'deep',quota:3,seed:'x'});
assert.deepEqual(d.admissions.map(x=>x.family),[family(30),family(28),family(26)]);
assert.deepEqual(d.dropped,[family(7),family(8),family(9)]);
const u=selectLalo7mas3({ranks,forms,poolKind:'unranked',quota:3,seed:'x'});
assert.deepEqual(u.admissions.map(x=>x.family),[family(34),family(32),family(35)]);
const partial=selectLalo7mas3({ranks:ranks.slice(0,7),forms:forms.slice(0,2),
 poolKind:'deep',quota:3,seed:'x'});
assert.equal(partial.top.length,7);
assert.equal(partial.admissions.length,0);
console.log('LAB_LALO_7MAS3_TEST_OK');
