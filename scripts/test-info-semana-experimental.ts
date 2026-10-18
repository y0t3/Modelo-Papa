import assert from 'node:assert/strict';
import {diaVacio} from '../src/domain';
import {buildInfoWeek} from '../src/infoWeek';
import {buildTurnHistory} from '../src/infoTurnHistory';
import {buildSheet} from '../src/sheet';
import {buildVt3Trial} from '../src/vt3Trial';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo} from '../src/motorLalo';
import {buildVt3Shadow} from '../src/vt3Shadow';
import {readFileSync} from 'node:fs';
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
 '2026-10-09','2026-10-10','2026-10-12',
 '2026-10-13','2026-10-14','2026-10-15'],
 'Solo jornadas con sorteos reales, ordenadas desde la semana anterior hasta ayer');
assert.equal(week.find(x=>x.date==='2026-10-13')?.sheet.columns[0].values[5],'15',
 'La Nocturna válida de Montevideo no debe borrarse al construir +11');
const gallery=buildTurnHistory('2026-10-16','Previa',null,null,week);
assert.equal(gallery.frames.length,6);
assert.equal(gallery.frames[0]?.title,'Hace una semana');
assert.equal(gallery.frames.at(-1)?.title,'Última jornada');
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
assert.deepEqual(selection.top.map(x=>x.family),['123','321','456','555','666']);
assert.equal(selection.top[2].origin,'nueva');
assert.equal(new Set(selection.top.map(x=>x.family)).size,selection.top.length);
const noNew=buildVt3Trial({
 ranks:{vt3:[shape('123','prevNocturno'),shape('789','prevNocturno')]}
} as unknown as LaloView,geo);
assert.deepEqual(noNew.top.map(x=>x.family),['123','321','555','666']);
const ten=Array.from({length:10},(_,i)=>({family:String(i+100)}));
const fullTrial=buildVt3Trial(official,{top:ten} as unknown as ShadowSelection);
assert.equal(fullTrial.top.length,10);
assert.deepEqual(fullTrial.top.slice(0,3).map(x=>x.family),['100','101','456']);
assert.deepEqual(fullTrial.top.slice(3).map(x=>x.family),['102','103','104','105','106','107','108']);
assert.equal(new Set(fullTrial.top.map(x=>x.family)).size,10);
// La presencia de las cabezas POST de un turno no debe cambiar su lectura PRE.
const pre=diaVacio();pre.Previa.Ciudad='0100';pre.Primera.Provincia='0200';
const actual=diaVacio();actual.Previa.Ciudad='0100';actual.Primera.Provincia='0200';
actual.Matutino.Ciudad='8512';actual.Nocturno.Provincia='0999';
const base=diaVacio();base.Nocturno.Ciudad='1234';base.Nocturno.Provincia='2378';
const before=preSheetAtCut(buildSheet(pre,base),'Matutino',2);
const after=preSheetAtCut(buildSheet(actual,base),'Matutino',2);
assert.deepEqual(before,after,'Una reconstrucción PRE debe ocultar el sorteo objetivo y posteriores');
const va=buildMotorLalo(before,'2026-10-16','Matutino',[]);
const vb=buildMotorLalo(after,'2026-10-16','Matutino',[]);
assert.deepEqual(va,vb);
const ga=buildVt3Shadow(before,'2026-10-16','Matutino',[],va);
const gb=buildVt3Shadow(after,'2026-10-16','Matutino',[],vb);
assert.deepEqual(buildVt3Trial(va,ga),buildVt3Trial(vb,gb));
const ui=readFileSync('src/ui/Vt3Parallel.tsx','utf8');
assert.ok(ui.includes("const newProposal=snapshotTrial||trial?.top.map(x=>x.family)||[]"));
assert.ok(ui.includes('RECONSTRUCCIÓN HISTÓRICA'));
assert.ok(ui.includes("([3,5,10] as const)"));
assert.ok(!ui.includes('(published?[]:previewTrial)'),'No esconder una reconstrucción histórica por ausencia de PRE');
console.log('OK: INFO D-7, VT3 Top3/5/10 e histórico PRE sin fuga POST');
