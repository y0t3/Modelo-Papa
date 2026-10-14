import assert from 'node:assert/strict';
import {sha256} from '../src/sha256';
import {allPhysicalVt3,buildVt3Shadow} from '../src/vt3Shadow';
import {auditVt3Family} from '../src/vt3Audit';
import {buildMotorLalo} from '../src/motorLalo';
import type {DailySheet,SheetColumn,Match} from '../src/sheet';
import type {Path} from '../src/paths';
import {TURNOS} from '../src/domain';

assert.equal(sha256(''),'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
assert.equal(sha256('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
assert.equal(sha256('hola 😊').length,64);
const grid=['76','48','93','21','34','56'];
const routes=allPhysicalVt3(grid);
assert.ok(routes.length>50);
assert.equal(new Set(routes.map(p=>{
 const s=p.map(c=>c.row+':'+c.col);
 return [s.join('>'),s.slice().reverse().join('>')].sort()[0];
})).size,routes.length);
for(const r of routes){
 assert.equal(r.length,3);
 assert.equal(new Set(r.map(c=>c.row+':'+c.col)).size,3);
 assert.ok(r.every((c,i)=>i===0||Math.max(Math.abs(c.row-r[i-1].row),Math.abs(c.col-r[i-1].col))===1));
}
const ids:SheetColumn['id'][]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const path:Path=[{row:0,col:0,digit:'5'},{row:1,col:0,digit:'1'},{row:2,col:0,digit:'7'}];
const m:Match={turno:'Previa',jurisdiccion:'Ciudad',cabeza:'2517',hits:[
 {kind:'vt3',value:'517',sourceId:'prevNocturno',sourceTurn:'Nocturno anterior',paths:[path]}]};
function sheet(result:string):DailySheet{
 return {columns:ids.map((id,i)=>({id,turno:TURNOS[i],sourceLabel:id,
  values:i===0?grid:['--','--','--','--','--','--']})),
  heads:Object.fromEntries(TURNOS.map(t=>[t,t==='Primera'?[result]:[]])),
  matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))};
}
const old:DailySheet={columns:ids.map((id,i)=>({id,turno:TURNOS[i],sourceLabel:id,
 values:i===0?['58','16','79','02','23','14']:['--','--','--','--','--','--']})),
 heads:Object.fromEntries(TURNOS.map(t=>[t,[]])),
 matches:Object.fromEntries(TURNOS.map(t=>[t,t==='Previa'?[m]:[]]))};
const hist=[{date:'2026-10-05',period:'D−7' as const,sheet:old}];
const s1=sheet('7492'),s2=sheet('0000');
const official1=buildMotorLalo(s1,'2026-10-12','Primera',hist);
const official2=buildMotorLalo(s2,'2026-10-12','Primera',hist);
assert.deepEqual(official1,official2);
const shadow1=buildVt3Shadow(s1,'2026-10-12','Primera',hist,official1);
const shadow2=buildVt3Shadow(s2,'2026-10-12','Primera',hist,official2);
assert.deepEqual(shadow1,shadow2,'La sombra jamás lee resultados objetivo');
assert.equal(shadow1.top.length,10);
assert.equal(new Set(shadow1.top.map(x=>x.family)).size,10);
assert.ok(shadow1.top.every(x=>x.source==='prevNocturno'));
assert.throws(()=>buildVt3Shadow(s1,'2026-10-12','Primera',[
 {...hist[0],date:'2026-10-12'}],official1),/futuras/);
const diagnosis=auditVt3Family(s1,official1,'Primera','749');
assert.ok(diagnosis);
assert.equal(diagnosis.evolution.length,2);
assert.equal(diagnosis.evolution[0].event,'INICIAL');
assert.equal(diagnosis.evolution[1].event,'SIN_NOVEDAD');
assert.equal(diagnosis.currentEvent,'SIN_NOVEDAD');
assert.ok(diagnosis.physicalRoutes>0);
console.log('LALO_CONSOLIDADO_OK: SHA256, PRE sombra, genealogía física, rutas contiguas, evolución VT3 y cinco turnos.');
