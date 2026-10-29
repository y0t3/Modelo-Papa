import assert from 'node:assert/strict';
import {extendPlusVt2ToVt3,extendAuxVt2ToVt3,evaluateVt3} from '../src/labVt2Vt3Extension';
import type {DailySheet} from '../src/sheet';
import type {LaloView} from '../src/motorLalo';
import type {AuxiliarView} from '../src/motorLaloAuxiliar';
import {emptyAuxiliaryHeads} from '../src/auxSantiagoNeuquen';
const blank={Previa:[],Primera:[],Matutino:[],Vespertino:[],Nocturno:[]};
const sheet:DailySheet={
 columns:[
 {id:'prevNocturno',turno:'Previa',sourceLabel:'Nocturno anterior',
  values:['18','67','--','--','--','--']},
 {id:'Previa',turno:'Primera',sourceLabel:'Previa',
  values:['99','99','99','99','99','99']}
 ],
 matches:blank,heads:blank
};
const path=[
 {row:1,col:1,digit:'7'}, {row:1,col:0,digit:'6'}
];
const vt2={family:'67/76',rank:1,paths:[{
 sourceId:'prevNocturno',path,kind:'vt2',family:'67/76',
 value:'76',origin:'TRASLADO',rootIds:[]}],
 sourceCount:1,directRoots:1,d7Roots:1,d1Roots:0,physicalBlocks:1,
 branchBlocks:0,parentFamilies:[],state:'EN_SEGUIMIENTO',
 rationale:'test'
};
const lalo:LaloView={
 date:'2026-10-26',target:'Previa',status:'EXPERIMENTAL_SIN_VALIDACIÓN',
 roots:[],ranks:{vt2:[vt2] as LaloView['ranks']['vt2'],vt3:[],vt4:[]}
};
for(const mode of ['RONDAS','CUADRADO','FUENTES'] as const){
 const result=extendPlusVt2ToVt3(sheet,lalo,mode);
 assert(result.candidates.some(x=>x.traces.some(t=>t.value==='876'&&
  t.source==='prevNocturno'&&t.cells.length===3)));
 assert(!result.candidates.some(x=>x.traces.some(t=>t.source==='Previa')));
 assert.equal(new Set(result.top10.map(x=>x.family)).size,result.top10.length);
 const check=evaluateVt3(result,['1876'],10);
 assert.equal(check.byFamily,1);
 assert.equal(check.exactPhysical,1);
}
const aux=emptyAuxiliaryHeads();
aux.Previa.Santiago='0001'; aux.Primera.Santiago='2300';
const auxView:AuxiliarView={
 date:'2026-10-26',turn:'Previa',status:'LABORATORIO',
 statement:'test',
 ranks:{2:[{family:'12/21',rank:1,mother:null,values:['12','21'],
  roots:1,d1:1,d7:0,paths:1,crossing:true,sources:['Previa','Primera']}],
  3:[],4:[]}
};
const built=extendAuxVt2ToVt3('2026-10-26','Previa',aux,auxView);
assert(built.candidates.some(x=>x.traces.some(t=>t.value==='321'&&
 t.cells[0].col===5&&t.cells[1].col===4&&t.cells[2].col===3)),
 'Debe preservar cruce físico Previa→Primera en AUX');
assert.throws(()=>extendAuxVt2ToVt3('2026-10-27','Previa',aux,auxView),
 /Vista AUX no corresponde/);
assert.equal(new Set(built.top10.map(x=>x.family)).size,built.top10.length);
console.log('VT2_VT3_TEST_OK: prefijo real, corte PRE, rondas, deduplicación y cruce AUX');
