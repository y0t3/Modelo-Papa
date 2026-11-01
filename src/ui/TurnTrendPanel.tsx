import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {Turno} from '../domain';
import {TURNOS} from '../domain';
import {useLaloTheme} from './LaloTheme';
import TurnStrip from './TurnStrip';
import {
 HALF_COLORS,TREND_COLORS,TREND_ENGINES,TREND_LABELS,
 TREND_WINDOW,halfPercent,hits,
 isRetrospective
} from '../trendHistoryVt2';
import type {TrendEngine} from '../trendHistoryVt2';
import {snapshotShares} from '../trendVt2Journal';
import type {TrendPeriod,TrendSnapshot} from '../trendVt2Journal';

type Props={
 date:string;turn:Turno;selectedEngine:TrendEngine;
 onEngineChange:(value:TrendEngine)=>void;
 compact?:boolean;onDetails?:()=>void;onTurnChange?:(turn:Turno)=>void;
 trendSnapshot:TrendSnapshot;onPeriodChange?:(period:TrendPeriod)=>void
};
type Slice={key:string;label:string;amount:number;color:string};
function StackedBar({slices,height=29}:{slices:Slice[];height?:number}){
 const parts=slices.filter(x=>x.amount>0);
 if(!parts.length)return <View style={[s.emptyBar,{height}]}>
  <Text style={s.emptyBarText}>Sin datos comparables</Text>
 </View>;
 return <View style={[s.bar,{height}]}>
  {parts.map(p=><View key={p.key} style={[s.barPart,{flex:p.amount,backgroundColor:p.color}]}>
   {p.amount>=16?<Text style={[s.barText,{fontSize:height>=30?12:10}]}>
    {p.amount}%
   </Text>:null}
  </View>)}
 </View>;
}
const HalfBar=({record}:{record:{first:number;last:number;cuts:number}})=>{
 const pct=halfPercent(record);
 return pct?<StackedBar slices={[
  {key:'first',label:'1–5',amount:pct[0],color:HALF_COLORS.first},
  {key:'last',label:'6–10',amount:pct[1],color:HALF_COLORS.last}
 ]}/>:<Text style={{color:'#A8BCD3',fontSize:11}}>
  Sin un Top10 completo para este turno.
 </Text>;
};
export default function TurnTrendPanel({date,turn,selectedEngine,onEngineChange,
 compact=false,onDetails,onTurnChange,trendSnapshot,onPeriodChange}:Props){
 const {colors:c}=useLaloTheme();
 const table=trendSnapshot.totals;
 const record=table[turn][selectedEngine];
 const pct=halfPercent(record);
 const portions=snapshotShares(trendSnapshot,turn);
 const newest=trendSnapshot.latestDate.split('-').reverse().join('/').slice(0,8);
 const periodLabel=trendSnapshot.period==='acumulado'?
  'Histórico + seguimiento':'Últimas '+trendSnapshot.recentDateCount+' jornadas registradas';
 return <View style={[s.panel,{backgroundColor:c.surface,
  borderColor:compact?c.accent:c.border}]}>
  <View style={s.head}>
   <View style={{flex:1,gap:3}}>
    <Text style={[s.overline,{color:c.accent}]}>UN VISTAZO AL HISTÓRICO · VT2</Text>
    <Text style={[s.title,{color:c.text}]}>Dónde mirar hoy</Text>
    <Text style={[s.sub,{color:c.subtext}]}>{turn} · {periodLabel}</Text>
   </View>
   <View style={[s.infoTag,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
    <Text style={{color:c.subtext,fontSize:10,fontWeight:'800'}}>Datos hasta</Text>
    <Text style={{color:c.text,fontSize:12,fontWeight:'900'}}>{newest}</Text>
   </View>
  </View>
  {isRetrospective(date)?<View style={[s.warning,{borderColor:c.border}]}>
   <Text style={{color:c.subtext,fontSize:10,lineHeight:15}}>
    Fecha histórica seleccionada: este estudio se calculó después de ese día.
    No representa información disponible antes de aquel sorteo.
   </Text>
  </View>:null}
  {!compact&&onPeriodChange?<View style={s.chips}>
   {([{id:'acumulado',label:'Histórico acumulado'},{id:'reciente',label:'Últimas 30'}] as const).map(p=>
    <Pressable key={p.id} accessibilityRole="button"
     accessibilityState={{selected:trendSnapshot.period===p.id}}
     onPress={()=>onPeriodChange(p.id)}
     style={[s.chip,{backgroundColor:trendSnapshot.period===p.id?c.accentFill:c.surfaceAlt,
      borderColor:trendSnapshot.period===p.id?c.accent:c.border}]}>
     <Text style={[s.chipLabel,{color:trendSnapshot.period===p.id?c.accent:c.subtext}]}>{p.label}</Text>
    </Pressable>)}
  </View>:null}
  {!compact&&onTurnChange?<TurnStrip value={turn} onChange={onTurnChange}/>:null}
  <View style={[s.divider,{backgroundColor:c.divider}]}/>
  <Text style={[s.label,{color:c.text}]}>Mitad del Top10 · {TREND_LABELS[selectedEngine]}</Text>
  <View style={s.chips}>
   {TREND_ENGINES.map(id=><Pressable key={id} accessibilityRole="button"
    accessibilityState={{selected:id===selectedEngine}}
    onPress={()=>onEngineChange(id)}
    style={[s.chip,{backgroundColor:id===selectedEngine?c.accentFill:c.surfaceAlt,
     borderColor:id===selectedEngine?c.accent:c.border}]}>
    <Text style={[s.chipLabel,{color:id===selectedEngine?c.accent:c.subtext}]}>
     {id==='lalo'?'Lalo':id==='ayer'?'Aux ayer':'Aux hoy'}
    </Text>
   </Pressable>)}
  </View>
  <HalfBar record={record}/>
  <View style={s.legend}>
   <View style={s.legendItem}>
    <View style={[s.dot,{backgroundColor:HALF_COLORS.first}]}/>
    <Text style={[s.legendText,{color:c.subtext}]}>
     #1–#5: <Text style={{fontWeight:'900',color:c.text}}>{record.first} aciertos</Text>
    </Text>
   </View>
   <View style={s.legendItem}>
    <View style={[s.dot,{backgroundColor:HALF_COLORS.last}]}/>
    <Text style={[s.legendText,{color:c.subtext}]}>
     #6–#10: <Text style={{fontWeight:'900',color:c.text}}>{record.last} aciertos</Text>
    </Text>
   </View>
  </View>
  <Text style={[s.micro,{color:c.muted}]}>
   {record.cuts?record.cuts+' turnos con Top10 completo · '+hits(record)+' coincidencias':
    'Sin Top10 previo disponible · Auxiliar Hoy comienza después de Previa'}
   {pct?' · Distribución '+pct[0]+'% / '+pct[1]+'%':''}
  </Text>
  <View style={[s.divider,{backgroundColor:c.divider}]}/>
  <Text style={[s.label,{color:c.text}]}>Presencia histórica de los motores</Text>
  <StackedBar height={30} slices={TREND_ENGINES.map(id=>({
   key:id,label:TREND_LABELS[id],amount:portions[id],color:TREND_COLORS[id]
  }))}/>
  <View style={s.motorLegend}>
   {TREND_ENGINES.map(id=><View style={s.motorItem} key={id}>
    <View style={[s.dot,{backgroundColor:TREND_COLORS[id]}]}/>
    <Text style={[s.legendText,{color:c.subtext}]}>
     {id==='lalo'?'Lalo':id==='ayer'?'Aux ayer':'Aux hoy'}:
     <Text style={{color:c.text,fontWeight:'900'}}> {table[turn][id].cuts?portions[id]+'%':'s/d'}</Text>
    </Text>
   </View>)}
  </View>
  <Text style={[s.micro,{color:c.muted}]}>
   Cuota relativa de coincidencias por turno elegible; se ajusta por días disponibles.
   Una misma cabeza puede aparecer en varios motores.
   {' '}Seguimiento nuevo: {trendSnapshot.newDateCount} jornadas registradas.
  </Text>
  {compact?<>
   <Pressable accessibilityRole="button" accessibilityLabel="Ver análisis completo en Info"
    disabled={!onDetails} onPress={onDetails}
    style={[s.cta,{backgroundColor:c.accent}]}>
    <Text style={s.ctaLabel}>Ver análisis completo en Info  ›</Text>
   </Pressable>
  </>:<>
   <View style={[s.divider,{backgroundColor:c.divider}]}/>
   <Text style={[s.sectionTitle,{color:c.text}]}>Cada motor por separado · {turn}</Text>
   {TREND_ENGINES.map(id=>{
    const r=table[turn][id], p=halfPercent(r);
    return <View key={id} style={[s.detailRow,{borderColor:c.border}]}>
     <View style={s.detailHeading}>
      <Text style={{color:c.text,fontSize:12,fontWeight:'900'}}>{TREND_LABELS[id]}</Text>
      <Text style={{color:c.subtext,fontSize:11}}>
       {r.cuts?r.cuts+' turnos · '+hits(r)+' aciertos':'Sin Top10 completo'}
      </Text>
     </View>
     {p?<StackedBar height={27} slices={[
      {key:'a',label:'Primera',amount:p[0],color:HALF_COLORS.first},
      {key:'b',label:'Segunda',amount:p[1],color:HALF_COLORS.last}
     ]}/>:<Text style={{color:c.muted,fontSize:11}}>
      No había cifras suficientes para comparar diez familias.
     </Text>}
     <Text style={{color:c.subtext,fontSize:10}}>
      Primera: {r.first} · Segunda: {r.last}
     </Text>
    </View>
   })}
   <Text style={[s.sectionTitle,{color:c.text}]}>Los cinco turnos · {TREND_LABELS[selectedEngine]}</Text>
   <Text style={[s.micro,{color:c.subtext}]}>
    Tocá un turno para ver el detalle. Las barras comparan aciertos históricos,
    no las probabilidades de la próxima quiniela.
   </Text>
   {TURNOS.map(t=>{
    const r=table[t][selectedEngine], p=halfPercent(r);
    return <Pressable key={t} accessibilityRole="button"
     onPress={()=>onTurnChange?.(t)} disabled={!onTurnChange}
     style={[s.turnRow,{borderColor:t===turn?c.accent:c.border,
      backgroundColor:t===turn?c.accentFill:c.surfaceAlt}]}>
     <View style={s.turnHead}>
      <Text style={{fontSize:12,fontWeight:'900',color:c.text}}>{t}</Text>
      <Text style={{fontSize:10,color:c.subtext}}>
       {r.cuts?r.cuts+' turnos · '+hits(r)+' aciertos':'Sin Top10'}
      </Text>
     </View>
     {p?<StackedBar height={23} slices={[
      {key:'f',label:'#1–5',amount:p[0],color:HALF_COLORS.first},
      {key:'l',label:'#6–10',amount:p[1],color:HALF_COLORS.last}
     ]}/>:<Text style={{fontSize:10,color:c.muted}}>Sin datos comparables</Text>}
    </Pressable>
   })}
   <View style={[s.note,{backgroundColor:c.surfaceAlt,borderColor:c.border}]}>
    <Text style={{fontSize:11,lineHeight:17,color:c.subtext}}>
     {trendSnapshot.period==='acumulado'?
      'Base histórica: septiembre–octubre 2026. Se suman las jornadas nuevas registradas en este teléfono.':
      'Ventana reciente: hasta 30 jornadas con resultados registrados desde el inicio del seguimiento.'}
     {' '}Nuevas jornadas: {trendSnapshot.newDateCount}. Cortes contabilizados en esta vista: {trendSnapshot.loggedCuts}.
     {' '}Los resultados reconstruidos a posteriori se distinguen de los PRE capturados
     antes del sorteo. No son probabilidades ni garantizan aciertos.
    </Text>
   </View>
  </>}
 </View>;
}
const s=StyleSheet.create({
 panel:{borderWidth:1.2,borderRadius:16,padding:12,gap:9},
 head:{flexDirection:'row',gap:10,alignItems:'center'},
 overline:{fontSize:9,fontWeight:'900',letterSpacing:.7},
 title:{fontSize:19,fontWeight:'900'},
 sub:{fontSize:11},
 infoTag:{borderWidth:1,borderRadius:9,paddingHorizontal:9,paddingVertical:7,alignItems:'center'},
 warning:{borderWidth:1,borderRadius:8,padding:8},
 divider:{height:1,marginVertical:1},
 label:{fontSize:13,fontWeight:'900'},
 chips:{flexDirection:'row',gap:6},
 chip:{flex:1,paddingHorizontal:5,paddingVertical:7,borderWidth:1,borderRadius:8,alignItems:'center'},
 chipLabel:{fontSize:10,fontWeight:'800'},
 bar:{flexDirection:'row',width:'100%',borderRadius:8,overflow:'hidden',backgroundColor:'#234669'},
 barPart:{alignItems:'center',justifyContent:'center',minWidth:0},
 barText:{color:'#fff',fontWeight:'900'},
 emptyBar:{borderRadius:8,backgroundColor:'#244062',justifyContent:'center',alignItems:'center'},
 emptyBarText:{fontSize:10,color:'#C9D5E4'},
 legend:{flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap',gap:7},
 legendItem:{flexDirection:'row',alignItems:'center',gap:5},
 legendText:{fontSize:10},
 dot:{width:9,height:9,borderRadius:3},
 micro:{fontSize:10,lineHeight:15},
 motorLegend:{flexDirection:'row',flexWrap:'wrap',gap:10,justifyContent:'space-between'},
 motorItem:{flexDirection:'row',alignItems:'center',gap:4},
 cta:{padding:12,borderRadius:10,alignItems:'center',marginTop:2},
 ctaLabel:{fontSize:12,fontWeight:'900',color:'#092347'},
 sectionTitle:{fontSize:14,fontWeight:'900',marginTop:4},
 detailRow:{borderWidth:1,borderRadius:10,padding:9,gap:6},
 detailHeading:{flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap',gap:7},
 turnRow:{borderWidth:1,borderRadius:10,padding:9,gap:6},
 turnHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 note:{borderWidth:1,borderRadius:9,padding:10}
});
