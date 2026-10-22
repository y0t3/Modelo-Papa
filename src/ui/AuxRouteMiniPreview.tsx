import React,{useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {AuxiliaryBoard,AuxPath} from '../auxSantiagoNeuquen';
import type {AuxVisualRoute,AuxVisualKind,AuxVisualAntecedent} from '../auxVisualModel';
import {AUX_SOURCE_TURNS} from '../auxSantiagoNeuquen';
import {useLaloTheme} from './LaloTheme';
const cellId=(x:{row:number;col:number})=>x.row+':'+x.col;
/** Mini captura 2×12: números, sentido de lectura y casillas reales.
 * No simula un GIF: muestra orden 1→2→3→4 y su antecedente por separado.
 */
export function AuxMiniBoard({board,path,kind,compact=false}:{
 board:AuxiliaryBoard;path:AuxPath;kind:AuxVisualKind;compact?:boolean
}){
 const {colors:c,kinds}=useLaloTheme();
 const active=new Map(path.map((cell,i)=>[cellId(cell),i+1]));
 const lookup=new Map(board.cells.map(cell=>[cellId(cell),cell]));
 const size=compact?21:25;
 return <View style={{gap:4}}>
  <View style={{flexDirection:'row'}}>
   <View style={{width:42}}/>
   {AUX_SOURCE_TURNS.map(t=><Text key={t} style={{
    width:size*4,fontSize:compact?8:9,fontWeight:'800',textAlign:'center',
    color:board.visibleTurns.includes(t)?c.text:c.muted}}>{t}</Text>)}
  </View>
  {([0,1] as const).map(row=><View key={row} style={{flexDirection:'row'}}>
   <Text numberOfLines={1} adjustsFontSizeToFit style={{
    width:42,color:c.subtext,fontSize:9,fontWeight:'700',alignSelf:'center'
   }}>{row?'Neuquén':'Santiago'}</Text>
   {Array.from({length:12},(_,col)=>{
    const id=row+':'+col,n=lookup.get(id),step=active.get(id);
    return <View key={id} style={{
     width:size,height:compact?23:29,borderWidth:step?2:1,
     borderColor:step?kinds[kind].line:c.border,
     backgroundColor:step?kinds[kind].fill:n?c.cell:c.surfaceAlt,
     borderRadius:3,justifyContent:'center',alignItems:'center'
    }}>
     <Text style={{fontWeight:'900',fontSize:compact?10:12,
      color:step?kinds[kind].text:n?c.text:c.muted}}>{n?.digit||'·'}</Text>
     {step?<Text style={{position:'absolute',right:1,top:0,
      fontSize:6,fontWeight:'900',color:kinds[kind].line}}>{step}</Text>:null}
    </View>;
   })}
  </View>)}
 </View>;
}
function HistoricalShape({event,kind}:{
 event:AuxVisualAntecedent;kind:AuxVisualKind
}){
 const {colors:c}=useLaloTheme();
 const old={target:event.turn,visibleTurns:AUX_SOURCE_TURNS,
  input:null as never,cells:[] as AuxPath,columns:[]};
 // Solo la forma y sus cifras comprobadas; no presentar tablero antiguo
 // completo si las otras celdas no están disponibles en el testigo.
 const seen=new Map(event.path.map(cell=>[cellId(cell),cell]));
 const pathBoard={...old,cells:[...seen.values()]};
 return <View style={[s.history,{backgroundColor:c.card,borderColor:c.border}]}>
  <Text style={[s.head,{color:c.text}]}>
   {event.period} · {event.date} · {event.jur}
  </Text>
  <Text style={[s.hint,{color:c.subtext}]}>
   {event.turn}: salió {event.head}, terminación marcada {event.reading}.
  </Text>
  <AuxMiniBoard board={pathBoard} path={event.path} kind={kind} compact/>
  <Text style={[s.hint,{color:c.text}]}>{event.relation}</Text>
 </View>;
}
export default function AuxRouteMiniPreview({board,route}:{
 board:AuxiliaryBoard;route:AuxVisualRoute
}){
 const {colors:c,kinds}=useLaloTheme(),[expanded,setExpanded]=useState(false);
 const crossing=new Set(route.cells.map(x=>x.source)).size>1;
 return <View style={[s.card,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
  <Text style={[s.head,{color:kinds[route.kind].line}]}>
   Recorrido actual · {route.kind.toUpperCase()} · {route.reading}
  </Text>
  <AuxMiniBoard board={board} path={route.cells} kind={route.kind}/>
  <Text style={[s.hint,{color:c.text}]}>
   Camino: {route.cells.map((x,i)=>String(i+1)+' '+
    (x.row===0?'Santiago':'Neuquén')+' '+x.source+' casilla '+(x.col%4+1)).join(' → ')}.
   {crossing?' Cruza franjas contiguas mediante contacto físico.':''}
  </Text>
  {route.rootEvents.length?<View style={{gap:6}}>
   <Pressable accessibilityRole="button"
    accessibilityState={{expanded}}
    onPress={()=>setExpanded(x=>!x)}
    style={[s.button,{borderColor:c.border,backgroundColor:c.card}]}>
    <Text style={{color:c.accent,fontWeight:'900',fontSize:11}}>
     {expanded?'▾ Ocultar':'▸ Ver'} origen de los recorridos ({route.rootEvents.length})
    </Text>
   </Pressable>
   {expanded?<ScrollView horizontal nestedScrollEnabled
    contentContainerStyle={{gap:8,paddingBottom:7}}>
    {route.rootEvents.map(e=><HistoricalShape key={e.id} event={e} kind={route.kind}/>)}
   </ScrollView>:null}
  </View>:null}
 </View>;
}
const s=StyleSheet.create({
 card:{borderWidth:1,borderRadius:11,padding:10,gap:9,marginTop:7},
 head:{fontSize:12,fontWeight:'900'},
 hint:{fontSize:10,lineHeight:16},
 button:{padding:10,borderWidth:1,borderRadius:8},
 history:{width:355,borderWidth:1,borderRadius:9,padding:9,gap:7}
});
