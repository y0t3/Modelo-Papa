// Borrado EXPLÍCITO de datos personales de una semana de pruebas.
// No afecta hojas, fuentes, motor, snapshots experimentales ni otras semanas.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TURNOS} from './domain';
import {weekStart,weekEnd,recordId} from './papaPronostico';
import {loadRecords} from './papaRegistro';
import {loadBetLedger} from './laloLibroStorage';
import {validLedger} from './laloApuestas';

const PRE_KEY='modelo-lalo:papa:pronosticos-v1';
const DRAFT_PREFIX='modelo-lalo:papa:borrador-v1:';
const LEDGER_KEY='modelo-lalo:apuestas-reales-v1';
let resetting=false;

export async function clearPersonalDraft(date:string,turn:typeof TURNOS[number]){
 const key=DRAFT_PREFIX+recordId(date,turn);
 await AsyncStorage.removeItem(key);
}

/** Solo ejecutable después de confirmación explícita del usuario en pantalla. */
export async function resetPersonalWeek(week:string){
 if(resetting)throw Error('Ya se está reiniciando una semana');
 if(weekStart(week)!==week)throw Error('Debe elegirse un lunes válido');
 resetting=true;
 try{
  const end=weekEnd(week);
  const records=await loadRecords(),ledger=await loadBetLedger();
  const kept=records.filter(r=>{
   const d=r.snapshot.pre.date;return d<week||d>end;
  });
  const tickets=ledger.tickets.filter(t=>t.pre.date<week||t.pre.date>end);
  const keptIds=new Set(tickets.map(t=>t.pre.id));
  const remainder={...ledger,tickets,receipts:ledger.receipts.filter(r=>keptIds.has(r.ticketId))};
  if(!validLedger(remainder))throw Error('Borrado cancelado: el saldo restante no es válido');
  const draftKeys:string[]=[];
  const start=new Date(week+'T00:00:00Z');
  for(let day=0;day<7;day++){
   const d=new Date(start);d.setUTCDate(d.getUTCDate()+day);
   for(const turn of TURNOS)draftKeys.push(DRAFT_PREFIX+recordId(d.toISOString().slice(0,10),turn));
  }
  // Preparar copias originales antes de mutar el almacenamiento local.
  const oldEntries=await AsyncStorage.multiGet([PRE_KEY,LEDGER_KEY,...draftKeys]);
  try{
   await AsyncStorage.multiSet([
    [PRE_KEY,JSON.stringify(kept)],[LEDGER_KEY,JSON.stringify(remainder)]
   ]);
   await AsyncStorage.multiRemove(draftKeys);
  }catch(error){
   await AsyncStorage.multiSet(oldEntries.filter((pair):pair is [string,string]=>pair[1]!==null)
    .map(([key,value])=>[key,value]));
   await AsyncStorage.multiRemove(oldEntries.filter(([,value])=>value===null).map(([key])=>key));
   throw error;
  }
  return {pronosticos:records.length-kept.length,
   boletas:ledger.tickets.length-tickets.length,
   cobros:ledger.receipts.length-remainder.receipts.length};
 }finally{resetting=false}
}
