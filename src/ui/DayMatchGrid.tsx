import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {Turno,CabezasDia} from '../domain';
import {JURS} from '../domain';
import type {DayOverview} from '../homeDaySummary';
import type {LaloKind} from '../motorLalo';
import {useLaloTheme} from './LaloTheme';

type Candidate={kind:LaloKind;family:string;rank:number;
 details:{value:string;head:string;jur:string;turn:Turno}[]};
export function dayCandidates(overview:DayOverview):Candidate[]{
 const found=new Map<string,Candidate>();
 for(const event of overview.matches)for(const m of event.kinds){
  const id=m.kind+'|'+m.family;
  let item=found.get(id);
  if(!item){item={kind:m.kind,family:m.family,rank:m.rank,details:[]};found.set(id,item)}
  const detail={value:event.head.slice(-Number(m.kind.slice(-1))),
   head:event.head,jur:event.jur,turn:event.turn};
  if(!item.details.some(x=>x.head===detail.head&&x.jur===detail.jur&&x.turn===detail.turn))
   item.details.push(detail);
 }
 const order=(k:LaloKind)=>k==='vt2'?0:k==='vt3'?1:2;
 return [...found.values()].sort((a,b)=>order(a.kind)-order(b.kind)||
  a.rank-b.rank||a.family.localeCompare(b.family));
}
export default function DayMatchGrid({overview,turn,data,onOpenHeads,short=false}:{
 overview:DayOverview;turn:Turno;data:CabezasDia|null;
 onOpenHeads:()=>void;short?:boolean
}){
 const {colors:c,kinds}=useLaloTheme();
 const [showAll,setShowAll]=useState(false);
 const matches=useMemo(()=>dayCandidates({...overview,matches:overview.matches.filter(m=>m.turn===turn)}),[overview,turn]);
 const heads=JURS.map(jur=>({jur,head:data?.[turn]?.[jur]||''}))
  .filter(x=>/^\d{4}$/.test(x.head));
 const visible=showAll?matches:matches.slice(0,short?6:6);
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
  {!overview.exactHistory?<Text style={{color:c.subtext,fontSize:12}}>
   Actualizá la hoja para comparar con las listas de Lalo.
  </Text>:overview.countByTurn[turn].heads===0?<Text style={{color:c.subtext,fontSize:12}}>
   Este turno todavía no tiene resultados cargados.
  </Text>:!matches.length?<Text style={{color:c.subtext,fontSize:12}}>
   No hubo coincidencias con los diez primeros de Lalo.
  </Text>:<>
   <View style={s.grid}>{visible.map(item=>{
    const colors=kinds[item.kind];
    const members=[...new Set(item.family.split('/'))];
    const hitValues=new Set(item.details.map(x=>x.value));
    return <View key={item.kind+'|'+item.family} style={[s.tile,{
     borderColor:colors.line,backgroundColor:colors.fill,borderWidth:2}]}>
     <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:2}}>
      {members.map((member,i)=><React.Fragment key={member}>
       {i>0?<Text style={{color:c.subtext,fontSize:14}}>/</Text>:null}
       <Text style={{fontSize:14,fontWeight:'900',color:hitValues.has(member)?colors.text:c.subtext,
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
     {item.details.slice(0,short?1:3).map((x,i)=><Text key={i}
      style={{color:c.text,fontSize:10,lineHeight:15}}>
      {x.head} · {x.jur}{short?'':' · '+x.turn}
     </Text>)}
     {item.details.length>(short?1:3)?<Text style={{color:c.subtext,fontSize:9}}>
      +{item.details.length-(short?1:3)} más
     </Text>:null}
    </View>;
   })}</View>
   {matches.length>(short?3:6)?<Pressable accessibilityRole="button"
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
 grid:{flexDirection:'row',flexWrap:'wrap',gap:'2%',rowGap:8},
 tile:{width:'32%',minHeight:56,borderWidth:1,borderRadius:10,
  padding:7,gap:4},
 button:{borderWidth:1,borderRadius:10,padding:11,alignItems:'center'}
});