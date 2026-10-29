import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {Turno} from '../domain';
import type {InfoVisualDay} from '../infoTurnHistory';
import type {PanoramaRoute} from '../panoramaModel';
import {shapeWitnesses} from '../shapeWitnesses';
import RouteMiniBoard from './RouteMiniBoard';
import {useLaloTheme} from './LaloTheme';

export default function PhysicalShapeHistory({route,sheet,date,turn,days}:{
 route:PanoramaRoute;sheet:DailySheet;date:string;turn:Turno;
 days:InfoVisualDay[]
}){
 const {colors:c,kinds}=useLaloTheme();
 const [expanded,setExpanded]=useState(false);
 const [all,setAll]=useState(false);
 const witnesses=useMemo(()=>shapeWitnesses(date,turn,route,sheet,days),
  [date,turn,route,sheet,days]);
 const column=sheet.columns.find(c=>c.id===route.sourceId);
 if(!column)return null;
 const currentValue=route.cells.map(p=>column.values[p.row]?.[p.col]||'?').join('');
 const shown=all?witnesses:witnesses.slice(0,6);
 return <View style={[s.wrap,{borderColor:kinds[route.kind].line,backgroundColor:c.card}]}>
  <Text style={{color:kinds[route.kind].line,fontWeight:'900',fontSize:12}}>
   1 · LA FORMA · {route.kind.toUpperCase()}
  </Text>
  <Text style={[s.desc,{color:c.text}]}>
   Miramos el camino de casillas, no la familia numérica. La misma silueta
   pudo formar otras cifras y aparecer en otra fuente o fila.
  </Text>
  <Text style={[s.desc,{color:c.subtext}]}>
   La forma actual lee {currentValue} · {witnesses.length} recorrido(s)
   ganadores anteriores con esa silueta. Esto es memoria visual, no votos del motor.
  </Text>
  <Pressable accessibilityRole="button" accessibilityState={{expanded}}
   onPress={()=>setExpanded(x=>!x)}
   style={[s.control,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
   <Text style={{color:c.accent,fontWeight:'900',fontSize:11}}>
    {expanded?'▾ Ocultar comparación de formas':
     '▸ Ver dónde se dio esta misma forma ('+witnesses.length+')'}
   </Text>
  </Pressable>
  {expanded?<View style={{gap:9}}>
   <View style={{gap:6}}>
    <Text style={[s.heading,{color:c.text}]}>AHORA · PRE · {date}</Text>
    <RouteMiniBoard values={column.values} cells={route.cells} kind={route.kind}/>
    <Text style={[s.desc,{color:c.subtext}]}>
     {column.sourceLabel} · lectura {currentValue} ·
     {route.cells.map((p,i)=>(i+1)+'. F'+(p.row+1)+(p.col?'D':'I')).join(' → ')}
    </Text>
   </View>
   {witnesses.length?<ScrollView horizontal nestedScrollEnabled
    showsHorizontalScrollIndicator contentContainerStyle={s.gallery}>
    {shown.map(w=><View key={w.id}
     style={[s.card,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.heading,{color:c.text}]}>
      ANTES · {w.date} · {w.turn}
     </Text>
     <Text style={[s.desc,{color:c.subtext}]}>
      Cabeza real {w.jurisdiction} {w.head} · formó {w.reading}
     </Text>
     <RouteMiniBoard values={w.values} cells={w.cells} kind={route.kind} compact/>
     <Text style={[s.desc,{color:c.subtext}]}>
      {w.sourceLabel} → {column.sourceLabel}
     </Text>
     <Text style={[s.desc,{color:c.text}]}>
      Misma silueta · {w.rowShift===0?'misma altura':
       'desplazada '+Math.abs(w.rowShift)+' fila(s) '+(w.rowShift<0?'arriba':'abajo')}
      {w.sourceChanged?' · cambió de columna fuente':''}.
     </Text>
     <Text style={[s.desc,{color:c.subtext}]}>
      Forma {w.cells.map((p,i)=>(i+1)+'. F'+(p.row+1)+(p.col?'D':'I')).join(' → ')}
     </Text>
    </View>)}
   </ScrollView>:<Text style={[s.desc,{color:c.muted}]}>
    Esta silueta no tiene cabezas ganadoras anteriores comprobadas en las
    seis jornadas disponibles. No dibujamos un antecedente inventado.
   </Text>}
   {!all&&witnesses.length>6?<Pressable accessibilityRole="button"
    onPress={()=>setAll(true)} style={[s.control,{borderColor:c.border}]}>
    <Text style={{color:c.accent,fontWeight:'800'}}>
     Ver los {witnesses.length-6} recorridos históricos restantes
    </Text>
   </Pressable>:null}
   <Text style={[s.desc,{color:c.muted}]}>
    Los números anteriores sólo indican qué salió en esos caminos.
    Que la figura se repita no demuestra que vaya a salir hoy.
   </Text>
  </View>:null}
 </View>;
}
const s=StyleSheet.create({
 wrap:{marginTop:11,borderRadius:10,borderWidth:1,padding:10,gap:7},
 desc:{fontSize:10,lineHeight:16},heading:{fontSize:12,fontWeight:'900'},
 control:{borderWidth:1,borderRadius:8,padding:10,alignSelf:'flex-start'},
 gallery:{gap:8,paddingBottom:6},card:{width:255,borderRadius:8,borderWidth:1,padding:9,gap:6}
});
