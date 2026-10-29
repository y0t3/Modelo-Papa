import React from 'react';
import {Image,Pressable,StyleSheet,Text,View} from 'react-native';
import type {ThemeMode} from './LaloTheme';

/**
 * El banner ilustrado ORIGINAL de "La posta de Lalo".
 *
 * Imagen incluida en assets, funciona sin conexión y no redibuja sus piezas.
 * Misma proporción 1400:574; así el título, las bolillas y el escudo
 * conservan exactamente la composición del mockup.
 *
 * El botón oscuro/claro permanece como control React Native independiente.
 * No modifica LaloWallpaper (el fondo azul/oro continuo aprobado).
 */
export default function BrandHero({mode,onToggle}:{
 mode:ThemeMode;onToggle:()=>void;
}){
 return <View style={s.outer}>
  <View style={s.hero}>
   <Image
    source={require('../../assets/la-posta-header-banner.jpg')}
    style={s.banner} resizeMode="stretch"
    accessibilityLabel="La posta de Lalo, TOMAA GIILL!!, bolillas de quiniela y escudo de Boca"
   />
   <Pressable accessibilityRole="switch"
    accessibilityLabel="Cambiar modo claro u oscuro"
    accessibilityState={{checked:mode==='dark'}}
    onPress={onToggle} style={s.mode}>
    <Text style={s.modeText}>{mode==='dark'?'☾':'☀'}</Text>
   </Pressable>
  </View>
 </View>;
}
const s=StyleSheet.create({
 outer:{paddingHorizontal:9,paddingTop:6,paddingBottom:7,
  backgroundColor:'transparent'},
 hero:{width:'100%',aspectRatio:1400/574,
  borderRadius:15,borderWidth:1.5,borderColor:'#EDB84E',
  overflow:'hidden',backgroundColor:'#061D3E',
  elevation:4,shadowColor:'#F3BA48',shadowOpacity:.19,shadowRadius:8,
  shadowOffset:{width:0,height:2}},
 banner:{width:'100%',height:'100%'},
 mode:{position:'absolute',right:8,bottom:8,width:30,height:29,
  borderRadius:9,backgroundColor:'rgba(4,22,48,.94)',borderWidth:1,
  borderColor:'#E8B649',alignItems:'center',justifyContent:'center'},
 modeText:{fontSize:18,color:'#FBE4A0',fontWeight:'900'}
});
