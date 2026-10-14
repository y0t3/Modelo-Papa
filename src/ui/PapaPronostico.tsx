import React,{useEffect,useMemo,useState} from 'react';
import {Alert,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import type {CabezasDia,Turno} from '../domain';
import {TURNOS} from '../domain';
import type {DailySheet,SourceId} from '../sheet';
import type {PapaCell,PapaPick,PapaRecord} from '../papaPronostico';
import {addDraftPick,draftPick,evaluatePapa,hasObserved,
 pathText,recordId,todayLocal,uniqueWagers,weekEnd,weeklySummary,weekStart} from '../papaPronostico';
import {loadDraft,loadRecords,saveDraft,savePre,updateResults} from '../papaRegistro';
import {descargarCabezas} from '../cabezas';
import MarkedBoard from './MarkedBoard';
import type {PanoramaRoute} from '../panoramaModel';
import {useLaloTheme} from './LaloTheme';

const types=['vt2','vt3','vt4'] as const;
const sourceLabels:Record<SourceId,string>={
 prevNocturno:'Noct. anterior',Previa:'Previa',Primera:'Primera',
 Matutino:'Matutina',Vespertino:'Vespertina'
};
function mondayShift(monday:string,delta:number){
 const date=new Date(monday+'T00:00:00Z');
 date.setUTCDate(date.getUTCDate()+delta*7);
 return date.toISOString().slice(0,10);
}
function shortDate(date:string){return date.slice(8,10)+'/'+date.slice(5,7);}
function MiniSelectableColumn({values,trail,sourceId,onCell,disabled}:{
 values:string[];trail:PapaCell[];sourceId:SourceId;
 onCell:(cell:PapaCell)=>void;disabled:boolean;
}){
 const {colors:c,kinds}=useLaloTheme();
 return <View style={s.chooseWrap}>
  <Text style={[s.chooseTitle,{color:c.text}]}>Columna: {sourceLabels[sourceId]}</Text>
  <View style={s.pickGrid}>
   {values.slice(0,6).flatMap((pair,row)=>[0,1].map(col=>{
    const p=trail.findIndex(x=>x.row===row&&x.col===col);
    const digit=/^\d{2}$/.test(pair)?pair[col]:'–';
    return <Pressable key={row+'|'+col} onPress={()=>onCell({row,col})}
     accessibilityRole="button"
     accessibilityLabel={'Fila '+(row+1)+' '+(col?'derecha':'izquierda')+' '+digit}
     disabled={disabled||digit==='–'}
     style={[s.pickCell,{borderColor:p>=0?kinds.vt3.line:c.border,
      backgroundColor:p>=0?kinds.vt3.fill:c.cell,
      borderWidth:p>=0?2:1,opacity:digit==='–'?.45:1}]}>
     <Text style={[s.pickDigit,{color:p>=0?kinds.vt3.text:c.text}]}>{digit}</Text>
     {p>=0?<Text style={[s.pickOrder,{color:kinds.vt3.line}]}>{p+1}</Text>:null}
    </Pressable>;
   }))}
  </View>
  <Text style={[s.muted,{color:c.subtext}]}>Tocá las casillas en el orden exacto del recorrido.</Text>
 </View>;
}
export default function PapaPronostico({date,turn,sheet,heads}:{
 date:string;turn:Turno;sheet:DailySheet|null;heads:CabezasDia|null
}){
 const {colors:c,kinds}=useLaloTheme();
 const [records,setRecords]=useState<PapaRecord[]>([]);
 const [picks,setPicks]=useState<PapaPick[]>([]);
 const [source,setSource]=useState<SourceId>('prevNocturno');
 const [trail,setTrail]=useState<PapaCell[]>([]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [week,setWeek]=useState(()=>weekStart(todayLocal()));
 const [section,setSection]=useState<'seleccion'|'historial'>('seleccion');
 const visible=useMemo(()=>sheet?.columns.slice(0,TURNOS.indexOf(turn)+1)||[],[sheet,turn]);
 const selectedColumn=visible.find(x=>x.id===source);
 const record=records.find(r=>recordId(r.snapshot.pre.date,r.snapshot.pre.turn)===recordId(date,turn));
 const sealed=Boolean(record),published=hasObserved(heads,turn);
 const editable=!!sheet&&date===todayLocal()&&!sealed&&!published;
 const wagers=useMemo(()=>uniqueWagers(picks),[picks]);
 const weekRecords=useMemo(()=>records.filter(r=>weekStart(r.snapshot.pre.date)===week),[records,week]);
 const summary=useMemo(()=>weeklySummary(records,week),[records,week]);
 const detail=record?evaluatePapa(record):null;
 const preview=useMemo(()=>{
  if(!sheet||trail.length<2||trail.length>4)return null;
  try{return draftPick(sheet,turn,source,trail)}catch{return null;}
 },[sheet,turn,source,trail]);
 const routes:PanoramaRoute[]=useMemo(()=>{
  const all=record?.snapshot.pre.picks||picks;
  const records=all.map(p=>({
   id:p.id,ownerId:'papa',sourceId:p.sourceId,kind:p.kind,
   cells:p.cells,readings:[p.value],headSources:[]
  }));
  if(trail.length)records.push({
   id:'curso',ownerId:'papa',sourceId:source,kind:('vt'+Math.max(2,trail.length)) as PapaPick['kind'],
   cells:trail,readings:[],headSources:[]
  });
  return records;
 },[picks,record,trail,source]);
 useEffect(()=>{
  let active=true;
  setTrail([]);setSource('prevNocturno');setError('');setPicks([]);
  Promise.all([loadRecords(),loadDraft(date,turn)]).then(async([all,draft])=>{
   if(!active)return;
   setRecords(all);
   const already=all.some(r=>recordId(r.snapshot.pre.date,r.snapshot.pre.turn)===recordId(date,turn));
   setPicks(already?[]:draft.picks);
  }).catch(e=>{if(active)setError(String(e?.message||e))});
  return ()=>{active=false};
 },[date,turn]);
 useEffect(()=>{
  if(!sheet||!heads||!published||!record)return;
  let active=true;
  updateResults(date,turn,heads).then(async()=>{
   const updated=await loadRecords();
   if(active)setRecords(updated);
  }).catch(e=>{if(active)setError(String(e?.message||e))});
  return ()=>{active=false};
  // Intencionalmente solo sincronizar cuando llegan nuevas cabezas de este turno.
 },[date,turn,heads,published,Boolean(record),sheet]);
 const patch=async(next:PapaPick[])=>{
  if(!editable)return;
  setPicks(next);
  try{await saveDraft({date,turn,picks:next})}
  catch(e:any){setError(String(e?.message||e))}
 };
 const chooseCell=(cell:PapaCell)=>{
  if(!editable)return;
  if(trail.some(x=>x.row===cell.row&&x.col===cell.col)){
   setError('No reutilices una casilla. Usá «Deshacer» para corregir.');return;
  }
  if(trail.length===4){setError('La máxima longitud es VT4: cuatro casillas.');return;}
  const last=trail.at(-1);
  if(last&&Math.max(Math.abs(last.row-cell.row),Math.abs(last.col-cell.col))!==1){
   setError('El recorrido debe pasar por casillas físicamente vecinas, sin saltos.');return;
  }
  setError('');setTrail(t=>[...t,cell]);
 };
 const add=()=>{
  if(!preview)return;
  void patch(addDraftPick(picks,preview));
  setTrail([]);setError('');
 };
 const freeze=()=>{
  if(!editable||!sheet||!picks.length)return;
  Alert.alert('Congelar pronóstico Lalo',
   'Se guardarán '+Object.values(wagers).reduce((n,a)=>n+a.size,0)+
   ' jugadas distintas del '+date+' · '+turn+
   '. Una vez guardadas no podrás modificar ni agregar candidatas. ¿Confirmás?',
   [{text:'Seguir editando',style:'cancel'},{
    text:'Congelar PRE',onPress:()=>{
     setBusy(true);setError('');
     savePre({date,turn,picks},sheet,heads).then(async()=>{
      setRecords(await loadRecords());setTrail([]);setPicks([]);
     }).catch(e=>setError(String(e?.message||e))).finally(()=>setBusy(false));
    }
   }]);
 };
 const refreshWeek=async()=>{
  if(busy||!weekRecords.length)return;
  setBusy(true);setError('');
  let updated=0;
  try{
   const dates=[...new Set(weekRecords.map(r=>r.snapshot.pre.date))].filter(d=>d<=todayLocal()).sort();
   for(const day of dates){
    const values=await descargarCabezas(day,true);
    for(const r of weekRecords.filter(x=>x.snapshot.pre.date===day)){
     const result=await updateResults(day,r.snapshot.pre.turn,values);
     if(result?.post?.heads&&Object.keys(result.post.heads).length)updated++;
    }
   }
   setRecords(await loadRecords());
   Alert.alert('Resultados revisados',updated+' pronóstico(s) tienen al menos una cabeza registrada.');
  }catch(e:any){setError('No se pudieron consultar todos los resultados: '+(e?.message||String(e)))}
  finally{setBusy(false)}
 };
 const showPicks=record?.snapshot.pre.picks||picks;
 return <View style={s.main}>
  <View style={[s.hero,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.title,{color:c.text}]}>PRONÓSTICO DE LALO</Text>
   <Text style={[s.small,{color:c.subtext}]}>
    Lalo elige sus recorridos en la hoja; la app lee las cifras,
    forma VT2 / VT3 / VT4 y guarda sus pronósticos aparte del ranking automático.
   </Text>
   <View style={s.switches}>
    {(['seleccion','historial'] as const).map(x=><Pressable key={x}
      accessibilityRole="button" accessibilityState={{selected:section===x}}
      onPress={()=>setSection(x)}
      style={[s.switch,{backgroundColor:section===x?c.accentFill:c.card,borderColor:c.border}]}>
      <Text style={{color:section===x?c.accent:c.subtext,fontWeight:'900',fontSize:12}}>
       {x==='seleccion'?'MI PRONÓSTICO':'RESUMEN SEMANAL'}
      </Text>
     </Pressable>)}
   </View>
  </View>
  {section==='seleccion'?<>
   <View style={[s.panel,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Text style={[s.subtitle,{color:c.text}]}>{date} · {turn}</Text>
    <Text style={[s.small,{color:c.subtext}]}>
     {sealed?'PRE congelado · sus recorridos no pueden alterarse':
      published?'Turno con resultados publicados: no se permite registrar un PRE retroactivo':
      date!==todayLocal()?'Podés revisar esta fecha, pero solo se congelan pronósticos del día en curso':
      'Borrador personal · elegí 2, 3 o 4 casillas de una sola columna'}
    </Text>
    {sheet?<MarkedBoard columns={visible} routes={routes} activeOwner={null}/>:
     <Text style={[s.small,{color:c.subtext}]}>Actualizá la hoja para elegir recorridos.</Text>}
    {editable?<View style={s.editor}>
     <Text style={[s.subtitle,{color:c.text}]}>Elegir columna de origen</Text>
     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.sourceRow}>
      {visible.map(v=><Pressable key={v.id} accessibilityRole="button"
       onPress={()=>{setSource(v.id);setTrail([]);setError('')}}
       style={[s.sourceTab,{backgroundColor:source===v.id?c.accentFill:c.card,
        borderColor:source===v.id?c.accent:c.border}]}>
       <Text style={{color:source===v.id?c.accent:c.subtext,fontSize:11,fontWeight:'900'}}>
        {sourceLabels[v.id]}</Text>
      </Pressable>)}
     </ScrollView>
     {selectedColumn?<MiniSelectableColumn sourceId={source} values={selectedColumn.values}
      trail={trail} onCell={chooseCell} disabled={!editable}/>:null}
     <Text style={[s.small,{color:c.text}]}>
      {trail.length?trail.length+' casilla(s) · '+pathText(trail):'Elegí la primera casilla'}
     </Text>
     {preview?<View style={[s.preview,{backgroundColor:c.callout}]}>
      <Text style={{color:c.text,fontWeight:'900'}}>
       {preview.kind.toUpperCase()} · {preview.value}
      </Text>
      <Text style={[s.small,{color:c.subtext}]}>
       {preview.kind==='vt4'?'Número exacto · madre '+preview.motherVt3:
        'Familia reversible '+preview.family}
      </Text>
     </View>:null}
     <View style={s.controls}>
      <Pressable accessibilityRole="button" onPress={()=>setTrail(t=>t.slice(0,-1))}
       disabled={!trail.length} style={[s.secondary,{borderColor:c.border}]}>
       <Text style={{color:c.accent,fontWeight:'900'}}>↶ Deshacer</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={()=>setTrail([])}
       disabled={!trail.length} style={[s.secondary,{borderColor:c.border}]}>
       <Text style={{color:c.accent,fontWeight:'900'}}>Borrar trazo</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={add} disabled={!preview}
       style={[s.primary,{backgroundColor:c.button,opacity:preview?1:.45}]}>
       <Text style={{color:c.buttonText,fontWeight:'900'}}>+ Guardar recorrido</Text>
      </Pressable>
     </View>
    </View>:null}
   </View>
   <View style={[s.panel,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Text style={[s.subtitle,{color:c.text}]}>CANDIDATOS ELEGIDOS · {showPicks.length} recorridos</Text>
    <Text style={[s.small,{color:c.subtext}]}>
     Una familia puede tener varios recorridos, pero cuenta como una sola jugada por VT y turno.
     VT4 se coteja como número exacto, sin invertir cuatro cifras.
    </Text>
    {types.map(kind=>{
     const list=showPicks.filter(p=>p.kind===kind);
     const families=new Set(list.map(x=>x.family));
     return <View key={kind} style={[s.kindSection,{borderTopColor:c.divider}]}>
      <Text style={{fontSize:12,fontWeight:'900',color:kinds[kind].line}}>
       {kind.toUpperCase()} · {families.size} jugada(s) · {list.length} recorrido(s)
      </Text>
      {list.map(p=><View key={p.id} style={[s.pickRow,{borderColor:c.border}]}>
       <View style={{flex:1}}>
        <Text style={[s.pickText,{color:c.text}]}>{p.family}
         {kind==='vt4'?' · madre '+p.motherVt3:''}
        </Text>
        <Text style={[s.muted,{color:c.subtext}]}>
         {sourceLabels[p.sourceId]} · {p.value} · {pathText(p.cells)}
        </Text>
       </View>
       {editable?<Pressable onPress={()=>void patch(picks.filter(x=>x.id!==p.id))}
        accessibilityRole="button" accessibilityLabel={'Quitar recorrido '+p.value}
        style={s.delete}>
        <Text style={{color:c.accent,fontWeight:'900'}}>Quitar</Text>
       </Pressable>:null}
      </View>)}
      {!list.length?<Text style={[s.muted,{color:c.muted}]}>Sin recorridos {kind.toUpperCase()}.</Text>:null}
     </View>;
    })}
    {editable?<Pressable onPress={freeze} accessibilityRole="button"
     disabled={!picks.length||busy}
     style={[s.freeze,{backgroundColor:c.button,opacity:(!picks.length||busy)?0.45:1}]}>
     <Text style={{color:c.buttonText,fontWeight:'900',textAlign:'center'}}>
      {busy?'GUARDANDO…':'CONGELAR PRONÓSTICO ANTES DEL SORTEO'}
     </Text>
    </Pressable>:null}
    {record?<View style={[s.seal,{backgroundColor:c.surfaceAlt}]}>
     <Text style={{color:c.text,fontSize:11,fontWeight:'900'}}>PRE local congelado</Text>
     <Text selectable style={[s.muted,{color:c.subtext}]}>
      {record.snapshot.pre.createdAt} · SHA256 {record.snapshot.sha256}
     </Text>
     <Text style={[s.muted,{color:c.subtext}]}>
      La app no lo sobrescribe. Este sello local no certifica públicamente el momento de la selección.
     </Text>
    </View>:null}
    {detail?<View style={[s.seal,{backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.subtitle,{color:c.text}]}>RESULTADO DE ESTE TURNO</Text>
     <Text style={[s.muted,{color:c.subtext}]}>
      {detail.jurisdictions} de 5 cabezas verificadas · {detail.jurisdictions? 'POST contrastado':'A la espera del sorteo'}
     </Text>
     {types.map(k=><Text key={k} style={[s.resultText,{color:kinds[k].text}]}>
      {k.toUpperCase()}: {detail.hits[k]} coincidencia(s) · {detail.wagers[k]} jugada(s)
     </Text>)}
     {detail.winnerDetails.map((x,i)=><Text key={i} style={[s.muted,{color:c.text}]}>
      {x.kind.toUpperCase()} {x.family} · {x.jurisdiction} {x.head}
     </Text>)}
    </View>:null}
   </View>
  </>:<View style={[s.panel,{backgroundColor:c.surface,borderColor:c.border}]}>
   <Text style={[s.subtitle,{color:c.text}]}>BALANCE SEMANAL · LALO</Text>
   <View style={s.weekBar}>
    <Pressable style={[s.secondary,{borderColor:c.border}]} onPress={()=>setWeek(x=>mondayShift(x,-1))}>
     <Text style={{color:c.accent,fontWeight:'900'}}>← Semana</Text></Pressable>
    <Text style={{color:c.text,fontWeight:'800',fontSize:12}}>
     {shortDate(week)} – {shortDate(weekEnd(week))}
    </Text>
    <Pressable style={[s.secondary,{borderColor:c.border}]} onPress={()=>setWeek(x=>mondayShift(x,1))}>
     <Text style={{color:c.accent,fontWeight:'900'}}>Semana →</Text></Pressable>
   </View>
   <Text style={[s.small,{color:c.subtext}]}>
    Solo pronósticos realmente guardados antes de cada turno. Las cinco cabezas oficiales se contabilizan
    por jurisdicción y turno; una cabeza puede acertar simultáneamente VT2 y VT3.
   </Text>
   <View style={s.stats}>
    {[
     {label:'Pronósticos PRE',value:summary.records},
     {label:'Turnos cotejados',value:summary.checkedTurns},
     {label:'Cabezas cotejadas',value:summary.headsCompared},
     {label:'Turnos pendientes',value:summary.pendingTurns},
     {label:'Turnos parciales',value:summary.partialTurns},
    ].map(x=><View key={x.label} style={[s.stat,{backgroundColor:c.surfaceAlt}]}>
     <Text style={{color:c.text,fontSize:22,fontWeight:'900'}}>{x.value}</Text>
     <Text style={[s.muted,{color:c.subtext}]}>{x.label}</Text>
    </View>)}
   </View>
   {types.map(kind=><View key={kind} style={[s.statLine,{borderColor:c.divider}]}>
    <Text style={{color:kinds[kind].line,fontWeight:'900'}}>{kind.toUpperCase()}</Text>
    <Text style={{color:c.text,fontSize:11}}>
     {summary.played[kind]} jugadas · {summary.hit[kind]} coincidencias ·
     {summary.turnsWon[kind]} turnos con acierto
    </Text>
   </View>)}
   <Pressable accessibilityRole="button" onPress={()=>{void refreshWeek()}}
    disabled={busy||!weekRecords.length} style={[s.freeze,{
     backgroundColor:c.button,opacity:(busy||!weekRecords.length)?0.45:1}]}>
    <Text style={{color:c.buttonText,fontWeight:'900',textAlign:'center'}}>
     {busy?'CONSULTANDO…':'ACTUALIZAR RESULTADOS DE LA SEMANA'}
    </Text>
   </Pressable>
   {weekRecords.length?weekRecords.slice().sort((a,b)=>
    recordId(a.snapshot.pre.date,a.snapshot.pre.turn).localeCompare(
     recordId(b.snapshot.pre.date,b.snapshot.pre.turn)))
    .map(r=>{
     const result=evaluatePapa(r),p=r.snapshot.pre;
     return <View key={recordId(p.date,p.turn)} style={[s.weekItem,{borderColor:c.border}]}>
      <Text style={[s.pickText,{color:c.text}]}>{shortDate(p.date)} · {p.turn}</Text>
      <Text style={[s.muted,{color:c.subtext}]}>
       {result.jurisdictions}/5 cabezas · VT2 {result.hits.vt2} · VT3 {result.hits.vt3} · VT4 {result.hits.vt4}
      </Text>
     </View>;
    }):<Text style={[s.small,{color:c.muted}]}>Todavía no hay pronósticos personales congelados esta semana.</Text>}
   <Text style={[s.small,{color:c.subtext}]}>
    Los registros quedan en este dispositivo. Si cambiás de teléfono o borrás los datos de la app,
    pueden perderse. Las estadísticas describen jugadas acertadas; no prueban una ventaja predictiva.
   </Text>
  </View>}
  {error?<Text style={[s.error,{color:c.text,backgroundColor:c.callout}]}>{error}</Text>:null}
 </View>;
}
const s=StyleSheet.create({
 main:{gap:10,marginTop:10},hero:{padding:13,borderRadius:12,borderWidth:1},
 title:{fontSize:17,fontWeight:'900'},subtitle:{fontSize:13,fontWeight:'900'},
 small:{fontSize:11,lineHeight:17,marginTop:7},muted:{fontSize:10,lineHeight:16,marginTop:4},
 switches:{flexDirection:'row',gap:8,marginTop:11},
 switch:{flex:1,borderWidth:1,borderRadius:8,padding:11,alignItems:'center'},
 panel:{padding:11,borderWidth:1,borderRadius:12,gap:10},
 editor:{marginTop:10,gap:9},sourceRow:{gap:7,paddingVertical:2},
 sourceTab:{borderWidth:1,borderRadius:7,padding:8},
 chooseWrap:{alignItems:'flex-start',gap:7,marginTop:5},
 chooseTitle:{fontSize:12,fontWeight:'900'},
 pickGrid:{width:106,flexDirection:'row',flexWrap:'wrap',gap:3},
 pickCell:{width:51,height:42,borderRadius:6,alignItems:'center',justifyContent:'center'},
 pickDigit:{fontSize:18,fontWeight:'900'},
 pickOrder:{position:'absolute',top:0,right:3,fontSize:9,fontWeight:'900'},
 preview:{borderRadius:8,padding:10},
 controls:{flexDirection:'row',flexWrap:'wrap',gap:7,alignItems:'center'},
 secondary:{paddingHorizontal:9,paddingVertical:9,borderWidth:1,borderRadius:8},
 primary:{paddingHorizontal:11,paddingVertical:10,borderRadius:8},
 kindSection:{paddingTop:9,borderTopWidth:1,gap:5},
 pickRow:{borderWidth:1,borderRadius:8,padding:8,flexDirection:'row',alignItems:'center',gap:8},
 pickText:{fontSize:12,fontWeight:'800'},
 delete:{padding:7},freeze:{padding:12,borderRadius:9,marginTop:10},
 seal:{padding:10,borderRadius:9,gap:4},resultText:{fontSize:12,fontWeight:'800',marginTop:4},
 weekBar:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:5},
 stats:{flexDirection:'row',flexWrap:'wrap',gap:8},
 stat:{width:'48%',padding:9,borderRadius:9},
 statLine:{paddingVertical:10,borderBottomWidth:1,gap:4},
 weekItem:{padding:9,borderWidth:1,borderRadius:8},
 error:{padding:10,borderRadius:8,fontSize:11,lineHeight:17}
});
