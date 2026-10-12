import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {PanoramaRoute} from '../panoramaModel';
import {useLaloTheme} from './LaloTheme';
export default function MiniRoutePreview({sheet,route}:{
 sheet:DailySheet;route:PanoramaRoute
}){
 const {colors:c,kinds}=useLaloTheme();
 const column=sheet.columns.find(x=>x.id===route.sourceId);
 if(!column)return null;
 const key=(r:number,c:number)=>r+':'+c;
 const order=new Map(route.cells.map((c,i)=>[key(c.row,c.col),i+1]));
 const color=kinds[route.kind];
 return <View style={[s.wrap,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
  <Text style={[s.heading,{color:c.text}]}>Recorrido · {route.sourceId} · {route.kind.toUpperCase()}</Text>
  <View style={s.grid}>{column.values.flatMap((pair,r)=>[0,1].map(c=>{
   const step=order.get(key(r,c));
   const digit=/^\d{2}$/.test(pair)?pair[c]:'–';
   return <View key={key(r,c)} style={[s.cell,{backgroundColor:c.cell,borderColor:c.border},step!==undefined&&{
    borderColor:color.line,backgroundColor:color.fill,borderWidth:2
   }]}>
    <Text style={[s.digit,{color:step!==undefined?color.text:c.text}]}>{digit}</Text>
    {step!==undefined?<Text style={[s.order,{color:color.line}]}>{step}</Text>:null}
   </View>;
  }))}</View>
  <Text style={[s.caption,{color:c.subtext}]}>Lectura: {route.readings.join(' / ')} · Casillas {route.cells.map(c=>(c.row+1)+(c.col?'D':'I')).join(' → ')}</Text>
  {route.headSources.slice(0,3).map((h,i)=><Text key={i} style={[s.root,{color:c.subtext}]}>Antecedente: {h}</Text>)}
 </View>;
}
const s=StyleSheet.create({
 wrap:{borderRadius:11,backgroundColor:'#f8f5fa',borderWidth:1,borderColor:'#e2d8e9',padding:10,marginTop:9},
 heading:{color:'#48365a',fontSize:12,fontWeight:'900',marginBottom:6},
 grid:{flexDirection:'row',flexWrap:'wrap',width:92,gap:2},
 cell:{width:44,height:35,borderWidth:1,borderColor:'#ddd4e4',borderRadius:5,
  justifyContent:'center',alignItems:'center',backgroundColor:'#fff'},
 digit:{color:'#2b2433',fontWeight:'900',fontSize:16},
 order:{fontSize:8,fontWeight:'900',position:'absolute',top:0,right:3},
 caption:{color:'#62556f',fontSize:10,marginTop:7},
 root:{color:'#655579',fontSize:10,marginTop:4}
});
