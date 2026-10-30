/**
 * EXPLORADOR EXPERIMENTAL: extensiones VT3 de madres VT2 +11.
 *
 * No modifica motor, familia, Top10 ni intención de apuesta.
 * Los dos tableros AUX jamás se conectan entre sí para formar una lectura.
 * Ayer: tres columnas disponibles desde Previa (se usa Nocturno para
 * construir el tablero físico COMPLETO, sin tomar resultado objetivo).
 * Hoy: sólo columnas publicadas ANTES del turno objetivo.
 */
import React,{useMemo,useState,useEffect} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import {TURNOS} from '../domain';
import type {DailySheet} from '../sheet';
import type {LaloHistorical} from '../motorLalo';
import {buildMotorLalo,reversibleFamily} from '../motorLalo';
import type {InfoVisualDay} from '../infoTurnHistory';
import {buildFormFirstMotor} from '../motorFormasPrimero';
import {buildExperimentalVt2} from '../experimentalVt2';
import {preSheetAtCut} from '../infoCandidatos';
import type {AuxiliaryHeads,AuxiliaryBoard,AuxPath} from '../auxSantiagoNeuquen';
import {auxiliaryBoard,findAuxPaths,auxCanonicalPath} from '../auxSantiagoNeuquen';
import {auxAtCut} from '../auxTemporalModes';
import type {AuxiliarHistory} from '../motorLaloAuxiliar';
import {buildAuxIndependent} from '../motorLaloIntegral';
import {auxiliaryWitnesses} from '../labTresHojasTestigos';
import type {Witness} from '../labTresHojasTestigos';
import {buildExtensionSnapshot} from '../labExtensionesAux';
import type {Mother,ExtensionOption} from '../labExtensionesAux';
import {groupByOrientedMother} from '../labReduccionExtensiones';
import type {Figure} from '../labRadarFiguras';
import {figuresInTop} from '../labRadarFiguras';
import {AuxMiniBoard} from './AuxRouteMiniPreview';
import {useLaloTheme} from './LaloTheme';

type Props={date:string;turn:Turno;sheet:DailySheet|null;
 historical:LaloHistorical[];visualDays:InfoVisualDay[];
 auxYesterday:AuxiliaryHeads|null;auxToday:AuxiliaryHeads|null;
 pastYesterday:AuxiliarHistory[];pastToday:AuxiliarHistory[]};
type AuxKey='AUX_AYER'|'AUX_HOY';
const topTitles:Record<string,string>={LALO:'Lalo',
 GEOMETRIA:'Geometría',CONECTADAS:'Conectadas',
 FORMAS_PRIMERO:'Formas primero'};
const statusLabel=(s:ExtensionOption['status'])=>
 s==='AMBAS'?'Ayer + Hoy':s==='SOLO_AYER'?'Solo Ayer':
 s==='SOLO_HOY'?'Solo Hoy':'Sin camino';
const familyName=(v:string)=>reversibleFamily(v);
const unique=(x:Witness[])=>[...new Map(x.map(r=>[r.event+'|'+r.board,r])).values()];
const witnessesFor=(paths:AuxPath[],board:AuxKey,history:Witness[])=>{
 const sites=new Set(paths.map(auxCanonicalPath));
 return unique(history.filter(w=>w.board===board&&w.kind==='VT3'&&
  sites.has(w.site))).sort((a,b)=>b.date.localeCompare(a.date));
};
const addMother=(map:Map<string,Mother>,family:string,engine:string,rank:number)=>{
 const prior=map.get(family)||{family,engines:[],ranks:{}};
 if(!prior.engines.includes(engine))prior.engines.push(engine);
 prior.ranks[engine]=Math.min(prior.ranks[engine]??Infinity,rank);
 map.set(family,prior);
};
function ExplorerBody(p:Props){
 const {colors:c,kinds}=useLaloTheme();
 const [scope,setScope]=useState<'lalo'|'todos'>('lalo');
 const [mother,setMother]=useState<string|null>(null);
 const [option,setOption]=useState<string|null>(null);
 const [showAllRoutes,setShowAllRoutes]=useState(false);
 const [showWitnesses,setShowWitnesses]=useState(false);
 const pre=useMemo(()=>p.sheet?preSheetAtCut(p.sheet,p.turn,TURNOS.indexOf(p.turn)):null,
  [p.sheet,p.turn]);
 const reference=useMemo(()=>{
  if(!pre||!p.date)return null;
  const lalo=buildMotorLalo(pre,p.date,p.turn,p.historical.filter(x=>x.date<p.date));
  const all=new Map<string,Mother>();
  for(const f of lalo.ranks.vt2.slice(0,10))
   addMother(all,f.family,'LALO',f.rank);
  const days=[...p.visualDays,...p.historical].filter(x=>x.date<p.date);
  const experimental=buildExperimentalVt2(pre,p.date,p.turn,days);
  experimental.geometric.slice(0,10).forEach((f,i)=>
   addMother(all,f.family,'GEOMETRIA',i+1));
  experimental.connected.slice(0,10).forEach((f,i)=>
   addMother(all,f.family,'CONECTADAS',i+1));
  const forms=buildFormFirstMotor(pre,p.date,p.turn,
   p.visualDays.filter(x=>x.date<p.date),10,'vt2');
  forms.top.slice(0,10).forEach(f=>
   addMother(all,f.family,'FORMAS_PRIMERO',f.rank));
  return [...all.values()].sort((a,b)=>
   (a.ranks.LALO??99)-(b.ranks.LALO??99)||
   Math.min(...Object.values(a.ranks))-Math.min(...Object.values(b.ranks))||
   a.family.localeCompare(b.family));
 },[pre,p.date,p.turn,p.historical,p.visualDays]);
 // IMPORTANT: Ayer está completo desde el inicio de jornada. El argumento
 // 'Nocturno' se usa SOLO para renderizar sus 3 columnas; nunca lee resultado.
 const boardA=useMemo(()=>p.auxYesterday?
  auxiliaryBoard(auxAtCut(p.auxYesterday,p.turn,'anterior'),'Nocturno'):null,
  [p.auxYesterday,p.turn]);
 const boardH=useMemo(()=>p.auxToday?
  auxiliaryBoard(auxAtCut(p.auxToday,p.turn,'intrajornada'),p.turn):null,
  [p.auxToday,p.turn]);
 const roots=useMemo(()=>{
  const before=(arr:AuxiliarHistory[])=>
   arr.filter(x=>x.date<p.date&&x.aux.date===x.date);
  return [
   ...auxiliaryWitnesses(before(p.pastYesterday),'AUX_AYER'),
   ...auxiliaryWitnesses(before(p.pastToday),'AUX_HOY')
  ];
 },[p.date,p.pastYesterday,p.pastToday]);
 const auxRanks=useMemo(()=>{
  if(!boardA||!boardH||!p.auxYesterday||!p.auxToday||!p.date)return [];
  const out:Figure[]=[];
  const input:[AuxKey,AuxiliaryHeads,AuxiliarHistory[]][]=[
   ['AUX_AYER',auxAtCut(p.auxYesterday,p.turn,'anterior'),p.pastYesterday],
   ['AUX_HOY',auxAtCut(p.auxToday,p.turn,'intrajornada'),p.pastToday]
  ];
  for(const [mode,raw,past] of input){
   const ranks=buildAuxIndependent(p.date,p.turn,raw,
    past.filter(x=>x.date<p.date));
   const physicalBoard=mode==='AUX_AYER'?boardA:boardH;
   // Familias oficiales auxiliares indican Top10, pero cada ruta del
   // ejemplo se coteja contra el tablero PRE REAL de su modalidad.
   const chosen=ranks[3].slice(0,10);
   for(const item of chosen){
    const path=item.paths.find(path=>path.length===3&&path.every(cell=>
     physicalBoard.cells.some(x=>x.row===cell.row&&x.col===cell.col&&x.digit===cell.digit)));
    if(!path)continue;
    out.push(...figuresInTop([{
     date:p.date,turn:p.turn,board:mode,source:'Santiago-Neuquen',
     kind:'VT3',engine:mode,rank:item.rank,family:item.family,
     reading:path.map(x=>x.digit).join(''),
     cells:path.map(x=>({row:x.row,col:x.col}))
    }]));
   }
  }
  return out;
 },[p.date,p.turn,p.auxYesterday,p.auxToday,p.pastYesterday,p.pastToday,boardA,boardH]);
 const selectedMothers=useMemo(()=>reference?.filter(x=>
  scope==='todos'||x.engines.includes('LALO'))||[],[reference,scope]);
 useEffect(()=>{
  setMother(null);setOption(null);setShowAllRoutes(false);setShowWitnesses(false);
 },[p.date,p.turn,scope]);
 const snapshot=useMemo(()=>boardA&&boardH&&selectedMothers.length?
  buildExtensionSnapshot(p.date,p.turn,selectedMothers,boardA,boardH,
   auxRanks,roots):null,
  [p.date,p.turn,selectedMothers,boardA,boardH,auxRanks,roots]);
 const active=snapshot?.mothers.find(x=>x.family===(mother||snapshot.mothers[0]?.family));
 const bands=useMemo(()=>active?groupByOrientedMother(active):[],[active]);
 const picked=active?.options.find(x=>x.value===option&&x.status!=='NINGUNA');
 const routeA=useMemo(()=>picked&&boardA?findAuxPaths(boardA,picked.value):[],
  [picked,boardA]);
 const routeH=useMemo(()=>picked&&boardH?findAuxPaths(boardH,picked.value):[],
  [picked,boardH]);
 const visibleRoutes=(routes:AuxPath[])=>showAllRoutes?routes:routes.slice(0,2);
 const renderPaths=(board:AuxiliaryBoard,paths:AuxPath[],mode:AuxKey)=>{
  const witness=witnessesFor(paths,mode,roots);
  return <View key={mode} style={[s.pathCard,{borderColor:c.border,backgroundColor:c.card}]}>
   <Text style={[s.sub,{color:kinds.vt3.line}]}>
    {mode==='AUX_AYER'?'Auxiliar Ayer':'Auxiliar Hoy'} · {paths.length} recorridos
   </Text>
   {!paths.length?<Text style={[s.note,{color:c.subtext}]}>No hay formación física.</Text>:
   <ScrollView horizontal nestedScrollEnabled
    showsHorizontalScrollIndicator contentContainerStyle={{gap:10,paddingVertical:5}}>
    {visibleRoutes(paths).map((path,i)=><View key={i} style={{gap:3}}>
     <Text style={[s.small,{color:c.subtext}]}>Camino {i+1} de {paths.length}</Text>
     <AuxMiniBoard board={board} path={path} kind="vt3" compact/>
    </View>)}
   </ScrollView>}
   <Text style={[s.small,{color:c.subtext}]}>
    {witness.length} cabezas históricas verificadas en estas casillas
   </Text>
   {showWitnesses&&witness.length?witness.slice(0,12).map((w,i)=>
    <Text key={w.event+'|'+i} style={[s.small,{color:c.text}]}>
     {w.date} · {w.turn} · {w.jur} {w.head}
    </Text>):null}
  </View>;
 };
 if(!p.sheet||!reference)return <Text style={{color:c.subtext}}>
  Cargá primero la hoja y su historial de Lalo.
 </Text>;
 if(!boardA||!boardH)return <Text style={{color:c.subtext}}>
  Para ver extensiones hacen falta las dos hojas Santiago–Neuquén.
 </Text>;
 return <View style={{gap:9}}>
  <Text style={[s.note,{color:c.subtext}]}>
   Cada madre VT2 conserva su Top10. Miramos TODAS las VT3 que pueden formarse
   físicamente en las auxiliares, incluso fuera de sus Tops. Sin mezclar hojas.
  </Text>
  <View style={s.line}>
   {([['lalo','Solo madres Lalo'],['todos','Todos los motores +11']] as const)
    .map(([id,label])=><Pressable key={id} accessibilityRole="button"
     accessibilityState={{selected:scope===id}} onPress={()=>setScope(id)}
     style={[s.pill,{borderColor:scope===id?c.accent:c.border,
      backgroundColor:scope===id?c.accentFill:c.card}]}>
     <Text style={[s.small,{color:c.text,fontWeight:'800'}]}>{label}</Text>
    </Pressable>)}
  </View>
  <Text style={[s.small,{color:c.subtext}]}>
   {selectedMothers.length} madres VT2 · tocá una para abrir sus extensiones
  </Text>
  <View style={s.line}>{selectedMothers.map(m=><Pressable key={m.family}
   accessibilityRole="button"
   accessibilityState={{selected:(mother||selectedMothers[0]?.family)===m.family}}
   onPress={()=>{setMother(m.family);setOption(null);setShowAllRoutes(false)}}
   style={[s.family,{borderColor:(mother||selectedMothers[0]?.family)===m.family?
    c.accent:c.border,backgroundColor:(mother||selectedMothers[0]?.family)===m.family?
    c.accentFill:c.card}]}>
   <Text style={{color:c.text,fontSize:12,fontWeight:'900'}}>{m.family}</Text>
   <Text style={{color:c.subtext,fontSize:9}}>
    {m.ranks.LALO?'Lalo #'+m.ranks.LALO:
     m.engines.map(x=>topTitles[x]||x).join(' · ')}
   </Text>
  </Pressable>)}</View>
  {active?<View style={[s.group,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.sub,{color:c.text}]}>
    Madre {active.family} · {active.options.filter(x=>x.status!=='NINGUNA').length}
    {' '}VT3 con al menos un recorrido válido
   </Text>
   <Text style={[s.note,{color:c.subtext}]}>
    Dos orientaciones de lectura; una cifra puede aparecer en varias formas
    físicas diferentes. Tocala para ver sus caminos y antecedentes.
   </Text>
   {bands.length?bands.map(band=><View key={band.orientedSuffix}
    style={[s.band,{backgroundColor:c.card,borderColor:c.border}]}>
    <Text style={[s.sub,{color:c.accent}]}>
     _{band.orientedSuffix} · {band.count} extensiones
    </Text>
    <View style={s.line}>{band.options.map(o=><Pressable
     key={o.value} accessibilityRole="button"
     accessibilityState={{selected:picked?.value===o.value}}
     onPress={()=>{setOption(o.value);setShowAllRoutes(false);setShowWitnesses(false)}}
     style={[s.digit,{borderColor:picked?.value===o.value?
      kinds.vt3.line:c.border,backgroundColor:picked?.value===o.value?
      kinds.vt3.fill:c.surface}]}>
     <Text style={[s.number,{color:c.text}]}>{o.value}</Text>
     <Text style={[s.tiny,{color:c.subtext}]}>
      {o.status==='AMBAS'?'A+H':o.status==='SOLO_AYER'?'AYER':'HOY'}
     </Text>
    </Pressable>)}</View>
   </View>):<Text style={[s.note,{color:c.muted}]}>
    Esta madre no forma extensiones VT3 en ninguna auxiliar para este corte.
   </Text>}
  </View>:null}
  {picked?<View style={[s.group,{borderColor:kinds.vt3.line,backgroundColor:c.surfaceAlt}]}>
   <Text style={[s.sub,{color:kinds.vt3.line}]}>
    {picked.value} · {statusLabel(picked.status)}
   </Text>
   <Text style={[s.note,{color:c.subtext}]}>
    Ayer: {picked.ayer} caminos · Hoy: {picked.hoy} caminos
    {'\n'}VT3 Top10 auxiliar: Ayer {picked.rankVT3Ayer?
     '#'+picked.rankVT3Ayer:'fuera del Top10'} · Hoy {picked.rankVT3Hoy?
     '#'+picked.rankVT3Hoy:'fuera del Top10'}
   </Text>
   {boardA?renderPaths(boardA,routeA,'AUX_AYER'):null}
   {boardH?renderPaths(boardH,routeH,'AUX_HOY'):null}
   <View style={s.line}>
    {(routeA.length>2||routeH.length>2)?<Pressable accessibilityRole="button"
      onPress={()=>setShowAllRoutes(x=>!x)}
      style={[s.pill,{borderColor:c.accent,backgroundColor:c.card}]}>
      <Text style={[s.small,{color:c.accent,fontWeight:'900'}]}>
       {showAllRoutes?'Ver menos caminos':'Mostrar todos los caminos'}
      </Text>
     </Pressable>:null}
    {(picked.winnerEventsAyer+picked.winnerEventsHoy)>0?<Pressable
      accessibilityRole="button" onPress={()=>setShowWitnesses(x=>!x)}
      style={[s.pill,{borderColor:c.accent,backgroundColor:c.card}]}>
      <Text style={[s.small,{color:c.accent,fontWeight:'900'}]}>
       {showWitnesses?'Ocultar antecedentes':'Ver cabezas anteriores'}
      </Text>
     </Pressable>:null}
   </View>
  </View>:null}
 </View>;
}
export default function ExtensionExplorerPanel(props:Props){
 const {colors:c,kinds}=useLaloTheme();
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>setExpanded(false),[props.date]);
 return <View style={[s.wrap,{backgroundColor:c.surface,borderColor:c.border}]}>
  <Pressable accessibilityRole="button" accessibilityState={{expanded}}
   onPress={()=>setExpanded(x=>!x)} style={{gap:5}}>
   <Text style={[s.title,{color:c.accent}]}>
    {expanded?'▾':'▸'} Extensiones VT2 → VT3 · tres hojas
   </Text>
   <Text style={[s.note,{color:c.subtext}]}>
    Vista agrupada por _13 / _31, con minihojas y TODOS los recorridos válidos.
    Herramienta visual; no agrega candidatas a los Top10.
   </Text>
  </Pressable>
  {expanded?<View style={{marginTop:12}}>
   <ExplorerBody {...props}/>
  </View>:null}
 </View>;
}
const s=StyleSheet.create({
 wrap:{borderWidth:1,borderRadius:12,padding:12,marginTop:12},
 title:{fontWeight:'900',fontSize:14},
 note:{fontSize:11,lineHeight:17},
 small:{fontSize:11,lineHeight:16},
 tiny:{fontSize:9,fontWeight:'800'},
 number:{fontSize:14,fontWeight:'900'},
 sub:{fontSize:12,fontWeight:'900'},
 line:{flexDirection:'row',flexWrap:'wrap',gap:7},
 pill:{paddingVertical:9,paddingHorizontal:10,borderWidth:1,borderRadius:9},
 family:{paddingHorizontal:9,paddingVertical:7,borderWidth:1,borderRadius:9,
  minWidth:88,gap:3},
 group:{padding:10,borderWidth:1,borderRadius:10,gap:9},
 band:{padding:9,borderWidth:1,borderRadius:9,gap:6},
 digit:{padding:7,borderWidth:1,borderRadius:8,minWidth:58,alignItems:'center',gap:2},
 pathCard:{padding:8,borderWidth:1,borderRadius:8,gap:6}
});
