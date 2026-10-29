/**
 * PRE LOCAL INMUTABLE DOBLE: VT2 y VT3, mismas columnas, una fecha/turno.
 * El hash detecta cambios accidentales, NO certifica ante un tercero que el
 * registro existía antes del sorteo. El primer registro de la instalación gana.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SheetColumn} from './sheet';
import {preSheetAtCut} from './infoCandidatos';
import type {InfoVisualDay} from './infoTurnHistory';
import type {LaloView} from './motorLalo';
import {reversibleFamily} from './motorLalo';
import type {FormKind,FormChoice,FormCell,FormRoot,FormMotorView} from './motorFormasPrimero';
import {formPositions} from './motorFormasPrimero';
import {classifyFigureMotion,exactActivationTimeline} from './figureMotionAudit';
import {sha256} from './sha256';

export type SealedWitness={
 date:string;turn:Turno;jur:string;head:string;source:string;
 cells:FormCell[];reading:string;values:string[];
};
export type SealedChoice={
 rank:number;family:string;value:string;source:string;cells:FormCell[];
 shape:string;positionKey:string;anchor:number;
 rescue:boolean;roots:number;rootDays:number;sameSource:number;
 movement:string;timeline:string;
 witnesses:SealedWitness[];comparableFamilies:string[];
};
export type SealedKind={
 kind:FormKind;official:string[];forms:SealedChoice[];
 allPhysicalFamilies:number;roots:number;
};
export type DualPre={
 schema:'DUAL_FORMAS_PRE_LOCAL_1';date:string;turn:Turno;createdAt:string;
 cut:number;columns:SheetColumn[];rootDates:string[];
 vt2:SealedKind;vt3:SealedKind;
};
export type DualFrozenRecord={pre:DualPre;hash:string};
export type DualKindResult={
 kind:FormKind;publishedHeads:number;officialHits:number;formsHits:number;
 officialTop3Hits:number;formsTop3Hits:number;
 rescueHits:number;sharedHits:number;
 selectedPhysicalPaths:number;allPhysicalPaths:number;
 /** Only expected head matches for non-Lalo rescues in identical PRE pools. */
 matchedNullExpected:number;rescueExposures:number;
 hitRows:{jur:string;head:string;family:string;formRank:number|null;
  officialRank:number|null;selectedRoute:boolean;physicalPaths:number}[];
};
export type DualPost={publishedHeads:number;vt2:DualKindResult;vt3:DualKindResult};

const storageKey=(date:string,turn:Turno)=>
 'modelo-lalo:dual-figuras-pre-v1:'+date+':'+turn;
export const localIso=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),
 String(d.getDate()).padStart(2,'0')].join('-');
const validHead=(v:string)=>/^\d{4,5}$/.test(v);
const sameCells=(a:FormCell[],b:FormCell[])=>a.length===b.length&&
 (a.every((c,i)=>b[i].row===c.row&&b[i].col===c.col)||
  a.every((c,i)=>b[a.length-1-i].row===c.row&&b[a.length-1-i].col===c.col));
function sealChoice(
 f:FormChoice,topOfficial:Set<string>,forms:FormMotorView,days:InfoVisualDay[],
 eligible:Map<string,Set<string>>
):SealedChoice{
 const sourceShape=f.source+'|'+f.shape;
 const candidatePool=[...(eligible.get(sourceShape)||new Set<string>())]
  .filter(x=>!topOfficial.has(x)).sort();
 const witnessRows=f.support.roots.slice(0,8).map((r:FormRoot)=>{
  const values=days.find(d=>d.date===r.date)?.sheet.columns
   .find(c=>c.id===r.source)?.values||[];
  return {date:r.date,turn:r.turn,jur:r.jurisdiction,head:r.head,
   source:r.source,cells:r.cells,reading:r.reading,values:[...values]};
 });
 return {
  rank:f.rank,family:f.family,value:f.value,source:f.source,
  cells:f.cells.map(c=>({...c})),shape:f.shape,positionKey:f.positionKey,
  anchor:f.anchor,rescue:!topOfficial.has(f.family),
  roots:f.support.events,rootDays:f.support.days,sameSource:f.support.sameSource,
  movement:classifyFigureMotion(f).predominant,
  timeline:exactActivationTimeline(f,forms.rootDays).state,
  witnesses:witnessRows,comparableFamilies:!topOfficial.has(f.family)?candidatePool:[]
 };
}
function sealKind(kind:FormKind,pre:DailySheet,official:LaloView,
 form:FormMotorView,days:InfoVisualDay[]):SealedKind{
 const names=official.ranks[kind].slice(0,10).map(f=>f.family);
 const officialSet=new Set(names);
 const eligible=new Map<string,Set<string>>();
 const physical=formPositions(pre,official.target,kind);
 const all=new Set<string>();
 for(const path of physical){
  const source=pre.columns.find(c=>c.id===path.source)!;
  const family=reversibleFamily(path.cells.map(c=>source.values[c.row][c.col]).join(''));
  all.add(family);
  const key=path.source+'|'+path.shape;
  if(!eligible.has(key))eligible.set(key,new Set());
  eligible.get(key)!.add(family);
 }
 const families=new Set<string>();
 const sealed=form.top.slice(0,10).map(f=>{
  if(f.cells.length!==(kind==='vt2'?2:3)||families.has(f.family)||
   !physical.some(p=>p.positionKey===f.positionKey)||
   f.support.roots.some(r=>r.date>=form.date))
   throw Error('No se puede sellar una figura PRE inválida');
  families.add(f.family);
  const source=pre.columns.find(c=>c.id===f.source)!;
  if(f.value!==f.cells.map(c=>source.values[c.row][c.col]).join(''))
   throw Error('Dígitos no corresponden a ruta física PRE');
  return sealChoice(f,officialSet,form,days,eligible);
 });
 return {kind,official:names,forms:sealed,
  allPhysicalFamilies:all.size,roots:form.validRoots};
}
export function makeDualPre(
 date:string,turn:Turno,sheet:DailySheet,official:LaloView,
 vt2:FormMotorView,vt3:FormMotorView,days:InfoVisualDay[],createdAt:string
):DualPre{
 const idx=TURNOS.indexOf(turn);
 if(idx<0||official.date!==date||official.target!==turn||
  vt2.date!==date||vt3.date!==date||
  vt2.turn!==turn||vt3.turn!==turn||
  vt2.kind!=='vt2'||vt3.kind!=='vt3'||
  days.some(d=>d.date>=date))throw Error('PRE doble: fecha, turno o memoria futura');
 const pre=preSheetAtCut(sheet,turn,idx);
 const columns=pre.columns.slice(0,idx+1).map(c=>({...c,values:[...c.values]}));
 if(columns.length!==idx+1||columns.some(c=>c.values.length!==6||
  c.values.some(v=>!/^\d{2}$/.test(v))))
  throw Error('PRE doble: columnas +11 incompletas');
 if(!vt2.top.length||!vt3.top.length)throw Error('PRE doble: un motor sin figuras elegibles');
 if(!Number.isFinite(Date.parse(createdAt)))throw Error('Fecha de captura inválida');
 return {
  schema:'DUAL_FORMAS_PRE_LOCAL_1',date,turn,createdAt,cut:idx,columns,
  rootDates:[...new Set(vt2.rootDays.concat(vt3.rootDays))].sort().reverse(),
  vt2:sealKind('vt2',pre,official,vt2,days),
  vt3:sealKind('vt3',pre,official,vt3,days)
 };
}
export function sealDualPayload(pre:DualPre):DualFrozenRecord{
 return {pre,hash:sha256(JSON.stringify(pre))};
}
export function verifyDualRecord(record:DualFrozenRecord):DualFrozenRecord{
 if(record?.pre?.schema!=='DUAL_FORMAS_PRE_LOCAL_1'||!record.hash||
  record.hash!==sha256(JSON.stringify(record.pre))||
  record.pre.vt2?.kind!=='vt2'||record.pre.vt3?.kind!=='vt3')
  throw Error('PRE doble alterado o incompatible');
 return record;
}
export async function loadDualFrozen(date:string,turn:Turno):Promise<DualFrozenRecord|null>{
 const raw=await AsyncStorage.getItem(storageKey(date,turn));
 if(!raw)return null;
 const result=verifyDualRecord(JSON.parse(raw) as DualFrozenRecord);
 if(result.pre.date!==date||result.pre.turn!==turn)
  throw Error('Captura de otra fecha/turno');
 return result;
}
const pending=new Map<string,Promise<DualFrozenRecord>>();
/**
 * Guardar sólo si no hay cabezas publicadas del turno ni posteriores.
 * now se inyecta en pruebas. Primera escritura por fecha/turno gana.
 * NO constituye certificación externa del instante.
 */
export async function saveDualFrozen(
 pre:DualPre,publishedTargetAndLater:string[],now:Date=new Date()
):Promise<DualFrozenRecord>{
 const key=storageKey(pre.date,pre.turn);
 const running=pending.get(key);
 if(running)return running;
 const operation=(async()=>{
  const existing=await loadDualFrozen(pre.date,pre.turn);
  if(existing)return existing;
  if(localIso(now)!==pre.date)throw Error('PRE doble: sólo fecha actual');
  if(publishedTargetAndLater.some(validHead))
   throw Error('PRE doble bloqueado: ya hay cabezas publicadas');
  if(Date.parse(pre.createdAt)>now.getTime()+60000)
   throw Error('PRE doble con hora futura');
  const saved=sealDualPayload(pre);
  await AsyncStorage.setItem(key,JSON.stringify(saved));
  const verified=await loadDualFrozen(pre.date,pre.turn);
  if(!verified)throw Error('No pudo verificarse el guardado doble');
  return verified;
 })();
 pending.set(key,operation);
 try{return await operation}finally{if(pending.get(key)===operation)pending.delete(key)}
}
function evaluateKind(
 kind:FormKind,record:DualFrozenRecord,heads:{jur:string;head:string}[]
):DualKindResult{
 const pre=record.pre,models=pre[kind],size=kind==='vt2'?2:3;
 const board:DailySheet={columns:pre.columns,
  heads:Object.fromEntries(TURNOS.map(t=>[t,[]])),
  matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))};
 const positions=formPositions(board,pre.turn,kind);
 let officialHits=0,formsHits=0,officialTop3Hits=0,formsTop3Hits=0;
 let rescueHits=0,sharedHits=0,selectedPhysicalPaths=0,allPhysicalPaths=0;
 let matchedNullExpected=0;
 const hitRows:DualKindResult['hitRows']=[];
 const valid=heads.filter(h=>h.jur!=='Montevideo'&&validHead(h.head));
 for(const h of valid){
  const suffix=h.head.slice(-size),family=reversibleFamily(suffix);
  const officialRank=models.official.indexOf(family)+1;
  const chosen=models.forms.find(f=>f.family===family);
  const formRank=chosen?.rank??null;
  if(officialRank){officialHits++;if(officialRank<=3)officialTop3Hits++}
  if(formRank){formsHits++;if(formRank<=3)formsTop3Hits++;
   if(chosen?.rescue)rescueHits++;else sharedHits++}
  const paths=positions.filter(p=>{
   const source=pre.columns.find(c=>c.id===p.source)!;
   const value=p.cells.map(c=>source.values[c.row][c.col]).join('');
   return value===suffix||[...value].reverse().join('')===suffix;
  });
  const selected=!!chosen&&paths.some(p=>
   p.positionKey===chosen.positionKey&&sameCells(p.cells,chosen.cells));
  if(formRank){allPhysicalPaths+=paths.length;if(selected)selectedPhysicalPaths++}
  if(officialRank||formRank)hitRows.push({
   jur:h.jur,head:h.head,family,formRank,officialRank:officialRank||null,
   selectedRoute:selected,physicalPaths:paths.length
  });
  for(const f of models.forms.filter(f=>f.rescue)){
   const pool=f.comparableFamilies;
   if(pool.length&&pool.includes(family))
    matchedNullExpected+=1/pool.length;
  }
 }
 return {kind,publishedHeads:valid.length,officialHits,formsHits,
  officialTop3Hits,formsTop3Hits,rescueHits,sharedHits,
  selectedPhysicalPaths,allPhysicalPaths,matchedNullExpected,
  rescueExposures:models.forms.filter(f=>f.rescue).length,hitRows};
}
/** No writes; pure POST evaluation, only the sealed PRE is inspected. */
export function evaluateDualFrozen(record:DualFrozenRecord,
 heads:{jur:string;head:string}[]):DualPost{
 verifyDualRecord(record);
 const vt2=evaluateKind('vt2',record,heads);
 const vt3=evaluateKind('vt3',record,heads);
 return {publishedHeads:vt2.publishedHeads,vt2,vt3};
}
