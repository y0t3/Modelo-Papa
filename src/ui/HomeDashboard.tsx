import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import {TURNOS} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloView} from '../motorLalo';
import type {AuxiliarView} from '../motorLaloAuxiliar';
import type {DayOverview} from '../homeDaySummary';
import {preSheetAtCut} from '../infoCandidatos';
import {useLaloTheme} from './LaloTheme';
import {readableWeekday} from '../infoTurnHistory';
import RouteMiniBoard from './RouteMiniBoard';
import TurnStrip from './TurnStrip';

type Destination='hoja'|'predictiva'|'prediccion'|'papa'|'cabezas'|'info';
type Props={date:string;turn:Turno;data:CabezasDia|null;sheet:DailySheet|null;
 view:LaloView|null;auxiliar:AuxiliarView|null;
 overview:DayOverview;onNavigate:(page:Destination)=>void;
 onSelectPrediction:(mode:'lalo'|'auxiliar'|'combinado')=>void;
 onTurnChange:(turn:Turno)=>void;onFocus:(family:string)=>void;busy:boolean};
export default function HomeDashboard({date,turn,sheet,view,auxiliar,overview,
 onNavigate,onSelectPrediction,onTurnChange,onFocus,busy}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const [expanded,setExpanded]=useState(false);
 const top=view?.ranks.vt2.slice(0,10)||[];
 const first=top[0]?.paths[0];
 const pre=useMemo(()=>sheet?preSheetAtCut(sheet,turn,TURNOS.indexOf(turn)):null,[sheet,turn]);
 const col=pre?.columns.find(x=>x.id===first?.sourceId);
 const maxSupport=Math.max(1,...top.slice(0,5).map(f=>f.directRoots));
 const ready=overview.exactHistory&&!!view;
 return <View style={s.root}>
  <View style={[s.hero,{backgroundColor:c.surface,borderColor:'#E6B34D'}]}>
   <Text style={[s.kicker,{color:c.accent}]}>TU VISTAZO DE HOY</Text>
   <Text style={[s.title,{color:c.text}]}>La posta del día</Text>
   <Text style={[s.desc,{color:c.subtext}]}>{date?readableWeekday(date):'Elegí una fecha'} · {overview.statusText}</Text>
   <View style={s.stats}>
    <View style={[s.stat,{backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.statNumber,{color:c.accent}]}>{overview.heads}</Text>
     <Text style={[s.statLabel,{color:c.subtext}]}>Cabezas publicadas</Text>
    </View>
    <View style={[s.stat,{backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.statNumber,{color:c.accent}]}>
      {ready?overview.matchedHeads:'–'}
     </Text>
     <Text style={[s.statLabel,{color:c.subtext}]}>Cabezas que coinciden</Text>
    </View>
    <View style={[s.stat,{backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.statNumber,{color:kinds.vt2.line}]}>
      {ready?overview.byKind.vt2:'–'}
     </Text>
     <Text style={[s.statLabel,{color:c.subtext}]}>Coincidencias de 2 cifras</Text>
    </View>
   </View>
   <Text style={[s.note,{color:c.subtext}]}>
    {busy?'Actualizando la hoja y los resultados…':
     overview.heads===0?overview.statusText+'.':
     !ready?'Actualizá la hoja para cotejar las coincidencias.':
     overview.matchedHeads?
      overview.matchedHeads+' cabeza(s) coincidieron con alguna lista de Lalo.':
      'No hubo coincidencias con las listas de diez números de Lalo.'}
   </Text>
   <Text style={[s.note,{color:c.muted}]}>
    Cotejo reconstruido con los resultados publicados, no una jugada anticipada.
   </Text>
   <Pressable accessibilityRole="button" style={[s.mainButton,{backgroundColor:c.accent}]}
    onPress={()=>onNavigate('cabezas')}>
    <Text style={{color:'#092347',fontWeight:'900',fontSize:13}}>Ver las cabezas reales   ›</Text>
   </Pressable>
  </View>
  <View style={s.sectionHead}>
   <View style={{flex:1}}>
    <Text style={[s.heading,{color:c.text}]}>Números para mirar</Text>
    <Text style={[s.desc,{color:c.subtext}]}>Primero las dos cifras · Lalo · {turn}</Text>
   </View>
  </View>
  <TurnStrip value={turn} onChange={onTurnChange}/>
  <View style={[s.topCard,{backgroundColor:c.surface,borderColor:c.border}]}>
   <View style={s.topHeader}>
    <View>
     <Text style={{color:kinds.vt2.line,fontWeight:'900',fontSize:11}}>DOS CIFRAS · PRIMERO</Text>
     <Text style={[s.topTitle,{color:c.text}]}>Top 10 de hoy</Text>
    </View>
    <Text style={[s.hint,{color:c.subtext}]}>Lista de Lalo</Text>
   </View>
   <Text style={[s.desc,{color:c.subtext}]}>
    Las barras cuentan antecedentes ganadores reconocidos por el motor; no son porcentajes de acierto.
   </Text>
   {(expanded?top:top.slice(0,3)).map((f,i)=><Pressable key={f.family} accessibilityRole="button"
    onPress={()=>onFocus(f.family)} style={[s.candidate,{backgroundColor:c.card,borderColor:c.border}]}>
    <Text style={[s.rank,{color:i===0?'#0B234B':c.subtext,
     backgroundColor:i===0?c.accent:c.surfaceAlt}]}>{i+1}</Text>
    <View style={{flex:1,gap:5}}>
     <View style={s.candidateTitle}>
      <Text style={{color:c.text,fontSize:17,fontWeight:'900'}}>{f.family}</Text>
      <Text style={{color:c.subtext,fontSize:10}}>{f.directRoots} apoyo(s)</Text>
     </View>
     <View style={[s.track,{backgroundColor:c.surfaceAlt}]}>
      <View style={[s.bar,{backgroundColor:kinds.vt2.line,
       width:((100*f.directRoots/maxSupport)+'%') as `${number}%`}]}/>
     </View>
    </View>
    <Text style={{color:c.accent,fontSize:17,fontWeight:'900'}}>›</Text>
   </Pressable>)}
   {!top.length?<Text style={[s.desc,{color:c.subtext}]}>
    {busy?'Buscando números del día…':'Cargá la hoja para ver las familias de dos cifras.'}
   </Text>:null}
   {top.length>3?<Pressable onPress={()=>setExpanded(v=>!v)} accessibilityRole="button"
    accessibilityState={{expanded}}
    style={[s.subButton,{borderColor:c.accent}]}>
    <Text style={{color:c.accent,fontWeight:'900'}}>
     {expanded?'Mostrar solo tres':'Ver las diez aquí'}  ›
    </Text>
   </Pressable>:null}
   <Pressable accessibilityRole="button" onPress={()=>onSelectPrediction('lalo')}
    style={[s.mainButton,{backgroundColor:c.accent}]}>
    <Text style={{color:'#092347',fontWeight:'900'}}>Abrir Predicción y todos los recorridos   ›</Text>
   </Pressable>
  </View>
  <View style={s.shortcutGrid}>
   <Pressable accessibilityRole="button" onPress={()=>onNavigate('hoja')}
    style={[s.shortcut,{backgroundColor:c.surface,borderColor:'#68B1FF'}]}>
    <Text style={{color:'#68B1FF',fontSize:25,fontWeight:'900'}}>▦</Text>
    <Text style={[s.shortcutTitle,{color:c.text}]}>Mirá la hoja</Text>
    <Text style={[s.note,{color:c.subtext}]}>La hoja +11, con sus números y caminos</Text>
    <View style={{alignItems:'center',minHeight:80,justifyContent:'center'}}>
     {col&&first?<RouteMiniBoard values={col.values} cells={first.path}
      kind="vt2" compact/>:<Text style={{color:c.muted,fontSize:11}}>Sin hoja cargada</Text>}
    </View>
    <Text style={[s.link,{color:'#76BCFF'}]}>Abrir la hoja  ›</Text>
   </Pressable>
   <Pressable accessibilityRole="button" onPress={()=>onNavigate('predictiva')}
    style={[s.shortcut,{backgroundColor:c.surface,borderColor:'#E9BA61'}]}>
    <Text style={{color:'#E9BA61',fontSize:25,fontWeight:'900'}}>⌁</Text>
    <Text style={[s.shortcutTitle,{color:c.text}]}>Los recorridos</Text>
    <Text style={[s.note,{color:c.subtext}]}>Mirá los números que Lalo encontró en la hoja.</Text>
    <View style={{alignItems:'center',minHeight:80,justifyContent:'center',gap:5}}>
     {col&&first?<RouteMiniBoard values={col.values} cells={first.path}
      kind="vt2" compact/>:
      <Text style={{color:c.muted,fontSize:11}}>Todavía no hay recorridos</Text>}
    </View>
    <Text style={[s.link,{color:'#E9BA61'}]}>Ver las figuras  ›</Text>
   </Pressable>
  </View>
  <View style={[s.bottomCard,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.topTitle,{color:c.text}]}>Todo desde un lugar</Text>
   <Text style={[s.desc,{color:c.subtext}]}>Tocá lo que quieras consultar, sin recorrer toda la aplicación.</Text>
   <View style={s.actions}>
    {([
     ['info','Resumen del día','☀'],
     ['prediccion','Predicción: Top10','◎'],
     ['cabezas','Cabezas reales','▤'],
     ['papa','Lo que eligió Lalo','★']
    ] as const).map(([to,label,icon])=><Pressable key={to} accessibilityRole="button"
     style={[s.action,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}
     onPress={()=>onNavigate(to)}>
     <Text style={{color:c.accent,fontWeight:'900',fontSize:18}}>{icon}</Text>
     <Text style={{color:c.text,fontWeight:'800',fontSize:11,flex:1}}>{label}</Text>
     <Text style={{color:c.accent}}>›</Text>
    </Pressable>)}
   </View>
  </View>
  <Text style={[s.note,{color:c.muted,textAlign:'center'}]}>
   El lugar de un número en una lista no asegura que vaya a salir.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 root:{marginTop:9,gap:12,paddingBottom:30},
 hero:{borderWidth:1.4,borderRadius:18,padding:15,gap:9},
 kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.1},
 title:{fontSize:23,fontWeight:'900'},
 desc:{fontSize:11,lineHeight:17},
 stats:{flexDirection:'row',gap:7},
 stat:{flex:1,borderRadius:11,padding:8,gap:4,minWidth:0},
 statNumber:{fontSize:23,fontWeight:'900'},
 statLabel:{fontSize:10,lineHeight:14},
 note:{fontSize:10,lineHeight:16},
 mainButton:{borderRadius:11,paddingVertical:12,paddingHorizontal:9,alignItems:'center'},
 sectionHead:{flexDirection:'row',gap:8,alignItems:'center'},
 heading:{fontSize:19,fontWeight:'900'},
 topCard:{borderWidth:1,borderRadius:16,padding:13,gap:10},
 topHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 topTitle:{fontSize:18,fontWeight:'900'},
 hint:{fontSize:10},
 candidate:{borderWidth:1,borderRadius:11,padding:9,flexDirection:'row',gap:10,alignItems:'center'},
 rank:{width:31,height:31,borderRadius:9,overflow:'hidden',
  textAlign:'center',textAlignVertical:'center',fontSize:14,fontWeight:'900'},
 candidateTitle:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6},
 track:{height:5,borderRadius:4,overflow:'hidden'},
 bar:{height:5,borderRadius:4},
 subButton:{borderWidth:1,borderRadius:10,padding:10,alignItems:'center'},
 shortcutGrid:{flexDirection:'row',gap:9,alignItems:'stretch'},
 shortcut:{flex:1,borderWidth:1.2,borderRadius:15,padding:12,gap:7,justifyContent:'space-between'},
 shortcutTitle:{fontSize:15,fontWeight:'900'},
 link:{fontWeight:'900',fontSize:11},
  bottomCard:{borderRadius:15,borderWidth:1,padding:13,gap:9},
 actions:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:7},
 action:{width:'48%',borderWidth:1,borderRadius:9,padding:9,flexDirection:'row',alignItems:'center',gap:6}
});