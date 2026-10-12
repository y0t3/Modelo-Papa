import React,{useEffect,useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,Modal,StyleSheet} from 'react-native';
import type {DailySheet} from './sheet';
import type {Turno} from './domain';
import {TURNOS} from './domain';
import type {PanoramaData,PanoramaGroup,PanoramaKind} from './panoramaModel';
import MarkedBoard from './ui/MarkedBoard';
import HighlightedHead from './ui/HighlightedHead';
import TurnStrip from './ui/TurnStrip';
import MiniRoutePreview from './ui/MiniRoutePreview';
import {KINDS,KIND_COLOR} from './ui/visualTokens';

/**
 * UI compartida por HOJA y PREDICTIVA.
 * No calcula rutas ni modifica el orden del motor.
 * El tablero permanece por encima del carrusel de un único turno.
 */
export default function PanoramaSheet({sheet,data,mode,target,onInfo,focusedOwner}:{
 sheet:DailySheet;data:PanoramaData;mode:'hoja'|'predictiva';
 target?:Turno;onInfo:()=>void;focusedOwner?:string|null
}){
 const [active,setActive]=useState<string|null>(null);
 const [turn,setTurn]=useState<Turno>('Previa');
 const [showAll,setShowAll]=useState(false);
 const [detail,setDetail]=useState(false);
 useEffect(()=>{
  setActive(focusedOwner||null);
  setTurn('Previa');
  setDetail(false);
  setShowAll(false);
 },[sheet,data,mode,target,focusedOwner]);
 const columns=mode==='predictiva'
  ?sheet.columns.slice(0,TURNOS.indexOf(target||'Previa')+1):sheet.columns;
 const selected=data.groups.find(g=>g.id===active)||null;
 const selectedRoutes=useMemo(()=>active?data.routes.filter(r=>r.ownerId===active):[],[data,active]);
 const totalFigures=useMemo(()=>new Set(data.routes.map(r=>r.id)).size,[data]);
 const currentGroups=mode==='hoja'
  ?data.groups.filter(g=>g.turn===turn)
  :data.groups;
 const displayed=mode==='predictiva'&&!showAll?currentGroups.slice(0,18):currentGroups;
 const select=(id:string)=>{setActive(old=>old===id?null:id);setDetail(false)};
 return <View style={s.surface}>
  <View style={s.top}>
   <View style={{flex:1}}>
    <Text style={s.title}>{mode==='hoja'?'HOJA +11':'HOJA PREDICTIVA'}</Text>
    <Text style={s.note}>{mode==='hoja'?
     'Marcas reales: cabezas publicadas y rutas verificadas':
     'Propuestas del motor semanal · '+(target||'')}</Text>
   </View>
   <Pressable onPress={onInfo} accessibilityRole="button" style={s.action}>
    <Text style={s.actionText}>ⓘ Info</Text>
   </Pressable>
  </View>
  <MarkedBoard columns={columns} routes={data.routes} activeOwner={active}/>
  <View style={s.legend}>
   {KINDS.map(k=><View key={k} style={s.legendItem}>
    <View style={{width:12,height:12,borderRadius:3,borderWidth:2,
     borderColor:KIND_COLOR[k].line,backgroundColor:KIND_COLOR[k].fill}}/>
    <Text style={s.legendText}>{k.toUpperCase()} · {KIND_COLOR[k].label}</Text>
   </View>)}
  </View>
  <View style={s.status}>
   <Text style={s.count} numberOfLines={2}>{selected?
    selected.label+' · '+selectedRoutes.length+' rutas registradas':
    totalFigures+' huellas físicas · todas visibles'}</Text>
   {selected?<View style={s.actions}>
    <Pressable onPress={()=>setDetail(true)} style={s.action}><Text style={s.actionText}>Ver detalle</Text></Pressable>
    <Pressable onPress={()=>setActive(null)} style={s.action}><Text style={s.actionText}>Todas</Text></Pressable>
   </View>:null}
  </View>
  {mode==='hoja'?<>
   <Text style={s.sectionTitle}>CABEZAS DEL TURNO</Text>
   <Text style={s.note}>Deslizá los turnos horizontalmente. La hoja permanece arriba.</Text>
   <TurnStrip value={turn} onChange={t=>{setTurn(t);setActive(null);setDetail(false)}}/>
  </>:<>
   <Text style={s.sectionTitle}>FAMILIAS QUE INTERPRETA EL MOTOR</Text>
   <Text style={s.note}>Tocá una familia para resaltar todas sus rutas. No se crean aquí predicciones adicionales.</Text>
  </>}
  {displayed.length?<ScrollView horizontal showsHorizontalScrollIndicator
   contentContainerStyle={s.cards}>
   {displayed.map(g=><HighlightedHead key={g.id} group={g}
    active={active===g.id} onPress={()=>select(g.id)} mode={mode}/>)}
  </ScrollView>:<Text style={s.empty}>{mode==='hoja'?
   'No hay cabezas publicadas para este turno.':'Sin familias propuestas para el turno elegido.'}</Text>}
  {mode==='predictiva'&&currentGroups.length>18?<Pressable onPress={()=>setShowAll(v=>!v)} style={s.more}>
   <Text style={s.moreText}>{showAll?'Ver menos':'Ver las '+currentGroups.length+' familias'}</Text>
  </Pressable>:null}
  {mode==='hoja'?<Text style={s.note}>Las cabezas sin formación siguen visibles y apagadas. Se resaltan sólo los sufijos VT2, VT3 o VT4 coincidentes.</Text>:
   <Text style={s.warning}>Este panel refleja el motor VT3 vigente. VT2 y VT4 no tienen aquí un ranking independiente confirmado.</Text>}
  <Modal visible={detail} transparent animationType="slide" onRequestClose={()=>setDetail(false)}>
   <View style={s.backdrop}><View style={s.sheet}>
    <View style={s.modalHeading}>
     <Text style={s.modalTitle}>{mode==='hoja'?'Cabeza':'Familia'} {selected?.label||''}</Text>
     <Pressable onPress={()=>setDetail(false)}><Text style={s.close}>Cerrar ×</Text></Pressable>
    </View>
    <Text style={s.note}>{selected?.subtitle||''} · {selectedRoutes.length} rutas, conservadas por fuente y modalidad</Text>
    <ScrollView contentContainerStyle={{paddingBottom:40}}>
     {KINDS.filter(k=>selectedRoutes.some(r=>r.kind===k)).map(k=><View key={k}>
      <Text style={[s.groupTitle,{color:KIND_COLOR[k].line}]}>{k.toUpperCase()}</Text>
      {selectedRoutes.filter(r=>r.kind===k).map(r=>
       <MiniRoutePreview key={r.id+'-'+r.ownerId} sheet={sheet} route={r}/>)}
     </View>)}
     <Text style={[s.note,{marginTop:16}]}>El orden de las casillas figura en cada miniatura. No se añadió ni quitó ningún recorrido al cálculo original.</Text>
    </ScrollView>
   </View></View>
  </Modal>
 </View>;
}
const s=StyleSheet.create({
 surface:{backgroundColor:'#f7f4f8',borderRadius:13,padding:10,marginTop:9,marginBottom:12},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:9,gap:8},
 title:{fontSize:17,fontWeight:'900',color:'#30233e'},
 note:{fontSize:11,color:'#7b6f83',lineHeight:16,marginVertical:4},
 action:{backgroundColor:'#fff',borderRadius:8,borderWidth:1,borderColor:'#d5c7df',paddingHorizontal:9,paddingVertical:7},
 actionText:{fontSize:11,color:'#613f80',fontWeight:'800'},
 legend:{flexDirection:'row',justifyContent:'center',flexWrap:'wrap',gap:9,marginTop:11,marginBottom:5},
 legendItem:{flexDirection:'row',gap:4,alignItems:'center'},
 legendText:{fontSize:10,fontWeight:'700',color:'#66586e'},
 status:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7,marginVertical:9},
 count:{fontSize:11,color:'#44374e',fontWeight:'700',flexShrink:1},
 actions:{flexDirection:'row',gap:5},
 sectionTitle:{fontSize:13,color:'#4a335f',fontWeight:'900',marginTop:9},
 cards:{paddingVertical:10,paddingRight:14},
 empty:{padding:16,fontSize:12,color:'#887c90'},
 warning:{fontSize:11,color:'#7c627e',backgroundColor:'#efe8f3',padding:9,borderRadius:8},
 more:{padding:9,marginVertical:6,backgroundColor:'#e9dff1',borderRadius:8},
 moreText:{textAlign:'center',color:'#5c397d',fontSize:12,fontWeight:'800'},
 backdrop:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(20,12,30,.7)'},
 sheet:{height:'84%',backgroundColor:'#fffafd',padding:16,borderTopLeftRadius:20,borderTopRightRadius:20},
 modalHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:7},
 modalTitle:{color:'#2e203d',fontSize:20,fontWeight:'900',flexShrink:1},
 close:{color:'#75439c',fontWeight:'900',padding:8},
 groupTitle:{fontSize:14,fontWeight:'900',marginTop:14}
});
