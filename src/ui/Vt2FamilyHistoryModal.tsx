import React,{useMemo} from 'react';
import {Modal,Pressable,ScrollView,Text,View} from 'react-native';
import type {Turno} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloView} from '../motorLalo';
import type {InfoVisualDay} from '../infoTurnHistory';
import {readableWeekday} from '../infoTurnHistory';
import RouteMiniBoard from './RouteMiniBoard';
import {useLaloTheme} from './LaloTheme';

/** Mostrar únicamente raíces que intervinieron en los recorridos rankeados. */
export default function Vt2FamilyHistoryModal({family,view,days,onClose}:{
 date:string;turn:Turno;family:string|null;view:LaloView|null;
 sheet:DailySheet|null;days:InfoVisualDay[];
 onClose:()=>void;onOpenCurrent:()=>void
}){
 const {colors:c,kinds}=useLaloTheme();
 const roots=useMemo(()=>{
  const candidate=view?.ranks.vt2.find(f=>f.family===family);
  if(!candidate||!view)return [];
  const ids=[...new Set(candidate.paths.flatMap(p=>p.rootIds))];
  return ids.flatMap(id=>{
   const ref=view.roots.find(r=>r.id===id);
   if(!ref)return [];
   const column=days.find(d=>d.date===ref.date)?.sheet.columns.find(
    source=>source.id===ref.sourceId);
   const cells=ref.oldCells.map(x=>{
    const m=/^([0-5]):([01])$/.exec(x);
    return m?{row:Number(m[1]),col:Number(m[2])}:null;
   }).filter((p):p is {row:number;col:number}=>p!==null);
   const reading=column&&cells.length===2?cells.map(
    p=>column.values[p.row]?.[p.col]||''
   ).join(''):'';
   return [{ref,values:column&&/^\d{2}$/.test(reading)&&
    ref.head.endsWith(reading)?column.values:null,
    cells,reading}];
  });
 },[family,view,days]);
 return <Modal visible={!!family} transparent animationType="fade"
  onRequestClose={onClose}>
  <View style={{flex:1,justifyContent:'center',padding:13,
   backgroundColor:'rgba(0,0,0,0.77)'}}>
   <View style={{borderRadius:13,borderWidth:1,borderColor:c.border,
    backgroundColor:c.surface,padding:12,gap:9,maxHeight:'80%'}}>
    <Text style={{color:c.text,fontSize:16,fontWeight:'900'}}>
     {family} · Respaldo de Lalo
    </Text>
    <Text style={{color:c.subtext,fontSize:11}}>
     Estas son las {roots.length} raíces que Lalo usó. Deslizá para ver las demás.
    </Text>
    <Text style={{color:kinds.vt2.line,fontWeight:'900',fontSize:12}}>
     RAÍCES QUE LALO EFECTIVAMENTE UTILIZÓ
    </Text>
    {roots.length?<ScrollView horizontal nestedScrollEnabled
     showsHorizontalScrollIndicator contentContainerStyle={{gap:9,paddingBottom:4}}>
     {roots.map(({ref,values,cells,reading})=><View key={ref.id}
      style={{width:170,borderWidth:1,borderColor:c.border,borderRadius:9,
       backgroundColor:c.card,padding:8,gap:6}}>
      <Text style={{fontSize:11,color:c.text,fontWeight:'900'}}>
       {readableWeekday(ref.date)} · {ref.oldTurn}
      </Text>
      <Text style={{fontSize:11,color:c.subtext}}>
       {ref.jurisdiction} {ref.head} · {ref.period}
      </Text>
      {values?<RouteMiniBoard values={values} cells={cells} kind="vt2"
       compact/>:<Text style={{fontSize:11,color:c.muted}}>
       Minihoja no disponible
      </Text>}
      <Text style={{fontSize:10,color:c.subtext}}>
       {ref.sourceId} · {reading||'Raíz registrada'}
      </Text>
     </View>)}
    </ScrollView>:<Text style={{color:c.subtext,fontSize:11}}>
     No hay raíces disponibles de esta familia en el historial cargado.
    </Text>}
    <Pressable accessibilityRole="button" onPress={onClose}
     style={{backgroundColor:c.button,alignSelf:'flex-end',paddingHorizontal:20,
      paddingVertical:10,borderRadius:8}}>
     <Text style={{fontWeight:'900',color:c.buttonText}}>Cerrar</Text>
    </Pressable>
   </View>
  </View>
 </Modal>;
}