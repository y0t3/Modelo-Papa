import assert from 'node:assert/strict';
import {enumerateFigures,winningFigures,moveWinnerFigures,
 evaluateAgainstShapeControl,matchesSuffix} from '../src/labWinningFootprintTransfer';
import type {DailySheet} from '../src/sheet';
const blank=['--','--','--','--','--','--'];
const column=(id:'prevNocturno'|'Previa',values:string[])=>({
 id,turno:id==='prevNocturno'?'Previa' as const:'Primera' as const,
 sourceLabel:id,values
});
const path=[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'2'}];
const past:DailySheet={
 columns:[column('prevNocturno',['12','34',...blank.slice(2)]),
 column('Previa',['56','78',...blank.slice(2)])],
 matches:{Previa:[],Primera:[],Matutino:[],Vespertino:[],
 Nocturno:[{turno:'Nocturno',jurisdiccion:'Ciudad',cabeza:'9912',
 hits:[{kind:'vt2',value:'12',sourceId:'prevNocturno',
 sourceTurn:'Nocturno anterior',paths:[path]}]}]},
 heads:{Previa:[],Primera:[],Matutino:[],Vespertino:[],Nocturno:['9912']}
};
const current:DailySheet={
 columns:[column('prevNocturno',['98','76',...blank.slice(2)]),
 column('Previa',['54','32',...blank.slice(2)])],
 matches:{Previa:[],Primera:[],Matutino:[],Vespertino:[],Nocturno:[]},
 heads:{Previa:[],Primera:[],Matutino:[],Vespertino:[],Nocturno:[]}
};
const historical=winningFigures(past,'2026-10-22',2);
assert.equal(historical.length,1);
assert.equal(historical[0].path.map(p=>p.digit).join(''),'12');
const all=enumerateFigures(current,2);
assert(all.every(f=>f.path.length===2));
const exact=moveWinnerFigures(historical,all,'MISMO_SITIO');
assert.equal(exact.selected.length,1);
assert.equal(exact.selected[0].fig.value,'98');
assert(matchesSuffix(exact.selected[0].fig,'5498',2));
assert(matchesSuffix(exact.selected[0].fig,'5489',2));
assert(!matchesSuffix(exact.selected[0].fig,'5423',2));
const vertical=moveWinnerFigures(historical,all,'VERTICAL_1');
assert.equal(vertical.selected.length,1);
assert.equal(vertical.selected[0].fig.value,'76');
const source=moveWinnerFigures(historical,all,'FUENTE_VECINA');
assert.equal(source.selected.length,1);
assert.equal(source.selected[0].fig.source,'Previa');
assert.equal(source.selected[0].fig.value,'54');
const combined=moveWinnerFigures(historical,all,'SITIO_O_VERTICAL');
assert.equal(combined.selected.length,2);
const evalExact=evaluateAgainstShapeControl(exact.selected.map(x=>x.fig),all,
 ['5498','5476','5401'],2);
assert.equal(evalExact.observed,1);
assert(evalExact.expected>=0&&evalExact.expected<=3);
const changed:DailySheet={...current,columns:current.columns.map(x=>({
 ...x,values:x.values.map(v=>/^[0-9]{2}$/.test(v)?'11':v)
}))};
const sameSites=moveWinnerFigures(historical,enumerateFigures(changed,2),'MISMO_SITIO');
assert.deepEqual(sameSites.selected.map(x=>x.fig.key),
 exact.selected.map(x=>x.fig.key),'Las figuras no deben depender de cifras actuales');
assert.equal(winningFigures(current,'2026-10-29',2).length,0,
 'No mirar resultados actuales');
console.log('WINNING_FOOTPRINT_TRANSFER_TEST_OK');
