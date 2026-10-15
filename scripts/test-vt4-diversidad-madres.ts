import assert from 'node:assert/strict';
import {distributeVt4ByMother,buildMotorLalo,vt4PrefixFamily} from '../src/motorLalo';
import type {LaloFamily} from '../src/motorLalo';
import {TURNOS} from '../src/domain';
import type {DailySheet,SheetColumn,Match} from '../src/sheet';
import type {Path} from '../src/paths';

function mother(n:number):LaloFamily{
 return {family:'VT3-'+n,kind:'vt3',rank:n} as LaloFamily;
}
function daughter(m:number,seq:number):LaloFamily{
 return {family:'VT4-'+m+'-'+seq,kind:'vt4',rank:0,
  parentFamilies:['VT3-'+m],sourceCount:1,physicalBlocks:1} as LaloFamily;
}
const mothers=Array.from({length:10},(_,i)=>mother(i+1));
// Ranking anterior: seis hijas de la primera madre ocupan seis puestos.
// Simulamos ranking de fuerza física por madre sin modificar la selección.
const raw=[...Array.from({length:6},(_,i)=>daughter(1,i+1)),
 ...Array.from({length:3},(_,i)=>daughter(2,i+1)),
 ...Array.from({length:2},(_,i)=>daughter(3,i+1)),
 daughter(4,1),daughter(5,1),daughter(6,1),
 daughter(7,1),daughter(8,1),daughter(9,1),daughter(10,1)];
const result=distributeVt4ByMother(raw,mothers);
assert.deepEqual(result.slice(0,10).map(x=>x.parentFamilies[0]),
 mothers.map(x=>x.family),
 'Ronda 1: la madre VT3 #5 y todas las que tienen hija alcanzan Top10');
assert.deepEqual(result.slice(10,14).map(x=>x.family),
 ['VT4-1-2','VT4-2-2','VT4-3-2','VT4-1-3'],
 'Ronda 2 conserva la fuerza dentro de cada madre y salta madres agotadas');
assert.deepEqual(result.map(x=>x.family).slice().sort(),
 raw.map(x=>x.family).slice().sort(),'Reordenar no crea ni pierde ninguna hija');
assert.deepEqual(result.map(x=>x.rank),Array.from({length:raw.length},(_,i)=>i+1));
assert.equal(result[0].family,'VT4-1-1','La mejor de VT3 #1 sigue siendo #1');
assert.equal(result[4].family,'VT4-5-1','La mejor de VT3 #5 queda #5');
const gaps=distributeVt4ByMother([daughter(1,1),daughter(1,2),
 daughter(5,1),daughter(7,1)],mothers);
assert.deepEqual(gaps.map(x=>x.parentFamilies[0]),
 ['VT3-1','VT3-5','VT3-7','VT3-1'],
 'Madres sin una extensión no gastan puestos');
assert.deepEqual(distributeVt4ByMother([],mothers),[]);
assert.deepEqual(vt4PrefixFamily('044/440','3'),['3044','3440']);
assert.ok(!vt4PrefixFamily('044/440','3').includes('0443'));

const ids:SheetColumn['id'][]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const oldPath:Path=[{row:0,col:0,digit:'5'},{row:1,col:0,digit:'1'},{row:2,col:0,digit:'7'}];
const match:Match={turno:'Previa',jurisdiccion:'Ciudad',cabeza:'2517',hits:[
 {kind:'vt3',value:'517',sourceId:'prevNocturno',sourceTurn:'Nocturno anterior',paths:[oldPath]}]};
const sheet=(targetHead:string,old=false):DailySheet=>({
 columns:ids.map((id,i)=>({id,turno:TURNOS[i],sourceLabel:id,
 values:i===0?(old?['58','16','79','02','23','14']:['76','48','93','21','34','56']):
  ['--','--','--','--','--','--']})),
 heads:Object.fromEntries(TURNOS.map(t=>[t,t==='Primera'?[targetHead]:[]])),
 matches:Object.fromEntries(TURNOS.map(t=>[t,t==='Previa'&&old?[match]:[]]))
});
const history=[{date:'2026-10-05',period:'D−7' as const,sheet:sheet('',true)}];
const a=buildMotorLalo(sheet('7492'),'2026-10-12','Primera',history);
const b=buildMotorLalo(sheet('0000'),'2026-10-12','Primera',history);
assert.deepEqual(a,b,'La diversidad de madres sólo usa el PRE, nunca la cabeza objetivo');
const possibleMotherRanks=a.ranks.vt3.slice(0,10).map(f=>f.family);
const firstByMother=new Set<string>();
const topGeneration=a.ranks.vt4.slice(0,10);
for(const f of topGeneration){
 const mother=f.parentFamilies[0];
 assert.ok(possibleMotherRanks.includes(mother),'Toda hija tiene una madre top10 real');
 assert.ok(!firstByMother.has(mother),
  'Mientras queden madres con hijas, no ocupar dos puestos de la primera ronda');
 firstByMother.add(mother);
 assert.ok(f.paths.length>0);
 assert.ok(f.paths.every(p=>{
  const digits=p.path.map(c=>c.digit).join('');
  return p.path.length===4&&p.value===digits&&p.addedDigit===p.path[0].digit&&
   vt4PrefixFamily(p.mother||'',p.addedDigit).includes(p.value);
 }), 'Las nuevas posiciones no cambian reglas de formación de VT4');
}
console.log('VT4_DIVERSIDAD_OK: una hija por madre primero, posteriores por rondas, sin inventar rutas ni leer POST.');
