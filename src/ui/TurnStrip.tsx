import React from 'react';
import {ScrollView,View,Pressable,Text,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import {TURNOS} from '../domain';
export default function TurnStrip({value,onChange}:{
 value:Turno;onChange:(next:Turno)=>void
}){
 return <ScrollView horizontal showsHorizontalScrollIndicator={false}
  contentContainerStyle={s.container} style={s.outer}>
  {TURNOS.map(t=><Pressable key={t} accessibilityRole="tab"
   accessibilityState={{selected:value===t}}
   onPress={()=>onChange(t)} style={[s.tab,value===t&&s.active]}>
   <Text style={[s.text,value===t&&s.activeText]}>{t}</Text>
  </Pressable>)}
 </ScrollView>;
}
const s=StyleSheet.create({
 outer:{flexGrow:0},
 container:{flexDirection:'row',gap:6,paddingVertical:4,paddingRight:10},
 tab:{paddingHorizontal:13,paddingVertical:9,borderRadius:20,
  borderWidth:1,borderColor:'#d4c9df',backgroundColor:'#fff'},
 active:{backgroundColor:'#413269',borderColor:'#413269'},
 text:{fontSize:11,fontWeight:'800',color:'#604f75'},
 activeText:{color:'#fff'}
});
