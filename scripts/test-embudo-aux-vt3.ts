import assert from 'node:assert/strict';
import {auxiliaryBoard,collectAuxFamilies,emptyAuxiliaryHeads,auxFamily}
 from '../src/auxSantiagoNeuquen';
import {evaluateAuxVt3Funnel,summarizeAuxVt3Funnel}
 from '../src/labEmbudoAuxVT3';
import type {AuxRank} from '../src/motorLaloIntegral';
const raw=emptyAuxiliaryHeads();
raw.Previa={Santiago:'1234',Neuquen:'5678'};
const board=auxiliaryBoard(raw,'Primera');
const families=collectAuxFamilies(board,3).map((x,i)=>({
 family:x.family,rank:i+1,values:x.values,
 paths:x.paths,roots:1,d1:1,d7:0,
 crossing:x.crossTurnPaths>0,sources:x.turnSources,mother:null
} as AuxRank));
assert(families.length>10);
const chosen=families[0],vt3=chosen.values[0];
const alternative=families.at(-1)!;
const rank=[chosen,{...alternative,rank:11}];
const absent=['999','000','888'].find(x=>!families.some(f=>f.family===auxFamily(x)))!;
const heads=[
 {jur:'Ciudad',head:'1'+vt3},
 {jur:'Provincia',head:'1'+alternative.values[0]},
 {jur:'Córdoba',head:'1'+absent},
 {jur:'Santa Fe',head:'----'}];
const out=evaluateAuxVt3Funnel(board,rank,heads);
assert.equal(out.heads,3);
assert.equal(out.physicalHeadHits,2);
assert.equal(out.projectedHeadHits,2);
assert.equal(out.top10HeadHits,1);
assert.equal(out.rank11to20Hits,1);
assert.equal(out.impossibleHeadHits,1);
assert.equal(out.physicalUnrankedHeadHits,0);
const other=families.find(f=>!rank.some(x=>x.family===f.family))!;
const out2=evaluateAuxVt3Funnel(board,rank,[{jur:'Ciudad',head:'1'+other.values[0]}]);
assert.equal(out2.physicalUnrankedHeadHits,1);
assert.equal(summarizeAuxVt3Funnel([out,out2]).formable,3);
assert.throws(()=>evaluateAuxVt3Funnel(board,
 [{...chosen,family:auxFamily(absent)}],[]),/no físicamente/);
const empty=evaluateAuxVt3Funnel(auxiliaryBoard(emptyAuxiliaryHeads(),'Previa'),[],
 [{jur:'Ciudad',head:'2813'}]);
assert.equal(empty.impossibleHeadHits,1);
console.log('EMBUDO_VT3_AUX_TEST_OK');
