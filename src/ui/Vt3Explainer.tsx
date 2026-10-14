import React,{useEffect,useMemo,useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloView} from '../motorLalo';
import {auditVt3Family} from '../vt3Audit';
import {useLaloTheme} from './LaloTheme';

const sourceName:Record<string,string>={
 prevNocturno:'Nocturna anterior',Previa:'Previa',Primera:'Primera',
 Matutino:'Matutina',Vespertino:'Vespertina'
};
const cellLabel=(cell:string)=>{
 const [r,c]=cell.split(':').map(Number);
 return 'F'+(r+1)+' C'+(c+1);
};
export default function Vt3Explainer({sheet,view,turn,heads,onFocus}:{
 sheet:DailySheet|null;view:LaloView|null;turn:Turno;
 heads?:string[];onFocus:(owner:string)=>void;
}){
 const {colors:c,kinds}=useLaloTheme();
 const [query,setQuery]=useState('');
 const [selected,setSelected]=useState('');
 const [more,setMore]=useState(false);
 useEffect(()=>{setQuery('');setSelected('');setMore(false)},[view?.date,turn]);
 const audit=useMemo(()=>sheet&&view&&selected?
  auditVt3Family(sheet,view,turn,selected):null,[sheet,view,turn,selected]);
 const invalid=selected!==''&&!audit;
 const select=(value:string)=>{setQuery(value);setSelected(value);setMore(false)};
 return <View style={[s.surface,{backgroundColor:c.surface,borderColor:c.border}]}>
  <Text style={[s.title,{color:kinds.vt3.line}]}>¿POR QUÉ NO ENTRÓ A VT3?</Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Inspeccioná cualquier terna de la hoja. La consulta no altera el Top3, Top10 ni el motor.
  </Text>
  <View style={s.lookup}>
   <TextInput
    value={query} onChangeText={setQuery}
    placeholder="851, 615, 242 o cabeza 9851"
    placeholderTextColor={c.muted}
    keyboardType="numbers-and-punctuation"
    autoCapitalize="none"
    accessibilityLabel="Terna o cabeza a analizar"
    style={[s.input,{backgroundColor:c.card,borderColor:c.border,color:c.text}]}
    onSubmitEditing={()=>select(query)}
   />
   <Pressable accessibilityRole="button" onPress={()=>select(query)}
    style={[s.button,{backgroundColor:c.button}]}>
    <Text style={{color:c.buttonText,fontWeight:'900',fontSize:12}}>ANALIZAR</Text>
   </Pressable>
  </View>
  {Boolean(heads?.some(h=>/^\d{4}$/.test(h)))&&<View style={s.headWrap}>
   <Text style={[s.note,{color:c.subtext}]}>
    Cabezas ya publicadas (POST; no influyen en el ranking):
   </Text>
   <View style={s.chips}>{heads?.filter(h=>/^\d{4}$/.test(h)).map((h,i)=>
    <Pressable key={h+'-'+i} onPress={()=>select(h)}
     accessibilityLabel={'Analizar cabeza '+h}
     style={[s.chip,{borderColor:c.border,backgroundColor:c.card}]}>
     <Text style={{color:c.text,fontWeight:'700'}}>{h}</Text>
    </Pressable>)}</View>
  </View>}
  {!sheet||!view?<Text style={[s.note,{color:c.muted}]}>Cargá primero una hoja de la fecha deseada.</Text>:
   invalid?<Text style={[s.note,{color:c.muted}]}>
    Escribí una terna de tres cifras, una cabeza de cuatro cifras o una familia reversible (ej.: 158/851).
   </Text>:audit?<View style={s.results}>
    <View style={s.resultTitle}>
     <Text style={[s.family,{color:c.text}]}>{audit.family}</Text>
     <Text style={[s.position,{color:kinds.vt3.line}]}>
      {audit.officialRank===null?'Sin puesto VT3':('#'+audit.officialRank+' VT3')}
     </Text>
    </View>
    <Text style={[s.detail,{color:c.text}]}>{audit.explanation}</Text>
    <View style={s.metricWrap}>
     {[
      'Caminos físicos: '+audit.physicalRoutes,
      'Admitidos: '+audit.admittedRoutes,
      'Sin anclaje: '+audit.unadmittedRoutes,
      'Fuentes: '+audit.physicalSources,
      'Raíces D−1: '+audit.d1Events,
      'Raíces D−7: '+audit.d7Events,
      'Bloques bifurcados: '+audit.branchBlocks
     ].map(label=><View key={label} style={[s.metric,{backgroundColor:c.surfaceAlt}]}>
      <Text style={{fontSize:10,color:c.subtext,fontWeight:'700'}}>{label}</Text>
     </View>)}
    </View>
    <View style={[s.reason,{borderColor:c.border}]}>
     <Text style={[s.reasonTitle,{color:c.text}]}>EVOLUCIÓN VT3 · FUENTES DISPONIBLES</Text>
     <Text style={[s.note,{color:c.subtext}]}>
      Estado en la fuente recién incorporada: {audit.currentEvent==='INICIAL'?'PRIMERA FUENTE':
       audit.currentEvent==='NACE'?'NACE FÍSICAMENTE':
       audit.currentEvent==='SUMA_FUENTE'?'SUMA UNA FUENTE':
       audit.currentEvent==='SIN_NOVEDAD'?'SIN CAMINOS NUEVOS':'AÚN NO APARECE'}.
      Las fuentes anteriores siguen disponibles; no hay desaparición entre turnos.
     </Text>
     {audit.evolution.map(step=>
      <View key={step.source} style={{marginTop:7}}>
       <Text style={[s.note,{color:step.routes?kinds.vt3.line:c.muted}]}>
        {sourceName[step.source]||step.source}: {step.event.replace(/_/g,' ')}
        {' · '+step.routes+' camino(s), '+step.admitted+' admitido(s), '+
          step.rootEvents+' antecedente(s) propios'}
       </Text>
      </View>
     )}
    </View>
    {audit.priorityReasons.map(r=>
     <View key={r.cutoff} style={[s.reason,{borderColor:c.border}]}>
      <Text style={[s.reasonTitle,{color:c.text}]}>Respecto al Top{r.cutoff}: {r.boundaryFamily} (#{r.boundaryRank})</Text>
      <Text style={[s.note,{color:c.subtext}]}>
       Primer criterio que cambia el orden: {r.decisiveCriterion}
       {r.decisiveCriterion.startsWith('Desempate')?'':'. Esta familia: '+r.candidateValue+'; límite: '+r.boundaryValue}.
      </Text>
     </View>)}
    {!!audit.routes.length&&<View style={{marginTop:12}}>
     <Text style={[s.reasonTitle,{color:c.text}]}>Recorridos físicos propios ({audit.physicalRoutes})</Text>
     <Text style={[s.note,{color:c.subtext}]}>
      Cada camino e inverso se cuentan una sola vez. Las raíces se contabilizan por cabeza histórica independiente.
     </Text>
     {audit.routes.slice(0,more?undefined:8).map(r=>
      <View key={r.physicalKey} style={[s.pathCard,{backgroundColor:c.card,borderColor:c.border}]}>
       <Text style={[s.pathHead,{color:c.text}]}>
        {sourceName[r.source]||r.source} · {r.value} ↔ {[...r.value].reverse().join('')}
       </Text>
       <Text style={[s.note,{color:c.subtext}]}>{r.cells.map(cellLabel).join(' → ')}</Text>
       <Text style={[s.note,{color:r.admitted?kinds.vt3.line:c.muted}]}>
        {r.admitted?'Admitido en el motor':'Sólo físicamente presente'}
       </Text>
       {r.rootEvents.map(e=><Text key={e.id} style={[s.note,{color:c.subtext}]}>
        {e.period} · {e.date} · {e.turn} · {e.jurisdiction} · {e.head}
       </Text>)}
      </View>)}
     {audit.routes.length>8&&
      <Pressable accessibilityRole="button" onPress={()=>setMore(v=>!v)} style={s.more}>
       <Text style={{color:c.accent,fontWeight:'900'}}>
        {more?'Mostrar menos':('Ver los '+(audit.routes.length-8)+' caminos restantes')}
       </Text>
      </Pressable>}
    </View>}
    {audit.officialRank!==null&&
     <Pressable accessibilityRole="button" style={[s.focus,{backgroundColor:c.surfaceAlt}]}
      onPress={()=>onFocus('vt3|'+audit.family)}>
      <Text style={{color:c.accent,fontWeight:'900'}}>Ver familia y recorridos en PREDICTIVA ›</Text>
     </Pressable>}
   </View>:null}
 </View>;
}
const s=StyleSheet.create({
 surface:{borderWidth:1,borderRadius:13,marginTop:12,padding:14},
 title:{fontSize:15,fontWeight:'900'},note:{fontSize:11,lineHeight:17,marginTop:5},
 lookup:{flexDirection:'row',gap:8,marginTop:11,alignItems:'center'},
 input:{borderWidth:1,borderRadius:8,padding:11,flex:1,fontSize:13},
 button:{borderRadius:8,padding:12,alignItems:'center'},
 headWrap:{marginTop:9},chips:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:8},
 chip:{borderWidth:1,borderRadius:8,paddingHorizontal:10,paddingVertical:6},
 results:{marginTop:13},resultTitle:{flexDirection:'row',justifyContent:'space-between',gap:7,alignItems:'center'},
 family:{fontSize:20,fontWeight:'900'},position:{fontSize:14,fontWeight:'900'},
 detail:{fontSize:12,lineHeight:18,marginTop:9},
 metricWrap:{flexDirection:'row',gap:6,flexWrap:'wrap',marginTop:11},
 metric:{padding:8,borderRadius:7},
 reason:{marginTop:9,borderWidth:1,borderRadius:8,padding:9},
 reasonTitle:{fontSize:11,fontWeight:'900'},
 pathCard:{borderWidth:1,borderRadius:8,marginTop:7,padding:9},
 pathHead:{fontSize:12,fontWeight:'900'},
 more:{paddingVertical:11},focus:{marginTop:12,borderRadius:8,padding:10}
});
