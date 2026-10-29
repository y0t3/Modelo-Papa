import React from 'react';
import BosteroWatermark from './BosteroWatermark';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import {JURS,TURNOS} from '../domain';
import {dailyHeadOwnerId} from '../panoramaModel';
import type {PanoramaKind} from '../panoramaModel';
import type {HeadHighlight} from '../headHighlights';
import {ColoredDigits} from './HighlightedHead';
import {useLaloTheme} from './LaloTheme';

/** La tabla de cabezas no es un ranking: muestra también las que no coincidieron. */
export default function HeadsTable({data,highlights,onOpenHead,sourceLabels={}}:{
 data:CabezasDia|null;highlights:Record<string,HeadHighlight>;
 sourceLabels?:Record<string,'HOY'|'AYER'|'AMBAS'>;
 onOpenHead:(turn:Turno,jurisdiction:string,head:string)=>void
}){
 const {colors:c,kinds:vtColors}=useLaloTheme();
 return <View style={[s.surface,{backgroundColor:c.surface,borderColor:'#B9903F',borderWidth:1.3}]}>
  <View style={{position:'relative',overflow:'hidden',minHeight:88,
   paddingVertical:8,paddingRight:66}}>
   <BosteroWatermark opacity={0.22}/>
   <Text style={[s.title,{color:c.accent}]}>CABEZAS COMPLETAS</Text>
   <Text style={[s.note,{color:c.subtext}]}>Tocá una cabeza marcada para ver
    todos sus recorridos en la hoja. Las demás siguen visibles.</Text>
  </View>
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
      const id=dailyHeadOwnerId(t,j,h);
      const mark=highlights[id];
      const sourceLabel=sourceLabels[id];
      const kinds=mark?.kinds||[];
      const muted=kinds.length===0;
      const onlyAux=!!mark?.auxKinds.length&&!mark.plusKinds.length;
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
       {sourceLabel?<Text style={[s.openHint,{color:c.accent}]}>
        AUX {sourceLabel} · marca comprobada</Text>:null}
       {onlyAux&&!sourceLabel?<Text style={[s.openHint,{color:c.accent}]}>AUX · recorrido válido</Text>:null}
       {!muted?<Text style={[s.openHint,{color:c.accent}]}>↗ Ver en hoja</Text>:null}
      </Pressable>;
     })}
    </View>)}
   </View>
  </ScrollView>
 </View>;
}
const s=StyleSheet.create({
 surface:{borderRadius:13,padding:11,marginTop:10},
 title:{fontSize:19,fontWeight:'900',fontStyle:'italic'},
 note:{color:'#786982',fontSize:11,marginTop:6,marginBottom:12,lineHeight:16},
 row:{flexDirection:'row',borderBottomWidth:1,alignItems:'center'},
 first:{width:104,padding:7},header:{fontSize:11,color:'#57456a',fontWeight:'800'},
 cell:{width:102,padding:7,textAlign:'center'},
 jur:{fontSize:11,fontWeight:'800',color:'#352743'},
 value:{width:102,minHeight:71,padding:7,justifyContent:'center',alignItems:'center'},
 muted:{opacity:.36},
 tags:{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'},
 tag:{fontSize:9,fontWeight:'800'},
 openHint:{fontSize:9,fontWeight:'900',marginTop:4}
});
