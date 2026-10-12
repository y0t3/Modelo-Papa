import React from 'react';
import {Pressable,View,Text,StyleSheet} from 'react-native';
import type {PanoramaGroup,PanoramaKind} from '../panoramaModel';
import {KIND_COLOR,KINDS,strongestKind} from './visualTokens';

/** En cabezas ABCD solo se resalta el SUFIJO comprobado: CD / BCD / ABCD. */
export function ColoredDigits({value,kinds,large=false}:{
 value:string;kinds:PanoramaKind[];large?:boolean
}){
 const kind=strongestKind(kinds);
 const numeric=/^\d{4}$/.test(value);
 const n=kind==='vt4'?4:kind==='vt3'?3:kind==='vt2'?2:0;
 if(!numeric||!n)return <Text style={[s.number,large&&s.large]}>{value}</Text>;
 return <Text style={[s.number,large&&s.large]}>
  {value.slice(0,4-n)}
  <Text style={{color:KIND_COLOR[kind!].line,
   backgroundColor:KIND_COLOR[kind!].fill,textDecorationLine:'underline'}}>
   {value.slice(4-n)}
  </Text>
 </Text>;
}

export default function HighlightedHead({group,active,onPress,mode}:{
 group:PanoramaGroup;active:boolean;onPress:()=>void;mode:'hoja'|'predictiva'
}){
 const empty=group.routeCount===0;
 return <Pressable onPress={onPress} accessibilityRole="button"
  accessibilityLabel={group.label+(empty?', sin coincidencia':', '+group.kinds.join(', '))}
  accessibilityState={{selected:active}}
  style={[s.card,active&&s.active,empty&&s.faded]}>
  {mode==='hoja'?
   <ColoredDigits value={group.label} kinds={group.kinds} large/>:
   <Text style={[s.number,s.large]}>{group.label}</Text>}
  <Text style={s.subtitle} numberOfLines={1}>{group.subtitle}</Text>
  {empty?<Text style={s.empty}>Sin marca</Text>:
   <View style={s.modes}>{KINDS.filter(k=>group.kinds.includes(k)).map(k=>
    <View key={k} style={[s.kind,{borderColor:KIND_COLOR[k].line,backgroundColor:KIND_COLOR[k].fill}]}>
     <Text style={{fontSize:9,fontWeight:'900',color:KIND_COLOR[k].line}}>{k.toUpperCase()}</Text>
    </View>)}</View>}
  {group.routeCount>0?<Text style={s.count}>{group.routeCount} recorrido(s) físicos</Text>:null}
 </Pressable>;
}
const s=StyleSheet.create({
 card:{width:116,minHeight:104,backgroundColor:'#fff',borderWidth:1,borderColor:'#ddd4e3',
  borderRadius:10,padding:9,marginRight:8},
 active:{borderColor:'#6542a1',borderWidth:2,backgroundColor:'#f3eaff'},
 faded:{opacity:.5},
 number:{color:'#2c2240',fontSize:16,fontWeight:'900',letterSpacing:1},
 large:{fontSize:20},
 subtitle:{fontSize:10,color:'#766a7d',marginTop:4},
 modes:{flexDirection:'row',flexWrap:'wrap',gap:3,marginTop:6},
 kind:{borderWidth:1,borderRadius:4,paddingHorizontal:4,paddingVertical:2},
 count:{fontSize:9,color:'#6d6179',marginTop:6},
 empty:{fontSize:10,color:'#98909f',marginTop:9}
});
