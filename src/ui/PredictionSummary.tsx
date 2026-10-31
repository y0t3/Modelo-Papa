import React,{useEffect,useMemo,useState} from 'react';
import BosteroWatermark from './BosteroWatermark';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloView,LaloKind} from '../motorLalo';
import type {AuxiliarView} from '../motorLaloAuxiliar';
import type {AuxiliaryHeads} from '../auxSantiagoNeuquen';
import {rowsForModel,hitsForFamily} from '../predictionParallel';
import type {HeadEvent,ModelChoice} from '../predictionParallel';
import {KINDS} from './visualTokens';
import {useLaloTheme} from './LaloTheme';
import {readableWeekday} from '../infoTurnHistory';
import InlineFamilyPaths from './InlineFamilyPaths';

const readableKind:Record<LaloKind,string>={vt2:'2 cifras',vt3:'3 cifras',vt4:'4 cifras'};
type Props={date:string;turn:Turno;view:LaloView|null;model?:ModelChoice;
 auxiliar?:AuxiliarView|null;sheet?:DailySheet|null;auxHeads?:AuxiliaryHeads|null;
 heads?:string[];onOpenFamily?:(id:string)=>void};
export default function PredictionSummary({date,turn,view,heads=[],
 model='lalo',auxiliar,sheet=null,auxHeads=null,onOpenFamily}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const [kind,setKind]=useState<LaloKind>('vt2');
 const [opened,setOpened]=useState<string|null>(null);
 useEffect(()=>{setKind('vt2');setOpened(null)},[date,turn,model]);
 const iso=date.includes('/')?date.slice(6,10)+'-'+date.slice(3,5)+'-'+date.slice(0,2):date;
 const rows=useMemo(()=>rowsForModel(model,kind,view,auxiliar||null).slice(0,10),
  [model,kind,view,auxiliar]);
 const events:HeadEvent[]=heads.filter(h=>/^\d{4}$/.test(h))
  .map(head=>({jur:'',head}));
 const summaries=rows.flatMap(f=>hitsForFamily(f,events).map(h=>({
  rank:f.rank,head:h.head,family:f.family,kind
 })));
 const indicator=kinds[kind];
 return <View style={[s.panel,{backgroundColor:c.surface,borderColor:'#BC9241'}]}>
  <View style={s.header}>
   <BosteroWatermark opacity={0.12}/>
   <Text style={[s.eyebrow,{color:c.accent}]}>
    {model==='auxiliar'?'LA OTRA HOJA':'EL CUADERNO DE LALO'}
   </Text>
   <Text style={[s.title,{color:c.text}]}>Números para mirar hoy</Text>
   <Text style={[s.subtitle,{color:c.subtext}]}>
    {iso?readableWeekday(iso):'Elegí una fecha'} · {turn}
   </Text>
  </View>
  <Text style={[s.description,{color:c.subtext}]}>
   {model==='auxiliar'?
    'Santiago y Neuquén. Tocá un número para ver todos sus caminos.':
    'Hoja +11 de Lalo. Tocá un número y mirá su formación aquí mismo.'}
  </Text>
  <View style={s.kindTabs}>
   {KINDS.map(k=><Pressable key={k} accessibilityRole="tab"
    accessibilityState={{selected:kind===k}} onPress={()=>{setKind(k);setOpened(null)}}
    style={[s.kindTab,{backgroundColor:kind===k?kinds[k].fill:c.surfaceAlt,
     borderColor:kind===k?kinds[k].line:c.border}]}>
    <Text style={{color:kind===k?kinds[k].text:c.subtext,
     fontSize:12,fontWeight:'900'}}>{readableKind[k]}</Text>
   </Pressable>)}
  </View>
  {!!events.length?<View style={[s.matchBar,{borderColor:summaries.length?indicator.line:c.border,
   backgroundColor:summaries.length?indicator.fill:c.surfaceAlt}]}>
   <Text style={{color:summaries.length?indicator.text:c.subtext,fontWeight:'900',fontSize:12}}>
    {summaries.length?'Coincidieron estos números:':'Sin coincidencias en esta lista'}
   </Text>
   {summaries.length?<View style={s.matchChips}>
    {summaries.map((h,i)=><Text accessibilityRole="link" onPress={()=>onOpenFamily?.(h.kind+'|'+h.family)} key={h.head+'|'+h.rank+'|'+i}
     style={[s.matchChip,{color:indicator.text,borderColor:indicator.line,
      backgroundColor:c.card}]}>
     #{h.rank} · {h.family} · {h.head}  ›
    </Text>)}
   </View>:null}
  </View>:null}
  <View style={s.list}>
   {rows.map((f,i)=>{
    const wins=hitsForFamily(f,events);
    const exact=new Set(wins.map(h=>h.head.slice(-Number(kind.slice(-1)))));
    const isOpen=opened===f.key;
    const parts=f.values.length?f.values:[...new Set(f.family.split('/'))];
    const main=view?.ranks[kind].find(x=>x.family===f.family);
    const source=(model==='lalo'&&sheet&&main)?
     {sheet,routes:main.paths.map(p=>({
      sourceId:p.sourceId,value:p.value,path:p.path
     }))}:undefined;
    const aux=model==='auxiliar'&&auxHeads?{heads:auxHeads,values:f.values}:undefined;
    return <View key={f.key+'|'+i} style={[s.row,{
     backgroundColor:wins.length?indicator.fill:c.card,
     borderColor:wins.length?indicator.line:c.border,
     borderWidth:wins.length?2:1}]}>
     <Pressable accessibilityRole="button"
      accessibilityLabel={'Puesto '+f.rank+', '+f.family+', mostrar en Predictiva'}
      onPress={()=>onOpenFamily?.(kind+'|'+f.family)}
      style={s.rowHead}>
      <Text style={[s.rank,{backgroundColor:wins.length?indicator.fill:c.surfaceAlt,
       color:wins.length?indicator.text:c.subtext,
       borderColor:wins.length?indicator.line:c.border,
       borderWidth:wins.length?1.5:0}]}>{f.rank}</Text>
      <View style={{flex:1,gap:4}}>
       <View style={{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:4}}>
        {parts.map((part,j)=><React.Fragment key={part+'|'+j}>
         {j>0?<Text style={{color:c.subtext,fontWeight:'800'}}>/</Text>:null}
         <Text style={{fontSize:16,fontWeight:'900',borderRadius:6,overflow:'hidden',
          paddingHorizontal:exact.has(part)?5:0,paddingVertical:exact.has(part)?2:0,
          borderWidth:exact.has(part)?1.6:0,
          borderColor:exact.has(part)?indicator.line:'transparent',
          color:exact.has(part)?indicator.text:c.text,
          backgroundColor:exact.has(part)?indicator.fill:'transparent'}}>{part}</Text>
        </React.Fragment>)}
       </View>
       {wins.length?<Text style={{fontSize:10,color:indicator.text,fontWeight:'900'}}>
        ✓ Coincidió con {wins.map(w=>w.head).join(' · ')}
       </Text>:null}
      </View>
      <Text style={{fontSize:11,fontWeight:'800',color:wins.length?indicator.line:c.subtext}}>
       Ver en hoja ›
      </Text>
     </Pressable>
     <Pressable accessibilityRole="button" accessibilityState={{expanded:isOpen}}
      onPress={()=>setOpened(v=>v===f.key?null:f.key)} style={s.inlineToggle}>
      <Text style={{fontSize:10,fontWeight:'800',color:c.accent}}>
       {isOpen?'▴ Cerrar formación':'▾ Ver formación aquí'}
      </Text>
     </Pressable>
     {isOpen?<InlineFamilyPaths kind={kind} family={f.family} turn={turn}
      plus={source} aux={aux}/>:null}
    </View>;
   })}
   {!rows.length?<Text style={{color:c.subtext,fontSize:12,padding:14}}>
    {model==='auxiliar'?'Todavía no hay números de esa hoja.':
     'Todavía no hay números para este turno. Actualizá la hoja.'}
   </Text>:null}
  </View>
  <Text style={{color:c.muted,fontSize:10,lineHeight:16}}>
   Estas listas son para estudiar las hojas. No aseguran resultados.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 panel:{borderWidth:1.3,borderRadius:17,padding:13,gap:10,marginTop:10},
 header:{position:'relative',overflow:'hidden',borderRadius:11,paddingVertical:10,
  paddingHorizontal:11,backgroundColor:'rgba(2,20,44,.22)',minHeight:88},
 eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.1},
 title:{fontSize:22,fontWeight:'900',marginTop:6},
 subtitle:{fontSize:12,fontWeight:'700',marginTop:3},
 description:{fontSize:12,lineHeight:18},
 kindTabs:{flexDirection:'row',gap:7},
 kindTab:{flex:1,paddingVertical:10,borderRadius:10,borderWidth:1,alignItems:'center'},
 matchBar:{padding:10,borderWidth:1.3,borderRadius:11,gap:7},
 matchChips:{flexDirection:'row',flexWrap:'wrap',gap:5},
 matchChip:{fontSize:11,fontWeight:'900',borderWidth:1,borderRadius:8,
  paddingHorizontal:9,paddingVertical:6,overflow:'hidden'},
 list:{gap:3},
 row:{borderRadius:11,paddingHorizontal:10,paddingVertical:6,gap:6},
 rowHead:{flexDirection:'row',alignItems:'center',gap:10,minHeight:35},
 inlineToggle:{paddingLeft:38,paddingVertical:2,alignSelf:'flex-start'},
 rank:{width:30,height:30,borderRadius:8,overflow:'hidden',textAlign:'center',
  textAlignVertical:'center',fontWeight:'900',fontSize:14}
});