import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {PredictiveView} from '../predictive';
import type {RouteLife} from '../routeLife';
import {KIND_COLOR,KINDS} from './visualTokens';

const explanations:Record<string,string>={
 ACTIVA:'Con más actividad en el tablero',
 CONFIRMA:'Con apoyo de varias fuentes',
 OBSERVAR:'En observación',
 NACE:'En formación'
};

/** Los estados describen recorridos: no representan probabilidades de acierto. */
export default function InfoDashboard({turn,view,lives,onDetails}:{
 turn:Turno;view:PredictiveView|null;lives:RouteLife[];onDetails:()=>void
}){
 const families=view?.hotFamilies||[];
 const active=families.filter(f=>f.state==='ACTIVA'||f.state==='CONFIRMA').slice(0,5);
 const newOnes=families.filter(f=>f.state==='NACE'||f.state==='OBSERVAR').slice(0,5);
 const cooling=lives.filter(l=>l.state==='DECAE'||l.state==='MUERE').length;
 return <View style={s.surface}>
  <Text style={s.title}>PANORAMA DEL MOTOR</Text>
  <Text style={s.subtitle}>Turno {turn} · lectura simple de las figuras</Text>
  <Text style={s.warning}>Estos estados expresan actividad geométrica observada. No predicen con certeza un resultado ni son porcentajes de éxito.</Text>
  <View style={s.section}>
   <Text style={s.heading}>Familias con más actividad</Text>
   {active.length?active.map((f,i)=><View key={f.family} style={s.family}>
    <Text style={s.rank}>{i+1}</Text><View style={{flex:1}}>
     <Text style={s.digits}>{f.family}</Text>
     <Text style={s.detail}>{explanations[f.state]||'En estudio'} · {f.support} fuente(s)</Text>
    </View>
   </View>):<Text style={s.noData}>Aún no se identificaron familias con ese nivel de respaldo para el turno.</Text>}
  </View>
  <View style={s.section}>
   <Text style={s.heading}>Familias en formación o seguimiento</Text>
   {newOnes.length?newOnes.map(f=><View key={f.family} style={s.compact}>
    <Text style={s.digits}>{f.family}</Text>
    <Text style={s.detail}>{explanations[f.state]||'En estudio'}</Text>
   </View>):<Text style={s.noData}>Sin familias nuevas o en observación en esta lectura.</Text>}
  </View>
  <View style={s.section}>
   <Text style={s.heading}>Figuras que van perdiendo actividad</Text>
   <Text style={s.noData}>{cooling} forma(s) históricas están en pausa o sin continuidad reciente.</Text>
   <Text style={s.detail}>Todavía no asociamos esas formas que decaen a nombres concretos de familias VT3: hacerlo requeriría un seguimiento validado por fuente y fecha.</Text>
  </View>
  <View style={s.section}>
   <Text style={s.heading}>Cómo leer los colores</Text>
   <View style={s.legend}>{KINDS.map(k=><View key={k} style={s.legendItem}>
    <View style={{width:16,height:16,borderRadius:4,borderWidth:2,
     borderColor:KIND_COLOR[k].line,backgroundColor:KIND_COLOR[k].fill}}/>
    <Text style={s.legendText}>{k.toUpperCase()}: {KIND_COLOR[k].label}</Text>
   </View>)}</View>
   <Text style={s.noData}>Las líneas que tapaban números se reemplazaron por rellenos y marcas de borde. Las rutas completas pueden verse tocando la cabeza o la familia.</Text>
  </View>
  <Pressable onPress={onDetails} accessibilityRole="button" style={s.button}>
   <Text style={s.buttonText}>Ver análisis técnico completo</Text>
  </Pressable>
 </View>;
}
const s=StyleSheet.create({
 surface:{backgroundColor:'#f7f4f8',borderRadius:13,padding:16,marginTop:9},
 title:{color:'#342542',fontSize:19,fontWeight:'900'},
 subtitle:{color:'#635271',fontSize:12,marginTop:3},
 warning:{fontSize:11,lineHeight:17,color:'#806984',marginTop:11,padding:9,
  backgroundColor:'#eee6f2',borderRadius:8},
 section:{marginTop:16,borderTopWidth:1,borderTopColor:'#e4dce9',paddingTop:13},
 heading:{fontSize:14,fontWeight:'900',color:'#4a335c',marginBottom:9},
 family:{flexDirection:'row',gap:10,alignItems:'center',backgroundColor:'#fff',
  borderWidth:1,borderColor:'#e7deec',borderRadius:9,padding:10,marginBottom:7},
 rank:{color:'#76529c',fontWeight:'900',fontSize:15},
 digits:{color:'#2e2141',fontSize:17,fontWeight:'900'},
 detail:{color:'#7a6e81',fontSize:10,lineHeight:16,marginTop:3},
 compact:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:10,
  borderRadius:9,backgroundColor:'#fff',marginBottom:6,gap:10},
 noData:{color:'#716378',fontSize:11,lineHeight:17},
 legend:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:9},
 legendItem:{flexDirection:'row',alignItems:'center',gap:5},
 legendText:{fontSize:10,color:'#61506e'},
 button:{backgroundColor:'#593685',padding:12,borderRadius:9,marginTop:18},
 buttonText:{color:'#fff',textAlign:'center',fontWeight:'900',fontSize:12}
});
