import assert from 'node:assert/strict';
import {TURNOS} from '../src/domain';
import type {DailySheet,SheetColumn} from '../src/sheet';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {rankPlusVt4,rankAuxVt4} from '../src/vt4Independent';
import {auxAtCut} from '../src/auxTemporalModes';
import {plusVt4Timeline,auxVt4Timeline,timelineFromBirths,unchangedSince} from '../src/vt4Timeline';
const date='2026-11-24';
const ids:SheetColumn['id'][]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const sheet:DailySheet={columns:ids.map((id,i)=>({id,turno:TURNOS[i],sourceLabel:id,values:i%2?['01','23','45','67','89','01']:['11','23','45','67','89','01']})),heads:{},matches:{}};
const aux:AuxiliaryHeads={Previa:{Santiago:'0123',Neuquen:'4567'},Primera:{Santiago:'7890',Neuquen:'1234'},Matutino:{Santiago:'5678',Neuquen:'9012'}};
const cuts=TURNOS.map(t=>new Map(rankPlusVt4(sheet,date,t).map(f=>[f.family,f.physicalBlocks])));
for(const t of TURNOS)for(const f of rankPlusVt4(sheet,date,t)){
 const history=plusVt4Timeline(sheet,f.paths,t);
 assert.deepEqual(history.map(e=>e.blocks),cuts.slice(0,history.length).map(c=>c.get(f.family)||0));
}
for(const mode of ['ayer','hoy'] as const){
 const policy=mode==='ayer'?'anterior':'intrajornada';
 const ranks=TURNOS.map(t=>rankAuxVt4(auxAtCut(aux,t,policy),date,t));
 const cuts=ranks.map(xs=>new Map(xs.map(f=>[f.family,f.physicalBlocks])));
 for(let i=0;i<TURNOS.length;i++)for(const f of ranks[i]){
  const history=auxVt4Timeline(f.routes,TURNOS[i],mode);
  assert.deepEqual(history.map(e=>e.blocks),cuts.slice(0,i+1).map(c=>c.get(f.family)||0));
 }
}
const a=timelineFromBirths([{key:'a',at:1},{key:'a',at:1},{key:'b',at:2},{key:'future',at:4}],'Vespertino');
assert.deepEqual(a.map(e=>e.blocks),[0,1,2,2]);
assert.equal(unchangedSince(a),'Matutino');
console.log('VT4_TIMELINE_OK: todos los cortes coinciden con el ranking fisico, sin rutas futuras ni duplicados');
