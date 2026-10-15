import assert from 'node:assert/strict';
import {diaVacio,TURNOS,JURS} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {LaloHistorical} from '../src/motorLalo';
import {buildMotorLalo} from '../src/motorLalo';
import {buildCandidateSequence,preSheetAtCut,sequenceMovementSummary,
 movementSourceName,positionsForMode,MOVEMENT_KINDS} from '../src/infoCandidatos';

const previous=diaVacio();
previous.Nocturno.Ciudad='0000';
previous.Nocturno.Provincia='0001';
const old=diaVacio();
old.Matutino.Ciudad='0112';
old.Nocturno.Provincia='1112';
const historical:LaloHistorical[]=[
 {date:'2026-10-14',period:'D−1',sheet:buildSheet(old,previous)}
];
const current=diaVacio();
current.Previa.Ciudad='0112';
current.Primera.Provincia='0112';
current.Matutino.Ciudad='1234';
current.Vespertino.Provincia='4321';
current.Nocturno.Ciudad='0000'; // POST conocido: NUNCA entrar en corte PRE
const full=buildSheet(current,previous);
const date='2026-10-15';
const seq=buildCandidateSequence(date,'Nocturno',current,full,historical);
assert.deepEqual(seq.frames.map(f=>f.id),[
 'base','tras-Previa','tras-Primera','tras-Matutino','tras-Vespertino','pre'
]);
assert.ok(seq.frames.every(f=>f.turn==='Nocturno'&&f.isActual===(f.id==='pre')));
assert.deepEqual(seq.frames.map(f=>f.cut),[0,1,2,3,4,4]);
assert.ok(seq.warning.includes('PRE reconstruida'));
assert.ok(seq.frames.every(f=>MOVEMENT_KINDS.every(k=>f.totalFamilies[k]>=0)));
assert.ok(seq.frames.every(f=>f.sources.every(s=>
 MOVEMENT_KINDS.every(k=>s.families[k].length===s.units[k]&&
 s.counts[k].length===6&&s.counts[k].every(row=>row.length===2)))));
const atStart=preSheetAtCut(full,'Nocturno',0);
assert.equal(atStart.columns[0].values[0],'11');
assert.ok(atStart.columns.slice(1).every(c=>c.values.every(v=>v==='--')));
assert.ok(TURNOS.every(t=>atStart.heads[t].length===0&&atStart.matches[t].length===0));
const afterPrevia=preSheetAtCut(full,'Nocturno',1);
assert.equal(afterPrevia.columns[1].values[0],'23');
assert.deepEqual(afterPrevia.heads.Previa,['0112']);
assert.deepEqual(afterPrevia.heads.Primera,[]);
assert.deepEqual(afterPrevia.heads.Nocturno,[]);
assert.ok(afterPrevia.columns.slice(2).every(c=>c.values.every(v=>v==='--')));
assert.throws(()=>preSheetAtCut(full,'Previa',1),/fuera/);
assert.throws(()=>preSheetAtCut(full,'Nocturno',5),/fuera/);
const end=preSheetAtCut(full,'Nocturno',4);
assert.deepEqual(end.heads.Nocturno,[]);
assert.deepEqual(end.matches.Nocturno,[]);
const motor=buildMotorLalo(end,date,'Nocturno',historical);
for(const k of MOVEMENT_KINDS){
 assert.deepEqual(seq.frames.at(-1)?.currentFamilies[k],
  motor.ranks[k].slice(0,10).map(f=>f.family),
  'El cierre PRE debe respetar las familias y el ranking oficial de '+k);
}
// La Nocturna objetivo ya salió en esta fixture; la secuencia no puede verla.
const changed=diaVacio();
for(const t of TURNOS)for(const j of JURS)changed[t][j]=current[t][j];
changed.Nocturno.Ciudad='9999';changed.Nocturno.Provincia='1234';
const seqChanged=buildCandidateSequence(date,'Nocturno',changed,
 buildSheet(changed,previous),historical);
assert.deepEqual(seqChanged,seq,'El objetivo POST está prohibido en TODOS los cortes PRE');
const late=diaVacio();
for(const t of TURNOS)for(const j of JURS)late[t][j]=current[t][j];
late.Vespertino.Provincia='9876';
const seqLate=buildCandidateSequence(date,'Nocturno',late,
 buildSheet(late,previous),historical);
assert.deepEqual(seqLate.frames.slice(0,4),seq.frames.slice(0,4),
 'Un resultado posterior no debe alterar la base ni cortes anteriores');
const early=diaVacio();
early.Previa.Ciudad='0112';
const sEarly=buildCandidateSequence(date,'Nocturno',early,
 buildSheet(early,previous),historical);
assert.deepEqual(sEarly.frames.map(x=>x.id),['base','tras-Previa','pre'],
 'Sin resultados posteriores no deben crearse etapas ficticias');
assert.equal(sEarly.frames.at(-1)?.cut,1);
const empty=buildCandidateSequence(date,'Nocturno',null,null,historical);
assert.deepEqual(empty.frames,[]);
const first=buildCandidateSequence(date,'Previa',current,full,historical);
assert.deepEqual(first.frames.map(x=>x.id),['base','pre']);
assert.ok(first.frames.every(x=>x.cut===0),'Previa no puede leer ningún turno de hoy');
assert.equal(movementSourceName('prevNocturno'),'Nocturna anterior');
const source=seq.frames.at(-1)!.sources[0];
assert.ok(positionsForMode(source,'todos').every(k=>source.units[k]>0));
assert.ok(positionsForMode(source,'vt3').every(k=>k==='vt3'));
assert.ok(sequenceMovementSummary(seq.frames[0],null).length>20);
const counts=seq.frames.at(-1)!.totalFamilies;
assert.ok((counts.vt2+counts.vt3+counts.vt4)>=0);
console.log('INFO_CANDIDATOS_PRE_OK: mismo turno, cortes cronológicos, fuente separada, 3 modalidades y cero fuga POST.');
