import assert from 'node:assert/strict';
import {connectedWinnerPairs,projectVerifiedConfigurations,relationship,pairModes} from './lab-vt3-configuraciones-conectadas';
import type {Mark,Trace} from './lab-vt3-configuraciones-conectadas';
const mark=(head:string,cells:string[],turn='Previa',source:Mark['source']='prevNocturno'):Mark=>({
 date:'2026-10-14',turn,source,jur:head==='1234'?'Ciudad':'Provincia',head,cells});
const a=mark('1234',['1:0','2:0','2:1']);
const b=mark('4356',['2:1','3:0','3:1'],'Matutino');
const pairs=connectedWinnerPairs([a,b,{...a,cells:[...a.cells].reverse()}]);
assert.equal(pairs.length,1);
assert.equal(pairs[0].events,1,'Inversas de cabeza NO aportan nuevos eventos');
assert.equal(pairs[0].kind,'COMPARTEN_UNA_CASILLA');
assert.equal(relationship(a.cells,a.cells),null,'La misma terna no crea bifurcación');
assert.equal(relationship(a.cells,['3:1','4:1','5:1']),'SOLO_ROCE');
const current:Trace[]=[
 {source:'prevNocturno',cells:['3:0','4:0','4:1'],value:'751',family:'157/751'},
 {source:'prevNocturno',cells:['4:1','5:0','5:1'],value:'198',family:'198/891'}
];
const projected=projectVerifiedConfigurations(pairs,current,'2026-10-15',null,'UNA_CASILLA_MISMA');
assert.deepEqual(projected.map(x=>x.family).sort(),['157/751','198/891']);
assert.equal(projected[0].relativeShift,2);
assert.ok(projected.every(x=>!['1234','4356'].includes(x.digits)));
assert.throws(()=>projectVerifiedConfigurations(pairs,current,'2026-10-14',null,'UNA_CASILLA_MISMA'),'Fuga futura debe rechazarse');
assert.equal(projectVerifiedConfigurations(pairs,current,'2026-10-15',null,'DOS_CASILLAS_MISMA').length,0);
assert.equal(projectVerifiedConfigurations(pairs,current.map(x=>({...x,source:'Matutino'})),'2026-10-15',null,'UNA_CASILLA_MISMA').length,0);
assert.equal(projectVerifiedConfigurations(pairs,current.map(x=>({...x,source:'Matutino'})),'2026-10-15',null,'SOLAPADAS_OTRA').length,2);
assert.equal(connectedWinnerPairs([a,{...b,turn:a.turn,jur:a.jur,head:a.head}]).length,0);
assert.equal(pairModes.length,5);
console.log('OK: dos cabezas distintas, solape, roce, inversión, traslación y lectura numérica PRE');
