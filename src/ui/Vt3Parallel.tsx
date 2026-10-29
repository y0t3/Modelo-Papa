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
import Vt2ExperimentalPanel from './Vt2ExperimentalPanel';
import FormasPrimeroPanel from './FormasPrimeroPanel';
import FigureRescueAuditPanel from './FigureRescueAuditPanel';
import {buildFormFirstMotor,buildFormFirstVt2} from '../motorFormasPrimero';
import type {InfoVisualDay} from '../infoTurnHistory';

const localToday=()=>{
 const d=new Date();
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
export default function Vt3Parallel({date,turn,sheet,view,historical,heads,publishedHeads=[],autoVersion=0,visualDays=[]}:{
 date:string;turn:Turno;sheet:DailySheet|null;view:LaloView|null;
 historical:LaloHistorical[];heads:string[];publishedHeads?:{jur:string;head:string}[];
 autoVersion?:number;visualDays?:InfoVisualDay[];
}){
 const {colors:c,kinds}=useLaloTheme();
 const [activeLength,setActiveLength]=useState<'vt2'|'vt3'>('vt2');
 const [activeReader,setActiveReader]=useState<'audit'|'forms'|'other'>('audit');
 const [stored,setStored]=useState<FrozenRecord|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 // Los rankings consultados en jornadas históricas parten sólo de las
 // columnas disponibles ANTES del sorteo elegido, nunca de su resultado.
 const safeSheet=useMemo(()=>sheet?preSheetAtCut(sheet,turn,TURNOS.indexOf(turn)):null,
  [sheet,turn]);
 const safeView=useMemo(()=>safeSheet&&date?
  buildMotorLalo(safeSheet,date,turn,historical):null,[safeSheet,date,turn,historical]);
 const formsFirst=useMemo(()=>safeSheet&&date?
  buildFormFirstMotor(safeSheet,date,turn,visualDays.filter(d=>d.date<date)):null,
  [safeSheet,date,turn,visualDays]);
 const formsFirstVt2=useMemo(()=>safeSheet&&date?
  buildFormFirstVt2(safeSheet,date,turn,visualDays.filter(d=>d.date<date)):null,
  [safeSheet,date,turn,visualDays]);
 const shadow=useMemo(()=>safeSheet&&safeView?
  buildVt3Shadow(safeSheet,date,turn,historical,safeView):null,
  [safeSheet,date,turn,historical,safeView]);
 const trial=useMemo(()=>safeView&&shadow?buildVt3Trial(safeView,shadow):null,
  [safeView,shadow]);
 const connected=useMemo(()=>safeSheet&&date?
  buildConnectedVt3(safeSheet,date,turn,[...visualDays,...historical]):null,
  [safeSheet,date,turn,visualDays,historical]);
 useEffect(()=>{
  let active=true;setStored(null);setError('');
  loadFrozen(date,turn).then(x=>{if(active)setStored(x)})
   .catch(e=>{if(active)setError(String(e?.message||e))});
  return ()=>{active=false};
 },[date,turn,autoVersion]);
 const published=(sheet?.heads[turn]||[]).some(h=>/^\d{4}$/.test(h))||
  heads.some(h=>/^\d{4}$/.test(h));
 const historicalDate=date!==localToday();
 const geometric=stored?.pre.geometric.map(x=>x.family)||
  shadow?.top.map(x=>x.family)||[];
 // Nueva Prueba permanece en los PRE guardados y en el comparador histórico,
 // pero no se muestra como motor independiente de consulta.
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
  {label:'CONFIGURACIONES CONECTADAS',values:connectedFamilies,saved:!!connectedSaved}
 ];
 const observed=heads.filter(x=>/^[0-9]{4}$/.test(x));
 const winnerHeads=new Map<string,string[]>();
 for(const head of observed){
  const f=reversibleFamily(head.slice(-3));
  winnerHeads.set(f,[...(winnerHeads.get(f)||[]),head]);
 }
 const comparison=sections.map(section=>{
  const matches=section.values.slice(0,10).map((family,index)=>({
   family,rank:index+1,heads:winnerHeads.get(family)||[]
  })).filter(x=>x.heads.length>0);
  return {...section,matches};
 });
 return <View style={[s.surface,{backgroundColor:c.surface,borderColor:c.border}]}>
  <Text style={[s.title,{color:c.text}]}>Laboratorio de Lalo</Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Elegí dos o tres cifras. Mirá qué formas encontró cada prueba y
   qué cabezas anteriores las respaldan.
  </Text>
  <View style={{flexDirection:'row',gap:8,marginTop:10}}>
   {(['vt2','vt3'] as const).map(kind=><Pressable key={kind}
    accessibilityRole="tab" accessibilityState={{selected:activeLength===kind}}
    onPress={()=>{setActiveLength(kind);setActiveReader('audit')}}
    style={{flex:1,paddingVertical:12,borderRadius:10,borderWidth:2,
     alignItems:'center',backgroundColor:activeLength===kind?kinds[kind].fill:c.card,
     borderColor:activeLength===kind?kinds[kind].line:c.border}}>
    <Text style={{fontWeight:'900',fontSize:15,
     color:activeLength===kind?kinds[kind].text:c.text}}>
     {kind==='vt2'?'VT2 · Dos cifras':'VT3 · Tres cifras'}
    </Text>
   </Pressable>)}
  </View>
  <View style={{flexDirection:'row',gap:5,marginTop:8}}>
   {([['audit','Figuras'],['forms','Formas primero'],
    ['other','Otras pruebas']] as const).map(([id,label])=><Pressable
    key={id} accessibilityRole="tab"
    accessibilityState={{selected:activeReader===id}}
    onPress={()=>setActiveReader(id)}
    style={{flex:1,paddingVertical:9,borderRadius:8,borderWidth:1,
     alignItems:'center',backgroundColor:activeReader===id?c.accentFill:c.card,
     borderColor:activeReader===id?c.accent:c.border}}>
    <Text style={{fontSize:11,fontWeight:'800',color:c.text}}>{label}</Text>
   </Pressable>)}
  </View>
  {activeLength==='vt2'?<>
   {activeReader==='audit'?<FigureRescueAuditPanel date={date} turn={turn} pre={safeSheet}
    forms={formsFirstVt2} lalo={safeView} days={visualDays}
    published={publishedHeads} kind="vt2"/>:null}
   {activeReader==='forms'?<FormasPrimeroPanel date={date} turn={turn} pre={safeSheet}
    days={visualDays} lalo={safeView} heads={publishedHeads.map(x=>x.head)}
    kind="vt2"/>:null}
   {activeReader==='other'?<Vt2ExperimentalPanel date={date} turn={turn} sheet={safeSheet}
    history={historical} days={visualDays} heads={heads}
    publishedHeads={publishedHeads}/>:null}
  </>:<>
   {activeReader==='audit'?<FigureRescueAuditPanel date={date} turn={turn} pre={safeSheet}
    forms={formsFirst} lalo={safeView} days={visualDays}
    published={publishedHeads} kind="vt3"/>:null}
   {activeReader==='forms'?<FormasPrimeroPanel date={date} turn={turn} pre={safeSheet}
    days={visualDays} lalo={safeView} heads={heads} kind="vt3"/>:null}
  {activeReader==='other'?<>
  <Text style={[s.title,{color:c.text,marginTop:12}]}>Otras pruebas de tres cifras</Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Dos maneras más de seguir figuras que tuvieron antecedentes ganadores.
   No cambian los candidatos oficiales de Lalo.
  </Text>
  {observed.length?<View style={[s.resultBox,{borderColor:c.accent,backgroundColor:c.accentFill}]}>
   <Text style={[s.resultTitle,{color:c.text}]}>COINCIDENCIAS POST · TOP10</Text>
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
    {item.matches.length?'✓ '+item.matches.length+' familias coincidieron en Top10':
     'Sin coincidencias en Top10'}
   </Text>:null}
   {item.values.slice(0,10).map((family,i)=>{
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
  </View>:retrospective?<View style={[s.saved,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.sub,{color:c.text}]}>RECONSTRUCCIÓN HISTÓRICA</Text>
   <Text style={[s.note,{color:c.subtext}]}>
    Estos dos rankings se calculan con las columnas disponibles antes de {turn}.
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
   Conectadas {result.connected?.matches.length??'sin PRE'}.
  </Text>:null}
  </>:null}
  </>}
 </View>;
}
const s=StyleSheet.create({
 surface:{borderWidth:1,borderRadius:13,marginTop:12,padding:13},
 title:{fontSize:14,fontWeight:'900'},note:{fontSize:11,lineHeight:17,marginTop:6},
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
