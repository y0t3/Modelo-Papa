import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const hero=fs.readFileSync('src/ui/BrandHero.tsx','utf8');
const app=fs.readFileSync('App.tsx','utf8');
const theme=fs.readFileSync('src/ui/LaloTheme.tsx','utf8');
const wallpaper=fs.readFileSync('src/ui/LaloWallpaper.tsx','utf8');
const photo=fs.readFileSync('assets/la-posta-header-banner.jpg');

assert.equal(createHash('sha256').update(photo).digest('hex'),
 'ddabd06d69d52683f6297dbdf91c44241091a55ab4282206b410b70a97f4980e',
 'No sustituir ni recomprimir el banner aprobado');
assert.equal(photo[0],0xff);
assert.equal(photo[1],0xd8);
assert.equal(photo[photo.length-2],0xff);
assert.equal(photo[photo.length-1],0xd9);
assert(photo.byteLength>150_000,'El banner no puede ser miniatura ni placeholder');

assert(hero.includes("require('../../assets/la-posta-header-banner.jpg')"),
 'Se debe mostrar el banner original incrustado en Android');
assert(hero.includes('resizeMode="stretch"')&&hero.includes('aspectRatio:1400/574'),
 'Mantener íntegra la imagen y su proporción en distintas pantallas');
assert(hero.includes('onPress={onToggle}')&&hero.includes('accessibilityRole="switch"'),
 'Conservar botón de modo claro/oscuro funcional');
assert(!hero.includes('LotteryBall')&&!hero.includes('SvgText')&&
 !hero.includes('BocaShieldImage')&&!hero.includes('RadialGradient'),
 'El banner ya contiene bolas, título y escudo: no volver a dibujarlos por encima');

assert(app.includes('<LaloWallpaper/>')&&
 app.indexOf('<LaloWallpaper/>')<app.indexOf('<BrandHero mode={mode} onToggle={toggle}/>'),
 'El fondo ya aprobado debe continuar bajo el nuevo banner');
assert(wallpaper.includes('BocaShieldImage'),
 'No alterar el fondo general con escudos reales');

for(const marker of [
 "vt2:{line:'#FF789F',fill:'#482639',text:'#FFE2E9'",
 "vt3:{line:'#60E1DB',fill:'#193F42',text:'#D4FFFC'",
 "vt4:{line:'#FFD16B',fill:'#4B3B20',text:'#FFF0C2'",
 "vt2:{line:'#BD3158',fill:'#FCE5ED',text:'#7F1738'",
 "vt3:{line:'#057983',fill:'#DFF6F4',text:'#065961'",
 "vt4:{line:'#A16B00',fill:'#FFF1CF',text:'#765000'"
]) assert(theme.includes(marker),'Paleta funcional alterada: '+marker);

console.log('BANNER_ORIGINAL_EN_ANDROID_OK',JSON.stringify({
 banner:'JPEG del mockup, embebido offline',
 size:photo.byteLength,aspectRatio:'1400:574',
 fondoGeneral:'sin cambios',colorsVT:'intactos',modeSwitch:'funcional'
}));
