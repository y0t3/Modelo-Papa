import React,{useEffect,useMemo,useRef,useState} from 'react';
import {SafeAreaView,ScrollView,View,Text,Pressable,StyleSheet,ActivityIndicator,Alert,BackHandler,Platform,StatusBar as RNStatusBar} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import DateField from './src/DateField';
import {descargarCabezas} from './src/cabezas';
import type {CabezasDia,Turno} from './src/domain';
import {JURS,TURNOS} from './src/domain';
import {buildSheet} from './src/sheet';
import type {DailySheet} from './src/sheet';
import {displayToIso,isoToDisplay,shiftDay,shiftDrawDay,previousDrawDay} from './src/dates';
import {loadPreviousDraws,hasDrawResults} from './src/drawHistory';
import {buildInfoWeek} from './src/infoWeek';
import {buildVt3Shadow} from './src/vt3Shadow';
import {buildVt3Trial} from './src/vt3Trial';
import {buildConnectedVt3} from './src/connectedVt3';
import {preSheetAtCut} from './src/infoCandidatos';
import {saveFrozen} from './src/vt3Snapshot';
import {buildDailyPanorama,buildPredictivePanorama,dailyHeadOwnerId} from './src/panoramaModel';
import {buildMotorLalo,compareMotorLaloAfterDraw} from './src/motorLalo';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from './src/motorLaloAuxiliar';
import type {AuxiliarHistory} from './src/motorLaloAuxiliar';
import type {LaloHistorical} from './src/motorLalo';
import type {InfoVisualDay,TurnHistoryFrame} from './src/infoTurnHistory';
import PanoramaSheet from './src/PanoramaSheet';
import AuxiliaryPredictiveSheet from './src/ui/AuxiliaryPredictiveSheet';
import PredictionSummary from './src/ui/PredictionSummary';
import ParallelPredictionCompare from './src/ui/ParallelPredictionCompare';
import Vt3Explainer from './src/ui/Vt3Explainer';
import Vt3Parallel from './src/ui/Vt3Parallel';
import PapaPronostico from './src/ui/PapaPronostico';
import HeadsTable from './src/ui/HeadsTable';
import {fetchAuxiliaryBaseForDate,fetchAuxiliaryHeads} from './src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from './src/auxTemporalModes';
import type {AuxMode} from './src/auxTemporalModes';
import AuxModeSwitch from './src/ui/AuxModeSwitch';
import type {AuxiliaryHeads} from './src/auxSantiagoNeuquen';
import {buildHeadHighlights} from './src/headHighlights';
import type {HeadHighlight} from './src/headHighlights';
import InfoDashboard from './src/ui/InfoDashboard';
import type {MovementMode} from './src/infoCandidatos';
import TurnStrip from './src/ui/TurnStrip';
import {LaloThemeProvider,useLaloTheme} from './src/ui/LaloTheme';
import ZoomableTab from './src/ui/ZoomableTab';
import {ZOOM_STORAGE_KEY,defaultZoomLevels,decodeTabZoom,applyTabZoom} from './src/tabZoom';
import {pushNavigation,backNavigation,safeScrollY} from './src/tabNavigation';
import type {NavigationEntry} from './src/tabNavigation';

type Screen='hoja'|'predictiva'|'prediccion'|'papa'|'cabezas'|'info';
const nav: {id:Screen;label:string}[]=[
 {id:'hoja',label:'HOJA'},
 {id:'predictiva',label:'PREDICTIVA'},
 {id:'prediccion',label:'PREDICCIÓN'},{id:'papa',label:'LALO'},
 {id:'cabezas',label:'CABEZAS'},
 {id:'info',label:'INFO'}
];
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
function LaloApp(){
 const {mode,colors:c,toggle}=useLaloTheme();
 const [screen,setScreen]=useState<Screen>('hoja');
 const activeScreenRef=useRef<Screen>('hoja');
 const historyRef=useRef<NavigationEntry[]>([]);
 const scrollOffsets=useRef<Record<Screen,number>>({
  hoja:0,predictiva:0,prediccion:0,papa:0,cabezas:0,info:0
 });
 const [restoreScroll,setRestoreScroll]=useState({token:0,y:0});
 const [infoFrameId,setInfoFrameId]=useState('inicio');
 const [infoMode,setInfoMode]=useState<MovementMode>('todos');
 const [infoGuide,setInfoGuide]=useState<string|null>('tablero');
 const [zoomLevels,setZoomLevels]=useState(defaultZoomLevels);
 useEffect(()=>{
  let alive=true;
  void AsyncStorage.getItem(ZOOM_STORAGE_KEY).then(raw=>{
   if(alive)setZoomLevels(decodeTabZoom(raw));
  }).catch(()=>{});
  return ()=>{alive=false};
 },[]);
 const updateZoom=(next:number)=>{
  setZoomLevels(previous=>{
   const updated=applyTabZoom(previous,screen,next);
   void AsyncStorage.setItem(ZOOM_STORAGE_KEY,JSON.stringify(updated)).catch(()=>{});
   return updated;
  });
 };
 const [dateText,setDateText]=useState(isoToDisplay(today()));
 const [data,setData]=useState<CabezasDia|null>(null);
 const [auxHeads,setAuxHeads]=useState<AuxiliaryHeads|null>(null);
 const [auxSourceDate,setAuxSourceDate]=useState<string|null>(null);
 const [auxToday,setAuxToday]=useState<AuxiliaryHeads|null>(null);
 const [auxMode,setAuxMode]=useState<AuxMode>('intrajornada');
 const [historicalAux,setHistoricalAux]=useState<{date:string;
  previous:AuxiliaryHeads|null;sourceDate:string|null;today:AuxiliaryHeads|null}|null>(null);
 const [sheet,setSheet]=useState<DailySheet|null>(null);
 const [hist,setHist]=useState<LaloHistorical[]>([]);
 const [auxiliarPast,setAuxiliarPast]=useState<AuxiliarHistory[]>([]);
 const [auxiliarError,setAuxiliarError]=useState<string|null>(null);
 const [auxTodayPast,setAuxTodayPast]=useState<AuxiliarHistory[]>([]);
 const [auxTodayError,setAuxTodayError]=useState<string|null>(null);
 const [predictionMode,setPredictionMode]=useState<'lalo'|'auxiliar'>('lalo');
 const [predictiveMode,setPredictiveMode]=useState<'lalo'|'auxiliar'>('lalo');

 const [visualDays,setVisualDays]=useState<InfoVisualDay[]>([]);
 const [historicalPreview,setHistoricalPreview]=useState<{day:InfoVisualDay;turn:Turno}|null>(null);
 const [busy,setBusy]=useState(false);
 const [experimental,setExperimental]=useState(false);
 const [baseHeads,setBaseHeads]=useState<CabezasDia|null>(null);
 const [autoVersion,setAutoVersion]=useState(0);
 const [selectedTurn,setSelectedTurn]=useState<Turno|null>(null);
 const [focused,setFocused]=useState<string|null>(null);
 const [hojaFocused,setHojaFocused]=useState<string|null>(null);
 const [hojaTurn,setHojaTurn]=useState<Turno>('Previa');
 const scrollRef=useRef<ScrollView>(null);
 const navigateTo=(next:Screen)=>{
  const from=activeScreenRef.current;
  if(from===next)return;
  if(next!=='hoja'){setHistoricalPreview(null);setHistoricalAux(null);}
  historyRef.current=pushNavigation(historyRef.current,{
   screen:from,scrollY:scrollOffsets.current[from],selectedTurn,
   focused,hojaFocused,hojaTurn
  },next);
  activeScreenRef.current=next;
  scrollOffsets.current[next]=0;
  setRestoreScroll(old=>({token:old.token+1,y:0}));
  setScreen(next);
  if(next!=='prediccion')setExperimental(false);
 };
 const goBack=()=>{
  const {entry,remaining}=backNavigation(historyRef.current);
  if(!entry)return false; // sin historial, Android conserva Atrás del sistema
  setHistoricalPreview(null);setHistoricalAux(null);
  historyRef.current=remaining;
  activeScreenRef.current=entry.screen;
  setSelectedTurn(entry.selectedTurn);
  setFocused(entry.focused);
  setHojaFocused(entry.hojaFocused);
  setHojaTurn(entry.hojaTurn);
  scrollOffsets.current[entry.screen]=entry.scrollY;
  setRestoreScroll(old=>({token:old.token+1,y:entry.scrollY}));
  setScreen(entry.screen);
  return true;
 };
 const backHandlerRef=useRef(goBack);
 backHandlerRef.current=goBack;
 useEffect(()=>{
  const subscription=BackHandler.addEventListener('hardwareBackPress',()=>backHandlerRef.current());
  return ()=>subscription.remove();
 },[]);
 const resetHistory=()=>{
  historyRef.current=[];
  for(const key of Object.keys(scrollOffsets.current) as Screen[])
   scrollOffsets.current[key]=0;
  setRestoreScroll(old=>({token:old.token+1,y:0}));
  setInfoFrameId('inicio');
  setInfoMode('todos');
  setInfoGuide('tablero');
 };
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
   // Cuatro jornadas reales: tres minihojas y una anterior como base de la tercera.
   const weekDates=Array.from({length:7},(_,i)=>shiftDay(week,i));
   const [current,previous,weekData,beforeWeek,auxResult,auxLive]=await Promise.all([
    descargarCabezas(d,true),
    loadPreviousDraws(d,4,x=>descargarCabezas(x,true)),
    Promise.all(weekDates.map(day=>descargarCabezas(day,true))),
    loadPreviousDraws(week,1,x=>descargarCabezas(x,true)),
    fetchAuxiliaryBaseForDate(d).catch(()=>null),
    fetchAuxiliaryHeads(d).catch(()=>null)
   ]);
   const weekly=weekData[0],weekPrevious=beforeWeek[0].heads;
   const last=previous[3],beforeLast=previous[2];
   const recentDays=buildInfoWeek(week,d,
    weekDates.map((day,i)=>({date:day,heads:weekData[i]})),weekPrevious);
   const currentSheet=buildSheet(current,last.heads);
   const refs:LaloHistorical[]=[
    {date:last.date,period:'D−1',sheet:buildSheet(last.heads,beforeLast.heads)}
   ];
   if(week<d&&hasDrawResults(weekly))
    refs.push({date:week,period:'D−7',sheet:buildSheet(weekly,weekPrevious)});
   // El motor auxiliar requiere solamente raíces RAW anteriores de
   // Santiago-Neuquén DE LA JORNADA ANTERIOR a cada fecha D−1/D−7.
   // El tablero actual también viene de AYER, nunca de los sorteos de hoy.
   let auxiliarHistory:AuxiliarHistory[]=[];
   let auxWarning:string|null=null;
   if(!auxResult){
    auxWarning='No se recibieron las cabezas de Santiago–Neuquén de la jornada anterior.';
   }else{
    try{
     auxiliarHistory=await Promise.all(refs.map(async ref=>{
      const heads=ref.date===last.date?last.heads:weekly;
      const observation=await fetchAuxiliaryBaseForDate(ref.date);
      return {date:ref.date,period:ref.period,
       sourceDate:observation.sourceDate,heads:observation.heads,
       aux:extractAuxiliarHistory(ref.date,observation.heads,heads)};
     }));
    }catch(error:any){
     auxWarning='No se pudieron completar las raíces históricas AUX: '+
      (error?.message||String(error));
    }
   }
   let todayHistory:AuxiliarHistory[]=[];
   let todayWarning:string|null=null;
   if(!auxLive){
    todayWarning='No se pudieron leer las cifras Santiago–Neuquén del día seleccionado.';
   }else{
    try{
     todayHistory=await Promise.all(refs.map(async ref=>{
      const observed=ref.date===last.date?last.heads:weekly;
      const source=await fetchAuxiliaryHeads(ref.date);
      return {date:ref.date,period:ref.period,heads:source.heads,
       aux:extractAuxHistoryMode(ref.date,source.heads,observed,'intrajornada')};
     }));
    }catch(error:any){
     todayWarning='No se pudieron completar las raíces INTRAJORNADA: '+
      (error?.message||String(error));
    }
   }
   resetHistory();
   setHistoricalPreview(null);setHistoricalAux(null);
   setData(current);setAuxHeads(auxResult?.heads||null);
   setAuxSourceDate(auxResult?.sourceDate||null);
   setAuxToday(auxLive?.heads||null);
   setSheet(currentSheet);setHist(refs);setBaseHeads(last.heads);
   setAuxiliarPast(auxiliarHistory);setAuxiliarError(auxWarning);
   setAuxTodayPast(todayHistory);setAuxTodayError(todayWarning);
    setVisualDays(recentDays);
   setDateText(isoToDisplay(d));setSelectedTurn(null);setFocused(null);
   
   setHojaFocused(null);setHojaTurn('Previa');
  }catch(error:any){
   Alert.alert('No se pudo cargar',error?.message||String(error));
  }finally{setBusy(false)}
 };
 const move=(n:1|-1)=>{const base=historicalPreview?.day.date||date;
  if(base)void cargar(shiftDrawDay(base,n))};
 // Congelar únicamente el siguiente turno sin ninguna cabeza publicada.
 useEffect(()=>{
  if(!sheet||!data||!hist.length||date!==today()||busy)return;
  const next=TURNOS.find(t=>!JURS.some(j=>/^\d{4}$/.test(data[t]?.[j]||'')));
  if(!next)return;
  let cancelled=false;
  const capture=async()=>{
   try{
    const view=buildMotorLalo(sheet,date,next,hist);
    const shadow=buildVt3Shadow(sheet,date,next,hist,view);
    const trial=buildVt3Trial(view,shadow);
    const connected=buildConnectedVt3(preSheetAtCut(sheet,next,TURNOS.indexOf(next)),date,next,[...visualDays,...hist]);
    if(cancelled)return;
    await saveFrozen(date,next,view,shadow,JURS.map(j=>data[next]?.[j]||''),trial,connected);
    if(!cancelled)setAutoVersion(v=>v+1);
   }catch{/* Sin suficientes datos, publicado o PRE existente: nunca inventar. */}
  };
  void capture();
  return ()=>{cancelled=true};
 },[sheet,data,hist,date,busy,visualDays]);
 // Con la app abierta, refrescar sin cambiar pestaña ni desplazar la hoja.
 useEffect(()=>{
  if(date!==today()||!baseHeads)return;
  let loading=false;
  const update=async()=>{
   if(loading)return;
   loading=true;
   try{
    const [fresh,live]=await Promise.all([
     descargarCabezas(date,true),fetchAuxiliaryHeads(date).catch(()=>null)
    ]);
    setData(fresh);
    // HOY incorpora nuevas cabezas; AYER permanece fija.
    if(live)setAuxToday(live.heads);
    setSheet(buildSheet(fresh,baseHeads));
   }catch{}finally{loading=false}
  };
  const interval=setInterval(()=>{void update()},120000);
  return ()=>clearInterval(interval);
 },[date,baseHeads]);
 const motor=useMemo(()=>sheet&&date?buildMotorLalo(sheet,date,target,hist):null,
  [sheet,date,target,hist]);
 // MV1 y AUX elaboran sus candidatos por separado. El lector AUX
 // solo usa Santiago-Neuquén, jamás los Tops ni las celdas de +11.
 const auxiliar=useMemo(()=>{
  if((screen!=='prediccion'&&screen!=='predictiva')||!date||!auxHeads||
   auxiliarPast.length!==hist.length||!auxiliarPast.length)return null;
  return buildMotorLaloAuxiliar(date,target,auxHeads,auxiliarPast);
 },[screen,date,target,auxHeads,auxiliarPast,hist]);
 const headEvents=useMemo(()=>JURS.map(jur=>({
  jur,head:data?.[target]?.[jur]||''
 })).filter(x=>/^\d{4}$/.test(x.head)),[data,target]);
 const hoja=useMemo(()=>sheet?buildDailyPanorama(sheet,data):null,[sheet,data]);
 // CABEZAS y navegación comparten exactamente las marcas +11 / AUX por corte.
 const headHighlights=useMemo(()=>buildHeadHighlights(data,sheet,auxHeads),
  [data,sheet,auxHeads]);
 const historicalHoja=useMemo(()=>historicalPreview?
  buildDailyPanorama(historicalPreview.day.sheet,historicalPreview.day.heads):null,
  [historicalPreview]);
 const showingSheet=historicalPreview?.day.sheet||sheet;
 const showingHoja=historicalHoja||hoja;
 const predictiva=useMemo(()=>motor?buildPredictivePanorama(motor,hist):null,[motor,hist]);
 const post=useMemo(()=>{
  if(!motor||!sheet||!sheet.heads[target]?.length)return null;
  return compareMotorLaloAfterDraw(motor,sheet.heads[target]);
 },[motor,sheet,target]);
 const fiveHeads=useMemo(()=>JURS.filter(j=>j!=='Montevideo')
  .map(j=>data?.[target]?.[j]||'').filter(h=>/^\d{4}$/.test(h)),
  [data,target]);
 const changeTurn=(turn:Turno)=>{setSelectedTurn(turn);setFocused(null);setInfoFrameId('inicio')};
 const showFamily=(id:string)=>{setPredictiveMode('lalo');navigateTo('predictiva');setFocused(id)};
 const showAuxFamily=(id:string)=>{
  setPredictiveMode('auxiliar');navigateTo('predictiva');setFocused(id);
 };
 const openHeadInHoja=(turn:Turno,jurisdiction:string,head:string)=>{
  const id=dailyHeadOwnerId(turn,jurisdiction,head);
  if(!headHighlights[id]?.kinds.length)return;
  navigateTo('hoja');setHojaTurn(turn);setHojaFocused(id);
 };
 const openInfoFrame=(frame:TurnHistoryFrame)=>{
  if(frame.kind==='proximo'){
   setHistoricalPreview(null);navigateTo('predictiva');setFocused(null);return;
  }
  const day=visualDays.find(item=>item.date===frame.date);
  if(!day){Alert.alert('Hoja no disponible','No se encontró la jornada en la memoria de INFO.');return}
  navigateTo('hoja');
  setHistoricalPreview({day,turn:target});setHojaTurn(target);setHojaFocused(null);
 };
 const alignHojaOnReturn=(y:number)=>{
  if(hojaFocused)scrollRef.current?.scrollTo({y:Math.max(0,(y-8)*zoomLevels.hoja),animated:true});
 };

 return <SafeAreaView style={[s.safe,{backgroundColor:c.canvas}]}><StatusBar style={c.statusBar} backgroundColor={c.canvas}/>
  <View style={s.nav}>{nav.map(x=><Pressable key={x.id} accessibilityRole="tab"
    accessibilityState={{selected:screen===x.id}}
    style={[s.tab,screen===x.id&&s.tabOn]}
    onPress={()=>{
     if(activeScreenRef.current===x.id)return;
     navigateTo(x.id);
     if(x.id==='hoja'){
      setFocused(null);setHojaFocused(null);setHojaTurn('Previa');
     }
    }}>
    <Text style={s.tabText} numberOfLines={1} adjustsFontSizeToFit>{x.label}</Text>
   </Pressable>)}</View>
  <View style={[s.zoomBar,{backgroundColor:c.canvas,borderBottomColor:c.border}]}>
   <Text style={[s.zoomHint,{color:c.subtext}]}>Pellizcá con dos dedos para ampliar</Text>
   <Pressable accessibilityRole="button"
    accessibilityLabel={'Zoom '+Math.round(zoomLevels[screen]*100)+' por ciento. Restablecer a 100'}
    onPress={()=>updateZoom(1)}
    style={[s.zoomButton,{backgroundColor:c.card,borderColor:c.border}]}>
    <Text style={[s.zoomButtonText,{color:c.accent}]}>
     {Math.round(zoomLevels[screen]*100)}% · Restablecer
    </Text>
   </Pressable>
  </View>
  <ZoomableTab key={screen} zoom={zoomLevels[screen]}
   onZoomChange={updateZoom} scrollRef={scrollRef}
   restoreY={restoreScroll.y} restoreToken={restoreScroll.token}
   onScrollY={y=>{scrollOffsets.current[screen]=safeScrollY(y)}}>
   <View style={s.header}>
    <View style={s.headerLeft}/>
    <View style={{flex:1}}>
     <Text style={[s.title,{color:c.text}]}>MODELO LALO</Text>
     <Text style={s.subtitle}>Cuaderno visual +11 y hoja auxiliar · VT2 / VT3 / VT4</Text>
    </View>
    <Pressable accessibilityRole="switch" accessibilityLabel="Modo oscuro"
     accessibilityState={{checked:mode==='dark'}} onPress={toggle}
     style={[s.modeButton,{backgroundColor:c.card,borderColor:c.border}]}>
     <Text style={[s.modeLabel,{color:c.text}]}>{mode==='dark'?'☾ Oscuro':'☀ Claro'}</Text>
    </Pressable>
   </View>
   <View style={[s.selector,{backgroundColor:c.surface,borderColor:c.border,borderWidth:1}]}>
    <Text style={[s.label,{color:c.text}]}>Fecha del tablero</Text>
    <DateField value={historicalPreview?isoToDisplay(historicalPreview.day.date):dateText} onChange={value=>{
     resetHistory();setHistoricalPreview(null);
     setDateText(value);setData(null);setAuxHeads(null);setAuxToday(null);
     setAuxSourceDate(null);setHistoricalAux(null);setSheet(null);setBaseHeads(null);setHist([]);
     setAuxiliarPast([]);setAuxiliarError(null);
     setAuxTodayPast([]);setAuxTodayError(null);
     setVisualDays([]);setFocused(null);
     setHojaFocused(null);setHojaTurn('Previa');
    }}/>
    <View style={s.shortcuts}>
     <Pressable style={[s.shortcut,{backgroundColor:c.surfaceAlt}]} onPress={()=>move(-1)}><Text style={[s.shortText,{color:c.accent}]}>← Día</Text></Pressable>
     <Pressable style={[s.shortcut,{backgroundColor:c.surfaceAlt}]} onPress={()=>{const shown=historicalPreview?.day.date||date;
      if(shown)void cargar(shiftDay(shown,-7))}}><Text style={[s.shortText,{color:c.accent}]}>−7 días</Text></Pressable>
     <Pressable style={[s.shortcut,{backgroundColor:c.surfaceAlt}]} onPress={()=>move(1)}><Text style={[s.shortText,{color:c.accent}]}>Día →</Text></Pressable>
    </View>
    <Pressable style={[s.reload,{backgroundColor:c.button}]} onPress={()=>{void cargar(historicalPreview?.day.date)}} disabled={busy}>
     {busy?<ActivityIndicator color="#fff"/>:<Text style={s.reloadText}>↻ ACTUALIZAR HOJA</Text>}
    </Pressable>
   </View>
   {screen==='hoja'?
    showingSheet&&showingHoja?<View onLayout={e=>alignHojaOnReturn(e.nativeEvent.layout.y)}>
     {historicalPreview?<View style={[s.previewBanner,{backgroundColor:c.accentFill,borderColor:c.accent}]}>
      <Text style={{color:c.text,fontWeight:'800',fontSize:12}}>
       Hoja histórica · {isoToDisplay(historicalPreview.day.date)} · {historicalPreview.turn}
      </Text>
      <Pressable onPress={()=>{goBack()}} accessibilityRole="button"
       style={[s.previewBack,{borderColor:c.accent}]}>
       <Text style={{color:c.accent,fontWeight:'900',fontSize:12}}>← Volver al panorama</Text>
      </Pressable>
     </View>:null}
     <PanoramaSheet mode="hoja" sheet={showingSheet} data={showingHoja}
      initialTurn={hojaTurn} initialTurnOnly={!!historicalPreview}
      focusedOwner={hojaFocused} onInfo={()=>navigateTo('info')}
      auxHeads={historicalPreview?null:auxHeads}
      auxSourceDate={historicalPreview?null:auxSourceDate}
      drawHeads={historicalPreview?null:data}
      date={historicalPreview?.day.date||date||''}/>
    </View>:
    <Text style={[s.empty,{color:c.subtext}]}>Elegí una fecha y actualizá la hoja para ver sus coincidencias.</Text>
   :screen==='predictiva'?<>
    <Text style={[s.heading,{color:c.text}]}>Turno que queremos anticipar</Text>
    <TurnStrip value={target} onChange={changeTurn}/>
    <View style={[s.predictorOptions,{borderColor:c.border}]}>
     {([{id:'lalo',label:'PREDICTIVA LALO'},{id:'auxiliar',label:'PREDICTIVA AUXILIAR'}] as const)
      .map(item=><Pressable key={item.id} accessibilityRole="button"
       accessibilityState={{selected:predictiveMode===item.id}}
       onPress={()=>{setPredictiveMode(item.id);setFocused(null)}}
       style={[s.predictorButton,{
        borderColor:predictiveMode===item.id?c.accent:c.border,
        backgroundColor:predictiveMode===item.id?c.accentFill:c.surfaceAlt}]}>
       <Text style={[s.predictorLabel,{color:c.text}]}>{item.label}</Text>
      </Pressable>)}
    </View>
    {predictiveMode==='lalo'?
     sheet&&predictiva?<PanoramaSheet mode="predictiva" sheet={sheet}
      data={predictiva} target={target} focusedOwner={focused}
      onInfo={()=>navigateTo('info')}/>:
      <Text style={[s.empty,{color:c.subtext}]}>Cargá la hoja para consultar Lalo +11.</Text>:
     auxHeads&&auxiliar?
      <AuxiliaryPredictiveSheet date={date||''} sourceDate={auxSourceDate||''}
       turn={target} heads={auxHeads}
       view={auxiliar} history={auxiliarPast} focusedOwner={focused}/>:
      <Text style={[s.empty,{color:c.subtext}]}>
       Cargá Santiago–Neuquén de la jornada anterior y sus antecedentes para mostrar la Predictiva Auxiliar.
       {auxiliarError?' '+auxiliarError:''}
      </Text>}
   </>:screen==='prediccion'?<>
    <Text style={[s.heading,{color:c.text}]}>Turno que queremos anticipar</Text>
    <TurnStrip value={target} onChange={changeTurn}/>
    <View style={[s.predictorOptions,{borderColor:c.border}]}>
     {([{id:'lalo',label:'MODELO LALO'},{id:'auxiliar',label:'LALO AUXILIAR'}] as const)
      .map(item=><Pressable key={item.id} accessibilityRole="button"
       accessibilityState={{selected:predictionMode===item.id}}
       onPress={()=>{setPredictionMode(item.id);setExperimental(false)}}
       style={[s.predictorButton,{
        borderColor:predictionMode===item.id?c.accent:c.border,
        backgroundColor:predictionMode===item.id?c.accentFill:c.surfaceAlt}]}>
       <Text style={[s.predictorLabel,{color:c.text}]}>{item.label}</Text>
      </Pressable>)}
    </View>
    {!experimental?<>
     {predictionMode==='lalo'?
      <PredictionSummary model="lalo" date={dateText} turn={target} view={motor}
       auxiliar={auxiliar} post={post} heads={sheet?.heads[target]||[]} onFocus={showFamily}/>:
      auxiliar?<PredictionSummary model="auxiliar" date={dateText} turn={target} view={motor}
       auxiliar={auxiliar} heads={sheet?.heads[target]||[]}
       onFocus={showFamily} onAuxFocus={showAuxFamily}/>:
      <View style={[s.previewBanner,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
       <Text style={{color:c.text,fontWeight:'800'}}>Modelo Lalo Auxiliar no disponible para este corte.</Text>
       <Text style={{color:c.subtext,marginTop:5}}>
        {auxiliarError||'Cargá la fecha para obtener la hoja auxiliar y los antecedentes D−1 y D−7.'}
       </Text>
       <Text style={{color:c.subtext,marginTop:5}}>
        Los Tops originales de Lalo siguen disponibles sin modificaciones.
       </Text>
      </View>}
     {motor&&auxiliar?
      <ParallelPredictionCompare lalo={motor} auxiliar={auxiliar} heads={headEvents}/>:
      <View style={[s.previewBanner,{backgroundColor:c.surfaceAlt,borderColor:c.border,marginTop:12}]}>
       <Text style={{color:c.text,fontWeight:'800'}}>TOP GENERAL · Familias coincidentes</Text>
       <Text style={{color:c.subtext,marginTop:5}}>
        {auxiliarError||'Cargá ambas fuentes para comparar los Tops independientes.'}
       </Text>
      </View>}
     {predictionMode==='lalo'?<Pressable accessibilityRole="button" onPress={()=>setExperimental(true)}
      style={[s.reload,{backgroundColor:c.surface,borderWidth:1,borderColor:c.accent,marginTop:12}]}>
      <Text style={[s.reloadText,{color:c.accent}]}>🧪 Experimental · Comparaciones VT3 →</Text>
     </Pressable>:null}
    </>:<>
     <Pressable accessibilityRole="button" onPress={()=>setExperimental(false)}
      style={[s.reload,{backgroundColor:c.surfaceAlt,marginTop:12}]}>
      <Text style={[s.reloadText,{color:c.accent}]}>← Volver a Predicción</Text>
     </Pressable>
     <Vt3Parallel date={date||''} turn={target} sheet={sheet} view={motor}
      historical={hist} heads={fiveHeads} autoVersion={autoVersion}
       visualDays={visualDays}/>
     <Vt3Explainer sheet={sheet} view={motor} turn={target}
      heads={sheet?.heads[target]||[]} onFocus={showFamily}/>
    </>}
   </>:screen==='papa'?<>
    <Text style={[s.heading,{color:c.text}]}>Turno del pronóstico de Lalo</Text>
    <TurnStrip value={target} onChange={changeTurn}/>
    <PapaPronostico date={date||''} turn={target} sheet={sheet} heads={data}/>
   </>:screen==='cabezas'?
    <HeadsTable data={data} highlights={headHighlights} onOpenHead={openHeadInHoja}/>:
    <InfoDashboard date={date||''} turn={target} data={data} sheet={sheet}
     historical={hist} visualDays={visualDays} view={motor} onNavigate={navigateTo}
      onTurnChange={changeTurn} onOpenFrame={openInfoFrame}
     selectedFrameId={infoFrameId} onSelectFrame={setInfoFrameId}
     movementMode={infoMode} onMovementMode={setInfoMode}
     expandedGuide={infoGuide} onExpandedGuide={setInfoGuide}/>}
  </ZoomableTab>
 </SafeAreaView>;
}
export default function App(){return <GestureHandlerRootView style={{flex:1}}><LaloThemeProvider><LaloApp/></LaloThemeProvider></GestureHandlerRootView>}
const insets=Platform.OS==='android'?(RNStatusBar.currentHeight||24)+7:7;
const s=StyleSheet.create({
 header:{flexDirection:'row',alignItems:'center',gap:6,marginBottom:11},
 predictorOptions:{flexDirection:'row',gap:8,marginTop:10,padding:6,borderWidth:1,borderRadius:11},
 predictorButton:{flex:1,borderWidth:1,borderRadius:9,paddingVertical:12,alignItems:'center'},
 predictorLabel:{fontSize:12,fontWeight:'900'},
 headerLeft:{width:66},
 modeButton:{minWidth:66,borderWidth:1,borderRadius:10,paddingHorizontal:5,paddingVertical:8,alignItems:'center'},
 modeLabel:{fontSize:11,fontWeight:'900'},

 safe:{flex:1,backgroundColor:'#0c0812',paddingTop:insets},
 nav:{flexDirection:'row',backgroundColor:'#140d20',gap:3,paddingHorizontal:5,paddingVertical:9},
 tab:{flex:1,alignItems:'center',justifyContent:'center',borderRadius:8,paddingVertical:11},
 tabOn:{backgroundColor:'#0e4b89'},
 tabText:{fontSize:10,color:'#fff',fontWeight:'900'},
 content:{paddingHorizontal:12,paddingTop:7,paddingBottom:70},
 zoomBar:{minHeight:39,flexDirection:'row',alignItems:'center',justifyContent:'space-between',
  gap:8,borderBottomWidth:1,paddingHorizontal:11,paddingVertical:4},
 zoomHint:{fontSize:10,flexShrink:1},
 zoomButton:{paddingVertical:6,paddingHorizontal:10,borderWidth:1,borderRadius:8},
 zoomButtonText:{fontSize:10,fontWeight:'900'},
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
 empty:{color:'#d0c2d8',padding:16,fontSize:12,lineHeight:19},
 previewBanner:{borderWidth:1,borderRadius:10,padding:10,marginBottom:9,gap:7},
 previewBack:{borderWidth:1,borderRadius:7,padding:8,alignSelf:'flex-start'}
});
