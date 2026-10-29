import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {Turno} from '../domain';
import type {LaloHistorical} from '../motorLalo';
import type {InfoVisualDay} from '../infoTurnHistory';
import type {PanoramaRoute} from '../panoramaModel';
import {buildExperimentalVt2} from '../experimentalVt2';
import type {Vt2ExperimentalItem} from '../experimentalVt2';
import {reversibleFamily} from '../motorLalo';
import RouteMiniBoard from './RouteMiniBoard';
import PhysicalShapeHistory from './PhysicalShapeHistory';
import {useLaloTheme} from './LaloTheme';

export default function Vt2ExperimentalPanel({date,turn,sheet,history,days,heads}:{
 date:string;turn:Turno;sheet:DailySheet|null;
 history:LaloHistorical[];days:InfoVisualDay[];heads:string[]
}){
 const {colors:c,kinds}=useLaloTheme();
 const [selected,setSelected]=useState<string|null>(null);
 const model=useMemo(()=>sheet&&date?
  buildExperimentalVt2(sheet,date,turn,[...days,...history]):null,
  [sheet,date,turn,days,history]);
 const winners=new Set(heads.filter(h=>/^\d{4}$/.test(h))
  .map(h=>reversibleFamily(h.slice(-2))));
 const sections:[string,Vt2ExperimentalItem[]][]=[
  ['GEOMETRÍA COMPLETA · VT2',model?.geometric||[]],
  ['CONFIGURACIONES CONECTADAS · VT2',model?.connected||[]]
 ];
 const picked=sections.flatMap(([heading,values])=>values.map((v,i)=>({
  id:heading+'|'+i,item:v
 }))).find(x=>x.id===selected);
 const item=picked?.item;
 const col=sheet?.columns.find(x=>x.id===item?.source);
 const cells=item?.cells.map(value=>{
  const [row,column]=value.split(':').map(Number);
  return {row,col:column};
 })||[];
 const path:PanoramaRoute|null=item&&cells.length===2?{
  id:'vt2|visual|'+selected,ownerId:'experimental|vt2',
  kind:'vt2',sourceId:item.source,cells,readings:[item.value],
  headSources:[]
 }:null;
 return <View style={[s.root,{backgroundColor:c.surfaceAlt,borderColor:kinds.vt2.line}]}>
  <Text style={{color:kinds.vt2.line,fontSize:15,fontWeight:'900'}}>
   VT2 · GEOMETRÍA Y CONECTADAS
  </Text>
  <Text style={[s.hint,{color:c.subtext}]}>
   Dos lectores experimentales propios de dos cifras. Primero se
   estudian los movimientos y pares de figuras ganadoras; después se leen
   las cifras que producen en las fuentes PRE del turno.
   No alimentan Lalo, VT3 ni VT4.
  </Text>
  {!model?<Text style={[s.hint,{color:c.muted}]}>Cargá la hoja para esta comparación.</Text>:<>
   <Text style={[s.hint,{color:c.subtext}]}>
    {model.allRoutes} recorridos PRE · {model.historicalEvents} eventos ganadores
    de referencia. Son reconstrucciones de estudio, no rankings sellados.
   </Text>
   {sections.map(([name,values])=><View key={name}
    style={[s.reader,{borderColor:c.border,backgroundColor:c.card}]}>
    <Text style={{color:c.text,fontWeight:'900',fontSize:12}}>{name}</Text>
    {values.length?values.map((v,i)=>{
     const id=name+'|'+i;
     return <Pressable accessibilityRole="button" key={id}
      accessibilityLabel={'Ver figura de '+v.family+' en '+name}
      onPress={()=>setSelected(old=>old===id?null:id)}
      style={[s.row,{borderColor:selected===id?kinds.vt2.line:c.border,
       backgroundColor:selected===id?kinds.vt2.fill:c.surface}]}>
      <Text style={{color:selected===id?kinds.vt2.text:c.text,fontWeight:'900',fontSize:12}}>
       #{i+1} · {v.family}
       {winners.has(v.family)?'  ✓ POST':''}
      </Text>
      <Text style={[s.small,{color:c.subtext}]}>
       Forma {v.source} · {v.cells.map(x=>{
        const [r,k]=x.split(':').map(Number);
        return 'F'+(r+1)+(k?'D':'I');
       }).join('→')} · {v.witnesses} testigo(s)
      </Text>
     </Pressable>;
    }):<Text style={[s.hint,{color:c.muted}]}>
     No hay figuras conectadas válidas bajo estas reglas en este corte.
    </Text>}
   </View>)}
   {item&&path&&col&&sheet?<View style={[s.reader,{borderColor:kinds.vt2.line,
    backgroundColor:c.card}]}>
    <Text style={{color:c.text,fontWeight:'900',fontSize:12}}>
     Figura seleccionada · #{(picked?.id||'').split('|').at(-1)}
    </Text>
    <RouteMiniBoard values={col.values} cells={cells} kind="vt2"/>
    <Text style={[s.hint,{color:c.subtext}]}>{item.note}</Text>
    <Text style={[s.hint,{color:c.subtext}]}>
     {item.pastHeads.length?
      'Cabezas testigo de la configuración: '+item.pastHeads.join(' · '):
      'Sin testigos de esa forma en la muestra'}
    </Text>
    <PhysicalShapeHistory route={path} sheet={sheet} date={date}
     turn={turn} days={days}/>
   </View>:null}
   <Text style={[s.hint,{color:c.muted}]}>
    Las familias sirven sólo para identificar la lectura de una forma.
    El histórico de siluetas no suma votos ni demuestra ventaja predictiva.
    Los POST antiguos y las cabezas del turno objetivo no intervienen en la elección PRE.
   </Text>
  </>}
 </View>;
}
const s=StyleSheet.create({
 root:{borderWidth:1,borderRadius:12,marginTop:12,padding:12,gap:7},
 hint:{fontSize:11,lineHeight:17},small:{fontSize:10,lineHeight:15},
 reader:{borderWidth:1,borderRadius:10,padding:9,gap:6},
 row:{borderWidth:1,borderRadius:8,padding:8,gap:3}
});
