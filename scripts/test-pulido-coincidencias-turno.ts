import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dayCandidates} from '../src/dayMatchCandidates';
import type {DayOverview} from '../src/homeDaySummary';
const source=(file:string)=>fs.readFileSync(file,'utf8');
const sample:DayOverview={
 loaded:true,heads:4,turnsWithHeads:2,status:'en_marcha',statusText:'La jornada está en marcha',
 matches:[
  {turn:'Matutino',jur:'Ciudad',head:'9305',kinds:[{kind:'vt2',rank:7,family:'05/50'}]},
  {turn:'Matutino',jur:'Córdoba',head:'4182',kinds:[{kind:'vt3',rank:3,family:'182/281'}]},
  {turn:'Vespertino',jur:'Córdoba',head:'2197',kinds:[{kind:'vt3',rank:7,family:'197/791'}]},
  {turn:'Vespertino',jur:'Ciudad',head:'3197',kinds:[{kind:'vt2',rank:4,family:'97/79'},
   {kind:'vt4',rank:8,family:'3197'}]}
 ],
 matchedHeads:4,byKind:{vt2:2,vt3:2,vt4:1},
 countByTurn:{Previa:{heads:0,matched:0},Primera:{heads:0,matched:0},
 Matutino:{heads:2,matched:2},Vespertino:{heads:2,matched:2},
 Nocturno:{heads:0,matched:0}},exactHistory:true
};
const all=dayCandidates(sample);
assert.equal(all.length,5);
assert.equal(dayCandidates(sample,'Matutino').length,2);
const ves=dayCandidates(sample,'Vespertino');
assert.equal(ves.length,3);
assert(ves.every(v=>v.details.every(d=>d.turn==='Vespertino')));
assert.deepEqual(dayCandidates(sample,'Nocturno'),[]);
assert.equal(ves.find(x=>x.kind==='vt4')?.details[0].value,'3197');
const home=source('src/ui/HomeDashboard.tsx');
const day=source('src/ui/DayMatchGrid.tsx');
const app=source('App.tsx');
const pred=source('src/ui/PredictionSummary.tsx');
const comb=source('src/ui/CombinedVt3Panel.tsx');
const info=source('src/ui/InfoDashboard.tsx');
const heads=source('src/ui/HeadsTable.tsx');
assert(home.includes('turn={turn} onlyTurn'));
assert(!home.includes('Abrir el resumen completo'));
assert(home.includes('color:c.accent}]}>Los favoritos de Lalo'));
assert(day.includes("onlyTurn?turn:undefined"));
assert(day.includes('hitValues.has(member)'));
assert(day.includes('onOpenFamily?.(item.kind,item.family'));
assert(pred.includes('#{h.rank} · {h.family} · {h.head}'));
assert(pred.includes('onOpenCoincidence?.(kind,h.family)'));
assert(comb.includes('onOpenCoincidence?.(entry)'));
assert(comb.includes('family:{fontSize:15,fontWeight:\'900\'}'));
assert(app.includes("setSelectedTurn(turn);showFamily(kind+'|'+family)"));
assert(app.includes('focusedCombined.entry.paths.map('));
assert(app.includes('onOpenCoincidence={openCombinedMatch}'));
assert(!app.includes('sourceLabels={headHighlights.labels}'));
assert(!app.includes("screen==='cabezas'?<>\n    <AuxModeSwitch"));
assert(heads.includes('s.jurWrap'));
assert(info.includes("section==='historial'?<>"));
assert(info.includes('<TurnStrip value={turn} onChange={onTurnChange}/>'));
console.log('PULIDO_COINCIDENCIAS_TURNO_TEST_OK');
