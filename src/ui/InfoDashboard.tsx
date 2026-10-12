import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {LaloView,LaloKind} from '../motorLalo';
import {KINDS,KIND_COLOR} from './visualTokens';

export default function InfoDashboard({turn,view}:{turn:Turno;view:LaloView|null}){
 return <View style={s.surface}>
  <Text style={s.title}>MODELO LALO · PANORAMA</Text>
  <Text style={s.sub}>Turno {turn} · tres modalidades, un solo motor</Text>
  <Text style={s.warning}>La actividad de una familia describe sus recorridos y antecedentes, no su probabilidad de salir.</Text>
  {(['vt2','vt3','vt4'] as LaloKind[]).map(k=><View key={k} style={s.section}>
   <Text style={[s.heading,{color:KIND_COLOR[k].line}]}>{k.toUpperCase()} · {KIND_COLOR[k].label}</Text>
   <Text style={s.note}>{view?.ranks[k].length||0} familias físicas candidatas</Text>
   {view?.ranks[k].slice(0,5).map(f=><View key={f.family} style={s.family}>
    <Text style={s.number}>{f.family}</Text>
    <Text style={s.note}>{f.state==='CON_APOYO'?'Con varios apoyos':
     f.state==='EN_SEGUIMIENTO'?'Con antecedentes':'En formación'} · {f.sourceCount} fuente(s)</Text>
   </View>)}
  </View>)}
  <View style={s.section}>
   <Text style={s.heading}>Familias que están decayendo</Text>
   <Text style={s.note}>Todavía no hay una clasificación temporal validada por familia. No vamos a presentar un decaimiento supuesto como si fuera una señal comprobada.</Text>
  </View>
  <View style={s.section}>
   <Text style={s.heading}>Colores de la hoja</Text>
   <View style={s.legend}>{KINDS.map(k=><View key={k} style={s.legendItem}>
    <View style={{width:15,height:15,borderRadius:3,borderWidth:2,
     borderColor:KIND_COLOR[k].line,backgroundColor:KIND_COLOR[k].fill}}/>
    <Text style={s.note}>{k.toUpperCase()}</Text>
   </View>)}</View>
   <Text style={s.note}>Los recorridos se destacan por rellenos y bordes, sin tapar las cifras; el detalle permite seguir su orden.</Text>
  </View>
 </View>;
}
const s=StyleSheet.create({
 surface:{backgroundColor:'#f7f4f8',borderRadius:12,padding:15,marginTop:10},
 title:{color:'#382744',fontSize:18,fontWeight:'900'},sub:{color:'#715c80',fontSize:12,marginTop:4},
 warning:{color:'#796d81',fontSize:11,lineHeight:17,padding:10,marginTop:10,
  backgroundColor:'#eee6f2',borderRadius:8},
 section:{marginTop:16,borderTopWidth:1,borderTopColor:'#e1d8e8',paddingTop:12},
 heading:{fontSize:14,fontWeight:'900',color:'#49315e'},
 note:{color:'#71657b',fontSize:11,lineHeight:17,marginTop:3},
 family:{marginTop:7,padding:9,borderRadius:9,backgroundColor:'#fff'},
 number:{color:'#2b1b39',fontSize:16,fontWeight:'900'},
 legend:{flexDirection:'row',gap:12,flexWrap:'wrap',marginVertical:8},
 legendItem:{flexDirection:'row',gap:5,alignItems:'center'}
});
