import {strict as assert} from 'node:assert';
import {comparePrediction,rowsForModel,hitsForFamily,familyKey}
 from '../src/predictionParallel';
import type {LaloView} from '../src/motorLalo';
import type {IntegralPrediction} from '../src/motorLaloIntegral';

// Datos sintéticos: los Tops salen ANTES; las cabezas se inyectan SOLO al
// cotejador POST y jamás pueden modificar rangos o crear una familia.
const original={
 date:'2026-10-20',target:'Nocturno',
 ranks:{
 vt2:[{family:'12/21',rank:1,paths:[],rationale:'',state:'EN_FORMACIÓN'},
  {family:'03/30',rank:2,paths:[],rationale:'',state:'EN_FORMACIÓN'}],
 vt3:[{family:'097/790',rank:1,paths:[],rationale:'',state:'EN_FORMACIÓN'},
  {family:'125/521',rank:2,paths:[],rationale:'',state:'EN_FORMACIÓN'}],
 vt4:[{family:'3226/3622',rank:1,paths:[
  {value:'3226',sourceId:'Previa'}],rationale:'',state:'EN_FORMACIÓN'}]
 }
} as unknown as LaloView;
const integral={
 date:'2026-10-20',turn:'Nocturno',baseline:original,
 ranks:{
 2:[{family:'21/12',rank:1,values:['12','21'],laloRank:1,auxRank:1,
 evidence:'DOS_HOJAS',plus11Sources:['Previa'],auxSources:['Primera'],
 auxCrossTurn:true,rootEvents:3,d1Roots:2,d7Roots:1}],
 3:[{family:'697/796',rank:1,values:['697','796'],laloRank:null,auxRank:1,
 evidence:'AUX',plus11Sources:[],auxSources:['Previa','Primera'],
 auxCrossTurn:true,rootEvents:2,d1Roots:1,d7Roots:1}],
 4:[{family:'3622/3226',rank:1,values:['3226'],laloRank:1,auxRank:2,
 evidence:'DOS_HOJAS',plus11Sources:['Previa'],auxSources:['Matutino'],
 auxCrossTurn:false,rootEvents:1,d1Roots:1,d7Roots:0}]
 }
} as unknown as IntegralPrediction;
const heads=[{jur:'Ciudad',head:'2697'},{jur:'Provincia',head:'3226'},
 {jur:'Córdoba',head:'6223'},{jur:'Santa Fe',head:'0012'},
 {jur:'Montevideo',head:'----'}];
assert.equal(familyKey('21/12'),familyKey('12/21'));
assert.equal(familyKey('3622/3226'),familyKey('3226/3622'));
const vt2=comparePrediction(original,integral,heads,3).find(x=>x.kind==='vt2')!;
assert.equal(vt2.shared.length,1);
assert.equal(vt2.shared[0].lalo,1);
assert.equal(vt2.shared[0].integral,1);
assert(vt2.winning.some(x=>x.head==='0012'&&x.lalo===1&&x.integral===1));
const vt3=comparePrediction(original,integral,heads,3).find(x=>x.kind==='vt3')!;
assert(vt3.winning.some(x=>x.head==='2697'&&x.lalo===null&&x.integral===1));
assert.equal(vt3.shared.length,0,'no inventar coincidencia entre motores');
const vt4=comparePrediction(original,integral,heads,3).find(x=>x.kind==='vt4')!;
assert.equal(vt4.shared.length,1,'VT4 madre reversible, sin invertir cuaterna');
assert(vt4.winning.some(x=>x.head==='3226'&&x.lalo===1&&x.integral===1));
assert(!vt4.winning.some(x=>x.head==='6223'), 'no inventar VT4 invirtiendo el número completo');
assert.equal(hitsForFamily(rowsForModel('integral','vt4',original,integral)[0],heads).length,1);
const before=JSON.stringify({original,integral});
comparePrediction(original,integral,[{jur:'Ciudad',head:'----'}],5);
comparePrediction(original,integral,heads,10);
assert.equal(JSON.stringify({original,integral}),before,'POST no muta TOPS PRE');
console.log('PARALELO_TEST_OK',JSON.stringify({
 checks:12,sharedVT2:vt2.shared[0].family,headBothVt2:'0012',
 auxVt3:'2697',physicalVt4:'3226',invertedWrong:'6223'
}));
