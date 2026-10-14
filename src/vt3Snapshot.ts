import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Turno} from './domain';
import type {LaloView} from './motorLalo';
import type {ShadowSelection} from './vt3Shadow';
import {reversibleFamily} from './motorLalo';
import {sha256} from './sha256';
export type FrozenFamily={family:string;rank:number;reason:string};
export type FrozenPre={schema:'VT3_PRE_LOCAL_1';date:string;turn:Turno;createdAt:string;official:FrozenFamily[];geometric:FrozenFamily[]};
export type FrozenRecord={pre:FrozenPre;sha256:string};
const storageKey=(date:string,turn:Turno)=>'modelo-lalo:vt3-pre-v1:'+date+':'+turn;
const todayLocal=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
export function frozenPayload(date:string,turn:Turno,view:LaloView,shadow:ShadowSelection,createdAt:string):FrozenPre{
 if(view.date!==date||view.target!==turn||shadow.target!==turn)throw Error('PRE incompatible con fecha o turno');
 if(view.ranks.vt3.length<3||shadow.top.length<3)throw Error('Sin madres VT3 suficientes');
 const official=view.ranks.vt3.slice(0,10).map(x=>({family:x.family,rank:x.rank,reason:x.directRoots+' raíces · '+x.branchBlocks+' bifurcaciones · '+x.sourceCount+' fuentes'}));
 const geometric=shadow.top.map((x,i)=>({family:x.family,rank:i+1,reason:x.source+' · '+x.cells.join('→')+' · '+x.rootEvents+' raíces geométricas'}));
 return {schema:'VT3_PRE_LOCAL_1',date,turn,createdAt,official,geometric};
}
export function stampPre(pre:FrozenPre):FrozenRecord{return {pre,sha256:sha256(JSON.stringify(pre))}}
const readRecord=(raw:string):FrozenRecord=>{
 const x=JSON.parse(raw) as FrozenRecord;
 if(x?.pre?.schema!=='VT3_PRE_LOCAL_1'||x.sha256!==sha256(JSON.stringify(x.pre)))throw Error('Huella PRE alterada');
 return x;
};
export async function loadFrozen(date:string,turn:Turno):Promise<FrozenRecord|null>{
 const value=await AsyncStorage.getItem(storageKey(date,turn));
 if(!value)return null;
 const entry=readRecord(value);
 if(entry.pre.date!==date||entry.pre.turn!==turn)throw Error('Captura ajena a la fecha/turno');
 return entry;
}
export async function saveFrozen(date:string,turn:Turno,view:LaloView,shadow:ShadowSelection,heads:string[]):Promise<FrozenRecord>{
 const saved=await loadFrozen(date,turn);
 if(saved)return saved;
 if(date!==todayLocal())throw Error('Sólo pueden capturarse pronósticos del día actual');
 if(heads.some(h=>/^\d{4}$/.test(h)))throw Error('PRE no disponible: ya se publicaron resultados');
 const created=stampPre(frozenPayload(date,turn,view,shadow,new Date().toISOString()));
 await AsyncStorage.setItem(storageKey(date,turn),JSON.stringify(created));
 return (await loadFrozen(date,turn))!;
}
export function evaluateFrozen(record:FrozenRecord,heads:string[]){
 if(sha256(JSON.stringify(record.pre))!==record.sha256)throw Error('Integridad inválida');
 const valid=heads.filter(h=>/^\d{4}$/.test(h));
 const winners=new Set(valid.map(h=>reversibleFamily(h.slice(-3))));
 function check(xs:FrozenFamily[]){
  const matches=xs.filter(x=>winners.has(x.family)).map(x=>x.family);
  return {top3:xs.slice(0,3).some(x=>winners.has(x.family)),
   top5:xs.slice(0,5).some(x=>winners.has(x.family)),
   top10:xs.slice(0,10).some(x=>winners.has(x.family)),matches};
 }
 return {available:valid.length>0,headCount:valid.length,official:check(record.pre.official),geometric:check(record.pre.geometric)};
}
