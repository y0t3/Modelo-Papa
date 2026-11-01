import assert from 'node:assert/strict';
import {TURNOS} from '../src/domain';
import {
 VT2_TRENDS,halfPercent,hits,motorShares,
 trendCoverageCheck,TREND_WINDOW,isRetrospective
} from '../src/trendHistoryVt2';
assert.equal(TREND_WINDOW.end,'2026-10-30');
assert.ok(trendCoverageCheck());
assert.deepEqual(halfPercent(VT2_TRENDS.Vespertino.lalo),[60,40]);
assert.equal(hits(VT2_TRENDS.Vespertino.lalo),47);
assert.equal(VT2_TRENDS.Vespertino.ayer.first+VT2_TRENDS.Vespertino.ayer.last,61);
assert.equal(VT2_TRENDS.Previa.hoy.cuts,0);
assert.equal(halfPercent(VT2_TRENDS.Previa.hoy),null);
assert.equal(VT2_TRENDS.Primera.hoy.cuts,39);
assert.equal(VT2_TRENDS.Primera.lalo.cuts,52);
for(const turn of TURNOS){
 const shares=motorShares(turn);
 assert.equal(shares.lalo+shares.ayer+shares.hoy,100);
 for(const [model,rec] of Object.entries(VT2_TRENDS[turn])){
  assert.ok(rec.first+rec.last<=rec.cuts*5,model+' '+turn);
  const halves=halfPercent(rec);
  if(halves)assert.equal(halves[0]+halves[1],100);
 }
}
assert.equal(motorShares('Previa').hoy,0);
assert.ok(motorShares('Vespertino').ayer>motorShares('Vespertino').lalo);
assert.equal(isRetrospective('2026-10-29'),true);
assert.equal(isRetrospective('2026-10-31'),false);
console.log('TENDENCIAS_VT2_OK',JSON.stringify({
 vespertinoLalo:halfPercent(VT2_TRENDS.Vespertino.lalo),
 vespertinoMotores:motorShares('Vespertino'),
 previaMotores:motorShares('Previa')
}));
