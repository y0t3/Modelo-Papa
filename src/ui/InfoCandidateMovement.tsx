import React,{useEffect,useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {LaloKind} from '../motorLalo';
import type {SourceId} from '../sheet';
import type {CandidateSequence,CandidateFrame,MovementMode,MovementSource} from '../infoCandidatos';
import {MOVEMENT_KINDS,movementSourceName} from '../infoCandidatos';
import {useLaloTheme} from './LaloTheme';

type Props={
 sequence:CandidateSequence;selectedFrameId:string;
 onSelectFrame:(id:string)=>void;mode:MovementMode;
 onMode:(value:MovementMode)=>void
};
const KINDS:MovementMode[]=['todos','vt2','vt3','vt4'];
const name=(k:MovementMode)=>k==='todos'?'Panorama':k.toUpperCase();
const total=(source:MovementSource,mode:MovementMode)=>mode==='todos'?
 MOVEMENT_KINDS.reduce((n,k)=>n+source.units[k],0):source.units[mode];
const contributing=(s:MovementSource,mode:MovementMode)=>
 mode==='todos'?MOVEMENT_KINDS.filter(k=>s.units[k]>0):[mode].filter(k=>s.units[k]>0);
const activeAt=(source:MovementSource,row:number,col:number,mode:MovementMode)=>
 contributing(source,mode).filter(k=>source.counts[k][row][col]>0);
function MiniBoard({source,mode,large=false,onCell}:{
 source:MovementSource;mode:MovementMode;large?:boolean;
 onCell?:(row:number,col:number)=>void
}){
 const {colors:c,kinds}=useLaloTheme();
 const size=large?40:19,space=large?12:6;
 const keys=mode==='todos'?MOVEMENT_KINDS:[mode];
 const peaks:Record<LaloKind,number>={vt2:1,vt3:1,vt4:1};
 for(const k of keys)peaks[k]=Math.max(1,...source.counts[k].flat());
 return <View accessibilityLabel={'Tablero de '+source.label}
  style={[s.board,{borderColor:c.border,backgroundColor:c.board}]}>
  {source.counts.vt2.map((row,r)=><View key={r} style={s.boardRow}>
   {row.map((_,col)=>{
    const matched=keys.filter(k=>source.counts[k][r][col]>0);
    return <Pressable key={col} disabled={!large||!onCell}
     accessibilityRole="button"
     accessibilityLabel={'Fila '+(r+1)+', columna '+(col+1)+
      ', '+(matched.length?matched.map(k=>k.toUpperCase()).join(', '):'sin recorridos')}
     onPress={()=>onCell?.(r,col)}
     style={[s.cell,{width:size,height:large?33:19,
      backgroundColor:c.cell,borderColor:c.border}]}>
      <View style={[s.dots,{gap:large?2:1}]}>
       {matched.map(k=>{
        const strength=source.counts[k][r][col]/peaks[k];
        return <View key={k} style={{
         width:matched.length===1?space+2:space,height:space,
         borderRadius:5,backgroundColor:kinds[k].line,opacity:0.45+0.55*strength
        }}/>;
       })}
      </View>
     </Pressable>;
   })}
  </View>)}
 </View>;
}
export default function InfoCandidateMovement({sequence,selectedFrameId,
 onSelectFrame,mode,onMode}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const [playing,setPlaying]=useState(false);
 const [focus,setFocus]=useState<{source:SourceId;row:number;col:number}|null>(null);
 const {frames}=sequence;
 const matchedIndex=frames.findIndex(f=>f.id===selectedFrameId);
 const idx=matchedIndex<0?frames.length-1:matchedIndex;
 const current=frames[idx];
 useEffect(()=>{
  if(!playing||frames.length<=1)return;
  const timer=setInterval(()=>{
   const pos=frames.findIndex(f=>f.id===selectedFrameId);
   const next=frames[(Math.max(-1,pos)+1)%frames.length];
   onSelectFrame(next.id);
  },1550);
  return ()=>clearInterval(timer);
 },[playing,selectedFrameId,frames,onSelectFrame]);
 useEffect(()=>{setPlaying(false);setFocus(null)},[sequence.date,sequence.turn]);
 useEffect(()=>{setFocus(null)},[selectedFrameId,mode]);
 const sourceViews=useMemo(()=>current?.sources.filter(s=>s.id==='prevNocturno'||
  total(s,mode)>0)||[],[current,mode]);
 const best=current?.sources.slice().sort((a,b)=>total(b,mode)-total(a,mode))[0];
 const currentCells=current&&focus?current.sources.find(s=>s.id===focus.source):null;
 const familiesAt=currentCells&&focus?
  (mode==='todos'?MOVEMENT_KINDS:[mode]).flatMap(k=>
   currentCells.cellFamilies[k][focus.row][focus.col].map(f=>k.toUpperCase()+' '+f)):[];
 if(!frames.length)return <View style={[s.empty,{backgroundColor:c.surfaceAlt}]}>
  <Text style={{color:c.subtext,fontSize:12,lineHeight:18}}>
   Cargá la hoja para reconstruir el movimiento de candidatos antes de este turno.
  </Text>
 </View>;
 return <View style={s.root}>
  <Text style={[s.intro,{color:c.subtext}]}>
   Cada cuadro es una fotografía PRE del mismo turno: primero la base de la jornada,
   después los resultados que iban llegando. Tocá o reproducí para seguir las candidaturas.
  </Text>
  <View style={s.filters}>
   {KINDS.map(k=><Pressable key={k} accessibilityRole="button"
    accessibilityState={{selected:mode===k}}
    onPress={()=>{setPlaying(false);onMode(k)}}
    style={[s.filter,{borderColor:mode===k?c.accent:c.border,
     backgroundColor:mode===k?c.accentFill:c.card}]}>
     <Text style={{fontSize:11,fontWeight:'900',color:mode===k?c.accent:c.text}}>
      {name(k)}
     </Text>
    </Pressable>)}
  </View>
  <View style={s.legend}>
   {(mode==='todos'?MOVEMENT_KINDS:[mode]).map(k=><View key={k} style={s.legendItem}>
    <View style={{width:9,height:9,borderRadius:6,backgroundColor:kinds[k].line}}/>
    <Text style={{color:c.subtext,fontSize:10}}>{k.toUpperCase()}</Text>
   </View>)}
   <Text style={{fontSize:10,color:c.subtext}}>Un punto por capa, intensidad por respaldo físico</Text>
  </View>
  <View style={s.strip}>
   {frames.map((f,i)=>{
    const lead=f.sources.slice().sort((a,b)=>total(b,mode)-total(a,mode))[0];
    const counts=mode==='todos'?MOVEMENT_KINDS.reduce((n,k)=>n+f.totalFamilies[k],0):
     f.totalFamilies[mode];
    return <Pressable key={f.id} accessibilityRole="button"
     accessibilityState={{selected:idx===i}}
     onPress={()=>{setPlaying(false);onSelectFrame(f.id)}}
     style={[s.thumb,{borderColor:idx===i?c.accent:c.border,
      backgroundColor:idx===i?c.accentFill:c.card}]}>
     {lead?<MiniBoard source={lead} mode={mode}/>:null}
     <Text style={[s.thumbTitle,{color:c.text}]}>{f.label}</Text>
     <Text style={[s.thumbSub,{color:c.subtext}]}>{counts} familia(s) · {f.sources.length} fuente(s)</Text>
     <Text style={[s.thumbSource,{color:c.subtext}]} numberOfLines={2}>
      {lead&&total(lead,mode)>0?'Destaca: '+lead.label:'Sin fuente destacada'}
     </Text>
    </Pressable>;
   })}
  </View>
  <View style={[s.detail,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.detailTitle,{color:c.text}]}>{current.label} · {name(mode)}</Text>
   <Text style={[s.small,{color:c.subtext}]}>{current.note}</Text>
   <Text style={[s.summary,{color:c.text}]}>{current.comparison}</Text>
   <View style={s.counts}>
    {(mode==='todos'?MOVEMENT_KINDS:[mode]).map(k=><View key={k} style={s.countItem}>
     <View style={{width:10,height:10,borderRadius:5,backgroundColor:kinds[k].line}}/>
     <Text style={{color:c.text,fontWeight:'800',fontSize:11}}>
      {k.toUpperCase()} {current.totalFamilies[k]}
     </Text>
    </View>)}
   </View>
   <Text style={[s.sectionTitle,{color:c.text}]}>Fuentes de los recorridos candidatos</Text>
   <Text style={[s.small,{color:c.subtext}]}>
    Cada minitablero pertenece a una fuente física distinta; no mezclamos columnas.
    Los puntos de colores distinguen modalidades aunque compartan casilla.
   </Text>
   <View style={s.sourceGrid}>
    {sourceViews.map(source=><View key={source.id}
     style={[s.sourceCard,{borderColor:c.border,backgroundColor:c.card}]}>
     <MiniBoard source={source} mode={mode} large onCell={(row,col)=>
      setFocus({source:source.id,row,col})}/>
     <Text style={[s.sourceName,{color:c.text}]}>{source.label}</Text>
     <Text style={[s.small,{color:c.subtext}]}>{total(source,mode)} respaldo(s)</Text>
    </View>)}
   </View>
   {focus?<View style={[s.selection,{borderColor:c.border}]}>
    <Text style={{color:c.text,fontWeight:'800',fontSize:11}}>
     {movementSourceName(focus.source)} · fila {focus.row+1} · cifra {focus.col+1}
    </Text>
    <Text style={[s.small,{color:c.subtext}]}>
     {familiesAt.length?familiesAt.slice(0,8).join(' · ')+
      (familiesAt.length>8?' y más...':''):'Sin familias admitidas en esta casilla.'}
    </Text>
   </View>:null}
   <Text style={[s.small,{color:c.subtext}]}>
    Los Tops mostrados son las primeras diez familias de cada modalidad, calculadas
    con los datos disponibles en el corte. Una mancha o un desplazamiento no garantiza aciertos.
   </Text>
  </View>
  <View style={s.controls}>
   <Pressable accessibilityRole="button" disabled={idx===0}
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
   <Text style={[s.small,{color:c.subtext}]}>{idx+1}/{frames.length}</Text>
   <Pressable accessibilityRole="button" disabled={idx===frames.length-1}
    onPress={()=>{setPlaying(false);onSelectFrame(frames[Math.min(frames.length-1,idx+1)].id)}}
    style={[s.control,{borderColor:c.border,opacity:idx===frames.length-1?0.4:1}]}>
    <Text style={{color:c.accent,fontWeight:'900'}}>→</Text>
   </Pressable>
  </View>
  <Text style={[s.disclaimer,{color:c.muted}]}>{sequence.warning}</Text>
 </View>;
}
const s=StyleSheet.create({
 root:{gap:11},intro:{fontSize:11,lineHeight:17},empty:{padding:12,borderRadius:8},
 filters:{flexDirection:'row',flexWrap:'wrap',gap:6},
 filter:{borderWidth:1,borderRadius:9,paddingVertical:8,paddingHorizontal:11},
 legend:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:9},
 legendItem:{flexDirection:'row',gap:4,alignItems:'center'},
 strip:{flexDirection:'row',flexWrap:'wrap',gap:8},
 thumb:{minWidth:125,flexGrow:1,flexBasis:'45%',borderWidth:1,
  borderRadius:10,padding:9,alignItems:'center',gap:5},
 thumbTitle:{fontSize:11,fontWeight:'900',textAlign:'center'},
 thumbSub:{fontSize:10,textAlign:'center'},
 thumbSource:{fontSize:10,textAlign:'center'},
 board:{padding:3,borderRadius:5,borderWidth:1,gap:2},
 boardRow:{flexDirection:'row',gap:2},
 cell:{borderWidth:1,borderRadius:3,alignItems:'center',justifyContent:'center'},
 dots:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'center'},
 detail:{borderRadius:10,padding:12,gap:8},
 detailTitle:{fontSize:14,fontWeight:'900'},small:{fontSize:10,lineHeight:16},
 summary:{fontSize:12,lineHeight:18},counts:{flexDirection:'row',gap:12,flexWrap:'wrap'},
 countItem:{flexDirection:'row',alignItems:'center',gap:4},
 sectionTitle:{fontWeight:'900',fontSize:12,marginTop:5},
 sourceGrid:{flexDirection:'row',flexWrap:'wrap',gap:7},
 sourceCard:{padding:8,borderRadius:8,borderWidth:1,alignItems:'center',
  flexBasis:'45%',flexGrow:1,gap:6},
 sourceName:{fontSize:11,fontWeight:'800',textAlign:'center'},
 selection:{borderWidth:1,borderRadius:8,padding:8,gap:4},
 controls:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6},
 control:{borderWidth:1,borderRadius:9,paddingHorizontal:15,paddingVertical:10},
 play:{borderWidth:1,borderRadius:9,padding:10},
 disclaimer:{fontSize:10,lineHeight:16}
});
