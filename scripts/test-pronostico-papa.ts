import assert from 'node:assert/strict';
import {TURNOS,diaVacio} from '../src/domain';
import type {DailySheet,SheetColumn} from '../src/sheet';
import type {PapaPick,PapaRecord} from '../src/papaPronostico';
import {addDraftPick,buildPre,draftPick,evaluatePapa,hasObserved,isPhysicalPath,
 observedHeads,pathText,uniqueWagers,validateSnapshot,weekEnd,weeklySummary,weekStart} from '../src/papaPronostico';
const names:SheetColumn['id'][]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const board:DailySheet={
 columns:names.map((id,i)=>({id,sourceLabel:id,turno:TURNOS[i],
  values:i===0?['76','48','93','21','34','56']:['--','--','--','--','--','--']})),
 heads:{},matches:{}
};
const pair=[{row:0,col:0},{row:0,col:1}];
const triple=[...pair,{row:1,col:1}];
const quadruple=[...triple,{row:2,col:1}];
assert.ok(isPhysicalPath(pair));
assert.ok(isPhysicalPath(triple));
assert.ok(isPhysicalPath(quadruple));
assert.ok(!isPhysicalPath([{row:0,col:0},{row:2,col:0}]));
assert.ok(!isPhysicalPath([{row:0,col:0},{row:0,col:0}]));
assert.ok(!isPhysicalPath([pair[0]]));
assert.equal(pathText(triple),'1I → 1D → 2D');
const vt2=draftPick(board,'Previa','prevNocturno',pair);
const vt3=draftPick(board,'Previa','prevNocturno',triple);
const vt4=draftPick(board,'Previa','prevNocturno',quadruple);
assert.equal(vt2.value,'76');assert.equal(vt2.family,'67/76');
assert.equal(vt3.value,'768');assert.equal(vt3.family,'768/867');
assert.equal(vt4.value,'7683');
assert.equal(vt4.family,'7683','VT4 nunca invierte la cuaterna completa');
assert.equal(vt4.motherVt3,'768/867','La madre VT3 se registra separadamente');
assert.throws(()=>draftPick(board,'Previa','Previa',pair),/todavía/);
assert.throws(()=>draftPick(board,'Previa','prevNocturno',[
 {row:0,col:0},{row:2,col:0}]),/contiguas/);
const reverseVt3=draftPick(board,'Previa','prevNocturno',[...triple].reverse());
assert.equal(reverseVt3.family,vt3.family);
const paths=addDraftPick(addDraftPick([vt2,vt3,vt4],vt3),reverseVt3);
assert.equal(paths.length,4,'Un camino idéntico no se duplica; otro testigo se conserva');
assert.equal(uniqueWagers(paths).vt3.size,1,'Dos testigos de la misma familia son una jugada');
const snapshot=buildPre({date:'2026-10-14',turn:'Previa',picks:paths},board,'2026-10-14T10:00:00Z');
assert.ok(validateSnapshot(snapshot));
assert.equal(snapshot.pre.sources.length,1);
const before=JSON.stringify(snapshot);
const observed={...snapshot,pre:{...snapshot.pre,picks:[
 {...snapshot.pre.picks[0],value:'00'},...snapshot.pre.picks.slice(1)
]}};
assert.ok(!validateSnapshot(observed),'La mutación de un PRE bloqueado debe detectarse');
const preRecord:PapaRecord={snapshot};
const actual:PapaRecord={snapshot,post:{
 checkedAt:'2026-10-14T15:00:00Z',
 heads:{Ciudad:'1276',Provincia:'3768',Córdoba:'7683'}
}};
assert.equal(evaluatePapa(preRecord).jurisdictions,0);
const e=evaluatePapa(actual);
assert.equal(e.jurisdictions,3);
assert.deepEqual(e.wagers,{vt2:1,vt3:1,vt4:1});
assert.deepEqual(e.hits,{vt2:1,vt3:1,vt4:1});
assert.equal(e.winnerDetails.length,3);
assert.equal(e.correctTurns.vt3,true);
assert.equal(weekStart('2026-10-14'),'2026-10-12');
assert.equal(weekEnd('2026-10-12'),'2026-10-18');
const summary=weeklySummary([actual], '2026-10-14');
assert.equal(summary.records,1);assert.equal(summary.checkedTurns,1);
assert.equal(summary.headsCompared,3);
assert.equal(summary.hit.vt2,1);assert.equal(summary.hit.vt3,1);
assert.equal(summary.hit.vt4,1);
assert.equal(weeklySummary([actual],'2026-10-19').records,0);
const heads=diaVacio();
heads.Previa.Ciudad='1276';
assert.ok(hasObserved(heads,'Previa'));
assert.deepEqual(observedHeads(heads,'Previa'),{Ciudad:'1276'});
assert.equal(hasObserved(heads,'Primera'),false);
assert.equal(JSON.stringify(snapshot),before,'El POST nunca debe alterar la selección PRE');
console.log('PAPA_PERSONAL_OK: rutas físicas, familias VT2 VT3, VT4 exacto, PRE, POST, semana y deduplicación.');
