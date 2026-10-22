import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {AuxMode} from '../auxTemporalModes';
import {useLaloTheme} from './LaloTheme';

/** Un selector compartido por HOJA, PREDICTIVA, PREDICCIÓN y CABEZAS. */
export default function AuxModeSwitch({value,onChange}:{
 value:AuxMode;onChange:(next:AuxMode)=>void
}){
 const {colors:c}=useLaloTheme();
 return <View style={[s.container,{borderColor:c.border,backgroundColor:c.surface}]}>
  <Text style={[s.label,{color:c.subtext}]}>SANTIAGO–NEUQUÉN · ORIGEN AUXILIAR</Text>
  <View style={s.row}>{([
   {id:'intrajornada',label:'HOY · DINÁMICA'},
   {id:'anterior',label:'AYER · BASE'}
  ] as const).map(choice=><Pressable key={choice.id}
   accessibilityRole="button" accessibilityLabel={'Elegir hoja '+choice.label}
   accessibilityState={{selected:value===choice.id}}
   onPress={()=>onChange(choice.id)}
   style={[s.option,{borderColor:value===choice.id?c.accent:c.border,
    backgroundColor:value===choice.id?c.accentFill:c.card}]}>
   <Text style={[s.optionText,{color:value===choice.id?c.accent:c.text}]}>
    {value===choice.id?'✓ ':''}{choice.label}
   </Text>
  </Pressable>)}</View>
 </View>;
}
const s=StyleSheet.create({
 container:{borderWidth:1,borderRadius:10,padding:7,gap:5,marginVertical:5},
 label:{fontSize:10,fontWeight:'900'},
 row:{flexDirection:'row',gap:6},
 option:{flex:1,borderWidth:1,borderRadius:8,paddingVertical:10,
  alignItems:'center',justifyContent:'center'},
 optionText:{fontWeight:'900',fontSize:10,textAlign:'center'}
});
