import {strict as assert} from 'node:assert';
import {buildTop6Pre,mergeStatResults,hitsForTop6,readStatJournal} from '../src/headStatJournal';
import type {HistoricHeadsDay} from '../src/historicalHeadFrequency';
const J=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos'];
const empty={Nocturno:Object.fromEntries(J.map(j=>[j,'----']))};
const history:HistoricHeadsDay[]=Array.from({length:90},(_,i)=>{
 const d=new Date('2026-07-01T12:00:00Z');d.setUTCDate(d.getUTCDate()+i);
 const n=i%100;return {date:d.toISOString().slice(0,10),heads:{
  Nocturno:Object.fromEntries(J.map((j,k)=>[j,
   String((n*5+k)%10000).padStart(4,'0')]))}
 };
});
const snapshot=buildTop6Pre('2026-11-19','Nocturno',history,empty,'2026-11-19T12:00:00Z');
assert(snapshot,'Debe guardar PRE con histórico suficiente y sin cabezas');
assert.equal(snapshot.historyDays,90);
for(const m of ['atrasados','frios','calientes','recientes'] as const)
 assert.equal(snapshot.picks[m].length,6);
const first=snapshot.picks.atrasados[0];
const other='00'===first?'01':'00';
const partial={Nocturno:{Ciudad:'12'+first,Provincia:'----',Córdoba:'----','Santa Fé':'----','Entre Ríos':'----'}};
const checked=mergeStatResults(snapshot,partial,'2026-11-19T20:00:00Z');
assert.equal(checked.results.length,1);
assert.equal(hitsForTop6(checked,'atrasados')[0]?.value,first);
assert.deepEqual(checked.picks,snapshot.picks);
assert.equal(mergeStatResults(checked,partial,'2026-11-19T20:01:00Z'),checked);
const complete={Nocturno:Object.fromEntries(J.map((j,k)=>[j,
 k===0?'12'+first:'12'+other]))};
const post=mergeStatResults(checked,complete,'2026-11-19T22:00:00Z');
assert.equal(post.results.length,5);
assert.equal(buildTop6Pre('2026-11-19','Nocturno',history,partial,'late'),null);
assert.equal(readStatJournal(JSON.stringify([post])).length,1);
assert.equal(readStatJournal('garbage').length,0);
console.log('Top6 PRE guardado, POST por jurisdicción y persistencia: OK');
