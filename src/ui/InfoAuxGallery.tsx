import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {AuxMode} from '../auxTemporalModes';
import type {AuxGalleryDay,AuxGalleryFrame} from '../infoAuxGallery';
import {buildInfoAuxFrames} from '../infoAuxGallery';
import {AUX_SOURCE_TURNS,AUX_ROWS} from '../auxSantiagoNeuquen';
import type {AuxiliaryBoard} from '../auxSantiagoNeuquen';
import AuxModeSwitch from './AuxModeSwitch';
import {useLaloTheme} from './LaloTheme';
import type {PanoramaKind} from '../panoramaModel';

type Props={days:AuxGalleryDay[];current:AuxGalleryDay|null;turn:Turno;
 mode:AuxMode;onMode:(next:AuxMode)=>void;onOpenDay?:(date:string)=>void};
const kinds:PanoramaKind[]=['vt2','vt3','vt4'];
function AuxFrameBoard({frame,large=false}:{
 frame:AuxGalleryFrame;large?:boolean
}){
 const {colors:c,kinds:colors}=useLaloTheme();
 const board=frame.board;
 const decorated=useMemo(()=>{
  const m=new Map<string,Set<PanoramaKind>>();
  for(const mark of frame.marks)for(const cell of mark.path){
   const key=cell.row+':'+cell.col;
   const set=m.get(key)||new Set<PanoramaKind>();
   set.add(mark.kind);m.set(key,set);
  }
  return m;
 },[frame]);
 const w=large?22:10,h=large?31:17,left=large?66:43;
 const cells=new Map(board?.cells.map(x=>[x.row+':'+x.col,x])||[]);
 return <View style={[s.board,{borderColor:c.border,backgroundColor:c.board}]}>
  <View style={s.row}>
   <View style={{width:left}}/>
   {AUX_SOURCE_TURNS.map(source=><Text key={source} style={{
    color:c.subtext,fontSize:large?10:7,fontWeight:'800',width:w*4,textAlign:'center'
   }}>{source}</Text>)}
  </View>
  {AUX_ROWS.map((jur,row)=><View key={jur} style={s.row}>
   <Text numberOfLines={1} style={{width:left,color:c.subtext,
    fontSize:large?10:7,fontWeight:'700'}}>{jur==='Neuquen'?'Neuquén':jur}</Text>
   {Array.from({length:12},(_,col)=>{
    const key=row+':'+col,cell=cells.get(key);
    const active=decorated.get(key)||new Set<PanoramaKind>();
    const main=(['vt4','vt3','vt2'] as PanoramaKind[]).find(k=>active.has(k));
    return <View key={key} style={{width:w,height:h,borderWidth:1,
     borderRadius:2,justifyContent:'center',alignItems:'center',
     borderColor:main?colors[main].line:c.border,
     backgroundColor:main?colors[main].fill:cell?c.cell:c.surfaceAlt}}>
     {main&&active.has('vt2')?<View style={{position:'absolute',
      top:0,left:1,right:1,height:2,backgroundColor:colors.vt2.line}}/>:null}
     {main&&active.has('vt3')?<View style={{position:'absolute',
      bottom:1,left:0,width:2,top:1,backgroundColor:colors.vt3.line}}/>:null}
     <Text style={{fontSize:large?15:9,fontWeight:'900',
      color:cell?c.text:c.muted}}>{cell?.digit||'·'}</Text>
    </View>;
   })}
  </View>)}
 </View>;
}
export default function InfoAuxGallery({days,current,turn,mode,onMode,onOpenDay}:Props){
 const {colors:c,kinds:vtColors}=useLaloTheme();
 const frames=useMemo(()=>buildInfoAuxFrames(days,current,turn,mode),
  [days,current,turn,mode]);
 const [chosen,setChosen]=useState<string|null>(null);
 const index=frames.findIndex(x=>x.date===chosen);
 const active=frames[index<0?0:index],position=index<0?0:index;
 const choose=(day:string)=>setChosen(day);
 return <View style={{gap:10}}>
  <Text style={{color:c.subtext,fontSize:11,lineHeight:17}}>
   La misma semana previa, reconstruida sobre Santiago–Neuquén.
   Las marcas de días anteriores explican cabezas publicadas;
   la última minihoja muestra el tablero previo al turno actual.
  </Text>
  <AuxModeSwitch value={mode} onChange={next=>{onMode(next);setChosen(null)}}/>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:9}}>
   {kinds.map(kind=><Text key={kind} style={{color:vtColors[kind].line,
    fontSize:10,fontWeight:'800'}}>● {kind.toUpperCase()}</Text>)}
  </View>
  {!frames.length?<Text style={{color:c.subtext,fontSize:11}}>
   Todavía no hay minihojas AUX históricas disponibles.
  </Text>:<>
   <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator
    contentContainerStyle={{gap:8,paddingVertical:3}}>
    {frames.map(frame=><Pressable key={frame.date} accessibilityRole="button"
     accessibilityState={{selected:active?.date===frame.date}}
     onPress={()=>choose(frame.date)}
     style={[s.thumb,{backgroundColor:active?.date===frame.date?c.accentFill:c.card,
      borderColor:active?.date===frame.date?c.accent:c.border}]}>
     <Text style={{fontWeight:'900',color:c.text,fontSize:11}}>
      {frame.isCurrent?'Próximo '+turn:frame.label}
     </Text>
     <AuxFrameBoard frame={frame}/>
     <Text style={{color:c.subtext,fontSize:10,textAlign:'center'}}>
      {frame.isCurrent?'Corte PRE · sin ganador':
       frame.matchedHeads.length+' cabezas · '+frame.marks.length+' caminos'}
     </Text>
    </Pressable>)}
   </ScrollView>
   {active?<View style={[s.detail,{backgroundColor:c.surfaceAlt}]}>
    <Text style={{color:c.text,fontSize:14,fontWeight:'900'}}>
     {active.label} · {turn} · {mode==='intrajornada'?'HOY':'AYER'}
    </Text>
    <Text style={{color:c.subtext,fontSize:11}}>
     {active.board?
      'Origen de cifras: '+(active.sourceDate||'jornada previa'):
      'Sin cifras de Santiago–Neuquén para esta fecha y modo'}
    </Text>
    <ScrollView horizontal showsHorizontalScrollIndicator>
     <AuxFrameBoard frame={active} large/>
    </ScrollView>
    <Text style={{color:c.text,fontSize:11,fontWeight:'800'}}>
     {active.isCurrent?
      'PRE: no se colorean resultados que aún queremos anticipar.':
      active.matchedHeads.length+' cabezas con recorridos exactos · '+
       active.marks.length+' rutas físicas'}
    </Text>
    {active.matchedHeads.length?<View style={s.badges}>
     {active.matchedHeads.map(h=><Text key={h} style={{
      color:c.text,backgroundColor:c.card,borderRadius:6,padding:6,
      fontWeight:'800',fontSize:10}}>{h}</Text>)}
    </View>:null}
    {onOpenDay&&!active.isCurrent?<Pressable accessibilityRole="button"
     onPress={()=>onOpenDay(active.date)}
     style={[s.button,{borderColor:c.accent,backgroundColor:c.accentFill}]}>
     <Text style={{color:c.accent,fontWeight:'900'}}>Abrir este día en HOJA →</Text>
    </Pressable>:null}
   </View>:null}
   <View style={s.controls}>
    <Pressable disabled={position===0} accessibilityRole="button"
     onPress={()=>choose(frames[Math.max(0,position-1)].date)}
     style={[s.button,{borderColor:c.border,opacity:position===0?.35:1}]}>
     <Text style={{color:c.accent}}>← Anterior</Text>
    </Pressable>
    <Text style={{color:c.subtext,fontSize:11}}>{position+1}/{frames.length}</Text>
    <Pressable disabled={position===frames.length-1} accessibilityRole="button"
     onPress={()=>choose(frames[Math.min(frames.length-1,position+1)].date)}
     style={[s.button,{borderColor:c.border,
      opacity:position===frames.length-1?.35:1}]}>
     <Text style={{color:c.accent}}>Siguiente →</Text>
    </Pressable>
   </View>
  </>}
 </View>;
}
const s=StyleSheet.create({
 board:{borderWidth:1,borderRadius:5,padding:4,gap:2,alignSelf:'center'},
 row:{flexDirection:'row',alignItems:'center',gap:0},
 thumb:{borderWidth:1,borderRadius:9,padding:8,gap:7,alignItems:'center',minWidth:200},
 detail:{padding:10,borderRadius:10,gap:9,alignItems:'center'},
 badges:{flexDirection:'row',gap:5,flexWrap:'wrap'},
 button:{borderWidth:1,paddingHorizontal:12,paddingVertical:9,borderRadius:8},
 controls:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8}
});
