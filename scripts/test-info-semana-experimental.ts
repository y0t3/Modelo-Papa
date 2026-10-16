import assert from 'node:assert/strict';
import {diaVacio} from '../src/domain';
import {buildInfoWeek} from '../src/infoWeek';
import {buildTurnHistory} from '../src/infoTurnHistory';
import {buildSheet} from '../src/sheet';
import {buildVt3Trial} from '../src/vt3Trial';
import type {LaloView} from '../src/motorLalo';
import type {ShadowSelection} from '../src/vt3Shadow';

// La semana D-7..ayer contiene sólo las jornadas reales; un feriado
// con Montevideo Nocturna es una jornada válida que alimenta la siguiente base.
const night=diaVacio();night.Nocturno.Ciudad='0000';
const fri=diaVacio();fri.Nocturno.Ciudad='0002';fri.Previa.Ciudad='0111';
const sat=diaVacio();sat.Nocturno.Ciudad='0003';
const sunday=diaVacio();
const mon=diaVacio();mon.Nocturno.Montevideo='0004';
const tue=diaVacio();tue.Nocturno.Ciudad='0005';
const wed=diaVacio();wed.Nocturno.Ciudad='0006';
const thu=diaVacio();thu.Nocturno.Ciudad='0007';
const week=buildInfoWeek('2026-10-09','2026-10-16',[
 {date:'2026-10-09',heads:fri},{date:'2026-10-10',heads:sat},
 {date:'2026-10-11',heads:sunday},{date:'2026-10-12',heads:mon},
 {date:'2026-10-13',heads:tue},{date:'2026-10-14',heads:wed},
 {date:'2026-10-15',heads:thu}],night);
assert.deepEqual(week.map(x=>x.date),[
 '2026-10-15','2026-10-14','2026-10-13',
 '2026-10-12','2026-10-10','2026-10-09']);
assert.equal(week.find(x=>x.date==='2026-10-13')?.sheet.columns[0].values[5],'15',
 'La Nocturna válida de Montevideo no debe borrarse al construir +11');
const gallery=buildTurnHistory('2026-10-16','Previa',null,null,week);
assert.equal(gallery.frames.length,6);
assert.equal(gallery.frames.at(-1)?.title,'Hace una semana');
for(const f of gallery.frames){
 assert.equal(f.markedHeads,f.markedHeadLabels.length);
 const owners=new Set(f.routes.map(r=>r.ownerId));
 assert.ok(f.markedHeadLabels.every(x=>owners.has(x.id)));
 assert.ok(f.markedHeadLabels.every(x=>/^\d{4}$/.test(x.head)));
}
const shape=(family:string,sourceId:string)=>({family,
 paths:[{sourceId,kind:'vt3',rootIds:[],path:[],value:family}]});
const official={ranks:{vt3:[
 shape('123','prevNocturno'),shape('456','Previa'),shape('789','Primera')
]}} as unknown as LaloView;
const geo={top:[
 {family:'123'},{family:'321'},{family:'555'},{family:'666'}
]} as unknown as ShadowSelection;
const selection=buildVt3Trial(official,geo);
assert.deepEqual(selection.top.map(x=>x.family),['123','321','456']);
assert.equal(selection.top[2].origin,'nueva');
assert.equal(new Set(selection.top.map(x=>x.family)).size,3);
const noNew=buildVt3Trial({
 ranks:{vt3:[shape('123','prevNocturno'),shape('789','prevNocturno')]}
} as unknown as LaloView,geo);
assert.deepEqual(noNew.top.map(x=>x.family),['123','321','555']);
console.log('OK: INFO semana D-7, Montevideo, cabezas físicas y nueva selección VT3 aislada');
