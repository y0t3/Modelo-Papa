import assert from 'node:assert/strict';
import {diaVacio,JURS,mas11} from '../src/domain';
import {buildInfoWeekPorJur} from '../src/infoWeek';
import {fusionarNocturnasPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import type {CabezasDia} from '../src/domain';
const base=(night:Record<string,string>):CabezasDia=>{
 const d=diaVacio();for(const [j,v] of Object.entries(night))d.Nocturno[j]=v;return d;
};
const prev=base({Ciudad:'8461',Provincia:'7601',Córdoba:'6238',
 'Santa Fé':'6210','Entre Ríos':'0626'});
const partial=base({Montevideo:'0963'});
const joined=fusionarNocturnasPorJur(prev,partial);
assert.deepEqual(JURS.map(j=>joined.Nocturno[j]),[
 '8461','7601','6238','6210','0626','0963']);
assert.deepEqual(prev.Nocturno.Montevideo,'----');
assert.ok(JURS.every(j=>joined.Primera[j]==='----'));
const monday=diaVacio();monday.Matutino.Ciudad='9721';
const info=buildInfoWeekPorJur('2026-06-20','2026-06-23',[
 {date:'2026-06-20',heads:partial},
 {date:'2026-06-21',heads:diaVacio()},
 {date:'2026-06-22',heads:monday}],prev);
assert.deepEqual(info.map(d=>d.date),['2026-06-20','2026-06-22']);
assert.deepEqual(info[1].sheet.columns[0].values,JURS.map(j=>mas11(joined.Nocturno[j])));
assert.deepEqual(info[1].sheet.columns[0].values,buildSheet(monday,joined).columns[0].values);
assert.equal(info[1].heads.Matutino.Ciudad,'9721');
assert.equal(info[1].heads.Nocturno.Ciudad,'----');
const next=fusionarNocturnasPorJur(joined,base({Ciudad:'0000'}));
assert.equal(next.Nocturno.Ciudad,'0000');
assert.equal(next.Nocturno.Montevideo,'0963');
assert.equal(joined.Nocturno.Ciudad,'8461');
assert.deepEqual(fusionarNocturnasPorJur(joined,diaVacio()).Nocturno,joined.Nocturno);
console.log('INFO_JUR_OK: feria, sábado, minihojas, ceros, recarga, no se inventan turnos');
