import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import Svg,{
 Defs,LinearGradient,RadialGradient,Stop,Rect,Circle,Path,G,Text as SvgText,Ellipse
} from 'react-native-svg';
import type {ThemeMode} from './LaloTheme';
import BocaShieldImage from './BocaShieldImage';

/**
 * Header de identidad de Lalo, con el escudo tradicional CABJ como referencia:
 * silueta de hombros, letras doradas y estrellas. Recreación vectorial propia.
 * La composición reserva tres zonas que nunca se superponen:
 * bolillas x=0..88 · título x=109..277 · escudo x=303..389.
 */
function LotteryBall({
 x,y,r,n,theme
}:{x:number;y:number;r:number;n:string;theme:'cream'|'gold'|'blue'}){
 const bg=theme==='cream'?'url(#pearl)':
  theme==='gold'?'url(#ballGold)':'url(#ballBlue)';
 const numberColor=theme==='blue'?'#FFF5D6':'#062655';
 return <G>
  <Ellipse cx={x+2} cy={y+r*.78} rx={r*.78} ry={r*.34}
   fill="#000B25" opacity=".48"/>
  <Circle cx={x} cy={y} r={r+2.5} fill="#0E2C55"
   stroke="#E7B447" strokeWidth="2.7"/>
  <Circle cx={x} cy={y} r={r-1.5} fill={bg} stroke="#FFF0C3" strokeWidth="1.3"/>
  <Circle cx={x} cy={y} r={r*.66} fill={theme==='blue'?'#183C72':'#F5F0D6'}
   stroke={theme==='blue'?'#EED194':'#C49B51'} strokeWidth="1.2"/>
  <SvgText x={x} y={y+r*.22} fontSize={r*.79} fontWeight="900"
   fill={numberColor} textAnchor="middle">{n}</SvgText>
  <Ellipse cx={x-r*.29} cy={y-r*.40} rx={r*.27} ry={r*.14}
   fill="#FFFFFF" opacity=".74" transform={'rotate(-30 '+(x-r*.29)+' '+(y-r*.4)+')'}/>
  <Path d={'M'+(x-r*.68)+' '+(y+r*.22)+' Q'+(x-r*.54)+' '+
   (y+r*.69)+' '+(x-r*.14)+' '+(y+r*.76)}
   fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity=".41"/>
 </G>;
}

export default function BrandHero({mode,onToggle}:{mode:ThemeMode;onToggle:()=>void}){
 return <View style={s.outer}>
  <View style={s.hero}>
   <Svg width="100%" height="100%" viewBox="0 0 390 166"
    preserveAspectRatio="xMidYMid meet" style={StyleSheet.absoluteFill}
    accessible={false}>
    <Defs>
     <LinearGradient id="night" x1="0" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor="#061B39"/>
      <Stop offset=".5" stopColor="#0B3265"/>
      <Stop offset="1" stopColor="#05152F"/>
     </LinearGradient>
     <LinearGradient id="letterGold" x1="0" y1="0" x2=".2" y2="1">
      <Stop offset="0" stopColor="#FFF5CB"/>
      <Stop offset=".37" stopColor="#FFCE55"/>
      <Stop offset=".69" stopColor="#EAAA2A"/>
      <Stop offset="1" stopColor="#B37B24"/>
     </LinearGradient>
     <LinearGradient id="ribbonGold" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor="#FFE8A4"/>
      <Stop offset=".55" stopColor="#F5C14F"/>
      <Stop offset="1" stopColor="#C68C2E"/>
     </LinearGradient>
     <LinearGradient id="crestBlue" x1="0" y1="0" x2=".7" y2="1">
      <Stop offset="0" stopColor="#14529C"/>
      <Stop offset=".5" stopColor="#093568"/>
      <Stop offset="1" stopColor="#041B41"/>
     </LinearGradient>
     <RadialGradient id="pearl" cx=".24" cy=".15" rx=".75" ry=".87">
      <Stop offset="0" stopColor="#FFFFFF"/>
      <Stop offset=".51" stopColor="#F4F1E4"/>
      <Stop offset="1" stopColor="#B8C5D6"/>
     </RadialGradient>
     <RadialGradient id="ballGold" cx=".26" cy=".15" rx=".86" ry=".9">
      <Stop offset="0" stopColor="#FFF4CA"/>
      <Stop offset=".5" stopColor="#F4C65B"/>
      <Stop offset="1" stopColor="#B77F27"/>
     </RadialGradient>
     <RadialGradient id="ballBlue" cx=".24" cy=".17" rx=".8" ry=".9">
      <Stop offset="0" stopColor="#73A6E0"/>
      <Stop offset=".5" stopColor="#205696"/>
      <Stop offset="1" stopColor="#06234D"/>
     </RadialGradient>
    </Defs>
    <Rect x="0" y="0" width="390" height="166" fill="url(#night)"/>
    <Path d="M-12 40Q72 9 140-2L390 32M-15 78Q140 5 410 71"
     fill="none" stroke="#416C9B" strokeWidth="11" opacity=".18"/>
    <Path d="M-12 112L187 9M19 176L295 7M183 175L390 73"
     stroke="#6090B7" strokeWidth=".85" opacity=".18"/>
    {/* Curva de cartel quinielero, pero bajo el título y las cifras. */}
    <Path d="M-8 160Q81 126 154 144T391 141" fill="none"
     stroke="#D59B33" strokeWidth="7" opacity=".65"/>
    <Path d="M-5 154Q86 118 175 140T397 137" fill="none"
     stroke="#FFE29A" strokeWidth="1.7" opacity=".66"/>
    {Array.from({length:30},(_,i)=><Circle key={'spark'+i}
     cx={(i*89+13)%390} cy={(i*49+17)%166}
     r={i%6===0?1.65:.8} fill="#F0C360" opacity={i%4===0?.59:.28}/>)}
    {/* Bolillas de quiniela a la izquierda: ningún círculo llega al texto. */}
    <LotteryBall x={36} y={109} r={29} n="11" theme="blue"/>
    <LotteryBall x={57} y={61} r={23} n="23" theme="cream"/>
    <LotteryBall x={72} y={140} r={13} n="48" theme="gold"/>
    <LotteryBall x={13} y={149} r={14} n="72" theme="gold"/>
    {/* Letras de cartel, inclinación, relieve y brillo oro. */}
    <G transform="rotate(-3 113 48)">
     <SvgText x="113" y="49" fontSize="22" fontWeight="800"
      fontStyle="italic" letterSpacing="-.5" fill="#03142F"
      opacity=".93">La posta de</SvgText>
     <SvgText x="112" y="47" fontSize="22" fontWeight="800"
      fontStyle="italic" letterSpacing="-.5" fill="#FFFFFF">La posta de</SvgText>
    </G>
    <G transform="rotate(-7 120 108)">
     <SvgText x="120" y="109" fontSize="63" fontWeight="900"
      fontStyle="italic" letterSpacing="-3" fill="#02122C"
      opacity=".9">Lalo</SvgText>
     <SvgText x="117" y="105" fontSize="63" fontWeight="900"
      fontStyle="italic" letterSpacing="-3" fill="url(#letterGold)">Lalo</SvgText>
    </G>
    <Path d="M115 110Q177 121 270 108" fill="none"
     stroke="#EAAE37" strokeWidth="2.5" strokeLinecap="round"/>
    {/* La frase de Lalo: sello y no simple leyenda. */}
    <Path d="M109 121L268 121L275 133L268 148L109 148L116 135Z"
     fill="#092852" stroke="#F4C35E" strokeWidth="1.7"/>
    <Path d="M116 124L261 124" stroke="#F1CB75" strokeWidth=".8" opacity=".55"/>
    <SvgText x="192" y="140.5" fontSize="14.6" textAnchor="middle"
     fontWeight="900" letterSpacing=".9" fill="#FFF0B6">TOMAA GIILL!!</SvgText>
   </Svg>
   {/* Escudo CABJ REAL desde el recurso de imagen, sin reproducirlo con paths. */}
   <View pointerEvents="none" style={s.crest}>
    <BocaShieldImage width={78} height={96}/>
   </View>
   <Pressable accessibilityRole="switch"
    accessibilityLabel="Cambiar modo claro u oscuro"
    accessibilityState={{checked:mode==='dark'}} onPress={onToggle}
    style={s.mode}>
    <Text style={s.modeText}>{mode==='dark'?'☾':'☀'}</Text>
   </Pressable>
  </View>
 </View>;
}
const s=StyleSheet.create({
 outer:{paddingHorizontal:9,paddingTop:6,paddingBottom:7,backgroundColor:'#061832'},
 hero:{height:159,borderRadius:15,borderWidth:1.7,borderColor:'#EDB84E',
  overflow:'hidden',backgroundColor:'#071D45',justifyContent:'center',
  elevation:4,shadowColor:'#F3BA48',shadowOpacity:.19,shadowRadius:8,
  shadowOffset:{width:0,height:2}},
 crest:{position:'absolute',right:11,top:9,width:78,height:96,zIndex:1,
  alignItems:'center',justifyContent:'center'},
 mode:{position:'absolute',right:8,bottom:7,width:30,height:29,
  borderRadius:9,backgroundColor:'rgba(4,22,48,.94)',borderWidth:1,
  borderColor:'#E8B649',alignItems:'center',justifyContent:'center',zIndex:2},
 modeText:{fontSize:18,color:'#FBE4A0',fontWeight:'900'}
});
