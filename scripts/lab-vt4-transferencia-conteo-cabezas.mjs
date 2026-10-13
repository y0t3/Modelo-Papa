import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const DIR='auditorias/vt4-transferencia-rutas-ganadoras-115-13oct2026/';
const j=x=>JSON.parse(readFileSync(x,'utf8'));
const pre=j(DIR+'PRE_115.json').rows,post=j('auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json').rows;
const mark=j(DIR+'INVENTARIO_RUTAS_PRE_115.json').rows;
const methods=Object.keys(pre[0].methods);
const totals={};
const detail=[];
for(const method of methods){
 let hits=0,cuts=0;const groups=[];
 for(let i=0;i<115;i++){
  assert.equal(pre[i].date,post[i].date);assert.equal(pre[i].turn,post[i].turn);
  const picks=pre[i].methods[method],real=[...new Set(post[i].heads)];
  const matched=real.filter(h=>picks.some(g=>g.values.includes(h)));
  hits+=matched.length;cuts+=Number(matched.length>0);
  if(matched.length)groups.push({date:pre[i].date,turn:pre[i].turn,heads:matched,
   ranks:matched.map(h=>picks.findIndex(g=>g.values.includes(h))+1)});
 }
 totals[method]={turns:cuts,heads:hits,matchedCases:groups};
}
for(const [date,turn,head] of [
 ['2026-09-18','Vespertino','2735'],['2026-10-03','Matutino','5832'],
 ['2026-10-03','Matutino','2592'],['2026-10-05','Matutino','3729']]){
 const row=pre.find(x=>x.date===date&&x.turn===turn),inv=mark.find(x=>x.date===date&&x.turn===turn);
 const group=inv.groups.filter(g=>g.values.includes(head));
 const selected=Object.fromEntries(methods.map(m=>[m,{
  present:row.methods[m].some(g=>g.values.includes(head)),
  rank:row.methods[m].findIndex(g=>g.values.includes(head))+1,
  motherSiblingSlots:row.methods[m].filter(g=>group.some(c=>c.mother===g.mother)).map(x=>({
   rank:x.rank,mother:x.mother,family:x.family,signal:x.signal
  }))
 }]));
 const marks=inv.marks.filter(m=>group.some(g=>g.witnesses.some(w=>w.source===m.source&&w.shape===m.shape)));
 detail.push({date,turn,head,physicalGroups:group.map(g=>({family:g.family,mother:g.mother,rank:g.rank,
  signal:g.signal,paths:g.witnesses})),relevantHistoricalMarks:marks,
  selected});
}
assert.deepEqual(Object.values(totals).map(t=>t.turns),[4,4,4,4,4,4,4,2,1]);
const data={date:'2026-10-13',methodTotals:totals,focus:detail,
 note:'Auditoría POST de la selección PRE: cuenta cabezas exactas, no sólo turnos acertados. Nunca reordena Tops.'};
writeFileSync(DIR+'ANALISIS_CABEZAS_Y_5832_POST.json',JSON.stringify(data,null,2)+'\n');
console.log('VT4_D7_HEADS_POST_OK',JSON.stringify({totals,focus:detail.map(z=>({
 date:z.date,turn:z.turn,head:z.head,
 signal:z.physicalGroups.map(g=>g.signal),
 selected:Object.fromEntries(Object.entries(z.selected).map(([m,x])=>[m,x.rank])),
 historical:z.relevantHistoricalMarks.map(h=>({period:h.period,date:h.date,turn:h.oldTurn,source:h.source,event:h.event,path:h.path}))
}))},null,2));
