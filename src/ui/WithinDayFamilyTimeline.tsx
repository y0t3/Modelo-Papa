import React,{useEffect,useMemo,useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {Turno,CabezasDia} from '../domain';
import type {DailySheet} from '../sheet';
import type {AuxiliaryHeads} from '../auxSantiagoNeuquen';
import {sameDaySequence} from '../withinDayMarkContinuity';
import type {N} from '../withinDayMarkContinuity';
import {timelineFamilyChoices,timelineForFamily} from '../withinDayTimeline';
import {useLaloTheme} from './LaloTheme';

const kinds:N[]=[2,3,4];
export default function WithinDayFamilyTimeline({
 date,through,draws,plus,aux,kind,onKindChange,onFamily
}:{
 date:string;through:Turno;draws:CabezasDia;plus:DailySheet;
 aux:AuxiliaryHeads;kind:N;
 onKindChange:(value:N)=>void;
 onFamily:(value:string,kind:N)=>void
}){
 const {colors:c,kinds:kindColors}=useLaloTheme();
 const [choice,setChoice]=useState('');
 useEffect(()=>setChoice(''),[date]);
 const frames=useMemo(()=>sameDaySequence(date,draws,plus,aux,through),
  [date,draws,plus,aux,through]);
 const choices=useMemo(()=>timelineFamilyChoices(frames,kind),[frames,kind]);
 const selected=choices.find(x=>x.family===choice)?.family||choices[0]?.family||'';
 const items=useMemo(()=>
  selected?timelineForFamily(frames,kind,selected,through):[],
  [frames,kind,selected,through]);
 const pick=(family:string)=>{
  setChoice(family);
  onFamily(family.split('/')[0],kind);
 };
 return <View style={s.block}>
  <Text style={[s.title,{color:c.text}]}>LÍNEA DE TIEMPO · MARCAS DEL DÍA</Text>
  <Text style={[s.hint,{color:c.subtext}]}>
   Seguí una familia que haya explicado al menos una cabeza real de la jornada.
   PRE muestra solo fuentes anteriores; POST agrega exclusivamente cabezas ya publicadas.
  </Text>
  <View style={s.wrap}>
   {kinds.map(n=><Pressable key={n} accessibilityRole="button"
    accessibilityState={{selected:kind===n}}
    onPress={()=>{onKindChange(n);setChoice('')}}
    style={[s.chip,{
     borderColor:kind===n?kindColors['vt'+n as 'vt2'|'vt3'|'vt4'].line:c.border,
     backgroundColor:kind===n?kindColors['vt'+n as 'vt2'|'vt3'|'vt4'].fill:c.surfaceAlt
    }]}>
    <Text style={{color:kind===n?kindColors['vt'+n as 'vt2'|'vt3'|'vt4'].text:c.text,
     fontWeight:'800'}}>VT{n}</Text>
   </Pressable>)}
  </View>
  {choices.length?<><Text style={[s.subtitle,{color:c.text}]}>
   Familias comprobadas POST hasta {through} · {choices.length}
  </Text>
  <View style={s.wrap}>
   {choices.map(x=><Pressable key={x.family} accessibilityRole="button"
    accessibilityLabel={'Seguir familia '+x.family}
    accessibilityState={{selected:selected===x.family}}
    onPress={()=>pick(x.family)}
    style={[s.chip,{
     borderColor:selected===x.family?kindColors['vt'+kind as 'vt2'|'vt3'|'vt4'].line:c.border,
     backgroundColor:selected===x.family?kindColors['vt'+kind as 'vt2'|'vt3'|'vt4'].fill:c.surfaceAlt
    }]}>
    <Text style={{color:c.text,fontWeight:'800',fontSize:11}}>
     {x.family} · {x.postedEvents} cabeza(s)
    </Text>
   </Pressable>)}
  </View>
  <Text style={[s.hint,{color:c.subtext}]}>
   Familia {selected} · {kind===4?'VT4 usa madre VT3 y solo extensiones físicas':
    'La inversión es de familia; las marcas POST exigen el sufijo exacto'}.
   Tocar una familia también permite ver sus celdas en la hoja auxiliar del turno seleccionado.
  </Text></>:<Text style={[s.hint,{color:c.subtext}]}>
   No hay todavía marcas exactas VT{kind} comprobadas hasta {through}.
   No se colorean candidatos como si hubieran salido.
  </Text>}
  <View style={s.timeline}>
   {items.map((item,i)=><View key={item.turn} style={s.timeRow}>
    <View style={[s.timeTrack,{borderColor:c.border}]}>
     <View style={[s.dot,{backgroundColor:item.available?kindColors['vt'+kind as 'vt2'|'vt3'|'vt4'].line:c.border}]}/>
     {i<items.length-1?<View style={[s.trackLine,{backgroundColor:c.border}]}/>:null}
    </View>
    <View style={[s.step,{borderColor:c.border,
     backgroundColor:item.available?c.surfaceAlt:c.surface}]}>
     <Text style={[s.turn,{color:item.available?c.text:c.muted}]}>
      {item.turn} {item.available?'':'· futuro no incluido'}
     </Text>
     {item.available?<View style={s.stepDetails}>
      <Text style={[s.label,{color:c.subtext}]}>
       PRE · {item.change==='SUMA_FUENTE'?'Refuerzo físico nuevo':
        item.change==='MARCA_PERSISTE'?'Marca anterior que persiste':
        item.change==='FORMABLE_SIN_MARCA'?'Formable; aún no marcada':
        'Sin formación física de esta familia'}
      </Text>
      <Text style={[s.details,{color:c.text}]}>
       +11: {item.prePlus.length?item.prePlus.join(' · '):'sin ruta'}
      </Text>
      <Text style={[s.details,{color:c.text}]}>
       Santiago–Neuquén: {item.preAux.length?item.preAux.join(' · '):'sin ruta'}
       {item.crossingAux?' · incluye cruce entre turnos':''}
      </Text>
      {item.priorRoots>0?<Text style={[s.details,{color:c.subtext}]}>
       Marcas anteriores comprobadas: {item.priorRoots} cabeza(s)
       {item.origins.length?' · '+item.origins.map(x=>
        x.turn+' '+x.jur+' '+x.head).join(' / '):''}
      </Text>:null}
      {item.newPlus.length||item.newAux.length?
       <Text style={[s.emphasis,{color:kindColors['vt'+kind as 'vt2'|'vt3'|'vt4'].line}]}>
        Fuentes que se incorporaron ahora:
        {item.newPlus.length?' +11 ['+item.newPlus.join(', ')+']':''}
        {item.newAux.length?' AUX ['+item.newAux.join(', ')+']':''}
       </Text>:null}
      <View style={[s.separator,{backgroundColor:c.border}]}/>
      <Text style={[s.label,{color:c.subtext}]}>
       POST · {item.posted.length?item.posted.length+' cabeza(s) realmente marcadas':
        'Ninguna cabeza comprobada de esta familia'}
      </Text>
      {item.posted.map(post=><Text key={post.key} style={[s.details,{color:c.text}]}>
       {post.jur} {post.head} → {post.exact}
       {' · '}{post.boards.map(x=>x==='PLUS'?'+11':'AUX').join(' + ')}
       {' · '}{post.plusPaths+post.auxPaths} ruta(s) exacta(s)
      </Text>)}
     </View>:<Text style={[s.hint,{color:c.muted}]}>
      No se calculan figuras ni se muestran sorteos posteriores al corte.
     </Text>}
    </View>
   </View>)}
  </View>
  <Text style={[s.hint,{color:c.subtext}]}>
   Los recorridos físicos múltiples explican el mismo evento, no son votos adicionales.
   Esta historia es descriptiva y no modifica los Tops VT2, VT3 ni VT4.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 block:{gap:9,marginTop:4},
 title:{fontSize:12,fontWeight:'900'},
 subtitle:{fontSize:11,fontWeight:'800'},
 hint:{fontSize:11,lineHeight:16},
 wrap:{flexDirection:'row',flexWrap:'wrap'},
 chip:{borderWidth:1,borderRadius:8,padding:7,marginRight:5,marginBottom:5},
 timeline:{gap:0,marginTop:5},
 timeRow:{flexDirection:'row',alignItems:'stretch'},
 timeTrack:{width:20,alignItems:'center'},
 dot:{height:10,width:10,borderRadius:5,marginTop:8},
 trackLine:{width:2,flex:1,marginBottom:0,minHeight:12},
 step:{flex:1,marginBottom:10,borderWidth:1,borderRadius:9,padding:10,gap:4},
 stepDetails:{gap:5},
 turn:{fontSize:12,fontWeight:'900'},
 label:{fontSize:10,fontWeight:'800'},
 details:{fontSize:11,lineHeight:16},
 emphasis:{fontSize:11,fontWeight:'800',lineHeight:16},
 separator:{height:1,opacity:.5,marginVertical:3}
});
