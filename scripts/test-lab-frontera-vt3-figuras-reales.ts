import assert from 'node:assert/strict';
import {physicalShape,analyzeNonAdmitted,compareFeatures} from './lab-frontera-vt3-figuras-reales';
import type {MarkedShape} from './lab-frontera-vt3-figuras-reales';
const a=['0:0','1:0','2:1'];
assert.equal(physicalShape(a),physicalShape([...a].reverse()));
assert.notEqual(physicalShape(a),physicalShape(['0:0','1:1','2:1']));
const old:MarkedShape={date:'2026-10-13',turn:'Previa',head:'1234',
 jur:'Ciudad',source:'prevNocturno',cells:['3:0','4:0','5:1'],
 shape:physicalShape(a)};
const intra={...old,date:'2026-10-14',turn:'Primera' as const,
 source:'Previa' as const};
const physically=new Map([
 ['123/321',{family:'123/321',sources:['Previa' as const],paths:[
  {source:'Previa' as const,cells:a,value:'123'}]}],
 ['456/654',{family:'456/654',sources:['prevNocturno' as const],paths:[
  {source:'prevNocturno' as const,cells:['0:0','1:1','2:1'],value:'456'}]}],
 ['891/198',{family:'891/198',sources:['Previa' as const],paths:[
  {source:'Previa' as const,cells:['0:1','1:1','2:0'],value:'891'}]}]
]);
const rows=analyzeNonAdmitted({physical:physically,admitted:new Set(['456/654']),
 winnerFamilies:['123/321'],historical:[old,old],earlierToday:[intra],
 newestSource:'Previa'});
assert.equal(rows.length,2);
const win=rows.find(x=>x.family==='123/321')!;
assert.ok(win.onlyLatestSource);
assert.equal(win.hit,1);
assert.ok(win.historyOtherSource);
assert.ok(!win.historySameSource);
assert.ok(win.earlierTodayShape);
assert.equal(win.historicalEventCount,1,'Dos rutas de misma cabeza no son dos confirmaciones');
const neg=rows.find(x=>x.family==='891/198')!;
assert.equal(neg.hit,0);
assert.equal(neg.historyAnySource,false);
const controls=compareFeatures(rows);
assert.equal(controls.historyAnySource.positive,1);
assert.equal(controls.historyAnySource.positiveHeads,1);
assert.equal(controls.historyAnySource.neutralExpected,0.5);
assert.equal(controls.historyAnySource.matchedExpected,0.5);
console.log('OK: forma reversible, cabeza comprobada, negativo físico, no duplicación de eventos y neutralidad por PRE');
