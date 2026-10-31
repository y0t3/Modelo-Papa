import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(path:string)=>fs.readFileSync(path,'utf8');
const theme=read('src/ui/LaloTheme.tsx');
const app=read('App.tsx');
const hero=read('src/ui/BrandHero.tsx');
const sheet=read('src/PanoramaSheet.tsx');
const heads=read('src/ui/HeadsTable.tsx');
const movements=read('src/ui/Vt3Parallel.tsx');
assert(hero.includes('TOMAA GIILL!!'),'La frase de Lalo debe estar literal');
assert(hero.includes('La posta de'),'El título público se perdió');
assert(hero.includes("require('../../assets/la-posta-header-banner.jpg')")&&
 read('src/ui/BosteroWatermark.tsx').includes('BocaShieldImage'),
 'El encabezado debe utilizar el banner original y las marcas de agua conservar el escudo real');
assert(app.includes('<BrandHero mode={mode} onToggle={toggle}/>'),'El hero debe quedar antes de los tabs');
assert(app.indexOf('<BrandHero')<app.indexOf("{screen!=='inicio'?<View style={[s.homeBar"),'El banner debe quedar encima de Volver a Inicio');
assert(!app.includes('<View style={s.nav}>'),'La interfaz nueva no debe mostrar pestañas superiores');
assert(sheet.includes('BosteroWatermark'),'Falta marca de agua discreta en Hoja');
assert(heads.includes('BosteroWatermark'),'Falta marca de agua en Cabezas');
assert(movements.includes("'vt2','vt3'"),'VT2 y VT3 deben estar en paralelo');
for(const marker of ["vt2:{line:'#FF789F',fill:'#482639',text:'#FFE2E9'",
 "vt3:{line:'#60E1DB',fill:'#193F42',text:'#D4FFFC'",
 "vt4:{line:'#FFD16B',fill:'#4B3B20',text:'#FFF0C2'",
 "vt2:{line:'#BD3158',fill:'#FCE5ED',text:'#7F1738'",
 "vt3:{line:'#057983',fill:'#DFF6F4',text:'#065961'",
 "vt4:{line:'#A16B00',fill:'#FFF1CF',text:'#765000'"]){
 assert(theme.includes(marker),'Un color funcional VT2/VT3/VT4 cambió: '+marker);
}
for(const token of ["accent:'#C9A6FF'","accent:'#603E83'","surface:'#1C1927'"]){
 assert(!theme.includes(token),'Quedó un violeta de identidad base: '+token);
}
console.log('LA_POSTA_IDENTIDAD_Y_VT_OK',JSON.stringify({
 title:'La posta de Lalo',subtitle:'TOMAA GIILL!!',twoEngines:true,
 allKindColorsPreserved:true,blueGoldBase:true
}));
