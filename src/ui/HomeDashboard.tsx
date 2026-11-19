import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import type {AuxiliarView} from '../motorLaloAuxiliar';
import type {DayOverview} from '../homeDaySummary';
import type {HistoricHeadsDay} from '../historicalHeadFrequency';
import {historicalHeadFrequency} from '../historicalHeadFrequency';
import {useLaloTheme} from './LaloTheme';
import {readableWeekday} from '../infoTurnHistory';
import DayMatchGrid from './DayMatchGrid';
import TurnTrendPanel from './TurnTrendPanel';
import type {TrendEngine} from '../trendHistoryVt2';
import type {TrendSnapshot} from '../trendVt2Journal';

type Destination='cabezas';
type Props={date:string;turn:Turno;data:CabezasDia|null;
 auxAyer:AuxiliarView|null;auxHoy:AuxiliarView|null;
 overview:DayOverview;onNavigate:(page:Destination)=>void;
 history:HistoricHeadsDay[];historyBusy:boolean;
 trendEngine:TrendEngine;onTrendEngineChange:(engine:TrendEngine)=>void;
 trendSnapshot:TrendSnapshot;onOpenTrendInfo:()=>void};
const categories=[{digits:2 as const,title:'2 cifras'},
 {digits:3 as const,title:'3 cifras'},{digits:4 as const,title:'4 cifras'}];
export default function HomeDashboard({date,turn,data,auxAyer,auxHoy,
 overview,onNavigate,history,historyBusy,trendEngine,
 onTrendEngineChange,onOpenTrendInfo,trendSnapshot}:Props){
 const {colors:c}=useLaloTheme();
 return <View style={s.root}>
  <View style={[s.hero,{backgroundColor:c.surface,borderColor:c.accent}]}>
   <Text style={[s.kicker,{color:c.accent}]}>RESULTADOS DEL TURNO · {turn.toUpperCase()}</Text>
   <Text style={[s.title,{color:c.accent}]}>Los más repetidos</Text>
   <Text style={[s.desc,{color:c.subtext}]}>
    {date?readableWeekday(date):'Elegí una fecha'} · solo cabezas publicadas
   </Text>
   <Text style={[s.desc,{color:c.subtext}]}>
    Miramos hasta 28 fechas anteriores del mismo turno, en cinco jurisdicciones.
    Sin hoja +11, sin motores y sin usar el resultado del turno elegido.
   </Text>
   {historyBusy?<Text style={[s.note,{color:c.subtext}]}>
    Consultando los resultados anteriores…
   </Text>:categories.map(item=>{
    const result=historicalHeadFrequency(history,date,turn,item.digits);
    return <View key={item.digits} style={s.category}>
     <View style={s.categoryHeading}>
      <Text style={{fontSize:13,fontWeight:'900',color:c.text}}>{item.title}</Text>
      <Text style={{fontSize:10,color:c.subtext}}>
       {result.observations} cabezas · {result.days} jornadas
      </Text>
     </View>
     {result.top.length?<View style={s.row}>{result.top.map((x,i)=>
      <View key={x.value} style={[s.chip,{backgroundColor:c.surfaceAlt,
       borderColor:i===0?c.accent:c.border}]}>
       <Text style={{color:c.subtext,fontSize:10}}>#{i+1}</Text>
       <Text style={{color:i===0?c.accent:c.text,fontSize:item.digits===4?15:17,
        fontWeight:'900'}}>{x.value}</Text>
       <Text style={{color:c.subtext,fontSize:10}}>
        {x.count} {x.count===1?'vez':'veces'}
       </Text>
      </View>)}</View>:<Text style={[s.note,{color:c.subtext}]}>
      Todavía no hay resultados suficientes para mostrar.
     </Text>}
     {item.digits===4&&result.top.length>0&&result.top[0].count===1?
      <Text style={[s.note,{color:c.subtext}]}>
       Ninguna de estas cuatro cifras se repitió: solo figuran por fecha reciente.
      </Text>:null}
     {result.thirdTied?<Text style={[s.note,{color:c.subtext}]}>
      Hay más números con igual cantidad de apariciones; el orden del empate usa la fecha más reciente.
     </Text>:null}
    </View>;
   })}
   <Text style={[s.note,{color:c.muted}]}>
    Es un conteo de resultados pasados, no una predicción ni una ventaja comprobada.
    Los números invertidos se cuentan por separado.
   </Text>
  </View>
  <View style={[s.summary,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.heading,{color:c.accent}]}>Resumen del día</Text>
   <DayMatchGrid overview={overview} data={data} turn={turn}
    auxAyer={auxAyer} auxHoy={auxHoy} short
    onOpenHeads={()=>onNavigate('cabezas')}/>
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
 category:{gap:6,paddingTop:6,borderTopWidth:1,borderTopColor:'rgba(170,180,190,.25)'},
 categoryHeading:{flexDirection:'row',justifyContent:'space-between',gap:6,alignItems:'center'},
 row:{flexDirection:'row',gap:7},
 chip:{flex:1,minWidth:0,borderWidth:1,borderRadius:10,alignItems:'center',gap:3,padding:8},
 summary:{borderWidth:1.5,borderRadius:15,padding:13,gap:12},
 heading:{fontSize:18,fontWeight:'900'}
});
