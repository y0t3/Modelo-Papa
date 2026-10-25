import assert from 'node:assert/strict';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {diaVacio,JURS,mas11} from '../src/domain';
import type {CabezasDia} from '../src/domain';

function fixture(nocturno:Record<string,string>):CabezasDia{
 const d=diaVacio();for(const [j,v] of Object.entries(nocturno))d.Nocturno[j]=v;
 return d;
}
const docs:Record<string,CabezasDia>={
 '2026-06-20':fixture({Montevideo:'0963'}),
 '2026-06-19':fixture({Ciudad:'8461',Provincia:'7601',Córdoba:'6238',
  'Santa Fé':'6210','Entre Ríos':'0626'}),
 '2026-07-09':fixture({Montevideo:'0802'}),
 '2026-07-08':fixture({Ciudad:'6828',Provincia:'5071',Córdoba:'8367',
  'Santa Fé':'3980','Entre Ríos':'1309',Montevideo:'6575'}),
 '2026-10-24':fixture({Ciudad:'0000',Montevideo:'0912'}),
 '2026-10-23':fixture({Provincia:'0019',Córdoba:'2290','Santa Fé':'6723',
  'Entre Ríos':'0007',Ciudad:'8244',Montevideo:'0099'})
};
const visits:string[]=[];
const get=async(date:string)=>{visits.push(date);return docs[date]||diaVacio()};
async function run(){
 const june=await nocturnaAnteriorPorJur('2026-06-22',get,6);
 assert.deepEqual(june.checked,['2026-06-20','2026-06-19']);
 assert.equal(june.dates.Montevideo,'2026-06-20');
 assert.equal(june.heads.Nocturno.Montevideo,'0963');
 assert.equal(june.dates.Ciudad,'2026-06-19');
 assert.equal(june.heads.Nocturno.Ciudad,'8461');
 assert.deepEqual(june.missing,[]);
 assert.deepEqual(JURS.map(j=>june.heads.Nocturno[j]),
  ['8461','7601','6238','6210','0626','0963']);
 const board=buildSheet(diaVacio(),june.heads);
 assert.deepEqual(board.columns[0].values,
  JURS.map(j=>mas11(june.heads.Nocturno[j])));
 assert.equal(board.columns[0].values[5],'74'); // 63 + 11
 assert.deepEqual(june.heads.Previa,JURS.reduce((acc,j)=>
  ({...acc,[j]:'----'}),{}),'No inventar Previa');
 const july=await nocturnaAnteriorPorJur('2026-07-10',get,6);
 assert.deepEqual(july.checked,['2026-07-09','2026-07-08']);
 assert.deepEqual(JURS.map(j=>july.heads.Nocturno[j]),
  ['6828','5071','8367','3980','1309','0802']);
 assert.equal(july.dates.Montevideo,'2026-07-09');
 // Lunes: buscar sábado primero, nunca inventar domingo.
 const monday=await nocturnaAnteriorPorJur('2026-10-26',get,5);
 assert.deepEqual(monday.checked,['2026-10-24','2026-10-23']);
 assert.equal(monday.heads.Nocturno.Ciudad,'0000');
 assert.equal(monday.heads.Nocturno.Montevideo,'0912');
 assert.equal(monday.heads.Nocturno.Provincia,'0019');
 assert.equal(monday.dates.Provincia,'2026-10-23');
 assert.deepEqual(monday.missing,[]);
 assert.ok(visits.every(date=>date!=='2026-10-25'));
 // Sin datos: declarar explícitamente faltantes, no suponer valor 0000.
 const blank=await nocturnaAnteriorPorJur('2026-08-01',get,2);
 assert.equal(blank.missing.length,6);
 assert.equal(blank.heads.Nocturno.Ciudad,'----');
 assert.deepEqual(blank.checked,['2026-07-31','2026-07-30']);
 const short=await nocturnaAnteriorPorJur('2026-06-22',get,1);
 assert.deepEqual(short.missing,[
  'Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos']);
 assert.equal(short.heads.Nocturno.Montevideo,'0963');
 // No tolerar datos futuros o fechas inválidas.
 await assert.rejects(()=>nocturnaAnteriorPorJur('invalida',get),/Fecha objetivo/);
 await assert.rejects(()=>nocturnaAnteriorPorJur('2026-06-22',get,0),/Lookback/);
 console.log('POR_JUR_TEST_OK: feriados, Montevideo, lunes, sábado, vacíos, ceros, no fugas');
}
void run().catch(e=>{console.error(e);process.exitCode=1});
