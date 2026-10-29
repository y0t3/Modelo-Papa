import React from 'react';
import {StyleSheet,View,useWindowDimensions} from 'react-native';
import Svg,{
 Defs,LinearGradient,RadialGradient,Stop,Rect,Path,Circle,Ellipse,
 G,Text as SvgText
} from 'react-native-svg';
import {useLaloTheme} from './LaloTheme';
import BocaShieldImage from './BocaShieldImage';

/**
 * Imagen de fondo continua (SVG local, sin red): queda FIJA detrás de las
 * pestañas, los filtros y las tablas. El SVG no intercepta ningún toque.
 * Escudos y bolillas sólo decoran las zonas libres y bordes del panel.
 * Las cifras de +11, AUX y los colores VT2/VT3/VT4 se dibujan encima
 * en sus propias celdas opacas, preservando su significado.
 */
export default function LaloWallpaper(){
 const {width,height}=useWindowDimensions();
 const {mode}=useLaloTheme();
 const w=Math.max(320,width),h=Math.max(600,height);
 const light=mode==='light';
 const opacity=light?.17:.96;
 const gold=light?'#996914':'#F2B83D';
 const stars=Array.from({length:64},(_,i)=>({
  x:(i*97+19)%Math.round(w),
  y:(i*181+73)%Math.round(h),
  r:i%7===0?1.3:.65,
  alpha:i%4===0?.46:.2
 }));
 return <View accessible={false} pointerEvents="none"
  style={StyleSheet.absoluteFill}>
  <Svg width="100%" height="100%" viewBox={'0 0 '+w+' '+h}
   preserveAspectRatio="xMidYMid slice"
   style={StyleSheet.absoluteFill}>
   <Defs>
    <LinearGradient id="nightBackground" x1="0%" y1="0%" x2="100%" y2="100%">
     <Stop offset="0" stopColor="#00112D"/>
     <Stop offset=".4" stopColor="#092958"/>
     <Stop offset=".7" stopColor="#021535"/>
     <Stop offset="1" stopColor="#0A2F65"/>
    </LinearGradient>
    <LinearGradient id="goldSweep" x1="0%" y1="0%" x2="100%" y2="0%">
     <Stop offset="0" stopColor="#E4A835" stopOpacity="0"/>
     <Stop offset=".26" stopColor="#F8CE70" stopOpacity=".8"/>
     <Stop offset=".62" stopColor="#B77722" stopOpacity=".7"/>
     <Stop offset="1" stopColor="#E4A835" stopOpacity="0"/>
    </LinearGradient>
    <RadialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
     <Stop offset="0" stopColor="#FFD57E" stopOpacity=".76"/>
     <Stop offset=".25" stopColor="#B7852A" stopOpacity=".31"/>
     <Stop offset="1" stopColor="#A16A2D" stopOpacity="0"/>
    </RadialGradient>
    <RadialGradient id="navyBall" cx="27%" cy="18%" rx="85%" ry="90%">
     <Stop offset="0" stopColor="#6C96D5"/>
     <Stop offset=".33" stopColor="#2A63A6"/>
     <Stop offset=".74" stopColor="#092C60"/>
     <Stop offset="1" stopColor="#041736"/>
    </RadialGradient>
    <RadialGradient id="ivoryBall" cx="23%" cy="18%" rx="88%" ry="90%">
     <Stop offset="0" stopColor="#FFFFFF"/>
     <Stop offset=".34" stopColor="#FFFAE8"/>
     <Stop offset=".67" stopColor="#E7C986"/>
     <Stop offset="1" stopColor="#C19437"/>
    </RadialGradient>
   </Defs>
   <Rect width={w} height={h} fill={light?'#F5F8FC':'url(#nightBackground)'}/>
   <G opacity={opacity}>
    {/* Imágenes y franjas iluminadas continúan visibles por los márgenes. */}
    <Path d={'M-30 '+(h*.14)+' Q'+(w*.58)+' '+(h*.01)+' '+(w+40)+' '+(h*.12)}
     fill="none" stroke="#19497E" strokeWidth="58" opacity=".36"/>
    <Path d={'M-40 '+(h*.38)+' Q'+(w*.40)+' '+(h*.22)+' '+(w+50)+' '+(h*.33)}
     fill="none" stroke="#2E6AA5" strokeWidth="42" opacity=".18"/>
    <Path d={'M-40 '+(h*.79)+' Q'+(w*.43)+' '+(h*.7)+' '+(w+40)+' '+(h*.62)}
     fill="none" stroke="#0F478B" strokeWidth="66" opacity=".28"/>
    <Path d={'M-40 '+(h*.29)+' Q'+(w*.43)+' '+(h*.26)+' '+(w+40)+' '+(h*.17)}
     fill="none" stroke="url(#goldSweep)" strokeWidth="14" opacity=".5"/>
    <Path d={'M-15 '+(h*.44)+' Q'+(w*.58)+' '+(h*.35)+' '+(w+20)+' '+(h*.45)}
     fill="none" stroke="url(#goldSweep)" strokeWidth="6" opacity=".56"/>
    <Path d={'M-10 '+(h*.84)+' Q'+(w*.45)+' '+(h*.69)+' '+(w+20)+' '+(h*.76)}
     fill="none" stroke="url(#goldSweep)" strokeWidth="12" opacity=".55"/>
    <Path d={'M-20 '+(h*.94)+' Q'+(w*.44)+' '+(h*.86)+' '+(w+20)+' '+(h*.92)}
     fill="none" stroke="#F3B742" strokeWidth="2" opacity=".55"/>
    <Circle cx={-10} cy={h*.34} r={Math.round(w*.31)} fill="url(#goldGlow)"/>
    <Circle cx={w+10} cy={h*.81} r={Math.round(w*.38)} fill="url(#goldGlow)"/>
    {stars.map((v,i)=><Circle key={i} cx={v.x} cy={v.y}
     r={v.r} fill="#EFC46C" opacity={v.alpha}/>)}
    {/* Bolillas asomadas por los costados; fondo, no resultados. */}
    <G opacity=".68">
     <Circle cx={-16} cy={h*.58} r={40} fill="url(#navyBall)"
      stroke="#E7B447" strokeWidth="3.5"/>
     <Circle cx={-16} cy={h*.58} r={24} fill="#E3E8EB" stroke="#C6A45F"/>
     <SvgText x={-5} y={h*.58+7} textAnchor="middle" fill="#0B2451"
      fontSize="18" fontWeight="900">11</SvgText>
     <Ellipse cx={-25} cy={h*.58-23} rx="9" ry="5" fill="#FFFFFF" opacity=".6"/>
     <Circle cx={w+11} cy={h*.89} r={48} fill="url(#ivoryBall)"
      stroke="#F2CD75" strokeWidth="3.5"/>
     <Circle cx={w+11} cy={h*.89} r={30} fill="#102F69" stroke="#E3BA64"/>
     <SvgText x={w-8} y={h*.89+7} fill="#FFE5AA" fontSize="20"
      fontWeight="900" textAnchor="middle">23</SvgText>
    </G>
   </G>
  </Svg>
  <View pointerEvents="none" style={[s.shield,{
   top:Math.round(h*.39),right:-Math.round(w*.09),
   opacity:light?.045:.10
  }]}>
   <BocaShieldImage width={Math.round(w*.49)} height={Math.round(w*.58)}/>
  </View>
  <View pointerEvents="none" style={[s.shield,{
   top:Math.round(h*.69),left:-Math.round(w*.13),
   opacity:light?.032:.07,transform:[{rotate:'-12deg'}]
  }]}>
   <BocaShieldImage width={Math.round(w*.53)} height={Math.round(w*.63)}/>
  </View>
  <View pointerEvents="none" style={[s.rail,{borderColor:gold,opacity:light?.25:.46}]}/>
 </View>;
}
const s=StyleSheet.create({
 shield:{position:'absolute',width:240,height:260},
 rail:{position:'absolute',top:0,bottom:0,left:3,right:3,
  borderLeftWidth:1,borderRightWidth:1}
});
