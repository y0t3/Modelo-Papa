// Registro independiente de las elecciones visuales hechas por Papá.
// No contribuye al score oficial Lalo. La PRE se conserva como captura inalterable
// dentro de la app; SHA256 solo detecta cambios locales, NO acredita hora externa.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {JURS,TURNOS} from './domain';
import type {CabezasDia,Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import {reversibleFamily} from './motorLalo';
import {sha256} from './sha256';

export type PapaKind='vt2'|'vt3'|'vt4';
export type PapaCell={row:number;col:number};
export type PapaPick={
 id:string;kind:PapaKind;value:string;family:string;sourceId:SourceId;
 cells:PapaCell[];motherVt3?:string;
};
export type PapaDraft={date:string;turn:Turno;picks:PapaPick[]};
export type PapaPre={
 schema:'PAPA_PRE_V1';date:string;turn:Turno;createdAt:string;
 picks:PapaPick[];sources:{id:SourceId;values:string[]}[];
};
export type PapaSnapshot={pre:PapaPre;sha256:string};
export type PapaPost={checkedAt:string;heads:Record<string,string>};
export type PapaRecord={snapshot:PapaSnapshot;post?:PapaPost};
export const PAPA_JURS=JURS.filter(j=>j!=='Montevideo');
const PRE_KEY='modelo-lalo:papa:pronosticos-v1';
const DRAFT_PREFIX='modelo-lalo:papa:borrador-v1:';
export const todayLocal=()=>{
 const d=new Date();
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
export const recordId=(date:string,turn:Turno)=>date+'|'+turn;
export const pathText=(cells:PapaCell[])=>cells.map(c=>(c.row+1)+(c.col?'D':'I')).join(' → ');
const posKey=(cell:PapaCell)=>cell.row+':'+cell.col;
export const isPhysicalPath=(cells:PapaCell[]):boolean=>{
 if(![2,3,4].includes(cells.length))return false;
 if(new Set(cells.map(posKey)).size!==cells.length)return false;
 return cells.every((c,i)=>c.row>=0&&c.row<6&&c.col>=0&&c.col<2&&
  (!i||Math.max(Math.abs(c.row-cells[i-1].row),Math.abs(c.col-cells[i-1].col))===1));
};
export function draftPick(sheet:DailySheet,turn:Turno,
 sourceId:SourceId,cells:PapaCell[]):PapaPick{
 if(!isPhysicalPath(cells))throw Error('Elegí 2, 3 o 4 casillas contiguas, sin repetir ninguna');
 const columns=sheet.columns.slice(0,TURNOS.indexOf(turn)+1);
 const source=columns.find(x=>x.id===sourceId);
 if(!source)throw Error('Esa fuente todavía no estaba disponible para este turno');
 const value=cells.map(c=>source.values[c.row]?.[c.col]||'').join('');
 if(!new RegExp('^[0-9]{'+cells.length+'}$').test(value))throw Error('Las casillas elegidas no tienen cifras cargadas');
 const kind=('vt'+cells.length) as PapaKind;
 // VT4: jamás invertir el número completo para formar otra madre.
 // La última casilla es la cuarta cifra respecto a la madre (primeras tres).
 const motherVt3=kind==='vt4'?reversibleFamily(value.slice(0,3)):undefined;
 const family=kind==='vt4'?value:reversibleFamily(value);
 const path=cells.map(posKey).join('>');
 return {id:kind+'|'+sourceId+'|'+path,kind,value,family,
  sourceId,cells:cells.map(c=>({...c})),motherVt3};
}
export function addDraftPick(picks:PapaPick[],pick:PapaPick):PapaPick[]{
 if(picks.some(p=>p.id===pick.id))return picks;
 return [...picks,pick];
}
export const uniqueWagers=(picks:PapaPick[])=>{
 const perKind:Record<PapaKind,Set<string>>={vt2:new Set(),vt3:new Set(),vt4:new Set()};
 for(const p of picks)perKind[p.kind].add(p.family);
 return perKind;
};
const identical=(picks:PapaPick[])=>{
 const out=new Map<string,PapaPick>();
 for(const p of picks)if(!out.has(p.id))out.set(p.id,p);
 return [...out.values()];
};
export function buildPre(draft:PapaDraft,sheet:DailySheet,createdAt:string):PapaSnapshot{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)||!TURNOS.includes(draft.turn))throw Error('Fecha o turno inválidos');
 if(!draft.picks.length)throw Error('Elegí al menos un recorrido para congelar');
 const current=sheet.columns.slice(0,TURNOS.indexOf(draft.turn)+1);
 const clean=identical(draft.picks).map(p=>{
  const normalized=draftPick(sheet,draft.turn,p.sourceId,p.cells);
  if(normalized.id!==p.id||normalized.value!==p.value||normalized.family!==p.family||
    normalized.kind!==p.kind)throw Error('La hoja cambió: revisá los recorridos antes de congelar');
  return normalized;
 });
 const pre:PapaPre={schema:'PAPA_PRE_V1',date:draft.date,turn:draft.turn,
  createdAt,picks:clean,sources:current.map(c=>({id:c.id,values:[...c.values]}))};
 return {pre,sha256:sha256(JSON.stringify(pre))};
}
export function validateSnapshot(snapshot:PapaSnapshot):boolean{
 if(snapshot?.pre?.schema!=='PAPA_PRE_V1'||!snapshot?.sha256||
  sha256(JSON.stringify(snapshot.pre))!==snapshot.sha256)return false;
 const p=snapshot.pre;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!TURNOS.includes(p.turn)||
  !Array.isArray(p.picks)||!p.picks.length)return false;
 const sheet={columns:p.sources.map(s=>({...s,turno:p.turn,sourceLabel:s.id})),
  matches:{},heads:{}} as DailySheet;
 try{
  for(const x of p.picks){
   const calculated=draftPick(sheet,p.turn,x.sourceId,x.cells);
   if(calculated.value!==x.value||calculated.kind!==x.kind||
    calculated.family!==x.family||calculated.id!==x.id)return false;
  }
  return true;
 }catch{return false;}
}
export function observedHeads(heads:CabezasDia|null,turn:Turno):Record<string,string>{
 const record:Record<string,string>={};
 for(const j of PAPA_JURS){
  const h=heads?.[turn]?.[j]||'';
  if(/^\d{4}$/.test(h))record[j]=h;
 }
 return record;
}
export function hasObserved(heads:CabezasDia|null,turn:Turno){
 return Object.keys(observedHeads(heads,turn)).length>0;
}
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
export type PapaEvaluation={
 jurisdictions:number;wagers:Record<PapaKind,number>;hits:Record<PapaKind,number>;
 correctTurns:Record<PapaKind,boolean>;winnerDetails:{kind:PapaKind;family:string;jurisdiction:string;head:string}[];
};
const emptyCounter=():Record<PapaKind,number>=>({vt2:0,vt3:0,vt4:0});
export function evaluatePapa(record:PapaRecord):PapaEvaluation{
 if(!validateSnapshot(record.snapshot))throw Error('Integridad de PRE inválida');
 const wagers=uniqueWagers(record.snapshot.pre.picks);
 const count=emptyCounter(),hits=emptyCounter();
 const correctTurns:Record<PapaKind,boolean>={vt2:false,vt3:false,vt4:false};
 const winnerDetails:PapaEvaluation['winnerDetails']=[];
 for(const kind of ['vt2','vt3','vt4'] as PapaKind[])count[kind]=wagers[kind].size;
 const observed=record.post?.heads||{};
 for(const [jurisdiction,head] of Object.entries(observed)){
  if(!PAPA_JURS.includes(jurisdiction as typeof PAPA_JURS[number])||!/^\d{4}$/.test(head))continue;
  for(const kind of ['vt2','vt3','vt4'] as PapaKind[]){
   const actual=kind==='vt4'?head:reversibleFamily(head.slice(-Number(kind.slice(-1))));
   if(wagers[kind].has(actual)){
    hits[kind]++;correctTurns[kind]=true;
    winnerDetails.push({kind,family:actual,jurisdiction,head});
   }
  }
 }
 return {jurisdictions:Object.entries(observed).filter(([j,h])=>PAPA_JURS.includes(j as typeof PAPA_JURS[number])&&/^\d{4}$/.test(h)).length,
  wagers:count,hits,correctTurns,winnerDetails};
}
export function weekStart(date:string):string{
 const d=new Date(date+'T00:00:00Z');
 const weekday=d.getUTCDay(),difference=(weekday+6)%7;
 d.setUTCDate(d.getUTCDate()-difference);
 return d.toISOString().slice(0,10);
}
export function weekEnd(monday:string):string{
 const d=new Date(monday+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+6);
 return d.toISOString().slice(0,10);
}
export function weeklySummary(records:PapaRecord[],date:string){
 const monday=weekStart(date),sunday=weekEnd(monday);
 const list=records.filter(r=>r.snapshot.pre.date>=monday&&r.snapshot.pre.date<=sunday);
 const played=emptyCounter(),hit=emptyCounter(),turnsWon=emptyCounter();
 let checkedTurns=0,headsCompared=0;
 for(const record of list){
  const stats=evaluatePapa(record);
  if(stats.jurisdictions){checkedTurns++;headsCompared+=stats.jurisdictions;}
  for(const k of ['vt2','vt3','vt4'] as PapaKind[]){
   played[k]+=stats.wagers[k];
   hit[k]+=stats.hits[k];turnsWon[k]+=Number(stats.correctTurns[k]);
  }
 }
 return {monday,sunday,records:list.length,checkedTurns,headsCompared,
  pendingTurns:list.length-checkedTurns,played,hit,turnsWon};
}
