import assert from 'node:assert/strict';
import {allGeometricShapes,confirmedTrace,inspectFigure,figureModes} from './lab-vt3-figura-identidad';
import type {FigureMark,FigureTrace} from './lab-vt3-figura-identidad';
const shapes=allGeometricShapes();
assert.equal(shapes.length,19,'La misma forma inversa no debe duplicarse');
const shape=shapes[0];
const t:FigureTrace={shape,source:'prevNocturno',cells:['1:0','2:0','3:1'],value:'253'};
const mark=(date:string,source:FigureMark['source'],cells:string[],head:string):FigureMark=>
 ({date,source,cells,shape,head,turn:'Matutino',jur:'Ciudad'});
const marks=[
 mark('2026-10-12','prevNocturno',['1:0','2:0','3:1'],'0165'),
 mark('2026-10-12','prevNocturno',['3:1','2:0','1:0'],'0165'),
 mark('2026-10-13','prevNocturno',['2:0','3:0','4:1'],'2345'),
 mark('2026-10-14','Matutino',['1:0','2:0','3:1'],'9783'),
 mark('2026-10-15','prevNocturno',['4:0','5:0','5:1'],'4526')
];
assert.equal(confirmedTrace(t,marks,'FORMA_GLOBAL').length,4);
assert.equal(confirmedTrace(t,marks,'MISMA_FUENTE').length,3);
assert.equal(confirmedTrace(t,marks,'MISMAS_CASILLAS').length,1);
assert.equal(confirmedTrace(t,marks,'CERCA_1_FILA').length,2);
assert.equal(confirmedTrace(t,marks,'DESPLAZADA_2_FILAS').length,1);
assert.equal(confirmedTrace(t,marks,'CAMBIO_FUENTE').length,1);
const info=inspectFigure(t,marks,[],'2026-10-16','MISMA_FUENTE');
assert.equal(info.days,3);
assert.equal(info.lastDistance,1);
assert.equal(info.heads,3);
assert.throws(()=>inspectFigure(t,[...marks,mark('2026-10-16','Previa',t.cells,'1234')],[],'2026-10-16','FORMA_GLOBAL'));
assert.equal(figureModes.length,6);
console.log('OK: 19 figuras geométricas, identidad fuente/casillas y deduplicación de cabeza histórica');
