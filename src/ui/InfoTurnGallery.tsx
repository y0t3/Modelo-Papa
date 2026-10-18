import React,{useEffect,useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {PanoramaKind} from '../panoramaModel';
import type {TurnHistory,TurnHistoryFrame} from '../infoTurnHistory';
import {visibleTurnRoutes} from '../infoTurnHistory';
import {useLaloTheme} from './LaloTheme';

export type GalleryMode='todos'|'vt2'|'vt3'|'vt4';
type Props={gallery:TurnHistory;selectedFrameId:string;
 onSelectFrame:(id:string)=>void;mode:GalleryMode;onMode:(m:GalleryMode)=>void;
 onOpenFrame:(frame:TurnHistoryFrame)=>void};
const options:{id:GalleryMode;label:string}[]=[
 {id:'todos',label:'Todas'},{id:'vt2',label:'2 cifras'},
 {id:'vt3',label:'3 cifras'},{id:'vt4',label:'4 cifras'}
];
const JUR=['Ciudad','Provincia','Córdoba','Santa Fe','Entre Ríos','Montevideo'];
const HEADER=['Noct. ant.','Previa','Primera','Matutina','Vespertina'];
function Board({frame,mode,large=false}:{
 frame:TurnHistoryFrame;mode:GalleryMode;large?:boolean
}){
 const {colors:c,kinds}=useLaloTheme();
 const routes=useMemo(()=>visibleTurnRoutes(frame,mode),[frame,mode]);
 const marks=useMemo(()=>{
  const map=new Map<string,Set<PanoramaKind>>();
  for(const route of routes)for(const p of route.cells){
   const key=route.sourceId+'|'+p.row+'|'+p.col;
   const found=map.get(key)||new Set<PanoramaKind>();
   found.add(route.kind);map.set(key,found);
  }
  return map;
 },[routes]);
 const w=large?21:9,h=large?27:13;
 const rowLabel=large?52:23,space=1;
 return <View accessibilityLabel={'Hoja de '+frame.dayLabel}
  style={[s.board,{backgroundColor:c.board,borderColor:c.border}]}>
  <View style={s.gridRow}>
   <View style={{width:rowLabel}}/>
   {frame.sheet.columns.map(col=><Text key={col.id} numberOfLines={1}
    style={{width:w*2+space*3,textAlign:'center',fontSize:large?9:6,
     fontWeight:'800',color:c.subtext}}>{HEADER[
      ['prevNocturno','Previa','Primera','Matutino','Vespertino'].indexOf(col.id)]}</Text>)}
  </View>
  {JUR.map((jur,row)=><View key={jur} style={[s.gridRow,{gap:space}]}>
   <Text numberOfLines={1} style={{width:rowLabel,fontSize:large?9:5.7,
    color:c.subtext,fontWeight:'700'}}>{large?jur:jur.slice(0,5)}</Text>
   {frame.sheet.columns.map((source,i)=><View key={source.id}
    style={{flexDirection:'row',gap:space,paddingHorizontal:space,
     backgroundColor:i%2?c.boardAlt:c.board}}>
    {[0,1].map(col=>{
     const num=source.values[row]||'--';
     const n=/^\d{2}$/.test(num)?num[col]:'–';
     const on=[...(marks.get(source.id+'|'+row+'|'+col)||[])];
     const pick=(['vt4','vt3','vt2'] as PanoramaKind[]).find(k=>on.includes(k));
     return <View key={col} style={{width:w,height:h,justifyContent:'center',
      alignItems:'center',borderRadius:large?4:2,borderWidth:1,
      backgroundColor:pick?kinds[pick].fill:c.cell,
      borderColor:pick?kinds[pick].line:c.border}}>
      {on.includes('vt2')?<View style={{position:'absolute',top:0,left:1,right:1,
       height:large?3:2,backgroundColor:kinds.vt2.line}}/>:null}
      {on.includes('vt3')?<View style={{position:'absolute',top:1,bottom:1,left:0,
       width:large?3:2,backgroundColor:kinds.vt3.line}}/>:null}
      {on.includes('vt4')?<View style={{position:'absolute',bottom:0,left:1,right:1,
       height:large?3:2,backgroundColor:kinds.vt4.line}}/>:null}
      <Text style={{fontWeight:'900',fontSize:large?16:10,color:c.text}}>{n}</Text>
     </View>;
    })}
   </View>)}
  </View>)}
 </View>;
}
export const markedHeadsForMode=(f:TurnHistoryFrame,mode:GalleryMode)=>{
 if(f.kind!=='historico')return [];
 const owners=new Set(visibleTurnRoutes(f,mode).map(r=>r.ownerId));
 return f.markedHeadLabels.filter(x=>owners.has(x.id));
};
const stats=(f:TurnHistoryFrame,mode:GalleryMode)=>{
 const routes=visibleTurnRoutes(f,mode);
 return f.kind==='historico'?
  new Set(routes.map(r=>r.ownerId)).size+' cabezas con marca · '+routes.length+' recorridos':
  new Set(routes.map(r=>r.ownerId)).size+' familias principales';
};
export default function InfoTurnGallery({gallery,selectedFrameId,onSelectFrame,mode,onMode,onOpenFrame}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const {frames}=gallery;
 const [playing,setPlaying]=useState(false);
 const selected=frames.findIndex(f=>f.id===selectedFrameId);
 // Si todavía no se eligió una minihoja, iniciar por la más antigua.
 const idx=selected<0?0:selected;
 const active=frames[idx];
 useEffect(()=>{
  if(!playing||frames.length<2)return;
  const handle=setInterval(()=>{
   const pos=frames.findIndex(f=>f.id===selectedFrameId);
   // En el inicio por defecto ya se ve la primera jornada: el primer tick avanza.
   onSelectFrame(frames[(pos<0?1:pos+1)%frames.length].id);
  },1800);
  return ()=>clearInterval(handle);
 },[playing,selectedFrameId,frames,onSelectFrame]);
 useEffect(()=>setPlaying(false),[gallery.turn,gallery.frames[0]?.date]);
 if(!active)return <Text style={{color:c.subtext}}>
  Actualizá la hoja para comparar este turno con las jornadas anteriores.
 </Text>;
 return <View style={s.root}>
  <Text style={{color:c.text,fontSize:13,lineHeight:19}}>
   Evolución cronológica del <Text style={{fontWeight:'900'}}>{gallery.turn}</Text>:
   desde la semana anterior hasta el corte actual.
   Cuando hay cuadro PRE al final, muestra sólo las tres primeras familias de 2, 3 y 4 cifras.
  </Text>
  <View style={s.filters}>{options.map(o=><Pressable key={o.id} accessibilityRole="button"
   accessibilityState={{selected:mode===o.id}} onPress={()=>{setPlaying(false);onMode(o.id)}}
   style={[s.filter,{borderColor:mode===o.id?c.accent:c.border,
    backgroundColor:mode===o.id?c.accentFill:c.surfaceAlt}]}>
   <Text style={{fontSize:11,fontWeight:'800',color:mode===o.id?c.accent:c.text}}>
    {o.label}</Text>
  </Pressable>)}</View>
  <View style={s.legend}>
   {(['vt2','vt3','vt4'] as const).filter(k=>mode==='todos'||mode===k)
    .map(k=><View key={k} style={s.legendItem}>
     <View style={{width:10,height:10,borderRadius:2,backgroundColor:kinds[k].line}}/>
     <Text style={{fontSize:10,color:c.subtext}}>{kinds[k].label}</Text>
    </View>)}
  </View>
  <View style={s.thumbs}>
   {frames.map((f,i)=>{
    return <Pressable key={f.id} accessibilityRole="button"
     accessibilityState={{selected:idx===i}} onPress={()=>{setPlaying(false);onSelectFrame(f.id)}}
     style={[s.thumb,{borderColor:idx===i?c.accent:c.border,
      backgroundColor:idx===i?c.accentFill:c.card}]}>
     <Text style={[s.thumbTitle,{color:c.text}]}>{f.title}</Text>
     <Text style={[s.date,{color:c.subtext}]}>{f.dayLabel}</Text>
     <Board frame={f} mode={mode}/>
     <Text style={[s.small,{color:c.subtext,textAlign:'center'}]}>{stats(f,mode)}</Text>
     {f.kind==='historico'&&markedHeadsForMode(f,mode).length>0?
      <Text style={[s.small,{color:c.text,textAlign:'center'}]} numberOfLines={2}>
       {markedHeadsForMode(f,mode).map(x=>x.head).join(' · ')}
      </Text>:null}
    </Pressable>;
   })}
  </View>
  <View style={[s.detail,{backgroundColor:c.surfaceAlt}]}>
   <Text style={{fontSize:15,fontWeight:'900',color:c.text}}>
    {active.title} · {active.dayLabel}
   </Text>
   <Text style={[s.small,{color:c.text}]}>
    {active.kind==='historico'?
     'Estas marcas son coincidencias reales del sorteo de ese día.':
     'Sólo se muestran las tres familias principales de cada cantidad de cifras. No son resultados.'}
   </Text>
   <Board frame={active} mode={mode} large/>
   <Text style={{fontSize:12,color:c.text,fontWeight:'800'}}>
    {stats(active,mode)}
   </Text>
   {active.kind==='historico'&&markedHeadsForMode(active,mode).length>0?
    <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:6}}>
     {markedHeadsForMode(active,mode).map(x=>
      <Text key={x.id} style={{color:c.text,backgroundColor:c.card,
       borderColor:c.border,borderWidth:1,borderRadius:7,padding:7,fontSize:11,fontWeight:'800'}}>
       {x.jurisdiction}: {x.head}
      </Text>)}
    </View>:null}
   <Pressable accessibilityRole="button"
    onPress={()=>{setPlaying(false);onOpenFrame(active)}}
    style={[s.open,{borderColor:c.accent,backgroundColor:c.accentFill}]}>
    <Text style={{color:c.accent,fontWeight:'900',fontSize:12}}>
     {active.kind==='historico'?'Abrir este día en HOJA →':'Abrir en PREDICTIVA →'}
    </Text>
   </Pressable>
  </View>
  <View style={s.controls}>
   <Pressable disabled={idx===0} accessibilityRole="button"
    onPress={()=>{setPlaying(false);onSelectFrame(frames[Math.max(0,idx-1)].id)}}
    style={[s.control,{borderColor:c.border,opacity:idx===0?0.4:1}]}>
    <Text style={{color:c.accent,fontWeight:'900'}}>←</Text>
   </Pressable>
   <Pressable accessibilityRole="button" onPress={()=>setPlaying(v=>!v)}
    style={[s.play,{borderColor:c.accent,backgroundColor:c.accentFill}]}>
    <Text style={{color:c.accent,fontWeight:'900'}}>
     {playing?'❚❚ Pausar':'▶ Reproducir'}
    </Text>
   </Pressable>
   <Text style={{fontSize:11,color:c.subtext}}>{idx+1}/{frames.length}</Text>
   <Pressable disabled={idx===frames.length-1} accessibilityRole="button"
    onPress={()=>{setPlaying(false);onSelectFrame(frames[Math.min(frames.length-1,idx+1)].id)}}
    style={[s.control,{borderColor:c.border,opacity:idx===frames.length-1?0.4:1}]}>
    <Text style={{color:c.accent,fontWeight:'900'}}>→</Text>
   </Pressable>
  </View>
  <Text style={[s.small,{color:c.subtext}]}>{gallery.summary}</Text>
 </View>;
}
const s=StyleSheet.create({
 root:{gap:11},filters:{flexDirection:'row',flexWrap:'wrap',gap:6},
 filter:{borderWidth:1,paddingVertical:7,paddingHorizontal:10,borderRadius:8},
 legend:{flexDirection:'row',flexWrap:'wrap',gap:10},
 legendItem:{flexDirection:'row',alignItems:'center',gap:4},
 thumbs:{flexDirection:'row',flexWrap:'wrap',gap:8},
 thumb:{flexBasis:'47%',flexGrow:1,borderWidth:1,borderRadius:10,
  padding:7,alignItems:'center',gap:5},
 thumbTitle:{fontSize:11,fontWeight:'900',textAlign:'center'},
 date:{fontSize:10,textAlign:'center'},
 board:{borderWidth:1,borderRadius:6,padding:3,gap:2,alignSelf:'center'},
 gridRow:{flexDirection:'row',alignItems:'center',gap:1},
 detail:{borderRadius:10,padding:10,alignItems:'center',gap:9},
 small:{fontSize:10,lineHeight:16},controls:{flexDirection:'row',
  justifyContent:'space-between',alignItems:'center',gap:5},
 control:{borderWidth:1,paddingHorizontal:14,paddingVertical:9,borderRadius:8},
 play:{borderWidth:1,paddingHorizontal:10,paddingVertical:9,borderRadius:8},
 open:{borderWidth:1,borderRadius:9,paddingVertical:11,paddingHorizontal:17}
});
