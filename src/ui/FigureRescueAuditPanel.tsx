import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {DailySheet,SourceId} from '../sheet';
import type {Turno} from '../domain';
import type {LaloView} from '../motorLalo';
import type {FormMotorView,FormCell} from '../motorFormasPrimero';
import type {InfoVisualDay} from '../infoTurnHistory';
import {readableWeekday} from '../infoTurnHistory';
import {buildFigureRescueAudit} from '../figureRescueAudit';
import type {AuditedFormChoice,AuditedLaloOnly} from '../figureRescueAudit';
import {useLaloTheme} from './LaloTheme';
import RouteMiniBoard from './RouteMiniBoard';

type Filter='RESCATE'|'COMPARTIDO'|'LALO';
type Board={source:SourceId;cells:FormCell[];label:string;key:string};
export default function FigureRescueAuditPanel({date,turn,pre,forms,lalo,days,published}:{
 date:string;turn:Turno;pre:DailySheet|null;forms:FormMotorView|null;
 lalo:LaloView|null;days:InfoVisualDay[];
 published:{jur:string;head:string}[];
}){
 const {colors:c,kinds}=useLaloTheme();
 const [filter,setFilter]=useState<Filter>('RESCATE');
 const [selected,setSelected]=useState<string|null>(null);
 const [showAllRoots,setShowAllRoots]=useState(false);
 const report=useMemo(()=>pre&&forms&&lalo?
  buildFigureRescueAudit(date,turn,pre,forms,lalo,published):null,
  [date,turn,pre,forms,lalo,published]);
 if(!report)return null;
 const formItems=report.forms.filter(x=>x.kind===filter);
 const listed=filter==='LALO'?report.laloOnly:formItems;
 const labelFor=(x:AuditedFormChoice|AuditedLaloOnly)=>
  'choice' in x?x.choice.family:x.family;
 const keyFor=(x:AuditedFormChoice|AuditedLaloOnly)=>
  ('choice' in x?'F|':'L|')+labelFor(x);
 const focused=listed.find(x=>keyFor(x)===selected);
 const chosen='choice' in (focused||{})?focused as AuditedFormChoice:null;
 const onlyLalo=focused&&!chosen?focused as AuditedLaloOnly:null;
 const current=chosen?pre?.columns.find(col=>col.id===chosen.choice.source):null;
 const roots=chosen?.choice.support.roots||[];
 const groupedRoots=roots.filter((r,i)=>roots.findIndex(q=>q.event===r.event&&q.source===r.source&&
  q.cells.map(c=>c.row+':'+c.col).join('>')===r.cells.map(c=>c.row+':'+c.col).join('>'))===i);
 const shownRoots=showAllRoots?groupedRoots:groupedRoots.slice(0,8);
 const bgStyle={backgroundColor:c.card,borderColor:c.border};
 const boards:Board[]=onlyLalo?onlyLalo.routes.map((x,i)=>({
  source:x.sourceId,cells:x.path.map(c=>({row:c.row,col:c.col})),
  label:x.origin+' · '+x.value,key:'lalo-'+i
 })):[];
 return <View style={[s.panel,{backgroundColor:c.surfaceAlt,borderColor:c.accent}]}>
  <Text style={[s.heading,{color:c.accent}]}>AUDITORÍA DE FIGURAS · VT3</Text>
  <Text style={[s.note,{color:c.text}]}>
   Observamos las familias propuestas por Formas Primero fuera del Top10 de Lalo,
   las coincidencias entre motores y las familias que sólo eligió Lalo.
   La lista sigue siendo el PRE reconstructivo: un POST no cambia prioridades.
  </Text>
  <View style={[s.summary,bgStyle]}>
   <Text style={[s.emphasis,{color:c.text}]}>
    {report.rescueCount} rescatadas · {report.sharedCount} compartidas ·
    {' '}{report.laloOnlyCount} sólo Lalo
   </Text>
   <Text style={[s.note,{color:c.subtext}]}>
    {report.publicationCount?
     'POST '+(report.publicationCount<5?'parcial · ':'')+report.publicationCount+
     ' cabezas · Rescates '+report.rescueHeadHits+
     ' · Compartidas '+report.sharedHeadHits+
     ' · Sólo Lalo '+report.laloOnlyHeadHits:
     'POST pendiente: aún no hay cabezas verificadas para contrastar'}
   </Text>
   <Text style={[s.note,{color:c.muted}]}>
    Los rescates son candidatas fuera del Top10 de Lalo, no aciertos confirmados.
   </Text>
  </View>
  <View style={s.filters}>
   {([
    ['RESCATE','Rescatadas'],
    ['COMPARTIDO','Compartidas'],
    ['LALO','Sólo Lalo']
   ] as const).map(([id,label])=><Pressable key={id}
    accessibilityRole="button" accessibilityState={{selected:filter===id}}
    onPress={()=>{setFilter(id);setSelected(null);setShowAllRoots(false)}}
    style={[s.chip,{borderColor:filter===id?c.accent:c.border,
     backgroundColor:filter===id?c.accentFill:c.card}]}>
    <Text style={{color:filter===id?c.accent:c.text,fontWeight:'800',fontSize:11}}>
     {label}
    </Text>
   </Pressable>)}
  </View>
  {listed.map(item=>{
   const family=labelFor(item),id=keyFor(item);
   const hit=item.published.length>0;
   const active=selected===id;
   const form='choice' in item?item:null;
   return <Pressable accessibilityRole="button" key={id}
    onPress={()=>{setSelected(active?null:id);setShowAllRoots(false)}}
    style={[s.candidate,{borderColor:hit?kinds.vt3.line:c.border,
     backgroundColor:hit?kinds.vt3.fill:c.card,borderWidth:hit?2:1}]}>
    <Text style={{color:c.text,fontSize:13,fontWeight:'900'}}>
     {active?'▾':'▸'} {family}
     {'  ·  '}#{form?.choice.rank??(item as AuditedLaloOnly).rank}
     {hit?'  ✓ POST familia':''}
    </Text>
    <Text style={[s.note,{color:c.subtext}]}>
     {form?
      'Figura '+form.choice.source+' · fila '+(form.choice.anchor+1)+
      ' · '+form.choice.support.events+' evento(s) ganadores anteriores':
      (item as AuditedLaloOnly).routes.length+' recorridos admitidos por Lalo'}
    </Text>
   </Pressable>;
  })}
  {!listed.length?<Text style={[s.note,{color:c.subtext}]}>
   Este corte no tiene propuestas de esta categoría.
  </Text>:null}
  {chosen&&current?<View style={[s.detail,bgStyle]}>
   <Text style={[s.emphasis,{color:c.text}]}>
    FIGURA QUE FORMAS PRIMERO ELIGIÓ ANTES DE LEER CIFRAS
   </Text>
   <Text style={[s.note,{color:c.subtext}]}>
    {chosen.choice.source} · fila {chosen.choice.anchor+1} ·
    {' '}{chosen.choice.cells.map(p=>'F'+(p.row+1)+(p.col?'D':'I')).join(' → ')}
   </Text>
   <RouteMiniBoard values={current.values} cells={chosen.choice.cells} kind="vt3"/>
   <Text style={[s.note,{color:c.text}]}>
    Aquí forma {chosen.choice.value} · familia {chosen.choice.family}.
    {' '}{chosen.laloRank?'Lalo la ubica en #'+chosen.laloRank:
     'No aparece en el Top10 de Lalo.'}
   </Text>
   <Text style={[s.note,{color:c.subtext}]}>
    Antecedentes geométricos: {chosen.choice.support.days} jornada(s);
    {' '}{chosen.choice.support.events} cabeza(s) anterior(es) distinta(s);
    {' '}{chosen.choice.support.sameSource} en la misma fuente.
    {' '}{chosen.choice.support.d1?'Hay marca D−1. ':''}
    {chosen.choice.support.d7?'Hay marca D−7. ':''}
   </Text>
   <Text style={[s.emphasis,{color:c.text}]}>
    ANTECEDENTES REALES QUE RESPALDAN ESTA SILUETA
   </Text>
   <Text style={[s.note,{color:c.muted}]}>
    Cada minihoja corresponde a una cabeza POST histórica verdadera, con
    su ruta original, aunque haya formado otras cifras. No son
    predicciones de la hoja actual.
   </Text>
   <ScrollView horizontal nestedScrollEnabled contentContainerStyle={s.hScroll}>
    {shownRoots.map((r,i)=>{
     const col=days.find(d=>d.date===r.date)?.sheet.columns.find(x=>x.id===r.source);
     return <View key={r.event+'|'+r.source+'|'+i} style={[s.mini,bgStyle]}>
      <Text style={[s.note,{color:c.text,fontWeight:'800'}]}>
       {readableWeekday(r.date)} · {r.turn}
      </Text>
      <Text style={[s.note,{color:c.text}]}>
       {r.jurisdiction} {r.head} · tramo {r.reading}
      </Text>
      {col?<RouteMiniBoard kind="vt3" compact values={col.values} cells={r.cells}/>:
       <Text style={[s.note,{color:c.muted}]}>Hoja antigua no disponible</Text>}
      <Text style={[s.note,{color:c.subtext}]}>{r.source} · fila {r.anchor+1}</Text>
     </View>;
    })}
   </ScrollView>
   {groupedRoots.length>8?<Pressable accessibilityRole="button"
    onPress={()=>setShowAllRoots(x=>!x)}>
    <Text style={{color:c.accent,fontWeight:'800',fontSize:12}}>
     {showAllRoots?'Ver primeros 8':'Ver los '+groupedRoots.length+' recorridos históricos'}
    </Text>
   </Pressable>:null}
  </View>:null}
  {onlyLalo?<View style={[s.detail,bgStyle]}>
   <Text style={[s.emphasis,{color:c.text}]}>RECORRIDOS RECONOCIDOS POR LALO</Text>
   <Text style={[s.note,{color:c.subtext}]}>
    {boards.length} recorrido(s) físicos admitidos, todos dentro de su
    columna. No hay una ruta elegida por Formas Primero para esta familia.
   </Text>
   <ScrollView horizontal nestedScrollEnabled contentContainerStyle={s.hScroll}>
    {boards.map(b=>{
     const col=pre?.columns.find(x=>x.id===b.source);
     return <View key={b.key} style={[s.mini,bgStyle]}>
      <Text style={[s.note,{color:c.text,fontWeight:'800'}]}>
       {b.source} · {b.label}
      </Text>
      {col?<RouteMiniBoard kind="vt3" compact values={col.values} cells={b.cells}/>:null}
     </View>;
    })}
   </ScrollView>
  </View>:null}
  {focused?<View style={[s.detail,bgStyle]}>
   <Text style={[s.emphasis,{color:c.text}]}>
    CONTRASTE POST — NÚMERO Y RECORRIDO FÍSICO
   </Text>
   {report.publicationCount===0?<Text style={[s.note,{color:c.muted}]}>
    POST pendiente. No se interpreta todavía como acierto ni desacierto.
   </Text>:focused.published.length===0?<Text style={[s.note,{color:c.subtext}]}>
    Ninguna de las cabezas publicadas hasta ahora termina con esta familia VT3.
   </Text>:focused.published.map((h,i)=><View key={h.jur+'|'+h.head+'|'+i}
    style={[s.result,{borderColor:kinds.vt3.line,backgroundColor:c.surfaceAlt}]}>
    <Text style={[s.emphasis,{color:c.text}]}>
     {h.jur} {h.head} · últimas 3: {h.suffix}
    </Text>
    <Text style={[s.note,{color:c.subtext}]}>
     {h.physicalPaths.length} recorrido(s) físico(s) válido(s) en la hoja PRE;
     {' '}{chosen?(h.selectedPositionMatches?
      'entre ellos, el recorrido elegido por Formas Primero.':
      'no está el recorrido elegido por Formas Primero.'):
      'sin ruta elegida por Formas Primero.'}
    </Text>
    <ScrollView horizontal nestedScrollEnabled contentContainerStyle={s.hScroll}>
     {h.physicalPaths.map((p,j)=>{
      const col=pre?.columns.find(x=>x.id===p.source);
      return <View key={p.positionKey+'|'+j} style={[s.mini,bgStyle]}>
       <Text style={[s.note,{color:c.text,fontWeight:'800'}]}>
        {p.source} · {p.orientation==='INVERSA'?'lectura inversa':'lectura directa'}
       </Text>
       {col?<RouteMiniBoard kind="vt3" compact values={col.values} cells={p.cells}/>:null}
       <Text style={[s.note,{color:c.subtext}]}>
        {chosen&&p.positionKey===chosen.choice.positionKey?
         'Recorrido seleccionado antes del sorteo':'Otro recorrido válido'}
       </Text>
      </View>;
     })}
    </ScrollView>
   </View>)}
   <Text style={[s.note,{color:c.muted}]}>
    Importante: la coincidencia con una figura PRE sólo verifica que sus
    cifras forman la terminación publicada. NO demuestra que el sorteo siguió
    esa trayectoria ni que la figura cause el acierto.
    Se muestran todos los recorridos físicos, sin elegir uno después del resultado.
   </Text>
  </View>:null}
  <Text style={[s.note,{color:c.muted}]}>
   Auditoría descriptiva con PRE reconstructivo, no sellado. Clasificar
   rescates y mostrar POST no modifica Lalo MV1 ni los Tops de Formas Primero.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 panel:{borderWidth:1,borderRadius:13,marginTop:12,padding:12,gap:9},
 heading:{fontSize:15,fontWeight:'900'},
 note:{fontSize:11,lineHeight:17},
 emphasis:{fontSize:12,fontWeight:'900'},
 summary:{padding:10,borderWidth:1,borderRadius:9,gap:5},
 filters:{flexDirection:'row',flexWrap:'wrap',gap:5},
 chip:{paddingHorizontal:9,paddingVertical:8,borderWidth:1,borderRadius:8},
 candidate:{padding:9,borderWidth:1,borderRadius:8,gap:4},
 detail:{padding:10,borderWidth:1,borderRadius:10,gap:9},
 hScroll:{gap:9,paddingBottom:4},
 mini:{width:180,padding:7,borderRadius:8,borderWidth:1,gap:5},
 result:{borderWidth:1,borderRadius:8,padding:8,gap:8}
});