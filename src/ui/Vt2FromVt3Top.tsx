import React,{useMemo} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import type {LaloView} from '../motorLalo';
import {topVt3AsVt2PRE} from '../labVt3Terminations';
import {useLaloTheme} from './LaloTheme';

/**
 * Top paralelo VISUAL: un puesto de Top10 VT3 -> exactamente dos
 * terminaciones VT2, respetando las dos lecturas y su puesto original.
 * NO fabrica familias reversibles ni añade rutas/nuevos candidatos.
 * POST solamente colorea coincidencias con cabezas ya publicadas.
 */
export default function Vt2FromVt3Top({view,heads,onFocus}:{
 view:LaloView|null;heads:string[];
 onFocus:(id:string)=>void;
}){
 const {colors:c,kinds}=useLaloTheme();
 const derived=useMemo(()=>view?topVt3AsVt2PRE(view):null,[view]);
 const published=useMemo(()=>heads.filter(h=>/^\d{4,5}$/.test(h)),[heads]);
 const vt2Ranks=useMemo(()=>{
  const found=new Map<string,number>();
  for(const f of view?.ranks.vt2.slice(0,10)||[])
   for(const n of f.family.split('/'))found.set(n,f.rank);
  return found;
 },[view]);
 const matches=useMemo(()=>derived?.rows.map(row=>{
  const chosen=new Set(row.tails);
  return published.filter(head=>chosen.has(head.slice(-2)));
 })||[],[derived,published]);
 const matchedPositions=matches.filter(list=>list.length>0).length;
 const distinctHeads=new Set(matches.flat()).size;
 return <View style={{gap:9}}>
  <View style={s.headingRow}>
   <Text style={[s.heading,{color:kinds.vt2.line}]}>
    VT2 DE VT3 · ÚLTIMAS DOS
   </Text>
   <Text style={[s.counter,{color:c.muted}]}>
    {derived?.rows.length||0} puestos
   </Text>
  </View>
  <Text style={[s.explain,{color:c.subtext}]}>
   Misma posición del Top10 VT3. Solo las dos últimas cifras de cada
   lectura, sin invertirlas ni crear familias VT2 nuevas.
  </Text>
  {published.length>0?<View style={[s.postPanel,{
   backgroundColor:matchedPositions?kinds.vt2.fill:c.surfaceAlt,
   borderColor:matchedPositions?kinds.vt2.line:c.border}]}>
   <Text style={{color:matchedPositions?kinds.vt2.text:c.text,fontSize:13,fontWeight:'900'}}>
    POST · {matchedPositions} puesto(s) coincidente(s)
   </Text>
   <Text style={{color:c.subtext,fontSize:11,lineHeight:17}}>
    {distinctHeads} cabeza(s) distinta(s) · {published.length} publicada(s).
    {matchedPositions===0?' Ninguna terminación coincidió.':
    ' Una cabeza puede aparecer en varios puestos sin convertirse en otro acierto.'}
   </Text>
  </View>:<Text style={[s.explain,{color:c.muted}]}>
   Antes de publicarse las cabezas, todas las terminaciones aparecen sin marcar.
  </Text>}
  {derived?.rows.length?derived.rows.map((row,index)=>{
   const current=matches[index]||[];
   const matched=current.length>0;
   return <Pressable key={'rank-'+row.rank}
    accessibilityRole="button"
    accessibilityLabel={'VT2 de VT3 puesto '+row.rank+
     ', terminaciones '+row.tails.join(' y ')}
    onPress={()=>onFocus('vt3|'+row.familyLabel)}
    style={[s.family,{
     backgroundColor:matched?kinds.vt2.fill:c.card,
     borderColor:matched?kinds.vt2.line:c.border,
     borderWidth:matched?2:1}]}>
    <View style={s.familyTitle}>
     <Text style={[s.rank,{color:kinds.vt2.line}]}>#{row.rank}</Text>
     <View style={{flex:1,gap:4}}>
      <Text style={[s.pair,{color:c.text}]}>
       {row.tails.join(' / ')}
      </Text>
      <Text style={[s.mother,{color:c.subtext}]}>
       Madre VT3: {row.vt3.join(' / ')}
      </Text>
     </View>
     {matched?<Text style={{color:kinds.vt2.text,fontWeight:'900',fontSize:11}}>
      ✓ POST
     </Text>:null}
     <Text style={{color:c.accent,fontSize:20,fontWeight:'900'}}>›</Text>
    </View>
    <View style={s.ends}>
     {row.tails.map((ending,i)=>{
      const matching=published.filter(head=>head.slice(-2)===ending);
      const sharedRank=vt2Ranks.get(ending);
      return <View key={i} style={[s.end,{
       borderColor:matching.length?kinds.vt2.line:c.border,
       backgroundColor:matching.length?kinds.vt2.fill:c.surfaceAlt}]}>
       <Text style={{color:matching.length?kinds.vt2.text:c.text,
        fontSize:12,fontWeight:'900'}}>
        {ending}{matching.length?' ✓':''}
       </Text>
       {sharedRank!==undefined?<Text style={{color:c.subtext,fontSize:10}}>
        También VT2 #{sharedRank}
       </Text>:null}
      </View>;
     })}
    </View>
    {matched?<Text style={[s.winner,{color:kinds.vt2.text}]}>
     Cabeza(s): {current.join(' · ')}
    </Text>:null}
    <Text style={[s.open,{color:c.accent}]}>
     Ver recorrido original VT3 en hoja +11 ›
    </Text>
   </Pressable>;
  }):<Text style={{color:c.muted,fontSize:12}}>
   No hay Top10 VT3 disponible para este turno.
  </Text>}
 </View>;
}
const s=StyleSheet.create({
 headingRow:{flexDirection:'row',alignItems:'center',
  justifyContent:'space-between',gap:8},
 heading:{fontSize:15,fontWeight:'900',flex:1},
 counter:{fontSize:10,fontWeight:'700'},
 explain:{fontSize:11,lineHeight:16},
 postPanel:{borderWidth:1,borderRadius:10,padding:12,gap:4,marginVertical:3},
 family:{minHeight:70,borderRadius:11,padding:9,marginVertical:0,gap:8},
 familyTitle:{flexDirection:'row',alignItems:'center',gap:9},
 rank:{fontSize:13,fontWeight:'900',minWidth:27},
 pair:{fontSize:18,fontWeight:'900'},
 mother:{fontSize:11},
 ends:{flexDirection:'row',flexWrap:'wrap',gap:6},
 end:{borderWidth:1,borderRadius:7,paddingVertical:5,paddingHorizontal:8,
  flexDirection:'row',gap:8,alignItems:'center'},
 winner:{fontSize:12,fontWeight:'900'},
 open:{fontSize:10,fontWeight:'900',alignSelf:'flex-end'}
});
