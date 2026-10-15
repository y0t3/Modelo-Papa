import AsyncStorage from '@react-native-async-storage/async-storage';
import {blankBetLedger,canConfirmBet,prepareTicket,validLedger,withReceipt,withTicket,withTickets,prepareTickets,betEvaluation,ticketHead} from './laloApuestas';
import type {BetLedger} from './laloApuestas';
import {loadRecords} from './papaRegistro';
import type {CabezasDia} from './domain';

const KEY='modelo-lalo:apuestas-reales-v1';
let writeLock=false;

export async function loadBetLedger():Promise<BetLedger>{
 const raw=await AsyncStorage.getItem(KEY);
 if(!raw)return blankBetLedger();
 const value=JSON.parse(raw) as BetLedger;
 if(!validLedger(value))throw Error('Libro de apuestas dañado; no se ha sobrescrito');
 return value;
}
export async function recordRealBets(preSha256:string,date:string,turn:string,
 jurisdictions:string[],selectedKeys:string[],stakePerLinePesos:number,
 heads:CabezasDia|null):Promise<BetLedger>{
 if(writeLock)throw Error('Hay otra operación guardándose');
 writeLock=true;
 try{
  const records=await loadRecords();
  const record=records.find(r=>r.snapshot.sha256===preSha256&&
   r.snapshot.pre.date===date&&r.snapshot.pre.turn===turn);
  if(!record)throw Error('Primero congelá el pronóstico de Lalo');
  if(!canConfirmBet(record,date,heads))throw Error('No se admiten apuestas después de publicarse el resultado');
  const now=new Date().toISOString(),batchId=now+'|'+Math.random().toString(36).slice(2);
  const tickets=prepareTickets(record,selectedKeys,stakePerLinePesos,jurisdictions,batchId,now);
  const ledger=withTickets(await loadBetLedger(),tickets);
  // ÚNICA escritura para todas las jurisdicciones; sin boletas parciales.
  await AsyncStorage.setItem(KEY,JSON.stringify(ledger));
  return ledger;
 }finally{writeLock=false;}
}

/** Compatibilidad con invocaciones anteriores desde una sola jurisdicción. */
export async function recordRealBet(preSha256:string,date:string,turn:string,
 jurisdiction:string,selectedKeys:string[],stakePerLinePesos:number,
 heads:CabezasDia|null):Promise<BetLedger>{
 return recordRealBets(preSha256,date,turn,[jurisdiction],selectedKeys,
  stakePerLinePesos,heads);
}
export async function recordActualReceipt(ticketId:string,amountPesos:number,
 currentHeads?:CabezasDia|null):Promise<BetLedger>{
 if(writeLock)throw Error('Hay otra operación guardándose');
 writeLock=true;
 try{
  const ledger=await loadBetLedger();
  const ticket=ledger.tickets.find(t=>t.pre.id===ticketId);
  if(!ticket)throw Error('No existe esa boleta');
  const records=await loadRecords();
  const result=betEvaluation(ticket,ticketHead(ticket,records,currentHeads));
  if(result.status!=='coincidencia')
   throw Error('Sólo se registra un premio de esta boleta cuando se verificó una cabeza coincidente');
  const now=new Date().toISOString(),id=now+'|'+Math.random().toString(36).slice(2);
  const updated=withReceipt(ledger,ticketId,amountPesos,now,id);
  await AsyncStorage.setItem(KEY,JSON.stringify(updated));
  return updated;
 }finally{writeLock=false;}
}
