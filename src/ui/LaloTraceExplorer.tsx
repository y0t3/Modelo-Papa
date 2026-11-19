import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,Modal,ScrollView} from 'react-native';
import type {LaloHistorical,LaloView,LaloKind} from '../motorLalo';
import type {TurnHistoryFrame} from '../infoTurnHistory';
import type {PanoramaRoute} from '../panoramaModel';
import {buildPredictivePanorama} from '../panoramaModel';
import RouteMiniBoard from './RouteMiniBoard';
import {useLaloTheme} from './LaloTheme';

const KINDS:LaloKind[]=['vt2','vt3','vt4'];
export default function LaloTraceExplorer({frame,view,historical}:{
 frame:TurnHistoryFrame;view:LaloView|null;historical:LaloHistorical[]
}){
 const {colors:c,kinds}=useLaloTheme();
 const [kind,setKind]=useState<LaloKind>('vt2');
 const [selected,setSelected]=useState<string|null>(null);
 const [pathIndex,setPathIndex]=useState(0);
 const [rootIndex,setRootIndex]=useState(0);
 const routes=useMemo(()=>view?buildPredictivePanorama(view,historical).routes:[],
  [view,historical]);
 const families=view?.ranks[kind].slice(0,10)||[];
 const family=families.find(x=>x.family===selected)||null;
 const related=routes.filter(x=>x.ownerId===kind+'|'+selected);
 const route=related[pathIndex%Math.max(related.length,1)]||null;
 const old=route?.antecedents||[];
 const antecedent=old[rootIndex%Math.max(old.length,1)]||null;
 const source=frame.sheet.columns.find(x=>x.id===route?.sourceId);
 const close=()=>{setSelected(null);setPathIndex(0);setRootIndex(0)};
 const action=(name:string,fn:()=>void)=><Pressable accessibilityRole="button"
  onPress={fn} style={{paddingHorizontal:12,paddingVertical:10,borderRadius:9,
   borderWidth:1,borderColor:c.accent,backgroundColor:c.accentFill}}>
  <Text style={{color:c.accent,fontWeight:'900',fontSize:11}}>{name}</Text>
 </Pressable>;
 return <View style={{width:'100%',gap:9}}>
  <Text style={{fontWeight:'900',fontSize:14,color:c.text}}>
   Candidatos Lalo · Top10 y antecedentes
  </Text>
  <Text style={{color:c.subtext,fontSize:11,lineHeight:17}}>
   Estos son los candidatos originales de la hoja +11. Tocá uno para ver su
   formación actual y los resultados anteriores que utilizó Lalo.
  </Text>
  <View style={{flexDirection:'row',gap:5}}>
   {KINDS.map(k=><Pressable key={k} accessibilityRole="tab"
    accessibilityState={{selected:kind===k}} onPress={()=>{setKind(k);close()}}
    style={{flex:1,borderWidth:1,borderRadius:9,paddingVertical:9,
     alignItems:'center',backgroundColor:kind===k?kinds[k].fill:c.card,
     borderColor:kind===k?kinds[k].line:c.border}}>
    <Text style={{color:kind===k?kinds[k].text:c.subtext,
     fontSize:11,fontWeight:'900'}}>{k==='vt2'?'2 cifras':k==='vt3'?'3 cifras':'4 cifras'}</Text>
   </Pressable>)}
  </View>
  {families.length?families.map(f=>{
   const familyRoutes=routes.filter(r=>r.ownerId===kind+'|'+f.family);
   return <Pressable key={kind+'|'+f.family} accessibilityRole="button"
    onPress={()=>{setSelected(f.family);setPathIndex(0);setRootIndex(0)}}
    style={{borderWidth:1,borderRadius:9,padding:10,gap:4,
     backgroundColor:c.card,borderColor:c.border}}>
    <Text style={{fontWeight:'900',fontSize:12,color:c.text}}>
     #{f.rank} · {f.family}
    </Text>
    <Text style={{fontSize:10,lineHeight:16,color:c.subtext}}>
     {familyRoutes.length} recorrido(s) · {f.directRoots} antecedentes directos
     {kind==='vt4'?' · madre VT3 '+(f.parentFamilies.join(' / ')||'no identificada'):
      ' (D−1: '+f.d1Roots+' · D−7: '+f.d7Roots+')'}
    </Text>
   </Pressable>;
  }):<Text style={{color:c.subtext,fontSize:11}}>
   No hay candidatos para este turno.
  </Text>}
  <Modal visible={!!selected} transparent animationType="fade" onRequestClose={close}>
   <View style={{flex:1,backgroundColor:'rgba(0,0,0,.75)',
    justifyContent:'center',padding:10}}>
    <View style={{backgroundColor:c.surface,borderColor:c.border,borderWidth:1,
     borderRadius:15,padding:12,maxHeight:'92%',gap:10}}>
     <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8}}>
      <Text style={{fontWeight:'900',fontSize:15,color:c.text,flex:1}}>
       {kind.toUpperCase()} · #{family?.rank} · {family?.family}
      </Text>
      {action('Cerrar ×',close)}
     </View>
     <ScrollView nestedScrollEnabled contentContainerStyle={{gap:12,paddingBottom:20}}>
      <Text style={{color:c.subtext,fontSize:11}}>
       Mismo puesto y mismos recorridos del motor Lalo. Ninguna figura se agrega al Top10.
      </Text>
      {source&&route?<View style={{gap:7,alignItems:'flex-start'}}>
       <Text style={{color:c.text,fontWeight:'900',fontSize:12}}>
        AHORA · {frame.date} · {view?.target}
       </Text>
       <Text style={{color:c.subtext,fontSize:11}}>
        Columna: {source.sourceLabel} · lectura: {route.readings.join(' / ')}
       </Text>
       <RouteMiniBoard values={source.values} cells={route.cells} kind={kind} compact/>
      </View>:<Text style={{color:c.subtext,fontSize:11}}>
       El motor no tiene un recorrido actual para mostrar en este corte.
      </Text>}
      {related.length>1?<View style={{flexDirection:'row',alignItems:'center',gap:8}}>
       {action('Otro recorrido',()=>{setPathIndex(i=>i+1);setRootIndex(0)})}
       <Text style={{color:c.subtext,fontSize:10}}>
        {pathIndex%related.length+1} de {related.length}
       </Text>
      </View>:null}
      {antecedent?<View style={{gap:6,alignItems:'flex-start'}}>
       <Text style={{color:c.text,fontWeight:'900',fontSize:12}}>
        ANTES · {antecedent.date} · {antecedent.turn}
       </Text>
       <Text style={{color:c.subtext,fontSize:11}}>
        {antecedent.jurisdiction} · cabeza real {antecedent.head} ·
        {antecedent.period} · {antecedent.sourceLabel}
       </Text>
       <RouteMiniBoard values={antecedent.values}
        cells={antecedent.cells} kind={kind} compact/>
       <Text style={{color:c.subtext,fontSize:10}}>
        Lectura antigua {antecedent.reading}
       </Text>
      </View>:<Text style={{color:c.subtext,fontSize:11,lineHeight:17}}>
       No hay un antecedente directo completo para este recorrido.
       {kind==='vt4'?' Este VT4 surge de extender físicamente su madre VT3.':''}
      </Text>}
      {old.length>1?<View style={{flexDirection:'row',alignItems:'center',gap:8}}>
       {action('Otro antecedente',()=>setRootIndex(i=>i+1))}
       <Text style={{color:c.subtext,fontSize:10}}>
        {rootIndex%old.length+1} de {old.length}
       </Text>
      </View>:null}
      <Text style={{fontSize:10,lineHeight:16,color:c.muted}}>
       Una misma cabeza con varios caminos no cuenta como varios resultados independientes.
       Estos antecedentes describen el cálculo; no predicen el próximo sorteo.
      </Text>
     </ScrollView>
    </View>
   </View>
  </Modal>
 </View>;
}
