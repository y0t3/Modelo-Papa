import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {Turno} from '../domain';
import {reversibleFamily} from '../motorLalo';
import type {LaloView} from '../motorLalo';
import type {InfoVisualDay} from '../infoTurnHistory';
import {buildFormFirstMotor} from '../motorFormasPrimero';
import type {FormChoice} from '../motorFormasPrimero';
import RouteMiniBoard from './RouteMiniBoard';
import {useLaloTheme} from './LaloTheme';

export default function FormasPrimeroPanel({date,turn,pre,days,lalo,heads}:{
 date:string;turn:Turno;pre:DailySheet|null;days:InfoVisualDay[];
 lalo:LaloView|null;heads:string[];
}){
 const {colors:c,kinds}=useLaloTheme();
 const [selected,setSelected]=useState<number|null>(null);
 const model=useMemo(()=>pre&&date?
  buildFormFirstMotor(pre,date,turn,days.filter(d=>d.date<date)):null,
  [pre,date,turn,days]);
 const published=heads.filter(h=>/^\d{4,5}$/.test(h));
 const winners=new Set(published.map(h=>reversibleFamily(h.slice(-3))));
 const laloTop=lalo?.ranks.vt3.slice(0,10).map(x=>x.family)||[];
 const formTop=model?.top.map(x=>x.family)||[];
 const formHits=formTop.filter(f=>winners.has(f));
 const laloHits=laloTop.filter(f=>winners.has(f));
 const chosen=model?.top.find(x=>x.rank===selected)||null;
 const source=pre?.columns.find(x=>x.id===chosen?.source);
 const old=chosen?.support.roots[0];
 const past=days.find(d=>d.date===old?.date)?.sheet.columns.find(x=>x.id===old?.source);
 return <View style={[s.panel,{borderColor:kinds.vt3.line,backgroundColor:c.surfaceAlt}]}>
  <Text style={{color:kinds.vt3.line,fontWeight:'900',fontSize:15}}>
   FORMAS PRIMERO · VT3 · NUEVO EXPERIMENTO
  </Text>
  <Text style={[s.note,{color:c.text}]}>
   Primero elegimos recorridos y posiciones según figuras que ya explicaron
   cabezas reales; después leemos sus tres cifras. No se selecciona ni
   reordena a partir de las familias de Lalo.
  </Text>
  {!model?<Text style={[s.note,{color:c.muted}]}>Cargá la hoja PRE para comparar.</Text>:<>
   <Text style={[s.note,{color:c.subtext}]}>
    {model.validRoots} recorridos históricos verificados · {model.rootDays.length}
    jornada(s) de referencia · {model.physicalPositions} recorridos físicos PRE.
    Se prioriza una posición por silueta antes de usar otras posiciones.
   </Text>
   <View style={[s.summary,{borderColor:c.border,backgroundColor:c.card}]}>
    <Text style={{color:c.text,fontWeight:'900',fontSize:12}}>
     COMPARACIÓN CON LALO · TOP3 / TOP10
    </Text>
    <Text style={[s.note,{color:c.subtext}]}>
     Formas Primero: {formTop.slice(0,3).filter(f=>winners.has(f)).length}
     {' / '}{formHits.length} familias coincidentes
    </Text>
    <Text style={[s.note,{color:c.subtext}]}>
     Lalo oficial: {laloTop.slice(0,3).filter(f=>winners.has(f)).length}
     {' / '}{laloHits.length} familias coincidentes
    </Text>
    <Text style={[s.note,{color:c.muted}]}>
     {published.length?'POST · '+published.length+' cabeza(s) publicada(s): '+
      published.join(' · '):
      'POST pendiente · todavía no hay cabezas del turno'}
    </Text>
    <Text style={[s.note,{color:c.muted}]}>
     Un acierto aquí es una coincidencia de familia VT3, no una prueba
     de superioridad ni una apuesta ganadora. Los dos rankings son independientes.
    </Text>
   </View>
   {model.top.length?model.top.map((p:FormChoice)=>{
    const hit=winners.has(p.family);
    const highlighted=selected===p.rank;
    return <Pressable accessibilityRole="button" key={p.positionKey}
     onPress={()=>setSelected(v=>v===p.rank?null:p.rank)}
     style={[s.item,{borderColor:hit?kinds.vt3.line:c.border,
      backgroundColor:hit?kinds.vt3.fill:c.card,borderWidth:hit?2:1}]}>
     <Text style={{color:hit?kinds.vt3.text:c.text,fontWeight:'900',fontSize:12}}>
      {highlighted?'▾':'▸'} #{p.rank} · {p.family}
      {hit?' · ✓ POST':''}
     </Text>
     <Text style={[s.note,{color:c.subtext}]}>
      Figura {p.source}, fila {p.anchor+1} · {p.support.events}
      evento(s) ganador(es) anterior(es) · {p.support.days} jornada(s)
     </Text>
    </Pressable>;
   }):<Text style={[s.note,{color:c.muted}]}>
    No hay antecedentes ganadores verificados cuyas formas sean reproducibles
    en el corte PRE. El motor no inventa figuras ni candidatas.
   </Text>}
   {chosen&&source?<View style={[s.detail,{borderColor:kinds.vt3.line,backgroundColor:c.card}]}>
    <Text style={{color:c.text,fontWeight:'900'}}>FORMA SELECCIONADA · #{chosen.rank}</Text>
    <Text style={[s.note,{color:c.subtext}]}>
     Ahora · {chosen.source} · {chosen.cells.map(p=>'F'+(p.row+1)+(p.col?'D':'I')).join(' → ')}
    </Text>
    <RouteMiniBoard values={source.values} cells={chosen.cells} kind="vt3"/>
    <Text style={[s.note,{color:c.text}]}>
     La figura se eligió sin leer las cifras; en esta hoja forma {chosen.value}
     {' ('+chosen.family+')'}.
    </Text>
    <Text style={[s.note,{color:c.text,fontWeight:'900'}]}>
     ANTECEDENTES REALES DE LA FIGURA
    </Text>
    <ScrollView horizontal nestedScrollEnabled contentContainerStyle={{gap:9}}>
     {chosen.support.roots.slice(0,8).map(r=>{
      const column=days.find(d=>d.date===r.date)?.sheet.columns.find(x=>x.id===r.source);
      return <View key={r.event+'|'+r.source+'|'+r.cells.map(x=>x.row+':'+x.col).join('>')}
       style={[s.root,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
       <Text style={[s.note,{color:c.text,fontWeight:'900'}]}>
        {r.date} · {r.turn} · {r.jurisdiction} {r.head}
       </Text>
       {column?<RouteMiniBoard values={column.values} cells={r.cells}
        kind="vt3" compact/>:
        <Text style={[s.note,{color:c.muted}]}>Hoja histórica no disponible</Text>}
       <Text style={[s.note,{color:c.subtext}]}>
        {r.source} · produjo {r.reading} · raíz física verificada
       </Text>
      </View>;
     })}
    </ScrollView>
    <Text style={[s.note,{color:c.muted}]}>
     Distintas cifras pueden compartir esta forma. Cada recorrido anterior
     provino de una cabeza publicada. No se suman recorridos duplicados
     de una misma cabeza como eventos ganadores independientes.
    </Text>
   </View>:null}
   <Text style={[s.note,{color:c.muted}]}>
    Ensayo reconstructivo, NO PRE sellado. Las fechas históricas pueden
    conocerse hoy, pero ninguna cabeza del turno objetivo interviene
    en la selección. Lalo MV1 y sus Tops continúan sin modificaciones.
   </Text>
  </>}
 </View>;
}
const s=StyleSheet.create({
 panel:{padding:12,borderWidth:1,borderRadius:12,marginTop:12,gap:7},
 note:{fontSize:11,lineHeight:17},summary:{borderWidth:1,borderRadius:9,padding:10,gap:5},
 item:{borderWidth:1,borderRadius:8,padding:9,gap:4},
 detail:{borderWidth:1,borderRadius:9,padding:10,gap:8},
 root:{width:232,borderWidth:1,borderRadius:8,padding:9,gap:7}
});