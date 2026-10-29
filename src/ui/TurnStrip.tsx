import React from 'react';
import {ScrollView,View,Pressable,Text,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import {TURNOS} from '../domain';
import {useLaloTheme} from './LaloTheme';
export default function TurnStrip({value,onChange}:{
 value:Turno;onChange:(next:Turno)=>void
}){
 const {colors:c}=useLaloTheme();
 return <ScrollView horizontal showsHorizontalScrollIndicator={false}
  contentContainerStyle={s.container} style={s.outer}>
  {TURNOS.map(t=><Pressable key={t} accessibilityRole="tab"
   accessibilityState={{selected:value===t}}
   onPress={()=>onChange(t)} style={[s.tab,{backgroundColor:value===t?c.accent:c.card,borderColor:value===t?'#F5D37C':c.border}]}>
   <Text style={[s.text,{color:value===t?'#092750':c.subtext}]}>{t}</Text>
  </Pressable>)}
 </ScrollView>;
}
const s=StyleSheet.create({
 outer:{flexGrow:0},
 container:{flexDirection:'row',gap:6,paddingVertical:4,paddingRight:10},
 tab:{paddingHorizontal:13,paddingVertical:10,borderRadius:24,
  borderWidth:1,borderColor:'#d4c9df',backgroundColor:'#fff'},
 active:{backgroundColor:'#413269',borderColor:'#413269'},
 text:{fontSize:11,fontWeight:'800',color:'#604f75'},
 activeText:{color:'#fff'}
});
