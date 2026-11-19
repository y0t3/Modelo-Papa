import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {useLaloTheme} from './LaloTheme';

export type MainSpace='inicio'|'hoja'|'prediccion'|'info';
const tabs:{id:MainSpace;label:string;icon:string}[]=[
 {id:'inicio',label:'Inicio',icon:'⌂'},
 {id:'hoja',label:'Hojas',icon:'▦'},
 {id:'prediccion',label:'Candidatos',icon:'★'},
 {id:'info',label:'Estudio',icon:'▥'}
];
export default function MainBottomTabs({active,onSelect}:{
 active:MainSpace;onSelect:(next:MainSpace)=>void
}){
 const {colors:c}=useLaloTheme();
 return <View accessibilityRole="tablist"
  style={[s.bar,{backgroundColor:c.surface,borderTopColor:c.accent}]}>
  {tabs.map(tab=><Pressable key={tab.id} accessibilityRole="tab"
   accessibilityLabel={'Abrir '+tab.label}
   accessibilityState={{selected:active===tab.id}}
   onPress={()=>onSelect(tab.id)} style={[s.tab,{
    backgroundColor:active===tab.id?c.accentFill:'transparent'
   }]}>
   <Text style={[s.icon,{color:active===tab.id?c.accent:c.subtext}]}>{tab.icon}</Text>
   <Text numberOfLines={1} style={[s.label,{
    color:active===tab.id?c.accent:c.subtext
   }]}>{tab.label}</Text>
  </Pressable>)}
 </View>;
}
const s=StyleSheet.create({
 bar:{borderTopWidth:1.5,flexDirection:'row',paddingTop:5,
  paddingBottom:7,paddingHorizontal:7,gap:4},
 tab:{flex:1,minWidth:0,minHeight:49,paddingHorizontal:2,
  borderRadius:10,alignItems:'center',justifyContent:'center',gap:1},
 icon:{fontWeight:'900',fontSize:21,lineHeight:25},
 label:{fontSize:10,fontWeight:'900'}
});