import React,{useMemo} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloHistorical,LaloView} from '../motorLalo';
import {buildInfoReport,sourceLabel} from '../infoInterpretacion';
import type {MovementMode} from '../infoCandidatos';
import type {InfoVisualDay} from '../infoTurnHistory';
import {buildTurnHistory,readableWeekday} from '../infoTurnHistory';
import type {TurnHistoryFrame} from '../infoTurnHistory';
import InfoTurnGallery from './InfoTurnGallery';
import InfoAuxGallery from './InfoAuxGallery';
import type {AuxGalleryDay} from '../infoAuxGallery';
import type {AuxMode} from '../auxTemporalModes';
import type {AuxiliarHistory,AuxiliarView} from '../motorLaloAuxiliar';
import TurnStrip from './TurnStrip';
import FigureTrackingPanel from './FigureTrackingPanel';
import type {TrackingAuxInput} from '../figureTracking';
import {KINDS} from './visualTokens';
import {useLaloTheme} from './LaloTheme';

type Destination='hoja'|'predictiva'|'prediccion'|'papa'|'cabezas';
type Props={date:string;turn:Turno;data:CabezasDia|null;
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
 expandedGuide:string|null;onExpandedGuide:(id:string|null)=>void};
const guides=[
 {key:'tablero',title:'01 · La hoja +11',sub:'De dónde vienen las cifras',content:
  'Cada cabeza anterior aporta sus últimas dos cifras más 11 (módulo 100). Se dibujan seis filas con dos columnas por fuente. Los caminos coincidentes se marcan al conocer las cabezas: son explicaciones de resultados ya publicados, no pronósticos previos.',
  link:'hoja' as Destination,label:'Abrir Hoja'},
 {key:'recorridos',title:'02 · VT2, VT3 y VT4',sub:'La geometría de los números',content:
  'VT2 recorre dos casillas y VT3 tres, siempre contiguas, sin saltos ni reutilizaciones. VT3 044 y 440 son una misma familia para estudiar recorridos reversibles. VT4 nace agregando una cuarta casilla al INICIO de su recorrido VT3: 044/440 con un 3 físico permite 3044/3440, no 0443/4403.',
  link:'predictiva' as Destination,label:'Ver recorridos'},
 {key:'top',title:'03 · Familias y posiciones',sub:'Cómo interpretar los Tops',content:
  'El motor busca respaldos geométricos y antecedentes D−1/D−7. Un Top3, Top5 o Top10 organiza familias según criterios definidos, pero NO representa probabilidades comprobadas. En VT4 se intercala primero la mejor hija física de cada madre VT3 válida, y después sus siguientes hijas.',
  link:'prediccion' as Destination,label:'Abrir Predicción'},
 {key:'tab',title:'04 · Hoja, Predictiva y Cabezas',sub:'Qué tiene cada pestaña',content:
  'HOJA resalta recorridos que coincidieron con sorteos publicados (POST). PREDICTIVA dibuja recorridos candidatos antes del turno (PRE). PREDICCIÓN explica por qué las familias entran a los Tops. CABEZAS muestra los resultados completos disponibles por jurisdicción y turno.',
  link:'cabezas' as Destination,label:'Consultar cabezas'},
 {key:'lalo',title:'05 · Pronóstico personal de Lalo',sub:'Elegir, bajar y congelar',content:
  'Lalo marca sus propios recorridos físicos y congela la elección antes de que se conozca el resultado. Una VT4 como 3044 baja a 044 (VT3) y 44 (VT2); una VT3 como 768 baja a 68 (VT2). Congelar el PRE conserva lo realmente elegido. Las selecciones antiguas no se reescriben con reglas nuevas.',
  link:'papa' as Destination,label:'Abrir Lalo'},
 {key:'dinero',title:'06 · Apuestas y balance',sub:'Dinero real, no aciertos supuestos',content:
  'Seleccionar un candidato no significa haber apostado. Una boleta real se confirma aparte: cada 4, 3 y 2 cifras bajadas recibe el mismo importe, repetido en las jurisdicciones elegidas. Se juega a la cabeza. Una familia reversible sirve para analizar, pero al cobrar importan las cifras exactas. Sólo se contabiliza como ingreso el premio realmente cobrado.',
  link:'papa' as Destination,label:'Ir a Apuestas'},
 {key:'glosario',title:'07 · Palabras útiles',sub:'Fuente, madre, PRE y POST',content:
  'Fuente: columna construida desde un turno ya sorteado. Recorrido: secuencia de celdas físicamente vecinas. Madre VT3: terna que se extiende por la izquierda para crear una hija VT4. PRE: elección guardada antes del sorteo. POST: cotejo con resultados ya publicados. D−1 y D−7: jornadas anteriores utilizadas como antecedentes.',
  link:'predictiva' as Destination,label:'Ver un ejemplo'}
] as const;

function LegendColor({kind}:{kind:'vt2'|'vt3'|'vt4'}){
 const {colors:c,kinds}=useLaloTheme();
 return <View style={s.legendItem}>
  <View style={[s.legendSwatch,{backgroundColor:kinds[kind].fill,
   borderColor:kinds[kind].line}]}/>
  <Text style={{color:c.subtext,fontSize:11,fontWeight:'700'}}>{kind.toUpperCase()} · {kinds[kind].label}</Text>
 </View>;
}
export default function InfoDashboard({date,turn,data,sheet,historical,visualDays,view,onNavigate,onTurnChange,onOpenFrame,
 selectedFrameId,onSelectFrame,movementMode,onMovementMode,
 expandedGuide,onExpandedGuide,auxDays,currentAux,auxMode,onAuxMode,
 auxPrediction,auxHistory,onOpenAuxDay,trackingAyer,trackingHoy,
 figureFocus,onFigureLalo,onFigureAux}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const gallery=useMemo(()=>buildTurnHistory(date,turn,sheet,view,visualDays),
  [date,turn,sheet,view,visualDays]);
 const report=useMemo(()=>buildInfoReport(date,turn,data,sheet,historical,view),
  [date,turn,data,sheet,historical,view]);
 const loaded=report.observed.length;
 const availability=report.availableSources.filter(x=>x.active);
 const displayDate=date?readableWeekday(date):'Sin fecha';
 return <View style={s.root}>
  <View style={[s.hero,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.kicker,{color:c.accent}]}>JORNADA Y GUÍA</Text>
   <Text style={[s.title,{color:c.text}]}>INFO · MODELO LALO</Text>
   <Text style={[s.desc,{color:c.subtext}]}>
    Mirá cómo salió el mismo turno en otras jornadas y qué muestra la hoja para el próximo sorteo.
   </Text>
  </View>
  <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>01 · Información del sorteo</Text>
   <Text style={[s.desc,{color:c.subtext}]}>Fecha: {displayDate} · Turno en foco: {turn}</Text>
   <View style={s.statRow}>
    <View style={[s.stat,{backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.statNumber,{color:c.text}]}>{loaded} / {report.expected.length||'—'}</Text>
     <Text style={[s.statLabel,{color:c.subtext}]}>Resultados publicados / habituales</Text>
    </View>
    <View style={[s.stat,{backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.statNumber,{color:c.text}]}>{availability.length}</Text>
     <Text style={[s.statLabel,{color:c.subtext}]}>Columnas disponibles antes del sorteo</Text>
    </View>
   </View>
   <Text style={[s.microHeader,{color:c.text}]}>Resultados anteriores utilizados</Text>
   <View style={s.pills}>
    {report.availableSources.map(col=><View key={col.id} style={[s.pill,{
     borderColor:col.active?c.accent:c.border,
     backgroundColor:col.active?c.accentFill:c.surfaceAlt}]}>
     <Text style={{fontWeight:'700',fontSize:10,color:col.active?c.accent:c.subtext}}>
      {col.active?'● ':'○ '}{col.label}
     </Text>
    </View>)}
   </View>
   {!sheet?<Text style={[s.desc,{color:c.subtext}]}>
    Actualizá la hoja para mostrar fuentes y resultados.
   </Text>:null}
   <Text style={[s.note,{color:c.subtext}]}>
    {report.expected.length===0?
     'Para este día no hay sorteos habituales previstos en el calendario básico.':
     report.withoutHead.length?
     'Sin cabeza registrada todavía: '+report.withoutHead.join(', ')+'. Puede ser un resultado pendiente o un sorteo no realizado.':
     'Se registraron las cabezas de todas las jurisdicciones habituales de este turno.'}
   </Text>
   {!!report.observed.length&&<View style={s.pills}>
    {report.observed.map(x=><Text key={x.jurisdiction}
     style={[s.observed,{color:c.text,backgroundColor:c.surfaceAlt}]}>
     {x.jurisdiction}: {x.head}
    </Text>)}
   </View>}
   <Text style={[s.note,{color:c.muted}]}>
    Cantidad habitual no equivale a disponibilidad confirmada; Montevideo tiene turnos propios.
   </Text>
  </View>
  <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>Elegí el turno para comparar</Text>
   <TurnStrip value={turn} onChange={onTurnChange}/>
  </View>
  <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>02 · Cómo viene el {turn}</Text>
   <Text style={[s.paragraph,{color:c.text}]}>{gallery.summary}</Text>
   <Text style={[s.note,{color:c.subtext}]}>
    Se comparan sorteos reales del mismo turno. Lo que ocurrió otros días
    no asegura que vuelva a repetirse.
   </Text>
  </View>
  <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>03 · El turno, jornada por jornada</Text>
   <InfoTurnGallery gallery={gallery} selectedFrameId={selectedFrameId}
    onSelectFrame={onSelectFrame} mode={movementMode} onMode={onMovementMode}
    onOpenFrame={onOpenFrame}/>
  </View>
  <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>04 · Minihojas Santiago–Neuquén · semana previa</Text>
   <InfoAuxGallery days={auxDays} current={currentAux} turn={turn}
    mode={auxMode} onMode={onAuxMode} onOpenDay={onOpenAuxDay}
    prediction={auxPrediction} history={auxHistory}/>
  </View>
  <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>05 · Seguimiento de figuras</Text>
   <Text style={[s.desc,{color:c.subtext}]}>
    Analizá figuras físicamente presentes, marcas ganadoras históricas y
    reconocimiento en ambos motores. No crea nuevas predicciones.
   </Text>
   <FigureTrackingPanel date={date} turn={turn} sheet={sheet}
    history={visualDays} view={view} ayer={trackingAyer} hoy={trackingHoy}
    focusRequest={figureFocus} onOpenLalo={onFigureLalo}
    onOpenAux={onFigureAux}/>
  </View>
  <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>06 · Guía del sistema</Text>
   <Text style={[s.desc,{color:c.subtext}]}>Abrí únicamente lo que quieras consultar.</Text>
   <View style={s.legend}>
    {KINDS.map(k=><LegendColor key={k} kind={k}/>)}
   </View>
   {guides.map(g=><View key={g.key} style={[s.guide,{borderColor:c.divider}]}>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:expandedGuide===g.key}}
     onPress={()=>onExpandedGuide(expandedGuide===g.key?null:g.key)}
     style={s.guideHead}>
     <View style={{flex:1}}>
      <Text style={[s.guideTitle,{color:c.text}]}>{g.title}</Text>
      <Text style={[s.note,{color:c.subtext}]}>{g.sub}</Text>
     </View>
     <Text style={{color:c.accent,fontSize:18,fontWeight:'900'}}>{expandedGuide===g.key?'−':'+'}</Text>
    </Pressable>
    {expandedGuide===g.key&&<View style={s.guideBody}>
     <Text style={[s.paragraph,{color:c.text}]}>{g.content}</Text>
     <Pressable accessibilityRole="button" style={[s.goto,{borderColor:c.border}]}
      onPress={()=>onNavigate(g.link)}>
      <Text style={{color:c.accent,fontSize:12,fontWeight:'800'}}>{g.label} →</Text>
     </Pressable>
    </View>}
   </View>)}
  </View>
  <Text style={[s.foot,{color:c.muted}]}>
   Modelo experimental. Las cabezas y trayectorias pasadas sirven para estudiar recorridos;
   ninguna señal constituye una garantía de acierto o beneficio económico.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 root:{marginTop:10,gap:11,paddingBottom:18},
 hero:{borderWidth:1,borderRadius:14,padding:15,gap:4},
 kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.5},
 title:{fontSize:19,fontWeight:'900'},heading:{fontSize:15,fontWeight:'900',marginBottom:5},
 desc:{fontSize:11,lineHeight:17},paragraph:{fontSize:12,lineHeight:19,marginTop:6},
 card:{borderWidth:1,borderRadius:13,padding:13,gap:9},
 statRow:{flexDirection:'row',gap:8},stat:{flex:1,borderRadius:9,padding:10,gap:4},
 statNumber:{fontSize:20,fontWeight:'900'},statLabel:{fontSize:10,lineHeight:15},
 microHeader:{fontSize:11,fontWeight:'900'},
 pills:{flexDirection:'row',gap:5,flexWrap:'wrap'},
 pill:{borderWidth:1,paddingHorizontal:9,paddingVertical:6,borderRadius:18},
 note:{fontSize:10,lineHeight:16},observed:{fontSize:10,padding:6,borderRadius:7},
 notice:{borderRadius:8,padding:9},
 goto:{borderWidth:1,borderRadius:8,padding:10,alignSelf:'flex-start'},
 motionStrip:{flexDirection:'row',flexWrap:'wrap',gap:7},
 motionThumb:{borderWidth:1,borderRadius:9,padding:7,alignItems:'center',
  minWidth:93,maxWidth:125,flexGrow:1,gap:5},
 miniLabel:{fontSize:10,textAlign:'center',fontWeight:'800'},
 miniType:{fontSize:9,textAlign:'center'},
 motionDetail:{borderRadius:9,padding:12,flexDirection:'row',alignItems:'center',gap:12},
 grid:{borderWidth:1,borderRadius:4,padding:2,gap:2},
 gridRow:{flexDirection:'row',gap:2},
 gridCell:{alignItems:'center',justifyContent:'center',borderRadius:2},
 motionActions:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:4},
 motionButton:{borderWidth:1,paddingVertical:8,paddingHorizontal:11,borderRadius:8},
 legend:{flexDirection:'row',flexWrap:'wrap',gap:8},
 legendItem:{flexDirection:'row',alignItems:'center',gap:4},
 legendSwatch:{width:12,height:12,borderWidth:2,borderRadius:3},
 guide:{borderTopWidth:1,paddingVertical:4},
 guideHead:{paddingVertical:8,flexDirection:'row',alignItems:'center',gap:8},
 guideTitle:{fontSize:12,fontWeight:'900'},
 guideBody:{paddingBottom:10,gap:7},
 foot:{textAlign:'center',fontSize:10,lineHeight:16,padding:8}
});
