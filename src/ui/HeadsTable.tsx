import React from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {CabezasDia,Turno} from '../domain';
import {JURS,TURNOS} from '../domain';
import type {PanoramaKind} from '../panoramaModel';
import {ColoredDigits} from './HighlightedHead';
import {useLaloTheme} from './LaloTheme';

/** La tabla de cabezas no es un ranking: muestra también las que no coincidieron. */
export default function HeadsTable({data,sheet,onOpenHead}:{
 data:CabezasDia|null;sheet:DailySheet|null;
 onOpenHead:(turn:Turno,jurisdiction:string,head:string)=>void
}){
 const {colors:c,kinds:vtColors}=useLaloTheme();
 return <View style={[s.surface,{backgroundColor:c.surface,borderColor:c.border,borderWidth:1}]}>
  <Text style={[s.title,{color:c.text}]}>CABEZAS COMPLETAS</Text>
  <Text style={[s.note,{color:c.subtext}]}>Tocá una cabeza resaltada para abrir en Hoja sus recorridos físicos coincidentes (VT2, VT3 y VT4). Las cabezas sin coincidencia permanecen apagadas.</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator>
   <View>
    <View style={[s.row,{borderBottomColor:c.divider}]}>
     <Text style={[s.first,s.header,{color:c.subtext}]}>Jurisdicción</Text>
     {TURNOS.map(t=><Text key={t} style={[s.cell,s.header,{color:c.subtext}]}>{t}</Text>)}
    </View>
    {JURS.map(j=><View key={j} style={[s.row,{borderBottomColor:c.divider}]}>
     <Text style={[s.first,s.jur,{color:c.text}]}>{j}</Text>
     {TURNOS.map(t=>{
      const h=data?.[t]?.[j]||'----';
      const hits=sheet?.matches[t]?.filter(m=>m.cabeza===h&&m.jurisdiccion===j)||[];
      const kinds=[...new Set(hits.flatMap(m=>m.hits.map(x=>x.kind)))] as PanoramaKind[];
      const muted=kinds.length===0;
      return <Pressable key={t} disabled={muted}
       accessibilityRole="button"
       accessibilityLabel={muted?
        h+' · '+j+' · '+t+' sin recorrido':
        'Ver '+h+' de '+j+' ('+t+') en Hoja'}
       accessibilityState={{disabled:muted}}
       onPress={()=>onOpenHead(t,j,h)}
       style={[s.value,muted&&s.muted]}>
       <ColoredDigits value={h} kinds={kinds} large/>
       <View style={s.tags}>{(['vt2','vt3','vt4'] as PanoramaKind[]).filter(k=>kinds.includes(k)).map(k=>
        <Text key={k} style={[s.tag,{color:vtColors[k].line}]}>{k.toUpperCase()} </Text>)}</View>
       {!muted?<Text style={[s.openHint,{color:c.accent}]}>↗ Ver en hoja</Text>:null}
      </Pressable>;
     })}
    </View>)}
   </View>
  </ScrollView>
 </View>;
}
const s=StyleSheet.create({
 surface:{backgroundColor:'#f7f4f8',borderRadius:13,padding:11,marginTop:10},
 title:{fontSize:17,fontWeight:'900',color:'#352743'},
 note:{color:'#786982',fontSize:11,marginTop:6,marginBottom:12,lineHeight:16},
 row:{flexDirection:'row',borderBottomWidth:1,borderBottomColor:'#e7e0ea',alignItems:'center'},
 first:{width:104,padding:7},header:{fontSize:11,color:'#57456a',fontWeight:'800'},
 cell:{width:102,padding:7,textAlign:'center'},
 jur:{fontSize:11,fontWeight:'800',color:'#352743'},
 value:{width:102,minHeight:71,padding:7,justifyContent:'center',alignItems:'center'},
 muted:{opacity:.36},
 tags:{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'},
 tag:{fontSize:9,fontWeight:'800'},
 openHint:{fontSize:9,fontWeight:'900',marginTop:4}
});
