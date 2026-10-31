import React,{useEffect,useMemo,useState} from 'react';
import {ActivityIndicator,Pressable,StyleSheet,Text,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Turno} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloHistorical} from '../motorLalo';
import {reversibleFamily} from '../motorLalo';
import {preSheetAtCut} from '../infoCandidatos';
import {TURNOS} from '../domain';
import {loadCombinedMemory,buildCombinedTop} from '../laloCombinedRuntime';
import type {CombinedMemory,CombinedPick} from '../laloCombinedRuntime';
import {useLaloTheme} from './LaloTheme';
import RouteMiniBoard from './RouteMiniBoard';

type Saved={schema:'COMBINADO_PRE_LOCAL_1';date:string;turn:Turno;
 savedAt:string;top:CombinedPick[]};
const dayLocal=()=>{const d=new Date();return [
 d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),
 String(d.getDate()).padStart(2,'0')].join('-')};
const localKey=(date:string,turn:Turno)=>'modelo-lalo:combinado-pre-1:'+date+'|'+turn;
const sourceLabel=(s:string)=>({
 prevNocturno:'Nocturna anterior',Previa:'Previa',Primera:'Primera',
 Matutino:'Matutina',Vespertino:'Vespertina'
} as Record<string,string>)[s]||s;
export default function CombinedVt3Panel({date,turn,sheet,historical,heads}:{date:string;
 turn:Turno;sheet:DailySheet|null;historical:LaloHistorical[];
 heads:string[]}){
 const {colors:c,kinds}=useLaloTheme();
 const [memory,setMemory]=useState<CombinedMemory|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(false);
 const [saved,setSaved]=useState<Saved|null>(null);
 const [opened,setOpened]=useState<string|null>(null);
 const [savedState,setSavedState]=useState('');
 const published=heads.some(x=>/^\d{4}$/.test(x));
 useEffect(()=>{
  let live=true;setMemory(null);setError('');setOpened(null);setSaved(null);setSavedState('');
  if(!date||!sheet||!historical.length)return;
  setLoading(true);
  void Promise.all([
   loadCombinedMemory(date),
   AsyncStorage.getItem(localKey(date,turn)).catch(()=>null)
  ]).then(([x,raw])=>{
   if(!live)return;
   setMemory(x);
   if(raw){
    try{const j=JSON.parse(raw) as Saved;
     if(j.schema==='COMBINADO_PRE_LOCAL_1'&&j.date===date&&j.turn===turn)
      setSaved(j);
    }catch{}
   }
  }).catch(e=>{if(live)setError(String(e?.message||e))})
   .finally(()=>{if(live)setLoading(false)});
  return()=>{live=false};
 },[date,turn,!!sheet,historical.length]);
 const current=useMemo(()=>{
  if(!sheet||!memory||!historical.length)return null;
  try{return {value:buildCombinedTop(sheet,date,turn,historical,memory),error:''}}
  catch(e){return {value:null,error:String((e as Error)?.message||e)}}
 },[sheet,memory,date,turn,historical]);
 const top=saved?.top||current?.value?.top||[];
 useEffect(()=>{
  if(saved||!current?.value||published||date!==dayLocal()||savedState||!top.length)return;
  const record:Saved={schema:'COMBINADO_PRE_LOCAL_1',date,turn,
   savedAt:new Date().toISOString(),top:current.value.top};
  let active=true;
  void AsyncStorage.getItem(localKey(date,turn)).then(async old=>{
   if(old){if(active){setSavedState('guardado');try{
    const r=JSON.parse(old) as Saved;
    if(r.schema==='COMBINADO_PRE_LOCAL_1')setSaved(r);
   }catch{}}return}
   await AsyncStorage.setItem(localKey(date,turn),JSON.stringify(record));
   if(active){setSaved(record);setSavedState('guardado')}
  }).catch(()=>{if(active)setSavedState('no guardado')});
  return()=>{active=false};
 },[current,saved,published,date,turn,savedState,top.length]);
 const hits=new Map<string,string[]>();
 for(const h of heads.filter(x=>/^\d{4}$/.test(x))){
  const key=reversibleFamily(h.slice(-3));
  hits.set(key,[...(hits.get(key)||[]),h]);
 }
 const pre=sheet?preSheetAtCut(sheet,turn,TURNOS.indexOf(turn)):null;
 return <View style={[s.panel,{backgroundColor:c.surface,borderColor:c.accent}]}>
  <Text style={[s.eyebrow,{color:c.accent}]}>OTRA MIRADA · TRES CIFRAS</Text>
  <Text style={[s.title,{color:c.text}]}>Números para mirar hoy</Text>
  <Text style={[s.subtitle,{color:c.subtext}]}>
   Combinamos los resultados anteriores con las formas que aparecen en la hoja +11.
  </Text>
  <Text style={[s.hint,{color:c.subtext}]}>
   Es una prueba para comparar, no una garantía de acierto. La hoja de Lalo sigue igual.
  </Text>
  {loading?<View style={s.loading}>
    <ActivityIndicator color={c.accent}/>
    <Text style={{color:c.subtext,flex:1,fontSize:12,lineHeight:18}}>
     Buscando las jornadas anteriores. La primera vez puede tardar un poco.
    </Text>
   </View>:null}
  {!!(error||current?.error)?<View style={[s.warning,{backgroundColor:c.surfaceAlt}]}>
   <Text style={{color:c.text,fontSize:12}}>No pudimos armar la comparación.</Text>
   <Text style={{color:c.subtext,fontSize:11}}>{error||current?.error}</Text>
  </View>:null}
  {top.length?<View style={s.list}>
   {top.slice(0,10).map((entry,i)=>{
    const matched=hits.get(entry.family)||[];
    const paths=entry.paths;
    return <Pressable key={entry.family} accessibilityRole="button"
     accessibilityState={{expanded:opened===entry.family}}
     onPress={()=>setOpened(old=>old===entry.family?null:entry.family)}
     style={[s.item,{backgroundColor:matched.length?c.accentFill:c.card,
      borderColor:matched.length?c.accent:c.border}]}>
     <View style={s.line}>
      <Text style={[s.rank,{backgroundColor:i===0?c.accent:c.surfaceAlt,
       color:i===0?'#082046':c.subtext}]}>{i+1}</Text>
      <Text style={[s.family,{color:c.text}]}>{entry.family}</Text>
      {matched.length?<Text style={{fontSize:10,color:c.accent,fontWeight:'900'}}>✓ Salió</Text>:
       <Text style={{fontSize:11,color:c.subtext}}>Ver forma  ›</Text>}
     </View>
     {matched.length?<Text style={[s.meta,{color:c.accent}]}>
      Coincidió con {matched.join(', ')}
     </Text>:null}
     {opened===entry.family?<Text style={[s.meta,{color:c.subtext}]}>
      Mirá las casillas marcadas aquí mismo.
     </Text>:null}
  {opened===entry.family&&paths.length&&pre?<View style={[s.routeCard,{backgroundColor:c.surfaceAlt,
    borderColor:c.border}]}>
    <Text style={{color:c.accent,fontSize:13,fontWeight:'900'}}>
     Así se forma {entry.family}
    </Text>
    <Text style={[s.meta,{color:c.subtext}]}>
     {paths.length===1?'Un recorrido posible':paths.length+' recorridos posibles'} en la hoja. Sin cruzar columnas.
    </Text>
    {paths.slice(0,3).map((path,i)=>{
     const col=pre.columns.find(x=>x.id===path.source);
     return <View key={path.source+'|'+i} style={s.pathRow}>
      <View style={{flex:1,gap:3}}>
       <Text style={{color:c.text,fontWeight:'800'}}>
        {sourceLabel(path.source)} · {path.value}
       </Text>
       <Text style={{color:c.subtext,fontSize:11}}>Camino {i+1} de {paths.length}</Text>
      </View>
      {col?<RouteMiniBoard values={col.values} cells={path.cells} kind="vt3" compact/>:null}
     </View>
    })}
    {paths.length>3?<Text style={{color:c.subtext,fontSize:11}}>
     Hay {paths.length-3} recorridos más en esta familia.
    </Text>:null}
   </View>:null}
    </Pressable>
   })}
  </View>:null}
  {top.length?<View style={[s.footer,{backgroundColor:c.surfaceAlt}]}>
   <Text style={{color:c.subtext,fontSize:11,lineHeight:17}}>
    {saved?
     'Elección guardada en este teléfono antes del resultado, si estaba pendiente. No es un sello externo.':
     published?'Comparación reconstruida después del sorteo. No cuenta como elección anticipada.':
     'La selección se guarda en este teléfono mientras el turno esté pendiente.'}
   </Text>
  </View>:null}
  {!loading&&!top.length&&!error&&!current?.error?<Text style={{color:c.subtext,fontSize:12}}>
   Cargá una jornada con hojas anteriores para ver este listado.
  </Text>:null}
 </View>;
}
const s=StyleSheet.create({
 panel:{marginTop:10,borderWidth:1.3,borderRadius:17,padding:13,gap:10},
 eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1},
 title:{fontSize:20,fontWeight:'900'},
 subtitle:{fontSize:12,lineHeight:19},
 hint:{fontSize:11,lineHeight:17},
 loading:{flexDirection:'row',gap:10,alignItems:'center',padding:12},
 warning:{borderRadius:10,padding:11,gap:4},
 list:{gap:7,marginTop:6},
 item:{borderWidth:1,borderRadius:11,paddingVertical:10,paddingHorizontal:9,gap:6},
 line:{flexDirection:'row',gap:8,alignItems:'center'},
 rank:{fontSize:13,fontWeight:'900',width:29,height:29,textAlign:'center',
  textAlignVertical:'center',overflow:'hidden',borderRadius:8},
 family:{fontSize:15,fontWeight:'900',flex:1},
 meta:{fontSize:11,lineHeight:17},
 routeCard:{borderWidth:1,borderRadius:12,padding:12,gap:10},
 pathRow:{flexDirection:'row',alignItems:'center',padding:6,gap:10},
 footer:{borderRadius:9,padding:9}
});