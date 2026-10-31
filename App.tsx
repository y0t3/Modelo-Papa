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
import {buildInfoWeekPorJur} from './src/infoWeek';
import {nocturnaAnteriorPorJur} from './src/nocturnaAnteriorPorJur';
import {buildVt3Shadow} from './src/vt3Shadow';
import {buildVt3Trial} from './src/vt3Trial';
import {buildConnectedVt3} from './src/connectedVt3';
import {preSheetAtCut} from './src/infoCandidatos';
import {saveFrozen} from './src/vt3Snapshot';
import {buildDailyPanorama,buildPredictivePanorama,dailyHeadOwnerId} from './src/panoramaModel';
import {buildMotorLalo,compareMotorLaloAfterDraw} from './src/motorLalo';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from './src/motorLaloAuxiliar';
import type {AuxiliarHistory} from './src/motorLaloAuxiliar';
import type {TrackingAuxInput} from './src/figureTracking';
import type {LaloHistorical} from './src/motorLalo';
import type {InfoVisualDay,TurnHistoryFrame} from './src/infoTurnHistory';
import type {AuxGalleryDay} from './src/infoAuxGallery';
import PanoramaSheet from './src/PanoramaSheet';
import AuxiliaryPredictiveSheet from './src/ui/AuxiliaryPredictiveSheet';
import PredictionSummary from './src/ui/PredictionSummary';
import CombinedVt3Panel from './src/ui/CombinedVt3Panel';
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
import HomeDashboard from './src/ui/HomeDashboard';
import {summarizeDay} from './src/homeDaySummary';
import type {MovementMode} from './src/infoCandidatos';
import TurnStrip from './src/ui/TurnStrip';
import {LaloThemeProvider,useLaloTheme} from './src/ui/LaloTheme';
import ZoomableTab from './src/ui/ZoomableTab';
import BrandHero from './src/ui/BrandHero';
import LaloWallpaper from './src/ui/LaloWallpaper';
import {ZOOM_STORAGE_KEY,defaultZoomLevels,decodeTabZoom,applyTabZoom} from './src/tabZoom';
import {pushNavigation,backNavigation,safeScrollY} from './src/tabNavigation';
import type {NavigationEntry} from './src/tabNavigation';

type Screen='inicio'|'hoja'|'predictiva'|'prediccion'|'papa'|'cabezas'|'info';
const screenTitles:Record<Screen,string>={
 inicio:'Inicio',hoja:'La hoja',predictiva:'Recorridos',prediccion:'Predicción',
 papa:'Lalo',cabezas:'Cabezas',info:'Info'
};
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
function LaloApp(){
 const {mode,colors:c,toggle}=useLaloTheme();
 const [screen,setScreen]=useState<Screen>('inicio');
 const activeScreenRef=useRef<Screen>('inicio');
 const historyRef=useRef<NavigationEntry[]>([]);
 const scrollOffsets=useRef<Record<Screen,number>>({
  inicio:0,hoja:0,predictiva:0,prediccion:0,papa:0,cabezas:0,info:0
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
 const [figureFocus,setFigureFocus]=useState<string|null>(null);
 const [predictionMode,setPredictionMode]=useState<'lalo'|'auxiliar'|'combinado'>('lalo');
 const [predictiveMode,setPredictiveMode]=useState<'lalo'|'auxiliar'>('lalo');

 const [visualDays,setVisualDays]=useState<InfoVisualDay[]>([]);
 const [infoAuxDays,setInfoAuxDays]=useState<AuxGalleryDay[]>([]);
 const auxInfoRequest=useRef(0);
 const [historicalPreview,setHistoricalPreview]=useState<{day:InfoVisualDay;turn:Turno}|null>(null);
 const [busy,setBusy]=useState(false);
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
  if(next!=='prediccion')setComparisonOpen(false);
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
  const request=++auxInfoRequest.current;
  setInfoAuxDays([]);
  try{
   setBusy(true);
   // Una carga = una versión de cada fecha: evitar llamadas repetidas al
   // proveedor mientras se arma la hoja, INFO y el historial Lalo.
   // La recarga posterior inicia una caché nueva, nunca congela datos.
   const requestCache=new Map<string,Promise<CabezasDia>>();
   const readDay=(day:string):Promise<CabezasDia>=>{
    let pending=requestCache.get(day);
    if(!pending){
     pending=descargarCabezas(day,true);
     requestCache.set(day,pending);
    }
    return pending;
   };
   const week=shiftDay(d,-7);
   // Cuatro jornadas reales: tres minihojas y una anterior como base de la tercera.
   const weekDates=Array.from({length:7},(_,i)=>shiftDay(week,i));
   const [current,previous,weekData,beforeWeek,nocturnaBase,weekBase,auxResult,auxLive]=await Promise.all([
    readDay(d),
    loadPreviousDraws(d,4,readDay),
    Promise.all(weekDates.map(day=>readDay(day))),
    loadPreviousDraws(week,1,readDay),
    nocturnaAnteriorPorJur(d,readDay),
    nocturnaAnteriorPorJur(week,readDay),
    fetchAuxiliaryBaseForDate(d).catch(()=>null),
    fetchAuxiliaryHeads(d).catch(()=>null)
   ]);
   const weekly=weekData[0],weekPrevious=beforeWeek[0].heads;
   const last=previous[3],beforeLast=previous[2];
   const recentDays=buildInfoWeekPorJur(week,d,
    weekDates.map((day,i)=>({date:day,heads:weekData[i]})),weekBase.heads);
   const currentSheet=buildSheet(current,nocturnaBase.heads);
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
   setSheet(currentSheet);setHist(refs);setBaseHeads(nocturnaBase.heads);
   setAuxiliarPast(auxiliarHistory);setAuxiliarError(auxWarning);
   setAuxTodayPast(todayHistory);setAuxTodayError(todayWarning);
    setVisualDays(recentDays);
   // INFO: cargar la semana AUX en paralelo sin bloquear la hoja diaria.
   // El identificador de solicitud evita reutilizar minihojas de otra fecha.
   void Promise.all(recentDays.map(async day=>{
    const [yesterday,todayAux]=await Promise.all([
     fetchAuxiliaryBaseForDate(day.date).catch(()=>null),
     fetchAuxiliaryHeads(day.date).catch(()=>null)
    ]);
    return {date:day.date,heads:day.heads,
     yesterday:yesterday?.heads||null,today:todayAux?.heads||null,
     sourceDate:yesterday?.sourceDate||null};
   })).then(days=>{
    if(auxInfoRequest.current===request)setInfoAuxDays(days);
   }).catch(()=>{if(auxInfoRequest.current===request)setInfoAuxDays([])});
   setDateText(isoToDisplay(d));setSelectedTurn(null);setFocused(null);setFigureFocus(null);
   
   setHojaFocused(null);setHojaTurn('Previa');
  }catch(error:any){
   Alert.alert('No se pudo cargar',error?.message||String(error));
  }finally{setBusy(false)}
 };
 useEffect(()=>{void cargar(today())},[]);
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
 // Cada modo conserva su ranking y memoria propios. Nunca mezclamos
 // los Tops ni la geometría con Modelo Lalo MV1.
 const activeAuxHeads=auxMode==='intrajornada'?auxToday:auxHeads;
 const activeAuxHistory=auxMode==='intrajornada'?auxTodayPast:auxiliarPast;
 const activeAuxError=auxMode==='intrajornada'?auxTodayError:auxiliarError;
 const activeAuxDate=auxMode==='intrajornada'?date:auxSourceDate;
 const auxiliar=useMemo(()=>{
  if((screen!=='inicio'&&screen!=='prediccion'&&screen!=='predictiva'&&screen!=='info')||!date||!activeAuxHeads||
   activeAuxHistory.length!==hist.length||!activeAuxHistory.length)return null;
  const input=auxAtCut(activeAuxHeads,target,auxMode);
  return buildMotorLaloAuxiliar(date,target,input,activeAuxHistory);
 },[screen,date,target,activeAuxHeads,activeAuxHistory,hist,auxMode]);
 // Presencias independientes del seguimiento. Cada uno conserva el
 // origen PRE y sus propias raíces; jamás se mezclan con MV1.
 const trackingAyerView=useMemo(()=>(screen==='info'||screen==='inicio')&&date&&auxHeads&&
  auxiliarPast.length===hist.length&&auxiliarPast.length?
  buildMotorLaloAuxiliar(date,target,auxAtCut(auxHeads,target,'anterior'),auxiliarPast):null,
  [screen,date,target,auxHeads,auxiliarPast,hist]);
 const trackingHoyView=useMemo(()=>(screen==='info'||screen==='inicio')&&date&&auxToday&&
  auxTodayPast.length===hist.length&&auxTodayPast.length?
  buildMotorLaloAuxiliar(date,target,auxAtCut(auxToday,target,'intrajornada'),auxTodayPast):null,
  [screen,date,target,auxToday,auxTodayPast,hist]);
 const trackingAyer:TrackingAuxInput=useMemo(()=>({
  heads:auxHeads,view:trackingAyerView,mode:'anterior'
 }),[auxHeads,trackingAyerView]);
 const trackingHoy:TrackingAuxInput=useMemo(()=>({
  heads:auxToday,view:trackingHoyView,mode:'intrajornada'
 }),[auxToday,trackingHoyView]);
 const headEvents=useMemo(()=>JURS.map(jur=>({
  jur,head:data?.[target]?.[jur]||''
 })).filter(x=>/^\d{4}$/.test(x.head)),[data,target]);
 const hoja=useMemo(()=>sheet?buildDailyPanorama(sheet,data):null,[sheet,data]);
 // Las marcas de CABEZAS se comprueban en ambos modos, sin suponer
 // que un candidato salió. Cada cabeza conserva su terminación exacta.
 const marksAnterior=useMemo(()=>buildHeadHighlights(data,sheet,auxHeads,'anterior'),
  [data,sheet,auxHeads]);
 const marksHoy=useMemo(()=>buildHeadHighlights(data,sheet,auxToday,'intrajornada'),
  [data,sheet,auxToday]);
 const headHighlights=useMemo(()=>{
  const merged:Record<string,HeadHighlight>={};
  const labels:Record<string,'HOY'|'AYER'|'AMBAS'>={};
  for(const id of new Set([...Object.keys(marksAnterior),...Object.keys(marksHoy)])){
   const previous=marksAnterior[id],today=marksHoy[id];
   const a=!!previous?.auxKinds.length,b=!!today?.auxKinds.length;
   if(a||b)labels[id]=a&&b?'AMBAS':a?'AYER':'HOY';
   merged[id]={
    kinds:(['vt2','vt3','vt4'] as const).filter(k=>
     previous?.kinds.includes(k)||today?.kinds.includes(k)),
    plusKinds:previous?.plusKinds||today?.plusKinds||[],
    auxKinds:(['vt2','vt3','vt4'] as const).filter(k=>
     previous?.auxKinds.includes(k)||today?.auxKinds.includes(k))
   };
  }
  return {merged,labels};
 },[marksAnterior,marksHoy]);
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
 const overview=useMemo(()=>summarizeDay(date||'',data,sheet,hist,today()),
  [date,data,sheet,hist]);
 const fiveHeads=useMemo(()=>JURS.filter(j=>j!=='Montevideo')
  .map(j=>data?.[target]?.[j]||'').filter(h=>/^\d{4}$/.test(h)),
  [data,target]);
 const changeTurn=(turn:Turno)=>{setSelectedTurn(turn);setFocused(null);setInfoFrameId('inicio')};
 const changeAuxMode=(next:AuxMode)=>{setAuxMode(next);setFocused(null)};
 const showFamily=(id:string)=>{setPredictiveMode('lalo');navigateTo('predictiva');setFocused(id)};
 const trackFigure=(family:string)=>{
  setFigureFocus('vt3|'+family);navigateTo('info');
 };
 const openFigureAux=(family:string,mode:'anterior'|'intrajornada')=>{
  setAuxMode(mode);setPredictiveMode('auxiliar');
  navigateTo('predictiva');setFocused('vt3|'+family);
 };
 const showAuxFamily=(id:string)=>{
  setPredictiveMode('auxiliar');navigateTo('predictiva');setFocused(id);
 };
 const openHeadInHoja=(turn:Turno,jurisdiction:string,head:string)=>{
  const id=dailyHeadOwnerId(turn,jurisdiction,head);
  if(!headHighlights.merged[id]?.kinds.length)return;
  const selected=auxMode==='intrajornada'?marksHoy[id]:marksAnterior[id];
  // Si hay marca únicamente en el otro modo, saltar a la hoja correcta.
  if(!selected?.kinds.length){
   const other=auxMode==='intrajornada'?marksAnterior[id]:marksHoy[id];
   if(other?.auxKinds.length)setAuxMode(auxMode==='intrajornada'?'anterior':'intrajornada');
  }
  navigateTo('hoja');setHojaTurn(turn);setHojaFocused(id);
 };
 const openInfoFrame=(frame:TurnHistoryFrame)=>{
  if(frame.kind==='proximo'){
   setHistoricalPreview(null);navigateTo('predictiva');setFocused(null);return;
  }
  const day=visualDays.find(item=>item.date===frame.date);
  if(!day){Alert.alert('Hoja no disponible','No se encontró la jornada en la memoria de INFO.');return}
  navigateTo('hoja');
  setHistoricalPreview({day,turn:target});setHistoricalAux(null);
  setHojaTurn(target);setHojaFocused(null);
  // Recuperar el tablero que realmente correspondía a la fecha de INFO.
  void Promise.all([
   fetchAuxiliaryBaseForDate(day.date).catch(()=>null),
   fetchAuxiliaryHeads(day.date).catch(()=>null)
  ]).then(([previous,live])=>setHistoricalAux({
   date:day.date,previous:previous?.heads||null,
   sourceDate:previous?.sourceDate||null,today:live?.heads||null
  })).catch(()=>{});
 };
 const alignHojaOnReturn=(y:number)=>{
  if(hojaFocused)scrollRef.current?.scrollTo({y:Math.max(0,(y-8)*zoomLevels.hoja),animated:true});
 };

 return <SafeAreaView style={[s.safe,{backgroundColor:c.canvas}]}><StatusBar style={c.statusBar} backgroundColor={c.canvas}/>
  <LaloWallpaper/>
  <BrandHero mode={mode} onToggle={toggle}/>
  {screen!=='inicio'?<View style={[s.homeBar,{backgroundColor:c.canvas,borderBottomColor:c.border}]}>
    <Pressable accessibilityRole="button" accessibilityLabel="Volver a Inicio"
     onPress={()=>navigateTo('inicio')}
     style={[s.homeButton,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
     <Text style={{color:c.accent,fontWeight:'900',fontSize:13}}>‹ Inicio</Text>
    </Pressable>
    <Text style={{color:c.text,fontSize:13,fontWeight:'900',flex:1}}>
     {screenTitles[screen]}
    </Text>
   </View>:null}
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
   <View style={[s.compactDateBar,{backgroundColor:c.surface,borderColor:'#C69A43'}]}>
    <Pressable accessibilityRole="button" accessibilityLabel="Ir al día anterior"
     disabled={busy||!date} onPress={()=>move(-1)}
     style={[s.dayArrow,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
     <Text style={[s.dayArrowText,{color:busy?c.muted:c.accent}]}>‹</Text>
    </Pressable>
    <DateField compact value={historicalPreview?isoToDisplay(historicalPreview.day.date):dateText} onChange={value=>{
     resetHistory();setHistoricalPreview(null);
     setDateText(value);setData(null);setAuxHeads(null);setAuxToday(null);
     setAuxSourceDate(null);setHistoricalAux(null);setSheet(null);setBaseHeads(null);setHist([]);
     setAuxiliarPast([]);setAuxiliarError(null);
     setAuxTodayPast([]);setAuxTodayError(null);
     ++auxInfoRequest.current;
     setInfoAuxDays([]);setVisualDays([]);setFocused(null);
     setHojaFocused(null);setHojaTurn('Previa');
    }}/>
    <Pressable accessibilityRole="button" accessibilityLabel="Ir al día siguiente"
     disabled={busy||!date} onPress={()=>move(1)}
     style={[s.dayArrow,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
     <Text style={[s.dayArrowText,{color:busy?c.muted:c.accent}]}>›</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Actualizar resultados de la fecha"
     disabled={busy||!date} onPress={()=>{void cargar(historicalPreview?.day.date)}}
     style={[s.reloadMini,{backgroundColor:'#195DA6'}]}>
     {busy?<ActivityIndicator color="#fff" size="small"/>:
      <Text style={s.reloadMiniText}>↻</Text>}
    </Pressable>
   </View>
   {screen==='inicio'?<HomeDashboard date={date||''} turn={target} data={data}
     sheet={sheet} view={motor} auxAyer={trackingAyerView}
     auxHoy={trackingHoyView} overview={overview} busy={busy}
     onNavigate={navigateTo} onTurnChange={changeTurn}
     onSelectPrediction={(mode,forcedAux)=>{
      if(forcedAux)setAuxMode(forcedAux);
      setPredictionMode(mode);navigateTo('prediccion')
     }}
     onFocus={family=>showFamily('vt2|'+family)}/>:
    screen==='hoja'?
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
      auxHeads={historicalPreview?
       (historicalAux?.date===historicalPreview.day.date?
        (auxMode==='intrajornada'?historicalAux.today:historicalAux.previous):null):
       activeAuxHeads}
      auxSourceDate={historicalPreview?
       (auxMode==='intrajornada'?historicalPreview.day.date:historicalAux?.sourceDate||null):
       activeAuxDate}
      auxMode={auxMode} onAuxModeChange={changeAuxMode}
      drawHeads={historicalPreview?historicalPreview.day.heads:data}
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
    {predictiveMode==='auxiliar'?<AuxModeSwitch value={auxMode} onChange={changeAuxMode}/>:null}
    {predictiveMode==='lalo'?
     sheet&&predictiva?<PanoramaSheet mode="predictiva" sheet={sheet} date={date||''}
      data={predictiva} target={target} focusedOwner={focused} visualDays={visualDays}
      onInfo={()=>navigateTo('info')}/>:
      <Text style={[s.empty,{color:c.subtext}]}>Cargá la hoja para consultar Lalo +11.</Text>:
     activeAuxHeads&&auxiliar?
      <AuxiliaryPredictiveSheet key={auxMode+'-'+target+'-'+date}
       date={date||''} sourceDate={activeAuxDate||''}
       auxMode={auxMode} turn={target} heads={activeAuxHeads}
       view={auxiliar} history={activeAuxHistory} focusedOwner={focused}/>:
      <Text style={[s.empty,{color:c.subtext}]}>
       {auxMode==='intrajornada'?
        'HOY incorpora las cifras publicadas durante el día. Antes de Previa no tiene celdas ni candidatos.':
        'AYER requiere la hoja anterior y las raíces históricas D−1/D−7.'}
       {activeAuxError?' '+activeAuxError:''}
      </Text>}
   </>:screen==='prediccion'?<>
    <Text style={[s.heading,{color:c.text}]}>Turno que queremos anticipar</Text>
    <TurnStrip value={target} onChange={changeTurn}/>
    <View style={[s.predictorOptions,{borderColor:c.border}]}>
     {([{id:'lalo',label:'LALO'},{id:'auxiliar',label:'AUXILIAR'},{id:'combinado',label:'COMBINADO'}] as const)
      .map(item=><Pressable key={item.id} accessibilityRole="button"
       accessibilityState={{selected:predictionMode===item.id}}
       onPress={()=>setPredictionMode(item.id)}
       style={[s.predictorButton,{
        borderColor:predictionMode===item.id?c.accent:c.border,
        backgroundColor:predictionMode===item.id?c.accentFill:c.surfaceAlt}]}>
       <Text style={[s.predictorLabel,{color:c.text}]}>{item.label}</Text>
      </Pressable>)}
    </View>
    {predictionMode==='auxiliar'?<AuxModeSwitch value={auxMode} onChange={changeAuxMode}/>:null}
     {predictionMode==='lalo'?
      <PredictionSummary model="lalo" date={dateText} turn={target} view={motor}
       heads={sheet?.heads[target]||[]} sheet={sheet}/>:
      predictionMode==='auxiliar'?
       auxiliar?<PredictionSummary key={auxMode+'-'+target} model="auxiliar"
        date={dateText} turn={target} view={motor} auxiliar={auxiliar}
        auxHeads={activeAuxHeads?auxAtCut(activeAuxHeads,target,auxMode):null}
        heads={sheet?.heads[target]||[]}/>:
       <View style={[s.previewBanner,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
        <Text style={{color:c.text,fontWeight:'800'}}>No está lista la hoja auxiliar.</Text>
        <Text style={{color:c.subtext,marginTop:5}}>
         {activeAuxError||'Primero actualizá las cifras de Santiago y Neuquén.'}
        </Text>
       </View>:
       <CombinedVt3Panel date={date||''} turn={target} sheet={sheet}
        historical={hist} heads={fiveHeads}/>}
   </>:screen==='papa'?<>
    <Text style={[s.heading,{color:c.text}]}>Turno del pronóstico de Lalo</Text>
    <TurnStrip value={target} onChange={changeTurn}/>
    <PapaPronostico date={date||''} turn={target} sheet={sheet} heads={data}/>
   </>:screen==='cabezas'?<>
    <AuxModeSwitch value={auxMode} onChange={changeAuxMode}/>
    <HeadsTable data={data} highlights={headHighlights.merged}
     sourceLabels={headHighlights.labels} onOpenHead={openHeadInHoja}/>
   </>:
    <InfoDashboard date={date||''} turn={target} data={data} overview={overview} sheet={sheet}
     historical={hist} visualDays={visualDays} view={motor} onNavigate={navigateTo}
     auxDays={infoAuxDays}
     currentAux={data&&date?{
      date,heads:data,yesterday:auxHeads,today:auxToday,sourceDate:auxSourceDate
     }:null}
     auxMode={auxMode} onAuxMode={changeAuxMode}
     auxPrediction={auxiliar} auxHistory={activeAuxHistory}
     trackingAyer={trackingAyer} trackingHoy={trackingHoy}
     figureFocus={figureFocus} onFigureLalo={family=>showFamily('vt3|'+family)}
     onFigureAux={openFigureAux}
     onOpenAuxDay={dayDate=>{
      const day=visualDays.find(x=>x.date===dayDate);
      if(day)openInfoFrame({
       id:'dia-'+day.date,date:day.date,dayLabel:day.date,
       title:'Hoja auxiliar',kind:'historico',sheet:day.sheet,
       routes:[],markedHeads:0,routeCount:0,markedHeadLabels:[],familyCount:0
      });
     }}
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
 header:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:9,
  borderWidth:1,borderRadius:15,paddingHorizontal:11,paddingVertical:9},
 predictorOptions:{flexDirection:'row',gap:5,marginTop:10,padding:5,borderWidth:1,borderRadius:13,backgroundColor:'rgba(4,20,49,.63)'},
 predictorButton:{flex:1,borderWidth:1,borderRadius:10,paddingVertical:12,alignItems:'center',minWidth:0},
 predictorLabel:{fontSize:10,fontWeight:'900'},
 brandMark:{width:48,height:48,borderWidth:2,borderColor:'#E2B34B',borderRadius:15,
  backgroundColor:'#071F47',overflow:'hidden',position:'relative'},
 brandBall:{position:'absolute',borderRadius:20,alignItems:'center',justifyContent:'center',
  borderWidth:2,borderColor:'#F5DB8D'},
 brandBallBack:{width:25,height:25,left:12,top:2,backgroundColor:'#DEA539'},
 brandBallLeft:{width:27,height:27,left:3,top:18,backgroundColor:'#DAA443'},
 brandBallRight:{width:27,height:27,right:2,top:18,backgroundColor:'#F4E3B0'},
 brandBallText:{fontWeight:'900',fontSize:12,color:'#0A2C64'},
 brandText:{flex:1,minWidth:0},
 modeButton:{width:36,height:36,borderWidth:1,borderRadius:10,alignItems:'center',
  justifyContent:'center'},
 modeLabel:{fontSize:17,fontWeight:'900'},

 safe:{flex:1,backgroundColor:'#061631',paddingTop:insets},
 homeBar:{minHeight:37,flexDirection:'row',alignItems:'center',gap:12,
  borderBottomWidth:1,paddingHorizontal:12,paddingVertical:5},
 homeButton:{borderWidth:1,borderRadius:9,paddingHorizontal:12,paddingVertical:6},
 content:{paddingHorizontal:10,paddingTop:8,paddingBottom:70},
 zoomBar:{minHeight:31,flexDirection:'row',alignItems:'center',justifyContent:'space-between',
  gap:8,borderBottomWidth:1,paddingHorizontal:11,paddingVertical:4},
 zoomHint:{fontSize:10,flexShrink:1},
 zoomButton:{paddingVertical:6,paddingHorizontal:10,borderWidth:1,borderRadius:8},
 zoomButtonText:{fontSize:10,fontWeight:'900'},
 title:{color:'#fff',fontWeight:'900',fontSize:23,textAlign:'left',letterSpacing:-0.6},
 subtitle:{fontSize:10,textAlign:'left',marginTop:2,fontWeight:'700'},
 compactDateBar:{borderWidth:1,borderRadius:12,marginTop:3,
  flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:6,paddingVertical:6},
 dayArrow:{width:32,height:38,borderWidth:1,borderRadius:9,
  alignItems:'center',justifyContent:'center'},
 dayArrowText:{fontWeight:'900',fontSize:28,lineHeight:31},
 reloadMini:{width:37,height:38,borderRadius:9,alignItems:'center',justifyContent:'center'},
 reloadMiniText:{color:'#fff',fontSize:25,fontWeight:'900'},
 heading:{fontSize:12,color:'#F2C660',fontWeight:'800',marginTop:13,marginBottom:7},
 empty:{color:'#C7D7ED',padding:16,fontSize:12,lineHeight:19},
 previewBanner:{borderWidth:1,borderRadius:10,padding:10,marginBottom:9,gap:7},
 previewBack:{borderWidth:1,borderRadius:7,padding:8,alignSelf:'flex-start'}
});
