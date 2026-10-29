import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const app=JSON.parse(fs.readFileSync('app.json','utf8')).expo;
const launcher=fs.readFileSync('assets/la-posta-launcher-icon.png');
const foreground=fs.readFileSync('assets/la-posta-launcher-foreground.png');
const script=fs.readFileSync('.github/scripts/icon-modelo-lalo.sh','utf8');
const sha=(x:Buffer)=>createHash('sha256').update(x).digest('hex');
assert.equal(sha(launcher),'a5c94b90b4952e791c2d00cf4ac4f089fd365be74c89aedf154535f50165565a');
assert.equal(sha(foreground),'3a7b4cc7e0200b50904bcd77a0cd10dcc51208ae79733da922019fb3ee060e7c');
assert.equal(app.icon,'./assets/la-posta-launcher-icon.png');
assert.equal(app.android.adaptiveIcon.foregroundImage,'./assets/la-posta-launcher-foreground.png');
assert.equal(app.android.adaptiveIcon.backgroundColor,'#07142D');
assert(launcher.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
assert(foreground.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
const dims=(x:Buffer)=>({w:x.readUInt32BE(16),h:x.readUInt32BE(20)});
assert.deepEqual(dims(launcher),{w:512,h:512});
assert.deepEqual(dims(foreground),{w:512,h:512});
assert(script.includes("assets/la-posta-launcher-icon.png")&&
 script.includes("assets/la-posta-launcher-foreground.png"));
assert(!script.includes('rsvg-convert')&&!script.includes('assets/la-posta-de-lalo.svg'));
assert(script.includes('mipmap-xxxhdpi 192')&&script.includes('ic_launcher_round.png'),
 'Generar launcher normal y redondo en todos los tamaños');
const hero=fs.readFileSync('src/ui/BrandHero.tsx','utf8');
const wallpaper=fs.readFileSync('src/ui/LaloWallpaper.tsx','utf8');
assert(hero.includes("require('../../assets/la-posta-header-banner.jpg')"));
assert(wallpaper.includes('BocaShieldImage'));
const theme=fs.readFileSync('src/ui/LaloTheme.tsx','utf8');
for(const marker of [
 "vt2:{line:'#FF789F',fill:'#482639',text:'#FFE2E9'",
 "vt3:{line:'#60E1DB',fill:'#193F42',text:'#D4FFFC'",
 "vt4:{line:'#FFD16B',fill:'#4B3B20',text:'#FFF0C2'",
 "vt2:{line:'#BD3158',fill:'#FCE5ED',text:'#7F1738'",
 "vt3:{line:'#057983',fill:'#DFF6F4',text:'#065961'",
 "vt4:{line:'#A16B00',fill:'#FFF1CF',text:'#765000'"
])assert(theme.includes(marker));
console.log('ICONO_LALO_0322_OK',JSON.stringify({source:launcher.length,foreground:foreground.length,
  adaptive:true,icon:'bolillas',banner:'intacto',fondo:'intacto',VT:'intactos'}));
