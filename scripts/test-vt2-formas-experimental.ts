import {strict as assert} from 'node:assert';
import {TURNOS,diaVacio} from '../src/domain';
import type {DailySheet,SheetColumn} from '../src/sheet';
import {physicalShape,shapeWitnesses} from '../src/shapeWitnesses';
import {buildExperimentalVt2} from '../src/experimentalVt2';
import type {InfoVisualDay} from '../src/infoTurnHistory';
import type {PanoramaRoute} from '../src/panoramaModel';

const oldDate='2026-10-22',date='2026-10-23';
const make=(sources:{old?:string[];prev?:string[]}):DailySheet=>{
 const columns:SheetColumn[]=TURNOS.map((turn,i)=>({
  id:i===0?'prevNocturno':TURNOS[i-1] as SheetColumn['id'],
  turno:turn,sourceLabel:'Fuente '+i,
  values:i===0?sources.old||Array(6).fill('--'):
   i===1?sources.prev||Array(6).fill('--'):Array(6).fill('--')
 }));
 const p=[{row:0,col:0,digit:'5'},{row:0,col:1,digit:'6'}];
 const q=[{row:0,col:0,digit:'5'},{row:1,col:0,digit:'7'}];
 return {columns,
  heads:Object.fromEntries(TURNOS.map(t=>[t,t==='Primera'?['9956','9957']:[]])),
  matches:Object.fromEntries(TURNOS.map(t=>[t,t==='Primera'?
   [{turno:t,jurisdiccion:'Ciudad',cabeza:'9956',
     hits:[{kind:'vt2',sourceId:'prevNocturno',sourceTurn:'Previa',
      value:'56',paths:[p]}]},
    {turno:t,jurisdiccion:'Provincia',cabeza:'9957',
     hits:[{kind:'vt2',sourceId:'prevNocturno',sourceTurn:'Previa',
      value:'57',paths:[q]}]}]:[]]))
 } as DailySheet;
};
const past=make({old:['56','78','90','12','34','56']});
const now=make({old:['12','34','56','78','90','12'],prev:['12','34','56','78','90','12']});
now.matches.Primera=[];now.heads.Primera=[];
const day:InfoVisualDay={date:oldDate,heads:diaVacio(),sheet:past};
const route:PanoramaRoute={
 id:'example',ownerId:'vt2|12/21',kind:'vt2',sourceId:'Previa',
 cells:[{row:0,col:0},{row:0,col:1}],
 readings:['12'],headSources:[]
};
assert.equal(physicalShape(route.cells),physicalShape(
 [{row:3,col:0},{row:3,col:1}]));
assert.notEqual(physicalShape(route.cells),physicalShape(
 [{row:0,col:0},{row:1,col:0}]));
const found=shapeWitnesses(date,'Primera',route,now,[day]);
assert(found.some(w=>w.head==='9956'&&w.reading==='56'&&
 w.sourceChanged&&w.shape===physicalShape(route.cells)),
 'forma histórica debe reconocerse aunque leyera 56 y hoy forme 12');
assert(found.every(w=>w.date<date));
assert(!found.some(w=>w.head==='9957'),'otra silueta no debe contarse');
const original=JSON.stringify(now);
const modified={...now,matches:{...now.matches,Primera:past.matches.Primera},
 heads:{...now.heads,Primera:['9956']}};
assert.deepEqual(shapeWitnesses(date,'Primera',route,modified,[day]),found,
 'No tocar POST del objetivo');
const forbidden=shapeWitnesses(date,'Previa',route,modified,[day]);
assert(!forbidden.length,'No utilizar columna Previa antes de Previa');
assert.equal(JSON.stringify(now),original);
const report=buildExperimentalVt2(now,date,'Primera',[day]);
assert(report.allRoutes>0);
assert(report.geometric.length>0&&report.geometric.length<=10);
assert(report.connected.length>0&&report.connected.length<=10,
 'dos cabezas anteriores independientes que se tocan generan lector conectado');
for(const reading of [...report.geometric,...report.connected]){
 const col=now.columns.find(c=>c.id===reading.source)!;
 assert.equal(reading.value,reading.cells.map(k=>{
  const [r,c]=k.split(':').map(Number);return col.values[r][c];
 }).join(''));
 assert.equal(reading.family.length===5,true);
}
assert.throws(()=>buildExperimentalVt2(now,date,'Primera',
 [day,{...day,date}]),/objetivo o futuro/);
const reportAfter={...now,matches:{...now.matches,Primera:past.matches.Primera},
 heads:{...now.heads,Primera:['8888']}};
assert.deepEqual(buildExperimentalVt2(reportAfter,date,'Primera',[day]),report,
 'El ranking PRE no puede cambiar al publicarse la cabeza objetivo');
console.log('VT2_FORMAS_EXPERIMENTAL_OK',JSON.stringify({
 shapeWitnesses:found.length,geometric:report.geometric.length,
 connected:report.connected.length,roots:report.historicalEvents,noFuture:true
}));
