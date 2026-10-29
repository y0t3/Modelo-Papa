import React from 'react';
import {Pressable,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import Svg,{Defs,LinearGradient,RadialGradient,Stop,Rect,Circle,Path,G,Text as SvgText,Ellipse} from 'react-native-svg';
import type {ThemeMode} from './LaloTheme';

/** Arte vectorial del encabezado: quiniela 70 % · Boca 30 %.
 * Decorativo, no interfiere con recorridos, tablas ni colores de VT. */
export default function BrandHero({mode,onToggle}:{mode:ThemeMode;onToggle:()=>void}){
 const {width}=useWindowDimensions();
 const tight=width<380;
 return <View style={s.outer}>
  <View style={s.hero}>
   <Svg width="100%" height="100%" viewBox="0 0 390 166" preserveAspectRatio="none"
    style={StyleSheet.absoluteFill}>
    <Defs>
     <LinearGradient id="ocean" x1="0" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor="#061832"/><Stop offset=".53" stopColor="#0A326C"/>
      <Stop offset="1" stopColor="#051329"/>
     </LinearGradient>
     <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor="#FFF1B9"/><Stop offset=".49" stopColor="#F6C24E"/>
      <Stop offset="1" stopColor="#AD701A"/>
     </LinearGradient>
     <LinearGradient id="blueBall" x1="0" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor="#6DA2E5"/><Stop offset=".45" stopColor="#173C80"/>
      <Stop offset="1" stopColor="#05183C"/>
     </LinearGradient>
     <RadialGradient id="shine" cx=".2" cy=".18" r=".9">
      <Stop offset="0" stopColor="#FFFFFF" stopOpacity=".62"/>
      <Stop offset=".33" stopColor="#FFFFFF" stopOpacity=".04"/>
      <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
     </RadialGradient>
    </Defs>
    <Rect width="390" height="166" fill="url(#ocean)"/>
    <Path d="M0 28L115 0 320 0 390 32M0 126L122 166H390" stroke="#285B9C"
     strokeWidth="18" opacity=".3"/>
    <Path d="M0 0L390 166M0 34L390 145M0 166L390 45"
     stroke="#6B92C4" strokeWidth="1" opacity=".15"/>
    <Path d="M0 152Q100 106 210 146T390 142" stroke="#E9B648"
     strokeWidth="4" fill="none" opacity=".77"/>
    <Path d="M0 160Q90 133 210 152T390 154" stroke="#F2C965"
     strokeWidth="1.5" fill="none" opacity=".5"/>
    {Array.from({length:44},(_,i)=><Circle key={'shine'+i}
     cx={(i*71+13)%390} cy={(i*47+19)%166}
     r={(i%5===0)?1.7:.75} fill="#EAB44C" opacity={i%3===0?.56:.18}/>)}
    <G opacity=".98">
     <Path d="M320 12L378 27 377 93Q366 119 349 130 330 119 320 93Z"
      fill="#09285A" stroke="#F0B842" strokeWidth="4"/>
     <Path d="M327 21L371 32 371 91Q361 110 349 120 336 109 327 91Z"
      fill="none" stroke="#D5A23B" strokeWidth="1.4"/>
     {Array.from({length:19},(_,i)=><Circle key={'star'+i}
      cx={332+(i%5)*8.4} cy={38+Math.floor(i/5)*10}
      r="1.5" fill="#E9BB53"/>)}
     <Rect x="326" y="80" width="46" height="23" fill="url(#gold)" rx="3"/>
     <SvgText x="349" y="96" fill="#09234B" fontSize="13" fontWeight="900"
      textAnchor="middle">CABJ</SvgText>
    </G>
    <G transform="rotate(-19 50 104)">
     <Circle cx="43" cy="105" r="36" fill="url(#blueBall)" stroke="#E4B04C" strokeWidth="4"/>
     <Circle cx="43" cy="105" r="26" fill="#122F65" stroke="#D9BB78" strokeWidth="1"/>
     <SvgText x="43" y="114" fontSize="25" textAnchor="middle"
      fill="#F6EAC7" fontWeight="900">11</SvgText>
     <Circle cx="23" cy="89" r="9" fill="url(#shine)"/>
    </G>
    <G transform="rotate(12 94 74)">
     <Circle cx="93" cy="73" r="29" fill="url(#gold)" stroke="#FFF1B6" strokeWidth="3.4"/>
     <Circle cx="93" cy="73" r="21" fill="#0C2F61" stroke="#B88631" strokeWidth="2"/>
     <SvgText x="93" y="81" fontSize="19" fill="#FFF4D2"
      fontWeight="900" textAnchor="middle">23</SvgText>
    </G>
    <G>
     <Circle cx="18" cy="148" r="18" fill="url(#gold)" stroke="#FFF0B3" strokeWidth="2.5"/>
     <SvgText x="18" y="154" fontSize="13" fill="#12315A" fontWeight="900"
      textAnchor="middle">72</SvgText>
    </G>
   </Svg>
   <View style={[s.wordmark,{paddingLeft:tight?92:105,paddingRight:tight?44:54}]}>
    <Text numberOfLines={1} adjustsFontSizeToFit
     style={[s.title,{fontSize:tight?24:27}]}>La posta de</Text>
    <Text style={[s.lalo,{fontSize:tight?39:45}]}>Lalo</Text>
    <Text numberOfLines={1} adjustsFontSizeToFit style={s.catchphrase}>TOMAA GIILL!!</Text>
   </View>
   <Pressable accessibilityRole="switch" accessibilityLabel="Cambiar modo claro u oscuro"
    accessibilityState={{checked:mode==='dark'}} onPress={onToggle}
    style={s.mode}>
    <Text style={s.modeText}>{mode==='dark'?'☾':'☀'}</Text>
   </Pressable>
  </View>
 </View>;
}
const s=StyleSheet.create({
 outer:{paddingHorizontal:9,paddingTop:6,paddingBottom:7,backgroundColor:'#061832'},
 hero:{height:159,borderRadius:15,borderWidth:1.5,borderColor:'#EDB84E',
  overflow:'hidden',backgroundColor:'#071D45',justifyContent:'center',
  elevation:4,shadowColor:'#F3BA48',shadowOpacity:.19,shadowRadius:8,shadowOffset:{width:0,height:2}},
 wordmark:{flex:1,justifyContent:'center',alignItems:'flex-start',zIndex:1,paddingTop:0},
 title:{color:'#FFF7E8',fontWeight:'900',fontStyle:'italic',
  textShadowColor:'#031025',textShadowOffset:{width:2,height:2},textShadowRadius:3},
 lalo:{color:'#F7C054',fontWeight:'900',fontStyle:'italic',marginTop:-8,
  textShadowColor:'#001129',textShadowOffset:{width:2,height:3},textShadowRadius:4},
 catchphrase:{color:'#F9E5AF',fontSize:13,letterSpacing:1.45,fontWeight:'900',
  marginTop:2,backgroundColor:'rgba(5,25,54,0.66)',paddingHorizontal:6,
  paddingVertical:3,borderRadius:6},
 mode:{position:'absolute',right:8,bottom:7,width:33,height:30,borderRadius:9,
  backgroundColor:'rgba(3,21,47,0.9)',borderWidth:1,borderColor:'#E5B04B',
  alignItems:'center',justifyContent:'center',zIndex:2},
 modeText:{fontSize:18,color:'#FBE4A0',fontWeight:'900'}
});