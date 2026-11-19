import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import {JURS,TURNOS} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloKind,LaloView} from '../motorLalo';
import type {InfoVisualDay} from '../infoTurnHistory';
import type {TrackingAuxInput} from '../figureTracking';
import type {AuxMode} from '../auxTemporalModes';
import {auxAtCut} from '../auxTemporalModes';
import {auxiliaryBoard,findAuxPaths} from '../auxSantiagoNeuquen';
import {formPositions} from '../motorFormasPrimero';
import {preSheetAtCut} from '../infoCandidatos';
import {reversibleFamily} from '../motorLalo';
import InlineFamilyPaths from './InlineFamilyPaths';
import FigureTrackingPanel from './FigureTrackingPanel';
import {useLaloTheme} from './LaloTheme';

type Section='formacion'|'anteriores'|'hojas';
type Origin='lalo'|'auxiliar';
type Props={
 date:string;turn:Turno;family:string;kind:LaloKind;origin:Origin;
 mode:AuxMode;data:CabezasDia|null;sheet:DailySheet|null;
 lalo:LaloView|null;ayer:TrackingAuxInput;hoy:TrackingAuxInput;
 history:InfoVisualDay[];
 onTurnChange:(turn:Turno)=>void;
 onOpenPaths:(origin:Origin,auxMode?:AuxMode)=>void;
 onOpenStudy:()=>void;
};
const titles:{key:Section;label:string}[]=[
 {key:'formacion',label:'Formación'},
 {key:'anteriores',label:'Antes'},
 {key:'hojas',label:'Otras hojas'}
];
function rootsLabel(rank:number|null,formable:boolean,available:boolean){
 if(!available)return 'Todavía no hay datos';
 if(rank!==null)return rank<=10?'Está en el Top10 · #'+rank:'Quedó en el puesto #'+rank;
 return formable?'Se puede formar, pero no está en la lista':'No se forma en esta hoja';
}
export default function FamilyInvestigation({date,turn,family,kind,origin,mode,
 data,sheet,lalo,ayer,hoy,history,onTurnChange,onOpenPaths,onOpenStudy}:Props){
 const {colors:c}=useLaloTheme();
 const [section,setSection]=useState<Section>('formacion');
 const values=[...new Set(family.split('/'))];
 const pre=useMemo(()=>sheet?preSheetAtCut(sheet,turn,TURNOS.indexOf(turn)):null,[sheet,turn]);
 const official=lalo?.ranks[kind].find(x=>x.family===family);
 const plusRoutes=official?.paths.map(p=>({sourceId:p.sourceId,value:p.value,path:p.path}))||[];
 const physicalPlus=useMemo(()=>{
  if(!pre)return false;
  if(plusRoutes.length)return true;
  return formPositions(pre,turn,kind).some(pos=>{
   const col=pre.columns.find(x=>x.id===pos.source);
   const digits=col?pos.cells.map(p=>col.values[p.row][p.col]).join(''):'';
   return reversibleFamily(digits)===family;
  });
 },[pre,turn,kind,family,plusRoutes.length]);
 const auxPresence=(input:TrackingAuxInput)=>{
  if(!input.heads)return {available:false,physical:false,rank:null as number|null,heads:null};
  const cut=auxAtCut(input.heads,turn,input.mode);
  const board=auxiliaryBoard(cut,turn);
  if(!board.cells.length)return {available:false,physical:false,rank:null as number|null,heads:cut};
  const physical=values.some(x=>findAuxPaths(board,x).length>0);
  const match=input.view?.ranks[Number(kind.slice(-1))]?.find(x=>x.family===family);
  return {available:true,physical,rank:match?.rank??null,heads:cut};
 };
 const a=auxPresence(ayer),h=auxPresence(hoy);
 const selectedAux=mode==='anterior'?a:h;
 const matches=(JURS.filter(j=>j!=='Montevideo')).flatMap(jur=>{
  const head=data?.[turn]?.[jur]||'';
  if(!/^\d{4}$/.test(head))return [];
  const same=kind==='vt4'?values.includes(head):
   reversibleFamily(head.slice(-Number(kind.slice(-1))))===family;
  return same?[{jur,head}]:[];
 });
 const published=(JURS.filter(j=>j!=='Montevideo')).filter(j=>
  /^\d{4}$/.test(data?.[turn]?.[j]||'')).length;
 return <View style={s.root}>
  <View style={[s.hero,{backgroundColor:c.surface,borderColor:c.accent}]}>
   <Text style={[s.caption,{color:c.subtext}]}>
    INVESTIGAR · {kind==='vt2'?'DOS':kind==='vt3'?'TRES':'CUATRO'} CIFRAS
   </Text>
   <Text style={[s.family,{color:c.accent}]}>{family}</Text>
   <Text style={[s.body,{color:c.subtext}]}>
    {origin==='lalo'?'Hoja +11':mode==='anterior'?'Hoja de ayer':'Hoja de hoy'}
    {' · '}{turn}
   </Text>
   <Text style={[s.body,{color:c.text}]}>
    {origin==='lalo'?
     rootsLabel(official?.rank??null,physicalPlus,!!pre):
     rootsLabel(selectedAux.rank,selectedAux.physical,selectedAux.available)}
   </Text>
  </View>
  <View style={s.tabs}>
   {titles.map(t=><Pressable key={t.key} accessibilityRole="tab"
    accessibilityState={{selected:section===t.key}}
    onPress={()=>setSection(t.key)}
    style={[s.tab,{backgroundColor:section===t.key?c.accent:c.surfaceAlt,
     borderColor:section===t.key?c.accent:c.border}]}>
    <Text style={{fontSize:12,fontWeight:'900',
     color:section===t.key?'#08254B':c.text}}>{t.label}</Text>
   </Pressable>)}
  </View>
  {section==='formacion'?<View style={s.segment}>
   <Text style={[s.heading,{color:c.text}]}>Así se forma</Text>
   {origin==='lalo'?sheet?
    <InlineFamilyPaths kind={kind} family={family} turn={turn}
     plus={{sheet,routes:plusRoutes}}/>:
    <Text style={{color:c.subtext}}>No se pudo cargar la hoja.</Text>:
    selectedAux.heads?
    <InlineFamilyPaths kind={kind} family={family} turn={turn}
     aux={{heads:selectedAux.heads,values}}/>:
    <Text style={{color:c.subtext}}>Todavía no hay cifras para esta hoja.</Text>}
   <Pressable accessibilityRole="button" style={[s.button,{backgroundColor:c.accent}]}
    onPress={()=>onOpenPaths(origin,mode)}>
    <Text style={s.buttonText}>Ver todos los recorridos ›</Text>
   </Pressable>
  </View>:null}
  {section==='anteriores'?<View style={s.segment}>
   <Text style={[s.heading,{color:c.text}]}>Qué se veía antes del sorteo</Text>
   <Text style={[s.body,{color:c.subtext}]}>
    La hoja se mira como estaba para este turno. No se usan números
    de sorteos posteriores para armar el recorrido.
   </Text>
   {kind==='vt3'?<FigureTrackingPanel key={date+'|'+turn+'|'+family}
    date={date} turn={turn} sheet={sheet} view={lalo} history={history}
    ayer={ayer} hoy={hoy} focusRequest={'vt3|'+family}
    onOpenLalo={()=>onOpenPaths('lalo')}
    onOpenAux={(_,next)=>onOpenPaths('auxiliar',next)}/>:
    <View style={[s.note,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
     <Text style={[s.body,{color:c.text}]}>
      Para estas cifras podés seguir los caminos en la hoja. El estudio
      detallado de antecedentes está disponible para las tres cifras.
     </Text>
     <Pressable onPress={()=>onOpenPaths(origin,mode)}>
      <Text style={{color:c.accent,fontWeight:'900',marginTop:8}}>
       Ver caminos en la hoja ›
      </Text>
     </Pressable>
    </View>}
  </View>:null}
  {section==='hojas'?<View style={s.segment}>
   <Text style={[s.heading,{color:c.text}]}>¿En qué hojas aparece?</Text>
   {([
    ['+11 de Lalo',physicalPlus,official?.rank??null,!!pre],
    ['Auxiliar de ayer',a.physical,a.rank,a.available],
    ['Auxiliar de hoy',h.physical,h.rank,h.available]
   ] as const).map(([label,physical,rank,available])=>
    <View key={label} style={[s.note,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
     <Text style={{color:c.text,fontWeight:'900',fontSize:13}}>{label}</Text>
     <Text style={[s.body,{color:c.subtext}]}>
      {rootsLabel(rank,physical,available)}
     </Text>
    </View>)}
  </View>:null}
  <View style={[s.note,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>Qué ocurrió en el sorteo</Text>
   {published===0?<Text style={[s.body,{color:c.subtext}]}>
    Todavía no salió este turno.
   </Text>:matches.length?
    <Text style={[s.body,{color:c.text}]}>
     Coincidió en {matches.map(x=>x.jur+' ('+x.head+')').join(', ')}.
    </Text>:
    <Text style={[s.body,{color:c.subtext}]}>
     {published<5?'Ya hay '+published+' cabezas. Faltan resultados.':
      'Esta familia no salió entre las cinco cabezas de este turno.'}
    </Text>}
  </View>
  <View style={[s.note,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>Mirar otro turno</Text>
   <Text style={[s.body,{color:c.subtext}]}>
    Tocá un turno para ver cómo cambia la misma familia.
   </Text>
   <View style={s.turns}>
    {TURNOS.map((t,i)=><Pressable key={t} accessibilityRole="button"
     onPress={()=>onTurnChange(t)}
     style={[s.turn,{borderColor:t===turn?c.accent:c.border,
      backgroundColor:t===turn?c.accentFill:c.surfaceAlt}]}>
     <Text style={{color:t===turn?c.accent:c.text,fontSize:11,fontWeight:'900'}}>
      {['Previa','1ª','Mat.','Vesp.','Noct.'][i]}
     </Text>
    </Pressable>)}
   </View>
  </View>
  <Pressable accessibilityRole="button" onPress={onOpenStudy}
   style={[s.button,{borderColor:c.accent,borderWidth:1}]}>
   <Text style={[s.buttonText,{color:c.accent}]}>Abrir el estudio completo ›</Text>
  </Pressable>
  <Text style={[s.caption,{color:c.muted}]}>
   Las hojas ayudan a estudiar las formas. Ningún puesto asegura un resultado.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 root:{gap:12,paddingTop:8,paddingBottom:28},hero:{padding:15,borderRadius:16,borderWidth:1.5,gap:7},
 family:{fontSize:29,fontWeight:'900'},caption:{fontSize:11,lineHeight:17},
 body:{fontSize:12,lineHeight:18},heading:{fontSize:16,fontWeight:'900'},
 tabs:{flexDirection:'row',gap:7},
 tab:{flex:1,borderWidth:1,borderRadius:10,paddingVertical:11,alignItems:'center'},
 segment:{gap:10},note:{borderWidth:1,borderRadius:12,padding:12,gap:7},
 button:{borderRadius:11,paddingVertical:12,alignItems:'center',justifyContent:'center'},
 buttonText:{color:'#08254B',fontSize:13,fontWeight:'900'},
 turns:{flexDirection:'row',gap:4},turn:{flex:1,minWidth:0,alignItems:'center',paddingVertical:10,
  borderWidth:1,borderRadius:9}
});
