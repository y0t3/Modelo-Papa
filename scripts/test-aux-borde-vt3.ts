import assert from 'node:assert/strict';
import {borderScore,borderTop10,borderNeutral}
 from '../src/labAuxBorderSwapsVT3';
import type {BorderEvidence} from '../src/labAuxBorderSwapsVT3';
const base:BorderEvidence={
 family:'000/000',rank:1,roots:4,d1:2,d7:2,physicalSites:2,crossingSites:0,
 exactEvents:0,exactDays:0,shiftEvents:0,shiftDays:0,historyDays:0,
 eventCount:0,distinctDays:0,latestDayEvents:0,maxDayEvents:0,
 concentration:0,effectiveDays:0,dayHistogram:[]
};
const ranks:Array<BorderEvidence>=Array.from({length:20},(_,i)=>({
 ...base,family:String(i).padStart(3,'0'),rank:i+1
}));
const high=ranks[10];
ranks[10]={...high,distinctDays:4,exactDays:2,crossingSites:2,shiftDays:3};
const existing=ranks[9];
ranks[9]={...existing,distinctDays:0,exactDays:0,crossingSites:0};
const p=borderTop10(ranks,'one');
assert.equal(p.selected.length,10);
assert.equal(p.swaps.length,1);
assert.equal(p.swaps[0].in,ranks[10].family);
assert.equal(p.swaps[0].out,ranks[9].family);
assert.equal(p.swaps[0].inRank,11);
assert(p.swaps[0].margin>=1);
assert(ranks.slice(0,7).every(x=>p.selected.includes(x.family)));
const p2=borderTop10(ranks,'two');
assert(p2.swaps.length>=p.swaps.length&&p2.swaps.length<=2);
for(const value of [p,p2]){
 assert.equal(new Set(value.selected).size,10);
 assert(value.selected.every(f=>ranks.some(z=>z.family===f)));
 assert(value.swaps.every(z=>z.inRank>=11&&z.inRank<=13&&
  z.outRank>=8&&z.outRank<=10));
}
const ctrl=borderNeutral(ranks,p2.swaps.length,'base|AUX_AYER|Nocturno');
assert.equal(ctrl.swaps.length,p2.swaps.length);
assert.equal(ctrl.selected.length,10);
assert.equal(new Set(ctrl.selected).size,10);
assert(ranks.slice(0,7).every(x=>ctrl.selected.includes(x.family)));
const scarce=ranks.map(x=>x.rank===11?{...x,roots:1}:x);
assert(!borderTop10(scarce,'one').swaps.some(x=>x.inRank===11),
 'No promover familia con tres raices menos que la excluida');
const limited=borderTop10(ranks.slice(0,19),'one');
assert.equal(limited.swaps.length,0);
assert.deepEqual(limited.selected,ranks.slice(0,10).map(x=>x.family));
assert.equal(borderScore(ranks[10]),borderScore({...ranks[10]}));
console.log('LAB_AUX_BORDER_SWAP_TEST_OK');
