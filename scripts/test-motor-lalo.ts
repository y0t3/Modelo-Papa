import assert from 'node:assert/strict';
import {buildMotorLalo,compareMotorLaloAfterDraw,reversibleFamily,vt4PrefixFamily} from '../src/motorLalo';
import type {DailySheet,SheetColumn,Match} from '../src/sheet';
import type {Path} from '../src/paths';
import {TURNOS} from '../src/domain';

const pairs=['76','48','93','21','34','56'];
const names:SheetColumn['id'][]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const columns:SheetColumn[]=names.map((id,i)=>({id,turno:TURNOS[i],sourceLabel:id,
 values:i===0?pairs:['--','--','--','--','--','--']}));
const oldPath:Path=[{row:0,col:0,digit:'5'},{row:1,col:0,digit:'1'},{row:2,col:0,digit:'7'}];
const match=(jurisdiccion:string):Match=>({turno:'Previa',jurisdiccion,cabeza:'2517',hits:[
 {kind:'vt3',value:'517',sourceId:'prevNocturno',sourceTurn:'Nocturno anterior',paths:[oldPath, [...oldPath].reverse()]}
]});
const makeSheet=(head:string,old=false,j='Ciudad'):DailySheet=>{
 const s:DailySheet={columns:columns.map(c=>({...c,values:old?
  (c.id==='prevNocturno'?['58','16','79','02','23','14']:['--','--','--','--','--','--']):c.values})),
  heads:Object.fromEntries(TURNOS.map(t=>[t,t==='Primera'&&head?[head]:[]])),
  matches:Object.fromEntries(TURNOS.map(t=>[t,t==='Previa'&&old?[match(j)]:[]]))
 };
 return s;
};
const historical={date:'2026-10-05',period:'D−7' as const,sheet:makeSheet('',true)};
const a=buildMotorLalo(makeSheet('7492'),'2026-10-12','Primera',[historical]);
const b=buildMotorLalo(makeSheet('0000'),'2026-10-12','Primera',[historical]);
assert.deepEqual(a,b,'PRE no debe consultar cabezas objetivo ni marcas POST');
assert.equal(reversibleFamily('729'),'729/927');
assert.ok(a.ranks.vt3.some(f=>f.family==='749/947'),'VT3 trasladada sin inventar cifra');
assert.ok(a.ranks.vt2.some(f=>f.family==='47/74'||f.family==='49/94'),'VT2 propia o derivada de una ruta');
assert.deepEqual(vt4PrefixFamily('044/440','3'),['3044','3440'],
 'El 3 siempre se antepone a ambas orientaciones de madre 044/440');
assert.ok(!vt4PrefixFamily('044/440','3').includes('0443'));
assert.ok(!vt4PrefixFamily('044/440','3').includes('4403'));
const selectedMother='749/947';
assert.ok(a.ranks.vt4.some(f=>f.paths.some(p=>(p.mothers||[]).includes(selectedMother))),
 'La madre 749/947 debe conservar hijos físicos con cifra antepuesta');
const motherVt4=a.ranks.vt4.flatMap(f=>f.paths.filter(p=>(p.mothers||[]).includes(selectedMother)));
assert.ok(motherVt4.length>0);
for(const p of motherVt4){
 const value=p.path.map(c=>c.digit).join('');
 assert.equal(p.value,value,'La hija VT4 debe leerse de su recorrido propio');
 assert.ok(p.addedDigit);
 assert.ok(['749','947'].some(m=>
  value===p.addedDigit+m),
  'VT4 nunca agrega la cifra a la derecha de la madre VT3');
 assert.equal(new Set(p.path.map(c=>c.row+':'+c.col)).size,4);
}
assert.ok(a.ranks.vt4.every(f=>f.paths.every(p=>{
 const end=p.path.slice(1).map(c=>c.digit).join('');
 const expected=vt4PrefixFamily(p.mother||'',p.path[0].digit);
 return expected.includes(p.value)&&p.value===p.path[0].digit+end;
})), 'Todas las hijas del motor deben ser cifra añadida + madre VT3 física');
assert.ok(!a.ranks.vt4.some(f=>f.parentFamilies.includes(selectedMother)&&
 f.family==='7492/9472'),'La hija 7492 nace agregando 2 a la derecha y se descarta');
const future=makeSheet('7492');
future.columns[2].values=['99','99','99','99','99','99'];
future.columns[4].values=['11','11','11','11','11','11'];
assert.deepEqual(a,buildMotorLalo(future,'2026-10-12','Primera',[historical]),
 'Ni las columnas del futuro ni los resultados objetivo participan en PRE');
for(const k of ['vt2','vt3','vt4'] as const)for(const f of a.ranks[k]){
 assert.ok(f.paths.every(p=>p.sourceId==='prevNocturno'),'nunca cruzar fuentes');
 assert.ok(f.paths.every(p=>new Set(p.path.map(c=>c.row+':'+c.col)).size===p.path.length),
  'nunca reutilizar casillas');
}
const x=a.ranks.vt3.find(f=>f.family==='749/947');
assert.ok(x);
assert.equal(x.d7Roots,1,'doble ruta de una cabeza no son dos cabezas históricas');
assert.notDeepEqual(compareMotorLaloAfterDraw(a,['7492']),compareMotorLaloAfterDraw(a,['0000']),
 'POST separado del ranking');
assert.equal(buildMotorLalo(makeSheet(''),'2026-10-12','Primera',[
 {...historical,sheet:makeSheet('',true,'Montevideo')}
]).roots.length,0,'Montevideo es fuente geométrica, no jurisdicción de confirmación');
assert.throws(()=>buildMotorLalo(makeSheet(''),'2026-10-12','Primera',[
 {...historical,date:'2026-10-12'}
]),/Fuga temporal/);
console.log('MOTOR_LALO_OK: PRE aislado, VT2/3/4, rutas físicas, Montevideo, deduplicación y POST separados.');
