import React,{useEffect,useMemo,useState} from 'react';
import BosteroWatermark from './ui/BosteroWatermark';
import {View,Text,Pressable,ScrollView,Modal,StyleSheet} from 'react-native';
import type {DailySheet} from './sheet';
import type {CabezasDia,Turno} from './domain';
import type {InfoVisualDay} from './infoTurnHistory';
import type {AuxiliaryHeads} from './auxSantiagoNeuquen';
import {auxiliaryBoard} from './auxSantiagoNeuquen';
import {auxAtCut} from './auxTemporalModes';
import type {AuxMode} from './auxTemporalModes';
import AuxModeSwitch from './ui/AuxModeSwitch';
import {buildAuxPostLedger} from './auxMarkLedger';
import {buildAuxDailyVisual} from './auxVisualModel';
import AuxMarkedBoard from './ui/AuxMarkedBoard';
import AuxRouteMiniPreview from './ui/AuxRouteMiniPreview';
import {TURNOS} from './domain';
import {routesForDailyTurn} from './panoramaModel';
import type {PanoramaData,PanoramaGroup,PanoramaKind} from './panoramaModel';
import MarkedBoard from './ui/MarkedBoard';
import HighlightedHead from './ui/HighlightedHead';
import TurnStrip from './ui/TurnStrip';
import MiniRoutePreview from './ui/MiniRoutePreview';
import {KINDS} from './ui/visualTokens';
import {useLaloTheme} from './ui/LaloTheme';
import {explainFamilyRationale} from './friendlyExplanations';

type KindFilter='all'|PanoramaKind;
const defaultOpen:Record<PanoramaKind,boolean>={vt2:true,vt3:false,vt4:false};
const detectKind=(id:string|null|undefined):KindFilter=>{
 const prefix=id?.split('|')[0];
 return prefix==='vt2'||prefix==='vt3'||prefix==='vt4'?prefix:'all';
};

export default function PanoramaSheet({sheet,data,mode,target,onInfo,focusedOwner,initialTurn,
 initialTurnOnly=false,auxHeads,auxSourceDate,drawHeads,date='',
 auxMode='anterior',onAuxModeChange,visualDays=[]}:{
 sheet:DailySheet;data:PanoramaData;mode:'hoja'|'predictiva';
 target?:Turno;onInfo:()=>void;focusedOwner?:string|null;initialTurn?:Turno;
 initialTurnOnly?:boolean;auxHeads?:AuxiliaryHeads|null;auxSourceDate?:string|null;drawHeads?:CabezasDia|null;date?:string;
 auxMode?:AuxMode;onAuxModeChange?:(mode:AuxMode)=>void;visualDays?:InfoVisualDay[]
}){
 const {colors:c,kinds}=useLaloTheme();
 const [active,setActive]=useState<string|null>(focusedOwner||null);
 const [turn,setTurn]=useState<Turno>(initialTurn||'Previa');
 const [turnOnly,setTurnOnly]=useState(initialTurnOnly);
 const [filter,setFilter]=useState<KindFilter>(mode==='predictiva'?'vt2':'all');
 const [topOnly,setTopOnly]=useState(true);
 const [expanded,setExpanded]=useState<Record<PanoramaKind,boolean>>(defaultOpen);
 const [detail,setDetail]=useState(false);
 useEffect(()=>{
  setActive(focusedOwner||null);
  setTurn(initialTurn||'Previa');setDetail(false);setTurnOnly(initialTurnOnly);
  setFilter(focusedOwner?detectKind(focusedOwner):mode==='predictiva'?'vt2':'all');
  setTopOnly(true);setExpanded(defaultOpen);
 },[sheet,data,mode,target,focusedOwner,initialTurn,initialTurnOnly]);
 const ledger=useMemo(()=>mode==='hoja'&&auxHeads&&drawHeads?
  buildAuxPostLedger(date,auxHeads,drawHeads,sheet,'Nocturno',auxMode):null,
  [mode,auxHeads,drawHeads,sheet,date,auxMode]);
 const auxBoard=useMemo(()=>{
  if(!auxHeads)return null;
  const cut=mode==='hoja'&&auxMode==='intrajornada'&&(turnOnly||active)?turn:'Nocturno';
  return auxiliaryBoard(auxAtCut(auxHeads,cut,auxMode),cut);
 },[auxHeads,mode,auxMode,turnOnly,active,turn]);
 const auxVisual=useMemo(()=>ledger&&auxBoard?buildAuxDailyVisual(ledger,auxBoard):null,
  [ledger,auxBoard]);
 const combinedGroups=useMemo(()=>{
  if(mode!=='hoja'||!auxVisual)return data.groups;
  const added=new Map(auxVisual.groups.map(g=>[g.id,g]));
  return data.groups.map(g=>{
   const extra=added.get(g.id);if(!extra)return g;
   return {...g,routeCount:g.routeCount+extra.routeCount,
    kinds:[...new Set([...g.kinds,...extra.kinds])],subtitle:g.subtitle};
  });
 },[mode,data.groups,auxVisual]);
 const columns=mode==='predictiva'
  ?sheet.columns.slice(0,TURNOS.indexOf(target||'Previa')+1):sheet.columns;
 const byKind=useMemo(()=>({
  vt2:data.groups.filter(g=>g.id.startsWith('vt2|')),
  vt3:data.groups.filter(g=>g.id.startsWith('vt3|')),
  vt4:data.groups.filter(g=>g.id.startsWith('vt4|'))
 }),[data.groups]);
 const visibleGroups=useMemo(()=>{
  if(mode==='hoja')return combinedGroups.filter(g=>g.turn===turn);
  const ks=filter==='all'?KINDS:[filter];
  return ks.flatMap(k=>topOnly?byKind[k].slice(0,10):byKind[k]);
 },[mode,data.groups,combinedGroups,turn,filter,topOnly,byKind]);
 const visibleIds=useMemo(()=>new Set(visibleGroups.map(g=>g.id)),[visibleGroups]);
 const boardRoutes=useMemo(()=>{
  if(mode==='hoja'){
   if(active)return data.routes.filter(r=>r.ownerId===active);
   return turnOnly?routesForDailyTurn(data,turn):data.routes;
  }
  if(active)return data.routes.filter(r=>r.ownerId===active);
  return data.routes.filter(r=>visibleIds.has(r.ownerId));
 },[mode,data,visibleIds,active,turnOnly,turn]);
 const auxHighlighted=useMemo(()=>{
  if(!auxVisual)return [];
  if(active)return auxVisual.routes.filter(r=>r.ownerId===active);
  if(turnOnly)return auxVisual.routes.filter(r=>auxVisual.groups.some(g=>
   g.turn===turn&&g.id===r.ownerId));
  return auxVisual.routes;
 },[auxVisual,active,turnOnly,turn]);
 const selected=combinedGroups.find(g=>g.id===active)||null;
 const selectedRoutes=useMemo(()=>active?boardRoutes.filter(r=>r.ownerId===active):[],
  [boardRoutes,active]);
 const uniqueRoutes=useMemo(()=>new Set(boardRoutes.map(r=>r.id)).size,[boardRoutes]);
 const select=(id:string)=>{
  const owner=combinedGroups.find(g=>g.id===id);
  if(owner?.turn)setTurn(owner.turn);
  setActive(old=>old===id?null:id);setTurnOnly(false);setDetail(false)
 };
 const changeHojaTurn=(t:Turno)=>{
  setTurn(t);setTurnOnly(true);setActive(null);setDetail(false);
 };
 const showAllHoja=()=>{setActive(null);setTurnOnly(false);setDetail(false)};
 const changeFilter=(next:KindFilter)=>{setFilter(next);setActive(null);setDetail(false)};
 const toggleExpanded=(kind:PanoramaKind)=>setExpanded(prev=>({...prev,[kind]:!prev[kind]}));
 const renderGrid=(items:PanoramaGroup[])=><View style={s.grid}>
  {items.map(g=><HighlightedHead key={g.id} group={g} active={active===g.id}
   onPress={()=>select(g.id)} mode="predictiva" layout="grid"/>)}
 </View>;
 return <View style={[s.surface,{backgroundColor:c.surface,borderColor:'#B9903F'}]}>
  <View style={[s.top,{position:'relative',overflow:'hidden',minHeight:93,paddingVertical:8}]}>
   <BosteroWatermark opacity={0.3}/>
   <View style={{flex:1}}>
    <Text style={[s.title,{color:c.accent}]}>{mode==='hoja'?'HOJA +11':'HOJA PREDICTIVA'}</Text>
    <Text style={[s.note,{color:c.subtext}]}>{mode==='hoja'?
     'Marcas reales: cabezas publicadas y rutas verificadas':
     'Propuestas físicas del Motor Lalo · '+(target||'')}</Text>
   </View>
   <Pressable onPress={onInfo} accessibilityRole="button"
    style={[s.action,{backgroundColor:c.card,borderColor:c.border}]}>
    <Text style={[s.actionText,{color:c.accent}]}>ⓘ Info</Text>
   </Pressable>
  </View>
  {mode==='hoja'?<View style={s.turnFilter}>
   <Text style={[s.sectionTitle,{color:c.text}]}>RECORRIDOS POR TURNO</Text>
   <Text style={[s.note,{color:c.subtext}]}>
    Tocá un turno para ver juntas todas las coincidencias físicas de sus cabezas.
   </Text>
   <TurnStrip value={turn} onChange={changeHojaTurn}/>
   <View style={s.turnActions}>
    <Pressable accessibilityRole="button"
     accessibilityLabel="Ver recorridos de todos los turnos"
     accessibilityState={{selected:!turnOnly&&!active}}
     onPress={showAllHoja} style={[s.turnChip,{
      borderColor:!turnOnly&&!active?c.accent:c.border,
      backgroundColor:!turnOnly&&!active?c.accentFill:c.card}]}>
     <Text style={[s.turnChipText,{color:!turnOnly&&!active?c.accent:c.subtext}]}>
      Toda la hoja
     </Text>
    </Pressable>
    <Pressable accessibilityRole="button"
     accessibilityLabel={'Resaltar todos los recorridos de '+turn}
     accessibilityState={{selected:turnOnly}}
     onPress={()=>{setTurnOnly(true);setActive(null);setDetail(false)}}
     style={[s.turnChip,{borderColor:turnOnly?c.accent:c.border,
      backgroundColor:turnOnly?c.accentFill:c.card}]}>
     <Text style={[s.turnChipText,{color:turnOnly?c.accent:c.subtext}]}>
      {turnOnly?'✓ ':''}Solo {turn}
     </Text>
    </Pressable>
   </View>
  </View>:null}
  <MarkedBoard columns={columns}
   routes={mode==='hoja'?data.routes:boardRoutes}
   highlightRoutes={mode==='hoja'&&(turnOnly||active!==null)?boardRoutes:undefined}
   activeOwner={mode==='hoja'?null:active}/>
  {mode==='hoja'?<View style={{marginTop:13,gap:7}}>
   {onAuxModeChange?<AuxModeSwitch value={auxMode} onChange={onAuxModeChange}/>:null}
   {auxBoard&&auxVisual?<>
   <Text style={[s.title,{color:c.text}]}>HOJA SANTIAGO–NEUQUÉN</Text>
   <Text style={[s.note,{color:c.subtext}]}>
    {auxMode==='intrajornada'? 'HOY · '+date+' · se incorporan las franjas al publicarse sus sorteos.':
     'AYER · '+(auxSourceDate||'jornada anterior')+' · grilla completa desde Previa.'}
   </Text>
   <AuxMarkedBoard board={auxBoard} routes={auxVisual.routes}
    focusRoutes={turnOnly||active!==null?auxHighlighted:undefined}
    focus={turnOnly||active!==null}/>
   <Text style={[s.note,{color:c.subtext}]}>
    La selección de una cabeza resalta TODOS sus recorridos exactos en ambas
    hojas simultáneamente. Las rutas que cruzan franjas pertenecen solo a AUX.
   </Text>
   </>:<Text style={[s.note,{color:c.muted}]}>No hay cifras AUX disponibles para este modo y fecha.</Text>}
  </View>:null}
  <View style={s.legend}>{KINDS.map(k=><View key={k} style={s.legendItem}>
   <View style={{width:12,height:12,borderRadius:3,borderWidth:2,
    borderColor:kinds[k].line,backgroundColor:kinds[k].fill}}/>
   <Text style={[s.legendText,{color:c.subtext}]}>{k.toUpperCase()} · {kinds[k].label}</Text>
  </View>)}</View>
  <View style={s.status}>
   <Text style={[s.count,{color:c.text}]} numberOfLines={2}>{selected?
    selected.label+' · '+(selectedRoutes.length+(auxVisual?.routes.filter(r=>r.ownerId===selected.id).length||0))+' recorridos en ambas hojas':
    mode==='hoja'?turnOnly?turn+' · '+visibleGroups.filter(g=>g.routeCount>0).length+' cabezas con marca · '+uniqueRoutes+' recorridos':uniqueRoutes+' huellas físicas · tablero completo':
    uniqueRoutes+' huellas visibles con el filtro actual'}</Text>
   {selected?<View style={s.actions}>
    <Pressable onPress={()=>setDetail(true)} style={[s.action,{backgroundColor:c.card,borderColor:c.border}]}>
     <Text style={[s.actionText,{color:c.accent}]}>Ver detalle</Text>
    </Pressable>
    <Pressable onPress={()=>setActive(null)} style={[s.action,{backgroundColor:c.card,borderColor:c.border}]}>
     <Text style={[s.actionText,{color:c.accent}]}>Todas</Text>
    </Pressable>
   </View>:null}
  </View>
  {mode==='hoja'?<>
   <Text style={[s.sectionTitle,{color:c.text}]}>CABEZAS DEL TURNO</Text>
   <Text style={[s.note,{color:c.subtext}]}>Seleccioná una cabeza para aislar sus recorridos o usá el chip de turno para verlos todos juntos.</Text>
   {visibleGroups.length?<ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={s.cards}>
    {visibleGroups.map(g=><HighlightedHead key={g.id} group={g}
     active={active===g.id} onPress={()=>select(g.id)} mode="hoja"/>)}
   </ScrollView>:<Text style={[s.empty,{color:c.muted}]}>No hay cabezas publicadas para este turno.</Text>}
   <Text style={[s.note,{color:c.subtext}]}>Las cabezas sin formación permanecen apagadas; los sufijos coincidentes se resaltan.</Text>
  </>:<>
   <Text style={[s.sectionTitle,{color:c.text}]}>FAMILIAS QUE INTERPRETA EL MOTOR</Text>
   <Text style={[s.note,{color:c.subtext}]}>Elegí una modalidad y tocá una familia para ver sólo sus recorridos.</Text>
   <View style={s.filters}>
    {(['all',...KINDS] as KindFilter[]).map(k=><Pressable key={k}
     accessibilityRole="button" accessibilityState={{selected:filter===k}}
     onPress={()=>changeFilter(k)} style={[s.filter,{borderColor:filter===k?
      (k==='all'?c.accent:kinds[k].line):c.border,
      backgroundColor:filter===k?(k==='all'?c.accentFill:kinds[k].fill):c.card}]}>
     <Text style={{fontWeight:'900',fontSize:12,color:filter===k?
      (k==='all'?c.accent:kinds[k].text):c.subtext}}>
      {k==='all'?'Todas':k.toUpperCase()} {k==='all'?data.groups.length:byKind[k].length}
     </Text>
    </Pressable>)}
   </View>
   <View style={s.scope}>
    <Text style={[s.scopeText,{color:c.subtext}]}>
     {topOnly?'Mostrando hasta 10 familias por modalidad':'Mostrando todas las familias de la selección'}
    </Text>
    <Pressable accessibilityRole="button" onPress={()=>{
     setTopOnly(x=>!x);setActive(null);setDetail(false);
    }} style={[s.scopeButton,{backgroundColor:c.accentFill,borderColor:c.border}]}>
     <Text style={{fontSize:11,fontWeight:'900',color:c.accent}}>
      {topOnly?'Ver todas':'Solo Top 10'}
     </Text>
    </Pressable>
   </View>
   {filter==='all'?KINDS.map(k=>{
    const items=topOnly?byKind[k].slice(0,10):byKind[k];
    return <View key={k} style={[s.category,{borderColor:c.divider}]}>
     <Pressable accessibilityRole="button"
      accessibilityState={{expanded:expanded[k]}}
      onPress={()=>toggleExpanded(k)} style={s.categoryHeader}>
      <Text style={[s.categoryTitle,{color:kinds[k].line}]}>
       {expanded[k]?'▾':'▸'} {k.toUpperCase()} · {kinds[k].label}
      </Text>
      <Text style={[s.categoryCount,{color:c.subtext}]}>{items.length} visibles · {byKind[k].length} total</Text>
     </Pressable>
     {expanded[k]?(items.length?renderGrid(items):
      <Text style={[s.empty,{color:c.muted}]}>Sin familias de esta modalidad.</Text>):null}
    </View>;
   }):<View style={{marginTop:8}}>
    {visibleGroups.length?renderGrid(visibleGroups):
     <Text style={[s.empty,{color:c.muted}]}>Sin familias con recorrido físico para esta modalidad.</Text>}
   </View>}
   <Text style={[s.warning,{color:c.subtext,backgroundColor:c.callout}]}>
    Los filtros muestran recorridos de 2, 3 o 4 cifras. Sólo cambian lo que ves, no las propuestas del motor.
   </Text>
  </>}
  <Modal visible={detail} transparent animationType="slide" onRequestClose={()=>setDetail(false)}>
   <View style={s.backdrop}><View style={[s.sheet,{backgroundColor:c.surface}]}>
    <View style={s.modalHeading}>
     <Text style={[s.modalTitle,{color:c.text}]}>{mode==='hoja'?'Cabeza':'Familia'} {selected?.label||''}</Text>
     <Pressable onPress={()=>setDetail(false)} accessibilityRole="button">
      <Text style={[s.close,{color:c.accent}]}>Cerrar ×</Text>
     </Pressable>
    </View>
    <Text style={[s.note,{color:c.subtext}]}>{selected?(mode==='predictiva'?explainFamilyRationale(selected.subtitle):selected.subtitle):''} · {selectedRoutes.length} caminos en la hoja</Text>
    <ScrollView contentContainerStyle={{paddingBottom:40}}>
     {mode==='hoja'&&auxVisual&&auxBoard&&selected?<View style={{gap:5}}>
      <Text style={[s.groupTitle,{color:c.text}]}>Recorridos de la hoja auxiliar</Text>
      <AuxMarkedBoard board={auxBoard} routes={auxVisual.routes}
       focusRoutes={auxVisual.routes.filter(r=>r.ownerId===selected.id)} focus/>
      <Text style={[s.note,{color:c.subtext}]}>
       {auxVisual.routes.filter(r=>r.ownerId===selected.id).length} recorridos AUX
       contiguos que forman los sufijos exactos de la cabeza publicada.
      </Text>
      {auxVisual.routes.filter(r=>r.ownerId===selected.id).map(route=>
       <AuxRouteMiniPreview key={route.id} board={auxBoard} route={route}/>)}
     </View>:null}
     {KINDS.filter(k=>selectedRoutes.some(r=>r.kind===k)).map(k=><View key={k}>
      <Text style={[s.groupTitle,{color:kinds[k].line}]}>{kinds[k].label}</Text>
      {selectedRoutes.filter(r=>r.kind===k).map(r=>
       <MiniRoutePreview key={r.id+'-'+r.ownerId} sheet={sheet} route={r}
        date={mode==='predictiva'?date:''} turn={target} days={visualDays}/>)}
     </View>)}
     <Text style={[s.note,{color:c.subtext,marginTop:16}]}>
      El orden físico se indica en cada miniatura. Ningún recorrido fue añadido por el filtro.
     </Text>
    </ScrollView>
   </View></View>
  </Modal>
 </View>;
}
const s=StyleSheet.create({
 surface:{borderRadius:14,padding:10,marginTop:9,marginBottom:12,borderWidth:1.3},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:9,gap:8},
 title:{fontSize:20,fontWeight:'900',fontStyle:'italic'},note:{fontSize:11,lineHeight:17,marginVertical:4},
 action:{borderRadius:8,borderWidth:1,paddingHorizontal:9,paddingVertical:7},
 actionText:{fontSize:11,fontWeight:'800'},
 legend:{flexDirection:'row',justifyContent:'center',flexWrap:'wrap',gap:9,marginTop:11,marginBottom:5},
 legendItem:{flexDirection:'row',gap:4,alignItems:'center'},legendText:{fontSize:10,fontWeight:'700'},
 status:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7,marginVertical:9},
 turnFilter:{gap:3,marginBottom:7},
 turnActions:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:5,marginBottom:4},
 turnChip:{minHeight:37,borderWidth:1,borderRadius:20,paddingHorizontal:14,justifyContent:'center'},
 turnChipText:{fontSize:11,fontWeight:'900'},
 count:{fontSize:11,fontWeight:'700',flexShrink:1},actions:{flexDirection:'row',gap:5},
 sectionTitle:{fontSize:13,fontWeight:'900',marginTop:9},
 cards:{paddingVertical:10,paddingRight:14},
 empty:{padding:16,fontSize:12},
 warning:{fontSize:11,padding:9,borderRadius:8,marginTop:14,lineHeight:16},
 filters:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:10},
 filter:{minHeight:39,borderWidth:1,borderRadius:12,paddingHorizontal:11,
  justifyContent:'center',alignItems:'center'},
 scope:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8,marginTop:11},
 scopeText:{fontSize:10,flex:1},scopeButton:{borderWidth:1,borderRadius:8,paddingHorizontal:12,paddingVertical:8},
 category:{borderBottomWidth:1,marginTop:6,paddingBottom:4},
 categoryHeader:{minHeight:46,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
 categoryTitle:{fontSize:13,fontWeight:'900'},categoryCount:{fontSize:10},
 grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',paddingTop:7},
 backdrop:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,.72)'},
 sheet:{height:'84%',padding:16,borderTopLeftRadius:20,borderTopRightRadius:20},
 modalHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:7},
 modalTitle:{fontSize:20,fontWeight:'900',flexShrink:1},close:{fontWeight:'900',padding:8},
 groupTitle:{fontSize:14,fontWeight:'900',marginTop:14}
});
