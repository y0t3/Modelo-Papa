import assert from 'node:assert/strict';
import {buildMotorLalo,compareMotorLaloAfterDraw,reversibleFamily} from '../src/motorLalo';
import type {DailySheet,SheetColumn,Match} from '../src/sheet';
import type {Path} from '../src/paths';
import {TURNOS} from '../src/domain';

const pairs=['76','42','93','21','34','56'];
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
assert.ok(a.ranks.vt4.some(f=>f.family===reversibleFamily('7492')),
 'VT4 sólo si hay ruta de cuatro celdas');
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
