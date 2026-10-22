/** Tres regresiones: familia VT4 física, minihojas INFO y POST independiente. */
import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import {diaVacio} from '../src/domain';
import {emptyAuxiliaryHeads,auxiliaryBoard,findAuxPaths} from '../src/auxSantiagoNeuquen';
import {auxAtCut} from '../src/auxTemporalModes';
import {buildInfoAuxFrames} from '../src/infoAuxGallery';
import {buildAuxPredictiveVisual} from '../src/auxVisualModel';
import type {AuxiliarView} from '../src/motorLaloAuxiliar';

const raw=emptyAuxiliaryHeads();
raw.Previa.Santiago='8067';raw.Primera.Santiago='6142';raw.Matutino.Santiago='9634';
raw.Previa.Neuquen='0469';raw.Primera.Neuquen='0245';raw.Matutino.Neuquen='0210';
const board=auxiliaryBoard(raw,'Nocturno');
const valid=findAuxPaths(board,'9241');
assert(valid.some(path=>path.map(c=>c.col).join(',')==='8,7,6,5'),
 '9241 recorre las casillas 8,7,6,5 de Santiago, sin salto');
assert.equal(findAuxPaths(board,'9142').length,0,
 '9142 no puede saltar del 9 a un 1 lejano');
for(const path of valid)for(let i=1;i<path.length;i++){
 const a=path[i-1],b=path[i];
 assert(Math.abs(a.row-b.row)<=1&&Math.abs(a.col-b.col)<=1);
}
const view:AuxiliarView={
 date:'2026-10-21',turn:'Nocturno',status:'LABORATORIO',
 statement:'Prueba de familia VT4',
 ranks:{2:[],3:[],4:[{
  family:'9142/9241',mother:'142/241',rank:1,values:['9241'],
  roots:1,d1:1,d7:0,paths:valid.length,crossing:true,sources:['Primera','Matutino']
 }]}
};
const graphic=buildAuxPredictiveVisual('2026-10-21','Nocturno',board,view,[]);
assert.equal(graphic.groups[0].family,'9241',
 'El texto visible solo anuncia la lectura con recorrido físico');
assert.equal(graphic.groups[0].id,'vt4|9142/9241',
 'La clave interna de agrupación y madre VT3 se conserva');
const post=diaVacio();
post.Nocturno.Ciudad='9241';
post.Previa.Ciudad='8067';
const day={date:'2026-10-20',heads:post,yesterday:raw,today:raw,sourceDate:'2026-10-19'};
const previous=buildInfoAuxFrames([day],null,'Nocturno','anterior');
assert(previous[0].marks.some(x=>x.kind==='vt4'&&x.head==='9241'));
assert(!previous[0].marks.some(x=>x.kind==='vt4'&&x.head==='9142'));
const prevIntraday=buildInfoAuxFrames([day],null,'Previa','intrajornada');
const prevYesterday=buildInfoAuxFrames([day],null,'Previa','anterior');
assert.equal(prevIntraday[0].board?.cells.length,0);
assert.equal(prevIntraday[0].marks.length,0);
assert.equal(prevYesterday[0].board?.cells.length,24);
assert(prevYesterday[0].marks.some(x=>x.kind==='vt4'&&x.head==='8067'));
const mat=auxiliaryBoard(auxAtCut(raw,'Matutino','intrajornada'),'Matutino');
assert.equal(mat.cells.length,16);
assert.equal(findAuxPaths(mat,'9241').length,0);
const future=buildInfoAuxFrames([],day,'Nocturno','intrajornada');
assert.equal(future[0].marks.length,0,'No teñir PRE con resultados del día objetivo');
const summary=fs.readFileSync('src/ui/PredictionSummary.tsx','utf8');
assert(!summary.includes('peers.has(f.key)')&&!summary.includes('sharedRows.length'));
console.log('AUX_AJUSTES_INFO_VT4_OK',{physical9241:valid.length,
 impossible9142:0,infoMarks:previous[0].marks.length});
