/**
 * después del sorteo observacional: explica qué pasó con cada VT3 realmente sorteado.
 * Usa el antes del sorteo del turno para cotejar rutas; no genera pronósticos nuevos,
 * no cambia rankings y no penaliza ausencia de hoja AUX HOY en Previa.
 */
import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {JURS} from '../domain';
import type {CabezasDia,Turno} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloView} from '../motorLalo';
import type {TrackingAuxInput} from '../figureTracking';
import type {AuxMode} from '../auxTemporalModes';
import {auxAtCut} from '../auxTemporalModes';
import {auxiliaryBoard,findAuxPaths} from '../auxSantiagoNeuquen';
import {auditVt3Family} from '../vt3Audit';
import type {Vt3FamilyDiagnostic} from '../vt3Audit';
import {reversibleFamily} from '../motorLalo';
import {useLaloTheme} from './LaloTheme';

type Props={date:string;turn:Turno;data:CabezasDia|null;
 sheet:DailySheet|null;view:LaloView|null;
 ayer:TrackingAuxInput;hoy:TrackingAuxInput;
 onFocusFamily:(family:string)=>void;
 onOpenAux:(family:string,mode:AuxMode)=>void;
 onOpenTracking:()=>void};
type AuxPresence={available:boolean;formable:boolean;rank:number|null;
 topComplete:boolean};
const objective=JURS.filter(j=>j!=='Montevideo');
function auxPresence(input:TrackingAuxInput,turn:Turno,family:string):AuxPresence{
 if(!input.heads)return {available:false,formable:false,rank:null,topComplete:false};
 const board=auxiliaryBoard(auxAtCut(input.heads,turn,input.mode),turn);
 if(!board.cells.length)return {available:false,formable:false,rank:null,topComplete:false};
 const formable=family.split('/').some(d=>findAuxPaths(board,d).length>0);
 const ranks=input.view?.ranks[3]||[];
 const rank=ranks.find(r=>r.family===family)?.rank??null;
 return {available:true,formable,rank,topComplete:ranks.length>=10};
}
function auxDescription(p:AuxPresence){
 if(!p.available)return 'Sin hoja en este corte';
 if(!p.formable)return 'No se forma';
 if(p.rank===null)return 'Formable · sin raíz reconocida';
 return p.rank<=10?'Top10 · #'+p.rank:'Con raíz · #'+p.rank;
}
function laloDescription(d:Vt3FamilyDiagnostic|null){
 if(!d)return 'antes del sorteo no disponible';
 switch(d.status){
  case 'SIN_FORMACION':return 'No se forma';
  case 'FISICA_SIN_ANCLAJE':return 'Formable · sin raíz D−1/D−7';
  case 'EN_TOP3':return 'Top3 · #'+d.officialRank;
  case 'EN_TOP10':return 'Top10 · #'+d.officialRank;
  case 'FUERA_TOP10':return 'Con antecedentes · #'+d.officialRank;
 }
}
export default function Vt3DiagnosticPanel({date,turn,data,sheet,view,
 ayer,hoy,onFocusFamily,onOpenAux,onOpenTracking}:Props){
 const {colors:c}=useLaloTheme();
 const [open,setOpen]=useState<string|null>(null);
 const rows=useMemo(()=>objective.flatMap(jur=>{
  const head=data?.[turn]?.[jur]||'';
  if(!/^\d{4}$/.test(head))return [];
  const family=reversibleFamily(head.slice(-3));
  const diagnostic=sheet&&view?auditVt3Family(sheet,view,turn,head):null;
  return [{jur,head,family,diagnostic,anterior:auxPresence(ayer,turn,family),
   intrajornada:auxPresence(hoy,turn,family)}];
 }),[data,turn,sheet,view,ayer,hoy]);
 const total=rows.length,complete=total===5;
 const counts=(field:'lalo'|'anterior'|'intrajornada')=>{
  if(field==='lalo')return {
   physical:rows.filter(r=>!!r.diagnostic?.physicalRoutes).length,
   ranked:rows.filter(r=>r.diagnostic?.officialRank!==null&&r.diagnostic!==null).length,
   top10:rows.filter(r=>r.diagnostic?.top10).length
  };
  return {physical:rows.filter(r=>r[field].formable).length,
   ranked:rows.filter(r=>r[field].rank!==null).length,
   top10:rows.filter(r=>r[field].topComplete&&r[field].rank!==null&&
    r[field].rank!<=10).length};
 };
 const tallies=[
  {id:'lalo' as const,title:'Lalo +11',x:counts('lalo')},
  {id:'anterior' as const,title:'Aux Ayer',x:counts('anterior')},
  {id:'intrajornada' as const,title:'Aux Hoy',x:counts('intrajornada')}
 ];
 return <View style={s.wrapper}>
  <Text style={[s.body,{color:c.subtext}]}>
   Este análisis explica las cabezas reales del turno usando únicamente las
   hojas y los rankings disponibles antes de ese sorteo. No agrega
   familias al Top10.
  </Text>
  {total===0?<View style={[s.empty,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.bold,{color:c.text}]}>Todavía no hay cabezas publicadas para {turn}.</Text>
   <Text style={[s.body,{color:c.subtext}]}>
    Podés consultar las formaciones antes del sorteo en «Seguir un número». El diagnóstico
    de aciertos se completa después del resultado.
   </Text>
  </View>:<>
   <Text style={[s.bold,{color:c.text}]}>
    {complete?'Turno completo':'Turno parcial'} · {total} de 5 cabezas
   </Text>
   {!complete?<Text style={[s.body,{color:c.subtext}]}>
    Los conteos son parciales: no representan una jornada terminada.
   </Text>:null}
   <View style={s.summaryRow}>
    {tallies.map(({id,title,x})=><View key={id} style={[s.summary,{
     borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
     <Text style={[s.smallBold,{color:c.text}]}>{title}</Text>
     <Text style={[s.stat,{color:c.accent}]}>{x.physical}/{total}</Text>
     <Text style={[s.tiny,{color:c.subtext}]}>Se formaron</Text>
     <Text style={[s.tiny,{color:c.subtext}]}>
      {x.ranked} con antecedentes · {x.top10} Top10
     </Text>
    </View>)}
   </View>
   {rows.map(row=>{
    const expanded=open===row.jur;
    const routeAvailable=(row.diagnostic?.physicalRoutes||0)>0;
    const auxMode:AuxMode|null=row.anterior.formable?'anterior':
     row.intrajornada.formable?'intrajornada':null;
    return <View key={row.jur} style={[s.case,{borderColor:c.border,
     backgroundColor:c.surfaceAlt}]}>
     <Pressable accessibilityRole="button"
      accessibilityState={{expanded}}
      onPress={()=>setOpen(v=>v===row.jur?null:row.jur)}
      style={s.head}>
      <View style={{flex:1,gap:2}}>
       <Text style={[s.bold,{color:c.text}]}>{row.jur} · {row.head}</Text>
       <Text style={[s.body,{color:c.subtext}]}>Familia VT3 {row.family}</Text>
      </View>
      <Text style={[s.chevron,{color:c.accent}]}>{expanded?'−':'+'}</Text>
     </Pressable>
     <View style={s.quick}>
      <Text style={[s.body,{color:c.text}]}>Lalo: {laloDescription(row.diagnostic)}</Text>
      <Text style={[s.body,{color:c.text}]}>Aux Ayer: {auxDescription(row.anterior)}</Text>
      <Text style={[s.body,{color:c.text}]}>Aux Hoy: {auxDescription(row.intrajornada)}</Text>
     </View>
     {expanded?<View style={[s.more,{borderTopColor:c.border}]}>
      <Text style={[s.body,{color:c.subtext}]}>
       {row.diagnostic?.explanation||'No hay ranking Lalo para analizar este corte.'}
      </Text>
      {row.diagnostic?.physicalRoutes?<Text style={[s.body,{color:c.subtext}]}>
       {row.diagnostic.physicalRoutes} recorrido(s) físico(s) en
       {row.diagnostic.physicalSources} fuente(s). {row.diagnostic.independentRootEvents} cabeza(s)
       histórica(s) independiente(s) reconocida(s) por Lalo.
      </Text>:null}
      {row.diagnostic?.priorityReasons.filter(x=>x.cutoff===10)
       .map(r=><Text key={r.cutoff} style={[s.body,{color:c.subtext}]}>
        Fuera del Top10 frente a {r.boundaryFamily} (#{r.boundaryRank}):
        {' '}{r.decisiveCriterion}.
       </Text>)}
      {routeAvailable?<Pressable accessibilityRole="button"
       onPress={()=>onFocusFamily(row.family)} style={[s.action,{borderColor:c.accent}]}>
       <Text style={[s.actionText,{color:c.accent}]}>Ver minihojas y antecedentes de esta familia ›</Text>
      </Pressable>:auxMode?<Pressable accessibilityRole="button"
       onPress={()=>onOpenAux(row.family,auxMode)} style={[s.action,{borderColor:c.accent}]}>
       <Text style={[s.actionText,{color:c.accent}]}>
        Ver recorrido en Aux {auxMode==='anterior'?'Ayer':'Hoy'} ›
       </Text>
      </Pressable>:null}
     </View>:null}
    </View>;
   })}
  </>}
  <Pressable accessibilityRole="button"
   onPress={onOpenTracking} style={[s.action,{borderColor:c.accent}]}>
   <Text style={[s.actionText,{color:c.accent}]}>Abrir seguimiento completo de figuras VT3 ›</Text>
  </Pressable>
  <Text style={[s.tiny,{color:c.muted}]}>
   Se reconstruye el corte antes del sorteo de {date}. No es una captura sellada antes
   del sorteo. Un recorrido físico por sí solo no predice resultados;
   «sin antecedentes» se refiere exclusivamente a las reglas oficiales D−1/D−7.
  </Text>
 </View>;
}
const s=StyleSheet.create({
 wrapper:{gap:12},body:{fontSize:12,lineHeight:18},bold:{fontSize:14,fontWeight:'900'},
 smallBold:{fontSize:11,fontWeight:'900'},tiny:{fontSize:10,lineHeight:15},
 stat:{fontSize:19,fontWeight:'900'},summaryRow:{flexDirection:'row',gap:6},
 summary:{flex:1,minWidth:0,padding:8,borderRadius:10,borderWidth:1,gap:2},
 empty:{borderWidth:1,borderRadius:10,padding:12,gap:7},
 case:{borderWidth:1,borderRadius:12,padding:11,gap:8},
 head:{flexDirection:'row',alignItems:'center',gap:8},
 chevron:{fontSize:22,fontWeight:'900'},
 quick:{gap:4},
 more:{borderTopWidth:1,paddingTop:10,gap:9},
 action:{paddingVertical:10,paddingHorizontal:12,borderWidth:1,borderRadius:10},
 actionText:{fontSize:12,fontWeight:'800'}
});
