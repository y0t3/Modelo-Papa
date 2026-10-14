import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {PanoramaKind} from '../panoramaModel';

export type ThemeMode='light'|'dark';
export type LaloColors={
 canvas:string;nav:string;navActive:string;surface:string;surfaceAlt:string;
 card:string;board:string;boardAlt:string;cell:string;
 text:string;subtext:string;muted:string;border:string;
 accent:string;accentFill:string;selected:string;callout:string;
 button:string;buttonText:string;divider:string;statusBar:'light'|'dark';
};
const LIGHT:LaloColors={
 canvas:'#F6F3FA',nav:'#1B1227',navActive:'#18578A',
 surface:'#FCFAFE',surfaceAlt:'#F5F0F9',card:'#FFFFFF',
 board:'#FDFBFF',boardAlt:'#F6F1F8',cell:'#FFFFFF',
 text:'#282039',subtext:'#665A73',muted:'#72657C',
 border:'#DCD3E3',accent:'#603E83',accentFill:'#EDE1F6',
 selected:'#F1E6FA',callout:'#EEE5F4',button:'#18578A',
 buttonText:'#FFFFFF',divider:'#E4DBE9',statusBar:'dark'
};
const DARK:LaloColors={
 canvas:'#101019',nav:'#14101E',navActive:'#234C83',
 surface:'#1C1927',surfaceAlt:'#221E2F',card:'#292436',
 board:'#191722',boardAlt:'#211C2C',cell:'#2C2639',
 text:'#F8F3FF',subtext:'#C8BDD7',muted:'#B8ADCB',
 border:'#50465F',accent:'#C9A6FF',accentFill:'#3D2C56',
 selected:'#372A4C',callout:'#30263E',button:'#28669D',
 buttonText:'#FFFFFF',divider:'#42384F',statusBar:'light'
};
export const paletteFor=(mode:ThemeMode):LaloColors=>mode==='dark'?DARK:LIGHT;
export type KindColor={line:string;fill:string;text:string;label:string};
export const colorForKind=(mode:ThemeMode):Record<PanoramaKind,KindColor>=>mode==='dark'?{
 vt2:{line:'#FF789F',fill:'#482639',text:'#FFE2E9',label:'2 cifras'},
 vt3:{line:'#60E1DB',fill:'#193F42',text:'#D4FFFC',label:'3 cifras'},
 vt4:{line:'#FFD16B',fill:'#4B3B20',text:'#FFF0C2',label:'4 cifras'}
}:{
 vt2:{line:'#BD3158',fill:'#FCE5ED',text:'#7F1738',label:'2 cifras'},
 vt3:{line:'#057983',fill:'#DFF6F4',text:'#065961',label:'3 cifras'},
 vt4:{line:'#A16B00',fill:'#FFF1CF',text:'#765000',label:'4 cifras'}
};
const STORE='modelo-lalo-theme-v1';
type ThemeContextValue={mode:ThemeMode;colors:LaloColors;kinds:Record<PanoramaKind,KindColor>;
 toggle:()=>void;setTheme:(next:ThemeMode)=>void};
const ThemeContext=createContext<ThemeContextValue|null>(null);
export function LaloThemeProvider({children}:{children:React.ReactNode}){
 const [mode,setMode]=useState<ThemeMode>('light');
 useEffect(()=>{let alive=true;void AsyncStorage.getItem(STORE).then(value=>{
  if(alive&&(value==='dark'||value==='light'))setMode(value);
 }).catch(()=>{});return()=>{alive=false}},[]);
 const setTheme=(next:ThemeMode)=>{setMode(next);void AsyncStorage.setItem(STORE,next).catch(()=>{})};
 const value=useMemo(()=>({mode,colors:paletteFor(mode),kinds:colorForKind(mode),
  toggle:()=>setTheme(mode==='dark'?'light':'dark'),setTheme}),[mode]);
 return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useLaloTheme(){
 const value=useContext(ThemeContext);
 if(!value)throw new Error('LaloThemeProvider no disponible');
 return value;
}
