import {strict as assert} from 'node:assert';
import {diaVacio} from '../src/domain';
import {emptyAuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from '../src/motorLaloAuxiliar';
import {rowsForModel,comparePrediction,familyKey,hitsForFamily}
 from '../src/predictionParallel';
import type {LaloView} from '../src/motorLalo';
import type {AuxiliarView} from '../src/motorLaloAuxiliar';

// Única entrada del motor auxiliar = hoja RAW y sus marcas POST anteriores.
const raw=emptyAuxiliaryHeads();
raw.Previa.Santiago='8067';raw.Previa.Neuquen='0469';
raw.Primera.Santiago='6142';raw.Primera.Neuquen='0245';
raw.Matutino.Santiago='9634';raw.Matutino.Neuquen='0210';
const drawn=diaVacio();drawn.Nocturno.Ciudad='2697';
const old=extractAuxiliarHistory('2026-10-19',raw,drawn);
const refs=[{date:'2026-10-19',period:'D−1' as const,aux:old}];
assert(old.events[3].some(x=>x.head==='2697'));
const pred=buildMotorLaloAuxiliar('2026-10-20','Nocturno',raw,refs);
assert(pred.ranks[3].length>0);
assert(pred.ranks[2].length>0);
assert.equal(buildMotorLaloAuxiliar('2026-10-20','Previa',raw,refs).ranks[3].length,0);
const altered=structuredClone(raw);altered.Matutino.Santiago='9999';
altered.Matutino.Neuquen='9999';
const p1=buildMotorLaloAuxiliar('2026-10-20','Matutino',raw,refs);
const p2=buildMotorLaloAuxiliar('2026-10-20','Matutino',altered,refs);
assert.deepEqual(p1.ranks,p2.ranks,
 'El PRE de Matutino no incluye la cabeza Matutina auxiliar');
assert.throws(()=>buildMotorLaloAuxiliar('2026-10-20','Nocturno',raw,
 [{...refs[0],date:'2026-10-20'}]),/Fuga temporal/);
for(const n of [2,3,4] as const){
 for(const f of pred.ranks[n]){
  assert(f.values.length>0);
  assert(f.values.every(v=>v.length===n));
  assert(f.roots>0);
  if(n===4)assert(pred.ranks[3].slice(0,10).some(x=>x.family===f.mother));
 }
}
// TOPS INDEPENDIENTES, comparación de familias normalizadas: 
const original={
 ranks:{
 vt2:[{family:'12/21',rank:1,paths:[],d1Roots:1,d7Roots:0,rationale:''}],
 vt3:[{family:'097/790',rank:1,paths:[],d1Roots:1,d7Roots:0,rationale:''}],
 vt4:[{family:'3226/3622',rank:1,paths:[{value:'3226',sourceId:'Previa'}],
   d1Roots:1,d7Roots:0,rationale:''}]
 }
} as unknown as LaloView;
const aux={
 date:'2026-10-20',turn:'Nocturno',ranks:{
 2:[{family:'21/12',rank:1,values:['12','21'],roots:1,d1:1,d7:0,
     paths:2,crossing:true,sources:['Previa']}],
 3:[{family:'697/796',rank:1,values:['697','796'],roots:1,d1:1,d7:0,
     paths:2,crossing:true,sources:['Previa','Primera']}],
 4:[{family:'3622/3226',rank:1,values:['3226'],roots:1,d1:1,d7:0,
     paths:2,crossing:false,sources:['Matutino']}]
 }} as unknown as AuxiliarView;
const heads=[{jur:'Ciudad',head:'2697'},{jur:'Provincia',head:'3226'},
 {jur:'Córdoba',head:'6223'},{jur:'Santa Fe',head:'0012'}];
const originalBefore=JSON.stringify(original);
const auxBefore=JSON.stringify(aux);
const result=comparePrediction(original,aux,heads,3);
const vt2=result.find(x=>x.kind==='vt2')!;
assert.equal(vt2.shared.length,1);
assert.equal(vt2.shared[0].family,'12/21');
assert(vt2.shared[0].heads.some(x=>x.head==='0012'));
const vt3=result.find(x=>x.kind==='vt3')!;
assert(vt3.winning.some(x=>x.head==='2697'&&x.lalo===null&&x.auxiliar===1));
const vt4=result.find(x=>x.kind==='vt4')!;
assert.equal(vt4.shared.length,1,'Coincidencia de familia VT4 correcta');
assert(vt4.shared[0].heads.some(x=>x.head==='3226'));
assert(!vt4.shared[0].heads.some(x=>x.head==='6223'),
 'VT4 no invierte toda la cifra para inventar ganadores');
assert(vt4.winning.some(x=>x.head==='3226'&&x.lalo===1&&x.auxiliar===1));
assert(!vt4.winning.some(x=>x.head==='6223'));
assert.equal(hitsForFamily(rowsForModel('auxiliar','vt4',original,aux)[0],heads).length,1);
assert.equal(familyKey('3622/3226'),familyKey('3226/3622'));
comparePrediction(original,aux,[{jur:'Ciudad',head:'----'}],10);
assert.equal(JSON.stringify(original),originalBefore,'MV1 nunca cambia de ranking');
assert.equal(JSON.stringify(aux),auxBefore,'AUX nunca cambia de ranking');
console.log('PARALELO_AUX_TEST_OK',JSON.stringify({
 independentAUX:true,preCensor:true,vt2FamilyShared:vt2.shared[0].family,
 auxVt3Winner:'2697',vt4Exactly:'3226',noFalseWinner:'6223'
}));
