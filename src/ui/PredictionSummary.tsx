import React,{useEffect,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {LaloView,LaloKind} from '../motorLalo';
import {KINDS} from './visualTokens';
import {useLaloTheme} from './LaloTheme';

type TopCount=3|5|10;
const defaults:Record<LaloKind,TopCount>={vt2:3,vt3:3,vt4:3};
const explanation:Record<string,string>={
 EN_FORMACIÓN:'En formación',EN_SEGUIMIENTO:'Con antecedentes',CON_APOYO:'Con varios apoyos'
};

export default function PredictionSummary({date,turn,view,onFocus,post}:{
 date:string;turn:Turno;view:LaloView|null;
 onFocus:(id:string)=>void;post?:Record<LaloKind,string[]>|null
}){
 const {colors:c,kinds}=useLaloTheme();
 const [limits,setLimits]=useState<Record<LaloKind,TopCount>>(defaults);
 useEffect(()=>{setLimits(defaults)},[date,turn]);
 return <View style={[s.surface,{backgroundColor:c.surface,borderColor:c.border}]}>
  <Text style={[s.title,{color:c.text}]}>PREDICCIÓN · MODELO LALO</Text>
  <Text style={[s.subtitle,{color:c.subtext}]}>{date} · {turn}</Text>
  <Text style={[s.caution,{color:c.subtext}]}>
   Propuestas experimentales: el puesto no equivale a una probabilidad demostrada.
  </Text>
  {KINDS.map(kind=>{
   const limit=limits[kind],rows=view?.ranks[kind].slice(0,limit)||[];
   return <View key={kind} style={[s.section,{borderTopColor:c.divider}]}>
    <View style={s.headingRow}>
     <Text style={[s.heading,{color:kinds[kind].line}]}>{kind.toUpperCase()} · {kinds[kind].label}</Text>
     <Text style={[s.aux,{color:c.muted}]}>{view?.ranks[kind].length||0} familias</Text>
    </View>
    <View style={s.tabs}>{([3,5,10] as const).map(n=>
     <Pressable key={n} accessibilityRole="button" accessibilityState={{selected:limit===n}}
      onPress={()=>setLimits(prev=>({...prev,[kind]:n}))}
      style={[s.tab,{backgroundColor:limit===n?kinds[kind].fill:c.card,
       borderColor:limit===n?kinds[kind].line:c.border}]}>
      <Text style={{fontSize:11,fontWeight:'900',color:limit===n?kinds[kind].text:c.subtext}}>
       Top {n}
      </Text>
     </Pressable>)}</View>
    {rows.length?<ScrollView horizontal showsHorizontalScrollIndicator
     contentContainerStyle={s.row}>
     {rows.map(f=><Pressable key={f.family} accessibilityRole="button"
      accessibilityLabel={kind.toUpperCase()+', puesto '+f.rank+', familia '+f.family}
      onPress={()=>onFocus(kind+'|'+f.family)}
      style={[s.family,{backgroundColor:c.card,borderColor:c.border}]}>
      <View style={s.familyTitle}>
       <Text style={[s.rank,{color:kinds[kind].line}]}>#{f.rank}</Text>
       <Text numberOfLines={1} adjustsFontSizeToFit style={[s.familyName,{color:c.text}]}>
        {f.family}
       </Text>
      </View>
      <Text numberOfLines={2} style={[s.detail,{color:c.subtext}]}>
       {explanation[f.state]} · {f.rationale}
      </Text>
      <Text style={[s.open,{color:c.accent}]}>Ver recorrido ›</Text>
     </Pressable>)}
    </ScrollView>:<Text style={[s.empty,{color:c.muted}]}>
     {!view?'Cargá una hoja para generar candidatos.':
      'Sin candidatos con recorrido físico válido para esta modalidad.'}
    </Text>}
    {post&&view?<Text style={[s.post,{backgroundColor:c.callout,color:c.subtext}]}>
     POST (Top 10): {post[kind].length?post[kind].join(' · '):'sin coincidencias'}.
    </Text>:null}
   </View>;
  })}
 </View>;
}
const s=StyleSheet.create({
 surface:{borderRadius:13,padding:14,marginTop:10,borderWidth:1},
 title:{fontSize:18,fontWeight:'900'},subtitle:{fontSize:12,fontWeight:'800',marginTop:4},
 caution:{fontSize:11,lineHeight:16,marginTop:8},
 section:{borderTopWidth:1,paddingTop:13,marginTop:12},
 headingRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},
 heading:{fontSize:15,fontWeight:'900'},aux:{fontSize:10,fontWeight:'700'},
 tabs:{flexDirection:'row',gap:7,marginTop:10,marginBottom:8},
 tab:{flex:1,borderWidth:1,borderRadius:9,paddingVertical:8,alignItems:'center'},
 row:{gap:9,paddingRight:15,paddingVertical:6},
 family:{width:174,minHeight:120,borderRadius:11,borderWidth:1,padding:12,justifyContent:'space-between'},
 familyTitle:{flexDirection:'row',alignItems:'center',gap:6},
 rank:{fontSize:13,fontWeight:'900'},
 familyName:{fontSize:17,fontWeight:'900',flexShrink:1},
 detail:{fontSize:10,lineHeight:15,marginTop:7},
 open:{fontSize:11,fontWeight:'900',marginTop:8},
 empty:{fontSize:11,lineHeight:17,marginVertical:7},
 post:{fontSize:10,borderRadius:7,padding:8,marginTop:9}
});
