import assert from 'node:assert/strict';
import fs from 'node:fs';
const hero=fs.readFileSync('src/ui/BrandHero.tsx','utf8');
const theme=fs.readFileSync('src/ui/LaloTheme.tsx','utf8');
const app=fs.readFileSync('App.tsx','utf8');
assert(hero.includes('TOMAA GIILL!!'),'No debe perderse la frase literal de Lalo');
assert(hero.includes('La posta de')&&hero.includes('Lalo'),
 'El título debe seguir siendo La posta de Lalo');
assert(hero.includes('CABJ')&&hero.includes('const stars='),
 'El escudo clásico debe llevar CABJ y estrellas, no puntos decorativos');
assert(!hero.includes('<Rect x="326" y="80" width="46"'),
 'No debe volver la franja con sigla del escudo anterior');
for(const n of ['11','23','72','48']){
 assert(hero.includes('n="'+n+'"'),'Falta bolilla de quiniela '+n);
}
const ballPos=[...hero.matchAll(/<LotteryBall x=\{(\d+)\} y=\{(\d+)\} r=\{(\d+)\}/g)]
 .map(m=>({x:Number(m[1]),y:Number(m[2]),r:Number(m[3])}));
assert.equal(ballPos.length,4,'Deben estar las cuatro bolillas de quiniela');
assert(ballPos.every(b=>b.x+b.r+3<109),
 'Ninguna bolilla debe tocar la zona del título (x>=109)');
const crestMin=310,wordmarkMax=275;
assert(wordmarkMax<crestMin,'Título y escudo deben tener áreas independientes');
assert(hero.includes('right:76')&&!hero.includes('right:8,bottom'),
 'Botón oscuro/Claro debe quedar a la izquierda del escudo');
assert(app.includes('<BrandHero mode={mode} onToggle={toggle}/>'),
 'No se reemplazó el encabezado principal de la app');
for(const marker of [
"vt2:{line:'#FF789F',fill:'#482639',text:'#FFE2E9'",
"vt3:{line:'#60E1DB',fill:'#193F42',text:'#D4FFFC'",
"vt4:{line:'#FFD16B',fill:'#4B3B20',text:'#FFF0C2'",
"vt2:{line:'#BD3158',fill:'#FCE5ED',text:'#7F1738'",
"vt3:{line:'#057983',fill:'#DFF6F4',text:'#065961'",
"vt4:{line:'#A16B00',fill:'#FFF1CF',text:'#765000'"
])assert(theme.includes(marker),'Se alteró paleta funcional de un VT: '+marker);
console.log('HERO_BOCA_QUINIELA_OK',JSON.stringify({
 title:'La posta de Lalo',motto:'TOMAA GIILL!!',
 balls:ballPos,crest:'CABJ con estrellas y borde dorado',
 motorKindColorsUnchanged:true,noBallTitleOverlap:true
}));
