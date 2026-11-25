import AsyncStorage from '@react-native-async-storage/async-storage';
import {TURNOS} from './domain';
import type {CabezasDia,Turno} from './domain';
import {STAT_JURS} from './headStats';
import {MATCH_KINDS,validHeadCount} from './matchStudy';
import type {MatchEngine,MatchRanks,MatchSnapshot} from './matchStudy';
const key=(date:string,turn:Turno,engine:MatchEngine)=>'lalo:coincidencias:v1:'+date+'|'+turn+'|'+engine;
export async function readMatchSnapshot(date:string,turn:Turno,engine:MatchEngine):Promise<MatchSnapshot|null>{
 try{
  const raw=await AsyncStorage.getItem(key(date,turn,engine));
  if(!raw)return null;
  const record=JSON.parse(raw) as MatchSnapshot;
  if(record.date!==date||record.turn!==turn||record.engine!==engine||!MATCH_KINDS.every(k=>
   Array.isArray(record.ranks?.[k])&&record.ranks[k].every(r=>Number.isInteger(r.rank)&&r.rank>0&&typeof r.family==='string'&&Array.isArray(r.values))))return null;
  return record;
 }catch{return null}
}
const writing=new Set<string>();
/** Freeze only when the real-day target and later turns have no published head,
 * all earlier five-head cuts are complete, and the caller has a PRE view. */
export async function captureMatchSnapshot(date:string,turn:Turno,engine:MatchEngine,heads:CabezasDia,ranks:MatchRanks){
 const i=TURNOS.indexOf(turn);
 if(i<0||TURNOS.slice(0,i).some(t=>validHeadCount(heads,t)!==STAT_JURS.length)||
  TURNOS.slice(i).some(t=>validHeadCount(heads,t)>0))return;
 if(!MATCH_KINDS.some(k=>ranks[k].length))return;
 const id=key(date,turn,engine);
 if(writing.has(id))return;
 writing.add(id);
 try{
  if(await AsyncStorage.getItem(id))return;
  const snapshot:MatchSnapshot={date,turn,engine,createdAt:new Date().toISOString(),ranks};
  await AsyncStorage.setItem(id,JSON.stringify(snapshot));
 }catch{}finally{writing.delete(id)}
}
