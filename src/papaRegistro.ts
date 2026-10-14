// Persistencia local de borradores, pronósticos PRE y resultados POST de Papá.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {buildPre,validateSnapshot,recordId,observedHeads,todayLocal,hasObserved} from './papaPronostico';
import type {PapaRecord,PapaDraft} from './papaPronostico';
import type {DailySheet} from './sheet';
import type {CabezasDia,Turno} from './domain';
const PRE_KEY='modelo-lalo:papa:pronosticos-v1';
const DRAFT_PREFIX='modelo-lalo:papa:borrador-v1:';

export async function loadRecords():Promise<PapaRecord[]>{
 const raw=await AsyncStorage.getItem(PRE_KEY);
 if(!raw)return [];
 const records=JSON.parse(raw) as PapaRecord[];
 if(!Array.isArray(records))throw Error('Registro Papá dañado');
 const keys=new Set<string>();
 for(const record of records){
  if(!validateSnapshot(record.snapshot))throw Error('Una captura PRE de Papá no coincide con su SHA256');
  const key=recordId(record.snapshot.pre.date,record.snapshot.pre.turn);
  if(keys.has(key))throw Error('Hay PRE duplicados en el registro');
  keys.add(key);
 }
 return records;
}
export async function loadDraft(date:string,turn:Turno):Promise<PapaDraft>{
 const raw=await AsyncStorage.getItem(DRAFT_PREFIX+recordId(date,turn));
 if(!raw)return {date,turn,picks:[]};
 const draft=JSON.parse(raw) as PapaDraft;
 if(draft.date!==date||draft.turn!==turn||!Array.isArray(draft.picks))throw Error('Borrador incompatible');
 return draft;
}
export async function saveDraft(draft:PapaDraft){
 await AsyncStorage.setItem(DRAFT_PREFIX+recordId(draft.date,draft.turn),JSON.stringify(draft));
}
export async function savePre(draft:PapaDraft,sheet:DailySheet,heads:CabezasDia|null):Promise<PapaRecord>{
 const existing=(await loadRecords()).find(r=>r.snapshot.pre.date===draft.date&&r.snapshot.pre.turn===draft.turn);
 if(existing)return existing;
 if(draft.date!==todayLocal())throw Error('Sólo se puede sellar una selección de hoy, antes del sorteo');
 if(hasObserved(heads,draft.turn))throw Error('El turno ya tiene cabezas cargadas. No se admite un PRE retroactivo.');
 const snapshot=buildPre(draft,sheet,new Date().toISOString());
 const record:PapaRecord={snapshot};
 const current=await loadRecords();
 if(current.some(r=>recordId(r.snapshot.pre.date,r.snapshot.pre.turn)===recordId(draft.date,draft.turn)))
  throw Error('El turno ya tiene un PRE sellado');
 await AsyncStorage.setItem(PRE_KEY,JSON.stringify([...current,record]));
 await AsyncStorage.removeItem(DRAFT_PREFIX+recordId(draft.date,draft.turn));
 return record;
}
export async function updateResults(date:string,turn:Turno,heads:CabezasDia):Promise<PapaRecord|null>{
 const records=await loadRecords();
 const idx=records.findIndex(r=>recordId(r.snapshot.pre.date,r.snapshot.pre.turn)===recordId(date,turn));
 if(idx<0)return null;
 const prior=records[idx].post?.heads||{};
 const fresh=observedHeads(heads,turn);
 const merged={...prior};
 let changed=false;
 for(const [jur,head] of Object.entries(fresh)){
  if(merged[jur]&&merged[jur]!==head)continue; // nunca reescribir un resultado ya registrado silenciosamente
  if(!merged[jur]){merged[jur]=head;changed=true;}
 }
 if(changed){
  records[idx]={...records[idx],post:{checkedAt:new Date().toISOString(),heads:merged}};
  await AsyncStorage.setItem(PRE_KEY,JSON.stringify(records));
 }
 return records[idx];
}
