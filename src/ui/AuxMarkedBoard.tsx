import React,{useMemo} from 'react';
import {View,Text,StyleSheet,useWindowDimensions} from 'react-native';
import type {AuxiliaryBoard,AuxCell} from '../auxSantiagoNeuquen';
import type {AuxVisualRoute,AuxVisualKind} from '../auxVisualModel';
import {useLaloTheme} from './LaloTheme';
const LABEL=48;
const SOURCES=['Previa','Primera','Matutino'] as const;
const NAMES=['Santiago','Neuquén'];
const cellKey=(x:{row:number;col:number})=>x.row+':'+x.col;
const collect=(routes:AuxVisualRoute[])=>
 routes.reduce((m,r)=>{
  for(const p of r.cells){const key=cellKey(p),v=m.get(key)||new Set<AuxVisualKind>();
   v.add(r.kind);m.set(key,v);}
  return m;
 },new Map<string,Set<AuxVisualKind>>());
/** Exactamente el ancho del MarkedBoard +11: windowWidth - 50.
 * Las tres franjas de cuatro cifras son CONTIGUAS: no se marca límite
 * de columna para no sugerir que prohíba cruces.
 */
export default function AuxMarkedBoard({board,routes,focusRoutes,focus=false}:{
 board:AuxiliaryBoard;routes:AuxVisualRoute[];
 focusRoutes?:AuxVisualRoute[];focus?:boolean
}){
 const {colors:c,kinds}=useLaloTheme(),{width:w}=useWindowDimensions();
 const width=Math.max(242,w-50),digitWidth=(width-LABEL-2)/12;
 const all=useMemo(()=>collect(routes),[routes]);
 const selected=useMemo(()=>collect(focusRoutes||[]),[focusRoutes]);
 const cellMap=useMemo(()=>new Map(board.cells.map(cell=>[cellKey(cell),cell])),[board]);
 const useFocus=focus||focusRoutes!==undefined;
 return <View style={[s.outside,{borderColor:c.border,backgroundColor:c.board}]}>
  <View style={{width,alignSelf:'center'}}>
   <View style={s.labels}>
    <View style={{width:LABEL}}/>
    {SOURCES.map(t=><View key={t} style={{width:digitWidth*4,alignItems:'center'}}>
     <Text style={{fontSize:10,fontWeight:'900',
      color:board.visibleTurns.includes(t)?c.text:c.muted}}>{t}</Text>
    </View>)}
   </View>
   {NAMES.map((name,row)=><View key={name} style={s.row}>
    <View style={{width:LABEL,justifyContent:'center'}}>
     <Text adjustsFontSizeToFit numberOfLines={1}
      style={{fontSize:9,fontWeight:'900',color:c.subtext}}>{name}</Text>
    </View>
    {Array.from({length:12},(_,col)=>{
     const key=row+':'+col,cell=cellMap.get(key);
     const kindsHere=[...(all.get(key)||[])];
     const chosen=[...(selected.get(key)||[])];
     const show=useFocus?chosen:kindsHere;
     const standout=show.length>0;
     const emphasized=show.includes('vt4')?'vt4':show.includes('vt3')?'vt3':
      show.includes('vt2')?'vt2':null;
     const tint=emphasized?kinds[emphasized]:null;
     return <View key={key} accessibilityLabel={
      name+' '+SOURCES[Math.floor(col/4)]+' '+(col%4+1)+' '+(cell?.digit||'vacío')}
      style={[s.cell,{width:digitWidth-1,height:34,
       backgroundColor:tint?tint.fill:cell?c.cell:c.surfaceAlt,
       borderColor:tint?tint.line:c.border,
       borderWidth:standout?2:1,opacity:cell?useFocus&&!standout?.47:1:.4}]}>
      <Text adjustsFontSizeToFit numberOfLines={1}
       style={{fontSize:digitWidth<21?10:13,fontWeight:'900',
        color:tint?tint.text:cell?c.text:c.muted}}>
       {cell?.digit||'·'}
      </Text>
      <View style={s.markBars}>
       {(['vt2','vt3','vt4'] as const).filter(k=>show.includes(k)).map(k=>
        <View key={k} style={{backgroundColor:kinds[k].line,flex:1,height:3}}/>)}
      </View>
     </View>;
    })}
   </View>)}
  </View>
  <Text style={[s.hint,{color:c.subtext}]}>
   Santiago arriba · Neuquén abajo · sin +11 · recorrido horizontal,
   vertical o diagonal, incluso entre franjas contiguas.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 outside:{borderWidth:1,borderRadius:10,paddingVertical:9,gap:8,overflow:'hidden'},
 labels:{flexDirection:'row',alignItems:'center',marginBottom:6},
 row:{flexDirection:'row',alignItems:'center',marginVertical:2},
 cell:{marginRight:1,borderRadius:3,alignItems:'center',justifyContent:'center'},
 markBars:{position:'absolute',bottom:0,left:1,right:1,flexDirection:'row',gap:1},
 hint:{fontSize:10,lineHeight:15,marginHorizontal:8}
});
