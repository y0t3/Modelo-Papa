import React,{useEffect,useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,Modal,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {AuxiliarView,AuxiliarHistory} from '../motorLaloAuxiliar';
import type {AuxiliaryHeads} from '../auxSantiagoNeuquen';
import {auxiliaryBoard} from '../auxSantiagoNeuquen';
import {auxAtCut} from '../auxTemporalModes';
import type {AuxMode} from '../auxTemporalModes';
import {buildAuxPredictiveVisual} from '../auxVisualModel';
import type {AuxVisualKind,AuxVisualGroup} from '../auxVisualModel';
import AuxMarkedBoard from './AuxMarkedBoard';
import AuxRouteMiniPreview from './AuxRouteMiniPreview';
import {KINDS} from './visualTokens';
import {useLaloTheme} from './LaloTheme';
type Filter='all'|AuxVisualKind;
const ALL:AuxVisualKind[]=['vt2','vt3','vt4'];
export default function AuxiliaryPredictiveSheet({
 date,sourceDate,turn,heads,view,history,focusedOwner,auxMode='anterior'
}:{
 date:string;sourceDate:string;turn:Turno;heads:AuxiliaryHeads;auxMode?:AuxMode;
 view:AuxiliarView;history:AuxiliarHistory[];focusedOwner?:string|null
}){
 const {colors:c,kinds}=useLaloTheme();
 const [selected,setSelected]=useState<string|null>(focusedOwner||null);
 const [filter,setFilter]=useState<Filter>('vt2');
 const [topOnly,setTopOnly]=useState(true);
 const [expanded,setExpanded]=useState<Record<AuxVisualKind,boolean>>({
  vt2:true,vt3:false,vt4:false
 });
 const [detail,setDetail]=useState(false);
 const board=useMemo(()=>auxiliaryBoard(auxAtCut(heads,turn,auxMode),turn),[heads,turn,auxMode]);
 const visual=useMemo(()=>buildAuxPredictiveVisual(date,turn,board,view,history,auxMode),
  [date,turn,board,view,history,auxMode]);
 useEffect(()=>{
  setSelected(focusedOwner||null);setDetail(false);
  const m=/^(vt2|vt3|vt4)\|/.exec(focusedOwner||'');
  setFilter(m?m[1] as Filter:'vt2');
 },[date,turn,focusedOwner,view]);
 const byKind=useMemo(()=>Object.fromEntries(ALL.map(kind=>[
  kind,visual.groups.filter(g=>g.id.startsWith(kind+'|'))
 ])) as Record<AuxVisualKind,AuxVisualGroup[]>,[visual]);
 const visible=filter==='all'?ALL.flatMap(kind=>topOnly?byKind[kind].slice(0,10):
  byKind[kind]):topOnly?byKind[filter].slice(0,10):byKind[filter];
 const routes=visual.routes.filter(r=>visible.some(g=>g.id===r.ownerId));
 const selectedRoutes=selected?visual.routes.filter(r=>r.ownerId===selected):[];
 const boardRoutes=selected?selectedRoutes:routes;
 const change=(id:string)=>{setSelected(v=>v===id?null:id);setDetail(false)};
 const renderGroups=(groups:AuxVisualGroup[])=><View style={s.grid}>
  {groups.map(g=>{
   const kind=g.id.split('|')[0] as AuxVisualKind,hot=selected===g.id;
   return <Pressable key={g.id} accessibilityRole="button"
    accessibilityState={{selected:hot}} onPress={()=>change(g.id)}
    style={[s.family,{borderColor:hot?kinds[kind].line:c.border,
     backgroundColor:hot?kinds[kind].fill:c.card}]}>
    <Text style={{color:hot?kinds[kind].text:c.text,fontWeight:'900',fontSize:13}}>
     {g.family}</Text>
    <Text style={{color:c.subtext,fontSize:10}}>{g.subtitle}</Text>
    <Text style={{color:kinds[kind].line,fontSize:10,fontWeight:'800'}}>
     {g.routeCount} recorridos</Text>
   </Pressable>;
  })}
 </View>;
 return <View style={[s.surface,{borderColor:c.border,backgroundColor:c.surface}]}>
  <Text style={[s.title,{color:c.text}]}>HOJA PREDICTIVA · LALO AUXILIAR</Text>
  <Text style={[s.note,{color:c.subtext}]}>
   {turn} · Santiago–Neuquén {auxMode==='intrajornada'?'de HOY (solo cifras disponibles antes de este turno)':'de AYER'}{sourceDate?' ('+sourceDate+')':''}, sin +11.
   Las familias y posiciones proceden de marcas ganadoras históricas.
  </Text>
  <AuxMarkedBoard board={board} routes={routes}
   focusRoutes={selected?selectedRoutes:undefined} focus={!!selected}/>
  <View style={s.legend}>{ALL.map(k=><Text key={k}
   style={{fontWeight:'900',fontSize:11,color:kinds[k].line}}>
   ● {k.toUpperCase()}</Text>)}</View>
  <View style={s.status}>
   <Text style={{color:c.text,fontSize:12,fontWeight:'700',flex:1}}>
    {selected?(selected.split('|')[1]||'')+' · '+selectedRoutes.length+' recorridos':
     routes.length+' recorridos visibles'}
   </Text>
   {selected?<Pressable accessibilityRole="button"
    onPress={()=>setDetail(true)} style={[s.button,{borderColor:c.accent}]}>
    <Text style={{color:c.accent,fontWeight:'900'}}>Ver detalle ›</Text>
   </Pressable>:null}
  </View>
  <Text style={[s.subtitle,{color:c.text}]}>FAMILIAS QUE INTERPRETA EL AUXILIAR</Text>
  <View style={s.tabs}>{(['all',...KINDS] as Filter[]).map(k=>
   <Pressable key={k} accessibilityRole="button"
    accessibilityState={{selected:filter===k}}
    onPress={()=>{setFilter(k);setSelected(null);setDetail(false)}}
    style={[s.button,{borderColor:filter===k?
     k==='all'?c.accent:kinds[k].line:c.border,
     backgroundColor:filter===k?c.accentFill:c.card}]}>
    <Text style={{color:c.text,fontWeight:'900'}}>
     {k==='all'?'Todas':k.toUpperCase()}</Text>
   </Pressable>)}</View>
  <Pressable accessibilityRole="button" onPress={()=>setTopOnly(x=>!x)}
   style={[s.button,{alignSelf:'flex-end',borderColor:c.border}]}>
   <Text style={{color:c.accent,fontWeight:'800'}}>
    {topOnly?'Ver todas las familias':'Solo Top10 por modalidad'}
   </Text>
  </Pressable>
  {filter==='all'?ALL.map(k=><View key={k} style={{paddingVertical:7,
   borderBottomWidth:1,borderBottomColor:c.divider}}>
   <Pressable accessibilityRole="button"
    accessibilityState={{expanded:expanded[k]}}
    onPress={()=>setExpanded(x=>({...x,[k]:!x[k]}))}>
    <Text style={{color:kinds[k].line,fontWeight:'900',fontSize:13}}>
     {expanded[k]?'▾':'▸'} {k.toUpperCase()} ·
     {' '}{byKind[k].length} familias
    </Text>
   </Pressable>
   {expanded[k]?renderGroups(topOnly?byKind[k].slice(0,10):byKind[k]):null}
  </View>):renderGroups(visible)}
  <Text style={[s.note,{color:c.subtext}]}>
   Tocá una familia para ver simultáneamente todos sus recorridos actuales;
   en «Ver detalle» están las mini capturas, sus sentidos y antecedentes
   físicos. Los Tops son experimentales, no probabilidades demostradas.
  </Text>
  <Modal visible={detail} transparent animationType="slide"
   onRequestClose={()=>setDetail(false)}>
   <View style={s.backdrop}><View style={[s.modal,{backgroundColor:c.surface}]}>
    <View style={s.modalTop}>
     <Text style={[s.title,{color:c.text}]}>
      {selected?.startsWith('vt4|')?'VT4 físico':'Familia'}{' '}
      {visual.groups.find(g=>g.id===selected)?.family||selected?.split('|')[1]||''}
     </Text>
     <Pressable accessibilityRole="button" onPress={()=>setDetail(false)}>
      <Text style={{color:c.accent,fontWeight:'900'}}>Cerrar ×</Text>
     </Pressable>
    </View>
    <Text style={[s.note,{color:c.subtext}]}>
     {selectedRoutes.length} rutas físicas actuales · pulsá el origen para
     ver cómo la figura ganadora antigua se proyectó sobre las cifras de hoy.
    </Text>
    <ScrollView contentContainerStyle={{paddingBottom:40}}>
     {selectedRoutes.map(r=><AuxRouteMiniPreview key={r.id}
      route={r} board={board}/>)}
    </ScrollView>
   </View></View>
  </Modal>
 </View>;
}
const s=StyleSheet.create({
 surface:{padding:10,borderWidth:1,borderRadius:13,marginTop:9,gap:8},
 title:{fontSize:16,fontWeight:'900'},subtitle:{fontSize:13,fontWeight:'900'},
 note:{fontSize:11,lineHeight:17},legend:{flexDirection:'row',justifyContent:'center',gap:13},
 tabs:{flexDirection:'row',flexWrap:'wrap',gap:7},
 button:{paddingHorizontal:9,paddingVertical:8,borderWidth:1,borderRadius:9},
 status:{flexDirection:'row',alignItems:'center',gap:7},
 grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:7,marginTop:8},
 family:{width:'48%',padding:10,borderWidth:1,borderRadius:9,gap:5},
 backdrop:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,.7)'},
 modal:{height:'86%',padding:14,borderTopLeftRadius:17,borderTopRightRadius:17},
 modalTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}
});
