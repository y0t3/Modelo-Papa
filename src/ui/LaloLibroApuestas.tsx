import React,{useEffect,useMemo,useState} from 'react';
import {Alert,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import type {PapaRecord} from '../papaPronostico';
import {PAPA_JURS,recordId} from '../papaPronostico';
import {JURS} from '../domain';
import {jurisdiccionesHabituales,montevideoProgramado} from '../laloJurisdicciones';
import type {BetTicket} from '../laloApuestas';
import {betEvaluation,betLinesForPre,blankBetLedger,canConfirmBet,pesosEnteros,
 receiptTotal,spentAndCollected,ticketHead,plannedSpend} from '../laloApuestas';
import type {BetLedger} from '../laloApuestas';
import {loadBetLedger,recordActualReceipt,recordRealBets} from '../laloLibroStorage';
import {useLaloTheme} from './LaloTheme';

type Props={
 date:string;turn:Turno;record?:PapaRecord;records:PapaRecord[];
 heads:CabezasDia|null;week:string;weekEnd:string;summaryOnly?:boolean;
};
const pesos=(n:number)=>'$ '+n.toLocaleString('es-AR',{maximumFractionDigits:0});
export default function LaloLibroApuestas({date,turn,record,records,heads,week,weekEnd,summaryOnly=false}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const [ledger,setLedger]=useState<BetLedger>(blankBetLedger);
 const [stake,setStake]=useState('');
 const [jurisdictions,setJurisdictions]=useState<string[]>(()=>jurisdiccionesHabituales(date,turn));
 const [chosen,setChosen]=useState<string[]>([]);
 const [receiptInputs,setReceiptInputs]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const available=useMemo(()=>record?betLinesForPre(record):[],[record]);
 useEffect(()=>{
  let active=true;
  loadBetLedger().then(value=>{if(active)setLedger(value)})
   .catch(e=>{if(active)setError(String(e?.message||e))});
  return()=>{active=false};
 },[]);
 useEffect(()=>{
  setChosen(available.map(l=>l.key));setStake('');setError('');
 },[record?.snapshot.sha256]);
 useEffect(()=>{
  setJurisdictions(jurisdiccionesHabituales(date,turn));
 },[date,turn]);
 const current=ledger.tickets.filter(t=>t.pre.date===date&&t.pre.turn===turn);
 const weekBalance=spentAndCollected(ledger,t=>t.pre.date>=week&&t.pre.date<=weekEnd);
 const count=available.filter(l=>chosen.includes(l.key)).length;
 const amount=pesosEnteros(stake);
 const cost=amount===null?null:plannedSpend(amount,count,jurisdictions.length);
 const allowed=!!record&&canConfirmBet(record,date,heads);
 const confirm=()=>{
  if(!record||!allowed||!chosen.length||!jurisdictions.length||amount===null||cost===null)return;
  Alert.alert('Registrar apuesta real',
   'A la cabeza · '+jurisdictions.length+' jurisdicción(es): '+jurisdictions.join(', ')+
   '\n'+count+' número(s) por jurisdicción · '+pesos(amount)+' por cada uno'+
   '\nGasto total: '+pesos(cost||0)+
   '\n\n¿Confirmás que esta apuesta se realizó realmente? Se guardará como comprobante local y no podrá editarse.',
   [{text:'Cancelar',style:'cancel'},{text:'Confirmar apuesta',onPress:()=>{
    setBusy(true);setError('');
    recordRealBets(record.snapshot.sha256,date,turn,jurisdictions,chosen,amount,heads)
     .then(setLedger).catch(e=>setError(String(e?.message||e)))
     .finally(()=>setBusy(false));
   }}]);
 };
 const registerReceipt=(ticket:BetTicket)=>{
  const amount=pesosEnteros(receiptInputs[ticket.pre.id]||'');
  if(amount===null){setError('Ingresá un importe entero positivo cobrado');return;}
  Alert.alert('Confirmar premio cobrado',
   'Registrar '+pesos(amount)+' como premio realmente cobrado por esta boleta. No es una estimación automática.',
   [{text:'Cancelar',style:'cancel'},{text:'Registrar cobro',onPress:()=>{
    setBusy(true);setError('');
    recordActualReceipt(ticket.pre.id,amount,heads).then(updated=>{
     setLedger(updated);
     setReceiptInputs(old=>({...old,[ticket.pre.id]:''}));
    }).catch(e=>setError(String(e?.message||e))).finally(()=>setBusy(false));
   }}]);
 };
 return <View style={[s.panel,{backgroundColor:c.surface,borderColor:c.border}]}>
  <Text style={[s.title,{color:c.text}]}>{summaryOnly?'DINERO REAL · BALANCE SEMANAL':'REGISTRO DE APUESTAS'}</Text>
  <Text style={[s.muted,{color:c.subtext}]}>
   El pronóstico no es una apuesta. El gasto se registra solamente al confirmar una boleta real.
   No se calcula un premio sin conocer cuánto se cobró.
  </Text>
  {summaryOnly?<>
   <View style={s.stats}>
    {[
     {label:'Boletas confirmadas',value:String(weekBalance.tickets)},
     {label:'Números apostados',value:String(weekBalance.lines)},
     {label:'Gastado',value:pesos(weekBalance.spentPesos)},
     {label:'Premios cobrados',value:pesos(weekBalance.collectedPesos)},
     {label:'Resultado neto',value:pesos(weekBalance.netPesos)}
    ].map(row=><View key={row.label} style={[s.stat,{backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.monetary,{color:c.text}]}>{row.value}</Text>
     <Text style={[s.small,{color:c.subtext}]}>{row.label}</Text>
    </View>)}
   </View>
   <Text style={[s.muted,{color:c.subtext}]}>
    Balance del {week} al {weekEnd}. Los premios pendientes de cobro no se suman como ingresos.
    Las apuestas y los cobros permanecen en este dispositivo.
   </Text>
  </>:<>
   <Text style={[s.subtitle,{color:c.text}]}>{date} · {turn}</Text>
   {!record?<Text style={[s.muted,{color:c.subtext}]}>
    Primero elegí los recorridos en MI PRONÓSTICO y congelá el PRE.
   </Text>:<>
    <Text style={[s.subtitle,{color:c.text}]}>Números del pronóstico</Text>
    <Text style={[s.muted,{color:c.subtext}]}>
     Se incluye «bajalo»: VT4→VT3→VT2 y VT3→VT2. Cada número literal
     se cobra y se apuesta por separado: 044 y 440 no son la misma boleta.
    </Text>
    <View style={s.lineGrid}>{available.map(line=>{
     const checked=chosen.includes(line.key);
     return <Pressable key={line.key} accessibilityRole="checkbox"
      accessibilityState={{checked,disabled:!allowed||busy}}
      disabled={!allowed||busy}
      onPress={()=>setChosen(old=>checked?old.filter(x=>x!==line.key):[...old,line.key])}
      style={[s.line,{borderColor:checked?c.accent:c.border,
       backgroundColor:checked?c.accentFill:c.card}]}>
       <Text style={{fontSize:12,fontWeight:'900',color:checked?c.accent:c.text}}>
        {checked?'☑':'□'} {line.kind.toUpperCase()} {line.value}
       </Text>
       {line.autoFrom?<Text style={[s.tiny,{color:c.subtext}]}>↓ Bajado</Text>:null}
      </Pressable>;
    })}</View>
    {allowed?<View style={s.form}>
     <Text style={[s.subtitle,{color:c.text}]}>Jurisdicciones donde se apostó</Text>
     <Text style={[s.muted,{color:c.subtext}]}>
      Por defecto se incluyen todas las que suelen sortear en este turno. Revisá excepciones o suspensiones antes de confirmar.
     </Text>
     <ScrollView horizontal contentContainerStyle={s.jurs} showsHorizontalScrollIndicator={false}>
      {JURS.map(j=>{
       const chosenJur=jurisdictions.includes(j);
       const habitual=j==='Montevideo'?montevideoProgramado(date,turn):jurisdiccionesHabituales(date,turn).includes(j);
       return <Pressable key={j} accessibilityRole="checkbox"
        accessibilityState={{checked:chosenJur}}
        onPress={()=>setJurisdictions(old=>chosenJur?old.filter(x=>x!==j):JURS.filter(x=>x===j||old.includes(x)))}
        style={[s.jur,{borderColor:chosenJur?c.accent:c.border,
         backgroundColor:chosenJur?c.accentFill:c.card}]}>
        <Text style={{color:chosenJur?c.accent:c.text,fontSize:10,fontWeight:'900'}}>
         {chosenJur?'☑':'□'} {j}{j==='Montevideo'?' (UY)':''}
        </Text>
        {j==='Montevideo'?<Text style={{color:c.subtext,fontSize:9}}>
         {habitual?'15/21 h según turno':'Sin sorteo habitual'}
        </Text>:null}
       </Pressable>;
      })}
     </ScrollView>
     <Text style={[s.subtitle,{color:c.text}]}>Importe por número (pesos enteros)</Text>
     <TextInput value={stake} onChangeText={setStake}
      accessibilityLabel="Importe igual para cada número de dos, tres y cuatro cifras"
      keyboardType="number-pad" placeholder="Ej.: 1000"
      placeholderTextColor={c.muted}
      style={[s.input,{backgroundColor:c.card,borderColor:c.border,color:c.text}]}/>
     <View style={[s.total,{backgroundColor:c.surfaceAlt}]}>
      <Text style={[s.small,{color:c.subtext}]}>{count} números × {jurisdictions.length} jurisdicciones × {amount===null?'—':pesos(amount)} cada uno</Text>
      <Text style={[s.monetary,{color:c.text}]}>{cost===null?'Importe pendiente':pesos(cost)}</Text>
     </View>
     <Text style={[s.muted,{color:c.subtext}]}>
      Por ahora, el registro automático verifica únicamente apuestas a la cabeza.
      Para 5, 10 o 20 posiciones se necesitan las extracciones completas y reglas de premios.
     </Text>
     <Pressable accessibilityRole="button" disabled={busy||!count||!jurisdictions.length||cost===null}
      onPress={confirm}
      style={[s.button,{backgroundColor:c.button,opacity:busy||!count||!jurisdictions.length||cost===null?0.45:1}]}>
      <Text style={{color:c.buttonText,fontWeight:'900',textAlign:'center'}}>
       {busy?'GUARDANDO…':'CONFIRMAR APUESTAS EN '+jurisdictions.length+' JURISDICCIÓN(ES)'}
      </Text>
     </Pressable>
    </View>:<Text style={[s.muted,{color:c.subtext}]}>
     Este turno no admite nuevas apuestas: ya tiene resultados o no corresponde a hoy.
     Las boletas registradas siguen visibles.
    </Text>}
   </>}
   <Text style={[s.subtitle,{color:c.text}]}>BOLETAS CONFIRMADAS · {current.length}</Text>
   {current.length===0?<Text style={[s.muted,{color:c.subtext}]}>Todavía no hay dinero apostado registrado en este turno.</Text>:null}
   {current.map(ticket=>{
    const b=ticket.pre;
    const evalResult=betEvaluation(ticket,ticketHead(ticket,records,heads));
    const received=receiptTotal(ledger,b.id);
    return <View key={b.id} style={[s.ticket,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.subtitle,{color:c.text}]}>{b.jurisdiction} · A la cabeza · {b.lines.length} números</Text>
     <Text style={[s.small,{color:c.text}]}>
      {b.lines.map(l=>l.value+' ('+l.kind.toUpperCase()+')').join(' · ')}
     </Text>
     <Text style={[s.small,{color:c.subtext}]}>
      {pesos(b.stakePerLinePesos)} por número · Gasto {pesos(b.totalPesos)}
     </Text>
     <Text style={[s.small,{color:c.text}]}>
      {evalResult.status==='pendiente'?'Resultado pendiente':evalResult.status==='sin_coincidencia'?
       'Cabeza '+evalResult.head+' · sin coincidencias':
       'Cabeza '+evalResult.head+' · COINCIDEN: '+evalResult.matched.map(l=>l.kind.toUpperCase()+' '+l.value).join(', ')}
     </Text>
     <Text style={[s.small,{color:c.text}]}>Cobrado hasta ahora: {pesos(received)}</Text>
     {evalResult.status==='coincidencia'?<View style={s.receipt}>
      <Text style={[s.small,{color:c.subtext}]}>Registrar premio efectivamente cobrado</Text>
      <View style={s.receiptRow}>
       <TextInput keyboardType="number-pad" placeholder="Importe cobrado"
        value={receiptInputs[b.id]||''}
        onChangeText={v=>setReceiptInputs(old=>({...old,[b.id]:v}))}
        placeholderTextColor={c.muted} style={[s.input,{flex:1,color:c.text,backgroundColor:c.card,borderColor:c.border}]}/>
       <Pressable accessibilityRole="button" disabled={busy}
        onPress={()=>registerReceipt(ticket)}
        style={[s.smallButton,{backgroundColor:c.button,opacity:busy?0.45:1}]}>
        <Text style={{fontSize:11,fontWeight:'900',color:c.buttonText}}>Guardar cobro</Text>
       </Pressable>
      </View>
     </View>:null}
     <Text style={[s.tiny,{color:c.subtext}]}>Registrada: {b.createdAt} · sello local {ticket.sha256.slice(0,12)}…</Text>
    </View>;
   })}
  </>}
  {error?<Text style={[s.error,{color:c.text,backgroundColor:c.callout}]}>{error}</Text>:null}
 </View>;
}
const s=StyleSheet.create({
 panel:{marginTop:10,borderRadius:12,borderWidth:1,padding:12,gap:10},
 title:{fontWeight:'900',fontSize:16},subtitle:{fontWeight:'900',fontSize:12},
 muted:{fontSize:11,lineHeight:17},small:{fontSize:11,lineHeight:17},tiny:{fontSize:9,lineHeight:14},
 lineGrid:{flexDirection:'row',flexWrap:'wrap',gap:7},
 line:{borderWidth:1,borderRadius:8,paddingHorizontal:10,paddingVertical:9,gap:2,minWidth:92},
 form:{gap:9,paddingTop:8},jurs:{gap:6,paddingVertical:2},
 jur:{borderWidth:1,borderRadius:15,paddingHorizontal:10,paddingVertical:9},
 input:{borderWidth:1,borderRadius:8,paddingHorizontal:11,paddingVertical:9,minHeight:40,fontSize:13},
 total:{padding:11,borderRadius:9,gap:4},monetary:{fontWeight:'900',fontSize:16},
 button:{padding:13,borderRadius:9},smallButton:{paddingHorizontal:12,paddingVertical:12,borderRadius:8},
 ticket:{padding:10,borderWidth:1,borderRadius:9,gap:6},
 receipt:{gap:7,marginTop:5},receiptRow:{flexDirection:'row',alignItems:'center',gap:7},
 stats:{flexDirection:'row',flexWrap:'wrap',gap:8},
 stat:{width:'48%',padding:10,borderRadius:9,gap:5},
 error:{padding:10,borderRadius:8,fontSize:11}
});
