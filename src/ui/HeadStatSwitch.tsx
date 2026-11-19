import React from 'react';
import {View,Pressable,Text} from 'react-native';
import type {StatMode} from '../headStats';
import {STAT_MODE_LABELS} from '../headStats';
import {useLaloTheme} from './LaloTheme';
const modes:StatMode[]=['atrasados','frios','calientes','recientes'];
export default function HeadStatSwitch({mode,onMode}:{mode:StatMode;
 onMode:(mode:StatMode)=>void}){
 const {colors:c}=useLaloTheme();
 return <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>
  {modes.map(x=><Pressable key={x} accessibilityRole="button"
   accessibilityState={{selected:x===mode}} onPress={()=>onMode(x)}
   style={{borderWidth:1.2,borderRadius:18,paddingVertical:8,
    paddingHorizontal:11,borderColor:x===mode?c.accent:c.border,
    backgroundColor:x===mode?c.accentFill:c.surfaceAlt}}>
   <Text style={{fontWeight:'900',fontSize:11,
    color:x===mode?c.accent:c.text}}>{STAT_MODE_LABELS[x]}</Text>
  </Press>)}
 </View>;
}
