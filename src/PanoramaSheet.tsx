import React,{useEffect,useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,Modal,StyleSheet,useWindowDimensions} from 'react-native';
import type {DailySheet,SourceId} from './sheet';
import type {Turno} from './domain';
import {TURNOS} from './domain';
import type {PanoramaData,PanoramaRoute,PanoramaGroup,PanoramaKind,PanoramaCell} from './panoramaModel';

/** Lámina +11: todas las rutas quedan físicamente marcadas; el toque sobre
 * una cabeza/familia ilumina simultáneamente TODOS sus dibujos, sin aislar
 * una columna, un tipo VT ni un recorrido individual.
 */
const COLORS:Record<PanoramaKind,string>={vt2:'#db547e',vt3:'#088f98',vt4:'#c18b24'};
const rowLabels=['Ciudad','Prov.','Córdoba','Santa Fé','E. Ríos','Mvd.'];
const HEAD=52,ROW=43,GUTTER=47;
const colShort=(sourceId:SourceId)=>({
 prevNocturno:'Noct. ant.',Previa:'Previa',Primera:'Primera',
 Matutino:'Matut.',Vespertino:'Vespert.'
})[sourceId];

function hash(s:string){let h=0;for(const char of s)h=(h*33+char.charCodeAt(0))>>>0;return h}
type Geometry={route:PanoramaRoute;owners:Set<string>};
function figures(data:PanoramaData):Geometry[]{
 const out=new Map<string,Geometry>();
 for(const route of data.routes){
  const key=route.id;
  if(!out.has(key))out.set(key,{route,owners:new Set()});
  out.get(key)!.owners.add(route.ownerId);
 }
 return [...out.values()];
}
function point(index:number,cell:PanoramaCell,colW:number){
 return {x:GUTTER+index*colW+(cell.col?colW*.73:colW*.27),
  y:HEAD+ROW*(cell.row+.5)};
}
function Line({a,b,weight,color,opacity,offset=0}:{
 a:{x:number;y:number};b:{x:number;y:number};weight:number;color:string;
 opacity:number;offset?:number}){
 const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
 if(!length)return null;
 const nx=-dy/length,ny=dx/length;
 const x=(a.x+b.x)/2+nx*offset,y=(a.y+b.y)/2+ny*offset;
 return <View style={{position:'absolute',left:x-length/2,top:y-weight/2,
  width:length,height:weight,backgroundColor:color,opacity,
  borderRadius:5,transform:[{rotate:Math.atan2(dy,dx)*180/Math.PI+'deg'}]}}/>;
}
function DrawnBoard({columns,data,active}:{
 columns:DailySheet['columns'];data:PanoramaData;active:string|null
}){
 const {width:screenWidth}=useWindowDimensions();
 const width=Math.max(226,screenWidth-62),colW=(width-GUTTER-2)/Math.max(1,columns.length);
 const height=HEAD+ROW*6+9;
 const all=useMemo(()=>figures(data),[data]);
 const canvas=useMemo(()=>{
  const result:Array<{figure:Geometry;coords:{x:number;y:number}[];offset:number}>=[];
  for(const figure of all){
   const source=columns.findIndex(c=>c.id===figure.route.sourceId);
   if(source<0)continue;
   const coords=figure.route.cells.map(p=>point(source,p,colW));
   const offset=((hash(figure.route.id)%5)-2)*1.05;
   result.push({figure,coords,offset});
  }
  return result;
 },[all,columns,colW]);
 return <View style={ps.boardCard}>
  <View style={{width,height,alignSelf:'center',position:'relative'}}>
   {columns.map((col,i)=><React.Fragment key={col.id}>
    <View style={{position:'absolute',left:GUTTER+i*colW+1,top:0,
     width:colW-2,height:height-3,backgroundColor:i%2?'#f7f3f8':'#fbf9fc',
     borderWidth:1,borderColor:'#e6deeb',borderRadius:7}}/>
    <View style={{position:'absolute',left:GUTTER+i*colW,top:8,width:colW,
     justifyContent:'center',alignItems:'center'}}>
     <Text numberOfLines={2} adjustsFontSizeToFit style={{fontSize:Math.max(8,Math.min(10,colW/5.6)),
      lineHeight:12,color:'#5c4966',fontWeight:'800',textAlign:'center'}}>
      {colShort(col.id)}
     </Text>
    </View>
   </React.Fragment>)}
   {rowLabels.map((jur,row)=><Text key={jur} numberOfLines={1}
    style={{position:'absolute',left:0,top:HEAD+row*ROW+15,width:GUTTER-3,
     color:'#665f71',fontSize:9,fontWeight:'600'}}>{jur}</Text>)}
   {columns.flatMap((col,ci)=>col.values.flatMap((pair,row)=>[0,1].map(side=>{
    const xy=point(ci,{row,col:side},colW);
    return <View key={col.id+'|'+row+'|'+side}
     style={{position:'absolute',left:xy.x-colW*.21,top:xy.y-17,
      width:colW*.42,height:34,borderWidth:.7,borderColor:'#e0d7e5',
      backgroundColor:'#fff',borderRadius:4}}/>;
   })))}
   <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {canvas.flatMap(({figure,coords,offset})=>{
     const selected=active!==null&&figure.owners.has(active);
     const muted=active!==null&&!selected;
     const color=selected?COLORS[figure.route.kind]:'#715d91';
     const opacity=selected?.98:muted?.16:.29;
     const weight=selected?(figure.route.kind==='vt4'?5:figure.route.kind==='vt3'?4:3):2.3;
     return coords.slice(1).flatMap((p,i)=>{
      const a=coords[i],index=figure.route.id+'-'+i;
      return selected?[
       <Line key={index+'-border'} a={a} b={p} weight={weight+2.6}
        color="#fff" opacity={1} offset={offset}/>,
       <Line key={index+'-core'} a={a} b={p} weight={weight}
        color={color} opacity={opacity} offset={offset}/>
      ]:[
       <Line key={index} a={a} b={p} weight={weight} color={color}
        opacity={opacity} offset={offset}/>
      ];
     });
    })}
    {active!==null&&canvas.filter(x=>x.figure.owners.has(active)).map(({figure,coords,offset})=>{
     const first=coords[0];if(!first)return null;
     return <View key={figure.route.id+'-start'} style={{
      position:'absolute',left:first.x-4+offset,top:first.y-4,
      width:8,height:8,borderWidth:2,borderColor:'#fff',
      backgroundColor:COLORS[figure.route.kind],borderRadius:4,opacity:.96}}/>;
    })}
   </View>
   {columns.flatMap((col,ci)=>col.values.flatMap((pair,row)=>[0,1].map(side=>{
    const xy=point(ci,{row,col:side},colW);
    const digit=/^\d{2}$/.test(pair)?pair[side]:'–';
    return <Text key={'n'+col.id+'|'+row+'|'+side}
     style={{position:'absolute',left:xy.x-colW*.21,top:xy.y-14,
      width:colW*.42,height:28,fontSize:colW<46?13:16,
      textAlign:'center',textAlignVertical:'center',fontWeight:'900',
      color:'#261f30',textShadowColor:'#fff',textShadowRadius:3}}>{digit}</Text>;
   })))}
  </View>
 </View>;
}
function ModalDetails({visible,group,routes,onClose,mode}:{
 visible:boolean;group:PanoramaGroup|null;routes:PanoramaRoute[];
 onClose:()=>void;mode:'hoja'|'predictiva'
}){
 return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
  <View style={ps.modalBackdrop}><View style={ps.modalSheet}>
   <View style={ps.modalHeading}>
    <Text style={ps.modalTitle}>{mode==='hoja'?'Cabeza':'Familia'} {group?.label||''}</Text>
    <Pressable onPress={onClose} style={ps.modalClose}><Text style={ps.modalCloseText}>Cerrar ×</Text></Pressable>
   </View>
   <Text style={ps.note}>{group?.subtitle||''} · {routes.length} figuras físicas distintas</Text>
   <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:24}}>
    {(['vt4','vt3','vt2'] as PanoramaKind[]).map(kind=>{
     const list=routes.filter(r=>r.kind===kind);
     return list.length?<View key={kind}>
      <Text style={[ps.kindTitle,{color:COLORS[kind]}]}>{kind.toUpperCase()} · {list.length}</Text>
      {list.map(r=><View key={r.id} style={ps.routeDetail}>
       <Text style={ps.routeText}>{colShort(r.sourceId)} · {r.readings.join(' / ')}</Text>
       <Text style={ps.routeMinor}>{r.cells.map(c=>(c.row+1)+(c.col?'D':'I')).join(' → ')}</Text>
      </View>)}
     </View>:null;
    })}
    <Text style={[ps.note,{marginTop:16}]}>Los dibujos invertidos cuentan como una sola huella física. El detalle no cambia ninguna selección del motor.</Text>
   </ScrollView>
  </View></View>
 </Modal>;
}
export default function PanoramaSheet({sheet,data,mode,target,onInfo}:{
 sheet:DailySheet;data:PanoramaData;mode:'hoja'|'predictiva';
 target?:Turno;onInfo:()=>void
}){
 const [active,setActive]=useState<string|null>(null);
 const [detail,setDetail]=useState(false);
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{setActive(null);setDetail(false);setExpanded(false)},[sheet,data,mode,target]);
 const sources=mode==='predictiva'?sheet.columns.slice(0,TURNOS.indexOf(target||'Previa')+1):sheet.columns;
 const groups=mode==='hoja'?TURNOS.map(t=>({name:t,items:data.groups.filter(g=>g.turn===t)})):
 [{name:'Familias disponibles · VT3',items:data.groups}];
 const selected=data.groups.find(g=>g.id===active)||null;
 const selectedRoutes=active?data.routes.filter(r=>r.ownerId===active):[];
 const allRouteFigures=useMemo(()=>figures(data),[data]);
 return <View style={ps.surface}>
  <View style={ps.top}>
   <View><Text style={ps.title}>{mode==='hoja'?'HOJA +11':'HOJA PREDICTIVA'}</Text>
    <Text style={ps.note}>{mode==='hoja'?'Marcas confirmadas en la hoja':'Recorridos visuales disponibles · '+(target||'')}</Text></View>
   <Pressable accessibilityRole="button" onPress={onInfo} style={ps.infoButton}>
    <Text style={ps.infoText}>ⓘ Info</Text>
   </Pressable>
  </View>
  <DrawnBoard columns={sources} data={data} active={active}/>
  <View style={ps.keyRow}>{(['vt2','vt3','vt4'] as PanoramaKind[]).map(k=>
   <View key={k} style={ps.key}><View style={{width:20,height:k==='vt4'?5:k==='vt3'?4:3,
    backgroundColor:COLORS[k],borderRadius:4}}/><Text style={ps.keyText}>{k.toUpperCase()}</Text></View>
  )}</View>
  <View style={ps.selectBar}>
   <Text style={ps.count}>{active?
    (selected?.label||'')+' · '+selectedRoutes.length+' recorridos':
    allRouteFigures.length+' marcas físicas · vista completa'}</Text>
   {active?<View style={{flexDirection:'row',gap:8}}>
    <Pressable onPress={()=>setDetail(true)} style={ps.action}><Text style={ps.actionText}>Detalle</Text></Pressable>
    <Pressable onPress={()=>setActive(null)} style={ps.action}><Text style={ps.actionText}>Ver todas</Text></Pressable>
   </View>:null}
  </View>
  <Text style={ps.instructions}>Tocá una cabeza: se iluminarán TODOS sus recorridos juntos.</Text>
  {mode==='predictiva'?<View style={ps.status}>
   <Text style={ps.statusText}>Sin decisión personal registrada. Observar / no jugar sigue siendo una opción válida.</Text>
  </View>:null}
  {groups.map(({name,items})=>{
   if(!items.length)return null;
   const display=mode==='predictiva'&&!expanded?items.slice(0,18):items;
   return <View key={name} style={ps.headSection}>
    <Text style={ps.groupTitle}>{name}</Text>
    <View style={ps.chips}>
     {display.map(g=>{
      const on=active===g.id;
      return <Pressable key={g.id} onPress={()=>setActive(on?null:g.id)}
       accessibilityRole="button" accessibilityState={{selected:on}}
       style={[ps.chip,on&&ps.chipActive,g.routeCount===0&&ps.chipEmpty]}>
       <Text style={[ps.chipNumber,on&&ps.chipNumberOn]}>{g.label}</Text>
       <Text style={ps.chipLabel} numberOfLines={1}>{g.subtitle}</Text>
       {g.routeCount>0?<Text style={ps.chipCount}>{g.routeCount} trazos · {g.kinds.join('/')}</Text>:
        <Text style={ps.chipCount}>Sin marca</Text>}
      </Pressable>;
     })}
    </View>
    {mode==='predictiva'&&items.length>18?<Pressable onPress={()=>setExpanded(v=>!v)} style={ps.showMore}>
     <Text style={ps.showMoreText}>{expanded?'Mostrar menos':'Ver todas las '+items.length+' familias'}</Text>
    </Pressable>:null}
   </View>;
  })}
  {data.groups.length===0?<Text style={ps.empty}>Todavía no hay cabezas o recorridos disponibles para esta hoja.</Text>:null}
  <ModalDetails visible={detail} group={selected} routes={selectedRoutes} onClose={()=>setDetail(false)} mode={mode}/>
 </View>;
}
const ps=StyleSheet.create({
 surface:{backgroundColor:'#f7f4f8',borderRadius:13,padding:9,marginTop:8,marginBottom:12},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:5,paddingTop:5,paddingBottom:10},
 title:{fontSize:17,fontWeight:'900',color:'#2c2240',letterSpacing:.4},
 note:{fontSize:11,color:'#736878',marginTop:2},
 infoButton:{paddingVertical:6,paddingHorizontal:9,borderRadius:9,borderWidth:1,borderColor:'#dbd2e5'},
 infoText:{fontSize:12,fontWeight:'700',color:'#694a82'},
 boardCard:{backgroundColor:'#fff',borderRadius:10,paddingVertical:9,paddingHorizontal:0,borderWidth:1,borderColor:'#ddd5e4',overflow:'hidden'},
 keyRow:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:15,marginTop:9,marginBottom:4},
 key:{flexDirection:'row',alignItems:'center',gap:4},keyText:{fontSize:10,color:'#655a70',fontWeight:'700'},
 selectBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:8,paddingHorizontal:3,flexWrap:'wrap',gap:6},
 count:{fontSize:11,fontWeight:'700',color:'#51415e'},
 action:{borderWidth:1,borderColor:'#c6b6d6',backgroundColor:'#fff',paddingVertical:5,paddingHorizontal:8,borderRadius:7},
 actionText:{color:'#5c3679',fontSize:11,fontWeight:'800'},
 instructions:{fontSize:11,color:'#887b92',paddingVertical:8,paddingLeft:4},
 headSection:{borderTopWidth:1,borderTopColor:'#e2d9e9',paddingTop:9,marginTop:9},
 groupTitle:{fontSize:12,fontWeight:'900',color:'#645078',marginBottom:6},
 chips:{flexDirection:'row',flexWrap:'wrap',gap:6},
 chip:{minWidth:78,backgroundColor:'#fff',borderWidth:1,borderColor:'#d7cedf',
  borderRadius:8,paddingVertical:8,paddingHorizontal:8},
 chipActive:{backgroundColor:'#eee4fa',borderColor:'#6c32a3',borderWidth:2},
 chipEmpty:{opacity:.55},
 chipNumber:{color:'#30223f',fontSize:18,fontWeight:'900',letterSpacing:1},
 chipNumberOn:{color:'#6324a0'},
 chipLabel:{color:'#7b7183',fontSize:10,marginTop:1},
 chipCount:{color:'#a09aaa',fontSize:9,marginTop:2},
 status:{backgroundColor:'#f0ebf4',padding:9,borderRadius:8,marginBottom:7},
 statusText:{fontSize:11,color:'#5e5370'},
 showMore:{padding:10,marginTop:8,borderRadius:7,backgroundColor:'#ede5f6'},
 showMoreText:{color:'#6b4383',textAlign:'center',fontSize:12,fontWeight:'800'},
 empty:{color:'#7e7087',padding:12,fontSize:12},
 modalBackdrop:{flex:1,backgroundColor:'rgba(17,10,24,.66)',justifyContent:'flex-end'},
 modalSheet:{height:'83%',backgroundColor:'#fdfbfe',padding:18,borderTopLeftRadius:20,borderTopRightRadius:20},
 modalHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 modalTitle:{fontWeight:'900',fontSize:21,color:'#2e253a'},
 modalClose:{padding:7},modalCloseText:{color:'#703ba1',fontWeight:'800'},
 kindTitle:{fontWeight:'900',marginTop:16,fontSize:14},
 routeDetail:{padding:9,marginTop:5,backgroundColor:'#f3edf8',borderRadius:8},
 routeText:{fontSize:13,fontWeight:'800',color:'#3d304a'},
 routeMinor:{fontSize:11,color:'#6f607c',marginTop:2}
});
