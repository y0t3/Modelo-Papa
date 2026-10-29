import React from 'react';
import {StyleSheet,View} from 'react-native';
import Svg,{Defs,LinearGradient,Stop,Path,Circle,Rect,Text as SvgText} from 'react-native-svg';

/** Marca de agua de fondo para encabezados de paneles: no dibujar sobre cifras. */
export default function BosteroWatermark({opacity=.17}:{opacity?:number}){
 return <View pointerEvents="none" style={[s.outer,{opacity}]}>
  <Svg width="175" height="125" viewBox="0 0 175 125">
   <Defs><LinearGradient id="brush" x1="0" y1="0" x2="1" y2="1">
    <Stop offset="0" stopColor="#FDBF3A" stopOpacity=".04"/>
    <Stop offset=".7" stopColor="#F3B93B" stopOpacity=".9"/>
    <Stop offset="1" stopColor="#C99126" stopOpacity=".15"/>
   </LinearGradient></Defs>
   <Path d="M-10 110Q55 63 175 55L175 79Q87 79-10 120Z" fill="url(#brush)"/>
   <Path d="M3 119Q96 69 181 101" stroke="#F6CC63" strokeWidth="2" opacity=".65"/>
   <Path d="M99 3L164 22 162 70Q152 101 132 117 110 101 99 70Z"
    fill="#134782" stroke="#E7B146" strokeWidth="4"/>
   <Path d="M108 14L156 29 155 70Q145 92 132 103 117 90 108 70Z"
    fill="none" stroke="#E4BB60" strokeWidth="1"/>
   {Array.from({length:20},(_,i)=><Circle key={i} cx={113+(i%5)*9}
    cy={31+Math.floor(i/5)*10} r="1.5" fill="#F5C454"/>)}
   <Rect x="110" y="76" width="45" height="19" rx="3" fill="#F0BC4C"/>
   <SvgText x="132" y="90" fontSize="12" fontWeight="900"
    fill="#0C3671" textAnchor="middle">CABJ</SvgText>
   <Circle cx="24" cy="67" r="20" fill="#D9AA46" stroke="#F6D77E" strokeWidth="2"/>
   <Circle cx="24" cy="67" r="14" fill="#104C8E"/>
   <SvgText x="24" y="72" fontSize="15" fill="#FFE6A9" fontWeight="900"
    textAnchor="middle">11</SvgText>
  </Svg>
 </View>;
}
const s=StyleSheet.create({outer:{position:'absolute',right:5,top:-10,
 width:175,height:125,zIndex:0}});
