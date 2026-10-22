import React,{useEffect,useRef,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import type {Turno} from '../domain';
import type {LaloView,LaloKind} from '../motorLalo';
import type {AuxiliarView} from '../motorLaloAuxiliar';
import {familyKey,rowsForModel,hitsForFamily} from '../predictionParallel';
import type {HeadEvent,ModelChoice} from '../predictionParallel';
import {KINDS} from './visualTokens';
import {useLaloTheme} from './LaloTheme';
import {readableWeekday} from '../infoTurnHistory';
import {explainFamilyRationale} from '../friendlyExplanations';

type TopCount=3|5|10;
const defaults:Record<LaloKind,TopCount>={vt2:3,vt3:3,vt4:3};
const explanation:Record<string,string>={
 EN_FORMACIÓN:'En formación',EN_SEGUIMIENTO:'Con antecedentes',CON_APOYO:'Con varios apoyos'
};

/**
 * Una modalidad por página horizontal; dentro de cada modalidad, los candidatos
 * se leen de arriba hacia abajo. Los chips Top3/5/10 amplían esa misma lista.
 * No se modifica la selección, el orden, el cotejo POST ni el acceso al recorrido.
 */
export default function PredictionSummary({date,turn,view,onFocus,post,heads=[],model='lalo',auxiliar}:{
 date:string;turn:Turno;view:LaloView|null;model?:ModelChoice;
 auxiliar?:AuxiliarView|null;
 onFocus:(id:string)=>void;post?:Record<LaloKind,string[]>|null;heads?:string[]
}){
 const {colors:c,kinds}=useLaloTheme();
 const [limits,setLimits]=useState<Record<LaloKind,TopCount>>(defaults);
 const [active,setActive]=useState<LaloKind>('vt2');
 const [expanded,setExpanded]=useState<string|null>(null);
 const [pagerWidth,setPagerWidth]=useState(0);
 const [pageHeights,setPageHeights]=useState<Partial<Record<LaloKind,number>>>({});
 const pager=useRef<ScrollView>(null);

 useEffect(()=>{
  setLimits({...defaults});
  setActive('vt2');
  pager.current?.scrollTo({x:0,animated:false});
  setExpanded(null);
 },[date,turn,model]);

 useEffect(()=>{
  if(pagerWidth>0)
   pager.current?.scrollTo({x:KINDS.indexOf(active)*pagerWidth,animated:false});
 // La posición sólo se recalcula cuando cambia el ancho (rotación o resize).
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[pagerWidth]);

 const selectKind=(kind:LaloKind)=>{
  setActive(kind);
  if(pagerWidth>0)
   pager.current?.scrollTo({x:KINDS.indexOf(kind)*pagerWidth,animated:true});
 };

 return <View style={[s.surface,{backgroundColor:c.surface,borderColor:c.border}]}>
  <Text style={[s.title,{color:c.text}]}>{model==='auxiliar'?'PREDICCIÓN · LALO AUXILIAR':'PREDICCIÓN · MODELO LALO'}</Text>
  <Text style={[s.subtitle,{color:c.subtext}]}>
   {date.includes('/')?readableWeekday(date.slice(6,10)+'-'+date.slice(3,5)+'-'+date.slice(0,2)).toLowerCase():readableWeekday(date).toLowerCase()} · {turn}
  </Text>
  <Text style={[s.caution,{color:c.subtext}]}>
   Propuestas experimentales: el puesto no equivale a una probabilidad demostrada.
   {model==='auxiliar'?' Solo utiliza la hoja Santiago–Neuquén; el Top de MV1 es independiente.':''}
  </Text>
  <View style={s.kindTabs}>
   {KINDS.map(kind=><Pressable key={kind} accessibilityRole="tab"
    accessibilityState={{selected:active===kind}}
    accessibilityLabel={'Ver '+kind.toUpperCase()}
    onPress={()=>selectKind(kind)}
    style={[s.kindTab,{borderColor:active===kind?kinds[kind].line:c.border,
     backgroundColor:active===kind?kinds[kind].fill:c.card}]}>
    <Text style={[s.kindTabText,{color:active===kind?kinds[kind].text:c.subtext}]}>
     {kind.toUpperCase()}
    </Text>
   </Pressable>)}
  </View>
  <Text style={[s.hint,{color:c.muted}]}>
   Deslizá para cambiar de VT · Tocá una familia para ver su respaldo
  </Text>
  <View style={s.pager} onLayout={e=>{
   const width=Math.round(e.nativeEvent.layout.width);
   if(width>0&&width!==pagerWidth)setPagerWidth(width);
  }}>
   <ScrollView ref={pager} horizontal pagingEnabled nestedScrollEnabled
    scrollEnabled={pagerWidth>0} showsHorizontalScrollIndicator={false}
    style={pageHeights[active]?{height:pageHeights[active]}:undefined}
    contentContainerStyle={s.pages}
    onMomentumScrollEnd={e=>{
     if(!pagerWidth)return;
     const index=Math.max(0,Math.min(KINDS.length-1,
      Math.round(e.nativeEvent.contentOffset.x/pagerWidth)));
     setActive(KINDS[index]);
    }}>
    {KINDS.map(kind=>{
     const limit=limits[kind];
     const rows=rowsForModel(model,kind,view,auxiliar||null).slice(0,limit);
     const other=rowsForModel(model==='lalo'?'auxiliar':'lalo',kind,view,auxiliar||null)
       .slice(0,10);
     const peers=new Map(other.map(x=>[x.key,x.rank]));
     const winners:HeadEvent[]=heads.map(head=>({jur:'',head}));
     const winnerHeads=(family:typeof rows[number])=>hitsForFamily(family,winners)
       .map(x=>x.head);
     const matched=new Set(rows.filter(f=>winnerHeads(f).length>0).map(f=>f.key));
     const hitRows=rows.filter(f=>matched.has(f.key));
     return <View key={kind} style={[s.page,{width:pagerWidth||undefined}]}
      onLayout={e=>{
       const height=Math.ceil(e.nativeEvent.layout.height);
       if(height>0)setPageHeights(prev=>prev[kind]===height?prev:{...prev,[kind]:height});
      }}>
      <View style={s.headingRow}>
       <Text style={[s.heading,{color:kinds[kind].line}]}>
        {kind.toUpperCase()} · {kinds[kind].label}
       </Text>
       <Text style={[s.aux,{color:c.muted}]}>{rowsForModel(model,kind,view,auxiliar||null).length} familias</Text>
      </View>
      {kind==='vt4'&&(view||auxiliar)?<Text style={[s.caution,{color:c.subtext}]}>
       Se alternan los candidatos de cada familia de 3 cifras con recorrido válido;
       después sus siguientes hijas. No equivale a una probabilidad de acierto.
      </Text>:null}
      <View style={s.tabs}>{([3,5,10] as const).map(n=>
       <Pressable key={n} accessibilityRole="button"
        accessibilityState={{selected:limit===n}}
        onPress={()=>setLimits(prev=>({...prev,[kind]:n}))}
        style={[s.tab,{backgroundColor:limit===n?kinds[kind].fill:c.card,
         borderColor:limit===n?kinds[kind].line:c.border}]}>
        <Text style={{fontSize:11,fontWeight:'900',
         color:limit===n?kinds[kind].text:c.subtext}}>
         Top {n}
        </Text>
       </Pressable>)}</View>
      {heads.some(x=>/^[0-9]{4}$/.test(x))&&(view||auxiliar)?<View style={[s.postPanel,{backgroundColor:hitRows.length?kinds[kind].fill:c.surfaceAlt,
       borderColor:hitRows.length?kinds[kind].line:c.border}]}>
       <Text style={[s.postTitle,{color:hitRows.length?kinds[kind].text:c.text}]}>
        {hitRows.length?'✓ COINCIDENCIAS POST':'POST · SIN COINCIDENCIAS'} · {hitRows.length} en Top{limit}
       </Text>
       <Text style={[s.postInfo,{color:c.subtext}]}>
        {hitRows.length?hitRows.map(f=>'#'+f.rank+' '+f.family+' ('+winnerHeads(f).join(', ')+')').join('  ·  '):
         'Ninguna familia de este Top coincidió con las cabezas publicadas.'}
       </Text>
      </View>:null}
      {rows.length?<View style={s.families}>
       {rows.map(f=><Pressable key={f.family} accessibilityRole="button"
        accessibilityLabel={kind.toUpperCase()+', puesto '+f.rank+', familia '+f.family}
        onPress={()=>{
         if(model==='auxiliar')setExpanded(old=>old===f.key?null:f.key);
         else onFocus(kind+'|'+f.family);
        }}
        style={[s.family,{backgroundColor:matched.has(f.key)?kinds[kind].fill:peers.has(f.key)?c.accentFill:c.card,
         borderColor:matched.has(f.key)?kinds[kind].line:peers.has(f.key)?c.accent:c.border,
         borderWidth:matched.has(f.key)||peers.has(f.key)?2:1}]}>
        <View style={s.familyTitle}>
         <Text style={[s.rank,{color:kinds[kind].line}]}>#{f.rank}</Text>
         <Text style={[s.familyName,{color:c.text}]}>{f.family}</Text>
         {matched.has(f.key)?<Text style={[s.hitLabel,{color:kinds[kind].text}]}>✓ POST</Text>:null}
         <Text style={[s.chevron,{color:c.accent}]}>›</Text>
        </View>
        {peers.has(f.key)?<Text style={[s.winnerHeads,{color:c.accent}]}>⇄ Familia compartida · otro Top10 #{peers.get(f.key)}</Text>:null}
        {matched.has(f.key)?<Text style={[s.winnerHeads,{color:kinds[kind].text}]}>
         Cabeza(s): {winnerHeads(f).join(' · ')}
        </Text>:null}
        <Text style={[s.detail,{color:c.subtext}]}>
         {model==='auxiliar'?f.source:
          view?.ranks[kind].find(x=>familyKey(x.family)===f.key)?.rationale?
          explainFamilyRationale(view.ranks[kind].find(x=>familyKey(x.family)===f.key)!.rationale):
          'Familia con recorridos físicos'} · {f.values.join(' / ')}
        </Text>
        {model==='auxiliar'&&expanded===f.key?<View style={{gap:5,marginTop:8}}>
         {f.details.map((line,i)=><Text key={i} style={[s.detail,{color:c.text}]}>{line}</Text>)}
         {f.canFocusPlus?<Pressable accessibilityRole="button"
          onPress={()=>onFocus(kind+'|'+f.family)}>
          <Text style={[s.open,{color:c.accent}]}>Ver recorrido +11 ›</Text>
         </Pressable>:null}
        </View>:null}
        <Text style={[s.open,{color:c.accent}]}>
         {model==='auxiliar'?'Ver recorridos auxiliares ›':'Ver recorrido ›'}
        </Text>
       </Pressable>)}
      </View>:<Text style={[s.empty,{color:c.muted}]}>
       {!(model==='auxiliar'?auxiliar:view)?'Cargá las fuentes para generar candidatos.':
        'Sin candidatos con recorrido físico válido para esta modalidad.'}
      </Text>}

     </View>;
    })}
   </ScrollView>
  </View>
 </View>;
}
const s=StyleSheet.create({
 surface:{borderRadius:13,padding:14,marginTop:10,borderWidth:1},
 title:{fontSize:18,fontWeight:'900'},subtitle:{fontSize:12,fontWeight:'800',marginTop:4},
 caution:{fontSize:11,lineHeight:16,marginTop:8},
 kindTabs:{flexDirection:'row',gap:7,marginTop:14},
 kindTab:{flex:1,borderWidth:1,borderRadius:9,paddingVertical:10,alignItems:'center'},
 kindTabText:{fontSize:13,fontWeight:'900'},
 hint:{fontSize:10,lineHeight:15,marginTop:7,marginBottom:3},
 pager:{width:'100%',overflow:'hidden'},
 pages:{alignItems:'flex-start'},
 page:{paddingTop:9,paddingBottom:8},
 headingRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},
 heading:{fontSize:15,fontWeight:'900'},aux:{fontSize:10,fontWeight:'700'},
 tabs:{flexDirection:'row',gap:7,marginTop:10,marginBottom:9},
 tab:{flex:1,borderWidth:1,borderRadius:9,paddingVertical:8,alignItems:'center'},
 families:{gap:8},
 family:{minHeight:86,borderRadius:11,borderWidth:1,padding:10},
 familyTitle:{flexDirection:'row',alignItems:'center',gap:9},
 rank:{fontSize:13,fontWeight:'900',minWidth:27},
 familyName:{fontSize:18,fontWeight:'900',flex:1,flexWrap:'wrap'},
 chevron:{fontSize:20,fontWeight:'900'},
 detail:{fontSize:11,lineHeight:15,marginTop:3},
 open:{fontSize:10,fontWeight:'900',marginTop:5,alignSelf:'flex-end'},
 empty:{fontSize:11,lineHeight:17,marginVertical:7},
 postPanel:{borderWidth:1,borderRadius:10,padding:12,marginVertical:10,gap:5},
 postTitle:{fontSize:14,fontWeight:'900'},postInfo:{fontSize:12,lineHeight:18,fontWeight:'700'},
 hitLabel:{fontSize:11,fontWeight:'900'},
 winnerHeads:{fontSize:12,fontWeight:'900',marginTop:4}
});
