import React,{useEffect,useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import type {DailySheet,SourceId} from '../sheet';
import type {Turno} from '../domain';
import type {InfoVisualDay} from '../infoTurnHistory';
import type {LaloView} from '../motorLalo';
import type {TrackingAuxInput,FigureRoute,FigureAntecedent,FigureRecord} from '../figureTracking';
import {buildFigureTracking,TRACK_SOURCES} from '../figureTracking';
import {auxiliaryBoard,findAuxPaths,AUX_SOURCE_TURNS,AUX_ROWS} from '../auxSantiagoNeuquen';
import {auxAtCut} from '../auxTemporalModes';
import type {AuxMode} from '../auxTemporalModes';
import {useLaloTheme} from './LaloTheme';

type Props={date:string;turn:Turno;sheet:DailySheet|null;
 history:InfoVisualDay[];view:LaloView|null;
 ayer:TrackingAuxInput;hoy:TrackingAuxInput;
 focusRequest:string|null;
 onOpenLalo:(family:string)=>void;
 onOpenAux:(family:string,mode:AuxMode)=>void;
};
const sourceName:Record<SourceId,string>={
 prevNocturno:'Nocturna anterior',Previa:'Previa',
 Primera:'Primera',Matutino:'Matutino',Vespertino:'Vespertino'
};
const place=(route:FigureRoute)=>route.cells.map(
 p=>'F'+(p.row+1)+(p.col===0?' izquierda':' derecha')).join(' → ');
/** Cuadrícula pequeña de la fuente real, nunca una figura ilustrativa. */
function FigureMini({source,route,title}:{
 source:string;route:FigureRoute;title:string
}){
 const {colors:c,kinds}=useLaloTheme();
 const marks=new Map(route.cells.map((cell,i)=>[cell.row+':'+cell.col,i+1]));
 const values=source.split('|');
 return <View style={[styles.mini,{borderColor:c.border,backgroundColor:c.board}]}>
  <Text style={[styles.miniTitle,{color:c.subtext}]}>{title}</Text>
  {Array.from({length:6},(_,r)=><View key={r} style={styles.miniRow}>
   <Text style={[styles.rowNum,{color:c.muted}]}>{r+1}</Text>
   {[0,1].map(col=>{
    const index=marks.get(r+':'+col);
    const digit=(values[r]||'--')[col]||'–';
    return <View key={col} style={[styles.miniCell,{
     borderColor:index?kinds.vt3.line:c.border,
     backgroundColor:index?kinds.vt3.fill:c.cell
    }]}>
     <Text style={{fontSize:16,fontWeight:'800',
      color:index?kinds.vt3.text:c.text}}>{digit}</Text>
     {index?<Text style={[styles.order,{color:kinds.vt3.line}]}>{index}</Text>:null}
    </View>
   })}
  </View>)}
  <Text style={[styles.miniFooter,{color:c.subtext}]}>{route.digits} · {route.source==='prevNocturno'?'Noct. ant.':route.source}</Text>
 </View>;
}
function AuxMini({data,mode,turn,family}:{
 data:TrackingAuxInput;mode:AuxMode;turn:Turno;family:string
}){
 const {colors:c,kinds}=useLaloTheme();
 if(!data.heads)return null;
 const board=auxiliaryBoard(auxAtCut(data.heads,turn,mode),turn);
 const paths=family.split('/').flatMap(value=>findAuxPaths(board,value));
 const first=paths[0];
 const selected=new Map((first||[]).map((p,i)=>[p.row+':'+p.col,i+1]));
 const byCell=new Map(board.cells.map(p=>[p.row+':'+p.col,p]));
 return <View style={{gap:5}}>
  <Text style={[styles.small,{color:c.subtext}]}>HOJA AUX {mode==='anterior'?'AYER':'HOY'} · {paths.length} recorrido(s) de esta familia</Text>
  <View style={[styles.auxGrid,{backgroundColor:c.board,borderColor:c.border}]}>
   <View style={styles.auxRow}>
    <Text style={{width:48}}/>
    {AUX_SOURCE_TURNS.map(t=><Text key={t} style={{width:76,textAlign:'center',fontSize:9,
     color:c.subtext,fontWeight:'700'}}>{t}</Text>)}
   </View>
   {AUX_ROWS.map((jur,r)=><View key={jur} style={styles.auxRow}>
    <Text style={{width:48,fontSize:9,color:c.subtext}}>{jur==='Neuquen'?'Neuquén':jur}</Text>
    {Array.from({length:12},(_,k)=>{
     const index=selected.get(r+':'+k),cell=byCell.get(r+':'+k);
     return <View key={k} style={[styles.auxCell,{
      backgroundColor:index?kinds.vt3.fill:cell?c.cell:c.surfaceAlt,
      borderColor:index?kinds.vt3.line:c.border}]}>
      <Text style={{fontSize:10,fontWeight:'800',color:c.text}}>{cell?.digit||'·'}</Text>
      {index?<Text style={[styles.auxOrder,{color:kinds.vt3.line}]}>{index}</Text>:null}
     </View>;
    })}
   </View>)}
  </View>
  {!paths.length?<Text style={[styles.small,{color:c.muted}]}>Esta familia no tiene recorrido físico AUX en el corte elegido.</Text>:null}
 </View>;
}
function StatusLine({name,formable,rank,available}:{
 name:string;formable:boolean;rank:number|null;available:boolean
}){
 const {colors:c}=useLaloTheme();
 return <View style={styles.statusRow}>
  <Text style={[styles.small,{fontWeight:'800',color:c.text,flex:1}]}>{name}</Text>
  <Text style={[styles.small,{color:c.subtext,textAlign:'right',flex:1}]}>
   {!available?'Sin datos':rank!==null?'Reconocida · #'+rank:
    formable?'Formable · no reconocida':'No formable'}
  </Text>
 </View>;
}
export default function FigureTrackingPanel({date,turn,sheet,history,view,ayer,hoy,
 focusRequest,onOpenLalo,onOpenAux}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const [expanded,setExpanded]=useState(false);
 const [filter,setFilter]=useState<'sin'|'todas'|'top'>('sin');
 const [query,setQuery]=useState('');
 const [limit,setLimit]=useState(12);
 const [selected,setSelected]=useState<string|null>(null);
 const [showAux,setShowAux]=useState<AuxMode|null>(null);
 const tracking=useMemo(()=>sheet&&date&&expanded?
  buildFigureTracking(date,turn,sheet,history,view,ayer,hoy):null,
  [sheet,date,turn,history,view,ayer,hoy,expanded]);
 useEffect(()=>{
  if(!focusRequest)return;
  const family=focusRequest.startsWith('vt3|')?focusRequest.slice(4):focusRequest;
  setExpanded(true);setFilter('todas');setQuery(family);
  setSelected(family);setLimit(12);
 },[focusRequest]);
 useEffect(()=>{setSelected(null);setShowAux(null);setLimit(12);},[date,turn]);
 const filtered=(tracking?.records||[]).filter(f=>
  (filter==='todas'||filter==='top'&&f.top10||
   filter==='sin'&&!f.recognized&&f.antecedents.length>0)&&
  (!query.trim()||f.family.includes(query.trim())||
   f.family.split('/').some(x=>x.includes(query.trim()))));
 const current=tracking?.records.find(x=>x.family===selected)||filtered[0]||null;
 const active=current?.antecedents[0]?.currentRoute||current?.current[0]||null;
 const shown=filtered.slice(0,limit);
 const previous=history.filter(day=>day.date<date);
 const oldColumn=(root:FigureAntecedent)=>{
  const day=previous.find(x=>x.date===root.date);
  return day?.sheet.columns.find(x=>x.id===root.source)?.values.join('|')||'';
 };
 const currentColumn=(route:FigureRoute)=>
  sheet?.columns.find(x=>x.id===route.source)?.values.join('|')||'';
 return <View style={{gap:10}}>
  <Pressable accessibilityRole="button" accessibilityState={{expanded}}
   onPress={()=>setExpanded(v=>!v)}
   style={[styles.header,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
   <View style={{flex:1,gap:4}}>
    <Text style={[styles.heading,{color:c.text}]}>Seguimiento de figuras VT3</Text>
    <Text style={[styles.small,{color:c.subtext}]}>
     Observá rastros ganadores, movimientos y presencia en cada motor. No cambia los Tops.
    </Text>
   </View>
   <Text style={{fontSize:22,color:c.accent,fontWeight:'900'}}>{expanded?'−':'+'}</Text>
  </Pressable>
  {expanded? !sheet||!date?
   <Text style={{color:c.subtext}}>Cargá una hoja para estudiar sus figuras.</Text>:!tracking?
   <Text style={{color:c.subtext}}>Preparando la lectura del corte...</Text>:<>
   <View style={[styles.summary,{backgroundColor:c.surfaceAlt}]}>
    <Text style={{fontWeight:'800',color:c.text}}>
     {tracking.physicallyFormable} familias formables · {tracking.withoutRecognition} no reconocidas
    </Text>
    <Text style={[styles.small,{color:c.subtext}]}>
     {tracking.unrecognizedWithWitness} no reconocidas con antecedentes ganadores ·
     {tracking.days.length} jornadas históricas disponibles
    </Text>
    <Text style={[styles.small,{color:c.muted}]}>
     Registro de figuras, no selección ni probabilidad de acierto. No se usan cabezas del turno objetivo.
    </Text>
   </View>
   <View style={styles.filters}>
    {([
     {id:'sin',label:'Con rastro, fuera de Lalo'},
     {id:'top',label:'Reconocidas Top10'},
     {id:'todas',label:'Todas'}
    ] as const).map(f=><Pressable key={f.id} accessibilityRole="button"
      accessibilityState={{selected:filter===f.id}}
      style={[styles.chip,{borderColor:filter===f.id?c.accent:c.border,
       backgroundColor:filter===f.id?c.accentFill:c.card}]}
      onPress={()=>{setFilter(f.id);setSelected(null);setLimit(12)}}>
      <Text style={[styles.chipText,{color:filter===f.id?c.accent:c.text}]}>{f.label}</Text>
     </Pressable>)}
   </View>
   <TextInput accessibilityLabel="Buscar familia VT3" value={query}
    onChangeText={t=>{setQuery(t.replace(/[^0-9/]/g,'').slice(0,7));setSelected(null)}}
    keyboardType="numbers-and-punctuation" placeholder="Buscar familia, por ejemplo 396 o 693"
    placeholderTextColor={c.muted}
    style={[styles.input,{color:c.text,backgroundColor:c.card,borderColor:c.border}]}/>
   <Text style={[styles.small,{color:c.subtext}]}>
    {filtered.length} familias en este filtro. Orden de consulta, no prioridad predictiva.
   </Text>
   <View style={styles.families}>{shown.map(f=><Pressable key={f.family}
    onPress={()=>{setSelected(f.family);setShowAux(null)}}
    accessibilityRole="button"
    style={[styles.family,{borderColor:current?.family===f.family?c.accent:c.border,
     backgroundColor:current?.family===f.family?c.accentFill:c.card}]}>
    <Text style={{color:c.text,fontWeight:'900',fontSize:13}}>{f.family}</Text>
    <Text style={{color:c.subtext,fontSize:10}}>
     {f.recognized?'Lalo #'+f.rank:'Sin reconocer'} · {f.antecedents.length} rastro(s)
    </Text>
   </Pressable>)}</View>
   {filtered.length>limit?<Pressable onPress={()=>setLimit(n=>n+12)}
    accessibilityRole="button" style={[styles.chip,{alignSelf:'flex-start',borderColor:c.accent}]}>
    <Text style={{color:c.accent,fontWeight:'800'}}>Mostrar más ({filtered.length-limit} restantes)</Text>
   </Pressable>:null}
   {current&&active?<View style={[styles.detail,{borderColor:c.border,backgroundColor:c.card}]}>
    <Text style={[styles.heading,{color:c.text}]}>{current.family}</Text>
    <Text style={[styles.small,{color:c.subtext}]}>
     Aparece físicamente por {current.current.length} recorrido(s), en
     {new Set(current.current.map(r=>r.source)).size} fuente(s) +11.
    </Text>
    <StatusLine name="Modelo Lalo +11" available formable rank={current.rank}/>
    <StatusLine name="AUX AYER" available={current.auxYesterday.available}
     formable={current.auxYesterday.formable} rank={current.auxYesterday.rank}/>
    <StatusLine name="AUX HOY" available={current.auxToday.available}
     formable={current.auxToday.formable} rank={current.auxToday.rank}/>
    <View style={styles.miniLine}>
     <FigureMini route={active} source={currentColumn(active)}
      title={'HOY · '+sourceName[active.source]}/>
     {current.antecedents[0]?<>
      <Text style={{fontSize:18,color:c.accent}}>⇄</Text>
      <FigureMini route={current.antecedents[0]}
       source={oldColumn(current.antecedents[0])}
       title={current.antecedents[0].date.slice(8,10)+'/'+current.antecedents[0].date.slice(5,7)}/>
     </>:null}
    </View>
    <Text style={[styles.small,{color:c.subtext}]}>Ruta actual: {place(active)}</Text>
    <Text style={{fontWeight:'900',color:c.text,marginTop:5}}>Antecedentes ganadores reales</Text>
    {current.antecedents.length?current.antecedents.slice(0,6).map((root,i)=>
     <View key={[root.date,root.turn,root.jurisdiction,root.head,root.source,i].join('|')}
       style={[styles.rootRow,{borderTopColor:c.border}]}>
      <Text style={{color:c.text,fontWeight:'700',fontSize:11}}>
       {root.date.slice(8,10)+'/'+root.date.slice(5,7)} · {root.turn} · {root.jurisdiction} {root.head}
      </Text>
      <Text style={[styles.small,{color:c.subtext}]}>
       Figura {root.digits} · {sourceName[root.source]} →
       {sourceName[active.source]} · {root.relation==='MISMA_FUENTE'?'misma fuente':
        root.relation==='VECINA'?'fuente vecina':'otra fuente'} ·
       traslado vertical {root.verticalShift===0?'0':root.verticalShift>0?'+'+root.verticalShift:String(root.verticalShift)} filas
      </Text>
     </View>):<Text style={[styles.small,{color:c.subtext}]}>
      No se registraron figuras ganadoras de esta silueta en las jornadas cargadas.
     </Text>}
    {current.antecedents.length>6?<Text style={[styles.small,{color:c.muted}]}>
     Hay {current.antecedents.length-6} testigos adicionales; se muestran seis para evitar saturar.
    </Text>:null}
    <View style={styles.actions}>
     {current.recognized?<Pressable onPress={()=>onOpenLalo(current.family)}
       accessibilityRole="button" style={[styles.action,{borderColor:c.accent}]}>
      <Text style={{color:c.accent,fontWeight:'800',fontSize:11}}>Abrir recorrido Lalo</Text>
     </Pressable>:null}
     {(['anterior','intrajornada'] as const).map(mode=>{
      const status=mode==='anterior'?current.auxYesterday:current.auxToday;
      return status.formable?<Pressable key={mode} accessibilityRole="button"
       style={[styles.action,{borderColor:c.accent}]} onPress={()=>setShowAux(x=>x===mode?null:mode)}>
       <Text style={{color:c.accent,fontWeight:'800',fontSize:11}}>
        {showAux===mode?'Ocultar':'Ver'} AUX {mode==='anterior'?'AYER':'HOY'}
       </Text>
      </Pressable>:null;
     })}
    </View>
    {showAux?<AuxMini data={showAux==='anterior'?ayer:hoy} mode={showAux}
     turn={turn} family={current.family}/>:null}
    {showAux&&((showAux==='anterior'?current.auxYesterday:current.auxToday).recognized)?
     <Pressable accessibilityRole="button"
      onPress={()=>onOpenAux(current.family,showAux)}
      style={[styles.action,{alignSelf:'flex-start',borderColor:c.accent}]}>
      <Text style={{color:c.accent,fontWeight:'800'}}>Abrir predictiva AUX</Text>
     </Pressable>:null}
    {!current.recognized?<Text style={[styles.small,{color:c.muted}]}>
     La familia no forma parte del ranking oficial: su minihoja se muestra aquí sin inventar una propuesta Lalo.
    </Text>:null}
   </View>:<Text style={{color:c.subtext,fontSize:12}}>
    No hay familias que cumplan este filtro en el corte seleccionado.
   </Text>}
  </>:null}
 </View>;
}
const styles=StyleSheet.create({
 header:{borderWidth:1,borderRadius:10,padding:11,flexDirection:'row',alignItems:'center',gap:8},
 heading:{fontWeight:'900',fontSize:14},
 small:{fontSize:10,lineHeight:16},
 summary:{padding:10,borderRadius:9,gap:5},
 filters:{flexDirection:'row',flexWrap:'wrap',gap:5},
 chip:{borderWidth:1,paddingVertical:7,paddingHorizontal:8,borderRadius:8},
 chipText:{fontSize:10,fontWeight:'800'},
 input:{borderWidth:1,borderRadius:8,paddingHorizontal:10,paddingVertical:8,fontSize:13},
 families:{flexDirection:'row',flexWrap:'wrap',gap:6},
 family:{borderWidth:1,paddingHorizontal:9,paddingVertical:7,borderRadius:8,gap:2},
 detail:{borderWidth:1,borderRadius:11,padding:10,gap:8},
 statusRow:{flexDirection:'row',justifyContent:'space-between',gap:8,alignItems:'center'},
 miniLine:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,flexWrap:'wrap'},
 mini:{borderWidth:1,borderRadius:8,padding:8,gap:4,minWidth:118,alignItems:'center'},
 miniTitle:{fontSize:10,fontWeight:'800',textAlign:'center'},
 miniRow:{flexDirection:'row',alignItems:'center',gap:3},
 rowNum:{fontSize:9,width:13,textAlign:'center'},
 miniCell:{width:33,height:25,borderWidth:1,borderRadius:3,alignItems:'center',justifyContent:'center'},
 order:{position:'absolute',fontWeight:'900',fontSize:8,top:0,right:1},
 miniFooter:{fontSize:9,fontWeight:'700'},
 rootRow:{borderTopWidth:1,paddingTop:7,gap:3},
 actions:{flexDirection:'row',flexWrap:'wrap',gap:7},
 action:{paddingHorizontal:9,paddingVertical:8,borderRadius:8,borderWidth:1},
 auxGrid:{borderWidth:1,padding:4,borderRadius:8,gap:2},
 auxRow:{flexDirection:'row',alignItems:'center',gap:0},
 auxCell:{width:19,height:25,borderWidth:1,borderRadius:2,alignItems:'center',justifyContent:'center'},
 auxOrder:{position:'absolute',fontSize:7,top:0,right:0,fontWeight:'900'}
});
