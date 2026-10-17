// Registro independiente de las elecciones visuales hechas por Lalo.
// No contribuye al score del motor automático Lalo. La PRE se conserva como captura inalterable
// dentro de la app; SHA256 solo detecta cambios locales, NO acredita hora externa.
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
 /** Proveniencia sólo de presentación: no constituye otro recorrido elegido. */
 autoFrom?:string;
};
export type PapaDraft={date:string;turn:Turno;picks:PapaPick[]};
export type PapaPre={
 schema:'PAPA_PRE_V1'|'PAPA_PRE_V2'|'PAPA_PRE_V3'|'PAPA_PRE_V4';date:string;turn:Turno;createdAt:string;
 picks:PapaPick[];sources:{id:SourceId;values:string[]}[];
};
export type PapaSnapshot={pre:PapaPre;sha256:string};
export type PapaPost={checkedAt:string;heads:Record<string,string>};
export type PapaRecord={snapshot:PapaSnapshot;post?:PapaPost};
export const PAPA_JURS=JURS.filter(j=>j!=='Montevideo');
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
 // VT4: el recorrido físico empieza por la cifra AÑADIDA, seguido de
 // las tres casillas de la madre original; nunca anexar a su derecha.
 const motherVt3=kind==='vt4'?reversibleFamily(value.slice(1)):undefined;
 const family=kind==='vt4'?value:reversibleFamily(value);
 const path=cells.map(posKey).join('>');
 return {id:kind+'|'+sourceId+'|'+path,kind,value,family,
  sourceId,cells:cells.map(c=>({...c})),motherVt3};
}
export function addDraftPick(picks:PapaPick[],pick:PapaPick):PapaPick[]{
 if(picks.some(p=>p.id===pick.id))return picks;
 return [...picks,pick];
}
/**
 * Bajada literal: un VT4 como 3044 incluye 044 y 44 (NO las orientaciones
 * inversas 440 ni 04 como boletos reales). En el ranking de familias
 * VT2/VT3, esas lecturas se agrupan por reversibilidad como siempre.
 * Los tramos finales son recorridos físicos ya contenidos en la cuaterna.
 *
 * El PRE V4 activa VT3→VT2 además de VT4→VT3/VT2.
 * Los PRE V3 conservan su interpretación histórica (solo VT4 baja).
 * El PRE guarda sólo las elecciones originales; las bajadas se derivan
 * de modo determinista. Los PRE V1/V2 no se reinterpretan retrospectivamente.
 */
export function expandDownPicks(picks:PapaPick[],enabled:boolean,lowerVt3=false):PapaPick[]{
 const out=picks.map(p=>({...p,cells:p.cells.map(c=>({...c}))}));
 if(!enabled)return out;
 const seen=new Set(out.map(p=>p.id));
 for(const parent of picks){
  if(parent.kind!=='vt4'&&!(lowerVt3&&parent.kind==='vt3'))continue;
  for(const n of (parent.kind==='vt4'?[3,2]:[2]) as (2|3)[]){
   const kind=n===3?'vt3':'vt2';
   const cells=parent.cells.slice(-n);
   const value=parent.value.slice(-n);
   const id=kind+'|'+parent.sourceId+'|'+cells.map(posKey).join('>');
   if(seen.has(id))continue; // También respeta selecciones manuales previas.
   out.push({id,kind,value,family:reversibleFamily(value),
    cells:cells.map(c=>({...c})),sourceId:parent.sourceId,autoFrom:parent.id});
   seen.add(id);
  }
 }
 return out;
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
 const pre:PapaPre={schema:'PAPA_PRE_V4',date:draft.date,turn:draft.turn,
  createdAt,picks:clean,sources:current.map(c=>({id:c.id,values:[...c.values]}))};
 return {pre,sha256:sha256(JSON.stringify(pre))};
}
export function validateSnapshot(snapshot:PapaSnapshot):boolean{
 if(!['PAPA_PRE_V1','PAPA_PRE_V2','PAPA_PRE_V3','PAPA_PRE_V4'].includes(snapshot?.pre?.schema)||!snapshot?.sha256||
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
   // Las capturas V1 conservan la madre histórica (primeras 3 cifras)
   // para no perder registros guardados antes de corregir la regla.
   const oldMother=x.kind==='vt4'?reversibleFamily(x.value.slice(0,3)):undefined;
   const expectedMother=p.schema==='PAPA_PRE_V1'?oldMother:calculated.motherVt3;
   if(x.motherVt3!==expectedMother)return false;
  }
  return true;
 }catch{return false;}
}
export function observedHeads(heads:CabezasDia|null,turn:Turno):Record<string,string>{
 const record:Record<string,string>={};
 // Conservar también Montevideo en POST local para cotejar su boleto real.
 // El resumen predictivo de Lalo continúa midiendo sólo las cinco argentinas.
 for(const j of JURS){
  const h=heads?.[turn]?.[j]||'';
  if(/^\d{4}$/.test(h))record[j]=h;
 }
 return record;
}
export function hasObserved(heads:CabezasDia|null,turn:Turno){
 return Object.keys(observedHeads(heads,turn)).length>0;
}
export type PapaEvaluation={
 jurisdictions:number;wagers:Record<PapaKind,number>;hits:Record<PapaKind,number>;
 correctTurns:Record<PapaKind,boolean>;winnerDetails:{kind:PapaKind;family:string;jurisdiction:string;head:string}[];
};
const emptyCounter=():Record<PapaKind,number>=>({vt2:0,vt3:0,vt4:0});
export function evaluatePapa(record:PapaRecord):PapaEvaluation{
 if(!validateSnapshot(record.snapshot))throw Error('Integridad de PRE inválida');
 const wagers=uniqueWagers(expandDownPicks(record.snapshot.pre.picks,
  ['PAPA_PRE_V3','PAPA_PRE_V4'].includes(record.snapshot.pre.schema),
  record.snapshot.pre.schema==='PAPA_PRE_V4'));
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
 let checkedTurns=0,headsCompared=0,partialTurns=0;
 for(const record of list){
  const stats=evaluatePapa(record);
  if(stats.jurisdictions){checkedTurns++;headsCompared+=stats.jurisdictions;}
  if(stats.jurisdictions>0&&stats.jurisdictions<PAPA_JURS.length)partialTurns++;
  for(const k of ['vt2','vt3','vt4'] as PapaKind[]){
   played[k]+=stats.wagers[k];
   hit[k]+=stats.hits[k];turnsWon[k]+=Number(stats.correctTurns[k]);
  }
 }
 return {monday,sunday,records:list.length,checkedTurns,headsCompared,
  pendingTurns:list.length-checkedTurns,partialTurns,played,hit,turnsWon};
}
