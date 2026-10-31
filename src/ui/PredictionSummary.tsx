import React,{useEffect,useMemo,useState} from 'react';
import BosteroWatermark from './BosteroWatermark';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {DailySheet} from '../sheet';
import type {InfoVisualDay} from '../infoTurnHistory';
import {buildVt2FamilyWitnesses} from '../vt2FamilyHistory';
import Vt2FamilyHistoryModal from './Vt2FamilyHistoryModal';
import type {LaloView,LaloKind} from '../motorLalo';
import type {AuxiliarView} from '../motorLaloAuxiliar';
import {familyKey,rowsForModel,hitsForFamily} from '../predictionParallel';
import type {HeadEvent,ModelChoice} from '../predictionParallel';
import {KINDS} from './visualTokens';
import {useLaloTheme} from './LaloTheme';
import {readableWeekday} from '../infoTurnHistory';
const readableKind:Record<LaloKind,string>={vt2:'2 cifras',vt3:'3 cifras',vt4:'4 cifras'};
export default function PredictionSummary({date,turn,view,onFocus,onAuxFocus,onTrackFamily,
 heads=[],model='lalo',auxiliar,sheet=null,visualDays=[]}:{
 date:string;turn:Turno;view:LaloView|null;model?:ModelChoice;
 auxiliar?:AuxiliarView|null;sheet?:DailySheet|null;visualDays?:InfoVisualDay[];
 onFocus:(id:string)=>void;onAuxFocus?:(id:string)=>void;onTrackFamily?:(family:string)=>void;
 post?:Record<LaloKind,string[]>|null;heads?:string[]
}){
 const {colors:c,kinds}=useLaloTheme();
 const [active,setActive]=useState<LaloKind>('vt2');
 const [expanded,setExpanded]=useState<string|null>(null);
 const [historyFamily,setHistoryFamily]=useState<string|null>(null);
 useEffect(()=>{setActive('vt2');setExpanded(null);setHistoryFamily(null)},
  [date,turn,model]);
 const isoDate=date.includes('/')?date.slice(6,10)+'-'+date.slice(3,5)+'-'+date.slice(0,2):date;
 const vt2Witnesses=useMemo(()=>{
  const m=new Map<string,ReturnType<typeof buildVt2FamilyWitnesses>>();
  if(model!=='lalo'||!sheet)return m;
  for(const f of view?.ranks.vt2.slice(0,10)||[])
   m.set(f.family,buildVt2FamilyWitnesses(isoDate,turn,f.family,sheet,visualDays));
  return m;
 },[model,sheet,view,isoDate,turn,visualDays]);
 const rows=rowsForModel(model,active,view,auxiliar||null).slice(0,10);
 const events:HeadEvent[]=heads.map(head=>({jur:'',head}));
 const matchedHeads=(family:typeof rows[number])=>hitsForFamily(family,events).map(x=>x.head);
 const matching=rows.filter(x=>matchedHeads(x).length>0);
 const accent=kinds[active].line;
 const labelFor=(family:string)=>{
  if(model==='auxiliar')return 'Hoja auxiliar';
  const original=view?.ranks[active].find(x=>familyKey(x.family)===familyKey(family));
  if(!original)return 'Con recorrido en la hoja';
  return original.state==='CON_APOYO'?'Con varios apoyos':
   original.state==='EN_SEGUIMIENTO'?'Con antecedentes':'En formación';
 };
 const openRow=(f:typeof rows[number])=>{
  if(model==='auxiliar')setExpanded(x=>x===f.key?null:f.key);
  else onFocus(active+'|'+f.family);
 };
 return <View style={[s.panel,{backgroundColor:c.surface,borderColor:'#BC9241'}]}>
  <View style={s.header}>
   <BosteroWatermark opacity={0.12}/>
   <Text style={[s.eyebrow,{color:c.accent}]}>
    {model==='auxiliar'?'LA OTRA HOJA':'EL CUADERNO DE LALO'}
   </Text>
   <Text style={[s.title,{color:c.text}]}>Números para mirar hoy</Text>
   <Text style={[s.subtitle,{color:c.subtext}]}>
    {date?readableWeekday(isoDate):'Elegí una fecha'} · {turn}
   </Text>
  </View>
  <Text style={[s.description,{color:c.subtext}]}>
   {model==='auxiliar'?
    'Estos números salen de Santiago y Neuquén. Mirá sus recorridos en esa hoja.':
    'Estos son los diez primeros que encontró Lalo. Tocá uno para ver cómo se formó.'}
  </Text>
  <View style={s.kindTabs}>
   {KINDS.map(kind=><Pressable key={kind} accessibilityRole="tab"
    accessibilityState={{selected:active===kind}} onPress={()=>{setActive(kind);setExpanded(null)}}
    style={[s.kindTab,{backgroundColor:active===kind?kinds[kind].fill:c.surfaceAlt,
     borderColor:active===kind?kinds[kind].line:c.border}]}>
    <Text style={{color:active===kind?kinds[kind].text:c.subtext,
     fontSize:12,fontWeight:'900'}}>{readableKind[kind]}</Text>
   </Pressable>)}
  </View>
  {heads.some(x=>/^\d{4}$/.test(x))?<View style={[s.matchBar,{
   backgroundColor:matching.length?c.accentFill:c.surfaceAlt,
   borderColor:matching.length?c.accent:c.border}]}>
    <Text style={{fontSize:12,fontWeight:'900',color:matching.length?c.accent:c.text}}>
     {matching.length?'✓ '+matching.length+' coincidencia(s) en la lista':
      'Todavía no coincidió ninguno de esta lista'}
    </Text>
    <Text style={{fontSize:10,color:c.subtext}}>
     Comparado con las cabezas que ya salieron
    </Text>
   </View>:null}
  <View style={s.list}>
   {rows.map((f,i)=>{
    const wins=matchedHeads(f);
    const history=active==='vt2'&&model==='lalo'?vt2Witnesses.get(f.family):null;
    return <View key={f.key+'|'+i} style={[s.row,{
     backgroundColor:wins.length?c.accentFill:c.card,
     borderColor:wins.length?c.accent:c.border}]}>
     <Pressable accessibilityRole="button"
      accessibilityLabel={'Puesto '+f.rank+', número '+f.family+', ver recorrido'}
      onPress={()=>openRow(f)}
      style={s.rowHead}>
      <Text style={[s.rank,{backgroundColor:i===0?c.accent:c.surfaceAlt,
       color:i===0?'#071A38':c.subtext}]}>{f.rank}</Text>
      <View style={{flex:1,gap:3}}>
       <Text style={{fontSize:17,fontWeight:'900',color:c.text}} numberOfLines={2}>
        {model==='auxiliar'&&active==='vt4'?f.values.join(' / '):f.family}
       </Text>
       <Text style={{fontSize:10,color:c.subtext}} numberOfLines={1}>
        {labelFor(f.family)}
       </Text>
      </View>
      {wins.length?<Text style={{fontSize:11,fontWeight:'900',color:c.accent}}>✓ Salió</Text>:
       <Text style={{fontSize:11,fontWeight:'900',color:c.accent}}>›</Text>}
     </Pressable>
     {wins.length?<Text style={{fontSize:11,color:c.accent,fontWeight:'800'}}>
      Coincidió con {wins.join(' · ')}
     </Text>:null}
     {model==='auxiliar'&&expanded===f.key?<View style={{gap:6,marginTop:6}}>
      {f.details.map((detail,k)=><Text key={k}
       style={{fontSize:11,lineHeight:17,color:c.subtext}}>{detail}</Text>)}
      {onAuxFocus?<Pressable accessibilityRole="button"
       onPress={()=>onAuxFocus(active+'|'+f.family)} style={s.inlineButton}>
       <Text style={{color:c.accent,fontWeight:'800'}}>Ver minihoja y recorridos  ›</Text>
      </Pressable>:null}
     </View>:null}
     {!!history?.length?<Pressable accessibilityRole="button"
      onPress={()=>setHistoryFamily(f.family)} style={s.link}>
      <Text style={{color:c.accent,fontSize:11,fontWeight:'800'}}>
       Mirar dónde apareció antes  ›
      </Text>
     </Pressable>:null}
     {active==='vt3'&&model==='lalo'&&onTrackFamily?
      <Pressable accessibilityRole="button" onPress={()=>onTrackFamily(f.family)}
       style={s.link}>
       <Text style={{color:c.accent,fontSize:11,fontWeight:'800'}}>
        Seguir este número en Info  ›
       </Text>
      </Pressable>:null}
    </View>;
   })}
   {!rows.length?<Text style={{color:c.subtext,fontSize:12,padding:14}}>
    {model==='auxiliar'?'Todavía no hay números de esa hoja.':
     'Todavía no hay números para este turno. Actualizá la hoja.'}
   </Text>:null}
  </View>
  {rows.length&&model==='lalo'?<Pressable accessibilityRole="button"
   onPress={()=>onFocus(active+'|'+rows[0].family)}
   style={[s.bigButton,{backgroundColor:c.accent}]}>
    <Text style={{color:'#072348',fontWeight:'900',fontSize:14}}>⌁  Ver recorridos de la lista   ›</Text>
    <Text style={{color:'#13375D',fontSize:11}}>Mirá cómo se armó el primero</Text>
   </Pressable>:null}
  <Text style={{color:c.muted,fontSize:10,lineHeight:16}}>
   Este orden sirve para estudiar. No significa que un número tenga más chances comprobadas.
  </Text>
  {model==='lalo'?<Vt2FamilyHistoryModal date={isoDate} turn={turn}
   family={historyFamily} view={view} sheet={sheet} days={visualDays}
   onClose={()=>setHistoryFamily(null)}
   onOpenCurrent={()=>{const f=historyFamily;setHistoryFamily(null);
    if(f)onFocus('vt2|'+f)}}/>:null}
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
 matchBar:{padding:10,borderWidth:1,borderRadius:11,gap:4},
 list:{gap:6},
 row:{borderWidth:1,borderRadius:11,paddingHorizontal:10,paddingVertical:8,gap:4},
 rowHead:{flexDirection:'row',alignItems:'center',gap:10,minHeight:39},
 rank:{width:30,height:30,borderRadius:8,overflow:'hidden',textAlign:'center',
  textAlignVertical:'center',fontWeight:'900',fontSize:14},
 link:{paddingLeft:39,paddingVertical:4},
 inlineButton:{padding:8,alignSelf:'flex-start'},
 bigButton:{borderRadius:13,alignItems:'center',padding:13,gap:2}
});