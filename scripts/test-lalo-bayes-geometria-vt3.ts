import assert from 'node:assert/strict';
import {featuresFor,trainEvidence,smoothedLift,geoFactor,selectBayes}
 from '../src/labLaloBayesGeometriaVT3';
import type {LabeledFamily} from '../src/labLaloBayesGeometriaVT3';
import type {PhysicalAnatomy} from '../src/labLaloAnatomiaSinPuestoVT3';
const physical:PhysicalAnatomy={
 family:'123/321',pathCount:1,sourceCount:1,shapes:1,
 frontier:'SOLO_NUEVA',multiplicity:'UN_CAMINO',members:2,
 expectedHeadHitsPerJur:0.002,sourceIds:['Matutino']
};
const a=featuresFor(physical,null,null);
assert.deepEqual(a,{original:'UNRANKED',form:'OUTSIDE',frontier:'ONLY_NEW',paths:'ONE'});
const b=featuresFor({...physical,pathCount:4,frontier:'NUEVA_Y_ANTIGUAS'},11,15);
assert.deepEqual(b,{original:'11_20',form:'11_30',frontier:'BOTH',paths:'MULTI'});
const rows:LabeledFamily[]=[];
for(let i=0;i<40;i++){
 rows.push({family:'123/321',members:2,features:a,hits:i===0?1:0,heads:5});
 rows.push({family:'888/888',members:1,features:b,hits:0,heads:5});
}
const evidence=trainEvidence(rows);
assert.equal(evidence.original.UNRANKED.exposures,40);
assert.equal(evidence.original.UNRANKED.observed,1);
assert(Math.abs(evidence.original.UNRANKED.expected-0.4)<1e-6);
assert(smoothedLift({expected:1,observed:3,exposures:5})>1);
assert.equal(smoothedLift({expected:0,observed:10000,exposures:1}),1.25);
assert.equal(smoothedLift({expected:10000,observed:0,exposures:1}),0.75);
assert(geoFactor(a,evidence)>0);
const candidates=Array.from({length:12},(_,i)=>({
 family:String(i).padStart(3,'0')+'/'+String(i).padStart(3,'0'),
 members:i%3===0?1 as const:2 as const,
 features:i%2?a:b,
 freq30:i%4,trainingN:750
}));
const p1=selectBayes(candidates,evidence,'test','HISTORIA_Y_GEOMETRIA');
const p2=selectBayes(candidates,evidence,'test','GEOMETRIA_CALIBRADA');
assert.equal(p1.length,10);
assert.equal(p2.length,10);
assert.equal(new Set(p1).size,10);
assert.deepEqual(p1,selectBayes(candidates,evidence,'test','HISTORIA_Y_GEOMETRIA'));
assert(p1.every(f=>candidates.some(x=>x.family===f)));
assert.throws(()=>selectBayes([...candidates,candidates[0]],evidence,'test','GEOMETRIA_CALIBRADA'),/duplicados/);
console.log('LALO_BAYES_GEOMETRIA_TEST_OK');
