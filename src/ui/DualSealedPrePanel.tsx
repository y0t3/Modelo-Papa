import React,{useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {DualFrozenRecord,DualKindResult,SealedChoice} from '../dualPreSnapshot';
import {evaluateDualFrozen} from '../dualPreSnapshot';
import type {FormKind} from '../motorFormasPrimero';
import {useLaloTheme} from './LaloTheme';
import RouteMiniBoard from './RouteMiniBoard';
import {readableWeekday} from '../infoTurnHistory';

export default function DualSealedPrePanel({record,published}:{
 record:DualFrozenRecord;published:{jur:string;head:string}[];
}){
 const {colors:c,kinds}=useLaloTheme();
 const [selected,setSelected]=useState<string|null>(null);
 const result=evaluateDualFrozen(record,published);
 const sealed=record.pre;
 const item=(kind:FormKind)=>{
  const group=sealed[kind],stats: DualKindResult=result[kind];
  const palette=kinds[kind];
  const visible=group.forms.find(x=>selected===kind+'|'+x.family);
  const ownSource=visible?sealed.columns.find(x=>x.id===visible.source):null;
  return <View key={kind} style={[s.group,{backgroundColor:c.card,borderColor:palette.line}]}>
   <Text style={{fontSize:14,fontWeight:'900',color:palette.line}}>
    {kind.toUpperCase()} · 10 PRONÓSTICOS PRE GUARDADOS
   </Text>
   <Text style={[s.note,{color:c.text}]}>
    Lalo Top10: {group.official.length} familias · Formas Primero:
    {' '}{group.forms.length} · Rescates:
    {' '}{group.forms.filter(x=>x.rescue).length}
   </Text>
   {result.publishedHeads?<Text style={[s.note,{color:c.text}]}>
    POST: Lalo {stats.officialHits} cabeza(s) · Formas {stats.formsHits}
    {' '}· Rescates {stats.rescueHits} · Coincidencias de familia Top3:
    {' '}Lalo {stats.officialTop3Hits} / Formas {stats.formsTop3Hits}.
   </Text>:<Text style={[s.note,{color:c.muted}]}>
    POST todavía pendiente. Esta lista ya está congelada.
   </Text>}
   {result.publishedHeads?<Text style={[s.note,{color:c.subtext}]}>
    Control físico de rescates, esperado: {stats.matchedNullExpected.toFixed(2)}
    {' '}cabeza(s), comparando silueta y fuente disponibles en el PRE.
    No demuestra ventaja por sí solo.
   </Text>:null}
   {group.forms.map(x=>{
    const active=selected===kind+'|'+x.family;
    const hits=stats.hitRows.filter(h=>h.formRank===x.rank);
    return <Pressable accessibilityRole="button" key={x.positionKey}
     onPress={()=>setSelected(active?null:kind+'|'+x.family)}
     style={[s.choice,{backgroundColor:hits.length?palette.fill:c.surfaceAlt,
      borderColor:hits.length?palette.line:c.border}]}>
     <Text style={{fontWeight:'900',fontSize:12,color:c.text}}>
      {active?'▾':'▸'} #{x.rank} · {x.family}
      {' · '}{x.rescue?'Fuera del Top10 de Lalo':'Compartida'}
      {hits.length?' · ✓ POST':''}
     </Text>
     <Text style={[s.note,{color:c.subtext}]}>
      {x.source} · fila {x.anchor+1} · {x.roots} cabezas ganadoras
      previas · {x.movement.replaceAll('_',' ').toLowerCase()}
     </Text>
    </Pressable>;
   })}
   {visible&&ownSource?<View style={[s.detail,{borderColor:palette.line,backgroundColor:c.surfaceAlt}]}>
    <Text style={[s.label,{color:c.text}]}>FIGURA CONGELADA ANTES DEL SORTEO</Text>
    <RouteMiniBoard values={ownSource.values} cells={visible.cells} kind={kind}/>
    <Text style={[s.note,{color:c.text}]}>
     {visible.source} · {visible.value} → {visible.family}
     {' '}· Estado: {visible.timeline.replaceAll('_',' ').toLowerCase()}.
    </Text>
    <Text style={[s.note,{color:c.subtext}]}>
     Antecedentes guardados: {visible.witnesses.length}.
     {' '}Familias del control físico: {visible.comparableFamilies.length}.
    </Text>
    <Text style={[s.label,{color:c.text}]}>ANTECEDENTES REALES DEL PRE GUARDADO</Text>
    <ScrollView horizontal nestedScrollEnabled contentContainerStyle={{gap:9}}>
     {visible.witnesses.map((w,i)=><View key={w.date+'|'+w.source+'|'+i}
      style={[s.mini,{borderColor:c.border,backgroundColor:c.card}]}>
      <Text style={[s.note,{color:c.text,fontWeight:'900'}]}>
       {readableWeekday(w.date)} · {w.turn}
      </Text>
      <Text style={[s.note,{color:c.text}]}>
       {w.jur} {w.head} · ruta {w.reading}
      </Text>
      {w.values.length===6?
       <RouteMiniBoard values={w.values} cells={w.cells} kind={kind} compact/>:
       <Text style={[s.note,{color:c.muted}]}>Minihoja histórica no conservada</Text>}
     </View>)}
    </ScrollView>
    {result.publishedHeads?stats.hitRows.filter(h=>h.formRank===visible.rank).map((h,i)=>
     <Text key={h.jur+'|'+i} style={[s.note,{color:palette.line}]}>
      POST {h.jur} {h.head}: {h.physicalPaths} caminos posibles;
      {' '}{h.selectedRoute?'la posición guardada también lo forma':
       'la posición guardada no lo forma'}.
     </Text>):null}
    <Text style={[s.note,{color:c.muted}]}>
     El recorrido se fijó antes de conocer el resultado. Que forme la cabeza
     POST es una coincidencia aritmética, no prueba que causó el sorteo.
    </Text>
   </View>:null}
  </View>;
 };
 return <View style={[s.wrapper,{borderColor:c.accent,backgroundColor:c.surface}]}>
  <Text style={[s.title,{color:c.accent}]}>PRE FÍSICO LOCAL CONSERVADO · VT2 + VT3</Text>
  <Text style={[s.note,{color:c.text}]}>
   {sealed.date} · {sealed.turn} · Primer registro:
   {' '}{new Date(sealed.createdAt).toLocaleString()}.
  </Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Huella SHA-256 local: {record.hash.slice(0,18)}…
   {' '}Ambos motores fueron registrados juntos.
   Este registro no se sobrescribe; el hash detecta modificaciones locales,
   pero no certifica por sí solo la hora frente a terceros.
  </Text>
  {item('vt2')}
  {item('vt3')}
 </View>;
}
const s=StyleSheet.create({
 wrapper:{borderWidth:1,borderRadius:12,padding:12,gap:10,marginTop:12},
 title:{fontSize:14,fontWeight:'900'},
 note:{fontSize:11,lineHeight:17},
 label:{fontSize:11,fontWeight:'900'},
 group:{padding:10,borderWidth:1,borderRadius:10,gap:6},
 choice:{borderWidth:1,padding:8,borderRadius:7,gap:3},
 detail:{borderWidth:1,borderRadius:9,padding:9,gap:8},
 mini:{width:206,borderWidth:1,borderRadius:8,padding:8,gap:7}
});