import assert from 'node:assert/strict';
import {diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {SourceId} from '../src/sheet';
import {buildInfoReport,postMovementFrame,preMovementFrame,sourceLabel} from '../src/infoInterpretacion';
import type {LaloHistorical,LaloView} from '../src/motorLalo';
import type {Path} from '../src/paths';

const previous=diaVacio();
previous.Nocturno.Ciudad='0000'; // +11 => fila 1 "11"
previous.Nocturno.Provincia='0001'; // +11 => fila 2 "12"
const current=diaVacio();
current.Previa.Ciudad='0112';
current.Primera.Provincia='0112';
const sheet=buildSheet(current,previous);
const previousPaths:Path=[
 {row:0,col:0,digit:'1'},
 {row:0,col:1,digit:'1'},
 {row:1,col:1,digit:'2'}
];
assert.ok(sheet.matches.Primera.some(x=>x.hits.some(h=>h.kind==='vt3')));
const old1=diaVacio();old1.Matutino.Ciudad='0112';
const older=buildSheet(old1,previous);
const hist:LaloHistorical[]=[
 {period:'D−7',date:'2026-10-08',sheet:older},
 {period:'D−1',date:'2026-10-14',sheet:older}
];
const family=(name:string,src:SourceId,p:Path)=>
 ({family:name,paths:[{sourceId:src,path:p,value:p.map(c=>c.digit).join('')}]});
const view={date:'2026-10-15',target:'Matutino',
 ranks:{vt2:[],vt3:[
  family('112/211','Primera',[
   {row:4,col:0,digit:'1'},{row:4,col:1,digit:'1'},{row:5,col:0,digit:'2'}]),
  family('213/312','Primera',[
   {row:4,col:0,digit:'2'},{row:4,col:1,digit:'1'},{row:5,col:1,digit:'3'}]),
  family('112/211','prevNocturno',previousPaths)
 ],vt4:[]}} as unknown as LaloView;

const report=buildInfoReport('2026-10-15','Matutino',current,sheet,hist,view);
assert.equal(report.turn,'Matutino');
assert.equal(report.expected.length,6,'Montevideo figura como habitual sólo en su turno de 15 h');
assert.equal(report.observed.length,0,'No confundir PRE Matutino con Previa/Primera');
assert.equal(report.availableSources.length,3);
assert.deepEqual(report.availableSources.map(x=>x.id),['prevNocturno','Previa','Primera']);
assert.equal(report.frames.length,4,'D−7, D−1, última cabeza del día y PRE');
assert.equal(report.frames[0].phase,'POST');
assert.equal(report.frames[1].phase,'POST');
assert.equal(report.frames[2].label,'Hoy · Primera (resultado)');
assert.equal(report.frames[3].phase,'PRE');
assert.equal(report.frames[0].heads,1);
assert.equal(report.frames[0].units,1);
assert.equal(report.frames[0].sourceCounts.prevNocturno,1);
assert.ok(report.frames[0].cells[0][0]>0);
assert.equal(report.frames[3].units,3);
assert.equal(report.frames[3].mainSource,'Primera');
assert.equal(report.frames[3].zoneCounts.Inferior,2);
assert.equal(report.frames[3].zoneCounts.Superior,1);
assert.ok(report.narrative.some(x=>x.includes('Primera')&&x.includes('sector')));
assert.equal(sourceLabel('prevNocturno'),'Nocturna anterior');

const changedFuture=diaVacio();
changedFuture.Previa.Ciudad='0112';
changedFuture.Primera.Provincia='0112';
changedFuture.Matutino.Ciudad='9999';
const futureSheet=buildSheet(changedFuture,previous);
const future=buildInfoReport('2026-10-15','Matutino',changedFuture,futureSheet,hist,view);
assert.equal(future.observed.length,1);
assert.deepEqual(future.frames.map(f=>({
 id:f.id,phase:f.phase,sourceCounts:f.sourceCounts,
 zoneCounts:f.zoneCounts,cells:f.cells})),
 report.frames.map(f=>({
 id:f.id,phase:f.phase,sourceCounts:f.sourceCounts,
 zoneCounts:f.zoneCounts,cells:f.cells})),
 'Las cabezas del turno objetivo nunca cambian la lectura PRE ni la secuencia histórica');

const blank=buildInfoReport('2026-10-15','Previa',null,null,[],null);
assert.equal(blank.frames.length,1);
assert.equal(blank.frames[0].units,0);
assert.ok(blank.narrative[0].includes('Actualizá'));
assert.equal(blank.withoutHead.length,5);
assert.equal(blank.expected.includes('Montevideo'),false);
assert.deepEqual(preMovementFrame(null,'Nocturno').sourceCounts,{});

const coincident=postMovementFrame('post','POST',older,'Matutino');
assert.equal(coincident.units,1);
assert.equal(coincident.cells[0][0],1);
const tied=preMovementFrame({
 target:'Previa',ranks:{vt2:[],vt3:[
  family('112/211','prevNocturno',previousPaths),
  family('222','Previa',[{row:4,col:0,digit:'2'},{row:4,col:1,digit:'2'},{row:5,col:0,digit:'2'}])
 ],vt4:[]}
} as unknown as LaloView,'Previa');
assert.equal(tied.mainSource,null,'Empate entre fuentes no se narra como predominio');
assert.equal(tied.mainZone,null,'Empate de zonas no debe convertirse en una inferencia');

console.log('INFO_JORNADA_OK: estados parciales, secuencia visual PRE/POST, geografía y explicación sin filtración futura.');
