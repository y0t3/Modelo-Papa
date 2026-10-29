import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(p:string)=>fs.readFileSync(p,'utf8');
const app=read('App.tsx');
const wallpaper=read('src/ui/LaloWallpaper.tsx');
const theme=read('src/ui/LaloTheme.tsx');
const board=read('src/ui/MarkedBoard.tsx');
const aux=read('src/ui/AuxMarkedBoard.tsx');
const shield=read('src/ui/BocaShieldImage.tsx');
assert(app.includes('<LaloWallpaper/>'),'Fondo continuo falta en la aplicación');
assert(app.indexOf('<LaloWallpaper/>')<app.indexOf('<BrandHero'),
 'Fondo debe estar detrás del encabezado, menú y paneles');
assert(wallpaper.includes('pointerEvents="none"'),
 'Imagen decorativa no debe interceptar toques ni pellizcos');
assert(wallpaper.includes("style={StyleSheet.absoluteFill}"),
 'La imagen tiene que cubrir el fondo sin modificar layout');
assert(wallpaper.includes('BocaShieldImage')&&shield.includes('SvgXml'),
 'El fondo debe reutilizar el escudo real de Boca, no uno inventado');
assert(wallpaper.includes('preserveAspectRatio="xMidYMid slice"'),
 'La ilustración debe ocupar las pantallas de diferentes tamaños');
for(const v of [
 "surface:'rgba(9,29,61,0.88)'",
 "surfaceAlt:'rgba(16,42,80,0.91)'",
 "card:'rgba(16,35,71,0.95)'"
])assert(theme.includes(v),'El panel oscuro debe permitir ver la marca de agua: '+v);
for(const k of ['vt2','vt3','vt4'])for(const marker of [
 "vt2:{line:'#FF789F',fill:'#482639',text:'#FFE2E9'",
 "vt3:{line:'#60E1DB',fill:'#193F42',text:'#D4FFFC'",
 "vt4:{line:'#FFD16B',fill:'#4B3B20',text:'#FFF0C2'",
 "vt2:{line:'#BD3158',fill:'#FCE5ED',text:'#7F1738'",
 "vt3:{line:'#057983',fill:'#DFF6F4',text:'#065961'",
 "vt4:{line:'#A16B00',fill:'#FFF1CF',text:'#765000'"
])if(marker.startsWith(k+':'))assert(theme.includes(marker),
 'Los colores funcionales VT2/3/4 siguen igual: '+k);
assert(board.includes('backgroundColor:fill')&&board.includes('backgroundColor:c.board'),
 'Las cifras +11 deben conservar un fondo opaco');
assert(aux.includes('backgroundColor:tint?tint.fill:cell?c.cell:c.surfaceAlt'),
 'La grilla auxiliar debe conservar el color de cada cifra');
assert(app.includes('ZoomableTab'),'Se debe conservar el zoom de la hoja');
console.log('FONDO_LALO_WALLPAPER_OK',JSON.stringify({
 fondo:'SVG local, fijo, independiente del scroll',interacciones:'sin eventos',
 coloresVT:'preservados',tableros:'celdas sólidas',modo:'claro y oscuro'
}));
