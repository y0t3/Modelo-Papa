import React,{useEffect,useMemo,useState} from 'react';
import {ActivityIndicator,Pressable,ScrollView,Text,View,StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TURNOS} from '../domain';
import type {Turno} from '../domain';
import {STAT_JURS} from '../headStats';
import {isoToDisplay} from '../dates';
import type {LaloKind} from '../motorLalo';
import {MATCH_ENGINES,MATCH_LABELS,MATCH_KINDS} from '../matchStudy';
import type {MatchEngine} from '../matchStudy';
import type {PreparedStudy} from '../matchStudyCache';
import {selectMatchFrames} from '../matchStudyCache';
import InlineFamilyPaths from './InlineFamilyPaths';
import {useLaloTheme} from './LaloTheme';

type Props={date:string;turn:Turno;prepared:PreparedStudy};
type Filter={kind:LaloKind;engine:MatchEngine|'todos';turn:Turno|'todos';period:1|7|15|30;jur:string;all:boolean};
const PREF='lalo:coincidencias:filtros:v1';
const short=(d:string)=>isoToDisplay(d).slice(0,5);
const absTurn:Record<Turno,string>={Previa:'Pre.',Primera:'Pri.',Matutino:'Mat.',Vespertino:'Vesp.',Nocturno:'Noc.'};
export default function MatchStudyPanel({date,turn,prepared}:Props){
 const {colors:c,mode}=useLaloTheme();
 const [f,setF]=useState<Filter>({kind:'vt2',engine:'todos',turn,period:7,jur:'Todas',all:false});
 const [prefsReady,setPrefsReady]=useState(false);
 const [opened,setOpened]=useState<string|null>(null),[rank,setRank]=useState<number|null>(null);
 const [mini,setMini]=useState<string|null>(null);
 const green=mode==='dark'?'#78E2AA':'#167445',greenBg=mode==='dark'?'#205A46':'#DDF4E7';
 const orange=mode==='dark'?'#FFC47F':'#8F4C08',orangeBg=mode==='dark'?'#65451F':'#FFF0DA';
 useEffect(()=>{let live=true;void AsyncStorage.getItem(PREF).then(raw=>{
  if(!live||!raw)return;
  const p=JSON.parse(raw) as Filter;
  if(MATCH_KINDS.includes(p.kind)&&['todos',...MATCH_ENGINES].includes(p.engine)&&
   ['todos',...TURNOS].includes(p.turn)&&[1,7,15,30].includes(p.period)&&
   ['Todas',...STAT_JURS].includes(p.jur)&&typeof p.all==='boolean')setF(p);
 }).catch(()=>{}).finally(()=>{if(live)setPrefsReady(true)});return()=>{live=false}},[]);
 useEffect(()=>{if(prefsReady)void AsyncStorage.setItem(PREF,JSON.stringify(f)).catch(()=>{})},[f,prefsReady]);
 const selectedDates=useMemo(()=>prepared.dates.slice(0,f.period),[prepared.dates,f.period]);
 const selectedDays=useMemo(()=>selectedDates.map(date=>({date})),[selectedDates]);
 const engines=useMemo(()=>f.engine==='todos'?[...MATCH_ENGINES]:[f.engine],[f.engine]);
 const turns=useMemo(()=>f.turn==='todos'?[...TURNOS]:[f.turn],[f.turn]);
 const frames=useMemo(()=>selectMatchFrames(prepared.days,selectedDates,f.kind,engines,turns),[prepared.days,selectedDates,f.kind,engines,turns]);
 const historyBusy=false,working=prepared.working,progress=prepared.progress,error=prepared.error;
 useEffect(()=>{setRank(null);setMini(null);setOpened(null)},[f.kind,f.engine,f.turn,f.period,f.jur,date]);
 const relevant=useMemo(()=>frames.flatMap(frame=>frame.available?frame.hits.filter(h=>f.jur==='Todas'||h.jur===f.jur).map(hit=>({frame,hit})):[]),[frames,f.jur]);
 const top=relevant.filter(x=>x.hit.rank<=10),outside=relevant.length-top.length;
 const counts=Array.from({length:10},(_,i)=>top.filter(x=>x.hit.rank===i+1).length);
 const max=Math.max(0,...counts),peak=counts.map((n,i)=>n===max&&n?'#'+(i+1):null).filter(Boolean).join(' · ');
 const shown=relevant.filter(x=>(f.all||x.hit.rank<=10)&&(rank===null||(rank===-1?x.hit.rank>10:x.hit.rank===rank)));
 const coverage=frames.filter(x=>x.available).length,captured=frames.filter(x=>x.captured).length;
 const chip=(label:string,active:boolean,onPress:()=>void,key=label)=><Pressable key={key} accessibilityRole="button" accessibilityState={{selected:active}} onPress={onPress}
  style={[s.chip,{backgroundColor:active?c.accentFill:c.surfaceAlt,borderColor:active?c.accent:c.border}]}>
  <Text style={{color:active?c.accent:c.text,fontSize:12,fontWeight:'800'}}>{label}</Text></Pressable>;
 const label=(v:string)=><Text style={{color:c.subtext,fontWeight:'800',fontSize:11}}>{v}</Text>;
 const card={backgroundColor:c.surfaceAlt,borderColor:c.border};
 const toggleRank=(n:number)=>{setRank(v=>v===n?null:n);if(n===-1)setF(x=>({...x,all:true}));setMini(null)};
 const dateOpen=opened===null?selectedDays[0]?.date:opened;
 return <View style={s.root}>
  <View style={s.chips}>{MATCH_KINDS.map(k=>chip(k.toUpperCase(),f.kind===k,()=>setF(x=>({...x,kind:k}))))}</View>
  {label('Motor')}<View style={s.chips}>{(['todos',...MATCH_ENGINES] as const).map(e=>chip(e==='todos'?'Todos':MATCH_LABELS[e],f.engine===e,()=>setF(x=>({...x,engine:e}))))}</View>
  {label('Turno')}<View style={s.chips}>{(['todos',...TURNOS] as const).map(t=>chip(t==='todos'?'Todos':t,f.turn===t,()=>setF(x=>({...x,turn:t}))))}</View>
  {label('Jornadas')}<View style={s.chips}>{([1,7,15,30] as const).map(p=>chip(p===1?'Última':String(p),f.period===p,()=>setF(x=>({...x,period:p}))))}</View>
  {label('Jurisdicción')}<View style={s.chips}>{['Todas',...STAT_JURS].map(j=>chip(j,f.jur===j,()=>setF(x=>({...x,jur:j}))))}</View>
  {historyBusy||working?<View style={s.chips}><ActivityIndicator color={c.accent}/><Text style={{color:c.subtext,fontSize:12}}>{historyBusy?'Cargando jornadas anteriores…':'Preparando historial '+progress+' de '+prepared.dates.length+' jornadas…'}</Text></View>:null}
  {error?<Text style={{color:orange}}>{error}</Text>:null}
  {!working&&!historyBusy?<Pressable accessibilityRole="button" onPress={prepared.retry} style={{alignSelf:'flex-end',paddingVertical:3}}><Text style={{color:c.accent,fontSize:11,fontWeight:'800'}}>{error?'Reintentar historial':'↻ Actualizar historial'}</Text></Pressable>:null}
  <View style={s.chips}>{[{title:'Top 10',value:String(top.length),color:green},{title:'Fuera del Top',value:String(outside),color:orange},{title:'Más repetida',value:peak||'—',color:c.accent}].map(x=><View key={x.title} style={[s.metric,card]}>
   <Text style={{color:c.subtext,fontSize:10,fontWeight:'700'}}>{x.title}</Text><Text style={{color:x.color,fontSize:19,fontWeight:'900',textAlign:'center'}}>{x.value}</Text>
  </View>)}</View>
  <Text style={{color:c.subtext,fontSize:11}}>Cortes disponibles: {coverage}/{frames.length} · {captured} guardados · {coverage-captured} reconstruidos. Cada cabeza se cuenta una vez por motor; no son probabilidades.</Text>
  <View style={[s.card,card]}>
   <Text style={[s.title,{color:c.accent}]}>¿En qué puestos coincidieron?</Text>
   <Text style={{color:c.subtext,fontSize:11}}>Tocá un puesto para filtrar. El número indica cuántas veces coincidió.</Text>
   <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator>
    <View style={{gap:4}}>
     <View style={s.row}><View style={{width:70}}/>{Array.from({length:11},(_,i)=><Text key={i} style={{width:27,color:c.subtext,textAlign:'center',fontSize:10}}>{i===10?'+10':'#'+(i+1)}</Text>)}</View>
     {engines.map(e=><View key={e} style={s.row}>
      <Text style={{width:70,color:c.text,fontSize:11,fontWeight:'800'}}>{MATCH_LABELS[e]}</Text>
      {Array.from({length:11},(_,i)=>{
       const n=i===10?-1:i+1;
       const hits=relevant.filter(x=>x.frame.engine===e&&(n===-1?x.hit.rank>10:x.hit.rank===n)).length;
       return <Pressable key={i} onPress={()=>toggleRank(n)} accessibilityLabel={'Puesto '+(n===-1?'fuera del top':n)+' '+hits+' coincidencias'}
        style={{width:27,height:28,borderRadius:5,alignItems:'center',justifyContent:'center',borderWidth:rank===n?2:1,borderColor:rank===n?c.accent:c.border,
        backgroundColor:hits?n===-1?orangeBg:greenBg:c.cell}}>
        <Text style={{fontSize:11,fontWeight:'900',color:hits?n===-1?orange:green:c.muted}}>{hits||'·'}</Text></Pressable>
      })}
     </View>)}
    </View>
   </ScrollView>
   {engines.map(e=><View key={e} style={[s.row,{justifyContent:'space-between'}]}>
    <Text style={{color:c.text,fontWeight:'800',fontSize:12}}>{MATCH_LABELS[e]}</Text>
    <Text style={{color:green,fontSize:12}}>{top.filter(x=>x.frame.engine===e).length} en Top 10</Text>
    <Text style={{color:orange,fontSize:12}}>+{relevant.filter(x=>x.frame.engine===e&&x.hit.rank>10).length} fuera</Text>
   </View>)}
  </View>
  {f.turn==='todos'?<View style={[s.card,card]}>
   <Text style={[s.title,{color:c.accent}]}>Coincidencias por turno</Text>
   {TURNOS.map(t=><View key={t} style={{gap:3}}><Text style={{color:c.text,fontSize:12,fontWeight:'800'}}>{t}</Text>
    {engines.map(e=>{
     const n=relevant.filter(x=>x.frame.turn===t&&x.frame.engine===e&&(f.all||x.hit.rank<=10)).length;
     const denom=Math.max(1,...TURNOS.flatMap(tt=>engines.map(ee=>relevant.filter(x=>x.frame.turn===tt&&x.frame.engine===ee&&(f.all||x.hit.rank<=10)).length)));
     const color=e==='lalo'?'#287AC7':e==='ayer'?'#D8AB38':'#9F83DA';
     return <View key={e} style={s.row}><Text style={{width:70,fontSize:10,color:c.subtext}}>{MATCH_LABELS[e]}</Text><View style={{flex:1,height:10,borderRadius:4,backgroundColor:c.cell}}><View style={{height:10,width:(n*100/denom)+'%' as `${number}%`,borderRadius:4,backgroundColor:color}}/></View><Text style={{width:22,color:c.text,textAlign:'right',fontSize:11}}>{n}</Text></View>
    })}
   </View>)}
  </View>:null}
  <View style={[s.card,card]}>
   <Text style={[s.title,{color:c.accent}]}>Jornada por jornada</Text>
   <View style={s.chips}>{chip('Top 10',!f.all,()=>{setF(x=>({...x,all:false}));setRank(null)})}{chip('Todas las coincidencias',f.all,()=>{setF(x=>({...x,all:true}));setRank(null)})}</View>
   {rank!==null?chip((rank===-1?'Fuera del Top 10':'Puesto #'+rank)+' · quitar filtro',true,()=>setRank(null)):null}
   {!selectedDays.length&&!working?<Text style={{color:c.subtext}}>Todavía no hay jornadas con resultados disponibles.</Text>:null}
   {selectedDays.map(d=>{
    const list=shown.filter(x=>x.frame.date===d.date);
    const open=dateOpen===d.date;
    const dayFrames=frames.filter(x=>x.date===d.date);
    return <View key={d.date} style={[s.day,{borderColor:open?c.accent:c.border,backgroundColor:c.card}]}>
     <Pressable onPress={()=>{setOpened(open?'':d.date);setMini(null)}} accessibilityRole="button" style={{gap:6}}>
      <View style={[s.row,{justifyContent:'space-between'}]}><Text style={{color:c.accent,fontSize:16,fontWeight:'900'}}>{short(d.date)}</Text><Text style={{color:green,fontSize:12,fontWeight:'800'}}>{list.length} coincidencias {open?'▴':'▾'}</Text></View>
      {engines.map(e=>{
       const matches=list.filter(x=>x.frame.engine===e);
       const records=dayFrames.filter(x=>x.engine===e);
       return <View key={e} style={[s.row,{alignItems:'flex-start'}]}>
        <Text style={{width:70,color:c.subtext,fontSize:11,fontWeight:'800',paddingTop:6}}>{MATCH_LABELS[e]}</Text>
        <View style={[s.chips,{flex:1}]}>
         {matches.map(({frame,hit})=><View key={frame.turn+'|'+hit.jur+'|'+hit.rank} style={{backgroundColor:hit.rank<=10?greenBg:orangeBg,borderRadius:5,padding:4,alignItems:'center'}}>
          <Text style={{color:hit.rank<=10?green:orange,fontSize:10,fontWeight:'800'}}>#{hit.rank}{f.turn==='todos'?' '+absTurn[frame.turn]:''}</Text>
          <Text style={{color:c.text,fontSize:12,fontWeight:'900'}}>{hit.family}</Text>
         </View>)}
         {!matches.length?<Text style={{color:c.muted,fontSize:11,paddingTop:6}}>{!records.length?(working?'Preparando…':'Sin cotejar'):!records.some(x=>x.available)?'Sin hoja o memoria':'Sin coincidencias'}</Text>:null}
        </View>
       </View>
      })}
     </Pressable>
     {open?<View style={{gap:7}}>
      <Text style={{color:c.accent,fontWeight:'900',fontSize:13}}>Cabezas coincidentes</Text>
      <Text style={{color:c.muted,fontSize:10}}>{dayFrames.filter(x=>x.available).length} cortes disponibles · {dayFrames.filter(x=>x.captured).length} guardados</Text>
      {list.map(({frame,hit})=>{
       const id=frame.date+'|'+frame.turn+'|'+frame.engine+'|'+hit.jur+'|'+hit.rank;
       const k=f.kind;
       return <View key={id} style={[s.hit,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
        <Pressable accessibilityRole="button" onPress={()=>setMini(v=>v===id?null:id)} style={{gap:4}}>
         <View style={s.row}>
          <Text style={{backgroundColor:hit.rank<=10?greenBg:orangeBg,color:hit.rank<=10?green:orange,padding:6,borderRadius:6,fontWeight:'900'}}>#{hit.rank}</Text>
          <View style={{flex:1}}><Text style={{color:c.subtext,fontSize:10}}>Familia</Text><Text style={{color:c.accent,fontWeight:'900',fontSize:17}}>{hit.family}</Text></View>
          <Text style={{color:c.muted}}>→</Text>
          <View><Text style={{color:c.subtext,fontSize:10}}>Cabeza real</Text><Text style={{fontSize:23,fontWeight:'900',color:c.text}}>{hit.head.slice(0,4-hit.value.length)}<Text style={{color:green,backgroundColor:greenBg}}>{hit.value}</Text></Text></View>
         </View>
         <Text style={{color:c.subtext,fontSize:11}}>{short(frame.date)} · {hit.jur} · {frame.turn} · {MATCH_LABELS[frame.engine]} · {frame.count} candidatos · {frame.captured?'Guardado':'Reconstruido'} · {mini===id?'▴':'▾'}</Text>
        </Pressable>
        {mini===id?(frame.sheet&&frame.routes?.[hit.family]?.length||frame.aux?<InlineFamilyPaths kind={k} family={hit.family} turn={frame.turn}
         plus={frame.sheet&&frame.routes?.[hit.family]?{sheet:frame.sheet,routes:frame.routes[hit.family]}:undefined}
         aux={frame.aux?{heads:frame.aux,values:[hit.value]}:undefined}/>:<Text style={{color:c.subtext,fontSize:11}}>No hay recorrido disponible para esta selección guardada.</Text>):null}
       </View>
      })}
      {!list.length?<Text style={{color:c.subtext,fontSize:12}}>No hay coincidencias con estos filtros.</Text>:null}
     </View>:null}
    </View>
   })}
  </View>
 </View>
}
const s=StyleSheet.create({root:{gap:9},chips:{flexDirection:'row',flexWrap:'wrap',gap:5,alignItems:'center'},
 chip:{borderWidth:1,borderRadius:14,paddingVertical:7,paddingHorizontal:9},row:{flexDirection:'row',alignItems:'center',gap:4},
 metric:{flex:1,minWidth:75,borderRadius:10,borderWidth:1,padding:6,alignItems:'center',gap:3},
 card:{borderWidth:1,borderRadius:12,padding:8,gap:8},title:{fontSize:15,fontWeight:'900'},
 day:{borderWidth:1,borderRadius:10,padding:7,gap:8},hit:{borderWidth:1,borderRadius:8,padding:6,gap:6}});
