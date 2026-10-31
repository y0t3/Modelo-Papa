import React,{useEffect,useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {Turno,CabezasDia} from '../domain';
import {JURS} from '../domain';
import {dayCandidates,auxDayCandidates} from '../dayMatchCandidates';
export {dayCandidates,auxDayCandidates} from '../dayMatchCandidates';
import type {DayOverview} from '../homeDaySummary';
import type {AuxiliarView} from '../motorLaloAuxiliar';
import {useLaloTheme} from './LaloTheme';

type Model='lalo'|'ayer'|'hoy';

export default function DayMatchGrid({overview,turn,data,onOpenHeads,short=false,
 auxAyer=null,auxHoy=null}:{
 overview:DayOverview;turn:Turno;data:CabezasDia|null;
 onOpenHeads:()=>void;short?:boolean;
 auxAyer?:AuxiliarView|null;auxHoy?:AuxiliarView|null;
}){
 const {colors:c,kinds}=useLaloTheme();
 const [selected,setSelected]=useState<Model>('lalo');
 const [showAll,setShowAll]=useState(false);
 useEffect(()=>{setShowAll(false)},[turn,selected]);
 const mainMatches=useMemo(()=>dayCandidates(overview,turn),[overview,turn]);
 const ayerMatches=useMemo(()=>auxDayCandidates(auxAyer,data,turn),[auxAyer,data,turn]);
 const hoyMatches=useMemo(()=>auxDayCandidates(auxHoy,data,turn),[auxHoy,data,turn]);
 const matches=selected==='lalo'?mainMatches:selected==='ayer'?ayerMatches:hoyMatches;
 const ready=selected==='lalo'?overview.exactHistory:
  selected==='ayer'?!!auxAyer&&auxAyer.turn===turn:!!auxHoy&&auxHoy.turn===turn;
 const heads=JURS.map(jur=>({jur,head:data?.[turn]?.[jur]||''}))
  .filter(x=>/^\d{4}$/.test(x.head));
 const maxDisplayed=short?6:6;
 const visible=showAll?matches:matches.slice(0,maxDisplayed);
 return <View style={s.root}>
  <Text style={{fontSize:11,color:c.subtext}}>{overview.statusText}</Text>
  <Text style={[s.heading,{color:c.text}]}>Cabezas de {turn}</Text>
  {heads.length?<View style={s.grid}>
   {heads.map(h=><View key={h.jur} style={[s.tile,{borderColor:c.border,
    backgroundColor:c.surfaceAlt}]}>
    <Text numberOfLines={1} style={{color:c.subtext,fontSize:10}}>{h.jur}</Text>
    <Text style={{fontSize:15,fontWeight:'900',color:c.text}}>{h.head}</Text>
   </View>)}
  </View>:<Text style={{color:c.subtext,fontSize:12}}>
   Todavía no salieron cabezas en este turno.
  </Text>}
  <Text style={[s.heading,{color:c.text}]}>Los números que coincidieron</Text>
  <View style={s.chips}>
   {([
    {id:'lalo',label:'Lalo'},
    {id:'ayer',label:'Aux ayer'},
    {id:'hoy',label:'Aux hoy'}
   ] as const).map(model=><Pressable key={model.id} accessibilityRole="button"
    accessibilityState={{selected:selected===model.id}}
    accessibilityLabel={'Ver coincidencias de '+model.label}
    onPress={()=>setSelected(model.id)}
    style={[s.chip,{backgroundColor:selected===model.id?c.accent:c.surfaceAlt,
     borderColor:selected===model.id?c.accent:c.border}]}>
    <Text style={{fontSize:11,fontWeight:'900',
     color:selected===model.id?'#08254C':c.subtext}}>{model.label}</Text>
   </Pressable>)}
  </View>
  {!ready?<Text style={{color:c.subtext,fontSize:12,lineHeight:17}}>
   {selected==='lalo'?'Actualizá la hoja para comparar con las listas de Lalo.':
    'No están disponibles los antecedentes de Aux '+(selected==='ayer'?'ayer':'hoy')+
    ' para este turno. Actualizá las hojas.'}
  </Text>:heads.length===0?<Text style={{color:c.subtext,fontSize:12}}>
   Este turno todavía no tiene resultados cargados.
  </Text>:!matches.length?<Text style={{color:c.subtext,fontSize:12}}>
   No hubo coincidencias con los diez primeros de {selected==='lalo'?'Lalo':
    selected==='ayer'?'Auxiliar ayer':'Auxiliar hoy'}.
  </Text>:<>
   <View style={s.grid}>{visible.map(item=>{
    const colors=kinds[item.kind];
    const members=[...new Set(item.family.split('/'))];
    const hitValues=new Set(item.details.map(x=>x.value));
    return <View key={item.kind+'|'+item.family} style={[s.tile,{
     borderColor:colors.line,backgroundColor:colors.fill,borderWidth:2}]}>
     <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:2}}>
      {members.map((member,i)=><React.Fragment key={member+'|'+i}>
       {i>0?<Text style={{color:c.subtext,fontSize:14}}>/</Text>:null}
       <Text style={{fontSize:14,fontWeight:'900',
        color:hitValues.has(member)?colors.text:c.subtext,
        borderWidth:hitValues.has(member)?1.7:0,
        borderColor:colors.line,backgroundColor:hitValues.has(member)?c.card:'transparent',
        paddingHorizontal:hitValues.has(member)?4:0,
        paddingVertical:hitValues.has(member)?2:0,
        borderRadius:5,overflow:'hidden'}}>{member}</Text>
      </React.Fragment>)}
     </View>
     <Text style={{fontSize:10,fontWeight:'800',color:colors.text}}>
      {item.kind==='vt2'?'2':item.kind==='vt3'?'3':'4'} cifras · #{item.rank}
     </Text>
     {item.details.map((x,i)=><Text key={x.head+'|'+x.jur+'|'+i}
      style={{color:c.text,fontSize:10,lineHeight:15}}>
      {x.head} · {x.jur}{short?'':' · '+x.turn}
     </Text>)}
    </View>;
   })}</View>
   {matches.length>maxDisplayed?<Pressable accessibilityRole="button"
    onPress={()=>setShowAll(v=>!v)}
    style={[s.button,{borderColor:c.accent}]}>
    <Text style={{color:c.accent,fontWeight:'900'}}>
     {showAll?'Mostrar menos':'Ver todos los candidatos que coincidieron'}
    </Text>
   </Pressable>:null}
  </>}
  <Pressable accessibilityRole="button" onPress={onOpenHeads}
   style={[s.button,{borderColor:c.accent}]}>
   <Text style={{color:c.accent,fontWeight:'900'}}>Ver cabezas completas  ›</Text>
  </Pressable>
  <Text style={{color:c.muted,fontSize:10,lineHeight:16}}>
   Coincidencias reconstruidas según los resultados publicados. No son jugadas guardadas.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 root:{gap:10},
 heading:{fontSize:17,fontWeight:'900'},
 chips:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:-2},
 chip:{borderWidth:1.1,borderRadius:20,paddingVertical:8,paddingHorizontal:12,
  minWidth:78,alignItems:'center'},
 grid:{flexDirection:'row',flexWrap:'wrap',columnGap:'2%',rowGap:8},
 tile:{width:'32%',minHeight:56,borderWidth:1,borderRadius:10,
  padding:7,gap:4},
 button:{borderWidth:1,borderRadius:10,padding:11,alignItems:'center'}
});