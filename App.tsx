import React,{useMemo,useState} from 'react';
import {SafeAreaView,ScrollView,View,Text,Pressable,StyleSheet,ActivityIndicator,Alert,Platform,StatusBar as RNStatusBar} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import DateField from './src/DateField';
import {descargarCabezas} from './src/cabezas';
import type {CabezasDia,Turno} from './src/domain';
import {JURS,TURNOS} from './src/domain';
import {buildSheet} from './src/sheet';
import type {DailySheet} from './src/sheet';
import {displayToIso,isoToDisplay,shiftDay,shiftDrawDay,previousDrawDay} from './src/dates';
import {loadPreviousDraws,hasDrawResults} from './src/drawHistory';
import {buildDailyPanorama,buildPredictivePanorama} from './src/panoramaModel';
import {buildMotorLalo,compareMotorLaloAfterDraw} from './src/motorLalo';
import type {LaloHistorical} from './src/motorLalo';
import PanoramaSheet from './src/PanoramaSheet';
import PredictionSummary from './src/ui/PredictionSummary';
import HeadsTable from './src/ui/HeadsTable';
import InfoDashboard from './src/ui/InfoDashboard';
import TurnStrip from './src/ui/TurnStrip';

type Screen='hoja'|'predictiva'|'prediccion'|'cabezas'|'info';
const nav: {id:Screen;label:string}[]=[
 {id:'hoja',label:'HOJA'},{id:'predictiva',label:'PREDICTIVA'},
 {id:'prediccion',label:'PREDICCIÓN'},{id:'cabezas',label:'CABEZAS'},
 {id:'info',label:'INFO'}
];
const today=()=>new Date().toISOString().slice(0,10);
export default function App(){
 const [screen,setScreen]=useState<Screen>('hoja');
 const [dateText,setDateText]=useState(isoToDisplay(today()));
 const [data,setData]=useState<CabezasDia|null>(null);
 const [sheet,setSheet]=useState<DailySheet|null>(null);
 const [hist,setHist]=useState<LaloHistorical[]>([]);
 const [busy,setBusy]=useState(false);
 const [selectedTurn,setSelectedTurn]=useState<Turno|null>(null);
 const [focused,setFocused]=useState<string|null>(null);
 const date=displayToIso(dateText);
 const target=useMemo<Turno>(()=>selectedTurn||TURNOS.find(t=>
  !data||JURS.every(j=>!/^\d{4}$/.test(data[t]?.[j]||'')))||'Nocturno',
  [data,selectedTurn]);

 const cargar=async(requested?:string)=>{
  const d=requested||date;
  if(!d){Alert.alert('Fecha inválida','Usá DD/MM/AAAA.');return}
  try{
   setBusy(true);
   const week=shiftDay(d,-7);
   // Dos jornadas anteriores REALMENTE sorteadas; feriados no cuentan como D−1.
   const [current,previous,weekly,weekPrevious]=await Promise.all([
    descargarCabezas(d,true),
    loadPreviousDraws(d,2,x=>descargarCabezas(x,true)),
    descargarCabezas(week,true),
    descargarCabezas(previousDrawDay(week),true)
   ]);
   const last=previous[1],beforeLast=previous[0];
   const currentSheet=buildSheet(current,last.heads);
   const refs:LaloHistorical[]=[
    {date:last.date,period:'D−1',sheet:buildSheet(last.heads,beforeLast.heads)}
   ];
   if(week<d&&hasDrawResults(weekly))
    refs.push({date:week,period:'D−7',sheet:buildSheet(weekly,weekPrevious)});
   setData(current);setSheet(currentSheet);setHist(refs);
   setDateText(isoToDisplay(d));setSelectedTurn(null);setFocused(null);
  }catch(error:any){
   Alert.alert('No se pudo cargar',error?.message||String(error));
  }finally{setBusy(false)}
 };
 const move=(n:1|-1)=>{if(date)void cargar(shiftDrawDay(date,n))};
 const motor=useMemo(()=>sheet&&date?buildMotorLalo(sheet,date,target,hist):null,
  [sheet,date,target,hist]);
 const hoja=useMemo(()=>sheet?buildDailyPanorama(sheet,data):null,[sheet,data]);
 const predictiva=useMemo(()=>motor?buildPredictivePanorama(motor):null,[motor]);
 const post=useMemo(()=>{
  if(!motor||!sheet||!sheet.heads[target]?.length)return null;
  return compareMotorLaloAfterDraw(motor,sheet.heads[target]);
 },[motor,sheet,target]);
 const changeTurn=(turn:Turno)=>{setSelectedTurn(turn);setFocused(null)};
 const showFamily=(id:string)=>{setFocused(id);setScreen('predictiva')};

 return <SafeAreaView style={s.safe}><StatusBar style="light"/>
  <View style={s.nav}>{nav.map(x=><Pressable key={x.id} accessibilityRole="tab"
    accessibilityState={{selected:screen===x.id}}
    style={[s.tab,screen===x.id&&s.tabOn]}
    onPress={()=>{setScreen(x.id);if(x.id==='hoja')setFocused(null)}}>
    <Text style={s.tabText} numberOfLines={1} adjustsFontSizeToFit>{x.label}</Text>
   </Pressable>)}</View>
  <ScrollView contentContainerStyle={s.content}>
   <Text style={s.title}>MODELO LALO</Text>
   <Text style={s.subtitle}>Cuaderno visual +11 · VT2 / VT3 / VT4</Text>
   <View style={s.selector}>
    <Text style={s.label}>Fecha del tablero</Text>
    <DateField value={dateText} onChange={value=>{
     setDateText(value);setData(null);setSheet(null);setHist([]);setFocused(null);
    }}/>
    <View style={s.shortcuts}>
     <Pressable style={s.shortcut} onPress={()=>move(-1)}><Text style={s.shortText}>← Día</Text></Pressable>
     <Pressable style={s.shortcut} onPress={()=>{if(date)void cargar(shiftDay(date,-7))}}><Text style={s.shortText}>D−7</Text></Pressable>
     <Pressable style={s.shortcut} onPress={()=>move(1)}><Text style={s.shortText}>Día →</Text></Pressable>
    </View>
    <Pressable style={s.reload} onPress={()=>{void cargar()}} disabled={busy}>
     {busy?<ActivityIndicator color="#fff"/>:<Text style={s.reloadText}>↻ ACTUALIZAR HOJA</Text>}
    </Pressable>
   </View>
   {screen==='hoja'?
    sheet&&hoja?<PanoramaSheet mode="hoja" sheet={sheet} data={hoja}
     onInfo={()=>setScreen('info')}/>:
    <Text style={s.empty}>Elegí una fecha y actualizá la hoja para ver sus coincidencias.</Text>
   :screen==='predictiva'?<>
    <Text style={s.heading}>Turno que queremos anticipar</Text>
    <TurnStrip value={target} onChange={changeTurn}/>
    {sheet&&predictiva?<PanoramaSheet mode="predictiva" sheet={sheet}
     data={predictiva} target={target} focusedOwner={focused}
     onInfo={()=>setScreen('info')}/>:
     <Text style={s.empty}>Cargá una hoja para ver las rutas que propone el motor Lalo.</Text>}
   </>:screen==='prediccion'?<>
    <Text style={s.heading}>Turno que queremos anticipar</Text>
    <TurnStrip value={target} onChange={changeTurn}/>
    <PredictionSummary date={dateText} turn={target} view={motor}
     post={post} onFocus={showFamily}/>
   </>:screen==='cabezas'?
    <HeadsTable data={data} sheet={sheet}/>:
    <InfoDashboard turn={target} view={motor}/>}
  </ScrollView>
 </SafeAreaView>;
}
const insets=Platform.OS==='android'?(RNStatusBar.currentHeight||24)+7:7;
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:'#0c0812',paddingTop:insets},
 nav:{flexDirection:'row',backgroundColor:'#140d20',gap:3,paddingHorizontal:5,paddingVertical:9},
 tab:{flex:1,alignItems:'center',justifyContent:'center',borderRadius:8,paddingVertical:11},
 tabOn:{backgroundColor:'#0e4b89'},
 tabText:{fontSize:10,color:'#fff',fontWeight:'900'},
 content:{paddingHorizontal:12,paddingTop:7,paddingBottom:70},
 title:{color:'#fff',fontWeight:'900',fontSize:23,textAlign:'center'},
 subtitle:{color:'#d6b458',fontSize:11,textAlign:'center',marginBottom:11},
 selector:{backgroundColor:'#191124',borderRadius:11,padding:10},
 label:{color:'#e9e0ee',fontSize:11,fontWeight:'800',marginBottom:4},
 shortcuts:{flexDirection:'row',gap:7,marginTop:8},
 shortcut:{flex:1,backgroundColor:'#291c39',padding:9,borderRadius:8},
 shortText:{color:'#d9c1ef',fontSize:11,textAlign:'center',fontWeight:'800'},
 reload:{marginTop:10,padding:11,backgroundColor:'#005c9d',borderRadius:9},
 reloadText:{color:'#fff',textAlign:'center',fontWeight:'900'},
 heading:{fontSize:12,color:'#e2d5ed',fontWeight:'800',marginTop:13,marginBottom:7},
 empty:{color:'#d0c2d8',padding:16,fontSize:12,lineHeight:19}
});
