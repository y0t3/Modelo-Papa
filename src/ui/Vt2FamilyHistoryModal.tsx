import React,{useEffect,useMemo,useState} from 'react';
import {Modal,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import type {Turno} from '../domain';
import type {DailySheet,SourceId} from '../sheet';
import type {Path} from '../paths';
import type {LaloView} from '../motorLalo';
import type {InfoVisualDay} from '../infoTurnHistory';
import {readableWeekday} from '../infoTurnHistory';
import {buildVt2FamilyWitnesses} from '../vt2FamilyHistory';
import {shapeWitnesses} from '../shapeWitnesses';
import type {PanoramaRoute} from '../panoramaModel';
import type {Vt2Witness} from '../vt2FamilyHistory';
import {useLaloTheme} from './LaloTheme';

function MiniColumn({title,source,values,path}:{
 title:string;source:string;values:string[];path:Path
}){
 const {colors:c,kinds}=useLaloTheme();
 const marked=new Map(path.map((cell,i)=>[cell.row+':'+cell.col,i+1]));
 return <View style={[s.board,{backgroundColor:c.board,borderColor:c.border}]}>
  <Text numberOfLines={2} style={[s.boardTitle,{color:c.subtext}]}>{title}</Text>
  <Text numberOfLines={2} style={[s.source,{color:c.muted}]}>{source}</Text>
  {Array.from({length:6},(_,row)=><View key={row} style={s.boardRow}>
   <Text style={[s.rowNo,{color:c.muted}]}>{row+1}</Text>
   {[0,1].map(col=>{
    const index=marked.get(row+':'+col);
    const digit=(values[row]||'--')[col]||'–';
    return <View key={col} style={[s.cell,{
     backgroundColor:index?kinds.vt2.fill:c.cell,
     borderColor:index?kinds.vt2.line:c.border
    }]}>
     <Text style={{fontSize:15,fontWeight:'900',color:index?kinds.vt2.text:c.text}}>{digit}</Text>
     {index?<Text style={[s.cellOrder,{color:kinds.vt2.line}]}>{index}</Text>:null}
    </View>;
   })}
  </View>)}
  <Text style={[s.pathDigits,{color:c.subtext}]}>{path.map(x=>x.digit).join('')}</Text>
 </View>;
}
export default function Vt2FamilyHistoryModal({date,turn,family,view,sheet,days,
 onClose,onOpenCurrent}:{
 date:string;turn:Turno;family:string|null;view:LaloView|null;
 sheet:DailySheet|null;days:InfoVisualDay[];
 onClose:()=>void;onOpenCurrent:()=>void;
}){
 const {colors:c}=useLaloTheme();
 const witnesses=useMemo(()=>family?
  buildVt2FamilyWitnesses(date,turn,family,sheet,days):[],
  [date,turn,family,sheet,days]);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [routeIndex,setRouteIndex]=useState(0);
 const [shapeIndex,setShapeIndex]=useState(0);
 useEffect(()=>{setSelectedId(null);setRouteIndex(0);setShapeIndex(0)},[family,date,turn]);
 const selected=witnesses.find(x=>x.id===selectedId)||witnesses[0]||null;
 const route=selected?.paths[routeIndex]||selected?.paths[0]||null;
 const current=useMemo(()=>{
  if(!family)return null;
  const rank=view?.ranks.vt2.find(f=>f.family===family);
  const actualPaths=[...(rank?.paths||[])].sort((a,b)=>b.rootIds.length-a.rootIds.length);
  for(const r of actualPaths){
   const column=sheet?.columns.find(c=>c.id===r.sourceId);
   if(!column||r.path.length!==2||
    !r.path.every(x=>column.values[x.row]?.[x.col]===x.digit))continue;
   return {sourceId:r.sourceId,values:column.values,path:r.path,
    source:column.sourceLabel,rootIds:r.rootIds,parents:rank?.parentFamilies||[]};
  }
  return null;
 },[family,view,sheet]);
 const currentRoute=useMemo(():PanoramaRoute|null=>current?({
  id:'vt2|current|'+family,ownerId:'vt2|'+family,kind:'vt2',
  sourceId:current.sourceId,cells:current.path.map(p=>({row:p.row,col:p.col})),
  readings:[current.path.map(p=>p.digit).join('')],headSources:[]
 }):null,[current,family]);
 const sameShape=useMemo(()=>currentRoute&&sheet?
  shapeWitnesses(date,turn,currentRoute,sheet,days):[],
  [date,turn,currentRoute,sheet,days]);
 const shapeEntry=sameShape[shapeIndex%sameShape.length]||null;
 const supportingRoots=useMemo(()=>{
  if(!view||!current)return [];
  const entries=[];
  for(const id of current.rootIds){
   const ref=view.roots.find(r=>r.id===id);
   if(!ref)continue;
   const day=days.find(d=>d.date===ref.date);
   const col=day?.sheet.columns.find(c=>c.id===ref.sourceId);
   const points=ref.oldCells.map(value=>{
    const m=/^([0-5]):([01])$/.exec(value);
    if(!m||!col)return null;
    const row=Number(m[1]),column=Number(m[2]);
    const digit=col.values[row]?.[column];
    return digit&&/^\d$/.test(digit)?{row,col:column,digit}:null;
   });
   const path=points.every(Boolean)?points as Path:null;
   const reading=path?.map(p=>p.digit).join('')||'';
   if(path&&(!/^\d{4}$/.test(ref.head)||!ref.head.endsWith(reading)))continue;
   entries.push({ref,values:col?.values||null,
    source:col?.sourceLabel||ref.sourceId,path});
  }
  return entries;
 },[view,current,days]);
 const summary=selected?
  selected.scope==='HOY'?'Acertó hoy en '+selected.turn:
  'Coincidió el '+readableWeekday(selected.date):'';
 return <Modal transparent visible={!!family} animationType="fade" onRequestClose={onClose}>
  <View style={s.backdrop}>
   <View style={[s.modal,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Text style={[s.title,{color:c.text}]}>¿Qué respalda esta selección VT2? · {family||''}</Text>
    <Text style={[s.note,{color:c.subtext}]}>
     Lalo parte de figuras ganadoras y las traslada, pero el TOP se ordena por familia.
     Primero la figura del camino seleccionado, después sus raíces reales;
     al final las coincidencias numéricas que NO son necesariamente la misma forma.
    </Text>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator>
     {current?<View style={[s.detail,{backgroundColor:c.surfaceAlt}]}>
      <Text style={[s.detailTitle,{color:c.text}]}>
       1 · FIGURA ACTUAL QUE PRODUCE LA FAMILIA
      </Text>
      <View style={s.boards}>
       <MiniColumn title="PRE DE HOY" source={current.source}
        values={current.values} path={current.path}/>
      </View>
      <Text style={[s.note,{color:c.subtext}]}>
       {current.path.map(p=>'F'+(p.row+1)+(p.col?'D':'I')).join(' → ')}.
       Lectura actual: {current.path.map(p=>p.digit).join('')}.
       Este es uno de los recorridos admitidos de la familia; el TOP
       contabiliza también los demás recorridos propios.
      </Text>
      <Text style={[s.detailTitle,{color:c.text}]}>
       2 · APARICIONES DE ESTA MISMA FORMA, CON CUALQUIER CIFRA
      </Text>
      <Text style={[s.note,{color:c.subtext}]}>
       {sameShape.length} camino(s) ganador(es) anteriores con la misma silueta.
       Son memoria visual para comparar, NO votos nuevos para el ranking.
      </Text>
      {shapeEntry?<View style={s.boards}>
       <MiniColumn title={'ANTERIOR · '+readableWeekday(shapeEntry.date)}
        source={shapeEntry.sourceLabel} values={shapeEntry.values}
        path={shapeEntry.cells.map(p=>({row:p.row,col:p.col,
         digit:shapeEntry.values[p.row]?.[p.col]||''}))}/>
      </View>:<Text style={[s.note,{color:c.muted}]}>
       Sin antecedentes ganadores comprobados de esta misma silueta
       en la ventana disponible. No se inventa una figura antigua.
      </Text>}
      {shapeEntry?<Text style={[s.note,{color:c.text}]}>
       {shapeEntry.jurisdiction} · {shapeEntry.head} · produjo {shapeEntry.reading}.
       {shapeEntry.sourceChanged?' Cambió de fuente.':' Misma fuente.'}
       {shapeEntry.rowShift===0?' Misma altura.':
        ' Se desplazó '+Math.abs(shapeEntry.rowShift)+' fila(s).'}
      </Text>:null}
      {sameShape.length>1?<View style={s.routes}>
       <Pressable accessibilityRole="button"
        onPress={()=>setShapeIndex(i=>(i+sameShape.length-1)%sameShape.length)}
        style={[s.routeButton,{borderColor:c.border}]}>
        <Text style={{color:c.accent,fontWeight:'900'}}>← Figura</Text>
       </Pressable>
       <Text style={{color:c.subtext,fontSize:11}}>
        {(shapeIndex%sameShape.length)+1}/{sameShape.length}
       </Text>
       <Pressable accessibilityRole="button"
        onPress={()=>setShapeIndex(i=>(i+1)%sameShape.length)}
        style={[s.routeButton,{borderColor:c.border}]}>
        <Text style={{color:c.accent,fontWeight:'900'}}>Otra figura →</Text>
       </Pressable>
      </View>:null}
      <Text style={[s.detailTitle,{color:c.text}]}>
       3 · RAÍCES QUE LALO EFECTIVAMENTE UTILIZÓ
      </Text>
      <Text style={[s.note,{color:c.subtext}]}>
       {current.rootIds.length} ruta(s) raíz vinculada(s) a este camino.
       Los resultados antiguos aquí sí provienen de testigos del motor;
       no se sumaron por simplemente parecerse.
      </Text>
      {supportingRoots.slice(0,12).map(({ref,values,source,path})=>
       <View key={ref.id} style={{gap:5,borderTopWidth:1,borderTopColor:c.border,paddingTop:7}}>
        <Text style={[s.note,{color:c.text}]}>
         {ref.period} · {readableWeekday(ref.date)} · {ref.oldTurn} ·
         {ref.jurisdiction} {ref.head}
        </Text>
        {values&&path?<View style={s.boards}>
         <MiniColumn title="RAÍZ FÍSICA" source={source}
          values={values} path={path}/>
        </View>:<Text style={[s.note,{color:c.muted}]}>
         No hay minihoja histórica completa disponible para dibujar esta raíz.
        </Text>}
       </View>)}
      {current.rootIds.length===0?<Text style={[s.note,{color:c.subtext}]}>
       Este recorrido no tiene una raíz VT2 directa visible.
       {current.parents.length?' Deriva físicamente de madre(s) VT3: '+
        current.parents.join(' · ')+'.':''}
       La familia puede tener otros recorridos respaldados.
      </Text>:null}
      {supportingRoots.length>12?<Text style={[s.note,{color:c.muted}]}>
       Se muestran las primeras 12 raíces de este camino; hay
       {supportingRoots.length-12} más.
      </Text>:null}
     </View>:null}
     <Text style={[s.detailTitle,{color:c.text}]}>
      4 · COINCIDENCIAS DE LA FAMILIA (OTROS RECORRIDOS)
     </Text>
     <Text style={[s.note,{color:c.subtext}]}>
      Estas cabezas comparten las últimas cifras, pero podrían usar
      formas geométricas distintas. No son automáticamente el respaldo
      físico de este camino.
     </Text>
     {witnesses.length?<View style={s.witnesses}>
      {witnesses.map(item=><Pressable key={item.id} accessibilityRole="button"
       accessibilityState={{selected:selected?.id===item.id}}
       onPress={()=>{setSelectedId(item.id);setRouteIndex(0)}}
       style={[s.witness,{
        backgroundColor:selected?.id===item.id?c.accentFill:c.card,
        borderColor:selected?.id===item.id?c.accent:c.border
       }]}>
       <View style={s.witnessRow}>
        <Text style={{color:c.text,fontSize:11,fontWeight:'900',flex:1}}>
         {item.scope==='HOY'?'Hoy':readableWeekday(item.date)} · {item.turn}
        </Text>
        <Text style={{color:c.accent,fontSize:10,fontWeight:'800'}}>Ver minihoja ›</Text>
       </View>
       <Text style={{color:c.subtext,fontSize:10}}>
        {item.jurisdiction} {item.head} · {item.paths.length} recorrido(s)
       </Text>
      </Pressable>)}
     </View>:<Text style={[s.note,{color:c.subtext}]}>
      No hay cabezas anteriores con un recorrido VT2 comprobado de esta familia
      entre las jornadas cargadas. La presencia en un ranking, por sí sola, no es un acierto.
     </Text>}
     {selected&&route?<View style={[s.detail,{backgroundColor:c.surfaceAlt}]}>
      <Text style={[s.detailTitle,{color:c.text}]}>{summary}</Text>
      <Text style={[s.note,{color:c.subtext}]}>
       {selected.jurisdiction} · Cabeza {selected.head} · Terminación {selected.value}
      </Text>
      <View style={s.boards}>
       <MiniColumn title="ANTECEDENTE" source={selected.sourceLabel}
        values={selected.values} path={route}/>
       {current?<MiniColumn title="TOP ACTUAL" source={current.source}
        values={current.values} path={current.path}/>:null}
      </View>
      <Text style={[s.note,{color:c.subtext}]}>
       Coincidieron las cifras de esta familia VT2. No significa que el
       recorrido antiguo tenga la misma figura ni que sea raíz de esta selección.
      </Text>
      {selected.paths.length>1?<View style={s.routes}>
       <Pressable accessibilityRole="button" onPress={()=>setRouteIndex(i=>(i-1+selected.paths.length)%selected.paths.length)}
        style={[s.routeButton,{borderColor:c.border}]}>
        <Text style={{color:c.accent,fontWeight:'900'}}>← Anterior</Text>
       </Pressable>
       <Text style={{color:c.subtext,fontSize:11}}>{(routeIndex%selected.paths.length)+1}/{selected.paths.length}</Text>
       <Pressable accessibilityRole="button" onPress={()=>setRouteIndex(i=>(i+1)%selected.paths.length)}
        style={[s.routeButton,{borderColor:c.border}]}>
        <Text style={{color:c.accent,fontWeight:'900'}}>Siguiente →</Text>
       </Pressable>
      </View>:null}
     </View>:null}
    </ScrollView>
    <View style={s.actions}>
     {current?<Pressable accessibilityRole="button" onPress={onOpenCurrent}
      style={[s.button,{borderColor:c.accent,backgroundColor:c.accentFill}]}>
      <Text style={{color:c.accent,fontWeight:'900'}}>Abrir recorrido actual</Text>
     </Pressable>:null}
     <Pressable accessibilityRole="button" onPress={onClose}
      style={[s.button,{borderColor:c.border}]}>
      <Text style={{color:c.text,fontWeight:'900'}}>Cerrar</Text>
     </Pressable>
    </View>
   </View>
  </View>
 </Modal>;
}
const s=StyleSheet.create({
 backdrop:{flex:1,backgroundColor:'rgba(0,0,0,0.76)',justifyContent:'center',padding:13},
 modal:{borderRadius:13,borderWidth:1,padding:14,maxHeight:'91%',gap:8},
 title:{fontSize:16,fontWeight:'900'},note:{fontSize:11,lineHeight:17},
 content:{gap:11,paddingBottom:8},witnesses:{gap:5},
 witness:{borderWidth:1,borderRadius:8,padding:8,gap:4},
 witnessRow:{flexDirection:'row',alignItems:'center',gap:7},
 detail:{padding:10,borderRadius:9,gap:8},
 detailTitle:{fontSize:13,fontWeight:'900'},
 boards:{flexDirection:'row',justifyContent:'center',alignItems:'flex-start',gap:8,flexWrap:'wrap'},
 board:{borderRadius:8,borderWidth:1,padding:8,gap:3,alignItems:'center',width:132},
 boardTitle:{fontWeight:'900',fontSize:11,textAlign:'center'},
 source:{fontSize:9,textAlign:'center',minHeight:23},
 boardRow:{flexDirection:'row',gap:3,alignItems:'center'},
 rowNo:{width:13,fontSize:9,textAlign:'center'},
 cell:{width:34,height:28,borderWidth:1,borderRadius:3,alignItems:'center',justifyContent:'center'},
 cellOrder:{position:'absolute',fontSize:8,fontWeight:'900',right:1,top:0},
 pathDigits:{fontSize:11,fontWeight:'800'},
 routes:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6},
 routeButton:{padding:7,borderRadius:7,borderWidth:1},
 actions:{flexDirection:'row',flexWrap:'wrap',justifyContent:'flex-end',gap:8},
 button:{paddingHorizontal:10,paddingVertical:9,borderRadius:8,borderWidth:1}
});
