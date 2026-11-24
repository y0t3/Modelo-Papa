import React,{useMemo,useState,useEffect} from 'react';
import {Text,View,Pressable,StyleSheet} from 'react-native';
import {JURS,TURNOS} from '../domain';
import type {CabezasDia,Turno} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloView} from '../motorLalo';
import type {InfoVisualDay} from '../infoTurnHistory';
import type {AuxGalleryDay} from '../infoAuxGallery';
import type {TrackingAuxInput} from '../figureTracking';
import type {AuxiliaryHeads} from '../auxSantiagoNeuquen';
import {auxAtCut} from '../auxTemporalModes';
import {rankPlusVt4,rankAuxVt4} from '../vt4Independent';
import type {AuxVt4Exact} from '../vt4Independent';
import type {LaloFamily} from '../motorLalo';
import InlineFamilyPaths from './InlineFamilyPaths';
import {useLaloTheme} from './LaloTheme';

type Engine='lalo'|'ayer'|'hoy';
type Props={date:string;turn:Turno;data:CabezasDia|null;sheet:DailySheet|null;view:LaloView|null;
 ayer:TrackingAuxInput;hoy:TrackingAuxInput;visualDays:InfoVisualDay[];auxDays:AuxGalleryDay[];onTurnChange:(t:Turno)=>void};
type Row={value:string;rank:number;blocks:number;plus?:LaloFamily;aux?:AuxVt4Exact};
type Frame={date:string;sheet:DailySheet|null;aux:AuxiliaryHeads|null;heads:CabezasDia|null;
 rows:Row[];available:boolean};
const labels:Record<Engine,string>={lalo:'Lalo +11',ayer:'AUX AYER',hoy:'AUX HOY'};
const targets=JURS.filter(j=>j!=='Montevideo');
function frame(date:string,turn:Turno,engine:Engine,sheet:DailySheet|null,raw:AuxiliaryHeads|null,heads:CabezasDia|null):Frame{
 const aux=raw&&engine!=='lalo'?auxAtCut(raw,turn,engine==='ayer'?'anterior':'intrajornada'):null;
 const available=engine==='lalo'?!!sheet:!!aux&&(engine!=='hoy'||turn!=='Previa');
 const rows:Row[]=engine==='lalo'&&sheet?rankPlusVt4(sheet,date,turn).map(f=>({
  value:f.family,rank:f.rank,blocks:f.physicalBlocks,plus:f
 })):aux?rankAuxVt4(aux,date,turn).map(f=>({value:f.family,rank:f.rank,blocks:f.physicalBlocks,aux:f})): [];
 return {date,sheet,aux,heads,rows,available};
}
const observations=(f:Frame,turn:Turno)=>targets.flatMap(j=>{
 const head=f.heads?.[turn]?.[j]||'';
 if(!/^\d{4}$/.test(head))return [];
 const found=f.rows.find(r=>r.value===head);
 return [{jur:j,head,row:found}];
});
export default function Vt4StudyPanel({date,turn,data,sheet,view,ayer,hoy,visualDays,auxDays,onTurnChange}:Props){
 const {colors:c,kinds}=useLaloTheme();
 const [engine,setEngine]=useState<Engine>('lalo');
 const [expanded,setExpanded]=useState<string|null>(null);
 useEffect(()=>setExpanded(null),[date,turn,engine]);
 const frames=useMemo(()=>{
  const days=engine==='lalo'?visualDays.map(d=>({date:d.date,sheet:d.sheet,raw:null,heads:d.heads})):
   auxDays.map(d=>({date:d.date,sheet:null,raw:engine==='ayer'?d.yesterday:d.today,heads:d.heads}));
  const history=days.filter(d=>d.date<date).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7)
   .map(d=>frame(d.date,turn,engine,d.sheet,d.raw,d.heads));
  return [frame(date,turn,engine,sheet,engine==='ayer'?ayer.heads:engine==='hoy'?hoy.heads:null,data),...history];
 },[date,turn,engine,sheet,data,ayer.heads,hoy.heads,visualDays,auxDays]);
 const current=frames[0],hist=frames.slice(1).filter(f=>f.available&&f.rows.length);
 const evaluated=hist.flatMap(f=>observations(f,turn));
 const expected=hist.reduce((n,f)=>n+observations(f,turn).length*f.rows.length/10000,0);
 const formed=evaluated.filter(h=>h.row).length,top10=evaluated.filter(h=>h.row&&h.row.rank<=10).length;
 const color=kinds.vt4.line;
 const mini=(f:Frame,r:Row,key:string)=><>
  <Pressable accessibilityRole="button" onPress={()=>setExpanded(v=>v===key?null:key)}
   style={[s.toggle,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
   <Text style={{color:c.accent,fontWeight:'900',fontSize:12}}>{expanded===key?'▴ Cerrar minihoja':'▾ Ver minihoja'}</Text>
  </Pressable>
  {expanded===key?<InlineFamilyPaths kind="vt4" family={r.value} turn={turn}
   plus={r.plus&&f.sheet?{sheet:f.sheet,routes:r.plus.paths}:undefined}
   aux={r.aux&&f.aux?{heads:f.aux,values:[r.value]}:undefined}/>:null}
 </>;
 return <View style={s.root}>
  <Text style={{color:c.subtext,fontSize:12,lineHeight:18}}>Cuatro cifras exactas, sin depender de VT3. Elegí una hoja y un turno. El orden prioriza bloques físicos distintos; no indica chances comprobadas.</Text>
  <View style={s.chips}>{(['lalo','ayer','hoy'] as Engine[]).map(e=><Pressable key={e} accessibilityRole="tab" accessibilityState={{selected:e===engine}} onPress={()=>setEngine(e)}
   style={[s.chip,{borderColor:engine===e?color:c.border,backgroundColor:engine===e?kinds.vt4.fill:c.surfaceAlt}]}>
   <Text style={{color:engine===e?kinds.vt4.text:c.text,fontSize:12,fontWeight:'900'}}>{labels[e]}</Text></Pressable>)}</View>
  <View style={s.chips}>{TURNOS.map(t=><Pressable key={t} accessibilityRole="button" onPress={()=>onTurnChange(t)}
   style={[s.chip,{borderColor:turn===t?color:c.border,backgroundColor:turn===t?kinds.vt4.fill:c.surfaceAlt}]}>
   <Text style={{color:turn===t?kinds.vt4.text:c.text,fontSize:10,fontWeight:'900'}}>{t}</Text></Pressable>)}</View>
  <View style={[s.card,{borderColor:color,backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.title,{color:c.text}]}>La hoja de este turno</Text>
   {!current.available?<Text style={{color:c.subtext}}>{engine==='hoy'&&turn==='Previa'?'AUX HOY no tiene cifras publicadas antes de Previa.':'Hoja aún no disponible.'}</Text>:<>
    <Text style={{color:c.text,fontSize:13}}>{current.rows.length} números de cuatro cifras formables</Text>
    <Text style={{color:c.subtext,fontSize:11}}>Top 10 exacto · Tocá una formación para mirar sus recorridos.</Text>
    {current.rows.slice(0,10).map(r=><View key={r.value} style={[s.item,{borderColor:c.border}]}>
     <Text style={{color:c.text,fontSize:16,fontWeight:'900'}}>#{r.rank} · {r.value}</Text>
     <Text style={{color:c.subtext,fontSize:11}}>{r.blocks} bloques distintos</Text>
     {mini(current,r,'actual|'+r.value)}
    </View>)}
   </>}
   <Text style={[s.title,{color:c.text}]}>Cabezas publicadas</Text>
   {!observations(current,turn).length?<Text style={{color:c.subtext}}>Todavía no hay resultados.</Text>:observations(current,turn).map(h=><View key={h.jur} style={[s.item,{borderColor:c.border}]}>
    <Text style={{color:h.row?color:c.text,fontWeight:'900'}}>{h.jur} · {h.head}</Text>
    <Text style={{color:c.subtext,fontSize:11}}>{!current.available?'Hoja no disponible':h.row?h.row.rank<=10?'Coincidió en el Top '+h.row.rank:'Formable · puesto '+h.row.rank:'No se formaba antes del turno'}</Text>
    {h.row?mini(current,h.row,'cabeza|'+h.jur):null}
   </View>)}
  </View>
  <View style={[s.card,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.title,{color:c.text}]}>Últimas jornadas disponibles</Text>
   <Text style={{color:c.text,fontSize:13}}>{formed} de {evaluated.length} cabezas formables · {top10} en Top 10</Text>
   <Text style={{color:c.subtext,fontSize:11}}>Referencia por tamaño de las hojas: {expected.toFixed(1)} formaciones esperadas bajo azar. Cotejo histórico reconstruido.</Text>
   {!hist.length?<Text style={{color:c.subtext}}>Todavía no hay historial de esta hoja.</Text>:hist.map(f=><View key={f.date} style={[s.item,{borderColor:c.border}]}>
    <Text style={{color:c.text,fontWeight:'900'}}>{f.date.split('-').reverse().join('/')}</Text>
    <Text style={{color:c.subtext,fontSize:11}}>{f.rows.length} números formables · {observations(f,turn).filter(h=>h.row).length} cabezas encontradas</Text>
    {observations(f,turn).filter(h=>h.row).map(h=><View key={h.jur} style={{gap:4}}>
     <Text style={{color:h.row!.rank<=10?color:c.text,fontWeight:'800'}}>{h.jur} · {h.head} · #{h.row!.rank}</Text>
     {mini(f,h.row!,f.date+'|'+h.jur)}
    </View>)}
   </View>)}
  </View>
 </View>;
}
const s=StyleSheet.create({root:{gap:12},chips:{flexDirection:'row',flexWrap:'wrap',gap:5},chip:{borderWidth:1,borderRadius:9,paddingHorizontal:9,paddingVertical:8},card:{borderWidth:1.2,borderRadius:13,padding:10,gap:8},title:{fontWeight:'900',fontSize:16},item:{borderTopWidth:1,paddingVertical:8,gap:5},toggle:{alignSelf:'flex-start',borderWidth:1,borderRadius:8,padding:7}});
