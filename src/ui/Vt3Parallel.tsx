import React,{useEffect,useMemo,useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {Turno} from '../domain';
import {TURNOS} from '../domain';
import type {LaloView,LaloHistorical} from '../motorLalo';
import {buildMotorLalo} from '../motorLalo';
import {preSheetAtCut} from '../infoCandidatos';
import {buildVt3Shadow} from '../vt3Shadow';
import {buildVt3Trial} from '../vt3Trial';
import {loadFrozen,saveFrozen,evaluateFrozen} from '../vt3Snapshot';
import type {FrozenRecord} from '../vt3Snapshot';
import {useLaloTheme} from './LaloTheme';
import {buildConnectedVt3} from '../connectedVt3';
import type {ConnectedDay} from '../connectedVt3';
import {reversibleFamily} from '../motorLalo';

type TopCount=3|5|10;
const localToday=()=>{
 const d=new Date();
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
export default function Vt3Parallel({date,turn,sheet,view,historical,heads,autoVersion=0,visualDays=[]}:{
 date:string;turn:Turno;sheet:DailySheet|null;view:LaloView|null;
 historical:LaloHistorical[];heads:string[];autoVersion?:number;visualDays?:ConnectedDay[];
}){
 const {colors:c}=useLaloTheme();
 const [stored,setStored]=useState<FrozenRecord|null>(null);
 const [limit,setLimit]=useState<TopCount>(3);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 // Los rankings consultados en jornadas históricas parten sólo de las
 // columnas disponibles ANTES del sorteo elegido, nunca de su resultado.
 const safeSheet=useMemo(()=>sheet?preSheetAtCut(sheet,turn,TURNOS.indexOf(turn)):null,
  [sheet,turn]);
 const safeView=useMemo(()=>safeSheet&&date?
  buildMotorLalo(safeSheet,date,turn,historical):null,[safeSheet,date,turn,historical]);
 const shadow=useMemo(()=>safeSheet&&safeView?
  buildVt3Shadow(safeSheet,date,turn,historical,safeView):null,
  [safeSheet,date,turn,historical,safeView]);
 const trial=useMemo(()=>safeView&&shadow?buildVt3Trial(safeView,shadow):null,
  [safeView,shadow]);
 const connected=useMemo(()=>safeSheet&&date?
  buildConnectedVt3(safeSheet,date,turn,[...visualDays,...historical]):null,
  [safeSheet,date,turn,visualDays,historical]);
 useEffect(()=>{
  let active=true;setStored(null);setError('');setLimit(3);
  loadFrozen(date,turn).then(x=>{if(active)setStored(x)})
   .catch(e=>{if(active)setError(String(e?.message||e))});
  return ()=>{active=false};
 },[date,turn,autoVersion]);
 const published=(sheet?.heads[turn]||[]).some(h=>/^\d{4}$/.test(h))||
  heads.some(h=>/^\d{4}$/.test(h));
 const historicalDate=date!==localToday();
 const snapshotTrial=stored?.pre.trial?.map(x=>x.family);
 const geometric=stored?.pre.geometric.map(x=>x.family)||
  shadow?.top.map(x=>x.family)||[];
 // PRE V1/V2 queda intacto: la tercera selección se muestra igualmente
 // como estudio retrospectivo, pero jamás se evalúa como pronóstico guardado.
 const newProposal=snapshotTrial||trial?.top.map(x=>x.family)||[];
 const trialIsReconstructed=!snapshotTrial?.length;
 const connectedSaved=stored?.pre.connected?.map(x=>x.family);
 const connectedFamilies=connectedSaved||connected?.top.map(x=>x.family)||[];
 const retrospective=!stored&&(historicalDate||published);
 const result=useMemo(()=>stored?evaluateFrozen(stored,heads):null,[stored,heads]);
 const freeze=async()=>{
  if(!safeView||!shadow||!trial||!connected)return;
  try{
   setBusy(true);setError('');
   // Incluye Montevideo para bloquear PRE si una sola jurisdicción ya publicó.
   const record=await saveFrozen(date,turn,safeView,shadow,sheet?.heads[turn]||heads,trial,connected);
   setStored(record);
  }catch(e:any){setError(String(e?.message||e))}
  finally{setBusy(false)}
 };
 const sections=[
  {label:'GEOMETRÍA COMPLETA',values:geometric,saved:!!stored},
  {label:'NUEVA PRUEBA',values:newProposal,saved:!!snapshotTrial?.length},
  {label:'CONFIGURACIONES CONECTADAS',values:connectedFamilies,saved:!!connectedSaved}
 ];
 const observed=heads.filter(x=>/^[0-9]{4}$/.test(x));
 const winnerHeads=new Map<string,string[]>();
 for(const head of observed){
  const f=reversibleFamily(head.slice(-3));
  winnerHeads.set(f,[...(winnerHeads.get(f)||[]),head]);
 }
 const comparison=sections.map(section=>{
  const matches=section.values.slice(0,limit).map((family,index)=>({
   family,rank:index+1,heads:winnerHeads.get(family)||[]
  })).filter(x=>x.heads.length>0);
  return {...section,matches};
 });
 return <View style={[s.surface,{backgroundColor:c.surface,borderColor:c.border}]}>
  <Text style={[s.title,{color:c.text}]}>VT3 · TRES LECTORES EXPERIMENTALES</Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Geometría Completa · Nueva Prueba · Configuraciones Conectadas. Lalo MV1
   continúa disponible en Predicción oficial. Las configuraciones exigen dos
   cabezas ganadoras independientes y trasladan figuras físicas a otra fuente PRE.
   Estos ensayos no modifican VT4 ni el ranking oficial.
  </Text>
  <View style={s.tabs}>{([3,5,10] as const).map(n=>
   <Pressable key={n} accessibilityRole="button"
    accessibilityState={{selected:limit===n}}
    onPress={()=>setLimit(n)}
    style={[s.tab,{borderColor:limit===n?c.accent:c.border,
     backgroundColor:limit===n?c.accentFill:c.card}]}>
    <Text style={{color:limit===n?c.accent:c.text,fontWeight:'900',fontSize:11}}>
     Top {n}
    </Text>
   </Pressable>)}</View>
  {observed.length?<View style={[s.resultBox,{borderColor:c.accent,backgroundColor:c.accentFill}]}>
   <Text style={[s.resultTitle,{color:c.text}]}>COINCIDENCIAS POST · TOP {limit}</Text>
   <Text style={[s.note,{color:c.subtext}]}>
    {observed.length} cabezas publicadas · Comparación por familia VT3 reversible
   </Text>
   <View style={s.summaryRow}>{comparison.map(item=>
    <View key={item.label} style={[s.summary,{backgroundColor:c.card,borderColor:c.border}]}>
     <Text style={[s.summaryName,{color:c.text}]}>{item.label}</Text>
     <Text style={[s.summaryCount,{color:item.matches.length?c.accent:c.muted}]}>
      {item.matches.length} {item.matches.length===1?'familia':'familias'}
     </Text>
     <Text style={[s.summaryMini,{color:c.subtext}]}>
      {item.matches.map(x=>'#'+x.rank+' '+x.family).join(' · ')||'Sin coincidencias'}
     </Text>
    </View>)}</View>
  </View>:<View style={[s.saved,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.note,{color:c.subtext}]}>
    POST pendiente · todavía no hay cabezas del turno para comparar.
   </Text>
  </View>}
  {comparison.map(item=><View key={item.label}
   style={[s.reader,{backgroundColor:c.card,borderColor:c.border}]}>
   <Text style={[s.readerTitle,{color:c.accent}]}>{item.label}</Text>
   {observed.length?<Text style={[s.resultText,{color:item.matches.length?c.accent:c.subtext}]}>
    {item.matches.length?'✓ '+item.matches.length+' familias coincidieron en Top '+limit:
     'Sin coincidencias en Top '+limit}
   </Text>:null}
   {item.values.slice(0,limit).map((family,i)=>{
    const hits=winnerHeads.get(family)||[];
    return <View key={family+'|'+i} style={[s.familyRow,{
     borderColor:hits.length?c.accent:c.border,
     backgroundColor:hits.length?c.accentFill:c.surface,
     borderWidth:hits.length?2:1}]}>
     <Text style={[s.family,{color:c.text}]}>
      <Text style={{color:c.muted}}>{'#'+(i+1)+'  '}</Text>{family}
     </Text>
     {hits.length?<Text style={[s.hitText,{color:c.accent}]}>
      ✓ POST · {hits.join(' · ')}
     </Text>:null}
    </View>;
   })}
   {!item.values.length?<Text style={[s.note,{color:c.muted}]}>
    {safeView?'Sin configuraciones admitidas para este corte PRE.':
     'Primero actualizá la hoja.'}
   </Text>:null}
   {stored&&!item.saved?<Text style={[s.note,{color:c.subtext}]}>
    Este lector no figuraba en la captura PRE antigua. Su lista es una
    reconstrucción de estudio; no se acredita como acierto anticipado.
   </Text>:null}
  </View>)}
  {stored?<View style={[s.saved,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.sub,{color:c.text}]}>PRE GUARDADO</Text>
   <Text style={[s.note,{color:c.subtext}]}>
    {new Date(stored.pre.createdAt).toLocaleString()} · Conservado sin sobrescribir.
   </Text>
   {trialIsReconstructed?<Text style={[s.note,{color:c.subtext}]}>
    Nueva Prueba: reconstrucción de estudio cuando no figuraba en el PRE anterior.
    No se contabiliza como acierto anticipado.
   </Text>:null}
  </View>:retrospective?<View style={[s.saved,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.sub,{color:c.text}]}>RECONSTRUCCIÓN HISTÓRICA</Text>
   <Text style={[s.note,{color:c.subtext}]}>
    Estos tres rankings se calculan con las columnas disponibles antes de {turn}.
    No hubo PRE guardado de esta fecha: sirven para estudiar, no para declarar aciertos anticipados.
   </Text>
  </View>:<View style={[s.saved,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.note,{color:c.subtext}]}>
    Vista del turno pendiente; el guardado automático se realiza al actualizar la hoja
    mientras la app está abierta.
   </Text>
  </View>}
  {!stored&&!retrospective?
   <Pressable accessibilityRole="button"
    disabled={busy||!safeView||!shadow||published||historicalDate}
    onPress={()=>{void freeze()}}
    style={[s.button,{backgroundColor:c.button,
     opacity:busy||!safeView||!shadow||published||historicalDate?0.45:1}]}>
    <Text style={{color:c.buttonText,fontWeight:'900',fontSize:12}}>
     {busy?'GUARDANDO…':'GUARDAR PRE DE HOY'}
    </Text>
   </Pressable>:null}
  {error?<Text style={[s.note,{color:c.text}]}>{error}</Text>:null}
  {stored&&result?.available?<Text style={[s.note,{color:c.subtext}]}>
   Solo los lectores presentes en el PRE guardado cuentan como cotejo prospectivo:
   Geometría {result.geometric.matches.length} ·
   Nueva Prueba {result.trial?.matches.length??'sin PRE'} ·
   Conectadas {result.connected?.matches.length??'sin PRE'}.
  </Text>:null}
 </View>;
}
const s=StyleSheet.create({
 surface:{borderWidth:1,borderRadius:13,marginTop:12,padding:13},
 title:{fontSize:14,fontWeight:'900'},note:{fontSize:11,lineHeight:17,marginTop:6},
 tabs:{flexDirection:'row',gap:7,marginTop:12},
 tab:{flex:1,borderWidth:1,borderRadius:8,alignItems:'center',paddingVertical:8},
 resultBox:{borderWidth:1,borderRadius:12,padding:11,marginTop:12,gap:7},
 resultTitle:{fontSize:15,fontWeight:'900'},
 summaryRow:{flexDirection:'row',gap:5},
 summary:{flex:1,minWidth:0,borderWidth:1,borderRadius:8,padding:6,gap:4},
 summaryName:{fontSize:9,fontWeight:'900'},
 summaryCount:{fontSize:15,fontWeight:'900'},
 summaryMini:{fontSize:9,lineHeight:13},
 reader:{borderWidth:1,borderRadius:10,padding:10,gap:6,marginTop:11},
 readerTitle:{fontSize:14,fontWeight:'900'},
 resultText:{fontSize:12,fontWeight:'900'},
 familyRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',
  gap:9,borderRadius:8,padding:9},
 family:{fontSize:14,fontWeight:'900',flexShrink:1},
 hitText:{fontSize:11,fontWeight:'900',flexShrink:1,textAlign:'right'},
 sub:{fontSize:10,fontWeight:'900'},
 saved:{borderRadius:9,padding:10,marginTop:10},
 button:{borderRadius:8,padding:12,marginTop:12,alignItems:'center'}
});
