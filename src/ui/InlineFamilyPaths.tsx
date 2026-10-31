import React,{useMemo} from 'react';
import {ScrollView,StyleSheet,Text,View} from 'react-native';
import type {Turno} from '../domain';
import {TURNOS} from '../domain';
import type {DailySheet,SourceId} from '../sheet';
import type {LaloKind} from '../motorLalo';
import {preSheetAtCut} from '../infoCandidatos';
import type {AuxiliaryHeads,AuxPath} from '../auxSantiagoNeuquen';
import {auxiliaryBoard,findAuxPaths,auxCanonicalPath} from '../auxSantiagoNeuquen';
import RouteMiniBoard from './RouteMiniBoard';
import {useLaloTheme} from './LaloTheme';

/** El único visor de formaciones para Predicción: hoja +11 o Santiago–Neuquén. */
export type InlinePlusRoute={sourceId:SourceId;value:string;path:{row:number;col:number}[]};
type Props={kind:LaloKind;family:string;turn:Turno;
 plus?:{sheet:DailySheet;routes:InlinePlusRoute[]};
 aux?:{heads:AuxiliaryHeads;values:string[]};
};
const sourceName=(s:string)=>({
 prevNocturno:'Nocturna anterior',Previa:'Previa',Primera:'Primera',
 Matutino:'Matutina',Vespertino:'Vespertina'
} as Record<string,string>)[s]||s;
function AuxMiniRoute({heads,path,kind}:{heads:AuxiliaryHeads;path:AuxPath;kind:LaloKind}){
 const {colors:c,kinds}=useLaloTheme();
 const cells=new Map(path.map((x,i)=>[x.row+':'+x.col,i+1]));
 const columns=['Previa','Primera','Matutino'] as const;
 return <View style={{gap:2,alignSelf:'center'}}>
  <View style={{flexDirection:'row',paddingLeft:35}}>
   {columns.map(t=><Text key={t} style={{width:64,color:c.subtext,fontSize:9,
    textAlign:'center'}}>{t}</Text>)}
  </View>
  {(['Santiago','Neuquen'] as const).map((row,r)=><View key={row}
   style={{flexDirection:'row',alignItems:'center',gap:2}}>
   <Text style={{width:33,color:c.subtext,fontSize:8}} numberOfLines={1}>
    {row==='Neuquen'?'Neuquén':row}
   </Text>
   {columns.flatMap(t=>Array.from({length:4},(_,col)=>{
    const i=columns.indexOf(t)*4+col,step=cells.get(r+':'+i);
    const char=heads[t]?.[row]?.[col]||'–';
    return <View key={t+'|'+r+'|'+col} style={{width:14,height:25,
     borderWidth:step?1.8:1,borderRadius:3,alignItems:'center',
     justifyContent:'center',borderColor:step?kinds[kind].line:c.border,
     backgroundColor:step?kinds[kind].fill:c.cell}}>
     <Text style={{fontSize:10,fontWeight:'900',
      color:step?kinds[kind].text:c.text}}>{char}</Text>
     {step?<Text style={{position:'absolute',top:-2,right:0,fontSize:6,
      color:kinds[kind].line}}>{step}</Text>:null}
    </View>;
   }))}
  </View>)}
 </View>;
}
export default function InlineFamilyPaths({kind,family,turn,plus,aux}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const pre=useMemo(()=>plus?preSheetAtCut(plus.sheet,turn,TURNOS.indexOf(turn)):null,
  [plus?.sheet,turn]);
 const physical=useMemo(()=>{
  if(!aux)return [];
  const board=auxiliaryBoard(aux.heads,turn);
  const seen=new Set<string>();
  return [...new Set(aux.values)].flatMap(value=>findAuxPaths(board,value)
   .filter(path=>{
    const id=auxCanonicalPath(path);
    if(seen.has(id))return false;
    seen.add(id);return true;
   }).map(path=>({value,path})));
 },[aux?.heads,aux?.values,turn]);
 const plusRoutes=plus?.routes||[];
 const routeCount=aux?physical.length:plusRoutes.length;
 const type=kind==='vt2'?'dos':kind==='vt3'?'tres':'cuatro';
 return <View style={[s.container,{backgroundColor:c.surfaceAlt,borderColor:kinds[kind].line}]}>
  <Text style={{color:kinds[kind].line,fontWeight:'900',fontSize:14}}>
   Así se forma {family}
  </Text>
  <Text style={{color:c.subtext,fontSize:11,lineHeight:17}}>
   {routeCount===0?'No encontramos un recorrido con las cifras disponibles.':
    routeCount===1?'Un recorrido posible.':'Hay '+routeCount+' recorridos posibles. Deslizá hacia los costados.'}
  </Text>
  {!!routeCount?<ScrollView horizontal nestedScrollEnabled
   showsHorizontalScrollIndicator contentContainerStyle={s.horizontal}>
   {aux?physical.map(({value,path},i)=><View key={i} style={[s.route,
    {backgroundColor:c.card,borderColor:c.border}]}>
    <Text style={[s.routeTitle,{color:c.text}]}>{value} · Camino {i+1}</Text>
    <Text style={{color:c.subtext,fontSize:10}}>
     {new Set(path.map(x=>x.source)).size>1?'Pasa por turnos vecinos':
      'En '+sourceName(path[0].source)}
    </Text>
    <AuxMiniRoute heads={aux.heads} path={path} kind={kind}/>
   </View>):plusRoutes.map((r,i)=>{
    const column=pre?.columns.find(x=>x.id===r.sourceId);
    return <View key={r.sourceId+'|'+i} style={[s.route,
     {backgroundColor:c.card,borderColor:c.border}]}>
     <Text style={[s.routeTitle,{color:c.text}]}>{sourceName(r.sourceId)} · {r.value}</Text>
     <Text style={{color:c.subtext,fontSize:10}}>Camino {i+1} de {routeCount}</Text>
     {column?<RouteMiniBoard values={column.values} cells={r.path}
      kind={kind} compact/>:<Text style={{color:c.muted}}>Hoja no disponible</Text>}
    </View>;
   })}
  </ScrollView>:null}
  <Text style={{fontSize:10,color:c.muted}}>
   {aux?'Hoja auxiliar: se permite unir casillas vecinas de distintos turnos.':
    'Hoja +11: cada camino queda dentro de su columna.'}
  </Text>
 </View>;
}
const s=StyleSheet.create({
 container:{borderWidth:1.4,borderRadius:12,padding:10,gap:8},
 horizontal:{gap:9,paddingBottom:5,paddingRight:4},
 route:{borderWidth:1,borderRadius:10,padding:10,gap:7,minWidth:175,
  alignItems:'center',justifyContent:'space-between'},
 routeTitle:{fontSize:12,fontWeight:'900',textAlign:'center'}
});