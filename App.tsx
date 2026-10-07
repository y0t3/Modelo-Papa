import React,{useMemo,useState} from 'react';
import {SafeAreaView,ScrollView,View,Text,Pressable,StyleSheet,ActivityIndicator,Alert,Platform,StatusBar as RNStatusBar} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import DateField from './src/DateField';
import {CabezasDia,descargarCabezas} from './src/cabezas';
import {JURS,TURNOS} from './src/domain';
import {buildSheet,DailySheet,Match} from './src/sheet';
import {displayToIso,isoToDisplay,previousDrawDay,shiftDrawDay} from './src/dates';
import {Path} from './src/paths';

type Screen='hoja'|'cabezas'|'analisis';
type Sel={match:Match;kind:'vt2'|'vt3'|'vt4';index:number}|null;
const today=()=>new Date().toISOString().slice(0,10);

export default function App(){
 const [screen,setScreen]=useState<Screen>('hoja'),[fechaText,setFechaText]=useState(isoToDisplay(today()));
 const [data,setData]=useState<CabezasDia|null>(null),[sheet,setSheet]=useState<DailySheet|null>(null),[busy,setBusy]=useState(false),[sel,setSel]=useState<Sel>(null);
 const iso=displayToIso(fechaText);
 const cargar=async(target?:string)=>{const d=target||iso;if(!d)return Alert.alert('Fecha inválida','Usá DD/MM/AAAA.');
  try{setBusy(true);setSel(null);const [cur,prev]=await Promise.all([descargarCabezas(d),descargarCabezas(previousDrawDay(d))]);setData(cur);setSheet(buildSheet(cur,prev));setFechaText(isoToDisplay(d));}
  catch(e:any){Alert.alert('No se pudo cargar',e?.message||String(e));}finally{setBusy(false)}};
 const move=(n:1|-1)=>{if(!iso)return;void cargar(shiftDrawDay(iso,n))};
 const d7=()=>{if(!iso)return;void cargar(new Date(new Date(iso+'T12:00:00').getTime()-7*86400000).toISOString().slice(0,10))};
 const activePath=useMemo<Path|undefined>(()=>sel?(sel.match[sel.kind]?.[sel.index]):undefined,[sel]);
 const activeTurn=sel?.match.turno;

 const heads=<ScrollView horizontal><View>{header()}{JURS.map(j=><View key={j} style={s.row}><Text style={[s.cell,s.first,s.bold]}>{j}</Text>{TURNOS.map(t=><Text key={t} style={[s.cell,s.value]}>{data?.[t]?.[j]||'----'}</Text>)}</View>)}</View></ScrollView>;
 function header(){return <View style={s.row}><Text style={[s.cell,s.first]}>Jurisdicción</Text>{TURNOS.map(t=><Text key={t} style={s.cell}>{t}</Text>)}</View>}

 const choose=(m:Match,k:'vt2'|'vt3'|'vt4')=>setSel({match:m,kind:k,index:0});
 const matchCard=(m:Match)=><View key={m.jurisdiccion+'-'+m.cabeza} style={s.match}>
   <Text style={s.matchJur}>{m.jurisdiccion}</Text><Text style={s.headNum}>{m.cabeza}</Text>
   <View style={s.badges}>{m.vt4&&<Pressable onPress={()=>choose(m,'vt4')}><Text style={s.badge}>VT4 · {m.vt4.length}</Text></Pressable>}
   {m.vt3&&<Pressable onPress={()=>choose(m,'vt3')}><Text style={s.badge}>VT3 · {m.vt3.length}</Text></Pressable>}
   {m.vt2&&<Pressable onPress={()=>choose(m,'vt2')}><Text style={s.badge2}>VT2 · {m.vt2.length}</Text></Pressable>}</View>
 </View>;

 const board=sheet&&<ScrollView horizontal><View style={s.boardRow}>{sheet.columns.map(col=>{
  const highlighted=(r:number,c:number)=>activeTurn===col.turno&&!!activePath?.some(x=>x.row===r&&x.col===c);
  return <View key={col.turno} style={s.column}><Text style={s.turn}>{col.turno}</Text><Text style={s.source}>← {col.sourceLabel}</Text>
   {JURS.map((j,r)=>{const v=col.values[r];return <View key={j} style={s.gridRow}><Text style={s.jurMini}>{j}</Text>{[0,1].map(c=><View key={c} style={[s.digit,highlighted(r,c)&&s.hit]}><Text style={[s.digitText,highlighted(r,c)&&s.hitText]}>{v==='--'?'–':v[c]}</Text></View>)}</View>})}
   <Text style={s.formed}>CABEZAS COINCIDENTES</Text>{sheet.matches[col.turno].length?sheet.matches[col.turno].map(matchCard):<Text style={s.none}>—</Text>}
  </View>})}</View></ScrollView>;

 const routeControls=sel&&<View style={s.routeBox}><Text style={s.routeTitle}>{sel.match.jurisdiccion} · {sel.match.cabeza} · {sel.kind.toUpperCase()}</Text>
  <Text style={s.routeText}>Recorrido {sel.index+1}/{sel.match[sel.kind]!.length}</Text>
  <View style={s.routeBtns}><Pressable style={s.smallBtn} onPress={()=>setSel({...sel,index:(sel.index-1+sel.match[sel.kind]!.length)%sel.match[sel.kind]!.length})}><Text style={s.btnTxt}>‹</Text></Pressable>
  <Pressable style={s.smallBtn} onPress={()=>setSel({...sel,index:(sel.index+1)%sel.match[sel.kind]!.length})}><Text style={s.btnTxt}>›</Text></Pressable>
  <Pressable style={s.clearBtn} onPress={()=>setSel(null)}><Text style={s.btnTxt}>CERRAR</Text></Pressable></View></View>;

 return <SafeAreaView style={s.safe}><StatusBar style="light"/><View style={s.nav}>{(['hoja','cabezas','analisis'] as Screen[]).map(x=><Pressable key={x} onPress={()=>setScreen(x)} style={[s.navBtn,screen===x&&s.on]}><Text style={s.navText}>{x.toUpperCase()}</Text></Pressable>)}</View>
 <ScrollView contentContainerStyle={s.page}><Text style={s.h1}>MODELO PAPÁ</Text><Text style={s.sub}>Hoja diaria · recorridos · flujo temporal</Text>
 <Text style={s.label}>Fecha de consulta</Text><DateField value={fechaText} onChange={v=>{setFechaText(v);setData(null);setSheet(null);setSel(null)}}/>
 <View style={s.quick}><Pressable style={s.qbtn} onPress={()=>move(-1)}><Text style={s.qtxt}>← DÍA</Text></Pressable><Pressable style={s.qbtn} onPress={d7}><Text style={s.qtxt}>D−7</Text></Pressable><Pressable style={s.qbtn} onPress={()=>move(1)}><Text style={s.qtxt}>DÍA →</Text></Pressable></View>
 <Pressable style={s.load} onPress={()=>cargar()} disabled={busy}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.loadText}>↻ CARGAR HOJA</Text>}</Pressable>
 {screen==='cabezas'?heads:screen==='hoja'?<><Text style={s.section}>HOJA DIARIA · +11</Text>{routeControls}{board}</>:<View><Text style={s.section}>ANÁLISIS V1</Text><Text style={s.help}>Motor temporal separado. Se conectará después de validar la hoja y sus recorridos.</Text></View>}
 </ScrollView></SafeAreaView>
}
const topInset=Platform.OS==='android'?(RNStatusBar.currentHeight||24)+8:8;
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#09070d',paddingTop:topInset},nav:{flexDirection:'row',gap:6,padding:10,backgroundColor:'#110d17'},navBtn:{flex:1,paddingVertical:12,borderRadius:10},on:{backgroundColor:'#6d28d9'},navText:{color:'#fff',textAlign:'center',fontSize:12,fontWeight:'900'},page:{padding:16,paddingBottom:70},h1:{fontSize:29,fontWeight:'900',color:'#fff',textAlign:'center',marginTop:10},sub:{color:'#a78bfa',textAlign:'center',marginBottom:16},label:{color:'#ddd',fontWeight:'800',marginBottom:6},quick:{flexDirection:'row',gap:7,marginTop:10},qbtn:{flex:1,backgroundColor:'#21182c',padding:10,borderRadius:9},qtxt:{color:'#c4b5fd',textAlign:'center',fontWeight:'900'},load:{backgroundColor:'#4c1d95',padding:14,borderRadius:12,marginVertical:14},loadText:{color:'#fff',fontWeight:'900',textAlign:'center'},section:{color:'#fff',fontSize:20,fontWeight:'900',marginVertical:12},help:{color:'#aaa',lineHeight:20,marginBottom:12},row:{flexDirection:'row',borderBottomWidth:1,borderBottomColor:'#2b2233'},cell:{width:92,paddingVertical:11,paddingHorizontal:5,color:'#ddd',textAlign:'center'},first:{width:115,textAlign:'left'},bold:{fontWeight:'800',color:'#fff'},value:{color:'#c4b5fd',fontWeight:'800'},boardRow:{flexDirection:'row',gap:12,paddingBottom:15},column:{width:205,backgroundColor:'#141019',borderWidth:1,borderColor:'#352541',borderRadius:14,padding:10},turn:{color:'#fff',fontSize:17,fontWeight:'900',textAlign:'center'},source:{color:'#9277b5',fontSize:11,textAlign:'center',marginBottom:9},gridRow:{flexDirection:'row',alignItems:'center',marginBottom:4},jurMini:{width:103,color:'#aaa',fontSize:11},digit:{width:38,height:38,backgroundColor:'#09070d',borderWidth:1,borderColor:'#3a2b48',alignItems:'center',justifyContent:'center',marginLeft:2,borderRadius:5},digitText:{color:'#fff',fontSize:21,fontWeight:'900'},hit:{backgroundColor:'#f5d90a',borderColor:'#fff'},hitText:{color:'#09070d'},formed:{color:'#a78bfa',fontSize:10,fontWeight:'900',marginTop:12,marginBottom:5},none:{color:'#666',textAlign:'center'},match:{borderTopWidth:1,borderTopColor:'#2d2238',paddingVertical:7},matchJur:{color:'#aaa',fontSize:10},headNum:{color:'#fff',fontSize:20,fontWeight:'900',letterSpacing:2},badges:{flexDirection:'row',flexWrap:'wrap',gap:4,marginTop:4},badge:{backgroundColor:'#6d28d9',color:'#fff',paddingHorizontal:6,paddingVertical:3,borderRadius:5,fontSize:10,fontWeight:'900'},badge2:{backgroundColor:'#30253b',color:'#ddd',paddingHorizontal:6,paddingVertical:3,borderRadius:5,fontSize:10,fontWeight:'800'},routeBox:{backgroundColor:'#20162b',borderRadius:12,padding:12,marginBottom:12},routeTitle:{color:'#fff',fontWeight:'900'},routeText:{color:'#c4b5fd',marginTop:4},routeBtns:{flexDirection:'row',gap:7,marginTop:8},smallBtn:{width:48,backgroundColor:'#6d28d9',padding:8,borderRadius:8},clearBtn:{backgroundColor:'#3a2b48',padding:8,borderRadius:8},btnTxt:{color:'#fff',textAlign:'center',fontWeight:'900'}});