import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {Turno} from '../domain';
import type {LaloHistorical} from '../motorLalo';
import type {InfoVisualDay} from '../infoTurnHistory';
import {buildExperimentalVt2} from '../experimentalVt2';
import {evaluateExperimentalVt2Post} from '../vt2ExperimentalPost';
import type {Vt2PublishedHead} from '../vt2ExperimentalPost';
import {shapeWitnesses} from '../shapeWitnesses';
import type {PanoramaRoute} from '../panoramaModel';
import RouteMiniBoard from './RouteMiniBoard';
import {readableWeekday} from '../infoTurnHistory';
import {useLaloTheme} from './LaloTheme';

export default function Vt2ExperimentalPanel({date,turn,sheet,history,days,heads,publishedHeads}:{
 date:string;turn:Turno;sheet:DailySheet|null;
 history:LaloHistorical[];days:InfoVisualDay[];heads:string[];
 publishedHeads?:Vt2PublishedHead[]
}){
 const {colors:c,kinds}=useLaloTheme();
 const [selected,setSelected]=useState<string|null>(null);
 const model=useMemo(()=>sheet&&date?buildExperimentalVt2(
  sheet,date,turn,[...days,...history]):null,
  [sheet,date,turn,days,history]);
 const post=useMemo(()=>model?evaluateExperimentalVt2Post(model,
  publishedHeads?.length?publishedHeads:heads.map(head=>({jur:'',head}))):null,
  [model,publishedHeads,heads]);
 const sections=[{name:'Geometría completa',items:model?.geometric||[],
  score:post?.geometric,id:'geometric'},
  {name:'Figuras conectadas',items:model?.connected||[],
  score:post?.connected,id:'connected'}];
 return <View style={[s.panel,{backgroundColor:c.surfaceAlt,borderColor:kinds.vt2.line}]}>
  <Text style={{fontWeight:'900',fontSize:14,color:kinds.vt2.line}}>
   Otras pruebas · VT2
  </Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Dos maneras de buscar figuras con respaldo anterior. Tocá una para comparar
   su posición con las minihojas del pasado.
  </Text>
  {!model?<Text style={[s.note,{color:c.muted}]}>Cargá la hoja para ver las pruebas.</Text>:
   sections.map(section=><View key={section.id}
    style={[s.section,{backgroundColor:c.card,borderColor:c.border}]}>
    <Text style={{fontWeight:'900',fontSize:12,color:c.text}}>
     {section.name}
    </Text>
    {post?.published.length?<Text style={[s.note,{color:c.subtext}]}>
     {section.score?.matchedFamilies||0} familias y
     {' '}{section.score?.matchedHeads||0} cabezas coincidentes.
    </Text>:null}
    {section.items.map((v,i)=>{
     const id=section.id+'|'+i,active=selected===id;
     const match=section.score?.matches.find(m=>m.rank===i+1&&m.family===v.family);
     const col=sheet?.columns.find(x=>x.id===v.source);
     const cells=v.cells.map(text=>{
      const [row,k]=text.split(':').map(Number);return {row,col:k};
     });
     const route:PanoramaRoute={
      id:'lab|'+id,ownerId:'lab|vt2',kind:'vt2',sourceId:v.source,
      cells,readings:[v.value],headSources:[]
     };
     return <View key={id} style={[s.item,{
      borderColor:match?kinds.vt2.line:c.border,backgroundColor:c.surface}]}>
      <Pressable accessibilityRole="button" accessibilityState={{expanded:active}}
       onPress={()=>setSelected(active?null:id)}
       style={{padding:9,gap:3}}>
       <Text style={{fontSize:12,fontWeight:'900',color:c.text}}>
        {active?'▾':'▸'} #{i+1} · {v.family}
        {match?' · ✓ Salió':''}
       </Text>
       <Text style={[s.note,{color:c.subtext}]}>
        {v.source} · {v.witnesses} antecedentes
       </Text>
      </Pressable>
      {active&&col?<View style={[s.detail,{borderTopColor:c.border}]}>
       <Text style={{fontWeight:'900',fontSize:11,color:c.text}}>Figura de hoy</Text>
       <RouteMiniBoard values={col.values} cells={cells} kind="vt2"/>
       <Text style={{fontWeight:'900',fontSize:11,color:c.text}}>
        Antecedentes de la misma forma
       </Text>
       <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator
        contentContainerStyle={{gap:8,paddingBottom:4}}>
        {shapeWitnesses(date,turn,route,sheet!,days).map(w=><View key={w.id}
         style={[s.mini,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
         <Text style={[s.note,{color:c.text,fontWeight:'900'}]}>
          {readableWeekday(w.date)} · {w.turn}
         </Text>
         <Text style={[s.note,{color:c.subtext}]}>
          {w.jurisdiction} {w.head}
         </Text>
         <RouteMiniBoard values={w.values} cells={w.cells} kind="vt2" compact/>
        </View>)}
       </ScrollView>
       {match?<Text style={[s.note,{color:kinds.vt2.line}]}>
        Coincidió con {match.heads.map(h=>h.head).join(' · ')}.
       </Text>:null}
      </View>:null}
     </View>;
    })}
   </View>)}
 </View>;
}
const s=StyleSheet.create({
 panel:{borderWidth:1,borderRadius:12,marginTop:12,padding:11,gap:8},
 note:{fontSize:11,lineHeight:16},
 section:{borderWidth:1,borderRadius:9,padding:9,gap:6},
 item:{borderWidth:1,borderRadius:8,overflow:'hidden'},
 detail:{borderTopWidth:1,padding:9,gap:8},
 mini:{width:164,borderWidth:1,borderRadius:8,padding:8,gap:6}
});