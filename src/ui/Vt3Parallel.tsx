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

type TopCount=3|5|10;
const localToday=()=>{
 const d=new Date();
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
export default function Vt3Parallel({date,turn,sheet,view,historical,heads,autoVersion=0}:{
 date:string;turn:Turno;sheet:DailySheet|null;view:LaloView|null;
 historical:LaloHistorical[];heads:string[];autoVersion?:number;
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
 const official=stored?.pre.official.map(x=>x.family)||
  safeView?.ranks.vt3.slice(0,10).map(x=>x.family)||[];
 const geometric=stored?.pre.geometric.map(x=>x.family)||
  shadow?.top.map(x=>x.family)||[];
 // PRE V1/V2 queda intacto: la tercera selección se muestra igualmente
 // como estudio retrospectivo, pero jamás se evalúa como pronóstico guardado.
 const newProposal=snapshotTrial||trial?.top.map(x=>x.family)||[];
 const trialIsReconstructed=!snapshotTrial?.length;
 const retrospective=!stored&&(historicalDate||published);
 const result=useMemo(()=>stored?evaluateFrozen(stored,heads):null,[stored,heads]);
 const freeze=async()=>{
  if(!safeView||!shadow||!trial)return;
  try{
   setBusy(true);setError('');
   // Incluye Montevideo para bloquear PRE si una sola jurisdicción ya publicó.
   const record=await saveFrozen(date,turn,safeView,shadow,sheet?.heads[turn]||heads,trial);
   setStored(record);
  }catch(e:any){setError(String(e?.message||e))}
  finally{setBusy(false)}
 };
 const sections=[
  {label:'LALO',values:official},
  {label:'GEOMETRÍA',values:geometric},
  {label:'NUEVA PRUEBA',values:newProposal}
 ];
 return <View style={[s.surface,{backgroundColor:c.surface,borderColor:c.border}]}>
  <Text style={[s.title,{color:c.text}]}>VT3 · COMPARACIÓN DE TRES LECTORES</Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Lalo sigue siendo el oficial. Nueva Prueba toma dos familias de Geometría y,
   cuando aparece una familia nueva válida del día, la incluye en el tercer puesto.
   Ninguna prueba cambia VT4.
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
  <View style={s.columns}>
   {sections.map(item=>
    <View key={item.label} style={[s.column,{borderColor:c.border,backgroundColor:c.card}]}>
     <Text style={[s.sub,{color:c.accent}]}>{item.label}</Text>
     {item.values.slice(0,limit).map((family,i)=>
      <Text key={family+'|'+i} style={[s.family,{color:c.text}]}>
       <Text style={{color:c.muted}}>{'#'+(i+1)+' '}</Text>{family}
      </Text>)}
     {!item.values.length?<Text style={[s.note,{color:c.muted}]}>
      {safeView?'Sin familias para este lector.':'Primero actualizá la hoja.'}
     </Text>:null}
     {item.label==='NUEVA PRUEBA'&&snapshotTrial?.length===3&&limit>3?
      <Text style={[s.note,{color:c.subtext}]}>
       Este PRE anterior guardó sólo Top3; no se le agregan puestos después.
      </Text>:null}
    </View>)}
  </View>
  {stored?<View style={[s.saved,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.sub,{color:c.text}]}>PRE GUARDADO</Text>
   <Text style={[s.note,{color:c.subtext}]}>
    {new Date(stored.pre.createdAt).toLocaleString()} · Conservado sin sobrescribir.
   </Text>
   {trialIsReconstructed?<Text style={[s.note,{color:c.subtext}]}>
    Nueva Prueba: reconstrucción de estudio. No formó parte de este PRE antiguo
    y no se contará como acierto anticipado.
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
  {stored&&result?.available?<View style={[s.saved,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.sub,{color:c.text}]}>RESULTADOS COMPARADOS CON EL PRE GUARDADO</Text>
   {([{label:'Lalo',value:result.official},{label:'Geometría',value:result.geometric},
     ...(result.trial?[{label:'Nueva prueba',value:result.trial}]:[])]).map(x=>
    <Text key={x.label} style={[s.note,{color:c.text}]}>
     {x.label}: Top3 {x.value.top3?'Sí':'No'} · Top5 {x.value.top5?'Sí':'No'} ·
     Top10 {x.value.top10?'Sí':'No'}
    </Text>)}
  </View>:null}
 </View>;
}
const s=StyleSheet.create({
 surface:{borderWidth:1,borderRadius:13,marginTop:12,padding:13},
 title:{fontSize:14,fontWeight:'900'},note:{fontSize:11,lineHeight:17,marginTop:6},
 tabs:{flexDirection:'row',gap:7,marginTop:12},
 tab:{flex:1,borderWidth:1,borderRadius:8,alignItems:'center',paddingVertical:8},
 columns:{flexDirection:'row',gap:5,marginTop:12},
 column:{flex:1,borderWidth:1,borderRadius:9,padding:5,minWidth:0},
 sub:{fontSize:10,fontWeight:'900'},family:{fontSize:10,marginTop:6,fontWeight:'800'},
 saved:{borderRadius:9,padding:10,marginTop:10},
 button:{borderRadius:8,padding:12,marginTop:12,alignItems:'center'}
});
