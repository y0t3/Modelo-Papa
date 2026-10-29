import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {Turno} from '../domain';
import type {LaloView} from '../motorLalo';
import type {FormMotorView,FormKind} from '../motorFormasPrimero';
import {classifyFigureMotion,exactActivationTimeline} from '../figureMotionAudit';
import type {InfoVisualDay} from '../infoTurnHistory';
import {readableWeekday} from '../infoTurnHistory';
import {buildFigureRescueAudit} from '../figureRescueAudit';
import {useLaloTheme} from './LaloTheme';
import RouteMiniBoard from './RouteMiniBoard';
type Filter='RESCATE'|'COMPARTIDO'|'LALO';
export default function FigureRescueAuditPanel({date,turn,pre,forms,lalo,days,published,kind='vt3'}:{
 date:string;turn:Turno;pre:DailySheet|null;forms:FormMotorView|null;
 lalo:LaloView|null;days:InfoVisualDay[];
 published:{jur:string;head:string}[];kind?:FormKind;
}){
 const {colors:c,kinds}=useLaloTheme(),paint=kinds[kind];
 const [filter,setFilter]=useState<Filter>('RESCATE');
 const [selected,setSelected]=useState<string|null>(null);
 const report=useMemo(()=>pre&&forms&&forms.kind===kind&&lalo?
  buildFigureRescueAudit(date,turn,pre,forms,lalo,published):null,
  [date,turn,pre,forms,lalo,published,kind]);
 if(!report)return null;
 const items=filter==='LALO'?report.laloOnly:
  report.forms.filter(x=>x.kind===filter);
 return <View style={[s.panel,{borderColor:paint.line,backgroundColor:c.surfaceAlt}]}>
  <Text style={[s.title,{color:paint.line}]}>Qué vio cada motor · {kind.toUpperCase()}</Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Revisá las figuras que Lalo no eligió, las que comparten o las que vio solo Lalo.
   Tocá una familia para ver sus antecedentes.
  </Text>
  <View style={s.tabs}>
   {([['RESCATE','Rescatadas'],['COMPARTIDO','Compartidas'],
    ['LALO','Solo Lalo']] as const).map(([id,label])=><Pressable
    key={id} accessibilityRole="tab" accessibilityState={{selected:filter===id}}
    onPress={()=>{setFilter(id);setSelected(null)}}
    style={[s.tab,{backgroundColor:filter===id?paint.fill:c.card,
     borderColor:filter===id?paint.line:c.border}]}>
    <Text style={{fontSize:11,fontWeight:'800',
     color:filter===id?paint.text:c.text}}>{label}</Text>
   </Pressable>)}
  </View>
  <Text style={[s.note,{color:c.subtext}]}>
   {report.rescueCount} rescatadas · {report.sharedCount} compartidas ·
   {' '}{report.laloOnlyCount} solo Lalo
  </Text>
  {items.map(item=>{
   const choice='choice' in item?item.choice:null;
   const family=choice?choice.family:item.family;
   const key=filter+'|'+family;
   const active=selected===key;
   const roots=choice?.support.roots||[];
   const hits=item.published;
   const motion=choice?classifyFigureMotion(choice):null;
   const timeline=choice?exactActivationTimeline(choice,forms?.rootDays||[]):null;
   const current=choice?pre?.columns.find(x=>x.id===choice.source):null;
   return <View key={key} style={[s.row,{borderColor:hits.length?paint.line:c.border,
    backgroundColor:c.card}]}>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:active}}
     onPress={()=>setSelected(active?null:key)} style={s.tap}>
     <Text style={{color:c.text,fontWeight:'900',fontSize:13}}>
      {active?'▾':'▸'} #{choice?.rank??item.rank} · {family}
      {hits.length?' · ✓ Salió':''}
     </Text>
     <Text style={[s.note,{color:c.subtext}]}>
      {choice?choice.support.days+' jornadas de respaldo · '+choice.source:
       'Recorridos que Lalo reconoció'}
     </Text>
    </Pressable>
    {active?<View style={[s.detail,{borderTopColor:c.border}]}>
     {choice&&current?<View style={{gap:7}}>
      <Text style={[s.label,{color:c.text}]}>Figura de esta hoja</Text>
      <RouteMiniBoard values={current.values} cells={choice.cells} kind={kind}/>
      <Text style={[s.note,{color:c.subtext}]}>
       {choice.source} · {motion?.exactEvents||0} antecedentes en el mismo lugar;
       {' '}{timeline?.days||0} jornadas con esa posición ganadora.
      </Text>
     </View>:null}
     <Text style={[s.label,{color:c.text}]}>
      {choice?'Cabezas anteriores que respaldan esta figura':
       'Recorridos reconocidos por Lalo'}
     </Text>
     <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator
      contentContainerStyle={s.strip}>
      {choice?roots.map((r,i)=>{
       const col=days.find(d=>d.date===r.date)?.sheet.columns.find(
        x=>x.id===r.source);
       return <View key={r.event+'|'+r.source+'|'+i}
        style={[s.mini,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
        <Text style={[s.note,{color:c.text,fontWeight:'900'}]}>
         {readableWeekday(r.date)} · {r.turn}
        </Text>
        <Text style={[s.note,{color:c.subtext}]}>
         {r.jurisdiction} {r.head}
        </Text>
        {col?<RouteMiniBoard values={col.values} cells={r.cells} kind={kind}
         compact/>:<Text style={[s.note,{color:c.muted}]}>Sin minihoja</Text>}
       </View>
      }):item.routes.map((r,i)=>{
       const col=pre?.columns.find(x=>x.id===r.sourceId);
       return <View key={r.sourceId+'|'+i}
        style={[s.mini,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
        <Text style={[s.note,{color:c.text}]}>{r.sourceId}</Text>
        {col?<RouteMiniBoard values={col.values} cells={r.path.map(
         p=>({row:p.row,col:p.col}))} kind={kind} compact/>:null}
       </View>;
      })}
     </ScrollView>
     {hits.length?<Text style={[s.note,{color:paint.line}]}>
      Coincidió con: {hits.map(h=>h.jur+' '+h.head).join(' · ')}
      {' '}({hits.reduce((n,h)=>n+h.physicalPaths.length,0)} caminos posibles).
     </Text>:<Text style={[s.note,{color:c.muted}]}>
      {report.publicationCount?'Sin coincidencias en las cabezas publicadas.':
       'Todavía no hay resultados de este turno.'}
     </Text>}
    </View>:null}
   </View>;
  })}
  {!items.length?<Text style={[s.note,{color:c.muted}]}>
   No hay familias de este grupo en el turno elegido.
  </Text>:null}
 </View>;
}
const s=StyleSheet.create({
 panel:{padding:11,borderRadius:12,borderWidth:1,marginTop:12,gap:7},
 title:{fontSize:14,fontWeight:'900'},note:{fontSize:11,lineHeight:16},
 label:{fontSize:11,fontWeight:'900'},tabs:{flexDirection:'row',gap:5},
 tab:{flex:1,borderWidth:1,borderRadius:8,paddingVertical:8,alignItems:'center'},
 row:{borderWidth:1,borderRadius:9,overflow:'hidden'},
 tap:{padding:10,gap:4},detail:{borderTopWidth:1,padding:10,gap:9},
 strip:{gap:8,paddingBottom:5},
 mini:{width:165,borderWidth:1,borderRadius:8,padding:8,gap:5}
});