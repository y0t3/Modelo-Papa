import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {Turno} from '../domain';
import type {LaloView} from '../motorLalo';
import {reversibleFamily} from '../motorLalo';
import type {InfoVisualDay} from '../infoTurnHistory';
import {readableWeekday} from '../infoTurnHistory';
import {buildFormFirstMotor,buildFormFirstVt2} from '../motorFormasPrimero';
import {useLaloTheme} from './LaloTheme';
import RouteMiniBoard from './RouteMiniBoard';
export default function FormasPrimeroPanel({date,turn,pre,days,lalo,heads,kind='vt3'}:{
 date:string;turn:Turno;pre:DailySheet|null;days:InfoVisualDay[];
 lalo:LaloView|null;heads:string[];kind?:'vt2'|'vt3';
}){
 const {colors:c,kinds}=useLaloTheme();
 const [selected,setSelected]=useState<number|null>(null);
 const paint=kinds[kind];
 const model=useMemo(()=>pre&&date?
  (kind==='vt2'?buildFormFirstVt2:buildFormFirstMotor)(
   pre,date,turn,days.filter(d=>d.date<date)):null,
  [pre,date,turn,days,kind]);
 const winners=new Set(heads.filter(h=>/^\d{4,5}$/.test(h))
  .map(h=>reversibleFamily(h.slice(kind==='vt2'?-2:-3))));
 const count=(list:string[],top:number)=>list.slice(0,top).filter(
  x=>winners.has(x)).length;
 const forms=model?.top.map(f=>f.family)||[];
 const laloTop=lalo?.ranks[kind].slice(0,10).map(f=>f.family)||[];
 return <View style={[s.panel,{backgroundColor:c.surfaceAlt,borderColor:paint.line}]}>
  <Text style={{color:paint.line,fontWeight:'900',fontSize:14}}>
   Formas primero · {kind.toUpperCase()}
  </Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Primero mira los recorridos que ya tuvieron antecedentes. Después
   lee qué número forman hoy.
  </Text>
  {heads.some(h=>/^\d{4,5}$/.test(h))?<Text style={[s.note,{color:c.text}]}>
   Coincidencias: Formas {count(forms,3)}/{count(forms,10)}
   {' '}· Lalo {count(laloTop,3)}/{count(laloTop,10)} (Top3/Top10).
  </Text>:null}
  {model?.top.map(p=>{
   const active=selected===p.rank;
   const hit=winners.has(p.family);
   const col=pre?.columns.find(x=>x.id===p.source);
   return <View key={p.positionKey} style={[s.row,{
    borderColor:hit?paint.line:c.border,backgroundColor:c.card}]}>
    <Pressable accessibilityRole="button"
     accessibilityState={{expanded:active}}
     onPress={()=>setSelected(active?null:p.rank)}
     style={{padding:10,gap:4}}>
     <Text style={{color:c.text,fontWeight:'900',fontSize:12}}>
      {active?'▾':'▸'} #{p.rank} · {p.family} {hit?'· ✓ Salió':''}
     </Text>
     <Text style={[s.note,{color:c.subtext}]}>
      {p.source} · {p.support.days} jornadas de respaldo
     </Text>
    </Pressable>
    {active&&col?<View style={[s.details,{borderTopColor:c.border}]}>
     <Text style={[s.label,{color:c.text}]}>Figura de hoy: {p.value}</Text>
     <RouteMiniBoard values={col.values} cells={p.cells} kind={kind}/>
     <Text style={[s.label,{color:c.text}]}>Antecedentes de esta figura</Text>
     <ScrollView horizontal nestedScrollEnabled
      showsHorizontalScrollIndicator contentContainerStyle={{gap:8}}>
      {p.support.roots.map((r,i)=>{
       const previous=days.find(d=>d.date===r.date)?.sheet.columns.find(x=>x.id===r.source);
       return <View key={r.event+'|'+r.source+'|'+i}
        style={[s.mini,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
        <Text style={[s.note,{color:c.text,fontWeight:'900'}]}>
         {readableWeekday(r.date)} · {r.turn}
        </Text>
        <Text style={[s.note,{color:c.subtext}]}>
         {r.jurisdiction} {r.head}
        </Text>
        {previous?<RouteMiniBoard values={previous.values} cells={r.cells}
         kind={kind} compact/>:<Text style={[s.note,{color:c.muted}]}>
         Sin minihoja disponible
        </Text>}
       </View>;
      })}
     </ScrollView>
     <Text style={[s.note,{color:c.muted}]}>
      Muestra antecedentes reales; el resultado todavía debe comprobarse.
     </Text>
    </View>:null}
   </View>;
  })||<Text style={[s.note,{color:c.muted}]}>Cargá la hoja para ver las figuras.</Text>}
  {model&&!model.top.length?<Text style={[s.note,{color:c.muted}]}>
   Este turno no tiene figuras con antecedentes suficientes.
  </Text>:null}
 </View>;
}
const s=StyleSheet.create({
 panel:{padding:11,borderRadius:12,borderWidth:1,marginTop:12,gap:7},
 note:{fontSize:11,lineHeight:16},label:{fontSize:11,fontWeight:'900'},
 row:{borderWidth:1,borderRadius:9,overflow:'hidden'},
 details:{borderTopWidth:1,padding:10,gap:8},
 mini:{width:166,borderWidth:1,borderRadius:8,padding:8,gap:6}
});