import React,{useEffect,useMemo,useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {DailySheet} from '../sheet';
import type {Turno} from '../domain';
import type {LaloView,LaloHistorical} from '../motorLalo';
import {buildVt3Shadow} from '../vt3Shadow';
import {loadFrozen,saveFrozen,evaluateFrozen} from '../vt3Snapshot';
import {buildVt3Trial} from '../vt3Trial';
import type {FrozenRecord} from '../vt3Snapshot';
import {useLaloTheme} from './LaloTheme';

export default function Vt3Parallel({date,turn,sheet,view,historical,heads,autoVersion=0}:{
 date:string;turn:Turno;sheet:DailySheet|null;view:LaloView|null;
 historical:LaloHistorical[];heads:string[];autoVersion?:number;
}){
 const {colors:c}=useLaloTheme();
 const [stored,setStored]=useState<FrozenRecord|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const shadow=useMemo(()=>sheet&&view?buildVt3Shadow(sheet,date,turn,historical,view):null,
  [sheet,date,turn,historical,view]);
 useEffect(()=>{
  let live=true;setStored(null);setError('');
  loadFrozen(date,turn).then(value=>{if(live)setStored(value)})
   .catch(e=>{if(live)setError(String(e?.message||e))});
  return ()=>{live=false};
 },[date,turn,autoVersion]);
 const trial=useMemo(()=>view&&shadow?buildVt3Trial(view,shadow):null,[view,shadow]);
 const snapshotTrial=stored?.pre.trial?.map(x=>x.family);
 const previewTrial=trial?.top.map(x=>x.family)||[];
 const snapshotOfficial=stored?.pre.official.map(x=>x.family);
 const snapshotGeometry=stored?.pre.geometric.map(x=>x.family);
 const previewOfficial=view?.ranks.vt3.slice(0,10).map(x=>x.family)||[];
 const previewGeometry=shadow?.top.map(x=>x.family)||[];
 const official=snapshotOfficial||previewOfficial,geometric=snapshotGeometry||previewGeometry;
 const published=heads.some(h=>/^\d{4}$/.test(h));
 // Una propuesta calculada después del sorteo no se hace pasar por PRE.
 const newProposal=stored?(snapshotTrial||[]):(published?[]:previewTrial);
 const result=useMemo(()=>stored?evaluateFrozen(stored,heads):null,[stored,heads]);
 const freeze=async()=>{
  if(!view||!shadow)return;
  try{
   setBusy(true);setError('');
   const record=await saveFrozen(date,turn,view,shadow,heads,trial||undefined);
   setStored(record);
  }catch(e:any){setError(String(e?.message||e))}
  finally{setBusy(false)}
 };
 return <View style={[s.surface,{backgroundColor:c.surface,borderColor:c.border}]}>
  <Text style={[s.title,{color:c.text}]}>VT3 · COMPARACIÓN PARALELA</Text>
  <Text style={[s.note,{color:c.subtext}]}>
   Lalo es la selección oficial. Geometría y Nueva prueba son lectores experimentales;
   ninguno cambia los Tops principales ni alimenta VT4.
  </Text>
  <View style={s.columns}>
   {([{label:'LALO',values:official},{label:'GEOMETRÍA',values:geometric},{label:'NUEVA PRUEBA',values:newProposal}] as const).map(item=>
    <View key={item.label} style={[s.column,{borderColor:c.border,backgroundColor:c.card}]}>
     <Text style={[s.sub,{color:c.accent}]}>{item.label}</Text>
     {item.values.slice(0,3).map((family,i)=>
      <Text key={family+'|'+i} style={[s.family,{color:c.text}]}>
       <Text style={{color:c.muted}}>{'#'+(i+1)+' '}</Text>{family}
      </Text>)}
     {!item.values.length&&<Text style={[s.note,{color:c.muted}]}>
       {stored&&item.label==='NUEVA PRUEBA'?'No se registró en este PRE anterior':
        published?'Sin PRE registrado':'Cargá una hoja para generar familias.'}
      </Text>}
    </View>)}
  </View>
  {stored?<View style={[s.saved,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.sub,{color:c.text}]}>PRE REGISTRADO</Text>
   <Text style={[s.note,{color:c.subtext}]}>
    Captura local {new Date(stored.pre.createdAt).toLocaleString()} · No se sobrescribe.
   </Text>
   <Text style={[s.note,{color:c.subtext}]}>
    Se guardó antes de detectar cabezas del turno. El registro local no certifica externamente la hora.
   </Text>
  </View>:
  <Pressable accessibilityRole="button" disabled={busy||!view||!shadow||published}
    onPress={()=>{void freeze()}}
    style={[s.button,{backgroundColor:c.button,opacity:busy||!view||!shadow||published ? 0.45 : 1}]}>
   <Text style={{color:c.buttonText,fontWeight:'900',fontSize:12}}>
    {busy?'GUARDANDO…':published?'PRE NO DISPONIBLE: RESULTADO PUBLICADO':'GUARDAR PRE DE HOY (SIN SOBRESCRITURA)'}
   </Text>
  </Pressable>}
  {error?<Text style={[s.note,{color:c.text}]}>{error}</Text>:null}
  {stored&&result?.available?<View style={[s.saved,{backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.sub,{color:c.text}]}>POST · CABEZAS OBSERVADAS ({result.headCount}/5)</Text>
   {([{label:'Lalo',value:result.official},{label:'Geometría',value:result.geometric}] as const).map(x=>
    <Text key={x.label} style={[s.note,{color:c.text}]}>
     {x.label}: Top3 {x.value.top3?'SÍ':'NO'} · Top5 {x.value.top5?'SÍ':'NO'} ·
     Top10 {x.value.top10?'SÍ':'NO'} · {x.value.matches.join(', ')||'sin coincidencias'}
    </Text>)}
   <Text style={[s.note,{color:c.subtext}]}>
     {result.trial?'Nueva prueba: Top3 '+(result.trial.top3?'SÍ':'NO')+' · ':''} El POST compara los PRE guardados, sin modificar sus familias.
   </Text>
  </View>:null}
  {!stored&&published?<Text style={[s.note,{color:c.subtext}]}>
   Hay cabezas publicadas sin una captura PRE previa. No se registra un acierto retrospectivo como prospectivo.
  </Text>:null}
 </View>;
}
const s=StyleSheet.create({
 surface:{borderWidth:1,borderRadius:13,marginTop:12,padding:13},
 title:{fontSize:14,fontWeight:'900'},note:{fontSize:11,lineHeight:17,marginTop:6},
 columns:{flexDirection:'row',gap:5,marginTop:12},
 column:{flex:1,borderWidth:1,borderRadius:9,padding:5,minWidth:0},
 sub:{fontSize:11,fontWeight:'900'},family:{fontSize:10,marginTop:5,fontWeight:'800'},
 saved:{borderRadius:9,padding:10,marginTop:10},
 button:{borderRadius:8,padding:12,marginTop:12,alignItems:'center'}
});
