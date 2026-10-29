import React,{useEffect,useMemo,useState} from 'react';
import {Modal,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import type {Turno} from '../domain';
import type {DailySheet,SourceId} from '../sheet';
import type {Path} from '../paths';
import type {LaloView} from '../motorLalo';
import type {InfoVisualDay} from '../infoTurnHistory';
import {readableWeekday} from '../infoTurnHistory';
import {buildVt2FamilyWitnesses} from '../vt2FamilyHistory';
import type {Vt2Witness} from '../vt2FamilyHistory';
import {useLaloTheme} from './LaloTheme';

function MiniColumn({title,source,values,path}:{
 title:string;source:string;values:string[];path:Path
}){
 const {colors:c,kinds}=useLaloTheme();
 const marked=new Map(path.map((cell,i)=>[cell.row+':'+cell.col,i+1]));
 return <View style={[s.board,{backgroundColor:c.board,borderColor:c.border}]}>
  <Text numberOfLines={2} style={[s.boardTitle,{color:c.subtext}]}>{title}</Text>
  <Text numberOfLines={2} style={[s.source,{color:c.muted}]}>{source}</Text>
  {Array.from({length:6},(_,row)=><View key={row} style={s.boardRow}>
   <Text style={[s.rowNo,{color:c.muted}]}>{row+1}</Text>
   {[0,1].map(col=>{
    const index=marked.get(row+':'+col);
    const digit=(values[row]||'--')[col]||'–';
    return <View key={col} style={[s.cell,{
     backgroundColor:index?kinds.vt2.fill:c.cell,
     borderColor:index?kinds.vt2.line:c.border
    }]}>
     <Text style={{fontSize:15,fontWeight:'900',color:index?kinds.vt2.text:c.text}}>{digit}</Text>
     {index?<Text style={[s.cellOrder,{color:kinds.vt2.line}]}>{index}</Text>:null}
    </View>;
   })}
  </View>)}
  <Text style={[s.pathDigits,{color:c.subtext}]}>{path.map(x=>x.digit).join('')}</Text>
 </View>;
}
export default function Vt2FamilyHistoryModal({date,turn,family,view,sheet,days,
 onClose,onOpenCurrent}:{
 date:string;turn:Turno;family:string|null;view:LaloView|null;
 sheet:DailySheet|null;days:InfoVisualDay[];
 onClose:()=>void;onOpenCurrent:()=>void;
}){
 const {colors:c}=useLaloTheme();
 const witnesses=useMemo(()=>family?
  buildVt2FamilyWitnesses(date,turn,family,sheet,days):[],
  [date,turn,family,sheet,days]);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [routeIndex,setRouteIndex]=useState(0);
 useEffect(()=>{setSelectedId(null);setRouteIndex(0)},[family,date,turn]);
 const selected=witnesses.find(x=>x.id===selectedId)||witnesses[0]||null;
 const route=selected?.paths[routeIndex]||selected?.paths[0]||null;
 const current=useMemo(()=>{
  if(!family)return null;
  const rank=view?.ranks.vt2.find(f=>f.family===family);
  for(const r of rank?.paths||[]){
   const column=sheet?.columns.find(c=>c.id===r.sourceId);
   if(!column||r.path.length!==2||
    !r.path.every(x=>column.values[x.row]?.[x.col]===x.digit))continue;
   return {sourceId:r.sourceId,values:column.values,path:r.path,source:column.sourceLabel};
  }
  return null;
 },[family,view,sheet]);
 const summary=selected?
  selected.scope==='HOY'?'Acertó hoy en '+selected.turn:
  'Coincidió el '+readableWeekday(selected.date):'';
 return <Modal transparent visible={!!family} animationType="fade" onRequestClose={onClose}>
  <View style={s.backdrop}>
   <View style={[s.modal,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Text style={[s.title,{color:c.text}]}>Movimientos de la familia {family||''}</Text>
    <Text style={[s.note,{color:c.subtext}]}>
     Se muestran cabezas que realmente coincidieron con recorridos físicos en las últimas
     seis jornadas, y los turnos anteriores de hoy.
    </Text>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator>
     {witnesses.length?<View style={s.witnesses}>
      {witnesses.map(item=><Pressable key={item.id} accessibilityRole="button"
       accessibilityState={{selected:selected?.id===item.id}}
       onPress={()=>{setSelectedId(item.id);setRouteIndex(0)}}
       style={[s.witness,{
        backgroundColor:selected?.id===item.id?c.accentFill:c.card,
        borderColor:selected?.id===item.id?c.accent:c.border
       }]}>
       <View style={s.witnessRow}>
        <Text style={{color:c.text,fontSize:11,fontWeight:'900',flex:1}}>
         {item.scope==='HOY'?'Hoy':readableWeekday(item.date)} · {item.turn}
        </Text>
        <Text style={{color:c.accent,fontSize:10,fontWeight:'800'}}>Ver minihoja ›</Text>
       </View>
       <Text style={{color:c.subtext,fontSize:10}}>
        {item.jurisdiction} {item.head} · {item.paths.length} recorrido(s)
       </Text>
      </Pressable>)}
     </View>:<Text style={[s.note,{color:c.subtext}]}>
      No hay cabezas anteriores con un recorrido VT2 comprobado de esta familia
      entre las jornadas cargadas. La presencia en un ranking, por sí sola, no es un acierto.
     </Text>}
     {selected&&route?<View style={[s.detail,{backgroundColor:c.surfaceAlt}]}>
      <Text style={[s.detailTitle,{color:c.text}]}>{summary}</Text>
      <Text style={[s.note,{color:c.subtext}]}>
       {selected.jurisdiction} · Cabeza {selected.head} · Terminación {selected.value}
      </Text>
      <View style={s.boards}>
       <MiniColumn title="ANTECEDENTE" source={selected.sourceLabel}
        values={selected.values} path={route}/>
       {current?<MiniColumn title="TOP ACTUAL" source={current.source}
        values={current.values} path={current.path}/>:null}
      </View>
      <Text style={[s.note,{color:c.subtext}]}>
       Es la misma familia de dos cifras. El dibujo muestra sus recorridos reales,
       aunque la posición y la orientación de las cifras sean diferentes.
      </Text>
      {selected.paths.length>1?<View style={s.routes}>
       <Pressable accessibilityRole="button" onPress={()=>setRouteIndex(i=>(i-1+selected.paths.length)%selected.paths.length)}
        style={[s.routeButton,{borderColor:c.border}]}>
        <Text style={{color:c.accent,fontWeight:'900'}}>← Anterior</Text>
       </Pressable>
       <Text style={{color:c.subtext,fontSize:11}}>{(routeIndex%selected.paths.length)+1}/{selected.paths.length}</Text>
       <Pressable accessibilityRole="button" onPress={()=>setRouteIndex(i=>(i+1)%selected.paths.length)}
        style={[s.routeButton,{borderColor:c.border}]}>
        <Text style={{color:c.accent,fontWeight:'900'}}>Siguiente →</Text>
       </Pressable>
      </View>:null}
     </View>:null}
    </ScrollView>
    <View style={s.actions}>
     {current?<Pressable accessibilityRole="button" onPress={onOpenCurrent}
      style={[s.button,{borderColor:c.accent,backgroundColor:c.accentFill}]}>
      <Text style={{color:c.accent,fontWeight:'900'}}>Abrir recorrido actual</Text>
     </Pressable>:null}
     <Pressable accessibilityRole="button" onPress={onClose}
      style={[s.button,{borderColor:c.border}]}>
      <Text style={{color:c.text,fontWeight:'900'}}>Cerrar</Text>
     </Pressable>
    </View>
   </View>
  </View>
 </Modal>;
}
const s=StyleSheet.create({
 backdrop:{flex:1,backgroundColor:'rgba(0,0,0,0.76)',justifyContent:'center',padding:13},
 modal:{borderRadius:13,borderWidth:1,padding:14,maxHeight:'91%',gap:8},
 title:{fontSize:16,fontWeight:'900'},note:{fontSize:11,lineHeight:17},
 content:{gap:11,paddingBottom:8},witnesses:{gap:5},
 witness:{borderWidth:1,borderRadius:8,padding:8,gap:4},
 witnessRow:{flexDirection:'row',alignItems:'center',gap:7},
 detail:{padding:10,borderRadius:9,gap:8},
 detailTitle:{fontSize:13,fontWeight:'900'},
 boards:{flexDirection:'row',justifyContent:'center',alignItems:'flex-start',gap:8,flexWrap:'wrap'},
 board:{borderRadius:8,borderWidth:1,padding:8,gap:3,alignItems:'center',width:132},
 boardTitle:{fontWeight:'900',fontSize:11,textAlign:'center'},
 source:{fontSize:9,textAlign:'center',minHeight:23},
 boardRow:{flexDirection:'row',gap:3,alignItems:'center'},
 rowNo:{width:13,fontSize:9,textAlign:'center'},
 cell:{width:34,height:28,borderWidth:1,borderRadius:3,alignItems:'center',justifyContent:'center'},
 cellOrder:{position:'absolute',fontSize:8,fontWeight:'900',right:1,top:0},
 pathDigits:{fontSize:11,fontWeight:'800'},
 routes:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6},
 routeButton:{padding:7,borderRadius:7,borderWidth:1},
 actions:{flexDirection:'row',flexWrap:'wrap',justifyContent:'flex-end',gap:8},
 button:{paddingHorizontal:10,paddingVertical:9,borderRadius:8,borderWidth:1}
});
