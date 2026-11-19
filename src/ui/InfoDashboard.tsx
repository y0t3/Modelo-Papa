import React,{useEffect,useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloHistorical,LaloView} from '../motorLalo';
import type {MovementMode} from '../infoCandidatos';
import type {InfoVisualDay,TurnHistoryFrame} from '../infoTurnHistory';
import {buildTurnHistory,readableWeekday} from '../infoTurnHistory';
import InfoTurnGallery from './InfoTurnGallery';
import InfoAuxGallery from './InfoAuxGallery';
import type {AuxGalleryDay} from '../infoAuxGallery';
import type {AuxMode} from '../auxTemporalModes';
import type {AuxiliarHistory,AuxiliarView} from '../motorLaloAuxiliar';
import FigureTrackingPanel from './FigureTrackingPanel';
import type {TrackingAuxInput} from '../figureTracking';
import {useLaloTheme} from './LaloTheme';
import type {DayOverview} from '../homeDaySummary';
import DayMatchGrid from './DayMatchGrid';
import TurnTrendPanel from './TurnTrendPanel';
import Vt3DiagnosticPanel from './Vt3DiagnosticPanel';
import type {TrendEngine} from '../trendHistoryVt2';
import type {TrendPeriod,TrendSnapshot} from '../trendVt2Journal';

type Destination='hoja'|'predictiva'|'prediccion'|'papa'|'cabezas';
type Props={date:string;turn:Turno;data:CabezasDia|null;overview:DayOverview;
 sheet:DailySheet|null;historical:LaloHistorical[];visualDays:InfoVisualDay[];
 view:LaloView|null;onNavigate:(screen:Destination)=>void;
 auxDays:AuxGalleryDay[];currentAux:AuxGalleryDay|null;
 auxMode:AuxMode;onAuxMode:(mode:AuxMode)=>void;
 auxPrediction:AuxiliarView|null;auxHistory:AuxiliarHistory[];
 trackingAyer:TrackingAuxInput;trackingHoy:TrackingAuxInput;
 figureFocus:string|null;onFigureLalo:(family:string)=>void;
 onFigureAux:(family:string,mode:AuxMode)=>void;
 onOpenAuxDay:(date:string)=>void;
 onTurnChange:(turn:Turno)=>void;onOpenFrame:(frame:TurnHistoryFrame)=>void;
 selectedFrameId:string;onSelectFrame:(id:string)=>void;
 movementMode:MovementMode;onMovementMode:(mode:MovementMode)=>void;
 expandedGuide:string|null;onExpandedGuide:(id:string|null)=>void;
 initialSection?:StudySection|null;onSectionChange?:(value:StudySection|null)=>void;
 trendEngine:TrendEngine;
 onTrendEngineChange:(engine:TrendEngine)=>void;
 trendSnapshot:TrendSnapshot;onTrendPeriodChange:(period:TrendPeriod)=>void};

export type StudySection='resumen'|'tendencias'|'vt3'|'historial'|'auxiliar'|'seguir'|'ayuda'|'recorridos';
type Section=StudySection;
const OPTIONS:{id:Section;icon:string;title:string;subtitle:string;accent:string}[]=[
 {id:'tendencias',icon:'▥',title:'Gráficos VT2',subtitle:'Dónde hubo más coincidencias',accent:'#4ABDEB'},
 {id:'vt3',icon:'⌗',title:'¿Qué pasó con VT3?',subtitle:'Cómo se formaron las cabezas',accent:'#60E1DB'},
 {id:'historial',icon:'▦',title:'Día por día',subtitle:'Las hojas anteriores',accent:'#A68AFF'},
 {id:'auxiliar',icon:'▤',title:'Hojas de Santiago y Neuquén',subtitle:'Ver figuras de otros días',accent:'#E18AF6'},
 {id:'seguir',icon:'◎',title:'Investigar un número',subtitle:'Formaciones y recorridos',accent:'#51D7AF'},
 {id:'ayuda',icon:'?',title:'Ayuda sencilla',subtitle:'Cómo leer cada cosa',accent:'#8EC2F6'}
];
const tips=[
 {key:'hoja',title:'¿Cómo se arma la hoja?',body:'Se toman las últimas dos cifras de cada cabeza y se les suma 11. Con eso se llena la columna del turno. Los caminos siempre siguen casillas vecinas, sin saltos.',to:'hoja' as Destination,button:'Abrir hoja'},
 {key:'figura',title:'¿Qué significa un recorrido?',body:'Es la forma de leer dos, tres o cuatro cifras tocando casillas vecinas de una misma columna. Cuando una cabeza sale, la hoja puede mostrar todos los caminos que la explican.',to:'predictiva' as Destination,button:'Ver recorridos'},
 {key:'top',title:'¿Por qué un número está primero?',body:'Lalo busca parecidos entre caminos de otras jornadas. El puesto sirve para ordenar lo que encontró, pero no significa que ese número tenga más chances comprobadas de salir.',to:'prediccion' as Destination,button:'Ver números'},
 {key:'tres',title:'¿Qué significa leerlo al revés?',body:'Al estudiar tres cifras, 123 y 321 se consideran una misma familia. Para jugar o cobrar importa el número exacto que se elige.',to:'papa' as Destination,button:'Ir a Lalo'},
 {key:'cuatro',title:'¿Y las cuatro cifras?',body:'La cuarta cifra se agrega a la izquierda de un camino de tres ya formado, no al final. Tiene que existir el recorrido completo en la misma columna.',to:'predictiva' as Destination,button:'Mirar la hoja'},
 {key:'apuesta',title:'¿Lo que aparece es una apuesta?',body:'No. Los números que muestra la aplicación son para mirar y estudiar. Las jugadas de Lalo se anotan aparte, antes del sorteo.',to:'papa' as Destination,button:'Ver elecciones de Lalo'}
] as const;

export default function InfoDashboard({date,turn,data,overview,sheet,historical,visualDays,view,onNavigate,onTurnChange,onOpenFrame,
 selectedFrameId,onSelectFrame,movementMode,onMovementMode,
 expandedGuide,onExpandedGuide,auxDays,currentAux,auxMode,onAuxMode,
 auxPrediction,auxHistory,onOpenAuxDay,trackingAyer,trackingHoy,
 figureFocus,onFigureLalo,onFigureAux,initialSection=null,onSectionChange,
 trendEngine,onTrendEngineChange,trendSnapshot,onTrendPeriodChange}:Props){
 const {colors:c}=useLaloTheme();
 const [section,setSectionState]=useState<Section|null>(initialSection);
 const setSection=(value:Section|null)=>{setSectionState(value);onSectionChange?.(value)};
 const [focusedVt3,setFocusedVt3]=useState<string|null>(null);
 useEffect(()=>{setSectionState(initialSection);setFocusedVt3(null)},[date,initialSection]);
 useEffect(()=>{if(figureFocus){setSectionState('seguir');onSectionChange?.('seguir')}},[figureFocus,initialSection]);
 const gallery=useMemo(()=>buildTurnHistory(date,turn,sheet,view,visualDays),
  [date,turn,sheet,view,visualDays]);
 const selected=OPTIONS.find(x=>x.id===section);
 return <View style={s.root}>
  <View style={[s.welcome,{backgroundColor:c.surface,borderColor:'#B9903F'}]}>
   <Text style={[s.kicker,{color:c.accent}]}>ESTUDIO · EL CUADERNO DE LALO</Text>
   <Text style={[s.welcomeTitle,{color:c.text}]}>{date?readableWeekday(date):'Elegí una fecha'} · {turn}</Text>
  </View>
  {!section?<View style={s.menu}>
   <Text style={[s.heading,{color:c.text}]}>¿Qué querés mirar?</Text>
   <Text style={[s.small,{color:c.subtext}]}>Elegí qué querés estudiar. Todo queda guardado para volver.</Text>
   <View style={s.tiles}>
    {OPTIONS.map(item=><Pressable key={item.id} accessibilityRole="button"
     accessibilityLabel={'Abrir '+item.title}
     onPress={()=>{
       if(item.id==='recorridos')onNavigate('predictiva');
       else {if(item.id==='seguir')setFocusedVt3(null);setSection(item.id)}
      }}
     style={[s.tile,{backgroundColor:c.surface,borderColor:item.accent}]}>
     <Text style={[s.tileIcon,{color:item.accent}]}>{item.icon}</Text>
     <Text style={[s.tileTitle,{color:c.text}]}>{item.title}</Text>
     <Text style={[s.tileSubtitle,{color:c.subtext}]}>{item.subtitle}</Text>
     <Text style={[s.tileLink,{color:item.accent}]}>Tocá para ver  ›</Text>
    </Pressable>)}
   </View>
  </View>:<View style={{gap:10}}>
   <Pressable onPress={()=>setSection(null)} accessibilityRole="button"
    style={[s.back,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
    <Text style={{color:c.accent,fontWeight:'900',fontSize:13}}>‹  Volver a los botones</Text>
   </Pressable>
   <View style={[s.detailCard,{backgroundColor:c.surface,borderColor:selected?.accent||c.border}]}>
    <View style={s.detailTitle}>
     <Text style={{fontSize:29,color:selected?.accent}}>{selected?.icon}</Text>
     <View style={{flex:1}}>
      <Text style={[s.heading,{color:c.text}]}>{selected?.title}</Text>
      <Text style={[s.small,{color:c.subtext}]}>{selected?.subtitle}</Text>
     </View>
    </View>
    {section==='resumen'?<DayMatchGrid overview={overview} turn={turn}
     data={data} auxAyer={trackingAyer.view} auxHoy={trackingHoy.view} onOpenHeads={()=>onNavigate('cabezas')}/>:null}
    {section==='tendencias'?<TurnTrendPanel date={date} turn={turn}
     selectedEngine={trendEngine} onEngineChange={onTrendEngineChange}
     trendSnapshot={trendSnapshot} onPeriodChange={onTrendPeriodChange}
     onTurnChange={onTurnChange}/>:null}
    {section==='vt3'?<>
     <Vt3DiagnosticPanel date={date} turn={turn} data={data} sheet={sheet}
      view={view} ayer={trackingAyer} hoy={trackingHoy}
      onFocusFamily={family=>{setFocusedVt3('vt3|'+family);setSection('seguir')}}
      onOpenAux={onFigureAux}
      onOpenTracking={()=>{setFocusedVt3(null);setSection('seguir')}}/>
    </>:null}
    {section==='historial'?<>
     <Text style={[s.small,{color:c.subtext}]}>Elegí un día o una figura para verla más grande.</Text>
     <InfoTurnGallery gallery={gallery} selectedFrameId={selectedFrameId}
      onSelectFrame={onSelectFrame} mode={movementMode} onMode={onMovementMode}
      onOpenFrame={onOpenFrame}/>
    </>:null}
    {section==='auxiliar'?<>
     <Text style={[s.small,{color:c.subtext}]}>Los recorridos de Santiago y Neuquén, separados de la hoja principal.</Text>
     <InfoAuxGallery days={auxDays} current={currentAux} turn={turn}
      mode={auxMode} onMode={onAuxMode} onOpenDay={onOpenAuxDay}
      prediction={auxPrediction} history={auxHistory}/>
    </>:null}
    {section==='seguir'?<>
     <Text style={[s.small,{color:c.subtext}]}>Tocá una familia para ver su formación y sus movimientos entre hojas.</Text>
     <FigureTrackingPanel date={date} turn={turn} sheet={sheet}
      history={visualDays} view={view} ayer={trackingAyer} hoy={trackingHoy}
      focusRequest={focusedVt3||figureFocus} onOpenLalo={onFigureLalo}
      onOpenAux={onFigureAux}/>
    </>:null}
    {section==='ayuda'?<>
     <Text style={[s.small,{color:c.subtext}]}>Preguntas cortitas para entender la hoja y los números.</Text>
     {tips.map(tip=><View key={tip.key} style={[s.tip,{borderColor:c.divider}]}>
      <Pressable onPress={()=>onExpandedGuide(expandedGuide===tip.key?null:tip.key)}
       accessibilityRole="button" accessibilityState={{expanded:expandedGuide===tip.key}}
       style={s.tipTop}>
       <Text style={{fontWeight:'800',color:c.text,flex:1,fontSize:13}}>{tip.title}</Text>
       <Text style={{color:c.accent,fontWeight:'900',fontSize:18}}>
        {expandedGuide===tip.key?'−':'+'}
       </Text>
      </Pressable>
      {expandedGuide===tip.key?<View style={{gap:10,paddingBottom:12}}>
       <Text style={[s.text,{color:c.subtext}]}>{tip.body}</Text>
       <Pressable onPress={()=>onNavigate(tip.to)} accessibilityRole="button"
        style={[s.slimButton,{borderColor:c.accent}]}>
        <Text style={{color:c.accent,fontWeight:'800'}}>{tip.button}  ›</Text>
       </Pressable>
      </View>:null}
     </View>)}
    </>:null}
   </View>
  </View>}
  <Text style={[s.footer,{color:c.muted}]}>
   Estas vistas ayudan a estudiar las hojas. Ninguna garantiza resultados.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 root:{marginTop:10,gap:12,paddingBottom:28},
 welcome:{borderWidth:1.3,borderRadius:14,padding:10,gap:4},
 kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.4},
 title:{fontSize:24,fontWeight:'900'},welcomeTitle:{fontSize:14,fontWeight:'800'},
 subtitle:{fontSize:12},
 quickRow:{flexDirection:'row',gap:9,marginTop:4},
 quick:{flex:1,borderRadius:12,padding:11,gap:4},
 quickNumber:{fontSize:23,fontWeight:'900'},
 quickLabel:{fontSize:11,lineHeight:16},
 menu:{gap:11},
 heading:{fontSize:18,fontWeight:'900'},
 small:{fontSize:11,lineHeight:17},
 text:{fontSize:13,lineHeight:20},
 tiles:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:10},
 tile:{width:'48%',minHeight:142,borderWidth:1.2,borderRadius:15,
  padding:12,justifyContent:'space-between',gap:6},
 tileIcon:{fontSize:31,fontWeight:'900'},
 tileTitle:{fontSize:13,fontWeight:'900'},
 tileSubtitle:{fontSize:11,lineHeight:16},
 tileLink:{fontSize:10,fontWeight:'900',marginTop:2},
 preview:{borderWidth:1,borderRadius:15,padding:14,gap:10,marginTop:2},
 previewTitle:{fontSize:16,fontWeight:'900'},
 matchGrid:{flexDirection:'row',flexWrap:'wrap',gap:'2%',rowGap:7},
 compactTile:{width:'32%',borderWidth:1,borderRadius:10,padding:7,gap:3,minHeight:58},
 numberChips:{flexDirection:'row',flexWrap:'wrap',gap:7},
 numberChip:{borderRadius:11,borderWidth:1,paddingHorizontal:10,paddingVertical:9},
 slimButton:{borderWidth:1,borderRadius:11,padding:11,alignItems:'center'},
 back:{borderWidth:1,borderRadius:11,padding:12},
 detailCard:{borderWidth:1.2,borderRadius:16,padding:13,gap:11},
 detailTitle:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:4},
 resultChip:{borderWidth:1,borderRadius:10,padding:10,gap:3,minWidth:100},
 tag:{fontSize:11,paddingHorizontal:10,paddingVertical:7,borderRadius:20},
 tip:{borderTopWidth:1},
 tipTop:{flexDirection:'row',gap:10,paddingVertical:13},
 footer:{textAlign:'center',fontSize:10,lineHeight:16,marginTop:3}
});