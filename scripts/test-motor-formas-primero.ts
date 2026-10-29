import assert from 'node:assert/strict';
import {diaVacio,TURNOS} from '../src/domain';
import type {DailySheet,SheetColumn} from '../src/sheet';
import type {InfoVisualDay} from '../src/infoTurnHistory';
import {
 buildFormFirstMotor,formPositions,formSignature,historicalFormRoots,
 rankFormLocations
} from '../src/motorFormasPrimero';
import {reversibleFamily} from '../src/motorLalo';

const date='2026-10-29',prior='2026-10-28';
const old=['12','34','56','78','90','12'];
const nowA=['45','67','89','01','23','45'];
const nowB=['98','76','54','32','10','98'];
const route=[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'2'},
 {row:1,col:0,digit:'3'}];
const columns=(values:string[]):SheetColumn[]=>
 TURNOS.map((turn,i)=>({id:i===0?'prevNocturno':TURNOS[i-1] as SheetColumn['id'],
  turno:turn,sourceLabel:turn,values:i===0?values:Array(6).fill('--')}));
const today=(value:string[]):DailySheet=>({
 columns:columns(value),heads:Object.fromEntries(TURNOS.map(t=>[t,[]])),
 matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))
});
const past:DailySheet={
 columns:columns(old),
 heads:Object.fromEntries(TURNOS.map(t=>[t,t==='Previa'?['9123']:[]])),
 matches:Object.fromEntries(TURNOS.map(t=>[t,t==='Previa'?
  [{turno:t,jurisdiccion:'Ciudad',cabeza:'9123',hits:[{kind:'vt3',
   sourceId:'prevNocturno',sourceTurn:'Nocturno anterior',value:'123',paths:[route]}]}]:[]]))
};
const history:InfoVisualDay[]=[{date:prior,sheet:past,heads:diaVacio()}];
const original=JSON.stringify(history),boardA=today(nowA),boardB=today(nowB);
assert.equal(formSignature(route),formSignature([...route].reverse()));
assert.equal(formSignature(route),formSignature([
 {row:2,col:0},{row:2,col:1},{row:3,col:0}
]));
assert.notEqual(formSignature(route),formSignature([
 {row:0,col:0},{row:1,col:0},{row:2,col:0}
]));
const oldRoots=historicalFormRoots(date,history);
assert.equal(oldRoots.roots.length,1);
assert.equal(oldRoots.roots[0].reading,'123');
const positions=formPositions(boardA,'Previa');
assert(positions.every(p=>p.cells.length===3&&p.cells.every(c=>c.col<=1)));
assert(positions.some(p=>p.shape===oldRoots.roots[0].shape));
const rawA=rankFormLocations(formPositions(boardA,'Previa'),oldRoots.roots,oldRoots.dates,30,date);
const rawB=rankFormLocations(formPositions(boardB,'Previa'),oldRoots.roots,oldRoots.dates,30,date);
assert.deepEqual(rawA.map(p=>p.positionKey),rawB.map(p=>p.positionKey),
 'PRIORIDAD: se elige la misma posición aunque se sustituyan TODAS las cifras');
assert.deepEqual(rawA.map(p=>p.support.events),rawB.map(p=>p.support.events));
const a=buildFormFirstMotor(boardA,date,'Previa',history);
const b=buildFormFirstMotor(boardB,date,'Previa',history);
assert(a.top.length>0&&b.top.length>0);
assert(a.top.every(x=>x.support.events>0));
assert.equal(a.top[0].positionKey,b.top[0].positionKey);
assert.notEqual(a.top[0].value,b.top[0].value,
 'Las cifras nuevas solo se leen después de elegir la forma');
assert.equal(a.top[0].family,reversibleFamily(a.top[0].value));
assert(a.top.every(x=>x.rank<=10&&x.value.length===3));
assert.equal(new Set(a.top.map(x=>x.family)).size,a.top.length);
assert.deepEqual(JSON.stringify(history),JSON.stringify(JSON.parse(original)));
assert.throws(()=>buildFormFirstMotor(boardA,date,'Previa',
 [{...history[0],date}]),/objetivo o del futuro/);
assert.throws(()=>buildFormFirstMotor(boardA,date,'Previa',
 [{...history[0],date:'2026-10-30'}]),/objetivo o del futuro/);
// Una cabeza del turno objetivo no cambia ni la selección ni el Top.
const injected={...boardA,matches:{...boardA.matches,Previa:past.matches.Previa},
 heads:{...boardA.heads,Previa:['9999']},
 columns:boardA.columns.map((col,i)=>i>0?{...col,values:Array(6).fill('99')}:col)};
const again=buildFormFirstMotor(injected,date,'Previa',history);
assert.deepEqual(again.top,a.top);
const noRoots=buildFormFirstMotor(boardA,date,'Previa',[]);
assert.equal(noRoots.top.length,0,
 'Sin figuras históricas verificadas el motor no inventa candidatos');
console.log('FORMAS_PRIMERO_PRE_OK',JSON.stringify({
 positions:a.physicalPositions,roots:a.validRoots,top:a.top.length,
 firstShape:a.top[0]?.shape,firstA:a.top[0]?.value,firstB:b.top[0]?.value,
 noReadBeforeSelection:true,noFuture:true
}));