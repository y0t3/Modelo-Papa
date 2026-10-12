import React,{useEffect,useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {PredictiveView} from '../predictive';
import type {AnalysisResult} from '../analysisEngine';

const plain=(state:string)=>({
 NACE:'En formación',OBSERVAR:'En observación',CONFIRMA:'Con apoyo',ACTIVA:'Con actividad',
 DECAE:'Perdiendo actividad',MUERE:'Sin actividad reciente'
} as Record<string,string>)[state]||'En estudio';

/** No calcula predicciones: expone SOLO el orden vigente de buildPredictive. */
export default function PredictionSummary({date,turn,view,analysis,onFocus}:{
 date:string;turn:Turno;view:PredictiveView|null;analysis:AnalysisResult|null;
 onFocus:(family:string)=>void
}){
 const [limit,setLimit]=useState<3|5|10>(3);
 useEffect(()=>{setLimit(3)},[date,turn]);
 return <View style={s.surface}>
  <Text style={s.title}>PREDICCIÓN · {date||'Fecha pendiente'}</Text>
  <Text style={s.subtitle}>Turno: {turn} · motor semanal actual</Text>
  <Text style={s.caution}>Familias y recorridos experimentales. No indican una probabilidad de acierto demostrada.</Text>
  <View style={s.group}>
   <Text style={s.section}>VT3 · Tres cifras</Text>
   <Text style={s.small}>{analysis?('Lectura del motor: '+analysis.decision+' · '+analysis.reason):'Cargá una hoja para analizar este turno.'}</Text>
   <View style={s.tabs}>{([3,5,10] as const).map(n=>
    <Pressable key={n} onPress={()=>setLimit(n)} style={[s.tab,limit===n&&s.tabOn]}>
     <Text style={[s.tabText,limit===n&&s.tabTextOn]}>Top {n}</Text>
    </Pressable>)}</View>
   {view?.hotFamilies.slice(0,limit).map((f,i)=><Pressable key={f.family}
    onPress={()=>onFocus(f.family)} style={s.family}>
    <Text style={s.position}>{i+1}</Text>
    <View style={{flex:1}}>
     <Text style={s.familyName}>{f.family}</Text>
     <Text style={s.detail}>{plain(f.state)} · {f.support} fuente(s) · {f.templates} forma(s)</Text>
    </View>
    <Text style={s.more}>Ver hoja ›</Text>
   </Pressable>)}
   {view&&view.hotFamilies.length===0?<Text style={s.small}>No hay familias VT3 con respaldo disponible para este turno.</Text>:null}
  </View>
  <View style={s.pending}>
   <Text style={s.section}>VT2 · Dos cifras</Text>
   <Text style={s.small}>Se detectan sus coincidencias físicas, pero este selector semanal no dispone todavía de un Top VT2 independiente.</Text>
  </View>
  <View style={s.pending}>
   <Text style={s.section}>VT4 · Cuatro cifras</Text>
   <Text style={s.small}>Podemos comprobar sus recorridos; la selección anticipada de la cuarta cifra y la hija correcta sigue en investigación. No se publican Tops inventados.</Text>
  </View>
 </View>;
}
const s=StyleSheet.create({
 surface:{backgroundColor:'#f7f4f8',borderRadius:14,padding:15,marginTop:9},
 title:{color:'#2b2038',fontSize:19,fontWeight:'900'},
 subtitle:{color:'#604971',fontSize:13,fontWeight:'800',marginTop:5},
 caution:{color:'#786c82',fontSize:11,lineHeight:17,marginTop:7},
 group:{marginTop:16},
 section:{fontWeight:'900',fontSize:15,color:'#372744',marginBottom:5},
 small:{color:'#716477',fontSize:11,lineHeight:17},
 tabs:{flexDirection:'row',gap:7,marginVertical:12},
 tab:{flex:1,alignItems:'center',paddingVertical:8,borderRadius:8,borderColor:'#d6ccdf',borderWidth:1},
 tabOn:{backgroundColor:'#49316e',borderColor:'#49316e'},
 tabText:{fontSize:12,fontWeight:'800',color:'#59466f'},
 tabTextOn:{color:'#fff'},
 family:{flexDirection:'row',alignItems:'center',gap:11,padding:12,backgroundColor:'#fff',
  borderRadius:10,borderWidth:1,borderColor:'#e6ddec',marginBottom:6},
 position:{color:'#7953a2',fontWeight:'900',fontSize:16},
 familyName:{color:'#251932',fontSize:18,fontWeight:'900'},
 detail:{fontSize:10,color:'#72667c',marginTop:4},
 more:{fontSize:10,fontWeight:'800',color:'#693c94'},
 pending:{borderTopWidth:1,borderTopColor:'#ded4e6',marginTop:15,paddingTop:12}
});
