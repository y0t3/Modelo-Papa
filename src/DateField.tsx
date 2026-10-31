import React,{useMemo,useState} from 'react';
import {Modal,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {useLaloTheme} from './ui/LaloTheme';

const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS=['L','M','X','J','V','S','D'];
const maskDate=(v:string)=>{const n=v.replace(/\D/g,'').slice(0,8);return n.length<=2?n:n.length<=4?`${n.slice(0,2)}/${n.slice(2)}`:`${n.slice(0,2)}/${n.slice(2,4)}/${n.slice(4)}`};
const parse=(v:string)=>{const m=v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(!m)return null;const d=+m[1],mo=+m[2]-1,y=+m[3];const x=new Date(y,mo,d,12);return x.getFullYear()===y&&x.getMonth()===mo&&x.getDate()===d?x:null};
const fmt=(d:number,m:number,y:number)=>`${String(d).padStart(2,'0')}/${String(m+1).padStart(2,'0')}/${y}`;

export default function DateField({value,onChange,compact=false}:{value:string,onChange:(v:string)=>void;compact?:boolean}){
 const {colors:c}=useLaloTheme();
 const initial=parse(value)||new Date();
 const [open,setOpen]=useState(false),[year,setYear]=useState(initial.getFullYear()),[month,setMonth]=useState(initial.getMonth());
 const selected=parse(value);
 const cells=useMemo(()=>{const first=new Date(year,month,1,12);const offset=(first.getDay()+6)%7;const total=new Date(year,month+1,0,12).getDate();return [...Array(offset).fill(null),...Array.from({length:total},(_,i)=>i+1)];},[year,month]);
 const move=(delta:number)=>{let m=month+delta,y=year;if(m<0){m=11;y--}if(m>11){m=0;y++}setMonth(m);setYear(y)};
 const show=()=>{const d=parse(value)||new Date();setYear(d.getFullYear());setMonth(d.getMonth());setOpen(true)};
 return <>
  <View style={[s.fieldRow,compact&&s.fieldRowCompact]}><TextInput accessibilityLabel="Fecha elegida. Podés escribir día, mes y año" keyboardType="number-pad" maxLength={10} style={[s.input,compact&&s.inputCompact,{backgroundColor:c.card,borderColor:c.border,color:c.text}]} value={value} onChangeText={v=>onChange(maskDate(v))} placeholder="DD/MM/AAAA" placeholderTextColor={c.muted}/><Pressable accessibilityRole="button" accessibilityLabel="Elegir fecha en el calendario" style={[s.calendarBtn,compact&&s.calendarBtnCompact,{backgroundColor:c.button,borderColor:'#C49741'}]} onPress={show}><Text style={s.calendarIcon}>📅</Text></Pressable></View>
  
  <Modal visible={open} transparent animationType="fade" onRequestClose={()=>setOpen(false)}>
   <View style={s.backdrop}><View style={[s.modal,{backgroundColor:c.surface,borderColor:c.border}]}>
    <View style={s.monthRow}><Pressable style={[s.arrow,{backgroundColor:c.surfaceAlt}]} onPress={()=>move(-1)}><Text style={[s.arrowTxt,{color:c.text}]}>‹</Text></Pressable><Text style={[s.month,{color:c.text}]}>{MONTHS[month]} {year}</Text><Pressable style={[s.arrow,{backgroundColor:c.surfaceAlt}]} onPress={()=>move(1)}><Text style={[s.arrowTxt,{color:c.text}]}>›</Text></Pressable></View>
    <View style={s.week}>{DAYS.map(d=><Text key={d} style={[s.dayName,{color:c.accent}]}>{d}</Text>)}</View>
    <View style={s.grid}>{cells.map((d,i)=>{if(!d)return <View key={`e${i}`} style={s.cell}/>;const sunday=new Date(year,month,d,12).getDay()===0;const isSel=!!selected&&selected.getFullYear()===year&&selected.getMonth()===month&&selected.getDate()===d;return <Pressable key={d} style={[s.cell,isSel&&s.selected,{backgroundColor:isSel?c.button:'transparent'}]} onPress={()=>{onChange(fmt(d,month,year));setOpen(false)}}><Text style={[s.day,{color:c.text},sunday&&!isSel&&{color:c.muted},isSel&&{color:c.buttonText,fontWeight:'900'}]}>{d}</Text></Pressable>})}</View>
    <View style={s.actions}><Pressable onPress={()=>{const d=new Date();onChange(fmt(d.getDate(),d.getMonth(),d.getFullYear()));setOpen(false)}}><Text style={[s.today,{color:c.accent}]}>HOY</Text></Pressable><Pressable onPress={()=>setOpen(false)}><Text style={[s.close,{color:c.subtext}]}>CERRAR</Text></Pressable></View>
   </View></View>
  </Modal>
 </>;
}

const s=StyleSheet.create({fieldRow:{flexDirection:'row',alignItems:'center',gap:7},fieldRowCompact:{flex:1,gap:5,minWidth:0},input:{flex:1,minWidth:0,borderWidth:1,borderRadius:9,paddingVertical:7,
  paddingHorizontal:11,fontSize:16,height:43,fontWeight:'700'},inputCompact:{height:38,paddingVertical:4,paddingHorizontal:8,fontSize:14},calendarBtnCompact:{width:37,height:38},calendarBtn:{width:45,height:43,borderRadius:9,borderWidth:1,
  alignItems:'center',justifyContent:'center'},calendarIcon:{fontSize:21},hint:{color:'#888',fontSize:12,marginTop:5,marginLeft:3},backdrop:{flex:1,backgroundColor:'rgba(0,0,0,.72)',alignItems:'center',justifyContent:'center',padding:18},modal:{width:'100%',maxWidth:430,backgroundColor:'#081D3D',borderRadius:18,padding:16,borderWidth:1,borderColor:'#C79A48'},monthRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},arrow:{width:48,height:48,alignItems:'center',justifyContent:'center',borderRadius:12,backgroundColor:'#153C70'},arrowTxt:{color:'#fff',fontSize:34,lineHeight:38},month:{color:'#fff',fontSize:21,fontWeight:'900'},week:{flexDirection:'row'},dayName:{width:'14.2857%',textAlign:'center',color:'#E8BD57',fontSize:15,fontWeight:'800',paddingVertical:8},grid:{flexDirection:'row',flexWrap:'wrap'},cell:{width:'14.2857%',aspectRatio:1,alignItems:'center',justifyContent:'center',borderRadius:30},day:{color:'#fff',fontSize:18,fontWeight:'700'},selected:{backgroundColor:'#1763B6'},selectedTxt:{fontWeight:'900'},sunday:{color:'#91A5BE'},actions:{flexDirection:'row',justifyContent:'space-between',marginTop:14,paddingHorizontal:8},today:{color:'#E3B345',fontSize:16,fontWeight:'900',padding:10},close:{color:'#aaa',fontSize:16,fontWeight:'800',padding:10}});
