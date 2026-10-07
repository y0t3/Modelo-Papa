import React,{useMemo,useState} from 'react';
import {SafeAreaView,ScrollView,View,Text,Pressable,StyleSheet,ActivityIndicator,Alert,Platform,StatusBar as RNStatusBar} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import DateField from './src/DateField';
import {descargarCabezas} from './src/cabezas';
import type {CabezasDia} from './src/domain';
import {JURS,TURNOS} from './src/domain';
import {buildSheet} from './src/sheet';
import type {DailySheet,Match,Hit,SourceId} from './src/sheet';
import {displayToIso,isoToDisplay,previousDrawDay,shiftDrawDay} from './src/dates';
import type {Path} from './src/paths';

type Screen='hoja'|'cabezas'|'analisis';
type Kind='vt2'|'vt3'|'vt4';
type Sel={match:Match;kind:Kind;index:number}|null;
const today=()=>new Date().toISOString().slice(0,10);

export default function App(){
 const [screen,setScreen]=useState<Screen>('hoja'),[fechaText,setFechaText]=useState(isoToDisplay(today()));
 const [data,setData]=useState<CabezasDia|null>(null),[sheet,setSheet]=useState<DailySheet|null>(null),[busy,setBusy]=useState(false),[sel,setSel]=useState<Sel>(null),[fontScale,setFontScale]=useState(1);
 const iso=displayToIso(fechaText);
 const cargar=async(target?:string)=>{const d=target||iso;if(!d)return Alert.alert('Fecha inválida','Usá DD/MM/AAAA.');
  try{setBusy(true);setSel(null);const [cur,prev]=await Promise.all([descargarCabezas(d),descargarCabezas(previousDrawDay(d))]);setData(cur);setSheet(buildSheet(cur,prev));setFechaText(isoToDisplay(d));}
  catch(e:any){Alert.alert('No se pudo cargar',e?.message||String(e));}finally{setBusy(false)}};
 const move=(n:1|-1)=>{if(!iso)return;void cargar(shiftDrawDay(iso,n))};
 const d7=()=>{if(!iso)return;void cargar(new Date(new Date(iso+'T12:00:00').getTime()-7*86400000).toISOString().slice(0,10))};
 const selectedHits=useMemo<Hit[]>(()=>sel?sel.match.hits.filter(h=>h.kind===sel.kind):[],[sel]);
 const flatRoutes=useMemo(()=>selectedHits.flatMap(hit=>hit.paths.map(path=>({hit,path}))),[selectedHits]);
 const activeRoute=sel&&flatRoutes.length?flatRoutes[Math.min(sel.index,flatRoutes.length-1)]:undefined;
 const hitInCell=(sourceId:SourceId,r:number,col:number)=>selectedHits.some(h=>h.sourceId===sourceId&&h.paths.some(p=>p.some(x=>x.row===r&&x.col===col)));
 const activeInCell=(sourceId:SourceId,r:number,col:number)=>activeRoute?.hit.sourceId===sourceId&&activeRoute.path.some(x=>x.row===r&&x.col===col);
 const stat=(m:Match,k:Kind)=>{const hs=m.hits.filter(h=>h.kind===k);return {hits:hs,cols:new Set(hs.map(h=>h.sourceId)).size,paths:hs.reduce((n,h)=>n+h.paths.length,0)}};


 const heads=<ScrollView horizontal><View>{header()}{JURS.map(j=><View key={j} style={s.row}><Text style={[s.cell,s.first,s.bold]}>{j}</Text>{TURNOS.map(t=><Text key={t} style={[s.cell,s.value]}>{data?.[t]?.[j]||'----'}</Text>)}</View>)}</View></ScrollView>;
 function header(){return <View style={s.row}><Text style={[s.cell,s.first]}>Jurisdicción</Text>{TURNOS.map(t=><Text key={t} style={s.cell}>{t}</Text>)}</View>}

 const choose=(m:Match,k:Kind)=>setSel({match:m,kind:k,index:0});
 const paintedHead=(m:Match)=>{const k:Kind=sel?.match===m?sel.kind:(m.hits.some(h=>h.kind==='vt4')?'vt4':m.hits.some(h=>h.kind==='vt3')?'vt3':'vt2');const n=k==='vt4'?4:k==='vt3'?3:2;const cut=4-n;return <Text style={[s.headNum,{fontSize:20*fontScale}]}>{m.cabeza.slice(0,cut)}<Text style={s.mark}>{m.cabeza.slice(cut)}</Text></Text>};
 const matchCard=(m:Match)=><View key={m.jurisdiccion+'-'+m.cabeza} style={s.match}>
   <Text style={[s.matchJur,{fontSize:10*fontScale}]}>{m.jurisdiccion}</Text>{paintedHead(m)}
   <View style={s.badges}>{(['vt4','vt3','vt2'] as Kind[]).map(k=>{const x=stat(m,k);return x.hits.length?<Pressable key={k} onPress={()=>choose(m,k)}><Text style={k==='vt2'?s.badge2:s.badge}>{k.toUpperCase()} · {x.cols} col · {x.paths} rec</Text></Pressable>:null})}</View>
 </View>;

 const board=sheet&&<ScrollView horizontal><View style={s.boardRow}>{sheet.columns.map(col=>{
  const highlighted=(r:number,c:number)=>hitInCell(col.id,r,c);
  const active=(r:number,c:number)=>activeInCell(col.id,r,c);
  return <View key={col.turno} style={s.column}><Text style={s.turn}>{col.turno}</Text><Text style={s.source}>← {col.sourceLabel}</Text>
   {JURS.map((j,r)=>{const v=col.values[r];return <View key={j} style={s.gridRow}><Text style={s.jurMini}>{j}</Text>{[0,1].map(c=><View key={c} style={[s.digit,highlighted(r,c)&&s.hit,active(r,c)&&s.activeHit]}><Text style={[s.digitText,{fontSize:21*fontScale},highlighted(r,c)&&s.hitText]}>{v==='--'?'–':v[c]}</Text></View>)}</View>})}
   <Text style={s.formed}>CABEZAS COINCIDENTES</Text>{sheet.matches[col.turno].length?sheet.matches[col.turno].map(matchCard):<Text style={s.none}>—</Text>}
  </View>})}</View></ScrollView>;

 const routeControls=sel&&<View style={s.routeBox}><Text style={s.routeTitle}>{sel.match.jurisdiccion} · {sel.match.cabeza} · {sel.kind.toUpperCase()}</Text>
  <Text style={s.routeText}>{selectedHits.length} columna(s) · {flatRoutes.length} recorrido(s){activeRoute?` · ahora: ${activeRoute.hit.sourceTurn}`:''}</Text>
  <View style={s.routeBtns}><Pressable style={s.smallBtn} onPress={()=>setSel({...sel,index:(sel.index-1+flatRoutes.length)%flatRoutes.length})}><Text style={s.btnTxt}>‹</Text></Pressable>
  <Pressable style={s.smallBtn} onPress={()=>setSel({...sel,index:(sel.index+1)%flatRoutes.length})}><Text style={s.btnTxt}>›</Text></Pressable>
  <Pressable style={s.clearBtn} onPress={()=>setSel(null)}><Text style={s.btnTxt}>CERRAR</Text></Pressable></View></View>;

 return <SafeAreaView style={s.safe}><StatusBar style="light"/><View style={s.nav}>{(['hoja','cabezas','analisis'] as Screen[]).map(x=><Pressable key={x} onPress={()=>setScreen(x)} style={[s.navBtn,screen===x&&s.on]}><Text style={s.navText}>{x.toUpperCase()}</Text></Pressable>)}</View>
 <ScrollView contentContainerStyle={s.page}><View style={s.fontBar}><Text style={s.fontLabel}>Tamaño</Text><Pressable style={s.fontBtn} onPress={()=>setFontScale(.86)}><Text style={s.fontTxt}>A−</Text></Pressable><Pressable style={s.fontBtn} onPress={()=>setFontScale(1)}><Text style={s.fontTxt}>A</Text></Pressable><Pressable style={s.fontBtn} onPress={()=>setFontScale(1.18)}><Text style={s.fontTxt}>A+</Text></Pressable></View><Text style={s.h1}>MODELO PAPÁ</Text><Text style={s.sub}>Hoja diaria · recorridos · flujo temporal</Text>
 <Text style={s.label}>Fecha de consulta</Text><DateField value={fechaText} onChange={v=>{setFechaText(v);setData(null);setSheet(null);setSel(null)}}/>
 <View style={s.quick}><Pressable style={s.qbtn} onPress={()=>move(-1)}><Text style={s.qtxt}>← DÍA</Text></Pressable><Pressable style={s.qbtn} onPress={d7}><Text style={s.qtxt}>D−7</Text></Pressable><Pressable style={s.qbtn} onPress={()=>move(1)}><Text style={s.qtxt}>DÍA →</Text></Pressable></View>
 <Pressable style={s.load} onPress={()=>cargar()} disabled={busy}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.loadText}>↻ CARGAR HOJA</Text>}</Pressable>
 {screen==='cabezas'?heads:screen==='hoja'?<><Text style={s.section}>HOJA DIARIA · +11</Text>{routeControls}{board}</>:<View><Text style={s.section}>ANÁLISIS V1</Text><Text style={s.help}>Motor temporal separado. Se conectará después de validar la hoja y sus recorridos.</Text></View>}
 </ScrollView></SafeAreaView>
}
const topInset=Platform.OS==='android'?(RNStatusBar.currentHeight||24)+8:8;
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#09070d',paddingTop:topInset},nav:{flexDirection:'row',gap:6,padding:10,backgroundColor:'#110d17'},navBtn:{flex:1,paddingVertical:12,borderRadius:10},on:{backgroundColor:'#6d28d9'},navText:{color:'#fff',textAlign:'center',fontSize:12,fontWeight:'900'},fontBar:{flexDirection:'row',justifyContent:'flex-end',alignItems:'center',gap:6},fontLabel:{color:'#777',fontSize:11},fontBtn:{backgroundColor:'#21182c',paddingHorizontal:11,paddingVertical:7,borderRadius:7},fontTxt:{color:'#fff',fontWeight:'900'},page:{padding:16,paddingBottom:70},h1:{fontSize:29,fontWeight:'900',color:'#fff',textAlign:'center',marginTop:10},sub:{color:'#a78bfa',textAlign:'center',marginBottom:16},label:{color:'#ddd',fontWeight:'800',marginBottom:6},quick:{flexDirection:'row',gap:7,marginTop:10},qbtn:{flex:1,backgroundColor:'#21182c',padding:10,borderRadius:9},qtxt:{color:'#c4b5fd',textAlign:'center',fontWeight:'900'},load:{backgroundColor:'#4c1d95',padding:14,borderRadius:12,marginVertical:14},loadText:{color:'#fff',fontWeight:'900',textAlign:'center'},section:{color:'#fff',fontSize:20,fontWeight:'900',marginVertical:12},help:{color:'#aaa',lineHeight:20,marginBottom:12},row:{flexDirection:'row',borderBottomWidth:1,borderBottomColor:'#2b2233'},cell:{width:92,paddingVertical:11,paddingHorizontal:5,color:'#ddd',textAlign:'center'},first:{width:115,textAlign:'left'},bold:{fontWeight:'800',color:'#fff'},value:{color:'#c4b5fd',fontWeight:'800'},boardRow:{flexDirection:'row',gap:12,paddingBottom:15},column:{width:205,backgroundColor:'#141019',borderWidth:1,borderColor:'#352541',borderRadius:14,padding:10},turn:{color:'#fff',fontSize:17,fontWeight:'900',textAlign:'center'},source:{color:'#9277b5',fontSize:11,textAlign:'center',marginBottom:9},gridRow:{flexDirection:'row',alignItems:'center',marginBottom:4},jurMini:{width:103,color:'#aaa',fontSize:11},digit:{width:38,height:38,backgroundColor:'#09070d',borderWidth:1,borderColor:'#3a2b48',alignItems:'center',justifyContent:'center',marginLeft:2,borderRadius:5},digitText:{color:'#fff',fontSize:21,fontWeight:'900'},hit:{backgroundColor:'#f5d90a',borderColor:'#fff'},activeHit:{borderWidth:3,borderColor:'#ff7a00'},hitText:{color:'#09070d'},formed:{color:'#a78bfa',fontSize:10,fontWeight:'900',marginTop:12,marginBottom:5},none:{color:'#666',textAlign:'center'},match:{borderTopWidth:1,borderTopColor:'#2d2238',paddingVertical:7},matchJur:{color:'#aaa',fontSize:10},headNum:{color:'#fff',fontSize:20,fontWeight:'900',letterSpacing:2},mark:{backgroundColor:'#f5d90a',color:'#09070d'},badges:{flexDirection:'row',flexWrap:'wrap',gap:4,marginTop:4},badge:{backgroundColor:'#6d28d9',color:'#fff',paddingHorizontal:6,paddingVertical:3,borderRadius:5,fontSize:10,fontWeight:'900'},badge2:{backgroundColor:'#30253b',color:'#ddd',paddingHorizontal:6,paddingVertical:3,borderRadius:5,fontSize:10,fontWeight:'800'},routeBox:{backgroundColor:'#20162b',borderRadius:12,padding:12,marginBottom:12},routeTitle:{color:'#fff',fontWeight:'900'},routeText:{color:'#c4b5fd',marginTop:4},routeBtns:{flexDirection:'row',gap:7,marginTop:8},smallBtn:{width:48,backgroundColor:'#6d28d9',padding:8,borderRadius:8},clearBtn:{backgroundColor:'#3a2b48',padding:8,borderRadius:8},btnTxt:{color:'#fff',textAlign:'center',fontWeight:'900'}});