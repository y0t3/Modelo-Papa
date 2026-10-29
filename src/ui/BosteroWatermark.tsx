import React from 'react';
import {StyleSheet,View} from 'react-native';
import Svg,{Defs,LinearGradient,Stop,Path,Circle} from 'react-native-svg';
import BocaShieldImage from './BocaShieldImage';

/** Una sola imagen auténtica del escudo para toda la app.
 * Marca de agua únicamente en encabezados, nunca detrás de cifras.
 */
export default function BosteroWatermark({opacity=.17}:{opacity?:number}){
 return <View pointerEvents="none" style={[s.outer,{opacity}]}>
  <Svg width={175} height={125} viewBox="0 0 175 125"
   style={StyleSheet.absoluteFill}>
   <Defs><LinearGradient id="goldenBrush" x1="0" y1="0" x2="1" y2="1">
    <Stop offset="0" stopColor="#F4C454" stopOpacity=".01"/>
    <Stop offset=".6" stopColor="#E6AF3C" stopOpacity=".55"/>
    <Stop offset="1" stopColor="#F4C454" stopOpacity=".18"/>
   </LinearGradient></Defs>
   <Path d="M-10 110Q55 66 175 58L175 76Q80 80-10 120Z"
    fill="url(#goldenBrush)"/>
   <Path d="M6 120Q90 72 177 103" stroke="#F6CC63"
    strokeWidth={2} opacity={.58} fill="none"/>
   <Circle cx={25} cy={71} r={18} fill="#164C8A"
    stroke="#F0C253" strokeWidth={3}/>
  </Svg>
  <View style={s.crest}>
   <BocaShieldImage width={83} height={99}/>
  </View>
 </View>;
}
const s=StyleSheet.create({
 outer:{position:'absolute',right:5,top:-10,width:175,height:125,zIndex:0},
 crest:{position:'absolute',right:8,top:4,width:83,height:99,
  alignItems:'center',justifyContent:'center'}
});