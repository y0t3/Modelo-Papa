import React,{useMemo} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import type {AuxiliarView} from '../motorLaloAuxiliar';
import type {DayOverview} from '../homeDaySummary';
import type {HistoricHeadsDay} from '../historicalHeadFrequency';
import type {StatMode} from '../headStats';
import type {Top6Snapshot} from '../headStatJournal';
import {hitsForTop6,lastStatSnapshots} from '../headStatJournal';
import {headStats,STAT_MODE_LABELS} from '../headStats';
import HeadStatSwitch from './HeadStatSwitch';
import {useLaloTheme} from './LaloTheme';
import {readableWeekday} from '../infoTurnHistory';
import DayMatchGrid from './DayMatchGrid';
import TurnTrendPanel from './TurnTrendPanel';
import type {TrendEngine} from '../trendHistoryVt2';
import type {TrendSnapshot} from '../trendVt2Journal';

type Props={date:string;turn:Turno;data:CabezasDia|null;
 auxAyer:AuxiliarView|null;auxHoy:AuxiliarView|null;
 overview:DayOverview;onOpenStats:()=>void;onOpenHeads:()=>void;
 history:HistoricHeadsDay[];historyBusy:boolean;historyProgress:number;
 statMode:StatMode;onStatMode:(mode:StatMode)=>void;
 statSnapshot:Top6Snapshot|null;statJournal:Top6Snapshot[];
 trendEngine:TrendEngine;onTrendEngineChange:(engine:TrendEngine)=>void;
 trendSnapshot:TrendSnapshot;onOpenTrendInfo:()=>void};
const shortDate=(iso:string|null)=>iso?iso.slice(8,10)+'/'+iso.slice(5,7):'sin registro';
export default function HomeDashboard({date,turn,data,auxAyer,auxHoy,
 overview,onOpenStats,onOpenHeads,history,historyBusy,historyProgress,
 statMode,onStatMode,statSnapshot,statJournal,trendEngine,onTrendEngineChange,onOpenTrendInfo,trendSnapshot}:Props){
 const {colors:c}=useLaloTheme();
 const stats=useMemo(()=>headStats(history,date,turn,110,statMode),
  [history,date,turn,statMode]);
 const hits=statSnapshot?hitsForTop6(statSnapshot,statMode):[];
 const last=lastStatSnapshots(statJournal)[0]||null;
 const lastHits=last?hitsForTop6(last,statMode):[];
 const currentHeads=statSnapshot?.results.length||0;
 return <View style={s.root}>
  <View style={[s.hero,{backgroundColor:c.surface,borderColor:c.accent}]}>
   <Text style={[s.kicker,{color:c.accent}]}>ESTADÍSTICAS · {turn.toUpperCase()}</Text>
   <Text style={[s.title,{color:c.accent}]}>Los números de 2 cifras</Text>
   <Text style={[s.desc,{color:c.subtext}]}>
    {date?readableWeekday(date):'Elegí una fecha'} · cinco jurisdicciones
   </Text>
   <HeadStatSwitch mode={statMode} onMode={onStatMode}/>
   <Text style={[s.desc,{color:c.text,fontWeight:'700'}]}>
    {statMode==='atrasados'?'Los que llevan más jornadas sin salir':statMode==='frios'?
     'Los que menos veces aparecieron':statMode==='calientes'?
     'Los que más veces aparecieron':'Los que salieron más recientemente'}
   </Text>
   {historyBusy?<Text style={[s.note,{color:c.subtext}]}>
    Consultando historial anterior: {historyProgress} de 110 fechas…
   </Text>:stats.days<12?<Text style={[s.note,{color:c.subtext}]}>
    Todavía no hay suficientes jornadas completas para mostrar el Top6.
   </Text>:<>
    <View style={s.grid}>
     {stats.top.map((item,index)=><View key={item.value}
      style={[s.chip,{backgroundColor:c.surfaceAlt,
       borderColor:hits.some(h=>h.value===item.value)?'#57D5A5':index===0?c.accent:c.border,
       borderWidth:hits.some(h=>h.value===item.value)?2:1}]}>
      <Text style={{color:c.subtext,fontSize:10}}>#{index+1}</Text>
      <Text style={{color:index===0?c.accent:c.text,fontSize:25,fontWeight:'900'}}>
       {item.value}
      </Text>
      <Text style={{color:c.subtext,fontSize:10,textAlign:'center'}}>
       {statMode==='atrasados'?item.delay+' jornadas':
        statMode==='recientes'?'Últ. '+shortDate(item.lastDate):
        item.count+' '+(item.count===1?'vez':'veces')}
      </Text>
      {hits.some(h=>h.value===item.value)?<Text style={{
       fontSize:10,fontWeight:'900',color:'#57D5A5',textAlign:'center'}}>
       ✓ Coincidió
      </Text>:null}
     </View>)}
    </View>
    {statSnapshot&&currentHeads>0?<Text style={[s.match,{color:'#57D5A5'}]}>
     {hits.length?'✓ '+hits.length+' coincidencia(s) del Top6 '+STAT_MODE_LABELS[statMode]:
      'Sin coincidencias del Top6 '+STAT_MODE_LABELS[statMode]} ·
     {' '+currentHeads+' de 5 cabezas publicadas.'}
    </Text>:null}
    <Text style={[s.note,{color:c.subtext}]}>
     {stats.days} jornadas completas anteriores · {stats.heads} cabezas.
     {stats.days<110?' Historial limitado.':''}
     {stats.unseen&&statMode==='atrasados'?
      ' '+stats.unseen+' números sin aparición conocida en este período (atraso indeterminado).':''}
    </Text>
   </>}
   {!statSnapshot&&last?<View style={{gap:3,backgroundColor:c.surfaceAlt,
    padding:9,borderRadius:9}}>
    <Text style={{fontSize:11,fontWeight:'900',color:c.text}}>
     Último Top6 guardado · {last.date.slice(8,10)}/{last.date.slice(5,7)} · {last.turn}
    </Text>
    <Text style={{fontSize:11,color:lastHits.length?'#57D5A5':c.subtext}}>
     {lastHits.length? '✓ '+lastHits.length+' coincidencia(s) de '+STAT_MODE_LABELS[statMode]:
      'Sin coincidencias de '+STAT_MODE_LABELS[statMode]} ·
     {' '+last.results.length+' cabezas publicadas
    </Text>
   </View>:null}
   <Pressable accessibilityRole="button" onPress={onOpenStats}
    style={[s.button,{backgroundColor:c.accent}]}>
    <Text style={{fontWeight:'900',color:'#092347',fontSize:13}}>
     Ver estudio completo  ›
    </Text>
   </Pressable>
   <Text style={[s.note,{color:c.muted}]}>
    {STAT_MODE_LABELS[statMode]}: describe resultados anteriores, no predice el próximo sorteo.
    Sin hoja +11 ni motores. 00 y 99 se cuentan por separado.
   </Text>
  </View>
  <View style={[s.summary,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.accent}]}>Resumen del día</Text>
   <DayMatchGrid overview={overview} data={data} turn={turn}
    auxAyer={auxAyer} auxHoy={auxHoy} short onOpenHeads={onOpenHeads}/>
  </View>
  <TurnTrendPanel compact date={date} turn={turn} selectedEngine={trendEngine}
   trendSnapshot={trendSnapshot} onEngineChange={onTrendEngineChange}
   onDetails={onOpenTrendInfo}/>
 </View>;
}
const s=StyleSheet.create({
 root:{marginTop:9,gap:12,paddingBottom:25},
 hero:{borderWidth:2,borderRadius:18,padding:13,gap:10},
 kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.1},
 title:{fontSize:22,fontWeight:'900'},
 desc:{fontSize:11,lineHeight:17},
 note:{fontSize:10,lineHeight:16},
 match:{fontSize:11,fontWeight:'900',lineHeight:17},
 grid:{flexDirection:'row',flexWrap:'wrap',columnGap:'2%',rowGap:8},
 chip:{width:'32%',borderWidth:1,borderRadius:11,alignItems:'center',
  gap:4,padding:10,minHeight:95,justifyContent:'center'},
 button:{borderRadius:11,padding:13,alignItems:'center'},
 summary:{borderWidth:1.5,borderRadius:15,padding:13,gap:12},
 heading:{fontSize:18,fontWeight:'900'}
});
