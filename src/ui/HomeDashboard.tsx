import React,{useMemo} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import {TURNOS} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloView} from '../motorLalo';
import type {AuxiliarView} from '../motorLaloAuxiliar';
import type {AuxMode} from '../auxTemporalModes';
import type {DayOverview} from '../homeDaySummary';
import {preSheetAtCut} from '../infoCandidatos';
import {useLaloTheme} from './LaloTheme';
import {readableWeekday} from '../infoTurnHistory';
import RouteMiniBoard from './RouteMiniBoard';
import DayMatchGrid from './DayMatchGrid';
import TurnStrip from './TurnStrip';

type Destination='hoja'|'predictiva'|'prediccion'|'papa'|'cabezas'|'info';
type Props={date:string;turn:Turno;data:CabezasDia|null;sheet:DailySheet|null;
 view:LaloView|null;auxAyer:AuxiliarView|null;auxHoy:AuxiliarView|null;
 overview:DayOverview;onNavigate:(page:Destination)=>void;
 onSelectPrediction:(mode:'lalo'|'auxiliar'|'combinado',auxMode?:AuxMode)=>void;
 onTurnChange:(turn:Turno)=>void;onFocus:(family:string)=>void;busy:boolean};
export default function HomeDashboard({date,turn,data,sheet,view,auxAyer,auxHoy,
 overview,onNavigate,onSelectPrediction,onTurnChange,onFocus,busy}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const top=view?.ranks.vt2.slice(0,3)||[];
 const yesterday=auxAyer?.ranks[2].slice(0,3)||[];
 const intraday=auxHoy?.ranks[2].slice(0,3)||[];
 const first=top[0]?.paths[0];
 const pre=useMemo(()=>sheet?preSheetAtCut(sheet,turn,TURNOS.indexOf(turn)):null,[sheet,turn]);
 const column=pre?.columns.find(x=>x.id===first?.sourceId);
 const groups=[
  {name:'Lalo · Hoja +11',list:top,mode:'lalo' as const,
   onPress:(family:string)=>onFocus(family)},
  {name:'Auxiliar · Ayer',list:yesterday,mode:'anterior' as const,
   onPress:()=>onSelectPrediction('auxiliar','anterior')},
  {name:'Auxiliar · Hoy',list:intraday,mode:'intrajornada' as const,
   onPress:()=>onSelectPrediction('auxiliar','intrajornada')}
 ];
 return <View style={s.root}>
  <View style={[s.hero,{backgroundColor:c.surface,borderColor:'#E6B34D'}]}>
   <Text style={[s.kicker,{color:c.accent}]}>LA POSTA DEL DÍA · {turn.toUpperCase()}</Text>
   <Text style={[s.title,{color:c.accent}]}>Los favoritos de Lalo</Text>
   <Text style={[s.desc,{color:c.subtext}]}>
    {date?readableWeekday(date):'Elegí una fecha'} · {overview.statusText}
   </Text>
   <TurnStrip value={turn} onChange={onTurnChange}/>
   {groups.map((group,i)=><View key={group.name} style={s.favoriteGroup}>
    <View style={s.groupHeader}>
     <Text style={{fontSize:12,fontWeight:'900',color:i===0?c.accent:c.text}}>
      {group.name}
     </Text>
     {i>0?<Text style={{fontSize:10,color:c.subtext}}>2 cifras</Text>:null}
    </View>
    {group.list.length?<View style={s.favRow}>
     {group.list.map((f,n)=><Pressable accessibilityRole="button" key={f.family+'|'+n}
      onPress={()=>group.onPress(f.family)}
      style={[s.favChip,{backgroundColor:c.surfaceAlt,
       borderColor:n===0?i===0?c.accent:kinds.vt2.line:c.border}]}>
      <Text style={{color:c.subtext,fontSize:10}}>#{f.rank}</Text>
      <Text style={{color:n===0?i===0?c.accent:kinds.vt2.line:c.text,
       fontSize:16,fontWeight:'900'}} numberOfLines={1}>{f.family}</Text>
     </Pressable>)}
    </View>:<Text style={{fontSize:11,color:c.subtext,lineHeight:17}}>
     {busy?'Buscando números de esta hoja…':
      i===2?'Todavía faltan cifras de hoy para este turno.':
      'No hay candidatos disponibles para esta hoja y turno.'}
    </Text>}
   </View>)}
   <Text style={[s.note,{color:c.subtext}]}>
    Son los primeros de cada hoja; no son apuestas automáticas.
   </Text>
   <Pressable accessibilityRole="button" onPress={()=>onSelectPrediction('lalo')}
    style={[s.mainButton,{backgroundColor:c.accent}]}>
    <Text style={{fontSize:13,fontWeight:'900',color:'#092347'}}>
     Ir a Predicción y ver los diez números  ›
    </Text>
   </Pressable>
  </View>
  <View style={[s.summary,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.accent}]}>Resumen del día</Text>
   <DayMatchGrid overview={overview} data={data} turn={turn}
    short onOpenHeads={()=>onNavigate('cabezas')}/>
  </View>
  <Text style={[s.heading,{color:c.accent}]}>¿Qué querés mirar?</Text>
  <View style={s.shortcutGrid}>
   <Pressable accessibilityRole="button" onPress={()=>onNavigate('hoja')}
    style={[s.shortcut,{backgroundColor:c.surface,borderColor:'#68B1FF'}]}>
    <Text style={{color:'#68B1FF',fontSize:24,fontWeight:'900'}}>▦</Text>
    <Text style={[s.shortcutTitle,{color:c.text}]}>La hoja</Text>
    <Text style={[s.note,{color:c.subtext}]}>Números del día y sus caminos</Text>
    <View style={s.mini}>
     {column&&first?<RouteMiniBoard values={column.values} cells={first.path}
      kind="vt2" compact/>:<Text style={{color:c.muted,fontSize:11}}>Sin hoja cargada</Text>}
    </View>
    <Text style={[s.link,{color:'#76BCFF'}]}>Abrir hoja  ›</Text>
   </Pressable>
   <Pressable accessibilityRole="button" onPress={()=>onNavigate('predictiva')}
    style={[s.shortcut,{backgroundColor:c.surface,borderColor:'#E9BA61'}]}>
    <Text style={{color:'#E9BA61',fontSize:24,fontWeight:'900'}}>⌁</Text>
    <Text style={[s.shortcutTitle,{color:c.text}]}>Los recorridos</Text>
    <Text style={[s.note,{color:c.subtext}]}>Cómo se forman las cifras</Text>
    <View style={s.mini}>
     {column&&first?<RouteMiniBoard values={column.values} cells={first.path}
      kind="vt2" compact/>:<Text style={{color:c.muted,fontSize:11}}>Sin recorridos</Text>}
    </View>
    <Text style={[s.link,{color:'#E9BA61'}]}>Ver figuras  ›</Text>
   </Pressable>
  </View>
  <View style={[s.bottomCard,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.text}]}>Todo desde un lugar</Text>
   <View style={s.actions}>
    {([
     ['info','Info','☀'],['cabezas','Cabezas reales','▤'],
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
   Los puestos de los favoritos sirven para observar y comparar, no aseguran resultados.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 root:{marginTop:9,gap:12,paddingBottom:25},
 hero:{borderWidth:2,borderRadius:18,padding:13,gap:10},
 kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.1},
 title:{fontSize:22,fontWeight:'900',color:'#F5C04B'},
 desc:{fontSize:11,lineHeight:17},
 note:{fontSize:10,lineHeight:16},
 groupHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 favoriteGroup:{gap:6},
 favRow:{flexDirection:'row',gap:7},
 favChip:{flex:1,minWidth:0,borderWidth:1,borderRadius:10,
  alignItems:'center',gap:3,padding:8},
 mainButton:{borderRadius:11,padding:12,alignItems:'center'},
 heading:{fontSize:18,fontWeight:'900'},
 summary:{borderWidth:1.5,borderRadius:15,padding:13,gap:12},
 outline:{borderWidth:1,borderRadius:10,padding:11,alignItems:'center'},
 shortcutGrid:{flexDirection:'row',gap:9,alignItems:'stretch'},
 shortcut:{flex:1,borderWidth:1.2,borderRadius:15,
  padding:12,gap:7,justifyContent:'space-between'},
 shortcutTitle:{fontSize:15,fontWeight:'900'},
 mini:{alignItems:'center',minHeight:80,justifyContent:'center'},
 link:{fontWeight:'900',fontSize:11},
 bottomCard:{borderRadius:15,borderWidth:1,padding:13,gap:9},
 actions:{flexDirection:'row',flexWrap:'wrap',gap:7},
 action:{minWidth:'48%',flexGrow:1,borderWidth:1,borderRadius:9,padding:9,
  flexDirection:'row',alignItems:'center',gap:6}
});