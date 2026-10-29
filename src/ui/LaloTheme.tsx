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
 canvas:'#EEF3FA',nav:'#071D42',navActive:'#1754A1',
 surface:'#FFFFFF',surfaceAlt:'#F4F7FC',card:'#FFFFFF',
 board:'#F9FBFF',boardAlt:'#EFF3F9',cell:'#FFFFFF',
 text:'#10274D',subtext:'#4B6180',muted:'#667997',
 border:'#C5D3E6',accent:'#AD7618',accentFill:'#FFF0CC',
 selected:'#E6F0FF',callout:'#EFF5FE',button:'#1463B0',
 buttonText:'#FFFFFF',divider:'#D6E0ED',statusBar:'dark'
};
const DARK:LaloColors={
 canvas:'#05152F',nav:'#061C3E',navActive:'#1457A6',
 surface:'#091D3D',surfaceAlt:'#102A50',card:'#102347',
 board:'#0A1933',boardAlt:'#10254B',cell:'#1A2945',
 text:'#F8F5EA',subtext:'#BDCEE4',muted:'#8EA4C3',
 border:'#28548A',accent:'#F3C251',accentFill:'#233B61',
 selected:'#113D72',callout:'#0E315E',button:'#0864B7',
 buttonText:'#FFFFFF',divider:'#244673',statusBar:'light'
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
 const [mode,setMode]=useState<ThemeMode>('dark');
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
