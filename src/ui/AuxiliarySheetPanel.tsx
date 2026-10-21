import React,{useEffect,useMemo,useState} from 'react';
import {View,Text,Pressable,TextInput,StyleSheet} from 'react-native';
import {JURS} from '../domain';
import type {CabezasDia,Turno} from '../domain';
import type {DailySheet} from '../sheet';
import {buildAuxPostLedger,highlightAuxMarks,groupAuxMarks} from '../auxMarkLedger';
import type {MarkKind} from '../auxMarkLedger';
import {auxiliaryBoard,auxFamily,findAuxPaths,findAuxFamily,serializeAuxPath}
 from '../auxSantiagoNeuquen';
import type {AuxiliaryHeads,AuxCell,AuxPath} from '../auxSantiagoNeuquen';
import type {LaloView} from '../motorLalo';
import {useLaloTheme} from './LaloTheme';
import WithinDayFamilyTimeline from './WithinDayFamilyTimeline';
type SelectMode='exacta'|'familia';
export default function AuxiliarySheetPanel({
 turn,aux,heads,view,plus,date
}:{turn:Turno;aux:AuxiliaryHeads|null;heads:CabezasDia|null;view:LaloView|null;
 plus:DailySheet|null;date:string}){
 const {colors:c,kinds}=useLaloTheme();
 const [query,setQuery]=useState('');
 const [selection,setSelection]=useState<SelectMode>('familia');
 const [kind,setKind]=useState<2|3|4>(3);
 const [overview,setOverview]=useState(true);
 const [timeline,setTimeline]=useState(false);
 const [enabled,setEnabled]=useState<Record<MarkKind,boolean>>({vt2:true,vt3:true,vt4:true});
 useEffect(()=>{setQuery('');setSelection('familia')},[turn]);
 useEffect(()=>{setTimeline(false);setOverview(true);setQuery('');setKind(3)},[date]);
 const board=useMemo(()=>aux?auxiliaryBoard(aux,turn):null,[aux,turn]);
 const selected=useMemo(()=>{
  if(!board||!/^\d{2,4}$/.test(query))return {paths:[] as AuxPath[],
   family:'',cross:0};
  if(selection==='familia'&&query.length<=3){
   const f=findAuxFamily(board,query);
   return {paths:f.paths,family:f.family,cross:f.crossTurnPaths};
  }
  const p=findAuxPaths(board,query);
  return {paths:p,family:query,
   cross:p.filter(path=>new Set(path.map(x=>x.source)).size>=2).length};
 },[board,query,selection]);
 const ledger=useMemo(()=>aux&&heads&&plus?buildAuxPostLedger(date,aux,heads,plus,turn):null,
  [date,aux,heads,plus,turn]);
 const markedKinds=(['vt2','vt3','vt4'] as MarkKind[]).filter(k=>enabled[k]);
 const overlay=useMemo(()=>ledger?highlightAuxMarks(ledger,markedKinds):{},
  [ledger,enabled]);
 const selectedCells=useMemo(()=>new Map<string,number>(
  [...new Set(selected.paths.flatMap(path=>path.map(cell=>cell.row+':'+cell.col)))].map(k=>[
   k,selected.paths.filter(path=>path.some(c=>c.row+':'+c.col===k)).length])
 ),[selected.paths]);
 const visible=board?.visibleTurns||[];
 const rowName=['Santiago','Neuquén'];
 const targetHeads=JURS.map(jur=>({jur,head:heads?.[turn]?.[jur]||'----'}))
  .filter(x=>/^\d{4}$/.test(x.head));
 const familyRanking=view?.ranks.vt3.slice(0,6)||[];
 const select=(value:string,mode:SelectMode)=>{setQuery(value);setSelection(mode)};
 const textStyle={color:c.text};
 const mutedStyle={color:c.subtext};
 const border=c.border;
 return <View style={[s.container,{backgroundColor:c.surface,borderColor:border}]}>
  <Text style={[s.title,textStyle]}>SEGUNDA HOJA · SANTIAGO / NEUQUÉN</Text>
  <Text style={[s.hint,mutedStyle]}>Cabezas sin +11 · hasta Matutino · recorridos continuos entre turnos</Text>
  {!board?<Text style={mutedStyle}>Cargá una jornada para construir la segunda hoja.</Text>:<>
   <View style={s.labels}>
    <View style={s.side}/>
    {(['Previa','Primera','Matutino'] as const).map(t=>
     <View key={t} style={s.groupLabel}>
      <Text style={{color:visible.includes(t)?c.text:c.muted,
       fontSize:10,fontWeight:'800',textAlign:'center'}}>{t}</Text>
     </View>)}
   </View>
   {[0,1].map(row=><View key={row} style={s.line}>
    <View style={s.side}><Text style={[s.rowLabel,textStyle]}>{rowName[row]}</Text></View>
    {Array.from({length:12},(_,col)=>{
     const cell=board.cells.find(x=>x.row===row&&x.col===col);
     const group=Math.floor(col/4);
     const enabled=visible.includes((['Previa','Primera','Matutino'] as const)[group]);
     const hot=selectedCells.get(row+':'+col)||0;
     const multi=overview?overlay[row+':'+col]:null;
     const active=overview&&!timeline?(multi?.routes||0)>0:hot>0;
     const chosenColor=kinds['vt'+kind as MarkKind];
     return <View key={row+':'+col} style={[s.digit,{
      backgroundColor:active&&(!overview||timeline)?chosenColor.fill:cell?c.cell:c.surfaceAlt,
      borderColor:active?(overview&&!timeline?c.accent:chosenColor.line):col%4===0?c.accent:border,
      borderWidth:active?2:col%4===0?1.5:1,
      opacity:enabled?1:0.4
     }]}>
      <Text style={{fontSize:13,fontWeight:active?'900':'700',
       color:(!overview||timeline)&&active?chosenColor.text:cell?c.text:c.muted}}>
       {cell?.digit||'·'}
      </Text>
      {overview&&!timeline&&multi?.kinds.length?<View style={s.marks}>
       {(['vt2','vt3','vt4'] as MarkKind[]).filter(k=>multi.kinds.includes(k)).map(k=>
        <View key={k} style={[s.bar,{backgroundColor:kinds[k].line}]}/>)}
      </View>:null}
     </View>
    })}
   </View>)}
   <Text style={[s.hint,mutedStyle]}>
    {visible.length?visible.join(' + ')+' disponibles antes de '+turn:
     'Previa: todavía no se publicó ninguna cabeza auxiliar.'}
    {' · '}
    {board.cells.length} celdas válidas
   </Text>
   <View style={s.separator}/>
   <View style={s.wrap}>
    <Pressable accessibilityRole="button" accessibilityState={{selected:overview&&!timeline}}
     onPress={()=>{setOverview(true);setTimeline(false)}}
     style={[s.chip,{backgroundColor:overview&&!timeline?c.accentFill:c.surfaceAlt,
      borderColor:overview&&!timeline?c.accent:c.border}]}>
     <Text style={[{fontWeight:'800'},textStyle]}>Todas las marcas ganadoras</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityState={{selected:!overview&&!timeline}}
     onPress={()=>{setOverview(false);setTimeline(false)}}
     style={[s.chip,{backgroundColor:!overview&&!timeline?c.accentFill:c.surfaceAlt,
      borderColor:!overview&&!timeline?c.accent:c.border}]}>
     <Text style={[{fontWeight:'800'},textStyle]}>Seguir familia</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityState={{selected:timeline}}
     onPress={()=>{setTimeline(true);setOverview(false)}}
     style={[s.chip,{backgroundColor:timeline?c.accentFill:c.surfaceAlt,
      borderColor:timeline?c.accent:c.border}]}>
     <Text style={[{fontWeight:'800'},textStyle]}>Historia de familias · PRE / POST</Text>
    </Pressable>
   </View>
   {timeline&&aux&&heads&&plus?
    <WithinDayFamilyTimeline date={date} through={turn} draws={heads}
     plus={plus} aux={aux} kind={kind} onKindChange={n=>{
      setKind(n);setQuery('');setSelection(n===4?'exacta':'familia')
     }}
     onFamily={(value,n)=>{setKind(n);select(value,n===4?'exacta':'familia')}}/>
   :overview?<View style={{gap:6}}>
    <Text style={[s.hint,mutedStyle]}>
     POST: únicamente cabezas ya sorteadas hasta {turn}. Cada raya de color indica
     una modalidad con recorrido exacto; no se pintan candidatos aún no salidos.
    </Text>
    <View style={s.wrap}>{(['vt2','vt3','vt4'] as MarkKind[]).map(k=>
     <Pressable key={k} accessibilityRole="checkbox"
      accessibilityState={{checked:enabled[k]}}
      onPress={()=>setEnabled(prev=>({...prev,[k]:!prev[k]}))}
      style={[s.chip,{borderColor:enabled[k]?kinds[k].line:c.border,
       backgroundColor:enabled[k]?kinds[k].fill:c.surfaceAlt}]}>
      <Text style={{color:enabled[k]?kinds[k].text:c.subtext,fontWeight:'800'}}>
       {enabled[k]?'●':'○'} {k.toUpperCase()}
      </Text>
     </Pressable>)}</View>
    {ledger?<>
     <Text style={[s.subtitle,textStyle]}>Cabezas comprobadas y rutas en ambas hojas</Text>
     {(['vt2','vt3','vt4'] as MarkKind[]).filter(k=>enabled[k]).map(k=>{
      const ss=ledger.summary[k],headRecords=groupAuxMarks(ledger,k);
      return <View key={k} style={{gap:4}}>
       <Text style={{color:kinds[k].line,fontWeight:'900'}}>
        {k.toUpperCase()} · +11 {ss.formablePlus11} · auxiliar {ss.formableAux}
        {' · '}solo auxiliar {ss.onlyAux} · ambas {ss.both}
       </Text>
       <View style={s.wrap}>{headRecords.map(item=>
        <Pressable key={item.key} accessibilityRole="button"
         onPress={()=>{setKind(Number(k.slice(-1)) as 2|3|4);
          select(item.exact,'exacta');setOverview(false)}}
         style={[s.chip,{backgroundColor:c.surfaceAlt,borderColor:kinds[k].line}]}>
         <Text style={[{fontSize:11,fontWeight:'700'},textStyle]}>
          {item.turn} {item.jur} {item.head} · {item.paths} ruta(s)
          {item.crossing?' ↗':''}{item.alsoPlus?' +11':''}
         </Text>
        </Pressable>)}</View>
      </View>;
     })}
     <Text style={[s.subtitle,textStyle]}>Cómo creció la hoja durante el día</Text>
     {ledger.stages.map(st=><Text key={st.target} style={[s.path,mutedStyle]}>
      Antes de {st.target}: {st.auxCells} cifras ·
      {markedKinds.map(k=>' '+k.toUpperCase()+' nuevas '+st.firstAvailable[k]+
       ', segunda fuente '+st.newSecondSource[k]).join(' ·')}
     </Text>)}
    </>:null}
   </View>:<><Text style={[s.subtitle,textStyle]}>Seguir cifras o familia</Text>
   <View style={s.wrap}>{([2,3,4] as const).map(n=><Pressable
     key={n} accessibilityRole="button" accessibilityState={{selected:kind===n}}
     onPress={()=>{setKind(n);setQuery('');setSelection(n===4?'exacta':'familia')}}
     style={[s.chip,{backgroundColor:kind===n?kinds['vt'+n as 'vt2'|'vt3'|'vt4'].fill:c.surfaceAlt,
      borderColor:kind===n?kinds['vt'+n as 'vt2'|'vt3'|'vt4'].line:c.border}]}>
     <Text style={{color:c.text,fontWeight:'800'}}>VT{n}</Text>
    </Pressable>)}</View>
   <TextInput value={query} onChangeText={v=>select(v.replace(/\D/g,'').slice(0,4),'familia')}
    keyboardType="number-pad" maxLength={4}
    placeholder={kind===2?'Ej. 54':kind===3?'Ej. 354':'Ej. 1354'} placeholderTextColor={c.muted}
    style={[s.input,{color:c.text,borderColor:c.border,backgroundColor:c.cell}]}/>
   <Text style={[s.hint,mutedStyle]}>
    {query?selected.family+' · '+selected.paths.length+' recorrido(s) físico(s) · '+
      selected.cross+' cruzando turnos':
      'Ingresá VT2/VT3 para ver la familia (ambos sentidos) o VT4 exacta. La cabeza seleccionada no crea candidatos nuevos.'}
   </Text>
   <Text style={[s.subtitle,textStyle]}>Familias VT3 Top6 de Lalo</Text>
   <View style={s.wrap}>{familyRanking.map(f=>{
    const parts=f.family.split('/');
    const supported=board&&findAuxFamily(board,parts[0]).paths.length>0;
    return <Pressable accessibilityRole="button" key={f.family}
     onPress={()=>{setKind(3);select(parts[0],'familia');setOverview(false)}}
     style={[s.chip,{borderColor:supported?kinds.vt3.line:c.border,
      backgroundColor:supported?kinds.vt3.fill:c.surfaceAlt}]}>
     <Text style={{color:c.text,fontWeight:'700',fontSize:11}}>
      #{f.rank} {f.family}{supported?' ✓':''}
     </Text>
    </Pressable>;
   })}</View>
   <Text style={[s.subtitle,textStyle]}>Cabezas publicadas del turno · buscar recorrido exacto</Text>
   <View style={s.wrap}>{targetHeads.map(x=><Pressable
    accessibilityRole="button" key={x.jur}
    onPress={()=>{select(x.head.slice(-kind),'exacta');setOverview(false)}}
    style={[s.chip,{borderColor:c.border,backgroundColor:c.surfaceAlt}]}>
    <Text style={[{fontSize:11,fontWeight:'700'},textStyle]}>
     {x.jur} {x.head}
    </Text>
   </Pressable>)}</View>
   {selected.paths.length>0?<View style={[s.detail,{borderColor:c.border}]}>
    <Text style={[s.subtitle,textStyle]}>Todos los testigos físicos encontrados</Text>
    {selected.paths.slice(0,18).map((path,i)=>{
     const p=serializeAuxPath(path);
     return <Text key={i} style={[s.path,mutedStyle]}>
      {i+1}. {p.value} · {p.sourceTurns.join(' → ')}
      {p.crossesTurn?' (cruza turnos)':''}
      {' · '}{p.cells.map(x=>(x.row===0?'S':'N')+(x.col+1)).join('–')}
     </Text>;
    })}
    {selected.paths.length>18?<Text style={mutedStyle}>
     +{selected.paths.length-18} testigos adicionales
    </Text>:null}
   </View>:null}
   <Text style={[s.hint,mutedStyle]}>
    Los recorridos elegidos son una consulta de figuras posibles, no marcas ganadoras
    si no coinciden exactamente con cabezas sorteadas.
   </Text></>}
  </>}
 </View>;
}
const s=StyleSheet.create({
 container:{padding:12,borderRadius:12,borderWidth:1,marginTop:8,marginBottom:14,gap:9},
 title:{fontSize:14,fontWeight:'900',textAlign:'center'},
 hint:{fontSize:11,lineHeight:16},
 labels:{flexDirection:'row',alignItems:'center',gap:0},
 side:{width:70,justifyContent:'center'},
 groupLabel:{flex:1},
 line:{flexDirection:'row',alignItems:'center'},
 rowLabel:{fontSize:10,fontWeight:'800'},
 digit:{flex:1,marginHorizontal:0.5,aspectRatio:0.82,
  alignItems:'center',justifyContent:'center',borderRadius:3},
 separator:{height:1,backgroundColor:'#98909B',opacity:0.3,marginVertical:4},
 subtitle:{fontSize:12,fontWeight:'900',marginTop:4},
 input:{paddingHorizontal:12,paddingVertical:8,borderWidth:1,borderRadius:9,fontSize:16},
 chip:{padding:7,borderWidth:1,borderRadius:8,marginRight:5,marginBottom:5},
 wrap:{flexDirection:'row',flexWrap:'wrap'},
 detail:{borderWidth:1,borderRadius:9,padding:9,gap:3},
 path:{fontSize:10,lineHeight:15},
 marks:{position:'absolute',bottom:1,left:1,right:1,flexDirection:'row',gap:1,height:3},
 bar:{flex:1,height:3,borderRadius:2}
});
