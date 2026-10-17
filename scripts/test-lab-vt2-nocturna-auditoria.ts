import assert from 'node:assert/strict';
import {analyzeNightCut,summarizeNight} from './lab-vt2-nocturna-auditoria';
import type {FamilyWitness} from './lab-vt2-nocturna-auditoria';
const mother=(family:string,source:FamilyWitness['source'],rank:number):FamilyWitness=>
 ({family,source,motherRank:rank,historySource:'prevNocturno',
 historyDays:2,priorDate:'2026-10-12',
 shape:'0,1;1,0',cells:['0:0','0:1','1:1'],historicalHeads:['1234','5678']});
const mothers=[mother('123/321','Previa',1),mother('234/432','Matutino',2)];
const all=[
 {family:'12/21',source:'Previa' as const,mother:'123/321'},
 {family:'23/32',source:'Previa' as const,mother:'123/321'},
 {family:'34/43',source:'Previa' as const,mother:'123/321'},
 {family:'45/54',source:'Matutino' as const,mother:'234/432'},
 {family:'56/65',source:'Matutino' as const,mother:'234/432'},
 {family:'67/76',source:'Matutino' as const,mother:'234/432'},
 {family:'78/87',source:'Previa' as const,mother:'123/321'},
 {family:'89/98',source:'Matutino' as const,mother:'234/432'}
];
const cut=analyzeNightCut({date:'2026-10-13',period:'JUNIO_JULIO',
 heads:['0012','0067','0078','0012','0056'],
 all,officialFamilies:['78/87','23/32','01/10','12/21','34/43','45/54'],mothers});
assert.equal(cut.observed.connected,4);
assert.equal(cut.observed.official,2);
assert.equal(cut.observed.both,2);
assert.equal(cut.observed.onlyConnected,2);
assert.equal(cut.observed.onlyOfficial,0);
assert.equal(cut.universe.winInPool,5);
assert.equal(cut.universe.expectedUniform,3.75);
assert.equal(cut.universe.expectedBySource,3.75);
assert.equal(cut.group.Previa.winnerHeadsSelected,2);
assert.equal(cut.group.Matutino.winnerHeadsSelected,2);
const t=summarizeNight([cut]);
assert.equal(t.days,1);
assert.equal(t.connectedBetterDays,1);
assert.equal(t.source.Matutino.selected,3);
assert.equal(t.mothersByRank['1–3'].wins,4);
assert.throws(()=>analyzeNightCut({...{
 date:'2026-10-13',period:'JUNIO_JULIO',heads:['0012','0067','0078','0012','0056'],
 all:[...all,all[0]],officialFamilies:[],mothers
 }}));
console.log('OK: categorías de acierto, control neutral por fuente, familias, días y deduplicación');
