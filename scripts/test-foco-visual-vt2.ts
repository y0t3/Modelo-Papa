import assert from 'node:assert/strict';
import {findVisualFoci,evaluateFoci,previousPlusVt2Marks} from '../src/labVisualFocusVt2';
import type {Vt2Vt3Result,Vt2Vt3Trace} from '../src/labVt2Vt3Extension';
const mk=(parent:string,parentRank:number,value:string,source:string,
 coords:number[][]):Vt2Vt3Trace=>({
 board:'PLUS11',parent,parentRank,value,source,
 cells:coords.map(([row,col],i)=>({row,col,digit:value[i]})),squareReady:false
});
const a=mk('10/01',7,'510','prevNocturno',[[0,0],[1,0],[1,1]]);
const b=mk('23/32',1,'823','Previa',[[1,0],[2,0],[2,1]]);
const c=mk('45/54',2,'945','Previa',[[1,0],[3,0],[3,1]]);
const traces=[a,b,c];
const result:Vt2Vt3Result={
 board:'PLUS11',target:'Nocturno',date:'2026-10-29',mode:'RONDAS',
 candidates:traces.map((t,i)=>({family:t.value,rank:i+1,
 motherRank:t.parentRank,mothers:[t.parent],sourceCount:1,pathCount:1,
 squareReady:false,traces:[t]})),top10:[],motherCount:3
};
const moms=['23/32','45/54','10/01'];
const marks=[{
 date:'2026-10-27',turn:'Primera',jur:'Ciudad',head:'1510',
 source:'prevNocturno',cells:[{row:1,col:0,digit:'1'},{row:1,col:1,digit:'0'}]
},{
 date:'2026-10-26',turn:'Matutino',jur:'Provincia',head:'3510',
 source:'prevNocturno',cells:[{row:1,col:0,digit:'1'},{row:1,col:1,digit:'0'}]
}];
const f=findVisualFoci(result,moms,marks,'2026-10-29','SITIO_EXACTO',2);
assert.equal(f[0].family,'10/01','Debe poder seleccionar un #7 aunque hay primeras madres');
assert.equal(f[0].originalRank,3);
assert.equal(f[0].zone.sameDays,2);
assert.equal(f[0].zone.extensions[0],'510');
assert.equal(evaluateFoci(result,f,['4510']).exact,1);
assert.equal(evaluateFoci(result,f,['4510']).zoneExact,1);
assert.throws(()=>findVisualFoci(result,moms,[...marks,{...marks[0],date:'2026-10-29'}],
 '2026-10-29','SITIO_EXACTO',1),/Fuga temporal/);
assert.throws(()=>findVisualFoci(result,moms,marks,'2026-10-28','SITIO_EXACTO',1),
 /Fecha PRE inconsistente/);
assert.equal(previousPlusVt2Marks([{date:'2026-10-20',sheet:{
 columns:[],heads:{},matches:{Previa:[{turno:'Previa',jurisdiccion:'Ciudad',
 cabeza:'4510',hits:[{kind:'vt2',value:'10',sourceId:'prevNocturno',
 sourceTurn:'Nocturno anterior',paths:[[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'0'}]]}]}]}
 }}]).length,1);
console.log('FOCO_VISUAL_TEST_OK');
