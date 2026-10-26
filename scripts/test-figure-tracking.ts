import assert from 'node:assert/strict';
import {diaVacio,TURNOS} from '../src/domain';
import type {DailySheet,SheetColumn} from '../src/sheet';
import {reversibleFamily} from '../src/motorLalo';
import {shapeOf,buildFigureTracking} from '../src/figureTracking';
import type {TrackingAuxInput} from '../src/figureTracking';
import {emptyAuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import type {InfoVisualDay} from '../src/infoTurnHistory';

const older='2026-10-23',date='2026-10-24';
const values=['56','78','90','12','34','56'];
const valuesNow=['12','34','56','78','90','12'];
const p=[{row:0,col:0,digit:'5'},{row:0,col:1,digit:'6'},
 {row:1,col:0,digit:'7'}];
const next=[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'2'},
 {row:1,col:0,digit:'3'}];
assert.equal(shapeOf(p),shapeOf(next),'misma figura sin confundir cifras');
assert.equal(reversibleFamily('123'),'123/321');

const makeColumns=(v:string[]):SheetColumn[]=>TURNOS.map((t,i)=>({
 id:i===0?'prevNocturno':TURNOS[i-1] as SheetColumn['id'],
 turno:t,sourceLabel:t,values:i===0?Array(6).fill('--'):
 i===1?v:Array(6).fill('--')
}));
const previous:DailySheet={
 columns:makeColumns(values),
 heads:Object.fromEntries(TURNOS.map(t=>[t,t==='Primera'?['9567']:[]])),
 matches:Object.fromEntries(TURNOS.map(t=>[t,t==='Primera'?[{
  turno:t,jurisdiccion:'Ciudad',cabeza:'9567',hits:[{
   kind:'vt3',sourceId:'Previa',sourceTurn:'Previa',value:'567',paths:[p]
  }]
 }]:[]]))
};
const now:DailySheet={
 columns:makeColumns(valuesNow),
 heads:Object.fromEntries(TURNOS.map(t=>[t,t==='Primera'?['9123']:[]])),
 matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))
};
const day:InfoVisualDay={date:older,sheet:previous,heads:diaVacio()};
const before=JSON.stringify(now);
const historyBefore=JSON.stringify(previous);
const report=buildFigureTracking(date,'Primera',now,[day],null);
const family=report.records.find(x=>x.family==='123/321');
assert.ok(family,'recorrido actual físico válido');
assert.equal(family.recognized,false,'no inventar reconocimiento en MV1');
assert.equal(family.current.length>0,true);
assert.ok(family.antecedents.some(x=>x.date===older&&x.head==='9567'&&
 x.relation==='MISMA_FUENTE'&&x.verticalShift===0),
 'testigo GANADOR histórico por la misma silueta');
assert.equal(JSON.stringify(now),before,'no mutar hoja');
assert.equal(JSON.stringify(previous),historyBefore,'no mutar memoria');

const future:InfoVisualDay={
 date:'2026-10-24',heads:diaVacio(),
 sheet:{...previous,matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))}
};
const drop=buildFigureTracking(date,'Primera',now,[day,future],null);
assert.deepEqual(drop.records.find(x=>x.family==='123/321')?.antecedents,
 family.antecedents,'nunca utilizar día objetivo como testigo');
const injected={...now,
 columns:now.columns.map((x,i)=>i>1?{...x,values:['99','99','99','99','99','99']}:x),
 heads:{...now.heads,Primera:['9123','8888']},
 matches:{...now.matches,Primera:previous.matches.Primera}};
const closed=buildFigureTracking(date,'Primera',injected,[day],null);
assert.deepEqual(closed.records.map(x=>x.family),report.records.map(x=>x.family),
 'el resultado del objetivo y turnos futuros no cambian PRE');
assert.deepEqual(closed.records.find(x=>x.family==='123/321')?.antecedents,
 family.antecedents);

const aux=emptyAuxiliaryHeads();aux.Previa.Santiago='1234';
const input:TrackingAuxInput={heads:aux,view:null,mode:'intrajornada'};
const auxTest=buildFigureTracking(date,'Primera',now,[day],null,undefined,input);
const auxRecord=auxTest.records.find(x=>x.family==='123/321');
assert.equal(auxRecord?.auxToday.formable,true,
 'AUX HOY de Primera usa Santiago Previa publicada');
assert.equal(auxRecord?.auxToday.recognized,false);
const auxPrev=buildFigureTracking(date,'Previa',now,[day],null,undefined,input);
assert.equal(auxPrev.records.some(x=>x.auxToday.formable),false,
 'AUX HOY no mira resultados que se publicarán después de Previa');
const auxAyer=buildFigureTracking(date,'Previa',now,[day],null,
 {heads:aux,view:null,mode:'anterior'},undefined);
assert.ok(auxAyer.records.some(x=>x.auxYesterday.formable)===false||
 auxAyer.records.every(x=>x.auxYesterday.available),
 'AUX AYER disponible al inicio, sin inventar ranqueo');
console.log('FIGURAS_TEST_OK',JSON.stringify({
 preFamily:family.family,ancestor:family.antecedents[0]?.head,
 plusRoutes:family.current.length,auxTodayFromPrimera:auxRecord?.auxToday.formable,
 noFutureLeak:true
}));
