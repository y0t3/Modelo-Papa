import React,{useEffect,useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloHistorical,LaloView} from '../motorLalo';
import {buildInfoReport,sourceLabel} from '../infoInterpretacion';
import type {InfoFrame} from '../infoInterpretacion';
import {KINDS} from './visualTokens';
import {useLaloTheme} from './LaloTheme';

type Destination='hoja'|'predictiva'|'prediccion'|'papa'|'cabezas';
type Props={date:string;turn:Turno;data:CabezasDia|null;
 sheet:DailySheet|null;historical:LaloHistorical[];
 view:LaloView|null;onNavigate:(screen:Destination)=>void};
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
  'Lalo marca sus propios recorridos físicos y congela la elección antes de que se conozca el resultado. Una VT4 como 3044 baja automáticamente a 044 (VT3) y 44 (VT2). Congelar el PRE conserva lo realmente elegido. Las selecciones antiguas no se reescriben con reglas nuevas.',
  link:'papa' as Destination,label:'Abrir Lalo'},
 {key:'dinero',title:'06 · Apuestas y balance',sub:'Dinero real, no aciertos supuestos',content:
  'Seleccionar un candidato no significa haber apostado. Una boleta real se confirma aparte: cada 4, 3 y 2 cifras bajadas recibe el mismo importe, repetido en las jurisdicciones elegidas. Se juega a la cabeza. Una familia reversible sirve para analizar, pero al cobrar importan las cifras exactas. Sólo se contabiliza como ingreso el premio realmente cobrado.',
  link:'papa' as Destination,label:'Ir a Apuestas'},
 {key:'glosario',title:'07 · Palabras útiles',sub:'Fuente, madre, PRE y POST',content:
  'Fuente: columna construida desde un turno ya sorteado. Recorrido: secuencia de celdas físicamente vecinas. Madre VT3: terna que se extiende por la izquierda para crear una hija VT4. PRE: elección guardada antes del sorteo. POST: cotejo con resultados ya publicados. D−1 y D−7: jornadas anteriores utilizadas como antecedentes.',
  link:'predictiva' as Destination,label:'Ver un ejemplo'}
] as const;

function MotionGrid({frame,compact=false}:{frame:InfoFrame;compact?:boolean}){
 const {colors:c,kinds}=useLaloTheme();
 const max=Math.max(1,...frame.cells.flat());
 return <View accessibilityLabel={'Mapa de 6 filas y 2 columnas, '+frame.label}
  style={[s.grid,{borderColor:c.border,backgroundColor:c.board}]}>
  {frame.cells.map((row,r)=><View key={r} style={s.gridRow}>
   {row.map((weight,col)=>{
    const ratio=weight/max;
    const bg=weight===0?c.cell:frame.phase==='PRE'?kinds.vt3.fill:c.accentFill;
    const fg=frame.phase==='PRE'?kinds.vt3.line:c.accent;
    return <View key={col} style={[s.gridCell,{
     width:compact?19:39,height:compact?15:28,borderColor:c.border,backgroundColor:bg,
     borderWidth:weight>0&&ratio>=0.7?1.5:0.6}]}>
      <View style={{backgroundColor:fg,opacity:weight?0.22+0.75*ratio:0,
       width:compact?5:10,height:compact?5:10,borderRadius:6}}/>
    </View>;
   })}
  </View>)}
 </View>;
}
function LegendColor({kind}:{kind:'vt2'|'vt3'|'vt4'}){
 const {colors:c,kinds}=useLaloTheme();
 return <View style={s.legendItem}>
  <View style={[s.legendSwatch,{backgroundColor:kinds[kind].fill,
   borderColor:kinds[kind].line}]}/>
  <Text style={{color:c.subtext,fontSize:11,fontWeight:'700'}}>{kind.toUpperCase()} · {kinds[kind].label}</Text>
 </View>;
}
export default function InfoDashboard({date,turn,data,sheet,historical,view,onNavigate}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const report=useMemo(()=>buildInfoReport(date,turn,data,sheet,historical,view),
  [date,turn,data,sheet,historical,view]);
 const [frameIndex,setFrameIndex]=useState(0);
 const [expanded,setExpanded]=useState<string|null>('tablero');
 useEffect(()=>{setFrameIndex(Math.max(0,report.frames.length-1))},[date,turn,view,report.frames.length]);
 const selected=report.frames[Math.min(frameIndex,report.frames.length-1)];
 const loaded=report.observed.length;
 const availability=report.availableSources.filter(x=>x.active);
 const displayDate=/^\d{4}-\d{2}-\d{2}$/.test(date)?
  date.slice(8,10)+'/'+date.slice(5,7)+'/'+date.slice(0,4):'Sin fecha';
 return <View style={s.root}>
  <View style={[s.hero,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.kicker,{color:c.accent}]}>JORNADA Y GUÍA</Text>
   <Text style={[s.title,{color:c.text}]}>INFO · MODELO LALO</Text>
   <Text style={[s.desc,{color:c.subtext}]}>
    Entendé el turno cargado, observá cómo cambian los recorridos y consultá el método.
   </Text>
  </View>
  <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>01 · Estado de la jornada</Text>
   <Text style={[s.desc,{color:c.subtext}]}>Fecha: {displayDate} · Turno en foco: {turn}</Text>
   <View style={s.statRow}>
    <View style={[s.stat,{backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.statNumber,{color:c.text}]}>{loaded} / {report.expected.length||'—'}</Text>
     <Text style={[s.statLabel,{color:c.subtext}]}>Cabezas registradas / habituales</Text>
    </View>
    <View style={[s.stat,{backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.statNumber,{color:c.text}]}>{availability.length}</Text>
     <Text style={[s.statLabel,{color:c.subtext}]}>Fuentes con cifras antes del turno</Text>
    </View>
   </View>
   <Text style={[s.microHeader,{color:c.text}]}>Columnas anteriores disponibles</Text>
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
   <Text style={[s.heading,{color:c.text}]}>02 · Panorama del turno</Text>
   <Text style={[s.desc,{color:c.subtext}]}>Lectura descriptiva del Top10 VT3 y los recorridos anteriores.</Text>
   {report.narrative.map((line,i)=><Text key={i}
    style={[s.paragraph,{color:c.text}]}>{line}</Text>)}
   <View style={[s.notice,{backgroundColor:c.callout}]}>
    <Text style={[s.note,{color:c.subtext}]}>
     Esta lectura compara posiciones observadas; no determina dónde saldrá el próximo número.
    </Text>
   </View>
   <Pressable accessibilityRole="button" onPress={()=>onNavigate('predictiva')}
    style={[s.goto,{borderColor:c.border}]}>
    <Text style={{color:c.accent,fontWeight:'800',fontSize:12}}>
     Ver los recorridos de la Predictiva →
    </Text>
   </Pressable>
  </View>
  <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>03 · Movimiento reciente</Text>
   <Text style={[s.desc,{color:c.subtext}]}>
    Secuencia congelada: tocá cada cuadro para seguir la distribución física entre jornadas y turnos.
   </Text>
   <View style={s.motionStrip}>
    {report.frames.map((f,i)=><Pressable key={f.id}
     onPress={()=>setFrameIndex(i)} accessibilityRole="button"
     accessibilityState={{selected:selected===f}}
     style={[s.motionThumb,{backgroundColor:selected===f?c.accentFill:c.card,
      borderColor:selected===f?c.accent:c.border}]}>
     <MotionGrid frame={f} compact/>
     <Text numberOfLines={2} style={[s.miniLabel,{color:c.text}]}>{f.label}</Text>
     <Text style={[s.miniType,{color:c.subtext}]}>{f.phase} · {f.units} aportes</Text>
    </Pressable>)}
   </View>
   <View style={[s.motionDetail,{backgroundColor:c.surfaceAlt}]}>
    <View style={{flex:1,gap:6}}>
     <Text style={[s.microHeader,{color:c.text}]}>{selected.label}</Text>
     <Text style={[s.note,{color:c.subtext}]}>
      {selected.phase==='PRE'?'Familias VT3 Top10 (PRE)':'Coincidencias VT3 de cabezas publicadas (POST)'}
     </Text>
     <Text style={[s.note,{color:c.text}]}>Fuente principal: {
      selected.mainSource?sourceLabel(selected.mainSource as import('../sheet').SourceId):'Sin predominio único'
     }</Text>
     <Text style={[s.note,{color:c.text}]}>Sector más recorrido: {
      selected.mainZone||'Sin predominio único'
     }</Text>
     <Text style={[s.note,{color:c.subtext}]}>
      {selected.available?selected.units+' aportes físicos agrupados':
       'Sin recorridos VT3 comparables en este corte'}
     </Text>
    </View>
    <MotionGrid frame={selected}/>
   </View>
   <View style={s.motionActions}>
    <Pressable accessibilityRole="button" disabled={frameIndex===0}
     onPress={()=>setFrameIndex(i=>Math.max(0,i-1))}
     style={[s.motionButton,{borderColor:c.border,opacity:frameIndex===0?0.4:1}]}>
     <Text style={{color:c.accent,fontWeight:'800'}}>← Anterior</Text>
    </Pressable>
    <Text style={{color:c.subtext,fontSize:11}}>{frameIndex+1} / {report.frames.length}</Text>
    <Pressable accessibilityRole="button" disabled={frameIndex>=report.frames.length-1}
     onPress={()=>setFrameIndex(i=>Math.min(report.frames.length-1,i+1))}
     style={[s.motionButton,{borderColor:c.border,
      opacity:frameIndex>=report.frames.length-1?0.4:1}]}>
     <Text style={{color:c.accent,fontWeight:'800'}}>Siguiente →</Text>
    </Pressable>
   </View>
   <Text style={[s.note,{color:c.muted}]}>
    Los cuadros son fotografías de actividad por casilla, no la trayectoria de una misma cabeza entre jornadas.
    Más intensidad significa más aportes distintos; no más probabilidad.
   </Text>
  </View>
  <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>04 · Guía del sistema</Text>
   <Text style={[s.desc,{color:c.subtext}]}>Abrí únicamente lo que quieras consultar.</Text>
   <View style={s.legend}>
    {KINDS.map(k=><LegendColor key={k} kind={k}/>)}
   </View>
   {guides.map(g=><View key={g.key} style={[s.guide,{borderColor:c.divider}]}>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:expanded===g.key}}
     onPress={()=>setExpanded(prev=>prev===g.key?null:g.key)}
     style={s.guideHead}>
     <View style={{flex:1}}>
      <Text style={[s.guideTitle,{color:c.text}]}>{g.title}</Text>
      <Text style={[s.note,{color:c.subtext}]}>{g.sub}</Text>
     </View>
     <Text style={{color:c.accent,fontSize:18,fontWeight:'900'}}>{expanded===g.key?'−':'+'}</Text>
    </Pressable>
    {expanded===g.key&&<View style={s.guideBody}>
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
