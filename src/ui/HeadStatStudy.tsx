import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView} from 'react-native';
import type {Turno} from '../domain';
import type {HistoricHeadsDay} from '../historicalHeadFrequency';
import type {StatMode,StatScope,StatNumber} from '../headStats';
import type {CabezasDia} from '../domain';
import type {Top6Snapshot} from '../headStatJournal';
import {hitsForTop6,lastStatSnapshots,statKey} from '../headStatJournal';
import {STAT_JURS,headStats,STAT_MODE_LABELS} from '../headStats';
import HeadStatSwitch from './HeadStatSwitch';
import {useLaloTheme} from './LaloTheme';

const dmy=(date:string|null)=>date?
 date.slice(8,10)+'/'+date.slice(5,7)+'/'+date.slice(0,4):'No registrada';
export default function HeadStatStudy({date,turn,history,historyBusy,
 historyProgress,mode,onMode,data,journal}:{date:string;turn:Turno;
 history:HistoricHeadsDay[];historyBusy:boolean;historyProgress:number;
 mode:StatMode;onMode:(mode:StatMode)=>void;
 data:CabezasDia|null;journal:Top6Snapshot[]}){
 const {colors:c}=useLaloTheme();
 const [window,setWindow]=useState<60|110>(110);
 const [scope,setScope]=useState<StatScope>('todas');
 const [selected,setSelected]=useState<string|null>(null);
 const [allOpen,setAllOpen]=useState(false);
 const [journalOpen,setJournalOpen]=useState(false);
 const snapshot=journal.find(x=>x.key===statKey(date,turn))||null;
 const savedHits=snapshot?hitsForTop6(snapshot,mode):[];
 const recent=lastStatSnapshots(journal).slice(0,journalOpen?45:8);
 const stats=useMemo(()=>headStats(history,date,turn,window,mode,scope),
  [history,date,turn,window,mode,scope]);
 const focus:StatNumber|null=(selected?stats.all.find(x=>x.value===selected):null)||null;
 const visible=stats.ranked.slice(0,allOpen?100:12);
 const local=useMemo(()=>STAT_JURS.map(j=>({
  jur:j,...headStats(history,date,turn,window,'atrasados',j)
 })),[history,date,turn,window]);
 const modeValue=(item:StatNumber)=>mode==='atrasados'?
  item.delay+' jornadas sin salir':mode==='recientes'?
  'Última: '+dmy(item.lastDate):
  item.count+' '+(item.count===1?'aparición':'apariciones');
 const explain=mode==='atrasados'?'Se ordena por la última aparición conocida. Los que no aparecen en todo el período tienen atraso desconocido y se muestran aparte.':
  mode==='frios'?'Los que menos veces aparecieron. Los que tienen cero comparten el mismo empate.':
  mode==='calientes'?'Los que más veces aparecieron en el período. No significa que tengan mayores posibilidades.':
  'Los que aparecieron más cerca de la fecha elegida.';
 return <View style={{gap:12}}>
  <Text style={{fontWeight:'900',fontSize:15,color:c.text}}>Resultados reales · 2 cifras</Text>
  <Text style={{color:c.subtext,fontSize:11,lineHeight:18}}>
   {turn} · datos anteriores al {dmy(date)}. Las listas no consultan las hojas ni
   los motores de Lalo. Ningún puesto garantiza resultados.
  </Text>
  <HeadStatSwitch mode={mode} onMode={onMode}/>
  <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
   <Text style={{color:c.text,fontWeight:'800',fontSize:12}}>Mirar las últimas</Text>
   {([60,110] as const).map(w=><Pressable key={w} onPress={()=>{
    setWindow(w);setSelected(null);setAllOpen(false);
   }} style={{paddingHorizontal:11,paddingVertical:9,borderRadius:9,borderWidth:1,
    borderColor:window===w?c.accent:c.border,
    backgroundColor:window===w?c.accentFill:c.card}}>
    <Text style={{color:window===w?c.accent:c.text,fontWeight:'900',
     fontSize:11}}>{w} jornadas</Text>
   </Pressable>)}
  </View>
  <Text style={{color:c.subtext,fontSize:11}}>
   {historyBusy?'Cargando resultados: '+historyProgress+' de 110 fechas…':
    stats.days+' jornadas completas · '+stats.heads+' cabezas revisadas'}
   {!historyBusy&&stats.days<window?' · historial disponible incompleto':''}
  </Text>
  <Text style={{color:c.text,fontSize:12,fontWeight:'900'}}>¿Dónde querés mirar?</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator
   contentContainerStyle={{gap:6,paddingVertical:3}}>
   {(['todas',...STAT_JURS] as StatScope[]).map(j=><Pressable key={j}
    accessibilityRole="button" accessibilityState={{selected:scope===j}}
    onPress={()=>{setScope(j);setSelected(null);setAllOpen(false);}}
    style={{paddingVertical:9,paddingHorizontal:11,borderRadius:9,borderWidth:1,
     borderColor:scope===j?c.accent:c.border,
     backgroundColor:scope===j?c.accentFill:c.card}}>
    <Text style={{fontSize:11,fontWeight:'900',color:scope===j?c.accent:c.text}}>
     {j==='todas'?'Las cinco':j}
    </Text>
   </Pressable>)}
  </ScrollView>
  <Text style={{fontSize:11,color:c.subtext,lineHeight:17}}>{explain}</Text>
  {snapshot?<View style={{borderWidth:1,borderColor:c.accent,
   borderRadius:11,padding:10,gap:5,backgroundColor:c.card}}>
   <Text style={{fontSize:12,fontWeight:'900',color:c.accent}}>
    Top6 guardado antes de publicarse las cabezas
   </Text>
   <Text style={{fontSize:11,color:c.subtext}}>
    {snapshot.date} · {snapshot.turn} · {snapshot.results.length} de 5 cabezas.
    {' '}Las listas guardadas no se reordenan después.
   </Text>
   <Text style={{fontSize:12,fontWeight:'900',
    color:savedHits.length?'#57D5A5':c.text}}>
    {savedHits.length?'✓ '+savedHits.length+' coincidencia(s) '+STAT_MODE_LABELS[mode]:
     snapshot.results.length?'Sin coincidencias '+STAT_MODE_LABELS[mode]:
     'Aún no hay resultados publicados'}
   </Text>
   {savedHits.map((hit,i)=><Text key={i}
    style={{fontSize:11,color:c.text}}>
    #{hit.rank} · {hit.value} · {hit.jur} · cabeza {hit.head}
   </Text>)}
  </View>:null}
  {historyBusy?<Text style={{color:c.subtext,fontSize:12}}>
   Leyendo las fechas anteriores. Podés seguir usando la app mientras tanto.
  </Text>:stats.days<12?<Text style={{color:c.subtext,fontSize:12}}>
   Faltan jornadas completas para una comparación útil.
  </Text>:<>
   <Text style={{fontWeight:'900',fontSize:13,color:c.text}}>
    {STAT_MODE_LABELS[mode]} · {scope==='todas'?'las cinco':scope}
   </Text>
   <View style={{gap:5}}>
    {visible.map((item,i)=><Pressable key={item.value}
     accessibilityRole="button" onPress={()=>setSelected(v=>
      v===item.value?null:item.value)}
     style={{padding:10,borderRadius:10,borderWidth:1,
      borderColor:selected===item.value?c.accent:c.border,
      backgroundColor:selected===item.value?c.accentFill:c.card}}>
     <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
      <Text style={{color:c.subtext,fontSize:11,width:25}}>#{i+1}</Text>
      <Text style={{color:c.accent,fontSize:22,fontWeight:'900',width:44}}>
       {item.value}
      </Text>
      <View style={{flex:1,gap:3}}>
       <Text style={{color:c.text,fontWeight:'800',fontSize:11}}>
        {modeValue(item)}
       </Text>
       <Text style={{color:c.subtext,fontSize:10}}>
        {item.count} veces · última: {dmy(item.lastDate)}
       </Text>
      </View>
      <Text style={{color:c.accent,fontSize:17}}>
       {selected===item.value?'⌄':'›'}
      </Text>
     </View>
     {selected===item.value?<View style={{marginTop:9,gap:6}}>
      <Text style={{color:c.subtext,fontSize:11,lineHeight:17}}>
       {item.delay===null?
        'No apareció en las '+stats.days+' jornadas disponibles. Su atraso real puede ser mayor.':
        'Última aparición: '+dmy(item.lastDate)+' · '+item.delay+
        ' jornadas completas sin salir desde entonces.'}
      </Text>
      <Text style={{color:c.subtext,fontSize:11}}>
       Apareció en {item.daysSeen} jornadas distintas.
      </Text>
      {item.events.slice(-5).reverse().map((e,j)=><Text key={e.date+e.jur+j}
       style={{color:c.text,fontSize:11}}>
       {dmy(e.date)} · {e.jur} · cabeza {e.head}
      </Text>)}
     </View>:null}
    </Pressable>)}
   </View>
   {stats.ranked.length>12?<Pressable accessibilityRole="button"
    onPress={()=>setAllOpen(x=>!x)} style={{borderWidth:1,
     borderColor:c.accent,borderRadius:9,padding:11,alignItems:'center'}}>
    <Text style={{fontWeight:'900',fontSize:11,color:c.accent}}>
     {allOpen?'Mostrar menos':'Ver todos los números de esta lista'}
    </Text>
   </Pressable>:null}
   {stats.unseen>0?<Text style={{color:c.subtext,fontSize:11,lineHeight:17}}>
    {stats.unseen} números no aparecieron en el período seleccionado.
    No se puede conocer su atraso exacto sin ampliar la historia.
    {mode==='atrasados'?' Por eso no se inventa un puesto para ellos.':''}
   </Text>:null}
   <View style={{borderTopWidth:1,borderTopColor:c.border,paddingTop:11,gap:8}}>
    <Text style={{fontSize:13,fontWeight:'900',color:c.text}}>
     Comparar atrasos por jurisdicción
    </Text>
    <Text style={{color:c.subtext,fontSize:11,lineHeight:17}}>
     Los tres atrasados conocidos en cada jurisdicción, calculados con las
     mismas {window} jornadas del {turn}.
    </Text>
    {local.map(item=><View key={item.jur} style={{padding:9,borderRadius:8,
     backgroundColor:c.surfaceAlt,gap:4}}>
     <Text style={{color:c.text,fontWeight:'900',fontSize:11}}>{item.jur}</Text>
     <Text style={{color:c.subtext,fontSize:11}}>
      {item.top.slice(0,3).map(x=>x.value+' ('+x.delay+' jornadas)').join(' · ')||'Sin registros'}
     </Text>
    </View>)}
   </View>
  </>}
  <View style={{borderTopWidth:1,borderTopColor:c.border,paddingTop:12,gap:8}}>
   <Text style={{fontSize:15,fontWeight:'900',color:c.text}}>
    Historial de coincidencias guardadas
   </Text>
   <Text style={{fontSize:11,lineHeight:17,color:c.subtext}}>
    Cada lista se guardó sin cabezas publicadas para ese turno. Se comparan
    las terminaciones exactas con el primer premio de las cinco jurisdicciones.
    Las consultas retrospectivas sin lista previa no se anotan como aciertos.
   </Text>
   {recent.length?recent.map(row=>{
    const found=hitsForTop6(row,mode);
    return <View key={row.key} style={{padding:10,borderRadius:9,
     borderWidth:1,borderColor:found.length?'#57D5A5':c.border,
     backgroundColor:c.card,gap:4}}>
     <Text style={{fontSize:11,fontWeight:'900',color:c.text}}>
      {dmy(row.date)} · {row.turn} · {row.results.length}/5 cabezas
     </Text>
     <Text style={{fontSize:11,color:found.length?'#57D5A5':c.subtext}}>
      {found.length?'✓ '+found.length+' coincidencia(s)':'Sin coincidencias'} ·
      {' '+STAT_MODE_LABELS[mode]}
     </Text>
     {found.slice(0,6).map((hit,i)=><Text key={i}
      style={{fontSize:10,color:c.text}}>
      #{hit.rank} · {hit.value} · {hit.jur}: {hit.head}
     </Text>)}
    </View>;
   }):<Text style={{fontSize:11,color:c.subtext}}>
    Todavía no hay Top6 guardados con resultados para comparar.
    Los registros empezarán a acumularse cuando se consulten turnos pendientes.
   </Text>}
   {journal.length>8?<Pressable onPress={()=>setJournalOpen(x=>!x)}
    style={{borderWidth:1,borderColor:c.accent,borderRadius:9,padding:11}}>
    <Text style={{color:c.accent,fontWeight:'900',fontSize:11,textAlign:'center'}}>
     {journalOpen?'Mostrar menos registros':'Ver más registros'}
    </Text>
   </Pressable>:null}
  </View>
  <Text style={{color:c.muted,fontSize:10,lineHeight:16}}>
   Se cuentan solamente jornadas con las cinco cabezas publicadas.
   Una terminación es exacta: 37 y 73 son números diferentes.
   Las rachas y frecuencias pasadas no demuestran una ventaja para futuros sorteos.
  </Text>
 </View>;
}
