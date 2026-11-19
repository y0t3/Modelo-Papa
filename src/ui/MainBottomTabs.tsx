import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {useLaloTheme} from './LaloTheme';

/** Barra fija: las otras pantallas siguen disponibles desde las cuatro entradas. */
export type MainTab='inicio'|'hoja'|'prediccion'|'info';
type Props={active:MainTab;onChange:(tab:MainTab)=>void};
const items:{id:MainTab;icon:string;label:string}[]=[
 {id:'inicio',icon:'⌂',label:'Inicio'},
 {id:'hoja',icon:'▦',label:'Hojas'},
 {id:'prediccion',icon:'★',label:'Candidatos'},
 {id:'info',icon:'▥',label:'Estudio'}
];
export default function MainBottomTabs({active,onChange}:Props){
 const {colors:c}=useLaloTheme();
 return <View style={[s.row,{backgroundColor:c.surface,borderTopColor:c.accent}]}>
  {items.map(item=>{
   const selected=active===item.id;
   return <Pressable key={item.id} accessibilityRole="tab"
    accessibilityLabel={item.label}
    accessibilityState={{selected}}
    onPress={()=>onChange(item.id)}
    style={[s.tab,{backgroundColor:selected?c.accentFill:'transparent'}]}>
    <Text style={[s.icon,{color:selected?c.accent:c.subtext}]}>{item.icon}</Text>
    <Text numberOfLines={1} style={[s.label,{
     color:selected?c.accent:c.subtext,fontWeight:selected?'900':'700'
    }]}>{item.label}</Text>
   </Pressable>;
  })}
 </View>;
}
const s=StyleSheet.create({
 row:{flexDirection:'row',paddingHorizontal:5,paddingVertical:5,
  borderTopWidth:1.5,minHeight:62},
 tab:{flex:1,minWidth:0,alignItems:'center',justifyContent:'center',
  paddingVertical:4,borderRadius:11,gap:1},
 icon:{fontSize:24,fontWeight:'900',lineHeight:27},
 label:{fontSize:11}
});
