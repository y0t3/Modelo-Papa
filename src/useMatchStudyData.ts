import {useEffect,useMemo,useRef,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TURNOS,diaVacio} from './domain';
import type {CabezasDia,Turno} from './domain';
import {shiftDay,previousDrawDay} from './dates';
import {hasDrawResults,hasNocturnoBase} from './drawHistory';
import {buildSheet} from './sheet';
import type {DailySheet} from './sheet';
import type {LaloHistorical} from './motorLalo';
import {buildMotorLaloApp,buildMotorLaloAuxiliarApp} from './vt4Independent';
import type {AuxiliarHistory} from './motorLaloAuxiliar';
import {auxAtCut,extractAuxHistoryMode} from './auxTemporalModes';
import {auxiliaryBoard} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads} from './auxSantiagoNeuquen';
import {fetchAuxiliaryHeads} from './auxSantiagoSource';
import type {AuxGalleryDay} from './infoAuxGallery';
import type {HistoricHeadsDay} from './historicalHeadFrequency';
import {fusionarNocturnasPorJur} from './nocturnaAnteriorPorJur';
import {MATCH_ENGINES,MATCH_KINDS,plusMatchRanks,auxMatchRanks,compareRankedHeads,validHeadCount} from './matchStudy';
import type {MatchRanks} from './matchStudy';
import {readMatchSnapshot} from './matchStudyStorage';
import type {MatchFrame,PreparedDay,PreparedStudy} from './matchStudyCache';
import {compactSignature} from './matchStudyCache';
type Input={date:string;today:string;data:CabezasDia|null;sheet:DailySheet|null;historical:LaloHistorical[];
 history:HistoricHeadsDay[];loading:boolean;auxDays:AuxGalleryDay[];currentAux:AuxGalleryDay|null};
const PREFIX='lalo:coincidencias:cache:v2:';
const INDEX=PREFIX+'index';
const TTL=6*60*60*1000;
const pause=()=>new Promise<void>(resolve=>setTimeout(resolve,0));
const memory=new Map<string,PreparedDay>();
const auxMemory=new Map<string,{time:number,promise:Promise<AuxiliaryHeads|null>}>();
function getAuxSource(date:string){
 const cached=auxMemory.get(date);
 if(cached&&Date.now()-cached.time<TTL)return cached.promise;
 const promise=fetchAuxiliaryHeads(date).then(v=>v.heads).catch(()=>{auxMemory.delete(date);return null});
 auxMemory.set(date,{time:Date.now(),promise});return promise;
}
async function getCached(date:string,signature:string,persist:boolean,force:boolean){
 if(force)return null;
 const okay=(x:PreparedDay|null|undefined)=>!!x&&x.date===date&&x.signature===signature&&Date.now()-x.storedAt<(x.complete?TTL:60000)&&MATCH_KINDS.every(k=>Array.isArray(x.frames?.[k]));
 const m=memory.get(date);if(okay(m))return m!;
 if(!persist)return null;
 try{
  const raw=await AsyncStorage.getItem(PREFIX+date);
  const x=raw?JSON.parse(raw) as PreparedDay:null;
  if(okay(x)){memory.set(date,x!);return x!}
 }catch{}
 return null;
}
async function saveCached(d:PreparedDay,persist:boolean){
 memory.set(d.date,d);
 if(memory.size>65)memory.delete(memory.keys().next().value!);
 if(persist&&d.complete)try{await AsyncStorage.setItem(PREFIX+d.date,JSON.stringify(d))}catch{}
}
async function trimCache(dates:string[]){
 // Keep the two most recent windows, rather than unbounded historical blobs.
 try{
  const raw=await AsyncStorage.getItem(INDEX);
  const old=raw?JSON.parse(raw) as string[]:[];
  const keep=[...new Set([...dates,...old])].slice(0,65);
  const remove=old.filter(d=>!keep.includes(d));
  if(remove.length)await AsyncStorage.multiRemove(remove.map(d=>PREFIX+d));
  await AsyncStorage.setItem(INDEX,JSON.stringify(keep));
 }catch{}
}
export function useMatchStudyData(input:Input):PreparedStudy{
 const {date,today,data,sheet,historical,history,loading,auxDays,currentAux}=input;
 const [state,setState]=useState<Omit<PreparedStudy,'retry'>>({date:'',dates:[],days:[],progress:0,working:false,error:''});
 const [refresh,setRefresh]=useState(0);
 const lastRefresh=useRef(0);
 const days=useMemo(()=>{
  const map=new Map(history.filter(d=>d.date<date).map(d=>[d.date,d.heads]));
  if(date&&data)map.set(date,data);
  return [...map].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,heads])=>({date,heads}));
 },[history,date,data]);
 const selected=days.filter(d=>hasDrawResults(d.heads)).slice(-30).reverse();
 // Refresh callbacks may replace equal objects. Compare values, not references.
 const inputKey=useMemo(()=>JSON.stringify([date,today,loading,data,sheet?.columns,historical,history,auxDays,currentAux?.yesterday,currentAux?.today,currentAux?.sourceDate]),[date,today,loading,data,sheet,historical,history,auxDays,currentAux?.yesterday,currentAux?.today,currentAux?.sourceDate]);
 useEffect(()=>{
  let alive=true;
  const force=lastRefresh.current!==refresh;
  lastRefresh.current=refresh;
  if(force){auxMemory.clear()}
  if(!date||!data||!sheet||loading||!history.length)return;
  const selectedDates=selected.map(d=>d.date);
  setState(prev=>({date,dates:selectedDates,days:prev.days.filter(d=>selectedDates.includes(d.date)),progress:0,working:true,error:''}));
  const run=async()=>{
   const byDate=new Map(days.map(d=>[d.date,d]));
   const sorted=days.filter(d=>d.date<date);
   const oldNight=sorted.filter(d=>hasNocturnoBase(d.heads));
   const targetSheet=(d:typeof days[number])=>{
    if(d.date===date&&sheet)return sheet;
    let previous=diaVacio();
    for(const p of sorted){if(p.date>=d.date)break;previous=fusionarNocturnasPorJur(previous,p.heads)}
    return buildSheet(d.heads,previous);
   };
   const rootRefs=(d:typeof days[number]):LaloHistorical[]=>{
    if(d.date===date)return historical;
    const refs:LaloHistorical[]=[];
    const last=oldNight.filter(p=>p.date<d.date).slice(-1)[0];
    const beforeLast=last&&oldNight.filter(p=>p.date<last.date).slice(-1)[0];
    if(last&&beforeLast)refs.push({date:last.date,period:'D−1',sheet:buildSheet(last.heads,beforeLast.heads)});
    const week=shiftDay(d.date,-7),weekly=byDate.get(week);
    const before=oldNight.filter(p=>p.date<week).slice(-1)[0];
    if(weekly&&before&&hasDrawResults(weekly.heads))refs.push({date:week,period:'D−7',sheet:buildSheet(weekly.heads,before.heads)});
    return refs;
   };
   const localAux=new Map(auxDays.map(a=>[a.date,a]));
   if(currentAux)localAux.set(currentAux.date,currentAux);
   const getAux=async(d:string)=>{
    const local=localAux.get(d);
    if(d===date&&d>=today)return local||null;
    if(local?.today&&local.yesterday&&!force)return local;
    const source=byDate.get(d);if(!source)return local||null;
    const sourceDate=previousDrawDay(d);
    const [y,t]=await Promise.all([getAuxSource(sourceDate),getAuxSource(d)]);
    const result={date:d,heads:source.heads,yesterday:y||local?.yesterday||null,today:t||local?.today||null,sourceDate:y?sourceDate:local?.sourceDate||null};
    localAux.set(d,result);return result;
   };
   // Read disk entries before any network request; newest days are prepared first.
   const inputs=selected.map(d=>{
    const refs=rootRefs(d),board=targetSheet(d);
    const local=d.date===date&&d.date>=today?currentAux:null;
    const signature=compactSignature(d.heads,board.columns,[refs,local?.yesterday,local?.today,local?.sourceDate]);
    return {d,refs,board,signature,persist:d.date<today};
   });
   const cached=await Promise.all(inputs.map(x=>getCached(x.d.date,x.signature,x.persist,force)));
   if(!alive)return;
   const output=cached.filter((x):x is PreparedDay=>!!x);
   const publish=()=>{if(alive)setState({date,dates:selectedDates,days:[...output],progress:output.length,working:true,error:''})};
   publish();
   for(let i=0;i<inputs.length;i++){
    if(!alive)return;
    if(cached[i])continue;
    const {d,refs,board,signature,persist}=inputs[i];
    const [raw,refAux]=await Promise.all([getAux(d.date),Promise.all(refs.map(r=>getAux(r.date)))]);
    if(!alive)return;
    // The roots do not depend on the target turn; compute once for the day.
    const auxHistory=(e:'ayer'|'hoy')=>{
     const prior:AuxiliarHistory[]=[];
     let complete=refs.some(r=>r.period==='D−1');
     const mode=e==='ayer'?'anterior':'intrajornada';
     refs.forEach((r,index)=>{
      const a=refAux[index],h=e==='ayer'?a?.yesterday:a?.today,old=byDate.get(r.date);
      if(!h||!old){complete=false;return}
      prior.push({date:r.date,period:r.period,heads:h,
       ...(e==='ayer'&&a?.sourceDate?{sourceDate:a.sourceDate}:{}),
       aux:extractAuxHistoryMode(r.date,h,old.heads,mode)});
     });
     return {prior,complete};
    };
    const priorA=auxHistory('ayer'),priorH=auxHistory('hoy');
    const day:PreparedDay={date:d.date,signature,storedAt:Date.now(),frames:{vt2:[],vt3:[],vt4:[]},complete:true};
    for(const t of TURNOS){
     const published=validHeadCount(d.heads,t);if(!published)continue;
     for(const e of MATCH_ENGINES){
      if(!alive)return;
      const saved=await readMatchSnapshot(d.date,t,e);
      if(!alive)return;
      let ranks:MatchRanks|undefined,plus:ReturnType<typeof buildMotorLaloApp>|undefined,cut:AuxiliaryHeads|undefined;
      let complete=false;
      try{
       if(e==='lalo'&&refs.some(r=>r.period==='D−1')){
        plus=buildMotorLaloApp(board,d.date,t,refs);ranks=plusMatchRanks(plus);complete=true;
       }else if(e!=='lalo'&&!(e==='hoy'&&t==='Previa')){
        const source=e==='ayer'?raw?.yesterday:raw?.today;
        if(source){
         const mode=e==='ayer'?'anterior':'intrajornada';
         cut=auxAtCut(source,t,mode);
         if(auxiliaryBoard(cut,t).cells.length){
          const prior=e==='ayer'?priorA:priorH;
          ranks=auxMatchRanks(buildMotorLaloAuxiliarApp(d.date,t,cut,prior.complete?prior.prior:[]));
          complete=prior.complete;
         }
        }
       }
      }catch{ranks=undefined;complete=false}
      for(const k of MATCH_KINDS){
       const ranked=saved?.ranks[k]||(complete||k==='vt4'?ranks?.[k]:undefined);
       const frame:MatchFrame={date:d.date,turn:t,engine:e,count:ranked?.length||0,published,
        available:!!ranked,captured:!!saved,hits:ranked?compareRankedHeads(ranked,d.heads,t,k):[]};
       if(plus){frame.sheet={columns:board.columns,heads:{},matches:{}};frame.routes={};
        for(const hit of frame.hits){const row=plus.ranks[k].find(r=>r.family===hit.family);if(row)frame.routes[hit.family]=row.paths}}
       if(cut)frame.aux=cut;
       day.frames[k].push(frame);
       if(!frame.available&&!(e==='hoy'&&t==='Previa'))day.complete=false;
      }
      await pause();
     }
    }
    if(!alive)return;
    await saveCached(day,persist);
    output.push(day);publish();
   }
   if(alive)void trimCache(selectedDates);
  };
  void run().catch(()=>{if(alive)setState(prev=>({...prev,error:'No se pudo completar el historial. Probá actualizar.'}))})
   .finally(()=>{if(alive)setState(prev=>({...prev,working:false}))});
  return()=>{alive=false};
 },[inputKey,refresh]);
 return {...(state.date===date?state:{date,dates:selected.map(d=>d.date),days:[],progress:0,working:true,error:''}),
  working:loading||state.date!==date||state.working,retry:()=>setRefresh(n=>n+1)};
}
