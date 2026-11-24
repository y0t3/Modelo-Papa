import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import type {AuxiliarView} from '../motorLaloAuxiliar';
import type {DayOverview} from '../homeDaySummary';
import type {HistoricHeadsDay} from '../historicalHeadFrequency';
import type {StatMode} from '../headStats';
import type {Top6Snapshot} from '../headStatJournal';
import {useLaloTheme} from './LaloTheme';
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
export default function HomeDashboard({date,turn,data,auxAyer,auxHoy,overview,onOpenHeads,trendEngine,onTrendEngineChange,onOpenTrendInfo,trendSnapshot}:Props){
 const {colors:c}=useLaloTheme();
 return <View style={s.root}>
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
