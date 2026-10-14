import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import type {PanoramaCell,PanoramaKind} from '../panoramaModel';
import {useLaloTheme} from './LaloTheme';

/** El mismo tablero físico 6×2 para ruta actual y antecedente histórico. */
export default function RouteMiniBoard({values,cells,kind,compact=false}:{
 values:string[];cells:PanoramaCell[];kind:PanoramaKind;compact?:boolean
}){
 const {colors:c,kinds}=useLaloTheme();
 const color=kinds[kind],size=compact?31:44,height=compact?27:35,gap=2;
 const order=new Map(cells.map((x,i)=>[x.row+':'+x.col,i+1]));
 return <View style={[s.grid,{width:size*2+gap,gap}]}>
  {values.slice(0,6).flatMap((pair,r)=>[0,1].map(side=>{
   const key=r+':'+side,step=order.get(key);
   const digit=/^\d{2}$/.test(pair)?pair[side]:'–';
   return <View key={key} style={[s.cell,{
    width:size,height,backgroundColor:c.cell,borderColor:c.border
   },step!==undefined&&{borderColor:color.line,backgroundColor:color.fill,borderWidth:2}]}>
    <Text style={[s.digit,{fontSize:compact?12:16,
     color:step!==undefined?color.text:c.text}]}>{digit}</Text>
    {step!==undefined?<Text style={[s.order,{color:color.line,fontSize:compact?7:8}]}>
     {step}</Text>:null}
   </View>;
  }))}</View>;
}
const s=StyleSheet.create({
 grid:{flexDirection:'row',flexWrap:'wrap'},
 cell:{borderWidth:1,borderRadius:5,justifyContent:'center',alignItems:'center'},
 digit:{fontWeight:'900'},
 order:{fontWeight:'900',position:'absolute',top:0,right:3}
});
