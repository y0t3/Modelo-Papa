import assert from 'node:assert/strict';
import {diaVacio} from '../src/domain';
import type {AuxiliarView,AuxiliarFamily} from '../src/motorLaloAuxiliar';
import type {DayOverview} from '../src/homeDaySummary';
import {auxDayCandidates,dayCandidates} from '../src/dayMatchCandidates';
import fs from 'node:fs';

const heads=diaVacio();
heads.Previa.Provincia='8237';
heads.Previa.Córdoba='7973';
heads.Previa.Ciudad='7098';
heads.Primera.Provincia='9237'; // no puede filtrarse en PREVIA
const make=(family:string,rank:number,values:string[]):AuxiliarFamily=>({
 family,rank,values,mother:null,roots:1,d1:1,d7:0,
 paths:1,crossing:false,sources:['Previa']
});
const yesterday:AuxiliarView={date:'2026-10-31',turn:'Previa',status:'LABORATORIO',
 statement:'prueba',
 ranks:{2:[make('37/73',2,['37','73']),make('98/89',13,['98','89'])],
  3:[make('197/791',7,['197','791'])],4:[make('8237',4,['8237'])]}};
const today:AuxiliarView={...yesterday,ranks:{
 2:[make('98/89',1,['98','89'])],3:[],4:[]
}};
const ayerMatches=auxDayCandidates(yesterday,heads,'Previa');
assert.equal(ayerMatches.length,2); // rango 13 fuera de Top10 + 3 cifras sin aciertos
assert.equal(ayerMatches[0].kind,'vt2');
assert.equal(ayerMatches[0].family,'37/73');
assert.equal(ayerMatches[0].rank,2);
assert.deepEqual(ayerMatches[0].details.map(d=>d.head),['8237','7973']);
assert.deepEqual(ayerMatches[0].details.map(d=>d.value),['37','73']);
assert.equal(ayerMatches[1].kind,'vt4');
assert.equal(ayerMatches[1].details[0].head,'8237');
assert.deepEqual(auxDayCandidates(today,heads,'Previa').map(x=>x.family),['98/89']);
assert.equal(auxDayCandidates(yesterday,heads,'Primera').length,0);
assert.equal(auxDayCandidates(null,heads,'Previa').length,0);
assert.equal(auxDayCandidates(yesterday,null,'Previa').length,0);
const overview={matches:[
 {turn:'Previa',jur:'Provincia',head:'8237',kinds:[{kind:'vt2',rank:2,family:'37/73'}]},
 {turn:'Previa',jur:'Córdoba',head:'7973',kinds:[{kind:'vt2',rank:2,family:'37/73'}]},
 {turn:'Primera',jur:'Provincia',head:'9237',kinds:[{kind:'vt2',rank:2,family:'37/73'}]}
]} as DayOverview;
const main=dayCandidates(overview,'Previa');
assert.equal(main.length,1);
assert.equal(main[0].details.length,2);
assert.deepEqual(main[0].details.map(x=>x.head),['8237','7973']);

const ui=fs.readFileSync('src/ui/DayMatchGrid.tsx','utf8');
const home=fs.readFileSync('src/ui/HomeDashboard.tsx','utf8');
const info=fs.readFileSync('src/ui/InfoDashboard.tsx','utf8');
assert(ui.includes("label:'Aux ayer'")&&ui.includes("label:'Aux hoy'"));
assert(ui.includes('item.details.map((x,i)')); // no truncar la segunda cabeza
assert(!ui.includes('+{item.details.length'));
assert(ui.includes('kinds[item.kind]')); // color real por VT
assert(home.includes('auxAyer={auxAyer} auxHoy={auxHoy}'));
assert(info.includes('auxAyer={trackingAyer.view} auxHoy={trackingHoy.view}'));
console.log('RESUMEN_CHIPS_AUX_CABEZAS_OK');
