import React,{useState} from 'react';
import {SafeAreaView,ScrollView,View,Text,Pressable,StyleSheet,ActivityIndicator,Alert,Platform,StatusBar as RNStatusBar} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import DateField from './src/DateField';
import {CabezasDia,descargarCabezas} from './src/cabezas';
import {JURS,TURNOS,mas11} from './src/domain';

const isoToday=()=>new Date().toISOString().slice(0,10);
const display=(iso:string)=>{const [y,m,d]=iso.split('-');return `${d}/${m}/${y}`};
const toIso=(v:string)=>{const m=v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(!m)return null;return `${m[3]}-${m[2]}-${m[1]}`};
type Screen='hoja'|'cabezas'|'analisis';

export default function App(){
 const today=isoToday();
 const [screen,setScreen]=useState<Screen>('hoja');
 const [fechaText,setFechaText]=useState(display(today));
 const [data,setData]=useState<CabezasDia|null>(null);
 const [busy,setBusy]=useState(false);

 const cargar=async()=>{const iso=toIso(fechaText);if(!iso)return Alert.alert('Fecha inválida','Usá DD/MM/AAAA.');
   try{setBusy(true);setData(await descargarCabezas(iso));}catch(e:any){Alert.alert('No se pudo cargar',e?.message||String(e));}finally{setBusy(false)}};

 const cabezas=<ScrollView horizontal><View>
   <View style={s.row}><Text style={[s.cell,s.first]}>Jurisdicción</Text>{TURNOS.map(t=><Text key={t} style={s.cell}>{t}</Text>)}</View>
   {JURS.map(j=><View key={j} style={s.row}><Text style={[s.cell,s.first,s.bold]}>{j}</Text>{TURNOS.map(t=><Text key={t} style={[s.cell,s.value]}>{data?.[t]?.[j]||'----'}</Text>)}</View>)}
 </View></ScrollView>;

 const hoja=<View><Text style={s.section}>HOJA DIARIA · +11</Text><Text style={s.help}>Primera versión visual. La siguiente etapa conectará cada columna con su fuente temporal y los recorridos VT2/VT3/VT4.</Text>
 <ScrollView horizontal><View>
   <View style={s.row}><Text style={[s.cell,s.first]}>Jurisdicción</Text>{TURNOS.map(t=><Text key={t} style={s.cell}>{t}</Text>)}</View>
   {JURS.map(j=><View key={j} style={s.row}><Text style={[s.cell,s.first,s.bold]}>{j}</Text>{TURNOS.map(t=>{const v=data?.[t]?.[j]||'----';return <Text key={t} style={[s.cell,s.plus]}>{v==='----'?'--':mas11(v)}</Text>})}</View>)}
 </View></ScrollView></View>;

 return <SafeAreaView style={s.safe}><StatusBar style="light"/><View style={s.nav}>
 {(['hoja','cabezas','analisis'] as Screen[]).map(x=><Pressable key={x} onPress={()=>setScreen(x)} style={[s.navBtn,screen===x&&s.on]}><Text style={s.navText}>{x.toUpperCase()}</Text></Pressable>)}
 </View><ScrollView contentContainerStyle={s.page}><Text style={s.h1}>MODELO PAPÁ</Text><Text style={s.sub}>Hoja diaria · recorridos · flujo temporal</Text>
 <Text style={s.label}>Fecha</Text><DateField value={fechaText} onChange={v=>{setFechaText(v);setData(null)}}/>
 <Pressable style={s.load} onPress={cargar} disabled={busy}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.loadText}>↻ CARGAR JORNADA</Text>}</Pressable>
 {screen==='cabezas'?cabezas:screen==='hoja'?hoja:<View><Text style={s.section}>ANÁLISIS V1</Text><Text style={s.help}>Reservado para el motor temporal. No se importaron motores de VF-Quiniela.</Text></View>}
 </ScrollView></SafeAreaView>
}
const topInset=Platform.OS==='android'?(RNStatusBar.currentHeight||24)+8:8;
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#09070d',paddingTop:topInset},nav:{flexDirection:'row',gap:6,padding:10,backgroundColor:'#110d17'},navBtn:{flex:1,paddingVertical:12,borderRadius:10},on:{backgroundColor:'#6d28d9'},navText:{color:'#fff',textAlign:'center',fontSize:12,fontWeight:'900'},page:{padding:16,paddingBottom:60},h1:{fontSize:29,fontWeight:'900',color:'#fff',textAlign:'center',marginTop:10},sub:{color:'#a78bfa',textAlign:'center',marginBottom:16},label:{color:'#ddd',fontWeight:'800',marginBottom:6},load:{backgroundColor:'#4c1d95',padding:14,borderRadius:12,marginVertical:14},loadText:{color:'#fff',fontWeight:'900',textAlign:'center'},section:{color:'#fff',fontSize:20,fontWeight:'900',marginVertical:12},help:{color:'#aaa',lineHeight:20,marginBottom:12},row:{flexDirection:'row',borderBottomWidth:1,borderBottomColor:'#2b2233'},cell:{width:92,paddingVertical:11,paddingHorizontal:5,color:'#ddd',textAlign:'center'},first:{width:115,textAlign:'left'},bold:{fontWeight:'800',color:'#fff'},value:{color:'#c4b5fd',fontWeight:'800'},plus:{color:'#fff',fontSize:18,fontWeight:'900'}});