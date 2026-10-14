import React,{useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {PanoramaAntecedent,PanoramaRoute} from '../panoramaModel';
import RouteMiniBoard,{routeCellText} from './RouteMiniBoard';
import {useLaloTheme} from './LaloTheme';

function HistoricalCard({antecedent,kind}:{
 antecedent:PanoramaAntecedent;kind:PanoramaRoute['kind']
}){
 const {colors:c,kinds}=useLaloTheme();
 return <View style={[s.historyCard,{backgroundColor:c.card,borderColor:c.border}]}>
  <Text style={[s.historyHeading,{color:kinds[kind].line}]}>
   {antecedent.period} · {antecedent.date}
  </Text>
  <Text style={[s.historyText,{color:c.text}]}>
   {antecedent.jurisdiction} ({antecedent.turn}) · Cabeza {antecedent.head}
  </Text>
  <Text style={[s.historyMeta,{color:c.subtext}]}>
   Columna histórica: {antecedent.sourceLabel}
  </Text>
  <RouteMiniBoard values={antecedent.values} cells={antecedent.cells}
   kind={kind} compact/>
  <Text style={[s.historyMeta,{color:c.text}]}>
   Terminación: {antecedent.reading}
  </Text>
  <Text style={[s.historyMeta,{color:c.subtext}]}>
   Casillas: {routeCellText(antecedent.cells)}
  </Text>
 </View>;
}
export default function MiniRoutePreview({sheet,route}:{
 sheet:DailySheet;route:PanoramaRoute
}){
 const {colors:c}=useLaloTheme();
 const [expanded,setExpanded]=useState(false);
 const column=sheet.columns.find(x=>x.id===route.sourceId);
 if(!column)return null;
 const antecedents=route.antecedents||[];
 return <View style={[s.wrap,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
  <Text style={[s.heading,{color:c.text}]}>
   Recorrido · {route.sourceId} · {route.kind.toUpperCase()}
  </Text>
  <RouteMiniBoard values={column.values} cells={route.cells} kind={route.kind}/>
  <Text style={[s.caption,{color:c.subtext}]}>
   Lectura: {route.readings.join(' / ')} · Casillas {routeCellText(route.cells)}
  </Text>
  {route.headSources.slice(0,3).map((h,i)=><Text key={i}
   style={[s.root,{color:c.subtext}]}>Antecedente: {h}</Text>)}
  {antecedents.length>0?<View style={{marginTop:12}}>
   <Pressable accessibilityRole="button"
    accessibilityLabel={'Respaldo visual: '+antecedents.length+' antecedentes'}
    accessibilityState={{expanded}}
    onPress={()=>setExpanded(x=>!x)}
    style={[s.toggle,{backgroundColor:c.card,borderColor:c.border}]}>
    <Text style={[s.toggleLabel,{color:c.accent}]}>
     {expanded?'▾':'▸'} Respaldo visual ({antecedents.length})
    </Text>
    <Text style={[s.toggleHint,{color:c.subtext}]}>
     {expanded?'Ocultar':'Ver columnas'}
    </Text>
   </Pressable>
   {expanded?<View>
    <Text style={[s.hint,{color:c.subtext}]}>
     Recorridos reales de las cabezas anteriores. Las cifras históricas pueden
     ser distintas: se trasladó su geometría, no el número.
    </Text>
    <ScrollView horizontal nestedScrollEnabled
     showsHorizontalScrollIndicator
     contentContainerStyle={s.gallery}>
     {antecedents.map(a=><HistoricalCard key={a.id}
      antecedent={a} kind={route.kind}/>)}
    </ScrollView>
   </View>:null}
  </View>:null}
  {antecedents.length===0&&route.headSources.some(x=>x.startsWith('D−'))?
   <Text style={[s.hint,{color:c.muted}]}>
    La columna histórica no está disponible para mostrar su recorrido.
   </Text>:null}
 </View>;
}
const s=StyleSheet.create({
 wrap:{borderRadius:11,borderWidth:1,padding:10,marginTop:9},
 heading:{fontSize:12,fontWeight:'900',marginBottom:6},
 caption:{fontSize:10,marginTop:7,lineHeight:15},
 root:{fontSize:10,marginTop:4,lineHeight:15},
 toggle:{borderWidth:1,borderRadius:8,paddingHorizontal:11,paddingVertical:11,
  flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6},
 toggleLabel:{fontWeight:'900',fontSize:12},
 toggleHint:{fontSize:10,fontWeight:'700'},
 hint:{fontSize:10,lineHeight:15,marginVertical:9},
 gallery:{gap:8,paddingBottom:8,paddingRight:8},
 historyCard:{width:217,borderWidth:1,borderRadius:9,padding:10},
 historyHeading:{fontSize:12,fontWeight:'900',marginBottom:4},
 historyText:{fontSize:11,fontWeight:'700',lineHeight:16},
 historyMeta:{fontSize:10,lineHeight:15,marginTop:6}
});
