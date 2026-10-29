/** Regresión para INFO AUX: dos minihojas reales sin leer resultados futuros. */
import {strict as assert} from 'node:assert';
import {diaVacio} from '../src/domain';
import {emptyAuxiliaryHeads,auxAdjacent} from '../src/auxSantiagoNeuquen';
import {buildInfoAuxFrames} from '../src/infoAuxGallery';
import {buildAuxHistoricalTrace} from '../src/infoAuxTrace';
import type {AuxMode} from '../src/auxTemporalModes';
import type {AuxiliarView} from '../src/motorLaloAuxiliar';
import {reversibleFamily} from '../src/motorLalo';
const raw=emptyAuxiliaryHeads();
raw.Previa.Santiago='8067';raw.Primera.Santiago='6142';
raw.Matutino.Santiago='9634';
raw.Previa.Neuquen='0469';raw.Primera.Neuquen='0245';
raw.Matutino.Neuquen='0210';
const past=diaVacio();
past.Nocturno.Ciudad='2697'; // recorrido válido cruzando frontera Previa/Primera
past.Nocturno.Provincia='9241';
const today=diaVacio();
const earlier={date:'2026-10-20',heads:past,yesterday:raw,today:raw,
 sourceDate:'2026-10-19'};
const current={date:'2026-10-21',heads:today,yesterday:raw,today:raw,
 sourceDate:'2026-10-20'};
const check=(mode:AuxMode)=>{
 const frames=buildInfoAuxFrames([earlier],current,'Nocturno',mode);
 assert.equal(frames.length,2);
 const old=frames[0],now=frames[1];
 assert(!old.isCurrent&&now.isCurrent);
 const mark=old.marks.find(m=>m.kind==='vt4'&&m.head==='2697');
 assert(mark,'falta recorrido físico antiguo 2697');
 const mom=reversibleFamily('697');
 const ranked:AuxiliarView={date:now.date,turn:'Nocturno',
  status:'LABORATORIO',statement:'Fixture de lectura, no ranking verdadero',
  ranks:{
   2:[],3:[{family:mom,mother:null,rank:2,values:['697','796'],
    roots:1,d1:1,d7:0,paths:1,crossing:true,sources:['Previa','Primera']}],
   4:[]}};
 const diag=buildAuxHistoricalTrace(old,now,mark!,ranked);
 assert.equal(diag.oldReading,'2697');
 assert.equal(diag.oldDate,'2026-10-20');
 assert.equal(diag.targetDate,'2026-10-21');
 assert(diag.projections.length>0,'La figura debe poder trasladarse a la grilla completa');
 assert(diag.projections.some(p=>p.value==='2697'&&p.mother===mom&&
  p.motherRank===2&&p.recognizedRank===null));
 for(const p of diag.projections){
  assert.equal(p.path.length,4);
  for(let i=1;i<p.path.length;i++)assert(auxAdjacent(p.path[i-1],p.path[i]));
  for(const c of p.path)assert(diag.targetBoard.cells.some(x=>
   x.row===c.row&&x.col===c.col&&x.digit===c.digit));
 }
 // No interpretar inversión completa como VT4 respaldado.
 const reversed='7962';
 assert.equal(diag.projections.find(p=>p.value===reversed)?.recognizedRank??null,null);
 const tampered={...now,date:'2026-10-19'};
 assert.throws(()=>buildAuxHistoricalTrace(old,tampered,mark!,ranked),/POST anterior/);
 const fake={...mark!,head:'9999'};
 assert.throws(()=>buildAuxHistoricalTrace(old,now,fake,ranked),/no corroborado/);
 // Un cambio en el resultado del sorteo OBJETIVO jamás cambia el PRE.
 const future={...current,heads:{...today,Nocturno:{...today.Nocturno,Ciudad:'8888'}}};
 const unchanged=buildInfoAuxFrames([earlier],future,'Nocturno',mode);
 const same=buildAuxHistoricalTrace(unchanged[0],unchanged[1],mark!,ranked);
 assert.deepEqual(same.projections,diag.projections);
 return diag.projections.length;
};
console.log('INFO_AUX_TRAZAS_VALIDAS',{
 ayer:check('anterior'),hoy:check('intrajornada')
});
// En HOY Previa no hay celdas para la jornada objetivo, ni trazos inventados.
const empty=buildInfoAuxFrames([earlier],current,'Previa','intrajornada');
assert.equal(empty[1].board?.cells.length,0);
assert.equal(empty[1].marks.length,0);
console.log('INFO_AUX_PREVIA_HOY_SIN_CELDAS_OK');
