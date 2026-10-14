import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ROOT='auditorias/vt3-diversidad-antecedentes-115-13oct2026/';
const GEOM='auditorias/vt3-procedencia-empate-13oct2026/';
const OUT='auditorias/vt3-relectura-independencia-eventos-115-14oct2026/';
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=p=>createHash('sha256').update(read(p)).digest('hex');
const methods=['OFICIAL','COB20_P3','COB40_P3','VENTANA10_P3','CONTROL_MAS_EVENTOS_20','COB20_P3_HASH'];
const post=json(ROOT+'POST_115.json'),saved=json(ROOT+'RESUMEN.json');
const ties=json(GEOM+'INVENTARIO_PRE_RECONSTRUIDO.json');
const post13=json(GEOM+'COTEJO_POST.json');
assert.equal(post.rows.length,115);
assert.equal(new Set(post.rows.map(x=>x.date)).size,23);
const by=rows=>Object.fromEntries(methods.map(m=>[m,{
 cuts:rows.length,
 top3:rows.filter(r=>r.policies[m].top3).length,
 top5:rows.filter(r=>r.policies[m].top5).length,
 top10:rows.filter(r=>r.policies[m].top10).length,
 gain:rows.filter(r=>r.policies[m].top10&&!r.policies.OFICIAL.top10)
  .map(r=>r.date+'|'+r.turn),
 loss:rows.filter(r=>!r.policies[m].top10&&r.policies.OFICIAL.top10)
  .map(r=>r.date+'|'+r.turn)
}]));
const all=by(post.rows);
for(const m of methods){
 const existing=saved.overall[m],calc=all[m];
 assert.equal(calc.top3,existing.top3);
 assert.equal(calc.top5,existing.top5);
 assert.equal(calc.top10,existing.top10);
 assert.deepEqual(calc.gain,existing.gains);
 assert.deepEqual(calc.loss,existing.losses);
}
const contender=all.COB20_P3;
assert.equal(contender.gain.length,3);assert.equal(contender.loss.length,1);
assert.equal(ties.totals.tiedFamilies,11);
assert.equal(ties.totals.historicalWinningHeads,4);
assert.equal(ties.totals.historicalDistinctPaths,6);
assert.deepEqual(post13.winningInTie,['234/432']);
const choose=(n,k)=>{
 let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r;
};
const discordant=contender.gain.length+contender.loss.length;
const oneSided=Array.from({length:discordant-contender.gain.length+1},
 (_,i)=>choose(discordant,contender.gain.length+i))
 .reduce((a,b)=>a+b,0)/2**discordant;
const comparison={discordant,gains:contender.gain.length,losses:contender.loss.length,
 mcnemarOneSided:oneSided,mcnemarTwoSided:Math.min(1,2*oneSided),
 note:'Control pareado condicional simple, retrospectivo; no corrige experimentos previos ni comprueba capacidad predictiva.'};
assert.equal(oneSided,.3125);
const byMonth=Object.fromEntries(['2026-09','2026-10'].map(m=>[m,
 by(post.rows.filter(x=>x.date.startsWith(m)))]));
const byTurn=Object.fromEntries(['Previa','Primera','Matutino','Vespertino','Nocturno']
 .map(t=>[t,by(post.rows.filter(x=>x.turn===t))]));
const result={date:'2026-10-14',method:'Relectura verificable de auditoría histórica ya ejecutada; no ensayo prospectivo nuevo',
 historicalCuts:115,historicalDays:23,byMethod:all,byMonth,byTurn,
 rootEvidence:{
  official:saved.overall.OFICIAL,
  diversity:saved.overall.COB20_P3,
  countOnlyControl:saved.overall.CONTROL_MAS_EVENTOS_20
 },
 matchedControls:{
  randomTop20:saved.uniform20,
  rewiredRoots:saved.rootsRewired20,
  freeDayPermutation:saved.placebos.free.COB20_P3,
  weekdayPermutation:saved.placebos.sameWeekday.COB20_P3
 },
 pairedComparison:comparison,
 example13:{
  eventGroups:ties.groups,
  distinctWinningEvents:ties.totals.historicalWinningHeads,
  distinctOldGeometries:ties.totals.historicalDistinctPaths,
  tiedFamilies:ties.totals.tiedFamilies,
  observedWinningFamily:post13.winningInTie,
  sameExactHistoricalPathSibling:'768/867'
 },
 sourceHashes:{
  sourcePostSha256:sha(ROOT+'POST_115.json'),
  sourceSummarySha256:sha(ROOT+'RESUMEN.json'),
  groupPreSha256:sha(GEOM+'INVENTARIO_PRE_RECONSTRUIDO.json'),
  groupPostSha256:sha(GEOM+'COTEJO_POST.json')
 },
 limitations:'El historial de 115 cortes se reutilizó muchas veces. El control sin diversidad también obtuvo 17 Top10. Los valores p son descriptivos/exploratorios, no pruebas confirmatorias. Sin cambios en Top oficial o VT4.'
};
mkdirSync(OUT,{recursive:true});
writeFileSync(OUT+'RESUMEN.json',JSON.stringify(result,null,2)+'\n');
console.log('VT3_EVENTOS_RELECTURA_OK',JSON.stringify({
  official:all.OFICIAL,diversified:all.COB20_P3,
  countOnly:all.CONTROL_MAS_EVENTOS_20,
  pairedComparison:comparison,
  rootNumbers:{tied:ties.totals.tiedFamilies,
    physical:ties.totals.historicalDistinctPaths,
    uniqueEvents:ties.totals.historicalWinningHeads},
  controls:{uniform:saved.uniform20.fractionAtLeastObserved,
    rewired:saved.rootsRewired20.fractionAtLeastObserved}
}));
