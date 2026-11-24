import assert from 'node:assert/strict';
import {TURNOS} from '../src/domain';
import type {DailySheet,SheetColumn} from '../src/sheet';
import {buildMotorLalo} from '../src/motorLalo';
import {buildMotorLaloAuxiliar} from '../src/motorLaloAuxiliar';
import {rankPlusVt4,rankAuxVt4,buildMotorLaloApp,buildMotorLaloAuxiliarApp} from '../src/vt4Independent';
import {auxAtCut} from '../src/auxTemporalModes';
import {auxiliaryBoard,enumerateAuxPaths} from '../src/auxSantiagoNeuquen';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {buildAuxPredictiveVisual} from '../src/auxVisualModel';
const date='2026-11-24';
const ids:SheetColumn['id'][]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const sheet:DailySheet={columns:ids.map((id,i)=>({id,turno:TURNOS[i],sourceLabel:id,values:i===0?['01','23','45','67','89','01']:['99','99','99','99','99','99']})),heads:{},matches:{}};
const current=buildMotorLaloApp(sheet,date,'Previa',[]);
const old=buildMotorLalo(sheet,date,'Previa',[]);
assert.deepEqual(current.ranks.vt2,old.ranks.vt2);
assert.deepEqual(current.ranks.vt3,old.ranks.vt3);
assert.equal(old.ranks.vt4.length,0);
assert.ok(current.ranks.vt4.length>10);
assert.equal(new Set(current.ranks.vt4.map(f=>f.family)).size,current.ranks.vt4.length);
for(const f of current.ranks.vt4){
 assert.match(f.family,/^\d{4}$/);
 assert.equal(f.parentFamilies.length,0);
 for(const p of f.paths){
  assert.equal(p.sourceId,'prevNocturno');
  assert.equal(p.value,f.family);
  assert.equal(p.path.map(c=>c.digit).join(''),f.family);
  assert.equal(new Set(p.path.map(c=>c.row+':'+c.col)).size,4);
  assert.ok(p.path.slice(1).every((c,i)=>Math.max(Math.abs(c.row-p.path[i].row),Math.abs(c.col-p.path[i].col))===1));
 }
}
const changed:DailySheet={...sheet,heads:{Previa:['0000']},columns:sheet.columns.map((c,i)=>i?{...c,values:['11','11','11','11','11','11']}:c)};
assert.deepEqual(rankPlusVt4(changed,date,'Previa'),current.ranks.vt4);
const aux:AuxiliaryHeads={Previa:{Santiago:'0123',Neuquen:'4567'},Primera:{Santiago:'7890',Neuquen:'1234'},Matutino:{Santiago:'5678',Neuquen:'9012'}};
const ayer=auxAtCut(aux,'Previa','anterior'),hoy=auxAtCut(aux,'Previa','intrajornada');
assert.equal(rankAuxVt4(hoy,date,'Previa').length,0);
const auxOld=buildMotorLaloAuxiliar(date,'Previa',ayer,[]);
const auxNew=buildMotorLaloAuxiliarApp(date,'Previa',ayer,[]);
assert.deepEqual(auxOld.ranks[2],auxNew.ranks[2]);
assert.deepEqual(auxOld.ranks[3],auxNew.ranks[3]);
assert.ok(auxNew.ranks[4].length>10);
assert.ok(auxNew.ranks[4].every(f=>f.mother===null&&f.values.length===1&&f.family===f.values[0]));
const physical=new Set(enumerateAuxPaths(auxiliaryBoard(ayer,'Previa'),4).map(p=>p.map(c=>c.digit).join('')));
assert.equal(physical.size,auxNew.ranks[4].length);
assert.ok(auxNew.ranks[4].every(f=>physical.has(f.family)));
const visual=buildAuxPredictiveVisual(date,'Previa',auxiliaryBoard(ayer,'Previa'),auxNew,[],'anterior');
for(const f of auxNew.ranks[4].slice(0,10))assert.ok(visual.routes.some(r=>r.ownerId==='vt4|'+f.family&&r.reading===f.family));
console.log('VT4_INDEPENDIENTE_OK: exactitud, independencia, PRE, AUX HOY, VT2/VT3 y recorridos');
