import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {LaloView} from '../motorLalo';
import type {AuxiliarView} from '../motorLaloAuxiliar';
import type {HeadEvent} from '../predictionParallel';
import {comparePrediction} from '../predictionParallel';
import {useLaloTheme} from './LaloTheme';
type Count=3|5|10;
/** Solo coteja salidas PRE independientes; cabezas POST nunca reordenan Tops. */
export default function ParallelPredictionCompare({lalo,auxiliar,heads}:{
 lalo:LaloView;auxiliar:AuxiliarView;heads:HeadEvent[]
}){
 const {colors:c,kinds}=useLaloTheme();
 const [limit,setLimit]=useState<Count>(3);
 const compared=comparePrediction(lalo,auxiliar,heads,limit);
 return <View style={[s.panel,{backgroundColor:c.surface,borderColor:c.border}]}>
  <Text style={[s.title,{color:c.text}]}>TOP GENERAL · FAMILIAS COINCIDENTES</Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Coincidencia = una familia aparece en el Top seleccionado de ambos motores. El orden muestra la suma de sus posiciones, sin cambiar ninguno de los Tops.
   Acierto POST = terminación de una cabeza realmente publicada; no
   implica que se haya jugado ni cobrado una apuesta.
  </Text>
  <View style={s.tabs}>{([3,5,10] as const).map(k=>
   <Pressable key={k} accessibilityRole="button"
    accessibilityState={{selected:limit===k}}
    onPress={()=>setLimit(k)}
    style={[s.chip,{borderColor:limit===k?c.accent:c.border,
     backgroundColor:limit===k?c.accentFill:c.card}]}>
    <Text style={[s.chipText,{color:c.text}]}>Top {k}</Text>
   </Pressable>)}</View>
  {compared.map(section=><View key={section.kind}
   style={[s.segment,{borderColor:c.border}]}>
   <Text style={[s.kind,{color:kinds[section.kind].line}]}>
    {section.kind.toUpperCase()} · {section.shared.length} familia(s) en ambos
   </Text>
   {section.shared.length?
    section.shared.map(f=><View key={f.family}
     style={[s.shared,{borderColor:kinds[section.kind].line,
      backgroundColor:kinds[section.kind].fill}]}>
     <Text style={{color:kinds[section.kind].text,fontWeight:'900'}}>
      ⇄ {f.family} · Lalo #{f.lalo} / Auxiliar #{f.auxiliar}
     </Text>
     {f.heads.length?<Text style={[s.small,{color:kinds[section.kind].text}]}>
      ✓ POST: {f.heads.map(x=>(x.jur?x.jur+' ':'')+x.head).join(' · ')}
     </Text>:null}
    </View>):<Text style={[s.small,{color:c.subtext}]}>
     Ninguna familia compartida dentro del Top{limit} de ambos motores.
    </Text>}
   <Text style={[s.small,{color:c.subtext}]}>
    Solo Lalo {section.onlyOriginal.length} · solo Auxiliar {section.onlyAuxiliar.length} (Top{limit})
   </Text>
   {section.winning.length?<View style={{gap:4,marginTop:4}}>
    <Text style={[s.small,{color:c.text,fontWeight:'900'}]}>
     Cabezas publicadas cubiertas por algún Top{limit}
    </Text>
    {section.winning.map((h,i)=><Text key={h.jur+'|'+h.head+'|'+i}
     style={[s.small,{color:h.lalo&&h.auxiliar?
      kinds[section.kind].line:c.text}]}>
     {h.lalo&&h.auxiliar?'✓ AMBOS':h.lalo?'✓ LALO':'✓ AUXILIAR'} ·
     {' '}{h.jur} {h.head}
     {' · '}{h.lalo?'Lalo #'+h.lalo:''}
     {h.lalo&&h.auxiliar?' / ':''}
     {h.auxiliar?'Auxiliar #'+h.auxiliar:''}
    </Text>)}
   </View>:<Text style={[s.small,{color:c.muted}]}>
    {heads.some(x=>/^\d{4}$/.test(x.head))?
      'Ninguna cabeza publicada fue cubierta por estos Tops.':
      'Todavía no hay cabezas publicadas para cotejar este turno.'}
   </Text>}
  </View>)}
 </View>;
}
const s=StyleSheet.create({
 panel:{borderWidth:1,borderRadius:13,padding:13,gap:10,marginTop:12},
 title:{fontSize:14,fontWeight:'900'},
 note:{fontSize:11,lineHeight:17},
 tabs:{flexDirection:'row',gap:8},
 chip:{flex:1,alignItems:'center',padding:9,borderRadius:8,borderWidth:1},
 chipText:{fontSize:11,fontWeight:'900'},
 segment:{borderTopWidth:1,paddingTop:10,gap:7},
 kind:{fontSize:14,fontWeight:'900'},
 shared:{padding:8,borderWidth:1,borderRadius:8,gap:3},
 small:{fontSize:11,lineHeight:16}
});
