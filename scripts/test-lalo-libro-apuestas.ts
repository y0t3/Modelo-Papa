import assert from 'node:assert/strict';
import {TURNOS,diaVacio} from '../src/domain';
import type {DailySheet,SheetColumn} from '../src/sheet';
import {buildPre,validateSnapshot} from '../src/papaPronostico';
import type {PapaRecord} from '../src/papaPronostico';
import {sha256} from '../src/sha256';
import {betEvaluation,betLinesForPre,blankBetLedger,canConfirmBet,
 prepareTicket,pesosEnteros,receiptTotal,spentAndCollected,ticketHead,
 validLedger,validTicket,withReceipt,withTicket} from '../src/laloApuestas';

const ids:SheetColumn['id'][]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const sheet:DailySheet={
 columns:ids.map((id,i)=>({id,sourceLabel:id,turno:TURNOS[i],
  values:i===0?['76','48','93','21','34','56']:['--','--','--','--','--','--']})),
 heads:{},matches:{}
};
const cells=[{row:1,col:0},{row:0,col:0},{row:0,col:1},{row:1,col:1}];
const vt4={id:'vt4|prevNocturno|1:0>0:0>0:1>1:1',kind:'vt4' as const,
 value:'4768',family:'4768',sourceId:'prevNocturno' as const,cells,
 motherVt3:'768/867'};
const snap=buildPre({date:'2026-10-15',turn:'Previa',picks:[vt4]},
 sheet,'2026-10-15T01:00:00Z');
assert.equal(snap.pre.schema,'PAPA_PRE_V3');
assert.ok(validateSnapshot(snap));
const rec:PapaRecord={snapshot:snap};
const list=betLinesForPre(rec);
assert.deepEqual(list.map(l=>l.kind+' '+l.value),['vt4 4768','vt3 768','vt2 68']);
assert.equal(new Set(list.map(l=>l.key)).size,3);
assert.equal(list.filter(l=>l.autoFrom).length,2);
assert.equal(pesosEnteros('1000'),1000);
assert.equal(pesosEnteros('1.000'),1000);
assert.equal(pesosEnteros('2.500'),2500);
assert.equal(pesosEnteros('1000,50'),null);
assert.equal(pesosEnteros('0'),null);
assert.equal(pesosEnteros('-100'),null);
assert.equal(pesosEnteros('abc'),null);

const ticket=prepareTicket(rec,list.map(x=>x.key),1000,'Ciudad','boleta1',
 '2026-10-15T02:01:00Z');
assert.equal(ticket.pre.totalPesos,3000,'$1.000 cada 4/3/2 significa gastar $3.000');
assert.equal(ticket.pre.stakePerLinePesos,1000);
assert.equal(ticket.pre.lines.length,3);
assert.equal(ticket.pre.alcance,'cabeza');
assert.ok(validTicket(ticket));
assert.deepEqual(betEvaluation(ticket,null).matched,[]);
assert.equal(betEvaluation(ticket,null).status,'pendiente');
assert.deepEqual(betEvaluation(ticket,'4768').matched.map(l=>l.value),['4768','768','68']);
assert.deepEqual(betEvaluation(ticket,'1768').matched.map(l=>l.value),['768','68']);
assert.deepEqual(betEvaluation(ticket,'9068').matched.map(l=>l.value),['68']);
assert.deepEqual(betEvaluation(ticket,'4867').matched.map(l=>l.value),[],
 'Invertir una familia VT3 NO implica apostar ese valor literal');
assert.equal(betEvaluation(ticket,'4867').status,'sin_coincidencia');

assert.throws(()=>prepareTicket(rec,list.map(l=>l.key),0,'Ciudad','id','2026-10-15T01:00:00Z'));
assert.throws(()=>prepareTicket(rec,['vt3|inventado'],1000,'Ciudad','id','2026-10-15T01:00:00Z'));
assert.throws(()=>prepareTicket(rec,list.map(l=>l.key),1000,'Montevideo','id','2026-10-15T01:00:00Z'));
assert.throws(()=>prepareTicket(rec,list.map(l=>l.key),1000,'Ciudad','','2026-10-15T01:00:00Z'));
const only2=prepareTicket(rec,[list[2].key],1000,'Provincia','boleta2','2026-10-15T01:00:00Z');
assert.equal(only2.pre.totalPesos,1000,'Una VT2 individual solo cuesta una apuesta');
assert.deepEqual(only2.pre.lines.map(l=>l.value),['68']);

const oldPre={...snap.pre,schema:'PAPA_PRE_V2' as const};
const oldSnapshot={pre:oldPre,sha256:sha256(JSON.stringify(oldPre))};
assert.ok(validateSnapshot(oldSnapshot));
const oldRecord:PapaRecord={snapshot:oldSnapshot};
assert.deepEqual(betLinesForPre(oldRecord).map(l=>l.value),['4768'],
 'Pronóstico viejo sin bajada retroactiva no crea nuevas apuestas');
const original=JSON.stringify(snap);
const tampered={...ticket,pre:{...ticket.pre,totalPesos:1}};
assert.equal(validTicket(tampered),false);
assert.equal(JSON.stringify(snap),original,'Apostar no cambia el PRE firmado');

const ledger=withTicket(withTicket(blankBetLedger(),ticket),only2);
assert.equal(ledger.tickets.length,2);
assert.ok(validLedger(ledger));
assert.deepEqual(spentAndCollected(ledger),{
 tickets:2,lines:4,spentPesos:4000,collectedPesos:0,netPesos:-4000
});
assert.throws(()=>withTicket(ledger,ticket),'No duplicar ticket físico');
const paid=withReceipt(ledger,ticket.pre.id,12000,'2026-10-15T18:00:00Z','cobro1');
assert.equal(receiptTotal(paid,'boleta1'),12000);
assert.equal(receiptTotal(paid,'boleta2'),0);
assert.deepEqual(spentAndCollected(paid),{
 tickets:2,lines:4,spentPesos:4000,collectedPesos:12000,netPesos:8000
},'Resultado neto = premio cobrado MENOS gasto');
assert.deepEqual(spentAndCollected(paid,t=>t.pre.jurisdiction==='Provincia'),{
 tickets:1,lines:1,spentPesos:1000,collectedPesos:0,netPesos:-1000
});
assert.throws(()=>withReceipt(ledger,'boleta-desconocida',100,'2026-10-15T18:00:00Z','z'));
assert.throws(()=>withReceipt(paid,'boleta1',100,'2026-10-15T18:00:00Z','cobro1'));
assert.ok(validLedger(paid));

const observed=diaVacio();observed.Previa.Ciudad='4768';
assert.equal(ticketHead(ticket,[rec],observed),'4768');
assert.equal(ticketHead(ticket,[rec],diaVacio()),null);
assert.equal(canConfirmBet(rec,'2026-10-10',diaVacio()),false);
assert.equal(canConfirmBet(rec,'2026-10-15',observed),false,
 'No confirmar apuesta cuando el resultado ya se conoce');
console.log('LALO_LIBRO_OK: bajar $1000 a cada 4/3/2, exactitud literal, boleta local, cobros y neto, PRE intacto.');
