import {strict as assert} from 'node:assert';
import {headStats} from '../src/headStats';
import type {HistoricHeadsDay} from '../src/historicalHeadFrequency';
const d=(date:string,nums:string[],turn='Nocturno'):HistoricHeadsDay=>({
 date,heads:{[turn]:Object.fromEntries(
 ['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos']
 .map((j,i)=>[j,nums[i]])),
 Montevideo:{Ciudad:'9999'}}});
const ds=[
 d('2026-11-10',['1001','1002','1003','1004','1005']),
 d('2026-11-11',['2001','9002','9003','9004','9005']),
 d('2026-11-12',['3001','3003','3004','3005','3006']),
 d('2026-11-13',['9001','9001','9001','9001','9001']),
 d('2026-11-14',['7777','7777','7777','7777','7777'])
];
const s=headStats(ds,'2026-11-13','Nocturno',60,'atrasados');
assert.equal(s.days,3);
assert.equal(s.heads,15);
assert.equal(s.all.find(x=>x.value==='01')?.count,3);
assert.equal(s.all.find(x=>x.value==='01')?.delay,0);
assert.equal(s.all.find(x=>x.value==='02')?.delay,1);
assert.equal(s.all.find(x=>x.value==='07')?.count,0);
assert.equal(s.all.find(x=>x.value==='77')?.count,0);
assert.equal(s.ranked.some(x=>x.value==='77'),false);
assert.equal(s.top[0].value,'02');
const c=headStats(ds,'2026-11-13','Nocturno',110,'calientes','Ciudad');
assert.equal(c.heads,3);
assert.equal(c.all.find(x=>x.value==='01')?.count,3);
assert.equal(c.all.find(x=>x.value==='03')?.count,0);
const f=headStats(ds,'2026-11-13','Nocturno',60,'frios','Ciudad');
assert.equal(f.top[0].count,0);
assert.equal(headStats(ds,'2026-11-10','Nocturno',60,'atrasados').days,0);
assert.equal(headStats(ds,'2026-11-14','Previa',60,'atrasados').days,0);
assert.equal(headStats(ds,'2026-11-15','Nocturno',60,'recientes').days,5);
console.log('Atrasos, frios, calientes y recientes: OK. Sin datos futuros ni hojas.');
