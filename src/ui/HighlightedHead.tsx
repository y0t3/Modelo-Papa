import React from 'react';
import {Pressable,View,Text,StyleSheet} from 'react-native';
import type {PanoramaGroup,PanoramaKind} from '../panoramaModel';
import {KINDS,strongestKind} from './visualTokens';
import {useLaloTheme} from './LaloTheme';
import {explainFamilyRationale} from '../friendlyExplanations';

export function ColoredDigits({value,kinds,large=false}:{
 value:string;kinds:PanoramaKind[];large?:boolean
}){
 const {colors,kinds:tokens}=useLaloTheme();
 const kind=strongestKind(kinds);
 const n=kind==='vt4'?4:kind==='vt3'?3:kind==='vt2'?2:0;
 const textStyle={fontSize:large?20:16,fontWeight:'900' as const,color:colors.text,letterSpacing:1};
 if(!/^\d{4}$/.test(value)||!n)return <Text style={textStyle}>{value}</Text>;
 return <Text style={textStyle}>{value.slice(0,4-n)}
  <Text style={{color:tokens[kind!].text,backgroundColor:tokens[kind!].fill,
   textDecorationLine:'underline'}}>{value.slice(4-n)}</Text>
 </Text>;
}
export default function HighlightedHead({group,active,onPress,mode,layout='carousel'}:{
 group:PanoramaGroup;active:boolean;onPress:()=>void;mode:'hoja'|'predictiva';
 layout?:'carousel'|'grid'
}){
 const {colors:c,kinds}=useLaloTheme();
 const empty=group.routeCount===0;
 return <Pressable onPress={onPress} accessibilityRole="button"
  accessibilityLabel={group.label+(empty?', sin coincidencia':', '+group.kinds.join(', '))}
  accessibilityState={{selected:active}}
  style={[s.card,{backgroundColor:active?c.selected:c.card,borderColor:active?c.accent:c.border},
   layout==='grid'?s.gridCard:s.carouselCard,active&&s.active,empty&&s.faded]}>
  {mode==='hoja'?<ColoredDigits value={group.label} kinds={group.kinds} large/>:
   <Text numberOfLines={1} adjustsFontSizeToFit style={[s.number,{color:c.text}]}>{group.label}</Text>}
  <Text style={[s.subtitle,{color:c.subtext}]} numberOfLines={2}>{mode==='predictiva'?explainFamilyRationale(group.subtitle):group.subtitle}</Text>
  {empty?<Text style={[s.empty,{color:c.muted}]}>Sin marca</Text>:
   <View style={s.modes}>{KINDS.filter(k=>group.kinds.includes(k)).map(k=>
    <View key={k} style={[s.kind,{borderColor:kinds[k].line,backgroundColor:kinds[k].fill}]}>
     <Text style={{fontSize:9,fontWeight:'900',color:kinds[k].text}}>{kinds[k].label}</Text>
    </View>)}</View>}
  {group.routeCount>0?<Text style={[s.count,{color:c.subtext}]}>{group.routeCount} recorrido(s)</Text>:null}
 </Pressable>;
}
const s=StyleSheet.create({
 card:{minHeight:106,borderWidth:1,borderRadius:11,padding:10,justifyContent:'flex-start'},
 carouselCard:{width:116,marginRight:8},
 gridCard:{width:'48.3%',marginBottom:8},
 active:{borderWidth:2},
 faded:{opacity:.55},
 number:{fontSize:20,fontWeight:'900',letterSpacing:.5},
 subtitle:{fontSize:10,marginTop:5,lineHeight:14},
 modes:{flexDirection:'row',flexWrap:'wrap',gap:4,marginTop:7},
 kind:{borderWidth:1,borderRadius:4,paddingHorizontal:5,paddingVertical:2},
 count:{fontSize:10,marginTop:7},
 empty:{fontSize:10,marginTop:9}
});
