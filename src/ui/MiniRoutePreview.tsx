import React,{useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {DailySheet,SourceId} from '../sheet';
import {readableWeekday} from '../infoTurnHistory';
import type {PanoramaAntecedent,PanoramaRoute,PanoramaCell} from '../panoramaModel';
import RouteMiniBoard from './RouteMiniBoard';
import PhysicalShapeHistory from './PhysicalShapeHistory';
import type {Turno} from '../domain';
import type {InfoVisualDay} from '../infoTurnHistory';
import {useLaloTheme} from './LaloTheme';
import {extractVt2EdgesFromVt3} from '../vt3EdgePreview';

const sourceName=(id:SourceId)=>({
 prevNocturno:'Nocturna anterior',Previa:'Previa',Primera:'Primera',
 Matutino:'Matutina',Vespertino:'Vespertina'
})[id];
const cellText=(p:PanoramaCell)=>'fila '+(p.row+1)+(p.col?' derecha':' izquierda');
const walk=(cells:PanoramaCell[])=>cells.map(cellText).join(' → ');
const weekday=(date:string)=>readableWeekday(date).toLowerCase();

function HistoricalCard({antecedent,kind,currentValues}:{
 antecedent:PanoramaAntecedent;kind:PanoramaRoute['kind'];currentValues:string[]
}){
 const {colors:c,kinds}=useLaloTheme();
 const connection=antecedent.relation;
 return <View style={[s.historyCard,{backgroundColor:c.card,borderColor:c.border}]}>
  <Text style={[s.historyHeading,{color:kinds[kind].line}]}>
   {antecedent.period==='D−1'?'Jornada anterior':'Semana pasada'} · {weekday(antecedent.date)}
  </Text>
  <Text style={[s.historyText,{color:c.text}]}>
   {antecedent.jurisdiction} · {antecedent.turn} · salió {antecedent.head}
  </Text>
  <Text style={[s.historyMeta,{color:c.subtext}]}>
   En la hoja de ese día: {antecedent.sourceLabel}
  </Text>
  <RouteMiniBoard values={antecedent.values} cells={antecedent.cells}
   kind={kind} compact/>
  <Text style={[s.historyMeta,{color:c.text}]}>
   Coincidieron las últimas cifras: {antecedent.reading}
  </Text>
  <Text style={[s.historyMeta,{color:c.subtext}]}>
   Su camino: {walk(antecedent.cells)}
  </Text>
  <View style={[s.explanation,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.explanationTitle,{color:c.text}]}>
    {connection?.type==='misma-forma'?'Misma forma':
     connection?.type==='bifurcacion'?'Forma trasladada y nuevo camino':'Relación por comprobar'}
   </Text>
   <Text style={[s.historyMeta,{color:c.text}]}>
    {connection?.explanation||'No se pudo reconstruir cómo se relaciona con el recorrido actual.'}
   </Text>
  </View>
  {connection?.type==='bifurcacion'&&connection.bridgeCells?.length&&
   <View style={{gap:5,marginTop:8}}>
    <Text style={[s.historyText,{color:c.text}]}>
     Paso intermedio en la hoja actual: {connection.bridgeValue}
    </Text>
    <RouteMiniBoard values={currentValues} cells={connection.bridgeCells}
     kind={kind} compact/>
    <Text style={[s.historyMeta,{color:c.subtext}]}>
     Esta es la forma trasladada antes de cambiar la tercera casilla.
    </Text>
   </View>}
 </View>;
}

export default function MiniRoutePreview({sheet,route,date='',turn,days=[]}:{
 sheet:DailySheet;route:PanoramaRoute;date?:string;turn?:Turno;days?:InfoVisualDay[]
}){
 const {colors:c}=useLaloTheme();
 const [expanded,setExpanded]=useState(false);
 const [selectedEdge,setSelectedEdge]=useState<number|null>(null);
 const column=sheet.columns.find(x=>x.id===route.sourceId);
 if(!column)return null;
 const antecedents=route.antecedents||[];
 const kindLabel=route.kind==='vt2'?'2 cifras':route.kind==='vt3'?'3 cifras':'4 cifras';
 const vt2Edges=route.kind==='vt3'?extractVt2EdgesFromVt3(column.values,route.cells):[];
 return <View style={[s.wrap,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
  <Text style={[s.heading,{color:c.text}]}>
   Recorrido actual · {sourceName(route.sourceId)} · {kindLabel}
  </Text>
  <RouteMiniBoard values={column.values} cells={route.cells} kind={route.kind}/>
  <Text style={[s.caption,{color:c.subtext}]}>
   Forma {route.readings.join(' o ')}. Camino: {walk(route.cells)}.
  </Text>
  {vt2Edges.length>0?<View style={[s.edgeBox,{borderColor:c.border,backgroundColor:c.card}]}>
   <Text style={[s.heading,{color:c.accent}]}>VT2 contenidos en este recorrido VT3</Text>
   <Text style={[s.hint,{color:c.subtext,marginVertical:3}]}>
    Dos tramos de casillas consecutivas. Tocá uno para resaltarlo en la minihoja.
    No son candidatos nuevos ni alteran el Top10 VT2.
   </Text>
   <View style={s.edgeRow}>
    {vt2Edges.map((edge,i)=><Pressable key={i} accessibilityRole="button"
     accessibilityLabel={edge.label+': '+edge.family}
     accessibilityState={{selected:selectedEdge===i}}
     onPress={()=>setSelectedEdge(prev=>prev===i?null:i)}
     style={[s.edgeChip,{borderColor:selectedEdge===i?c.accent:c.border,
      backgroundColor:selectedEdge===i?c.accentFill:c.surfaceAlt}]}>
     <Text style={{color:c.text,fontWeight:'900',fontSize:12}}>{edge.family}</Text>
     <Text style={{color:c.subtext,fontSize:9}}>{edge.label}</Text>
    </Pressable>)}
   </View>
   {selectedEdge!==null&&vt2Edges[selectedEdge]?
    <View style={{gap:5,paddingTop:6}}>
     <Text style={[s.caption,{color:c.text,marginTop:0}]}>
      {vt2Edges[selectedEdge].label} · {vt2Edges[selectedEdge].reading}
     </Text>
     <RouteMiniBoard values={column.values} cells={vt2Edges[selectedEdge].cells}
      kind="vt2" compact/>
    </View>:null}
  </View>:null}
  {date&&turn?<PhysicalShapeHistory key={route.id+'|'+route.ownerId}
   route={route} sheet={sheet} date={date} turn={turn} days={days}/>:null}
  <Text style={[s.heading,{color:c.text,marginTop:12}]}>
   2 · RAÍCES QUE EL MOTOR REALMENTE USÓ
  </Text>
  <Text style={[s.hint,{color:c.subtext}]}>
   Estos antecedentes sí pertenecen al respaldo de este candidato.
   No deben confundirse con otras veces que se dio la misma silueta.
  </Text>
  {antecedents.length>0?<View style={{marginTop:12}}>
   <Pressable accessibilityRole="button"
    accessibilityLabel={'Ver cómo se relacionan '+antecedents.length+' recorridos anteriores'}
    accessibilityState={{expanded}}
    onPress={()=>setExpanded(x=>!x)}
    style={[s.toggle,{backgroundColor:c.card,borderColor:c.border}]}>
    <Text style={[s.toggleLabel,{color:c.accent}]}>
     {expanded?'▾':'▸'} Ver raíces ganadoras de este recorrido ({antecedents.length})
    </Text>
    <Text style={[s.toggleHint,{color:c.subtext}]}>
     {expanded?'Ocultar':'Ver'}
    </Text>
   </Pressable>
   {expanded?<View>
    <Text style={[s.hint,{color:c.subtext}]}>
     Cada tarjeta muestra una coincidencia anterior y explica cómo se conecta
     con el recorrido actual. Una bifurcación conserva dos casillas, pero cambia la tercera.
    </Text>
    <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator
     contentContainerStyle={s.gallery}>
     {antecedents.map(a=><HistoricalCard key={a.id}
      antecedent={a} kind={route.kind} currentValues={column.values}/>)}
    </ScrollView>
   </View>:null}
  </View>:null}
  {antecedents.length===0&&route.headSources.some(x=>x.startsWith('D−'))?
   <Text style={[s.hint,{color:c.muted}]}>
    No está disponible la hoja anterior para mostrar el origen de este recorrido.
   </Text>:null}
 </View>;
}
const s=StyleSheet.create({
 wrap:{borderRadius:11,borderWidth:1,padding:10,marginTop:9},
 heading:{fontSize:12,fontWeight:'900',marginBottom:6},
 caption:{fontSize:10,marginTop:7,lineHeight:17},
 toggle:{borderWidth:1,borderRadius:8,paddingHorizontal:11,paddingVertical:11,
  flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6},
 toggleLabel:{fontWeight:'900',fontSize:12,flexShrink:1},
 toggleHint:{fontSize:10,fontWeight:'700'},
 hint:{fontSize:11,lineHeight:17,marginVertical:9},
 gallery:{gap:8,paddingBottom:8,paddingRight:8},
 historyCard:{width:253,borderWidth:1,borderRadius:9,padding:10},
 historyHeading:{fontSize:12,fontWeight:'900',marginBottom:4},
 historyText:{fontSize:11,fontWeight:'700',lineHeight:17},
 historyMeta:{fontSize:10,lineHeight:17,marginTop:6},
 explanation:{marginTop:11,borderRadius:8,padding:9},
 explanationTitle:{fontWeight:'900',fontSize:11},
 edgeBox:{marginTop:9,padding:9,borderRadius:9,borderWidth:1,gap:5},
 edgeRow:{flexDirection:'row',flexWrap:'wrap',gap:7},
 edgeChip:{paddingHorizontal:10,paddingVertical:9,borderWidth:1,borderRadius:8,gap:3}
});
