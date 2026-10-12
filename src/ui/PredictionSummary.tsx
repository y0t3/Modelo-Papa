import React,{useEffect,useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {LaloView,LaloKind} from '../motorLalo';
import {KIND_COLOR} from './visualTokens';

const explanations:Record<string,string>={
 EN_FORMACIÓN:'En formación',
 EN_SEGUIMIENTO:'Con antecedentes',
 CON_APOYO:'Con varios apoyos'
};
export default function PredictionSummary({date,turn,view,onFocus,post}:{
 date:string;turn:Turno;view:LaloView|null;
 onFocus:(id:string)=>void;post?:Record<LaloKind,string[]>|null
}){
 const [limit,setLimit]=useState<3|5|10>(3);
 useEffect(()=>setLimit(3),[date,turn]);
 return <View style={s.surface}>
  <Text style={s.title}>PREDICCIÓN · MODELO LALO</Text>
  <Text style={s.subtitle}>{date} · {turn}</Text>
  <Text style={s.caution}>Propuestas experimentales calculadas sólo con antecedentes anteriores al turno. El puesto no representa una probabilidad demostrada.</Text>
  <View style={s.tabs}>{([3,5,10] as const).map(n=>
   <Pressable key={n} onPress={()=>setLimit(n)} style={[s.tab,limit===n&&s.tabOn]}>
    <Text style={[s.tabText,limit===n&&s.tabTextOn]}>Top {n}</Text>
   </Pressable>)}</View>
  {(['vt2','vt3','vt4'] as LaloKind[]).map(kind=><View key={kind} style={s.section}>
   <Text style={[s.heading,{color:KIND_COLOR[kind].line}]}>{kind.toUpperCase()} · {KIND_COLOR[kind].label}</Text>
   {view?.ranks[kind].slice(0,limit).map(f=><Pressable key={f.family}
    onPress={()=>onFocus(kind+'|'+f.family)} style={s.family}>
    <Text style={s.rank}>{f.rank}</Text>
    <View style={{flex:1}}>
     <Text style={s.familyName}>{f.family}</Text>
     <Text style={s.detail}>{explanations[f.state]} · {f.rationale}</Text>
    </View>
    <Text style={s.open}>Ver ›</Text>
   </Pressable>)}
   {!view?<Text style={s.empty}>Cargá una hoja para generar candidatos.</Text>:
    !view.ranks[kind].length?<Text style={s.empty}>Sin candidatos con recorrido físico válido y antecedentes suficientes.</Text>:null}
   {post&&view?<Text style={s.post}>Comprobación POST de los diez primeros: {post[kind].length?post[kind].join(' · '):'sin coincidencias'}. No interviene en la selección.</Text>:null}
  </View>)}
 </View>;
}
const s=StyleSheet.create({
 surface:{backgroundColor:'#f7f4f8',borderRadius:13,padding:14,marginTop:10},
 title:{fontSize:18,fontWeight:'900',color:'#382946'},
 subtitle:{fontSize:12,fontWeight:'800',color:'#644777',marginTop:4},
 caution:{fontSize:11,color:'#7c7182',lineHeight:16,marginTop:8},
 tabs:{flexDirection:'row',gap:6,marginVertical:12},
 tab:{flex:1,alignItems:'center',paddingVertical:8,borderRadius:8,borderWidth:1,borderColor:'#d4c8e0'},
 tabOn:{backgroundColor:'#49316e'},
 tabText:{fontWeight:'800',color:'#6b527c',fontSize:12},
 tabTextOn:{color:'#fff'},
 section:{borderTopWidth:1,borderTopColor:'#e1d8e8',paddingTop:13,marginTop:9},
 heading:{fontSize:15,fontWeight:'900',marginBottom:8},
 family:{backgroundColor:'#fff',borderRadius:9,borderWidth:1,borderColor:'#e2d7e7',
  padding:10,flexDirection:'row',gap:10,alignItems:'center',marginBottom:7},
 rank:{fontSize:15,fontWeight:'900',color:'#77509e'},
 familyName:{fontSize:18,fontWeight:'900',color:'#2e1c3c'},
 detail:{fontSize:10,color:'#716579',marginTop:3,lineHeight:15},
 open:{fontSize:11,color:'#79529e',fontWeight:'800'},
 empty:{fontSize:11,color:'#7e7387',lineHeight:17,marginVertical:5},
 post:{fontSize:11,color:'#5e5671',backgroundColor:'#eee7f4',borderRadius:7,padding:9,marginTop:6}
});
