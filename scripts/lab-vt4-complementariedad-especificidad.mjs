import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const DIR='auditorias/vt4-complementariedad-d1-d7-115-13oct2026/';
const PREVIOUS='auditorias/vt4-transferencia-rutas-ganadoras-115-13oct2026/';
const MOTHER='auditorias/vt4-hermanas-geometricas-115-13oct2026/PRE_115.json';
const TARGET='auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json';
const j=x=>JSON.parse(readFileSync(x,'utf8'));
const inventory=j(PREVIOUS+'INVENTARIO_RUTAS_PRE_115.json').rows;
const mothers=j(MOTHER).rows;
const targets=j(TARGET).rows;
const sel=j(DIR+'PRE_115.json').rows;
assert.equal(inventory.length,115);
const all={groups:0,withD1:0,withD7:0,withBoth:0,positives:0,positivesWithD1:0,positivesWithD7:0,
 positiveHeads:new Set(),cutsWithPhysicalWin:0};
const cutRows=[];
for(let i=0;i<115;i++){
 const parent=mothers[i],target=targets[i],inv=inventory[i],cut=sel[i];
 assert.equal(parent.date,inv.date);assert.equal(parent.turn,target.turn);
 const byRank=new Map(parent.physicalGroups.map(g=>[g.rank,g]));
 const eligible=inv.groups.map(x=>({ ...x,motherRank:byRank.get(x.rank)?.motherRank })).filter(x=>x.motherRank>=1&&x.motherRank<=5);
 const positives=eligible.filter(g=>g.values.some(x=>target.heads.includes(x)));
 const d1=eligible.filter(g=>g.signal.d1shape>0),d7=eligible.filter(g=>g.signal.d7shape>0);
 const both=eligible.filter(g=>g.signal.d1shape>0&&g.signal.d7shape>0);
 all.groups+=eligible.length;all.withD1+=d1.length;all.withD7+=d7.length;all.withBoth+=both.length;
 all.positives+=positives.length;all.positivesWithD1+=positives.filter(g=>g.signal.d1shape>0).length;
 all.positivesWithD7+=positives.filter(g=>g.signal.d7shape>0).length;
 all.cutsWithPhysicalWin+=Number(positives.length>0);
 for(const g of positives)for(const h of g.values.filter(x=>target.heads.includes(x)))all.positiveHeads.add(inv.date+'|'+inv.turn+'|'+h);
 cutRows.push({date:inv.date,turn:inv.turn,
  physicalGroups:eligible.length,groupCountD1:d1.length,groupCountD7:d7.length,
  winningGroups:positives.map(g=>({family:g.family,mother:g.mother,motherRank:g.motherRank,values:g.values,
   signal:g.signal}))});
}
assert.equal(all.cutsWithPhysicalWin,6);
assert.equal(all.positives,7);
const focus=cutRows.find(x=>x.date==='2026-10-03'&&x.turn==='Matutino');
assert.ok(focus&&focus.winningGroups.length===2);
const ix=inventory.findIndex(x=>x.date===focus.date&&x.turn===focus.turn);
const arr=inventory[ix].groups;
const byRank=new Map(mothers[ix].physicalGroups.map(x=>[x.rank,x]));
const siblings={};
for(const head of ['5832','2592']){
 const winning=arr.find(g=>g.values.includes(head)&&byRank.get(g.rank)?.motherRank<=5);
 assert.ok(winning);
 const signal=head==='5832'?'d1exact':'d7shape';
 const sisters=arr.filter(g=>g.mother===winning.mother);
 const qualifying=sisters.filter(g=>g.signal[signal]>0);
 siblings[head]={family:winning.family,mother:winning.mother,motherRank:byRank.get(winning.rank).motherRank,
  signal,signalOfWinner:winning.signal[signal],
  totalSisters:sisters.length,
  qualifyingSisters:qualifying.length,
  otherQualifyingSisters:qualifying.filter(x=>x.rank!==winning.rank).map(x=>({
   family:x.family,rank:x.rank,periodSignal:x.signal[signal],signals:x.signal})),
  allSisters:sisters.map(x=>({family:x.family,rank:x.rank,periodSignal:x.signal[signal],signals:x.signal})),
  top10ByMethod:Object.fromEntries(Object.entries(sel[ix].methods).map(([name,x])=>[name,{
    selected:x.top10.filter(z=>z.mother===winning.mother).map(z=>({family:z.family,rank:z.rank,signal:z.signal})),
    found:x.top10.some(z=>z.values.includes(head))
   }]))
 };
}
const answer={date:'2026-10-13',summary:{physicalEligibleGroupExposures:all.groups,
 d1SupportedGroupExposures:all.withD1,d7SupportedGroupExposures:all.withD7,
 supportedByBothPeriodsExposures:all.withBoth,
 historicallyWinningGroupExposures:all.positives,
 winningGroupsWithD1:all.positivesWithD1,
 winningGroupsWithD7:all.positivesWithD7,
 distinctPhysicallyWinningHeads:[...all.positiveHeads].length,
 cutsWithPhysicallyWinningHeads:all.cutsWithPhysicalWin},
 focus:{date:focus.date,turn:focus.turn,siblings},
 notes:['Todas las rutas, marcas históricas y grupos ya estaban en PRE sellados de laboratorios anteriores. Esta es una atribución POST sin editar rankings.',
 'La pregunta no es si existen señales, sino cuántas candidatas físicas distintas comparten esas señales dentro de la misma madre.',
 'Los conteos de grupos no son probabilidades de ganar; la quiniela es aleatoria y el corpus ya se investigó reiteradamente.']};
writeFileSync(DIR+'DIAGNOSTICO_ESPECIFICIDAD_03OCT_POST.json',JSON.stringify(answer,null,2)+'\n');
console.log('VT4_ESPECIFICIDAD_POST_OK',JSON.stringify({summary:answer.summary,
 focus:Object.fromEntries(Object.entries(siblings).map(([k,v])=>[k,{mother:v.mother,signal:v.signal,
 qualifyingSisters:v.qualifyingSisters,totalSisters:v.totalSisters,
 otherQualifyingSisters:v.otherQualifyingSisters,
 foundByMethod:Object.fromEntries(Object.entries(v.top10ByMethod).map(([m,x])=>[m,x.found]))}]))},null,2));
