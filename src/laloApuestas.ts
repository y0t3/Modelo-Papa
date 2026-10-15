// Libro personal de apuestas REALES, separado de los pronósticos PRE.
// Sin tarifas supuestas: coincidencia literal a la cabeza != importe cobrado.
import {PAPA_JURS,expandDownPicks,validateSnapshot,recordId,todayLocal} from './papaPronostico';
import {JURS} from './domain';
import {limpiarJurisdicciones} from './laloJurisdicciones';
import type {PapaKind,PapaRecord} from './papaPronostico';
import type {CabezasDia,Turno} from './domain';
import {sha256} from './sha256';

export type LaloBetKind=PapaKind;
export type BetLine={kind:LaloBetKind;value:string;key:string;autoFrom:boolean};
export type BetTicketPre={
 schema:'LALO_APUESTA_V1';id:string;date:string;turn:Turno;jurisdiction:string;
 createdAt:string;preSha256:string;
 alcance:'cabeza';stakePerLinePesos:number;
 lines:BetLine[];totalPesos:number;
};
export type BetTicket={pre:BetTicketPre;sha256:string};
export type BetReceipt={id:string;ticketId:string;createdAt:string;amountPesos:number};
export type BetLedger={schema:'LALO_LIBRO_V1';tickets:BetTicket[];receipts:BetReceipt[]};

export const blankBetLedger=():BetLedger=>({schema:'LALO_LIBRO_V1',tickets:[],receipts:[]});
export const betLineKey=(kind:LaloBetKind,value:string)=>kind+'|'+value;

/** Números literales, no familias reversibles: 044 y 440 son apuestas distintas. */
export function betLinesForPre(record:PapaRecord):BetLine[]{
 if(!validateSnapshot(record.snapshot))throw Error('Pronóstico congelado inválido');
 const canLower=record.snapshot.pre.schema==='PAPA_PRE_V3';
 const seen=new Map<string,BetLine>();
 for(const p of expandDownPicks(record.snapshot.pre.picks,canLower)){
  const key=betLineKey(p.kind,p.value);
  const prior=seen.get(key);
  if(prior){
   // Si un número se marcó manualmente, conservar esa procedencia.
   if(prior.autoFrom&&!p.autoFrom)seen.set(key,{...prior,autoFrom:false});
   continue;
  }
  seen.set(key,{kind:p.kind,value:p.value,key,autoFrom:!!p.autoFrom});
 }
 return [...seen.values()];
}
export function pesosEnteros(raw:string):number|null{
 const s=raw.trim().replace(/\s+/g,'');
 // $1.000 / 1000; no convertir silenciosamente comas o centavos.
 if(!/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(s))return null;
 const value=Number(s.replace(/\./g,''));
 return Number.isSafeInteger(value)&&value>0?value:null;
}
const integerPesos=(n:number)=>Number.isSafeInteger(n)&&n>0;
const isDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s);
const isIso=(s:string)=>typeof s==='string'&&!Number.isNaN(Date.parse(s));
const isLine=(line:BetLine)=>{
 const n=line.kind==='vt2'?2:line.kind==='vt3'?3:line.kind==='vt4'?4:0;
 return n>0&&new RegExp('^\\d{'+n+'}$').test(line.value)&&
  line.key===betLineKey(line.kind,line.value)&&typeof line.autoFrom==='boolean';
};
export function prepareTicket(record:PapaRecord,selectedKeys:string[],
 stakePerLinePesos:number,jurisdiction:string,id:string,createdAt:string):BetTicket{
 const source=record.snapshot;
 if(!validateSnapshot(source))throw Error('PRE dañado');
 if(!integerPesos(stakePerLinePesos))throw Error('Ingresá un importe entero positivo por número');
 if(!JURS.includes(jurisdiction as typeof JURS[number]))
  throw Error('Elegí una jurisdicción');
 if(!id||!isIso(createdAt))throw Error('Identificador o fecha de apuesta inválidos');
 const candidates=betLinesForPre(record);
 const selected=new Set(selectedKeys);
 const lines=candidates.filter(l=>selected.has(l.key));
 if(selected.size!==lines.length||!lines.length)throw Error('Elegí números válidos del PRE congelado');
 const total=lines.length*stakePerLinePesos;
 if(!Number.isSafeInteger(total))throw Error('El gasto excede el límite numérico');
 const pre:BetTicketPre={
  schema:'LALO_APUESTA_V1',id,date:source.pre.date,turn:source.pre.turn,
  jurisdiction,createdAt,preSha256:source.sha256,
  alcance:'cabeza',stakePerLinePesos,
  lines,totalPesos:total
 };
 return {pre,sha256:sha256(JSON.stringify(pre))};
}
/**
 * Confirmación de una única apuesta para cada jurisdicción efectivamente jugada.
 * Los números y el importe unitario son idénticos; se multiplica por el número
 * de sorteos confirmados, y se conservan tickets individuales para cotejar.
 */
export function prepareTickets(record:PapaRecord,selectedKeys:string[],
 stakePerLinePesos:number,jurisdictions:string[],batchId:string,
 createdAt:string):BetTicket[]{
 const normalized=limpiarJurisdicciones(jurisdictions);
 if(!jurisdictions.length||normalized.length!==jurisdictions.length)
  throw Error('Seleccioná jurisdicciones válidas sin repetir ninguna');
 if(jurisdictions.some(j=>!JURS.includes(j as typeof JURS[number])))
  throw Error('Jurisdicción desconocida');
 return normalized.map(jur=>prepareTicket(record,selectedKeys,stakePerLinePesos,
  jur,batchId+'|'+jur,createdAt));
}
export function plannedSpend(stake:number,lines:number,jurisdictions:number):number|null{
 const total=stake*lines*jurisdictions;
 return Number.isSafeInteger(total)&&stake>0&&lines>0&&jurisdictions>0?total:null;
}
export function validTicket(ticket:BetTicket):boolean{
 const p=ticket?.pre;
 if(!p||p.schema!=='LALO_APUESTA_V1'||p.alcance!=='cabeza'||
  !isDate(p.date)||!isIso(p.createdAt)||!p.id||!p.preSha256||
  !JURS.includes(p.jurisdiction as typeof JURS[number])||
  !integerPesos(p.stakePerLinePesos)||!Array.isArray(p.lines)||
  !p.lines.length||p.lines.some(l=>!isLine(l)))return false;
 if(new Set(p.lines.map(l=>l.key)).size!==p.lines.length)return false;
 if(!Number.isSafeInteger(p.totalPesos)||
  p.totalPesos!==p.stakePerLinePesos*p.lines.length)return false;
 return sha256(JSON.stringify(p))===ticket.sha256;
}
export function ticketHead(ticket:BetTicket,records:PapaRecord[],
 currentHeads?:CabezasDia|null):string|null{
 const p=ticket.pre;
 const r=records.find(x=>recordId(x.snapshot.pre.date,x.snapshot.pre.turn)===recordId(p.date,p.turn)&&
  x.snapshot.sha256===p.preSha256);
 const already=r?.post?.heads[p.jurisdiction];
 const live=currentHeads?.[p.turn]?.[p.jurisdiction];
 const head=already||live;
 return head&&/^\d{4}$/.test(head)?head:null;
}
export function betEvaluation(ticket:BetTicket,head:string|null){
 if(!validTicket(ticket))throw Error('Apuesta dañada');
 if(!head||!/^\d{4}$/.test(head))
  return {status:'pendiente' as const,head:null,matched:[] as BetLine[],unmatched:[] as BetLine[]};
 const matched=ticket.pre.lines.filter(l=>head.endsWith(l.value));
 const unmatched=ticket.pre.lines.filter(l=>!head.endsWith(l.value));
 return {status:matched.length?'coincidencia' as const:'sin_coincidencia' as const,head,matched,unmatched};
}
export function validLedger(ledger:BetLedger):boolean{
 if(ledger?.schema!=='LALO_LIBRO_V1'||!Array.isArray(ledger.tickets)||
  !Array.isArray(ledger.receipts))return false;
 const ids=new Set<string>();
 for(const t of ledger.tickets){
  if(!validTicket(t)||ids.has(t.pre.id))return false;
  ids.add(t.pre.id);
 }
 const receiptIds=new Set<string>();
 for(const r of ledger.receipts){
  if(!r.id||receiptIds.has(r.id)||!ids.has(r.ticketId)||
   !integerPesos(r.amountPesos)||!isIso(r.createdAt))return false;
  receiptIds.add(r.id);
 }
 return true;
}
export function withTickets(ledger:BetLedger,tickets:BetTicket[]):BetLedger{
 if(!validLedger(ledger)||!tickets.length||tickets.some(t=>!validTicket(t)))
  throw Error('Boletas o libro inválidos');
 const ids=new Set(ledger.tickets.map(t=>t.pre.id));
 const existing=new Set(ledger.tickets.map(t=>
  [t.pre.date,t.pre.turn,t.pre.jurisdiction,t.pre.stakePerLinePesos,
   t.pre.lines.map(l=>l.key).sort().join(';')].join('|')));
 const batch=new Set<string>();
 for(const t of tickets){
  if(ids.has(t.pre.id))throw Error('Boleta ya registrada');
  const signature=[t.pre.date,t.pre.turn,t.pre.jurisdiction,
   t.pre.stakePerLinePesos,t.pre.lines.map(l=>l.key).sort().join(';')].join('|');
  if(existing.has(signature)||batch.has(signature))
   throw Error('Esta misma apuesta ya se registró en una jurisdicción');
  ids.add(t.pre.id);batch.add(signature);
 }
 return {...ledger,tickets:[...ledger.tickets,...tickets]};
}
export function withTicket(ledger:BetLedger,ticket:BetTicket):BetLedger{
 if(!validLedger(ledger)||!validTicket(ticket))throw Error('Apuesta o registro no válidos');
 if(ledger.tickets.some(t=>t.pre.id===ticket.pre.id))throw Error('Identificador de apuesta repetido');
 return {...ledger,tickets:[...ledger.tickets,ticket]};
}
export function withReceipt(ledger:BetLedger,ticketId:string,amountPesos:number,
 createdAt:string,id:string):BetLedger{
 if(!validLedger(ledger))throw Error('Registro de apuestas inválido');
 if(!ledger.tickets.some(t=>t.pre.id===ticketId))throw Error('Apuesta inexistente');
 if(!integerPesos(amountPesos)||!isIso(createdAt)||!id||
   ledger.receipts.some(r=>r.id===id))throw Error('Cobro inválido o repetido');
 return {...ledger,receipts:[...ledger.receipts,{ticketId,amountPesos,createdAt,id}]};
}
export function spentAndCollected(ledger:BetLedger,filter?:(t:BetTicket)=>boolean){
 if(!validLedger(ledger))throw Error('Libro de apuestas inválido');
 const selected=ledger.tickets.filter(filter||(()=>true));
 const ids=new Set(selected.map(t=>t.pre.id));
 const spentPesos=selected.reduce((s,t)=>s+t.pre.totalPesos,0);
 const collectedPesos=ledger.receipts.filter(r=>ids.has(r.ticketId))
  .reduce((s,r)=>s+r.amountPesos,0);
 return {tickets:selected.length,lines:selected.reduce((s,t)=>s+t.pre.lines.length,0),
  spentPesos,collectedPesos,netPesos:collectedPesos-spentPesos};
}
export const receiptTotal=(ledger:BetLedger,ticketId:string)=>ledger.receipts
 .filter(r=>r.ticketId===ticketId).reduce((sum,r)=>sum+r.amountPesos,0);

/** La fecha, turno y cabezas comprueban que una boleta nueva sea PRE. */
export function canConfirmBet(record:PapaRecord,date:string,heads:CabezasDia|null):boolean{
 const p=record.snapshot.pre;
 if(p.date!==date||date!==todayLocal())return false;
 if(record.post?.heads&&Object.keys(record.post.heads).length>0)return false;
 return !JURS.some(j=>/^\d{4}$/.test(heads?.[p.turn]?.[j]||''));
}
