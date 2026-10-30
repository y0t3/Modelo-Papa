import assert from 'node:assert/strict';
import type {LaloView,LaloRoute,LaloFamily} from '../src/motorLalo';
import {vt2InsideVt3PRE,evaluateEmbeddedVt2POST,equalBudgetPOST}
 from '../src/labVt3SufijosVt2';
const make=(reading:string,rank:number,row:number):LaloFamily=>{
 const path=reading.split('').map((digit,i)=>({digit,row:row+i%2,col:i%2}));
 // For 513: (0,0)->(1,1)->(0,0) repeats! use (0,0)->(1,1)->(0,1)
 const coords=[{row:row,col:0},{row:row+1,col:1},{row:row,col:1}];
 const route={kind:'vt3',family:[reading,[...reading].reverse().join('')].sort().join('/'),
  sourceId:'Previa',value:reading,origin:'BIFURCACIÓN',rootIds:[],
  path:coords.map((p,i)=>({...p,digit:reading[i]}))} as LaloRoute;
 return {kind:'vt3',family:route.family,rank,paths:[route],
  sourceCount:1,directRoots:0,d7Roots:0,d1Roots:0,
  physicalBlocks:1,branchBlocks:1,parentFamilies:[],state:'EN_FORMACIÓN',rationale:''};
};
const vt3=[make('513',1,0),make('813',2,3)];
const top2=['15/51','23/32','45/54','67/76','89/98','11/11',
 '22/22','33/33','44/44','55/55'].map((family,i)=>({
 ...make('123',i+1,0),kind:'vt2' as const,family,rank:i+1,paths:[]
}));
const all2=[...top2,
 {...top2[0],family:'13/31',rank:11},
 {...top2[0],family:'18/81',rank:12},
 {...top2[0],family:'06/60',rank:13},
 {...top2[0],family:'07/70',rank:14}
];
const view={date:'2026-10-29',target:'Nocturno',
 status:'EXPERIMENTAL_SIN_VALIDACIÓN',roots:[],
 ranks:{vt2:all2,vt3,vt4:[]}} as LaloView;
const pre=vt2InsideVt3PRE(view);
assert(pre.derived.some(x=>x.family==='13/31'));
assert(pre.derived.some(x=>x.family==='15/51'));
assert(pre.derived.some(x=>x.family==='18/81'));
assert(!pre.derived.some(x=>x.family==='53/35'),
 'No saltar primera y tercera casilla');
assert(pre.missingFromVt2Top.some(x=>x.family==='13/31'&&x.allVt2Rank===11));
assert(pre.missingFromVt2Top.every(x=>x.edges.every(e=>
 e.cells.length===2&&e.cells.every(c=>/^[0-9]$/.test(c.digit)))));
const heads=[{jur:'Santa Fé',head:'2813'},{jur:'Ciudad',head:'5318'},
 {jur:'Córdoba',head:'0051'}];
const post=evaluateEmbeddedVt2POST(pre,heads);
assert.equal(post.heads,3);
assert.equal(post.extraWins,2);
assert.equal(post.bothWins,1);
assert.equal(post.vt3ExactWins,2);
assert.equal(post.hiddenInsideVt2All,2);
const controls=equalBudgetPOST(pre,all2,heads,[3]);
assert.equal(controls[0].focusHitHeads,2);
assert.equal(controls[0].controlHitHeads,0);
assert.equal(controls[0].controlSize,2);
const none=evaluateEmbeddedVt2POST(pre,[]);
assert.equal(none.extraWins,0);
console.log('VT3_VT2_SUFIX_TEST_OK');
