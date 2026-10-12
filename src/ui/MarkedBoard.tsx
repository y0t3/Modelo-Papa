import React,{useMemo} from 'react';
import {View,Text,StyleSheet,useWindowDimensions} from 'react-native';
import type {DailySheet,SourceId} from '../sheet';
import type {PanoramaRoute,PanoramaKind} from '../panoramaModel';
import {strongestKind} from './visualTokens';
import {useLaloTheme} from './LaloTheme';

const JUR=['Ciudad','Prov.','Córdoba','Santa Fe','E. Ríos','Montevideo'];
const HEADER=46,ROW=43,GUTTER=48;
const shortName=(s:SourceId)=>({
 prevNocturno:'Noct. ant.',Previa:'Previa',Primera:'Primera',
 Matutino:'Matutina',Vespertino:'Vespert.'
})[s];
const cellKey=(sourceId:SourceId,row:number,col:number)=>sourceId+'|'+row+'|'+col;
type CellMarks=Map<string,Set<PanoramaKind>>;
const collect=(routes:PanoramaRoute[]):CellMarks=>{
 const out:CellMarks=new Map();
 for(const r of routes)for(const c of r.cells){
  const key=cellKey(r.sourceId,c.row,c.col);
  const kinds=out.get(key)||new Set<PanoramaKind>();
  kinds.add(r.kind);out.set(key,kinds);
 }
 return out;
};

/**
 * Visualización pura: marca las CELDAS implicadas, no dibuja líneas sobre las cifras.
 * Los recorridos completos siguen intactos en PanoramaData, incluidos sentidos
 * y múltiples trayectorias por cabeza/familia.
 */
export default function MarkedBoard({columns,routes,activeOwner}:{
 columns:DailySheet['columns'];routes:PanoramaRoute[];activeOwner:string|null
}){
 const {colors:c,kinds}=useLaloTheme();
 const {width:windowWidth}=useWindowDimensions();
 const width=Math.max(242,windowWidth-50);
 const colWidth=(width-GUTTER-2)/Math.max(1,columns.length);
 const height=HEADER+ROW*6+8;
 const all=useMemo(()=>collect(routes),[routes]);
 const selected=useMemo(()=>collect(activeOwner===null?[]:routes.filter(r=>r.ownerId===activeOwner)),[routes,activeOwner]);
 return <View style={[s.card,{backgroundColor:c.board,borderColor:c.border}]}>
  <View style={{width,height,alignSelf:'center',position:'relative'}}>
   {columns.map((col,i)=><React.Fragment key={col.id}>
    <View style={{position:'absolute',left:GUTTER+i*colWidth+1,top:0,
     width:colWidth-2,height:height-3,backgroundColor:i%2?c.boardAlt:c.board,
     borderWidth:1,borderColor:c.border,borderRadius:6}}/>
    <Text numberOfLines={2} adjustsFontSizeToFit key={'label'+col.id}
     style={{position:'absolute',left:GUTTER+i*colWidth,top:9,width:colWidth,
      fontSize:Math.max(8,Math.min(10,colWidth/5.6)),fontWeight:'800',
      textAlign:'center',color:c.subtext}}>{shortName(col.id)}</Text>
   </React.Fragment>)}
   {JUR.map((name,r)=><Text key={name} numberOfLines={1}
    style={{position:'absolute',left:0,top:HEADER+r*ROW+13,width:GUTTER-2,
     fontSize:9,color:c.subtext,fontWeight:'700'}}>{name}</Text>)}
   {columns.flatMap((col,ci)=>col.values.flatMap((pair,row)=>[0,1].map(side=>{
    const key=cellKey(col.id,row,side);
    const allKinds=[...(all.get(key)||[])];
    const activeKinds=[...(selected.get(key)||[])];
    const visibleKinds=activeOwner!==null&&activeKinds.length?activeKinds:allKinds;
    const focus=activeOwner!==null&&activeKinds.length>0;
    const muted=activeOwner!==null&&!focus&&allKinds.length>0;
    const strongest=strongestKind(visibleKinds);
    const fill=strongest?kinds[strongest].fill:c.cell;
    const cellWidth=colWidth*.435;
    const left=GUTTER+ci*colWidth+(side?colWidth*.745:colWidth*.255)-cellWidth/2;
    const top=HEADER+row*ROW+3;
    const n=/^\d{2}$/.test(pair)?pair[side]:'–';
    return <View key={key} accessible accessibilityLabel={n+' '+visibleKinds.map(k=>kinds[k].label).join(', ')}
     style={{position:'absolute',left,top,width:cellWidth,height:ROW-8,
      backgroundColor:fill,borderWidth:focus?2:1,
      borderColor:focus?(strongest?kinds[strongest].line:c.border):c.border,
      borderRadius:4,opacity:muted?.52:1,justifyContent:'center',alignItems:'center'}}>
     {visibleKinds.includes('vt2')?<View style={[s.topMarker,{backgroundColor:kinds.vt2.line}]}/>:null}
     {visibleKinds.includes('vt3')?<View style={[s.leftMarker,{backgroundColor:kinds.vt3.line}]}/>:null}
     {visibleKinds.includes('vt4')?<View style={[s.bottomMarker,{backgroundColor:kinds.vt4.line}]}/>:null}
     <Text allowFontScaling adjustsFontSizeToFit numberOfLines={1}
      style={{color:c.text,fontSize:colWidth<48?13:17,fontWeight:'900',zIndex:2}}>{n}</Text>
    </View>;
   })))}
  </View>
 </View>;
}
const s=StyleSheet.create({
 card:{backgroundColor:'#fff',borderRadius:10,paddingVertical:8,borderWidth:1,borderColor:'#ddd5e4',overflow:'hidden'},
 topMarker:{position:'absolute',top:0,left:3,right:3,height:3,borderBottomLeftRadius:2,borderBottomRightRadius:2},
 leftMarker:{position:'absolute',left:0,top:4,bottom:4,width:3,borderTopRightRadius:2,borderBottomRightRadius:2},
 bottomMarker:{position:'absolute',bottom:0,left:3,right:3,height:3,borderTopLeftRadius:2,borderTopRightRadius:2}
});
