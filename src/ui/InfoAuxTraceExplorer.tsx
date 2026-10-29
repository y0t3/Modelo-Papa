import React,{useMemo,useState} from 'react';
import {Modal,Pressable,ScrollView,Text,View} from 'react-native';
import type {AuxGalleryFrame,AuxGalleryMark} from '../infoAuxGallery';
import type {AuxiliarHistory,AuxiliarView} from '../motorLaloAuxiliar';
import type {AuxMode} from '../auxTemporalModes';
import type {AuxVisualKind,AuxVisualRoute,AuxVisualAntecedent} from '../auxVisualModel';
import {buildAuxPredictiveVisual} from '../auxVisualModel';
import {buildAuxHistoricalTrace} from '../infoAuxTrace';
import {reversibleFamily} from '../motorLalo';
import {AUX_SOURCE_TURNS,emptyAuxiliaryHeads} from '../auxSantiagoNeuquen';
import type {AuxiliaryBoard} from '../auxSantiagoNeuquen';
import {AuxMiniBoard} from './AuxRouteMiniPreview';
import {useLaloTheme} from './LaloTheme';

type Kind=AuxVisualKind;
type HistoricGroup={id:string;jur:string;head:string;kind:Kind;paths:AuxGalleryMark[]};
type Selection={type:'historic';id:string}|{type:'ranked';id:string}|null;
const KINDS:Kind[]=['vt2','vt3','vt4'];
const len=(kind:Kind)=>Number(kind.slice(-1)) as 2|3|4;
const coord=(row:number,col:number)=>row+':'+col;
const pathDescription=(path:AuxGalleryMark['path'])=>path.map((c,i)=>
 (i+1)+'. '+(c.row===0?'Santiago':'Neuquén')+' · '+c.source+
 ' · casilla '+(c.col%4+1)).join(' → ');
function historicalGroups(frame:AuxGalleryFrame):HistoricGroup[]{
 const groups=new Map<string,HistoricGroup>();
 for(const mark of frame.marks){
  if(mark.jur.startsWith('Top #'))continue;
  const id=[mark.jur,mark.head,mark.kind].join('|');
  const g=groups.get(id)||{id,jur:mark.jur,head:mark.head,
   kind:mark.kind,paths:[]};
  g.paths.push(mark);groups.set(id,g);
 }
 return [...groups.values()].sort((a,b)=>
  a.jur.localeCompare(b.jur)||a.head.localeCompare(b.head)||
  KINDS.indexOf(b.kind)-KINDS.indexOf(a.kind));
}
function RootBoard({board,path,kind,title,explanation}:{
 board:AuxiliaryBoard;path:AuxVisualAntecedent['path'];kind:Kind;
 title:string;explanation:string
}){
 const {colors:c}=useLaloTheme();
 return <View style={{gap:6}}>
  <Text style={{fontWeight:'900',fontSize:12,color:c.text}}>{title}</Text>
  <Text style={{fontSize:10,color:c.subtext}}>{explanation}</Text>
  <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator>
   <AuxMiniBoard board={board} path={path} kind={kind} compact/>
  </ScrollView>
  <Text style={{fontSize:10,color:c.subtext,lineHeight:16}}>{pathDescription(path)}</Text>
 </View>;
}
function RootEventBoard({event,kind}:{
 event:AuxVisualAntecedent;kind:Kind
}){
 const board:AuxiliaryBoard=event.board||{
  target:event.turn,input:emptyAuxiliaryHeads(),
  visibleTurns:[] as typeof AUX_SOURCE_TURNS[number][],
  columns:[],cells:event.path
 };
 return <RootBoard board={board} path={event.path} kind={kind}
  title={'ANTES · '+event.date+' · '+event.turn}
  explanation={'Resultado real '+event.jur+' '+event.head+
   ' · leído '+event.reading+
   (event.sourceDate?' · origen cifras '+event.sourceDate:'')+
   (!event.board?' · solo están verificadas las casillas del recorrido':'')}/>;
}
export default function InfoAuxTraceExplorer({active,current,mode,prediction,history}:{
 active:AuxGalleryFrame;current:AuxGalleryFrame|null;mode:AuxMode;
 prediction:AuxiliarView|null;history:AuxiliarHistory[]
}){
 const {colors:c,kinds}=useLaloTheme();
 const [filter,setFilter]=useState<Kind>('vt3');
 const [selected,setSelected]=useState<Selection>(null);
 const [oldIndex,setOldIndex]=useState(0);
 const [newIndex,setNewIndex]=useState(0);
 const [eventIndex,setEventIndex]=useState(0);
 const isCurrent=active.isCurrent;
 const board=current?.board||null;
 const available=!!board&&!!current&&!!prediction&&
  prediction.date===current.date&&prediction.turn===board.target;
 const historic=useMemo(()=>!isCurrent?historicalGroups(active):[],
  [active,isCurrent]);
 const visual=useMemo(()=>available&&history.every(h=>h.date<current!.date)?
  buildAuxPredictiveVisual(current!.date,board!.target,board!,
   prediction!,history,mode):null,
  [available,current,board,prediction,history,mode]);
 const currentFamilies=available?prediction!.ranks[len(filter)].slice(0,10):[];
 const historicSelected=selected?.type==='historic'?
  historic.find(x=>x.id===selected.id)||null:null;
 const rankedKind=selected?.type==='ranked'?
  (selected.id.split('|')[0] as Kind):null;
 const ranked=rankedKind&&available?
  prediction!.ranks[len(rankedKind)].find(f=>
   rankedKind+'|'+f.family===selected?.id):null;
 const rankedRoutes=ranked&&visual?visual.routes.filter(r=>r.ownerId===selected?.id):[];
 const selectedRoute=rankedRoutes[newIndex%Math.max(rankedRoutes.length,1)]||null;
 const events=selectedRoute?.rootEvents||[];
 const event=events[eventIndex%Math.max(events.length,1)]||null;
 const marked=historicSelected?.paths||[];
 const mark=marked[oldIndex%Math.max(marked.length,1)]||null;
 const trace=historicSelected&&mark&&current?
  buildAuxHistoricalTrace(active,current,mark,available?prediction:null):null;
 const projections=trace?.projections||[];
 const projection=projections[newIndex%Math.max(projections.length,1)]||null;
 const close=()=>{setSelected(null);setOldIndex(0);setNewIndex(0);setEventIndex(0)};
 const select=(value:Selection)=>{
  setSelected(value);setOldIndex(0);setNewIndex(0);setEventIndex(0);
 };
 const button=(title:string,onPress:()=>void)=>(
  <Pressable accessibilityRole="button" onPress={onPress}
   style={{paddingVertical:8,paddingHorizontal:10,borderWidth:1,
    borderRadius:8,borderColor:c.border,backgroundColor:c.card}}>
   <Text style={{color:c.accent,fontSize:11,fontWeight:'800'}}>{title}</Text>
  </Pressable>);
 const status=(rank:number|null)=>{
  if(!available)return 'Ranking no disponible';
  return rank===null?'Formable · no reconocida':
   'Reconocida en puesto #'+rank+(rank<=10?' · Top10':' · fuera del Top10');
 };
 const motherStatus=(mother:string|null,rank:number|null)=>{
  if(!mother)return '';
  return 'Madre VT3 '+mother+' · '+
   (!available?'ranking no disponible':rank===null?'no reconocida':
    'puesto #'+rank+(rank>10?' (fuera Top10)':' (habilitada)'));
 };
 return <View style={{width:'100%',gap:8,alignSelf:'stretch'}}>
  <Text style={{color:c.text,fontWeight:'900',fontSize:12}}>
   {isCurrent?'Candidatos AUX · Top10 y raíces históricas':
    'Cabezas ganadoras reales · tocar para comparar'}
  </Text>
  <Text style={{color:c.subtext,fontSize:10,lineHeight:15}}>
   {isCurrent?
    'Cada candidato conserva su puesto original. Al abrirlo, se muestran únicamente las raíces que originaron sus recorridos PRE.':
    'Elegí una cabeza y una terminación. Su recorrido real antiguo se trasladará como figura sobre las cifras PRE disponibles hoy; no crea una nueva predicción.'}
  </Text>
  {!board?<Text style={{color:c.muted,fontSize:11}}>
   No hay hoja PRE actual disponible para realizar el contraste.
  </Text>:isCurrent?<>
   <View style={{flexDirection:'row',gap:6,flexWrap:'wrap'}}>
    {KINDS.map(k=><Pressable accessibilityRole="button" key={k}
     accessibilityState={{selected:filter===k}}
     onPress={()=>setFilter(k)}
     style={{paddingVertical:7,paddingHorizontal:11,borderRadius:8,
      borderWidth:1,borderColor:filter===k?kinds[k].line:c.border,
      backgroundColor:filter===k?kinds[k].fill:c.card}}>
     <Text style={{color:filter===k?kinds[k].text:c.text,fontWeight:'900',fontSize:11}}>
      {k.toUpperCase()}</Text>
    </Pressable>)}
   </View>
   {currentFamilies.length?currentFamilies.map(f=>{
    const id=filter+'|'+f.family;
    const routes=visual?.routes.filter(r=>r.ownerId===id)||[];
    return <Pressable key={id} accessibilityRole="button"
     accessibilityLabel={'Ver antecedentes '+filter+' '+f.family+' puesto '+f.rank}
     onPress={()=>select({type:'ranked',id})}
     style={{padding:8,borderColor:c.border,borderWidth:1,
      borderRadius:8,backgroundColor:c.card}}>
     <Text style={{color:c.text,fontWeight:'800',fontSize:11}}>
      #{f.rank} · {filter==='vt4'?f.values.join(' / '):f.family}
     </Text>
     <Text style={{color:c.subtext,fontSize:10}}>
      {routes.length} recorrido(s) proyectado(s) · {f.roots} raíz/raíces
      {filter==='vt4'&&f.mother?' · madre '+f.mother:''}
     </Text>
    </Pressable>;
   }):<Text style={{color:c.subtext,fontSize:11}}>
    No hay candidatos reconocidos en esta modalidad para el corte.
   </Text>}
  </>:<>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>
    {historic.map(g=><Pressable key={g.id} accessibilityRole="button"
     accessibilityLabel={'Ver antecedente '+g.kind+' '+g.jur+' '+g.head}
     onPress={()=>select({type:'historic',id:g.id})}
     style={{padding:8,borderWidth:1,borderRadius:7,
      borderColor:c.border,backgroundColor:c.card}}>
     <Text style={{fontSize:11,color:c.text,fontWeight:'800'}}>
      {g.jur} {g.head} · {g.kind.toUpperCase()}
     </Text>
     <Text style={{fontSize:10,color:c.subtext}}>
      {g.paths.length} ruta(s) exacta(s) · Ver minihojas
     </Text>
    </Pressable>)}
   </View>
   {!historic.length?<Text style={{color:c.subtext,fontSize:11}}>
    No hubo cabezas con recorridos físicos en este turno y esta hoja.
   </Text>:null}
  </>}
  <Modal transparent visible={!!selected} animationType="fade"
   onRequestClose={close}>
   <View style={{flex:1,justifyContent:'center',padding:10,
    backgroundColor:'rgba(0,0,0,.75)'}}>
    <View style={{backgroundColor:c.surface,borderRadius:14,
     padding:12,maxHeight:'92%',gap:8,borderColor:c.border,borderWidth:1}}>
     <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}>
      <Text style={{color:c.text,fontWeight:'900',fontSize:14,flex:1}}>
       {historicSelected?historicSelected.kind.toUpperCase()+' · '+historicSelected.head:
        rankedKind?.toUpperCase()+' · '+(ranked?.family||'')}
      </Text>
      {button('Cerrar ×',close)}
     </View>
     <Text style={{color:c.subtext,fontSize:10,lineHeight:16}}>
      {mode==='anterior'?'AUX AYER · base de la jornada sorteable anterior':
       'AUX HOY · solo columnas conocidas antes del turno'}.
      La minihoja antigua muestra un resultado comprobado; la actual es PRE,
      sin usar la cabeza del sorteo objetivo.
     </Text>
     <ScrollView nestedScrollEnabled contentContainerStyle={{gap:11,paddingBottom:20}}>
      {trace&&mark?<>
       <RootBoard board={trace.oldBoard} path={mark.path} kind={mark.kind}
        title={'ANTES · '+trace.oldDate+' · '+active.board?.target}
        explanation={trace.oldJur+' '+trace.oldHead+
         ' · terminación exacta '+trace.oldReading+
         ' · origen cifras '+(trace.oldSourceDate||trace.oldDate)}/>
       {marked.length>1?<View style={{flexDirection:'row',gap:8,alignItems:'center'}}>
        {button('Otro camino antiguo',()=>{setOldIndex(i=>i+1);setNewIndex(0)})}
        <Text style={{color:c.subtext,fontSize:10}}>
         {(oldIndex%marked.length)+1} de {marked.length}</Text>
       </View>:null}
       {projection?<RootBoard board={trace.targetBoard} path={projection.path}
        kind={mark.kind} title={'AHORA · PRE '+trace.targetDate+' · '+trace.targetBoard.target}
        explanation={'La misma secuencia de movimientos produce '+projection.value+
         ' con las cifras actuales. '+status(projection.recognizedRank)+
         (projection.mother?' · '+motherStatus(projection.mother,projection.motherRank):'')}/>:
        <Text style={{color:c.muted,fontSize:11}}>
         Esa figura antigua no tiene traslado físico válido sobre las columnas PRE actuales.
        </Text>}
       {projections.length>1?<View style={{flexDirection:'row',alignItems:'center',gap:8}}>
        {button('Otra posición actual',()=>setNewIndex(i=>i+1))}
        <Text style={{color:c.subtext,fontSize:10}}>
         {(newIndex%projections.length)+1} de {projections.length}
        </Text>
       </View>:null}
       <Text style={{fontSize:10,color:c.subtext,lineHeight:16}}>
        Estas {projections.length} posiciones son posibilidades geométricas,
        no {projections.length} votos independientes ni candidatas agregadas al Top10.
        La cifra antigua no se copia a la hoja de hoy.
       </Text>
      </>:null}
      {ranked&&board?<>
       <Text style={{color:c.text,fontSize:11,fontWeight:'800'}}>
        Puesto #{ranked.rank} · {ranked.roots} evento(s) ganador(es) usados por el motor
        {rankedKind==='vt4'&&ranked.mother?' · '+
         motherStatus(ranked.mother,
          prediction?.ranks[3].find(f=>f.family===ranked.mother)?.rank??null):''}
       </Text>
       {selectedRoute&&rankedKind?<RootBoard
        board={board} path={selectedRoute.cells} kind={rankedKind}
        title={'AHORA · '+current?.date+' · PRE '+board.target}
        explanation={'Lectura actual '+selectedRoute.reading+
         ' · fuente(s) '+[...new Set(selectedRoute.cells.map(c=>c.source))].join(', ')}/>:null}
       {rankedRoutes.length>1?<View style={{flexDirection:'row',alignItems:'center',gap:8}}>
        {button('Otro recorrido actual',()=>{setNewIndex(i=>i+1);setEventIndex(0)})}
        <Text style={{color:c.subtext,fontSize:10}}>
         {(newIndex%rankedRoutes.length)+1} de {rankedRoutes.length}</Text>
       </View>:null}
       {event&&rankedKind?<RootEventBoard event={event} kind={rankedKind}/>:
        <Text style={{color:c.muted,fontSize:11}}>
         Este recorrido no tiene un testigo antiguo completo disponible para
         mostrar. No se dibuja una raíz ilustrativa.
        </Text>}
       {events.length>1?<View style={{flexDirection:'row',alignItems:'center',gap:8}}>
        {button('Otro antecedente ganador',()=>setEventIndex(i=>i+1))}
        <Text style={{color:c.subtext,fontSize:10}}>
         {(eventIndex%events.length)+1} de {events.length}</Text>
       </View>:null}
       {event?<Text style={{color:c.subtext,fontSize:10,lineHeight:16}}>
        {event.relation} · {event.period}. Un evento con varias rutas no
        cuenta como varias cabezas ganadoras.
       </Text>:null}
      </>:null}
     </ScrollView>
    </View>
   </View>
  </Modal>
 </View>;
}
