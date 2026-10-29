/** Formas Primero VT2: posición y silueta antes de leer dígitos, PRE impermeable al POST. */
import assert from 'node:assert/strict';
import {TURNOS,diaVacio} from '../src/domain';
import type {DailySheet,SheetColumn} from '../src/sheet';
import type {InfoVisualDay} from '../src/infoTurnHistory';
import {buildFormFirstVt2,formPositions,historicalFormRoots,
 rankFormLocations,formSignature} from '../src/motorFormasPrimero';
import {reversibleFamily} from '../src/motorLalo';
const date='2026-10-29',prior='2026-10-28';
const old=['01','23','45','67','89','01'];
const nowA=['45','67','89','01','23','45'];
const nowB=['98','76','54','32','10','98'];
const route=[{row:0,col:0,digit:'0'},{row:0,col:1,digit:'1'}];
const cols=(values:string[]):SheetColumn[]=>
 TURNOS.map((turn,i)=>({id:i===0?'prevNocturno':TURNOS[i-1] as SheetColumn['id'],
  turno:turn,sourceLabel:turn,values:i===0?values:Array(6).fill('--')}));
const sheet=(values:string[]):DailySheet=>({
 columns:cols(values),heads:Object.fromEntries(TURNOS.map(t=>[t,[]])),
 matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))
});
const past:DailySheet={
 columns:cols(old),heads:Object.fromEntries(TURNOS.map(t=>[t,t==='Previa'?['10001']:[]])),
 matches:Object.fromEntries(TURNOS.map(t=>[t,t==='Previa'?
 [{turno:t,jurisdiccion:'Santa Fe',cabeza:'10001',hits:[{
  kind:'vt2',sourceId:'prevNocturno',sourceTurn:'Nocturno anterior',
  value:'01',paths:[route]
 }]}]:[]]))
};
const days:InfoVisualDay[]=[{date:prior,sheet:past,heads:diaVacio()}];
const input=sheet(nowA),altered=sheet(nowB);
assert.equal(formSignature(route),formSignature([...route].reverse()));
assert.equal(formSignature(route),formSignature([{row:3,col:0},{row:3,col:1}]));
assert.notEqual(formSignature(route),formSignature([{row:0,col:0},{row:1,col:0}]));
const roots=historicalFormRoots(date,days,'vt2');
assert.equal(roots.roots.length,1,'La cabeza de 5 cifras debe conservar el 01 final');
assert.equal(roots.roots[0].reading,'01');
const locations=formPositions(input,'Previa','vt2');
assert(locations.length>0);
assert(locations.every(x=>x.cells.length===2&&x.cells.every(p=>p.col<2)));
const candidatesA=rankFormLocations(locations,roots.roots,roots.dates,100,date);
const candidatesB=rankFormLocations(formPositions(altered,'Previa','vt2'),roots.roots,roots.dates,100,date);
assert.deepEqual(candidatesA.map(x=>x.positionKey),candidatesB.map(x=>x.positionKey),
 'Ninguna cifra puede alterar el orden de las posiciones elegidas');
assert.deepEqual(candidatesA.map(x=>x.support.events),candidatesB.map(x=>x.support.events));
const a=buildFormFirstVt2(input,date,'Previa',days);
const b=buildFormFirstVt2(altered,date,'Previa',days);
assert(a.top.length>0&&b.top.length>0);
assert(a.top.length<=10);
assert(a.top.every(x=>x.value.length===2&&x.support.events>0));
assert(a.top.every(x=>x.family===reversibleFamily(x.value)));
assert.equal(new Set(a.top.map(x=>x.family)).size,a.top.length);
assert.equal(a.top[0].positionKey,b.top[0].positionKey);
assert.notEqual(a.top[0].value,b.top[0].value);
const future={...input,matches:{...input.matches,Previa:past.matches.Previa},
 heads:{...input.heads,Previa:['9999']},
 columns:input.columns.map((c,i)=>i>0?{...c,values:Array(6).fill('99')}:c)};
assert.deepEqual(buildFormFirstVt2(future,date,'Previa',days),a,
 'Un POST ajeno o columna no visible no puede reordenar la predicción PRE');
assert.throws(()=>buildFormFirstVt2(input,date,'Previa',[{...days[0],date}]),
 /objetivo o del futuro/);
assert.throws(()=>buildFormFirstVt2(input,date,'Previa',[{...days[0],date:'2026-11-01'}]),
 /objetivo o del futuro/);
assert.equal(buildFormFirstVt2(input,date,'Previa',[]).top.length,0);
assert.equal(buildFormFirstVt2(input,date,'Previa',days).kind,'vt2');
assert.deepEqual(formPositions(input,'Previa').every(x=>x.cells.length===3),true,
 'La versión VT3 debe permanecer igual');
console.log('FORMAS_VT2_PRE_OK',JSON.stringify({
 figures:a.physicalPositions,roots:a.validRoots,top:a.top.length,
 oldRoot:roots.roots[0].reading,a:a.top[0]?.value,b:b.top[0]?.value,
 positionInvariant:true,postExcluded:true
}));