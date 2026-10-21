import {strict as assert} from 'node:assert';
import {diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {emptyAuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {buildAuxPostLedger,highlightAuxMarks,groupAuxMarks} from '../src/auxMarkLedger';

const aux=emptyAuxiliaryHeads();
aux.Previa.Santiago='8067';aux.Previa.Neuquen='0469';
aux.Primera.Santiago='6142';aux.Primera.Neuquen='0245';
aux.Matutino.Santiago='9634';aux.Matutino.Neuquen='0210';
const observed=diaVacio();
observed.Previa.Provincia='8067';
observed.Primera['Santa Fé']='8568';
observed.Vespertino['Entre Ríos']='4066';
observed.Nocturno.Ciudad='2697';
observed.Nocturno.Provincia='7310';
const previous=diaVacio(),sheet=buildSheet(observed,previous);
const date='2026-10-20';
const pre=buildAuxPostLedger(date,aux,observed,sheet,'Previa');
assert.equal(pre.marks.length,1);
assert.equal(pre.summary.vt2.formableAux,0,'Previa no tiene hoja auxiliar');
assert(pre.marks.every(m=>m.modalities.vt2.aux.length===0));
assert.equal(pre.stages.length,1);
assert.equal(pre.stages[0].auxCells,0);
const first=buildAuxPostLedger(date,aux,observed,sheet,'Primera');
const head8568=first.marks.find(x=>x.head==='8568');
assert(head8568);
assert.equal(head8568.modalities.vt3.aux.length,0,'Primera no recibe su propia fuente');
assert.equal(first.stages.at(-1)?.auxCells,8);
assert(!first.marks.some(x=>x.turn==='Vespertino'||x.turn==='Nocturno'));
const ves=buildAuxPostLedger(date,aux,observed,sheet,'Vespertino');
const h4066=ves.marks.find(x=>x.head==='4066');
assert(h4066);
assert(h4066.modalities.vt2.aux.length>0,'VT2 cuenta por sí mismo');
assert(h4066.modalities.vt3.aux.length>0,'VT3 exacto marca POST');
assert(h4066.modalities.vt4.aux.length>0,'VT4 exacto 4066');
assert.equal(h4066.modalities.vt3.plus11.length,0,'no inventar +11');
assert.equal(ves.stages[3].auxCells,24);
const noct=buildAuxPostLedger(date,aux,observed,sheet,'Nocturno');
assert.equal(noct.stages[4].auxCells,24);
for(const n of ['vt2','vt3','vt4'] as const)
 assert.equal(noct.stages[4].firstAvailable[n],0,'no aparecen celdas nuevas después de Matutino');
const h2697=noct.marks.find(x=>x.head==='2697');
assert(h2697);
assert(h2697.modalities.vt3.aux.some(path=>path.crossesTurn),
 '2697 cruza Previa y Primera sin salto');
assert(h2697.modalities.vt3.aux.every(path=>
 path.cells.map(c=>c.digit).join('')==='697'),'nunca marcar 796 como cabeza ganadora 697');
const h7310=noct.marks.find(x=>x.head==='7310');
assert(h7310&&h7310.modalities.vt3.aux.length>0);
const overlay=highlightAuxMarks(noct,['vt2','vt3','vt4']);
assert(Object.keys(overlay).length>0);
assert(Object.values(overlay).some(x=>x.kinds.length>=2),
 'tres tipos visibles a la vez, sin tapar las cifras');
assert(groupAuxMarks(noct,'vt3').some(x=>x.head==='2697'&&x.crossing>0));
const changed=diaVacio();
changed.Nocturno.Ciudad='9999';
changed.Vespertino['Entre Ríos']='9999';
const baseline=buildAuxPostLedger(date,aux,observed,sheet,'Matutino');
const polluted=buildAuxPostLedger(date,aux,{
 ...observed,Vespertino:{...observed.Vespertino,...changed.Vespertino},
 Nocturno:{...observed.Nocturno,...changed.Nocturno}
},sheet,'Matutino');
assert.deepEqual(baseline, polluted,'futuro del mismo día no contamina bitácora PRE/POST anterior');
console.log('BITACORA_TEST_OK',JSON.stringify({
 checks:18,source20:aux,
 stages:noct.stages.map(s=>({turn:s.target,cells:s.auxCells,
  newFamilyVt2:s.firstAvailable.vt2,newFamilyVt3:s.firstAvailable.vt3,
  newFamilyVt4:s.firstAvailable.vt4,secondSourceVt3:s.newSecondSource.vt3})),
 recorded:noct.marks.map(m=>({turn:m.turn,jur:m.jur,head:m.head,
  vt2:m.modalities.vt2.aux.length,vt3:m.modalities.vt3.aux.length,
  vt4:m.modalities.vt4.aux.length}))
}));
