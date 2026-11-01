import assert from 'node:assert/strict';
import {diaVacio,TURNOS,JURS} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {TREND_WINDOW} from '../src/trendHistoryVt2';
import {
 emptyTrendJournal,parseJournal,recordTrend,trendHits,buildTrendSnapshot,
 cleanTop,fiveHeads
} from '../src/trendVt2Journal';
import {trendSyncDates,replayOneTrendDate} from '../src/trendVt2Sync';

const top=['01/10','02/20','03/30','04/40','05/50','06/60','07/70',
 '08/80','09/90','11'];
assert.equal(cleanTop(top)?.length,10);
assert.equal(cleanTop(['01/10']),null);
assert.deepEqual(fiveHeads(diaVacio(),'Previa'),null);
const frozen={date:'2026-11-02',turn:'Previa' as const,engine:'lalo' as const,
 top,origin:'capturado' as const,createdAt:'2026-11-02T09:01:00Z'};
let journal=recordTrend(emptyTrendJournal(),frozen);
assert.equal(journal.items.length,1);
journal=recordTrend(journal,{...frozen,top:[...top].reverse(),origin:'reconstruido'});
assert.deepEqual(journal.items[0].top,top,'PRE no debe cambiarse después');
journal=recordTrend(journal,{...frozen,heads:['0001','0010','0006','0060','0044']});
assert.deepEqual(trendHits(journal.items[0]),{first:2,last:2});
const after=recordTrend(journal,{...frozen,heads:['9999','9998','9997','9996','9995']});
assert.deepEqual(after,journal,'POST cerrado no debe duplicar resultados');
assert.equal(parseJournal(JSON.stringify(journal)).items.length,1);
assert.equal(parseJournal('{"version":1,"items":[{"date":"bad","top":[] }]}').items.length,0);
const cumulative=buildTrendSnapshot(journal,'acumulado');
assert.equal(cumulative.totals.Previa.lalo.first,33+2);
assert.equal(cumulative.totals.Previa.lalo.last,24+2);
assert.equal(cumulative.totals.Previa.lalo.cuts,50+1);
const recent=buildTrendSnapshot(journal,'reciente');
assert.equal(recent.totals.Previa.lalo.first,2);
assert.equal(recent.totals.Previa.lalo.last,2);
assert.equal(recent.totals.Previa.lalo.cuts,1);
assert.equal(recent.newDateCount,1);
assert.equal(recent.liveCapturedCuts,1);
assert.equal(recent.reconstructedCuts,0);
assert.deepEqual(trendSyncDates('2026-10-30'),[]);
assert.deepEqual(trendSyncDates('2026-11-02',4),['2026-10-31','2026-11-02']);

function synthetic(date:string):CabezasDia{
 const day=diaVacio();
 if(new Date(date+'T12:00:00').getUTCDay()===0)return day;
 const n=Number(date.slice(8));
 TURNOS.forEach((turn,t)=>JURS.forEach((jur,j)=>{
  day[turn][jur]=String((n*79+t*411+j*137)%10000).padStart(4,'0');
 }));
 return day;
}
function syntheticAux(date:string){
 const n=Number(date.slice(8));
 return {
  Previa:{Santiago:String((n*13+4567)%10000).padStart(4,'0'),Neuquen:'9642'},
  Primera:{Santiago:'1207',Neuquen:String((n*21+493)%10000).padStart(4,'0')},
  Matutino:{Santiago:'3456',Neuquen:'9870'}
 };
}
const day='2026-11-02';
let todayResults=diaVacio();
const sources={
 getDraw:async(date:string)=>date===day?todayResults:synthetic(date),
 getAux:async(date:string)=>syntheticAux(date)
};
async function verify(){
 const before=await replayOneTrendDate(day,day,emptyTrendJournal(),sources);
 assert.ok(before.journal.items.every(x=>x.origin==='capturado'));
 assert.ok(before.journal.items.every(x=>x.turn==='Previa'),
  'No debe capturar Primera y posteriores antes de que se publiquen sorteos previos');
 todayResults=synthetic(day);
 const finished=await replayOneTrendDate(day,day,before.journal,sources);
 assert.ok(finished.complete);
 assert.ok(finished.journal.items.length>0,'No hubo Top10 en reconstrucción');
 for(const old of before.journal.items){
  const stored=finished.journal.items.find(x=>x.date===old.date&&x.turn===old.turn&&x.engine===old.engine);
  assert.deepEqual(stored?.top,old.top,'PRE capturado debe permanecer intacto');
 }
 assert.ok(finished.journal.items.every(x=>x.heads?.length===5));
 assert.ok(finished.journal.items.some(x=>x.origin==='reconstruido')||
  finished.journal.items.length===before.journal.items.length);
 const repeated=await replayOneTrendDate(day,day,finished.journal,sources);
 assert.equal(repeated.changed,false,'Reprocesar un POST no duplica ni cambia las posiciones');
 console.log('TENDENCIAS_VT2_VIVAS_OK',
  JSON.stringify({cutoff:TREND_WINDOW.end,saved:before.journal.items.length,
   completed:finished.journal.items.length,last:finished.journal.items.at(-1)?.date}));
}
verify().catch(err=>{console.error(err);process.exitCode=1});
