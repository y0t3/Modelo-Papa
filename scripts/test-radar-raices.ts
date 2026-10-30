import assert from 'node:assert/strict';
import {winnerRoots,evidenceForFigure,strongestEvidence} from '../src/labRadarRaicesGanadoras';
import {figuresInTop} from '../src/labRadarFiguras';
const route=[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'3'}];
const sheet=(head:string,jur:string)=>({
 columns:[{id:'prevNocturno',turno:'Previa',sourceLabel:'anterior',values:['13','--','--','--','--','--']}],
 heads:{Nocturno:[head]},
 matches:{Nocturno:[{turno:'Nocturno',jurisdiccion:jur,cabeza:head,
  hits:[{kind:'vt2',value:'13',sourceId:'prevNocturno',
   sourceTurn:'Nocturno',paths:[route,route]}]}]}
});
const roots=[...winnerRoots('2026-10-22',sheet('9813','Ciudad') as any),
 ...winnerRoots('2026-10-23',sheet('2813','Provincia') as any)];
assert.equal(roots.length,2);
const f=figuresInTop([{
 date:'2026-10-29',turn:'Nocturno',board:'PLUS11',engine:'LALO',rank:7,
 kind:'VT2',source:'prevNocturno',family:'13/31',reading:'13',
 cells:route.map(x=>({row:x.row,col:x.col}))
}])[0];
const stats=evidenceForFigure(f,roots);
assert.equal(stats.winnerDays,2);
assert.equal(stats.exactEvents,2);
assert.equal(strongestEvidence(f,roots),'HUELLA_REITERADA');
assert.equal(evidenceForFigure({...f,board:'AUX_HOY'},roots).winnerEvents,0);
console.log('RAICES_GANADORAS_TEST_OK');
