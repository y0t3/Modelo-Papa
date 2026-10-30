import assert from 'node:assert/strict';
import {figuresInTop,nearMotions,compareSnapshots,scanRecent,silhouette} from '../src/labRadarFiguras';
import type {ShapeRoute} from '../src/labRadarFiguras';
const a=(date:string,turn:string,engine:ShapeRoute['engine'],family:string,
 rank=7,source='Previa',row=0):ShapeRoute=>({
 date,turn,engine,board:'PLUS11',kind:'VT2',source,rank,family,
 reading:family.split('/')[0],
 cells:[{row,col:0},{row,col:1}]
});
const before=figuresInTop([
 a('2026-10-28','Matutino','LALO','01/10'),
 a('2026-10-28','Matutino','GEOMETRIA','01/10',1)
]);
assert.equal(before.length,1,'La misma huella de 2 motores no son 2 figuras');
assert.equal(before[0].engines.length,2);
const next=figuresInTop([a('2026-10-28','Vespertino','LALO','13/31')]);
const l=nearMotions(before,next);
assert.equal(l.length,1);
assert.equal(l[0].type,'MISMO_SITIO');
assert(l[0].distinctFamilies,'El mismo sitio puede cambiar de familia');
assert(l[0].structuralAvailability,'Las casillas siguen disponibles al siguiente turno');
const summary=compareSnapshots(before,next);
assert.equal(summary.persistentExact,1);
assert.equal(summary.retainedChangedFamily,1);
assert.equal(summary.retainedSameFamily,0);
const translated=figuresInTop([
 a('2026-10-29','Nocturno','GEOMETRIA','78/87',1,'Previa',1)
]);
assert.equal(nearMotions(before,translated)[0].type,'DESPLAZAMIENTO_VERTICAL_1');
const sourceMove=figuresInTop([
 a('2026-10-29','Nocturno','CONECTADAS','33/33',1,'Primera')
]);
assert.equal(nearMotions(before,sourceMove)[0].type,'FUENTE_VECINA_MISMO_SITIO');
const far=figuresInTop([
 a('2026-10-29','Nocturno','GEOMETRIA','44/44',1,'Previa',3)
]);
assert.equal(nearMotions(before,far).length,0,'Silueta repetida lejos no es movimiento cercano');
const aux=figuresInTop([
 {...a('2026-10-28','Matutino','AUX_AYER','01/10'),
  board:'AUX_AYER',source:'Santiago',
  cells:[{row:0,col:0},{row:1,col:0}]}]);
assert.equal(nearMotions(before,aux).length,0,'Nunca mezclar recorridos de diferentes hojas');
assert.equal(silhouette([{row:0,col:0},{row:0,col:1}]),
 silhouette([{row:5,col:1},{row:5,col:0}]));
assert.throws(()=>figuresInTop([{
 ...a('2026-10-29','Nocturno','LALO','99/99'),
 cells:[{row:0,col:0},{row:3,col:1}]
}]),/salto físico/);
const recent=scanRecent([
 {date:'2026-10-28',turn:'Matutino',routes:[a('2026-10-28','Matutino','LALO','01/10')]},
 {date:'2026-10-28',turn:'Vespertino',routes:[a('2026-10-28','Vespertino','LALO','13/31')]}
]);
assert.equal(recent.length,1);
assert.equal(recent[0].persistentExact,1);
console.log('RADAR_FIGURAS_TEST_OK');
